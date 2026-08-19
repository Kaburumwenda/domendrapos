/// Dashboard screen — full parity with the web app's `/dashboard` page.
///
/// Features:
/// - 6 KPI cards (Revenue + sparkline/trend, Transactions, AOV, Stock Value, Gross Margin, Inventory Turnover)
/// - Revenue Trend area chart (Revenue / Cost / Profit)
/// - Payment Methods donut chart
/// - Top 10 Products horizontal bar chart
/// - Sales by Category donut chart
/// - Sales Activity heatmap (last 6 months)
/// - Low Stock Alerts list
/// - Recent Transactions list
/// - Period filter (Today, 7D, 30D, Month, YTD, All, Custom)
/// - CSV export

import 'dart:math' as math;
import 'dart:ui';
import 'package:dio/dio.dart';
import 'package:fl_chart/fl_chart.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../core/formatters.dart';
import '../../providers/auth_provider.dart';
import '../../providers/data_providers.dart';
import '../../providers/ui_provider.dart';
import '../../widgets/common.dart';

// ── Dashboard Data Provider ───────────────────────────────────────

final dashboardDataProvider = FutureProvider<DashboardData>((ref) async {
  final api = ref.watch(apiClientProvider);

  final results = await Future.wait([
    api.get('/pos/transactions/', query: {'page_size': 2000}),
    api
        .get('/products/', query: {'page_size': 500})
        .catchError((_) => Response(requestOptions: RequestOptions(path: ''))),
    api
        .get('/reports/low-stock/')
        .catchError((_) => Response(requestOptions: RequestOptions(path: ''))),
  ]);

  final txData = results[0]?.data;
  List<Map<String, dynamic>> transactions = [];
  if (txData is List) {
    transactions = List<Map<String, dynamic>>.from(txData);
  } else if (txData is Map<String, dynamic>) {
    transactions = List<Map<String, dynamic>>.from(
      txData['results'] as List? ?? [],
    );
  }

  final prodData = results[1]?.data;
  List<Map<String, dynamic>> products = [];
  if (prodData is List) {
    products = List<Map<String, dynamic>>.from(prodData);
  } else if (prodData is Map<String, dynamic>) {
    products = List<Map<String, dynamic>>.from(
      prodData['results'] as List? ?? [],
    );
  }

  final lowStockData = results[2]?.data;
  List<dynamic> lowStock = [];
  if (lowStockData is List) {
    lowStock = lowStockData;
  } else if (lowStockData is Map<String, dynamic>) {
    lowStock = lowStockData['results'] as List? ?? [];
  }

  return DashboardData(
    transactions: transactions,
    products: products,
    lowStockItems: lowStock,
  );
});

class DashboardData {
  final List<Map<String, dynamic>> transactions;
  final List<Map<String, dynamic>> products;
  final List<dynamic> lowStockItems;

  DashboardData({
    required this.transactions,
    required this.products,
    required this.lowStockItems,
  });
}

// ── Gradient App Bar ─────────────────────────────────────────────

class _GradientAppBar extends StatelessWidget {
  final AuthState auth;
  final String currency;
  final String greeting;
  final bool expanded;
  final double todayRevenue;
  final int todayTxCount;
  final double maxHeight;
  final ValueChanged<Period> onPeriodChanged;
  final VoidCallback onRefresh;
  final VoidCallback onExport;
  final VoidCallback onProfile;
  final VoidCallback onLogout;
  final VoidCallback onMenuTap;
  final Period currentPeriod;
  final AnimationController clockController;

  const _GradientAppBar({
    required this.auth,
    required this.currency,
    required this.greeting,
    required this.expanded,
    required this.todayRevenue,
    required this.todayTxCount,
    required this.maxHeight,
    required this.onPeriodChanged,
    required this.onRefresh,
    required this.onExport,
    required this.onProfile,
    required this.onLogout,
    required this.onMenuTap,
    required this.currentPeriod,
    required this.clockController,
  });

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    // Gradient colors — soft whitish gradient
    final gradientStart = isDark
        ? const Color(0xFF101820)
        : const Color(0xFFFCFDFE);
    final gradientMid = isDark
        ? const Color(0xFF1A2433)
        : const Color(0xFFF6F9FE);
    final gradientEnd = isDark
        ? const Color(0xFF243345)
        : const Color(0xFFEEF4FD);

    return DecoratedBox(
      decoration: const BoxDecoration(
        borderRadius: BorderRadius.only(
          bottomLeft: Radius.circular(28),
          bottomRight: Radius.circular(28),
        ),
        boxShadow: [
          BoxShadow(
            color: Color(0x1A000000),
            blurRadius: 14,
            spreadRadius: 0,
            offset: Offset(0, 8),
          ),
        ],
      ),
      child: ClipRRect(
        borderRadius: const BorderRadius.only(
          bottomLeft: Radius.circular(28),
          bottomRight: Radius.circular(28),
        ),
        child: Container(
          decoration: BoxDecoration(
            gradient: LinearGradient(
              begin: Alignment.topLeft,
              end: Alignment.bottomRight,
              colors: [gradientStart, gradientMid, gradientEnd],
              stops: const [0.0, 0.55, 1.0],
            ),
          ),
          child: SafeArea(
            bottom: false,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                _buildTopRow(context, isDark),
                if (expanded)
                  Expanded(
                    child: ClipRect(
                      child: OverflowBox(
                        alignment: Alignment.topCenter,
                        minHeight: 0,
                        maxHeight: double.infinity,
                        child: _buildExpandedContent(context, isDark),
                      ),
                    ),
                  ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  // ── Top Row: drawer, clock, actions ──────────────
  Widget _buildTopRow(BuildContext context, bool isDark) {
    return Padding(
      padding: const EdgeInsets.fromLTRB(10, 6, 10, 0),
      child: Row(
        children: [
          // Drawer / sidebar trigger
          _GlassIconButton(
            icon: Icons.menu_rounded,
            tooltip: 'Menu',
            onPressed: onMenuTap,
          ),
          const SizedBox(width: 6),
          // Clock
          _ClockDisplay(controller: clockController),
          const Spacer(),
          // Period selector
          PopupMenuButton<Period>(
            icon: Icon(
              Icons.calendar_today_outlined,
              color: _content(isDark, 0.7),
              size: 20,
            ),
            tooltip: 'Select period',
            color: isDark ? const Color(0xFF1A2438) : Colors.white,
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(16),
            ),
            onSelected: onPeriodChanged,
            itemBuilder: (_) => Period.values
                .map(
                  (p) => PopupMenuItem(
                    value: p,
                    child: Row(
                      children: [
                        if (currentPeriod == p)
                          Icon(
                            Icons.check_rounded,
                            size: 18,
                            color: schemePrimary(isDark),
                          )
                        else
                          const SizedBox(width: 18),
                        const SizedBox(width: 8),
                        Text(
                          p.short,
                          style: TextStyle(
                            color: currentPeriod == p
                                ? schemePrimary(isDark)
                                : (isDark ? Colors.white70 : Colors.black87),
                            fontWeight: currentPeriod == p
                                ? FontWeight.bold
                                : FontWeight.normal,
                          ),
                        ),
                      ],
                    ),
                  ),
                )
                .toList(),
          ),
          _GlassIconButton(
            icon: Icons.refresh_rounded,
            tooltip: 'Refresh',
            onPressed: onRefresh,
          ),
          // CSV export
          _GlassIconButton(
            icon: Icons.download_rounded,
            tooltip: 'Export CSV',
            onPressed: onExport,
          ),
          // User avatar menu
          _UserAvatarMenu(auth: auth, onProfile: onProfile, onLogout: onLogout),
        ],
      ),
    );
  }

  Color schemePrimary(bool isDark) =>
      isDark ? const Color(0xFF6CB0FF) : const Color(0xFF0E5DBA);

  /// Foreground text/icon color — white on dark, dark-blue-grey on light.
  static Color _content(bool isDark, [double opacity = 1.0]) =>
      isDark ? Colors.white.withOpacity(opacity) :
          const Color(0xFF1B2733).withOpacity(opacity);

  /// Glass fill — translucent white on dark, translucent black on light.
  static Color _glassFill(bool isDark) =>
      isDark ? Colors.white.withOpacity(0.12) : Colors.black.withOpacity(0.05);

  /// Glass border.
  static Color _glassBorder(bool isDark) =>
      isDark ? Colors.white.withOpacity(0.15) : Colors.black.withOpacity(0.08);

  // ── Expanded content: greeting, title, date chip, stats card ────
  Widget _buildExpandedContent(BuildContext context, bool isDark) {
    final now = DateTime.now();
    final dateStr =
        '${_weekdayName(now.weekday)}, ${now.day} ${_monthName(now.month)} ${now.year}';

    return Padding(
      padding: const EdgeInsets.fromLTRB(22, 0, 22, 12),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Title row with date chip
          Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'Dashboard',
                    style: TextStyle(
                      fontSize: 18,
                      fontWeight: FontWeight.w800,
                      color: _content(isDark),
                      letterSpacing: -0.4,
                      height: 1.1,
                    ),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    greeting,
                    style: TextStyle(
                      fontSize: 13,
                      fontWeight: FontWeight.w500,
                      color: _content(isDark, 0.7),
                    ),
                  ),
                ],
              ),
              const Spacer(),
              // Date chip
              Container(
                padding: const EdgeInsets.symmetric(
                  horizontal: 10,
                  vertical: 5,
                ),
                decoration: BoxDecoration(
                  color: _glassFill(isDark),
                  borderRadius: BorderRadius.circular(20),
                  border: Border.all(
                    color: _glassBorder(isDark),
                    width: 0.5,
                  ),
                ),
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Icon(
                      Icons.event_available_rounded,
                      size: 12,
                      color: _content(isDark, 0.65),
                    ),
                    const SizedBox(width: 5),
                    Text(
                      dateStr,
                      style: TextStyle(
                        fontSize: 10,
                        fontWeight: FontWeight.w600,
                        color: _content(isDark, 0.8),
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),
          // Today's stats glass card
          _TodayStatsCard(
            todayRevenue: todayRevenue,
            todayTxCount: todayTxCount,
            currency: currency,
            isDark: isDark,
          ),
        ],
      ),
    );
  }

  String _weekdayName(int i) => const [
    'Mon',
    'Tue',
    'Wed',
    'Thu',
    'Fri',
    'Sat',
    'Sun',
  ][(i - 1).clamp(0, 6)];

  String _monthName(int i) => const [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
  ][(i - 1).clamp(0, 11)];
}

// ── Glass Icon Button ────────────────────────────────────────────

class _GlassIconButton extends StatelessWidget {
  final IconData icon;
  final String tooltip;
  final VoidCallback onPressed;

  const _GlassIconButton({
    required this.icon,
    required this.tooltip,
    required this.onPressed,
  });

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 3),
      child: Material(
        color: _GradientAppBar._glassFill(isDark),
        borderRadius: BorderRadius.circular(12),
        child: InkWell(
          onTap: onPressed,
          borderRadius: BorderRadius.circular(12),
          child: Padding(
            padding: const EdgeInsets.all(9),
            child: Icon(
              icon,
              size: 19,
              color: _GradientAppBar._content(isDark, 0.85),
            ),
          ),
        ),
      ),
    );
  }
}

// ── Clock Display ────────────────────────────────────────────────

class _ClockDisplay extends StatelessWidget {
  final AnimationController controller;

