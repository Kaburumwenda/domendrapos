<template>
  <v-container class="pa-0" fluid>
    <!-- Top-level tab bar -->
    <v-card rounded="t-lg" class="mb-4" flat border>
      <v-tabs v-model="activeMainTab" color="primary" density="comfortable" show-arrows>
        <v-tab value="products" @click="activeMainTab = 'products'">
          <v-icon size="16" start>mdi-package-variant-closed</v-icon>
          Stock Items
          <v-chip size="x-small" class="ml-2" :color="activeMainTab === 'products' ? 'primary' : 'default'">{{
            pagination.count }}</v-chip>
        </v-tab>
        <v-tab value="categories" @click="activeMainTab = 'categories'">
          <v-icon size="16" start>mdi-tag-multiple</v-icon>
          Categories
          <v-chip size="x-small" class="ml-2" :color="activeMainTab === 'categories' ? 'primary' : 'default'">{{
            categories.length }}</v-chip>
        </v-tab>
        <v-tab value="units" @click="switchToUnits">
          <v-icon size="16" start>mdi-ruler</v-icon>
          Units
          <v-chip size="x-small" class="ml-2" :color="activeMainTab === 'units' ? 'primary' : 'default'">{{
            units.length }}</v-chip>
        </v-tab>
        <v-tab value="brands" @click="switchToBrands">
          <v-icon size="16" start>mdi-tag</v-icon>
          Brands
          <v-chip size="x-small" class="ml-2" :color="activeMainTab === 'brands' ? 'primary' : 'default'">{{
            brands.length }}</v-chip>
        </v-tab>
      </v-tabs>
    </v-card>

    <!-- ==================== PRODUCTS TAB ==================== -->
    <template v-if="activeMainTab === 'products'">
      <!-- Page header -->
      <v-row class="d-flex align-center justify-space-between mb-4">
        <v-col cols="12" sm="6" class="d-flex align-center">
          <div>
            <div class="text-h5 font-weight-bold">Stock Items</div>
            <div class="text-body-2 text-medium-emphasis">{{ stats.totalProducts }} items across {{ categories.length }}
              categories</div>
          </div>
        </v-col>
        <v-col cols="12" sm="6" class="d-flex justify-end ga-2 flex-wrap">
          <v-btn variant="outlined" prepend-icon="mdi-microsoft-excel" color="success" @click="goToExcelBulk">
            Import / Export
          </v-btn>
          <v-btn variant="outlined" prepend-icon="mdi-tag-multiple" @click="activeMainTab = 'categories'">
            Manage Categories
          </v-btn>
          <v-btn color="primary" prepend-icon="mdi-plus" @click="openAddProduct">
            Add Stock Item
          </v-btn>
        </v-col>
      </v-row>

      <!-- Stats cards -->
      <v-row class="mb-4">
        <v-col cols="6" lg="3">
          <v-card class="pa-5 bg-surface" flat border style="border-top: 4px solid rgb(var(--v-theme-blue)) !important; border-radius: 10px !important;">
            <div class="d-flex align-start justify-space-between">
              <div>
                <div class="text-caption text-medium-emphasis text-uppercase">Total Items</div>
                <div class="text-h5 font-weight-bold mt-2">{{ stats.totalProducts }}</div>
              </div>
              <v-avatar color="blue-lighten-5" rounded="lg" size="40">
                <v-icon color="blue">mdi-package-variant-closed</v-icon>
              </v-avatar>
            </div>
          </v-card>
        </v-col>
        <v-col cols="6" lg="3">
          <v-card class="pa-5 bg-surface" flat border style="border-top: 4px solid rgb(var(--v-theme-green)) !important; border-radius: 10px !important;">
            <div class="d-flex align-start justify-space-between">
              <div>
                <div class="text-caption text-medium-emphasis text-uppercase">Active</div>
                <div class="text-h5 font-weight-bold text-success mt-2">{{ stats.activeProducts }}</div>
              </div>
              <v-avatar color="green-lighten-5" rounded="lg" size="40">
                <v-icon color="green">mdi-check-circle</v-icon>
              </v-avatar>
            </div>
          </v-card>
        </v-col>
        <v-col cols="6" lg="3">
          <v-card class="pa-5 bg-surface" flat border style="border-top: 4px solid rgb(var(--v-theme-deep-purple)) !important; border-radius: 10px !important;">
            <div class="d-flex align-start justify-space-between">
              <div>
                <div class="text-caption text-medium-emphasis text-uppercase">Catalog Value</div>
                <div class="text-h5 font-weight-bold mt-2">{{ currency(stats.catalogValue) }}</div>
              </div>
              <v-avatar color="purple-lighten-5" rounded="lg" size="40">
                <v-icon color="purple">mdi-cash</v-icon>
              </v-avatar>
            </div>
          </v-card>
        </v-col>
        <v-col cols="6" lg="3">
          <v-card class="pa-5 bg-surface" flat border style="border-top: 4px solid rgb(var(--v-theme-amber)) !important; border-radius: 10px !important;">
            <div class="d-flex align-start justify-space-between">
              <div>
                <div class="text-caption text-medium-emphasis text-uppercase">Potential Revenue</div>
                <div class="text-h5 font-weight-bold text-primary mt-2">{{ currency(stats.potentialRevenue) }}</div>
              </div>
              <v-avatar color="amber-lighten-5" rounded="lg" size="40">
                <v-icon color="amber">mdi-chart-line-variant</v-icon>
              </v-avatar>
            </div>
          </v-card>
        </v-col>
      </v-row>

      <!-- Toolbar -->
      <v-card rounded="xl" class="pa-4 mb-4" flat border>
        <v-row density="comfortable">
          <!-- Search -->
          <v-col cols="12" lg="4">
            <v-text-field v-model="searchQuery" @update:model-value="onSearchInput" placeholder="Search by name, SKU, barcode, brand..."
              variant="outlined" density="compact" prepend-inner-icon="mdi-magnify" clearable
              @click:clear="clearSearch" hide-details />
          </v-col>

          <!-- Category filter -->
          <v-col cols="6" lg="2">
            <v-select v-model="filterCategory" @update:model-value="loadProducts" :items="categoryItems" item-title="name"
              item-value="id" label="All Categories" variant="outlined" density="compact" hide-details />
          </v-col>

          <!-- Status filter -->
          <v-col cols="6" lg="2">
            <v-select v-model="filterStatus" @update:model-value="loadProducts" :items="statusFilterItems"
              item-title="title" item-value="value" label="All Status" variant="outlined" density="compact"
              hide-details />
          </v-col>

          <!-- Type filter -->
          <v-col cols="6" lg="2">
            <v-select v-model="filterType" @update:model-value="loadProducts" :items="typeFilterItems"
              item-title="title" item-value="value" label="All Types" variant="outlined" density="compact"
              hide-details />
          </v-col>

          <!-- Sort -->
          <v-col cols="6" lg="2">
            <v-select v-model="sortBy" @update:model-value="loadProducts" :items="sortItems" item-title="title"
              item-value="value" label="Sort" variant="outlined" density="compact" hide-details />
          </v-col>

          <!-- Date range + view toggle row -->
          <v-col cols="12" class="d-flex flex-wrap ga-2 align-center">
            <v-card variant="outlined" density="compact" class="d-flex align-center ga-1 pa-1" flat>
              <v-select v-model="dateField" @update:model-value="loadProducts" :items="[{ title: 'Created', value: 'created' }, { title: 'Updated', value: 'updated' }]"
                variant="plain" density="compact" hide-details style="max-width: 110px;" />
              <v-text-field v-model="dateFrom" type="date" @update:model-value="loadProducts" variant="plain"
                density="compact" hide-details style="max-width: 150px;" label="From" />
              <v-icon size="small">mdi-arrow-right</v-icon>
              <v-text-field v-model="dateTo" type="date" @update:model-value="loadProducts" variant="plain"
                density="compact" hide-details style="max-width: 150px;" label="To" />
              <v-btn v-if="dateFrom || dateTo" icon="mdi-close" size="x-small" variant="text"
                @click="dateFrom = ''; dateTo = ''; loadProducts()" />
            </v-card>

            <v-spacer />

            <v-btn-toggle v-model="viewMode" mandatory density="compact" variant="outlined" divided>
              <v-btn value="table" size="small" icon="mdi-table" />
              <v-btn value="grid" size="small" icon="mdi-view-module" />
            </v-btn-toggle>
          </v-col>
        </v-row>
      </v-card>

      <!-- Active filters summary -->
      <div v-if="hasActiveFilters" class="d-flex align-center flex-wrap ga-2 mb-4">
        <span class="text-body-2 text-medium-emphasis">Filters:</span>
        <v-chip v-if="searchQuery" size="small" color="primary" closable @click:close="clearSearch">
          Search: "{{ searchQuery }}"
        </v-chip>
        <v-chip v-if="filterCategory" size="small" color="indigo" closable
          @click:close="filterCategory = ''; loadProducts()">
          Category: {{ getCategoryName(filterCategory) }}
        </v-chip>
        <v-chip v-if="filterStatus" size="small" color="amber" closable
          @click:close="filterStatus = ''; loadProducts()">
          Status: {{ filterStatus === 'true' ? 'Active' : 'Inactive' }}
        </v-chip>
        <v-chip v-if="filterType" size="small" color="purple" closable
          @click:close="filterType = ''; loadProducts()">
          Type: {{ filterType }}
        </v-chip>
        <v-chip v-if="dateFrom || dateTo" size="small" color="cyan" closable
          @click:close="dateFrom = ''; dateTo = ''; loadProducts()">
          {{ dateField === 'created' ? 'Created' : 'Updated' }}: {{ dateFrom || '...' }} → {{ dateTo || '...' }}
        </v-chip>
        <v-btn variant="text" size="small" color="error" @click="clearAllFilters">Clear all</v-btn>
      </div>

      <!-- Bulk Edit Mode Toolbar -->
      <v-card v-show="bulkEditMode && viewMode === 'table'" color="amber-lighten-5" variant="outlined"
        class="pa-4 mb-4 d-flex align-center justify-space-between ga-4" rounded="lg">
        <div class="d-flex align-center ga-3">
          <v-icon color="amber">mdi-pencil-edit</v-icon>
          <div>
            <div class="text-body-1 font-weight-bold">Bulk Edit Mode</div>
            <div class="text-caption text-medium-emphasis">Edit cells directly like a spreadsheet. Changed rows are
              highlighted.</div>
          </div>
        </div>
        <div class="d-flex align-center ga-2">
          <span v-if="bulkEditChangedCount > 0" class="text-body-2 text-amber-darken-2 font-weight-medium">{{
            bulkEditChangedCount }} row(s) changed</span>
          <v-btn variant="text" @click="cancelBulkEdit">Cancel</v-btn>
          <v-btn color="success" prepend-icon="mdi-content-save" :disabled="bulkEditSaving || bulkEditChangedCount === 0"
            :loading="bulkEditSaving" @click="saveBulkEdit">
            Save Changes
          </v-btn>
        </div>
      </v-card>

      <!-- Loading state -->
      <v-card v-if="loading" flat border rounded="xl" class="py-16 d-flex flex-column align-center justify-center ga-4">
        <v-progress-circular indeterminate color="primary" size="48" width="4" />
        <div class="text-body-2 text-medium-emphasis">Loading stock items...</div>
      </v-card>

      <!-- Empty state -->
      <v-card v-else-if="products.length === 0" flat border rounded="xl" class="py-16 text-center">
        <v-avatar color="primary-lighten-5" size="80" class="mb-4">
          <v-icon color="primary" size="40">mdi-package-variant-closed</v-icon>
        </v-avatar>
        <div class="text-h6 font-weight-bold mb-1">No stock items found</div>
        <div class="text-body-2 text-medium-emphasis mb-4">{{
          hasActiveFilters ? 'Try adjusting your filters or search query.' : 'Get started by adding your first stock item.'
        }}</div>
        <div class="d-flex justify-center ga-2">
          <v-btn v-if="!hasActiveFilters" color="primary" prepend-icon="mdi-plus" @click="openAddProduct">
            Add Stock Item
          </v-btn>
          <v-btn v-else variant="outlined" prepend-icon="mdi-filter-remove-outline" @click="clearAllFilters">Clear Filters</v-btn>
        </div>
      </v-card>

      <!-- Table View -->
      <v-card v-else-if="viewMode === 'table'" flat border rounded="xl" class="overflow-hidden">
        <v-table density="compact" hover>
          <thead class="bg-grey-lighten-4">
            <tr>
              <th class="text-left" style="min-width: 44px;">
                <v-checkbox v-if="!bulkEditMode" hide-details density="compact" @update:model-value="toggleSelectAll"
                  :model-value="allSelected" />
              </th>
              <th class="text-left" style="min-width: 200px;">Product</th>
              <th class="text-left">Category</th>
              <th class="text-left">Type</th>
              <th class="text-center">Qty</th>
              <th class="text-center">Expiry</th>
              <th class="text-right">Cost</th>
              <th class="text-right">Retail</th>
              <th class="text-center">Margin</th>
              <th class="text-center">Status</th>
              <th class="text-right" style="min-width: 116px;">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="product in products" :key="product.id"
              :class="bulkEditMode ? (bulkEditChanges[product.id] ? 'bg-amber-lighten-5' : '') : (selectedIds.includes(product.id) ? 'bg-primary-lighten-5' : '')"
              class="hover:bg-grey-lighten-2">
              <td>
                <v-checkbox v-if="!bulkEditMode" v-model="selectedIds" :value="product.id" hide-details density="compact" />
                <span v-else class="text-caption text-medium-emphasis">{{ product.id }}</span>
              </td>
              <!-- Product name + SKU -->
              <td>
                <template v-if="bulkEditMode">
                  <v-text-field :model-value="bulkEditField(product, 'name')"
                    @update:model-value="setBulkEditField(product, 'name', $event)" variant="outlined" density="compact"
                    hide-details class="mb-1" />
                  <v-text-field :model-value="bulkEditField(product, 'sku')"
                    @update:model-value="setBulkEditField(product, 'sku', $event)" variant="outlined" density="compact"
                    hide-details style="max-width: 180px;" />
                </template>
                <template v-else>
                  <div class="d-flex align-center ga-3">
                    <v-avatar size="40" rounded="lg" :color="product.is_active ? productColor(product) : 'grey-lighten-2'">
                      <v-img v-if="product.image" :src="product.image" cover />
                      <span v-else class="text-body-2 font-weight-bold" :class="product.is_active ? 'text-white' : 'text-medium-emphasis'">{{
                        product.name.charAt(0).toUpperCase() }}</span>
                    </v-avatar>
                    <div>
                      <div class="text-body-2 font-weight-bold" :class="product.is_active ? '' : 'text-medium-emphasis'">{{ product.name }}</div>
                      <div class="text-caption text-disabled font-weight-medium">{{ product.sku }}<span
                          v-if="product.barcode"> · {{ product.barcode }}</span></div>
                    </div>
                  </div>
                </template>
              </td>
              <!-- Category -->
              <td>
                <v-select v-if="bulkEditMode" :model-value="bulkEditField(product, 'category')"
                  @update:model-value="setBulkEditField(product, 'category', $event)" :items="categories"
                  item-title="name" item-value="id" variant="outlined" density="compact" hide-details clearable
                  class="mb-1" />
                <template v-else>
                  <v-chip v-if="product.category_name" size="small" variant="tonal" color="grey">{{ product.category_name }}</v-chip>
                  <span v-else class="text-disabled">—</span>
                </template>
              </td>
              <!-- Type -->
              <td>
                <v-select v-if="bulkEditMode" :model-value="bulkEditField(product, 'product_type')"
                  @update:model-value="setBulkEditField(product, 'product_type', $event)" :items="typeBulkItems"
                  item-title="title" item-value="value" variant="outlined" density="compact" hide-details />
                <v-chip v-else size="small" variant="tonal" :color="typeColor(product.product_type)" class="text-capitalize">{{ product.product_type }}</v-chip>
              </td>
              <!-- Qty -->
              <td class="text-center">
                <v-chip size="small" variant="flat" :color="qtyColor(product.quantity_on_hand)">
                  {{ product.quantity_on_hand || 0 }}
                </v-chip>
                <span v-if="product.unit" class="text-caption text-disabled ml-1">{{ product.unit }}</span>
                <div v-if="product.items_per_unit > 1" class="text-caption text-disabled">{{ product.items_per_unit }} pcs/unit</div>
              </td>
              <!-- Expiry -->
              <td class="text-center">
                <v-chip v-if="product.expiry_date" size="small" variant="tonal" :color="expiryColor(product.expiry_date)">
                  {{ formatDate(product.expiry_date) }}
                </v-chip>
                <span v-else class="text-disabled">—</span>
              </td>
              <!-- Cost -->
              <td class="text-right text-body-2 text-medium-emphasis">
                <v-text-field v-if="bulkEditMode" type="number" step="0.01"
                  :model-value="bulkEditField(product, 'cost_price')"
                  @update:model-value="setBulkEditField(product, 'cost_price', $event)" variant="outlined"
                  density="compact" hide-details style="max-width: 100px; text-align: right;" />
                <template v-else>{{ currency(product.cost_price) }}</template>
              </td>
              <!-- Retail -->
              <td class="text-right font-weight-bold text-body-1">
                <v-text-field v-if="bulkEditMode" type="number" step="0.01"
                  :model-value="bulkEditField(product, 'retail_price')"
                  @update:model-value="setBulkEditField(product, 'retail_price', $event)" variant="outlined"
                  density="compact" hide-details style="max-width: 100px; text-align: right;" />
                <template v-else>{{ currency(product.retail_price) }}</template>
              </td>
              <!-- Margin -->
              <td class="text-center">
                <v-chip v-if="getMarginPct(bulkEditMode ? bulkEditRow(product) : product) !== '—'"
                  size="small" variant="flat" :color="getMarginChipColor(bulkEditMode ? bulkEditRow(product) : product)">
                  {{ getMarginPct(bulkEditMode ? bulkEditRow(product) : product) }}
                </v-chip>
                <span v-else class="text-disabled">—</span>
              </td>
              <!-- Status -->
              <td class="text-center">
                <v-btn v-if="bulkEditMode" size="x-small" variant="flat"
                  :color="bulkEditField(product, 'is_active') ? 'success' : 'grey'"
                  @click="setBulkEditField(product, 'is_active', !bulkEditField(product, 'is_active'))">
                  {{ bulkEditField(product, 'is_active') ? 'Active' : 'Inactive' }}
                </v-btn>
                <v-btn v-else size="x-small" variant="flat"
                  :color="product.is_active ? 'success' : 'grey'" @click="toggleActive(product)">
                  {{ product.is_active ? 'Active' : 'Inactive' }}
                </v-btn>
              </td>
              <!-- Actions -->
              <td class="text-right">
                <div v-if="!bulkEditMode" class="d-flex justify-end ga-1">
                  <v-btn icon="mdi-eye" size="small" variant="text" @click="viewProduct(product)" />
                  <v-btn icon="mdi-pencil" size="small" variant="text" @click="editProduct(product)" />
                  <v-btn icon="mdi-delete" size="small" variant="text" color="error" @click="confirmDelete(product)" />
                </div>
                <v-btn v-else-if="bulkEditChanges[product.id]" icon="mdi-undo" size="small" variant="text" color="amber"
                  @click="revertBulkEditRow(product)" />
              </td>
            </tr>
          </tbody>
        </v-table>

        <!-- Pagination -->
        <PaginationBar :count="pagination.count" :next="pagination.next" :previous="pagination.previous"
          :page="currentPage" :pageSize="pageSize" :totalPages="totalPages" @page-change="changePage" />
      </v-card>

      <!-- Grid View -->
      <template v-else>
        <v-row>
          <v-col v-for="product in products" :key="product.id" cols="12" sm="6" md="4" xl="3">
            <v-card rounded="xl" class="cursor-pointer h-100 transition-swing" flat border
              hover @click="editProduct(product)">
              <!-- Image -->
              <div class="position-relative">
                <v-responsive aspect-ratio="1" class="d-flex align-center justify-center"
                  :class="product.is_active ? 'bg-grey-lighten-3' : 'bg-grey-lighten-4'">
                  <v-img v-if="product.image" :src="product.image" cover class="h-100" />
                  <v-avatar v-else :color="product.is_active ? productColor(product) : 'grey-lighten-2'" size="64" rounded="lg">
                    <span class="text-h5 font-weight-bold text-white">{{ product.name.charAt(0).toUpperCase()
                      }}</span>
                  </v-avatar>
                </v-responsive>
                <v-chip size="x-small" class="position-absolute font-weight-medium"
                  style="top: 10px; right: 10px;" :color="product.is_active ? 'success' : 'grey'">
                  <v-icon size="10" start>mdi-circle-medium</v-icon>
                  {{ product.is_active ? 'Active' : 'Inactive' }}
                </v-chip>
                <v-chip size="x-small" class="position-absolute font-weight-medium"
                  style="top: 10px; left: 10px;" :color="typeColor(product.product_type)">
                  {{ product.product_type }}
                </v-chip>
                <!-- Stock badge at bottom -->
                <v-chip size="x-small" class="position-absolute font-weight-bold"
                  style="bottom: 10px; right: 10px;" :color="qtyColor(product.quantity_on_hand)" label>
                  {{ product.quantity_on_hand || 0 }} {{ product.unit || '' }}
                </v-chip>
              </div>
              <!-- Info -->
              <v-card-text class="pa-4">
                <div class="text-body-1 font-weight-bold text-truncate">{{ product.name }}</div>
                <div class="text-caption text-disabled font-weight-medium mb-3">{{ product.sku }}</div>
                <div class="d-flex justify-space-between align-center">
                  <div>
                    <div class="text-caption text-medium-emphasis">Cost: {{ currency(product.cost_price) }}</div>
                    <div class="text-h6 font-weight-bold text-primary">{{ currency(product.retail_price) }}</div>
                  </div>
                  <div class="text-right">
                    <v-chip size="x-small" variant="flat" :color="getMarginChipColor(product)">
                      {{ getMarginPct(product) }}
                    </v-chip>
                    <div class="text-caption text-medium-emphasis mt-1">{{ product.category_name || 'Uncategorized' }}</div>
                  </div>
                </div>
              </v-card-text>
              <v-divider />
              <!-- Quick actions -->
              <v-card-actions class="ga-1">
                <v-btn variant="text" size="small" color="primary" @click.stop="editProduct(product)">Edit</v-btn>
                <v-btn variant="text" size="small" @click.stop="viewProduct(product)">View</v-btn>
                <v-spacer />
                <v-btn variant="text" size="small" color="error" @click.stop="confirmDelete(product)">
                  <v-icon>mdi-delete-outline</v-icon>
                </v-btn>
              </v-card-actions>
            </v-card>
          </v-col>
        </v-row>

        <!-- Pagination -->
        <PaginationBar :count="pagination.count" :next="pagination.next" :previous="pagination.previous"
          :page="currentPage" :pageSize="pageSize" :totalPages="totalPages" @page-change="changePage" />
      </template>

      <!-- Bulk action bar (appears when items selected) -->
      <v-card v-if="selectedIds.length > 0 && viewMode === 'table' && !bulkEditMode" color="grey-darken-3"
        rounded="xl" class="pa-4 d-flex align-center justify-center ga-4 position-fixed"
        style="bottom: 24px; left: 50%; transform: translateX(-50%); z-index: 30;">
        <span class="text-body-2 font-weight-bold text-white">{{ selectedIds.length }} selected</span>
        <v-btn variant="text" size="small" color="light-blue-lighten-4" prepend-icon="mdi-pencil-edit"
          @click="startBulkEdit">Bulk Edit</v-btn>
        <v-divider vertical />
        <v-btn variant="text" size="small" color="green-lighten-3" @click="bulkActivate">Activate</v-btn>
        <v-btn variant="text" size="small" color="amber-lighten-3" @click="bulkDeactivate">Deactivate</v-btn>
        <v-divider vertical />
        <v-btn variant="text" size="small" color="red-lighten-3" @click="bulkDelete">Delete</v-btn>
        <v-btn variant="text" size="small" color="grey-lighten-1" @click="selectedIds = []">Cancel</v-btn>
      </v-card>

      <!-- Delete confirmation modal -->
      <v-dialog v-model="showDeleteModal" max-width="440">
        <v-card rounded="xl" class="pa-6">
          <div class="d-flex align-start ga-4">
            <v-avatar color="error-lighten-5" size="48" rounded="circle">
              <v-icon color="error">mdi-alert-circle</v-icon>
            </v-avatar>
            <div class="flex-1">
              <div class="text-h6 font-weight-bold">Confirm Deletion</div>
              <div class="text-body-2 text-medium-emphasis mt-1">
                Are you sure you want to delete <strong>{{ deleteTarget?.name || deleteTargetsCount + ' stock items'
                  }}</strong>?
                This action cannot be undone.
              </div>
            </div>
          </div>
          <div class="d-flex justify-end ga-3 mt-6">
            <v-btn variant="text" @click="showDeleteModal = false">Cancel</v-btn>
            <v-btn color="error" :loading="deleting" @click="executeDelete">{{ deleting ? 'Deleting...' : 'Delete'
              }}</v-btn>
          </div>
        </v-card>
      </v-dialog>
    </template><!-- end products tab -->

    <!-- ==================== CATEGORIES TAB ==================== -->
    <template v-if="activeMainTab === 'categories'">
      <!-- Category header -->
      <v-row class="d-flex align-center justify-space-between mb-4">
        <v-col cols="12" sm="6">
          <div class="text-h6 font-weight-bold">Categories</div>
          <div class="text-body-2 text-medium-emphasis">Organize your products into categories for easy browsing and
            filtering</div>
        </v-col>
        <v-col cols="12" sm="6" class="d-flex justify-end">
          <v-btn color="primary" prepend-icon="mdi-plus" @click="openCategoryModal">Add Category</v-btn>
        </v-col>
      </v-row>

      <!-- Category stats -->
      <v-row class="mb-4">
        <v-col cols="6" lg="3">
          <v-card flat border rounded="lg" class="pa-4">
            <div class="text-caption text-medium-emphasis">Total Categories</div>
            <div class="text-h5 font-weight-bold mt-1">{{ categories.length }}</div>
          </v-card>
        </v-col>
        <v-col cols="6" lg="3">
          <v-card flat border rounded="lg" class="pa-4">
            <div class="text-caption text-medium-emphasis">Active</div>
            <div class="text-h5 font-weight-bold text-success mt-1">{{ activeCategoryCount }}</div>
          </v-card>
        </v-col>
        <v-col cols="6" lg="3">
          <v-card flat border rounded="lg" class="pa-4">
            <div class="text-caption text-medium-emphasis">Root Categories</div>
            <div class="text-h5 font-weight-bold mt-1">{{ rootCategoryCount }}</div>
          </v-card>
        </v-col>
        <v-col cols="6" lg="3">
          <v-card flat border rounded="lg" class="pa-4">
            <div class="text-caption text-medium-emphasis">Subcategories</div>
            <div class="text-h5 font-weight-bold text-primary mt-1">{{ subCategoryCount }}</div>
          </v-card>
        </v-col>
      </v-row>

      <!-- Category toolbar -->
      <v-card flat border rounded="lg" class="pa-4 mb-4 d-flex flex-column flex-sm-row ga-3 align-center">
        <v-text-field v-model="categorySearch" placeholder="Search categories..." variant="outlined" density="compact"
          prepend-inner-icon="mdi-magnify" hide-details class="flex-1" />
        <v-btn-toggle v-model="categoryViewMode" mandatory density="compact" variant="outlined" divided>
          <v-btn value="grid" size="small" icon="mdi-view-module" />
          <v-btn value="tree" size="small" icon="mdi-format-list-bulleted" />
        </v-btn-toggle>
      </v-card>

      <!-- Category loading -->
      <div v-if="categoryLoading" class="d-flex justify-center align-center py-16">
        <v-progress-circular indeterminate color="primary" size="32" width="3" />
      </div>

      <!-- Category empty state -->
      <v-card v-else-if="filteredCategories.length === 0" flat border rounded="lg" class="py-12 text-center">
        <v-icon size="48" class="mb-4" color="grey-lighten-1">mdi-tag-multiple</v-icon>
        <div class="text-h6 font-weight-bold mb-1">No categories found</div>
        <div class="text-body-2 text-medium-emphasis mb-4">{{
          categorySearch ? 'No categories match your search.' : 'Create your first category to organize products.'
        }}</div>
        <v-btn color="primary" prepend-icon="mdi-plus" @click="openCategoryModal">Add Category</v-btn>
      </v-card>

      <!-- Category Grid View -->
      <template v-else-if="categoryViewMode === 'grid'">
        <v-row>
          <v-col v-for="cat in filteredCategories" :key="cat.id" cols="12" sm="6" md="4" xl="3">
            <v-card flat border rounded="lg" class="h-100">
              <div :class="categoryColorClass(cat.id)" style="height: 8px; border-radius: 8px 8px 0 0;" />
              <div class="pa-4">
                <div class="d-flex align-start justify-space-between mb-3">
                  <div class="d-flex align-center ga-3">
                    <v-avatar :color="categoryColorName(cat.id)" size="40" rounded="lg">
                      <span class="text-body-2 font-weight-bold text-white">{{ cat.name.charAt(0).toUpperCase() }}</span>
                    </v-avatar>
                    <div>
                      <div class="text-body-2 font-weight-bold">{{ cat.name }}</div>
                      <div v-if="getParentName(cat)" class="text-caption text-disabled">in {{ getParentName(cat) }}</div>
                    </div>
                  </div>
                  <v-chip size="x-small" :color="cat.is_active ? 'success' : 'grey'">{{ cat.is_active ? 'Active' :
                    'Inactive' }}</v-chip>
                </div>
                <!-- Product count -->
                <div class="d-flex align-center ga-2 text-body-2 text-medium-emphasis mb-2">
                  <v-icon size="16">mdi-package-variant-closed</v-icon>
                  <span>{{ categoryProductCount(cat.id) }} stock items</span>
                </div>
                <!-- Financials -->
                <v-card variant="flat" color="grey-lighten-4" rounded="lg" class="pa-3 mb-2">
                  <v-row density="compact">
                    <v-col cols="4" class="text-center">
                      <div class="text-caption text-disabled text-uppercase">Total Cost</div>
                      <div class="text-body-2 font-weight-bold mt-1">{{ currency(categoryTotalCost(cat.id)) }}</div>
                    </v-col>
                    <v-col cols="4" class="text-center border-s border-e">
                      <div class="text-caption text-disabled text-uppercase">Retail Value</div>
                      <div class="text-body-2 font-weight-bold mt-1">{{ currency(categoryTotalRetail(cat.id)) }}</div>
                    </v-col>
                    <v-col cols="4" class="text-center">
                      <div class="text-caption text-disabled text-uppercase">Margin</div>
                      <div v-if="categoryProfitMargin(cat.id) !== null" class="text-body-2 font-weight-bold mt-1"
                        :class="categoryProfitMarginPositive(cat.id) ? 'text-success' : 'text-error'">
                        <template v-if="categoryProfitMarginPositive(cat.id)">+</template>{{ categoryProfitMargin(cat.id).toFixed(1) }}%
                      </div>
                      <div v-else class="text-body-2 text-disabled mt-1">—</div>
                    </v-col>
                  </v-row>
                </v-card>
                <!-- Profit value -->
                <div v-if="categoryProfitMargin(cat.id) !== null"
                  class="d-flex align-center justify-space-between text-caption mb-2">
                  <span class="text-disabled">Potential Profit</span>
                  <span class="font-weight-medium" :class="categoryProfitValuePositive(cat.id) ? 'text-success' : 'text-error'">
                    {{ currency(categoryProfitValue(cat.id)) }}
                  </span>
                </div>
                <!-- Description -->
                <div v-if="cat.description" class="text-caption text-disabled mb-2" style="display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;">
                  {{ cat.description }}
                </div>
                <!-- Actions -->
                <v-divider class="mb-2" />
                <div class="d-flex ga-1">
                  <v-btn variant="text" size="small" color="primary" @click="editCategory(cat)" class="flex-1">Edit</v-btn>
                  <v-btn variant="text" size="small" color="error" @click="confirmCategoryDelete(cat)"
                    class="flex-1">Delete</v-btn>
                </div>
              </div>
            </v-card>
          </v-col>

          <!-- Add category card -->
          <v-col cols="12" sm="6" md="4" xl="3">
            <v-card flat border rounded="lg"
              class="d-flex flex-column align-center justify-center text-center cursor-pointer py-8"
              color="grey-lighten-3" variant="outlined" @click="openCategoryModal">
              <v-icon size="32" color="grey">mdi-plus</v-icon>
              <div class="text-body-2 font-weight-medium text-medium-emphasis mt-2">Add Category</div>
            </v-card>
          </v-col>
        </v-row>
      </template>

      <!-- Category Tree View -->
      <v-card v-else flat border rounded="lg" class="overflow-hidden">
        <v-table density="compact">
          <thead>
            <tr>
              <th class="text-left">Category</th>
              <th class="text-left">Parent</th>
              <th class="text-left">Description</th>
              <th class="text-center">Items</th>
              <th class="text-right">Total Cost</th>
              <th class="text-right">Retail Value</th>
              <th class="text-center">Margin</th>
              <th class="text-center">Status</th>
              <th class="text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="cat in filteredCategories" :key="cat.id">
              <td>
                <div class="d-flex align-center ga-3">
                  <v-avatar :color="categoryColorName(cat.id)" size="32" rounded="lg">
                    <span class="text-caption font-weight-bold text-white">{{ cat.name.charAt(0).toUpperCase() }}</span>
                  </v-avatar>
                  <span class="text-body-2 font-weight-medium">{{ cat.name }}</span>
                </div>
              </td>
              <td class="text-body-2 text-medium-emphasis">{{ getParentName(cat) || '— Root —' }}</td>
              <td class="text-body-2 text-disabled text-truncate" style="max-width: 200px;">{{ cat.description || '—' }}</td>
              <td class="text-center text-body-2">{{ categoryProductCount(cat.id) }}</td>
              <td class="text-right text-body-2">{{ currency(categoryTotalCost(cat.id)) }}</td>
              <td class="text-right text-body-2">{{ currency(categoryTotalRetail(cat.id)) }}</td>
              <td class="text-center">
                <span v-if="categoryProfitMargin(cat.id) !== null" class="font-weight-bold"
                  :class="categoryProfitMarginPositive(cat.id) ? 'text-success' : 'text-error'">
                  <template v-if="categoryProfitMarginPositive(cat.id)">+</template>{{ categoryProfitMargin(cat.id).toFixed(1) }}%
                </span>
                <span v-else class="text-disabled">â€”</span>
              </td>
              <td class="text-center">
                <v-chip size="x-small" :color="cat.is_active ? 'success' : 'grey'">{{ cat.is_active ? 'Active' :
                  'Inactive' }}</v-chip>
              </td>
              <td class="text-right">
                <div class="d-flex justify-end ga-1">
                  <v-btn icon="mdi-pencil" size="small" variant="text" @click="editCategory(cat)" />
                  <v-btn icon="mdi-delete" size="small" variant="text" color="error"
                    @click="confirmCategoryDelete(cat)" />
                </div>
              </td>
            </tr>
          </tbody>
        </v-table>
      </v-card>
    </template><!-- end categories tab -->

    <!-- ==================== UNITS TAB ==================== -->
    <template v-if="activeMainTab === 'units'">
      <!-- Unit header -->
      <v-row class="d-flex align-center justify-space-between mb-4">
        <v-col cols="12" sm="6">
          <div class="text-h6 font-weight-bold">Units of Measure</div>
          <div class="text-body-2 text-medium-emphasis">Define units of measurement for your stock items</div>
        </v-col>
        <v-col cols="12" sm="6" class="d-flex justify-end ga-2 flex-wrap">
          <v-btn variant="outlined" :loading="unitSeeding" prepend-icon="mdi-database-plus" @click="seedUnits"
            :disabled="unitSeeding">Seed Default Units</v-btn>
          <v-btn color="primary" prepend-icon="mdi-plus" @click="openUnitModal">Add Unit</v-btn>
        </v-col>
      </v-row>

      <!-- Unit stats -->
      <v-row class="mb-4">
        <v-col cols="6" lg="3">
          <v-card flat border rounded="lg" class="pa-4">
            <div class="text-caption text-medium-emphasis">Total Units</div>
            <div class="text-h5 font-weight-bold mt-1">{{ units.length }}</div>
          </v-card>
        </v-col>
        <v-col cols="6" lg="3">
          <v-card flat border rounded="lg" class="pa-4">
            <div class="text-caption text-medium-emphasis">Active</div>
            <div class="text-h5 font-weight-bold text-success mt-1">{{ units.filter(u => u.is_active).length }}</div>
          </v-card>
        </v-col>
        <v-col cols="6" lg="3">
          <v-card flat border rounded="lg" class="pa-4">
            <div class="text-caption text-medium-emphasis">Inactive</div>
            <div class="text-h5 font-weight-bold text-disabled mt-1">{{ units.filter(u => !u.is_active).length }}</div>
          </v-card>
        </v-col>
        <v-col cols="6" lg="3">
          <v-card flat border rounded="lg" class="pa-4">
            <div class="text-caption text-medium-emphasis">In Use</div>
            <div class="text-h5 font-weight-bold text-primary mt-1">{{ unitsInUseCount }}</div>
          </v-card>
        </v-col>
      </v-row>

      <!-- Unit search -->
      <v-card flat border rounded="lg" class="pa-4 mb-4">
        <v-text-field v-model="unitSearch" placeholder="Search units by name or abbreviation..." variant="outlined"
          density="compact" prepend-inner-icon="mdi-magnify" hide-details />
      </v-card>

      <!-- Unit loading -->
      <div v-if="unitLoading" class="d-flex justify-center align-center py-16">
        <v-progress-circular indeterminate color="primary" size="32" width="3" />
      </div>

      <!-- Unit empty state -->
      <v-card v-else-if="filteredUnits.length === 0" flat border rounded="lg" class="py-12 text-center">
        <v-icon size="48" class="mb-4" color="grey-lighten-1">mdi-ruler</v-icon>
        <div class="text-h6 font-weight-bold mb-1">No units found</div>
        <div class="text-body-2 text-medium-emphasis mb-4">{{ unitSearch ? 'No units match your search.' : 'Create your first unit of measure.' }}</div>
        <v-btn color="primary" prepend-icon="mdi-plus" @click="openUnitModal">Add Unit</v-btn>
      </v-card>

      <!-- Unit table -->
      <v-card v-else flat border rounded="lg" class="overflow-hidden">
        <v-table density="compact">
          <thead>
            <tr>
              <th class="text-left">Name</th>
              <th class="text-left">Abbreviation</th>
              <th class="text-left">Description</th>
              <th class="text-center">Products Using</th>
              <th class="text-center">Status</th>
              <th class="text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="unit in filteredUnits" :key="unit.id">
              <td>
                <div class="d-flex align-center ga-3">
                  <v-avatar color="indigo-lighten-5" size="32" rounded="lg">
                    <span class="text-caption font-weight-bold text-indigo">{{ unit.abbreviation.substring(0, 2).toUpperCase() }}</span>
                  </v-avatar>
                  <span class="text-body-2 font-weight-medium">{{ unit.name }}</span>
                </div>
              </td>
              <td class="text-body-2 font-weight-medium">{{ unit.abbreviation }}</td>
              <td class="text-body-2 text-disabled text-truncate" style="max-width: 200px;">{{ unit.description || '—' }}</td>
              <td class="text-center text-body-2">{{ unitProductCount(unit.name) }}</td>
              <td class="text-center">
                <v-chip size="x-small" :color="unit.is_active ? 'success' : 'grey'">{{ unit.is_active ? 'Active' :
                  'Inactive' }}</v-chip>
              </td>
              <td class="text-right">
                <div class="d-flex justify-end ga-1">
                  <v-btn icon="mdi-pencil" size="small" variant="text" @click="editUnit(unit)" />
                  <v-btn icon="mdi-delete" size="small" variant="text" color="error"
                    :disabled="unitProductCount(unit.name) > 0" @click="confirmUnitDelete(unit)" />
                </div>
              </td>
            </tr>
          </tbody>
        </v-table>
      </v-card>
    </template><!-- end units tab -->

    <!-- ==================== BRANDS TAB ==================== -->
    <template v-if="activeMainTab === 'brands'">
      <!-- Brand header -->
      <v-row class="d-flex align-center justify-space-between mb-4">
        <v-col cols="12" sm="6">
          <div class="text-h6 font-weight-bold">Brands</div>
          <div class="text-body-2 text-medium-emphasis">Manage product brands and manufacturers</div>
        </v-col>
        <v-col cols="12" sm="6" class="d-flex justify-end">
          <v-btn color="primary" prepend-icon="mdi-plus" @click="openBrandModal">Add Brand</v-btn>
        </v-col>
      </v-row>

      <!-- Brand stats -->
      <v-row class="mb-4">
        <v-col cols="6" lg="3">
          <v-card flat border rounded="lg" class="pa-4">
            <div class="text-caption text-medium-emphasis">Total Brands</div>
            <div class="text-h5 font-weight-bold mt-1">{{ brands.length }}</div>
          </v-card>
        </v-col>
        <v-col cols="6" lg="3">
          <v-card flat border rounded="lg" class="pa-4">
            <div class="text-caption text-medium-emphasis">Active</div>
            <div class="text-h5 font-weight-bold text-success mt-1">{{ brands.filter(b => b.is_active).length }}</div>
          </v-card>
        </v-col>
        <v-col cols="6" lg="3">
          <v-card flat border rounded="lg" class="pa-4">
            <div class="text-caption text-medium-emphasis">Inactive</div>
            <div class="text-h5 font-weight-bold text-disabled mt-1">{{ brands.filter(b => !b.is_active).length }}</div>
          </v-card>
        </v-col>
        <v-col cols="6" lg="3">
          <v-card flat border rounded="lg" class="pa-4">
            <div class="text-caption text-medium-emphasis">In Use</div>
            <div class="text-h5 font-weight-bold text-primary mt-1">{{ brandsInUseCount }}</div>
          </v-card>
        </v-col>
      </v-row>

      <!-- Brand search -->
      <v-card flat border rounded="lg" class="pa-4 mb-4">
        <v-text-field v-model="brandSearch" placeholder="Search brands by name..." variant="outlined" density="compact"
          prepend-inner-icon="mdi-magnify" hide-details />
      </v-card>

      <!-- Brand loading -->
      <div v-if="brandLoading" class="d-flex justify-center align-center py-16">
        <v-progress-circular indeterminate color="primary" size="32" width="3" />
      </div>

      <!-- Brand empty state -->
      <v-card v-else-if="filteredBrands.length === 0" flat border rounded="lg" class="py-12 text-center">
        <v-icon size="48" class="mb-4" color="grey-lighten-1">mdi-tag</v-icon>
        <div class="text-h6 font-weight-bold mb-1">No brands found</div>
        <div class="text-body-2 text-medium-emphasis mb-4">{{ brandSearch ? 'No brands match your search.' : 'Create your first brand.' }}</div>
        <v-btn color="primary" prepend-icon="mdi-plus" @click="openBrandModal">Add Brand</v-btn>
      </v-card>

      <!-- Brand table -->
      <v-card v-else flat border rounded="lg" class="overflow-hidden">
        <v-table density="compact">
          <thead>
            <tr>
              <th class="text-left">Name</th>
              <th class="text-left">Description</th>
              <th class="text-left">Website</th>
              <th class="text-center">Products</th>
              <th class="text-center">Status</th>
              <th class="text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="brand in filteredBrands" :key="brand.id">
              <td>
                <div class="d-flex align-center ga-3">
                  <v-avatar color="amber-lighten-5" size="32" rounded="lg">
                    <span class="text-caption font-weight-bold text-amber">{{ brand.name.charAt(0).toUpperCase() }}</span>
                  </v-avatar>
                  <span class="text-body-2 font-weight-medium">{{ brand.name }}</span>
                </div>
              </td>
              <td class="text-body-2 text-disabled text-truncate" style="max-width: 200px;">{{ brand.description || '—'
                }}</td>
              <td class="text-body-2">
                <a v-if="brand.website" :href="brand.website" target="_blank" rel="noopener"
                  class="text-primary">{{ brand.website }}</a>
                <span v-else>â€”</span>
              </td>
              <td class="text-center text-body-2">{{ brandProductCount(brand.name) }}</td>
              <td class="text-center">
                <v-chip size="x-small" :color="brand.is_active ? 'success' : 'grey'">{{ brand.is_active ? 'Active' :
                  'Inactive' }}</v-chip>
              </td>
              <td class="text-right">
                <div class="d-flex justify-end ga-1">
                  <v-btn icon="mdi-pencil" size="small" variant="text" @click="editBrand(brand)" />
                  <v-btn icon="mdi-delete" size="small" variant="text" color="error"
                    :disabled="brandProductCount(brand.name) > 0" @click="confirmBrandDelete(brand)" />
                </div>
              </td>
            </tr>
          </tbody>
        </v-table>
      </v-card>
    </template><!-- end brands tab -->

    <!-- Product modal -->
    <ProductsProductModal :show="showProductModal" :product="editingProduct" :categories="categories" :units="units"
      :brands="brands" @close="showProductModal = false" @saved="onProductSaved" />

    <!-- Category modal -->
    <ProductsCategoryModal :show="showCategoryModal" :category="editingCategory" :categories="categories"
      @close="showCategoryModal = false" @saved="onCategorySaved" />

    <!-- Unit modal -->
    <ProductsUnitModal :show="showUnitModal" :unit="editingUnit" @close="showUnitModal = false"
      @saved="onUnitSaved" />

    <!-- Brand modal -->
    <ProductsBrandModal :show="showBrandModal" :brand="editingBrand" @close="showBrandModal = false"
      @saved="onBrandSaved" />

    <!-- Category delete confirmation modal -->
    <v-dialog v-model="showCategoryDeleteModal" max-width="440">
      <v-card rounded="xl" class="pa-6">
        <div class="d-flex align-start ga-4">
          <v-avatar color="error-lighten-5" size="48" rounded="circle">
            <v-icon color="error">mdi-alert-circle</v-icon>
          </v-avatar>
          <div class="flex-1">
            <div class="text-h6 font-weight-bold">Delete Category</div>
            <div class="text-body-2 text-medium-emphasis mt-1">
              Are you sure you want to delete <strong>{{ categoryDeleteTarget?.name }}</strong>?
              <div v-if="categoryDeleteTarget && categoryProductCount(categoryDeleteTarget.id) > 0"
                class="text-warning mt-2">
                This category has {{ categoryProductCount(categoryDeleteTarget.id) }} product(s) assigned. Reassign
                them before deleting.
              </div>
              <div class="mt-2">This action cannot be undone.</div>
            </div>
          </div>
        </div>
        <div class="d-flex justify-end ga-3 mt-6">
          <v-btn variant="text" @click="showCategoryDeleteModal = false">Cancel</v-btn>
          <v-btn color="error" :loading="categoryDeleting" @click="executeCategoryDelete">{{ categoryDeleting ?
            'Deleting...' : 'Delete' }}</v-btn>
        </div>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup>
