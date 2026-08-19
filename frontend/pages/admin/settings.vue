<template>
  <div class="d-flex flex-column ga-6">
    <div class="d-flex align-center justify-space-between">
      <h2 class="text-h6 font-weight-bold">Settings</h2>
    </div>

    <!-- Currency Settings -->
    <v-card rounded="lg" elevation="2">
      <v-card-title class="text-body-1 font-weight-bold">Currency &amp; Locale</v-card-title>
      <v-card-text>
        <p class="text-body-2 text-medium-emphasis mb-4">
          Set the default currency for this tenant. All sales, reports, and receipts will be displayed in this currency.
          The fallback currency is USD ($).
        </p>

        <!-- Current currency preview -->
        <v-card variant="tonal" class="mb-4">
          <v-card-text class="d-flex align-center ga-4">
            <v-avatar color="primary" size="48" rounded="lg">
              <v-icon>mdi-currency-usd</v-icon>
            </v-avatar>
            <div class="flex-1">
              <p class="text-body-2 text-medium-emphasis">Current Currency</p>
              <p class="text-body-1 font-weight-bold">{{ form.currency_code }} &middot; {{ currentSymbol }}</p>
            </div>
            <div class="text-right">
              <p class="text-body-2 text-medium-emphasis">Preview</p>
              <p class="text-body-1 font-weight-bold">{{ currentSymbol }}{{ formatPreviewAmount }}</p>
            </div>
          </v-card-text>
        </v-card>

        <v-select
          v-model="form.currency_code"
          :items="currencyChoices"
          item-title="label"
          item-value="code"
          label="Currency"
          variant="outlined"
          density="comfortable"
          @update:model-value="onCurrencyChange"
        />
        <v-alert v-if="!form.currency_code" type="warning" variant="text" density="compact" class="mt-1">
          No currency selected — falling back to USD ($).
        </v-alert>

        <v-text-field
          v-model="form.currency_symbol"
          label="Currency Symbol (auto-filled, editable)"
          variant="outlined"
          density="comfortable"
          maxlength="5"
          style="max-width: 200px"
          placeholder="KSh"
          class="mt-4"
          hint="Override the symbol displayed in the UI"
          persistent-hint
        />

        <v-select
          v-model="form.timezone"
          :items="timezones"
          label="Timezone"
          variant="outlined"
          density="comfortable"
          class="mt-4"
        />

        <div class="d-flex align-center ga-3 pt-4">
          <v-btn color="primary" :loading="saving" @click="saveSettings">Save Currency Settings</v-btn>
          <v-btn variant="text" @click="resetForm">Reset</v-btn>
        </div>
      </v-card-text>
    </v-card>

    <!-- Business Information -->
    <v-card rounded="lg" elevation="2">
      <v-card-title class="text-body-1 font-weight-bold">Business Information</v-card-title>
      <v-card-text>
        <p class="text-body-2 text-medium-emphasis mb-4">Update your business contact details.</p>
        <v-row>
          <v-col cols="12" md="6">
            <v-text-field v-model="form.name" label="Business Name" variant="outlined" density="comfortable" />
          </v-col>
          <v-col cols="12" md="6">
            <v-text-field v-model="form.country" label="Country" variant="outlined" density="comfortable" />
          </v-col>
          <v-col cols="12" md="6">
            <v-text-field v-model="form.contact_email" label="Contact Email" variant="outlined" density="comfortable" type="email" />
          </v-col>
          <v-col cols="12" md="6">
            <v-text-field v-model="form.contact_phone" label="Contact Phone" variant="outlined" density="comfortable" />
          </v-col>
        </v-row>
        <div class="d-flex align-center ga-3 pt-2">
          <v-btn color="primary" :loading="saving" @click="saveSettings">Save Business Info</v-btn>
        </div>
      </v-card-text>
    </v-card>

    <!-- Branding -->
    <v-card rounded="lg" elevation="2">
      <v-card-title class="text-body-1 font-weight-bold">Logo &amp; Branding</v-card-title>
      <v-card-text>
        <p class="text-body-2 text-medium-emphasis mb-4">Upload your business logo and customize brand colors. The logo appears on receipts, the sidebar, and the POS interface.</p>

        <!-- Logo upload area -->
        <div class="logo-section">
          <div class="logo-preview-wrap">
            <div class="logo-preview" @click="triggerFileInput" @dragover.prevent="onDragOver" @dragleave.prevent="onDragLeave" @drop.prevent="onDrop" :class="{ 'logo-preview--drag': isDragging }">
              <img v-if="logoUrl" :src="logoUrl" alt="Logo" class="logo-preview__img" />
              <div v-else class="logo-preview__placeholder">
                <v-icon size="36" class="logo-preview__placeholder-icon">mdi-image-outline</v-icon>
                <p class="logo-preview__placeholder-text">Click or drag to upload</p>
                <p class="logo-preview__placeholder-hint">PNG, JPG, SVG up to 2MB</p>
              </div>
            </div>
          </div>
          <div class="logo-actions">
            <input ref="fileInput" type="file" accept="image/png,image/jpeg,image/svg+xml" style="display: none;" @change="onFileSelect" />
            <v-btn variant="outlined" density="comfortable" prepend-icon="mdi-upload" @click="triggerFileInput" :loading="uploadingLogo">
              {{ logoUrl ? 'Change Logo' : 'Upload Logo' }}
            </v-btn>
            <v-btn v-if="logoUrl" variant="text" density="comfortable" prepend-icon="mdi-delete-outline" color="error" @click="removeLogo" :loading="uploadingLogo">
              Remove
            </v-btn>
            <v-alert v-if="logoError" type="error" variant="text" density="compact" class="mt-2">
              {{ logoError }}
            </v-alert>
          </div>
        </div>

        <v-divider class="my-5" />

        <!-- Primary color -->
        <p class="text-body-2 font-weight-medium mb-2">Primary Color</p>
        <div class="d-flex align-center ga-3">
          <v-color-picker v-model="form.primary_color" mode="hex" hide-inputs width="120" />
          <v-text-field v-model="form.primary_color" label="Primary Color" variant="outlined" density="comfortable" style="max-width: 200px" placeholder="#1976D2" />
          <v-card rounded="lg" :style="{ backgroundColor: form.primary_color }" class="px-4 py-2">
            <span class="text-white text-body-2 font-weight-medium">Preview</span>
          </v-card>
        </div>
        <div class="d-flex align-center ga-3 pt-4">
          <v-btn color="primary" :loading="saving" @click="saveSettings">Save Branding</v-btn>
        </div>
      </v-card-text>
    </v-card>

    <!-- Address -->
    <v-card rounded="lg" elevation="2">
      <v-card-title class="text-body-1 font-weight-bold">Address</v-card-title>
      <v-card-text>
        <v-row>
          <v-col cols="12">
            <v-text-field v-model="form.address_line1" label="Address Line 1" variant="outlined" density="comfortable" />
          </v-col>
          <v-col cols="12">
            <v-text-field v-model="form.address_line2" label="Address Line 2" variant="outlined" density="comfortable" />
          </v-col>
          <v-col cols="12" md="6">
            <v-text-field v-model="form.city" label="City" variant="outlined" density="comfortable" />
          </v-col>
          <v-col cols="12" md="6">
            <v-text-field v-model="form.state_province" label="State / Province" variant="outlined" density="comfortable" />
          </v-col>
          <v-col cols="12" md="6">
            <v-text-field v-model="form.postal_code" label="Postal Code" variant="outlined" density="comfortable" />
          </v-col>
        </v-row>
        <div class="d-flex align-center ga-3 pt-2">
          <v-btn color="primary" :loading="saving" @click="saveSettings">Save Address</v-btn>
        </div>
      </v-card-text>
    </v-card>
  </div>
