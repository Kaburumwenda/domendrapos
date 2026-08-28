<template>
  <div class="sa-page">
    <div class="sa-header">
      <div class="sa-header__left">
        <div class="sa-header__title-icon">
          <v-icon size="26">mdi-file-document-outline</v-icon>
        </div>
        <div>
          <h1 class="text-h5 font-weight-bold">Platform Billing</h1>
          <p class="text-body-2 text-medium-emphasis">Invoices & payments across all tenants</p>
        </div>
      </div>
      <div class="sa-header__actions">
        <v-btn variant="tonal" prepend-icon="mdi-refresh" :loading="loading" @click="loadAll">Refresh</v-btn>
      </div>
    </div>

    <div v-if="loading && !invoices.length" class="sa-skeleton">
      <div class="sa-kpi-grid">
        <v-skeleton-loader v-for="n in 4" :key="n" type="article" class="sa-skel-kpi" boilerplate />
      </div>
      <v-skeleton-loader type="table-tbody" class="sa-skel-table" boilerplate />
    </div>

    <template v-else>
      <!-- KPIs -->
      <div class="sa-kpi-grid">
        <div class="sa-kpi">
          <div class="sa-kpi__top">
            <span class="sa-kpi__label">Total Invoiced</span>
            <div class="sa-kpi__icon sa-kpi__icon--primary"><v-icon size="20">mdi-file-document-multiple</v-icon></div>
          </div>
          <p class="sa-kpi__value">{{ formatMoney(totalInvoiced) }}</p>
          <div class="sa-kpi__sub">{{ invoices.length }} invoices</div>
        </div>
        <div class="sa-kpi">
          <div class="sa-kpi__top">
            <span class="sa-kpi__label">Total Paid</span>
            <div class="sa-kpi__icon sa-kpi__icon--success"><v-icon size="20">mdi-cash-check</v-icon></div>
          </div>
          <p class="sa-kpi__value text-success">{{ formatMoney(totalPaid) }}</p>
          <div class="sa-kpi__sub">{{ paidCount }} paid invoices</div>
        </div>
        <div class="sa-kpi">
          <div class="sa-kpi__top">
            <span class="sa-kpi__label">Outstanding</span>
            <div class="sa-kpi__icon sa-kpi__icon--warning"><v-icon size="20">mdi-cash-clock</v-icon></div>
          </div>
          <p class="sa-kpi__value text-warning">{{ formatMoney(totalOutstanding) }}</p>
          <div class="sa-kpi__sub">{{ openCount }} unpaid invoices</div>
        </div>
        <div class="sa-kpi">
          <div class="sa-kpi__top">
            <span class="sa-kpi__label">Overdue</span>
            <div class="sa-kpi__icon sa-kpi__icon--error"><v-icon size="20">mdi-alert-circle-outline</v-icon></div>
          </div>
          <p class="sa-kpi__value text-error">{{ formatMoney(totalOverdue) }}</p>
          <div class="sa-kpi__sub">{{ overdueCount }} overdue</div>
        </div>
      </div>

      <!-- Invoices -->
      <div class="sa-card">
        <div class="sa-card__header">
          <div class="sa-card__header-icon sa-card__header-icon--purple">
            <v-icon size="20">mdi-receipt-text-outline</v-icon>
          </div>
          <div>
            <h3 class="sa-card__title">Invoices</h3>
            <p class="sa-card__subtitle">{{ filteredInvoices.length }} invoices</p>
          </div>
          <v-spacer />
          <v-text-field v-model="invSearch" density="compact" variant="outlined" placeholder="Search invoice #..." prepend-inner-icon="mdi-magnify" hide-details style="max-width:220px" class="sa-search" />
          <v-select v-model="invStatus" :items="invStatusOptions" density="compact" variant="outlined" hide-details style="max-width:150px" class="sa-filter" />
        </div>

        <v-data-table :headers="invHeaders" :items="filteredInvoices" :items-per-page="15" density="comfortable" hover>
          <template #item.invoice_number="{ item }">
            <span class="text-body-2 font-weight-medium">{{ item.invoice_number }}</span>
          </template>
          <template #item.tenant="{ item }">
            <span class="text-body-2">{{ tenantName(item.tenant) }}</span>
          </template>
          <template #item.total="{ item }">
            <span class="text-body-2 font-weight-medium">{{ formatMoney(item.total) }}</span>
          </template>
          <template #item.status="{ item }">
            <v-chip :color="statusColor(item.status)" size="small" variant="tonal" label>{{ item.status }}</v-chip>
          </template>
          <template #item.issue_date="{ item }">
            <span class="text-body-2 text-medium-emphasis">{{ formatDate(item.issue_date) }}</span>
          </template>
          <template #item.due_date="{ item }">
            <span class="text-body-2" :class="isOverdue(item) ? 'text-error font-weight-medium' : 'text-medium-emphasis'">{{ formatDate(item.due_date) }}</span>
          </template>
          <template #item.paid_date="{ item }">
            <span class="text-body-2 text-medium-emphasis">{{ item.paid_date ? formatDate(item.paid_date) : '—' }}</span>
          </template>
          <template #no-data>
            <div class="sa-empty"><v-icon size="44" color="grey-lighten-1">mdi-receipt-off-outline</v-icon><p class="text-body-2 text-medium-emphasis mt-2">No invoices</p></div>
          </template>
        </v-data-table>
      </div>

      <!-- Payments -->
      <div class="sa-card">
        <div class="sa-card__header">
          <div class="sa-card__header-icon sa-card__header-icon--green">
            <v-icon size="20">mdi-cash-fast</v-icon>
          </div>
          <div>
            <h3 class="sa-card__title">Payment Records</h3>
            <p class="sa-card__subtitle">{{ payments.length }} payments recorded</p>
          </div>
        </div>
        <v-data-table :headers="payHeaders" :items="payments" :items-per-page="10" density="comfortable" hover>
          <template #item.amount="{ item }">
            <span class="text-body-2 font-weight-medium text-success">{{ formatMoney(item.amount) }}</span>
          </template>
          <template #item.tenant="{ item }">
            <span class="text-body-2">{{ tenantNameByInvoice(item.invoice) }}</span>
          </template>
          <template #item.paid_at="{ item }">
            <span class="text-body-2 text-medium-emphasis">{{ formatDate(item.paid_at) }}</span>
          </template>
          <template #no-data>
            <div class="sa-empty"><v-icon size="44" color="grey-lighten-1">mdi-cash-off</v-icon><p class="text-body-2 text-medium-emphasis mt-2">No payments recorded</p></div>
          </template>
        </v-data-table>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ middleware: 'auth' })
