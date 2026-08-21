<template>
  <div class="pa-4">
    <div class="d-flex align-center mb-4 flex-wrap ga-3">
      <v-btn to="/pos" variant="text" prepend-icon="mdi-arrow-left">POS</v-btn>
      <h2 class="text-h5 font-weight-bold">Parked Sales</h2>
      <v-btn variant="tonal" size="small" prepend-icon="mdi-refresh" @click="loadData">Refresh</v-btn>
    </div>

    <v-text-field v-model="searchText" prepend-inner-icon="mdi-magnify" placeholder="Search by customer or phone..." density="compact" variant="outlined" hide-details class="mb-4" />

    <div v-if="loading" class="d-flex justify-center pa-8"><v-progress-circular indeterminate color="primary" /></div>
    <div v-else-if="filtered.length === 0" class="text-center py-12 text-medium-emphasis">
      <v-icon size="48" color="grey-lighten-1">mdi-tray-remove</v-icon>
      <p class="mt-2">No parked sales</p>
    </div>
    <v-row v-else>
      <v-col v-for="p in filtered" :key="p.id" cols="12" md="6" lg="4">
        <v-card rounded="xl" variant="outlined" class="pa-3">
          <div class="d-flex justify-space-between align-center mb-2">
            <v-chip color="warning" variant="flat" size="small"><v-icon start size="14">mdi-pause</v-icon>Park #{{ p.id }}</v-chip>
            <v-chip size="small" variant="tonal">{{ p.item_count }} items</v-chip>
          </div>
          <p class="font-weight-medium">{{ p.customer_name || 'Walk-in' }}</p>
          <p class="text-caption text-medium-emphasis" v-if="p.customer_phone"><v-icon size="12">mdi-phone</v-icon> {{ p.customer_phone }}</p>
          <p class="text-caption text-medium-emphasis"><v-icon size="12">mdi-account-tie</v-icon> {{ p.cashier_name }}</p>
          <p class="text-caption text-medium-emphasis"><v-icon size="12">mdi-clock</v-icon> {{ new Date(p.created_at).toLocaleString() }}</p>
          <p class="text-caption" :class="expiryClass(p.expires_at)"><v-icon size="12">mdi-timer-sand</v-icon> Auto-removed {{ expiryLabel(p.expires_at) }}</p>
          <div class="d-flex justify-space-between align-center mt-2">
            <span class="text-h6 font-weight-bold text-primary">{{ formatMoney(p.total) }}</span>
            <div class="d-flex ga-1">
              <v-btn size="small" color="success" variant="flat" prepend-icon="mdi-play" @click="resume(p)">Resume</v-btn>
              <v-btn size="small" color="error" variant="text" icon="mdi-delete" @click="deleteParked(p)" />
            </div>
          </div>
        </v-card>
      </v-col>
    </v-row>

    <v-dialog v-model="deleteDialog" max-width="400">
      <v-card rounded="xl">
        <v-card-title class="text-h6 text-error">Delete Parked Sale?</v-card-title>
        <v-card-text>Are you sure you want to delete Park #{{ deleteTarget?.id }} for {{ deleteTarget?.customer_name || 'Walk-in' }} ({{ formatMoney(deleteTarget?.total) }})?</v-card-text>
        <v-card-actions><v-spacer /><v-btn variant="text" @click="deleteDialog = false">Cancel</v-btn><v-btn variant="flat" color="error" @click="confirmDelete">Delete</v-btn></v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup>
definePageMeta({ middleware: 'auth' })
const { currency } = useFormat()
function formatMoney(v) { return currency(v) }

const loading = ref(false)
const parked = ref([])
const searchText = ref('')
const deleteDialog = ref(false)
const deleteTarget = ref(null)

function expiryLabel(expiresAt) {
  if (!expiresAt) return ''
  const diff = new Date(expiresAt).getTime() - Date.now()
  if (diff <= 0) return 'soon'
  const h = Math.floor(diff / 3600000)
  if (h >= 1) return `in ${h}h`
  const m = Math.floor(diff / 60000)
  return `in ${m}m`
}

function expiryClass(expiresAt) {
  if (!expiresAt) return 'text-medium-emphasis'
  const diff = new Date(expiresAt).getTime() - Date.now()
  if (diff <= 3600000) return 'text-error font-weight-medium'      // < 1h
  if (diff <= 21600000) return 'text-warning font-weight-medium'   // < 6h
  return 'text-medium-emphasis'
}

const filtered = computed(() => {
  if (!searchText.value) return parked.value
  const s = searchText.value.toLowerCase()
  return parked.value.filter(p => p.customer_name?.toLowerCase().includes(s) || p.customer_phone?.includes(s))
})

async function loadData() {
  loading.value = true
  try {
    const data = await useApi()('/pos/parked-sales/?page_size=200')
    parked.value = data.results || data
  } catch { /* ignore */ } finally {
    loading.value = false
  }
}

function resume(p) {
  sessionStorage.setItem('pos_resume_parked', JSON.stringify(p))
  navigateTo('/pos')
}

function deleteParked(p) {
  deleteTarget.value = p
  deleteDialog.value = true
}

async function confirmDelete() {
  try {
    await useApi()(`/pos/parked-sales/${deleteTarget.value.id}/`, { method: 'DELETE' })
    parked.value = parked.value.filter(p => p.id !== deleteTarget.value.id)
    deleteDialog.value = false
  } catch { /* ignore */ }
}

onMounted(loadData)
</script>
