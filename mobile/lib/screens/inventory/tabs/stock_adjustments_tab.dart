/// Stock Adjustments tab — list, create, and full approval workflow
/// (submit / approve / reject / post / cancel). Mirrors the web's
/// `/inventory/adjustments` page.

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../core/formatters.dart';
import '../../../models/index.dart';
import '../../../providers/auth_provider.dart';
import '../../../providers/data_providers.dart';
import '../../../providers/inventory_providers.dart';
import '../../../widgets/common.dart';

class StockAdjustmentsTab extends ConsumerStatefulWidget {
  const StockAdjustmentsTab({super.key});

  @override
  ConsumerState<StockAdjustmentsTab> createState() =>
      _StockAdjustmentsTabState();
}

class _StockAdjustmentsTabState extends ConsumerState<StockAdjustmentsTab> {
  String _search = '';
  String _statusFilter = 'all';

  static const _statuses = ['all', 'draft', 'pending', 'approved', 'posted', 'rejected', 'cancelled'];
  static const _statusColors = {
    'draft': Colors.grey,
    'pending': Colors.orange,
    'approved': Colors.blue,
    'posted': Colors.green,
    'rejected': Colors.red,
    'cancelled': Colors.brown,
  };
  static const _reasonIcons = {
    'cycle_count': Icons.fact_check,
    'damage': Icons.broken_image,
    'theft': Icons.gpp_maybe,
    'expiry': Icons.event_busy,
    'sample': Icons.card_giftcard,
    'gift': Icons.redeem,
    'conversion': Icons.swap_horiz,
    'clerical': Icons.edit_note,
    'quality': Icons.high_quality,
    'po_received': Icons.local_shipping,
    'other': Icons.more_horiz,
  };

  @override
  Widget build(BuildContext context) {
    final auth = ref.watch(authProvider);
    final currency = auth.billing?.currency ?? 'KSh';
    final adjustmentsAsync = ref.watch(stockAdjustmentsProvider);
    final summaryAsync = ref.watch(adjustmentSummaryProvider);

    return adjustmentsAsync.when(
      loading: () => const LoadingWidget(),
      error: (e, _) => ErrorStateWidget(
        message: 'Failed to load adjustments',
        onRetry: () => ref.invalidate(stockAdjustmentsProvider),
      ),
      data: (adjustments) {
        final filtered = adjustments.where((a) {
          if (_statusFilter != 'all' && a.status != _statusFilter) return false;
          if (_search.isNotEmpty) {
            final q = _search.toLowerCase();
            if (!'${a.adjustmentNumber} ${a.notes} ${a.reasonDisplay}'
                .toLowerCase()
                .contains(q)) {
              return false;
            }
          }
          return true;
        }).toList();

        final summary = summaryAsync.valueOrNull;

        return Scaffold(
          floatingActionButton: FloatingActionButton.extended(
            onPressed: () => _showCreateDialog(context),
            icon: const Icon(Icons.add),
            label: const Text('New'),
          ),
          body: RefreshIndicator(
            onRefresh: () async {
              ref.invalidate(stockAdjustmentsProvider);
              ref.invalidate(adjustmentSummaryProvider);
            },
            child: CustomScrollView(
              slivers: [
                if (summary != null)
                  SliverPadding(
                    padding: const EdgeInsets.all(12),
                    sliver: SliverToBoxAdapter(child: _SummaryRow(summary: summary, currency: currency)),
                  ),
                SliverToBoxAdapter(
                  child: Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 12),
                    child: TextField(
                      decoration: const InputDecoration(
                        hintText: 'Search number, reason, notes...',
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
                      spacing: 6,
                      runSpacing: 4,
                      children: _statuses.map((s) {
                        return ChoiceChip(
                          label: Text(s == 'all' ? 'All' : s[0].toUpperCase() + s.substring(1)),
                          selected: _statusFilter == s,
                          onSelected: (_) => setState(() => _statusFilter = s),
                        );
                      }).toList(),
                    ),
                  ),
                ),
                if (filtered.isEmpty)
                  const SliverFillRemaining(
                    hasScrollBody: false,
                    child: EmptyState(
                      icon: Icons.tune,
                      title: 'No adjustments',
                      message: 'Create a stock adjustment to get started.',
                    ),
                  )
                else
                  SliverPadding(
                    padding: const EdgeInsets.symmetric(horizontal: 12),
                    sliver: SliverList(
                      delegate: SliverChildBuilderDelegate(
                        (context, index) => _AdjustmentTile(
                          adj: filtered[index],
                          currency: currency,
                          onTap: () => _showDetail(context, filtered[index]),
                        ),
                        childCount: filtered.length,
                      ),
                    ),
                  ),
                const SliverToBoxAdapter(child: SizedBox(height: 80)),
              ],
            ),
          ),
        );
      },
    );
  }

  void _showCreateDialog(BuildContext context) {
    Navigator.of(context).push(MaterialPageRoute(
      builder: (_) => const _CreateAdjustmentPage(),
      fullscreenDialog: true,
    ));
  }

  void _showDetail(BuildContext context, StockAdjustment adj) async {
    // Fetch full detail (with lines) then show.
    final detail = await fetchAdjustmentDetail(ref, adj.id);
    if (!mounted) return;
    showDialog(
      context: context,
      builder: (_) => _AdjustmentDetailDialog(
        adj: detail,
        onAction: (action) => _doAction(context, detail.id, action),
      ),
    );
  }

  Future<void> _doAction(BuildContext context, int id, String action) async {
    Navigator.of(context).pop(); // close dialog
    final messenger = ScaffoldMessenger.of(context);
    try {
      switch (action) {
        case 'submit':
          await submitAdjustment(ref, id);
          break;
        case 'approve':
          await approveAdjustment(ref, id);
          break;
        case 'reject':
          await rejectAdjustment(ref, id);
          break;
        case 'post':
          await postAdjustment(ref, id);
          break;
        case 'cancel':
          await cancelAdjustment(ref, id);
          break;
      }
      ref.invalidate(stockAdjustmentsProvider);
      ref.invalidate(adjustmentSummaryProvider);
      ref.invalidate(stockItemsProvider);
      messenger.showSnackBar(SnackBar(content: Text('Adjustment $action done')));
    } catch (e) {
      messenger.showSnackBar(SnackBar(content: Text('Failed: $e')));
    }
  }
}

