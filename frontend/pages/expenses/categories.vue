<template>
  <div class="az-page">
    <!-- ===== Header ===== -->
    <div class="az-header">
      <div class="az-header__left">
        <div class="az-header__title">
          <h1 class="text-h5 font-weight-bold">Expense Categories</h1>
          <p class="text-body-2 text-medium-emphasis">Manage and organise your expense categories</p>
        </div>
      </div>
      <div class="az-header__actions">
        <v-btn-toggle v-model="viewMode" mandatory density="compact" variant="outlined" color="primary" class="mr-1">
          <v-btn value="table" size="small" variant="text"><v-icon size="18">mdi-table-large</v-icon></v-btn>
          <v-btn value="grid" size="small" variant="text"><v-icon size="18">mdi-view-grid-outline</v-icon></v-btn>
        </v-btn-toggle>
        <v-btn variant="flat" color="primary" prepend-icon="mdi-plus" size="small" @click="openCategoryDialog">Add Category</v-btn>
        <v-btn variant="tonal" prepend-icon="mdi-refresh" size="small" @click="loadData" :loading="loading">Refresh</v-btn>
        <v-btn variant="text" prepend-icon="mdi-arrow-left" size="small" to="/expenses">Back to Expenses</v-btn>
      </div>
    </div>

    <!-- ===== Loading ===== -->
    <div v-if="loading && expenses.length === 0" class="az-loading">
      <v-progress-circular indeterminate color="primary" size="32" width="3" />
      <p class="text-body-2 text-medium-emphasis mt-3">Loading categories…</p>
    </div>

    <template v-else>
      <!-- ===== KPI Row ===== -->
      <div class="az-kpi-grid">
        <div class="az-kpi az-kpi--primary">
          <div class="az-kpi__icon az-kpi__icon--primary"><v-icon size="20">mdi-tag-multiple</v-icon></div>
          <div class="az-kpi__body">
            <p class="az-kpi__label">Total Categories</p>
            <p class="az-kpi__value">{{ categoryList.length }}</p>
            <p class="az-kpi__sub">{{ customCategories.length }} custom, {{ defaultCategories.length }} default</p>
          </div>
        </div>

        <div class="az-kpi az-kpi--success">
          <div class="az-kpi__icon az-kpi__icon--success"><v-icon size="20">mdi-check-circle</v-icon></div>
          <div class="az-kpi__body">
            <p class="az-kpi__label">Active Categories</p>
            <p class="az-kpi__value text-success">{{ activeCount }}</p>
            <p class="az-kpi__sub">used by at least one expense</p>
          </div>
        </div>

        <div class="az-kpi az-kpi--warning">
          <div class="az-kpi__icon az-kpi__icon--warning"><v-icon size="20">mdi-tag-off</v-icon></div>
          <div class="az-kpi__body">
            <p class="az-kpi__label">Unused</p>
            <p class="az-kpi__value text-warning">{{ categoryList.length - activeCount }}</p>
            <p class="az-kpi__sub">no expenses assigned</p>
          </div>
        </div>

        <div class="az-kpi az-kpi--error">
          <div class="az-kpi__icon az-kpi__icon--error"><v-icon size="20">mdi-cash-minus</v-icon></div>
          <div class="az-kpi__body">
            <p class="az-kpi__label">Total Spend</p>
            <p class="az-kpi__value text-error">{{ formatMoney(totalSpend) }}</p>
            <p class="az-kpi__sub">{{ expenses.length }} expenses total</p>
          </div>
        </div>

        <div class="az-kpi az-kpi--info">
          <div class="az-kpi__icon az-kpi__icon--info"><v-icon size="20">mdi-cash-refund</v-icon></div>
          <div class="az-kpi__body">
            <p class="az-kpi__label">Total Cost</p>
            <p class="az-kpi__value text-info">{{ formatMoney(totalCost) }}</p>
            <p class="az-kpi__sub">across all categories</p>
          </div>
        </div>

        <div class="az-kpi az-kpi--purple">
          <div class="az-kpi__icon az-kpi__icon--purple"><v-icon size="20">mdi-cash-multiple</v-icon></div>
          <div class="az-kpi__body">
            <p class="az-kpi__label">Total Retail</p>
            <p class="az-kpi__value" style="color: #7C4DFF">{{ formatMoney(totalRetail) }}</p>
            <p class="az-kpi__sub">across all categories</p>
          </div>
        </div>
      </div>

      <!-- ===== Add Category Bar ===== -->

      <!-- ===== Category Breakdown Table ===== -->
      <div v-if="viewMode === 'table'" class="az-table-wrap">
        <table class="az-table">
          <thead>
            <tr>
              <th>Category</th>
              <th class="text-right">Expenses</th>
              <th class="text-right">Total Cost</th>
              <th class="text-right">Total Retail</th>
              <th class="text-right">% Share</th>
              <th>Distribution</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(c, idx) in categoryStats" :key="c.name" class="az-table__row">
              <td class="az-table__product">
                <div class="az-cat-icon" :style="{ background: categoryColor(c.name) }">{{ (c.name || '?').charAt(0).toUpperCase() }}</div>
                <div>
                  <span class="font-weight-medium">{{ c.name || 'Uncategorized' }}</span>
                  <div class="az-cat-meta">
                    <span v-if="isDefaultCategory(c.name)" class="az-cat-badge az-cat-badge--default">Default</span>
                    <span v-else class="az-cat-badge az-cat-badge--custom">Custom</span>
                    <span class="az-cat-badge az-cat-badge--count">{{ formatMoney(c.spend) }}</span>
                  </div>
                </div>
              </td>
              <td class="text-right text-medium-emphasis">{{ c.count }}</td>
              <td class="text-right font-weight-bold text-info">{{ formatMoney(c.cost) }}</td>
              <td class="text-right font-weight-bold" style="color: #7C4DFF">{{ formatMoney(c.retail) }}</td>
              <td class="text-right text-medium-emphasis">{{ c.pct.toFixed(1) }}%</td>
              <td>
                <div class="az-bar-wrap">
                  <div class="az-bar-fill" :style="{ width: c.pct + '%', background: categoryColor(c.name) }"></div>
                </div>
              </td>
              <td>
                <div class="az-row-actions">
                  <v-btn size="small" variant="text" icon="mdi-eye-outline" color="grey-darken-1" @click="viewCategory(c.name)" />
                  <v-btn size="small" variant="text" icon="mdi-pencil-outline" color="primary" @click="openEditCategoryDialog(c.name)" />
                  <v-btn
                    v-if="!isDefaultCategory(c.name) && c.count === 0"
                    size="small"
                    variant="text"
                    icon="mdi-delete-outline"
                    color="error"
                    @click="deleteCustomCategory(c.name)"
                  />
                </div>
              </td>
            </tr>
            <tr v-if="!categoryStats.length">
              <td colspan="7" class="az-table__empty">
                <v-icon size="36" color="grey-lighten-1">mdi-tag-off</v-icon>
                <p class="text-body-2 mt-2 text-medium-emphasis">No categories found.</p>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- ===== Category Grid View ===== -->
      <div v-else class="az-cat-grid">
        <div v-for="c in categoryStats" :key="c.name" class="az-cat-grid__card">
          <div class="az-cat-grid__card-top">
            <div class="az-cat-grid__icon" :style="{ background: categoryColor(c.name) }">{{ (c.name || '?').charAt(0).toUpperCase() }}</div>
            <div class="az-row-actions">
              <v-btn size="small" variant="text" icon="mdi-eye-outline" color="grey-darken-1" density="compact" @click="viewCategory(c.name)" />
              <v-btn size="small" variant="text" icon="mdi-pencil-outline" color="primary" density="compact" @click="openEditCategoryDialog(c.name)" />
              <v-btn
                v-if="!isDefaultCategory(c.name) && c.count === 0"
                size="small"
                variant="text"
                icon="mdi-delete-outline"
                color="error"
                density="compact"
                @click="deleteCustomCategory(c.name)"
              />
            </div>
          </div>
          <div class="az-cat-grid__name">{{ c.name || 'Uncategorized' }}</div>
          <div class="az-cat-grid__badges">
            <span v-if="isDefaultCategory(c.name)" class="az-cat-badge az-cat-badge--default">Default</span>
            <span v-else class="az-cat-badge az-cat-badge--custom">Custom</span>
          </div>
          <div class="az-cat-grid__stats">
            <div class="az-cat-grid__stat">
              <span class="az-cat-grid__stat-label">Expenses</span>
              <span class="az-cat-grid__stat-value">{{ c.count }}</span>
            </div>
            <div class="az-cat-grid__stat">
              <span class="az-cat-grid__stat-label">Spend</span>
              <span class="az-cat-grid__stat-value text-error">{{ formatMoney(c.spend) }}</span>
            </div>
            <div class="az-cat-grid__stat">
              <span class="az-cat-grid__stat-label">Cost</span>
              <span class="az-cat-grid__stat-value text-info">{{ formatMoney(c.cost) }}</span>
            </div>
            <div class="az-cat-grid__stat">
              <span class="az-cat-grid__stat-label">Retail</span>
              <span class="az-cat-grid__stat-value" style="color: #7C4DFF">{{ formatMoney(c.retail) }}</span>
            </div>
          </div>
          <div class="az-cat-grid__share">
            <div class="d-flex align-center justify-space-between mb-1">
              <span class="text-caption text-medium-emphasis">Share</span>
              <span class="text-caption font-weight-bold">{{ c.pct.toFixed(1) }}%</span>
            </div>
            <div class="az-bar-wrap az-bar-wrap--full">
              <div class="az-bar-fill" :style="{ width: c.pct + '%', background: categoryColor(c.name) }"></div>
            </div>
          </div>
        </div>
        <div v-if="!categoryStats.length" class="az-table__empty">
          <v-icon size="36" color="grey-lighten-1">mdi-tag-off</v-icon>
          <p class="text-body-2 mt-2 text-medium-emphasis">No categories found.</p>
        </div>
      </div>
    </template>

    <!-- ===== Add Category Dialog ===== -->
    <v-dialog v-model="categoryDialog" max-width="520">
      <v-card rounded="xl" class="pa-2 az-cat-dialog">
        <v-card-title class="text-h6 font-weight-bold px-4 pt-4 d-flex align-center">
          <v-icon class="mr-2" color="primary">mdi-tag-plus-outline</v-icon>
          New Category
        </v-card-title>
        <v-card-text class="px-4 pb-2">
          <!-- Suggestions -->
          <p class="text-caption text-medium-emphasis mb-2">Suggestions</p>
          <div class="az-cat-dialog__suggestions">
            <button
              v-for="s in categorySuggestions"
              :key="s"
              type="button"
              class="az-cat-dialog__suggestion"
              @click="applySuggestion(s)"
            >
              <v-icon size="15" :color="suggestionColor(s)">{{ suggestionIcon(s) }}</v-icon>
              {{ s }}
            </button>
          </div>

          <v-text-field
            v-model="catForm.name"
            label="Name"
            placeholder="e.g. Rent"
            density="compact"
            variant="outlined"
            class="mt-3"
            hide-details
            @keyup.enter="saveCategoryFromDialog"
          />
          <v-text-field
            v-model="catForm.description"
            label="Description"
            placeholder="What this category covers"
            density="compact"
            variant="outlined"
            class="mt-3"
            hide-details
          />
          <v-text-field
            v-model="catForm.color"
            label="Color (hex)"
            placeholder="#6366f1"
            density="compact"
            variant="outlined"
            class="mt-3"
            hide-details
          />
          <!-- Color quick picks -->
          <div class="az-cat-dialog__colors mt-3">
            <button
              v-for="c in quickPickColors"
              :key="c"
              type="button"
              class="az-cat-dialog__swatch"
              :class="{ 'az-cat-dialog__swatch--active': catForm.color.toLowerCase() === c.toLowerCase() }"
              :style="{ background: c }"
              :aria-label="c"
              @click="catForm.color = c"
            />
          </div>
          <v-checkbox v-model="catForm.active" label="Active" density="compact" hide-details class="mt-3" />
        </v-card-text>
        <v-card-actions class="px-4 pb-4">
          <v-spacer />
          <v-btn variant="text" @click="categoryDialog = false">Cancel</v-btn>
          <v-btn variant="flat" color="primary" :disabled="!catForm.name.trim()" @click="saveCategoryFromDialog">{{ editingCategory ? 'Update' : 'Save' }}</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- ===== View Category Dialog ===== -->
    <v-dialog v-model="viewDialog" max-width="480">
      <v-card rounded="xl" class="pa-2">
        <v-card-title class="text-h6 font-weight-bold px-4 pt-4 d-flex align-center">
          <div class="az-cat-grid__icon mr-3" :style="{ background: categoryColor(viewingCategory?.name) }">{{ (viewingCategory?.name || '?').charAt(0).toUpperCase() }}</div>
          {{ viewingCategory?.name || 'Uncategorized' }}
        </v-card-title>
        <v-card-text class="px-4 pb-2">
          <div class="az-cat-view__row">
            <span class="az-cat-view__label">Type</span>
            <span>
              <span v-if="viewingCategory && isDefaultCategory(viewingCategory.name)" class="az-cat-badge az-cat-badge--default">Default</span>
              <span v-else class="az-cat-badge az-cat-badge--custom">Custom</span>
            </span>
          </div>
          <div class="az-cat-view__row">
            <span class="az-cat-view__label">Description</span>
            <span class="text-medium-emphasis">{{ categoryDescription(viewingCategory?.name) || '—' }}</span>
          </div>
          <div class="az-cat-view__row">
            <span class="az-cat-view__label">Color</span>
            <span class="d-flex align-center gap-2">
              <span class="az-cat-view__swatch" :style="{ background: categoryColor(viewingCategory?.name) }"></span>
              <code>{{ categoryColor(viewingCategory?.name) }}</code>
            </span>
          </div>
          <div class="az-cat-view__row">
            <span class="az-cat-view__label">Status</span>
            <span>
              <span class="az-cat-badge" :class="categoryActiveObj(viewingCategory?.name) ? 'az-cat-badge--custom' : 'az-cat-badge--count'">{{ categoryActiveObj(viewingCategory?.name) ? 'Active' : 'Inactive' }}</span>
            </span>
          </div>
          <v-divider class="my-3" />
          <div class="az-cat-view__stats">
            <div class="az-cat-view__stat">
              <span class="az-cat-view__stat-num">{{ viewingCategory?.count ?? 0 }}</span>
              <span class="az-cat-view__stat-label">Expenses</span>
            </div>
            <div class="az-cat-view__stat">
              <span class="az-cat-view__stat-num text-error">{{ formatMoney(viewingCategory?.spend) }}</span>
              <span class="az-cat-view__stat-label">Spend</span>
            </div>
            <div class="az-cat-view__stat">
              <span class="az-cat-view__stat-num text-info">{{ formatMoney(viewingCategory?.cost) }}</span>
              <span class="az-cat-view__stat-label">Cost</span>
            </div>
            <div class="az-cat-view__stat">
              <span class="az-cat-view__stat-num" style="color: #7C4DFF">{{ formatMoney(viewingCategory?.retail) }}</span>
              <span class="az-cat-view__stat-label">Retail</span>
            </div>
          </div>
          <div class="mt-3">
            <div class="d-flex align-center justify-space-between mb-1">
              <span class="text-caption text-medium-emphasis">Share of total cost</span>
              <span class="text-caption font-weight-bold">{{ (viewingCategory?.pct ?? 0).toFixed(1) }}%</span>
            </div>
            <div class="az-bar-wrap az-bar-wrap--full">
              <div class="az-bar-fill" :style="{ width: (viewingCategory?.pct ?? 0) + '%', background: categoryColor(viewingCategory?.name) }"></div>
            </div>
          </div>
        </v-card-text>
        <v-card-actions class="px-4 pb-4">
          <v-spacer />
          <v-btn variant="text" @click="viewDialog = false">Close</v-btn>
          <v-btn variant="flat" color="primary" prepend-icon="mdi-pencil-outline" @click="viewDialog = false; openEditCategoryDialog(viewingCategory?.name)">Edit</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup>
