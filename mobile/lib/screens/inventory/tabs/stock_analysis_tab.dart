/// Stock Analysis tab — KPIs, charts (category value, top products,
/// movements), and ABC classification. Mirrors the web's
/// `/inventory/stock-analysis` page.

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:fl_chart/fl_chart.dart';

import '../../../core/formatters.dart';
import '../../../models/index.dart';
import '../../../providers/auth_provider.dart';
import '../../../providers/inventory_providers.dart';
import '../../../widgets/common.dart';

class StockAnalysisTab extends ConsumerWidget {
  const StockAnalysisTab({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final auth = ref.watch(authProvider);
    final currency = auth.billing?.currency ?? 'KSh';
    final analyticsAsync = ref.watch(stockAnalyticsProvider);

    return analyticsAsync.when(
      loading: () => const LoadingWidget(),
      error: (e, _) => ErrorStateWidget(
        message: 'Failed to load analysis',
        onRetry: () => ref.invalidate(stockAnalyticsProvider),
      ),
      data: (data) => RefreshIndicator(
        onRefresh: () async => ref.invalidate(stockAnalyticsProvider),
        child: _AnalysisBody(data: data, currency: currency),
      ),
    );
  }
}

class _AnalysisBody extends StatelessWidget {
  final StockAnalysisData data;
  final String currency;
  const _AnalysisBody({required this.data, required this.currency});

  static const _palette = [
    Color(0xFF6366f1), Color(0xFF8b5cf6), Color(0xFFec4899),
    Color(0xFFf59e0b), Color(0xFF14b8a6), Color(0xFF3b82f6),
    Color(0xFFf97316), Color(0xFF06b6d4), Color(0xFFa855f7), Color(0xFFef4444),
  ];

  @override
  Widget build(BuildContext context) {
    final k = data.kpis;
    final scheme = Theme.of(context).colorScheme;

    return SingleChildScrollView(
      padding: const EdgeInsets.all(12),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // KPI grid
          GridView.count(
            crossAxisCount: 2,
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            mainAxisSpacing: 10,
            crossAxisSpacing: 10,
            childAspectRatio: 1.6,
            children: [
              _kpi(Icons.inventory_2, k.totalSkus.toString(), 'Total SKUs', const Color(0xFF3b82f6)),
              _kpi(Icons.payments, '$currency${Formatters.number(k.totalCostValue.toInt())}', 'Stock Value (Cost)', const Color(0xFFf59e0b)),
              _kpi(Icons.trending_up, '$currency${Formatters.number(k.potentialProfit.toInt())}', 'Potential Profit', const Color(0xFF14b8a6)),
              _kpi(Icons.warning_amber, '${k.lowStock + k.outOfStock}', 'Low / Out of Stock', const Color(0xFFef4444)),
            ],
          ),
          const SizedBox(height: 16),
          // Stock health bar
          _SectionCard(
            title: 'Stock Health',
            icon: Icons.health_and_safety,
            color: const Color(0xFF14b8a6),
            child: _HealthBar(k: k),
          ),
          const SizedBox(height: 16),
          // Category donut
          if (data.byCategory.isNotEmpty) ...[
            _SectionCard(
              title: 'Stock Value by Category',
              icon: Icons.pie_chart_outline,
              color: const Color(0xFF8b5cf6),
              child: _CategoryDonut(data: data, currency: currency),
            ),
            const SizedBox(height: 16),
          ],
          // Top products by value
          if (data.topByValue.isNotEmpty) ...[
            _SectionCard(
              title: 'Top 10 by Stock Value',
              icon: Icons.emoji_events,
              color: const Color(0xFF6366f1),
              child: _TopProductsBars(data: data, currency: currency),
            ),
            const SizedBox(height: 16),
          ],
          // Movement summary
          if (data.movementSummary.isNotEmpty) ...[
            _SectionCard(
              title: 'Movements (30 days)',
              icon: Icons.swap_vert,
              color: const Color(0xFF06b6d4),
              child: _MovementSummary(data: data),
            ),
            const SizedBox(height: 16),
          ],
          // ABC classification
          if (data.abcAnalysis.isNotEmpty) ...[
            _SectionCard(
              title: 'ABC Classification',
              icon: Icons.grade,
              color: const Color(0xFFf59e0b),
              child: _AbcSection(data: data),
            ),
            const SizedBox(height: 16),
          ],
          // Low stock items
          if (data.lowStockItems.isNotEmpty) ...[
            _SectionCard(
              title: 'Low Stock Alerts',
              icon: Icons.warning_amber,
              color: const Color(0xFFef4444),
              child: Column(
                children: data.lowStockItems.take(8).map((i) => ListTile(
                      dense: true,
                      contentPadding: EdgeInsets.zero,
                      leading: const Icon(Icons.error_outline, color: Colors.red, size: 20),
                      title: Text(i.productName, maxLines: 1, overflow: TextOverflow.ellipsis),
                      subtitle: Text(
                        'On hand: ${Formatters.number(i.quantityOnHand.toInt())} • Reorder: ${Formatters.number(i.reorderLevel.toInt())}',
                        style: const TextStyle(fontSize: 11),
                      ),
                      trailing: Text('${currency}${Formatters.number(i.costPrice.toInt())}',
                          style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold)),
                    )).toList(),
              ),
            ),
          ],
          const SizedBox(height: 24),
        ],
      ),
    );
  }

  Widget _kpi(IconData icon, String value, String label, Color color) {
    return Container(
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
        ],
      ),
    );
  }
}