  const _ClockDisplay({required this.controller});

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    return AnimatedBuilder(
      animation: controller,
      builder: (context, _) {
        final t = DateTime.now();
        final hh = t.hour.toString().padLeft(2, '0');
        final mm = t.minute.toString().padLeft(2, '0');
        final ss = t.second.toString().padLeft(2, '0');
        final colon = (controller.value > 0.5) ? ':' : ' ';
        return Container(
          padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
          decoration: BoxDecoration(
            color: _GradientAppBar._glassFill(isDark),
            borderRadius: BorderRadius.circular(10),
            border: Border.all(
              color: _GradientAppBar._glassBorder(isDark),
              width: 0.5,
            ),
          ),
          child: Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              Icon(
                Icons.schedule,
                size: 14,
                color: _GradientAppBar._content(isDark, 0.55),
              ),
              const SizedBox(width: 6),
              Text(
                '$hh$colon$mm$colon$ss',
                style: TextStyle(
                  fontSize: 12,
                  fontWeight: FontWeight.w600,
                  fontFeatures: const [FontFeature.tabularFigures()],
                  color: _GradientAppBar._content(isDark, 0.85),
                ),
              ),
            ],
          ),
        );
      },
    );
  }
}

// ── User Avatar Menu ─────────────────────────────────────────────

class _UserAvatarMenu extends StatelessWidget {
  final AuthState auth;
  final VoidCallback onProfile;
  final VoidCallback onLogout;

  const _UserAvatarMenu({
    required this.auth,
    required this.onProfile,
    required this.onLogout,
  });

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    return PopupMenuButton<String>(
      offset: const Offset(0, 48),
      color: isDark ? const Color(0xFF1A2438) : Colors.white,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
      elevation: 8,
      child: Container(
        padding: const EdgeInsets.all(3),
        decoration: BoxDecoration(
          shape: BoxShape.circle,
          gradient: LinearGradient(
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
            colors: isDark
                ? [
                    Colors.white.withOpacity(0.25),
                    Colors.white.withOpacity(0.05),
                  ]
                : [
                    Colors.black.withOpacity(0.06),
                    Colors.black.withOpacity(0.02),
                  ],
          ),
          border: Border.all(
            color: _GradientAppBar._glassBorder(isDark),
            width: 0.5,
          ),
        ),
        child: CircleAvatar(
          radius: 16,
          backgroundColor: isDark
              ? Colors.white.withOpacity(0.15)
              : Colors.black.withOpacity(0.04),
          child: Text(
            auth.user?.initials ?? '?',
            style: TextStyle(
              fontSize: 12,
              fontWeight: FontWeight.w700,
              color: _GradientAppBar._content(isDark),
            ),
          ),
        ),
      ),
      itemBuilder: (_) => [
        PopupMenuItem(
          enabled: false,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                auth.user?.fullName ?? 'User',
                style: TextStyle(
                  fontWeight: FontWeight.w700,
                  fontSize: 14,
                  color: isDark ? Colors.white : Colors.black87,
                ),
              ),
              const SizedBox(height: 2),
              Text(
                auth.user?.email ?? '',
                style: TextStyle(
                  fontSize: 12,
                  color: isDark ? Colors.white60 : Colors.black54,
                ),
              ),
            ],
          ),
        ),
        const PopupMenuDivider(),
        PopupMenuItem(
          value: 'profile',
          child: Row(
            children: [
              Icon(
                Icons.person_outline_rounded,
                size: 20,
                color: isDark ? Colors.white70 : Colors.black54,
              ),
              const SizedBox(width: 10),
              Text(
                'Profile Settings',
                style: TextStyle(color: isDark ? Colors.white : Colors.black87),
              ),
            ],
          ),
        ),
        PopupMenuItem(
          value: 'logout',
          child: Row(
            children: [
              Icon(Icons.logout_rounded, size: 20, color: Colors.red.shade300),
              const SizedBox(width: 10),
              Text('Sign out', style: TextStyle(color: Colors.red.shade300)),
            ],
          ),
        ),
      ],
      onSelected: (v) {
        if (v == 'profile') {
          onProfile();
        } else if (v == 'logout') {
          onLogout();
        }
      },
    );
  }
}

// ── Today's Stats Glass Card ─────────────────────────────────────

class _TodayStatsCard extends StatelessWidget {
  final double todayRevenue;
  final int todayTxCount;
  final String currency;
  final bool isDark;

  const _TodayStatsCard({
    required this.todayRevenue,
    required this.todayTxCount,
    required this.currency,
    required this.isDark,
  });

  @override
  Widget build(BuildContext context) {
    final isCompact = todayRevenue == 0 && todayTxCount == 0;
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        // Row 1: LIVE badge + Today title
        Row(
          children: [
            _LiveBadge(isActive: todayTxCount > 0),
            const SizedBox(width: 8),
            Text(
              'Today',
              style: TextStyle(
                fontSize: 13,
                fontWeight: FontWeight.w700,
                color: _GradientAppBar._content(isDark, 0.7),
              ),
            ),
          ],
        ),
        const SizedBox(height: 8),
        // Row 2: Total Revenue value + Transactions stat
        Row(
          crossAxisAlignment: CrossAxisAlignment.center,
          children: [
            // Total Revenue label + value
            Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              mainAxisSize: MainAxisSize.min,
              children: [
                Text(
                  'Total Revenue',
                  style: TextStyle(
                    fontSize: 10,
                    fontWeight: FontWeight.w600,
                    letterSpacing: 0.4,
                    color: _GradientAppBar._content(isDark, 0.5),
                  ),
                ),
                const SizedBox(height: 2),
                Row(
                  crossAxisAlignment: CrossAxisAlignment.baseline,
                  textBaseline: TextBaseline.alphabetic,
                  children: [
                    Text(
                      currency,
                      style: TextStyle(
                        fontSize: 8,
                        fontWeight: FontWeight.w700,
                        color: _GradientAppBar._content(isDark, 0.55),
                      ),
                    ),
                    const SizedBox(width: 2),
                    Text(
                      isCompact
                          ? '—'
                          : Formatters.number(todayRevenue.toInt()),
                      style: TextStyle(
                        fontSize: 13,
                        fontWeight: FontWeight.w800,
                        color: _GradientAppBar._content(isDark),
                        fontFeatures: const [FontFeature.tabularFigures()],
                        letterSpacing: -0.4,
                        height: 1.05,
                      ),
                    ),
                  ],
                ),
              ],
            ),
            const Spacer(),
            // Transactions stat
            _StatChip(
              label: 'Transactions',
              value: isCompact ? '—' : todayTxCount.toString(),
              icon: Icons.receipt_long_rounded,
              accent: const Color(0xFF5B8DEF),
              isDark: isDark,
            ),
          ],
        ),
      ],
    );
  }
}

// ── LIVE Badge with pulse ────────────────────────────────────────

class _LiveBadge extends StatefulWidget {
  final bool isActive;

  const _LiveBadge({required this.isActive});

  @override
  State<_LiveBadge> createState() => _LiveBadgeState();
}

class _LiveBadgeState extends State<_LiveBadge>
    with SingleTickerProviderStateMixin {
  late AnimationController _pulseController;

  @override
  void initState() {
    super.initState();
    _pulseController = AnimationController(
      duration: const Duration(milliseconds: 1200),
      vsync: this,
    );
    if (widget.isActive) _pulseController.repeat();
  }

  @override
  void didUpdateWidget(_LiveBadge oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (widget.isActive && !oldWidget.isActive) {
      _pulseController.repeat();
    } else if (!widget.isActive && oldWidget.isActive) {
      _pulseController.stop();
    }
  }

  @override
  void dispose() {
    _pulseController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final color = widget.isActive
        ? const Color(0xFF4CAF50)
        : (isDark ? Colors.white54 : Colors.black38);
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 9, vertical: 5),
      decoration: BoxDecoration(
        color: color.withOpacity(0.15),
        borderRadius: BorderRadius.circular(8),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          AnimatedBuilder(
            animation: _pulseController,
            builder: (context, _) {
              final scale = widget.isActive
                  ? 0.8 + (_pulseController.value * 0.7)
                  : 1.0;
              final opacity = widget.isActive
                  ? 1.0 - (_pulseController.value * 0.5)
                  : 0.5;
              return Container(
                width: 11,
                height: 11,
                decoration: BoxDecoration(
                  color: color,
                  shape: BoxShape.circle,
                  boxShadow: widget.isActive
                      ? [
                          BoxShadow(
                            color: color.withOpacity(opacity * 0.6),
                            blurRadius: 9 * scale,
                            spreadRadius: 1,
                          ),
                        ]
                      : null,
                ),
              );
            },
          ),
          const SizedBox(width: 6),
          Text(
            widget.isActive ? 'LIVE' : 'IDLE',
            style: TextStyle(
              fontSize: 14,
              fontWeight: FontWeight.w700,
              color: color,
              letterSpacing: 0.5,
            ),
          ),
        ],
      ),
    );
  }
}

// ── Stat Chip ────────────────────────────────────────────────────

class _StatChip extends StatelessWidget {
  final String label;
  final String value;
  final IconData icon;
  final Color accent;
  final bool isDark;

  const _StatChip({
    required this.label,
    required this.value,
    required this.icon,
    required this.accent,
    required this.isDark,
  });

