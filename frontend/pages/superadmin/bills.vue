<template>
  <div class="sa-page">
    <!-- Header -->
    <div class="sa-header">
      <div class="sa-header__left">
        <div class="sa-header__title-icon">
          <v-icon size="26"> mdi-file-document-multiple-outline </v-icon>
        </div>
        <div>
          <h1 class="text-h5 font-weight-bold">Tenant Monthly Bills</h1>
          <p class="text-body-2 text-medium-emphasis">
            Generate, view, and manage usage-based bills across all tenants
          </p>
        </div>
      </div>
      <div class="sa-header__actions">
        <v-btn color="primary" prepend-icon="mdi-file-plus-outline" @click="openGenerate">Generate Bills</v-btn>
        <v-btn variant="tonal" prepend-icon="mdi-refresh" :loading="loading" @click="loadData">Refresh</v-btn>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="loading && !bills.length" class="sa-skeleton">
      <div class="sa-kpi-grid">
        <v-skeleton-loader v-for="n in 4" :key="n" type="article" class="sa-skel-kpi" boilerplate />
      </div>
      <v-skeleton-loader type="table-tbody" class="sa-skel-table" boilerplate />
    </div>

    <template v-else>
      <!-- KPIs -->
      <div class="sa-kpi-grid" style="grid-template-columns: repeat(4, 1fr)">
        <div class="sa-kpi">
          <div class="sa-kpi__top">
            <span class="sa-kpi__label">Total Billed</span>
            <div class="sa-kpi__icon sa-kpi__icon--primary">
              <v-icon size="20">mdi-file-document-multiple</v-icon>
            </div>
          </div>
          <p class="sa-kpi__value">{{ formatMoney(summary.total_billed) }}</p>
          <div class="sa-kpi__sub">{{ bills.length }} bills</div>
        </div>
        <div class="sa-kpi">
          <div class="sa-kpi__top">
            <span class="sa-kpi__label">Total Paid</span>
            <div class="sa-kpi__icon sa-kpi__icon--success">
              <v-icon size="20">mdi-cash-check</v-icon>
            </div>
          </div>
          <p class="sa-kpi__value text-success">{{ formatMoney(summary.total_paid) }}</p>
          <div class="sa-kpi__sub">{{ summary.paid_count }} paid bills</div>
        </div>
        <div class="sa-kpi">
          <div class="sa-kpi__top">
            <span class="sa-kpi__label">Outstanding</span>
            <div class="sa-kpi__icon sa-kpi__icon--warning">
              <v-icon size="20">mdi-cash-clock</v-icon>
            </div>
          </div>
          <p class="sa-kpi__value text-warning">{{ formatMoney(summary.total_outstanding) }}</p>
          <div class="sa-kpi__sub">{{ summary.outstanding_count }} unpaid</div>
        </div>
        <div class="sa-kpi">
          <div class="sa-kpi__top">
            <span class="sa-kpi__label">Overdue</span>
            <div class="sa-kpi__icon sa-kpi__icon--error">
              <v-icon size="20">mdi-alert-circle-outline</v-icon>
            </div>
          </div>
          <p class="sa-kpi__value text-error">{{ summary.overdue_count }}</p>
          <div class="sa-kpi__sub">Bills past due date</div>
        </div>
      </div>

      <!-- Filters -->
      <div class="sa-card" style="margin-bottom: 16px">
        <div class="d-flex flex-wrap align-center ga-3">
          <v-text-field
            v-model="search"
            density="compact"
            variant="outlined"
            placeholder="Search tenant or period..."
            prepend-inner-icon="mdi-magnify"
            hide-details
            style="max-width: 260px"
            class="sa-search"
          />
          <v-select
            v-model="statusFilter"
            :items="statusOptions"
            density="compact"
            variant="outlined"
            hide-details
            style="max-width: 160px"
            class="sa-filter"
          />
          <v-select
            v-model="tenantFilter"
            :items="tenantOptions"
            item-title="name"
            item-value="id"
            density="compact"
            variant="outlined"
            label="All Tenants"
            clearable
            hide-details
            style="max-width: 240px"
            @update:model-value="loadData"
          />
          <v-spacer />
          <span class="text-body-2 text-medium-emphasis">{{ filteredBills.length }} bills</span>
        </div>
      </div>

      <!-- Bills Table -->
      <div class="sa-card">
        <v-data-table
          :headers="headers"
          :items="filteredBills"
          :items-per-page="20"
          density="comfortable"
          hover
        >
          <template #item.period="{ item }">
            <span class="text-body-2 font-weight-medium">{{ item.period_label }}</span>
          </template>
          <template #item.tenant_name="{ item }">
            <div>
              <span class="text-body-2 font-weight-medium">{{ item.tenant_name || '—' }}</span>
              <div class="text-caption text-medium-emphasis">{{ item.tenant_schema }}</div>
            </div>
          </template>
          <template #item.total_requests="{ item }">
            <span class="text-body-2">{{ formatNum(item.total_requests) }}</span>
          </template>
          <template #item.amount="{ item }">
            <span class="text-body-2 font-weight-medium">{{ formatMoney(item.amount) }}</span>
          </template>
          <template #item.balance="{ item }">
            <span class="text-body-2" :class="hasBalance(item) ? 'text-warning font-weight-medium' : 'text-success'">
              {{ formatMoney(item.balance) }}
            </span>
          </template>
          <template #item.effective_status="{ item }">
            <v-chip :color="statusColor(item.effective_status)" size="small" variant="tonal" label>
              {{ item.effective_status }}
            </v-chip>
          </template>
          <template #item.due_date="{ item }">
            <span class="text-body-2" :class="item.is_overdue ? 'text-error font-weight-medium' : 'text-medium-emphasis'">
              {{ item.due_date ? formatDate(item.due_date) : '—' }}
            </span>
          </template>
          <template #item.actions="{ item }">
            <v-menu>
              <template #activator="{ props }">
                <v-btn v-bind="props" size="small" variant="text" icon="mdi-dots-vertical" />
              </template>
              <v-list density="compact">
                <v-list-item
                  v-if="hasBalance(item) && item.status !== 'PAID'"
                  prepend-icon="mdi-cash-check"
                  title="Mark Paid"
                  @click="billAction(item, 'mark_paid')"
                />
                <v-list-item
                  v-if="item.status !== 'WAIVED' && item.status !== 'PAID' && item.status !== 'CANCELLED'"
                  prepend-icon="mdi-gift-outline"
                  title="Waive"
                  @click="billAction(item, 'waive')"
                />
                <v-list-item
                  v-if="item.status !== 'CANCELLED' && item.status !== 'PAID'"
                  prepend-icon="mdi-close-circle-outline"
                  title="Cancel"
                  @click="billAction(item, 'cancel')"
                />
                <v-list-item
                  v-if="item.status === 'CANCELLED' || item.status === 'WAIVED'"
                  prepend-icon="mdi-refresh"
                  title="Reactivate"
                  @click="billAction(item, 'reactivate')"
                />
              </v-list>
            </v-menu>
          </template>
          <template #no-data>
            <div class="sa-empty">
              <v-icon size="44" color="grey-lighten-1">mdi-file-document-remove-outline</v-icon>
              <p class="text-body-2 text-medium-emphasis mt-2">No bills found</p>
            </div>
          </template>
        </v-data-table>
      </div>
    </template>

    <!-- Generate Bills Dialog -->
    <v-dialog v-model="genDialog" max-width="520">
      <v-card rounded="xl">
        <v-card-title class="text-h6 font-weight-bold pa-5 pb-2">Generate Monthly Bills</v-card-title>
        <v-card-text class="px-5 pb-2">
          <p class="text-body-2 text-medium-emphasis mb-4">
            Generate usage-based bills for a specific month. Bills are created for all tenants with API
            usage in that period.
          </p>
          <div class="d-flex ga-3 mb-3">
            <v-text-field
              v-model.number="genForm.year"
              type="number"
              label="Year"
              variant="outlined"
              density="compact"
              style="max-width: 120px"
            />
            <v-select
              v-model="genForm.month"
              :items="monthOptions"
              item-title="label"
              item-value="value"
              label="Month"
              variant="outlined"
              density="compact"
              style="max-width: 180px"
            />
          </div>
          <v-select
            v-model="genForm.tenant"
            :items="tenantOptions"
            item-title="name"
            item-value="id"
            label="Specific tenant (optional)"
            variant="outlined"
            density="compact"
            clearable
            class="mb-3"
          />
          <v-switch
            v-model="genForm.force"
            label="Regenerate existing bills (overwrite amounts)"
            color="warning"
            density="compact"
            inset
          />
        </v-card-text>
        <v-card-actions class="pa-5 pt-2">
          <v-spacer />
          <v-btn variant="text" @click="genDialog = false">Cancel</v-btn>
          <v-btn color="primary" :loading="generating" @click="generateBills">Generate</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Action Confirm Dialog -->
    <v-dialog v-model="actionDialog" max-width="440">
      <v-card rounded="xl">
        <v-card-title class="text-h6 font-weight-bold pa-5 pb-2">
          {{ actionTitle }}
        </v-card-title>
        <v-card-text class="px-5 pb-2">
          <p class="text-body-2 mb-3">{{ actionDescription }}</p>
          <v-text-field
            v-if="actionForm.action === 'waive' || actionForm.action === 'cancel'"
            v-model="actionForm.reason"
            label="Reason (optional)"
            variant="outlined"
            density="compact"
          />
        </v-card-text>
        <v-card-actions class="pa-5 pt-2">
          <v-spacer />
          <v-btn variant="text" @click="actionDialog = false">Cancel</v-btn>
          <v-btn :color="actionColor" :loading="actionLoading" @click="confirmAction">Confirm</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ middleware: 'auth' })
