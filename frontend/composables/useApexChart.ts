/**
 * Lazy-loaded ApexCharts composable.
 *
 * Instead of registering vue3-apexcharts globally via a plugin (which
 * bundles the full ~150KB library on every page), this composable
 * dynamically imports the component only where charts are used.
 */
import { defineAsyncComponent } from 'vue'

let ApexChartComponent: ReturnType<typeof defineAsyncComponent> | null = null

export function useApexChart() {
  if (!ApexChartComponent) {
    ApexChartComponent = defineAsyncComponent(() => import('vue3-apexcharts'))
  }
  return ApexChartComponent
}
