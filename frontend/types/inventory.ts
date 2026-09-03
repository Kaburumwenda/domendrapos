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

// ===== Stock Take Types =====

export type StockTakeType = 'full' | 'partial' | 'cycle' | 'abc'
export type StockTakeStatus =
  | 'draft' | 'in_progress' | 'completed' | 'reviewed' | 'reconciled' | 'cancelled'
export type StockTakeLineStatus = 'pending' | 'counted' | 'flagged' | 'not_found'

export interface StockTakeLine {
  id: number
  stock_count: number
  product: number
  variant: number | null
  product_name: string
  product_sku: string
  unit_name: string
  category: string | null
  system_quantity: string
  counted_quantity: string
  variance: string
  unit_cost: string
  value_variance: string
  line_status: StockTakeLineStatus
  line_status_display: string
  counted_by: number | null
  counted_by_name: string
  counted_at: string | null
  notes: string
}

export interface StockTake {
  id: number
  count_number: string
  title: string
  branch: number
  branch_name: string
  branch_code: string
  count_type: StockTakeType
  count_type_display: string
  status: StockTakeStatus
  status_display: string
  scheduled_date: string
  started_at: string | null
  completed_at: string | null
  reviewed_at: string | null
  reconciled_at: string | null
  total_items: number
  counted_items: number
  total_variance_qty: string
  total_variance_value: string
  notes: string
  created_by: number | null
  created_by_name: string
  assigned_to: number | null
  assigned_to_name: string
  reviewed_by: number | null
  reviewed_by_name: string
  lines: StockTakeLine[]
  line_count: number
}

export interface StockTakeSummary {
  total: number
  draft: number
  in_progress: number
  completed: number
  reviewed: number
  reconciled: number
  total_variance_value: number | string
}

export interface StockTakeLineDraft {
  id: number
  counted_quantity: number
  line_status: StockTakeLineStatus
  notes: string
}
