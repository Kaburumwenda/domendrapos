<template>
  <div class="az-page">
    <!-- ===== Header ===== -->
    <div class="az-header">
      <div class="az-header__left">
        <div class="az-header__title-icon az-header__title-icon--primary">
          <v-icon size="22">mdi-clipboard-text-clock</v-icon>
        </div>
        <div>
          <h1 class="text-h5 font-weight-bold">Purchase Orders</h1>
          <p class="text-body-2 text-medium-emphasis">Create, approve, send and receive stock from suppliers</p>
        </div>
      </div>
      <div class="az-header__actions">
        <v-btn variant="tonal" prepend-icon="mdi-refresh" size="small" @click="loadData" :loading="loading">Refresh</v-btn>
        <v-btn variant="outlined" prepend-icon="mdi-microsoft-excel" color="success" size="small" @click="goToExcelBulk">Import / Export</v-btn>
        <v-btn variant="outlined" prepend-icon="mdi-download" size="small" @click="exportCSV">Export</v-btn>
        <v-btn variant="flat" color="primary" prepend-icon="mdi-plus" size="small" @click="openCreate">New PO</v-btn>
      </div>
    </div>

    <!-- ===== Loading ===== -->
    <div v-if="loading && pos.length === 0" class="az-loading">
      <v-progress-circular indeterminate color="primary" size="32" width="3" />
      <p class="text-body-2 text-medium-emphasis mt-3">Loading purchase orders…</p>
    </div>

    <template v-else>
      <!-- ===== KPI Row ===== -->
      <div class="az-kpi-grid">
        <div class="az-kpi az-kpi--info">
          <div class="az-kpi__icon az-kpi__icon--info"><v-icon size="20">mdi-clipboard-text-multiple</v-icon></div>
          <div class="az-kpi__body">
            <p class="az-kpi__label">Total POs</p>
            <p class="az-kpi__value text-info">{{ kpis.total }}</p>
            <p class="az-kpi__sub">{{ kpis.totalItems }} line items</p>
          </div>
        </div>
        <div class="az-kpi az-kpi--warning">
          <div class="az-kpi__icon az-kpi__icon--warning"><v-icon size="20">mdi-clock-alert-outline</v-icon></div>
          <div class="az-kpi__body">
            <p class="az-kpi__label">Pending Approval</p>
            <p class="az-kpi__value text-warning">{{ kpis.pendingApproval }}</p>
            <p class="az-kpi__sub">awaiting review</p>
          </div>
        </div>
        <div class="az-kpi az-kpi--primary">
          <div class="az-kpi__icon az-kpi__icon--primary"><v-icon size="20">mdi-cash-multiple</v-icon></div>
          <div class="az-kpi__body">
            <p class="az-kpi__label">Total Value</p>
            <p class="az-kpi__value" style="color: #3478f6">{{ formatMoney(kpis.totalValue) }}</p>
            <p class="az-kpi__sub">across active POs</p>
          </div>
        </div>
        <div class="az-kpi az-kpi--teal">
          <div class="az-kpi__icon az-kpi__icon--teal"><v-icon size="20">mdi-truck-check</v-icon></div>
          <div class="az-kpi__body">
            <p class="az-kpi__label">Received</p>
            <p class="az-kpi__value" style="color: #00B8D4">{{ kpis.received }}</p>
            <p class="az-kpi__sub">{{ kpis.partiallyReceived }} partial</p>
          </div>
        </div>
        <div class="az-kpi az-kpi--error">
          <div class="az-kpi__icon az-kpi__icon--error"><v-icon size="20">mdi-package-variant-closed</v-icon></div>
          <div class="az-kpi__body">
            <p class="az-kpi__label">Receiving Rate</p>
            <p class="az-kpi__value text-error">{{ kpis.receivingRate }}%</p>
            <p class="az-kpi__sub">{{ kpis.receivedValue }} received</p>
          </div>
        </div>
        <div class="az-kpi az-kpi--purple">
          <div class="az-kpi__icon az-kpi__icon--purple"><v-icon size="20">mdi-account-group</v-icon></div>
          <div class="az-kpi__body">
            <p class="az-kpi__label">Active Suppliers</p>
            <p class="az-kpi__value" style="color: #7C4DFF">{{ kpis.activeSuppliers }}</p>
            <p class="az-kpi__sub">{{ suppliers.length }} total</p>
          </div>
        </div>
      </div>

      <!-- ===== Charts Row ===== -->
      <div class="az-chart-row">
        <div class="az-card az-card--two-thirds">
          <div class="az-card__header">
            <div class="az-card__header-icon az-card__header-icon--blue"><v-icon size="20">mdi-chart-bar</v-icon></div>
            <div>
              <h3 class="az-card__title">Monthly Purchase Spend</h3>
              <p class="az-card__subtitle">PO value created per month (last 6 months)</p>
            </div>
          </div>
          <div class="az-card__body">
            <apexchart type="bar" height="280" :options="spendChartOptions" :series="spendSeries" />
          </div>
        </div>
        <div class="az-card az-card--third">
          <div class="az-card__header">
            <div class="az-card__header-icon az-card__header-icon--rose"><v-icon size="20">mdi-chart-donut</v-icon></div>
            <div>
              <h3 class="az-card__title">Status Breakdown</h3>
              <p class="az-card__subtitle">Distribution by status</p>
            </div>
          </div>
          <div class="az-card__body">
            <apexchart type="donut" height="280" :options="statusDonutOptions" :series="statusDonutSeries" />
          </div>
        </div>
      </div>

      <!-- ===== Top Suppliers ===== -->
      <div v-if="topSuppliers.length > 0" class="az-suppliers-section">
        <div class="az-suppliers-title">
          <v-icon size="18" color="primary">mdi-truck-fast</v-icon>
          <span>Top Suppliers by Volume</span>
        </div>
        <div class="az-suppliers-grid">
          <div v-for="(s, i) in topSuppliers" :key="s.name" class="az-supplier-card">
            <div class="az-supplier-rank">#{{ i + 1 }}</div>
            <div class="az-avatar az-avatar--primary">{{ initials(s.name) }}</div>
            <div class="az-supplier-info">
              <p class="az-supplier-name">{{ s.name }}</p>
              <p class="az-supplier-sub">{{ s.count }} PO{{ s.count > 1 ? 's' : '' }} · {{ formatMoney(s.value) }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- ===== Filters Bar ===== -->
      <div class="az-filters">
        <v-text-field v-model="searchText" prepend-inner-icon="mdi-magnify" placeholder="Search PO #, supplier..." density="compact" variant="outlined" hide-details class="az-filters__search" />
        <v-select v-model="statusFilter" :items="statusOptions" item-title="label" item-value="value" density="compact" variant="outlined" hide-details label="Status" clearable class="az-filters__select" />
        <v-select v-model="supplierFilter" :items="supplierFilterOptions" item-title="name" item-value="id" density="compact" variant="outlined" hide-details label="Supplier" clearable class="az-filters__select" />
        <v-btn v-if="searchText || statusFilter || supplierFilter" variant="text" size="small" prepend-icon="mdi-filter-remove" @click="searchText = ''; statusFilter = null; supplierFilter = null">Clear</v-btn>
      </div>

      <!-- ===== View Toggle ===== -->
      <div class="az-view-toggle">
        <v-btn-group density="compact" variant="outlined" color="primary">
          <v-btn :variant="viewMode === 'table' ? 'flat' : 'text'" :color="viewMode === 'table' ? 'primary' : undefined" size="small" @click="viewMode = 'table'"><v-icon size="16">mdi-table</v-icon><span class="ml-1 d-none d-sm-inline">Table</span></v-btn>
          <v-btn :variant="viewMode === 'cards' ? 'flat' : 'text'" :color="viewMode === 'cards' ? 'primary' : undefined" size="small" @click="viewMode = 'cards'"><v-icon size="16">mdi-card-multiple</v-icon><span class="ml-1 d-none d-sm-inline">Cards</span></v-btn>
        </v-btn-group>
      </div>

      <!-- ===== Tabs ===== -->
      <div class="az-tabs">
        <button v-for="tab in tabs" :key="tab.id" class="az-tab" :class="{ 'az-tab--active': activeTab === tab.id }" @click="activeTab = tab.id">
          <v-icon size="18" class="mr-1">{{ tab.icon }}</v-icon>
          {{ tab.label }}
          <span class="az-tab__badge">{{ tab.count }}</span>
        </button>
      </div>

      <!-- ===== Table View ===== -->
      <div v-if="viewMode === 'table'" class="az-table-wrap">
        <table class="az-table">
          <thead>
            <tr>
              <th>PO Number</th>
              <th>Supplier</th>
              <th>Date</th>
              <th>Expected</th>
              <th class="text-right">Items</th>
              <th class="text-right">Total</th>
              <th>Progress</th>
              <th>Status</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="po in pagedItems" :key="po.id" class="az-table__row" @click="viewPO(po)">
              <td><span class="font-weight-bold text-primary">{{ po.po_number }}</span></td>
              <td>
                <div class="az-supplier-cell">
                  <div class="az-avatar az-avatar--sm" :class="`az-avatar--${avatarColor(po.supplier_name)}`">{{ initials(po.supplier_name) }}</div>
                  <span class="font-weight-medium">{{ po.supplier_name }}</span>
                </div>
              </td>
              <td class="text-medium-emphasis">{{ formatDate(po.order_date || po.created_at) }}</td>
              <td class="text-medium-emphasis">{{ po.expected_delivery_date ? formatDate(po.expected_delivery_date) : '—' }}</td>
              <td class="text-right">{{ po.item_count || po.lines?.length || 0 }}</td>
              <td class="text-right font-weight-bold">{{ formatMoney(po.grand_total) }}</td>
              <td>
                <div class="az-progress-wrap">
                  <div class="az-progress-bar">
                    <div class="az-progress-fill" :style="{ width: poProgress(po) + '%' }" :class="poProgressClass(po)"></div>
                  </div>
                  <span class="az-progress-label">{{ poProgress(po) }}%</span>
                </div>
              </td>
              <td>
                <span class="az-status-chip" :class="`az-status-chip--${statusClass(po.status)}`">{{ po.status_display || po.status }}</span>
              </td>
              <td>
                <div class="az-row-actions" @click.stop>
                  <v-btn size="small" variant="text" icon="mdi-eye" @click="viewPO(po)" />
                  <v-btn v-if="po.status === 'draft'" size="small" variant="text" icon="mdi-send" color="info" @click="submitPO(po)" />
                  <v-btn v-if="po.status === 'submitted'" size="small" variant="text" icon="mdi-check" color="success" @click="approvePO(po)" />
                  <v-btn v-if="po.status === 'approved'" size="small" variant="text" icon="mdi-email-send" color="primary" @click="sendPO(po)" />
                  <v-btn v-if="po.status === 'sent' || po.status === 'partially_received'" size="small" variant="text" icon="mdi-package-down" color="teal" @click="openReceive(po)" />
                  <v-btn v-if="po.status !== 'received' && po.status !== 'cancelled'" size="small" variant="text" icon="mdi-close" color="error" @click="cancelPO(po)" />
                </div>
              </td>
            </tr>
            <tr v-if="!pagedItems.length">
              <td colspan="9" class="az-table__empty">
                <v-icon size="36" color="grey-lighten-1">mdi-clipboard-text-off</v-icon>
                <p class="text-body-2 mt-2 text-medium-emphasis">No purchase orders found.</p>
              </td>
            </tr>
          </tbody>
        </table>
        <div v-if="filtered.length > itemsPerPage" class="az-pagination">
          <v-btn size="small" variant="text" prepend-icon="mdi-chevron-left" :disabled="page === 1" @click="page--">Prev</v-btn>
          <span class="az-pagination__info">Page {{ page }} of {{ totalPages }}</span>
          <v-btn size="small" variant="text" append-icon="mdi-chevron-right" :disabled="page === totalPages" @click="page++">Next</v-btn>
        </div>
      </div>

      <!-- ===== Card View ===== -->
      <div v-else class="az-card-grid">
        <div v-for="po in pagedItems" :key="po.id" class="az-po-card" @click="viewPO(po)">
          <div class="az-po-card__top">
            <span class="font-weight-bold text-primary">{{ po.po_number }}</span>
            <span class="az-status-chip" :class="`az-status-chip--${statusClass(po.status)}`">{{ po.status_display || po.status }}</span>
          </div>
          <div class="az-po-card__supplier">
            <div class="az-avatar az-avatar--sm" :class="`az-avatar--${avatarColor(po.supplier_name)}`">{{ initials(po.supplier_name) }}</div>
            <div>
              <p class="font-weight-medium">{{ po.supplier_name }}</p>
              <p class="text-caption text-medium-emphasis">{{ formatDate(po.order_date || po.created_at) }} · {{ po.item_count || 0 }} items</p>
            </div>
          </div>
          <div class="az-po-card__progress">
            <div class="az-progress-bar"><div class="az-progress-fill" :style="{ width: poProgress(po) + '%' }" :class="poProgressClass(po)"></div></div>
            <span class="az-progress-label">{{ poProgress(po) }}% received</span>
          </div>
          <div class="az-po-card__footer">
            <span class="text-h6 font-weight-bold">{{ formatMoney(po.grand_total) }}</span>
            <div class="az-row-actions" @click.stop>
              <v-btn v-if="po.status === 'draft'" size="small" variant="tonal" color="info" prepend-icon="mdi-send" @click="submitPO(po)">Submit</v-btn>
              <v-btn v-if="po.status === 'submitted'" size="small" variant="tonal" color="success" prepend-icon="mdi-check" @click="approvePO(po)">Approve</v-btn>
              <v-btn v-if="po.status === 'approved'" size="small" variant="tonal" color="primary" prepend-icon="mdi-email-send" @click="sendPO(po)">Send</v-btn>
              <v-btn v-if="po.status === 'sent' || po.status === 'partially_received'" size="small" variant="tonal" color="teal" prepend-icon="mdi-package-down" @click="openReceive(po)">Receive</v-btn>
            </div>
          </div>
        </div>
        <div v-if="!pagedItems.length" class="az-table__empty">
          <v-icon size="36" color="grey-lighten-1">mdi-clipboard-text-off</v-icon>
          <p class="text-body-2 mt-2 text-medium-emphasis">No purchase orders found.</p>
        </div>
      </div>
    </template>

    <!-- ===== Detail Dialog ===== -->
    <v-dialog v-model="detailDialog" max-width="780" scrollable>
      <v-card rounded="xl" class="pa-2">
        <v-card-title class="text-h6 font-weight-bold px-4 pt-4 d-flex align-center">
          <v-icon class="mr-2" color="primary">mdi-clipboard-text</v-icon>
          {{ selected?.po_number }}
          <v-spacer />
          <span v-if="selected" class="az-status-chip" :class="`az-status-chip--${statusClass(selected.status)}`">{{ selected.status_display || selected.status }}</span>
        </v-card-title>
        <v-card-text v-if="selected">
          <!-- Supplier & meta -->
          <div class="az-detail-meta">
            <div class="az-detail-meta__item">
              <p class="text-caption text-medium-emphasis">Supplier</p>
              <p class="font-weight-medium">{{ selected.supplier_name }}</p>
              <p class="text-caption text-medium-emphasis" v-if="selected.supplier_contact_person">{{ selected.supplier_contact_person }}</p>
              <p class="text-caption text-medium-emphasis" v-if="selected.supplier_phone"><v-icon size="12">mdi-phone</v-icon> {{ selected.supplier_phone }}</p>
            </div>
            <div class="az-detail-meta__item">
              <p class="text-caption text-medium-emphasis">Order Date</p>
              <p class="font-weight-medium">{{ formatDate(selected.order_date || selected.created_at) }}</p>
            </div>
            <div class="az-detail-meta__item">
              <p class="text-caption text-medium-emphasis">Expected Delivery</p>
              <p class="font-weight-medium">{{ selected.expected_delivery_date ? formatDate(selected.expected_delivery_date) : '—' }}</p>
            </div>
            <div class="az-detail-meta__item">
              <p class="text-caption text-medium-emphasis">Branch</p>
              <p class="font-weight-medium">{{ selected.branch_name || selected.branch_code }}</p>
            </div>
            <div class="az-detail-meta__item">
              <p class="text-caption text-medium-emphasis">Created By</p>
              <p class="font-weight-medium">{{ selected.created_by_name || '—' }}</p>
            </div>
            <div class="az-detail-meta__item" v-if="selected.approved_by_name">
              <p class="text-caption text-medium-emphasis">Approved By</p>
              <p class="font-weight-medium">{{ selected.approved_by_name }}</p>
            </div>
          </div>

          <v-divider class="my-3" />

          <!-- Line items -->
          <p class="text-subtitle-2 font-weight-bold mb-2">Line Items</p>
          <div class="az-line-table-wrap">
            <table class="az-line-table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th class="text-right">Ordered</th>
                  <th class="text-right">Received</th>
                  <th class="text-right">Unit Cost</th>
                  <th class="text-right">Retail</th>
                  <th class="text-right">Margin</th>
                  <th class="text-right">Line Total</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="line in selected.lines" :key="line.id">
                  <td>
                    <div class="font-weight-medium">{{ line.product_name || '—' }}</div>
                    <div class="text-caption text-medium-emphasis" v-if="line.product_sku">{{ line.product_sku }}</div>
                  </td>
                  <td class="text-right">{{ line.quantity_ordered }}</td>
                  <td class="text-right" :class="Number(line.quantity_received) >= Number(line.quantity_ordered) ? 'text-success font-weight-bold' : ''">{{ line.quantity_received }}</td>
                  <td class="text-right">{{ formatMoney(line.unit_cost) }}</td>
                  <td class="text-right">{{ formatMoney(line.retail_price) }}</td>
                  <td class="text-right" :class="profitMargin(line) >= 0 ? 'text-success font-weight-medium' : 'text-error font-weight-medium'">{{ profitMargin(line) }}%</td>
                  <td class="text-right font-weight-medium">{{ formatMoney(line.line_total) }}</td>
                </tr>
                <tr v-if="!selected.lines || !selected.lines.length">
                  <td colspan="7" class="text-center text-medium-emphasis py-4">No line items</td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Totals -->
          <div class="az-totals">
            <div class="az-totals__row"><span>Subtotal</span><span>{{ formatMoney(selected.subtotal) }}</span></div>
            <div class="az-totals__row" v-if="Number(selected.discount_total) > 0"><span>Discount</span><span class="text-success">-{{ formatMoney(selected.discount_total) }}</span></div>
            <div class="az-totals__row" v-if="Number(selected.tax_total) > 0"><span>Tax</span><span>{{ formatMoney(selected.tax_total) }}</span></div>
            <div class="az-totals__row" v-if="Number(selected.shipping_cost) > 0"><span>Shipping</span><span>{{ formatMoney(selected.shipping_cost) }}</span></div>
            <div class="az-totals__row az-totals__row--bold"><span>Grand Total</span><span class="text-primary">{{ formatMoney(selected.grand_total) }}</span></div>
          </div>

          <div v-if="selected.notes" class="az-notes-box">
            <p class="text-caption text-medium-emphasis mb-1"><v-icon size="14">mdi-note-text</v-icon> Notes</p>
            <p class="text-body-2">{{ selected.notes }}</p>
          </div>

          <!-- Receipts -->
          <div v-if="selected.receipts && selected.receipts.length > 0" class="mt-4">
            <p class="text-subtitle-2 font-weight-bold mb-2"><v-icon size="16" color="teal">mdi-package-variant-closed-check</v-icon> Goods Receipts</p>
            <v-chip v-for="r in selected.receipts" :key="r.id" size="small" variant="tonal" color="teal" class="mr-1 mb-1">{{ r.grn_number }} · {{ formatMoney(r.total_received_value) }}</v-chip>
          </div>
        </v-card-text>
        <v-card-actions class="px-4 pb-4">
          <v-spacer />
          <v-btn v-if="selected && selected.status === 'draft'" variant="tonal" color="info" prepend-icon="mdi-send" @click="submitPO(selected); detailDialog = false">Submit</v-btn>
          <v-btn v-if="selected && selected.status === 'submitted'" variant="tonal" color="success" prepend-icon="mdi-check" @click="approvePO(selected); detailDialog = false">Approve</v-btn>
          <v-btn v-if="selected && selected.status === 'approved'" variant="tonal" color="primary" prepend-icon="mdi-email-send" @click="sendPO(selected); detailDialog = false">Send to Supplier</v-btn>
          <v-btn v-if="selected && (selected.status === 'sent' || selected.status === 'partially_received')" variant="flat" color="teal" prepend-icon="mdi-package-down" @click="openReceive(selected); detailDialog = false">Receive Stock</v-btn>
          <v-btn variant="text" @click="detailDialog = false">Close</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- ===== Create Dialog ===== -->
    <v-dialog v-model="createDialog" max-width="820" scrollable>
      <v-card rounded="xl" class="pa-2">
        <v-card-title class="text-h6 font-weight-bold px-4 pt-4">
          <v-icon class="mr-2" color="primary">mdi-plus-circle</v-icon>
          Create Purchase Order
        </v-card-title>
        <v-card-text>
          <v-row dense>
            <v-col cols="12" md="6">
              <v-select v-model="form.supplier" :items="supplierOptions" item-title="name" item-value="id" label="Supplier *" density="compact" variant="outlined" hide-details="auto" return-object />
            </v-col>
            <v-col cols="12" md="6">
              <v-select v-model="form.branch" :items="branchOptions" item-title="name" item-value="id" label="Branch *" density="compact" variant="outlined" hide-details="auto" />
            </v-col>
            <v-col cols="12" md="6">
              <v-select v-model="form.status" :items="createStatusOptions" item-title="label" item-value="value" label="Status" density="compact" variant="outlined" hide-details="auto" />
            </v-col>
            <v-col cols="12" md="6">
              <v-text-field v-model="form.expected_delivery_date" label="Expected Delivery Date" type="date" density="compact" variant="outlined" hide-details="auto" />
            </v-col>
            <v-col cols="12" md="6">
              <v-text-field v-model.number="form.shipping_cost" label="Shipping Cost" type="number" prefix="KSh" density="compact" variant="outlined" hide-details="auto" />
            </v-col>
          </v-row>
          <v-textarea v-model="form.notes" label="Notes (optional)" density="compact" variant="outlined" hide-details="auto" rows="2" class="mt-3" />

          <v-alert v-if="form.status === 'received'" type="info" variant="tonal" density="compact" class="mt-3" icon="mdi-information-outline">
            Stock will be automatically received: inventory updated, product cost/retail prices updated, and stock movements recorded.
          </v-alert>

          <v-divider class="my-3" />
          <div class="d-flex justify-space-between align-center mb-2">
            <span class="text-subtitle-2 font-weight-bold">Line Items</span>
            <v-btn size="small" variant="tonal" color="primary" prepend-icon="mdi-plus" @click="addLine">Add Line</v-btn>
          </div>
          <div v-for="(line, i) in form.lines" :key="i" class="az-line-form">
            <div class="az-line-form__product">
              <v-select v-model="line.product" :items="productSelectOptions" item-title="name" item-value="id" item-subtitle="sku" label="Product" density="compact" variant="outlined" hide-details return-object @update:modelValue="onProductSelect(line, $event)" />
            </div>
            <v-text-field v-model.number="line.quantity_ordered" label="Qty" type="number" density="compact" variant="outlined" hide-details style="max-width: 80px;" @update:modelValue="calcLine(line)" />
            <v-text-field v-model.number="line.unit_cost" label="Unit Cost" type="number" prefix="KSh" density="compact" variant="outlined" hide-details style="max-width: 120px;" @update:modelValue="calcLine(line)" />
            <v-text-field v-model.number="line.retail_price" label="Retail Price" type="number" prefix="KSh" density="compact" variant="outlined" hide-details style="max-width: 120px;" />
            <div class="az-line-form__margin" :class="profitMargin(line) >= 0 ? 'az-line-form__margin--pos' : 'az-line-form__margin--neg'">
              <span class="text-caption">Margin</span>
              <span class="font-weight-bold">{{ profitMargin(line) }}%</span>
            </div>
            <span class="az-line-form__total font-weight-medium">{{ formatMoney(line.line_total) }}</span>
            <v-btn icon="mdi-delete" size="small" variant="text" color="error" @click="form.lines.splice(i, 1)" />
          </div>
          <div v-if="!form.lines.length" class="text-center text-medium-emphasis py-4">
            <v-icon size="32" color="grey-lighten-1">mdi-package-variant</v-icon>
            <p class="mt-1">No line items. Click "Add Line" to begin.</p>
          </div>

          <v-divider class="my-3" />
          <div class="az-create-totals">
            <div class="az-totals__row"><span>Subtotal</span><span>{{ formatMoney(formSubtotal) }}</span></div>
            <div class="az-totals__row az-totals__row--bold"><span>Grand Total</span><span class="text-primary">{{ formatMoney(formGrandTotal) }}</span></div>
          </div>
        </v-card-text>
        <v-card-actions class="px-4 pb-4">
          <v-spacer />
          <v-btn variant="text" @click="createDialog = false">Cancel</v-btn>
          <v-btn variant="flat" color="primary" prepend-icon="mdi-content-save" @click="createPO" :loading="saving">Create PO</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- ===== Receive Dialog ===== -->
    <v-dialog v-model="receiveDialog" max-width="720" scrollable>
      <v-card rounded="xl" class="pa-2">
        <v-card-title class="text-h6 font-weight-bold px-4 pt-4">
          <v-icon class="mr-2" color="teal">mdi-package-down</v-icon>
          Receive Stock — {{ selected?.po_number }}
        </v-card-title>
        <v-card-text v-if="selected">
          <p class="text-body-2 text-medium-emphasis mb-3">Enter the quantity received for each line item. Stock will be added to inventory automatically.</p>
          <div class="az-receive-list">
            <div v-for="(line, i) in receiveLines" :key="i" class="az-receive-item">
              <div class="az-receive-item__info">
                <p class="font-weight-medium">{{ line.product_name || '—' }}</p>
                <p class="text-caption text-medium-emphasis">Ordered: {{ line.quantity_ordered }} · Already received: {{ line.quantity_received }}</p>
              </div>
              <div class="az-receive-item__input">
                <v-text-field v-model.number="line.receiving" label="Receiving" type="number" density="compact" variant="outlined" hide-details :max="Number(line.quantity_ordered) - Number(line.quantity_received)" prefix="qty" style="max-width: 130px;" />
              </div>
            </div>
            <div v-if="!receiveLines.length" class="text-center text-medium-emphasis py-4">All items have been fully received.</div>
          </div>
          <v-textarea v-model="receiveNotes" label="Receipt Notes (optional)" density="compact" variant="outlined" hide-details="auto" rows="2" class="mt-3" />
        </v-card-text>
        <v-card-actions class="px-4 pb-4">
          <v-spacer />
          <v-btn variant="text" @click="receiveDialog = false">Cancel</v-btn>
          <v-btn variant="flat" color="teal" prepend-icon="mdi-check" @click="confirmReceive" :loading="receiving">Confirm Receipt</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup>
definePageMeta({ middleware: 'auth' })
const { currency } = useFormat()
const { success, error: errorToast } = useToast()
function formatMoney(v) { return currency(v || 0) }

// ===== State =====
const loading = ref(false)
const saving = ref(false)
const receiving = ref(false)
const pos = ref([])
const suppliers = ref([])
const branches = ref([])
const products = ref([])
const searchText = ref('')
const statusFilter = ref(null)
const supplierFilter = ref(null)
const activeTab = ref('all')
const viewMode = ref('table')
const page = ref(1)
const itemsPerPage = 12
const detailDialog = ref(false)
const createDialog = ref(false)
const receiveDialog = ref(false)
const selected = ref(null)
const receiveLines = ref([])
const receiveNotes = ref('')

const form = ref({
  supplier: null,
  branch: null,
  status: 'draft',
  expected_delivery_date: null,
  shipping_cost: 0,
  notes: '',
  lines: [],
})

const statusOptions = [
  { label: 'Draft', value: 'draft' },
  { label: 'Submitted', value: 'submitted' },
  { label: 'Approved', value: 'approved' },
  { label: 'Sent', value: 'sent' },
  { label: 'Partially Received', value: 'partially_received' },
  { label: 'Received', value: 'received' },
  { label: 'Cancelled', value: 'cancelled' },
]

const createStatusOptions = [
  { label: 'Draft', value: 'draft' },
  { label: 'Submitted', value: 'submitted' },
  { label: 'Approved', value: 'approved' },
  { label: 'Sent', value: 'sent' },
  { label: 'Received', value: 'received' },
]

// ===== Helpers =====
function formatDate(d) {
  if (!d) return '—'
  const dt = new Date(d)
  return dt.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
}

function statusClass(s) {
  const map = { draft: 'draft', submitted: 'submitted', approved: 'approved', sent: 'sent', partially_received: 'partial', received: 'settled', cancelled: 'overdue' }
  return map[s] || 'draft'
}

function initials(name) {
  if (!name) return '?'
  return name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()
}

function avatarColor(name) {
  if (!name) return 0
  const colors = ['blue', 'green', 'purple', 'orange', 'teal', 'pink', 'indigo', 'cyan']
  let hash = 0
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash)
  return colors[Math.abs(hash) % colors.length]
}

