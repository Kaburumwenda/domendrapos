/// Analytics providers — computes all analytics metrics client-side from
/// raw transactions + products, mirroring the web app's analytics pages.
/// The web pulls `/pos/transactions/` + `/products/` and derives everything.

import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../core/formatters.dart';
import 'auth_provider.dart';

// ── Period ────────────────────────────────────────────────────────

enum AnalyticsPeriod { today, d7, d30, thisMonth, d90 }

typedef DateRange = ({DateTime from, DateTime to});

DateRange analyticsRange(AnalyticsPeriod p) {
  final now = DateTime.now();
  switch (p) {
    case AnalyticsPeriod.today:
      return (from: DateTime(now.year, now.month, now.day), to: now);
    case AnalyticsPeriod.d7:
      return (from: now.subtract(const Duration(days: 6)), to: now);
    case AnalyticsPeriod.d30:
      return (from: now.subtract(const Duration(days: 29)), to: now);
    case AnalyticsPeriod.thisMonth:
      return (from: DateTime(now.year, now.month, 1), to: now);
    case AnalyticsPeriod.d90:
      return (from: now.subtract(const Duration(days: 89)), to: now);
  }
}

// ── Simple value holders ──────────────────────────────────────────

class NameValue {
  final String name;
  final double value;
  const NameValue(this.name, this.value);
}

class RevenuePoint {
  final String date;
  final double revenue;
  const RevenuePoint(this.date, this.revenue);
}

class CashierStat {
  final String name;
  final int count;
  final double revenue;
  final double aov;
  final int items;
  final double sharePct;
  const CashierStat(this.name, this.count, this.revenue, this.aov, this.items, this.sharePct);
}

class ProductRank {
  final String name;
  final String sku;
  final double revenue;
  final double qty;
  final int rank;
  final double sharePct;
  final double cumulative;
  final double avgPrice;
  final String abcClass;
  const ProductRank(this.name, this.sku, this.revenue, this.qty, this.rank, this.sharePct, this.cumulative, this.avgPrice, this.abcClass);
}

class SlowMoving {
  final String name;
  final String sku;
  final int daysIdle;
  final double stockValue;
  const SlowMoving(this.name, this.sku, this.daysIdle, this.stockValue);
}

class NeverSold {
  final String name;
  final String sku;
  final double stockValue;
  const NeverSold(this.name, this.sku, this.stockValue);
}

class DeadStock {
  final String name;
  final String sku;
  final double qty;
  final double stockValue;
  final double deadPct;
  const DeadStock(this.name, this.sku, this.qty, this.stockValue, this.deadPct);
}

class CategoryStat {
  final String category;
  final double revenue;
  final double qty;
  final double stockValue;
  final int productCount;
  final double sharePct;
  const CategoryStat(this.category, this.revenue, this.qty, this.stockValue, this.productCount, this.sharePct);
}

// ── Computed analytics ────────────────────────────────────────────

class AnalyticsData {
  // KPIs
  final double revenue;
  final int txCount;
  final int itemsSold;
  final double aov;
  final int discountCount;
  final double grossProfit;
  final double grossMarginPct;
  final double revGrowth;
  final int stockItems;
  final double stockValue;
  // series
  final List<RevenuePoint> revenueSeries;
  final List<NameValue> paymentMethods;
  final List<NameValue> topProducts;
  final List<NameValue> categoryRevenue;
  final List<double> hourly;
  final List<double> weekday;
  final List<CashierStat> cashiers;
  final List<Map<String, dynamic>> recentTransactions;
  // products
  final List<ProductRank> productRanking;
  final List<ProductRank> top20;
  final List<SlowMoving> slowMoving;
  final List<NeverSold> neverSold;
  final List<DeadStock> deadStock;
  final Map<String, int> abcCounts;
  // products KPIs
  final int totalProducts;
  final int productsSold;
  final int neverSoldCount;
  final double avgRevenuePerProduct;
  final double deadStockValue;
  final double topProductRevenue;
  final double topPct;
  // categories
  final List<CategoryStat> categoryStats;
  final int totalCategories;
  final double topCategoryRevenue;
  final String? topCategory;
  final double categoryDeadStockValue;

