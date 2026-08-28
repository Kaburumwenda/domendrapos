<template>
  <v-container class="pa-0" fluid>
    <!-- Breadcrumb / back -->
    <div class="d-flex align-center ga-2 mb-4 flex-wrap">
      <v-btn variant="text" size="small" prepend-icon="mdi-arrow-left" @click="goBack">
        Back to Purchase Orders
      </v-btn>
      <v-icon size="14" class="text-disabled">mdi-chevron-right</v-icon>
      <span class="text-body-2 text-medium-emphasis">Excel Import / Export</span>
    </div>

    <!-- Page header -->
    <v-row class="d-flex align-center justify-space-between mb-6">
      <v-col cols="12" sm="7">
        <div class="d-flex align-center ga-3">
          <v-avatar color="success" size="48" rounded="lg">
            <v-icon size="26">mdi-microsoft-excel</v-icon>
          </v-avatar>
          <div>
            <div class="text-h5 font-weight-bold">Excel Import / Export</div>
            <div class="text-body-2 text-medium-emphasis">
              Bulk upload &amp; export purchase orders via .xlsx workbook
            </div>
          </div>
        </div>
      </v-col>
      <v-col cols="12" sm="5" class="d-flex justify-end ga-2 flex-wrap">
        <v-btn variant="outlined" prepend-icon="mdi-clipboard-list-outline" @click="navigateTo('/purchase-orders')">
          View Purchase Orders
        </v-btn>
      </v-col>
    </v-row>

    <!-- Mode toggle card -->
    <v-card rounded="xl" flat border class="mb-6 overflow-hidden">
      <v-tabs v-model="mode" color="success" density="comfortable" show-arrows>
        <v-tab value="import" prepend-icon="mdi-file-import-outline">Import</v-tab>
        <v-tab value="export" prepend-icon="mdi-file-export-outline">Export</v-tab>
      </v-tabs>
    </v-card>

    <v-window v-model="mode">
      <!-- ===================== IMPORT MODE ===================== -->
      <v-window-item value="import">
        <!-- Step 1: Template download -->
        <v-card rounded="xl" flat border class="pa-6 mb-6">
          <div class="d-flex align-center ga-3 mb-4 flex-wrap">
            <v-avatar color="primary-lighten-5" size="36" rounded="lg">
              <v-icon color="primary" size="20">mdi-numeric-1-circle</v-icon>
            </v-avatar>
            <div>
              <div class="text-h6 font-weight-bold">Download the Template</div>
              <div class="text-body-2 text-medium-emphasis">
                Pre-fill the workbook so column headers are recognized correctly
              </div>
            </div>
            <v-spacer />
            <v-btn color="primary" variant="outlined" prepend-icon="mdi-download"
              @click="downloadTemplate" :loading="downloadingTemplate" size="large">
              Download Template (.xlsx)
            </v-btn>
          </div>
          <v-alert type="info" variant="tonal" density="compact" rounded="lg">
            Each row maps to one PO line item. Group rows with the same PO Number to create one PO with multiple lines.
            <strong>PO Number is optional</strong> — blank = auto-generated.
          </v-alert>
        </v-card>

        <!-- Step 2: Upload -->
        <v-card rounded="xl" flat border class="pa-6 mb-6">
          <div class="d-flex align-center ga-3 mb-5 flex-wrap">
            <v-avatar color="primary-lighten-5" size="36" rounded="lg">
              <v-icon color="primary" size="20">mdi-numeric-2-circle</v-icon>
            </v-avatar>
            <div>
              <div class="text-h6 font-weight-bold">Upload &amp; Preview</div>
              <div class="text-body-2 text-medium-emphasis">
                Drag &amp; drop your completed workbook — review &amp; edit rows before saving
              </div>
            </div>
          </div>

          <div
            class="upload-zone d-flex flex-column align-center justify-center ga-4 pa-10 mb-5 cursor-pointer"
            :class="{ 'upload-zone-active': isDragging, 'upload-zone-has-file': selectedFile }"
            @click="openFileDialog"
            @dragover.prevent="isDragging = true"
            @dragenter.prevent="isDragging = true"
            @dragleave.prevent="isDragging = false"
            @drop.prevent="onDrop"
          >
            <input ref="fileInput" type="file" accept=".xlsx,.xlsm" hidden @change="onFileSelected" />
            <v-avatar :color="selectedFile ? 'success-lighten-5' : 'grey-lighten-3'" size="72" rounded="xl">
              <v-icon :color="selectedFile ? 'success' : 'grey'" size="40">
                {{ selectedFile ? 'mdi-microsoft-excel' : 'mdi-cloud-upload-outline' }}
              </v-icon>
            </v-avatar>
            <template v-if="!selectedFile">
              <div class="text-h6 font-weight-bold">Drop your .xlsx here or <span class="text-primary">browse</span></div>
              <div class="text-body-2 text-medium-emphasis">Only .xlsx files · max 20MB · PO Number optional</div>
            </template>
            <template v-else>
              <div class="text-h6 font-weight-bold" style="word-break: break-all;">{{ selectedFile.name }}</div>
              <div class="text-body-2 text-medium-emphasis">{{ formatSize(selectedFile.size) }}</div>
            </template>
          </div>

          <div v-if="selectedFile" class="d-flex ga-3 flex-wrap">
            <v-btn color="primary" prepend-icon="mdi-eye-outline" :loading="parsing"
              :disabled="parsing || !!preview" block size="large" @click="parseFile">
              Preview &amp; Edit
            </v-btn>
            <v-btn variant="outlined" icon="mdi-close" size="large" @click="resetFile"
              :disabled="parsing || saving" aria-label="Remove file" />
          </div>
        </v-card>

        <!-- Step 3: Preview & Edit -->
        <v-scale-transition>
          <v-card v-if="preview" rounded="xl" flat border class="pa-6 mb-6">
            <div class="d-flex align-center ga-3 mb-5 flex-wrap">
              <v-avatar color="success-lighten-5" size="36" rounded="lg">
                <v-icon color="success" size="20">mdi-numeric-3-circle</v-icon>
              </v-avatar>
              <div>
                <div class="text-h6 font-weight-bold">Preview &amp; Edit Rows</div>
                <div class="text-body-2 text-medium-emphasis">
                  {{ previewRows.length }} row(s) · {{ preview.skipped }} empty row(s) skipped · rows with the same PO Number create one PO
                </div>
              </div>
              <v-spacer />
              <v-btn variant="text" size="small" prepend-icon="mdi-plus" @click="addRow" :disabled="saving">Add Row</v-btn>
              <v-btn variant="text" size="small" color="error" prepend-icon="mdi-close" @click="cancelPreview" :disabled="saving">Cancel</v-btn>
            </div>

            <v-alert v-if="parseErrors.length > 0" type="warning" variant="tonal" density="compact" class="mb-4" rounded="lg">
              {{ parseErrors.length }} parse warning(s). Rows with unknown supplier/branch/product codes are highlighted — fix or remove them before saving.
            </v-alert>

            <div class="overflow-x-auto">
              <v-table density="compact" class="preview-table">
                <thead class="bg-grey-lighten-4">
                  <tr>
                    <th style="min-width: 40px;">#</th>
                    <th style="min-width: 130px;">PO Number</th>
                    <th style="min-width: 120px;">Supplier Code *</th>
                    <th style="min-width: 120px;">Supplier Name</th>
                    <th style="min-width: 110px;">Branch Code *</th>
                    <th style="min-width: 120px;">Status</th>
                    <th style="min-width: 120px;">Product SKU *</th>
                    <th style="min-width: 100px;">Qty *</th>
                    <th style="min-width: 100px;">Unit Cost *</th>
                    <th style="min-width: 100px;">Retail Price</th>
                    <th style="min-width: 90px;">Tax %</th>
                    <th style="min-width: 90px;">Notes</th>
                    <th style="min-width: 56px;"></th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(row, i) in previewRows" :key="i"
                    :class="rowInvalid(row) ? 'bg-error-lighten-5' : ''">
                    <td class="text-caption text-disabled">{{ i + 1 }}</td>
                    <td><v-text-field v-model="row.po_number" variant="outlined" density="compact" hide-details placeholder="auto" class="preview-input" /></td>
                    <td><v-text-field v-model="row.supplier_code" variant="outlined" density="compact" hide-details class="preview-input" /></td>
                    <td><span class="text-body-2">{{ row._supplier_name || '—' }}</span></td>
                    <td><v-text-field v-model="row.branch_code" variant="outlined" density="compact" hide-details class="preview-input" /></td>
                    <td>
                      <v-select v-model="row.status" :items="statusOptions" variant="outlined" density="compact" hide-details class="preview-input" />
                    </td>
                    <td><v-text-field v-model="row.product_sku" variant="outlined" density="compact" hide-details class="preview-input" /></td>
                    <td><v-text-field v-model="row.quantity_ordered" type="number" step="1" variant="outlined" density="compact" hide-details class="preview-input" /></td>
                    <td><v-text-field v-model="row.unit_cost" type="number" step="0.01" variant="outlined" density="compact" hide-details class="preview-input" /></td>
                    <td><v-text-field v-model="row.retail_price" type="number" step="0.01" variant="outlined" density="compact" hide-details class="preview-input" /></td>
                    <td><v-text-field v-model="row.tax_rate" type="number" step="0.01" variant="outlined" density="compact" hide-details class="preview-input" /></td>
                    <td><v-text-field v-model="row.notes" variant="outlined" density="compact" hide-details class="preview-input" /></td>
                    <td><v-btn icon="mdi-delete" size="small" variant="text" color="error" @click="removeRow(i)" /></td>
                  </tr>
                </tbody>
              </v-table>
            </div>

            <div class="d-flex align-center ga-3 mt-5 flex-wrap">
              <v-btn color="success" prepend-icon="mdi-content-save" :loading="saving"
                :disabled="saving || previewRows.length === 0" size="large" @click="saveBulk">
                Save {{ poCount }} PO(s) ({{ previewRows.length }} line(s))
              </v-btn>
              <span v-if="emptyPoCount > 0" class="text-body-2 text-medium-emphasis">
                {{ emptyPoCount }} row(s) will get auto-generated PO numbers when saved
              </span>
            </div>
          </v-card>
        </v-scale-transition>

        <!-- Result Summary -->
        <v-slide-y-transition>
          <v-card v-if="importResult" rounded="xl" flat border class="pa-6" :style="resultBorderStyle">
            <div class="d-flex align-center ga-3 mb-5 flex-wrap">
              <v-avatar :color="importResult.failed > 0 ? 'warning-lighten-5' : 'success-lighten-5'" size="48" rounded="lg">
                <v-icon :color="importResult.failed > 0 ? 'warning' : 'success'" size="28">
                  {{ importResult.failed > 0 ? 'mdi-alert' : 'mdi-check-circle' }}
                </v-icon>
              </v-avatar>
              <div>
                <div class="text-h6 font-weight-bold">
                  {{ importResult.failed > 0 ? 'Import Finished (with issues)' : 'Import Successful' }}
                </div>
                <div class="text-body-2 text-medium-emphasis">
                  {{ importResult.created }} PO(s) created · {{ importResult.lines_created || 0 }} line item(s) added
                </div>
              </div>
              <v-spacer />
              <v-btn v-if="importResult.failed === 0" color="success" prepend-icon="mdi-clipboard-list-outline" @click="navigateTo('/purchase-orders?imported=1')">
                View Purchase Orders
              </v-btn>
              <v-btn variant="text" prepend-icon="mdi-refresh" @click="resetAll">Start Over</v-btn>
            </div>
            <v-row density="comfortable" class="mb-5">
              <v-col cols="6" sm="3"><v-card variant="outlined" rounded="lg" class="pa-4 text-center" flat><div class="text-caption text-medium-emphasis text-uppercase">POs Created</div><div class="text-h4 font-weight-bold text-success mt-1">{{ importResult.created }}</div></v-card></v-col>
              <v-col cols="6" sm="3"><v-card variant="outlined" rounded="lg" class="pa-4 text-center" flat><div class="text-caption text-medium-emphasis text-uppercase">Lines Added</div><div class="text-h4 font-weight-bold text-primary mt-1">{{ importResult.lines_created || 0 }}</div></v-card></v-col>
              <v-col cols="6" sm="3"><v-card variant="outlined" rounded="lg" class="pa-4 text-center" flat><div class="text-caption text-medium-emphasis text-uppercase">Failed</div><div class="text-h4 font-weight-bold mt-1" :class="importResult.failed > 0 ? 'text-error' : 'text-disabled'">{{ importResult.failed }}</div></v-card></v-col>
              <v-col cols="6" sm="3"><v-card variant="outlined" rounded="lg" class="pa-4 text-center" flat><div class="text-caption text-medium-emphasis text-uppercase">Processed</div><div class="text-h4 font-weight-bold mt-1">{{ importResult.total_processed }}</div></v-card></v-col>
            </v-row>
            <div v-if="importResult.errors && importResult.errors.length > 0">
              <div class="d-flex align-center ga-2 mb-3">
                <v-icon size="18" color="error">mdi-alert-circle-outline</v-icon>
                <span class="text-body-1 font-weight-bold">Errors ({{ importResult.errors.length }}{{ importResult.errors_truncated ? '+' : '' }})</span>
              </div>
              <v-list variant="outlined" rounded="lg" density="compact" class="bg-surface" max-height="320" lines="two">
                <v-list-item v-for="(err, idx) in importResult.errors" :key="idx">
                  <template #prepend>
                    <v-avatar color="error-lighten-5" size="32" rounded="lg"><span class="text-caption font-weight-bold text-error">#{{ err.row }}</span></v-avatar>
                  </template>
                  <v-list-item-title class="text-body-2 font-weight-bold" v-if="err.po">PO: {{ err.po }}</v-list-item-title>
                  <v-list-item-subtitle class="text-body-2 text-error">{{ err.detail }}</v-list-item-subtitle>
                </v-list-item>
              </v-list>
            </div>
          </v-card>
        </v-slide-y-transition>
      </v-window-item>

      <!-- ===================== EXPORT MODE ===================== -->
      <v-window-item value="export">
        <v-row>
          <v-col cols="12" lg="7">
            <v-card rounded="xl" flat border class="pa-6 h-100">
              <div class="d-flex align-center ga-3 mb-5">
                <v-avatar color="success-lighten-5" size="48" rounded="lg">
                  <v-icon color="success" size="26">mdi-file-excel-outline</v-icon>
                </v-avatar>
                <div>
                  <div class="text-h6 font-weight-bold">Export Purchase Orders to Excel</div>
                  <div class="text-body-2 text-medium-emphasis">Download all POs with line items as a formatted .xlsx file</div>
                </div>
              </div>
              <v-list density="compact" class="bg-transparent px-0 mb-4">
                <v-list-item class="px-0" v-for="info in exportInfo" :key="info.title">
                  <template #prepend><v-icon :color="info.color" size="22">{{ info.icon }}</v-icon></template>
                  <v-list-item-title class="text-body-1 font-weight-medium">{{ info.title }}</v-list-item-title>
                  <v-list-item-subtitle class="text-body-2 text-medium-emphasis">{{ info.subtitle }}</v-list-item-subtitle>
                </v-list-item>
              </v-list>
              <v-btn color="success" prepend-icon="mdi-microsoft-excel" block size="x-large" :loading="exporting" @click="doExport">
                Download .xlsx
              </v-btn>
            </v-card>
          </v-col>
          <v-col cols="12" lg="5">
            <v-card rounded="xl" flat border class="pa-6 h-100">
              <div class="text-h6 font-weight-bold mb-4"><v-icon class="mr-1" color="primary">mdi-filter-variant</v-icon>Active Filters</div>
              <div v-if="activeFilterChips.length === 0" class="text-body-2 text-medium-emphasis pa-4 text-center">No filters active — export will include all purchase orders.</div>
              <div v-else class="d-flex flex-wrap ga-2">
                <v-chip v-for="chip in activeFilterChips" :key="chip.label" size="small" :color="chip.color" variant="tonal">{{ chip.label }}</v-chip>
              </div>
              <v-alert type="info" variant="tonal" density="compact" class="mt-5" rounded="lg">
                Filters carried over from the Purchase Orders page. Return there to change them, then re-open Import / Export.
              </v-alert>
              <v-btn variant="text" color="primary" prepend-icon="mdi-arrow-left" class="mt-2" @click="navigateTo('/purchase-orders')">Back to Purchase Orders</v-btn>
            </v-card>
          </v-col>
        </v-row>
      </v-window-item>
    </v-window>
  </v-container>
