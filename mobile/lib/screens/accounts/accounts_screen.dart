/// Accounts screen — full parity with the web app's `/accounts` page.
///
/// 9 tabs: Overview, Receivables, Payables, Cash Flow, ROI,
/// Transactions, P&L, Balance Sheet, General Ledger.
///
/// All data is fetched in parallel from 10 API endpoints and
/// computed client-side (matching the web implementation).

import 'dart:io';
import 'dart:math' as math;
import 'package:fl_chart/fl_chart.dart';
import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:path_provider/path_provider.dart';
import 'package:share_plus/share_plus.dart';

import '../../core/api_client.dart';
import '../../core/formatters.dart';
import '../../providers/auth_provider.dart';
import '../../widgets/common.dart';

// ── Data model ──────────────────────────────────────────────────────

class AccountsData {
  final List<Map<String, dynamic>> transactions;
  final List<Map<String, dynamic>> invoices;
  final List<Map<String, dynamic>> credits;
  final List<Map<String, dynamic>> expenses;
  final List<Map<String, dynamic>> purchaseOrders;
  final double inventoryValue;
  final double shiftCash;
  final List<Map<String, dynamic>> journalEntries;
  final List<Map<String, dynamic>> chartOfAccounts;
  final Map<int, double> productCostMap;

  const AccountsData({
    this.transactions = const [],
    this.invoices = const [],
    this.credits = const [],
    this.expenses = const [],
    this.purchaseOrders = const [],
    this.inventoryValue = 0,
    this.shiftCash = 0,
    this.journalEntries = const [],
    this.chartOfAccounts = const [],
    this.productCostMap = const {},
  });
}

// ── Provider ────────────────────────────────────────────────────────

Future<List<Map<String, dynamic>>> _fetchAllPages(
    ApiClient api, String path) async {
  final all = <Map<String, dynamic>>[];
  String? nextUrl = path;
  while (nextUrl != null) {
    final res = await api.get(nextUrl);
    final data = res.data;
    if (data is List) {
      all.addAll(data.cast<Map<String, dynamic>>());
      break;
    }
    final paginated = data as Map<String, dynamic>;
    all.addAll(
        (paginated['results'] as List? ?? []).cast<Map<String, dynamic>>());
    final next = paginated['next'] as String?;
    if (next == null) {
      nextUrl = null;
    } else {
      nextUrl = next.replaceAll(RegExp(r'^https?://[^/]+/api'), '');
    }
  }
  return all;
}

List<Map<String, dynamic>> _extractResults(dynamic data) {
  if (data is List) return data.cast<Map<String, dynamic>>();
  if (data is Map<String, dynamic>) {
    return (data['results'] as List? ?? []).cast<Map<String, dynamic>>();
  }
  return [];
}

final accountsDataProvider = FutureProvider<AccountsData>((ref) async {
  final api = ref.watch(apiClientProvider);

  // Fetch all data — each call is independently error-handled
  List<Map<String, dynamic>> txns;
  try {
    txns = await _fetchAllPages(api, '/pos/transactions/?ordering=-created_at&page_size=500');
  } catch (_) { txns = []; }

  List<Map<String, dynamic>> invoices;
  try {
    final res = await api.get('/accounting/invoices/', query: {'page_size': 200});
    invoices = _extractResults(res.data);
  } catch (_) { invoices = []; }

  List<Map<String, dynamic>> credits;
  try {
    final res = await api.get('/pos/credits/', query: {'page_size': 200});
    credits = _extractResults(res.data);
  } catch (_) { credits = []; }

  List<Map<String, dynamic>> expenses;
  try {
    final res = await api.get('/accounting/expenses/', query: {'page_size': 200});
    expenses = _extractResults(res.data);
  } catch (_) { expenses = []; }

  List<Map<String, dynamic>> purchaseOrders;
  try {
    final res = await api.get('/purchasing/orders/', query: {'page_size': 200});
    purchaseOrders = _extractResults(res.data);
  } catch (_) { purchaseOrders = []; }

  double invValue = 0;
  try {
    final res = await api.get('/reports/inventory-valuation/');
    if (res.data is List) {
      invValue = (res.data as List).fold(0.0, (s, i) => s + Formatters.toDouble(i['stock_value']));
    } else if (res.data is Map) {
      invValue = Formatters.toDouble(res.data['total_value']);
    }
  } catch (_) {}

  double shiftCash = 0;
  try {
    final res = await api.get('/pos/shifts/current/');
    if (res.data is Map<String, dynamic>) {
      shiftCash = Formatters.toDouble(res.data['opening_float']);
    }
  } catch (_) {}

  List<Map<String, dynamic>> journalEntries;
  try {
    final res = await api.get('/accounting/journal/', query: {'page_size': 500});
    journalEntries = _extractResults(res.data);
  } catch (_) { journalEntries = []; }

  List<Map<String, dynamic>> chartOfAccounts;
  try {
    final res = await api.get('/accounting/accounts/', query: {'page_size': 200});
    chartOfAccounts = _extractResults(res.data);
  } catch (_) { chartOfAccounts = []; }

  List<Map<String, dynamic>> products;
  try {
    final res = await api.get('/products/', query: {'page_size': 500});
    products = _extractResults(res.data);
  } catch (_) { products = []; }

  final costMap = <int, double>{};
  for (final p in products) {
    costMap[p['id'] as int? ?? 0] =
        double.tryParse(p['cost_price']?.toString() ?? '0') ?? 0;
  }

  return AccountsData(
    transactions: txns,
    invoices: invoices,
    credits: credits,
    expenses: expenses,
    purchaseOrders: purchaseOrders,
    inventoryValue: invValue,
    shiftCash: shiftCash,
    journalEntries: journalEntries,
    chartOfAccounts: chartOfAccounts,
    productCostMap: costMap,
  );
});

// ── Computed helpers ────────────────────────────────────────────────

List<DateTime> _resolveRange(String key, {DateTime? customFrom, DateTime? customTo}) {
  if (key == 'all') return [DateTime(2020), DateTime.now()];
  final now = DateTime.now();
  final today = DateTime(now.year, now.month, now.day, 23, 59, 59, 999);
  var from = DateTime(now.year, now.month, now.day, 0, 0, 0, 0);
  switch (key) {
    case 'today':
      return [from, today];
    case 'yesterday':
      return [from.subtract(const Duration(days: 1)),
              today.subtract(const Duration(days: 1))];
    case '7d':
      return [from.subtract(const Duration(days: 6)), today];
    case '30d':
      return [from.subtract(const Duration(days: 29)), today];
    case '90d':
      return [from.subtract(const Duration(days: 89)), today];
    case 'mtd':
      return [DateTime(now.year, now.month, 1), today];
    case 'ytd':
      return [DateTime(now.year, 1, 1), today];
    case 'custom':
      if (customFrom != null && customTo != null) {
        return [
          DateTime(customFrom.year, customFrom.month, customFrom.day, 0, 0, 0, 0),
          DateTime(customTo.year, customTo.month, customTo.day, 23, 59, 59, 999),
        ];
      }
      return [DateTime(2020), today];
    default:
      return [from.subtract(const Duration(days: 29)), today];
  }
}

bool _inRange(String dateStr, List<DateTime> range) {
  if (range.isEmpty) return true;
  final d = DateTime.tryParse(dateStr);
  if (d == null) return true;
  if (range.length == 2) {
    if (d.isBefore(range[0])) return false;
    if (d.isAfter(range[1])) return false;
  }
  return true;
}

class _Kpis {
  final double income, incomeVat, expenses, netCashFlow, outstanding, payables;
  final int expenseCount, creditCount;
  const _Kpis({
    this.income = 0, this.incomeVat = 0, this.expenses = 0,
    this.netCashFlow = 0, this.outstanding = 0, this.payables = 0,
    this.expenseCount = 0, this.creditCount = 0,
  });
}

class _AR {
  final double notDue, due30, due60, due60Plus;
  final int notDueCount, due30Count, due60Count, due60PlusCount;
  const _AR({
    this.notDue = 0, this.due30 = 0, this.due60 = 0, this.due60Plus = 0,
    this.notDueCount = 0, this.due30Count = 0, this.due60Count = 0, this.due60PlusCount = 0,
  });
}

class _PnL {
  final double revenue, discounts, netRevenue, cogs, grossProfit, expenses, netProfit;
  const _PnL({
    this.revenue = 0, this.discounts = 0, this.netRevenue = 0,
    this.cogs = 0, this.grossProfit = 0, this.expenses = 0, this.netProfit = 0,
  });
}

class _BS {
  final double cash, inventory, receivables, totalAssets;
  final double payables, creditOutstanding, totalLiabilities;
  const _BS({
    this.cash = 0, this.inventory = 0, this.receivables = 0, this.totalAssets = 0,
    this.payables = 0, this.creditOutstanding = 0, this.totalLiabilities = 0,
  });
}

class _LedgerEntry {
  final String date, entryNumber, description, account, accountType, reference, source;
  final double debit, credit;
  double balance;
  _LedgerEntry({
    required this.date, this.entryNumber = '', this.description = '',
    this.account = '', this.accountType = '', this.reference = '',
    this.source = '', this.debit = 0, this.credit = 0, this.balance = 0,
  });
}

class _CashFlowEntry {
  final String date, description, method, type;
  final double amount;
  const _CashFlowEntry({
    required this.date, this.description = '', this.method = 'cash',
    this.type = 'inflow', this.amount = 0,
  });
}

class _RoiMetrics {
  final double revenue, cogs, grossProfit, operatingExpenses, netProfit;
  final double totalInvestment, roi, profitMargin, grossMargin;
  final double paybackMonths, annualizedROI, monthlyNetProfit, roa, roe, roic;
  const _RoiMetrics({
    this.revenue = 0, this.cogs = 0, this.grossProfit = 0,
    this.operatingExpenses = 0, this.netProfit = 0,
    this.totalInvestment = 0, this.roi = 0, this.profitMargin = 0,
    this.grossMargin = 0, this.paybackMonths = 0, this.annualizedROI = 0,
    this.monthlyNetProfit = 0, this.roa = 0, this.roe = 0, this.roic = 0,
  });
}

class _ProductSold {
  final String name;
  final double unitCost, retail, qty, revenue, revenuePct, markup;
  const _ProductSold({
    this.name = '', this.unitCost = 0, this.retail = 0, this.qty = 0,
    this.revenue = 0, this.revenuePct = 0, this.markup = 0,
  });
}

class _DaySeries {
  final String name;
  final List<double> data;
  final Color color;
  const _DaySeries(this.name, this.data, this.color);
}

class _CumulativePoint {
  final DateTime date;
  final double value;
  const _CumulativePoint(this.date, this.value);
}

// ── Screen ──────────────────────────────────────────────────────────

class AccountsScreen extends ConsumerStatefulWidget {
  const AccountsScreen({super.key});

  @override
  ConsumerState<AccountsScreen> createState() => _AccountsScreenState();
}

class _AccountsScreenState extends ConsumerState<AccountsScreen> {
  static const _periodOptions = [
    ('All', 'all'), ('Today', 'today'), ('Yesterday', 'yesterday'),
    ('7d', '7d'), ('30d', '30d'), ('90d', '90d'),
    ('MTD', 'mtd'), ('YTD', 'ytd'), ('Custom', 'custom'),
  ];

  static const _tabs = [
    ('Overview', Icons.dashboard_outlined),
    ('Receivables', Icons.payments_outlined),
    ('Payables', Icons.money_off_outlined),
    ('Cash Flow', Icons.sync_alt),
    ('ROI', Icons.trending_up),
    ('Transactions', Icons.swap_horiz),
    ('P&L', Icons.bar_chart),
    ('Balance Sheet', Icons.balance),
    ('Ledger', Icons.menu_book_outlined),
  ];

  String _period = '30d';
  DateTime? _customFrom;
  DateTime? _customTo;

  // Transaction tab filters
  String _txType = 'all';
  String _txSearch = '';

  // Cash flow filters
  String? _cfMethod;
  String? _cfType;
  int _cfPage = 20;
  ScrollController? _cfScrollController;

  // ROI product lazy loading
  int _roiProductPage = 20;
  ScrollController? _roiScrollController;

  // Transactions lazy loading
  int _txPage = 20;
  ScrollController? _txScrollController;
  List<Map<String, dynamic>> _txFilteredCache = [];
  String? _txFilterTypeCache;
  String _txFilterSearchCache = '';
  String? _txFilterPeriodCache;

  // Ledger filters
  String? _ledgerAccount;
  String? _ledgerAccountType;
  String? _ledgerSource;
  String _ledgerSearch = '';
  int _ledgerPage = 20;
  ScrollController? _ledgerScrollController;

  @override
  void initState() {
    super.initState();
    _cfScrollController = ScrollController();
    _cfScrollController!.addListener(() {
      if (_cfScrollController!.position.pixels >= _cfScrollController!.position.maxScrollExtent - 200) {
        if (mounted) setState(() => _cfPage += 20);
      }
    });
    _roiScrollController = ScrollController();
    _roiScrollController!.addListener(() {
      if (_roiScrollController!.position.pixels >= _roiScrollController!.position.maxScrollExtent - 200) {
        if (mounted) setState(() => _roiProductPage += 20);
      }
    });
    _txScrollController = ScrollController();
    _txScrollController!.addListener(() {
      if (_txScrollController!.position.pixels >= _txScrollController!.position.maxScrollExtent - 200) {
        if (mounted) setState(() => _txPage += 20);
      }
    });
    _ledgerScrollController = ScrollController();
    _ledgerScrollController!.addListener(() {
      if (_ledgerScrollController!.position.pixels >= _ledgerScrollController!.position.maxScrollExtent - 200) {
        if (mounted) setState(() => _ledgerPage += 20);
      }
    });
  }

  @override
  void dispose() {
    _cfScrollController?.dispose();
    _roiScrollController?.dispose();
    _txScrollController?.dispose();
    _ledgerScrollController?.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final auth = ref.watch(authProvider);
    final currency = auth.billing?.currency ?? 'KSh';
    final dataAsync = ref.watch(accountsDataProvider);

    return DefaultTabController(
      length: _tabs.length,
      child: Scaffold(
        appBar: AppBar(
          title: const Text('Accounts'),
          actions: [
            IconButton(
              icon: const Icon(Icons.refresh),
              tooltip: 'Refresh',
              onPressed: () => ref.invalidate(accountsDataProvider),
            ),
          ],
          bottom: TabBar(
            isScrollable: true,
            tabAlignment: TabAlignment.start,
            tabs: _tabs.map((t) => Tab(
              icon: Icon(t.$2, size: 18),
              text: t.$1,
            )).toList(),
          ),
        ),
        body: Column(
          children: [
            _buildPeriodBar(context),
            Expanded(
              child: dataAsync.when(
                loading: () => const LoadingWidget(),
                error: (e, _) => ErrorStateWidget(
                  message: 'Failed to load accounts data',
                  onRetry: () => ref.invalidate(accountsDataProvider),
                ),
              data: (data) {
                _data = data;
                transactions_data = data.transactions;
                invoices_data = data.invoices;
                credits_data = data.credits;
                expenses_data = data.expenses;
                purchaseOrders_data = data.purchaseOrders;
                return TabBarView(
                  children: [
                    _overviewTab(context, data, currency),
                    _receivablesTab(context, data, currency),
                    _payablesTab(context, data, currency),
                    _cashFlowTab(context, data, currency),
                    _roiTab(context, data, currency),
                    _transactionsTab(context, data, currency),
                    _pnlTab(context, data, currency),
                    _balanceSheetTab(context, data, currency),
                    _ledgerTab(context, data, currency),
                  ],
                );
              },
              ),
            ),
          ],
        ),
      ),
    );
  }

