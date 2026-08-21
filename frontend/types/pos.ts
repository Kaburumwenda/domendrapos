// ===== POS Domain Types =====

export interface PosProduct {
  id: number
  name: string
  sku: string
  barcode: string
  image: string | null
  category: number | null
  category_name: string
  retail_price: string
  wholesale_price: string
  cost_price: string
  tax_rate: string
  unit: string
  items_per_unit: number
  is_active: boolean
  is_sellable: boolean
  quantity_on_hand: string | number
  reorder_level: string | number
  product_type: string
  brand: string | null
  manufacturer: string | null
  description: string
}

export interface CartItem {
  id: number
  name: string
  price: number
  qty: number
  max: number
  sku: string
  tax_rate: number
  image: string | null
  discount: number
  unit: string
  items_per_unit: number
}

export type PaymentMethod = 'cash' | 'mpesa' | 'card' | 'insurance' | 'credit' | 'bank_transfer'

export type DiscountType = 'percentage' | 'fixed'

export interface CartDiscount {
  type: DiscountType
  value: number
}

export type PosTransactionStatus = 'completed' | 'pending' | 'voided' | 'cancelled' | 'refunded'

export interface PosTransaction {
  id: number
  transaction_number: string
  branch: number
  branch_name: string
  cashier: number
  cashier_name: string
  customer_name: string
  customer_phone: string
  shift: number | null
  subtotal: string
  discount: string
  tax: string
  total: string
  payment_method: PaymentMethod
  payment_method_display: string
  payment_reference: string
  status: PosTransactionStatus
  status_display: string
  items: PosTransactionItem[]
  items_count: number
  voided_at: string | null
  voided_by: number | null
  created_at: string
  updated_at: string
}

export interface PosTransactionItem {
  id: number
  transaction: number
  product: number
  variant: number | null
  product_name: string
  quantity: string
  unit_price: string
  line_total: string
}

export interface ParkedSale {
  id: number
  branch: number
  branch_name: string
  cashier: number
  cashier_name: string
  customer_name: string
  customer_phone: string
  notes: string
  items_data: CartItem[]
  total: string
  item_count: number
  created_at: string
  expires_at: string
}

// ===== Shift Types =====

export type ShiftStatus = 'open' | 'closed'

export interface PosShift {
  id: number
  reference: string
  branch: number
  branch_name: string
  cashier: number
  cashier_name: string
  opening_float: string
  expected_cash: string
  actual_cash: string | null
  cash_variance: string
  gross_revenue: string
  total_discounts: string
  total_tax: string
  transaction_count: number
  notes: string
  status: ShiftStatus
  status_display: string
  duration: string
  opened_at: string
  closed_at: string | null
}

export interface PosShift {
  id: number
  reference: string
  branch: number
  branch_name: string
  cashier: number
  cashier_name: string
  opening_float: string
  expected_cash: string
  actual_cash: string | null
  cash_variance: string | null
  gross_revenue: string
  total_discounts: string
  total_tax: string
  transaction_count: number
  status: 'open' | 'closed'
  status_display: string
  duration: string
  opened_at: string
  closed_at: string | null
}

export interface PosCredit {
  id: number
  transaction: number
  transaction_number: string
  branch: number
  branch_name: string
  customer_name: string
  customer_phone: string
  total_amount: string
  amount_paid: string
  balance: string
  due_date: string | null
  status: 'open' | 'partial' | 'settled' | 'overdue'
  status_display: string
  payments: PosCreditPayment[]
  items: { product_name: string; quantity: string; line_total: string }[]
  created_at: string
}

export interface PosCreditPayment {
  id: number
  credit: number
  amount: string
  payment_method: string
  reference: string
  recorded_by: number
  recorded_by_name: string
  created_at: string
}

export interface PosCategory {
  id: number
  name: string
  description: string
  is_active: boolean
  parent: number | null
}

export interface Branch {
  id: number
  name: string
  code: string
  is_headquarters: boolean
  is_active: boolean
  phone: string
  email: string
  city: string
  country: string
  tax_rate: string | number
}

export interface Customer {
  id: number
  customer_code: string
  full_name: string
  first_name: string
  last_name: string
  phone: string
  email: string
  loyalty_points: number
  loyalty_tier: string
  current_credit_balance: string
  tax_exempt: boolean
  is_active: boolean
}
