/// POS screen — full feature parity with the web app's `/pos` page.
/// Clean, modern Material 3 UI.

import 'dart:math';

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../core/formatters.dart';
import '../../models/index.dart';
import '../../providers/auth_provider.dart';
import '../../providers/cart_provider.dart';
import '../../widgets/common.dart';

class PosScreen extends ConsumerStatefulWidget {
  const PosScreen({super.key});

  @override
  ConsumerState<PosScreen> createState() => _PosScreenState();
}

class _PosScreenState extends ConsumerState<PosScreen> {
  final _searchController = TextEditingController();
  final _discountController = TextEditingController();
  final _customerNameController = TextEditingController();

  List<Product> _products = [];
  bool _loading = false;
  String _searchQuery = '';
  String? _activeCategory;
  bool _isGridView = true;
  int _page = 1;
  int _pageSize = 24;

  List<Branch> _branches = [];
  List<Customer> _customers = [];

  int _todayCount = 0;
  double _todayRevenue = 0;
  int _parkedCount = 0;
  PosShift? _shift;

  bool _checkingOut = false;
  Map<String, dynamic>? _lastTransaction;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      final auth = ref.read(authProvider);
      if (auth.user != null) {
        ref.read(cartProvider.notifier).restoreCart(auth.user!.id);
        _customerNameController.text = ref.read(cartProvider).customerName;
      }
      _loadAllData();
    });
  }

  @override
  void dispose() {
    _searchController.dispose();
    _discountController.dispose();
    _customerNameController.dispose();
    super.dispose();
  }

  // ── Data loading ────────────────────────────────────────────────

  Future<void> _loadAllData() async {
    await _loadBranches();
    await Future.wait([
      _loadProducts(),
      _loadCustomers(),
      _loadTodayStats(),
      _loadParkedCount(),
      _loadShift(),
    ]);
  }

  Future<List<T>> _parsePaginated<T>(dynamic data, T Function(Map<String, dynamic>) fromJson) async {
    if (data is List) return data.map((e) => fromJson(e as Map<String, dynamic>)).toList();
    final paginated = data as Map<String, dynamic>;
    return (paginated['results'] as List? ?? []).map((e) => fromJson(e as Map<String, dynamic>)).toList();
  }

  Future<void> _loadBranches() async {
    try {
      final api = ref.read(apiClientProvider);
      final res = await api.get('/branches/');
      final branches = await _parsePaginated(res.data, Branch.fromJson);
      setState(() => _branches = branches.where((b) => b.isActive).toList());
      final cart = ref.read(cartProvider);
      if (_branches.isNotEmpty && cart.branchId == null) {
        final hq = _branches.firstWhere((b) => b.isHeadquarters, orElse: () => _branches.first);
        ref.read(cartProvider.notifier).setBranch(hq.id, hq.name);
      }
    } catch (_) {}
  }

  Future<void> _loadProducts() async {
    setState(() => _loading = true);
    try {
      final api = ref.read(apiClientProvider);
      final res = await api.get('/products/', query: {
        'page_size': 5000, 'is_active': 'true', 'is_sellable': 'true', 'ordering': 'name',
      });
      final products = await _parsePaginated(res.data, Product.fromJson);
      setState(() { _products = products; _loading = false; });
    } catch (_) {
      setState(() => _loading = false);
    }
  }

  Future<void> _loadCustomers() async {
    try {
      final api = ref.read(apiClientProvider);
      final res = await api.get('/customers/', query: {'page_size': 500});
      final customers = await _parsePaginated(res.data, Customer.fromJson);
      setState(() => _customers = customers);
    } catch (_) {}
  }

  Future<void> _loadTodayStats() async {
    try {
      final api = ref.read(apiClientProvider);
      final res = await api.get('/pos/transactions/', query: {'page_size': 200});
      final data = res.data;
      List<dynamic> txs = data is List ? data : (data as Map<String, dynamic>)['results'] as List? ?? [];
      final todayStr = DateTime.now().toDateString();
      final todayTxs = txs.where((t) {
        final tx = t as Map<String, dynamic>;
        return DateTime.tryParse(tx['created_at']?.toString() ?? '')?.toDateString() == todayStr && tx['status'] != 'voided';
      }).toList();
      setState(() {
        _todayCount = todayTxs.length;
        _todayRevenue = todayTxs.fold(0.0, (s, t) => s + double.tryParse((t as Map<String, dynamic>)['total']?.toString() ?? '0')!);
      });
    } catch (_) {}
  }

  Future<void> _loadParkedCount() async {
    try {
      final api = ref.read(apiClientProvider);
      final res = await api.get('/pos/parked-sales/', query: {'page_size': 1});
      final data = res.data;
      if (data is Map<String, dynamic>) {
        setState(() => _parkedCount = data['count'] as int? ?? (data['results'] as List?)?.length ?? 0);
      } else if (data is List) {
        setState(() => _parkedCount = data.length);
      }
    } catch (_) {}
  }

  Future<void> _loadShift() async {
    try {
      final api = ref.read(apiClientProvider);
      final res = await api.get('/pos/shifts/current/');
      setState(() => _shift = PosShift.fromJson(res.data as Map<String, dynamic>));
    } catch (_) {
      setState(() => _shift = null);
    }
  }

  // ── Computed ─────────────────────────────────────────────────────

  List<String> get _categories {
    final set = <String>{};
    for (final p in _products) {
      set.add(p.categoryName ?? 'Uncategorized');
    }
    return set.toList()..sort();
  }

  List<Product> get _filteredProducts {
    var list = _products.where((p) => p.isActive && p.isSellable).toList();
    if (_activeCategory != null) {
      list = list.where((p) => (p.categoryName ?? 'Uncategorized') == _activeCategory).toList();
    }
    if (_searchQuery.isNotEmpty) {
      list = list.where((p) =>
          p.name.toLowerCase().contains(_searchQuery) ||
          p.sku.toLowerCase().contains(_searchQuery) ||
          p.barcode.toLowerCase().contains(_searchQuery)).toList();
    }
    return list;
  }

  int get _pageCount => max(1, (_filteredProducts.length / _pageSize).ceil());

  List<Product> get _paginatedProducts {
    final start = (_page - 1) * _pageSize;
    return _filteredProducts.skip(start).take(_pageSize).toList();
  }

  double _stockOf(Product p) => p.stockOnHand ?? 0;
  String get _currency => ref.read(authProvider).billing?.currency ?? 'KSh';

  // ── Actions ──────────────────────────────────────────────────────

  void _quickAddByBarcode() {
    if (_searchQuery.isEmpty) return;
    final match = _products.firstWhereOrNull((p) =>
        p.barcode.isNotEmpty && p.barcode.toLowerCase() == _searchQuery.toLowerCase());
    if (match != null) {
      _addToCart(match);
      _searchController.clear();
      setState(() => _searchQuery = '');
    }
  }

  void _addToCart(Product product) {
    if (product.trackInventory && _stockOf(product) <= 0) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Item is out of stock'), duration: Duration(seconds: 1)),
      );
      return;
    }
    ref.read(cartProvider.notifier).addToCart(product);
  }

  // ── Payment methods ──────────────────────────────────────────────

  static const _paymentMethods = [
    _PaymentOption('cash', 'Cash', Icons.payments_outlined),
    _PaymentOption('mpesa', 'M-Pesa', Icons.phone_android_outlined),
    _PaymentOption('card', 'Card', Icons.credit_card_outlined),
    _PaymentOption('insurance', 'Insurance', Icons.shield_outlined),
    _PaymentOption('credit', 'Credit', Icons.account_balance_wallet_outlined),
  ];

  // ── Build ────────────────────────────────────────────────────────

  @override
  Widget build(BuildContext context) {
    final cart = ref.watch(cartProvider);
    final scheme = Theme.of(context).colorScheme;
    final isTablet = MediaQuery.of(context).size.width > 600;

    return Scaffold(
      appBar: AppBar(
        title: Row(
          children: [
            Container(
              padding: const EdgeInsets.all(6),
              decoration: BoxDecoration(
                color: scheme.primaryContainer,
                borderRadius: BorderRadius.circular(10),
              ),
              child: Icon(Icons.point_of_sale, size: 20, color: scheme.onPrimaryContainer),
            ),
            const SizedBox(width: 10),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text('Point of Sale', style: Theme.of(context).textTheme.titleMedium?.copyWith(fontWeight: FontWeight.bold)),
                  Text(
                    '$_todayCount sales · ${Formatters.currency(_todayRevenue, _currency)}',
                    style: Theme.of(context).textTheme.bodySmall?.copyWith(color: scheme.onSurfaceVariant),
                  ),
                ],
              ),
            ),
          ],
        ),
        actions: [
          if (_branches.isNotEmpty)
            _BranchChip(
              branches: _branches,
              selectedId: cart.branchId,
              onSelect: (id) {
                final br = _branches.firstWhere((b) => b.id == id);
                ref.read(cartProvider.notifier).setBranch(id, br.name);
                _loadProducts();
                _loadShift();
              },
            ),
          IconButton(
            icon: Badge(
              isLabelVisible: _shift != null,
              child: const Icon(Icons.access_time_outlined),
            ),
            tooltip: 'Shifts',
            onPressed: _showShiftDialog,
          ),
          IconButton(
            icon: Badge(
              label: _parkedCount > 0 ? Text('$_parkedCount') : null,
              child: const Icon(Icons.pause_circle_outline),
            ),
            tooltip: 'Parked Sales',
            onPressed: () => context.push('/pos/parked'),
          ),
          IconButton(
            icon: const Icon(Icons.receipt_long_outlined),
            tooltip: 'Sales History',
            onPressed: () => context.push('/pos/history'),
          ),
          IconButton(
            icon: const Icon(Icons.people_outline),
            tooltip: 'Customers',
            onPressed: () => context.push('/customers'),
          ),
        ],
      ),
      body: isTablet
          ? Row(children: [
              Expanded(flex: 3, child: _buildProductsSection()),
              Expanded(flex: 2, child: _buildCartPanel(cart)),
            ])
          : DefaultTabController(
              length: 2,
              child: Column(
                children: [
                  TabBar(
                    labelColor: scheme.primary,
                    unselectedLabelColor: scheme.onSurfaceVariant,
                    indicatorColor: scheme.primary,
                    tabs: [
                      const Tab(icon: Icon(Icons.grid_view_outlined), text: 'Products'),
                      Tab(
                        icon: Badge(
                          label: cart.itemCount > 0 ? Text('${cart.itemCount}') : null,
                          child: const Icon(Icons.shopping_cart_outlined),
                        ),
                        text: 'Cart',
                      ),
                    ],
                  ),
                  Expanded(
                    child: TabBarView(children: [
                      _buildProductsSection(),
                      _buildCartPanel(cart),
                    ]),
                  ),
                ],
              ),
            ),
    );
  }

  // ── Products section ─────────────────────────────────────────────

  Widget _buildProductsSection() {
    final scheme = Theme.of(context).colorScheme;
    return Container(
      color: scheme.surface,
      child: Column(
        children: [
          // Search bar
          Padding(
            padding: const EdgeInsets.fromLTRB(12, 12, 12, 4),
            child: Row(
              children: [
                Expanded(
                  child: TextField(
                    controller: _searchController,
                    decoration: InputDecoration(
                      hintText: 'Search products…',
                      prefixIcon: const Icon(Icons.search, size: 20),
                      suffixIcon: _searchQuery.isNotEmpty
                          ? IconButton(
                              icon: const Icon(Icons.close, size: 18),
                              onPressed: () {
                                _searchController.clear();
                                setState(() { _searchQuery = ''; _page = 1; });
                              },
                            )
                          : null,
                      isDense: true,
                      contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
                    ),
                    onChanged: (v) => setState(() { _searchQuery = v.toLowerCase(); _page = 1; }),
                    onSubmitted: (_) => _quickAddByBarcode(),
                  ),
                ),
                const SizedBox(width: 8),
                _IconToggle(
                  active: !_isGridView,
                  icon: _isGridView ? Icons.view_list_outlined : Icons.grid_view_outlined,
                  tooltip: _isGridView ? 'List view' : 'Grid view',
                  onTap: () => setState(() => _isGridView = !_isGridView),
                ),
              ],
            ),
          ),
          // Category chips
          if (_categories.isNotEmpty)
            SizedBox(
              height: 40,
              child: ListView(
                scrollDirection: Axis.horizontal,
                padding: const EdgeInsets.symmetric(horizontal: 12),
                children: [
                  _CategoryChip(
                    label: 'All',
                    selected: _activeCategory == null,
                    onTap: () => setState(() { _activeCategory = null; _page = 1; }),
                  ),
                  ..._categories.map((c) => _CategoryChip(
                    label: c,
                    selected: _activeCategory == c,
                    onTap: () => setState(() { _activeCategory = c; _page = 1; }),
                  )),
                ],
              ),
            ),
          const SizedBox(height: 4),
          // Products
          if (_loading)
            const Expanded(child: LoadingWidget())
          else
            Expanded(
              child: _filteredProducts.isEmpty
                  ? const EmptyState(
                      icon: Icons.inventory_2_outlined,
                      title: 'No products found',
                      message: 'Try a different search or category.',
                    )
                  : _isGridView ? _buildProductGrid() : _buildProductList(),
            ),
          // Pagination
          if (!_loading && _filteredProducts.isNotEmpty)
            _buildPaginationBar(),
        ],
      ),
    );
  }

  Widget _buildProductGrid() {
    return GridView.builder(
      padding: const EdgeInsets.fromLTRB(12, 4, 12, 8),
      itemCount: _paginatedProducts.length,
      gridDelegate: const SliverGridDelegateWithMaxCrossAxisExtent(
        maxCrossAxisExtent: 180,
        childAspectRatio: 1.05,
        crossAxisSpacing: 10,
        mainAxisSpacing: 10,
      ),
      itemBuilder: (context, index) {
        final product = _paginatedProducts[index];
        return _ProductCard(
          product: product,
          currency: _currency,
          onTap: () => _addToCart(product),
        );
      },
    );
  }

  Widget _buildProductList() {
    final scheme = Theme.of(context).colorScheme;
    return ListView.builder(
      padding: const EdgeInsets.fromLTRB(12, 4, 12, 8),
      itemCount: _paginatedProducts.length,
      itemBuilder: (context, index) {
        final product = _paginatedProducts[index];
        final stock = _stockOf(product);
        final outOfStock = stock <= 0 && product.trackInventory;
        return Padding(
          padding: const EdgeInsets.only(bottom: 8),
          child: Material(
            color: scheme.surfaceContainerLow,
            borderRadius: BorderRadius.circular(12),
            clipBehavior: Clip.antiAlias,
            child: InkWell(
              onTap: outOfStock ? null : () => _addToCart(product),
              child: Padding(
                padding: const EdgeInsets.all(10),
                child: Row(
                  children: [
                    ClipRRect(
                      borderRadius: BorderRadius.circular(10),
                      child: product.image != null
                          ? Image.network(product.image!, width: 36, height: 36, fit: BoxFit.cover,
                              errorBuilder: (_, __, ___) => _imgPlaceholder(scheme, 36))
                          : _imgPlaceholder(scheme, 36),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(product.name, maxLines: 1, overflow: TextOverflow.ellipsis,
                              style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 14)),
                          const SizedBox(height: 2),
                          Text(
                            product.sku.isNotEmpty ? product.sku : '—',
                            style: TextStyle(fontSize: 12, color: scheme.onSurfaceVariant),
                          ),
                          if (product.trackInventory)
                            Text(
                              stock <= 0 ? 'Out of stock' : '${stock.toInt()} in stock',
                              style: TextStyle(
                                fontSize: 11,
                                color: outOfStock ? scheme.error : (stock <= (product.reorderLevel ?? 0) && product.reorderLevel! > 0 ? Colors.orange : scheme.onSurfaceVariant),
                              ),
                            ),
                          ],
                        ),
                      ),
                    const SizedBox(width: 8),
                    Text(
                      Formatters.currency(product.retailPrice, _currency),
                      style: TextStyle(color: scheme.primary, fontWeight: FontWeight.bold, fontSize: 14),
                    ),
                  ],
                ),
              ),
            ),
          ),
        );
      },
    );
  }

  Widget _imgPlaceholder(ColorScheme scheme, double size) {
    return Container(
      width: size, height: size,
      color: scheme.primaryContainer.withOpacity(0.3),
      child: Icon(Icons.inventory_2_outlined, color: scheme.primary, size: 6),
    );
  }

  Widget _buildPaginationBar() {
    final scheme = Theme.of(context).colorScheme;
    final start = (_page - 1) * _pageSize + 1;
    final end = min(_page * _pageSize, _filteredProducts.length);
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
      decoration: BoxDecoration(
        color: scheme.surfaceContainerLow,
        border: Border(top: BorderSide(color: scheme.outlineVariant.withOpacity(0.5))),
      ),
      child: Row(
        children: [
          Text(
            _filteredProducts.isEmpty ? '0 of 0' : '$start–$end of ${_filteredProducts.length}',
            style: TextStyle(fontSize: 12, color: scheme.onSurfaceVariant),
          ),
          const Spacer(),
          // page size
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
            decoration: BoxDecoration(
              color: scheme.surfaceContainerHighest,
              borderRadius: BorderRadius.circular(8),
            ),
            child: DropdownButtonHideUnderline(
              child: DropdownButton<int>(
                value: _pageSize,
                isDense: true,
                style: TextStyle(fontSize: 12, color: scheme.onSurface),
                items: [12, 24, 48, 96].map((s) => DropdownMenuItem(value: s, child: Text('$s'))).toList(),
                onChanged: (v) => setState(() { _pageSize = v ?? 24; _page = 1; }),
              ),
            ),
          ),
          IconButton(
            icon: const Icon(Icons.chevron_left, size: 20),
            visualDensity: VisualDensity.compact,
            onPressed: _page > 1 ? () => setState(() => _page--) : null,
          ),
          Text('$_page/$_pageCount', style: TextStyle(fontSize: 13, fontWeight: FontWeight.w600, color: scheme.onSurface)),
          IconButton(
            icon: const Icon(Icons.chevron_right, size: 20),
            visualDensity: VisualDensity.compact,
            onPressed: _page < _pageCount ? () => setState(() => _page++) : null,
          ),
        ],
      ),
    );
  }

  // ── Cart panel ───────────────────────────────────────────────────

  Widget _buildCartPanel(CartState cart) {
    final scheme = Theme.of(context).colorScheme;
    final isTablet = MediaQuery.of(context).size.width > 600;
    return Container(
      decoration: BoxDecoration(
        color: scheme.surfaceContainerLow,
        border: isTablet
            ? Border(left: BorderSide(color: scheme.outlineVariant.withOpacity(0.5)))
            : null,
      ),
      child: Column(
        children: [
          // Cart header
          Padding(
            padding: const EdgeInsets.fromLTRB(16, 14, 12, 14),
            child: Row(
              children: [
                Icon(Icons.shopping_cart_outlined, size: 22, color: scheme.primary),
                const SizedBox(width: 8),
                Text('Current Sale', style: Theme.of(context).textTheme.titleMedium?.copyWith(fontWeight: FontWeight.bold)),
                const Spacer(),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                  decoration: BoxDecoration(
                    color: scheme.primaryContainer,
                    borderRadius: BorderRadius.circular(20),
                  ),
                  child: Text(
                    '${cart.itemCount} item${cart.itemCount == 1 ? '' : 's'}',
                    style: TextStyle(fontSize: 12, fontWeight: FontWeight.w600, color: scheme.onPrimaryContainer),
                  ),
                ),
              ],
            ),
          ),
          // Customer name
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 12),
            child: TextField(
              controller: _customerNameController,
              decoration: InputDecoration(
                hintText: 'Walk-in customer',
                prefixIcon: const Icon(Icons.person_outline, size: 20),
                isDense: true,
                contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
              ),
              onChanged: (v) => ref.read(cartProvider.notifier).setCustomerName(v),
            ),
          ),
          // Cart items
          Expanded(
            child: cart.isEmpty
                ? const EmptyState(
                    icon: Icons.shopping_cart_outlined,
                    title: 'Cart is empty',
                    message: 'Tap a product to start a sale.',
                  )
                : ListView.builder(
                    padding: const EdgeInsets.fromLTRB(12, 8, 12, 8),
                    itemCount: cart.items.length,
                    itemBuilder: (context, index) {
                      final item = cart.items[index];
                      return _CartRow(
                        item: item,
                        currency: _currency,
                        onInc: () => ref.read(cartProvider.notifier).incItem(index),
                        onDec: () => ref.read(cartProvider.notifier).decItem(index),
                        onRemove: () => ref.read(cartProvider.notifier).removeItem(index),
                      );
                    },
                  ),
          ),
          // Cart footer
          if (!cart.isEmpty) _buildCartFooter(cart),
        ],
      ),
    );
  }

  Widget _buildCartFooter(CartState cart) {
    final scheme = Theme.of(context).colorScheme;
    return Container(
      padding: const EdgeInsets.fromLTRB(16, 12, 16, 16),
      decoration: BoxDecoration(
        color: scheme.surface,
        border: Border(top: BorderSide(color: scheme.outlineVariant.withOpacity(0.5))),
      ),
      child: Column(
        children: [
          // Totals
          _totalRow('Subtotal', Formatters.currency(cart.subtotal, _currency)),
          const SizedBox(height: 4),
          // Discount
          Row(
            children: [
              Text('Discount', style: TextStyle(fontSize: 13, color: scheme.onSurfaceVariant)),
              const Spacer(),
              SizedBox(
                width: 110,
                child: TextField(
                  controller: _discountController,
                  decoration: InputDecoration(
                    prefixText: _currency,
                    isDense: true,
                    contentPadding: const EdgeInsets.symmetric(horizontal: 8, vertical: 8),
                    hintText: '0',
                    hintStyle: TextStyle(color: scheme.onSurfaceVariant.withOpacity(0.5)),
                  ),
                  keyboardType: TextInputType.number,
                  style: const TextStyle(fontSize: 13),
                  onChanged: (v) {
                    final val = double.tryParse(v) ?? 0;
                    ref.read(cartProvider.notifier).setDiscount(DiscountInfo(type: 'fixed', value: val));
                  },
                ),
              ),
            ],
          ),
          if (cart.discountAmount > 0) ...[
            const SizedBox(height: 2),
            _totalRow('Discount', '-${Formatters.currency(cart.discountAmount, _currency)}', color: Colors.green),
          ],
          const SizedBox(height: 4),
          _totalRow('Tax', Formatters.currency(cart.taxAmount, _currency)),
          const SizedBox(height: 8),
          // Total
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
            decoration: BoxDecoration(
              color: scheme.primaryContainer.withOpacity(0.5),
              borderRadius: BorderRadius.circular(12),
            ),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text('Total', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: scheme.onPrimaryContainer)),
                Text(
                  Formatters.currency(cart.total, _currency),
                  style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: scheme.primary),
                ),
              ],
            ),
          ),
          const SizedBox(height: 14),
          // Payment method selector
          Row(
            children: _paymentMethods.map((opt) {
              final isSelected = cart.paymentMethod == opt.value;
              return Expanded(
                child: GestureDetector(
                  onTap: () => ref.read(cartProvider.notifier).setPaymentMethod(opt.value),
                  child: Container(
                    margin: EdgeInsets.only(right: opt == _paymentMethods.last ? 0 : 4),
                    padding: const EdgeInsets.symmetric(vertical: 8),
                    decoration: BoxDecoration(
                      color: isSelected ? scheme.primary : scheme.surfaceContainerHighest,
                      borderRadius: BorderRadius.circular(10),
                    ),
                    child: Column(
                      children: [
                        Icon(opt.icon, size: 18, color: isSelected ? Colors.white : scheme.onSurfaceVariant),
                        const SizedBox(height: 3),
                        Text(
                          opt.label,
                          style: TextStyle(
                            fontSize: 10,
                            fontWeight: isSelected ? FontWeight.bold : FontWeight.w500,
                            color: isSelected ? Colors.white : scheme.onSurfaceVariant,
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
              );
            }).toList(),
          ),
          const SizedBox(height: 14),
          // Actions
          Row(
            children: [
              FilledButton.tonalIcon(
                onPressed: () => _showHoldDialog(),
                icon: const Icon(Icons.pause_outlined, size: 18),
                label: const Text('Hold'),
                style: FilledButton.styleFrom(
                  padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                ),
              ),
              const SizedBox(width: 8),
              Expanded(
                child: FilledButton.icon(
                  onPressed: _checkingOut ? null : () => _showCheckoutDialog(),
                  icon: const Icon(Icons.payments, size: 20),
                  label: Text(
                    'Charge ${Formatters.currency(cart.total, _currency)}',
                    style: const TextStyle(fontWeight: FontWeight.bold),
                  ),
                  style: FilledButton.styleFrom(
                    padding: const EdgeInsets.symmetric(vertical: 14),
                  ),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _totalRow(String label, String value, {Color? color}) {
    final scheme = Theme.of(context).colorScheme;
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(label, style: TextStyle(fontSize: 13, color: color ?? scheme.onSurfaceVariant)),
        Text(value, style: TextStyle(fontSize: 13, fontWeight: FontWeight.w600, color: color ?? scheme.onSurface)),
      ],
    );
  }

  // ── Checkout dialog ──────────────────────────────────────────────

  void _showCheckoutDialog() {
    final cart = ref.read(cartProvider);
    if (cart.isEmpty) return;

    double tendered = 0;
    final mpesaPhoneCtrl = TextEditingController(text: cart.customerPhone);
    final cardRefCtrl = TextEditingController();
    final insuranceProviderCtrl = TextEditingController();
    final insuranceMemberCtrl = TextEditingController();
    final creditDueDateCtrl = TextEditingController();
    double creditPartial = 0;

    final quickCashOptions = [
      cart.total.ceil(),
      (cart.total / 100).ceil() * 100,
      (cart.total / 500).ceil() * 500,
      (cart.total / 1000).ceil() * 1000,
    ];

    showDialog(
      context: context,
      builder: (dialogContext) {
        return StatefulBuilder(builder: (dialogContext, setDialogState) {
          final scheme = Theme.of(dialogContext).colorScheme;
          final change = tendered - cart.total;
          final canComplete = cart.paymentMethod == 'cash'
              ? tendered >= cart.total
              : cart.paymentMethod == 'credit' ? cart.customerName.isNotEmpty : true;

          return AlertDialog(
            title: const Text('Complete Payment'),
            titleTextStyle: TextStyle(fontSize: 20, fontWeight: FontWeight.bold, color: scheme.onSurface),
            content: SizedBox(
              width: double.maxFinite,
              child: SingleChildScrollView(
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    // Total banner
                    Container(
                      width: double.infinity,
                      padding: const EdgeInsets.all(20),
                      decoration: BoxDecoration(
                        color: scheme.primaryContainer.withOpacity(0.4),
                        borderRadius: BorderRadius.circular(16),
                      ),
                      child: Column(
                        children: [
                          Text('Total Due', style: TextStyle(fontSize: 13, color: scheme.onSurfaceVariant)),
                          const SizedBox(height: 4),
                          Text(
                            Formatters.currency(cart.total, _currency),
                            style: TextStyle(fontSize: 34, fontWeight: FontWeight.bold, color: scheme.primary),
                          ),
                          const SizedBox(height: 6),
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
                            decoration: BoxDecoration(
                              color: scheme.primary.withOpacity(0.1),
                              borderRadius: BorderRadius.circular(20),
                            ),
                            child: Text(
                              _paymentMethods.firstWhere((m) => m.value == cart.paymentMethod).label,
                              style: TextStyle(fontSize: 12, fontWeight: FontWeight.w600, color: scheme.primary),
                            ),
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(height: 16),
                    // Customer
                    Autocomplete<Customer>(
                      displayStringForOption: (c) => c.fullName,
                      optionsBuilder: (textEditingValue) {
                        if (textEditingValue.text.isEmpty) return const Iterable.empty();
                        return _customers.where((c) => c.fullName.toLowerCase().contains(textEditingValue.text.toLowerCase())).take(10);
                      },
                      initialValue: TextEditingValue(text: cart.customerName),
                      fieldViewBuilder: (context, ctrl, focusNode, onFieldSubmitted) {
                        return TextField(
                          controller: ctrl,
                          focusNode: focusNode,
                          onSubmitted: (_) => onFieldSubmitted(),
                          decoration: const InputDecoration(
                            labelText: 'Customer',
                            prefixIcon: Icon(Icons.person_outline, size: 20),
                            isDense: true,
                          ),
                          onChanged: (v) => ref.read(cartProvider.notifier).setCustomerName(v),
                        );
                      },
                      onSelected: (c) {
                        ref.read(cartProvider.notifier).setCustomer(c);
                        mpesaPhoneCtrl.text = c.phone ?? '';
                      },
                    ),
                    const SizedBox(height: 8),
                    TextField(
                      controller: mpesaPhoneCtrl,
                      decoration: const InputDecoration(
                        labelText: 'Phone',
                        prefixIcon: Icon(Icons.phone_outlined, size: 20),
                        isDense: true,
                      ),
                      onChanged: (v) => ref.read(cartProvider.notifier).setCustomerPhone(v),
                    ),
                    const SizedBox(height: 16),
                    // Method-specific UI
                    if (cart.paymentMethod == 'cash') ...[
                      _SectionLabel('Cash Received'),
                      const SizedBox(height: 8),
                      Wrap(
                        spacing: 6,
                        children: quickCashOptions.map((amt) {
                          return ActionChip(
                            label: Text(Formatters.currency(amt.toDouble(), _currency)),
                            onPressed: () => setDialogState(() => tendered = amt.toDouble()),
                          );
                        }).toList(),
                      ),
                      const SizedBox(height: 8),
                      TextField(
                        decoration: InputDecoration(
                          labelText: 'Amount received',
                          prefixText: _currency,
                          isDense: true,
                        ),
                        keyboardType: TextInputType.number,
                        onChanged: (v) => setDialogState(() => tendered = double.tryParse(v) ?? 0),
                      ),
                      const SizedBox(height: 10),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                        decoration: BoxDecoration(
                          color: change > 0 ? Colors.green.withOpacity(0.1) : scheme.surfaceContainerHighest,
                          borderRadius: BorderRadius.circular(12),
                        ),
                        child: Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Text('Change', style: TextStyle(fontSize: 14, color: scheme.onSurfaceVariant)),
                            Text(
                              Formatters.currency(max(0, change), _currency),
                              style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: change > 0 ? Colors.green : scheme.onSurface),
                            ),
                          ],
                        ),
                      ),
                    ],
                    if (cart.paymentMethod == 'mpesa') ...[
                      TextField(
                        controller: mpesaPhoneCtrl,
                        decoration: const InputDecoration(
                          labelText: 'Customer M-Pesa phone (optional)',
                          prefixIcon: Icon(Icons.phone_android, size: 20),
                          isDense: true,
                        ),
                      ),
                      const SizedBox(height: 8),
                      _InfoBanner('Confirm payment was received before completing the sale.', scheme),
                    ],
                    if (cart.paymentMethod == 'card') ...[
                      TextField(
                        controller: cardRefCtrl,
                        decoration: const InputDecoration(
                          labelText: 'Card reference / last 4 digits',
                          prefixIcon: Icon(Icons.credit_card, size: 20),
                          isDense: true,
                        ),
                      ),
                    ],
                    if (cart.paymentMethod == 'insurance') ...[
                      TextField(
                        controller: insuranceProviderCtrl,
                        decoration: const InputDecoration(
                          labelText: 'Insurance provider',
                          prefixIcon: Icon(Icons.shield_outlined, size: 20),
                          isDense: true,
                        ),
                      ),
                      const SizedBox(height: 8),
                      TextField(
                        controller: insuranceMemberCtrl,
                        decoration: const InputDecoration(labelText: 'Member number', isDense: true),
                      ),
                    ],
                    if (cart.paymentMethod == 'credit') ...[
                      TextField(
                        controller: creditDueDateCtrl,
                        decoration: const InputDecoration(labelText: 'Due date', isDense: true, suffixIcon: Icon(Icons.calendar_today_outlined, size: 18)),
                        readOnly: true,
                        onTap: () async {
                          final date = await showDatePicker(
                            context: dialogContext,
                            initialDate: DateTime.now().add(const Duration(days: 30)),
                            firstDate: DateTime.now(),
                            lastDate: DateTime.now().add(const Duration(days: 365)),
                          );
                          if (date != null) creditDueDateCtrl.text = date.toIso8601String().split('T')[0];
                        },
                      ),
                      const SizedBox(height: 8),
                      TextField(
                        decoration: InputDecoration(labelText: 'Partial payment (optional)', prefixText: _currency, isDense: true),
                        keyboardType: TextInputType.number,
                        onChanged: (v) => creditPartial = double.tryParse(v) ?? 0,
                      ),
                      const SizedBox(height: 8),
                      _InfoBanner('Balance on credit: ${Formatters.currency(max(0, cart.total - creditPartial), _currency)}', scheme),
                    ],
                  ],
                ),
              ),
            ),
            actions: [
              TextButton(onPressed: () => Navigator.pop(dialogContext), child: const Text('Cancel')),
              FilledButton.icon(
                icon: const Icon(Icons.check_circle_outline, size: 20),
                label: const Text('Complete Sale', style: TextStyle(fontWeight: FontWeight.bold)),
                onPressed: _checkingOut || !canComplete
                    ? null
                    : () async {
                        final success = await _completeCheckout(
                          tendered: tendered,
                          change: max(0, tendered - cart.total),
                          mpesaPhone: mpesaPhoneCtrl.text,
                          cardRef: cardRefCtrl.text,
                          insuranceProvider: insuranceProviderCtrl.text,
                          insuranceMember: insuranceMemberCtrl.text,
                          creditDueDate: creditDueDateCtrl.text,
                          creditPartial: creditPartial,
                        );
                        if (mounted && success) {
                          Navigator.pop(dialogContext);
                          _showReceiptDialog();
                        }
                      },
              ),
            ],
          );
        });
      },
    );
  }

  Future<bool> _completeCheckout({
    required double tendered,
    required double change,
    required String mpesaPhone,
    required String cardRef,
    required String insuranceProvider,
    required String insuranceMember,
    required String creditDueDate,
    required double creditPartial,
  }) async {
    final cart = ref.read(cartProvider);
    setState(() => _checkingOut = true);
    try {
      if (cart.branchId == null) {
        await _loadBranches();
        if (ref.read(cartProvider).branchId == null) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(content: Text('No branch available. Please contact support.')),
          );
          return false;
        }
      }

      String paymentRef = '';
      if (cart.paymentMethod == 'mpesa') {
        paymentRef = 'M-Pesa: $mpesaPhone';
      } else if (cart.paymentMethod == 'card') {
        paymentRef = 'Card: $cardRef';
      } else if (cart.paymentMethod == 'insurance') {
        paymentRef = 'Insurance: $insuranceProvider / $insuranceMember';
      } else if (cart.paymentMethod == 'credit') {
        paymentRef = 'Due: $creditDueDate / Partial: $creditPartial';
      }

      double round2(double v) => (v * 100).round() / 100;
      double round3(double v) => (v * 1000).round() / 1000;

      final body = {
        'branch': ref.read(cartProvider).branchId,
        'customer_name': cart.customerName.isNotEmpty ? cart.customerName : 'Walk-in',
        'customer_phone': cart.customerPhone,
        'subtotal': round2(cart.subtotal),
        'discount': round2(cart.discountAmount),
        'tax': round2(cart.taxAmount),
        'total': round2(cart.total),
        'payment_method': cart.paymentMethod,
        'payment_reference': paymentRef,
        'status': 'completed',
        'items': cart.items.map((i) => {
              'product': i.id,
              'product_name': i.name,
              'quantity': round3(i.qty),
              'unit_price': round2(double.tryParse(i.price) ?? 0),
              'line_total': round2((double.tryParse(i.price) ?? 0) * i.qty),
            }).toList(),
      };

      final api = ref.read(apiClientProvider);
      final res = await api.post('/pos/transactions/', data: body);

      _lastTransaction = {
        'transaction_number': (res.data as Map<String, dynamic>)['transaction_number'] ?? '',
        'items': cart.items.map((i) => {'name': i.name, 'qty': i.qty, 'price': double.tryParse(i.price) ?? 0}).toList(),
        'subtotal': cart.subtotal,
        'discount': cart.discountAmount,
        'tax': cart.taxAmount,
        'total': cart.total,
        'payment_method': cart.paymentMethod,
        'tendered': cart.paymentMethod == 'cash' ? tendered : null,
        'change': cart.paymentMethod == 'cash' ? change : null,
        'payment_reference': paymentRef,
        'customer_name': cart.customerName,
        'customer_phone': cart.customerPhone,
        'branch_name': cart.branchName,
      };

      ref.read(cartProvider.notifier).clearCart();
      _discountController.clear();
      _customerNameController.clear();

      await Future.wait([_loadProducts(), _loadTodayStats(), _loadParkedCount(), _loadShift()]);
      return true;
    } catch (e) {
      String msg = 'Checkout failed';
      if (e is Exception) msg = e.toString().replaceAll('Exception: ', '');
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(msg)));
      }
      return false;
    } finally {
      if (mounted) setState(() => _checkingOut = false);
    }
  }

  // ── Receipt dialog ───────────────────────────────────────────────

  void _showReceiptDialog() {
    final tx = _lastTransaction;
    if (tx == null) return;
    final auth = ref.read(authProvider);
    final scheme = Theme.of(context).colorScheme;

    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (context) {
        return AlertDialog(
          content: SingleChildScrollView(
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                Container(
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(color: Colors.green.withOpacity(0.1), shape: BoxShape.circle),
                  child: const Icon(Icons.check, color: Colors.green, size: 32),
                ),
                const SizedBox(height: 12),
                Text('Sale Completed', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: scheme.onSurface)),
                Text(tx['transaction_number'] as String, style: TextStyle(fontSize: 13, color: scheme.onSurfaceVariant)),
                const SizedBox(height: 16),
                ReceiptWidget(
                  number: tx['transaction_number'] as String,
                  items: (tx['items'] as List).map((i) => ReceiptItem(
                    name: (i as Map<String, dynamic>)['name'] as String,
                    qty: (i['qty'] as num).toDouble(),
                    price: (i['price'] as num).toDouble(),
                  )).toList(),
                  subtotal: tx['subtotal'] as double,
                  discount: tx['discount'] as double,
                  tax: tx['tax'] as double,
                  total: tx['total'] as double,
                  paymentMethod: tx['payment_method'] as String,
                  tendered: tx['tendered'] as double?,
                  change: tx['change'] as double?,
                  paymentReference: tx['payment_reference'] as String,
                  cashierName: auth.user?.fullName,
                  customerName: tx['customer_name'] as String?,
                  customerPhone: tx['customer_phone'] as String?,
                  branchName: tx['branch_name'] as String?,
                  businessName: auth.tenant?.name,
                  currency: _currency,
                ),
              ],
            ),
          ),
          actions: [
            TextButton.icon(
              onPressed: () {
                Navigator.pop(context);
                _shareReceipt();
              },
              icon: const Icon(Icons.share_outlined, size: 20),
              label: const Text('Share'),
            ),
            FilledButton(
              onPressed: () {
                Navigator.pop(context);
                setState(() => _lastTransaction = null);
              },
              child: const Text('New Sale'),
            ),
          ],
        );
      },
    );
  }

  void _shareReceipt() {
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(content: Text('Sharing receipt…'), duration: Duration(seconds: 1)),
    );
  }

  // ── Hold / Park dialog ────────────────────────────────────────────

  void _showHoldDialog() {
    final cart = ref.read(cartProvider);
    if (cart.isEmpty) return;
    final scheme = Theme.of(context).colorScheme;

    final holdCustomerCtrl = TextEditingController(text: cart.customerName);
    final holdPhoneCtrl = TextEditingController(text: cart.customerPhone);
    final holdNotesCtrl = TextEditingController();

    showDialog(
      context: context,
      builder: (context) {
        return AlertDialog(
          title: const Row(children: [
            Icon(Icons.pause_circle_outline, color: Colors.orange),
            SizedBox(width: 8),
            Text('Hold Sale'),
          ]),
          content: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              TextField(
                controller: holdCustomerCtrl,
                decoration: const InputDecoration(labelText: 'Customer name', isDense: true,
                    prefixIcon: Icon(Icons.person_outline, size: 20)),
              ),
              const SizedBox(height: 8),
              TextField(
                controller: holdPhoneCtrl,
                decoration: const InputDecoration(labelText: 'Phone (optional)', isDense: true,
                    prefixIcon: Icon(Icons.phone_outlined, size: 20)),
              ),
              const SizedBox(height: 8),
              TextField(
                controller: holdNotesCtrl,
                decoration: const InputDecoration(labelText: 'Notes (optional)', isDense: true),
                maxLines: 2,
              ),
              const SizedBox(height: 12),
              _InfoBanner('Items: ${cart.itemCount}  ·  Total: ${Formatters.currency(cart.total, _currency)}', scheme),
            ],
          ),
          actions: [
            TextButton(onPressed: () => Navigator.pop(context), child: const Text('Cancel')),
            FilledButton.tonalIcon(
              onPressed: () async {
                Navigator.pop(context);
                await _confirmHold(customer: holdCustomerCtrl.text, phone: holdPhoneCtrl.text, notes: holdNotesCtrl.text);
              },
              icon: const Icon(Icons.pause, size: 18),
              label: const Text('Hold Sale'),
            ),
          ],
        );
      },
    );
  }

  Future<void> _confirmHold({required String customer, required String phone, required String notes}) async {
    final cart = ref.read(cartProvider);
    try {
      final api = ref.read(apiClientProvider);
      await api.post('/pos/parked-sales/', data: {
        'branch': cart.branchId,
        'customer_name': customer.isNotEmpty ? customer : (cart.customerName.isNotEmpty ? cart.customerName : 'Walk-in'),
        'customer_phone': phone.isNotEmpty ? phone : cart.customerPhone,
        'notes': notes,
        'items_data': cart.items.map((i) => {
              'id': i.id, 'name': i.name, 'price': i.price, 'qty': i.qty, 'max': i.max,
              'sku': i.sku, 'tax_rate': i.taxRate, 'image': i.image,
            }).toList(),
        'total': cart.total,
      });
      ref.read(cartProvider.notifier).clearCart();
      _discountController.clear();
      _customerNameController.clear();
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Sale parked'), duration: Duration(seconds: 2)),
        );
      }
      _loadParkedCount();
    } catch (_) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Failed to park sale')));
      }
    }
  }

  // ── Shift dialog ────────────────────────────────────────────────

  void _showShiftDialog() {
    final scheme = Theme.of(context).colorScheme;
    final shiftOpeningFloatCtrl = TextEditingController();
    bool openingShift = false;

    showDialog(
      context: context,
      builder: (dialogContext) {
        return StatefulBuilder(builder: (context, setDialogState) {
          return AlertDialog(
            title: Row(children: [
              Icon(Icons.access_time, color: scheme.primary),
              const SizedBox(width: 8),
              Text(_shift != null ? 'Shift Info' : 'Open Shift'),
            ]),
            content: _shift != null
                ? Column(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Container(
                        padding: const EdgeInsets.all(12),
                        decoration: BoxDecoration(color: Colors.green.withOpacity(0.1), borderRadius: BorderRadius.circular(12)),
                        child: Row(children: [
                          Container(
                            width: 8, height: 8,
                            decoration: const BoxDecoration(color: Colors.green, shape: BoxShape.circle),
                          ),
                          const SizedBox(width: 8),
                          Text('Active: ${_shift!.reference}', style: const TextStyle(fontWeight: FontWeight.w600)),
                        ]),
                      ),
                      const SizedBox(height: 12),
                      _shiftInfoRow('Opened', Formatters.dateTime(_shift!.openedAt)),
                      _shiftInfoRow('Duration', _shift!.duration),
                      _shiftInfoRow('Opening Float', Formatters.currency(_shift!.openingFloat, _currency)),
                      _shiftInfoRow('Transactions', '${_shift!.transactionCount}'),
                      _shiftInfoRow('Gross Revenue', Formatters.currency(_shift!.grossRevenue, _currency)),
                    ],
                  )
                : Column(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Icon(Icons.access_time, size: 40, color: scheme.onSurfaceVariant.withOpacity(0.5)),
                      const SizedBox(height: 8),
                      Text('No active shift. Enter opening float to start.',
                          style: TextStyle(color: scheme.onSurfaceVariant), textAlign: TextAlign.center),
                      const SizedBox(height: 16),
                      TextField(
                        controller: shiftOpeningFloatCtrl,
                        decoration: InputDecoration(labelText: 'Opening float', prefixText: _currency, isDense: true),
                        keyboardType: TextInputType.number,
                      ),
                    ],
                  ),
            actions: [
              TextButton(onPressed: () => Navigator.pop(context), child: const Text('Close')),
              if (_shift == null)
                FilledButton(
                  onPressed: openingShift ? null : () async {
                    setDialogState(() => openingShift = true);
                    try {
                      final api = ref.read(apiClientProvider);
                      final cart = ref.read(cartProvider);
                      final res = await api.post('/pos/shifts/', data: {
                        'branch': cart.branchId,
                        'opening_float': double.tryParse(shiftOpeningFloatCtrl.text) ?? 0,
                      });
                      setState(() => _shift = PosShift.fromJson(res.data as Map<String, dynamic>));
                      if (mounted) Navigator.pop(context);
                      if (mounted) {
                        ScaffoldMessenger.of(this.context).showSnackBar(
                          const SnackBar(content: Text('Shift opened'), duration: Duration(seconds: 2)),
                        );
                      }
                    } catch (e) {
                      if (mounted) {
                        ScaffoldMessenger.of(this.context).showSnackBar(SnackBar(content: Text('Failed to open shift: $e')));
                      }
                    } finally {
                      setDialogState(() => openingShift = false);
                    }
                  },
                  child: const Text('Open Shift'),
                ),
            ],
          );
        });
      },
    );
  }

  Widget _shiftInfoRow(String label, String value) {
    final scheme = Theme.of(context).colorScheme;
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 5),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(label, style: TextStyle(fontSize: 14, color: scheme.onSurfaceVariant)),
          Text(value, style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w600)),
        ],
      ),
    );
  }
}

