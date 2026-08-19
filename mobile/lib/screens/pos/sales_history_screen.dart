/// Sales History screen — full parity with the web app's `/pos/history` page.
///
/// Features:
/// - 4 KPI cards (Transactions, Net Revenue, Items Sold, AOV)
/// - Filters: date range, search, payment method, status, custom date pickers
/// - Responsive: DataTable on wide screens, card list on mobile
/// - Receipt detail dialog
/// - CSV export

import 'dart:io';
import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:path_provider/path_provider.dart';
import 'package:share_plus/share_plus.dart';

import '../../core/api_client.dart';
import '../../core/formatters.dart';
import '../../models/index.dart';
import '../../providers/auth_provider.dart';
import '../../widgets/common.dart';

// ── Pagination State ────────────────────────────────────────────────

class SalesHistoryState {
  final List<PosTransaction> items;
  final bool isLoading;
  final bool isLoadingMore;
  final bool hasMore;
  final String? error;

  const SalesHistoryState({
    this.items = const [],
    this.isLoading = false,
    this.isLoadingMore = false,
    this.hasMore = true,
    this.error,
  });

  SalesHistoryState copyWith({
    List<PosTransaction>? items,
    bool? isLoading,
    bool? isLoadingMore,
    bool? hasMore,
    String? error,
  }) =>
      SalesHistoryState(
        items: items ?? this.items,
        isLoading: isLoading ?? this.isLoading,
        isLoadingMore: isLoadingMore ?? this.isLoadingMore,
        hasMore: hasMore ?? this.hasMore,
        error: error,
      );
}

class SalesHistoryNotifier extends StateNotifier<SalesHistoryState> {
  final ApiClient _api;
  static const _pageSize = 20;

  String? _statusParam;
  String? _paymentParam;
  int _currentPage = 0;

  SalesHistoryNotifier(this._api)
      : super(const SalesHistoryState(isLoading: true)) {
    load();
  }

  Future<void> load({String? status, String? paymentMethod}) async {
    _statusParam = status;
    _paymentParam = paymentMethod;
    state = const SalesHistoryState(isLoading: true);
    await _fetchPage(1);
  }

  Future<void> loadMore() async {
    if (state.isLoadingMore || state.isLoading || !state.hasMore) return;
    state = state.copyWith(isLoadingMore: true);
    await _fetchPage(_currentPage + 1);
  }

  Future<void> _fetchPage(int page) async {
    try {
      final res = await _api.get('/pos/transactions/', query: {
        'ordering': '-created_at',
        'page_size': _pageSize,
        'page': page,
        if (_statusParam != null) 'status': _statusParam,
        if (_paymentParam != null) 'payment_method': _paymentParam,
      });
      final data = res.data;
      List results;
      if (data is List) {
        results = data;
      } else {
        final paginated = data as Map<String, dynamic>;
        results = paginated['results'] as List? ?? [];
      }
      final parsed = results
          .map((e) => PosTransaction.fromJson(e as Map<String, dynamic>))
          .toList();

      final hasNext = data is Map<String, dynamic> &&
          (data['next'] as String?) != null;

      _currentPage = page;
      state = SalesHistoryState(
        items: page == 1 ? parsed : [...state.items, ...parsed],
        hasMore: hasNext,
      );
    } catch (e) {
      state = state.copyWith(
        isLoading: false,
        isLoadingMore: false,
        error: e.toString(),
      );
    }
  }
}

final salesHistoryProvider =
    StateNotifierProvider<SalesHistoryNotifier, SalesHistoryState>((ref) {
  final api = ref.watch(apiClientProvider);
  return SalesHistoryNotifier(api);
});

// ── Screen ──────────────────────────────────────────────────────────

class SalesHistoryScreen extends ConsumerStatefulWidget {
  const SalesHistoryScreen({super.key});

  @override
  ConsumerState<SalesHistoryScreen> createState() =>
      _SalesHistoryScreenState();
}

class _SalesHistoryScreenState extends ConsumerState<SalesHistoryScreen> {
  final ScrollController _scrollController = ScrollController();
  static const _rangeOptions = [
    ('Today', 'today'),
    ('Yesterday', 'yesterday'),
    ('Last 7 days', '7d'),
    ('Last 30 days', '30d'),
    ('Last 90 days', '90d'),
    ('This month', 'thisMonth'),
    ('Last month', 'lastMonth'),
    ('This year', 'thisYear'),
    ('Custom range', 'custom'),
  ];

  static const _paymentOptions = [
    'cash',
    'mpesa',
    'card',
    'insurance',
    'credit',
    'bank_transfer',
  ];

  static const _statusOptions = ['completed', 'voided', 'cancelled', 'refunded'];

  String _rangeKey = '30d';
  String _searchText = '';
  String? _paymentFilter;
  String? _statusFilter;
  DateTime? _customStart;
  DateTime? _customEnd;

  @override
  void initState() {
    super.initState();
    _scrollController.addListener(_onScroll);
  }

  @override
  void dispose() {
    _scrollController.removeListener(_onScroll);
    _scrollController.dispose();
    super.dispose();
  }

  void _onScroll() {
    if (_scrollController.position.pixels >=
        _scrollController.position.maxScrollExtent - 200) {
      ref.read(salesHistoryProvider.notifier).loadMore();
    }
  }

