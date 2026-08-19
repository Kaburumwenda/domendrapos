import type { ChartThemeColors } from './useChartTheme'

const fontFamily = '"Segoe UI Variable", Inter, system-ui, sans-serif'

export function useChartOptions() {
  const { colors } = useChartTheme()
  const { currency, number } = useFormat()

  const baseChart = computed(() => ({
    background: 'transparent',
    foreColor: colors.value.foreColor,
    fontFamily,
    toolbar: { show: false },
    animations: { enabled: true },
  }))

  function commonOptions() {
    return {
      chart: { ...baseChart.value },
      theme: { mode: 'light' as const },
      dataLabels: { enabled: false },
      grid: {
        borderColor: colors.value.grid,
        strokeDashArray: 4,
      },
      legend: {
        position: 'top' as const,
        horizontalAlign: 'right' as const,
        fontSize: '12px',
        labels: { colors: colors.value.foreColor },
        markers: { size: 4, strokeWidth: 0 },
      },
    }
  }

  function areaOptions(opts: {
    colors?: string[]
    xaxisType?: 'datetime' | 'category'
    monthly?: boolean
    yaxisFormatter?: (v: number) => string
    tooltipFormatter?: (v: number) => string
  } = {}) {
    const c = colors.value
    const strokeColors = opts.colors || [c.primary]
    return {
      chart: { type: 'area' as const, ...baseChart.value, toolbar: { show: false } },
      colors: strokeColors,
      stroke: { curve: 'smooth' as const, width: 2.5 },
      fill: {
        type: 'gradient' as const,
        gradient: {
          shadeIntensity: 1,
          opacityFrom: 0.5,
          opacityTo: 0.1,
          stops: [0, 90, 100],
        },
      },
      dataLabels: { enabled: false },
      grid: {
        borderColor: c.grid,
        strokeDashArray: 4,
        padding: { left: 10, right: 10 },
      },
      xaxis: {
        type: (opts.xaxisType || 'datetime') as 'datetime' | 'category',
        labels: {
          style: { colors: c.foreColor, fontSize: '11px' },
          format: opts.monthly ? 'MMM yy' : 'dd MMM',
          datetimeFormatter: opts.monthly
            ? { year: 'yyyy', month: "MMM 'yy", day: 'dd MMM' }
            : { year: 'yyyy', month: 'MMM', day: 'dd MMM' },
        },
        axisBorder: { show: false },
        axisTicks: { show: false },
      },
      yaxis: {
        decimalsInFloat: 0,
        labels: {
          style: { colors: c.foreColor },
          formatter: opts.yaxisFormatter || ((v: number) => Math.round(v).toLocaleString('en-GB')),
        },
      },
      tooltip: {
        theme: 'light',
        y: { formatter: opts.tooltipFormatter || ((v: number) => currency(v)) },
      },
    }
  }

  function barOptions(opts: {
    color?: string
    horizontal?: boolean
    categories?: string[]
    valueFormatter?: (v: number) => string
    tooltipFormatter?: (v: number) => string
  } = {}) {
    const c = colors.value
    const valueFormatter = opts.valueFormatter || ((v: number) => currency(v))
    return {
      chart: { type: 'bar' as const, ...baseChart.value, toolbar: { show: false } },
      colors: [opts.color || c.primary],
      plotOptions: {
        bar: {
          borderRadius: 6,
          horizontal: opts.horizontal ?? true,
          barHeight: '70%',
          columnWidth: opts.horizontal ? undefined : '55%',
        },
      },
      dataLabels: { enabled: false },
      grid: {
        borderColor: c.grid,
        xaxis: { lines: { show: true } },
        yaxis: { lines: { show: false } },
      },
      xaxis: {
        categories: opts.categories || [],
        labels: {
          style: { colors: c.foreColor, fontSize: '11px' },
          formatter: valueFormatter,
        },
      },
      yaxis: {
        labels: {
          style: { colors: c.foreColor },
          formatter: (v: number) => String(v),
        },
      },
      tooltip: {
        theme: 'light',
        x: { formatter: valueFormatter },
        y: { formatter: opts.tooltipFormatter || ((v: number) => currency(v)) },
      },
    }
  }

  function donutOptions(opts: {
    colors?: string[]
    labels?: string[]
    tooltipFormatter?: (v: number) => string
  } = {}) {
    const c = colors.value
    return {
      chart: { type: 'donut' as const, ...baseChart.value },
      labels: opts.labels || [],
      colors: opts.colors || useChartTheme().palette.value,
      legend: {
        position: 'bottom' as const,
        fontSize: '13px',
        labels: { colors: c.foreColor },
      },
      dataLabels: {
        enabled: true,
        formatter: (val: number) => `${val.toFixed(0)}%`,
        style: { colors: [c.foreColor] },
      },
      tooltip: {
        theme: 'light',
        y: { formatter: opts.tooltipFormatter || ((v: number) => currency(v)) },
      },
      stroke: { width: 2, colors: [`rgb(${c.surface})`] },
      plotOptions: {
        pie: {
          donut: {
            size: '65%',
            labels: {
              show: false,
            },
          },
        },
      },
    }
  }

  function heatmapOptions(opts: {
    colorScale?: { from: number; to: number; color: string; name?: string }[]
    tooltipFormatter?: (v: number) => string
  } = {}) {
    const c = colors.value
    const primary = c.primary

    const defaultScale = [
      { from: 0, to: 0, color: `rgba(${primary}, 0.06)`, name: 'No sales' },
      { from: 0.1, to: 1000, color: `rgba(${primary}, 0.25)`, name: 'Low' },
      { from: 1001, to: 3000, color: `rgba(${primary}, 0.45)`, name: 'Moderate' },
      { from: 3001, to: 6000, color: `rgba(${primary}, 0.7)`, name: 'Busy' },
      { from: 6001, to: 100000, color: `rgba(${primary}, 0.95)`, name: 'Peak' },
    ]

    return {
      chart: { type: 'heatmap' as const, ...baseChart.value, toolbar: { show: false } },
      colors: [`rgb(${primary})`],
      dataLabels: { enabled: false },
      xaxis: {
        type: 'category' as const,
        labels: { style: { colors: c.foreColor, fontSize: '10px' } },
        axisBorder: { show: false },
        axisTicks: { show: false },
      },
      yaxis: {
        reversed: true,
        labels: { style: { colors: c.foreColor, fontSize: '11px' } },
      },
      grid: { padding: { right: 20 } },
      plotOptions: {
        heatmap: {
          radius: 3,
          enableShades: false,
          colorScale: { ranges: opts.colorScale || defaultScale },
        },
      },
      legend: {
        show: true,
        position: 'bottom' as const,
        fontSize: '11px',
        labels: { colors: c.foreColor },
        markers: { size: 6, strokeWidth: 0 },
      },
      tooltip: {
        theme: 'light',
        y: { formatter: opts.tooltipFormatter || ((v: number) => (v === 0 ? 'No sales' : currency(v))) },
      },
    }
  }

  return {
    colors,
    commonOptions,
    areaOptions,
    barOptions,
    donutOptions,
    heatmapOptions,
  }
}
