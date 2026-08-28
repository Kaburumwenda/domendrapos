import { ref, computed, watch, resolveComponent, mergeProps, withCtx, unref, createTextVNode, toDisplayString, openBlock, createBlock, Fragment, renderList, createVNode, useSSRContext } from 'file://D:/Projects/MY-APPS-2/DomendraPOS/frontend/node_modules/vue/index.mjs';
import { ssrRenderAttrs, ssrRenderComponent, ssrRenderList, ssrInterpolate, ssrRenderStyle, ssrRenderClass } from 'file://D:/Projects/MY-APPS-2/DomendraPOS/frontend/node_modules/vue/server-renderer/index.mjs';
import { u as useFormat } from './useFormat-BvVWDMYe.mjs';
import { _ as _export_sfc, D as useToast, L as VBtnGroup, c as VBtn, x as VProgressCircular, a as VIcon } from './server.mjs';
import { u as useApi } from './useApi-D4YG8JPQ.mjs';
import 'file://D:/Projects/MY-APPS-2/DomendraPOS/frontend/node_modules/ofetch/dist/node.mjs';
import '../_/renderer.mjs';
import 'file://D:/Projects/MY-APPS-2/DomendraPOS/frontend/node_modules/vue-bundle-renderer/dist/runtime.mjs';
import 'file://D:/Projects/MY-APPS-2/DomendraPOS/frontend/node_modules/h3/dist/index.mjs';
import 'file://D:/Projects/MY-APPS-2/DomendraPOS/frontend/node_modules/ufo/dist/index.mjs';
import 'file://D:/Projects/MY-APPS-2/DomendraPOS/frontend/node_modules/destr/dist/index.mjs';
import '../_/nitro.mjs';
import 'file://D:/Projects/MY-APPS-2/DomendraPOS/frontend/node_modules/hookable/dist/index.mjs';
import 'file://D:/Projects/MY-APPS-2/DomendraPOS/frontend/node_modules/node-mock-http/dist/index.mjs';
import 'file://D:/Projects/MY-APPS-2/DomendraPOS/frontend/node_modules/unstorage/dist/index.mjs';
import 'file://D:/Projects/MY-APPS-2/DomendraPOS/frontend/node_modules/unstorage/drivers/fs.mjs';
import 'file:///D:/Projects/MY-APPS-2/DomendraPOS/frontend/node_modules/@nuxt/nitro-server/dist/runtime/utils/cache-driver.js';
import 'file://D:/Projects/MY-APPS-2/DomendraPOS/frontend/node_modules/unstorage/drivers/fs-lite.mjs';
import 'file://D:/Projects/MY-APPS-2/DomendraPOS/frontend/node_modules/ohash/dist/index.mjs';
import 'file://D:/Projects/MY-APPS-2/DomendraPOS/frontend/node_modules/klona/dist/index.mjs';
import 'file://D:/Projects/MY-APPS-2/DomendraPOS/frontend/node_modules/defu/dist/defu.mjs';
import 'file://D:/Projects/MY-APPS-2/DomendraPOS/frontend/node_modules/scule/dist/index.mjs';
import 'file://D:/Projects/MY-APPS-2/DomendraPOS/frontend/node_modules/radix3/dist/index.mjs';
import 'node:fs';
import 'node:url';
import 'file://D:/Projects/MY-APPS-2/DomendraPOS/frontend/node_modules/pathe/dist/index.mjs';
import 'file://D:/Projects/MY-APPS-2/DomendraPOS/frontend/node_modules/unhead/dist/server.mjs';
import 'node:async_hooks';
import 'file://D:/Projects/MY-APPS-2/DomendraPOS/frontend/node_modules/devalue/index.js';
import 'file://D:/Projects/MY-APPS-2/DomendraPOS/frontend/node_modules/unhead/dist/utils.mjs';
import 'file://D:/Projects/MY-APPS-2/DomendraPOS/frontend/node_modules/nuxt/node_modules/hookable/dist/index.mjs';
import 'file://D:/Projects/MY-APPS-2/DomendraPOS/frontend/node_modules/unctx/dist/index.mjs';
import 'file://D:/Projects/MY-APPS-2/DomendraPOS/frontend/node_modules/pinia/dist/pinia.js';
import 'file://D:/Projects/MY-APPS-2/DomendraPOS/frontend/node_modules/vue-router/vue-router.node.mjs';
import 'file://D:/Projects/MY-APPS-2/DomendraPOS/frontend/node_modules/perfect-debounce/dist/index.mjs';
import 'file://D:/Projects/MY-APPS-2/DomendraPOS/frontend/node_modules/@vue/shared/dist/shared.cjs.prod.js';
import 'file://D:/Projects/MY-APPS-2/DomendraPOS/frontend/node_modules/vue3-apexcharts/dist/vue3-apexcharts.js';
import 'file://D:/Projects/MY-APPS-2/DomendraPOS/frontend/node_modules/nuxt/node_modules/cookie-es/dist/index.mjs';

