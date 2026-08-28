<template>
  <div class="pa-4">
    <div class="d-flex align-center mb-4 flex-wrap ga-3">
      <h2 class="text-h5 font-weight-bold me-auto">Customer Invoices</h2>
      <v-btn variant="tonal" size="small" prepend-icon="mdi-refresh" @click="loadData">Refresh</v-btn>
      <v-btn variant="flat" color="primary" prepend-icon="mdi-plus" @click="openCreate">New Invoice</v-btn>
    </div>

    <!-- KPI cards -->
    <v-row density="comfortable" class="mb-4">
      <v-col cols="6" md="3"><v-card rounded="lg" variant="outlined" class="pa-3"><p class="text-caption text-medium-emphasis">Total Invoiced</p><p class="text-h6 font-weight-bold">{{ formatMoney(kpis.totalInvoiced) }}</p></v-card></v-col>
      <v-col cols="6" md="3"><v-card rounded="lg" variant="outlined" class="pa-3"><p class="text-caption text-medium-emphasis">Total Collected</p><p class="text-h6 font-weight-bold text-success">{{ formatMoney(kpis.collected) }}</p></v-card></v-col>
      <v-col cols="6" md="3"><v-card rounded="lg" variant="outlined" class="pa-3"><p class="text-caption text-medium-emphasis">Outstanding</p><p class="text-h6 font-weight-bold text-error">{{ formatMoney(kpis.outstanding) }}</p></v-card></v-col>
      <v-col cols="6" md="3"><v-card rounded="lg" variant="outlined" class="pa-3"><p class="text-caption text-medium-emphasis">Overdue Count</p><p class="text-h6 font-weight-bold text-error">{{ kpis.overdueCount }}</p></v-card></v-col>
    </v-row>

    <!-- Aging buckets -->
    <v-row density="comfortable" class="mb-4">
      <v-col cols="6" md="3"><v-card rounded="lg" variant="outlined" class="pa-3"><p class="text-caption">Not Due</p><p class="text-h6">{{ formatMoney(aging.notDue) }}</p></v-card></v-col>
      <v-col cols="6" md="3"><v-card rounded="lg" variant="outlined" class="pa-3"><p class="text-caption">1-30 Days</p><p class="text-h6 text-warning">{{ formatMoney(aging.d30) }}</p></v-card></v-col>
      <v-col cols="6" md="3"><v-card rounded="lg" variant="outlined" class="pa-3"><p class="text-caption">31-60 Days</p><p class="text-h6 text-orange">{{ formatMoney(aging.d60) }}</p></v-card></v-col>
      <v-col cols="6" md="3"><v-card rounded="lg" variant="outlined" class="pa-3"><p class="text-caption">60+ Days</p><p class="text-h6 text-error">{{ formatMoney(aging.d60Plus) }}</p></v-card></v-col>
    </v-row>

    <!-- Filters -->
    <div class="d-flex ga-2 mb-4 flex-wrap">
      <v-text-field v-model="searchText" prepend-inner-icon="mdi-magnify" placeholder="Search invoice # or customer..." density="compact" variant="outlined" hide-details class="flex-grow-1" />
      <v-select v-model="statusFilter" :items="['draft','sent','partially_paid','paid','overdue','cancelled']" density="compact" variant="outlined" hide-details style="max-width: 150px;" label="Status" clearable />
    </div>

    <!-- Table -->
    <v-card rounded="lg" variant="outlined">
      <v-data-table :items="filtered" :headers="headers" :loading="loading" density="compact" items-per-page-text="Rows per page">
        <template #item.invoice_number="{ item }"><span class="font-weight-medium">{{ item.invoice_number }}</span></template>
        <template #item.created_at="{ item }">{{ new Date(item.created_at).toLocaleDateString() }}</template>
        <template #item.total="{ item }"><span>{{ formatMoney(item.total) }}</span></template>
        <template #item.balance="{ item }"><span class="font-weight-bold" :class="Number(item.balance) > 0 ? 'text-error' : 'text-success'">{{ formatMoney(item.balance) }}</span></template>
        <template #item.status="{ item }"><v-chip size="small" :color="statusColor(item.status)" variant="tonal">{{ item.status_display }}</v-chip></template>
        <template #item.actions="{ item }">
          <v-btn size="small" variant="text" icon="mdi-eye" @click="viewInvoice(item)" />
          <v-btn size="small" variant="text" icon="mdi-cash" @click="openPayment(item)" v-if="Number(item.balance) > 0" />
        </template>
      </v-data-table>
    </v-card>

    <!-- Detail dialog -->
    <v-dialog v-model="detailDialog" max-width="600" scrollable>
      <v-card rounded="xl" v-if="selected">
        <v-card-title class="text-h6 d-flex justify-space-between">
          <span>{{ selected.invoice_number }}</span>
          <v-chip size="small" :color="statusColor(selected.status)" variant="tonal">{{ selected.status_display }}</v-chip>
        </v-card-title>
        <v-card-text>
          <div class="d-flex justify-space-between mb-3">
            <div><div class="text-caption">Customer</div><div class="font-weight-medium">{{ selected.customer_name }}</div><div class="text-caption" v-if="selected.customer_phone">{{ selected.customer_phone }}</div></div>
            <div class="text-right"><div class="text-caption">Date / Due</div><div>{{ new Date(selected.created_at).toLocaleDateString() }}</div><div class="text-caption" v-if="selected.due_date">{{ new Date(selected.due_date).toLocaleDateString() }}</div></div>
          </div>
          <v-table density="compact">
            <thead><tr><th>Description</th><th class="text-right">Qty</th><th class="text-right">Price</th><th class="text-right">Total</th></tr></thead>
            <tbody>
              <tr v-for="line in selected.lines" :key="line.id"><td>{{ line.description }}</td><td class="text-right">{{ line.quantity }}</td><td class="text-right">{{ formatMoney(line.unit_price) }}</td><td class="text-right">{{ formatMoney(line.line_total) }}</td></tr>
            </tbody>
          </v-table>
          <v-divider class="my-2" />
          <div class="d-flex justify-space-between"><span>Subtotal</span><span>{{ formatMoney(selected.subtotal) }}</span></div>
          <div class="d-flex justify-space-between"><span>Tax</span><span>{{ formatMoney(selected.tax) }}</span></div>
          <div class="d-flex justify-space-between"><span>Discount</span><span>-{{ formatMoney(selected.discount) }}</span></div>
          <div class="d-flex justify-space-between font-weight-bold text-h6"><span>Total</span><span class="text-primary">{{ formatMoney(selected.total) }}</span></div>
          <div class="d-flex justify-space-between mt-2"><span>Paid</span><span class="text-success">{{ formatMoney(selected.amount_paid) }}</span></div>
          <div class="d-flex justify-space-between font-weight-bold"><span>Balance</span><span class="text-error">{{ formatMoney(selected.balance) }}</span></div>
        </v-card-text>
        <v-card-actions><v-spacer /><v-btn variant="text" @click="detailDialog = false">Close</v-btn><v-btn v-if="Number(selected.balance) > 0" variant="flat" color="primary" @click="openPayment(selected); detailDialog = false">Record Payment</v-btn></v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Payment dialog -->
    <v-dialog v-model="paymentDialog" max-width="400">
      <v-card rounded="xl">
        <v-card-title>Record Payment</v-card-title>
        <v-card-text v-if="selected">
          <div class="d-flex justify-space-between mb-2"><span>Invoice</span><span class="font-weight-medium">{{ selected.invoice_number }}</span></div>
          <div class="d-flex justify-space-between mb-2"><span>Balance</span><span class="font-weight-bold text-error">{{ formatMoney(selected.balance) }}</span></div>
          <v-text-field v-model.number="payAmount" label="Amount" type="number" prefix="KSh" density="compact" variant="outlined" />
          <v-select v-model="payMethod" :items="['cash','mpesa','card','bank_transfer']" label="Method" density="compact" variant="outlined" class="mt-2" />
          <v-text-field v-model="payRef" label="Reference" density="compact" variant="outlined" class="mt-2" />
        </v-card-text>
        <v-card-actions><v-spacer /><v-btn variant="text" @click="paymentDialog = false">Cancel</v-btn><v-btn variant="flat" color="primary" @click="recordPayment" :loading="saving">Save</v-btn></v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Create dialog -->
    <v-dialog v-model="createDialog" max-width="700" scrollable>
      <v-card rounded="xl">
        <v-card-title>Create New Invoice</v-card-title>
        <v-card-text>
          <v-row density="comfortable">
            <v-col cols="12" md="6"><v-text-field v-model="form.customer_name" label="Customer Name" density="compact" variant="outlined" /></v-col>
            <v-col cols="12" md="6"><v-text-field v-model="form.customer_phone" label="Phone" density="compact" variant="outlined" /></v-col>
            <v-col cols="12" md="6"><v-select v-model="form.customer" :items="customerOptions" item-title="name" item-value="id" label="Select Existing Customer" density="compact" variant="outlined" clearable /></v-col>
            <v-col cols="12" md="6"><v-text-field v-model="form.due_date" label="Due Date" type="date" density="compact" variant="outlined" /></v-col>
          </v-row>
          <v-divider class="my-3" />
          <div class="d-flex justify-space-between align-center mb-2">
            <span class="text-subtitle-2">Line Items</span>
            <v-btn size="small" variant="tonal" prepend-icon="mdi-plus" @click="addLine">Add Line</v-btn>
          </div>
          <div v-for="(line, i) in form.lines" :key="i" class="d-flex ga-2 mb-2 align-center">
            <v-text-field v-model="line.description" label="Description" density="compact" variant="outlined" class="flex-grow-1" />
            <v-text-field v-model.number="line.quantity" label="Qty" type="number" density="compact" variant="outlined" style="max-width: 80px;" @update:modelValue="calcLine(line)" />
            <v-text-field v-model.number="line.unit_price" label="Price" type="number" prefix="KSh" density="compact" variant="outlined" style="max-width: 120px;" @update:modelValue="calcLine(line)" />
            <span class="text-body-2" style="min-width: 80px;">{{ formatMoney(line.line_total) }}</span>
            <v-btn icon="mdi-delete" size="small" variant="text" color="error" @click="form.lines.splice(i, 1)" />
          </div>
          <v-divider class="my-2" />
          <div class="d-flex justify-space-between"><span>Subtotal</span><span>{{ formatMoney(formSubtotal) }}</span></div>
          <div class="d-flex align-center justify-space-between"><span>Tax (VAT 16%)</span><v-text-field v-model.number="form.tax" type="number" prefix="KSh" density="compact" variant="outlined" style="max-width: 120px;" hide-details /></div>
          <div class="d-flex align-center justify-space-between"><span>Discount</span><v-text-field v-model.number="form.discount" type="number" prefix="KSh" density="compact" variant="outlined" style="max-width: 120px;" hide-details /></div>
          <div class="d-flex justify-space-between font-weight-bold text-h6"><span>Total</span><span class="text-primary">{{ formatMoney(formTotal) }}</span></div>
        </v-card-text>
        <v-card-actions><v-spacer /><v-btn variant="text" @click="createDialog = false">Cancel</v-btn><v-btn variant="flat" color="primary" @click="createInvoice" :loading="saving">Create</v-btn></v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup>
