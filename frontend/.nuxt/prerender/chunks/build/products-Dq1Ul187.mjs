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
  __name: "products",
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
    const activeTab = ref("abc");
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
    const productRanking = computed(() => {
      var _a;
      const rows = ((_a = analyticsData.value) == null ? void 0 : _a.abc_analysis) || [];
      const totalRev = rows.reduce((s, r) => s + Number(r.revenue || 0), 0) || 1;
      let cumulative = 0;
      return rows.map((p, i) => {
        cumulative += Number(p.revenue || 0);
        return {
          ...p,
          name: p.product,
          qtySold: Number(p.qty_sold || 0),
          rank: i + 1,
          sharePct: Number(p.revenue_share || 0),
          cumulative: cumulative / totalRev * 100,
          avgPrice: Number(p.qty_sold) > 0 ? Number(p.revenue) / Number(p.qty_sold) : 0,
          class: p.abc_class || "C"
        };
      });
    });
    const kpis = computed(() => {
      var _a;
      return ((_a = analyticsData.value) == null ? void 0 : _a.kpis) || {};
    });
    const totalProducts = computed(() => Number(kpis.value.total_products || 0));
    const activeProducts = computed(() => totalProducts.value);
    const soldCount = computed(() => Number(kpis.value.products_sold || 0));
    const neverSoldCount = computed(() => Number(kpis.value.products_never_sold || 0));
    const soldPct = computed(() => totalProducts.value ? soldCount.value / totalProducts.value * 100 : 0);
    const neverSoldPct = computed(() => totalProducts.value ? neverSoldCount.value / totalProducts.value * 100 : 0);
    const avgRevPerProduct = computed(() => {
      const total = Number(kpis.value.total_revenue || 0);
      return totalProducts.value ? total / totalProducts.value : 0;
    });
    const topProductRevenue = computed(() => Number(kpis.value.top_product_revenue || 0));
    const topPct = computed(() => Number(kpis.value.top_product_share || 0));
    const topProducts = computed(() => {
      var _a;
      return (((_a = analyticsData.value) == null ? void 0 : _a.top_products) || []).map((p) => ({
        ...p,
        name: p.product,
        sharePct: Number(p.revenue_share || 0),
        avgPrice: Number(p.qty_sold) > 0 ? Number(p.revenue) / Number(p.qty_sold) : 0
      }));
    });
    const neverSoldProducts = computed(() => {
      var _a;
      return (((_a = analyticsData.value) == null ? void 0 : _a.dead_stock) || []).map((p) => ({
        ...p,
        stockValue: Number(p.stock_value || 0)
      }));
    });
    const deadStock = computed(() => neverSoldProducts.value.map((p) => ({
      ...p,
      deadPct: 0
    })).sort((a, b) => Number(b.stockValue) - Number(a.stockValue)));
    const deadStockValue = computed(() => deadStock.value.reduce((s, p) => s + Number(p.stockValue || 0), 0));
    const slowMoving = computed(() => []);
    const tabs = computed(() => [
      { id: "abc", label: "ABC Classification", icon: "mdi-chart-donut-variant", count: productRanking.value.length },
      { id: "top", label: "Top 20 Products", icon: "mdi-trophy-award", count: topProducts.value.length },
      { id: "slow", label: "Slow Moving", icon: "mdi-turtle", count: slowMoving.value.length },
      { id: "never", label: "Never Sold", icon: "mdi-help-circle-outline", count: neverSoldProducts.value.length },
      { id: "dead", label: "Dead Stock", icon: "mdi-package-variant-remove", count: deadStock.value.length }
    ]);
    const palette = ["#3478f6", "#00E396", "#FEB019", "#FF4560", "#775DD0", "#546E7A", "#26a69a", "#D10CE8", "#f43f5e", "#10b981"];
    const top20Series = computed(() => [{ name: "Revenue", data: topProducts.value.map((p) => Math.round(p.revenue)) }]);
    const top20Options = computed(() => ({
      chart: { type: "bar", toolbar: { show: false }, background: "transparent", foreColor: "rgba(0,0,0,0.6)", fontFamily: "Segoe UI, Inter, sans-serif" },
      colors: ["#3478f6"],
      plotOptions: { bar: { borderRadius: 4, horizontal: true, barHeight: "70%" } },
      grid: { borderColor: "rgba(0,0,0,0.06)", xaxis: { lines: { show: true } } },
      xaxis: { categories: topProducts.value.map((p) => p.name), labels: { formatter: (v) => formatMoney(v), style: { fontSize: "11px" } } },
      dataLabels: { enabled: false },
      yaxis: { labels: { style: { fontSize: "11px" } } },
      tooltip: { y: { formatter: (v) => formatMoney(v) } }
    }));
    const categorySeries = computed(() => {
      const map = {};
      productRanking.value.forEach((p) => {
        const cat = p.category || "Uncategorized";
        map[cat] = (map[cat] || 0) + Number(p.revenue || 0);
      });
      return Object.values(map);
    });
    const categoryOptions = computed(() => {
      const map = {};
      productRanking.value.forEach((p) => {
        const cat = p.category || "Uncategorized";
        map[cat] = true;
      });
      return {
        chart: { type: "donut", background: "transparent", foreColor: "rgba(0,0,0,0.6)", fontFamily: "Segoe UI, Inter, sans-serif" },
        labels: Object.keys(map),
        colors: palette,
        legend: { position: "bottom", fontSize: "12px" },
        dataLabels: { enabled: true, formatter: (val) => `${val.toFixed(0)}%` },
        tooltip: { y: { formatter: (v) => formatMoney(v) } },
        stroke: { width: 2, colors: ["rgb(var(--v-theme-surface))"] },
        plotOptions: { pie: { donut: { size: "65%" } } }
      };
    });
    const abcChartSeries = computed(() => [
      productRanking.value.filter((p) => p.class === "A").reduce((s, p) => s + Number(p.revenue), 0),
      productRanking.value.filter((p) => p.class === "B").reduce((s, p) => s + Number(p.revenue), 0),
      productRanking.value.filter((p) => p.class === "C").reduce((s, p) => s + Number(p.revenue), 0)
    ]);
    const abcChartOptions = computed(() => ({
      chart: { type: "donut", background: "transparent", foreColor: "rgba(0,0,0,0.6)", fontFamily: "Segoe UI, Inter, sans-serif" },
      labels: ["A-Class (80%)", "B-Class (15%)", "C-Class (5%)"],
      colors: ["#10b981", "#f59e0b", "#ef4444"],
      legend: { position: "bottom", fontSize: "12px" },
      dataLabels: { enabled: true, formatter: (val) => `${val.toFixed(0)}%` },
      tooltip: { y: { formatter: (v) => formatMoney(v) } },
      stroke: { width: 2, colors: ["rgb(var(--v-theme-surface))"] },
      plotOptions: { pie: { donut: { size: "65%" } } }
    }));
    const scatterSeries = computed(() => {
      return [{
        name: "Products",
        data: productRanking.value.slice(0, 50).map((p) => ({
          x: Number(p.qty_sold),
          y: Math.round(p.avgPrice),
          name: p.product
        }))
      }];
    });
    const scatterOptions = computed(() => ({
      chart: { type: "scatter", toolbar: { show: false }, background: "transparent", foreColor: "rgba(0,0,0,0.6)", fontFamily: "Segoe UI, Inter, sans-serif" },
      colors: ["#7C4DFF"],
      grid: { borderColor: "rgba(0,0,0,0.06)", strokeDashArray: 4 },
      xaxis: { title: { text: "Quantity Sold", style: { fontSize: "12px" } }, labels: { formatter: (v) => Math.round(Number(v)).toLocaleString("en-GB") } },
      yaxis: { decimalsInFloat: 0, title: { text: "Avg Unit Price", style: { fontSize: "12px" } }, labels: { formatter: (v) => Math.round(Number(v)).toLocaleString("en-GB") } },
      dataLabels: { enabled: false },
      tooltip: {
        custom: ({ seriesIndex, dataPointIndex, w }) => {
          const point = w.config.series[seriesIndex].data[dataPointIndex];
          return `<div style="padding:8px 12px;font-size:13px;"><b>${point.name}</b><br/>Qty: ${point.x}<br/>Avg Price: ${formatMoney(point.y)}<br/>Revenue: ${formatMoney(point.x * point.y)}</div>`;
        }
      },
      markers: { size: 6, colors: ["#7C4DFF"], opacity: 0.7 }
    }));
    async function loadData() {
      loading.value = true;
      const q = periodQuery();
      try {
        analyticsData.value = await useApi()(`/reports/product-analytics/?${q}`);
      } catch (e) {
        toast.error("Failed to load product analytics");
      } finally {
        loading.value = false;
      }
    }
    watch(period, loadData);
    return (_ctx, _push, _parent, _attrs) => {
      const _component_apexchart = resolveComponent("apexchart");
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "az-page" }, _attrs))} data-v-b8efc9cb><div class="az-header" data-v-b8efc9cb><div class="az-header__left" data-v-b8efc9cb><div class="az-header__title" data-v-b8efc9cb><h1 class="text-h5 font-weight-bold" data-v-b8efc9cb>Product Analysis</h1><p class="text-body-2 text-medium-emphasis" data-v-b8efc9cb>Product performance, ABC classification, revenue ranking and stock health</p></div></div><div class="az-header__actions" data-v-b8efc9cb>`);
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
        _push(`<div class="az-loading" data-v-b8efc9cb>`);
        _push(ssrRenderComponent(VProgressCircular, {
          indeterminate: "",
          color: "primary",
          size: "32",
          width: "3"
        }, null, _parent));
        _push(`<p class="text-body-2 text-medium-emphasis mt-3" data-v-b8efc9cb>Loading product analytics\u2026</p></div>`);
      } else {
        _push(`<!--[--><div class="az-kpi-grid" data-v-b8efc9cb><div class="az-kpi" data-v-b8efc9cb><div class="az-kpi__icon az-kpi__icon--primary" data-v-b8efc9cb>`);
        _push(ssrRenderComponent(VIcon, { size: "22" }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`mdi-package-variant-closed`);
            } else {
              return [
                createTextVNode("mdi-package-variant-closed")
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(`</div><div class="az-kpi__body" data-v-b8efc9cb><p class="az-kpi__label" data-v-b8efc9cb>Total Products</p><p class="az-kpi__value" data-v-b8efc9cb>${ssrInterpolate(unref(totalProducts))}</p><p class="az-kpi__sub" data-v-b8efc9cb>${ssrInterpolate(unref(activeProducts))} active SKUs</p></div></div><div class="az-kpi" data-v-b8efc9cb><div class="az-kpi__icon az-kpi__icon--success" data-v-b8efc9cb>`);
        _push(ssrRenderComponent(VIcon, { size: "22" }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`mdi-cash-check`);
            } else {
              return [
                createTextVNode("mdi-cash-check")
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(`</div><div class="az-kpi__body" data-v-b8efc9cb><p class="az-kpi__label" data-v-b8efc9cb>Products Sold</p><p class="az-kpi__value text-success" data-v-b8efc9cb>${ssrInterpolate(unref(soldCount))}</p><p class="az-kpi__sub" data-v-b8efc9cb>${ssrInterpolate(unref(soldPct).toFixed(1))}% of catalogue</p></div></div><div class="az-kpi" data-v-b8efc9cb><div class="az-kpi__icon az-kpi__icon--warning" data-v-b8efc9cb>`);
        _push(ssrRenderComponent(VIcon, { size: "22" }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`mdi-package-variant-remove`);
            } else {
              return [
                createTextVNode("mdi-package-variant-remove")
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(`</div><div class="az-kpi__body" data-v-b8efc9cb><p class="az-kpi__label" data-v-b8efc9cb>Never Sold</p><p class="az-kpi__value text-warning" data-v-b8efc9cb>${ssrInterpolate(unref(neverSoldCount))}</p><p class="az-kpi__sub" data-v-b8efc9cb>${ssrInterpolate(unref(neverSoldPct).toFixed(1))}% of catalogue</p></div></div><div class="az-kpi" data-v-b8efc9cb><div class="az-kpi__icon az-kpi__icon--info" data-v-b8efc9cb>`);
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
        _push(`</div><div class="az-kpi__body" data-v-b8efc9cb><p class="az-kpi__label" data-v-b8efc9cb>Avg Revenue / Product</p><p class="az-kpi__value text-info" data-v-b8efc9cb>${ssrInterpolate(formatMoney(unref(avgRevPerProduct)))}</p><p class="az-kpi__sub" data-v-b8efc9cb>across ${ssrInterpolate(unref(soldCount))} sold items</p></div></div><div class="az-kpi" data-v-b8efc9cb><div class="az-kpi__icon az-kpi__icon--teal" data-v-b8efc9cb>`);
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
        _push(`</div><div class="az-kpi__body" data-v-b8efc9cb><p class="az-kpi__label" data-v-b8efc9cb>Dead Stock Value</p><p class="az-kpi__value" style="${ssrRenderStyle({ "color": "#00B8D4" })}" data-v-b8efc9cb>${ssrInterpolate(formatMoney(unref(deadStockValue)))}</p><p class="az-kpi__sub" data-v-b8efc9cb>${ssrInterpolate(unref(deadStock).length)} products</p></div></div><div class="az-kpi" data-v-b8efc9cb><div class="az-kpi__icon az-kpi__icon--purple" data-v-b8efc9cb>`);
        _push(ssrRenderComponent(VIcon, { size: "22" }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`mdi-trophy-variant`);
            } else {
              return [
                createTextVNode("mdi-trophy-variant")
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(`</div><div class="az-kpi__body" data-v-b8efc9cb><p class="az-kpi__label" data-v-b8efc9cb>Top Product Revenue</p><p class="az-kpi__value" style="${ssrRenderStyle({ "color": "#7C4DFF" })}" data-v-b8efc9cb>${ssrInterpolate(formatMoney(unref(topProductRevenue)))}</p><p class="az-kpi__sub" data-v-b8efc9cb>${ssrInterpolate(unref(topPct).toFixed(1))}% of total revenue</p></div></div></div><div class="az-chart-row az-chart-row--first" data-v-b8efc9cb><div class="az-card az-card--two-thirds" data-v-b8efc9cb><div class="az-card__header" data-v-b8efc9cb><div class="az-card__header-icon az-card__header-icon--blue" data-v-b8efc9cb>`);
        _push(ssrRenderComponent(VIcon, { size: "20" }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`mdi-trophy-award`);
            } else {
              return [
                createTextVNode("mdi-trophy-award")
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(`</div><div data-v-b8efc9cb><h3 class="az-card__title" data-v-b8efc9cb>Top 20 Products by Revenue</h3><p class="az-card__subtitle" data-v-b8efc9cb>Best-performing products in selected period</p></div></div><div class="az-card__body" data-v-b8efc9cb>`);
        _push(ssrRenderComponent(_component_apexchart, {
          type: "bar",
          height: "420",
          options: unref(top20Options),
          series: unref(top20Series)
        }, null, _parent));
        _push(`</div></div><div class="az-card az-card--third" data-v-b8efc9cb><div class="az-card__header" data-v-b8efc9cb><div class="az-card__header-icon az-card__header-icon--green" data-v-b8efc9cb>`);
        _push(ssrRenderComponent(VIcon, { size: "20" }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`mdi-chart-pie`);
            } else {
              return [
                createTextVNode("mdi-chart-pie")
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(`</div><div data-v-b8efc9cb><h3 class="az-card__title" data-v-b8efc9cb>Revenue by Category</h3><p class="az-card__subtitle" data-v-b8efc9cb>Distribution across categories</p></div></div><div class="az-card__body" data-v-b8efc9cb>`);
        _push(ssrRenderComponent(_component_apexchart, {
          type: "donut",
          height: "420",
          options: unref(categoryOptions),
          series: unref(categorySeries)
        }, null, _parent));
        _push(`</div></div></div><div class="az-chart-row" data-v-b8efc9cb><div class="az-card az-card--half" data-v-b8efc9cb><div class="az-card__header" data-v-b8efc9cb><div class="az-card__header-icon az-card__header-icon--amber" data-v-b8efc9cb>`);
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
        _push(`</div><div data-v-b8efc9cb><h3 class="az-card__title" data-v-b8efc9cb>ABC Classification</h3><p class="az-card__subtitle" data-v-b8efc9cb>Pareto distribution by revenue</p></div></div><div class="az-card__body" data-v-b8efc9cb>`);
        _push(ssrRenderComponent(_component_apexchart, {
          type: "donut",
          height: "320",
          options: unref(abcChartOptions),
          series: unref(abcChartSeries)
        }, null, _parent));
        _push(`</div></div><div class="az-card az-card--half" data-v-b8efc9cb><div class="az-card__header" data-v-b8efc9cb><div class="az-card__header-icon az-card__header-icon--rose" data-v-b8efc9cb>`);
        _push(ssrRenderComponent(VIcon, { size: "20" }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`mdi-chart-bubble`);
            } else {
              return [
                createTextVNode("mdi-chart-bubble")
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(`</div><div data-v-b8efc9cb><h3 class="az-card__title" data-v-b8efc9cb>Qty Sold vs Avg Price</h3><p class="az-card__subtitle" data-v-b8efc9cb>Each dot is a product \u2014 hover for details</p></div></div><div class="az-card__body" data-v-b8efc9cb>`);
        _push(ssrRenderComponent(_component_apexchart, {
          type: "scatter",
          height: "320",
          options: unref(scatterOptions),
          series: unref(scatterSeries)
        }, null, _parent));
        _push(`</div></div></div><div class="az-tabs" data-v-b8efc9cb><!--[-->`);
        ssrRenderList(unref(tabs), (tab) => {
          _push(`<button class="${ssrRenderClass([{ "az-tab--active": unref(activeTab) === tab.id }, "az-tab"])}" data-v-b8efc9cb>`);
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
          _push(` ${ssrInterpolate(tab.label)} <span class="az-tab__badge" data-v-b8efc9cb>${ssrInterpolate(tab.count)}</span></button>`);
        });
        _push(`<!--]--></div>`);
        if (unref(activeTab) === "abc") {
          _push(`<div class="az-table-wrap" data-v-b8efc9cb><table class="az-table" data-v-b8efc9cb><thead data-v-b8efc9cb><tr data-v-b8efc9cb><th data-v-b8efc9cb>Rank</th><th data-v-b8efc9cb>Product</th><th data-v-b8efc9cb>Category</th><th class="text-right" data-v-b8efc9cb>Qty Sold</th><th class="text-right" data-v-b8efc9cb>Revenue</th><th class="text-right" data-v-b8efc9cb>% Share</th><th class="text-right" data-v-b8efc9cb>Cumulative</th><th data-v-b8efc9cb>Class</th></tr></thead><tbody data-v-b8efc9cb><!--[-->`);
          ssrRenderList(unref(productRanking), (p) => {
            _push(`<tr class="az-table__row" data-v-b8efc9cb><td class="font-weight-bold" data-v-b8efc9cb>#${ssrInterpolate(p.rank)}</td><td class="az-table__product" data-v-b8efc9cb>${ssrInterpolate(p.name)}</td><td class="text-medium-emphasis" data-v-b8efc9cb>${ssrInterpolate(p.category)}</td><td class="text-right" data-v-b8efc9cb>${ssrInterpolate(p.qtySold)}</td><td class="text-right font-weight-bold text-success" data-v-b8efc9cb>${ssrInterpolate(formatMoney(p.revenue))}</td><td class="text-right text-medium-emphasis" data-v-b8efc9cb>${ssrInterpolate(p.sharePct.toFixed(1))}%</td><td class="text-right text-medium-emphasis" data-v-b8efc9cb>${ssrInterpolate(p.cumulative.toFixed(1))}%</td><td data-v-b8efc9cb><span class="${ssrRenderClass([`az-class-badge--${p.class.toLowerCase()}`, "az-class-badge"])}" data-v-b8efc9cb>${ssrInterpolate(p.class)}</span></td></tr>`);
          });
          _push(`<!--]-->`);
          if (!unref(productRanking).length) {
            _push(`<tr data-v-b8efc9cb><td colspan="8" class="az-table__empty" data-v-b8efc9cb>`);
            _push(ssrRenderComponent(VIcon, {
              size: "36",
              color: "grey-lighten-1"
            }, {
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
            _push(`<p class="text-body-2 mt-2 text-medium-emphasis" data-v-b8efc9cb>No sales data for this period.</p></td></tr>`);
          } else {
            _push(`<!---->`);
          }
          _push(`</tbody></table></div>`);
        } else {
          _push(`<!---->`);
        }
        if (unref(activeTab) === "top") {
          _push(`<div class="az-table-wrap" data-v-b8efc9cb><table class="az-table" data-v-b8efc9cb><thead data-v-b8efc9cb><tr data-v-b8efc9cb><th data-v-b8efc9cb>Rank</th><th data-v-b8efc9cb>Product</th><th data-v-b8efc9cb>Category</th><th class="text-right" data-v-b8efc9cb>Qty Sold</th><th class="text-right" data-v-b8efc9cb>Revenue</th><th class="text-right" data-v-b8efc9cb>Avg Price</th><th data-v-b8efc9cb>% of Revenue</th></tr></thead><tbody data-v-b8efc9cb><!--[-->`);
          ssrRenderList(unref(topProducts), (p) => {
            _push(`<tr class="az-table__row" data-v-b8efc9cb><td class="font-weight-bold" data-v-b8efc9cb>#${ssrInterpolate(p.rank)}</td><td class="az-table__product" data-v-b8efc9cb>${ssrInterpolate(p.name)}</td><td class="text-medium-emphasis" data-v-b8efc9cb>${ssrInterpolate(p.category)}</td><td class="text-right" data-v-b8efc9cb>${ssrInterpolate(p.qtySold)}</td><td class="text-right font-weight-bold text-success" data-v-b8efc9cb>${ssrInterpolate(formatMoney(p.revenue))}</td><td class="text-right text-medium-emphasis" data-v-b8efc9cb>${ssrInterpolate(formatMoney(p.avgPrice))}</td><td data-v-b8efc9cb><div class="az-bar-wrap" data-v-b8efc9cb><div class="az-bar-fill az-bar-fill--success" style="${ssrRenderStyle({ width: p.sharePct + "%" })}" data-v-b8efc9cb></div></div></td></tr>`);
          });
          _push(`<!--]-->`);
          if (!unref(topProducts).length) {
            _push(`<tr data-v-b8efc9cb><td colspan="7" class="az-table__empty" data-v-b8efc9cb>`);
            _push(ssrRenderComponent(VIcon, {
              size: "36",
              color: "grey-lighten-1"
            }, {
              default: withCtx((_, _push2, _parent2, _scopeId) => {
                if (_push2) {
                  _push2(`mdi-trophy-outline`);
                } else {
                  return [
                    createTextVNode("mdi-trophy-outline")
                  ];
                }
              }),
              _: 1
            }, _parent));
            _push(`<p class="text-body-2 mt-2 text-medium-emphasis" data-v-b8efc9cb>No product sales in this period.</p></td></tr>`);
          } else {
            _push(`<!---->`);
          }
          _push(`</tbody></table></div>`);
        } else {
          _push(`<!---->`);
        }
        if (unref(activeTab) === "slow") {
          _push(`<div class="az-table-wrap" data-v-b8efc9cb><table class="az-table" data-v-b8efc9cb><thead data-v-b8efc9cb><tr data-v-b8efc9cb><th data-v-b8efc9cb>Product</th><th data-v-b8efc9cb>Category</th><th class="text-right" data-v-b8efc9cb>Qty on Hand</th><th class="text-right" data-v-b8efc9cb>Stock Value</th><th data-v-b8efc9cb>Last Sold</th><th data-v-b8efc9cb>Days Idle</th></tr></thead><tbody data-v-b8efc9cb><!--[-->`);
          ssrRenderList(unref(slowMoving), (p) => {
            _push(`<tr class="az-table__row" data-v-b8efc9cb><td class="az-table__product" data-v-b8efc9cb>${ssrInterpolate(p.name)}</td><td class="text-medium-emphasis" data-v-b8efc9cb>${ssrInterpolate(p.category_name || "Uncategorized")}</td><td class="text-right" data-v-b8efc9cb>${ssrInterpolate(p.quantity_on_hand || 0)}</td><td class="text-right font-weight-bold text-warning" data-v-b8efc9cb>${ssrInterpolate(formatMoney(p.stockValue))}</td><td class="text-medium-emphasis" data-v-b8efc9cb>${ssrInterpolate(p.last_sold ? formatDate(p.last_sold) : "Never")}</td><td data-v-b8efc9cb><span class="${ssrRenderClass([p.daysIdle > 60 ? "az-idle-badge--critical" : "az-idle-badge--warn", "az-idle-badge"])}" data-v-b8efc9cb>${ssrInterpolate(p.daysIdle)}d</span></td></tr>`);
          });
          _push(`<!--]-->`);
          if (!unref(slowMoving).length) {
            _push(`<tr data-v-b8efc9cb><td colspan="6" class="az-table__empty" data-v-b8efc9cb>`);
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
            _push(`<p class="text-body-2 mt-2 text-medium-emphasis" data-v-b8efc9cb>No slow-moving products detected.</p></td></tr>`);
          } else {
            _push(`<!---->`);
          }
          _push(`</tbody></table></div>`);
        } else {
          _push(`<!---->`);
        }
        if (unref(activeTab) === "never") {
          _push(`<div class="az-table-wrap" data-v-b8efc9cb><table class="az-table" data-v-b8efc9cb><thead data-v-b8efc9cb><tr data-v-b8efc9cb><th data-v-b8efc9cb>Product</th><th data-v-b8efc9cb>Category</th><th class="text-right" data-v-b8efc9cb>Qty on Hand</th><th class="text-right" data-v-b8efc9cb>Stock Value</th><th data-v-b8efc9cb>Status</th></tr></thead><tbody data-v-b8efc9cb><!--[-->`);
          ssrRenderList(unref(neverSoldProducts), (p) => {
            _push(`<tr class="az-table__row" data-v-b8efc9cb><td class="az-table__product" data-v-b8efc9cb>${ssrInterpolate(p.name)}</td><td class="text-medium-emphasis" data-v-b8efc9cb>${ssrInterpolate(p.category_name || "Uncategorized")}</td><td class="text-right" data-v-b8efc9cb>${ssrInterpolate(p.quantity_on_hand || 0)}</td><td class="text-right font-weight-bold" data-v-b8efc9cb>${ssrInterpolate(formatMoney(p.stockValue))}</td><td data-v-b8efc9cb>`);
            if (Number(p.quantity_on_hand) > 0) {
              _push(`<span class="az-status-badge az-status-badge--voided" data-v-b8efc9cb><span class="az-status-badge__dot" data-v-b8efc9cb></span>Dead Stock </span>`);
            } else {
              _push(`<span class="az-status-badge az-status-badge--cancelled" data-v-b8efc9cb><span class="az-status-badge__dot" data-v-b8efc9cb></span>No Stock </span>`);
            }
            _push(`</td></tr>`);
          });
          _push(`<!--]-->`);
          if (!unref(neverSoldProducts).length) {
            _push(`<tr data-v-b8efc9cb><td colspan="5" class="az-table__empty" data-v-b8efc9cb>`);
            _push(ssrRenderComponent(VIcon, {
              size: "36",
              color: "grey-lighten-1"
            }, {
              default: withCtx((_, _push2, _parent2, _scopeId) => {
                if (_push2) {
                  _push2(`mdi-check-circle-outline`);
                } else {
                  return [
                    createTextVNode("mdi-check-circle-outline")
                  ];
                }
              }),
              _: 1
            }, _parent));
            _push(`<p class="text-body-2 mt-2 text-medium-emphasis" data-v-b8efc9cb>Every product has sold at least once.</p></td></tr>`);
          } else {
            _push(`<!---->`);
          }
          _push(`</tbody></table></div>`);
        } else {
          _push(`<!---->`);
        }
        if (unref(activeTab) === "dead") {
          _push(`<div class="az-table-wrap" data-v-b8efc9cb><table class="az-table" data-v-b8efc9cb><thead data-v-b8efc9cb><tr data-v-b8efc9cb><th data-v-b8efc9cb>Product</th><th data-v-b8efc9cb>Category</th><th class="text-right" data-v-b8efc9cb>Qty on Hand</th><th class="text-right" data-v-b8efc9cb>Unit Cost</th><th class="text-right" data-v-b8efc9cb>Stock Value</th><th class="text-right" data-v-b8efc9cb>% of Dead Stock</th></tr></thead><tbody data-v-b8efc9cb><!--[-->`);
          ssrRenderList(unref(deadStock), (p) => {
            _push(`<tr class="az-table__row" data-v-b8efc9cb><td class="az-table__product" data-v-b8efc9cb>${ssrInterpolate(p.name)}</td><td class="text-medium-emphasis" data-v-b8efc9cb>${ssrInterpolate(p.category_name || "Uncategorized")}</td><td class="text-right" data-v-b8efc9cb>${ssrInterpolate(p.quantity_on_hand || 0)}</td><td class="text-right text-medium-emphasis" data-v-b8efc9cb>${ssrInterpolate(formatMoney(p.cost_price))}</td><td class="text-right font-weight-bold text-error" data-v-b8efc9cb>${ssrInterpolate(formatMoney(p.stockValue))}</td><td class="text-right text-medium-emphasis" data-v-b8efc9cb>${ssrInterpolate(p.deadPct.toFixed(1))}%</td></tr>`);
          });
          _push(`<!--]-->`);
          if (!unref(deadStock).length) {
            _push(`<tr data-v-b8efc9cb><td colspan="6" class="az-table__empty" data-v-b8efc9cb>`);
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
            _push(`<p class="text-body-2 mt-2 text-medium-emphasis" data-v-b8efc9cb>No dead stock detected.</p></td></tr>`);
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
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/analytics/products.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const products = /* @__PURE__ */ _export_sfc(_sfc_main, [["__scopeId", "data-v-b8efc9cb"]]);

export { products as default };
//# sourceMappingURL=products-Dq1Ul187.mjs.map