const toast = useToast()

const loading = ref(false)
const generating = ref(false)
const bills = ref<any[]>([])
const tenants = ref<any[]>([])
const genDialog = ref(false)
const actionDialog = ref(false)
const actionLoading = ref(false)

const search = ref('')
const statusFilter = ref('all')
const tenantFilter = ref<number | null>(null)

const summary = ref({
  total_billed: '0',
  total_paid: '0',
  total_outstanding: '0',
  paid_count: 0,
  outstanding_count: 0,
  overdue_count: 0,
})

const today = new Date()
const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1)
const genForm = reactive({
  year: lastMonth.getFullYear(),
  month: lastMonth.getMonth() + 1,
  tenant: null as number | null,
  force: false,
})

const actionForm = reactive({
  billId: 0,
  billLabel: '',
  action: '',
  reason: '',
})

const tenantOptions = computed(() =>
  tenants.value.map((t) => ({ id: t.id, name: t.name || `Tenant #${t.id}` })),
)

const monthOptions = [
  { label: 'January', value: 1 },
  { label: 'February', value: 2 },
  { label: 'March', value: 3 },
  { label: 'April', value: 4 },
  { label: 'May', value: 5 },
  { label: 'June', value: 6 },
  { label: 'July', value: 7 },
  { label: 'August', value: 8 },
  { label: 'September', value: 9 },
  { label: 'October', value: 10 },
  { label: 'November', value: 11 },
  { label: 'December', value: 12 },
]