// ── Summary KPI row ──────────────────────────────────────────────

class _SummaryRow extends StatelessWidget {
  final AdjustmentSummary summary;
  final String currency;
  const _SummaryRow({required this.summary, required this.currency});

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      height: 92,
      child: ListView(
        scrollDirection: Axis.horizontal,
        children: [
          _k(context, Icons.receipt_long, summary.total.toString(), 'Total', const Color(0xFF3b82f6)),
          const SizedBox(width: 10),
          _k(context, Icons.pending_actions, summary.draft.toString(), 'Draft', Colors.grey),
          const SizedBox(width: 10),
          _k(context, Icons.hourglass_top, summary.pending.toString(), 'Pending', Colors.orange),
          const SizedBox(width: 10),
          _k(context, Icons.check_circle, summary.posted.toString(), 'Posted', Colors.green),
          const SizedBox(width: 10),
          _k(context, Icons.payments,
              '$currency${Formatters.number(summary.totalValueImpact.toInt())}', 'Value Impact', const Color(0xFFf59e0b)),
        ],
      ),
    );
  }

  Widget _k(BuildContext c, IconData icon, String value, String label, Color color) {
    return Container(
      width: 130,
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
              style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 15),
              maxLines: 1, overflow: TextOverflow.ellipsis),
          Text(label,
              style: TextStyle(fontSize: 11, color: Theme.of(c).colorScheme.onSurfaceVariant),
              maxLines: 1, overflow: TextOverflow.ellipsis),
        ],
      ),
    );
  }
}

// ── Adjustment tile ───────────────────────────────────────────────

class _AdjustmentTile extends StatelessWidget {
  final StockAdjustment adj;
  final String currency;
  final VoidCallback onTap;
  const _AdjustmentTile({required this.adj, required this.currency, required this.onTap});