class _SectionCard extends StatelessWidget {
  final String title;
  final IconData icon;
  final Color color;
  final Widget child;
  const _SectionCard({required this.title, required this.icon, required this.color, required this.child});

  @override
  Widget build(BuildContext context) {
    return Card(
      elevation: 2,
      child: Padding(
        padding: const EdgeInsets.all(14),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(children: [
              Container(
                padding: const EdgeInsets.all(8),
                decoration: BoxDecoration(color: color.withOpacity(0.12), borderRadius: BorderRadius.circular(10)),
                child: Icon(icon, color: color, size: 18),
              ),
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

class _HealthBar extends StatelessWidget {
  final StockAnalysisKpis k;
  const _HealthBar({required this.k});

  @override
  Widget build(BuildContext context) {
    final total = k.inStock + k.lowStock + k.outOfStock;
    if (total == 0) return const Text('No data');
    final inPct = k.inStock / total;
    final lowPct = k.lowStock / total;
    final outPct = k.outOfStock / total;
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        ClipRRect(
          borderRadius: BorderRadius.circular(8),
          child: SizedBox(
            height: 22,
            child: Row(
              children: [
                if (inPct > 0) Expanded(flex: (inPct * 100).round(), child: Container(color: Colors.green)),
                if (lowPct > 0) Expanded(flex: (lowPct * 100).round(), child: Container(color: Colors.orange)),
                if (outPct > 0) Expanded(flex: (outPct * 100).round(), child: Container(color: Colors.red)),
              ],
            ),
          ),
        ),
        const SizedBox(height: 8),
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            _legend(Colors.green, 'In Stock', k.inStock),
            _legend(Colors.orange, 'Low', k.lowStock),
            _legend(Colors.red, 'Out', k.outOfStock),
          ],
        ),
      ],
    );
  }

  Widget _legend(Color c, String label, int count) {
    return Row(children: [
      Container(width: 10, height: 10, decoration: BoxDecoration(color: c, borderRadius: BorderRadius.circular(3))),
      const SizedBox(width: 5),
      Text('$label ($count)', style: const TextStyle(fontSize: 11)),
    ]);
  }
}

class _CategoryDonut extends StatelessWidget {
  final StockAnalysisData data;
  final String currency;
  const _CategoryDonut({required this.data, required this.currency});

  static const _palette = [
    Color(0xFF6366f1), Color(0xFF8b5cf6), Color(0xFFec4899),
    Color(0xFFf59e0b), Color(0xFF14b8a6), Color(0xFF3b82f6),
    Color(0xFFf97316), Color(0xFF06b6d4), Color(0xFFa855f7), Color(0xFFef4444),
  ];

  @override
  Widget build(BuildContext context) {
    final entries = data.byCategory;
    final total = entries.fold<double>(0, (s, e) => s + e.value);
    return SizedBox(
      height: 180,
      child: Row(
        children: [
          Expanded(
            child: PieChart(
              PieChartData(
                sections: List.generate(entries.length, (i) {
                  final e = entries[i];
                  final pct = total > 0 ? (e.value / total) * 100 : 0.0;
                  return PieChartSectionData(
                    value: e.value,
                    color: _palette[i % _palette.length],
                    title: '${pct.round()}%',
                    radius: 48,
                    titleStyle: const TextStyle(fontSize: 10, color: Colors.white, fontWeight: FontWeight.bold),
                  );
                }),
                centerSpaceRadius: 32,
              ),
            ),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: entries.take(6).toList().asMap().entries.map((entry) {
                final i = entry.key;
                final e = entry.value;
                return Padding(
                  padding: const EdgeInsets.symmetric(vertical: 1),
                  child: Row(children: [
                    Container(width: 10, height: 10, decoration: BoxDecoration(color: _palette[i % _palette.length], borderRadius: BorderRadius.circular(3))),
                    const SizedBox(width: 6),
                    Expanded(child: Text(e.category, style: const TextStyle(fontSize: 11), maxLines: 1, overflow: TextOverflow.ellipsis)),
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

class _TopProductsBars extends StatelessWidget {
  final StockAnalysisData data;
  final String currency;
  const _TopProductsBars({required this.data, required this.currency});

  static const _colors = [
    Color(0xFF6366f1), Color(0xFF8b5cf6), Color(0xFFa855f7), Color(0xFFec4899),
    Color(0xFFf43f5e), Color(0xFFf97316), Color(0xFFf59e0b), Color(0xFF14b8a6),
    Color(0xFF06b6d4), Color(0xFF3b82f6),
  ];

  @override
  Widget build(BuildContext context) {
    final top = data.topByValue.take(10).toList();
    final maxVal = top.fold<double>(0, (a, e) => a > e.stockValue ? a : e.stockValue);
    return Column(
      children: List.generate(top.length, (i) {
        final color = _colors[i % _colors.length];
        final pct = maxVal > 0 ? top[i].stockValue / maxVal : 0.0;
        return Padding(
          padding: EdgeInsets.only(bottom: i == top.length - 1 ? 0 : 8),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(children: [
                Expanded(child: Text('${i + 1}. ${top[i].productName}', style: const TextStyle(fontSize: 11), maxLines: 1, overflow: TextOverflow.ellipsis)),
                Text('${currency}${Formatters.number(top[i].stockValue.toInt())}', style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w600)),
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

class _MovementSummary extends StatelessWidget {
  final StockAnalysisData data;
  const _MovementSummary({required this.data});

  @override
  Widget build(BuildContext context) {
    return Column(
      children: data.movementSummary.map((m) => ListTile(
            dense: true,
            contentPadding: EdgeInsets.zero,
            leading: CircleAvatar(
              backgroundColor: Colors.cyan.withOpacity(0.15),
              child: Text(m.count.toString(), style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold)),
            ),
            title: Text(m.label.isEmpty ? m.movementType : m.label, style: const TextStyle(fontSize: 13)),
            trailing: Text('${Formatters.number(m.quantity.toInt())} units', style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w600)),
          )).toList(),
    );
  }
}

class _AbcSection extends StatelessWidget {
  final StockAnalysisData data;
  const _AbcSection({required this.data});

  @override
  Widget build(BuildContext context) {
    final counts = data.abcCounts;
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceAround,
          children: [
            _abcCard('A', counts['A'] ?? 0, Colors.green),
            _abcCard('B', counts['B'] ?? 0, Colors.orange),
            _abcCard('C', counts['C'] ?? 0, Colors.red),
          ],
        ),
        const SizedBox(height: 12),
        ...data.abcAnalysis.take(8).map((a) => ListTile(
              dense: true,
              contentPadding: EdgeInsets.zero,
              leading: CircleAvatar(
                radius: 14,
                backgroundColor: a.abcClass == 'A'
                    ? Colors.green.withOpacity(0.15)
                    : a.abcClass == 'B'
                        ? Colors.orange.withOpacity(0.15)
                        : Colors.red.withOpacity(0.15),
                child: Text(a.abcClass, style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: a.abcClass == 'A' ? Colors.green : a.abcClass == 'B' ? Colors.orange : Colors.red)),
              ),
              title: Text(a.productName, maxLines: 1, overflow: TextOverflow.ellipsis, style: const TextStyle(fontSize: 13)),
              subtitle: Text('${a.cumulativePct.toStringAsFixed(1)}% cumulative', style: const TextStyle(fontSize: 11)),
            )),
      ],
    );
  }

  Widget _abcCard(String cls, int count, Color color) {
    return Column(children: [
      CircleAvatar(
        radius: 22,
        backgroundColor: color.withOpacity(0.15),
        child: Text(cls, style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: color)),
      ),
      const SizedBox(height: 4),
      Text('$count items', style: const TextStyle(fontSize: 12)),
    ]);
  }
}
