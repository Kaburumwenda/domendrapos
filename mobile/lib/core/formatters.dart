/// Formatting utilities mirroring the web app's `useFormat()` composable.
library;

import 'package:intl/intl.dart';

class Formatters {
  /// Currency formatting with tenant symbol.
  /// e.g. `currency(1234.5, 'KSh')` → `KSh1,234.50`
  static String currency(dynamic value, [String symbol = 'KSh']) {
    final v = double.tryParse(value?.toString() ?? '0') ?? 0;
    final fmt = NumberFormat.currency(symbol: symbol, decimalDigits: 2);
    return fmt.format(v);
  }

  /// Short date format: `16 Aug 2026`
  static String date(dynamic value) {
    if (value == null) return '';
    final dt = value is DateTime ? value : DateTime.tryParse(value.toString());
    if (dt == null) return '';
    return DateFormat('d MMM yyyy').format(dt);
  }

  /// Date + time format: `16 Aug 2026, 14:30`
  static String dateTime(dynamic value) {
    if (value == null) return '';
    final dt = value is DateTime ? value : DateTime.tryParse(value.toString());
    if (dt == null) return '';
    return DateFormat('d MMM yyyy, HH:mm').format(dt);
  }

  /// Time only: `14:30`
  static String time(dynamic value) {
    if (value == null) return '';
    final dt = value is DateTime ? value : DateTime.tryParse(value.toString());
    if (dt == null) return '';
    return DateFormat('HH:mm').format(dt);
  }

  /// Number with thousands separators: `1,234`
  static String number(dynamic value) {
    final v = num.tryParse(value?.toString() ?? '0') ?? 0;
    return NumberFormat.decimalPattern().format(v);
  }

  /// Compact number: `20K`, `1.2M`, `3.4B`
  static String compact(dynamic value) {
    final v = num.tryParse(value?.toString() ?? '0') ?? 0;
    if (v == 0) return '0';
    final abs = v.abs();
    if (abs >= 1e9) return '${(v / 1e9).toStringAsFixed(1)}B';
    if (abs >= 1e6) return '${(v / 1e6).toStringAsFixed(1)}M';
    if (abs >= 1e3) return '${(v / 1e3).round()}K';
    return v.toInt().toString();
  }

  /// Percentage: `52.0%`
  static String percent(dynamic value, [int decimals = 1]) {
    final v = double.tryParse(value?.toString() ?? '0') ?? 0;
    return '${v.toStringAsFixed(decimals)}%';
  }

  /// Parse a string to double safely
  static double toDouble(dynamic value) {
    if (value is double) return value;
    if (value is int) return value.toDouble();
    return double.tryParse(value?.toString() ?? '0') ?? 0;
  }

  /// Truncate long text with ellipsis
  static String truncate(String text, int max) {
    if (text.length <= max) return text;
    return '${text.substring(0, max)}...';
  }
}
