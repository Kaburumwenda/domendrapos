<template>
  <v-container class="pa-0" fluid>
    <!-- Page header -->
    <v-row class="d-flex align-center justify-space-between mb-4">
      <v-col cols="12" sm="6">
        <div class="text-h5 font-weight-bold">Sales</div>
        <div class="text-body-2 text-medium-emphasis">
          {{ stats.totalSales }} sales · {{ currency(stats.totalRevenue) }} revenue · {{ formatNumber(stats.totalItems) }} items sold
        </div>
      </v-col>
      <v-col cols="12" class="d-flex justify-space-between ga-2 flex-wrap align-center">
        <!-- Date filter as inline toggle row -->
        <v-btn-toggle v-model="datePreset" mandatory density="comfortable" variant="outlined" divided color="primary">
          <v-btn
            v-for="preset in datePresetItems.filter(p => p.value !== 'custom')"
            :key="preset.value"
            :value="preset.value"
            size="small"
            variant="text"
          >
            {{ preset.title }}
          </v-btn>
          <v-btn value="custom" size="small" variant="text" @click="customDialog = true">Custom</v-btn>
        </v-btn-toggle>

        <v-spacer />
        <v-btn variant="outlined" prepend-icon="mdi-download" @click="exportCsv">Export</v-btn>
        <v-btn variant="outlined" prepend-icon="mdi-refresh" @click="loadSales">Refresh</v-btn>
      </v-col>
    </v-row>

    <!-- Stat cards -->
    <v-row class="mb-4">
      <v-col cols="6" lg="3">
        <v-card rounded="xl" variant="outlined" class="kpi-card pa-5">
          <div class="d-flex align-start justify-space-between mb-2">
            <span class="text-caption text-medium-emphasis font-weight-medium">Total Sales</span>
            <div class="kpi-icon kpi-icon-blue">
              <v-icon size="18" icon="mdi-receipt-text-outline" />
            </div>
          </div>
          <p class="text-h4 font-weight-bold mb-1">{{ stats.totalSales }}</p>
          <span class="text-caption text-medium-emphasis">{{ stats.completedCount }} completed</span>
        </v-card>
      </v-col>
      <v-col cols="6" lg="3">
        <v-card rounded="xl" variant="outlined" class="kpi-card pa-5">
          <div class="d-flex align-start justify-space-between mb-2">
            <span class="text-caption text-medium-emphasis font-weight-medium">Total Revenue</span>
            <div class="kpi-icon kpi-icon-green">
              <v-icon size="18" icon="mdi-cash-multiple" />
            </div>
          </div>
          <p class="text-h4 font-weight-bold mb-1 text-success">{{ currency(stats.totalRevenue) }}</p>
          <span class="text-caption text-medium-emphasis">Avg: {{ currency(stats.avgSale) }}</span>
        </v-card>
      </v-col>
      <v-col cols="6" lg="3">
        <v-card rounded="xl" variant="outlined" class="kpi-card pa-5">
          <div class="d-flex align-start justify-space-between mb-2">
            <span class="text-caption text-medium-emphasis font-weight-medium">Avg Sale Value</span>
            <div class="kpi-icon kpi-icon-purple">
              <v-icon size="18" icon="mdi-chart-line-variant" />
            </div>
          </div>
          <p class="text-h4 font-weight-bold mb-1">{{ currency(stats.avgSale) }}</p>
          <span class="text-caption text-medium-emphasis">{{ stats.totalDiscount > 0 ? 'Discount: ' + currency(stats.totalDiscount) : 'No discounts' }}</span>
        </v-card>
      </v-col>
      <v-col cols="6" lg="3">
        <v-card rounded="xl" variant="outlined" class="kpi-card pa-5">
          <div class="d-flex align-start justify-space-between mb-2">
            <span class="text-caption text-medium-emphasis font-weight-medium">Items Sold</span>
            <div class="kpi-icon kpi-icon-orange">
              <v-icon size="18" icon="mdi-package-variant-closed" />
            </div>
          </div>
          <p class="text-h4 font-weight-bold mb-1">{{ formatNumber(stats.totalItems) }}</p>
          <span class="text-caption text-medium-emphasis">{{ stats.uniqueProducts }} unique products</span>
        </v-card>
      </v-col>
    </v-row>

    <!-- Tabs -->
    <v-card rounded="t-lg" class="mb-4" flat border>
      <v-tabs v-model="activeTab" color="primary" density="comfortable" show-arrows>
        <v-tab value="transactions">
          <v-icon size="16" start>mdi-receipt-text-outline</v-icon>
          Transactions
          <v-chip size="x-small" class="ml-2" :color="activeTab === 'transactions' ? 'primary' : 'default'">{{ filteredSales.length }}</v-chip>
        </v-tab>
        <v-tab value="analytics">
          <v-icon size="16" start>mdi-chart-line-variant</v-icon>
          Analytics
        </v-tab>
      </v-tabs>
    </v-card>

    <!-- ==================== TRANSACTIONS TAB ==================== -->
    <template v-if="activeTab === 'transactions'">
      <!-- Toolbar -->
      <v-card rounded="xl" class="pa-4 mb-4" flat border>
        <v-row density="comfortable">
          <v-col cols="12" lg="6">
            <v-text-field
              v-model="searchQuery"
              placeholder="Search by transaction #, customer, cashier..."
              variant="outlined"
              density="compact"
              prepend-inner-icon="mdi-magnify"
              hide-details
              clearable
            />
          </v-col>
          <v-col cols="6" lg="3">
            <v-select
              v-model="filterStatus"
              :items="statusFilterItems"
              item-title="title"
              item-value="value"
              label="All Status"
              variant="outlined"
              density="compact"
              hide-details
              clearable
            />
          </v-col>
          <v-col cols="6" lg="3">
            <v-select
              v-model="sortBy"
              :items="sortItems"
              item-title="title"
              item-value="value"
              label="Sort"
              variant="outlined"
              density="compact"
              hide-details
            />
          </v-col>
        </v-row>
      </v-card>

      <!-- Active filters -->
      <div v-if="hasActiveFilters" class="d-flex align-center flex-wrap ga-2 mb-4">
        <span class="text-body-2 text-medium-emphasis">Filters:</span>
        <v-chip v-if="searchQuery" size="small" color="primary" closable @click:close="searchQuery = ''">
          Search: "{{ searchQuery }}"
        </v-chip>
        <v-chip v-if="filterStatus" size="small" color="indigo" closable @click:close="filterStatus = ''">
          Status: {{ filterStatus }}
        </v-chip>
        <v-btn variant="text" size="small" color="error" @click="clearAllFilters">Clear all</v-btn>
      </div>

      <!-- Loading -->
      <v-card v-if="loading" flat border rounded="xl" class="py-16 d-flex flex-column align-center justify-center ga-4">
        <v-progress-circular indeterminate color="primary" size="48" width="4" />
        <div class="text-body-2 text-medium-emphasis">Loading sales...</div>
      </v-card>

      <!-- Empty -->
      <v-card v-else-if="filteredSales.length === 0" flat border rounded="xl" class="py-16 text-center">
        <v-avatar color="blue-lighten-5" size="80" class="mb-4">
          <v-icon color="blue" size="40">mdi-receipt-text-outline</v-icon>
        </v-avatar>
        <div class="text-h6 font-weight-bold mb-1">No sales found</div>
        <div class="text-body-2 text-medium-emphasis">
          {{ hasActiveFilters ? 'Try adjusting your filters.' : 'Sales will appear here once transactions are processed.' }}
        </div>
      </v-card>

      <!-- Table -->
      <v-card v-else flat border rounded="xl" class="overflow-hidden">
        <v-table density="compact" hover>
          <thead class="bg-grey-lighten-4">
            <tr>
              <th class="text-center" style="width: 52px;">#</th>
              <th class="text-left" style="min-width: 160px;">Transaction #</th>
              <th class="text-left">Customer</th>
              <th class="text-left">Cashier</th>
              <th class="text-left">Payment</th>
              <th class="text-right">Items</th>
              <th class="text-right">Subtotal</th>
              <th class="text-right">Discount</th>
              <th class="text-right">Tax</th>
              <th class="text-right">Total</th>
              <th class="text-left">Status</th>
              <th class="text-left">Date</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(sale, idx) in pagedSales" :key="sale.id" style="cursor: pointer;"
              @click="openSaleDetails(sale)">
              <td class="text-center text-caption text-disabled font-weight-bold">
                {{ rowNumber(idx) }}
              </td>
              <td>
                <div class="d-flex align-center ga-2">
                  <v-avatar size="32" rounded="lg" :color="statusColor(sale.status)" variant="tonal">
                    <v-icon size="18" :icon="statusIcon(sale.status)" />
                  </v-avatar>
                  <span class="text-body-2 font-weight-bold font-mono">{{ sale.transaction_number }}</span>
                </div>
              </td>
              <td>
                <span v-if="sale.customer_name && sale.customer_name !== 'Walk-in'" class="text-body-2">{{ sale.customer_name }}</span>
                <span v-else class="text-disabled">Walk-in</span>
              </td>
              <td class="text-body-2 text-medium-emphasis">{{ sale.cashier_name || '—' }}</td>
              <td>
                <v-chip v-if="sale.payment_method" size="small" variant="tonal" :color="paymentColor(sale.payment_method)">
                  {{ sale.payment_method_display || sale.payment_method }}
                </v-chip>
                <span v-else class="text-disabled">—</span>
              </td>
              <td class="text-right text-body-2">{{ sale.lines_count }}</td>
              <td class="text-right text-body-2">{{ currency(sale.subtotal) }}</td>
              <td class="text-right text-body-2 text-error">-{{ currency(sale.discount) }}</td>
              <td class="text-right text-body-2 text-medium-emphasis">{{ currency(sale.tax) }}</td>
              <td class="text-right">
                <span class="font-weight-bold">{{ currency(sale.total) }}</span>
              </td>
              <td>
                <v-chip size="small" :color="statusColor(sale.status)" variant="tonal" label class="text-capitalize">
                  {{ formatStatus(sale.status) }}
                </v-chip>
              </td>
              <td class="text-body-2 text-medium-emphasis">{{ datetime(sale.created_at) }}</td>
            </tr>
          </tbody>
        </v-table>

        <!-- Pagination -->
        <PaginationBar
          :count="filteredSales.length"
          :next="currentPage < totalPages ? 'yes' : null"
          :previous="currentPage > 1 ? 'yes' : null"
          :page="currentPage"
          :pageSize="pageSize"
          :totalPages="totalPages"
          @page-change="currentPage = $event"
        />
      </v-card>
    </template>

    <!-- ==================== ANALYTICS TAB ==================== -->
    <template v-if="activeTab === 'analytics'">
      <!-- Analytics KPIs -->
      <v-row class="mb-4">
        <v-col cols="6" lg="3">
          <v-card class="pa-5 bg-surface" flat border
            style="border-top: 4px solid rgb(var(--v-theme-green)) !important; border-radius: 10px !important;">
            <div class="d-flex align-start justify-space-between">
              <div>
                <div class="text-caption text-medium-emphasis text-uppercase">Gross Revenue</div>
                <div class="text-h5 font-weight-bold text-success mt-2">{{ currency(analytics.totalRevenue) }}</div>
              </div>
              <v-avatar color="green-lighten-5" rounded="lg" size="40">
                <v-icon color="green">mdi-cash</v-icon>
              </v-avatar>
            </div>
          </v-card>
        </v-col>
        <v-col cols="6" lg="3">
          <v-card class="pa-5 bg-surface" flat border
            style="border-top: 4px solid rgb(var(--v-theme-blue)) !important; border-radius: 10px !important;">
            <div class="d-flex align-start justify-space-between">
              <div>
                <div class="text-caption text-medium-emphasis text-uppercase">Avg Items / Sale</div>
                <div class="text-h5 font-weight-bold mt-2">{{ analytics.avgItemsPerSale.toFixed(1) }}</div>
              </div>
              <v-avatar color="blue-lighten-5" rounded="lg" size="40">
                <v-icon color="blue">mdi-package-variant-multiple</v-icon>
              </v-avatar>
            </div>
          </v-card>
        </v-col>
        <v-col cols="6" lg="3">
          <v-card class="pa-5 bg-surface" flat border
            style="border-top: 4px solid rgb(var(--v-theme-orange)) !important; border-radius: 10px !important;">
            <div class="d-flex align-start justify-space-between">
              <div>
                <div class="text-caption text-medium-emphasis text-uppercase">Total Discount</div>
                <div class="text-h5 font-weight-bold text-error mt-2">{{ currency(analytics.totalDiscount) }}</div>
              </div>
              <v-avatar color="orange-lighten-5" rounded="lg" size="40">
                <v-icon color="orange">mdi-tag-minus</v-icon>
              </v-avatar>
            </div>
          </v-card>
        </v-col>
        <v-col cols="6" lg="3">
          <v-card class="pa-5 bg-surface" flat border
            style="border-top: 4px solid rgb(var(--v-theme-teal)) !important; border-radius: 10px !important;">
            <div class="d-flex align-start justify-space-between">
              <div>
                <div class="text-caption text-medium-emphasis text-uppercase">Conversion Rate</div>
                <div class="text-h5 font-weight-bold mt-2">{{ analytics.completionRate.toFixed(1) }}%</div>
              </div>
              <v-avatar color="teal-lighten-5" rounded="lg" size="40">
                <v-icon color="teal">mdi-check-decagram</v-icon>
              </v-avatar>
            </div>
          </v-card>
        </v-col>
      </v-row>

      <!-- Charts Row 1: Revenue Trend + Payment Methods -->
      <v-row class="mb-4">
        <v-col cols="12" lg="8">
          <v-card flat border rounded="xl" class="pa-4">
            <div class="d-flex align-center ga-2 mb-3">
              <v-avatar color="blue-lighten-5" rounded="lg" size="36">
                <v-icon color="blue" size="20">mdi-chart-areaspline</v-icon>
              </v-avatar>
              <div>
                <div class="text-subtitle-1 font-weight-bold">Revenue Trend</div>
                <div class="text-caption text-medium-emphasis">Daily revenue over selected period</div>
              </div>
            </div>
            <apexchart type="area" height="300" :options="revenueChartOptions" :series="revenueChartSeries" />
          </v-card>
        </v-col>
        <v-col cols="12" lg="4">
          <v-card flat border rounded="xl" class="pa-4">
            <div class="d-flex align-center ga-2 mb-3">
              <v-avatar color="green-lighten-5" rounded="lg" size="36">
                <v-icon color="green" size="20">mdi-chart-donut</v-icon>
              </v-avatar>
              <div>
                <div class="text-subtitle-1 font-weight-bold">Payment Methods</div>
                <div class="text-caption text-medium-emphasis">Revenue by payment type</div>
              </div>
            </div>
            <apexchart type="donut" height="300" :options="paymentChartOptions" :series="paymentChartSeries" />
          </v-card>
        </v-col>
      </v-row>

      <!-- Charts Row 2: Top Products + Status Breakdown -->
      <v-row class="mb-4">
        <v-col cols="12" lg="8">
          <v-card flat border rounded="xl" class="pa-4">
            <div class="d-flex align-center ga-2 mb-3">
              <v-avatar color="indigo-lighten-5" rounded="lg" size="36">
                <v-icon color="indigo" size="20">mdi-trophy-award</v-icon>
              </v-avatar>
              <div>
                <div class="text-subtitle-1 font-weight-bold">Top 10 Products by Revenue</div>
                <div class="text-caption text-medium-emphasis">Best-selling products this period</div>
              </div>
            </div>
            <apexchart type="bar" height="320" :options="topProductsChartOptions" :series="topProductsChartSeries" />
          </v-card>
        </v-col>
        <v-col cols="12" lg="4">
          <v-card flat border rounded="xl" class="pa-4">
            <div class="d-flex align-center ga-2 mb-3">
              <v-avatar color="amber-lighten-5" rounded="lg" size="36">
                <v-icon color="amber" size="20">mdi-chart-pie</v-icon>
              </v-avatar>
              <div>
                <div class="text-subtitle-1 font-weight-bold">Sales by Status</div>
                <div class="text-caption text-medium-emphasis">Transaction status distribution</div>
              </div>
            </div>
            <apexchart type="donut" height="300" :options="statusChartOptions" :series="statusChartSeries" />
          </v-card>
        </v-col>
      </v-row>

      <!-- Charts Row 3: Day of Week + Peak Hours -->
      <v-row class="mb-4">
        <v-col cols="12" md="6">
          <v-card flat border rounded="xl" class="fill-height pa-4">
            <div class="d-flex align-center ga-2 mb-3">
              <v-avatar color="indigo-lighten-5" rounded="lg" size="36">
                <v-icon color="indigo" size="20">mdi-calendar-week</v-icon>
              </v-avatar>
              <div>
                <div class="text-subtitle-1 font-weight-bold">Sales by Day of Week</div>
                <div class="text-caption text-medium-emphasis">Revenue distribution across weekdays</div>
              </div>
            </div>
            <apexchart type="bar" height="280" :options="dowChartOptions" :series="dowChartSeries" />
          </v-card>
        </v-col>
        <v-col cols="12" md="6">
          <v-card flat border rounded="xl" class="fill-height pa-4">
            <div class="d-flex align-center ga-2 mb-3">
              <v-avatar color="orange-lighten-5" rounded="lg" size="36">
                <v-icon color="orange" size="20">mdi-clock-outline</v-icon>
              </v-avatar>
              <div>
                <div class="text-subtitle-1 font-weight-bold">Peak Hours</div>
                <div class="text-caption text-medium-emphasis">Revenue and transactions by hour</div>
              </div>
            </div>
            <apexchart type="bar" height="280" :options="peakHoursChartOptions" :series="peakHoursChartSeries" />
          </v-card>
        </v-col>
      </v-row>

      <!-- Cashier Performance Table -->
      <v-card flat border rounded="xl" class="overflow-hidden mb-4">
        <div class="d-flex align-center ga-2 pa-4 pb-2">
          <v-avatar color="deep-purple-lighten-5" rounded="lg" size="36">
            <v-icon color="deep-purple" size="20">mdi-account-tie-outline</v-icon>
          </v-avatar>
          <div>
            <div class="text-subtitle-1 font-weight-bold">Cashier Performance</div>
            <div class="text-caption text-medium-emphasis">Sales activity by cashier</div>
          </div>
        </div>
        <v-table density="compact" hover>
          <thead class="bg-grey-lighten-4">
            <tr>
              <th class="text-left">Cashier</th>
              <th class="text-right">Transactions</th>
              <th class="text-right">Revenue</th>
              <th class="text-right">Avg Order</th>
              <th class="text-right">Items Sold</th>
              <th class="text-right">% of Revenue</th>
              <th style="width: 120px;">Performance</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(c, idx) in cashierPerformance" :key="idx">
              <td>
                <div class="d-flex align-center ga-2">
                  <v-avatar size="32" rounded="lg" :color="cashierColor(idx)" variant="tonal">
                    <span class="text-body-2 font-weight-bold">{{ (c.name || '?').charAt(0).toUpperCase() }}</span>
                  </v-avatar>
                  <span class="text-body-2 font-weight-medium">{{ c.name || 'Unknown' }}</span>
                </div>
              </td>
              <td class="text-right text-body-2">{{ c.count }}</td>
              <td class="text-right font-weight-bold text-success">{{ currency(c.revenue) }}</td>
              <td class="text-right text-body-2">{{ currency(c.avgOrder) }}</td>
              <td class="text-right text-body-2">{{ formatNumber(c.items) }}</td>
              <td class="text-right text-body-2 text-medium-emphasis">{{ c.share.toFixed(1) }}%</td>
              <td>
                <v-progress-linear :model-value="c.share" color="primary" height="6" rounded />
              </td>
            </tr>
            <tr v-if="cashierPerformance.length === 0">
              <td colspan="7" class="text-center py-8 text-medium-emphasis">No cashier data for this period.</td>
            </tr>
          </tbody>
        </v-table>
      </v-card>
    </template>

    <!-- Sale details dialog -->
    <v-dialog v-model="detailsDialog" max-width="700">
      <v-card rounded="xl">
        <v-card-title class="d-flex align-center justify-space-between pa-4">
          <div class="d-flex align-center ga-3">
            <v-avatar :color="statusColor(selectedSale?.status)" variant="tonal" rounded="lg" size="40">
              <v-icon :icon="statusIcon(selectedSale?.status)" />
            </v-avatar>
            <div>
              <div class="text-h6 font-weight-bold">{{ selectedSale?.transaction_number }}</div>
              <div class="text-caption text-medium-emphasis">{{ datetime(selectedSale?.created_at) }}</div>
            </div>
          </div>
          <v-btn variant="text" icon="mdi-close" size="small" @click="detailsDialog = false" />
        </v-card-title>

        <v-card-text v-if="selectedSale" class="pt-2">
          <div class="d-flex align-center ga-2 mb-4 flex-wrap">
            <v-chip size="small" :color="statusColor(selectedSale.status)" variant="tonal" label class="text-capitalize">
              {{ formatStatus(selectedSale.status) }}
            </v-chip>
            <v-chip v-if="selectedSale.payment_method" size="small" variant="tonal" :color="paymentColor(selectedSale.payment_method)">
              {{ selectedSale.payment_method_display || selectedSale.payment_method }}
            </v-chip>
            <span class="text-body-2 text-medium-emphasis">
              {{ selectedSale.customer_name || 'Walk-in' }} · {{ selectedSale.cashier_name || '—' }} · {{ selectedSale.branch_name || '—' }}
            </span>
          </div>

          <div class="text-subtitle-2 font-weight-bold mb-2">Line Items ({{ selectedSale.items?.length || 0 }})</div>
          <v-table density="compact" class="mb-4 rounded border">
            <thead class="bg-grey-lighten-4">
              <tr>
                <th class="text-left">Product</th>
                <th class="text-right">Qty</th>
                <th class="text-right">Price</th>
                <th class="text-right">Total</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in selectedSale.items" :key="item.id">
                <td>
                  <div class="text-body-2 font-weight-medium">{{ item.product_name }}</div>
                  <div class="text-caption text-disabled">{{ item.product_sku }}</div>
                </td>
                <td class="text-right text-body-2">{{ formatNumber(item.quantity) }}</td>
                <td class="text-right text-body-2">{{ currency(item.unit_price) }}</td>
                <td class="text-right text-body-2 font-weight-medium">{{ currency(item.line_total) }}</td>
              </tr>
            </tbody>
          </v-table>

          <div class="d-flex flex-column align-end ga-1">
            <div class="d-flex justify-space-between" style="width: 220px;">
              <span class="text-body-2 text-medium-emphasis">Subtotal</span>
              <span class="text-body-2 font-weight-medium">{{ currency(selectedSale.subtotal) }}</span>
            </div>
            <div class="d-flex justify-space-between" style="width: 220px;">
              <span class="text-body-2 text-medium-emphasis">Discount</span>
              <span class="text-body-2 font-weight-medium text-error">-{{ currency(selectedSale.discount) }}</span>
            </div>
            <div class="d-flex justify-space-between" style="width: 220px;">
              <span class="text-body-2 text-medium-emphasis">Tax</span>
              <span class="text-body-2 font-weight-medium">{{ currency(selectedSale.tax) }}</span>
            </div>
            <v-divider class="my-1" style="width: 220px;" />
            <div class="d-flex justify-space-between" style="width: 220px;">
              <span class="text-subtitle-2 font-weight-bold">Total</span>
              <span class="text-subtitle-1 font-weight-bold text-primary">{{ currency(selectedSale.total) }}</span>
            </div>
          </div>
        </v-card-text>
      </v-card>
    </v-dialog>

    <!-- Custom date range dialog -->
    <v-dialog v-model="customDialog" max-width="420">
      <v-card>
        <v-card-title class="d-flex align-center justify-space-between">
          <span class="text-h6">Custom Date Range</span>
          <v-btn variant="text" icon="mdi-close" size="small" @click="customDialog = false" />
        </v-card-title>
        <v-card-text>
          <v-text-field
            v-model="customFrom"
            type="date"
            label="From Date"
            variant="outlined"
            density="comfortable"
            hide-details
            class="mb-4"
          />
          <v-text-field
            v-model="customTo"
            type="date"
            label="To Date"
            variant="outlined"
            density="comfortable"
            hide-details
          />
        </v-card-text>
        <v-card-actions class="px-4 pb-4">
          <v-spacer />
          <v-btn variant="text" @click="customDialog = false">Cancel</v-btn>
          <v-btn
            variant="flat"
            color="primary"
            @click="applyCustomRange"
          >Apply</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup>