</template>

<script setup>
definePageMeta({ middleware: 'auth' })

const route = useRoute()
const router = useRouter()
const toast = useToast()

const mode = ref('import')

const fileInput = ref(null)
const selectedFile = ref(null)
const isDragging = ref(false)
const parsing = ref(false)
const preview = ref(null)
const previewRows = ref([])
const parseErrors = ref([])
const saving = ref(false)
const importResult = ref(null)
const downloadingTemplate = ref(false)
const exporting = ref(false)

const API_BASE = '/purchasing/orders'

const statusOptions = computed(() => preview.value?.statuses || ['draft', 'submitted', 'approved', 'sent', 'received', 'cancelled'])

const resultBorderStyle = computed(() => {
  if (!importResult.value) return ''
  return importResult.value.failed > 0
    ? 'border-left: 4px solid rgb(var(--v-theme-warning)) !important;'
    : 'border-left: 4px solid rgb(var(--v-theme-success)) !important;'
})

const emptyPoCount = computed(() =>
  previewRows.value.filter(r => !r.po_number || !String(r.po_number).trim()).length
)

const poCount = computed(() => {
  const set = new Set(previewRows.value.map(r => r.po_number).filter(Boolean))
  return set.size
})

function rowInvalid(row) {
  if (!row.supplier_code || !String(row.supplier_code).trim()) return true
  if (!row.branch_code || !String(row.branch_code).trim()) return true
  if (!row.product_sku || !String(row.product_sku).trim()) return true
  if (!row.quantity_ordered) return true
  if (!row.unit_cost) return true
  return false
}