function poProgress(po) {
  const lines = po.lines || []
  if (!lines.length) return 0
  const totalOrdered = lines.reduce((s, l) => s + Number(l.quantity_ordered), 0)
  const totalReceived = lines.reduce((s, l) => s + Number(l.quantity_received), 0)
  if (totalOrdered <= 0) return 0
  return Math.min(100, Math.round((totalReceived / totalOrdered) * 100))
}

function poProgressClass(po) {
  const pct = poProgress(po)
  if (pct >= 100) return 'az-progress-fill--success'
  if (pct > 0) return 'az-progress-fill--warning'
  return 'az-progress-fill--neutral'
}

// ===== Computed: filtered list =====
const filtered = computed(() => {
  let list = pos.value
  if (activeTab.value === 'active') list = list.filter(p => ['draft', 'submitted', 'approved', 'sent', 'partially_received'].includes(p.status))
  else if (activeTab.value === 'pending') list = list.filter(p => p.status === 'draft' || p.status === 'submitted')
  else if (activeTab.value === 'received') list = list.filter(p => p.status === 'received' || p.status === 'partially_received')
  else if (activeTab.value === 'cancelled') list = list.filter(p => p.status === 'cancelled')
  if (searchText.value) {
    const s = searchText.value.toLowerCase()
    list = list.filter(p => p.po_number?.toLowerCase().includes(s) || p.supplier_name?.toLowerCase().includes(s))
  }
  if (statusFilter.value) list = list.filter(p => p.status === statusFilter.value)
  if (supplierFilter.value) list = list.filter(p => p.supplier === supplierFilter.value)
  return list
})

