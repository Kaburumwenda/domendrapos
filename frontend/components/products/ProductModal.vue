<template>
  <v-dialog :model-value="show" @update:model-value="$emit('close')" max-width="900" scrollable>
    <v-card rounded="xl">
      <!-- Header -->
      <v-card-title class="d-flex align-center justify-space-between pa-6 pb-4">
        <div class="d-flex align-center ga-3">
          <v-avatar color="primary" size="40" rounded="lg">
            <v-icon size="20">mdi-package-variant-closed</v-icon>
          </v-avatar>
          <div>
            <div class="text-h6 font-weight-bold">{{ isEdit ? 'Edit Product' : 'Add New Product' }}</div>
            <div class="text-body-2 text-medium-emphasis">{{ isEdit ? 'Update product details and pricing' : 'Create a new product in your catalog' }}</div>
          </div>
        </div>
        <v-btn icon variant="text" size="small" @click="$emit('close')">
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-card-title>

      <v-divider />

      <!-- Tabs -->
      <v-tabs v-model="activeTab" color="primary">
        <v-tab v-for="tab in tabs" :key="tab.id" :value="tab.id">{{ tab.label }}</v-tab>
      </v-tabs>
      <v-divider />

      <v-card-text class="pa-6" style="max-height: 60vh; overflow-y: auto;">
        <v-window v-model="activeTab">
          <!-- Tab: Basic Info -->
          <v-window-item value="info">
            <v-row>
              <v-col cols="12">
                <v-text-field
                  v-model="form.name"
                  label="Product Name"
                  variant="outlined"
                  density="comfortable"
                  required
                  :error-messages="errors.name"
                  placeholder="e.g., Coca Cola 500ml"
                />
              </v-col>
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
              <v-col cols="12">
                <v-textarea
                  v-model="form.description"
                  label="Description"
                  variant="outlined"
                  density="comfortable"
                  rows="3"
                  placeholder="Product description, features, specifications..."
                />
              </v-col>
            </v-row>
          </v-window-item>

          <!-- Tab: Pricing -->
          <v-window-item value="pricing">
            <v-row>
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
                  :error-messages="errors.retail_price"
                  placeholder="0.00"
                />
              </v-col>
              <v-col cols="12" sm="4">
                <v-text-field
                  v-model="form.wholesale_price"
                  :label="`Wholesale Price (${symbol})`"
                  variant="outlined"
                  density="comfortable"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                />
              </v-col>
            </v-row>

            <!-- Margin summary -->
            <v-card variant="tonal" color="primary" class="my-4">
              <v-card-text class="d-flex ga-4">
                <div class="flex-1">
                  <div class="text-body-2 text-medium-emphasis">Profit Margin</div>
                  <div class="text-h6 font-weight-bold" :class="marginClass">{{ marginDisplay }}</div>
                </div>
                <div class="flex-1">
                  <div class="text-body-2 text-medium-emphasis">Markup</div>
                  <div class="text-h6 font-weight-bold" :class="marginClass">{{ markupDisplay }}</div>
                </div>
                <div class="flex-1">
                  <div class="text-body-2 text-medium-emphasis">Profit per Unit</div>
                  <div class="text-h6 font-weight-bold" :class="profitPositive ? 'text-success' : 'text-error'">{{ symbol }}{{ profitPerUnit }}</div>
                </div>
              </v-card-text>
            </v-card>

            <v-row>
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
                />
              </v-col>
            </v-row>
          </v-window-item>

          <!-- Tab: Inventory -->
          <v-window-item value="inventory">
            <v-card variant="tonal" class="mb-4">
              <v-card-text>
                <div class="text-body-1 font-weight-medium mb-3">Initial Stock Settings</div>
                <v-row>
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
                    />
                  </v-col>
                </v-row>
              </v-card-text>
            </v-card>

            <v-row>
              <v-col cols="12" sm="6">
                <v-text-field
                  v-model="form.weight"
                  label="Weight (kg)"
                  variant="outlined"
                  density="comfortable"
                  type="number"
                  step="0.001"
                  min="0"
                  placeholder="0.000"
                />
              </v-col>
              <v-col cols="12" sm="6">
                <v-text-field
                  v-model="form.dimensions"
                  label="Dimensions (LxWxH)"
                  variant="outlined"
                  density="comfortable"
                  placeholder="e.g., 10x20x30 cm"
                />
              </v-col>
            </v-row>

            <div class="d-flex flex-column ga-2">
              <v-checkbox v-model="form.track_inventory" label="Track Inventory — Enable stock level tracking" density="compact" hide-details />
              <v-checkbox v-model="form.is_sellable" label="Sellable — Product can be sold in POS" density="compact" hide-details />
              <v-checkbox v-model="form.is_purchasable" label="Purchasable — Product can be bought from suppliers" density="compact" hide-details />
              <v-checkbox v-model="form.is_active" label="Active — Product is visible and available for transactions" density="compact" hide-details />
            </div>
          </v-window-item>

          <!-- Tab: Variants -->
          <v-window-item value="variants">
            <div class="d-flex align-center justify-space-between mb-4">
              <div>
                <div class="text-body-1 font-weight-medium">Product Variants</div>
                <div class="text-body-2 text-medium-emphasis">Add size, colour, or other variant options</div>
              </div>
              <v-btn color="primary" variant="tonal" prepend-icon="mdi-plus" @click="addVariant">Add Variant</v-btn>
            </div>

            <div v-if="form.variants.length === 0" class="text-center py-8 text-medium-emphasis">
              <v-icon size="48" class="mb-2">mdi-package-variant</v-icon>
              <p class="text-body-2">No variants. This product has a single SKU.</p>
            </div>

            <div v-for="(variant, i) in form.variants" :key="i" class="border-t-thin pt-4 mb-4">
              <div class="d-flex align-center justify-space-between mb-3">
                <span class="text-body-2 font-weight-medium">Variant {{ i + 1 }}</span>
                <v-btn variant="text" color="error" size="small" prepend-icon="mdi-delete" @click="removeVariant(i)">Remove</v-btn>
              </div>
              <v-row>
                <v-col cols="12" sm="6" md="3">
                  <v-text-field v-model="variant.name" label="Variant name" variant="outlined" density="compact" placeholder="e.g., Large Red" />
                </v-col>
                <v-col cols="12" sm="6" md="3">
                  <v-text-field v-model="variant.sku_suffix" label="SKU suffix" variant="outlined" density="compact" placeholder="SKU suffix" />
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
      </v-card-text>

      <v-divider />
      <v-card-actions class="justify-end pa-4">
        <v-btn variant="text" @click="$emit('close')">Cancel</v-btn>
        <v-btn color="primary" :loading="saving" @click="save">{{ isEdit ? 'Update Product' : 'Create Product' }}</v-btn>
      </v-card-actions>
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
const tabs = [
  { id: 'info', label: 'Basic Info' },
  { id: 'pricing', label: 'Pricing' },
  { id: 'inventory', label: 'Inventory' },
  { id: 'variants', label: 'Variants' },
]

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
  } else {
    Object.assign(form, defaultForm())
  }
  errors.value = {}
  activeTab.value = 'info'
}, { immediate: true })

watch(() => props.show, (val) => {
  if (val && !props.product) {
    Object.assign(form, defaultForm())
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
  if (form.retail_price === '' || form.retail_price < 0) errors.value.retail_price = 'Enter a valid retail price'
  return Object.keys(errors.value).length === 0
}

async function save() {
  if (!validate()) {
    if (errors.value.name || errors.value.sku) activeTab.value = 'info'
    else if (errors.value.cost_price || errors.value.retail_price) activeTab.value = 'pricing'
    toast.error('Please fix the errors before saving')
    return
  }

  saving.value = true
  try {
    const { variants, ...productData } = form
    const payload = {
      ...productData,
      category: productData.category || null,
    }

    let result
    if (isEdit.value) {
      result = await useApi()(`/products/${props.product.id}/`, {
        method: 'PATCH',
        body: payload,
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