const exportInfo = [
  { icon: 'mdi-format-columns', color: 'indigo', title: 'One row per line item', subtitle: 'PO header columns repeated for each line' },
  { icon: 'mdi-format-columns', color: 'purple', title: 'Formatted columns', subtitle: 'Headers, frozen panes, right-aligned numeric columns' },
  { icon: 'mdi-clipboard-list-outline', color: 'success', title: 'All purchase orders', subtitle: 'No pagination limit — exports everything' },
]

const exportParams = computed(() => {
  const params = {}
  const q = route.query
  if (q.search) params.search = q.search
  if (q.status) params.status = q.status
  if (q.supplier) params.supplier = q.supplier
  if (q.branch) params.branch = q.branch
  return params
})

const activeFilterChips = computed(() => {
  const chips = []
  const q = route.query
  if (q.search) chips.push({ label: `Search: "${q.search}"`, color: 'primary' })
  if (q.status) chips.push({ label: `Status: ${q.status}`, color: 'amber' })
  if (q.supplier) chips.push({ label: `Supplier: ${q.supplier}`, color: 'indigo' })
  if (q.branch) chips.push({ label: `Branch: ${q.branch}`, color: 'cyan' })
  return chips
})

function goBack() { router.push('/purchase-orders') }

function openFileDialog() { fileInput.value?.click() }
function onFileSelected(e) { const file = e.target.files?.[0]; if (file) setFile(file) }
function onDrop(e) { isDragging.value = false; const file = e.dataTransfer?.files?.[0]; if (file) setFile(file) }