// ── Product Card ───────────────────────────────────────────────────

class _ProductCard extends StatelessWidget {
  final Product product;
  final String currency;
  final VoidCallback onTap;

  const _ProductCard({required this.product, required this.currency, required this.onTap});

  @override
  Widget build(BuildContext context) {
    final scheme = Theme.of(context).colorScheme;
    final stock = product.stockOnHand ?? 0;
    final outOfStock = stock <= 0 && product.trackInventory;
    final reorderLevel = product.reorderLevel ?? 0;
    final lowStock = product.trackInventory && reorderLevel > 0 && stock > 0 && stock <= reorderLevel;

    return Material(
      color: scheme.surfaceContainerLow,
      borderRadius: BorderRadius.circular(14),
      clipBehavior: Clip.antiAlias,
      child: InkWell(
        onTap: outOfStock ? null : onTap,
        child: Opacity(
          opacity: outOfStock ? 0.5 : 1,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Image (compact)
              SizedBox(
                height: 30,
                width: double.infinity,
                child: Stack(
                  fit: StackFit.expand,
                  children: [
                    product.image != null
                        ? Image.network(product.image!, fit: BoxFit.cover,
                            errorBuilder: (_, __, ___) => _placeholder(scheme))
                        : _placeholder(scheme),
                    if (outOfStock || lowStock)
                      Positioned(
                        top: 4, right: 4,
                        child: Container(
                          padding: const EdgeInsets.symmetric(horizontal: 5, vertical: 2),
                          decoration: BoxDecoration(
                            color: outOfStock ? Colors.red : Colors.orange,
                            borderRadius: BorderRadius.circular(5),
                          ),
                          child: Text(
                            outOfStock ? 'Out' : 'Low',
                            style: const TextStyle(color: Colors.white, fontSize: 8, fontWeight: FontWeight.bold),
                          ),
                        ),
                      ),
                  ],
                ),
              ),
              // Info
              Expanded(
                child: Padding(
                  padding: const EdgeInsets.fromLTRB(8, 8, 8, 10),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      product.name,
                      maxLines: 2,
                      overflow: TextOverflow.ellipsis,
                      style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w600, height: 1.2),
                    ),
                    const SizedBox(height: 6),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Flexible(
                          child: Text(
                            Formatters.currency(product.retailPrice, currency),
                            style: TextStyle(color: scheme.primary, fontWeight: FontWeight.bold, fontSize: 13),
                            overflow: TextOverflow.ellipsis,
                          ),
                        ),
                        if (product.trackInventory && stock > 0)
                          Text(
                            '${stock.toInt()}',
                            style: TextStyle(fontSize: 11, color: scheme.onSurfaceVariant),
                          ),
                      ],
                    ),
                  ],
                ),
              ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _placeholder(ColorScheme scheme) {
    return Container(
      color: scheme.primaryContainer.withOpacity(0.3),
      child: Center(child: Icon(Icons.inventory_2_outlined, color: scheme.primary, size: 6)),
    );
  }
}