</template>

<script setup>
definePageMeta({ middleware: 'auth' })

const auth = useAuthStore()
const toast = useToast()
const config = useRuntimeConfig()

const saving = ref(false)
const uploadingLogo = ref(false)
const logoUrl = ref('')
const logoError = ref('')
const isDragging = ref(false)
const fileInput = ref(null)
const selectedFile = ref(null)
const currencyChoices = ref([
  { code: 'KES', label: 'Kenyan Shilling (KSh)' },
  { code: 'USD', label: 'US Dollar ($)' },
  { code: 'EUR', label: 'Euro (€)' },
  { code: 'GBP', label: 'British Pound (£)' },
  { code: 'UGX', label: 'Ugandan Shilling (USh)' },
  { code: 'TZS', label: 'Tanzanian Shilling (TSh)' },
  { code: 'NGN', label: 'Nigerian Naira (₦)' },
  { code: 'INR', label: 'Indian Rupee (₹)' },
  { code: 'CAD', label: 'Canadian Dollar (C$)' },
  { code: 'AUD', label: 'Australian Dollar (A$)' },
  { code: 'ZAR', label: 'South African Rand (R)' },
  { code: 'GHS', label: 'Ghanaian Cedi (₵)' },
])

// Currency code to symbol map (synced with backend)
const symbolMap = {
  KES: 'KSh', USD: '$', EUR: '€', GBP: '£',
  UGX: 'USh', TZS: 'TSh', NGN: '₦', INR: '₹',
  CAD: 'C$', AUD: 'A$', ZAR: 'R', GHS: '₵',
}

