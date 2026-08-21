<template>
  <div class="az-page">
    <!-- ===== Header ===== -->
    <v-row class="d-flex align-center justify-space-between mb-4">
      <v-col cols="12" sm="6">
        <div class="text-h5 font-weight-bold">Accounts</div>
        <div class="text-body-2 text-medium-emphasis">
          {{ formatMoney(kpis.income) }} income · {{ formatMoney(kpis.expenses) }} expenses · {{ formatMoney(kpis.netCashFlow) }} net flow
        </div>
      </v-col>
      <v-col cols="12" class="d-flex justify-space-between ga-2 flex-wrap align-center">
        <!-- Period filter as inline toggle row -->
        <v-btn-toggle v-model="period" mandatory density="comfortable" variant="outlined" divided color="primary">
          <v-btn
            v-for="opt in periodOptions"
            :key="opt.value"
            :value="opt.value"
            size="small"
            variant="text"
          >
            {{ opt.short }}
          </v-btn>
          <v-btn value="custom" size="small" variant="text" @click="customRangeDialog = true">Custom</v-btn>
        </v-btn-toggle>

        <v-spacer />
        <v-btn variant="outlined" prepend-icon="mdi-download" @click="exportAll">Export</v-btn>
        <v-btn variant="outlined" prepend-icon="mdi-refresh" @click="loadAll" :loading="loading">Refresh</v-btn>
      </v-col>
    </v-row>

    <!-- ===== KPI Row ===== -->
    <v-row class="mb-4">
      <v-col cols="6" lg="3">
        <v-card rounded="xl" variant="outlined" class="kpi-card pa-5">
          <div class="d-flex align-start justify-space-between mb-2">
            <span class="text-caption text-medium-emphasis font-weight-medium">Income</span>
            <div class="kpi-icon kpi-icon-green">
              <v-icon size="18" icon="mdi-arrow-down-bold-circle" />
            </div>
          </div>
          <p class="text-h4 font-weight-bold mb-1 text-success">{{ formatMoney(kpis.income) }}</p>
          <span class="text-caption text-medium-emphasis">{{ formatMoney(kpis.incomeVat) }} VAT</span>
        </v-card>
      </v-col>
      <v-col cols="6" lg="3">
        <v-card rounded="xl" variant="outlined" class="kpi-card pa-5">
          <div class="d-flex align-start justify-space-between mb-2">
            <span class="text-caption text-medium-emphasis font-weight-medium">Expenses</span>
            <div class="kpi-icon kpi-icon-red">
              <v-icon size="18" icon="mdi-arrow-up-bold-circle" />
            </div>
          </div>
          <p class="text-h4 font-weight-bold mb-1 text-error">{{ formatMoney(kpis.expenses) }}</p>
          <span class="text-caption text-medium-emphasis">{{ kpis.expenseCount }} recorded</span>
        </v-card>
      </v-col>
      <v-col cols="6" lg="3">
        <v-card rounded="xl" variant="outlined" class="kpi-card pa-5">
          <div class="d-flex align-start justify-space-between mb-2">
            <span class="text-caption text-medium-emphasis font-weight-medium">Net Cash Flow</span>
            <div class="kpi-icon kpi-icon-teal">
              <v-icon size="18" icon="mdi-trending-up" />
            </div>
          </div>
          <p class="text-h4 font-weight-bold mb-1">{{ formatMoney(kpis.netCashFlow) }}</p>
          <span class="text-caption text-medium-emphasis">{{ rangeShortLabel }}</span>
        </v-card>
      </v-col>
      <v-col cols="6" lg="3">
        <v-card rounded="xl" variant="outlined" class="kpi-card pa-5">
          <div class="d-flex align-start justify-space-between mb-2">
            <span class="text-caption text-medium-emphasis font-weight-medium">Outstanding</span>
            <div class="kpi-icon kpi-icon-orange">
              <v-icon size="18" icon="mdi-cash-fast" />
            </div>
          </div>
          <p class="text-h4 font-weight-bold mb-1">{{ formatMoney(kpis.outstanding) }}</p>
          <span class="text-caption text-medium-emphasis">{{ kpis.creditCount }} credits · {{ formatMoney(kpis.payables) }} payables</span>
        </v-card>
      </v-col>
    </v-row>

    <!-- ===== Tabs ===== -->
    <div class="az-tab-bar">
      <div ref="tabScrollRef" class="az-tab-row">
        <button v-for="t in tabItems" :key="t.value" class="az-tab-btn" :class="{ 'az-tab-btn--active': tab === t.value }" @click="tab = t.value">
          <v-icon size="16">{{ t.icon }}</v-icon>
          <span>{{ t.label }}</span>
        </button>
      </div>
    </div>

    <v-window v-model="tab">
      <!-- ============ OVERVIEW ============ -->
      <v-window-item value="overview">
        <!-- Cash flow trend (full width) -->
        <div class="az-chart-row">
          <v-card rounded="xl" elevation="0" class="az-sec-card">
            <div class="az-sec-card__head">
              <div class="az-sec-card__title">
                <v-icon size="18" class="me-2" color="teal darken-2">mdi-chart-areaspline</v-icon>
                <span>Cash flow trend</span>
              </div>
              <div class="az-legend">
                <v-chip size="x-small" variant="tonal" color="success"><v-icon start size="12">mdi-arrow-up-bold</v-icon>Income</v-chip>
                <v-chip size="x-small" variant="tonal" color="error" class="ms-2"><v-icon start size="12">mdi-arrow-down-bold</v-icon>Expenses</v-chip>
              </div>
            </div>
            <div class="pa-4">
              <apexchart type="area" height="220" :options="cashFlowOptions" :series="cashFlowSeries" />
              <div class="az-chart-divider"></div>
              <div class="az-bar-scroll">
                <apexchart type="bar" height="200" :options="cashFlowBarOptions" :series="cashFlowSeries" :width="barChartWidth" />
              </div>
            </div>
          </v-card>
        </div>

        <!-- Cash position + Donut (2-col) -->
        <div class="az-chart-row az-chart-row--2">
          <v-card rounded="xl" elevation="0" class="az-sec-card">
            <div class="az-sec-card__head">
              <div class="az-sec-card__title">
                <v-icon size="18" class="me-2" color="teal darken-2">mdi-cash-multiple</v-icon>
                <span>Cash position by method</span>
              </div>
            </div>
            <div class="pa-4">
              <div v-for="m in cashByMethod" :key="m.method" class="az-method-row">
                <div class="az-method-row__head">
                  <div class="az-method-row__label">
                    <v-avatar size="32" rounded="lg" variant="tonal" :color="pmColor(m.method)"><v-icon size="16">{{ pmIcon(m.method) }}</v-icon></v-avatar>
                    <span class="text-capitalize">{{ m.method }}</span>
                  </div>
                  <span class="az-method-row__value">{{ formatMoney(m.total) }}</span>
                </div>
                <v-progress-linear :model-value="m.pct" :color="pmColor(m.method)" height="6" rounded class="mt-2" />
                <p class="az-method-row__pct">{{ m.pct.toFixed(0) }}% of total</p>
              </div>
              <div v-if="cashByMethod.length === 0" class="text-center text-medium-emphasis py-6">No transactions in range</div>
            </div>
          </v-card>

          <v-card rounded="xl" elevation="0" class="az-sec-card">
            <div class="az-sec-card__head">
              <div class="az-sec-card__title">
                <v-icon size="18" class="me-2" color="indigo darken-2">mdi-chart-donut</v-icon>
                <span>Payment method distribution</span>
              </div>
            </div>
            <div class="pa-4">
              <div class="d-flex justify-center">
                <div v-if="cashByMethod.length > 0" class="az-method-donut-card">
                  <apexchart type="donut" height="240" :options="cashMethodDonutOptions" :series="cashMethodDonutSeries" />
                </div>
                <div v-else class="text-center text-medium-emphasis py-14">No transactions in range</div>
              </div>
              <div v-if="cashByMethod.length > 0" class="az-donut-badges">
                <div v-for="(m, i) in cashByMethod" :key="m.method" class="az-donut-badge">
                  <span class="az-donut-badge__dot" :style="{ background: ['#4caf50','#2e7d32','#2196f3','#9c27b0','#ff9800','#3f51b5'][i] || '#9e9e9e' }"></span>
                  <span class="az-donut-badge__label text-capitalize">{{ m.method }}</span>
                  <span class="az-donut-badge__amt">{{ formatMoney(m.total) }}</span>
                  <span class="az-donut-badge__pct">{{ m.pct.toFixed(0) }}%</span>
                </div>
              </div>
            </div>
          </v-card>
        </div>

        <!-- Receivables + Payables lists -->
        <div class="az-chart-row az-chart-row--2">
          <v-card rounded="xl" elevation="0" class="az-sec-card">
            <div class="az-sec-card__head">
              <div class="az-sec-card__title">
                <v-icon size="18" class="me-2" color="info">mdi-receipt-text-outline</v-icon>
                <span>Top outstanding receivables</span>
              </div>
              <v-btn variant="text" size="small" @click="tab = 'receivables'">View all</v-btn>
            </div>
            <div class="pa-3">
              <v-list density="compact">
                <v-list-item v-for="r in topReceivables" :key="r.id" class="az-list-item rounded-lg">
                  <template #prepend>
                    <v-avatar size="32" rounded="lg" variant="tonal" :color="r.type === 'invoice' ? 'info' : 'warning'">
                      <v-icon size="16">{{ r.type === 'invoice' ? 'mdi-file-document' : 'mdi-credit-card' }}</v-icon>
                    </v-avatar>
                  </template>
                  <v-list-item-title class="text-body-2 font-weight-medium">
                    {{ r.number }}
                    <v-chip size="x-small" variant="tonal" :color="r.type === 'invoice' ? 'info' : 'warning'" class="ml-1">{{ r.type === 'invoice' ? 'Invoice' : 'Credit' }}</v-chip>
                    <span class="text-caption text-medium-emphasis ml-1">· {{ r.customer }}</span>
                  </v-list-item-title>
                  <v-list-item-subtitle class="text-caption">Due {{ r.dueText }} <span :class="r.daysLate.includes('late') ? 'text-error font-weight-bold' : ''">· {{ r.daysLate }}</span></v-list-item-subtitle>
                  <template #append>
                    <span class="font-weight-bold text-body-2">{{ formatMoney(r.balance) }}</span>
                  </template>
                </v-list-item>
              </v-list>
              <div v-if="topReceivables.length === 0" class="text-center text-medium-emphasis py-6">No outstanding receivables</div>
            </div>
          </v-card>
          <v-card rounded="xl" elevation="0" class="az-sec-card">
            <div class="az-sec-card__head">
              <div class="az-sec-card__title">
                <v-icon size="18" class="me-2" color="error">mdi-cash-clock</v-icon>
                <span>Pending payables</span>
              </div>
              <v-btn variant="text" size="small" @click="tab = 'payables'">View all</v-btn>
            </div>
            <div class="pa-3">
              <v-list density="compact">
                <v-list-item v-for="p in topPayables" :key="'po' + p.id" class="az-list-item rounded-lg">
                  <template #prepend>
                    <v-avatar size="32" rounded="lg" variant="tonal" color="error"><v-icon size="16">mdi-package-variant-closed</v-icon></v-avatar>
                  </template>
                  <v-list-item-title class="text-body-2 font-weight-medium">{{ p.po_number }}</v-list-item-title>
                  <v-list-item-subtitle class="text-caption">{{ p.supplier_name }} · {{ fmtDate(p.created_at) }}</v-list-item-subtitle>
                  <template #append><span class="font-weight-bold text-body-2">{{ formatMoney(p.grand_total) }}</span></template>
                </v-list-item>
                <v-list-item v-for="e in topExpensePayables" :key="'e' + e.id" class="az-list-item rounded-lg">
                  <template #prepend>
                    <v-avatar size="32" rounded="lg" variant="tonal" color="error"><v-icon size="16">mdi-receipt-text-outline</v-icon></v-avatar>
                  </template>
                  <v-list-item-title class="text-body-2 font-weight-medium">{{ e.expense_number }}</v-list-item-title>
                  <v-list-item-subtitle class="text-caption">{{ e.category }} · {{ e.vendor || (e.description || '').slice(0, 30) }}</v-list-item-subtitle>
                  <template #append><span class="font-weight-bold text-body-2">{{ formatMoney(e.amount) }}</span></template>
                </v-list-item>
              </v-list>
              <div v-if="topPayables.length === 0 && topExpensePayables.length === 0" class="text-center text-medium-emphasis py-6">No pending payables</div>
            </div>
          </v-card>
        </div>
      </v-window-item>

      <!-- ============ RECEIVABLES ============ -->
      <v-window-item value="receivables">
        <!-- Aging buckets -->
        <v-row class="mb-4">
          <v-col cols="6" lg="3">
            <v-card rounded="xl" variant="outlined" class="kpi-card pa-5">
              <div class="d-flex align-start justify-space-between mb-2">
                <span class="text-caption text-medium-emphasis font-weight-medium">Not yet due</span>
                <div class="kpi-icon kpi-icon-blue">
                  <v-icon size="18" icon="mdi-clock-outline" />
                </div>
              </div>
              <p class="text-h4 font-weight-bold mb-1">{{ formatMoney(ar.notDue) }}</p>
              <span class="text-caption text-medium-emphasis">{{ ar.notDueCount }} items</span>
            </v-card>
          </v-col>
          <v-col cols="6" lg="3">
            <v-card rounded="xl" variant="outlined" class="kpi-card pa-5">
              <div class="d-flex align-start justify-space-between mb-2">
                <span class="text-caption text-medium-emphasis font-weight-medium">1–30 days</span>
                <div class="kpi-icon kpi-icon-orange">
                  <v-icon size="18" icon="mdi-alert-circle-outline" />
                </div>
              </div>
              <p class="text-h4 font-weight-bold mb-1">{{ formatMoney(ar.due30) }}</p>
              <span class="text-caption text-medium-emphasis">{{ ar.due30Count }} items</span>
            </v-card>
          </v-col>
          <v-col cols="6" lg="3">
            <v-card rounded="xl" variant="outlined" class="kpi-card pa-5">
              <div class="d-flex align-start justify-space-between mb-2">
                <span class="text-caption text-medium-emphasis font-weight-medium">31–60 days</span>
                <div class="kpi-icon kpi-icon-red">
                  <v-icon size="18" icon="mdi-alert-octagon-outline" />
                </div>
              </div>
              <p class="text-h4 font-weight-bold mb-1 text-error">{{ formatMoney(ar.due60) }}</p>
              <span class="text-caption text-medium-emphasis">{{ ar.due60Count }} items</span>
            </v-card>
          </v-col>
          <v-col cols="6" lg="3">
            <v-card rounded="xl" variant="outlined" class="kpi-card pa-5">
              <div class="d-flex align-start justify-space-between mb-2">
                <span class="text-caption text-medium-emphasis font-weight-medium">60+ days</span>
                <div class="kpi-icon kpi-icon-red">
                  <v-icon size="18" icon="mdi-alert-octagram-outline" />
                </div>
              </div>
              <p class="text-h4 font-weight-bold mb-1 text-error">{{ formatMoney(ar.due60Plus) }}</p>
              <span class="text-caption text-medium-emphasis">{{ ar.due60PlusCount }} items</span>
            </v-card>
          </v-col>
        </v-row>

        <!-- Invoices table -->
        <v-card rounded="xl" elevation="0" class="az-sec-card mb-4">
          <div class="az-sec-card__head">
            <div class="az-sec-card__title">
              <v-icon size="18" class="me-2" color="info">mdi-file-document-multiple</v-icon>
              <span>Outstanding Invoices</span>
            </div>
          </div>
            <v-data-table :items="receivablesInvoices" :headers="arInvoiceHeaders" density="compact" :loading="loading" items-per-page-text="Rows per page" hover>
              <template #item.due_date="{ item }">{{ fmtDate(item.due_date) }}</template>
              <template #item.total="{ item }">{{ formatMoney(item.total) }}</template>
              <template #item.amount_paid="{ item }">{{ formatMoney(item.amount_paid) }}</template>
              <template #item.balance="{ item }"><span class="font-weight-bold text-error">{{ formatMoney(item.balance) }}</span></template>
              <template #item.status="{ item }"><v-chip size="small" :color="invColor(item.status)" variant="tonal">{{ statusDisplay(item.status) }}</v-chip></template>
              <template #no-data>
                <div class="text-center py-8">
                  <v-icon size="40" class="text-medium-emphasis mb-2">mdi-magnify</v-icon>
                  <p class="text-body-2 text-medium-emphasis">No invoices found. Try widening the date range.</p>
                </div>
              </template>
            </v-data-table>
        </v-card>

        <!-- POS credits table -->
        <v-card rounded="xl" elevation="0" class="az-sec-card">
          <div class="az-sec-card__head">
            <div class="az-sec-card__title">
              <v-icon size="18" class="me-2" color="warning">mdi-credit-card-clock</v-icon>
              <span>POS Credit Sales</span>
              <v-chip size="small" variant="tonal" color="warning" class="ml-2">{{ openCredits.length }} outstanding</v-chip>
            </div>
          </div>
            <v-data-table :items="openCredits" :headers="arCreditHeaders" density="compact" :loading="loading" items-per-page-text="Rows per page" hover>
              <template #item.created_at="{ item }">{{ fmtDate(item.created_at) }}</template>
              <template #item.due_date="{ item }">{{ fmtDate(item.due_date) }}</template>
              <template #item.total_amount="{ item }">{{ formatMoney(item.total_amount) }}</template>
              <template #item.amount_paid="{ item }">{{ formatMoney(item.amount_paid) }}</template>
              <template #item.balance="{ item }"><span class="font-weight-bold text-error">{{ formatMoney(item.balance) }}</span></template>
              <template #item.status="{ item }"><v-chip size="small" :color="creditColor(item.status)" variant="tonal">{{ creditStatusDisplay(item.status) }}</v-chip></template>
              <template #no-data>
                <div class="text-center py-8"><p class="text-body-2 text-medium-emphasis">No outstanding credit sales</p></div>
              </template>
            </v-data-table>
        </v-card>
      </v-window-item>

      <!-- ============ PAYABLES ============ -->
      <v-window-item value="payables">
        <v-row class="mb-4">
          <v-col cols="6" lg="3">
            <v-card rounded="xl" variant="outlined" class="kpi-card pa-5">
              <div class="d-flex align-start justify-space-between mb-2">
                <span class="text-caption text-medium-emphasis font-weight-medium">Total Payables</span>
                <div class="kpi-icon kpi-icon-red">
                  <v-icon size="18" icon="mdi-cash-minus" />
                </div>
              </div>
              <p class="text-h4 font-weight-bold mb-1 text-error">{{ formatMoney(ap.total) }}</p>
              <span class="text-caption text-medium-emphasis">{{ ap.count }} items</span>
            </v-card>
          </v-col>
          <v-col cols="6" lg="3">
            <v-card rounded="xl" variant="outlined" class="kpi-card pa-5">
              <div class="d-flex align-start justify-space-between mb-2">
                <span class="text-caption text-medium-emphasis font-weight-medium">Open POs</span>
                <div class="kpi-icon kpi-icon-orange">
                  <v-icon size="18" icon="mdi-package-variant-closed" />
                </div>
              </div>
              <p class="text-h4 font-weight-bold mb-1">{{ openPOs.length }}</p>
              <span class="text-caption text-medium-emphasis">{{ formatMoney(poTotal) }}</span>
            </v-card>
          </v-col>
          <v-col cols="6" lg="3">
            <v-card rounded="xl" variant="outlined" class="kpi-card pa-5">
              <div class="d-flex align-start justify-space-between mb-2">
                <span class="text-caption text-medium-emphasis font-weight-medium">Unpaid Expenses</span>
                <div class="kpi-icon kpi-icon-blue">
                  <v-icon size="18" icon="mdi-receipt-text-outline" />
                </div>
              </div>
              <p class="text-h4 font-weight-bold mb-1">{{ formatMoney(unpaidExpenseTotal) }}</p>
              <span class="text-caption text-medium-emphasis">{{ unpaidExpenses.length }} pending</span>
            </v-card>
          </v-col>
          <v-col cols="6" lg="3">
            <v-card rounded="xl" variant="outlined" class="kpi-card pa-5">
              <div class="d-flex align-start justify-space-between mb-2">
                <span class="text-caption text-medium-emphasis font-weight-medium">Paid Expenses</span>
                <div class="kpi-icon kpi-icon-green">
                  <v-icon size="18" icon="mdi-check-circle" />
                </div>
              </div>
              <p class="text-h4 font-weight-bold mb-1 text-success">{{ formatMoney(paidExpenseTotal) }}</p>
              <span class="text-caption text-medium-emphasis">{{ paidExpenses.length }} settled</span>
            </v-card>
          </v-col>
        </v-row>

        <!-- Open POs table -->
        <v-card rounded="xl" elevation="0" class="az-sec-card mb-4">
          <div class="az-sec-card__head">
            <div class="az-sec-card__title">
              <v-icon size="18" class="me-2" color="warning">mdi-package-variant-closed</v-icon>
              <span>Open Purchase Orders</span>
            </div>
          </div>
            <v-data-table :items="openPOs" :headers="poHeaders" density="compact" :loading="loading" items-per-page-text="Rows per page" hover>
              <template #item.created_at="{ item }">{{ fmtDate(item.created_at) }}</template>
              <template #item.grand_total="{ item }">{{ formatMoney(item.grand_total) }}</template>
              <template #item.status="{ item }"><v-chip size="small" :color="poColor(item.status)" variant="tonal">{{ poStatusDisplay(item.status) }}</v-chip></template>
              <template #no-data>
                <div class="text-center py-8"><p class="text-body-2 text-medium-emphasis">No open purchase orders</p></div>
              </template>
            </v-data-table>
        </v-card>

        <!-- Unpaid expenses -->
        <v-card rounded="xl" elevation="0" class="az-sec-card">
          <div class="az-sec-card__head">
            <div class="az-sec-card__title">
              <v-icon size="18" class="me-2" color="error">mdi-receipt-text-outline</v-icon>
              <span>Unpaid Expenses (Pending &amp; Approved)</span>
            </div>
          </div>
            <v-data-table :items="unpaidExpenses" :headers="expenseHeaders" density="compact" :loading="loading" items-per-page-text="Rows per page" hover>
              <template #item.date="{ item }">{{ fmtDate(item.date) }}</template>
              <template #item.amount="{ item }"><span class="font-weight-bold">{{ formatMoney(item.amount) }}</span></template>
              <template #item.status="{ item }"><v-chip size="small" :color="expStatusColor(item.status)" variant="tonal">{{ item.status }}</v-chip></template>
              <template #no-data>
                <div class="text-center py-8"><p class="text-body-2 text-medium-emphasis">No unpaid expenses</p></div>
              </template>
            </v-data-table>
        </v-card>
      </v-window-item>

      <!-- ============ CASH FLOW ============ -->
      <v-window-item value="cashflow">
        <!-- Cash flow KPI cards -->
        <v-row class="mb-4">
          <v-col cols="6" lg="3">
            <v-card rounded="xl" variant="outlined" class="kpi-card pa-5">
              <div class="d-flex align-start justify-space-between mb-2">
                <span class="text-caption text-medium-emphasis font-weight-medium">Cash In</span>
                <div class="kpi-icon kpi-icon-green">
                  <v-icon size="18" icon="mdi-arrow-down-bold-circle" />
                </div>
              </div>
              <p class="text-h4 font-weight-bold mb-1 text-success">{{ formatMoney(cashFlowKpis.totalIn) }}</p>
              <span class="text-caption text-medium-emphasis">{{ cashFlowKpis.inflowCount }} inflows</span>
            </v-card>
          </v-col>
          <v-col cols="6" lg="3">
            <v-card rounded="xl" variant="outlined" class="kpi-card pa-5">
              <div class="d-flex align-start justify-space-between mb-2">
                <span class="text-caption text-medium-emphasis font-weight-medium">Cash Out</span>
                <div class="kpi-icon kpi-icon-red">
                  <v-icon size="18" icon="mdi-arrow-up-bold-circle" />
                </div>
              </div>
              <p class="text-h4 font-weight-bold mb-1 text-error">{{ formatMoney(cashFlowKpis.totalOut) }}</p>
              <span class="text-caption text-medium-emphasis">{{ cashFlowKpis.outflowCount }} outflows</span>
            </v-card>
          </v-col>
          <v-col cols="6" lg="3">
            <v-card rounded="xl" variant="outlined" class="kpi-card pa-5">
              <div class="d-flex align-start justify-space-between mb-2">
                <span class="text-caption text-medium-emphasis font-weight-medium">Net Cash Flow</span>
                <div class="kpi-icon kpi-icon-teal">
                  <v-icon size="18" icon="mdi-cash-sync" />
                </div>
              </div>
              <p class="text-h4 font-weight-bold mb-1" :class="cashFlowKpis.net >= 0 ? 'text-success' : 'text-error'">{{ formatMoney(cashFlowKpis.net) }}</p>
              <span class="text-caption text-medium-emphasis">{{ cashFlowKpis.net >= 0 ? 'Positive' : 'Negative' }} flow</span>
            </v-card>
          </v-col>
          <v-col cols="6" lg="3">
            <v-card rounded="xl" variant="outlined" class="kpi-card pa-5">
              <div class="d-flex align-start justify-space-between mb-2">
                <span class="text-caption text-medium-emphasis font-weight-medium">Closing Balance</span>
                <div class="kpi-icon kpi-icon-blue">
                  <v-icon size="18" icon="mdi-wallet" />
                </div>
              </div>
              <p class="text-h4 font-weight-bold mb-1">{{ formatMoney(cashFlowKpis.closingBalance) }}</p>
              <span class="text-caption text-medium-emphasis">{{ rangeShortLabel }}</span>
            </v-card>
          </v-col>
        </v-row>

        <!-- Cumulative cash flow chart -->
        <v-card rounded="xl" elevation="0" class="az-sec-card mb-4">
          <div class="az-sec-card__head">
            <div class="az-sec-card__title">
              <v-icon size="18" class="me-2" color="blue darken-2">mdi-chart-areaspline</v-icon>
              <span>Cumulative Cash Flow</span>
            </div>
            <v-chip size="x-small" variant="tonal" color="info">Running balance</v-chip>
          </div>
          <div class="pa-4">
            <div v-if="cashFlowCumulativeSeries.series[0].data.length > 0" class="az-cf-scroll">
              <apexchart type="area" height="280" :width="cumulativeChartWidth" :options="cashFlowCumulativeOptions" :series="cashFlowCumulativeSeries.series" />
            </div>
            <div v-else class="text-center text-medium-emphasis py-14">No cash flow data in range</div>
          </div>
        </v-card>

        <!-- Daily Cash In vs Out + Donut (2-col) -->
        <div class="az-chart-row az-chart-row--2">
          <v-card rounded="xl" elevation="0" class="az-sec-card">
            <div class="az-sec-card__head">
              <div class="az-sec-card__title">
                <v-icon size="18" class="me-2" color="teal darken-2">mdi-chart-bar</v-icon>
                <span>Cash In vs Cash Out</span>
              </div>
              <div class="az-legend">
                <v-chip size="x-small" variant="tonal" color="success"><v-icon start size="12">mdi-arrow-up-bold</v-icon>In</v-chip>
                <v-chip size="x-small" variant="tonal" color="error" class="ms-2"><v-icon start size="12">mdi-arrow-down-bold</v-icon>Out</v-chip>
              </div>
            </div>
            <div class="pa-4">
              <apexchart type="bar" height="260" :options="cashFlowDailyOptions" :series="cashFlowDailySeries" />
            </div>
          </v-card>

          <v-card rounded="xl" elevation="0" class="az-sec-card">
            <div class="az-sec-card__head">
              <div class="az-sec-card__title">
                <v-icon size="18" class="me-2" color="indigo darken-2">mdi-chart-donut</v-icon>
                <span>Cash In by Method</span>
              </div>
            </div>
            <div class="pa-4">
              <div v-if="cashFlowByMethod.length > 0">
                <apexchart type="donut" height="260" :options="cashFlowMethodDonutOptions" :series="cashFlowMethodDonutSeries" />
                <div class="az-donut-badges">
                  <div v-for="(m, i) in cashFlowByMethod" :key="m.method" class="az-donut-badge">
                    <span class="az-donut-badge__dot" :style="{ background: ['#4caf50','#2e7d32','#2196f3','#9c27b0','#ff9800','#3f51b5'][i] || '#9e9e9e' }"></span>
                    <span class="az-donut-badge__label text-capitalize">{{ m.method }}</span>
                    <span class="az-donut-badge__amt">{{ formatMoney(m.total) }}</span>
                    <span class="az-donut-badge__pct">{{ m.pct.toFixed(0) }}%</span>
                  </div>
                </div>
              </div>
              <div v-else class="text-center text-medium-emphasis py-14">No inflows in range</div>
            </div>
          </v-card>
        </div>

        <!-- Cash flow transaction table -->
        <v-card rounded="xl" elevation="0" class="az-sec-card mt-4">
          <div class="az-sec-card__head">
            <div class="az-sec-card__title">
              <v-icon size="18" class="me-2" color="blue darken-2">mdi-format-list-bulleted</v-icon>
              <span>Cash Flow Ledger</span>
              <v-chip size="small" variant="tonal" color="blue" class="ml-2">{{ cashFlowFiltered.length }} entries</v-chip>
            </div>
          </div>
          <!-- Filter bar -->
          <div class="d-flex ga-2 pa-4 pb-0 flex-wrap align-center">
            <v-select v-model="cfMethodFilter" :items="['cash','mpesa','card','insurance','credit','bank_transfer']" density="compact" variant="outlined" hide-details style="max-width: 160px;" label="Method" clearable />
            <v-select v-model="cfTypeFilter" :items="[{ title: 'Inflow', value: 'inflow' }, { title: 'Outflow', value: 'outflow' }]" density="compact" variant="outlined" hide-details style="max-width: 150px;" label="Type" clearable item-title="title" item-value="value" />
          </div>
          <v-data-table :items="cashFlowFiltered" :headers="cashFlowTableHeaders" :items-per-page="25" density="compact" items-per-page-text="Rows per page" hover>
            <template #item.index="{ index }">{{ index + 1 }}</template>
            <template #item.date="{ item }">{{ new Date(item.date).toLocaleString('en-GB', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }) }}</template>
            <template #item.method="{ item }">
              <v-chip size="small" :color="pmColor(item.method)" variant="tonal">
                <v-icon start size="14">{{ pmIcon(item.method) }}</v-icon>
                {{ item.method ? item.method.toUpperCase() : '' }}
              </v-chip>
            </template>
            <template #item.inflow="{ item }">
              <span v-if="item.type === 'inflow'" class="font-weight-bold text-success">+{{ formatMoney(item.amount) }}</span>
              <span v-else class="text-medium-emphasis">—</span>
            </template>
            <template #item.outflow="{ item }">
              <span v-if="item.type === 'outflow'" class="font-weight-bold text-error">-{{ formatMoney(item.amount) }}</span>
              <span v-else class="text-medium-emphasis">—</span>
            </template>
            <template #item.type="{ item }">
              <v-chip size="small" :color="item.type === 'inflow' ? 'success' : 'error'" variant="tonal">
                <v-icon start size="14">{{ item.type === 'inflow' ? 'mdi-arrow-down-bold' : 'mdi-arrow-up-bold' }}</v-icon>
                {{ item.type === 'inflow' ? 'In' : 'Out' }}
              </v-chip>
            </template>
            <template #no-data>
              <div class="text-center py-8"><p class="text-body-2 text-medium-emphasis">No cash flow entries in range</p></div>
            </template>
          </v-data-table>
        </v-card>
      </v-window-item>

      <!-- ============ ROI ============ -->
      <v-window-item value="roi">
        <!-- ROI KPI cards -->
        <v-row class="mb-4">
          <v-col cols="6" lg="3">
            <v-card rounded="xl" variant="outlined" class="kpi-card pa-5">
              <div class="d-flex align-start justify-space-between mb-2">
                <span class="text-caption text-medium-emphasis font-weight-medium">ROI</span>
                <div class="kpi-icon kpi-icon-blue">
                  <v-icon size="18" icon="mdi-chart-timeline-variant" />
                </div>
              </div>
              <p class="text-h4 font-weight-bold mb-1" :class="roiMetrics.roi >= 15 ? 'text-success' : 'text-warning'">{{ roiMetrics.roi.toFixed(2) }}%</p>
              <span class="text-caption text-medium-emphasis">Target: 15%</span>
            </v-card>
          </v-col>
          <v-col cols="6" lg="3">
            <v-card rounded="xl" variant="outlined" class="kpi-card pa-5">
              <div class="d-flex align-start justify-space-between mb-2">
                <span class="text-caption text-medium-emphasis font-weight-medium">Net Profit</span>
                <div class="kpi-icon kpi-icon-green">
                  <v-icon size="18" icon="mdi-cash-plus" />
                </div>
              </div>
              <p class="text-h4 font-weight-bold mb-1" :class="roiMetrics.netProfit >= 0 ? 'text-success' : 'text-error'">{{ formatMoney(roiMetrics.netProfit) }}</p>
              <span class="text-caption text-medium-emphasis">Margin: {{ roiMetrics.profitMargin.toFixed(1) }}%</span>
            </v-card>
          </v-col>
          <v-col cols="6" lg="3">
            <v-card rounded="xl" variant="outlined" class="kpi-card pa-5">
              <div class="d-flex align-start justify-space-between mb-2">
                <span class="text-caption text-medium-emphasis font-weight-medium">Total Investment</span>
                <div class="kpi-icon kpi-icon-orange">
                  <v-icon size="18" icon="mdi-briefcase" />
                </div>
              </div>
              <p class="text-h4 font-weight-bold mb-1">{{ formatMoney(roiMetrics.totalInvestment) }}</p>
              <span class="text-caption text-medium-emphasis">Inv + Exp + POs</span>
            </v-card>
          </v-col>
          <v-col cols="6" lg="3">
            <v-card rounded="xl" variant="outlined" class="kpi-card pa-5">
              <div class="d-flex align-start justify-space-between mb-2">
                <span class="text-caption text-medium-emphasis font-weight-medium">Payback Period</span>
                <div class="kpi-icon kpi-icon-purple">
                  <v-icon size="18" icon="mdi-calendar-clock" />
                </div>
              </div>
              <p class="text-h4 font-weight-bold mb-1">{{ roiMetrics.paybackMonths > 0 ? roiMetrics.paybackMonths.toFixed(1) + ' mo' : '—' }}</p>
              <span class="text-caption text-medium-emphasis">{{ roiMetrics.monthlyNetProfit > 0 ? formatMoney(roiMetrics.monthlyNetProfit) + '/mo' : 'No profit' }}</span>
            </v-card>
          </v-col>
        </v-row>

        <!-- ROI Gauge + Ratio cards (2-col) -->
        <div class="az-chart-row az-chart-row--2 mb-4">
          <v-card rounded="xl" elevation="0" class="az-sec-card">
            <div class="az-sec-card__head">
              <div class="az-sec-card__title">
                <v-icon size="18" class="me-2" color="blue darken-2">mdi-gauge</v-icon>
                <span>ROI Score</span>
              </div>
            </div>
            <div class="pa-4 d-flex justify-center">
              <apexchart type="radialBar" height="300" :options="roiGaugeOptions" :series="roiGaugeSeries" />
            </div>
          </v-card>

          <v-card rounded="xl" elevation="0" class="az-sec-card">
            <div class="az-sec-card__head">
              <div class="az-sec-card__title">
                <v-icon size="18" class="me-2" color="teal darken-2">mdi-chart-box</v-icon>
                <span>Key Ratios</span>
              </div>
            </div>
            <div class="pa-4">
              <div v-for="r in roiRatios" :key="r.label" class="az-method-row">
                <div class="az-method-row__head">
                  <div class="az-method-row__label">
                    <span class="text-body-2 font-weight-medium">{{ r.label }}</span>
                  </div>
                  <span class="az-method-row__value" :class="'text-' + r.color">{{ r.value.toFixed(2) }}{{ r.suffix }}</span>
                </div>
                <v-progress-linear :model-value="Math.min(100, Math.max(0, r.value))" :color="r.color" height="6" rounded class="mt-2" />
                <p class="az-method-row__pct">Target: {{ r.target }}{{ r.suffix }}</p>
              </div>
            </div>
          </v-card>
        </div>

        <!-- Profit vs Investment chart -->
        <v-card rounded="xl" elevation="0" class="az-sec-card mb-4">
          <div class="az-sec-card__head">
            <div class="az-sec-card__title">
              <v-icon size="18" class="me-2" color="teal darken-2">mdi-chart-bar</v-icon>
              <span>Net Profit vs Investment</span>
            </div>
            <div class="az-legend">
              <v-chip size="x-small" variant="tonal" color="success"><v-icon start size="12">mdi-arrow-up-bold</v-icon>Net Profit</v-chip>
              <v-chip size="x-small" variant="tonal" color="warning" class="ms-2"><v-icon start size="12">mdi-briefcase</v-icon>Investment</v-chip>
            </div>
          </div>
          <div class="pa-4">
            <apexchart type="bar" height="280" :options="roiTrendOptions" :series="roiTrendSeries" />
          </div>
        </v-card>

        <!-- Investment breakdown + ROI detailed table (2-col) -->
        <div class="az-chart-row az-chart-row--2">
          <v-card rounded="xl" elevation="0" class="az-sec-card">
            <div class="az-sec-card__head">
              <div class="az-sec-card__title">
                <v-icon size="18" class="me-2" color="orange darken-2">mdi-briefcase-outline</v-icon>
                <span>Investment Breakdown</span>
              </div>
            </div>
            <div class="pa-4">
              <div class="az-method-row">
                <div class="az-method-row__head">
                  <div class="az-method-row__label">
                    <v-avatar size="32" rounded="lg" variant="tonal" color="orange"><v-icon size="16">mdi-package-variant-closed</v-icon></v-avatar>
                    <span class="text-body-2 font-weight-medium">Inventory Value</span>
                  </div>
                  <span class="az-method-row__value">{{ formatMoney(roiInvestment.inventory) }}</span>
                </div>
                <v-progress-linear :model-value="roiInvestment.total > 0 ? (roiInvestment.inventory / roiInvestment.total * 100) : 0" color="orange" height="6" rounded class="mt-2" />
                <p class="az-method-row__pct">{{ roiInvestment.total > 0 ? (roiInvestment.inventory / roiInvestment.total * 100).toFixed(0) : 0 }}% of total</p>
              </div>
              <div class="az-method-row">
                <div class="az-method-row__head">
                  <div class="az-method-row__label">
                    <v-avatar size="32" rounded="lg" variant="tonal" color="error"><v-icon size="16">mdi-receipt-text-outline</v-icon></v-avatar>
                    <span class="text-body-2 font-weight-medium">Operating Expenses</span>
                  </div>
                  <span class="az-method-row__value">{{ formatMoney(roiInvestment.expenses) }}</span>
                </div>
                <v-progress-linear :model-value="roiInvestment.total > 0 ? (roiInvestment.expenses / roiInvestment.total * 100) : 0" color="error" height="6" rounded class="mt-2" />
                <p class="az-method-row__pct">{{ roiInvestment.total > 0 ? (roiInvestment.expenses / roiInvestment.total * 100).toFixed(0) : 0 }}% of total</p>
              </div>
              <div class="az-method-row">
                <div class="az-method-row__head">
                  <div class="az-method-row__label">
                    <v-avatar size="32" rounded="lg" variant="tonal" color="warning"><v-icon size="16">mdi-package-variant-closed</v-icon></v-avatar>
                    <span class="text-body-2 font-weight-medium">Purchase Orders</span>
                  </div>
                  <span class="az-method-row__value">{{ formatMoney(roiInvestment.poInvested) }}</span>
                </div>
                <v-progress-linear :model-value="roiInvestment.total > 0 ? (roiInvestment.poInvested / roiInvestment.total * 100) : 0" color="warning" height="6" rounded class="mt-2" />
                <p class="az-method-row__pct">{{ roiInvestment.total > 0 ? (roiInvestment.poInvested / roiInvestment.total * 100).toFixed(0) : 0 }}% of total</p>
              </div>
              <v-divider class="my-3" />
              <div class="d-flex justify-space-between align-center">
                <span class="text-subtitle-1 font-weight-bold">Total Investment</span>
                <span class="text-h6 font-weight-bold text-primary">{{ formatMoney(roiInvestment.total) }}</span>
              </div>
            </div>
          </v-card>

          <v-card rounded="xl" elevation="0" class="az-sec-card">
            <div class="az-sec-card__head">
              <div class="az-sec-card__title">
                <v-icon size="18" class="me-2" color="blue darken-2">mdi-format-list-bulleted</v-icon>
                <span>ROI Breakdown</span>
              </div>
            </div>
            <div class="pa-4">
              <v-table density="compact">
                <tbody>
                  <tr v-for="row in roiBreakdown" :key="row.metric">
                    <td class="py-2" :class="{ 'font-weight-bold': row.type === 'highlight', 'bg-surface': row.type === 'highlight' }">{{ row.metric }}</td>
                    <td class="text-end py-2 font-weight-medium" :class="row.type === 'negative' ? 'text-error' : row.type === 'positive' ? 'text-success' : row.type === 'highlight' ? (row.value >= 0 ? 'text-success' : 'text-error') : ''">
                      {{ row.type === 'negative' ? '(' + formatMoney(row.value) + ')' : formatMoney(row.value) }}
                    </td>
                  </tr>
                </tbody>
              </v-table>
              <v-divider class="my-2" />
              <v-table density="compact">
                <tbody>
                  <tr class="bg-primary-lighten-5">
                    <td class="py-3 font-weight-bold text-subtitle-2">ROI</td>
                    <td class="text-end py-3 font-weight-bold text-subtitle-2" :class="roiMetrics.roi >= 15 ? 'text-success' : 'text-warning'">{{ roiMetrics.roi.toFixed(2) }}%</td>
                  </tr>
                  <tr class="bg-primary-lighten-5">
                    <td class="py-3 font-weight-bold text-subtitle-2">Annualized ROI</td>
                    <td class="text-end py-3 font-weight-bold text-subtitle-2" :class="roiMetrics.annualizedROI >= 20 ? 'text-success' : 'text-warning'">{{ roiMetrics.annualizedROI.toFixed(2) }}%</td>
                  </tr>
                  <tr class="bg-primary-lighten-5">
                    <td class="py-3 font-weight-bold text-subtitle-2">Payback Period</td>
                    <td class="text-end py-3 font-weight-bold text-subtitle-2">{{ roiMetrics.paybackMonths > 0 ? roiMetrics.paybackMonths.toFixed(1) + ' months' : '—' }}</td>
                  </tr>
                </tbody>
              </v-table>
            </div>
          </v-card>
        </div>

        <!-- Products Sold breakdown -->
        <div class="mb-4">
          <v-row class="mb-2">
            <v-col cols="6" lg="3">
              <v-card rounded="xl" variant="outlined" class="kpi-card pa-5">
                <div class="d-flex align-start justify-space-between mb-2">
                  <span class="text-caption text-medium-emphasis font-weight-medium">Total Revenue</span>
                  <div class="kpi-icon kpi-icon-green">
                    <v-icon size="18" icon="mdi-cash-multiple" />
                  </div>
                </div>
                <p class="text-h4 font-weight-bold mb-1 text-success">{{ formatMoney(productsSold.reduce((s, p) => s + p.revenue, 0)) }}</p>
                <span class="text-caption text-medium-emphasis">From product sales</span>
              </v-card>
            </v-col>
            <v-col cols="6" lg="3">
              <v-card rounded="xl" variant="outlined" class="kpi-card pa-5">
                <div class="d-flex align-start justify-space-between mb-2">
                  <span class="text-caption text-medium-emphasis font-weight-medium">Total Units</span>
                  <div class="kpi-icon kpi-icon-blue">
                    <v-icon size="18" icon="mdi-package-variant-closed" />
                  </div>
                </div>
                <p class="text-h4 font-weight-bold mb-1">{{ productsSold.reduce((s, p) => s + p.qty, 0) }}</p>
                <span class="text-caption text-medium-emphasis">Units sold</span>
              </v-card>
            </v-col>
            <v-col cols="6" lg="3">
              <v-card rounded="xl" variant="outlined" class="kpi-card pa-5">
                <div class="d-flex align-start justify-space-between mb-2">
                  <span class="text-caption text-medium-emphasis font-weight-medium">Unique Products</span>
                  <div class="kpi-icon kpi-icon-teal">
                    <v-icon size="18" icon="mdi-format-list-bulleted" />
                  </div>
                </div>
                <p class="text-h4 font-weight-bold mb-1">{{ productsSold.length }}</p>
                <span class="text-caption text-medium-emphasis">Different items</span>
              </v-card>
            </v-col>
            <v-col cols="6" lg="3">
              <v-card rounded="xl" variant="outlined" class="kpi-card pa-5">
                <div class="d-flex align-start justify-space-between mb-2">
                  <span class="text-caption text-medium-emphasis font-weight-medium">Avg Revenue / Product</span>
                  <div class="kpi-icon kpi-icon-orange">
                    <v-icon size="18" icon="mdi-chart-line-variant" />
                  </div>
                </div>
                <p class="text-h4 font-weight-bold mb-1">{{ formatMoney(productsSold.length > 0 ? productsSold.reduce((s, p) => s + p.revenue, 0) / productsSold.length : 0) }}</p>
                <span class="text-caption text-medium-emphasis">Per product</span>
              </v-card>
            </v-col>
          </v-row>

          <v-card rounded="xl" elevation="0" class="az-sec-card">
            <div class="az-sec-card__head">
              <div class="az-sec-card__title">
                <v-icon size="18" class="me-2" color="teal darken-2">mdi-package-variant-closed</v-icon>
                <span>Products Sold Breakdown</span>
                <v-chip size="small" variant="tonal" color="teal" class="ml-2">{{ productsSold.length }} products</v-chip>
              </div>
            </div>
            <v-data-table :items="productsSold" :headers="productsSoldHeaders" :items-per-page="25" density="compact" items-per-page-text="Rows per page" hover>
              <template #item.index="{ index }">{{ index + 1 }}</template>
              <template #item.name="{ item }"><span class="font-weight-medium">{{ item.name }}</span></template>
              <template #item.unitCost="{ item }"><span class="text-error font-weight-medium">{{ formatMoney(item.unitCost) }}</span></template>
              <template #item.retail="{ item }"><span class="text-success font-weight-medium">{{ formatMoney(item.retail) }}</span></template>
              <template #item.markup="{ item }">
                <v-chip size="small" :color="item.markup > 0 ? 'success' : 'error'" variant="tonal">{{ item.markup.toFixed(1) }}%</v-chip>
              </template>
              <template #item.qty="{ item }">{{ item.qty }}</template>
              <template #item.revenue="{ item }"><span class="font-weight-bold">{{ formatMoney(item.revenue) }}</span></template>
              <template #item.revenuePct="{ item }">
                <div class="d-flex align-center ga-2">
                  <v-progress-linear :model-value="item.revenuePct" color="teal" height="5" rounded style="max-width: 80px;" />
                  <span class="text-caption text-medium-emphasis">{{ item.revenuePct.toFixed(1) }}%</span>
                </div>
              </template>
              <template #no-data>
                <div class="text-center py-8">
                  <v-icon size="40" class="text-medium-emphasis mb-2">mdi-package-variant-closed-remove</v-icon>
                  <p class="text-body-2 text-medium-emphasis">No products sold in range</p>
                </div>
              </template>
            </v-data-table>
          </v-card>
        </div>
      </v-window-item>

      <!-- ============ TRANSACTIONS ============ -->
      <v-window-item value="transactions">
        <div class="d-flex ga-2 mb-4 flex-wrap">
          <v-select v-model="txType" :items="['all','cash','mpesa','card','insurance','credit','bank_transfer']" density="compact" variant="outlined" hide-details style="max-width: 150px;" label="Type" clearable />
          <v-text-field v-model="txSearch" prepend-inner-icon="mdi-magnify" placeholder="Search..." density="compact" variant="outlined" hide-details class="flex-grow-1" />
        </div>
        <v-card rounded="xl" elevation="0" class="az-sec-card">
            <v-data-table :items="txFiltered" :headers="txHeaders" density="compact" :loading="loading" items-per-page-text="Rows per page" hover>
              <template #item.created_at="{ item }">{{ new Date(item.created_at).toLocaleString() }}</template>
              <template #item.payment_method="{ item }"><v-chip size="small" :color="pmColor(item.payment_method)" variant="tonal"><v-icon start size="14">{{ pmIcon(item.payment_method) }}</v-icon>{{ item.payment_method ? item.payment_method.toUpperCase() : '' }}</v-chip></template>
              <template #item.subtotal="{ item }">{{ formatMoney(item.subtotal) }}</template>
              <template #item.tax="{ item }">{{ formatMoney(item.tax) }}</template>
              <template #item.total="{ item }"><span class="font-weight-bold">{{ formatMoney(item.total) }}</span></template>
              <template #item.status="{ item }"><v-chip size="small" :color="item.status === 'completed' ? 'success' : 'grey'" variant="tonal">{{ item.status }}</v-chip></template>
              <template #no-data>
                <div class="text-center py-8"><p class="text-body-2 text-medium-emphasis">No transactions found</p></div>
              </template>
            </v-data-table>
        </v-card>
      </v-window-item>

      <!-- ============ P&L ============ -->
      <v-window-item value="pnl">
        <v-card rounded="xl" elevation="0" class="az-sec-card">
          <div class="az-sec-card__head">
            <div class="az-sec-card__title">
              <v-icon size="18" class="me-2" color="teal darken-2">mdi-chart-line</v-icon>
              <span>Profit &amp; Loss Statement</span>
            </div>
            <v-select v-model="pnlPeriod" :items="['This Month','Last Month','This Quarter','This Year']" density="compact" variant="outlined" hide-details style="max-width: 200px;" />
          </div>
          <div class="pa-4">
            <v-table density="compact">
              <tbody>
                <tr><td class="font-weight-medium py-2">Revenue (Sales)</td><td class="text-right text-success font-weight-bold py-2">{{ formatMoney(pnl.revenue) }}</td></tr>
                <tr><td class="py-2">Less: Sales Discounts</td><td class="text-right py-2">({{ formatMoney(pnl.discounts) }})</td></tr>
                <tr class="bg-surface"><td class="font-weight-medium py-2">Net Revenue</td><td class="text-right font-weight-bold py-2">{{ formatMoney(pnl.netRevenue) }}</td></tr>
                <tr><td class="py-2">Cost of Goods Sold</td><td class="text-right py-2">({{ formatMoney(pnl.cogs) }})</td></tr>
                <tr class="bg-surface"><td class="font-weight-medium py-2">Gross Profit</td><td class="text-right font-weight-bold py-2">{{ formatMoney(pnl.grossProfit) }}</td></tr>
                <tr><td class="py-2">Operating Expenses</td><td class="text-right py-2">({{ formatMoney(pnl.expenses) }})</td></tr>
                <tr class="bg-error-lighten-5"><td class="font-weight-bold text-h6 py-3">Net Profit</td><td class="text-right font-weight-bold text-h6 py-3" :class="profitPositive ? 'text-success' : 'text-error'">{{ formatMoney(pnl.netProfit) }}</td></tr>
              </tbody>
            </v-table>
          </div>
        </v-card>

        <!-- P&L Chart -->
        <v-card rounded="xl" elevation="0" class="az-sec-card mt-4">
          <div class="az-sec-card__head">
            <div class="az-sec-card__title">
              <v-icon size="18" class="me-2" color="teal darken-2">mdi-chart-bar</v-icon>
              <span>Daily Revenue vs Expenses</span>
            </div>
          </div>
          <div class="pa-4">
            <apexchart type="bar" height="300" :options="revExpOptions" :series="revExpSeries" />
          </div>
        </v-card>
      </v-window-item>

      <!-- ============ BALANCE SHEET ============ -->
      <v-window-item value="balance">
        <v-card rounded="xl" elevation="0" class="az-sec-card">
          <div class="az-sec-card__head">
            <div class="az-sec-card__title">
              <v-icon size="18" class="me-2" color="teal darken-2">mdi-scale-balance</v-icon>
              <span>Balance Sheet</span>
            </div>
            <div class="text-caption text-medium-emphasis">{{ rangeShortLabel }}</div>
          </div>
          <div class="pa-4">
            <v-row>
              <v-col cols="12" md="6">
                <p class="text-subtitle-1 font-weight-bold mb-2">Assets</p>
                <v-table density="compact"><tbody>
                  <tr><td class="py-2">Cash on Hand (Shifts)</td><td class="text-right py-2">{{ formatMoney(bs.cash) }}</td></tr>
                  <tr><td class="py-2">Inventory Value</td><td class="text-right py-2">{{ formatMoney(bs.inventory) }}</td></tr>
                  <tr><td class="py-2">Accounts Receivable</td><td class="text-right py-2">{{ formatMoney(bs.receivables) }}</td></tr>
                  <tr class="bg-surface"><td class="font-weight-bold py-2">Total Assets</td><td class="text-right font-weight-bold py-2">{{ formatMoney(bs.totalAssets) }}</td></tr>
                </tbody></v-table>
              </v-col>
              <v-col cols="12" md="6">
                <p class="text-subtitle-1 font-weight-bold mb-2">Liabilities</p>
                <v-table density="compact"><tbody>
                  <tr><td class="py-2">Accounts Payable</td><td class="text-right py-2">{{ formatMoney(bs.payables) }}</td></tr>
                  <tr><td class="py-2">Credit Sales Outstanding</td><td class="text-right py-2">{{ formatMoney(bs.creditOutstanding) }}</td></tr>
                  <tr class="bg-surface"><td class="font-weight-bold py-2">Total Liabilities</td><td class="text-right font-weight-bold py-2">{{ formatMoney(bs.totalLiabilities) }}</td></tr>
                </tbody></v-table>
                <p class="text-subtitle-1 font-weight-bold mt-4 mb-2">Equity</p>
                <v-table density="compact"><tbody>
                  <tr class="bg-success-lighten-5"><td class="font-weight-bold py-2">Retained Earnings (P&amp;L)</td><td class="text-right font-weight-bold py-2" :class="profitPositive ? 'text-success' : 'text-error'">{{ formatMoney(pnl.netProfit) }}</td></tr>
                </tbody></v-table>
              </v-col>
            </v-row>
          </div>
        </v-card>
      </v-window-item>

      <!-- ============ GENERAL LEDGER ============ -->
      <v-window-item value="ledger">
        <!-- Summary KPI cards -->
        <v-row class="mb-4">
          <v-col cols="6" lg="3">
            <v-card rounded="xl" variant="outlined" class="kpi-card pa-5">
              <div class="d-flex align-start justify-space-between mb-2">
                <span class="text-caption text-medium-emphasis font-weight-medium">Total Debits</span>
                <div class="kpi-icon kpi-icon-red">
                  <v-icon size="18" icon="mdi-arrow-top-right" />
                </div>
              </div>
              <p class="text-h4 font-weight-bold mb-1 text-error">{{ formatMoney(ledgerSummary.totalDebits) }}</p>
              <span class="text-caption text-medium-emphasis">{{ ledgerSummary.entryCount }} entries</span>
            </v-card>
          </v-col>
          <v-col cols="6" lg="3">
            <v-card rounded="xl" variant="outlined" class="kpi-card pa-5">
              <div class="d-flex align-start justify-space-between mb-2">
                <span class="text-caption text-medium-emphasis font-weight-medium">Total Credits</span>
                <div class="kpi-icon kpi-icon-green">
                  <v-icon size="18" icon="mdi-arrow-bottom-right" />
                </div>
              </div>
              <p class="text-h4 font-weight-bold mb-1 text-success">{{ formatMoney(ledgerSummary.totalCredits) }}</p>
              <span class="text-caption text-medium-emphasis">{{ ledgerByAccount.length }} accounts</span>
            </v-card>
          </v-col>
          <v-col cols="6" lg="3">
            <v-card rounded="xl" variant="outlined" class="kpi-card pa-5">
              <div class="d-flex align-start justify-space-between mb-2">
                <span class="text-caption text-medium-emphasis font-weight-medium">Trial Balance</span>
                <div class="kpi-icon" :class="ledgerTrialBalance.balanced ? 'kpi-icon-green' : 'kpi-icon-red'">
                  <v-icon size="18" :icon="ledgerTrialBalance.balanced ? 'mdi-check-circle' : 'mdi-alert-circle'" />
                </div>
              </div>
              <p class="text-h4 font-weight-bold mb-1" :class="ledgerTrialBalance.balanced ? 'text-success' : 'text-error'">
                {{ ledgerTrialBalance.balanced ? 'Balanced' : 'Unbalanced' }}
              </p>
              <span class="text-caption text-medium-emphasis">Δ {{ formatMoney(Math.abs(ledgerTrialBalance.grandDebit - ledgerTrialBalance.grandCredit)) }}</span>
            </v-card>
          </v-col>
          <v-col cols="6" lg="3">
            <v-card rounded="xl" variant="outlined" class="kpi-card pa-5">
              <div class="d-flex align-start justify-space-between mb-2">
                <span class="text-caption text-medium-emphasis font-weight-medium">Entries in Range</span>
                <div class="kpi-icon kpi-icon-teal">
                  <v-icon size="18" icon="mdi-book-open-variant" />
                </div>
              </div>
              <p class="text-h4 font-weight-bold mb-1">{{ ledgerSummary.entryCount }}</p>
              <span class="text-caption text-medium-emphasis">{{ rangeShortLabel }}</span>
            </v-card>
          </v-col>
        </v-row>

        <!-- Trial Balance -->
        <v-card rounded="xl" elevation="0" class="az-sec-card mb-4">
          <div class="az-sec-card__head">
            <div class="az-sec-card__title">
              <v-icon size="18" class="me-2" color="teal darken-2">mdi-scale-balance</v-icon>
              <span>Trial Balance</span>
            </div>
            <v-chip size="small" :color="ledgerTrialBalance.balanced ? 'success' : 'error'" variant="tonal">
              <v-icon start size="14">{{ ledgerTrialBalance.balanced ? 'mdi-check' : 'mdi-alert' }}</v-icon>
              {{ ledgerTrialBalance.balanced ? 'Balanced' : 'Out of balance' }}
            </v-chip>
          </div>
          <div class="pa-4">
            <div v-for="g in ledgerTrialBalance.groups" :key="g.type" class="az-tb-group">
              <div class="az-tb-group__head">
                <v-icon size="16" class="me-2" :color="accountTypeColor(g.type)">{{ accountTypeIcon(g.type) }}</v-icon>
                <span class="font-weight-medium text-uppercase text-caption">{{ g.type || 'other' }}s</span>
                <span class="text-caption text-medium-emphasis ms-2">({{ g.accounts.length }} accounts)</span>
              </div>
              <v-table density="compact" class="mb-3">
                <tbody>
                  <tr v-for="a in g.accounts" :key="a.account" class="az-tb-row" @click="drillDownAccount(a.account)">
                    <td class="py-2" style="cursor: pointer;">
                      <v-icon size="14" class="me-1 text-medium-emphasis">mdi-magnify</v-icon>
                      <span class="font-weight-medium">{{ a.account }}</span>
                    </td>
                    <td class="text-end py-2 text-error font-weight-medium">{{ a.debit ? formatMoney(a.debit) : '—' }}</td>
                    <td class="text-end py-2 text-success font-weight-medium">{{ a.credit ? formatMoney(a.credit) : '—' }}</td>
                    <td class="text-end py-2 font-weight-bold" :class="a.balance >= 0 ? 'text-success' : 'text-error'">{{ formatMoney(a.balance) }}</td>
                  </tr>
                  <tr class="bg-surface">
                    <td class="py-2 font-weight-bold">Subtotal — {{ g.type || 'other' }}s</td>
                    <td class="text-end py-2 font-weight-bold text-error">{{ formatMoney(g.totalDebit) }}</td>
                    <td class="text-end py-2 font-weight-bold text-success">{{ formatMoney(g.totalCredit) }}</td>
                    <td class="text-end py-2 font-weight-bold" :class="g.balance >= 0 ? 'text-success' : 'text-error'">{{ formatMoney(g.balance) }}</td>
                  </tr>
                </tbody>
              </v-table>
            </div>
            <div v-if="ledgerTrialBalance.groups.length === 0" class="text-center text-medium-emphasis py-6">No accounts in range</div>
            <!-- Grand total -->
            <v-divider class="mb-2" />
            <v-table density="compact">
              <tbody>
                <tr class="bg-primary-lighten-5">
                  <td class="py-3 font-weight-bold text-subtitle-2">Grand Total</td>
                  <td class="text-end py-3 font-weight-bold text-subtitle-2 text-error">{{ formatMoney(ledgerTrialBalance.grandDebit) }}</td>
                  <td class="text-end py-3 font-weight-bold text-subtitle-2 text-success">{{ formatMoney(ledgerTrialBalance.grandCredit) }}</td>
                  <td class="text-end py-3 font-weight-bold text-subtitle-2" :class="ledgerTrialBalance.balanced ? 'text-success' : 'text-error'">
                    {{ formatMoney(ledgerTrialBalance.grandDebit - ledgerTrialBalance.grandCredit) }}
                  </td>
                </tr>
              </tbody>
            </v-table>
          </div>
        </v-card>

        <!-- Ledger trend chart -->
        <v-card rounded="xl" elevation="0" class="az-sec-card mb-4">
          <div class="az-sec-card__head">
            <div class="az-sec-card__title">
              <v-icon size="18" class="me-2" color="teal darken-2">mdi-chart-bar</v-icon>
              <span>Daily Debit / Credit Volume</span>
            </div>
            <div class="az-legend">
              <v-chip size="x-small" variant="tonal" color="error"><v-icon start size="12">mdi-arrow-up-bold</v-icon>Debits</v-chip>
              <v-chip size="x-small" variant="tonal" color="success" class="ms-2"><v-icon start size="12">mdi-arrow-down-bold</v-icon>Credits</v-chip>
            </div>
          </div>
          <div class="pa-4">
            <apexchart type="bar" height="200" :options="ledgerTrendOptions" :series="ledgerTrendSeries" />
          </div>
        </v-card>

        <!-- Account balances summary -->
        <v-card rounded="xl" elevation="0" class="az-sec-card mb-4">
          <div class="az-sec-card__head">
            <div class="az-sec-card__title">
              <v-icon size="18" class="me-2" color="teal darken-2">mdi-chart-box</v-icon>
              <span>Account Balances</span>
            </div>
            <div class="text-caption text-medium-emphasis">{{ ledgerByAccount.length }} accounts</div>
          </div>
          <v-data-table :items="ledgerByAccount" :headers="ledgerAccountSummaryHeaders" density="compact" items-per-page-text="Rows per page" hover>
            <template #item.account="{ item }">
              <span class="font-weight-medium" style="cursor: pointer; text-decoration: underline; text-decoration-color: transparent; text-decoration-thickness: 1px;" @click="drillDownAccount(item.account)">{{ item.account }}</span>
            </template>
            <template #item.account_type="{ item }">
              <v-chip size="small" :color="accountTypeColor(item.account_type)" variant="tonal" label>
                <v-icon start size="12">{{ accountTypeIcon(item.account_type) }}</v-icon>{{ (item.account_type || '—').toUpperCase() }}
              </v-chip>
            </template>
            <template #item.debit="{ item }"><span class="text-error font-weight-medium">{{ item.debit ? formatMoney(item.debit) : '—' }}</span></template>
            <template #item.credit="{ item }"><span class="text-success font-weight-medium">{{ item.credit ? formatMoney(item.credit) : '—' }}</span></template>
            <template #item.balance="{ item }">
              <span class="font-weight-bold" :class="item.balance >= 0 ? 'text-success' : 'text-error'">{{ formatMoney(item.balance) }}</span>
            </template>
            <template #no-data>
              <div class="text-center py-8"><p class="text-body-2 text-medium-emphasis">No account data in range</p></div>
            </template>
          </v-data-table>
        </v-card>

        <!-- Filter bar -->
        <div class="d-flex ga-2 mb-4 flex-wrap align-center">
          <v-select v-model="ledgerAccountType" :items="ledgerAccountTypeOptions" density="compact" variant="outlined" hide-details style="max-width: 150px;" label="Type" clearable />
          <v-select v-model="ledgerAccount" :items="ledgerAccounts" density="compact" variant="outlined" hide-details style="max-width: 220px;" label="Account" clearable />
          <v-select v-model="ledgerSourceFilter" :items="ledgerSourceOptions" density="compact" variant="outlined" hide-details style="max-width: 160px;" label="Source" clearable />
          <v-text-field v-model="ledgerSearch" prepend-inner-icon="mdi-magnify" placeholder="Search descriptions, references..." density="compact" variant="outlined" hide-details class="flex-grow-1" clearable />
          <v-btn variant="tonal" prepend-icon="mdi-download" size="small" @click="exportLedgerCSV">Export CSV</v-btn>
        </div>

        <!-- Active filter chips -->
        <div v-if="ledgerAccount || ledgerAccountType || ledgerSourceFilter || ledgerSearch" class="d-flex ga-2 mb-4 flex-wrap">
          <v-chip v-if="ledgerAccount" size="small" closable @click:close="ledgerAccount = null" color="teal" variant="tonal">
            <v-icon start size="14">mdi-filter</v-icon>Account: {{ ledgerAccount }}
          </v-chip>
          <v-chip v-if="ledgerAccountType" size="small" closable @click:close="ledgerAccountType = null" :color="accountTypeColor(ledgerAccountType)" variant="tonal">
            <v-icon start size="14">{{ accountTypeIcon(ledgerAccountType) }}</v-icon>Type: {{ ledgerAccountType }}
          </v-chip>
          <v-chip v-if="ledgerSourceFilter" size="small" closable @click:close="ledgerSourceFilter = null" :color="ledgerSourceColor(ledgerSourceFilter)" variant="tonal">
            <v-icon start size="14">mdi-source-branch</v-icon>Source: {{ ledgerSourceFullLabel(ledgerSourceFilter) }}
          </v-chip>
          <v-chip v-if="ledgerSearch" size="small" closable @click:close="ledgerSearch = ''" color="info" variant="tonal">
            <v-icon start size="14">mdi-magnify</v-icon>Search: "{{ ledgerSearch }}"
          </v-chip>
          <v-btn size="small" variant="text" prepend-icon="mdi-filter-remove" @click="ledgerAccount = null; ledgerAccountType = null; ledgerSourceFilter = null; ledgerSearch = ''">Clear all</v-btn>
        </div>

        <!-- Ledger entries table -->
        <v-card rounded="xl" elevation="0" class="az-sec-card">
          <div class="az-sec-card__head">
            <div class="az-sec-card__title">
              <v-icon size="18" class="me-2" color="teal darken-2">mdi-book-open</v-icon>
              <span>Ledger Entries</span>
            </div>
            <div class="d-flex align-center ga-2">
              <div class="text-caption text-medium-emphasis">{{ ledgerSummary.entryCount }} entries · {{ rangeShortLabel }}</div>
              <v-btn variant="text" size="small" prepend-icon="mdi-download" @click="exportLedgerCSV" density="compact">CSV</v-btn>
            </div>
          </div>
          <v-data-table :items="ledgerFiltered" :headers="ledgerHeaders" density="compact" :loading="loading" items-per-page-text="Rows per page" hover :items-per-page="25" :sort-by="ledgerSortBy">
            <template #item.date="{ item }">
              <span class="text-no-wrap">{{ fmtDate(item.date) }}</span>
            </template>
            <template #item.entry_number="{ item }">
              <v-chip size="small" variant="tonal" color="teal" label>{{ item.entry_number || 'JE' }}</v-chip>
            </template>
            <template #item.description="{ item }">
              <div>
                <span class="text-body-2">{{ item.description }}</span>
                <div v-if="item.reference" class="text-caption text-medium-emphasis">Ref: {{ item.reference }}</div>
              </div>
            </template>
            <template #item.account="{ item }">
              <span class="font-weight-medium" style="cursor: pointer; text-decoration: underline dotted; text-decoration-color: rgba(0,0,0,0.15);" @click="drillDownAccount(item.account)">{{ item.account }}</span>
            </template>
            <template #item.source="{ item }">
              <v-chip size="x-small" :color="ledgerSourceColor(item.source)" variant="tonal" label>
                <v-icon start size="10">{{ ledgerSourceLabel(item.source) === 'JE' ? 'mdi-book' : ledgerSourceLabel(item.source) === 'POS' ? 'mdi-store' : ledgerSourceLabel(item.source) === 'INV' ? 'mdi-file-document' : ledgerSourceLabel(item.source) === 'EXP' ? 'mdi-receipt' : ledgerSourceLabel(item.source) === 'PO' ? 'mdi-package-variant' : 'mdi-source-branch' }}</v-icon>
                {{ ledgerSourceLabel(item.source) }}
              </v-chip>
            </template>
            <template #item.debit="{ item }"><span class="text-error font-weight-bold">{{ item.debit ? formatMoney(item.debit) : '—' }}</span></template>
            <template #item.credit="{ item }"><span class="text-success font-weight-bold">{{ item.credit ? formatMoney(item.credit) : '—' }}</span></template>
            <template #item.balance="{ item }">
              <span class="font-weight-bold" :class="item.balance >= 0 ? 'text-success' : 'text-error'">{{ formatMoney(item.balance) }}</span>
            </template>
            <template #no-data>
              <div class="text-center py-8"><p class="text-body-2 text-medium-emphasis">No ledger entries match your filters</p></div>
            </template>
          </v-data-table>
        </v-card>
      </v-window-item>
    </v-window>

    <!-- ===== Custom range dialog ===== -->
    <v-dialog v-model="customRangeDialog" max-width="420px">
      <v-card rounded="lg">
        <v-card-title class="text-subtitle-1">Custom Date Range</v-card-title>
        <v-card-text>
          <v-text-field v-model="customRange.from" type="date" label="From" variant="outlined" density="compact" class="mb-3" />
          <v-text-field v-model="customRange.to" type="date" label="To" variant="outlined" density="compact" />
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" @click="customRangeDialog = false">Cancel</v-btn>
          <v-btn color="primary" variant="flat" @click="applyCustomRange">Apply</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup>
