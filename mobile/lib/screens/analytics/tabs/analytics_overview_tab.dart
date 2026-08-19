/// Analytics Overview tab — KPIs, revenue trend, payment methods, top
/// products, category breakdown, hourly/weekday patterns, cashier
/// performance, and recent transactions.

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:fl_chart/fl_chart.dart';

import '../../../core/formatters.dart';
import '../../../providers/analytics_providers.dart';
import '../../../providers/auth_provider.dart';
import '../../../widgets/common.dart';

class AnalyticsOverviewTab extends ConsumerWidget {
  final AnalyticsPeriod period;
  const AnalyticsOverviewTab({super.key, required this.period});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final auth = ref.watch(authProvider);
    final currency = auth.billing?.currency ?? 'KSh';
    final dataAsync = ref.watch(analyticsDataProvider(period));

    return dataAsync.when(
      loading: () => const LoadingWidget(),
      error: (e, _) => ErrorStateWidget(
        message: 'Failed to load analytics',
        onRetry: () => ref.invalidate(analyticsDataProvider(period)),
      ),
      data: (data) => RefreshIndicator(
        onRefresh: () async => ref.invalidate(analyticsDataProvider(period)),
        child: _OverviewBody(data: data, currency: currency),
      ),
    );
  }
}

class _OverviewBody extends StatelessWidget {
  final AnalyticsData data;
  final String currency;
  const _OverviewBody({required this.data, required this.currency});

  static const _palette = [
    Color(0xFF6366f1), Color(0xFF8b5cf6), Color(0xFFec4899),
    Color(0xFFf59e0b), Color(0xFF14b8a6), Color(0xFF3b82f6),
    Color(0xFFf97316), Color(0xFF06b6d4), Color(0xFFa855f7), Color(0xFFef4444),
  ];

