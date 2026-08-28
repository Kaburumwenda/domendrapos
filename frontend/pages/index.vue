<template>
  <v-app theme="light" class="welcome-app">
    <WelcomeHeroBg />

    <v-main class="welcome-main">
      <!-- Top bar -->
      <div class="welcome-topbar welcome-animate--1 welcome-animate">
        <div class="d-flex align-center ga-3">
          <div class="welcome-logo">
            <v-icon size="26" color="white">mdi-monitor</v-icon>
          </div>
          <span class="welcome-brand">DomendraPOS</span>
          <v-chip size="x-small" variant="tonal" color="primary" class="ml-1">Multi-tenant POS</v-chip>
        </div>
        <div class="d-none d-sm-flex align-center ga-2">
          <v-btn variant="text" size="small" @click="navigateTo('/docs')">
            <v-icon start size="18">mdi-book-open-page-variant-outline</v-icon>
            Documentation
          </v-btn>
          <v-btn variant="outlined" size="small" to="/login">Sign in</v-btn>
          <v-btn color="primary" size="small" to="/signup">Get started</v-btn>
        </div>
        <div class="d-flex d-sm-none">
          <v-btn icon="mdi-login" size="small" to="/login" variant="text" />
        </div>
      </div>

      <v-container fluid class="welcome-container">
        <!-- ─── Hero ──────── -->
        <section class="hero-section">
          <div class="text-center">
            <v-chip size="small" variant="tonal" color="primary" class="welcome-animate--1 welcome-animate mb-4">
              <v-icon start size="16">mdi-rocket-launch-outline</v-icon>
              The complete POS platform
            </v-chip>

            <h1 class="welcome-animate--2 welcome-animate hero-title">
              Point of Sale,
              <span class="welcome-gradient-text">reimagined.</span>
            </h1>

            <p class="welcome-animate--3 welcome-animate hero-lede">
              Make sales fast, track inventory across branches, manage customers and suppliers,
              and analyze growth — all from one beautiful multi-tenant platform built for modern retail.
            </p>

            <div class="welcome-animate--4 welcome-animate d-flex justify-center flex-wrap ga-3 mt-6">
              <v-btn
                color="primary"
                size="large"
                class="welcome-cta shimmer"
                @click="navigateTo('/login')"
              >
                <v-icon start>mdi-login</v-icon>
                Sign in to your workspace
              </v-btn>
              <v-btn
                variant="outlined"
                size="large"
                to="/signup"
                class="welcome-cta"
              >
                <v-icon start>mdi-domain</v-icon>
                Create a workspace
              </v-btn>
            </div>

            <div class="welcome-animate--5 welcome-animate d-flex justify-center flex-wrap ga-5 mt-6">
              <div v-for="badge in trustBadges" :key="badge.icon" class="d-flex align-center ga-2">
                <v-icon :color="badge.color" size="18">{{ badge.icon }}</v-icon>
                <span class="welcome-trust-label">{{ badge.label }}</span>
              </div>
            </div>
          </div>
        </section>

        <!-- ─── KPI stat cards ──────── -->
        <section class="stat-section">
          <div class="welcome-section-head text-center mb-5 welcome-animate--6 welcome-animate">
            <h2 class="text-h5 font-weight-bold welcome-section-title">
              <v-icon color="primary" class="mr-2">mdi-chart-arc</v-icon>
              A snapshot of what your workspace can do
            </h2>
            <p class="text-body-2 text-medium-emphasis">Live preview of the insights you get out of the box.</p>
          </div>
          <ClientOnly>
            <v-row density="compact">
              <v-col
                v-for="(stat, i) in stats"
                :key="stat.label"
                cols="12" sm="6" md="3"
              >
                <WelcomeStatCard
                  :icon="stat.icon"
                  :label="stat.label"
                  :value="stat.value"
                  :format="stat.format"
                  :decimals="stat.decimals"
                  :color="stat.color"
                  :trend="stat.trend"
                  :series="stat.series"
                  :index="i + 1"
                />
              </v-col>
            </v-row>
            <template #fallback>
              <v-row density="compact">
                <v-col v-for="i in 4" :key="i" cols="12" sm="6" md="3">
                  <v-skeleton-loader type="card" class="rounded-xl" />
                </v-col>
              </v-row>
            </template>
          </ClientOnly>
        </section>

        <!-- ─── Charts row ──────── -->
        <section class="charts-section">
          <ClientOnly>
            <v-row density="compact">
              <v-col cols="12" md="8">
                <div class="welcome-chart-card welcome-animate--1 welcome-animate">
                  <div class="d-flex align-center justify-space-between mb-2 flex-wrap ga-2">
                    <div>
                      <h3 class="text-h6 font-weight-bold welcome-section-title">
                        <v-icon color="primary" start>mdi-chart-line</v-icon>
                        Revenue overview
                      </h3>
                      <span class="text-caption text-medium-emphasis">Daily revenue for the past 7 days</span>
                    </div>
                    <v-btn-toggle v-model="chartView" density="compact" color="primary" variant="outlined">
                      <v-btn value="bar" size="small"><v-icon size="18">mdi-chart-bar</v-icon></v-btn>
                      <v-btn value="area" size="small"><v-icon size="18">mdi-chart-waterfall</v-icon></v-btn>
                    </v-btn-toggle>
                  </div>
                  <apexchart
                    :type="chartView === 'bar' ? 'bar' : 'area'"
                    height="280"
                    :options="revenueChartOptions"
                    :series="revenueSeries"
                  />
                </div>
              </v-col>
              <v-col cols="12" md="4">
                <div class="welcome-chart-card welcome-animate--2 welcome-animate">
                  <h3 class="text-h6 font-weight-bold welcome-section-title mb-1">
                    <v-icon color="secondary" start>mdi-chart-donut</v-icon>
                    Payment mix
                  </h3>
                  <span class="text-caption text-medium-emphasis mb-1 d-block">Today's receipts by method</span>
                  <apexchart type="donut" height="280" :options="paymentChartOptions" :series="paymentSeries" />
                </div>
              </v-col>
            </v-row>

            <v-row density="compact" class="mt-4">
              <v-col cols="12">
                <div class="welcome-chart-card welcome-animate--3 welcome-animate">
                  <div class="d-flex align-center justify-space-between mb-2 flex-wrap ga-2">
                    <div>
                      <h3 class="text-h6 font-weight-bold welcome-section-title">
                        <v-icon color="teal" start>mdi-chart-bar-stacked</v-icon>
                        Top products by units sold
                      </h3>
                      <span class="text-caption text-medium-emphasis">Best sellers this week</span>
                    </div>
                    <v-chip size="small" color="success" variant="tonal">Live demo</v-chip>
                  </div>
                  <apexchart type="bar" height="260" :options="topProductsOptions" :series="topProductsSeries" />
                </div>
              </v-col>
            </v-row>

            <template #fallback>
              <v-row density="compact">
                <v-col cols="12" md="8">
                  <v-skeleton-loader type="article" class="rounded-xl" />
                </v-col>
                <v-col cols="12" md="4">
                  <v-skeleton-loader type="article" class="rounded-xl" />
                </v-col>
              </v-row>
            </template>
          </ClientOnly>
        </section>

        <!-- ─── Feature pills marquee ──────── -->
        <section class="features-section">
          <h2 class="text-h6 font-weight-bold text-center welcome-section-title mb-4 welcome-animate--1 welcome-animate">
            Everything connected
          </h2>
          <div class="welcome-marquee">
            <div class="welcome-marquee-track">
              <div
                v-for="feature in marqueeFeatures"
                :key="feature.label + 'a'"
                class="welcome-marquee-pill"
              >
                <v-icon :color="feature.color" size="20" class="mr-2">{{ feature.icon }}</v-icon>
                {{ feature.label }}
              </div>
              <!-- duplicate for seamless loop -->
              <div
                v-for="feature in marqueeFeatures"
                :key="feature.label + 'b'"
                class="welcome-marquee-pill"
                aria-hidden="true"
              >
                <v-icon :color="feature.color" size="20" class="mr-2">{{ feature.icon }}</v-icon>
                {{ feature.label }}
              </div>
            </div>
          </div>
        </section>

        <!-- ─── Quick action grid ──────── -->
        <section class="quick-actions-section">
          <div class="welcome-section-head text-center mb-4 welcome-animate--1 welcome-animate">
            <h2 class="text-h5 font-weight-bold welcome-section-title">
              <v-icon color="primary" class="mr-2">mdi-lightning-bolt</v-icon>
              One platform, every tool you need
            </h2>
            <p class="text-body-2 text-medium-emphasis">Sign in to unlock all twelve modules.</p>
          </div>

          <v-row density="compact">
            <v-col v-for="(qa, i) in quickActions" :key="qa.title" cols="12" sm="6" md="3">
              <div
                class="welcome-qa-card welcome-animate welcome-animate--1"
                :style="{ animationDelay: `${0.1 + i * 0.06}s` }"
                @click="navigateTo(qa.to || '/login')"
              >
                <div class="welcome-qa-card__icon" :class="`welcome-qa-card__icon--${qa.color}`">
                  <v-icon size="22">{{ qa.icon }}</v-icon>
                </div>
                <div class="welcome-qa-card__body">
                  <div class="text-subtitle-1 font-weight-bold welcome-section-title">{{ qa.title }}</div>
                  <div class="text-body-2 text-medium-emphasis">{{ qa.subtitle }}</div>
                </div>
                <v-icon class="welcome-qa-card__arrow">mdi-arrow-right</v-icon>
              </div>
            </v-col>
          </v-row>
        </section>

        <!-- ─── How it works ──────── -->
        <section class="how-section">
          <div class="welcome-section-head text-center mb-5 welcome-animate--1 welcome-animate">
            <h2 class="text-h5 font-weight-bold welcome-section-title">
              <v-icon color="primary" class="mr-2">mdi-flag-checkered</v-icon>
              Get going in three steps
            </h2>
          </div>
          <v-row density="compact">
            <v-col v-for="(step, i) in howSteps" :key="step.title" cols="12" md="4">
              <div class="welcome-step-card welcome-animate welcome-animate--1" :style="{ animationDelay: `${0.15 + i * 0.1}s` }">
                <div class="welcome-step-card__num">{{ i + 1 }}</div>
                <div class="welcome-step-card__icon">
                  <v-icon size="28" color="white">{{ step.icon }}</v-icon>
                </div>
                <h3 class="text-h6 font-weight-bold welcome-section-title mt-3">{{ step.title }}</h3>
                <p class="text-body-2 text-medium-emphasis mt-1 mb-0">{{ step.description }}</p>
              </div>
            </v-col>
          </v-row>
        </section>

        <!-- ─── API Usage & Billing ──────── -->
        <section class="billing-section">
          <div class="welcome-section-head text-center mb-5 welcome-animate--1 welcome-animate">
            <v-chip size="small" variant="tonal" color="success" class="mb-3">
              <v-icon start size="16">mdi-credit-card-chip-outline</v-icon>
              Pay-as-you-go API billing
            </v-chip>
            <h2 class="text-h5 font-weight-bold welcome-section-title">
              <v-icon color="success" class="mr-2">mdi-transit-connection-variant</v-icon>
              Simple, metered API pricing
            </h2>
            <p class="text-body-2 text-medium-emphasis">
              Every API request is tracked automatically. You only pay for what you use —
              no upfront fees, no hidden costs.
            </p>
          </div>

          <v-row density="compact">
            <!-- Cost calculator card -->
            <v-col cols="12" md="5">
              <div class="welcome-billing-card welcome-animate--1 welcome-animate">
                <div class="d-flex align-center ga-2 mb-3">
                  <div class="welcome-coin-wrap">
                    <v-icon size="24" color="white">mdi-cash-fast</v-icon>
                  </div>
                  <div>
                    <h3 class="text-h6 font-weight-bold welcome-section-title mb-0">Cost calculator</h3>
                    <span class="text-caption text-medium-emphasis">Drag the slider to estimate your monthly bill</span>
                  </div>
                </div>

                <div class="welcome-billing-rate-banner mb-4">
                  <v-icon size="20" color="success" class="mr-2">mdi-check-circle</v-icon>
                  <span class="text-body-2 font-weight-bold">1,000 requests = $0.077 USD</span>
                </div>

                <div class="text-center mb-3">
                  <div class="welcome-billing-requests-label text-caption text-medium-emphasis mb-1">
                    Estimated monthly API requests
                  </div>
                  <div class="welcome-billing-requests-value text-h4 font-weight-bold welcome-section-title">
                    {{ billingRequests.toLocaleString() }}
                  </div>
                </div>

                <v-slider
                  v-model="billingRequests"
                  :min="1000"
                  :max="500000"
                  :step="1000"
                  color="success"
                  track-color="rgba(148,163,184,0.22)"
                  class="mb-2"
                  hide-details
                />
                <div class="d-flex justify-space-between text-caption text-medium-emphasis mb-4">
                  <span>1K</span>
                  <span>500K</span>
                </div>

                <ClientOnly>
                  <div class="welcome-cost-display">
                    <div class="welcome-cost-label text-caption text-medium-emphasis">Estimated monthly cost</div>
                    <div class="welcome-cost-value welcome-cost-pulse">
                      ${{ billingCostUsd }}
                    </div>
                    <div class="welcome-cost-sub text-body-2 text-medium-emphasis">
                      ≈ {{ billingCostUnits }} units × $0.077
                    </div>
                  </div>
                  <template #fallback>
                    <div class="welcome-cost-display">
                      <div class="welcome-cost-label text-caption text-medium-emphasis">Estimated monthly cost</div>
                      <div class="welcome-cost-value">$0.00</div>
                    </div>
                  </template>
                </ClientOnly>
              </div>
            </v-col>

            <!-- Usage analysis charts -->
            <v-col cols="12" md="7">
              <div class="welcome-billing-card welcome-animate--2 welcome-animate">
                <div class="d-flex align-center justify-space-between mb-3 flex-wrap ga-2">
                  <div>
                    <h3 class="text-h6 font-weight-bold welcome-section-title mb-0">
                      <v-icon color="primary" start>mdi-chart-areaspline</v-icon>
                      Usage analysis
                    </h3>
                    <span class="text-caption text-medium-emphasis">Daily API requests and cumulative spend over 30 days</span>
                  </div>
                  <div class="d-flex align-center ga-2">
                    <span class="welcome-live-dot" />
                    <span class="text-caption font-weight-bold text-success">Live demo</span>
                  </div>
                </div>

                <ClientOnly>
                  <apexchart
                    type="area"
                    height="180"
                    :options="usageChartOptions"
                    :series="usageSeries"
                  />

                  <v-divider class="my-4" />

                  <h4 class="text-subtitle-1 font-weight-bold welcome-section-title mb-2">
                    <v-icon color="warning" start size="18">mdi-chart-bar</v-icon>
                    Monthly bill breakdown
                  </h4>
                  <div
                    v-for="(row, i) in billingBreakdown"
                    :key="row.label"
                    class="welcome-billing-row"
                    :style="{ animationDelay: `${0.1 + i * 0.08}s` }"
                  >
                    <div class="d-flex align-center justify-space-between mb-1">
                      <span class="text-body-2 font-weight-medium">{{ row.label }}</span>
                      <span class="text-body-2 font-weight-bold" :class="row.colorClass">{{ row.value }}</span>
                    </div>
                    <div class="welcome-billing-meter">
                      <div class="welcome-billing-meter-fill" :style="{ width: row.pct + '%', animationDelay: `${0.3 + i * 0.08}s` }" />
                    </div>
                  </div>
                  <template #fallback>
                    <v-skeleton-loader type="article" class="rounded-xl" />
                  </template>
                </ClientOnly>
              </div>
            </v-col>
          </v-row>

          <!-- Pricing tiers strip -->
          <v-row density="compact" class="mt-4">
            <v-col v-for="tier in billingTiers" :key="tier.label" cols="12" sm="4">
              <div class="welcome-tier-card welcome-animate welcome-animate--1" :style="{ animationDelay: `${0.1 + tier.idx * 0.1}s` }">
                <div class="welcome-tier-card__icon" :class="`welcome-tier-card__icon--${tier.color}`">
                  <v-icon size="22">{{ tier.icon }}</v-icon>
                </div>
                <div class="text-subtitle-1 font-weight-bold welcome-section-title">{{ tier.label }}</div>
                <div class="text-h6 font-weight-bold" :class="`text-${tier.color}`">{{ tier.range }}</div>
                <div class="text-body-2 text-medium-emphasis mt-1">{{ tier.desc }}</div>
              </div>
            </v-col>
          </v-row>
        </section>

        <!-- ─── CTA ──────── -->
        <section class="cta-section welcome-animate--1 welcome-animate">
          <div class="cta-card">
            <div class="cta-card__pattern" />
            <div class="cta-card__content">
              <h2 class="text-h4 font-weight-bold mb-2 cta-title">
                Ready to run a smarter store?
              </h2>
              <p class="text-body-1 mb-4 cta-lede">
                Create your free workspace and start selling in minutes.
              </p>
              <div class="d-flex justify-center flex-wrap ga-3">
                <v-btn color="white" size="large" class="shimmer" @click="navigateTo('/signup')">
                  <v-icon start>mdi-domain</v-icon>
                  Create a workspace
                </v-btn>
                <v-btn variant="outlined" color="white" size="large" @click="navigateTo('/docs')">
                  <v-icon start>mdi-book-open-page-variant-outline</v-icon>
                  Read the docs
                </v-btn>
              </div>
            </div>
          </div>
        </section>

        <!-- ─── Footer ──────── -->
        <footer class="welcome-footer welcome-animate--1 welcome-animate">
          <span class="text-body-2">&copy; {{ new Date().getFullYear() }} DomendraPOS — Multi-tenant SaaS Point-of-Sale Platform.</span>
          <div class="d-flex ga-2 mt-1 justify-center">
            <v-btn size="small" variant="text" to="/login">Sign in</v-btn>
            <v-btn size="small" variant="text" to="/docs">Documentation</v-btn>
            <v-btn size="small" variant="text" to="/signup">Get started</v-btn>
          </div>
        </footer>
      </v-container>

      <!-- Auto-redirect hint for authenticated users -->
      <v-snackbar v-model="showRedirect" :timeout="1800" location="top">
        <span class="d-flex align-center ga-2">
          <v-progress-circular indeterminate size="16" width="2" />
          Taking you to your dashboard…
        </span>
      </v-snackbar>
    </v-main>
  </v-app>
