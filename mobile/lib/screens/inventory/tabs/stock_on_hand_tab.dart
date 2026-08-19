/// Stock on Hand tab — current stock levels with KPIs, search, filters, sort.

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../core/formatters.dart';
import '../../../models/index.dart';
import '../../../providers/auth_provider.dart';
import '../../../providers/inventory_providers.dart';
import '../../../widgets/common.dart';

enum _StockStatus { all, inStock, lowStock, outOfStock }

class StockOnHandTab extends ConsumerWidget {
  const StockOnHandTab({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final auth = ref.watch(authProvider);
    final currency = auth.billing?.currency ?? 'KSh';
    final itemsAsync = ref.watch(stockItemsProvider);

    return itemsAsync.when(
      loading: () => const LoadingWidget(),
      error: (e, _) => ErrorStateWidget(
        message: 'Failed to load stock',
        onRetry: () => ref.invalidate(stockItemsProvider),
      ),
      data: (items) => _StockOnHandBody(
        items: items,
        currency: currency,
        onRefresh: () async => ref.invalidate(stockItemsProvider),
      ),
    );
  }
}

class _StockOnHandBody extends ConsumerStatefulWidget {
  final List<StockItem> items;
  final String currency;
  final Future<void> Function() onRefresh;

  const _StockOnHandBody({
    required this.items,
    required this.currency,
    required this.onRefresh,
  });

  @override
  ConsumerState<_StockOnHandBody> createState() => _StockOnHandBodyState();
}

class _StockOnHandBodyState extends ConsumerState<_StockOnHandBody> {
  String _search = '';
  _StockStatus _status = _StockStatus.all;
  String _sort = 'name';

  @override
  Widget build(BuildContext context) {
    final scheme = Theme.of(context).colorScheme;

    final filtered = widget.items.where((i) {
      if (_search.isNotEmpty) {
        final q = _search.toLowerCase();
        final hay = '${i.productName} ${i.productSku} ${i.binLocation}'.toLowerCase();
        if (!hay.contains(q)) return false;
      }
      switch (_status) {
        case _StockStatus.inStock:
          return i.quantityOnHand > i.reorderLevel;
        case _StockStatus.lowStock:
          return i.quantityOnHand > 0 && i.quantityOnHand <= i.reorderLevel;
        case _StockStatus.outOfStock:
          return i.quantityOnHand <= 0;
        case _StockStatus.all:
          return true;
      }
    }).toList();

    filtered.sort((a, b) {
      switch (_sort) {
        case 'stock_low':
          return a.quantityOnHand.compareTo(b.quantityOnHand);
        case 'stock_high':
          return b.quantityOnHand.compareTo(a.quantityOnHand);
        case 'value':
          return b.stockValue.compareTo(a.stockValue);
        default:
          return a.productName.compareTo(b.productName);
      }
    });

    // KPIs
    final totalSkus = widget.items.length;
    final totalUnits = widget.items.fold<double>(0, (s, i) => s + i.quantityOnHand);
    final stockValue = widget.items.fold<double>(0, (s, i) => s + i.stockValue);
    final lowOrOut =
        widget.items.where((i) => i.quantityOnHand <= i.reorderLevel).length;

    return RefreshIndicator(
      onRefresh: widget.onRefresh,
      child: CustomScrollView(
        slivers: [
          SliverPadding(
            padding: const EdgeInsets.all(12),
            sliver: SliverToBoxAdapter(
              child: _KpiRow(
                items: [
                  _Kpi(Icons.inventory_2, totalSkus.toString(), 'Total SKUs',
                      const Color(0xFF3b82f6)),
                  _Kpi(Icons.all_inbox, Formatters.number(totalUnits), 'Total Units',
                      const Color(0xFF14b8a6)),
                  _Kpi(Icons.attach_money,
                      '${widget.currency}${Formatters.number(stockValue.toInt())}', 'Stock Value',
                      const Color(0xFFf59e0b)),
                  _Kpi(Icons.warning_amber, lowOrOut.toString(), 'Low / Out',
                      const Color(0xFFef4444)),
                ],
              ),
            ),
          ),
          // Toolbar
          SliverToBoxAdapter(
            child: Padding(
              padding: const EdgeInsets.symmetric(horizontal: 12),
              child: Row(
                children: [
                  Expanded(
                    child: TextField(
                      decoration: const InputDecoration(
                        hintText: 'Search product, SKU, bin...',
                        prefixIcon: Icon(Icons.search, size: 20),
                        isDense: true,
                        border: OutlineInputBorder(),
                      ),
                      onChanged: (v) => setState(() => _search = v.toLowerCase()),
                    ),
                  ),
                  const SizedBox(width: 8),
                  DropdownButton<String>(
                    value: _sort,
                    items: const [
                      DropdownMenuItem(value: 'name', child: Text('Name')),
                      DropdownMenuItem(value: 'stock_low', child: Text('Least stock')),
                      DropdownMenuItem(value: 'stock_high', child: Text('Most stock')),
                      DropdownMenuItem(value: 'value', child: Text('Highest value')),
                    ],
                    onChanged: (v) => setState(() => _sort = v ?? 'name'),
                  ),
                ],
              ),
            ),
          ),
          SliverToBoxAdapter(
            child: Padding(
              padding: const EdgeInsets.fromLTRB(12, 8, 12, 4),
              child: Wrap(
                spacing: 8,
                children: _StockStatus.values.map((s) {
                  return ChoiceChip(
                    label: Text(_statusLabel(s)),
                    selected: _status == s,
                    onSelected: (_) => setState(() => _status = s),
                  );
                }).toList(),
              ),
            ),
          ),
          if (filtered.isEmpty)
            const SliverFillRemaining(
              hasScrollBody: false,
              child: EmptyState(
                icon: Icons.inventory_outlined,
                title: 'No items',
                message: 'No stock items match your filters.',
              ),
            )
          else
            SliverPadding(
              padding: const EdgeInsets.symmetric(horizontal: 12),
              sliver: SliverList(
                delegate: SliverChildBuilderDelegate(
                  (context, index) => _StockItemTile(
                    item: filtered[index],
                    currency: widget.currency,
                    number: index + 1,
                    onView: () => _showView(filtered[index]),
                    onEdit: () => _showEdit(filtered[index]),
                    onDelete: () => _showDelete(filtered[index]),
                  ),
                  childCount: filtered.length,
                ),
              ),
            ),
          const SliverToBoxAdapter(child: SizedBox(height: 24)),
        ],
      ),
    );
  }

