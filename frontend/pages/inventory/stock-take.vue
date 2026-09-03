<template>
  <div class="st-page">
    <!-- ===== Header ===== -->
    <div class="st-header">
      <div class="st-header__left">
        <div class="st-header__title">
          <h1 class="text-h5 font-weight-bold">Stock Take</h1>
          <p class="text-body-2 text-medium-emphasis">Periodic inventory counts with variance analysis and reconciliation workflow</p>
        </div>
      </div>
      <div class="st-header__actions">
        <v-btn variant="tonal" prepend-icon="mdi-refresh" size="small" @click="loadData" :loading="loading">Refresh</v-btn>
        <v-btn variant="flat" color="primary" prepend-icon="mdi-plus-circle" @click="openCreateDialog">New Stock Take</v-btn>
      </div>
    </div>

    <!-- ===== KPI Cards ===== -->
    <div class="st-kpi-grid">
      <div class="st-kpi">
        <div class="st-kpi__icon st-kpi__icon--primary"><v-icon size="22">mdi-clipboard-search-outline</v-icon></div>
        <div class="st-kpi__body">
          <p class="st-kpi__label">Total Counts</p>
          <p class="st-kpi__value">{{ summary.total || 0 }}</p>
        </div>
      </div>
      <div class="st-kpi">
        <div class="st-kpi__icon st-kpi__icon--info"><v-icon size="22">mdi-progress-clock</v-icon></div>
        <div class="st-kpi__body">
          <p class="st-kpi__label">In Progress</p>
          <p class="st-kpi__value text-info">{{ summary.in_progress || 0 }}</p>
        </div>
      </div>
      <div class="st-kpi">
        <div class="st-kpi__icon st-kpi__icon--warning"><v-icon size="22">mdi-clipboard-check-outline</v-icon></div>
        <div class="st-kpi__body">
          <p class="st-kpi__label">Completed</p>
          <p class="st-kpi__value text-warning">{{ (summary.completed || 0) + (summary.reviewed || 0) }}</p>
        </div>
      </div>
      <div class="st-kpi">
        <div class="st-kpi__icon st-kpi__icon--success"><v-icon size="22">mdi-package-variant-closed-check</v-icon></div>
        <div class="st-kpi__body">
          <p class="st-kpi__label">Reconciled</p>
          <p class="st-kpi__value text-success">{{ summary.reconciled || 0 }}</p>
        </div>
      </div>
      <div class="st-kpi st-kpi--wide">
        <div class="st-kpi__icon st-kpi__icon--neutral"><v-icon size="22">mdi-scale-balance</v-icon></div>
        <div class="st-kpi__body">
          <p class="st-kpi__label">Total Variance Value</p>
          <p class="st-kpi__value" :class="varianceNegative ? 'text-error' : ''">{{ formatMoney(summary.total_variance_value) }}</p>
        </div>
      </div>
    </div>

    <!-- ===== Toolbar ===== -->
    <div class="st-toolbar">
      <div class="st-toolbar__search">
        <v-icon size="18" class="st-toolbar__icon">mdi-magnify</v-icon>
        <input v-model="search" class="st-toolbar__input" placeholder="Search by count number, title, or branch..." />
      </div>
      <div class="st-toolbar__selects">
        <select v-model="statusFilter" class="st-toolbar__select">
          <option value="">All Statuses</option>
          <option v-for="s in statusList" :key="s.value" :value="s.value">{{ s.label }}</option>
        </select>
        <select v-model="typeFilter" class="st-toolbar__select">
          <option value="">All Types</option>
          <option v-for="t in typeList" :key="t.value" :value="t.value">{{ t.label }}</option>
        </select>
      </div>
    </div>

    <!-- ===== Filter Pills ===== -->
    <div class="st-pills">
      <button
        v-for="f in statusPills"
        :key="f.value"
        class="st-pills__pill"
        :class="{ 'st-pills__pill--active': statusFilter === f.value }"
        @click="statusFilter = f.value"
      >
        <span class="st-pills__dot" :class="`st-pills__dot--${f.value}`"></span>
        {{ f.label }}
        <span class="st-pills__count">{{ f.count }}</span>
      </button>
    </div>

    <!-- ===== Table ===== -->
    <div class="st-table-wrap">
      <div v-if="loading" class="st-loading">
        <v-progress-circular indeterminate size="32" color="primary" />
        <p class="text-body-2 text-medium-emphasis mt-2">Loading stock takes...</p>
      </div>
      <div v-else-if="filteredCounts.length === 0" class="st-empty">
        <v-icon size="48" class="text-medium-emphasis">mdi-clipboard-search-outline</v-icon>
        <p class="text-h6 mt-2">No stock takes found</p>
        <p class="text-body-2 text-medium-emphasis">{{ search || statusFilter || typeFilter ? 'Try different filters.' : 'Create a new stock take to get started.' }}</p>
        <v-btn variant="tonal" color="primary" size="small" class="mt-3" prepend-icon="mdi-plus-circle" @click="openCreateDialog">New Stock Take</v-btn>
      </div>
      <table v-else class="st-table">
        <thead>
          <tr>
            <th>Count Number</th>
            <th>Title</th>
            <th>Type</th>
            <th>Date</th>
            <th class="text-right">Items</th>
            <th class="text-right">Counted</th>
            <th class="text-right">Variance Qty</th>
            <th class="text-right">Variance Value</th>
            <th>Created By</th>
            <th>Status</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="sc in paginatedCounts" :key="sc.id" class="st-table__row" @click="openDetails(sc)">
            <td>
              <div class="st-table__num">{{ sc.count_number }}</div>
              <div class="st-table__sub">{{ sc.branch_name }}</div>
            </td>
            <td>
              <div class="st-table__title">{{ sc.title || '—' }}</div>
              <div class="st-table__sub">{{ sc.count_type_display }}</div>
            </td>
            <td>
              <span class="st-table__type" :class="`st-table__type--${sc.count_type}`">
                <v-icon size="12">{{ typeIcon(sc.count_type) }}</v-icon>
                {{ sc.count_type_display }}
              </span>
            </td>
            <td class="text-medium-emphasis">{{ formatDate(sc.scheduled_date) }}</td>
            <td class="text-right font-weight-medium">{{ sc.total_items || sc.line_count }}</td>
            <td class="text-right">{{ sc.counted_items || 0 }}</td>
            <td class="text-right">
              <span
                class="st-table__variance"
                :class="Number(sc.total_variance_qty) < 0 ? 'st-table__variance--neg' : Number(sc.total_variance_qty) > 0 ? 'st-table__variance--pos' : ''"
              >
                {{ sc.status === 'draft' || sc.status === 'in_progress' ? '—' : (Number(sc.total_variance_qty) > 0 ? '+' : '') + sc.total_variance_qty }}
              </span>
            </td>
            <td class="text-right">
              <span
                class="st-table__value"
                :class="Number(sc.total_variance_value) < 0 ? 'st-table__value--neg' : Number(sc.total_variance_value) > 0 ? 'st-table__value--pos' : ''"
              >
                {{ sc.status === 'draft' || sc.status === 'in_progress' ? '—' : formatMoney(sc.total_variance_value) }}
              </span>
            </td>
            <td class="text-medium-emphasis">{{ sc.created_by_name || '—' }}</td>
            <td>
              <span class="st-table__status" :class="`st-table__status--${sc.status}`">
                <span class="st-table__status-dot"></span>
                {{ sc.status_display }}
              </span>
            </td>
            <td>
              <div class="st-table__actions" @click.stop>
                <button v-if="sc.status === 'draft'" class="st-action-btn st-action-btn--start" @click="startCount(sc)" title="Start counting">
                  <v-icon size="14">mdi-play</v-icon>
                </button>
                <button v-if="sc.status === 'in_progress'" class="st-action-btn st-action-btn--complete" @click="completeCount(sc)" title="Complete counting">
                  <v-icon size="14">mdi-check-all</v-icon>
                </button>
                <button v-if="sc.status === 'completed'" class="st-action-btn st-action-btn--review" @click="reviewCount(sc)" title="Review & Approve">
                  <v-icon size="14">mdi-shield-check-outline</v-icon>
                </button>
                <button v-if="sc.status === 'completed' || sc.status === 'reviewed'" class="st-action-btn st-action-btn--reconcile" @click="reconcileCount(sc)" title="Reconcile & Apply">
                  <v-icon size="14">mdi-package-up</v-icon>
                </button>
                <button v-if="sc.status !== 'reconciled' && sc.status !== 'cancelled'" class="st-action-btn st-action-btn--cancel" @click="cancelCount(sc)" title="Cancel">
                  <v-icon size="14">mdi-cancel</v-icon>
                </button>
                <button class="st-action-btn st-action-btn--view" @click="openDetails(sc)" title="View / Edit lines">
                  <v-icon size="14">mdi-pencil-outline</v-icon>
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>

      <!-- Pagination -->
      <div v-if="filteredCounts.length > itemsPerPage" class="st-pagination">
        <span class="st-pagination__info">Showing {{ (page - 1) * itemsPerPage + 1 }}–{{ Math.min(page * itemsPerPage, filteredCounts.length) }} of {{ filteredCounts.length }}</span>
        <div class="st-pagination__nav">
          <v-btn size="small" variant="text" :disabled="page === 1" @click="page--" prepend-icon="mdi-chevron-left">Prev</v-btn>
          <span class="st-pagination__page">{{ page }} / {{ totalPages }}</span>
          <v-btn size="small" variant="text" :disabled="page === totalPages" @click="page++" append-icon="mdi-chevron-right">Next</v-btn>
        </div>
      </div>
    </div>

    <!-- ===== Create Dialog ===== -->
    <v-dialog v-model="createDialog" max-width="640" persistent>
      <v-card rounded="xl" class="st-dialog">
        <div class="st-dialog__header">
          <div class="st-dialog__header-icon st-dialog__header-icon--primary">
            <v-icon size="24">mdi-clipboard-search-outline</v-icon>
          </div>
          <div class="flex-1">
            <h3 class="text-h6 font-weight-bold">New Stock Take</h3>
            <p class="text-body-2 text-medium-emphasis">Create a count session — lines are generated from the current stock snapshot</p>
          </div>
          <v-btn icon="mdi-close" variant="text" size="small" @click="createDialog = false" />
        </div>
        <v-divider />

        <div class="st-dialog__body">
          <div class="st-form-grid">
            <div class="st-form-field">
              <label class="st-form__label">Branch</label>
              <select v-model="form.branch" class="st-form__select">
                <option v-for="b in branches" :key="b.id" :value="b.id">{{ b.name }} ({{ b.code }})</option>
              </select>
            </div>
            <div class="st-form-field">
              <label class="st-form__label">Count Type</label>
              <select v-model="form.count_type" class="st-form__select">
                <option v-for="t in typeList" :key="t.value" :value="t.value">{{ t.label }}</option>
              </select>
            </div>
            <div class="st-form-field">
              <label class="st-form__label">Title (optional)</label>
              <input v-model="form.title" type="text" class="st-form__input" placeholder="e.g. Q3 Full Stock Count" />
            </div>
            <div class="st-form-field">
              <label class="st-form__label">Scheduled Date</label>
              <input v-model="form.scheduled_date" type="date" class="st-form__input" />
            </div>
          </div>

          <div class="st-form-field" style="margin-top: 12px;">
            <label class="st-form__label">Notes (optional)</label>
            <input v-model="form.notes" type="text" class="st-form__input" placeholder="Context or instructions for counters..." />
          </div>

          <!-- Product selector for partial counts -->
          <div v-if="form.count_type === 'partial'" class="st-form-field" style="margin-top: 12px;">
            <label class="st-form__label">Products to Count (optional — leave empty for all)</label>
            <div class="st-product-picker">
              <input
                v-model="productSearch"
                type="text"
                class="st-form__input"
                placeholder="Search products to include..."
                @focus="showProductPicker = true"
              />
              <div v-if="showProductPicker" class="st-product-picker__dropdown">
                <div
                  v-for="p in filteredProducts"
                  :key="p.id"
                  class="st-product-picker__item"
                  :class="{ 'st-product-picker__item--selected': selectedProductIds.includes(p.id) }"
                  @click="toggleProduct(p.id)"
                >
                  <v-icon size="14" :color="selectedProductIds.includes(p.id) ? 'primary' : undefined">
                    {{ selectedProductIds.includes(p.id) ? 'mdi-checkbox-marked' : 'mdi-checkbox-blank-outline' }}
                  </v-icon>
                  <span class="st-product-picker__name">{{ p.name }}</span>
                  <span class="st-product-picker__sku">{{ p.sku }}</span>
                </div>
                <div v-if="filteredProducts.length === 0" class="st-product-picker__empty">No products found</div>
              </div>
            </div>
            <div v-if="selectedProductIds.length > 0" class="st-product-picker__chips">
              <v-chip
                v-for="pid in selectedProductIds"
                :key="pid"
                size="small"
                closable
                @click:close="toggleProduct(pid)"
              >
                {{ products.find(p => p.id === pid)?.name || pid }}
              </v-chip>
            </div>
          </div>
        </div>

        <v-divider />
        <div class="st-dialog__actions">
          <v-btn variant="text" @click="createDialog = false">Cancel</v-btn>
          <v-btn variant="flat" color="primary" prepend-icon="mdi-content-save-outline" :loading="saving" @click="createCount">Create Stock Take</v-btn>
        </div>
      </v-card>
    </v-dialog>

    <!-- ===== Counting Dialog (Line Editor) ===== -->
    <v-dialog v-model="detailsDialog" max-width="1100" persistent scrollable>
      <v-card rounded="xl" class="st-dialog">
        <div class="st-dialog__header" :class="`st-dialog__header--${currentCount?.status || 'draft'}`">
          <div class="st-dialog__header-icon" :class="`st-dialog__header-icon--${currentCount?.status || 'draft'}`">
            <v-icon size="24">mdi-clipboard-search-outline</v-icon>
          </div>
          <div class="flex-1">
            <span class="st-detail__doc-type">STOCK TAKE</span>
            <h3 class="text-h6 font-weight-bold mt-1">{{ currentCount?.count_number }}</h3>
            <p class="text-body-2 text-medium-emphasis">{{ currentCount?.title || currentCount?.count_type_display }} — {{ currentCount?.branch_name }}</p>
          </div>
          <span class="st-detail__status-large" :class="`st-detail__status-large--${currentCount?.status}`">
            {{ currentCount?.status_display }}
          </span>
          <v-btn icon="mdi-close" variant="text" size="small" @click="detailsDialog = false" />
        </div>
        <v-divider />

        <!-- Counting toolbar -->
        <div class="st-count-toolbar" v-if="currentCount">
          <div class="st-count-toolbar__search">
            <v-icon size="18" class="st-toolbar__icon">mdi-magnify</v-icon>
            <input v-model="lineSearch" class="st-toolbar__input" placeholder="Search by SKU or name..." />
          </div>
          <div class="st-count-toolbar__selects">
            <select v-model="lineStatusFilter" class="st-toolbar__select">
              <option value="">All Lines</option>
              <option value="pending">Pending</option>
              <option value="counted">Counted</option>
              <option value="flagged">Flagged</option>
              <option value="not_found">Not Found</option>
            </select>
            <select v-model="varianceFilter" class="st-toolbar__select">
              <option value="">No Variance Filter</option>
              <option value="variance">Has Variance</option>
              <option value="positive">Positive Variance</option>
              <option value="negative">Negative Variance</option>
            </select>
          </div>
          <div class="st-count-toolbar__progress">
            <span class="st-count-toolbar__progress-label">{{ countedProgress }}% complete</span>
            <div class="st-count-toolbar__progress-bar">
              <div class="st-count-toolbar__progress-fill" :style="{ width: `${countedProgress}%` }"></div>
            </div>
          </div>
        </div>

        <!-- Lines table -->
        <div class="st-lines-wrap" v-if="currentCount">
          <table class="st-lines-table">
            <thead>
              <tr>
                <th>Product</th>
                <th class="text-right">System Qty</th>
                <th class="text-right">Counted Qty</th>
                <th class="text-right">Variance</th>
                <th class="text-right">Unit Cost</th>
                <th class="text-right">Value Variance</th>
                <th>Status</th>
                <th>Notes</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="line in pagedLines" :key="line.id" class="st-lines-table__row" :class="{ 'st-lines-table__row--flagged': line.line_status === 'flagged', 'st-lines-table__row--variance': lineHasVarianceAndCompleted(line) }">
                <td>
                  <div class="st-lines-table__product">{{ line.product_name }}</div>
                  <div class="st-lines-table__sku">{{ line.product_sku }}</div>
                </td>
                <td class="text-right text-medium-emphasis">{{ Number(line.system_quantity).toFixed(3) }}</td>
                <td class="text-right">
                  <input
                    v-model.number="lineEdits[line.id]"
                    type="number"
                    step="0.001"
                    class="st-lines-table__qty"
                    :disabled="!canEditLines"
                    @change="onLineEdit(line)"
                  />
                </td>
                <td class="text-right">
                  <span
                    class="st-lines-table__variance"
                    :class="lineComputedVariance(line) < 0 ? 'st-lines-table__variance--neg' : lineComputedVariance(line) > 0 ? 'st-lines-table__variance--pos' : ''"
                  >
                    {{ lineComputedVariance(line) > 0 ? '+' : '' }}{{ lineComputedVariance(line).toFixed(3) }}
                  </span>
                </td>
                <td class="text-right text-medium-emphasis">{{ Number(line.unit_cost).toFixed(2) }}</td>
                <td class="text-right">
                  <span
                    class="st-lines-table__value"
                    :class="lineValueVariance(line) < 0 ? 'st-lines-table__value--neg' : lineValueVariance(line) > 0 ? 'st-lines-table__value--pos' : ''"
                  >
                    {{ lineValueVariance(line) > 0 ? '+' : '' }}{{ formatMoney(lineValueVariance(line)) }}
                  </span>
                </td>
                <td>
                  <span class="st-lines-table__line-status" :class="`st-lines-table__line-status--${line.line_status}`">
                    {{ line.line_status_display }}
                  </span>
                </td>
                <td>
                  <input
                    v-model="lineNotesEdits[line.id]"
                    type="text"
                    class="st-lines-table__notes"
                    placeholder="—"
                    :disabled="!canEditLines"
                    @change="onLineEdit(line)"
                  />
                </td>
                <td>
                  <button v-if="canEditLines" class="st-lines-table__flag-btn" :class="{ 'st-lines-table__flag-btn--active': line.line_status === 'flagged' }" @click="toggleFlag(line)" title="Flag for recount">
                    <v-icon size="14">{{ line.line_status === 'flagged' ? 'mdi-flag' : 'mdi-flag-outline' }}</v-icon>
                  </button>
                </td>
              </tr>
              <tr v-if="filteredLines.length === 0">
                <td colspan="9" class="st-lines-table__empty">No lines match the current filters.</td>
              </tr>
            </tbody>
          </table>

          <!-- Line pagination -->
          <div v-if="filteredLines.length > linesPerPage" class="st-line-pagination">
            <span class="st-pagination__info">Showing {{ (linePage - 1) * linesPerPage + 1 }}–{{ Math.min(linePage * linesPerPage, filteredLines.length) }} of {{ filteredLines.length }} lines</span>
            <div class="st-pagination__nav">
              <v-btn size="small" variant="text" :disabled="linePage === 1" @click="linePage--" prepend-icon="mdi-chevron-left">Prev</v-btn>
              <span class="st-pagination__page">{{ linePage }} / {{ Math.max(1, Math.ceil(filteredLines.length / linesPerPage)) }}</span>
              <v-btn size="small" variant="text" :disabled="linePage === Math.ceil(filteredLines.length / linesPerPage)" @click="linePage++" append-icon="mdi-chevron-right">Next</v-btn>
            </div>
          </div>
        </div>

        <v-divider />
        <div class="st-dialog__actions" v-if="currentCount">
          <!-- Summary when completed -->
          <div v-if="['completed', 'reviewed', 'reconciled'].includes(currentCount.status)" class="st-detail__summary-bar">
            <div><span>Total Items:</span> <b>{{ currentCount.total_items }}</b></div>
            <div><span>Counted:</span> <b>{{ currentCount.counted_items }}</b></div>
            <div><span>Variance Qty:</span> <b :class="Number(currentCount.total_variance_qty) < 0 ? 'text-error' : ''">{{ Number(currentCount.total_variance_qty) > 0 ? '+' : '' }}{{ currentCount.total_variance_qty }}</b></div>
            <div><span>Variance Value:</span> <b :class="Number(currentCount.total_variance_value) < 0 ? 'text-error' : ''">{{ formatMoney(currentCount.total_variance_value) }}</b></div>
          </div>
          <div class="st-dialog__actions-right">
            <v-btn variant="text" @click="detailsDialog = false">Close</v-btn>
            <v-btn v-if="canEditLines" variant="tonal" color="primary" prepend-icon="mdi-content-save-outline" :loading="savingLines" @click="saveLines">Save Counted Quantities</v-btn>
            <v-btn v-if="currentCount.status === 'draft'" variant="flat" color="primary" prepend-icon="mdi-play" @click="startCount(currentCount); currentCount = null; detailsDialog = false">Start Counting</v-btn>
            <v-btn v-if="currentCount.status === 'in_progress'" variant="flat" color="warning" prepend-icon="mdi-check-all" @click="completeCount(currentCount); currentCount = null; detailsDialog = false">Complete Count</v-btn>
            <v-btn v-if="currentCount.status === 'completed'" variant="flat" color="success" prepend-icon="mdi-shield-check-outline" @click="reviewCount(currentCount); currentCount = null; detailsDialog = false">Review & Approve</v-btn>
            <v-btn v-if="currentCount.status === 'completed' || currentCount.status === 'reviewed'" variant="flat" color="primary" prepend-icon="mdi-package-up" @click="reconcileCount(currentCount); currentCount = null; detailsDialog = false">Reconcile & Apply</v-btn>
          </div>
        </div>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup lang="ts">