  @override
  Widget build(BuildContext context) {
    final scheme = Theme.of(context).colorScheme;
    return SingleChildScrollView(
      padding: const EdgeInsets.all(12),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // KPI row (horizontal scroll)
          SizedBox(
            height: 100,
            child: ListView(
              scrollDirection: Axis.horizontal,
              children: [
                _kpi(Icons.monetization_on, '${currency}${Formatters.number(data.revenue.toInt())}', 'Revenue', const Color(0xFF14b8a6), subtitle: '${data.revGrowth >= 0 ? "+" : ""}${data.revGrowth.toStringAsFixed(1)}%'),
                _kpi(Icons.receipt_long, Formatters.number(data.txCount), 'Transactions', const Color(0xFF3b82f6)),
                _kpi(Icons.shopping_cart, Formatters.number(data.itemsSold), 'Items Sold', const Color(0xFF8b5cf6)),
                _kpi(Icons.trending_up, '${currency}${Formatters.number(data.aov.toInt())}', 'Avg Order', const Color(0xFFf59e0b)),
                _kpi(Icons.savings, '${currency}${Formatters.number(data.grossProfit.toInt())}', 'Gross Profit', const Color(0xFF6366f1), subtitle: '${data.grossMarginPct.toStringAsFixed(1)}% margin'),
                _kpi(Icons.inventory, '${currency}${Formatters.number(data.stockValue.toInt())}', 'Stock Value', const Color(0xFFec4899)),
              ],
            ),
          ),
          const SizedBox(height: 16),
          // Empty state when no transactions in range
          if (data.txCount == 0) ...[
            Card(
              child: Padding(
                padding: const EdgeInsets.all(24),
                child: EmptyState(
                  icon: Icons.bar_chart,
                  title: 'No sales in this period',
                  message: 'Try selecting a different period, or record a sale to see analytics.',
                ),
              ),
            ),
            const SizedBox(height: 24),
          ] else ...[
          // Revenue trend
          if (data.revenueSeries.length >= 2) ...[
            _card('Revenue Trend', Icons.show_chart, const Color(0xFF3b82f6), _RevenueTrend(series: data.revenueSeries, currency: currency)),
            const SizedBox(height: 16),
          ],
          // Payment methods
          if (data.paymentMethods.isNotEmpty) ...[
            _card('Payment Methods', Icons.payments, const Color(0xFFf59e0b), _PaymentDonut(items: data.paymentMethods, currency: currency)),
            const SizedBox(height: 16),
          ],
          // Top products
          if (data.topProducts.isNotEmpty) ...[
            _card('Top 10 Products', Icons.emoji_events, const Color(0xFF6366f1), _HorizontalBars(items: data.topProducts, currency: currency)),
            const SizedBox(height: 16),
          ],
          // Sales by category
          if (data.categoryRevenue.isNotEmpty) ...[
            _card('Sales by Category', Icons.category, const Color(0xFF8b5cf6), _CategoryDonut(items: data.categoryRevenue, currency: currency)),
            const SizedBox(height: 16),
          ],
          // Hourly pattern
          if (data.hourly.any((h) => h > 0)) ...[
            _card('Hourly Sales Pattern', Icons.schedule, const Color(0xFF06b6d4), _HourlyBars(hourly: data.hourly)),
            const SizedBox(height: 16),
          ],
          // Weekday
          if (data.weekday.any((w) => w > 0)) ...[
            _card('Sales by Weekday (avg)', Icons.calendar_view_week, const Color(0xFF14b8a6), _WeekdayBars(weekday: data.weekday)),
            const SizedBox(height: 16),
          ],
          // Cashier performance
          if (data.cashiers.isNotEmpty) ...[
            _card('Cashier Performance', Icons.people, const Color(0xFFa855f7), _CashierTable(cashiers: data.cashiers, currency: currency)),
            const SizedBox(height: 16),
          ],
          // Recent transactions
          if (data.recentTransactions.isNotEmpty) ...[
            _card('Recent Transactions', Icons.history, const Color(0xFF64748b), _RecentList(txns: data.recentTransactions, currency: currency)),
          ],
          ],
          const SizedBox(height: 24),
        ],
      ),
    );
  }

  Widget _kpi(IconData icon, String value, String label, Color color, {String? subtitle}) {
    return Container(
      width: 140,
      margin: const EdgeInsets.only(right: 10),
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: color.withOpacity(0.10),
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: color.withOpacity(0.25)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Icon(icon, color: color, size: 20),
          const Spacer(),
          Text(value, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16), maxLines: 1, overflow: TextOverflow.ellipsis),
          Text(label, style: const TextStyle(fontSize: 11, color: Colors.grey), maxLines: 1, overflow: TextOverflow.ellipsis),
          if (subtitle != null) Text(subtitle, style: TextStyle(fontSize: 10, color: color, fontWeight: FontWeight.w600)),
        ],
      ),
    );
  }

  Widget _card(String title, IconData icon, Color color, Widget child) {
    return Card(
      elevation: 2,
      child: Padding(
        padding: const EdgeInsets.all(14),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(children: [
              Container(padding: const EdgeInsets.all(8), decoration: BoxDecoration(color: color.withOpacity(0.12), borderRadius: BorderRadius.circular(10)), child: Icon(icon, color: color, size: 18)),
              const SizedBox(width: 10),
              Text(title, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14)),
            ]),
            const SizedBox(height: 12),
            child,
          ],
        ),
      ),
    );
  }
}

class _RevenueTrend extends StatelessWidget {
  final List<RevenuePoint> series;
  final String currency;
  const _RevenueTrend({required this.series, required this.currency});

