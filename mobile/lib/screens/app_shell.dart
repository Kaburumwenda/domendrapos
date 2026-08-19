/// App shell with responsive navigation.
/// - Large screens (>= 900 px): persistent collapsible sidebar.
/// - Small screens: bottom navigation bar + drawer.
/// Wraps all main routes via ShellRoute.

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../providers/auth_provider.dart';
import '../providers/ui_provider.dart';

class AppShell extends ConsumerStatefulWidget {
  final Widget child;
  const AppShell({super.key, required this.child});

  @override
  ConsumerState<AppShell> createState() => _AppShellState();
}

class _AppShellState extends ConsumerState<AppShell> {
  static const _breakpoint = 900;

  static const _navItems = [
    NavItem(icon: Icons.dashboard_outlined, activeIcon: Icons.dashboard, label: 'Dashboard', path: '/dashboard'),
    NavItem(icon: Icons.point_of_sale_outlined, activeIcon: Icons.point_of_sale, label: 'POS', path: '/pos'),
    NavItem(icon: Icons.inventory_2_outlined, activeIcon: Icons.inventory_2, label: 'Inventory', path: '/inventory'),
    NavItem(icon: Icons.analytics_outlined, activeIcon: Icons.analytics, label: 'Analytics', path: '/analytics'),
  ];

  int _currentIndex(String path) {
    for (int i = 0; i < _navItems.length; i++) {
      if (path.startsWith(_navItems[i].path)) return i;
    }
    return 0;
  }

  @override
  Widget build(BuildContext context) {
    final location = GoRouterState.of(context).uri.path;
    final index = _currentIndex(location);
    final auth = ref.watch(authProvider);
    final scheme = Theme.of(context).colorScheme;
    final isWide = MediaQuery.of(context).size.width >= _breakpoint;

    if (isWide) {
      final sidebarExpanded = ref.watch(sidebarExpandedProvider);
      return Material(
        color: scheme.surface,
        child: Row(
          children: [
            _buildSidebar(context, auth, scheme, sidebarExpanded),
            Expanded(
              child: Scaffold(
                body: widget.child,
              ),
            ),
          ],
        ),
      );
    }

    return Scaffold(
      key: ref.read(scaffoldKeyProvider),
      body: widget.child,
      bottomNavigationBar: NavigationBar(
        selectedIndex: index,
        onDestinationSelected: (i) => context.go(_navItems[i].path),
        destinations: _navItems.map((item) {
          return NavigationDestination(
            icon: Icon(item.icon),
            selectedIcon: Icon(item.activeIcon),
            label: item.label,
          );
        }).toList(),
      ),
      drawer: _buildDrawer(context, auth, scheme),
    );
  }

  // ── Mobile drawer ───────────────────────────────────────────────

  Widget _buildDrawer(BuildContext context, AuthState auth, ColorScheme scheme) {
    return Drawer(
      child: _NavContent(
        auth: auth,
        scheme: scheme,
        expanded: true,
        onNavigate: (path) {
          Navigator.pop(context);
          context.go(path);
        },
        onLogout: () async {
          Navigator.pop(context);
          await ref.read(authProvider.notifier).logout();
        },
      ),
    );
  }

  // ── Web sidebar ─────────────────────────────────────────────────

  Widget _buildSidebar(
    BuildContext context,
    AuthState auth,
    ColorScheme scheme,
    bool expanded,
  ) {
    return AnimatedContainer(
      duration: const Duration(milliseconds: 200),
      curve: Curves.easeInOut,
      width: expanded ? 260 : 64,
      decoration: BoxDecoration(
        color: scheme.surface,
        border: Border(
          right: BorderSide(color: scheme.outlineVariant, width: 1),
        ),
      ),
      child: SafeArea(
        right: false,
        child: _NavContent(
          auth: auth,
          scheme: scheme,
          expanded: expanded,
          onNavigate: (path) => context.go(path),
          onLogout: () async => ref.read(authProvider.notifier).logout(),
        ),
      ),
    );
  }
}

// ── Shared navigation content (drawer + sidebar) ───────────────────

class _NavContent extends StatelessWidget {
  final AuthState auth;
  final ColorScheme scheme;
  final bool expanded;
  final void Function(String path) onNavigate;
  final VoidCallback onLogout;