import type { StockTake, StockTakeSummary, StockTakeLine, StockTakeType, StockTakeStatus } from '~/types/inventory'

definePageMeta({ middleware: 'auth' })
const toast = useToast()
const { currency } = useFormat()

function formatMoney(v: number | string | null | undefined): string {
  return currency(v || 0)
}

function formatDate(v: string) {
  return new Date(v).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}

const statusList = [
  { value: 'draft', label: 'Draft' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'completed', label: 'Completed' },
  { value: 'reviewed', label: 'Reviewed' },
  { value: 'reconciled', label: 'Reconciled' },
  { value: 'cancelled', label: 'Cancelled' },
] as const

const typeList = [
  { value: 'full', label: 'Full Count' },
  { value: 'partial', label: 'Partial Count' },
  { value: 'cycle', label: 'Cycle Count' },
  { value: 'abc', label: 'ABC Class Count' },
] as const

function typeIcon(type: string): string {
  const map: Record<string, string> = {
    full: 'mdi-clipboard-text-outline',
    partial: 'mdi-clipboard-text-clock-outline',
    cycle: 'mdi-sync-circle',
    abc: 'mdi-format-list-bulleted',
  }
  return map[type] || 'mdi-clipboard-search-outline'
}

// ===== State =====
const loading = ref(false)
const saving = ref(false)
const savingLines = ref(false)
const counts = ref<StockTake[]>([])
const summary = ref<Partial<StockTakeSummary>>({})
const branches = ref<any[]>([])
const products = ref<any[]>([])