definePageMeta({ middleware: 'auth' })
const { currency } = useFormat()
const { success, error: errorToast } = useToast()
function formatMoney(v) { return currency(v || 0) }
function statusColor(s) {
  const map = { draft: 'grey', sent: 'info', partially_paid: 'warning', paid: 'success', overdue: 'error', cancelled: 'grey' }
  return map[s] || 'grey'
}

const headers = [
  { title: 'Invoice #', key: 'invoice_number' },
  { title: 'Customer', key: 'customer_name' },
  { title: 'Date', key: 'created_at' },
  { title: 'Due Date', key: 'due_date' },
  { title: 'Total', key: 'total', align: 'end' },
  { title: 'Paid', key: 'amount_paid', align: 'end' },
  { title: 'Balance', key: 'balance', align: 'end' },
  { title: 'Status', key: 'status' },
  { title: '', key: 'actions' },
]

const loading = ref(false)
const saving = ref(false)
const invoices = ref([])
const customers = ref([])
const searchText = ref('')
const statusFilter = ref(null)
const detailDialog = ref(false)
const paymentDialog = ref(false)
const createDialog = ref(false)
const selected = ref(null)
const payAmount = ref(0)
const payMethod = ref('cash')
const payRef = ref('')
const form = ref({ customer_name: '', customer_phone: '', customer: null, due_date: '', lines: [{ description: '', quantity: 1, unit_price: 0, line_total: 0 }], tax: 0, discount: 0 })

