/// Auth state provider using Riverpod.
/// Manages JWT tokens (secure storage), user, tenant, and billing status.
/// Also handles biometric unlock.
library;

import 'dart:convert';

import 'package:dio/dio.dart';
import 'package:flutter/foundation.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:local_auth/local_auth.dart';

import '../core/api_client.dart';
import '../core/api_config.dart';
import '../core/formatters.dart';
import '../models/index.dart';

// ── Secure storage ─────────────────────────────────────────────────
final _secureStorage = const FlutterSecureStorage(
  aOptions: AndroidOptions(encryptedSharedPreferences: true),
);

// ── Access token provider ──────────────────────────────────────────
final accessTokenProvider = StateProvider<String?>((ref) => null);
final refreshTokenProvider = StateProvider<String?>((ref) => null);

// ── API client provider ────────────────────────────────────────────
final apiClientProvider = Provider<ApiClient>((ref) {
  return ApiClient(
    getAccessToken: () => ref.read(accessTokenProvider) ?? '',
    getRefreshToken: () => ref.read(refreshTokenProvider) ?? '',
    onTokenRefreshed: (access, refresh) {
      ref.read(accessTokenProvider.notifier).state = access;
      ref.read(refreshTokenProvider.notifier).state = refresh;
      _secureStorage.write(key: ApiConfig.kAccess, value: access);
      _secureStorage.write(key: ApiConfig.kRefresh, value: refresh);
    },
    onAuthFailed: () {
      ref.read(authProvider.notifier).clearAuth();
    },
  );
});

// ── Auth state ─────────────────────────────────────────────────────
enum AuthStatus { initial, authenticated, unauthenticated, locked }

class AuthState {
  final AuthStatus status;
  final User? user;
  final TenantInfo? tenant;
  final BillingStatus? billing;
  final bool isLoading;
  final String? error;
  final bool biometricAvailable;

  const AuthState({
    this.status = AuthStatus.initial,
    this.user,
    this.tenant,
    this.billing,
    this.isLoading = false,
    this.error,
    this.biometricAvailable = false,
  });

  AuthState copyWith({
    AuthStatus? status,
    User? user,
    TenantInfo? tenant,
    BillingStatus? billing,
    bool? isLoading,
    String? error,
    bool? biometricAvailable,
  }) =>
      AuthState(
        status: status ?? this.status,
        user: user ?? this.user,
        tenant: tenant ?? this.tenant,
        billing: billing ?? this.billing,
        isLoading: isLoading ?? this.isLoading,
        error: error,
        biometricAvailable: biometricAvailable ?? this.biometricAvailable,
      );
}

class AuthNotifier extends StateNotifier<AuthState> {
  final Ref _ref;
  final LocalAuthentication _localAuth = LocalAuthentication();

  AuthNotifier(this._ref) : super(const AuthState());

  // ── Init / restore session ──────────────────────────────────────
  Future<void> init() async {
    state = const AuthState(isLoading: true);
    try {
      final access = await _secureStorage.read(key: ApiConfig.kAccess);
      final refresh = await _secureStorage.read(key: ApiConfig.kRefresh);
      final userJson = await _secureStorage.read(key: ApiConfig.kUser);
      final tenantJson = await _secureStorage.read(key: ApiConfig.kTenant);
      final billingJson = await _secureStorage.read(key: ApiConfig.kBilling);

      // Check biometric availability
      bool biometric = false;
      try {
        biometric = await _localAuth.canCheckBiometrics;
      } catch (_) {}

      if (access != null && userJson != null) {
        _ref.read(accessTokenProvider.notifier).state = access;
        _ref.read(refreshTokenProvider.notifier).state = refresh;

        final user = User.fromJson(_decode(userJson));
        final tenant = tenantJson != null ? TenantInfo.fromJson(_decode(tenantJson)) : null;
        final billing = billingJson != null ? BillingStatus.fromJson(_decode(billingJson)) : null;

        state = AuthState(
          status: (billing?.locked ?? false) ? AuthStatus.locked : AuthStatus.authenticated,
          user: user,
          tenant: tenant,
          billing: billing,
          biometricAvailable: biometric,
        );
      } else {
        state = AuthState(status: AuthStatus.unauthenticated, biometricAvailable: biometric);
      }
    } catch (e) {
      state = AuthState(status: AuthStatus.unauthenticated, error: e.toString());
    }
  }

