/// Products screen — searchable product list with detail view.
/// Mirrors the web app's `/products` page.

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../core/formatters.dart';
import '../../models/index.dart';
import '../../providers/auth_provider.dart';
import '../../providers/data_providers.dart';
import '../../widgets/common.dart';

class ProductsScreen extends ConsumerStatefulWidget {
  const ProductsScreen({super.key});

  @override
  ConsumerState<ProductsScreen> createState() => _ProductsScreenState();
}

class _ProductsScreenState extends ConsumerState<ProductsScreen> {
  final _searchController = TextEditingController();
  String _searchQuery = '';
  String _viewMode = 'grid'; // 'grid' or 'list'

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final auth = ref.watch(authProvider);
    final currency = auth.billing?.currency ?? 'KSh';
    final params = _searchQuery.isNotEmpty ? {'search': _searchQuery} : <String, dynamic>{};
    final productsAsync = ref.watch(productsProvider(params));

    return Scaffold(
      appBar: AppBar(title: const Text('Products')),
      body: Column(
        children: [
          // Search bar
          Padding(
            padding: const EdgeInsets.all(12),
            child: TextField(
              controller: _searchController,
              decoration: InputDecoration(
                hintText: 'Search products by name, SKU, or barcode...',
                prefixIcon: const Icon(Icons.search),
                suffixIcon: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    if (_searchQuery.isNotEmpty)
                      IconButton(
                        icon: const Icon(Icons.clear),
                        onPressed: () {
                          _searchController.clear();
                          setState(() => _searchQuery = '');
                        },
                      ),
                    IconButton(
                      icon: Icon(_viewMode == 'grid' ? Icons.list : Icons.grid_view),
                      onPressed: () => setState(() => _viewMode = _viewMode == 'grid' ? 'list' : 'grid'),
                    ),
                  ],
                ),
                border: const OutlineInputBorder(),
              ),
              onChanged: (v) => setState(() => _searchQuery = v.toLowerCase()),
            ),
          ),
          Expanded(
            child: RefreshIndicator(
              onRefresh: () async => ref.invalidate(productsProvider(params)),
              child: productsAsync.when(
                loading: () => const LoadingWidget(),
                error: (e, _) => ErrorStateWidget(
                  message: 'Failed to load products',
                  onRetry: () => ref.invalidate(productsProvider(params)),
                ),
                data: (products) {
                  if (products.isEmpty) {
                    return EmptyState(
                      icon: Icons.inventory_2_outlined,
                      title: 'No products found',
                      message: _searchQuery.isNotEmpty
                          ? 'Try a different search term.'
                          : 'Add products to start selling.',
                    );
                  }
                  if (_viewMode == 'list') {
                    return ListView.builder(
                      itemCount: products.length,
                      itemBuilder: (context, index) => _ProductListTile(
                        product: products[index],
                        currency: currency,
                        onTap: () => _showProductDetail(products[index], currency),
                      ),
                    );
                  }
                  return GridView.builder(
                    padding: const EdgeInsets.symmetric(horizontal: 12),
                    itemCount: products.length,
                    gridDelegate: const SliverGridDelegateWithMaxCrossAxisExtent(
                      maxCrossAxisExtent: 200,
                      childAspectRatio: 0.7,
                      crossAxisSpacing: 8,
                      mainAxisSpacing: 8,
                    ),
                    itemBuilder: (context, index) => _ProductGridCard(
                      product: products[index],
                      currency: currency,
                      onTap: () => _showProductDetail(products[index], currency),
                    ),
                  );
                },
              ),
            ),
          ),
        ],
      ),
    );
  }

  void _showProductDetail(Product product, String currency) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      builder: (context) => DraggableScrollableSheet(
        initialChildSize: 0.7,
        minChildSize: 0.4,
        maxChildSize: 0.9,
        expand: false,
        builder: (context, scrollController) => SingleChildScrollView(
          controller: scrollController,
          padding: const EdgeInsets.all(24),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Center(
                child: Container(
                  width: 120,
                  height: 120,
                  decoration: BoxDecoration(
                    color: Theme.of(context).colorScheme.primaryContainer.withOpacity(0.3),
                    borderRadius: BorderRadius.circular(16),
                  ),
                  child: product.image != null
                      ? ClipRRect(
                          borderRadius: BorderRadius.circular(16),
                          child: Image.network(product.image!, fit: BoxFit.cover),
                        )
                      : const Icon(Icons.inventory_2, size: 48),
                ),
              ),
              const SizedBox(height: 16),
              Text(product.name, style: Theme.of(context).textTheme.titleLarge),
              const SizedBox(height: 4),
              Text('SKU: ${product.sku}', style: const TextStyle(color: Colors.grey)),
              const SizedBox(height: 16),
              _detailRow('Retail Price', Formatters.currency(product.retailPrice, currency)),
              _detailRow('Cost Price', Formatters.currency(product.costPrice, currency)),
              _detailRow('Wholesale Price', Formatters.currency(product.wholesalePrice ?? '0', currency)),
              _detailRow('Tax Rate', '${product.taxRate}%'),
              _detailRow('Stock', Formatters.number((product.stockOnHand ?? 0).toInt())),
              _detailRow('Unit', product.unit),
              if (product.brand != null) _detailRow('Brand', product.brand!),
              if (product.categoryName != null) _detailRow('Category', product.categoryName!),
              if (product.description != null) ...[
                const SizedBox(height: 16),
                const Text('Description', style: TextStyle(fontWeight: FontWeight.bold)),
                const SizedBox(height: 4),
                Text(product.description!),
              ],
            ],
          ),
        ),
      ),
    );
  }

  Widget _detailRow(String label, String value) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(label, style: const TextStyle(color: Colors.grey)),
          Text(value, style: const TextStyle(fontWeight: FontWeight.w500)),
        ],
      ),
    );
  }
}

