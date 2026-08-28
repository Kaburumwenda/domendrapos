<template>
  <div class="adj-page">
    <!-- ===== Header ===== -->
    <div class="adj-header">
      <div class="adj-header__left">
        <div class="adj-header__title">
          <h1 class="text-h5 font-weight-bold">Stock Adjustments</h1>
          <p class="text-body-2 text-medium-emphasis">Correct stock discrepancies with audit trail and approval workflow</p>
        </div>
      </div>
      <div class="adj-header__actions">
        <v-btn variant="tonal" prepend-icon="mdi-refresh" size="small" @click="loadData" :loading="loading">Refresh</v-btn>
        <v-btn variant="flat" color="primary" prepend-icon="mdi-plus-circle" @click="openCreateDialog">New Adjustment</v-btn>
      </div>
    </div>

    <!-- ===== KPI Cards ===== -->
    <div class="adj-kpi-grid">
      <div class="adj-kpi">
        <div class="adj-kpi__icon adj-kpi__icon--primary"><v-icon size="22">mdi-clipboard-list-outline</v-icon></div>
        <div class="adj-kpi__body">
          <p class="adj-kpi__label">Total</p>
          <p class="adj-kpi__value">{{ summary.total || 0 }}</p>
        </div>
      </div>
      <div class="adj-kpi">
        <div class="adj-kpi__icon adj-kpi__icon--warning"><v-icon size="22">mdi-clock-alert-outline</v-icon></div>
        <div class="adj-kpi__body">
          <p class="adj-kpi__label">Pending Approval</p>
          <p class="adj-kpi__value text-warning">{{ summary.pending || 0 }}</p>
        </div>
      </div>
      <div class="adj-kpi">
        <div class="adj-kpi__icon adj-kpi__icon--info"><v-icon size="22">mdi-check-decagram</v-icon></div>
        <div class="adj-kpi__body">
          <p class="adj-kpi__label">Approved</p>
          <p class="adj-kpi__value text-info">{{ summary.approved || 0 }}</p>
        </div>
      </div>
      <div class="adj-kpi">
        <div class="adj-kpi__icon adj-kpi__icon--success"><v-icon size="22">mdi-package-check</v-icon></div>
        <div class="adj-kpi__body">
          <p class="adj-kpi__label">Posted</p>
          <p class="adj-kpi__value text-success">{{ summary.posted || 0 }}</p>
        </div>
      </div>
      <div class="adj-kpi adj-kpi--wide">
        <div class="adj-kpi__icon adj-kpi__icon--neutral"><v-icon size="22">mdi-cash-refund</v-icon></div>
        <div class="adj-kpi__body">
          <p class="adj-kpi__label">Value Impact</p>
          <p class="adj-kpi__value" :class="valueImpactNegative ? 'text-error' : ''">{{ formatMoney(summary.total_value_impact) }}</p>
        </div>
      </div>
    </div>

    <!-- ===== Toolbar ===== -->
    <div class="adj-toolbar">
      <div class="adj-toolbar__search">
        <v-icon size="18" class="adj-toolbar__icon">mdi-magnify</v-icon>
        <input v-model="search" class="adj-toolbar__input" placeholder="Search by number, reason, or product..." />
      </div>
      <div class="adj-toolbar__selects">
        <select v-model="statusFilter" class="adj-toolbar__select">
          <option value="">All Statuses</option>
          <option v-for="s in statusList" :key="s.value" :value="s.value">{{ s.label }}</option>
        </select>
        <select v-model="reasonFilter" class="adj-toolbar__select">
          <option value="">All Reasons</option>
          <option v-for="r in reasonList" :key="r.value" :value="r.value">{{ r.label }}</option>
        </select>
      </div>
    </div>

    <!-- ===== Filter Pills ===== -->
    <div class="adj-pills">
      <button
        v-for="f in statusPills"
        :key="f.value"
        class="adj-pills__pill"
        :class="{ 'adj-pills__pill--active': statusFilter === f.value }"
        @click="statusFilter = f.value"
      >
        <span class="adj-pills__dot" :class="`adj-pills__dot--${f.value}`"></span>
        {{ f.label }}
        <span class="adj-pills__count">{{ f.count }}</span>
      </button>
    </div>

    <!-- ===== Table ===== -->
    <div class="adj-table-wrap">
      <div v-if="loading" class="adj-loading">
        <v-progress-circular indeterminate size="32" color="primary" />
        <p class="text-body-2 text-medium-emphasis mt-2">Loading adjustments...</p>
      </div>
      <div v-else-if="filteredAdjustments.length === 0" class="adj-empty">
        <v-icon size="48" class="text-medium-emphasis">mdi-clipboard-off-outline</v-icon>
        <p class="text-h6 mt-2">No adjustments found</p>
        <p class="text-body-2 text-medium-emphasis">{{ search || statusFilter || reasonFilter ? 'Try different filters.' : 'Create a new adjustment to get started.' }}</p>
        <v-btn variant="tonal" color="primary" size="small" class="mt-3" prepend-icon="mdi-plus-circle" @click="openCreateDialog">New Adjustment</v-btn>
      </div>
      <table v-else class="adj-table">
        <thead>
          <tr>
            <th>Adj. Number</th>
            <th>Reason</th>
            <th>Type</th>
            <th>Date</th>
            <th class="text-right">Lines</th>
            <th class="text-right">Qty</th>
            <th class="text-right">Value Impact</th>
            <th>Created By</th>
            <th>Status</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="adj in paginatedAdjustments" :key="adj.id" class="adj-table__row" @click="viewDetails(adj)">
            <td>
              <div class="adj-table__num">{{ adj.adjustment_number }}</div>
              <div class="adj-table__sub">{{ adj.branch_name }}</div>
            </td>
            <td>
              <div class="adj-table__reason">
                <div class="adj-table__reason-icon" :class="`adj-table__reason-icon--${adj.reason}`">
                  <v-icon size="14">{{ reasonIcon(adj.reason) }}</v-icon>
                </div>
                {{ adj.reason_display }}
              </div>
            </td>
            <td>
              <span class="adj-table__type" :class="`adj-table__type--${adj.adjustment_type}`">
                <v-icon size="12">{{ typeIcon(adj.adjustment_type) }}</v-icon>
                {{ adj.adjustment_type_display }}
              </span>
            </td>
            <td class="text-medium-emphasis">{{ formatDate(adj.adjustment_date) }}</td>
            <td class="text-right font-weight-medium">{{ adj.line_count }}</td>
            <td class="text-right">{{ adj.total_quantity }}</td>
            <td class="text-right">
              <span class="adj-table__value" :class="valueNegative(adj.total_value_impact) ? 'adj-table__value--neg' : 'adj-table__value--pos'">
                {{ valueNegative(adj.total_value_impact) ? '' : '+' }}{{ formatMoney(adj.total_value_impact) }}
              </span>
            </td>
            <td class="text-medium-emphasis">{{ adj.created_by_name || '—' }}</td>
            <td>
              <span class="adj-table__status" :class="`adj-table__status--${adj.status}`">
                <span class="adj-table__status-dot"></span>
                {{ adj.status_display }}
              </span>
            </td>
            <td>
              <div class="adj-table__actions" @click.stop>
                <button v-if="adj.status === 'draft'" class="adj-action-btn adj-action-btn--submit" @click="submitAdj(adj)" title="Submit for approval">
                  <v-icon size="14">mdi-send-outline</v-icon>
                </button>
                <button v-if="adj.status === 'pending'" class="adj-action-btn adj-action-btn--approve" @click="approveAdj(adj)" title="Approve">
                  <v-icon size="14">mdi-check</v-icon>
                </button>
                <button v-if="adj.status === 'pending'" class="adj-action-btn adj-action-btn--reject" @click="rejectAdj(adj)" title="Reject">
                  <v-icon size="14">mdi-close</v-icon>
                </button>
                <button v-if="adj.status === 'approved' || adj.status === 'draft'" class="adj-action-btn adj-action-btn--post" @click="postAdj(adj)" title="Post to stock">
                  <v-icon size="14">mdi-package-up</v-icon>
                </button>
                <button v-if="['draft', 'pending', 'approved'].includes(adj.status)" class="adj-action-btn adj-action-btn--cancel" @click="cancelAdj(adj)" title="Cancel">
                  <v-icon size="14">mdi-cancel</v-icon>
                </button>
                <button class="adj-action-btn adj-action-btn--view" @click="viewDetails(adj)" title="View details">
                  <v-icon size="14">mdi-eye-outline</v-icon>
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>

      <!-- Pagination -->
      <div v-if="filteredAdjustments.length > itemsPerPage" class="adj-pagination">
        <span class="adj-pagination__info">Showing {{ (page - 1) * itemsPerPage + 1 }}–{{ Math.min(page * itemsPerPage, filteredAdjustments.length) }} of {{ filteredAdjustments.length }}</span>
        <div class="adj-pagination__nav">
          <v-btn size="small" variant="text" :disabled="page === 1" @click="page--" prepend-icon="mdi-chevron-left">Prev</v-btn>
          <span class="adj-pagination__page">{{ page }} / {{ totalPages }}</span>
          <v-btn size="small" variant="text" :disabled="page === totalPages" @click="page++" append-icon="mdi-chevron-right">Next</v-btn>
        </div>
      </div>
    </div>

    <!-- ===== Create Dialog ===== -->
    <v-dialog v-model="createDialog" max-width="900" persistent>
      <v-card rounded="xl" class="adj-dialog">
        <div class="adj-dialog__header">
          <div class="adj-dialog__header-icon adj-dialog__header-icon--primary">
            <v-icon size="24">mdi-clipboard-edit-outline</v-icon>
          </div>
          <div class="flex-1">
            <h3 class="text-h6 font-weight-bold">New Stock Adjustment</h3>
            <p class="text-body-2 text-medium-emphasis">Correct stock levels with full audit trail</p>
          </div>
          <v-btn icon="mdi-close" variant="text" size="small" @click="createDialog = false" />
        </div>
        <v-divider />

        <!-- Form area -->
        <div class="adj-dialog__body">
          <div class="adj-form-grid">
            <div class="adj-form-field">
              <label class="adj-form__label">Branch</label>
              <select v-model="form.branch" class="adj-form__select">
                <option v-for="b in branches" :key="b.id" :value="b.id">{{ b.name }} ({{ b.code }})</option>
              </select>
            </div>
            <div class="adj-form-field">
              <label class="adj-form__label"> Adjustment Type</label>
              <select v-model="form.adjustment_type" class="adj-form__select">
                <option value="decrease">Quantity Decrease</option>
                <option value="increase">Quantity Increase</option>
                <option value="set">Set Exact Quantity</option>
              </select>
            </div>
            <div class="adj-form-field">
              <label class="adj-form__label">Reason</label>
              <select v-model="form.reason" class="adj-form__select">
                <option v-for="r in reasonList" :key="r.value" :value="r.value">{{ r.label }}</option>
              </select>
            </div>
            <div class="adj-form-field">
              <label class="adj-form__label">Adjustment Date</label>
              <input v-model="form.adjustment_date" type="date" class="adj-form__input" />
            </div>
          </div>
          <div class="adj-form-field" style="margin-top: 12px;">
            <label class="adj-form__label">Notes</label>
            <input v-model="form.notes" type="text" class="adj-form__input" placeholder="Additional context for this adjustment..." />
          </div>

          <!-- Line Items -->
          <div class="adj-lines">
            <div class="adj-lines__header">
              <h4 class="adj-lines__title">Line Items</h4>
              <button class="adj-lines__add" @click="addLine">
                <v-icon size="16">mdi-plus-circle-outline</v-icon>
                Add Product
              </button>
            </div>

            <div class="adj-lines__scroll">
              <table class="adj-lines-table">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th class="text-right">System Qty</th>
                    <th class="text-right">Counted Qty</th>
                    <th class="text-right">Unit Cost</th>
                    <th class="text-right">Change</th>
                    <th class="text-right">Value</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(line, i) in form.lines" :key="i">
                    <td>
                      <select v-model="line.product" class="adj-lines-table__select" @change="onProductSelect(i)">
                        <option value="">Select product...</option>
                        <option v-for="p in products" :key="p.id" :value="p.id">{{ p.name }} ({{ p.sku }})</option>
                      </select>
                    </td>
                    <td class="text-right text-medium-emphasis">{{ line.system_quantity }}</td>
                    <td>
                      <input v-model.number="line.counted_quantity" type="number" step="0.001" class="adj-lines-table__qty" />
                    </td>
                    <td>
                      <input v-model.number="line.unit_cost" type="number" step="0.01" class="adj-lines-table__cost" />
                    </td>
                    <td class="text-right">
                      <span class="adj-lines-table__change" :class="lineQtyChange(line) < 0 ? 'adj-lines-table__change--neg' : 'adj-lines-table__change--pos'">
                        {{ lineQtyChange(line) >= 0 ? '+' : '' }}{{ lineQtyChange(line).toFixed(3) }}
                      </span>
                    </td>
                    <td class="text-right text-medium-emphasis">{{ formatMoney(lineValue(line)) }}</td>
                    <td>
                      <button class="adj-lines-table__remove" @click="removeLine(i)">
                        <v-icon size="16">mdi-trash-can-outline</v-icon>
                      </button>
                    </td>
                  </tr>
                  <tr v-if="form.lines.length === 0">
                    <td colspan="7" class="adj-lines-table__empty">
                      No products added. Click "Add Product" to start.
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <!-- Totals bar -->
            <div class="adj-lines__totals">
              <div class="adj-lines__total">
                <span class="adj-lines__total-label">Total Qty Change:</span>
                <span class="adj-lines__total-value">{{ totalQuantity }}</span>
              </div>
              <div class="adj-lines__total">
                <span class="adj-lines__total-label">Total Value Impact:</span>
                <span class="adj-lines__total-value" :class="totalValue < 0 ? 'text-error' : ''">{{ formatMoney(totalValue) }}</span>
              </div>
            </div>
          </div>
        </div>

        <v-divider />
        <div class="adj-dialog__actions">
          <v-btn variant="text" @click="createDialog = false">Cancel</v-btn>
          <v-btn variant="tonal" prepend-icon="mdi-content-save-outline" :loading="saving" @click="save('draft')">Save Draft</v-btn>
          <v-btn variant="flat" color="primary" prepend-icon="mdi-send-check" :loading="saving" @click="save('pending')">Submit for Approval</v-btn>
        </div>
      </v-card>
    </v-dialog>

    <!-- ===== Details Dialog ===== -->
    <v-dialog v-model="detailsDialog" max-width="720">
      <v-card v-if="details" rounded="xl" class="adj-dialog">
        <div class="adj-dialog__header" :class="`adj-dialog__header--${details.status}`">
          <div class="adj-dialog__header-icon" :class="`adj-dialog__header-icon--${details.status}`">
            <v-icon size="24">{{ reasonIcon(details.reason) }}</v-icon>
          </div>
          <div class="flex-1">
            <span class="adj-detail__doc-type">STOCK ADJUSTMENT</span>
            <h3 class="text-h6 font-weight-bold mt-1">{{ details.adjustment_number }}</h3>
          </div>
          <span class="adj-detail__status-large" :class="`adj-detail__status-large--${details.status}`">
            {{ details.status_display }}
          </span>
        </div>
        <v-divider />

        <div class="adj-dialog__body">
          <!-- Meta grid -->
          <div class="adj-detail__meta-grid">
            <div class="adj-detail__meta-item">
              <span class="adj-detail__meta-label">Reason</span>
              <span class="adj-detail__meta-value">{{ details.reason_display }}</span>
            </div>
            <div class="adj-detail__meta-item">
              <span class="adj-detail__meta-label">Type</span>
              <span class="adj-detail__meta-value">{{ details.adjustment_type_display }}</span>
            </div>
            <div class="adj-detail__meta-item">
              <span class="adj-detail__meta-label">Branch</span>
              <span class="adj-detail__meta-value">{{ details.branch_name }}</span>
            </div>
            <div class="adj-detail__meta-item">
              <span class="adj-detail__meta-label">Date</span>
              <span class="adj-detail__meta-value">{{ formatDate(details.adjustment_date) }}</span>
            </div>
            <div class="adj-detail__meta-item">
              <span class="adj-detail__meta-label">Created By</span>
              <span class="adj-detail__meta-value">{{ details.created_by_name || '—' }}</span>
            </div>
            <div class="adj-detail__meta-item">
              <span class="adj-detail__meta-label">Approved By</span>
              <span class="adj-detail__meta-value">{{ details.approved_by_name || '—' }}</span>
            </div>
            <div class="adj-detail__meta-item">
              <span class="adj-detail__meta-label">Created</span>
              <span class="adj-detail__meta-value">{{ formatDateTime(details.created_at) }}</span>
            </div>
            <div class="adj-detail__meta-item" v-if="details.posted_at">
              <span class="adj-detail__meta-label">Posted At</span>
              <span class="adj-detail__meta-value">{{ formatDateTime(details.posted_at) }}</span>
            </div>
          </div>

          <!-- Notes -->
          <div v-if="details.notes" class="adj-detail__notes">
            <v-icon size="16" class="mr-2">mdi-note-text-outline</v-icon>
            {{ details.notes }}
          </div>

          <!-- Line Items -->
          <h4 class="adj-detail__lines-title">Line Items ({{ details.lines?.length || 0 }})</h4>
          <div class="adj-detail__lines-wrap">
            <table class="adj-detail-table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th class="text-right">System</th>
                  <th class="text-right">Counted</th>
                  <th class="text-right">Change</th>
                  <th class="text-right">Value</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="line in details.lines" :key="line.id">
                  <td>
                    <div class="adj-detail-table__product">{{ line.product_name }}</div>
                    <div class="adj-detail-table__sku">{{ line.product_sku }}</div>
                  </td>
                  <td class="text-right text-medium-emphasis">{{ line.system_quantity }}</td>
                  <td class="text-right">{{ line.counted_quantity }}</td>
                  <td class="text-right">
                    <span :class="Number(line.quantity_change) < 0 ? 'text-error' : 'text-success'">
                      {{ Number(line.quantity_change) >= 0 ? '+' : '' }}{{ line.quantity_change }}
                    </span>
                  </td>
                  <td class="text-right font-weight-medium" :class="Number(line.value_impact) < 0 ? 'text-error' : ''">{{ formatMoney(line.value_impact) }}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Summary totals -->
          <div class="adj-detail__summary">
            <div class="adj-detail__summary-row">
              <span>Total Quantity</span>
              <span class="font-weight-bold">{{ details.total_quantity }}</span>
            </div>
            <div class="adj-detail__summary-row adj-detail__summary-row--bold">
              <span>Total Value Impact</span>
              <span :class="Number(details.total_value_impact) < 0 ? 'text-error' : ''">{{ formatMoney(details.total_value_impact) }}</span>
            </div>
          </div>
        </div>

        <v-divider />
        <div class="adj-dialog__actions">
          <template v-if="details.status === 'draft'">
            <v-btn variant="tonal" color="warning" prepend-icon="mdi-send-outline" @click="submitAdj(details); detailsDialog = false">Submit</v-btn>
          </template>
          <template v-if="details.status === 'pending'">
            <v-btn variant="flat" color="success" prepend-icon="mdi-check" @click="approveAdj(details); detailsDialog = false">Approve</v-btn>
            <v-btn variant="flat" color="error" prepend-icon="mdi-close" @click="rejectAdj(details); detailsDialog = false">Reject</v-btn>
          </template>
          <template v-if="['approved', 'draft'].includes(details.status)">
            <v-btn variant="flat" color="primary" prepend-icon="mdi-package-up" @click="postAdj(details); detailsDialog = false">Post to Stock</v-btn>
          </template>
          <template v-if="['draft', 'pending', 'approved'].includes(details.status)">
            <v-btn variant="text" prepend-icon="mdi-cancel" @click="cancelAdj(details); detailsDialog = false">Cancel Adj</v-btn>
          </template>
          <v-btn variant="text" @click="detailsDialog = false">Close</v-btn>
        </div>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup lang="ts">