const totalPages = computed(() => Math.ceil(filtered.value.length / itemsPerPage))
const pagedItems = computed(() => {
  const start = (page.value - 1) * itemsPerPage
  return filtered.value.slice(start, start + itemsPerPage)
})

const supplierOptions = computed(() => suppliers.value)
const branchOptions = computed(() => branches.value)
const productSelectOptions = computed(() => products.value.map(p => ({ ...p, subtitle: p.sku })))
const supplierFilterOptions = computed(() => suppliers.value)

// ===== KPIs =====
const kpis = computed(() => {
  const all = pos.value
  const total = all.length
  const totalItems = all.reduce((s, p) => s + (p.item_count || p.lines?.length || 0), 0)
  const pendingApproval = all.filter(p => p.status === 'submitted').length
  const active = all.filter(p => p.status !== 'cancelled' && p.status !== 'received')
  const totalValue = active.reduce((s, p) => s + Number(p.grand_total), 0)
  const received = all.filter(p => p.status === 'received').length
  const partiallyReceived = all.filter(p => p.status === 'partially_received').length
  const receivedValue = all.filter(p => p.status === 'received' || p.status === 'partially_received').reduce((s, p) => s + Number(p.grand_total), 0)
  const receivingRate = total > 0 ? ((received + partiallyReceived) / total * 100).toFixed(1) : '0.0'
  const activeSuppliers = new Set(active.map(p => p.supplier)).size
  return { total, totalItems, pendingApproval, totalValue, received, partiallyReceived, receivedValue, receivingRate, activeSuppliers }
})

