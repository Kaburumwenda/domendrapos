import { ref, computed, resolveComponent, mergeProps, withCtx, createTextVNode, unref, toDisplayString, isRef, createVNode, useSSRContext } from 'file://D:/Projects/MY-APPS-2/DomendraPOS/frontend/node_modules/vue/index.mjs';
import { ssrRenderAttrs, ssrRenderComponent, ssrInterpolate, ssrRenderStyle, ssrRenderList, ssrRenderClass } from 'file://D:/Projects/MY-APPS-2/DomendraPOS/frontend/node_modules/vue/server-renderer/index.mjs';
import { u as useApi } from './useApi-D4YG8JPQ.mjs';
import { u as useFormat } from './useFormat-BvVWDMYe.mjs';
import { _ as _export_sfc, a as VIcon, c as VBtn, d as VAlert, C as VMenu, g as VCard, v as VTextField, k as VDivider, x as VProgressCircular, o as VChip, n as VDataTable } from './server.mjs';
import 'file://D:/Projects/MY-APPS-2/DomendraPOS/frontend/node_modules/pinia/dist/pinia.js';
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
import 'file://D:/Projects/MY-APPS-2/DomendraPOS/frontend/node_modules/vue-router/vue-router.node.mjs';
import 'file://D:/Projects/MY-APPS-2/DomendraPOS/frontend/node_modules/perfect-debounce/dist/index.mjs';
import 'file://D:/Projects/MY-APPS-2/DomendraPOS/frontend/node_modules/@vue/shared/dist/shared.cjs.prod.js';
import 'file://D:/Projects/MY-APPS-2/DomendraPOS/frontend/node_modules/vue3-apexcharts/dist/vue3-apexcharts.js';
import 'file://D:/Projects/MY-APPS-2/DomendraPOS/frontend/node_modules/nuxt/node_modules/cookie-es/dist/index.mjs';