definePageMeta({ middleware: 'auth' })
const { currency } = useFormat()

/* ===== Helpers ===== */
function formatMoney(v) { return currency(Number(v) || 0) }
function fmtDate(d) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
}
function pmColor(m) {
  const map = { cash: 'green', mpesa: 'success', card: 'blue', insurance: 'purple', credit: 'orange', bank_transfer: 'indigo' }
  return map[m] || 'grey'
}
function pmIcon(m) {
  const map = { cash: 'mdi-cash', mpesa: 'mdi-cellphone', card: 'mdi-credit-card', insurance: 'mdi-shield-account', credit: 'mdi-credit-card-clock', bank_transfer: 'mdi-bank' }
  return map[m] || 'mdi-cash'
}
function invColor(s) {
  const map = { draft: 'grey', sent: 'info', partially_paid: 'warning', paid: 'success', overdue: 'error', cancelled: 'grey' }
  return map[s] || 'grey'
}
function poColor(s) {
  const map = { draft: 'grey', pending: 'info', approved: 'warning', received: 'success', cancelled: 'error' }
  return map[s] || 'grey'
}
function creditColor(s) {
  const map = { open: 'error', partial: 'warning', settled: 'success' }
  return map[s] || 'grey'
}
function expStatusColor(s) {
  const map = { 'Unpaid': 'warning', 'Pending Approval': 'warning', 'Approved': 'info', 'Paid': 'success', 'Cancelled': 'grey' }
  return map[s] || 'grey'
}
function statusDisplay(s) {
  if (!s) return ''
  return s.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
}
function poStatusDisplay(s) {
  if (!s) return ''
  return s.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
}
function creditStatusDisplay(s) {
  const map = { open: 'open', partial: 'partial', settled: 'settled' }
  return map[s] || s || ''
}

