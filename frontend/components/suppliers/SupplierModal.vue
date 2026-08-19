<template>
  <v-dialog :model-value="show" @update:model-value="$emit('close')" max-width="700" scrollable>
    <v-card rounded="xl">
      <!-- Header -->
      <v-card-title class="d-flex align-center justify-space-between pa-6 pb-4">
        <div class="d-flex align-center ga-3">
          <v-avatar color="orange-darken-2" size="40" rounded="lg">
            <v-icon size="20">mdi-truck-fast</v-icon>
          </v-avatar>
          <div>
            <div class="text-h6 font-weight-bold">{{ isEdit ? 'Edit Supplier' : 'Add New Supplier' }}</div>
            <div class="text-body-2 text-medium-emphasis">
              {{ isEdit ? 'Update supplier details and terms' : 'Create a new vendor profile' }}
            </div>
          </div>
        </div>
        <v-btn icon variant="text" size="small" @click="$emit('close')">
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-card-title>

      <v-divider />

      <!-- Tabs -->
      <v-tabs v-model="activeTab" color="primary">
        <v-tab v-for="tab in tabs" :key="tab.id" :value="tab.id">{{ tab.label }}</v-tab>
      </v-tabs>
      <v-divider />

      <v-card-text class="pa-6" style="max-height: 60vh; overflow-y: auto;">
        <v-window v-model="activeTab">
          <!-- Tab: Profile -->
          <v-window-item value="profile">
            <v-row>
              <v-col cols="12" sm="6">
                <v-text-field
                  v-model="form.supplier_code"
                  label="Supplier Code"
                  variant="outlined"
                  density="comfortable"
                  append-inner-icon="mdi-refresh"
                  @click:append-inner="generateSupplierCode"
                  hint="Click the icon to auto-generate"
                  persistent-hint
                  :error-messages="errors.supplier_code"
                  placeholder="SUP-001"
                />
              </v-col>
              <v-col cols="12" sm="6">
                <v-text-field
                  v-model="form.name"
                  label="Supplier Name"
                  variant="outlined"
                  density="comfortable"
                  required
                  :error-messages="errors.name"
                />
              </v-col>
              <v-col cols="12" sm="6">
                <v-text-field
                  v-model="form.contact_person"
                  label="Contact Person"
                  variant="outlined"
                  density="comfortable"
                />
              </v-col>
              <v-col cols="12" sm="6">
                <v-text-field
                  v-model="form.phone"
                  label="Phone"
                  variant="outlined"
                  density="comfortable"
                  :error-messages="errors.phone"
                />
              </v-col>
              <v-col cols="12" sm="6">
                <v-text-field
                  v-model="form.email"
                  label="Email"
                  variant="outlined"
                  density="comfortable"
                  type="email"
                  :error-messages="errors.email"
                />
              </v-col>
              <v-col cols="12" sm="6">
                <v-text-field
                  v-model="form.website"
                  label="Website"
                  variant="outlined"
                  density="comfortable"
                  placeholder="https://"
                />
              </v-col>
            </v-row>
          </v-window-item>

          <!-- Tab: Address -->
          <v-window-item value="address">
            <v-row>
              <v-col cols="12">
                <v-text-field v-model="form.address_line1" label="Address Line 1" variant="outlined" density="comfortable" />
              </v-col>
              <v-col cols="12">
                <v-text-field v-model="form.address_line2" label="Address Line 2" variant="outlined" density="comfortable" />
              </v-col>
              <v-col cols="12" sm="6">
                <v-text-field v-model="form.city" label="City" variant="outlined" density="comfortable" />
              </v-col>
              <v-col cols="12" sm="6">
                <v-text-field v-model="form.state_province" label="State / Province" variant="outlined" density="comfortable" />
              </v-col>
              <v-col cols="12" sm="6">
                <v-text-field v-model="form.postal_code" label="Postal Code" variant="outlined" density="comfortable" />
              </v-col>
              <v-col cols="12" sm="6">
                <v-text-field v-model="form.country" label="Country" variant="outlined" density="comfortable" />
              </v-col>
            </v-row>
          </v-window-item>

          <!-- Tab: Terms -->
          <v-window-item value="terms">
            <v-row>
              <v-col cols="12" sm="6">
                <v-text-field v-model="form.tax_id" label="Tax ID" variant="outlined" density="comfortable" />
              </v-col>
              <v-col cols="12" sm="6">
                <v-text-field
                  v-model="form.payment_terms"
                  label="Payment Terms"
                  variant="outlined"
                  density="comfortable"
                  placeholder="e.g., Net 30, COD"
                />
              </v-col>
              <v-col cols="12" sm="6">
                <v-text-field
                  v-model="form.currency_code"
                  label="Currency Code"
                  variant="outlined"
                  density="comfortable"
                  maxlength="3"
                  placeholder="USD"
                />
              </v-col>
              <v-col cols="12" sm="6">
                <v-text-field
                  v-model.number="form.lead_time_days"
                  label="Lead Time (days)"
                  variant="outlined"
                  density="comfortable"
                  type="number"
                  min="0"
                  :error-messages="errors.lead_time_days"
                />
              </v-col>
              <v-col cols="12" sm="6">
                <v-text-field
                  v-model="form.minimum_order_value"
                  :label="`Minimum Order Value (${symbol})`"
                  variant="outlined"
                  density="comfortable"
                  type="number"
                  step="0.01"
                  min="0"
                  :error-messages="errors.minimum_order_value"
                />
              </v-col>
              <v-col cols="12" sm="6">
                <v-text-field
                  v-model="form.rating"
                  label="Rating (0-5)"
                  variant="outlined"
                  density="comfortable"
                  type="number"
                  step="0.1"
                  min="0"
                  max="5"
                  :error-messages="errors.rating"
                />
              </v-col>
              <v-col cols="12">
                <v-textarea
                  v-model="form.notes"
                  label="Notes"
                  variant="outlined"
                  density="comfortable"
                  rows="2"
                  placeholder="Internal notes about this supplier..."
                />
              </v-col>
              <v-col cols="12">
                <v-checkbox v-model="form.is_active" label="Active" density="comfortable" hide-details />
              </v-col>
            </v-row>
          </v-window-item>
        </v-window>
      </v-card-text>

      <v-divider />
      <v-card-actions class="justify-end pa-4">
        <v-btn variant="text" @click="$emit('close')">Cancel</v-btn>
        <v-btn color="orange-darken-2" :loading="saving" @click="save">
          {{ isEdit ? 'Update' : 'Create' }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
const props = defineProps({
  show: { type: Boolean, default: false },
  supplier: { type: Object, default: null },
})

const emit = defineEmits(['close', 'saved'])
const toast = useToast()
const { currencySymbol } = useAuthStore()
const symbol = computed(() => currencySymbol || 'KSh')

const saving = ref(false)
const errors = ref({})

const isEdit = computed(() => !!props.supplier)

const tabs = [
  { id: 'profile', label: 'Profile' },
  { id: 'address', label: 'Address' },
  { id: 'terms', label: 'Terms' },
]
const activeTab = ref('profile')

const defaultForm = () => ({
  supplier_code: '',
  name: '',
  contact_person: '',
  email: '',
  phone: '',
  website: '',
  address_line1: '',
  address_line2: '',
  city: '',
  state_province: '',
  postal_code: '',
  country: 'United States',
  tax_id: '',
  payment_terms: '',
  currency_code: 'USD',
  lead_time_days: 7,
  minimum_order_value: 0,
  is_active: true,
  rating: 5.0,
  notes: '',
})

const form = reactive(defaultForm())

watch(
  () => props.show,
  val => {
    if (val) {
      if (props.supplier) {
        Object.assign(form, { ...defaultForm(), ...props.supplier })
      } else {
        Object.assign(form, defaultForm())
        generateSupplierCode()
      }
      errors.value = {}
      activeTab.value = 'profile'
    }
  },
)

function generateSupplierCode() {
  const ts = Date.now().toString().slice(-6)
  form.supplier_code = `SUP-${ts}`
}

function firstError(data) {
  if (!data || typeof data !== 'object') return null
  for (const key of Object.keys(data)) {
    const val = data[key]
    if (Array.isArray(val) && val.length) return val[0]
    if (typeof val === 'string') return val
  }
  return null
}

function buildPayload() {
  const p = { ...form }
  p.minimum_order_value = p.minimum_order_value === '' ? 0 : parseFloat(p.minimum_order_value)
  p.rating = p.rating === '' ? 5.0 : parseFloat(p.rating)
  p.lead_time_days = p.lead_time_days === '' ? 7 : parseInt(p.lead_time_days)
  delete p.created_at
  delete p.updated_at
  delete p.id
  return p
}

async function save() {
  errors.value = {}
  if (!form.name.trim()) {
    errors.value = { name: 'Supplier name is required' }
    return
  }
  if (!form.supplier_code.trim()) {
    errors.value = { supplier_code: 'Supplier code is required' }
    return
  }
  saving.value = true
  try {
    const payload = buildPayload()
    if (isEdit.value) {
      await useApi()(`/suppliers/${props.supplier.id}/`, { method: 'PATCH', body: payload })
      toast.success('Supplier updated')
    } else {
      await useApi()('/suppliers/', { method: 'POST', body: payload })
      toast.success('Supplier created')
    }
    emit('saved')
  } catch (e) {
    const msg = firstError(e?.data)
    if (msg) {
      if (e?.data) {
        for (const key of Object.keys(e.data)) {
          if (key in form) errors.value[key] = Array.isArray(e.data[key]) ? e.data[key][0] : e.data[key]
        }
      }
      if (Object.keys(errors.value).length === 0) toast.error(msg)
    } else {
      toast.error('Failed to save supplier')
    }
  } finally {
    saving.value = false
  }
}
</script>