const search = ref('')
const statusFilter = ref('')
const typeFilter = ref('')
const page = ref(1)
const itemsPerPage = 10

const createDialog = ref(false)
const detailsDialog = ref(false)
const currentCount = ref<StockTake | null>(null)
const lineEdits = ref<Record<number, number>>({})
const lineNotesEdits = ref<Record<number, string>>({})
const lineSearch = ref('')
const lineStatusFilter = ref('')
const varianceFilter = ref('')
const linePage = ref(1)
const linesPerPage = 15

const today = new Date().toISOString().slice(0, 10)
const form = reactive<{
  branch: number | ''
  count_type: StockTakeType | string
  title: string
  scheduled_date: string
  notes: string
}>({
  branch: '',
  count_type: 'full',
  title: '',
  scheduled_date: today,
  notes: '',
})

const productSearch = ref('')
const showProductPicker = ref(false)
const selectedProductIds = ref<number[]>([])

const filteredProducts = computed(() => {
  if (!productSearch.value.trim()) return products.value.slice(0, 50)
  const q = productSearch.value.trim().toLowerCase()
  return products.value.filter(p => p.name?.toLowerCase().includes(q) || p.sku?.toLowerCase().includes(q)).slice(0, 50)
})

function toggleProduct(id: number) {
  const idx = selectedProductIds.value.indexOf(id)
  if (idx >= 0) selectedProductIds.value.splice(idx, 1)
  else selectedProductIds.value.push(id)
}

