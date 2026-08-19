/// Shared reusable widgets for the DomendraPOS mobile app.
library;

import 'package:flutter/material.dart';
import '../core/formatters.dart';

// ── KPI Card ─────────────────────────────────────────────────────

class KpiCard extends StatelessWidget {
  final String label;
  final String value;
  final IconData icon;
  final Color? color;
  final String? subtitle;
  final VoidCallback? onTap;

  const KpiCard({
    super.key,
    required this.label,
    required this.value,
    required this.icon,
    this.color,
    this.subtitle,
    this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    final scheme = Theme.of(context).colorScheme;
    final c = color ?? scheme.primary;
    return Card(
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(16),
        child: Padding(
          padding: const EdgeInsets.all(14),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            mainAxisSize: MainAxisSize.min,
            children: [
              Row(
                children: [
                  Container(
                    padding: const EdgeInsets.all(8),
                    decoration: BoxDecoration(
                      color: c.withOpacity(0.12),
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: Icon(icon, color: c, size: 20),
                  ),
                  const Spacer(),
                ],
              ),
              const SizedBox(height: 10),
              Text(
                value,
                style: Theme.of(context).textTheme.titleMedium?.copyWith(
                      fontWeight: FontWeight.bold,
                      color: scheme.onSurface,
                    ),
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
              ),
              const SizedBox(height: 2),
              Text(
                label,
                style: Theme.of(context).textTheme.bodySmall?.copyWith(
                      color: scheme.onSurfaceVariant,
                    ),
              ),
              if (subtitle != null) ...[
                const SizedBox(height: 2),
                Text(
                  subtitle!,
                  style: Theme.of(context).textTheme.bodySmall?.copyWith(
                        color: c,
                        fontWeight: FontWeight.w500,
                      ),
                ),
              ],
            ],
          ),
        ),
      ),
    );
  }
}

// ── Loading State ─────────────────────────────────────────────────

class LoadingWidget extends StatelessWidget {
  final String? message;
  const LoadingWidget({super.key, this.message});

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          const CircularProgressIndicator(),
          if (message != null) ...[
            const SizedBox(height: 16),
            Text(message!, style: Theme.of(context).textTheme.bodyMedium),
          ],
        ],
      ),
    );
  }
}

// ── Empty State ───────────────────────────────────────────────────

class EmptyState extends StatelessWidget {
  final IconData icon;
  final String title;
  final String? message;
  final String? actionLabel;
  final VoidCallback? onAction;

  const EmptyState({
    super.key,
    required this.icon,
    required this.title,
    this.message,
    this.actionLabel,
    this.onAction,
  });

  @override
  Widget build(BuildContext context) {
    final scheme = Theme.of(context).colorScheme;
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(32),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(icon, size: 64, color: scheme.onSurfaceVariant.withOpacity(0.5)),
            const SizedBox(height: 16),
            Text(
              title,
              style: Theme.of(context).textTheme.titleMedium,
              textAlign: TextAlign.center,
            ),
            if (message != null) ...[
              const SizedBox(height: 8),
              Text(
                message!,
                style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                      color: scheme.onSurfaceVariant,
                    ),
                textAlign: TextAlign.center,
              ),
            ],
            if (actionLabel != null && onAction != null) ...[
              const SizedBox(height: 16),
              FilledButton(onPressed: onAction, child: Text(actionLabel!)),
            ],
          ],
        ),
      ),
    );
  }
}

// ── Error State ───────────────────────────────────────────────────

class ErrorStateWidget extends StatelessWidget {
  final String? message;
  final VoidCallback? onRetry;

  const ErrorStateWidget({super.key, this.message, this.onRetry});

  @override
  Widget build(BuildContext context) {
    final scheme = Theme.of(context).colorScheme;
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(24),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(Icons.error_outline, size: 56, color: scheme.error),
            const SizedBox(height: 12),
            Text(
              message ?? 'Something went wrong',
              style: Theme.of(context).textTheme.bodyLarge,
              textAlign: TextAlign.center,
            ),
            if (onRetry != null) ...[
              const SizedBox(height: 12),
              OutlinedButton.icon(
                onPressed: onRetry,
                icon: const Icon(Icons.refresh),
                label: const Text('Retry'),
              ),
            ],
          ],
        ),
      ),
    );
  }
}

// ── App Data Table ────────────────────────────────────────────────

class AppDataTable extends StatelessWidget {
  final List<DataColumn> columns;
  final List<DataRow> rows;
  final bool sortable;

  const AppDataTable({
    super.key,
    required this.columns,
    required this.rows,
    this.sortable = false,
  });

