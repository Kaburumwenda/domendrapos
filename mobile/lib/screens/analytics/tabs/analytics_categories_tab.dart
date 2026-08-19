/// Analytics Categories tab — category performance, revenue distribution,
/// stock value by category, and dead stock.

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:fl_chart/fl_chart.dart';

import '../../../core/formatters.dart';
import '../../../providers/analytics_providers.dart';
import '../../../providers/auth_provider.dart';
import '../../../widgets/common.dart';

class AnalyticsCategoriesTab extends ConsumerWidget {
  final AnalyticsPeriod period;
  const AnalyticsCategoriesTab({super.key, required this.period});

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
        child: _CategoriesBody(data: data, currency: currency),
      ),
    );
  }
}

class _CategoriesBody extends StatelessWidget {
  final AnalyticsData data;
  final String currency;
  const _CategoriesBody({required this.data, required this.currency});

  static const _palette = [
    Color(0xFF6366f1), Color(0xFF8b5cf6), Color(0xFFec4899),
    Color(0xFFf59e0b), Color(0xFF14b8a6), Color(0xFF3b82f6),
    Color(0xFFf97316), Color(0xFF06b6d4), Color(0xFFa855f7), Color(0xFFef4444),
  ];

  @override
  Widget build(BuildContext context) {
    final totalRev = data.categoryStats.fold<double>(0, (s, c) => s + c.revenue);

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
                _kpi(Icons.category, Formatters.number(data.totalCategories), 'Total Categories', const Color(0xFF3b82f6)),
                _kpi(Icons.monetization_on, '${currency}${Formatters.number(totalRev.toInt())}', 'Total Revenue', const Color(0xFF14b8a6)),
                _kpi(Icons.emoji_events, data.topCategory ?? '—', 'Top Category', const Color(0xFF6366f1), subtitle: '${currency}${Formatters.number(data.topCategoryRevenue.toInt())}'),
                _kpi(Icons.inventory, '${currency}${Formatters.number(data.categoryStats.fold(0.0, (s, c) => s + c.stockValue).toInt())}', 'Stock Value', const Color(0xFFf59e0b)),
                _kpi(Icons.delete_outline, '${currency}${Formatters.number(data.categoryDeadStockValue.toInt())}', 'Dead Stock Value', const Color(0xFFef4444)),
                _kpi(Icons.trending_up, '${currency}${Formatters.number((data.totalCategories > 0 ? totalRev / data.totalCategories : 0.0).toInt())}', 'Avg Rev/Category', const Color(0xFF8b5cf6)),
              ],
            ),
          ),
          const SizedBox(height: 16),
          // Revenue distribution donut
          if (data.categoryRevenue.isNotEmpty) ...[
            _card('Revenue Distribution', Icons.pie_chart_outline, const Color(0xFF8b5cf6), _RevenueDonut(items: data.categoryRevenue, currency: currency)),
            const SizedBox(height: 16),
          ],
          // Revenue by category bars
          if (data.categoryStats.isNotEmpty) ...[
            _card('Revenue by Category', Icons.bar_chart, const Color(0xFF3b82f6), _CategoryBars(stats: data.categoryStats, currency: currency, mode: _BarMode.revenue)),
            const SizedBox(height: 16),
          ],
          // Category performance table
          if (data.categoryStats.isNotEmpty) ...[
            _card('Category Performance', Icons.table_chart, const Color(0xFF14b8a6), _CategoryTable(stats: data.categoryStats, currency: currency)),
            const SizedBox(height: 16),
          ],
          // Stock value by category
          if (data.categoryStats.any((c) => c.stockValue > 0)) ...[
            _card('Stock Value by Category', Icons.inventory_2, const Color(0xFFf59e0b), _CategoryBars(stats: data.categoryStats, currency: currency, mode: _BarMode.stock)),
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

enum _BarMode { revenue, stock }

class _RevenueDonut extends StatelessWidget {
  final List<NameValue> items;
  final String currency;
  const _RevenueDonut({required this.items, required this.currency});

  static const _palette = [
    Color(0xFF8b5cf6), Color(0xFF6366f1), Color(0xFF14b8a6),
    Color(0xFFf59e0b), Color(0xFFec4899), Color(0xFF06b6d4),
  ];

  @override
  Widget build(BuildContext context) {
    final total = items.fold<double>(0, (s, e) => s + e.value);
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
                  return PieChartSectionData(value: e.value, color: _palette[i % _palette.length], title: '${pct.round()}%', radius: 46, titleStyle: const TextStyle(fontSize: 10, color: Colors.white, fontWeight: FontWeight.bold));
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

class _CategoryBars extends StatelessWidget {
  final List<CategoryStat> stats;
  final String currency;
  final _BarMode mode;
  const _CategoryBars({required this.stats, required this.currency, required this.mode});

  static const _colors = [
    Color(0xFF6366f1), Color(0xFF8b5cf6), Color(0xFFa855f7), Color(0xFFec4899),
    Color(0xFFf43f5e), Color(0xFFf97316), Color(0xFFf59e0b), Color(0xFF14b8a6),
    Color(0xFF06b6d4), Color(0xFF3b82f6),
  ];

  @override
  Widget build(BuildContext context) {
    final values = stats.map((s) => mode == _BarMode.revenue ? s.revenue : s.stockValue).toList();
    final maxV = values.fold<double>(0, (a, e) => e > a ? e : a);
    return Column(
      children: List.generate(stats.length, (i) {
        final v = values[i];
        final pct = maxV > 0 ? v / maxV : 0.0;
        final color = _colors[i % _colors.length];
        return Padding(
          padding: EdgeInsets.only(bottom: i == stats.length - 1 ? 0 : 8),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(children: [
                Expanded(child: Text(stats[i].category, style: const TextStyle(fontSize: 11), maxLines: 1, overflow: TextOverflow.ellipsis)),
                Text('${currency}${Formatters.number(v.toInt())}', style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w600)),
              ]),
              const SizedBox(height: 4),
              ClipRRect(
                borderRadius: BorderRadius.circular(4),
                child: SizedBox(height: 10, child: FractionallySizedBox(alignment: Alignment.centerLeft, widthFactor: pct.clamp(0.02, 1.0), child: Container(color: color))),
              ),
            ],
          ),
        );
      }),
    );
  }
}

class _CategoryTable extends StatelessWidget {
  final List<CategoryStat> stats;
  final String currency;
  const _CategoryTable({required this.stats, required this.currency});

  @override
  Widget build(BuildContext context) {
    return Column(
      children: stats.map((c) => ListTile(
            dense: true,
            contentPadding: const EdgeInsets.symmetric(horizontal: 4),
            leading: CircleAvatar(radius: 14, backgroundColor: const Color(0xFF14b8a6).withOpacity(0.15), child: Text(c.category.isNotEmpty ? c.category[0].toUpperCase() : '?', style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold))),
            title: Text(c.category, maxLines: 1, overflow: TextOverflow.ellipsis, style: const TextStyle(fontSize: 13)),
            subtitle: Text('${c.productCount} products • ${Formatters.number(c.qty.toInt())} sold • ${c.sharePct.toStringAsFixed(1)}%', style: const TextStyle(fontSize: 11), maxLines: 1, overflow: TextOverflow.ellipsis),
            trailing: Column(
              crossAxisAlignment: CrossAxisAlignment.end,
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Text('${currency}${Formatters.number(c.revenue.toInt())}', style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13)),
                Text('stock ${currency}${Formatters.number(c.stockValue.toInt())}', style: const TextStyle(fontSize: 10, color: Colors.grey)),
              ],
            ),
          )).toList(),
    );
  }
}