  @override
  Widget build(BuildContext context) {
    return Expanded(
      child: Row(
        children: [
          Container(
            width: 38,
            height: 38,
            decoration: BoxDecoration(
              color: accent.withOpacity(isDark ? 0.22 : 0.14),
              borderRadius: BorderRadius.circular(12),
              border: Border.all(
                color: accent.withOpacity(isDark ? 0.35 : 0.22),
                width: 0.5,
              ),
            ),
            child: Icon(
              icon,
              size: 18,
              color: accent.withOpacity(isDark ? 0.95 : 0.85),
            ),
          ),
          const SizedBox(width: 10),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  label,
                  style: TextStyle(
                    fontSize: 10,
                    color: _GradientAppBar._content(isDark, 0.5),
                    fontWeight: FontWeight.w600,
                    letterSpacing: 0.3,
                  ),
                ),
                const SizedBox(height: 2),
                Text(
                  value,
                  style: TextStyle(
                    fontSize: 15,
                    fontWeight: FontWeight.w700,
                    color: _GradientAppBar._content(isDark),
                    fontFeatures: const [FontFeature.tabularFigures()],
                    letterSpacing: -0.2,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

// ── Period Helpers ─────────────────────────────────────────────────

enum Period { today, d7, d30, thisMonth, ytd, all, custom }

extension PeriodExt on Period {
  String get short => switch (this) {
    Period.today => 'Today',
    Period.d7 => '7D',
    Period.d30 => '30D',
    Period.thisMonth => 'Month',
    Period.ytd => 'YTD',
    Period.all => 'All',
    Period.custom => 'Custom',
  };

  List<DateTime> range(
    DateTime now, {
    DateTime? customFrom,
    DateTime? customTo,
  }) {
    final end = DateTime(now.year, now.month, now.day, 23, 59, 59);
    DateTime start = DateTime(now.year, now.month, now.day, 0, 0, 0);
    switch (this) {
      case Period.today:
        break;
      case Period.d7:
        start = start.subtract(const Duration(days: 7));
        break;
      case Period.d30:
        start = start.subtract(const Duration(days: 30));
        break;
      case Period.thisMonth:
        start = DateTime(now.year, now.month, 1);
        break;
      case Period.ytd:
        start = DateTime(now.year, 1, 1);
        break;
      case Period.all:
        start = DateTime(2000, 1, 1);
        break;
      case Period.custom:
        if (customFrom != null && customTo != null) {
          return [customFrom, customTo];
        }
        break;
    }
    return [start, end];
  }

  int get days => switch (this) {
    Period.today => 1,
    Period.d7 => 7,
    Period.d30 => 30,
    Period.thisMonth => 30,
    Period.ytd => 365,
    Period.all => 365 * 25,
    Period.custom => 30,
  };
}

// ── Screen ────────────────────────────────────────────────────────

class DashboardScreen extends ConsumerStatefulWidget {
  const DashboardScreen({super.key});

  @override
  ConsumerState<DashboardScreen> createState() => _DashboardScreenState();
}

class _DashboardScreenState extends ConsumerState<DashboardScreen>
    with TickerProviderStateMixin {
  Period _period = Period.thisMonth;
  DateTime? _customFrom;
  DateTime? _customTo;
  bool _showDateDialog = false;
  late AnimationController _clockController;
  bool _clockColon = true;

  @override
  void initState() {
    super.initState();
    _clockController =
        AnimationController(duration: const Duration(seconds: 1), vsync: this)
          ..addStatusListener((status) {
            if (status == AnimationStatus.completed) {
              _clockController.reverse();
            } else if (status == AnimationStatus.dismissed) {
              _clockController.forward();
            }
          });
    _clockController.forward();
  }

  @override
  void dispose() {
    _clockController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final auth = ref.watch(authProvider);
    final currency = auth.tenant?.currencySymbol ?? 'KSh';
    final dataAsync = ref.watch(dashboardDataProvider);

    final isDark = Theme.of(context).brightness == Brightness.dark;
    final firstName = auth.user?.firstName.trim();
    final greeting =
        firstName == null || firstName.isEmpty
            ? _greeting()
            : '${_greeting()}, $firstName';
    final now = DateTime.now();
    final range = _period.range(
      now,
      customFrom: _customFrom,
      customTo: _customTo,
    );

    // Compute today's stats from loaded data (matches web's fetchTodayStats)
    double todayRevenue = 0;
    int todayTxCount = 0;
    final data = dataAsync.valueOrNull;
    if (data != null) {
      final startOfDay = DateTime(now.year, now.month, now.day).toUtc();
      final todayTxs = data.transactions.where((t) {
        final d = DateTime.tryParse(t['created_at'] ?? '');
        if (d == null) return false;
        return !d.isBefore(startOfDay) &&
            (t['status'] ?? 'completed') == 'completed';
      });
      todayTxCount = todayTxs.length;
      todayRevenue = todayTxs.fold(
        0.0,
        (s, t) => s + Formatters.toDouble(t['total']),
      );
    }

    return Scaffold(
      backgroundColor: Colors.grey.shade100,
      body: CustomScrollView(
        slivers: [
          // ── Gradient Extended App Bar ───────────────────────────
          SliverAppBar(
            expandedHeight: 192,
            pinned: true,
            collapsedHeight: 76,
            backgroundColor: isDark ? const Color(0xFF101820) : const Color(0xFFF7FAFE),
            surfaceTintColor: Colors.transparent,
            elevation: 0,
            flexibleSpace: LayoutBuilder(
              builder: (context, constraints) {
                final expanded = constraints.maxHeight > 150;
                return _GradientAppBar(
                  auth: auth,
                  currency: currency,
                  greeting: greeting,
                  expanded: expanded,
                  todayRevenue: todayRevenue,
                  todayTxCount: todayTxCount,
                  maxHeight: constraints.maxHeight,
                  onPeriodChanged: (p) {
                    if (p == Period.custom) {
                      _showCustomDateDialog(context);
                    } else {
                      setState(() => _period = p);
                    }
                  },
                  onRefresh: () => ref.invalidate(dashboardDataProvider),
                  onExport: () => _exportCSV(
                    context,
                    ref.read(dashboardDataProvider),
                    currency,
                  ),
                  onProfile: () => context.push('/settings/profile'),
                  onLogout: () => ref.read(authProvider.notifier).logout(),
                  onMenuTap: () {
                    final isWide =
                        MediaQuery.of(context).size.width >= 900;
                    if (isWide) {
                      ref.read(sidebarExpandedProvider.notifier).state =
                          !ref.read(sidebarExpandedProvider);
                    } else {
                      ref.read(scaffoldKeyProvider).currentState?.openDrawer();
                    }
                  },
                  currentPeriod: _period,
                  clockController: _clockController,
                );
              },
            ),
            actions: const [SizedBox.shrink()],
          ),
          // ── Body ───────────────────────────────────────────────────
          ...dataAsync.when(
            loading: () => [_buildSkeletonSliver(context)],
            error: (e, _) => [
              SliverFillRemaining(
                hasScrollBody: false,
                child: ErrorStateWidget(
                  message: 'Failed to load dashboard',
                  onRetry: () => ref.invalidate(dashboardDataProvider),
                ),
              ),
            ],
            data: (data) {
              final computed = _DashboardComputed(
                data: data,
                range: range,
                period: _period,
              );
              return [
                SliverPadding(
                  padding: const EdgeInsets.fromLTRB(16, 8, 16, 24),
                  sliver: SliverList(
                    delegate: SliverChildListDelegate([
                      _KpiGrid(computed: computed, currency: currency),
                      const SizedBox(height: 16),
                      _RevenueChartCard(computed: computed, currency: currency),
                      const SizedBox(height: 16),
                      _PaymentDonutCard(computed: computed, currency: currency),
                      const SizedBox(height: 16),
                      _TopProductsCard(computed: computed, currency: currency),
                      const SizedBox(height: 16),
                      _CategoryDonutCard(
                        computed: computed,
                        currency: currency,
                      ),
                      const SizedBox(height: 16),
                      _HeatmapCard(computed: computed, currency: currency),
                      const SizedBox(height: 16),
                      _LowStockCard(computed: computed),
                      const SizedBox(height: 16),
                      _RecentTransactionsCard(
                        computed: computed,
                        currency: currency,
                      ),
                    ]),
                  ),
                ),
              ];
            },
          ),
        ],
      ),
    );
  }

  String _greeting() {
    final h = DateTime.now().hour;
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  }

  Widget _buildSkeletonSliver(BuildContext context) {
    return SliverPadding(
      padding: const EdgeInsets.all(16),
      sliver: SliverList(
        delegate: SliverChildListDelegate(
          List.generate(
            6,
            (i) => Padding(
              padding: const EdgeInsets.only(bottom: 12),
              child: Card(
                child: Container(
                  height: i == 0 ? 120 : 200,
                  padding: const EdgeInsets.all(16),
                  child: const Center(child: CircularProgressIndicator()),
                ),
              ),
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildSkeleton(BuildContext context) {
    return ListView(
      padding: const EdgeInsets.all(16),
      children: List.generate(
        6,
        (i) => Padding(
          padding: const EdgeInsets.only(bottom: 12),
          child: Card(
            child: Container(
              height: i == 0 ? 120 : 200,
              padding: const EdgeInsets.all(16),
              child: const Center(child: CircularProgressIndicator()),
            ),
          ),
        ),
      ),
    );
  }

  void _showCustomDateDialog(BuildContext context) {
    DateTime from = DateTime.now().subtract(const Duration(days: 30));
    DateTime to = DateTime.now();

    showDialog(
      context: context,
      builder: (context) => StatefulBuilder(
        builder: (context, setS) => AlertDialog(
          title: const Text('Custom Date Range'),
          content: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              ListTile(
                title: const Text('From'),
                subtitle: Text(Formatters.date(from)),
                trailing: const Icon(Icons.calendar_today),
                onTap: () async {
                  final d = await showDatePicker(
                    context: context,
                    initialDate: from,
                    firstDate: DateTime(2000),
                    lastDate: DateTime.now(),
                  );
                  if (d != null) setS(() => from = d);
                },
              ),
              ListTile(
                title: const Text('To'),
                subtitle: Text(Formatters.date(to)),
                trailing: const Icon(Icons.calendar_today),
                onTap: () async {
                  final d = await showDatePicker(
                    context: context,
                    initialDate: to,
                    firstDate: DateTime(2000),
                    lastDate: DateTime.now(),
                  );
                  if (d != null) setS(() => to = d);
                },
              ),
            ],
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.pop(context),
              child: const Text('Cancel'),
            ),
            FilledButton(
              onPressed: () {
                setState(() {
                  _customFrom = from;
                  _customTo = to;
                  _period = Period.custom;
                });
                Navigator.pop(context);
              },
              child: const Text('Apply'),
            ),
          ],
        ),
      ),
    );
  }

  void _exportCSV(
    BuildContext context,
    AsyncValue<DashboardData> dataAsync,
    String currency,
  ) {
    dataAsync.whenData((data) {
      final now = DateTime.now();
      final range = _period.range(
        now,
        customFrom: _customFrom,
        customTo: _customTo,
      );
      final rows = data.transactions.where((t) {
        final d = DateTime.tryParse(t['created_at'] ?? '') ?? DateTime.now();
        return d.isAfter(range[0]) &&
            d.isBefore(range[1]) &&
            (t['status'] ?? 'completed') == 'completed';
      }).toList();

      if (rows.isEmpty) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('No transactions to export')),
        );
        return;
      }

      final header = [
        'Transaction #',
        'Date',
        'Cashier',
        'Customer',
        'Branch',
        'Payment Method',
        'Subtotal',
        'Discount',
        'Tax',
        'Total',
        'Items',
        'Status',
      ];
      final csv = [
        header.join(','),
        ...rows.map(
          (t) => [
            '"${t['transaction_number'] ?? ''}"',
            '"${t['created_at'] ?? ''}"',
            '"${t['cashier_name'] ?? ''}"',
            '"${t['customer_name'] ?? 'Walk-in'}"',
            '"${t['branch_name'] ?? ''}"',
            '"${t['payment_method'] ?? ''}"',
            '${t['subtotal'] ?? 0}',
            '${t['discount'] ?? 0}',
            '${t['tax'] ?? 0}',
            '${t['total'] ?? 0}',
            '${t['items_count'] ?? 0}',
            '"${t['status'] ?? ''}"',
          ].join(','),
        ),
      ].join('\n');

      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('Exported ${rows.length} transactions (CSV ready)'),
        ),
      );
      // In production, use share_plus to share the file
    });
  }
}

// ── Computed Values ───────────────────────────────────────────────

class _DashboardComputed {
  final DashboardData data;
  final List<DateTime> range;
  final Period period;

  _DashboardComputed({
    required this.data,
    required this.range,
    required this.period,
  });

  List<Map<String, dynamic>> get inRangeTx {
    return data.transactions.where((t) {
      final d = DateTime.tryParse(t['created_at'] ?? '');
      if (d == null) return false;
      return d.isAfter(range[0]) &&
          d.isBefore(range[1]) &&
          (t['status'] ?? 'completed') == 'completed';
    }).toList();
  }

  double get revenue =>
      inRangeTx.fold(0.0, (s, t) => s + Formatters.toDouble(t['total']));

  int get txCount => inRangeTx.length;

  int get itemsSold =>
      inRangeTx.fold(0, (s, t) => s + ((t['items_count'] as int?) ?? 0));

  double get aov => txCount > 0 ? revenue / txCount : 0;

  int get stockItems => data.products.length;

  double get stockValue => data.products.fold(0.0, (s, p) {
    final qty = Formatters.toDouble(
      p['quantity_on_hand'] ?? p['stock_on_hand'] ?? 0,
    );
    final cost = Formatters.toDouble(p['cost_price'] ?? 0);
    return s + qty * cost;
  });

  double get grossProfit {
    double cost = 0;
    for (final t in inRangeTx) {
      final items = t['items'] as List? ?? [];
      for (final item in items) {
        final m = item as Map;
        final prod = data.products.firstWhere(
          (p) => p['name'] == m['product_name'],
          orElse: () => {},
        );
        cost +=
            Formatters.toDouble(m['quantity'] ?? 0) *
            Formatters.toDouble(prod['cost_price'] ?? 0);
      }
    }
    return revenue - cost;
  }

  double get grossMarginPct => revenue > 0 ? (grossProfit / revenue) * 100 : 0;

  double get inventoryTurnover {
    double cogs = 0;
    for (final t in inRangeTx) {
      final items = t['items'] as List? ?? [];
      for (final item in items) {
        final m = item as Map;
        final prod = data.products.firstWhere(
          (p) => p['name'] == m['product_name'],
          orElse: () => {},
        );
        cogs +=
            Formatters.toDouble(m['quantity'] ?? 0) *
            Formatters.toDouble(prod['cost_price'] ?? 0);
      }
    }
    return stockValue > 0 ? cogs / stockValue : 0;
  }

  double get inventoryTurnoverDays {
    if (inventoryTurnover <= 0) return 0;
    return period.days / inventoryTurnover;
  }

  double get revGrowth {
    final rangeDays = range[1].difference(range[0]).inDays;
    final prevEnd = range[0];
    final prevStart = prevEnd.subtract(Duration(days: rangeDays));
    final prevRev = data.transactions
        .where((t) {
          final d = DateTime.tryParse(t['created_at'] ?? '');
          if (d == null) return false;
          return d.isAfter(prevStart) &&
              d.isBefore(prevEnd) &&
              (t['status'] ?? 'completed') == 'completed';
        })
        .fold(0.0, (s, t) => s + Formatters.toDouble(t['total']));
    return prevRev > 0 ? ((revenue - prevRev) / prevRev) * 100 : 0;
  }

  // Revenue by day
  Map<String, double> get revenueByDay {
    final map = <String, double>{};
    for (final t in inRangeTx) {
      final d = DateTime.tryParse(t['created_at'] ?? '');
      if (d == null) continue;
      final key =
          '${d.year}-${d.month.toString().padLeft(2, '0')}-${d.day.toString().padLeft(2, '0')}';
      map[key] = (map[key] ?? 0) + Formatters.toDouble(t['total']);
    }
    return Map.fromEntries(
      map.entries.toList()..sort((a, b) => a.key.compareTo(b.key)),
    );
  }

  // Cost by day
  Map<String, double> get costByDay {
    final map = <String, double>{};
    for (final t in inRangeTx) {
      final d = DateTime.tryParse(t['created_at'] ?? '');
      if (d == null) continue;
      final key =
          '${d.year}-${d.month.toString().padLeft(2, '0')}-${d.day.toString().padLeft(2, '0')}';
      double cost = 0;
      final items = t['items'] as List? ?? [];
      for (final item in items) {
        final m = item as Map;
        final prod = data.products.firstWhere(
          (p) => p['name'] == m['product_name'],
          orElse: () => {},
        );
        cost +=
            Formatters.toDouble(m['quantity'] ?? 0) *
            Formatters.toDouble(prod['cost_price'] ?? 0);
      }
      map[key] = (map[key] ?? 0) + cost;
    }
    return Map.fromEntries(
      map.entries.toList()..sort((a, b) => a.key.compareTo(b.key)),
    );
  }

  // Payment method breakdown
  Map<String, double> get paymentBreakdown {
    final map = <String, double>{};
    for (final t in inRangeTx) {
      final method = (t['payment_method'] ?? 'cash').toString();
      map[method] = (map[method] ?? 0) + Formatters.toDouble(t['total']);
    }
    return map;
  }

  // Top 10 products by revenue
  List<MapEntry<String, double>> get topProducts {
    final map = <String, double>{};
    for (final t in inRangeTx) {
      final items = t['items'] as List? ?? [];
      for (final item in items) {
        final m = item as Map;
        final name = m['product_name'] as String? ?? 'Unknown';
        map[name] =
            (map[name] ?? 0) +
            Formatters.toDouble(m['line_total'] ?? m['quantity'] ?? 0);
      }
    }
    final sorted = map.entries.toList()
      ..sort((a, b) => b.value.compareTo(a.value));
    return sorted.take(10).toList();
  }

  // Category breakdown
  Map<String, double> get categoryBreakdown {
    final map = <String, double>{};
    for (final t in inRangeTx) {
      final items = t['items'] as List? ?? [];
      for (final item in items) {
        final m = item as Map;
        final cat = m['category_name'] as String? ?? 'Uncategorized';
        map[cat] = (map[cat] ?? 0) + Formatters.toDouble(m['line_total'] ?? 0);
      }
    }
    return map;
  }

  // Recent transactions (sorted by date desc)
  List<Map<String, dynamic>> get recentTx {
    final list = List<Map<String, dynamic>>.from(inRangeTx);
    list.sort((a, b) {
      final da = DateTime.tryParse(a['created_at'] ?? '') ?? DateTime.now();
      final db = DateTime.tryParse(b['created_at'] ?? '') ?? DateTime.now();
      return db.compareTo(da);
    });
    return list.take(8).toList();
  }
}

// ── KPI Grid ──────────────────────────────────────────────────────

class _KpiGrid extends StatelessWidget {
  final _DashboardComputed computed;
  final String currency;

  const _KpiGrid({required this.computed, required this.currency});

  @override
  Widget build(BuildContext context) {
    final revGrowthPositive = computed.revGrowth >= 0;
    final sparkData = computed.revenueByDay.values.toList();

    return LayoutBuilder(
      builder: (context, constraints) {
        return Column(
          children: [
            // Revenue card — full width
            _AnimatedKpiCard(
              label: 'Revenue',
              value: Formatters.currency(computed.revenue, currency),
              icon: Icons.attach_money,
              color: Colors.green,
              trend: '${computed.revGrowth.abs().toStringAsFixed(1)}% vs prev',
              trendUp: revGrowthPositive,
              sparkData: sparkData,
              fullWidth: true,
            ),
            const SizedBox(height: 12),
            // Other KPIs — horizontal scroll
            SingleChildScrollView(
              scrollDirection: Axis.horizontal,
              child: Row(
                children: [
                  SizedBox(
                    width: 185,
                    child: _AnimatedKpiCard(
                      label: 'Transactions',
                      value: Formatters.number(computed.txCount),
                      icon: Icons.receipt_long,
                      color: Colors.blue,
                      subtitle: '${computed.itemsSold} items sold',
                    ),
                  ),
                  const SizedBox(width: 12),
                  SizedBox(
                    width: 185,
                    child: _AnimatedKpiCard(
                      label: 'Avg. Order Value',
                      value: Formatters.currency(computed.aov, currency),
                      icon: Icons.trending_up,
                      color: Colors.lightBlue,
                      subtitle: 'per transaction',
                    ),
                  ),
                  const SizedBox(width: 12),
                  SizedBox(
                    width: 185,
                    child: _AnimatedKpiCard(
                      label: 'Stock Value',
                      value: Formatters.currency(computed.stockValue, currency),
                      icon: Icons.inventory_2,
                      color: Colors.teal,
                      subtitle: '${computed.stockItems} SKUs',
                    ),
                  ),
                  const SizedBox(width: 12),
                  SizedBox(
                    width: 185,
                    child: _AnimatedKpiCard(
                      label: 'Gross Margin',
                      value: '${computed.grossMarginPct.toStringAsFixed(1)}%',
                      icon: Icons.percent,
                      color: Colors.purple,
                      subtitle:
                          '${Formatters.currency(computed.grossProfit, currency)} profit',
                    ),
                  ),
                  const SizedBox(width: 12),
                  SizedBox(
                    width: 185,
                    child: _AnimatedKpiCard(
                      label: 'Inventory Turnover',
                      value:
                          '${computed.inventoryTurnover.toStringAsFixed(2)}x',
                      icon: Icons.swap_horiz,
                      color: Colors.orange,
                      subtitle:
                          '${computed.inventoryTurnoverDays.round()} days to sell',
                    ),
                  ),
                ],
              ),
            ),
          ],
        );
      },
    );
  }
}

class _AnimatedKpiCard extends StatefulWidget {
  final String label;
  final String value;
  final IconData icon;
  final Color color;
  final String? subtitle;
  final String? trend;
  final bool trendUp;
  final List<double>? sparkData;
  final bool fullWidth;

  const _AnimatedKpiCard({
    required this.label,
    required this.value,
    required this.icon,
    required this.color,
    this.subtitle,
    this.trend,
    this.trendUp = true,
    this.sparkData,
    this.fullWidth = false,
  });

  @override
  State<_AnimatedKpiCard> createState() => _AnimatedKpiCardState();
}

class _AnimatedKpiCardState extends State<_AnimatedKpiCard>
    with TickerProviderStateMixin {
  late AnimationController _controller;
  late Animation<double> _anim;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      duration: const Duration(milliseconds: 800),
      vsync: this,
    );
    _anim = CurvedAnimation(parent: _controller, curve: Curves.easeOutCubic);
    _controller.forward();
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final scheme = Theme.of(context).colorScheme;
    if (widget.fullWidth) return _buildFullWidthContent(scheme);
    return Card(
      color: Colors.transparent,
      shadowColor: Colors.transparent,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(16),
        side: BorderSide(color: Colors.grey.shade400, width: 1),
      ),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: _buildCompactContent(scheme),
      ),
    );
  }