// ===== Tabs =====
const tabs = computed(() => [
  { id: 'all', label: 'All', icon: 'mdi-clipboard-text-multiple', count: pos.value.length },
  { id: 'active', label: 'Active', icon: 'mdi-clock-outline', count: pos.value.filter(p => ['draft', 'submitted', 'approved', 'sent', 'partially_received'].includes(p.status)).length },
  { id: 'pending', label: 'Pending', icon: 'mdi-clock-alert-outline', count: pos.value.filter(p => p.status === 'draft' || p.status === 'submitted').length },
  { id: 'received', label: 'Received', icon: 'mdi-package-variant-closed-check', count: pos.value.filter(p => p.status === 'received' || p.status === 'partially_received').length },
  { id: 'cancelled', label: 'Cancelled', icon: 'mdi-cancel', count: pos.value.filter(p => p.status === 'cancelled').length },
])

// ===== Top suppliers =====
const topSuppliers = computed(() => {
  const map = {}
  pos.value.forEach(p => {
    if (p.status === 'cancelled') return
    if (!map[p.supplier_name]) map[p.supplier_name] = { name: p.supplier_name, count: 0, value: 0 }
    map[p.supplier_name].count++
    map[p.supplier_name].value += Number(p.grand_total)
  })
  return Object.values(map).sort((a, b) => b.value - a.value).slice(0, 5)
})