definePageMeta({ middleware: 'auth' })

const { currency, datetime, number: formatNumber } = useFormat()
const toast = useToast()

const loading = ref(false)
const sales = ref([])
const productCostMap = ref(new Map())
const activeTab = ref('transactions')
const searchQuery = ref('')
const filterStatus = ref('')
const datePreset = ref('all')
const dateFrom = ref('')
const dateTo = ref('')
const customDialog = ref(false)
const customFrom = ref('')
const customTo = ref('')
const sortBy = ref('-created_at')
const currentPage = ref(1)
const pageSize = 20
const detailsDialog = ref(false)
const selectedSale = ref(null)

const statusFilterItems = [
  { title: 'Completed', value: 'completed' },
  { title: 'Pending', value: 'pending' },
  { title: 'Voided', value: 'voided' },
  { title: 'Cancelled', value: 'cancelled' },
  { title: 'Refunded', value: 'refunded' },
]

const sortItems = [
  { title: 'Sort: Newest First', value: '-created_at' },
  { title: 'Sort: Oldest First', value: 'created_at' },
  { title: 'Sort: Highest Total', value: '-total' },
  { title: 'Sort: Lowest Total', value: 'total' },
]

const datePresetItems = [
  { title: 'All', value: 'all' },
  { title: 'Today', value: 'today' },
  { title: 'Yesterday', value: 'yesterday' },
  { title: 'Last 7 Days', value: 'last_7d' },
  { title: 'Last 30 Days', value: 'last_30d' },
  { title: 'This Month', value: 'this_month' },
  { title: 'Last Month', value: 'last_month' },
  { title: 'This Year', value: 'this_year' },
  { title: 'Custom Range', value: 'custom' },
]

