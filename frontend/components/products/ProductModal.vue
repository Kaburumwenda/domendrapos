<template>
  <v-dialog :model-value="show" @update:model-value="$emit('close')" max-width="1100" scrollable>
    <v-card rounded="xl" class="product-modal-card">

      <!-- ============ Header ============ -->
      <div class="modal-header">
        <div class="d-flex align-center ga-3">
          <v-avatar :color="isEdit ? 'primary' : 'success'" size="44" rounded="lg">
            <v-icon size="22" icon="mdi-package-variant-closed" />
          </v-avatar>
          <div>
            <div class="text-h6 font-weight-bold">{{ isEdit ? 'Edit Product' : 'Add New Product' }}</div>
            <div class="text-body-2 text-medium-emphasis">{{ isEdit ? 'Update product details and pricing' : 'Create a new product in your catalog' }}</div>
          </div>
        </div>
        <v-btn icon variant="text" size="small" @click="$emit('close')">
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </div>

      <v-divider />

      <!-- ============ Body — two-column ============ -->
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
            <v-icon v-if="step.id === 'pricing' && marginOk" class="stepper-check" color="success" size="18">mdi-check-circle</v-icon>
            <v-icon v-else-if="step.id === 'inventory' && inventoryOk" class="stepper-check" color="success" size="18">mdi-check-circle</v-icon>
          </div>
        </div>

        <!-- Right: form content -->
        <div class="stepper-content">
          <v-window v-model="activeTab" class="fill-height">

            <!-- ====== Step 1: Basic Info ====== -->
            <v-window-item value="info">
              <div class="step-title">Product Information</div>
              <div class="step-subtitle">Tell us about this product — name, SKU, category, and description.</div>

              <!-- ── Image upload / drag-drop ── -->
              <div class="image-upload-section mt-4">
                <div class="image-upload-label">Product Image</div>
                <input
                  ref="fileInput"
                  type="file"
                  accept="image/*"
                  class="d-none"
                  @change="onFileSelected"
                />
                <div
                  v-if="!imagePreview"
                  class="image-dropzone"
                  :class="{ 'drag-over': isDragging }"
                  @click="triggerFileInput"
                  @dragover.prevent="isDragging = true"
                  @dragleave.prevent="isDragging = false"
                  @drop.prevent="onDrop"
                >
                  <v-icon size="40" color="primary" class="mb-2">mdi-cloud-upload-outline</v-icon>
                  <div class="text-body-2 font-weight-medium">Drag and drop image here</div>
                  <div class="text-caption text-medium-emphasis mt-1">or click to browse</div>
                  <div class="text-caption text-disabled mt-2">PNG, JPG, WEBP — max 5 MB</div>
                </div>
                <div v-else class="image-preview-wrapper">
                  <div class="image-preview-box">
                    <v-img :src="imagePreview" cover class="h-100" />
                    <div class="image-overlay">
                      <v-btn
                        icon
                        size="small"
                        color="white"
                        variant="flat"
                        class="image-overlay-btn"
                        @click="triggerFileInput"
                      >
                        <v-icon size="16" color="grey-darken-3">mdi-pencil</v-icon>
                      </v-btn>
                      <v-btn
                        icon
                        size="small"
                        color="white"
                        variant="flat"
                        class="image-overlay-btn"
                        @click="removeImage"
                      >
                        <v-icon size="16" color="grey-darken-3">mdi-delete</v-icon>
                      </v-btn>
                    </div>
                  </div>
                  <div class="image-preview-info">
                    <div class="text-body-2 font-weight-medium">{{ imageFileName }}</div>
                    <div class="text-caption text-medium-emphasis">{{ imageFileSize }}</div>
                    <v-btn variant="text" color="error" size="small" prepend-icon="mdi-trash-can-outline" class="mt-2" @click="removeImage">
                      Remove
                    </v-btn>
                  </div>
                </div>
              </div>

              <v-text-field
                v-model="form.name"
                label="Product Name"
                variant="outlined"
                density="comfortable"
                required
                :error-messages="errors.name"
                placeholder="e.g., Coca Cola 500ml"
                class="mt-4"
              />

              <v-row density="comfortable">
                <v-col cols="12" sm="6">
                  <v-text-field
                    v-model="form.sku"
                    label="SKU"
                    variant="outlined"
                    density="comfortable"
                    required
                    :error-messages="errors.sku"
                    append-inner-icon="mdi-refresh"
                    @click:append-inner="generateSKU"
                    hint="Click the icon to auto-generate"
                    persistent-hint
                    placeholder="PROD-001"
                  />
                </v-col>
                <v-col cols="12" sm="6">
                  <v-text-field
                    v-model="form.barcode"
                    label="Barcode"
                    variant="outlined"
                    density="comfortable"
                    placeholder="Scan or enter barcode"
                  />
                </v-col>
              </v-row>

              <v-row density="comfortable">
                <v-col cols="12" sm="6">
                  <v-select
                    v-model="form.category"
                    :items="categories"
                    item-title="name"
                    item-value="id"
                    label="Category"
                    variant="outlined"
                    density="comfortable"
                    clearable
                    placeholder="Select a category"
                  />
                </v-col>
                <v-col cols="12" sm="6">
                  <v-select
                    v-model="form.product_type"
                    :items="productTypes"
                    item-title="label"
                    item-value="value"
                    label="Product Type"
                    variant="outlined"
                    density="comfortable"
                  />
                </v-col>
              </v-row>

              <v-row density="comfortable">
                <v-col cols="12" sm="6">
                  <v-autocomplete
                    v-model="form.brand"
                    :items="brands"
                    item-title="name"
                    item-value="name"
                    label="Brand"
                    variant="outlined"
                    density="comfortable"
                    clearable
                    placeholder="Select or type a brand"
                  />
                </v-col>
                <v-col cols="12" sm="6">
                  <v-text-field
                    v-model="form.manufacturer"
                    label="Manufacturer"
                    variant="outlined"
                    density="comfortable"
                    placeholder="e.g., Coca-Cola Company"
                  />
                </v-col>
              </v-row>

              <v-textarea
                v-model="form.description"
                label="Description"
                variant="outlined"
                density="comfortable"
                rows="3"
                placeholder="Product description, features, specifications..."
              />
            </v-window-item>

            <!-- ====== Step 2: Pricing ====== -->
            <v-window-item value="pricing">
              <div class="step-title">Pricing and Units</div>
              <div class="step-subtitle">Set the cost, selling price, and tax rate. Profit margin updates automatically.</div>

              <v-row density="comfortable" class="mt-2">
                <v-col cols="12" sm="4">
                  <v-text-field
                    v-model="form.cost_price"
                    :label="`Cost Price (${symbol})`"
                    variant="outlined"
                    density="comfortable"
                    type="number"
                    step="0.01"
                    min="0"
                    :error-messages="errors.cost_price"
                    placeholder="0.00"
                    prepend-inner-icon="mdi-cash-minus"
                  />
                </v-col>
                <v-col cols="12" sm="4">
                  <v-text-field
                    v-model="form.retail_price"
                    :label="`Retail Price (${symbol})`"
                    variant="outlined"
                    density="comfortable"
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    :error-messages="errors.retail_price"
                    placeholder="0.00"
                    prepend-inner-icon="mdi-cash-plus"
                  />
                </v-col>
                <v-col cols="12" sm="4">
                  <v-text-field
                    v-model="form.wholesale_price"
                    :label="`Wholesale (${symbol})`"
                    variant="outlined"
                    density="comfortable"
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                    prepend-inner-icon="mdi-cash-multiple"
                  />
                </v-col>
              </v-row>

              <!-- Margin summary card -->
              <div class="margin-card">
                <div class="margin-item">
                  <div class="margin-label">Profit Margin</div>
                  <div class="margin-value" :class="marginClass">{{ marginDisplay }}</div>
                </div>
                <div class="margin-divider"></div>
                <div class="margin-item">
                  <div class="margin-label">Markup</div>
                  <div class="margin-value" :class="marginClass">{{ markupDisplay }}</div>
                </div>
                <div class="margin-divider"></div>
                <div class="margin-item">
                  <div class="margin-label">Profit / Unit</div>
                  <div class="margin-value" :class="profitPositive ? 'text-success' : 'text-error'">{{ symbol }}{{ profitPerUnit }}</div>
                </div>
              </div>

              <v-row density="comfortable">
                <v-col cols="12" sm="6">
                  <v-text-field
                    v-model="form.tax_rate"
                    label="Tax Rate (%)"
                    variant="outlined"
                    density="comfortable"
                    type="number"
                    step="0.01"
                    min="0"
                    max="100"
                    placeholder="0.00"
                    prepend-inner-icon="mdi-percent"
                  />
                </v-col>
                <v-col cols="12" sm="6">
                  <v-select
                    v-model="form.unit"
                    :items="unitItems"
                    item-title="name"
                    item-value="value"
                    label="Unit"
                    variant="outlined"
                    density="comfortable"
                    required
                    :error-messages="errors.unit"
                    prepend-inner-icon="mdi-ruler"
                  />
                </v-col>
              </v-row>

              <!-- Items per unit — conditional -->
              <v-text-field
                v-if="isMultiPieceUnit"
                v-model="form.items_per_unit"
                label="Items per Unit"
                variant="outlined"
                density="comfortable"
                type="number"
                step="1"
                min="1"
                placeholder="e.g., 24 for a carton, 12 for a dozen"
                hint="How many individual pieces are in this unit? This helps with stock breakdown."
                persistent-hint
                class="mt-2"
              />
            </v-window-item>

            <!-- ====== Step 3: Inventory ====== -->
            <v-window-item value="inventory">
              <div class="step-title">Inventory and Stock</div>
              <div class="step-subtitle">Track stock levels, set reorder alerts, and manage product status.</div>

              <div class="settings-card">
                <div class="settings-card-label">Stock Levels</div>
                <v-row density="comfortable" class="mt-1">
                  <v-col cols="12" sm="6">
                    <v-text-field
                      v-model="form.quantity_on_hand"
                      label="Quantity On Hand"
                      variant="outlined"
                      density="comfortable"
                      type="number"
                      step="0.001"
                      min="0"
                      placeholder="0"
                      hint="Current stock level for this product"
                      persistent-hint
                      prepend-inner-icon="mdi-package-variant"
                    />
                  </v-col>
                  <v-col cols="12" sm="6">
                    <v-text-field
                      v-model="form.reorder_level"
                      label="Reorder Level"
                      variant="outlined"
                      density="comfortable"
                      type="number"
                      step="0.001"
                      min="0"
                      placeholder="10"
                      hint="Alert when stock falls below this level"
                      persistent-hint
                      prepend-inner-icon="mdi-bell-alert"
                    />
                  </v-col>
                </v-row>
              </div>

              <v-row density="comfortable" class="mt-4">
                <v-col cols="12" sm="4">
                  <v-text-field
                    v-model="form.weight"
                    label="Weight (kg)"
                    variant="outlined"
                    density="comfortable"
                    type="number"
                    step="0.001"
                    min="0"
                    placeholder="0.000"
                    prepend-inner-icon="mdi-scale"
                  />
                </v-col>
                <v-col cols="12" sm="4">
                  <v-text-field
                    v-model="form.dimensions"
                    label="Dimensions (LxWxH)"
                    variant="outlined"
                    density="comfortable"
                    placeholder="e.g., 10x20x30 cm"
                    prepend-inner-icon="mdi-ruler-square"
                  />
                </v-col>
                <v-col cols="12" sm="4">
                  <v-text-field
                    v-model="form.expiry_date"
                    label="Expiry Date"
                    variant="outlined"
                    density="comfortable"
                    type="date"
                    clearable
                    hint="Optional — for perishable goods"
                    persistent-hint
                    prepend-inner-icon="mdi-calendar-alert"
                  />
                </v-col>
              </v-row>

              <!-- Status toggles -->
              <div class="status-toggles">
                <div class="status-toggles-label">Product Status</div>
                <div class="toggle-grid">
                  <div class="toggle-item" :class="{ active: form.track_inventory }">
                    <v-switch v-model="form.track_inventory" color="primary" density="compact" hide-details inset />
                    <div class="toggle-text">
                      <div class="toggle-title">Track Inventory</div>
                      <div class="toggle-desc">Enable stock level tracking</div>
                    </div>
                  </div>
                  <div class="toggle-item" :class="{ active: form.is_sellable }">
                    <v-switch v-model="form.is_sellable" color="primary" density="compact" hide-details inset />
                    <div class="toggle-text">
                      <div class="toggle-title">Sellable</div>
                      <div class="toggle-desc">Product can be sold in POS</div>
                    </div>
                  </div>
                  <div class="toggle-item" :class="{ active: form.is_purchasable }">
                    <v-switch v-model="form.is_purchasable" color="primary" density="compact" hide-details inset />
                    <div class="toggle-text">
                      <div class="toggle-title">Purchasable</div>
                      <div class="toggle-desc">Product can be bought from suppliers</div>
                    </div>
                  </div>
                  <div class="toggle-item" :class="{ active: form.is_active }">
                    <v-switch v-model="form.is_active" color="primary" density="compact" hide-details inset />
                    <div class="toggle-text">
                      <div class="toggle-title">Active</div>
                      <div class="toggle-desc">Visible in transactions</div>
                    </div>
                  </div>
                </div>
              </div>
            </v-window-item>

            <!-- ====== Step 4: Variants ====== -->
            <v-window-item value="variants">
              <div class="step-title">Product Variants</div>
              <div class="step-subtitle">Add size, colour, or other variant options. Leave empty for a single-SKU product.</div>

              <div class="d-flex align-center justify-space-between mb-4 mt-3">
                <div class="text-body-2 text-medium-emphasis">{{ form.variants.length }} variant(s) configured</div>
                <v-btn color="primary" variant="tonal" prepend-icon="mdi-plus" size="small" @click="addVariant">Add Variant</v-btn>
              </div>

              <div v-if="form.variants.length === 0" class="empty-variants">
                <v-icon size="48" color="grey-lighten-1">mdi-package-variant</v-icon>
                <p class="mt-2 text-body-2 text-medium-emphasis">No variants. This product has a single SKU.</p>
              </div>

              <div v-for="(variant, i) in form.variants" :key="i" class="variant-row">
                <div class="d-flex align-center justify-space-between mb-3">
                  <v-chip size="small" color="primary" variant="tonal">Variant {{ i + 1 }}</v-chip>
                  <v-btn variant="text" color="error" size="small" icon="mdi-delete" @click="removeVariant(i)" />
                </div>
                <v-row density="comfortable">
                  <v-col cols="12" sm="6" md="3">
                    <v-text-field v-model="variant.name" label="Variant name" variant="outlined" density="compact" placeholder="e.g., Large Red" />
                  </v-col>
                  <v-col cols="12" sm="6" md="3">
                    <v-text-field v-model="variant.sku_suffix" label="SKU suffix" variant="outlined" density="compact" placeholder="LR" />
                  </v-col>
                  <v-col cols="12" sm="6" md="3">
                    <v-text-field v-model="variant.price_adjustment" label="Price adj." variant="outlined" density="compact" type="number" step="0.01" />
                  </v-col>
                  <v-col cols="12" sm="6" md="3">
                    <v-text-field v-model="variant.barcode" label="Barcode" variant="outlined" density="compact" />
                  </v-col>
                </v-row>
              </div>
            </v-window-item>

          </v-window>
        </div>
      </div>

      <v-divider />

      <!-- ============ Footer ============ -->
      <div class="modal-footer">
        <div class="d-flex align-center ga-2 text-body-2 text-medium-emphasis">
          <v-icon size="16" :icon="activeTab === 'info' ? 'mdi-clipboard-list-outline' : activeTab === 'pricing' ? 'mdi-cash' : activeTab === 'inventory' ? 'mdi-package-variant' : 'mdi-format-list-bulleted'" />
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
            color="primary"
            :loading="saving"
            @click="save"
          >
            <v-icon start size="18">{{ isEdit ? 'mdi-content-save' : 'mdi-check' }}</v-icon>
            {{ isEdit ? 'Update Product' : 'Create Product' }}
          </v-btn>
        </div>
      </div>
    </v-card>
  </v-dialog>