definePageMeta({ middleware: 'auth' })

const { currency } = useFormat()
const auth = useAuthStore()
const toast = useToast()

const symbol = computed(() => auth.currencySymbol || 'KSh')

// --- State ---
const loading = ref(false)
const products = ref([])
const categories = ref([])
const searchQuery = ref('')
const filterCategory = ref('')
const filterStatus = ref('')
const filterType = ref('')
const sortBy = ref('name')
const viewMode = ref('table')
const currentPage = ref(1)
const pageSize = 20
const pagination = ref({ count: 0, next: null, previous: null })
const selectedIds = ref([])

// Date filters
const dateField = ref('created') // 'created' or 'updated'
const dateFrom = ref('')
const dateTo = ref('')

// Bulk edit mode
const bulkEditMode = ref(false)
const bulkEditChanges = ref({}) // { productId: { field: value, ... } }
const bulkEditSaving = ref(false)
const bulkEditChangedCount = computed(() => Object.keys(bulkEditChanges.value).length)

// Main tab: 'products' or 'categories'
const activeMainTab = ref('products')

// Category tab state
const categorySearch = ref('')
const categoryViewMode = ref('grid')
const categoryLoading = ref(false)
const showCategoryDeleteModal = ref(false)
const categoryDeleteTarget = ref(null)
const categoryDeleting = ref(false)

