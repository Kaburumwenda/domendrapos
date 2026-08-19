/// Data models for DomendraPOS mobile app.
///
/// All models are plain Dart classes with `fromJson` factories.
/// They mirror the Django backend serializers.

// ── Auth ──────────────────────────────────────────────────────────

class User {
  final int id;
  final String email;
  final String firstName;
  final String lastName;
  final String role;
  final String phone;
  final String? avatar;
  final bool isActiveEmployee;
  final String? employeeId;
  final int? defaultBranchId;

  User({
    required this.id,
    required this.email,
    required this.firstName,
    required this.lastName,
    required this.role,
    this.phone = '',
    this.avatar,
    this.isActiveEmployee = true,
    this.employeeId,
    this.defaultBranchId,
  });

  String get fullName => '$firstName $lastName'.trim();
  String get initials {
    final f = firstName.isNotEmpty ? firstName[0] : '';
    final l = lastName.isNotEmpty ? lastName[0] : '';
    return '$f$l'.toUpperCase();
  }

  bool get isSuperAdmin => role == 'super_admin';
  bool get isTenantAdmin => role == 'tenant_admin';
  bool get isManager => role == 'super_admin' || role == 'tenant_admin' || role == 'manager';
  bool get canAccessAdmin => isManager;

  factory User.fromJson(Map<String, dynamic> j) => User(
        id: j['id'] as int,
        email: j['email'] as String? ?? '',
        firstName: j['first_name'] as String? ?? '',
        lastName: j['last_name'] as String? ?? '',
        role: j['role'] as String? ?? 'viewer',
        phone: j['phone'] as String? ?? '',
        avatar: j['avatar'] as String?,
        isActiveEmployee: j['is_active_employee'] as bool? ?? true,
        employeeId: j['employee_id'] as String?,
        defaultBranchId: j['default_branch_id'] as int?,
      );

  Map<String, dynamic> toJson() => {
        'id': id,
        'email': email,
        'first_name': firstName,
        'last_name': lastName,
        'role': role,
        'phone': phone,
        'avatar': avatar,
        'is_active_employee': isActiveEmployee,
        'employee_id': employeeId ?? '',
        'default_branch_id': defaultBranchId,
      };
}

class TenantInfo {
  final String name;
  final String currencyCode;
  final String currencySymbol;
  final String timezone;
  final String primaryColor;
  final String plan;
  final String? logo;

  TenantInfo({
    required this.name,
    this.currencyCode = 'KES',
    this.currencySymbol = 'KSh',
    this.timezone = 'Africa/Nairobi',
    this.primaryColor = '#1976D2',
    this.plan = 'free',
    this.logo,
  });

  factory TenantInfo.fromJson(Map<String, dynamic> j) => TenantInfo(
        name: j['name'] as String? ?? 'Demo Store',
        currencyCode: j['currency_code'] as String? ?? 'KES',
        currencySymbol: j['currency_symbol'] as String? ?? 'KSh',
        timezone: j['timezone'] as String? ?? 'Africa/Nairobi',
        primaryColor: j['primary_color'] as String? ?? '#1976D2',
        plan: j['plan'] as String? ?? 'free',
        logo: j['logo'] as String?,
      );

  Map<String, dynamic> toJson() => {
        'name': name,
        'currency_code': currencyCode,
        'currency_symbol': currencySymbol,
        'timezone': timezone,
        'primary_color': primaryColor,
        'plan': plan,
        if (logo != null) 'logo': logo,
      };
}

class BillingStatus {
  final bool locked;
  final String reason;
  final bool hasOverdue;
  final String totalOverdue;
  final int overdueCount;
  final String? oldestDueDate;
  final int daysOverdue;
  final int graceDays;
  final String tenantName;
  final String currency;

  BillingStatus({
    this.locked = false,
    this.reason = '',
    this.hasOverdue = false,
    this.totalOverdue = '0',
    this.overdueCount = 0,
    this.oldestDueDate,
    this.daysOverdue = 0,
    this.graceDays = 7,
    this.tenantName = '',
    this.currency = 'KSH',
  });

  factory BillingStatus.fromJson(Map<String, dynamic> j) => BillingStatus(
        locked: j['locked'] as bool? ?? false,
        reason: j['reason'] as String? ?? '',
        hasOverdue: j['has_overdue'] as bool? ?? false,
        totalOverdue: (j['total_overdue'] ?? '0').toString(),
        overdueCount: j['overdue_count'] as int? ?? 0,
        oldestDueDate: j['oldest_due_date'] as String?,
        daysOverdue: j['days_overdue'] as int? ?? 0,
        graceDays: j['grace_days'] as int? ?? 7,
        tenantName: j['tenant_name'] as String? ?? '',
        currency: j['currency'] as String? ?? 'KSH',
      );

  Map<String, dynamic> toJson() => {
        'locked': locked,
        'reason': reason,
        'has_overdue': hasOverdue,
        'total_overdue': totalOverdue,
        'overdue_count': overdueCount,
        'oldest_due_date': oldestDueDate,
        'days_overdue': daysOverdue,
        'grace_days': graceDays,
        'tenant_name': tenantName,
        'currency': currency,
      };
}

// ── Login Response ────────────────────────────────────────────────