</template>

<script setup>
const props = defineProps({
  show: Boolean,
  product: { type: Object, default: null },
  categories: { type: Array, default: () => [] },
  units: { type: Array, default: () => [] },
  brands: { type: Array, default: () => [] },
})

const emit = defineEmits(['close', 'saved'])

const auth = useAuthStore()
const toast = useToast()
const symbol = computed(() => auth.currencySymbol || 'KSh')

const saving = ref(false)
const isEdit = computed(() => !!props.product)
const activeTab = ref('info')

// ── Image upload state ──
const fileInput = ref(null)
const imageFile = ref(null)
const imagePreview = ref(null)
const imageFileName = ref('')
const imageFileSize = ref('')
const isDragging = ref(false)

const stepList = [
  { id: 'info', label: 'Basic Info', desc: 'Name, SKU, category' },
  { id: 'pricing', label: 'Pricing', desc: 'Cost, retail, margins' },
  { id: 'inventory', label: 'Inventory', desc: 'Stock, reorder, status' },
  { id: 'variants', label: 'Variants', desc: 'Size, colour, options' },
]

const currentStepIndex = computed(() => {
  const idx = stepList.findIndex(s => s.id === activeTab.value)
  return idx >= 0 ? idx : 0
})

function nextStep() {
  if (currentStepIndex.value < stepList.length - 1) {
    activeTab.value = stepList[currentStepIndex.value + 1].id
  }
}