  const AnalyticsData({
    this.revenue = 0,
    this.txCount = 0,
    this.itemsSold = 0,
    this.aov = 0,
    this.discountCount = 0,
    this.grossProfit = 0,
    this.grossMarginPct = 0,
    this.revGrowth = 0,
    this.stockItems = 0,
    this.stockValue = 0,
    this.revenueSeries = const [],
    this.paymentMethods = const [],
    this.topProducts = const [],
    this.categoryRevenue = const [],
    this.hourly = const [],
    this.weekday = const [],
    this.cashiers = const [],
    this.recentTransactions = const [],
    this.productRanking = const [],
    this.top20 = const [],
    this.slowMoving = const [],
    this.neverSold = const [],
    this.deadStock = const [],
    this.abcCounts = const {},
    this.totalProducts = 0,
    this.productsSold = 0,
    this.neverSoldCount = 0,
    this.avgRevenuePerProduct = 0,
    this.deadStockValue = 0,
    this.topProductRevenue = 0,
    this.topPct = 0,
    this.categoryStats = const [],
    this.totalCategories = 0,
    this.topCategoryRevenue = 0,
    this.topCategory,
    this.categoryDeadStockValue = 0,
  });
}

// ── Provider ──────────────────────────────────────────────────────

final analyticsDataProvider =
    FutureProvider.family<AnalyticsData, AnalyticsPeriod>((ref, period) async {
  final api = ref.watch(apiClientProvider);
  final range = analyticsRange(period);

  // Fetch transactions + products in parallel
  final txRes = await api.get('/pos/transactions/', query: {'page_size': 2000});
  final prodRes = await api.get('/products/', query: {'page_size': 500});

  List<Map<String, dynamic>> extract(dynamic d) {
    if (d is List) return List<Map<String, dynamic>>.from(d);
    if (d is Map<String, dynamic>) {
      return List<Map<String, dynamic>>.from(d['results'] as List? ?? []);
    }
    return [];
  }

  final allTx = extract(txRes.data);
  final products = extract(prodRes.data);

  // Previous-period transactions for growth
  final periodDays = range.to.difference(range.from).inDays + 1;
  final prevFrom = range.from.subtract(Duration(days: periodDays));
  final prevTo = range.from.subtract(const Duration(days: 1));

  DateTime? parsed(String? s) => s == null ? null : DateTime.tryParse(s);

  // Filter completed transactions in range
  final inRange = allTx.where((t) {
    if ((t['status'] ?? 'completed') != 'completed') return false;
    final d = parsed(t['created_at']?.toString());
    if (d == null) return false;
    return !d.isBefore(range.from) && d.isBefore(range.to.add(const Duration(days: 1)));
  }).toList();

  final prevTx = allTx.where((t) {
    if ((t['status'] ?? 'completed') != 'completed') return false;
    final d = parsed(t['created_at']?.toString());
    if (d == null) return false;
    return !d.isBefore(prevFrom) && !d.isAfter(prevTo);
  }).toList();

  double txTotal(Map t) => Formatters.toDouble(t['total'] ?? 0);

  final revenue = inRange.fold(0.0, (s, t) => s + txTotal(t));
  final prevRevenue = prevTx.fold(0.0, (s, t) => s + txTotal(t));
  final revGrowth = prevRevenue > 0 ? ((revenue - prevRevenue) / prevRevenue * 100) : 0.0;
  final txCount = inRange.length;
  final itemsSold = inRange.fold(0, (s, t) => s + ((t['items_count'] as int?) ?? 0));
  final aov = txCount > 0 ? revenue / txCount : 0.0;
  final discountCount = inRange.where((t) => Formatters.toDouble(t['discount'] ?? 0) > 0).length;

  // Cost / gross profit: match items to product cost_price by name
  final costByName = <String, double>{};
  for (final p in products) {
    costByName[p['name']?.toString() ?? ''] = Formatters.toDouble(p['cost_price'] ?? 0);
  }
  double grossCost = 0;
  for (final t in inRange) {
    final items = t['items'];
    if (items is List) {
      for (final i in items) {
        final m = i as Map;
        final name = m['product_name']?.toString() ?? '';
        final qty = Formatters.toDouble(m['quantity'] ?? 0);
        grossCost += (costByName[name] ?? 0) * qty;
      }
    }
  }
  final grossProfit = revenue - grossCost;
  final grossMarginPct = revenue > 0 ? grossProfit / revenue * 100 : 0.0;

  // Stock value
  double stockValue = 0;
  for (final p in products) {
    final qty = Formatters.toDouble(p['quantity_on_hand'] ?? p['stock_on_hand'] ?? 0);
    final cost = Formatters.toDouble(p['cost_price'] ?? 0);
    stockValue += qty * cost;
  }
  final stockItems = products.length;

  // Revenue series (daily)
  final dayMap = <String, double>{};
  for (final t in inRange) {
    final d = parsed(t['created_at']?.toString());
    if (d == null) continue;
    final key = '${d.year}-${d.month.toString().padLeft(2, '0')}-${d.day.toString().padLeft(2, '0')}';
    dayMap[key] = (dayMap[key] ?? 0) + txTotal(t);
  }
  final revenueSeries = <RevenuePoint>[];
  for (int i = 0; i < periodDays; i++) {
    final d = range.from.add(Duration(days: i));
    if (d.isAfter(range.to)) break;
    final key = '${d.year}-${d.month.toString().padLeft(2, '0')}-${d.day.toString().padLeft(2, '0')}';
    revenueSeries.add(RevenuePoint(key, dayMap[key] ?? 0));
  }

  // Payment methods
  final pmMap = <String, double>{};
  for (final t in inRange) {
    final m = (t['payment_method'] ?? 'cash').toString();
    pmMap[m] = (pmMap[m] ?? 0) + txTotal(t);
  }
  final paymentMethods = pmMap.entries
      .map((e) => NameValue(e.key, e.value))
      .toList()
    ..sort((a, b) => b.value.compareTo(a.value));

  // Top products by line_total
  final prodRevMap = <String, double>{};
  for (final t in inRange) {
    final items = t['items'];
    if (items is List) {
      for (final i in items) {
        final m = i as Map;
        final name = m['product_name']?.toString() ?? 'Unknown';
        prodRevMap[name] = (prodRevMap[name] ?? 0) + Formatters.toDouble(m['line_total'] ?? 0);
      }
    }
  }
  final topProducts = prodRevMap.entries
      .map((e) => NameValue(e.key, e.value))
      .toList()
    ..sort((a, b) => b.value.compareTo(a.value));
  final topProducts10 = topProducts.take(10).toList();

  // Category revenue
  final catRevMap = <String, double>{};
  for (final t in inRange) {
    final items = t['items'];
    if (items is List) {
      for (final i in items) {
        final m = i as Map;
        final cat = m['category_name']?.toString() ?? 'Uncategorized';
        catRevMap[cat] = (catRevMap[cat] ?? 0) + Formatters.toDouble(m['line_total'] ?? 0);
      }
    }
  }
  final categoryRevenue = catRevMap.entries
      .map((e) => NameValue(e.key, e.value))
      .toList()
    ..sort((a, b) => b.value.compareTo(a.value));

  // Hourly pattern (24)
  final hourly = List<double>.filled(24, 0);
  for (final t in inRange) {
    final d = parsed(t['created_at']?.toString());
    if (d == null) continue;
    hourly[d.hour] += txTotal(t);
  }

  // Weekday avg (7, Mon=0)
  final weekdaySum = List<double>.filled(7, 0);
  final weekdayCnt = List<int>.filled(7, 0);
  for (final t in inRange) {
    final d = parsed(t['created_at']?.toString());
    if (d == null) continue;
    final w = d.weekday - 1; // Mon=0
    weekdaySum[w] += txTotal(t);
    weekdayCnt[w] += 1;
  }
  final weekday = List<double>.generate(7, (i) => weekdayCnt[i] > 0 ? weekdaySum[i] / weekdayCnt[i] : 0);

  // Cashier performance
  final cashierMap = <String, _CashierAgg>{};
  for (final t in inRange) {
    final name = t['cashier_name']?.toString() ?? 'Unknown';
    final agg = cashierMap.putIfAbsent(name, () => _CashierAgg());
    agg.count++;
    agg.revenue += txTotal(t);
    agg.items += (t['items_count'] as int?) ?? 0;
  }
  final cashiers = <CashierStat>[];
  for (final e in cashierMap.entries) {
    final share = revenue > 0 ? e.value.revenue / revenue * 100 : 0.0;
    cashiers.add(CashierStat(
      e.key, e.value.count, e.value.revenue,
      e.value.count > 0 ? e.value.revenue / e.value.count : 0,
      e.value.items, share,
    ));
  }
  cashiers.sort((a, b) => b.revenue.compareTo(a.revenue));

  // Recent transactions (last 15)
  final recent = [...inRange]
    ..sort((a, b) {
      final da = parsed(a['created_at']?.toString()) ?? DateTime.now();
      final db = parsed(b['created_at']?.toString()) ?? DateTime.now();
      return db.compareTo(da);
    });
  final recentTransactions = recent.take(15).toList();

  // ── Product analytics ───────────────────────────────────────────
  final prodQtyMap = <String, double>{};
  final prodSkuMap = <String, String>{};
  final lastSoldMap = <String, DateTime>{};
  for (final t in inRange) {
    final items = t['items'];
    if (items is List) {
      for (final i in items) {
        final m = i as Map;
        final name = m['product_name']?.toString() ?? 'Unknown';
        final qty = Formatters.toDouble(m['quantity'] ?? 0);
        prodQtyMap[name] = (prodQtyMap[name] ?? 0) + qty;
        if (prodSkuMap[name] == null) prodSkuMap[name] = m['product_sku']?.toString() ?? '';
        final d = parsed(t['created_at']?.toString());
        if (d != null) {
          final cur = lastSoldMap[name];
          if (cur == null || d.isAfter(cur)) lastSoldMap[name] = d;
        }
      }
    }
  }

  // Product ranking by revenue
  final ranked = <ProductRank>[];
  final rankedNames = prodRevMap.entries.toList()
    ..sort((a, b) => b.value.compareTo(a.value));
  final totalRev = rankedNames.fold(0.0, (s, e) => s + e.value);
  double cumulative = 0;
  for (int i = 0; i < rankedNames.length; i++) {
    final e = rankedNames[i];
    cumulative += e.value;
    final cumPct = totalRev > 0 ? cumulative / totalRev * 100 : 0.0;
    final share = totalRev > 0 ? e.value / totalRev * 100 : 0.0;
    final qty = prodQtyMap[e.key] ?? 0;
    final avgPrice = qty > 0 ? e.value / qty : 0.0;
    final cls = cumPct <= 80 ? 'A' : cumPct <= 95 ? 'B' : 'C';
    ranked.add(ProductRank(e.key, prodSkuMap[e.key] ?? '', e.value, qty, i + 1, share, cumPct, avgPrice, cls));
  }
  final top20 = ranked.take(20).toList();
  final abcCounts = {'A': 0, 'B': 0, 'C': 0};
  for (final r in ranked) {
    abcCounts[r.abcClass] = (abcCounts[r.abcClass] ?? 0) + 1;
  }

  // Slow moving (>30 days idle), never sold, dead stock
  final now = DateTime.now();
  final slowMoving = <SlowMoving>[];
  final neverSold = <NeverSold>[];
  final deadStock = <DeadStock>[];
  final soldNames = prodRevMap.keys.toSet();
  for (final p in products) {
    final name = p['name']?.toString() ?? '';
    final sku = p['sku']?.toString() ?? '';
    final qty = Formatters.toDouble(p['quantity_on_hand'] ?? p['stock_on_hand'] ?? 0);
    final cost = Formatters.toDouble(p['cost_price'] ?? 0);
    final sv = qty * cost;
    if (soldNames.contains(name)) {
      final last = lastSoldMap[name];
      if (last != null) {
        final days = now.difference(last).inDays;
        if (days > 30) {
          slowMoving.add(SlowMoving(name, sku, days, sv));
        }
      }
    } else {
      neverSold.add(NeverSold(name, sku, sv));
      if (qty > 0) {
        deadStock.add(DeadStock(name, sku, qty, sv, stockValue > 0 ? sv / stockValue * 100 : 0));
      }
    }
  }
  slowMoving.sort((a, b) => b.daysIdle.compareTo(a.daysIdle));
  deadStock.sort((a, b) => b.stockValue.compareTo(a.stockValue));

  final productsSold = soldNames.length;
  final neverSoldCount = neverSold.length;
  final totalProducts = products.length;
  final deadStockValue = deadStock.fold(0.0, (s, d) => s + d.stockValue);
  final avgRevenuePerProduct = products.isNotEmpty ? revenue / products.length : 0.0;
  final topProductRevenue = ranked.isEmpty ? 0.0 : ranked.first.revenue;
  final topPct = revenue > 0 ? topProductRevenue / revenue * 100 : 0.0;

  // ── Category analytics ──────────────────────────────────────────
  final catStockMap = <String, double>{};
  final catProdCount = <String, int>{};
  for (final p in products) {
    final cat = p['category_name']?.toString() ?? 'Uncategorized';
    final qty = Formatters.toDouble(p['quantity_on_hand'] ?? p['stock_on_hand'] ?? 0);
    final cost = Formatters.toDouble(p['cost_price'] ?? 0);
    catStockMap[cat] = (catStockMap[cat] ?? 0) + qty * cost;
    catProdCount[cat] = (catProdCount[cat] ?? 0) + 1;
  }
  final catQtyMap = <String, double>{};
  for (final t in inRange) {
    final items = t['items'];
    if (items is List) {
      for (final i in items) {
        final m = i as Map;
        final cat = m['category_name']?.toString() ?? 'Uncategorized';
        catQtyMap[cat] = (catQtyMap[cat] ?? 0) + Formatters.toDouble(m['quantity'] ?? 0);
      }
    }
  }
  final allCats = <String>{...catRevMap.keys, ...catStockMap.keys};
  final categoryStats = <CategoryStat>[];
  for (final c in allCats) {
    final rev = catRevMap[c] ?? 0;
    categoryStats.add(CategoryStat(
      c, rev, catQtyMap[c] ?? 0, catStockMap[c] ?? 0,
      catProdCount[c] ?? 0, revenue > 0 ? rev / revenue * 100 : 0,
    ));
  }
  categoryStats.sort((a, b) => b.revenue.compareTo(a.revenue));
  final totalCategories = allCats.length;
  final topCategory = categoryStats.isEmpty ? null : categoryStats.first.category;
  final topCategoryRevenue = categoryStats.isEmpty ? 0.0 : categoryStats.first.revenue;
  // Category dead stock: products never sold grouped by category
  double categoryDeadStockValue = neverSold.fold(0.0, (s, n) => s + n.stockValue);

  return AnalyticsData(
    revenue: revenue,
    txCount: txCount,
    itemsSold: itemsSold,
    aov: aov,
    discountCount: discountCount,
    grossProfit: grossProfit,
    grossMarginPct: grossMarginPct,
    revGrowth: revGrowth,
    stockItems: stockItems,
    stockValue: stockValue,
    revenueSeries: revenueSeries,
    paymentMethods: paymentMethods,
    topProducts: topProducts10,
    categoryRevenue: categoryRevenue,
    hourly: hourly,
    weekday: weekday,
    cashiers: cashiers,
    recentTransactions: recentTransactions,
    productRanking: ranked,
    top20: top20,
    slowMoving: slowMoving,
    neverSold: neverSold,
    deadStock: deadStock,
    abcCounts: abcCounts,
    totalProducts: totalProducts,
    productsSold: productsSold,
    neverSoldCount: neverSoldCount,
    avgRevenuePerProduct: avgRevenuePerProduct,
    deadStockValue: deadStockValue,
    topProductRevenue: topProductRevenue,
    topPct: topPct,
    categoryStats: categoryStats,
    totalCategories: totalCategories,
    topCategoryRevenue: topCategoryRevenue,
    topCategory: topCategory,
    categoryDeadStockValue: categoryDeadStockValue,
  );
});

