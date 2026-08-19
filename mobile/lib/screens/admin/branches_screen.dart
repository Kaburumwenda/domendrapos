/// Branches management screen — list, add, edit branches.
/// Mirrors the web app's `/admin/branches` page.

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../core/formatters.dart';
import '../../models/index.dart';
import '../../providers/auth_provider.dart';
import '../../providers/data_providers.dart';
import '../../widgets/common.dart';

class BranchesScreen extends ConsumerWidget {
  const BranchesScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final branchesAsync = ref.watch(branchesProvider);

    return Scaffold(
      appBar: AppBar(title: const Text('Branches')),
      body: RefreshIndicator(
        onRefresh: () async => ref.invalidate(branchesProvider),
        child: branchesAsync.when(
          loading: () => const LoadingWidget(),
          error: (e, _) => ErrorStateWidget(
            message: 'Failed to load branches',
            onRetry: () => ref.invalidate(branchesProvider),
          ),
          data: (branches) {
            if (branches.isEmpty) {
              return const EmptyState(icon: Icons.store, title: 'No branches found');
            }
            return ListView.builder(
              padding: const EdgeInsets.all(12),
              itemCount: branches.length,
              itemBuilder: (context, index) {
                final b = branches[index];
                return Card(
                  margin: const EdgeInsets.only(bottom: 8),
                  child: ExpansionTile(
                    leading: CircleAvatar(
                      backgroundColor: b.isActive ? Colors.green.withOpacity(0.15) : Colors.red.withOpacity(0.15),
                      child: Icon(
                        b.isHeadquarters ? Icons.stars : Icons.store,
                        color: b.isHeadquarters ? Colors.amber : (b.isActive ? Colors.green : Colors.red),
                      ),
                    ),
                    title: Text(b.name),
                    subtitle: Text([
                      if (b.code.isNotEmpty) 'Code: ${b.code}',
                      if (b.city != null) b.city!,
                    ].join(' • ')),
                    children: [
                      ListTile(
                        dense: true,
                        title: const Text('Phone'),
                        trailing: Text(b.phone ?? '-'),
                      ),
                      ListTile(
                        dense: true,
                        title: const Text('Email'),
                        trailing: Text(b.email ?? '-'),
                      ),
                      ListTile(
                        dense: true,
                        title: const Text('Currency'),
                        trailing: Text(b.currencyCode),
                      ),
                      ListTile(
                        dense: true,
                        title: const Text('Tax Rate'),
                        trailing: Text('${b.taxRate}%'),
                      ),
                      ListTile(
                        dense: true,
                        title: const Text('Registers'),
                        trailing: Text(Formatters.number(b.registerCount)),
                      ),
                      ListTile(
                        dense: true,
                        title: const Text('Headquarters'),
                        trailing: b.isHeadquarters
                            ? const Icon(Icons.check_circle, color: Colors.green)
                            : const Icon(Icons.cancel, color: Colors.grey),
                      ),
                      ListTile(
                        dense: true,
                        title: const Text('Status'),
                        trailing: Text(
                          b.isActive ? 'Active' : 'Inactive',
                          style: TextStyle(color: b.isActive ? Colors.green : Colors.red),
                        ),
                      ),
                    ],
                  ),
                );
              },
            );
          },
        ),
      ),
    );
  }
}
