import { ref, computed, resolveComponent, mergeProps, withCtx, unref, createTextVNode, toDisplayString, openBlock, createBlock, Fragment, renderList, createVNode, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent, ssrRenderList, ssrInterpolate, ssrRenderStyle, ssrRenderClass } from 'vue/server-renderer';
import { u as useFormat } from './useFormat-C--cm8if.mjs';
import { M as useToast, U as VBtnGroup, g as VBtn, E as VProgressCircular, d as VIcon } from './server.mjs';
import { u as useApi } from './useApi-9yTPzSUF.mjs';
import { _ as _export_sfc } from './_plugin-vue_export-helper-1tPrXgE0.mjs';
import './auth-s-b-v9EY.mjs';
import 'pinia';
import '../_/nitro.mjs';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'node:crypto';
import 'node:url';
import '../routes/renderer.mjs';
import 'vue-bundle-renderer/runtime';
import 'unhead/server';
import 'devalue';
import 'unhead/utils';
import 'vue-router';
import '@vue/shared';
import 'vue3-apexcharts';

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
    const transactions = ref([]);
    const products2 = ref([]);
    const activeTab = ref("abc");
    function resolveRange(key) {
      const now = /* @__PURE__ */ new Date();
      const end = new Date(now);
      end.setHours(23, 59, 59, 999);
      const start = new Date(now);
      start.setHours(0, 0, 0, 0);
      if (key === "today") return [start, end];
      if (key === "7d") {
        start.setDate(start.getDate() - 7);
        return [start, end];
      }
      if (key === "30d") {
        start.setDate(start.getDate() - 30);
        return [start, end];
      }
      if (key === "90d") {
        start.setDate(start.getDate() - 90);
        return [start, end];
      }
      if (key === "thisMonth") {
        start.setDate(1);
        return [start, end];
      }
      return [new Date(2020, 0, 1), end];
    }
    const inRange = computed(() => {
      const [start, end] = resolveRange(period.value);
      return transactions.value.filter((t) => {
        const d = new Date(t.created_at);
        return d >= start && d <= end && t.status === "completed";
      });
    });
    const productSalesMap = computed(() => {
      const map = {};
      inRange.value.forEach((t) => {
        (t.items || []).forEach((i) => {
          if (!map[i.product_name]) map[i.product_name] = { name: i.product_name, qtySold: 0, revenue: 0, lastSold: null, category: i.category_name || "Uncategorized" };
          map[i.product_name].qtySold += Number(i.quantity);
          map[i.product_name].revenue += Number(i.line_total);
          const d = new Date(t.created_at);
          if (!map[i.product_name].lastSold || d > map[i.product_name].lastSold) map[i.product_name].lastSold = d;
        });
      });
      return map;
    });
    const productRanking = computed(() => {
      const sorted = Object.values(productSalesMap.value).sort((a, b) => b.revenue - a.revenue);
      const totalRev = sorted.reduce((s, p) => s + p.revenue, 0) || 1;
      let cumulative = 0;
      sorted.forEach((p, i) => {
        p.rank = i + 1;
        p.sharePct = p.revenue / totalRev * 100;
        cumulative += p.revenue;
        p.cumulative = cumulative / totalRev * 100;
        p.avgPrice = p.qtySold ? p.revenue / p.qtySold : 0;
        p.class = p.cumulative <= 80 ? "A" : p.cumulative <= 95 ? "B" : "C";
      });
      return sorted;
    });
    const activeProducts = computed(() => products2.value.filter((p) => p.is_active !== false).length);
    const productNames = computed(() => new Set(products2.value.map((p) => p.name)));
    const soldCount = computed(() => {
      return Object.keys(productSalesMap.value).filter((n) => productNames.value.has(n)).length;
    });
    const neverSoldCount = computed(() => products2.value.length - soldCount.value);
    const soldPct = computed(() => products2.value.length ? soldCount.value / products2.value.length * 100 : 0);
    const neverSoldPct = computed(() => products2.value.length ? neverSoldCount.value / products2.value.length * 100 : 0);
    const avgRevPerProduct = computed(() => {
      const total = productRanking.value.reduce((s, p) => s + p.revenue, 0);
      return products2.value.length ? total / products2.value.length : 0;
    });
    const topProductRevenue = computed(() => productRanking.value.length ? productRanking.value[0].revenue : 0);
    const topPct = computed(() => {
      const total = productRanking.value.reduce((s, p) => s + p.revenue, 0);
      return total ? topProductRevenue.value / total * 100 : 0;
    });
    const slowMoving = computed(() => {
      const now = /* @__PURE__ */ new Date();
      return products2.value.filter((p) => {
        const sales = productSalesMap.value[p.name];
        if (!sales || !sales.lastSold) return false;
        return now - sales.lastSold > 30 * 864e5;
      }).map((p) => {
        const sales = productSalesMap.value[p.name];
        return { ...p, last_sold: sales?.lastSold, daysIdle: Math.floor((now - sales.lastSold) / 864e5), stockValue: Number(p.quantity_on_hand || 0) * Number(p.cost_price || 0) };
      }).sort((a, b) => b.daysIdle - a.daysIdle);
    });
    const neverSoldProducts = computed(() => {
      return products2.value.filter((p) => !productSalesMap.value[p.name]).map((p) => ({ ...p, stockValue: Number(p.quantity_on_hand || 0) * Number(p.cost_price || 0) }));
    });
    const deadStock = computed(() => {
      const totalDead = neverSoldProducts.value.filter((p) => Number(p.quantity_on_hand) > 0).reduce((s, p) => s + p.stockValue, 0) || 1;
      return neverSoldProducts.value.filter((p) => Number(p.quantity_on_hand) > 0).map((p) => ({ ...p, deadPct: p.stockValue / totalDead * 100 })).sort((a, b) => b.stockValue - a.stockValue);
    });
    const deadStockValue = computed(() => deadStock.value.reduce((s, p) => s + p.stockValue, 0));
    const topProducts = computed(() => productRanking.value.slice(0, 20));
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
      inRange.value.forEach((t) => (t.items || []).forEach((i) => {
        const cat = i.category_name || "Uncategorized";
        map[cat] = (map[cat] || 0) + Number(i.line_total);
      }));
      return Object.values(map);
    });
    const categoryOptions = computed(() => {
      const map = {};
      inRange.value.forEach((t) => (t.items || []).forEach((i) => {
        const cat = i.category_name || "Uncategorized";
        map[cat] = true;
      }));
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
      productRanking.value.filter((p) => p.class === "A").reduce((s, p) => s + p.revenue, 0),
      productRanking.value.filter((p) => p.class === "B").reduce((s, p) => s + p.revenue, 0),
      productRanking.value.filter((p) => p.class === "C").reduce((s, p) => s + p.revenue, 0)
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
          x: p.qtySold,
          y: Math.round(p.avgPrice),
          name: p.name
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
      try {
        const [txData, prodData] = await Promise.all([
          useApi()("/pos/transactions/?page_size=2000"),
          useApi()("/products/?page_size=500")
        ]);
        transactions.value = txData.results || txData;
        products2.value = prodData.results || prodData;
      } catch (e) {
        toast.error("Failed to load product analytics");
      } finally {
        loading.value = false;
      }
    }
    return (_ctx, _push, _parent, _attrs) => {
      const _component_apexchart = resolveComponent("apexchart");
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "az-page" }, _attrs))} data-v-43e645cb><div class="az-header" data-v-43e645cb><div class="az-header__left" data-v-43e645cb><div class="az-header__title" data-v-43e645cb><h1 class="text-h5 font-weight-bold" data-v-43e645cb>Product Analysis</h1><p class="text-body-2 text-medium-emphasis" data-v-43e645cb>Product performance, ABC classification, revenue ranking and stock health</p></div></div><div class="az-header__actions" data-v-43e645cb>`);
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
      if (unref(loading) && unref(transactions).length === 0) {
        _push(`<div class="az-loading" data-v-43e645cb>`);
        _push(ssrRenderComponent(VProgressCircular, {
          indeterminate: "",
          color: "primary",
          size: "32",
          width: "3"
        }, null, _parent));
        _push(`<p class="text-body-2 text-medium-emphasis mt-3" data-v-43e645cb>Loading product analytics…</p></div>`);
      } else {
        _push(`<!--[--><div class="az-kpi-grid" data-v-43e645cb><div class="az-kpi" data-v-43e645cb><div class="az-kpi__icon az-kpi__icon--primary" data-v-43e645cb>`);
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
        _push(`</div><div class="az-kpi__body" data-v-43e645cb><p class="az-kpi__label" data-v-43e645cb>Total Products</p><p class="az-kpi__value" data-v-43e645cb>${ssrInterpolate(unref(products2).length)}</p><p class="az-kpi__sub" data-v-43e645cb>${ssrInterpolate(unref(activeProducts))} active SKUs</p></div></div><div class="az-kpi" data-v-43e645cb><div class="az-kpi__icon az-kpi__icon--success" data-v-43e645cb>`);
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
        _push(`</div><div class="az-kpi__body" data-v-43e645cb><p class="az-kpi__label" data-v-43e645cb>Products Sold</p><p class="az-kpi__value text-success" data-v-43e645cb>${ssrInterpolate(unref(soldCount))}</p><p class="az-kpi__sub" data-v-43e645cb>${ssrInterpolate(unref(soldPct).toFixed(1))}% of catalogue</p></div></div><div class="az-kpi" data-v-43e645cb><div class="az-kpi__icon az-kpi__icon--warning" data-v-43e645cb>`);
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
        _push(`</div><div class="az-kpi__body" data-v-43e645cb><p class="az-kpi__label" data-v-43e645cb>Never Sold</p><p class="az-kpi__value text-warning" data-v-43e645cb>${ssrInterpolate(unref(neverSoldCount))}</p><p class="az-kpi__sub" data-v-43e645cb>${ssrInterpolate(unref(neverSoldPct).toFixed(1))}% of catalogue</p></div></div><div class="az-kpi" data-v-43e645cb><div class="az-kpi__icon az-kpi__icon--info" data-v-43e645cb>`);
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
        _push(`</div><div class="az-kpi__body" data-v-43e645cb><p class="az-kpi__label" data-v-43e645cb>Avg Revenue / Product</p><p class="az-kpi__value text-info" data-v-43e645cb>${ssrInterpolate(formatMoney(unref(avgRevPerProduct)))}</p><p class="az-kpi__sub" data-v-43e645cb>across ${ssrInterpolate(unref(soldCount))} sold items</p></div></div><div class="az-kpi" data-v-43e645cb><div class="az-kpi__icon az-kpi__icon--teal" data-v-43e645cb>`);
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
        _push(`</div><div class="az-kpi__body" data-v-43e645cb><p class="az-kpi__label" data-v-43e645cb>Dead Stock Value</p><p class="az-kpi__value" style="${ssrRenderStyle({ "color": "#00B8D4" })}" data-v-43e645cb>${ssrInterpolate(formatMoney(unref(deadStockValue)))}</p><p class="az-kpi__sub" data-v-43e645cb>${ssrInterpolate(unref(deadStock).length)} products</p></div></div><div class="az-kpi" data-v-43e645cb><div class="az-kpi__icon az-kpi__icon--purple" data-v-43e645cb>`);
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
        _push(`</div><div class="az-kpi__body" data-v-43e645cb><p class="az-kpi__label" data-v-43e645cb>Top Product Revenue</p><p class="az-kpi__value" style="${ssrRenderStyle({ "color": "#7C4DFF" })}" data-v-43e645cb>${ssrInterpolate(formatMoney(unref(topProductRevenue)))}</p><p class="az-kpi__sub" data-v-43e645cb>${ssrInterpolate(unref(topPct).toFixed(1))}% of total revenue</p></div></div></div><div class="az-chart-row az-chart-row--first" data-v-43e645cb><div class="az-card az-card--two-thirds" data-v-43e645cb><div class="az-card__header" data-v-43e645cb><div class="az-card__header-icon az-card__header-icon--blue" data-v-43e645cb>`);
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
        _push(`</div><div data-v-43e645cb><h3 class="az-card__title" data-v-43e645cb>Top 20 Products by Revenue</h3><p class="az-card__subtitle" data-v-43e645cb>Best-performing products in selected period</p></div></div><div class="az-card__body" data-v-43e645cb>`);
        _push(ssrRenderComponent(_component_apexchart, {
          type: "bar",
          height: "420",
          options: unref(top20Options),
          series: unref(top20Series)
        }, null, _parent));
        _push(`</div></div><div class="az-card az-card--third" data-v-43e645cb><div class="az-card__header" data-v-43e645cb><div class="az-card__header-icon az-card__header-icon--green" data-v-43e645cb>`);
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
        _push(`</div><div data-v-43e645cb><h3 class="az-card__title" data-v-43e645cb>Revenue by Category</h3><p class="az-card__subtitle" data-v-43e645cb>Distribution across categories</p></div></div><div class="az-card__body" data-v-43e645cb>`);
        _push(ssrRenderComponent(_component_apexchart, {
          type: "donut",
          height: "420",
          options: unref(categoryOptions),
          series: unref(categorySeries)
        }, null, _parent));
        _push(`</div></div></div><div class="az-chart-row" data-v-43e645cb><div class="az-card az-card--half" data-v-43e645cb><div class="az-card__header" data-v-43e645cb><div class="az-card__header-icon az-card__header-icon--amber" data-v-43e645cb>`);
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
        _push(`</div><div data-v-43e645cb><h3 class="az-card__title" data-v-43e645cb>ABC Classification</h3><p class="az-card__subtitle" data-v-43e645cb>Pareto distribution by revenue</p></div></div><div class="az-card__body" data-v-43e645cb>`);
        _push(ssrRenderComponent(_component_apexchart, {
          type: "donut",
          height: "320",
          options: unref(abcChartOptions),
          series: unref(abcChartSeries)
        }, null, _parent));
        _push(`</div></div><div class="az-card az-card--half" data-v-43e645cb><div class="az-card__header" data-v-43e645cb><div class="az-card__header-icon az-card__header-icon--rose" data-v-43e645cb>`);
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
        _push(`</div><div data-v-43e645cb><h3 class="az-card__title" data-v-43e645cb>Qty Sold vs Avg Price</h3><p class="az-card__subtitle" data-v-43e645cb>Each dot is a product — hover for details</p></div></div><div class="az-card__body" data-v-43e645cb>`);
        _push(ssrRenderComponent(_component_apexchart, {
          type: "scatter",
          height: "320",
          options: unref(scatterOptions),
          series: unref(scatterSeries)
        }, null, _parent));
        _push(`</div></div></div><div class="az-tabs" data-v-43e645cb><!--[-->`);
        ssrRenderList(unref(tabs), (tab) => {
          _push(`<button class="${ssrRenderClass([{ "az-tab--active": unref(activeTab) === tab.id }, "az-tab"])}" data-v-43e645cb>`);
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
          _push(` ${ssrInterpolate(tab.label)} <span class="az-tab__badge" data-v-43e645cb>${ssrInterpolate(tab.count)}</span></button>`);
        });
        _push(`<!--]--></div>`);
        if (unref(activeTab) === "abc") {
          _push(`<div class="az-table-wrap" data-v-43e645cb><table class="az-table" data-v-43e645cb><thead data-v-43e645cb><tr data-v-43e645cb><th data-v-43e645cb>Rank</th><th data-v-43e645cb>Product</th><th data-v-43e645cb>Category</th><th class="text-right" data-v-43e645cb>Qty Sold</th><th class="text-right" data-v-43e645cb>Revenue</th><th class="text-right" data-v-43e645cb>% Share</th><th class="text-right" data-v-43e645cb>Cumulative</th><th data-v-43e645cb>Class</th></tr></thead><tbody data-v-43e645cb><!--[-->`);
          ssrRenderList(unref(productRanking), (p) => {
            _push(`<tr class="az-table__row" data-v-43e645cb><td class="font-weight-bold" data-v-43e645cb>#${ssrInterpolate(p.rank)}</td><td class="az-table__product" data-v-43e645cb>${ssrInterpolate(p.name)}</td><td class="text-medium-emphasis" data-v-43e645cb>${ssrInterpolate(p.category)}</td><td class="text-right" data-v-43e645cb>${ssrInterpolate(p.qtySold)}</td><td class="text-right font-weight-bold text-success" data-v-43e645cb>${ssrInterpolate(formatMoney(p.revenue))}</td><td class="text-right text-medium-emphasis" data-v-43e645cb>${ssrInterpolate(p.sharePct.toFixed(1))}%</td><td class="text-right text-medium-emphasis" data-v-43e645cb>${ssrInterpolate(p.cumulative.toFixed(1))}%</td><td data-v-43e645cb><span class="${ssrRenderClass([`az-class-badge--${p.class.toLowerCase()}`, "az-class-badge"])}" data-v-43e645cb>${ssrInterpolate(p.class)}</span></td></tr>`);
          });
          _push(`<!--]-->`);
          if (!unref(productRanking).length) {
            _push(`<tr data-v-43e645cb><td colspan="8" class="az-table__empty" data-v-43e645cb>`);
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
            _push(`<p class="text-body-2 mt-2 text-medium-emphasis" data-v-43e645cb>No sales data for this period.</p></td></tr>`);
          } else {
            _push(`<!---->`);
          }
          _push(`</tbody></table></div>`);
        } else {
          _push(`<!---->`);
        }
        if (unref(activeTab) === "top") {
          _push(`<div class="az-table-wrap" data-v-43e645cb><table class="az-table" data-v-43e645cb><thead data-v-43e645cb><tr data-v-43e645cb><th data-v-43e645cb>Rank</th><th data-v-43e645cb>Product</th><th data-v-43e645cb>Category</th><th class="text-right" data-v-43e645cb>Qty Sold</th><th class="text-right" data-v-43e645cb>Revenue</th><th class="text-right" data-v-43e645cb>Avg Price</th><th data-v-43e645cb>% of Revenue</th></tr></thead><tbody data-v-43e645cb><!--[-->`);
          ssrRenderList(unref(topProducts), (p) => {
            _push(`<tr class="az-table__row" data-v-43e645cb><td class="font-weight-bold" data-v-43e645cb>#${ssrInterpolate(p.rank)}</td><td class="az-table__product" data-v-43e645cb>${ssrInterpolate(p.name)}</td><td class="text-medium-emphasis" data-v-43e645cb>${ssrInterpolate(p.category)}</td><td class="text-right" data-v-43e645cb>${ssrInterpolate(p.qtySold)}</td><td class="text-right font-weight-bold text-success" data-v-43e645cb>${ssrInterpolate(formatMoney(p.revenue))}</td><td class="text-right text-medium-emphasis" data-v-43e645cb>${ssrInterpolate(formatMoney(p.avgPrice))}</td><td data-v-43e645cb><div class="az-bar-wrap" data-v-43e645cb><div class="az-bar-fill az-bar-fill--success" style="${ssrRenderStyle({ width: p.sharePct + "%" })}" data-v-43e645cb></div></div></td></tr>`);
          });
          _push(`<!--]-->`);
          if (!unref(topProducts).length) {
            _push(`<tr data-v-43e645cb><td colspan="7" class="az-table__empty" data-v-43e645cb>`);
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
            _push(`<p class="text-body-2 mt-2 text-medium-emphasis" data-v-43e645cb>No product sales in this period.</p></td></tr>`);
          } else {
            _push(`<!---->`);
          }
          _push(`</tbody></table></div>`);
        } else {
          _push(`<!---->`);
        }
        if (unref(activeTab) === "slow") {
          _push(`<div class="az-table-wrap" data-v-43e645cb><table class="az-table" data-v-43e645cb><thead data-v-43e645cb><tr data-v-43e645cb><th data-v-43e645cb>Product</th><th data-v-43e645cb>Category</th><th class="text-right" data-v-43e645cb>Qty on Hand</th><th class="text-right" data-v-43e645cb>Stock Value</th><th data-v-43e645cb>Last Sold</th><th data-v-43e645cb>Days Idle</th></tr></thead><tbody data-v-43e645cb><!--[-->`);
          ssrRenderList(unref(slowMoving), (p) => {
            _push(`<tr class="az-table__row" data-v-43e645cb><td class="az-table__product" data-v-43e645cb>${ssrInterpolate(p.name)}</td><td class="text-medium-emphasis" data-v-43e645cb>${ssrInterpolate(p.category_name || "Uncategorized")}</td><td class="text-right" data-v-43e645cb>${ssrInterpolate(p.quantity_on_hand || 0)}</td><td class="text-right font-weight-bold text-warning" data-v-43e645cb>${ssrInterpolate(formatMoney(p.stockValue))}</td><td class="text-medium-emphasis" data-v-43e645cb>${ssrInterpolate(p.last_sold ? formatDate(p.last_sold) : "Never")}</td><td data-v-43e645cb><span class="${ssrRenderClass([p.daysIdle > 60 ? "az-idle-badge--critical" : "az-idle-badge--warn", "az-idle-badge"])}" data-v-43e645cb>${ssrInterpolate(p.daysIdle)}d</span></td></tr>`);
          });
          _push(`<!--]-->`);
          if (!unref(slowMoving).length) {
            _push(`<tr data-v-43e645cb><td colspan="6" class="az-table__empty" data-v-43e645cb>`);
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
            _push(`<p class="text-body-2 mt-2 text-medium-emphasis" data-v-43e645cb>No slow-moving products detected.</p></td></tr>`);
          } else {
            _push(`<!---->`);
          }
          _push(`</tbody></table></div>`);
        } else {
          _push(`<!---->`);
        }
        if (unref(activeTab) === "never") {
          _push(`<div class="az-table-wrap" data-v-43e645cb><table class="az-table" data-v-43e645cb><thead data-v-43e645cb><tr data-v-43e645cb><th data-v-43e645cb>Product</th><th data-v-43e645cb>Category</th><th class="text-right" data-v-43e645cb>Qty on Hand</th><th class="text-right" data-v-43e645cb>Stock Value</th><th data-v-43e645cb>Status</th></tr></thead><tbody data-v-43e645cb><!--[-->`);
          ssrRenderList(unref(neverSoldProducts), (p) => {
            _push(`<tr class="az-table__row" data-v-43e645cb><td class="az-table__product" data-v-43e645cb>${ssrInterpolate(p.name)}</td><td class="text-medium-emphasis" data-v-43e645cb>${ssrInterpolate(p.category_name || "Uncategorized")}</td><td class="text-right" data-v-43e645cb>${ssrInterpolate(p.quantity_on_hand || 0)}</td><td class="text-right font-weight-bold" data-v-43e645cb>${ssrInterpolate(formatMoney(p.stockValue))}</td><td data-v-43e645cb>`);
            if (Number(p.quantity_on_hand) > 0) {
              _push(`<span class="az-status-badge az-status-badge--voided" data-v-43e645cb><span class="az-status-badge__dot" data-v-43e645cb></span>Dead Stock </span>`);
            } else {
              _push(`<span class="az-status-badge az-status-badge--cancelled" data-v-43e645cb><span class="az-status-badge__dot" data-v-43e645cb></span>No Stock </span>`);
            }
            _push(`</td></tr>`);
          });
          _push(`<!--]-->`);
          if (!unref(neverSoldProducts).length) {
            _push(`<tr data-v-43e645cb><td colspan="5" class="az-table__empty" data-v-43e645cb>`);
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
            _push(`<p class="text-body-2 mt-2 text-medium-emphasis" data-v-43e645cb>Every product has sold at least once.</p></td></tr>`);
          } else {
            _push(`<!---->`);
          }
          _push(`</tbody></table></div>`);
        } else {
          _push(`<!---->`);
        }
        if (unref(activeTab) === "dead") {
          _push(`<div class="az-table-wrap" data-v-43e645cb><table class="az-table" data-v-43e645cb><thead data-v-43e645cb><tr data-v-43e645cb><th data-v-43e645cb>Product</th><th data-v-43e645cb>Category</th><th class="text-right" data-v-43e645cb>Qty on Hand</th><th class="text-right" data-v-43e645cb>Unit Cost</th><th class="text-right" data-v-43e645cb>Stock Value</th><th class="text-right" data-v-43e645cb>% of Dead Stock</th></tr></thead><tbody data-v-43e645cb><!--[-->`);
          ssrRenderList(unref(deadStock), (p) => {
            _push(`<tr class="az-table__row" data-v-43e645cb><td class="az-table__product" data-v-43e645cb>${ssrInterpolate(p.name)}</td><td class="text-medium-emphasis" data-v-43e645cb>${ssrInterpolate(p.category_name || "Uncategorized")}</td><td class="text-right" data-v-43e645cb>${ssrInterpolate(p.quantity_on_hand || 0)}</td><td class="text-right text-medium-emphasis" data-v-43e645cb>${ssrInterpolate(formatMoney(p.cost_price))}</td><td class="text-right font-weight-bold text-error" data-v-43e645cb>${ssrInterpolate(formatMoney(p.stockValue))}</td><td class="text-right text-medium-emphasis" data-v-43e645cb>${ssrInterpolate(p.deadPct.toFixed(1))}%</td></tr>`);
          });
          _push(`<!--]-->`);
          if (!unref(deadStock).length) {
            _push(`<tr data-v-43e645cb><td colspan="6" class="az-table__empty" data-v-43e645cb>`);
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
            _push(`<p class="text-body-2 mt-2 text-medium-emphasis" data-v-43e645cb>No dead stock detected.</p></td></tr>`);
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
const products = /* @__PURE__ */ _export_sfc(_sfc_main, [["__scopeId", "data-v-43e645cb"]]);

export { products as default };
//# sourceMappingURL=products-BpJOODB9.mjs.map