/* ===== State ===== */
const tab = ref('overview')
const tabItems = [
  { value: 'overview', label: 'Overview', icon: 'mdi-view-dashboard' },
  { value: 'receivables', label: 'Receivables', icon: 'mdi-cash-plus' },
  { value: 'payables', label: 'Payables', icon: 'mdi-cash-minus' },
  { value: 'cashflow', label: 'Cash Flow', icon: 'mdi-cash-sync' },
  { value: 'roi', label: 'ROI', icon: 'mdi-chart-timeline-variant' },
  { value: 'transactions', label: 'Transactions', icon: 'mdi-swap-horizontal' },
  { value: 'pnl', label: 'Profit & Loss', icon: 'mdi-chart-line' },
  { value: 'balance', label: 'Balance Sheet', icon: 'mdi-scale-balance' },
  { value: 'ledger', label: 'General Ledger', icon: 'mdi-book-open' },
]
const loading = ref(false)
const transactions = ref([])
const invoices = ref([])
const credits = ref([])
const expenses = ref([])
const purchaseOrders = ref([])
const inventoryValue = ref(0)
const shiftCash = ref(0)
const journalEntries = ref([])
const chartOfAccounts = ref([])
const productCostMap = ref(new Map())

/* ===== Period filter ===== */
const period = ref('all')
const customRange = ref({ from: '', to: '' })
const customRangeDialog = ref(false)
const tabScrollRef = ref(null)
const periodScrollRef = ref(null)