</template>

<script setup lang="ts">
import type { ApexOptions } from 'apexcharts'

definePageMeta({ layout: false })

useHead({
  title: 'DomendraPOS — Point of Sale, reimagined',
  meta: [
    { name: 'description', content: 'The complete multi-tenant Point-of-Sale platform for modern retail — POS, inventory, accounting, analytics, and more.' },
  ],
})

// ────────────── Auto-redirect for authenticated users ──────────────
const accessToken = useCookie('access_token')
const showRedirect = ref(false)

onMounted(() => {
  if (!accessToken.value) return // stay on welcome screen for guests

  // Decode JWT to check role
  let role = ''
  try {
    const parts = accessToken.value.split('.')
    if (parts.length >= 2) {
      const payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')))
      role = payload.role || ''
    }
  } catch { /* malformed — hand off to middleware */ }

  // Show redirect snackbar first so the user sees the welcome screen briefly
  showRedirect.value = true
  setTimeout(() => {
    navigateTo(role === 'super_admin' ? '/superadmin' : '/dashboard')
  }, 1500)
})

// ────────────── Sample chart data ──────────────
const chartView = ref<'bar' | 'area'>('bar')

const revenueData = [62000, 71000, 58000, 84000, 76000, 98000, 81000]
const txnData    = [310, 342, 295, 348, 320, 380, 351]
const dayLabels  = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

