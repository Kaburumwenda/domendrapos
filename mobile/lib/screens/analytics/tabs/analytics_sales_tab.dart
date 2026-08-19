/// Analytics Sales tab — sales KPIs, transactions list (search + status
/// filter), and sales analytics charts. Mirrors the web's `/sales` page.

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:fl_chart/fl_chart.dart';

import '../../../core/formatters.dart';
import '../../../providers/analytics_providers.dart';
import '../../../providers/auth_provider.dart';
import '../../../widgets/common.dart';

class AnalyticsSalesTab extends ConsumerStatefulWidget {
  final AnalyticsPeriod period;
  const AnalyticsSalesTab({super.key, required this.period});

  @override
  ConsumerState<AnalyticsSalesTab> createState() => _AnalyticsSalesTabState();
}

class _AnalyticsSalesTabState extends ConsumerState<AnalyticsSalesTab>
    with SingleTickerProviderStateMixin {
  late TabController _subTabController;
  String _search = '';
  String _statusFilter = 'all';

  static const _subTabs = [
    Tab(icon: Icon(Icons.receipt_long_outlined), text: 'Transactions'),
    Tab(icon: Icon(Icons.insights_outlined), text: 'Analytics'),
  ];

  @override
  void initState() {
    super.initState();
    _subTabController = TabController(length: 2, vsync: this);
  }

  @override
  void dispose() {
    _subTabController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final auth = ref.watch(authProvider);
    final currency = auth.billing?.currency ?? 'KSh';
    final dataAsync = ref.watch(salesDataProvider(widget.period));

    return dataAsync.when(
      loading: () => const LoadingWidget(),
      error: (e, _) => ErrorStateWidget(
        message: 'Failed to load sales',
        onRetry: () => ref.invalidate(salesDataProvider(widget.period)),
      ),
      data: (data) => Column(
        children: [
          // KPI row (horizontal scroll)
          SizedBox(
            height: 100,
            child: ListView(
              scrollDirection: Axis.horizontal,
              children: [
                _kpi(Icons.receipt_long, Formatters.number(data.totalSales), 'Total Sales', const Color(0xFF3b82f6), subtitle: '${data.completedCount} completed'),
                _kpi(Icons.monetization_on, '$currency${Formatters.number(data.totalRevenue.toInt())}', 'Total Revenue', const Color(0xFF14b8a6), subtitle: 'Avg $currency${Formatters.number(data.avgSale.toInt())}'),
                _kpi(Icons.trending_up, '$currency${Formatters.number(data.avgSale.toInt())}', 'Avg Sale Value', const Color(0xFF8b5cf6), subtitle: data.totalDiscount > 0 ? 'Discount $currency${Formatters.number(data.totalDiscount.toInt())}' : 'No discounts'),
                _kpi(Icons.inventory, Formatters.number(data.totalItems), 'Items Sold', const Color(0xFFf59e0b), subtitle: '${data.uniqueProducts} unique'),
              ],
            ),
          ),
          const SizedBox(height: 8),
          // Sub-tabs
          TabBar(
            controller: _subTabController,
            tabs: _subTabs,
            isScrollable: true,
            tabAlignment: TabAlignment.start,
            indicatorSize: TabBarIndicatorSize.label,
          ),
          Expanded(
            child: TabBarView(
              controller: _subTabController,
              children: [
                _TransactionsView(
                  data: data,
                  currency: currency,
                  search: _search,
                  statusFilter: _statusFilter,
                  onSearch: (v) => setState(() => _search = v),
                  onStatus: (v) => setState(() => _statusFilter = v),
                ),
                _SalesAnalyticsView(data: data, currency: currency),
              ],
            ),
          ),
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
          if (subtitle != null) Text(subtitle, style: TextStyle(fontSize: 9, color: color, fontWeight: FontWeight.w600), maxLines: 1, overflow: TextOverflow.ellipsis),
        ],
      ),
    );
  }
}

// ── Transactions view ─────────────────────────────────────────────

class _TransactionsView extends StatelessWidget {
  final SalesData data;
  final String currency;
  final String search;
  final String statusFilter;
  final ValueChanged<String> onSearch;
  final ValueChanged<String> onStatus;
  const _TransactionsView({
    required this.data,
    required this.currency,
    required this.search,
    required this.statusFilter,
    required this.onSearch,
    required this.onStatus,
  });

  static const _statusColors = {
    'completed': Colors.green,
    'pending': Colors.orange,
    'voided': Colors.red,
    'refunded': Colors.blue,
    'on_hold': Colors.grey,
  };