function scrollTabs(dir) {
  const el = tabScrollRef.value
  if (!el) return
  el.scrollBy({ left: dir * 200, behavior: 'smooth' })
}

const periodOptions = [
  { value: 'all', short: 'All' },
  { value: 'today', short: 'Today' },
  { value: 'yesterday', short: 'Yesterday' },
  { value: '7d', short: 'Last 7 days' },
  { value: '30d', short: 'Last 30 days' },
  { value: 'mtd', short: 'Month to date' },
  { value: '90d', short: 'Last 90 days' },
  { value: 'ytd', short: 'Year to date' },
]

function resolveRange(key) {
  if (key === 'all') return { from: null, to: null }
  const now = new Date()
  let from = new Date(now), to = new Date(now)
  if (key === 'today') { from.setHours(0,0,0,0) }
  else if (key === 'yesterday') { from = new Date(now); from.setDate(from.getDate() - 1); from.setHours(0,0,0,0); to = new Date(from); to.setHours(23,59,59,999) }
  else if (key === '7d') { from = new Date(now); from.setDate(from.getDate() - 6); from.setHours(0,0,0,0) }
  else if (key === '30d') { from = new Date(now); from.setDate(from.getDate() - 29); from.setHours(0,0,0,0) }
  else if (key === '90d') { from = new Date(now); from.setDate(from.getDate() - 89); from.setHours(0,0,0,0) }
  else if (key === 'mtd') { from = new Date(now.getFullYear(), now.getMonth(), 1) }
  else if (key === 'ytd') { from = new Date(now.getFullYear(), 0, 1) }
  else if (key === 'custom') { from = new Date(customRange.value.from + 'T00:00:00'); to = new Date(customRange.value.to + 'T23:59:59') }
  return { from, to }
}

