/**
 * Customer module type definitions.
 * Field names mirror the backend Customer serializer (customers/models.py).
 * Decimal fields are represented as strings (DRF default) or numbers.
 */

export interface Customer {
  id: number
  customer_code: string
  customer_type: 'individual' | 'business' | string
  first_name: string
  last_name: string
  company_name: string
  full_name: string // read-only, backend-computed
  email: string
  phone: string
  secondary_phone: string
  address_line1: string
  address_line2: string
  city: string
  state_province: string
  postal_code: string
  country: string
  date_of_birth: string | null // 'YYYY-MM-DD'
  gender: string
  loyalty_points: number
  loyalty_tier: string // 'bronze' | 'silver' | 'gold' | 'platinum' | ...
  loyalty_member_since: string | null
  credit_limit: number | string
  current_credit_balance: number | string
  preferred_branch: number | null
  tax_exempt: boolean
  tax_id: string
  notes: string
  is_active: boolean
  // M2M — list of CustomerGroup ids
  groups: number[]
  created_at: string
  updated_at: string
}

export interface CustomerGroup {
  id: number
  name: string
  description: string
  discount_percent: number | string
  customers: number[]
}

export type InteractionType =
  | 'call'
  | 'email'
  | 'visit'
  | 'note'
  | 'complaint'
  | 'feedback'
  | string

export interface CustomerInteraction {
  id?: number
  customer: number
  interaction_type: InteractionType
  subject: string
  notes: string
  handled_by: number | null
  created_at?: string
}
