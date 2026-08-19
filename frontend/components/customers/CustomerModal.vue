<template>
  <v-dialog :model-value="show" @update:model-value="$emit('close')" max-width="700" scrollable>
    <v-card rounded="xl">
      <!-- Header -->
      <v-card-title class="d-flex align-center justify-space-between pa-6 pb-4">
        <div class="d-flex align-center ga-3">
          <v-avatar color="deep-purple" size="40" rounded="lg">
            <v-icon size="20">mdi-account-details</v-icon>
          </v-avatar>
          <div>
            <div class="text-h6 font-weight-bold">{{ isEdit ? 'Edit Customer' : 'Add New Customer' }}</div>
            <div class="text-body-2 text-medium-emphasis">
              {{ isEdit ? 'Update customer details and preferences' : 'Create a new customer profile' }}
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
                <v-select
                  v-model="form.customer_type"
                  :items="customerTypeItems"
                  item-title="label"
                  item-value="value"
                  label="Customer Type"
                  variant="outlined"
                  density="comfortable"
                />
              </v-col>
              <v-col cols="12" sm="6">
                <v-text-field
                  v-model="form.customer_code"
                  label="Customer Code"
                  variant="outlined"
                  density="comfortable"
                  append-inner-icon="mdi-refresh"
                  @click:append-inner="generateCustomerCode"
                  hint="Click the icon to auto-generate"
                  persistent-hint
                  :error-messages="errors.customer_code"
                  placeholder="CUST-001"
                />
              </v-col>

              <template v-if="form.customer_type === 'individual'">
                <v-col cols="12" sm="6">
                  <v-text-field
                    v-model="form.first_name"
                    label="First Name"
                    variant="outlined"
                    density="comfortable"
                    :error-messages="errors.first_name"
                  />
                </v-col>
                <v-col cols="12" sm="6">
                  <v-text-field
                    v-model="form.last_name"
                    label="Last Name"
                    variant="outlined"
                    density="comfortable"
                    :error-messages="errors.last_name"
                  />
                </v-col>
              </template>
              <v-col v-else cols="12">
                <v-text-field
                  v-model="form.company_name"
                  label="Company Name"
                  variant="outlined"
                  density="comfortable"
                  :error-messages="errors.company_name"
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
                  v-model="form.phone"
                  label="Phone"
                  variant="outlined"
                  density="comfortable"
                  :error-messages="errors.phone"
                />
              </v-col>
              <v-col cols="12" sm="6">
                <v-text-field
                  v-model="form.secondary_phone"
                  label="Secondary Phone"
                  variant="outlined"
                  density="comfortable"
                />
              </v-col>
              <v-col cols="12" sm="6">
                <v-select
                  v-model="form.gender"
                  :items="genderItems"
                  item-title="label"
                  item-value="value"
                  label="Gender"
                  variant="outlined"
                  density="comfortable"
                  clearable
                />
              </v-col>
              <v-col cols="12" sm="6">
                <v-text-field
                  v-model="form.date_of_birth"
                  type="date"
                  label="Date of Birth"
                  variant="outlined"
                  density="comfortable"
                />
              </v-col>
            </v-row>
          </v-window-item>

          <!-- Tab: Address -->
          <v-window-item value="address">
            <v-row>
              <v-col cols="12">
                <v-text-field
                  v-model="form.address_line1"
                  label="Address Line 1"
                  variant="outlined"
                  density="comfortable"
                />
              </v-col>
              <v-col cols="12">
                <v-text-field
                  v-model="form.address_line2"
                  label="Address Line 2"
                  variant="outlined"
                  density="comfortable"
                />
              </v-col>
              <v-col cols="12" sm="6">
                <v-text-field v-model="form.city" label="City" variant="outlined" density="comfortable" />
              </v-col>
              <v-col cols="12" sm="6">
                <v-text-field
                  v-model="form.state_province"
                  label="State / Province"
                  variant="outlined"
                  density="comfortable"
                />
              </v-col>
              <v-col cols="12" sm="6">
                <v-text-field v-model="form.postal_code" label="Postal Code" variant="outlined" density="comfortable" />
              </v-col>
              <v-col cols="12" sm="6">
                <v-text-field v-model="form.country" label="Country" variant="outlined" density="comfortable" />
              </v-col>
              <v-col cols="12">
                <v-textarea
                  v-model="form.notes"
                  label="Notes"
                  variant="outlined"
                  density="comfortable"
                  rows="2"
                  placeholder="Internal notes about this customer..."
                />
              </v-col>
            </v-row>
          </v-window-item>

          <!-- Tab: Loyalty and Credit -->
          <v-window-item value="loyalty">
            <v-row>
              <v-col cols="12" sm="6">
                <v-select
                  v-model="form.loyalty_tier"
                  :items="tierItems"
                  item-title="label"
                  item-value="value"
                  label="Loyalty Tier"
                  variant="outlined"
                  density="comfortable"
                />
              </v-col>
              <v-col cols="12" sm="6">
                <v-text-field
                  v-model="form.loyalty_member_since"
                  type="date"
                  label="Member Since"
                  variant="outlined"
                  density="comfortable"
                />
              </v-col>
              <v-col cols="12" sm="6">
                <v-text-field
                  v-model="form.credit_limit"
                  :label="`Credit Limit (${symbol})`"
                  variant="outlined"
                  density="comfortable"
                  type="number"
                  step="0.01"
                  min="0"
                  :error-messages="errors.credit_limit"
                />
              </v-col>
              <v-col cols="12" sm="6">
                <v-select
                  v-model="form.preferred_branch"
                  :items="branches"
                  item-title="name"
                  item-value="id"
                  label="Preferred Branch"
                  variant="outlined"
                  density="comfortable"
                  clearable
                />
              </v-col>
              <v-col cols="12" sm="6">
                <v-text-field
                  v-model="form.tax_id"
                  label="Tax ID"
                  variant="outlined"
                  density="comfortable"
                />
              </v-col>
              <v-col cols="12" sm="6" class="d-flex align-center">
                <v-checkbox
                  v-model="form.tax_exempt"
                  label="Tax Exempt"
                  density="comfortable"
                  hide-details
                />
              </v-col>
              <v-col cols="12" sm="6" class="d-flex align-center">
                <v-checkbox
                  v-model="form.is_active"
                  label="Active"
                  density="comfortable"
                  hide-details
                />
              </v-col>
            </v-row>
          </v-window-item>
        </v-window>
      </v-card-text>

      <v-divider />
      <v-card-actions class="justify-end pa-4">
        <v-btn variant="text" @click="$emit('close')">Cancel</v-btn>
        <v-btn color="deep-purple" :loading="saving" @click="save">
          {{ isEdit ? 'Update' : 'Create' }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
const props = defineProps({
  show: { type: Boolean, default: false },
  customer: { type: Object, default: null },
  branches: { type: Array, default: () => [] },
})

const emit = defineEmits(['close', 'saved'])
const toast = useToast()
const { currencySymbol } = useAuthStore()
const symbol = computed(() => currencySymbol || 'KSh')

const saving = ref(false)
const errors = ref<Record<string, string>>({})

const isEdit = computed(() => !!props.customer)

const tabs = [
  { id: 'profile', label: 'Profile' },
  { id: 'address', label: 'Address' },
  { id: 'loyalty', label: 'Loyalty and Credit' },
]
const activeTab = ref('profile')

const customerTypeItems = [
  { label: 'Individual', value: 'individual' },
  { label: 'Business', value: 'business' },
]
const genderItems = [
  { label: 'Male', value: 'male' },
  { label: 'Female', value: 'female' },
  { label: 'Other', value: 'other' },
  { label: 'Prefer Not to Say', value: 'undisclosed' },
]
const tierItems = [
  { label: 'Bronze', value: 'bronze' },
  { label: 'Silver', value: 'silver' },
  { label: 'Gold', value: 'gold' },
  { label: 'Platinum', value: 'platinum' },
  { label: 'Diamond', value: 'diamond' },
]

const defaultForm = () => ({
  customer_type: 'individual',
  customer_code: '',
  first_name: '',
  last_name: '',
  company_name: '',
  email: '',
  phone: '',
  secondary_phone: '',
  date_of_birth: '',
  gender: '',
  address_line1: '',
  address_line2: '',
  city: '',
  state_province: '',
  postal_code: '',
  country: 'United States',
  loyalty_tier: 'bronze',
  loyalty_member_since: '',
  credit_limit: 0,
  preferred_branch: null,
  tax_exempt: false,
  tax_id: '',
  notes: '',
  is_active: true,
})

const form = reactive(defaultForm())

watch(
  () => props.show,
  val => {
    if (val) {
      if (props.customer) {
        const c = props.customer
        Object.assign(form, {
          ...defaultForm(),
          ...c,
          loyalty_member_since: c.loyalty_member_since || '',
          date_of_birth: c.date_of_birth || '',
        })
      } else {
        Object.assign(form, defaultForm())
        generateCustomerCode()
      }
      errors.value = {}
      activeTab.value = 'profile'
    }
  },
)

function generateCustomerCode() {
  const ts = Date.now().toString().slice(-6)
  form.customer_code = `CUST-${ts}`
}

/** Pick first field-level error message from a serializer error response. */
function firstError(data: any): string | null {
  if (!data || typeof data !== 'object') return null
  for (const key of Object.keys(data)) {
    const val = data[key]
    if (Array.isArray(val) && val.length) return val[0] as string
    if (typeof val === 'string') return val
  }
  return null
}

function buildPayload() {
  const p: Record<string, any> = { ...form }
  // Coerce numerics
  p.credit_limit = p.credit_limit === '' ? 0 : parseFloat(p.credit_limit)
  // Empty-string dates -> null for backend
  ;['date_of_birth', 'loyalty_member_since'].forEach(f => {
    if (p[f] === '') p[f] = null
  })
  // Empty FK → null
  if (!p.preferred_branch) p.preferred_branch = null
  // Don't send read-only fields
  delete p.full_name
  delete p.loyalty_points
  delete p.current_credit_balance
  delete p.created_at
  delete p.updated_at
  delete p.id
  delete p.groups
  return p
}

async function save() {
  errors.value = {}
  if (!form.customer_code.trim()) {
    errors.value = { customer_code: 'Customer code is required' }
    return
  }
  saving.value = true
  try {
    const payload = buildPayload()
    if (isEdit.value) {
      await useApi()(`/customers/${props.customer!.id}/`, { method: 'PATCH', body: payload })
      toast.success('Customer updated')
    } else {
      await useApi()('/customers/', { method: 'POST', body: payload })
      toast.success('Customer created')
    }
    emit('saved')
  } catch (e: any) {
    const msg = firstError(e?.data)
    if (msg) {
      // Try to map to a field
      if (e?.data) {
        for (const key of Object.keys(e.data)) {
          if (key in form) errors.value[key] = Array.isArray(e.data[key]) ? e.data[key][0] : e.data[key]
        }
      }
      if (Object.keys(errors.value).length === 0) toast.error(msg)
    } else {
      toast.error('Failed to save customer')
    }
  } finally {
    saving.value = false
  }
}
</script>