  @override
  Widget build(BuildContext context) {
    final color = _StockAdjustmentsTabState._statusColors[adj.status] ?? Colors.grey;
    final icon = _StockAdjustmentsTabState._reasonIcons[adj.reason] ?? Icons.tune;

    return Card(
      margin: const EdgeInsets.symmetric(vertical: 4),
      child: ListTile(
        onTap: onTap,
        leading: Container(
          width: 44,
          height: 44,
          decoration: BoxDecoration(
            color: color.withOpacity(0.15),
            borderRadius: BorderRadius.circular(10),
          ),
          child: Icon(icon, color: color, size: 22),
        ),
        title: Text(adj.adjustmentNumber, maxLines: 1, overflow: TextOverflow.ellipsis),
        subtitle: Text(
          '${adj.reasonDisplay}  •  ${adj.branchName.isEmpty ? "Branch" : adj.branchName}  •  ${Formatters.date(adj.adjustmentDate)}',
          maxLines: 1,
          overflow: TextOverflow.ellipsis,
          style: const TextStyle(fontSize: 12),
        ),
        trailing: Column(
          crossAxisAlignment: CrossAxisAlignment.end,
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
              decoration: BoxDecoration(
                color: color.withOpacity(0.15),
                borderRadius: BorderRadius.circular(8),
              ),
              child: Text(
                adj.statusDisplay.isEmpty ? adj.status : adj.statusDisplay,
                style: TextStyle(color: color, fontSize: 11, fontWeight: FontWeight.bold),
              ),
            ),
            const SizedBox(height: 2),
            Text(
              '${adj.lineCount} lines • ${currency}${Formatters.number(adj.totalValueImpact.toInt())}',
              style: const TextStyle(fontSize: 11, color: Colors.grey),
            ),
          ],
        ),
      ),
    );
  }
}

// ── Detail dialog with workflow actions ──────────────────────────

class _AdjustmentDetailDialog extends StatelessWidget {
  final StockAdjustment adj;
  final Future<void> Function(String action) onAction;
  const _AdjustmentDetailDialog({required this.adj, required this.onAction});

  @override
  Widget build(BuildContext context) {
    final color = _StockAdjustmentsTabState._statusColors[adj.status] ?? Colors.grey;

    List<_ActionButton> actions() {
      switch (adj.status) {
        case 'draft':
          return const [_ActionButton('Submit', 'submit', Icons.send)];
        case 'pending':
          return const [
            _ActionButton('Approve', 'approve', Icons.check),
            _ActionButton('Reject', 'reject', Icons.close),
          ];
        case 'approved':
          return const [
            _ActionButton('Post to Stock', 'post', Icons.publish),
            _ActionButton('Cancel', 'cancel', Icons.block),
          ];
        default:
          return const [];
      }
    }

    return AlertDialog(
      title: Row(
        children: [
          Text(adj.adjustmentNumber),
          const Spacer(),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
            decoration: BoxDecoration(color: color.withOpacity(0.15), borderRadius: BorderRadius.circular(8)),
            child: Text(adj.statusDisplay, style: TextStyle(color: color, fontWeight: FontWeight.bold, fontSize: 12)),
          ),
        ],
      ),
      content: SizedBox(
        width: double.maxFinite,
        child: SingleChildScrollView(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            mainAxisSize: MainAxisSize.min,
            children: [
              _row('Reason', adj.reasonDisplay),
              _row('Type', adj.adjustmentTypeDisplay),
              _row('Branch', adj.branchName.isEmpty ? '—' : adj.branchName),
              _row('Date', Formatters.date(adj.adjustmentDate)),
              _row('Created by', adj.createdByName.isEmpty ? '—' : adj.createdByName),
              if (adj.approvedByName.isNotEmpty) _row('Approved by', adj.approvedByName),
              _row('Total qty', Formatters.number(adj.totalQuantity.toInt())),
              _row('Value impact', Formatters.currency(adj.totalValueImpact)),
              if (adj.notes.isNotEmpty) ...[
                const SizedBox(height: 8),
                Text('Notes', style: TextStyle(fontSize: 12, color: Theme.of(context).colorScheme.onSurfaceVariant)),
                Text(adj.notes),
              ],
              const SizedBox(height: 12),
              Text('Line items (${adj.lines.length})',
                  style: const TextStyle(fontWeight: FontWeight.bold)),
              const SizedBox(height: 6),
              ...adj.lines.map((l) => ListTile(
                    dense: true,
                    contentPadding: EdgeInsets.zero,
                    leading: const Icon(Icons.inventory_2, size: 20),
                    title: Text(l.productName, maxLines: 1, overflow: TextOverflow.ellipsis),
                    subtitle: Text(
                      'System: ${Formatters.number(l.systemQuantity.toInt())}  •  Counted: ${Formatters.number(l.countedQuantity.toInt())}  •  Change: ${Formatters.number(l.quantityChange.toInt())}',
                      style: const TextStyle(fontSize: 11),
                    ),
                    trailing: Text(Formatters.currency(l.valueImpact),
                        style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 12)),
                  )),
            ],
          ),
        ),
      ),
      actions: [
        TextButton(onPressed: () => Navigator.pop(context), child: const Text('Close')),
        ...actions().map((a) => FilledButton.icon(
              onPressed: () => onAction(a.action),
              icon: Icon(a.icon, size: 18),
              label: Text(a.label),
            )),
      ],
    );
  }

  Widget _row(String label, String value) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 2),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          SizedBox(
            width: 90,
            child: Text(label,
                style: const TextStyle(fontSize: 12, color: Colors.grey)),
          ),
          Expanded(child: Text(value, style: const TextStyle(fontSize: 13))),
        ],
      ),
    );
  }
}