  // ── Login ──────────────────────────────────────────────────────
  Future<bool> login(String email, String password) async {
    state = state.copyWith(isLoading: true, error: null);
    try {
      final api = _ref.read(apiClientProvider);
      final res = await api.post('/auth/login/', data: {
        'email': email,
        'password': password,
      });

      final login = LoginResponse.fromJson(res.data as Map<String, dynamic>);

      // Persist to secure storage
      await _secureStorage.write(key: ApiConfig.kAccess, value: login.access);
      await _secureStorage.write(key: ApiConfig.kRefresh, value: login.refresh);
      await _secureStorage.write(key: ApiConfig.kUser, value: _encode(login.user.toJson()));
      await _secureStorage.write(key: ApiConfig.kTenant, value: _encode(login.tenant.toJson()));
      if (login.billing != null) {
        await _secureStorage.write(key: ApiConfig.kBilling, value: _encode(login.billing!.toJson()));
      }
      await _secureStorage.write(key: ApiConfig.kLoginTime, value: DateTime.now().toIso8601String());

      // Set in-memory tokens
      _ref.read(accessTokenProvider.notifier).state = login.access;
      _ref.read(refreshTokenProvider.notifier).state = login.refresh;

      state = AuthState(
        status: login.billing?.locked == true ? AuthStatus.locked : AuthStatus.authenticated,
        user: login.user,
        tenant: login.tenant,
        billing: login.billing,
        biometricAvailable: state.biometricAvailable,
      );
      return true;
    } on DioException catch (e) {
      final msg = e.response?.data?['detail']?.toString() ?? 'Invalid credentials. Please try again.';
      state = state.copyWith(isLoading: false, error: msg);
      return false;
    } catch (e) {
      state = state.copyWith(isLoading: false, error: e.toString());
      return false;
    }
  }

  // ── Biometric unlock ───────────────────────────────────────────
  Future<bool> biometricUnlock() async {
    try {
      final didAuth = await _localAuth.authenticate(
        localizedReason: 'Authenticate to access DomendraPOS',
        options: const AuthenticationOptions(biometricOnly: false),
      );
      return didAuth;
    } catch (_) {
      return false;
    }
  }

  // ── Refresh billing/me ─────────────────────────────────────────
  Future<void> refreshMe() async {
    try {
      final api = _ref.read(apiClientProvider);
      final res = await api.get('/users/staff/me/');
      final data = res.data as Map<String, dynamic>;

      if (data['billing'] != null) {
        final billing = BillingStatus.fromJson(data['billing'] as Map<String, dynamic>);
        await _secureStorage.write(key: ApiConfig.kBilling, value: _encode(billing.toJson()));
        state = state.copyWith(
          billing: billing,
          status: billing.locked ? AuthStatus.locked : AuthStatus.authenticated,
        );
      }
    } catch (_) {}
  }

  // ── Logout ─────────────────────────────────────────────────────
  Future<void> logout() async {
    await clearAuth();
  }

  Future<void> clearAuth() async {
    await _secureStorage.deleteAll();
    _ref.read(accessTokenProvider.notifier).state = null;
    _ref.read(refreshTokenProvider.notifier).state = null;
    state = AuthState(status: AuthStatus.unauthenticated, biometricAvailable: state.biometricAvailable);
  }

  // ── Helpers ────────────────────────────────────────────────────
  Map<String, dynamic> _decode(String json) =>
      _jsonDecoder.convert(json) as Map<String, dynamic>;
  String _encode(Map<String, dynamic> json) => _jsonEncoder.convert(json);
}

final _jsonDecoder = const JsonDecoder();
final _jsonEncoder = const JsonEncoder();

// ── Provider ──────────────────────────────────────────────────────
final authProvider = StateNotifierProvider<AuthNotifier, AuthState>((ref) {
  return AuthNotifier(ref);
});
