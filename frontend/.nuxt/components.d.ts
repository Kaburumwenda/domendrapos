
import type { DefineComponent, SlotsType } from 'vue'
type IslandComponent<T> = DefineComponent<{}, {refresh: () => Promise<void>}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, SlotsType<{ fallback: { error: unknown } }>> & T

type HydrationStrategies = {
  hydrateOnVisible?: IntersectionObserverInit | true
  hydrateOnIdle?: number | true
  hydrateOnInteraction?: keyof HTMLElementEventMap | Array<keyof HTMLElementEventMap> | true
  hydrateOnMediaQuery?: string
  hydrateAfter?: number
  hydrateWhen?: boolean
  hydrateNever?: true
}
type LazyComponent<T> = DefineComponent<HydrationStrategies, {}, {}, {}, {}, {}, {}, { hydrated: () => void }> & T


export const Auth3DScene: typeof import("../components/Auth3DScene.vue")['default']
export const BranchSelector: typeof import("../components/BranchSelector.vue")['default']
export const CountUpText: typeof import("../components/CountUpText.vue")['default']
export const GradientIcon: typeof import("../components/GradientIcon.vue")['default']
export const OnboardingForm: typeof import("../components/OnboardingForm.vue")['default']
export const PaginationBar: typeof import("../components/PaginationBar.vue")['default']
export const ReportsChart: typeof import("../components/ReportsChart.vue")['default']
export const StatusBadge: typeof import("../components/StatusBadge.vue")['default']
export const ToastContainer: typeof import("../components/ToastContainer.vue")['default']
export const CustomersCustomerModal: typeof import("../components/customers/CustomerModal.vue")['default']
export const DashboardChartCard: typeof import("../components/dashboard/ChartCard.vue")['default']
export const DashboardEmptyState: typeof import("../components/dashboard/EmptyState.vue")['default']
export const DashboardErrorState: typeof import("../components/dashboard/ErrorState.vue")['default']
export const DashboardKpiCard: typeof import("../components/dashboard/KpiCard.vue")['default']
export const DashboardLowStockList: typeof import("../components/dashboard/LowStockList.vue")['default']
export const DashboardPeriodSelector: typeof import("../components/dashboard/PeriodSelector.vue")['default']
export const DashboardRecentTransactions: typeof import("../components/dashboard/RecentTransactions.vue")['default']
export const DashboardSkeleton: typeof import("../components/dashboard/Skeleton.vue")['default']
export const DocsChartExportDemo: typeof import("../components/docs/ChartExportDemo.vue")['default']
export const DocsCsvExportDemo: typeof import("../components/docs/CsvExportDemo.vue")['default']
export const DocsSnapshot: typeof import("../components/docs/Snapshot.vue")['default']
export const DocsStepTimeline: typeof import("../components/docs/StepTimeline.vue")['default']
export const DocsToc: typeof import("../components/docs/Toc.vue")['default']
export const PosReceipt: typeof import("../components/pos/Receipt.vue")['default']
export const ProductsBrandModal: typeof import("../components/products/BrandModal.vue")['default']
export const ProductsCategoryModal: typeof import("../components/products/CategoryModal.vue")['default']
export const ProductsProductModal: typeof import("../components/products/ProductModal.vue")['default']
export const ProductsUnitModal: typeof import("../components/products/UnitModal.vue")['default']
export const SuppliersSupplierModal: typeof import("../components/suppliers/SupplierModal.vue")['default']
export const WelcomeHeroBg: typeof import("../components/welcome/HeroBg.vue")['default']
export const WelcomeStatCard: typeof import("../components/welcome/StatCard.vue")['default']
export const NuxtWelcome: typeof import("../node_modules/nuxt/dist/app/components/welcome.vue")['default']
export const NuxtLayout: typeof import("../node_modules/nuxt/dist/app/components/nuxt-layout")['default']
export const NuxtErrorBoundary: typeof import("../node_modules/nuxt/dist/app/components/nuxt-error-boundary.vue")['default']
export const ClientOnly: typeof import("../node_modules/nuxt/dist/app/components/client-only")['default']
export const DevOnly: typeof import("../node_modules/nuxt/dist/app/components/dev-only")['default']
export const ServerPlaceholder: typeof import("../node_modules/nuxt/dist/app/components/server-placeholder")['default']
export const NuxtLink: typeof import("../node_modules/nuxt/dist/app/components/nuxt-link")['default']
export const NuxtLoadingIndicator: typeof import("../node_modules/nuxt/dist/app/components/nuxt-loading-indicator")['default']
export const NuxtTime: typeof import("../node_modules/nuxt/dist/app/components/nuxt-time.vue")['default']
export const NuxtRouteAnnouncer: typeof import("../node_modules/nuxt/dist/app/components/nuxt-route-announcer")['default']
export const NuxtAnnouncer: typeof import("../node_modules/nuxt/dist/app/components/nuxt-announcer")['default']
export const NuxtImg: typeof import("../node_modules/nuxt/dist/app/components/nuxt-stubs")['NuxtImg']
export const NuxtPicture: typeof import("../node_modules/nuxt/dist/app/components/nuxt-stubs")['NuxtPicture']
export const NuxtPage: typeof import("../node_modules/nuxt/dist/pages/runtime/page")['default']
export const NoScript: typeof import("../node_modules/nuxt/dist/head/runtime/components")['NoScript']
export const Link: typeof import("../node_modules/nuxt/dist/head/runtime/components")['Link']
export const Base: typeof import("../node_modules/nuxt/dist/head/runtime/components")['Base']
export const Title: typeof import("../node_modules/nuxt/dist/head/runtime/components")['Title']
export const Meta: typeof import("../node_modules/nuxt/dist/head/runtime/components")['Meta']
export const Style: typeof import("../node_modules/nuxt/dist/head/runtime/components")['Style']
export const Head: typeof import("../node_modules/nuxt/dist/head/runtime/components")['Head']
export const Html: typeof import("../node_modules/nuxt/dist/head/runtime/components")['Html']
export const Body: typeof import("../node_modules/nuxt/dist/head/runtime/components")['Body']
export const NuxtIsland: typeof import("../node_modules/nuxt/dist/app/components/nuxt-island")['default']
export const LazyAuth3DScene: LazyComponent<typeof import("../components/Auth3DScene.vue")['default']>
export const LazyBranchSelector: LazyComponent<typeof import("../components/BranchSelector.vue")['default']>
export const LazyCountUpText: LazyComponent<typeof import("../components/CountUpText.vue")['default']>
export const LazyGradientIcon: LazyComponent<typeof import("../components/GradientIcon.vue")['default']>
export const LazyOnboardingForm: LazyComponent<typeof import("../components/OnboardingForm.vue")['default']>
export const LazyPaginationBar: LazyComponent<typeof import("../components/PaginationBar.vue")['default']>
export const LazyReportsChart: LazyComponent<typeof import("../components/ReportsChart.vue")['default']>
export const LazyStatusBadge: LazyComponent<typeof import("../components/StatusBadge.vue")['default']>
export const LazyToastContainer: LazyComponent<typeof import("../components/ToastContainer.vue")['default']>
export const LazyCustomersCustomerModal: LazyComponent<typeof import("../components/customers/CustomerModal.vue")['default']>
export const LazyDashboardChartCard: LazyComponent<typeof import("../components/dashboard/ChartCard.vue")['default']>
export const LazyDashboardEmptyState: LazyComponent<typeof import("../components/dashboard/EmptyState.vue")['default']>
export const LazyDashboardErrorState: LazyComponent<typeof import("../components/dashboard/ErrorState.vue")['default']>
export const LazyDashboardKpiCard: LazyComponent<typeof import("../components/dashboard/KpiCard.vue")['default']>
export const LazyDashboardLowStockList: LazyComponent<typeof import("../components/dashboard/LowStockList.vue")['default']>
export const LazyDashboardPeriodSelector: LazyComponent<typeof import("../components/dashboard/PeriodSelector.vue")['default']>
export const LazyDashboardRecentTransactions: LazyComponent<typeof import("../components/dashboard/RecentTransactions.vue")['default']>
export const LazyDashboardSkeleton: LazyComponent<typeof import("../components/dashboard/Skeleton.vue")['default']>
export const LazyDocsChartExportDemo: LazyComponent<typeof import("../components/docs/ChartExportDemo.vue")['default']>
export const LazyDocsCsvExportDemo: LazyComponent<typeof import("../components/docs/CsvExportDemo.vue")['default']>
export const LazyDocsSnapshot: LazyComponent<typeof import("../components/docs/Snapshot.vue")['default']>
export const LazyDocsStepTimeline: LazyComponent<typeof import("../components/docs/StepTimeline.vue")['default']>
export const LazyDocsToc: LazyComponent<typeof import("../components/docs/Toc.vue")['default']>
export const LazyPosReceipt: LazyComponent<typeof import("../components/pos/Receipt.vue")['default']>
export const LazyProductsBrandModal: LazyComponent<typeof import("../components/products/BrandModal.vue")['default']>
export const LazyProductsCategoryModal: LazyComponent<typeof import("../components/products/CategoryModal.vue")['default']>
export const LazyProductsProductModal: LazyComponent<typeof import("../components/products/ProductModal.vue")['default']>
export const LazyProductsUnitModal: LazyComponent<typeof import("../components/products/UnitModal.vue")['default']>
export const LazySuppliersSupplierModal: LazyComponent<typeof import("../components/suppliers/SupplierModal.vue")['default']>
export const LazyWelcomeHeroBg: LazyComponent<typeof import("../components/welcome/HeroBg.vue")['default']>
export const LazyWelcomeStatCard: LazyComponent<typeof import("../components/welcome/StatCard.vue")['default']>
export const LazyNuxtWelcome: LazyComponent<typeof import("../node_modules/nuxt/dist/app/components/welcome.vue")['default']>
export const LazyNuxtLayout: LazyComponent<typeof import("../node_modules/nuxt/dist/app/components/nuxt-layout")['default']>
export const LazyNuxtErrorBoundary: LazyComponent<typeof import("../node_modules/nuxt/dist/app/components/nuxt-error-boundary.vue")['default']>
export const LazyClientOnly: LazyComponent<typeof import("../node_modules/nuxt/dist/app/components/client-only")['default']>
export const LazyDevOnly: LazyComponent<typeof import("../node_modules/nuxt/dist/app/components/dev-only")['default']>
export const LazyServerPlaceholder: LazyComponent<typeof import("../node_modules/nuxt/dist/app/components/server-placeholder")['default']>
export const LazyNuxtLink: LazyComponent<typeof import("../node_modules/nuxt/dist/app/components/nuxt-link")['default']>
export const LazyNuxtLoadingIndicator: LazyComponent<typeof import("../node_modules/nuxt/dist/app/components/nuxt-loading-indicator")['default']>
export const LazyNuxtTime: LazyComponent<typeof import("../node_modules/nuxt/dist/app/components/nuxt-time.vue")['default']>
export const LazyNuxtRouteAnnouncer: LazyComponent<typeof import("../node_modules/nuxt/dist/app/components/nuxt-route-announcer")['default']>
export const LazyNuxtAnnouncer: LazyComponent<typeof import("../node_modules/nuxt/dist/app/components/nuxt-announcer")['default']>
export const LazyNuxtImg: LazyComponent<typeof import("../node_modules/nuxt/dist/app/components/nuxt-stubs")['NuxtImg']>
export const LazyNuxtPicture: LazyComponent<typeof import("../node_modules/nuxt/dist/app/components/nuxt-stubs")['NuxtPicture']>
export const LazyNuxtPage: LazyComponent<typeof import("../node_modules/nuxt/dist/pages/runtime/page")['default']>
export const LazyNoScript: LazyComponent<typeof import("../node_modules/nuxt/dist/head/runtime/components")['NoScript']>
export const LazyLink: LazyComponent<typeof import("../node_modules/nuxt/dist/head/runtime/components")['Link']>
export const LazyBase: LazyComponent<typeof import("../node_modules/nuxt/dist/head/runtime/components")['Base']>
export const LazyTitle: LazyComponent<typeof import("../node_modules/nuxt/dist/head/runtime/components")['Title']>
export const LazyMeta: LazyComponent<typeof import("../node_modules/nuxt/dist/head/runtime/components")['Meta']>
export const LazyStyle: LazyComponent<typeof import("../node_modules/nuxt/dist/head/runtime/components")['Style']>
export const LazyHead: LazyComponent<typeof import("../node_modules/nuxt/dist/head/runtime/components")['Head']>
export const LazyHtml: LazyComponent<typeof import("../node_modules/nuxt/dist/head/runtime/components")['Html']>
export const LazyBody: LazyComponent<typeof import("../node_modules/nuxt/dist/head/runtime/components")['Body']>
export const LazyNuxtIsland: LazyComponent<typeof import("../node_modules/nuxt/dist/app/components/nuxt-island")['default']>

export const componentNames: string[]
