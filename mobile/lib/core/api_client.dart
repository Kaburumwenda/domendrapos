/// Dio-based API client with JWT auth interceptor and token refresh.
///
/// Mirrors the web app's `useApi()` composable:
///   - Adds `Authorization: Bearer {token}` header
///   - On 401, tries to refresh the token and retries the request
///   - If refresh fails, clears auth and redirects to login
library;

import 'package:dio/dio.dart';
import 'package:flutter/foundation.dart';
import 'api_config.dart';

class ApiClient {
  late final Dio dio;
  final String Function()? getAccessToken;
  final String Function()? getRefreshToken;
  final void Function(String access, String refresh)? onTokenRefreshed;
  final void Function()? onAuthFailed;

  ApiClient({
    this.getAccessToken,
    this.getRefreshToken,
    this.onTokenRefreshed,
    this.onAuthFailed,
  }) {
    dio = Dio(BaseOptions(
      baseUrl: ApiConfig.apiBase,
      connectTimeout: const Duration(seconds: 15),
      receiveTimeout: const Duration(seconds: 30),
      sendTimeout: const Duration(seconds: 30),
      headers: {'Content-Type': 'application/json'},
    ));

    dio.interceptors.add(_AuthInterceptor(this));
    if (kDebugMode) {
      dio.interceptors.add(LogInterceptor(
        requestBody: true,
        responseBody: true,
        error: true,
        logPrint: (o) => debugPrint('API: $o'),
      ));
    }
  }

  /// Convenience methods ──────────────────────────────────────────
  Future<Response<T>> get<T>(String path, {Map<String, dynamic>? query, Options? options}) =>
      dio.get<T>(path, queryParameters: query, options: options);

  Future<Response<T>> post<T>(String path, {dynamic data, Options? options}) =>
      dio.post<T>(path, data: data, options: options);

  Future<Response<T>> patch<T>(String path, {dynamic data, Options? options}) =>
      dio.patch<T>(path, data: data, options: options);

  Future<Response<T>> delete<T>(String path, {Options? options}) =>
      dio.delete<T>(path, options: options);
}

class _AuthInterceptor extends Interceptor {
  final ApiClient client;
  _AuthInterceptor(this.client);

  @override
  void onRequest(RequestOptions options, RequestInterceptorHandler handler) {
    final token = client.getAccessToken?.call();
    if (token != null && token.isNotEmpty) {
      options.headers['Authorization'] = 'Bearer $token';
    }
    handler.next(options);
  }

  @override
  void onError(DioException err, ErrorInterceptorHandler handler) async {
    final statusCode = err.response?.statusCode;
    final isAuthEndpoint = err.requestOptions.path.contains('/auth/');

    // Only try refresh on 401 from non-auth endpoints
    if (statusCode == 401 && !isAuthEndpoint) {
      final refreshToken = client.getRefreshToken?.call();
      if (refreshToken == null || refreshToken.isEmpty) {
        client.onAuthFailed?.call();
        return handler.next(err);
      }

      try {
        // Create a fresh Dio to avoid interceptor recursion
        final refreshDio = Dio(BaseOptions(baseUrl: ApiConfig.apiBase));
        final refreshRes = await refreshDio.post(
          '/auth/refresh/',
          data: {'refresh': refreshToken},
        );

        final newAccess = refreshRes.data['access'] as String;
        final newRefresh = refreshRes.data['refresh'] as String? ?? refreshToken;

        client.onTokenRefreshed?.call(newAccess, newRefresh);

        // Retry original request with new token
        final opts = err.requestOptions.copyWith(headers: {
          ...err.requestOptions.headers,
          'Authorization': 'Bearer $newAccess',
        });

        final retryRes = await client.dio.fetch<dynamic>(opts);
        return handler.resolve(retryRes);
      } catch (e) {
        client.onAuthFailed?.call();
        return handler.next(err);
      }
    }

    handler.next(err);
  }
}
