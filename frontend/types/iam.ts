/* IAM & Security — RBAC types */

export type RoleName =
  | 'super_admin'
  | 'tenant_admin'
  | 'manager'
  | 'cashier'
  | 'inventory_clerk'
  | 'accountant'
  | 'sales_associate'
  | 'viewer'

export type ModuleName =
  | 'products'
  | 'inventory'
  | 'sales'
  | 'payments'
  | 'customers'
  | 'suppliers'
  | 'purchasing'
  | 'accounting'
  | 'reports'
  | 'analytics'
  | 'staff'
  | 'branches'
  | 'settings'

export type ActionName =
  | 'view'
  | 'create'
  | 'edit'
  | 'delete'
  | 'approve'
  | 'export'

export interface Permission {
  id: number
  module: ModuleName
  action: ActionName
  description: string
}

export interface RolePermission {
  id: number
  role: RoleName
  permission: number
  permission_detail?: Permission
}

/** Backend `/role-permissions/matrix/` response — role → module → actions[] */
export type PermissionMatrix = Record<RoleName, Record<ModuleName, ActionName[]>>

/** Backend `/staff/?role=manager` user entry (subset of fields we need) */
export interface StaffSummary {
  id: number
  email: string
  first_name: string
  last_name: string
  role: RoleName
  is_active_employee: boolean
  employee_id: string
  date_joined: string
}

/* ----------------------------------------------------------------- Audit */

export type AuditAction =
  | 'create'
  | 'update'
  | 'delete'
  | 'login'
  | 'logout'
  | 'approve'
  | 'reject'
  | 'void'
  | 'refund'
  | 'export'
  | 'config_change'

export interface AuditLog {
  id: number
  user_email: string
  user_id: number | null
  action: AuditAction
  action_label: string
  action_color: string
  resource_type: string
  resource_label: string
  resource_id: string
  description: string
  old_values: Record<string, any> | null
  new_values: Record<string, any> | null
  ip_address: string | null
  user_agent: string
  timestamp: string
}

export interface AuditSummary {
  total: number
  recent_24h: number
  recent_7d: number
  by_action: { action: AuditAction; count: number }[]
  by_resource: { resource_type: string; count: number }[]
  by_user: { user_email: string; count: number }[]
  by_day: { date: string; count: number }[]
}