const statusPills = computed(() => [
  { value: '', label: 'All', count: counts.value.length },
  { value: 'draft', label: 'Draft', count: counts.value.filter(a => a.status === 'draft').length },
  { value: 'in_progress', label: 'In Progress', count: counts.value.filter(a => a.status === 'in_progress').length },
  { value: 'completed', label: 'Completed', count: counts.value.filter(a => a.status === 'completed').length },
  { value: 'reviewed', label: 'Reviewed', count: counts.value.filter(a => a.status === 'reviewed').length },
  { value: 'reconciled', label: 'Reconciled', count: counts.value.filter(a => a.status === 'reconciled').length },
  { value: 'cancelled', label: 'Cancelled', count: counts.value.filter(a => a.status === 'cancelled').length },
])

const filteredCounts = computed(() => {
  let result = counts.value
  if (statusFilter.value) result = result.filter(a => a.status === statusFilter.value)
  if (typeFilter.value) result = result.filter(a => a.count_type === typeFilter.value)
  if (search.value.trim()) {
    const q = search.value.trim().toLowerCase()
    result = result.filter(a =>
      a.count_number?.toLowerCase().includes(q) ||
      a.title?.toLowerCase().includes(q) ||
      a.branch_name?.toLowerCase().includes(q) ||
      a.created_by_name?.toLowerCase().includes(q)
    )
  }
  return result
})

const totalPages = computed(() => Math.max(1, Math.ceil(filteredCounts.value.length / itemsPerPage)))
const paginatedCounts = computed(() => {
  const start = (page.value - 1) * itemsPerPage
  return filteredCounts.value.slice(start, start + itemsPerPage)
})

watch([search, statusFilter, typeFilter], () => { page.value = 1 })

const varianceNegative = computed(() => Number(summary.value.total_variance_value) < 0)

// ===== Line helpers =====
const canEditLines = computed(() => currentCount.value?.status === 'in_progress' || currentCount.value?.status === 'completed')

function lineComputedVariance(line: StockTakeLine): number {
  const counted = lineEdits.value[line.id] !== undefined ? Number(lineEdits.value[line.id]) : Number(line.counted_quantity)
  return Number((counted - Number(line.system_quantity)).toFixed(3))
}

function lineValueVariance(line: StockTakeLine): number {
  return Number((lineComputedVariance(line) * Number(line.unit_cost)).toFixed(2))
}

function lineHasVarianceAndCompleted(line: StockTakeLine): boolean {
  const status = currentCount.value?.status
  if (status !== 'completed' && status !== 'reviewed' && status !== 'reconciled') return false
  return Number(line.variance) !== 0
}

