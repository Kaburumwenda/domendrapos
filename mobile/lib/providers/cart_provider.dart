/// POS cart state provider — mirrors the web app's `stores/pos.ts`.
/// Cart persists to shared preferences per user.
library;

import 'dart:convert';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:shared_preferences/shared_preferences.dart';

import '../core/formatters.dart';
import '../models/index.dart';

class CartState {
  final List<CartItem> items;
  final Customer? customer;
  final String customerName;
  final String customerPhone;
  final String paymentMethod;
  final int? branchId;
  final String? branchName;
  final String? notes;
  final DiscountInfo? discount;

  const CartState({
    this.items = const [],
    this.customer,
    this.customerName = '',
    this.customerPhone = '',
    this.paymentMethod = 'cash',
    this.branchId,
    this.branchName,
    this.notes,
    this.discount,
  });

  int get itemCount => items.fold(0, (sum, i) => sum + i.qty.toInt());
  int get uniqueCount => items.length;

  double get subtotal => items.fold(0.0, (sum, i) => sum + (Formatters.toDouble(i.price) * i.qty));

  double get discountAmount {
    if (discount == null) return 0;
    if (discount!.type == 'percentage') {
      return subtotal * (discount!.value / 100);
    }
    return discount!.value;
  }

  double get taxableBase => subtotal - discountAmount;
  double get taxAmount => items.fold(0.0, (sum, i) {
        final lineSub = Formatters.toDouble(i.price) * i.qty;
        final lineDiscount = discount != null
            ? (lineSub / subtotal * discountAmount)
            : 0.0;
        return (lineSub - lineDiscount) * (Formatters.toDouble(i.taxRate) / 100);
      });

  double get total => taxableBase + taxAmount;
  double get totalSavings => discountAmount;
  bool get isEmpty => items.isEmpty;

  CartState copyWith({
    List<CartItem>? items,
    Customer? customer,
    String? customerName,
    String? customerPhone,
    String? paymentMethod,
    int? branchId,
    String? branchName,
    String? notes,
    DiscountInfo? discount,
    bool clearCustomer = false,
  }) =>
      CartState(
        items: items ?? this.items,
        customer: clearCustomer ? null : (customer ?? this.customer),
        customerName: customerName ?? this.customerName,
        customerPhone: customerPhone ?? this.customerPhone,
        paymentMethod: paymentMethod ?? this.paymentMethod,
        branchId: branchId ?? this.branchId,
        branchName: branchName ?? this.branchName,
        notes: notes ?? this.notes,
        discount: discount ?? this.discount,
      );
}

class DiscountInfo {
  final String type; // 'percentage' or 'fixed'
  final double value;

  const DiscountInfo({required this.type, required this.value});
}

class CartNotifier extends StateNotifier<CartState> {
  CartNotifier() : super(const CartState());

  void addToCart(Product product) {
    final existing = state.items.indexWhere((i) => i.id == product.id);
    List<CartItem> items;
    if (existing >= 0) {
      items = List.from(state.items);
      final item = items[existing];
      items[existing] = item.copyWith(qty: item.qty + 1);
    } else {
      items = [
        ...state.items,
        CartItem(
          id: product.id,
          name: product.name,
          price: product.retailPrice,
          qty: 1,
          max: (product.stockOnHand ?? 9999).toDouble(),
          sku: product.sku,
          taxRate: product.taxRate,
          image: product.image,
        ),
      ];
    }
    state = state.copyWith(items: items);
    _persist();
  }

  void incItem(int index) {
    final items = List<CartItem>.from(state.items);
    final item = items[index];
    if (item.qty < item.max) {
      items[index] = item.copyWith(qty: item.qty + 1);
      state = state.copyWith(items: items);
      _persist();
    }
  }

  void decItem(int index) {
    final items = List<CartItem>.from(state.items);
    final item = items[index];
    if (item.qty > 1) {
      items[index] = item.copyWith(qty: item.qty - 1);
    } else {
      items.removeAt(index);
    }
    state = state.copyWith(items: items);
    _persist();
  }