  @override
  Widget build(BuildContext context) {
    if (rows.isEmpty) {
      return const EmptyState(
        icon: Icons.inbox_outlined,
        title: 'No data available',
      );
    }
    return SingleChildScrollView(
      scrollDirection: Axis.horizontal,
      child: SingleChildScrollView(
        child: DataTable(
          columns: columns,
          rows: rows,
          headingRowHeight: 48,
          dataRowMinHeight: 48,
          dataRowMaxHeight: 56,
        ),
      ),
    );
  }
}

// ── Section Header ────────────────────────────────────────────────

class SectionHeader extends StatelessWidget {
  final String title;
  final String? action;
  final VoidCallback? onAction;

  const SectionHeader({
    super.key,
    required this.title,
    this.action,
    this.onAction,
  });

  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(
          title,
          style: Theme.of(context).textTheme.titleMedium?.copyWith(
                fontWeight: FontWeight.bold,
              ),
        ),
        if (action != null && onAction != null)
          TextButton(onPressed: onAction, child: Text(action!)),
      ],
    );
  }
}

// ── Filter Chip Bar ───────────────────────────────────────────────

class FilterChipBar extends StatelessWidget {
  final List<String> options;
  final String selected;
  final ValueChanged<String> onSelected;
  final String? label;

  const FilterChipBar({
    super.key,
    required this.options,
    required this.selected,
    required this.onSelected,
    this.label,
  });

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      height: 44,
      child: ListView(
        scrollDirection: Axis.horizontal,
        children: [
          if (label != null)
            Center(
              child: Padding(
                padding: const EdgeInsets.only(right: 8),
                child: Text(
                  label!,
                  style: Theme.of(context).textTheme.labelLarge?.copyWith(
                        color: Theme.of(context).colorScheme.onSurfaceVariant,
                      ),
                ),
              ),
            ),
          ...options.map((opt) {
            final isSelected = opt == selected;
            return Padding(
              padding: const EdgeInsets.only(right: 8),
              child: FilterChip(
                label: Text(opt),
                selected: isSelected,
                onSelected: (_) => onSelected(opt),
              ),
            );
          }),
        ],
      ),
    );
  }
}

// ── Receipt Widget ──────────────────────────────────────────────

class ReceiptWidget extends StatelessWidget {
  final String number;
  final List<ReceiptItem> items;
  final double subtotal;
  final double discount;
  final double tax;
  final double total;
  final String paymentMethod;
  final double? tendered;
  final double? change;
  final String? paymentReference;
  final String? cashierName;
  final String? customerName;
  final String? customerPhone;
  final String? branchName;
  final String? businessName;
  final String currency;

  const ReceiptWidget({
    super.key,
    required this.number,
    required this.items,
    required this.subtotal,
    required this.discount,
    required this.tax,
    required this.total,
    required this.paymentMethod,
    this.tendered,
    this.change,
    this.paymentReference,
    this.cashierName,
    this.customerName,
    this.customerPhone,
    this.branchName,
    this.businessName,
    this.currency = 'KSh',
  });

  String get _paymentLabel {
    const labels = {
      'cash': 'Cash',
      'mpesa': 'M-Pesa',
      'card': 'Card',
      'insurance': 'Insurance',
      'credit': 'Credit',
      'bank_transfer': 'Bank Transfer',
    };
    return labels[paymentMethod] ?? paymentMethod;
  }

  String _fmt(double v) => Formatters.currency(v, currency);