const customerOptions = computed(() => customers.value.map(c => ({ name: c.name || c.phone, id: c.id })))

const filtered = computed(() => {
  let list = invoices.value
  if (searchText.value) {
    const s = searchText.value.toLowerCase()
    list = list.filter(i => i.invoice_number?.toLowerCase().includes(s) || i.customer_name?.toLowerCase().includes(s))
  }
  if (statusFilter.value) list = list.filter(i => i.status === statusFilter.value)
  return list
})

const kpis = computed(() => {
  const totalInvoiced = invoices.value.reduce((s, i) => s + Number(i.total), 0)
  const collected = invoices.value.reduce((s, i) => s + Number(i.amount_paid), 0)
  const outstanding = invoices.value.reduce((s, i) => s + Number(i.balance), 0)
  const overdueCount = invoices.value.filter(i => i.status === 'overdue').length
  return { totalInvoiced, collected, outstanding, overdueCount }
})

const aging = computed(() => {
  const list = invoices.value.filter(i => Number(i.balance) > 0)
  const now = new Date()
  const notDue = list.filter(i => new Date(i.due_date) >= now).reduce((s, i) => s + Number(i.balance), 0)
  const d30 = list.filter(i => { const diff = (now - new Date(i.due_date)) / 86400000; return diff >= 0 && diff <= 30 }).reduce((s, i) => s + Number(i.balance), 0)
  const d60 = list.filter(i => { const diff = (now - new Date(i.due_date)) / 86400000; return diff > 30 && diff <= 60 }).reduce((s, i) => s + Number(i.balance), 0)
  const d60Plus = list.filter(i => { const diff = (now - new Date(i.due_date)) / 86400000; return diff > 60 }).reduce((s, i) => s + Number(i.balance), 0)
  return { notDue, d30, d60, d60Plus }
})

