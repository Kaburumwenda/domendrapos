/// Sales screen — overview of sales transactions, invoices, returns.
/// Mirrors the web app's `/sales` page.

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../core/api_client.dart';
import '../../core/formatters.dart';
import '../../providers/auth_provider.dart';
import '../../widgets/common.dart';

final salesProvider = FutureProvider<Map<String, dynamic>>((ref) async {
  final api = ref.watch(apiClientProvider);
  final res = await api.get('/sales/', query: {'page_size': 100});
  final data = res.data;
  if (data is List) return {'sales': data};
  return data as Map<String, dynamic>;
});

class SalesScreen extends ConsumerStatefulWidget {
  const SalesScreen({super.key});

  @override
  ConsumerState<SalesScreen> createState() => _SalesScreenState();
}

class _SalesScreenState extends ConsumerState<SalesScreen> {
  String _statusFilter = 'all';

  @override
  Widget build(BuildContext context) {
    final auth = ref.watch(authProvider);
    final currency = auth.billing?.currency ?? 'KSh';
    final salesAsync = ref.watch(salesProvider);

    return Scaffold(
      appBar: AppBar(title: const Text('Sales')),
      body: Column(
        children: [
          // Summary KPIs
          salesAsync.when(
            loading: () => const SizedBox(height: 120, child: LoadingWidget()),
            error: (_, __) => const SizedBox.shrink(),
            data: (data) {
              final sales = (data['sales'] ?? data['results'] ?? data) as List;
              final totalRevenue = sales.fold<double>(0, (sum, s) {
                final m = s as Map;
                return sum + Formatters.toDouble(m['total'] ?? m['grand_total'] ?? 0);
              });
              final completed = sales.where((s) => (s as Map)['status'] == 'completed').length;
              final pending = sales.where((s) => (s as Map)['status'] == 'pending').length;

              return Padding(
                padding: const EdgeInsets.all(12),
                child: GridView.count(
                  crossAxisCount: 3,
                  shrinkWrap: true,
                  physics: const NeverScrollableScrollPhysics(),
                  crossAxisSpacing: 8,
                  mainAxisSpacing: 8,
                  childAspectRatio: 1.1,
                  children: [
                    KpiCard(
                      label: 'Revenue',
                      value: Formatters.currency(totalRevenue, currency),
                      icon: Icons.monetization_on,
                      color: Colors.green,
                    ),
                    KpiCard(
                      label: 'Completed',
                      value: Formatters.number(completed),
                      icon: Icons.check_circle,
                      color: Colors.blue,
                    ),
                    KpiCard(
                      label: 'Pending',
                      value: Formatters.number(pending),
                      icon: Icons.pending,
                      color: Colors.orange,
                    ),
                  ],
                ),
              );
            },
          ),
          // Status filter
          FilterChipBar(
            options: const ['all', 'completed', 'pending', 'voided', 'refunded'],
            selected: _statusFilter,
            onSelected: (v) => setState(() => _statusFilter = v),
            label: 'Filter:',
          ),
          // Sales list
          Expanded(
            child: RefreshIndicator(
              onRefresh: () async => ref.invalidate(salesProvider),
              child: salesAsync.when(
                loading: () => const LoadingWidget(),
                error: (e, _) => ErrorStateWidget(
                  message: 'Failed to load sales',
                  onRetry: () => ref.invalidate(salesProvider),
                ),
                data: (data) {
                  final sales = (data['sales'] ?? data['results'] ?? data) as List;
                  final filtered = _statusFilter == 'all'
                      ? sales
                      : sales.where((s) => (s as Map)['status'] == _statusFilter).toList();
                  if (filtered.isEmpty) {
                    return const EmptyState(
                      icon: Icons.receipt_long_outlined,
                      title: 'No sales',
                      message: 'Sales transactions will appear here.',
                    );
                  }
                  return ListView.builder(
                    itemCount: filtered.length,
                    itemBuilder: (context, index) {
                      final sale = filtered[index] as Map;
                      final status = sale['status'] as String? ?? 'completed';
                      final statusColors = {
                        'completed': Colors.green,
                        'pending': Colors.orange,
                        'voided': Colors.red,
                        'refunded': Colors.purple,
                      };
                      return Card(
                        margin: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
                        child: ExpansionTile(
                          leading: CircleAvatar(
                            backgroundColor: (statusColors[status] ?? Colors.grey).withOpacity(0.15),
                            child: Icon(Icons.receipt, color: statusColors[status] ?? Colors.grey, size: 20),
                          ),
                          title: Text(sale['invoice_number'] ?? 'Sale #${sale['id']}'),
                          subtitle: Text(
                            '${Formatters.date(sale['created_at'] ?? sale['date'])} • ${sale["customer_name"] ?? "Walk-in"}',
                          ),
                          trailing: Text(
                            Formatters.currency(sale['total'] ?? sale['grand_total'] ?? 0, currency),
                            style: const TextStyle(fontWeight: FontWeight.bold),
                          ),
                          children: [
                            ListTile(
                              dense: true,
                              title: const Text('Items'),
                              trailing: Text(Formatters.number(sale['items_count'] ?? 0)),
                            ),
                            ListTile(
                              dense: true,
                              title: const Text('Subtotal'),
                              trailing: Text(Formatters.currency(sale['subtotal'] ?? 0, currency)),
                            ),
                            ListTile(
                              dense: true,
                              title: const Text('Tax'),
                              trailing: Text(Formatters.currency(sale['tax_amount'] ?? 0, currency)),
                            ),
                            ListTile(
                              dense: true,
                              title: const Text('Discount'),
                              trailing: Text('-${Formatters.currency(sale['discount_amount'] ?? 0, currency)}'),
                            ),
                            ListTile(
                              dense: true,
                              title: const Text('Payment Method'),
                              trailing: Text((sale['payment_method'] ?? 'cash').toString().toUpperCase()),
                            ),
                          ],
                        ),
                      );
                    },
                  );
                },
              ),
            ),
          ),
        ],
      ),
    );
  }
}