const revenueSeries = computed(() => [
  { name: 'Revenue (KSh)', type: chartView.value === 'bar' ? 'bar' : 'area', data: revenueData },
  { name: 'Transactions', type: chartView.value === 'bar' ? 'bar' : 'line', data: txnData },
])

const revenueChartOptions = computed<ApexOptions>(() => ({
  chart: {
    type: 'bar',
    fontFamily: 'Segoe UI, Roboto, sans-serif',
    toolbar: { show: false },
    animations: { enabled: true, speed: 900 },
    background: 'transparent',
  },
  colors: ['#3478f6', '#f59e0b'],
  plotOptions: { bar: { borderRadius: 6, columnWidth: '55%' } },
  stroke: { width: chartView.value === 'area' ? [0, 3] : [0, 0], curve: 'smooth' },
  fill: {
    type: chartView.value === 'area' ? ['gradient', 'solid'] : ['solid', 'solid'],
    gradient: { shadeIntensity: 1, opacityFrom: 0.35, opacityTo: 0.05, stops: [0, 100] },
  },
  dataLabels: { enabled: false },
  xaxis: { categories: dayLabels, labels: { style: { fontSize: '13px' } } },
  yaxis: [
    { labels: { formatter: (v: number) => `${(v / 1000).toFixed(0)}k` }, title: { text: 'Revenue', style: { fontSize: '12px' } } },
    { opposite: true, labels: { formatter: (v: number) => v.toString() }, title: { text: 'Txns', style: { fontSize: '12px' } } },
  ],
  legend: { position: 'top', fontSize: '13px' },
  tooltip: { y: { formatter: (v: number) => v.toLocaleString() } },
  grid: { borderColor: 'rgba(148, 163, 184, 0.18)', strokeDashArray: 4 },
}))