class LoginResponse {
  final String access;
  final String refresh;
  final User user;
  final TenantInfo tenant;
  final BillingStatus? billing;

  LoginResponse({
    required this.access,
    required this.refresh,
    required this.user,
    required this.tenant,
    this.billing,
  });

  factory LoginResponse.fromJson(Map<String, dynamic> j) => LoginResponse(
        access: j['access'] as String,
        refresh: j['refresh'] as String,
        user: User.fromJson(j['user'] as Map<String, dynamic>),
        tenant: TenantInfo.fromJson(j['tenant'] as Map<String, dynamic>),
        billing: j['billing'] != null
            ? BillingStatus.fromJson(j['billing'] as Map<String, dynamic>)
            : null,
      );
}

// ── Product ──────────────────────────────────────────────────────

class Product {
  final int id;
  final String sku;
  final String barcode;
  final String name;
  final String? description;
  final int? category;
  final String? categoryName;
  final String productType;
  final String costPrice;
  final String retailPrice;
  final String? wholesalePrice;
  final String taxRate;
  final String unit;
  final bool isActive;
  final bool isSellable;
  final bool trackInventory;
  final String? brand;
  final String? manufacturer;
  final String? image;
  final double? stockOnHand;
  final double? reorderLevel;
  final DateTime? createdAt;

  Product({
    required this.id,
    required this.sku,
    this.barcode = '',
    required this.name,
    this.description,
    this.category,
    this.categoryName,
    this.productType = 'physical',
    this.costPrice = '0',
    this.retailPrice = '0',
    this.wholesalePrice,
    this.taxRate = '0',
    this.unit = 'each',
    this.isActive = true,
    this.isSellable = true,
    this.trackInventory = true,
    this.brand,
    this.manufacturer,
    this.image,
    this.stockOnHand,
    this.reorderLevel,
    this.createdAt,
  });

  factory Product.fromJson(Map<String, dynamic> j) {
    double? parseStock(dynamic v) {
      if (v == null) return null;
      if (v is double) return v;
      if (v is int) return v.toDouble();
      return double.tryParse(v.toString());
    }
    return Product(
        id: j['id'] as int,
        sku: j['sku'] as String? ?? '',
        barcode: j['barcode'] as String? ?? '',
        name: j['name'] as String? ?? '',
        description: j['description'] as String?,
        category: j['category'] as int?,
        categoryName: j['category_name'] as String?,
        productType: j['product_type'] as String? ?? 'physical',
        costPrice: (j['cost_price'] ?? '0').toString(),
        retailPrice: (j['retail_price'] ?? '0').toString(),
        wholesalePrice: j['wholesale_price']?.toString(),
        taxRate: (j['tax_rate'] ?? '0').toString(),
        unit: j['unit'] as String? ?? 'each',
        isActive: j['is_active'] as bool? ?? true,
        isSellable: j['is_sellable'] as bool? ?? true,
        trackInventory: j['track_inventory'] as bool? ?? true,
        brand: j['brand'] as String?,
        manufacturer: j['manufacturer'] as String?,
        image: j['image'] as String?,
        stockOnHand: parseStock(j['quantity_on_hand'] ?? j['stock_on_hand'] ?? j['total_quantity']),
        reorderLevel: parseStock(j['reorder_level']),
        createdAt: j['created_at'] != null ? DateTime.tryParse(j['created_at']) : null,
      );
  }

  Map<String, dynamic> toJson() => {
        'sku': sku,
        'name': name,
        'barcode': barcode,
        'description': description,
        'category': category,
        'product_type': productType,
        'cost_price': costPrice,
        'retail_price': retailPrice,
        'tax_rate': taxRate,
        'unit': unit,
        'is_active': isActive,
        'is_sellable': isSellable,
      };
}

// ── Cart Item ────────────────────────────────────────────────────

class CartItem {
  final int id;
  final String name;
  final String price;
  final double qty;
  final double max;
  final String sku;
  final String taxRate;
  final String? image;
  final String? discount;

  CartItem({
    required this.id,
    required this.name,
    required this.price,
    required this.qty,
    this.max = 9999,
    this.sku = '',
    this.taxRate = '0',
    this.image,
    this.discount,
  });

  double get lineTotal => (double.tryParse(price) ?? 0) * qty;
  double get lineSubtotal => (double.tryParse(price) ?? 0) * qty;

  CartItem copyWith({double? qty, String? discount}) => CartItem(
        id: id,
        name: name,
        price: price,
        qty: qty ?? this.qty,
        max: max,
        sku: sku,
        taxRate: taxRate,
        image: image,
        discount: discount ?? this.discount,
      );

  Map<String, dynamic> toJson() => {
        'product': id,
        'product_name': name,
        'quantity': qty,
        'unit_price': price,
        'tax_rate': taxRate,
        'line_total': (double.tryParse(price) ?? 0) * qty,
      };
}

// ── Branch ────────────────────────────────────────────────────────

class Branch {
  final int id;
  final String name;
  final String code;
  final bool isHeadquarters;
  final bool isActive;
  final String? city;
  final String? country;
  final String? phone;
  final String? email;
  final String currencyCode;
  final String? timezone;
  final String taxRate;
  final int registerCount;