// Unit tab state
const units = ref([])
const unitLoading = ref(false)
const unitSearch = ref('')
const showUnitModal = ref(false)
const editingUnit = ref(null)
const unitUsageMap = ref({})
const unitSeeding = ref(false)

// Brand tab state
const brands = ref([])
const brandLoading = ref(false)
const brandSearch = ref('')
const showBrandModal = ref(false)
const editingBrand = ref(null)
const brandUsageMap = ref({})

// Modals
const showProductModal = ref(false)
const editingProduct = ref(null)

const route = useRoute()
const router = useRouter()

// Route to the dedicated Excel import/export page — carries current filters so the
// export there matches the filters active here.
const excelBulkRoute = computed(() => {
  const params = new URLSearchParams()
  if (searchQuery.value) params.set('search', searchQuery.value)
  if (filterCategory.value) params.set('category', filterCategory.value)
  if (filterStatus.value) params.set('is_active', filterStatus.value)
  if (filterType.value) params.set('product_type', filterType.value)
  if (sortBy.value) params.set('ordering', sortBy.value)
  if (dateField.value === 'created') {
    if (dateFrom.value) params.set('created_after', dateFrom.value)
    if (dateTo.value) params.set('created_before', dateTo.value)
  } else {
    if (dateFrom.value) params.set('updated_after', dateFrom.value)
    if (dateTo.value) params.set('updated_before', dateTo.value)
  }
  const qs = params.toString()
  return qs ? `/products/excel-bulk?${qs}` : '/products/excel-bulk'
})