// ===== Charts: Monthly spend =====
const spendSeries = computed(() => {
  const months = 6
  const now = new Date()
  const buckets = {}
  for (let i = months - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const key = `${d.getFullYear()}-${d.getMonth()}`
    buckets[key] = { label: d.toLocaleDateString('en-GB', { month: 'short', year: '2-digit' }), value: 0 }
  }
  pos.value.forEach(p => {
    const d = new Date(p.order_date || p.created_at)
    const key = `${d.getFullYear()}-${d.getMonth()}`
    if (buckets[key]) buckets[key].value += Number(p.grand_total)
  })
  const values = Object.values(buckets)
  return [{ name: 'Purchase Spend', data: values.map(v => Math.round(v.value)) }]
})

const spendChartOptions = {
  chart: { type: 'bar', toolbar: { show: false }, fontFamily: 'inherit' },
  colors: ['#3478f6'],
  plotOptions: { bar: { borderRadius: 6, columnWidth: '50%' } },
  dataLabels: { enabled: false },
  xaxis: {
    categories: Array.from({ length: 6 }, (_, i) => {
      const d = new Date(); d.setMonth(d.getMonth() - (5 - i))
      return d.toLocaleDateString('en-GB', { month: 'short', year: '2-digit' })
    }),
    labels: { style: { fontSize: '11px' } },
  },
  yaxis: { labels: { formatter: (v) => `${(v / 1000).toFixed(0)}k` } },
  grid: { borderColor: 'rgba(0,0,0,0.06)', strokeDashArray: 4 },
  tooltip: { y: { formatter: (v) => formatMoney(v) } },
}

// ===== Charts: Status donut =====
const statusDonutSeries = computed(() => {
  const counts = { draft: 0, submitted: 0, approved: 0, sent: 0, partially_received: 0, received: 0, cancelled: 0 }
  pos.value.forEach(p => { if (counts[p.status] !== undefined) counts[p.status]++ })
  return [counts.draft, counts.submitted, counts.approved, counts.sent, counts.partially_received + counts.received, counts.cancelled]
})

const statusDonutOptions = {
  chart: { type: 'donut', toolbar: { show: false }, fontFamily: 'inherit' },
  labels: ['Draft', 'Submitted', 'Approved', 'Sent', 'Received', 'Cancelled'],
  colors: ['#94a3b8', '#f59e0b', '#3b82f6', '#8b5cf6', '#22c55e', '#ef4444'],
  stroke: { width: 2 },
  dataLabels: { enabled: true, formatter: (val) => `${val.toFixed(0)}%` },
  legend: { position: 'bottom', fontSize: '11px', markers: { size: 6 } },
  plotOptions: {
    pie: { donut: { size: '68%', labels: {
      show: true,
      total: { show: true, label: 'Total', formatter: () => String(pos.value.length) }
    } } }
  },
  tooltip: { y: { formatter: (val) => `${val} POs` } },
}