  Branch({
    required this.id,
    required this.name,
    this.code = '',
    this.isHeadquarters = false,
    this.isActive = true,
    this.city,
    this.country,
    this.phone,
    this.email,
    this.currencyCode = 'KES',
    this.timezone,
    this.taxRate = '0',
    this.registerCount = 1,
  });

  factory Branch.fromJson(Map<String, dynamic> j) => Branch(
        id: j['id'] as int,
        name: j['name'] as String? ?? '',
        code: j['code'] as String? ?? '',
        isHeadquarters: j['is_headquarters'] as bool? ?? false,
        isActive: j['is_active'] as bool? ?? true,
        city: j['city'] as String?,
        country: j['country'] as String?,
        phone: j['phone'] as String?,
        email: j['email'] as String?,
        currencyCode: j['currency_code'] as String? ?? 'KES',
        timezone: j['timezone'] as String?,
        taxRate: (j['tax_rate'] ?? '0').toString(),
        registerCount: j['register_count'] as int? ?? 1,
      );
}

// ── Customer ────────────────────────────────────────────────────

class Customer {
  final int id;
  final String customerCode;
  final String customerType;
  final String fullName;
  final String? email;
  final String? phone;
  final int loyaltyPoints;
  final String loyaltyTier;
  final String? cityName;
  final bool isActive;
  final String? creditLimit;
  final String? currentCreditBalance;
  final DateTime? createdAt;

  Customer({
    required this.id,
    this.customerCode = '',
    this.customerType = 'individual',
    this.fullName = '',
    this.email,
    this.phone,
    this.loyaltyPoints = 0,
    this.loyaltyTier = 'bronze',
    this.cityName,
    this.isActive = true,
    this.creditLimit,
    this.currentCreditBalance,
    this.createdAt,
  });

  factory Customer.fromJson(Map<String, dynamic> j) => Customer(
        id: j['id'] as int,
        customerCode: j['customer_code'] as String? ?? '',
        customerType: j['customer_type'] as String? ?? 'individual',
        fullName: j['full_name'] as String? ?? '',
        email: j['email'] as String?,
        phone: j['phone'] as String?,
        loyaltyPoints: j['loyalty_points'] as int? ?? 0,
        loyaltyTier: j['loyalty_tier'] as String? ?? 'bronze',
        cityName: j['city'] as String?,
        isActive: j['is_active'] as bool? ?? true,
        creditLimit: j['credit_limit']?.toString(),
        currentCreditBalance: j['current_credit_balance']?.toString(),
        createdAt: j['created_at'] != null ? DateTime.tryParse(j['created_at']) : null,
      );
}

// ── Supplier ──────────────────────────────────────────────────────

class Supplier {
  final int id;
  final String supplierCode;
  final String name;
  final String? contactPerson;
  final String? email;
  final String? phone;
  final String? city;
  final String? country;
  final bool isActive;
  final String? rating;
  final int? leadTimeDays;
  final String? paymentTerms;

  Supplier({
    required this.id,
    this.supplierCode = '',
    required this.name,
    this.contactPerson,
    this.email,
    this.phone,
    this.city,
    this.country,
    this.isActive = true,
    this.rating,
    this.leadTimeDays,
    this.paymentTerms,
  });

  factory Supplier.fromJson(Map<String, dynamic> j) => Supplier(
        id: j['id'] as int,
        supplierCode: j['supplier_code'] as String? ?? '',
        name: j['name'] as String? ?? '',
        contactPerson: j['contact_person'] as String?,
        email: j['email'] as String?,
        phone: j['phone'] as String?,
        city: j['city'] as String?,
        country: j['country'] as String?,
        isActive: j['is_active'] as bool? ?? true,
        rating: j['rating']?.toString(),
        leadTimeDays: j['lead_time_days'] as int?,
        paymentTerms: j['payment_terms'] as String?,
      );
}

// ── Paginated Response ────────────────────────────────────────────

class PaginatedResponse<T> {
  final int count;
  final String? next;
  final String? previous;
  final List<T> results;

  PaginatedResponse({
    required this.count,
    this.next,
    this.previous,
    required this.results,
  });

  factory PaginatedResponse.fromJson(
    Map<String, dynamic> j,
    T Function(Map<String, dynamic>) fromJsonT,
  ) =>
      PaginatedResponse(
        count: j['count'] as int? ?? 0,
        next: j['next'] as String?,
        previous: j['previous'] as String?,
        results: (j['results'] as List? ?? [])
            .map((e) => fromJsonT(e as Map<String, dynamic>))
            .toList(),
      );
}

// ── Inventory: Stock Item ─────────────────────────────────────────

class StockItem {
  final int id;
  final int? product;
  final int? variant;
  final int? branch;
  final double quantityOnHand;
  final double quantityReserved;
  final double reorderLevel;
  final double reorderQuantity;
  final String binLocation;
  final String aisle;
  final String? lastCountDate;
  final double quantityAvailable;
  final bool needsReorder;
  final String productName;
  final String productSku;
  final String? productCategory;
  final String branchCode;
  final String branchName;
  final double costPrice;
  final double retailPrice;
  final String unitName;