function goToExcelBulk() {
  navigateTo(excelBulkRoute.value)
}

// If we came back from the bulk import page with ?imported=1, refresh everything.
function refreshAfterImport() {
  loadProducts()
  loadStats()
  loadCategoryProductCounts()
  loadUnitUsage()
  loadBrandUsage()
}
const showCategoryModal = ref(false)
const editingCategory = ref(null)
const showDeleteModal = ref(false)
const deleteTarget = ref(null)
const deleteTargetsCount = ref(0)
const deleting = ref(false)

// --- Select / Filter item lists ---
const categoryItems = computed(() => categories.value)
const statusFilterItems = [
  { title: 'All Status', value: '' },
  { title: 'Active', value: 'true' },
  { title: 'Inactive', value: 'false' },
]
const typeFilterItems = [
  { title: 'All Types', value: '' },
  { title: 'Physical', value: 'physical' },
  { title: 'Service', value: 'service' },
  { title: 'Digital', value: 'digital' },
  { title: 'Bundle', value: 'bundle' },
]
const typeBulkItems = [
  { title: 'Physical', value: 'physical' },
  { title: 'Service', value: 'service' },
  { title: 'Digital', value: 'digital' },
  { title: 'Bundle', value: 'bundle' },
]
const sortItems = [
  { title: 'Sort: Name A-Z', value: 'name' },
  { title: 'Sort: Name Z-A', value: '-name' },
  { title: 'Sort: Price Low-High', value: 'retail_price' },
  { title: 'Sort: Price High-Low', value: '-retail_price' },
  { title: 'Sort: Newest First', value: '-created_at' },
]