  @override
  Widget build(BuildContext context) {
    if (series.length < 2) return const Text('Not enough data');
    final maxV = series.fold<double>(0, (a, e) => e.revenue > a ? e.revenue : a);
    if (maxV == 0) return const Text('No revenue in this period');
    return SizedBox(
      height: 160,
      child: LineChart(
        LineChartData(
          minX: 0,
          maxX: (series.length - 1).toDouble(),
          minY: 0,
          maxY: maxV * 1.1,
          gridData: FlGridData(show: false),
          titlesData: FlTitlesData(
            leftTitles: const AxisTitles(sideTitles: SideTitles(showTitles: false)),
            rightTitles: const AxisTitles(sideTitles: SideTitles(showTitles: false)),
            topTitles: const AxisTitles(sideTitles: SideTitles(showTitles: false)),
            bottomTitles: AxisTitles(
              sideTitles: SideTitles(
                showTitles: true,
                interval: (series.length / 4).ceil().toDouble().clamp(1, double.infinity),
                getTitlesWidget: (v, _) {
                  final i = v.toInt();
                  if (i < 0 || i >= series.length) return const SizedBox.shrink();
                  final parts = series[i].date.split('-');
                  return Padding(
                    padding: const EdgeInsets.only(top: 4),
                    child: Text('${parts[1]}/${parts[2]}', style: const TextStyle(fontSize: 9)),
                  );
                },
              ),
            ),
          ),
          lineBarsData: [
            LineChartBarData(
              spots: series.asMap().entries.map((e) => FlSpot(e.key.toDouble(), e.value.revenue)).toList(),
              isCurved: true,
              color: const Color(0xFF3b82f6),
              barWidth: 2.5,
              isStrokeCapRound: true,
              dotData: FlDotData(show: false),
              belowBarData: BarAreaData(show: true, color: const Color(0xFF3b82f6).withOpacity(0.12)),
            ),
          ],
        ),
      ),
    );
  }
}

class _PaymentDonut extends StatelessWidget {
  final List<NameValue> items;
  final String currency;
  const _PaymentDonut({required this.items, required this.currency});

  static const _palette = [
    Color(0xFF6366f1), Color(0xFF8b5cf6), Color(0xFFec4899),
    Color(0xFFf59e0b), Color(0xFF14b8a6), Color(0xFF3b82f6),
  ];

  @override
  Widget build(BuildContext context) {
    final total = items.fold<double>(0, (s, e) => s + e.value);
    if (total <= 0) return const Text('No data');
    return SizedBox(
      height: 170,
      child: Row(
        children: [
          Expanded(
            child: PieChart(
              PieChartData(
                sections: List.generate(items.length, (i) {
                  final e = items[i];
                  final pct = total > 0 ? e.value / total * 100 : 0.0;
                  return PieChartSectionData(
                    value: e.value, color: _palette[i % _palette.length],
                    title: '${pct.round()}%', radius: 46,
                    titleStyle: const TextStyle(fontSize: 10, color: Colors.white, fontWeight: FontWeight.bold),
                  );
                }),
                centerSpaceRadius: 30,
              ),
            ),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: items.take(6).toList().asMap().entries.map((entry) {
                final i = entry.key;
                final e = entry.value;
                return Padding(
                  padding: const EdgeInsets.symmetric(vertical: 1),
                  child: Row(children: [
                    Container(width: 10, height: 10, decoration: BoxDecoration(color: _palette[i % _palette.length], borderRadius: BorderRadius.circular(3))),
                    const SizedBox(width: 6),
                    Expanded(child: Text(e.name, style: const TextStyle(fontSize: 11), maxLines: 1, overflow: TextOverflow.ellipsis)),
                    Text('$currency${Formatters.number(e.value.toInt())}', style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w600)),
                  ]),
                );
              }).toList(),
            ),
          ),
        ],
      ),
    );
  }
}

class _CategoryDonut extends StatelessWidget {
  final List<NameValue> items;
  final String currency;
  const _CategoryDonut({required this.items, required this.currency});

  static const _palette = [
    Color(0xFF8b5cf6), Color(0xFF6366f1), Color(0xFF14b8a6),
    Color(0xFFf59e0b), Color(0xFFec4899), Color(0xFF06b6d4),
  ];

