/// Low Stock tab — alerts for products at or below reorder level.

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../core/formatters.dart';
import '../../../models/index.dart';
import '../../../providers/auth_provider.dart';
import '../../../providers/inventory_providers.dart';
import '../../../widgets/common.dart';

enum _Severity { all, outOfStock, critical, low }

class LowStockTab extends ConsumerStatefulWidget {
  const LowStockTab({super.key});

  @override
  ConsumerState<LowStockTab> createState() => _LowStockTabState();
}

class _LowStockTabState extends ConsumerState<LowStockTab> {
  String _search = '';
  _Severity _severity = _Severity.all;

  @override
  Widget build(BuildContext context) {
    final auth = ref.watch(authProvider);
    final currency = auth.billing?.currency ?? 'KSh';
    final itemsAsync = ref.watch(lowStockItemsProvider);

    return itemsAsync.when(
      loading: () => const LoadingWidget(),
      error: (e, _) => ErrorStateWidget(
        message: 'Failed to load low stock',
        onRetry: () => ref.invalidate(lowStockItemsProvider),
      ),
      data: (items) {
        final filtered = items.where((i) {
          if (_search.isNotEmpty) {
            final q = _search.toLowerCase();
            if (!'${i.productName} ${i.productSku}'.toLowerCase().contains(q)) {
              return false;
            }
          }
          final sev = _sevOf(i);
          switch (_severity) {
            case _Severity.outOfStock:
              return sev == _Severity.outOfStock;
            case _Severity.critical:
              return sev == _Severity.critical;
            case _Severity.low:
              return sev == _Severity.low;
            case _Severity.all:
              return true;
          }
        }).toList();

        final outCount = items.where((i) => i.quantityOnHand <= 0).length;
        final lowCount = items.length - outCount;
        final reorderQtyNeeded = items.fold<double>(
            0, (s, i) => s + (i.reorderLevel - i.quantityOnHand).clamp(0, double.infinity));

        return RefreshIndicator(
          onRefresh: () async => ref.invalidate(lowStockItemsProvider),
          child: CustomScrollView(
            slivers: [
              SliverPadding(
                padding: const EdgeInsets.all(12),
                sliver: SliverToBoxAdapter(
                  child: _LowStockKpiRow(
                    total: items.length,
                    out: outCount,
                    low: lowCount,
                    reorderQty: reorderQtyNeeded,
                  ),
                ),
              ),
              SliverToBoxAdapter(
                child: Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 12),
                  child: TextField(
                    decoration: const InputDecoration(
                      hintText: 'Search product or SKU...',
                      prefixIcon: Icon(Icons.search, size: 20),
                      isDense: true,
                      border: OutlineInputBorder(),
                    ),
                    onChanged: (v) => setState(() => _search = v.toLowerCase()),
                  ),
                ),
              ),
              SliverToBoxAdapter(
                child: Padding(
                  padding: const EdgeInsets.fromLTRB(12, 8, 12, 4),
                  child: Wrap(
                    spacing: 8,
                    children: _Severity.values.map((s) {
                      return ChoiceChip(
                        label: Text(_sevLabel(s)),
                        selected: _severity == s,
                        onSelected: (_) => setState(() => _severity = s),
                      );
                    }).toList(),
                  ),
                ),
              ),
              if (filtered.isEmpty)
                const SliverFillRemaining(
                  hasScrollBody: false,
                  child: EmptyState(
                    icon: Icons.check_circle,
                    title: 'All Stocked Up',
                    message: 'No products are below their reorder level.',
                  ),
                )
              else
                SliverPadding(
                  padding: const EdgeInsets.symmetric(horizontal: 12),
                  sliver: SliverList(
                    delegate: SliverChildBuilderDelegate(
                      (context, index) => _LowStockTile(
                        item: filtered[index],
                        currency: currency,
                      ),
                      childCount: filtered.length,
                    ),
                  ),
                ),
              const SliverToBoxAdapter(child: SizedBox(height: 24)),
            ],
          ),
        );
      },
    );
  }

  _Severity _sevOf(StockItem i) {
    if (i.quantityOnHand <= 0) return _Severity.outOfStock;
    if (i.quantityOnHand <= i.reorderLevel * 0.5) return _Severity.critical;
    return _Severity.low;
  }

  String _sevLabel(_Severity s) => const {
        _Severity.all: 'All',
        _Severity.outOfStock: 'Out of Stock',
        _Severity.critical: 'Critical',
        _Severity.low: 'Low',
      }[s]!;
}

class _LowStockKpiRow extends StatelessWidget {
  final int total;
  final int out;
  final int low;
  final double reorderQty;
  const _LowStockKpiRow({
    required this.total,
    required this.out,
    required this.low,
    required this.reorderQty,
  });

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      height: 92,
      child: ListView(
        scrollDirection: Axis.horizontal,
        children: [
          _kpi(context, Icons.warning_amber, total.toString(), 'Total Alerts', const Color(0xFFf59e0b)),
          const SizedBox(width: 10),
          _kpi(context, Icons.error_outline, out.toString(), 'Out of Stock', Colors.red),
          const SizedBox(width: 10),
          _kpi(context, Icons.info_outline, low.toString(), 'Low Stock', Colors.orange),
          const SizedBox(width: 10),
          _kpi(context, Icons.shopping_cart, Formatters.number(reorderQty.toInt()), 'Reorder Qty Needed', const Color(0xFF8b5cf6)),
        ],
      ),
    );
  }

  Widget _kpi(BuildContext c, IconData icon, String value, String label, Color color) {
    return Container(
      width: 150,
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
          Text(value,
              style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
              maxLines: 1,
              overflow: TextOverflow.ellipsis),
          Text(label,
              style: TextStyle(fontSize: 11, color: Theme.of(c).colorScheme.onSurfaceVariant),
              maxLines: 1,
              overflow: TextOverflow.ellipsis),
        ],
      ),
    );
  }
}

class _LowStockTile extends StatelessWidget {
  final StockItem item;
  final String currency;
  const _LowStockTile({required this.item, required this.currency});

  @override
  Widget build(BuildContext context) {
    final isOut = item.quantityOnHand <= 0;
    final color = isOut ? Colors.red : Colors.orange;
    final shortfall = (item.reorderLevel - item.quantityOnHand).clamp(0, double.infinity);

    return Card(
      margin: const EdgeInsets.symmetric(vertical: 4),
      child: ListTile(
        leading: Container(
          width: 44,
          height: 44,
          decoration: BoxDecoration(
            color: color.withOpacity(0.15),
            borderRadius: BorderRadius.circular(10),
          ),
          child: Icon(
            isOut ? Icons.error_outline : Icons.warning_amber,
            color: color,
            size: 22,
          ),
        ),
        title: Text(item.productName, maxLines: 1, overflow: TextOverflow.ellipsis),
        subtitle: Text(
          'On hand: ${Formatters.number(item.quantityOnHand.toInt())}  •  Reorder: ${Formatters.number(item.reorderLevel.toInt())}  •  Need: ${Formatters.number(shortfall.toInt())}',
          maxLines: 1,
          overflow: TextOverflow.ellipsis,
          style: TextStyle(fontSize: 12, color: color),
        ),
        trailing: Container(
          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
          decoration: BoxDecoration(
            color: color.withOpacity(0.15),
            borderRadius: BorderRadius.circular(8),
          ),
          child: Text(
            isOut ? 'OUT' : 'LOW',
            style: TextStyle(
              color: color,
              fontSize: 11,
              fontWeight: FontWeight.bold,
            ),
          ),
        ),
      ),
    );
  }
}