import type { StockAdjustment, AdjustmentSummary, AdjustmentLineDraft, AdjustmentReason, AdjustmentStatus } from '~/types/inventory'

definePageMeta({ middleware: 'auth' })
const toast = useToast()
const { currency } = useFormat()
const auth = useAuthStore()

function formatMoney(v: number | string | null | undefined): string {
  return currency(v || 0)
}

function formatDate(v: string) {
  return new Date(v).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}

function formatDateTime(v: string) {
  return new Date(v).toLocaleString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}

function valueNegative(v: string | number): boolean {
  return Number(v) < 0
}

const reasonList = [
  { value: 'cycle_count', label: 'Cycle Count Correction' },
  { value: 'damage', label: 'Damage / Spoilage' },
  { value: 'theft', label: 'Theft / Shrinkage' },
  { value: 'expiry', label: 'Expired / Obsolete' },
  { value: 'sample', label: 'Sample / Demo / Promotion' },
  { value: 'gift', label: 'Gift / Donation' },
  { value: 'conversion', label: 'Unit Conversion' },
  { value: 'clerical', label: 'Clerical / Data Entry Error' },
  { value: 'quality', label: 'Quality / Recall' },
  { value: 'po_received', label: 'PO Received' },
  { value: 'other', label: 'Other' },
] as const

