<template>
  <v-container class="pa-0" fluid>
    <!-- Breadcrumb / back -->
    <div class="d-flex align-center ga-2 mb-4 flex-wrap">
      <v-btn variant="text" size="small" prepend-icon="mdi-arrow-left" @click="goBack">
        Back to Stock Items
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
              Bulk upload &amp; export stock items via .xlsx workbook
            </div>
          </div>
        </div>
      </v-col>
      <v-col cols="12" sm="5" class="d-flex justify-end ga-2 flex-wrap">
        <v-btn variant="outlined" prepend-icon="mdi-package-variant-closed" to="/products">
          View Stock Items
        </v-btn>
      </v-col>
    </v-row>

    <!-- Mode toggle card -->
    <v-card rounded="xl" flat border class="mb-6 overflow-hidden">
      <v-tabs v-model="mode" color="success" density="comfortable" show-arrows>
        <v-tab value="import" prepend-icon="mdi-file-import-outline">
          Import
        </v-tab>
        <v-tab value="export" prepend-icon="mdi-file-export-outline">
          Export
        </v-tab>
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
            <v-btn
              color="primary"
              variant="outlined"
              prepend-icon="mdi-download"
              @click="downloadTemplate"
              :loading="downloadingTemplate"
              size="large"
            >
              Download Template (.xlsx)
            </v-btn>
          </div>
          <v-alert type="info" variant="tonal" density="compact" rounded="lg">
            Each row maps to one stock item. <strong>SKU is optional</strong> — blank SKUs are auto-generated. Existing SKUs are updated.
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
            <v-avatar
              :color="selectedFile ? 'success-lighten-5' : 'grey-lighten-3'"
              size="72"
              rounded="xl"
            >
              <v-icon :color="selectedFile ? 'success' : 'grey'" size="40">
                {{ selectedFile ? 'mdi-microsoft-excel' : 'mdi-cloud-upload-outline' }}
              </v-icon>
            </v-avatar>
            <template v-if="!selectedFile">
              <div class="text-h6 font-weight-bold">
                Drop your .xlsx here or <span class="text-primary">browse</span>
              </div>
              <div class="text-body-2 text-medium-emphasis">
                Only .xlsx files · max 20MB · SKU optional
              </div>
            </template>
            <template v-else>
              <div class="text-h6 font-weight-bold" style="word-break: break-all;">
                {{ selectedFile.name }}
              </div>
              <div class="text-body-2 text-medium-emphasis">{{ formatSize(selectedFile.size) }}</div>
            </template>
          </div>

          <div v-if="selectedFile" class="d-flex ga-3 flex-wrap">
            <v-btn
              color="primary"
              prepend-icon="mdi-eye-outline"
              :loading="parsing"
              :disabled="parsing || !!preview"
              block
              size="large"
              @click="parseFile"
            >
              Preview &amp; Edit
            </v-btn>
            <v-btn
              variant="outlined"
              icon="mdi-close"
              size="large"
              @click="resetFile"
              :disabled="parsing || saving"
              aria-label="Remove file"
            />
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
                  {{ preview.rows.length }} row(s) · {{ preview.skipped }} empty row(s) skipped · click any cell to edit
                </div>
              </div>
              <v-spacer />
              <v-btn
                variant="text"
                size="small"
                prepend-icon="mdi-refresh"
                @click="autoFillEmptySkus"
                :disabled="saving"
                class="mr-2"
              >
                Auto-fill empty SKUs
              </v-btn>
              <v-btn
                variant="text"
                size="small"
                prepend-icon="mdi-plus"
                @click="addRow"
                :disabled="saving"
              >
                Add Row
              </v-btn>
              <v-btn
                variant="text"
                size="small"
                color="error"
                prepend-icon="mdi-close"
                @click="cancelPreview"
                :disabled="saving"
              >
                Cancel
              </v-btn>
            </div>

            <!-- Parse errors (non-blocking — e.g. unknown categories) -->
            <v-alert
              v-if="parseErrors.length > 0"
              type="warning"
              variant="tonal"
              density="compact"
              class="mb-4"
              rounded="lg"
            >
              {{ parseErrors.length }} parse warning(s). Rows with unknown categories are highlighted red — fix the category or remove those rows before saving.
            </v-alert>

            <div class="overflow-x-auto">
              <v-table density="compact" class="preview-table">
                <thead class="bg-grey-lighten-4">
                  <tr>
                    <th style="min-width: 40px;">#</th>
                    <th style="min-width: 150px;">SKU</th>
                    <th style="min-width: 200px;">Name *</th>
                    <th style="min-width: 150px;">Barcode</th>
                    <th style="min-width: 160px;">Category</th>
                    <th style="min-width: 130px;">Type</th>
                    <th style="min-width: 150px;">Brand</th>
                    <th style="min-width: 110px;">Cost Price</th>
                    <th style="min-width: 110px;">Retail Price</th>
                    <th style="min-width: 110px;">Wholesale</th>
                    <th style="min-width: 100px;">Tax %</th>
                    <th style="min-width: 100px;">Unit</th>
                    <th style="min-width: 110px;">Items/Unit</th>
                    <th style="min-width: 130px;">Expiry Date</th>
                    <th style="min-width: 100px;">Qty</th>
                    <th style="min-width: 100px;">Reorder</th>
                    <th style="min-width: 90px;">Active</th>
                    <th style="min-width: 56px;"></th>
                  </tr>
                </thead>
                <tbody>
                  <tr
                    v-for="(row, i) in previewRows"
                    :key="i"
                    :class="rowInvalid(row) ? 'bg-error-lighten-5' : (row._autoSku ? 'bg-primary-lighten-5' : '')"
                  >
                    <td class="text-caption text-disabled">{{ i + 1 }}</td>
                    <!-- SKU -->
                    <td>
                      <v-text-field
                        v-model="row.sku"
                        variant="outlined"
                        density="compact"
                        hide-details
                        placeholder="auto"
                        class="preview-input"
                      />
                    </td>
                    <!-- Name -->
                    <td>
                      <v-text-field
                        v-model="row.name"
                        variant="outlined"
                        density="compact"
                        hide-details
                        class="preview-input"
                      />
                    </td>
                    <!-- Barcode -->
                    <td>
                      <v-text-field
                        v-model="row.barcode"
                        variant="outlined"
                        density="compact"
                        hide-details
                        class="preview-input"
                      />
                    </td>
                    <!-- Category -->
                    <td>
                      <v-select
                        v-model="row.category"
                        :items="categoryOptions"
                        item-title="name"
                        item-value="id"
                        variant="outlined"
                        density="compact"
                        hide-details
                        clearable
                        class="preview-input"
                      />
                    </td>
                    <!-- Type -->
                    <td>
                      <v-select
                        v-model="row.product_type"
                        :items="productTypeOptions"
                        variant="outlined"
                        density="compact"
                        hide-details
                        class="preview-input"
                      />
                    </td>
                    <!-- Brand -->
                    <td>
                      <v-text-field
                        v-model="row.brand"
                        variant="outlined"
                        density="compact"
                        hide-details
                        class="preview-input"
                      />
                    </td>
                    <!-- Cost / Retail / Wholesale -->
                    <td><v-text-field v-model="row.cost_price" type="number" step="0.01" variant="outlined" density="compact" hide-details class="preview-input" /></td>
                    <td><v-text-field v-model="row.retail_price" type="number" step="0.01" variant="outlined" density="compact" hide-details class="preview-input" /></td>
                    <td><v-text-field v-model="row.wholesale_price" type="number" step="0.01" variant="outlined" density="compact" hide-details class="preview-input" /></td>
                    <!-- Tax -->
                    <td><v-text-field v-model="row.tax_rate" type="number" step="0.01" variant="outlined" density="compact" hide-details class="preview-input" /></td>
                    <!-- Unit -->
                    <td>
                      <v-select
                        v-model="row.unit"
                        :items="unitOptions"
                        item-title="name"
                        item-value="value"
                        variant="outlined"
                        density="compact"
                        hide-details
                        clearable
                        class="preview-input"
                      />
                    </td>
                    <!-- Items per unit -->
                    <td><v-text-field v-model="row.items_per_unit" type="number" step="1" min="1" variant="outlined" density="compact" hide-details class="preview-input" /></td>
                    <!-- Expiry date -->
                    <td><v-text-field v-model="row.expiry_date" type="date" variant="outlined" density="compact" hide-details class="preview-input" clearable /></td>
                    <!-- Qty / Reorder -->
                    <td><v-text-field v-model="row.quantity_on_hand" type="number" step="1" variant="outlined" density="compact" hide-details class="preview-input" /></td>
                    <td><v-text-field v-model="row.reorder_level" type="number" step="1" variant="outlined" density="compact" hide-details class="preview-input" /></td>
                    <!-- Active -->
                    <td>
                      <v-switch
                        v-model="row.is_active"
                        color="success"
                        density="compact"
                        hide-details
                        inset
                      />
                    </td>
                    <!-- Actions -->
                    <td>
                      <v-btn icon="mdi-delete" size="small" variant="text" color="error" @click="removeRow(i)" />
                    </td>
                  </tr>
                </tbody>
              </v-table>
            </div>

            <div class="d-flex align-center ga-3 mt-5 flex-wrap">
              <v-btn
                color="success"
                prepend-icon="mdi-content-save"
                :loading="saving"
                :disabled="saving || previewRows.length === 0"
                size="large"
                @click="saveBulk"
              >
                Save {{ previewRows.length }} Item(s)
              </v-btn>
              <v-btn variant="text" prepend-icon="mdi-export" @click="clearAllSkus">
                Clear All SKUs
              </v-btn>
              <span v-if="emptySkuCount > 0" class="text-body-2 text-medium-emphasis">
                {{ emptySkuCount }} row(s) will get auto-generated SKUs when saved
              </span>
            </div>
          </v-card>
        </v-scale-transition>

        <!-- Result Summary -->
        <v-slide-y-transition>
          <v-card
            v-if="importResult"
            rounded="xl"
            flat
            border
            class="pa-6"
            :style="resultBorderStyle"
          >
            <div class="d-flex align-center ga-3 mb-5 flex-wrap">
              <v-avatar
                :color="importResult.failed > 0 ? 'warning-lighten-5' : 'success-lighten-5'"
                size="48"
                rounded="lg"
              >
                <v-icon
                  :color="importResult.failed > 0 ? 'warning' : 'success'"
                  size="28"
                >
                  {{ importResult.failed > 0 ? 'mdi-alert' : 'mdi-check-circle' }}
                </v-icon>
              </v-avatar>
              <div>
                <div class="text-h6 font-weight-bold">
                  {{ importResult.failed > 0 ? 'Import Finished (with issues)' : 'Import Successful' }}
                </div>
                <div class="text-body-2 text-medium-emphasis">
                  {{ importResult.total_processed }} row(s) processed
                </div>
              </div>
              <v-spacer />
              <v-btn v-if="importResult.failed === 0" color="success" prepend-icon="mdi-package-variant-closed" :to="returnToProducts">
                View Stock Items
              </v-btn>
              <v-btn variant="text" prepend-icon="mdi-refresh" @click="resetAll">Start Over</v-btn>
            </div>

            <v-row dense class="mb-5">
              <v-col cols="6" sm="3">
                <v-card variant="outlined" rounded="lg" class="pa-4 text-center" flat>
                  <div class="text-caption text-medium-emphasis text-uppercase">Created</div>
                  <div class="text-h4 font-weight-bold text-success mt-1">{{ importResult.created }}</div>
                </v-card>
              </v-col>
              <v-col cols="6" sm="3">
                <v-card variant="outlined" rounded="lg" class="pa-4 text-center" flat>
                  <div class="text-caption text-medium-emphasis text-uppercase">Updated</div>
                  <div class="text-h4 font-weight-bold text-primary mt-1">{{ importResult.updated }}</div>
                </v-card>
              </v-col>
              <v-col cols="6" sm="3">
                <v-card variant="outlined" rounded="lg" class="pa-4 text-center" flat>
                  <div class="text-caption text-medium-emphasis text-uppercase">Failed</div>
                  <div class="text-h4 font-weight-bold mt-1"
                    :class="importResult.failed > 0 ? 'text-error' : 'text-disabled'">
                    {{ importResult.failed }}
                  </div>
                </v-card>
              </v-col>
              <v-col cols="6" sm="3">
                <v-card variant="outlined" rounded="lg" class="pa-4 text-center" flat>
                  <div class="text-caption text-medium-emphasis text-uppercase">Processed</div>
                  <div class="text-h4 font-weight-bold mt-1">{{ importResult.total_processed }}</div>
                </v-card>
              </v-col>
            </v-row>

            <div v-if="importResult.errors && importResult.errors.length > 0">
              <div class="d-flex align-center ga-2 mb-3">
                <v-icon size="18" color="error">mdi-alert-circle-outline</v-icon>
                <span class="text-body-1 font-weight-bold">
                  Errors ({{ importResult.errors.length }}{{ importResult.errors_truncated ? '+' : '' }})
                </span>
              </div>
              <v-list variant="outlined" rounded="lg" density="compact" class="bg-surface" max-height="320" lines="two">
                <v-list-item v-for="(err, idx) in importResult.errors" :key="idx">
                  <template #prepend>
                    <v-avatar color="error-lighten-5" size="32" rounded="lg">
                      <span class="text-caption font-weight-bold text-error">#{{ err.row }}</span>
                    </v-avatar>
                  </template>
                  <v-list-item-title class="text-body-2 font-weight-bold">
                    SKU: {{ err.sku || '—' }}
                  </v-list-item-title>
                  <v-list-item-subtitle class="text-body-2 text-error">
                    {{ err.detail }}
                  </v-list-item-subtitle>
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
                  <div class="text-h6 font-weight-bold">Export Stock Items to Excel</div>
                  <div class="text-body-2 text-medium-emphasis">
                    Download all products matching the active filters as a formatted .xlsx file
                  </div>
                </div>
              </div>

              <v-list density="compact" class="bg-transparent px-0 mb-4">
                <v-list-item class="px-0" v-for="info in exportInfo" :key="info.title">
                  <template #prepend>
                    <v-icon :color="info.color" size="22">{{ info.icon }}</v-icon>
                  </template>
                  <v-list-item-title class="text-body-1 font-weight-medium">
                    {{ info.title }}
                  </v-list-item-title>
                  <v-list-item-subtitle class="text-body-2 text-medium-emphasis">
                    {{ info.subtitle }}
                  </v-list-item-subtitle>
                </v-list-item>
              </v-list>

              <v-btn
                color="success"
                prepend-icon="mdi-microsoft-excel"
                block
                size="x-large"
                :loading="exporting"
                @click="doExport"
              >
                Download .xlsx
              </v-btn>
            </v-card>
          </v-col>

          <!-- Active filters summary -->
          <v-col cols="12" lg="5">
            <v-card rounded="xl" flat border class="pa-6 h-100">
              <div class="text-h6 font-weight-bold mb-4">
                <v-icon class="mr-1" color="primary">mdi-filter-variant</v-icon>
                Active Filters
              </div>
              <div v-if="activeFilterChips.length === 0" class="text-body-2 text-medium-emphasis pa-4 text-center">
                No filters active — export will include all stock items.
              </div>
              <div v-else class="d-flex flex-wrap ga-2">
                <v-chip
                  v-for="chip in activeFilterChips"
                  :key="chip.label"
                  size="small"
                  :color="chip.color"
                  variant="tonal"
                >
                  {{ chip.label }}
                </v-chip>
              </div>
              <v-alert type="info" variant="tonal" density="compact" class="mt-5" rounded="lg">
                Filters carried over from the Stock Items page. Return there to change them, then re-open Import / Export.
              </v-alert>
              <v-btn variant="text" color="primary" prepend-icon="mdi-arrow-left" class="mt-2" to="/products">
                Back to Stock Items
              </v-btn>
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