const datePresetLabel = computed(() =>
  datePresetItems.find(p => p.value === datePreset.value)?.title || '',
)

const dateRange = computed(() => {
  if (!datePreset.value || datePreset.value === 'all') return { from: null, to: null }
  if (datePreset.value === 'custom') {
    return {
      from: dateFrom.value ? new Date(dateFrom.value) : null,
      to: dateTo.value ? new Date(dateTo.value) : null,
    }
  }
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  let from = null
  let to = new Date(now)
  to.setHours(23, 59, 59, 999)
  switch (datePreset.value) {
    case 'today':
      from = new Date(today)
      from.setHours(0, 0, 0, 0)
      break
    case 'yesterday': {
      from = new Date(today)
      from.setDate(from.getDate() - 1)
      from.setHours(0, 0, 0, 0)
      to = new Date(today)
      to.setDate(to.getDate() - 1)
      to.setHours(23, 59, 59, 999)
      break
    }
    case 'last_7d':
      from = new Date(today)
      from.setDate(from.getDate() - 6)
      from.setHours(0, 0, 0, 0)
      break
    case 'last_30d':
      from = new Date(today)
      from.setDate(from.getDate() - 29)
      from.setHours(0, 0, 0, 0)
      break
    case 'this_month':
      from = new Date(today.getFullYear(), today.getMonth(), 1, 0, 0, 0, 0)
      break
    case 'last_month':
      from = new Date(today.getFullYear(), today.getMonth() - 1, 1, 0, 0, 0, 0)
      to = new Date(today.getFullYear(), today.getMonth(), 0, 23, 59, 59, 999)
      break
    case 'this_year':
      from = new Date(today.getFullYear(), 0, 1, 0, 0, 0, 0)
      break
  }
  return { from, to }
})