function inRange(dateStr, range) {
  if (!dateStr) return true
  if (!range.from && !range.to) return true
  const d = new Date(typeof dateStr === 'string' && dateStr.length <= 10 ? dateStr + 'T12:00:00' : dateStr)
  if (range.from && d < range.from) return false
  if (range.to && d > range.to) return false
  return true
}

const currentRange = computed(() => resolveRange(period.value))
function safeRange() {
  const r = currentRange.value
  if (r.from && r.to) return r
  const now = new Date()
  const from = new Date(now)
  from.setDate(from.getDate() - 29)
  from.setHours(0, 0, 0, 0)
  return { from, to: now }
}
const rangeLabel = computed(() => {
  const r = currentRange.value
  if (!r.from && !r.to) return 'All time'
  const same = r.from.toDateString() === r.to.toDateString()
  if (same) return r.from.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
  return `${r.from.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })} – ${r.to.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}`
})
const rangeShortLabel = computed(() => {
  const opt = periodOptions.find(o => o.value === period.value)
  return opt ? opt.short : (period.value === 'custom' ? 'Custom range' : 'Last 30 days')
})
function selectPeriod(v) { period.value = v }
function applyCustomRange() { period.value = 'custom'; customRangeDialog.value = false }
function exportAll() { exportLedgerCSV() }

/* ===== Filters ===== */
const txType = ref('all')
const txSearch = ref('')
const pnlPeriod = ref('This Month')
const ledgerAccount = ref(null)
const ledgerType = ref('all')
const ledgerSearch = ref('')
const cfMethodFilter = ref(null)
const cfTypeFilter = ref(null)
const ledgerAccountType = ref(null)
const ledgerSortBy = ref([{ key: 'date', order: 'desc' }])
const ledgerExportDialog = ref(false)

const ledgerSourceOptions = [
  { title: 'All Sources', value: null },
  { title: 'Journal Entries', value: 'journal' },
  { title: 'POS Sales', value: 'pos' },
  { title: 'Invoices', value: 'invoice' },
  { title: 'Expenses', value: 'expense' },
  { title: 'Purchase Orders', value: 'po' },
]
const ledgerSourceFilter = ref(null)

const ledgerAccountTypeOptions = [
  { title: 'All Types', value: null },
  { title: 'Asset', value: 'asset' },
  { title: 'Liability', value: 'liability' },
  { title: 'Equity', value: 'equity' },
  { title: 'Revenue', value: 'revenue' },
  { title: 'Expense', value: 'expense' },
]

const ledgerAccounts = computed(() => {
  if (!chartOfAccounts.value.length) {
    return ['Cash', 'Sales Revenue', 'Accounts Receivable', 'Accounts Payable', 'Operating Expenses', 'Cost of Goods Sold']
  }
  return chartOfAccounts.value.map(a => `${a.code} — ${a.name}`)
})

/* ===== Table headers ===== */
const arInvoiceHeaders = [
  { title: 'Invoice #', key: 'invoice_number' },
  { title: 'Customer', key: 'customer_name' },
  { title: 'Due Date', key: 'due_date' },
  { title: 'Total', key: 'total', align: 'end' },
  { title: 'Paid', key: 'amount_paid', align: 'end' },
  { title: 'Balance', key: 'balance', align: 'end' },
  { title: 'Status', key: 'status' },
]
const arCreditHeaders = [
  { title: 'Receipt #', key: 'transaction_number' },
  { title: 'Date', key: 'created_at' },
  { title: 'Customer', key: 'customer_name' },
  { title: 'Due', key: 'due_date' },
  { title: 'Total', key: 'total_amount', align: 'end' },
  { title: 'Paid', key: 'amount_paid', align: 'end' },
  { title: 'Balance', key: 'balance', align: 'end' },
  { title: 'Status', key: 'status' },
]
const poHeaders = [
  { title: 'PO #', key: 'po_number' },
  { title: 'Supplier', key: 'supplier_name' },
  { title: 'Date', key: 'created_at' },
  { title: 'Total', key: 'grand_total', align: 'end' },
  { title: 'Status', key: 'status' },
]
const expenseHeaders = [
  { title: 'Expense #', key: 'expense_number' },
  { title: 'Date', key: 'date' },
  { title: 'Category', key: 'category' },
  { title: 'Vendor', key: 'vendor' },
  { title: 'Amount', key: 'amount', align: 'end' },
  { title: 'Status', key: 'status' },
]
const txHeaders = [
  { title: 'Date', key: 'created_at' },
  { title: 'Receipt #', key: 'transaction_number' },
  { title: 'Customer', key: 'customer_name' },
  { title: 'Payment', key: 'payment_method' },
  { title: 'Subtotal', key: 'subtotal', align: 'end' },
  { title: 'Tax', key: 'tax', align: 'end' },
  { title: 'Total', key: 'total', align: 'end' },
  { title: 'Status', key: 'status' },
]
const ledgerHeaders = [
  { title: 'Date', key: 'date', width: '110px', sortable: true },
  { title: 'Entry #', key: 'entry_number', width: '140px', sortable: true },
  { title: 'Description', key: 'description', minWidth: '220px', sortable: true },
  { title: 'Account', key: 'account', sortable: true },
  { title: 'Source', key: 'source', width: '90px', sortable: true },
  { title: 'Debit', key: 'debit', align: 'end', width: '120px', sortable: true },
  { title: 'Credit', key: 'credit', align: 'end', width: '120px', sortable: true },
  { title: 'Balance', key: 'balance', align: 'end', width: '130px', sortable: false },
]
const ledgerAccountSummaryHeaders = [
  { title: 'Account', key: 'account' },
  { title: 'Type', key: 'account_type', width: '120px' },
  { title: 'Entries', key: 'count', align: 'end', width: '100px' },
  { title: 'Debits', key: 'debit', align: 'end' },
  { title: 'Credits', key: 'credit', align: 'end' },
  { title: 'Balance', key: 'balance', align: 'end' },
]

function accountTypeColor(type) {
  const map = {
    asset: 'info',
    liability: 'warning',
    equity: 'purple',
    revenue: 'success',
    expense: 'error',
  }
  return map[type] || 'grey'
}

function accountTypeIcon(type) {
  const map = {
    asset: 'mdi-bank',
    liability: 'mdi-credit-card-outline',
    equity: 'mdi-chart-pie',
    revenue: 'mdi-trending-up',
    expense: 'mdi-trending-down',
  }
  return map[type] || 'mdi-circle-outline'
}

function ledgerSourceColor(source) {
  const map = {
    journal: 'purple',
    pos: 'teal',
    invoice: 'info',
    expense: 'error',
    po: 'warning',
  }
  return map[source] || 'grey'
}

function ledgerSourceLabel(source) {
  const map = {
    journal: 'JE',
    pos: 'POS',
    invoice: 'INV',
    expense: 'EXP',
    po: 'PO',
  }
  return map[source] || source || '——'
}

function ledgerSourceFullLabel(source) {
  const map = {
    journal: 'Journal Entry',
    pos: 'POS Sale',
    invoice: 'Invoice',
    expense: 'Expense',
    po: 'Purchase Order',
  }
  return map[source] || source || '——'
}

function exportLedgerCSV() {
  const entries = ledgerFiltered.value
  const headers = ['Date', 'Entry #', 'Description', 'Account', 'Source', 'Debit', 'Credit', 'Balance']
  const rows = entries.map(e => [
    fmtDate(e.date),
    e.entry_number || '',
    (e.description || '').replace(/,/g, ';'),
    e.account || '',
    ledgerSourceFullLabel(e.source),
    e.debit ? e.debit.toFixed(2) : '',
    e.credit ? e.credit.toFixed(2) : '',
    e.balance ? e.balance.toFixed(2) : '',
  ])
  const csv = [headers.join(','), ...rows.map(r => r.map(c => `"${c}"`).join(','))].join('\n')
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `general-ledger-${new Date().toISOString().split('T')[0]}.csv`
  link.click()
  URL.revokeObjectURL(url)
}

function drillDownAccount(accountName) {
  ledgerAccount.value = accountName
}

/* ===== Computeds ===== */
const txInRange = computed(() => transactions.value.filter(t => inRange(t.created_at, currentRange.value)))
const expInRange = computed(() => expenses.value.filter(e => inRange(e.date || e.created_at, currentRange.value)))

const txFiltered = computed(() => {
  let list = txInRange.value
  if (txType.value && txType.value !== 'all') list = list.filter(t => t.payment_method === txType.value)
  if (txSearch.value) {
    const s = txSearch.value.toLowerCase()
    list = list.filter(t => (t.transaction_number || '').toLowerCase().includes(s) || (t.customer_name || '').toLowerCase().includes(s))
  }
  return list
})

const receivablesInvoices = computed(() => invoices.value.filter(i => Number(i.balance) > 0))
const openCredits = computed(() => credits.value.filter(c => c.status !== 'settled' && Number(c.balance) > 0))
const openPOs = computed(() => purchaseOrders.value.filter(p => p.status !== 'cancelled' && p.status !== 'received'))
const poTotal = computed(() => openPOs.value.reduce((s, p) => s + Number(p.grand_total || 0), 0))

const unpaidExpenses = computed(() => expenses.value.filter(e => e.status === 'Unpaid' || e.status === 'Pending Approval' || e.status === 'Approved'))
const paidExpenses = computed(() => expenses.value.filter(e => e.status === 'Paid'))
const unpaidExpenseTotal = computed(() => unpaidExpenses.value.reduce((s, e) => s + Number(e.amount || 0), 0))
const paidExpenseTotal = computed(() => paidExpenses.value.reduce((s, e) => s + Number(e.amount || 0), 0))

const kpis = computed(() => {
  const incomeTx = txInRange.value.filter(t => t.status === 'completed')
  const income = incomeTx.reduce((s, t) => s + Number(t.total || 0), 0)
  const incomeVat = incomeTx.reduce((s, t) => s + Number(t.tax || 0), 0)
  const expTotal = expInRange.value.reduce((s, e) => s + Number(e.amount || 0), 0)
  const netCashFlow = income - expTotal
  const receivablesTotal = receivablesInvoices.value.reduce((s, i) => s + Number(i.balance), 0)
  const creditOutstanding = openCredits.value.reduce((s, c) => s + Number(c.balance || 0), 0)
  const payableTotal = openPOs.value.reduce((s, p) => s + Number(p.grand_total || 0), 0) + unpaidExpenseTotal.value
  const outstanding = receivablesTotal + creditOutstanding
  return {
    income, incomeVat, expenses: expTotal, expenseCount: expInRange.value.length,
    netCashFlow, outstanding, payables: payableTotal, creditCount: openCredits.value.length,
  }
})