const _sfc_main = {
  __name: "usage",
  __ssrInlineRender: true,
  setup(__props) {
    const api = useApi();
    const { currency: fmtCurrency, date: fmtDate } = useFormat();
    const data = ref(null);
    const loading = ref(false);
    const error = ref(null);
    const presets = [
      { label: "Today", value: "today" },
      { label: "Yesterday", value: "yesterday" },
      { label: "Last 7 days", value: "last_7_days" },
      { label: "Last 14 days", value: "last_14_days" },
      { label: "Last 30 days", value: "last_30_days" },
      { label: "This month", value: "this_month" },
      { label: "Last month", value: "last_month" },
      { label: "This year", value: "this_year" },
      { label: "Custom", value: "custom" }
    ];
    const preset = ref("last_7_days");
    const customStart = ref("");
    const customEnd = ref("");
    const range = ref(null);
    const rangeLoading = ref(false);
    const customLabel = computed(() => {
      if (customStart.value && customEnd.value) return `${customStart.value} \u2192 ${customEnd.value}`;
      return "Pick dates";
    });
    async function loadRange() {
      var _a;
      rangeLoading.value = true;
      try {
        const params = { preset: preset.value };
        if (preset.value === "custom") {
          if (!customStart.value || !customEnd.value) {
            rangeLoading.value = false;
            return;
          }
          params.start = customStart.value;
          params.end = customEnd.value;
        }
        const res = await api("/usage-billing/range/", { query: params });
        range.value = res;
      } catch (e) {
        error.value = ((_a = e == null ? void 0 : e.data) == null ? void 0 : _a.detail) || e.message || "Failed to load range data.";
      } finally {
        rangeLoading.value = false;
      }
    }
    const billHeaders = [
      { title: "Period", key: "period" },
      { title: "Requests", key: "total_requests" },
      { title: "Amount", key: "amount" },
      { title: "Due date", key: "due_date" },
      { title: "Status", key: "status" }
    ];
    function fmt(v) {
      if (v == null) return "\u2014";
      return Number(v).toLocaleString();
    }
    function statusColor(status) {
      const map = {
        DRAFT: "grey",
        ISSUED: "info",
        PARTIAL: "warning",
        PAID: "success",
        CANCELLED: "grey",
        WAIVED: "secondary",
        OVERDUE: "error"
      };
      return map[status] || "grey";
    }
    const peakValue = computed(() => {
      var _a, _b;
      if (!((_b = (_a = data.value) == null ? void 0 : _a.daily_last_30_days) == null ? void 0 : _b.length)) return 0;
      return Math.max(...data.value.daily_last_30_days.map((d) => d.request_count), 0);
    });
    const weekdayMax = computed(() => {
      var _a;
      if (!((_a = data.value) == null ? void 0 : _a.weekday_breakdown)) return 0;
      return Math.max(...data.value.weekday_breakdown.map((w) => w.total), 0);
    });
    const monthProgress = computed(() => {
      if (!data.value) return 0;
      const e = data.value.current_month.days_elapsed;
      const total = e + data.value.current_month.days_remaining;
      return total ? Math.round(e / total * 100) : 0;
    });
    const todayDelta = computed(() => {
      var _a, _b, _c, _d;
      const t = ((_b = (_a = data.value) == null ? void 0 : _a.comparison) == null ? void 0 : _b.today_requests) || 0;
      const y = ((_d = (_c = data.value) == null ? void 0 : _c.comparison) == null ? void 0 : _d.yesterday_requests) || 0;
      if (!y) return { text: t ? "+\u221E%" : "\u2014", color: "text-medium-emphasis", icon: "mdi-minus" };
      const pct = (t - y) / y * 100;
      if (pct > 0) return { text: `+${pct.toFixed(1)}%`, color: "text-success", icon: "mdi-trending-up" };
      if (pct < 0) return { text: `${pct.toFixed(1)}%`, color: "text-error", icon: "mdi-trending-down" };
      return { text: "0%", color: "text-medium-emphasis", icon: "mdi-minus" };
    });
    const momDelta = computed(() => {
      var _a, _b;
      const v = (_b = (_a = data.value) == null ? void 0 : _a.comparison) == null ? void 0 : _b.mom_change_pct;
      if (v == null) return { text: "\u2014", color: "text-medium-emphasis", icon: "mdi-minus" };
      if (v > 0) return { text: `+${v}%`, color: "text-success", icon: "mdi-trending-up" };
      if (v < 0) return { text: `${v}%`, color: "text-error", icon: "mdi-trending-down" };
      return { text: "0%", color: "text-medium-emphasis", icon: "mdi-minus" };
    });
    const burnRatePerDay = computed(() => {
      if (!data.value) return 0;
      const d = data.value.current_month.days_elapsed || 1;
      return Number(data.value.current_month.cost_so_far) / d;
    });
    const dailyChartSeries = computed(() => {
      var _a, _b;
      if (!((_b = (_a = data.value) == null ? void 0 : _a.daily_last_30_days) == null ? void 0 : _b.length)) return [{ name: "Requests", data: [] }];
      return [{
        name: "Requests",
        data: data.value.daily_last_30_days.map((d) => ({ x: d.date, y: d.request_count }))
      }];
    });
    const dailyChartOptions = computed(() => ({
      chart: {
        type: "area",
        toolbar: { show: false },
        background: "transparent",
        foreColor: "rgba(0,0,0,0.6)",
        fontFamily: "Segoe UI, Inter, sans-serif"
      },
      colors: ["#3478f6"],
      dataLabels: { enabled: false },
      stroke: { curve: "smooth", width: 2 },
      fill: { type: "gradient", gradient: { shadeIntensity: 1, opacityFrom: 0.35, opacityTo: 0.05, stops: [0, 100] } },
      grid: { borderColor: "rgba(0,0,0,0.06)", strokeDashArray: 4 },
      xaxis: {
        type: "datetime",
        labels: { format: "dd MMM", style: { fontSize: "11px" } },
        axisBorder: { show: false }
      },
      yaxis: { labels: { formatter: (v) => Math.round(v).toLocaleString() } },
      tooltip: { x: { format: "dd MMM yyyy" }, y: { formatter: (v) => `${Math.round(v).toLocaleString()} requests` } },
      markers: { size: 0, hover: { size: 5 } }
    }));
    const weekdayChartSeries = computed(() => {
      var _a;
      if (!((_a = data.value) == null ? void 0 : _a.weekday_breakdown)) return [{ name: "Requests", data: [] }];
      return [{
        name: "Requests",
        data: data.value.weekday_breakdown.map((w) => w.total)
      }];
    });
    const weekdayChartOptions = computed(() => ({
      chart: {
        type: "radar",
        toolbar: { show: false },
        background: "transparent",
        foreColor: "rgba(0,0,0,0.6)",
        fontFamily: "Segoe UI, Inter, sans-serif"
      },
      colors: ["#00B8D4"],
      labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
      dataLabels: { enabled: false },
      yaxis: { show: false },
      xaxis: { labels: { style: { fontSize: "12px" } } },
      tooltip: { y: { formatter: (v) => `${Math.round(v).toLocaleString()} requests` } },
      fill: { opacity: 0.15 },
      stroke: { width: 2 },
      markers: { size: 4, colors: ["#00B8D4"] }
    }));
    const monthlyChartSeries = computed(() => {
      var _a, _b;
      if (!((_b = (_a = data.value) == null ? void 0 : _a.monthly_history) == null ? void 0 : _b.length)) return [{ name: "Requests", data: [] }];
      return [{
        name: "Requests",
        data: data.value.monthly_history.map((m) => m.total_requests)
      }];
    });
    const monthlyChartOptions = computed(() => {
      var _a;
      if (!((_a = data.value) == null ? void 0 : _a.monthly_history)) return {};
      const labels = data.value.monthly_history.map((m) => m.label);
      const currentIdx = data.value.monthly_history.findIndex(
        (m) => m.year === data.value.current_month.year && m.month === data.value.current_month.month
      );
      const colors = data.value.monthly_history.map(
        (_, i) => i === currentIdx ? "#3478f6" : "rgba(52, 120, 246, 0.35)"
      );
      return {
        chart: {
          type: "bar",
          toolbar: { show: false },
          background: "transparent",
          foreColor: "rgba(0,0,0,0.6)",
          fontFamily: "Segoe UI, Inter, sans-serif"
        },
        colors,
        plotOptions: { bar: { borderRadius: 6, columnWidth: "50%" } },
        grid: { borderColor: "rgba(0,0,0,0.06)", strokeDashArray: 4 },
        xaxis: { categories: labels, labels: { style: { fontSize: "11px" } } },
        yaxis: { labels: { formatter: (v) => Math.round(v).toLocaleString() } },
        dataLabels: { enabled: false },
        tooltip: { y: { formatter: (v) => `${Math.round(v).toLocaleString()} requests` } }
      };
    });
    const currentMonthChartSeries = computed(() => {
      var _a, _b;
      if (!((_b = (_a = data.value) == null ? void 0 : _a.daily_current_month) == null ? void 0 : _b.length)) return [{ name: "Requests", data: [] }];
      return [{
        name: "Requests",
        data: data.value.daily_current_month.map((d) => d.request_count)
      }];
    });
    const currentMonthChartOptions = computed(() => {
      var _a, _b;
      if (!((_b = (_a = data.value) == null ? void 0 : _a.daily_current_month) == null ? void 0 : _b.length)) return {};
      const labels = data.value.daily_current_month.map((d) => {
        const parts = String(d.date).split("-");
        return parts[2] ? parts[2] : String(d.date);
      });
      const peak = Math.max(...data.value.daily_current_month.map((d) => d.request_count), 0);
      const colors = data.value.daily_current_month.map(
        (d) => d.request_count === peak && peak > 0 ? "#FEB019" : "#3478f6"
      );
      return {
        chart: {
          type: "bar",
          toolbar: { show: false },
          background: "transparent",
          foreColor: "rgba(0,0,0,0.6)",
          fontFamily: "Segoe UI, Inter, sans-serif"
        },
        colors,
        plotOptions: { bar: { borderRadius: 4, columnWidth: "60%" } },
        grid: { borderColor: "rgba(0,0,0,0.06)", strokeDashArray: 4 },
        xaxis: { categories: labels, labels: { style: { fontSize: "10px" } } },
        yaxis: { labels: { formatter: (v) => Math.round(v).toLocaleString() } },
        dataLabels: { enabled: false },
        tooltip: { y: { formatter: (v) => `${Math.round(v).toLocaleString()} requests` } }
      };
    });
    const costTrendChartSeries = computed(() => {
      var _a, _b;
      if (!((_b = (_a = data.value) == null ? void 0 : _a.monthly_history) == null ? void 0 : _b.length)) return [{ name: "Cost", data: [] }];
      return [{
        name: "Cost",
        data: data.value.monthly_history.map((m) => ({ x: m.label, y: Number(m.cost) }))
      }];
    });
    const costTrendChartOptions = computed(() => ({
      chart: {
        type: "area",
        toolbar: { show: false },
        background: "transparent",
        foreColor: "rgba(0,0,0,0.6)",
        fontFamily: "Segoe UI, Inter, sans-serif"
      },
      colors: ["#00B8D4"],
      dataLabels: { enabled: false },
      stroke: { curve: "smooth", width: 2 },
      fill: { type: "gradient", gradient: { shadeIntensity: 1, opacityFrom: 0.35, opacityTo: 0.05, stops: [0, 100] } },
      grid: { borderColor: "rgba(0,0,0,0.06)", strokeDashArray: 4 },
      xaxis: { labels: { style: { fontSize: "11px" } } },
      yaxis: { labels: { formatter: (v) => fmtCurrency(Math.round(v)) } },
      tooltip: { y: { formatter: (v) => fmtCurrency(v) } },
      markers: { size: 4, colors: ["#00B8D4"], hover: { size: 6 } }
    }));
    const analysisDays = computed(() => {
      var _a, _b, _c;
      if ((_b = (_a = range.value) == null ? void 0 : _a.daily) == null ? void 0 : _b.length) return range.value.daily;
      return ((_c = data.value) == null ? void 0 : _c.daily_last_30_days) || [];
    });
    const analysisRate = computed(() => {
      var _a, _b;
      if ((_a = range.value) == null ? void 0 : _a.rate) return range.value.rate;
      return ((_b = data.value) == null ? void 0 : _b.rate) || null;
    });
    const usageSubtitle = computed(() => {
      if (range.value && range.value.start) {
        return `Daily API requests and cumulative spend \xB7 ${range.value.start} \u2192 ${range.value.end}`;
      }
      return "Daily API requests and cumulative spend over 30 days";
    });
    const usageAnalysisSeries = computed(() => {
      var _a, _b;
      const days = analysisDays.value;
      if (!days.length) return [];
      const rate = Number((_a = analysisRate.value) == null ? void 0 : _a.unit_cost) || 0;
      const rpu = Number((_b = analysisRate.value) == null ? void 0 : _b.requests_per_unit) || 1e3;
      let cum = 0;
      const cumulative = days.map((d) => {
        cum += d.request_count / rpu * rate;
        return Number(cum.toFixed(4));
      });
      return [
        { name: "API Requests", data: days.map((d) => d.request_count) },
        { name: "Cumulative Cost", data: cumulative }
      ];
    });
    const usageAnalysisOptions = computed(() => {
      const days = analysisDays.value;
      if (!days.length) return {};
      const labels = days.map((d) => {
        const parts = String(d.date).split("-");
        return parts[2] ? parts[2] : String(d.date);
      });
      return {
        chart: {
          type: "area",
          toolbar: { show: false },
          background: "transparent",
          foreColor: "rgba(0,0,0,0.6)",
          fontFamily: "Segoe UI, Inter, sans-serif",
          animations: { enabled: true, speed: 900 }
        },
        colors: ["#22c55e", "#f59e0b"],
        stroke: { width: [2, 2], curve: "smooth" },
        fill: {
          type: "gradient",
          gradient: { shadeIntensity: 1, opacityFrom: 0.3, opacityTo: 0.05, stops: [0, 100] }
        },
        dataLabels: { enabled: false },
        xaxis: { categories: labels, labels: { style: { fontSize: "11px" } }, tickAmount: Math.min(days.length, 8) },
        yaxis: [
          { labels: { formatter: (v) => Math.round(v).toLocaleString() }, title: { text: "Requests", style: { fontSize: "11px" } } },
          { opposite: true, labels: { formatter: (v) => fmtCurrency(Number(v).toFixed(2)) }, title: { text: "Cumulative Cost", style: { fontSize: "11px" } } }
        ],
        legend: { position: "top", fontSize: "12px" },
        tooltip: {
          y: {
            formatter: (v, opts) => {
              if (opts && opts.seriesIndex === 1) return fmtCurrency(Number(v).toFixed(4));
              return `${Math.round(v).toLocaleString()} requests`;
            }
          }
        },
        grid: { borderColor: "rgba(0,0,0,0.06)", strokeDashArray: 4 },
        markers: { size: 0, hover: { size: 5 } }
      };
    });
    const moduleBreakdown = computed(() => {
      var _a, _b, _c;
      let total;
      if (range.value && range.value.total_requests != null) {
        total = Number(range.value.total_requests) || 1;
      } else if ((_a = data.value) == null ? void 0 : _a.current_month) {
        total = Number(data.value.current_month.projected_requests) || Number(data.value.current_month.total_requests) || 1;
      } else {
        return [];
      }
      const rate = Number((_b = analysisRate.value) == null ? void 0 : _b.unit_cost) || 0;
      const rpu = Number((_c = analysisRate.value) == null ? void 0 : _c.requests_per_unit) || 1e3;
      const splits = [
        { label: "POS Terminal", pct: 42, colorClass: "text-primary", gradient: "linear-gradient(90deg, #3478f6, #5b9bff)" },
        { label: "Inventory", pct: 23, colorClass: "text-warning", gradient: "linear-gradient(90deg, #ff9800, #ffb74d)" },
        { label: "Reports", pct: 18, colorClass: "text-success", gradient: "linear-gradient(90deg, #4caf50, #66bb6a)" },
        { label: "Auth & RBAC", pct: 10, colorClass: "text-info", gradient: "linear-gradient(90deg, #00B8D4, #4dd0e1)" },
        { label: "Other", pct: 7, colorClass: "text-secondary", gradient: "linear-gradient(90deg, #7C4DFF, #9c7dff)" }
      ];
      return splits.map((s) => ({
        ...s,
        requests: Math.round(total * s.pct / 100),
        cost: total * s.pct / 100 / rpu * rate
      }));
    });
    const breakdownTotal = computed(() => {
      var _a;
      if (range.value && range.value.cost != null) return Number(range.value.cost);
      if ((_a = data.value) == null ? void 0 : _a.current_month) return Number(data.value.current_month.projected_cost);
      return 0;
    });
    const breakdownTotalReqs = computed(() => {
      var _a;
      if (range.value && range.value.total_requests != null) return Number(range.value.total_requests);
      if ((_a = data.value) == null ? void 0 : _a.current_month) return Number(data.value.current_month.projected_requests);
      return 0;
    });
    const projectedTotal = computed(() => {
      var _a;
      if ((_a = data.value) == null ? void 0 : _a.current_month) return Number(data.value.current_month.projected_cost);
      return 0;
    });
    const projectedTotalReqs = computed(() => {
      var _a;
      if ((_a = data.value) == null ? void 0 : _a.current_month) return Number(data.value.current_month.projected_requests);
      return 0;
    });
    async function load() {
      var _a;
      loading.value = true;
      error.value = null;
      try {
        const res = await api("/usage-billing/dashboard/");
        data.value = res;
      } catch (e) {
        error.value = ((_a = e == null ? void 0 : e.data) == null ? void 0 : _a.detail) || e.message || "Failed to load usage data.";
      } finally {
        loading.value = false;
      }
    }
    return (_ctx, _push, _parent, _attrs) => {
      var _a;
      const _component_apexchart = resolveComponent("apexchart");
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "az-page" }, _attrs))} data-v-5e790350><div class="az-header" data-v-5e790350><div class="az-header__left" data-v-5e790350><div class="az-header__icon" data-v-5e790350>`);
      _push(ssrRenderComponent(VIcon, {
        size: "26",
        color: "primary"
      }, {
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
      _push(`</div><div class="az-header__title" data-v-5e790350><h1 class="text-h5 font-weight-bold" data-v-5e790350>API Usage &amp; Billing</h1><p class="text-body-2 text-medium-emphasis mb-0" data-v-5e790350>Track API consumption, costs, and billing cycles</p></div></div><div class="az-header__actions" data-v-5e790350>`);
      _push(ssrRenderComponent(VBtn, {
        variant: "tonal",
        "prepend-icon": "mdi-credit-card-outline",
        to: "/admin/billing/payments"
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`Payments`);
          } else {
            return [
              createTextVNode("Payments")
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(ssrRenderComponent(VBtn, {
        variant: "tonal",
        "prepend-icon": "mdi-refresh",
        loading: unref(loading),
        onClick: load
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
      _push(`</div></div>`);
      if (unref(error)) {
        _push(ssrRenderComponent(VAlert, {
          type: "error",
          variant: "tonal",
          class: "mb-4 rounded-lg",
          closable: "",
          "onClick:close": ($event) => error.value = null
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`${ssrInterpolate(unref(error))}`);
            } else {
              return [
                createTextVNode(toDisplayString(unref(error)), 1)
              ];
            }
          }),
          _: 1
        }, _parent));
      } else {
        _push(`<!---->`);
      }
      _push(`<div class="az-range-card" data-v-5e790350><div class="az-range-card__header" data-v-5e790350><div class="d-flex align-center" style="${ssrRenderStyle({ "gap": "8px" })}" data-v-5e790350>`);
      _push(ssrRenderComponent(VIcon, {
        size: "18",
        color: "primary"
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`mdi-filter-variant`);
          } else {
            return [
              createTextVNode("mdi-filter-variant")
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`<span class="text-subtitle-2 font-weight-bold" data-v-5e790350>Date Range</span></div><div class="az-range-card__chips" data-v-5e790350><!--[-->`);
      ssrRenderList(presets, (p) => {
        _push(`<button class="${ssrRenderClass([{ "az-chip--active": unref(preset) === p.value }, "az-chip"])}" data-v-5e790350>${ssrInterpolate(p.label)}</button>`);
      });
      _push(`<!--]--></div>`);
      if (unref(preset) === "custom") {
        _push(ssrRenderComponent(VMenu, { "close-on-content-click": false }, {
          activator: withCtx(({ props }, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(ssrRenderComponent(VBtn, mergeProps(props, {
                size: "small",
                variant: "tonal",
                "prepend-icon": "mdi-calendar"
              }), {
                default: withCtx((_, _push3, _parent3, _scopeId2) => {
                  if (_push3) {
                    _push3(`${ssrInterpolate(unref(customLabel))}`);
                  } else {
                    return [
                      createTextVNode(toDisplayString(unref(customLabel)), 1)
                    ];
                  }
                }),
                _: 2
              }, _parent2, _scopeId));
            } else {
              return [
                createVNode(VBtn, mergeProps(props, {
                  size: "small",
                  variant: "tonal",
                  "prepend-icon": "mdi-calendar"
                }), {
                  default: withCtx(() => [
                    createTextVNode(toDisplayString(unref(customLabel)), 1)
                  ]),
                  _: 1
                }, 16)
              ];
            }
          }),
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(ssrRenderComponent(VCard, {
                class: "pa-3",
                "min-width": "280"
              }, {
                default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                  if (_push3) {
                    _push3(ssrRenderComponent(VTextField, {
                      modelValue: unref(customStart),
                      "onUpdate:modelValue": ($event) => isRef(customStart) ? customStart.value = $event : null,
                      label: "Start",
                      type: "date",
                      density: "compact",
                      "hide-details": "",
                      class: "mb-2"
                    }, null, _parent3, _scopeId2));
                    _push3(ssrRenderComponent(VTextField, {
                      modelValue: unref(customEnd),
                      "onUpdate:modelValue": ($event) => isRef(customEnd) ? customEnd.value = $event : null,
                      label: "End",
                      type: "date",
                      density: "compact",
                      "hide-details": "",
                      class: "mb-2"
                    }, null, _parent3, _scopeId2));
                    _push3(ssrRenderComponent(VBtn, {
                      block: "",
                      color: "primary",
                      size: "small",
                      disabled: !unref(customStart) || !unref(customEnd),
                      onClick: loadRange
                    }, {
                      default: withCtx((_3, _push4, _parent4, _scopeId3) => {
                        if (_push4) {
                          _push4(`Apply`);
                        } else {
                          return [
                            createTextVNode("Apply")
                          ];
                        }
                      }),
                      _: 1
                    }, _parent3, _scopeId2));
                  } else {
                    return [
                      createVNode(VTextField, {
                        modelValue: unref(customStart),
                        "onUpdate:modelValue": ($event) => isRef(customStart) ? customStart.value = $event : null,
                        label: "Start",
                        type: "date",
                        density: "compact",
                        "hide-details": "",
                        class: "mb-2"
                      }, null, 8, ["modelValue", "onUpdate:modelValue"]),
                      createVNode(VTextField, {
                        modelValue: unref(customEnd),
                        "onUpdate:modelValue": ($event) => isRef(customEnd) ? customEnd.value = $event : null,
                        label: "End",
                        type: "date",
                        density: "compact",
                        "hide-details": "",
                        class: "mb-2"
                      }, null, 8, ["modelValue", "onUpdate:modelValue"]),
                      createVNode(VBtn, {
                        block: "",
                        color: "primary",
                        size: "small",
                        disabled: !unref(customStart) || !unref(customEnd),
                        onClick: loadRange
                      }, {
                        default: withCtx(() => [
                          createTextVNode("Apply")
                        ]),
                        _: 1
                      }, 8, ["disabled"])
                    ];
                  }
                }),
                _: 1
              }, _parent2, _scopeId));
            } else {
              return [
                createVNode(VCard, {
                  class: "pa-3",
                  "min-width": "280"
                }, {
                  default: withCtx(() => [
                    createVNode(VTextField, {
                      modelValue: unref(customStart),
                      "onUpdate:modelValue": ($event) => isRef(customStart) ? customStart.value = $event : null,
                      label: "Start",
                      type: "date",
                      density: "compact",
                      "hide-details": "",
                      class: "mb-2"
                    }, null, 8, ["modelValue", "onUpdate:modelValue"]),
                    createVNode(VTextField, {
                      modelValue: unref(customEnd),
                      "onUpdate:modelValue": ($event) => isRef(customEnd) ? customEnd.value = $event : null,
                      label: "End",
                      type: "date",
                      density: "compact",
                      "hide-details": "",
                      class: "mb-2"
                    }, null, 8, ["modelValue", "onUpdate:modelValue"]),
                    createVNode(VBtn, {
                      block: "",
                      color: "primary",
                      size: "small",
                      disabled: !unref(customStart) || !unref(customEnd),
                      onClick: loadRange
                    }, {
                      default: withCtx(() => [
                        createTextVNode("Apply")
                      ]),
                      _: 1
                    }, 8, ["disabled"])
                  ]),
                  _: 1
                })
              ];
            }
          }),
          _: 1
        }, _parent));
      } else {
        _push(`<!---->`);
      }
      _push(`</div>`);
      _push(ssrRenderComponent(VDivider, { class: "my-3" }, null, _parent));
      if (unref(rangeLoading)) {
        _push(`<div class="d-flex justify-center py-4" data-v-5e790350>`);
        _push(ssrRenderComponent(VProgressCircular, {
          indeterminate: "",
          size: "24",
          color: "primary"
        }, null, _parent));
        _push(`</div>`);
      } else if (unref(range)) {
        _push(`<div class="az-range-summary" data-v-5e790350><div class="az-range-stat" data-v-5e790350><span class="az-range-stat__label" data-v-5e790350>Range</span><span class="az-range-stat__value" data-v-5e790350>${ssrInterpolate(unref(range).start)} \u2192 ${ssrInterpolate(unref(range).end)}</span><span class="az-range-stat__sub" data-v-5e790350>${ssrInterpolate(unref(range).days)} day(s)</span></div><div class="az-range-stat" data-v-5e790350><span class="az-range-stat__label" data-v-5e790350>Total Requests</span><span class="az-range-stat__value az-range-stat__value--primary" data-v-5e790350>${ssrInterpolate(fmt(unref(range).total_requests))}</span></div><div class="az-range-stat" data-v-5e790350><span class="az-range-stat__label" data-v-5e790350>Daily Average</span><span class="az-range-stat__value" data-v-5e790350>${ssrInterpolate(fmt(unref(range).daily_average))}</span></div><div class="az-range-stat" data-v-5e790350><span class="az-range-stat__label" data-v-5e790350>Cost</span><span class="az-range-stat__value az-range-stat__value--info" data-v-5e790350>${ssrInterpolate(unref(fmtCurrency)(unref(range).cost))}</span>`);
        if (unref(range).peak_day) {
          _push(`<span class="az-range-stat__sub" data-v-5e790350>Peak: ${ssrInterpolate(unref(range).peak_day.date)} (${ssrInterpolate(fmt(unref(range).peak_day.request_count))})</span>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</div></div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</div>`);
      if (unref(loading) && !unref(data)) {
        _push(`<div class="az-loading" data-v-5e790350>`);
        _push(ssrRenderComponent(VProgressCircular, {
          indeterminate: "",
          size: "40",
          color: "primary"
        }, null, _parent));
        _push(`<p class="text-body-2 text-medium-emphasis mt-3" data-v-5e790350>Loading usage data...</p></div>`);
      } else {
        _push(`<!---->`);
      }
      if (unref(data)) {
        _push(`<!--[--><div class="az-kpi-grid" data-v-5e790350><div class="az-kpi" data-v-5e790350><div class="az-kpi__icon az-kpi__icon--primary" data-v-5e790350>`);
        _push(ssrRenderComponent(VIcon, null, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`mdi-pulse`);
            } else {
              return [
                createTextVNode("mdi-pulse")
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(`</div><div class="az-kpi__body" data-v-5e790350><div class="az-kpi__label" data-v-5e790350>Requests This Month</div><div class="az-kpi__value" data-v-5e790350>${ssrInterpolate(fmt(unref(data).current_month.total_requests))}</div><div class="az-kpi__sub" data-v-5e790350>Day ${ssrInterpolate(unref(data).current_month.days_elapsed)} of ${ssrInterpolate(unref(data).current_month.days_elapsed + unref(data).current_month.days_remaining)}</div><div class="az-kpi__progress" data-v-5e790350><div class="az-kpi__progress-bar" style="${ssrRenderStyle({ width: unref(monthProgress) + "%" })}" data-v-5e790350></div></div></div></div><div class="az-kpi" data-v-5e790350><div class="az-kpi__icon az-kpi__icon--info" data-v-5e790350>`);
        _push(ssrRenderComponent(VIcon, null, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`mdi-cash`);
            } else {
              return [
                createTextVNode("mdi-cash")
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(`</div><div class="az-kpi__body" data-v-5e790350><div class="az-kpi__label" data-v-5e790350>Cost So Far</div><div class="az-kpi__value" data-v-5e790350>${ssrInterpolate(unref(fmtCurrency)(unref(data).current_month.cost_so_far))}</div><div class="az-kpi__sub" data-v-5e790350>At current rate</div></div></div><div class="az-kpi az-kpi--highlight" data-v-5e790350><div class="az-kpi__icon az-kpi__icon--accent" data-v-5e790350>`);
        _push(ssrRenderComponent(VIcon, null, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`mdi-trending-up`);
            } else {
              return [
                createTextVNode("mdi-trending-up")
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(`</div><div class="az-kpi__body" data-v-5e790350><div class="az-kpi__label" data-v-5e790350>Projected Month-End Cost</div><div class="az-kpi__value" data-v-5e790350>${ssrInterpolate(unref(fmtCurrency)(unref(data).current_month.projected_cost))}</div><div class="az-kpi__sub" data-v-5e790350>~${ssrInterpolate(fmt(unref(data).current_month.projected_requests))} requests</div></div></div><div class="az-kpi" data-v-5e790350><div class="az-kpi__icon az-kpi__icon--success" data-v-5e790350>`);
        _push(ssrRenderComponent(VIcon, null, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`mdi-tag`);
            } else {
              return [
                createTextVNode("mdi-tag")
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(`</div><div class="az-kpi__body" data-v-5e790350><div class="az-kpi__label" data-v-5e790350>Current Rate</div><div class="az-kpi__value az-kpi__value--sm" data-v-5e790350>${ssrInterpolate(fmt(unref(data).rate.requests_per_unit))} req = ${ssrInterpolate(unref(fmtCurrency)((_a = unref(data).rate.unit_cost_display) != null ? _a : unref(data).rate.unit_cost))}</div><div class="az-kpi__sub" data-v-5e790350>Effective ${ssrInterpolate(unref(fmtDate)(unref(data).rate.effective_from))}</div></div></div></div><div class="az-kpi-grid" data-v-5e790350><div class="az-kpi az-kpi--compact" data-v-5e790350><div class="az-kpi__body" data-v-5e790350><div class="az-kpi__label" data-v-5e790350>Today</div><div class="az-kpi__value" data-v-5e790350>${ssrInterpolate(fmt(unref(data).comparison.today_requests))}</div><div class="${ssrRenderClass([unref(todayDelta).color, "az-kpi__sub"])}" data-v-5e790350>`);
        _push(ssrRenderComponent(VIcon, { size: "14" }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`${ssrInterpolate(unref(todayDelta).icon)}`);
            } else {
              return [
                createTextVNode(toDisplayString(unref(todayDelta).icon), 1)
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(` ${ssrInterpolate(unref(todayDelta).text)} vs yesterday </div></div></div><div class="az-kpi az-kpi--compact" data-v-5e790350><div class="az-kpi__body" data-v-5e790350><div class="az-kpi__label" data-v-5e790350>7-Day Average</div><div class="az-kpi__value" data-v-5e790350>${ssrInterpolate(fmt(unref(data).comparison.trailing_7d_average))}</div><div class="az-kpi__sub" data-v-5e790350>${ssrInterpolate(fmt(unref(data).comparison.trailing_7d_total))} req in last 7 days</div></div></div><div class="az-kpi az-kpi--compact" data-v-5e790350><div class="az-kpi__body" data-v-5e790350><div class="az-kpi__label" data-v-5e790350>Daily Average (This Month)</div><div class="az-kpi__value" data-v-5e790350>${ssrInterpolate(fmt(unref(data).current_month.daily_average_so_far))}</div><div class="az-kpi__sub" data-v-5e790350>over ${ssrInterpolate(unref(data).current_month.days_elapsed)} day(s)</div></div></div><div class="az-kpi az-kpi--compact" data-v-5e790350><div class="az-kpi__body" data-v-5e790350><div class="az-kpi__label" data-v-5e790350>Month-over-Month</div><div class="${ssrRenderClass([unref(momDelta).color, "az-kpi__value"])}" data-v-5e790350>`);
        _push(ssrRenderComponent(VIcon, { size: "20" }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`${ssrInterpolate(unref(momDelta).icon)}`);
            } else {
              return [
                createTextVNode(toDisplayString(unref(momDelta).icon), 1)
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(` ${ssrInterpolate(unref(momDelta).text)}</div><div class="az-kpi__sub" data-v-5e790350>vs same period last month (${ssrInterpolate(fmt(unref(data).comparison.previous_same_period_total))})</div></div></div></div><div class="az-chart-row az-chart-row--1-1" data-v-5e790350><div class="az-chart-card" data-v-5e790350><div class="az-chart-card__header" data-v-5e790350><div class="d-flex align-center" style="${ssrRenderStyle({ "gap": "8px" })}" data-v-5e790350>`);
        _push(ssrRenderComponent(VIcon, { color: "success" }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`mdi-chart-areaspline`);
            } else {
              return [
                createTextVNode("mdi-chart-areaspline")
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(`<div data-v-5e790350><h3 class="text-subtitle-1 font-weight-bold" data-v-5e790350>Usage Analysis</h3><span class="text-caption text-medium-emphasis" data-v-5e790350>${ssrInterpolate(unref(usageSubtitle))}</span></div></div><div class="d-flex align-center" style="${ssrRenderStyle({ "gap": "8px" })}" data-v-5e790350><span class="az-live-dot" data-v-5e790350></span><span class="text-caption font-weight-bold text-success" data-v-5e790350>Live</span></div></div>`);
        if (!unref(analysisDays).length) {
          _push(`<div class="az-empty" data-v-5e790350>No usage data yet.</div>`);
        } else {
          _push(ssrRenderComponent(_component_apexchart, {
            type: "area",
            height: "320",
            options: unref(usageAnalysisOptions),
            series: unref(usageAnalysisSeries)
          }, null, _parent));
        }
        _push(`</div><div class="az-chart-card" data-v-5e790350><div class="az-chart-card__header" data-v-5e790350><div class="d-flex align-center" style="${ssrRenderStyle({ "gap": "8px" })}" data-v-5e790350>`);
        _push(ssrRenderComponent(VIcon, { color: "warning" }, {
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
        _push(`<div data-v-5e790350><h3 class="text-subtitle-1 font-weight-bold" data-v-5e790350>Bill Breakdown</h3><span class="text-caption text-medium-emphasis" data-v-5e790350>Estimated request distribution by module</span></div></div></div>`);
        if (!unref(moduleBreakdown).length) {
          _push(`<div class="az-empty" data-v-5e790350>No data yet.</div>`);
        } else {
          _push(`<div class="az-bill-breakdown" data-v-5e790350><!--[-->`);
          ssrRenderList(unref(moduleBreakdown), (row, i) => {
            _push(`<div class="az-bill-row" style="${ssrRenderStyle({ animationDelay: `${0.1 + i * 0.08}s` })}" data-v-5e790350><div class="d-flex align-center justify-space-between mb-1" data-v-5e790350><span class="text-body-2 font-weight-medium" data-v-5e790350>${ssrInterpolate(row.label)}</span><span class="${ssrRenderClass([row.colorClass, "text-body-2 font-weight-bold"])}" data-v-5e790350>${ssrInterpolate(fmt(row.requests))} req \u2192 ${ssrInterpolate(unref(fmtCurrency)(row.cost))}</span></div><div class="az-bill-meter" data-v-5e790350><div class="az-bill-meter-fill" style="${ssrRenderStyle({ width: row.pct + "%", background: row.gradient, animationDelay: `${0.3 + i * 0.08}s` })}" data-v-5e790350></div></div><div class="text-caption text-medium-emphasis mt-1" data-v-5e790350>${ssrInterpolate(row.pct)}% of total requests</div></div>`);
          });
          _push(`<!--]--></div>`);
        }
        _push(ssrRenderComponent(VDivider, { class: "my-4" }, null, _parent));
        _push(`<div class="az-bill-total-grid" data-v-5e790350><div class="az-bill-total" data-v-5e790350><div class="d-flex align-center ga-2" data-v-5e790350>`);
        _push(ssrRenderComponent(VIcon, {
          color: "info",
          size: "20"
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`mdi-counter`);
            } else {
              return [
                createTextVNode("mdi-counter")
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(`<span class="text-subtitle-2 font-weight-bold" data-v-5e790350>Total Requests</span></div><div class="az-bill-total__value az-bill-total__value--info" data-v-5e790350>${ssrInterpolate(fmt(unref(breakdownTotalReqs)))}</div><div class="text-caption text-medium-emphasis" data-v-5e790350>in selected range</div></div><div class="az-bill-total" data-v-5e790350><div class="d-flex align-center ga-2" data-v-5e790350>`);
        _push(ssrRenderComponent(VIcon, {
          color: "success",
          size: "20"
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`mdi-cash`);
            } else {
              return [
                createTextVNode("mdi-cash")
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(`<span class="text-subtitle-2 font-weight-bold" data-v-5e790350>Total Cost</span></div><div class="az-bill-total__value az-bill-total__value--success" data-v-5e790350>${ssrInterpolate(unref(fmtCurrency)(unref(breakdownTotal)))}</div><div class="text-caption text-medium-emphasis" data-v-5e790350>at current rate</div></div><div class="az-bill-total az-bill-total--accent" data-v-5e790350><div class="d-flex align-center ga-2" data-v-5e790350>`);
        _push(ssrRenderComponent(VIcon, {
          color: "primary",
          size: "20"
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`mdi-receipt-text`);
            } else {
              return [
                createTextVNode("mdi-receipt-text")
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(`<span class="text-subtitle-2 font-weight-bold" data-v-5e790350>Projected Total</span></div><div class="az-bill-total__value" data-v-5e790350>${ssrInterpolate(unref(fmtCurrency)(unref(projectedTotal)))}</div><div class="text-caption text-medium-emphasis" data-v-5e790350>${ssrInterpolate(fmt(unref(projectedTotalReqs)))} requests by month end</div></div></div></div></div><div class="az-chart-row az-chart-row--2-1" data-v-5e790350><div class="az-chart-card" data-v-5e790350><div class="az-chart-card__header" data-v-5e790350><div class="d-flex align-center" style="${ssrRenderStyle({ "gap": "8px" })}" data-v-5e790350>`);
        _push(ssrRenderComponent(VIcon, { color: "primary" }, {
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
        _push(`<h3 class="text-subtitle-1 font-weight-bold" data-v-5e790350>Daily Requests (Last 30 Days)</h3></div>`);
        _push(ssrRenderComponent(VChip, {
          size: "x-small",
          variant: "tonal",
          color: "primary"
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`Peak: ${ssrInterpolate(fmt(unref(peakValue)))}`);
            } else {
              return [
                createTextVNode("Peak: " + toDisplayString(fmt(unref(peakValue))), 1)
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(`</div>`);
        if (!unref(data).daily_last_30_days.length) {
          _push(`<div class="az-empty" data-v-5e790350>No requests recorded yet.</div>`);
        } else {
          _push(ssrRenderComponent(_component_apexchart, {
            type: "area",
            height: "300",
            options: unref(dailyChartOptions),
            series: unref(dailyChartSeries)
          }, null, _parent));
        }
        _push(`</div><div class="az-chart-card" data-v-5e790350><div class="az-chart-card__header" data-v-5e790350><div class="d-flex align-center" style="${ssrRenderStyle({ "gap": "8px" })}" data-v-5e790350>`);
        _push(ssrRenderComponent(VIcon, { color: "success" }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`mdi-calendar-week`);
            } else {
              return [
                createTextVNode("mdi-calendar-week")
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(`<h3 class="text-subtitle-1 font-weight-bold" data-v-5e790350>By Day of Week</h3></div></div>`);
        if (unref(weekdayMax) === 0) {
          _push(`<div class="az-empty" data-v-5e790350>No data yet.</div>`);
        } else {
          _push(ssrRenderComponent(_component_apexchart, {
            type: "radar",
            height: "300",
            options: unref(weekdayChartOptions),
            series: unref(weekdayChartSeries)
          }, null, _parent));
        }
        _push(`</div></div><div class="az-chart-row az-chart-row--2-1" data-v-5e790350><div class="az-chart-card" data-v-5e790350><div class="az-chart-card__header" data-v-5e790350><div class="d-flex align-center" style="${ssrRenderStyle({ "gap": "8px" })}" data-v-5e790350>`);
        _push(ssrRenderComponent(VIcon, { color: "info" }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`mdi-chart-timeline-variant`);
            } else {
              return [
                createTextVNode("mdi-chart-timeline-variant")
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(`<h3 class="text-subtitle-1 font-weight-bold" data-v-5e790350>Last 6 Months Trend</h3></div></div>`);
        _push(ssrRenderComponent(_component_apexchart, {
          type: "bar",
          height: "280",
          options: unref(monthlyChartOptions),
          series: unref(monthlyChartSeries)
        }, null, _parent));
        _push(`</div><div class="az-chart-card" data-v-5e790350><div class="az-chart-card__header" data-v-5e790350><div class="d-flex align-center" style="${ssrRenderStyle({ "gap": "8px" })}" data-v-5e790350>`);
        _push(ssrRenderComponent(VIcon, { color: "warning" }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`mdi-information-outline`);
            } else {
              return [
                createTextVNode("mdi-information-outline")
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(`<h3 class="text-subtitle-1 font-weight-bold" data-v-5e790350>Highlights</h3></div></div><div class="az-highlights" data-v-5e790350>`);
        if (unref(data).current_month.peak_day) {
          _push(`<div class="az-highlight" data-v-5e790350><div class="az-highlight__icon az-highlight__icon--warning" data-v-5e790350>`);
          _push(ssrRenderComponent(VIcon, null, {
            default: withCtx((_, _push2, _parent2, _scopeId) => {
              if (_push2) {
                _push2(`mdi-fire`);
              } else {
                return [
                  createTextVNode("mdi-fire")
                ];
              }
            }),
            _: 1
          }, _parent));
          _push(`</div><div data-v-5e790350><div class="az-highlight__title" data-v-5e790350>Peak Day</div><div class="az-highlight__sub" data-v-5e790350>${ssrInterpolate(unref(data).current_month.peak_day.date)} \u2014 ${ssrInterpolate(fmt(unref(data).current_month.peak_day.request_count))} requests</div></div></div>`);
        } else {
          _push(`<!---->`);
        }
        _push(`<div class="az-highlight" data-v-5e790350><div class="az-highlight__icon az-highlight__icon--info" data-v-5e790350>`);
        _push(ssrRenderComponent(VIcon, null, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`mdi-history`);
            } else {
              return [
                createTextVNode("mdi-history")
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(`</div><div data-v-5e790350><div class="az-highlight__title" data-v-5e790350>Previous Month</div><div class="az-highlight__sub" data-v-5e790350>${ssrInterpolate(fmt(unref(data).comparison.previous_month.total_requests))} req \xB7 ${ssrInterpolate(unref(fmtCurrency)(unref(data).comparison.previous_month.cost))}</div></div></div><div class="az-highlight" data-v-5e790350><div class="az-highlight__icon az-highlight__icon--success" data-v-5e790350>`);
        _push(ssrRenderComponent(VIcon, null, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`mdi-clock-outline`);
            } else {
              return [
                createTextVNode("mdi-clock-outline")
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(`</div><div data-v-5e790350><div class="az-highlight__title" data-v-5e790350>Days Remaining</div><div class="az-highlight__sub" data-v-5e790350>${ssrInterpolate(unref(data).current_month.days_remaining)} days until next bill</div></div></div><div class="az-highlight" data-v-5e790350><div class="az-highlight__icon az-highlight__icon--primary" data-v-5e790350>`);
        _push(ssrRenderComponent(VIcon, null, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`mdi-target`);
            } else {
              return [
                createTextVNode("mdi-target")
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(`</div><div data-v-5e790350><div class="az-highlight__title" data-v-5e790350>Burn Rate</div><div class="az-highlight__sub" data-v-5e790350>${ssrInterpolate(unref(fmtCurrency)(unref(burnRatePerDay)))} / day</div></div></div></div></div></div><div class="az-chart-row az-chart-row--1-1" data-v-5e790350><div class="az-chart-card" data-v-5e790350><div class="az-chart-card__header" data-v-5e790350><div class="d-flex align-center" style="${ssrRenderStyle({ "gap": "8px" })}" data-v-5e790350>`);
        _push(ssrRenderComponent(VIcon, { color: "primary" }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`mdi-calendar-month`);
            } else {
              return [
                createTextVNode("mdi-calendar-month")
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(`<h3 class="text-subtitle-1 font-weight-bold" data-v-5e790350>Current Month Daily Requests</h3></div></div>`);
        if (!unref(data).daily_current_month || !unref(data).daily_current_month.length) {
          _push(`<div class="az-empty" data-v-5e790350>No requests this month.</div>`);
        } else {
          _push(ssrRenderComponent(_component_apexchart, {
            type: "bar",
            height: "280",
            options: unref(currentMonthChartOptions),
            series: unref(currentMonthChartSeries)
          }, null, _parent));
        }
        _push(`</div><div class="az-chart-card" data-v-5e790350><div class="az-chart-card__header" data-v-5e790350><div class="d-flex align-center" style="${ssrRenderStyle({ "gap": "8px" })}" data-v-5e790350>`);
        _push(ssrRenderComponent(VIcon, { color: "info" }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`mdi-cash-clock`);
            } else {
              return [
                createTextVNode("mdi-cash-clock")
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(`<h3 class="text-subtitle-1 font-weight-bold" data-v-5e790350>Monthly Cost (Last 6 Months)</h3></div></div>`);
        _push(ssrRenderComponent(_component_apexchart, {
          type: "area",
          height: "280",
          options: unref(costTrendChartOptions),
          series: unref(costTrendChartSeries)
        }, null, _parent));
        _push(`</div></div>`);
        if (unref(data).billing_summary) {
          _push(`<div class="az-kpi-grid" data-v-5e790350><div class="az-kpi az-kpi--compact" data-v-5e790350><div class="az-kpi__icon az-kpi__icon--primary" data-v-5e790350>`);
          _push(ssrRenderComponent(VIcon, null, {
            default: withCtx((_, _push2, _parent2, _scopeId) => {
              if (_push2) {
                _push2(`mdi-receipt-text`);
              } else {
                return [
                  createTextVNode("mdi-receipt-text")
                ];
              }
            }),
            _: 1
          }, _parent));
          _push(`</div><div class="az-kpi__body" data-v-5e790350><div class="az-kpi__label" data-v-5e790350>Total Billed</div><div class="az-kpi__value" data-v-5e790350>${ssrInterpolate(unref(fmtCurrency)(unref(data).billing_summary.total_billed))}</div><div class="az-kpi__sub" data-v-5e790350>${ssrInterpolate(unref(data).billing_summary.total_bills)} bill(s) all-time</div></div></div><div class="az-kpi az-kpi--compact" data-v-5e790350><div class="az-kpi__icon az-kpi__icon--warning" data-v-5e790350>`);
          _push(ssrRenderComponent(VIcon, null, {
            default: withCtx((_, _push2, _parent2, _scopeId) => {
              if (_push2) {
                _push2(`mdi-cash-clock`);
              } else {
                return [
                  createTextVNode("mdi-cash-clock")
                ];
              }
            }),
            _: 1
          }, _parent));
          _push(`</div><div class="az-kpi__body" data-v-5e790350><div class="az-kpi__label" data-v-5e790350>Outstanding</div><div class="az-kpi__value" data-v-5e790350>${ssrInterpolate(unref(fmtCurrency)(unref(data).billing_summary.total_outstanding))}</div><div class="az-kpi__sub" data-v-5e790350>${ssrInterpolate(unref(data).billing_summary.outstanding_count)} unpaid bill(s)</div></div></div><div class="${ssrRenderClass([{ "az-kpi--danger": Number(unref(data).billing_summary.total_overdue) > 0 }, "az-kpi az-kpi--compact"])}" data-v-5e790350><div class="az-kpi__icon az-kpi__icon--error" data-v-5e790350>`);
          _push(ssrRenderComponent(VIcon, null, {
            default: withCtx((_, _push2, _parent2, _scopeId) => {
              if (_push2) {
                _push2(`mdi-alert-circle`);
              } else {
                return [
                  createTextVNode("mdi-alert-circle")
                ];
              }
            }),
            _: 1
          }, _parent));
          _push(`</div><div class="az-kpi__body" data-v-5e790350><div class="az-kpi__label" data-v-5e790350>Overdue</div><div class="az-kpi__value" data-v-5e790350>${ssrInterpolate(unref(fmtCurrency)(unref(data).billing_summary.total_overdue))}</div><div class="az-kpi__sub" data-v-5e790350>${ssrInterpolate(unref(data).billing_summary.overdue_count)} overdue bill(s)</div></div></div><div class="az-kpi az-kpi--compact" data-v-5e790350><div class="az-kpi__icon az-kpi__icon--success" data-v-5e790350>`);
          _push(ssrRenderComponent(VIcon, null, {
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
          _push(`</div><div class="az-kpi__body" data-v-5e790350><div class="az-kpi__label" data-v-5e790350>Paid</div><div class="az-kpi__value" data-v-5e790350>${ssrInterpolate(unref(fmtCurrency)(unref(data).billing_summary.total_paid))}</div><div class="az-kpi__sub" data-v-5e790350>${ssrInterpolate(unref(data).billing_summary.paid_count)} paid bill(s)</div></div></div></div>`);
        } else {
          _push(`<!---->`);
        }
        _push(`<div class="az-table-card" data-v-5e790350><div class="az-table-card__header" data-v-5e790350><div class="d-flex align-center" style="${ssrRenderStyle({ "gap": "8px" })}" data-v-5e790350>`);
        _push(ssrRenderComponent(VIcon, { color: "primary" }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`mdi-receipt`);
            } else {
              return [
                createTextVNode("mdi-receipt")
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(`<h3 class="text-subtitle-1 font-weight-bold" data-v-5e790350>Recent Monthly Bills</h3></div>`);
        _push(ssrRenderComponent(VBtn, {
          size: "small",
          variant: "tonal",
          color: "primary",
          "prepend-icon": "mdi-credit-card-outline",
          to: "/admin/billing/payments"
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(` Payments `);
            } else {
              return [
                createTextVNode(" Payments ")
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(`</div>`);
        _push(ssrRenderComponent(VDataTable, {
          headers: billHeaders,
          items: unref(data).recent_bills,
          density: "comfortable",
          "items-per-page": 12,
          "hide-default-footer": ""
        }, {
          "item.period": withCtx(({ item }, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`${ssrInterpolate(item.period_label || item.year + "-" + String(item.month).padStart(2, "0"))}`);
            } else {
              return [
                createTextVNode(toDisplayString(item.period_label || item.year + "-" + String(item.month).padStart(2, "0")), 1)
              ];
            }
          }),
          "item.total_requests": withCtx(({ item }, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`${ssrInterpolate(fmt(item.total_requests))}`);
            } else {
              return [
                createTextVNode(toDisplayString(fmt(item.total_requests)), 1)
              ];
            }
          }),
          "item.amount": withCtx(({ item }, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`${ssrInterpolate(unref(fmtCurrency)(item.amount))}`);
            } else {
              return [
                createTextVNode(toDisplayString(unref(fmtCurrency)(item.amount)), 1)
              ];
            }
          }),
          "item.due_date": withCtx(({ item }, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`<span class="${ssrRenderClass({ "text-error font-weight-medium": item.is_overdue })}" data-v-5e790350${_scopeId}>${ssrInterpolate(item.due_date ? unref(fmtDate)(item.due_date) : "\u2014")}</span>`);
            } else {
              return [
                createVNode("span", {
                  class: { "text-error font-weight-medium": item.is_overdue }
                }, toDisplayString(item.due_date ? unref(fmtDate)(item.due_date) : "\u2014"), 3)
              ];
            }
          }),
          "item.status": withCtx(({ item }, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(ssrRenderComponent(VChip, {
                color: statusColor(item.effective_status || item.status),
                size: "small",
                variant: "tonal",
                label: ""
              }, {
                default: withCtx((_, _push3, _parent3, _scopeId2) => {
                  if (_push3) {
                    _push3(`${ssrInterpolate((item.effective_status || item.status).toUpperCase())}`);
                  } else {
                    return [
                      createTextVNode(toDisplayString((item.effective_status || item.status).toUpperCase()), 1)
                    ];
                  }
                }),
                _: 2
              }, _parent2, _scopeId));
            } else {
              return [
                createVNode(VChip, {
                  color: statusColor(item.effective_status || item.status),
                  size: "small",
                  variant: "tonal",
                  label: ""
                }, {
                  default: withCtx(() => [
                    createTextVNode(toDisplayString((item.effective_status || item.status).toUpperCase()), 1)
                  ]),
                  _: 2
                }, 1032, ["color"])
              ];
            }
          }),
          "no-data": withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`<div class="az-empty" data-v-5e790350${_scopeId}>No bills issued yet.</div>`);
            } else {
              return [
                createVNode("div", { class: "az-empty" }, "No bills issued yet.")
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(`</div><!--]-->`);
      } else {
        _push(`<!---->`);
      }
      _push(`</div>`);
    };
  }
};
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/admin/billing/usage.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const usage = /* @__PURE__ */ _export_sfc(_sfc_main, [["__scopeId", "data-v-5e790350"]]);

export { usage as default };
//# sourceMappingURL=usage-CcNSYppR.mjs.map
