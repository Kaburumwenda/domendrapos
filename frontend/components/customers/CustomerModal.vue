<template>
  <v-dialog :model-value="show" @update:model-value="$emit('close')" max-width="1000" scrollable>
    <v-card rounded="xl" class="cust-modal-card">

      <!-- ============ Header ============ -->
      <div class="modal-header">
        <div class="d-flex align-center ga-3">
          <v-avatar :color="isEdit ? 'deep-purple' : 'success'" size="44" rounded="lg">
            <v-icon size="22" icon="mdi-account-details" />
          </v-avatar>
          <div>
            <div class="text-h6 font-weight-bold">{{ isEdit ? 'Edit Customer' : 'Add New Customer' }}</div>
            <div class="text-body-2 text-medium-emphasis">{{ isEdit ? 'Update customer details and preferences' : 'Create a new customer profile' }}</div>
          </div>
        </div>
        <v-btn icon variant="text" size="small" @click="$emit('close')">
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </div>

      <v-divider />

      <!-- ============ Body — two-column stepper ============ -->
      <div class="modal-body">
        <!-- Left: stepper nav -->
        <div class="stepper-nav">
          <div
            v-for="(step, i) in stepList"
            :key="step.id"
            class="stepper-item"
            :class="{ active: activeTab === step.id }"
            @click="activeTab = step.id"
          >
            <div class="stepper-num">{{ i + 1 }}</div>
            <div class="stepper-text">
              <div class="stepper-label">{{ step.label }}</div>
              <div class="stepper-desc">{{ step.desc }}</div>
            </div>
          </div>
        </div>

        <!-- Right: form content -->
        <div class="stepper-content">
          <v-window v-model="activeTab" class="fill-height">

            <!-- ====== Step 1: Profile ====== -->
            <v-window-item value="profile">
              <div class="step-title">Customer Profile</div>
              <div class="step-subtitle">Basic information about this customer.</div>

              <v-row density="comfortable" class="mt-2">
                <v-col cols="12" sm="6">
                  <v-select
                    v-model="form.customer_type"
                    :items="customerTypeItems"
                    item-title="label"
                    item-value="value"
                    label="Customer Type"
                    variant="outlined"
                    density="comfortable"
                    prepend-inner-icon="mdi-account-group"
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
              </v-row>

              <template v-if="form.customer_type === 'individual'">
                <v-row density="comfortable">
                  <v-col cols="12" sm="6">
                    <v-text-field
                      v-model="form.first_name"
                      label="First Name"
                      variant="outlined"
                      density="comfortable"
                      :error-messages="errors.first_name"
                      prepend-inner-icon="mdi-account"
                    />
                  </v-col>
                  <v-col cols="12" sm="6">
                    <v-text-field
                      v-model="form.last_name"
                      label="Last Name"
                      variant="outlined"
                      density="comfortable"
                      :error-messages="errors.last_name"
                      prepend-inner-icon="mdi-account-outline"
                    />
                  </v-col>
                </v-row>
              </template>
              <v-text-field
                v-else
                v-model="form.company_name"
                label="Company Name"
                variant="outlined"
                density="comfortable"
                :error-messages="errors.company_name"
                prepend-inner-icon="mdi-domain"
                class="mt-2"
              />

              <v-row density="comfortable">
                <v-col cols="12" sm="6">
                  <v-text-field
                    v-model="form.email"
                    label="Email"
                    variant="outlined"
                    density="comfortable"
                    type="email"
                    :error-messages="errors.email"
                    prepend-inner-icon="mdi-email-outline"
                  />
                </v-col>
                <v-col cols="12" sm="6">
                  <v-text-field
                    v-model="form.phone"
                    label="Phone"
                    variant="outlined"
                    density="comfortable"
                    :error-messages="errors.phone"
                    prepend-inner-icon="mdi-phone-outline"
                  />
                </v-col>
              </v-row>

              <v-row density="comfortable">
                <v-col cols="12" sm="6">
                  <v-text-field
                    v-model="form.secondary_phone"
                    label="Secondary Phone"
                    variant="outlined"
                    density="comfortable"
                    prepend-inner-icon="mdi-phone-plus"
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
                    prepend-inner-icon="mdi-human-edit"
                  />
                </v-col>
              </v-row>

              <v-text-field
                v-model="form.date_of_birth"
                type="date"
                label="Date of Birth"
                variant="outlined"
                density="comfortable"
                prepend-inner-icon="mdi-cake-variant"
                class="mt-2"
              />
            </v-window-item>

            <!-- ====== Step 2: Address ====== -->
            <v-window-item value="address">
              <div class="step-title">Address and Notes</div>
              <div class="step-subtitle">Where this customer is located and any internal notes.</div>

              <v-text-field
                v-model="form.address_line1"
                label="Address Line 1"
                variant="outlined"
                density="comfortable"
                prepend-inner-icon="mdi-map-marker"
                class="mt-2"
              />
              <v-text-field
                v-model="form.address_line2"
                label="Address Line 2"
                variant="outlined"
                density="comfortable"
                prepend-inner-icon="mdi-map-marker-outline"
              />

              <v-row density="comfortable">
                <v-col cols="12" sm="6">
                  <v-text-field v-model="form.city" label="City" variant="outlined" density="comfortable" prepend-inner-icon="mdi-city" />
                </v-col>
                <v-col cols="12" sm="6">
                  <v-text-field v-model="form.state_province" label="State / Province" variant="outlined" density="comfortable" prepend-inner-icon="mdi-map" />
                </v-col>
              </v-row>

              <v-row density="comfortable">
                <v-col cols="12" sm="6">
                  <v-text-field v-model="form.postal_code" label="Postal Code" variant="outlined" density="comfortable" prepend-inner-icon="mdi-mailbox" />
                </v-col>
                <v-col cols="12" sm="6">
                  <v-text-field v-model="form.country" label="Country" variant="outlined" density="comfortable" prepend-inner-icon="mdi-flag-outline" />
                </v-col>
              </v-row>

              <v-textarea
                v-model="form.notes"
                label="Notes"
                variant="outlined"
                density="comfortable"
                rows="2"
                placeholder="Internal notes about this customer..."
                prepend-inner-icon="mdi-note-edit-outline"
                class="mt-2"
              />
            </v-window-item>

            <!-- ====== Step 3: Loyalty and Credit ====== -->
            <v-window-item value="loyalty">
              <div class="step-title">Loyalty and Credit</div>
              <div class="step-subtitle">Manage loyalty tier, credit limit, and tax settings.</div>

              <div class="settings-card">
                <div class="settings-card-label">Loyalty Program</div>
                <v-row density="comfortable" class="mt-1">
                  <v-col cols="12" sm="6">
                    <v-select
                      v-model="form.loyalty_tier"
                      :items="tierItems"
                      item-title="label"
                      item-value="value"
                      label="Loyalty Tier"
                      variant="outlined"
                      density="comfortable"
                      prepend-inner-icon="mdi-medal"
                    />
                  </v-col>
                  <v-col cols="12" sm="6">
                    <v-text-field
                      v-model="form.loyalty_member_since"
                      type="date"
                      label="Member Since"
                      variant="outlined"
                      density="comfortable"
                      prepend-inner-icon="mdi-calendar-star"
                    />
                  </v-col>
                </v-row>
              </div>

              <div class="settings-card">
                <div class="settings-card-label">Credit and Tax</div>
                <v-row density="comfortable" class="mt-1">
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
                      prepend-inner-icon="mdi-credit-card-clock-outline"
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
                      prepend-inner-icon="mdi-store-outline"
                    />
                  </v-col>
                </v-row>
                <v-text-field
                  v-model="form.tax_id"
                  label="Tax ID"
                  variant="outlined"
                  density="comfortable"
                  prepend-inner-icon="mdi-file-document-outline"
                  class="mt-2"
                />
              </div>

              <!-- Status toggles -->
              <div class="status-toggles">
                <div class="status-toggles-label">Customer Status</div>
                <div class="toggle-grid">
                  <div class="toggle-item" :class="{ active: form.tax_exempt }">
                    <v-switch v-model="form.tax_exempt" color="primary" density="compact" hide-details inset />
                    <div class="toggle-text">
                      <div class="toggle-title">Tax Exempt</div>
                      <div class="toggle-desc">Customer is exempt from sales tax</div>
                    </div>
                  </div>
                  <div class="toggle-item" :class="{ active: form.is_active }">
                    <v-switch v-model="form.is_active" color="primary" density="compact" hide-details inset />
                    <div class="toggle-text">
                      <div class="toggle-title">Active</div>
                      <div class="toggle-desc">Customer can make purchases</div>
                    </div>
                  </div>
                </div>
              </div>
            </v-window-item>

          </v-window>
        </div>
      </div>

      <v-divider />

      <!-- ============ Footer ============ -->
      <div class="modal-footer">
        <div class="d-flex align-center ga-2 text-body-2 text-medium-emphasis">
          <v-icon size="16" :icon="activeTab === 'profile' ? 'mdi-account-details' : activeTab === 'address' ? 'mdi-map-marker' : 'mdi-medal'" />
          Step {{ currentStepIndex + 1 }} of {{ stepList.length }} — {{ stepList[currentStepIndex].label }}
        </div>
        <div class="d-flex ga-2">
          <v-btn variant="text" @click="$emit('close')">Cancel</v-btn>
          <v-btn
            v-if="currentStepIndex < stepList.length - 1"
            variant="outlined"
            @click="nextStep"
          >
            Next
            <v-icon end>mdi-chevron-right</v-icon>
          </v-btn>
          <v-btn
            color="deep-purple"
            :loading="saving"
            @click="save"
          >
            <v-icon start size="18">{{ isEdit ? 'mdi-content-save' : 'mdi-check' }}</v-icon>
            {{ isEdit ? 'Update' : 'Create' }}
          </v-btn>
        </div>
      </div>
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

