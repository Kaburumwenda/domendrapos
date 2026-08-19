/// Analytics Products tab — ABC classification, top products, slow moving,
/// never sold, and dead stock analysis.

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:fl_chart/fl_chart.dart';

import '../../../core/formatters.dart';
import '../../../providers/analytics_providers.dart';
import '../../../providers/auth_provider.dart';
import '../../../widgets/common.dart';

class AnalyticsProductsTab extends ConsumerWidget {
  final AnalyticsPeriod period;
  const AnalyticsProductsTab({super.key, required this.period});

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
        child: _ProductsBody(data: data, currency: currency),
      ),
    );
  }
}

class _ProductsBody extends StatelessWidget {
  final AnalyticsData data;
  final String currency;
  const _ProductsBody({required this.data, required this.currency});

  @override
  Widget build(BuildContext context) {
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
                _kpi(Icons.inventory_2, Formatters.number(data.totalProducts), 'Total Products', const Color(0xFF3b82f6)),
                _kpi(Icons.sell, Formatters.number(data.productsSold), 'Products Sold', const Color(0xFF14b8a6)),
                _kpi(Icons.block, Formatters.number(data.neverSoldCount), 'Never Sold', const Color(0xFFec4899)),
                _kpi(Icons.trending_up, '${currency}${Formatters.number(data.avgRevenuePerProduct.toInt())}', 'Avg Rev/Product', const Color(0xFFf59e0b)),
                _kpi(Icons.delete_outline, '${currency}${Formatters.number(data.deadStockValue.toInt())}', 'Dead Stock Value', const Color(0xFFef4444)),
                _kpi(Icons.emoji_events, '${currency}${Formatters.number(data.topProductRevenue.toInt())}', 'Top Product Rev', const Color(0xFF6366f1), subtitle: '${data.topPct.toStringAsFixed(1)}% of revenue'),
              ],
            ),
          ),
          const SizedBox(height: 16),
          // ABC donut
          if (data.abcCounts.values.any((v) => v > 0)) ...[
            _card('ABC Classification', Icons.grade, const Color(0xFFf59e0b), _AbcDonut(counts: data.abcCounts)),
            const SizedBox(height: 16),
          ],
          // Top 20 products
          if (data.top20.isNotEmpty) ...[
            _card('Top 20 Products by Revenue', Icons.emoji_events, const Color(0xFF6366f1), _RankList(ranks: data.top20, currency: currency)),
            const SizedBox(height: 16),
          ],
          // Slow moving
          if (data.slowMoving.isNotEmpty) ...[
            _card('Slow Moving (>30 days)', Icons.slow_motion_video, const Color(0xFFf97316), _SlowList(items: data.slowMoving, currency: currency)),
            const SizedBox(height: 16),
          ],
          // Never sold
          if (data.neverSold.isNotEmpty) ...[
            _card('Never Sold', Icons.block, const Color(0xFFec4899), _NeverSoldList(items: data.neverSold, currency: currency)),
            const SizedBox(height: 16),
          ],
          // Dead stock
          if (data.deadStock.isNotEmpty) ...[
            _card('Dead Stock (in stock, never sold)', Icons.delete_outline, const Color(0xFFef4444), _DeadStockList(items: data.deadStock, currency: currency)),
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

class _AbcDonut extends StatelessWidget {
  final Map<String, int> counts;
  const _AbcDonut({required this.counts});

  @override
  Widget build(BuildContext context) {
    final total = counts.values.fold(0, (a, b) => a + b);
    if (total == 0) return const Text('No data');
    return SizedBox(
      height: 160,
      child: Row(
        children: [
          Expanded(
            child: PieChart(
              PieChartData(
                sections: [
                  PieChartSectionData(value: (counts['A'] ?? 0).toDouble(), color: const Color(0xFF14b8a6), title: 'A', radius: 46, titleStyle: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 14)),
                  PieChartSectionData(value: (counts['B'] ?? 0).toDouble(), color: const Color(0xFFf59e0b), title: 'B', radius: 46, titleStyle: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 14)),
                  PieChartSectionData(value: (counts['C'] ?? 0).toDouble(), color: const Color(0xFFef4444), title: 'C', radius: 46, titleStyle: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 14)),
                ],
                centerSpaceRadius: 30,
              ),
            ),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                _row(Colors.green, 'A (≤80%)', counts['A'] ?? 0),
                _row(Colors.orange, 'B (≤95%)', counts['B'] ?? 0),
                _row(Colors.red, 'C (rest)', counts['C'] ?? 0),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _row(Color c, String label, int count) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 2),
      child: Row(children: [
        Container(width: 10, height: 10, decoration: BoxDecoration(color: c, borderRadius: BorderRadius.circular(3))),
        const SizedBox(width: 6),
        Expanded(child: Text(label, style: const TextStyle(fontSize: 11))),
        Text('$count', style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold)),
      ]),
    );
  }
}