const statusList = [
  { value: 'draft', label: 'Draft' },
  { value: 'pending', label: 'Pending' },
  { value: 'approved', label: 'Approved' },
  { value: 'rejected', label: 'Rejected' },
  { value: 'posted', label: 'Posted' },
  { value: 'cancelled', label: 'Cancelled' },
] as const

function reasonIcon(reason: string): string {
  const map: Record<string, string> = {
    cycle_count: 'mdi-clipboard-check-outline',
    damage: 'mdi-alert-octagon-outline',
    theft: 'mdi-shield-alert-outline',
    expiry: 'mdi-calendar-remove-outline',
    sample: 'mdi-gift-outline',
    gift: 'mdi-hand-heart-outline',
    conversion: 'mdi-swap-horizontal',
    clerical: 'mdi-keyboard-outline',
    quality: 'mdi-flag-checkered',
    po_received: 'mdi-package-down',
    other: 'mdi-dots-horizontal-circle-outline',
  }
  return map[reason] || 'mdi-clipboard-edit-outline'
}

function typeIcon(type: string): string {
  if (type === 'increase') return 'mdi-arrow-up'
  if (type === 'decrease') return 'mdi-arrow-down'
  return 'mdi-equal'
}

// ===== State =====
const loading = ref(false)
const saving = ref(false)
const adjustments = ref<StockAdjustment[]>([])
const summary = ref<Partial<AdjustmentSummary>>({})
const branches = ref<any[]>([])
const products = ref<any[]>([])