const paymentSeries = [1240000, 920000, 460000, 80000]
const paymentLabels = ['Cash', 'M-Pesa', 'Card', 'Credit']

const paymentChartOptions = computed<ApexOptions>(() => ({
  chart: {
    type: 'donut',
    fontFamily: 'Segoe UI, Roboto, sans-serif',
    toolbar: { show: false },
    animations: { enabled: true, speed: 900 },
    background: 'transparent',
  },
  labels: paymentLabels,
  colors: ['#22c55e', '#f59e0b', '#3478f6', '#8b5cf6'],
  stroke: { width: 0, colors: ['#ffffff'] },
  dataLabels: { enabled: true, style: { fontSize: '13px' }, dropShadow: { enabled: false } },
  plotOptions: {
    pie: {
      donut: {
        size: '68%',
        labels: {
          show: true,
          name: { fontSize: '14px', fontWeight: 600 },
          total: {
            show: true,
            label: 'Total',
            fontSize: '13px',
            formatter: () => 'KSh 2.7M',
          },
        },
      },
    },
  },
  legend: { position: 'bottom', fontSize: '13px' },
  tooltip: { y: { formatter: (v: number) => `KSh ${v.toLocaleString()}` } },
}))

const topProductsSeries = [{ name: 'Units', data: [320, 280, 240, 190, 160, 140, 110, 80] }]
const topProductCats = ['Coca-Cola 500ml', 'Bread Loaf', 'Milk 1L', 'Sugar 1kg', 'Rice 2kg', 'Cooking Oil', 'Eggs (tray)', 'Tea 100pk']

const topProductsOptions = computed<ApexOptions>(() => ({
  chart: {
    type: 'bar',
    fontFamily: 'Segoe UI, Roboto, sans-serif',
    toolbar: { show: false },
    animations: { enabled: true, speed: 900 },
    background: 'transparent',
  },
  colors: ['#0d9488'],
  plotOptions: { bar: { borderRadius: 6, horizontal: true, barHeight: '62%', distributed: false } },
  dataLabels: { enabled: false },
  xaxis: {
    categories: topProductCats,
    labels: { style: { fontSize: '13px' } },
  },
  yaxis: { labels: { style: { fontSize: '13px' } } },
  grid: { borderColor: 'rgba(148, 163, 184, 0.18)', strokeDashArray: 4 },
  tooltip: { y: { formatter: (v: number) => `${v} units` } },
}))

// ────────────── KPI stat cards ──────────────
const stats = [
  {
    icon: 'mdi-cash-multiple', label: "Today's Revenue", value: 84250, format: 'currency', color: 'primary', trend: 12.4,
    series: [{ name: 'Revenue', data: [62, 71, 58, 84, 76, 98, 81] }],
  },
  {
    icon: 'mdi-shopping-outline', label: 'Transactions', value: 348, format: 'number', color: 'success', trend: 5.1,
    series: [{ name: 'Txns', data: [310, 342, 295, 348, 320, 380, 351] }],
  },
  {
    icon: 'mdi-currency-usd', label: 'Avg. Order', value: 242, format: 'currency', color: 'warning', trend: -2.3,
    series: [{ name: 'AOV', data: [210, 215, 205, 242, 238, 258, 231] }],
  },
  {
    icon: 'mdi-package-variant-closed', label: 'Active Products', value: 1248, format: 'number', color: 'secondary', trend: 3.8,
    series: [{ name: 'Products', data: [1180, 1198, 1210, 1220, 1232, 1240, 1248] }],
  },
]

