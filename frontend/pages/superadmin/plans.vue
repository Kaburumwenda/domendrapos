<template>
  <div class="sa-page">
    <div class="sa-header">
      <div class="sa-header__left">
        <div class="sa-header__title-icon">
          <v-icon size="26">mdi-layers-triple</v-icon>
        </div>
        <div>
          <h1 class="text-h5 font-weight-bold">Subscription Plans</h1>
          <p class="text-body-2 text-medium-emphasis">Configure pricing, features & resource limits for each tier</p>
        </div>
      </div>
      <div class="sa-header__actions">
        <v-btn color="primary" prepend-icon="mdi-plus" @click="openCreate">New Plan</v-btn>
        <v-btn variant="tonal" prepend-icon="mdi-refresh" :loading="loading" @click="loadPlans">Refresh</v-btn>
      </div>
    </div>

    <div v-if="loading && !plans.length" class="sa-skeleton">
      <div class="sa-kpi-grid">
        <v-skeleton-loader v-for="n in 4" :key="n" type="article" class="sa-skel-kpi" boilerplate />
      </div>
    </div>

    <div v-else class="sa-plan-grid" style="grid-template-columns: repeat(auto-fill, minmax(280px, 1fr))">
      <div v-for="plan in plans" :key="plan.id" class="sa-card" style="margin-bottom:0">
        <div class="sa-card__header">
          <div class="sa-card__header-icon" :style="planIconStyle(plan)">
            <v-icon size="20">{{ planIcon(plan.name) }}</v-icon>
          </div>
          <div class="flex-grow-1">
            <h3 class="sa-card__title">{{ plan.name }}</h3>
            <p class="sa-card__subtitle">{{ plan.billing_cycle }}</p>
          </div>
          <v-chip :color="plan.is_active ? 'success' : 'grey'" size="x-small" variant="tonal" label>
            {{ plan.is_active ? 'Active' : 'Inactive' }}
          </v-chip>
        </div>
        <div class="sa-card__body">
          <div class="d-flex align-baseline ga-1 mb-3">
            <span style="font-size:1.75rem;font-weight:800">KSh {{ formatNum(plan.price) }}</span>
            <span class="text-body-2 text-medium-emphasis">/{{ plan.billing_cycle }}</span>
          </div>
          <div class="sa-detail-grid mb-3">
            <div class="sa-detail-field"><span class="sa-detail-field__label">Branches</span><span class="sa-detail-field__value">{{ plan.max_branches }}</span></div>
            <div class="sa-detail-field"><span class="sa-detail-field__label">Users</span><span class="sa-detail-field__value">{{ plan.max_users }}</span></div>
            <div class="sa-detail-field"><span class="sa-detail-field__label">Products</span><span class="sa-detail-field__value">{{ formatNum(plan.max_products) }}</span></div>
            <div class="sa-detail-field"><span class="sa-detail-field__label">ID</span><span class="sa-detail-field__value">#{{ plan.id }}</span></div>
          </div>
          <div v-if="plan.features && Object.keys(plan.features).length" class="mb-3">
            <p class="text-caption text-medium-emphasis mb-1">FEATURES</p>
            <div class="d-flex flex-wrap ga-1">
              <v-chip v-for="(v, k) in plan.features" :key="k" size="x-small" variant="tonal" color="primary" label>
                {{ k }}: {{ v }}
              </v-chip>
            </div>
          </div>
          <div class="d-flex ga-2">
            <v-btn size="small" variant="outlined" prepend-icon="mdi-pencil" @click="openEdit(plan)">Edit</v-btn>
            <v-btn size="small" variant="text" color="error" prepend-icon="mdi-delete" @click="deletePlan(plan)">Delete</v-btn>
          </div>
        </div>
      </div>

      <div v-if="!plans.length" class="sa-empty" style="grid-column:1/-1">
        <v-icon size="48" color="grey-lighten-1">mdi-layers-off-outline</v-icon>
        <p class="text-body-1 text-medium-emphasis mt-2">No subscription plans yet</p>
        <v-btn color="primary" class="mt-3" prepend-icon="mdi-plus" @click="openCreate">Create first plan</v-btn>
      </div>
    </div>

    <!-- Create/Edit dialog -->
    <v-dialog v-model="dialogOpen" max-width="560">
      <v-card rounded="xl">
        <v-card-title class="text-h6 font-weight-bold pa-5 pb-2">
          {{ editing ? 'Edit Plan' : 'New Subscription Plan' }}
        </v-card-title>
        <v-card-text class="px-5 pb-2">
          <v-text-field v-model="form.name" label="Plan name" variant="outlined" density="compact" class="mb-3" />
          <div class="d-flex ga-3 mb-3">
            <v-text-field v-model.number="form.price" type="number" label="Price (KSh)" variant="outlined" density="compact" />
            <v-select v-model="form.billing_cycle" :items="['monthly', 'quarterly', 'yearly']" label="Cycle" variant="outlined" density="compact" />
          </div>
          <div class="d-flex ga-3 mb-3">
            <v-text-field v-model.number="form.max_branches" type="number" label="Max Branches" variant="outlined" density="compact" />
            <v-text-field v-model.number="form.max_users" type="number" label="Max Users" variant="outlined" density="compact" />
            <v-text-field v-model.number="form.max_products" type="number" label="Max Products" variant="outlined" density="compact" />
          </div>
          <v-textarea v-model="featuresText" label="Features (JSON)" variant="outlined" density="compact" rows="3"
            placeholder='{"pos": true, "reports": true}' class="mb-1" />
          <v-switch v-model="form.is_active" label="Active" color="success" density="compact" inset />
        </v-card-text>
        <v-card-actions class="pa-5 pt-2">
          <v-spacer />
          <v-btn variant="text" @click="dialogOpen = false">Cancel</v-btn>
          <v-btn color="primary" :loading="saving" @click="savePlan">{{ editing ? 'Save Changes' : 'Create Plan' }}</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ middleware: 'auth' })