  StockItem({
    required this.id,
    this.product,
    this.variant,
    this.branch,
    this.quantityOnHand = 0,
    this.quantityReserved = 0,
    this.reorderLevel = 0,
    this.reorderQuantity = 0,
    this.binLocation = '',
    this.aisle = '',
    this.lastCountDate,
    this.quantityAvailable = 0,
    this.needsReorder = false,
    this.productName = '',
    this.productSku = '',
    this.productCategory,
    this.branchCode = '',
    this.branchName = '',
    this.costPrice = 0,
    this.retailPrice = 0,
    this.unitName = '',
  });

  double get stockValue => quantityOnHand * costPrice;

  factory StockItem.fromJson(Map<String, dynamic> j) {
    double num(dynamic v) => double.tryParse(v?.toString() ?? '0') ?? 0;
    return StockItem(
      id: j['id'] as int? ?? 0,
      product: j['product'] as int?,
      variant: j['variant'] as int?,
      branch: j['branch'] as int?,
      quantityOnHand: num(j['quantity_on_hand']),
      quantityReserved: num(j['quantity_reserved']),
      reorderLevel: num(j['reorder_level']),
      reorderQuantity: num(j['reorder_quantity']),
      binLocation: j['bin_location']?.toString() ?? '',
      aisle: j['aisle']?.toString() ?? '',
      lastCountDate: j['last_count_date']?.toString(),
      quantityAvailable: num(j['quantity_available']),
      needsReorder: j['needs_reorder'] as bool? ?? false,
      productName: j['product_name']?.toString() ?? '',
      productSku: j['product_sku']?.toString() ?? '',
      productCategory: j['product_category']?.toString(),
      branchCode: j['branch_code']?.toString() ?? '',
      branchName: j['branch_name']?.toString() ?? '',
      costPrice: num(j['cost_price']),
      retailPrice: num(j['retail_price']),
      unitName: j['unit_name']?.toString() ?? '',
    );
  }
}

// ── Inventory: Stock Movement ─────────────────────────────────────

class StockMovement {
  final int id;
  final int? product;
  final int? variant;
  final int? branch;
  final String movementType;
  final String movementTypeDisplay;
  final double quantityChange;
  final double quantityAfter;
  final String reference;
  final String notes;
  final int? performedBy;
  final String performedByName;
  final String createdAt;
  final String productName;
  final String productSku;
  final String branchCode;

  StockMovement({
    required this.id,
    this.product,
    this.variant,
    this.branch,
    this.movementType = '',
    this.movementTypeDisplay = '',
    this.quantityChange = 0,
    this.quantityAfter = 0,
    this.reference = '',
    this.notes = '',
    this.performedBy,
    this.performedByName = '',
    this.createdAt = '',
    this.productName = '',
    this.productSku = '',
    this.branchCode = '',
  });

  bool get isPositive => quantityChange >= 0;

  factory StockMovement.fromJson(Map<String, dynamic> j) {
    double num(dynamic v) => double.tryParse(v?.toString() ?? '0') ?? 0;
    return StockMovement(
      id: j['id'] as int? ?? 0,
      product: j['product'] as int?,
      variant: j['variant'] as int?,
      branch: j['branch'] as int?,
      movementType: j['movement_type']?.toString() ?? '',
      movementTypeDisplay: j['movement_type_display']?.toString() ?? '',
      quantityChange: num(j['quantity_change']),
      quantityAfter: num(j['quantity_after']),
      reference: j['reference']?.toString() ?? '',
      notes: j['notes']?.toString() ?? '',
      performedBy: j['performed_by'] as int?,
      performedByName: j['performed_by_name']?.toString() ?? '',
      createdAt: j['created_at']?.toString() ?? '',
      productName: j['product_name']?.toString() ?? '',
      productSku: j['product_sku']?.toString() ?? '',
      branchCode: j['branch_code']?.toString() ?? '',
    );
  }
}

// ── Inventory: Stock Adjustment ───────────────────────────────────

class StockAdjustmentLine {
  final int id;
  final int? product;
  final int? variant;
  final double systemQuantity;
  final double countedQuantity;
  final double quantityChange;
  final double unitCost;
  final double valueImpact;
  final String notes;
  final String productName;
  final String productSku;
  final String unitName;

  StockAdjustmentLine({
    required this.id,
    this.product,
    this.variant,
    this.systemQuantity = 0,
    this.countedQuantity = 0,
    this.quantityChange = 0,
    this.unitCost = 0,
    this.valueImpact = 0,
    this.notes = '',
    this.productName = '',
    this.productSku = '',
    this.unitName = '',
  });

  factory StockAdjustmentLine.fromJson(Map<String, dynamic> j) {
    double num(dynamic v) => double.tryParse(v?.toString() ?? '0') ?? 0;
    return StockAdjustmentLine(
      id: j['id'] as int? ?? 0,
      product: j['product'] as int?,
      variant: j['variant'] as int?,
      systemQuantity: num(j['system_quantity']),
      countedQuantity: num(j['counted_quantity']),
      quantityChange: num(j['quantity_change']),
      unitCost: num(j['unit_cost']),
      valueImpact: num(j['value_impact']),
      notes: j['notes']?.toString() ?? '',
      productName: j['product_name']?.toString() ?? '',
      productSku: j['product_sku']?.toString() ?? '',
      unitName: j['unit_name']?.toString() ?? '',
    );
  }
}

