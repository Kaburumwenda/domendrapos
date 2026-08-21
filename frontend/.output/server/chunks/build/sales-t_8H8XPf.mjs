import { _ as _sfc_main$1 } from './PaginationBar-DZP-BWN7.mjs';
import { ref, computed, watch, resolveComponent, mergeProps, withCtx, unref, createVNode, toDisplayString, isRef, createTextVNode, openBlock, createBlock, Fragment, renderList, createCommentVNode, useSSRContext } from 'vue';
import { ssrRenderComponent, ssrInterpolate, ssrRenderList, ssrRenderStyle, ssrRenderClass } from 'vue/server-renderer';
import { u as useFormat } from './useFormat-C--cm8if.mjs';
import { M as useToast, V as VContainer, i as VRow, j as VCol, W as VBtnToggle, g as VBtn, f as VSpacer, k as VCard, d as VIcon, l as VTabs, m as VTab, v as VChip, C as VTextField, S as VSelect, E as VProgressCircular, Q as VAvatar, P as VTable, p as VDivider, w as VProgressLinear, x as VDialog, y as VCardTitle, z as VCardText, D as VCardActions } from './server.mjs';
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

const pageSize = 20;
const _sfc_main = {
  __name: "sales",
  __ssrInlineRender: true,
  setup(__props) {
    const { currency, datetime, number: formatNumber } = useFormat();
    const toast = useToast();
    const loading = ref(false);
    const sales2 = ref([]);
    const productCostMap = ref(/* @__PURE__ */ new Map());
    const activeTab = ref("transactions");
    const searchQuery = ref("");
    const filterStatus = ref("");
    const datePreset = ref("all");
    const dateFrom = ref("");
    const dateTo = ref("");
    const customDialog = ref(false);
    const customFrom = ref("");
    const customTo = ref("");
    const sortBy = ref("-created_at");
    const currentPage = ref(1);
    const detailsDialog = ref(false);
    const selectedSale = ref(null);
    const statusFilterItems = [
      { title: "Completed", value: "completed" },
      { title: "Pending", value: "pending" },
      { title: "Voided", value: "voided" },
      { title: "Cancelled", value: "cancelled" },
      { title: "Refunded", value: "refunded" }
    ];
    const sortItems = [
      { title: "Sort: Newest First", value: "-created_at" },
      { title: "Sort: Oldest First", value: "created_at" },
      { title: "Sort: Highest Total", value: "-total" },
      { title: "Sort: Lowest Total", value: "total" }
    ];
    const datePresetItems = [
      { title: "All", value: "all" },
      { title: "Today", value: "today" },
      { title: "Yesterday", value: "yesterday" },
      { title: "Last 7 Days", value: "last_7d" },
      { title: "Last 30 Days", value: "last_30d" },
      { title: "This Month", value: "this_month" },
      { title: "Last Month", value: "last_month" },
      { title: "This Year", value: "this_year" },
      { title: "Custom Range", value: "custom" }
    ];
    computed(
      () => datePresetItems.find((p) => p.value === datePreset.value)?.title || ""
    );
    const dateRange = computed(() => {
      if (!datePreset.value || datePreset.value === "all") return { from: null, to: null };
      if (datePreset.value === "custom") {
        return {
          from: dateFrom.value ? new Date(dateFrom.value) : null,
          to: dateTo.value ? new Date(dateTo.value) : null
        };
      }
      const now = /* @__PURE__ */ new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      let from = null;
      let to = new Date(now);
      to.setHours(23, 59, 59, 999);
      switch (datePreset.value) {
        case "today":
          from = new Date(today);
          from.setHours(0, 0, 0, 0);
          break;
        case "yesterday": {
          from = new Date(today);
          from.setDate(from.getDate() - 1);
          from.setHours(0, 0, 0, 0);
          to = new Date(today);
          to.setDate(to.getDate() - 1);
          to.setHours(23, 59, 59, 999);
          break;
        }
        case "last_7d":
          from = new Date(today);
          from.setDate(from.getDate() - 6);
          from.setHours(0, 0, 0, 0);
          break;
        case "last_30d":
          from = new Date(today);
          from.setDate(from.getDate() - 29);
          from.setHours(0, 0, 0, 0);
          break;
        case "this_month":
          from = new Date(today.getFullYear(), today.getMonth(), 1, 0, 0, 0, 0);
          break;
        case "last_month":
          from = new Date(today.getFullYear(), today.getMonth() - 1, 1, 0, 0, 0, 0);
          to = new Date(today.getFullYear(), today.getMonth(), 0, 23, 59, 59, 999);
          break;
        case "this_year":
          from = new Date(today.getFullYear(), 0, 1, 0, 0, 0, 0);
          break;
      }
      return { from, to };
    });
    const hasActiveFilters = computed(() => !!(searchQuery.value || filterStatus.value || datePreset.value && datePreset.value !== "all"));
    const dateFilteredSales = computed(() => {
      const { from, to } = dateRange.value;
      if (!from && !to) return [...sales2.value];
      return sales2.value.filter((s) => {
        const d = new Date(s.created_at);
        if (from && d < from) return false;
        if (to && d > to) return false;
        return true;
      });
    });
    const filteredSales = computed(() => {
      let list = [...dateFilteredSales.value];
      const q = searchQuery.value?.toLowerCase().trim();
      if (q) {
        list = list.filter(
          (s) => (s.transaction_number || "").toLowerCase().includes(q) || (s.customer_name || "").toLowerCase().includes(q) || (s.cashier_name || "").toLowerCase().includes(q)
        );
      }
      if (filterStatus.value) list = list.filter((s) => s.status === filterStatus.value);
      switch (sortBy.value) {
        case "-created_at":
          list.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
          break;
        case "created_at":
          list.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
          break;
        case "-total":
          list.sort((a, b) => (parseFloat(b.total) || 0) - (parseFloat(a.total) || 0));
          break;
        case "total":
          list.sort((a, b) => (parseFloat(a.total) || 0) - (parseFloat(b.total) || 0));
          break;
      }
      return list;
    });
    const totalPages = computed(() => Math.ceil(filteredSales.value.length / pageSize) || 1);
    const pagedSales = computed(() => {
      const start = (currentPage.value - 1) * pageSize;
      return filteredSales.value.slice(start, start + pageSize);
    });
    const stats = computed(() => {
      const list = dateFilteredSales.value;
      const totalSales = list.length;
      let totalRevenue = 0;
      let totalItems = 0;
      let totalDiscount = 0;
      let completedCount = 0;
      const productSet = /* @__PURE__ */ new Set();
      for (const s of list) {
        if (s.status === "completed") {
          totalRevenue += parseFloat(s.total) || 0;
          totalDiscount += parseFloat(s.discount) || 0;
          completedCount++;
        }
        totalItems += s.lines_count || 0;
        for (const item of s.items || []) {
          if (item.product) productSet.add(item.product);
        }
      }
      return {
        totalSales,
        totalRevenue,
        avgSale: completedCount > 0 ? totalRevenue / completedCount : 0,
        totalItems,
        completedCount,
        totalDiscount,
        uniqueProducts: productSet.size
      };
    });
    const analytics = computed(() => {
      const list = dateFilteredSales.value;
      let totalRevenue = 0;
      let totalDiscount = 0;
      let totalItems = 0;
      let completedCount = 0;
      for (const s of list) {
        if (s.status === "completed") {
          totalRevenue += parseFloat(s.total) || 0;
          totalDiscount += parseFloat(s.discount) || 0;
          totalItems += s.lines_count || 0;
          completedCount++;
        }
      }
      const avgItemsPerSale = completedCount > 0 ? totalItems / completedCount : 0;
      const completionRate = list.length > 0 ? completedCount / list.length * 100 : 0;
      return { totalRevenue, totalDiscount, avgItemsPerSale, completionRate };
    });
    const isMonthlyView = computed(() => {
      const { from, to } = dateRange.value;
      if (!from || !to) return false;
      return Math.ceil((to - from) / (1e3 * 60 * 60 * 24)) > 90;
    });
    const revenueChartSeries = computed(() => {
      const monthly = isMonthlyView.value;
      const revMap = /* @__PURE__ */ new Map();
      const costMap = /* @__PURE__ */ new Map();
      for (const s of dateFilteredSales.value) {
        if (s.status !== "completed") continue;
        const d = new Date(s.created_at);
        const key = monthly ? `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}` : d.toISOString().slice(0, 10);
        revMap.set(key, (revMap.get(key) || 0) + (parseFloat(s.total) || 0));
        let saleCost = 0;
        for (const item of s.items || []) {
          const cost = productCostMap.value.get(item.product) || 0;
          saleCost += cost * (parseFloat(item.quantity) || 0);
        }
        costMap.set(key, (costMap.get(key) || 0) + saleCost);
      }
      const keys = [.../* @__PURE__ */ new Set([...revMap.keys(), ...costMap.keys()])].sort((a, b) => a.localeCompare(b));
      return [
        { name: "Revenue", data: keys.map((k) => ({ x: k, y: revMap.get(k) || 0 })) },
        { name: "Cost", data: keys.map((k) => ({ x: k, y: costMap.get(k) || 0 })) }
      ];
    });
    const revenueChartOptions = computed(() => ({
      chart: { type: "area", toolbar: { show: false }, background: "transparent", foreColor: "rgba(0,0,0,0.6)", fontFamily: "Segoe UI, Inter, sans-serif" },
      colors: ["#1976d2", "#f44336"],
      dataLabels: { enabled: false },
      stroke: { curve: "smooth", width: 2 },
      fill: { type: "gradient", gradient: { shadeIntensity: 1, opacityFrom: 0.4, opacityTo: 0.05, stops: [0, 90, 100] } },
      xaxis: {
        type: "datetime",
        labels: {
          style: { fontSize: "11px" },
          format: isMonthlyView.value ? "MMM yyyy" : "dd MMM",
          datetimeFormatter: isMonthlyView.value ? {
            year: "yyyy",
            month: "MMM 'yy",
            day: "dd MMM"
          } : {
            year: "yyyy",
            month: "MMM",
            day: "dd MMM"
          }
        }
      },
      yaxis: { labels: { formatter: (v) => v >= 1e3 ? `${(v / 1e3).toFixed(1)}k` : v.toFixed(0) } },
      grid: { borderColor: "rgba(0,0,0,0.06)", strokeDashArray: 4 },
      legend: { position: "top", fontSize: "12px", markers: { size: 4 } },
      tooltip: { y: { formatter: (v) => currency(v) } }
    }));
    const paymentChartSeries = computed(() => {
      const map = /* @__PURE__ */ new Map();
      for (const s of dateFilteredSales.value) {
        if (s.status !== "completed") continue;
        const method = s.payment_method || "unknown";
        map.set(method, (map.get(method) || 0) + (parseFloat(s.total) || 0));
      }
      return [...map.values()];
    });
    const paymentChartOptions = computed(() => {
      const map = /* @__PURE__ */ new Map();
      for (const s of dateFilteredSales.value) {
        if (s.status !== "completed") continue;
        const method = s.payment_method || "unknown";
        map.set(method, (map.get(method) || 0) + (parseFloat(s.total) || 0));
      }
      const labels = [...map.keys()].map((k) => {
        const item = dateFilteredSales.value.find((s) => s.payment_method === k);
        return item?.payment_method_display || k;
      });
      return {
        chart: { type: "donut", background: "transparent", foreColor: "rgba(0,0,0,0.6)", fontFamily: "Segoe UI, Inter, sans-serif" },
        labels,
        colors: ["#4caf50", "#9c27b0", "#2196f3", "#3f51b5", "#ff9800", "#009688", "#607d8b"],
        legend: { position: "bottom", fontSize: "12px" },
        tooltip: { y: { formatter: (v) => currency(v) } },
        plotOptions: { pie: { donut: { size: "65%" } } }
      };
    });
    const topProductsChartSeries = computed(() => {
      const map = /* @__PURE__ */ new Map();
      for (const s of dateFilteredSales.value) {
        if (s.status !== "completed") continue;
        for (const item of s.items || []) {
          const name = item.product_name || "Unknown";
          map.set(name, (map.get(name) || 0) + (parseFloat(item.line_total) || 0));
        }
      }
      const sorted = [...map.entries()].sort((a, b) => b[1] - a[1]).slice(0, 10);
      return [{ name: "Revenue", data: sorted.map(([k, v]) => ({ x: k, y: parseFloat(v) })) }];
    });
    const topProductsChartOptions = computed(() => ({
      chart: { type: "bar", toolbar: { show: false }, background: "transparent", foreColor: "rgba(0,0,0,0.6)", fontFamily: "Segoe UI, Inter, sans-serif" },
      colors: ["#6366f1"],
      plotOptions: { bar: { horizontal: true, borderRadius: 6, barHeight: "60%" } },
      dataLabels: { enabled: false },
      xaxis: { labels: { formatter: (v) => v >= 1e3 ? `${(v / 1e3).toFixed(1)}k` : v.toFixed(0) } },
      grid: { borderColor: "rgba(0,0,0,0.06)", strokeDashArray: 4 },
      tooltip: { y: { formatter: (v) => currency(v) } }
    }));
    const statusChartSeries = computed(() => {
      const map = /* @__PURE__ */ new Map();
      for (const s of dateFilteredSales.value) {
        map.set(s.status, (map.get(s.status) || 0) + 1);
      }
      return [...map.values()];
    });
    const statusChartOptions = computed(() => {
      const map = /* @__PURE__ */ new Map();
      for (const s of dateFilteredSales.value) {
        map.set(s.status, (map.get(s.status) || 0) + 1);
      }
      return {
        chart: { type: "donut", background: "transparent", foreColor: "rgba(0,0,0,0.6)", fontFamily: "Segoe UI, Inter, sans-serif" },
        labels: [...map.keys()].map((k) => k.replace(/_/g, " ")),
        colors: ["#4caf50", "#2196f3", "#f44336", "#ff9800", "#a1887f"],
        legend: { position: "bottom", fontSize: "12px" },
        tooltip: { y: { formatter: (v) => `${v} transactions` } },
        plotOptions: { pie: { donut: { size: "65%" } } }
      };
    });
    const cashierPerformance = computed(() => {
      const map = /* @__PURE__ */ new Map();
      for (const s of dateFilteredSales.value) {
        if (s.status !== "completed") continue;
        const name = s.cashier_name || "Unknown";
        if (!map.has(name)) map.set(name, { name, count: 0, revenue: 0, items: 0 });
        const entry = map.get(name);
        entry.count++;
        entry.revenue += parseFloat(s.total) || 0;
        entry.items += s.lines_count || 0;
      }
      const totalRev = [...map.values()].reduce((sum, c) => sum + c.revenue, 0) || 1;
      const result = [...map.values()].map((c) => ({
        ...c,
        avgOrder: c.count > 0 ? c.revenue / c.count : 0,
        share: c.revenue / totalRev * 100
      }));
      result.sort((a, b) => b.revenue - a.revenue);
      return result;
    });
    function cashierColor(idx) {
      const colors = ["blue", "green", "deep-purple", "orange", "teal", "indigo", "pink", "cyan"];
      return colors[idx % colors.length];
    }
    const dowChartSeries = computed(() => {
      const revenueByDay = [0, 0, 0, 0, 0, 0, 0];
      for (const s of dateFilteredSales.value) {
        if (s.status !== "completed") continue;
        const d = new Date(s.created_at);
        const dow = d.getDay();
        revenueByDay[dow] += parseFloat(s.total) || 0;
      }
      const ordered = [1, 2, 3, 4, 5, 6, 0];
      return [{
        name: "Revenue",
        data: ordered.map((i) => revenueByDay[i])
      }];
    });
    const dowChartOptions = computed(() => ({
      chart: { type: "bar", toolbar: { show: false }, background: "transparent", foreColor: "rgba(0,0,0,0.6)", fontFamily: "Segoe UI, Inter, sans-serif" },
      colors: ["#1976d2"],
      plotOptions: { bar: { borderRadius: 6, columnWidth: "50%", distributed: false } },
      dataLabels: { enabled: false },
      xaxis: {
        categories: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
        labels: { style: { fontSize: "12px" } }
      },
      yaxis: { labels: { formatter: (v) => v >= 1e3 ? `${(v / 1e3).toFixed(1)}k` : v.toFixed(0) } },
      grid: { borderColor: "rgba(0,0,0,0.06)", strokeDashArray: 4 },
      tooltip: { y: { formatter: (v) => currency(v) } },
      fill: { type: "gradient", gradient: { shade: "light", type: "vertical", opacityFrom: 0.85, opacityTo: 0.55, stops: [0, 100] } }
    }));
    const TIME_RANGES = [
      { label: "Morning", short: "AM", icon: "mdi-weather-sunny", color: "linear-gradient(135deg, #fbbf24, #f59e0b)", solidColor: "#f59e0b", hours: [6, 7, 8, 9, 10, 11], sub: "6am–12pm" },
      { label: "Afternoon", short: "PM", icon: "mdi-weather-partly-cloudy", color: "linear-gradient(135deg, #60a5fa, #3b82f6)", solidColor: "#3b82f6", hours: [12, 13, 14, 15], sub: "12pm–4pm" },
      { label: "Evening", short: "EVE", icon: "mdi-weather-sunset", color: "linear-gradient(135deg, #fb923c, #ea580c)", solidColor: "#ea580c", hours: [16, 17, 18, 19], sub: "4pm–8pm" },
      { label: "Night", short: "NIGHT", icon: "mdi-weather-night", color: "linear-gradient(135deg, #818cf8, #6366f1)", solidColor: "#6366f1", hours: [20, 21, 22, 23], sub: "8pm–12am" },
      { label: "Late Night", short: "LATE", icon: "mdi-moon-crescent", color: "linear-gradient(135deg, #a78bfa, #7c3aed)", solidColor: "#7c3aed", hours: [0, 1, 2, 3, 4, 5], sub: "12am–6am" }
    ];
    const ALL_HOURS = Array.from({ length: 24 }, (_, i) => i);
    const hourlyChartSeries = computed(() => {
      const revenueByHour = {};
      const countByHour = {};
      for (const h of ALL_HOURS) {
        revenueByHour[h] = 0;
        countByHour[h] = 0;
      }
      for (const s of dateFilteredSales.value) {
        if (s.status !== "completed") continue;
        const d = new Date(s.created_at);
        const h = d.getHours();
        revenueByHour[h] += parseFloat(s.total) || 0;
        countByHour[h]++;
      }
      return [
        { name: "Revenue", data: ALL_HOURS.map((h) => revenueByHour[h]) },
        { name: "Transactions", data: ALL_HOURS.map((h) => countByHour[h]) }
      ];
    });
    const hourlyChartOptions = computed(() => ({
      chart: { type: "bar", toolbar: { show: false }, background: "transparent", foreColor: "rgba(0,0,0,0.6)", fontFamily: "Segoe UI, Inter, sans-serif" },
      colors: ["#1976d2", "#ff9800"],
      plotOptions: { bar: { borderRadius: 4, columnWidth: "60%" } },
      dataLabels: { enabled: false },
      xaxis: {
        categories: ALL_HOURS.map((h) => `${h}:00`),
        labels: { style: { fontSize: "10px" } },
        tickAmount: 12
      },
      yaxis: [
        { title: { text: "Revenue", style: { fontSize: "11px" } }, labels: { formatter: (v) => v >= 1e3 ? `${(v / 1e3).toFixed(1)}k` : v.toFixed(0) } },
        { opposite: true, title: { text: "Transactions", style: { fontSize: "11px" } }, labels: { formatter: (v) => v.toFixed(0) } }
      ],
      grid: { borderColor: "rgba(0,0,0,0.06)", strokeDashArray: 4 },
      legend: { position: "top", fontSize: "12px", markers: { size: 4 } },
      tooltip: { y: { formatter: (v, { seriesIndex }) => seriesIndex === 0 ? currency(v) : `${v} txns` } },
      fill: { type: "gradient", gradient: { shade: "light", type: "vertical", opacityFrom: 0.85, opacityTo: 0.55, stops: [0, 100] } }
    }));
    const timeOfDayChartSeries = computed(() => {
      const revenueByHour = {};
      const countByHour = {};
      for (const h of ALL_HOURS) {
        revenueByHour[h] = 0;
        countByHour[h] = 0;
      }
      for (const s of dateFilteredSales.value) {
        if (s.status !== "completed") continue;
        const h = new Date(s.created_at).getHours();
        revenueByHour[h] += parseFloat(s.total) || 0;
        countByHour[h]++;
      }
      const revenueData = TIME_RANGES.map((r) => r.hours.reduce((s, h) => s + revenueByHour[h], 0));
      const txnData = TIME_RANGES.map((r) => r.hours.reduce((s, h) => s + countByHour[h], 0));
      return [
        // Revenue as bars (per range, colored individually)
        { name: "Revenue", type: "bar", data: revenueData },
        // Transactions as bars (per range)
        { name: "Transactions", type: "bar", data: txnData },
        // Revenue trend as a smooth area line overlay
        { name: "Revenue Trend", type: "area", data: revenueData },
        // Transaction trend as a smooth line overlay
        { name: "Txn Trend", type: "line", data: txnData }
      ];
    });
    const timeOfDayChartOptions = computed(() => ({
      chart: { type: "bar", toolbar: { show: false }, background: "transparent", foreColor: "rgba(0,0,0,0.6)", fontFamily: "Segoe UI, Inter, sans-serif" },
      // 4 colors for 4 series: Revenue bar=blue, Txn bar=amber, Revenue Trend area=light blue, Txn Trend line=amber
      colors: ["#1976d2", "#ffa726", "#4cc2ff", "#ffa726"],
      // Per-series fill + stroke config
      fill: {
        type: ["solid", "solid", "gradient", "solid"],
        gradient: { shade: "light", type: "vertical", opacityFrom: 0.35, opacityTo: 0.05, stops: [0, 100] },
        opacity: [0.9, 0.9, 1, 1]
      },
      stroke: {
        width: [0, 0, 3, 2.5],
        curve: ["straight", "straight", "smooth", "smooth"],
        colors: ["transparent", "transparent", "#4cc2ff", "#ffa726"]
      },
      markers: {
        size: [0, 0, 5, 4],
        strokeWidth: 0,
        colors: ["transparent", "transparent", "#4cc2ff", "#ffa726"],
        hover: { size: [0, 0, 7, 6] }
      },
      plotOptions: { bar: { borderRadius: 8, columnWidth: "45%" } },
      dataLabels: { enabled: false },
      xaxis: {
        categories: TIME_RANGES.map((r) => r.label),
        labels: { style: { fontSize: "13px", fontWeight: 600 } },
        axisBorder: { show: true },
        axisTicks: { show: true }
      },
      yaxis: [
        { seriesName: "Revenue", title: { text: "Revenue", style: { fontSize: "11px" } }, labels: { formatter: (v) => v >= 1e3 ? `${(v / 1e3).toFixed(1)}k` : v.toFixed(0) } },
        { seriesName: "Transactions", opposite: true, title: { text: "Transactions", style: { fontSize: "11px" } }, labels: { formatter: (v) => v.toFixed(0) } }
      ],
      grid: { borderColor: "rgba(0,0,0,0.06)", strokeDashArray: 4 },
      legend: { show: true, position: "top", fontSize: "12px", markers: { size: 4 }, labels: { colors: void 0 } },
      tooltip: {
        y: { formatter: (v, { seriesIndex }) => seriesIndex === 0 || seriesIndex === 2 ? currency(v) : `${v} txns` }
      }
    }));
    const timeRangeStats = computed(() => {
      const revenueByHour = {};
      const countByHour = {};
      for (const h of ALL_HOURS) {
        revenueByHour[h] = 0;
        countByHour[h] = 0;
      }
      for (const s of dateFilteredSales.value) {
        if (s.status !== "completed") continue;
        const h = new Date(s.created_at).getHours();
        revenueByHour[h] += parseFloat(s.total) || 0;
        countByHour[h]++;
      }
      const totalRevenue = Object.values(revenueByHour).reduce((s, v) => s + v, 0) || 1;
      const totalCount = Object.values(countByHour).reduce((s, v) => s + v, 0) || 1;
      return TIME_RANGES.map((r) => {
        const revenue = r.hours.reduce((s, h) => s + revenueByHour[h], 0);
        const count = r.hours.reduce((s, h) => s + countByHour[h], 0);
        return {
          ...r,
          revenue,
          count,
          revenuePct: revenue / totalRevenue * 100,
          sharePct: count / totalCount * 100
        };
      });
    });
    const busiestRange = computed(() => {
      const stats2 = timeRangeStats.value;
      if (!stats2.length) return null;
      return stats2.reduce((best, r) => r.revenue > best.revenue ? r : best, stats2[0]);
    });
    async function fetchAllPages(url, pageSize2 = 500) {
      const all = [];
      let nextUrl = `${url}${url.includes("?") ? "&" : "?"}page_size=${pageSize2}`;
      while (nextUrl) {
        const data = await useApi()(nextUrl);
        all.push(...data.results || []);
        nextUrl = data.next ? data.next.replace(/^https?:\/\/[^/]+\/api/, "") : null;
      }
      return all;
    }
    async function loadSales() {
      loading.value = true;
      try {
        const [allSales, products] = await Promise.all([
          fetchAllPages("/pos/transactions/?ordering=-created_at"),
          useApi()("/products/?page_size=500").then((d) => d.results || d)
        ]);
        sales2.value = allSales.map((s) => ({ ...s, lines_count: s.items_count || s.items?.length || 0 }));
        const costMap = /* @__PURE__ */ new Map();
        for (const p of products) {
          costMap.set(p.id, parseFloat(p.cost_price) || 0);
        }
        productCostMap.value = costMap;
      } catch {
        toast.error("Failed to load sales");
      } finally {
        loading.value = false;
      }
    }
    const STATUS_COLORS = {
      completed: "green",
      pending: "blue",
      voided: "red",
      cancelled: "red",
      refunded: "deep-orange"
    };
    function statusColor(status) {
      return STATUS_COLORS[status] || "grey";
    }
    const STATUS_ICONS = {
      completed: "mdi-check-circle",
      pending: "mdi-clock-outline",
      voided: "mdi-close-circle",
      cancelled: "mdi-close-octagon",
      refunded: "mdi-undo"
    };
    function statusIcon(status) {
      return STATUS_ICONS[status] || "mdi-help-circle";
    }
    function paymentColor(method) {
      const map = { cash: "green", mpesa: "purple", card: "blue", insurance: "indigo", credit: "amber", bank_transfer: "teal" };
      return map[method] || "grey";
    }
    function formatStatus(status) {
      return (status || "").replace(/_/g, " ");
    }
    function rowNumber(idx) {
      return (currentPage.value - 1) * pageSize + idx + 1;
    }
    function clearAllFilters() {
      searchQuery.value = "";
      filterStatus.value = "";
      datePreset.value = "all";
      dateFrom.value = "";
      dateTo.value = "";
      sortBy.value = "-created_at";
      currentPage.value = 1;
    }
    function applyCustomRange() {
      dateFrom.value = customFrom.value;
      dateTo.value = customTo.value;
      datePreset.value = "custom";
      customDialog.value = false;
    }
    function openSaleDetails(sale) {
      selectedSale.value = sale;
      detailsDialog.value = true;
    }
    function exportCsv() {
      const rows = filteredSales.value;
      if (rows.length === 0) {
        toast.info("Nothing to export");
        return;
      }
      const header = ["Transaction #", "Customer", "Cashier", "Branch", "Payment", "Status", "Items", "Subtotal", "Discount", "Tax", "Total", "Date"];
      const lines = [header.join(",")];
      for (const r of rows) {
        const cells = [
          r.transaction_number || "",
          `"${(r.customer_name || "Walk-in").replace(/"/g, '""')}"`,
          `"${(r.cashier_name || "").replace(/"/g, '""')}"`,
          `"${(r.branch_name || "").replace(/"/g, '""')}"`,
          r.payment_method_display || r.payment_method || "",
          r.status || "",
          r.lines_count || 0,
          r.subtotal ?? "",
          r.discount ?? "",
          r.tax ?? "",
          r.total ?? "",
          r.created_at || ""
        ];
        lines.push(cells.join(","));
      }
      const csv = lines.join("\n");
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const a = (void 0).createElement("a");
      a.href = url;
      a.download = `sales-${(/* @__PURE__ */ new Date()).toISOString().slice(0, 10)}.csv`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success("Exported to CSV");
    }
    watch([searchQuery, filterStatus, sortBy], () => {
      currentPage.value = 1;
    });
    return (_ctx, _push, _parent, _attrs) => {
      const _component_PaginationBar = _sfc_main$1;
      const _component_apexchart = resolveComponent("apexchart");
      _push(ssrRenderComponent(VContainer, mergeProps({
        class: "pa-0",
        fluid: ""
      }, _attrs), {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(ssrRenderComponent(VRow, { class: "d-flex align-center justify-space-between mb-4" }, {
              default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                if (_push3) {
                  _push3(ssrRenderComponent(VCol, {
                    cols: "12",
                    sm: "6"
                  }, {
                    default: withCtx((_3, _push4, _parent4, _scopeId3) => {
                      if (_push4) {
                        _push4(`<div class="text-h5 font-weight-bold" data-v-b687d18f${_scopeId3}>Sales</div><div class="text-body-2 text-medium-emphasis" data-v-b687d18f${_scopeId3}>${ssrInterpolate(unref(stats).totalSales)} sales · ${ssrInterpolate(unref(currency)(unref(stats).totalRevenue))} revenue · ${ssrInterpolate(unref(formatNumber)(unref(stats).totalItems))} items sold </div>`);
                      } else {
                        return [
                          createVNode("div", { class: "text-h5 font-weight-bold" }, "Sales"),
                          createVNode("div", { class: "text-body-2 text-medium-emphasis" }, toDisplayString(unref(stats).totalSales) + " sales · " + toDisplayString(unref(currency)(unref(stats).totalRevenue)) + " revenue · " + toDisplayString(unref(formatNumber)(unref(stats).totalItems)) + " items sold ", 1)
                        ];
                      }
                    }),
                    _: 1
                  }, _parent3, _scopeId2));
                  _push3(ssrRenderComponent(VCol, {
                    cols: "12",
                    class: "d-flex justify-space-between ga-2 flex-wrap align-center"
                  }, {
                    default: withCtx((_3, _push4, _parent4, _scopeId3) => {
                      if (_push4) {
                        _push4(ssrRenderComponent(VBtnToggle, {
                          modelValue: unref(datePreset),
                          "onUpdate:modelValue": ($event) => isRef(datePreset) ? datePreset.value = $event : null,
                          mandatory: "",
                          density: "comfortable",
                          variant: "outlined",
                          divided: "",
                          color: "primary"
                        }, {
                          default: withCtx((_4, _push5, _parent5, _scopeId4) => {
                            if (_push5) {
                              _push5(`<!--[-->`);
                              ssrRenderList(datePresetItems.filter((p) => p.value !== "custom"), (preset) => {
                                _push5(ssrRenderComponent(VBtn, {
                                  key: preset.value,
                                  value: preset.value,
                                  size: "small",
                                  variant: "text"
                                }, {
                                  default: withCtx((_5, _push6, _parent6, _scopeId5) => {
                                    if (_push6) {
                                      _push6(`${ssrInterpolate(preset.title)}`);
                                    } else {
                                      return [
                                        createTextVNode(toDisplayString(preset.title), 1)
                                      ];
                                    }
                                  }),
                                  _: 2
                                }, _parent5, _scopeId4));
                              });
                              _push5(`<!--]-->`);
                              _push5(ssrRenderComponent(VBtn, {
                                value: "custom",
                                size: "small",
                                variant: "text",
                                onClick: ($event) => customDialog.value = true
                              }, {
                                default: withCtx((_5, _push6, _parent6, _scopeId5) => {
                                  if (_push6) {
                                    _push6(`Custom`);
                                  } else {
                                    return [
                                      createTextVNode("Custom")
                                    ];
                                  }
                                }),
                                _: 1
                              }, _parent5, _scopeId4));
                            } else {
                              return [
                                (openBlock(true), createBlock(Fragment, null, renderList(datePresetItems.filter((p) => p.value !== "custom"), (preset) => {
                                  return openBlock(), createBlock(VBtn, {
                                    key: preset.value,
                                    value: preset.value,
                                    size: "small",
                                    variant: "text"
                                  }, {
                                    default: withCtx(() => [
                                      createTextVNode(toDisplayString(preset.title), 1)
                                    ]),
                                    _: 2
                                  }, 1032, ["value"]);
                                }), 128)),
                                createVNode(VBtn, {
                                  value: "custom",
                                  size: "small",
                                  variant: "text",
                                  onClick: ($event) => customDialog.value = true
                                }, {
                                  default: withCtx(() => [
                                    createTextVNode("Custom")
                                  ]),
                                  _: 1
                                }, 8, ["onClick"])
                              ];
                            }
                          }),
                          _: 1
                        }, _parent4, _scopeId3));
                        _push4(ssrRenderComponent(VSpacer, null, null, _parent4, _scopeId3));
                        _push4(ssrRenderComponent(VBtn, {
                          variant: "outlined",
                          "prepend-icon": "mdi-download",
                          onClick: exportCsv
                        }, {
                          default: withCtx((_4, _push5, _parent5, _scopeId4) => {
                            if (_push5) {
                              _push5(`Export`);
                            } else {
                              return [
                                createTextVNode("Export")
                              ];
                            }
                          }),
                          _: 1
                        }, _parent4, _scopeId3));
                        _push4(ssrRenderComponent(VBtn, {
                          variant: "outlined",
                          "prepend-icon": "mdi-refresh",
                          onClick: loadSales
                        }, {
                          default: withCtx((_4, _push5, _parent5, _scopeId4) => {
                            if (_push5) {
                              _push5(`Refresh`);
                            } else {
                              return [
                                createTextVNode("Refresh")
                              ];
                            }
                          }),
                          _: 1
                        }, _parent4, _scopeId3));
                      } else {
                        return [
                          createVNode(VBtnToggle, {
                            modelValue: unref(datePreset),
                            "onUpdate:modelValue": ($event) => isRef(datePreset) ? datePreset.value = $event : null,
                            mandatory: "",
                            density: "comfortable",
                            variant: "outlined",
                            divided: "",
                            color: "primary"
                          }, {
                            default: withCtx(() => [
                              (openBlock(true), createBlock(Fragment, null, renderList(datePresetItems.filter((p) => p.value !== "custom"), (preset) => {
                                return openBlock(), createBlock(VBtn, {
                                  key: preset.value,
                                  value: preset.value,
                                  size: "small",
                                  variant: "text"
                                }, {
                                  default: withCtx(() => [
                                    createTextVNode(toDisplayString(preset.title), 1)
                                  ]),
                                  _: 2
                                }, 1032, ["value"]);
                              }), 128)),
                              createVNode(VBtn, {
                                value: "custom",
                                size: "small",
                                variant: "text",
                                onClick: ($event) => customDialog.value = true
                              }, {
                                default: withCtx(() => [
                                  createTextVNode("Custom")
                                ]),
                                _: 1
                              }, 8, ["onClick"])
                            ]),
                            _: 1
                          }, 8, ["modelValue", "onUpdate:modelValue"]),
                          createVNode(VSpacer),
                          createVNode(VBtn, {
                            variant: "outlined",
                            "prepend-icon": "mdi-download",
                            onClick: exportCsv
                          }, {
                            default: withCtx(() => [
                              createTextVNode("Export")
                            ]),
                            _: 1
                          }),
                          createVNode(VBtn, {
                            variant: "outlined",
                            "prepend-icon": "mdi-refresh",
                            onClick: loadSales
                          }, {
                            default: withCtx(() => [
                              createTextVNode("Refresh")
                            ]),
                            _: 1
                          })
                        ];
                      }
                    }),
                    _: 1
                  }, _parent3, _scopeId2));
                } else {
                  return [
                    createVNode(VCol, {
                      cols: "12",
                      sm: "6"
                    }, {
                      default: withCtx(() => [
                        createVNode("div", { class: "text-h5 font-weight-bold" }, "Sales"),
                        createVNode("div", { class: "text-body-2 text-medium-emphasis" }, toDisplayString(unref(stats).totalSales) + " sales · " + toDisplayString(unref(currency)(unref(stats).totalRevenue)) + " revenue · " + toDisplayString(unref(formatNumber)(unref(stats).totalItems)) + " items sold ", 1)
                      ]),
                      _: 1
                    }),
                    createVNode(VCol, {
                      cols: "12",
                      class: "d-flex justify-space-between ga-2 flex-wrap align-center"
                    }, {
                      default: withCtx(() => [
                        createVNode(VBtnToggle, {
                          modelValue: unref(datePreset),
                          "onUpdate:modelValue": ($event) => isRef(datePreset) ? datePreset.value = $event : null,
                          mandatory: "",
                          density: "comfortable",
                          variant: "outlined",
                          divided: "",
                          color: "primary"
                        }, {
                          default: withCtx(() => [
                            (openBlock(true), createBlock(Fragment, null, renderList(datePresetItems.filter((p) => p.value !== "custom"), (preset) => {
                              return openBlock(), createBlock(VBtn, {
                                key: preset.value,
                                value: preset.value,
                                size: "small",
                                variant: "text"
                              }, {
                                default: withCtx(() => [
                                  createTextVNode(toDisplayString(preset.title), 1)
                                ]),
                                _: 2
                              }, 1032, ["value"]);
                            }), 128)),
                            createVNode(VBtn, {
                              value: "custom",
                              size: "small",
                              variant: "text",
                              onClick: ($event) => customDialog.value = true
                            }, {
                              default: withCtx(() => [
                                createTextVNode("Custom")
                              ]),
                              _: 1
                            }, 8, ["onClick"])
                          ]),
                          _: 1
                        }, 8, ["modelValue", "onUpdate:modelValue"]),
                        createVNode(VSpacer),
                        createVNode(VBtn, {
                          variant: "outlined",
                          "prepend-icon": "mdi-download",
                          onClick: exportCsv
                        }, {
                          default: withCtx(() => [
                            createTextVNode("Export")
                          ]),
                          _: 1
                        }),
                        createVNode(VBtn, {
                          variant: "outlined",
                          "prepend-icon": "mdi-refresh",
                          onClick: loadSales
                        }, {
                          default: withCtx(() => [
                            createTextVNode("Refresh")
                          ]),
                          _: 1
                        })
                      ]),
                      _: 1
                    })
                  ];
                }
              }),
              _: 1
            }, _parent2, _scopeId));
            _push2(ssrRenderComponent(VRow, { class: "mb-4" }, {
              default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                if (_push3) {
                  _push3(ssrRenderComponent(VCol, {
                    cols: "6",
                    lg: "3"
                  }, {
                    default: withCtx((_3, _push4, _parent4, _scopeId3) => {
                      if (_push4) {
                        _push4(ssrRenderComponent(VCard, {
                          rounded: "xl",
                          variant: "outlined",
                          class: "kpi-card pa-5"
                        }, {
                          default: withCtx((_4, _push5, _parent5, _scopeId4) => {
                            if (_push5) {
                              _push5(`<div class="d-flex align-start justify-space-between mb-2" data-v-b687d18f${_scopeId4}><span class="text-caption text-medium-emphasis font-weight-medium" data-v-b687d18f${_scopeId4}>Total Sales</span><div class="kpi-icon kpi-icon-blue" data-v-b687d18f${_scopeId4}>`);
                              _push5(ssrRenderComponent(VIcon, {
                                size: "18",
                                icon: "mdi-receipt-text-outline"
                              }, null, _parent5, _scopeId4));
                              _push5(`</div></div><p class="text-h4 font-weight-bold mb-1" data-v-b687d18f${_scopeId4}>${ssrInterpolate(unref(stats).totalSales)}</p><span class="text-caption text-medium-emphasis" data-v-b687d18f${_scopeId4}>${ssrInterpolate(unref(stats).completedCount)} completed</span>`);
                            } else {
                              return [
                                createVNode("div", { class: "d-flex align-start justify-space-between mb-2" }, [
                                  createVNode("span", { class: "text-caption text-medium-emphasis font-weight-medium" }, "Total Sales"),
                                  createVNode("div", { class: "kpi-icon kpi-icon-blue" }, [
                                    createVNode(VIcon, {
                                      size: "18",
                                      icon: "mdi-receipt-text-outline"
                                    })
                                  ])
                                ]),
                                createVNode("p", { class: "text-h4 font-weight-bold mb-1" }, toDisplayString(unref(stats).totalSales), 1),
                                createVNode("span", { class: "text-caption text-medium-emphasis" }, toDisplayString(unref(stats).completedCount) + " completed", 1)
                              ];
                            }
                          }),
                          _: 1
                        }, _parent4, _scopeId3));
                      } else {
                        return [
                          createVNode(VCard, {
                            rounded: "xl",
                            variant: "outlined",
                            class: "kpi-card pa-5"
                          }, {
                            default: withCtx(() => [
                              createVNode("div", { class: "d-flex align-start justify-space-between mb-2" }, [
                                createVNode("span", { class: "text-caption text-medium-emphasis font-weight-medium" }, "Total Sales"),
                                createVNode("div", { class: "kpi-icon kpi-icon-blue" }, [
                                  createVNode(VIcon, {
                                    size: "18",
                                    icon: "mdi-receipt-text-outline"
                                  })
                                ])
                              ]),
                              createVNode("p", { class: "text-h4 font-weight-bold mb-1" }, toDisplayString(unref(stats).totalSales), 1),
                              createVNode("span", { class: "text-caption text-medium-emphasis" }, toDisplayString(unref(stats).completedCount) + " completed", 1)
                            ]),
                            _: 1
                          })
                        ];
                      }
                    }),
                    _: 1
                  }, _parent3, _scopeId2));
                  _push3(ssrRenderComponent(VCol, {
                    cols: "6",
                    lg: "3"
                  }, {
                    default: withCtx((_3, _push4, _parent4, _scopeId3) => {
                      if (_push4) {
                        _push4(ssrRenderComponent(VCard, {
                          rounded: "xl",
                          variant: "outlined",
                          class: "kpi-card pa-5"
                        }, {
                          default: withCtx((_4, _push5, _parent5, _scopeId4) => {
                            if (_push5) {
                              _push5(`<div class="d-flex align-start justify-space-between mb-2" data-v-b687d18f${_scopeId4}><span class="text-caption text-medium-emphasis font-weight-medium" data-v-b687d18f${_scopeId4}>Total Revenue</span><div class="kpi-icon kpi-icon-green" data-v-b687d18f${_scopeId4}>`);
                              _push5(ssrRenderComponent(VIcon, {
                                size: "18",
                                icon: "mdi-cash-multiple"
                              }, null, _parent5, _scopeId4));
                              _push5(`</div></div><p class="text-h4 font-weight-bold mb-1 text-success" data-v-b687d18f${_scopeId4}>${ssrInterpolate(unref(currency)(unref(stats).totalRevenue))}</p><span class="text-caption text-medium-emphasis" data-v-b687d18f${_scopeId4}>Avg: ${ssrInterpolate(unref(currency)(unref(stats).avgSale))}</span>`);
                            } else {
                              return [
                                createVNode("div", { class: "d-flex align-start justify-space-between mb-2" }, [
                                  createVNode("span", { class: "text-caption text-medium-emphasis font-weight-medium" }, "Total Revenue"),
                                  createVNode("div", { class: "kpi-icon kpi-icon-green" }, [
                                    createVNode(VIcon, {
                                      size: "18",
                                      icon: "mdi-cash-multiple"
                                    })
                                  ])
                                ]),
                                createVNode("p", { class: "text-h4 font-weight-bold mb-1 text-success" }, toDisplayString(unref(currency)(unref(stats).totalRevenue)), 1),
                                createVNode("span", { class: "text-caption text-medium-emphasis" }, "Avg: " + toDisplayString(unref(currency)(unref(stats).avgSale)), 1)
                              ];
                            }
                          }),
                          _: 1
                        }, _parent4, _scopeId3));
                      } else {
                        return [
                          createVNode(VCard, {
                            rounded: "xl",
                            variant: "outlined",
                            class: "kpi-card pa-5"
                          }, {
                            default: withCtx(() => [
                              createVNode("div", { class: "d-flex align-start justify-space-between mb-2" }, [
                                createVNode("span", { class: "text-caption text-medium-emphasis font-weight-medium" }, "Total Revenue"),
                                createVNode("div", { class: "kpi-icon kpi-icon-green" }, [
                                  createVNode(VIcon, {
                                    size: "18",
                                    icon: "mdi-cash-multiple"
                                  })
                                ])
                              ]),
                              createVNode("p", { class: "text-h4 font-weight-bold mb-1 text-success" }, toDisplayString(unref(currency)(unref(stats).totalRevenue)), 1),
                              createVNode("span", { class: "text-caption text-medium-emphasis" }, "Avg: " + toDisplayString(unref(currency)(unref(stats).avgSale)), 1)
                            ]),
                            _: 1
                          })
                        ];
                      }
                    }),
                    _: 1
                  }, _parent3, _scopeId2));
                  _push3(ssrRenderComponent(VCol, {
                    cols: "6",
                    lg: "3"
                  }, {
                    default: withCtx((_3, _push4, _parent4, _scopeId3) => {
                      if (_push4) {
                        _push4(ssrRenderComponent(VCard, {
                          rounded: "xl",
                          variant: "outlined",
                          class: "kpi-card pa-5"
                        }, {
                          default: withCtx((_4, _push5, _parent5, _scopeId4) => {
                            if (_push5) {
                              _push5(`<div class="d-flex align-start justify-space-between mb-2" data-v-b687d18f${_scopeId4}><span class="text-caption text-medium-emphasis font-weight-medium" data-v-b687d18f${_scopeId4}>Avg Sale Value</span><div class="kpi-icon kpi-icon-purple" data-v-b687d18f${_scopeId4}>`);
                              _push5(ssrRenderComponent(VIcon, {
                                size: "18",
                                icon: "mdi-chart-line-variant"
                              }, null, _parent5, _scopeId4));
                              _push5(`</div></div><p class="text-h4 font-weight-bold mb-1" data-v-b687d18f${_scopeId4}>${ssrInterpolate(unref(currency)(unref(stats).avgSale))}</p><span class="text-caption text-medium-emphasis" data-v-b687d18f${_scopeId4}>${ssrInterpolate(unref(stats).totalDiscount > 0 ? "Discount: " + unref(currency)(unref(stats).totalDiscount) : "No discounts")}</span>`);
                            } else {
                              return [
                                createVNode("div", { class: "d-flex align-start justify-space-between mb-2" }, [
                                  createVNode("span", { class: "text-caption text-medium-emphasis font-weight-medium" }, "Avg Sale Value"),
                                  createVNode("div", { class: "kpi-icon kpi-icon-purple" }, [
                                    createVNode(VIcon, {
                                      size: "18",
                                      icon: "mdi-chart-line-variant"
                                    })
                                  ])
                                ]),
                                createVNode("p", { class: "text-h4 font-weight-bold mb-1" }, toDisplayString(unref(currency)(unref(stats).avgSale)), 1),
                                createVNode("span", { class: "text-caption text-medium-emphasis" }, toDisplayString(unref(stats).totalDiscount > 0 ? "Discount: " + unref(currency)(unref(stats).totalDiscount) : "No discounts"), 1)
                              ];
                            }
                          }),
                          _: 1
                        }, _parent4, _scopeId3));
                      } else {
                        return [
                          createVNode(VCard, {
                            rounded: "xl",
                            variant: "outlined",
                            class: "kpi-card pa-5"
                          }, {
                            default: withCtx(() => [
                              createVNode("div", { class: "d-flex align-start justify-space-between mb-2" }, [
                                createVNode("span", { class: "text-caption text-medium-emphasis font-weight-medium" }, "Avg Sale Value"),
                                createVNode("div", { class: "kpi-icon kpi-icon-purple" }, [
                                  createVNode(VIcon, {
                                    size: "18",
                                    icon: "mdi-chart-line-variant"
                                  })
                                ])
                              ]),
                              createVNode("p", { class: "text-h4 font-weight-bold mb-1" }, toDisplayString(unref(currency)(unref(stats).avgSale)), 1),
                              createVNode("span", { class: "text-caption text-medium-emphasis" }, toDisplayString(unref(stats).totalDiscount > 0 ? "Discount: " + unref(currency)(unref(stats).totalDiscount) : "No discounts"), 1)
                            ]),
                            _: 1
                          })
                        ];
                      }
                    }),
                    _: 1
                  }, _parent3, _scopeId2));
                  _push3(ssrRenderComponent(VCol, {
                    cols: "6",
                    lg: "3"
                  }, {
                    default: withCtx((_3, _push4, _parent4, _scopeId3) => {
                      if (_push4) {
                        _push4(ssrRenderComponent(VCard, {
                          rounded: "xl",
                          variant: "outlined",
                          class: "kpi-card pa-5"
                        }, {
                          default: withCtx((_4, _push5, _parent5, _scopeId4) => {
                            if (_push5) {
                              _push5(`<div class="d-flex align-start justify-space-between mb-2" data-v-b687d18f${_scopeId4}><span class="text-caption text-medium-emphasis font-weight-medium" data-v-b687d18f${_scopeId4}>Items Sold</span><div class="kpi-icon kpi-icon-orange" data-v-b687d18f${_scopeId4}>`);
                              _push5(ssrRenderComponent(VIcon, {
                                size: "18",
                                icon: "mdi-package-variant-closed"
                              }, null, _parent5, _scopeId4));
                              _push5(`</div></div><p class="text-h4 font-weight-bold mb-1" data-v-b687d18f${_scopeId4}>${ssrInterpolate(unref(formatNumber)(unref(stats).totalItems))}</p><span class="text-caption text-medium-emphasis" data-v-b687d18f${_scopeId4}>${ssrInterpolate(unref(stats).uniqueProducts)} unique products</span>`);
                            } else {
                              return [
                                createVNode("div", { class: "d-flex align-start justify-space-between mb-2" }, [
                                  createVNode("span", { class: "text-caption text-medium-emphasis font-weight-medium" }, "Items Sold"),
                                  createVNode("div", { class: "kpi-icon kpi-icon-orange" }, [
                                    createVNode(VIcon, {
                                      size: "18",
                                      icon: "mdi-package-variant-closed"
                                    })
                                  ])
                                ]),
                                createVNode("p", { class: "text-h4 font-weight-bold mb-1" }, toDisplayString(unref(formatNumber)(unref(stats).totalItems)), 1),
                                createVNode("span", { class: "text-caption text-medium-emphasis" }, toDisplayString(unref(stats).uniqueProducts) + " unique products", 1)
                              ];
                            }
                          }),
                          _: 1
                        }, _parent4, _scopeId3));
                      } else {
                        return [
                          createVNode(VCard, {
                            rounded: "xl",
                            variant: "outlined",
                            class: "kpi-card pa-5"
                          }, {
                            default: withCtx(() => [
                              createVNode("div", { class: "d-flex align-start justify-space-between mb-2" }, [
                                createVNode("span", { class: "text-caption text-medium-emphasis font-weight-medium" }, "Items Sold"),
                                createVNode("div", { class: "kpi-icon kpi-icon-orange" }, [
                                  createVNode(VIcon, {
                                    size: "18",
                                    icon: "mdi-package-variant-closed"
                                  })
                                ])
                              ]),
                              createVNode("p", { class: "text-h4 font-weight-bold mb-1" }, toDisplayString(unref(formatNumber)(unref(stats).totalItems)), 1),
                              createVNode("span", { class: "text-caption text-medium-emphasis" }, toDisplayString(unref(stats).uniqueProducts) + " unique products", 1)
                            ]),
                            _: 1
                          })
                        ];
                      }
                    }),
                    _: 1
                  }, _parent3, _scopeId2));
                } else {
                  return [
                    createVNode(VCol, {
                      cols: "6",
                      lg: "3"
                    }, {
                      default: withCtx(() => [
                        createVNode(VCard, {
                          rounded: "xl",
                          variant: "outlined",
                          class: "kpi-card pa-5"
                        }, {
                          default: withCtx(() => [
                            createVNode("div", { class: "d-flex align-start justify-space-between mb-2" }, [
                              createVNode("span", { class: "text-caption text-medium-emphasis font-weight-medium" }, "Total Sales"),
                              createVNode("div", { class: "kpi-icon kpi-icon-blue" }, [
                                createVNode(VIcon, {
                                  size: "18",
                                  icon: "mdi-receipt-text-outline"
                                })
                              ])
                            ]),
                            createVNode("p", { class: "text-h4 font-weight-bold mb-1" }, toDisplayString(unref(stats).totalSales), 1),
                            createVNode("span", { class: "text-caption text-medium-emphasis" }, toDisplayString(unref(stats).completedCount) + " completed", 1)
                          ]),
                          _: 1
                        })
                      ]),
                      _: 1
                    }),
                    createVNode(VCol, {
                      cols: "6",
                      lg: "3"
                    }, {
                      default: withCtx(() => [
                        createVNode(VCard, {
                          rounded: "xl",
                          variant: "outlined",
                          class: "kpi-card pa-5"
                        }, {
                          default: withCtx(() => [
                            createVNode("div", { class: "d-flex align-start justify-space-between mb-2" }, [
                              createVNode("span", { class: "text-caption text-medium-emphasis font-weight-medium" }, "Total Revenue"),
                              createVNode("div", { class: "kpi-icon kpi-icon-green" }, [
                                createVNode(VIcon, {
                                  size: "18",
                                  icon: "mdi-cash-multiple"
                                })
                              ])
                            ]),
                            createVNode("p", { class: "text-h4 font-weight-bold mb-1 text-success" }, toDisplayString(unref(currency)(unref(stats).totalRevenue)), 1),
                            createVNode("span", { class: "text-caption text-medium-emphasis" }, "Avg: " + toDisplayString(unref(currency)(unref(stats).avgSale)), 1)
                          ]),
                          _: 1
                        })
                      ]),
                      _: 1
                    }),
                    createVNode(VCol, {
                      cols: "6",
                      lg: "3"
                    }, {
                      default: withCtx(() => [
                        createVNode(VCard, {
                          rounded: "xl",
                          variant: "outlined",
                          class: "kpi-card pa-5"
                        }, {
                          default: withCtx(() => [
                            createVNode("div", { class: "d-flex align-start justify-space-between mb-2" }, [
                              createVNode("span", { class: "text-caption text-medium-emphasis font-weight-medium" }, "Avg Sale Value"),
                              createVNode("div", { class: "kpi-icon kpi-icon-purple" }, [
                                createVNode(VIcon, {
                                  size: "18",
                                  icon: "mdi-chart-line-variant"
                                })
                              ])
                            ]),
                            createVNode("p", { class: "text-h4 font-weight-bold mb-1" }, toDisplayString(unref(currency)(unref(stats).avgSale)), 1),
                            createVNode("span", { class: "text-caption text-medium-emphasis" }, toDisplayString(unref(stats).totalDiscount > 0 ? "Discount: " + unref(currency)(unref(stats).totalDiscount) : "No discounts"), 1)
                          ]),
                          _: 1
                        })
                      ]),
                      _: 1
                    }),
                    createVNode(VCol, {
                      cols: "6",
                      lg: "3"
                    }, {
                      default: withCtx(() => [
                        createVNode(VCard, {
                          rounded: "xl",
                          variant: "outlined",
                          class: "kpi-card pa-5"
                        }, {
                          default: withCtx(() => [
                            createVNode("div", { class: "d-flex align-start justify-space-between mb-2" }, [
                              createVNode("span", { class: "text-caption text-medium-emphasis font-weight-medium" }, "Items Sold"),
                              createVNode("div", { class: "kpi-icon kpi-icon-orange" }, [
                                createVNode(VIcon, {
                                  size: "18",
                                  icon: "mdi-package-variant-closed"
                                })
                              ])
                            ]),
                            createVNode("p", { class: "text-h4 font-weight-bold mb-1" }, toDisplayString(unref(formatNumber)(unref(stats).totalItems)), 1),
                            createVNode("span", { class: "text-caption text-medium-emphasis" }, toDisplayString(unref(stats).uniqueProducts) + " unique products", 1)
                          ]),
                          _: 1
                        })
                      ]),
                      _: 1
                    })
                  ];
                }
              }),
              _: 1
            }, _parent2, _scopeId));
            _push2(ssrRenderComponent(VCard, {
              rounded: "t-lg",
              class: "mb-4",
              flat: "",
              border: ""
            }, {
              default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                if (_push3) {
                  _push3(ssrRenderComponent(VTabs, {
                    modelValue: unref(activeTab),
                    "onUpdate:modelValue": ($event) => isRef(activeTab) ? activeTab.value = $event : null,
                    color: "primary",
                    density: "comfortable",
                    "show-arrows": ""
                  }, {
                    default: withCtx((_3, _push4, _parent4, _scopeId3) => {
                      if (_push4) {
                        _push4(ssrRenderComponent(VTab, { value: "transactions" }, {
                          default: withCtx((_4, _push5, _parent5, _scopeId4) => {
                            if (_push5) {
                              _push5(ssrRenderComponent(VIcon, {
                                size: "16",
                                start: ""
                              }, {
                                default: withCtx((_5, _push6, _parent6, _scopeId5) => {
                                  if (_push6) {
                                    _push6(`mdi-receipt-text-outline`);
                                  } else {
                                    return [
                                      createTextVNode("mdi-receipt-text-outline")
                                    ];
                                  }
                                }),
                                _: 1
                              }, _parent5, _scopeId4));
                              _push5(` Transactions `);
                              _push5(ssrRenderComponent(VChip, {
                                size: "x-small",
                                class: "ml-2",
                                color: unref(activeTab) === "transactions" ? "primary" : "default"
                              }, {
                                default: withCtx((_5, _push6, _parent6, _scopeId5) => {
                                  if (_push6) {
                                    _push6(`${ssrInterpolate(unref(filteredSales).length)}`);
                                  } else {
                                    return [
                                      createTextVNode(toDisplayString(unref(filteredSales).length), 1)
                                    ];
                                  }
                                }),
                                _: 1
                              }, _parent5, _scopeId4));
                            } else {
                              return [
                                createVNode(VIcon, {
                                  size: "16",
                                  start: ""
                                }, {
                                  default: withCtx(() => [
                                    createTextVNode("mdi-receipt-text-outline")
                                  ]),
                                  _: 1
                                }),
                                createTextVNode(" Transactions "),
                                createVNode(VChip, {
                                  size: "x-small",
                                  class: "ml-2",
                                  color: unref(activeTab) === "transactions" ? "primary" : "default"
                                }, {
                                  default: withCtx(() => [
                                    createTextVNode(toDisplayString(unref(filteredSales).length), 1)
                                  ]),
                                  _: 1
                                }, 8, ["color"])
                              ];
                            }
                          }),
                          _: 1
                        }, _parent4, _scopeId3));
                        _push4(ssrRenderComponent(VTab, { value: "analytics" }, {
                          default: withCtx((_4, _push5, _parent5, _scopeId4) => {
                            if (_push5) {
                              _push5(ssrRenderComponent(VIcon, {
                                size: "16",
                                start: ""
                              }, {
                                default: withCtx((_5, _push6, _parent6, _scopeId5) => {
                                  if (_push6) {
                                    _push6(`mdi-chart-line-variant`);
                                  } else {
                                    return [
                                      createTextVNode("mdi-chart-line-variant")
                                    ];
                                  }
                                }),
                                _: 1
                              }, _parent5, _scopeId4));
                              _push5(` Analytics `);
                            } else {
                              return [
                                createVNode(VIcon, {
                                  size: "16",
                                  start: ""
                                }, {
                                  default: withCtx(() => [
                                    createTextVNode("mdi-chart-line-variant")
                                  ]),
                                  _: 1
                                }),
                                createTextVNode(" Analytics ")
                              ];
                            }
                          }),
                          _: 1
                        }, _parent4, _scopeId3));
                      } else {
                        return [
                          createVNode(VTab, { value: "transactions" }, {
                            default: withCtx(() => [
                              createVNode(VIcon, {
                                size: "16",
                                start: ""
                              }, {
                                default: withCtx(() => [
                                  createTextVNode("mdi-receipt-text-outline")
                                ]),
                                _: 1
                              }),
                              createTextVNode(" Transactions "),
                              createVNode(VChip, {
                                size: "x-small",
                                class: "ml-2",
                                color: unref(activeTab) === "transactions" ? "primary" : "default"
                              }, {
                                default: withCtx(() => [
                                  createTextVNode(toDisplayString(unref(filteredSales).length), 1)
                                ]),
                                _: 1
                              }, 8, ["color"])
                            ]),
                            _: 1
                          }),
                          createVNode(VTab, { value: "analytics" }, {
                            default: withCtx(() => [
                              createVNode(VIcon, {
                                size: "16",
                                start: ""
                              }, {
                                default: withCtx(() => [
                                  createTextVNode("mdi-chart-line-variant")
                                ]),
                                _: 1
                              }),
                              createTextVNode(" Analytics ")
                            ]),
                            _: 1
                          })
                        ];
                      }
                    }),
                    _: 1
                  }, _parent3, _scopeId2));
                } else {
                  return [
                    createVNode(VTabs, {
                      modelValue: unref(activeTab),
                      "onUpdate:modelValue": ($event) => isRef(activeTab) ? activeTab.value = $event : null,
                      color: "primary",
                      density: "comfortable",
                      "show-arrows": ""
                    }, {
                      default: withCtx(() => [
                        createVNode(VTab, { value: "transactions" }, {
                          default: withCtx(() => [
                            createVNode(VIcon, {
                              size: "16",
                              start: ""
                            }, {
                              default: withCtx(() => [
                                createTextVNode("mdi-receipt-text-outline")
                              ]),
                              _: 1
                            }),
                            createTextVNode(" Transactions "),
                            createVNode(VChip, {
                              size: "x-small",
                              class: "ml-2",
                              color: unref(activeTab) === "transactions" ? "primary" : "default"
                            }, {
                              default: withCtx(() => [
                                createTextVNode(toDisplayString(unref(filteredSales).length), 1)
                              ]),
                              _: 1
                            }, 8, ["color"])
                          ]),
                          _: 1
                        }),
                        createVNode(VTab, { value: "analytics" }, {
                          default: withCtx(() => [
                            createVNode(VIcon, {
                              size: "16",
                              start: ""
                            }, {
                              default: withCtx(() => [
                                createTextVNode("mdi-chart-line-variant")
                              ]),
                              _: 1
                            }),
                            createTextVNode(" Analytics ")
                          ]),
                          _: 1
                        })
                      ]),
                      _: 1
                    }, 8, ["modelValue", "onUpdate:modelValue"])
                  ];
                }
              }),
              _: 1
            }, _parent2, _scopeId));
            if (unref(activeTab) === "transactions") {
              _push2(`<!--[-->`);
              _push2(ssrRenderComponent(VCard, {
                rounded: "xl",
                class: "pa-4 mb-4",
                flat: "",
                border: ""
              }, {
                default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                  if (_push3) {
                    _push3(ssrRenderComponent(VRow, { density: "comfortable" }, {
                      default: withCtx((_3, _push4, _parent4, _scopeId3) => {
                        if (_push4) {
                          _push4(ssrRenderComponent(VCol, {
                            cols: "12",
                            lg: "6"
                          }, {
                            default: withCtx((_4, _push5, _parent5, _scopeId4) => {
                              if (_push5) {
                                _push5(ssrRenderComponent(VTextField, {
                                  modelValue: unref(searchQuery),
                                  "onUpdate:modelValue": ($event) => isRef(searchQuery) ? searchQuery.value = $event : null,
                                  placeholder: "Search by transaction #, customer, cashier...",
                                  variant: "outlined",
                                  density: "compact",
                                  "prepend-inner-icon": "mdi-magnify",
                                  "hide-details": "",
                                  clearable: ""
                                }, null, _parent5, _scopeId4));
                              } else {
                                return [
                                  createVNode(VTextField, {
                                    modelValue: unref(searchQuery),
                                    "onUpdate:modelValue": ($event) => isRef(searchQuery) ? searchQuery.value = $event : null,
                                    placeholder: "Search by transaction #, customer, cashier...",
                                    variant: "outlined",
                                    density: "compact",
                                    "prepend-inner-icon": "mdi-magnify",
                                    "hide-details": "",
                                    clearable: ""
                                  }, null, 8, ["modelValue", "onUpdate:modelValue"])
                                ];
                              }
                            }),
                            _: 1
                          }, _parent4, _scopeId3));
                          _push4(ssrRenderComponent(VCol, {
                            cols: "6",
                            lg: "3"
                          }, {
                            default: withCtx((_4, _push5, _parent5, _scopeId4) => {
                              if (_push5) {
                                _push5(ssrRenderComponent(VSelect, {
                                  modelValue: unref(filterStatus),
                                  "onUpdate:modelValue": ($event) => isRef(filterStatus) ? filterStatus.value = $event : null,
                                  items: statusFilterItems,
                                  "item-title": "title",
                                  "item-value": "value",
                                  label: "All Status",
                                  variant: "outlined",
                                  density: "compact",
                                  "hide-details": "",
                                  clearable: ""
                                }, null, _parent5, _scopeId4));
                              } else {
                                return [
                                  createVNode(VSelect, {
                                    modelValue: unref(filterStatus),
                                    "onUpdate:modelValue": ($event) => isRef(filterStatus) ? filterStatus.value = $event : null,
                                    items: statusFilterItems,
                                    "item-title": "title",
                                    "item-value": "value",
                                    label: "All Status",
                                    variant: "outlined",
                                    density: "compact",
                                    "hide-details": "",
                                    clearable: ""
                                  }, null, 8, ["modelValue", "onUpdate:modelValue"])
                                ];
                              }
                            }),
                            _: 1
                          }, _parent4, _scopeId3));
                          _push4(ssrRenderComponent(VCol, {
                            cols: "6",
                            lg: "3"
                          }, {
                            default: withCtx((_4, _push5, _parent5, _scopeId4) => {
                              if (_push5) {
                                _push5(ssrRenderComponent(VSelect, {
                                  modelValue: unref(sortBy),
                                  "onUpdate:modelValue": ($event) => isRef(sortBy) ? sortBy.value = $event : null,
                                  items: sortItems,
                                  "item-title": "title",
                                  "item-value": "value",
                                  label: "Sort",
                                  variant: "outlined",
                                  density: "compact",
                                  "hide-details": ""
                                }, null, _parent5, _scopeId4));
                              } else {
                                return [
                                  createVNode(VSelect, {
                                    modelValue: unref(sortBy),
                                    "onUpdate:modelValue": ($event) => isRef(sortBy) ? sortBy.value = $event : null,
                                    items: sortItems,
                                    "item-title": "title",
                                    "item-value": "value",
                                    label: "Sort",
                                    variant: "outlined",
                                    density: "compact",
                                    "hide-details": ""
                                  }, null, 8, ["modelValue", "onUpdate:modelValue"])
                                ];
                              }
                            }),
                            _: 1
                          }, _parent4, _scopeId3));
                        } else {
                          return [
                            createVNode(VCol, {
                              cols: "12",
                              lg: "6"
                            }, {
                              default: withCtx(() => [
                                createVNode(VTextField, {
                                  modelValue: unref(searchQuery),
                                  "onUpdate:modelValue": ($event) => isRef(searchQuery) ? searchQuery.value = $event : null,
                                  placeholder: "Search by transaction #, customer, cashier...",
                                  variant: "outlined",
                                  density: "compact",
                                  "prepend-inner-icon": "mdi-magnify",
                                  "hide-details": "",
                                  clearable: ""
                                }, null, 8, ["modelValue", "onUpdate:modelValue"])
                              ]),
                              _: 1
                            }),
                            createVNode(VCol, {
                              cols: "6",
                              lg: "3"
                            }, {
                              default: withCtx(() => [
                                createVNode(VSelect, {
                                  modelValue: unref(filterStatus),
                                  "onUpdate:modelValue": ($event) => isRef(filterStatus) ? filterStatus.value = $event : null,
                                  items: statusFilterItems,
                                  "item-title": "title",
                                  "item-value": "value",
                                  label: "All Status",
                                  variant: "outlined",
                                  density: "compact",
                                  "hide-details": "",
                                  clearable: ""
                                }, null, 8, ["modelValue", "onUpdate:modelValue"])
                              ]),
                              _: 1
                            }),
                            createVNode(VCol, {
                              cols: "6",
                              lg: "3"
                            }, {
                              default: withCtx(() => [
                                createVNode(VSelect, {
                                  modelValue: unref(sortBy),
                                  "onUpdate:modelValue": ($event) => isRef(sortBy) ? sortBy.value = $event : null,
                                  items: sortItems,
                                  "item-title": "title",
                                  "item-value": "value",
                                  label: "Sort",
                                  variant: "outlined",
                                  density: "compact",
                                  "hide-details": ""
                                }, null, 8, ["modelValue", "onUpdate:modelValue"])
                              ]),
                              _: 1
                            })
                          ];
                        }
                      }),
                      _: 1
                    }, _parent3, _scopeId2));
                  } else {
                    return [
                      createVNode(VRow, { density: "comfortable" }, {
                        default: withCtx(() => [
                          createVNode(VCol, {
                            cols: "12",
                            lg: "6"
                          }, {
                            default: withCtx(() => [
                              createVNode(VTextField, {
                                modelValue: unref(searchQuery),
                                "onUpdate:modelValue": ($event) => isRef(searchQuery) ? searchQuery.value = $event : null,
                                placeholder: "Search by transaction #, customer, cashier...",
                                variant: "outlined",
                                density: "compact",
                                "prepend-inner-icon": "mdi-magnify",
                                "hide-details": "",
                                clearable: ""
                              }, null, 8, ["modelValue", "onUpdate:modelValue"])
                            ]),
                            _: 1
                          }),
                          createVNode(VCol, {
                            cols: "6",
                            lg: "3"
                          }, {
                            default: withCtx(() => [
                              createVNode(VSelect, {
                                modelValue: unref(filterStatus),
                                "onUpdate:modelValue": ($event) => isRef(filterStatus) ? filterStatus.value = $event : null,
                                items: statusFilterItems,
                                "item-title": "title",
                                "item-value": "value",
                                label: "All Status",
                                variant: "outlined",
                                density: "compact",
                                "hide-details": "",
                                clearable: ""
                              }, null, 8, ["modelValue", "onUpdate:modelValue"])
                            ]),
                            _: 1
                          }),
                          createVNode(VCol, {
                            cols: "6",
                            lg: "3"
                          }, {
                            default: withCtx(() => [
                              createVNode(VSelect, {
                                modelValue: unref(sortBy),
                                "onUpdate:modelValue": ($event) => isRef(sortBy) ? sortBy.value = $event : null,
                                items: sortItems,
                                "item-title": "title",
                                "item-value": "value",
                                label: "Sort",
                                variant: "outlined",
                                density: "compact",
                                "hide-details": ""
                              }, null, 8, ["modelValue", "onUpdate:modelValue"])
                            ]),
                            _: 1
                          })
                        ]),
                        _: 1
                      })
                    ];
                  }
                }),
                _: 1
              }, _parent2, _scopeId));
              if (unref(hasActiveFilters)) {
                _push2(`<div class="d-flex align-center flex-wrap ga-2 mb-4" data-v-b687d18f${_scopeId}><span class="text-body-2 text-medium-emphasis" data-v-b687d18f${_scopeId}>Filters:</span>`);
                if (unref(searchQuery)) {
                  _push2(ssrRenderComponent(VChip, {
                    size: "small",
                    color: "primary",
                    closable: "",
                    "onClick:close": ($event) => searchQuery.value = ""
                  }, {
                    default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                      if (_push3) {
                        _push3(` Search: &quot;${ssrInterpolate(unref(searchQuery))}&quot; `);
                      } else {
                        return [
                          createTextVNode(' Search: "' + toDisplayString(unref(searchQuery)) + '" ', 1)
                        ];
                      }
                    }),
                    _: 1
                  }, _parent2, _scopeId));
                } else {
                  _push2(`<!---->`);
                }
                if (unref(filterStatus)) {
                  _push2(ssrRenderComponent(VChip, {
                    size: "small",
                    color: "indigo",
                    closable: "",
                    "onClick:close": ($event) => filterStatus.value = ""
                  }, {
                    default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                      if (_push3) {
                        _push3(` Status: ${ssrInterpolate(unref(filterStatus))}`);
                      } else {
                        return [
                          createTextVNode(" Status: " + toDisplayString(unref(filterStatus)), 1)
                        ];
                      }
                    }),
                    _: 1
                  }, _parent2, _scopeId));
                } else {
                  _push2(`<!---->`);
                }
                _push2(ssrRenderComponent(VBtn, {
                  variant: "text",
                  size: "small",
                  color: "error",
                  onClick: clearAllFilters
                }, {
                  default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                    if (_push3) {
                      _push3(`Clear all`);
                    } else {
                      return [
                        createTextVNode("Clear all")
                      ];
                    }
                  }),
                  _: 1
                }, _parent2, _scopeId));
                _push2(`</div>`);
              } else {
                _push2(`<!---->`);
              }
              if (unref(loading)) {
                _push2(ssrRenderComponent(VCard, {
                  flat: "",
                  border: "",
                  rounded: "xl",
                  class: "py-16 d-flex flex-column align-center justify-center ga-4"
                }, {
                  default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                    if (_push3) {
                      _push3(ssrRenderComponent(VProgressCircular, {
                        indeterminate: "",
                        color: "primary",
                        size: "48",
                        width: "4"
                      }, null, _parent3, _scopeId2));
                      _push3(`<div class="text-body-2 text-medium-emphasis" data-v-b687d18f${_scopeId2}>Loading sales...</div>`);
                    } else {
                      return [
                        createVNode(VProgressCircular, {
                          indeterminate: "",
                          color: "primary",
                          size: "48",
                          width: "4"
                        }),
                        createVNode("div", { class: "text-body-2 text-medium-emphasis" }, "Loading sales...")
                      ];
                    }
                  }),
                  _: 1
                }, _parent2, _scopeId));
              } else if (unref(filteredSales).length === 0) {
                _push2(ssrRenderComponent(VCard, {
                  flat: "",
                  border: "",
                  rounded: "xl",
                  class: "py-16 text-center"
                }, {
                  default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                    if (_push3) {
                      _push3(ssrRenderComponent(VAvatar, {
                        color: "blue-lighten-5",
                        size: "80",
                        class: "mb-4"
                      }, {
                        default: withCtx((_3, _push4, _parent4, _scopeId3) => {
                          if (_push4) {
                            _push4(ssrRenderComponent(VIcon, {
                              color: "blue",
                              size: "40"
                            }, {
                              default: withCtx((_4, _push5, _parent5, _scopeId4) => {
                                if (_push5) {
                                  _push5(`mdi-receipt-text-outline`);
                                } else {
                                  return [
                                    createTextVNode("mdi-receipt-text-outline")
                                  ];
                                }
                              }),
                              _: 1
                            }, _parent4, _scopeId3));
                          } else {
                            return [
                              createVNode(VIcon, {
                                color: "blue",
                                size: "40"
                              }, {
                                default: withCtx(() => [
                                  createTextVNode("mdi-receipt-text-outline")
                                ]),
                                _: 1
                              })
                            ];
                          }
                        }),
                        _: 1
                      }, _parent3, _scopeId2));
                      _push3(`<div class="text-h6 font-weight-bold mb-1" data-v-b687d18f${_scopeId2}>No sales found</div><div class="text-body-2 text-medium-emphasis" data-v-b687d18f${_scopeId2}>${ssrInterpolate(unref(hasActiveFilters) ? "Try adjusting your filters." : "Sales will appear here once transactions are processed.")}</div>`);
                    } else {
                      return [
                        createVNode(VAvatar, {
                          color: "blue-lighten-5",
                          size: "80",
                          class: "mb-4"
                        }, {
                          default: withCtx(() => [
                            createVNode(VIcon, {
                              color: "blue",
                              size: "40"
                            }, {
                              default: withCtx(() => [
                                createTextVNode("mdi-receipt-text-outline")
                              ]),
                              _: 1
                            })
                          ]),
                          _: 1
                        }),
                        createVNode("div", { class: "text-h6 font-weight-bold mb-1" }, "No sales found"),
                        createVNode("div", { class: "text-body-2 text-medium-emphasis" }, toDisplayString(unref(hasActiveFilters) ? "Try adjusting your filters." : "Sales will appear here once transactions are processed."), 1)
                      ];
                    }
                  }),
                  _: 1
                }, _parent2, _scopeId));
              } else {
                _push2(ssrRenderComponent(VCard, {
                  flat: "",
                  border: "",
                  rounded: "xl",
                  class: "overflow-hidden"
                }, {
                  default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                    if (_push3) {
                      _push3(ssrRenderComponent(VTable, {
                        density: "compact",
                        hover: ""
                      }, {
                        default: withCtx((_3, _push4, _parent4, _scopeId3) => {
                          if (_push4) {
                            _push4(`<thead class="bg-grey-lighten-4" data-v-b687d18f${_scopeId3}><tr data-v-b687d18f${_scopeId3}><th class="text-center" style="${ssrRenderStyle({ "width": "52px" })}" data-v-b687d18f${_scopeId3}>#</th><th class="text-left" style="${ssrRenderStyle({ "min-width": "160px" })}" data-v-b687d18f${_scopeId3}>Transaction #</th><th class="text-left" data-v-b687d18f${_scopeId3}>Customer</th><th class="text-left" data-v-b687d18f${_scopeId3}>Cashier</th><th class="text-left" data-v-b687d18f${_scopeId3}>Payment</th><th class="text-right" data-v-b687d18f${_scopeId3}>Items</th><th class="text-right" data-v-b687d18f${_scopeId3}>Subtotal</th><th class="text-right" data-v-b687d18f${_scopeId3}>Discount</th><th class="text-right" data-v-b687d18f${_scopeId3}>Tax</th><th class="text-right" data-v-b687d18f${_scopeId3}>Total</th><th class="text-left" data-v-b687d18f${_scopeId3}>Status</th><th class="text-left" data-v-b687d18f${_scopeId3}>Date</th></tr></thead><tbody data-v-b687d18f${_scopeId3}><!--[-->`);
                            ssrRenderList(unref(pagedSales), (sale, idx) => {
                              _push4(`<tr style="${ssrRenderStyle({ "cursor": "pointer" })}" data-v-b687d18f${_scopeId3}><td class="text-center text-caption text-disabled font-weight-bold" data-v-b687d18f${_scopeId3}>${ssrInterpolate(rowNumber(idx))}</td><td data-v-b687d18f${_scopeId3}><div class="d-flex align-center ga-2" data-v-b687d18f${_scopeId3}>`);
                              _push4(ssrRenderComponent(VAvatar, {
                                size: "32",
                                rounded: "lg",
                                color: statusColor(sale.status),
                                variant: "tonal"
                              }, {
                                default: withCtx((_4, _push5, _parent5, _scopeId4) => {
                                  if (_push5) {
                                    _push5(ssrRenderComponent(VIcon, {
                                      size: "18",
                                      icon: statusIcon(sale.status)
                                    }, null, _parent5, _scopeId4));
                                  } else {
                                    return [
                                      createVNode(VIcon, {
                                        size: "18",
                                        icon: statusIcon(sale.status)
                                      }, null, 8, ["icon"])
                                    ];
                                  }
                                }),
                                _: 2
                              }, _parent4, _scopeId3));
                              _push4(`<span class="text-body-2 font-weight-bold font-mono" data-v-b687d18f${_scopeId3}>${ssrInterpolate(sale.transaction_number)}</span></div></td><td data-v-b687d18f${_scopeId3}>`);
                              if (sale.customer_name && sale.customer_name !== "Walk-in") {
                                _push4(`<span class="text-body-2" data-v-b687d18f${_scopeId3}>${ssrInterpolate(sale.customer_name)}</span>`);
                              } else {
                                _push4(`<span class="text-disabled" data-v-b687d18f${_scopeId3}>Walk-in</span>`);
                              }
                              _push4(`</td><td class="text-body-2 text-medium-emphasis" data-v-b687d18f${_scopeId3}>${ssrInterpolate(sale.cashier_name || "—")}</td><td data-v-b687d18f${_scopeId3}>`);
                              if (sale.payment_method) {
                                _push4(ssrRenderComponent(VChip, {
                                  size: "small",
                                  variant: "tonal",
                                  color: paymentColor(sale.payment_method)
                                }, {
                                  default: withCtx((_4, _push5, _parent5, _scopeId4) => {
                                    if (_push5) {
                                      _push5(`${ssrInterpolate(sale.payment_method_display || sale.payment_method)}`);
                                    } else {
                                      return [
                                        createTextVNode(toDisplayString(sale.payment_method_display || sale.payment_method), 1)
                                      ];
                                    }
                                  }),
                                  _: 2
                                }, _parent4, _scopeId3));
                              } else {
                                _push4(`<span class="text-disabled" data-v-b687d18f${_scopeId3}>—</span>`);
                              }
                              _push4(`</td><td class="text-right text-body-2" data-v-b687d18f${_scopeId3}>${ssrInterpolate(sale.lines_count)}</td><td class="text-right text-body-2" data-v-b687d18f${_scopeId3}>${ssrInterpolate(unref(currency)(sale.subtotal))}</td><td class="text-right text-body-2 text-error" data-v-b687d18f${_scopeId3}>-${ssrInterpolate(unref(currency)(sale.discount))}</td><td class="text-right text-body-2 text-medium-emphasis" data-v-b687d18f${_scopeId3}>${ssrInterpolate(unref(currency)(sale.tax))}</td><td class="text-right" data-v-b687d18f${_scopeId3}><span class="font-weight-bold" data-v-b687d18f${_scopeId3}>${ssrInterpolate(unref(currency)(sale.total))}</span></td><td data-v-b687d18f${_scopeId3}>`);
                              _push4(ssrRenderComponent(VChip, {
                                size: "small",
                                color: statusColor(sale.status),
                                variant: "tonal",
                                label: "",
                                class: "text-capitalize"
                              }, {
                                default: withCtx((_4, _push5, _parent5, _scopeId4) => {
                                  if (_push5) {
                                    _push5(`${ssrInterpolate(formatStatus(sale.status))}`);
                                  } else {
                                    return [
                                      createTextVNode(toDisplayString(formatStatus(sale.status)), 1)
                                    ];
                                  }
                                }),
                                _: 2
                              }, _parent4, _scopeId3));
                              _push4(`</td><td class="text-body-2 text-medium-emphasis" data-v-b687d18f${_scopeId3}>${ssrInterpolate(unref(datetime)(sale.created_at))}</td></tr>`);
                            });
                            _push4(`<!--]--></tbody>`);
                          } else {
                            return [
                              createVNode("thead", { class: "bg-grey-lighten-4" }, [
                                createVNode("tr", null, [
                                  createVNode("th", {
                                    class: "text-center",
                                    style: { "width": "52px" }
                                  }, "#"),
                                  createVNode("th", {
                                    class: "text-left",
                                    style: { "min-width": "160px" }
                                  }, "Transaction #"),
                                  createVNode("th", { class: "text-left" }, "Customer"),
                                  createVNode("th", { class: "text-left" }, "Cashier"),
                                  createVNode("th", { class: "text-left" }, "Payment"),
                                  createVNode("th", { class: "text-right" }, "Items"),
                                  createVNode("th", { class: "text-right" }, "Subtotal"),
                                  createVNode("th", { class: "text-right" }, "Discount"),
                                  createVNode("th", { class: "text-right" }, "Tax"),
                                  createVNode("th", { class: "text-right" }, "Total"),
                                  createVNode("th", { class: "text-left" }, "Status"),
                                  createVNode("th", { class: "text-left" }, "Date")
                                ])
                              ]),
                              createVNode("tbody", null, [
                                (openBlock(true), createBlock(Fragment, null, renderList(unref(pagedSales), (sale, idx) => {
                                  return openBlock(), createBlock("tr", {
                                    key: sale.id,
                                    style: { "cursor": "pointer" },
                                    onClick: ($event) => openSaleDetails(sale)
                                  }, [
                                    createVNode("td", { class: "text-center text-caption text-disabled font-weight-bold" }, toDisplayString(rowNumber(idx)), 1),
                                    createVNode("td", null, [
                                      createVNode("div", { class: "d-flex align-center ga-2" }, [
                                        createVNode(VAvatar, {
                                          size: "32",
                                          rounded: "lg",
                                          color: statusColor(sale.status),
                                          variant: "tonal"
                                        }, {
                                          default: withCtx(() => [
                                            createVNode(VIcon, {
                                              size: "18",
                                              icon: statusIcon(sale.status)
                                            }, null, 8, ["icon"])
                                          ]),
                                          _: 2
                                        }, 1032, ["color"]),
                                        createVNode("span", { class: "text-body-2 font-weight-bold font-mono" }, toDisplayString(sale.transaction_number), 1)
                                      ])
                                    ]),
                                    createVNode("td", null, [
                                      sale.customer_name && sale.customer_name !== "Walk-in" ? (openBlock(), createBlock("span", {
                                        key: 0,
                                        class: "text-body-2"
                                      }, toDisplayString(sale.customer_name), 1)) : (openBlock(), createBlock("span", {
                                        key: 1,
                                        class: "text-disabled"
                                      }, "Walk-in"))
                                    ]),
                                    createVNode("td", { class: "text-body-2 text-medium-emphasis" }, toDisplayString(sale.cashier_name || "—"), 1),
                                    createVNode("td", null, [
                                      sale.payment_method ? (openBlock(), createBlock(VChip, {
                                        key: 0,
                                        size: "small",
                                        variant: "tonal",
                                        color: paymentColor(sale.payment_method)
                                      }, {
                                        default: withCtx(() => [
                                          createTextVNode(toDisplayString(sale.payment_method_display || sale.payment_method), 1)
                                        ]),
                                        _: 2
                                      }, 1032, ["color"])) : (openBlock(), createBlock("span", {
                                        key: 1,
                                        class: "text-disabled"
                                      }, "—"))
                                    ]),
                                    createVNode("td", { class: "text-right text-body-2" }, toDisplayString(sale.lines_count), 1),
                                    createVNode("td", { class: "text-right text-body-2" }, toDisplayString(unref(currency)(sale.subtotal)), 1),
                                    createVNode("td", { class: "text-right text-body-2 text-error" }, "-" + toDisplayString(unref(currency)(sale.discount)), 1),
                                    createVNode("td", { class: "text-right text-body-2 text-medium-emphasis" }, toDisplayString(unref(currency)(sale.tax)), 1),
                                    createVNode("td", { class: "text-right" }, [
                                      createVNode("span", { class: "font-weight-bold" }, toDisplayString(unref(currency)(sale.total)), 1)
                                    ]),
                                    createVNode("td", null, [
                                      createVNode(VChip, {
                                        size: "small",
                                        color: statusColor(sale.status),
                                        variant: "tonal",
                                        label: "",
                                        class: "text-capitalize"
                                      }, {
                                        default: withCtx(() => [
                                          createTextVNode(toDisplayString(formatStatus(sale.status)), 1)
                                        ]),
                                        _: 2
                                      }, 1032, ["color"])
                                    ]),
                                    createVNode("td", { class: "text-body-2 text-medium-emphasis" }, toDisplayString(unref(datetime)(sale.created_at)), 1)
                                  ], 8, ["onClick"]);
                                }), 128))
                              ])
                            ];
                          }
                        }),
                        _: 1
                      }, _parent3, _scopeId2));
                      _push3(ssrRenderComponent(_component_PaginationBar, {
                        count: unref(filteredSales).length,
                        next: unref(currentPage) < unref(totalPages) ? "yes" : null,
                        previous: unref(currentPage) > 1 ? "yes" : null,
                        page: unref(currentPage),
                        pageSize,
                        totalPages: unref(totalPages),
                        onPageChange: ($event) => currentPage.value = $event
                      }, null, _parent3, _scopeId2));
                    } else {
                      return [
                        createVNode(VTable, {
                          density: "compact",
                          hover: ""
                        }, {
                          default: withCtx(() => [
                            createVNode("thead", { class: "bg-grey-lighten-4" }, [
                              createVNode("tr", null, [
                                createVNode("th", {
                                  class: "text-center",
                                  style: { "width": "52px" }
                                }, "#"),
                                createVNode("th", {
                                  class: "text-left",
                                  style: { "min-width": "160px" }
                                }, "Transaction #"),
                                createVNode("th", { class: "text-left" }, "Customer"),
                                createVNode("th", { class: "text-left" }, "Cashier"),
                                createVNode("th", { class: "text-left" }, "Payment"),
                                createVNode("th", { class: "text-right" }, "Items"),
                                createVNode("th", { class: "text-right" }, "Subtotal"),
                                createVNode("th", { class: "text-right" }, "Discount"),
                                createVNode("th", { class: "text-right" }, "Tax"),
                                createVNode("th", { class: "text-right" }, "Total"),
                                createVNode("th", { class: "text-left" }, "Status"),
                                createVNode("th", { class: "text-left" }, "Date")
                              ])
                            ]),
                            createVNode("tbody", null, [
                              (openBlock(true), createBlock(Fragment, null, renderList(unref(pagedSales), (sale, idx) => {
                                return openBlock(), createBlock("tr", {
                                  key: sale.id,
                                  style: { "cursor": "pointer" },
                                  onClick: ($event) => openSaleDetails(sale)
                                }, [
                                  createVNode("td", { class: "text-center text-caption text-disabled font-weight-bold" }, toDisplayString(rowNumber(idx)), 1),
                                  createVNode("td", null, [
                                    createVNode("div", { class: "d-flex align-center ga-2" }, [
                                      createVNode(VAvatar, {
                                        size: "32",
                                        rounded: "lg",
                                        color: statusColor(sale.status),
                                        variant: "tonal"
                                      }, {
                                        default: withCtx(() => [
                                          createVNode(VIcon, {
                                            size: "18",
                                            icon: statusIcon(sale.status)
                                          }, null, 8, ["icon"])
                                        ]),
                                        _: 2
                                      }, 1032, ["color"]),
                                      createVNode("span", { class: "text-body-2 font-weight-bold font-mono" }, toDisplayString(sale.transaction_number), 1)
                                    ])
                                  ]),
                                  createVNode("td", null, [
                                    sale.customer_name && sale.customer_name !== "Walk-in" ? (openBlock(), createBlock("span", {
                                      key: 0,
                                      class: "text-body-2"
                                    }, toDisplayString(sale.customer_name), 1)) : (openBlock(), createBlock("span", {
                                      key: 1,
                                      class: "text-disabled"
                                    }, "Walk-in"))
                                  ]),
                                  createVNode("td", { class: "text-body-2 text-medium-emphasis" }, toDisplayString(sale.cashier_name || "—"), 1),
                                  createVNode("td", null, [
                                    sale.payment_method ? (openBlock(), createBlock(VChip, {
                                      key: 0,
                                      size: "small",
                                      variant: "tonal",
                                      color: paymentColor(sale.payment_method)
                                    }, {
                                      default: withCtx(() => [
                                        createTextVNode(toDisplayString(sale.payment_method_display || sale.payment_method), 1)
                                      ]),
                                      _: 2
                                    }, 1032, ["color"])) : (openBlock(), createBlock("span", {
                                      key: 1,
                                      class: "text-disabled"
                                    }, "—"))
                                  ]),
                                  createVNode("td", { class: "text-right text-body-2" }, toDisplayString(sale.lines_count), 1),
                                  createVNode("td", { class: "text-right text-body-2" }, toDisplayString(unref(currency)(sale.subtotal)), 1),
                                  createVNode("td", { class: "text-right text-body-2 text-error" }, "-" + toDisplayString(unref(currency)(sale.discount)), 1),
                                  createVNode("td", { class: "text-right text-body-2 text-medium-emphasis" }, toDisplayString(unref(currency)(sale.tax)), 1),
                                  createVNode("td", { class: "text-right" }, [
                                    createVNode("span", { class: "font-weight-bold" }, toDisplayString(unref(currency)(sale.total)), 1)
                                  ]),
                                  createVNode("td", null, [
                                    createVNode(VChip, {
                                      size: "small",
                                      color: statusColor(sale.status),
                                      variant: "tonal",
                                      label: "",
                                      class: "text-capitalize"
                                    }, {
                                      default: withCtx(() => [
                                        createTextVNode(toDisplayString(formatStatus(sale.status)), 1)
                                      ]),
                                      _: 2
                                    }, 1032, ["color"])
                                  ]),
                                  createVNode("td", { class: "text-body-2 text-medium-emphasis" }, toDisplayString(unref(datetime)(sale.created_at)), 1)
                                ], 8, ["onClick"]);
                              }), 128))
                            ])
                          ]),
                          _: 1
                        }),
                        createVNode(_component_PaginationBar, {
                          count: unref(filteredSales).length,
                          next: unref(currentPage) < unref(totalPages) ? "yes" : null,
                          previous: unref(currentPage) > 1 ? "yes" : null,
                          page: unref(currentPage),
                          pageSize,
                          totalPages: unref(totalPages),
                          onPageChange: ($event) => currentPage.value = $event
                        }, null, 8, ["count", "next", "previous", "page", "totalPages", "onPageChange"])
                      ];
                    }
                  }),
                  _: 1
                }, _parent2, _scopeId));
              }
              _push2(`<!--]-->`);
            } else {
              _push2(`<!---->`);
            }
            if (unref(activeTab) === "analytics") {
              _push2(`<!--[-->`);
              _push2(ssrRenderComponent(VRow, { class: "mb-4" }, {
                default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                  if (_push3) {
                    _push3(ssrRenderComponent(VCol, {
                      cols: "6",
                      lg: "3"
                    }, {
                      default: withCtx((_3, _push4, _parent4, _scopeId3) => {
                        if (_push4) {
                          _push4(ssrRenderComponent(VCard, {
                            class: "pa-5 bg-surface",
                            flat: "",
                            border: "",
                            style: { "border-top": "4px solid rgb(var(--v-theme-green)) !important", "border-radius": "10px !important" }
                          }, {
                            default: withCtx((_4, _push5, _parent5, _scopeId4) => {
                              if (_push5) {
                                _push5(`<div class="d-flex align-start justify-space-between" data-v-b687d18f${_scopeId4}><div data-v-b687d18f${_scopeId4}><div class="text-caption text-medium-emphasis text-uppercase" data-v-b687d18f${_scopeId4}>Gross Revenue</div><div class="text-h5 font-weight-bold text-success mt-2" data-v-b687d18f${_scopeId4}>${ssrInterpolate(unref(currency)(unref(analytics).totalRevenue))}</div></div>`);
                                _push5(ssrRenderComponent(VAvatar, {
                                  color: "green-lighten-5",
                                  rounded: "lg",
                                  size: "40"
                                }, {
                                  default: withCtx((_5, _push6, _parent6, _scopeId5) => {
                                    if (_push6) {
                                      _push6(ssrRenderComponent(VIcon, { color: "green" }, {
                                        default: withCtx((_6, _push7, _parent7, _scopeId6) => {
                                          if (_push7) {
                                            _push7(`mdi-cash`);
                                          } else {
                                            return [
                                              createTextVNode("mdi-cash")
                                            ];
                                          }
                                        }),
                                        _: 1
                                      }, _parent6, _scopeId5));
                                    } else {
                                      return [
                                        createVNode(VIcon, { color: "green" }, {
                                          default: withCtx(() => [
                                            createTextVNode("mdi-cash")
                                          ]),
                                          _: 1
                                        })
                                      ];
                                    }
                                  }),
                                  _: 1
                                }, _parent5, _scopeId4));
                                _push5(`</div>`);
                              } else {
                                return [
                                  createVNode("div", { class: "d-flex align-start justify-space-between" }, [
                                    createVNode("div", null, [
                                      createVNode("div", { class: "text-caption text-medium-emphasis text-uppercase" }, "Gross Revenue"),
                                      createVNode("div", { class: "text-h5 font-weight-bold text-success mt-2" }, toDisplayString(unref(currency)(unref(analytics).totalRevenue)), 1)
                                    ]),
                                    createVNode(VAvatar, {
                                      color: "green-lighten-5",
                                      rounded: "lg",
                                      size: "40"
                                    }, {
                                      default: withCtx(() => [
                                        createVNode(VIcon, { color: "green" }, {
                                          default: withCtx(() => [
                                            createTextVNode("mdi-cash")
                                          ]),
                                          _: 1
                                        })
                                      ]),
                                      _: 1
                                    })
                                  ])
                                ];
                              }
                            }),
                            _: 1
                          }, _parent4, _scopeId3));
                        } else {
                          return [
                            createVNode(VCard, {
                              class: "pa-5 bg-surface",
                              flat: "",
                              border: "",
                              style: { "border-top": "4px solid rgb(var(--v-theme-green)) !important", "border-radius": "10px !important" }
                            }, {
                              default: withCtx(() => [
                                createVNode("div", { class: "d-flex align-start justify-space-between" }, [
                                  createVNode("div", null, [
                                    createVNode("div", { class: "text-caption text-medium-emphasis text-uppercase" }, "Gross Revenue"),
                                    createVNode("div", { class: "text-h5 font-weight-bold text-success mt-2" }, toDisplayString(unref(currency)(unref(analytics).totalRevenue)), 1)
                                  ]),
                                  createVNode(VAvatar, {
                                    color: "green-lighten-5",
                                    rounded: "lg",
                                    size: "40"
                                  }, {
                                    default: withCtx(() => [
                                      createVNode(VIcon, { color: "green" }, {
                                        default: withCtx(() => [
                                          createTextVNode("mdi-cash")
                                        ]),
                                        _: 1
                                      })
                                    ]),
                                    _: 1
                                  })
                                ])
                              ]),
                              _: 1
                            })
                          ];
                        }
                      }),
                      _: 1
                    }, _parent3, _scopeId2));
                    _push3(ssrRenderComponent(VCol, {
                      cols: "6",
                      lg: "3"
                    }, {
                      default: withCtx((_3, _push4, _parent4, _scopeId3) => {
                        if (_push4) {
                          _push4(ssrRenderComponent(VCard, {
                            class: "pa-5 bg-surface",
                            flat: "",
                            border: "",
                            style: { "border-top": "4px solid rgb(var(--v-theme-blue)) !important", "border-radius": "10px !important" }
                          }, {
                            default: withCtx((_4, _push5, _parent5, _scopeId4) => {
                              if (_push5) {
                                _push5(`<div class="d-flex align-start justify-space-between" data-v-b687d18f${_scopeId4}><div data-v-b687d18f${_scopeId4}><div class="text-caption text-medium-emphasis text-uppercase" data-v-b687d18f${_scopeId4}>Avg Items / Sale</div><div class="text-h5 font-weight-bold mt-2" data-v-b687d18f${_scopeId4}>${ssrInterpolate(unref(analytics).avgItemsPerSale.toFixed(1))}</div></div>`);
                                _push5(ssrRenderComponent(VAvatar, {
                                  color: "blue-lighten-5",
                                  rounded: "lg",
                                  size: "40"
                                }, {
                                  default: withCtx((_5, _push6, _parent6, _scopeId5) => {
                                    if (_push6) {
                                      _push6(ssrRenderComponent(VIcon, { color: "blue" }, {
                                        default: withCtx((_6, _push7, _parent7, _scopeId6) => {
                                          if (_push7) {
                                            _push7(`mdi-package-variant-multiple`);
                                          } else {
                                            return [
                                              createTextVNode("mdi-package-variant-multiple")
                                            ];
                                          }
                                        }),
                                        _: 1
                                      }, _parent6, _scopeId5));
                                    } else {
                                      return [
                                        createVNode(VIcon, { color: "blue" }, {
                                          default: withCtx(() => [
                                            createTextVNode("mdi-package-variant-multiple")
                                          ]),
                                          _: 1
                                        })
                                      ];
                                    }
                                  }),
                                  _: 1
                                }, _parent5, _scopeId4));
                                _push5(`</div>`);
                              } else {
                                return [
                                  createVNode("div", { class: "d-flex align-start justify-space-between" }, [
                                    createVNode("div", null, [
                                      createVNode("div", { class: "text-caption text-medium-emphasis text-uppercase" }, "Avg Items / Sale"),
                                      createVNode("div", { class: "text-h5 font-weight-bold mt-2" }, toDisplayString(unref(analytics).avgItemsPerSale.toFixed(1)), 1)
                                    ]),
                                    createVNode(VAvatar, {
                                      color: "blue-lighten-5",
                                      rounded: "lg",
                                      size: "40"
                                    }, {
                                      default: withCtx(() => [
                                        createVNode(VIcon, { color: "blue" }, {
                                          default: withCtx(() => [
                                            createTextVNode("mdi-package-variant-multiple")
                                          ]),
                                          _: 1
                                        })
                                      ]),
                                      _: 1
                                    })
                                  ])
                                ];
                              }
                            }),
                            _: 1
                          }, _parent4, _scopeId3));
                        } else {
                          return [
                            createVNode(VCard, {
                              class: "pa-5 bg-surface",
                              flat: "",
                              border: "",
                              style: { "border-top": "4px solid rgb(var(--v-theme-blue)) !important", "border-radius": "10px !important" }
                            }, {
                              default: withCtx(() => [
                                createVNode("div", { class: "d-flex align-start justify-space-between" }, [
                                  createVNode("div", null, [
                                    createVNode("div", { class: "text-caption text-medium-emphasis text-uppercase" }, "Avg Items / Sale"),
                                    createVNode("div", { class: "text-h5 font-weight-bold mt-2" }, toDisplayString(unref(analytics).avgItemsPerSale.toFixed(1)), 1)
                                  ]),
                                  createVNode(VAvatar, {
                                    color: "blue-lighten-5",
                                    rounded: "lg",
                                    size: "40"
                                  }, {
                                    default: withCtx(() => [
                                      createVNode(VIcon, { color: "blue" }, {
                                        default: withCtx(() => [
                                          createTextVNode("mdi-package-variant-multiple")
                                        ]),
                                        _: 1
                                      })
                                    ]),
                                    _: 1
                                  })
                                ])
                              ]),
                              _: 1
                            })
                          ];
                        }
                      }),
                      _: 1
                    }, _parent3, _scopeId2));
                    _push3(ssrRenderComponent(VCol, {
                      cols: "6",
                      lg: "3"
                    }, {
                      default: withCtx((_3, _push4, _parent4, _scopeId3) => {
                        if (_push4) {
                          _push4(ssrRenderComponent(VCard, {
                            class: "pa-5 bg-surface",
                            flat: "",
                            border: "",
                            style: { "border-top": "4px solid rgb(var(--v-theme-orange)) !important", "border-radius": "10px !important" }
                          }, {
                            default: withCtx((_4, _push5, _parent5, _scopeId4) => {
                              if (_push5) {
                                _push5(`<div class="d-flex align-start justify-space-between" data-v-b687d18f${_scopeId4}><div data-v-b687d18f${_scopeId4}><div class="text-caption text-medium-emphasis text-uppercase" data-v-b687d18f${_scopeId4}>Total Discount</div><div class="text-h5 font-weight-bold text-error mt-2" data-v-b687d18f${_scopeId4}>${ssrInterpolate(unref(currency)(unref(analytics).totalDiscount))}</div></div>`);
                                _push5(ssrRenderComponent(VAvatar, {
                                  color: "orange-lighten-5",
                                  rounded: "lg",
                                  size: "40"
                                }, {
                                  default: withCtx((_5, _push6, _parent6, _scopeId5) => {
                                    if (_push6) {
                                      _push6(ssrRenderComponent(VIcon, { color: "orange" }, {
                                        default: withCtx((_6, _push7, _parent7, _scopeId6) => {
                                          if (_push7) {
                                            _push7(`mdi-tag-minus`);
                                          } else {
                                            return [
                                              createTextVNode("mdi-tag-minus")
                                            ];
                                          }
                                        }),
                                        _: 1
                                      }, _parent6, _scopeId5));
                                    } else {
                                      return [
                                        createVNode(VIcon, { color: "orange" }, {
                                          default: withCtx(() => [
                                            createTextVNode("mdi-tag-minus")
                                          ]),
                                          _: 1
                                        })
                                      ];
                                    }
                                  }),
                                  _: 1
                                }, _parent5, _scopeId4));
                                _push5(`</div>`);
                              } else {
                                return [
                                  createVNode("div", { class: "d-flex align-start justify-space-between" }, [
                                    createVNode("div", null, [
                                      createVNode("div", { class: "text-caption text-medium-emphasis text-uppercase" }, "Total Discount"),
                                      createVNode("div", { class: "text-h5 font-weight-bold text-error mt-2" }, toDisplayString(unref(currency)(unref(analytics).totalDiscount)), 1)
                                    ]),
                                    createVNode(VAvatar, {
                                      color: "orange-lighten-5",
                                      rounded: "lg",
                                      size: "40"
                                    }, {
                                      default: withCtx(() => [
                                        createVNode(VIcon, { color: "orange" }, {
                                          default: withCtx(() => [
                                            createTextVNode("mdi-tag-minus")
                                          ]),
                                          _: 1
                                        })
                                      ]),
                                      _: 1
                                    })
                                  ])
                                ];
                              }
                            }),
                            _: 1
                          }, _parent4, _scopeId3));
                        } else {
                          return [
                            createVNode(VCard, {
                              class: "pa-5 bg-surface",
                              flat: "",
                              border: "",
                              style: { "border-top": "4px solid rgb(var(--v-theme-orange)) !important", "border-radius": "10px !important" }
                            }, {
                              default: withCtx(() => [
                                createVNode("div", { class: "d-flex align-start justify-space-between" }, [
                                  createVNode("div", null, [
                                    createVNode("div", { class: "text-caption text-medium-emphasis text-uppercase" }, "Total Discount"),
                                    createVNode("div", { class: "text-h5 font-weight-bold text-error mt-2" }, toDisplayString(unref(currency)(unref(analytics).totalDiscount)), 1)
                                  ]),
                                  createVNode(VAvatar, {
                                    color: "orange-lighten-5",
                                    rounded: "lg",
                                    size: "40"
                                  }, {
                                    default: withCtx(() => [
                                      createVNode(VIcon, { color: "orange" }, {
                                        default: withCtx(() => [
                                          createTextVNode("mdi-tag-minus")
                                        ]),
                                        _: 1
                                      })
                                    ]),
                                    _: 1
                                  })
                                ])
                              ]),
                              _: 1
                            })
                          ];
                        }
                      }),
                      _: 1
                    }, _parent3, _scopeId2));
                    _push3(ssrRenderComponent(VCol, {
                      cols: "6",
                      lg: "3"
                    }, {
                      default: withCtx((_3, _push4, _parent4, _scopeId3) => {
                        if (_push4) {
                          _push4(ssrRenderComponent(VCard, {
                            class: "pa-5 bg-surface",
                            flat: "",
                            border: "",
                            style: { "border-top": "4px solid rgb(var(--v-theme-teal)) !important", "border-radius": "10px !important" }
                          }, {
                            default: withCtx((_4, _push5, _parent5, _scopeId4) => {
                              if (_push5) {
                                _push5(`<div class="d-flex align-start justify-space-between" data-v-b687d18f${_scopeId4}><div data-v-b687d18f${_scopeId4}><div class="text-caption text-medium-emphasis text-uppercase" data-v-b687d18f${_scopeId4}>Conversion Rate</div><div class="text-h5 font-weight-bold mt-2" data-v-b687d18f${_scopeId4}>${ssrInterpolate(unref(analytics).completionRate.toFixed(1))}%</div></div>`);
                                _push5(ssrRenderComponent(VAvatar, {
                                  color: "teal-lighten-5",
                                  rounded: "lg",
                                  size: "40"
                                }, {
                                  default: withCtx((_5, _push6, _parent6, _scopeId5) => {
                                    if (_push6) {
                                      _push6(ssrRenderComponent(VIcon, { color: "teal" }, {
                                        default: withCtx((_6, _push7, _parent7, _scopeId6) => {
                                          if (_push7) {
                                            _push7(`mdi-check-decagram`);
                                          } else {
                                            return [
                                              createTextVNode("mdi-check-decagram")
                                            ];
                                          }
                                        }),
                                        _: 1
                                      }, _parent6, _scopeId5));
                                    } else {
                                      return [
                                        createVNode(VIcon, { color: "teal" }, {
                                          default: withCtx(() => [
                                            createTextVNode("mdi-check-decagram")
                                          ]),
                                          _: 1
                                        })
                                      ];
                                    }
                                  }),
                                  _: 1
                                }, _parent5, _scopeId4));
                                _push5(`</div>`);
                              } else {
                                return [
                                  createVNode("div", { class: "d-flex align-start justify-space-between" }, [
                                    createVNode("div", null, [
                                      createVNode("div", { class: "text-caption text-medium-emphasis text-uppercase" }, "Conversion Rate"),
                                      createVNode("div", { class: "text-h5 font-weight-bold mt-2" }, toDisplayString(unref(analytics).completionRate.toFixed(1)) + "%", 1)
                                    ]),
                                    createVNode(VAvatar, {
                                      color: "teal-lighten-5",
                                      rounded: "lg",
                                      size: "40"
                                    }, {
                                      default: withCtx(() => [
                                        createVNode(VIcon, { color: "teal" }, {
                                          default: withCtx(() => [
                                            createTextVNode("mdi-check-decagram")
                                          ]),
                                          _: 1
                                        })
                                      ]),
                                      _: 1
                                    })
                                  ])
                                ];
                              }
                            }),
                            _: 1
                          }, _parent4, _scopeId3));
                        } else {
                          return [
                            createVNode(VCard, {
                              class: "pa-5 bg-surface",
                              flat: "",
                              border: "",
                              style: { "border-top": "4px solid rgb(var(--v-theme-teal)) !important", "border-radius": "10px !important" }
                            }, {
                              default: withCtx(() => [
                                createVNode("div", { class: "d-flex align-start justify-space-between" }, [
                                  createVNode("div", null, [
                                    createVNode("div", { class: "text-caption text-medium-emphasis text-uppercase" }, "Conversion Rate"),
                                    createVNode("div", { class: "text-h5 font-weight-bold mt-2" }, toDisplayString(unref(analytics).completionRate.toFixed(1)) + "%", 1)
                                  ]),
                                  createVNode(VAvatar, {
                                    color: "teal-lighten-5",
                                    rounded: "lg",
                                    size: "40"
                                  }, {
                                    default: withCtx(() => [
                                      createVNode(VIcon, { color: "teal" }, {
                                        default: withCtx(() => [
                                          createTextVNode("mdi-check-decagram")
                                        ]),
                                        _: 1
                                      })
                                    ]),
                                    _: 1
                                  })
                                ])
                              ]),
                              _: 1
                            })
                          ];
                        }
                      }),
                      _: 1
                    }, _parent3, _scopeId2));
                  } else {
                    return [
                      createVNode(VCol, {
                        cols: "6",
                        lg: "3"
                      }, {
                        default: withCtx(() => [
                          createVNode(VCard, {
                            class: "pa-5 bg-surface",
                            flat: "",
                            border: "",
                            style: { "border-top": "4px solid rgb(var(--v-theme-green)) !important", "border-radius": "10px !important" }
                          }, {
                            default: withCtx(() => [
                              createVNode("div", { class: "d-flex align-start justify-space-between" }, [
                                createVNode("div", null, [
                                  createVNode("div", { class: "text-caption text-medium-emphasis text-uppercase" }, "Gross Revenue"),
                                  createVNode("div", { class: "text-h5 font-weight-bold text-success mt-2" }, toDisplayString(unref(currency)(unref(analytics).totalRevenue)), 1)
                                ]),
                                createVNode(VAvatar, {
                                  color: "green-lighten-5",
                                  rounded: "lg",
                                  size: "40"
                                }, {
                                  default: withCtx(() => [
                                    createVNode(VIcon, { color: "green" }, {
                                      default: withCtx(() => [
                                        createTextVNode("mdi-cash")
                                      ]),
                                      _: 1
                                    })
                                  ]),
                                  _: 1
                                })
                              ])
                            ]),
                            _: 1
                          })
                        ]),
                        _: 1
                      }),
                      createVNode(VCol, {
                        cols: "6",
                        lg: "3"
                      }, {
                        default: withCtx(() => [
                          createVNode(VCard, {
                            class: "pa-5 bg-surface",
                            flat: "",
                            border: "",
                            style: { "border-top": "4px solid rgb(var(--v-theme-blue)) !important", "border-radius": "10px !important" }
                          }, {
                            default: withCtx(() => [
                              createVNode("div", { class: "d-flex align-start justify-space-between" }, [
                                createVNode("div", null, [
                                  createVNode("div", { class: "text-caption text-medium-emphasis text-uppercase" }, "Avg Items / Sale"),
                                  createVNode("div", { class: "text-h5 font-weight-bold mt-2" }, toDisplayString(unref(analytics).avgItemsPerSale.toFixed(1)), 1)
                                ]),
                                createVNode(VAvatar, {
                                  color: "blue-lighten-5",
                                  rounded: "lg",
                                  size: "40"
                                }, {
                                  default: withCtx(() => [
                                    createVNode(VIcon, { color: "blue" }, {
                                      default: withCtx(() => [
                                        createTextVNode("mdi-package-variant-multiple")
                                      ]),
                                      _: 1
                                    })
                                  ]),
                                  _: 1
                                })
                              ])
                            ]),
                            _: 1
                          })
                        ]),
                        _: 1
                      }),
                      createVNode(VCol, {
                        cols: "6",
                        lg: "3"
                      }, {
                        default: withCtx(() => [
                          createVNode(VCard, {
                            class: "pa-5 bg-surface",
                            flat: "",
                            border: "",
                            style: { "border-top": "4px solid rgb(var(--v-theme-orange)) !important", "border-radius": "10px !important" }
                          }, {
                            default: withCtx(() => [
                              createVNode("div", { class: "d-flex align-start justify-space-between" }, [
                                createVNode("div", null, [
                                  createVNode("div", { class: "text-caption text-medium-emphasis text-uppercase" }, "Total Discount"),
                                  createVNode("div", { class: "text-h5 font-weight-bold text-error mt-2" }, toDisplayString(unref(currency)(unref(analytics).totalDiscount)), 1)
                                ]),
                                createVNode(VAvatar, {
                                  color: "orange-lighten-5",
                                  rounded: "lg",
                                  size: "40"
                                }, {
                                  default: withCtx(() => [
                                    createVNode(VIcon, { color: "orange" }, {
                                      default: withCtx(() => [
                                        createTextVNode("mdi-tag-minus")
                                      ]),
                                      _: 1
                                    })
                                  ]),
                                  _: 1
                                })
                              ])
                            ]),
                            _: 1
                          })
                        ]),
                        _: 1
                      }),
                      createVNode(VCol, {
                        cols: "6",
                        lg: "3"
                      }, {
                        default: withCtx(() => [
                          createVNode(VCard, {
                            class: "pa-5 bg-surface",
                            flat: "",
                            border: "",
                            style: { "border-top": "4px solid rgb(var(--v-theme-teal)) !important", "border-radius": "10px !important" }
                          }, {
                            default: withCtx(() => [
                              createVNode("div", { class: "d-flex align-start justify-space-between" }, [
                                createVNode("div", null, [
                                  createVNode("div", { class: "text-caption text-medium-emphasis text-uppercase" }, "Conversion Rate"),
                                  createVNode("div", { class: "text-h5 font-weight-bold mt-2" }, toDisplayString(unref(analytics).completionRate.toFixed(1)) + "%", 1)
                                ]),
                                createVNode(VAvatar, {
                                  color: "teal-lighten-5",
                                  rounded: "lg",
                                  size: "40"
                                }, {
                                  default: withCtx(() => [
                                    createVNode(VIcon, { color: "teal" }, {
                                      default: withCtx(() => [
                                        createTextVNode("mdi-check-decagram")
                                      ]),
                                      _: 1
                                    })
                                  ]),
                                  _: 1
                                })
                              ])
                            ]),
                            _: 1
                          })
                        ]),
                        _: 1
                      })
                    ];
                  }
                }),
                _: 1
              }, _parent2, _scopeId));
              _push2(ssrRenderComponent(VRow, { class: "mb-4" }, {
                default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                  if (_push3) {
                    _push3(ssrRenderComponent(VCol, {
                      cols: "12",
                      lg: "8"
                    }, {
                      default: withCtx((_3, _push4, _parent4, _scopeId3) => {
                        if (_push4) {
                          _push4(ssrRenderComponent(VCard, {
                            flat: "",
                            border: "",
                            rounded: "xl",
                            class: "pa-4"
                          }, {
                            default: withCtx((_4, _push5, _parent5, _scopeId4) => {
                              if (_push5) {
                                _push5(`<div class="d-flex align-center ga-2 mb-3" data-v-b687d18f${_scopeId4}>`);
                                _push5(ssrRenderComponent(VAvatar, {
                                  color: "blue-lighten-5",
                                  rounded: "lg",
                                  size: "36"
                                }, {
                                  default: withCtx((_5, _push6, _parent6, _scopeId5) => {
                                    if (_push6) {
                                      _push6(ssrRenderComponent(VIcon, {
                                        color: "blue",
                                        size: "20"
                                      }, {
                                        default: withCtx((_6, _push7, _parent7, _scopeId6) => {
                                          if (_push7) {
                                            _push7(`mdi-chart-areaspline`);
                                          } else {
                                            return [
                                              createTextVNode("mdi-chart-areaspline")
                                            ];
                                          }
                                        }),
                                        _: 1
                                      }, _parent6, _scopeId5));
                                    } else {
                                      return [
                                        createVNode(VIcon, {
                                          color: "blue",
                                          size: "20"
                                        }, {
                                          default: withCtx(() => [
                                            createTextVNode("mdi-chart-areaspline")
                                          ]),
                                          _: 1
                                        })
                                      ];
                                    }
                                  }),
                                  _: 1
                                }, _parent5, _scopeId4));
                                _push5(`<div data-v-b687d18f${_scopeId4}><div class="text-subtitle-1 font-weight-bold" data-v-b687d18f${_scopeId4}>Revenue Trend</div><div class="text-caption text-medium-emphasis" data-v-b687d18f${_scopeId4}>Daily revenue over selected period</div></div></div>`);
                                _push5(ssrRenderComponent(_component_apexchart, {
                                  type: "area",
                                  height: "300",
                                  options: unref(revenueChartOptions),
                                  series: unref(revenueChartSeries)
                                }, null, _parent5, _scopeId4));
                              } else {
                                return [
                                  createVNode("div", { class: "d-flex align-center ga-2 mb-3" }, [
                                    createVNode(VAvatar, {
                                      color: "blue-lighten-5",
                                      rounded: "lg",
                                      size: "36"
                                    }, {
                                      default: withCtx(() => [
                                        createVNode(VIcon, {
                                          color: "blue",
                                          size: "20"
                                        }, {
                                          default: withCtx(() => [
                                            createTextVNode("mdi-chart-areaspline")
                                          ]),
                                          _: 1
                                        })
                                      ]),
                                      _: 1
                                    }),
                                    createVNode("div", null, [
                                      createVNode("div", { class: "text-subtitle-1 font-weight-bold" }, "Revenue Trend"),
                                      createVNode("div", { class: "text-caption text-medium-emphasis" }, "Daily revenue over selected period")
                                    ])
                                  ]),
                                  createVNode(_component_apexchart, {
                                    type: "area",
                                    height: "300",
                                    options: unref(revenueChartOptions),
                                    series: unref(revenueChartSeries)
                                  }, null, 8, ["options", "series"])
                                ];
                              }
                            }),
                            _: 1
                          }, _parent4, _scopeId3));
                        } else {
                          return [
                            createVNode(VCard, {
                              flat: "",
                              border: "",
                              rounded: "xl",
                              class: "pa-4"
                            }, {
                              default: withCtx(() => [
                                createVNode("div", { class: "d-flex align-center ga-2 mb-3" }, [
                                  createVNode(VAvatar, {
                                    color: "blue-lighten-5",
                                    rounded: "lg",
                                    size: "36"
                                  }, {
                                    default: withCtx(() => [
                                      createVNode(VIcon, {
                                        color: "blue",
                                        size: "20"
                                      }, {
                                        default: withCtx(() => [
                                          createTextVNode("mdi-chart-areaspline")
                                        ]),
                                        _: 1
                                      })
                                    ]),
                                    _: 1
                                  }),
                                  createVNode("div", null, [
                                    createVNode("div", { class: "text-subtitle-1 font-weight-bold" }, "Revenue Trend"),
                                    createVNode("div", { class: "text-caption text-medium-emphasis" }, "Daily revenue over selected period")
                                  ])
                                ]),
                                createVNode(_component_apexchart, {
                                  type: "area",
                                  height: "300",
                                  options: unref(revenueChartOptions),
                                  series: unref(revenueChartSeries)
                                }, null, 8, ["options", "series"])
                              ]),
                              _: 1
                            })
                          ];
                        }
                      }),
                      _: 1
                    }, _parent3, _scopeId2));
                    _push3(ssrRenderComponent(VCol, {
                      cols: "12",
                      lg: "4"
                    }, {
                      default: withCtx((_3, _push4, _parent4, _scopeId3) => {
                        if (_push4) {
                          _push4(ssrRenderComponent(VCard, {
                            flat: "",
                            border: "",
                            rounded: "xl",
                            class: "pa-4"
                          }, {
                            default: withCtx((_4, _push5, _parent5, _scopeId4) => {
                              if (_push5) {
                                _push5(`<div class="d-flex align-center ga-2 mb-3" data-v-b687d18f${_scopeId4}>`);
                                _push5(ssrRenderComponent(VAvatar, {
                                  color: "green-lighten-5",
                                  rounded: "lg",
                                  size: "36"
                                }, {
                                  default: withCtx((_5, _push6, _parent6, _scopeId5) => {
                                    if (_push6) {
                                      _push6(ssrRenderComponent(VIcon, {
                                        color: "green",
                                        size: "20"
                                      }, {
                                        default: withCtx((_6, _push7, _parent7, _scopeId6) => {
                                          if (_push7) {
                                            _push7(`mdi-chart-donut`);
                                          } else {
                                            return [
                                              createTextVNode("mdi-chart-donut")
                                            ];
                                          }
                                        }),
                                        _: 1
                                      }, _parent6, _scopeId5));
                                    } else {
                                      return [
                                        createVNode(VIcon, {
                                          color: "green",
                                          size: "20"
                                        }, {
                                          default: withCtx(() => [
                                            createTextVNode("mdi-chart-donut")
                                          ]),
                                          _: 1
                                        })
                                      ];
                                    }
                                  }),
                                  _: 1
                                }, _parent5, _scopeId4));
                                _push5(`<div data-v-b687d18f${_scopeId4}><div class="text-subtitle-1 font-weight-bold" data-v-b687d18f${_scopeId4}>Payment Methods</div><div class="text-caption text-medium-emphasis" data-v-b687d18f${_scopeId4}>Revenue by payment type</div></div></div>`);
                                _push5(ssrRenderComponent(_component_apexchart, {
                                  type: "donut",
                                  height: "300",
                                  options: unref(paymentChartOptions),
                                  series: unref(paymentChartSeries)
                                }, null, _parent5, _scopeId4));
                              } else {
                                return [
                                  createVNode("div", { class: "d-flex align-center ga-2 mb-3" }, [
                                    createVNode(VAvatar, {
                                      color: "green-lighten-5",
                                      rounded: "lg",
                                      size: "36"
                                    }, {
                                      default: withCtx(() => [
                                        createVNode(VIcon, {
                                          color: "green",
                                          size: "20"
                                        }, {
                                          default: withCtx(() => [
                                            createTextVNode("mdi-chart-donut")
                                          ]),
                                          _: 1
                                        })
                                      ]),
                                      _: 1
                                    }),
                                    createVNode("div", null, [
                                      createVNode("div", { class: "text-subtitle-1 font-weight-bold" }, "Payment Methods"),
                                      createVNode("div", { class: "text-caption text-medium-emphasis" }, "Revenue by payment type")
                                    ])
                                  ]),
                                  createVNode(_component_apexchart, {
                                    type: "donut",
                                    height: "300",
                                    options: unref(paymentChartOptions),
                                    series: unref(paymentChartSeries)
                                  }, null, 8, ["options", "series"])
                                ];
                              }
                            }),
                            _: 1
                          }, _parent4, _scopeId3));
                        } else {
                          return [
                            createVNode(VCard, {
                              flat: "",
                              border: "",
                              rounded: "xl",
                              class: "pa-4"
                            }, {
                              default: withCtx(() => [
                                createVNode("div", { class: "d-flex align-center ga-2 mb-3" }, [
                                  createVNode(VAvatar, {
                                    color: "green-lighten-5",
                                    rounded: "lg",
                                    size: "36"
                                  }, {
                                    default: withCtx(() => [
                                      createVNode(VIcon, {
                                        color: "green",
                                        size: "20"
                                      }, {
                                        default: withCtx(() => [
                                          createTextVNode("mdi-chart-donut")
                                        ]),
                                        _: 1
                                      })
                                    ]),
                                    _: 1
                                  }),
                                  createVNode("div", null, [
                                    createVNode("div", { class: "text-subtitle-1 font-weight-bold" }, "Payment Methods"),
                                    createVNode("div", { class: "text-caption text-medium-emphasis" }, "Revenue by payment type")
                                  ])
                                ]),
                                createVNode(_component_apexchart, {
                                  type: "donut",
                                  height: "300",
                                  options: unref(paymentChartOptions),
                                  series: unref(paymentChartSeries)
                                }, null, 8, ["options", "series"])
                              ]),
                              _: 1
                            })
                          ];
                        }
                      }),
                      _: 1
                    }, _parent3, _scopeId2));
                  } else {
                    return [
                      createVNode(VCol, {
                        cols: "12",
                        lg: "8"
                      }, {
                        default: withCtx(() => [
                          createVNode(VCard, {
                            flat: "",
                            border: "",
                            rounded: "xl",
                            class: "pa-4"
                          }, {
                            default: withCtx(() => [
                              createVNode("div", { class: "d-flex align-center ga-2 mb-3" }, [
                                createVNode(VAvatar, {
                                  color: "blue-lighten-5",
                                  rounded: "lg",
                                  size: "36"
                                }, {
                                  default: withCtx(() => [
                                    createVNode(VIcon, {
                                      color: "blue",
                                      size: "20"
                                    }, {
                                      default: withCtx(() => [
                                        createTextVNode("mdi-chart-areaspline")
                                      ]),
                                      _: 1
                                    })
                                  ]),
                                  _: 1
                                }),
                                createVNode("div", null, [
                                  createVNode("div", { class: "text-subtitle-1 font-weight-bold" }, "Revenue Trend"),
                                  createVNode("div", { class: "text-caption text-medium-emphasis" }, "Daily revenue over selected period")
                                ])
                              ]),
                              createVNode(_component_apexchart, {
                                type: "area",
                                height: "300",
                                options: unref(revenueChartOptions),
                                series: unref(revenueChartSeries)
                              }, null, 8, ["options", "series"])
                            ]),
                            _: 1
                          })
                        ]),
                        _: 1
                      }),
                      createVNode(VCol, {
                        cols: "12",
                        lg: "4"
                      }, {
                        default: withCtx(() => [
                          createVNode(VCard, {
                            flat: "",
                            border: "",
                            rounded: "xl",
                            class: "pa-4"
                          }, {
                            default: withCtx(() => [
                              createVNode("div", { class: "d-flex align-center ga-2 mb-3" }, [
                                createVNode(VAvatar, {
                                  color: "green-lighten-5",
                                  rounded: "lg",
                                  size: "36"
                                }, {
                                  default: withCtx(() => [
                                    createVNode(VIcon, {
                                      color: "green",
                                      size: "20"
                                    }, {
                                      default: withCtx(() => [
                                        createTextVNode("mdi-chart-donut")
                                      ]),
                                      _: 1
                                    })
                                  ]),
                                  _: 1
                                }),
                                createVNode("div", null, [
                                  createVNode("div", { class: "text-subtitle-1 font-weight-bold" }, "Payment Methods"),
                                  createVNode("div", { class: "text-caption text-medium-emphasis" }, "Revenue by payment type")
                                ])
                              ]),
                              createVNode(_component_apexchart, {
                                type: "donut",
                                height: "300",
                                options: unref(paymentChartOptions),
                                series: unref(paymentChartSeries)
                              }, null, 8, ["options", "series"])
                            ]),
                            _: 1
                          })
                        ]),
                        _: 1
                      })
                    ];
                  }
                }),
                _: 1
              }, _parent2, _scopeId));
              _push2(ssrRenderComponent(VRow, { class: "mb-4" }, {
                default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                  if (_push3) {
                    _push3(ssrRenderComponent(VCol, {
                      cols: "12",
                      lg: "8"
                    }, {
                      default: withCtx((_3, _push4, _parent4, _scopeId3) => {
                        if (_push4) {
                          _push4(ssrRenderComponent(VCard, {
                            flat: "",
                            border: "",
                            rounded: "xl",
                            class: "pa-4"
                          }, {
                            default: withCtx((_4, _push5, _parent5, _scopeId4) => {
                              if (_push5) {
                                _push5(`<div class="d-flex align-center ga-2 mb-3" data-v-b687d18f${_scopeId4}>`);
                                _push5(ssrRenderComponent(VAvatar, {
                                  color: "indigo-lighten-5",
                                  rounded: "lg",
                                  size: "36"
                                }, {
                                  default: withCtx((_5, _push6, _parent6, _scopeId5) => {
                                    if (_push6) {
                                      _push6(ssrRenderComponent(VIcon, {
                                        color: "indigo",
                                        size: "20"
                                      }, {
                                        default: withCtx((_6, _push7, _parent7, _scopeId6) => {
                                          if (_push7) {
                                            _push7(`mdi-trophy-award`);
                                          } else {
                                            return [
                                              createTextVNode("mdi-trophy-award")
                                            ];
                                          }
                                        }),
                                        _: 1
                                      }, _parent6, _scopeId5));
                                    } else {
                                      return [
                                        createVNode(VIcon, {
                                          color: "indigo",
                                          size: "20"
                                        }, {
                                          default: withCtx(() => [
                                            createTextVNode("mdi-trophy-award")
                                          ]),
                                          _: 1
                                        })
                                      ];
                                    }
                                  }),
                                  _: 1
                                }, _parent5, _scopeId4));
                                _push5(`<div data-v-b687d18f${_scopeId4}><div class="text-subtitle-1 font-weight-bold" data-v-b687d18f${_scopeId4}>Top 10 Products by Revenue</div><div class="text-caption text-medium-emphasis" data-v-b687d18f${_scopeId4}>Best-selling products this period</div></div></div>`);
                                _push5(ssrRenderComponent(_component_apexchart, {
                                  type: "bar",
                                  height: "320",
                                  options: unref(topProductsChartOptions),
                                  series: unref(topProductsChartSeries)
                                }, null, _parent5, _scopeId4));
                              } else {
                                return [
                                  createVNode("div", { class: "d-flex align-center ga-2 mb-3" }, [
                                    createVNode(VAvatar, {
                                      color: "indigo-lighten-5",
                                      rounded: "lg",
                                      size: "36"
                                    }, {
                                      default: withCtx(() => [
                                        createVNode(VIcon, {
                                          color: "indigo",
                                          size: "20"
                                        }, {
                                          default: withCtx(() => [
                                            createTextVNode("mdi-trophy-award")
                                          ]),
                                          _: 1
                                        })
                                      ]),
                                      _: 1
                                    }),
                                    createVNode("div", null, [
                                      createVNode("div", { class: "text-subtitle-1 font-weight-bold" }, "Top 10 Products by Revenue"),
                                      createVNode("div", { class: "text-caption text-medium-emphasis" }, "Best-selling products this period")
                                    ])
                                  ]),
                                  createVNode(_component_apexchart, {
                                    type: "bar",
                                    height: "320",
                                    options: unref(topProductsChartOptions),
                                    series: unref(topProductsChartSeries)
                                  }, null, 8, ["options", "series"])
                                ];
                              }
                            }),
                            _: 1
                          }, _parent4, _scopeId3));
                        } else {
                          return [
                            createVNode(VCard, {
                              flat: "",
                              border: "",
                              rounded: "xl",
                              class: "pa-4"
                            }, {
                              default: withCtx(() => [
                                createVNode("div", { class: "d-flex align-center ga-2 mb-3" }, [
                                  createVNode(VAvatar, {
                                    color: "indigo-lighten-5",
                                    rounded: "lg",
                                    size: "36"
                                  }, {
                                    default: withCtx(() => [
                                      createVNode(VIcon, {
                                        color: "indigo",
                                        size: "20"
                                      }, {
                                        default: withCtx(() => [
                                          createTextVNode("mdi-trophy-award")
                                        ]),
                                        _: 1
                                      })
                                    ]),
                                    _: 1
                                  }),
                                  createVNode("div", null, [
                                    createVNode("div", { class: "text-subtitle-1 font-weight-bold" }, "Top 10 Products by Revenue"),
                                    createVNode("div", { class: "text-caption text-medium-emphasis" }, "Best-selling products this period")
                                  ])
                                ]),
                                createVNode(_component_apexchart, {
                                  type: "bar",
                                  height: "320",
                                  options: unref(topProductsChartOptions),
                                  series: unref(topProductsChartSeries)
                                }, null, 8, ["options", "series"])
                              ]),
                              _: 1
                            })
                          ];
                        }
                      }),
                      _: 1
                    }, _parent3, _scopeId2));
                    _push3(ssrRenderComponent(VCol, {
                      cols: "12",
                      lg: "4"
                    }, {
                      default: withCtx((_3, _push4, _parent4, _scopeId3) => {
                        if (_push4) {
                          _push4(ssrRenderComponent(VCard, {
                            flat: "",
                            border: "",
                            rounded: "xl",
                            class: "pa-4"
                          }, {
                            default: withCtx((_4, _push5, _parent5, _scopeId4) => {
                              if (_push5) {
                                _push5(`<div class="d-flex align-center ga-2 mb-3" data-v-b687d18f${_scopeId4}>`);
                                _push5(ssrRenderComponent(VAvatar, {
                                  color: "amber-lighten-5",
                                  rounded: "lg",
                                  size: "36"
                                }, {
                                  default: withCtx((_5, _push6, _parent6, _scopeId5) => {
                                    if (_push6) {
                                      _push6(ssrRenderComponent(VIcon, {
                                        color: "amber",
                                        size: "20"
                                      }, {
                                        default: withCtx((_6, _push7, _parent7, _scopeId6) => {
                                          if (_push7) {
                                            _push7(`mdi-chart-pie`);
                                          } else {
                                            return [
                                              createTextVNode("mdi-chart-pie")
                                            ];
                                          }
                                        }),
                                        _: 1
                                      }, _parent6, _scopeId5));
                                    } else {
                                      return [
                                        createVNode(VIcon, {
                                          color: "amber",
                                          size: "20"
                                        }, {
                                          default: withCtx(() => [
                                            createTextVNode("mdi-chart-pie")
                                          ]),
                                          _: 1
                                        })
                                      ];
                                    }
                                  }),
                                  _: 1
                                }, _parent5, _scopeId4));
                                _push5(`<div data-v-b687d18f${_scopeId4}><div class="text-subtitle-1 font-weight-bold" data-v-b687d18f${_scopeId4}>Sales by Status</div><div class="text-caption text-medium-emphasis" data-v-b687d18f${_scopeId4}>Transaction status distribution</div></div></div>`);
                                _push5(ssrRenderComponent(_component_apexchart, {
                                  type: "donut",
                                  height: "300",
                                  options: unref(statusChartOptions),
                                  series: unref(statusChartSeries)
                                }, null, _parent5, _scopeId4));
                              } else {
                                return [
                                  createVNode("div", { class: "d-flex align-center ga-2 mb-3" }, [
                                    createVNode(VAvatar, {
                                      color: "amber-lighten-5",
                                      rounded: "lg",
                                      size: "36"
                                    }, {
                                      default: withCtx(() => [
                                        createVNode(VIcon, {
                                          color: "amber",
                                          size: "20"
                                        }, {
                                          default: withCtx(() => [
                                            createTextVNode("mdi-chart-pie")
                                          ]),
                                          _: 1
                                        })
                                      ]),
                                      _: 1
                                    }),
                                    createVNode("div", null, [
                                      createVNode("div", { class: "text-subtitle-1 font-weight-bold" }, "Sales by Status"),
                                      createVNode("div", { class: "text-caption text-medium-emphasis" }, "Transaction status distribution")
                                    ])
                                  ]),
                                  createVNode(_component_apexchart, {
                                    type: "donut",
                                    height: "300",
                                    options: unref(statusChartOptions),
                                    series: unref(statusChartSeries)
                                  }, null, 8, ["options", "series"])
                                ];
                              }
                            }),
                            _: 1
                          }, _parent4, _scopeId3));
                        } else {
                          return [
                            createVNode(VCard, {
                              flat: "",
                              border: "",
                              rounded: "xl",
                              class: "pa-4"
                            }, {
                              default: withCtx(() => [
                                createVNode("div", { class: "d-flex align-center ga-2 mb-3" }, [
                                  createVNode(VAvatar, {
                                    color: "amber-lighten-5",
                                    rounded: "lg",
                                    size: "36"
                                  }, {
                                    default: withCtx(() => [
                                      createVNode(VIcon, {
                                        color: "amber",
                                        size: "20"
                                      }, {
                                        default: withCtx(() => [
                                          createTextVNode("mdi-chart-pie")
                                        ]),
                                        _: 1
                                      })
                                    ]),
                                    _: 1
                                  }),
                                  createVNode("div", null, [
                                    createVNode("div", { class: "text-subtitle-1 font-weight-bold" }, "Sales by Status"),
                                    createVNode("div", { class: "text-caption text-medium-emphasis" }, "Transaction status distribution")
                                  ])
                                ]),
                                createVNode(_component_apexchart, {
                                  type: "donut",
                                  height: "300",
                                  options: unref(statusChartOptions),
                                  series: unref(statusChartSeries)
                                }, null, 8, ["options", "series"])
                              ]),
                              _: 1
                            })
                          ];
                        }
                      }),
                      _: 1
                    }, _parent3, _scopeId2));
                  } else {
                    return [
                      createVNode(VCol, {
                        cols: "12",
                        lg: "8"
                      }, {
                        default: withCtx(() => [
                          createVNode(VCard, {
                            flat: "",
                            border: "",
                            rounded: "xl",
                            class: "pa-4"
                          }, {
                            default: withCtx(() => [
                              createVNode("div", { class: "d-flex align-center ga-2 mb-3" }, [
                                createVNode(VAvatar, {
                                  color: "indigo-lighten-5",
                                  rounded: "lg",
                                  size: "36"
                                }, {
                                  default: withCtx(() => [
                                    createVNode(VIcon, {
                                      color: "indigo",
                                      size: "20"
                                    }, {
                                      default: withCtx(() => [
                                        createTextVNode("mdi-trophy-award")
                                      ]),
                                      _: 1
                                    })
                                  ]),
                                  _: 1
                                }),
                                createVNode("div", null, [
                                  createVNode("div", { class: "text-subtitle-1 font-weight-bold" }, "Top 10 Products by Revenue"),
                                  createVNode("div", { class: "text-caption text-medium-emphasis" }, "Best-selling products this period")
                                ])
                              ]),
                              createVNode(_component_apexchart, {
                                type: "bar",
                                height: "320",
                                options: unref(topProductsChartOptions),
                                series: unref(topProductsChartSeries)
                              }, null, 8, ["options", "series"])
                            ]),
                            _: 1
                          })
                        ]),
                        _: 1
                      }),
                      createVNode(VCol, {
                        cols: "12",
                        lg: "4"
                      }, {
                        default: withCtx(() => [
                          createVNode(VCard, {
                            flat: "",
                            border: "",
                            rounded: "xl",
                            class: "pa-4"
                          }, {
                            default: withCtx(() => [
                              createVNode("div", { class: "d-flex align-center ga-2 mb-3" }, [
                                createVNode(VAvatar, {
                                  color: "amber-lighten-5",
                                  rounded: "lg",
                                  size: "36"
                                }, {
                                  default: withCtx(() => [
                                    createVNode(VIcon, {
                                      color: "amber",
                                      size: "20"
                                    }, {
                                      default: withCtx(() => [
                                        createTextVNode("mdi-chart-pie")
                                      ]),
                                      _: 1
                                    })
                                  ]),
                                  _: 1
                                }),
                                createVNode("div", null, [
                                  createVNode("div", { class: "text-subtitle-1 font-weight-bold" }, "Sales by Status"),
                                  createVNode("div", { class: "text-caption text-medium-emphasis" }, "Transaction status distribution")
                                ])
                              ]),
                              createVNode(_component_apexchart, {
                                type: "donut",
                                height: "300",
                                options: unref(statusChartOptions),
                                series: unref(statusChartSeries)
                              }, null, 8, ["options", "series"])
                            ]),
                            _: 1
                          })
                        ]),
                        _: 1
                      })
                    ];
                  }
                }),
                _: 1
              }, _parent2, _scopeId));
              _push2(ssrRenderComponent(VRow, { class: "mb-4" }, {
                default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                  if (_push3) {
                    _push3(ssrRenderComponent(VCol, {
                      cols: "12",
                      md: "6"
                    }, {
                      default: withCtx((_3, _push4, _parent4, _scopeId3) => {
                        if (_push4) {
                          _push4(ssrRenderComponent(VCard, {
                            flat: "",
                            border: "",
                            rounded: "xl",
                            class: "fill-height pa-4"
                          }, {
                            default: withCtx((_4, _push5, _parent5, _scopeId4) => {
                              if (_push5) {
                                _push5(`<div class="d-flex align-center ga-2 mb-3" data-v-b687d18f${_scopeId4}>`);
                                _push5(ssrRenderComponent(VAvatar, {
                                  color: "indigo-lighten-5",
                                  rounded: "lg",
                                  size: "36"
                                }, {
                                  default: withCtx((_5, _push6, _parent6, _scopeId5) => {
                                    if (_push6) {
                                      _push6(ssrRenderComponent(VIcon, {
                                        color: "indigo",
                                        size: "20"
                                      }, {
                                        default: withCtx((_6, _push7, _parent7, _scopeId6) => {
                                          if (_push7) {
                                            _push7(`mdi-calendar-week`);
                                          } else {
                                            return [
                                              createTextVNode("mdi-calendar-week")
                                            ];
                                          }
                                        }),
                                        _: 1
                                      }, _parent6, _scopeId5));
                                    } else {
                                      return [
                                        createVNode(VIcon, {
                                          color: "indigo",
                                          size: "20"
                                        }, {
                                          default: withCtx(() => [
                                            createTextVNode("mdi-calendar-week")
                                          ]),
                                          _: 1
                                        })
                                      ];
                                    }
                                  }),
                                  _: 1
                                }, _parent5, _scopeId4));
                                _push5(`<div data-v-b687d18f${_scopeId4}><div class="text-subtitle-1 font-weight-bold" data-v-b687d18f${_scopeId4}>Sales by Day of Week</div><div class="text-caption text-medium-emphasis" data-v-b687d18f${_scopeId4}>Revenue distribution across weekdays</div></div></div>`);
                                _push5(ssrRenderComponent(_component_apexchart, {
                                  type: "bar",
                                  height: "280",
                                  options: unref(dowChartOptions),
                                  series: unref(dowChartSeries)
                                }, null, _parent5, _scopeId4));
                              } else {
                                return [
                                  createVNode("div", { class: "d-flex align-center ga-2 mb-3" }, [
                                    createVNode(VAvatar, {
                                      color: "indigo-lighten-5",
                                      rounded: "lg",
                                      size: "36"
                                    }, {
                                      default: withCtx(() => [
                                        createVNode(VIcon, {
                                          color: "indigo",
                                          size: "20"
                                        }, {
                                          default: withCtx(() => [
                                            createTextVNode("mdi-calendar-week")
                                          ]),
                                          _: 1
                                        })
                                      ]),
                                      _: 1
                                    }),
                                    createVNode("div", null, [
                                      createVNode("div", { class: "text-subtitle-1 font-weight-bold" }, "Sales by Day of Week"),
                                      createVNode("div", { class: "text-caption text-medium-emphasis" }, "Revenue distribution across weekdays")
                                    ])
                                  ]),
                                  createVNode(_component_apexchart, {
                                    type: "bar",
                                    height: "280",
                                    options: unref(dowChartOptions),
                                    series: unref(dowChartSeries)
                                  }, null, 8, ["options", "series"])
                                ];
                              }
                            }),
                            _: 1
                          }, _parent4, _scopeId3));
                        } else {
                          return [
                            createVNode(VCard, {
                              flat: "",
                              border: "",
                              rounded: "xl",
                              class: "fill-height pa-4"
                            }, {
                              default: withCtx(() => [
                                createVNode("div", { class: "d-flex align-center ga-2 mb-3" }, [
                                  createVNode(VAvatar, {
                                    color: "indigo-lighten-5",
                                    rounded: "lg",
                                    size: "36"
                                  }, {
                                    default: withCtx(() => [
                                      createVNode(VIcon, {
                                        color: "indigo",
                                        size: "20"
                                      }, {
                                        default: withCtx(() => [
                                          createTextVNode("mdi-calendar-week")
                                        ]),
                                        _: 1
                                      })
                                    ]),
                                    _: 1
                                  }),
                                  createVNode("div", null, [
                                    createVNode("div", { class: "text-subtitle-1 font-weight-bold" }, "Sales by Day of Week"),
                                    createVNode("div", { class: "text-caption text-medium-emphasis" }, "Revenue distribution across weekdays")
                                  ])
                                ]),
                                createVNode(_component_apexchart, {
                                  type: "bar",
                                  height: "280",
                                  options: unref(dowChartOptions),
                                  series: unref(dowChartSeries)
                                }, null, 8, ["options", "series"])
                              ]),
                              _: 1
                            })
                          ];
                        }
                      }),
                      _: 1
                    }, _parent3, _scopeId2));
                    _push3(ssrRenderComponent(VCol, {
                      cols: "12",
                      md: "6"
                    }, {
                      default: withCtx((_3, _push4, _parent4, _scopeId3) => {
                        if (_push4) {
                          _push4(ssrRenderComponent(VCard, {
                            flat: "",
                            border: "",
                            rounded: "xl",
                            class: "fill-height pa-4"
                          }, {
                            default: withCtx((_4, _push5, _parent5, _scopeId4) => {
                              if (_push5) {
                                _push5(`<div class="d-flex align-center ga-2 mb-3" data-v-b687d18f${_scopeId4}>`);
                                _push5(ssrRenderComponent(VAvatar, {
                                  color: "orange-lighten-5",
                                  rounded: "lg",
                                  size: "36"
                                }, {
                                  default: withCtx((_5, _push6, _parent6, _scopeId5) => {
                                    if (_push6) {
                                      _push6(ssrRenderComponent(VIcon, {
                                        color: "orange",
                                        size: "20"
                                      }, {
                                        default: withCtx((_6, _push7, _parent7, _scopeId6) => {
                                          if (_push7) {
                                            _push7(`mdi-clock-outline`);
                                          } else {
                                            return [
                                              createTextVNode("mdi-clock-outline")
                                            ];
                                          }
                                        }),
                                        _: 1
                                      }, _parent6, _scopeId5));
                                    } else {
                                      return [
                                        createVNode(VIcon, {
                                          color: "orange",
                                          size: "20"
                                        }, {
                                          default: withCtx(() => [
                                            createTextVNode("mdi-clock-outline")
                                          ]),
                                          _: 1
                                        })
                                      ];
                                    }
                                  }),
                                  _: 1
                                }, _parent5, _scopeId4));
                                _push5(`<div data-v-b687d18f${_scopeId4}><div class="text-subtitle-1 font-weight-bold" data-v-b687d18f${_scopeId4}>Peak Hours</div><div class="text-caption text-medium-emphasis" data-v-b687d18f${_scopeId4}>Revenue and transactions by hour</div></div></div>`);
                                _push5(ssrRenderComponent(_component_apexchart, {
                                  type: "bar",
                                  height: "280",
                                  options: unref(hourlyChartOptions),
                                  series: unref(hourlyChartSeries)
                                }, null, _parent5, _scopeId4));
                              } else {
                                return [
                                  createVNode("div", { class: "d-flex align-center ga-2 mb-3" }, [
                                    createVNode(VAvatar, {
                                      color: "orange-lighten-5",
                                      rounded: "lg",
                                      size: "36"
                                    }, {
                                      default: withCtx(() => [
                                        createVNode(VIcon, {
                                          color: "orange",
                                          size: "20"
                                        }, {
                                          default: withCtx(() => [
                                            createTextVNode("mdi-clock-outline")
                                          ]),
                                          _: 1
                                        })
                                      ]),
                                      _: 1
                                    }),
                                    createVNode("div", null, [
                                      createVNode("div", { class: "text-subtitle-1 font-weight-bold" }, "Peak Hours"),
                                      createVNode("div", { class: "text-caption text-medium-emphasis" }, "Revenue and transactions by hour")
                                    ])
                                  ]),
                                  createVNode(_component_apexchart, {
                                    type: "bar",
                                    height: "280",
                                    options: unref(hourlyChartOptions),
                                    series: unref(hourlyChartSeries)
                                  }, null, 8, ["options", "series"])
                                ];
                              }
                            }),
                            _: 1
                          }, _parent4, _scopeId3));
                        } else {
                          return [
                            createVNode(VCard, {
                              flat: "",
                              border: "",
                              rounded: "xl",
                              class: "fill-height pa-4"
                            }, {
                              default: withCtx(() => [
                                createVNode("div", { class: "d-flex align-center ga-2 mb-3" }, [
                                  createVNode(VAvatar, {
                                    color: "orange-lighten-5",
                                    rounded: "lg",
                                    size: "36"
                                  }, {
                                    default: withCtx(() => [
                                      createVNode(VIcon, {
                                        color: "orange",
                                        size: "20"
                                      }, {
                                        default: withCtx(() => [
                                          createTextVNode("mdi-clock-outline")
                                        ]),
                                        _: 1
                                      })
                                    ]),
                                    _: 1
                                  }),
                                  createVNode("div", null, [
                                    createVNode("div", { class: "text-subtitle-1 font-weight-bold" }, "Peak Hours"),
                                    createVNode("div", { class: "text-caption text-medium-emphasis" }, "Revenue and transactions by hour")
                                  ])
                                ]),
                                createVNode(_component_apexchart, {
                                  type: "bar",
                                  height: "280",
                                  options: unref(hourlyChartOptions),
                                  series: unref(hourlyChartSeries)
                                }, null, 8, ["options", "series"])
                              ]),
                              _: 1
                            })
                          ];
                        }
                      }),
                      _: 1
                    }, _parent3, _scopeId2));
                  } else {
                    return [
                      createVNode(VCol, {
                        cols: "12",
                        md: "6"
                      }, {
                        default: withCtx(() => [
                          createVNode(VCard, {
                            flat: "",
                            border: "",
                            rounded: "xl",
                            class: "fill-height pa-4"
                          }, {
                            default: withCtx(() => [
                              createVNode("div", { class: "d-flex align-center ga-2 mb-3" }, [
                                createVNode(VAvatar, {
                                  color: "indigo-lighten-5",
                                  rounded: "lg",
                                  size: "36"
                                }, {
                                  default: withCtx(() => [
                                    createVNode(VIcon, {
                                      color: "indigo",
                                      size: "20"
                                    }, {
                                      default: withCtx(() => [
                                        createTextVNode("mdi-calendar-week")
                                      ]),
                                      _: 1
                                    })
                                  ]),
                                  _: 1
                                }),
                                createVNode("div", null, [
                                  createVNode("div", { class: "text-subtitle-1 font-weight-bold" }, "Sales by Day of Week"),
                                  createVNode("div", { class: "text-caption text-medium-emphasis" }, "Revenue distribution across weekdays")
                                ])
                              ]),
                              createVNode(_component_apexchart, {
                                type: "bar",
                                height: "280",
                                options: unref(dowChartOptions),
                                series: unref(dowChartSeries)
                              }, null, 8, ["options", "series"])
                            ]),
                            _: 1
                          })
                        ]),
                        _: 1
                      }),
                      createVNode(VCol, {
                        cols: "12",
                        md: "6"
                      }, {
                        default: withCtx(() => [
                          createVNode(VCard, {
                            flat: "",
                            border: "",
                            rounded: "xl",
                            class: "fill-height pa-4"
                          }, {
                            default: withCtx(() => [
                              createVNode("div", { class: "d-flex align-center ga-2 mb-3" }, [
                                createVNode(VAvatar, {
                                  color: "orange-lighten-5",
                                  rounded: "lg",
                                  size: "36"
                                }, {
                                  default: withCtx(() => [
                                    createVNode(VIcon, {
                                      color: "orange",
                                      size: "20"
                                    }, {
                                      default: withCtx(() => [
                                        createTextVNode("mdi-clock-outline")
                                      ]),
                                      _: 1
                                    })
                                  ]),
                                  _: 1
                                }),
                                createVNode("div", null, [
                                  createVNode("div", { class: "text-subtitle-1 font-weight-bold" }, "Peak Hours"),
                                  createVNode("div", { class: "text-caption text-medium-emphasis" }, "Revenue and transactions by hour")
                                ])
                              ]),
                              createVNode(_component_apexchart, {
                                type: "bar",
                                height: "280",
                                options: unref(hourlyChartOptions),
                                series: unref(hourlyChartSeries)
                              }, null, 8, ["options", "series"])
                            ]),
                            _: 1
                          })
                        ]),
                        _: 1
                      })
                    ];
                  }
                }),
                _: 1
              }, _parent2, _scopeId));
              _push2(ssrRenderComponent(VCard, {
                flat: "",
                border: "",
                rounded: "xl",
                class: "mb-4 overflow-hidden"
              }, {
                default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                  if (_push3) {
                    _push3(`<div class="d-flex align-center ga-2 pa-4 pb-2 flex-wrap" data-v-b687d18f${_scopeId2}>`);
                    _push3(ssrRenderComponent(VAvatar, {
                      color: "blue-grey-lighten-5",
                      rounded: "lg",
                      size: "36"
                    }, {
                      default: withCtx((_3, _push4, _parent4, _scopeId3) => {
                        if (_push4) {
                          _push4(ssrRenderComponent(VIcon, {
                            color: "blue-grey",
                            size: "20"
                          }, {
                            default: withCtx((_4, _push5, _parent5, _scopeId4) => {
                              if (_push5) {
                                _push5(`mdi-chart-bar`);
                              } else {
                                return [
                                  createTextVNode("mdi-chart-bar")
                                ];
                              }
                            }),
                            _: 1
                          }, _parent4, _scopeId3));
                        } else {
                          return [
                            createVNode(VIcon, {
                              color: "blue-grey",
                              size: "20"
                            }, {
                              default: withCtx(() => [
                                createTextVNode("mdi-chart-bar")
                              ]),
                              _: 1
                            })
                          ];
                        }
                      }),
                      _: 1
                    }, _parent3, _scopeId2));
                    _push3(`<div class="me-auto" data-v-b687d18f${_scopeId2}><div class="text-subtitle-1 font-weight-bold" data-v-b687d18f${_scopeId2}>Time of Day Breakdown</div><div class="text-caption text-medium-emphasis" data-v-b687d18f${_scopeId2}>Revenue and transactions grouped by time-of-day ranges</div></div>`);
                    if (unref(busiestRange)) {
                      _push3(ssrRenderComponent(VChip, {
                        size: "small",
                        color: "amber",
                        variant: "tonal",
                        label: ""
                      }, {
                        default: withCtx((_3, _push4, _parent4, _scopeId3) => {
                          if (_push4) {
                            _push4(ssrRenderComponent(VIcon, {
                              start: "",
                              size: "14"
                            }, {
                              default: withCtx((_4, _push5, _parent5, _scopeId4) => {
                                if (_push5) {
                                  _push5(`mdi-trophy`);
                                } else {
                                  return [
                                    createTextVNode("mdi-trophy")
                                  ];
                                }
                              }),
                              _: 1
                            }, _parent4, _scopeId3));
                            _push4(` Busiest: ${ssrInterpolate(unref(busiestRange).label)} (${ssrInterpolate(unref(busiestRange).sub)}) `);
                          } else {
                            return [
                              createVNode(VIcon, {
                                start: "",
                                size: "14"
                              }, {
                                default: withCtx(() => [
                                  createTextVNode("mdi-trophy")
                                ]),
                                _: 1
                              }),
                              createTextVNode(" Busiest: " + toDisplayString(unref(busiestRange).label) + " (" + toDisplayString(unref(busiestRange).sub) + ") ", 1)
                            ];
                          }
                        }),
                        _: 1
                      }, _parent3, _scopeId2));
                    } else {
                      _push3(`<!---->`);
                    }
                    _push3(`</div>`);
                    _push3(ssrRenderComponent(VDivider, null, null, _parent3, _scopeId2));
                    _push3(`<div class="peak-hours-layout" data-v-b687d18f${_scopeId2}><div class="peak-hours-layout__chart" data-v-b687d18f${_scopeId2}>`);
                    _push3(ssrRenderComponent(_component_apexchart, {
                      type: "bar",
                      height: "340",
                      options: unref(timeOfDayChartOptions),
                      series: unref(timeOfDayChartSeries)
                    }, null, _parent3, _scopeId2));
                    _push3(`</div><div class="peak-hours-layout__ranges" data-v-b687d18f${_scopeId2}><!--[-->`);
                    ssrRenderList(unref(timeRangeStats), (r) => {
                      _push3(`<div class="${ssrRenderClass([{ "time-range-card--peak": r.label === unref(busiestRange)?.label }, "time-range-card"])}" data-v-b687d18f${_scopeId2}><div class="time-range-card__bar" style="${ssrRenderStyle({ background: r.color })}" data-v-b687d18f${_scopeId2}></div><div class="time-range-card__body" data-v-b687d18f${_scopeId2}><div class="d-flex align-center ga-1" data-v-b687d18f${_scopeId2}>`);
                      _push3(ssrRenderComponent(VIcon, {
                        size: "16",
                        color: r.label === unref(busiestRange)?.label ? "amber" : void 0
                      }, {
                        default: withCtx((_3, _push4, _parent4, _scopeId3) => {
                          if (_push4) {
                            _push4(`${ssrInterpolate(r.icon)}`);
                          } else {
                            return [
                              createTextVNode(toDisplayString(r.icon), 1)
                            ];
                          }
                        }),
                        _: 2
                      }, _parent3, _scopeId2));
                      _push3(`<span class="text-subtitle-2 font-weight-bold" data-v-b687d18f${_scopeId2}>${ssrInterpolate(r.label)}</span>`);
                      if (r.label === unref(busiestRange)?.label) {
                        _push3(ssrRenderComponent(VIcon, {
                          size: "14",
                          color: "amber"
                        }, {
                          default: withCtx((_3, _push4, _parent4, _scopeId3) => {
                            if (_push4) {
                              _push4(`mdi-trophy`);
                            } else {
                              return [
                                createTextVNode("mdi-trophy")
                              ];
                            }
                          }),
                          _: 2
                        }, _parent3, _scopeId2));
                      } else {
                        _push3(`<!---->`);
                      }
                      _push3(ssrRenderComponent(VSpacer, null, null, _parent3, _scopeId2));
                      _push3(`<span class="text-caption text-medium-emphasis" style="${ssrRenderStyle({ "font-size": "11px" })}" data-v-b687d18f${_scopeId2}>${ssrInterpolate(r.sub)}</span></div><div class="d-flex align-center ga-2 mt-2" data-v-b687d18f${_scopeId2}><div class="text-subtitle-1 font-weight-bold" data-v-b687d18f${_scopeId2}>${ssrInterpolate(unref(currency)(r.revenue))}</div>`);
                      _push3(ssrRenderComponent(VSpacer, null, null, _parent3, _scopeId2));
                      _push3(`<span class="text-caption" style="${ssrRenderStyle({ "font-size": "10px" })}" data-v-b687d18f${_scopeId2}>${ssrInterpolate(r.revenuePct.toFixed(0))}% rev</span></div><div class="time-range-card__progress mt-1" data-v-b687d18f${_scopeId2}><div class="time-range-card__progress-fill" style="${ssrRenderStyle({ width: r.revenuePct + "%", background: r.color })}" data-v-b687d18f${_scopeId2}></div></div><div class="text-caption text-medium-emphasis mt-1" style="${ssrRenderStyle({ "font-size": "10px" })}" data-v-b687d18f${_scopeId2}>${ssrInterpolate(r.count)} txn${ssrInterpolate(r.count === 1 ? "" : "s")} · ${ssrInterpolate(r.sharePct.toFixed(0))}% of day </div></div></div>`);
                    });
                    _push3(`<!--]--></div></div>`);
                  } else {
                    return [
                      createVNode("div", { class: "d-flex align-center ga-2 pa-4 pb-2 flex-wrap" }, [
                        createVNode(VAvatar, {
                          color: "blue-grey-lighten-5",
                          rounded: "lg",
                          size: "36"
                        }, {
                          default: withCtx(() => [
                            createVNode(VIcon, {
                              color: "blue-grey",
                              size: "20"
                            }, {
                              default: withCtx(() => [
                                createTextVNode("mdi-chart-bar")
                              ]),
                              _: 1
                            })
                          ]),
                          _: 1
                        }),
                        createVNode("div", { class: "me-auto" }, [
                          createVNode("div", { class: "text-subtitle-1 font-weight-bold" }, "Time of Day Breakdown"),
                          createVNode("div", { class: "text-caption text-medium-emphasis" }, "Revenue and transactions grouped by time-of-day ranges")
                        ]),
                        unref(busiestRange) ? (openBlock(), createBlock(VChip, {
                          key: 0,
                          size: "small",
                          color: "amber",
                          variant: "tonal",
                          label: ""
                        }, {
                          default: withCtx(() => [
                            createVNode(VIcon, {
                              start: "",
                              size: "14"
                            }, {
                              default: withCtx(() => [
                                createTextVNode("mdi-trophy")
                              ]),
                              _: 1
                            }),
                            createTextVNode(" Busiest: " + toDisplayString(unref(busiestRange).label) + " (" + toDisplayString(unref(busiestRange).sub) + ") ", 1)
                          ]),
                          _: 1
                        })) : createCommentVNode("", true)
                      ]),
                      createVNode(VDivider),
                      createVNode("div", { class: "peak-hours-layout" }, [
                        createVNode("div", { class: "peak-hours-layout__chart" }, [
                          createVNode(_component_apexchart, {
                            type: "bar",
                            height: "340",
                            options: unref(timeOfDayChartOptions),
                            series: unref(timeOfDayChartSeries)
                          }, null, 8, ["options", "series"])
                        ]),
                        createVNode("div", { class: "peak-hours-layout__ranges" }, [
                          (openBlock(true), createBlock(Fragment, null, renderList(unref(timeRangeStats), (r) => {
                            return openBlock(), createBlock("div", {
                              key: r.label,
                              class: ["time-range-card", { "time-range-card--peak": r.label === unref(busiestRange)?.label }]
                            }, [
                              createVNode("div", {
                                class: "time-range-card__bar",
                                style: { background: r.color }
                              }, null, 4),
                              createVNode("div", { class: "time-range-card__body" }, [
                                createVNode("div", { class: "d-flex align-center ga-1" }, [
                                  createVNode(VIcon, {
                                    size: "16",
                                    color: r.label === unref(busiestRange)?.label ? "amber" : void 0
                                  }, {
                                    default: withCtx(() => [
                                      createTextVNode(toDisplayString(r.icon), 1)
                                    ]),
                                    _: 2
                                  }, 1032, ["color"]),
                                  createVNode("span", { class: "text-subtitle-2 font-weight-bold" }, toDisplayString(r.label), 1),
                                  r.label === unref(busiestRange)?.label ? (openBlock(), createBlock(VIcon, {
                                    key: 0,
                                    size: "14",
                                    color: "amber"
                                  }, {
                                    default: withCtx(() => [
                                      createTextVNode("mdi-trophy")
                                    ]),
                                    _: 1
                                  })) : createCommentVNode("", true),
                                  createVNode(VSpacer),
                                  createVNode("span", {
                                    class: "text-caption text-medium-emphasis",
                                    style: { "font-size": "11px" }
                                  }, toDisplayString(r.sub), 1)
                                ]),
                                createVNode("div", { class: "d-flex align-center ga-2 mt-2" }, [
                                  createVNode("div", { class: "text-subtitle-1 font-weight-bold" }, toDisplayString(unref(currency)(r.revenue)), 1),
                                  createVNode(VSpacer),
                                  createVNode("span", {
                                    class: "text-caption",
                                    style: { "font-size": "10px" }
                                  }, toDisplayString(r.revenuePct.toFixed(0)) + "% rev", 1)
                                ]),
                                createVNode("div", { class: "time-range-card__progress mt-1" }, [
                                  createVNode("div", {
                                    class: "time-range-card__progress-fill",
                                    style: { width: r.revenuePct + "%", background: r.color }
                                  }, null, 4)
                                ]),
                                createVNode("div", {
                                  class: "text-caption text-medium-emphasis mt-1",
                                  style: { "font-size": "10px" }
                                }, toDisplayString(r.count) + " txn" + toDisplayString(r.count === 1 ? "" : "s") + " · " + toDisplayString(r.sharePct.toFixed(0)) + "% of day ", 1)
                              ])
                            ], 2);
                          }), 128))
                        ])
                      ])
                    ];
                  }
                }),
                _: 1
              }, _parent2, _scopeId));
              _push2(ssrRenderComponent(VCard, {
                flat: "",
                border: "",
                rounded: "xl",
                class: "overflow-hidden mb-4"
              }, {
                default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                  if (_push3) {
                    _push3(`<div class="d-flex align-center ga-2 pa-4 pb-2" data-v-b687d18f${_scopeId2}>`);
                    _push3(ssrRenderComponent(VAvatar, {
                      color: "deep-purple-lighten-5",
                      rounded: "lg",
                      size: "36"
                    }, {
                      default: withCtx((_3, _push4, _parent4, _scopeId3) => {
                        if (_push4) {
                          _push4(ssrRenderComponent(VIcon, {
                            color: "deep-purple",
                            size: "20"
                          }, {
                            default: withCtx((_4, _push5, _parent5, _scopeId4) => {
                              if (_push5) {
                                _push5(`mdi-account-tie-outline`);
                              } else {
                                return [
                                  createTextVNode("mdi-account-tie-outline")
                                ];
                              }
                            }),
                            _: 1
                          }, _parent4, _scopeId3));
                        } else {
                          return [
                            createVNode(VIcon, {
                              color: "deep-purple",
                              size: "20"
                            }, {
                              default: withCtx(() => [
                                createTextVNode("mdi-account-tie-outline")
                              ]),
                              _: 1
                            })
                          ];
                        }
                      }),
                      _: 1
                    }, _parent3, _scopeId2));
                    _push3(`<div data-v-b687d18f${_scopeId2}><div class="text-subtitle-1 font-weight-bold" data-v-b687d18f${_scopeId2}>Cashier Performance</div><div class="text-caption text-medium-emphasis" data-v-b687d18f${_scopeId2}>Sales activity by cashier</div></div></div>`);
                    _push3(ssrRenderComponent(VTable, {
                      density: "compact",
                      hover: ""
                    }, {
                      default: withCtx((_3, _push4, _parent4, _scopeId3) => {
                        if (_push4) {
                          _push4(`<thead class="bg-grey-lighten-4" data-v-b687d18f${_scopeId3}><tr data-v-b687d18f${_scopeId3}><th class="text-left" data-v-b687d18f${_scopeId3}>Cashier</th><th class="text-right" data-v-b687d18f${_scopeId3}>Transactions</th><th class="text-right" data-v-b687d18f${_scopeId3}>Revenue</th><th class="text-right" data-v-b687d18f${_scopeId3}>Avg Order</th><th class="text-right" data-v-b687d18f${_scopeId3}>Items Sold</th><th class="text-right" data-v-b687d18f${_scopeId3}>% of Revenue</th><th style="${ssrRenderStyle({ "width": "120px" })}" data-v-b687d18f${_scopeId3}>Performance</th></tr></thead><tbody data-v-b687d18f${_scopeId3}><!--[-->`);
                          ssrRenderList(unref(cashierPerformance), (c, idx) => {
                            _push4(`<tr data-v-b687d18f${_scopeId3}><td data-v-b687d18f${_scopeId3}><div class="d-flex align-center ga-2" data-v-b687d18f${_scopeId3}>`);
                            _push4(ssrRenderComponent(VAvatar, {
                              size: "32",
                              rounded: "lg",
                              color: cashierColor(idx),
                              variant: "tonal"
                            }, {
                              default: withCtx((_4, _push5, _parent5, _scopeId4) => {
                                if (_push5) {
                                  _push5(`<span class="text-body-2 font-weight-bold" data-v-b687d18f${_scopeId4}>${ssrInterpolate((c.name || "?").charAt(0).toUpperCase())}</span>`);
                                } else {
                                  return [
                                    createVNode("span", { class: "text-body-2 font-weight-bold" }, toDisplayString((c.name || "?").charAt(0).toUpperCase()), 1)
                                  ];
                                }
                              }),
                              _: 2
                            }, _parent4, _scopeId3));
                            _push4(`<span class="text-body-2 font-weight-medium" data-v-b687d18f${_scopeId3}>${ssrInterpolate(c.name || "Unknown")}</span></div></td><td class="text-right text-body-2" data-v-b687d18f${_scopeId3}>${ssrInterpolate(c.count)}</td><td class="text-right font-weight-bold text-success" data-v-b687d18f${_scopeId3}>${ssrInterpolate(unref(currency)(c.revenue))}</td><td class="text-right text-body-2" data-v-b687d18f${_scopeId3}>${ssrInterpolate(unref(currency)(c.avgOrder))}</td><td class="text-right text-body-2" data-v-b687d18f${_scopeId3}>${ssrInterpolate(unref(formatNumber)(c.items))}</td><td class="text-right text-body-2 text-medium-emphasis" data-v-b687d18f${_scopeId3}>${ssrInterpolate(c.share.toFixed(1))}%</td><td data-v-b687d18f${_scopeId3}>`);
                            _push4(ssrRenderComponent(VProgressLinear, {
                              "model-value": c.share,
                              color: "primary",
                              height: "6",
                              rounded: ""
                            }, null, _parent4, _scopeId3));
                            _push4(`</td></tr>`);
                          });
                          _push4(`<!--]-->`);
                          if (unref(cashierPerformance).length === 0) {
                            _push4(`<tr data-v-b687d18f${_scopeId3}><td colspan="7" class="text-center py-8 text-medium-emphasis" data-v-b687d18f${_scopeId3}>No cashier data for this period.</td></tr>`);
                          } else {
                            _push4(`<!---->`);
                          }
                          _push4(`</tbody>`);
                        } else {
                          return [
                            createVNode("thead", { class: "bg-grey-lighten-4" }, [
                              createVNode("tr", null, [
                                createVNode("th", { class: "text-left" }, "Cashier"),
                                createVNode("th", { class: "text-right" }, "Transactions"),
                                createVNode("th", { class: "text-right" }, "Revenue"),
                                createVNode("th", { class: "text-right" }, "Avg Order"),
                                createVNode("th", { class: "text-right" }, "Items Sold"),
                                createVNode("th", { class: "text-right" }, "% of Revenue"),
                                createVNode("th", { style: { "width": "120px" } }, "Performance")
                              ])
                            ]),
                            createVNode("tbody", null, [
                              (openBlock(true), createBlock(Fragment, null, renderList(unref(cashierPerformance), (c, idx) => {
                                return openBlock(), createBlock("tr", { key: idx }, [
                                  createVNode("td", null, [
                                    createVNode("div", { class: "d-flex align-center ga-2" }, [
                                      createVNode(VAvatar, {
                                        size: "32",
                                        rounded: "lg",
                                        color: cashierColor(idx),
                                        variant: "tonal"
                                      }, {
                                        default: withCtx(() => [
                                          createVNode("span", { class: "text-body-2 font-weight-bold" }, toDisplayString((c.name || "?").charAt(0).toUpperCase()), 1)
                                        ]),
                                        _: 2
                                      }, 1032, ["color"]),
                                      createVNode("span", { class: "text-body-2 font-weight-medium" }, toDisplayString(c.name || "Unknown"), 1)
                                    ])
                                  ]),
                                  createVNode("td", { class: "text-right text-body-2" }, toDisplayString(c.count), 1),
                                  createVNode("td", { class: "text-right font-weight-bold text-success" }, toDisplayString(unref(currency)(c.revenue)), 1),
                                  createVNode("td", { class: "text-right text-body-2" }, toDisplayString(unref(currency)(c.avgOrder)), 1),
                                  createVNode("td", { class: "text-right text-body-2" }, toDisplayString(unref(formatNumber)(c.items)), 1),
                                  createVNode("td", { class: "text-right text-body-2 text-medium-emphasis" }, toDisplayString(c.share.toFixed(1)) + "%", 1),
                                  createVNode("td", null, [
                                    createVNode(VProgressLinear, {
                                      "model-value": c.share,
                                      color: "primary",
                                      height: "6",
                                      rounded: ""
                                    }, null, 8, ["model-value"])
                                  ])
                                ]);
                              }), 128)),
                              unref(cashierPerformance).length === 0 ? (openBlock(), createBlock("tr", { key: 0 }, [
                                createVNode("td", {
                                  colspan: "7",
                                  class: "text-center py-8 text-medium-emphasis"
                                }, "No cashier data for this period.")
                              ])) : createCommentVNode("", true)
                            ])
                          ];
                        }
                      }),
                      _: 1
                    }, _parent3, _scopeId2));
                  } else {
                    return [
                      createVNode("div", { class: "d-flex align-center ga-2 pa-4 pb-2" }, [
                        createVNode(VAvatar, {
                          color: "deep-purple-lighten-5",
                          rounded: "lg",
                          size: "36"
                        }, {
                          default: withCtx(() => [
                            createVNode(VIcon, {
                              color: "deep-purple",
                              size: "20"
                            }, {
                              default: withCtx(() => [
                                createTextVNode("mdi-account-tie-outline")
                              ]),
                              _: 1
                            })
                          ]),
                          _: 1
                        }),
                        createVNode("div", null, [
                          createVNode("div", { class: "text-subtitle-1 font-weight-bold" }, "Cashier Performance"),
                          createVNode("div", { class: "text-caption text-medium-emphasis" }, "Sales activity by cashier")
                        ])
                      ]),
                      createVNode(VTable, {
                        density: "compact",
                        hover: ""
                      }, {
                        default: withCtx(() => [
                          createVNode("thead", { class: "bg-grey-lighten-4" }, [
                            createVNode("tr", null, [
                              createVNode("th", { class: "text-left" }, "Cashier"),
                              createVNode("th", { class: "text-right" }, "Transactions"),
                              createVNode("th", { class: "text-right" }, "Revenue"),
                              createVNode("th", { class: "text-right" }, "Avg Order"),
                              createVNode("th", { class: "text-right" }, "Items Sold"),
                              createVNode("th", { class: "text-right" }, "% of Revenue"),
                              createVNode("th", { style: { "width": "120px" } }, "Performance")
                            ])
                          ]),
                          createVNode("tbody", null, [
                            (openBlock(true), createBlock(Fragment, null, renderList(unref(cashierPerformance), (c, idx) => {
                              return openBlock(), createBlock("tr", { key: idx }, [
                                createVNode("td", null, [
                                  createVNode("div", { class: "d-flex align-center ga-2" }, [
                                    createVNode(VAvatar, {
                                      size: "32",
                                      rounded: "lg",
                                      color: cashierColor(idx),
                                      variant: "tonal"
                                    }, {
                                      default: withCtx(() => [
                                        createVNode("span", { class: "text-body-2 font-weight-bold" }, toDisplayString((c.name || "?").charAt(0).toUpperCase()), 1)
                                      ]),
                                      _: 2
                                    }, 1032, ["color"]),
                                    createVNode("span", { class: "text-body-2 font-weight-medium" }, toDisplayString(c.name || "Unknown"), 1)
                                  ])
                                ]),
                                createVNode("td", { class: "text-right text-body-2" }, toDisplayString(c.count), 1),
                                createVNode("td", { class: "text-right font-weight-bold text-success" }, toDisplayString(unref(currency)(c.revenue)), 1),
                                createVNode("td", { class: "text-right text-body-2" }, toDisplayString(unref(currency)(c.avgOrder)), 1),
                                createVNode("td", { class: "text-right text-body-2" }, toDisplayString(unref(formatNumber)(c.items)), 1),
                                createVNode("td", { class: "text-right text-body-2 text-medium-emphasis" }, toDisplayString(c.share.toFixed(1)) + "%", 1),
                                createVNode("td", null, [
                                  createVNode(VProgressLinear, {
                                    "model-value": c.share,
                                    color: "primary",
                                    height: "6",
                                    rounded: ""
                                  }, null, 8, ["model-value"])
                                ])
                              ]);
                            }), 128)),
                            unref(cashierPerformance).length === 0 ? (openBlock(), createBlock("tr", { key: 0 }, [
                              createVNode("td", {
                                colspan: "7",
                                class: "text-center py-8 text-medium-emphasis"
                              }, "No cashier data for this period.")
                            ])) : createCommentVNode("", true)
                          ])
                        ]),
                        _: 1
                      })
                    ];
                  }
                }),
                _: 1
              }, _parent2, _scopeId));
              _push2(`<!--]-->`);
            } else {
              _push2(`<!---->`);
            }
            _push2(ssrRenderComponent(VDialog, {
              modelValue: unref(detailsDialog),
              "onUpdate:modelValue": ($event) => isRef(detailsDialog) ? detailsDialog.value = $event : null,
              "max-width": "700"
            }, {
              default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                if (_push3) {
                  _push3(ssrRenderComponent(VCard, { rounded: "xl" }, {
                    default: withCtx((_3, _push4, _parent4, _scopeId3) => {
                      if (_push4) {
                        _push4(ssrRenderComponent(VCardTitle, { class: "d-flex align-center justify-space-between pa-4" }, {
                          default: withCtx((_4, _push5, _parent5, _scopeId4) => {
                            if (_push5) {
                              _push5(`<div class="d-flex align-center ga-3" data-v-b687d18f${_scopeId4}>`);
                              _push5(ssrRenderComponent(VAvatar, {
                                color: statusColor(unref(selectedSale)?.status),
                                variant: "tonal",
                                rounded: "lg",
                                size: "40"
                              }, {
                                default: withCtx((_5, _push6, _parent6, _scopeId5) => {
                                  if (_push6) {
                                    _push6(ssrRenderComponent(VIcon, {
                                      icon: statusIcon(unref(selectedSale)?.status)
                                    }, null, _parent6, _scopeId5));
                                  } else {
                                    return [
                                      createVNode(VIcon, {
                                        icon: statusIcon(unref(selectedSale)?.status)
                                      }, null, 8, ["icon"])
                                    ];
                                  }
                                }),
                                _: 1
                              }, _parent5, _scopeId4));
                              _push5(`<div data-v-b687d18f${_scopeId4}><div class="text-h6 font-weight-bold" data-v-b687d18f${_scopeId4}>${ssrInterpolate(unref(selectedSale)?.transaction_number)}</div><div class="text-caption text-medium-emphasis" data-v-b687d18f${_scopeId4}>${ssrInterpolate(unref(datetime)(unref(selectedSale)?.created_at))}</div></div></div>`);
                              _push5(ssrRenderComponent(VBtn, {
                                variant: "text",
                                icon: "mdi-close",
                                size: "small",
                                onClick: ($event) => detailsDialog.value = false
                              }, null, _parent5, _scopeId4));
                            } else {
                              return [
                                createVNode("div", { class: "d-flex align-center ga-3" }, [
                                  createVNode(VAvatar, {
                                    color: statusColor(unref(selectedSale)?.status),
                                    variant: "tonal",
                                    rounded: "lg",
                                    size: "40"
                                  }, {
                                    default: withCtx(() => [
                                      createVNode(VIcon, {
                                        icon: statusIcon(unref(selectedSale)?.status)
                                      }, null, 8, ["icon"])
                                    ]),
                                    _: 1
                                  }, 8, ["color"]),
                                  createVNode("div", null, [
                                    createVNode("div", { class: "text-h6 font-weight-bold" }, toDisplayString(unref(selectedSale)?.transaction_number), 1),
                                    createVNode("div", { class: "text-caption text-medium-emphasis" }, toDisplayString(unref(datetime)(unref(selectedSale)?.created_at)), 1)
                                  ])
                                ]),
                                createVNode(VBtn, {
                                  variant: "text",
                                  icon: "mdi-close",
                                  size: "small",
                                  onClick: ($event) => detailsDialog.value = false
                                }, null, 8, ["onClick"])
                              ];
                            }
                          }),
                          _: 1
                        }, _parent4, _scopeId3));
                        if (unref(selectedSale)) {
                          _push4(ssrRenderComponent(VCardText, { class: "pt-2" }, {
                            default: withCtx((_4, _push5, _parent5, _scopeId4) => {
                              if (_push5) {
                                _push5(`<div class="d-flex align-center ga-2 mb-4 flex-wrap" data-v-b687d18f${_scopeId4}>`);
                                _push5(ssrRenderComponent(VChip, {
                                  size: "small",
                                  color: statusColor(unref(selectedSale).status),
                                  variant: "tonal",
                                  label: "",
                                  class: "text-capitalize"
                                }, {
                                  default: withCtx((_5, _push6, _parent6, _scopeId5) => {
                                    if (_push6) {
                                      _push6(`${ssrInterpolate(formatStatus(unref(selectedSale).status))}`);
                                    } else {
                                      return [
                                        createTextVNode(toDisplayString(formatStatus(unref(selectedSale).status)), 1)
                                      ];
                                    }
                                  }),
                                  _: 1
                                }, _parent5, _scopeId4));
                                if (unref(selectedSale).payment_method) {
                                  _push5(ssrRenderComponent(VChip, {
                                    size: "small",
                                    variant: "tonal",
                                    color: paymentColor(unref(selectedSale).payment_method)
                                  }, {
                                    default: withCtx((_5, _push6, _parent6, _scopeId5) => {
                                      if (_push6) {
                                        _push6(`${ssrInterpolate(unref(selectedSale).payment_method_display || unref(selectedSale).payment_method)}`);
                                      } else {
                                        return [
                                          createTextVNode(toDisplayString(unref(selectedSale).payment_method_display || unref(selectedSale).payment_method), 1)
                                        ];
                                      }
                                    }),
                                    _: 1
                                  }, _parent5, _scopeId4));
                                } else {
                                  _push5(`<!---->`);
                                }
                                _push5(`<span class="text-body-2 text-medium-emphasis" data-v-b687d18f${_scopeId4}>${ssrInterpolate(unref(selectedSale).customer_name || "Walk-in")} · ${ssrInterpolate(unref(selectedSale).cashier_name || "—")} · ${ssrInterpolate(unref(selectedSale).branch_name || "—")}</span></div><div class="text-subtitle-2 font-weight-bold mb-2" data-v-b687d18f${_scopeId4}>Line Items (${ssrInterpolate(unref(selectedSale).items?.length || 0)})</div>`);
                                _push5(ssrRenderComponent(VTable, {
                                  density: "compact",
                                  class: "mb-4 rounded border"
                                }, {
                                  default: withCtx((_5, _push6, _parent6, _scopeId5) => {
                                    if (_push6) {
                                      _push6(`<thead class="bg-grey-lighten-4" data-v-b687d18f${_scopeId5}><tr data-v-b687d18f${_scopeId5}><th class="text-left" data-v-b687d18f${_scopeId5}>Product</th><th class="text-right" data-v-b687d18f${_scopeId5}>Qty</th><th class="text-right" data-v-b687d18f${_scopeId5}>Price</th><th class="text-right" data-v-b687d18f${_scopeId5}>Total</th></tr></thead><tbody data-v-b687d18f${_scopeId5}><!--[-->`);
                                      ssrRenderList(unref(selectedSale).items, (item) => {
                                        _push6(`<tr data-v-b687d18f${_scopeId5}><td data-v-b687d18f${_scopeId5}><div class="text-body-2 font-weight-medium" data-v-b687d18f${_scopeId5}>${ssrInterpolate(item.product_name)}</div><div class="text-caption text-disabled" data-v-b687d18f${_scopeId5}>${ssrInterpolate(item.product_sku)}</div></td><td class="text-right text-body-2" data-v-b687d18f${_scopeId5}>${ssrInterpolate(unref(formatNumber)(item.quantity))}</td><td class="text-right text-body-2" data-v-b687d18f${_scopeId5}>${ssrInterpolate(unref(currency)(item.unit_price))}</td><td class="text-right text-body-2 font-weight-medium" data-v-b687d18f${_scopeId5}>${ssrInterpolate(unref(currency)(item.line_total))}</td></tr>`);
                                      });
                                      _push6(`<!--]--></tbody>`);
                                    } else {
                                      return [
                                        createVNode("thead", { class: "bg-grey-lighten-4" }, [
                                          createVNode("tr", null, [
                                            createVNode("th", { class: "text-left" }, "Product"),
                                            createVNode("th", { class: "text-right" }, "Qty"),
                                            createVNode("th", { class: "text-right" }, "Price"),
                                            createVNode("th", { class: "text-right" }, "Total")
                                          ])
                                        ]),
                                        createVNode("tbody", null, [
                                          (openBlock(true), createBlock(Fragment, null, renderList(unref(selectedSale).items, (item) => {
                                            return openBlock(), createBlock("tr", {
                                              key: item.id
                                            }, [
                                              createVNode("td", null, [
                                                createVNode("div", { class: "text-body-2 font-weight-medium" }, toDisplayString(item.product_name), 1),
                                                createVNode("div", { class: "text-caption text-disabled" }, toDisplayString(item.product_sku), 1)
                                              ]),
                                              createVNode("td", { class: "text-right text-body-2" }, toDisplayString(unref(formatNumber)(item.quantity)), 1),
                                              createVNode("td", { class: "text-right text-body-2" }, toDisplayString(unref(currency)(item.unit_price)), 1),
                                              createVNode("td", { class: "text-right text-body-2 font-weight-medium" }, toDisplayString(unref(currency)(item.line_total)), 1)
                                            ]);
                                          }), 128))
                                        ])
                                      ];
                                    }
                                  }),
                                  _: 1
                                }, _parent5, _scopeId4));
                                _push5(`<div class="d-flex flex-column align-end ga-1" data-v-b687d18f${_scopeId4}><div class="d-flex justify-space-between" style="${ssrRenderStyle({ "width": "220px" })}" data-v-b687d18f${_scopeId4}><span class="text-body-2 text-medium-emphasis" data-v-b687d18f${_scopeId4}>Subtotal</span><span class="text-body-2 font-weight-medium" data-v-b687d18f${_scopeId4}>${ssrInterpolate(unref(currency)(unref(selectedSale).subtotal))}</span></div><div class="d-flex justify-space-between" style="${ssrRenderStyle({ "width": "220px" })}" data-v-b687d18f${_scopeId4}><span class="text-body-2 text-medium-emphasis" data-v-b687d18f${_scopeId4}>Discount</span><span class="text-body-2 font-weight-medium text-error" data-v-b687d18f${_scopeId4}>-${ssrInterpolate(unref(currency)(unref(selectedSale).discount))}</span></div><div class="d-flex justify-space-between" style="${ssrRenderStyle({ "width": "220px" })}" data-v-b687d18f${_scopeId4}><span class="text-body-2 text-medium-emphasis" data-v-b687d18f${_scopeId4}>Tax</span><span class="text-body-2 font-weight-medium" data-v-b687d18f${_scopeId4}>${ssrInterpolate(unref(currency)(unref(selectedSale).tax))}</span></div>`);
                                _push5(ssrRenderComponent(VDivider, {
                                  class: "my-1",
                                  style: { "width": "220px" }
                                }, null, _parent5, _scopeId4));
                                _push5(`<div class="d-flex justify-space-between" style="${ssrRenderStyle({ "width": "220px" })}" data-v-b687d18f${_scopeId4}><span class="text-subtitle-2 font-weight-bold" data-v-b687d18f${_scopeId4}>Total</span><span class="text-subtitle-1 font-weight-bold text-primary" data-v-b687d18f${_scopeId4}>${ssrInterpolate(unref(currency)(unref(selectedSale).total))}</span></div></div>`);
                              } else {
                                return [
                                  createVNode("div", { class: "d-flex align-center ga-2 mb-4 flex-wrap" }, [
                                    createVNode(VChip, {
                                      size: "small",
                                      color: statusColor(unref(selectedSale).status),
                                      variant: "tonal",
                                      label: "",
                                      class: "text-capitalize"
                                    }, {
                                      default: withCtx(() => [
                                        createTextVNode(toDisplayString(formatStatus(unref(selectedSale).status)), 1)
                                      ]),
                                      _: 1
                                    }, 8, ["color"]),
                                    unref(selectedSale).payment_method ? (openBlock(), createBlock(VChip, {
                                      key: 0,
                                      size: "small",
                                      variant: "tonal",
                                      color: paymentColor(unref(selectedSale).payment_method)
                                    }, {
                                      default: withCtx(() => [
                                        createTextVNode(toDisplayString(unref(selectedSale).payment_method_display || unref(selectedSale).payment_method), 1)
                                      ]),
                                      _: 1
                                    }, 8, ["color"])) : createCommentVNode("", true),
                                    createVNode("span", { class: "text-body-2 text-medium-emphasis" }, toDisplayString(unref(selectedSale).customer_name || "Walk-in") + " · " + toDisplayString(unref(selectedSale).cashier_name || "—") + " · " + toDisplayString(unref(selectedSale).branch_name || "—"), 1)
                                  ]),
                                  createVNode("div", { class: "text-subtitle-2 font-weight-bold mb-2" }, "Line Items (" + toDisplayString(unref(selectedSale).items?.length || 0) + ")", 1),
                                  createVNode(VTable, {
                                    density: "compact",
                                    class: "mb-4 rounded border"
                                  }, {
                                    default: withCtx(() => [
                                      createVNode("thead", { class: "bg-grey-lighten-4" }, [
                                        createVNode("tr", null, [
                                          createVNode("th", { class: "text-left" }, "Product"),
                                          createVNode("th", { class: "text-right" }, "Qty"),
                                          createVNode("th", { class: "text-right" }, "Price"),
                                          createVNode("th", { class: "text-right" }, "Total")
                                        ])
                                      ]),
                                      createVNode("tbody", null, [
                                        (openBlock(true), createBlock(Fragment, null, renderList(unref(selectedSale).items, (item) => {
                                          return openBlock(), createBlock("tr", {
                                            key: item.id
                                          }, [
                                            createVNode("td", null, [
                                              createVNode("div", { class: "text-body-2 font-weight-medium" }, toDisplayString(item.product_name), 1),
                                              createVNode("div", { class: "text-caption text-disabled" }, toDisplayString(item.product_sku), 1)
                                            ]),
                                            createVNode("td", { class: "text-right text-body-2" }, toDisplayString(unref(formatNumber)(item.quantity)), 1),
                                            createVNode("td", { class: "text-right text-body-2" }, toDisplayString(unref(currency)(item.unit_price)), 1),
                                            createVNode("td", { class: "text-right text-body-2 font-weight-medium" }, toDisplayString(unref(currency)(item.line_total)), 1)
                                          ]);
                                        }), 128))
                                      ])
                                    ]),
                                    _: 1
                                  }),
                                  createVNode("div", { class: "d-flex flex-column align-end ga-1" }, [
                                    createVNode("div", {
                                      class: "d-flex justify-space-between",
                                      style: { "width": "220px" }
                                    }, [
                                      createVNode("span", { class: "text-body-2 text-medium-emphasis" }, "Subtotal"),
                                      createVNode("span", { class: "text-body-2 font-weight-medium" }, toDisplayString(unref(currency)(unref(selectedSale).subtotal)), 1)
                                    ]),
                                    createVNode("div", {
                                      class: "d-flex justify-space-between",
                                      style: { "width": "220px" }
                                    }, [
                                      createVNode("span", { class: "text-body-2 text-medium-emphasis" }, "Discount"),
                                      createVNode("span", { class: "text-body-2 font-weight-medium text-error" }, "-" + toDisplayString(unref(currency)(unref(selectedSale).discount)), 1)
                                    ]),
                                    createVNode("div", {
                                      class: "d-flex justify-space-between",
                                      style: { "width": "220px" }
                                    }, [
                                      createVNode("span", { class: "text-body-2 text-medium-emphasis" }, "Tax"),
                                      createVNode("span", { class: "text-body-2 font-weight-medium" }, toDisplayString(unref(currency)(unref(selectedSale).tax)), 1)
                                    ]),
                                    createVNode(VDivider, {
                                      class: "my-1",
                                      style: { "width": "220px" }
                                    }),
                                    createVNode("div", {
                                      class: "d-flex justify-space-between",
                                      style: { "width": "220px" }
                                    }, [
                                      createVNode("span", { class: "text-subtitle-2 font-weight-bold" }, "Total"),
                                      createVNode("span", { class: "text-subtitle-1 font-weight-bold text-primary" }, toDisplayString(unref(currency)(unref(selectedSale).total)), 1)
                                    ])
                                  ])
                                ];
                              }
                            }),
                            _: 1
                          }, _parent4, _scopeId3));
                        } else {
                          _push4(`<!---->`);
                        }
                      } else {
                        return [
                          createVNode(VCardTitle, { class: "d-flex align-center justify-space-between pa-4" }, {
                            default: withCtx(() => [
                              createVNode("div", { class: "d-flex align-center ga-3" }, [
                                createVNode(VAvatar, {
                                  color: statusColor(unref(selectedSale)?.status),
                                  variant: "tonal",
                                  rounded: "lg",
                                  size: "40"
                                }, {
                                  default: withCtx(() => [
                                    createVNode(VIcon, {
                                      icon: statusIcon(unref(selectedSale)?.status)
                                    }, null, 8, ["icon"])
                                  ]),
                                  _: 1
                                }, 8, ["color"]),
                                createVNode("div", null, [
                                  createVNode("div", { class: "text-h6 font-weight-bold" }, toDisplayString(unref(selectedSale)?.transaction_number), 1),
                                  createVNode("div", { class: "text-caption text-medium-emphasis" }, toDisplayString(unref(datetime)(unref(selectedSale)?.created_at)), 1)
                                ])
                              ]),
                              createVNode(VBtn, {
                                variant: "text",
                                icon: "mdi-close",
                                size: "small",
                                onClick: ($event) => detailsDialog.value = false
                              }, null, 8, ["onClick"])
                            ]),
                            _: 1
                          }),
                          unref(selectedSale) ? (openBlock(), createBlock(VCardText, {
                            key: 0,
                            class: "pt-2"
                          }, {
                            default: withCtx(() => [
                              createVNode("div", { class: "d-flex align-center ga-2 mb-4 flex-wrap" }, [
                                createVNode(VChip, {
                                  size: "small",
                                  color: statusColor(unref(selectedSale).status),
                                  variant: "tonal",
                                  label: "",
                                  class: "text-capitalize"
                                }, {
                                  default: withCtx(() => [
                                    createTextVNode(toDisplayString(formatStatus(unref(selectedSale).status)), 1)
                                  ]),
                                  _: 1
                                }, 8, ["color"]),
                                unref(selectedSale).payment_method ? (openBlock(), createBlock(VChip, {
                                  key: 0,
                                  size: "small",
                                  variant: "tonal",
                                  color: paymentColor(unref(selectedSale).payment_method)
                                }, {
                                  default: withCtx(() => [
                                    createTextVNode(toDisplayString(unref(selectedSale).payment_method_display || unref(selectedSale).payment_method), 1)
                                  ]),
                                  _: 1
                                }, 8, ["color"])) : createCommentVNode("", true),
                                createVNode("span", { class: "text-body-2 text-medium-emphasis" }, toDisplayString(unref(selectedSale).customer_name || "Walk-in") + " · " + toDisplayString(unref(selectedSale).cashier_name || "—") + " · " + toDisplayString(unref(selectedSale).branch_name || "—"), 1)
                              ]),
                              createVNode("div", { class: "text-subtitle-2 font-weight-bold mb-2" }, "Line Items (" + toDisplayString(unref(selectedSale).items?.length || 0) + ")", 1),
                              createVNode(VTable, {
                                density: "compact",
                                class: "mb-4 rounded border"
                              }, {
                                default: withCtx(() => [
                                  createVNode("thead", { class: "bg-grey-lighten-4" }, [
                                    createVNode("tr", null, [
                                      createVNode("th", { class: "text-left" }, "Product"),
                                      createVNode("th", { class: "text-right" }, "Qty"),
                                      createVNode("th", { class: "text-right" }, "Price"),
                                      createVNode("th", { class: "text-right" }, "Total")
                                    ])
                                  ]),
                                  createVNode("tbody", null, [
                                    (openBlock(true), createBlock(Fragment, null, renderList(unref(selectedSale).items, (item) => {
                                      return openBlock(), createBlock("tr", {
                                        key: item.id
                                      }, [
                                        createVNode("td", null, [
                                          createVNode("div", { class: "text-body-2 font-weight-medium" }, toDisplayString(item.product_name), 1),
                                          createVNode("div", { class: "text-caption text-disabled" }, toDisplayString(item.product_sku), 1)
                                        ]),
                                        createVNode("td", { class: "text-right text-body-2" }, toDisplayString(unref(formatNumber)(item.quantity)), 1),
                                        createVNode("td", { class: "text-right text-body-2" }, toDisplayString(unref(currency)(item.unit_price)), 1),
                                        createVNode("td", { class: "text-right text-body-2 font-weight-medium" }, toDisplayString(unref(currency)(item.line_total)), 1)
                                      ]);
                                    }), 128))
                                  ])
                                ]),
                                _: 1
                              }),
                              createVNode("div", { class: "d-flex flex-column align-end ga-1" }, [
                                createVNode("div", {
                                  class: "d-flex justify-space-between",
                                  style: { "width": "220px" }
                                }, [
                                  createVNode("span", { class: "text-body-2 text-medium-emphasis" }, "Subtotal"),
                                  createVNode("span", { class: "text-body-2 font-weight-medium" }, toDisplayString(unref(currency)(unref(selectedSale).subtotal)), 1)
                                ]),
                                createVNode("div", {
                                  class: "d-flex justify-space-between",
                                  style: { "width": "220px" }
                                }, [
                                  createVNode("span", { class: "text-body-2 text-medium-emphasis" }, "Discount"),
                                  createVNode("span", { class: "text-body-2 font-weight-medium text-error" }, "-" + toDisplayString(unref(currency)(unref(selectedSale).discount)), 1)
                                ]),
                                createVNode("div", {
                                  class: "d-flex justify-space-between",
                                  style: { "width": "220px" }
                                }, [
                                  createVNode("span", { class: "text-body-2 text-medium-emphasis" }, "Tax"),
                                  createVNode("span", { class: "text-body-2 font-weight-medium" }, toDisplayString(unref(currency)(unref(selectedSale).tax)), 1)
                                ]),
                                createVNode(VDivider, {
                                  class: "my-1",
                                  style: { "width": "220px" }
                                }),
                                createVNode("div", {
                                  class: "d-flex justify-space-between",
                                  style: { "width": "220px" }
                                }, [
                                  createVNode("span", { class: "text-subtitle-2 font-weight-bold" }, "Total"),
                                  createVNode("span", { class: "text-subtitle-1 font-weight-bold text-primary" }, toDisplayString(unref(currency)(unref(selectedSale).total)), 1)
                                ])
                              ])
                            ]),
                            _: 1
                          })) : createCommentVNode("", true)
                        ];
                      }
                    }),
                    _: 1
                  }, _parent3, _scopeId2));
                } else {
                  return [
                    createVNode(VCard, { rounded: "xl" }, {
                      default: withCtx(() => [
                        createVNode(VCardTitle, { class: "d-flex align-center justify-space-between pa-4" }, {
                          default: withCtx(() => [
                            createVNode("div", { class: "d-flex align-center ga-3" }, [
                              createVNode(VAvatar, {
                                color: statusColor(unref(selectedSale)?.status),
                                variant: "tonal",
                                rounded: "lg",
                                size: "40"
                              }, {
                                default: withCtx(() => [
                                  createVNode(VIcon, {
                                    icon: statusIcon(unref(selectedSale)?.status)
                                  }, null, 8, ["icon"])
                                ]),
                                _: 1
                              }, 8, ["color"]),
                              createVNode("div", null, [
                                createVNode("div", { class: "text-h6 font-weight-bold" }, toDisplayString(unref(selectedSale)?.transaction_number), 1),
                                createVNode("div", { class: "text-caption text-medium-emphasis" }, toDisplayString(unref(datetime)(unref(selectedSale)?.created_at)), 1)
                              ])
                            ]),
                            createVNode(VBtn, {
                              variant: "text",
                              icon: "mdi-close",
                              size: "small",
                              onClick: ($event) => detailsDialog.value = false
                            }, null, 8, ["onClick"])
                          ]),
                          _: 1
                        }),
                        unref(selectedSale) ? (openBlock(), createBlock(VCardText, {
                          key: 0,
                          class: "pt-2"
                        }, {
                          default: withCtx(() => [
                            createVNode("div", { class: "d-flex align-center ga-2 mb-4 flex-wrap" }, [
                              createVNode(VChip, {
                                size: "small",
                                color: statusColor(unref(selectedSale).status),
                                variant: "tonal",
                                label: "",
                                class: "text-capitalize"
                              }, {
                                default: withCtx(() => [
                                  createTextVNode(toDisplayString(formatStatus(unref(selectedSale).status)), 1)
                                ]),
                                _: 1
                              }, 8, ["color"]),
                              unref(selectedSale).payment_method ? (openBlock(), createBlock(VChip, {
                                key: 0,
                                size: "small",
                                variant: "tonal",
                                color: paymentColor(unref(selectedSale).payment_method)
                              }, {
                                default: withCtx(() => [
                                  createTextVNode(toDisplayString(unref(selectedSale).payment_method_display || unref(selectedSale).payment_method), 1)
                                ]),
                                _: 1
                              }, 8, ["color"])) : createCommentVNode("", true),
                              createVNode("span", { class: "text-body-2 text-medium-emphasis" }, toDisplayString(unref(selectedSale).customer_name || "Walk-in") + " · " + toDisplayString(unref(selectedSale).cashier_name || "—") + " · " + toDisplayString(unref(selectedSale).branch_name || "—"), 1)
                            ]),
                            createVNode("div", { class: "text-subtitle-2 font-weight-bold mb-2" }, "Line Items (" + toDisplayString(unref(selectedSale).items?.length || 0) + ")", 1),
                            createVNode(VTable, {
                              density: "compact",
                              class: "mb-4 rounded border"
                            }, {
                              default: withCtx(() => [
                                createVNode("thead", { class: "bg-grey-lighten-4" }, [
                                  createVNode("tr", null, [
                                    createVNode("th", { class: "text-left" }, "Product"),
                                    createVNode("th", { class: "text-right" }, "Qty"),
                                    createVNode("th", { class: "text-right" }, "Price"),
                                    createVNode("th", { class: "text-right" }, "Total")
                                  ])
                                ]),
                                createVNode("tbody", null, [
                                  (openBlock(true), createBlock(Fragment, null, renderList(unref(selectedSale).items, (item) => {
                                    return openBlock(), createBlock("tr", {
                                      key: item.id
                                    }, [
                                      createVNode("td", null, [
                                        createVNode("div", { class: "text-body-2 font-weight-medium" }, toDisplayString(item.product_name), 1),
                                        createVNode("div", { class: "text-caption text-disabled" }, toDisplayString(item.product_sku), 1)
                                      ]),
                                      createVNode("td", { class: "text-right text-body-2" }, toDisplayString(unref(formatNumber)(item.quantity)), 1),
                                      createVNode("td", { class: "text-right text-body-2" }, toDisplayString(unref(currency)(item.unit_price)), 1),
                                      createVNode("td", { class: "text-right text-body-2 font-weight-medium" }, toDisplayString(unref(currency)(item.line_total)), 1)
                                    ]);
                                  }), 128))
                                ])
                              ]),
                              _: 1
                            }),
                            createVNode("div", { class: "d-flex flex-column align-end ga-1" }, [
                              createVNode("div", {
                                class: "d-flex justify-space-between",
                                style: { "width": "220px" }
                              }, [
                                createVNode("span", { class: "text-body-2 text-medium-emphasis" }, "Subtotal"),
                                createVNode("span", { class: "text-body-2 font-weight-medium" }, toDisplayString(unref(currency)(unref(selectedSale).subtotal)), 1)
                              ]),
                              createVNode("div", {
                                class: "d-flex justify-space-between",
                                style: { "width": "220px" }
                              }, [
                                createVNode("span", { class: "text-body-2 text-medium-emphasis" }, "Discount"),
                                createVNode("span", { class: "text-body-2 font-weight-medium text-error" }, "-" + toDisplayString(unref(currency)(unref(selectedSale).discount)), 1)
                              ]),
                              createVNode("div", {
                                class: "d-flex justify-space-between",
                                style: { "width": "220px" }
                              }, [
                                createVNode("span", { class: "text-body-2 text-medium-emphasis" }, "Tax"),
                                createVNode("span", { class: "text-body-2 font-weight-medium" }, toDisplayString(unref(currency)(unref(selectedSale).tax)), 1)
                              ]),
                              createVNode(VDivider, {
                                class: "my-1",
                                style: { "width": "220px" }
                              }),
                              createVNode("div", {
                                class: "d-flex justify-space-between",
                                style: { "width": "220px" }
                              }, [
                                createVNode("span", { class: "text-subtitle-2 font-weight-bold" }, "Total"),
                                createVNode("span", { class: "text-subtitle-1 font-weight-bold text-primary" }, toDisplayString(unref(currency)(unref(selectedSale).total)), 1)
                              ])
                            ])
                          ]),
                          _: 1
                        })) : createCommentVNode("", true)
                      ]),
                      _: 1
                    })
                  ];
                }
              }),
              _: 1
            }, _parent2, _scopeId));
            _push2(ssrRenderComponent(VDialog, {
              modelValue: unref(customDialog),
              "onUpdate:modelValue": ($event) => isRef(customDialog) ? customDialog.value = $event : null,
              "max-width": "420"
            }, {
              default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                if (_push3) {
                  _push3(ssrRenderComponent(VCard, null, {
                    default: withCtx((_3, _push4, _parent4, _scopeId3) => {
                      if (_push4) {
                        _push4(ssrRenderComponent(VCardTitle, { class: "d-flex align-center justify-space-between" }, {
                          default: withCtx((_4, _push5, _parent5, _scopeId4) => {
                            if (_push5) {
                              _push5(`<span class="text-h6" data-v-b687d18f${_scopeId4}>Custom Date Range</span>`);
                              _push5(ssrRenderComponent(VBtn, {
                                variant: "text",
                                icon: "mdi-close",
                                size: "small",
                                onClick: ($event) => customDialog.value = false
                              }, null, _parent5, _scopeId4));
                            } else {
                              return [
                                createVNode("span", { class: "text-h6" }, "Custom Date Range"),
                                createVNode(VBtn, {
                                  variant: "text",
                                  icon: "mdi-close",
                                  size: "small",
                                  onClick: ($event) => customDialog.value = false
                                }, null, 8, ["onClick"])
                              ];
                            }
                          }),
                          _: 1
                        }, _parent4, _scopeId3));
                        _push4(ssrRenderComponent(VCardText, null, {
                          default: withCtx((_4, _push5, _parent5, _scopeId4) => {
                            if (_push5) {
                              _push5(ssrRenderComponent(VTextField, {
                                modelValue: unref(customFrom),
                                "onUpdate:modelValue": ($event) => isRef(customFrom) ? customFrom.value = $event : null,
                                type: "date",
                                label: "From Date",
                                variant: "outlined",
                                density: "comfortable",
                                "hide-details": "",
                                class: "mb-4"
                              }, null, _parent5, _scopeId4));
                              _push5(ssrRenderComponent(VTextField, {
                                modelValue: unref(customTo),
                                "onUpdate:modelValue": ($event) => isRef(customTo) ? customTo.value = $event : null,
                                type: "date",
                                label: "To Date",
                                variant: "outlined",
                                density: "comfortable",
                                "hide-details": ""
                              }, null, _parent5, _scopeId4));
                            } else {
                              return [
                                createVNode(VTextField, {
                                  modelValue: unref(customFrom),
                                  "onUpdate:modelValue": ($event) => isRef(customFrom) ? customFrom.value = $event : null,
                                  type: "date",
                                  label: "From Date",
                                  variant: "outlined",
                                  density: "comfortable",
                                  "hide-details": "",
                                  class: "mb-4"
                                }, null, 8, ["modelValue", "onUpdate:modelValue"]),
                                createVNode(VTextField, {
                                  modelValue: unref(customTo),
                                  "onUpdate:modelValue": ($event) => isRef(customTo) ? customTo.value = $event : null,
                                  type: "date",
                                  label: "To Date",
                                  variant: "outlined",
                                  density: "comfortable",
                                  "hide-details": ""
                                }, null, 8, ["modelValue", "onUpdate:modelValue"])
                              ];
                            }
                          }),
                          _: 1
                        }, _parent4, _scopeId3));
                        _push4(ssrRenderComponent(VCardActions, { class: "px-4 pb-4" }, {
                          default: withCtx((_4, _push5, _parent5, _scopeId4) => {
                            if (_push5) {
                              _push5(ssrRenderComponent(VSpacer, null, null, _parent5, _scopeId4));
                              _push5(ssrRenderComponent(VBtn, {
                                variant: "text",
                                onClick: ($event) => customDialog.value = false
                              }, {
                                default: withCtx((_5, _push6, _parent6, _scopeId5) => {
                                  if (_push6) {
                                    _push6(`Cancel`);
                                  } else {
                                    return [
                                      createTextVNode("Cancel")
                                    ];
                                  }
                                }),
                                _: 1
                              }, _parent5, _scopeId4));
                              _push5(ssrRenderComponent(VBtn, {
                                variant: "flat",
                                color: "primary",
                                onClick: applyCustomRange
                              }, {
                                default: withCtx((_5, _push6, _parent6, _scopeId5) => {
                                  if (_push6) {
                                    _push6(`Apply`);
                                  } else {
                                    return [
                                      createTextVNode("Apply")
                                    ];
                                  }
                                }),
                                _: 1
                              }, _parent5, _scopeId4));
                            } else {
                              return [
                                createVNode(VSpacer),
                                createVNode(VBtn, {
                                  variant: "text",
                                  onClick: ($event) => customDialog.value = false
                                }, {
                                  default: withCtx(() => [
                                    createTextVNode("Cancel")
                                  ]),
                                  _: 1
                                }, 8, ["onClick"]),
                                createVNode(VBtn, {
                                  variant: "flat",
                                  color: "primary",
                                  onClick: applyCustomRange
                                }, {
                                  default: withCtx(() => [
                                    createTextVNode("Apply")
                                  ]),
                                  _: 1
                                })
                              ];
                            }
                          }),
                          _: 1
                        }, _parent4, _scopeId3));
                      } else {
                        return [
                          createVNode(VCardTitle, { class: "d-flex align-center justify-space-between" }, {
                            default: withCtx(() => [
                              createVNode("span", { class: "text-h6" }, "Custom Date Range"),
                              createVNode(VBtn, {
                                variant: "text",
                                icon: "mdi-close",
                                size: "small",
                                onClick: ($event) => customDialog.value = false
                              }, null, 8, ["onClick"])
                            ]),
                            _: 1
                          }),
                          createVNode(VCardText, null, {
                            default: withCtx(() => [
                              createVNode(VTextField, {
                                modelValue: unref(customFrom),
                                "onUpdate:modelValue": ($event) => isRef(customFrom) ? customFrom.value = $event : null,
                                type: "date",
                                label: "From Date",
                                variant: "outlined",
                                density: "comfortable",
                                "hide-details": "",
                                class: "mb-4"
                              }, null, 8, ["modelValue", "onUpdate:modelValue"]),
                              createVNode(VTextField, {
                                modelValue: unref(customTo),
                                "onUpdate:modelValue": ($event) => isRef(customTo) ? customTo.value = $event : null,
                                type: "date",
                                label: "To Date",
                                variant: "outlined",
                                density: "comfortable",
                                "hide-details": ""
                              }, null, 8, ["modelValue", "onUpdate:modelValue"])
                            ]),
                            _: 1
                          }),
                          createVNode(VCardActions, { class: "px-4 pb-4" }, {
                            default: withCtx(() => [
                              createVNode(VSpacer),
                              createVNode(VBtn, {
                                variant: "text",
                                onClick: ($event) => customDialog.value = false
                              }, {
                                default: withCtx(() => [
                                  createTextVNode("Cancel")
                                ]),
                                _: 1
                              }, 8, ["onClick"]),
                              createVNode(VBtn, {
                                variant: "flat",
                                color: "primary",
                                onClick: applyCustomRange
                              }, {
                                default: withCtx(() => [
                                  createTextVNode("Apply")
                                ]),
                                _: 1
                              })
                            ]),
                            _: 1
                          })
                        ];
                      }
                    }),
                    _: 1
                  }, _parent3, _scopeId2));
                } else {
                  return [
                    createVNode(VCard, null, {
                      default: withCtx(() => [
                        createVNode(VCardTitle, { class: "d-flex align-center justify-space-between" }, {
                          default: withCtx(() => [
                            createVNode("span", { class: "text-h6" }, "Custom Date Range"),
                            createVNode(VBtn, {
                              variant: "text",
                              icon: "mdi-close",
                              size: "small",
                              onClick: ($event) => customDialog.value = false
                            }, null, 8, ["onClick"])
                          ]),
                          _: 1
                        }),
                        createVNode(VCardText, null, {
                          default: withCtx(() => [
                            createVNode(VTextField, {
                              modelValue: unref(customFrom),
                              "onUpdate:modelValue": ($event) => isRef(customFrom) ? customFrom.value = $event : null,
                              type: "date",
                              label: "From Date",
                              variant: "outlined",
                              density: "comfortable",
                              "hide-details": "",
                              class: "mb-4"
                            }, null, 8, ["modelValue", "onUpdate:modelValue"]),
                            createVNode(VTextField, {
                              modelValue: unref(customTo),
                              "onUpdate:modelValue": ($event) => isRef(customTo) ? customTo.value = $event : null,
                              type: "date",
                              label: "To Date",
                              variant: "outlined",
                              density: "comfortable",
                              "hide-details": ""
                            }, null, 8, ["modelValue", "onUpdate:modelValue"])
                          ]),
                          _: 1
                        }),
                        createVNode(VCardActions, { class: "px-4 pb-4" }, {
                          default: withCtx(() => [
                            createVNode(VSpacer),
                            createVNode(VBtn, {
                              variant: "text",
                              onClick: ($event) => customDialog.value = false
                            }, {
                              default: withCtx(() => [
                                createTextVNode("Cancel")
                              ]),
                              _: 1
                            }, 8, ["onClick"]),
                            createVNode(VBtn, {
                              variant: "flat",
                              color: "primary",
                              onClick: applyCustomRange
                            }, {
                              default: withCtx(() => [
                                createTextVNode("Apply")
                              ]),
                              _: 1
                            })
                          ]),
                          _: 1
                        })
                      ]),
                      _: 1
                    })
                  ];
                }
              }),
              _: 1
            }, _parent2, _scopeId));
          } else {
            return [
              createVNode(VRow, { class: "d-flex align-center justify-space-between mb-4" }, {
                default: withCtx(() => [
                  createVNode(VCol, {
                    cols: "12",
                    sm: "6"
                  }, {
                    default: withCtx(() => [
                      createVNode("div", { class: "text-h5 font-weight-bold" }, "Sales"),
                      createVNode("div", { class: "text-body-2 text-medium-emphasis" }, toDisplayString(unref(stats).totalSales) + " sales · " + toDisplayString(unref(currency)(unref(stats).totalRevenue)) + " revenue · " + toDisplayString(unref(formatNumber)(unref(stats).totalItems)) + " items sold ", 1)
                    ]),
                    _: 1
                  }),
                  createVNode(VCol, {
                    cols: "12",
                    class: "d-flex justify-space-between ga-2 flex-wrap align-center"
                  }, {
                    default: withCtx(() => [
                      createVNode(VBtnToggle, {
                        modelValue: unref(datePreset),
                        "onUpdate:modelValue": ($event) => isRef(datePreset) ? datePreset.value = $event : null,
                        mandatory: "",
                        density: "comfortable",
                        variant: "outlined",
                        divided: "",
                        color: "primary"
                      }, {
                        default: withCtx(() => [
                          (openBlock(true), createBlock(Fragment, null, renderList(datePresetItems.filter((p) => p.value !== "custom"), (preset) => {
                            return openBlock(), createBlock(VBtn, {
                              key: preset.value,
                              value: preset.value,
                              size: "small",
                              variant: "text"
                            }, {
                              default: withCtx(() => [
                                createTextVNode(toDisplayString(preset.title), 1)
                              ]),
                              _: 2
                            }, 1032, ["value"]);
                          }), 128)),
                          createVNode(VBtn, {
                            value: "custom",
                            size: "small",
                            variant: "text",
                            onClick: ($event) => customDialog.value = true
                          }, {
                            default: withCtx(() => [
                              createTextVNode("Custom")
                            ]),
                            _: 1
                          }, 8, ["onClick"])
                        ]),
                        _: 1
                      }, 8, ["modelValue", "onUpdate:modelValue"]),
                      createVNode(VSpacer),
                      createVNode(VBtn, {
                        variant: "outlined",
                        "prepend-icon": "mdi-download",
                        onClick: exportCsv
                      }, {
                        default: withCtx(() => [
                          createTextVNode("Export")
                        ]),
                        _: 1
                      }),
                      createVNode(VBtn, {
                        variant: "outlined",
                        "prepend-icon": "mdi-refresh",
                        onClick: loadSales
                      }, {
                        default: withCtx(() => [
                          createTextVNode("Refresh")
                        ]),
                        _: 1
                      })
                    ]),
                    _: 1
                  })
                ]),
                _: 1
              }),
              createVNode(VRow, { class: "mb-4" }, {
                default: withCtx(() => [
                  createVNode(VCol, {
                    cols: "6",
                    lg: "3"
                  }, {
                    default: withCtx(() => [
                      createVNode(VCard, {
                        rounded: "xl",
                        variant: "outlined",
                        class: "kpi-card pa-5"
                      }, {
                        default: withCtx(() => [
                          createVNode("div", { class: "d-flex align-start justify-space-between mb-2" }, [
                            createVNode("span", { class: "text-caption text-medium-emphasis font-weight-medium" }, "Total Sales"),
                            createVNode("div", { class: "kpi-icon kpi-icon-blue" }, [
                              createVNode(VIcon, {
                                size: "18",
                                icon: "mdi-receipt-text-outline"
                              })
                            ])
                          ]),
                          createVNode("p", { class: "text-h4 font-weight-bold mb-1" }, toDisplayString(unref(stats).totalSales), 1),
                          createVNode("span", { class: "text-caption text-medium-emphasis" }, toDisplayString(unref(stats).completedCount) + " completed", 1)
                        ]),
                        _: 1
                      })
                    ]),
                    _: 1
                  }),
                  createVNode(VCol, {
                    cols: "6",
                    lg: "3"
                  }, {
                    default: withCtx(() => [
                      createVNode(VCard, {
                        rounded: "xl",
                        variant: "outlined",
                        class: "kpi-card pa-5"
                      }, {
                        default: withCtx(() => [
                          createVNode("div", { class: "d-flex align-start justify-space-between mb-2" }, [
                            createVNode("span", { class: "text-caption text-medium-emphasis font-weight-medium" }, "Total Revenue"),
                            createVNode("div", { class: "kpi-icon kpi-icon-green" }, [
                              createVNode(VIcon, {
                                size: "18",
                                icon: "mdi-cash-multiple"
                              })
                            ])
                          ]),
                          createVNode("p", { class: "text-h4 font-weight-bold mb-1 text-success" }, toDisplayString(unref(currency)(unref(stats).totalRevenue)), 1),
                          createVNode("span", { class: "text-caption text-medium-emphasis" }, "Avg: " + toDisplayString(unref(currency)(unref(stats).avgSale)), 1)
                        ]),
                        _: 1
                      })
                    ]),
                    _: 1
                  }),
                  createVNode(VCol, {
                    cols: "6",
                    lg: "3"
                  }, {
                    default: withCtx(() => [
                      createVNode(VCard, {
                        rounded: "xl",
                        variant: "outlined",
                        class: "kpi-card pa-5"
                      }, {
                        default: withCtx(() => [
                          createVNode("div", { class: "d-flex align-start justify-space-between mb-2" }, [
                            createVNode("span", { class: "text-caption text-medium-emphasis font-weight-medium" }, "Avg Sale Value"),
                            createVNode("div", { class: "kpi-icon kpi-icon-purple" }, [
                              createVNode(VIcon, {
                                size: "18",
                                icon: "mdi-chart-line-variant"
                              })
                            ])
                          ]),
                          createVNode("p", { class: "text-h4 font-weight-bold mb-1" }, toDisplayString(unref(currency)(unref(stats).avgSale)), 1),
                          createVNode("span", { class: "text-caption text-medium-emphasis" }, toDisplayString(unref(stats).totalDiscount > 0 ? "Discount: " + unref(currency)(unref(stats).totalDiscount) : "No discounts"), 1)
                        ]),
                        _: 1
                      })
                    ]),
                    _: 1
                  }),
                  createVNode(VCol, {
                    cols: "6",
                    lg: "3"
                  }, {
                    default: withCtx(() => [
                      createVNode(VCard, {
                        rounded: "xl",
                        variant: "outlined",
                        class: "kpi-card pa-5"
                      }, {
                        default: withCtx(() => [
                          createVNode("div", { class: "d-flex align-start justify-space-between mb-2" }, [
                            createVNode("span", { class: "text-caption text-medium-emphasis font-weight-medium" }, "Items Sold"),
                            createVNode("div", { class: "kpi-icon kpi-icon-orange" }, [
                              createVNode(VIcon, {
                                size: "18",
                                icon: "mdi-package-variant-closed"
                              })
                            ])
                          ]),
                          createVNode("p", { class: "text-h4 font-weight-bold mb-1" }, toDisplayString(unref(formatNumber)(unref(stats).totalItems)), 1),
                          createVNode("span", { class: "text-caption text-medium-emphasis" }, toDisplayString(unref(stats).uniqueProducts) + " unique products", 1)
                        ]),
                        _: 1
                      })
                    ]),
                    _: 1
                  })
                ]),
                _: 1
              }),
              createVNode(VCard, {
                rounded: "t-lg",
                class: "mb-4",
                flat: "",
                border: ""
              }, {
                default: withCtx(() => [
                  createVNode(VTabs, {
                    modelValue: unref(activeTab),
                    "onUpdate:modelValue": ($event) => isRef(activeTab) ? activeTab.value = $event : null,
                    color: "primary",
                    density: "comfortable",
                    "show-arrows": ""
                  }, {
                    default: withCtx(() => [
                      createVNode(VTab, { value: "transactions" }, {
                        default: withCtx(() => [
                          createVNode(VIcon, {
                            size: "16",
                            start: ""
                          }, {
                            default: withCtx(() => [
                              createTextVNode("mdi-receipt-text-outline")
                            ]),
                            _: 1
                          }),
                          createTextVNode(" Transactions "),
                          createVNode(VChip, {
                            size: "x-small",
                            class: "ml-2",
                            color: unref(activeTab) === "transactions" ? "primary" : "default"
                          }, {
                            default: withCtx(() => [
                              createTextVNode(toDisplayString(unref(filteredSales).length), 1)
                            ]),
                            _: 1
                          }, 8, ["color"])
                        ]),
                        _: 1
                      }),
                      createVNode(VTab, { value: "analytics" }, {
                        default: withCtx(() => [
                          createVNode(VIcon, {
                            size: "16",
                            start: ""
                          }, {
                            default: withCtx(() => [
                              createTextVNode("mdi-chart-line-variant")
                            ]),
                            _: 1
                          }),
                          createTextVNode(" Analytics ")
                        ]),
                        _: 1
                      })
                    ]),
                    _: 1
                  }, 8, ["modelValue", "onUpdate:modelValue"])
                ]),
                _: 1
              }),
              unref(activeTab) === "transactions" ? (openBlock(), createBlock(Fragment, { key: 0 }, [
                createVNode(VCard, {
                  rounded: "xl",
                  class: "pa-4 mb-4",
                  flat: "",
                  border: ""
                }, {
                  default: withCtx(() => [
                    createVNode(VRow, { density: "comfortable" }, {
                      default: withCtx(() => [
                        createVNode(VCol, {
                          cols: "12",
                          lg: "6"
                        }, {
                          default: withCtx(() => [
                            createVNode(VTextField, {
                              modelValue: unref(searchQuery),
                              "onUpdate:modelValue": ($event) => isRef(searchQuery) ? searchQuery.value = $event : null,
                              placeholder: "Search by transaction #, customer, cashier...",
                              variant: "outlined",
                              density: "compact",
                              "prepend-inner-icon": "mdi-magnify",
                              "hide-details": "",
                              clearable: ""
                            }, null, 8, ["modelValue", "onUpdate:modelValue"])
                          ]),
                          _: 1
                        }),
                        createVNode(VCol, {
                          cols: "6",
                          lg: "3"
                        }, {
                          default: withCtx(() => [
                            createVNode(VSelect, {
                              modelValue: unref(filterStatus),
                              "onUpdate:modelValue": ($event) => isRef(filterStatus) ? filterStatus.value = $event : null,
                              items: statusFilterItems,
                              "item-title": "title",
                              "item-value": "value",
                              label: "All Status",
                              variant: "outlined",
                              density: "compact",
                              "hide-details": "",
                              clearable: ""
                            }, null, 8, ["modelValue", "onUpdate:modelValue"])
                          ]),
                          _: 1
                        }),
                        createVNode(VCol, {
                          cols: "6",
                          lg: "3"
                        }, {
                          default: withCtx(() => [
                            createVNode(VSelect, {
                              modelValue: unref(sortBy),
                              "onUpdate:modelValue": ($event) => isRef(sortBy) ? sortBy.value = $event : null,
                              items: sortItems,
                              "item-title": "title",
                              "item-value": "value",
                              label: "Sort",
                              variant: "outlined",
                              density: "compact",
                              "hide-details": ""
                            }, null, 8, ["modelValue", "onUpdate:modelValue"])
                          ]),
                          _: 1
                        })
                      ]),
                      _: 1
                    })
                  ]),
                  _: 1
                }),
                unref(hasActiveFilters) ? (openBlock(), createBlock("div", {
                  key: 0,
                  class: "d-flex align-center flex-wrap ga-2 mb-4"
                }, [
                  createVNode("span", { class: "text-body-2 text-medium-emphasis" }, "Filters:"),
                  unref(searchQuery) ? (openBlock(), createBlock(VChip, {
                    key: 0,
                    size: "small",
                    color: "primary",
                    closable: "",
                    "onClick:close": ($event) => searchQuery.value = ""
                  }, {
                    default: withCtx(() => [
                      createTextVNode(' Search: "' + toDisplayString(unref(searchQuery)) + '" ', 1)
                    ]),
                    _: 1
                  }, 8, ["onClick:close"])) : createCommentVNode("", true),
                  unref(filterStatus) ? (openBlock(), createBlock(VChip, {
                    key: 1,
                    size: "small",
                    color: "indigo",
                    closable: "",
                    "onClick:close": ($event) => filterStatus.value = ""
                  }, {
                    default: withCtx(() => [
                      createTextVNode(" Status: " + toDisplayString(unref(filterStatus)), 1)
                    ]),
                    _: 1
                  }, 8, ["onClick:close"])) : createCommentVNode("", true),
                  createVNode(VBtn, {
                    variant: "text",
                    size: "small",
                    color: "error",
                    onClick: clearAllFilters
                  }, {
                    default: withCtx(() => [
                      createTextVNode("Clear all")
                    ]),
                    _: 1
                  })
                ])) : createCommentVNode("", true),
                unref(loading) ? (openBlock(), createBlock(VCard, {
                  key: 1,
                  flat: "",
                  border: "",
                  rounded: "xl",
                  class: "py-16 d-flex flex-column align-center justify-center ga-4"
                }, {
                  default: withCtx(() => [
                    createVNode(VProgressCircular, {
                      indeterminate: "",
                      color: "primary",
                      size: "48",
                      width: "4"
                    }),
                    createVNode("div", { class: "text-body-2 text-medium-emphasis" }, "Loading sales...")
                  ]),
                  _: 1
                })) : unref(filteredSales).length === 0 ? (openBlock(), createBlock(VCard, {
                  key: 2,
                  flat: "",
                  border: "",
                  rounded: "xl",
                  class: "py-16 text-center"
                }, {
                  default: withCtx(() => [
                    createVNode(VAvatar, {
                      color: "blue-lighten-5",
                      size: "80",
                      class: "mb-4"
                    }, {
                      default: withCtx(() => [
                        createVNode(VIcon, {
                          color: "blue",
                          size: "40"
                        }, {
                          default: withCtx(() => [
                            createTextVNode("mdi-receipt-text-outline")
                          ]),
                          _: 1
                        })
                      ]),
                      _: 1
                    }),
                    createVNode("div", { class: "text-h6 font-weight-bold mb-1" }, "No sales found"),
                    createVNode("div", { class: "text-body-2 text-medium-emphasis" }, toDisplayString(unref(hasActiveFilters) ? "Try adjusting your filters." : "Sales will appear here once transactions are processed."), 1)
                  ]),
                  _: 1
                })) : (openBlock(), createBlock(VCard, {
                  key: 3,
                  flat: "",
                  border: "",
                  rounded: "xl",
                  class: "overflow-hidden"
                }, {
                  default: withCtx(() => [
                    createVNode(VTable, {
                      density: "compact",
                      hover: ""
                    }, {
                      default: withCtx(() => [
                        createVNode("thead", { class: "bg-grey-lighten-4" }, [
                          createVNode("tr", null, [
                            createVNode("th", {
                              class: "text-center",
                              style: { "width": "52px" }
                            }, "#"),
                            createVNode("th", {
                              class: "text-left",
                              style: { "min-width": "160px" }
                            }, "Transaction #"),
                            createVNode("th", { class: "text-left" }, "Customer"),
                            createVNode("th", { class: "text-left" }, "Cashier"),
                            createVNode("th", { class: "text-left" }, "Payment"),
                            createVNode("th", { class: "text-right" }, "Items"),
                            createVNode("th", { class: "text-right" }, "Subtotal"),
                            createVNode("th", { class: "text-right" }, "Discount"),
                            createVNode("th", { class: "text-right" }, "Tax"),
                            createVNode("th", { class: "text-right" }, "Total"),
                            createVNode("th", { class: "text-left" }, "Status"),
                            createVNode("th", { class: "text-left" }, "Date")
                          ])
                        ]),
                        createVNode("tbody", null, [
                          (openBlock(true), createBlock(Fragment, null, renderList(unref(pagedSales), (sale, idx) => {
                            return openBlock(), createBlock("tr", {
                              key: sale.id,
                              style: { "cursor": "pointer" },
                              onClick: ($event) => openSaleDetails(sale)
                            }, [
                              createVNode("td", { class: "text-center text-caption text-disabled font-weight-bold" }, toDisplayString(rowNumber(idx)), 1),
                              createVNode("td", null, [
                                createVNode("div", { class: "d-flex align-center ga-2" }, [
                                  createVNode(VAvatar, {
                                    size: "32",
                                    rounded: "lg",
                                    color: statusColor(sale.status),
                                    variant: "tonal"
                                  }, {
                                    default: withCtx(() => [
                                      createVNode(VIcon, {
                                        size: "18",
                                        icon: statusIcon(sale.status)
                                      }, null, 8, ["icon"])
                                    ]),
                                    _: 2
                                  }, 1032, ["color"]),
                                  createVNode("span", { class: "text-body-2 font-weight-bold font-mono" }, toDisplayString(sale.transaction_number), 1)
                                ])
                              ]),
                              createVNode("td", null, [
                                sale.customer_name && sale.customer_name !== "Walk-in" ? (openBlock(), createBlock("span", {
                                  key: 0,
                                  class: "text-body-2"
                                }, toDisplayString(sale.customer_name), 1)) : (openBlock(), createBlock("span", {
                                  key: 1,
                                  class: "text-disabled"
                                }, "Walk-in"))
                              ]),
                              createVNode("td", { class: "text-body-2 text-medium-emphasis" }, toDisplayString(sale.cashier_name || "—"), 1),
                              createVNode("td", null, [
                                sale.payment_method ? (openBlock(), createBlock(VChip, {
                                  key: 0,
                                  size: "small",
                                  variant: "tonal",
                                  color: paymentColor(sale.payment_method)
                                }, {
                                  default: withCtx(() => [
                                    createTextVNode(toDisplayString(sale.payment_method_display || sale.payment_method), 1)
                                  ]),
                                  _: 2
                                }, 1032, ["color"])) : (openBlock(), createBlock("span", {
                                  key: 1,
                                  class: "text-disabled"
                                }, "—"))
                              ]),
                              createVNode("td", { class: "text-right text-body-2" }, toDisplayString(sale.lines_count), 1),
                              createVNode("td", { class: "text-right text-body-2" }, toDisplayString(unref(currency)(sale.subtotal)), 1),
                              createVNode("td", { class: "text-right text-body-2 text-error" }, "-" + toDisplayString(unref(currency)(sale.discount)), 1),
                              createVNode("td", { class: "text-right text-body-2 text-medium-emphasis" }, toDisplayString(unref(currency)(sale.tax)), 1),
                              createVNode("td", { class: "text-right" }, [
                                createVNode("span", { class: "font-weight-bold" }, toDisplayString(unref(currency)(sale.total)), 1)
                              ]),
                              createVNode("td", null, [
                                createVNode(VChip, {
                                  size: "small",
                                  color: statusColor(sale.status),
                                  variant: "tonal",
                                  label: "",
                                  class: "text-capitalize"
                                }, {
                                  default: withCtx(() => [
                                    createTextVNode(toDisplayString(formatStatus(sale.status)), 1)
                                  ]),
                                  _: 2
                                }, 1032, ["color"])
                              ]),
                              createVNode("td", { class: "text-body-2 text-medium-emphasis" }, toDisplayString(unref(datetime)(sale.created_at)), 1)
                            ], 8, ["onClick"]);
                          }), 128))
                        ])
                      ]),
                      _: 1
                    }),
                    createVNode(_component_PaginationBar, {
                      count: unref(filteredSales).length,
                      next: unref(currentPage) < unref(totalPages) ? "yes" : null,
                      previous: unref(currentPage) > 1 ? "yes" : null,
                      page: unref(currentPage),
                      pageSize,
                      totalPages: unref(totalPages),
                      onPageChange: ($event) => currentPage.value = $event
                    }, null, 8, ["count", "next", "previous", "page", "totalPages", "onPageChange"])
                  ]),
                  _: 1
                }))
              ], 64)) : createCommentVNode("", true),
              unref(activeTab) === "analytics" ? (openBlock(), createBlock(Fragment, { key: 1 }, [
                createVNode(VRow, { class: "mb-4" }, {
                  default: withCtx(() => [
                    createVNode(VCol, {
                      cols: "6",
                      lg: "3"
                    }, {
                      default: withCtx(() => [
                        createVNode(VCard, {
                          class: "pa-5 bg-surface",
                          flat: "",
                          border: "",
                          style: { "border-top": "4px solid rgb(var(--v-theme-green)) !important", "border-radius": "10px !important" }
                        }, {
                          default: withCtx(() => [
                            createVNode("div", { class: "d-flex align-start justify-space-between" }, [
                              createVNode("div", null, [
                                createVNode("div", { class: "text-caption text-medium-emphasis text-uppercase" }, "Gross Revenue"),
                                createVNode("div", { class: "text-h5 font-weight-bold text-success mt-2" }, toDisplayString(unref(currency)(unref(analytics).totalRevenue)), 1)
                              ]),
                              createVNode(VAvatar, {
                                color: "green-lighten-5",
                                rounded: "lg",
                                size: "40"
                              }, {
                                default: withCtx(() => [
                                  createVNode(VIcon, { color: "green" }, {
                                    default: withCtx(() => [
                                      createTextVNode("mdi-cash")
                                    ]),
                                    _: 1
                                  })
                                ]),
                                _: 1
                              })
                            ])
                          ]),
                          _: 1
                        })
                      ]),
                      _: 1
                    }),
                    createVNode(VCol, {
                      cols: "6",
                      lg: "3"
                    }, {
                      default: withCtx(() => [
                        createVNode(VCard, {
                          class: "pa-5 bg-surface",
                          flat: "",
                          border: "",
                          style: { "border-top": "4px solid rgb(var(--v-theme-blue)) !important", "border-radius": "10px !important" }
                        }, {
                          default: withCtx(() => [
                            createVNode("div", { class: "d-flex align-start justify-space-between" }, [
                              createVNode("div", null, [
                                createVNode("div", { class: "text-caption text-medium-emphasis text-uppercase" }, "Avg Items / Sale"),
                                createVNode("div", { class: "text-h5 font-weight-bold mt-2" }, toDisplayString(unref(analytics).avgItemsPerSale.toFixed(1)), 1)
                              ]),
                              createVNode(VAvatar, {
                                color: "blue-lighten-5",
                                rounded: "lg",
                                size: "40"
                              }, {
                                default: withCtx(() => [
                                  createVNode(VIcon, { color: "blue" }, {
                                    default: withCtx(() => [
                                      createTextVNode("mdi-package-variant-multiple")
                                    ]),
                                    _: 1
                                  })
                                ]),
                                _: 1
                              })
                            ])
                          ]),
                          _: 1
                        })
                      ]),
                      _: 1
                    }),
                    createVNode(VCol, {
                      cols: "6",
                      lg: "3"
                    }, {
                      default: withCtx(() => [
                        createVNode(VCard, {
                          class: "pa-5 bg-surface",
                          flat: "",
                          border: "",
                          style: { "border-top": "4px solid rgb(var(--v-theme-orange)) !important", "border-radius": "10px !important" }
                        }, {
                          default: withCtx(() => [
                            createVNode("div", { class: "d-flex align-start justify-space-between" }, [
                              createVNode("div", null, [
                                createVNode("div", { class: "text-caption text-medium-emphasis text-uppercase" }, "Total Discount"),
                                createVNode("div", { class: "text-h5 font-weight-bold text-error mt-2" }, toDisplayString(unref(currency)(unref(analytics).totalDiscount)), 1)
                              ]),
                              createVNode(VAvatar, {
                                color: "orange-lighten-5",
                                rounded: "lg",
                                size: "40"
                              }, {
                                default: withCtx(() => [
                                  createVNode(VIcon, { color: "orange" }, {
                                    default: withCtx(() => [
                                      createTextVNode("mdi-tag-minus")
                                    ]),
                                    _: 1
                                  })
                                ]),
                                _: 1
                              })
                            ])
                          ]),
                          _: 1
                        })
                      ]),
                      _: 1
                    }),
                    createVNode(VCol, {
                      cols: "6",
                      lg: "3"
                    }, {
                      default: withCtx(() => [
                        createVNode(VCard, {
                          class: "pa-5 bg-surface",
                          flat: "",
                          border: "",
                          style: { "border-top": "4px solid rgb(var(--v-theme-teal)) !important", "border-radius": "10px !important" }
                        }, {
                          default: withCtx(() => [
                            createVNode("div", { class: "d-flex align-start justify-space-between" }, [
                              createVNode("div", null, [
                                createVNode("div", { class: "text-caption text-medium-emphasis text-uppercase" }, "Conversion Rate"),
                                createVNode("div", { class: "text-h5 font-weight-bold mt-2" }, toDisplayString(unref(analytics).completionRate.toFixed(1)) + "%", 1)
                              ]),
                              createVNode(VAvatar, {
                                color: "teal-lighten-5",
                                rounded: "lg",
                                size: "40"
                              }, {
                                default: withCtx(() => [
                                  createVNode(VIcon, { color: "teal" }, {
                                    default: withCtx(() => [
                                      createTextVNode("mdi-check-decagram")
                                    ]),
                                    _: 1
                                  })
                                ]),
                                _: 1
                              })
                            ])
                          ]),
                          _: 1
                        })
                      ]),
                      _: 1
                    })
                  ]),
                  _: 1
                }),
                createVNode(VRow, { class: "mb-4" }, {
                  default: withCtx(() => [
                    createVNode(VCol, {
                      cols: "12",
                      lg: "8"
                    }, {
                      default: withCtx(() => [
                        createVNode(VCard, {
                          flat: "",
                          border: "",
                          rounded: "xl",
                          class: "pa-4"
                        }, {
                          default: withCtx(() => [
                            createVNode("div", { class: "d-flex align-center ga-2 mb-3" }, [
                              createVNode(VAvatar, {
                                color: "blue-lighten-5",
                                rounded: "lg",
                                size: "36"
                              }, {
                                default: withCtx(() => [
                                  createVNode(VIcon, {
                                    color: "blue",
                                    size: "20"
                                  }, {
                                    default: withCtx(() => [
                                      createTextVNode("mdi-chart-areaspline")
                                    ]),
                                    _: 1
                                  })
                                ]),
                                _: 1
                              }),
                              createVNode("div", null, [
                                createVNode("div", { class: "text-subtitle-1 font-weight-bold" }, "Revenue Trend"),
                                createVNode("div", { class: "text-caption text-medium-emphasis" }, "Daily revenue over selected period")
                              ])
                            ]),
                            createVNode(_component_apexchart, {
                              type: "area",
                              height: "300",
                              options: unref(revenueChartOptions),
                              series: unref(revenueChartSeries)
                            }, null, 8, ["options", "series"])
                          ]),
                          _: 1
                        })
                      ]),
                      _: 1
                    }),
                    createVNode(VCol, {
                      cols: "12",
                      lg: "4"
                    }, {
                      default: withCtx(() => [
                        createVNode(VCard, {
                          flat: "",
                          border: "",
                          rounded: "xl",
                          class: "pa-4"
                        }, {
                          default: withCtx(() => [
                            createVNode("div", { class: "d-flex align-center ga-2 mb-3" }, [
                              createVNode(VAvatar, {
                                color: "green-lighten-5",
                                rounded: "lg",
                                size: "36"
                              }, {
                                default: withCtx(() => [
                                  createVNode(VIcon, {
                                    color: "green",
                                    size: "20"
                                  }, {
                                    default: withCtx(() => [
                                      createTextVNode("mdi-chart-donut")
                                    ]),
                                    _: 1
                                  })
                                ]),
                                _: 1
                              }),
                              createVNode("div", null, [
                                createVNode("div", { class: "text-subtitle-1 font-weight-bold" }, "Payment Methods"),
                                createVNode("div", { class: "text-caption text-medium-emphasis" }, "Revenue by payment type")
                              ])
                            ]),
                            createVNode(_component_apexchart, {
                              type: "donut",
                              height: "300",
                              options: unref(paymentChartOptions),
                              series: unref(paymentChartSeries)
                            }, null, 8, ["options", "series"])
                          ]),
                          _: 1
                        })
                      ]),
                      _: 1
                    })
                  ]),
                  _: 1
                }),
                createVNode(VRow, { class: "mb-4" }, {
                  default: withCtx(() => [
                    createVNode(VCol, {
                      cols: "12",
                      lg: "8"
                    }, {
                      default: withCtx(() => [
                        createVNode(VCard, {
                          flat: "",
                          border: "",
                          rounded: "xl",
                          class: "pa-4"
                        }, {
                          default: withCtx(() => [
                            createVNode("div", { class: "d-flex align-center ga-2 mb-3" }, [
                              createVNode(VAvatar, {
                                color: "indigo-lighten-5",
                                rounded: "lg",
                                size: "36"
                              }, {
                                default: withCtx(() => [
                                  createVNode(VIcon, {
                                    color: "indigo",
                                    size: "20"
                                  }, {
                                    default: withCtx(() => [
                                      createTextVNode("mdi-trophy-award")
                                    ]),
                                    _: 1
                                  })
                                ]),
                                _: 1
                              }),
                              createVNode("div", null, [
                                createVNode("div", { class: "text-subtitle-1 font-weight-bold" }, "Top 10 Products by Revenue"),
                                createVNode("div", { class: "text-caption text-medium-emphasis" }, "Best-selling products this period")
                              ])
                            ]),
                            createVNode(_component_apexchart, {
                              type: "bar",
                              height: "320",
                              options: unref(topProductsChartOptions),
                              series: unref(topProductsChartSeries)
                            }, null, 8, ["options", "series"])
                          ]),
                          _: 1
                        })
                      ]),
                      _: 1
                    }),
                    createVNode(VCol, {
                      cols: "12",
                      lg: "4"
                    }, {
                      default: withCtx(() => [
                        createVNode(VCard, {
                          flat: "",
                          border: "",
                          rounded: "xl",
                          class: "pa-4"
                        }, {
                          default: withCtx(() => [
                            createVNode("div", { class: "d-flex align-center ga-2 mb-3" }, [
                              createVNode(VAvatar, {
                                color: "amber-lighten-5",
                                rounded: "lg",
                                size: "36"
                              }, {
                                default: withCtx(() => [
                                  createVNode(VIcon, {
                                    color: "amber",
                                    size: "20"
                                  }, {
                                    default: withCtx(() => [
                                      createTextVNode("mdi-chart-pie")
                                    ]),
                                    _: 1
                                  })
                                ]),
                                _: 1
                              }),
                              createVNode("div", null, [
                                createVNode("div", { class: "text-subtitle-1 font-weight-bold" }, "Sales by Status"),
                                createVNode("div", { class: "text-caption text-medium-emphasis" }, "Transaction status distribution")
                              ])
                            ]),
                            createVNode(_component_apexchart, {
                              type: "donut",
                              height: "300",
                              options: unref(statusChartOptions),
                              series: unref(statusChartSeries)
                            }, null, 8, ["options", "series"])
                          ]),
                          _: 1
                        })
                      ]),
                      _: 1
                    })
                  ]),
                  _: 1
                }),
                createVNode(VRow, { class: "mb-4" }, {
                  default: withCtx(() => [
                    createVNode(VCol, {
                      cols: "12",
                      md: "6"
                    }, {
                      default: withCtx(() => [
                        createVNode(VCard, {
                          flat: "",
                          border: "",
                          rounded: "xl",
                          class: "fill-height pa-4"
                        }, {
                          default: withCtx(() => [
                            createVNode("div", { class: "d-flex align-center ga-2 mb-3" }, [
                              createVNode(VAvatar, {
                                color: "indigo-lighten-5",
                                rounded: "lg",
                                size: "36"
                              }, {
                                default: withCtx(() => [
                                  createVNode(VIcon, {
                                    color: "indigo",
                                    size: "20"
                                  }, {
                                    default: withCtx(() => [
                                      createTextVNode("mdi-calendar-week")
                                    ]),
                                    _: 1
                                  })
                                ]),
                                _: 1
                              }),
                              createVNode("div", null, [
                                createVNode("div", { class: "text-subtitle-1 font-weight-bold" }, "Sales by Day of Week"),
                                createVNode("div", { class: "text-caption text-medium-emphasis" }, "Revenue distribution across weekdays")
                              ])
                            ]),
                            createVNode(_component_apexchart, {
                              type: "bar",
                              height: "280",
                              options: unref(dowChartOptions),
                              series: unref(dowChartSeries)
                            }, null, 8, ["options", "series"])
                          ]),
                          _: 1
                        })
                      ]),
                      _: 1
                    }),
                    createVNode(VCol, {
                      cols: "12",
                      md: "6"
                    }, {
                      default: withCtx(() => [
                        createVNode(VCard, {
                          flat: "",
                          border: "",
                          rounded: "xl",
                          class: "fill-height pa-4"
                        }, {
                          default: withCtx(() => [
                            createVNode("div", { class: "d-flex align-center ga-2 mb-3" }, [
                              createVNode(VAvatar, {
                                color: "orange-lighten-5",
                                rounded: "lg",
                                size: "36"
                              }, {
                                default: withCtx(() => [
                                  createVNode(VIcon, {
                                    color: "orange",
                                    size: "20"
                                  }, {
                                    default: withCtx(() => [
                                      createTextVNode("mdi-clock-outline")
                                    ]),
                                    _: 1
                                  })
                                ]),
                                _: 1
                              }),
                              createVNode("div", null, [
                                createVNode("div", { class: "text-subtitle-1 font-weight-bold" }, "Peak Hours"),
                                createVNode("div", { class: "text-caption text-medium-emphasis" }, "Revenue and transactions by hour")
                              ])
                            ]),
                            createVNode(_component_apexchart, {
                              type: "bar",
                              height: "280",
                              options: unref(hourlyChartOptions),
                              series: unref(hourlyChartSeries)
                            }, null, 8, ["options", "series"])
                          ]),
                          _: 1
                        })
                      ]),
                      _: 1
                    })
                  ]),
                  _: 1
                }),
                createVNode(VCard, {
                  flat: "",
                  border: "",
                  rounded: "xl",
                  class: "mb-4 overflow-hidden"
                }, {
                  default: withCtx(() => [
                    createVNode("div", { class: "d-flex align-center ga-2 pa-4 pb-2 flex-wrap" }, [
                      createVNode(VAvatar, {
                        color: "blue-grey-lighten-5",
                        rounded: "lg",
                        size: "36"
                      }, {
                        default: withCtx(() => [
                          createVNode(VIcon, {
                            color: "blue-grey",
                            size: "20"
                          }, {
                            default: withCtx(() => [
                              createTextVNode("mdi-chart-bar")
                            ]),
                            _: 1
                          })
                        ]),
                        _: 1
                      }),
                      createVNode("div", { class: "me-auto" }, [
                        createVNode("div", { class: "text-subtitle-1 font-weight-bold" }, "Time of Day Breakdown"),
                        createVNode("div", { class: "text-caption text-medium-emphasis" }, "Revenue and transactions grouped by time-of-day ranges")
                      ]),
                      unref(busiestRange) ? (openBlock(), createBlock(VChip, {
                        key: 0,
                        size: "small",
                        color: "amber",
                        variant: "tonal",
                        label: ""
                      }, {
                        default: withCtx(() => [
                          createVNode(VIcon, {
                            start: "",
                            size: "14"
                          }, {
                            default: withCtx(() => [
                              createTextVNode("mdi-trophy")
                            ]),
                            _: 1
                          }),
                          createTextVNode(" Busiest: " + toDisplayString(unref(busiestRange).label) + " (" + toDisplayString(unref(busiestRange).sub) + ") ", 1)
                        ]),
                        _: 1
                      })) : createCommentVNode("", true)
                    ]),
                    createVNode(VDivider),
                    createVNode("div", { class: "peak-hours-layout" }, [
                      createVNode("div", { class: "peak-hours-layout__chart" }, [
                        createVNode(_component_apexchart, {
                          type: "bar",
                          height: "340",
                          options: unref(timeOfDayChartOptions),
                          series: unref(timeOfDayChartSeries)
                        }, null, 8, ["options", "series"])
                      ]),
                      createVNode("div", { class: "peak-hours-layout__ranges" }, [
                        (openBlock(true), createBlock(Fragment, null, renderList(unref(timeRangeStats), (r) => {
                          return openBlock(), createBlock("div", {
                            key: r.label,
                            class: ["time-range-card", { "time-range-card--peak": r.label === unref(busiestRange)?.label }]
                          }, [
                            createVNode("div", {
                              class: "time-range-card__bar",
                              style: { background: r.color }
                            }, null, 4),
                            createVNode("div", { class: "time-range-card__body" }, [
                              createVNode("div", { class: "d-flex align-center ga-1" }, [
                                createVNode(VIcon, {
                                  size: "16",
                                  color: r.label === unref(busiestRange)?.label ? "amber" : void 0
                                }, {
                                  default: withCtx(() => [
                                    createTextVNode(toDisplayString(r.icon), 1)
                                  ]),
                                  _: 2
                                }, 1032, ["color"]),
                                createVNode("span", { class: "text-subtitle-2 font-weight-bold" }, toDisplayString(r.label), 1),
                                r.label === unref(busiestRange)?.label ? (openBlock(), createBlock(VIcon, {
                                  key: 0,
                                  size: "14",
                                  color: "amber"
                                }, {
                                  default: withCtx(() => [
                                    createTextVNode("mdi-trophy")
                                  ]),
                                  _: 1
                                })) : createCommentVNode("", true),
                                createVNode(VSpacer),
                                createVNode("span", {
                                  class: "text-caption text-medium-emphasis",
                                  style: { "font-size": "11px" }
                                }, toDisplayString(r.sub), 1)
                              ]),
                              createVNode("div", { class: "d-flex align-center ga-2 mt-2" }, [
                                createVNode("div", { class: "text-subtitle-1 font-weight-bold" }, toDisplayString(unref(currency)(r.revenue)), 1),
                                createVNode(VSpacer),
                                createVNode("span", {
                                  class: "text-caption",
                                  style: { "font-size": "10px" }
                                }, toDisplayString(r.revenuePct.toFixed(0)) + "% rev", 1)
                              ]),
                              createVNode("div", { class: "time-range-card__progress mt-1" }, [
                                createVNode("div", {
                                  class: "time-range-card__progress-fill",
                                  style: { width: r.revenuePct + "%", background: r.color }
                                }, null, 4)
                              ]),
                              createVNode("div", {
                                class: "text-caption text-medium-emphasis mt-1",
                                style: { "font-size": "10px" }
                              }, toDisplayString(r.count) + " txn" + toDisplayString(r.count === 1 ? "" : "s") + " · " + toDisplayString(r.sharePct.toFixed(0)) + "% of day ", 1)
                            ])
                          ], 2);
                        }), 128))
                      ])
                    ])
                  ]),
                  _: 1
                }),
                createVNode(VCard, {
                  flat: "",
                  border: "",
                  rounded: "xl",
                  class: "overflow-hidden mb-4"
                }, {
                  default: withCtx(() => [
                    createVNode("div", { class: "d-flex align-center ga-2 pa-4 pb-2" }, [
                      createVNode(VAvatar, {
                        color: "deep-purple-lighten-5",
                        rounded: "lg",
                        size: "36"
                      }, {
                        default: withCtx(() => [
                          createVNode(VIcon, {
                            color: "deep-purple",
                            size: "20"
                          }, {
                            default: withCtx(() => [
                              createTextVNode("mdi-account-tie-outline")
                            ]),
                            _: 1
                          })
                        ]),
                        _: 1
                      }),
                      createVNode("div", null, [
                        createVNode("div", { class: "text-subtitle-1 font-weight-bold" }, "Cashier Performance"),
                        createVNode("div", { class: "text-caption text-medium-emphasis" }, "Sales activity by cashier")
                      ])
                    ]),
                    createVNode(VTable, {
                      density: "compact",
                      hover: ""
                    }, {
                      default: withCtx(() => [
                        createVNode("thead", { class: "bg-grey-lighten-4" }, [
                          createVNode("tr", null, [
                            createVNode("th", { class: "text-left" }, "Cashier"),
                            createVNode("th", { class: "text-right" }, "Transactions"),
                            createVNode("th", { class: "text-right" }, "Revenue"),
                            createVNode("th", { class: "text-right" }, "Avg Order"),
                            createVNode("th", { class: "text-right" }, "Items Sold"),
                            createVNode("th", { class: "text-right" }, "% of Revenue"),
                            createVNode("th", { style: { "width": "120px" } }, "Performance")
                          ])
                        ]),
                        createVNode("tbody", null, [
                          (openBlock(true), createBlock(Fragment, null, renderList(unref(cashierPerformance), (c, idx) => {
                            return openBlock(), createBlock("tr", { key: idx }, [
                              createVNode("td", null, [
                                createVNode("div", { class: "d-flex align-center ga-2" }, [
                                  createVNode(VAvatar, {
                                    size: "32",
                                    rounded: "lg",
                                    color: cashierColor(idx),
                                    variant: "tonal"
                                  }, {
                                    default: withCtx(() => [
                                      createVNode("span", { class: "text-body-2 font-weight-bold" }, toDisplayString((c.name || "?").charAt(0).toUpperCase()), 1)
                                    ]),
                                    _: 2
                                  }, 1032, ["color"]),
                                  createVNode("span", { class: "text-body-2 font-weight-medium" }, toDisplayString(c.name || "Unknown"), 1)
                                ])
                              ]),
                              createVNode("td", { class: "text-right text-body-2" }, toDisplayString(c.count), 1),
                              createVNode("td", { class: "text-right font-weight-bold text-success" }, toDisplayString(unref(currency)(c.revenue)), 1),
                              createVNode("td", { class: "text-right text-body-2" }, toDisplayString(unref(currency)(c.avgOrder)), 1),
                              createVNode("td", { class: "text-right text-body-2" }, toDisplayString(unref(formatNumber)(c.items)), 1),
                              createVNode("td", { class: "text-right text-body-2 text-medium-emphasis" }, toDisplayString(c.share.toFixed(1)) + "%", 1),
                              createVNode("td", null, [
                                createVNode(VProgressLinear, {
                                  "model-value": c.share,
                                  color: "primary",
                                  height: "6",
                                  rounded: ""
                                }, null, 8, ["model-value"])
                              ])
                            ]);
                          }), 128)),
                          unref(cashierPerformance).length === 0 ? (openBlock(), createBlock("tr", { key: 0 }, [
                            createVNode("td", {
                              colspan: "7",
                              class: "text-center py-8 text-medium-emphasis"
                            }, "No cashier data for this period.")
                          ])) : createCommentVNode("", true)
                        ])
                      ]),
                      _: 1
                    })
                  ]),
                  _: 1
                })
              ], 64)) : createCommentVNode("", true),
              createVNode(VDialog, {
                modelValue: unref(detailsDialog),
                "onUpdate:modelValue": ($event) => isRef(detailsDialog) ? detailsDialog.value = $event : null,
                "max-width": "700"
              }, {
                default: withCtx(() => [
                  createVNode(VCard, { rounded: "xl" }, {
                    default: withCtx(() => [
                      createVNode(VCardTitle, { class: "d-flex align-center justify-space-between pa-4" }, {
                        default: withCtx(() => [
                          createVNode("div", { class: "d-flex align-center ga-3" }, [
                            createVNode(VAvatar, {
                              color: statusColor(unref(selectedSale)?.status),
                              variant: "tonal",
                              rounded: "lg",
                              size: "40"
                            }, {
                              default: withCtx(() => [
                                createVNode(VIcon, {
                                  icon: statusIcon(unref(selectedSale)?.status)
                                }, null, 8, ["icon"])
                              ]),
                              _: 1
                            }, 8, ["color"]),
                            createVNode("div", null, [
                              createVNode("div", { class: "text-h6 font-weight-bold" }, toDisplayString(unref(selectedSale)?.transaction_number), 1),
                              createVNode("div", { class: "text-caption text-medium-emphasis" }, toDisplayString(unref(datetime)(unref(selectedSale)?.created_at)), 1)
                            ])
                          ]),
                          createVNode(VBtn, {
                            variant: "text",
                            icon: "mdi-close",
                            size: "small",
                            onClick: ($event) => detailsDialog.value = false
                          }, null, 8, ["onClick"])
                        ]),
                        _: 1
                      }),
                      unref(selectedSale) ? (openBlock(), createBlock(VCardText, {
                        key: 0,
                        class: "pt-2"
                      }, {
                        default: withCtx(() => [
                          createVNode("div", { class: "d-flex align-center ga-2 mb-4 flex-wrap" }, [
                            createVNode(VChip, {
                              size: "small",
                              color: statusColor(unref(selectedSale).status),
                              variant: "tonal",
                              label: "",
                              class: "text-capitalize"
                            }, {
                              default: withCtx(() => [
                                createTextVNode(toDisplayString(formatStatus(unref(selectedSale).status)), 1)
                              ]),
                              _: 1
                            }, 8, ["color"]),
                            unref(selectedSale).payment_method ? (openBlock(), createBlock(VChip, {
                              key: 0,
                              size: "small",
                              variant: "tonal",
                              color: paymentColor(unref(selectedSale).payment_method)
                            }, {
                              default: withCtx(() => [
                                createTextVNode(toDisplayString(unref(selectedSale).payment_method_display || unref(selectedSale).payment_method), 1)
                              ]),
                              _: 1
                            }, 8, ["color"])) : createCommentVNode("", true),
                            createVNode("span", { class: "text-body-2 text-medium-emphasis" }, toDisplayString(unref(selectedSale).customer_name || "Walk-in") + " · " + toDisplayString(unref(selectedSale).cashier_name || "—") + " · " + toDisplayString(unref(selectedSale).branch_name || "—"), 1)
                          ]),
                          createVNode("div", { class: "text-subtitle-2 font-weight-bold mb-2" }, "Line Items (" + toDisplayString(unref(selectedSale).items?.length || 0) + ")", 1),
                          createVNode(VTable, {
                            density: "compact",
                            class: "mb-4 rounded border"
                          }, {
                            default: withCtx(() => [
                              createVNode("thead", { class: "bg-grey-lighten-4" }, [
                                createVNode("tr", null, [
                                  createVNode("th", { class: "text-left" }, "Product"),
                                  createVNode("th", { class: "text-right" }, "Qty"),
                                  createVNode("th", { class: "text-right" }, "Price"),
                                  createVNode("th", { class: "text-right" }, "Total")
                                ])
                              ]),
                              createVNode("tbody", null, [
                                (openBlock(true), createBlock(Fragment, null, renderList(unref(selectedSale).items, (item) => {
                                  return openBlock(), createBlock("tr", {
                                    key: item.id
                                  }, [
                                    createVNode("td", null, [
                                      createVNode("div", { class: "text-body-2 font-weight-medium" }, toDisplayString(item.product_name), 1),
                                      createVNode("div", { class: "text-caption text-disabled" }, toDisplayString(item.product_sku), 1)
                                    ]),
                                    createVNode("td", { class: "text-right text-body-2" }, toDisplayString(unref(formatNumber)(item.quantity)), 1),
                                    createVNode("td", { class: "text-right text-body-2" }, toDisplayString(unref(currency)(item.unit_price)), 1),
                                    createVNode("td", { class: "text-right text-body-2 font-weight-medium" }, toDisplayString(unref(currency)(item.line_total)), 1)
                                  ]);
                                }), 128))
                              ])
                            ]),
                            _: 1
                          }),
                          createVNode("div", { class: "d-flex flex-column align-end ga-1" }, [
                            createVNode("div", {
                              class: "d-flex justify-space-between",
                              style: { "width": "220px" }
                            }, [
                              createVNode("span", { class: "text-body-2 text-medium-emphasis" }, "Subtotal"),
                              createVNode("span", { class: "text-body-2 font-weight-medium" }, toDisplayString(unref(currency)(unref(selectedSale).subtotal)), 1)
                            ]),
                            createVNode("div", {
                              class: "d-flex justify-space-between",
                              style: { "width": "220px" }
                            }, [
                              createVNode("span", { class: "text-body-2 text-medium-emphasis" }, "Discount"),
                              createVNode("span", { class: "text-body-2 font-weight-medium text-error" }, "-" + toDisplayString(unref(currency)(unref(selectedSale).discount)), 1)
                            ]),
                            createVNode("div", {
                              class: "d-flex justify-space-between",
                              style: { "width": "220px" }
                            }, [
                              createVNode("span", { class: "text-body-2 text-medium-emphasis" }, "Tax"),
                              createVNode("span", { class: "text-body-2 font-weight-medium" }, toDisplayString(unref(currency)(unref(selectedSale).tax)), 1)
                            ]),
                            createVNode(VDivider, {
                              class: "my-1",
                              style: { "width": "220px" }
                            }),
                            createVNode("div", {
                              class: "d-flex justify-space-between",
                              style: { "width": "220px" }
                            }, [
                              createVNode("span", { class: "text-subtitle-2 font-weight-bold" }, "Total"),
                              createVNode("span", { class: "text-subtitle-1 font-weight-bold text-primary" }, toDisplayString(unref(currency)(unref(selectedSale).total)), 1)
                            ])
                          ])
                        ]),
                        _: 1
                      })) : createCommentVNode("", true)
                    ]),
                    _: 1
                  })
                ]),
                _: 1
              }, 8, ["modelValue", "onUpdate:modelValue"]),
              createVNode(VDialog, {
                modelValue: unref(customDialog),
                "onUpdate:modelValue": ($event) => isRef(customDialog) ? customDialog.value = $event : null,
                "max-width": "420"
              }, {
                default: withCtx(() => [
                  createVNode(VCard, null, {
                    default: withCtx(() => [
                      createVNode(VCardTitle, { class: "d-flex align-center justify-space-between" }, {
                        default: withCtx(() => [
                          createVNode("span", { class: "text-h6" }, "Custom Date Range"),
                          createVNode(VBtn, {
                            variant: "text",
                            icon: "mdi-close",
                            size: "small",
                            onClick: ($event) => customDialog.value = false
                          }, null, 8, ["onClick"])
                        ]),
                        _: 1
                      }),
                      createVNode(VCardText, null, {
                        default: withCtx(() => [
                          createVNode(VTextField, {
                            modelValue: unref(customFrom),
                            "onUpdate:modelValue": ($event) => isRef(customFrom) ? customFrom.value = $event : null,
                            type: "date",
                            label: "From Date",
                            variant: "outlined",
                            density: "comfortable",
                            "hide-details": "",
                            class: "mb-4"
                          }, null, 8, ["modelValue", "onUpdate:modelValue"]),
                          createVNode(VTextField, {
                            modelValue: unref(customTo),
                            "onUpdate:modelValue": ($event) => isRef(customTo) ? customTo.value = $event : null,
                            type: "date",
                            label: "To Date",
                            variant: "outlined",
                            density: "comfortable",
                            "hide-details": ""
                          }, null, 8, ["modelValue", "onUpdate:modelValue"])
                        ]),
                        _: 1
                      }),
                      createVNode(VCardActions, { class: "px-4 pb-4" }, {
                        default: withCtx(() => [
                          createVNode(VSpacer),
                          createVNode(VBtn, {
                            variant: "text",
                            onClick: ($event) => customDialog.value = false
                          }, {
                            default: withCtx(() => [
                              createTextVNode("Cancel")
                            ]),
                            _: 1
                          }, 8, ["onClick"]),
                          createVNode(VBtn, {
                            variant: "flat",
                            color: "primary",
                            onClick: applyCustomRange
                          }, {
                            default: withCtx(() => [
                              createTextVNode("Apply")
                            ]),
                            _: 1
                          })
                        ]),
                        _: 1
                      })
                    ]),
                    _: 1
                  })
                ]),
                _: 1
              }, 8, ["modelValue", "onUpdate:modelValue"])
            ];
          }
        }),
        _: 1
      }, _parent));
    };
  }
};
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/sales.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const sales = /* @__PURE__ */ _export_sfc(_sfc_main, [["__scopeId", "data-v-b687d18f"]]);

export { sales as default };
//# sourceMappingURL=sales-t_8H8XPf.mjs.map