const stepList = [
  { id: 'profile', label: 'Profile', desc: 'Name, contact, type' },
  { id: 'address', label: 'Address', desc: 'Location and notes' },
  { id: 'loyalty', label: 'Loyalty and Credit', desc: 'Tier, credit, tax' },
]
const activeTab = ref('profile')

const currentStepIndex = computed(() => {
  const idx = stepList.findIndex(s => s.id === activeTab.value)
  return idx >= 0 ? idx : 0
})

function nextStep() {
  if (currentStepIndex.value < stepList.length - 1) {
    activeTab.value = stepList[currentStepIndex.value + 1].id
  }
}

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
  // Empty FK -> null
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

<style scoped>
.cust-modal-card {
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 24px 16px;
}

.modal-body {
  display: flex;
  min-height: 440px;
  max-height: 62vh;
  overflow: hidden;
}

/* -- Stepper navigation (left column) -- */
.stepper-nav {
  width: 240px;
  flex-shrink: 0;
  padding: 16px 12px;
  border-right: 1px solid rgba(0, 0, 0, 0.08);
  overflow-y: auto;
}

.stepper-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 14px;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.stepper-item:hover {
  background: rgba(var(--v-theme-primary), 0.06);
}

.stepper-item.active {
  background: rgba(var(--v-theme-primary), 0.1);
}