// --- Computed ---
const allSelected = computed(() => products.value.length > 0 && selectedIds.value.length === products.value.length)
const hasActiveFilters = computed(() => searchQuery.value || filterCategory.value || filterStatus.value || filterType.value || dateFrom.value || dateTo.value)
const totalPages = computed(() => Math.ceil(pagination.value.count / pageSize) || 1)

const stats = ref({
  totalProducts: 0,
  activeProducts: 0,
  catalogValue: 0,
  potentialRevenue: 0,
})

// --- Search debounce ---
let searchTimer = null
function onSearchInput() {
  clearTimeout(searchTimer)
  searchTimer = setTimeout(() => {
    currentPage.value = 1
    loadProducts()
  }, 300)
}

function clearSearch() {
  searchQuery.value = ''
  currentPage.value = 1
  loadProducts()
}

function clearAllFilters() {
  searchQuery.value = ''
  filterCategory.value = ''
  filterStatus.value = ''
  filterType.value = ''
  dateFrom.value = ''
  dateTo.value = ''
  sortBy.value = 'name'
  currentPage.value = 1
  loadProducts()
}

// --- API calls ---
async function loadProducts() {
  loading.value = true
  try {
    const params = new URLSearchParams()
    params.set('page', currentPage.value)
    if (searchQuery.value) params.set('search', searchQuery.value)
    if (filterCategory.value) params.set('category', filterCategory.value)
    if (filterStatus.value) params.set('is_active', filterStatus.value)
    if (filterType.value) params.set('product_type', filterType.value)
    if (sortBy.value) params.set('ordering', sortBy.value)
    // Date range filters
    if (dateField.value === 'created') {
      if (dateFrom.value) params.set('created_after', dateFrom.value)
      if (dateTo.value) params.set('created_before', dateTo.value)
    } else {
      if (dateFrom.value) params.set('updated_after', dateFrom.value)
      if (dateTo.value) params.set('updated_before', dateTo.value)
    }

    const [data, statsData] = await Promise.all([
      useApi()(`/products/?${params.toString()}`),
      useApi()(`/products/stats/?${params.toString()}`),
    ])
    products.value = data.results || data
    pagination.value = {
      count: data.count || products.value.length,
      next: data.next,
      previous: data.previous,
    }
    stats.value = {
      totalProducts: statsData.total_products ?? 0,
      activeProducts: statsData.active_products ?? 0,
      catalogValue: statsData.catalog_value ?? 0,
      potentialRevenue: statsData.potential_revenue ?? 0,
    }
  } catch (e) {
    toast.error('Failed to load stock items')
  } finally {
    loading.value = false
  }
}