const search = ref('')
const statusFilter = ref('')
const reasonFilter = ref('')
const page = ref(1)
const itemsPerPage = 10

const createDialog = ref(false)
const detailsDialog = ref(false)
const details = ref<StockAdjustment | null>(null)

const today = new Date().toISOString().slice(0, 10)
const form = reactive<{
  branch: number | ''
  adjustment_type: string
  reason: AdjustmentReason | string
  adjustment_date: string
  notes: string
  lines: AdjustmentLineDraft[]
}>({
  branch: '',
  adjustment_type: 'decrease',
  reason: 'damage',
  adjustment_date: today,
  notes: '',
  lines: [],
})

const statusPills = computed(() => [
  { value: '', label: 'All', count: adjustments.value.length },
  { value: 'draft', label: 'Draft', count: adjustments.value.filter(a => a.status === 'draft').length },
  { value: 'pending', label: 'Pending', count: adjustments.value.filter(a => a.status === 'pending').length },
  { value: 'approved', label: 'Approved', count: adjustments.value.filter(a => a.status === 'approved').length },
  { value: 'posted', label: 'Posted', count: adjustments.value.filter(a => a.status === 'posted').length },
  { value: 'rejected', label: 'Rejected', count: adjustments.value.filter(a => a.status === 'rejected').length },
  { value: 'cancelled', label: 'Cancelled', count: adjustments.value.filter(a => a.status === 'cancelled').length },
])

const filteredAdjustments = computed(() => {
  let result = adjustments.value
  if (statusFilter.value) result = result.filter(a => a.status === statusFilter.value)
  if (reasonFilter.value) result = result.filter(a => a.reason === reasonFilter.value)
  if (search.value.trim()) {
    const q = search.value.trim().toLowerCase()
    result = result.filter(a =>
      a.adjustment_number?.toLowerCase().includes(q) ||
      a.reason_display?.toLowerCase().includes(q) ||
      a.branch_name?.toLowerCase().includes(q) ||
      a.created_by_name?.toLowerCase().includes(q)
    )
  }
  return result
})

const totalPages = computed(() => Math.max(1, Math.ceil(filteredAdjustments.value.length / itemsPerPage)))
const paginatedAdjustments = computed(() => {
  const start = (page.value - 1) * itemsPerPage
  return filteredAdjustments.value.slice(start, start + itemsPerPage)
})

watch([search, statusFilter, reasonFilter], () => { page.value = 1 })

const valueImpactNegative = computed(() => Number(summary.value.total_value_impact) < 0)

// ===== Line calculations =====
function lineQtyChange(line: AdjustmentLineDraft): number {
  return (Number(line.counted_quantity) || 0) - (Number(line.system_quantity) || 0)
}
function lineValue(line: AdjustmentLineDraft): number {
  return lineQtyChange(line) * (Number(line.unit_cost) || 0)
}
const totalQuantity = computed(() => form.lines.reduce((s, l) => s + Math.abs(lineQtyChange(l)), 0))
const totalValue = computed(() => form.lines.reduce((s, l) => s + lineValue(l), 0))

// ===== Actions =====
async function loadData() {
  loading.value = true
  try {
    const [adjRes, sumRes] = await Promise.all([
      useApi()('/inventory/adjustments/'),
      useApi()('/inventory/adjustments/summary/'),
    ])
    adjustments.value = adjRes.results || adjRes
    summary.value = sumRes
  } catch {
    toast.error('Failed to load adjustments')
  } finally {
    loading.value = false
  }
}

