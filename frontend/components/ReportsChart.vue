/**
 * ReportsChart.vue — Reusable SVG-based chart components for the Reports page.
 *
 * Provides 5 chart types via the `type` prop:
 *   - "bar"     → vertical grouped bars (daily-revenue, hourly-sales, weekday-sales)
 *   - "donut"   → pie/donut chart (payment-methods, category shares, ABC analysis)
 *   - "hbar"    → horizontal bars (top products, top customers, branch comparison)
 *
 * All components are pure SVG/CSS — no external chart library needed.
 */
<script setup lang="ts">
type ChartType = 'bar' | 'donut' | 'hbar' | 'line' | 'heatmap'

interface BarDataset {
  label: string
  data: number[]
  color?: string
}

interface DonutSegment {
  label: string
  value: number
  color?: string
}

interface HBarItem {
  label: string
  value: number
  color?: string
}

interface LinePoint {
  label: string
  value: number
}

const props = defineProps<{
  type: ChartType
  labels?: string[]
  datasets?: BarDataset[]
  segments?: DonutSegment[]
  items?: HBarItem[]
  points?: LinePoint[]
  grid?: number[][]
  weekdays?: string[]
  height?: number
  size?: number
  formatValue?: (v: number) => string
}>()

// ── Color palette ─────────────────────────────────────────────
const PALETTE = ['#1976D2', '#2E7D32', '#FF9800', '#9C27B0', '#F44336', '#00BCD4', '#795548', '#607D8B', '#8BC34A', '#CDDC39', '#FF5722', '#3F51B5']
function colorAt(i: number): string { return PALETTE[i % PALETTE.length] }

const fmt = computed(() => props.formatValue || ((v: number) => String(v)))

// ── Bar chart ──────────────────────────────────────────────────
const barMaxVal = computed(() => {
  const all = (props.datasets || []).flatMap(d => d.data)
  return Math.max(...all, 1)
})

function barColor(color?: string, fallback: number = 0): string {
  if (color) {
    const n = Number(color)
    if (color.startsWith('#')) return color
  }
  return color || colorAt(fallback)
}

// ── Donut chart ────────────────────────────────────────────────
const donutTotal = computed(() => (props.segments || []).reduce((s, seg) => s + seg.value, 0) || 1)
const donutSize = computed(() => props.size || 200)

interface ArcPath {
  d: string
  color: string
  label: string
  value: number
  pct: number
}

const donutPaths = computed<ArcPath[]>(() => {
  const segs = props.segments || []
  if (!segs.length) return []
  const r = donutSize.value / 2 - 10
  const cx = donutSize.value / 2
  const cy = donutSize.value / 2
  let cumulative = 0
  return segs.map((seg, i) => {
    const startAngle = (cumulative / donutTotal.value) * 360 - 90
    cumulative += seg.value
    const endAngle = (cumulative / donutTotal.value) * 360 - 90
    const startRad = (startAngle * Math.PI) / 180
    const endRad = (endAngle * Math.PI) / 180
    const x1 = cx + r * Math.cos(startRad)
    const y1 = cy + r * Math.sin(startRad)
    const x2 = cx + r * Math.cos(endRad)
    const y2 = cy + r * Math.sin(endRad)
    const largeArc = endAngle - startAngle > 180 ? 1 : 0
    const d = `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2} Z`
    return {
      d,
      color: seg.color || colorAt(i),
      label: seg.label,
      value: seg.value,
      pct: (seg.value / donutTotal.value) * 100,
    }
  })
})

// ── Horizontal bar chart ──────────────────────────────────────
const hbarMax = computed(() => Math.max(...(props.items || []).map(i => i.value), 1))

// ── Heatmap ────────────────────────────────────────────────────
const heatMax = computed(() => {
  let m = 0
  for (const row of (props.grid || [])) for (const c of row) if (c > m) m = c
  return m || 1
})

function heatColor(val: number): string {
  const intensity = val / heatMax.value
  const r = Math.round(232 - intensity * 206)
  const g = Math.round(240 - intensity * 122)
  const b = Math.round(254 - intensity * 44)
  return `rgb(${r}, ${g}, ${b})`
}

function heatOpacity(_val: number): number {
  return 0.3 + (Math.min(_val, heatMax.value) / heatMax.value) * 0.7
}
</script>