class StockAdjustment {
  final int id;
  final String adjustmentNumber;
  final int? branch;
  final String branchCode;
  final String branchName;
  final String adjustmentType;
  final String adjustmentTypeDisplay;
  final String reason;
  final String reasonDisplay;
  final String status;
  final String statusDisplay;
  final String adjustmentDate;
  final String notes;
  final double totalQuantity;
  final double totalValueImpact;
  final int? createdBy;
  final String createdByName;
  final int? approvedBy;
  final String approvedByName;
  final String createdAt;
  final String? approvedAt;
  final String? postedAt;
  final int lineCount;
  final List<StockAdjustmentLine> lines;

  StockAdjustment({
    required this.id,
    this.adjustmentNumber = '',
    this.branch,
    this.branchCode = '',
    this.branchName = '',
    this.adjustmentType = '',
    this.adjustmentTypeDisplay = '',
    this.reason = '',
    this.reasonDisplay = '',
    this.status = 'draft',
    this.statusDisplay = '',
    this.adjustmentDate = '',
    this.notes = '',
    this.totalQuantity = 0,
    this.totalValueImpact = 0,
    this.createdBy,
    this.createdByName = '',
    this.approvedBy,
    this.approvedByName = '',
    this.createdAt = '',
    this.approvedAt,
    this.postedAt,
    this.lineCount = 0,
    this.lines = const [],
  });

  factory StockAdjustment.fromJson(Map<String, dynamic> j) {
    double num(dynamic v) => double.tryParse(v?.toString() ?? '0') ?? 0;
    return StockAdjustment(
      id: j['id'] as int? ?? 0,
      adjustmentNumber: j['adjustment_number']?.toString() ?? '',
      branch: j['branch'] as int?,
      branchCode: j['branch_code']?.toString() ?? '',
      branchName: j['branch_name']?.toString() ?? '',
      adjustmentType: j['adjustment_type']?.toString() ?? '',
      adjustmentTypeDisplay: j['adjustment_type_display']?.toString() ?? '',
      reason: j['reason']?.toString() ?? '',
      reasonDisplay: j['reason_display']?.toString() ?? '',
      status: j['status']?.toString() ?? 'draft',
      statusDisplay: j['status_display']?.toString() ?? '',
      adjustmentDate: j['adjustment_date']?.toString() ?? '',
      notes: j['notes']?.toString() ?? '',
      totalQuantity: num(j['total_quantity']),
      totalValueImpact: num(j['total_value_impact']),
      createdBy: j['created_by'] as int?,
      createdByName: j['created_by_name']?.toString() ?? '',
      approvedBy: j['approved_by'] as int?,
      approvedByName: j['approved_by_name']?.toString() ?? '',
      createdAt: j['created_at']?.toString() ?? '',
      approvedAt: j['approved_at']?.toString(),
      postedAt: j['posted_at']?.toString(),
      lineCount: j['line_count'] as int? ?? 0,
      lines: (j['lines'] as List? ?? [])
          .map((e) => StockAdjustmentLine.fromJson(e as Map<String, dynamic>))
          .toList(),
    );
  }
}

class AdjustmentSummary {
  final int total;
  final int pending;
  final int approved;
  final int posted;
  final int draft;
  final double totalValueImpact;

  AdjustmentSummary({
    this.total = 0,
    this.pending = 0,
    this.approved = 0,
    this.posted = 0,
    this.draft = 0,
    this.totalValueImpact = 0,
  });

  factory AdjustmentSummary.fromJson(Map<String, dynamic> j) {
    double num(dynamic v) => double.tryParse(v?.toString() ?? '0') ?? 0;
    return AdjustmentSummary(
      total: j['total'] as int? ?? 0,
      pending: j['pending'] as int? ?? 0,
      approved: j['approved'] as int? ?? 0,
      posted: j['posted'] as int? ?? 0,
      draft: j['draft'] as int? ?? 0,
      totalValueImpact: num(j['total_value_impact']),
    );
  }
}

// ── Inventory: Stock Analysis ─────────────────────────────────────

class CategoryValue {
  final String category;
  final double value;
  final double units;
  final int count;

  CategoryValue({this.category = '', this.value = 0, this.units = 0, this.count = 0});

  factory CategoryValue.fromJson(Map<String, dynamic> j) {
    double num(dynamic v) => double.tryParse(v?.toString() ?? '0') ?? 0;
    return CategoryValue(
      category: j['category']?.toString() ?? 'Uncategorized',
      value: num(j['value']),
      units: num(j['units']),
      count: j['count'] as int? ?? 0,
    );
  }
}

class TopStockItem {
  final int id;
  final String productName;
  final String productSku;
  final String? category;
  final double quantityOnHand;
  final double costPrice;
  final double retailPrice;
  final double stockValue;
  final double reorderLevel;
  final String branchName;

  TopStockItem({
    this.id = 0,
    this.productName = '',
    this.productSku = '',
    this.category,
    this.quantityOnHand = 0,
    this.costPrice = 0,
    this.retailPrice = 0,
    this.stockValue = 0,
    this.reorderLevel = 0,
    this.branchName = '',
  });