// ── Import state ──
const fileInput = ref(null)
const selectedFile = ref(null)
const isDragging = ref(false)
const parsing = ref(false)
const preview = ref(null)        // raw parse response (rows, categories, etc.)
const previewRows = ref([])      // reactive editable rows bound to the table
const parseErrors = ref([])
const saving = ref(false)
const importResult = ref(null)

const resultBorderStyle = computed(() => {
  if (!importResult.value) return ''
  return importResult.value.failed > 0
    ? 'border-left: 4px solid rgb(var(--v-theme-warning)) !important;'
    : 'border-left: 4px solid rgb(var(--v-theme-success)) !important;'
})

// Category / product-type / unit options for the editable preview table
const categoryOptions = computed(() => preview.value?.categories || [])
const productTypeOptions = computed(() => preview.value?.product_types || [
  'physical', 'service', 'digital', 'bundle',
])
// Unit options — display as "Name (abbr)" and save the abbreviation (e.g. "ea"),
// matching the Add Stock Item modal. Fall back to lowercased name if no abbreviation.
const unitOptions = computed(() =>
  (preview.value?.units || []).map(u => ({
    name: `${u.name} (${u.abbreviation})`,
    value: u.abbreviation || u.name.toLowerCase(),
  }))
)

const emptySkuCount = computed(() =>
  previewRows.value.filter(r => !r.sku || !String(r.sku).trim()).length
)