async function loadCategories() {
  try {
    const data = await useApi()('/products/categories/?page_size=100')
    categories.value = data.results || data
  } catch (e) {
    // silent
  }
}

async function loadStats() {
  try {
    const params = new URLSearchParams()
    if (searchQuery.value) params.set('search', searchQuery.value)
    if (filterCategory.value) params.set('category', filterCategory.value)
    if (filterStatus.value) params.set('is_active', filterStatus.value)
    if (filterType.value) params.set('product_type', filterType.value)
    if (dateField.value === 'created') {
      if (dateFrom.value) params.set('created_after', dateFrom.value)
      if (dateTo.value) params.set('created_before', dateTo.value)
    } else {
      if (dateFrom.value) params.set('updated_after', dateFrom.value)
      if (dateTo.value) params.set('updated_before', dateTo.value)
    }
    const data = await useApi()(`/products/stats/?${params.toString()}`)
    stats.value = {
      totalProducts: data.total_products ?? 0,
      activeProducts: data.active_products ?? 0,
      catalogValue: data.catalog_value ?? 0,
      potentialRevenue: data.potential_revenue ?? 0,
    }
  } catch (e) {
    // silent
  }
}

// --- Product CRUD ---
function openAddProduct() {
  editingProduct.value = null
  showProductModal.value = true
}

