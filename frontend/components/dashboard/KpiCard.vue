<template>
  <component
    :is="to ? NuxtLink : 'div'"
    :to="to"
    class="kpi-card"
    :class="{ 'kpi-card--clickable': !!to }"
  >
    <div class="kpi-card__top">
      <span class="kpi-card__label">{{ label }}</span>
      <GradientIcon :icon="icon" :color="color" />
    </div>
    <div class="kpi-card__value" :class="valueClass">
      <CountUpText :value="value" :format="format" :decimals="decimals" />
    </div>
    <div v-if="trend !== undefined" class="kpi-card__trend" :class="trend >= 0 ? 'kpi-card__trend--up' : 'kpi-card__trend--down'">
      <v-icon size="14">{{ trend >= 0 ? 'mdi-trending-up' : 'mdi-trending-down' }}</v-icon>
      <span>{{ Math.abs(trend).toFixed(1) }}% vs prev</span>
    </div>
    <div v-else-if="subtext" class="kpi-card__subtext">{{ subtext }}</div>
    <div v-if="sparklineSeries && sparklineSeries[0]?.data?.length" class="kpi-card__spark">
      <apexchart type="area" height="40" :options="sparkOptions" :series="sparklineSeries" />
    </div>
  </component>
</template>

<script setup lang="ts">
import type { PropType } from 'vue'
import type { ApexOptions } from 'apexcharts'

const NuxtLink = resolveComponent('NuxtLink')

interface SparkSeries {
  name: string
  data: number[]
}

type KpiColor = 'primary' | 'success' | 'warning' | 'error' | 'info' | 'secondary' | 'teal' | 'rose' | 'amber' | 'indigo'
type KpiFormat = 'currency' | 'number' | 'percent' | 'none'

const props = defineProps({
  icon: { type: String, required: true },
  label: { type: String, required: true },
  value: { type: Number, default: 0 },
  format: { type: String as PropType<KpiFormat>, default: 'none' },
  decimals: { type: Number, default: 0 },
  color: { type: String as PropType<KpiColor>, default: 'primary' },
  trend: { type: Number, default: undefined },
  subtext: { type: String, default: '' },
  valueClass: { type: String, default: '' },
  to: { type: String, default: '' },
  sparklineSeries: { type: Array as PropType<SparkSeries[]>, default: () => [] },
})

const { currency } = useFormat()
const { colors } = useChartTheme()

const sparkOptions = computed<ApexOptions>(() => ({
  chart: {
    type: 'area',
    sparkline: { enabled: true },
    animations: { enabled: true },
    background: 'transparent',
    foreColor: 'transparent',
    fontFamily: '"Segoe UI Variable", Inter, system-ui, sans-serif',
  },
  colors: [`rgb(${colors.value.primary})`],
  stroke: { curve: 'smooth', width: 2 },
  fill: {
    type: 'gradient',
    gradient: {
      shadeIntensity: 1,
      opacityFrom: 0.35,
      opacityTo: 0,
      stops: [0, 100],
    },
  },
  tooltip: {
    fixed: { enabled: false },
    y: { formatter: (v: number) => currency(v) },
  },
}))
</script>

<style scoped>
.kpi-card {
  padding: 18px 20px;
  border-radius: 16px;
  background: rgb(var(--v-theme-surface));
  border: 1px solid rgba(var(--v-theme-on-surface), 0.08);
  transition: box-shadow 0.2s ease, transform 0.2s ease;
  text-decoration: none;
  color: inherit;
  display: block;
}
.kpi-card--clickable { cursor: pointer; }
.kpi-card--clickable:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
}
.kpi-card__top {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 8px;
}
.kpi-card__label {
  font-size: 0.6875rem;
  color: rgba(var(--v-theme-on-surface), 0.5);
  text-transform: uppercase;
  letter-spacing: 0.06em;
  font-weight: 600;
}
.kpi-card__value {
  font-size: 1.5rem;
  font-weight: 800;
  letter-spacing: -0.02em;
  margin: 0 0 4px;
  line-height: 1.2;
}
.kpi-card__subtext,
.kpi-card__trend {
  font-size: 0.75rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 4px;
  margin-top: 4px;
}
.kpi-card__subtext { color: rgba(var(--v-theme-on-surface), 0.4); font-weight: 500; }
.kpi-card__trend--up { color: rgb(var(--v-theme-success)); }
.kpi-card__trend--down { color: rgb(var(--v-theme-error)); }
.kpi-card__spark { margin-top: 6px; margin-bottom: -6px; overflow: hidden; max-width: 100%; }
.kpi-card__spark :deep(.apexcharts-svg) { overflow: hidden; max-width: 100%; }
</style>