  @override
  Widget build(BuildContext context) {
    final total = items.fold<double>(0, (s, e) => s + e.value);
    if (total <= 0) return const Text('No data');
    return SizedBox(
      height: 170,
      child: Row(
        children: [
          Expanded(
            child: PieChart(
              PieChartData(
                sections: List.generate(items.length, (i) {
                  final e = items[i];
                  final pct = total > 0 ? e.value / total * 100 : 0.0;
                  return PieChartSectionData(
                    value: e.value, color: _palette[i % _palette.length],
                    title: '${pct.round()}%', radius: 46,
                    titleStyle: const TextStyle(fontSize: 10, color: Colors.white, fontWeight: FontWeight.bold),
                  );
                }),
                centerSpaceRadius: 30,
              ),
            ),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: items.take(6).toList().asMap().entries.map((entry) {
                final i = entry.key;
                final e = entry.value;
                return Padding(
                  padding: const EdgeInsets.symmetric(vertical: 1),
                  child: Row(children: [
                    Container(width: 10, height: 10, decoration: BoxDecoration(color: _palette[i % _palette.length], borderRadius: BorderRadius.circular(3))),
                    const SizedBox(width: 6),
                    Expanded(child: Text(e.name, style: const TextStyle(fontSize: 11), maxLines: 1, overflow: TextOverflow.ellipsis)),
                    Text('${currency}${Formatters.number(e.value.toInt())}', style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w600)),
                  ]),
                );
              }).toList(),
            ),
          ),
        ],
      ),
    );
  }
}

class _HorizontalBars extends StatelessWidget {
  final List<NameValue> items;
  final String currency;
  const _HorizontalBars({required this.items, required this.currency});

  static const _colors = [
    Color(0xFF6366f1), Color(0xFF8b5cf6), Color(0xFFa855f7), Color(0xFFec4899),
    Color(0xFFf43f5e), Color(0xFFf97316), Color(0xFFf59e0b), Color(0xFF14b8a6),
    Color(0xFF06b6d4), Color(0xFF3b82f6),
  ];

  @override
  Widget build(BuildContext context) {
    final maxV = items.fold<double>(0, (a, e) => e.value > a ? e.value : a);
    return Column(
      children: List.generate(items.length, (i) {
        final color = _colors[i % _colors.length];
        final pct = maxV > 0 ? items[i].value / maxV : 0.0;
        return Padding(
          padding: EdgeInsets.only(bottom: i == items.length - 1 ? 0 : 8),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(children: [
                Expanded(child: Text('${i + 1}. ${items[i].name}', style: const TextStyle(fontSize: 11), maxLines: 1, overflow: TextOverflow.ellipsis)),
                Text('${currency}${Formatters.number(items[i].value.toInt())}', style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w600)),
              ]),
              const SizedBox(height: 4),
              ClipRRect(
                borderRadius: BorderRadius.circular(4),
                child: SizedBox(
                  height: 10,
                  child: FractionallySizedBox(
                    alignment: Alignment.centerLeft,
                    widthFactor: pct.clamp(0.02, 1.0),
                    child: Container(color: color),
                  ),
                ),
              ),
            ],
          ),
        );
      }),
    );
  }
}

class _HourlyBars extends StatelessWidget {
  final List<double> hourly;
  const _HourlyBars({required this.hourly});

  @override
  Widget build(BuildContext context) {
    final maxV = hourly.fold<double>(0, (a, e) => e > a ? e : a);
    if (maxV == 0) return const Text('No data');
    return SizedBox(
      height: 120,
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.end,
        children: List.generate(24, (i) {
          final h = (hourly[i] / maxV * 110).clamp(1.0, 110.0);
          return Expanded(
            child: Padding(
              padding: const EdgeInsets.symmetric(horizontal: 1.5),
              child: Align(
                alignment: Alignment.bottomCenter,
                child: Container(
                  height: h,
                  decoration: BoxDecoration(color: const Color(0xFF06b6d4).withOpacity(0.7), borderRadius: BorderRadius.circular(3)),
                ),
              ),
            ),
          );
        }),
      ),
    );
  }
}

