/// API configuration and base URLs.
///
/// For development, the app connects to the Django backend on localhost.
/// On a physical device, replace [baseUrl] with your machine's LAN IP
/// (e.g. `http://192.168.1.100:8000`).
class ApiConfig {
  /// Android emulator uses 10.0.2.2 to reach the host machine's localhost.
  static const String baseUrl = String.fromEnvironment(
    'API_BASE_URL',
    defaultValue: 'http://10.0.2.2:8000', // Android emulator → host localhost
  );

  static const String apiBase = '$baseUrl/api';

  // ── Storage keys ──────────────────────────────────────────────
  static const String kAccess = 'access_token';
  static const String kRefresh = 'refresh_token';
  static const String kUser = 'user';
  static const String kTenant = 'tenant';
  static const String kBilling = 'billing';
  static const String kLoginTime = 'login_time';
}