.stepper-item.active .stepper-num {
  background: rgb(var(--v-theme-primary));
  color: #fff;
  transform: scale(1.05);
}

.stepper-item.active .stepper-label {
  color: rgb(var(--v-theme-primary));
  font-weight: 700;
}

.stepper-num {
  width: 32px;
  height: 32px;
  flex-shrink: 0;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: 600;
  background: rgba(0, 0, 0, 0.08);
  color: rgba(0, 0, 0, 0.5);
  transition: all 0.2s ease;
}

.stepper-text {
  flex: 1;
  min-width: 0;
}

.stepper-label {
  font-size: 14px;
  font-weight: 600;
  line-height: 1.2;
  transition: color 0.2s ease;
}

.stepper-desc {
  font-size: 12px;
  color: rgba(0, 0, 0, 0.45);
  line-height: 1.3;
  margin-top: 2px;
}

/* -- Stepper content (right column) -- */
.stepper-content {
  flex: 1;
  padding: 24px 28px;
  overflow-y: auto;
}

.step-title {
  font-size: 1.25rem;
  font-weight: 700;
  margin-bottom: 4px;
}

.step-subtitle {
  font-size: 0.875rem;
  color: rgba(0, 0, 0, 0.5);
  margin-bottom: 8px;
}

/* -- Settings card -- */
.settings-card {
  background: rgba(0, 0, 0, 0.02);
  border: 1px solid rgba(0, 0, 0, 0.08);
  border-radius: 16px;
  padding: 16px 20px;
  margin-top: 16px;
}

.settings-card-label {
  font-size: 0.875rem;
  font-weight: 700;
  color: rgba(0, 0, 0, 0.7);
  margin-bottom: 4px;
}

/* -- Status toggles -- */
.status-toggles {
  margin-top: 24px;
}

.status-toggles-label {
  font-size: 0.875rem;
  font-weight: 700;
  color: rgba(0, 0, 0, 0.7);
  margin-bottom: 12px;
}

.toggle-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.toggle-item {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 12px 16px;
  border-radius: 14px;
  background: rgba(0, 0, 0, 0.02);
  border: 1px solid rgba(0, 0, 0, 0.06);
  transition: all 0.2s ease;
}

.toggle-item.active {
  background: rgba(var(--v-theme-primary), 0.05);
  border-color: rgba(var(--v-theme-primary), 0.2);
}

.toggle-text {
  flex: 1;
}

.toggle-title {
  font-size: 0.875rem;
  font-weight: 600;
}

.toggle-desc {
  font-size: 0.75rem;
  color: rgba(0, 0, 0, 0.45);
  margin-top: 2px;
}

/* -- Footer -- */
.modal-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 24px;
}

/* -- Dark theme -- */
:deep(.v-theme--dark) .stepper-nav {
  border-right-color: rgba(255, 255, 255, 0.08);
}
:deep(.v-theme--dark) .stepper-num {
  background: rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.5);
}
:deep(.v-theme--dark) .stepper-desc,
:deep(.v-theme--dark) .step-subtitle,
:deep(.v-theme--dark) .toggle-desc {
  color: rgba(255, 255, 255, 0.4);
}
:deep(.v-theme--dark) .settings-card,
:deep(.v-theme--dark) .toggle-item {
  background: rgba(255, 255, 255, 0.03);
  border-color: rgba(255, 255, 255, 0.08);
}
:deep(.v-theme--dark) .settings-card-label,
:deep(.v-theme--dark) .status-toggles-label {
  color: rgba(255, 255, 255, 0.7);
}
</style>