  void updateQty(int index, double qty) {
    final items = List<CartItem>.from(state.items);
    if (qty <= 0) {
      items.removeAt(index);
    } else {
      items[index] = items[index].copyWith(qty: qty);
    }
    state = state.copyWith(items: items);
    _persist();
  }

  void removeItem(int index) {
    final items = List<CartItem>.from(state.items);
    items.removeAt(index);
    state = state.copyWith(items: items);
    _persist();
  }

  void setCustomer(Customer? customer) {
    state = state.copyWith(
      customer: customer,
      clearCustomer: customer == null,
      customerName: customer?.fullName ?? state.customerName,
      customerPhone: customer?.phone ?? state.customerPhone,
    );
    _persist();
  }

  void setCustomerName(String name) {
    state = state.copyWith(customerName: name);
    _persist();
  }

  void setCustomerPhone(String phone) {
    state = state.copyWith(customerPhone: phone);
    _persist();
  }

  void setPaymentMethod(String method) {
    state = state.copyWith(paymentMethod: method);
    _persist();
  }

  void setBranch(int id, String name) {
    state = state.copyWith(branchId: id, branchName: name);
    _persist();
  }

  void setDiscount(DiscountInfo? discount) {
    state = state.copyWith(discount: discount);
    _persist();
  }

  void clearCart() {
    state = const CartState();
    _persist();
  }

  void resumeFromParked(List<CartItem> items, String? customerName, String? customerPhone) {
    Customer? cust;
    if (customerName != null && customerName.isNotEmpty) {
      cust = Customer(id: 0, fullName: customerName, phone: customerPhone);
    }
    state = CartState(
      items: items,
      customer: cust,
      customerName: customerName ?? '',
      customerPhone: customerPhone ?? '',
    );
    _persist();
  }

  Future<void> restoreCart(int userId) async {
    final prefs = await SharedPreferences.getInstance();
    final json = prefs.getString('pos_cart_$userId');
    if (json != null) {
      try {
        final data = jsonDecode(json) as Map<String, dynamic>;
        final items = (data['items'] as List? ?? [])
            .map((e) => CartItem(
                  id: e['id'] as int,
                  name: e['name'] as String,
                  price: e['price'] as String,
                  qty: (e['qty'] as num).toDouble(),
                  max: (e['max'] as num?)?.toDouble() ?? 9999,
                  sku: e['sku'] as String? ?? '',
                  taxRate: e['tax_rate'] as String? ?? '0',
                  image: e['image'],
                  discount: e['discount'],
                ))
            .toList();
        state = CartState(
          items: items,
          customerName: data['customer_name'] as String? ?? '',
          customerPhone: data['customer_phone'] as String? ?? '',
          paymentMethod: data['payment_method'] as String? ?? 'cash',
          branchId: data['branch_id'] as int?,
          branchName: data['branch_name'] as String?,
          notes: data['notes'] as String?,
          discount: data['discount'] != null
              ? DiscountInfo(
                  type: (data['discount'] as Map<String, dynamic>)['type'] as String? ?? 'percentage',
                  value: ((data['discount'] as Map<String, dynamic>)['value'] as num?)?.toDouble() ?? 0,
                )
              : null,
        );
      } catch (_) {}
    }
  }

  Future<void> _persist() async {
    final prefs = await SharedPreferences.getInstance();
    final userId = state.customer?.id ?? 0;
    final json = jsonEncode({
      'items': state.items
          .map((i) => {
                'id': i.id,
                'name': i.name,
                'price': i.price,
                'qty': i.qty,
                'max': i.max,
                'sku': i.sku,
                'tax_rate': i.taxRate,
                'image': i.image,
                'discount': i.discount,
              })
          .toList(),
      'customer_name': state.customerName,
      'customer_phone': state.customerPhone,
      'payment_method': state.paymentMethod,
      'branch_id': state.branchId,
      'branch_name': state.branchName,
      'notes': state.notes,
      'discount': state.discount != null
          ? {'type': state.discount!.type, 'value': state.discount!.value}
          : null,
    });
    prefs.setString('pos_cart_$userId', json);
  }
}

final cartProvider = StateNotifierProvider<CartNotifier, CartState>((ref) {
  return CartNotifier();
});