  @override
  Widget build(BuildContext context) {
    final scheme = Theme.of(context).colorScheme;
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: scheme.surface,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: scheme.outlineVariant.withOpacity(0.4)),
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          // Header
          Container(
            padding: const EdgeInsets.all(8),
            decoration: BoxDecoration(color: scheme.primaryContainer, shape: BoxShape.circle),
            child: Icon(Icons.store, size: 24, color: scheme.onPrimaryContainer),
          ),
          const SizedBox(height: 10),
          Text(
            businessName ?? 'DomendraPOS',
            style: const TextStyle(fontSize: 17, fontWeight: FontWeight.bold),
          ),
          if (branchName != null)
            Text(branchName!, style: TextStyle(fontSize: 11, color: scheme.onSurfaceVariant)),
          Text(_todayDate(), style: TextStyle(fontSize: 11, color: scheme.onSurfaceVariant)),
          _dashedDivider(),
          // Meta
          _metaRow('Receipt #', number, scheme),
          _metaRow('Date', Formatters.dateTime(DateTime.now()), scheme),
          if (cashierName != null) _metaRow('Cashier', cashierName!, scheme),
          if (customerName != null && customerName!.isNotEmpty)
            _metaRow('Customer', customerName!, scheme),
          if (customerPhone != null && customerPhone!.isNotEmpty)
            _metaRow('Phone', customerPhone!, scheme),
          _dashedDivider(),
          // Items header
          Row(
            children: [
              Expanded(flex: 4, child: Text('Item', style: _headerStyle(scheme))),
              Expanded(flex: 1, child: Text('Qty', style: _headerStyle(scheme), textAlign: TextAlign.center)),
              Expanded(flex: 2, child: Text('Price', style: _headerStyle(scheme), textAlign: TextAlign.right)),
              Expanded(flex: 2, child: Text('Total', style: _headerStyle(scheme), textAlign: TextAlign.right)),
            ],
          ),
          const SizedBox(height: 4),
          ...items.map((item) => Padding(
                padding: const EdgeInsets.symmetric(vertical: 2),
                child: Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Expanded(flex: 4, child: Text(item.name, style: const TextStyle(fontSize: 12), maxLines: 2, overflow: TextOverflow.ellipsis)),
                    Expanded(flex: 1, child: Text('${item.qty.toInt()}', style: const TextStyle(fontSize: 12), textAlign: TextAlign.center)),
                    Expanded(flex: 2, child: Text(_fmt(item.price), style: const TextStyle(fontSize: 12), textAlign: TextAlign.right)),
                    Expanded(flex: 2, child: Text(_fmt(item.price * item.qty), style: const TextStyle(fontSize: 12), textAlign: TextAlign.right)),
                  ],
                ),
              )),
          _dashedDivider(),
          // Totals
          _totalRow('Subtotal', _fmt(subtotal), scheme),
          if (discount > 0) _totalRow('Discount', '-${_fmt(discount)}', scheme),
          if (tax > 0) _totalRow('Tax', _fmt(tax), scheme),
          const SizedBox(height: 6),
          Divider(thickness: 2, color: scheme.onSurface.withOpacity(0.15)),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text('TOTAL', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: scheme.onSurface)),
              Text(_fmt(total), style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: scheme.primary)),
            ],
          ),
          _dashedDivider(),
          // Payment
          _totalRow('Payment Method', _paymentLabel, scheme),
          if (tendered != null) _totalRow('Tendered', _fmt(tendered!), scheme),
          if (change != null && change! > 0) _totalRow('Change', _fmt(change!), scheme),
          if (paymentReference != null && paymentReference!.isNotEmpty)
            _totalRow('Ref', paymentReference!, scheme),
          _dashedDivider(),
          // Footer
          const Text('Thank you for shopping with us!', style: TextStyle(fontSize: 13, fontWeight: FontWeight.bold)),
          const SizedBox(height: 4),
          Text('Returns accepted within 7 days with receipt.', style: TextStyle(fontSize: 10, color: scheme.onSurfaceVariant)),
          const SizedBox(height: 8),
          Text('Powered by DomendraPOS', style: TextStyle(fontSize: 10, color: scheme.onSurfaceVariant.withOpacity(0.7), fontStyle: FontStyle.italic)),
        ],
      ),
    );
  }

  TextStyle _headerStyle(ColorScheme scheme) => TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: scheme.onSurfaceVariant);

  Widget _dashedDivider() {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 10),
      child: CustomPaint(
        size: const Size(double.infinity, 1),
        painter: _DashedLinePainter(),
      ),
    );
  }

  Widget _metaRow(String label, String value, ColorScheme scheme) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 1),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(label, style: TextStyle(fontSize: 11, color: scheme.onSurfaceVariant)),
          Text(value, style: const TextStyle(fontSize: 12)),
        ],
      ),
    );
  }

  Widget _totalRow(String label, String value, ColorScheme scheme) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 1),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(label, style: TextStyle(fontSize: 13, color: scheme.onSurfaceVariant)),
          Text(value, style: TextStyle(fontSize: 13, color: scheme.onSurface)),
        ],
      ),
    );
  }

  String _todayDate() {
    final now = DateTime.now();
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return '${now.day} ${months[now.month - 1]} ${now.year}';
  }
}

class ReceiptItem {
  final String name;
  final double qty;
  final double price;

  const ReceiptItem({required this.name, required this.qty, required this.price});
}

class _DashedLinePainter extends CustomPainter {
  @override
  void paint(Canvas canvas, Size size) {
    final paint = Paint()
      ..color = Colors.grey.shade400
      ..strokeWidth = 1
      ..strokeCap = StrokeCap.round;
    const dashWidth = 4.0;
    const dashSpace = 3.0;
    double x = 0;
    while (x < size.width) {
      canvas.drawLine(Offset(x, 0), Offset(x + dashWidth, 0), paint);
      x += dashWidth + dashSpace;
    }
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => false;
}