const productTypes = [
  { label: 'Physical', value: 'physical' },
  { label: 'Service', value: 'service' },
  { label: 'Digital', value: 'digital' },
  { label: 'Bundle', value: 'bundle' },
]

const unitItems = computed(() => [
  { name: '— No unit —', value: 'each' },
  ...props.units.map(u => ({
    name: `${u.name} (${u.abbreviation})`,
    value: u.abbreviation || u.name.toLowerCase(),
  })),
])

// Units that represent a collection of individual pieces
const MULTI_PIECE_UNITS = ['box', 'ctn', 'carton', 'pack', 'dz', 'dozen', 'set', 'roll', 'btl', 'bottle']
const isMultiPieceUnit = computed(() => MULTI_PIECE_UNITS.includes(String(form.unit).toLowerCase()))

const errors = ref({})

const defaultForm = () => ({
  name: '',
  sku: '',
  barcode: '',
  description: '',
  category: null,
  product_type: 'physical',
  brand: '',
  manufacturer: '',
  cost_price: 0,
  retail_price: 0,
  wholesale_price: 0,
  tax_rate: 0,
  unit: 'each',
  items_per_unit: 1,
  expiry_date: null,
  weight: 0,
  dimensions: '',
  track_inventory: true,
  is_sellable: true,
  is_purchasable: true,
  is_active: true,
  quantity_on_hand: 0,
  reorder_level: 10,
  variants: [],
})