// ── Cart Row ───────────────────────────────────────────────────────

class _CartRow extends StatelessWidget {
  final CartItem item;
  final String currency;
  final VoidCallback onInc;
  final VoidCallback onDec;
  final VoidCallback onRemove;

  const _CartRow({required this.item, required this.currency, required this.onInc, required this.onDec, required this.onRemove});

  @override
  Widget build(BuildContext context) {
    final scheme = Theme.of(context).colorScheme;
    final lineTotal = (double.tryParse(item.price) ?? 0) * item.qty;
    return Dismissible(
      key: ValueKey('${item.id}_${item.qty}'),
      direction: DismissDirection.endToStart,
      onDismissed: (_) => onRemove(),
      background: Container(
        alignment: Alignment.centerRight,
        padding: const EdgeInsets.only(right: 16),
        decoration: BoxDecoration(color: Colors.red, borderRadius: BorderRadius.circular(12)),
        child: const Icon(Icons.delete_outline, color: Colors.white),
      ),
      child: Container(
        margin: const EdgeInsets.only(bottom: 6),
        padding: const EdgeInsets.all(10),
        decoration: BoxDecoration(
          color: scheme.surface,
          borderRadius: BorderRadius.circular(12),
          border: Border.all(color: scheme.outlineVariant.withOpacity(0.3)),
        ),
        child: Row(
          children: [
            // Image / icon
            ClipRRect(
              borderRadius: BorderRadius.circular(8),
              child: item.image != null
                  ? Image.network(item.image!, width: 28, height: 28, fit: BoxFit.cover,
                      errorBuilder: (_, __, ___) => _itemIcon(scheme))
                  : _itemIcon(scheme),
            ),
            const SizedBox(width: 10),
            // Name + price
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(item.name, maxLines: 1, overflow: TextOverflow.ellipsis,
                      style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w600)),
                  const SizedBox(height: 2),
                  Text(Formatters.currency(item.price, currency),
                      style: TextStyle(fontSize: 11, color: scheme.onSurfaceVariant)),
                ],
              ),
            ),
            // Qty stepper
            Container(
              decoration: BoxDecoration(
                color: scheme.surfaceContainerHighest,
                borderRadius: BorderRadius.circular(8),
              ),
              child: Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  IconButton(
                    icon: const Icon(Icons.remove, size: 16),
                    visualDensity: VisualDensity.compact,
                    constraints: const BoxConstraints(minWidth: 28, minHeight: 28),
                    padding: EdgeInsets.zero,
                    onPressed: onDec,
                  ),
                  Text('${item.qty.toInt()}', style: const TextStyle(fontSize: 13, fontWeight: FontWeight.bold)),
                  IconButton(
                    icon: const Icon(Icons.add, size: 16),
                    visualDensity: VisualDensity.compact,
                    constraints: const BoxConstraints(minWidth: 28, minHeight: 28),
                    padding: EdgeInsets.zero,
                    onPressed: onInc,
                  ),
                ],
              ),
            ),
            const SizedBox(width: 8),
            // Line total
            SizedBox(
              width: 72,
              child: Text(
                Formatters.currency(lineTotal, currency),
                textAlign: TextAlign.right,
                style: TextStyle(fontSize: 13, fontWeight: FontWeight.bold, color: scheme.primary),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _itemIcon(ColorScheme scheme) {
    return Container(
      width: 28, height: 28,
      color: scheme.primaryContainer.withOpacity(0.3),
      child: Icon(Icons.inventory_2_outlined, size: 4, color: scheme.primary),
    );
  }
}

// ── Small UI components ───────────────────────────────────────────

class _PaymentOption {
  final String value;
  final String label;
  final IconData icon;
  const _PaymentOption(this.value, this.label, this.icon);
}

class _CategoryChip extends StatelessWidget {
  final String label;
  final bool selected;
  final VoidCallback onTap;
  const _CategoryChip({required this.label, required this.selected, required this.onTap});

  @override
  Widget build(BuildContext context) {
    final scheme = Theme.of(context).colorScheme;
    return Padding(
      padding: const EdgeInsets.only(right: 6),
      child: GestureDetector(
        onTap: onTap,
        child: Container(
          padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
          decoration: BoxDecoration(
            color: selected ? scheme.primary : scheme.surfaceContainerHighest,
            borderRadius: BorderRadius.circular(20),
          ),
          child: Text(
            label,
            style: TextStyle(
              fontSize: 12,
              fontWeight: selected ? FontWeight.bold : FontWeight.w500,
              color: selected ? Colors.white : scheme.onSurfaceVariant,
            ),
          ),
        ),
      ),
    );
  }
}

class _IconToggle extends StatelessWidget {
  final bool active;
  final IconData icon;
  final String tooltip;
  final VoidCallback onTap;
  const _IconToggle({required this.active, required this.icon, required this.tooltip, required this.onTap});

  @override
  Widget build(BuildContext context) {
    final scheme = Theme.of(context).colorScheme;
    return Tooltip(
      message: tooltip,
      child: Material(
        color: active ? scheme.primary : scheme.surfaceContainerHighest,
        borderRadius: BorderRadius.circular(12),
        child: InkWell(
          onTap: onTap,
          borderRadius: BorderRadius.circular(12),
          child: Container(
            padding: const EdgeInsets.all(10),
            child: Icon(icon, size: 20, color: active ? Colors.white : scheme.onSurfaceVariant),
          ),
        ),
      ),
    );
  }
}

class _BranchChip extends StatelessWidget {
  final List<Branch> branches;
  final int? selectedId;
  final ValueChanged<int> onSelect;
  const _BranchChip({required this.branches, required this.selectedId, required this.onSelect});

  @override
  Widget build(BuildContext context) {
    final scheme = Theme.of(context).colorScheme;
    final selected = branches.firstWhere((b) => b.id == selectedId, orElse: () => branches.first);
    return PopupMenuButton<int>(
      onSelected: onSelect,
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
        decoration: BoxDecoration(
          color: scheme.surfaceContainerHighest,
          borderRadius: BorderRadius.circular(20),
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(Icons.store_outlined, size: 16, color: scheme.primary),
            const SizedBox(width: 4),
            Text(selected.name, style: TextStyle(fontSize: 12, fontWeight: FontWeight.w600, color: scheme.onSurface)),
            const SizedBox(width: 2),
            Icon(Icons.keyboard_arrow_down, size: 16, color: scheme.onSurfaceVariant),
          ],
        ),
      ),
      itemBuilder: (context) => branches.map((b) => PopupMenuItem(
        value: b.id,
        child: Row(children: [
          Icon(b.id == selectedId ? Icons.check_circle : Icons.store_outlined, size: 18,
              color: b.id == selectedId ? scheme.primary : null),
          const SizedBox(width: 8),
          Text(b.name),
        ]),
      )).toList(),
    );
  }
}

class _SectionLabel extends StatelessWidget {
  final String text;
  const _SectionLabel(this.text);
  @override
  Widget build(BuildContext context) {
    return Align(
      alignment: Alignment.centerLeft,
      child: Text(text, style: Theme.of(context).textTheme.titleSmall?.copyWith(fontWeight: FontWeight.w600)),
    );
  }
}

class _InfoBanner extends StatelessWidget {
  final String text;
  final ColorScheme scheme;
  const _InfoBanner(this.text, this.scheme);
  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: scheme.primary.withOpacity(0.08),
        borderRadius: BorderRadius.circular(12),
      ),
      child: Text(text, style: TextStyle(fontSize: 13, color: scheme.onSurfaceVariant)),
    );
  }
}

// ── Extensions ───────────────────────────────────────────────────

extension _FirstWhereOrNullExt<T> on List<T> {
  T? firstWhereOrNull(bool Function(T) test) {
    for (final item in this) {
      if (test(item)) return item;
    }
    return null;
  }
}

extension _DateStringExt on DateTime {
  String toDateString() => '$year-$month-$day';
}