const toast = useToast()

const loading = ref(false)
const saving = ref(false)
const plans = ref<any[]>([])
const dialogOpen = ref(false)
const editing = ref<number | null>(null)
const featuresText = ref('{}')

const form = reactive({
  name: '',
  price: 0,
  billing_cycle: 'monthly',
  max_branches: 1,
  max_users: 5,
  max_products: 500,
  is_active: true,
})

function planIcon(name: string): string {
  const n = (name || '').toLowerCase()
  if (n.includes('free')) return 'mdi-package-variant'
  if (n.includes('start')) return 'mdi-rocket-launch'
  if (n.includes('busi')) return 'mdi-briefcase'
  if (n.includes('enter')) return 'mdi-domain'
  return 'mdi-layers'
}
function planIconStyle(plan: any): Record<string, string> {
  const n = (plan.name || '').toLowerCase()
  const c = n.includes('free') ? '#94a3b8' : n.includes('start') ? '#3b82f6' : n.includes('busi') ? '#8b5cf6' : n.includes('enter') ? '#f59e0b' : '#10b981'
  return { background: c + '22', color: c }
}
function formatNum(v: any): string {
  return Number(v || 0).toLocaleString('en-US')
}

function openCreate() {
  editing.value = null
  Object.assign(form, { name: '', price: 0, billing_cycle: 'monthly', max_branches: 1, max_users: 5, max_products: 500, is_active: true })
  featuresText.value = '{}'
  dialogOpen.value = true
}

function openEdit(plan: any) {
  editing.value = plan.id
  Object.assign(form, {
    name: plan.name, price: Number(plan.price), billing_cycle: plan.billing_cycle,
    max_branches: plan.max_branches, max_users: plan.max_users, max_products: plan.max_products,
    is_active: plan.is_active,
  })
  featuresText.value = JSON.stringify(plan.features || {}, null, 0)
  dialogOpen.value = true
}

async function loadPlans() {
  loading.value = true
  try {
    const data = await useApi()('/billing/plans/')
    plans.value = data.results || data || []
  } catch {
    toast.error('Failed to load plans')
  } finally {
    loading.value = false
  }
}

async function savePlan() {
  let features: any = {}
  try { features = JSON.parse(featuresText.value || '{}') }
  catch { toast.error('Features must be valid JSON'); return }
  saving.value = true
  const payload = { ...form, features }
  try {
    if (editing.value) {
      await useApi()(`/billing/plans/${editing.value}/`, { method: 'PATCH', body: payload })
      toast.success('Plan updated')
    } else {
      await useApi()('/billing/plans/', { method: 'POST', body: payload })
      toast.success('Plan created')
    }
    dialogOpen.value = false
    await loadPlans()
  } catch {
    toast.error('Failed to save plan')
  } finally {
    saving.value = false
  }
}

async function deletePlan(plan: any) {
  if (!confirm(`Delete plan "${plan.name}"? This cannot be undone.`)) return
  try {
    await useApi()(`/billing/plans/${plan.id}/`, { method: 'DELETE' })
    toast.success('Plan deleted')
    await loadPlans()
  } catch {
    toast.error('Failed to delete plan')
  }
}

onMounted(loadPlans)
</script>