<template>
  <!-- ═════════ Bar Chart ═════════ -->
  <div v-if="type === 'bar'" class="rpt-chart-wrap">
    <div v-if="datasets" class="d-flex align-center ga-3 mb-2 flex-wrap">
      <div v-for="(ds, i) in datasets" :key="i" class="d-flex align-center ga-1">
        <div class="rpt-legend-dot" :style="{ background: ds.color || colorAt(i) }" />
        <span class="text-caption">{{ ds.label }}</span>
      </div>
    </div>
    <div class="rpt-bar-chart" :style="{ height: (height || 240) + 'px' }">
      <div v-for="(label, li) in (labels || [])" :key="li" class="rpt-bar-col">
        <div class="rpt-bar-stack">
          <div
            v-for="(ds, di) in (datasets || [])"
            :key="di"
            class="rpt-bar"
            :style="{
              height: `${Math.max(2, ((ds.data[li] || 0) / barMaxVal) * 100)}%`,
              background: ds.color || colorAt(di),
            }"
            :title="`${ds.label}: ${fmt(ds.data[li] || 0)}`"
          />
        </div>
        <div class="rpt-bar-label">{{ label }}</div>
      </div>
    </div>
  </div>

  <!-- ═════════ Donut Chart ═════════ -->
  <div v-else-if="type === 'donut' && segments" class="rpt-donut-wrap">
    <svg :width="donutSize" :height="donutSize" :viewBox="`0 0 ${donutSize} ${donutSize}`" class="rpt-donut-svg">
      <path
        v-for="(arc, i) in donutPaths"
        :key="i"
        :d="arc.d"
        :fill="arc.color"
        stroke="#fff"
        :stroke-width="2"
        class="rpt-donut-slice"
      >
        <title>{{ arc.label }}: {{ arc.pct.toFixed(1) }}% ({{ fmt(arc.value) }})</title>
      </path>
      <circle :cx="donutSize/2" :cy="donutSize/2" :r="donutSize/2 - 22" fill="var(--v-theme-surface)" />
      <text :x="donutSize/2" :y="donutSize/2 - 5" text-anchor="middle" class="rpt-donut-center-val">
        {{ fmt(donutTotal) }}
      </text>
      <text :x="donutSize/2" :y="donutSize/2 + 12" text-anchor="middle" class="rpt-donut-center-label">Total</text>
    </svg>
    <div class="rpt-donut-legend">
      <div v-for="(arc, i) in donutPaths" :key="i" class="rpt-donut-legend-item">
        <div class="rpt-legend-dot" :style="{ background: arc.color }" />
        <span class="rpt-donut-legend-label">{{ arc.label }}</span>
        <span class="rpt-donut-legend-val">{{ arc.pct.toFixed(1) }}%</span>
      </div>
    </div>
  </div>

  <!-- ═════════ Horizontal Bar Chart ═════════ -->
  <div v-else-if="type === 'hbar' && items" class="rpt-hbar-wrap">
    <div v-for="(item, i) in items" :key="i" class="rpt-hbar-row">
      <div class="rpt-hbar-label" :title="item.label">{{ item.label }}</div>
      <div class="rpt-hbar-track">
        <div
          class="rpt-hbar-fill"
          :style="{
            width: `${Math.max(2, ((item.value / hbarMax) * 100))}%`,
            background: item.color || colorAt(i),
          }"
        >
          <span class="rpt-hbar-val">{{ fmt(item.value) }}</span>
        </div>
      </div>
    </div>
  </div>

  <!-- ═════════ Heatmap Grid ═════════ -->
  <div v-else-if="type === 'heatmap' && grid" class="rpt-heatmap-wrap">
    <div class="rpt-heatmap-header">
      <div class="rpt-heatmap-corner">Hr</div>
      <div v-for="(wd, i) in (weekdays || ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'])" :key="i" class="rpt-heatmap-wd">{{ wd }}</div>
    </div>
    <div v-for="(row, h) in grid" :key="h" class="rpt-heatmap-row">
      <div class="rpt-heatmap-hour">{{ h }}:00</div>
      <div
        v-for="(val, wd) in row"
        :key="wd"
        class="rpt-heatmap-cell"
        :style="{ background: val > 0 ? heatColor(val) : 'transparent', opacity: val > 0 ? heatOpacity(val) : 0.3 }"
      >
        <span v-if="val > 0" class="rpt-heatmap-val">{{ fmt(val) }}</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* ── Shared ──────────────────────────────────────────────── */