  Widget _buildCompactContent(ColorScheme scheme) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      mainAxisSize: MainAxisSize.min,
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text(
              widget.label.toUpperCase(),
              style: TextStyle(
                fontSize: 10,
                fontWeight: FontWeight.w600,
                color: scheme.onSurfaceVariant,
              ),
            ),
            Container(
              padding: const EdgeInsets.all(6),
              decoration: BoxDecoration(
                color: widget.color.withOpacity(0.12),
                borderRadius: BorderRadius.circular(20),
              ),
              child: Icon(widget.icon, color: widget.color, size: 18),
            ),
          ],
        ),
        const SizedBox(height: 8),
        FadeTransition(
          opacity: _anim,
          child: Text(
            widget.value,
            style: TextStyle(
              fontSize: 16,
              fontWeight: FontWeight.w800,
              color: scheme.onSurface,
            ),
          ),
        ),
        if (widget.subtitle != null)
          Text(
            widget.subtitle!,
            style: TextStyle(fontSize: 11, color: scheme.onSurfaceVariant),
          ),
        if (widget.trend != null) ...[
          const SizedBox(height: 4),
          Row(
            children: [
              Icon(
                widget.trendUp ? Icons.trending_up : Icons.trending_down,
                size: 14,
                color: widget.trendUp ? Colors.green : Colors.red,
              ),
              const SizedBox(width: 2),
              Text(
                widget.trend!,
                style: TextStyle(
                  fontSize: 11,
                  fontWeight: FontWeight.w600,
                  color: widget.trendUp ? Colors.green : Colors.red,
                ),
              ),
            ],
          ),
        ],
        if (widget.sparkData != null && widget.sparkData!.length > 1) ...[
          const SizedBox(height: 4),
          SizedBox(
            height: 30,
            child: _MiniSparkline(data: widget.sparkData!, color: widget.color),
          ),
        ],
      ],
    );
  }

  Widget _buildFullWidthContent(ColorScheme scheme) {
    final isLight = scheme.brightness == Brightness.light;
    return Container(
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(12),
        gradient: LinearGradient(
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
          colors: isLight
              ? [
                  const Color(0xFF0d47a1),
                  const Color(0xFF1976d2),
                  const Color(0xFF42a5f5),
                ]
              : [
                  const Color(0xFF0d47a1),
                  const Color(0xFF1565c0),
                  const Color(0xFF1e88e5),
                ],
        ),
        boxShadow: [
          BoxShadow(
            color: const Color(0xFF1976d2).withOpacity(isLight ? 0.25 : 0.15),
            blurRadius: 16,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Padding(
        padding: const EdgeInsets.all(20),
        child: Row(
          children: [
            // Left — label, value, trend
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                mainAxisSize: MainAxisSize.min,
                children: [
                  // Icon + label row
                  Row(
                    children: [
                      Container(
                        padding: const EdgeInsets.all(8),
                        decoration: BoxDecoration(
                          color: Colors.white.withOpacity(0.15),
                          borderRadius: BorderRadius.circular(8),
                        ),
                        child: Icon(widget.icon, color: Colors.white, size: 18),
                      ),
                      const SizedBox(width: 8),
                      Text(
                        widget.label.toUpperCase(),
                        style: TextStyle(
                          fontSize: 12,
                          fontWeight: FontWeight.w600,
                          color: Colors.white.withOpacity(0.7),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 12),
                  // Big value
                  FadeTransition(
                    opacity: _anim,
                    child: Text(
                      widget.value,
                      style: const TextStyle(
                        fontSize: 20,
                        fontWeight: FontWeight.w800,
                        color: Colors.white,
                      ),
                    ),
                  ),
                  const SizedBox(height: 6),
                  // Trend pill
                  if (widget.trend != null)
                    Container(
                      padding: const EdgeInsets.symmetric(
                        horizontal: 10,
                        vertical: 4,
                      ),
                      decoration: BoxDecoration(
                        color: (widget.trendUp ? Colors.green : Colors.red)
                            .withOpacity(0.2),
                        borderRadius: BorderRadius.circular(20),
                        border: Border.all(
                          color: (widget.trendUp ? Colors.green : Colors.red)
                              .withOpacity(0.5),
                          width: 1,
                        ),
                      ),
                      child: Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Icon(
                            widget.trendUp
                                ? Icons.trending_up
                                : Icons.trending_down,
                            size: 12,
                            color: widget.trendUp
                                ? Colors.green.shade300
                                : Colors.red.shade300,
                          ),
                          const SizedBox(width: 4),
                          Text(
                            widget.trend!,
                            style: const TextStyle(
                              fontSize: 11,
                              fontWeight: FontWeight.w600,
                              color: Colors.white,
                            ),
                          ),
                        ],
                      ),
                    ),
                ],
              ),
            ),
            // Right — sparkline on a frosted background
            if (widget.sparkData != null && widget.sparkData!.length > 1) ...[
              const SizedBox(width: 12),
              Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: Colors.white.withOpacity(0.1),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: SizedBox(
                  height: 64,
                  width: 110,
                  child: _MiniSparkline(
                    data: widget.sparkData!,
                    color: Colors.white,
                  ),
                ),
              ),
            ],
          ],
        ),
      ),
    );
  }
}

