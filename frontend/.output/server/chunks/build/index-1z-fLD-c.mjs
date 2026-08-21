import { ref, computed, watch, resolveComponent, mergeProps, withCtx, unref, createTextVNode, toDisplayString, openBlock, createBlock, Fragment, renderList, createVNode, isRef, createCommentVNode, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent, ssrRenderList, ssrInterpolate, ssrRenderClass, ssrRenderStyle } from 'vue/server-renderer';
import { u as useFormat } from './useFormat-C--cm8if.mjs';
import { M as useToast, U as VBtnGroup, g as VBtn, E as VProgressCircular, d as VIcon, C as VTextField, S as VSelect, x as VDialog, k as VCard, y as VCardTitle, z as VCardText, i as VRow, j as VCol, Z as VCombobox, D as VCardActions, f as VSpacer } from './server.mjs';
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

const itemsPerPage = 15;
const _sfc_main = {
  __name: "index",
  __ssrInlineRender: true,
  setup(__props) {
    const { currency } = useFormat();
    const { success, error: errorToast } = useToast();
    function formatMoney(v) {
      return currency(Number(v) || 0);
    }
    function formatDate(v) {
      if (!v) return "—";
      return new Date(v).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
    }
    const categoryColors = [
      "#3478f6",
      "#10b981",
      "#f59e0b",
      "#f43f5e",
      "#7C4DFF",
      "#00B8D4",
      "#8B5CF6",
      "#EC4899",
      "#14B8A6",
      "#F97316"
    ];
    const categoryChipClasses = ["blue", "green", "amber", "rose", "purple", "teal", "indigo", "pink", "mint", "orange"];
    function catIndex(name) {
      if (!name) return 0;
      let h = 0;
      for (let i = 0; i < name.length; i++) h = (h << 5) - h + name.charCodeAt(i) | 0;
      return Math.abs(h) % categoryChipClasses.length;
    }
    function methodIcon(m) {
      const icons = { cash: "mdi-cash", mpesa: "mdi-cellphone", card: "mdi-credit-card", bank_transfer: "mdi-bank", cheque: "mdi-file-document-outline" };
      return icons[m] || "mdi-cash";
    }
    function statusClass(s) {
      const map = { "Unpaid": "unpaid", "Pending Approval": "pending", "Approved": "approved", "Paid": "paid", "Cancelled": "cancelled" };
      return map[s] || "unpaid";
    }
    const periodOptions = [
      { label: "Today", value: "today", short: "Today" },
      { label: "Last 7 days", value: "7d", short: "7D" },
      { label: "Last 30 days", value: "30d", short: "30D" },
      { label: "This month", value: "thisMonth", short: "Month" },
      { label: "Last 90 days", value: "90d", short: "90D" }
    ];
    const period = ref("30d");
    const customRange = ref({ from: "", to: "" });
    const customRangeDialog = ref(false);
    const loading = ref(false);
    const saving = ref(false);
    const togglingId = ref(null);
    const expenses = ref([]);
    const activeTab = ref("all");
    const searchText = ref("");
    const categoryFilter = ref(null);
    const methodFilter = ref(null);
    const formDialog = ref(false);
    const editing = ref(false);
    const editingId = ref(null);
    const page = ref(1);
    const defaultCategories = ["Rent", "Utilities", "Salaries", "Supplies", "Marketing", "Transport", "Maintenance", "Miscellaneous", "Insurance", "Legal", "Equipment"];
    const methodList = ["cash", "mpesa", "card", "bank_transfer", "cheque"];
    const customCategories = ref([]);
    const form = ref({ description: "", amount: 0, cost_price: 0, retail_price: 0, category: "Miscellaneous", date: (/* @__PURE__ */ new Date()).toISOString().slice(0, 10), payment_method: "cash", vendor: "", reference: "" });
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
      if (key === "custom" && customRange.value.from && customRange.value.to) {
        const s = /* @__PURE__ */ new Date(customRange.value.from + "T00:00:00");
        const e = /* @__PURE__ */ new Date(customRange.value.to + "T23:59:59.999");
        return [s, e];
      }
      return [new Date(2020, 0, 1), end];
    }
    function selectPeriod(val) {
      if (val === "custom") {
        openCustomRange();
      } else {
        period.value = val;
      }
    }
    function openCustomRange() {
      if (!customRange.value.from) {
        const now = /* @__PURE__ */ new Date();
        const from = new Date(now);
        from.setDate(from.getDate() - 30);
        customRange.value.from = from.toISOString().slice(0, 10);
        customRange.value.to = now.toISOString().slice(0, 10);
      }
      customRangeDialog.value = true;
    }
    function applyCustomRange() {
      if (customRange.value.from && customRange.value.to) {
        period.value = "custom";
        customRangeDialog.value = false;
      }
    }
    const customRangeDays = computed(() => {
      if (!customRange.value.from || !customRange.value.to) return 0;
      const ms = new Date(customRange.value.to) - new Date(customRange.value.from);
      return Math.max(0, Math.round(ms / 864e5) + 1);
    });
    const inRange = computed(() => {
      const [start, end] = resolveRange(period.value);
      return expenses.value.filter((e) => {
        const d = /* @__PURE__ */ new Date((e.date || "").slice(0, 10) + "T00:00:00");
        return d >= start && d <= end;
      });
    });
    const filtered = computed(() => {
      let list = inRange.value;
      if (searchText.value) {
        const s = searchText.value.toLowerCase();
        list = list.filter(
          (e) => e.description?.toLowerCase().includes(s) || e.vendor?.toLowerCase().includes(s) || e.expense_number?.toLowerCase().includes(s)
        );
      }
      if (categoryFilter.value) list = list.filter((e) => e.category === categoryFilter.value);
      if (methodFilter.value) list = list.filter((e) => e.payment_method === methodFilter.value);
      return list.slice().sort((a, b) => new Date((b.date || "").slice(0, 10)) - new Date((a.date || "").slice(0, 10)));
    });
    const categoryList = computed(() => {
      const fromData = [...new Set(expenses.value.map((e) => e.category).filter(Boolean))];
      const all = [.../* @__PURE__ */ new Set([...defaultCategories, ...customCategories.value, ...fromData])];
      return all.sort();
    });
    const totalPages = computed(() => Math.max(1, Math.ceil(filtered.value.length / itemsPerPage)));
    const pagedItems = computed(() => {
      const start = (page.value - 1) * itemsPerPage;
      return filtered.value.slice(start, start + itemsPerPage);
    });
    const recentItems = computed(() => inRange.value.slice().sort((a, b) => new Date((b.date || "").slice(0, 10)) - new Date((a.date || "").slice(0, 10))).slice(0, 10));
    const kpis = computed(() => {
      const items = inRange.value;
      const total = items.reduce((s, e) => s + Number(e.amount), 0);
      const count = items.length;
      const now = /* @__PURE__ */ new Date();
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
      const thisMonth = expenses.value.filter((e) => /* @__PURE__ */ new Date((e.date || "").slice(0, 10) + "T00:00:00") >= monthStart).reduce((s, e) => s + Number(e.amount), 0);
      const [ps, pe] = resolveRange(period.value);
      const days = Math.ceil((pe - ps) / 864e5) || 1;
      const dailyAvg = total / days;
      const catMap = {};
      items.forEach((e) => {
        const c = e.category || "Uncategorized";
        catMap[c] = (catMap[c] || 0) + Number(e.amount);
      });
      const catEntries = Object.entries(catMap).sort((a, b) => b[1] - a[1]);
      const topCategory = catEntries[0]?.[0] || "";
      const topCategoryPct = total > 0 ? (catEntries[0]?.[1] || 0) / total * 100 : 0;
      const categoryCount = Object.keys(catMap).length;
      const vendorSet = new Set(items.map((e) => e.vendor).filter(Boolean));
      const vendorCount = vendorSet.size;
      const largestEntry = items.slice().sort((a, b) => Number(b.amount) - Number(a.amount))[0];
      const largest = largestEntry ? Number(largestEntry.amount) : 0;
      const largestCat = largestEntry?.category || "";
      const [start] = resolveRange(period.value);
      const prevEnd = new Date(start);
      prevEnd.setSeconds(prevEnd.getSeconds() - 1);
      const prevStart = new Date(prevEnd);
      const rangeDays = Math.ceil((pe - ps) / 864e5) || 1;
      prevStart.setDate(prevStart.getDate() - rangeDays);
      const prevTotal = expenses.value.filter((e) => {
        const d = /* @__PURE__ */ new Date((e.date || "").slice(0, 10) + "T00:00:00");
        return d >= prevStart && d <= prevEnd;
      }).reduce((s, e) => s + Number(e.amount), 0);
      const change = prevTotal > 0 ? (total - prevTotal) / prevTotal * 100 : total > 0 ? 100 : 0;
      return { total, count, thisMonth, dailyAvg, topCategory, topCategoryPct, categoryCount, vendorCount, largest, largestCat, change };
    });
    const categoryStats = computed(() => {
      const items = inRange.value;
      const map = {};
      items.forEach((e) => {
        const c = e.category || "Uncategorized";
        if (!map[c]) map[c] = { name: c, count: 0, total: 0 };
        map[c].count++;
        map[c].total += Number(e.amount);
      });
      const total = items.reduce((s, e) => s + Number(e.amount), 0);
      return Object.values(map).map((c) => ({ ...c, avg: c.total / c.count, pct: total > 0 ? c.total / total * 100 : 0 })).sort((a, b) => b.total - a.total);
    });
    const vendorStats = computed(() => {
      const items = inRange.value;
      const map = {};
      items.forEach((e) => {
        const v = e.vendor || "Unknown";
        if (!map[v]) map[v] = { name: v, count: 0, total: 0, cats: /* @__PURE__ */ new Set() };
        map[v].count++;
        map[v].total += Number(e.amount);
        if (e.category) map[v].cats.add(e.category);
      });
      return Object.values(map).map((v) => ({ name: v.name, count: v.count, total: v.total, avg: v.total / v.count, categories: Array.from(v.cats).join(", ") })).sort((a, b) => b.total - a.total);
    });
    const tabs = computed(() => [
      { id: "all", label: "All Expenses", icon: "mdi-receipt-text-outline", count: filtered.value.length },
      { id: "category", label: "By Category", icon: "mdi-tag-multiple", count: categoryStats.value.length },
      { id: "vendor", label: "By Vendor", icon: "mdi-account-group", count: vendorStats.value.length },
      { id: "recent", label: "Recent", icon: "mdi-clock-outline", count: recentItems.value.length }
    ]);
    function localDateKey(d) {
      const dt = d instanceof Date ? d : new Date(d);
      const y = dt.getFullYear();
      const m = String(dt.getMonth() + 1).padStart(2, "0");
      const day = String(dt.getDate()).padStart(2, "0");
      return `${y}-${m}-${day}`;
    }
    const trendData = computed(() => {
      const [start, end] = resolveRange(period.value);
      const days = Math.min(Math.ceil((end - start) / 864e5), 90);
      const buckets = {};
      for (let i = days - 1; i >= 0; i--) {
        const d = new Date(start);
        d.setDate(d.getDate() + i);
        const key = localDateKey(d);
        buckets[key] = 0;
      }
      inRange.value.forEach((e) => {
        const key = (e.date || "").slice(0, 10);
        if (key in buckets) buckets[key] += Number(e.amount);
      });
      const keys = Object.keys(buckets).sort();
      return { keys, data: keys.map((k) => Math.round(buckets[k])) };
    });
    const trendSeries = computed(() => [{ name: "Expenses", data: trendData.value.data }]);
    const trendOptions = computed(() => ({
      chart: { type: "area", toolbar: { show: false }, fontFamily: "inherit" },
      colors: ["#f43f5e"],
      stroke: { curve: "smooth", width: 2 },
      fill: { type: "gradient", gradient: { shadeIntensity: 1, opacityFrom: 0.3, opacityTo: 0.05, stops: [0, 100] } },
      dataLabels: { enabled: false },
      xaxis: {
        categories: trendData.value.keys.map((k) => new Date(k).toLocaleDateString("en-GB", { day: "numeric", month: "short" })),
        labels: { style: { fontSize: "11px" }, rotate: 0, hideOverlappingLabels: true },
        axisBorder: { show: false },
        axisTicks: { show: false }
      },
      yaxis: { decimalsInFloat: 0, labels: { formatter: (v) => Math.round(Number(v)).toLocaleString("en-GB"), style: { fontSize: "11px" } } },
      grid: { borderColor: "rgba(127,127,127,0.1)", strokeDashArray: 4, padding: { left: 0, right: 0 } },
      tooltip: { y: { formatter: (v) => "KSh" + v.toLocaleString("en-GB") } },
      legend: { show: false }
    }));
    const catDonutSeries = computed(() => categoryStats.value.map((c) => Math.round(c.total)));
    const catDonutOptions = computed(() => ({
      chart: { type: "donut", fontFamily: "inherit" },
      labels: categoryStats.value.map((c) => c.name),
      colors: categoryStats.value.slice(0, 10).map((c) => categoryColors[catIndex(c.name) % categoryColors.length]),
      legend: { position: "bottom", fontSize: "12px", markers: { size: 6 } },
      dataLabels: { enabled: true, formatter: (val) => Math.round(val) + "%" },
      stroke: { width: 0 },
      plotOptions: {
        pie: {
          donut: {
            size: "68%",
            labels: {
              show: true,
              name: { fontSize: "14px", fontWeight: 600 },
              total: { show: true, label: "Total", fontSize: "14px", fontWeight: 700, formatter: () => "KSh" + Math.round(catDonutSeries.value.reduce((s, v) => s + v, 0)).toLocaleString("en-GB") }
            }
          }
        }
      },
      tooltip: { y: { formatter: (v) => "KSh" + v.toLocaleString("en-GB") } },
      responsive: [{ breakpoint: 480, options: { legend: { position: "bottom" } } }]
    }));
    const catBarSeries = computed(() => [{ name: "Amount", data: categoryStats.value.map((c) => Math.round(c.total)) }]);
    const catBarOptions = computed(() => ({
      chart: { type: "bar", toolbar: { show: false }, fontFamily: "inherit" },
      colors: ["#F59E0B"],
      plotOptions: { bar: { borderRadius: 6, columnWidth: "50%" } },
      dataLabels: { enabled: false },
      xaxis: { categories: categoryStats.value.map((c) => c.name), labels: { style: { fontSize: "11px" }, rotate: -15 } },
      yaxis: { decimalsInFloat: 0, labels: { formatter: (v) => Math.round(Number(v)).toLocaleString("en-GB"), style: { fontSize: "11px" } } },
      grid: { borderColor: "rgba(127,127,127,0.1)", strokeDashArray: 4 },
      tooltip: { y: { formatter: (v) => "KSh" + v.toLocaleString("en-GB") } }
    }));
    const methodBarData = computed(() => {
      const map = {};
      inRange.value.forEach((e) => {
        const m = e.payment_method || "cash";
        map[m] = (map[m] || 0) + Number(e.amount);
      });
      const entries = Object.entries(map).sort((a, b) => b[1] - a[1]);
      return entries;
    });
    const methodBarSeries = computed(() => [{ name: "Amount", data: methodBarData.value.map(([, v]) => Math.round(v)) }]);
    const methodBarOptions = computed(() => ({
      chart: { type: "bar", toolbar: { show: false }, fontFamily: "inherit" },
      colors: ["#10b981"],
      plotOptions: { bar: { borderRadius: 6, columnWidth: "50%" } },
      dataLabels: { enabled: false },
      xaxis: { categories: methodBarData.value.map(([k]) => k), labels: { style: { fontSize: "11px" } } },
      yaxis: { decimalsInFloat: 0, labels: { formatter: (v) => Math.round(Number(v)).toLocaleString("en-GB"), style: { fontSize: "11px" } } },
      grid: { borderColor: "rgba(127,127,127,0.1)", strokeDashArray: 4 },
      tooltip: { y: { formatter: (v) => "KSh" + v.toLocaleString("en-GB") } }
    }));
    async function loadData() {
      loading.value = true;
      try {
        const data = await useApi()("/accounting/expenses/?page_size=500");
        expenses.value = data.results || data;
      } catch {
      } finally {
        loading.value = false;
      }
    }
    async function saveExpense() {
      saving.value = true;
      try {
        if (editing.value) {
          await useApi()(`/accounting/expenses/${editingId.value}/`, { method: "PATCH", body: form.value });
          success("Expense updated successfully");
        } else {
          await useApi()("/accounting/expenses/", { method: "POST", body: form.value });
          success("Expense recorded successfully");
        }
        formDialog.value = false;
        await loadData();
      } catch {
        errorToast(editing.value ? "Failed to update expense" : "Failed to record expense");
      } finally {
        saving.value = false;
      }
    }
    async function deleteExpense(exp) {
      if (!confirm(`Delete expense "${exp.description || exp.expense_number}"?`)) return;
      try {
        await useApi()(`/accounting/expenses/${exp.id}/`, { method: "DELETE" });
        success("Expense deleted");
        await loadData();
      } catch {
        errorToast("Failed to delete expense");
      }
    }
    async function togglePaid(exp) {
      const newStatus = exp.status === "Paid" ? "Unpaid" : "Paid";
      togglingId.value = exp.id;
      try {
        const action = newStatus === "Paid" ? "mark_paid" : "mark_unpaid";
        const data = await useApi()(`/accounting/expenses/${exp.id}/${action}/`, { method: "POST" });
        const idx = expenses.value.findIndex((e) => e.id === exp.id);
        if (idx !== -1) expenses.value[idx] = { ...expenses.value[idx], ...data };
        success(`Expense marked as ${newStatus}`);
      } catch {
        errorToast(`Failed to mark expense as ${newStatus}`);
      } finally {
        togglingId.value = null;
      }
    }
    watch([searchText, categoryFilter, methodFilter, activeTab], () => {
      page.value = 1;
    });
    return (_ctx, _push, _parent, _attrs) => {
      const _component_apexchart = resolveComponent("apexchart");
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "az-page" }, _attrs))} data-v-149dc304><div class="az-header" data-v-149dc304><div class="az-header__left" data-v-149dc304><div class="az-header__title" data-v-149dc304><h1 class="text-h5 font-weight-bold" data-v-149dc304>Operating Expenses</h1><p class="text-body-2 text-medium-emphasis" data-v-149dc304>Track, categorize and analyze business spending</p></div></div><div class="az-header__actions" data-v-149dc304>`);
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
                onClick: ($event) => selectPeriod(opt.value)
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
            _push2(ssrRenderComponent(VBtn, {
              variant: unref(period) === "custom" ? "flat" : "text",
              color: unref(period) === "custom" ? "primary" : void 0,
              size: "small",
              "prepend-icon": "mdi-calendar-clock",
              onClick: openCustomRange
            }, {
              default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                if (_push3) {
                  _push3(`Custom`);
                } else {
                  return [
                    createTextVNode("Custom")
                  ];
                }
              }),
              _: 1
            }, _parent2, _scopeId));
          } else {
            return [
              (openBlock(), createBlock(Fragment, null, renderList(periodOptions, (opt) => {
                return createVNode(VBtn, {
                  key: opt.value,
                  variant: unref(period) === opt.value ? "flat" : "text",
                  color: unref(period) === opt.value ? "primary" : void 0,
                  size: "small",
                  onClick: ($event) => selectPeriod(opt.value)
                }, {
                  default: withCtx(() => [
                    createTextVNode(toDisplayString(opt.short), 1)
                  ]),
                  _: 2
                }, 1032, ["variant", "color", "onClick"]);
              }), 64)),
              createVNode(VBtn, {
                variant: unref(period) === "custom" ? "flat" : "text",
                color: unref(period) === "custom" ? "primary" : void 0,
                size: "small",
                "prepend-icon": "mdi-calendar-clock",
                onClick: openCustomRange
              }, {
                default: withCtx(() => [
                  createTextVNode("Custom")
                ]),
                _: 1
              }, 8, ["variant", "color"])
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
        variant: "outlined",
        "prepend-icon": "mdi-tag-multiple",
        size: "small",
        to: "/expenses/categories"
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`Categories`);
          } else {
            return [
              createTextVNode("Categories")
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(ssrRenderComponent(VBtn, {
        variant: "flat",
        color: "primary",
        "prepend-icon": "mdi-plus",
        size: "small",
        to: "/expenses/new"
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`New Expense`);
          } else {
            return [
              createTextVNode("New Expense")
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`</div></div>`);
      if (unref(loading) && unref(expenses).length === 0) {
        _push(`<div class="az-loading" data-v-149dc304>`);
        _push(ssrRenderComponent(VProgressCircular, {
          indeterminate: "",
          color: "primary",
          size: "32",
          width: "3"
        }, null, _parent));
        _push(`<p class="text-body-2 text-medium-emphasis mt-3" data-v-149dc304>Loading expenses…</p></div>`);
      } else {
        _push(`<!--[--><div class="az-kpi-grid" data-v-149dc304><div class="az-kpi az-kpi--error" data-v-149dc304><div class="az-kpi__icon az-kpi__icon--error" data-v-149dc304>`);
        _push(ssrRenderComponent(VIcon, { size: "20" }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`mdi-cash-minus`);
            } else {
              return [
                createTextVNode("mdi-cash-minus")
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(`</div><div class="az-kpi__body" data-v-149dc304><p class="az-kpi__label" data-v-149dc304>Total Expenses</p><p class="az-kpi__value text-error" data-v-149dc304>${ssrInterpolate(formatMoney(unref(kpis).total))}</p><p class="az-kpi__sub" data-v-149dc304>${ssrInterpolate(unref(kpis).count)} transactions</p></div></div><div class="az-kpi az-kpi--warning" data-v-149dc304><div class="az-kpi__icon az-kpi__icon--warning" data-v-149dc304>`);
        _push(ssrRenderComponent(VIcon, { size: "20" }, {
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
        _push(`</div><div class="az-kpi__body" data-v-149dc304><p class="az-kpi__label" data-v-149dc304>This Month</p><p class="az-kpi__value text-warning" data-v-149dc304>${ssrInterpolate(formatMoney(unref(kpis).thisMonth))}</p><p class="az-kpi__sub" data-v-149dc304>${ssrInterpolate(formatMoney(unref(kpis).dailyAvg))}/day avg</p></div></div><div class="az-kpi az-kpi--info" data-v-149dc304><div class="az-kpi__icon az-kpi__icon--info" data-v-149dc304>`);
        _push(ssrRenderComponent(VIcon, { size: "20" }, {
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
        _push(`</div><div class="az-kpi__body" data-v-149dc304><p class="az-kpi__label" data-v-149dc304>Top Category</p><p class="az-kpi__value text-info" data-v-149dc304>${ssrInterpolate(unref(kpis).topCategory || "—")}</p><p class="az-kpi__sub" data-v-149dc304>${ssrInterpolate(unref(kpis).topCategoryPct.toFixed(1))}% of spend</p></div></div><div class="az-kpi az-kpi--success" data-v-149dc304><div class="az-kpi__icon az-kpi__icon--success" data-v-149dc304>`);
        _push(ssrRenderComponent(VIcon, { size: "20" }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`mdi-chart-line-variant`);
            } else {
              return [
                createTextVNode("mdi-chart-line-variant")
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(`</div><div class="az-kpi__body" data-v-149dc304><p class="az-kpi__label" data-v-149dc304>vs Last Period</p><p class="${ssrRenderClass([unref(kpis).change >= 0 ? "text-error" : "text-success", "az-kpi__value"])}" data-v-149dc304>${ssrInterpolate(unref(kpis).change >= 0 ? "+" : "")}${ssrInterpolate(unref(kpis).change.toFixed(1))}%</p><p class="az-kpi__sub" data-v-149dc304>${ssrInterpolate(unref(kpis).change >= 0 ? "Increase" : "Decrease")}</p></div></div><div class="az-kpi az-kpi--purple" data-v-149dc304><div class="az-kpi__icon az-kpi__icon--purple" data-v-149dc304>`);
        _push(ssrRenderComponent(VIcon, { size: "20" }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`mdi-bank`);
            } else {
              return [
                createTextVNode("mdi-bank")
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(`</div><div class="az-kpi__body" data-v-149dc304><p class="az-kpi__label" data-v-149dc304>Largest Single</p><p class="az-kpi__value" style="${ssrRenderStyle({ "color": "#7C4DFF" })}" data-v-149dc304>${ssrInterpolate(formatMoney(unref(kpis).largest))}</p><p class="az-kpi__sub" data-v-149dc304>${ssrInterpolate(unref(kpis).largestCat || "")}</p></div></div><div class="az-kpi az-kpi--teal" data-v-149dc304><div class="az-kpi__icon az-kpi__icon--teal" data-v-149dc304>`);
        _push(ssrRenderComponent(VIcon, { size: "20" }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`mdi-shape-outline`);
            } else {
              return [
                createTextVNode("mdi-shape-outline")
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(`</div><div class="az-kpi__body" data-v-149dc304><p class="az-kpi__label" data-v-149dc304>Categories Used</p><p class="az-kpi__value" style="${ssrRenderStyle({ "color": "#00B8D4" })}" data-v-149dc304>${ssrInterpolate(unref(kpis).categoryCount)}</p><p class="az-kpi__sub" data-v-149dc304>${ssrInterpolate(unref(kpis).vendorCount)} vendors</p></div></div></div><div class="az-chart-row az-chart-row--first" data-v-149dc304><div class="az-card az-card--two-thirds" data-v-149dc304><div class="az-card__header" data-v-149dc304><div class="az-card__header-icon az-card__header-icon--blue" data-v-149dc304>`);
        _push(ssrRenderComponent(VIcon, { size: "20" }, {
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
        _push(`</div><div data-v-149dc304><h3 class="az-card__title" data-v-149dc304>Spending Trend</h3><p class="az-card__subtitle" data-v-149dc304>Daily expenses over the selected period</p></div></div><div class="az-card__body" data-v-149dc304>`);
        _push(ssrRenderComponent(_component_apexchart, {
          type: "area",
          height: "340",
          options: unref(trendOptions),
          series: unref(trendSeries)
        }, null, _parent));
        _push(`</div></div><div class="az-card az-card--third" data-v-149dc304><div class="az-card__header" data-v-149dc304><div class="az-card__header-icon az-card__header-icon--rose" data-v-149dc304>`);
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
        _push(`</div><div data-v-149dc304><h3 class="az-card__title" data-v-149dc304>By Category</h3><p class="az-card__subtitle" data-v-149dc304>Share of total spend</p></div></div><div class="az-card__body" data-v-149dc304>`);
        _push(ssrRenderComponent(_component_apexchart, {
          type: "donut",
          height: "340",
          options: unref(catDonutOptions),
          series: unref(catDonutSeries)
        }, null, _parent));
        _push(`</div></div></div><div class="az-chart-row" data-v-149dc304><div class="az-card az-card--half" data-v-149dc304><div class="az-card__header" data-v-149dc304><div class="az-card__header-icon az-card__header-icon--amber" data-v-149dc304>`);
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
        _push(`</div><div data-v-149dc304><h3 class="az-card__title" data-v-149dc304>Category Breakdown</h3><p class="az-card__subtitle" data-v-149dc304>Spending by category (sorted)</p></div></div><div class="az-card__body" data-v-149dc304>`);
        _push(ssrRenderComponent(_component_apexchart, {
          type: "bar",
          height: "300",
          options: unref(catBarOptions),
          series: unref(catBarSeries)
        }, null, _parent));
        _push(`</div></div><div class="az-card az-card--half" data-v-149dc304><div class="az-card__header" data-v-149dc304><div class="az-card__header-icon az-card__header-icon--green" data-v-149dc304>`);
        _push(ssrRenderComponent(VIcon, { size: "20" }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`mdi-credit-card-multiple`);
            } else {
              return [
                createTextVNode("mdi-credit-card-multiple")
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(`</div><div data-v-149dc304><h3 class="az-card__title" data-v-149dc304>Payment Methods</h3><p class="az-card__subtitle" data-v-149dc304>Spend by payment method</p></div></div><div class="az-card__body" data-v-149dc304>`);
        _push(ssrRenderComponent(_component_apexchart, {
          type: "bar",
          height: "300",
          options: unref(methodBarOptions),
          series: unref(methodBarSeries)
        }, null, _parent));
        _push(`</div></div></div><div class="az-filters" data-v-149dc304>`);
        _push(ssrRenderComponent(VTextField, {
          modelValue: unref(searchText),
          "onUpdate:modelValue": ($event) => isRef(searchText) ? searchText.value = $event : null,
          "prepend-inner-icon": "mdi-magnify",
          placeholder: "Search description, vendor, reference...",
          density: "compact",
          variant: "outlined",
          "hide-details": "",
          class: "az-filters__search"
        }, null, _parent));
        _push(ssrRenderComponent(VSelect, {
          modelValue: unref(categoryFilter),
          "onUpdate:modelValue": ($event) => isRef(categoryFilter) ? categoryFilter.value = $event : null,
          items: unref(categoryList),
          density: "compact",
          variant: "outlined",
          "hide-details": "",
          label: "Category",
          clearable: "",
          class: "az-filters__select"
        }, null, _parent));
        _push(ssrRenderComponent(VSelect, {
          modelValue: unref(methodFilter),
          "onUpdate:modelValue": ($event) => isRef(methodFilter) ? methodFilter.value = $event : null,
          items: methodList,
          density: "compact",
          variant: "outlined",
          "hide-details": "",
          label: "Payment Method",
          clearable: "",
          class: "az-filters__select"
        }, null, _parent));
        if (unref(searchText) || unref(categoryFilter) || unref(methodFilter)) {
          _push(ssrRenderComponent(VBtn, {
            variant: "text",
            size: "small",
            "prepend-icon": "mdi-filter-remove",
            onClick: ($event) => {
              searchText.value = "";
              categoryFilter.value = null;
              methodFilter.value = null;
            }
          }, {
            default: withCtx((_, _push2, _parent2, _scopeId) => {
              if (_push2) {
                _push2(`Clear`);
              } else {
                return [
                  createTextVNode("Clear")
                ];
              }
            }),
            _: 1
          }, _parent));
        } else {
          _push(`<!---->`);
        }
        _push(`</div><div class="az-tabs" data-v-149dc304><!--[-->`);
        ssrRenderList(unref(tabs), (tab) => {
          _push(`<button class="${ssrRenderClass([{ "az-tab--active": unref(activeTab) === tab.id }, "az-tab"])}" data-v-149dc304>`);
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
          _push(` ${ssrInterpolate(tab.label)} <span class="az-tab__badge" data-v-149dc304>${ssrInterpolate(tab.count)}</span></button>`);
        });
        _push(`<!--]--></div>`);
        if (unref(activeTab) === "all") {
          _push(`<div class="az-table-wrap" data-v-149dc304><table class="az-table" data-v-149dc304><thead data-v-149dc304><tr data-v-149dc304><th data-v-149dc304>Expense #</th><th data-v-149dc304>Date</th><th data-v-149dc304>Description</th><th data-v-149dc304>Category</th><th data-v-149dc304>Vendor</th><th data-v-149dc304>Method</th><th data-v-149dc304>Status</th><th class="text-right" data-v-149dc304>Amount</th><th class="text-right" data-v-149dc304>Cost</th><th class="text-right" data-v-149dc304>Retail</th><th data-v-149dc304></th></tr></thead><tbody data-v-149dc304><!--[-->`);
          ssrRenderList(unref(pagedItems), (e) => {
            _push(`<tr class="az-table__row" data-v-149dc304><td class="text-medium-emphasis font-weight-medium" data-v-149dc304>${ssrInterpolate(e.expense_number)}</td><td class="text-medium-emphasis" data-v-149dc304>${ssrInterpolate(formatDate(e.date))}</td><td class="az-table__product" data-v-149dc304>${ssrInterpolate(e.description || "—")}</td><td data-v-149dc304><span class="${ssrRenderClass([`az-cat-chip--${categoryChipClasses[catIndex(e.category)]}`, "az-cat-chip"])}" data-v-149dc304>${ssrInterpolate(e.category || "Uncategorized")}</span></td><td class="text-medium-emphasis" data-v-149dc304>${ssrInterpolate(e.vendor || "—")}</td><td class="text-medium-emphasis" data-v-149dc304>`);
            _push(ssrRenderComponent(VIcon, {
              size: "14",
              class: "mr-1"
            }, {
              default: withCtx((_, _push2, _parent2, _scopeId) => {
                if (_push2) {
                  _push2(`${ssrInterpolate(methodIcon(e.payment_method))}`);
                } else {
                  return [
                    createTextVNode(toDisplayString(methodIcon(e.payment_method)), 1)
                  ];
                }
              }),
              _: 2
            }, _parent));
            _push(` ${ssrInterpolate(e.payment_method || "cash")}</td><td data-v-149dc304><span class="${ssrRenderClass([`az-status-chip--${statusClass(e.status)}`, "az-status-chip"])}" data-v-149dc304>${ssrInterpolate(e.status || "Unpaid")}</span></td><td class="text-right font-weight-bold text-error" data-v-149dc304>${ssrInterpolate(formatMoney(e.amount))}</td><td class="text-right text-medium-emphasis" data-v-149dc304>${ssrInterpolate(formatMoney(e.cost_price))}</td><td class="text-right text-medium-emphasis" data-v-149dc304>${ssrInterpolate(formatMoney(e.retail_price))}</td><td data-v-149dc304><div class="az-row-actions" data-v-149dc304>`);
            _push(ssrRenderComponent(VBtn, {
              size: "small",
              variant: e.status === "Paid" ? "flat" : "tonal",
              color: e.status === "Paid" ? "success" : "grey",
              "prepend-icon": e.status === "Paid" ? "mdi-check-circle" : "mdi-circle-outline",
              onClick: ($event) => togglePaid(e),
              loading: unref(togglingId) === e.id
            }, {
              default: withCtx((_, _push2, _parent2, _scopeId) => {
                if (_push2) {
                  _push2(`<span class="d-none d-sm-inline" data-v-149dc304${_scopeId}>${ssrInterpolate(e.status === "Paid" ? "Paid" : "Mark Paid")}</span>`);
                } else {
                  return [
                    createVNode("span", { class: "d-none d-sm-inline" }, toDisplayString(e.status === "Paid" ? "Paid" : "Mark Paid"), 1)
                  ];
                }
              }),
              _: 2
            }, _parent));
            _push(ssrRenderComponent(VBtn, {
              size: "small",
              variant: "text",
              icon: "mdi-pencil-outline",
              color: "primary",
              to: `/expenses/new?id=${e.id}`
            }, null, _parent));
            _push(ssrRenderComponent(VBtn, {
              size: "small",
              variant: "text",
              icon: "mdi-delete-outline",
              color: "error",
              onClick: ($event) => deleteExpense(e)
            }, null, _parent));
            _push(`</div></td></tr>`);
          });
          _push(`<!--]-->`);
          if (!unref(pagedItems).length) {
            _push(`<tr data-v-149dc304><td colspan="11" class="az-table__empty" data-v-149dc304>`);
            _push(ssrRenderComponent(VIcon, {
              size: "36",
              color: "grey-lighten-1"
            }, {
              default: withCtx((_, _push2, _parent2, _scopeId) => {
                if (_push2) {
                  _push2(`mdi-receipt-text-outline`);
                } else {
                  return [
                    createTextVNode("mdi-receipt-text-outline")
                  ];
                }
              }),
              _: 1
            }, _parent));
            _push(`<p class="text-body-2 mt-2 text-medium-emphasis" data-v-149dc304>No expenses found.</p></td></tr>`);
          } else {
            _push(`<!---->`);
          }
          _push(`</tbody></table>`);
          if (unref(filtered).length > itemsPerPage) {
            _push(`<div class="az-pagination" data-v-149dc304>`);
            _push(ssrRenderComponent(VBtn, {
              size: "small",
              variant: "text",
              "prepend-icon": "mdi-chevron-left",
              disabled: unref(page) === 1,
              onClick: ($event) => page.value--
            }, {
              default: withCtx((_, _push2, _parent2, _scopeId) => {
                if (_push2) {
                  _push2(`Prev`);
                } else {
                  return [
                    createTextVNode("Prev")
                  ];
                }
              }),
              _: 1
            }, _parent));
            _push(`<span class="az-pagination__info" data-v-149dc304>Page ${ssrInterpolate(unref(page))} of ${ssrInterpolate(unref(totalPages))}</span>`);
            _push(ssrRenderComponent(VBtn, {
              size: "small",
              variant: "text",
              "append-icon": "mdi-chevron-right",
              disabled: unref(page) === unref(totalPages),
              onClick: ($event) => page.value++
            }, {
              default: withCtx((_, _push2, _parent2, _scopeId) => {
                if (_push2) {
                  _push2(`Next`);
                } else {
                  return [
                    createTextVNode("Next")
                  ];
                }
              }),
              _: 1
            }, _parent));
            _push(`</div>`);
          } else {
            _push(`<!---->`);
          }
          _push(`</div>`);
        } else {
          _push(`<!---->`);
        }
        if (unref(activeTab) === "category") {
          _push(`<div class="az-table-wrap" data-v-149dc304><table class="az-table" data-v-149dc304><thead data-v-149dc304><tr data-v-149dc304><th data-v-149dc304>Rank</th><th data-v-149dc304>Category</th><th class="text-right" data-v-149dc304>Count</th><th class="text-right" data-v-149dc304>Total</th><th class="text-right" data-v-149dc304>Avg / Entry</th><th class="text-right" data-v-149dc304>% Share</th><th data-v-149dc304>Distribution</th></tr></thead><tbody data-v-149dc304><!--[-->`);
          ssrRenderList(unref(categoryStats), (c, idx) => {
            _push(`<tr class="az-table__row" data-v-149dc304><td class="font-weight-bold" data-v-149dc304>#${ssrInterpolate(idx + 1)}</td><td class="az-table__product" data-v-149dc304><div class="${ssrRenderClass([`az-cat-icon--${idx % 5}`, "az-cat-icon"])}" data-v-149dc304>${ssrInterpolate((c.name || "?").charAt(0).toUpperCase())}</div> ${ssrInterpolate(c.name || "Uncategorized")}</td><td class="text-right" data-v-149dc304>${ssrInterpolate(c.count)}</td><td class="text-right font-weight-bold text-error" data-v-149dc304>${ssrInterpolate(formatMoney(c.total))}</td><td class="text-right text-medium-emphasis" data-v-149dc304>${ssrInterpolate(formatMoney(c.avg))}</td><td class="text-right text-medium-emphasis" data-v-149dc304>${ssrInterpolate(c.pct.toFixed(1))}%</td><td data-v-149dc304><div class="az-bar-wrap" data-v-149dc304><div class="az-bar-fill az-bar-fill--error" style="${ssrRenderStyle({ width: c.pct + "%" })}" data-v-149dc304></div></div></td></tr>`);
          });
          _push(`<!--]-->`);
          if (!unref(categoryStats).length) {
            _push(`<tr data-v-149dc304><td colspan="7" class="az-table__empty" data-v-149dc304>`);
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
            _push(`<p class="text-body-2 mt-2 text-medium-emphasis" data-v-149dc304>No categories found.</p></td></tr>`);
          } else {
            _push(`<!---->`);
          }
          _push(`</tbody></table></div>`);
        } else {
          _push(`<!---->`);
        }
        if (unref(activeTab) === "vendor") {
          _push(`<div class="az-table-wrap" data-v-149dc304><table class="az-table" data-v-149dc304><thead data-v-149dc304><tr data-v-149dc304><th data-v-149dc304>Rank</th><th data-v-149dc304>Vendor</th><th class="text-right" data-v-149dc304>Count</th><th class="text-right" data-v-149dc304>Total Paid</th><th class="text-right" data-v-149dc304>Avg / Entry</th><th data-v-149dc304>Categories</th></tr></thead><tbody data-v-149dc304><!--[-->`);
          ssrRenderList(unref(vendorStats), (v, idx) => {
            _push(`<tr class="az-table__row" data-v-149dc304><td class="font-weight-bold" data-v-149dc304>#${ssrInterpolate(idx + 1)}</td><td class="az-table__product" data-v-149dc304><div class="az-cat-icon az-cat-icon--4" data-v-149dc304>${ssrInterpolate((v.name || "?").charAt(0).toUpperCase())}</div> ${ssrInterpolate(v.name || "Unknown")}</td><td class="text-right" data-v-149dc304>${ssrInterpolate(v.count)}</td><td class="text-right font-weight-bold text-error" data-v-149dc304>${ssrInterpolate(formatMoney(v.total))}</td><td class="text-right text-medium-emphasis" data-v-149dc304>${ssrInterpolate(formatMoney(v.avg))}</td><td class="text-medium-emphasis" data-v-149dc304>${ssrInterpolate(v.categories)}</td></tr>`);
          });
          _push(`<!--]-->`);
          if (!unref(vendorStats).length) {
            _push(`<tr data-v-149dc304><td colspan="6" class="az-table__empty" data-v-149dc304>`);
            _push(ssrRenderComponent(VIcon, {
              size: "36",
              color: "grey-lighten-1"
            }, {
              default: withCtx((_, _push2, _parent2, _scopeId) => {
                if (_push2) {
                  _push2(`mdi-account-off`);
                } else {
                  return [
                    createTextVNode("mdi-account-off")
                  ];
                }
              }),
              _: 1
            }, _parent));
            _push(`<p class="text-body-2 mt-2 text-medium-emphasis" data-v-149dc304>No vendor data.</p></td></tr>`);
          } else {
            _push(`<!---->`);
          }
          _push(`</tbody></table></div>`);
        } else {
          _push(`<!---->`);
        }
        if (unref(activeTab) === "recent") {
          _push(`<div class="az-table-wrap" data-v-149dc304><table class="az-table" data-v-149dc304><thead data-v-149dc304><tr data-v-149dc304><th data-v-149dc304>Expense #</th><th data-v-149dc304>Date</th><th data-v-149dc304>Description</th><th data-v-149dc304>Category</th><th data-v-149dc304>Vendor</th><th class="text-right" data-v-149dc304>Amount</th></tr></thead><tbody data-v-149dc304><!--[-->`);
          ssrRenderList(unref(recentItems), (e) => {
            _push(`<tr class="az-table__row" data-v-149dc304><td class="text-medium-emphasis font-weight-medium" data-v-149dc304>${ssrInterpolate(e.expense_number)}</td><td class="text-medium-emphasis" data-v-149dc304>${ssrInterpolate(formatDate(e.date))}</td><td class="az-table__product" data-v-149dc304>${ssrInterpolate(e.description || "—")}</td><td data-v-149dc304><span class="${ssrRenderClass([`az-cat-chip--${categoryChipClasses[catIndex(e.category)]}`, "az-cat-chip"])}" data-v-149dc304>${ssrInterpolate(e.category || "Uncategorized")}</span></td><td class="text-medium-emphasis" data-v-149dc304>${ssrInterpolate(e.vendor || "—")}</td><td class="text-right font-weight-bold text-error" data-v-149dc304>${ssrInterpolate(formatMoney(e.amount))}</td></tr>`);
          });
          _push(`<!--]-->`);
          if (!unref(recentItems).length) {
            _push(`<tr data-v-149dc304><td colspan="6" class="az-table__empty" data-v-149dc304>`);
            _push(ssrRenderComponent(VIcon, {
              size: "36",
              color: "grey-lighten-1"
            }, {
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
            _push(`<p class="text-body-2 mt-2 text-medium-emphasis" data-v-149dc304>No recent expenses.</p></td></tr>`);
          } else {
            _push(`<!---->`);
          }
          _push(`</tbody></table></div>`);
        } else {
          _push(`<!---->`);
        }
        _push(`<!--]-->`);
      }
      _push(ssrRenderComponent(VDialog, {
        modelValue: unref(formDialog),
        "onUpdate:modelValue": ($event) => isRef(formDialog) ? formDialog.value = $event : null,
        "max-width": "560"
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(ssrRenderComponent(VCard, {
              rounded: "xl",
              class: "pa-2"
            }, {
              default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                if (_push3) {
                  _push3(ssrRenderComponent(VCardTitle, { class: "text-h6 font-weight-bold px-4 pt-4" }, {
                    default: withCtx((_3, _push4, _parent4, _scopeId3) => {
                      if (_push4) {
                        _push4(`${ssrInterpolate(unref(editing) ? "Edit Expense" : "New Expense")}`);
                      } else {
                        return [
                          createTextVNode(toDisplayString(unref(editing) ? "Edit Expense" : "New Expense"), 1)
                        ];
                      }
                    }),
                    _: 1
                  }, _parent3, _scopeId2));
                  _push3(ssrRenderComponent(VCardText, { class: "px-4" }, {
                    default: withCtx((_3, _push4, _parent4, _scopeId3) => {
                      if (_push4) {
                        _push4(ssrRenderComponent(VTextField, {
                          modelValue: unref(form).description,
                          "onUpdate:modelValue": ($event) => unref(form).description = $event,
                          label: "Description",
                          density: "compact",
                          variant: "outlined",
                          class: "mb-3",
                          "hide-details": ""
                        }, null, _parent4, _scopeId3));
                        _push4(ssrRenderComponent(VRow, null, {
                          default: withCtx((_4, _push5, _parent5, _scopeId4) => {
                            if (_push5) {
                              _push5(ssrRenderComponent(VCol, { cols: "6" }, {
                                default: withCtx((_5, _push6, _parent6, _scopeId5) => {
                                  if (_push6) {
                                    _push6(ssrRenderComponent(VTextField, {
                                      modelValue: unref(form).amount,
                                      "onUpdate:modelValue": ($event) => unref(form).amount = $event,
                                      modelModifiers: { number: true },
                                      label: "Amount",
                                      type: "number",
                                      prefix: "KSh",
                                      density: "compact",
                                      variant: "outlined",
                                      class: "mb-3",
                                      "hide-details": ""
                                    }, null, _parent6, _scopeId5));
                                  } else {
                                    return [
                                      createVNode(VTextField, {
                                        modelValue: unref(form).amount,
                                        "onUpdate:modelValue": ($event) => unref(form).amount = $event,
                                        modelModifiers: { number: true },
                                        label: "Amount",
                                        type: "number",
                                        prefix: "KSh",
                                        density: "compact",
                                        variant: "outlined",
                                        class: "mb-3",
                                        "hide-details": ""
                                      }, null, 8, ["modelValue", "onUpdate:modelValue"])
                                    ];
                                  }
                                }),
                                _: 1
                              }, _parent5, _scopeId4));
                              _push5(ssrRenderComponent(VCol, { cols: "6" }, {
                                default: withCtx((_5, _push6, _parent6, _scopeId5) => {
                                  if (_push6) {
                                    _push6(ssrRenderComponent(VCombobox, {
                                      modelValue: unref(form).category,
                                      "onUpdate:modelValue": ($event) => unref(form).category = $event,
                                      items: unref(categoryList),
                                      label: "Category",
                                      density: "compact",
                                      variant: "outlined",
                                      class: "mb-3",
                                      "hide-details": ""
                                    }, null, _parent6, _scopeId5));
                                  } else {
                                    return [
                                      createVNode(VCombobox, {
                                        modelValue: unref(form).category,
                                        "onUpdate:modelValue": ($event) => unref(form).category = $event,
                                        items: unref(categoryList),
                                        label: "Category",
                                        density: "compact",
                                        variant: "outlined",
                                        class: "mb-3",
                                        "hide-details": ""
                                      }, null, 8, ["modelValue", "onUpdate:modelValue", "items"])
                                    ];
                                  }
                                }),
                                _: 1
                              }, _parent5, _scopeId4));
                            } else {
                              return [
                                createVNode(VCol, { cols: "6" }, {
                                  default: withCtx(() => [
                                    createVNode(VTextField, {
                                      modelValue: unref(form).amount,
                                      "onUpdate:modelValue": ($event) => unref(form).amount = $event,
                                      modelModifiers: { number: true },
                                      label: "Amount",
                                      type: "number",
                                      prefix: "KSh",
                                      density: "compact",
                                      variant: "outlined",
                                      class: "mb-3",
                                      "hide-details": ""
                                    }, null, 8, ["modelValue", "onUpdate:modelValue"])
                                  ]),
                                  _: 1
                                }),
                                createVNode(VCol, { cols: "6" }, {
                                  default: withCtx(() => [
                                    createVNode(VCombobox, {
                                      modelValue: unref(form).category,
                                      "onUpdate:modelValue": ($event) => unref(form).category = $event,
                                      items: unref(categoryList),
                                      label: "Category",
                                      density: "compact",
                                      variant: "outlined",
                                      class: "mb-3",
                                      "hide-details": ""
                                    }, null, 8, ["modelValue", "onUpdate:modelValue", "items"])
                                  ]),
                                  _: 1
                                })
                              ];
                            }
                          }),
                          _: 1
                        }, _parent4, _scopeId3));
                        _push4(ssrRenderComponent(VRow, null, {
                          default: withCtx((_4, _push5, _parent5, _scopeId4) => {
                            if (_push5) {
                              _push5(ssrRenderComponent(VCol, { cols: "6" }, {
                                default: withCtx((_5, _push6, _parent6, _scopeId5) => {
                                  if (_push6) {
                                    _push6(ssrRenderComponent(VTextField, {
                                      modelValue: unref(form).cost_price,
                                      "onUpdate:modelValue": ($event) => unref(form).cost_price = $event,
                                      modelModifiers: { number: true },
                                      label: "Cost Price",
                                      type: "number",
                                      prefix: "KSh",
                                      density: "compact",
                                      variant: "outlined",
                                      class: "mb-3",
                                      "hide-details": ""
                                    }, null, _parent6, _scopeId5));
                                  } else {
                                    return [
                                      createVNode(VTextField, {
                                        modelValue: unref(form).cost_price,
                                        "onUpdate:modelValue": ($event) => unref(form).cost_price = $event,
                                        modelModifiers: { number: true },
                                        label: "Cost Price",
                                        type: "number",
                                        prefix: "KSh",
                                        density: "compact",
                                        variant: "outlined",
                                        class: "mb-3",
                                        "hide-details": ""
                                      }, null, 8, ["modelValue", "onUpdate:modelValue"])
                                    ];
                                  }
                                }),
                                _: 1
                              }, _parent5, _scopeId4));
                              _push5(ssrRenderComponent(VCol, { cols: "6" }, {
                                default: withCtx((_5, _push6, _parent6, _scopeId5) => {
                                  if (_push6) {
                                    _push6(ssrRenderComponent(VTextField, {
                                      modelValue: unref(form).retail_price,
                                      "onUpdate:modelValue": ($event) => unref(form).retail_price = $event,
                                      modelModifiers: { number: true },
                                      label: "Retail Price",
                                      type: "number",
                                      prefix: "KSh",
                                      density: "compact",
                                      variant: "outlined",
                                      class: "mb-3",
                                      "hide-details": ""
                                    }, null, _parent6, _scopeId5));
                                  } else {
                                    return [
                                      createVNode(VTextField, {
                                        modelValue: unref(form).retail_price,
                                        "onUpdate:modelValue": ($event) => unref(form).retail_price = $event,
                                        modelModifiers: { number: true },
                                        label: "Retail Price",
                                        type: "number",
                                        prefix: "KSh",
                                        density: "compact",
                                        variant: "outlined",
                                        class: "mb-3",
                                        "hide-details": ""
                                      }, null, 8, ["modelValue", "onUpdate:modelValue"])
                                    ];
                                  }
                                }),
                                _: 1
                              }, _parent5, _scopeId4));
                            } else {
                              return [
                                createVNode(VCol, { cols: "6" }, {
                                  default: withCtx(() => [
                                    createVNode(VTextField, {
                                      modelValue: unref(form).cost_price,
                                      "onUpdate:modelValue": ($event) => unref(form).cost_price = $event,
                                      modelModifiers: { number: true },
                                      label: "Cost Price",
                                      type: "number",
                                      prefix: "KSh",
                                      density: "compact",
                                      variant: "outlined",
                                      class: "mb-3",
                                      "hide-details": ""
                                    }, null, 8, ["modelValue", "onUpdate:modelValue"])
                                  ]),
                                  _: 1
                                }),
                                createVNode(VCol, { cols: "6" }, {
                                  default: withCtx(() => [
                                    createVNode(VTextField, {
                                      modelValue: unref(form).retail_price,
                                      "onUpdate:modelValue": ($event) => unref(form).retail_price = $event,
                                      modelModifiers: { number: true },
                                      label: "Retail Price",
                                      type: "number",
                                      prefix: "KSh",
                                      density: "compact",
                                      variant: "outlined",
                                      class: "mb-3",
                                      "hide-details": ""
                                    }, null, 8, ["modelValue", "onUpdate:modelValue"])
                                  ]),
                                  _: 1
                                })
                              ];
                            }
                          }),
                          _: 1
                        }, _parent4, _scopeId3));
                        _push4(ssrRenderComponent(VRow, null, {
                          default: withCtx((_4, _push5, _parent5, _scopeId4) => {
                            if (_push5) {
                              _push5(ssrRenderComponent(VCol, { cols: "6" }, {
                                default: withCtx((_5, _push6, _parent6, _scopeId5) => {
                                  if (_push6) {
                                    _push6(ssrRenderComponent(VTextField, {
                                      modelValue: unref(form).vendor,
                                      "onUpdate:modelValue": ($event) => unref(form).vendor = $event,
                                      label: "Vendor",
                                      density: "compact",
                                      variant: "outlined",
                                      class: "mb-3",
                                      "hide-details": ""
                                    }, null, _parent6, _scopeId5));
                                  } else {
                                    return [
                                      createVNode(VTextField, {
                                        modelValue: unref(form).vendor,
                                        "onUpdate:modelValue": ($event) => unref(form).vendor = $event,
                                        label: "Vendor",
                                        density: "compact",
                                        variant: "outlined",
                                        class: "mb-3",
                                        "hide-details": ""
                                      }, null, 8, ["modelValue", "onUpdate:modelValue"])
                                    ];
                                  }
                                }),
                                _: 1
                              }, _parent5, _scopeId4));
                              _push5(ssrRenderComponent(VCol, { cols: "6" }, {
                                default: withCtx((_5, _push6, _parent6, _scopeId5) => {
                                  if (_push6) {
                                    _push6(ssrRenderComponent(VSelect, {
                                      modelValue: unref(form).payment_method,
                                      "onUpdate:modelValue": ($event) => unref(form).payment_method = $event,
                                      items: methodList,
                                      label: "Payment Method",
                                      density: "compact",
                                      variant: "outlined",
                                      class: "mb-3",
                                      "hide-details": ""
                                    }, null, _parent6, _scopeId5));
                                  } else {
                                    return [
                                      createVNode(VSelect, {
                                        modelValue: unref(form).payment_method,
                                        "onUpdate:modelValue": ($event) => unref(form).payment_method = $event,
                                        items: methodList,
                                        label: "Payment Method",
                                        density: "compact",
                                        variant: "outlined",
                                        class: "mb-3",
                                        "hide-details": ""
                                      }, null, 8, ["modelValue", "onUpdate:modelValue"])
                                    ];
                                  }
                                }),
                                _: 1
                              }, _parent5, _scopeId4));
                            } else {
                              return [
                                createVNode(VCol, { cols: "6" }, {
                                  default: withCtx(() => [
                                    createVNode(VTextField, {
                                      modelValue: unref(form).vendor,
                                      "onUpdate:modelValue": ($event) => unref(form).vendor = $event,
                                      label: "Vendor",
                                      density: "compact",
                                      variant: "outlined",
                                      class: "mb-3",
                                      "hide-details": ""
                                    }, null, 8, ["modelValue", "onUpdate:modelValue"])
                                  ]),
                                  _: 1
                                }),
                                createVNode(VCol, { cols: "6" }, {
                                  default: withCtx(() => [
                                    createVNode(VSelect, {
                                      modelValue: unref(form).payment_method,
                                      "onUpdate:modelValue": ($event) => unref(form).payment_method = $event,
                                      items: methodList,
                                      label: "Payment Method",
                                      density: "compact",
                                      variant: "outlined",
                                      class: "mb-3",
                                      "hide-details": ""
                                    }, null, 8, ["modelValue", "onUpdate:modelValue"])
                                  ]),
                                  _: 1
                                })
                              ];
                            }
                          }),
                          _: 1
                        }, _parent4, _scopeId3));
                        _push4(ssrRenderComponent(VTextField, {
                          modelValue: unref(form).date,
                          "onUpdate:modelValue": ($event) => unref(form).date = $event,
                          label: "Date",
                          type: "date",
                          density: "compact",
                          variant: "outlined",
                          class: "mb-3",
                          "hide-details": ""
                        }, null, _parent4, _scopeId3));
                        _push4(ssrRenderComponent(VTextField, {
                          modelValue: unref(form).reference,
                          "onUpdate:modelValue": ($event) => unref(form).reference = $event,
                          label: "Reference (optional)",
                          density: "compact",
                          variant: "outlined",
                          "hide-details": ""
                        }, null, _parent4, _scopeId3));
                      } else {
                        return [
                          createVNode(VTextField, {
                            modelValue: unref(form).description,
                            "onUpdate:modelValue": ($event) => unref(form).description = $event,
                            label: "Description",
                            density: "compact",
                            variant: "outlined",
                            class: "mb-3",
                            "hide-details": ""
                          }, null, 8, ["modelValue", "onUpdate:modelValue"]),
                          createVNode(VRow, null, {
                            default: withCtx(() => [
                              createVNode(VCol, { cols: "6" }, {
                                default: withCtx(() => [
                                  createVNode(VTextField, {
                                    modelValue: unref(form).amount,
                                    "onUpdate:modelValue": ($event) => unref(form).amount = $event,
                                    modelModifiers: { number: true },
                                    label: "Amount",
                                    type: "number",
                                    prefix: "KSh",
                                    density: "compact",
                                    variant: "outlined",
                                    class: "mb-3",
                                    "hide-details": ""
                                  }, null, 8, ["modelValue", "onUpdate:modelValue"])
                                ]),
                                _: 1
                              }),
                              createVNode(VCol, { cols: "6" }, {
                                default: withCtx(() => [
                                  createVNode(VCombobox, {
                                    modelValue: unref(form).category,
                                    "onUpdate:modelValue": ($event) => unref(form).category = $event,
                                    items: unref(categoryList),
                                    label: "Category",
                                    density: "compact",
                                    variant: "outlined",
                                    class: "mb-3",
                                    "hide-details": ""
                                  }, null, 8, ["modelValue", "onUpdate:modelValue", "items"])
                                ]),
                                _: 1
                              })
                            ]),
                            _: 1
                          }),
                          createVNode(VRow, null, {
                            default: withCtx(() => [
                              createVNode(VCol, { cols: "6" }, {
                                default: withCtx(() => [
                                  createVNode(VTextField, {
                                    modelValue: unref(form).cost_price,
                                    "onUpdate:modelValue": ($event) => unref(form).cost_price = $event,
                                    modelModifiers: { number: true },
                                    label: "Cost Price",
                                    type: "number",
                                    prefix: "KSh",
                                    density: "compact",
                                    variant: "outlined",
                                    class: "mb-3",
                                    "hide-details": ""
                                  }, null, 8, ["modelValue", "onUpdate:modelValue"])
                                ]),
                                _: 1
                              }),
                              createVNode(VCol, { cols: "6" }, {
                                default: withCtx(() => [
                                  createVNode(VTextField, {
                                    modelValue: unref(form).retail_price,
                                    "onUpdate:modelValue": ($event) => unref(form).retail_price = $event,
                                    modelModifiers: { number: true },
                                    label: "Retail Price",
                                    type: "number",
                                    prefix: "KSh",
                                    density: "compact",
                                    variant: "outlined",
                                    class: "mb-3",
                                    "hide-details": ""
                                  }, null, 8, ["modelValue", "onUpdate:modelValue"])
                                ]),
                                _: 1
                              })
                            ]),
                            _: 1
                          }),
                          createVNode(VRow, null, {
                            default: withCtx(() => [
                              createVNode(VCol, { cols: "6" }, {
                                default: withCtx(() => [
                                  createVNode(VTextField, {
                                    modelValue: unref(form).vendor,
                                    "onUpdate:modelValue": ($event) => unref(form).vendor = $event,
                                    label: "Vendor",
                                    density: "compact",
                                    variant: "outlined",
                                    class: "mb-3",
                                    "hide-details": ""
                                  }, null, 8, ["modelValue", "onUpdate:modelValue"])
                                ]),
                                _: 1
                              }),
                              createVNode(VCol, { cols: "6" }, {
                                default: withCtx(() => [
                                  createVNode(VSelect, {
                                    modelValue: unref(form).payment_method,
                                    "onUpdate:modelValue": ($event) => unref(form).payment_method = $event,
                                    items: methodList,
                                    label: "Payment Method",
                                    density: "compact",
                                    variant: "outlined",
                                    class: "mb-3",
                                    "hide-details": ""
                                  }, null, 8, ["modelValue", "onUpdate:modelValue"])
                                ]),
                                _: 1
                              })
                            ]),
                            _: 1
                          }),
                          createVNode(VTextField, {
                            modelValue: unref(form).date,
                            "onUpdate:modelValue": ($event) => unref(form).date = $event,
                            label: "Date",
                            type: "date",
                            density: "compact",
                            variant: "outlined",
                            class: "mb-3",
                            "hide-details": ""
                          }, null, 8, ["modelValue", "onUpdate:modelValue"]),
                          createVNode(VTextField, {
                            modelValue: unref(form).reference,
                            "onUpdate:modelValue": ($event) => unref(form).reference = $event,
                            label: "Reference (optional)",
                            density: "compact",
                            variant: "outlined",
                            "hide-details": ""
                          }, null, 8, ["modelValue", "onUpdate:modelValue"])
                        ];
                      }
                    }),
                    _: 1
                  }, _parent3, _scopeId2));
                  _push3(ssrRenderComponent(VCardActions, { class: "px-4 pb-4" }, {
                    default: withCtx((_3, _push4, _parent4, _scopeId3) => {
                      if (_push4) {
                        _push4(ssrRenderComponent(VSpacer, null, null, _parent4, _scopeId3));
                        _push4(ssrRenderComponent(VBtn, {
                          variant: "text",
                          onClick: ($event) => formDialog.value = false
                        }, {
                          default: withCtx((_4, _push5, _parent5, _scopeId4) => {
                            if (_push5) {
                              _push5(`Cancel`);
                            } else {
                              return [
                                createTextVNode("Cancel")
                              ];
                            }
                          }),
                          _: 1
                        }, _parent4, _scopeId3));
                        _push4(ssrRenderComponent(VBtn, {
                          variant: "flat",
                          color: "primary",
                          onClick: saveExpense,
                          loading: unref(saving),
                          "prepend-icon": "mdi-check"
                        }, {
                          default: withCtx((_4, _push5, _parent5, _scopeId4) => {
                            if (_push5) {
                              _push5(`${ssrInterpolate(unref(editing) ? "Update" : "Record")}`);
                            } else {
                              return [
                                createTextVNode(toDisplayString(unref(editing) ? "Update" : "Record"), 1)
                              ];
                            }
                          }),
                          _: 1
                        }, _parent4, _scopeId3));
                      } else {
                        return [
                          createVNode(VSpacer),
                          createVNode(VBtn, {
                            variant: "text",
                            onClick: ($event) => formDialog.value = false
                          }, {
                            default: withCtx(() => [
                              createTextVNode("Cancel")
                            ]),
                            _: 1
                          }, 8, ["onClick"]),
                          createVNode(VBtn, {
                            variant: "flat",
                            color: "primary",
                            onClick: saveExpense,
                            loading: unref(saving),
                            "prepend-icon": "mdi-check"
                          }, {
                            default: withCtx(() => [
                              createTextVNode(toDisplayString(unref(editing) ? "Update" : "Record"), 1)
                            ]),
                            _: 1
                          }, 8, ["loading"])
                        ];
                      }
                    }),
                    _: 1
                  }, _parent3, _scopeId2));
                } else {
                  return [
                    createVNode(VCardTitle, { class: "text-h6 font-weight-bold px-4 pt-4" }, {
                      default: withCtx(() => [
                        createTextVNode(toDisplayString(unref(editing) ? "Edit Expense" : "New Expense"), 1)
                      ]),
                      _: 1
                    }),
                    createVNode(VCardText, { class: "px-4" }, {
                      default: withCtx(() => [
                        createVNode(VTextField, {
                          modelValue: unref(form).description,
                          "onUpdate:modelValue": ($event) => unref(form).description = $event,
                          label: "Description",
                          density: "compact",
                          variant: "outlined",
                          class: "mb-3",
                          "hide-details": ""
                        }, null, 8, ["modelValue", "onUpdate:modelValue"]),
                        createVNode(VRow, null, {
                          default: withCtx(() => [
                            createVNode(VCol, { cols: "6" }, {
                              default: withCtx(() => [
                                createVNode(VTextField, {
                                  modelValue: unref(form).amount,
                                  "onUpdate:modelValue": ($event) => unref(form).amount = $event,
                                  modelModifiers: { number: true },
                                  label: "Amount",
                                  type: "number",
                                  prefix: "KSh",
                                  density: "compact",
                                  variant: "outlined",
                                  class: "mb-3",
                                  "hide-details": ""
                                }, null, 8, ["modelValue", "onUpdate:modelValue"])
                              ]),
                              _: 1
                            }),
                            createVNode(VCol, { cols: "6" }, {
                              default: withCtx(() => [
                                createVNode(VCombobox, {
                                  modelValue: unref(form).category,
                                  "onUpdate:modelValue": ($event) => unref(form).category = $event,
                                  items: unref(categoryList),
                                  label: "Category",
                                  density: "compact",
                                  variant: "outlined",
                                  class: "mb-3",
                                  "hide-details": ""
                                }, null, 8, ["modelValue", "onUpdate:modelValue", "items"])
                              ]),
                              _: 1
                            })
                          ]),
                          _: 1
                        }),
                        createVNode(VRow, null, {
                          default: withCtx(() => [
                            createVNode(VCol, { cols: "6" }, {
                              default: withCtx(() => [
                                createVNode(VTextField, {
                                  modelValue: unref(form).cost_price,
                                  "onUpdate:modelValue": ($event) => unref(form).cost_price = $event,
                                  modelModifiers: { number: true },
                                  label: "Cost Price",
                                  type: "number",
                                  prefix: "KSh",
                                  density: "compact",
                                  variant: "outlined",
                                  class: "mb-3",
                                  "hide-details": ""
                                }, null, 8, ["modelValue", "onUpdate:modelValue"])
                              ]),
                              _: 1
                            }),
                            createVNode(VCol, { cols: "6" }, {
                              default: withCtx(() => [
                                createVNode(VTextField, {
                                  modelValue: unref(form).retail_price,
                                  "onUpdate:modelValue": ($event) => unref(form).retail_price = $event,
                                  modelModifiers: { number: true },
                                  label: "Retail Price",
                                  type: "number",
                                  prefix: "KSh",
                                  density: "compact",
                                  variant: "outlined",
                                  class: "mb-3",
                                  "hide-details": ""
                                }, null, 8, ["modelValue", "onUpdate:modelValue"])
                              ]),
                              _: 1
                            })
                          ]),
                          _: 1
                        }),
                        createVNode(VRow, null, {
                          default: withCtx(() => [
                            createVNode(VCol, { cols: "6" }, {
                              default: withCtx(() => [
                                createVNode(VTextField, {
                                  modelValue: unref(form).vendor,
                                  "onUpdate:modelValue": ($event) => unref(form).vendor = $event,
                                  label: "Vendor",
                                  density: "compact",
                                  variant: "outlined",
                                  class: "mb-3",
                                  "hide-details": ""
                                }, null, 8, ["modelValue", "onUpdate:modelValue"])
                              ]),
                              _: 1
                            }),
                            createVNode(VCol, { cols: "6" }, {
                              default: withCtx(() => [
                                createVNode(VSelect, {
                                  modelValue: unref(form).payment_method,
                                  "onUpdate:modelValue": ($event) => unref(form).payment_method = $event,
                                  items: methodList,
                                  label: "Payment Method",
                                  density: "compact",
                                  variant: "outlined",
                                  class: "mb-3",
                                  "hide-details": ""
                                }, null, 8, ["modelValue", "onUpdate:modelValue"])
                              ]),
                              _: 1
                            })
                          ]),
                          _: 1
                        }),
                        createVNode(VTextField, {
                          modelValue: unref(form).date,
                          "onUpdate:modelValue": ($event) => unref(form).date = $event,
                          label: "Date",
                          type: "date",
                          density: "compact",
                          variant: "outlined",
                          class: "mb-3",
                          "hide-details": ""
                        }, null, 8, ["modelValue", "onUpdate:modelValue"]),
                        createVNode(VTextField, {
                          modelValue: unref(form).reference,
                          "onUpdate:modelValue": ($event) => unref(form).reference = $event,
                          label: "Reference (optional)",
                          density: "compact",
                          variant: "outlined",
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
                          onClick: ($event) => formDialog.value = false
                        }, {
                          default: withCtx(() => [
                            createTextVNode("Cancel")
                          ]),
                          _: 1
                        }, 8, ["onClick"]),
                        createVNode(VBtn, {
                          variant: "flat",
                          color: "primary",
                          onClick: saveExpense,
                          loading: unref(saving),
                          "prepend-icon": "mdi-check"
                        }, {
                          default: withCtx(() => [
                            createTextVNode(toDisplayString(unref(editing) ? "Update" : "Record"), 1)
                          ]),
                          _: 1
                        }, 8, ["loading"])
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
              createVNode(VCard, {
                rounded: "xl",
                class: "pa-2"
              }, {
                default: withCtx(() => [
                  createVNode(VCardTitle, { class: "text-h6 font-weight-bold px-4 pt-4" }, {
                    default: withCtx(() => [
                      createTextVNode(toDisplayString(unref(editing) ? "Edit Expense" : "New Expense"), 1)
                    ]),
                    _: 1
                  }),
                  createVNode(VCardText, { class: "px-4" }, {
                    default: withCtx(() => [
                      createVNode(VTextField, {
                        modelValue: unref(form).description,
                        "onUpdate:modelValue": ($event) => unref(form).description = $event,
                        label: "Description",
                        density: "compact",
                        variant: "outlined",
                        class: "mb-3",
                        "hide-details": ""
                      }, null, 8, ["modelValue", "onUpdate:modelValue"]),
                      createVNode(VRow, null, {
                        default: withCtx(() => [
                          createVNode(VCol, { cols: "6" }, {
                            default: withCtx(() => [
                              createVNode(VTextField, {
                                modelValue: unref(form).amount,
                                "onUpdate:modelValue": ($event) => unref(form).amount = $event,
                                modelModifiers: { number: true },
                                label: "Amount",
                                type: "number",
                                prefix: "KSh",
                                density: "compact",
                                variant: "outlined",
                                class: "mb-3",
                                "hide-details": ""
                              }, null, 8, ["modelValue", "onUpdate:modelValue"])
                            ]),
                            _: 1
                          }),
                          createVNode(VCol, { cols: "6" }, {
                            default: withCtx(() => [
                              createVNode(VCombobox, {
                                modelValue: unref(form).category,
                                "onUpdate:modelValue": ($event) => unref(form).category = $event,
                                items: unref(categoryList),
                                label: "Category",
                                density: "compact",
                                variant: "outlined",
                                class: "mb-3",
                                "hide-details": ""
                              }, null, 8, ["modelValue", "onUpdate:modelValue", "items"])
                            ]),
                            _: 1
                          })
                        ]),
                        _: 1
                      }),
                      createVNode(VRow, null, {
                        default: withCtx(() => [
                          createVNode(VCol, { cols: "6" }, {
                            default: withCtx(() => [
                              createVNode(VTextField, {
                                modelValue: unref(form).cost_price,
                                "onUpdate:modelValue": ($event) => unref(form).cost_price = $event,
                                modelModifiers: { number: true },
                                label: "Cost Price",
                                type: "number",
                                prefix: "KSh",
                                density: "compact",
                                variant: "outlined",
                                class: "mb-3",
                                "hide-details": ""
                              }, null, 8, ["modelValue", "onUpdate:modelValue"])
                            ]),
                            _: 1
                          }),
                          createVNode(VCol, { cols: "6" }, {
                            default: withCtx(() => [
                              createVNode(VTextField, {
                                modelValue: unref(form).retail_price,
                                "onUpdate:modelValue": ($event) => unref(form).retail_price = $event,
                                modelModifiers: { number: true },
                                label: "Retail Price",
                                type: "number",
                                prefix: "KSh",
                                density: "compact",
                                variant: "outlined",
                                class: "mb-3",
                                "hide-details": ""
                              }, null, 8, ["modelValue", "onUpdate:modelValue"])
                            ]),
                            _: 1
                          })
                        ]),
                        _: 1
                      }),
                      createVNode(VRow, null, {
                        default: withCtx(() => [
                          createVNode(VCol, { cols: "6" }, {
                            default: withCtx(() => [
                              createVNode(VTextField, {
                                modelValue: unref(form).vendor,
                                "onUpdate:modelValue": ($event) => unref(form).vendor = $event,
                                label: "Vendor",
                                density: "compact",
                                variant: "outlined",
                                class: "mb-3",
                                "hide-details": ""
                              }, null, 8, ["modelValue", "onUpdate:modelValue"])
                            ]),
                            _: 1
                          }),
                          createVNode(VCol, { cols: "6" }, {
                            default: withCtx(() => [
                              createVNode(VSelect, {
                                modelValue: unref(form).payment_method,
                                "onUpdate:modelValue": ($event) => unref(form).payment_method = $event,
                                items: methodList,
                                label: "Payment Method",
                                density: "compact",
                                variant: "outlined",
                                class: "mb-3",
                                "hide-details": ""
                              }, null, 8, ["modelValue", "onUpdate:modelValue"])
                            ]),
                            _: 1
                          })
                        ]),
                        _: 1
                      }),
                      createVNode(VTextField, {
                        modelValue: unref(form).date,
                        "onUpdate:modelValue": ($event) => unref(form).date = $event,
                        label: "Date",
                        type: "date",
                        density: "compact",
                        variant: "outlined",
                        class: "mb-3",
                        "hide-details": ""
                      }, null, 8, ["modelValue", "onUpdate:modelValue"]),
                      createVNode(VTextField, {
                        modelValue: unref(form).reference,
                        "onUpdate:modelValue": ($event) => unref(form).reference = $event,
                        label: "Reference (optional)",
                        density: "compact",
                        variant: "outlined",
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
                        onClick: ($event) => formDialog.value = false
                      }, {
                        default: withCtx(() => [
                          createTextVNode("Cancel")
                        ]),
                        _: 1
                      }, 8, ["onClick"]),
                      createVNode(VBtn, {
                        variant: "flat",
                        color: "primary",
                        onClick: saveExpense,
                        loading: unref(saving),
                        "prepend-icon": "mdi-check"
                      }, {
                        default: withCtx(() => [
                          createTextVNode(toDisplayString(unref(editing) ? "Update" : "Record"), 1)
                        ]),
                        _: 1
                      }, 8, ["loading"])
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
      }, _parent));
      _push(ssrRenderComponent(VDialog, {
        modelValue: unref(customRangeDialog),
        "onUpdate:modelValue": ($event) => isRef(customRangeDialog) ? customRangeDialog.value = $event : null,
        "max-width": "480"
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(ssrRenderComponent(VCard, { rounded: "xl" }, {
              default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                if (_push3) {
                  _push3(ssrRenderComponent(VCardTitle, { class: "d-flex align-center ga-2" }, {
                    default: withCtx((_3, _push4, _parent4, _scopeId3) => {
                      if (_push4) {
                        _push4(ssrRenderComponent(VIcon, {
                          color: "primary",
                          size: "24"
                        }, {
                          default: withCtx((_4, _push5, _parent5, _scopeId4) => {
                            if (_push5) {
                              _push5(`mdi-calendar-clock`);
                            } else {
                              return [
                                createTextVNode("mdi-calendar-clock")
                              ];
                            }
                          }),
                          _: 1
                        }, _parent4, _scopeId3));
                        _push4(` Custom Date Range `);
                      } else {
                        return [
                          createVNode(VIcon, {
                            color: "primary",
                            size: "24"
                          }, {
                            default: withCtx(() => [
                              createTextVNode("mdi-calendar-clock")
                            ]),
                            _: 1
                          }),
                          createTextVNode(" Custom Date Range ")
                        ];
                      }
                    }),
                    _: 1
                  }, _parent3, _scopeId2));
                  _push3(ssrRenderComponent(VCardText, null, {
                    default: withCtx((_3, _push4, _parent4, _scopeId3) => {
                      if (_push4) {
                        _push4(`<p class="text-body-2 text-medium-emphasis mb-4" data-v-149dc304${_scopeId3}>Select a start and end date to filter expenses within a custom range.</p><div class="d-flex flex-column ga-4" data-v-149dc304${_scopeId3}>`);
                        _push4(ssrRenderComponent(VTextField, {
                          modelValue: unref(customRange).from,
                          "onUpdate:modelValue": ($event) => unref(customRange).from = $event,
                          type: "date",
                          label: "From date",
                          variant: "outlined",
                          density: "compact",
                          "hide-details": "",
                          "prepend-inner-icon": "mdi-calendar-start"
                        }, null, _parent4, _scopeId3));
                        _push4(ssrRenderComponent(VTextField, {
                          modelValue: unref(customRange).to,
                          "onUpdate:modelValue": ($event) => unref(customRange).to = $event,
                          type: "date",
                          label: "To date",
                          variant: "outlined",
                          density: "compact",
                          "hide-details": "",
                          "prepend-inner-icon": "mdi-calendar-end",
                          min: unref(customRange).from
                        }, null, _parent4, _scopeId3));
                        _push4(`</div>`);
                        if (unref(customRange).from && unref(customRange).to) {
                          _push4(`<div class="d-flex align-center ga-2 mt-3" data-v-149dc304${_scopeId3}>`);
                          _push4(ssrRenderComponent(VIcon, {
                            size: "16",
                            color: "info"
                          }, {
                            default: withCtx((_4, _push5, _parent5, _scopeId4) => {
                              if (_push5) {
                                _push5(`mdi-information-outline`);
                              } else {
                                return [
                                  createTextVNode("mdi-information-outline")
                                ];
                              }
                            }),
                            _: 1
                          }, _parent4, _scopeId3));
                          _push4(`<p class="text-body-2 text-medium-emphasis mb-0" data-v-149dc304${_scopeId3}>${ssrInterpolate(unref(customRangeDays))} day${ssrInterpolate(unref(customRangeDays) === 1 ? "" : "s")} selected </p></div>`);
                        } else {
                          _push4(`<!---->`);
                        }
                      } else {
                        return [
                          createVNode("p", { class: "text-body-2 text-medium-emphasis mb-4" }, "Select a start and end date to filter expenses within a custom range."),
                          createVNode("div", { class: "d-flex flex-column ga-4" }, [
                            createVNode(VTextField, {
                              modelValue: unref(customRange).from,
                              "onUpdate:modelValue": ($event) => unref(customRange).from = $event,
                              type: "date",
                              label: "From date",
                              variant: "outlined",
                              density: "compact",
                              "hide-details": "",
                              "prepend-inner-icon": "mdi-calendar-start"
                            }, null, 8, ["modelValue", "onUpdate:modelValue"]),
                            createVNode(VTextField, {
                              modelValue: unref(customRange).to,
                              "onUpdate:modelValue": ($event) => unref(customRange).to = $event,
                              type: "date",
                              label: "To date",
                              variant: "outlined",
                              density: "compact",
                              "hide-details": "",
                              "prepend-inner-icon": "mdi-calendar-end",
                              min: unref(customRange).from
                            }, null, 8, ["modelValue", "onUpdate:modelValue", "min"])
                          ]),
                          unref(customRange).from && unref(customRange).to ? (openBlock(), createBlock("div", {
                            key: 0,
                            class: "d-flex align-center ga-2 mt-3"
                          }, [
                            createVNode(VIcon, {
                              size: "16",
                              color: "info"
                            }, {
                              default: withCtx(() => [
                                createTextVNode("mdi-information-outline")
                              ]),
                              _: 1
                            }),
                            createVNode("p", { class: "text-body-2 text-medium-emphasis mb-0" }, toDisplayString(unref(customRangeDays)) + " day" + toDisplayString(unref(customRangeDays) === 1 ? "" : "s") + " selected ", 1)
                          ])) : createCommentVNode("", true)
                        ];
                      }
                    }),
                    _: 1
                  }, _parent3, _scopeId2));
                  _push3(ssrRenderComponent(VCardActions, { class: "px-4 pb-4" }, {
                    default: withCtx((_3, _push4, _parent4, _scopeId3) => {
                      if (_push4) {
                        _push4(ssrRenderComponent(VSpacer, null, null, _parent4, _scopeId3));
                        _push4(ssrRenderComponent(VBtn, {
                          variant: "text",
                          onClick: ($event) => customRangeDialog.value = false
                        }, {
                          default: withCtx((_4, _push5, _parent5, _scopeId4) => {
                            if (_push5) {
                              _push5(`Cancel`);
                            } else {
                              return [
                                createTextVNode("Cancel")
                              ];
                            }
                          }),
                          _: 1
                        }, _parent4, _scopeId3));
                        _push4(ssrRenderComponent(VBtn, {
                          variant: "flat",
                          color: "primary",
                          "prepend-icon": "mdi-check",
                          disabled: !unref(customRange).from || !unref(customRange).to,
                          onClick: applyCustomRange
                        }, {
                          default: withCtx((_4, _push5, _parent5, _scopeId4) => {
                            if (_push5) {
                              _push5(`Apply`);
                            } else {
                              return [
                                createTextVNode("Apply")
                              ];
                            }
                          }),
                          _: 1
                        }, _parent4, _scopeId3));
                      } else {
                        return [
                          createVNode(VSpacer),
                          createVNode(VBtn, {
                            variant: "text",
                            onClick: ($event) => customRangeDialog.value = false
                          }, {
                            default: withCtx(() => [
                              createTextVNode("Cancel")
                            ]),
                            _: 1
                          }, 8, ["onClick"]),
                          createVNode(VBtn, {
                            variant: "flat",
                            color: "primary",
                            "prepend-icon": "mdi-check",
                            disabled: !unref(customRange).from || !unref(customRange).to,
                            onClick: applyCustomRange
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
                  }, _parent3, _scopeId2));
                } else {
                  return [
                    createVNode(VCardTitle, { class: "d-flex align-center ga-2" }, {
                      default: withCtx(() => [
                        createVNode(VIcon, {
                          color: "primary",
                          size: "24"
                        }, {
                          default: withCtx(() => [
                            createTextVNode("mdi-calendar-clock")
                          ]),
                          _: 1
                        }),
                        createTextVNode(" Custom Date Range ")
                      ]),
                      _: 1
                    }),
                    createVNode(VCardText, null, {
                      default: withCtx(() => [
                        createVNode("p", { class: "text-body-2 text-medium-emphasis mb-4" }, "Select a start and end date to filter expenses within a custom range."),
                        createVNode("div", { class: "d-flex flex-column ga-4" }, [
                          createVNode(VTextField, {
                            modelValue: unref(customRange).from,
                            "onUpdate:modelValue": ($event) => unref(customRange).from = $event,
                            type: "date",
                            label: "From date",
                            variant: "outlined",
                            density: "compact",
                            "hide-details": "",
                            "prepend-inner-icon": "mdi-calendar-start"
                          }, null, 8, ["modelValue", "onUpdate:modelValue"]),
                          createVNode(VTextField, {
                            modelValue: unref(customRange).to,
                            "onUpdate:modelValue": ($event) => unref(customRange).to = $event,
                            type: "date",
                            label: "To date",
                            variant: "outlined",
                            density: "compact",
                            "hide-details": "",
                            "prepend-inner-icon": "mdi-calendar-end",
                            min: unref(customRange).from
                          }, null, 8, ["modelValue", "onUpdate:modelValue", "min"])
                        ]),
                        unref(customRange).from && unref(customRange).to ? (openBlock(), createBlock("div", {
                          key: 0,
                          class: "d-flex align-center ga-2 mt-3"
                        }, [
                          createVNode(VIcon, {
                            size: "16",
                            color: "info"
                          }, {
                            default: withCtx(() => [
                              createTextVNode("mdi-information-outline")
                            ]),
                            _: 1
                          }),
                          createVNode("p", { class: "text-body-2 text-medium-emphasis mb-0" }, toDisplayString(unref(customRangeDays)) + " day" + toDisplayString(unref(customRangeDays) === 1 ? "" : "s") + " selected ", 1)
                        ])) : createCommentVNode("", true)
                      ]),
                      _: 1
                    }),
                    createVNode(VCardActions, { class: "px-4 pb-4" }, {
                      default: withCtx(() => [
                        createVNode(VSpacer),
                        createVNode(VBtn, {
                          variant: "text",
                          onClick: ($event) => customRangeDialog.value = false
                        }, {
                          default: withCtx(() => [
                            createTextVNode("Cancel")
                          ]),
                          _: 1
                        }, 8, ["onClick"]),
                        createVNode(VBtn, {
                          variant: "flat",
                          color: "primary",
                          "prepend-icon": "mdi-check",
                          disabled: !unref(customRange).from || !unref(customRange).to,
                          onClick: applyCustomRange
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
            }, _parent2, _scopeId));
          } else {
            return [
              createVNode(VCard, { rounded: "xl" }, {
                default: withCtx(() => [
                  createVNode(VCardTitle, { class: "d-flex align-center ga-2" }, {
                    default: withCtx(() => [
                      createVNode(VIcon, {
                        color: "primary",
                        size: "24"
                      }, {
                        default: withCtx(() => [
                          createTextVNode("mdi-calendar-clock")
                        ]),
                        _: 1
                      }),
                      createTextVNode(" Custom Date Range ")
                    ]),
                    _: 1
                  }),
                  createVNode(VCardText, null, {
                    default: withCtx(() => [
                      createVNode("p", { class: "text-body-2 text-medium-emphasis mb-4" }, "Select a start and end date to filter expenses within a custom range."),
                      createVNode("div", { class: "d-flex flex-column ga-4" }, [
                        createVNode(VTextField, {
                          modelValue: unref(customRange).from,
                          "onUpdate:modelValue": ($event) => unref(customRange).from = $event,
                          type: "date",
                          label: "From date",
                          variant: "outlined",
                          density: "compact",
                          "hide-details": "",
                          "prepend-inner-icon": "mdi-calendar-start"
                        }, null, 8, ["modelValue", "onUpdate:modelValue"]),
                        createVNode(VTextField, {
                          modelValue: unref(customRange).to,
                          "onUpdate:modelValue": ($event) => unref(customRange).to = $event,
                          type: "date",
                          label: "To date",
                          variant: "outlined",
                          density: "compact",
                          "hide-details": "",
                          "prepend-inner-icon": "mdi-calendar-end",
                          min: unref(customRange).from
                        }, null, 8, ["modelValue", "onUpdate:modelValue", "min"])
                      ]),
                      unref(customRange).from && unref(customRange).to ? (openBlock(), createBlock("div", {
                        key: 0,
                        class: "d-flex align-center ga-2 mt-3"
                      }, [
                        createVNode(VIcon, {
                          size: "16",
                          color: "info"
                        }, {
                          default: withCtx(() => [
                            createTextVNode("mdi-information-outline")
                          ]),
                          _: 1
                        }),
                        createVNode("p", { class: "text-body-2 text-medium-emphasis mb-0" }, toDisplayString(unref(customRangeDays)) + " day" + toDisplayString(unref(customRangeDays) === 1 ? "" : "s") + " selected ", 1)
                      ])) : createCommentVNode("", true)
                    ]),
                    _: 1
                  }),
                  createVNode(VCardActions, { class: "px-4 pb-4" }, {
                    default: withCtx(() => [
                      createVNode(VSpacer),
                      createVNode(VBtn, {
                        variant: "text",
                        onClick: ($event) => customRangeDialog.value = false
                      }, {
                        default: withCtx(() => [
                          createTextVNode("Cancel")
                        ]),
                        _: 1
                      }, 8, ["onClick"]),
                      createVNode(VBtn, {
                        variant: "flat",
                        color: "primary",
                        "prepend-icon": "mdi-check",
                        disabled: !unref(customRange).from || !unref(customRange).to,
                        onClick: applyCustomRange
                      }, {
                        default: withCtx(() => [
                          createTextVNode("Apply")
                        ]),
                        _: 1
                      }, 8, ["disabled"])
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
      }, _parent));
      _push(`</div>`);
    };
  }
};
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/expenses/index.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const index = /* @__PURE__ */ _export_sfc(_sfc_main, [["__scopeId", "data-v-149dc304"]]);

export { index as default };
//# sourceMappingURL=index-1z-fLD-c.mjs.map