// ────────────── Marquee features ──────────────
const marqueeFeatures = [
  { label: 'POS Terminal', icon: 'mdi-cart-outline', color: 'primary' },
  { label: 'Inventory', icon: 'mdi-warehouse-outline', color: 'warning' },
  { label: 'Products', icon: 'mdi-package-variant-closed', color: 'success' },
  { label: 'Customers', icon: 'mdi-account-group-outline', color: 'info' },
  { label: 'Suppliers', icon: 'mdi-truck-delivery-outline', color: 'secondary' },
  { label: 'Reports', icon: 'mdi-chart-box-outline', color: 'teal' },
  { label: 'Analytics', icon: 'mdi-chart-multiple', color: 'primary' },
  { label: 'Accounting', icon: 'mdi-calculator-variant-outline', color: 'success' },
  { label: 'Branches', icon: 'mdi-source-branch', color: 'info' },
  { label: 'RBAC', icon: 'mdi-shield-account-outline', color: 'error' },
  { label: 'Audit Logs', icon: 'mdi-history', color: 'warning' },
  { label: 'API Billing', icon: 'mdi-credit-card-chip-outline', color: 'secondary' },
]

// ────────────── Quick actions ──────────────
const quickActions = [
  { title: 'Make a sale', subtitle: 'Scan, tap, and print receipts in seconds', icon: 'mdi-cart-arrow-down', color: 'primary', to: '/login' },
  { title: 'Track inventory', subtitle: 'Live stock levels, ABC analysis, low-stock alerts', icon: 'mdi-clipboard-list-outline', color: 'warning', to: '/login' },
  { title: 'Analyze growth', subtitle: 'Trends, top products, and peak hours at a glance', icon: 'mdi-chart-line', color: 'success', to: '/login' },
  { title: 'Manage staff', subtitle: 'Role-based access, shifts, and audit trails', icon: 'mdi-account-tie-outline', color: 'error', to: '/login' },
  { title: 'Serve customers', subtitle: 'Loyalty, store credit, and purchase history', icon: 'mdi-handshake-outline', color: 'info', to: '/login' },
  { title: 'Buy smarter', subtitle: 'Purchase orders, receive goods, track payables', icon: 'mdi-clipboard-text-clock-outline', color: 'secondary', to: '/login' },
  { title: 'Keep accurate books', subtitle: 'Chart of accounts, journals, VAT, statements', icon: 'mdi-calculator-variant-outline', color: 'teal', to: '/login' },
  { title: 'Scale branches', subtitle: 'Branch sync, transfers, and consolidated reports', icon: 'mdi-source-branch', color: 'primary', to: '/login' },
]

// ────────────── How it works ──────────────
const howSteps = [
  {
    title: 'Create your workspace',
    description: 'Sign up with your email, set your currency, and invite your team. Your tenant is provisioned instantly.',
    icon: 'mdi-domain',
  },
  {
    title: 'Add products and stock',
    description: 'Use the bulk Excel import to load your catalog and set opening stock levels for each branch.',
    icon: 'mdi-package-variant-closed',
  },
  {
    title: 'Start selling',
    description: 'Open the POS terminal, take cash, M-Pesa, or card payments, and watch your dashboard update live.',
    icon: 'mdi-point-of-sale',
  },
]

// ────────────── Trust badges ──────────────
const trustBadges = [
  { label: 'No credit card required', icon: 'mdi-check-decagram', color: 'success' },
  { label: 'Multi-branch', icon: 'mdi-source-branch', color: 'primary' },
  { label: 'Take a guided tour', icon: 'mdi-map-marker-path', color: 'warning' },
]

// ────────────── API Usage Billing ──────────────
const RATE_PER_1000 = 0.077 // USD per 1,000 requests

const billingRequests = ref(50000) // slider value, 1K–500K

const billingCostUnits = computed(() => (billingRequests.value / 1000).toFixed(1))
const billingCostUsd = computed(() => {
  const cost = (billingRequests.value / 1000) * RATE_PER_1000
  return cost < 1 ? cost.toFixed(4) : cost < 100 ? cost.toFixed(2) : cost.toFixed(2)
})

// Simulated daily usage over 30 days
const usageDays = Array.from({ length: 30 }, (_, i) => {
  const base = 1200 + Math.sin(i / 3) * 400 + i * 30
  return Math.round(base + Math.random() * 200)
})
const usageLabels = Array.from({ length: 30 }, (_, i) => `${i + 1}`)
const usageCumulativeCost = usageDays.reduce<number[]>((acc, v, i) => {
  const prev = i > 0 ? acc[i - 1] : 0
  acc.push(prev + (v / 1000) * RATE_PER_1000)
  return acc
}, [])

const usageSeries = computed(() => [
  { name: 'API Requests', data: usageDays },
  { name: 'Cumulative $', data: usageCumulativeCost.map((v) => Number(v.toFixed(4))) },
])

const usageChartOptions = computed<ApexOptions>(() => ({
  chart: {
    type: 'area',
    fontFamily: 'Segoe UI, Roboto, sans-serif',
    toolbar: { show: false },
    animations: { enabled: true, speed: 900 },
    background: 'transparent',
  },
  colors: ['#22c55e', '#f59e0b'],
  stroke: { width: [2, 2], curve: 'smooth' },
  fill: {
    type: 'gradient',
    gradient: { shadeIntensity: 1, opacityFrom: 0.3, opacityTo: 0.05, stops: [0, 100] },
  },
  dataLabels: { enabled: false },
  xaxis: { categories: usageLabels, labels: { style: { fontSize: '11px' } }, tickAmount: 6 },
  yaxis: [
    { labels: { formatter: (v: number) => `${v.toLocaleString()}` }, title: { text: 'Requests', style: { fontSize: '11px' } } },
    { opposite: true, labels: { formatter: (v: number) => `$${v.toFixed(2)}` }, title: { text: 'Cumulative $', style: { fontSize: '11px' } } },
  ],
  legend: { position: 'top', fontSize: '12px' },
  tooltip: { y: { formatter: (v: number, opts?: { seriesIndex?: number }) => opts?.seriesIndex === 1 ? `$${v.toFixed(4)}` : v.toLocaleString() } },
  grid: { borderColor: 'rgba(148, 163, 184, 0.18)', strokeDashArray: 4 },
}))