  factory TopStockItem.fromJson(Map<String, dynamic> j) {
    double num(dynamic v) => double.tryParse(v?.toString() ?? '0') ?? 0;
    return TopStockItem(
      id: j['id'] as int? ?? 0,
      productName: j['product_name']?.toString() ?? '',
      productSku: j['product_sku']?.toString() ?? '',
      category: j['category']?.toString(),
      quantityOnHand: num(j['quantity_on_hand']),
      costPrice: num(j['cost_price']),
      retailPrice: num(j['retail_price']),
      stockValue: num(j['stock_value']),
      reorderLevel: num(j['reorder_level']),
      branchName: j['branch_name']?.toString() ?? '',
    );
  }
}

class AbcItem extends TopStockItem {
  final String abcClass;
  final double cumulativePct;

  AbcItem({
    super.id,
    super.productName,
    super.productSku,
    super.category,
    super.quantityOnHand,
    super.costPrice,
    super.retailPrice,
    super.stockValue,
    super.reorderLevel,
    super.branchName,
    this.abcClass = 'C',
    this.cumulativePct = 0,
  });

  factory AbcItem.fromJson(Map<String, dynamic> j) {
    double num(dynamic v) => double.tryParse(v?.toString() ?? '0') ?? 0;
    return AbcItem(
      id: j['id'] as int? ?? 0,
      productName: j['product_name']?.toString() ?? '',
      productSku: j['product_sku']?.toString() ?? '',
      category: j['category']?.toString(),
      quantityOnHand: num(j['quantity_on_hand']),
      costPrice: num(j['cost_price']),
      retailPrice: num(j['retail_price']),
      stockValue: num(j['stock_value']),
      reorderLevel: num(j['reorder_level']),
      branchName: j['branch_name']?.toString() ?? '',
      abcClass: j['class']?.toString() ?? 'C',
      cumulativePct: num(j['cumulative_pct']),
    );
  }
}

class MovementSummaryItem {
  final String movementType;
  final String label;
  final int count;
  final double quantity;

  MovementSummaryItem({
    this.movementType = '',
    this.label = '',
    this.count = 0,
    this.quantity = 0,
  });

  factory MovementSummaryItem.fromJson(Map<String, dynamic> j) {
    double num(dynamic v) => double.tryParse(v?.toString() ?? '0') ?? 0;
    return MovementSummaryItem(
      movementType: j['movement_type']?.toString() ?? '',
      label: j['label']?.toString() ?? '',
      count: j['count'] as int? ?? 0,
      quantity: num(j['quantity']),
    );
  }
}

class LowStockAlert {
  final int id;
  final String productName;
  final String productSku;
  final String? category;
  final double quantityOnHand;
  final double reorderLevel;
  final double reorderQty;
  final double costPrice;
  final String branchName;

  LowStockAlert({
    this.id = 0,
    this.productName = '',
    this.productSku = '',
    this.category,
    this.quantityOnHand = 0,
    this.reorderLevel = 0,
    this.reorderQty = 0,
    this.costPrice = 0,
    this.branchName = '',
  });

  double get shortfall => (reorderLevel - quantityOnHand).clamp(0, double.infinity);

  factory LowStockAlert.fromJson(Map<String, dynamic> j) {
    double num(dynamic v) => double.tryParse(v?.toString() ?? '0') ?? 0;
    return LowStockAlert(
      id: j['id'] as int? ?? 0,
      productName: j['product_name']?.toString() ?? '',
      productSku: j['product_sku']?.toString() ?? '',
      category: j['category']?.toString(),
      quantityOnHand: num(j['quantity_on_hand']),
      reorderLevel: num(j['reorder_level']),
      reorderQty: num(j['reorder_qty']),
      costPrice: num(j['cost_price']),
      branchName: j['branch_name']?.toString() ?? '',
    );
  }
}

class StockAnalysisKpis {
  final int totalSkus;
  final double totalUnits;
  final double totalCostValue;
  final double totalRetailValue;
  final double potentialProfit;
  final int inStock;
  final int lowStock;
  final int outOfStock;
  final int reorderItems;

  const StockAnalysisKpis({
    this.totalSkus = 0,
    this.totalUnits = 0,
    this.totalCostValue = 0,
    this.totalRetailValue = 0,
    this.potentialProfit = 0,
    this.inStock = 0,
    this.lowStock = 0,
    this.outOfStock = 0,
    this.reorderItems = 0,
  });

  factory StockAnalysisKpis.fromJson(Map<String, dynamic> j) {
    double num(dynamic v) => double.tryParse(v?.toString() ?? '0') ?? 0;
    return StockAnalysisKpis(
      totalSkus: j['total_skus'] as int? ?? 0,
      totalUnits: num(j['total_units']),
      totalCostValue: num(j['total_cost_value']),
      totalRetailValue: num(j['total_retail_value']),
      potentialProfit: num(j['potential_profit']),
      inStock: j['in_stock'] as int? ?? 0,
      lowStock: j['low_stock'] as int? ?? 0,
      outOfStock: j['out_of_stock'] as int? ?? 0,
      reorderItems: j['reorder_items'] as int? ?? 0,
    );
  }
}