const timezones = [
  'Africa/Nairobi', 'Africa/Kampala', 'Africa/Dar_es_Salaam', 'Africa/Lagos',
  'Africa/Johannesburg', 'Africa/Accra', 'Africa/Cairo',
  'UTC', 'Europe/London', 'Europe/Paris',
  'America/New_York', 'America/Los_Angeles', 'America/Toronto',
  'Asia/Kolkata', 'Asia/Singapore', 'Asia/Tokyo', 'Asia/Dubai',
  'Australia/Sydney',
]

const form = reactive({
  name: '',
  currency_code: 'KES',
  currency_symbol: 'KSh',
  timezone: 'Africa/Nairobi',
  country: 'Kenya',
  contact_email: '',
  contact_phone: '',
  address_line1: '',
  address_line2: '',
  city: '',
  state_province: '',
  postal_code: '',
  primary_color: '#1976D2',
})

const formatPreviewAmount = computed(() => {
  const num = 1234567.89
  return num.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')
})

const currentSymbol = computed(() => form.currency_symbol || symbolMap[form.currency_code] || '$')

onMounted(async () => {
  try {
    const data = await useApi()('/tenants/me/')
    Object.assign(form, {
      name: data.name || '',
      currency_code: data.currency_code || 'KES',
      currency_symbol: data.currency_symbol || symbolMap[data.currency_code] || 'KSh',
      timezone: data.timezone || 'Africa/Nairobi',
      country: data.country || 'Kenya',
      contact_email: data.contact_email || '',
      contact_phone: data.contact_phone || '',
      address_line1: data.address_line1 || '',
      address_line2: data.address_line2 || '',
      city: data.city || '',
      state_province: data.state_province || '',
      postal_code: data.postal_code || '',
      primary_color: data.primary_color || '#1976D2',
    })
    if (data.currency_choices) {
      currencyChoices.value = data.currency_choices.map(c => ({
        code: c.code,
        label: c.label,
      }))
    }
    // Load logo URL
    if (data.logo) {
      logoUrl.value = data.logo.startsWith('http') ? data.logo : `${config.public.apiBase.replace('/api', '')}/${data.logo}`
    }
  } catch (e) {
    if (auth.tenant) {
      form.currency_code = auth.currencyCode
      form.currency_symbol = auth.currencySymbol
      form.timezone = auth.tenant.timezone || 'Africa/Nairobi'
      form.name = auth.tenantName
    }
  }
})

function onCurrencyChange() {
  form.currency_symbol = symbolMap[form.currency_code] || '$'
}

async function saveSettings() {
  saving.value = true
  try {
    const data = await useApi()('/tenants/settings/', {
      method: 'PATCH',
      body: {
        name: form.name,
        currency_code: form.currency_code,
        currency_symbol: form.currency_symbol,
        timezone: form.timezone,
        country: form.country,
        contact_email: form.contact_email,
        contact_phone: form.contact_phone,
        address_line1: form.address_line1,
        address_line2: form.address_line2,
        city: form.city,
        state_province: form.state_province,
        postal_code: form.postal_code,
        primary_color: form.primary_color,
      },
    })
    auth.setTenant({
      name: data.name,
      currency_code: data.currency_code,
      currency_symbol: data.currency_symbol,
      timezone: data.timezone,
      primary_color: data.primary_color,
      plan: auth.tenantPlan,
      logo: data.logo || null,
    })
    toast.success('Settings saved! Currency: ' + data.currency_code + ' (' + data.currency_symbol + ')')
  } catch (e) {
    toast.error('Failed to save settings')
  } finally {
    saving.value = false
  }
}