  @override
  Widget build(BuildContext context) {
    final filtered = data.transactions.where((t) {
      if (statusFilter != 'all' && (t['status'] ?? '') != statusFilter) return false;
      if (search.isNotEmpty) {
        final q = search.toLowerCase();
        final hay =
            '${t['transaction_number']} ${t['customer_name']} ${t['cashier_name']}'.toLowerCase();
        if (!hay.contains(q)) return false;
      }
      return true;
    }).toList();

    return Column(
      children: [
        Padding(
          padding: const EdgeInsets.fromLTRB(12, 8, 12, 4),
          child: Row(
            children: [
              Expanded(
                child: TextField(
                  decoration: const InputDecoration(
                    hintText: 'Search #, customer, cashier...',
                    prefixIcon: Icon(Icons.search, size: 20),
                    isDense: true,
                    border: OutlineInputBorder(),
                  ),
                  onChanged: onSearch,
                ),
              ),
              const SizedBox(width: 8),
              DropdownButton<String>(
                value: statusFilter,
                items: const [
                  DropdownMenuItem(value: 'all', child: Text('All')),
                  DropdownMenuItem(value: 'completed', child: Text('Completed')),
                  DropdownMenuItem(value: 'pending', child: Text('Pending')),
                  DropdownMenuItem(value: 'voided', child: Text('Voided')),
                  DropdownMenuItem(value: 'refunded', child: Text('Refunded')),
                  DropdownMenuItem(value: 'on_hold', child: Text('On hold')),
                ],
                onChanged: (v) => onStatus(v ?? 'all'),
              ),
            ],
          ),
        ),
        Expanded(
          child: filtered.isEmpty
              ? const EmptyState(
                  icon: Icons.receipt_long_outlined,
                  title: 'No sales found',
                  message: 'Try adjusting your filters or period.',
                )
              : ListView.builder(
                  padding: const EdgeInsets.symmetric(horizontal: 12),
                  itemCount: filtered.length,
                  itemBuilder: (context, index) {
                    final t = filtered[index];
                    final status = t['status']?.toString() ?? '';
                    final color = _statusColors[status] ?? Colors.grey;
                    final total = Formatters.toDouble(t['total'] ?? 0);
                    final customer = (t['customer_name']?.toString().isNotEmpty == true)
                        ? t['customer_name']
                        : 'Walk-in';
                    return Card(
                      margin: const EdgeInsets.symmetric(vertical: 3),
                      child: ListTile(
                        leading: Container(
                          width: 40,
                          height: 40,
                          decoration: BoxDecoration(
                            color: color.withOpacity(0.15),
                            borderRadius: BorderRadius.circular(10),
                          ),
                          child: Icon(Icons.receipt_outlined, color: color, size: 20),
                        ),
                        title: Text(
                          t['transaction_number']?.toString() ?? '',
                          style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13),
                        ),
                        subtitle: Text(
                          '$customer • ${t['cashier_name'] ?? '—'} • ${t['payment_method_display'] ?? t['payment_method'] ?? 'cash'}',
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                          style: const TextStyle(fontSize: 11),
                        ),
                        trailing: Column(
                          crossAxisAlignment: CrossAxisAlignment.end,
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            Text('$currency${Formatters.number(total.toInt())}',
                                style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14)),
                            const SizedBox(height: 2),
                            Container(
                              padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                              decoration: BoxDecoration(
                                color: color.withOpacity(0.15),
                                borderRadius: BorderRadius.circular(6),
                              ),
                              child: Text(
                                t['status_display']?.toString() ?? status,
                                style: TextStyle(color: color, fontSize: 10, fontWeight: FontWeight.bold),
                              ),
                            ),
                          ],
                        ),
                      ),
                    );
                  },
                ),
        ),
      ],
    );
  }
}

// ── Analytics view ─────────────────────────────────────────────────

class _SalesAnalyticsView extends StatelessWidget {
  final SalesData data;
  final String currency;
  const _SalesAnalyticsView({required this.data, required this.currency});

  static const _palette = [
    Color(0xFF6366f1), Color(0xFF8b5cf6), Color(0xFFec4899),
    Color(0xFFf59e0b), Color(0xFF14b8a6), Color(0xFF3b82f6),
    Color(0xFFf97316), Color(0xFF06b6d4), Color(0xFFa855f7), Color(0xFFef4444),
  ];

