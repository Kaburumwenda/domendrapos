/// Locked screen — shown when subscription is locked for non-admin users.
/// Mirrors the web app's `/billing/locked` page.

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../providers/auth_provider.dart';

class LockedScreen extends ConsumerWidget {
  const LockedScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final auth = ref.watch(authProvider);
    final billing = auth.billing;
    final scheme = Theme.of(context).colorScheme;

    return Scaffold(
      appBar: AppBar(
        actions: [
          IconButton(
            icon: const Icon(Icons.logout),
            onPressed: () => ref.read(authProvider.notifier).logout(),
          ),
        ],
      ),
      body: Center(
        child: Padding(
          padding: const EdgeInsets.all(32),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Container(
                padding: const EdgeInsets.all(24),
                decoration: BoxDecoration(
                  color: scheme.errorContainer.withOpacity(0.5),
                  shape: BoxShape.circle,
                ),
                child: Icon(Icons.lock, size: 64, color: scheme.error),
              ),
              const SizedBox(height: 24),
              Text(
                'Account Locked',
                style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                      fontWeight: FontWeight.bold,
                    ),
              ),
              const SizedBox(height: 12),
              Text(
                billing?.reason.isNotEmpty == true
                    ? billing!.reason
                    : 'Your subscription has been locked. Please contact your administrator to restore access.',
                textAlign: TextAlign.center,
                style: Theme.of(context).textTheme.bodyLarge?.copyWith(
                      color: scheme.onSurfaceVariant,
                    ),
              ),
              if (billing != null && billing.hasOverdue) ...[
                const SizedBox(height: 20),
                Card(
                  child: Padding(
                    padding: const EdgeInsets.all(16),
                    child: Column(
                      children: [
                        Text('Outstanding Balance', style: Theme.of(context).textTheme.bodySmall),
                        const SizedBox(height: 4),
                        Text(
                          '${billing.currency} ${billing.totalOverdue}',
                          style: Theme.of(context).textTheme.headlineMedium?.copyWith(
                                color: scheme.error,
                                fontWeight: FontWeight.bold,
                              ),
                        ),
                        const SizedBox(height: 8),
                        Text(
                          '${billing.overdueCount} overdue invoice(s)',
                          style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                                color: scheme.onSurfaceVariant,
                              ),
                        ),
                      ],
                    ),
                  ),
                ),
              ],
              const SizedBox(height: 32),
              FilledButton.icon(
                onPressed: () => context.go('/dashboard'),
                icon: const Icon(Icons.refresh),
                label: const Text('Retry Access'),
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
}
