<template>
  <div class="sa-page">
    <div class="sa-header">
      <div class="sa-header__left">
        <div class="sa-header__title-icon">
          <v-icon size="26">mdi-cog-outline</v-icon>
        </div>
        <div>
          <h1 class="text-h5 font-weight-bold">Gateway Settings</h1>
          <p class="text-body-2 text-medium-emphasis">M-Pesa payment gateway configuration for the platform</p>
        </div>
      </div>
      <div class="sa-header__actions">
        <v-btn variant="tonal" prepend-icon="mdi-refresh" :loading="loading" @click="loadConfig">Reload</v-btn>
      </div>
    </div>

    <div v-if="loading && !config" class="sa-skeleton">
      <v-skeleton-loader type="article" class="sa-skel-kpi" boilerplate />
    </div>

    <template v-else>
      <div class="sa-two-col" style="grid-template-columns: 2fr 1fr">
        <!-- Config form -->
        <div class="sa-card">
          <div class="sa-card__header">
            <div class="sa-card__header-icon sa-card__header-icon--green">
              <v-icon size="20">mdi-cellphone-link</v-icon>
            </div>
            <div>
              <h3 class="sa-card__title">M-Pesa Gateway Config</h3>
              <p class="sa-card__subtitle">Safaricom Daraja STK Push integration</p>
            </div>
          </div>
          <div class="sa-card__body">
            <v-text-field v-model="form.name" label="Config name" variant="outlined" density="compact" class="mb-3" />
            <v-text-field v-model="form.stk_push_url" label="STK Push URL" variant="outlined" density="compact" class="mb-3"
              placeholder="https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest" />
            <v-text-field v-model="form.confirm_url" label="Confirm / Callback URL" variant="outlined" density="compact" class="mb-3"
              placeholder="https://your-domain.com/api/usage-billing/payments/mpesa/confirm/" />
            <v-text-field v-model="form.source" label="Source (shortcode)" variant="outlined" density="compact" class="mb-3" />
            <div class="d-flex ga-3 mb-3">
              <v-text-field v-model.number="form.request_timeout_seconds" type="number" label="Request timeout (s)" variant="outlined" density="compact" />
              <v-text-field v-model.number="form.poll_interval_seconds" type="number" label="Poll interval (s)" variant="outlined" density="compact" />
            </div>
            <v-switch v-model="form.is_active" label="Gateway active" color="success" density="compact" inset class="mb-4" />

            <div class="d-flex ga-2">
              <v-btn color="primary" prepend-icon="mdi-content-save" :loading="saving" @click="saveConfig">Save Configuration</v-btn>
              <v-btn variant="text" @click="resetForm">Reset</v-btn>
            </div>
          </div>
        </div>

        <!-- Status sidebar -->
        <div class="sa-card" style="margin-bottom:0">
          <div class="sa-card__header">
            <div class="sa-card__header-icon" :style="{ background: config?.is_active ? 'rgba(34,197,94,0.14)' : 'rgba(148,163,184,0.14)', color: config?.is_active ? 'rgb(34,197,94)' : 'rgb(148,163,184)' }">
              <v-icon size="20">{{ config?.is_active ? 'mdi-check-circle' : 'mdi-close-circle' }}</v-icon>
            </div>
            <div>
              <h3 class="sa-card__title">Gateway Status</h3>
              <p class="sa-card__subtitle">{{ config?.is_active ? 'Active & processing' : 'Inactive' }}</p>
            </div>
          </div>
          <div class="sa-card__body">
            <div class="sa-detail-grid">
              <div class="sa-detail-field"><span class="sa-detail-field__label">Updated by</span><span class="sa-detail-field__value">{{ config?.updated_by_email || '—' }}</span></div>
              <div class="sa-detail-field"><span class="sa-detail-field__label">Last update</span><span class="sa-detail-field__value">{{ config?.updated_at ? formatTime(config.updated_at) : '—' }}</span></div>
              <div class="sa-detail-field"><span class="sa-detail-field__label">Created</span><span class="sa-detail-field__value">{{ config?.created_at ? formatTime(config.created_at) : '—' }}</span></div>
              <div class="sa-detail-field"><span class="sa-detail-field__label">Config ID</span><span class="sa-detail-field__value">#{{ config?.id ?? '—' }}</span></div>
            </div>
          </div>
        </div>
      </div>

      <!-- Notes -->
      <div class="sa-card">
        <div class="sa-card__header">
          <div class="sa-card__header-icon sa-card__header-icon--amber">
            <v-icon size="20">mdi-information-outline</v-icon>
          </div>
          <div>
            <h3 class="sa-card__title">Notes</h3>
            <p class="sa-card__subtitle">How the gateway config is used</p>
          </div>
        </div>
        <div class="sa-card__body">
          <v-alert type="info" variant="tonal" density="compact" class="mb-2">
            This configuration controls M-Pesa STK Push payments for all tenants. The <strong>confirm URL</strong> must be publicly
            reachable so Safaricom can send transaction callbacks.
          </v-alert>
          <v-alert type="warning" variant="tonal" density="compact">
            Changes take effect immediately for new payment attempts. Pending transactions are not affected.
          </v-alert>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ middleware: 'auth' })
const toast = useToast()

const loading = ref(false)
const saving = ref(false)
const config = ref<any>(null)

const form = reactive({
  name: '',
  stk_push_url: '',
  confirm_url: '',
  source: '',
  is_active: true,
  request_timeout_seconds: 30,
  poll_interval_seconds: 5,
})

function fillForm(c: any) {
  Object.assign(form, {
    name: c.name || '',
    stk_push_url: c.stk_push_url || '',
    confirm_url: c.confirm_url || '',
    source: c.source || '',
    is_active: c.is_active ?? true,
    request_timeout_seconds: c.request_timeout_seconds ?? 30,
    poll_interval_seconds: c.poll_interval_seconds ?? 5,
  })
}

function resetForm() {
  if (config.value) fillForm(config.value)
}

function formatTime(v: string): string {
  return new Date(v).toLocaleString('en-GB', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
}

async function loadConfig() {
  loading.value = true
  try {
    config.value = await useApi()('/usage-billing/admin/payment-config/')
    fillForm(config.value)
  } catch {
    toast.error('Failed to load gateway config')
  } finally {
    loading.value = false
  }
}

async function saveConfig() {
  saving.value = true
  try {
    config.value = await useApi()('/usage-billing/admin/payment-config/', { method: 'PUT', body: form })
    fillForm(config.value)
    toast.success('Gateway configuration saved')
  } catch {
    toast.error('Failed to save configuration')
  } finally {
    saving.value = false
  }
}

onMounted(loadConfig)
</script>