class _WeekdayBars extends StatelessWidget {
  final List<double> weekday;
  const _WeekdayBars({required this.weekday});

  static const _labels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  @override
  Widget build(BuildContext context) {
    final maxV = weekday.fold<double>(0, (a, e) => e > a ? e : a);
    if (maxV == 0) return const Text('No data');
    return SizedBox(
      height: 130,
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.end,
        children: List.generate(7, (i) {
          final h = (weekday[i] / maxV * 100).clamp(1.0, 100.0);
          return Expanded(
            child: Padding(
              padding: const EdgeInsets.symmetric(horizontal: 4),
              child: Column(
                mainAxisAlignment: MainAxisAlignment.end,
                children: [
                  Container(
                    height: h,
                    decoration: BoxDecoration(color: const Color(0xFF14b8a6).withOpacity(0.8), borderRadius: BorderRadius.circular(4)),
                  ),
                  const SizedBox(height: 4),
                  Text(_labels[i], style: const TextStyle(fontSize: 10)),
                ],
              ),
            ),
          );
        }),
      ),
    );
  }
}

class _CashierTable extends StatelessWidget {
  final List<CashierStat> cashiers;
  final String currency;
  const _CashierTable({required this.cashiers, required this.currency});

  @override
  Widget build(BuildContext context) {
    return Column(
      children: cashiers.map((c) => ListTile(
            dense: true,
            contentPadding: EdgeInsets.zero,
            leading: CircleAvatar(radius: 14, backgroundColor: const Color(0xFFa855f7).withOpacity(0.15), child: Text(c.name.isNotEmpty ? c.name[0].toUpperCase() : '?', style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold))),
            title: Text(c.name, maxLines: 1, overflow: TextOverflow.ellipsis, style: const TextStyle(fontSize: 13)),
            subtitle: Text('${c.count} txns • ${c.items} items • ${c.sharePct.toStringAsFixed(1)}%', style: const TextStyle(fontSize: 11)),
            trailing: Text('${currency}${Formatters.number(c.revenue.toInt())}', style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13)),
          )).toList(),
    );
  }
}

class _RecentList extends StatelessWidget {
  final List<Map<String, dynamic>> txns;
  final String currency;
  const _RecentList({required this.txns, required this.currency});

  @override
  Widget build(BuildContext context) {
    return Column(
      children: txns.map((t) {
        final num = t['transaction_number']?.toString() ?? '';
        final cashier = t['cashier_name']?.toString() ?? '';
        final customer = t['customer_name']?.toString().isNotEmpty == true ? t['customer_name'] : 'Walk-in';
        final method = t['payment_method_display'] ?? t['payment_method'] ?? 'cash';
        final total = Formatters.toDouble(t['total'] ?? 0);
        final status = t['status_display']?.toString() ?? t['status']?.toString() ?? '';
        return ListTile(
          dense: true,
          contentPadding: const EdgeInsets.symmetric(horizontal: 4),
          leading: const Icon(Icons.receipt_outlined, size: 20, color: Color(0xFF64748b)),
          title: Text(num.isEmpty ? '#' : num, style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w600)),
          subtitle: Text('$cashier • $customer • $method', style: const TextStyle(fontSize: 11), maxLines: 1, overflow: TextOverflow.ellipsis),
          trailing: Column(
            crossAxisAlignment: CrossAxisAlignment.end,
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Text('${currency}${Formatters.number(total.toInt())}', style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13)),
              if (status.isNotEmpty) Text(status, style: const TextStyle(fontSize: 10, color: Colors.grey)),
            ],
          ),
        );
      }).toList(),
    );
  }
}
