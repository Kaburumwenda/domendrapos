/// Profile screen — user profile view and edit.
/// Mirrors the web app's `/settings/profile` page.

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../core/formatters.dart';
import '../../providers/auth_provider.dart';

class ProfileScreen extends ConsumerStatefulWidget {
  const ProfileScreen({super.key});

  @override
  ConsumerState<ProfileScreen> createState() => _ProfileScreenState();
}

class _ProfileScreenState extends ConsumerState<ProfileScreen> {
  final _firstNameController = TextEditingController();
  final _lastNameController = TextEditingController();
  final _phoneController = TextEditingController();
  bool _editing = false;

  @override
  void initState() {
    super.initState();
    final user = ref.read(authProvider).user;
    _firstNameController.text = user?.firstName ?? '';
    _lastNameController.text = user?.lastName ?? '';
    _phoneController.text = user?.phone ?? '';
  }

  @override
  void dispose() {
    _firstNameController.dispose();
    _lastNameController.dispose();
    _phoneController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final auth = ref.watch(authProvider);
    final user = auth.user;
    final scheme = Theme.of(context).colorScheme;

    return Scaffold(
      appBar: AppBar(
        title: const Text('Profile'),
        actions: [
          IconButton(
            icon: Icon(_editing ? Icons.check : Icons.edit),
            onPressed: () {
              if (_editing) _saveProfile();
              setState(() => _editing = !_editing);
            },
          ),
        ],
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(24),
        child: Column(
          children: [
            // Avatar
            Container(
              width: 100,
              height: 100,
              decoration: BoxDecoration(
                color: scheme.primaryContainer,
                shape: BoxShape.circle,
              ),
              child: user?.avatar != null
                  ? ClipOval(child: Image.network(user!.avatar!))
                  : Center(
                      child: Text(
                        user?.initials ?? '?',
                        style: TextStyle(
                          fontSize: 36,
                          fontWeight: FontWeight.bold,
                          color: scheme.onPrimaryContainer,
                        ),
                      ),
                    ),
            ),
            const SizedBox(height: 16),

            // Name + role
            Text(
              user?.fullName ?? 'User',
              style: Theme.of(context).textTheme.titleLarge?.copyWith(fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 4),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
              decoration: BoxDecoration(
                color: scheme.primary.withOpacity(0.15),
                borderRadius: BorderRadius.circular(8),
              ),
              child: Text(
                (user?.role ?? 'viewer').toUpperCase(),
                style: TextStyle(color: scheme.primary, fontWeight: FontWeight.bold, fontSize: 12),
              ),
            ),
            const SizedBox(height: 32),

            // Profile fields
            TextField(
              controller: _firstNameController,
              enabled: _editing,
              decoration: const InputDecoration(
                labelText: 'First Name',
                prefixIcon: Icon(Icons.person_outline),
                border: OutlineInputBorder(),
              ),
            ),
            const SizedBox(height: 16),
            TextField(
              controller: _lastNameController,
              enabled: _editing,
              decoration: const InputDecoration(
                labelText: 'Last Name',
                prefixIcon: Icon(Icons.person_outline),
                border: OutlineInputBorder(),
              ),
            ),
            const SizedBox(height: 16),
            TextField(
              controller: _phoneController,
              enabled: _editing,
              decoration: const InputDecoration(
                labelText: 'Phone',
                prefixIcon: Icon(Icons.phone),
                border: OutlineInputBorder(),
              ),
              keyboardType: TextInputType.phone,
            ),
            const SizedBox(height: 16),
            TextField(
              enabled: false,
              controller: TextEditingController(text: user?.email ?? ''),
              decoration: const InputDecoration(
                labelText: 'Email (read-only)',
                prefixIcon: Icon(Icons.email),
                border: OutlineInputBorder(),
              ),
            ),
            const SizedBox(height: 16),
            if (user?.employeeId != null)
              TextField(
                enabled: false,
                controller: TextEditingController(text: user!.employeeId),
                decoration: const InputDecoration(
                  labelText: 'Employee ID',
                  prefixIcon: Icon(Icons.badge),
                  border: OutlineInputBorder(),
                ),
              ),

            const SizedBox(height: 32),

            // Account info
            const SectionHeader(title: 'Account Info'),
            const SizedBox(height: 8),
            Card(
              child: Column(
                children: [
                  ListTile(
                    leading: const Icon(Icons.verified_user),
                    title: const Text('Status'),
                    trailing: Text(
                      user?.isActiveEmployee == true ? 'Active' : 'Inactive',
                      style: TextStyle(
                        color: user?.isActiveEmployee == true ? Colors.green : Colors.red,
                      ),
                    ),
                  ),
                  ListTile(
                    leading: const Icon(Icons.store),
                    title: const Text('Default Branch'),
                    trailing: Text(user?.defaultBranchId != null ? 'Branch #${user!.defaultBranchId}' : '-'),
                  ),
                ],
              ),
            ),

            const SizedBox(height: 32),

            // Actions
            SizedBox(
              width: double.infinity,
              child: FilledButton.icon(
                onPressed: () => ref.read(authProvider.notifier).logout(),
                icon: const Icon(Icons.logout),
                label: const Text('Sign Out'),
                style: FilledButton.styleFrom(backgroundColor: Colors.red),
              ),
            ),
          ],
        ),
      ),
    );
  }

  void _saveProfile() {
    final api = ref.read(apiClientProvider);
    api.patch('/users/staff/me/', data: {
      'first_name': _firstNameController.text,
      'last_name': _lastNameController.text,
      'phone': _phoneController.text,
    }).then((_) {
      ref.read(authProvider.notifier).refreshMe();
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Profile updated successfully')),
        );
      }
    }).catchError((e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Update failed: $e')),
        );
      }
    });
  }
}

class SectionHeader extends StatelessWidget {
  final String title;
  const SectionHeader({super.key, required this.title});

  @override
  Widget build(BuildContext context) {
    return Align(
      alignment: Alignment.centerLeft,
      child: Text(
        title,
        style: Theme.of(context).textTheme.titleMedium?.copyWith(fontWeight: FontWeight.bold),
      ),
    );
  }
}
