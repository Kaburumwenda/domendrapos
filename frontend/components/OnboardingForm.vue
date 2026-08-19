<template>
  <div class="signup-card">
    <!-- Multi-step progress -->
    <div class="steps mb-8">
      <div
        v-for="(s, i) in stepLabels"
        :key="s.key"
        class="step"
        :class="{ active: step >= i, current: step === i }"
      >
        <div class="step-dot">
          <v-icon v-if="step > i" size="18">mdi-check</v-icon>
          <span v-else>{{ i + 1 }}</span>
        </div>
        <span class="step-label">{{ s.label }}</span>
        <div v-if="i < stepLabels.length - 1" class="step-bar" :class="{ done: step > i }" />
      </div>
    </div>

    <v-window v-model="step" class="step-window">
      <!-- ───────── Step 0 — Business ───────── -->
      <v-window-item :value="0">
        <h2 class="text-h5 font-weight-semibold heading-text mb-1">Tell us about your business</h2>
        <p class="text-body-2 subtext mb-6">This creates your isolated workspace.</p>

        <v-text-field
          v-model="form.business_name"
          label="Business / organisation name"
          variant="outlined"
          density="comfortable"
          prepend-inner-icon="mdi-store-outline"
          placeholder="e.g. Acme Retail Ltd"
          class="field-glass mb-4"
          :rules="[v => !!v || 'Business name is required']"
          @input="suggestDomain"
        />

        <v-text-field
          v-model="form.domain"
          label="Workspace subdomain"
          variant="outlined"
          density="comfortable"
          prepend-inner-icon="mdi-web"
          placeholder="auto-generated"
          class="field-glass mb-1"
          hint="Auto-generated from your business name — you can change it after signup"
          persistent-hint
          disabled
        >
          <template #append-inner>
            <span class="domain-suffix">.domendrapos.com</span>
          </template>
        </v-text-field>
        <p v-if="domainError" class="text-caption text-error mb-2 mt-1">{{ domainError }}</p>

        <div class="d-flex justify-end mt-6">
          <v-btn color="primary" size="large" class="next-btn" @click="goNext">
            Continue
            <v-icon end>mdi-arrow-right</v-icon>
          </v-btn>
        </div>
      </v-window-item>

      <!-- ───────── Step 1 — Locale ───────── -->
      <v-window-item :value="1">
        <h2 class="text-h5 font-weight-semibold heading-text mb-1">Set your locale</h2>
        <p class="text-body-2 subtext mb-6">Currency and country for your store.</p>

        <v-select
          v-model="form.currency_code"
          :items="currencyOptions"
          item-title="label"
          item-value="value"
          label="Currency"
          variant="outlined"
          density="comfortable"
          prepend-inner-icon="mdi-cash-multiple"
          class="field-glass mb-4"
          hide-details
        />

        <v-autocomplete
          v-model="form.country"
          :items="countryOptions"
          label="Country"
          variant="outlined"
          density="comfortable"
          prepend-inner-icon="mdi-map-marker-outline"
          class="field-glass"
          hide-details
        />

        <div class="currency-preview">
          <v-icon size="18" color="rgba(52,120,246,0.8)">mdi-eye-outline</v-icon>
          <span>Prices will display as <strong>{{ currencySymbol }}</strong> ({{ form.currency_code }})</span>
        </div>

        <div class="d-flex justify-space-between mt-6">
          <v-btn variant="text" size="large" class="back-btn" @click="step--">
            <v-icon start>mdi-arrow-left</v-icon>
            Back
          </v-btn>
          <v-btn color="primary" size="large" class="next-btn" @click="goNext">
            Continue
            <v-icon end>mdi-arrow-right</v-icon>
          </v-btn>
        </div>
      </v-window-item>

      <!-- ───────── Step 2 — Admin ───────── -->
      <v-window-item :value="2">
        <h2 class="text-h5 font-weight-semibold heading-text mb-1">Create your admin account</h2>
        <p class="text-body-2 subtext mb-6">You'll be the tenant administrator.</p>

        <v-row>
          <v-col cols="12" sm="6">
            <v-text-field
              v-model="form.admin_first_name"
              label="First name"
              variant="outlined"
              density="comfortable"
              prepend-inner-icon="mdi-account-outline"
              class="field-glass"
              :rules="[v => !!v || 'Required']"
            />
          </v-col>
          <v-col cols="12" sm="6">
            <v-text-field
              v-model="form.admin_last_name"
              label="Last name"
              variant="outlined"
              density="comfortable"
              prepend-inner-icon="mdi-account-outline"
              class="field-glass"
              :rules="[v => !!v || 'Required']"
            />
          </v-col>
        </v-row>

        <v-text-field
          v-model="form.contact_email"
          label="Work email"
          type="email"
          variant="outlined"
          density="comfortable"
          prepend-inner-icon="mdi-email-outline"
          placeholder="you@acme.com"
          class="field-glass mb-4"
          :rules="[v => !!v || 'Email is required', v => /.+@.+\..+/.test(v) || 'Enter a valid email']"
        />

        <v-text-field
          v-model="form.contact_phone"
          label="Phone (optional)"
          variant="outlined"
          density="comfortable"
          prepend-inner-icon="mdi-phone-outline"
          placeholder="+254 712 345 678"
          class="field-glass mb-4"
          hide-details
        />

        <v-text-field
          v-model="form.admin_password"
          label="Password"
          :type="showPassword ? 'text' : 'password'"
          variant="outlined"
          density="comfortable"
          prepend-inner-icon="mdi-lock-outline"
          :append-inner-icon="showPassword ? 'mdi-eye-off-outline' : 'mdi-eye-outline'"
          class="field-glass mb-1"
          :rules="[v => !!v || 'Password is required', v => v.length >= 8 || 'Minimum 8 characters']"
          @click:append-inner="showPassword = !showPassword"
        />

        <!-- Password strength meter -->
        <div class="strength-meter mb-4">
          <div class="strength-bar">
            <div class="strength-fill" :class="strengthClass" :style="{ width: strengthPct + '%' }" />
          </div>
          <span class="strength-text" :class="strengthClass">{{ strengthLabel }}</span>
        </div>

        <v-alert v-if="error" type="error" variant="tonal" density="comfortable" class="mb-4">
          {{ error }}
        </v-alert>

        <div class="d-flex justify-space-between mt-2">
          <v-btn variant="text" size="large" class="back-btn" :disabled="submitting" @click="step--">
            <v-icon start>mdi-arrow-left</v-icon>
            Back
          </v-btn>
          <v-btn
            type="submit"
            color="primary"
            size="large"
            class="next-btn"
            :loading="submitting"
            :disabled="submitting"
            @click.prevent="submit"
          >
            <v-icon start>mdi-check-circle-outline</v-icon>
            Create workspace
          </v-btn>
        </div>
      </v-window-item>

      <!-- ───────── Step 3 — Success ───────── -->
      <v-window-item :value="3">
        <div class="success-screen">
          <div class="success-ripple">
            <div class="success-check">
              <v-icon size="44" color="white">mdi-check-bold</v-icon>
            </div>
          </div>
          <h2 class="text-h5 font-weight-bold heading-text mt-6 mb-1">Workspace ready! 🎉</h2>
          <p class="text-body-2 subtext mb-6">
            <strong>{{ form.business_name }}</strong> is set up. Signing you in…
          </p>

          <v-progress-circular v-if="autoLogin" indeterminate color="primary" size="32" width="3" class="mb-4" />
          <v-alert v-if="autoLoginError" type="info" variant="tonal" density="comfortable" class="mb-4 text-left">
            {{ autoLoginError }}
          </v-alert>

          <v-card v-if="!autoLogin && !autoLoginError" variant="flat" class="success-card mb-4">
            <v-card-text>
              <div class="d-flex align-center ga-3">
                <v-icon color="primary">mdi-account-check-outline</v-icon>
                <div class="text-left">
                  <div class="text-body-2 subtext">Admin login created for</div>
                  <div class="text-body-1 font-weight-bold heading-text">{{ form.contact_email }}</div>
                </div>
              </div>
            </v-card-text>
          </v-card>

          <v-btn block color="primary" size="large" class="next-btn mt-2" :loading="autoLogin" :disabled="autoLogin" @click="goToLogin">
            <v-icon start>mdi-login</v-icon>
            Go to sign in
          </v-btn>
        </div>
      </v-window-item>
    </v-window>

    <!-- Sign in link (hidden on success step) -->
    <p v-if="step < 3" class="text-center text-body-2 mt-6 subtext">
      Already have a workspace?
      <NuxtLink to="/login" class="signin-link">Sign in</NuxtLink>
    </p>
  </div>