const toast = useToast()

const loading = ref(false)
const invoices = ref<any[]>([])
const payments = ref<any[]>([])
const tenants = ref<Record<number, string>>({})

const invSearch = ref('')
const invStatus = ref('all')
const invStatusOptions = [
  { title: 'All', value: 'all' },
  { title: 'Draft', value: 'draft' },
  { title: 'Sent', value: 'sent' },
  { title: 'Paid', value: 'paid' },
  { title: 'Overdue', value: 'overdue' },
  { title: 'Cancelled', value: 'cancelled' },
]

const invHeaders = [
  { title: 'Invoice #', key: 'invoice_number', sortable: true },
  { title: 'Tenant', key: 'tenant', sortable: false },
  { title: 'Amount', key: 'total', sortable: true },
  { title: 'Status', key: 'status', sortable: true },
  { title: 'Issued', key: 'issue_date', sortable: true },
  { title: 'Due', key: 'due_date', sortable: true },
  { title: 'Paid', key: 'paid_date', sortable: true },
]
const payHeaders = [
  { title: 'Amount', key: 'amount', sortable: true },
  { title: 'Tenant', key: 'tenant', sortable: false },
  { title: 'Method', key: 'method', sortable: true },
  { title: 'Reference', key: 'reference', sortable: false },
  { title: 'Date', key: 'paid_at', sortable: true },
]

const filteredInvoices = computed(() => {
  let list = invoices.value
  if (invStatus.value !== 'all') list = list.filter(i => i.status === invStatus.value)
  if (invSearch.value) {
    const q = invSearch.value.toLowerCase()
    list = list.filter(i => i.invoice_number?.toLowerCase().includes(q))
  }
  return list
})

const totalInvoiced = computed(() => invoices.value.reduce((s, i) => s + Number(i.total || 0), 0))
const totalPaid = computed(() => invoices.value.filter(i => i.status === 'paid').reduce((s, i) => s + Number(i.total || 0), 0))
const totalOutstanding = computed(() => invoices.value.filter(i => i.status !== 'paid' && i.status !== 'cancelled').reduce((s, i) => s + Number(i.total || 0), 0))
const totalOverdue = computed(() => invoices.value.filter(i => i.status === 'overdue').reduce((s, i) => s + Number(i.total || 0), 0))
const paidCount = computed(() => invoices.value.filter(i => i.status === 'paid').length)
const openCount = computed(() => invoices.value.filter(i => i.status !== 'paid' && i.status !== 'cancelled').length)
const overdueCount = computed(() => invoices.value.filter(i => i.status === 'overdue').length)

function statusColor(s: string): string {
  const m: Record<string, string> = { paid: 'success', overdue: 'error', sent: 'info', draft: 'grey', cancelled: 'grey' }
  return m[s] || 'grey'
}
function isOverdue(inv: any): boolean {
  return inv.status === 'overdue' || (inv.status !== 'paid' && inv.due_date && new Date(inv.due_date) < new Date())
}
function tenantName(id: number): string {
  return tenants.value[id] || `Tenant #${id}`
}
function tenantNameByInvoice(invoiceId: number): string {
  const inv = invoices.value.find(i => i.id === invoiceId)
  return inv ? tenantName(inv.tenant) : `Invoice #${invoiceId}`
}
function formatDate(v: string): string {
  if (!v) return '—'
  return new Date(v).toLocaleDateString('en-GB', { year: 'numeric', month: 'short', day: 'numeric' })
}
function formatMoney(v: any): string {
  return `KSh ${Number(v || 0).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`
}

async function loadTenants() {
  try {
    const data = await useApi()('/tenants/manage/')
    const list = data.results || data || []
    list.forEach((t: any) => { tenants.value[t.id] = t.name })
  } catch { /* non-fatal */ }
}

async function loadAll() {
  loading.value = true
  try {
    const [inv, pay] = await Promise.all([
      useApi()('/billing/invoices/?page_size=500'),
      useApi()('/billing/payments/?page_size=500'),
    ])
    invoices.value = inv.results || inv || []
    payments.value = pay.results || pay || []
    if (Object.keys(tenants.value).length === 0) await loadTenants()
  } catch {
    toast.error('Failed to load billing data')
  } finally {
    loading.value = false
  }
}

onMounted(loadAll)
</script>