const statusOptions = [
  { title: 'All', value: 'all' },
  { title: 'Issued', value: 'ISSUED' },
  { title: 'Partial', value: 'PARTIAL' },
  { title: 'Paid', value: 'PAID' },
  { title: 'Overdue', value: 'OVERDUE' },
  { title: 'Cancelled', value: 'CANCELLED' },
  { title: 'Waived', value: 'WAIVED' },
]

const headers = [
  { title: 'Period', key: 'period', sortable: true },
  { title: 'Tenant', key: 'tenant_name', sortable: true },
  { title: 'Requests', key: 'total_requests', sortable: true },
  { title: 'Amount', key: 'amount', sortable: true },
  { title: 'Balance', key: 'balance', sortable: true },
  { title: 'Status', key: 'effective_status', sortable: true },
  { title: 'Due Date', key: 'due_date', sortable: true },
  { title: '', key: 'actions', sortable: false },
]

const filteredBills = computed(() => {
  let list = bills.value
  if (statusFilter.value !== 'all') {
    if (statusFilter.value === 'OVERDUE') {
      list = list.filter((b) => b.is_overdue)
    } else {
      list = list.filter((b) => b.status === statusFilter.value)
    }
  }
  if (search.value) {
    const q = search.value.toLowerCase()
    list = list.filter(
      (b) =>
        b.tenant_name?.toLowerCase().includes(q) ||
        b.tenant_schema?.toLowerCase().includes(q) ||
        b.period_label?.toLowerCase().includes(q),
    )
  }
  return list
})

