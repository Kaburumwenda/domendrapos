/// API service providers for common data-fetching operations.
/// Each provider wraps a specific API endpoint and exposes typed data.
library;

import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../core/api_client.dart';
import '../models/index.dart';
import 'auth_provider.dart';

// ── Branches ──────────────────────────────────────────────────────
final branchesProvider = FutureProvider<List<Branch>>((ref) async {
  final api = ref.watch(apiClientProvider);
  final res = await api.get('/branches/');
  final data = res.data;
  if (data is List) {
    return data.map((e) => Branch.fromJson(e as Map<String, dynamic>)).toList();
  }
  // Paginated
  final paginated = data as Map<String, dynamic>;
  return (paginated['results'] as List? ?? [])
      .map((e) => Branch.fromJson(e as Map<String, dynamic>))
      .toList();
});

// ── Products ──────────────────────────────────────────────────────
final productsProvider = FutureProvider.family<List<Product>, Map<String, dynamic>>((ref, params) async {
  final api = ref.watch(apiClientProvider);
  final res = await api.get('/products/', query: {
    'page_size': 500,
    'is_active': 'true',
    'is_sellable': 'true',
    ...params,
  });
  final data = res.data;
  if (data is List) {
    return data.map((e) => Product.fromJson(e as Map<String, dynamic>)).toList();
  }
  final paginated = data as Map<String, dynamic>;
  return (paginated['results'] as List? ?? [])
      .map((e) => Product.fromJson(e as Map<String, dynamic>))
      .toList();
});

// ── Customers ───────────────────────────────────────────────────
final customersProvider = FutureProvider.family<List<Customer>, Map<String, dynamic>>((ref, params) async {
  final api = ref.watch(apiClientProvider);
  final res = await api.get('/customers/', query: {
    'page_size': 500,
    ...params,
  });
  final data = res.data;
  if (data is List) return data.map((e) => Customer.fromJson(e as Map<String, dynamic>)).toList();
  final paginated = data as Map<String, dynamic>;
  return (paginated['results'] as List? ?? [])
      .map((e) => Customer.fromJson(e as Map<String, dynamic>))
      .toList();
});

// ── Suppliers ──────────────────────────────────────────────────────
final suppliersProvider = FutureProvider.family<List<Supplier>, Map<String, dynamic>>((ref, params) async {
  final api = ref.watch(apiClientProvider);
  final res = await api.get('/suppliers/', query: {'page_size': 500, ...params});
  final data = res.data;
  if (data is List) return data.map((e) => Supplier.fromJson(e as Map<String, dynamic>)).toList();
  final paginated = data as Map<String, dynamic>;
  return (paginated['results'] as List? ?? [])
      .map((e) => Supplier.fromJson(e as Map<String, dynamic>))
      .toList();
});

// ── Reports ────────────────────────────────────────────────────────
final reportProvider = FutureProvider.family<dynamic, String>((ref, reportPath) async {
  final api = ref.watch(apiClientProvider);
  final res = await api.get('/reports/$reportPath');
  return res.data;
});

// ── Dashboard KPIs ────────────────────────────────────────────────
final dashboardKpisProvider = FutureProvider<Map<String, dynamic>>((ref) async {
  final api = ref.watch(apiClientProvider);
  final res = await api.get('/reports/dashboard/');
  return res.data as Map<String, dynamic>;
});

// ── Transactions (for dashboard charts) ───────────────────────────
final transactionsProvider = FutureProvider.family<List<Map<String, dynamic>>, Map<String, dynamic>>((ref, params) async {
  final api = ref.watch(apiClientProvider);
  final res = await api.get('/pos/transactions/', query: {'page_size': 2000, ...params});
  final data = res.data;
  if (data is List) return List<Map<String, dynamic>>.from(data);
  if (data is Map<String, dynamic>) {
    return List<Map<String, dynamic>>.from(data['results'] as List? ?? []);
  }
  return [];
});

// ── Products with cost/stock (for dashboard) ─────────────────────
final productsStockProvider = FutureProvider<List<Map<String, dynamic>>>((ref) async {
  final api = ref.watch(apiClientProvider);
  final res = await api.get('/products/', query: {'page_size': 500});
  final data = res.data;
  if (data is List) return List<Map<String, dynamic>>.from(data);
  if (data is Map<String, dynamic>) {
    return List<Map<String, dynamic>>.from(data['results'] as List? ?? []);
  }
  return [];
});

// ── Low Stock ─────────────────────────────────────────────────────
final lowStockProvider = FutureProvider<List<dynamic>>((ref) async {
  final api = ref.watch(apiClientProvider);
  final res = await api.get('/reports/low-stock/');
  return (res.data as List?) ?? [];
});