definePageMeta({ middleware: 'auth' })
const { currency } = useFormat()
const { success, error: errorToast } = useToast()

function formatMoney(v) { return currency(Number(v) || 0) }

// ===== Category suggestions (shown in the New Category modal) =====
const categorySuggestions = ['Rent', 'Utilities', 'Salaries', 'Supplies', 'Equipment', 'Transport', 'Marketing', 'Maintenance', 'Insurance', 'Taxes', 'Licenses', 'Miscellaneous']

// ===== Color quick picks (reference implementation palette) =====
const quickPickColors = [
  '#6366F1', '#3B82F6', '#06B6D4', '#14B8A6', '#22C55E', '#84CC16',
  '#F59E0B', '#F97316', '#EF4444', '#EC4899', '#A855F7', '#64748B',
]

const suggestionIcons = {
  Rent: 'mdi-home-outline', Utilities: 'mdi-lightbulb-outline', Salaries: 'mdi-account-cash-outline',
  Supplies: 'mdi-package-variant-closed', Equipment: 'mdi-chip', Transport: 'mdi-truck-outline',
  Marketing: 'mdi-bullhorn-outline', Maintenance: 'mdi-wrench-outline', Insurance: 'mdi-shield-check-outline',
  Taxes: 'mdi-percent-outline', Licenses: ' mdi-certificate-outline', Miscellaneous: 'mdi-dots-horizontal',
}
const suggestionDescriptions = {
  Rent: 'Premises lease, office space and rental charges',
  Utilities: 'Electricity, water, gas and internet services',
  Salaries: 'Staff wages, payroll and contractor fees',
  Supplies: 'Office and consumable supplies',
  Equipment: 'Machinery, hardware and fixture purchases',
  Transport: 'Fuel, deliveries and travel costs',
  Marketing: 'Advertising, promotions and brand campaigns',
  Maintenance: 'Repairs and upkeep of equipment and premises',
  Insurance: 'Business, asset and liability cover premiums',
  Taxes: 'Statutory taxes and levies',
  Licenses: 'Regulatory licenses and permit renewals',
  Miscellaneous: 'Other uncategorized expenses',
}
function suggestionIcon(name) { return suggestionIcons[name] || 'mdi-tag-outline' }
function suggestionColor(name) { return categoryColorFromMap(name) }