  const _NavContent({
    required this.auth,
    required this.scheme,
    required this.expanded,
    required this.onNavigate,
    required this.onLogout,
  });

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        // ── User header ───────────────────────────────────────────
        _buildHeader(context),
        const Divider(height: 1),
        // ── Scrollable nav items ─────────────────────────────────
        Expanded(
          child: ListView(
            padding: EdgeInsets.zero,
            children: [
              _navItem(context, Icons.point_of_sale, 'New Sale', '/pos'),
              _navItem(context, Icons.history, 'Sales History', '/pos/history'),
              _navItem(context, Icons.schedule, 'Shifts', '/pos/shifts'),
              _sectionDivider(),
              _navItem(context, Icons.inventory, 'Inventory', '/inventory'),
              _navItem(context, Icons.warning_amber, 'Low Stock', '/inventory/low-stock'),
              _navItem(context, Icons.swap_vert, 'Stock Movements', '/inventory/movements'),
              _sectionDivider(),
              _navItem(context, Icons.people_outline, 'Customers', '/customers'),
              _navItem(context, Icons.local_shipping_outlined, 'Suppliers', '/suppliers'),
              _sectionDivider(),
              _navItem(context, Icons.trending_up, 'Sales', '/sales'),
              _navItem(context, Icons.analytics_outlined, 'Analytics', '/analytics'),
              _navItem(context, Icons.account_balance_outlined, 'Accounts', '/accounts'),
              _sectionDivider(),
              if (auth.user?.canAccessAdmin ?? false) ...[
                _sectionLabel('Admin'),
                _navItem(context, Icons.manage_accounts, 'Staff', '/admin/staff'),
                _navItem(context, Icons.store, 'Branches', '/admin/branches'),
                _navItem(context, Icons.history_edu, 'Audit Logs', '/admin/audit-logs'),
                _navItem(context, Icons.settings, 'Settings', '/admin/settings'),
                _sectionDivider(),
              ],
              _navItem(context, Icons.person_outline, 'Profile', '/settings/profile'),
            ],
          ),
        ),
        const Divider(height: 1),
        // ── Logout ───────────────────────────────────────────────
        _navItem(context, Icons.logout, 'Logout', null, onTap: onLogout),
      ],
    );
  }

  // ── User header ────────────────────────────────────────────────

  Widget _buildHeader(BuildContext context) {
    if (!expanded) {
      return Padding(
        padding: const EdgeInsets.symmetric(vertical: 16),
        child: CircleAvatar(
          radius: 18,
          backgroundColor: scheme.primary,
          child: Text(
            auth.user?.initials ?? '?',
            style: TextStyle(
              color: scheme.onPrimary,
              fontSize: 14,
              fontWeight: FontWeight.bold,
            ),
          ),
        ),
      );
    }

    return UserAccountsDrawerHeader(
      decoration: BoxDecoration(color: scheme.primary),
      accountName: Text(auth.user?.fullName ?? 'User'),
      accountEmail: Text(auth.user?.email ?? ''),
      currentAccountPicture: CircleAvatar(
        backgroundColor: Colors.white,
        child: Text(
          auth.user?.initials ?? '?',
          style: TextStyle(color: scheme.primary, fontSize: 20, fontWeight: FontWeight.bold),
        ),
      ),
    );
  }

  // ── Nav item ───────────────────────────────────────────────────

  Widget _navItem(
    BuildContext context,
    IconData icon,
    String label,
    String? path, {
    VoidCallback? onTap,
  }) {
    final isActive = path != null && GoRouterState.of(context).uri.path.startsWith(path);
    final callback = onTap ?? (path != null ? () => onNavigate(path) : null);

    if (!expanded) {
      return Tooltip(
        message: label,
        preferBelow: false,
        child: IconButton(
          icon: Icon(icon),
          color: isActive ? scheme.primary : scheme.onSurfaceVariant,
          onPressed: callback,
        ),
      );
    }

    return ListTile(
      leading: Icon(icon, color: isActive ? scheme.primary : null),
      title: Text(label),
      selected: isActive,
      selectedTileColor: scheme.primaryContainer,
      onTap: callback,
    );
  }

  Widget _sectionDivider() => const Divider(height: 1, indent: 16, endIndent: 16);

  Widget _sectionLabel(String title) {
    return Padding(
      padding: const EdgeInsets.fromLTRB(16, 12, 16, 8),
      child: Text(
        title,
        style: TextStyle(
          fontSize: 12,
          fontWeight: FontWeight.bold,
          color: scheme.primary,
          letterSpacing: 1.1,
        ),
      ),
    );
  }
}

class NavItem {
  final IconData icon;
  final IconData activeIcon;
  final String label;
  final String path;

  const NavItem({
    required this.icon,
    required this.activeIcon,
    required this.label,
    required this.path,
  });
}