function resetForm() {
  if (auth.tenant) {
    form.currency_code = auth.currencyCode
    form.currency_symbol = auth.currencySymbol
    form.timezone = auth.tenant.timezone || 'Africa/Nairobi'
    form.name = auth.tenantName
  } else {
    form.currency_code = 'KES'
    form.currency_symbol = 'KSh'
    form.timezone = 'Africa/Nairobi'
  }
}

// ===== Logo Upload =====
function triggerFileInput() {
  fileInput.value?.click()
}

function onFileSelect(e) {
  const target = e.target
  if (target.files && target.files[0]) {
    handleFile(target.files[0])
  }
}

function onDragOver() {
  isDragging.value = true
}

function onDragLeave() {
  isDragging.value = false
}

function onDrop(e) {
  isDragging.value = false
  const file = e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0]
  if (file) handleFile(file)
}

function handleFile(file) {
  logoError.value = ''
  // Validate
  if (!file.type.startsWith('image/')) {
    logoError.value = 'Please select an image file (PNG, JPG, or SVG)'
    return
  }
  if (file.size > 2 * 1024 * 1024) {
    logoError.value = 'File too large. Maximum 2MB allowed.'
    return
  }
  selectedFile.value = file
  // Preview
  const reader = new FileReader()
  reader.onload = (e) => {
    logoUrl.value = e.target.result
  }
  reader.readAsDataURL(file)
  // Upload
  uploadLogo(file)
}

async function uploadLogo(file) {
  uploadingLogo.value = true
  logoError.value = ''
  try {
    const formData = new FormData()
    formData.append('logo', file)
    // Must send multipart — use $fetch directly since useApi sets JSON content-type
    const data = await useApi()('/tenants/settings/', {
      method: 'PATCH',
      body: formData,
    })
    if (data.logo) {
      logoUrl.value = data.logo.startsWith('http') ? data.logo : `${config.public.apiBase.replace('/api', '')}/${data.logo}`
    }
    // Update auth store
    auth.setTenant({
      name: data.name,
      currency_code: data.currency_code,
      currency_symbol: data.currency_symbol,
      timezone: data.timezone,
      primary_color: data.primary_color,
      plan: auth.tenantPlan,
      logo: data.logo || null,
    })
    toast.success('Logo uploaded successfully!')
    selectedFile.value = null
  } catch (e) {
    logoError.value = e?.data?.logo?.[0] || 'Failed to upload logo'
    toast.error('Failed to upload logo')
  } finally {
    uploadingLogo.value = false
  }
}

async function removeLogo() {
  uploadingLogo.value = true
  logoError.value = ''
  try {
    const data = await useApi()('/tenants/settings/', {
      method: 'PATCH',
      body: { logo: '' },
    })
    logoUrl.value = ''
    auth.setTenant({
      name: data.name,
      currency_code: data.currency_code,
      currency_symbol: data.currency_symbol,
      timezone: data.timezone,
      primary_color: data.primary_color,
      plan: auth.tenantPlan,
      logo: null,
    })
    toast.success('Logo removed')
  } catch {
    toast.error('Failed to remove logo')
  } finally {
    uploadingLogo.value = false
  }
}
</script>

<style scoped>
.logo-section {
  display: flex;
  gap: 24px;
  align-items: flex-start;
  flex-wrap: wrap;
}
.logo-preview-wrap {
  flex-shrink: 0;
}
.logo-preview {
  width: 160px;
  height: 160px;
  border-radius: 16px;
  border: 2px dashed rgba(var(--v-theme-on-surface), 0.15);
  background: rgba(var(--v-theme-on-surface), 0.02);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: border-color 0.25s, background 0.25s;
  overflow: hidden;
  position: relative;
}
.logo-preview:hover {
  border-color: #3b82f6;
  background: rgba(59, 130, 246, 0.03);
}
.logo-preview--drag {
  border-color: #3b82f6;
  background: rgba(59, 130, 246, 0.06);
}
.logo-preview__img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  padding: 12px;
}
.logo-preview__placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}
.logo-preview__placeholder-icon {
  color: rgba(var(--v-theme-on-surface), 0.25);
}
.logo-preview__placeholder-text {
  font-size: 0.75rem;
  font-weight: 600;
  color: rgba(var(--v-theme-on-surface), 0.45);
  margin: 0;
}
.logo-preview__placeholder-hint {
  font-size: 0.625rem;
  color: rgba(var(--v-theme-on-surface), 0.3);
  margin: 0;
}
.logo-actions {
  display: flex;
  flex-direction: column;
  gap: 8px;
  align-items: flex-start;
}
</style>
