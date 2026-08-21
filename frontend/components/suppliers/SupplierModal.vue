<template>
  <v-dialog :model-value="show" @update:model-value="$emit('close')" max-width="1000" scrollable>
    <v-card rounded="xl" class="sup-modal-card">

      <!-- ============ Header ============ -->
      <div class="modal-header">
        <div class="d-flex align-center ga-3">
          <v-avatar :color="isEdit ? 'orange-darken-2' : 'success'" size="44" rounded="lg">
            <v-icon size="22" icon="mdi-truck-fast" />
          </v-avatar>
          <div>
            <div class="text-h6 font-weight-bold">{{ isEdit ? 'Edit Supplier' : 'Add New Supplier' }}</div>
            <div class="text-body-2 text-medium-emphasis">{{ isEdit ? 'Update supplier details and terms' : 'Create a new vendor profile' }}</div>
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
              <div class="step-title">Supplier Profile</div>
              <div class="step-subtitle">Basic information about this vendor.</div>

              <v-row dense class="mt-2">
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
                    prepend-inner-icon="mdi-domain"
                  />
                </v-col>
              </v-row>

              <v-row dense>
                <v-col cols="12" sm="6">
                  <v-text-field
                    v-model="form.contact_person"
                    label="Contact Person"
                    variant="outlined"
                    density="comfortable"
                    prepend-inner-icon="mdi-account-tie"
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

              <v-row dense>
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
                    v-model="form.website"
                    label="Website"
                    variant="outlined"
                    density="comfortable"
                    placeholder="https://"
                    prepend-inner-icon="mdi-web"
                  />
                </v-col>
              </v-row>
            </v-window-item>

            <!-- ====== Step 2: Address ====== -->
            <v-window-item value="address">
              <div class="step-title">Address</div>
              <div class="step-subtitle">Where this supplier is located.</div>

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

              <v-row dense>
                <v-col cols="12" sm="6">
                  <v-text-field v-model="form.city" label="City" variant="outlined" density="comfortable" prepend-inner-icon="mdi-city" />
                </v-col>
                <v-col cols="12" sm="6">
                  <v-text-field v-model="form.state_province" label="State / Province" variant="outlined" density="comfortable" prepend-inner-icon="mdi-map" />
                </v-col>
              </v-row>

              <v-row dense>
                <v-col cols="12" sm="6">
                  <v-text-field v-model="form.postal_code" label="Postal Code" variant="outlined" density="comfortable" prepend-inner-icon="mdi-mailbox" />
                </v-col>
                <v-col cols="12" sm="6">
                  <v-text-field v-model="form.country" label="Country" variant="outlined" density="comfortable" prepend-inner-icon="mdi-flag-outline" />
                </v-col>
              </v-row>
            </v-window-item>

            <!-- ====== Step 3: Terms ====== -->
            <v-window-item value="terms">
              <div class="step-title">Terms and Conditions</div>
              <div class="step-subtitle">Payment terms, lead time, minimum order, and rating.</div>

              <div class="settings-card">
                <div class="settings-card-label">Payment</div>
                <v-row dense class="mt-1">
                  <v-col cols="12" sm="6">
                    <v-text-field v-model="form.tax_id" label="Tax ID" variant="outlined" density="comfortable" prepend-inner-icon="mdi-file-document-outline" />
                  </v-col>
                  <v-col cols="12" sm="6">
                    <v-text-field
                      v-model="form.payment_terms"
                      label="Payment Terms"
                      variant="outlined"
                      density="comfortable"
                      placeholder="e.g., Net 30, COD"
                      prepend-inner-icon="mdi-calendar-clock"
                    />
                  </v-col>
                </v-row>
                <v-text-field
                  v-model="form.currency_code"
                  label="Currency Code"
                  variant="outlined"
                  density="comfortable"
                  maxlength="3"
                  placeholder="USD"
                  prepend-inner-icon="mdi-currency-usd"
                  class="mt-2"
                />
              </div>

              <div class="settings-card">
                <div class="settings-card-label">Delivery</div>
                <v-row dense class="mt-1">
                  <v-col cols="12" sm="6">
                    <v-text-field
                      v-model.number="form.lead_time_days"
                      label="Lead Time (days)"
                      variant="outlined"
                      density="comfortable"
                      type="number"
                      min="0"
                      :error-messages="errors.lead_time_days"
                      prepend-inner-icon="mdi-truck-delivery-outline"
                    />
                  </v-col>
                  <v-col cols="12" sm="6">
                    <v-text-field
                      v-model="form.minimum_order_value"
                      :label="`Minimum Order (${symbol})`"
                      variant="outlined"
                      density="comfortable"
                      type="number"
                      step="0.01"
                      min="0"
                      :error-messages="errors.minimum_order_value"
                      prepend-inner-icon="mdi-cash-minimum"
                    />
                  </v-col>
                </v-row>
              </div>

              <div class="settings-card">
                <div class="settings-card-label">Rating</div>
                <div class="rating-row">
                  <v-rating
                    v-model="form.rating"
                    color="amber"
                    half-increments
                    hover
                    size="small"
                    density="compact"
                  />
                  <span class="rating-value">{{ form.rating }} / 5</span>
                </div>
              </div>

              <v-textarea
                v-model="form.notes"
                label="Notes"
                variant="outlined"
                density="comfortable"
                rows="2"
                placeholder="Internal notes about this supplier..."
                prepend-inner-icon="mdi-note-edit-outline"
                class="mt-4"
              />

              <!-- Status toggle -->
              <div class="status-toggles">
                <div class="toggle-item" :class="{ active: form.is_active }">
                  <v-switch v-model="form.is_active" color="primary" density="compact" hide-details inset />
                  <div class="toggle-text">
                    <div class="toggle-title">Active</div>
                    <div class="toggle-desc">Supplier is available for purchase orders</div>
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
          <v-icon size="16" :icon="activeTab === 'profile' ? 'mdi-truck-fast' : activeTab === 'address' ? 'mdi-map-marker' : 'mdi-file-sign'" />
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
            color="orange-darken-2"
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

const stepList = [
  { id: 'profile', label: 'Profile', desc: 'Name, contact, email' },
  { id: 'address', label: 'Address', desc: 'Location details' },
  { id: 'terms', label: 'Terms', desc: 'Payment, delivery, rating' },
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

<style scoped>
.sup-modal-card {
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

/* -- Stepper navigation -- */
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

/* -- Stepper content -- */
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

/* -- Settings cards -- */
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

/* -- Rating row -- */
.rating-row {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 8px;
}

.rating-value {
  font-size: 0.875rem;
  font-weight: 600;
  color: rgba(0, 0, 0, 0.6);
}

/* -- Status toggles -- */
.status-toggles {
  margin-top: 24px;
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
:deep(.v-theme--dark) .settings-card-label {
  color: rgba(255, 255, 255, 0.7);
}
:deep(.v-theme--dark) .rating-value {
  color: rgba(255, 255, 255, 0.5);
}
</style>
