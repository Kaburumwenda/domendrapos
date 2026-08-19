// ===== Inventory & Stock Adjustment Types =====

export type AdjustmentType = 'increase' | 'decrease' | 'set'
export type AdjustmentReason =
  | 'cycle_count' | 'damage' | 'theft' | 'expiry'
  | 'sample' | 'gift' | 'conversion' | 'clerical' | 'quality'
  | 'po_received' | 'other'
export type AdjustmentStatus =
  | 'draft' | 'pending' | 'approved' | 'rejected' | 'posted' | 'cancelled'

export interface StockAdjustmentLine {
  id: number
  adjustment: number
  product: number
  variant: number | null
  product_name: string
  product_sku: string
  unit_name: string
  system_quantity: string
  counted_quantity: string
  quantity_change: string
  unit_cost: string
  value_impact: string
  notes: string
}

export interface StockAdjustment {
  id: number
  adjustment_number: string
  branch: number
  branch_name: string
  branch_code: string
  adjustment_type: AdjustmentType
  adjustment_type_display: string
  reason: AdjustmentReason
  reason_display: string
  status: AdjustmentStatus
  status_display: string
  adjustment_date: string
  notes: string
  total_quantity: string
  total_value_impact: string
  created_by: number | null
  created_by_name: string
  requested_by: number | null
  approved_by: number | null
  approved_by_name: string
  created_at: string
  updated_at: string
  approved_at: string | null
  posted_at: string | null
  lines: StockAdjustmentLine[]
  line_count: number
}

export interface AdjustmentSummary {
  total: number
  pending: number
  approved: number
  posted: number
  draft: number
  total_value_impact: number | string
}

export interface AdjustmentLineDraft {
  product: number | ''
  product_name?: string
  system_quantity: number
  counted_quantity: number
  unit_cost: number
  notes: string
}

// ===== Stock Analysis Types =====

export interface StockAnalysisKPIs {
  total_skus: number
  total_units: number
  total_cost_value: number | string
  total_retail_value: number | string
  potential_profit: number | string
  in_stock: number
  low_stock: number
  out_of_stock: number
  reorder_items: number
}

export interface CategoryValue {
  category: string
  value: number | string
  units: number | string
  count: number
}

export interface TopStockItem {
  id: number
  product_name: string
  product_sku: string
  category: string | null
  quantity_on_hand: number | string
  cost_price: number | string
  retail_price: number | string
  stock_value: number | string
  reorder_level: number | string
  branch_name: string
}

export interface MovementSummaryItem {
  movement_type: string
  label: string
  count: number
  quantity: number | string
}

export interface ABCItem extends TopStockItem {
  class: 'A' | 'B' | 'C'
  cumulative_pct: number
}

export interface LowStockAlert {
  id: number
  product_name: string
  product_sku: string
  category: string | null
  quantity_on_hand: number | string
  reorder_level: number | string
  reorder_qty: number | string
  cost_price: number | string
  branch_name: string
}

export interface StockAnalysisData {
  kpis: StockAnalysisKPIs
  by_category: CategoryValue[]
  top_by_value: TopStockItem[]
  movement_summary: MovementSummaryItem[]
  abc_analysis: ABCItem[]
  abc_counts: { A: number; B: number; C: number }
  low_stock_items: LowStockAlert[]
}