const form = reactive(defaultForm())

// Reset form when product prop changes
watch(() => props.product, (val) => {
  if (val) {
    Object.assign(form, {
      ...defaultForm(),
      ...val,
      category: val.category || null,
      variants: (val.variants || []).map(v => ({ ...v })),
    })
    // Restore existing image preview
    if (val.image) {
      imagePreview.value = val.image
      imageFileName.value = val.image.split('/').pop() || 'image'
      imageFileSize.value = ''
      imageFile.value = null
    } else {
      imagePreview.value = null
      imageFileName.value = ''
      imageFileSize.value = ''
      imageFile.value = null
    }
  } else {
    Object.assign(form, defaultForm())
    resetImageState()
  }
  errors.value = {}
  activeTab.value = 'info'
}, { immediate: true })

watch(() => props.show, (val) => {
  if (val && !props.product) {
    Object.assign(form, defaultForm())
    resetImageState()
    errors.value = {}
    activeTab.value = 'info'
  }
})

// Margin calculations
const costNum = computed(() => parseFloat(form.cost_price) || 0)
const retailNum = computed(() => parseFloat(form.retail_price) || 0)
const profitPerUnit = computed(() => (retailNum.value - costNum.value).toFixed(2))
const profitPositive = computed(() => retailNum.value - costNum.value >= 0)
const marginDisplay = computed(() => {
  if (costNum.value <= 0) return '—'
  return ((retailNum.value - costNum.value) / costNum.value * 100).toFixed(1) + '%'
})
const markupDisplay = computed(() => {
  if (costNum.value <= 0) return '—'
  return ((retailNum.value - costNum.value) / retailNum.value * 100).toFixed(1) + '%'
})
const marginClass = computed(() => {
  if (costNum.value <= 0) return 'text-medium-emphasis'
  return profitPositive.value ? 'text-success' : 'text-error'
})