class _MiniSparkline extends StatelessWidget {
  final List<double> data;
  final Color color;

  const _MiniSparkline({required this.data, required this.color});

  @override
  Widget build(BuildContext context) {
    if (data.length < 2) return const SizedBox.shrink();
    final max = data.reduce(math.max);
    final min = data.reduce(math.min);
    final range = max - min;
    if (range == 0) return const SizedBox.shrink();

    return LineChart(
      LineChartData(
        gridData: const FlGridData(show: false),
        titlesData: const FlTitlesData(show: false),
        borderData: FlBorderData(show: false),
        lineBarsData: [
          LineChartBarData(
            spots: List.generate(
              data.length,
              (i) => FlSpot(i.toDouble(), data[i]),
            ),
            isCurved: true,
            color: color,
            barWidth: 2,
            dotData: const FlDotData(show: false),
            belowBarData: BarAreaData(
              show: true,
              color: color.withOpacity(0.15),
            ),
          ),
        ],
        minX: 0,
        maxX: (data.length - 1).toDouble(),
        minY: min,
        maxY: max,
      ),
    );
  }
}

// ── Revenue Trend Chart ────────────────────────────────────────────

/// Compute a "nice" Y-axis interval (~5 divisions) similar to ApexCharts.
double _niceYInterval(double maxValue) {
  if (maxValue <= 0) return 1;
  final rough = maxValue / 5;
  final magnitude = math
      .pow(10, (math.log(rough) / math.ln10).floor())
      .toDouble();
  final normalized = rough / magnitude;
  double nice;
  if (normalized < 1.5) {
    nice = 1;
  } else if (normalized < 3) {
    nice = 2;
  } else if (normalized < 7) {
    nice = 5;
  } else {
    nice = 10;
  }
  return nice * magnitude;
}

class _RevenueChartCard extends StatelessWidget {
  final _DashboardComputed computed;
  final String currency;

  const _RevenueChartCard({required this.computed, required this.currency});

  @override
  Widget build(BuildContext context) {
    final scheme = Theme.of(context).colorScheme;
    final revByDay = computed.revenueByDay;
    final costByDay = computed.costByDay;
    final keys = revByDay.keys.toList()..sort();

    if (keys.isEmpty) {
      return _EmptyChartCard(
        title: 'Revenue Trend',
        subtitle: 'Daily revenue',
        icon: Icons.show_chart,
        iconColor: Colors.blue,
      );
    }

    final maxRev = revByDay.values.fold<double>(0, (a, b) => a > b ? a : b);

    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Container(
                  padding: const EdgeInsets.all(8),
                  decoration: BoxDecoration(
                    color: Colors.blue.withOpacity(0.12),
                    borderRadius: BorderRadius.circular(10),
                  ),
                  child: Icon(Icons.show_chart, color: Colors.blue, size: 18),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'Revenue Trend',
                        style: TextStyle(
                          fontWeight: FontWeight.bold,
                          fontSize: 15,
                        ),
                      ),
                      Text(
                        'Daily revenue — ${computed.period.short}',
                        style: TextStyle(
                          fontSize: 12,
                          color: scheme.onSurfaceVariant,
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
            const SizedBox(height: 16),
            SizedBox(
              height: 200,
              child: LayoutBuilder(
                builder: (context, constraints) {
                  final minChartWidth = 300.0;
                  final dataWidth = (keys.length * 30.0).clamp(
                    minChartWidth,
                    5000.0,
                  );
                  final scrollable = dataWidth > constraints.maxWidth;
                  final chart = LineChart(
                    LineChartData(
                      gridData: FlGridData(
                        show: true,
                        drawVerticalLine: true,
                        getDrawingHorizontalLine: (v) => FlLine(
                          color: scheme.onSurface.withOpacity(0.06),
                          strokeWidth: 1,
                        ),
                        getDrawingVerticalLine: (v) => FlLine(
                          color: scheme.onSurface.withOpacity(0.04),
                          strokeWidth: 1,
                        ),
                      ),
                      titlesData: FlTitlesData(
                        topTitles: const AxisTitles(
                          sideTitles: SideTitles(showTitles: false),
                        ),
                        rightTitles: const AxisTitles(
                          sideTitles: SideTitles(showTitles: false),
                        ),
                        bottomTitles: AxisTitles(
                          sideTitles: SideTitles(
                            showTitles: true,
                            reservedSize: 32,
                            interval: math.max(1, keys.length ~/ 6).toDouble(),
                            getTitlesWidget: (value, meta) {
                              final i = value.round();
                              if (i < 0 || i >= keys.length)
                                return const SizedBox.shrink();
                              final d = DateTime.tryParse(keys[i]);
                              if (d == null) return const SizedBox.shrink();
                              const months = [
                                'Jan',
                                'Feb',
                                'Mar',
                                'Apr',
                                'May',
                                'Jun',
                                'Jul',
                                'Aug',
                                'Sep',
                                'Oct',
                                'Nov',
                                'Dec',
                              ];
                              final label =
                                  '${d.day.toString().padLeft(2, '0')} ${months[d.month - 1]}';
                              return Padding(
                                padding: const EdgeInsets.only(top: 6),
                                child: Text(
                                  label,
                                  style: TextStyle(
                                    fontSize: 10,
                                    color: scheme.onSurfaceVariant,
                                  ),
                                ),
                              );
                            },
                          ),
                        ),
                        leftTitles: AxisTitles(
                          sideTitles: SideTitles(
                            showTitles: true,
                            reservedSize: 36,
                            interval: _niceYInterval(maxRev),
                            getTitlesWidget: (value, meta) {
                              return Text(
                                Formatters.compact(value),
                                style: TextStyle(
                                  fontSize: 10,
                                  color: scheme.onSurfaceVariant,
                                ),
                              );
                            },
                          ),
                        ),
                      ),
                      borderData: FlBorderData(show: false),
                      lineBarsData: [
                        // Revenue
                        LineChartBarData(
                          spots: List.generate(
                            keys.length,
                            (i) => FlSpot(i.toDouble(), revByDay[keys[i]]!),
                          ),
                          isCurved: true,
                          color: Colors.blue,
                          barWidth: 2.5,
                          dotData: const FlDotData(show: false),
                          belowBarData: BarAreaData(
                            show: true,
                            color: Colors.blue.withOpacity(0.15),
                          ),
                        ),
                        // Cost
                        LineChartBarData(
                          spots: List.generate(
                            keys.length,
                            (i) =>
                                FlSpot(i.toDouble(), costByDay[keys[i]] ?? 0),
                          ),
                          isCurved: true,
                          color: Colors.red,
                          barWidth: 2,
                          dotData: const FlDotData(show: false),
                          belowBarData: BarAreaData(
                            show: true,
                            color: Colors.red.withOpacity(0.08),
                          ),
                        ),
                        // Profit
                        LineChartBarData(
                          spots: List.generate(keys.length, (i) {
                            final r = revByDay[keys[i]] ?? 0;
                            final c = costByDay[keys[i]] ?? 0;
                            return FlSpot(i.toDouble(), r - c);
                          }),
                          isCurved: true,
                          color: Colors.green,
                          barWidth: 2,
                          dotData: const FlDotData(show: false),
                          belowBarData: BarAreaData(
                            show: true,
                            color: Colors.green.withOpacity(0.08),
                          ),
                        ),
                      ],
                      minY: 0,
                      maxY: maxRev * 1.1,
                      lineTouchData: LineTouchData(
                        touchTooltipData: LineTouchTooltipData(
                          getTooltipItems: (touchedSpots) {
                            return touchedSpots.map((spot) {
                              return LineTooltipItem(
                                '${Formatters.currency(spot.y, currency)}',
                                const TextStyle(
                                  color: Colors.white,
                                  fontSize: 11,
                                  fontWeight: FontWeight.bold,
                                ),
                              );
                            }).toList();
                          },
                        ),
                      ),
                    ),
                  );
                  if (!scrollable) return chart;
                  return SingleChildScrollView(
                    scrollDirection: Axis.horizontal,
                    child: SizedBox(width: dataWidth, child: chart),
                  );
                },
              ),
            ),
            const SizedBox(height: 8),
            // Legend
            Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                _LegendDot(color: Colors.blue, label: 'Revenue'),
                const SizedBox(width: 16),
                _LegendDot(color: Colors.red, label: 'Cost'),
                const SizedBox(width: 16),
                _LegendDot(color: Colors.green, label: 'Profit'),
              ],
            ),
          ],
        ),
      ),
    );
  }
}

