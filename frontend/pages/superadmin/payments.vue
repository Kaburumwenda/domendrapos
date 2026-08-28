<template>
  <div class="sa-page">
    <div class="sa-header">
      <div class="sa-header__left">
        <div class="sa-header__title-icon">
          <v-icon size="26">mdi-cellphone-link</v-icon>
        </div>
        <div>
          <h1 class="text-h5 font-weight-bold">M-Pesa Payments</h1>
          <p class="text-body-2 text-medium-emphasis">All mobile money transactions across the platform</p>
        </div>
      </div>
      <div class="sa-header__actions">
        <v-btn variant="tonal" prepend-icon="mdi-refresh" :loading="loading" @click="loadPayments">Refresh</v-btn>
      </div>
    </div>

    <div v-if="loading && !transactions.length" class="sa-skeleton">
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
            <span class="sa-kpi__label">Total Transactions</span>
            <div class="sa-kpi__icon sa-kpi__icon--primary"><v-icon size="20">mdi-swap-horizontal</v-icon></div>
          </div>
          <p class="sa-kpi__value">{{ totals.count ?? 0 }}</p>
          <div class="sa-kpi__sub">All M-Pesa requests</div>
        </div>
        <div class="sa-kpi">
          <div class="sa-kpi__top">
            <span class="sa-kpi__label">Collected</span>
            <div class="sa-kpi__icon sa-kpi__icon--success"><v-icon size="20">mdi-cash-check</v-icon></div>
          </div>
          <p class="sa-kpi__value text-success">{{ formatMoney(totals.collected) }}</p>
          <div class="sa-kpi__sub">{{ totals.success }} successful</div>
        </div>
        <div class="sa-kpi">
          <div class="sa-kpi__top">
            <span class="sa-kpi__label">Pending</span>
            <div class="sa-kpi__icon sa-kpi__icon--warning"><v-icon size="20">mdi-clock-outline</v-icon></div>
          </div>
          <p class="sa-kpi__value text-warning">{{ totals.pending ?? 0 }}</p>
          <div class="sa-kpi__sub">Awaiting confirmation</div>
        </div>
        <div class="sa-kpi">
          <div class="sa-kpi__top">
            <span class="sa-kpi__label">Failed</span>
            <div class="sa-kpi__icon sa-kpi__icon--error"><v-icon size="20">mdi-alert-circle-outline</v-icon></div>
          </div>
          <p class="sa-kpi__value text-error">{{ totals.failed ?? 0 }}</p>
          <div class="sa-kpi__sub">Unsuccessful payments</div>
        </div>
      </div>

      <!-- Transactions -->
      <div class="sa-card">
        <div class="sa-card__header">
          <div class="sa-card__header-icon sa-card__header-icon--teal">
            <v-icon size="20">mdi-cash-fast</v-icon>
          </div>
          <div>
            <h3 class="sa-card__title">Transactions</h3>
            <p class="sa-card__subtitle">{{ filteredTxns.length }} of {{ transactions.length }} transactions</p>
          </div>
          <v-spacer />
          <v-text-field v-model="fSearch" density="compact" variant="outlined" placeholder="Search..." prepend-inner-icon="mdi-magnify" hide-details style="max-width:200px" class="sa-search" />
          <v-select v-model="fStatus" :items="statusOptions" density="compact" variant="outlined" hide-details style="max-width:140px" class="sa-filter" />
          <v-select v-model="fPurpose" :items="purposeOptions" density="compact" variant="outlined" hide-details style="max-width:140px" class="sa-filter" />
        </div>

        <v-data-table :headers="headers" :items="filteredTxns" :items-per-page="15" density="comfortable" hover>
          <template #item.tenant_name="{ item }">
            <div>
              <p class="text-body-2 font-weight-medium">{{ item.tenant_name || '—' }}</p>
              <p class="text-caption text-medium-emphasis">{{ item.tenant_schema || '' }}</p>
            </div>
          </template>
          <template #item.amount="{ item }">
            <span class="text-body-2 font-weight-medium">{{ formatMoney(item.amount) }} {{ item.currency }}</span>
          </template>
          <template #item.status="{ item }">
            <v-chip :color="statusColor(item.status)" size="small" variant="tonal" label>{{ item.status_display || item.status }}</v-chip>
          </template>
          <template #item.purpose="{ item }">
            <v-chip size="x-small" variant="outlined" label>{{ item.purpose_display || item.purpose }}</v-chip>
          </template>
          <template #item.phone="{ item }">
            <span class="text-body-2 text-medium-emphasis">{{ item.phone || '—' }}</span>
          </template>
          <template #item.bill_period="{ item }">
            <span class="text-body-2 text-medium-emphasis">{{ item.bill_period || '—' }}</span>
          </template>
          <template #item.created_at="{ item }">
            <span class="text-body-2 text-medium-emphasis">{{ formatTime(item.created_at) }}</span>
          </template>
          <template #item.result_desc="{ item }">
            <span class="text-caption text-medium-emphasis" style="max-width:180px;display:block;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">
              {{ item.result_desc || '—' }}
            </span>
          </template>
          <template #no-data>
            <div class="sa-empty"><v-icon size="44" color="grey-lighten-1">mdi-cash-off</v-icon><p class="text-body-2 text-medium-emphasis mt-2">No transactions</p></div>
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
const transactions = ref<any[]>([])
const totals = ref<any>({})

