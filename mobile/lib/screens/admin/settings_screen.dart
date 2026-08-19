/// Settings screen — tenant/branch preferences, tax, currency, etc.
/// Mirrors the web app's `/admin/settings` page.

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../providers/auth_provider.dart';
import '../../widgets/common.dart';

class SettingsScreen extends ConsumerStatefulWidget {
  const SettingsScreen({super.key});

  @override
  ConsumerState<SettingsScreen> createState() => _SettingsScreenState();
}

class _SettingsScreenState extends ConsumerState<SettingsScreen> {
  bool _notifications = true;
  bool _lowStockAlerts = true;
  bool _dailySummary = false;
  String _currency = 'KES';
  String _language = 'en';
  String _theme = 'system';

  @override
  Widget build(BuildContext context) {
    final auth = ref.watch(authProvider);
    final tenant = auth.tenant;

    return Scaffold(
      appBar: AppBar(title: const Text('Settings')),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          // Tenant info section
          SectionHeader(title: 'Organization'),
          const SizedBox(height: 8),
          Card(
            child: Column(
              children: [
                ListTile(
                  leading: const Icon(Icons.business),
                  title: const Text('Name'),
                  trailing: Text(tenant?.name ?? 'Demo Store'),
                ),
                ListTile(
                  leading: const Icon(Icons.payments),
                  title: const Text('Currency'),
                  trailing: Text('${tenant?.currencyCode ?? "KES"} (${tenant?.currencySymbol ?? "KSh"})'),
                ),
                ListTile(
                  leading: const Icon(Icons.schedule),
                  title: const Text('Timezone'),
                  trailing: Text(tenant?.timezone ?? 'Africa/Nairobi'),
                ),
                ListTile(
                  leading: const Icon(Icons.palette),
                  title: const Text('Primary Color'),
                  trailing: CircleAvatar(
                    backgroundColor: Color(int.parse(
                      (tenant?.primaryColor ?? '#1976D2').replaceFirst('#', '0xFF'),
                    )),
                    radius: 14,
                  ),
                ),
                ListTile(
                  leading: const Icon(Icons.stars),
                  title: const Text('Plan'),
                  trailing: Text((tenant?.plan ?? 'free').toUpperCase()),
                ),
              ],
            ),
          ),
          const SizedBox(height: 24),

          // App preferences
          SectionHeader(title: 'Preferences'),
          const SizedBox(height: 8),
          Card(
            child: Column(
              children: [
                SwitchListTile(
                  secondary: const Icon(Icons.notifications),
                  title: const Text('Notifications'),
                  value: _notifications,
                  onChanged: (v) => setState(() => _notifications = v),
                ),
                SwitchListTile(
                  secondary: const Icon(Icons.warning_amber),
                  title: const Text('Low Stock Alerts'),
                  value: _lowStockAlerts,
                  onChanged: (v) => setState(() => _lowStockAlerts = v),
                ),
                SwitchListTile(
                  secondary: const Icon(Icons.mail_outline),
                  title: const Text('Daily Summary Email'),
                  value: _dailySummary,
                  onChanged: (v) => setState(() => _dailySummary = v),
                ),
              ],
            ),
          ),
          const SizedBox(height: 24),

          // Display
          SectionHeader(title: 'Display'),
          const SizedBox(height: 8),
          Card(
            child: Column(
              children: [
                ListTile(
                  leading: const Icon(Icons.dark_mode),
                  title: const Text('Theme'),
                  trailing: DropdownButton<String>(
                    value: _theme,
                    items: const [
                      DropdownMenuItem(value: 'system', child: Text('System')),
                      DropdownMenuItem(value: 'light', child: Text('Light')),
                      DropdownMenuItem(value: 'dark', child: Text('Dark')),
                    ],
                    onChanged: (v) => setState(() => _theme = v ?? 'system'),
                  ),
                ),
                ListTile(
                  leading: const Icon(Icons.language),
                  title: const Text('Language'),
                  trailing: DropdownButton<String>(
                    value: _language,
                    items: const [
                      DropdownMenuItem(value: 'en', child: Text('English')),
                      DropdownMenuItem(value: 'sw', child: Text('Swahili')),
                    ],
                    onChanged: (v) => setState(() => _language = v ?? 'en'),
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 24),

          // About
          SectionHeader(title: 'About'),
          const SizedBox(height: 8),
          Card(
            child: Column(
              children: [
                ListTile(
                  leading: const Icon(Icons.info_outline),
                  title: const Text('Version'),
                  trailing: const Text('1.0.0'),
                ),
                ListTile(
                  leading: const Icon(Icons.code),
                  title: const Text('Build'),
                  trailing: const Text('Flutter 3.9+'),
                ),
                ListTile(
                  leading: const Icon(Icons.support),
                  title: const Text('Support'),
                  trailing: const Text('support@domendrapos.com'),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