class _LegendDot extends StatelessWidget {
  final Color color;
  final String label;
  const _LegendDot({required this.color, required this.label});

  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        Container(
          width: 8,
          height: 8,
          decoration: BoxDecoration(color: color, shape: BoxShape.circle),
        ),
        const SizedBox(width: 4),
        Text(
          label,
          style: TextStyle(
            fontSize: 11,
            color: Theme.of(context).colorScheme.onSurfaceVariant,
          ),
        ),
      ],
    );
  }
}

// ── Payment Methods Donut ──────────────────────────────────────────

class _PaymentDonutCard extends StatelessWidget {
  final _DashboardComputed computed;
  final String currency;

  const _PaymentDonutCard({required this.computed, required this.currency});

  static const _palette = [
    Colors.blue,
    Colors.green,
    Colors.orange,
    Colors.red,
    Colors.purple,
    Colors.teal,
    Colors.pink,
    Colors.indigo,
  ];

  @override
  Widget build(BuildContext context) {
    final scheme = Theme.of(context).colorScheme;
    final breakdown = computed.paymentBreakdown;
    final entries = breakdown.entries.toList();
    final total = entries.fold<double>(0, (s, e) => s + e.value);

    if (entries.isEmpty || total == 0) {
      return _EmptyChartCard(
        title: 'Payment Methods',
        subtitle: 'Revenue by payment type',
        icon: Icons.donut_large,
        iconColor: Colors.green,
      );
    }

    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Container(
                  padding: const EdgeInsets.all(8),
                  decoration: BoxDecoration(
                    color: Colors.green.withOpacity(0.12),
                    borderRadius: BorderRadius.circular(10),
                  ),
                  child: Icon(Icons.donut_large, color: Colors.green, size: 18),
                ),
                const SizedBox(width: 12),
                Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'Payment Methods',
                      style: const TextStyle(
                        fontWeight: FontWeight.bold,
                        fontSize: 15,
                      ),
                    ),
                    Text(
                      'Revenue by payment type',
                      style: TextStyle(
                        fontSize: 12,
                        color: scheme.onSurfaceVariant,
                      ),
                    ),
                  ],
                ),
              ],
            ),
            const SizedBox(height: 16),
            SizedBox(
              height: 180,
              child: Row(
                children: [
                  Expanded(
                    child: PieChart(
                      PieChartData(
                        sections: List.generate(entries.length, (i) {
                          final e = entries[i];
                          final pct = (e.value / total) * 100;
                          return PieChartSectionData(
                            value: e.value,
                            color: _palette[i % _palette.length],
                            title: '${pct.round()}%',
                            radius: 50,
                            titleStyle: const TextStyle(
                              fontSize: 11,
                              color: Colors.white,
                              fontWeight: FontWeight.bold,
                            ),
                          );
                        }),
                        centerSpaceRadius: 35,
                      ),
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: entries.map((e) {
                        final i = entries.indexOf(e);
                        return Padding(
                          padding: const EdgeInsets.symmetric(vertical: 2),
                          child: Row(
                            children: [
                              Container(
                                width: 10,
                                height: 10,
                                decoration: BoxDecoration(
                                  color: _palette[i % _palette.length],
                                  borderRadius: BorderRadius.circular(3),
                                ),
                              ),
                              const SizedBox(width: 6),
                              Expanded(
                                child: Text(
                                  e.key,
                                  style: TextStyle(
                                    fontSize: 11,
                                    color: scheme.onSurfaceVariant,
                                  ),
                                ),
                              ),
                              Text(
                                Formatters.currency(e.value, currency),
                                style: TextStyle(
                                  fontSize: 11,
                                  fontWeight: FontWeight.w600,
                                ),
                              ),
                            ],
                          ),
                        );
                      }).toList(),
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}

// ── Top Products Bar Chart ────────────────────────────────────────

class _TopProductsCard extends StatelessWidget {
  final _DashboardComputed computed;
  final String currency;

  const _TopProductsCard({required this.computed, required this.currency});

  // Gradient palette for bars (indigo → purple → teal → amber)
  static const _barColors = [
    Color(0xFF6366f1), // #6366f1 indigo
    Color(0xFF8b5cf6), // #8b5cf6 violet
    Color(0xFFa855f7), // #a855f7 purple
    Color(0xFFec4899), // #ec4899 pink
    Color(0xFFf43f5e), // #f43f5e rose
    Color(0xFFf97316), // #f97316 orange
    Color(0xFFf59e0b), // #f59e0b amber
    Color(0xFF14b8a6), // #14b8a6 teal
    Color(0xFF06b6d4), // #06b6d4 cyan
    Color(0xFF3b82f6), // #3b82f6 blue
  ];

  @override
  Widget build(BuildContext context) {
    final scheme = Theme.of(context).colorScheme;
    final top = computed.topProducts;

    if (top.isEmpty) {
      return _EmptyChartCard(
        title: 'Top 10 Products',
        subtitle: 'Best sellers by revenue',
        icon: Icons.emoji_events,
        iconColor: Colors.indigo,
      );
    }

    final maxVal = top.fold<double>(0, (a, e) => a > e.value ? a : e.value);

    return Card(
      elevation: 2,
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Header
            Row(
              children: [
                Container(
                  padding: const EdgeInsets.all(10),
                  decoration: BoxDecoration(
                    color: const Color(0xFF6366f1).withOpacity(0.12),
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: const Icon(
                    Icons.emoji_events,
                    color: Color(0xFF6366f1),
                    size: 20,
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'Top 10 Products',
                        style: const TextStyle(
                          fontWeight: FontWeight.bold,
                          fontSize: 15,
                        ),
                      ),
                      Text(
                        'Best sellers by revenue',
                        style: TextStyle(
                          fontSize: 12,
                          color: scheme.onSurfaceVariant,
                        ),
                      ),
                    ],
                  ),
                ),
                Container(
                  padding: const EdgeInsets.symmetric(
                    horizontal: 10,
                    vertical: 4,
                  ),
                  decoration: BoxDecoration(
                    color: scheme.primaryContainer.withOpacity(0.4),
                    borderRadius: BorderRadius.circular(20),
                  ),
                  child: Text(
                    '${top.length} items',
                    style: TextStyle(
                      fontSize: 11,
                      fontWeight: FontWeight.w600,
                      color: scheme.onPrimaryContainer,
                    ),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 16),
            // Custom bars with product names above each bar
            Column(
              children: List.generate(top.length, (i) {
                final color = _barColors[i % _barColors.length];
                final pct = maxVal > 0 ? top[i].value / maxVal : 0.0;
                return Padding(
                  padding: EdgeInsets.only(
                    bottom: i == top.length - 1 ? 0 : 10,
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      // Product name + value on top of bar
                      Row(
                        children: [
                          Container(
                            width: 18,
                            height: 18,
                            decoration: BoxDecoration(
                              color: color.withOpacity(0.15),
                              borderRadius: BorderRadius.circular(5),
                            ),
                            child: Center(
                              child: Text(
                                '${i + 1}',
                                style: TextStyle(
                                  fontSize: 9,
                                  fontWeight: FontWeight.w700,
                                  color: color,
                                ),
                              ),
                            ),
                          ),
                          const SizedBox(width: 6),
                          Expanded(
                            child: Text(
                              Formatters.truncate(top[i].key, 27),
                              style: TextStyle(
                                fontSize: 11,
                                fontWeight: FontWeight.w500,
                                color: scheme.onSurface,
                              ),
                              overflow: TextOverflow.ellipsis,
                            ),
                          ),
                          const SizedBox(width: 8),
                          Text(
                            Formatters.compact(top[i].value),
                            style: TextStyle(
                              fontSize: 11,
                              fontWeight: FontWeight.w700,
                              color: color,
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 4),
                      // Bar
                      ClipRRect(
                        borderRadius: BorderRadius.circular(6),
                        child: SizedBox(
                          height: 14,
                          child: Stack(
                            children: [
                              // Track
                              Container(
                                decoration: BoxDecoration(
                                  color: scheme.onSurface.withOpacity(0.05),
                                  borderRadius: BorderRadius.circular(6),
                                ),
                              ),
                              // Filled bar
                              FractionallySizedBox(
                                widthFactor: pct,
                                child: Container(
                                  decoration: BoxDecoration(
                                    gradient: LinearGradient(
                                      colors: [color, color.withOpacity(0.65)],
                                    ),
                                    borderRadius: BorderRadius.circular(6),
                                  ),
                                ),
                              ),
                            ],
                          ),
                        ),
                      ),
                    ],
                  ),
                );
              }),
            ),
          ],
        ),
      ),
    );
  }
}

// ── Category Donut Chart ──────────────────────────────────────────

class _CategoryDonutCard extends StatelessWidget {
  final _DashboardComputed computed;
  final String currency;

  const _CategoryDonutCard({required this.computed, required this.currency});

  static const _palette = [
    Colors.amber,
    Colors.blue,
    Colors.green,
    Colors.pink,
    Colors.purple,
    Colors.orange,
    Colors.teal,
    Colors.indigo,
  ];

  @override
  Widget build(BuildContext context) {
    final scheme = Theme.of(context).colorScheme;
    final breakdown = computed.categoryBreakdown;
    final entries = breakdown.entries.toList();
    final total = entries.fold<double>(0, (s, e) => s + e.value);

    if (entries.isEmpty || total == 0) {
      return _EmptyChartCard(
        title: 'Sales by Category',
        subtitle: 'Revenue distribution',
        icon: Icons.pie_chart,
        iconColor: Colors.amber,
      );
    }

    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Container(
                  padding: const EdgeInsets.all(8),
                  decoration: BoxDecoration(
                    color: Colors.amber.withOpacity(0.12),
                    borderRadius: BorderRadius.circular(10),
                  ),
                  child: Icon(Icons.pie_chart, color: Colors.amber, size: 18),
                ),
                const SizedBox(width: 12),
                Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'Sales by Category',
                      style: const TextStyle(
                        fontWeight: FontWeight.bold,
                        fontSize: 15,
                      ),
                    ),
                    Text(
                      'Revenue distribution',
                      style: TextStyle(
                        fontSize: 12,
                        color: scheme.onSurfaceVariant,
                      ),
                    ),
                  ],
                ),
              ],
            ),
            const SizedBox(height: 16),
            SizedBox(
              height: 180,
              child: Row(
                children: [
                  Expanded(
                    child: PieChart(
                      PieChartData(
                        sections: List.generate(entries.length, (i) {
                          final e = entries[i];
                          final pct = (e.value / total) * 100;
                          return PieChartSectionData(
                            value: e.value,
                            color: _palette[i % _palette.length],
                            title: '${pct.round()}%',
                            radius: 50,
                            titleStyle: const TextStyle(
                              fontSize: 11,
                              color: Colors.white,
                              fontWeight: FontWeight.bold,
                            ),
                          );
                        }),
                        centerSpaceRadius: 35,
                      ),
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: entries.take(6).map((e) {
                        final i = entries.indexOf(e);
                        return Padding(
                          padding: const EdgeInsets.symmetric(vertical: 2),
                          child: Row(
                            children: [
                              Container(
                                width: 10,
                                height: 10,
                                decoration: BoxDecoration(
                                  color: _palette[i % _palette.length],
                                  borderRadius: BorderRadius.circular(3),
                                ),
                              ),
                              const SizedBox(width: 6),
                              Expanded(
                                child: Text(
                                  e.key,
                                  style: TextStyle(
                                    fontSize: 11,
                                    color: scheme.onSurfaceVariant,
                                  ),
                                  overflow: TextOverflow.ellipsis,
                                ),
                              ),
                              Text(
                                Formatters.currency(e.value, currency),
                                style: TextStyle(
                                  fontSize: 11,
                                  fontWeight: FontWeight.w600,
                                ),
                              ),
                            ],
                          ),
                        );
                      }).toList(),
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}

// ── Heatmap Card ──────────────────────────────────────────────────

class _HeatmapCard extends StatelessWidget {
  final _DashboardComputed computed;
  final String currency;

  const _HeatmapCard({required this.computed, required this.currency});

  // GitHub-style color scale (matching web: #f0f0f0 → #bbdefb → #64b5f6 → #1976d2 → #0d47a1)
  static const _colors = [
    Color(0xFFebedf0), // 0 — no sales
    Color(0xFFbbdefb), // low
    Color(0xFF64b5f6), // moderate
    Color(0xFF1976d2), // busy
    Color(0xFF0d47a1), // peak
  ];

  @override
  Widget build(BuildContext context) {
    final scheme = Theme.of(context).colorScheme;
    final now = DateTime.now();

    // Build last 6 months data
    final months = <_HeatmapMonth>[];
    for (int i = 5; i >= 0; i--) {
      final d = DateTime(now.year, now.month - i, 1);
      final daysInMonth = DateTime(d.year, d.month + 1, 0).day;
      final days = <double>[];
      for (int day = 1; day <= daysInMonth; day++) {
        final dateStr =
            '${d.year}-${d.month.toString().padLeft(2, '0')}-${day.toString().padLeft(2, '0')}';
        final total = computed.data.transactions
            .where((t) {
              final td = DateTime.tryParse(t['created_at'] ?? '');
              if (td == null) return false;
              return '${td.year}-${td.month.toString().padLeft(2, '0')}-${td.day.toString().padLeft(2, '0')}' ==
                      dateStr &&
                  (t['status'] ?? 'completed') == 'completed';
            })
            .fold<double>(0, (s, t) => s + Formatters.toDouble(t['total']));
        days.add(total);
      }
      // ISO weekday: Monday=1 ... Sunday=7
      final startWeekday = DateTime(d.year, d.month, 1).weekday;
      months.add(
        _HeatmapMonth(
          label: _monthLabel(d.month),
          days: days,
          startWeekday: startWeekday,
        ),
      );
    }

    final maxVal = months
        .expand((m) => m.days)
        .fold<double>(0, (a, b) => a > b ? a : b);

    // Stats for header
    final totalRevenue = months
        .expand((m) => m.days)
        .fold<double>(0, (a, b) => a + b);
    final activeDays = months.expand((m) => m.days).where((v) => v > 0).length;

    return Card(
      elevation: 2,
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Header
            Row(
              children: [
                Container(
                  padding: const EdgeInsets.all(10),
                  decoration: BoxDecoration(
                    color: const Color(0xFF7c3aed).withOpacity(0.12),
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: const Icon(
                    Icons.calendar_view_month,
                    color: Color(0xFF7c3aed),
                    size: 20,
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'Sales Activity',
                        style: const TextStyle(
                          fontWeight: FontWeight.bold,
                          fontSize: 15,
                        ),
                      ),
                      Text(
                        'Daily revenue intensity — last 6 months',
                        style: TextStyle(
                          fontSize: 12,
                          color: scheme.onSurfaceVariant,
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
            const SizedBox(height: 12),
            // Summary stats row
            Row(
              children: [
                _HeatmapStat(label: 'Active Days', value: '$activeDays'),
                const SizedBox(width: 16),
                _HeatmapStat(
                  label: 'Total Revenue',
                  value: Formatters.compact(totalRevenue),
                ),
                const SizedBox(width: 16),
                _HeatmapStat(
                  label: 'Peak Day',
                  value: Formatters.compact(maxVal),
                ),
              ],
            ),
            const SizedBox(height: 16),
            // Heatmap grid
            SizedBox(
              height: 680,
              child: SingleChildScrollView(
                scrollDirection: Axis.horizontal,
                child: SizedBox(
                  width: months.length * 52.0 + 36,
                  child: Column(
                    children: [
                      // Month labels
                      SizedBox(
                        height: 22,
                        child: Row(
                          children: [
                            const SizedBox(width: 36),
                            ...months.map(
                              (m) => SizedBox(
                                width: 52,
                                child: Center(
                                  child: Text(
                                    m.label,
                                    style: TextStyle(
                                      fontSize: 11,
                                      fontWeight: FontWeight.w600,
                                      color: scheme.onSurfaceVariant,
                                    ),
                                  ),
                                ),
                              ),
                            ),
                          ],
                        ),
                      ),
                      const SizedBox(height: 4),
                      // Heatmap grid
                      Expanded(
                        child: Row(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            // Day-of-week labels
                            SizedBox(
                              width: 36,
                              child: Padding(
                                padding: const EdgeInsets.only(top: 2),
                                child: Column(
                                  children: [
                                    const SizedBox(height: 2),
                                    Text(
                                      'Mon',
                                      style: TextStyle(
                                        fontSize: 9,
                                        color: scheme.onSurfaceVariant,
                                      ),
                                    ),
                                    const SizedBox(height: 14),
                                    Text(
                                      'Wed',
                                      style: TextStyle(
                                        fontSize: 9,
                                        color: scheme.onSurfaceVariant,
                                      ),
                                    ),
                                    const SizedBox(height: 14),
                                    Text(
                                      'Fri',
                                      style: TextStyle(
                                        fontSize: 9,
                                        color: scheme.onSurfaceVariant,
                                      ),
                                    ),
                                    const SizedBox(height: 14),
                                    Text(
                                      'Sun',
                                      style: TextStyle(
                                        fontSize: 9,
                                        color: scheme.onSurfaceVariant,
                                      ),
                                    ),
                                  ],
                                ),
                              ),
                            ),
                            // Month columns
                            ...months.map(
                              (m) => _HeatmapColumn(
                                days: m.days,
                                maxVal: maxVal,
                                currency: currency,
                                startWeekday: m.startWeekday,
                              ),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ),
            const SizedBox(height: 12),
            // Legend
            Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Text(
                  'Less',
                  style: TextStyle(
                    fontSize: 10,
                    color: scheme.onSurfaceVariant,
                  ),
                ),
                const SizedBox(width: 6),
                ...List.generate(
                  5,
                  (i) => Container(
                    width: 14,
                    height: 14,
                    margin: const EdgeInsets.symmetric(horizontal: 2),
                    decoration: BoxDecoration(
                      color: _colors[i],
                      borderRadius: BorderRadius.circular(3),
                    ),
                  ),
                ),
                const SizedBox(width: 6),
                Text(
                  'More',
                  style: TextStyle(
                    fontSize: 10,
                    color: scheme.onSurfaceVariant,
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  String _monthLabel(int month) {
    const labels = [
      'Jan',
      'Feb',
      'Mar',
      'Apr',
      'May',
      'Jun',
      'Jul',
      'Aug',
      'Sep',
      'Oct',
      'Nov',
      'Dec',
    ];
    return labels[month - 1];
  }
}

class _HeatmapStat extends StatelessWidget {
  final String label;
  final String value;

  const _HeatmapStat({required this.label, required this.value});

  @override
  Widget build(BuildContext context) {
    final scheme = Theme.of(context).colorScheme;
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          value,
          style: TextStyle(
            fontSize: 16,
            fontWeight: FontWeight.w800,
            color: scheme.onSurface,
          ),
        ),
        Text(
          label,
          style: TextStyle(fontSize: 10, color: scheme.onSurfaceVariant),
        ),
      ],
    );
  }
}

class _HeatmapMonth {
  final String label;
  final List<double> days;
  final int startWeekday; // 1=Mon … 7=Sun (ISO)
  _HeatmapMonth({
    required this.label,
    required this.days,
    required this.startWeekday,
  });
}

class _HeatmapColumn extends StatelessWidget {
  final List<double> days;
  final double maxVal;
  final String currency;
  final int startWeekday; // 1=Mon … 7=Sun

  const _HeatmapColumn({
    required this.days,
    required this.maxVal,
    required this.currency,
    required this.startWeekday,
  });

  static const _colors = [
    Color(0xFFebedf0),
    Color(0xFFbbdefb),
    Color(0xFF64b5f6),
    Color(0xFF1976d2),
    Color(0xFF0d47a1),
  ];

  static int _level(double value, double max) {
    if (value <= 0) return 0;
    final pct = value / max;
    if (pct < 0.2) return 1;
    if (pct < 0.4) return 2;
    if (pct < 0.7) return 3;
    return 4;
  }

  @override
  Widget build(BuildContext context) {
    final offset = startWeekday - 1; // empty cells before day 1
    final totalSlots = offset + days.length;
    final totalRows = (totalSlots / 7).ceil() * 7;
    return SizedBox(
      width: 52,
      child: Column(
        mainAxisAlignment: MainAxisAlignment.start,
        children: List.generate(totalRows, (slot) {
          final dayIndex = slot - offset;
          if (dayIndex < 0 || dayIndex >= days.length) {
            return const SizedBox(height: 14, width: 14);
          }
          final v = days[dayIndex];
          final level = _level(v, maxVal);
          return Tooltip(
            message: v > 0 ? Formatters.currency(v, currency) : 'No sales',
            child: Container(
              width: 14,
              height: 14,
              margin: const EdgeInsets.all(1),
              decoration: BoxDecoration(
                color: _colors[level],
                borderRadius: BorderRadius.circular(3),
              ),
            ),
          );
        }),
      ),
    );
  }
}

// ── Low Stock Card ────────────────────────────────────────────────

class _LowStockCard extends StatelessWidget {
  final _DashboardComputed computed;

  const _LowStockCard({required this.computed});

  @override
  Widget build(BuildContext context) {
    final scheme = Theme.of(context).colorScheme;
    final items = computed.data.lowStockItems;

    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Container(
                  padding: const EdgeInsets.all(8),
                  decoration: BoxDecoration(
                    color: Colors.red.withOpacity(0.12),
                    borderRadius: BorderRadius.circular(10),
                  ),
                  child: Icon(
                    Icons.inventory_2_outlined,
                    color: Colors.red,
                    size: 18,
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'Low Stock Alerts',
                        style: const TextStyle(
                          fontWeight: FontWeight.bold,
                          fontSize: 15,
                        ),
                      ),
                      Text(
                        '${items.length} items need attention',
                        style: TextStyle(
                          fontSize: 12,
                          color: scheme.onSurfaceVariant,
                        ),
                      ),
                    ],
                  ),
                ),
                TextButton(
                  onPressed: () =>
                      GoRouter.of(context).go('/inventory/low-stock'),
                  child: const Text('View All', style: TextStyle(fontSize: 12)),
                ),
              ],
            ),
            const SizedBox(height: 8),
            if (items.isEmpty)
              Container(
                padding: const EdgeInsets.symmetric(vertical: 24),
                child: Column(
                  children: [
                    Icon(Icons.check_circle, color: Colors.green, size: 40),
                    const SizedBox(height: 8),
                    Text(
                      'All stock levels are healthy!',
                      style: TextStyle(
                        color: scheme.onSurfaceVariant,
                        fontSize: 13,
                      ),
                    ),
                  ],
                ),
              )
            else
              ...items.take(8).map((item) {
                final m = item as Map;
                final name =
                    m['product'] ?? m['product_name'] ?? m['name'] ?? 'Unknown';
                final sku = m['sku'] ?? '';
                final branch = m['branch'] ?? m['branch_name'] ?? '';
                final onHand =
                    m['on_hand'] ?? m['stock_on_hand'] ?? m['quantity'] ?? 0;
                final reorder = m['reorder_level'] ?? m['reorder_point'] ?? 0;
                return Padding(
                  padding: const EdgeInsets.symmetric(vertical: 6),
                  child: Row(
                    children: [
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              name.toString(),
                              style: const TextStyle(
                                fontWeight: FontWeight.w600,
                                fontSize: 13,
                              ),
                              overflow: TextOverflow.ellipsis,
                            ),
                            Text(
                              'SKU: $sku • $branch',
                              style: TextStyle(
                                fontSize: 11,
                                color: scheme.onSurfaceVariant,
                              ),
                            ),
                          ],
                        ),
                      ),
                      const SizedBox(width: 12),
                      Container(
                        padding: const EdgeInsets.symmetric(
                          horizontal: 8,
                          vertical: 2,
                        ),
                        decoration: BoxDecoration(
                          color: Colors.red.withOpacity(0.1),
                          borderRadius: BorderRadius.circular(6),
                        ),
                        child: Text(
                          '$onHand',
                          style: TextStyle(
                            color: Colors.red,
                            fontWeight: FontWeight.bold,
                            fontSize: 13,
                          ),
                        ),
                      ),
                      Text(
                        ' / ',
                        style: TextStyle(
                          color: scheme.onSurfaceVariant,
                          fontSize: 13,
                        ),
                      ),
                      Text(
                        '$reorder',
                        style: TextStyle(
                          color: scheme.onSurfaceVariant,
                          fontSize: 13,
                        ),
                      ),
                    ],
                  ),
                );
              }),
          ],
        ),
      ),
    );
  }
}

// ── Recent Transactions Card ──────────────────────────────────────

class _RecentTransactionsCard extends StatelessWidget {
  final _DashboardComputed computed;
  final String currency;

  const _RecentTransactionsCard({
    required this.computed,
    required this.currency,
  });

  @override
  Widget build(BuildContext context) {
    final scheme = Theme.of(context).colorScheme;
    final txs = computed.recentTx;

    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Container(
                  padding: const EdgeInsets.all(8),
                  decoration: BoxDecoration(
                    color: Colors.teal.withOpacity(0.12),
                    borderRadius: BorderRadius.circular(10),
                  ),
                  child: Icon(Icons.history, color: Colors.teal, size: 18),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'Recent Transactions',
                        style: const TextStyle(
                          fontWeight: FontWeight.bold,
                          fontSize: 15,
                        ),
                      ),
                      Text(
                        'Latest sales activity',
                        style: TextStyle(
                          fontSize: 12,
                          color: scheme.onSurfaceVariant,
                        ),
                      ),
                    ],
                  ),
                ),
                TextButton(
                  onPressed: () => GoRouter.of(context).go('/pos/history'),
                  child: const Text('View All', style: TextStyle(fontSize: 12)),
                ),
              ],
            ),
            const Divider(height: 16),
            if (txs.isEmpty)
              Container(
                padding: const EdgeInsets.symmetric(vertical: 24),
                child: Column(
                  children: [
                    Icon(
                      Icons.receipt_long,
                      color: scheme.onSurfaceVariant.withOpacity(0.5),
                      size: 40,
                    ),
                    const SizedBox(height: 8),
                    Text(
                      'No transactions yet',
                      style: TextStyle(
                        color: scheme.onSurfaceVariant,
                        fontSize: 13,
                      ),
                    ),
                  ],
                ),
              )
            else
              ...txs.map((tx) => _TransactionTile(tx: tx, currency: currency)),
          ],
        ),
      ),
    );
  }
}