// Distinct default color per known category so grid icons and bars are not all the same.
const defaultColorMap = {
  Rent: '#3B82F6',
  Utilities: '#06B6D4',
  Salaries: '#64748B',
  Supplies: '#14B8A6',
  Equipment: '#22C55E',
  Transport: '#F59E0B',
  Marketing: '#EC4899',
  Maintenance: '#F97316',
  Insurance: '#6366F1',
  Legal: '#A855F7',
  Miscellaneous: '#64748B',
  Taxes: '#EF4444',
  Licenses: '#0EA5E9',
}

// ===== State =====
const loading = ref(false)
const expenses = ref([])
const customCategories = ref([])   // array of category objects: { name, description, color }
const newCategoryName = ref('')
const viewMode = ref('grid')

// ===== Add Category dialog =====
const categoryDialog = ref(false)
const editingCategory = ref(false)
const editingCategoryName = ref(null)
const catForm = ref({ name: '', description: '', color: '#6366F1', active: true })

// ===== View Category dialog =====
const viewDialog = ref(false)
const viewingCategory = ref(null)

const defaultCategories = ['Rent', 'Utilities', 'Salaries', 'Supplies', 'Marketing', 'Transport', 'Maintenance', 'Miscellaneous', 'Insurance', 'Legal', 'Equipment']