const billingBreakdown = computed(() => {
  const total = billingRequests.value
  // hypothetical split: POS 42%, Inventory 23%, Reports 18%, Auth 10%, Other 7%
  const splits = [
    { label: 'POS Terminal', pct: 42, colorClass: 'text-primary' },
    { label: 'Inventory',    pct: 23, colorClass: 'text-warning' },
    { label: 'Reports',      pct: 18, colorClass: 'text-success' },
    { label: 'Auth & RBAC',   pct: 10, colorClass: 'text-info' },
    { label: 'Other',        pct: 7,  colorClass: 'text-secondary' },
  ]
  return splits.map((s) => ({
    ...s,
    value: `${(total * s.pct / 100).toLocaleString()} req → $${((total * s.pct / 100) / 1000 * RATE_PER_1000).toFixed(4)}`,
  }))
})

const billingTiers = [
  { idx: 0, label: 'Starter',   range: '< 10K req/mo',   icon: 'mdi-rocket-launch-outline',  color: 'success', desc: 'Perfect for a single branch just getting started with POS.' },
  { idx: 1, label: 'Growing',   range: '10K–100K req/mo', icon: 'mdi-trending-up',            color: 'primary', desc: 'Ideal for multi-branch retailers with steady API traffic.' },
  { idx: 2, label: 'Enterprise', range: '> 100K req/mo',  icon: 'mdi-domain',                color: 'secondary', desc: 'Volume pricing available. Contact us for custom rates.' },
]

</script>

<style>
@import "~/assets/css/welcome-animations.css";

html, body, #__nuxt { height: 100%; }

.welcome-app {
  background: #f8fafc;
  min-height: 100vh;
}
.welcome-main {
  padding: 0 !important;
  position: relative;
  z-index: 1;
}

