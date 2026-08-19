/**
 * Supplier module type definitions.
 * Field names mirror the backend Supplier / SupplierProduct serializers.
 * Decimal fields are represented as strings (DRF default) or numbers.
 */

export interface Supplier {
  id: number
  supplier_code: string
  name: string
  contact_person: string
  email: string
  phone: string
  website: string
  address_line1: string
  address_line2: string
  city: string
  state_province: string
  postal_code: string
  country: string
  tax_id: string
  payment_terms: string
  currency_code: string
  lead_time_days: number
  minimum_order_value: number | string
  is_active: boolean
  rating: number | string
  notes: string
  created_at: string
  updated_at: string
}

export interface SupplierProduct {
  id: number
  supplier: number
  product: number
  supplier_sku: string
  supplier_price: number | string
  minimum_order_qty: number | string
  is_preferred: boolean
}