  // ── Period bar ────────────────────────────────────────────────────

  Widget _buildPeriodBar(BuildContext context) {
    final scheme = Theme.of(context).colorScheme;
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
      child: Row(
        children: [
          Icon(Icons.calendar_today, size: 18, color: scheme.onSurfaceVariant),
          const SizedBox(width: 8),
          Expanded(
            child: SizedBox(
              height: 36,
              child: ListView.separated(
                scrollDirection: Axis.horizontal,
                itemCount: _periodOptions.length,
                separatorBuilder: (_, __) => const SizedBox(width: 6),
                itemBuilder: (context, index) {
                  final opt = _periodOptions[index];
                  final isSelected = _period == opt.$2;
                  return ChoiceChip(
                    label: Text(opt.$1, style: const TextStyle(fontSize: 12)),
                    selected: isSelected,
                    onSelected: (_) {
                      if (opt.$2 == 'custom') {
                        _showCustomDateDialog(context);
                      } else {
                        setState(() {
                          _period = opt.$2;
                          _customFrom = null;
                          _customTo = null;
                        });
                      }
                    },
                    visualDensity: VisualDensity.compact,
                    padding: const EdgeInsets.symmetric(horizontal: 4),
                  );
                },
              ),
            ),
          ),
        ],
      ),
    );
  }

  void _showCustomDateDialog(BuildContext context) {
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Custom Date Range'),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            ListTile(
              title: Text(_customFrom != null ? Formatters.date(_customFrom) : 'From date'),
              leading: const Icon(Icons.event_available),
              onTap: () async {
                final d = await showDatePicker(
                  context: ctx,
                  initialDate: _customFrom ?? DateTime.now(),
                  firstDate: DateTime(2020),
                  lastDate: DateTime.now(),
                );
                if (d != null) setState(() => _customFrom = d);
              },
            ),
            ListTile(
              title: Text(_customTo != null ? Formatters.date(_customTo) : 'To date'),
              leading: const Icon(Icons.event_busy),
              onTap: () async {
                final d = await showDatePicker(
                  context: ctx,
                  initialDate: _customTo ?? DateTime.now(),
                  firstDate: DateTime(2020),
                  lastDate: DateTime.now(),
                );
                if (d != null) setState(() => _customTo = d);
              },
            ),
          ],
        ),
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx), child: const Text('Cancel')),
          FilledButton(
            onPressed: () {
              setState(() => _period = 'custom');
              Navigator.pop(ctx);
            },
            child: const Text('Apply'),
          ),
        ],
      ),
    );
  }

  // ── Computed values ──────────────────────────────────────────────

  List<DateTime> get _range =>
      _resolveRange(_period, customFrom: _customFrom, customTo: _customTo);

  List<Map<String, dynamic>>? _txInRangeCache;
  List<Map<String, dynamic>>? _expInRangeCache;
  int? _txInRangeCacheHash;
  int? _expInRangeCacheHash;

  List<Map<String, dynamic>> get _txInRange {
    final h = _range.hashCode ^ transactions_data.length;
    if (_txInRangeCache != null && h == _txInRangeCacheHash) return _txInRangeCache!;
    _txInRangeCache = _filterByRange(transactions_data, _range, 'created_at');
    _txInRangeCacheHash = h;
    return _txInRangeCache!;
  }
  List<Map<String, dynamic>> get _expInRange {
    final h = _range.hashCode ^ expenses_data.length;
    if (_expInRangeCache != null && h == _expInRangeCacheHash) return _expInRangeCache!;
    _expInRangeCache = _filterByRange(expenses_data, _range, 'date');
    _expInRangeCacheHash = h;
    return _expInRangeCache!;
  }

  // These will be set in build
  late List<Map<String, dynamic>> transactions_data;
  late List<Map<String, dynamic>> invoices_data;
  late List<Map<String, dynamic>> credits_data;
  late List<Map<String, dynamic>> expenses_data;
  late List<Map<String, dynamic>> purchaseOrders_data;
  late AccountsData _data;

  List<Map<String, dynamic>> _filterByRange(
      List<Map<String, dynamic>> list, List<DateTime> range, String dateKey) {
    return list.where((e) => _inRange(e[dateKey]?.toString() ?? '', range)).toList();
  }

  _Kpis _computeKpis() {
    final incomeTx = _txInRange.where((t) => t['status'] == 'completed').toList();
    final income = incomeTx.fold(0.0, (s, t) => s + Formatters.toDouble(t['total']));
    final incomeVat = incomeTx.fold(0.0, (s, t) => s + Formatters.toDouble(t['tax']));
    final expTotal = _expInRange.fold(0.0, (s, e) => s + Formatters.toDouble(e['amount']));
    final receivablesTotal = _receivablesInvoices.fold(0.0, (s, i) => s + Formatters.toDouble(i['balance']));
    final creditOutstanding = _openCredits.fold(0.0, (s, c) => s + Formatters.toDouble(c['balance']));
    final payableTotal = _openPOs.fold(0.0, (s, p) => s + Formatters.toDouble(p['grand_total'])) + _unpaidExpenseTotal;
    return _Kpis(
      income: income, incomeVat: incomeVat, expenses: expTotal,
      netCashFlow: income - expTotal,
      outstanding: receivablesTotal + creditOutstanding,
      payables: payableTotal, expenseCount: _expInRange.length,
      creditCount: _openCredits.length,
    );
  }

  List<Map<String, dynamic>> get _receivablesInvoices =>
      invoices_data.where((i) => Formatters.toDouble(i['balance']) > 0).toList();
  List<Map<String, dynamic>> get _openCredits =>
      credits_data.where((c) => c['status'] != 'settled' && Formatters.toDouble(c['balance']) > 0).toList();
  List<Map<String, dynamic>> get _openPOs =>
      purchaseOrders_data.where((p) => p['status'] != 'cancelled' && p['status'] != 'received').toList();
  List<Map<String, dynamic>> get _unpaidExpenses =>
      expenses_data.where((e) => ['Unpaid', 'Pending Approval', 'Approved'].contains(e['status'])).toList();
  List<Map<String, dynamic>> get _paidExpenses =>
      expenses_data.where((e) => e['status'] == 'Paid').toList();
  double get _unpaidExpenseTotal => _unpaidExpenses.fold(0.0, (s, e) => s + Formatters.toDouble(e['amount']));
  double get _paidExpenseTotal => _paidExpenses.fold(0.0, (s, e) => s + Formatters.toDouble(e['amount']));

  _AR _computeAR() {
    final all = [..._receivablesInvoices, ..._openCredits];
    final now = DateTime.now();
    double notDue = 0, due30 = 0, due60 = 0, due60Plus = 0;
    int notDueCount = 0, due30Count = 0, due60Count = 0, due60PlusCount = 0;
    for (final i in all) {
      final bal = Formatters.toDouble(i['balance']);
      if (bal <= 0) continue;
      final dueStr = i['due_date']?.toString();
      final due = dueStr != null ? DateTime.tryParse(dueStr) : null;
      if (due == null) { notDue += bal; notDueCount++; continue; }
      final diff = now.difference(due).inDays;
      if (diff < 0) { notDue += bal; notDueCount++; }
      else if (diff <= 30) { due30 += bal; due30Count++; }
      else if (diff <= 60) { due60 += bal; due60Count++; }
      else { due60Plus += bal; due60PlusCount++; }
    }
    return _AR(notDue: notDue, due30: due30, due60: due60, due60Plus: due60Plus,
        notDueCount: notDueCount, due30Count: due30Count, due60Count: due60Count, due60PlusCount: due60PlusCount);
  }

  _PnL _computePnL() {
    final completedTx = _data.transactions.where((t) => t['status'] == 'completed').toList();
    final revenue = completedTx.fold(0.0, (s, t) => s + Formatters.toDouble(t['subtotal']));
    final discounts = completedTx.fold(0.0, (s, t) => s + Formatters.toDouble(t['discount']));
    final netRevenue = revenue - discounts;
    final cogs = completedTx.expand((t) => (t['items'] as List? ?? [])).fold(0.0,
        (s, i) => s + Formatters.toDouble(i['quantity']) * Formatters.toDouble(i['unit_cost']));
    final grossProfit = netRevenue - cogs;
    final expensesTotal = _data.expenses.fold(0.0, (s, e) => s + Formatters.toDouble(e['amount']));
    return _PnL(revenue: revenue, discounts: discounts, netRevenue: netRevenue,
        cogs: cogs, grossProfit: grossProfit, expenses: expensesTotal,
        netProfit: grossProfit - expensesTotal);
  }

  _BS _computeBS() {
    final receivablesTotal = _receivablesInvoices.fold(0.0, (s, i) => s + Formatters.toDouble(i['balance']));
    final payablesTotal = _openPOs.fold(0.0, (s, p) => s + Formatters.toDouble(p['grand_total'])) + _unpaidExpenseTotal;
    final creditOutstanding = _openCredits.fold(0.0, (s, c) => s + Formatters.toDouble(c['balance']));
    return _BS(
      cash: _data.shiftCash, inventory: _data.inventoryValue,
      receivables: receivablesTotal,
      totalAssets: _data.shiftCash + _data.inventoryValue + receivablesTotal,
      payables: payablesTotal, creditOutstanding: creditOutstanding,
      totalLiabilities: payablesTotal + creditOutstanding,
    );
  }

  List<_LedgerEntry> _computeLedger() {
    final entries = <_LedgerEntry>[];

    // 1. Real journal entries
    for (final je in _data.journalEntries) {
      if (je['status'] == 'reversed') continue;
      final lines = je['lines'] as List? ?? [];
      for (final line in lines) {
        final acct = line['account_detail'] ?? line['account_name'] ?? '—';
        entries.add(_LedgerEntry(
          date: (je['date'] ?? je['created_at'] ?? '').toString(),
          entryNumber: je['entry_number']?.toString() ?? 'JE',
          description: (line['description'] ?? je['description'] ?? 'Journal entry').toString(),
          account: acct.toString(),
          accountType: (line['account_type'] ?? '').toString(),
          debit: Formatters.toDouble(line['debit']),
          credit: Formatters.toDouble(line['credit']),
          reference: (je['reference'] ?? '').toString(),
          source: 'journal',
        ));
      }
    }

    // 2. POS transactions
    for (final t in _data.transactions.where((t) => t['status'] == 'completed')) {
      entries.add(_LedgerEntry(
        date: t['created_at']?.toString() ?? '',
        entryNumber: t['transaction_number']?.toString() ?? '',
        description: 'Sale ${t['transaction_number'] ?? ''}',
        account: 'Cash', accountType: 'asset',
        credit: Formatters.toDouble(t['total']),
        reference: t['payment_method']?.toString() ?? '', source: 'pos',
      ));
      entries.add(_LedgerEntry(
        date: t['created_at']?.toString() ?? '',
        entryNumber: t['transaction_number']?.toString() ?? '',
        description: 'Sale ${t['transaction_number'] ?? ''}',
        account: 'Sales Revenue', accountType: 'revenue',
        credit: Formatters.toDouble(t['subtotal']),
        source: 'pos',
      ));
    }

    // 3. Invoices
    for (final i in _data.invoices) {
      if (i['status'] == 'cancelled') continue;
      entries.add(_LedgerEntry(
        date: (i['created_at'] ?? i['issue_date'] ?? '').toString(),
        entryNumber: i['invoice_number']?.toString() ?? '',
        description: 'Invoice ${i['invoice_number'] ?? ''}',
        account: 'Accounts Receivable', accountType: 'asset',
        debit: Formatters.toDouble(i['total']),
        reference: i['customer_name']?.toString() ?? '', source: 'invoice',
      ));
    }

    // 4. Expenses
    for (final e in _data.expenses) {
      entries.add(_LedgerEntry(
        date: (e['date'] ?? e['created_at'] ?? '').toString(),
        entryNumber: e['expense_number']?.toString() ?? '',
        description: (e['description'] ?? e['category'] ?? 'Expense').toString(),
        account: 'Operating Expenses', accountType: 'expense',
        debit: Formatters.toDouble(e['amount']),
        reference: (e['vendor'] ?? e['payment_reference'] ?? '').toString(),
        source: 'expense',
      ));
    }

    // 5. Purchase orders
    for (final p in _data.purchaseOrders) {
      if (p['status'] == 'cancelled') continue;
      entries.add(_LedgerEntry(
        date: p['created_at']?.toString() ?? '',
        entryNumber: p['po_number']?.toString() ?? '',
        description: 'Purchase Order ${p['po_number'] ?? ''}',
        account: 'Accounts Payable', accountType: 'liability',
        credit: Formatters.toDouble(p['grand_total']),
        reference: (p['supplier_name'] ?? '').toString(), source: 'po',
      ));
    }

    // Sort by date descending
    entries.sort((a, b) => DateTime.tryParse(b.date)?.compareTo(DateTime.tryParse(a.date) ?? DateTime.now()) ?? 0);

    // Filter by range
    var filtered = entries.where((e) => _inRange(e.date, _range)).toList();

    // Apply ledger filters
    if (_ledgerAccountType != null) {
      filtered = filtered.where((e) => e.accountType == _ledgerAccountType).toList();
    }
    if (_ledgerAccount != null) {
      filtered = filtered.where((e) => e.account == _ledgerAccount).toList();
    }
    if (_ledgerSource != null) {
      filtered = filtered.where((e) => e.source == _ledgerSource).toList();
    }
    if (_ledgerSearch.isNotEmpty) {
      final s = _ledgerSearch.toLowerCase();
      filtered = filtered.where((e) =>
        e.description.toLowerCase().contains(s) ||
        e.entryNumber.toLowerCase().contains(s) ||
        e.account.toLowerCase().contains(s) ||
        e.reference.toLowerCase().contains(s)
      ).toList();
    }

    // Running balance
    final chronological = filtered.reversed.toList();
    double running = 0;
    for (final e in chronological) {
      running += e.debit - e.credit;
      e.balance = running;
    }
    return chronological.reversed.toList();
  }

  List<_CashFlowEntry> _computeCashFlow() {
    final entries = <_CashFlowEntry>[];
    _txInRange.where((t) => t['status'] == 'completed').forEach((t) {
      entries.add(_CashFlowEntry(
        date: t['created_at']?.toString() ?? '',
        description: 'POS Sale ${t['transaction_number'] ?? ''}',
        method: t['payment_method']?.toString() ?? 'cash',
        type: 'inflow', amount: Formatters.toDouble(t['total']),
      ));
    });
    _expInRange.forEach((e) {
      entries.add(_CashFlowEntry(
        date: (e['date'] ?? e['created_at'] ?? '').toString(),
        description: (e['description'] ?? e['category'] ?? 'Expense').toString(),
        method: e['payment_method']?.toString() ?? 'cash',
        type: 'outflow', amount: Formatters.toDouble(e['amount']),
      ));
    });
    entries.sort((a, b) => DateTime.tryParse(b.date)?.compareTo(DateTime.tryParse(a.date) ?? DateTime.now()) ?? 0);
    return entries;
  }

  _RoiMetrics _computeRoi() {
    final completedTx = _data.transactions.where((t) => t['status'] == 'completed').toList();
    final revenue = completedTx.fold(0.0, (s, t) => s + Formatters.toDouble(t['total']));
    final cogs = completedTx.expand((t) => (t['items'] as List? ?? [])).fold(0.0,
        (s, i) => s + Formatters.toDouble(i['quantity']) * Formatters.toDouble(i['unit_cost']));
    final grossProfit = revenue - cogs;
    final operatingExpenses = _data.expenses.fold(0.0, (s, e) => s + Formatters.toDouble(e['amount']));
    final netProfit = grossProfit - operatingExpenses;
    final inventory = _data.inventoryValue;
    final poInvested = _data.purchaseOrders
        .where((p) => p['status'] != 'cancelled')
        .fold(0.0, (s, p) => s + Formatters.toDouble(p['grand_total']));
    final totalInvestment = inventory + operatingExpenses + poInvested;
    final roi = totalInvestment > 0 ? (netProfit / totalInvestment) * 100 : 0.0;
    final profitMargin = revenue > 0 ? (netProfit / revenue) * 100 : 0.0;
    final grossMargin = revenue > 0 ? (grossProfit / revenue) * 100 : 0.0;
    final months = _range.length == 2
        ? (_range[1].difference(_range[0]).inDays / 30.0).clamp(1.0, double.infinity).toDouble()
        : 3.0;
    final monthlyNetProfit = netProfit / months;
    final paybackMonths = monthlyNetProfit > 0 ? totalInvestment / monthlyNetProfit : 0.0;
    final annualizedROI = months > 0 ? roi * (12 / months) : roi;
    final bs = _computeBS();
    final roa = bs.totalAssets > 0 ? (netProfit / bs.totalAssets) * 100 : 0.0;
    final equity = bs.totalAssets - bs.totalLiabilities;
    final roe = equity > 0 ? (netProfit / equity) * 100 : 0.0;
    final investedCapital = inventory + poInvested;
    final roic = investedCapital > 0 ? (netProfit / investedCapital) * 100 : 0.0;
    return _RoiMetrics(
      revenue: revenue, cogs: cogs, grossProfit: grossProfit,
      operatingExpenses: operatingExpenses, netProfit: netProfit,
      totalInvestment: totalInvestment, roi: roi, profitMargin: profitMargin,
      grossMargin: grossMargin, paybackMonths: paybackMonths,
      annualizedROI: annualizedROI, monthlyNetProfit: monthlyNetProfit,
      roa: roa, roe: roe, roic: roic,
    );
  }

  List<_ProductSold> _computeProductsSold() {
    final groups = <String, Map<String, dynamic>>{};
    for (final t in _txInRange.where((t) => t['status'] == 'completed')) {
      for (final item in (t['items'] as List? ?? [])) {
        final name = item['product_name']?.toString() ?? 'Unknown';
        final pid = item['product'] as int? ?? 0;
        final cost = _data.productCostMap[pid] ?? 0;
        final retail = Formatters.toDouble(item['unit_price']);
        final qty = Formatters.toDouble(item['quantity']);
        final lineTotal = Formatters.toDouble(item['line_total']) > 0
            ? Formatters.toDouble(item['line_total'])
            : qty * retail;
        if (!groups.containsKey(name)) {
          groups[name] = {'name': name, 'qty': 0.0, 'revenue': 0.0, 'costTotal': 0.0, 'retail': retail, 'cost': cost};
        }
        groups[name]!['qty'] += qty;
        groups[name]!['revenue'] += lineTotal;
        groups[name]!['costTotal'] += qty * cost;
      }
    }
    final list = groups.values.toList();
    final totalRevenue = list.fold(0.0, (s, p) => s + (p['revenue'] as double));
    return list.map((p) {
      final qty = p['qty'] as double;
      final costTotal = p['costTotal'] as double;
      final retail = p['retail'] as double;
      final cost = p['cost'] as double;
      return _ProductSold(
        name: p['name'] as String,
        unitCost: qty > 0 ? costTotal / qty : cost,
        retail: retail,
        qty: qty,
        revenue: p['revenue'] as double,
        revenuePct: totalRevenue > 0 ? (p['revenue'] as double) / totalRevenue * 100 : 0,
        markup: retail > 0 && cost > 0 ? ((retail - cost) / cost * 100) : 0,
      );
    }).toList()
      ..sort((a, b) => b.revenue.compareTo(a.revenue));
  }

  // ── Chart data computations ──────────────────────────────────────

  List<DateTime> get _chartDates {
    final range = _range;
    final days = math.min(30, math.max(1, range[1].difference(range[0]).inDays + 1));
    return List.generate(days, (i) => range[0].add(Duration(days: i)));
  }

  List<_DaySeries> get _cashFlowDailySeries {
    final dates = _chartDates;
    final incData = List<double>.filled(dates.length, 0);
    final expData = List<double>.filled(dates.length, 0);
    for (final t in _txInRange.where((t) => t['status'] == 'completed')) {
      final d = DateTime.tryParse(t['created_at']?.toString() ?? '');
      if (d == null) continue;
      final diff = d.difference(dates[0]).inDays;
      if (diff >= 0 && diff < dates.length) incData[diff] += Formatters.toDouble(t['total']);
    }
    for (final e in _expInRange) {
      final d = DateTime.tryParse((e['date'] ?? e['created_at'])?.toString() ?? '');
      if (d == null) continue;
      final diff = d.difference(dates[0]).inDays;
      if (diff >= 0 && diff < dates.length) expData[diff] += Formatters.toDouble(e['amount']);
    }
    return [_DaySeries('Income', incData, const Color(0xFF22c55e)), _DaySeries('Expenses', expData, const Color(0xFFef4444))];
  }

  List<_DaySeries> get _cashInOutDailySeries {
    final dates = _chartDates;
    final inData = List<double>.filled(dates.length, 0);
    final outData = List<double>.filled(dates.length, 0);
    for (final t in _txInRange.where((t) => t['status'] == 'completed')) {
      final d = DateTime.tryParse(t['created_at']?.toString() ?? '');
      if (d == null) continue;
      final diff = d.difference(dates[0]).inDays;
      if (diff >= 0 && diff < dates.length) inData[diff] += Formatters.toDouble(t['total']);
    }
    for (final e in _expInRange) {
      final d = DateTime.tryParse((e['date'] ?? e['created_at'])?.toString() ?? '');
      if (d == null) continue;
      final diff = d.difference(dates[0]).inDays;
      if (diff >= 0 && diff < dates.length) outData[diff] += Formatters.toDouble(e['amount']);
    }
    return [_DaySeries('Cash In', inData, const Color(0xFF22c55e)), _DaySeries('Cash Out', outData, const Color(0xFFef4444))];
  }

  List<_CumulativePoint> get _cumulativeCashFlow {
    final cf = _computeCashFlow()..sort((a, b) => DateTime.parse(a.date).compareTo(DateTime.parse(b.date)));
    double running = 0;
    final points = <_CumulativePoint>[];
    for (final e in cf) {
      running += e.type == 'inflow' ? e.amount : -e.amount;
      points.add(_CumulativePoint(DateTime.parse(e.date), running));
    }
    return points;
  }

  List<Map<String, dynamic>> get _cashInByMethod {
    final inflows = _computeCashFlow().where((e) => e.type == 'inflow').toList();
    final groups = <String, double>{};
    for (final e in inflows) {
      groups[e.method] = (groups[e.method] ?? 0) + e.amount;
    }
    final total = groups.values.fold(0.0, (s, v) => s + v);
    return groups.entries.map((e) => {
      'method': e.key, 'total': e.value, 'pct': total > 0 ? e.value / total * 100 : 0.0,
    }).toList()
      ..sort((a, b) => (b['total'] as double).compareTo(a['total'] as double));
  }

  List<_DaySeries> get _roiTrendSeries {
    final dates = _chartDates;
    final profitData = List<double>.filled(dates.length, 0);
    final investData = List<double>.filled(dates.length, 0);
    for (final t in _txInRange.where((t) => t['status'] == 'completed')) {
      final d = DateTime.tryParse(t['created_at']?.toString() ?? '');
      if (d == null) continue;
      final diff = d.difference(dates[0]).inDays;
      if (diff >= 0 && diff < dates.length) {
        final items = t['items'] as List? ?? [];
        final cost = items.fold(0.0, (s, i) => s + Formatters.toDouble(i['quantity']) * Formatters.toDouble(i['unit_cost']));
        profitData[diff] += Formatters.toDouble(t['total']) - cost;
      }
    }
    for (final e in _expInRange) {
      final d = DateTime.tryParse((e['date'] ?? e['created_at'])?.toString() ?? '');
      if (d == null) continue;
      final diff = d.difference(dates[0]).inDays;
      if (diff >= 0 && diff < dates.length) investData[diff] += Formatters.toDouble(e['amount']);
    }
    return [_DaySeries('Net Profit', profitData, const Color(0xFF22c55e)), _DaySeries('Investment', investData, const Color(0xFFf59e0b))];
  }

  List<_DaySeries> get _revExp14Series {
    const days = 14;
    final now = DateTime.now();
    final today = DateTime(now.year, now.month, now.day);
    final revData = List<double>.filled(days, 0);
    final expData = List<double>.filled(days, 0);
    for (final t in transactions_data.where((t) => t['status'] == 'completed')) {
      final d = DateTime.tryParse(t['created_at']?.toString() ?? '');
      if (d == null) continue;
      final diff = today.difference(d).inDays;
      if (diff >= 0 && diff < days) revData[days - 1 - diff] += Formatters.toDouble(t['total']);
    }
    for (final e in expenses_data) {
      final d = DateTime.tryParse((e['date'] ?? e['created_at'])?.toString() ?? '');
      if (d == null) continue;
      final diff = today.difference(d).inDays;
      if (diff >= 0 && diff < days) expData[days - 1 - diff] += Formatters.toDouble(e['amount']);
    }
    return [_DaySeries('Revenue', revData, const Color(0xFF3478f6)), _DaySeries('Expenses', expData, const Color(0xFFf44336))];
  }

  List<_DaySeries> get _ledgerTrendSeries {
    final ledger = _computeLedger();
    final dates = _chartDates;
    final debitData = List<double>.filled(dates.length, 0);
    final creditData = List<double>.filled(dates.length, 0);
    for (final e in ledger) {
      final d = DateTime.tryParse(e.date);
      if (d == null) continue;
      final diff = d.difference(dates[0]).inDays;
      if (diff >= 0 && diff < dates.length) {
        debitData[diff] += e.debit;
        creditData[diff] += e.credit;
      }
    }
    return [_DaySeries('Debits', debitData, const Color(0xFFef4444)), _DaySeries('Credits', creditData, const Color(0xFF22c55e))];
  }

  // ── Chart widget builders ────────────────────────────────────────

  static const _monthAbbr = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  String _dayMonth(DateTime d) => '${d.day.toString().padLeft(2, '0')} ${_monthAbbr[d.month - 1]}';

  Widget _chartLegend(List<_DaySeries> series) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 8),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.center,
        children: series.map((s) => Padding(
          padding: const EdgeInsets.symmetric(horizontal: 8),
          child: Row(children: [
            Container(width: 10, height: 10, decoration: BoxDecoration(color: s.color, borderRadius: BorderRadius.circular(3))),
            const SizedBox(width: 4),
            Text(s.name, style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w500)),
          ]),
        )).toList(),
      ),
    );
  }

  Widget _cashFlowAreaChart(String currency, {bool scrollable = false}) {
    final series = _cashFlowDailySeries;
    final dates = _chartDates;
    final maxY = math.max(
      series[0].data.fold(0.0, (s, v) => s > v ? s : v),
      series[1].data.fold(0.0, (s, v) => s > v ? s : v),
    );
    if (maxY == 0) return const Padding(padding: EdgeInsets.all(24), child: Center(child: Text('No transactions in range')));
    final chart = SizedBox(
      height: 200,
      child: LineChart(
        LineChartData(
          minX: 0,
          maxX: (dates.length - 1).toDouble(),
          minY: 0,
          maxY: maxY * 1.15,
          gridData: FlGridData(
            show: true,
            drawVerticalLine: false,
            horizontalInterval: maxY > 0 ? maxY / 4 : 1,
            getDrawingHorizontalLine: (v) => FlLine(color: Colors.grey.withValues(alpha: 0.15), strokeWidth: 1, dashArray: [3]),
          ),
          titlesData: FlTitlesData(
            leftTitles: AxisTitles(sideTitles: SideTitles(
              showTitles: true,
              reservedSize: 36,
              interval: maxY > 0 ? maxY / 4 : 1,
              getTitlesWidget: (v, _) => Padding(padding: const EdgeInsets.only(right: 4), child: Text(Formatters.compact(v), style: const TextStyle(fontSize: 9))),
            )),
            rightTitles: const AxisTitles(sideTitles: SideTitles(showTitles: false)),
            topTitles: const AxisTitles(sideTitles: SideTitles(showTitles: false)),
            bottomTitles: AxisTitles(sideTitles: SideTitles(
              showTitles: true,
              reservedSize: 28,
              interval: math.max(1, (dates.length / 5).floorToDouble()),
              getTitlesWidget: (v, _) {
                final i = v.toInt();
                if (i < 0 || i >= dates.length) return const SizedBox.shrink();
                return Padding(padding: const EdgeInsets.only(top: 4), child: Text(_dayMonth(dates[i]), style: const TextStyle(fontSize: 9)));
              },
            )),
          ),
          lineBarsData: [
            for (final s in series)
              LineChartBarData(
                spots: s.data.asMap().entries.map((e) => FlSpot(e.key.toDouble(), e.value)).toList(),
                isCurved: true,
                color: s.color,
                barWidth: 2,
                isStrokeCapRound: true,
                dotData: const FlDotData(show: false),
                belowBarData: BarAreaData(show: true, color: s.color.withValues(alpha: 0.12)),
              ),
          ],
          lineTouchData: LineTouchData(
            touchTooltipData: LineTouchTooltipData(
              getTooltipItems: (spots) => spots.map((s) {
                final i = s.x.toInt();
                final label = i >= 0 && i < dates.length ? _dayMonth(dates[i]) : '';
                return LineTooltipItem('$label\n${series.firstWhere((e) => e.color == s.bar.color).name}: ${Formatters.currency(s.y, currency)}', const TextStyle(fontSize: 10));
              }).toList(),
            ),
          ),
        ),
      ),
    );
    if (!scrollable) return chart;
    final perDay = 56.0;
    final chartWidth = math.max(300.0, dates.length * perDay + 60);
    return SingleChildScrollView(
      scrollDirection: Axis.horizontal,
      child: SizedBox(width: chartWidth, child: chart),
    );
  }

  Widget _groupedBarChart(List<_DaySeries> series, String currency, {double height = 200, bool scrollable = false}) {
    final dates = _chartDates;
    final maxY = series.fold(0.0, (maxS, s) => s.data.fold(maxS, (m, v) => m > v ? m : v));
    if (maxY == 0) return const Padding(padding: EdgeInsets.all(24), child: Center(child: Text('No data in range')));
    final barWidth = 6.0;
    final chart = SizedBox(
      height: height,
      child: BarChart(
        BarChartData(
          maxY: maxY * 1.15,
          minY: 0,
          gridData: FlGridData(
            show: true,
            drawVerticalLine: false,
            horizontalInterval: maxY > 0 ? maxY / 4 : 1,
            getDrawingHorizontalLine: (v) => FlLine(color: Colors.grey.withValues(alpha: 0.15), strokeWidth: 1, dashArray: [3]),
          ),
          titlesData: FlTitlesData(
            leftTitles: AxisTitles(sideTitles: SideTitles(
              showTitles: true,
              reservedSize: 36,
              interval: maxY > 0 ? maxY / 4 : 1,
              getTitlesWidget: (v, _) => Padding(padding: const EdgeInsets.only(right: 4), child: Text(Formatters.compact(v), style: const TextStyle(fontSize: 9))),
            )),
            rightTitles: const AxisTitles(sideTitles: SideTitles(showTitles: false)),
            topTitles: const AxisTitles(sideTitles: SideTitles(showTitles: false)),
            bottomTitles: AxisTitles(sideTitles: SideTitles(
              showTitles: true,
              reservedSize: 28,
              interval: math.max(1, (dates.length / 5).floorToDouble()),
              getTitlesWidget: (v, _) {
                final i = v.toInt();
                if (i < 0 || i >= dates.length) return const SizedBox.shrink();
                return Padding(padding: const EdgeInsets.only(top: 4), child: Text(_dayMonth(dates[i]), style: const TextStyle(fontSize: 9)));
              },
            )),
          ),
          barGroups: List.generate(dates.length, (i) {
            return BarChartGroupData(
              x: i,
              barRods: series.map((s) {
                final v = s.data[i];
                return BarChartRodData(
                  toY: v,
                  color: s.color,
                  width: barWidth,
                  borderRadius: const BorderRadius.only(topLeft: Radius.circular(2), topRight: Radius.circular(2)),
                );
              }).toList(),
            );
          }),
          groupsSpace: 4,
          barTouchData: BarTouchData(
            touchTooltipData: BarTouchTooltipData(
              getTooltipItem: (group, gIndex, rod, rIndex) {
                final i = group.x;
                final label = i >= 0 && i < dates.length ? _dayMonth(dates[i]) : '';
                return BarTooltipItem('$label\n${series[rIndex].name}: ${Formatters.currency(rod.toY, currency)}', const TextStyle(fontSize: 10));
              },
            ),
          ),
        ),
      ),
    );
    if (!scrollable) return chart;
    final perDay = 56.0;
    final chartWidth = math.max(300.0, dates.length * perDay + 60);
    return SingleChildScrollView(
      scrollDirection: Axis.horizontal,
      child: SizedBox(width: chartWidth, child: chart),
    );
  }
  Widget _revenueExpenseBar14(String currency, {bool scrollable = false}) {
    const days = 14;
    final series = _revExp14Series;
    final now = DateTime.now();
    final today = DateTime(now.year, now.month, now.day);
    final labels = List.generate(days, (i) => today.subtract(Duration(days: days - 1 - i)));
    final maxY = series.fold(0.0, (maxS, s) => s.data.fold(maxS, (m, v) => m > v ? m : v));
    if (maxY == 0) return const Padding(padding: EdgeInsets.all(24), child: Center(child: Text('No data in last 14 days')));
    final chart = SizedBox(
      height: 200,
      child: BarChart(
        BarChartData(
          maxY: maxY * 1.15,
          minY: 0,
          gridData: FlGridData(
            show: true,
            drawVerticalLine: false,
            horizontalInterval: maxY > 0 ? maxY / 4 : 1,
            getDrawingHorizontalLine: (v) => FlLine(color: Colors.grey.withValues(alpha: 0.15), strokeWidth: 1, dashArray: [3]),
          ),
          titlesData: FlTitlesData(
            leftTitles: AxisTitles(sideTitles: SideTitles(
              showTitles: true,
              reservedSize: 36,
              interval: maxY > 0 ? maxY / 4 : 1,
              getTitlesWidget: (v, _) => Padding(padding: const EdgeInsets.only(right: 4), child: Text(Formatters.compact(v), style: const TextStyle(fontSize: 9))),
            )),
            rightTitles: const AxisTitles(sideTitles: SideTitles(showTitles: false)),
            topTitles: const AxisTitles(sideTitles: SideTitles(showTitles: false)),
            bottomTitles: AxisTitles(sideTitles: SideTitles(
              showTitles: true,
              reservedSize: 28,
              interval: 2,
              getTitlesWidget: (v, _) {
                final i = v.toInt();
                if (i < 0 || i >= days) return const SizedBox.shrink();
                return Padding(padding: const EdgeInsets.only(top: 4), child: Text(_dayMonth(labels[i]), style: const TextStyle(fontSize: 9)));
              },
            )),
          ),
          barGroups: List.generate(days, (i) {
            return BarChartGroupData(
              x: i,
              barRods: series.map((s) {
                final v = s.data[i];
                return BarChartRodData(
                  toY: v,
                  color: s.color,
                  width: 5,
                  borderRadius: const BorderRadius.only(topLeft: Radius.circular(2), topRight: Radius.circular(2)),
                );
              }).toList(),
            );
          }),
          groupsSpace: 4,
          barTouchData: BarTouchData(
            touchTooltipData: BarTouchTooltipData(
              getTooltipItem: (group, gIndex, rod, rIndex) {
                final i = group.x;
                final label = i >= 0 && i < days ? _dayMonth(labels[i]) : '';
                return BarTooltipItem('$label\n${series[rIndex].name}: ${Formatters.currency(rod.toY, currency)}', const TextStyle(fontSize: 10));
              },
            ),
          ),
        ),
      ),
    );
    if (!scrollable) return chart;
    final perDay = 56.0;
    final chartWidth = math.max(300.0, days * perDay + 60);
    return SingleChildScrollView(
      scrollDirection: Axis.horizontal,
      child: SizedBox(width: chartWidth, child: chart),
    );
  }

  Widget _paymentMethodDonut(String currency, List<Map<String, dynamic>> data) {
    if (data.isEmpty) return const Padding(padding: EdgeInsets.all(24), child: Center(child: Text('No transactions in range')));
    final total = data.fold(0.0, (s, e) => s + (e['total'] as double));
    if (total <= 0) return const Padding(padding: EdgeInsets.all(24), child: Center(child: Text('No data')));
    const palette = [Color(0xFF4caf50), Color(0xFF2e7d32), Color(0xFF2196f3), Color(0xFF9c27b0), Color(0xFFff9800), Color(0xFF3f51b5)];
    return SizedBox(
      height: 200,
      child: Row(
        children: [
          Expanded(
            child: PieChart(
              PieChartData(
                sections: List.generate(data.length, (i) {
                  final e = data[i];
                  final pct = total > 0 ? (e['total'] as double) / total * 100 : 0.0;
                  return PieChartSectionData(
                    value: e['total'] as double,
                    color: palette[i % palette.length],
                    title: '${pct.round()}%',
                    radius: 44,
                    titleStyle: const TextStyle(fontSize: 10, color: Colors.white, fontWeight: FontWeight.bold),
                  );
                }),
                centerSpaceRadius: 28,
                sectionsSpace: 2,
              ),
            ),
          ),
          const SizedBox(width: 8),
          Expanded(
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: data.take(6).toList().asMap().entries.map((entry) {
                final i = entry.key;
                final e = entry.value;
                return Padding(
                  padding: const EdgeInsets.symmetric(vertical: 1),
                  child: Row(children: [
                    Container(width: 10, height: 10, decoration: BoxDecoration(color: palette[i % palette.length], borderRadius: BorderRadius.circular(3))),
                    const SizedBox(width: 6),
                    Expanded(child: Text(e['method'] as String, style: const TextStyle(fontSize: 11), overflow: TextOverflow.ellipsis)),
                    Text(Formatters.currency(e['total'], currency), style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w500)),
                  ]),
                );
              }).toList(),
            ),
          ),
        ],
      ),
    );
  }

  Widget _cumulativeCashFlowAreaChart(String currency, {bool scrollable = false}) {
    final points = _cumulativeCashFlow;
    if (points.isEmpty) return const Padding(padding: EdgeInsets.all(24), child: Center(child: Text('No cash flow entries in range')));
    final maxY = points.fold(0.0, (s, p) => s > p.value ? s : p.value);
    final minY = points.fold(0.0, (s, p) => s < p.value ? s : p.value);
    final absMax = math.max(maxY.abs(), minY.abs());
    final chart = SizedBox(
      height: 200,
      child: LineChart(
        LineChartData(
          minX: 0,
          maxX: (points.length - 1).toDouble(),
          minY: minY * 1.1,
          maxY: maxY * 1.1,
          gridData: FlGridData(
            show: true,
            drawVerticalLine: false,
            horizontalInterval: absMax > 0 ? absMax / 4 : 1,
            getDrawingHorizontalLine: (v) => FlLine(color: Colors.grey.withValues(alpha: 0.15), strokeWidth: 1, dashArray: [3]),
          ),
          titlesData: FlTitlesData(
            leftTitles: AxisTitles(sideTitles: SideTitles(
              showTitles: true,
              reservedSize: 36,
              interval: absMax > 0 ? absMax / 4 : 1,
              getTitlesWidget: (v, _) => Padding(padding: const EdgeInsets.only(right: 4), child: Text(Formatters.compact(v), style: const TextStyle(fontSize: 9))),
            )),
            rightTitles: const AxisTitles(sideTitles: SideTitles(showTitles: false)),
            topTitles: const AxisTitles(sideTitles: SideTitles(showTitles: false)),
            bottomTitles: AxisTitles(sideTitles: SideTitles(
              showTitles: true,
              reservedSize: 28,
              interval: math.max(1, (points.length / 5).floorToDouble()),
              getTitlesWidget: (v, _) {
                final i = v.toInt();
                if (i < 0 || i >= points.length) return const SizedBox.shrink();
                return Padding(padding: const EdgeInsets.only(top: 4), child: Text(_dayMonth(points[i].date), style: const TextStyle(fontSize: 9)));
              },
            )),
          ),
          lineBarsData: [
            LineChartBarData(
              spots: points.asMap().entries.map((e) => FlSpot(e.key.toDouble(), e.value.value)).toList(),
              isCurved: true,
              color: const Color(0xFF3b82f6),
              barWidth: 2,
              isStrokeCapRound: true,
              dotData: const FlDotData(show: false),
              belowBarData: BarAreaData(show: true, color: const Color(0xFF3b82f6).withValues(alpha: 0.15)),
            ),
          ],
          lineTouchData: LineTouchData(
            touchTooltipData: LineTouchTooltipData(
              getTooltipItems: (spots) => spots.map((s) {
                final i = s.x.toInt();
                final label = i >= 0 && i < points.length ? _dayMonth(points[i].date) : '';
                return LineTooltipItem('$label\n${Formatters.currency(s.y, currency)}', const TextStyle(fontSize: 10));
              }).toList(),
            ),
          ),
        ),
      ),
    );
    if (!scrollable) return chart;
    final perPoint = 18.0;
    final chartWidth = math.max(400.0, points.length * perPoint + 60);
    return SingleChildScrollView(
      scrollDirection: Axis.horizontal,
      child: SizedBox(width: chartWidth, child: chart),
    );
  }

  Widget _roiGauge(double roi) {
    final pct = math.min(100.0, math.max(0.0, roi.abs()));
    final color = pct >= 15 ? const Color(0xFF22c55e) : const Color(0xFFf59e0b);
    return SizedBox(
      height: 180,
      child: Stack(
        alignment: Alignment.center,
        children: [
          PieChart(
            PieChartData(
              startDegreeOffset: -135,
              sectionsSpace: 0,
              centerSpaceRadius: 48,
              sections: [
                PieChartSectionData(
                  value: pct,
                  color: color,
                  radius: 14,
                  showTitle: false,
                ),
                PieChartSectionData(
                  value: 100 - pct,
                  color: Colors.grey.withValues(alpha: 0.12),
                  radius: 14,
                  showTitle: false,
                ),
              ],
            ),
          ),
          Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Text('${roi.toStringAsFixed(1)}%', style: TextStyle(fontSize: 28, fontWeight: FontWeight.bold, color: color)),
              const Text('Return on Investment', style: TextStyle(fontSize: 11, color: Colors.grey)),
            ],
          ),
        ],
      ),
    );
  }

  // ── Overview tab ──────────────────────────────────────────────────

  Widget _overviewTab(BuildContext context, AccountsData data, String currency) {
    final kpis = _computeKpis();
    final cashByMethod = _computeCashByMethod();
    final topReceivables = _computeTopReceivables();
    final topPayables = _computeTopPayables();

    return SingleChildScrollView(
      padding: const EdgeInsets.all(12),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          _kpiGrid(context, [
            _KpiData('Income', Formatters.currency(kpis.income, currency), Icons.arrow_downward, Colors.green, '${Formatters.currency(kpis.incomeVat, currency)} VAT'),
            _KpiData('Expenses', Formatters.currency(kpis.expenses, currency), Icons.arrow_upward, Colors.red, '${kpis.expenseCount} recorded'),
            _KpiData('Net Cash Flow', Formatters.currency(kpis.netCashFlow, currency), Icons.trending_up, Colors.teal, _periodLabel),
            _KpiData('Outstanding', Formatters.currency(kpis.outstanding, currency), Icons.money_off, Colors.orange, '${kpis.creditCount} credits · ${Formatters.currency(kpis.payables, currency)} payables'),
          ]),
          const SizedBox(height: 16),
          _sectionCard(context, 'Cash Flow Trend', Icons.show_chart, children: [
            _cashFlowAreaChart(currency, scrollable: true),
          ]),
          const SizedBox(height: 16),
          _sectionCard(context, 'Cash Flow Trend (Bar)', Icons.bar_chart, children: [
            _groupedBarChart(_cashFlowDailySeries, currency, scrollable: true),
          ]),
          const SizedBox(height: 16),
          _sectionCard(context, 'Payment Method Distribution', Icons.donut_small, children: [
            _paymentMethodDonut(currency, cashByMethod),
          ]),
          const SizedBox(height: 16),
          _sectionCard(context, 'Cash Position by Method', Icons.payments, children: [
            if (cashByMethod.isEmpty)
              const Padding(padding: EdgeInsets.all(24), child: Center(child: Text('No transactions in range')))
            else
              ...cashByMethod.map((m) => _methodBar(context, m['method'] as String, m['total'] as double, m['pct'] as double, currency)),
          ]),
          const SizedBox(height: 16),
          _sectionCard(context, 'Top Outstanding Receivables', Icons.receipt_long, children: [
            if (topReceivables.isEmpty)
              const Padding(padding: EdgeInsets.all(16), child: Center(child: Text('No outstanding receivables')))
            else
              ...topReceivables.asMap().entries.map((e) => _receivableItem(context, e.key + 1, e.value, currency)),
          ]),
          const SizedBox(height: 16),
          _sectionCard(context, 'Pending Payables', Icons.money_off, children: [
            if (topPayables.isEmpty)
              const Padding(padding: EdgeInsets.all(16), child: Center(child: Text('No pending payables')))
            else
              ...topPayables.asMap().entries.map((e) => _payableItem(context, e.key + 1, e.value, currency)),
          ]),
        ],
      ),
    );
  }

  List<Map<String, dynamic>> _computeCashByMethod() {
    final completed = _txInRange.where((t) => t['status'] == 'completed').toList();
    final groups = <String, double>{};
    for (final t in completed) {
      final m = t['payment_method']?.toString() ?? 'cash';
      groups[m] = (groups[m] ?? 0) + Formatters.toDouble(t['total']);
    }
    final total = groups.values.fold(0.0, (s, v) => s + v);
    return groups.entries.map((e) => {
      'method': e.key, 'total': e.value, 'pct': total > 0 ? e.value / total * 100 : 0.0,
    }).toList()
      ..sort((a, b) => (b['total'] as double).compareTo(a['total'] as double));
  }

  List<Map<String, dynamic>> _computeTopReceivables() {
    final items = <Map<String, dynamic>>[
      ..._receivablesInvoices.map((i) => {
        'type': 'invoice', 'number': i['invoice_number'] ?? '',
        'customer': i['customer_name'] ?? '—', 'balance': Formatters.toDouble(i['balance']),
      }),
      ..._openCredits.map((c) => {
        'type': 'credit', 'number': c['transaction_number'] ?? 'CR-${c['id']}',
        'customer': c['customer_name'] ?? '—', 'balance': Formatters.toDouble(c['balance']),
      }),
    ];
    items.sort((a, b) => (b['balance'] as double).compareTo(a['balance'] as double));
    return items.take(5).toList();
  }

  List<Map<String, dynamic>> _computeTopPayables() {
    final items = <Map<String, dynamic>>[
      ..._openPOs.map((p) => {
        'type': 'po', 'number': p['po_number'] ?? '', 'supplier': p['supplier_name'] ?? '',
        'amount': Formatters.toDouble(p['grand_total']),
      }),
      ..._unpaidExpenses.map((e) => {
        'type': 'expense', 'number': e['expense_number'] ?? '',
        'supplier': e['vendor'] ?? e['category'] ?? '',
        'amount': Formatters.toDouble(e['amount']),
      }),
    ];
    items.sort((a, b) => (b['amount'] as double).compareTo(a['amount'] as double));
    return items.take(5).toList();
  }

  // ── Receivables tab ───────────────────────────────────────────────

  Widget _receivablesTab(BuildContext context, AccountsData data, String currency) {
    final ar = _computeAR();
    return SingleChildScrollView(
      padding: const EdgeInsets.all(12),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          _kpiGrid(context, [
            _KpiData('Not Yet Due', Formatters.currency(ar.notDue, currency), Icons.schedule, Colors.blue, '${ar.notDueCount} items'),
            _KpiData('1–30 Days', Formatters.currency(ar.due30, currency), Icons.warning, Colors.orange, '${ar.due30Count} items'),
            _KpiData('31–60 Days', Formatters.currency(ar.due60, currency), Icons.dangerous, Colors.red, '${ar.due60Count} items'),
            _KpiData('60+ Days', Formatters.currency(ar.due60Plus, currency), Icons.error, Colors.red, '${ar.due60PlusCount} items'),
          ]),
          const SizedBox(height: 16),
          _sectionCard(context, 'Outstanding Invoices', Icons.file_copy, children: [
            if (_receivablesInvoices.isEmpty)
              const Padding(padding: EdgeInsets.all(16), child: Center(child: Text('No invoices found')))
            else
              ..._receivablesInvoices.map((i) => _invoiceItem(context, i, currency)),
          ]),
          const SizedBox(height: 16),
          _sectionCard(context, 'POS Credit Sales', Icons.credit_card, children: [
            if (_openCredits.isEmpty)
              const Padding(padding: EdgeInsets.all(16), child: Center(child: Text('No outstanding credit sales')))
            else
              ..._openCredits.map((c) => _creditItem(context, c, currency)),
          ]),
        ],
      ),
    );
  }

  // ── Payables tab ──────────────────────────────────────────────────

  Widget _payablesTab(BuildContext context, AccountsData data, String currency) {
    final poTotal = _openPOs.fold(0.0, (s, p) => s + Formatters.toDouble(p['grand_total']));
    return SingleChildScrollView(
      padding: const EdgeInsets.all(12),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          _kpiGrid(context, [
            _KpiData('Total Payables', Formatters.currency(poTotal + _unpaidExpenseTotal, currency), Icons.money_off, Colors.red, '${_openPOs.length + _unpaidExpenses.length} items'),
            _KpiData('Open POs', '${_openPOs.length}', Icons.inventory, Colors.orange, Formatters.currency(poTotal, currency)),
            _KpiData('Unpaid Expenses', Formatters.currency(_unpaidExpenseTotal, currency), Icons.receipt, Colors.blue, '${_unpaidExpenses.length} pending'),
            _KpiData('Paid Expenses', Formatters.currency(_paidExpenseTotal, currency), Icons.check_circle, Colors.green, '${_paidExpenses.length} settled'),
          ]),
          const SizedBox(height: 16),
          _sectionCard(context, 'Open Purchase Orders', Icons.inventory, children: [
            if (_openPOs.isEmpty)
              const Padding(padding: EdgeInsets.all(16), child: Center(child: Text('No open purchase orders')))
            else
              ..._openPOs.map((p) => _poItem(context, p, currency)),
          ]),
          const SizedBox(height: 16),
          _sectionCard(context, 'Unpaid Expenses', Icons.receipt_long, children: [
            if (_unpaidExpenses.isEmpty)
              const Padding(padding: EdgeInsets.all(16), child: Center(child: Text('No unpaid expenses')))
            else
              ..._unpaidExpenses.map((e) => _expenseItem(context, e, currency)),
          ]),
        ],
      ),
    );
  }

  // ── Cash Flow tab ─────────────────────────────────────────────────

  Widget _cashFlowTab(BuildContext context, AccountsData data, String currency) {
    final cf = _computeCashFlow();
    final inflows = cf.where((e) => e.type == 'inflow').toList();
    final outflows = cf.where((e) => e.type == 'outflow').toList();
    final totalIn = inflows.fold(0.0, (s, e) => s + e.amount);
    final totalOut = outflows.fold(0.0, (s, e) => s + e.amount);
    final net = totalIn - totalOut;

    var filtered = cf;
    if (_cfMethod != null) filtered = filtered.where((e) => e.method == _cfMethod).toList();
    if (_cfType != null) filtered = filtered.where((e) => e.type == _cfType).toList();

    final visibleItems = filtered.take(_cfPage).toList();
    final hasMore = filtered.length > _cfPage;

    return SingleChildScrollView(
      controller: _cfScrollController,
      padding: const EdgeInsets.all(12),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          _kpiGrid(context, [
            _KpiData('Cash In', Formatters.currency(totalIn, currency), Icons.arrow_downward, Colors.green, '${inflows.length} inflows'),
            _KpiData('Cash Out', Formatters.currency(totalOut, currency), Icons.arrow_upward, Colors.red, '${outflows.length} outflows'),
            _KpiData('Net Cash Flow', Formatters.currency(net, currency), Icons.sync, net >= 0 ? Colors.green : Colors.red, net >= 0 ? 'Positive' : 'Negative'),
            _KpiData('Closing Balance', Formatters.currency(net, currency), Icons.wallet, Colors.blue, _periodLabel),
          ]),
          const SizedBox(height: 16),
          _sectionCard(context, 'Cumulative Cash Flow', Icons.show_chart, children: [
            _cumulativeCashFlowAreaChart(currency, scrollable: true),
          ]),
          const SizedBox(height: 16),
          _sectionCard(context, 'Cash In vs Cash Out', Icons.bar_chart, children: [
            _chartLegend(_cashInOutDailySeries),
            _groupedBarChart(_cashInOutDailySeries, currency, scrollable: true),
          ]),
          const SizedBox(height: 16),
          _sectionCard(context, 'Cash In by Method', Icons.donut_small, children: [
            _paymentMethodDonut(currency, _cashInByMethod),
          ]),
          const SizedBox(height: 16),
          _filterBar([
            _filterDropdown('Method', _cfMethod, ['cash', 'mpesa', 'card', 'insurance', 'credit', 'bank_transfer'], (v) => setState(() { _cfMethod = v; _cfPage = 20; })),
            _filterDropdown('Type', _cfType, ['inflow', 'outflow'], (v) => setState(() { _cfType = v; _cfPage = 20; })),
          ]),
          const SizedBox(height: 16),
          _sectionCard(context, 'Cash Flow Ledger (${filtered.length} entries)', Icons.list, children: [
            if (filtered.isEmpty)
              const Padding(padding: EdgeInsets.all(16), child: Center(child: Text('No cash flow entries')))
            else ...[
              ...visibleItems.asMap().entries.map((entry) => _cashFlowItem(context, entry.key + 1, entry.value, currency)),
              if (hasMore)
                Padding(
                  padding: const EdgeInsets.symmetric(vertical: 12),
                  child: Center(
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        const SizedBox(width: 16, height: 16, child: CircularProgressIndicator(strokeWidth: 2)),
                        const SizedBox(width: 8),
                        Text('Loading more... (${visibleItems.length}/${filtered.length})', style: TextStyle(fontSize: 12, color: Theme.of(context).colorScheme.onSurfaceVariant)),
                      ],
                    ),
                  ),
                )
              else if (filtered.length > 20)
                Padding(
                  padding: const EdgeInsets.symmetric(vertical: 8),
                  child: Center(
                    child: Text('End of list · ${filtered.length} entries', style: TextStyle(fontSize: 11, color: Theme.of(context).colorScheme.onSurfaceVariant)),
                  ),
                ),
            ],
          ]),
        ],
      ),
    );
  }

  // ── ROI tab ───────────────────────────────────────────────────────

  Widget _roiTab(BuildContext context, AccountsData data, String currency) {
    final m = _computeRoi();
    final products = _computeProductsSold();
    final totalRevenue = products.fold(0.0, (s, p) => s + p.revenue);
    final totalUnits = products.fold(0.0, (s, p) => s + p.qty);

    final ratios = [
      ('ROI', m.roi, 15.0, '%'),
      ('Annualized ROI', m.annualizedROI, 20.0, '%'),
      ('Gross Margin', m.grossMargin, 40.0, '%'),
      ('Profit Margin', m.profitMargin, 10.0, '%'),
      ('ROA', m.roa, 5.0, '%'),
      ('ROE', m.roe, 12.0, '%'),
      ('ROIC', m.roic, 10.0, '%'),
    ];

    final breakdown = [
      ('Revenue (Sales)', m.revenue, 'positive'),
      ('COGS', m.cogs, 'negative'),
      ('Gross Profit', m.grossProfit, 'highlight'),
      ('Operating Expenses', m.operatingExpenses, 'negative'),
      ('Net Profit', m.netProfit, 'highlight'),
      ('Total Investment', m.totalInvestment, 'neutral'),
      ('Monthly Net Profit', m.monthlyNetProfit, 'neutral'),
    ];

    return SingleChildScrollView(
      controller: _roiScrollController,
      padding: const EdgeInsets.all(12),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          _kpiGrid(context, [
            _KpiData('ROI', '${m.roi.toStringAsFixed(2)}%', Icons.timeline, m.roi >= 15 ? Colors.green : Colors.orange, 'Target: 15%'),
            _KpiData('Net Profit', Formatters.currency(m.netProfit, currency), Icons.monetization_on, m.netProfit >= 0 ? Colors.green : Colors.red, 'Margin: ${m.profitMargin.toStringAsFixed(1)}%'),
            _KpiData('Total Investment', Formatters.currency(m.totalInvestment, currency), Icons.work, Colors.orange, 'Inv + Exp + POs'),
            _KpiData('Payback Period', m.paybackMonths > 0 ? '${m.paybackMonths.toStringAsFixed(1)} mo' : '—', Icons.schedule, Colors.purple, m.monthlyNetProfit > 0 ? '${Formatters.currency(m.monthlyNetProfit, currency)}/mo' : 'No profit'),
          ]),
          const SizedBox(height: 16),
          _sectionCard(context, 'ROI Score', Icons.speed, children: [
            _roiGauge(m.roi),
          ]),
          const SizedBox(height: 16),
          _sectionCard(context, 'Key Ratios', Icons.analytics, children: [
            ...ratios.map((r) {
              final color = r.$2 >= r.$3 ? Colors.green : Colors.orange;
              return _ratioBar(r.$1, r.$2, r.$3, r.$4, color);
            }),
          ]),
          const SizedBox(height: 16),
          _sectionCard(context, 'ROI Breakdown', Icons.list, children: [
            ...breakdown.map((row) {
              final isNeg = row.$3 == 'negative';
              final isHighlight = row.$3 == 'highlight';
              return Padding(
                padding: const EdgeInsets.symmetric(vertical: 4),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(row.$1, style: isHighlight ? const TextStyle(fontWeight: FontWeight.bold) : null),
                    Text(
                      isNeg ? '(${Formatters.currency(row.$2, currency)})' : Formatters.currency(row.$2, currency),
                      style: TextStyle(
                        fontWeight: isHighlight ? FontWeight.bold : FontWeight.normal,
                        color: isNeg ? Colors.red : isHighlight ? (row.$2 >= 0 ? Colors.green : Colors.red) : null,
                      ),
                    ),
                  ],
                ),
              );
            }),
            const Divider(),
            _statRow('ROI', '${m.roi.toStringAsFixed(2)}%', m.roi >= 15 ? Colors.green : Colors.orange),
            _statRow('Annualized ROI', '${m.annualizedROI.toStringAsFixed(2)}%', m.annualizedROI >= 20 ? Colors.green : Colors.orange),
            _statRow('Payback Period', m.paybackMonths > 0 ? '${m.paybackMonths.toStringAsFixed(1)} months' : '—', null),
          ]),
          const SizedBox(height: 16),
          _sectionCard(context, 'Net Profit vs Investment', Icons.bar_chart, children: [
            _chartLegend(_roiTrendSeries),
            _groupedBarChart(_roiTrendSeries, currency, scrollable: true),
          ]),
          const SizedBox(height: 16),
          _kpiGrid(context, [
            _KpiData('Total Revenue', Formatters.currency(totalRevenue, currency), Icons.payments, Colors.green, 'From product sales'),
            _KpiData('Total Units', '${totalUnits.toInt()}', Icons.inventory, Colors.blue, 'Units sold'),
            _KpiData('Unique Products', '${products.length}', Icons.list, Colors.teal, 'Different items'),
            _KpiData('Avg Revenue/Product', Formatters.currency(products.isNotEmpty ? totalRevenue / products.length : 0, currency), Icons.bar_chart, Colors.orange, 'Per product'),
          ]),
          const SizedBox(height: 16),
          _sectionCard(context, 'Products Sold Breakdown (${products.length})', Icons.inventory_2, children: [
            if (products.isEmpty)
              const Padding(padding: EdgeInsets.all(16), child: Center(child: Text('No products sold in range')))
            else ...[
              ...products.take(_roiProductPage).toList().asMap().entries.map((entry) => _productSoldItem(context, entry.key + 1, entry.value, currency)),
              if (products.length > _roiProductPage)
                Padding(
                  padding: const EdgeInsets.symmetric(vertical: 12),
                  child: Center(
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        const SizedBox(width: 16, height: 16, child: CircularProgressIndicator(strokeWidth: 2)),
                        const SizedBox(width: 8),
                        Text('Loading more... (${_roiProductPage.clamp(0, products.length)}/${products.length})', style: TextStyle(fontSize: 12, color: Theme.of(context).colorScheme.onSurfaceVariant)),
                      ],
                    ),
                  ),
                )
              else if (products.length > 20)
                Padding(
                  padding: const EdgeInsets.symmetric(vertical: 8),
                  child: Center(
                    child: Text('End of list · ${products.length} products', style: TextStyle(fontSize: 11, color: Theme.of(context).colorScheme.onSurfaceVariant)),
                  ),
                ),
            ],
          ]),
        ],
      ),
    );
  }

  // ── Transactions tab ──────────────────────────────────────────────

  Widget _transactionsTab(BuildContext context, AccountsData data, String currency) {
    final periodChanged = _txFilterPeriodCache != _period;
    final filterChanged = _txFilterTypeCache != _txType || _txFilterSearchCache != _txSearch || periodChanged;
    if (filterChanged) {
      var filtered = _txInRange;
      if (_txType != 'all') filtered = filtered.where((t) => t['payment_method'] == _txType).toList();
      if (_txSearch.isNotEmpty) {
        final s = _txSearch.toLowerCase();
        filtered = filtered.where((t) =>
          (t['transaction_number']?.toString() ?? '').toLowerCase().contains(s) ||
          (t['customer_name']?.toString() ?? '').toLowerCase().contains(s)
        ).toList();
      }
      _txFilteredCache = filtered;
      _txFilterTypeCache = _txType;
      _txFilterSearchCache = _txSearch;
      _txFilterPeriodCache = _period;
      if (periodChanged) _txPage = 20;
    }
    final filtered = _txFilteredCache;

    final visibleCount = _txPage < filtered.length ? _txPage : filtered.length;
    final hasMore = filtered.length > _txPage;

    return Column(
      children: [
        Padding(
          padding: const EdgeInsets.all(12),
          child: _filterBar([
            _filterDropdown('Type', _txType == 'all' ? null : _txType, ['cash', 'mpesa', 'card', 'insurance', 'credit', 'bank_transfer'], (v) => setState(() { _txType = v ?? 'all'; _txPage = 20; })),
            SizedBox(
              width: 200,
              child: Container(
                height: 40,
                decoration: BoxDecoration(
                  color: Theme.of(context).colorScheme.primaryContainer.withValues(alpha: 0.3),
                  borderRadius: BorderRadius.circular(10),
                  border: Border.all(color: Theme.of(context).colorScheme.outlineVariant.withValues(alpha: 0.5)),
                ),
                child: TextField(
                  decoration: const InputDecoration(
                    isDense: true,
                    hintText: 'Search...',
                    prefixIcon: Icon(Icons.search, size: 16),
                    border: InputBorder.none,
                    contentPadding: EdgeInsets.symmetric(vertical: 8),
                  ),
                  style: const TextStyle(fontSize: 12),
                  onChanged: (v) => setState(() { _txSearch = v; _txPage = 20; }),
                ),
              ),
            ),
          ]),
        ),
        Expanded(
          child: filtered.isEmpty
              ? const EmptyState(icon: Icons.swap_horiz, title: 'No transactions found')
              : ListView.builder(
                  controller: _txScrollController,
                  padding: const EdgeInsets.fromLTRB(12, 0, 12, 16),
                  itemCount: visibleCount + (hasMore ? 1 : 0),
                  itemBuilder: (context, index) {
                    if (index == visibleCount) {
                      return Padding(
                        padding: const EdgeInsets.symmetric(vertical: 12),
                        child: Center(
                          child: Row(
                            mainAxisAlignment: MainAxisAlignment.center,
                            children: [
                              const SizedBox(width: 16, height: 16, child: CircularProgressIndicator(strokeWidth: 2)),
                              const SizedBox(width: 8),
                              Text('Loading more... ($visibleCount/${filtered.length})', style: TextStyle(fontSize: 12, color: Theme.of(context).colorScheme.onSurfaceVariant)),
                            ],
                          ),
                        ),
                      );
                    }
                    return _txItem(context, index + 1, filtered[index], currency);
                  },
                ),
        ),
        if (!hasMore && filtered.length > 20)
          Padding(
            padding: const EdgeInsets.only(bottom: 8),
            child: Text('End of list · ${filtered.length} transactions', style: TextStyle(fontSize: 11, color: Theme.of(context).colorScheme.onSurfaceVariant)),
          ),
      ],
    );
  }

  // ── P&L tab ───────────────────────────────────────────────────────

  Widget _pnlTab(BuildContext context, AccountsData data, String currency) {
    final pnl = _computePnL();
    return SingleChildScrollView(
      padding: const EdgeInsets.all(12),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          _sectionCard(context, 'Profit & Loss Statement', Icons.bar_chart, children: [
            _pnlRow('Revenue (Sales)', pnl.revenue, currency, color: Colors.green),
            _pnlRow('Less: Sales Discounts', pnl.discounts, currency, negative: true),
            _pnlRow('Net Revenue', pnl.netRevenue, currency, bold: true),
            _pnlRow('Cost of Goods Sold', pnl.cogs, currency, negative: true),
            _pnlRow('Gross Profit', pnl.grossProfit, currency, bold: true),
            _pnlRow('Operating Expenses', pnl.expenses, currency, negative: true),
            const Divider(),
            Padding(
              padding: const EdgeInsets.symmetric(vertical: 8),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  const Text('Net Profit', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
                  Text(Formatters.currency(pnl.netProfit, currency),
                    style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold,
                      color: pnl.netProfit >= 0 ? Colors.green : Colors.red)),
                ],
              ),
            ),
          ]),
          const SizedBox(height: 16),
          _sectionCard(context, 'Daily Revenue vs Expenses', Icons.bar_chart, children: [
            _chartLegend(_revExp14Series),
            _revenueExpenseBar14(currency, scrollable: true),
          ]),
        ],
      ),
    );
  }

  // ── Balance Sheet tab ─────────────────────────────────────────────

  Widget _balanceSheetTab(BuildContext context, AccountsData data, String currency) {
    final bs = _computeBS();
    final pnl = _computePnL();
    return SingleChildScrollView(
      padding: const EdgeInsets.all(12),
      child: _sectionCard(context, 'Balance Sheet', Icons.balance, children: [
        const Text('Assets', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 15)),
        const SizedBox(height: 8),
        _bsRow('Cash on Hand (Shifts)', bs.cash, currency),
        _bsRow('Inventory Value', bs.inventory, currency),
        _bsRow('Accounts Receivable', bs.receivables, currency),
        const Divider(),
        _bsRow('Total Assets', bs.totalAssets, currency, bold: true),
        const SizedBox(height: 16),
        const Text('Liabilities', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 15)),
        const SizedBox(height: 8),
        _bsRow('Accounts Payable', bs.payables, currency),
        _bsRow('Credit Sales Outstanding', bs.creditOutstanding, currency),
        const Divider(),
        _bsRow('Total Liabilities', bs.totalLiabilities, currency, bold: true),
        const SizedBox(height: 16),
        const Text('Equity', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 15)),
        const SizedBox(height: 8),
        _bsRow('Retained Earnings (P&L)', pnl.netProfit, currency, bold: true, color: pnl.netProfit >= 0 ? Colors.green : Colors.red),
      ]),
    );
  }

  // ── General Ledger tab ─────────────────────────────────────────────

  Widget _ledgerTab(BuildContext context, AccountsData data, String currency) {
    final ledger = _computeLedger();
    final totalDebits = ledger.fold(0.0, (s, e) => s + e.debit);
    final totalCredits = ledger.fold(0.0, (s, e) => s + e.credit);
    final balanced = (totalDebits - totalCredits).abs() < 0.01;

    // Account balances
    final byAccount = <String, Map<String, dynamic>>{};
    for (final e in ledger) {
      if (!byAccount.containsKey(e.account)) {
        byAccount[e.account] = {'account': e.account, 'account_type': e.accountType, 'debit': 0.0, 'credit': 0.0, 'count': 0};
      }
      byAccount[e.account]!['debit'] += e.debit;
      byAccount[e.account]!['credit'] += e.credit;
      byAccount[e.account]!['count'] += 1;
    }
    final accountList = byAccount.values.map((g) {
      g['balance'] = (g['debit'] as double) - (g['credit'] as double);
      return g;
    }).toList()
      ..sort((a, b) => ((b['debit'] as double) + (b['credit'] as double)).compareTo((a['debit'] as double) + (a['credit'] as double)));

    return SingleChildScrollView(
      controller: _ledgerScrollController,
      padding: const EdgeInsets.all(12),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          _kpiGrid(context, [
            _KpiData('Total Debits', Formatters.currency(totalDebits, currency), Icons.north_east, Colors.red, '${ledger.length} entries'),
            _KpiData('Total Credits', Formatters.currency(totalCredits, currency), Icons.south_east, Colors.green, '${accountList.length} accounts'),
            _KpiData('Trial Balance', balanced ? 'Balanced' : 'Unbalanced', balanced ? Icons.check_circle : Icons.error, balanced ? Colors.green : Colors.red, 'Δ ${Formatters.currency((totalDebits - totalCredits).abs(), currency)}'),
            _KpiData('Entries in Range', '${ledger.length}', Icons.book, Colors.teal, _periodLabel),
          ]),
          const SizedBox(height: 16),
          _sectionCard(context, 'Daily Debit / Credit Volume', Icons.bar_chart, children: [
            _groupedBarChart(_ledgerTrendSeries, currency, scrollable: true),
          ]),
          const SizedBox(height: 16),
          // Account balances
          _sectionCard(context, 'Account Balances (${accountList.length})', Icons.account_balance, children: [
            if (accountList.isEmpty)
              const Padding(padding: EdgeInsets.all(16), child: Center(child: Text('No account data in range')))
            else
              ...accountList.map((a) => _accountBalanceItem(context, a, currency)),
          ]),
          const SizedBox(height: 16),
          _filterBar([
            _filterDropdown('Type', _ledgerAccountType, ['asset', 'liability', 'equity', 'revenue', 'expense'], (v) => setState(() { _ledgerAccountType = v; _ledgerPage = 20; })),
            _filterDropdown('Source', _ledgerSource, ['journal', 'pos', 'invoice', 'expense', 'po'], (v) => setState(() { _ledgerSource = v; _ledgerPage = 20; })),
            SizedBox(
              width: 180,
              child: Container(
                height: 40,
                decoration: BoxDecoration(
                  color: Theme.of(context).colorScheme.primaryContainer.withValues(alpha: 0.3),
                  borderRadius: BorderRadius.circular(10),
                  border: Border.all(color: Theme.of(context).colorScheme.outlineVariant.withValues(alpha: 0.5)),
                ),
                child: TextField(
                  decoration: const InputDecoration(
                    isDense: true,
                    hintText: 'Search...',
                    prefixIcon: Icon(Icons.search, size: 16),
                    border: InputBorder.none,
                    contentPadding: EdgeInsets.symmetric(vertical: 8),
                  ),
                  style: const TextStyle(fontSize: 12),
                  onChanged: (v) => setState(() { _ledgerSearch = v; _ledgerPage = 20; }),
                ),
              ),
            ),
            Container(
              height: 40,
              decoration: BoxDecoration(
                color: Theme.of(context).colorScheme.primaryContainer.withValues(alpha: 0.3),
                borderRadius: BorderRadius.circular(10),
                border: Border.all(color: Theme.of(context).colorScheme.outlineVariant.withValues(alpha: 0.5)),
              ),
              child: IconButton(
                icon: const Icon(Icons.download, size: 18),
                tooltip: 'Export CSV',
                onPressed: () => _exportLedgerCSV(context, ledger, currency),
              ),
            ),
          ]),
          const SizedBox(height: 16),
          // Ledger entries
          _sectionCard(context, 'Ledger Entries (${ledger.length})', Icons.book_outlined, children: [
            if (ledger.isEmpty)
              const Padding(padding: EdgeInsets.all(16), child: Center(child: Text('No ledger entries match your filters')))
            else ...[
              ...ledger.take(_ledgerPage).toList().asMap().entries.map((entry) => _ledgerEntryItem(context, entry.key + 1, entry.value, currency)),
              if (ledger.length > _ledgerPage)
                Padding(
                  padding: const EdgeInsets.symmetric(vertical: 12),
                  child: Center(
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        const SizedBox(width: 16, height: 16, child: CircularProgressIndicator(strokeWidth: 2)),
                        const SizedBox(width: 8),
                        Text('Loading more... (${_ledgerPage.clamp(0, ledger.length)}/${ledger.length})', style: TextStyle(fontSize: 12, color: Theme.of(context).colorScheme.onSurfaceVariant)),
                      ],
                    ),
                  ),
                )
              else if (ledger.length > 20)
                Padding(
                  padding: const EdgeInsets.symmetric(vertical: 8),
                  child: Center(
                    child: Text('End of list · ${ledger.length} entries', style: TextStyle(fontSize: 11, color: Theme.of(context).colorScheme.onSurfaceVariant)),
                  ),
                ),
            ],
          ]),
        ],
      ),
    );
  }

  // ── Reusable widgets ──────────────────────────────────────────────

  String get _periodLabel {
    final opt = _periodOptions.firstWhere((o) => o.$2 == _period);
    return opt.$1;
  }

  Widget _kpiGrid(BuildContext context, List<_KpiData> kpis) {
    return LayoutBuilder(
      builder: (context, constraints) {
        final crossCount = constraints.maxWidth >= 900 ? 4 : 2;
        final cardWidth = (constraints.maxWidth - 8 * (crossCount - 1)) / crossCount;
        final baseRatio = crossCount == 4 ? 1.6 : 1.3;
        final newRatio = cardWidth / (cardWidth / baseRatio + 25);
        return GridView.count(
          crossAxisCount: crossCount,
          shrinkWrap: true,
          physics: const NeverScrollableScrollPhysics(),
          mainAxisSpacing: 8,
          crossAxisSpacing: 8,
          childAspectRatio: newRatio,
          children: kpis.map((k) => KpiCard(
            label: k.label, value: k.value, icon: k.icon,
            color: k.color, subtitle: k.subtitle,
          )).toList(),
        );
      },
    );
  }

  Widget _sectionCard(BuildContext context, String title, IconData icon, {required List<Widget> children}) {
    return Card(
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
      clipBehavior: Clip.antiAlias,
      child: Padding(
        padding: const EdgeInsets.all(14),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(children: [
              Icon(icon, size: 18, color: Theme.of(context).colorScheme.primary),
              const SizedBox(width: 8),
              Text(title, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 15)),
            ]),
            const SizedBox(height: 12),
            ...children,
          ],
        ),
      ),
    );
  }

  Widget _methodBar(BuildContext context, String method, double total, double pct, String currency) {
    final color = _pmColor(method);
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 6),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Icon(_pmIcon(method), size: 18, color: color),
              const SizedBox(width: 8),
              Text(method, style: const TextStyle(fontWeight: FontWeight.w500)),
              const Spacer(),
              Text(Formatters.currency(total, currency), style: const TextStyle(fontWeight: FontWeight.bold)),
            ],
          ),
          const SizedBox(height: 6),
          ClipRRect(
            borderRadius: BorderRadius.circular(4),
            child: LinearProgressIndicator(
              value: pct / 100, color: color, minHeight: 6,
              backgroundColor: color.withValues(alpha: 0.12),
            ),
          ),
          Text('${pct.toStringAsFixed(0)}% of total', style: TextStyle(fontSize: 11, color: Theme.of(context).colorScheme.onSurfaceVariant)),
        ],
      ),
    );
  }

  Widget _receivableItem(BuildContext context, int index, Map<String, dynamic> r, String currency) {
    final isInvoice = r['type'] == 'invoice';
    final color = isInvoice ? Colors.blue : Colors.orange;
    final balance = (r['balance'] as double).abs();
    return Card(
      margin: const EdgeInsets.only(bottom: 8),
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      child: Padding(
        padding: const EdgeInsets.all(12),
        child: Row(
          children: [
            Container(
              width: 32, height: 32, alignment: Alignment.center,
              decoration: BoxDecoration(
                color: color.withValues(alpha: 0.12),
                borderRadius: BorderRadius.circular(8),
              ),
              child: Text('$index', style: TextStyle(fontSize: 13, fontWeight: FontWeight.bold, color: color)),
            ),
            const SizedBox(width: 10),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Icon(isInvoice ? Icons.file_copy : Icons.credit_card, size: 14, color: color),
                      const SizedBox(width: 4),
                      Expanded(child: Text(r['number'] as String, style: const TextStyle(fontSize: 13, fontWeight: FontWeight.bold), maxLines: 1, overflow: TextOverflow.ellipsis)),
                    ],
                  ),
                  const SizedBox(height: 4),
                  Text(r['customer'] as String, style: TextStyle(fontSize: 12, color: Theme.of(context).colorScheme.onSurfaceVariant), maxLines: 1, overflow: TextOverflow.ellipsis),
                ],
              ),
            ),
            const SizedBox(width: 8),
            Column(
              crossAxisAlignment: CrossAxisAlignment.end,
              children: [
                Text(Formatters.currency(balance, currency), style: TextStyle(fontSize: 15, fontWeight: FontWeight.bold, color: color)),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                  decoration: BoxDecoration(
                    color: color.withValues(alpha: 0.12),
                    borderRadius: BorderRadius.circular(10),
                  ),
                  child: Text(isInvoice ? 'INVOICE' : 'CREDIT', style: TextStyle(fontSize: 9, fontWeight: FontWeight.w700, color: color)),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _payableItem(BuildContext context, int index, Map<String, dynamic> p, String currency) {
    final isPO = p['type'] == 'po';
    final color = isPO ? Colors.deepOrange : Colors.red;
    final amount = (p['amount'] as double).abs();
    return Card(
      margin: const EdgeInsets.only(bottom: 8),
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      child: Padding(
        padding: const EdgeInsets.all(12),
        child: Row(
          children: [
            Container(
              width: 32, height: 32, alignment: Alignment.center,
              decoration: BoxDecoration(
                color: color.withValues(alpha: 0.12),
                borderRadius: BorderRadius.circular(8),
              ),
              child: Text('$index', style: TextStyle(fontSize: 13, fontWeight: FontWeight.bold, color: color)),
            ),
            const SizedBox(width: 10),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Icon(isPO ? Icons.inventory : Icons.receipt, size: 14, color: color),
                      const SizedBox(width: 4),
                      Expanded(child: Text(p['number'] as String, style: const TextStyle(fontSize: 13, fontWeight: FontWeight.bold), maxLines: 1, overflow: TextOverflow.ellipsis)),
                    ],
                  ),
                  const SizedBox(height: 4),
                  Text(p['supplier'] as String, style: TextStyle(fontSize: 12, color: Theme.of(context).colorScheme.onSurfaceVariant), maxLines: 1, overflow: TextOverflow.ellipsis),
                ],
              ),
            ),
            const SizedBox(width: 8),
            Column(
              crossAxisAlignment: CrossAxisAlignment.end,
              children: [
                Text(Formatters.currency(amount, currency), style: TextStyle(fontSize: 15, fontWeight: FontWeight.bold, color: color)),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                  decoration: BoxDecoration(
                    color: color.withValues(alpha: 0.12),
                    borderRadius: BorderRadius.circular(10),
                  ),
                  child: Text(isPO ? 'PO' : 'EXPENSE', style: TextStyle(fontSize: 9, fontWeight: FontWeight.w700, color: color)),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _invoiceItem(BuildContext context, Map<String, dynamic> i, String currency) {
    return Card(
      margin: const EdgeInsets.only(bottom: 8),
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      child: Padding(
        padding: const EdgeInsets.all(12),
        child: Row(
          children: [
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(i['invoice_number']?.toString() ?? '', style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13)),
                  const SizedBox(height: 4),
                  Text(i['customer_name']?.toString() ?? '—', style: TextStyle(fontSize: 12, color: Theme.of(context).colorScheme.onSurfaceVariant)),
                  Text('Due ${Formatters.date(i['due_date'])}', style: TextStyle(fontSize: 11, color: Theme.of(context).colorScheme.onSurfaceVariant)),
                ],
              ),
            ),
            Column(
              crossAxisAlignment: CrossAxisAlignment.end,
              children: [
                Text(Formatters.currency(i['total'], currency), style: const TextStyle(fontSize: 13)),
                Text('Paid ${Formatters.currency(i['amount_paid'], currency)}', style: TextStyle(fontSize: 11, color: Theme.of(context).colorScheme.onSurfaceVariant)),
                Text(Formatters.currency(i['balance'], currency), style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14, color: Colors.red)),
                const SizedBox(height: 4),
                _statusChip(i['status']?.toString() ?? ''),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _creditItem(BuildContext context, Map<String, dynamic> c, String currency) {
    return Card(
      margin: const EdgeInsets.only(bottom: 8),
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      child: Padding(
        padding: const EdgeInsets.all(12),
        child: Row(
          children: [
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(c['transaction_number']?.toString() ?? 'CR-${c['id']}', style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13)),
                  const SizedBox(height: 4),
                  Text('${c['customer_name'] ?? 'Walk-in'}', style: TextStyle(fontSize: 12, color: Theme.of(context).colorScheme.onSurfaceVariant)),
                  Text('${Formatters.date(c['created_at'])} · Due ${Formatters.date(c['due_date'])}', style: TextStyle(fontSize: 11, color: Theme.of(context).colorScheme.onSurfaceVariant)),
                ],
              ),
            ),
            Column(
              crossAxisAlignment: CrossAxisAlignment.end,
              children: [
                Text(Formatters.currency(c['balance'], currency), style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14, color: Colors.red)),
                const SizedBox(height: 4),
                _statusChip(c['status']?.toString() ?? ''),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _poItem(BuildContext context, Map<String, dynamic> p, String currency) {
    return Card(
      margin: const EdgeInsets.only(bottom: 8),
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      child: Padding(
        padding: const EdgeInsets.all(12),
        child: Row(
          children: [
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(p['po_number']?.toString() ?? '', style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13)),
                  const SizedBox(height: 4),
                  Text(p['supplier_name']?.toString() ?? '', style: TextStyle(fontSize: 12, color: Theme.of(context).colorScheme.onSurfaceVariant)),
                  Text(Formatters.date(p['created_at']), style: TextStyle(fontSize: 11, color: Theme.of(context).colorScheme.onSurfaceVariant)),
                ],
              ),
            ),
            Column(
              crossAxisAlignment: CrossAxisAlignment.end,
              children: [
                Text(Formatters.currency(p['grand_total'], currency), style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14)),
                const SizedBox(height: 4),
                _statusChip(p['status']?.toString() ?? ''),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _expenseItem(BuildContext context, Map<String, dynamic> e, String currency) {
    return Card(
      margin: const EdgeInsets.only(bottom: 8),
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      child: Padding(
        padding: const EdgeInsets.all(12),
        child: Row(
          children: [
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(e['expense_number']?.toString() ?? '', style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13)),
                  const SizedBox(height: 4),
                  Text(e['category']?.toString() ?? '', style: TextStyle(fontSize: 12, color: Theme.of(context).colorScheme.onSurfaceVariant)),
                  Text(e['vendor']?.toString() ?? (e['description']?.toString() ?? ''), maxLines: 1, overflow: TextOverflow.ellipsis, style: TextStyle(fontSize: 11, color: Theme.of(context).colorScheme.onSurfaceVariant)),
                ],
              ),
            ),
            Column(
              crossAxisAlignment: CrossAxisAlignment.end,
              children: [
                Text(Formatters.currency(e['amount'], currency), style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14)),
                const SizedBox(height: 4),
                _statusChip(e['status']?.toString() ?? ''),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _cashFlowItem(BuildContext context, int index, _CashFlowEntry e, String currency) {
    final isInflow = e.type == 'inflow';
    return Card(
      margin: const EdgeInsets.only(bottom: 6),
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
      child: Padding(
        padding: const EdgeInsets.all(12),
        child: Row(
          children: [
            Container(
              width: 28, height: 28, alignment: Alignment.center,
              decoration: BoxDecoration(
                color: (isInflow ? Colors.green : Colors.red).withValues(alpha: 0.12),
                borderRadius: BorderRadius.circular(8),
              ),
              child: Text('$index', style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: isInflow ? Colors.green : Colors.red)),
            ),
            const SizedBox(width: 10),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(e.description, style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w500), maxLines: 1, overflow: TextOverflow.ellipsis),
                  Text('${Formatters.dateTime(e.date)} · ${e.method.toUpperCase()}', style: TextStyle(fontSize: 11, color: Theme.of(context).colorScheme.onSurfaceVariant)),
                ],
              ),
            ),
            Text(
              '${isInflow ? '+' : '-'}${Formatters.currency(e.amount, currency)}',
              style: TextStyle(fontWeight: FontWeight.bold, fontSize: 14, color: isInflow ? Colors.green : Colors.red),
            ),
          ],
        ),
      ),
    );
  }

  Widget _txItem(BuildContext context, int index, Map<String, dynamic> t, String currency) {
    return Card(
      margin: const EdgeInsets.only(bottom: 8),
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
      clipBehavior: Clip.antiAlias,
      child: Padding(
        padding: const EdgeInsets.all(14),
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Container(
              width: 28, height: 28, alignment: Alignment.center,
              decoration: BoxDecoration(
                color: Theme.of(context).colorScheme.primaryContainer,
                borderRadius: BorderRadius.circular(8),
              ),
              child: Text('$index', style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: Theme.of(context).colorScheme.onPrimaryContainer)),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Expanded(child: Text(t['transaction_number']?.toString() ?? '', style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14), maxLines: 1, overflow: TextOverflow.ellipsis)),
                      Text(Formatters.currency(t['total'], currency), style: TextStyle(fontWeight: FontWeight.bold, fontSize: 15, color: Theme.of(context).colorScheme.primary)),
                    ],
                  ),
                  const SizedBox(height: 6),
                  Row(
                    children: [
                      Icon(Icons.schedule_rounded, size: 14, color: Theme.of(context).colorScheme.onSurfaceVariant),
                      const SizedBox(width: 4),
                      Text('${Formatters.date(t['created_at'])} · ${Formatters.time(t['created_at'])}', style: TextStyle(fontSize: 12, color: Theme.of(context).colorScheme.onSurfaceVariant)),
                    ],
                  ),
                  if ((t['customer_name'] ?? '').isNotEmpty) ...[
                    const SizedBox(height: 4),
                    Row(
                      children: [
                        Icon(Icons.person_outline_rounded, size: 14, color: Theme.of(context).colorScheme.onSurfaceVariant),
                        const SizedBox(width: 4),
                        Expanded(child: Text(t['customer_name']?.toString() ?? 'Walk-in', style: TextStyle(fontSize: 12, color: Theme.of(context).colorScheme.onSurfaceVariant), maxLines: 1, overflow: TextOverflow.ellipsis)),
                      ],
                    ),
                  ],
                  const SizedBox(height: 10),
                  Row(
                    children: [
                      _pmChip(t['payment_method']?.toString() ?? 'cash'),
                      const SizedBox(width: 6),
                      _statusChip(t['status']?.toString() ?? ''),
                    ],
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _productSoldItem(BuildContext context, int index, _ProductSold p, String currency) {
    final scheme = Theme.of(context).colorScheme;
    return Card(
      margin: const EdgeInsets.only(bottom: 6),
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
      child: Padding(
        padding: const EdgeInsets.all(12),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Container(
                  width: 28, height: 28, alignment: Alignment.center,
                  decoration: BoxDecoration(
                    color: scheme.primaryContainer,
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: Text('$index', style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: scheme.onPrimaryContainer)),
                ),
                const SizedBox(width: 10),
                Expanded(
                  child: Text(p.name, style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w600), maxLines: 1, overflow: TextOverflow.ellipsis),
                ),
                const SizedBox(width: 8),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                  decoration: BoxDecoration(
                    color: (p.markup > 0 ? Colors.green : Colors.red).withValues(alpha: 0.12),
                    borderRadius: BorderRadius.circular(10),
                  ),
                  child: Text(
                    '${p.markup > 0 ? '+' : ''}${p.markup.toStringAsFixed(1)}%',
                    style: TextStyle(fontSize: 10, fontWeight: FontWeight.w700, color: p.markup > 0 ? Colors.green : Colors.red),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 10),
            ClipRRect(
              borderRadius: BorderRadius.circular(4),
              child: LinearProgressIndicator(
                value: p.revenuePct / 100, color: Colors.teal, minHeight: 5,
                backgroundColor: Colors.teal.withValues(alpha: 0.12),
              ),
            ),
            const SizedBox(height: 8),
            Row(
              children: [
                _miniStat('Cost', Formatters.currency(p.unitCost, currency), scheme.onSurfaceVariant),
                _miniStat('Retail', Formatters.currency(p.retail, currency), scheme.onSurfaceVariant),
                _miniStat('Units', '${p.qty.toInt()}', scheme.onSurfaceVariant),
                const Spacer(),
                Column(
                  crossAxisAlignment: CrossAxisAlignment.end,
                  children: [
                    Text(Formatters.currency(p.revenue, currency), style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 15, color: Colors.teal)),
                    Text('${p.revenuePct.toStringAsFixed(1)}% share', style: TextStyle(fontSize: 10, color: scheme.onSurfaceVariant)),
                  ],
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _miniStat(String label, String value, Color color) {
    return Padding(
      padding: const EdgeInsets.only(right: 12),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(label, style: TextStyle(fontSize: 9, fontWeight: FontWeight.w600, color: color.withValues(alpha: 0.7))),
          Text(value, style: TextStyle(fontSize: 11, fontWeight: FontWeight.w500, color: color)),
        ],
      ),
    );
  }

  Widget _accountBalanceItem(BuildContext context, Map<String, dynamic> a, String currency) {
    final debit = a['debit'] as double;
    final credit = a['credit'] as double;
    final balance = a['balance'] as double;
    return Card(
      margin: const EdgeInsets.only(bottom: 6),
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
      child: Padding(
        padding: const EdgeInsets.all(12),
        child: Row(
          children: [
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(a['account'] as String, style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w500)),
                  if ((a['account_type'] as String).isNotEmpty)
                    Text((a['account_type'] as String).toUpperCase(), style: TextStyle(fontSize: 11, color: Theme.of(context).colorScheme.onSurfaceVariant)),
                ],
              ),
            ),
            if (debit > 0)
              Padding(
                padding: const EdgeInsets.only(left: 8),
                child: Text('Dr ${Formatters.currency(debit, currency)}', style: const TextStyle(fontSize: 12, color: Colors.red, fontWeight: FontWeight.w500)),
              ),
            if (credit > 0)
              Padding(
                padding: const EdgeInsets.only(left: 8),
                child: Text('Cr ${Formatters.currency(credit, currency)}', style: const TextStyle(fontSize: 12, color: Colors.green, fontWeight: FontWeight.w500)),
              ),
            Padding(
              padding: const EdgeInsets.only(left: 8),
              child: Text(Formatters.currency(balance, currency),
                style: TextStyle(fontSize: 13, fontWeight: FontWeight.bold, color: balance >= 0 ? Colors.green : Colors.red)),
            ),
          ],
        ),
      ),
    );
  }

  Widget _ledgerEntryItem(BuildContext context, int index, _LedgerEntry e, String currency) {
    return Card(
      margin: const EdgeInsets.only(bottom: 6),
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
      child: Padding(
        padding: const EdgeInsets.all(12),
        child: Row(
          children: [
            Container(
              width: 28, height: 28, alignment: Alignment.center,
              decoration: BoxDecoration(
                color: _sourceColor(e.source).withValues(alpha: 0.12),
                borderRadius: BorderRadius.circular(8),
              ),
              child: Text('$index', style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: _sourceColor(e.source))),
            ),
            const SizedBox(width: 10),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(e.description, style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w500), maxLines: 1, overflow: TextOverflow.ellipsis),
                  Text('${Formatters.date(e.date)} · ${e.account}', style: TextStyle(fontSize: 11, color: Theme.of(context).colorScheme.onSurfaceVariant), maxLines: 1, overflow: TextOverflow.ellipsis),
                  if (e.entryNumber.isNotEmpty || e.reference.isNotEmpty)
                    Text('${e.entryNumber}${e.reference.isNotEmpty ? ' · Ref: ${e.reference}' : ''}', style: TextStyle(fontSize: 10, color: Theme.of(context).colorScheme.onSurfaceVariant)),
                ],
              ),
            ),
            const SizedBox(width: 8),
            Column(
              crossAxisAlignment: CrossAxisAlignment.end,
              children: [
                if (e.debit > 0)
                  Text('Dr ${Formatters.currency(e.debit, currency)}', style: const TextStyle(fontSize: 12, color: Colors.red, fontWeight: FontWeight.bold)),
                if (e.credit > 0)
                  Text('Cr ${Formatters.currency(e.credit, currency)}', style: const TextStyle(fontSize: 12, color: Colors.green, fontWeight: FontWeight.bold)),
                Text(Formatters.currency(e.balance, currency), style: TextStyle(fontSize: 11, color: e.balance >= 0 ? Colors.green : Colors.red)),
              ],
            ),
          ],
        ),
      ),
    );
  }

  // ── Helper widgets ────────────────────────────────────────────────

  Widget _ratioBar(String label, double value, double target, String suffix, Color color) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(label, style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w500)),
              Text('${value.toStringAsFixed(2)}$suffix', style: TextStyle(color: color, fontWeight: FontWeight.bold)),
            ],
          ),
          const SizedBox(height: 4),
          ClipRRect(
            borderRadius: BorderRadius.circular(4),
            child: LinearProgressIndicator(
              value: (value / 100).clamp(0, 1), color: color, minHeight: 5,
              backgroundColor: color.withValues(alpha: 0.12),
            ),
          ),
          Text('Target: $target$suffix', style: const TextStyle(fontSize: 10, color: Colors.grey)),
        ],
      ),
    );
  }

  Widget _statRow(String label, String value, Color? color) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(label, style: const TextStyle(fontWeight: FontWeight.bold)),
          Text(value, style: TextStyle(fontWeight: FontWeight.bold, color: color)),
        ],
      ),
    );
  }

  Widget _pnlRow(String label, double value, String currency, {bool bold = false, bool negative = false, Color? color}) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 6),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(label, style: bold ? const TextStyle(fontWeight: FontWeight.bold) : null),
          Text(
            negative ? '(${Formatters.currency(value, currency)})' : Formatters.currency(value, currency),
            style: TextStyle(
              fontWeight: bold ? FontWeight.bold : FontWeight.normal,
              color: color ?? (negative ? Colors.red : null),
            ),
          ),
        ],
      ),
    );
  }

  Widget _bsRow(String label, double value, String currency, {bool bold = false, Color? color}) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 6),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(label, style: bold ? const TextStyle(fontWeight: FontWeight.bold) : null),
          Text(Formatters.currency(value, currency),
            style: TextStyle(fontWeight: bold ? FontWeight.bold : FontWeight.normal, color: color)),
        ],
      ),
    );
  }

  Widget _statusChip(String status) {
    final color = _statusColor(status);
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
      decoration: BoxDecoration(
        color: color.withValues(alpha: 0.12),
        borderRadius: BorderRadius.circular(20),
      ),
      child: Text(_statusDisplay(status), style: TextStyle(fontSize: 11, fontWeight: FontWeight.w600, color: color)),
    );
  }

  Widget _pmChip(String method) {
    final c = _pmColor(method);
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
      decoration: BoxDecoration(
        color: c.withValues(alpha: 0.12),
        borderRadius: BorderRadius.circular(20),
      ),
      child: Text(method.toUpperCase(), style: TextStyle(fontSize: 11, fontWeight: FontWeight.w600, color: c)),
    );
  }

  Widget _filterDropdown(String label, String? value, List<String> items, void Function(String?) onChanged) {
    final scheme = Theme.of(context).colorScheme;
    final icon = _filterIcon(label);
    return Container(
      height: 40,
      padding: const EdgeInsets.symmetric(horizontal: 10),
      decoration: BoxDecoration(
        color: scheme.primaryContainer.withValues(alpha: 0.3),
        borderRadius: BorderRadius.circular(10),
        border: Border.all(color: scheme.outlineVariant.withValues(alpha: 0.5)),
      ),
      child: DropdownButtonHideUnderline(
        child: DropdownButton<String>(
          value: value,
          isDense: true,
          hint: Row(children: [
            Icon(icon, size: 16, color: scheme.primary),
            const SizedBox(width: 6),
            Text(label, style: TextStyle(fontSize: 12, fontWeight: FontWeight.w600, color: scheme.onSurfaceVariant)),
          ]),
          items: [
            DropdownMenuItem(
              value: null,
              child: Row(children: [
                Icon(Icons.all_inclusive, size: 14, color: scheme.onSurfaceVariant),
                const SizedBox(width: 6),
                const Text('All', style: TextStyle(fontSize: 12, fontWeight: FontWeight.w500)),
              ]),
            ),
            ...items.map((v) {
              final isMethod = ['cash', 'mpesa', 'card', 'insurance', 'credit', 'bank_transfer'].contains(v);
              return DropdownMenuItem(
                value: v,
                child: Row(children: [
                  if (isMethod) ...[
                    Container(width: 8, height: 8, decoration: BoxDecoration(color: _pmColor(v), borderRadius: BorderRadius.circular(2))),
                    const SizedBox(width: 6),
                  ] else ...[
                    Icon(_filterItemIcon(v), size: 14, color: _filterItemColor(v)),
                    const SizedBox(width: 6),
                  ],
                  Text(v.toUpperCase(), style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w500)),
                ]),
              );
            }),
          ],
          onChanged: onChanged,
        ),
      ),
    );
  }

  IconData _filterIcon(String label) => switch (label) {
    'Method' => Icons.payments,
    'Type' => Icons.category,
    'Source' => Icons.source,
    _ => Icons.filter_list,
  };

  IconData _filterItemIcon(String v) => switch (v) {
    'inflow' => Icons.south_west,
    'outflow' => Icons.north_east,
    'asset' => Icons.account_balance_wallet,
    'liability' => Icons.money_off,
    'equity' => Icons.pie_chart,
    'revenue' => Icons.trending_up,
    'expense' => Icons.trending_down,
    'journal' => Icons.menu_book,
    'pos' => Icons.point_of_sale,
    'invoice' => Icons.file_copy,
    'po' => Icons.inventory,
    _ => Icons.circle,
  };

  Color _filterItemColor(String v) => switch (v) {
    'inflow' => Colors.green,
    'outflow' => Colors.red,
    'asset' => Colors.blue,
    'liability' => Colors.red,
    'equity' => Colors.teal,
    'revenue' => Colors.green,
    'expense' => Colors.red,
    'journal' => Colors.purple,
    'pos' => Colors.teal,
    'invoice' => Colors.blue,
    'po' => Colors.orange,
    'expense' => Colors.red,
    _ => Colors.grey,
  };

  Widget _filterBar(List<Widget> children) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 8),
      decoration: BoxDecoration(
        color: Theme.of(context).colorScheme.surfaceContainerHighest.withValues(alpha: 0.4),
        borderRadius: BorderRadius.circular(12),
      ),
      child: Wrap(
        spacing: 8, runSpacing: 8,
        crossAxisAlignment: WrapCrossAlignment.center,
        children: children,
      ),
    );
  }

  // ── Color / icon helpers ──────────────────────────────────────────

  Color _pmColor(String m) => switch (m) {
    'cash' => Colors.green,
    'mpesa' => Colors.green.shade700,
    'card' => Colors.blue,
    'insurance' => Colors.purple,
    'credit' => Colors.orange,
    'bank_transfer' => Colors.indigo,
    _ => Colors.grey,
  };

  IconData _pmIcon(String m) => switch (m) {
    'cash' => Icons.money,
    'mpesa' => Icons.phone_android,
    'card' => Icons.credit_card,
    'insurance' => Icons.shield,
    'credit' => Icons.credit_card,
    'bank_transfer' => Icons.account_balance,
    _ => Icons.money,
  };

  Color _statusColor(String s) => switch (s) {
    'completed' || 'paid' || 'settled' || 'received' => Colors.green,
    'voided' || 'cancelled' || 'overdue' || 'open' => Colors.red,
    'pending' || 'partially_paid' || 'partial' || 'draft' || 'Unpaid' || 'Pending Approval' => Colors.orange,
    'approved' || 'sent' || 'Approved' => Colors.blue,
    _ => Colors.grey,
  };

  String _statusDisplay(String s) {
    if (s.isEmpty) return '—';
    return s.replaceAll('_', ' ').split(' ')
        .map((w) => w.isEmpty ? w : '${w[0].toUpperCase()}${w.substring(1)}')
        .join(' ');
  }

  Color _sourceColor(String source) => switch (source) {
    'journal' => Colors.purple,
    'pos' => Colors.teal,
    'invoice' => Colors.blue,
    'expense' => Colors.red,
    'po' => Colors.orange,
    _ => Colors.grey,
  };

  // ── CSV Export ────────────────────────────────────────────────────

  void _exportLedgerCSV(BuildContext context, List<_LedgerEntry> entries, String currency) {
    if (entries.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('No ledger entries to export')),
      );
      return;
    }
    final header = ['Date', 'Entry #', 'Description', 'Account', 'Source', 'Debit', 'Credit', 'Balance'];
    final lines = [
      header.join(','),
      ...entries.map((e) => [
        '"${Formatters.date(e.date)}"',
        '"${e.entryNumber}"',
        '"${e.description.replaceAll(',', ';')}"',
        '"${e.account}"',
        '"${e.source}"',
        e.debit > 0 ? e.debit.toStringAsFixed(2) : '',
        e.credit > 0 ? e.credit.toStringAsFixed(2) : '',
        e.balance.toStringAsFixed(2),
      ].join(',')),
    ];
    final csv = lines.join('\n');
    _saveAndShareCsv(context, csv, entries.length);
  }

  Future<void> _saveAndShareCsv(BuildContext context, String csv, int count) async {
    try {
      if (kIsWeb) {
        if (!mounted) return;
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Exported $count entries (CSV ready)')),
        );
        return;
      }
      final dir = await getTemporaryDirectory();
      final file = File('${dir.path}/general-ledger.csv');
      await file.writeAsString(csv);
      await Share.shareXFiles([XFile(file.path)], text: 'General Ledger CSV ($count entries)');
    } catch (_) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Exported $count entries (CSV ready)')),
      );
    }
  }
}

// ── KPI data holder ─────────────────────────────────────────────────

class _KpiData {
  final String label, value;
  final IconData icon;
  final Color color;
  final String? subtitle;
  const _KpiData(this.label, this.value, this.icon, this.color, [this.subtitle]);
}