const fSearch = ref('')
const fStatus = ref('')
const fPurpose = ref('')

const statusOptions = [
  { title: 'All Status', value: '' },
  { title: 'Success', value: 'success' },
  { title: 'Pending', value: 'pending' },
  { title: 'Failed', value: 'failed' },
]
const purposeOptions = [
  { title: 'All Purposes', value: '' },
  { title: 'Bill', value: 'bill' },
  { title: 'Wallet', value: 'wallet' },
]

const headers = [
  { title: 'Tenant', key: 'tenant_name', sortable: true },
  { title: 'Amount', key: 'amount', sortable: true },
  { title: 'Status', key: 'status', sortable: true },
  { title: 'Purpose', key: 'purpose', sortable: true },
  { title: 'Phone', key: 'phone', sortable: false },
  { title: 'Period', key: 'bill_period', sortable: false },
  { title: 'Date', key: 'created_at', sortable: true },
  { title: 'Result', key: 'result_desc', sortable: false },
]

const filteredTxns = computed(() => {
  let list = transactions.value
  if (fSearch.value) {
    const q = fSearch.value.toLowerCase()
    list = list.filter(t =>
      t.tenant_name?.toLowerCase().includes(q) ||
      t.phone?.toLowerCase().includes(q) ||
      t.checkout_request_id?.toLowerCase().includes(q),
    )
  }
  return list
})

function statusColor(s: string): string {
  const m: Record<string, string> = { success: 'success', pending: 'warning', failed: 'error' }
  return m[s] || 'grey'
}
function formatMoney(v: any): string {
  return Number(v || 0).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 })
}
function formatTime(v: string): string {
  if (!v) return '—'
  return new Date(v).toLocaleString('en-GB', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
}

async function loadPayments() {
  loading.value = true
  try {
    const params = new URLSearchParams()
    if (fStatus.value) params.set('status', fStatus.value)
    if (fPurpose.value) params.set('purpose', fPurpose.value)
    const qs = params.toString()
    const res = await useApi()(`/usage-billing/admin/payments/${qs ? `?${qs}` : ''}`)
    totals.value = res.totals || {}
    transactions.value = res.transactions || []
  } catch {
    toast.error('Failed to load payments')
  } finally {
    loading.value = false
  }
}

watch([fStatus, fPurpose], () => loadPayments())
onMounted(loadPayments)
</script>
