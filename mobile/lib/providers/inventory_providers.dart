/// Inventory API providers.
/// Wraps the backend `api/inventory/` endpoints with typed models.

import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../core/api_client.dart';
import '../models/index.dart';
import 'auth_provider.dart';

// ── Helpers ──────────────────────────────────────────────────────

List<Map<String, dynamic>> _extractList(dynamic data) {
  if (data is List) return List<Map<String, dynamic>>.from(data);
  if (data is Map<String, dynamic>) {
    return List<Map<String, dynamic>>.from(data['results'] as List? ?? []);
  }
  return [];
}

// ── Stock Items (Stock on Hand) ───────────────────────────────────

final stockItemsProvider =
    FutureProvider<List<StockItem>>((ref) async {
  final api = ref.watch(apiClientProvider);
  final res = await api.get('/inventory/items/', query: {'page_size': 500});
  return _extractList(res.data)
      .map((e) => StockItem.fromJson(e))
      .toList();
});

// ── Low Stock Items ───────────────────────────────────────────────

final lowStockItemsProvider =
    FutureProvider<List<StockItem>>((ref) async {
  final api = ref.watch(apiClientProvider);
  final res = await api.get('/inventory/items/low_stock/');
  return _extractList(res.data)
      .map((e) => StockItem.fromJson(e))
      .toList();
});

// ── Stock Movements ───────────────────────────────────────────────

final stockMovementsListProvider =
    FutureProvider<List<StockMovement>>((ref) async {
  final api = ref.watch(apiClientProvider);
  final res =
      await api.get('/inventory/movements/', query: {'page_size': 500});
  return _extractList(res.data)
      .map((e) => StockMovement.fromJson(e))
      .toList();
});

// ── Stock Adjustments ─────────────────────────────────────────────

final stockAdjustmentsProvider =
    FutureProvider<List<StockAdjustment>>((ref) async {
  final api = ref.watch(apiClientProvider);
  final res =
      await api.get('/inventory/adjustments/', query: {'page_size': 500});
  return _extractList(res.data)
      .map((e) => StockAdjustment.fromJson(e))
      .toList();
});

final adjustmentSummaryProvider =
    FutureProvider<AdjustmentSummary>((ref) async {
  final api = ref.watch(apiClientProvider);
  final res = await api.get('/inventory/adjustments/summary/');
  return AdjustmentSummary.fromJson(
      res.data is Map<String, dynamic> ? res.data : <String, dynamic>{});
});

// ── Stock Analytics ───────────────────────────────────────────────

final stockAnalyticsProvider =
    FutureProvider<StockAnalysisData>((ref) async {
  final api = ref.watch(apiClientProvider);
  final res = await api.get('/inventory/items/analytics/');
  return StockAnalysisData.fromJson(
      res.data is Map<String, dynamic> ? res.data : <String, dynamic>{});
});

// ── Adjustment Actions (submit / approve / reject / post / cancel) ──

Future<StockAdjustment> _adjustmentAction(
  WidgetRef ref, int id, String action,
) async {
  final api = ref.read(apiClientProvider);
  final res = await api.post('/inventory/adjustments/$id/$action/');
  return StockAdjustment.fromJson(
      res.data is Map<String, dynamic> ? res.data : <String, dynamic>{});
}

Future<StockAdjustment> submitAdjustment(WidgetRef ref, int id) =>
    _adjustmentAction(ref, id, 'submit');
Future<StockAdjustment> approveAdjustment(WidgetRef ref, int id) =>
    _adjustmentAction(ref, id, 'approve');
Future<StockAdjustment> rejectAdjustment(WidgetRef ref, int id) =>
    _adjustmentAction(ref, id, 'reject');
Future<StockAdjustment> postAdjustment(WidgetRef ref, int id) =>
    _adjustmentAction(ref, id, 'post_adjustment');
Future<StockAdjustment> cancelAdjustment(WidgetRef ref, int id) =>
    _adjustmentAction(ref, id, 'cancel');

/// Fetch a single adjustment with its lines.
Future<StockAdjustment> fetchAdjustmentDetail(WidgetRef ref, int id) async {
  final api = ref.read(apiClientProvider);
  final res = await api.get('/inventory/adjustments/$id/');
  return StockAdjustment.fromJson(
      res.data is Map<String, dynamic> ? res.data : <String, dynamic>{});
}

/// Create a new stock adjustment. Returns the created adjustment.
Future<StockAdjustment> createAdjustment(
  WidgetRef ref, {
  required int branch,
  required String adjustmentType,
  required String reason,
  required String adjustmentDate,
  String notes = '',
  String status = 'draft',
  required List<Map<String, dynamic>> lines,
}) async {
  final api = ref.read(apiClientProvider);
  final res = await api.post('/inventory/adjustments/', data: {
    'branch': branch,
    'adjustment_type': adjustmentType,
    'reason': reason,
    'adjustment_date': adjustmentDate,
    'notes': notes,
    'status': status,
    'lines': lines,
  });
  return StockAdjustment.fromJson(
      res.data is Map<String, dynamic> ? res.data : <String, dynamic>{});
}

// ── Stock Item update / delete ────────────────────────────────────

/// Update a stock item (PATCH /inventory/items/{id}/).
Future<StockItem> updateStockItem(
  WidgetRef ref, {
  required int id,
  required Map<String, dynamic> fields,
}) async {
  final api = ref.read(apiClientProvider);
  final res = await api.patch('/inventory/items/$id/', data: fields);
  return StockItem.fromJson(
      res.data is Map<String, dynamic> ? res.data : <String, dynamic>{});
}

/// Delete a stock item (DELETE /inventory/items/{id}/).
Future<void> deleteStockItem(WidgetRef ref, int id) async {
  final api = ref.read(apiClientProvider);
  await api.delete('/inventory/items/$id/');
}