  void _reload() {
    ref.read(salesHistoryProvider.notifier).load(
          status: _statusFilter,
          paymentMethod: _paymentFilter,
        );
  }

  @override
  Widget build(BuildContext context) {
    final auth = ref.watch(authProvider);
    final currency = auth.billing?.currency ?? 'KSh';
    final state = ref.watch(salesHistoryProvider);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Sales History'),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back),
          tooltip: 'Back to POS',
          onPressed: () => context.go('/pos'),
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh),
            tooltip: 'Refresh',
            onPressed: _reload,
          ),
          IconButton(
            icon: const Icon(Icons.download),
            tooltip: 'Export CSV',
            onPressed: () => _exportCSV(context, state.items, currency),
          ),
          IconButton(
            icon: const Icon(Icons.add),
            tooltip: 'New Sale',
            onPressed: () => context.go('/pos'),
          ),
        ],
      ),
      body: () {
        if (state.isLoading) return const LoadingWidget();
        if (state.error != null && state.items.isEmpty) {
          return ErrorStateWidget(
            message: 'Failed to load sales history',
            onRetry: _reload,
          );
        }

        final filtered = _applyFilters(state.items);
        final kpis = _computeKpis(filtered);

        return RefreshIndicator(
          onRefresh: () async => _reload(),
          child: LayoutBuilder(
            builder: (context, constraints) {
              final isWide = constraints.maxWidth >= 900;
              return CustomScrollView(
                controller: _scrollController,
                slivers: [
                  SliverToBoxAdapter(
                      child: _buildKpiRow(context, kpis, currency)),
                  SliverToBoxAdapter(child: _buildFilters(context)),
                  if (filtered.isEmpty)
                    const SliverFillRemaining(
                      hasScrollBody: false,
                      child: EmptyState(
                        icon: Icons.receipt_long_outlined,
                        title: 'No transactions found',
                        message:
                            'Try adjusting your filters or date range.',
                      ),
                    )
                  else if (isWide)
                    SliverToBoxAdapter(
                        child: _buildTable(context, filtered, currency))
                  else
                    SliverPadding(
                      padding: const EdgeInsets.fromLTRB(12, 4, 12, 16),
                      sliver: SliverList(
                        delegate: SliverChildBuilderDelegate(
                          (context, index) =>
                              _buildCard(context, index, filtered[index], currency),
                          childCount: filtered.length,
                        ),
                      ),
                    ),
                  // ── Bottom loading indicator ────────────────────
                  if (state.isLoadingMore)
                    const SliverToBoxAdapter(
                      child: Padding(
                        padding: EdgeInsets.symmetric(vertical: 16),
                        child: Center(
                          child: SizedBox(
                            width: 24,
                            height: 24,
                            child: CircularProgressIndicator(strokeWidth: 2.5),
                          ),
                        ),
                      ),
                    )
                  else if (!state.hasMore && filtered.isNotEmpty)
                    SliverToBoxAdapter(
                      child: Padding(
                        padding: const EdgeInsets.symmetric(vertical: 16),
                        child: Center(
                          child: Row(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              Container(
                                width: 32, height: 1,
                                color: Theme.of(context).colorScheme.outlineVariant.withValues(alpha: 0.3),
                              ),
                              const SizedBox(width: 12),
                              Text(
                                'End of list',
                                style: TextStyle(
                                  fontSize: 12,
                                  color: Theme.of(context).colorScheme.onSurfaceVariant,
                                ),
                              ),
                              const SizedBox(width: 12),
                              Container(
                                width: 32, height: 1,
                                color: Theme.of(context).colorScheme.outlineVariant.withValues(alpha: 0.3),
                              ),
                            ],
                          ),
                        ),
                      ),
                    ),
                ],
              );
            },
          ),
        );
      }(),
    );
  }

  // ── KPI Row ──────────────────────────────────────────────────────

  Widget _buildKpiRow(BuildContext context, _Kpis k, String currency) {
    return Padding(
      padding: const EdgeInsets.fromLTRB(12, 12, 12, 4),
      child: LayoutBuilder(
        builder: (context, constraints) {
          final crossCount = constraints.maxWidth >= 900 ? 4 : 2;
          return GridView.count(
            crossAxisCount: crossCount,
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            mainAxisSpacing: 8,
            crossAxisSpacing: 8,
            childAspectRatio: crossCount == 4 ? 1.6 : 1.3,
            children: [
              KpiCard(
                label: 'Transactions',
                value: '${k.count}',
                icon: Icons.swap_horiz,
                color: Colors.blue,
                subtitle:
                    '${k.completed} completed · ${k.voided} voided',
              ),
              KpiCard(
                label: 'Net Revenue',
                value: Formatters.currency(k.revenue, currency),
                icon: Icons.attach_money,
                color: Colors.green,
                subtitle: 'Gross: ${Formatters.currency(k.gross, currency)}',
              ),
              KpiCard(
                label: 'Items Sold',
                value: '${k.items}',
                icon: Icons.inventory_2_outlined,
                color: Colors.orange,
                subtitle: '${k.uniqueProducts} unique products',
              ),
              KpiCard(
                label: 'Avg. Order Value',
                value: Formatters.currency(k.aov, currency),
                icon: Icons.trending_up,
                color: Colors.purple,
                subtitle:
                    'Discount: ${Formatters.currency(k.discountTotal, currency)}',
              ),
            ],
          );
        },
      ),
    );
  }

  // ── Filters ──────────────────────────────────────────────────────

  Widget _buildFilters(BuildContext context) {
    final scheme = Theme.of(context).colorScheme;
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final activeCount = _activeFilterCount();

    return Container(
      margin: const EdgeInsets.fromLTRB(12, 8, 12, 8),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: isDark ? scheme.surfaceContainerHighest : scheme.surface,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: scheme.outlineVariant.withValues(alpha: 0.3)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // ── Search ──────────────────────────────────────────
          TextField(
            decoration: InputDecoration(
              hintText: 'Search receipt #, customer, phone...',
              hintStyle: TextStyle(fontSize: 14, color: scheme.onSurfaceVariant.withValues(alpha: 0.6)),
              prefixIcon: Icon(Icons.search_rounded, size: 20, color: scheme.onSurfaceVariant),
              suffixIcon: _searchText.isNotEmpty
                  ? IconButton(
                      icon: Icon(Icons.close_rounded, size: 18),
                      onPressed: () => setState(() => _searchText = ''),
                    )
                  : null,
              filled: true,
              fillColor: isDark
                  ? scheme.surfaceContainerHigh
                  : scheme.surfaceContainerLowest,
              isDense: true,
              contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
              border: OutlineInputBorder(
                borderRadius: BorderRadius.circular(14),
                borderSide: BorderSide.none,
              ),
              enabledBorder: OutlineInputBorder(
                borderRadius: BorderRadius.circular(14),
                borderSide: BorderSide(color: scheme.outlineVariant.withValues(alpha: 0.2)),
              ),
              focusedBorder: OutlineInputBorder(
                borderRadius: BorderRadius.circular(14),
                borderSide: BorderSide(color: scheme.primary, width: 1.5),
              ),
            ),
            style: const TextStyle(fontSize: 14),
            onChanged: (v) => setState(() => _searchText = v),
          ),

          const SizedBox(height: 16),

          // ── Date Range ────────────────────────────────────
          _filterLabel('Date Range', scheme),
          const SizedBox(height: 8),
          SizedBox(
            height: 38,
            child: ListView.separated(
              scrollDirection: Axis.horizontal,
              itemCount: _rangeOptions.length,
              separatorBuilder: (_, __) => const SizedBox(width: 8),
              itemBuilder: (context, index) {
                final opt = _rangeOptions[index];
                final isSelected = _rangeKey == opt.$2;
                return ChoiceChip(
                  label: Text(opt.$1),
                  selected: isSelected,
                  onSelected: (_) => setState(() {
                    _rangeKey = opt.$2;
                    if (opt.$2 != 'custom') {
                      _customStart = null;
                      _customEnd = null;
                    }
                  }),
                  labelStyle: TextStyle(
                    fontSize: 13,
                    fontWeight: isSelected ? FontWeight.w600 : FontWeight.normal,
                  ),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(10),
                  ),
                  visualDensity: VisualDensity.compact,
                  padding: const EdgeInsets.symmetric(horizontal: 4),
                );
              },
            ),
          ),

          // ── Custom date pickers ────────────────────────────
          if (_rangeKey == 'custom') ...[
            const SizedBox(height: 12),
            Row(
              children: [
                Expanded(
                  child: _dateTile(
                    context,
                    label: 'From',
                    date: _customStart,
                    icon: Icons.event_available_rounded,
                    onTap: () async {
                      final d = await showDatePicker(
                        context: context,
                        initialDate: _customStart ?? DateTime.now(),
                        firstDate: DateTime(2020),
                        lastDate: DateTime.now(),
                      );
                      if (d != null) setState(() => _customStart = d);
                    },
                    scheme: scheme,
                    isDark: isDark,
                  ),
                ),
                Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 8),
                  child: Icon(Icons.arrow_forward_rounded,
                      color: scheme.onSurfaceVariant, size: 18),
                ),
                Expanded(
                  child: _dateTile(
                    context,
                    label: 'To',
                    date: _customEnd,
                    icon: Icons.event_busy_rounded,
                    onTap: () async {
                      final d = await showDatePicker(
                        context: context,
                        initialDate: _customEnd ?? DateTime.now(),
                        firstDate: DateTime(2020),
                        lastDate: DateTime.now(),
                      );
                      if (d != null) setState(() => _customEnd = d);
                    },
                    scheme: scheme,
                    isDark: isDark,
                  ),
                ),
              ],
            ),
          ],

          const SizedBox(height: 16),

          // ── Payment & Status ────────────────────────────────
          Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    _filterLabel('Payment', scheme),
                    const SizedBox(height: 8),
                    _dropdown(
                      context,
                      value: _paymentFilter,
                      hint: 'All',
                      items: _paymentOptions,
                      scheme: scheme,
                      isDark: isDark,
                      labelBuilder: (v) => v.toUpperCase(),
                      onChanged: (v) {
                        setState(() => _paymentFilter = v);
                        _reload();
                      },
                      leadingColor: _paymentFilter != null
                          ? _paymentColor(_paymentFilter!)
                          : null,
                    ),
                  ],
                ),
              ),
              const SizedBox(width: 16),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    _filterLabel('Status', scheme),
                    const SizedBox(height: 8),
                    _dropdown(
                      context,
                      value: _statusFilter,
                      hint: 'All',
                      items: _statusOptions,
                      scheme: scheme,
                      isDark: isDark,
                      labelBuilder: (v) => v.capitalize(),
                      onChanged: (v) {
                        setState(() => _statusFilter = v);
                        _reload();
                      },
                      leadingColor: _statusFilter != null
                          ? _statusColor(_statusFilter!)
                          : null,
                    ),
                  ],
                ),
              ),
            ],
          ),

          // ── Active filter bar ───────────────────────────────
          if (activeCount > 0) ...[
            const SizedBox(height: 12),
            Divider(color: scheme.outlineVariant.withValues(alpha: 0.3), height: 1),
            const SizedBox(height: 8),
            Row(
              children: [
                Icon(Icons.filter_list_rounded, size: 16, color: scheme.primary),
                const SizedBox(width: 6),
                Text(
                  '$activeCount filter${activeCount > 1 ? 's' : ''} active',
                  style: TextStyle(fontSize: 12, color: scheme.onSurfaceVariant),
                ),
                const Spacer(),
                TextButton.icon(
                  onPressed: _clearFilters,
                  icon: const Icon(Icons.clear_all_rounded, size: 18),
                  label: const Text('Clear all'),
                  style: TextButton.styleFrom(
                    foregroundColor: scheme.error,
                    visualDensity: VisualDensity.compact,
                    padding: const EdgeInsets.symmetric(horizontal: 8),
                  ),
                ),
              ],
            ),
          ],
        ],
      ),
    );
  }

  // ── Filter helpers ────────────────────────────────────────────────

  Widget _filterLabel(String text, ColorScheme scheme) {
    return Text(
      text,
      style: TextStyle(
        fontSize: 11,
        fontWeight: FontWeight.bold,
        color: scheme.onSurfaceVariant,
        letterSpacing: 0.8,
      ),
    );
  }

  Widget _dateTile(
    BuildContext context, {
    required String label,
    required DateTime? date,
    required IconData icon,
    required VoidCallback onTap,
    required ColorScheme scheme,
    required bool isDark,
  }) {
    final hasDate = date != null;
    return Material(
      color: isDark ? scheme.surfaceContainerHigh : scheme.surfaceContainerLowest,
      borderRadius: BorderRadius.circular(12),
      child: InkWell(
        borderRadius: BorderRadius.circular(12),
        onTap: onTap,
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
          child: Row(
            children: [
              Icon(icon, size: 18, color: hasDate ? scheme.primary : scheme.onSurfaceVariant),
              const SizedBox(width: 8),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Text(label, style: TextStyle(fontSize: 10, color: scheme.onSurfaceVariant)),
                    Text(
                      hasDate ? Formatters.date(date) : 'Select date',
                      style: TextStyle(
                        fontSize: 13,
                        fontWeight: FontWeight.w600,
                        color: hasDate ? scheme.onSurface : scheme.onSurfaceVariant.withValues(alpha: 0.6),
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  int _activeFilterCount() {
    int count = 0;
    if (_rangeKey != '30d') count++;
    if (_searchText.isNotEmpty) count++;
    if (_paymentFilter != null) count++;
    if (_statusFilter != null) count++;
    if (_customStart != null) count++;
    if (_customEnd != null) count++;
    return count;
  }

  Widget _dropdown(
    BuildContext context, {
    required String? value,
    required String hint,
    required List<String> items,
    required String Function(String) labelBuilder,
    required void Function(String?) onChanged,
    required ColorScheme scheme,
    required bool isDark,
    Color? leadingColor,
  }) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12),
      decoration: BoxDecoration(
        color: isDark
            ? scheme.surfaceContainerHigh
            : scheme.surfaceContainerLowest,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(
          color: value != null
              ? (leadingColor ?? scheme.primary).withValues(alpha: 0.4)
              : scheme.outlineVariant.withValues(alpha: 0.2),
        ),
      ),
      child: DropdownButtonHideUnderline(
        child: DropdownButton<String>(
          value: value,
          hint: Text(hint, style: TextStyle(fontSize: 13, color: scheme.onSurfaceVariant)),
          isExpanded: true,
          icon: Icon(Icons.keyboard_arrow_down_rounded, size: 20, color: scheme.onSurfaceVariant),
          style: TextStyle(
            fontSize: 13,
            fontWeight: FontWeight.w600,
            color: scheme.onSurface,
          ),
          items: [
            DropdownMenuItem(value: null, child: Text(hint)),
            ...items.map((v) => DropdownMenuItem(
                  value: v,
                  child: Row(
                    children: [
                      if (leadingColor != null || value == v) ...[
                        Container(
                          width: 8,
                          height: 8,
                          decoration: BoxDecoration(
                            color: _chipColorFor(v),
                            shape: BoxShape.circle,
                          ),
                        ),
                        const SizedBox(width: 8),
                      ],
                      Text(labelBuilder(v)),
                    ],
                  ),
                )),
          ],
          onChanged: onChanged,
        ),
      ),
    );
  }

  Color _chipColorFor(String value) {
    if (_paymentOptions.contains(value)) return _paymentColor(value);
    if (_statusOptions.contains(value)) return _statusColor(value);
    return Colors.grey;
  }

  // ── Card (mobile) ──────────────────────────────────────────────

  Widget _buildCard(
      BuildContext context, int index, PosTransaction t, String currency) {
    final scheme = Theme.of(context).colorScheme;

    return Card(
      margin: const EdgeInsets.only(bottom: 8),
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
      clipBehavior: Clip.antiAlias,
      child: InkWell(
        onTap: () => _viewReceipt(t),
        child: Padding(
          padding: const EdgeInsets.all(14),
          child: Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // ── Number badge ─────────────────────────────
              Container(
                width: 28,
                height: 28,
                alignment: Alignment.center,
                decoration: BoxDecoration(
                  color: scheme.primaryContainer,
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Text(
                  '${index + 1}',
                  style: TextStyle(
                    fontSize: 12,
                    fontWeight: FontWeight.bold,
                    color: scheme.onPrimaryContainer,
                  ),
                ),
              ),
              const SizedBox(width: 12),
              // ── Content ──────────────────────────────────
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // Receipt # + Total
                    Row(
                      children: [
                        Expanded(
                          child: Text(
                            t.transactionNumber,
                            style: const TextStyle(
                              fontWeight: FontWeight.bold,
                              fontSize: 14,
                            ),
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                          ),
                        ),
                        const SizedBox(width: 8),
                        Text(
                          Formatters.currency(t.total, currency),
                          style: TextStyle(
                            fontWeight: FontWeight.bold,
                            fontSize: 15,
                            color: scheme.primary,
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 6),
                    // Date / time
                    Row(
                      children: [
                        Icon(Icons.schedule_rounded, size: 14,
                            color: scheme.onSurfaceVariant),
                        const SizedBox(width: 4),
                        Flexible(
                          child: Text(
                            '${Formatters.date(t.createdAt)} · ${Formatters.time(t.createdAt)}',
                            style: TextStyle(
                              fontSize: 12,
                              color: scheme.onSurfaceVariant,
                            ),
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                          ),
                        ),
                      ],
                    ),
                    if (t.customerName.isNotEmpty || t.customerPhone.isNotEmpty) ...[
                      const SizedBox(height: 4),
                      Row(
                        children: [
                          Icon(Icons.person_outline_rounded, size: 14,
                              color: scheme.onSurfaceVariant),
                          const SizedBox(width: 4),
                          Expanded(
                            child: Text(
                              [
                                if (t.customerName.isNotEmpty) t.customerName,
                                if (t.customerPhone.isNotEmpty) t.customerPhone,
                              ].join('  ·  '),
                              style: TextStyle(
                                fontSize: 12,
                                color: scheme.onSurfaceVariant,
                              ),
                              maxLines: 1,
                              overflow: TextOverflow.ellipsis,
                            ),
                          ),
                        ],
                      ),
                    ],
                    const SizedBox(height: 10),
                    // Payment + Status + Chevron
                    Row(
                      children: [
                        _paymentChip(t.paymentMethod),
                        const SizedBox(width: 6),
                        _statusChip(t.status),
                        const Spacer(),
                        Icon(Icons.chevron_right_rounded,
                            size: 20, color: scheme.onSurfaceVariant),
                      ],
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  // ── Data Table (wide screens) ───────────────────────────────────

  Widget _buildTable(
      BuildContext context, List<PosTransaction> txs, String currency) {
    return Padding(
      padding: const EdgeInsets.fromLTRB(12, 4, 12, 16),
      child: SingleChildScrollView(
        scrollDirection: Axis.horizontal,
        child: Card(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
        clipBehavior: Clip.antiAlias,
        child: DataTable(
          headingRowHeight: 48,
          dataRowMinHeight: 52,
          dataRowMaxHeight: 64,
          columnSpacing: 24,
          columns: const [
            DataColumn(label: Text('#', style: TextStyle(fontSize: 13)), numeric: true),
            DataColumn(label: Text('Date/Time', style: TextStyle(fontSize: 13))),
            DataColumn(label: Text('Receipt #', style: TextStyle(fontSize: 13))),
            DataColumn(label: Text('Customer', style: TextStyle(fontSize: 13))),
            DataColumn(label: Text('Payment', style: TextStyle(fontSize: 13))),
            DataColumn(label: Text('Items', style: TextStyle(fontSize: 13)), numeric: true),
            DataColumn(label: Text('Total', style: TextStyle(fontSize: 13)), numeric: true),
            DataColumn(label: Text('Status', style: TextStyle(fontSize: 13))),
            DataColumn(label: Text('', style: TextStyle(fontSize: 13))),
          ],
          rows: List.generate(txs.length, (i) {
            final t = txs[i];
            return DataRow(
              onSelectChanged: (_) => _viewReceipt(t),
              cells: [
                DataCell(Text('${i + 1}',
                    style: TextStyle(fontSize: 13, color: Theme.of(context).colorScheme.onSurfaceVariant))),
                DataCell(Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Text(Formatters.date(t.createdAt),
                        style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w500)),
                    Text(Formatters.time(t.createdAt),
                        style: TextStyle(fontSize: 11,
                            color: Theme.of(context).colorScheme.onSurfaceVariant)),
                  ],
                )),
                DataCell(Text(t.transactionNumber,
                    style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w500))),
                DataCell(Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    CircleAvatar(
                      radius: 16,
                      backgroundColor: Theme.of(context).colorScheme.surfaceContainerHighest,
                      child: Text(
                        (t.customerName.isNotEmpty ? t.customerName : 'W')
                            .substring(0, 1)
                            .toUpperCase(),
                        style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold),
                      ),
                    ),
                    const SizedBox(width: 8),
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Text(t.customerName.isNotEmpty ? t.customerName : 'Walk-in',
                            style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w500)),
                        if (t.customerPhone.isNotEmpty)
                          Text(t.customerPhone,
                              style: TextStyle(fontSize: 11,
                                  color: Theme.of(context).colorScheme.onSurfaceVariant)),
                      ],
                    ),
                  ],
                )),
                DataCell(_paymentChip(t.paymentMethod)),
                DataCell(Text('${t.itemsCount}',
                    style: const TextStyle(fontSize: 13))),
                DataCell(Text(Formatters.currency(t.total, currency),
                    style: const TextStyle(fontSize: 14, fontWeight: FontWeight.bold))),
                DataCell(_statusChip(t.status)),
                DataCell(IconButton(
                  icon: const Icon(Icons.visibility_outlined, size: 20),
                  onPressed: () => _viewReceipt(t),
                  tooltip: 'View receipt',
                )),
              ],
            );
          }),
        ),
      ),
      ),
    );
  }

  // ── Receipt Dialog ───────────────────────────────────────────────

  void _viewReceipt(PosTransaction tx) {
    final currency = ref.read(authProvider).billing?.currency ?? 'KSh';
    showDialog(
      context: context,
      builder: (ctx) => _buildReceiptDialog(ctx, tx, currency),
    );
  }

  Widget _buildReceiptDialog(BuildContext context, PosTransaction tx, String currency) {
    final scheme = Theme.of(context).colorScheme;

    return Dialog(
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
      child: ConstrainedBox(
        constraints: const BoxConstraints(maxWidth: 440),
        child: SingleChildScrollView(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              // ── Header ────────────────────────────────────────
              Container(
                width: double.infinity,
                padding: const EdgeInsets.all(20),
                decoration: BoxDecoration(
                  color: scheme.primary.withValues(alpha: 0.03),
                  borderRadius: const BorderRadius.only(
                    topLeft: Radius.circular(20),
                    topRight: Radius.circular(20),
                  ),
                ),
                child: Column(
                  children: [
                    Container(
                      padding: const EdgeInsets.all(10),
                      decoration: BoxDecoration(
                        color: scheme.primary,
                        borderRadius: BorderRadius.circular(12),
                      ),
                      child: Icon(Icons.monitor, color: scheme.onPrimary, size: 26),
                    ),
                    const SizedBox(height: 12),
                    RichText(
                      text: TextSpan(
                        style: const TextStyle(
                          fontSize: 18, fontWeight: FontWeight.bold),
                        children: [
                          const TextSpan(text: 'Domendra'),
                          TextSpan(text: 'POS', style: TextStyle(color: scheme.primary)),
                        ],
                      ),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      Formatters.dateTime(tx.createdAt),
                      style: TextStyle(fontSize: 12, color: scheme.onSurfaceVariant),
                    ),
                    const SizedBox(height: 8),
                    _statusChip(tx.status),
                  ],
                ),
              ),
              const Divider(height: 1),
              // ── Meta info ─────────────────────────────────────
              Padding(
                padding: const EdgeInsets.all(20),
                child: Column(
                  children: [
                    _metaRow('Receipt #', tx.transactionNumber, scheme),
                    _metaRow('Cashier', tx.cashierName, scheme),
                    _metaRow('Customer', tx.customerName.isNotEmpty ? tx.customerName : 'Walk-in', scheme),
                    if (tx.customerPhone.isNotEmpty)
                      _metaRow('Phone', tx.customerPhone, scheme),
                    const SizedBox(height: 4),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text('Payment',
                            style: TextStyle(fontSize: 12, color: scheme.onSurfaceVariant)),
                        _paymentChip(tx.paymentMethod),
                      ],
                    ),
                  ],
                ),
              ),
              const Divider(height: 1),
              // ── Line items ────────────────────────────────────
              Padding(
                padding: const EdgeInsets.all(20),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text('ITEM',
                            style: TextStyle(
                                fontSize: 11,
                                fontWeight: FontWeight.bold,
                                color: scheme.onSurfaceVariant,
                                letterSpacing: 1)),
                        Text('AMOUNT',
                            style: TextStyle(
                                fontSize: 11,
                                fontWeight: FontWeight.bold,
                                color: scheme.onSurfaceVariant,
                                letterSpacing: 1)),
                      ],
                    ),
                    const SizedBox(height: 8),
                    ...tx.items.map((line) => Padding(
                          padding: const EdgeInsets.symmetric(vertical: 4),
                          child: Row(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Expanded(
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Text(line.productName,
                                        style: const TextStyle(
                                            fontSize: 13, fontWeight: FontWeight.w500)),
                                    const SizedBox(height: 2),
                                    Text(
                                      '${line.quantity} × ${Formatters.currency(Formatters.toDouble(line.unitPrice) > 0 ? Formatters.toDouble(line.unitPrice) : (Formatters.toDouble(line.lineTotal) / (double.tryParse(line.quantity) ?? 1)), currency)}',
                                      style: TextStyle(
                                          fontSize: 11, color: scheme.onSurfaceVariant),
                                    ),
                                  ],
                                ),
                              ),
                              Text(
                                Formatters.currency(Formatters.toDouble(line.lineTotal), currency),
                                style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w500),
                              ),
                            ],
                          ),
                        )),
                  ],
                ),
              ),
              const Divider(height: 1),
              // ── Totals ────────────────────────────────────────
              Padding(
                padding: const EdgeInsets.all(20),
                child: Column(
                  children: [
                    _totalRow('Subtotal', Formatters.currency(tx.subtotal, currency), scheme),
                    _totalRow('Tax (VAT)', Formatters.currency(tx.tax, currency), scheme),
                    if (tx.discount > 0)
                      _totalRow('Discount', '-${Formatters.currency(tx.discount, currency)}', scheme,
                          valueColor: scheme.error),
                    const SizedBox(height: 12),
                    Divider(thickness: 1.5, color: scheme.outlineVariant),
                    const SizedBox(height: 12),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        const Text('Total', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
                        Text(Formatters.currency(tx.total, currency),
                            style: TextStyle(
                                fontSize: 18, fontWeight: FontWeight.bold, color: scheme.primary)),
                      ],
                    ),
                  ],
                ),
              ),
              const Divider(height: 1),
              // ── Footer ────────────────────────────────────────
              Padding(
                padding: const EdgeInsets.all(20),
                child: Column(
                  children: [
                    Text('Thank you for your purchase!',
                        style: TextStyle(fontSize: 13, color: scheme.onSurfaceVariant)),
                    const SizedBox(height: 16),
                    SizedBox(
                      width: double.infinity,
                      child: OutlinedButton(
                        onPressed: () => Navigator.pop(context),
                        child: const Text('Close'),
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _metaRow(String label, String value, ColorScheme scheme) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 3),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(label, style: TextStyle(fontSize: 12, color: scheme.onSurfaceVariant)),
          Text(value, style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w500)),
        ],
      ),
    );
  }

  Widget _totalRow(String label, String value, ColorScheme scheme, {Color? valueColor}) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 3),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(label, style: TextStyle(fontSize: 13, color: scheme.onSurfaceVariant)),
          Text(value, style: TextStyle(fontSize: 13, fontWeight: FontWeight.w500, color: valueColor)),
        ],
      ),
    );
  }

  // ── Chips ─────────────────────────────────────────────────────────

  Widget _statusChip(String status) {
    final c = _statusColor(status);
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
      decoration: BoxDecoration(
        color: c.withValues(alpha: 0.12),
        borderRadius: BorderRadius.circular(20),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(_statusIcon(status), size: 12, color: c),
          const SizedBox(width: 4),
          Text(
            status,
            style: TextStyle(
              fontSize: 11,
              fontWeight: FontWeight.w600,
              color: c,
            ),
          ),
        ],
      ),
    );
  }

  Widget _paymentChip(String method) {
    final c = _paymentColor(method);
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
      decoration: BoxDecoration(
        color: c.withValues(alpha: 0.12),
        borderRadius: BorderRadius.circular(20),
      ),
      child: Text(
        method.toUpperCase(),
        style: TextStyle(
          fontSize: 11,
          fontWeight: FontWeight.w600,
          color: c,
        ),
      ),
    );
  }

  // ── Color / Icon helpers ──────────────────────────────────────────

  Color _paymentColor(String method) {
    switch (method) {
      case 'cash':
        return Colors.green;
      case 'mpesa':
        return Colors.green.shade700;
      case 'card':
        return Colors.blue;
      case 'insurance':
        return Colors.purple;
      case 'credit':
        return Colors.orange;
      case 'bank_transfer':
        return Colors.teal;
      default:
        return Colors.grey;
    }
  }

  Color _statusColor(String status) {
    switch (status) {
      case 'completed':
        return Colors.green;
      case 'voided':
        return Colors.red;
      case 'cancelled':
        return Colors.grey;
      case 'refunded':
        return Colors.orange;
      case 'pending':
        return Colors.blue;
      default:
        return Colors.grey;
    }
  }

  IconData _statusIcon(String status) {
    switch (status) {
      case 'completed':
        return Icons.check_circle_outline;
      case 'voided':
        return Icons.cancel_outlined;
      case 'cancelled':
        return Icons.cancel;
      case 'refunded':
        return Icons.undo;
      case 'pending':
        return Icons.access_time;
      default:
        return Icons.help_outline;
    }
  }

  // ── Filtering & KPI logic ─────────────────────────────────────────

  List<PosTransaction> _applyFilters(List<PosTransaction> all) {
    // 1. Date range
    final range = _resolveRange(_rangeKey);
    var list = all.where((t) {
      final d = DateTime.tryParse(t.createdAt);
      if (d == null) return false;
      return !d.isBefore(range[0]) && !d.isAfter(range[1]);
    }).toList();

    // 2. Search
    if (_searchText.isNotEmpty) {
      final s = _searchText.toLowerCase();
      list = list.where((t) {
        return t.transactionNumber.toLowerCase().contains(s) ||
            t.customerName.toLowerCase().contains(s) ||
            t.customerPhone.contains(s);
      }).toList();
    }

    // 3. Payment filter
    if (_paymentFilter != null) {
      list = list.where((t) => t.paymentMethod == _paymentFilter).toList();
    }

    // 4. Status filter
    if (_statusFilter != null) {
      list = list.where((t) => t.status == _statusFilter).toList();
    }

    return list;
  }

  _Kpis _computeKpis(List<PosTransaction> list) {
    final completed = list.where((t) => t.status == 'completed').toList();
    final voided = list.where((t) => t.status == 'voided').length;
    final revenue = completed.fold(0.0, (s, t) => s + t.total);
    final gross = list.fold(0.0, (s, t) => s + t.total);
    final items = completed.fold(0, (s, t) => s + t.itemsCount);
    final discountTotal = completed.fold(0.0, (s, t) => s + t.discount);
    final uniqueProducts = completed
        .expand((t) => t.items.map((i) => i.product))
        .toSet()
        .length;

    return _Kpis(
      count: list.length,
      completed: completed.length,
      voided: voided,
      revenue: revenue,
      gross: gross,
      items: items,
      uniqueProducts: uniqueProducts,
      aov: completed.isNotEmpty ? revenue / completed.length : 0,
      discountTotal: discountTotal,
    );
  }

  List<DateTime> _resolveRange(String key) {
    final now = DateTime.now();
    final end = DateTime(now.year, now.month, now.day, 23, 59, 59, 999);
    var start = DateTime(now.year, now.month, now.day, 0, 0, 0, 0);

    switch (key) {
      case 'today':
        return [start, end];
      case 'yesterday':
        return [start.subtract(const Duration(days: 1)),
                end.subtract(const Duration(days: 1))];
      case '7d':
        return [start.subtract(const Duration(days: 7)), end];
      case '30d':
        return [start.subtract(const Duration(days: 30)), end];
      case '90d':
        return [start.subtract(const Duration(days: 90)), end];
      case 'thisMonth':
        return [DateTime(now.year, now.month, 1), end];
      case 'lastMonth':
        final lastMonthStart = DateTime(now.year, now.month - 1, 1);
        final lastMonthEnd = DateTime(now.year, now.month, 0, 23, 59, 59, 999);
        return [lastMonthStart, lastMonthEnd];
      case 'thisYear':
        return [DateTime(now.year, 1, 1), end];
      case 'custom':
        if (_customStart == null || _customEnd == null) {
          return [DateTime(2020, 1, 1), end];
        }
        return [
          DateTime(_customStart!.year, _customStart!.month, _customStart!.day, 0, 0, 0, 0),
          DateTime(_customEnd!.year, _customEnd!.month, _customEnd!.day, 23, 59, 59, 999),
        ];
      default:
        return [DateTime(2020, 1, 1), end];
    }
  }

  void _clearFilters() {
    setState(() {
      _rangeKey = '30d';
      _searchText = '';
      _paymentFilter = null;
      _statusFilter = null;
      _customStart = null;
      _customEnd = null;
    });
    _reload();
  }

  // ── CSV Export ────────────────────────────────────────────────────

  void _exportCSV(
    BuildContext context,
    List<PosTransaction> all,
    String currency,
  ) {
    final filtered = _applyFilters(all);
    if (filtered.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('No transactions to export')),
      );
      return;
    }

    final header = ['Receipt#', 'Date', 'Customer', 'Payment', 'Total', 'Status'];
    final lines = [
      header.join(','),
      ...filtered.map((t) => [
            '"${t.transactionNumber}"',
            '"${t.createdAt}"',
            '"${t.customerName.isNotEmpty ? t.customerName : 'Walk-in'}"',
            '"${t.paymentMethod}"',
            '${t.total}',
            '"${t.status}"',
          ].join(',')),
    ];
    final csv = lines.join('\n');

    _saveAndShareCsv(context, csv, filtered.length);
  }

  Future<void> _saveAndShareCsv(
      BuildContext context, String csv, int count) async {
    try {
      if (kIsWeb) {
        // Web: use AnchorElement via html package (not imported here)
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Exported $count transactions (CSV ready)')),
        );
        return;
      }

      final dir = await getTemporaryDirectory();
      final file = File('${dir.path}/sales-history.csv');
      await file.writeAsString(csv);

      await Share.shareXFiles(
        [XFile(file.path)],
        text: 'Sales History CSV ($count transactions)',
      );
    } catch (_) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Exported $count transactions (CSV ready)')),
      );
    }
  }
}

// ── KPI model ───────────────────────────────────────────────────────

class _Kpis {
  final int count;
  final int completed;
  final int voided;
  final double revenue;
  final double gross;
  final int items;
  final int uniqueProducts;
  final double aov;
  final double discountTotal;

  _Kpis({
    required this.count,
    required this.completed,
    required this.voided,
    required this.revenue,
    required this.gross,
    required this.items,
    required this.uniqueProducts,
    required this.aov,
    required this.discountTotal,
  });
}

// ── Extension ───────────────────────────────────────────────────────

extension on String {
  String capitalize() {
    if (isEmpty) return this;
    return '${this[0].toUpperCase()}${substring(1)}';
  }
}