// Step completion indicators
const marginOk = computed(() => costNum.value > 0 && retailNum.value > 0 && profitPositive.value)
const inventoryOk = computed(() => form.unit !== '' && form.quantity_on_hand >= 0)

// ── Image upload helpers ──
const MAX_IMAGE_SIZE = 5 * 1024 * 1024 // 5 MB
const ALLOWED_TYPES = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'image/gif']

function resetImageState() {
  imageFile.value = null
  imagePreview.value = null
  imageFileName.value = ''
  imageFileSize.value = ''
}

function formatFileSize(bytes) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function handleFile(file) {
  if (!ALLOWED_TYPES.includes(file.type)) {
    toast.error('Please select a valid image (PNG, JPG, WEBP, or GIF)')
    return
  }
  if (file.size > MAX_IMAGE_SIZE) {
    toast.error('Image exceeds the 5 MB limit')
    return
  }
  imageFile.value = file
  imageFileName.value = file.name
  imageFileSize.value = formatFileSize(file.size)
  const reader = new FileReader()
  reader.onload = (e) => {
    imagePreview.value = e.target?.result
  }
  reader.readAsDataURL(file)
}

function triggerFileInput() {
  fileInput.value?.click()
}

function onFileSelected(e) {
  const target = e.target
  if (target.files && target.files[0]) {
    handleFile(target.files[0])
  }
  target.value = '' // allow re-selecting the same file
}