// ===== Form computations =====
const formSubtotal = computed(() => form.value.lines.reduce((s, l) => s + (Number(l.quantity_ordered) || 0) * (Number(l.unit_cost) || 0), 0))
const formGrandTotal = computed(() => formSubtotal.value + (Number(form.value.shipping_cost) || 0))

function calcLine(line) {
  line.line_total = (Number(line.quantity_ordered) || 0) * (Number(line.unit_cost) || 0)
}

function onProductSelect(line, product) {
  if (product) {
    if (product.cost_price) line.unit_cost = Number(product.cost_price)
    if (product.retail_price) line.retail_price = Number(product.retail_price)
    calcLine(line)
  }
}

function profitMargin(line) {
  const cost = Number(line.unit_cost) || 0
  const retail = Number(line.retail_price) || 0
  if (cost <= 0) return retail > 0 ? 100 : 0
  return Math.round(((retail - cost) / cost) * 100)
}

function addLine() {
  form.value.lines.push({ product: null, quantity_ordered: 1, unit_cost: 0, retail_price: 0, line_total: 0 })
}

function openCreate() {
  form.value = { supplier: null, branch: null, status: 'draft', expected_delivery_date: null, shipping_cost: 0, notes: '', lines: [] }
  if (branches.value.length === 1) form.value.branch = branches.value[0].id
  addLine()
  createDialog.value = true
}

// ===== API =====
async function loadData() {
  loading.value = true
  try {
    const [poData, supData, branchData, prodData] = await Promise.all([
      useApi()('/purchasing/orders/?page_size=500'),
      useApi()('/suppliers/?page_size=500').catch(() => ({ results: [] })),
      useApi()('/branches/?page_size=100').catch(() => ({ results: [] })),
      useApi()('/products/?page_size=500').catch(() => ({ results: [] })),
    ])
    pos.value = poData.results || poData
    suppliers.value = supData.results || supData
    branches.value = branchData.results || branchData
    products.value = prodData.results || prodData
  } catch { /* ignore */ } finally {
    loading.value = false
  }
}

function viewPO(po) {
  selected.value = po
  detailDialog.value = true
}

async function submitPO(po) {
  try {
    await useApi()(`/purchasing/orders/${po.id}/submit/`, { method: 'POST' })
    success('PO submitted for approval')
    await loadData()
  } catch {
    errorToast('Failed to submit PO')
  }
}

async function approvePO(po) {
  try {
    await useApi()(`/purchasing/orders/${po.id}/approve/`, { method: 'POST' })
    success('PO approved')
    await loadData()
  } catch {
    errorToast('Failed to approve PO')
  }
}

async function sendPO(po) {
  try {
    await useApi()(`/purchasing/orders/${po.id}/send/`, { method: 'POST' })
    success('PO marked as sent to supplier')
    await loadData()
  } catch {
    errorToast('Failed to send PO')
  }
}

async function cancelPO(po) {
  try {
    await useApi()(`/purchasing/orders/${po.id}/cancel/`, { method: 'POST' })
    success('PO cancelled')
    await loadData()
  } catch {
    errorToast('Failed to cancel PO')
  }
}

function openReceive(po) {
  selected.value = po
  receiveLines.value = (po.lines || []).map(l => ({
    po_line: l.id,
    product_name: l.product_name,
    quantity_ordered: Number(l.quantity_ordered),
    quantity_received: Number(l.quantity_received),
    receiving: Math.max(0, Number(l.quantity_ordered) - Number(l.quantity_received)),
  })).filter(l => l.receiving > 0 || l.quantity_received < l.quantity_ordered)
  receiveNotes.value = ''
  receiveDialog.value = true
}

async function confirmReceive() {
  if (!selected.value) return
  receiving.value = true
  try {
    const lines = receiveLines.value
      .filter(l => Number(l.receiving) > 0)
      .map(l => ({ po_line: l.po_line, quantity_received: Number(l.receiving), condition: 'good', notes: '' }))
    if (!lines.length) {
      errorToast('Enter quantity to receive')
      receiving.value = false
      return
    }
    const branchId = selected.value.branch
    const grn = await useApi()('/purchasing/receipts/', {
      method: 'POST',
      body: { po: selected.value.id, branch: branchId, notes: receiveNotes.value, lines }
    })
    success('Stock received — inventory updated')
    receiveDialog.value = false
    await loadData()
  } catch (e) {
    const msg = e?.data?.detail || e?.data?.lines?.[0] || 'Failed to receive stock'
    errorToast(typeof msg === 'string' ? msg : 'Failed to receive stock')
  } finally {
    receiving.value = false
  }
}

async function createPO() {
  if (!form.value.supplier || !form.value.branch) {
    errorToast('Select supplier and branch')
    return
  }
  if (!form.value.lines.length || form.value.lines.some(l => !l.product || !l.quantity_ordered)) {
    errorToast('Add at least one valid line item')
    return
  }
  saving.value = true
  try {
    const body = {
      supplier: form.value.supplier.id || form.value.supplier,
      branch: form.value.branch,
      status: form.value.status || 'draft',
      expected_delivery_date: form.value.expected_delivery_date || null,
      shipping_cost: Number(form.value.shipping_cost) || 0,
      notes: form.value.notes || '',
      lines: form.value.lines.map(l => ({
        product: l.product?.id || l.product,
        variant: null,
        quantity_ordered: Number(l.quantity_ordered) || 1,
        unit_cost: Number(l.unit_cost) || 0,
        retail_price: Number(l.retail_price) || 0,
        tax_rate: 0,
      })),
    }
    await useApi()('/purchasing/orders/', { method: 'POST', body })
    success(form.value.status === 'received' ? 'Purchase order created and stock received' : 'Purchase order created')
    createDialog.value = false
    await loadData()
  } catch (e) {
    const msg = e?.data?.detail || e?.data?.lines || 'Failed to create PO'
    errorToast(typeof msg === 'string' ? msg : 'Failed to create PO')
  } finally {
    saving.value = false
  }
}