function loadCustomCategories() {
  try {
    const stored = localStorage.getItem('expense_custom_categories')
    if (stored) customCategories.value = JSON.parse(stored)
  } catch {}
}
function saveCustomCategories() {
  localStorage.setItem('expense_custom_categories', JSON.stringify(customCategories.value))
}

const categoryList = computed(() => {
  const fromData = [...new Set(expenses.value.map(e => e.category).filter(Boolean))]
  const all = [...new Set([...defaultCategories, ...customCategories.value.map(c => c.name || c), ...fromData])]
  return all.sort()
})

// ===== Color lookup =====
function categoryColorFromMap(name) {
  if (!name) return quickPickColors[0]
  // Custom categories take priority
  const found = customCategories.value.find(c => (c.name || c) === name)
  if (found && found.color) return found.color
  // Per-category default color
  if (defaultColorMap[name]) return defaultColorMap[name]
  // Deterministic hash-based fallback so unknown categories get varied colors
  let h = 0
  for (let i = 0; i < name.length; i++) h = ((h << 5) - h + name.charCodeAt(i)) | 0
  return quickPickColors[Math.abs(h) % quickPickColors.length]
}
function categoryColor(name) { return categoryColorFromMap(name) }

// ===== Add / Edit Category dialog helpers =====
function openCategoryDialog() {
  editingCategory.value = false
  editingCategoryName.value = null
  catForm.value = { name: '', description: '', color: '#6366F1', active: true }
  categoryDialog.value = true
}

