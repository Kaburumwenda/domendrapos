/// Audit logs screen — view system audit trail.
/// Mirrors the web app's `/admin/audit-logs` page.

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../core/formatters.dart';
import '../../providers/auth_provider.dart';
import '../../widgets/common.dart';

final auditLogsProvider = FutureProvider<List<Map<String, dynamic>>>((ref) async {
  final api = ref.watch(apiClientProvider);
  final res = await api.get('/audit/logs/', query: {'page_size': 100});
  final data = res.data;
  if (data is List) return List<Map<String, dynamic>>.from(data);
  if (data is Map<String, dynamic>) {
    return List<Map<String, dynamic>>.from(data['results'] as List? ?? []);
  }
  return [];
});

class AuditLogsScreen extends ConsumerStatefulWidget {
  const AuditLogsScreen({super.key});

  @override
  ConsumerState<AuditLogsScreen> createState() => _AuditLogsScreenState();
}

class _AuditLogsScreenState extends ConsumerState<AuditLogsScreen> {
  String _actionFilter = 'all';

  @override
  Widget build(BuildContext context) {
    final logsAsync = ref.watch(auditLogsProvider);

    return Scaffold(
      appBar: AppBar(title: const Text('Audit Logs')),
      body: Column(
        children: [
          FilterChipBar(
            options: const ['all', 'create', 'update', 'delete', 'login', 'logout'],
            selected: _actionFilter,
            onSelected: (v) => setState(() => _actionFilter = v),
            label: 'Action:',
          ),
          Expanded(
            child: RefreshIndicator(
              onRefresh: () async => ref.invalidate(auditLogsProvider),
              child: logsAsync.when(
                loading: () => const LoadingWidget(),
                error: (e, _) => ErrorStateWidget(
                  message: 'Failed to load audit logs',
                  onRetry: () => ref.invalidate(auditLogsProvider),
                ),
                data: (logs) {
                  final filtered = _actionFilter == 'all'
                      ? logs
                      : logs.where((l) => (l['action'] ?? '').toString().contains(_actionFilter)).toList();
                  if (filtered.isEmpty) {
                    return const EmptyState(icon: Icons.history_edu, title: 'No audit logs');
                  }
                  return ListView.builder(
                    itemCount: filtered.length,
                    itemBuilder: (context, index) {
                      final log = filtered[index];
                      final action = log['action'] as String? ?? 'unknown';
                      final actionIcons = {
                        'create': Icons.add_circle,
                        'update': Icons.edit,
                        'delete': Icons.delete,
                        'login': Icons.login,
                        'logout': Icons.logout,
                      };
                      final actionColors = {
                        'create': Colors.green,
                        'update': Colors.blue,
                        'delete': Colors.red,
                        'login': Colors.purple,
                        'logout': Colors.orange,
                      };
                      return Card(
                        margin: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
                        child: ListTile(
                          leading: Icon(
                            actionIcons[action] ?? Icons.info,
                            color: actionColors[action] ?? Colors.grey,
                          ),
                          title: Text(log['description'] ?? log['action']),
                          subtitle: Text([
                            log['user_email'] ?? log['user'] ?? 'system',
                            Formatters.dateTime(log['created_at'] ?? log['timestamp']),
                          ].join(' • ')),
                          trailing: Container(
                            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                            decoration: BoxDecoration(
                              color: (actionColors[action] ?? Colors.grey).withOpacity(0.15),
                              borderRadius: BorderRadius.circular(4),
                            ),
                            child: Text(
                              action.toUpperCase(),
                              style: TextStyle(
                                fontSize: 10,
                                color: actionColors[action] ?? Colors.grey,
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                          ),
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