async function loadMeta() {
  try {
    const [br, pr] = await Promise.all([
      useApi()('/branches/'),
      useApi()('/products/?page_size=500'),
    ])
    branches.value = br.results || br
    products.value = pr.results || pr
  } catch {
    // ignore
  }
}

function openCreateDialog() {
  form.branch = branches.value[0]?.id || ''
  form.adjustment_type = 'decrease'
  form.reason = 'damage'
  form.adjustment_date = today
  form.notes = ''
  form.lines = []
  createDialog.value = true
}

function addLine() {
  form.lines.push({ product: '', system_quantity: 0, counted_quantity: 0, unit_cost: 0, notes: '' })
}

function removeLine(i: number) {
  form.lines.splice(i, 1)
}

function onProductSelect(i: number) {
  const line = form.lines[i]
  const product = products.value.find(p => p.id === line.product)
  if (product) {
    line.system_quantity = Number(product.quantity_on_hand) || 0
    line.unit_cost = Number(product.cost_price) || 0
  }
}

async function save(status: 'draft' | 'pending') {
  if (!form.branch) { toast.error('Please select a branch'); return }
  if (form.lines.length === 0) { toast.error('Add at least one product'); return }
  if (form.lines.some(l => !l.product)) { toast.error('Select a product on each line'); return }

  saving.value = true
  try {
    const body = {
      branch: form.branch,
      adjustment_type: form.adjustment_type,
      reason: form.reason,
      adjustment_date: form.adjustment_date,
      notes: form.notes,
      status: status === 'pending' ? 'pending' : 'draft',
      lines: form.lines.map(l => ({
        product: l.product,
        counted_quantity: Math.round((Number(l.counted_quantity) || 0) * 1000) / 1000,
        unit_cost: Math.round((Number(l.unit_cost) || 0) * 100) / 100,
        notes: l.notes || '',
      })),
    }
    await useApi()('/inventory/adjustments/', { method: 'POST', body })
    toast.success(status === 'pending' ? 'Adjustment submitted for approval' : 'Draft saved')
    createDialog.value = false
    await loadData()
  } catch (e: any) {
    const data = e?.data || e?.response?._data || {}
    const msg = data.detail || Object.values(data).flat().join(', ') || 'Failed to save adjustment'
    toast.error(typeof msg === 'string' ? msg : 'Failed to save adjustment')
  } finally {
    saving.value = false
  }
}

async function actionAdj(adj: StockAdjustment, action: string, successMsg: string) {
  try {
    await useApi()(`/inventory/adjustments/${adj.id}/${action}/`, { method: 'POST' })
    toast.success(successMsg)
    await loadData()
  } catch (e: any) {
    const data = e?.data || e?.response?._data || {}
    const msg = data.detail || `Failed to ${action} adjustment`
    toast.error(typeof msg === 'string' ? msg : `Failed to ${action} adjustment`)
  }
}

function submitAdj(adj: StockAdjustment) { actionAdj(adj, 'submit', 'Adjustment submitted for approval') }
function approveAdj(adj: StockAdjustment) { actionAdj(adj, 'approve', 'Adjustment approved') }
function rejectAdj(adj: StockAdjustment) { actionAdj(adj, 'reject', 'Adjustment rejected') }
function postAdj(adj: StockAdjustment) { actionAdj(adj, 'post_adjustment', 'Adjustment posted to stock') }
function cancelAdj(adj: StockAdjustment) { actionAdj(adj, 'cancel', 'Adjustment cancelled') }

async function viewDetails(adj: StockAdjustment) {
  try {
    const res = await useApi()(`/inventory/adjustments/${adj.id}/`)
    details.value = res as StockAdjustment
    detailsDialog.value = true
  } catch {
    toast.error('Failed to load details')
  }
}

onMounted(async () => {
  await Promise.all([loadData(), loadMeta()])
})
</script>

<style scoped>
/* ===== Page Shell ===== */
.adj-page {
  padding: 0 0 24px 0;
  width: 100%;
}

/* ===== Header ===== */
.adj-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 16px;
  margin-bottom: 24px;
  flex-wrap: wrap;
}
.adj-header__left { display: flex; align-items: flex-start; gap: 12px; }
.adj-header__title h1 { letter-spacing: -0.02em; line-height: 1.2; }
.adj-header__actions { display: flex; gap: 8px; flex-wrap: wrap; }

/* ===== KPI Cards ===== */
.adj-kpi-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 12px;
  margin-bottom: 20px;
}
@media (max-width: 1280px) {
  .adj-kpi-grid { grid-template-columns: repeat(3, 1fr); }
}
@media (max-width: 768px) {
  .adj-kpi-grid { grid-template-columns: repeat(2, 1fr); }
}
@media (max-width: 480px) {
  .adj-kpi-grid { grid-template-columns: 1fr; }
}
.adj-kpi {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 16px 18px;
  border-radius: 14px;
  border: 1px solid rgba(var(--v-theme-on-surface), 0.08);
  background: rgb(var(--v-theme-surface));
  transition: box-shadow 0.2s;
}
.adj-kpi:hover { box-shadow: 0 2px 12px rgba(0,0,0,0.06); }
.adj-kpi--wide { grid-column: span 1; }
.adj-kpi__icon {
  display: flex; align-items: center; justify-content: center;
  width: 44px; height: 44px; border-radius: 12px; flex-shrink: 0;
}
.adj-kpi__icon--primary { background: rgba(99, 102, 241, 0.12); color: rgb(99, 102, 241); }
.adj-kpi__icon--warning { background: rgba(255, 152, 0, 0.12); color: rgb(255, 152, 0); }
.adj-kpi__icon--info    { background: rgba(33, 150, 243, 0.12); color: rgb(33, 150, 243); }
.adj-kpi__icon--success { background: rgba(76, 175, 80, 0.12); color: rgb(76, 175, 80); }
.adj-kpi__icon--neutral { background: rgba(var(--v-theme-on-surface), 0.06); color: rgba(var(--v-theme-on-surface), 0.5); }
.adj-kpi__label { font-size: 0.6875rem; color: rgba(var(--v-theme-on-surface), 0.5); text-transform: uppercase; letter-spacing: 0.06em; }
.adj-kpi__value { font-size: 1.5rem; font-weight: 800; letter-spacing: -0.02em; margin-top: 2px; }

