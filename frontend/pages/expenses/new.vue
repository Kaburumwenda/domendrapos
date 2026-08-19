<template>
  <div class="az-page">
    <!-- ===== Header ===== -->
    <div class="az-exp-header">
      <div class="az-exp-header__info">
        <div class="az-exp-header__icon"><v-icon size="28" color="primary">mdi-cash-minus</v-icon></div>
        <div>
          <h1 class="text-h5 font-weight-bold mb-1">{{ editing ? 'Edit Expense' : 'New Expense' }}</h1>
          <p class="text-body-2 text-medium-emphasis ma-0">{{ editing ? 'Update expense details' : 'Record a new business expense' }}</p>
        </div>
      </div>
      <v-btn variant="outlined" density="comfortable" prepend-icon="mdi-arrow-left" @click="goBack">Back</v-btn>
    </div>

    <!-- ===== Form + Summary Layout ===== -->
    <v-form ref="formRef" @submit.prevent="saveExpense" class="az-exp-layout">
      <div class="az-exp-layout__form">
        <!-- Section 1: Expense Details -->
        <v-card variant="outlined" class="az-exp-card az-exp-card--blue mb-4">
          <div class="az-exp-card__header">
            <div class="az-exp-card__icon az-exp-card__icon--blue"><v-icon size="18">mdi-information-outline</v-icon></div>
            <span>Expense Details</span>
          </div>
          <v-row>
          <v-col cols="12" md="6">
            <v-text-field
              v-model="form.description"
              label="Title *"
              placeholder="e.g. Office rent — May"
              variant="outlined"
              density="comfortable"
              :rules="[v => !!v || 'Title is required']"
              hide-details="auto"
            />
          </v-col>
          <v-col cols="12" md="3">
            <v-text-field
              v-model="form.reference"
              label="Reference"
              placeholder="Auto-generated"
              variant="outlined"
              density="comfortable"
              hint="Leave blank to auto-generate"
              persistent-hint
              hide-details="auto"
            />
          </v-col>
          <v-col cols="12" md="3">
            <v-combobox
              v-model="form.category"
              :items="categoryList"
              label="Category"
              variant="outlined"
              density="comfortable"
              prepend-inner-icon="mdi-shape"
              hide-details="auto"
            />
          </v-col>
          <v-col cols="12">
            <v-textarea
              v-model="form.notes"
              label="Description"
              variant="outlined"
              density="comfortable"
              rows="2"
              auto-grow
              hide-details="auto"
            />
          </v-col>
        </v-row>
      </v-card>

      <!-- Section 2: Amount & Payment -->
      <v-card variant="outlined" class="az-exp-card az-exp-card--green mb-4">
        <div class="az-exp-card__header">
          <div class="az-exp-card__icon az-exp-card__icon--green"><v-icon size="18">mdi-cash</v-icon></div>
          <span>Amount & Payment</span>
        </div>
        <v-row>
          <v-col cols="12" md="3">
            <v-text-field
              v-model.number="form.amount"
              label="Amount *"
              type="number"
              prefix="KSh"
              variant="outlined"
              density="comfortable"
              :rules="[v => v > 0 || 'Amount must be greater than 0']"
              hide-details="auto"
            />
          </v-col>
          <v-col cols="12" md="3">
            <v-text-field
              v-model.number="form.tax"
              label="Tax / VAT"
              type="number"
              prefix="KSh"
              variant="outlined"
              density="comfortable"
              hide-details="auto"
            />
          </v-col>
          <v-col cols="12" md="3">
            <v-select
              v-model="form.payment_method"
              :items="methodList"
              label="Payment Method"
              variant="outlined"
              density="comfortable"
              prepend-inner-icon="mdi-credit-card-outline"
              hide-details="auto"
            />
          </v-col>
          <v-col cols="12" md="3">
            <v-text-field
              v-model="form.payment_reference"
              label="Payment Reference"
              placeholder="M-Pesa code, cheque #"
              variant="outlined"
              density="comfortable"
              hide-details="auto"
            />
          </v-col>
          <v-col cols="12" md="6">
            <v-combobox
              v-model="form.vendor"
              :items="vendorList"
              label="Vendor / Payee"
              variant="outlined"
              density="comfortable"
              prepend-inner-icon="mdi-truck-delivery"
              hint="Pick a supplier or type any vendor name"
              persistent-hint
              hide-details="auto"
            />
          </v-col>
          <v-col cols="12" md="3">
            <v-text-field
              v-model="form.date"
              label="Expense Date *"
              type="date"
              variant="outlined"
              density="comfortable"
              :rules="[v => !!v || 'Date is required']"
              hide-details="auto"
            />
          </v-col>
          <v-col cols="12" md="3">
            <v-text-field
              v-model="form.due_date"
              label="Due Date"
              type="date"
              variant="outlined"
              density="comfortable"
              hint="Optional"
              persistent-hint
              hide-details="auto"
            />
          </v-col>
          <v-col cols="12" md="3">
            <v-text-field
              v-model.number="form.cost_price"
              label="Cost Price"
              type="number"
              prefix="KSh"
              variant="outlined"
              density="comfortable"
              hide-details="auto"
            />
          </v-col>
          <v-col cols="12" md="3">
            <v-text-field
              v-model.number="form.retail_price"
              label="Retail Price"
              type="number"
              prefix="KSh"
              variant="outlined"
              density="comfortable"
              hide-details="auto"
            />
          </v-col>
        </v-row>
      </v-card>

      <!-- Section 3: Status & Options -->
      <v-card variant="outlined" class="az-exp-card az-exp-card--amber mb-4">
        <div class="az-exp-card__header">
          <div class="az-exp-card__icon az-exp-card__icon--amber"><v-icon size="18">mdi-cog-outline</v-icon></div>
          <span>Status & Options</span>
        </div>
        <v-row>
          <v-col cols="12" md="4">
            <v-select
              v-model="form.status"
              :items="statusOptions"
              label="Status"
              variant="outlined"
              density="comfortable"
              hide-details="auto"
            />
          </v-col>
          <v-col cols="12" md="4" class="d-flex align-center">
            <v-checkbox
              v-model="form.recurring"
              label="Recurring expense"
              density="comfortable"
              hide-details="auto"
            />
          </v-col>
          <v-col cols="12">
            <v-textarea
              v-model="form.notes"
              label="Notes"
              variant="outlined"
              density="comfortable"
              rows="2"
              auto-grow
              hide-details="auto"
            />
          </v-col>
        </v-row>
      </v-card>
      </div>

      <!-- ===== Sticky Summary Sidebar ===== -->
      <div class="az-exp-layout__summary">
        <v-card variant="outlined" class="az-exp-summary">
          <div class="az-exp-summary__header">
            <span class="text-caption text-uppercase font-weight-bold">Summary</span>
            <span class="az-exp-summary__total">{{ formatMoney(summaryTotal) }}</span>
          </div>
          <div class="az-exp-summary__body">
            <div class="az-exp-summary__stat">
              <span class="text-caption text-medium-emphasis">Subtotal</span>
              <span class="text-body-1 font-weight-bold">{{ formatMoney(form.amount) }}</span>
            </div>
            <div class="az-exp-summary__stat">
              <span class="text-caption text-medium-emphasis">Tax</span>
              <span class="text-body-1 font-weight-bold">{{ formatMoney(form.tax) }}</span>
            </div>
            <div class="az-exp-summary__stat">
              <span class="text-caption text-medium-emphasis">Method</span>
              <span class="text-body-1 font-weight-bold text-capitalize">{{ form.payment_method }}</span>
            </div>
            <div class="az-exp-summary__stat az-exp-summary__stat--total">
              <span class="text-caption" style="opacity: 0.85;">Total</span>
              <span class="text-h6 font-weight-bold">{{ formatMoney(summaryTotal) }}</span>
            </div>
          </div>
          <div class="az-exp-summary__actions">
            <v-btn variant="text" block @click="goBack">Cancel</v-btn>
            <v-btn
              type="submit"
              block
              variant="flat"
              color="primary"
              :loading="saving"
              :disabled="!form.amount || form.amount <= 0 || !form.description"
              prepend-icon="mdi-check"
              class="mt-2"
            >{{ editing ? 'Update Expense' : 'Create Expense' }}</v-btn>
          </div>
        </v-card>
      </div>
    </v-form>
  </div>