const hasActiveFilters = computed(() => !!(searchQuery.value || filterStatus.value || (datePreset.value && datePreset.value !== 'all')))

// Sales filtered by date (for both tabs)
const dateFilteredSales = computed(() => {
  const { from, to } = dateRange.value
  if (!from && !to) return [...sales.value]
  return sales.value.filter(s => {
    const d = new Date(s.created_at)
    if (from && d < from) return false
    if (to && d > to) return false
    return true
  })
})

// Client-side filtering + sorting (transactions tab)
const filteredSales = computed(() => {
  let list = [...dateFilteredSales.value]
  const q = searchQuery.value?.toLowerCase().trim()
  if (q) {
    list = list.filter(s =>
      (s.transaction_number || '').toLowerCase().includes(q) ||
      (s.customer_name || '').toLowerCase().includes(q) ||
      (s.cashier_name || '').toLowerCase().includes(q),
    )
  }
  if (filterStatus.value) list = list.filter(s => s.status === filterStatus.value)

  switch (sortBy.value) {
    case '-created_at':
      list.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      break
    case 'created_at':
      list.sort((a, b) => new Date(a.created_at) - new Date(b.created_at))
      break
    case '-total':
      list.sort((a, b) => (parseFloat(b.total) || 0) - (parseFloat(a.total) || 0))
      break
    case 'total':
      list.sort((a, b) => (parseFloat(a.total) || 0) - (parseFloat(b.total) || 0))
      break
  }
  return list
})