class _ProductListTile extends StatelessWidget {
  final Product product;
  final String currency;
  final VoidCallback onTap;

  const _ProductListTile({required this.product, required this.currency, required this.onTap});

  @override
  Widget build(BuildContext context) {
    final stock = product.stockOnHand ?? 0;
    return Card(
      margin: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
      child: ListTile(
        onTap: onTap,
        leading: product.image != null
            ? ClipRRect(
                borderRadius: BorderRadius.circular(8),
                child: Image.network(product.image!, width: 48, height: 48, fit: BoxFit.cover),
              )
            : CircleAvatar(
                backgroundColor: Theme.of(context).colorScheme.primaryContainer,
                child: const Icon(Icons.inventory_2),
              ),
        title: Text(product.name, maxLines: 1, overflow: TextOverflow.ellipsis),
        subtitle: Text('SKU: ${product.sku} • Stock: ${stock.toInt()}'),
        trailing: Text(
          Formatters.currency(product.retailPrice, currency),
          style: TextStyle(
            color: Theme.of(context).colorScheme.primary,
            fontWeight: FontWeight.bold,
          ),
        ),
      ),
    );
  }
}

class _ProductGridCard extends StatelessWidget {
  final Product product;
  final String currency;
  final VoidCallback onTap;

  const _ProductGridCard({required this.product, required this.currency, required this.onTap});

  @override
  Widget build(BuildContext context) {
    final stock = product.stockOnHand ?? 0;
    final outOfStock = stock <= 0 && product.trackInventory;
    final scheme = Theme.of(context).colorScheme;

    return Card(
      clipBehavior: Clip.antiAlias,
      child: InkWell(
        onTap: onTap,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Expanded(
              child: product.image != null
                  ? Image.network(product.image!, fit: BoxFit.cover, width: double.infinity,
                      errorBuilder: (_, __, ___) => _placeholder(scheme))
                  : _placeholder(scheme),
            ),
            Padding(
              padding: const EdgeInsets.all(8),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(product.name,
                      maxLines: 1, overflow: TextOverflow.ellipsis,
                      style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold)),
                  Text(
                    Formatters.currency(product.retailPrice, currency),
                    style: TextStyle(color: scheme.primary, fontWeight: FontWeight.bold, fontSize: 12),
                  ),
                  Text(
                    outOfStock ? 'Out of stock' : 'Stock: ${stock.toInt()}',
                    style: TextStyle(fontSize: 10, color: outOfStock ? Colors.red : Colors.grey),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _placeholder(ColorScheme scheme) {
    return Container(
      color: scheme.primaryContainer.withOpacity(0.3),
      child: Center(child: Icon(Icons.inventory_2, color: scheme.primary, size: 32)),
    );
  }
}