class _TransactionTile extends StatelessWidget {
  final Map<String, dynamic> tx;
  final String currency;

  const _TransactionTile({required this.tx, required this.currency});

  @override
  Widget build(BuildContext context) {
    final scheme = Theme.of(context).colorScheme;
    final txNum = tx['transaction_number'] ?? '#${tx['id'] ?? ''}';
    final cashier = tx['cashier_name'] ?? 'Unknown';
    final customer = tx['customer_name'] ?? 'Walk-in';
    final method =
        tx['payment_method_display'] ?? tx['payment_method'] ?? 'cash';
    final itemsCount = tx['items_count'] ?? 0;
    final total = Formatters.toDouble(tx['total']);
    final status = tx['status'] ?? 'completed';
    final date = Formatters.dateTime(tx['created_at']);

    final avatarColors = [
      [Colors.blue, Colors.indigo],
      [Colors.green, Colors.teal],
      [Colors.amber, Colors.orange],
      [Colors.purple, Colors.deepPurple],
    ];
    final colorIdx = (tx['id'] as int? ?? 0) % 4;
    final avatarColors_ = avatarColors[colorIdx];

    final statusColors = {
      'completed': Colors.green,
      'pending': Colors.orange,
      'voided': Colors.red,
      'refunded': Colors.pink,
    };
    final statusColor = statusColors[status] ?? Colors.grey;

    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 8),
      child: Row(
        children: [
          Container(
            width: 36,
            height: 36,
            decoration: BoxDecoration(
              gradient: LinearGradient(colors: avatarColors_),
              borderRadius: BorderRadius.circular(10),
            ),
            child: Center(
              child: Text(
                cashier.isNotEmpty ? cashier[0].toUpperCase() : '?',
                style: const TextStyle(
                  color: Colors.white,
                  fontWeight: FontWeight.bold,
                ),
              ),
            ),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Transaction number + badges — clamp txNum, wrap badges
                Row(
                  children: [
                    Flexible(
                      child: Text(
                        txNum.toString(),
                        style: const TextStyle(
                          fontWeight: FontWeight.w600,
                          fontSize: 13,
                        ),
                        overflow: TextOverflow.ellipsis,
                      ),
                    ),
                    const SizedBox(width: 6),
                    Container(
                      padding: const EdgeInsets.symmetric(
                        horizontal: 4,
                        vertical: 1,
                      ),
                      decoration: BoxDecoration(
                        color: Colors.blue.withOpacity(0.08),
                        borderRadius: BorderRadius.circular(4),
                      ),
                      child: Text(
                        method.toString().toUpperCase(),
                        style: TextStyle(
                          fontSize: 9,
                          fontWeight: FontWeight.w600,
                          color: Colors.blue,
                        ),
                      ),
                    ),
                    const SizedBox(width: 4),
                    Container(
                      padding: const EdgeInsets.symmetric(
                        horizontal: 4,
                        vertical: 1,
                      ),
                      decoration: BoxDecoration(
                        color: Colors.green.withOpacity(0.08),
                        borderRadius: BorderRadius.circular(4),
                      ),
                      child: Text(
                        '$itemsCount items',
                        style: TextStyle(
                          fontSize: 9,
                          fontWeight: FontWeight.w600,
                          color: Colors.green,
                        ),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 2),
                // Cashier / customer / date — each truncated
                Row(
                  children: [
                    Flexible(
                      child: Text(
                        cashier,
                        style: TextStyle(
                          fontSize: 10,
                          color: scheme.onSurfaceVariant,
                        ),
                        overflow: TextOverflow.ellipsis,
                      ),
                    ),
                    Text(
                      ' • ',
                      style: TextStyle(
                        fontSize: 10,
                        color: scheme.onSurfaceVariant,
                      ),
                    ),
                    Flexible(
                      child: Text(
                        customer,
                        style: TextStyle(
                          fontSize: 10,
                          color: scheme.onSurfaceVariant,
                        ),
                        overflow: TextOverflow.ellipsis,
                      ),
                    ),
                    Text(
                      ' • ',
                      style: TextStyle(
                        fontSize: 10,
                        color: scheme.onSurfaceVariant,
                      ),
                    ),
                    Flexible(
                      child: Text(
                        date,
                        style: TextStyle(
                          fontSize: 10,
                          color: scheme.onSurfaceVariant,
                        ),
                        overflow: TextOverflow.ellipsis,
                      ),
                    ),
                  ],
                ),
                if (tx['items'] is List &&
                    (tx['items'] as List).isNotEmpty) ...[
                  const SizedBox(height: 2),
                  Text(
                    (tx['items'] as List)
                        .take(3)
                        .map((i) => (i as Map)['product_name'] ?? '')
                        .join(', '),
                    style: TextStyle(
                      fontSize: 10,
                      color: scheme.onSurfaceVariant.withOpacity(0.5),
                    ),
                    overflow: TextOverflow.ellipsis,
                  ),
                ],
              ],
            ),
          ),
          const SizedBox(width: 8),
          Column(
            crossAxisAlignment: CrossAxisAlignment.end,
            children: [
              Text(
                Formatters.currency(total, currency),
                style: const TextStyle(
                  fontWeight: FontWeight.bold,
                  fontSize: 14,
                ),
              ),
              const SizedBox(height: 2),
              Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Container(
                    width: 6,
                    height: 6,
                    decoration: BoxDecoration(
                      color: statusColor,
                      shape: BoxShape.circle,
                    ),
                  ),
                  const SizedBox(width: 4),
                  Text(
                    status.toUpperCase(),
                    style: TextStyle(
                      fontSize: 9,
                      fontWeight: FontWeight.bold,
                      color: statusColor,
                    ),
                  ),
                ],
              ),
            ],
          ),
        ],
      ),
    );
  }
}