const totalPages = computed(() => Math.ceil(filteredSales.value.length / pageSize) || 1)
const pagedSales = computed(() => {
  const start = (currentPage.value - 1) * pageSize
  return filteredSales.value.slice(start, start + pageSize)
})

// Stats — based on date-filtered sales
const stats = computed(() => {
  const list = dateFilteredSales.value
  const totalSales = list.length
  let totalRevenue = 0
  let totalItems = 0
  let totalDiscount = 0
  let completedCount = 0
  const productSet = new Set()
  for (const s of list) {
    if (s.status === 'completed') {
      totalRevenue += parseFloat(s.total) || 0
      totalDiscount += parseFloat(s.discount) || 0
      completedCount++
    }
    totalItems += s.lines_count || 0
    for (const item of (s.items || [])) {
      if (item.product) productSet.add(item.product)
    }
  }
  return {
    totalSales,
    totalRevenue,
    avgSale: completedCount > 0 ? totalRevenue / completedCount : 0,
    totalItems,
    completedCount,
    totalDiscount,
    uniqueProducts: productSet.size,
  }
})

// ===== Analytics computed =====
const analytics = computed(() => {
  const list = dateFilteredSales.value
  let totalRevenue = 0
  let totalDiscount = 0
  let totalItems = 0
  let completedCount = 0
  for (const s of list) {
    if (s.status === 'completed') {
      totalRevenue += parseFloat(s.total) || 0
      totalDiscount += parseFloat(s.discount) || 0
      totalItems += s.lines_count || 0
      completedCount++
    }
  }
  const avgItemsPerSale = completedCount > 0 ? totalItems / completedCount : 0
  const completionRate = list.length > 0 ? (completedCount / list.length) * 100 : 0
  return { totalRevenue, totalDiscount, avgItemsPerSale, completionRate }
})

