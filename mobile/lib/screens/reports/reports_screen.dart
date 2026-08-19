/// Reports screen — tabbed report view with date range filters.
/// Mirrors the web app's `/reports` page (12 report types).

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../core/formatters.dart';
import '../../providers/auth_provider.dart';
import '../../providers/data_providers.dart';
import '../../widgets/common.dart';

class ReportsScreen extends ConsumerStatefulWidget {
  const ReportsScreen({super.key});

  @override
  ConsumerState<ReportsScreen> createState() => _ReportsScreenState();
}

class _ReportsScreenState extends ConsumerState<ReportsScreen> {
  String _activeReport = 'dashboard';
  String _datePreset = 'this_month';

  static const _reports = [
    ('dashboard', 'Summary', Icons.dashboard),
    ('sales-summary', 'Sales', Icons.receipt_long),
    ('sales-by-product', 'Products', Icons.inventory_2),
    ('sales-by-branch', 'Branches', Icons.store),
    ('sales-by-cashier', 'Cashiers', Icons.people),
    ('daily-revenue', 'Daily Revenue', Icons.trending_up),
    ('profit-margin', 'Profit', Icons.monetization_on),
    ('payment-methods', 'Payments', Icons.payment),
    ('inventory-valuation', 'Inventory', Icons.inventory),
    ('low-stock', 'Low Stock', Icons.warning_amber),
    ('top-customers', 'Top Customers', Icons.person),
    ('tax-collected', 'Tax', Icons.receipt),
    ('stock-movement', 'Stock Moves', Icons.swap_vert),
  ];

  static const _presets = {
    'today': Duration(days: 0),
    'this_week': Duration(days: 7),
    'this_month': Duration(days: 30),
    'this_quarter': Duration(days: 90),
    'this_year': Duration(days: 365),
  };

  Map<String, dynamic> get _queryParams {
    final now = DateTime.now();
    final days = _presets[_datePreset] ?? const Duration(days: 30);
    final from = now.subtract(days);
    return {
      'date_from': '${from.year}-${from.month.toString().padLeft(2, '0')}-${from.day.toString().padLeft(2, '0')}',
      'date_to': '${now.year}-${now.month.toString().padLeft(2, '0')}-${now.day.toString().padLeft(2, '0')}',
    };
  }

  String get _reportPath {
    switch (_activeReport) {
      case 'inventory-valuation':
        return 'inventory-valuation/';
      case 'low-stock':
        return 'low-stock/';
      case 'payment-methods':
        return 'payment-methods/';
      case 'top-customers':
        return 'top-customers/';
      case 'tax-collected':
        return 'tax-collected/';
      case 'stock-movement':
        return 'stock-movement/';
      case 'daily-revenue':
        return 'daily-revenue/';
      case 'profit-margin':
        return 'profit-margin/';
      case 'sales-summary':
        return 'sales-summary/';
      case 'sales-by-product':
        return 'sales-by-product/';
      case 'sales-by-branch':
        return 'sales-by-branch/';
      case 'sales-by-cashier':
        return 'sales-by-cashier/';
      default:
        return 'dashboard/';
    }
  }