  @override
  Widget build(BuildContext context) {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(12),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Revenue trend
          if (data.revenueSeries.length >= 2) ...[
            _card('Revenue Trend', Icons.show_chart, const Color(0xFF3b82f6), _RevenueTrend(series: data.revenueSeries)),
            const SizedBox(height: 16),
          ],
          // Payment methods
          if (data.paymentMethods.isNotEmpty) ...[
            _card('Payment Methods', Icons.payments, const Color(0xFFf59e0b), _Donut(items: data.paymentMethods, currency: currency)),
            const SizedBox(height: 16),
          ],
          // Top products
          if (data.topProducts.isNotEmpty) ...[
            _card('Top 10 Products', Icons.emoji_events, const Color(0xFF6366f1), _Bars(items: data.topProducts, currency: currency)),
            const SizedBox(height: 16),
          ],
          // Status breakdown
          if (data.statusBreakdown.isNotEmpty) ...[
            _card('Sales by Status', Icons.pie_chart_outline, const Color(0xFFec4899), _Donut(items: data.statusBreakdown, currency: currency, valueSuffix: ' txns')),
            const SizedBox(height: 16),
          ],
          // Day of week
          if (data.weekday.any((w) => w > 0)) ...[
            _card('Sales by Day of Week (avg)', Icons.calendar_view_week, const Color(0xFF8b5cf6), _WeekdayBars(weekday: data.weekday)),
            const SizedBox(height: 16),
          ],
          // Peak hours
          if (data.hourly.any((h) => h > 0)) ...[
            _card('Peak Hours', Icons.schedule, const Color(0xFFf97316), _HourlyBars(hourly: data.hourly)),
            const SizedBox(height: 16),
          ],
          // Cashier performance
          if (data.cashiers.isNotEmpty) ...[
            _card('Cashier Performance', Icons.people, const Color(0xFFa855f7), _CashierTable(cashiers: data.cashiers, currency: currency)),
          ],
          const SizedBox(height: 24),
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
  const _RevenueTrend({required this.series});

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
          gridData: const FlGridData(show: false),
          titlesData: const FlTitlesData(show: false),
          lineBarsData: [
            LineChartBarData(
              spots: series.asMap().entries.map((e) => FlSpot(e.key.toDouble(), e.value.revenue)).toList(),
              isCurved: true,
              color: const Color(0xFF3b82f6),
              barWidth: 2.5,
              isStrokeCapRound: true,
              dotData: const FlDotData(show: false),
              belowBarData: BarAreaData(show: true, color: const Color(0xFF3b82f6).withOpacity(0.12)),
            ),
          ],
        ),
      ),
    );
  }
}

class _Donut extends StatelessWidget {
  final List<NameValue> items;
  final String currency;
  final String valueSuffix;
  const _Donut({required this.items, required this.currency, this.valueSuffix = ''});

  static const _palette = [
    Color(0xFF6366f1), Color(0xFF8b5cf6), Color(0xFFec4899),
    Color(0xFFf59e0b), Color(0xFF14b8a6), Color(0xFF3b82f6),
    Color(0xFFf97316), Color(0xFF06b6d4), Color(0xFFa855f7), Color(0xFFef4444),
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
                final val = valueSuffix.isEmpty
                    ? '$currency${Formatters.number(e.value.toInt())}'
                    : '${e.value.toInt()}$valueSuffix';
                return Padding(
                  padding: const EdgeInsets.symmetric(vertical: 1),
                  child: Row(children: [
                    Container(width: 10, height: 10, decoration: BoxDecoration(color: _palette[i % _palette.length], borderRadius: BorderRadius.circular(3))),
                    const SizedBox(width: 6),
                    Expanded(child: Text(e.name, style: const TextStyle(fontSize: 11), maxLines: 1, overflow: TextOverflow.ellipsis)),
                    Text(val, style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w600)),
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

class _Bars extends StatelessWidget {
  final List<NameValue> items;
  final String currency;
  const _Bars({required this.items, required this.currency});

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
                Text('$currency${Formatters.number(items[i].value.toInt())}', style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w600)),
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
                    decoration: BoxDecoration(color: const Color(0xFF8b5cf6).withOpacity(0.8), borderRadius: BorderRadius.circular(4)),
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
                  decoration: BoxDecoration(color: const Color(0xFFf97316).withOpacity(0.7), borderRadius: BorderRadius.circular(3)),
                ),
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
            contentPadding: const EdgeInsets.symmetric(horizontal: 4),
            leading: CircleAvatar(radius: 14, backgroundColor: const Color(0xFFa855f7).withOpacity(0.15), child: Text(c.name.isNotEmpty ? c.name[0].toUpperCase() : '?', style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold))),
            title: Text(c.name, maxLines: 1, overflow: TextOverflow.ellipsis, style: const TextStyle(fontSize: 13)),
            subtitle: Text('${c.count} txns • ${c.items} items • ${c.sharePct.toStringAsFixed(1)}%', style: const TextStyle(fontSize: 11)),
            trailing: Text('$currency${Formatters.number(c.revenue.toInt())}', style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13)),
          )).toList(),
    );
  }
}