.rpt-legend-dot {
  width: 10px; height: 10px; border-radius: 50%; flex-shrink: 0;
}

/* ── BarChart ────────────────────────────────────────────── */
.rpt-chart-wrap { width: 100%; }
.rpt-bar-chart {
  display: flex; align-items: flex-end; gap: 4px;
  overflow-x: auto; overflow-y: hidden;
  padding-top: 8px;
}
.rpt-bar-col {
  display: flex; flex-direction: column; align-items: center;
  min-width: 48px; flex: 1; height: 100%;
}
.rpt-bar-stack {
  flex: 1; width: 100%;
  display: flex; flex-direction: column-reverse;
  justify-content: flex-start; align-items: center; gap: 1px;
}
.rpt-bar {
  width: 70%; max-width: 30px; border-radius: 3px 3px 0 0;
  min-height: 2px; transition: height 0.3s ease;
}
.rpt-bar-label {
  font-size: 11px; color: rgba(var(--v-theme-on-surface), 0.6);
  margin-top: 4px; white-space: nowrap;
}

/* ── DonutChart ──────────────────────────────────────────── */
.rpt-donut-wrap {
  display: flex; align-items: center; gap: 24px;
  flex-wrap: wrap; justify-content: center;
}
.rpt-donut-svg { flex-shrink: 0; }
.rpt-donut-slice { transition: opacity 0.2s; cursor: pointer; }
.rpt-donut-slice:hover { opacity: 0.85; }
.rpt-donut-center-val {
  font-size: 16px; font-weight: 700;
  fill: rgba(var(--v-theme-on-surface), 0.87);
}
.rpt-donut-center-label {
  font-size: 10px;
  fill: rgba(var(--v-theme-on-surface), 0.5);
}
.rpt-donut-legend {
  display: flex; flex-direction: column; gap: 6px;
  min-width: 180px;
}
.rpt-donut-legend-item {
  display: flex; align-items: center; gap: 8px;
}
.rpt-donut-legend-label {
  font-size: 12px; flex: 1;
  color: rgba(var(--v-theme-on-surface), 0.75);
  overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
}
.rpt-donut-legend-val {
  font-size: 12px; font-weight: 700;
  color: rgba(var(--v-theme-on-surface), 0.87);
}

/* ── HBarChart ──────────────────────────────────────────── */
.rpt-hbar-wrap { display: flex; flex-direction: column; gap: 8px; width: 100%; }
.rpt-hbar-row { display: flex; align-items: center; gap: 8px; }
.rpt-hbar-label {
  width: 130px; flex-shrink: 0;
  font-size: 12px; font-weight: 500;
  overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
  color: rgba(var(--v-theme-on-surface), 0.75);
}
.rpt-hbar-track {
  flex: 1; height: 24px; background: rgba(var(--v-theme-on-surface), 0.05);
  border-radius: 4px; overflow: hidden;
}
.rpt-hbar-fill {
  height: 100%; border-radius: 4px;
  display: flex; align-items: center; justify-content: flex-end;
  padding-right: 8px;
  transition: width 0.3s ease;
  min-width: 30px;
}
.rpt-hbar-val {
  font-size: 11px; font-weight: 700; color: #fff;
  white-space: nowrap;
}

/* ── HeatmapGrid ────────────────────────────────────────── */
.rpt-heatmap-wrap {
  display: flex; flex-direction: column; gap: 2px;
  overflow-x: auto; padding: 8px 0;
}
.rpt-heatmap-header, .rpt-heatmap-row {
  display: flex; gap: 2px; align-items: center;
}
.rpt-heatmap-corner, .rpt-heatmap-hour {
  width: 44px; flex-shrink: 0;
  font-size: 10px; font-weight: 600; text-align: right; padding-right: 6px;
  color: rgba(var(--v-theme-on-surface), 0.55);
}
.rpt-heatmap-wd {
  flex: 1; text-align: center;
  font-size: 10px; font-weight: 600;
  color: rgba(var(--v-theme-on-surface), 0.65);
  max-width: 80px;
}
.rpt-heatmap-cell {
  flex: 1; height: 28px; border-radius: 3px;
  display: flex; align-items: center; justify-content: center;
  background: rgba(var(--v-theme-on-surface), 0.04);
  max-width: 80px; min-width: 50px;
}
.rpt-heatmap-val {
  font-size: 9px; font-weight: 600; color: rgba(0,0,0,0.55);
  pointer-events: none;
}
</style>