class _CashierAgg {
  int count = 0;
  double revenue = 0;
  int items = 0;
}

// ── Sales data (for the Sales tab) ────────────────────────────────

class SalesData {
  final int totalSales;
  final int completedCount;
  final double totalRevenue;
  final double avgSale;
  final double totalDiscount;
  final int totalItems;
  final int uniqueProducts;
  final double avgItemsPerSale;
  final double completionRate;
  final List<NameValue> paymentMethods;
  final List<NameValue> topProducts;
  final List<NameValue> statusBreakdown;
  final List<RevenuePoint> revenueSeries;
  final List<double> weekday;
  final List<double> hourly;
  final List<CashierStat> cashiers;
  final List<Map<String, dynamic>> transactions;

  const SalesData({
    this.totalSales = 0,
    this.completedCount = 0,
    this.totalRevenue = 0,
    this.avgSale = 0,
    this.totalDiscount = 0,
    this.totalItems = 0,
    this.uniqueProducts = 0,
    this.avgItemsPerSale = 0,
    this.completionRate = 0,
    this.paymentMethods = const [],
    this.topProducts = const [],
    this.statusBreakdown = const [],
    this.revenueSeries = const [],
    this.weekday = const [],
    this.hourly = const [],
    this.cashiers = const [],
    this.transactions = const [],
  });
}