function onDrop(e) {
  isDragging.value = false
  const files = e.dataTransfer?.files
  if (files && files[0]) {
    handleFile(files[0])
  }
}

function removeImage() {
  resetImageState()
}

function generateSKU() {
  const prefix = 'PRD'
  const random = Math.floor(Math.random() * 100000).toString().padStart(5, '0')
  form.sku = `${prefix}-${random}`
}

function addVariant() {
  form.variants.push({
    name: '',
    sku_suffix: '',
    barcode: '',
    price_adjustment: 0,
    cost_adjustment: 0,
    attributes: {},
  })
}

function removeVariant(index) {
  form.variants.splice(index, 1)
}

function validate() {
  errors.value = {}
  if (!form.name?.trim()) errors.value.name = 'Product name is required'
  if (!form.sku?.trim()) errors.value.sku = 'SKU is required'
  if (form.cost_price === '' || form.cost_price < 0) errors.value.cost_price = 'Enter a valid cost price'
  if (form.retail_price === '' || form.retail_price <= 0) errors.value.retail_price = 'Retail price is required'
  if (!form.unit) errors.value.unit = 'Unit is required'
  return Object.keys(errors.value).length === 0
}

async function save() {
  if (!validate()) {
    if (errors.value.name || errors.value.sku) activeTab.value = 'info'
    else if (errors.value.cost_price || errors.value.retail_price || errors.value.unit) activeTab.value = 'pricing'
    toast.error('Please fix the errors before saving')
    return
  }

  saving.value = true
  try {
    const { variants, ...productData } = form

    // Build the payload — use FormData when a new image file is selected
    const hasImageFile = !!imageFile.value
    let payload
    let fetchOpts = {}

    const baseData = {
      ...productData,
      category: productData.category || null,
    }

    if (hasImageFile) {
      const formData = new FormData()
      for (const [key, value] of Object.entries(baseData)) {
        if (value === null || value === undefined) continue
        formData.append(key, String(value))
      }
      formData.append('image', imageFile.value)
      payload = formData
      // Let the browser set the Content-Type for multipart
      fetchOpts = { headers: {} }
    } else {
      payload = baseData
    }

    let result
    if (isEdit.value) {
      result = await useApi()(`/products/${props.product.id}/`, {
        method: 'PATCH',
        body: payload,
        ...fetchOpts,
      })
      for (const variant of variants) {
        if (variant.id) {
          await useApi()(`/products/variants/${variant.id}/`, { method: 'PATCH', body: variant })
        } else {
          await useApi()('/products/variants/', { method: 'POST', body: { ...variant, product: props.product.id } })
        }
      }
      toast.success('Product updated successfully')
    } else {
      result = await useApi()('/products/', {
        method: 'POST',
        body: payload,
        ...fetchOpts,
      })
      for (const variant of variants) {
        if (variant.name) {
          await useApi()('/products/variants/', { method: 'POST', body: { ...variant, product: result.id } })
        }
      }
      toast.success('Product created successfully')
    }
    emit('saved')
  } catch (e) {
    const msg = e?.data?.detail || e?.data?.message || 'Failed to save product'
    if (e?.data) {
      for (const [key, val] of Object.entries(e.data)) {
        errors.value[key] = Array.isArray(val) ? val.join(', ') : String(val)
      }
    }
    toast.error(msg)
  } finally {
    saving.value = false
  }
}
</script>