function editProduct(product) {
  editingProduct.value = { ...product }
  showProductModal.value = true
}

async function duplicateProduct(product) {
  try {
    const { id, created_at, updated_at, variants, ...cloneData } = product
    const newProduct = {
      ...cloneData,
      name: `${product.name} (Copy)`,
      sku: `${product.sku}-COPY`,
      is_active: false, // start inactive so user can review
    }
    await useApi()('/products/', { method: 'POST', body: newProduct })
    toast.success('Product duplicated')
    loadProducts()
  } catch (e) {
    toast.error('Failed to duplicate product')
  }
}

function viewProduct(product) {
  editingProduct.value = { ...product }
  showProductModal.value = true
}

async function toggleActive(product) {
  try {
    await useApi()(`/products/${product.id}/`, {
      method: 'PATCH',
      body: { is_active: !product.is_active },
    })
    product.is_active = !product.is_active
    toast.success(`${product.name} ${product.is_active ? 'activated' : 'deactivated'}`)
  } catch (e) {
    toast.error('Failed to update status')
  }
}

// --- Delete ---
function confirmDelete(product) {
  deleteTarget.value = product
  deleteTargetsCount.value = 0
  showDeleteModal.value = true
}

async function executeDelete() {
  deleting.value = true
  try {
    if (deleteTargetsCount.value > 0) {
      // Bulk delete
      for (const id of selectedIds.value) {
        await useApi()(`/products/${id}/`, { method: 'DELETE' })
      }
      toast.success(`${deleteTargetsCount.value} stock items deleted`)
      selectedIds.value = []
    } else if (deleteTarget.value) {
      await useApi()(`/products/${deleteTarget.value.id}/`, { method: 'DELETE' })
      toast.success('Product deleted')
    }
    showDeleteModal.value = false
    deleteTarget.value = null
    deleteTargetsCount.value = 0
    loadProducts()
  } catch (e) {
    toast.error('Failed to delete stock item(s)')
  } finally {
    deleting.value = false
  }
}

// --- Bulk Edit (Excel-like inline editing) ---
function startBulkEdit() {
  bulkEditMode.value = true
  bulkEditChanges.value = {}
  selectedIds.value = []
  // Switch to table view for editing
  viewMode.value = 'table'
}

function cancelBulkEdit() {
  bulkEditMode.value = false
  bulkEditChanges.value = {}
}

function bulkEditField(product, field) {
  // If we have a change for this product/field, return it
  if (bulkEditChanges.value[product.id] && field in bulkEditChanges.value[product.id]) {
    return bulkEditChanges.value[product.id][field]
  }
  // Otherwise return the original value
  return product[field]
}

function bulkEditRow(product) {
  // Return a merged object for margin calculations
  const changes = bulkEditChanges.value[product.id] || {}
  return { ...product, ...changes }
}

function setBulkEditField(product, field, value) {
  // Cast numeric fields
  if (field === 'cost_price' || field === 'retail_price') {
    value = value === '' ? 0 : parseFloat(value)
  }
  if (field === 'category') {
    value = value ? parseInt(value) : null
  }
  // Compare with original to decide if it's actually a change
  const original = product[field]
  if (value === original || (value === 0 && original === null)) {
    // No change — remove from changes if present
    if (bulkEditChanges.value[product.id]) {
      delete bulkEditChanges.value[product.id][field]
      if (Object.keys(bulkEditChanges.value[product.id]).length === 0) {
        delete bulkEditChanges.value[product.id]
      }
    }
  } else {
    if (!bulkEditChanges.value[product.id]) {
      bulkEditChanges.value[product.id] = {}
    }
    bulkEditChanges.value[product.id][field] = value
  }
  // Trigger reactivity
  bulkEditChanges.value = { ...bulkEditChanges.value }
}

function revertBulkEditRow(product) {
  delete bulkEditChanges.value[product.id]
  bulkEditChanges.value = { ...bulkEditChanges.value }
}

async function saveBulkEdit() {
  const changedIds = Object.keys(bulkEditChanges.value)
  if (changedIds.length === 0) return
  bulkEditSaving.value = true
  let successCount = 0
  let failCount = 0
  for (const id of changedIds) {
    try {
      await useApi()(`/products/${id}/`, {
        method: 'PATCH',
        body: bulkEditChanges.value[id],
      })
      successCount++
    } catch (e) {
      failCount++
    }
  }
  bulkEditSaving.value = false
  bulkEditMode.value = false
  bulkEditChanges.value = {}
  if (failCount === 0) {
    toast.success(`${successCount} stock item(s) updated successfully`)
  } else {
    toast.error(`${failCount} failed, ${successCount} updated`)
  }
  loadProducts()
}

// --- Bulk actions ---
function toggleSelectAll() {
  if (allSelected.value) {
    selectedIds.value = []
  } else {
    selectedIds.value = products.value.map(p => p.id)
  }
}

async function bulkActivate() {
  for (const id of selectedIds.value) {
    await useApi()(`/products/${id}/`, { method: 'PATCH', body: { is_active: true } })
  }
  toast.success(`${selectedIds.value.length} stock items activated`)
  selectedIds.value = []
  loadProducts()
}

async function bulkDeactivate() {
  for (const id of selectedIds.value) {
    await useApi()(`/products/${id}/`, { method: 'PATCH', body: { is_active: false } })
  }
  toast.success(`${selectedIds.value.length} stock items deactivated`)
  selectedIds.value = []
  loadProducts()
}

function bulkDelete() {
  deleteTarget.value = null
  deleteTargetsCount.value = selectedIds.value.length
  showDeleteModal.value = true
}

// --- Category CRUD ---
function openCategoryModal() {
  editingCategory.value = null
  showCategoryModal.value = true
}

function editCategory(cat) {
  editingCategory.value = { ...cat }
  showCategoryModal.value = true
}

function getParentName(cat) {
  if (!cat.parent) return ''
  const parent = categories.value.find(c => c.id === cat.parent)
  return parent ? parent.name : ''
}

function categoryProductCount(catId) {
  if (!allProductCounts.value) return 0
  return allProductCounts.value[catId] || 0
}

// Fetch product counts and financial aggregates per category (one API call)
const allProductCounts = ref({})
const categoryFinancials = ref({})
async function loadCategoryProductCounts() {
  try {
    const data = await useApi()('/products/?page_size=500')
    const prods = data.results || data
    const counts = {}
    const fins = {}
    for (const p of prods) {
      if (p.category) {
        counts[p.category] = (counts[p.category] || 0) + 1
        const cost = parseFloat(p.cost_price) || 0
        const retail = parseFloat(p.retail_price) || 0
        if (!fins[p.category]) fins[p.category] = { totalCost: 0, totalRetail: 0 }
        fins[p.category].totalCost += cost
        fins[p.category].totalRetail += retail
      }
    }
    allProductCounts.value = counts
    categoryFinancials.value = fins
  } catch (e) {
    // silent
  }
}

function categoryTotalCost(catId) {
  return categoryFinancials.value[catId]?.totalCost || 0
}

function categoryTotalRetail(catId) {
  return categoryFinancials.value[catId]?.totalRetail || 0
}

function categoryProfitMargin(catId) {
  const f = categoryFinancials.value[catId]
  if (!f || f.totalCost <= 0) return null
  return ((f.totalRetail - f.totalCost) / f.totalCost) * 100
}

function categoryProfitValue(catId) {
  const f = categoryFinancials.value[catId]
  if (!f) return 0
  return f.totalRetail - f.totalCost
}

function categoryProfitMarginPositive(catId) {
  return categoryProfitMargin(catId) !== null && categoryProfitMargin(catId) >= 0
}

function categoryProfitValuePositive(catId) {
  return categoryProfitValue(catId) >= 0
}

// Category color palette based on ID (Vuetify color names)
const colorPaletteVuetify = [
  'indigo', 'blue', 'green', 'amber',
  'purple', 'pink', 'teal', 'orange',
  'cyan', 'red', 'lime', 'deep-purple',
]
function categoryColorName(id) {
  return colorPaletteVuetify[id % colorPaletteVuetify.length] || 'grey'
}

// For the color header bar in the grid view, we return a bg color class
const colorPaletteBg = [
  'bg-indigo', 'bg-blue', 'bg-green', 'bg-amber',
  'bg-purple', 'bg-pink', 'bg-teal', 'bg-orange',
  'bg-cyan', 'bg-red', 'bg-lime', 'bg-deep-purple',
]
function categoryColorClass(id) {
  return colorPaletteBg[id % colorPaletteBg.length] || 'bg-grey'
}