function rowInvalid(row) {
  // Required: name non-empty
  if (!row.name || !String(row.name).trim()) return true
  return false
}

// ── Template download state ──
const downloadingTemplate = ref(false)

// ── Export state ──
const exporting = ref(false)

const exportInfo = [
  { icon: 'mdi-filter', color: 'primary', title: 'Respects active filters', subtitle: 'Uses search, category, status, type, and date filters from the Stock Items page' },
  { icon: 'mdi-format-columns', color: 'indigo', title: 'Formatted columns', subtitle: 'Headers, frozen panes, right-aligned numeric columns' },
  { icon: 'mdi-package-variant-closed', color: 'success', title: 'All matching items', subtitle: 'No pagination limit — exports everything' },
]

// ── Export params carried from /products query string ──
const exportParams = computed(() => {
  const params = {}
  const q = route.query
  if (q.search) params.search = q.search
  if (q.category) params.category = q.category
  if (q.is_active) params.is_active = q.is_active
  if (q.product_type) params.product_type = q.product_type
  if (q.ordering) params.ordering = q.ordering
  if (q.created_after) params.created_after = q.created_after
  if (q.created_before) params.created_before = q.created_before
  if (q.updated_after) params.updated_after = q.updated_after
  if (q.updated_before) params.updated_before = q.updated_before
  return params
})