/* Top bar */
.welcome-topbar {
  position: relative; z-index: 3;
  max-width: 1400px; margin: 0 auto;
  padding: 18px 24px;
  display: flex; align-items: center; justify-content: space-between;
}
.welcome-logo {
  width: 44px; height: 44px; border-radius: 12px;
  display: flex; align-items: center; justify-content: center;
  background: linear-gradient(135deg, #3478f6 0%, #1a5fd0 100%);
  box-shadow: 0 8px 24px rgba(52, 120, 246, 0.35), inset 0 1px 0 rgba(255, 255, 255, 0.25);
}
.welcome-brand {
  font-size: 1.35rem; font-weight: 800; color: #0f172a; letter-spacing: -0.02em;
}

.welcome-container {
  max-width: 1280px; margin: 0 auto;
  padding: 24px 24px 48px;
  position: relative; z-index: 2;
}

/* Hero */
.hero-section { padding: 48px 0 32px; }
.hero-title {
  font-size: clamp(2.2rem, 5vw, 3.6rem);
  font-weight: 800;
  color: #0f172a;
  letter-spacing: -0.03em;
  line-height: 1.1;
  margin: 0 0 18px;
}
.hero-lede {
  font-size: clamp(1rem, 1.8vw, 1.25rem);
  color: #475569;
  max-width: 640px;
  margin: 0 auto;
  line-height: 1.6;
}
.welcome-trust-label { font-size: 13px; color: #475569; font-weight: 600; }

/* CTA shimmer */
.welcome-cta {
  border-radius: 12px;
  font-weight: 700;
  letter-spacing: 0.01em;
}
.shimmer { position: relative; overflow: hidden; }
.shimmer::before {
  content: ''; position: absolute; inset: 0;
  background: linear-gradient(110deg, transparent 0%, rgba(255, 255, 255, 0.55) 50%, transparent 100%);
  transform: translateX(-150%);
  animation: welcome-shimmer 3s ease-in-out infinite;
  pointer-events: none;
  z-index: 1;
}

/* Sections */
.stat-section          { padding: 16px 0 24px; }
.charts-section        { padding: 8px 0 24px; }
.features-section      { padding: 24px 0 16px; }
.quick-actions-section { padding: 16px 0 0; }
.how-section           { padding: 32px 0; }
.cta-section           { padding: 24px 0 16px; }

.welcome-section-title { color: #0f172a; }
.welcome-section-head  { max-width: 640px; margin: 0 auto; }

/* Chart cards */
.welcome-chart-card {
  background: rgba(255, 255, 255, 0.82);
  backdrop-filter: blur(14px) saturate(140%);
  -webkit-backdrop-filter: blur(14px) saturate(140%);
  border: 1px solid rgba(255, 255, 255, 0.75);
  border-radius: 20px;
  padding: 20px 22px;
  box-shadow: 0 8px 28px rgba(15, 23, 42, 0.06), inset 0 1px 0 rgba(255, 255, 255, 0.7);
  height: 100%;
  transition: transform 0.25s ease, box-shadow 0.25s ease;
}
.welcome-chart-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 14px 36px rgba(15, 23, 42, 0.10), inset 0 1px 0 rgba(255, 255, 255, 0.85);
}

/* Marquee */
.welcome-marquee {
  overflow: hidden; max-width: 100%;
  -webkit-mask-image: linear-gradient(90deg, transparent, #000 8%, #000 92%, transparent);
  mask-image: linear-gradient(90deg, transparent, #000 8%, #000 92%, transparent);
}
.welcome-marquee-track {
  display: flex; gap: 12px; width: max-content;
  animation: welcome-marquee 32s linear infinite;
}
.welcome-marquee-pill {
  display: inline-flex; align-items: center;
  padding: 10px 18px;
  background: rgba(255, 255, 255, 0.85);
  border: 1px solid rgba(203, 213, 225, 0.55);
  border-radius: 9999px;
  font-size: 14px; font-weight: 600; color: #334155;
  white-space: nowrap;
  box-shadow: 0 4px 12px rgba(15, 23, 42, 0.04);
  flex-shrink: 0;
}

/* Quick action cards */
.welcome-qa-card {
  display: flex; align-items: center; gap: 14px;
  padding: 18px 20px;
  background: rgba(255, 255, 255, 0.82);
  backdrop-filter: blur(12px) saturate(140%);
  -webkit-backdrop-filter: blur(12px) saturate(140%);
  border: 1px solid rgba(255, 255, 255, 0.75);
  border-radius: 18px;
  box-shadow: 0 6px 20px rgba(15, 23, 42, 0.05);
  cursor: pointer;
  transition: transform 0.2s cubic-bezier(0.22, 1, 0.36, 1), box-shadow 0.2s ease;
  height: 100%;
}
.welcome-qa-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 12px 30px rgba(15, 23, 42, 0.10);
}
.welcome-qa-card__icon {
  width: 48px; height: 48px; border-radius: 14px;
  display: flex; align-items: center; justify-content: center;
  color: white; flex-shrink: 0;
}
.welcome-qa-card__icon--primary   { background: linear-gradient(135deg, #3478f6, #1a5fd0); box-shadow: 0 6px 14px rgba(52, 120, 246, 0.30); }
.welcome-qa-card__icon--success   { background: linear-gradient(135deg, #22c55e, #16a34a); box-shadow: 0 6px 14px rgba(34, 197, 94, 0.30); }
.welcome-qa-card__icon--warning   { background: linear-gradient(135deg, #f59e0b, #d97706); box-shadow: 0 6px 14px rgba(245, 158, 11, 0.30); }
.welcome-qa-card__icon--error     { background: linear-gradient(135deg, #ef4444, #dc2626); box-shadow: 0 6px 14px rgba(239, 68, 68, 0.30); }
.welcome-qa-card__icon--info      { background: linear-gradient(135deg, #3b82f6, #2563eb); box-shadow: 0 6px 14px rgba(59, 130, 246, 0.30); }
.welcome-qa-card__icon--secondary { background: linear-gradient(135deg, #8b5cf6, #7c3aed); box-shadow: 0 6px 14px rgba(139, 92, 246, 0.30); }
.welcome-qa-card__icon--teal      { background: linear-gradient(135deg, #14b8a6, #0d9488); box-shadow: 0 6px 14px rgba(20, 184, 166, 0.30); }
.welcome-qa-card__body { flex: 1; }
.welcome-qa-card__arrow { color: rgba(71, 85, 105, 0.4); transition: transform 0.2s ease, color 0.2s ease; }
.welcome-qa-card:hover .welcome-qa-card__arrow { transform: translateX(4px); color: #3478f6; }

/* How it works */
.welcome-step-card {
  position: relative;
  text-align: center;
  padding: 32px 24px 24px;
  background: rgba(255, 255, 255, 0.82);
  backdrop-filter: blur(12px) saturate(140%);
  -webkit-backdrop-filter: blur(12px) saturate(140%);
  border: 1px solid rgba(255, 255, 255, 0.75);
  border-radius: 20px;
  box-shadow: 0 6px 20px rgba(15, 23, 42, 0.05);
  height: 100%;
  transition: transform 0.25s ease, box-shadow 0.25s ease;
}
.welcome-step-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 14px 36px rgba(15, 23, 42, 0.10);
}
.welcome-step-card__num {
  position: absolute; top: 16px; right: 18px;
  font-size: 48px; font-weight: 900;
  color: rgba(52, 120, 246, 0.12);
  line-height: 1;
}
.welcome-step-card__icon {
  width: 64px; height: 64px; border-radius: 18px;
  margin: 0 auto;
  display: flex; align-items: center; justify-content: center;
  background: linear-gradient(135deg, #3478f6, #1a5fd0);
  box-shadow: 0 8px 20px rgba(52, 120, 246, 0.30);
}

/* API Usage & Billing section */
.billing-section             { padding: 32px 0; }
.welcome-billing-card {
  background: rgba(255, 255, 255, 0.82);
  backdrop-filter: blur(14px) saturate(140%);
  -webkit-backdrop-filter: blur(14px) saturate(140%);
  border: 1px solid rgba(255, 255, 255, 0.75);
  border-radius: 20px;
  padding: 24px;
  box-shadow: 0 8px 28px rgba(15, 23, 42, 0.06), inset 0 1px 0 rgba(255, 255, 255, 0.7);
  height: 100%;
  transition: transform 0.25s ease, box-shadow 0.25s ease;
}
.welcome-billing-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 14px 36px rgba(15, 23, 42, 0.10);
}
.welcome-coin-wrap {
  width: 44px; height: 44px; border-radius: 12px;
  display: flex; align-items: center; justify-content: center;
  background: linear-gradient(135deg, #22c55e, #16a34a);
  box-shadow: 0 6px 14px rgba(34, 197, 94, 0.30);
}
.welcome-billing-rate-banner {
  display: flex; align-items: center;
  padding: 10px 14px;
  background: linear-gradient(90deg, rgba(34, 197, 94, 0.08), rgba(34, 197, 94, 0.02));
  border: 1px solid rgba(34, 197, 94, 0.20);
  border-radius: 12px;
}
.welcome-billing-requests-value {
  font-size: 2rem;
  line-height: 1.2;
}
.welcome-cost-display {
  text-align: center;
  padding: 20px 16px;
  background: linear-gradient(135deg, rgba(34, 197, 94, 0.06), rgba(34, 197, 94, 0.01));
  border: 1px solid rgba(34, 197, 94, 0.15);
  border-radius: 16px;
}
.welcome-cost-value {
  font-size: 2.2rem; font-weight: 800;
  color: #16a34a;
  line-height: 1.2;
  animation: welcome-cost-pulse 2.5s ease-in-out infinite;
}
.welcome-cost-sub {
  margin-top: 4px;
}

/* Live dot */
.welcome-live-dot {
  position: relative;
  width: 8px; height: 8px; border-radius: 50%;
  background: #22c55e;
  flex-shrink: 0;
}
.welcome-live-dot::before {
  content: ''; position: absolute; inset: 0; border-radius: 50%;
  background: #22c55e;
  animation: welcome-ripple 1.5s ease-out infinite;
}

/* Billing breakdown rows */
.welcome-billing-row {
  animation: welcome-row-in 0.5s cubic-bezier(0.22, 1, 0.36, 1) forwards;
  opacity: 0;
  margin-bottom: 10px;
}
.welcome-billing-meter {
  height: 8px; border-radius: 9999px;
  background: rgba(148, 163, 184, 0.18);
  overflow: hidden;
}
.welcome-billing-meter-fill {
  height: 100%; border-radius: 9999px;
  background: linear-gradient(90deg, #3478f6, #22c55e, #f59e0b);
  animation: welcome-meter-fill 0.8s cubic-bezier(0.22, 1, 0.36, 1) forwards;
  width: 0%;
}

/* Pricing tier cards */
.welcome-tier-card {
  text-align: center;
  padding: 22px 18px;
  background: rgba(255, 255, 255, 0.82);
  backdrop-filter: blur(12px) saturate(140%);
  -webkit-backdrop-filter: blur(12px) saturate(140%);
  border: 1px solid rgba(255, 255, 255, 0.75);
  border-radius: 18px;
  box-shadow: 0 6px 20px rgba(15, 23, 42, 0.05);
  height: 100%;
  transition: transform 0.25s ease, box-shadow 0.25s ease;
}
.welcome-tier-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 14px 36px rgba(15, 23, 42, 0.10);
}
.welcome-tier-card__icon {
  width: 48px; height: 48px; border-radius: 14px;
  margin: 0 auto 12px;
  display: flex; align-items: center; justify-content: center;
  color: white;
}
.welcome-tier-card__icon--success   { background: linear-gradient(135deg, #22c55e, #16a34a); box-shadow: 0 6px 14px rgba(34, 197, 94, 0.30); }
.welcome-tier-card__icon--primary   { background: linear-gradient(135deg, #3478f6, #1a5fd0); box-shadow: 0 6px 14px rgba(52, 120, 246, 0.30); }
.welcome-tier-card__icon--secondary { background: linear-gradient(135deg, #8b5cf6, #7c3aed); box-shadow: 0 6px 14px rgba(139, 92, 246, 0.30); }

/* Dark mode: billing section */
:global(.v-theme--dark) .welcome-billing-card,
:global(.v-theme--dark) .welcome-tier-card {
  background: rgba(43, 43, 43, 0.72);
  border-color: rgba(255, 255, 255, 0.10);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.30);
}
:global(.v-theme--dark) .welcome-billing-rate-banner {
  background: linear-gradient(90deg, rgba(34, 197, 94, 0.10), rgba(34, 197, 94, 0.02));
  border-color: rgba(34, 197, 94, 0.20);
}
:global(.v-theme--dark) .welcome-cost-display {
  background: linear-gradient(135deg, rgba(34, 197, 94, 0.08), rgba(34, 197, 94, 0.01));
  border-color: rgba(34, 197, 94, 0.15);
}
:global(.v-theme--dark) .welcome-billing-meter {
  background: rgba(255, 255, 255, 0.08);
}

/* CTA section */
.cta-card {
  position: relative;
  overflow: hidden;
  border-radius: 28px;
  padding: 56px 32px;
  background: linear-gradient(135deg, #1a5fd0 0%, #3478f6 45%, #7c3aed 100%);
  text-align: center;
  box-shadow: 0 20px 60px rgba(52, 120, 246, 0.35);
}
.cta-card__pattern {
  position: absolute; inset: 0; opacity: 0.15;
  background-image:
    radial-gradient(circle at 20% 30%, rgba(255, 255, 255, 0.4) 0%, transparent 25%),
    radial-gradient(circle at 80% 70%, rgba(255, 255, 255, 0.3) 0%, transparent 25%);
}
.cta-card__content { position: relative; z-index: 1; }
.cta-title { color: #ffffff; }
.cta-lede  { color: rgba(255, 255, 255, 0.92); }

/* Footer */
.welcome-footer {
  text-align: center; padding: 24px 0 8px;
  color: #64748b;
}

/* Dark mode: dim the white glass cards */
:global(.v-theme--dark) .welcome-app { background: #1f1f1f; }
:global(.v-theme--dark) .welcome-brand { color: #ffffff; }
:global(.v-theme--dark) .welcome-section-title { color: #ffffff; }
:global(.v-theme--dark) .hero-title { color: #ffffff; }
:global(.v-theme--dark) .hero-lede { color: rgba(255, 255, 255, 0.78); }
:global(.v-theme--dark) .welcome-trust-label { color: rgba(255, 255, 255, 0.72); }
:global(.v-theme--dark) .wstat-card,
:global(.v-theme--dark) .welcome-chart-card,
:global(.v-theme--dark) .welcome-qa-card,
:global(.v-theme--dark) .welcome-step-card {
  background: rgba(43, 43, 43, 0.72);
  border-color: rgba(255, 255, 255, 0.10);
  color: #fff;
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.30);
}
:global(.v-theme--dark) .wstat-card__value { color: #ffffff; }
:global(.v-theme--dark) .wstat-card__label { color: rgba(255, 255, 255, 0.6); }
:global(.v-theme--dark) .welcome-bg__base {
  background:
    radial-gradient(ellipse 80% 60% at 20% 15%, rgba(76, 194, 255, 0.18), transparent 70%),
    radial-gradient(ellipse 70% 55% at 85% 20%, rgba(180, 160, 255, 0.16), transparent 70%),
    radial-gradient(ellipse 90% 70% at 50% 95%, rgba(79, 217, 196, 0.14), transparent 70%),
    linear-gradient(180deg, #1f1f1f 0%, #2b2b2b 60%, #252541 100%);
}
:global(.v-theme--dark) .welcome-bg__grid {
  background-image:
    linear-gradient(rgba(255, 255, 255, 0.04) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255, 255, 255, 0.04) 1px, transparent 1px);
}
:global(.v-theme--dark) .welcome-marquee-pill {
  background: rgba(43, 43, 43, 0.82);
  border-color: rgba(255, 255, 255, 0.10);
  color: #fff;
}
:global(.v-theme--dark) .welcome-footer { color: rgba(255, 255, 255, 0.6); }
</style>