const _sfc_main = {
  __name: "categories",
  __ssrInlineRender: true,
  setup(__props) {
    const { currency } = useFormat();
    const toast = useToast();
    function formatMoney(v) {
      return currency(v || 0);
    }
    function formatDate(v) {
      return new Date(v).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
    }
    const periodOptions = [
      { label: "Today", value: "today", short: "Today" },
      { label: "Last 7 days", value: "7d", short: "7D" },
      { label: "Last 30 days", value: "30d", short: "30D" },
      { label: "This month", value: "thisMonth", short: "Month" },
      { label: "Last 90 days", value: "90d", short: "90D" }
    ];
    const period = ref("30d");
    const loading = ref(false);
    const activeTab = ref("overview");
    function resolveDateRange(key) {
      const now = /* @__PURE__ */ new Date();
      const end = new Date(now);
      end.setHours(23, 59, 59, 999);
      const start = new Date(now);
      start.setHours(0, 0, 0, 0);
      if (key === "today") ;
      else if (key === "7d") {
        start.setDate(start.getDate() - 6);
      } else if (key === "30d") {
        start.setDate(start.getDate() - 29);
      } else if (key === "90d") {
        start.setDate(start.getDate() - 89);
      } else if (key === "thisMonth") {
        start.setDate(1);
      }
      return [
        start.toISOString().split("T")[0],
        end.toISOString().split("T")[0]
      ];
    }
    function periodQuery() {
      const [from, to] = resolveDateRange(period.value);
      return new URLSearchParams({ date_from: from, date_to: to }).toString();
    }
    const analyticsData = ref({});
    const categoryStats = computed(() => {
      var _a;
      const rows = ((_a = analyticsData.value) == null ? void 0 : _a.categories) || [];
      return rows.map((c) => ({
        name: c.category || "Uncategorized",
        revenue: Number(c.revenue || 0),
        qtySold: Number(c.qty_sold || 0),
        stockValue: Number(c.stock_value || 0),
        productCount: Number(c.sku_count || 0),
        sharePct: Number(c.revenue_share || 0),
        margin: Number(c.margin || 0)
      }));
    });
    const totalRevenue = computed(() => {
      var _a, _b;
      return Number(((_b = (_a = analyticsData.value) == null ? void 0 : _a.kpis) == null ? void 0 : _b.total_revenue) || 0);
    });
    const topCategory = computed(() => categoryStats.value[0] || null);
    const topPct = computed(() => {
      var _a, _b;
      return Number(((_b = (_a = analyticsData.value) == null ? void 0 : _a.kpis) == null ? void 0 : _b.top_category_share) || 0);
    });
    const totalStockValue = computed(() => categoryStats.value.reduce((s, c) => s + c.stockValue, 0));
    const totalStockQty = computed(() => categoryStats.value.reduce((s, c) => s + Number(c.qtySold || 0), 0));
    const totalCategories = computed(() => categoryStats.value.length);
    const avgRevPerCategory = computed(() => categoryStats.value.length ? totalRevenue.value / categoryStats.value.length : 0);
    const productAnalyticsData = ref({});
    const abcAll = computed(() => {
      var _a;
      const rows = ((_a = productAnalyticsData.value) == null ? void 0 : _a.abc_analysis) || [];
      const totalRev = rows.reduce((s, r) => s + Number(r.revenue || 0), 0) || 1;
      let cumulative = 0;
      return rows.map((p, i) => {
        cumulative += Number(p.revenue || 0);
        return {
          name: p.product,
          category: p.category || "Uncategorized",
          revenue: Number(p.revenue || 0),
          rank: i + 1,
          sharePct: Number(p.revenue_share || 0),
          cumulative: cumulative / totalRev * 100,
          class: p.abc_class || "C"
        };
      });
    });
    const neverSold = computed(() => {
      var _a;
      return (((_a = productAnalyticsData.value) == null ? void 0 : _a.dead_stock) || []).map((p) => ({
        ...p,
        stockValue: Number(p.stock_value || 0)
      })).sort((a, b) => Number(b.stockValue) - Number(a.stockValue));
    });
    const deadStockValue = computed(() => neverSold.value.reduce((s, p) => s + Number(p.stockValue || 0), 0));
    const deadStockCount = computed(() => neverSold.value.filter((p) => Number(p.quantity_on_hand) > 0).length);
    const slowStock = computed(() => []);
    const tabs = computed(() => [
      { id: "overview", label: "Category Performance", icon: "mdi-chart-donut-variant", count: categoryStats.value.length },
      { id: "abc", label: "ABC Analysis", icon: "mdi-chart-bell-curve", count: abcAll.value.length },
      { id: "slow", label: "Slow Moving", icon: "mdi-turtle", count: slowStock.value.length },
      { id: "dead", label: "Dead Stock", icon: "mdi-package-variant-remove", count: neverSold.value.length }
    ]);
    const palette = ["#3478f6", "#00E396", "#FEB019", "#FF4560", "#775DD0", "#546E7A", "#26a69a", "#D10CE8", "#f43f5e", "#10b981"];
    const catDonutSeries = computed(() => categoryStats.value.map((c) => Math.round(c.revenue)));
    const catDonutOptions = computed(() => ({
      chart: { type: "donut", background: "transparent", foreColor: "rgba(0,0,0,0.6)", fontFamily: "Segoe UI, Inter, sans-serif" },
      labels: categoryStats.value.map((c) => c.name),
      colors: palette,
      legend: { position: "bottom", fontSize: "12px" },
      dataLabels: { enabled: true, formatter: (val) => `${val.toFixed(0)}%` },
      tooltip: { y: { formatter: (v) => formatMoney(v) } },
      stroke: { width: 2, colors: ["rgb(var(--v-theme-surface))"] },
      plotOptions: { pie: { donut: { size: "65%" } } }
    }));
    const catBarSeries = computed(() => [{ name: "Revenue", data: categoryStats.value.map((c) => Math.round(c.revenue)) }]);
    const catBarOptions = computed(() => ({
      chart: { type: "bar", toolbar: { show: false }, background: "transparent", foreColor: "rgba(0,0,0,0.6)", fontFamily: "Segoe UI, Inter, sans-serif" },
      colors: ["#3478f6"],
      plotOptions: { bar: { borderRadius: 6, columnWidth: "50%" } },
      grid: { borderColor: "rgba(0,0,0,0.06)", strokeDashArray: 4 },
      xaxis: { categories: categoryStats.value.map((c) => c.name), labels: { rotate: -25, style: { fontSize: "11px" } } },
      yaxis: { decimalsInFloat: 0, labels: { formatter: (v) => Math.round(Number(v)).toLocaleString("en-GB") } },
      dataLabels: { enabled: false },
      tooltip: { y: { formatter: (v) => formatMoney(v) } }
    }));
    const qtyBarSeries = computed(() => [{ name: "Units Sold", data: categoryStats.value.map((c) => c.qtySold) }]);
    const qtyBarOptions = computed(() => ({
      chart: { type: "bar", toolbar: { show: false }, background: "transparent", foreColor: "rgba(0,0,0,0.6)", fontFamily: "Segoe UI, Inter, sans-serif" },
      colors: ["#FEB019"],
      plotOptions: { bar: { borderRadius: 6, columnWidth: "50%" } },
      grid: { borderColor: "rgba(0,0,0,0.06)", strokeDashArray: 4 },
      xaxis: { categories: categoryStats.value.map((c) => c.name), labels: { rotate: -25, style: { fontSize: "11px" } } },
      yaxis: { decimalsInFloat: 0, labels: { formatter: (v) => Math.round(Number(v)).toLocaleString("en-GB") } },
      dataLabels: { enabled: false },
      tooltip: { y: { formatter: (v) => `${Math.round(Number(v))} units` } }
    }));
    const stockBarSeries = computed(() => [{ name: "Stock Value", data: categoryStats.value.map((c) => Math.round(c.stockValue)) }]);
    const stockBarOptions = computed(() => ({
      chart: { type: "bar", toolbar: { show: false }, background: "transparent", foreColor: "rgba(0,0,0,0.6)", fontFamily: "Segoe UI, Inter, sans-serif" },
      colors: ["#f43f5e"],
      plotOptions: { bar: { borderRadius: 6, columnWidth: "50%" } },
      grid: { borderColor: "rgba(0,0,0,0.06)", strokeDashArray: 4 },
      xaxis: { categories: categoryStats.value.map((c) => c.name), labels: { rotate: -25, style: { fontSize: "11px" } } },
      yaxis: { decimalsInFloat: 0, labels: { formatter: (v) => Math.round(Number(v)).toLocaleString("en-GB") } },
      dataLabels: { enabled: false },
      tooltip: { y: { formatter: (v) => formatMoney(v) } }
    }));
    async function loadData() {
      loading.value = true;
      const q = periodQuery();
      try {
        const api = useApi();
        const [catData, prodData] = await Promise.all([
          api(`/reports/category-analytics/?${q}`),
          api(`/reports/product-analytics/?${q}`)
        ]);
        analyticsData.value = catData;
        productAnalyticsData.value = prodData;
      } catch (e) {
        toast.error("Failed to load category analytics");
      } finally {
        loading.value = false;
      }
    }
    watch(period, loadData);
    return (_ctx, _push, _parent, _attrs) => {
      const _component_apexchart = resolveComponent("apexchart");
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "az-page" }, _attrs))} data-v-7e1aa481><div class="az-header" data-v-7e1aa481><div class="az-header__left" data-v-7e1aa481><div class="az-header__title" data-v-7e1aa481><h1 class="text-h5 font-weight-bold" data-v-7e1aa481>Category Analysis</h1><p class="text-body-2 text-medium-emphasis" data-v-7e1aa481>Category performance, revenue distribution, ABC classification and stock health</p></div></div><div class="az-header__actions" data-v-7e1aa481>`);
      _push(ssrRenderComponent(VBtnGroup, {
        density: "compact",
        variant: "outlined",
        color: "primary"
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<!--[-->`);
            ssrRenderList(periodOptions, (opt) => {
              _push2(ssrRenderComponent(VBtn, {
                key: opt.value,
                variant: unref(period) === opt.value ? "flat" : "text",
                color: unref(period) === opt.value ? "primary" : void 0,
                size: "small",
                onClick: ($event) => period.value = opt.value
              }, {
                default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                  if (_push3) {
                    _push3(`${ssrInterpolate(opt.short)}`);
                  } else {
                    return [
                      createTextVNode(toDisplayString(opt.short), 1)
                    ];
                  }
                }),
                _: 2
              }, _parent2, _scopeId));
            });
            _push2(`<!--]-->`);
          } else {
            return [
              (openBlock(), createBlock(Fragment, null, renderList(periodOptions, (opt) => {
                return createVNode(VBtn, {
                  key: opt.value,
                  variant: unref(period) === opt.value ? "flat" : "text",
                  color: unref(period) === opt.value ? "primary" : void 0,
                  size: "small",
                  onClick: ($event) => period.value = opt.value
                }, {
                  default: withCtx(() => [
                    createTextVNode(toDisplayString(opt.short), 1)
                  ]),
                  _: 2
                }, 1032, ["variant", "color", "onClick"]);
              }), 64))
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(ssrRenderComponent(VBtn, {
        variant: "tonal",
        "prepend-icon": "mdi-refresh",
        size: "small",
        onClick: loadData,
        loading: unref(loading)
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`Refresh`);
          } else {
            return [
              createTextVNode("Refresh")
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(ssrRenderComponent(VBtn, {
        variant: "text",
        "prepend-icon": "mdi-arrow-left",
        size: "small",
        to: "/analytics"
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`Overview`);
          } else {
            return [
              createTextVNode("Overview")
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`</div></div>`);
      if (unref(loading)) {
        _push(`<div class="az-loading" data-v-7e1aa481>`);
        _push(ssrRenderComponent(VProgressCircular, {
          indeterminate: "",
          color: "primary",
          size: "32",
          width: "3"
        }, null, _parent));
        _push(`<p class="text-body-2 text-medium-emphasis mt-3" data-v-7e1aa481>Loading category analytics\u2026</p></div>`);
      } else {
        _push(`<!--[--><div class="az-kpi-grid" data-v-7e1aa481><div class="az-kpi" data-v-7e1aa481><div class="az-kpi__icon az-kpi__icon--primary" data-v-7e1aa481>`);
        _push(ssrRenderComponent(VIcon, { size: "22" }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`mdi-tag-multiple`);
            } else {
              return [
                createTextVNode("mdi-tag-multiple")
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(`</div><div class="az-kpi__body" data-v-7e1aa481><p class="az-kpi__label" data-v-7e1aa481>Total Categories</p><p class="az-kpi__value" data-v-7e1aa481>${ssrInterpolate(unref(categoryStats).length)}</p><p class="az-kpi__sub" data-v-7e1aa481>${ssrInterpolate(unref(categoryStats).length)} categories total</p></div></div><div class="az-kpi" data-v-7e1aa481><div class="az-kpi__icon az-kpi__icon--success" data-v-7e1aa481>`);
        _push(ssrRenderComponent(VIcon, { size: "22" }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`mdi-cash-multiple`);
            } else {
              return [
                createTextVNode("mdi-cash-multiple")
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(`</div><div class="az-kpi__body" data-v-7e1aa481><p class="az-kpi__label" data-v-7e1aa481>Total Revenue</p><p class="az-kpi__value text-success" data-v-7e1aa481>${ssrInterpolate(formatMoney(unref(totalRevenue)))}</p><p class="az-kpi__sub" data-v-7e1aa481>across ${ssrInterpolate(unref(totalCategories))} categories</p></div></div><div class="az-kpi" data-v-7e1aa481><div class="az-kpi__icon az-kpi__icon--info" data-v-7e1aa481>`);
        _push(ssrRenderComponent(VIcon, { size: "22" }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`mdi-chart-line`);
            } else {
              return [
                createTextVNode("mdi-chart-line")
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(`</div><div class="az-kpi__body" data-v-7e1aa481><p class="az-kpi__label" data-v-7e1aa481>Top Category</p><p class="az-kpi__value text-info" data-v-7e1aa481>${ssrInterpolate(unref(topCategory) ? unref(topCategory).name : "\u2014")}</p><p class="az-kpi__sub" data-v-7e1aa481>${ssrInterpolate(unref(topCategory) ? unref(topPct).toFixed(1) + "% of revenue" : "")}</p></div></div><div class="az-kpi" data-v-7e1aa481><div class="az-kpi__icon az-kpi__icon--warning" data-v-7e1aa481>`);
        _push(ssrRenderComponent(VIcon, { size: "22" }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`mdi-package-variant`);
            } else {
              return [
                createTextVNode("mdi-package-variant")
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(`</div><div class="az-kpi__body" data-v-7e1aa481><p class="az-kpi__label" data-v-7e1aa481>Stock Value</p><p class="az-kpi__value text-warning" data-v-7e1aa481>${ssrInterpolate(formatMoney(unref(totalStockValue)))}</p><p class="az-kpi__sub" data-v-7e1aa481>${ssrInterpolate(unref(totalStockQty))} units in stock</p></div></div><div class="az-kpi" data-v-7e1aa481><div class="az-kpi__icon az-kpi__icon--teal" data-v-7e1aa481>`);
        _push(ssrRenderComponent(VIcon, { size: "22" }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`mdi-currency-usd-off`);
            } else {
              return [
                createTextVNode("mdi-currency-usd-off")
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(`</div><div class="az-kpi__body" data-v-7e1aa481><p class="az-kpi__label" data-v-7e1aa481>Dead Stock Value</p><p class="az-kpi__value" style="${ssrRenderStyle({ "color": "#00B8D4" })}" data-v-7e1aa481>${ssrInterpolate(formatMoney(unref(deadStockValue)))}</p><p class="az-kpi__sub" data-v-7e1aa481>${ssrInterpolate(unref(deadStockCount))} unsold products</p></div></div><div class="az-kpi" data-v-7e1aa481><div class="az-kpi__icon az-kpi__icon--purple" data-v-7e1aa481>`);
        _push(ssrRenderComponent(VIcon, { size: "22" }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`mdi-scale-balance`);
            } else {
              return [
                createTextVNode("mdi-scale-balance")
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(`</div><div class="az-kpi__body" data-v-7e1aa481><p class="az-kpi__label" data-v-7e1aa481>Avg Revenue / Category</p><p class="az-kpi__value" style="${ssrRenderStyle({ "color": "#7C4DFF" })}" data-v-7e1aa481>${ssrInterpolate(formatMoney(unref(avgRevPerCategory)))}</p><p class="az-kpi__sub" data-v-7e1aa481>across ${ssrInterpolate(unref(categoryStats).length)} categories</p></div></div></div><div class="az-chart-row az-chart-row--first" data-v-7e1aa481><div class="az-card az-card--third" data-v-7e1aa481><div class="az-card__header" data-v-7e1aa481><div class="az-card__header-icon az-card__header-icon--blue" data-v-7e1aa481>`);
        _push(ssrRenderComponent(VIcon, { size: "20" }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`mdi-chart-donut`);
            } else {
              return [
                createTextVNode("mdi-chart-donut")
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(`</div><div data-v-7e1aa481><h3 class="az-card__title" data-v-7e1aa481>Revenue Distribution</h3><p class="az-card__subtitle" data-v-7e1aa481>Share of revenue by category</p></div></div><div class="az-card__body" data-v-7e1aa481>`);
        _push(ssrRenderComponent(_component_apexchart, {
          type: "donut",
          height: "380",
          options: unref(catDonutOptions),
          series: unref(catDonutSeries)
        }, null, _parent));
        _push(`</div></div><div class="az-card az-card--two-thirds" data-v-7e1aa481><div class="az-card__header" data-v-7e1aa481><div class="az-card__header-icon az-card__header-icon--green" data-v-7e1aa481>`);
        _push(ssrRenderComponent(VIcon, { size: "20" }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`mdi-chart-bar`);
            } else {
              return [
                createTextVNode("mdi-chart-bar")
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(`</div><div data-v-7e1aa481><h3 class="az-card__title" data-v-7e1aa481>Revenue by Category</h3><p class="az-card__subtitle" data-v-7e1aa481>Sorted by revenue contribution</p></div></div><div class="az-card__body" data-v-7e1aa481>`);
        _push(ssrRenderComponent(_component_apexchart, {
          type: "bar",
          height: "380",
          options: unref(catBarOptions),
          series: unref(catBarSeries)
        }, null, _parent));
        _push(`</div></div></div><div class="az-chart-row" data-v-7e1aa481><div class="az-card az-card--half" data-v-7e1aa481><div class="az-card__header" data-v-7e1aa481><div class="az-card__header-icon az-card__header-icon--amber" data-v-7e1aa481>`);
        _push(ssrRenderComponent(VIcon, { size: "20" }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`mdi-package-variant-closed-check`);
            } else {
              return [
                createTextVNode("mdi-package-variant-closed-check")
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(`</div><div data-v-7e1aa481><h3 class="az-card__title" data-v-7e1aa481>Units Sold by Category</h3><p class="az-card__subtitle" data-v-7e1aa481>Total quantity sold this period</p></div></div><div class="az-card__body" data-v-7e1aa481>`);
        _push(ssrRenderComponent(_component_apexchart, {
          type: "bar",
          height: "300",
          options: unref(qtyBarOptions),
          series: unref(qtyBarSeries)
        }, null, _parent));
        _push(`</div></div><div class="az-card az-card--half" data-v-7e1aa481><div class="az-card__header" data-v-7e1aa481><div class="az-card__header-icon az-card__header-icon--rose" data-v-7e1aa481>`);
        _push(ssrRenderComponent(VIcon, { size: "20" }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`mdi-package-variant`);
            } else {
              return [
                createTextVNode("mdi-package-variant")
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(`</div><div data-v-7e1aa481><h3 class="az-card__title" data-v-7e1aa481>Stock Value by Category</h3><p class="az-card__subtitle" data-v-7e1aa481>Capital tied up per category</p></div></div><div class="az-card__body" data-v-7e1aa481>`);
        _push(ssrRenderComponent(_component_apexchart, {
          type: "bar",
          height: "300",
          options: unref(stockBarOptions),
          series: unref(stockBarSeries)
        }, null, _parent));
        _push(`</div></div></div><div class="az-tabs" data-v-7e1aa481><!--[-->`);
        ssrRenderList(unref(tabs), (tab) => {
          _push(`<button class="${ssrRenderClass([{ "az-tab--active": unref(activeTab) === tab.id }, "az-tab"])}" data-v-7e1aa481>`);
          _push(ssrRenderComponent(VIcon, {
            size: "18",
            class: "mr-1"
          }, {
            default: withCtx((_, _push2, _parent2, _scopeId) => {
              if (_push2) {
                _push2(`${ssrInterpolate(tab.icon)}`);
              } else {
                return [
                  createTextVNode(toDisplayString(tab.icon), 1)
                ];
              }
            }),
            _: 2
          }, _parent));
          _push(` ${ssrInterpolate(tab.label)} <span class="az-tab__badge" data-v-7e1aa481>${ssrInterpolate(tab.count)}</span></button>`);
        });
        _push(`<!--]--></div>`);
        if (unref(activeTab) === "overview") {
          _push(`<div class="az-table-wrap" data-v-7e1aa481><table class="az-table" data-v-7e1aa481><thead data-v-7e1aa481><tr data-v-7e1aa481><th data-v-7e1aa481>Rank</th><th data-v-7e1aa481>Category</th><th class="text-right" data-v-7e1aa481>Products</th><th class="text-right" data-v-7e1aa481>Units Sold</th><th class="text-right" data-v-7e1aa481>Revenue</th><th class="text-right" data-v-7e1aa481>% Share</th><th class="text-right" data-v-7e1aa481>Stock Value</th><th data-v-7e1aa481>% of Revenue</th></tr></thead><tbody data-v-7e1aa481><!--[-->`);
          ssrRenderList(unref(categoryStats), (c, idx) => {
            _push(`<tr class="az-table__row" data-v-7e1aa481><td class="font-weight-bold" data-v-7e1aa481>#${ssrInterpolate(idx + 1)}</td><td class="az-table__product" data-v-7e1aa481><div class="${ssrRenderClass([`az-cat-icon--${idx % 5}`, "az-cat-icon"])}" data-v-7e1aa481>${ssrInterpolate((c.name || "?").charAt(0).toUpperCase())}</div> ${ssrInterpolate(c.name)}</td><td class="text-right" data-v-7e1aa481>${ssrInterpolate(c.productCount)}</td><td class="text-right" data-v-7e1aa481>${ssrInterpolate(c.qtySold)}</td><td class="text-right font-weight-bold text-success" data-v-7e1aa481>${ssrInterpolate(formatMoney(c.revenue))}</td><td class="text-right text-medium-emphasis" data-v-7e1aa481>${ssrInterpolate(c.sharePct.toFixed(1))}%</td><td class="text-right" data-v-7e1aa481>${ssrInterpolate(formatMoney(c.stockValue))}</td><td data-v-7e1aa481><div class="az-bar-wrap" data-v-7e1aa481><div class="az-bar-fill az-bar-fill--success" style="${ssrRenderStyle({ width: c.sharePct + "%" })}" data-v-7e1aa481></div></div></td></tr>`);
          });
          _push(`<!--]-->`);
          if (!unref(categoryStats).length) {
            _push(`<tr data-v-7e1aa481><td colspan="8" class="az-table__empty" data-v-7e1aa481>`);
            _push(ssrRenderComponent(VIcon, {
              size: "36",
              color: "grey-lighten-1"
            }, {
              default: withCtx((_, _push2, _parent2, _scopeId) => {
                if (_push2) {
                  _push2(`mdi-tag-off`);
                } else {
                  return [
                    createTextVNode("mdi-tag-off")
                  ];
                }
              }),
              _: 1
            }, _parent));
            _push(`<p class="text-body-2 mt-2 text-medium-emphasis" data-v-7e1aa481>No categories found.</p></td></tr>`);
          } else {
            _push(`<!---->`);
          }
          _push(`</tbody></table></div>`);
        } else {
          _push(`<!---->`);
        }
        if (unref(activeTab) === "abc") {
          _push(`<div class="az-table-wrap" data-v-7e1aa481><table class="az-table" data-v-7e1aa481><thead data-v-7e1aa481><tr data-v-7e1aa481><th data-v-7e1aa481>Rank</th><th data-v-7e1aa481>Product</th><th data-v-7e1aa481>Category</th><th class="text-right" data-v-7e1aa481>Revenue</th><th class="text-right" data-v-7e1aa481>% Share</th><th class="text-right" data-v-7e1aa481>Cumulative</th><th data-v-7e1aa481>Class</th></tr></thead><tbody data-v-7e1aa481><!--[-->`);
          ssrRenderList(unref(abcAll), (p) => {
            _push(`<tr class="az-table__row" data-v-7e1aa481><td class="font-weight-bold" data-v-7e1aa481>#${ssrInterpolate(p.rank)}</td><td class="az-table__product" data-v-7e1aa481>${ssrInterpolate(p.name)}</td><td class="text-medium-emphasis" data-v-7e1aa481>${ssrInterpolate(p.category)}</td><td class="text-right font-weight-bold text-success" data-v-7e1aa481>${ssrInterpolate(formatMoney(p.revenue))}</td><td class="text-right text-medium-emphasis" data-v-7e1aa481>${ssrInterpolate(p.sharePct.toFixed(1))}%</td><td class="text-right text-medium-emphasis" data-v-7e1aa481>${ssrInterpolate(p.cumulative.toFixed(1))}%</td><td data-v-7e1aa481><span class="${ssrRenderClass([`az-class-badge--${p.class.toLowerCase()}`, "az-class-badge"])}" data-v-7e1aa481>${ssrInterpolate(p.class)}</span></td></tr>`);
          });
          _push(`<!--]-->`);
          if (!unref(abcAll).length) {
            _push(`<tr data-v-7e1aa481><td colspan="7" class="az-table__empty" data-v-7e1aa481>`);
            _push(ssrRenderComponent(VIcon, {
              size: "36",
              color: "grey-lighten-1"
            }, {
              default: withCtx((_, _push2, _parent2, _scopeId) => {
                if (_push2) {
                  _push2(`mdi-chart-bell-curve`);
                } else {
                  return [
                    createTextVNode("mdi-chart-bell-curve")
                  ];
                }
              }),
              _: 1
            }, _parent));
            _push(`<p class="text-body-2 mt-2 text-medium-emphasis" data-v-7e1aa481>No ABC data for this period.</p></td></tr>`);
          } else {
            _push(`<!---->`);
          }
          _push(`</tbody></table></div>`);
        } else {
          _push(`<!---->`);
        }
        if (unref(activeTab) === "slow") {
          _push(`<div class="az-table-wrap" data-v-7e1aa481><table class="az-table" data-v-7e1aa481><thead data-v-7e1aa481><tr data-v-7e1aa481><th data-v-7e1aa481>Product</th><th data-v-7e1aa481>Category</th><th class="text-right" data-v-7e1aa481>Qty on Hand</th><th class="text-right" data-v-7e1aa481>Stock Value</th><th data-v-7e1aa481>Last Sold</th><th data-v-7e1aa481>Days Idle</th></tr></thead><tbody data-v-7e1aa481><!--[-->`);
          ssrRenderList(unref(slowStock), (p) => {
            _push(`<tr class="az-table__row" data-v-7e1aa481><td class="az-table__product" data-v-7e1aa481>${ssrInterpolate(p.name)}</td><td class="text-medium-emphasis" data-v-7e1aa481>${ssrInterpolate(p.category_name || "Uncategorized")}</td><td class="text-right" data-v-7e1aa481>${ssrInterpolate(p.quantity_on_hand || 0)}</td><td class="text-right font-weight-bold text-warning" data-v-7e1aa481>${ssrInterpolate(formatMoney(p.stockValue))}</td><td class="text-medium-emphasis" data-v-7e1aa481>${ssrInterpolate(p.last_sold ? formatDate(p.last_sold) : "Never")}</td><td data-v-7e1aa481><span class="${ssrRenderClass([p.daysIdle > 60 ? "az-idle-badge--critical" : "az-idle-badge--warn", "az-idle-badge"])}" data-v-7e1aa481>${ssrInterpolate(p.daysIdle)}d</span></td></tr>`);
          });
          _push(`<!--]-->`);
          if (!unref(slowStock).length) {
            _push(`<tr data-v-7e1aa481><td colspan="6" class="az-table__empty" data-v-7e1aa481>`);
            _push(ssrRenderComponent(VIcon, {
              size: "36",
              color: "grey-lighten-1"
            }, {
              default: withCtx((_, _push2, _parent2, _scopeId) => {
                if (_push2) {
                  _push2(`mdi-turtle`);
                } else {
                  return [
                    createTextVNode("mdi-turtle")
                  ];
                }
              }),
              _: 1
            }, _parent));
            _push(`<p class="text-body-2 mt-2 text-medium-emphasis" data-v-7e1aa481>No slow-moving products detected.</p></td></tr>`);
          } else {
            _push(`<!---->`);
          }
          _push(`</tbody></table></div>`);
        } else {
          _push(`<!---->`);
        }
        if (unref(activeTab) === "dead") {
          _push(`<div class="az-table-wrap" data-v-7e1aa481><table class="az-table" data-v-7e1aa481><thead data-v-7e1aa481><tr data-v-7e1aa481><th data-v-7e1aa481>Product</th><th data-v-7e1aa481>Category</th><th class="text-right" data-v-7e1aa481>Qty on Hand</th><th class="text-right" data-v-7e1aa481>Unit Cost</th><th class="text-right" data-v-7e1aa481>Stock Value</th></tr></thead><tbody data-v-7e1aa481><!--[-->`);
          ssrRenderList(unref(neverSold), (p) => {
            _push(`<tr class="az-table__row" data-v-7e1aa481><td class="az-table__product" data-v-7e1aa481>${ssrInterpolate(p.name)}</td><td class="text-medium-emphasis" data-v-7e1aa481>${ssrInterpolate(p.category_name || "Uncategorized")}</td><td class="text-right" data-v-7e1aa481>${ssrInterpolate(p.quantity_on_hand || 0)}</td><td class="text-right text-medium-emphasis" data-v-7e1aa481>${ssrInterpolate(formatMoney(p.cost_price))}</td><td class="text-right font-weight-bold text-error" data-v-7e1aa481>${ssrInterpolate(formatMoney(p.stockValue))}</td></tr>`);
          });
          _push(`<!--]-->`);
          if (!unref(neverSold).length) {
            _push(`<tr data-v-7e1aa481><td colspan="5" class="az-table__empty" data-v-7e1aa481>`);
            _push(ssrRenderComponent(VIcon, {
              size: "36",
              color: "grey-lighten-1"
            }, {
              default: withCtx((_, _push2, _parent2, _scopeId) => {
                if (_push2) {
                  _push2(`mdi-package-variant-closed-check`);
                } else {
                  return [
                    createTextVNode("mdi-package-variant-closed-check")
                  ];
                }
              }),
              _: 1
            }, _parent));
            _push(`<p class="text-body-2 mt-2 text-medium-emphasis" data-v-7e1aa481>No dead stock detected.</p></td></tr>`);
          } else {
            _push(`<!---->`);
          }
          _push(`</tbody></table></div>`);
        } else {
          _push(`<!---->`);
        }
        _push(`<!--]-->`);
      }
      _push(`</div>`);
    };
  }
};
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/analytics/categories.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const categories = /* @__PURE__ */ _export_sfc(_sfc_main, [["__scopeId", "data-v-7e1aa481"]]);

export { categories as default };
//# sourceMappingURL=categories-BeI078dZ.mjs.map
