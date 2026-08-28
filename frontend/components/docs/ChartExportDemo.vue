<template>
  <v-card rounded="xl" flat border class="pa-6 chart-demo-card">
    <div class="d-flex align-center mb-2 ga-2">
      <v-icon color="primary" size="24">mdi-chart-line</v-icon>
      <span class="text-h6 font-weight-bold">{{ title }}</span>
    </div>
    <p class="text-body-2 text-medium-emphasis mb-4">{{ description }}</p>

    <v-row density="comfortable">
      <v-col cols="12" md="8">
        <div class="chart-wrap">
          <apexchart
            type="bar"
            :options="chartOptions"
            :series="chartSeries"
            height="300"
          />
        </div>
      </v-col>
      <v-col cols="12" md="4" class="d-flex flex-column justify-center ga-3">
        <v-btn
          color="success"
          variant="flat"
          prepend-icon="mdi-download"
          @click="exportCsv"
        >
          Export CSV
        </v-btn>
        <v-btn
          variant="outlined"
          prepend-icon="mdi-chart-bar"
          @click="exportChartPng"
        >
          Export PNG
        </v-btn>
        <p class="text-caption text-medium-emphasis text-center">
          CSV data is generated from the chart series and can be opened in Excel or Google Sheets.
        </p>
      </v-col>
    </v-row>
  </v-card>
</template>

<script setup lang="ts">
import type { ApexOptions } from 'apexcharts'

const { exportCsv: exportRowsCsv } = useCsvExport()

const props = withDefaults(defineProps<{
  title?: string
  description?: string
  filename?: string
  categories: string[]
  series: { name: string; data: number[] }[]
}>(), {
  title: 'Chart with CSV Export',
  description: 'Visualize data and export it as CSV for further analysis.',
  filename: 'chart-data.csv',
})

const chartSeries = computed(() => props.series)

const chartOptions = computed<ApexOptions>(() => ({
  chart: {
    type: 'bar',
    fontFamily: 'Segoe UI, Roboto, sans-serif',
    toolbar: { show: false },
    animations: { enabled: true, speed: 800 },
  },
  colors: ['#3478f6', '#f59e0b', '#22c55e', '#8b5cf6'],
  plotOptions: {
    bar: { borderRadius: 6, columnWidth: '60%' },
  },
  dataLabels: { enabled: false },
  stroke: { show: true, width: 2, colors: ['transparent'] },
  xaxis: {
    categories: props.categories,
    labels: { style: { fontSize: '12px' } },
  },
  yaxis: { labels: { formatter: (val: number) => val.toLocaleString() } },
  fill: { opacity: 1 },
  tooltip: { y: { formatter: (val: number) => val.toLocaleString() } },
  legend: { position: 'top', fontSize: '13px' },
  grid: { borderColor: '#e2e8f0', strokeDashArray: 4 },
}))

function exportCsv() {
  const rows = props.categories.map((cat, i) => {
    const row: Record<string, any> = { category: cat }
    props.series.forEach(s => {
      row[s.name] = s.data[i]
    })
    return row
  })
  const columns = ['category', ...props.series.map(s => s.name)]
  exportRowsCsv(props.filename, rows, { columns })
}

async function exportChartPng() {
  // ApexCharts exposes export via the global chart instance; we trigger download directly
  if (!import.meta.client) return
  try {
    const ApexCharts = (await import('apexcharts')).default
    const chartEl = document.querySelector(`#${chartId}`)
    if (chartEl) {
      const chart = (chartEl as any).__apexchart__
      if (chart) {
        chart.dataURI().then((uri: { imgURI: string }) => {
          const a = document.createElement('a')
          a.href = uri.imgURI
          a.download = props.filename.replace('.csv', '.png')
          a.click()
        })
      }
    }
  } catch {
    // Fallback - no-op
  }
}

const chartId = `chart-${Math.random().toString(36).slice(2, 9)}`
</script>

<style scoped>
.chart-demo-card { background: #ffffff; }
.chart-wrap { border: 1px solid rgba(203, 213, 225, 0.4); border-radius: 12px; padding: 16px; background: #fcfcfd; }
</style>