<style scoped>
.product-modal-card {
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
  min-height: 480px;
  max-height: 62vh;
  overflow: hidden;
}

/* ── Stepper navigation (left column) ── */
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
  position: relative;
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

.stepper-check {
  flex-shrink: 0;
}

/* ── Stepper content (right column) ── */
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

/* ── Image upload / drag-drop ── */
.image-upload-section {
  margin-bottom: 20px;
}

.image-upload-label {
  font-size: 0.875rem;
  font-weight: 700;
  color: rgba(0, 0, 0, 0.7);
  margin-bottom: 8px;
}

.image-dropzone {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  border: 2px dashed rgba(var(--v-theme-primary), 0.3);
  border-radius: 16px;
  padding: 32px 20px;
  cursor: pointer;
  transition: all 0.2s ease;
  background: rgba(var(--v-theme-primary), 0.02);
}

.image-dropzone:hover {
  border-color: rgba(var(--v-theme-primary), 0.5);
  background: rgba(var(--v-theme-primary), 0.05);
}

.image-dropzone.drag-over {
  border-color: rgb(var(--v-theme-primary));
  background: rgba(var(--v-theme-primary), 0.1);
  transform: scale(1.01);
}

.image-preview-wrapper {
  display: flex;
  gap: 16px;
  align-items: flex-start;
}