function setFile(file) {
  const name = file.name.toLowerCase()
  if (!name.endsWith('.xlsx') && !name.endsWith('.xlsm')) { toast.error('Please select an .xlsx file'); return }
  if (file.size > 20 * 1024 * 1024) { toast.error('File too large (max 20MB)'); return }
  selectedFile.value = file
  preview.value = null; previewRows.value = []; parseErrors.value = []; importResult.value = null
  if (fileInput.value) fileInput.value.value = ''
}

function resetFile() {
  selectedFile.value = null; preview.value = null; previewRows.value = []; parseErrors.value = []; importResult.value = null
  if (fileInput.value) fileInput.value.value = ''
}
function cancelPreview() { preview.value = null; previewRows.value = []; parseErrors.value = [] }
function resetAll() { resetFile(); mode.value = 'import' }

function formatSize(bytes) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
}

async function downloadTemplate() {
  downloadingTemplate.value = true
  try {
    const blob = await useApi()(`${API_BASE}/import-excel-template/`, { method: 'GET', responseType: 'blob' })
    triggerDownload(blob, 'purchase_orders_import_template.xlsx')
    toast.success('Template downloaded')
  } catch (e) { toast.error('Failed to download template') }
  finally { downloadingTemplate.value = false }
}

async function parseFile() {
  if (!selectedFile.value) return
  parsing.value = true; importResult.value = null
  const formData = new FormData()
  formData.append('file', selectedFile.value)
  try {
    const result = await useApi()(`${API_BASE}/parse-excel/`, { method: 'POST', body: formData })
    preview.value = result
    previewRows.value = result.rows
    parseErrors.value = result.errors || []
    if (result.rows.length === 0) toast.warning('No data rows found in the file')
    else toast.success(`${result.rows.length} row(s) ready for preview`)
  } catch (e) { toast.error(e?.data?.detail || 'Failed to parse file') }
  finally { parsing.value = false }
}