const ar = computed(() => {
  const all = [...receivablesInvoices.value, ...openCredits.value]
  const now = new Date()
  let notDue = 0, due30 = 0, due60 = 0, due60Plus = 0
  let notDueCount = 0, due30Count = 0, due60Count = 0, due60PlusCount = 0
  all.forEach(i => {
    const bal = Number(i.balance || 0)
    if (bal <= 0) return
    const due = i.due_date ? new Date(i.due_date) : null
    if (!due) { notDue += bal; notDueCount++; return }
    const diff = (now - due) / 86400000
    if (diff < 0) { notDue += bal; notDueCount++ }
    else if (diff <= 30) { due30 += bal; due30Count++ }
    else if (diff <= 60) { due60 += bal; due60Count++ }
    else { due60Plus += bal; due60PlusCount++ }
  })
  return { notDue, due30, due60, due60Plus, notDueCount, due30Count, due60Count, due60PlusCount }
})

const ap = computed(() => {
  const total = openPOs.value.reduce((s, p) => s + Number(p.grand_total || 0), 0) + unpaidExpenseTotal.value
  const count = openPOs.value.length + unpaidExpenses.value.length
  return { total, count }
})

const topReceivables = computed(() => {
  const items = [
    ...receivablesInvoices.value.map(i => ({
      id: 'inv-' + i.id, type: 'invoice', number: i.invoice_number,
      customer: i.customer_name || '—', due: i.due_date, balance: Number(i.balance || 0),
    })),
    ...openCredits.value.map(c => ({
      id: 'cr-' + c.id, type: 'credit', number: c.transaction_number || (c.transaction && c.transaction.transaction_number) || ('CR-' + c.id),
      customer: c.customer_name || '—', due: c.due_date, balance: Number(c.balance || 0),
    })),
  ]
  const now = new Date()
  return items.sort((a, b) => b.balance - a.balance).slice(0, 5).map(r => {
    let daysLate = ''
    if (r.due) {
      const diff = Math.floor((now - new Date(r.due)) / 86400000)
      if (diff > 0) daysLate = diff + 'd late'
      else daysLate = Math.abs(diff) + 'd remaining'
    }
    return { ...r, dueText: r.due ? fmtDate(r.due) : '—', daysLate }
  })
})

const topPayables = computed(() => {
  return [...openPOs.value].sort((a, b) => Number(b.grand_total || 0) - Number(a.grand_total || 0)).slice(0, 5)
})

const topExpensePayables = computed(() => {
  return [...unpaidExpenses.value].sort((a, b) => Number(b.amount || 0) - Number(a.amount || 0)).slice(0, 3)
})

const pnl = computed(() => {
  const completedTx = transactions.value.filter(t => t.status === 'completed')
  const revenue = completedTx.reduce((s, t) => s + Number(t.subtotal || 0), 0)
  const discounts = completedTx.reduce((s, t) => s + Number(t.discount || 0), 0)
  const netRevenue = revenue - discounts
  const cogs = completedTx.flatMap(t => t.items || []).reduce((s, i) => s + Number(i.quantity || 0) * Number(i.unit_cost || 0), 0)
  const grossProfit = netRevenue - cogs
  const expensesTotal = expenses.value.reduce((s, e) => s + Number(e.amount || 0), 0)
  const netProfit = grossProfit - expensesTotal
  return { revenue, discounts, netRevenue, cogs, grossProfit, expenses: expensesTotal, netProfit }
})

const profitPositive = computed(() => Number(pnl.value.netProfit) >= 0)

const bs = computed(() => {
  const cash = shiftCash.value
  const inventory = inventoryValue.value
  const receivablesTotal = receivablesInvoices.value.reduce((s, i) => s + Number(i.balance), 0)
  const payablesTotal = ap.value.total
  const creditOutstanding = openCredits.value.reduce((s, c) => s + Number(c.balance || 0), 0)
  const totalAssets = cash + inventory + receivablesTotal
  const totalLiabilities = payablesTotal + creditOutstanding
  return { cash, inventory, receivables: receivablesTotal, totalAssets, payables: payablesTotal, creditOutstanding, totalLiabilities }
})

const ledgerFiltered = computed(() => {
  // Build comprehensive ledger entries from all available data
  let entries = []

  // 1. Real journal entries from the API (double-entry)
  const realEntries = []
  journalEntries.value.forEach(je => {
    if (je.status === 'reversed') return
    const lines = je.lines || []
    lines.forEach(line => {
      const acct = line.account_detail || line.account_name || (line.account && (typeof line.account === 'object' ? `${line.account.code} — ${line.account.name}` : line.account)) || '——'
      realEntries.push({
        date: je.date || je.created_at,
        entry_number: je.entry_number || 'JE',
        description: line.description || je.description || 'Journal entry',
        account: acct,
        account_type: line.account_type || (line.account && typeof line.account === 'object' ? line.account.account_type : ''),
        debit: Number(line.debit || 0),
        credit: Number(line.credit || 0),
        reference: je.reference || '',
        status: je.status || 'posted',
        source: 'journal',
      })
    })
  })
  entries.push(...realEntries)

  // 2. Synthetic entries from POS transactions (sales)
  transactions.value.filter(t => t.status === 'completed').forEach(t => {
    // Debit Cash/Bank (asset increases — money received)
    entries.push({
      date: t.created_at,
      entry_number: t.transaction_number || '',
      description: 'Sale ' + (t.transaction_number || ''),
      account: 'Cash',
      account_type: 'asset',
      debit: Number(t.total || 0), credit: 0,
      reference: t.payment_method || '',
      status: 'posted',
      source: 'pos',
    })
    // Credit Sales Revenue (revenue increases — revenue earned)
    entries.push({
      date: t.created_at,
      entry_number: t.transaction_number || '',
      description: 'Sale ' + (t.transaction_number || ''),
      account: 'Sales Revenue',
      account_type: 'revenue',
      debit: 0, credit: Number(t.subtotal || 0),
      reference: '',
      status: 'posted',
      source: 'pos',
    })
    // Credit Sales Tax Payable (liability increases — VAT collected)
    if (Number(t.tax || 0) > 0) {
      entries.push({
        date: t.created_at,
        entry_number: t.transaction_number || '',
        description: 'Sale ' + (t.transaction_number || ''),
        account: 'Sales Tax Payable',
        account_type: 'liability',
        debit: 0, credit: Number(t.tax || 0),
        reference: '',
        status: 'posted',
        source: 'pos',
      })
    }
    // Debit Cash Discounts (contra-revenue — discounts given)
    if (Number(t.discount || 0) > 0) {
      entries.push({
        date: t.created_at,
        entry_number: t.transaction_number || '',
        description: 'Sale ' + (t.transaction_number || ''),
        account: 'Sales Discounts',
        account_type: 'revenue',
        debit: Number(t.discount || 0), credit: 0,
        reference: '',
        status: 'posted',
        source: 'pos',
      })
    }
  })

  // 3. Synthetic entries from customer invoices (receivables)
  invoices.value.forEach(i => {
    if (i.status === 'cancelled') return
    entries.push({
      date: i.created_at || i.issue_date,
      entry_number: i.invoice_number || '',
      description: 'Invoice ' + (i.invoice_number || ''),
      account: 'Accounts Receivable',
      account_type: 'asset',
      debit: Number(i.total || 0), credit: 0,
      reference: i.customer_name || '',
      status: 'posted',
      source: 'invoice',
    })
  })

  // 4. Synthetic entries from expenses
  expenses.value.forEach(e => {
    entries.push({
      date: e.date || e.created_at,
      entry_number: e.expense_number || '',
      description: e.description || e.category || 'Expense',
      account: 'Operating Expenses',
      account_type: 'expense',
      debit: Number(e.amount || 0), credit: 0,
      reference: e.vendor || e.payment_reference || '',
      status: e.status ? e.status.toLowerCase() : 'posted',
      source: 'expense',
    })
  })

  // 5. Synthetic entries from purchase orders (payables)
  purchaseOrders.value.forEach(p => {
    if (p.status === 'cancelled') return
    entries.push({
      date: p.created_at,
      entry_number: p.po_number || '',
      description: 'Purchase Order ' + (p.po_number || ''),
      account: 'Accounts Payable',
      account_type: 'liability',
      debit: 0, credit: Number(p.grand_total || 0),
      reference: p.supplier_name || (p.supplier && p.supplier.name) || '',
      status: p.status || 'pending',
      source: 'po',
    })
  })

  // Sort by date descending
  entries.sort((a, b) => new Date(b.date) - new Date(a.date))

  // Filter by date range
  entries = entries.filter(e => inRange(e.date, currentRange.value))

  // Filter by account type
  if (ledgerAccountType.value) {
    entries = entries.filter(e => e.account_type === ledgerAccountType.value)
  }

  // Filter by specific account
  if (ledgerAccount.value) {
    entries = entries.filter(e => e.account === ledgerAccount.value)
  }

  // Filter by source
  if (ledgerSourceFilter.value) {
    entries = entries.filter(e => e.source === ledgerSourceFilter.value)
  }

  // Filter by search term
  if (ledgerSearch.value) {
    const s = ledgerSearch.value.toLowerCase()
    entries = entries.filter(e =>
      (e.description || '').toLowerCase().includes(s) ||
      (e.entry_number || '').toLowerCase().includes(s) ||
      (e.account || '').toLowerCase().includes(s) ||
      (e.reference || '').toLowerCase().includes(s)
    )
  }

  // Calculate running balance (debit - credit, oldest first)
  const chronological = [...entries].reverse()
  let running = 0
  chronological.forEach(e => {
    running += e.debit - e.credit
    e.balance = running
  })
  return chronological.reverse()
})

const ledgerSummary = computed(() => {
  const entries = ledgerFiltered.value
  const totalDebits = entries.reduce((s, e) => s + (e.debit || 0), 0)
  const totalCredits = entries.reduce((s, e) => s + (e.credit || 0), 0)
  const balance = totalDebits - totalCredits
  const entryCount = entries.length
  return { totalDebits, totalCredits, balance, entryCount }
})

const ledgerByAccount = computed(() => {
  const entries = ledgerFiltered.value
  const groups = {}
  entries.forEach(e => {
    if (!groups[e.account]) groups[e.account] = { account: e.account, account_type: e.account_type || '', debit: 0, credit: 0, count: 0 }
    groups[e.account].debit += e.debit || 0
    groups[e.account].credit += e.credit || 0
    groups[e.account].count += 1
  })
  return Object.values(groups).map(g => ({
    ...g,
    balance: g.debit - g.credit,
  })).sort((a, b) => (b.debit + b.credit) - (a.debit + a.credit))
})

const ledgerTrialBalance = computed(() => {
  const byAcct = ledgerByAccount.value
  const groups = {}
  byAcct.forEach(a => {
    const type = a.account_type || 'other'
    if (!groups[type]) groups[type] = { type, accounts: [], totalDebit: 0, totalCredit: 0 }
    groups[type].accounts.push(a)
    groups[type].totalDebit += a.debit || 0
    groups[type].totalCredit += a.credit || 0
  })
  const typeOrder = ['asset', 'liability', 'equity', 'revenue', 'expense', 'other']
  const result = typeOrder.filter(t => groups[t]).map(t => {
    const g = groups[t]
    g.balance = g.totalDebit - g.totalCredit
    return g
  })
  const grandDebit = result.reduce((s, g) => s + g.totalDebit, 0)
  const grandCredit = result.reduce((s, g) => s + g.totalCredit, 0)
  return {
    groups: result,
    grandDebit,
    grandCredit,
    balanced: Math.abs(grandDebit - grandCredit) < 0.01,
  }
})

const ledgerTrendSeries = computed(() => {
  const range = safeRange()
  const days = Math.min(30, Math.max(1, Math.ceil((range.to - range.from) / 86400000) + 1))
  const debitData = Array(days).fill(0)
  const creditData = Array(days).fill(0)
  ledgerFiltered.value.forEach(e => {
    const d = new Date(e.date)
    const diff = Math.floor((d - range.from) / 86400000)
    if (diff >= 0 && diff < days) {
      debitData[diff] += e.debit || 0
      creditData[diff] += e.credit || 0
    }
  })
  return [
    { name: 'Debits', data: debitData },
    { name: 'Credits', data: creditData },
  ]
})

const ledgerTrendOptions = computed(() => {
  const range = safeRange()
  const days = Math.min(30, Math.max(1, Math.ceil((range.to - range.from) / 86400000) + 1))
  const cats = []
  for (let i = 0; i < days; i++) {
    const d = new Date(range.from)
    d.setDate(d.getDate() + i)
    cats.push(d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }))
  }
  return {
    chart: { type: 'bar', toolbar: { show: false }, fontFamily: 'inherit', stacked: false },
    colors: ['#ef4444', '#22c55e'],
    plotOptions: { bar: { borderRadius: 3, columnWidth: '70%' } },
    dataLabels: { enabled: false },
    xaxis: { categories: cats, labels: { style: { fontSize: '10px' }, rotate: -45 } },
    yaxis: { labels: { formatter: v => (v >= 1000 ? (v / 1000).toFixed(0) + 'k' : Math.round(v)) } },
    legend: { show: false },
    grid: { borderColor: 'rgba(0,0,0,0.06)', strokeDashArray: 3 },
    tooltip: { shared: true, intersect: false },
  }
})

/* ===== Charts ===== */
const cashFlowSeries = computed(() => {
  const range = safeRange()
  const days = Math.min(30, Math.max(1, Math.ceil((range.to - range.from) / 86400000) + 1))
  const incData = Array(days).fill(0)
  const expData = Array(days).fill(0)
  txInRange.value.filter(t => t.status === 'completed').forEach(t => {
    const d = new Date(t.created_at)
    const diff = Math.floor((d - range.from) / 86400000)
    if (diff >= 0 && diff < days) incData[diff] += Number(t.total || 0)
  })
  expInRange.value.forEach(e => {
    const d = new Date(e.date || e.created_at)
    const diff = Math.floor((d - range.from) / 86400000)
    if (diff >= 0 && diff < days) expData[diff] += Number(e.amount || 0)
  })
  return [
    { name: 'Income', data: incData },
    { name: 'Expenses', data: expData },
  ]
})

const cashFlowOptions = computed(() => {
  const range = safeRange()
  const days = Math.min(30, Math.max(1, Math.ceil((range.to - range.from) / 86400000) + 1))
  const cats = []
  for (let i = 0; i < days; i++) {
    const d = new Date(range.from)
    d.setDate(d.getDate() + i)
    cats.push(d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }))
  }
  return {
    chart: { type: 'area', toolbar: { show: false }, zoom: { enabled: false }, fontFamily: 'inherit' },
    colors: ['#22c55e', '#ef4444'],
    stroke: { curve: 'smooth', width: 2 },
    fill: { type: 'gradient', gradient: { shadeIntensity: 1, opacityFrom: 0.3, opacityTo: 0.05, stops: [0, 100] } },
    dataLabels: { enabled: false },
    xaxis: { categories: cats },
    yaxis: { labels: { formatter: v => (v >= 1000 ? (v / 1000).toFixed(1) + 'k' : Math.round(v)) } },
    legend: { show: false },
    grid: { borderColor: 'rgba(0,0,0,0.06)', strokeDashArray: 3 },
    tooltip: { shared: true, intersect: false },
  }
})

const cashFlowBarOptions = computed(() => {
  const range = safeRange()
  const days = Math.min(30, Math.max(1, Math.ceil((range.to - range.from) / 86400000) + 1))
  const cats = []
  for (let i = 0; i < days; i++) {
    const d = new Date(range.from)
    d.setDate(d.getDate() + i)
    cats.push(d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }))
  }
  return {
    chart: { type: 'bar', toolbar: { show: false }, fontFamily: 'inherit', stacked: false },
    colors: ['#22c55e', '#ef4444'],
    plotOptions: { bar: { borderRadius: 3, columnWidth: '70%' } },
    dataLabels: { enabled: false },
    stroke: { show: true, width: 1, colors: ['transparent'] },
    fill: { opacity: 0.85 },
    xaxis: {
      categories: cats,
      labels: { style: { fontSize: '10px' }, rotate: -45, rotateAlways: false },
      axisBorder: { show: true, color: 'rgba(0,0,0,0.06)' },
      axisTicks: { show: true, color: 'rgba(0,0,0,0.06)' },
    },
    yaxis: {
      labels: { formatter: v => (v >= 1000 ? (v / 1000).toFixed(0) + 'k' : Math.round(v)), style: { fontSize: '10px' } },
      axisBorder: { show: false },
      axisTicks: { show: false },
    },
    legend: { show: false },
    grid: { borderColor: 'rgba(0,0,0,0.06)', strokeDashArray: 3, show: true },
    tooltip: { shared: true, intersect: false },
  }
})

const barChartWidth = computed(() => {
  const range = safeRange()
  const days = Math.min(30, Math.max(1, Math.ceil((range.to - range.from) / 86400000) + 1))
  const perDay = 56
  const minW = 300
  return Math.max(minW, days * perDay + 60)
})