class StockAnalysisData {
  final StockAnalysisKpis kpis;
  final List<CategoryValue> byCategory;
  final List<TopStockItem> topByValue;
  final List<MovementSummaryItem> movementSummary;
  final List<AbcItem> abcAnalysis;
  final Map<String, int> abcCounts;
  final List<LowStockAlert> lowStockItems;

  StockAnalysisData({
    this.kpis = const StockAnalysisKpis(),
    this.byCategory = const [],
    this.topByValue = const [],
    this.movementSummary = const [],
    this.abcAnalysis = const [],
    this.abcCounts = const {},
    this.lowStockItems = const [],
  });

  factory StockAnalysisData.fromJson(Map<String, dynamic> j) => StockAnalysisData(
        kpis: StockAnalysisKpis.fromJson(j['kpis'] as Map<String, dynamic>? ?? {}),
        byCategory: (j['by_category'] as List? ?? [])
            .map((e) => CategoryValue.fromJson(e as Map<String, dynamic>))
            .toList(),
        topByValue: (j['top_by_value'] as List? ?? [])
            .map((e) => TopStockItem.fromJson(e as Map<String, dynamic>))
            .toList(),
        movementSummary: (j['movement_summary'] as List? ?? [])
            .map((e) => MovementSummaryItem.fromJson(e as Map<String, dynamic>))
            .toList(),
        abcAnalysis: (j['abc_analysis'] as List? ?? [])
            .map((e) => AbcItem.fromJson(e as Map<String, dynamic>))
            .toList(),
        abcCounts: {
          'A': (j['abc_counts']?['A'] as int?) ?? 0,
          'B': (j['abc_counts']?['B'] as int?) ?? 0,
          'C': (j['abc_counts']?['C'] as int?) ?? 0,
        },
        lowStockItems: (j['low_stock_items'] as List? ?? [])
            .map((e) => LowStockAlert.fromJson(e as Map<String, dynamic>))
            .toList(),
      );
}

// ── POS Transaction ──────────────────────────────────────────────

class PosTransactionItem {
  final int id;
  final int transaction;
  final int product;
  final int? variant;
  final String productName;
  final String quantity;
  final String unitPrice;
  final String lineTotal;

  PosTransactionItem({
    required this.id,
    this.transaction = 0,
    this.product = 0,
    this.variant,
    this.productName = '',
    this.quantity = '0',
    this.unitPrice = '0',
    this.lineTotal = '0',
  });

  factory PosTransactionItem.fromJson(Map<String, dynamic> j) => PosTransactionItem(
        id: j['id'] as int? ?? 0,
        transaction: j['transaction'] as int? ?? 0,
        product: j['product'] as int? ?? 0,
        variant: j['variant'] as int?,
        productName: j['product_name']?.toString() ?? '',
        quantity: j['quantity']?.toString() ?? '0',
        unitPrice: j['unit_price']?.toString() ?? '0',
        lineTotal: j['line_total']?.toString() ?? '0',
      );
}

class PosTransaction {
  final int id;
  final String transactionNumber;
  final int branch;
  final String branchName;
  final int cashier;
  final String cashierName;
  final String customerName;
  final String customerPhone;
  final int? shift;
  final double subtotal;
  final double discount;
  final double tax;
  final double total;
  final String paymentMethod;
  final String paymentMethodDisplay;
  final String paymentReference;
  final String status;
  final String statusDisplay;
  final List<PosTransactionItem> items;
  final int itemsCount;
  final String? voidedAt;
  final int? voidedBy;
  final String createdAt;
  final String updatedAt;

  PosTransaction({
    required this.id,
    this.transactionNumber = '',
    this.branch = 0,
    this.branchName = '',
    this.cashier = 0,
    this.cashierName = '',
    this.customerName = '',
    this.customerPhone = '',
    this.shift,
    this.subtotal = 0,
    this.discount = 0,
    this.tax = 0,
    this.total = 0,
    this.paymentMethod = 'cash',
    this.paymentMethodDisplay = '',
    this.paymentReference = '',
    this.status = 'completed',
    this.statusDisplay = '',
    this.items = const [],
    this.itemsCount = 0,
    this.voidedAt,
    this.voidedBy,
    this.createdAt = '',
    this.updatedAt = '',
  });

  factory PosTransaction.fromJson(Map<String, dynamic> j) {
    double num(dynamic v) => double.tryParse(v?.toString() ?? '0') ?? 0;
    return PosTransaction(
      id: j['id'] as int? ?? 0,
      transactionNumber: j['transaction_number']?.toString() ?? '',
      branch: j['branch'] as int? ?? 0,
      branchName: j['branch_name']?.toString() ?? '',
      cashier: j['cashier'] as int? ?? 0,
      cashierName: j['cashier_name']?.toString() ?? '',
      customerName: j['customer_name']?.toString() ?? '',
      customerPhone: j['customer_phone']?.toString() ?? '',
      shift: j['shift'] as int?,
      subtotal: num(j['subtotal']),
      discount: num(j['discount']),
      tax: num(j['tax']),
      total: num(j['total']),
      paymentMethod: j['payment_method']?.toString() ?? 'cash',
      paymentMethodDisplay: j['payment_method_display']?.toString() ?? '',
      paymentReference: j['payment_reference']?.toString() ?? '',
      status: j['status']?.toString() ?? 'completed',
      statusDisplay: j['status_display']?.toString() ?? '',
      items: (j['items'] as List? ?? [])
          .map((e) => PosTransactionItem.fromJson(e as Map<String, dynamic>))
          .toList(),
      itemsCount: j['items_count'] as int? ?? 0,
      voidedAt: j['voided_at']?.toString(),
      voidedBy: j['voided_by'] as int?,
      createdAt: j['created_at']?.toString() ?? '',
      updatedAt: j['updated_at']?.toString() ?? '',
    );
  }
}