.image-preview-box {
  position: relative;
  width: 120px;
  height: 120px;
  flex-shrink: 0;
  border-radius: 16px;
  overflow: hidden;
  border: 1px solid rgba(0, 0, 0, 0.08);
}

.image-preview-box .image-overlay {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  background: rgba(0, 0, 0, 0.4);
  opacity: 0;
  transition: opacity 0.2s ease;
}

.image-preview-box:hover .image-overlay {
  opacity: 1;
}

.image-overlay-btn {
  min-width: 32px !important;
  width: 32px !important;
  height: 32px !important;
}

.image-preview-info {
  flex: 1;
  padding-top: 4px;
}

/* ── Margin card ── */
.margin-card {
  display: flex;
  align-items: center;
  background: rgba(var(--v-theme-primary), 0.05);
  border: 1px solid rgba(var(--v-theme-primary), 0.12);
  border-radius: 16px;
  padding: 16px 20px;
  margin: 16px 0;
}

.margin-item {
  flex: 1;
  text-align: center;
}

.margin-label {
  font-size: 0.75rem;
  color: rgba(0, 0, 0, 0.5);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 4px;
}

.margin-value {
  font-size: 1.25rem;
  font-weight: 800;
}

.margin-divider {
  width: 1px;
  height: 36px;
  background: rgba(var(--v-theme-primary), 0.15);
  margin: 0 16px;
}

/* ── Settings card (inventory) ── */
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

/* ── Status toggles ── */
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

/* ── Variants ── */
.empty-variants {
  text-align: center;
  padding: 48px 0;
}

.variant-row {
  background: rgba(0, 0, 0, 0.02);
  border: 1px solid rgba(0, 0, 0, 0.06);
  border-radius: 16px;
  padding: 16px;
  margin-bottom: 16px;
}

/* ── Footer ── */
.modal-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 24px;
}

/* ── Dark theme ── */
:deep(.v-theme--dark) .stepper-nav {
  border-right-color: rgba(255, 255, 255, 0.08);
}

:deep(.v-theme--dark) .stepper-num {
  background: rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.5);
}

:deep(.v-theme--dark) .stepper-desc {
  color: rgba(255, 255, 255, 0.4);
}

:deep(.v-theme--dark) .step-subtitle {
  color: rgba(255, 255, 255, 0.4);
}

:deep(.v-theme--dark) .image-upload-label {
  color: rgba(255, 255, 255, 0.7);
}

:deep(.v-theme--dark) .image-dropzone {
  background: rgba(255, 255, 255, 0.03);
  border-color: rgba(var(--v-theme-primary), 0.4);
}

:deep(.v-theme--dark) .image-preview-box {
  border-color: rgba(255, 255, 255, 0.08);
}

:deep(.v-theme--dark) .settings-card {
  background: rgba(255, 255, 255, 0.03);
  border-color: rgba(255, 255, 255, 0.08);
}

:deep(.v-theme--dark) .settings-card-label {
  color: rgba(255, 255, 255, 0.7);
}

:deep(.v-theme--dark) .toggle-item {
  background: rgba(255, 255, 255, 0.03);
  border-color: rgba(255, 255, 255, 0.08);
}

:deep(.v-theme--dark) .toggle-desc {
  color: rgba(255, 255, 255, 0.4);
}

:deep(.v-theme--dark) .variant-row {
  background: rgba(255, 255, 255, 0.03);
  border-color: rgba(255, 255, 255, 0.08);
}

:deep(.v-theme--dark) .margin-divider {
  background: rgba(255, 255, 255, 0.1);
}
</style>