const filteredLines = computed(() => {
  if (!currentCount.value?.lines) return []
  let result = currentCount.value.lines
  if (lineStatusFilter.value) result = result.filter((l: StockTakeLine) => l.line_status === lineStatusFilter.value)
  if (varianceFilter.value === 'variance') {
    result = result.filter((l: StockTakeLine) => l.line_status === 'counted' || l.line_status === 'flagged' || l.line_status === 'not_found')
    if (currentCount.value?.status === 'completed' || currentCount.value?.status === 'reviewed' || currentCount.value?.status === 'reconciled') {
      result = result.filter((l: StockTakeLine) => Number(l.variance) !== 0)
    } else {
      result = result.filter((l: StockTakeLine) => lineComputedVariance(l) !== 0)
    }
  } else if (varianceFilter.value === 'positive') {
    if (['completed', 'reviewed', 'reconciled'].includes(currentCount.value?.status || '')) {
      result = result.filter((l: StockTakeLine) => Number(l.variance) > 0)
    } else {
      result = result.filter((l: StockTakeLine) => lineComputedVariance(l) > 0)
    }
  } else if (varianceFilter.value === 'negative') {
    if (['completed', 'reviewed', 'reconciled'].includes(currentCount.value?.status || '')) {
      result = result.filter((l: StockTakeLine) => Number(l.variance) < 0)
    } else {
      result = result.filter((l: StockTakeLine) => lineComputedVariance(l) < 0)
    }
  }
  if (lineSearch.value.trim()) {
    const q = lineSearch.value.trim().toLowerCase()
    result = result.filter((l: StockTakeLine) => l.product_name?.toLowerCase().includes(q) || l.product_sku?.toLowerCase().includes(q))
  }
  return result
})

const pagedLines = computed(() => {
  const start = (linePage.value - 1) * linesPerPage
  return filteredLines.value.slice(start, start + linesPerPage)
})

watch([lineSearch, lineStatusFilter, varianceFilter], () => { linePage.value = 1 })

const countedProgress = computed(() => {
  if (!currentCount.value?.lines?.length) return 0
  const total = currentCount.value.lines.length
  const counted = currentCount.value.lines.filter((l: StockTakeLine) => l.counted_at || l.line_status !== 'pending').length
  return total > 0 ? Math.round((counted / total) * 100) : 0
})

// ===== Actions =====
async function loadData() {
  loading.value = true
  try {
    const [countRes, sumRes] = await Promise.all([
      useApi()('/inventory/counts/'),
      useApi()('/inventory/counts/summary/'),
    ])
    counts.value = countRes.results || countRes
    summary.value = sumRes
  } catch {
    toast.error('Failed to load stock takes')
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
  form.count_type = 'full'
  form.title = ''
  form.scheduled_date = today
  form.notes = ''
  selectedProductIds.value = []
  productSearch.value = ''
  showProductPicker.value = false
  createDialog.value = true
}

function toggleFlag(line: StockTakeLine) {
  line.line_status = line.line_status === 'flagged' ? 'counted' : 'flagged'
  lineEdits.value[line.id] = lineEdits.value[line.id] !== undefined ? lineEdits.value[line.id] : Number(line.counted_quantity)
  // Mark dirty for save
  dirtyLines.value.add(line.id)
}

async function createCount() {
  if (!form.branch) { toast.error('Please select a branch'); return }
  saving.value = true
  try {
    const body: any = {
      branch: form.branch,
      count_type: form.count_type,
      title: form.title,
      scheduled_date: form.scheduled_date,
      notes: form.notes,
    }
    if (form.count_type === 'partial' && selectedProductIds.value.length > 0) {
      body.product_ids = selectedProductIds.value
    }
    await useApi()('/inventory/counts/', { method: 'POST', body })
    toast.success('Stock take created — lines generated from current stock')
    createDialog.value = false
    await loadData()
  } catch (e: any) {
    const data = e?.data || e?.response?._data || {}
    const msg = data.detail || Object.values(data).flat().join(', ') || 'Failed to create stock take'
    toast.error(typeof msg === 'string' ? msg : 'Failed to create stock take')
  } finally {
    saving.value = false
  }
}

async function actionCount(sc: StockTake, action: string, successMsg: string) {
  try {
    await useApi()(`/inventory/counts/${sc.id}/${action}/`, { method: 'POST' })
    toast.success(successMsg)
    await loadData()
  } catch (e: any) {
    const data = e?.data || e?.response?._data || {}
    const msg = data.detail || `Failed to ${action} stock take`
    toast.error(typeof msg === 'string' ? msg : `Failed to ${action} stock take`)
  }
}

function startCount(sc: StockTake) { actionCount(sc, 'start', 'Stock take started — system quantities frozen') }
function completeCount(sc: StockTake) { actionCount(sc, 'complete', 'Stock take completed — variances computed') }
function reviewCount(sc: StockTake) { actionCount(sc, 'review', 'Stock take reviewed and approved') }
function reconcileCount(sc: StockTake) { actionCount(sc, 'reconcile', 'Stock reconciled — stock levels updated') }
function cancelCount(sc: StockTake) { actionCount(sc, 'cancel', 'Stock take cancelled') }

// ===== Details (line editor) =====
const dirtyLines = ref<Set<number>>(new Set())

async function openDetails(sc: StockTake) {
  try {
    const res = await useApi()(`/inventory/counts/${sc.id}/`)
    currentCount.value = res as StockTake
    lineEdits.value = {}
    lineNotesEdits.value = {}
    dirtyLines.value.clear()
    lineSearch.value = ''
    lineStatusFilter.value = ''
    varianceFilter.value = ''
    linePage.value = 1
    detailsDialog.value = true
  } catch {
    toast.error('Failed to load stock take details')
  }
}

function onLineEdit(line: StockTakeLine) {
  dirtyLines.value.add(line.id)
  if (line.line_status === 'pending' && lineEdits.value[line.id] !== undefined) {
    line.line_status = 'counted'
  }
}

async function saveLines() {
  if (!currentCount.value) return
  if (dirtyLines.value.size === 0) {
    toast.info('No changes to save')
    return
  }
  savingLines.value = true
  try {
    const linesPayload: Array<{ id: number; counted_quantity: number; line_status: string; notes?: string }> = []
    for (const lineId of dirtyLines.value) {
      const line = currentCount.value.lines?.find((l: StockTakeLine) => l.id === lineId)
      if (!line) continue
      linesPayload.push({
        id: lineId,
        counted_quantity: lineEdits.value[lineId] !== undefined ? Number(lineEdits.value[lineId]) : Number(line.counted_quantity),
        line_status: line.line_status,
        notes: lineNotesEdits.value[lineId] ?? line.notes ?? '',
      })
    }
    await useApi()(`/inventory/counts/${currentCount.value.id}/update_lines/`, {
      method: 'PATCH',
      body: { lines: linesPayload },
    })
    toast.success('Counted quantities saved')
    dirtyLines.value.clear()
    // Reload current count
    await openDetails(currentCount.value)
  } catch (e: any) {
    const data = e?.data || e?.response?._data || {}
    const msg = data.detail || 'Failed to save lines'
    toast.error(typeof msg === 'string' ? msg : 'Failed to save lines')
  } finally {
    savingLines.value = false
  }
}

onMounted(async () => {
  await Promise.all([loadData(), loadMeta()])
})
</script>

<style scoped>
/* ===== Page Shell ===== */
.st-page {
  padding: 0 0 24px 0;
  width: 100%;
}

/* ===== Header ===== */
.st-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 16px;
  margin-bottom: 24px;
  flex-wrap: wrap;
}
.st-header__left { display: flex; align-items: flex-start; gap: 12px; }
.st-header__title h1 { letter-spacing: -0.02em; line-height: 1.2; }
.st-header__actions { display: flex; gap: 8px; flex-wrap: wrap; }