const cashByMethod = computed(() => {
  const completed = txInRange.value.filter(t => t.status === 'completed')
  const groups = {}
  completed.forEach(t => {
    const m = t.payment_method || 'cash'
    groups[m] = (groups[m] || 0) + Number(t.total || 0)
  })
  const total = Object.values(groups).reduce((s, v) => s + v, 0)
  return Object.entries(groups).map(([method, val]) => ({
    method, total: val, pct: total > 0 ? (val / total * 100) : 0
  })).sort((a, b) => b.total - a.total)
})

const revExpSeries = computed(() => {
  const days = 14
  const now = new Date()
  const revByDay = Array(days).fill(0)
  const expByDay = Array(days).fill(0)
  transactions.value.filter(t => t.status === 'completed').forEach(t => {
    const d = new Date(t.created_at)
    const diff = Math.floor((now - d) / 86400000)
    if (diff >= 0 && diff < days) revByDay[days - 1 - diff] += Number(t.total || 0)
  })
  expenses.value.forEach(e => {
    const d = new Date(e.date || e.created_at)
    const diff = Math.floor((now - d) / 86400000)
    if (diff >= 0 && diff < days) expByDay[days - 1 - diff] += Number(e.amount || 0)
  })
  return [{ name: 'Revenue', data: revByDay }, { name: 'Expenses', data: expByDay }]
})

const revExpOptions = {
  chart: { type: 'bar', toolbar: { show: false }, fontFamily: 'inherit' },
  colors: ['#3478f6', '#f44336'],
  plotOptions: { bar: { borderRadius: 4 } },
  xaxis: {
    categories: Array.from({ length: 14 }, (_, i) => {
      const d = new Date()
      d.setDate(d.getDate() - (13 - i))
      return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })
    })
  },
  dataLabels: { enabled: false },
  legend: { position: 'top' },
  grid: { borderColor: 'rgba(0,0,0,0.06)', strokeDashArray: 3 },
  yaxis: { labels: { formatter: (val) => Math.round(val).toLocaleString() } },
}

const cashMethodDonutSeries = computed(() => cashByMethod.value.map(m => m.total))
const cashMethodDonutOptions = computed(() => ({
  chart: { type: 'donut', toolbar: { show: false }, fontFamily: 'inherit' },
  labels: cashByMethod.value.map(m => m.method.charAt(0).toUpperCase() + m.method.slice(1)),
  colors: cashByMethod.value.map(m => {
    const hexMap = { cash: '#4caf50', mpesa: '#2e7d32', card: '#2196f3', insurance: '#9c27b0', credit: '#ff9800', bank_transfer: '#3f51b5' }
    return hexMap[m.method] || '#9e9e9e'
  }),
  stroke: { width: 2 },
  dataLabels: { enabled: true, formatter: (val) => `${val.toFixed(0)}%` },
  legend: { show: true, position: 'bottom', fontSize: '12px', markers: { size: 6 }, itemMargin: { horizontal: 6, vertical: 4 } },
  plotOptions: {
    pie: { donut: { size: '68%', labels: {
      show: true,
      total: { show: true, label: 'Total', formatter: () => formatMoney(cashMethodDonutSeries.value.reduce((s, v) => s + v, 0)) }
    } } }
  },
  tooltip: { y: { formatter: (val) => formatMoney(val) } }
}))

/* ===== Cash Flow tab computeds ===== */

// Combined cash-flow entries (income + expenses) sorted by date
const cashFlowEntries = computed(() => {
  const entries = []
  txInRange.value.filter(t => t.status === 'completed').forEach(t => {
    entries.push({
      date: t.created_at,
      description: `POS Sale ${t.transaction_number || ''}`,
      method: t.payment_method || 'cash',
      type: 'inflow',
      amount: Number(t.total || 0),
    })
  })
  expInRange.value.forEach(e => {
    entries.push({
      date: e.date || e.created_at,
      description: e.description || e.category || 'Expense',
      method: e.payment_method || 'cash',
      type: 'outflow',
      amount: Number(e.amount || 0),
    })
  })
  entries.sort((a, b) => new Date(b.date) - new Date(a.date))
  return entries
})

// Filtered cash flow entries for the ledger table
const cashFlowFiltered = computed(() => {
  let list = cashFlowEntries.value
  if (cfMethodFilter.value) list = list.filter(e => e.method === cfMethodFilter.value)
  if (cfTypeFilter.value) list = list.filter(e => e.type === cfTypeFilter.value)
  return list
})

// Cash flow KPIs
const cashFlowKpis = computed(() => {
  const inflows = cashFlowEntries.value.filter(e => e.type === 'inflow')
  const outflows = cashFlowEntries.value.filter(e => e.type === 'outflow')
  const totalIn = inflows.reduce((s, e) => s + e.amount, 0)
  const totalOut = outflows.reduce((s, e) => s + e.amount, 0)
  const net = totalIn - totalOut
  const openingBalance = 0 // would come from a real cash account opening balance
  const closingBalance = openingBalance + net
  const burnRate = totalOut // total spending in range
  const runRate = totalIn // total income in range
  return { totalIn, totalOut, net, openingBalance, closingBalance, burnRate, runRate, inflowCount: inflows.length, outflowCount: outflows.length }
})

// Running cumulative balance series for chart
const cashFlowCumulativeSeries = computed(() => {
  const entries = [...cashFlowEntries.value].reverse() // chronological
  let running = 0
  const data = []
  const cats = []
  entries.forEach(e => {
    running += e.type === 'inflow' ? e.amount : -e.amount
    data.push(Math.round(running * 100) / 100)
    cats.push(new Date(e.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }))
  })
  return { series: [{ name: 'Cumulative Cash Flow', data }], categories: cats }
})

const cashFlowCumulativeOptions = computed(() => {
  const cs = cashFlowCumulativeSeries.value
  return {
    chart: { type: 'area', toolbar: { show: false }, zoom: { enabled: false }, fontFamily: 'inherit' },
    colors: ['#3b82f6'],
    stroke: { curve: 'smooth', width: 2 },
    fill: { type: 'gradient', gradient: { shadeIntensity: 1, opacityFrom: 0.35, opacityTo: 0.05, stops: [0, 100] } },
    dataLabels: { enabled: false },
    xaxis: {
      categories: cs.categories,
      labels: { style: { fontSize: '10px' }, rotate: -45, rotateAlways: false },
      axisBorder: { show: true, color: 'rgba(0,0,0,0.06)' },
      tickAmount: Math.min(cs.categories.length, Math.ceil(cumulativeChartWidth.value / 80)),
    },
    yaxis: { labels: { formatter: v => (Math.abs(v) >= 1000 ? (v / 1000).toFixed(1) + 'k' : Math.round(v)) } },
    grid: { borderColor: 'rgba(0,0,0,0.06)', strokeDashArray: 3 },
    tooltip: { y: { formatter: val => formatMoney(val) } },
    markers: { size: 0, hover: { size: 5 } },
  }
})

const cumulativeChartWidth = computed(() => {
  const pts = cashFlowCumulativeSeries.value.series[0].data.length
  const perPoint = 18 // px per data point
  const minW = 400
  return Math.max(minW, pts * perPoint + 60)
})

// Daily in vs out bar chart
const cashFlowDailySeries = computed(() => {
  const range = safeRange()
  const days = Math.min(30, Math.max(1, Math.ceil((range.to - range.from) / 86400000) + 1))
  const inData = Array(days).fill(0)
  const outData = Array(days).fill(0)
  txInRange.value.filter(t => t.status === 'completed').forEach(t => {
    const d = new Date(t.created_at)
    const diff = Math.floor((d - range.from) / 86400000)
    if (diff >= 0 && diff < days) inData[diff] += Number(t.total || 0)
  })
  expInRange.value.forEach(e => {
    const d = new Date(e.date || e.created_at)
    const diff = Math.floor((d - range.from) / 86400000)
    if (diff >= 0 && diff < days) outData[diff] += Number(e.amount || 0)
  })
  return [
    { name: 'Cash In', data: inData },
    { name: 'Cash Out', data: outData },
  ]
})

const cashFlowDailyOptions = computed(() => {
  const range = safeRange()
  const days = Math.min(30, Math.max(1, Math.ceil((range.to - range.from) / 86400000) + 1))
  const cats = []
  for (let i = 0; i < days; i++) {
    const d = new Date(range.from)
    d.setDate(d.getDate() + i)
    cats.push(d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }))
  }
  return {
    chart: { type: 'bar', toolbar: { show: false }, fontFamily: 'inherit', stacked: false },
    colors: ['#22c55e', '#ef4444'],
    plotOptions: { bar: { borderRadius: 3, columnWidth: '70%' } },
    dataLabels: { enabled: false },
    stroke: { show: true, width: 1, colors: ['transparent'] },
    fill: { opacity: 0.85 },
    xaxis: {
      categories: cats,
      labels: { style: { fontSize: '10px' }, rotate: -45 },
      axisBorder: { show: true, color: 'rgba(0,0,0,0.06)' },
    },
    yaxis: { labels: { formatter: v => (Math.abs(v) >= 1000 ? (v / 1000).toFixed(0) + 'k' : Math.round(v)), style: { fontSize: '10px' } } },
    legend: { show: true, position: 'top' },
    grid: { borderColor: 'rgba(0,0,0,0.06)', strokeDashArray: 3 },
    tooltip: { shared: true, intersect: false, y: { formatter: val => formatMoney(val) } },
  }
})

// Inflow breakdown by payment method
const cashFlowByMethod = computed(() => {
  const inflows = cashFlowEntries.value.filter(e => e.type === 'inflow')
  const groups = {}
  inflows.forEach(e => {
    const m = e.method || 'cash'
    groups[m] = (groups[m] || 0) + e.amount
  })
  const total = Object.values(groups).reduce((s, v) => s + v, 0)
  return Object.entries(groups).map(([method, val]) => ({
    method, total: val, pct: total > 0 ? (val / total * 100) : 0
  })).sort((a, b) => b.total - a.total)
})

const cashFlowMethodDonutSeries = computed(() => cashFlowByMethod.value.map(m => m.total))
const cashFlowMethodDonutOptions = computed(() => ({
  chart: { type: 'donut', toolbar: { show: false }, fontFamily: 'inherit' },
  labels: cashFlowByMethod.value.map(m => m.method.charAt(0).toUpperCase() + m.method.slice(1)),
  colors: cashFlowByMethod.value.map(m => {
    const hexMap = { cash: '#4caf50', mpesa: '#2e7d32', card: '#2196f3', insurance: '#9c27b0', credit: '#ff9800', bank_transfer: '#3f51b5' }
    return hexMap[m.method] || '#9e9e9e'
  }),
  stroke: { width: 2 },
  dataLabels: { enabled: true, formatter: (val) => `${val.toFixed(0)}%` },
  legend: { show: true, position: 'bottom', fontSize: '12px', markers: { size: 6 }, itemMargin: { horizontal: 6, vertical: 4 } },
  plotOptions: {
    pie: { donut: { size: '68%', labels: {
      show: true,
      total: { show: true, label: 'Cash In', formatter: () => formatMoney(cashFlowMethodDonutSeries.value.reduce((s, v) => s + v, 0)) }
    } } }
  },
  tooltip: { y: { formatter: (val) => formatMoney(val) } }
}))

// Cash flow table headers
const cashFlowTableHeaders = [
  { title: '#', key: 'index', sortable: false, align: 'start', width: '50px' },
  { title: 'Date', key: 'date', sortable: true },
  { title: 'Description', key: 'description', sortable: true },
  { title: 'Method', key: 'method', sortable: true },
  { title: 'Inflow', key: 'inflow', sortable: true, align: 'end' },
  { title: 'Outflow', key: 'outflow', sortable: true, align: 'end' },
  { title: 'Type', key: 'type', sortable: true, align: 'center' },
]

/* ===== ROI tab computeds ===== */

// Total investment = inventory value + total expenses (operating costs) + payables (capital invested in POs)
const roiInvestment = computed(() => {
  try {
    const inventory = inventoryValue.value || 0
    const expTotal = expenses.value.reduce((s, e) => s + Number(e.amount || 0), 0)
    const poInvested = purchaseOrders.value
      .filter(p => p.status !== 'cancelled')
      .reduce((s, p) => s + Number(p.grand_total || 0), 0)
    return { inventory, expenses: expTotal, poInvested, total: inventory + expTotal + poInvested }
  } catch (e) {
    return { inventory: 0, expenses: 0, poInvested: 0, total: 0 }
  }
})

// ROI metrics
const roiMetrics = computed(() => {
  try {
    const completedTx = transactions.value.filter(t => t.status === 'completed')
    const revenue = completedTx.reduce((s, t) => s + Number(t.total || 0), 0)
    const cogs = completedTx.flatMap(t => t.items || []).reduce((s, i) => s + Number(i.quantity || 0) * Number(i.unit_cost || 0), 0)
    const grossProfit = revenue - cogs
    const operatingExpenses = expenses.value.reduce((s, e) => s + Number(e.amount || 0), 0)
    const netProfit = grossProfit - operatingExpenses
    const totalInvestment = roiInvestment.value.total
    const roi = totalInvestment > 0 ? (netProfit / totalInvestment) * 100 : 0
    const profitMargin = revenue > 0 ? (netProfit / revenue) * 100 : 0
    const grossMargin = revenue > 0 ? (grossProfit / revenue) * 100 : 0
    const range = currentRange.value
    let monthsInPeriod = 3
    if (range.from && range.to) {
      monthsInPeriod = Math.max(1, (range.to - range.from) / (86400000 * 30))
    }
    const monthlyNetProfit = monthsInPeriod > 0 ? netProfit / monthsInPeriod : netProfit
    const paybackMonths = monthlyNetProfit > 0 ? totalInvestment / monthlyNetProfit : 0
    const annualizedROI = monthsInPeriod > 0 ? roi * (12 / monthsInPeriod) : roi
    const totalAssets = bs.value.totalAssets || 0
    const roa = totalAssets > 0 ? (netProfit / totalAssets) * 100 : 0
    const liabilities = bs.value.totalLiabilities || 0
    const equity = totalAssets - liabilities
    const roe = equity > 0 ? (netProfit / equity) * 100 : 0
    const investedCapital = roiInvestment.value.inventory + roiInvestment.value.poInvested
    const roic = investedCapital > 0 ? (netProfit / investedCapital) * 100 : 0
    return {
      revenue, cogs, grossProfit, operatingExpenses, netProfit,
      totalInvestment, roi, profitMargin, grossMargin, paybackMonths,
      annualizedROI, roa, roe, roic, monthlyNetProfit,
    }
  } catch (e) {
    return {
      revenue: 0, cogs: 0, grossProfit: 0, operatingExpenses: 0, netProfit: 0,
      totalInvestment: 0, roi: 0, profitMargin: 0, grossMargin: 0, paybackMonths: 0,
      annualizedROI: 0, roa: 0, roe: 0, roic: 0, monthlyNetProfit: 0,
    }
  }
})

// ROI trend: monthly net profit vs investment for chart
const roiTrendSeries = computed(() => {
  const range = safeRange()
  const days = Math.min(30, Math.max(1, Math.ceil((range.to - range.from) / 86400000) + 1))
  const profitData = Array(days).fill(0)
  const investData = Array(days).fill(0)
  txInRange.value.filter(t => t.status === 'completed').forEach(t => {
    const d = new Date(t.created_at)
    const diff = Math.floor((d - range.from) / 86400000)
    if (diff >= 0 && diff < days) {
      const items = t.items || []
      const cost = items.reduce((s, i) => s + Number(i.quantity || 0) * Number(i.unit_cost || 0), 0)
      profitData[diff] += Number(t.total || 0) - cost
    }
  })
  expInRange.value.forEach(e => {
    const d = new Date(e.date || e.created_at)
    const diff = Math.floor((d - range.from) / 86400000)
    if (diff >= 0 && diff < days) investData[diff] += Number(e.amount || 0)
  })
  return [
    { name: 'Net Profit', data: profitData },
    { name: 'Investment', data: investData },
  ]
})

const roiTrendOptions = computed(() => {
  const range = safeRange()
  const days = Math.min(30, Math.max(1, Math.ceil((range.to - range.from) / 86400000) + 1))
  const cats = []
  for (let i = 0; i < days; i++) {
    const d = new Date(range.from)
    d.setDate(d.getDate() + i)
    cats.push(d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }))
  }
  return {
    chart: { type: 'bar', toolbar: { show: false }, fontFamily: 'inherit', stacked: false },
    colors: ['#22c55e', '#f59e0b'],
    plotOptions: { bar: { borderRadius: 3, columnWidth: '70%' } },
    dataLabels: { enabled: false },
    stroke: { show: true, width: 1, colors: ['transparent'] },
    fill: { opacity: 0.85 },
    xaxis: {
      categories: cats,
      labels: { style: { fontSize: '10px' }, rotate: -45 },
      axisBorder: { show: true, color: 'rgba(0,0,0,0.06)' },
    },
    yaxis: { labels: { formatter: v => (Math.abs(v) >= 1000 ? (v / 1000).toFixed(0) + 'k' : Math.round(v)), style: { fontSize: '10px' } } },
    legend: { show: true, position: 'top' },
    grid: { borderColor: 'rgba(0,0,0,0.06)', strokeDashArray: 3 },
    tooltip: { shared: true, intersect: false, y: { formatter: val => formatMoney(val) } },
  }
})