</template>

<script setup>
definePageMeta({ middleware: 'auth' })
const { currency } = useFormat()
const { success, error: errorToast } = useToast()
const route = useRoute()
const router = useRouter()

const saving = ref(false)
const formRef = ref()

const defaultCategories = ['Rent', 'Utilities', 'Salaries', 'Supplies', 'Marketing', 'Transport', 'Maintenance', 'Miscellaneous', 'Insurance', 'Legal', 'Equipment', 'Taxes', 'Licenses']
const methodList = ['cash', 'mpesa', 'card', 'bank_transfer', 'cheque']
const statusOptions = ['Unpaid', 'Pending Approval', 'Approved', 'Paid', 'Cancelled']
const vendorList = []

// Custom categories (persisted in localStorage, managed on /expenses/categories)
const customCategories = ref([])
const categoryList = computed(() => {
  const customs = customCategories.value.map(c => typeof c === 'string' ? c : c.name).filter(Boolean)
  return [...new Set([...defaultCategories, ...customs])].sort()
})

function loadCustomCategories() {
  try {
    const stored = localStorage.getItem('expense_custom_categories')
    if (stored) customCategories.value = JSON.parse(stored)
  } catch {}
}

const form = ref({
  description: '',
  reference: '',
  category: 'Miscellaneous',
  notes: '',
  amount: 0,
  tax: 0,
  payment_method: 'cash',
  payment_reference: '',
  vendor: '',
  date: new Date().toISOString().slice(0, 10),
  due_date: '',
  cost_price: 0,
  retail_price: 0,
  status: 'Unpaid',
  recurring: false,
})