</template>

<script setup lang="ts">
/** Multi-step tenant onboarding form — posts to POST /api/tenants/onboard/onboard/ */
const props = defineProps<{ inputClass?: string }>()

const emit = defineEmits<{ (e: 'done', domain: string): void }>()

const auth = useAuthStore()
const toast = useToast()
const config = useRuntimeConfig()

const step = ref(0)
const submitting = ref(false)
const error = ref('')
const showPassword = ref(false)
const autoLogin = ref(false)
const autoLoginError = ref('')

const stepLabels = [
  { key: 'business', label: 'Business' },
  { key: 'locale', label: 'Locale' },
  { key: 'admin', label: 'Admin' },
  { key: 'done', label: 'Done' },
]

const currencyOptions = [
  { value: 'KES', label: 'Kenyan Shilling (KSh)' },
  { value: 'USD', label: 'US Dollar ($)' },
  { value: 'EUR', label: 'Euro (€)' },
  { value: 'GBP', label: 'British Pound (£)' },
  { value: 'UGX', label: 'Ugandan Shilling (USh)' },
  { value: 'TZS', label: 'Tanzanian Shilling (TSh)' },
  { value: 'NGN', label: 'Nigerian Naira (₦)' },
  { value: 'INR', label: 'Indian Rupee (₹)' },
  { value: 'CAD', label: 'Canadian Dollar (C$)' },
  { value: 'AUD', label: 'Australian Dollar (A$)' },
  { value: 'ZAR', label: 'South African Rand (R)' },
  { value: 'GHS', label: 'Ghanaian Cedi (₵)' },
]

