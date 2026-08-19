/// Stock Movements tab — inventory in/out history with KPIs and filters.

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../core/formatters.dart';
import '../../../models/index.dart';
import '../../../providers/auth_provider.dart';
import '../../../providers/inventory_providers.dart';
import '../../../widgets/common.dart';

class StockMovementsTab extends ConsumerStatefulWidget {
  const StockMovementsTab({super.key});

  @override
  ConsumerState<StockMovementsTab> createState() => _StockMovementsTabState();
}

class _StockMovementsTabState extends ConsumerState<StockMovementsTab> {
  String _search = '';
  String _typeFilter = 'all';

  static const _typeColors = {
    'purchase': Colors.green,
    'sale': Colors.red,
    'return': Colors.teal,
    'adjustment': Colors.blue,
    'transfer_out': Colors.deepOrange,
    'transfer_in': Colors.indigo,
    'damage': Colors.pink,
    'initial': Colors.purple,
  };

  static const _typeIcons = {
    'purchase': Icons.arrow_circle_down,
    'sale': Icons.arrow_circle_up,
    'return': Icons.undo,
    'adjustment': Icons.tune,
    'transfer_out': Icons.south_west,
    'transfer_in': Icons.north_east,
    'damage': Icons.delete_outline,
    'initial': Icons.add_circle_outline,
  };

  @override
  Widget build(BuildContext context) {
    final auth = ref.watch(authProvider);
    final currency = auth.billing?.currency ?? 'KSh';
    final movementsAsync = ref.watch(stockMovementsListProvider);

    return movementsAsync.when(
      loading: () => const LoadingWidget(),
      error: (e, _) => ErrorStateWidget(
        message: 'Failed to load movements',
        onRetry: () => ref.invalidate(stockMovementsListProvider),
      ),
      data: (movements) {
        final filtered = movements.where((m) {
          if (_typeFilter != 'all' && m.movementType != _typeFilter) return false;
          if (_search.isNotEmpty) {
            final q = _search.toLowerCase();
            final hay =
                '${m.productName} ${m.productSku} ${m.reference}'.toLowerCase();
            if (!hay.contains(q)) return false;
          }
          return true;
        }).toList();

        final unitsIn = movements
            .where((m) => m.quantityChange >= 0)
            .fold<double>(0, (s, m) => s + m.quantityChange);
        final unitsOut = movements
            .where((m) => m.quantityChange < 0)
            .fold<double>(0, (s, m) => s + m.quantityChange.abs());
        final net = unitsIn - unitsOut;

        return RefreshIndicator(
          onRefresh: () async => ref.invalidate(stockMovementsListProvider),
          child: CustomScrollView(
            slivers: [
              SliverPadding(
                padding: const EdgeInsets.all(12),
                sliver: SliverToBoxAdapter(
                  child: _MovementsKpiRow(
                    total: movements.length,
                    unitsIn: unitsIn,
                    unitsOut: unitsOut,
                    net: net,
                  ),
                ),
              ),
              SliverToBoxAdapter(
                child: Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 12),
                  child: TextField(
                    decoration: const InputDecoration(
                      hintText: 'Search product, SKU, reference...',
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
                    runSpacing: 4,
                    children: [
                      'all',
                      ..._typeColors.keys,
                    ]
                        .map((t) => ChoiceChip(
                              label: Text(t == 'all' ? 'All' : t.replaceAll('_', ' ')),
                              selected: _typeFilter == t,
                              onSelected: (_) => setState(() => _typeFilter = t),
                            ))
                        .toList(),
                  ),
                ),
              ),
              if (filtered.isEmpty)
                const SliverFillRemaining(
                  hasScrollBody: false,
                  child: EmptyState(
                    icon: Icons.swap_vert,
                    title: 'No movements',
                    message: 'Stock movements will appear here.',
                  ),
                )
              else
                SliverPadding(
                  padding: const EdgeInsets.symmetric(horizontal: 12),
                  sliver: SliverList(
                    delegate: SliverChildBuilderDelegate(
                      (context, index) =>
                          _MovementTile(m: filtered[index]),
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
}

class _MovementsKpiRow extends StatelessWidget {
  final int total;
  final double unitsIn;
  final double unitsOut;
  final double net;
  const _MovementsKpiRow({
    required this.total,
    required this.unitsIn,
    required this.unitsOut,
    required this.net,
  });

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      height: 92,
      child: ListView(
        scrollDirection: Axis.horizontal,
        children: [
          _kpi(context, Icons.swap_vert, total.toString(), 'Total Movements', const Color(0xFF3b82f6)),
          const SizedBox(width: 10),
          _kpi(context, Icons.south, Formatters.number(unitsIn.toInt()), 'Units In', Colors.green),
          const SizedBox(width: 10),
          _kpi(context, Icons.north, Formatters.number(unitsOut.toInt()), 'Units Out', Colors.red),
          const SizedBox(width: 10),
          _kpi(context, Icons.functions, Formatters.number(net.toInt()), 'Net Change', const Color(0xFFf59e0b)),
        ],
      ),
    );
  }

  Widget _kpi(BuildContext c, IconData icon, String value, String label, Color color) {
    return Container(
      width: 150,
      margin: const EdgeInsets.only(right: 2),
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

class _MovementTile extends StatelessWidget {
  final StockMovement m;
  const _MovementTile({required this.m});

  @override
  Widget build(BuildContext context) {
    final color =
        _StockMovementsTabState._typeColors[m.movementType] ?? Colors.grey;
    final icon =
        _StockMovementsTabState._typeIcons[m.movementType] ?? Icons.swap_vert;
    final isPositive = m.quantityChange >= 0;

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
          child: Icon(icon, color: color, size: 22),
        ),
        title: Text(m.productName, maxLines: 1, overflow: TextOverflow.ellipsis),
        subtitle: Text(
          '${m.movementTypeDisplay.isEmpty ? m.movementType.replaceAll('_', ' ') : m.movementTypeDisplay}  •  ${Formatters.dateTime(m.createdAt)}',
          maxLines: 1,
          overflow: TextOverflow.ellipsis,
          style: const TextStyle(fontSize: 12),
        ),
        trailing: Column(
          crossAxisAlignment: CrossAxisAlignment.end,
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Text(
              '${isPositive ? '+' : ''}${Formatters.number(m.quantityChange.toInt())}',
              style: TextStyle(
                color: isPositive ? Colors.green : Colors.red,
                fontWeight: FontWeight.bold,
                fontSize: 16,
              ),
            ),
            Text(
              'After: ${Formatters.number(m.quantityAfter.toInt())}',
              style: const TextStyle(fontSize: 11, color: Colors.grey),
            ),
          ],
        ),
      ),
    );
  }
}