/* ===== Toolbar ===== */
.adj-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
  flex-wrap: wrap;
}
.adj-toolbar__search {
  display: flex; align-items: center; gap: 8px;
  padding: 0 14px; border-radius: 10px;
  border: 1px solid rgba(var(--v-theme-on-surface), 0.12);
  background: rgb(var(--v-theme-surface));
  min-width: 280px; flex: 1; max-width: 500px;
  transition: border-color 0.2s;
}
.adj-toolbar__search:focus-within { border-color: rgb(var(--v-theme-primary)); }
.adj-toolbar__icon { color: rgba(var(--v-theme-on-surface), 0.4); }
.adj-toolbar__input {
  flex: 1; border: none; outline: none; padding: 10px 0;
  font-size: 0.875rem; background: transparent; color: inherit;
}
.adj-toolbar__selects { display: flex; gap: 8px; }
.adj-toolbar__select {
  padding: 8px 12px; border-radius: 10px;
  border: 1px solid rgba(var(--v-theme-on-surface), 0.12);
  background: rgb(var(--v-theme-surface)); color: inherit;
  font-size: 0.8125rem; outline: none; cursor: pointer;
  transition: border-color 0.2s;
}
.adj-toolbar__select:focus { border-color: rgb(var(--v-theme-primary)); }

/* ===== Filter Pills ===== */
.adj-pills { display: flex; gap: 6px; margin-bottom: 16px; flex-wrap: wrap; }
.adj-pills__pill {
  display: inline-flex; align-items: center; gap: 6px;
  padding: 6px 12px; border-radius: 8px;
  border: 1px solid rgba(var(--v-theme-on-surface), 0.12);
  background: transparent; font-size: 0.8125rem; font-weight: 600;
  color: rgba(var(--v-theme-on-surface), 0.6); cursor: pointer; transition: all 0.2s;
}
.adj-pills__pill:hover { border-color: rgba(var(--v-theme-primary), 0.3); color: rgb(var(--v-theme-primary)); }
.adj-pills__pill--active {
  background: rgba(var(--v-theme-primary), 0.08);
  color: rgb(var(--v-theme-primary)); border-color: rgba(var(--v-theme-primary), 0.3);
}
.adj-pills__dot { width: 8px; height: 8px; border-radius: 50%; }
.adj-pills__dot--draft { background: rgba(var(--v-theme-on-surface), 0.3); }
.adj-pills__dot--pending { background: rgb(255, 152, 0); }
.adj-pills__dot--approved { background: rgb(33, 150, 243); }
.adj-pills__dot--posted { background: rgb(76, 175, 80); }
.adj-pills__dot--rejected { background: rgb(239, 83, 80); }
.adj-pills__dot--cancelled { background: rgba(var(--v-theme-on-surface), 0.2); }
.adj-pills__count {
  font-size: 0.6875rem; padding: 1px 6px; border-radius: 4px;
  background: rgba(var(--v-theme-on-surface), 0.08);
}

/* ===== Table ===== */
.adj-table-wrap {
  border-radius: 14px; border: 1px solid rgba(var(--v-theme-on-surface), 0.08);
  background: rgb(var(--v-theme-surface)); overflow: hidden;
}
.adj-loading, .adj-empty {
  display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 60px 20px;
}
.adj-table { width: 100%; border-collapse: collapse; }
.adj-table thead th {
  text-align: left; padding: 12px 16px; font-size: 0.6875rem; font-weight: 700;
  text-transform: uppercase; letter-spacing: 0.06em; color: rgba(var(--v-theme-on-surface), 0.5);
  background: rgba(var(--v-theme-on-surface), 0.02);
  border-bottom: 1px solid rgba(var(--v-theme-on-surface), 0.08); white-space: nowrap;
}
.adj-table th.text-right { text-align: right; }
.adj-table tbody td {
  padding: 12px 16px; font-size: 0.8125rem;
  border-bottom: 1px solid rgba(var(--v-theme-on-surface), 0.04);
}
.adj-table__row { cursor: pointer; transition: background 0.15s; }
.adj-table__row:hover { background: rgba(var(--v-theme-primary), 0.03); }
.adj-table__row:last-child td { border-bottom: 0; }
.adj-table__num { font-weight: 600; font-size: 0.8125rem; }
.adj-table__sub { font-size: 0.6875rem; color: rgba(var(--v-theme-on-surface), 0.45); margin-top: 2px; }
.adj-table__reason { display: flex; align-items: center; gap: 8px; }
.adj-table__reason-icon {
  width: 24px; height: 24px; border-radius: 6px; display: flex; align-items: center; justify-content: center;
  background: rgba(var(--v-theme-on-surface), 0.06); color: rgba(var(--v-theme-on-surface), 0.5);
}
.adj-table__reason-icon--damage, .adj-table__reason-icon--theft { background: rgba(239, 83, 80, 0.1); color: rgb(239, 83, 80); }
.adj-table__reason-icon--expiry, .adj-table__reason-icon--quality { background: rgba(255, 152, 0, 0.1); color: rgb(255, 152, 0); }
.adj-table__reason-icon--cycle_count, .adj-table__reason-icon--clerical { background: rgba(33, 150, 243, 0.1); color: rgb(33, 150, 243); }
.adj-table__reason-icon--po_received { background: rgba(76, 175, 80, 0.1); color: rgb(46, 125, 50); }
.adj-table__reason-icon--sample, .adj-table__reason-icon--gift { background: rgba(156, 39, 176, 0.1); color: rgb(156, 39, 176); }
.adj-table__type {
  display: inline-flex; align-items: center; gap: 4px; font-size: 0.75rem; font-weight: 600;
  padding: 3px 8px; border-radius: 6px;
}
.adj-table__type--increase { background: rgba(76, 175, 80, 0.1); color: rgb(46, 125, 50); }
.adj-table__type--decrease { background: rgba(239, 83, 80, 0.1); color: rgb(198, 40, 40); }
.adj-table__type--set { background: rgba(33, 150, 243, 0.1); color: rgb(33, 150, 243); }
.adj-table__value { font-weight: 700; }
.adj-table__value--neg { color: rgb(239, 83, 80); }
.adj-table__value--pos { color: rgb(76, 175, 80); }
.adj-table__status {
  display: inline-flex; align-items: center; gap: 6px;
  font-size: 0.75rem; font-weight: 600; padding: 4px 10px; border-radius: 6px;
}
.adj-table__status-dot { width: 8px; height: 8px; border-radius: 50%; }
.adj-table__status--draft { background: rgba(var(--v-theme-on-surface), 0.06); color: rgba(var(--v-theme-on-surface), 0.5); }
.adj-table__status--draft .adj-table__status-dot { background: rgba(var(--v-theme-on-surface), 0.3); }
.adj-table__status--pending { background: rgba(255, 152, 0, 0.12); color: rgb(255, 152, 0); }
.adj-table__status--pending .adj-table__status-dot { background: rgb(255, 152, 0); box-shadow: 0 0 0 2px rgba(255, 152, 0, 0.2); }
.adj-table__status--approved { background: rgba(33, 150, 243, 0.12); color: rgb(33, 150, 243); }
.adj-table__status--approved .adj-table__status-dot { background: rgb(33, 150, 243); }
.adj-table__status--posted { background: rgba(76, 175, 80, 0.12); color: rgb(76, 175, 80); }
.adj-table__status--posted .adj-table__status-dot { background: rgb(76, 175, 80); }
.adj-table__status--rejected { background: rgba(239, 83, 80, 0.12); color: rgb(239, 83, 80); }
.adj-table__status--rejected .adj-table__status-dot { background: rgb(239, 83, 80); }
.adj-table__status--cancelled { background: rgba(var(--v-theme-on-surface), 0.06); color: rgba(var(--v-theme-on-surface), 0.4); }
.adj-table__status--cancelled .adj-table__status-dot { background: rgba(var(--v-theme-on-surface), 0.2); }