const summaryTotal = computed(() => Number(form.value.amount || 0) + Number(form.value.tax || 0))

const editing = computed(() => !!route.query.id)

onMounted(async () => {
  loadCustomCategories()
  if (route.query.id) {
    try {
      const data = await useApi()(`/accounting/expenses/${route.query.id}/`)
      form.value = {
        description: data.description || '',
        reference: data.reference || '',
        category: data.category || 'Miscellaneous',
        notes: data.notes || data.description || '',
        amount: Number(data.amount) || 0,
        tax: Number(data.tax) || 0,
        payment_method: data.payment_method || 'cash',
        payment_reference: data.payment_reference || '',
        vendor: data.vendor || '',
        date: (data.date || new Date().toISOString()).slice(0, 10),
        due_date: data.due_date || '',
        cost_price: Number(data.cost_price) || 0,
        retail_price: Number(data.retail_price) || 0,
        status: data.status || 'Unpaid',
        recurring: data.recurring || false,
      }
    } catch { /* ignore */ }
  }
})

function goBack() {
  router.push('/expenses')
}

function formatMoney(v) {
  const n = Number(v) || 0
  return 'KSh' + n.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

async function saveExpense() {
  saving.value = true
  try {
    // Build the payload - map form fields to API fields
    const payload = {
      description: form.value.description,
      reference: form.value.reference,
      category: form.value.category,
      amount: form.value.amount,
      cost_price: form.value.cost_price,
      retail_price: form.value.retail_price,
      payment_method: form.value.payment_method,
      payment_reference: form.value.payment_reference,
      vendor: form.value.vendor,
      date: form.value.date,
      due_date: form.value.due_date || null,
      notes: form.value.notes,
      status: form.value.status,
      recurring: form.value.recurring,
      tax: form.value.tax,
    }

    if (editing.value) {
      await useApi()(`/accounting/expenses/${route.query.id}/`, { method: 'PATCH', body: payload })
      success('Expense updated successfully')
    } else {
      await useApi()('/accounting/expenses/', { method: 'POST', body: payload })
      success('Expense recorded successfully')
    }
    router.push('/expenses')
  } catch {
    errorToast(editing.value ? 'Failed to update expense' : 'Failed to record expense')
  } finally {
    saving.value = false
  }
}
</script>

<style scoped>
.az-page {
  padding: 0;
  background: #FAFBFC;
  border-radius: 12px;
  min-height: calc(100vh - 64px);
}

/* ===== Header ===== */
.az-exp-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 12px;
  margin-bottom: 24px;
}
.az-exp-header__info {
  display: flex;
  align-items: center;
  gap: 14px;
}
.az-exp-header__icon {
  width: 48px;
  height: 48px;
  border-radius: 14px;
  background: rgba(var(--v-theme-primary), 0.1);
  border: 1px solid rgba(var(--v-theme-primary), 0.15);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

/* ===== Layout: form left + summary right ===== */
.az-exp-layout {
  display: grid;
  grid-template-columns: 1fr 300px;
  gap: 20px;
  align-items: start;
  max-width: 1200px;
}
.az-exp-layout__form {
  min-width: 0;
}
.az-exp-layout__summary {
  position: sticky;
  top: 80px;
}

/* ===== Cards ===== */
.az-exp-card {
  background: #ffffff !important;
  border-radius: 14px !important;
  padding: 20px 18px 16px;
  border-color: rgba(var(--v-theme-on-surface), 0.08) !important;
  transition: box-shadow 0.2s;
}
.az-exp-card:hover {
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
}
.az-exp-card__header {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 0.9375rem;
  font-weight: 700;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid rgba(var(--v-theme-on-surface), 0.06);
}
.az-exp-card__icon {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.az-exp-card__icon--blue   { background: rgba(59, 130, 246, 0.12); color: #3B82F6; }
.az-exp-card__icon--green  { background: rgba(34, 197, 94, 0.12); color: #22C55E; }
.az-exp-card__icon--amber  { background: rgba(245, 158, 11, 0.12); color: #F59E0B; }

/* ===== Summary ===== */
.az-exp-summary {
  background: #ffffff !important;
  border-radius: 14px !important;
  overflow: hidden;
  border-color: rgba(var(--v-theme-on-surface), 0.08) !important;
}
.az-exp-summary__header {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 18px 18px 14px;
  background: linear-gradient(135deg, rgba(var(--v-theme-primary), 0.06), rgba(99, 102, 241, 0.04));
  border-bottom: 1px solid rgba(var(--v-theme-on-surface), 0.06);
}
.az-exp-summary__total {
  font-size: 1.75rem;
  font-weight: 800;
  letter-spacing: -0.02em;
  line-height: 1.1;
}
.az-exp-summary__body {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 14px 18px;
}
.az-exp-summary__stat {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  border-radius: 8px;
  background: rgba(99, 102, 241, 0.04);
}
.az-exp-summary__stat span:first-child {
  font-size: 0.75rem;
}
.az-exp-summary__stat--total {
  background: rgba(var(--v-theme-primary), 0.08);
  margin-top: 4px;
  padding: 12px 14px;
}
.az-exp-summary__stat--total span:first-child {
  font-size: 0.8125rem;
  font-weight: 600;
}
.az-exp-summary__actions {
  padding: 12px 18px 18px;
  display: flex;
  flex-direction: column;
}

/* Responsive */
@media (max-width: 960px) {
  .az-exp-layout {
    grid-template-columns: 1fr;
  }
  .az-exp-layout__summary {
    position: static;
  }
}
@media (max-width: 600px) {
  .az-page { padding: 12px; }
  .az-exp-card { padding: 16px 14px 14px; }
  .az-exp-card__header { font-size: 0.875rem; }
  .az-exp-summary__total { font-size: 1.5rem; }
}
</style>