function openEditCategoryDialog(name) {
  const obj = customCategories.value.find(c => (c.name || c) === name) || {}
  editingCategory.value = true
  editingCategoryName.value = name
  catForm.value = {
    name,
    description: obj.description || suggestionDescriptions[name] || '',
    color: obj.color || defaultColorMap[name] || '#6366F1',
    active: obj.active !== undefined ? obj.active : true,
  }
  categoryDialog.value = true
}

function viewCategory(name) {
  viewingCategory.value = categoryStats.value.find(c => c.name === name) || null
  viewDialog.value = true
}

function applySuggestion(name) {
  catForm.value.name = name
  catForm.value.description = suggestionDescriptions[name] || ''
  catForm.value.color = defaultColorMap[name] || '#6366F1'
}

function saveCategoryFromDialog() {
  const name = catForm.value.name.trim()
  if (!name) return
  if (editingCategory.value) {
    const existing = customCategories.value.find(c => (c.name || c) === editingCategoryName.value)
    if (existing) {
      existing.name = name
      existing.description = catForm.value.description.trim()
      existing.color = catForm.value.color
      existing.active = catForm.value.active
    }
    customCategories.value.sort((a, b) => (a.name || a).localeCompare(b.name || b))
    saveCustomCategories()
    categoryDialog.value = false
    success(`Category "${name}" updated`)
    return
  }
  const all = [...defaultCategories, ...customCategories.value.map(c => c.name || c), ...expenses.value.map(e => e.category).filter(Boolean)]
  if (all.some(c => c.toLowerCase() === name.toLowerCase())) {
    errorToast('Category already exists')
    return
  }
  customCategories.value.push({
    name,
    description: catForm.value.description.trim(),
    color: catForm.value.color,
    active: catForm.value.active,
  })
  customCategories.value.sort((a, b) => (a.name || a).localeCompare(b.name || b))
  saveCustomCategories()
  categoryDialog.value = false
  success(`Category "${name}" added`)
}