  @override
  Widget build(BuildContext context) {
    final auth = ref.watch(authProvider);
    final currency = auth.billing?.currency ?? 'KSh';

    final reportParams = {..._queryParams};
    final reportAsync = ref.watch(reportProvider(_reportPath));

    return Scaffold(
      appBar: AppBar(title: const Text('Reports')),
      body: Column(
        children: [
          // Report tabs
          SizedBox(
            height: 48,
            child: ListView(
              scrollDirection: Axis.horizontal,
              padding: const EdgeInsets.symmetric(horizontal: 8),
              children: _reports.map((r) {
                final isActive = _activeReport == r.$1;
                return Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 4),
                  child: FilterChip(
                    label: Text(r.$2),
                    avatar: Icon(r.$3, size: 16),
                    selected: isActive,
                    onSelected: (_) => setState(() => _activeReport = r.$1),
                  ),
                );
              }).toList(),
            ),
          ),
          // Date preset
          FilterChipBar(
            options: const ['today', 'this_week', 'this_month', 'this_quarter', 'this_year'],
            selected: _datePreset,
            onSelected: (v) => setState(() => _datePreset = v),
            label: 'Range:',
          ),
          Expanded(
            child: RefreshIndicator(
              onRefresh: () async => ref.invalidate(reportProvider(_reportPath)),
              child: reportAsync.when(
                loading: () => const LoadingWidget(),
                error: (e, _) => ErrorStateWidget(
                  message: 'Failed to load report',
                  onRetry: () => ref.invalidate(reportProvider(_reportPath)),
                ),
                data: (data) => _ReportView(
                  reportType: _activeReport,
                  data: data,
                  currency: currency,
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class _ReportView extends StatelessWidget {
  final String reportType;
  final dynamic data;
  final String currency;

  const _ReportView({required this.reportType, required this.data, required this.currency});

  @override
  Widget build(BuildContext context) {
    if (data == null) {
      return const EmptyState(icon: Icons.assessment_outlined, title: 'No data');
    }

    if (data is Map<String, dynamic>) {
      return _buildMapReport(context, data);
    }
    if (data is List) {
      if (data.isEmpty) {
        return const EmptyState(icon: Icons.inbox_outlined, title: 'No data for this report');
      }
      return _buildListReport(context, data);
    }
    return Center(child: Text('Unknown data format'));
  }

  Widget _buildMapReport(BuildContext context, Map<String, dynamic> data) {
    final kpis = <_KpiInfo>[];
    final currencyKpis = ['revenue', 'total_revenue', 'total_sales', 'profit', 'total_profit',
        'total_tax', 'tax_collected', 'inventory_value', 'total_discount', 'total_cost'];
    final numberKpis = ['total_orders', 'total_invoices', 'count', 'total_customers',
        'total_products', 'low_stock_count', 'items_sold'];

    for (final entry in data.entries) {
      if (entry.key == 'results' || entry.key == 'items' || entry.key == 'data') continue;
      if (currencyKpis.contains(entry.key)) {
        kpis.add(_KpiInfo(entry.key, Formatters.currency(entry.value, currency), Icons.monetization_on));
      } else if (numberKpis.contains(entry.key)) {
        kpis.add(_KpiInfo(entry.key, Formatters.number(entry.value), Icons.numbers));
      }
    }

    return SingleChildScrollView(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          if (kpis.isNotEmpty) ...[
            GridView.count(
              crossAxisCount: 2,
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              crossAxisSpacing: 12,
              mainAxisSpacing: 12,
              childAspectRatio: 1.5,
              children: kpis.take(6).map((kpi) => KpiCard(
                label: kpi.label.replaceAll('_', ' ').splitWords(),
                value: kpi.value,
                icon: kpi.icon,
              )).toList(),
            ),
            const SizedBox(height: 16),
          ],
          // Nested data arrays
          for (final entry in data.entries)
            if (entry.value is List && (entry.value as List).isNotEmpty) ...[
              SectionHeader(title: entry.key.replaceAll('_', ' ').splitWords()),
              const SizedBox(height: 8),
              _buildListReport(context, entry.value as List),
              const SizedBox(height: 16),
            ],
          // Remaining key-value pairs
          ...data.entries.where((e) =>
            !currencyKpis.contains(e.key) &&
            !numberKpis.contains(e.key) &&
            e.value is! List &&
            e.key != 'results' &&
            e.key != 'items'
          ).map((e) => ListTile(
            dense: true,
            title: Text(e.key.replaceAll('_', ' ').splitWords()),
            trailing: Text(e.value.toString()),
          )),
        ],
      ),
    );
  }

  Widget _buildListReport(BuildContext context, List data) {
    if (data.isEmpty) return const SizedBox.shrink();
    final first = data.first;
    if (first is! Map) {
      return Card(
        child: Column(
          children: data.map<Widget>((e) => ListTile(
            dense: true,
            title: Text(e.toString()),
          )).toList(),
        ),
      );
    }
    final keys = (first as Map).keys.take(5).toList();

    return SingleChildScrollView(
      scrollDirection: Axis.horizontal,
      child: DataTable(
        columns: keys.map((k) => DataColumn(
          label: Text(k.toString().replaceAll('_', ' ').splitWords()),
        )).toList(),
        rows: data.take(50).map((item) {
          final m = item as Map;
          return DataRow(
            cells: keys.map((k) {
              final v = m[k];
              final valueStr = currencyKpis().contains(k.toString())
                  ? Formatters.currency(v, currency)
                  : k.toString().contains('percent') || k.toString().contains('margin')
                    ? Formatters.percent(v)
                    : v.toString();
              return DataCell(Text(valueStr, style: const TextStyle(fontSize: 13)));
            }).toList(),
          );
        }).toList(),
      ),
    );
  }

  List<String> currencyKpis() => ['revenue', 'total', 'amount', 'value', 'sales', 'cost', 'price', 'profit', 'balance'];
}

class _KpiInfo {
  final String label;
  final String value;
  final IconData icon;
  const _KpiInfo(this.label, this.value, this.icon);
}

extension on String {
  String splitWords() {
    return splitMapJoin(
      RegExp(r'[A-Z]'),
      onMatch: (m) => ' ${m[0]}',
    ).trim().split(' ').first.toUpperCase() +
      ' ' +
      substring(split(' ').first.length + 1);
  }
}