// Filtered categories for search
const filteredCategories = computed(() => {
  if (!categorySearch.value) return categories.value
  const q = categorySearch.value.toLowerCase()
  return categories.value.filter(c =>
    c.name.toLowerCase().includes(q) ||
    (c.description || '').toLowerCase().includes(q)
  )
})

// Category stats
const activeCategoryCount = computed(() => categories.value.filter(c => c.is_active !== false).length)
const rootCategoryCount = computed(() => categories.value.filter(c => !c.parent).length)
const subCategoryCount = computed(() => categories.value.filter(c => c.parent).length)

// Category delete
function confirmCategoryDelete(cat) {
  categoryDeleteTarget.value = cat
  showCategoryDeleteModal.value = true
}

async function executeCategoryDelete() {
  if (!categoryDeleteTarget.value) return
  categoryDeleting.value = true
  try {
    await useApi()(`/products/categories/${categoryDeleteTarget.value.id}/`, { method: 'DELETE' })
    toast.success('Category deleted')
    showCategoryDeleteModal.value = false
    categoryDeleteTarget.value = null
    loadCategories()
    loadCategoryProductCounts()
  } catch (e) {
    const msg = e?.data?.detail || 'Failed to delete category (it may have products assigned)'
    toast.error(msg)
  } finally {
    categoryDeleting.value = false
  }
}

// --- Unit CRUD ---
async function loadUnits() {
  unitLoading.value = true
  try {
    const data = await useApi()('/products/units/?page_size=100')
    units.value = data.results || data
    loadUnitUsage()
  } catch (e) {
    // silent
  } finally {
    unitLoading.value = false
  }
}

async function loadUnitUsage() {
  try {
    const data = await useApi()('/products/?page_size=500')
    const prods = data.results || data
    const map = {}
    for (const p of prods) {
      if (p.unit) {
        map[p.unit] = (map[p.unit] || 0) + 1
      }
    }
    unitUsageMap.value = map
  } catch (e) {
    // silent
  }
}

const unitsInUseCount = computed(() => {
  return Object.keys(unitUsageMap.value).filter(k => unitUsageMap.value[k] > 0).length
})

const filteredUnits = computed(() => {
  if (!unitSearch.value) return units.value
  const q = unitSearch.value.toLowerCase()
  return units.value.filter(u =>
    u.name.toLowerCase().includes(q) ||
    u.abbreviation.toLowerCase().includes(q)
  )
})

function unitProductCount(unitName) {
  return unitUsageMap.value[unitName] || 0
}

function openUnitModal() {
  editingUnit.value = null
  showUnitModal.value = true
}

function editUnit(unit) {
  editingUnit.value = { ...unit }
  showUnitModal.value = true
}

function confirmUnitDelete(unit) {
  if (unitProductCount(unit.name) > 0) return
  if (confirm(`Delete unit "${unit.name}"? This action cannot be undone.`)) {
    executeUnitDelete(unit)
  }
}

async function executeUnitDelete(unit) {
  try {
    await useApi()(`/products/units/${unit.id}/`, { method: 'DELETE' })
    toast.success('Unit deleted')
    loadUnits()
  } catch (e) {
    toast.error('Failed to delete unit')
  }
}

function onUnitSaved() {
  showUnitModal.value = false
  loadUnits()
}

function switchToUnits() {
  activeMainTab.value = 'units'
  if (units.value.length === 0) {
    loadUnits()
  }
}

async function seedUnits() {
  unitSeeding.value = true
  try {
    const result = await useApi()('/products/units/seed/', { method: 'POST' })
    if (result.created.length > 0) {
      toast.success(`${result.created.length} unit(s) seeded (${result.skipped.length} already existed)`)
    } else {
      toast.info(`All ${result.skipped.length} units already exist`)
    }
    loadUnits()
  } catch (e) {
    toast.error('Failed to seed units')
  } finally {
    unitSeeding.value = false
  }
}

// --- Brand CRUD ---
async function loadBrands() {
  brandLoading.value = true
  try {
    const data = await useApi()('/products/brands/?page_size=100')
    brands.value = data.results || data
    loadBrandUsage()
  } catch (e) {
    // silent
  } finally {
    brandLoading.value = false
  }
}

async function loadBrandUsage() {
  try {
    const data = await useApi()('/products/?page_size=500')
    const prods = data.results || data
    const map = {}
    for (const p of prods) {
      if (p.brand) {
        map[p.brand] = (map[p.brand] || 0) + 1
      }
    }
    brandUsageMap.value = map
  } catch (e) {
    // silent
  }
}

const brandsInUseCount = computed(() => {
  return Object.keys(brandUsageMap.value).filter(k => brandUsageMap.value[k] > 0).length
})

const filteredBrands = computed(() => {
  if (!brandSearch.value) return brands.value
  const q = brandSearch.value.toLowerCase()
  return brands.value.filter(b =>
    b.name.toLowerCase().includes(q)
  )
})

function brandProductCount(brandName) {
  return brandUsageMap.value[brandName] || 0
}

function openBrandModal() {
  editingBrand.value = null
  showBrandModal.value = true
}

function editBrand(brand) {
  editingBrand.value = { ...brand }
  showBrandModal.value = true
}

function confirmBrandDelete(brand) {
  if (brandProductCount(brand.name) > 0) return
  if (confirm(`Delete brand "${brand.name}"? This action cannot be undone.`)) {
    executeBrandDelete(brand)
  }
}

async function executeBrandDelete(brand) {
  try {
    await useApi()(`/products/brands/${brand.id}/`, { method: 'DELETE' })
    toast.success('Brand deleted')
    loadBrands()
  } catch (e) {
    toast.error('Failed to delete brand')
  }
}

function onBrandSaved() {
  showBrandModal.value = false
  loadBrands()
}

function switchToBrands() {
  activeMainTab.value = 'brands'
  if (brands.value.length === 0) {
    loadBrands()
  }
}

// --- Event handlers ---
function onProductSaved() {
  showProductModal.value = false
  loadProducts()
}

function onCategorySaved() {
  showCategoryModal.value = false
  loadCategories()
  loadCategoryProductCounts()
}

// --- Helpers ---
function getCategoryName(id) {
  return categories.value.find(c => c.id == id)?.name || 'Unknown'
}

function changePage(page) {
  currentPage.value = page
  loadProducts()
}

function typeColor(type) {
  const colors = {
    physical: 'blue',
    service: 'purple',
    digital: 'teal',
    bundle: 'orange',
  }
  return colors[type] || 'grey'
}

// Stable color palette for product avatars (hashed from product name)
const productPalette = [
  'blue', 'indigo', 'deep-purple', 'teal', 'green',
  'amber', 'pink', 'cyan', 'orange', 'red',
]
function productColor(product) {
  const seed = (product.name || product.sku || '').split('').reduce((a, ch) => a + ch.charCodeAt(0), 0)
  return productPalette[seed % productPalette.length]
}

function qtyColor(qty) {
  const q = qty || 0
  if (q <= 0) return 'error'
  if (q <= 10) return 'warning'
  return 'success'
}

function formatDate(dateStr) {
  if (!dateStr) return '—'
  const d = new Date(dateStr)
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
}

function expiryColor(dateStr) {
  if (!dateStr) return 'default'
  const now = new Date(); now.setHours(0, 0, 0, 0)
  const expiry = new Date(dateStr); expiry.setHours(0, 0, 0, 0)
  const daysUntil = Math.round((expiry - now) / (1000 * 60 * 60 * 24))
  if (daysUntil < 0) return 'error'
  if (daysUntil <= 7) return 'warning'
  if (daysUntil <= 30) return 'amber'
  return 'success'
}

function getMarginPct(product) {
  const cost = parseFloat(product.cost_price) || 0
  const retail = parseFloat(product.retail_price) || 0
  if (cost <= 0) return '—'
  const margin = ((retail - cost) / cost * 100)
  return margin >= 0 ? `${margin.toFixed(0)}%` : `-${Math.abs(margin).toFixed(0)}%`
}

function getMarginClass(product) {
  const cost = parseFloat(product.cost_price) || 0
  const retail = parseFloat(product.retail_price) || 0
  if (cost <= 0) return 'text-disabled'
  return retail >= cost ? 'text-success' : 'text-error'
}

function getMarginChipColor(product) {
  const cost = parseFloat(product.cost_price) || 0
  const retail = parseFloat(product.retail_price) || 0
  if (cost <= 0) return 'default'
  const margin = (retail - cost) / cost * 100
  if (margin < 0) return 'error'
  if (margin < 20) return 'warning'
  if (margin < 50) return 'success'
  return 'teal'
}

// --- Init ---
onMounted(() => {
  loadCategories()
  loadProducts()
  loadCategoryProductCounts()
  loadUnits()
  loadBrands()
  // Returning from the Excel bulk import page with ?imported=1 → refresh data
  if (route.query.imported === '1') {
    refreshAfterImport()
    // Clean the query param so a regular refresh doesn't re-trigger
    router.replace({ path: '/products', query: {} })
  }
})
</script>

<style scoped>
/* Smooth Vuetify transition for grid cards */
.transition-swing.v-card {
  transition: box-shadow 0.25s ease, transform 0.25s ease;
}
.transition-swing.v-card:hover {
  transform: translateY(-2px);
}

/* Sticky table header */
.v-table :deep(thead) {
  position: sticky;
  top: 0;
  z-index: 2;
}
</style>