/* ===== KPI Cards ===== */
.st-kpi-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 12px;
  margin-bottom: 20px;
}
@media (max-width: 1280px) {
  .st-kpi-grid { grid-template-columns: repeat(3, 1fr); }
}
@media (max-width: 768px) {
  .st-kpi-grid { grid-template-columns: repeat(2, 1fr); }
}
@media (max-width: 480px) {
  .st-kpi-grid { grid-template-columns: 1fr; }
}
.st-kpi {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 16px 18px;
  border-radius: 14px;
  border: 1px solid rgba(var(--v-theme-on-surface), 0.08);
  background: rgb(var(--v-theme-surface));
  transition: box-shadow 0.2s;
}
.st-kpi:hover { box-shadow: 0 2px 12px rgba(0,0,0,0.06); }
.st-kpi--wide { grid-column: span 1; }
.st-kpi__icon {
  display: flex; align-items: center; justify-content: center;
  width: 44px; height: 44px; border-radius: 12px; flex-shrink: 0;
}
.st-kpi__icon--primary { background: rgba(99, 102, 241, 0.12); color: rgb(99, 102, 241); }
.st-kpi__icon--warning { background: rgba(255, 152, 0, 0.12); color: rgb(255, 152, 0); }
.st-kpi__icon--info    { background: rgba(33, 150, 243, 0.12); color: rgb(33, 150, 243); }
.st-kpi__icon--success { background: rgba(76, 175, 80, 0.12); color: rgb(76, 175, 80); }
.st-kpi__icon--neutral { background: rgba(var(--v-theme-on-surface), 0.06); color: rgba(var(--v-theme-on-surface), 0.5); }
.st-kpi__label { font-size: 0.6875rem; color: rgba(var(--v-theme-on-surface), 0.5); text-transform: uppercase; letter-spacing: 0.06em; }
.st-kpi__value { font-size: 1.5rem; font-weight: 800; letter-spacing: -0.02em; margin-top: 2px; }

/* ===== Toolbar ===== */
.st-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
  flex-wrap: wrap;
}
.st-toolbar__search {
  display: flex; align-items: center; gap: 8px;
  padding: 0 14px; border-radius: 10px;
  border: 1px solid rgba(var(--v-theme-on-surface), 0.12);
  background: rgb(var(--v-theme-surface));
  min-width: 280px; flex: 1; max-width: 500px;
  transition: border-color 0.2s;
}
.st-toolbar__search:focus-within { border-color: rgb(var(--v-theme-primary)); }
.st-toolbar__icon { color: rgba(var(--v-theme-on-surface), 0.4); }
.st-toolbar__input {
  flex: 1; border: none; outline: none; padding: 10px 0;
  font-size: 0.875rem; background: transparent; color: inherit;
}
.st-toolbar__selects { display: flex; gap: 8px; }
.st-toolbar__select {
  padding: 8px 12px; border-radius: 10px;
  border: 1px solid rgba(var(--v-theme-on-surface), 0.12);
  background: rgb(var(--v-theme-surface)); color: inherit;
  font-size: 0.8125rem; outline: none; cursor: pointer;
  transition: border-color 0.2s;
}
.st-toolbar__select:focus { border-color: rgb(var(--v-theme-primary)); }

/* ===== Filter Pills ===== */
.st-pills { display: flex; gap: 6px; margin-bottom: 16px; flex-wrap: wrap; }
.st-pills__pill {
  display: inline-flex; align-items: center; gap: 6px;
  padding: 6px 12px; border-radius: 8px;
  border: 1px solid rgba(var(--v-theme-on-surface), 0.12);
  background: transparent; font-size: 0.8125rem; font-weight: 600;
  color: rgba(var(--v-theme-on-surface), 0.6); cursor: pointer; transition: all 0.2s;
}
.st-pills__pill:hover { border-color: rgba(var(--v-theme-primary), 0.3); color: rgb(var(--v-theme-primary)); }
.st-pills__pill--active {
  background: rgba(var(--v-theme-primary), 0.08);
  color: rgb(var(--v-theme-primary)); border-color: rgba(var(--v-theme-primary), 0.3);
}
.st-pills__dot { width: 8px; height: 8px; border-radius: 50%; }
.st-pills__dot--draft { background: rgba(var(--v-theme-on-surface), 0.3); }
.st-pills__dot--in_progress { background: rgb(33, 150, 243); }
.st-pills__dot--completed { background: rgb(255, 152, 0); }
.st-pills__dot--reviewed { background: rgb(156, 39, 176); }
.st-pills__dot--reconciled { background: rgb(76, 175, 80); }
.st-pills__dot--cancelled { background: rgba(var(--v-theme-on-surface), 0.2); }
.st-pills__count {
  font-size: 0.6875rem; padding: 1px 6px; border-radius: 4px;
  background: rgba(var(--v-theme-on-surface), 0.08);
}