function addRow() {
  previewRows.value.push({
    po_number: '', supplier_code: '', branch_code: '', status: 'draft',
    product_sku: '', quantity_ordered: 0, unit_cost: 0, retail_price: 0,
    tax_rate: 0, notes: '',
  })
}
function removeRow(idx) { previewRows.value.splice(idx, 1) }

async function saveBulk() {
  if (previewRows.value.length === 0) return
  const invalid = previewRows.value.filter(r => rowInvalid(r)).length
  if (invalid > 0) { toast.error(`${invalid} row(s) missing required fields — fix or remove them`); return }
  saving.value = true
  const items = previewRows.value.map(r => {
    const out = {}
    for (const [k, v] of Object.entries(r)) { if (!k.startsWith('_')) out[k] = v }
    return out
  })
  try {
    const result = await useApi()(`${API_BASE}/bulk-upsert/`, { method: 'POST', body: { items } })
    importResult.value = result
    if (result.failed > 0) toast.warning(`Saved ${result.created} PO(s), ${result.failed} failed`)
    else toast.success(`Import complete: ${result.created} PO(s) created, ${result.lines_created || 0} lines added`)
    if (result.failed === 0) { preview.value = null; previewRows.value = []; parseErrors.value = [] }
  } catch (e) { toast.error(e?.data?.detail || 'Save failed') }
  finally { saving.value = false }
}