function addCategory() {
  // Kept for backwards compatibility — opens the modal instead of the old inline flow.
  openCategoryDialog()
}

function deleteCustomCategory(name) {
  customCategories.value = customCategories.value.filter(c => (c.name || c) !== name)
  saveCustomCategories()
  success(`Category "${name}" removed`)
}

// ===== View dialog helpers =====
function categoryDescription(name) {
  if (!name) return ''
  const found = customCategories.value.find(c => (c.name || c) === name)
  if (found && found.description) return found.description
  return suggestionDescriptions[name] || ''
}
function categoryActiveObj(name) {
  if (!name) return true
  const found = customCategories.value.find(c => (c.name || c) === name)
  return found ? (found.active !== undefined ? found.active : true) : true
}

function isDefaultCategory(name) {
  return defaultCategories.some(c => c.toLowerCase() === name.toLowerCase())
}
function isUsedCategory(name) {
  return expenses.value.some(e => e.category === name)
}
function getCategoryUsage(name) {
  return expenses.value.filter(e => e.category === name).length
}
function getCategorySpend(name) {
  return expenses.value.filter(e => e.category === name).reduce((s, e) => s + Number(e.amount), 0)
}
function getCategoryCost(name) {
  return expenses.value.filter(e => e.category === name).reduce((s, e) => s + Number(e.cost_price || 0), 0)
}
function getCategoryRetail(name) {
  return expenses.value.filter(e => e.category === name).reduce((s, e) => s + Number(e.retail_price || 0), 0)
}

// ===== KPIs =====
const activeCount = computed(() => {
  return categoryList.value.filter(c => isUsedCategory(c)).length
})
const totalSpend = computed(() => {
  return expenses.value.reduce((s, e) => s + Number(e.amount), 0)
})
const totalCost = computed(() => {
  return expenses.value.reduce((s, e) => s + Number(e.cost_price || 0), 0)
})
const totalRetail = computed(() => {
  return expenses.value.reduce((s, e) => s + Number(e.retail_price || 0), 0)
})

// ===== Category breakdown (for table) =====
const categoryStats = computed(() => {
  const items = expenses.value
  const map = {}
  // Seed every known category (defaults + custom + from data) so categories
  // with no expenses still appear in the breakdown.
  categoryList.value.forEach(c => {
    map[c] = { name: c, count: 0, spend: 0, cost: 0, retail: 0 }
  })
  items.forEach(e => {
    const c = e.category || 'Uncategorized'
    if (!map[c]) map[c] = { name: c, count: 0, spend: 0, cost: 0, retail: 0 }
    map[c].count++
    map[c].spend += Number(e.amount)
    map[c].cost += Number(e.cost_price || 0)
    map[c].retail += Number(e.retail_price || 0)
  })
  const totalCostAll = items.reduce((s, e) => s + Number(e.cost_price || 0), 0)
  return Object.values(map)
    .map(c => ({ ...c, pct: totalCostAll > 0 ? (c.cost / totalCostAll * 100) : 0 }))
    .sort((a, b) => b.cost - a.cost)
})

// ===== Data =====
async function loadData() {
  loading.value = true
  try {
    const data = await useApi()('/accounting/expenses/?page_size=500')
    expenses.value = data.results || data
  } catch { /* ignore */ } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadCustomCategories()
  loadData()
})
</script>

<style scoped>
/* ===== Page wrapper ===== */
.az-page {
  padding: 20px 24px;
  max-width: 1600px;
  margin: 0 auto;
  font-family: "Segoe UI Variable", Inter, system-ui, sans-serif;
}

/* ===== Header ===== */
.az-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
  flex-wrap: wrap;
  gap: 12px;
}
.az-header__left { display: flex; flex-direction: column; gap: 4px; }
.az-header__title h1 { letter-spacing: -0.02em; line-height: 1.2; }
.az-header__actions { display: flex; gap: 8px; align-items: center; flex-wrap: wrap; }

/* ===== Loading ===== */
.az-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 300px;
}