/* Action buttons */
.adj-table__actions { display: flex; gap: 4px; }
.adj-action-btn {
  width: 30px; height: 30px; border-radius: 8px; border: 1px solid rgba(var(--v-theme-on-surface), 0.08);
  background: transparent; display: flex; align-items: center; justify-content: center;
  cursor: pointer; transition: all 0.15s; color: rgba(var(--v-theme-on-surface), 0.5);
}
.adj-action-btn--submit:hover { background: rgba(255, 152, 0, 0.1); color: rgb(255, 152, 0); border-color: rgba(255, 152, 0, 0.3); }
.adj-action-btn--approve:hover { background: rgba(76, 175, 80, 0.1); color: rgb(76, 175, 80); border-color: rgba(76, 175, 80, 0.3); }
.adj-action-btn--reject:hover { background: rgba(239, 83, 80, 0.1); color: rgb(239, 83, 80); border-color: rgba(239, 83, 80, 0.3); }
.adj-action-btn--post:hover { background: rgba(99, 102, 241, 0.1); color: rgb(99, 102, 241); border-color: rgba(99, 102, 241, 0.3); }
.adj-action-btn--cancel:hover { background: rgba(var(--v-theme-on-surface), 0.06); color: rgba(var(--v-theme-on-surface), 0.7); border-color: rgba(var(--v-theme-on-surface), 0.15); }
.adj-action-btn--view:hover { background: rgba(var(--v-theme-primary), 0.06); color: rgb(var(--v-theme-primary)); border-color: rgba(var(--v-theme-primary), 0.2); }

/* ===== Pagination ===== */
.adj-pagination {
  display: flex; justify-content: space-between; align-items: center;
  padding: 12px 16px; border-top: 1px solid rgba(var(--v-theme-on-surface), 0.08);
}
.adj-pagination__info { font-size: 0.75rem; color: rgba(var(--v-theme-on-surface), 0.5); }
.adj-pagination__nav { display: flex; align-items: center; gap: 8px; }
.adj-pagination__page { font-size: 0.8125rem; font-weight: 600; min-width: 60px; text-align: center; }

