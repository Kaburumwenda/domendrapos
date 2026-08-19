/// Staff management screen — list, add, edit staff.
/// Mirrors the web app's `/admin/staff` page.

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../core/formatters.dart';
import '../../providers/auth_provider.dart';
import '../../widgets/common.dart';

class StaffScreen extends ConsumerStatefulWidget {
  const StaffScreen({super.key});

  @override
  ConsumerState<StaffScreen> createState() => _StaffScreenState();
}

class _StaffScreenState extends ConsumerState<StaffScreen> {
  @override
  Widget build(BuildContext context) {
    return DefaultTabController(
      length: 2,
      child: Scaffold(
        appBar: AppBar(
          title: const Text('Staff'),
          bottom: const TabBar(tabs: [Tab(text: 'Staff'), Tab(text: 'Roles')]),
        ),
        body: TabBarView(
          children: [_StaffTab(), _RolesTab()],
        ),
      ),
    );
  }
}

class _StaffTab extends ConsumerStatefulWidget {
  @override
  ConsumerState<_StaffTab> createState() => _StaffTabState();
}

class _StaffTabState extends ConsumerState<_StaffTab> {
  Future<List<Map<String, dynamic>>> _fetchStaff(apiClient) async {
    final res = await apiClient.get('/users/staff/', query: {'page_size': 100});
    final data = res.data;
    if (data is List) return List<Map<String, dynamic>>.from(data);
    if (data is Map<String, dynamic> && data['results'] is List) {
      return List<Map<String, dynamic>>.from(data['results']);
    }
    return [];
  }

  @override
  Widget build(BuildContext context) {
    final api = ref.watch(apiClientProvider);
    return FutureBuilder(
      future: _fetchStaff(api),
      builder: (context, snapshot) {
        if (snapshot.connectionState == ConnectionState.waiting) return const LoadingWidget();
        if (snapshot.hasError) {
          return ErrorStateWidget(message: 'Failed to load staff', onRetry: () => setState(() {}));
        }
        final staff = snapshot.data ?? [];
        if (staff.isEmpty) return const EmptyState(icon: Icons.people_outline, title: 'No staff members');
        return ListView.builder(
          itemCount: staff.length,
          itemBuilder: (context, index) {
            final s = staff[index];
            final name = '${s['first_name'] ?? ""} ${s['last_name'] ?? ""}'.trim();
            final role = s['role'] as String? ?? 'staff';
            final roleColors = {
              'super_admin': Colors.red,
              'tenant_admin': Colors.purple,
              'manager': Colors.blue,
              'cashier': Colors.green,
              'viewer': Colors.grey,
            };
            return Card(
              margin: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
              child: ListTile(
                leading: CircleAvatar(
                  child: Text(name.isNotEmpty ? name[0].toUpperCase() : '?'),
                ),
                title: Text(name.isNotEmpty ? name : 'Unnamed'),
                subtitle: Text(s['email'] ?? ''),
                trailing: Container(
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                  decoration: BoxDecoration(
                    color: (roleColors[role] ?? Colors.grey).withOpacity(0.15),
                    borderRadius: BorderRadius.circular(4),
                  ),
                  child: Text(
                    role.toUpperCase(),
                    style: TextStyle(
                      fontSize: 11,
                      color: roleColors[role] ?? Colors.grey,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ),
              ),
            );
          },
        );
      },
    );
  }
}

class _RolesTab extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    final roles = [
      ('Super Admin', 'Full system access', Colors.red),
      ('Tenant Admin', 'Tenant-level management', Colors.purple),
      ('Manager', 'Branch management', Colors.blue),
      ('Cashier', 'POS operations', Colors.green),
      ('Viewer', 'Read-only access', Colors.grey),
    ];
    return ListView.builder(
      padding: const EdgeInsets.all(12),
      itemCount: roles.length,
      itemBuilder: (context, index) {
        final (name, desc, color) = roles[index];
        return Card(
          child: ListTile(
            leading: CircleAvatar(backgroundColor: color.withOpacity(0.15), child: Icon(Icons.shield, color: color)),
            title: Text(name),
            subtitle: Text(desc),
          ),
        );
      },
    );
  }
}