final salesDataProvider =
    FutureProvider.family<SalesData, AnalyticsPeriod>((ref, period) async {
  final api = ref.watch(apiClientProvider);
  final range = analyticsRange(period);

  final txRes = await api.get('/pos/transactions/', query: {'page_size': 2000});
  List<Map<String, dynamic>> extract(dynamic d) {
    if (d is List) return List<Map<String, dynamic>>.from(d);
    if (d is Map<String, dynamic>) {
      return List<Map<String, dynamic>>.from(d['results'] as List? ?? []);
    }
    return [];
  }

  final all = extract(txRes.data);
  DateTime? parsed(String? s) => s == null ? null : DateTime.tryParse(s);

  final inRange = all.where((t) {
    final d = parsed(t['created_at']?.toString());
    if (d == null) return false;
    return !d.isBefore(range.from) && d.isBefore(range.to.add(const Duration(days: 1)));
  }).toList();

  double txTotal(Map t) => Formatters.toDouble(t['total'] ?? 0);
  final completed = inRange.where((t) => (t['status'] ?? 'completed') == 'completed').toList();

  final totalRevenue = completed.fold(0.0, (s, t) => s + txTotal(t));
  final completedCount = completed.length;
  final totalDiscount = completed.fold(0.0, (s, t) => s + Formatters.toDouble(t['discount'] ?? 0));
  final totalItems = completed.fold(0, (s, t) => s + ((t['items_count'] as int?) ?? 0));
  final productSet = <dynamic>{};
  for (final t in completed) {
    final items = t['items'];
    if (items is List) {
      for (final i in items) {
        productSet.add((i as Map)['product']);
      }
    }
  }

  // Payment methods
  final pmMap = <String, double>{};
  for (final t in completed) {
    final m = (t['payment_method'] ?? 'cash').toString();
    pmMap[m] = (pmMap[m] ?? 0) + txTotal(t);
  }
  final paymentMethods = pmMap.entries.map((e) => NameValue(e.key, e.value)).toList()
    ..sort((a, b) => b.value.compareTo(a.value));

  // Top products
  final prodRevMap = <String, double>{};
  for (final t in completed) {
    final items = t['items'];
    if (items is List) {
      for (final i in items) {
        final m = i as Map;
        final name = m['product_name']?.toString() ?? 'Unknown';
        prodRevMap[name] = (prodRevMap[name] ?? 0) + Formatters.toDouble(m['line_total'] ?? 0);
      }
    }
  }
  final topProducts = prodRevMap.entries.map((e) => NameValue(e.key, e.value)).toList()
    ..sort((a, b) => b.value.compareTo(a.value));

  // Status breakdown (all transactions)
  final statusMap = <String, int>{};
  for (final t in inRange) {
    final s = (t['status'] ?? 'unknown').toString();
    statusMap[s] = (statusMap[s] ?? 0) + 1;
  }
  final statusBreakdown = statusMap.entries.map((e) => NameValue(e.key, e.value.toDouble())).toList()
    ..sort((a, b) => b.value.compareTo(a.value));

  // Revenue series (daily completed)
  final periodDays = range.to.difference(range.from).inDays + 1;
  final dayMap = <String, double>{};
  for (final t in completed) {
    final d = parsed(t['created_at']?.toString());
    if (d == null) continue;
    final key = '${d.year}-${d.month.toString().padLeft(2, '0')}-${d.day.toString().padLeft(2, '0')}';
    dayMap[key] = (dayMap[key] ?? 0) + txTotal(t);
  }
  final revenueSeries = <RevenuePoint>[];
  for (int i = 0; i < periodDays; i++) {
    final d = range.from.add(Duration(days: i));
    if (d.isAfter(range.to)) break;
    final key = '${d.year}-${d.month.toString().padLeft(2, '0')}-${d.day.toString().padLeft(2, '0')}';
    revenueSeries.add(RevenuePoint(key, dayMap[key] ?? 0));
  }

  // Hourly (completed)
  final hourly = List<double>.filled(24, 0);
  for (final t in completed) {
    final d = parsed(t['created_at']?.toString());
    if (d == null) continue;
    hourly[d.hour] += txTotal(t);
  }

  // Weekday avg (completed)
  final weekdaySum = List<double>.filled(7, 0);
  final weekdayCnt = List<int>.filled(7, 0);
  for (final t in completed) {
    final d = parsed(t['created_at']?.toString());
    if (d == null) continue;
    final w = d.weekday - 1;
    weekdaySum[w] += txTotal(t);
    weekdayCnt[w] += 1;
  }
  final weekday = List<double>.generate(7, (i) => weekdayCnt[i] > 0 ? weekdaySum[i] / weekdayCnt[i] : 0);

  // Cashiers (completed)
  final cashierMap = <String, _CashierAgg>{};
  for (final t in completed) {
    final name = t['cashier_name']?.toString() ?? 'Unknown';
    final agg = cashierMap.putIfAbsent(name, () => _CashierAgg());
    agg.count++;
    agg.revenue += txTotal(t);
    agg.items += (t['items_count'] as int?) ?? 0;
  }
  final cashiers = <CashierStat>[];
  for (final e in cashierMap.entries) {
    final share = totalRevenue > 0 ? e.value.revenue / totalRevenue * 100 : 0.0;
    cashiers.add(CashierStat(
      e.key, e.value.count, e.value.revenue,
      e.value.count > 0 ? e.value.revenue / e.value.count : 0,
      e.value.items, share,
    ));
  }
  cashiers.sort((a, b) => b.revenue.compareTo(a.revenue));

  // Transactions sorted newest first
  final transactions = [...inRange]
    ..sort((a, b) {
      final da = parsed(a['created_at']?.toString()) ?? DateTime.now();
      final db = parsed(b['created_at']?.toString()) ?? DateTime.now();
      return db.compareTo(da);
    });

  return SalesData(
    totalSales: inRange.length,
    completedCount: completedCount,
    totalRevenue: totalRevenue,
    avgSale: completedCount > 0 ? totalRevenue / completedCount : 0,
    totalDiscount: totalDiscount,
    totalItems: totalItems,
    uniqueProducts: productSet.length,
    avgItemsPerSale: completedCount > 0 ? totalItems / completedCount : 0,
    completionRate: inRange.isNotEmpty ? completedCount / inRange.length * 100 : 0,
    paymentMethods: paymentMethods,
    topProducts: topProducts.take(10).toList(),
    statusBreakdown: statusBreakdown,
    revenueSeries: revenueSeries,
    weekday: weekday,
    hourly: hourly,
    cashiers: cashiers,
    transactions: transactions,
  );
});