// ROI gauge series (single value 0-100%)
const roiGaugeSeries = computed(() => [Math.min(100, Math.max(0, roiMetrics.value.roi || 0))])
const roiGaugeOptions = computed(() => ({
  chart: { type: 'radialBar', toolbar: { show: false }, fontFamily: 'inherit' },
  colors: ['#3b82f6'],
  plotOptions: {
    radialBar: {
      startAngle: -135, endAngle: 135,
      hollow: { size: '60%' },
      track: { background: 'rgba(0,0,0,0.06)', strokeWidth: '100%' },
      dataLabels: {
        name: { fontSize: '14px', color: 'rgba(0,0,0,0.6)', offsetY: 80 },
        value: { fontSize: '32px', fontWeight: 700, color: 'rgba(0,0,0,0.85)', offsetY: 30, formatter: val => val.toFixed(1) + '%' },
      },
    },
  },
  fill: { type: 'gradient', gradient: { shade: 'light', type: 'horizontal', shadeIntensity: 0.5, gradientToColors: ['#22c55e'], stops: [0, 100] } },
  labels: ['Return on Investment'],
  tooltip: { y: { formatter: () => roiMetrics.value.roi.toFixed(2) + '%' } },
}))

// ROI detailed table
const roiBreakdown = computed(() => {
  const m = roiMetrics.value
  return [
    { metric: 'Revenue (Sales)', value: m.revenue, type: 'positive' },
    { metric: 'Cost of Goods Sold (COGS)', value: m.cogs, type: 'negative' },
    { metric: 'Gross Profit', value: m.grossProfit, type: 'highlight' },
    { metric: 'Operating Expenses', value: m.operatingExpenses, type: 'negative' },
    { metric: 'Net Profit', value: m.netProfit, type: 'highlight' },
    { metric: 'Total Investment', value: m.totalInvestment, type: 'neutral' },
    { metric: 'Monthly Net Profit', value: m.monthlyNetProfit, type: 'neutral' },
  ]
})

const roiRatios = computed(() => {
  const m = roiMetrics.value
  return [
    { label: 'ROI', value: m.roi, target: 15, suffix: '%', color: m.roi >= 15 ? 'success' : 'warning' },
    { label: 'Annualized ROI', value: m.annualizedROI, target: 20, suffix: '%', color: m.annualizedROI >= 20 ? 'success' : 'warning' },
    { label: 'Gross Margin', value: m.grossMargin, target: 40, suffix: '%', color: m.grossMargin >= 40 ? 'success' : 'warning' },
    { label: 'Profit Margin', value: m.profitMargin, target: 10, suffix: '%', color: m.profitMargin >= 10 ? 'success' : 'warning' },
    { label: 'Return on Assets (ROA)', value: m.roa, target: 5, suffix: '%', color: m.roa >= 5 ? 'success' : 'warning' },
    { label: 'Return on Equity (ROE)', value: m.roe, target: 12, suffix: '%', color: m.roe >= 12 ? 'success' : 'warning' },
    { label: 'Return on Invested Capital (ROIC)', value: m.roic, target: 10, suffix: '%', color: m.roic >= 10 ? 'success' : 'warning' },
  ]
})

// Products sold breakdown for the ROI tab
const productsSold = computed(() => {
  const groups = {}
  txInRange.value.filter(t => t.status === 'completed').forEach(t => {
    for (const item of (t.items || [])) {
      const name = item.product_name || 'Unknown'
      const pid = item.product
      const cost = pid ? (productCostMap.value.get(pid) || 0) : 0
      const retail = Number(item.unit_price || 0)
      if (!groups[name]) groups[name] = { name, qty: 0, revenue: 0, costTotal: 0, retail, cost, productId: pid }
      groups[name].qty += Number(item.quantity || 0)
      groups[name].revenue += Number(item.line_total || 0) || (Number(item.quantity || 0) * Number(item.unit_price || 0))
      groups[name].costTotal += Number(item.quantity || 0) * cost
      // Use the first-seen retail/cost as per-unit reference
      if (!pid || !groups[name].retail) groups[name].retail = retail
      if (pid) groups[name].cost = cost
    }
  })
  const list = Object.values(groups)
  const totalRevenue = list.reduce((s, p) => s + p.revenue, 0)
  const totalQty = list.reduce((s, p) => s + p.qty, 0)
  const totalCost = list.reduce((s, p) => s + p.costTotal, 0)
  return list
    .map(p => ({
      ...p,
      unitCost: p.qty > 0 ? p.costTotal / p.qty : p.cost,
      revenuePct: totalRevenue > 0 ? (p.revenue / totalRevenue * 100) : 0,
      qtyPct: totalQty > 0 ? (p.qty / totalQty * 100) : 0,
      markup: p.retail > 0 && p.cost > 0 ? ((p.retail - p.cost) / p.cost * 100) : 0,
    }))
    .sort((a, b) => b.revenue - a.revenue)
})

const productsSoldHeaders = [
  { title: '#', key: 'index', sortable: false, align: 'start', width: '50px' },
  { title: 'Product', key: 'name', sortable: true },
  { title: 'Cost / Unit', key: 'unitCost', sortable: true, align: 'end' },
  { title: 'Retail / Unit', key: 'retail', sortable: true, align: 'end' },
  { title: 'Markup', key: 'markup', sortable: true, align: 'center' },
  { title: 'Qty', key: 'qty', sortable: true, align: 'end' },
  { title: 'Revenue', key: 'revenue', sortable: true, align: 'end' },
  { title: 'Share', key: 'revenuePct', sortable: true, align: 'start', width: '160px' },
]

/* ===== API ===== */
async function fetchAllPages(url, pageSize = 500) {
  const all = []
  let nextUrl = `${url}${url.includes('?') ? '&' : '?'}page_size=${pageSize}`
  while (nextUrl) {
    const data = await useApi()(nextUrl)
    all.push(...(data.results || []))
    nextUrl = data.next
      ? data.next.replace(/^https?:\/\/[^/]+\/+api/, '')
      : null
  }
  return all
}

async function loadAll() {
  loading.value = true
  try {
    const [tx, inv, cr, exp, po, invVal, shiftData, je, coa, prodData] = await Promise.all([
      fetchAllPages('/pos/transactions/?ordering=-created_at').catch(() => []),
      useApi()('/accounting/invoices/?page_size=200').catch(() => ({ results: [] })),
      useApi()('/pos/credits/?page_size=200').catch(() => ({ results: [] })),
      useApi()('/accounting/expenses/?page_size=200').catch(() => ({ results: [] })),
      useApi()('/purchasing/orders/?page_size=200').catch(() => ({ results: [] })),
      useApi()('/reports/inventory-valuation/').catch(() => ({ total_value: 0 })),
      useApi()('/pos/shifts/current/').catch(() => null),
      useApi()('/accounting/journal/?page_size=500').catch(() => ({ results: [] })),
      useApi()('/accounting/accounts/?page_size=200').catch(() => ({ results: [] })),
      useApi()('/products/?page_size=500').then(d => d.results || d).catch(() => []),
    ])
    transactions.value = tx
    invoices.value = inv.results || inv
    credits.value = cr.results || cr
    expenses.value = exp.results || exp
    purchaseOrders.value = po.results || po
    inventoryValue.value = Array.isArray(invVal) ? invVal.reduce((s, i) => s + Number(i.cost_value || i.stock_value || 0), 0) : (invVal.total_value || 0)
    shiftCash.value = shiftData ? (shiftData.opening_float || 0) : 0
    journalEntries.value = je.results || je || []
    chartOfAccounts.value = coa.results || coa || []
    const costMap = new Map()
    for (const p of prodData) costMap.set(p.id, parseFloat(p.cost_price) || 0)
    productCostMap.value = costMap
  } catch { /* ignore */ } finally {
    loading.value = false
  }
}

onMounted(loadAll)
</script>

<style scoped>
/* ===== KPI cards (matching sales page) ===== */
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
.kpi-icon-green { background: rgba(76, 175, 80, 0.12); color: #4caf50; }
.kpi-icon-red { background: rgba(244, 67, 54, 0.12); color: #f44336; }
.kpi-icon-teal { background: rgba(0, 150, 136, 0.12); color: #009688; }
.kpi-icon-orange { background: rgba(255, 152, 0, 0.12); color: #ff9800; }
.kpi-icon-blue { background: rgba(33, 150, 243, 0.12); color: #2196f3; }
.kpi-icon-purple { background: rgba(156, 39, 176, 0.12); color: #9c27b0; }

/* ===== Page wrapper ===== */
.az-page {
  padding: 0 24px 20px;
  max-width: 1600px;
  margin: 0 auto;
  font-family: Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
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
.az-header__left { display: flex; align-items: center; gap: 14px; }
.az-header__title-icon {
  width: 48px; height: 48px;
  border-radius: 14px;
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
}
.az-header__title-icon--primary { background: rgba(52, 120, 246, 0.12); color: #3478f6; }
.az-header__actions { display: flex; gap: 8px; align-items: center; flex-wrap: wrap; }

/* ===== Period pills bar (full-width) ===== */
.az-period-bar {
  display: flex;
  align-items: center;
  gap: 0;
  margin-bottom: 16px;
  border: 1px solid rgba(0, 0, 0, 0.06);
  border-radius: 12px;
  background: rgb(var(--v-theme-surface));
  padding: 0;
  height: 42px;
}
.az-period-bar__icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 100%;
  flex-shrink: 0;
  border-right: 1px solid rgba(0, 0, 0, 0.06);
  color: rgba(30, 41, 59, 0.5);
}
.az-period-pills {
  display: flex;
  gap: 2px;
  flex-wrap: nowrap;
  overflow-x: auto;
  flex: 1 1 auto;
  padding: 0 4px;
  height: 100%;
  align-items: center;
  scrollbar-width: none;
  -ms-overflow-style: none;
}
.az-period-pills::-webkit-scrollbar { display: none; }
.az-pill {
  padding: 5px 12px;
  border-radius: 8px;
  font-size: 0.8125rem;
  font-weight: 500;
  color: rgba(30, 41, 59, 0.6);
  background: transparent;
  border: none;
  cursor: pointer;
  transition: all 0.15s;
  display: flex;
  align-items: center;
  white-space: nowrap;
  flex-shrink: 0;
}
.az-pill:hover { background: rgba(0, 0, 0, 0.04); color: rgba(30, 41, 59, 0.87); }
.az-pill--active {
  background: rgba(52, 120, 246, 0.1);
  color: #3478f6;
  font-weight: 600;
}
.az-period-bar__sep {
  width: 1px;
  height: 24px;
  background: rgba(0, 0, 0, 0.08);
  flex-shrink: 0;
}
.az-period-display {
  display: flex;
  align-items: center;
  font-size: 0.8125rem;
  color: rgba(30, 41, 59, 0.5);
  padding: 0 14px;
  white-space: nowrap;
  flex-shrink: 0;
}

/* ===== Tab bar (full-width, evenly distributed) ===== */
.az-tab-bar {
  display: flex;
  align-items: stretch;
  margin-bottom: 20px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.06);
  background: #ffffff;
  border-radius: 10px 10px 0 0;
  padding: 0 4px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}
.az-tab-row {
  display: flex;
  flex: 1 1 auto;
  align-items: center;
}
.az-tab-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 10px 16px;
  flex: 1 1 0;
  min-width: 0;
  border-radius: 8px 8px 0 0;
  font-size: 0.8125rem;
  font-weight: 500;
  color: rgba(30, 41, 59, 0.6);
  background: transparent;
  border: none;
  border-bottom: 2px solid transparent;
  cursor: pointer;
  transition: all 0.15s;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin-bottom: -1px;
}
.az-tab-btn:hover { background: rgba(52, 120, 246, 0.06); color: rgba(30, 41, 59, 0.87); }
.az-tab-btn--active {
  border-bottom-color: #3478f6;
  color: #1a5fd0;
  font-weight: 600;
  background: rgba(52, 120, 246, 0.12);
}

/* ===== KPI Grid (4 equal columns, full-width) ===== */
.az-kpi-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  margin-bottom: 20px;
}
.az-kpi-card {
  padding: 16px !important;
  border: 1px solid rgba(0, 0, 0, 0.06) !important;
  transition: transform 0.15s, box-shadow 0.15s;
}
.az-kpi-card:hover {
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.06);
  transform: translateY(-2px);
}
.az-kpi-label {
  font-size: 0.75rem;
  color: rgba(30, 41, 59, 0.6);
  font-weight: 500;
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.az-kpi-value {
  font-size: 1.5rem;
  font-weight: 700;
  color: rgba(30, 41, 59, 0.87);
  letter-spacing: -0.02em;
  margin-top: 4px;
  line-height: 1.2;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.az-kpi-sub {
  font-size: 0.75rem;
  color: rgba(30, 41, 59, 0.45);
  margin-top: 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* ===== Section cards ===== */
.az-sec-card {
  border: 1px solid rgba(0, 0, 0, 0.06) !important;
  overflow: hidden;
}
.az-sec-card__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  flex-wrap: wrap;
  gap: 8px;
}
.az-sec-card__title {
  display: flex;
  align-items: center;
  font-size: 0.9375rem;
  font-weight: 600;
  color: rgba(30, 41, 59, 0.87);
}

/* ===== Chart rows ===== */
.az-chart-row {
  display: grid;
  gap: 16px;
  margin-bottom: 16px;
}
.az-chart-row--2 {
  grid-template-columns: 1fr 1fr;
}
.az-chart-divider {
  border-top: 1px dashed rgba(0, 0, 0, 0.08);
  margin: 4px 0 12px;
}
.az-bar-scroll {
  overflow-x: auto;
  overflow-y: hidden;
  width: 100%;
  -webkit-overflow-scrolling: touch;
}
.az-bar-scroll::-webkit-scrollbar { height: 6px; }
.az-bar-scroll::-webkit-scrollbar-track { background: rgba(0,0,0,0.03); border-radius: 3px; }
.az-bar-scroll::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.15); border-radius: 3px; }
.az-bar-scroll::-webkit-scrollbar-thumb:hover { background: rgba(0,0,0,0.25); }
.az-cf-scroll {
  overflow-x: auto;
  overflow-y: hidden;
  width: 100%;
  -webkit-overflow-scrolling: touch;
}
.az-cf-scroll::-webkit-scrollbar { height: 6px; }
.az-cf-scroll::-webkit-scrollbar-track { background: rgba(0,0,0,0.03); border-radius: 3px; }
.az-cf-scroll::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.15); border-radius: 3px; }
.az-cf-scroll::-webkit-scrollbar-thumb:hover { background: rgba(0,0,0,0.25); }

/* ===== Legend ===== */
.az-legend {
  display: flex;
  align-items: center;
  gap: 4px;
}

/* ===== Trial Balance groups ===== */
.az-tb-group {
  margin-bottom: 8px;
}
.az-tb-group__head {
  display: flex;
  align-items: center;
  padding: 6px 0;
  margin-bottom: 4px;
}
.az-tb-row {
  transition: background 0.15s;
}
.az-tb-row:hover {
  background: rgba(52, 120, 246, 0.04);
}

/* ===== Method rows ===== */
.az-method-donut-card {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  max-width: 320px;
}
.az-donut-badges {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  justify-content: center;
  margin-top: 8px;
}
.az-donut-badge {
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 4px 10px;
  border-radius: 20px;
  background: rgba(103, 116, 142, 0.06);
  font-size: 0.75rem;
}
.az-donut-badge__dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
}
.az-donut-badge__label {
  font-weight: 600;
  color: rgba(30, 41, 59, 0.87);
}
.az-donut-badge__amt {
  color: rgba(30, 41, 59, 0.6);
  font-weight: 500;
}
.az-donut-badge__pct {
  color: rgba(30, 41, 59, 0.45);
  font-weight: 600;
}
.az-method-row { padding: 10px 0; border-bottom: 1px solid rgba(0, 0, 0, 0.04); }
.az-method-row:last-child { border-bottom: none; }
.az-product-row {
  padding: 12px 0;
  border-bottom: 1px solid rgba(0, 0, 0, 0.04);
  background: none;
}
.az-product-row:last-child { border-bottom: none; }
.az-method-row__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.az-method-row__label {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 0.875rem;
  font-weight: 500;
  color: rgba(30, 41, 59, 0.87);
}
.az-method-row__value {
  font-size: 0.875rem;
  font-weight: 700;
  color: rgba(30, 41, 59, 0.87);
}
.az-method-row__pct {
  font-size: 0.75rem;
  color: rgba(30, 41, 59, 0.45);
  margin-top: 4px;
  margin-bottom: 6px;
}

/* ===== List items ===== */
.az-list-item {
  margin: 2px 0;
}

/* ===== Responsive ===== */
@media (max-width: 960px) {
  .az-chart-row--2 { grid-template-columns: 1fr; }
  .az-kpi-grid { grid-template-columns: repeat(2, 1fr); }
  .az-tab-btn { padding: 10px 8px; font-size: 0.75rem; }
  .az-tab-btn .v-icon { font-size: 14px !important; }
}
@media (max-width: 600px) {
  .az-page { padding: 12px; }
  .az-kpi-grid { grid-template-columns: 1fr 1fr; }
  .az-header { margin-bottom: 12px; }
  .az-tab-btn span { display: none; }
}
</style>