// Revenue trend (daily for ≤90 days, monthly for >90 days)
const isMonthlyView = computed(() => {
  const { from, to } = dateRange.value
  if (!from || !to) return false
  return Math.ceil((to - from) / (1000 * 60 * 60 * 24)) > 90
})

const revenueChartSeries = computed(() => {
  const monthly = isMonthlyView.value
  const revMap = new Map()
  const costMap = new Map()
  for (const s of dateFilteredSales.value) {
    if (s.status !== 'completed') continue
    const d = new Date(s.created_at)
    const key = monthly
      ? `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
      : d.toISOString().slice(0, 10)
    revMap.set(key, (revMap.get(key) || 0) + (parseFloat(s.total) || 0))
    let saleCost = 0
    for (const item of (s.items || [])) {
      const cost = productCostMap.value.get(item.product) || 0
      saleCost += cost * (parseFloat(item.quantity) || 0)
    }
    costMap.set(key, (costMap.get(key) || 0) + saleCost)
  }
  const keys = [...new Set([...revMap.keys(), ...costMap.keys()])].sort((a, b) => a.localeCompare(b))
  return [
    { name: 'Revenue', data: keys.map(k => ({ x: k, y: revMap.get(k) || 0 })) },
    { name: 'Cost', data: keys.map(k => ({ x: k, y: costMap.get(k) || 0 })) },
  ]
})

const revenueChartOptions = computed(() => ({
  chart: { type: 'area', toolbar: { show: false }, background: 'transparent', foreColor: 'rgba(0,0,0,0.6)', fontFamily: 'Segoe UI, Inter, sans-serif' },
  colors: ['#1976d2', '#f44336'],
  dataLabels: { enabled: false },
  stroke: { curve: 'smooth', width: 2 },
  fill: { type: 'gradient', gradient: { shadeIntensity: 1, opacityFrom: 0.4, opacityTo: 0.05, stops: [0, 90, 100] } },
  xaxis: {
    type: 'datetime',
    labels: {
      style: { fontSize: '11px' },
      format: isMonthlyView.value ? 'MMM yyyy' : 'dd MMM',
      datetimeFormatter: isMonthlyView.value ? {
        year: 'yyyy', month: "MMM 'yy", day: 'dd MMM',
      } : {
        year: 'yyyy', month: 'MMM', day: 'dd MMM',
      },
    },
  },
  yaxis: { labels: { formatter: v => v >= 1000 ? `${(v / 1000).toFixed(1)}k` : v.toFixed(0) } },
  grid: { borderColor: 'rgba(0,0,0,0.06)', strokeDashArray: 4 },
  legend: { position: 'top', fontSize: '12px', markers: { size: 4 } },
  tooltip: { y: { formatter: v => currency(v) } },
}))

// Payment methods donut
const paymentChartSeries = computed(() => {
  const map = new Map()
  for (const s of dateFilteredSales.value) {
    if (s.status !== 'completed') continue
    const method = s.payment_method || 'unknown'
    map.set(method, (map.get(method) || 0) + (parseFloat(s.total) || 0))
  }
  return [...map.values()]
})

const paymentChartOptions = computed(() => {
  const map = new Map()
  for (const s of dateFilteredSales.value) {
    if (s.status !== 'completed') continue
    const method = s.payment_method || 'unknown'
    map.set(method, (map.get(method) || 0) + (parseFloat(s.total) || 0))
  }
  const labels = [...map.keys()].map(k => {
    const item = dateFilteredSales.value.find(s => s.payment_method === k)
    return item?.payment_method_display || k
  })
  return {
    chart: { type: 'donut', background: 'transparent', foreColor: 'rgba(0,0,0,0.6)', fontFamily: 'Segoe UI, Inter, sans-serif' },
    labels,
    colors: ['#4caf50', '#9c27b0', '#2196f3', '#3f51b5', '#ff9800', '#009688', '#607d8b'],
    legend: { position: 'bottom', fontSize: '12px' },
    tooltip: { y: { formatter: v => currency(v) } },
    plotOptions: { pie: { donut: { size: '65%' } } },
  }
})

// Top 10 products by revenue
const topProductsChartSeries = computed(() => {
  const map = new Map()
  for (const s of dateFilteredSales.value) {
    if (s.status !== 'completed') continue
    for (const item of (s.items || [])) {
      const name = item.product_name || 'Unknown'
      map.set(name, (map.get(name) || 0) + (parseFloat(item.line_total) || 0))
    }
  }
  const sorted = [...map.entries()].sort((a, b) => b[1] - a[1]).slice(0, 10)
  return [{ name: 'Revenue', data: sorted.map(([k, v]) => ({ x: k, y: parseFloat(v) })) }]
})

const topProductsChartOptions = computed(() => ({
  chart: { type: 'bar', toolbar: { show: false }, background: 'transparent', foreColor: 'rgba(0,0,0,0.6)', fontFamily: 'Segoe UI, Inter, sans-serif' },
  colors: ['#6366f1'],
  plotOptions: { bar: { horizontal: true, borderRadius: 6, barHeight: '60%' } },
  dataLabels: { enabled: false },
  xaxis: { labels: { formatter: v => v >= 1000 ? `${(v / 1000).toFixed(1)}k` : v.toFixed(0) } },
  grid: { borderColor: 'rgba(0,0,0,0.06)', strokeDashArray: 4 },
  tooltip: { y: { formatter: v => currency(v) } },
}))

// Status breakdown donut
const statusChartSeries = computed(() => {
  const map = new Map()
  for (const s of dateFilteredSales.value) {
    map.set(s.status, (map.get(s.status) || 0) + 1)
  }
  return [...map.values()]
})

const statusChartOptions = computed(() => {
  const map = new Map()
  for (const s of dateFilteredSales.value) {
    map.set(s.status, (map.get(s.status) || 0) + 1)
  }
  return {
    chart: { type: 'donut', background: 'transparent', foreColor: 'rgba(0,0,0,0.6)', fontFamily: 'Segoe UI, Inter, sans-serif' },
    labels: [...map.keys()].map(k => k.replace(/_/g, ' ')),
    colors: ['#4caf50', '#2196f3', '#f44336', '#ff9800', '#a1887f'],
    legend: { position: 'bottom', fontSize: '12px' },
    tooltip: { y: { formatter: v => `${v} transactions` } },
    plotOptions: { pie: { donut: { size: '65%' } } },
  }
})

// Cashier performance table
const cashierPerformance = computed(() => {
  const map = new Map()
  for (const s of dateFilteredSales.value) {
    if (s.status !== 'completed') continue
    const name = s.cashier_name || 'Unknown'
    if (!map.has(name)) map.set(name, { name, count: 0, revenue: 0, items: 0 })
    const entry = map.get(name)
    entry.count++
    entry.revenue += parseFloat(s.total) || 0
    entry.items += s.lines_count || 0
  }
  const totalRev = [...map.values()].reduce((sum, c) => sum + c.revenue, 0) || 1
  const result = [...map.values()].map(c => ({
    ...c,
    avgOrder: c.count > 0 ? c.revenue / c.count : 0,
    share: (c.revenue / totalRev) * 100,
  }))
  result.sort((a, b) => b.revenue - a.revenue)
  return result
})

function cashierColor(idx) {
  const colors = ['blue', 'green', 'deep-purple', 'orange', 'teal', 'indigo', 'pink', 'cyan']
  return colors[idx % colors.length]
}

// Day of week analytics
const DOW_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const dowChartSeries = computed(() => {
  const revenueByDay = [0, 0, 0, 0, 0, 0, 0]
  const countByDay = [0, 0, 0, 0, 0, 0, 0]
  for (const s of dateFilteredSales.value) {
    if (s.status !== 'completed') continue
    const d = new Date(s.created_at)
    const dow = d.getDay()
    revenueByDay[dow] += parseFloat(s.total) || 0
    countByDay[dow]++
  }
  // Reorder to Mon-Sun
  const ordered = [1, 2, 3, 4, 5, 6, 0]
  return [{
    name: 'Revenue',
    data: ordered.map(i => revenueByDay[i]),
  }]
})

const dowChartOptions = computed(() => ({
  chart: { type: 'bar', toolbar: { show: false }, background: 'transparent', foreColor: 'rgba(0,0,0,0.6)', fontFamily: 'Segoe UI, Inter, sans-serif' },
  colors: ['#1976d2'],
  plotOptions: { bar: { borderRadius: 6, columnWidth: '50%', distributed: false } },
  dataLabels: { enabled: false },
  xaxis: {
    categories: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    labels: { style: { fontSize: '12px' } },
  },
  yaxis: { labels: { formatter: v => v >= 1000 ? `${(v / 1000).toFixed(1)}k` : v.toFixed(0) } },
  grid: { borderColor: 'rgba(0,0,0,0.06)', strokeDashArray: 4 },
  tooltip: { y: { formatter: v => currency(v) } },
  fill: { type: 'gradient', gradient: { shade: 'light', type: 'vertical', opacityFrom: 0.85, opacityTo: 0.55, stops: [0, 100] } },
}))

// Peak hours analytics
const PEAK_HOURS = [6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20]
const peakHoursChartSeries = computed(() => {
  const revenueByHour = {}
  const countByHour = {}
  for (const h of PEAK_HOURS) {
    revenueByHour[h] = 0
    countByHour[h] = 0
  }
  for (const s of dateFilteredSales.value) {
    if (s.status !== 'completed') continue
    const d = new Date(s.created_at)
    const h = d.getHours()
    if (h in revenueByHour) {
      revenueByHour[h] += parseFloat(s.total) || 0
      countByHour[h]++
    }
  }
  return [
    { name: 'Revenue', data: PEAK_HOURS.map(h => revenueByHour[h]) },
    { name: 'Transactions', data: PEAK_HOURS.map(h => countByHour[h]) },
  ]
})

const peakHoursChartOptions = computed(() => ({
  chart: { type: 'bar', toolbar: { show: false }, background: 'transparent', foreColor: 'rgba(0,0,0,0.6)', fontFamily: 'Segoe UI, Inter, sans-serif' },
  colors: ['#1976d2', '#ff9800'],
  plotOptions: { bar: { borderRadius: 4, columnWidth: '60%' } },
  dataLabels: { enabled: false },
  xaxis: {
    categories: PEAK_HOURS.map(h => `${h}:00`),
    labels: { style: { fontSize: '11px' } },
  },
  yaxis: [
    { title: { text: 'Revenue', style: { fontSize: '11px' } }, labels: { formatter: v => v >= 1000 ? `${(v / 1000).toFixed(1)}k` : v.toFixed(0) } },
    { opposite: true, title: { text: 'Transactions', style: { fontSize: '11px' } }, labels: { formatter: v => v.toFixed(0) } },
  ],
  grid: { borderColor: 'rgba(0,0,0,0.06)', strokeDashArray: 4 },
  legend: { position: 'top', fontSize: '12px', markers: { size: 4 } },
  tooltip: { y: { formatter: (v, { seriesIndex }) => seriesIndex === 0 ? currency(v) : `${v} txns` } },
  fill: { type: 'gradient', gradient: { shade: 'light', type: 'vertical', opacityFrom: 0.85, opacityTo: 0.55, stops: [0, 100] } },
}))

// --- API ---
async function fetchAllPages(url, pageSize = 500) {
  const all = []
  let nextUrl = `${url}${url.includes('?') ? '&' : '?'}page_size=${pageSize}`
  while (nextUrl) {
    const data = await useApi()(nextUrl)
    all.push(...(data.results || []))
    // Strip full origin + /api prefix so the path works with useApi baseURL
    nextUrl = data.next
      ? data.next.replace(/^https?:\/\/[^/]+\/api/, '')
      : null
  }
  return all
}

async function loadSales() {
  loading.value = true
  try {
    const [allSales, products] = await Promise.all([
      fetchAllPages('/pos/transactions/?ordering=-created_at'),
      useApi()('/products/?page_size=500').then(d => d.results || d),
    ])
    sales.value = allSales.map(s => ({ ...s, lines_count: s.items_count || s.items?.length || 0 }))
    const costMap = new Map()
    for (const p of products) {
      costMap.set(p.id, parseFloat(p.cost_price) || 0)
    }
    productCostMap.value = costMap
  } catch {
    toast.error('Failed to load sales')
  } finally {
    loading.value = false
  }
}

// --- Helpers ---
const STATUS_COLORS = {
  completed: 'green',
  pending: 'blue',
  voided: 'red',
  cancelled: 'red',
  refunded: 'deep-orange',
}
function statusColor(status) {
  return STATUS_COLORS[status] || 'grey'
}

const STATUS_ICONS = {
  completed: 'mdi-check-circle',
  pending: 'mdi-clock-outline',
  voided: 'mdi-close-circle',
  cancelled: 'mdi-close-octagon',
  refunded: 'mdi-undo',
}
function statusIcon(status) {
  return STATUS_ICONS[status] || 'mdi-help-circle'
}

function paymentColor(method) {
  const map = { cash: 'green', mpesa: 'purple', card: 'blue', insurance: 'indigo', credit: 'amber', bank_transfer: 'teal' }
  return map[method] || 'grey'
}

function formatStatus(status) {
  return (status || '').replace(/_/g, ' ')
}

function rowNumber(idx) {
  return (currentPage.value - 1) * pageSize + idx + 1
}

function clearAllFilters() {
  searchQuery.value = ''
  filterStatus.value = ''
  datePreset.value = 'all'
  dateFrom.value = ''
  dateTo.value = ''
  sortBy.value = '-created_at'
  currentPage.value = 1
}

function applyCustomRange() {
  dateFrom.value = customFrom.value
  dateTo.value = customTo.value
  datePreset.value = 'custom'
  customDialog.value = false
}

function openSaleDetails(sale) {
  selectedSale.value = sale
  detailsDialog.value = true
}

function exportCsv() {
  const rows = filteredSales.value
  if (rows.length === 0) {
    toast.info('Nothing to export')
    return
  }
  const header = ['Transaction #', 'Customer', 'Cashier', 'Branch', 'Payment', 'Status', 'Items', 'Subtotal', 'Discount', 'Tax', 'Total', 'Date']
  const lines = [header.join(',')]
  for (const r of rows) {
    const cells = [
      r.transaction_number || '',
      `"${(r.customer_name || 'Walk-in').replace(/"/g, '""')}"`,
      `"${(r.cashier_name || '').replace(/"/g, '""')}"`,
      `"${(r.branch_name || '').replace(/"/g, '""')}"`,
      r.payment_method_display || r.payment_method || '',
      r.status || '',
      r.lines_count || 0,
      r.subtotal ?? '',
      r.discount ?? '',
      r.tax ?? '',
      r.total ?? '',
      r.created_at || '',
    ]
    lines.push(cells.join(','))
  }
  const csv = lines.join('\n')
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `sales-${new Date().toISOString().slice(0, 10)}.csv`
  a.click()
  URL.revokeObjectURL(url)
  toast.success('Exported to CSV')
}

watch([searchQuery, filterStatus, sortBy], () => {
  currentPage.value = 1
})

onMounted(loadSales)
</script>

<style scoped>
.kpi-card {
  transition: box-shadow 0.2s ease, transform 0.2s ease;
}
.kpi-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
}
.kpi-icon {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.kpi-icon-blue { background: rgba(33, 150, 243, 0.12); color: #2196f3; }
.kpi-icon-green { background: rgba(76, 175, 80, 0.12); color: #4caf50; }
.kpi-icon-orange { background: rgba(255, 152, 0, 0.12); color: #ff9800; }
.kpi-icon-purple { background: rgba(156, 39, 176, 0.12); color: #9c27b0; }
</style>
