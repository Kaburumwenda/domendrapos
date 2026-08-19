/// Customers screen — list, search, view customer details.
/// Mirrors the web app's `/customers` page.

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../core/formatters.dart';
import '../../models/index.dart';
import '../../providers/auth_provider.dart';
import '../../providers/data_providers.dart';
import '../../widgets/common.dart';

class CustomersScreen extends ConsumerStatefulWidget {
  const CustomersScreen({super.key});

  @override
  ConsumerState<CustomersScreen> createState() => _CustomersScreenState();
}

class _CustomersScreenState extends ConsumerState<CustomersScreen> {
  final _searchController = TextEditingController();
  String _searchQuery = '';

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final auth = ref.watch(authProvider);
    final currency = auth.billing?.currency ?? 'KSh';
    final params = _searchQuery.isNotEmpty ? {'search': _searchQuery} : <String, dynamic>{};
    final customersAsync = ref.watch(customersProvider(params));

    return Scaffold(
      appBar: AppBar(title: const Text('Customers')),
      body: Column(
        children: [
          Padding(
            padding: const EdgeInsets.all(12),
            child: TextField(
              controller: _searchController,
              decoration: InputDecoration(
                hintText: 'Search customers...',
                prefixIcon: const Icon(Icons.search),
                suffixIcon: _searchQuery.isNotEmpty
                    ? IconButton(
                        icon: const Icon(Icons.clear),
                        onPressed: () {
                          _searchController.clear();
                          setState(() => _searchQuery = '');
                        },
                      )
                    : null,
                border: const OutlineInputBorder(),
              ),
              onChanged: (v) => setState(() => _searchQuery = v.toLowerCase()),
            ),
          ),
          Expanded(
            child: RefreshIndicator(
              onRefresh: () async => ref.invalidate(customersProvider(params)),
              child: customersAsync.when(
                loading: () => const LoadingWidget(),
                error: (e, _) => ErrorStateWidget(
                  message: 'Failed to load customers',
                  onRetry: () => ref.invalidate(customersProvider(params)),
                ),
                data: (customers) {
                  if (customers.isEmpty) {
                    return const EmptyState(
                      icon: Icons.people_outline,
                      title: 'No customers found',
                      message: 'Add customers to start tracking loyalty and credit.',
                    );
                  }
                  return ListView.builder(
                    itemCount: customers.length,
                    itemBuilder: (context, index) {
                      final c = customers[index];
                      return Card(
                        margin: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
                        child: ListTile(
                          leading: CircleAvatar(
                            backgroundColor: Theme.of(context).colorScheme.primaryContainer,
                            child: Text(
                              c.fullName.isNotEmpty ? c.fullName[0].toUpperCase() : '?',
                              style: TextStyle(color: Theme.of(context).colorScheme.primary),
                            ),
                          ),
                          title: Text(c.fullName),
                          subtitle: Text([
                            if (c.phone != null) c.phone!,
                            if (c.cityName != null) c.cityName!,
                            if (c.loyaltyPoints > 0) '${c.loyaltyPoints} pts',
                          ].join(' • ')),
                          trailing: c.currentCreditBalance != null
                              ? Column(
                                  crossAxisAlignment: CrossAxisAlignment.end,
                                  mainAxisAlignment: MainAxisAlignment.center,
                                  children: [
                                    Text(
                                      Formatters.currency(c.currentCreditBalance, currency),
                                      style: TextStyle(
                                        fontSize: 12,
                                        color: Formatters.toDouble(c.currentCreditBalance) > 0 ? Colors.red : Colors.grey,
                                      ),
                                    ),
                                    Container(
                                      padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                                      decoration: BoxDecoration(
                                        color: _tierColor(c.loyaltyTier).withOpacity(0.15),
                                        borderRadius: BorderRadius.circular(4),
                                      ),
                                      child: Text(
                                        c.loyaltyTier.toUpperCase(),
                                        style: TextStyle(fontSize: 10, color: _tierColor(c.loyaltyTier), fontWeight: FontWeight.bold),
                                      ),
                                    ),
                                  ],
                                )
                              : null,
                          onTap: () => _showCustomerDetail(c, currency),
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

  Color _tierColor(String tier) {
    switch (tier) {
      case 'platinum': return Colors.blueGrey;
      case 'gold': return Colors.amber;
      case 'silver': return Colors.grey;
      default: return Colors.brown;
    }
  }

  void _showCustomerDetail(Customer c, String currency) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      builder: (context) => DraggableScrollableSheet(
        initialChildSize: 0.6,
        minChildSize: 0.3,
        maxChildSize: 0.85,
        expand: false,
        builder: (context, controller) => SingleChildScrollView(
          controller: controller,
          padding: const EdgeInsets.all(24),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  CircleAvatar(
                    radius: 28,
                    backgroundColor: Theme.of(context).colorScheme.primaryContainer,
                    child: Text(c.fullName.isNotEmpty ? c.fullName[0].toUpperCase() : '?',
                        style: TextStyle(fontSize: 22, color: Theme.of(context).colorScheme.primary)),
                  ),
                  const SizedBox(width: 16),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(c.fullName, style: Theme.of(context).textTheme.titleLarge),
                        Text('Code: ${c.customerCode}', style: const TextStyle(color: Colors.grey)),
                      ],
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 16),
              if (c.email != null) _detailRow('Email', c.email!),
              if (c.phone != null) _detailRow('Phone', c.phone!),
              if (c.cityName != null) _detailRow('City', c.cityName!),
              _detailRow('Type', c.customerType),
              _detailRow('Loyalty Tier', c.loyaltyTier.toUpperCase()),
              _detailRow('Loyalty Points', Formatters.number(c.loyaltyPoints)),
              if (c.creditLimit != null) _detailRow('Credit Limit', Formatters.currency(c.creditLimit, currency)),
              if (c.currentCreditBalance != null)
                _detailRow('Credit Balance', Formatters.currency(c.currentCreditBalance, currency)),
              _detailRow('Status', c.isActive ? 'Active' : 'Inactive'),
              if (c.createdAt != null) _detailRow('Joined', Formatters.date(c.createdAt)),
            ],
          ),
        ),
      ),
    );
  }

  Widget _detailRow(String label, String value) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(label, style: const TextStyle(color: Colors.grey)),
          Text(value, style: const TextStyle(fontWeight: FontWeight.w500)),
        ],
      ),
    );
  }
}