const actionTitle = computed(() => {
  const labels: Record<string, string> = {
    mark_paid: 'Mark Bill as Paid',
    waive: 'Waive Bill',
    cancel: 'Cancel Bill',
    reactivate: 'Reactivate Bill',
  }
  return labels[actionForm.action] || 'Bill Action'
})

const actionDescription = computed(() => {
  const descs: Record<string, string> = {
    mark_paid: `Mark bill ${actionForm.billLabel} as fully paid. Any remaining balance will be cleared.`,
    waive: `Waive bill ${actionForm.billLabel}. The tenant will no longer owe this amount.`,
    cancel: `Cancel bill ${actionForm.billLabel}. This marks the bill as cancelled and no longer collectible.`,
    reactivate: `Reactivate bill ${actionForm.billLabel}. The bill will return to 'ISSUED' status.`,
  }
  return descs[actionForm.action] || ''
})

const actionColor = computed(() => {
  const colors: Record<string, string> = {
    mark_paid: 'success',
    waive: 'info',
    cancel: 'error',
    reactivate: 'primary',
  }
  return colors[actionForm.action] || 'primary'
})

function statusColor(s: string): string {
  const m: Record<string, string> = {
    PAID: 'success',
    OVERDUE: 'error',
    ISSUED: 'info',
    PARTIAL: 'warning',
    DRAFT: 'grey',
    CANCELLED: 'grey',
    WAIVED: 'info',
  }
  return m[s] || 'grey'
}

function formatMoney(v: any): string {
  return `$${Number(v || 0).toFixed(4)}`
}

function hasBalance(item: any): boolean {
  return parseFloat(item.balance) > 0
}

function formatNum(v: any): string {
  return Number(v || 0).toLocaleString('en-US')
}

function formatDate(v: string): string {
  return new Date(v).toLocaleDateString('en-GB', { year: 'numeric', month: 'short', day: 'numeric' })
}

function openGenerate() {
  genForm.year = lastMonth.getFullYear()
  genForm.month = lastMonth.getMonth() + 1
  genForm.tenant = null
  genForm.force = false
  genDialog.value = true
}

function billAction(bill: any, action: string) {
  actionForm.billId = bill.id
  actionForm.billLabel = `${bill.period_label} (${bill.tenant_name || '—'})`
  actionForm.action = action
  actionForm.reason = ''
  actionDialog.value = true
}

async function loadTenants() {
  try {
    const resp = await useApi()('/tenants/manage/')
    tenants.value = resp.results || resp || []
  } catch { /* non-fatal */ }
}

async function loadData() {
  loading.value = true
  try {
    const params: Record<string, string> = {}
    if (tenantFilter.value) params.tenant = String(tenantFilter.value)
    const query = new URLSearchParams(params).toString()
    const data = await useApi()(`/usage-billing/admin/bills/?${query}`)
    bills.value = data.bills || []
    summary.value = data.summary || summary.value
    if (tenants.value.length === 0) await loadTenants()
  } catch {
    toast.error('Failed to load bills')
  } finally {
    loading.value = false
  }
}

async function generateBills() {
  generating.value = true
  try {
    const body: any = { year: genForm.year, month: genForm.month, force: genForm.force }
    if (genForm.tenant) body.tenant = genForm.tenant
    const resp = await useApi()('/usage-billing/admin/bills/', { method: 'POST', body })
    toast.success(resp.detail || 'Bills generated')
    genDialog.value = false
    await loadData()
  } catch (e: any) {
    toast.error(e?.data?.detail || 'Failed to generate bills')
  } finally {
    generating.value = false
  }
}

async function confirmAction() {
  actionLoading.value = true
  try {
    const body: any = { action: actionForm.action }
    if (actionForm.reason) body.reason = actionForm.reason
    await useApi()(`/usage-billing/admin/bills/${actionForm.billId}/`, { method: 'PATCH', body })
    toast.success('Bill updated')
    actionDialog.value = false
    await loadData()
  } catch (e: any) {
    toast.error(e?.data?.detail || 'Failed to update bill')
  } finally {
    actionLoading.value = false
  }
}

onMounted(loadData)
</script>
