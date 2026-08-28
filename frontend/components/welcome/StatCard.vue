<template>
  <div class="wstat-card" :class="[`wstat-card--${color}`, animationClass]">
    <div class="wstat-card__top">
      <div class="wstat-card__icon">
        <v-icon size="22">{{ icon }}</v-icon>
      </div>
      <div v-if="trend !== undefined" class="wstat-card__trend" :class="trend >= 0 ? 'wstat-card__trend--up' : 'wstat-card__trend--down'">
        <v-icon size="14">{{ trend >= 0 ? 'mdi-trending-up' : 'mdi-trending-down' }}</v-icon>
        <span>{{ Math.abs(trend).toFixed(1) }}%</span>
      </div>
    </div>
    <div class="wstat-card__value">
      <CountUpText :value="value" :format="format" :decimals="decimals" :duration="1200" />
    </div>
    <div class="wstat-card__label">{{ label }}</div>

    <!-- Mini sparkline -->
    <div v-if="series && series.length" class="wstat-card__spark">
      <apexchart type="area" height="42" :options="sparkOptions" :series="series" />
    </div>
  </div>
</template>

<script setup lang="ts">
import type { ApexOptions } from 'apexcharts'

type Color = 'primary' | 'success' | 'warning' | 'error' | 'info' | 'secondary' | 'teal'
type KpiFormat = 'currency' | 'number' | 'percent' | 'none'

const props = withDefaults(defineProps<{
  icon: string
  label: string
  value: number
  format?: KpiFormat
  decimals?: number
  color?: Color
  trend?: number
  series?: { name: string; data: number[] }[]
  index?: number
}>(), {
  format: 'none',
  decimals: 0,
  color: 'primary',
  index: 0,
})

const colorRgb: Record<Color, string> = {
  primary: '52, 120, 246',
  success: '34, 197, 94',
  warning: '245, 158, 11',
  error: '239, 68, 68',
  info: '59, 130, 246',
  secondary: '139, 92, 246',
  teal: '13, 148, 136',
}

const animationClass = computed(() => {
  const i = Math.min(Math.max(props.index, 1), 8)
  return `welcome-animate--${i}`
})

const sparkOptions = computed<ApexOptions>(() => ({
  chart: {
    type: 'area',
    sparkline: { enabled: true },
    animations: { enabled: true, speed: 900 },
    background: 'transparent',
    fontFamily: '"Segoe UI Variable", Inter, system-ui, sans-serif',
  },
  colors: [`rgb(${colorRgb[props.color]})`],
  stroke: { curve: 'smooth', width: 2 },
  fill: {
    type: 'gradient',
    gradient: { shadeIntensity: 1, opacityFrom: 0.35, opacityTo: 0, stops: [0, 100] },
  },
  tooltip: { y: { formatter: (v: number) => v.toLocaleString() } },
}))
</script>

<style scoped>
.wstat-card {
  position: relative;
  padding: 18px 20px 14px;
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.78);
  backdrop-filter: blur(12px) saturate(140%);
  -webkit-backdrop-filter: blur(12px) saturate(140%);
  border: 1px solid rgba(255, 255, 255, 0.7);
  box-shadow: 0 6px 24px rgba(15, 23, 42, 0.06), inset 0 1px 0 rgba(255, 255, 255, 0.6);
  transition: transform 0.25s cubic-bezier(0.22, 1, 0.36, 1), box-shadow 0.25s ease;
  overflow: hidden;
}
.wstat-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 14px 36px rgba(15, 23, 42, 0.10), inset 0 1px 0 rgba(255, 255, 255, 0.8);
}

.wstat-card__top {
  display: flex; align-items: center; justify-content: space-between;
  margin-bottom: 10px;
}
.wstat-card__icon {
  width: 40px; height: 40px; border-radius: 12px;
  display: flex; align-items: center; justify-content: center;
  color: white;
}
.wstat-card--primary   .wstat-card__icon { background: linear-gradient(135deg, #3478f6, #1a5fd0); box-shadow: 0 4px 12px rgba(52, 120, 246, 0.30); }
.wstat-card--success   .wstat-card__icon { background: linear-gradient(135deg, #22c55e, #16a34a); box-shadow: 0 4px 12px rgba(34, 197, 94, 0.30); }
.wstat-card--warning   .wstat-card__icon { background: linear-gradient(135deg, #f59e0b, #d97706); box-shadow: 0 4px 12px rgba(245, 158, 11, 0.30); }
.wstat-card--error     .wstat-card__icon { background: linear-gradient(135deg, #ef4444, #dc2626); box-shadow: 0 4px 12px rgba(239, 68, 68, 0.30); }
.wstat-card--info      .wstat-card__icon { background: linear-gradient(135deg, #3b82f6, #2563eb); box-shadow: 0 4px 12px rgba(59, 130, 246, 0.30); }
.wstat-card--secondary .wstat-card__icon { background: linear-gradient(135deg, #8b5cf6, #7c3aed); box-shadow: 0 4px 12px rgba(139, 92, 246, 0.30); }
.wstat-card--teal      .wstat-card__icon { background: linear-gradient(135deg, #14b8a6, #0d9488); box-shadow: 0 4px 12px rgba(20, 184, 166, 0.30); }

.wstat-card__trend {
  display: inline-flex; align-items: center; gap: 4px;
  font-size: 12px; font-weight: 700; padding: 4px 8px; border-radius: 9999px;
}
.wstat-card__trend--up   { color: #16a34a; background: rgba(34, 197, 94, 0.12); }
.wstat-card__trend--down { color: #dc2626; background: rgba(239, 68, 68, 0.12); }

.wstat-card__value {
  font-size: 26px; font-weight: 800; letter-spacing: -0.02em;
  color: #0f172a; line-height: 1.2;
}
.wstat-card__label {
  font-size: 12px; color: #64748b;
  text-transform: uppercase; letter-spacing: 0.06em; font-weight: 600;
  margin-top: 4px;
}
.wstat-card__spark {
  margin-top: 8px; margin-bottom: -6px;
  overflow: hidden; max-width: 100%;
}
.wstat-card__spark :deep(.apexcharts-svg) { overflow: hidden; max-width: 100%; }
</style>