/* ===== KPI Grid ===== */
.az-kpi-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 12px;
  margin-bottom: 20px;
}
.az-kpi {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 14px 16px;
  border-radius: 14px;
  background: rgb(var(--v-theme-surface));
  border: 1px solid rgba(var(--v-theme-on-surface), 0.08);
  transition: box-shadow 0.2s;
  overflow: hidden;
  position: relative;
}
.az-kpi::before {
  content: '';
  position: absolute;
  left: 0; top: 0; bottom: 0;
  width: 3px;
  border-radius: 0 3px 3px 0;
}
.az-kpi:hover { box-shadow: 0 2px 16px rgba(0, 0, 0, 0.06); transform: translateY(-1px); }
.az-kpi__icon {
  width: 40px; height: 40px;
  border-radius: 10px;
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
}
.az-kpi__icon--success { background: rgba(76, 175, 80, 0.12); color: rgb(76, 175, 80); }
.az-kpi__icon--error   { background: rgba(239, 68, 68, 0.12); color: rgb(239, 68, 68); }
.az-kpi__icon--warning { background: rgba(255, 152, 0, 0.12); color: rgb(255, 152, 0); }
.az-kpi__icon--primary { background: rgba(52, 120, 246, 0.12); color: #3478f6; }
.az-kpi__body { min-width: 0; overflow: hidden; flex: 1 1 0; }
.az-kpi__label { font-size: 0.6875rem; color: rgba(var(--v-theme-on-surface), 0.5); text-transform: uppercase; letter-spacing: 0.06em; font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.az-kpi__value { font-size: 1.25rem; font-weight: 800; letter-spacing: -0.02em; margin-top: 2px; line-height: 1.2; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.az-kpi__sub { font-size: 0.6875rem; color: rgba(var(--v-theme-on-surface), 0.4); margin-top: 4px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }

/* ===== KPI icon variants ===== */
.az-kpi__icon--info { background: rgba(33, 150, 243, 0.12); color: rgb(33, 150, 243); }
.az-kpi__icon--purple { background: rgba(124, 77, 255, 0.12); color: #7C4DFF; }
.az-kpi__icon--teal { background: rgba(0, 184, 212, 0.12); color: #00B8D4; }

/* ===== KPI accent bars ===== */
.az-kpi--primary::before { background: #3478f6; }
.az-kpi--success::before { background: rgb(76, 175, 80); }
.az-kpi--warning::before { background: rgb(255, 152, 0); }
.az-kpi--error::before   { background: rgb(239, 68, 68); }
.az-kpi--info::before    { background: rgb(33, 150, 243); }
.az-kpi--purple::before  { background: #7C4DFF; }

/* ===== Category table ===== */
.az-table-wrap {
  background: rgb(var(--v-theme-surface));
  border: 1px solid rgba(var(--v-theme-on-surface), 0.08);
  border-radius: 14px;
  overflow: hidden;
}
.az-table { width: 100%; border-collapse: collapse; }
.az-table thead th {
  text-align: left;
  font-size: 0.6875rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: rgba(var(--v-theme-on-surface), 0.5);
  padding: 12px 16px;
  background: rgba(var(--v-theme-on-surface), 0.03);
  border-bottom: 1px solid rgba(var(--v-theme-on-surface), 0.08);
  white-space: nowrap;
}
.az-table__row { border-bottom: 1px solid rgba(var(--v-theme-on-surface), 0.05); transition: background 0.15s; }
.az-table__row:hover { background: rgba(var(--v-theme-on-surface), 0.03); }
.az-table__row:last-child { border-bottom: none; }
.az-table td { padding: 12px 16px; font-size: 0.8125rem; vertical-align: middle; }
.az-table__product { display: flex; align-items: center; gap: 10px; }
.az-cat-meta { display: flex; gap: 4px; margin-top: 3px; flex-wrap: wrap; }

/* ===== Category badges ===== */
.az-cat-badge {
  display: inline-flex;
  align-items: center;
  padding: 1px 7px;
  border-radius: 4px;
  font-size: 0.6875rem;
  font-weight: 600;
}
.az-cat-badge--default { background: rgba(100, 116, 139, 0.12); color: rgb(100, 116, 139); }
.az-cat-badge--custom { background: rgba(52, 120, 246, 0.12); color: #3478f6; }
.az-cat-badge--count { background: rgba(var(--v-theme-on-surface), 0.06); color: rgba(var(--v-theme-on-surface), 0.5); }
.az-cat-badge--spend { background: rgba(239, 68, 68, 0.1); color: rgb(239, 68, 68); }

/* ===== Distribution bar ===== */
.az-bar-wrap {
  width: 120px;
  height: 6px;
  border-radius: 3px;
  background: rgba(var(--v-theme-on-surface), 0.06);
  overflow: hidden;
}
.az-bar-wrap--full { width: 100%; }
.az-bar-fill {
  height: 100%;
  border-radius: 3px;
  transition: width 0.4s ease;
}
.az-bar-fill--info { background: linear-gradient(90deg, #2196f3, #3478f6); }

/* ===== Category grid view ===== */
.az-cat-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 14px;
}
.az-cat-grid__card {
  background: rgb(var(--v-theme-surface));
  border: 1px solid rgba(var(--v-theme-on-surface), 0.08);
  border-radius: 14px;
  padding: 16px;
  transition: box-shadow 0.2s, border-color 0.15s;
}
.az-cat-grid__card:hover { box-shadow: 0 4px 20px rgba(0, 0, 0, 0.07); border-color: rgba(52, 120, 246, 0.2); }
.az-cat-grid__card-top { display: flex; align-items: flex-start; justify-content: space-between; }
.az-cat-grid__icon {
  width: 40px; height: 40px;
  border-radius: 10px;
  display: flex; align-items: center; justify-content: center;
  font-weight: 800; font-size: 1rem;
  color: #fff;
}
.az-cat-grid__name { font-size: 0.95rem; font-weight: 700; margin-top: 10px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.az-cat-grid__badges { display: flex; gap: 4px; margin-top: 6px; }
.az-cat-grid__stats {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
  margin-top: 14px;
  padding-top: 12px;
  border-top: 1px solid rgba(var(--v-theme-on-surface), 0.06);
}
.az-cat-grid__stat { display: flex; flex-direction: column; gap: 2px; }
.az-cat-grid__stat-label { font-size: 0.6875rem; color: rgba(var(--v-theme-on-surface), 0.5); text-transform: uppercase; letter-spacing: 0.04em; font-weight: 600; }
.az-cat-grid__stat-value { font-size: 0.85rem; font-weight: 700; }
.az-cat-grid__share { margin-top: 14px; }

/* ===== Category icon ===== */
.az-cat-icon {
  width: 28px; height: 28px;
  border-radius: 6px;
  display: flex; align-items: center; justify-content: center;
  font-weight: 800;
  font-size: 0.75rem;
  color: #fff;
  flex-shrink: 0;
}
.az-cat-icon--0 { background: linear-gradient(135deg, #3478f6, #1e40af); }
.az-cat-icon--1 { background: linear-gradient(135deg, #10b981, #047857); }
.az-cat-icon--2 { background: linear-gradient(135deg, #f59e0b, #d97706); }
.az-cat-icon--3 { background: linear-gradient(135deg, #f43f5e, #be123c); }
.az-cat-icon--4 { background: linear-gradient(135deg, #7C4DFF, #6200EA); }

/* ===== Empty state ===== */
.az-table__empty { text-align: center; padding: 40px 16px; color: rgba(var(--v-theme-on-surface), 0.4); }

/* ===== Row actions ===== */
.az-row-actions { display: flex; align-items: center; gap: 2px; }

/* ===== View Category dialog ===== */
.az-cat-view__row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 0;
  font-size: 0.85rem;
}
.az-cat-view__label { color: rgba(var(--v-theme-on-surface), 0.5); font-weight: 600; font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.04em; }
.az-cat-view__swatch { display: inline-block; width: 16px; height: 16px; border-radius: 4px; margin-right: 4px; vertical-align: middle; }
.az-cat-view__stats {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}
.az-cat-view__stat { display: flex; flex-direction: column; gap: 2px; }
.az-cat-view__stat-num { font-size: 1rem; font-weight: 800; }
.az-cat-view__stat-label { font-size: 0.6875rem; color: rgba(var(--v-theme-on-surface), 0.5); text-transform: uppercase; letter-spacing: 0.04em; font-weight: 600; }
.gap-2 { gap: 8px; }

/* ===== New Category dialog ===== */
.az-cat-dialog__suggestions {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}
.az-cat-dialog__suggestion {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 10px;
  border-radius: 999px;
  border: 1px solid rgba(var(--v-theme-on-surface), 0.12);
  background: rgba(var(--v-theme-on-surface), 0.03);
  font-size: 0.75rem;
  font-weight: 500;
  color: rgba(var(--v-theme-on-surface), 0.7);
  cursor: pointer;
  transition: border-color 0.15s, background 0.15s;
}
.az-cat-dialog__suggestion:hover { border-color: rgba(52, 120, 246, 0.4); background: rgba(52, 120, 246, 0.06); }
.az-cat-dialog__colors {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}
.az-cat-dialog__swatch {
  width: 22px;
  height: 22px;
  border-radius: 50%;
  border: 2px solid transparent;
  cursor: pointer;
  padding: 0;
  transition: transform 0.12s;
}
.az-cat-dialog__swatch:hover { transform: scale(1.15); }
.az-cat-dialog__swatch--active { border-color: rgba(var(--v-theme-on-surface), 0.85); transform: scale(1.1); }

/* ===== Mobile ===== */
@media (max-width: 768px) {
  .az-page { padding: 12px; }
  .az-kpi-grid { grid-template-columns: 1fr 1fr; }
  .az-header__actions { width: 100%; }
}
</style>