const countryOptions = [
  'Kenya', 'United States', 'United Kingdom', 'Uganda', 'Tanzania', 'Nigeria',
  'India', 'Canada', 'Australia', 'South Africa', 'Ghana', 'Germany', 'France',
  'United Arab Emirates', 'Rwanda', 'Zambia', 'Malawi', 'Ethiopia', 'Mozambique',
]

const CURRENCY_SYMBOLS: Record<string, string> = {
  KES: 'KSh', USD: '$', EUR: '€', GBP: '£', UGX: 'USh', TZS: 'TSh',
  NGN: '₦', INR: '₹', CAD: 'C$', AUD: 'A$', ZAR: 'R', GHS: '₵',
}

const currencySymbol = computed(() => CURRENCY_SYMBOLS[form.currency_code] || '$')

const form = reactive({
  business_name: '',
  domain: '',
  country: 'Kenya',
  currency_code: 'KES',
  admin_first_name: '',
  admin_last_name: '',
  contact_email: '',
  contact_phone: '',
  admin_password: '',
})

// Auto-suggest subdomain from business name (field is disabled — display only)
function suggestDomain() {
  const slug = (form.business_name || '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 30)
  form.domain = slug
}

// Password strength
const strengthPct = computed(() => {
  const p = form.admin_password
  let score = 0
  if (p.length >= 8) score += 25
  if (p.length >= 12) score += 15
  if (/[A-Z]/.test(p) && /[a-z]/.test(p)) score += 20
  if (/\d/.test(p)) score += 20
  if (/[^A-Za-z0-9]/.test(p)) score += 20
  return Math.min(100, score)
})
const strengthClass = computed(() => {
  if (strengthPct.value < 35) return 'weak'
  if (strengthPct.value < 70) return 'medium'
  return 'strong'
})
const strengthLabel = computed(() => {
  if (!form.admin_password) return ''
  if (strengthPct.value < 35) return 'Weak'
  if (strengthPct.value < 70) return 'Good'
  return 'Strong'
})

// Navigation
function goNext() {
  if (step.value === 0) {
    if (!form.business_name?.trim()) { toast.error('Business name is required'); return }
  }
  if (step.value === 1) {
    if (!form.currency_code) { toast.error('Choose a currency'); return }
  }
  if (step.value < 2) step.value++
}

// Submit
async function submit() {
  error.value = ''
  if (!form.admin_first_name?.trim() || !form.admin_last_name?.trim()) { toast.error('First and last name are required'); return }
  if (!/.+@.+\..+/.test(form.contact_email)) { toast.error('Enter a valid admin email'); return }
  if (form.admin_password.length < 8) { toast.error('Password must be at least 8 characters'); return }

  submitting.value = true
  try {
    const fullDomain = `${form.domain}.domendrapos.com`
    const payload = {
      business_name: form.business_name.trim(),
      domain: fullDomain,
      contact_email: form.contact_email.trim(),
      contact_phone: form.contact_phone || '',
      admin_first_name: form.admin_first_name.trim(),
      admin_last_name: form.admin_last_name.trim(),
      admin_password: form.admin_password,
      country: form.country,
      currency_code: form.currency_code,
      currency_symbol: CURRENCY_SYMBOLS[form.currency_code] || '$',
    }

    await $fetch(`${config.public.apiBase}/tenants/onboard/onboard/`, {
      method: 'POST',
      body: payload,
    })

    toast.success('Workspace created! Logging you in…')
    step.value = 3
    emit('done', fullDomain)

    // Auto-login the new admin
    autoLogin.value = true
    try {
      await auth.login(form.contact_email.trim(), form.admin_password)
      autoLogin.value = false
      toast.success(`Welcome to ${form.business_name}!`)
      navigateTo('/dashboard')
    } catch (e: any) {
      autoLogin.value = false
      autoLoginError.value = `Workspace created, but automatic sign-in failed. Use your email (${form.contact_email}) and password at the login screen.`
    }
  } catch (e: any) {
    error.value = e.data?.domain?.[0] || e.data?.business_name?.[0] || e.data?.detail || e.data?.message || 'Onboarding failed. Please check your details and try again.'
  } finally {
    submitting.value = false
  }
}

function goToLogin() {
  navigateTo('/login')
}
</script>

<style scoped>
.signup-card { position: relative; }

/* text helpers */
.heading-text { color: #0f172a; }
.subtext { color: #64748b; }

/* Field overrides — light glass fields with dark text */
:deep(.field-glass .v-field) {
  background: rgba(255, 255, 255, 0.75);
  border-color: rgba(203, 213, 225, 0.90);
  border-radius: 14px;
  transition: border-color 0.2s ease, box-shadow 0.2s ease, background 0.2s ease;
}
:deep(.field-glass .v-field:hover) { border-color: rgba(52, 120, 246, 0.50); }
:deep(.field-glass .v-field--focused) {
  border-color: #3478f6;
  background: rgba(255, 255, 255, 0.95);
  box-shadow: 0 0 0 4px rgba(52, 120, 246, 0.12);
}
:deep(.field-glass .v-field__input) { color: #0f172a; }
:deep(.field-glass .v-field input::placeholder) { color: rgba(100, 116, 139, 0.60); }
:deep(.field-glass .v-icon) { color: rgba(100, 116, 139, 0.90); opacity: 1; }
:deep(.field-glass .v-label) { color: rgba(71, 85, 105, 0.80); }
:deep(.field-glass .v-label--active) { color: #3478f6; }
/* select / autocomplete dropdown trigger text */
:deep(.field-glass .v-field__selection-text),
:deep(.field-glass .v-select__selection),
:deep(.field-glass .v-autocomplete__selection) { color: #0f172a; }
:deep(.field-glass .v-select__selection-text) { color: #0f172a; }
/* hint text under fields */
:deep(.field-glass .v-messages) { color: #94a3b8; }

/* Steps */
.steps { display: flex; align-items: flex-start; gap: 0; }
.step { display: flex; align-items: center; flex: 1; position: relative; }
.step:not(:last-child) { margin-right: 8px; }
.step-dot {
  width: 34px; height: 34px; border-radius: 50%; flex-shrink: 0;
  display: flex; align-items: center; justify-content: center;
  font-size: 0.8rem; font-weight: 700;
  background: #ffffff;
  border: 1px solid rgba(203, 213, 225, 0.90);
  color: #94a3b8;
  transition: all 0.25s ease;
  z-index: 1;
}
.step.active .step-dot {
  background: linear-gradient(135deg, #3478f6 0%, #1a5fd0 100%);
  border-color: #3478f6;
  color: #ffffff;
  box-shadow: 0 4px 14px rgba(52, 120, 246, 0.35);
}
.step.current .step-dot { transform: scale(1.08); }
.step-label {
  font-size: 0.75rem; margin-left: 8px; color: #94a3b8;
  white-space: nowrap; transition: color 0.25s ease;
}
.step.active .step-label { color: #475569; }
.step.current .step-label { color: #0f172a; font-weight: 600; }
.step-bar {
  flex: 1; height: 2px; margin: 0 6px;
  background: rgba(203, 213, 225, 0.70);
  border-radius: 1px;
  transition: background 0.3s ease;
}
.step-bar.done { background: linear-gradient(90deg, #3478f6, #93c5fd); }
@media (max-width: 600px) {
  .step-label { display: none; }
  .step:not(:last-child) { margin-right: 4px; }
}

.step-window { overflow: visible; }
:deep(.v-window__container) { transition: none; }

/* domain suffix */
.domain-suffix {
  color: #2563eb; font-size: 0.85rem; font-weight: 600;
  white-space: nowrap; align-self: center; padding-right: 4px;
}

/* currency preview */
.currency-preview {
  display: flex; align-items: center; gap: 8px;
  margin-top: 14px; padding: 10px 14px; border-radius: 10px;
  background: rgba(52, 120, 246, 0.06);
  border: 1px solid rgba(52, 120, 246, 0.20);
  color: #475569;
  font-size: 0.85rem;
}
.currency-preview strong { color: #2563eb; }

/* password strength */
.strength-meter { display: flex; align-items: center; gap: 10px; margin-top: 8px; }
.strength-bar { flex: 1; height: 5px; border-radius: 3px; background: rgba(203, 213, 225, 0.70); overflow: hidden; }
.strength-fill { height: 100%; border-radius: 3px; transition: width 0.3s ease, background 0.3s ease; }
.strength-fill.weak { background: #ef4444; }
.strength-fill.medium { background: #f59e0b; }
.strength-fill.strong { background: #22c55e; }
.strength-text { font-size: 0.72rem; font-weight: 600; min-width: 48px; }
.strength-text.weak { color: #dc2626; }
.strength-text.medium { color: #d97706; }
.strength-text.strong { color: #16a34a; }

/* buttons */
.next-btn {
  border-radius: 14px; font-weight: 700; letter-spacing: 0.02em;
  background: linear-gradient(135deg, #3478f6 0%, #1a5fd0 100%) !important;
  box-shadow: 0 10px 30px rgba(52, 120, 246, 0.35), inset 0 1px 0 rgba(255, 255, 255, 0.20);
}
.next-btn:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 14px 36px rgba(52, 120, 246, 0.45);
}
.back-btn { color: #64748b !important; }
.back-btn:hover { color: #0f172a !important; }

.signin-link {
  color: #2563eb; font-weight: 700; text-decoration: none;
  transition: color 0.2s ease;
}
.signin-link:hover { color: #1d4ed8; text-decoration: underline; }

/* alert restyle */
:deep(.v-alert) {
  background: rgba(239, 68, 68, 0.10);
  border: 1px solid rgba(239, 68, 68, 0.30);
  color: #b91c1c;
}
:deep(.v-alert--type-info) {
  background: rgba(59, 130, 246, 0.10);
  border-color: rgba(59, 130, 246, 0.30);
  color: #1d4ed8;
}

/* success screen */
.success-screen { display: flex; flex-direction: column; align-items: center; text-align: center; padding: 8px 0; }
.success-ripple { position: relative; width: 96px; height: 96px; display: flex; align-items: center; justify-content: center; }
.success-ripple::before, .success-ripple::after {
  content: ""; position: absolute; border-radius: 50%; border: 2px solid #22c55e;
  animation: ripple 1.8s ease-out infinite;
}
.success-ripple::before { inset: 0; opacity: 0; animation-delay: 0s; }
.success-ripple::after { inset: 0; opacity: 0; animation-delay: 0.6s; }
.success-check {
  width: 80px; height: 80px; border-radius: 50%;
  background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%);
  display: flex; align-items: center; justify-content: center;
  box-shadow: 0 14px 40px rgba(34, 197, 94, 0.35), inset 0 1px 0 rgba(255, 255, 255, 0.30);
  z-index: 1;
}
@keyframes ripple { 0% { transform: scale(0.85); opacity: 0.6; } 100% { transform: scale(1.5); opacity: 0; } }

.success-card {
  background: rgba(52, 120, 246, 0.08) !important;
  border: 1px solid rgba(52, 120, 246, 0.20) !important;
  width: 100%;
}
</style>