const activeFilterChips = computed(() => {
  const chips = []
  const q = route.query
  if (q.search) chips.push({ label: `Search: "${q.search}"`, color: 'primary' })
  if (q.category) chips.push({ label: `Category #${q.category}`, color: 'indigo' })
  if (q.is_active) chips.push({ label: q.is_active === 'true' ? 'Active' : 'Inactive', color: 'amber' })
  if (q.product_type) chips.push({ label: `Type: ${q.product_type}`, color: 'purple' })
  if (q.created_after || q.created_before) chips.push({ label: `Created: ${q.created_after || '...'} → ${q.created_before || '...'}`, color: 'cyan' })
  if (q.updated_after || q.updated_before) chips.push({ label: `Updated: ${q.updated_after || '...'} → ${q.updated_before || '...'}`, color: 'cyan' })
  return chips
})

const returnToProducts = computed(() => '/products?imported=1')

function goBack() {
  router.push('/products')
}

// ── Client-side SKU generator (matches backend PRD-XXXXXX style) ──
const SKU_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
function genSkuLocal(existing) {
  const set = new Set(existing || [])
  for (let i = 0; i < 200; i++) {
    let suffix = ''
    for (let j = 0; j < 6; j++) suffix += SKU_CHARS[Math.floor(Math.random() * SKU_CHARS.length)]
    const sku = `PRD-${suffix}`
    if (!set.has(sku)) {
      set.add(sku)
      return sku
    }
  }
  return `PRD-${Date.now().toString(36).toUpperCase()}`
}