function exportCSV() {
  const rows = [['PO Number', 'Supplier', 'Date', 'Expected', 'Items', 'Subtotal', 'Tax', 'Shipping', 'Grand Total', 'Status']]
  filtered.value.forEach(p => {
    rows.push([
      p.po_number || '',
      p.supplier_name || '',
      formatDate(p.order_date || p.created_at),
      p.expected_delivery_date ? formatDate(p.expected_delivery_date) : '',
      p.item_count || p.lines?.length || 0,
      Number(p.subtotal || 0),
      Number(p.tax_total || 0),
      Number(p.shipping_cost || 0),
      Number(p.grand_total || 0),
      p.status_display || p.status,
    ])
  })
  const csv = rows.map(r => r.map(f => `"${f}"`).join(',')).join('\n')
  const blob = new Blob([csv], { type: 'text/csv' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `purchase-orders-${new Date().toISOString().slice(0,10)}.csv`
  a.click()
  URL.revokeObjectURL(url)
  success('Purchase orders exported')
}

function goToExcelBulk() {
  const params = new URLSearchParams()
  if (searchText.value) params.set('search', searchText.value)
  if (statusFilter.value) params.set('status', statusFilter.value)
  if (supplierFilter.value) params.set('supplier', supplierFilter.value)
  const qs = params.toString()
  navigateTo(qs ? `/purchase-orders/excel-bulk?${qs}` : '/purchase-orders/excel-bulk')
}

watch([searchText, statusFilter, supplierFilter, activeTab], () => { page.value = 1 })

onMounted(loadData)
</script>

<style scoped>
.az-page {
  padding: 20px 24px;
  max-width: 1600px;
  margin: 0 auto;
  font-family: Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
}
.az-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px; flex-wrap: wrap; gap: 12px; }
.az-header__left { display: flex; align-items: center; gap: 14px; }
.az-header__title-icon { width: 48px; height: 48px; border-radius: 14px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.az-header__title-icon--primary { background: rgba(52, 120, 246, 0.12); color: #3478f6; }
.az-header__actions { display: flex; gap: 8px; align-items: center; flex-wrap: wrap; }
.az-loading { display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 80px 20px; }

/* KPI */
.az-kpi-grid { display: grid; grid-template-columns: repeat(6, 1fr); gap: 12px; margin-bottom: 20px; }
.az-kpi { background: rgb(var(--v-theme-surface)); border: 1px solid rgba(0,0,0,0.06); border-radius: 14px; padding: 14px; display: flex; gap: 12px; align-items: flex-start; transition: box-shadow 0.15s; }
.az-kpi:hover { box-shadow: 0 4px 16px rgba(0,0,0,0.05); }
.az-kpi__icon { width: 40px; height: 40px; border-radius: 10px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.az-kpi__icon--info { background: rgba(52,120,246,0.1); color: #3478f6; }
.az-kpi__icon--warning { background: rgba(245,158,11,0.1); color: #f59e0b; }
.az-kpi__icon--primary { background: rgba(52,120,246,0.1); color: #3478f6; }
.az-kpi__icon--teal { background: rgba(0,184,212,0.1); color: #00B8D4; }
.az-kpi__icon--error { background: rgba(239,68,68,0.1); color: #ef4444; }
.az-kpi__icon--purple { background: rgba(124,77,255,0.1); color: #7C4DFF; }
.az-kpi__body { min-width: 0; }
.az-kpi__label { font-size: 0.6875rem; color: rgba(30,41,59,0.5); font-weight: 600; text-transform: uppercase; letter-spacing: 0.04em; margin-bottom: 2px; }
.az-kpi__value { font-size: 1.125rem; font-weight: 700; line-height: 1.2; }
.az-kpi__sub { font-size: 0.6875rem; color: rgba(30,41,59,0.45); margin-top: 2px; }

/* Charts */
.az-chart-row { display: flex; gap: 16px; margin-bottom: 20px; }
.az-card { background: rgb(var(--v-theme-surface)); border: 1px solid rgba(0,0,0,0.06); border-radius: 14px; overflow: hidden; }
.az-card--two-thirds { flex: 2 2 0; min-width: 0; }
.az-card--third { flex: 1 1 0; min-width: 0; }
.az-card__header { display: flex; align-items: center; gap: 12px; padding: 14px 18px; border-bottom: 1px solid rgba(0,0,0,0.04); }
.az-card__header-icon { width: 36px; height: 36px; border-radius: 10px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.az-card__header-icon--blue { background: rgba(52,120,246,0.1); color: #3478f6; }
.az-card__header-icon--rose { background: rgba(244,63,94,0.1); color: #f43f5e; }
.az-card__title { font-size: 0.875rem; font-weight: 700; color: rgba(30,41,59,0.87); }
.az-card__subtitle { font-size: 0.75rem; color: rgba(30,41,59,0.45); }
.az-card__body { padding: 12px 16px; }

/* Top Suppliers */
.az-suppliers-section { margin-bottom: 20px; background: rgb(var(--v-theme-surface)); border: 1px solid rgba(0,0,0,0.06); border-radius: 14px; padding: 16px 18px; }
.az-suppliers-title { display: flex; align-items: center; gap: 8px; font-size: 0.875rem; font-weight: 700; color: rgba(30,41,59,0.87); margin-bottom: 14px; }
.az-suppliers-grid { display: grid; grid-template-columns: repeat(5, 1fr); gap: 10px; }
.az-supplier-card { display: flex; align-items: center; gap: 10px; padding: 12px; border-radius: 10px; background: rgba(52,120,246,0.03); border: 1px solid rgba(52,120,246,0.08); }
.az-supplier-rank { font-size: 0.75rem; font-weight: 800; color: rgba(52,120,246,0.5); flex-shrink: 0; }
.az-supplier-info { flex: 1; min-width: 0; }
.az-supplier-name { font-size: 0.8125rem; font-weight: 600; color: rgba(30,41,59,0.87); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.az-supplier-sub { font-size: 0.6875rem; color: rgba(30,41,59,0.45); }

/* Filters */
.az-filters { display: flex; gap: 10px; margin-bottom: 12px; flex-wrap: wrap; align-items: center; }
.az-filters__search { flex: 1 1 300px; }
.az-filters__select { max-width: 180px; }

/* View toggle */
.az-view-toggle { display: flex; justify-content: flex-end; margin-bottom: 12px; }

/* Tabs */
.az-tabs { display: flex; gap: 6px; margin-bottom: 16px; flex-wrap: wrap; }
.az-tab { display: inline-flex; align-items: center; gap: 4px; padding: 8px 16px; border-radius: 8px; border: 1px solid rgba(0,0,0,0.08); background: rgb(var(--v-theme-surface)); font-size: 0.8125rem; font-weight: 600; color: rgba(30,41,59,0.55); cursor: pointer; transition: all 0.15s; }
.az-tab:hover { background: rgba(0,0,0,0.04); }
.az-tab--active { background: rgba(52,120,246,0.08); border-color: rgba(52,120,246,0.25); color: #3478f6; }
.az-tab__badge { display: inline-flex; align-items: center; justify-content: center; min-width: 22px; height: 20px; padding: 0 6px; border-radius: 10px; background: rgba(0,0,0,0.08); font-size: 0.6875rem; font-weight: 700; }
.az-tab--active .az-tab__badge { background: rgba(52,120,246,0.15); color: #3478f6; }

/* Table */
.az-table-wrap { background: rgb(var(--v-theme-surface)); border: 1px solid rgba(0,0,0,0.06); border-radius: 14px; overflow-x: auto; }
.az-table { width: 100%; border-collapse: collapse; font-size: 0.8125rem; }
.az-table thead tr { background: rgba(0,0,0,0.02); }
.az-table th { text-align: left; padding: 11px 16px; font-weight: 700; font-size: 0.6875rem; text-transform: uppercase; letter-spacing: 0.05em; color: rgba(30,41,59,0.5); white-space: nowrap; }
.az-table th.text-right, .az-table td.text-right { text-align: right; }
.az-table tbody tr { border-top: 1px solid rgba(0,0,0,0.04); }
.az-table__row { transition: background 0.12s; cursor: pointer; }
.az-table__row:hover { background: rgba(52,120,246,0.02); }
.az-table td { padding: 11px 16px; white-space: nowrap; }
.az-table__empty { text-align: center; padding: 40px 16px; color: rgba(30,41,59,0.4); }

/* Supplier cell */
.az-supplier-cell { display: flex; align-items: center; gap: 8px; }
.az-avatar { width: 36px; height: 36px; border-radius: 10px; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 0.75rem; color: #fff; flex-shrink: 0; }
.az-avatar--sm { width: 28px; height: 28px; font-size: 0.6875rem; border-radius: 8px; }
.az-avatar--blue { background: linear-gradient(135deg, #3478f6, #1e40af); }
.az-avatar--green { background: linear-gradient(135deg, #10b981, #047857); }
.az-avatar--purple { background: linear-gradient(135deg, #7c4dff, #4527a0); }
.az-avatar--orange { background: linear-gradient(135deg, #f59e0b, #d97706); }
.az-avatar--teal { background: linear-gradient(135deg, #14b8a6, #0f766e); }
.az-avatar--pink { background: linear-gradient(135deg, #ec4899, #be185d); }
.az-avatar--indigo { background: linear-gradient(135deg, #6366f1, #3730a3); }
.az-avatar--cyan { background: linear-gradient(135deg, #06b6d4, #0e7490); }
.az-avatar--primary { background: linear-gradient(135deg, #3478f6, #1e40af); }
.az-avatar--error { background: linear-gradient(135deg, #ef4444, #b91c1c); }

/* Progress */
.az-progress-wrap { display: flex; align-items: center; gap: 8px; }
.az-progress-bar { flex: 1; height: 6px; background: rgba(0,0,0,0.06); border-radius: 3px; overflow: hidden; min-width: 80px; }
.az-progress-fill { height: 100%; border-radius: 3px; transition: width 0.3s; }
.az-progress-fill--success { background: #22c55e; }
.az-progress-fill--warning { background: #f59e0b; }
.az-progress-fill--error { background: #ef4444; }
.az-progress-fill--neutral { background: #cbd5e1; }
.az-progress-label { font-size: 0.6875rem; font-weight: 600; color: rgba(30,41,59,0.5); min-width: 36px; text-align: right; }

/* Status chips */
.az-status-chip { display: inline-flex; align-items: center; padding: 3px 10px; border-radius: 20px; font-size: 0.6875rem; font-weight: 600; white-space: nowrap; }
.az-status-chip--draft { background: rgba(148,163,184,0.15); color: rgb(100,116,139); }
.az-status-chip--submitted { background: rgba(245,158,11,0.12); color: rgb(217,119,6); }
.az-status-chip--approved { background: rgba(52,120,246,0.12); color: #3478f6; }
.az-status-chip--sent { background: rgba(139,92,246,0.12); color: rgb(124,58,237); }
.az-status-chip--partial { background: rgba(0,184,212,0.12); color: rgb(14,116,144); }
.az-status-chip--settled { background: rgba(34,197,94,0.12); color: rgb(22,163,74); }
.az-status-chip--overdue { background: rgba(239,68,68,0.12); color: rgb(239,68,68); }

/* Row actions */
.az-row-actions { display: flex; gap: 2px; align-items: center; }

/* Pagination */
.az-pagination { display: flex; align-items: center; justify-content: center; gap: 12px; padding: 12px 16px; border-top: 1px solid rgba(0,0,0,0.04); }
.az-pagination__info { font-size: 0.8125rem; color: rgba(30,41,59,0.5); }

/* Card view */
.az-card-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 14px; }
.az-po-card { background: rgb(var(--v-theme-surface)); border: 1px solid rgba(0,0,0,0.06); border-radius: 14px; padding: 14px; cursor: pointer; transition: box-shadow 0.15s; display: flex; flex-direction: column; gap: 10px; }
.az-po-card:hover { box-shadow: 0 4px 16px rgba(0,0,0,0.06); }
.az-po-card__top { display: flex; justify-content: space-between; align-items: center; }
.az-po-card__supplier { display: flex; align-items: center; gap: 10px; }
.az-po-card__progress { display: flex; align-items: center; gap: 8px; }
.az-po-card__progress .az-progress-bar { flex: 1; }
.az-po-card__footer { display: flex; justify-content: space-between; align-items: center; }

/* Detail dialog */
.az-detail-meta { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; }
.az-detail-meta__item { }
.az-line-table-wrap { overflow-x: auto; border: 1px solid rgba(0,0,0,0.06); border-radius: 10px; }
.az-line-table { width: 100%; border-collapse: collapse; font-size: 0.8125rem; }
.az-line-table th { text-align: left; padding: 8px 12px; font-weight: 700; font-size: 0.6875rem; text-transform: uppercase; letter-spacing: 0.05em; color: rgba(30,41,59,0.5); background: rgba(0,0,0,0.02); }
.az-line-table td { padding: 8px 12px; border-top: 1px solid rgba(0,0,0,0.04); }
.az-line-table th.text-right, .az-line-table td.text-right { text-align: right; }

.az-totals { max-width: 260px; margin-left: auto; margin-top: 12px; }
.az-totals__row { display: flex; justify-content: space-between; padding: 4px 0; font-size: 0.8125rem; color: rgba(30,41,59,0.65); }
.az-totals__row--bold { border-top: 1px solid rgba(0,0,0,0.08); margin-top: 4px; padding-top: 8px; font-size: 0.9375rem; font-weight: 700; color: rgba(30,41,59,0.87); }

.az-notes-box { margin-top: 12px; padding: 10px 12px; background: rgba(0,0,0,0.02); border-radius: 8px; }

/* Create dialog */
.az-line-form { display: flex; align-items: center; gap: 8px; margin-bottom: 8px; flex-wrap: wrap; }
.az-line-form__product { flex: 1; min-width: 180px; }
.az-line-form__total { min-width: 90px; text-align: right; font-size: 0.8125rem; }
.az-line-form__margin { display: flex; flex-direction: column; align-items: center; min-width: 60px; padding: 4px 6px; border-radius: 8px; line-height: 1.1; }
.az-line-form__margin--pos { background: rgba(34,197,94,0.1); color: rgb(22,163,74); }
.az-line-form__margin--neg { background: rgba(239,68,68,0.1); color: rgb(220,38,38); }
.az-create-totals { max-width: 260px; margin-left: auto; }
.az-create-totals .az-totals__row { font-size: 0.875rem; }

/* Receive dialog */
.az-receive-list { display: flex; flex-direction: column; gap: 8px; }
.az-receive-item { display: flex; justify-content: space-between; align-items: center; padding: 10px 12px; border: 1px solid rgba(0,0,0,0.06); border-radius: 8px; background: rgba(0,184,212,0.02); }
.az-receive-item__info { flex: 1; }
.az-receive-item__input { flex-shrink: 0; }

/* Responsive */
@media (max-width: 1280px) {
  .az-kpi-grid { grid-template-columns: repeat(3, 1fr); }
  .az-suppliers-grid { grid-template-columns: repeat(3, 1fr); }
}
@media (max-width: 960px) {
  .az-chart-row { flex-direction: column; }
  .az-kpi-grid { grid-template-columns: repeat(2, 1fr); }
  .az-suppliers-grid { grid-template-columns: repeat(2, 1fr); }
  .az-detail-meta { grid-template-columns: repeat(2, 1fr); }
}
@media (max-width: 600px) {
  .az-page { padding: 12px; }
  .az-kpi-grid { grid-template-columns: 1fr 1fr; }
  .az-suppliers-grid { grid-template-columns: 1fr; }
  .az-detail-meta { grid-template-columns: 1fr; }
}
</style>