/* ===== Dialogs ===== */
.adj-dialog { padding: 0; overflow: hidden; }
.adj-dialog__header {
  display: flex; align-items: center; gap: 14px; padding: 20px 24px;
}
.adj-dialog__header-icon {
  display: flex; align-items: center; justify-content: center;
  width: 48px; height: 48px; border-radius: 14px; color: white; flex-shrink: 0;
}
.adj-dialog__header-icon--primary { background: linear-gradient(135deg, #6366f1, #4f46e5); }
.adj-dialog__header-icon--draft { background: rgba(var(--v-theme-on-surface), 0.2); }
.adj-dialog__header-icon--pending { background: linear-gradient(135deg, #f59e0b, #d97706); }
.adj-dialog__header-icon--approved { background: linear-gradient(135deg, #2196f3, #1976d2); }
.adj-dialog__header-icon--posted { background: linear-gradient(135deg, #4caf50, #2e7d32); }
.adj-dialog__header-icon--rejected { background: linear-gradient(135deg, #ef5350, #c62828); }
.adj-dialog__header-icon--cancelled { background: rgba(var(--v-theme-on-surface), 0.15); }
.adj-dialog__body { padding: 20px 24px; }
.adj-dialog__actions {
  display: flex; justify-content: flex-end; gap: 8px; padding: 16px 24px; flex-wrap: wrap;
}

/* ===== Form ===== */
.adj-form-grid {
  display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 12px;
}
.adj-form-field { display: flex; flex-direction: column; }
.adj-form__label {
  font-size: 0.75rem; font-weight: 600;
  color: rgba(var(--v-theme-on-surface), 0.6); margin-bottom: 4px;
}
.adj-form__select, .adj-form__input {
  padding: 10px 12px; border-radius: 10px;
  border: 1.5px solid rgba(var(--v-theme-on-surface), 0.12);
  background: transparent; color: inherit; font-size: 0.875rem; outline: none;
  transition: border-color 0.2s; box-sizing: border-box; width: 100%;
}
.adj-form__select:focus, .adj-form__input:focus { border-color: rgb(var(--v-theme-primary)); }

/* ===== Lines Editor ===== */
.adj-lines {
  margin-top: 16px; border: 1px solid rgba(var(--v-theme-on-surface), 0.08);
  border-radius: 12px; overflow: hidden;
}
.adj-lines__header {
  display: flex; justify-content: space-between; align-items: center;
  padding: 10px 14px; background: rgba(var(--v-theme-on-surface), 0.02);
  border-bottom: 1px solid rgba(var(--v-theme-on-surface), 0.06);
}
.adj-lines__title { font-size: 0.875rem; font-weight: 700; }
.adj-lines__add {
  display: inline-flex; align-items: center; gap: 4px; padding: 4px 10px;
  border-radius: 8px; border: 1px solid rgba(var(--v-theme-primary), 0.2);
  background: rgba(var(--v-theme-primary), 0.06); color: rgb(var(--v-theme-primary));
  font-size: 0.75rem; font-weight: 600; cursor: pointer; transition: all 0.2s;
}
.adj-lines__add:hover { background: rgba(var(--v-theme-primary), 0.12); }
.adj-lines__scroll { max-height: 300px; overflow-y: auto; }
.adj-lines-table { width: 100%; border-collapse: collapse; }
.adj-lines-table thead th {
  text-align: left; padding: 8px 12px; font-size: 0.6875rem; font-weight: 700;
  text-transform: uppercase; letter-spacing: 0.06em; color: rgba(var(--v-theme-on-surface), 0.4);
  background: rgba(var(--v-theme-on-surface), 0.02); white-space: nowrap;
}
.adj-lines-table th.text-right { text-align: right; }
.adj-lines-table tbody td {
  padding: 8px 12px; font-size: 0.8125rem;
  border-top: 1px solid rgba(var(--v-theme-on-surface), 0.04);
}
.adj-lines-table__select {
  width: 100%; max-width: 240px; padding: 6px 8px; border-radius: 8px;
  border: 1px solid rgba(var(--v-theme-on-surface), 0.12); background: transparent;
  color: inherit; font-size: 0.8125rem; outline: none;
}
.adj-lines-table__select:focus { border-color: rgb(var(--v-theme-primary)); }
.adj-lines-table__qty, .adj-lines-table__cost {
  width: 80px; padding: 6px 8px; border-radius: 8px;
  border: 1px solid rgba(var(--v-theme-on-surface), 0.12); background: transparent;
  color: inherit; font-size: 0.8125rem; outline: none; text-align: right;
}
.adj-lines-table__qty:focus, .adj-lines-table__cost:focus { border-color: rgb(var(--v-theme-primary)); }
.adj-lines-table__change { font-weight: 700; font-size: 0.8125rem; }
.adj-lines-table__change--neg { color: rgb(239, 83, 80); }
.adj-lines-table__change--pos { color: rgb(76, 175, 80); }
.adj-lines-table__remove {
  width: 28px; height: 28px; border-radius: 8px; border: none; background: transparent;
  color: rgba(var(--v-theme-on-surface), 0.3); cursor: pointer; display: flex; align-items: center; justify-content: center;
  transition: all 0.15s;
}
.adj-lines-table__remove:hover { background: rgba(239, 83, 80, 0.08); color: rgb(239, 83, 80); }
.adj-lines-table__empty {
  text-align: center; padding: 24px 12px; color: rgba(var(--v-theme-on-surface), 0.4);
  font-size: 0.8125rem;
}
.adj-lines__totals {
  display: flex; justify-content: flex-end; gap: 24px; padding: 10px 14px;
  background: rgba(var(--v-theme-on-surface), 0.02); border-top: 1px solid rgba(var(--v-theme-on-surface), 0.06);
}
.adj-lines__total { display: flex; align-items: center; gap: 6px; }
.adj-lines__total-label { font-size: 0.75rem; color: rgba(var(--v-theme-on-surface), 0.5); }
.adj-lines__total-value { font-size: 0.875rem; font-weight: 700; }

/* ===== Details Dialog ===== */
.adj-detail__doc-type {
  font-size: 0.625rem; font-weight: 800; letter-spacing: 0.12em;
  color: rgba(var(--v-theme-on-surface), 0.4); text-transform: uppercase;
}
.adj-detail__status-large {
  font-size: 0.6875rem; font-weight: 700; padding: 4px 12px; border-radius: 6px;
  text-transform: uppercase; letter-spacing: 0.05em;
}
.adj-detail__status-large--draft { background: rgba(var(--v-theme-on-surface), 0.08); color: rgba(var(--v-theme-on-surface), 0.5); }
.adj-detail__status-large--pending { background: rgba(255, 152, 0, 0.14); color: rgb(255, 152, 0); }
.adj-detail__status-large--approved { background: rgba(33, 150, 243, 0.14); color: rgb(33, 150, 243); }
.adj-detail__status-large--posted { background: rgba(76, 175, 80, 0.14); color: rgb(46, 125, 50); }
.adj-detail__status-large--rejected { background: rgba(239, 83, 80, 0.14); color: rgb(198, 40, 40); }
.adj-detail__status-large--cancelled { background: rgba(var(--v-theme-on-surface), 0.08); color: rgba(var(--v-theme-on-surface), 0.4); }
.adj-detail__meta-grid {
  display: grid; grid-template-columns: repeat(auto-fill, minmax(160px, 1fr)); gap: 12px;
}
.adj-detail__meta-item { display: flex; flex-direction: column; gap: 2px; }
.adj-detail__meta-label { font-size: 0.6875rem; color: rgba(var(--v-theme-on-surface), 0.4); text-transform: uppercase; letter-spacing: 0.06em; }
.adj-detail__meta-value { font-size: 0.8125rem; font-weight: 600; }
.adj-detail__notes {
  margin-top: 14px; padding: 10px 14px; border-radius: 10px;
  background: rgba(var(--v-theme-on-surface), 0.03);
  font-size: 0.8125rem; color: rgba(var(--v-theme-on-surface), 0.6);
  display: flex; align-items: flex-start;
}
.adj-detail__lines-title {
  margin-top: 18px; margin-bottom: 8px; font-size: 0.75rem; font-weight: 700;
  text-transform: uppercase; letter-spacing: 0.06em; color: rgba(var(--v-theme-on-surface), 0.4);
}
.adj-detail__lines-wrap {
  border: 1px solid rgba(var(--v-theme-on-surface), 0.08); border-radius: 10px; overflow: hidden;
}
.adj-detail-table { width: 100%; border-collapse: collapse; }
.adj-detail-table thead th {
  text-align: left; padding: 8px 12px; font-size: 0.6875rem; font-weight: 700;
  text-transform: uppercase; letter-spacing: 0.06em; color: rgba(var(--v-theme-on-surface), 0.4);
  background: rgba(var(--v-theme-on-surface), 0.02);
}
.adj-detail-table th.text-right { text-align: right; }
.adj-detail-table tbody td {
  padding: 8px 12px; font-size: 0.8125rem; border-top: 1px solid rgba(var(--v-theme-on-surface), 0.04);
}
.adj-detail-table__product { font-weight: 600; }
.adj-detail-table__sku { font-size: 0.6875rem; color: rgba(var(--v-theme-on-surface), 0.4); margin-top: 2px; }
.adj-detail__summary {
  margin-top: 14px; padding: 12px 14px; border-radius: 10px;
  background: rgba(var(--v-theme-on-surface), 0.02); border: 1px solid rgba(var(--v-theme-on-surface), 0.06);
}
.adj-detail__summary-row {
  display: flex; justify-content: space-between; padding: 4px 0;
  font-size: 0.8125rem; color: rgba(var(--v-theme-on-surface), 0.7);
}
.adj-detail__summary-row--bold { font-weight: 700; font-size: 0.9rem; }

@media (max-width: 960px) {
  .adj-table { font-size: 0.75rem; }
  .adj-table thead th, .adj-table tbody td { padding: 8px 10px; }
  .adj-toolbar__search { min-width: 200px; }
  .adj-dialog__header-icon { width: 40px; height: 40px; }
  .adj-form-grid { grid-template-columns: 1fr 1fr; }
}
</style>