function openFileDialog() {
  fileInput.value?.click()
}

function onFileSelected(e) {
  const target = e.target
  const file = target.files?.[0]
  if (file) setFile(file)
}

function onDrop(e) {
  isDragging.value = false
  const file = e.dataTransfer?.files?.[0]
  if (file) setFile(file)
}

function setFile(file) {
  const name = file.name.toLowerCase()
  if (!name.endsWith('.xlsx') && !name.endsWith('.xlsm')) {
    toast.error('Please select an .xlsx file')
    return
  }
  if (file.size > 20 * 1024 * 1024) {
    toast.error('File too large (max 20MB)')
    return
  }
  selectedFile.value = file
  // Reset any prior preview/result
  preview.value = null
  previewRows.value = []
  parseErrors.value = []
  importResult.value = null
  if (fileInput.value) fileInput.value.value = ''
}

function resetFile() {
  selectedFile.value = null
  preview.value = null
  previewRows.value = []
  parseErrors.value = []
  importResult.value = null
  if (fileInput.value) fileInput.value.value = ''
}

function cancelPreview() {
  preview.value = null
  previewRows.value = []
  parseErrors.value = []
}

function resetAll() {
  resetFile()
  mode.value = 'import'
}

function formatSize(bytes) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
}

// ── Template download ──
async function downloadTemplate() {
  downloadingTemplate.value = true
  try {
    const blob = await useApi()('/products/import-excel-template/', {
      method: 'GET',
      responseType: 'blob',
    })
    triggerDownload(blob, 'products_import_template.xlsx')
    toast.success('Template downloaded')
  } catch (e) {
    toast.error('Failed to download template')
  } finally {
    downloadingTemplate.value = false
  }
}