class _RankList extends StatelessWidget {
  final List<ProductRank> ranks;
  final String currency;
  const _RankList({required this.ranks, required this.currency});

  static final _classColor = {'A': Colors.green, 'B': Colors.orange, 'C': Colors.red};

  @override
  Widget build(BuildContext context) {
    return Column(
      children: ranks.map((r) => ListTile(
            dense: true,
            contentPadding: const EdgeInsets.symmetric(horizontal: 4),
            leading: CircleAvatar(
              radius: 14,
              backgroundColor: const Color(0xFF6366f1).withOpacity(0.15),
              child: Text('${r.rank}', style: const TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: Color(0xFF6366f1))),
            ),
            title: Text(r.name, maxLines: 1, overflow: TextOverflow.ellipsis, style: const TextStyle(fontSize: 13)),
            subtitle: Text('${r.sku} • ${Formatters.number(r.qty.toInt())} sold • avg ${currency}${Formatters.number(r.avgPrice.toInt())}', style: const TextStyle(fontSize: 11), maxLines: 1, overflow: TextOverflow.ellipsis),
            trailing: Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                Text('${currency}${Formatters.number(r.revenue.toInt())}', style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13)),
                const SizedBox(width: 8),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                  decoration: BoxDecoration(color: (_classColor[r.abcClass] ?? Colors.grey).withOpacity(0.15), borderRadius: BorderRadius.circular(5)),
                  child: Text(r.abcClass, style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: _classColor[r.abcClass] ?? Colors.grey)),
                ),
              ],
            ),
          )).toList(),
    );
  }
}

class _SlowList extends StatelessWidget {
  final List<SlowMoving> items;
  final String currency;
  const _SlowList({required this.items, required this.currency});

  @override
  Widget build(BuildContext context) {
    return Column(
      children: items.map((s) => ListTile(
            dense: true,
            contentPadding: const EdgeInsets.symmetric(horizontal: 4),
            leading: const Icon(Icons.slow_motion_video, size: 20, color: Color(0xFFf97316)),
            title: Text(s.name, maxLines: 1, overflow: TextOverflow.ellipsis, style: const TextStyle(fontSize: 13)),
            subtitle: Text('${s.sku} • ${s.daysIdle} days idle', style: const TextStyle(fontSize: 11)),
            trailing: Text('${currency}${Formatters.number(s.stockValue.toInt())}', style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w600)),
          )).toList(),
    );
  }
}

class _NeverSoldList extends StatelessWidget {
  final List<NeverSold> items;
  final String currency;
  const _NeverSoldList({required this.items, required this.currency});

  @override
  Widget build(BuildContext context) {
    return Column(
      children: items.map((s) => ListTile(
            dense: true,
            contentPadding: const EdgeInsets.symmetric(horizontal: 4),
            leading: const Icon(Icons.block, size: 20, color: Color(0xFFec4899)),
            title: Text(s.name, maxLines: 1, overflow: TextOverflow.ellipsis, style: const TextStyle(fontSize: 13)),
            subtitle: Text(s.sku, style: const TextStyle(fontSize: 11)),
            trailing: Text('${currency}${Formatters.number(s.stockValue.toInt())}', style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w600)),
          )).toList(),
    );
  }
}

class _DeadStockList extends StatelessWidget {
  final List<DeadStock> items;
  final String currency;
  const _DeadStockList({required this.items, required this.currency});

  @override
  Widget build(BuildContext context) {
    return Column(
      children: items.map((d) => ListTile(
            dense: true,
            contentPadding: const EdgeInsets.symmetric(horizontal: 4),
            leading: const Icon(Icons.delete_outline, size: 20, color: Color(0xFFef4444)),
            title: Text(d.name, maxLines: 1, overflow: TextOverflow.ellipsis, style: const TextStyle(fontSize: 13)),
            subtitle: Text('${d.sku} • ${Formatters.number(d.qty.toInt())} on hand • ${d.deadPct.toStringAsFixed(1)}% of stock', style: const TextStyle(fontSize: 11)),
            trailing: Text('${currency}${Formatters.number(d.stockValue.toInt())}', style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w600)),
          )).toList(),
    );
  }
}