const formSubtotal = computed(() => form.value.lines.reduce((s, l) => s + Number(l.line_total || 0), 0))
const formTotal = computed(() => Math.max(0, formSubtotal.value + Number(form.value.tax || 0) - Number(form.value.discount || 0)))

function calcLine(line) {
  line.line_total = (Number(line.quantity) || 0) * (Number(line.unit_price) || 0)
}

function addLine() {
  form.value.lines.push({ description: '', quantity: 1, unit_price: 0, line_total: 0 })
}

function viewInvoice(inv) {
  selected.value = inv
  detailDialog.value = true
}

function openPayment(inv) {
  selected.value = inv
  payAmount.value = Number(inv.balance)
  payMethod.value = 'cash'
  payRef.value = ''
  paymentDialog.value = true
}

function openCreate() {
  form.value = { customer_name: '', customer_phone: '', customer: null, due_date: '', lines: [{ description: '', quantity: 1, unit_price: 0, line_total: 0 }], tax: 0, discount: 0 }
  createDialog.value = true
}

async function loadData() {
  loading.value = true
  try {
    const [invData, custData] = await Promise.all([
      useApi()('/accounting/invoices/?page_size=500'),
      useApi()('/customers/?page_size=500').catch(() => ({ results: [] })),
    ])
    invoices.value = invData.results || invData
    customers.value = custData.results || custData
  } catch { /* ignore */ } finally {
    loading.value = false
  }
}

async function recordPayment() {
  saving.value = true
  try {
    await useApi()(`/accounting/invoices/${selected.value.id}/record_payment/`, {
      method: 'POST', body: { amount: payAmount.value, payment_method: payMethod.value, reference: payRef.value }
    })
    success('Payment recorded successfully')
    paymentDialog.value = false
    await loadData()
  } catch {
    errorToast('Failed to record payment')
  } finally {
    saving.value = false
  }
}

async function createInvoice() {
  saving.value = true
  try {
    const payload = { ...form.value, subtotal: formSubtotal.value, total: formTotal.value, amount_paid: 0, balance: formTotal.value }
    await useApi()('/accounting/invoices/', { method: 'POST', body: payload })
    success('Invoice created successfully')
    createDialog.value = false
    await loadData()
  } catch {
    errorToast('Failed to create invoice')
  } finally {
    saving.value = false
  }
}

onMounted(loadData)
</script>