// ── Parse file → preview ──
async function parseFile() {
  if (!selectedFile.value) return
  parsing.value = true
  importResult.value = null
  const formData = new FormData()
  formData.append('file', selectedFile.value)
  try {
    const result = await useApi()('/products/parse-excel/', {
      method: 'POST',
      body: formData,
    })
    preview.value = result
    // Reset the auto-SKU flag (only set when the user clicks Auto-fill)
    for (const r of result.rows) {
      r._autoSku = false
    }
    previewRows.value = result.rows
    parseErrors.value = result.errors || []
    if (result.rows.length === 0) {
      toast.warning('No data rows found in the file')
    } else {
      toast.success(`${result.rows.length} row(s) ready for preview`)
    }
  } catch (e) {
    const detail = e?.data?.detail || 'Failed to parse file'
    toast.error(detail)
  } finally {
    parsing.value = false
  }
}

// ── Preview row helpers ──
function addRow() {
  previewRows.value.push({
    sku: '',
    barcode: '',
    name: '',
    category: null,
    product_type: 'physical',
    brand: '',
    cost_price: 0,
    retail_price: 0,
    wholesale_price: 0,
    tax_rate: 0,
    unit: 'each',
    items_per_unit: 1,
    expiry_date: null,
    quantity_on_hand: 0,
    reorder_level: 10,
    is_active: true,
  })
}