/* ===== Table ===== */
.st-table-wrap {
  border-radius: 14px; border: 1px solid rgba(var(--v-theme-on-surface), 0.08);
  background: rgb(var(--v-theme-surface)); overflow: hidden;
}
.st-loading, .st-empty {
  display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 60px 20px;
}
.st-table { width: 100%; border-collapse: collapse; }
.st-table thead th {
  text-align: left; padding: 12px 16px; font-size: 0.6875rem; font-weight: 700;
  text-transform: uppercase; letter-spacing: 0.06em; color: rgba(var(--v-theme-on-surface), 0.5);
  border-bottom: 1px solid rgba(var(--v-theme-on-surface), 0.08);
  white-space: nowrap;
}
.st-table tbody tr { cursor: pointer; transition: background 0.15s; }
.st-table tbody tr:hover { background: rgba(var(--v-theme-on-surface), 0.03); }
.st-table td { padding: 10px 16px; font-size: 0.8125rem; border-bottom: 1px solid rgba(var(--v-theme-on-surface), 0.04); }
.st-table__num { font-weight: 700; font-size: 0.8125rem; }
.st-table__sub { font-size: 0.6875rem; color: rgba(var(--v-theme-on-surface), 0.4); margin-top: 2px; }
.st-table__title { font-weight: 500; }
.st-table__type {
  display: inline-flex; align-items: center; gap: 4px;
  padding: 3px 8px; border-radius: 6px; font-size: 0.6875rem; font-weight: 600;
}
.st-table__type--full { background: rgba(99,102,241,0.1); color: rgb(99,102,241); }
.st-table__type--partial { background: rgba(255,152,0,0.1); color: rgb(255,152,0); }
.st-table__type--cycle { background: rgba(33,150,243,0.1); color: rgb(33,150,243); }
.st-table__type--abc { background: rgba(156,39,176,0.1); color: rgb(156,39,176); }
.st-table__variance { font-weight: 600; }
.st-table__variance--neg { color: rgb(239, 83, 80); }
.st-table__variance--pos { color: rgb(76, 175, 80); }
.st-table__value { font-weight: 600; }
.st-table__value--neg { color: rgb(239, 83, 80); }
.st-table__value--pos { color: rgb(76, 175, 80); }
.st-table__status {
  display: inline-flex; align-items: center; gap: 6px;
  padding: 4px 10px; border-radius: 8px; font-size: 0.6875rem; font-weight: 700;
  text-transform: uppercase; letter-spacing: 0.04em; white-space: nowrap;
}
.st-table__status-dot { width: 8px; height: 8px; border-radius: 50%; }
.st-table__status--draft { background: rgba(var(--v-theme-on-surface), 0.06); color: rgba(var(--v-theme-on-surface), 0.5); }
.st-table__status--draft .st-table__status-dot { background: rgba(var(--v-theme-on-surface), 0.3); }
.st-table__status--in_progress { background: rgba(33,150,243,0.1); color: rgb(33,150,243); }
.st-table__status--in_progress .st-table__status-dot { background: rgb(33,150,243); }
.st-table__status--completed { background: rgba(255,152,0,0.1); color: rgb(255,152,0); }
.st-table__status--completed .st-table__status-dot { background: rgb(255,152,0); }
.st-table__status--reviewed { background: rgba(156,39,176,0.1); color: rgb(156,39,176); }
.st-table__status--reviewed .st-table__status-dot { background: rgb(156,39,176); }
.st-table__status--reconciled { background: rgba(76,175,80,0.1); color: rgb(76,175,80); }
.st-table__status--reconciled .st-table__status-dot { background: rgb(76,175,80); }
.st-table__status--cancelled { background: rgba(239,83,80,0.1); color: rgb(239,83,80); }
.st-table__status--cancelled .st-table__status-dot { background: rgb(239,83,80); }
.st-table__actions { display: flex; gap: 4px; }
.st-action-btn {
  display: flex; align-items: center; justify-content: center;
  width: 28px; height: 28px; border: none; border-radius: 6px; cursor: pointer;
  background: transparent; color: rgba(var(--v-theme-on-surface), 0.4); transition: all 0.15s;
}
.st-action-btn:hover { background: rgba(var(--v-theme-primary), 0.08); color: rgb(var(--v-theme-primary)); }
.st-action-btn--start:hover { background: rgba(33,150,243,0.1); color: rgb(33,150,243); }
.st-action-btn--complete:hover { background: rgba(76,175,80,0.1); color: rgb(76,175,80); }
.st-action-btn--review:hover { background: rgba(156,39,176,0.1); color: rgb(156,39,176); }
.st-action-btn--reconcile:hover { background: rgba(76,175,80,0.1); color: rgb(76,175,80); }
.st-action-btn--cancel:hover { background: rgba(239,83,80,0.1); color: rgb(239,83,80); }
.st-action-btn--view:hover { background: rgba(var(--v-theme-primary), 0.08); color: rgb(var(--v-theme-primary)); }

/* ===== Pagination ===== */
.st-pagination, .st-line-pagination {
  display: flex; justify-content: space-between; align-items: center;
  padding: 12px 16px; border-top: 1px solid rgba(var(--v-theme-on-surface), 0.08);
}
.st-pagination__info { font-size: 0.75rem; color: rgba(var(--v-theme-on-surface), 0.5); }
.st-pagination__nav { display: flex; align-items: center; gap: 8px; }
.st-pagination__page { font-size: 0.8125rem; font-weight: 600; min-width: 48px; text-align: center; }

/* ===== Dialogs ===== */
.st-dialog { overflow: hidden; }
.st-dialog__header {
  display: flex; align-items: center; gap: 12px; padding: 20px 24px;
}
.st-dialog__header-icon {
  display: flex; align-items: center; justify-content: center;
  width: 48px; height: 48px; border-radius: 12px; flex-shrink: 0;
}
.st-dialog__header-icon--primary { background: rgba(99,102,241,0.12); color: rgb(99,102,241); }
.st-dialog__header-icon--draft { background: rgba(var(--v-theme-on-surface),0.08); color: rgba(var(--v-theme-on-surface),0.5); }
.st-dialog__header-icon--in_progress { background: rgba(33,150,243,0.12); color: rgb(33,150,243); }
.st-dialog__header-icon--completed { background: rgba(255,152,0,0.12); color: rgb(255,152,0); }
.st-dialog__header-icon--reviewed { background: rgba(156,39,176,0.12); color: rgb(156,39,176); }
.st-dialog__header-icon--reconciled { background: rgba(76,175,80,0.12); color: rgb(76,175,80); }
.st-dialog__header-icon--cancelled { background: rgba(239,83,80,0.12); color: rgb(239,83,80); }
.st-dialog__body { padding: 20px 24px; }

.st-form-grid {
  display: grid; grid-template-columns: 1fr 1fr; gap: 12px;
}
@media (max-width: 600px) { .st-form-grid { grid-template-columns: 1fr; } }
.st-form-field { display: flex; flex-direction: column; gap: 4px; }
.st-form__label {
  font-size: 0.6875rem; font-weight: 600; color: rgba(var(--v-theme-on-surface), 0.5);
  text-transform: uppercase; letter-spacing: 0.04em;
}
.st-form__select, .st-form__input {
  padding: 10px 12px; border-radius: 10px;
  border: 1px solid rgba(var(--v-theme-on-surface), 0.12);
  background: rgba(var(--v-theme-surface)); color: inherit;
  font-size: 0.875rem; outline: none; transition: border-color 0.2s;
}
.st-form__select:focus, .st-form__input:focus { border-color: rgb(var(--v-theme-primary)); }

/* Product picker */
.st-product-picker { position: relative; }
.st-product-picker__dropdown {
  position: absolute; top: 100%; left: 0; right: 0; z-index: 10;
  max-height: 200px; overflow-y: auto;
  border: 1px solid rgba(var(--v-theme-on-surface), 0.12);
  border-radius: 10px; background: rgb(var(--v-theme-surface));
  box-shadow: 0 4px 16px rgba(0,0,0,0.1);
}
.st-product-picker__item {
  display: flex; align-items: center; gap: 8px; padding: 8px 12px;
  font-size: 0.8125rem; cursor: pointer; transition: background 0.15s;
}
.st-product-picker__item:hover { background: rgba(var(--v-theme-on-surface), 0.04); }
.st-product-picker__item--selected { background: rgba(var(--v-theme-primary), 0.06); }
.st-product-picker__name { flex: 1; }
.st-product-picker__sku { font-size: 0.6875rem; color: rgba(var(--v-theme-on-surface), 0.4); }
.st-product-picker__empty { padding: 12px; text-align: center; color: rgba(var(--v-theme-on-surface), 0.4); font-size: 0.8125rem; }
.st-product-picker__chips { display: flex; flex-wrap: wrap; gap: 4px; margin-top: 8px; }