// ── Empty Chart Card ───────────────────────────────────────────────

class _EmptyChartCard extends StatelessWidget {
  final String title;
  final String subtitle;
  final IconData icon;
  final Color iconColor;

  const _EmptyChartCard({
    required this.title,
    required this.subtitle,
    required this.icon,
    required this.iconColor,
  });

  @override
  Widget build(BuildContext context) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Container(
                  padding: const EdgeInsets.all(8),
                  decoration: BoxDecoration(
                    color: iconColor.withOpacity(0.12),
                    borderRadius: BorderRadius.circular(10),
                  ),
                  child: Icon(icon, color: iconColor, size: 18),
                ),
                const SizedBox(width: 12),
                Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      title,
                      style: const TextStyle(
                        fontWeight: FontWeight.bold,
                        fontSize: 15,
                      ),
                    ),
                    Text(
                      subtitle,
                      style: TextStyle(
                        fontSize: 12,
                        color: Theme.of(context).colorScheme.onSurfaceVariant,
                      ),
                    ),
                  ],
                ),
              ],
            ),
            const SizedBox(height: 24),
            Center(
              child: Icon(
                icon,
                size: 40,
                color: Theme.of(
                  context,
                ).colorScheme.onSurfaceVariant.withOpacity(0.3),
              ),
            ),
            const SizedBox(height: 8),
            Center(
              child: Text(
                'No data yet',
                style: TextStyle(
                  fontSize: 13,
                  color: Theme.of(context).colorScheme.onSurfaceVariant,
                ),
              ),
            ),
            const SizedBox(height: 16),
          ],
        ),
      ),
    );
  }
}
