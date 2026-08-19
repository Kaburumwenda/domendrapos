/// Overdue screen — shown to admins when billing is overdue but not yet locked.
/// Mirrors the web app's `/billing/overdue` page.

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../core/formatters.dart';
import '../../providers/auth_provider.dart';

class OverdueScreen extends ConsumerWidget {
  const OverdueScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final auth = ref.watch(authProvider);
    final billing = auth.billing;
    final scheme = Theme.of(context).colorScheme;

    return Scaffold(
      appBar: AppBar(
        title: const Text('Billing Overdue'),
        actions: [
          IconButton(
            icon: const Icon(Icons.logout),
            onPressed: () => ref.read(authProvider.notifier).logout(),
          ),
        ],
      ),
      body: Center(
        child: Padding(
          padding: const EdgeInsets.all(24),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Container(
                padding: const EdgeInsets.all(24),
                decoration: BoxDecoration(
                  color: scheme.tertiaryContainer.withOpacity(0.5),
                  shape: BoxShape.circle,
                ),
                child: Icon(Icons.warning_amber_rounded, size: 64, color: scheme.tertiary),
              ),
              const SizedBox(height: 24),
              Text(
                'Payment Overdue',
                style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                      fontWeight: FontWeight.bold,
                    ),
              ),
              const SizedBox(height: 12),
              Text(
                'Your subscription has overdue invoices. Please settle them to avoid account lock.',
                textAlign: TextAlign.center,
                style: Theme.of(context).textTheme.bodyLarge?.copyWith(
                      color: scheme.onSurfaceVariant,
                    ),
              ),
              const SizedBox(height: 20),
              if (billing != null) ...[
                Card(
                  child: Padding(
                    padding: const EdgeInsets.all(16),
                    child: Column(
                      children: [
                        _infoRow('Outstanding', '${billing.currency} ${billing.totalOverdue}'),
                        _infoRow('Overdue Invoices', '${billing.overdueCount}'),
                        if (billing.oldestDueDate != null)
                          _infoRow('Oldest Due', Formatters.date(billing!.oldestDueDate)),
                        _infoRow('Days Overdue', '${billing.daysOverdue}'),
                        _infoRow('Grace Days Left', '${(billing.graceDays - billing.daysOverdue).clamp(0, billing.graceDays)}'),
                      ],
                    ),
                  ),
                ),
              ],
              const SizedBox(height: 32),
              FilledButton.icon(
                onPressed: () => context.go('/dashboard'),
                icon: const Icon(Icons.check_circle_outline),
                label: const Text('I Understand, Continue'),
              ),
              const SizedBox(height: 8),
              TextButton(
                onPressed: () => ref.read(authProvider.notifier).logout(),
                child: const Text('Sign Out'),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _infoRow(String label, String value) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(label, style: const TextStyle(color: Colors.grey)),
          Text(value, style: const TextStyle(fontWeight: FontWeight.w600)),
        ],
      ),
    );
  }
}