async function doExport() {
  exporting.value = true
  try {
    const params = new URLSearchParams()
    for (const [k, v] of Object.entries(exportParams.value)) { if (v) params.append(k, String(v)) }
    const qs = params.toString()
    const url = `${API_BASE}/export-excel/${qs ? `?${qs}` : ''}`
    const blob = await useApi()(url, { method: 'GET', responseType: 'blob' })
    const today = new Date().toISOString().slice(0, 10)
    triggerDownload(blob, `purchase_orders_export_${today}.xlsx`)
    toast.success('Export started')
  } catch (e) { toast.error('Failed to export purchase orders') }
  finally { exporting.value = false }
}

function triggerDownload(blob, filename) {
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url; link.download = filename
  document.body.appendChild(link); link.click(); document.body.removeChild(link)
  setTimeout(() => URL.revokeObjectURL(url), 1500)
}
</script>

<style scoped>
.upload-zone { border: 2px dashed rgb(var(--v-theme-primary)); border-radius: 16px; transition: all 0.2s ease; background: rgb(var(--v-theme-surface)); }
.upload-zone:hover { background: rgba(var(--v-theme-primary), 0.04); }
.upload-zone-active { border-color: rgb(var(--v-theme-primary)); background: rgba(var(--v-theme-primary), 0.08); transform: scale(1.005); }
.upload-zone-has-file { border-style: solid; border-color: rgb(var(--v-theme-success)); }
.preview-input :deep(.v-field__input) { padding: 4px 8px !important; min-height: 32px !important; font-size: 0.85rem; }
.preview-input :deep(.v-field__append-inner) { padding-top: 4px !important; }
.preview-table :deep(td) { vertical-align: middle; }
.overflow-x-auto { overflow-x: auto; }
</style>