// ── Parked Sale ──────────────────────────────────────────────────

class ParkedSale {
  final int id;
  final int branch;
  final String branchName;
  final int cashier;
  final String cashierName;
  final String customerName;
  final String customerPhone;
  final String notes;
  final List<CartItem> itemsData;
  final double total;
  final int itemCount;
  final String createdAt;

  ParkedSale({
    required this.id,
    this.branch = 0,
    this.branchName = '',
    this.cashier = 0,
    this.cashierName = '',
    this.customerName = '',
    this.customerPhone = '',
    this.notes = '',
    this.itemsData = const [],
    this.total = 0,
    this.itemCount = 0,
    this.createdAt = '',
  });

  factory ParkedSale.fromJson(Map<String, dynamic> j) {
    final itemsRaw = j['items_data'] as List? ?? [];
    return ParkedSale(
      id: j['id'] as int? ?? 0,
      branch: j['branch'] as int? ?? 0,
      branchName: j['branch_name']?.toString() ?? '',
      cashier: j['cashier'] as int? ?? 0,
      cashierName: j['cashier_name']?.toString() ?? '',
      customerName: j['customer_name']?.toString() ?? '',
      customerPhone: j['customer_phone']?.toString() ?? '',
      notes: j['notes']?.toString() ?? '',
      itemsData: itemsRaw.map((e) {
        final m = e as Map<String, dynamic>;
        return CartItem(
          id: m['id'] as int? ?? 0,
          name: m['name']?.toString() ?? '',
          price: m['price']?.toString() ?? '0',
          qty: (m['qty'] as num?)?.toDouble() ?? 1,
          max: (m['max'] as num?)?.toDouble() ?? 9999,
          sku: m['sku']?.toString() ?? '',
          taxRate: m['tax_rate']?.toString() ?? '0',
          image: m['image']?.toString(),
        );
      }).toList(),
      total: double.tryParse(j['total']?.toString() ?? '0') ?? 0,
      itemCount: j['item_count'] as int? ?? itemsRaw.length,
      createdAt: j['created_at']?.toString() ?? '',
    );
  }
}

// ── POS Shift ────────────────────────────────────────────────────

class PosShift {
  final int id;
  final String reference;
  final int branch;
  final String branchName;
  final int cashier;
  final String cashierName;
  final double openingFloat;
  final double expectedCash;
  final double? actualCash;
  final double? cashVariance;
  final double grossRevenue;
  final double totalDiscounts;
  final double totalTax;
  final int transactionCount;
  final String notes;
  final String status;
  final String statusDisplay;
  final String duration;
  final String openedAt;
  final String? closedAt;

  PosShift({
    required this.id,
    this.reference = '',
    this.branch = 0,
    this.branchName = '',
    this.cashier = 0,
    this.cashierName = '',
    this.openingFloat = 0,
    this.expectedCash = 0,
    this.actualCash,
    this.cashVariance,
    this.grossRevenue = 0,
    this.totalDiscounts = 0,
    this.totalTax = 0,
    this.transactionCount = 0,
    this.notes = '',
    this.status = 'open',
    this.statusDisplay = '',
    this.duration = '',
    this.openedAt = '',
    this.closedAt,
  });

  factory PosShift.fromJson(Map<String, dynamic> j) {
    double num(dynamic v) => double.tryParse(v?.toString() ?? '0') ?? 0;
    return PosShift(
      id: j['id'] as int? ?? 0,
      reference: j['reference']?.toString() ?? '',
      branch: j['branch'] as int? ?? 0,
      branchName: j['branch_name']?.toString() ?? '',
      cashier: j['cashier'] as int? ?? 0,
      cashierName: j['cashier_name']?.toString() ?? '',
      openingFloat: num(j['opening_float']),
      expectedCash: num(j['expected_cash']),
      actualCash: j['actual_cash'] != null ? num(j['actual_cash']) : null,
      cashVariance: j['cash_variance'] != null ? num(j['cash_variance']) : null,
      grossRevenue: num(j['gross_revenue']),
      totalDiscounts: num(j['total_discounts']),
      totalTax: num(j['total_tax']),
      transactionCount: j['transaction_count'] as int? ?? 0,
      notes: j['notes']?.toString() ?? '',
      status: j['status']?.toString() ?? 'open',
      statusDisplay: j['status_display']?.toString() ?? '',
      duration: j['duration']?.toString() ?? '',
      openedAt: j['opened_at']?.toString() ?? '',
      closedAt: j['closed_at']?.toString(),
    );
  }
}
