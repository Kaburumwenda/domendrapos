/// App router using go_router.
/// Handles auth redirection, billing lock, and all routes.
library;

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../providers/auth_provider.dart';
import '../screens/auth/login_screen.dart';
import '../screens/billing/locked_screen.dart';
import '../screens/billing/overdue_screen.dart';
import '../screens/dashboard/dashboard_screen.dart';
import '../screens/pos/pos_screen.dart';
import '../screens/pos/sales_history_screen.dart';
import '../screens/pos/shifts_screen.dart';
import '../screens/inventory/inventory_hub_screen.dart';
import '../screens/customers/customers_screen.dart';
import '../screens/suppliers/suppliers_screen.dart';
import '../screens/reports/reports_screen.dart';
import '../screens/accounts/accounts_screen.dart';
import '../screens/analytics/analytics_hub_screen.dart';
import '../screens/sales/sales_screen.dart';
import '../screens/admin/staff_screen.dart';
import '../screens/admin/branches_screen.dart';
import '../screens/admin/settings_screen.dart';
import '../screens/admin/audit_logs_screen.dart';
import '../screens/profile/profile_screen.dart';
import '../screens/app_shell.dart';

final routerProvider = Provider<GoRouter>((ref) {
  final auth = ref.watch(authProvider);

  return GoRouter(
    initialLocation: '/dashboard',
    redirect: (context, state) {
      final status = auth.status;
      final path = state.uri.path;

      // Allow access to login route at all times
      if (path == '/login') {
        if (status == AuthStatus.authenticated) return '/dashboard';
        return null;
      }

      // Billing lock screens
      if (path == '/billing/locked' || path == '/billing/overdue') {
        if (status != AuthStatus.locked && status != AuthStatus.authenticated) {
          return '/login';
        }
        return null;
      }

      // Not authenticated → login
      if (status == AuthStatus.unauthenticated || status == AuthStatus.initial) {
        return '/login';
      }

      // Locked → redirect to appropriate lock screen
      if (status == AuthStatus.locked) {
        final isAdmin = auth.user?.isManager ?? false;
        return isAdmin ? '/billing/overdue' : '/billing/locked';
      }

      return null;
    },
    routes: [
      // Login
      GoRoute(path: '/login', builder: (c, s) => const LoginScreen()),

      // Billing lock screens
      GoRoute(path: '/billing/locked', builder: (c, s) => const LockedScreen()),
      GoRoute(path: '/billing/overdue', builder: (c, s) => const OverdueScreen()),

      // Main app shell with bottom nav
      ShellRoute(
        builder: (context, state, child) => AppShell(child: child),
        routes: [
          // Main nav tabs
          GoRoute(path: '/dashboard', builder: (c, s) => const DashboardScreen()),
          GoRoute(path: '/pos', builder: (c, s) => const PosScreen()),
          GoRoute(path: '/inventory', builder: (c, s) => const InventoryHubScreen()),
          GoRoute(path: '/analytics', builder: (c, s) => const AnalyticsHubScreen()),
          GoRoute(path: '/reports', builder: (c, s) => const ReportsScreen()),

          // POS sub-pages
          GoRoute(path: '/pos/history', builder: (c, s) => const SalesHistoryScreen()),
          GoRoute(path: '/pos/shifts', builder: (c, s) => const ShiftsScreen()),

          // Inventory deep-links (open hub at specific tab)
          GoRoute(path: '/inventory/low-stock', builder: (c, s) => const InventoryHubScreen(initialTab: 3)),
          GoRoute(path: '/inventory/movements', builder: (c, s) => const InventoryHubScreen(initialTab: 2)),

          // Customers & Suppliers
          GoRoute(path: '/customers', builder: (c, s) => const CustomersScreen()),
          GoRoute(path: '/suppliers', builder: (c, s) => const SuppliersScreen()),

          // Sales & Analytics
          GoRoute(path: '/sales', builder: (c, s) => const SalesScreen()),

          // Accounts
          GoRoute(path: '/accounts', builder: (c, s) => const AccountsScreen()),

          // Admin
          GoRoute(path: '/admin/staff', builder: (c, s) => const StaffScreen()),
          GoRoute(path: '/admin/branches', builder: (c, s) => const BranchesScreen()),
          GoRoute(path: '/admin/audit-logs', builder: (c, s) => const AuditLogsScreen()),
          GoRoute(path: '/admin/settings', builder: (c, s) => const SettingsScreen()),

          // Profile
          GoRoute(path: '/settings/profile', builder: (c, s) => const ProfileScreen()),
        ],
      ),
    ],
    errorBuilder: (context, state) => Scaffold(
      body: Center(child: Text('Page not found: ${state.uri.path}')),
    ),
  );
});
