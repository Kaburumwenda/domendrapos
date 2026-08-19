/// Suppliers screen — list, search, view supplier details.
/// Mirrors the web app's `/suppliers` page.

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../core/formatters.dart';
import '../../models/index.dart';
import '../../providers/auth_provider.dart';
import '../../providers/data_providers.dart';
import '../../widgets/common.dart';

class SuppliersScreen extends ConsumerStatefulWidget {
  const SuppliersScreen({super.key});

  @override
  ConsumerState<SuppliersScreen> createState() => _SuppliersScreenState();
}

class _SuppliersScreenState extends ConsumerState<SuppliersScreen> {
  final _searchController = TextEditingController();
  String _searchQuery = '';

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final params = _searchQuery.isNotEmpty ? {'search': _searchQuery} : <String, dynamic>{};
    final suppliersAsync = ref.watch(suppliersProvider(params));

    return Scaffold(
      appBar: AppBar(title: const Text('Suppliers')),
      body: Column(
        children: [
          Padding(
            padding: const EdgeInsets.all(12),
            child: TextField(
              controller: _searchController,
              decoration: InputDecoration(
                hintText: 'Search suppliers...',
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
              onRefresh: () async => ref.invalidate(suppliersProvider(params)),
              child: suppliersAsync.when(
                loading: () => const LoadingWidget(),
                error: (e, _) => ErrorStateWidget(
                  message: 'Failed to load suppliers',
                  onRetry: () => ref.invalidate(suppliersProvider(params)),
                ),
                data: (suppliers) {
                  if (suppliers.isEmpty) {
                    return const EmptyState(
                      icon: Icons.local_shipping_outlined,
                      title: 'No suppliers found',
                      message: 'Add suppliers to manage purchase orders.',
                    );
                  }
                  return ListView.builder(
                    itemCount: suppliers.length,
                    itemBuilder: (context, index) {
                      final s = suppliers[index];
                      return Card(
                        margin: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
                        child: ListTile(
                          leading: CircleAvatar(
                            backgroundColor: Theme.of(context).colorScheme.secondaryContainer,
                            child: const Icon(Icons.local_shipping, color: Colors.indigo),
                          ),
                          title: Text(s.name),
                          subtitle: Text([
                            if (s.contactPerson != null) s.contactPerson!,
                            if (s.phone != null) s.phone!,
                          ].join(' • ')),
                          trailing: Column(
                            crossAxisAlignment: CrossAxisAlignment.end,
                            mainAxisAlignment: MainAxisAlignment.center,
                            children: [
                              if (s.rating != null)
                                Row(
                                  mainAxisSize: MainAxisSize.min,
                                  children: [
                                    Icon(Icons.star, size: 14, color: Colors.amber[700]),
                                    Text(s.rating!, style: const TextStyle(fontSize: 12)),
                                  ],
                                ),
                              if (s.leadTimeDays != null)
                                Text('${s.leadTimeDays}d lead', style: const TextStyle(fontSize: 11, color: Colors.grey)),
                            ],
                          ),
                          onTap: () => _showSupplierDetail(s),
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

  void _showSupplierDetail(Supplier s) {
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
              Text(s.name, style: Theme.of(context).textTheme.titleLarge),
              Text('Code: ${s.supplierCode}', style: const TextStyle(color: Colors.grey)),
              const SizedBox(height: 16),
              if (s.contactPerson != null) _detailRow('Contact', s.contactPerson!),
              if (s.email != null) _detailRow('Email', s.email!),
              if (s.phone != null) _detailRow('Phone', s.phone!),
              if (s.city != null) _detailRow('City', s.city!),
              if (s.country != null) _detailRow('Country', s.country!),
              if (s.rating != null) _detailRow('Rating', s.rating!),
              if (s.leadTimeDays != null) _detailRow('Lead Time', '${s.leadTimeDays} days'),
              if (s.paymentTerms != null) _detailRow('Payment Terms', s.paymentTerms!),
              _detailRow('Status', s.isActive ? 'Active' : 'Inactive'),
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