class _ActionButton {
  final String label;
  final String action;
  final IconData icon;
  const _ActionButton(this.label, this.action, this.icon);
}

// ── Create adjustment page ────────────────────────────────────────

class _CreateAdjustmentPage extends ConsumerStatefulWidget {
  const _CreateAdjustmentPage();

  @override
  ConsumerState<_CreateAdjustmentPage> createState() => _CreateAdjustmentPageState();
}

class _CreateAdjustmentPageState extends ConsumerState<_CreateAdjustmentPage> {
  int? _branch;
  String _type = 'decrease';
  String _reason = 'cycle_count';
  DateTime _date = DateTime.now();
  String _notes = '';
  String _submitAs = 'draft'; // draft or pending
  final List<_LineDraft> _lines = [];

  static const _types = ['increase', 'decrease', 'set'];
  static const _reasons = [
    'cycle_count', 'damage', 'theft', 'expiry', 'sample', 'gift',
    'conversion', 'clerical', 'quality', 'po_received', 'other'
  ];

  @override
  Widget build(BuildContext context) {
    final auth = ref.watch(authProvider);
    final branchesAsync = ref.watch(branchesProvider);
    final productsAsync =
        ref.watch(productsProvider(const {}));

    return Scaffold(
      appBar: AppBar(title: const Text('New Adjustment')),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Branch
            branchesAsync.when(
              loading: () => const LinearProgressIndicator(),
              error: (_, __) => const Text('Failed to load branches'),
              data: (branches) => DropdownButtonFormField<int>(
                value: _branch ?? branches.firstWhere((b) => b.isHeadquarters, orElse: () => branches.first).id,
                decoration: const InputDecoration(labelText: 'Branch', border: OutlineInputBorder()),
                items: branches
                    .map((b) => DropdownMenuItem(value: b.id, child: Text(b.name)))
                    .toList(),
                onChanged: (v) => setState(() => _branch = v),
              ),
            ),
            const SizedBox(height: 12),
            Row(
              children: [
                Expanded(
                  child: DropdownButtonFormField<String>(
                    value: _type,
                    decoration: const InputDecoration(labelText: 'Type', border: OutlineInputBorder()),
                    items: _types
                        .map((t) => DropdownMenuItem(
                            value: t,
                            child: Text(t[0].toUpperCase() + t.substring(1))))
                        .toList(),
                    onChanged: (v) => setState(() => _type = v ?? 'decrease'),
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: DropdownButtonFormField<String>(
                    value: _reason,
                    decoration: const InputDecoration(labelText: 'Reason', border: OutlineInputBorder()),
                    items: _reasons
                        .map((r) => DropdownMenuItem(
                            value: r,
                            child: Text(r.replaceAll('_', ' '))))
                        .toList(),
                    onChanged: (v) => setState(() => _reason = v ?? 'cycle_count'),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 12),
            InkWell(
              onTap: () async {
                final d = await showDatePicker(
                  context: context,
                  initialDate: _date,
                  firstDate: DateTime(2000),
                  lastDate: DateTime(2100),
                );
                if (d != null) setState(() => _date = d);
              },
              child: InputDecorator(
                decoration: const InputDecoration(labelText: 'Date', border: OutlineInputBorder()),
                child: Text(Formatters.date(_date.toIso8601String())),
              ),
            ),
            const SizedBox(height: 12),
            TextField(
              decoration: const InputDecoration(labelText: 'Notes', border: OutlineInputBorder()),
              maxLines: 2,
              onChanged: (v) => _notes = v,
            ),
            const SizedBox(height: 16),
            // Lines
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text('Items (${_lines.length})',
                    style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
                productsAsync.when(
                  loading: () => const SizedBox.shrink(),
                  error: (_, __) => const SizedBox.shrink(),
                  data: (products) => TextButton.icon(
                    onPressed: () => _addLine(products),
                    icon: const Icon(Icons.add),
                    label: const Text('Add item'),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 4),
            ..._lines.asMap().entries.map((e) => _LineCard(
                  draft: e.value,
                  index: e.key,
                  onRemove: () => setState(() => _lines.removeAt(e.key)),
                  onChanged: () => setState(() {}),
                )),
            const SizedBox(height: 24),
          ],
        ),
      ),
      bottomNavigationBar: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(12),
          child: Row(
            children: [
              Expanded(
                child: OutlinedButton(
                  onPressed: _lines.isEmpty ? null : () => _save('draft'),
                  child: const Text('Save Draft'),
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: FilledButton(
                  onPressed: _lines.isEmpty ? null : () => _save('pending'),
                  child: const Text('Submit'),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  void _addLine(List<Product> products) {
    if (products.isEmpty) return;
    final p = products.first;
    setState(() {
      _lines.add(_LineDraft(product: p, products: products));
    });
  }

  Future<void> _save(String status) async {
    if (_branch == null || _lines.isEmpty) return;
    final messenger = ScaffoldMessenger.of(context);
    final nav = Navigator.of(context);
    try {
      await createAdjustment(ref,
        branch: _branch!,
        adjustmentType: _type,
        reason: _reason,
        adjustmentDate:
            '${_date.year}-${_date.month.toString().padLeft(2, '0')}-${_date.day.toString().padLeft(2, '0')}',
        notes: _notes,
        status: status,
        lines: _lines
            .where((l) => l.product != null && l.countedController.text.isNotEmpty)
            .map((l) => {
                  'product': l.product!.id,
                  'counted_quantity': double.tryParse(l.countedController.text) ?? 0,
                  'unit_cost': double.tryParse(l.costController.text) ?? 0,
                  if (l.notesController.text.isNotEmpty) 'notes': l.notesController.text,
                })
            .toList(),
      );
      ref.invalidate(stockAdjustmentsProvider);
      ref.invalidate(adjustmentSummaryProvider);
      nav.pop();
      messenger.showSnackBar(SnackBar(
          content: Text(status == 'pending' ? 'Submitted' : 'Saved as draft')));
    } catch (e) {
      messenger.showSnackBar(SnackBar(content: Text('Failed: $e')));
    }
  }
}

class _LineDraft {
  final List<Product> products;
  Product? product;
  final TextEditingController countedController = TextEditingController();
  final TextEditingController costController = TextEditingController();
  final TextEditingController notesController = TextEditingController();

  _LineDraft({required this.products, this.product}) {
    costController.text = (product?.costPrice ?? 0).toString();
  }
}

class _LineCard extends StatelessWidget {
  final _LineDraft draft;
  final int index;
  final VoidCallback onRemove;
  final VoidCallback onChanged;
  const _LineCard({
    required this.draft,
    required this.index,
    required this.onRemove,
    required this.onChanged,
  });

  @override
  Widget build(BuildContext context) {
    return Card(
      margin: const EdgeInsets.symmetric(vertical: 4),
      child: Padding(
        padding: const EdgeInsets.all(12),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Expanded(
                  child: DropdownButtonFormField<Product>(
                    value: draft.product,
                    isExpanded: true,
                    decoration: const InputDecoration(
                      labelText: 'Product',
                      isDense: true,
                      border: OutlineInputBorder(),
                    ),
                    items: draft.products
                        .map((p) => DropdownMenuItem(
                              value: p,
                              child: Text(p.name, overflow: TextOverflow.ellipsis),
                            ))
                        .toList(),
                    onChanged: (p) {
                      draft.product = p;
                      draft.costController.text = (p?.costPrice ?? 0).toString();
                      onChanged();
                    },
                  ),
                ),
                const SizedBox(width: 8),
                IconButton(
                  onPressed: onRemove,
                  icon: const Icon(Icons.delete_outline, color: Colors.red),
                ),
              ],
            ),
            const SizedBox(height: 8),
            Row(
              children: [
                Expanded(
                  child: TextField(
                    controller: draft.countedController,
                    keyboardType: TextInputType.number,
                    decoration: const InputDecoration(
                      labelText: 'Counted qty',
                      isDense: true,
                      border: OutlineInputBorder(),
                    ),
                    onChanged: (_) => onChanged(),
                  ),
                ),
                const SizedBox(width: 8),
                Expanded(
                  child: TextField(
                    controller: draft.costController,
                    keyboardType: const TextInputType.numberWithOptions(decimal: true),
                    decoration: const InputDecoration(
                      labelText: 'Unit cost',
                      isDense: true,
                      border: OutlineInputBorder(),
                    ),
                    onChanged: (_) => onChanged(),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 8),
            TextField(
              controller: draft.notesController,
              decoration: const InputDecoration(
                labelText: 'Notes (optional)',
                isDense: true,
                border: OutlineInputBorder(),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