  String _statusLabel(_StockStatus s) => const {
        _StockStatus.all: 'All',
        _StockStatus.inStock: 'In Stock',
        _StockStatus.lowStock: 'Low Stock',
        _StockStatus.outOfStock: 'Out of Stock',
      }[s]!;

  // ── View ──────────────────────────────────────────────────────
  void _showView(StockItem item) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      shape: const RoundedRectangleBorder(borderRadius: BorderRadius.vertical(top: Radius.circular(20))),
      builder: (_) => Padding(
        padding: const EdgeInsets.fromLTRB(20, 12, 20, 28),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Center(child: Container(width: 40, height: 4, decoration: BoxDecoration(color: Colors.grey.shade300, borderRadius: BorderRadius.circular(2)))),
            const SizedBox(height: 12),
            Text(item.productName, style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
            const SizedBox(height: 12),
            _viewRow('SKU', item.productSku),
            _viewRow('Branch', item.branchName.isEmpty ? '—' : item.branchName),
            _viewRow('Category', item.productCategory ?? '—'),
            _viewRow('On hand', Formatters.number(item.quantityOnHand.toInt())),
            _viewRow('Reserved', Formatters.number(item.quantityReserved.toInt())),
            _viewRow('Available', Formatters.number(item.quantityAvailable.toInt())),
            _viewRow('Reorder level', Formatters.number(item.reorderLevel.toInt())),
            _viewRow('Reorder qty', Formatters.number(item.reorderQuantity.toInt())),
            _viewRow('Bin location', item.binLocation.isEmpty ? '—' : item.binLocation),
            _viewRow('Aisle', item.aisle.isEmpty ? '—' : item.aisle),
            _viewRow('Cost price', '${widget.currency}${Formatters.number(item.costPrice.toInt())}'),
            _viewRow('Retail price', '${widget.currency}${Formatters.number(item.retailPrice.toInt())}'),
            _viewRow('Unit', item.unitName.isEmpty ? '—' : item.unitName),
            _viewRow('Stock value', '${widget.currency}${Formatters.number(item.stockValue.toInt())}'),
            if (item.lastCountDate != null) _viewRow('Last count', Formatters.date(item.lastCountDate)),
          ],
        ),
      ),
    );
  }

  Widget _viewRow(String label, String value) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          SizedBox(width: 100, child: Text(label, style: const TextStyle(fontSize: 13, color: Colors.grey))),
          Expanded(child: Text(value, style: const TextStyle(fontSize: 13))),
        ],
      ),
    );
  }

  // ── Update ─────────────────────────────────────────────────────
  void _showEdit(StockItem item) {
    final qty = TextEditingController(text: item.quantityOnHand.toStringAsFixed(0));
    final reorder = TextEditingController(text: item.reorderLevel.toStringAsFixed(0));
    final reorderQty = TextEditingController(text: item.reorderQuantity.toStringAsFixed(0));
    final bin = TextEditingController(text: item.binLocation);
    final aisle = TextEditingController(text: item.aisle);

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      shape: const RoundedRectangleBorder(borderRadius: BorderRadius.vertical(top: Radius.circular(20))),
      builder: (sheetCtx) => Padding(
        padding: EdgeInsets.fromLTRB(20, 12, 20, 28).copyWith(bottom: 28 + MediaQuery.of(sheetCtx).viewInsets.bottom),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Center(child: Container(width: 40, height: 4, decoration: BoxDecoration(color: Colors.grey.shade300, borderRadius: BorderRadius.circular(2)))),
            const SizedBox(height: 12),
            Text('Update ${item.productName}', style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
            const SizedBox(height: 12),
            _editField(qty, 'Quantity on hand', TextInputType.number),
            const SizedBox(height: 10),
            _editField(reorder, 'Reorder level', TextInputType.number),
            const SizedBox(height: 10),
            _editField(reorderQty, 'Reorder qty', TextInputType.number),
            const SizedBox(height: 10),
            _editField(bin, 'Bin location', TextInputType.text),
            const SizedBox(height: 10),
            _editField(aisle, 'Aisle', TextInputType.text),
            const SizedBox(height: 16),
            SizedBox(
              width: double.infinity,
              child: FilledButton(
                onPressed: () => _submitEdit(item, qty, reorder, reorderQty, bin, aisle),
                child: const Text('Save'),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _editField(TextEditingController c, String label, TextInputType kb) {
    return TextField(
      controller: c,
      keyboardType: kb,
      decoration: InputDecoration(labelText: label, isDense: true, border: const OutlineInputBorder()),
    );
  }

  Future<void> _submitEdit(
    StockItem item,
    TextEditingController qty,
    TextEditingController reorder,
    TextEditingController reorderQty,
    TextEditingController bin,
    TextEditingController aisle,
  ) async {
    final messenger = ScaffoldMessenger.of(context);
    final nav = Navigator.of(context);
    try {
      await updateStockItem(ref, id: item.id, fields: {
        'quantity_on_hand': double.tryParse(qty.text) ?? 0,
        'reorder_level': double.tryParse(reorder.text) ?? 0,
        'reorder_quantity': double.tryParse(reorderQty.text) ?? 0,
        'bin_location': bin.text,
        'aisle': aisle.text,
      });
      await widget.onRefresh();
      nav.pop();
      messenger.showSnackBar(const SnackBar(content: Text('Stock item updated')));
    } catch (e) {
      messenger.showSnackBar(SnackBar(content: Text('Failed: $e')));
    }
  }

  // ── Delete ─────────────────────────────────────────────────────
  void _showDelete(StockItem item) {
    showDialog(
      context: context,
      builder: (_) => AlertDialog(
        title: const Text('Delete stock item'),
        content: Text('Remove "${item.productName}" stock record? This cannot be undone.'),
        actions: [
          TextButton(onPressed: () => Navigator.pop(context), child: const Text('Cancel')),
          FilledButton(
            style: FilledButton.styleFrom(backgroundColor: Colors.red),
            onPressed: () => _confirmDelete(item.id, item.productName),
            child: const Text('Delete'),
          ),
        ],
      ),
    );
  }

  Future<void> _confirmDelete(int id, String name) async {
    final nav = Navigator.of(context);
    final messenger = ScaffoldMessenger.of(context);
    try {
      await deleteStockItem(ref, id);
      await widget.onRefresh();
      nav.pop();
      messenger.showSnackBar(SnackBar(content: Text('Deleted "$name"')));
    } catch (e) {
      messenger.showSnackBar(SnackBar(content: Text('Failed: $e')));
    }
  }
}

class _StockItemTile extends StatelessWidget {
  final StockItem item;
  final String currency;
  final int number;
  final VoidCallback onView;
  final VoidCallback onEdit;
  final VoidCallback onDelete;
  const _StockItemTile({
    required this.item,
    required this.currency,
    required this.number,
    required this.onView,
    required this.onEdit,
    required this.onDelete,
  });

  @override
  Widget build(BuildContext context) {
    final scheme = Theme.of(context).colorScheme;
    final isOut = item.quantityOnHand <= 0;
    final isLow = !isOut && item.quantityOnHand <= item.reorderLevel;
    final color = isOut
        ? Colors.red
        : isLow
            ? Colors.orange
            : Colors.green;
    final cost = item.costPrice;
    final retail = item.retailPrice;
    final markupPct = cost > 0 ? ((retail - cost) / cost * 100) : 0.0;

    return Card(
      margin: const EdgeInsets.symmetric(vertical: 4),
      elevation: 1.5,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 10),
        child: Row(
          children: [
            // Number badge
            Container(
              width: 26,
              height: 26,
              decoration: BoxDecoration(
                color: scheme.primary.withOpacity(0.10),
                borderRadius: BorderRadius.circular(8),
              ),
              child: Center(
                child: Text(
                  '$number',
                  style: TextStyle(
                    fontSize: 12,
                    fontWeight: FontWeight.bold,
                    color: scheme.primary,
                  ),
                ),
              ),
            ),
            const SizedBox(width: 8),
            // Content
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                mainAxisSize: MainAxisSize.min,
                children: [
                  Text(
                    item.productName,
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                    style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14),
                  ),
                  const SizedBox(height: 6),
                  Wrap(
                    spacing: 6,
                    runSpacing: 5,
                    children: [
                      _infoChip('Cost', '$currency${Formatters.number(cost.toInt())}', Colors.blueGrey),
                      _infoChip('Retail', '$currency${Formatters.number(retail.toInt())}', Colors.blueGrey),
                      _infoChip('Qty', Formatters.number(item.quantityOnHand.toInt()), Colors.blueGrey),
                      _infoChip('Margin', '${markupPct.toStringAsFixed(0)}%', _marginColor(markupPct)),
                    ],
                  ),
                ],
              ),
            ),
            const SizedBox(width: 8),
            // Trailing: price + unit, status badge, menu
            Column(
              crossAxisAlignment: CrossAxisAlignment.end,
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Text(
                  '$currency${Formatters.number(retail.toInt())}',
                  style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14),
                ),
                Text(
                  item.unitName,
                  style: TextStyle(fontSize: 10, color: scheme.onSurfaceVariant),
                ),
                const SizedBox(height: 4),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 2),
                  decoration: BoxDecoration(
                    color: color.withOpacity(0.15),
                    borderRadius: BorderRadius.circular(6),
                  ),
                  child: Text(
                    isOut ? 'OUT' : isLow ? 'LOW' : 'OK',
                    style: TextStyle(
                      color: color,
                      fontSize: 10,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ),
              ],
            ),
            PopupMenuButton<String>(
              icon: const Icon(Icons.more_vert, size: 20),
              padding: EdgeInsets.zero,
              onSelected: (v) {
                switch (v) {
                  case 'view':
                    onView();
                    break;
                  case 'edit':
                    onEdit();
                    break;
                  case 'delete':
                    onDelete();
                    break;
                }
              },
              itemBuilder: (_) => [
                const PopupMenuItem(value: 'view', height: 40, child: Row(children: [
                  Icon(Icons.visibility_outlined, size: 18),
                  SizedBox(width: 10),
                  Text('View'),
                ])),
                const PopupMenuItem(value: 'edit', height: 40, child: Row(children: [
                  Icon(Icons.edit_outlined, size: 18),
                  SizedBox(width: 10),
                  Text('Update'),
                ])),
                const PopupMenuItem(value: 'delete', height: 40, child: Row(children: [
                  Icon(Icons.delete_outline, size: 18, color: Colors.red),
                  SizedBox(width: 10),
                  Text('Delete', style: TextStyle(color: Colors.red)),
                ])),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Color _marginColor(double pct) {
    if (pct < 0) return Colors.red;
    if (pct < 20) return Colors.deepOrange;
    if (pct < 50) return Colors.orange;
    if (pct < 100) return Colors.lightGreen;
    return Colors.green;
  }

  Widget _infoChip(String label, String value, Color color) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 3),
      decoration: BoxDecoration(
        color: color.withOpacity(0.10),
        borderRadius: BorderRadius.circular(7),
        border: Border.all(color: color.withOpacity(0.22)),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Text(label, style: TextStyle(fontSize: 9, color: color.withOpacity(0.8), fontWeight: FontWeight.w600)),
          const SizedBox(width: 3),
          Text(value, style: TextStyle(fontSize: 10, color: color, fontWeight: FontWeight.bold)),
        ],
      ),
    );
  }
}

// ── Shared KPI row ────────────────────────────────────────────────

class _Kpi {
  final IconData icon;
  final String value;
  final String label;
  final Color color;
  const _Kpi(this.icon, this.value, this.label, this.color);
}

class _KpiRow extends StatelessWidget {
  final List<_Kpi> items;
  const _KpiRow({super.key, required this.items});

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      height: 92,
      child: ListView.separated(
        scrollDirection: Axis.horizontal,
        itemCount: items.length,
        separatorBuilder: (_, __) => const SizedBox(width: 10),
        itemBuilder: (context, i) {
          final k = items[i];
          return Container(
            width: 150,
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: k.color.withOpacity(0.10),
              borderRadius: BorderRadius.circular(14),
              border: Border.all(color: k.color.withOpacity(0.25)),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Icon(k.icon, color: k.color, size: 20),
                const Spacer(),
                Text(
                  k.value,
                  style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
                Text(
                  k.label,
                  style: TextStyle(fontSize: 11, color: Theme.of(context).colorScheme.onSurfaceVariant),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
              ],
            ),
          );
        },
      ),
    );
  }
}