/* ===== Counting toolbar (inside details dialog) ===== */
.st-count-toolbar {
  display: flex; align-items: center; gap: 12px;
  padding: 12px 24px; flex-wrap: wrap;
  border-bottom: 1px solid rgba(var(--v-theme-on-surface), 0.06);
}
.st-count-toolbar__search {
  display: flex; align-items: center; gap: 8px;
  padding: 0 14px; border-radius: 10px;
  border: 1px solid rgba(var(--v-theme-on-surface), 0.12);
  background: rgb(var(--v-theme-surface));
  min-width: 220px; flex: 1; max-width: 350px;
}
.st-count-toolbar__selects { display: flex; gap: 8px; }
.st-count-toolbar__progress {
  display: flex; align-items: center; gap: 8px; margin-left: auto;
}
.st-count-toolbar__progress-label { font-size: 0.75rem; font-weight: 600; color: rgba(var(--v-theme-on-surface), 0.5); white-space: nowrap; }
.st-count-toolbar__progress-bar {
  width: 120px; height: 6px; border-radius: 3px;
  background: rgba(var(--v-theme-on-surface), 0.08);
  overflow: hidden;
}
.st-count-toolbar__progress-fill {
  height: 100%; border-radius: 3px;
  background: rgb(var(--v-theme-primary));
  transition: width 0.3s;
}

/* ===== Lines table ===== */
.st-lines-wrap {
  padding: 0 24px;
  max-height: 55vh;
  overflow-y: auto;
}
.st-lines-table { width: 100%; border-collapse: collapse; }
.st-lines-table thead th {
  text-align: left; padding: 10px 12px; font-size: 0.6875rem; font-weight: 700;
  text-transform: uppercase; letter-spacing: 0.06em; color: rgba(var(--v-theme-on-surface), 0.5);
  border-bottom: 1px solid rgba(var(--v-theme-on-surface), 0.08);
  white-space: nowrap; position: sticky; top: 0;
  background: rgb(var(--v-theme-surface)); z-index: 1;
}
.st-lines-table tbody tr { transition: background 0.15s; }
.st-lines-table tbody tr:hover { background: rgba(var(--v-theme-on-surface), 0.02); }
.st-lines-table__row--flagged { background: rgba(255, 193, 7, 0.06); }
.st-lines-table__row--variance { background: rgba(239, 83, 80, 0.03); }
.st-lines-table td { padding: 8px 12px; font-size: 0.8125rem; border-bottom: 1px solid rgba(var(--v-theme-on-surface), 0.04); }
.st-lines-table__product { font-weight: 600; font-size: 0.8125rem; }
.st-lines-table__sku { font-size: 0.6875rem; color: rgba(var(--v-theme-on-surface), 0.4); }
.st-lines-table__qty {
  width: 80px; text-align: right; padding: 4px 8px;
  border: 1px solid rgba(var(--v-theme-on-surface), 0.12);
  border-radius: 6px; background: rgba(var(--v-theme-surface));
  font-size: 0.8125rem; outline: none;
}
.st-lines-table__qty:focus { border-color: rgb(var(--v-theme-primary)); }
.st-lines-table__qty:disabled { opacity: 0.5; cursor: not-allowed; }
.st-lines-table__notes {
  width: 100px; padding: 4px 8px;
  border: 1px solid rgba(var(--v-theme-on-surface), 0.12);
  border-radius: 6px; background: rgba(var(--v-theme-surface));
  font-size: 0.75rem; outline: none;
}
.st-lines-table__notes:focus { border-color: rgb(var(--v-theme-primary)); }
.st-lines-table__notes:disabled { opacity: 0.5; cursor: not-allowed; }
.st-lines-table__variance { font-weight: 600; }
.st-lines-table__variance--neg { color: rgb(239, 83, 80); }
.st-lines-table__variance--pos { color: rgb(76, 175, 80); }
.st-lines-table__value { font-weight: 600; }
.st-lines-table__value--neg { color: rgb(239, 83, 80); }
.st-lines-table__value--pos { color: rgb(76, 175, 80); }
.st-lines-table__line-status {
  display: inline-block; padding: 2px 8px; border-radius: 6px;
  font-size: 0.6875rem; font-weight: 600; white-space: nowrap;
}
.st-lines-table__line-status--pending { background: rgba(var(--v-theme-on-surface), 0.06); color: rgba(var(--v-theme-on-surface), 0.5); }
.st-lines-table__line-status--counted { background: rgba(76,175,80,0.1); color: rgb(76,175,80); }
.st-lines-table__line-status--flagged { background: rgba(255,193,7,0.12); color: rgb(255,152,0); }
.st-lines-table__line-status--not_found { background: rgba(239,83,80,0.1); color: rgb(239,83,80); }
.st-lines-table__flag-btn {
  display: flex; align-items: center; justify-content: center;
  width: 28px; height: 28px; border: none; border-radius: 6px; cursor: pointer;
  background: transparent; color: rgba(var(--v-theme-on-surface), 0.3); transition: all 0.15s;
}
.st-lines-table__flag-btn:hover { color: rgb(255,152,0); }
.st-lines-table__flag-btn--active { color: rgb(255,152,0); }
.st-lines-table__empty { text-align: center; padding: 24px; color: rgba(var(--v-theme-on-surface), 0.4); }

/* ===== Detail summary bar ===== */
.st-detail__summary-bar {
  display: flex; gap: 20px; font-size: 0.8125rem;
  padding: 10px 16px; border-radius: 10px;
  background: rgba(var(--v-theme-on-surface), 0.04); margin-right: auto;
}
.st-detail__summary-bar span { color: rgba(var(--v-theme-on-surface), 0.5); }
.st-detail__doc-type {
  font-size: 0.6875rem; font-weight: 700; text-transform: uppercase;
  letter-spacing: 0.08em; color: rgba(var(--v-theme-on-surface), 0.4);
}
.st-detail__status-large {
  padding: 6px 14px; border-radius: 10px; font-size: 0.75rem; font-weight: 700;
  text-transform: uppercase; letter-spacing: 0.04em; white-space: nowrap;
}
.st-detail__status-large--draft { background: rgba(var(--v-theme-on-surface),0.06); color: rgba(var(--v-theme-on-surface),0.5); }
.st-detail__status-large--in_progress { background: rgba(33,150,243,0.1); color: rgb(33,150,243); }
.st-detail__status-large--completed { background: rgba(255,152,0,0.1); color: rgb(255,152,0); }
.st-detail__status-large--reviewed { background: rgba(156,39,176,0.1); color: rgb(156,39,176); }
.st-detail__status-large--reconciled { background: rgba(76,175,80,0.1); color: rgb(76,175,80); }
.st-detail__status-large--cancelled { background: rgba(239,83,80,0.1); color: rgb(239,83,80); }

/* ===== Dialog Footer ===== */
.st-dialog__actions {
  display: flex; justify-content: flex-end; align-items: center; gap: 8px;
  padding: 12px 24px; flex-wrap: wrap;
}
.st-dialog__actions-right { display: flex; gap: 8px; flex-wrap: wrap; align-items: center; }
.flex-1 { flex: 1; }
</style>