function removeRow(idx) {
  previewRows.value.splice(idx, 1)
}

function autoFillEmptySkus() {
  const existing = new Set(previewRows.value.map(r => r.sku).filter(Boolean))
  let filled = 0
  for (const r of previewRows.value) {
    if (!r.sku || !String(r.sku).trim()) {
      r.sku = genSkuLocal(existing)
      r._autoSku = true
      filled++
    }
  }
  if (filled > 0) toast.success(`${filled} empty SKU(s) filled`)
  else toast.info('No empty SKUs to fill')
}

function clearAllSkus() {
  for (const r of previewRows.value) {
    r.sku = ''
    r._autoSku = false
  }
  toast.info('All SKUs cleared — they will be auto-generated on save')
}

// ── Save (bulk-upsert) ──
async function saveBulk() {
  if (previewRows.value.length === 0) return
  // Inline validation — name required
  const invalid = previewRows.value.filter(r => !r.name || !String(r.name).trim()).length
  if (invalid > 0) {
    toast.error(`${invalid} row(s) missing a required Name — fix or remove them`)
    return
  }
  saving.value = true
  // Strip helper fields — backend ignores keys starting with '_'
  const items = previewRows.value.map(r => {
    const out = {}
    for (const [k, v] of Object.entries(r)) {
      if (!k.startsWith('_')) out[k] = v
    }
    return out
  })
  try {
    const result = await useApi()('/products/bulk-upsert/', {
      method: 'POST',
      body: { items },
    })
    importResult.value = result
    if (result.failed > 0) {
      toast.warning(`Saved ${result.created + result.updated}, ${result.failed} failed`)
    } else {
      toast.success(`Import complete: ${result.created} created, ${result.updated} updated`)
    }
    // Clear the preview after a fully-successful save
    if (result.failed === 0) {
      preview.value = null
      previewRows.value = []
      parseErrors.value = []
    }
  } catch (e) {
    const detail = e?.data?.detail || 'Save failed'
    toast.error(detail)
  } finally {
    saving.value = false
  }
}

// ── Export to Excel ──
async function doExport() {
  exporting.value = true
  try {
    const params = new URLSearchParams()
    for (const [k, v] of Object.entries(exportParams.value)) {
      if (v !== '' && v != null && v !== undefined) {
        params.append(k, String(v))
      }
    }
    const qs = params.toString()
    const url = `/products/export-excel/${qs ? `?${qs}` : ''}`
    const blob = await useApi()(url, {
      method: 'GET',
      responseType: 'blob',
    })
    const today = new Date().toISOString().slice(0, 10)
    triggerDownload(blob, `products_export_${today}.xlsx`)
    toast.success('Export started')
  } catch (e) {
    toast.error('Failed to export stock items')
  } finally {
    exporting.value = false
  }
}

function triggerDownload(blob, filename) {
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  setTimeout(() => URL.revokeObjectURL(url), 1500)
}
</script>

<style scoped>
.upload-zone {
  border: 2px dashed rgb(var(--v-theme-primary));
  border-radius: 16px;
  transition: all 0.2s ease;
  background: rgb(var(--v-theme-surface));
}
.upload-zone:hover {
  background: rgba(var(--v-theme-primary), 0.04);
}
.upload-zone-active {
  border-color: rgb(var(--v-theme-primary));
  background: rgba(var(--v-theme-primary), 0.08);
  transform: scale(1.005);
}
.upload-zone-has-file {
  border-style: solid;
  border-color: rgb(var(--v-theme-success));
}

/* Compact inputs inside the preview table */
.preview-input :deep(.v-field__input) {
  padding: 4px 8px !important;
  min-height: 32px !important;
  font-size: 0.85rem;
}
.preview-input :deep(.v-field__append-inner) {
  padding-top: 4px !important;
}
.preview-table :deep(td) {
  vertical-align: middle;
}
.overflow-x-auto {
  overflow-x: auto;
}
</style>
