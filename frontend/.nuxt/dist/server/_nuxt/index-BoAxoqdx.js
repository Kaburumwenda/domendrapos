import { ref, computed, watch, resolveComponent, mergeProps, withCtx, createTextVNode, unref, isRef, toDisplayString, createVNode, openBlock, createBlock, createCommentVNode, useSSRContext } from "vue";
import { ssrRenderAttrs, ssrRenderComponent, ssrInterpolate, ssrRenderStyle, ssrRenderList, ssrRenderClass } from "vue/server-renderer";
import { u as useFormat } from "./useFormat-BvVWDMYe.js";
import { _ as _export_sfc, D as useToast, a as VIcon, c as VBtn, x as VProgressCircular, v as VTextField, J as VSelect, o as VChip, q as VDialog, g as VCard, r as VCardTitle, s as VCardText, $ as VTextarea, w as VCardActions, b as VSpacer, n as VDataTable } from "../server.mjs";
import { u as useApi } from "./useApi-D4YG8JPQ.js";
import "D:/Projects/MY-APPS-2/DomendraPOS/frontend/node_modules/ofetch/dist/node.mjs";
import "#internal/nuxt/paths";
import "D:/Projects/MY-APPS-2/DomendraPOS/frontend/node_modules/nuxt/node_modules/hookable/dist/index.mjs";
import "D:/Projects/MY-APPS-2/DomendraPOS/frontend/node_modules/unctx/dist/index.mjs";
import "D:/Projects/MY-APPS-2/DomendraPOS/frontend/node_modules/@nuxt/nitro-server/dist/runtime/h3-compat.mjs";
import "D:/Projects/MY-APPS-2/DomendraPOS/frontend/node_modules/ufo/dist/index.mjs";
import "pinia";
import "D:/Projects/MY-APPS-2/DomendraPOS/frontend/node_modules/defu/dist/defu.mjs";
import "vue-router";
import "D:/Projects/MY-APPS-2/DomendraPOS/frontend/node_modules/perfect-debounce/dist/index.mjs";
import "D:/Projects/MY-APPS-2/DomendraPOS/frontend/node_modules/ohash/dist/index.mjs";
import "@vue/shared";
import "D:/Projects/MY-APPS-2/DomendraPOS/frontend/node_modules/klona/dist/index.mjs";
import "vue3-apexcharts";
import "D:/Projects/MY-APPS-2/DomendraPOS/frontend/node_modules/nuxt/node_modules/cookie-es/dist/index.mjs";
const itemsPerPage = 15;
const _sfc_main = {
  __name: "index",
  __ssrInlineRender: true,
  setup(__props) {
    const { currency } = useFormat();
    const { success, error: errorToast } = useToast();
    function formatMoney(v) {
      return currency(v || 0);
    }
    const loading = ref(false);
    const saving = ref(false);
    const credits = ref([]);
    const searchText = ref("");
    const statusFilter = ref(null);
    const activeTab = ref("all");
    const page = ref(1);
    const paymentDialog = ref(false);
    const historyDialog = ref(false);
    const selectedCredit = ref(null);
    const paymentAmount = ref(0);
    const paymentMethod = ref("cash");
    const paymentRef = ref("");
    const paymentNotes = ref("");
    const paymentHistory = ref([]);
    const paymentMethods = ["cash", "mpesa", "card", "bank_transfer", "cheque"];
    const historyHeaders = [
      { title: "Date", key: "created_at" },
      { title: "Method", key: "payment_method" },
      { title: "Reference", key: "reference" },
      { title: "Recorded By", key: "recorded_by_name" },
      { title: "Amount", key: "amount", align: "end" }
    ];
    function formatDate(d) {
      if (!d) return "—";
      const dt = new Date(d);
      return dt.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
    }
    function statusClass(s) {
      const map = { open: "open", partial: "partial", settled: "settled", overdue: "overdue" };
      return map[s] || "open";
    }
    function methodColor(m) {
      const map = { cash: "green", mpesa: "success", card: "blue", bank_transfer: "indigo", cheque: "orange" };
      return map[m] || "grey";
    }
    function isOverdue(c) {
      if (!c.due_date) return false;
      return new Date(c.due_date) < /* @__PURE__ */ new Date() && Number(c.balance) > 0;
    }
    function daysOverdue(c) {
      if (!c.due_date) return 0;
      return Math.floor((/* @__PURE__ */ new Date() - new Date(c.due_date)) / 864e5);
    }
    function progressPct(c) {
      const total = Number(c.total_amount);
      if (total <= 0) return 0;
      return Math.min(100, Math.round(Number(c.amount_paid) / total * 100));
    }
    function progressClass(c) {
      const pct = progressPct(c);
      if (pct >= 100) return "az-progress-fill--success";
      if (pct >= 50) return "az-progress-fill--warning";
      return "az-progress-fill--error";
    }
    function initials(name) {
      if (!name) return "?";
      return name.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase();
    }
    function avatarColor(name) {
      if (!name) return 0;
      const colors = ["blue", "green", "purple", "orange", "teal", "pink", "indigo", "cyan"];
      let hash = 0;
      for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
      return colors[Math.abs(hash) % colors.length];
    }
    const filtered = computed(() => {
      let list = credits.value;
      if (activeTab.value === "active") list = list.filter((c) => c.status === "open" || c.status === "partial");
      else if (activeTab.value === "overdue") list = list.filter((c) => c.status === "overdue" || isOverdue(c));
      else if (activeTab.value === "settled") list = list.filter((c) => c.status === "settled");
      if (searchText.value) {
        const s = searchText.value.toLowerCase();
        list = list.filter(
          (c) => c.customer_name?.toLowerCase().includes(s) || c.customer_phone?.includes(s) || c.transaction_number?.toLowerCase().includes(s)
        );
      }
      if (statusFilter.value) list = list.filter((c) => c.status === statusFilter.value);
      return list;
    });
    const totalPages = computed(() => Math.ceil(filtered.value.length / itemsPerPage));
    const pagedItems = computed(() => {
      const start = (page.value - 1) * itemsPerPage;
      return filtered.value.slice(start, start + itemsPerPage);
    });
    const kpis = computed(() => {
      const all = credits.value;
      const outstanding = all.reduce((s, c) => s + Number(c.balance), 0);
      const collected = all.reduce((s, c) => s + Number(c.amount_paid), 0);
      const totalCredit = all.reduce((s, c) => s + Number(c.total_amount), 0);
      const openCount = all.filter((c) => c.status === "open" || c.status === "partial").length;
      const settledCount = all.filter((c) => c.status === "settled").length;
      const partialCount = all.filter((c) => c.status === "partial").length;
      const overdueList = all.filter((c) => c.status === "overdue" || isOverdue(c));
      const overdueAmount = overdueList.reduce((s, c) => s + Number(c.balance), 0);
      const overdueCount = overdueList.length;
      const collectionRate = totalCredit > 0 ? (collected / totalCredit * 100).toFixed(1) : "0.0";
      const settled = all.filter((c) => c.status === "settled");
      const avgDays = settled.length > 0 ? Math.round(settled.reduce((s, c) => {
        const created = new Date(c.created_at);
        const lastPayment = c.payments?.length > 0 ? new Date(c.payments[0].created_at) : /* @__PURE__ */ new Date();
        return s + Math.max(0, Math.floor((lastPayment - created) / 864e5));
      }, 0) / settled.length) : 0;
      return { outstanding, collected, totalCredit, openCount, settledCount, partialCount, overdueAmount, overdueCount, collectionRate, avgDays, totalCount: all.length };
    });
    const tabs = computed(() => [
      { id: "all", label: "All Credits", icon: "mdi-credit-card-multiple", count: credits.value.length },
      { id: "active", label: "Active", icon: "mdi-clock-outline", count: credits.value.filter((c) => c.status === "open" || c.status === "partial").length },
      { id: "overdue", label: "Overdue", icon: "mdi-alert-circle-outline", count: credits.value.filter((c) => c.status === "overdue" || isOverdue(c)).length },
      { id: "settled", label: "Settled", icon: "mdi-check-circle-outline", count: credits.value.filter((c) => c.status === "settled").length }
    ]);
    const agingBuckets = computed(() => {
      const active = credits.value.filter((c) => Number(c.balance) > 0);
      const now = /* @__PURE__ */ new Date();
      const b0 = { label: "Current", amount: 0, count: 0, color: "#3478f6" };
      const b30 = { label: "1-30 Days", amount: 0, count: 0, color: "#f59e0b" };
      const b60 = { label: "31-60 Days", amount: 0, count: 0, color: "#f97316" };
      const b90 = { label: "60+ Days", amount: 0, count: 0, color: "#ef4444" };
      active.forEach((c) => {
        if (!c.due_date) {
          b0.amount += Number(c.balance);
          b0.count++;
          return;
        }
        const days = Math.floor((now - new Date(c.due_date)) / 864e5);
        if (days <= 0) {
          b0.amount += Number(c.balance);
          b0.count++;
        } else if (days <= 30) {
          b30.amount += Number(c.balance);
          b30.count++;
        } else if (days <= 60) {
          b60.amount += Number(c.balance);
          b60.count++;
        } else {
          b90.amount += Number(c.balance);
          b90.count++;
        }
      });
      return [b0, b30, b60, b90];
    });
    const topDebtors = computed(() => {
      return [...credits.value].filter((c) => Number(c.balance) > 0).sort((a, b) => Number(b.balance) - Number(a.balance)).slice(0, 5);
    });
    function localDateKey(d) {
      const dt = d instanceof Date ? d : new Date(d);
      const y = dt.getFullYear();
      const m = String(dt.getMonth() + 1).padStart(2, "0");
      const day = String(dt.getDate()).padStart(2, "0");
      return `${y}-${m}-${day}`;
    }
    const trendSeries = computed(() => {
      const days = 30;
      const now = /* @__PURE__ */ new Date();
      const buckets = {};
      for (let i = days - 1; i >= 0; i--) {
        const d = new Date(now);
        d.setDate(d.getDate() - i);
        const key = localDateKey(d);
        buckets[key] = 0;
      }
      credits.value.forEach((c) => {
        const createdKey = localDateKey(c.created_at);
        for (const key in buckets) {
          if (key >= createdKey) buckets[key] += Number(c.balance);
        }
      });
      const keys = Object.keys(buckets).sort();
      return [{ name: "Outstanding", data: keys.map((k) => Math.round(buckets[k])) }];
    });
    const trendOptions = {
      chart: { type: "area", toolbar: { show: false }, fontFamily: "inherit" },
      colors: ["#ef4444"],
      stroke: { curve: "smooth", width: 2 },
      fill: { type: "gradient", gradient: { shadeIntensity: 1, opacityFrom: 0.3, opacityTo: 0.05, stops: [0, 100] } },
      dataLabels: { enabled: false },
      xaxis: {
        categories: Array.from({ length: 30 }, (_, i) => {
          const d = /* @__PURE__ */ new Date();
          d.setDate(d.getDate() - (29 - i));
          return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short" });
        }),
        labels: { style: { fontSize: "11px" } },
        tickAmount: 6
      },
      yaxis: { labels: { formatter: (v) => `${(v / 1e3).toFixed(0)}k` } },
      grid: { borderColor: "rgba(0,0,0,0.06)", strokeDashArray: 4 },
      tooltip: { y: { formatter: (v) => formatMoney(v) } }
    };
    const statusDonutSeries = computed(() => {
      const counts = { open: 0, partial: 0, settled: 0, overdue: 0 };
      credits.value.forEach((c) => {
        if (isOverdue(c) && c.status !== "settled") counts.overdue++;
        else if (counts[c.status] !== void 0) counts[c.status]++;
      });
      return [counts.open, counts.partial, counts.settled, counts.overdue];
    });
    const statusDonutOptions = {
      chart: { type: "donut", toolbar: { show: false }, fontFamily: "inherit" },
      labels: ["Open", "Partial", "Settled", "Overdue"],
      colors: ["#3478f6", "#f59e0b", "#22c55e", "#ef4444"],
      stroke: { width: 2 },
      dataLabels: { enabled: true, formatter: (val) => `${val.toFixed(0)}%` },
      legend: { position: "bottom", fontSize: "12px", markers: { size: 6 } },
      plotOptions: {
        pie: { donut: { size: "68%", labels: {
          show: true,
          total: { show: true, label: "Total", formatter: () => String(credits.value.length) }
        } } }
      },
      tooltip: { y: { formatter: (val) => `${val} accounts` } }
    };
    async function loadData() {
      loading.value = true;
      try {
        const data = await useApi()("/pos/credits/?page_size=500");
        credits.value = data.results || data;
      } catch {
      } finally {
        loading.value = false;
      }
    }
    function openPayment(c) {
      selectedCredit.value = c || credits.value.find((x) => Number(x.balance) > 0);
      if (!selectedCredit.value) {
        errorToast("No outstanding credit accounts to pay");
        return;
      }
      paymentAmount.value = Number(selectedCredit.value.balance);
      paymentMethod.value = "cash";
      paymentRef.value = "";
      paymentNotes.value = "";
      paymentDialog.value = true;
    }
    async function recordPayment() {
      if (!paymentAmount.value || paymentAmount.value <= 0) {
        errorToast("Enter a valid payment amount");
        return;
      }
      saving.value = true;
      try {
        const data = await useApi()(`/pos/credits/${selectedCredit.value.id}/record_payment/`, {
          method: "POST",
          body: {
            amount: paymentAmount.value,
            payment_method: paymentMethod.value,
            reference: paymentRef.value,
            notes: paymentNotes.value
          }
        });
        const idx = credits.value.findIndex((c) => c.id === selectedCredit.value.id);
        if (idx !== -1) credits.value[idx] = { ...credits.value[idx], ...data };
        success("Payment recorded successfully");
        paymentDialog.value = false;
      } catch (e) {
        const msg = e?.data?.detail || "Failed to record payment";
        errorToast(msg);
      } finally {
        saving.value = false;
      }
    }
    async function viewHistory(c) {
      selectedCredit.value = c;
      historyDialog.value = true;
      try {
        const data = await useApi()(`/pos/credits/${c.id}/payments/`);
        paymentHistory.value = data.results || data;
      } catch {
        paymentHistory.value = [];
      }
    }
    function exportCSV() {
      const rows = [["Customer", "Phone", "Transaction", "Date", "Total", "Paid", "Balance", "Status", "Due Date"]];
      filtered.value.forEach((c) => {
        rows.push([
          c.customer_name || "",
          c.customer_phone || "",
          c.transaction_number || "",
          formatDate(c.created_at),
          Number(c.total_amount || 0),
          Number(c.amount_paid || 0),
          Number(c.balance || 0),
          c.status_display || c.status,
          c.due_date ? formatDate(c.due_date) : ""
        ]);
      });
      const csv = rows.map((r) => r.map((f) => `"${f}"`).join(",")).join("\n");
      const blob = new Blob([csv], { type: "text/csv" });
      const url = URL.createObjectURL(blob);
      const a = (void 0).createElement("a");
      a.href = url;
      a.download = `credit-accounts-${(/* @__PURE__ */ new Date()).toISOString().slice(0, 10)}.csv`;
      a.click();
      URL.revokeObjectURL(url);
      success("Credit accounts exported");
    }
    watch([searchText, statusFilter, activeTab], () => {
      page.value = 1;
    });
    return (_ctx, _push, _parent, _attrs) => {
      const _component_apexchart = resolveComponent("apexchart");
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "az-page" }, _attrs))} data-v-38d20b62><div class="az-header" data-v-38d20b62><div class="az-header__left" data-v-38d20b62><div class="az-header__title-icon az-header__title-icon--primary" data-v-38d20b62>`);
      _push(ssrRenderComponent(VIcon, { size: "22" }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`mdi-credit-card-clock-outline`);
          } else {
            return [
              createTextVNode("mdi-credit-card-clock-outline")
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`</div><div data-v-38d20b62><h1 class="text-h5 font-weight-bold" data-v-38d20b62>Customer Credit Accounts</h1><p class="text-body-2 text-medium-emphasis" data-v-38d20b62>Track, collect and manage customer credit balances</p></div></div><div class="az-header__actions" data-v-38d20b62>`);
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
        "prepend-icon": "mdi-download",
        size: "small",
        onClick: exportCSV
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`Export`);
          } else {
            return [
              createTextVNode("Export")
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(ssrRenderComponent(VBtn, {
        variant: "flat",
        color: "primary",
        "prepend-icon": "mdi-cash-plus",
        size: "small",
        onClick: ($event) => openPayment(null)
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`Record Payment`);
          } else {
            return [
              createTextVNode("Record Payment")
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`</div></div>`);
      if (unref(loading) && unref(credits).length === 0) {
        _push(`<div class="az-loading" data-v-38d20b62>`);
        _push(ssrRenderComponent(VProgressCircular, {
          indeterminate: "",
          color: "primary",
          size: "32",
          width: "3"
        }, null, _parent));
        _push(`<p class="text-body-2 text-medium-emphasis mt-3" data-v-38d20b62>Loading credit accounts…</p></div>`);
      } else {
        _push(`<!--[--><div class="az-kpi-grid" data-v-38d20b62><div class="az-kpi az-kpi--error" data-v-38d20b62><div class="az-kpi__icon az-kpi__icon--error" data-v-38d20b62>`);
        _push(ssrRenderComponent(VIcon, { size: "20" }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`mdi-cash-remove`);
            } else {
              return [
                createTextVNode("mdi-cash-remove")
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(`</div><div class="az-kpi__body" data-v-38d20b62><p class="az-kpi__label" data-v-38d20b62>Total Outstanding</p><p class="az-kpi__value text-error" data-v-38d20b62>${ssrInterpolate(formatMoney(unref(kpis).outstanding))}</p><p class="az-kpi__sub" data-v-38d20b62>${ssrInterpolate(unref(kpis).openCount)} open accounts</p></div></div><div class="az-kpi az-kpi--success" data-v-38d20b62><div class="az-kpi__icon az-kpi__icon--success" data-v-38d20b62>`);
        _push(ssrRenderComponent(VIcon, { size: "20" }, {
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
        _push(`</div><div class="az-kpi__body" data-v-38d20b62><p class="az-kpi__label" data-v-38d20b62>Total Collected</p><p class="az-kpi__value text-success" data-v-38d20b62>${ssrInterpolate(formatMoney(unref(kpis).collected))}</p><p class="az-kpi__sub" data-v-38d20b62>${ssrInterpolate(unref(kpis).settledCount)} settled accounts</p></div></div><div class="az-kpi az-kpi--info" data-v-38d20b62><div class="az-kpi__icon az-kpi__icon--info" data-v-38d20b62>`);
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
        _push(`</div><div class="az-kpi__body" data-v-38d20b62><p class="az-kpi__label" data-v-38d20b62>Total Credit Extended</p><p class="az-kpi__value text-info" data-v-38d20b62>${ssrInterpolate(formatMoney(unref(kpis).totalCredit))}</p><p class="az-kpi__sub" data-v-38d20b62>${ssrInterpolate(unref(kpis).totalCount)} transactions</p></div></div><div class="az-kpi az-kpi--warning" data-v-38d20b62><div class="az-kpi__icon az-kpi__icon--warning" data-v-38d20b62>`);
        _push(ssrRenderComponent(VIcon, { size: "20" }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`mdi-alert-circle-outline`);
            } else {
              return [
                createTextVNode("mdi-alert-circle-outline")
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(`</div><div class="az-kpi__body" data-v-38d20b62><p class="az-kpi__label" data-v-38d20b62>Overdue</p><p class="az-kpi__value text-warning" data-v-38d20b62>${ssrInterpolate(formatMoney(unref(kpis).overdueAmount))}</p><p class="az-kpi__sub" data-v-38d20b62>${ssrInterpolate(unref(kpis).overdueCount)} accounts overdue</p></div></div><div class="az-kpi az-kpi--purple" data-v-38d20b62><div class="az-kpi__icon az-kpi__icon--purple" data-v-38d20b62>`);
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
        _push(`</div><div class="az-kpi__body" data-v-38d20b62><p class="az-kpi__label" data-v-38d20b62>Collection Rate</p><p class="az-kpi__value" style="${ssrRenderStyle({ "color": "#7C4DFF" })}" data-v-38d20b62>${ssrInterpolate(unref(kpis).collectionRate)}%</p><p class="az-kpi__sub" data-v-38d20b62>${ssrInterpolate(unref(kpis).partialCount)} partial payments</p></div></div><div class="az-kpi az-kpi--teal" data-v-38d20b62><div class="az-kpi__icon az-kpi__icon--teal" data-v-38d20b62>`);
        _push(ssrRenderComponent(VIcon, { size: "20" }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`mdi-calendar-alert`);
            } else {
              return [
                createTextVNode("mdi-calendar-alert")
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(`</div><div class="az-kpi__body" data-v-38d20b62><p class="az-kpi__label" data-v-38d20b62>Avg Days to Collect</p><p class="az-kpi__value" style="${ssrRenderStyle({ "color": "#00B8D4" })}" data-v-38d20b62>${ssrInterpolate(unref(kpis).avgDays)}</p><p class="az-kpi__sub" data-v-38d20b62>across settled accounts</p></div></div></div><div class="az-chart-row az-chart-row--first" data-v-38d20b62><div class="az-card az-card--two-thirds" data-v-38d20b62><div class="az-card__header" data-v-38d20b62><div class="az-card__header-icon az-card__header-icon--blue" data-v-38d20b62>`);
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
        _push(`</div><div data-v-38d20b62><h3 class="az-card__title" data-v-38d20b62>Credit Outstanding Trend</h3><p class="az-card__subtitle" data-v-38d20b62>Outstanding balance over time</p></div></div><div class="az-card__body" data-v-38d20b62>`);
        _push(ssrRenderComponent(_component_apexchart, {
          type: "area",
          height: "300",
          options: trendOptions,
          series: unref(trendSeries)
        }, null, _parent));
        _push(`</div></div><div class="az-card az-card--third" data-v-38d20b62><div class="az-card__header" data-v-38d20b62><div class="az-card__header-icon az-card__header-icon--rose" data-v-38d20b62>`);
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
        _push(`</div><div data-v-38d20b62><h3 class="az-card__title" data-v-38d20b62>By Status</h3><p class="az-card__subtitle" data-v-38d20b62>Distribution of credit accounts</p></div></div><div class="az-card__body" data-v-38d20b62>`);
        _push(ssrRenderComponent(_component_apexchart, {
          type: "donut",
          height: "300",
          options: statusDonutOptions,
          series: unref(statusDonutSeries)
        }, null, _parent));
        _push(`</div></div></div><div class="az-aging-wrap" data-v-38d20b62><div class="az-aging-title" data-v-38d20b62>`);
        _push(ssrRenderComponent(VIcon, {
          size: "18",
          color: "primary"
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`mdi-timer-sand`);
            } else {
              return [
                createTextVNode("mdi-timer-sand")
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(`<span data-v-38d20b62>Receivables Aging Analysis</span></div><div class="az-aging-grid" data-v-38d20b62><!--[-->`);
        ssrRenderList(unref(agingBuckets), (b) => {
          _push(`<div class="az-aging-bucket" data-v-38d20b62><div class="az-aging-bucket__bar" style="${ssrRenderStyle({ background: b.color })}" data-v-38d20b62></div><div class="az-aging-bucket__body" data-v-38d20b62><p class="az-aging-bucket__label" data-v-38d20b62>${ssrInterpolate(b.label)}</p><p class="az-aging-bucket__value" style="${ssrRenderStyle({ color: b.color })}" data-v-38d20b62>${ssrInterpolate(formatMoney(b.amount))}</p><p class="az-aging-bucket__count" data-v-38d20b62>${ssrInterpolate(b.count)} accounts</p></div></div>`);
        });
        _push(`<!--]--></div></div><div class="az-filters" data-v-38d20b62>`);
        _push(ssrRenderComponent(VTextField, {
          modelValue: unref(searchText),
          "onUpdate:modelValue": ($event) => isRef(searchText) ? searchText.value = $event : null,
          "prepend-inner-icon": "mdi-magnify",
          placeholder: "Search customer, phone, transaction #...",
          density: "compact",
          variant: "outlined",
          "hide-details": "",
          class: "az-filters__search"
        }, null, _parent));
        _push(ssrRenderComponent(VSelect, {
          modelValue: unref(statusFilter),
          "onUpdate:modelValue": ($event) => isRef(statusFilter) ? statusFilter.value = $event : null,
          items: ["open", "partial", "settled", "overdue"],
          density: "compact",
          variant: "outlined",
          "hide-details": "",
          label: "Status",
          clearable: "",
          class: "az-filters__select"
        }, null, _parent));
        if (unref(searchText) || unref(statusFilter)) {
          _push(ssrRenderComponent(VBtn, {
            variant: "text",
            size: "small",
            "prepend-icon": "mdi-filter-remove",
            onClick: ($event) => {
              searchText.value = "";
              statusFilter.value = null;
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
        _push(`</div><div class="az-tabs" data-v-38d20b62><!--[-->`);
        ssrRenderList(unref(tabs), (tab) => {
          _push(`<button class="${ssrRenderClass([{ "az-tab--active": unref(activeTab) === tab.id }, "az-tab"])}" data-v-38d20b62>`);
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
          _push(` ${ssrInterpolate(tab.label)} <span class="az-tab__badge" data-v-38d20b62>${ssrInterpolate(tab.count)}</span></button>`);
        });
        _push(`<!--]--></div><div class="az-table-wrap" data-v-38d20b62><table class="az-table" data-v-38d20b62><thead data-v-38d20b62><tr data-v-38d20b62><th data-v-38d20b62>Customer</th><th data-v-38d20b62>Transaction #</th><th data-v-38d20b62>Date</th><th class="text-right" data-v-38d20b62>Total</th><th class="text-right" data-v-38d20b62>Paid</th><th class="text-right" data-v-38d20b62>Balance</th><th data-v-38d20b62>Progress</th><th data-v-38d20b62>Due Date</th><th data-v-38d20b62>Status</th><th data-v-38d20b62></th></tr></thead><tbody data-v-38d20b62><!--[-->`);
        ssrRenderList(unref(pagedItems), (c) => {
          _push(`<tr class="az-table__row" data-v-38d20b62><td data-v-38d20b62><div class="az-customer-cell" data-v-38d20b62><div class="${ssrRenderClass([`az-avatar--${avatarColor(c.customer_name)}`, "az-avatar"])}" data-v-38d20b62>${ssrInterpolate(initials(c.customer_name))}</div><div data-v-38d20b62><div class="font-weight-medium" data-v-38d20b62>${ssrInterpolate(c.customer_name)}</div>`);
          if (c.customer_phone) {
            _push(`<div class="text-caption text-medium-emphasis" data-v-38d20b62>`);
            _push(ssrRenderComponent(VIcon, { size: "12" }, {
              default: withCtx((_, _push2, _parent2, _scopeId) => {
                if (_push2) {
                  _push2(`mdi-phone`);
                } else {
                  return [
                    createTextVNode("mdi-phone")
                  ];
                }
              }),
              _: 2
            }, _parent));
            _push(` ${ssrInterpolate(c.customer_phone)}</div>`);
          } else {
            _push(`<!---->`);
          }
          _push(`</div></div></td><td class="text-medium-emphasis font-weight-medium" data-v-38d20b62>${ssrInterpolate(c.transaction_number || "—")}</td><td class="text-medium-emphasis" data-v-38d20b62>${ssrInterpolate(formatDate(c.created_at))}</td><td class="text-right font-weight-medium" data-v-38d20b62>${ssrInterpolate(formatMoney(c.total_amount))}</td><td class="text-right text-success" data-v-38d20b62>${ssrInterpolate(formatMoney(c.amount_paid))}</td><td class="${ssrRenderClass([Number(c.balance) > 0 ? "text-error" : "text-success", "text-right font-weight-bold"])}" data-v-38d20b62>${ssrInterpolate(formatMoney(c.balance))}</td><td data-v-38d20b62><div class="az-progress-wrap" data-v-38d20b62><div class="az-progress-bar" data-v-38d20b62><div style="${ssrRenderStyle({ width: progressPct(c) + "%" })}" class="${ssrRenderClass([progressClass(c), "az-progress-fill"])}" data-v-38d20b62></div></div><span class="az-progress-label" data-v-38d20b62>${ssrInterpolate(progressPct(c))}%</span></div></td><td data-v-38d20b62><span class="${ssrRenderClass(isOverdue(c) ? "text-error font-weight-bold" : "text-medium-emphasis")}" data-v-38d20b62>${ssrInterpolate(c.due_date ? formatDate(c.due_date) : "—")} `);
          if (isOverdue(c)) {
            _push(ssrRenderComponent(VChip, {
              size: "x-small",
              variant: "tonal",
              color: "error",
              class: "ml-1"
            }, {
              default: withCtx((_, _push2, _parent2, _scopeId) => {
                if (_push2) {
                  _push2(`${ssrInterpolate(daysOverdue(c))}d late`);
                } else {
                  return [
                    createTextVNode(toDisplayString(daysOverdue(c)) + "d late", 1)
                  ];
                }
              }),
              _: 2
            }, _parent));
          } else {
            _push(`<!---->`);
          }
          _push(`</span></td><td data-v-38d20b62><span class="${ssrRenderClass([`az-status-chip--${statusClass(c.status)}`, "az-status-chip"])}" data-v-38d20b62>${ssrInterpolate(c.status_display || c.status)}</span></td><td data-v-38d20b62><div class="az-row-actions" data-v-38d20b62>`);
          _push(ssrRenderComponent(VBtn, {
            size: "small",
            variant: "tonal",
            color: "success",
            "prepend-icon": "mdi-cash-plus",
            onClick: ($event) => openPayment(c),
            disabled: Number(c.balance) <= 0
          }, {
            default: withCtx((_, _push2, _parent2, _scopeId) => {
              if (_push2) {
                _push2(`<span class="d-none d-sm-inline" data-v-38d20b62${_scopeId}>Pay</span>`);
              } else {
                return [
                  createVNode("span", { class: "d-none d-sm-inline" }, "Pay")
                ];
              }
            }),
            _: 2
          }, _parent));
          _push(ssrRenderComponent(VBtn, {
            size: "small",
            variant: "text",
            icon: "mdi-history",
            onClick: ($event) => viewHistory(c)
          }, null, _parent));
          _push(`</div></td></tr>`);
        });
        _push(`<!--]-->`);
        if (!unref(pagedItems).length) {
          _push(`<tr data-v-38d20b62><td colspan="10" class="az-table__empty" data-v-38d20b62>`);
          _push(ssrRenderComponent(VIcon, {
            size: "36",
            color: "grey-lighten-1"
          }, {
            default: withCtx((_, _push2, _parent2, _scopeId) => {
              if (_push2) {
                _push2(`mdi-credit-card-off-outline`);
              } else {
                return [
                  createTextVNode("mdi-credit-card-off-outline")
                ];
              }
            }),
            _: 1
          }, _parent));
          _push(`<p class="text-body-2 mt-2 text-medium-emphasis" data-v-38d20b62>No credit accounts found.</p></td></tr>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</tbody></table>`);
        if (unref(filtered).length > itemsPerPage) {
          _push(`<div class="az-pagination" data-v-38d20b62>`);
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
          _push(`<span class="az-pagination__info" data-v-38d20b62>Page ${ssrInterpolate(unref(page))} of ${ssrInterpolate(unref(totalPages))}</span>`);
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
        if (unref(topDebtors).length > 0) {
          _push(`<div class="az-debtors-section" data-v-38d20b62><div class="az-debtors-title" data-v-38d20b62>`);
          _push(ssrRenderComponent(VIcon, {
            size: "18",
            color: "error"
          }, {
            default: withCtx((_, _push2, _parent2, _scopeId) => {
              if (_push2) {
                _push2(`mdi-account-alert-outline`);
              } else {
                return [
                  createTextVNode("mdi-account-alert-outline")
                ];
              }
            }),
            _: 1
          }, _parent));
          _push(`<span data-v-38d20b62>Top Debtors</span></div><div class="az-debtors-grid" data-v-38d20b62><!--[-->`);
          ssrRenderList(unref(topDebtors), (d, i) => {
            _push(`<div class="az-debtor-card" data-v-38d20b62><div class="az-debtor-rank" data-v-38d20b62>#${ssrInterpolate(i + 1)}</div><div class="az-avatar az-avatar--error" data-v-38d20b62>${ssrInterpolate(initials(d.customer_name))}</div><div class="az-debtor-info" data-v-38d20b62><p class="az-debtor-name" data-v-38d20b62>${ssrInterpolate(d.customer_name)}</p><p class="az-debtor-sub" data-v-38d20b62>${ssrInterpolate(d.customer_phone || "No phone")}</p></div><div class="az-debtor-amount" data-v-38d20b62><p class="font-weight-bold text-error" data-v-38d20b62>${ssrInterpolate(formatMoney(d.balance))}</p><p class="text-caption text-medium-emphasis" data-v-38d20b62>${ssrInterpolate(d.status_display || d.status)}</p></div></div>`);
          });
          _push(`<!--]--></div></div>`);
        } else {
          _push(`<!---->`);
        }
        _push(`<!--]-->`);
      }
      _push(ssrRenderComponent(VDialog, {
        modelValue: unref(paymentDialog),
        "onUpdate:modelValue": ($event) => isRef(paymentDialog) ? paymentDialog.value = $event : null,
        "max-width": "520"
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
                        _push4(ssrRenderComponent(VIcon, {
                          class: "mr-2",
                          color: "success"
                        }, {
                          default: withCtx((_4, _push5, _parent5, _scopeId4) => {
                            if (_push5) {
                              _push5(`mdi-cash-plus`);
                            } else {
                              return [
                                createTextVNode("mdi-cash-plus")
                              ];
                            }
                          }),
                          _: 1
                        }, _parent4, _scopeId3));
                        _push4(` Record Credit Payment `);
                      } else {
                        return [
                          createVNode(VIcon, {
                            class: "mr-2",
                            color: "success"
                          }, {
                            default: withCtx(() => [
                              createTextVNode("mdi-cash-plus")
                            ]),
                            _: 1
                          }),
                          createTextVNode(" Record Credit Payment ")
                        ];
                      }
                    }),
                    _: 1
                  }, _parent3, _scopeId2));
                  if (unref(selectedCredit)) {
                    _push3(ssrRenderComponent(VCardText, null, {
                      default: withCtx((_3, _push4, _parent4, _scopeId3) => {
                        if (_push4) {
                          _push4(`<div class="az-pay-summary" data-v-38d20b62${_scopeId3}><div class="az-pay-summary__row" data-v-38d20b62${_scopeId3}><span data-v-38d20b62${_scopeId3}>Customer</span><span class="font-weight-bold" data-v-38d20b62${_scopeId3}>${ssrInterpolate(unref(selectedCredit).customer_name)}</span></div><div class="az-pay-summary__row" data-v-38d20b62${_scopeId3}><span data-v-38d20b62${_scopeId3}>Transaction</span><span class="font-weight-medium" data-v-38d20b62${_scopeId3}>${ssrInterpolate(unref(selectedCredit).transaction_number || "—")}</span></div><div class="az-pay-summary__row" data-v-38d20b62${_scopeId3}><span data-v-38d20b62${_scopeId3}>Total Amount</span><span data-v-38d20b62${_scopeId3}>${ssrInterpolate(formatMoney(unref(selectedCredit).total_amount))}</span></div><div class="az-pay-summary__row" data-v-38d20b62${_scopeId3}><span data-v-38d20b62${_scopeId3}>Already Paid</span><span class="text-success font-weight-medium" data-v-38d20b62${_scopeId3}>${ssrInterpolate(formatMoney(unref(selectedCredit).amount_paid))}</span></div><div class="az-pay-summary__row az-pay-summary__row--bold" data-v-38d20b62${_scopeId3}><span data-v-38d20b62${_scopeId3}>Outstanding Balance</span><span class="text-error font-weight-bold" data-v-38d20b62${_scopeId3}>${ssrInterpolate(formatMoney(unref(selectedCredit).balance))}</span></div></div><div class="az-quick-amt" data-v-38d20b62${_scopeId3}><button class="az-quick-amt__btn" data-v-38d20b62${_scopeId3}>Full</button><button class="az-quick-amt__btn" data-v-38d20b62${_scopeId3}>Half</button><button class="az-quick-amt__btn" data-v-38d20b62${_scopeId3}>25%</button><button class="az-quick-amt__btn" data-v-38d20b62${_scopeId3}>Clear</button></div>`);
                          _push4(ssrRenderComponent(VTextField, {
                            modelValue: unref(paymentAmount),
                            "onUpdate:modelValue": ($event) => isRef(paymentAmount) ? paymentAmount.value = $event : null,
                            modelModifiers: { number: true },
                            label: "Payment Amount",
                            type: "number",
                            prefix: "KSh",
                            density: "compact",
                            variant: "outlined",
                            "hide-details": "auto",
                            class: "mt-1"
                          }, null, _parent4, _scopeId3));
                          _push4(ssrRenderComponent(VSelect, {
                            modelValue: unref(paymentMethod),
                            "onUpdate:modelValue": ($event) => isRef(paymentMethod) ? paymentMethod.value = $event : null,
                            items: paymentMethods,
                            label: "Payment Method",
                            density: "compact",
                            variant: "outlined",
                            "hide-details": "auto",
                            class: "mt-3"
                          }, null, _parent4, _scopeId3));
                          _push4(ssrRenderComponent(VTextField, {
                            modelValue: unref(paymentRef),
                            "onUpdate:modelValue": ($event) => isRef(paymentRef) ? paymentRef.value = $event : null,
                            label: "Reference (optional)",
                            density: "compact",
                            variant: "outlined",
                            "hide-details": "auto",
                            class: "mt-3"
                          }, null, _parent4, _scopeId3));
                          _push4(ssrRenderComponent(VTextarea, {
                            modelValue: unref(paymentNotes),
                            "onUpdate:modelValue": ($event) => isRef(paymentNotes) ? paymentNotes.value = $event : null,
                            label: "Notes (optional)",
                            density: "compact",
                            variant: "outlined",
                            "hide-details": "auto",
                            rows: "2",
                            class: "mt-3"
                          }, null, _parent4, _scopeId3));
                        } else {
                          return [
                            createVNode("div", { class: "az-pay-summary" }, [
                              createVNode("div", { class: "az-pay-summary__row" }, [
                                createVNode("span", null, "Customer"),
                                createVNode("span", { class: "font-weight-bold" }, toDisplayString(unref(selectedCredit).customer_name), 1)
                              ]),
                              createVNode("div", { class: "az-pay-summary__row" }, [
                                createVNode("span", null, "Transaction"),
                                createVNode("span", { class: "font-weight-medium" }, toDisplayString(unref(selectedCredit).transaction_number || "—"), 1)
                              ]),
                              createVNode("div", { class: "az-pay-summary__row" }, [
                                createVNode("span", null, "Total Amount"),
                                createVNode("span", null, toDisplayString(formatMoney(unref(selectedCredit).total_amount)), 1)
                              ]),
                              createVNode("div", { class: "az-pay-summary__row" }, [
                                createVNode("span", null, "Already Paid"),
                                createVNode("span", { class: "text-success font-weight-medium" }, toDisplayString(formatMoney(unref(selectedCredit).amount_paid)), 1)
                              ]),
                              createVNode("div", { class: "az-pay-summary__row az-pay-summary__row--bold" }, [
                                createVNode("span", null, "Outstanding Balance"),
                                createVNode("span", { class: "text-error font-weight-bold" }, toDisplayString(formatMoney(unref(selectedCredit).balance)), 1)
                              ])
                            ]),
                            createVNode("div", { class: "az-quick-amt" }, [
                              createVNode("button", {
                                class: "az-quick-amt__btn",
                                onClick: ($event) => paymentAmount.value = Number(unref(selectedCredit).balance)
                              }, "Full", 8, ["onClick"]),
                              createVNode("button", {
                                class: "az-quick-amt__btn",
                                onClick: ($event) => paymentAmount.value = Math.round(Number(unref(selectedCredit).balance) / 2)
                              }, "Half", 8, ["onClick"]),
                              createVNode("button", {
                                class: "az-quick-amt__btn",
                                onClick: ($event) => paymentAmount.value = Math.round(Number(unref(selectedCredit).balance) * 0.25)
                              }, "25%", 8, ["onClick"]),
                              createVNode("button", {
                                class: "az-quick-amt__btn",
                                onClick: ($event) => paymentAmount.value = 0
                              }, "Clear", 8, ["onClick"])
                            ]),
                            createVNode(VTextField, {
                              modelValue: unref(paymentAmount),
                              "onUpdate:modelValue": ($event) => isRef(paymentAmount) ? paymentAmount.value = $event : null,
                              modelModifiers: { number: true },
                              label: "Payment Amount",
                              type: "number",
                              prefix: "KSh",
                              density: "compact",
                              variant: "outlined",
                              "hide-details": "auto",
                              class: "mt-1"
                            }, null, 8, ["modelValue", "onUpdate:modelValue"]),
                            createVNode(VSelect, {
                              modelValue: unref(paymentMethod),
                              "onUpdate:modelValue": ($event) => isRef(paymentMethod) ? paymentMethod.value = $event : null,
                              items: paymentMethods,
                              label: "Payment Method",
                              density: "compact",
                              variant: "outlined",
                              "hide-details": "auto",
                              class: "mt-3"
                            }, null, 8, ["modelValue", "onUpdate:modelValue"]),
                            createVNode(VTextField, {
                              modelValue: unref(paymentRef),
                              "onUpdate:modelValue": ($event) => isRef(paymentRef) ? paymentRef.value = $event : null,
                              label: "Reference (optional)",
                              density: "compact",
                              variant: "outlined",
                              "hide-details": "auto",
                              class: "mt-3"
                            }, null, 8, ["modelValue", "onUpdate:modelValue"]),
                            createVNode(VTextarea, {
                              modelValue: unref(paymentNotes),
                              "onUpdate:modelValue": ($event) => isRef(paymentNotes) ? paymentNotes.value = $event : null,
                              label: "Notes (optional)",
                              density: "compact",
                              variant: "outlined",
                              "hide-details": "auto",
                              rows: "2",
                              class: "mt-3"
                            }, null, 8, ["modelValue", "onUpdate:modelValue"])
                          ];
                        }
                      }),
                      _: 1
                    }, _parent3, _scopeId2));
                  } else {
                    _push3(`<!---->`);
                  }
                  _push3(ssrRenderComponent(VCardActions, { class: "px-4 pb-4" }, {
                    default: withCtx((_3, _push4, _parent4, _scopeId3) => {
                      if (_push4) {
                        _push4(ssrRenderComponent(VSpacer, null, null, _parent4, _scopeId3));
                        _push4(ssrRenderComponent(VBtn, {
                          variant: "text",
                          onClick: ($event) => paymentDialog.value = false
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
                          color: "success",
                          "prepend-icon": "mdi-check",
                          onClick: recordPayment,
                          loading: unref(saving)
                        }, {
                          default: withCtx((_4, _push5, _parent5, _scopeId4) => {
                            if (_push5) {
                              _push5(`Record Payment`);
                            } else {
                              return [
                                createTextVNode("Record Payment")
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
                            onClick: ($event) => paymentDialog.value = false
                          }, {
                            default: withCtx(() => [
                              createTextVNode("Cancel")
                            ]),
                            _: 1
                          }, 8, ["onClick"]),
                          createVNode(VBtn, {
                            variant: "flat",
                            color: "success",
                            "prepend-icon": "mdi-check",
                            onClick: recordPayment,
                            loading: unref(saving)
                          }, {
                            default: withCtx(() => [
                              createTextVNode("Record Payment")
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
                        createVNode(VIcon, {
                          class: "mr-2",
                          color: "success"
                        }, {
                          default: withCtx(() => [
                            createTextVNode("mdi-cash-plus")
                          ]),
                          _: 1
                        }),
                        createTextVNode(" Record Credit Payment ")
                      ]),
                      _: 1
                    }),
                    unref(selectedCredit) ? (openBlock(), createBlock(VCardText, { key: 0 }, {
                      default: withCtx(() => [
                        createVNode("div", { class: "az-pay-summary" }, [
                          createVNode("div", { class: "az-pay-summary__row" }, [
                            createVNode("span", null, "Customer"),
                            createVNode("span", { class: "font-weight-bold" }, toDisplayString(unref(selectedCredit).customer_name), 1)
                          ]),
                          createVNode("div", { class: "az-pay-summary__row" }, [
                            createVNode("span", null, "Transaction"),
                            createVNode("span", { class: "font-weight-medium" }, toDisplayString(unref(selectedCredit).transaction_number || "—"), 1)
                          ]),
                          createVNode("div", { class: "az-pay-summary__row" }, [
                            createVNode("span", null, "Total Amount"),
                            createVNode("span", null, toDisplayString(formatMoney(unref(selectedCredit).total_amount)), 1)
                          ]),
                          createVNode("div", { class: "az-pay-summary__row" }, [
                            createVNode("span", null, "Already Paid"),
                            createVNode("span", { class: "text-success font-weight-medium" }, toDisplayString(formatMoney(unref(selectedCredit).amount_paid)), 1)
                          ]),
                          createVNode("div", { class: "az-pay-summary__row az-pay-summary__row--bold" }, [
                            createVNode("span", null, "Outstanding Balance"),
                            createVNode("span", { class: "text-error font-weight-bold" }, toDisplayString(formatMoney(unref(selectedCredit).balance)), 1)
                          ])
                        ]),
                        createVNode("div", { class: "az-quick-amt" }, [
                          createVNode("button", {
                            class: "az-quick-amt__btn",
                            onClick: ($event) => paymentAmount.value = Number(unref(selectedCredit).balance)
                          }, "Full", 8, ["onClick"]),
                          createVNode("button", {
                            class: "az-quick-amt__btn",
                            onClick: ($event) => paymentAmount.value = Math.round(Number(unref(selectedCredit).balance) / 2)
                          }, "Half", 8, ["onClick"]),
                          createVNode("button", {
                            class: "az-quick-amt__btn",
                            onClick: ($event) => paymentAmount.value = Math.round(Number(unref(selectedCredit).balance) * 0.25)
                          }, "25%", 8, ["onClick"]),
                          createVNode("button", {
                            class: "az-quick-amt__btn",
                            onClick: ($event) => paymentAmount.value = 0
                          }, "Clear", 8, ["onClick"])
                        ]),
                        createVNode(VTextField, {
                          modelValue: unref(paymentAmount),
                          "onUpdate:modelValue": ($event) => isRef(paymentAmount) ? paymentAmount.value = $event : null,
                          modelModifiers: { number: true },
                          label: "Payment Amount",
                          type: "number",
                          prefix: "KSh",
                          density: "compact",
                          variant: "outlined",
                          "hide-details": "auto",
                          class: "mt-1"
                        }, null, 8, ["modelValue", "onUpdate:modelValue"]),
                        createVNode(VSelect, {
                          modelValue: unref(paymentMethod),
                          "onUpdate:modelValue": ($event) => isRef(paymentMethod) ? paymentMethod.value = $event : null,
                          items: paymentMethods,
                          label: "Payment Method",
                          density: "compact",
                          variant: "outlined",
                          "hide-details": "auto",
                          class: "mt-3"
                        }, null, 8, ["modelValue", "onUpdate:modelValue"]),
                        createVNode(VTextField, {
                          modelValue: unref(paymentRef),
                          "onUpdate:modelValue": ($event) => isRef(paymentRef) ? paymentRef.value = $event : null,
                          label: "Reference (optional)",
                          density: "compact",
                          variant: "outlined",
                          "hide-details": "auto",
                          class: "mt-3"
                        }, null, 8, ["modelValue", "onUpdate:modelValue"]),
                        createVNode(VTextarea, {
                          modelValue: unref(paymentNotes),
                          "onUpdate:modelValue": ($event) => isRef(paymentNotes) ? paymentNotes.value = $event : null,
                          label: "Notes (optional)",
                          density: "compact",
                          variant: "outlined",
                          "hide-details": "auto",
                          rows: "2",
                          class: "mt-3"
                        }, null, 8, ["modelValue", "onUpdate:modelValue"])
                      ]),
                      _: 1
                    })) : createCommentVNode("", true),
                    createVNode(VCardActions, { class: "px-4 pb-4" }, {
                      default: withCtx(() => [
                        createVNode(VSpacer),
                        createVNode(VBtn, {
                          variant: "text",
                          onClick: ($event) => paymentDialog.value = false
                        }, {
                          default: withCtx(() => [
                            createTextVNode("Cancel")
                          ]),
                          _: 1
                        }, 8, ["onClick"]),
                        createVNode(VBtn, {
                          variant: "flat",
                          color: "success",
                          "prepend-icon": "mdi-check",
                          onClick: recordPayment,
                          loading: unref(saving)
                        }, {
                          default: withCtx(() => [
                            createTextVNode("Record Payment")
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
                      createVNode(VIcon, {
                        class: "mr-2",
                        color: "success"
                      }, {
                        default: withCtx(() => [
                          createTextVNode("mdi-cash-plus")
                        ]),
                        _: 1
                      }),
                      createTextVNode(" Record Credit Payment ")
                    ]),
                    _: 1
                  }),
                  unref(selectedCredit) ? (openBlock(), createBlock(VCardText, { key: 0 }, {
                    default: withCtx(() => [
                      createVNode("div", { class: "az-pay-summary" }, [
                        createVNode("div", { class: "az-pay-summary__row" }, [
                          createVNode("span", null, "Customer"),
                          createVNode("span", { class: "font-weight-bold" }, toDisplayString(unref(selectedCredit).customer_name), 1)
                        ]),
                        createVNode("div", { class: "az-pay-summary__row" }, [
                          createVNode("span", null, "Transaction"),
                          createVNode("span", { class: "font-weight-medium" }, toDisplayString(unref(selectedCredit).transaction_number || "—"), 1)
                        ]),
                        createVNode("div", { class: "az-pay-summary__row" }, [
                          createVNode("span", null, "Total Amount"),
                          createVNode("span", null, toDisplayString(formatMoney(unref(selectedCredit).total_amount)), 1)
                        ]),
                        createVNode("div", { class: "az-pay-summary__row" }, [
                          createVNode("span", null, "Already Paid"),
                          createVNode("span", { class: "text-success font-weight-medium" }, toDisplayString(formatMoney(unref(selectedCredit).amount_paid)), 1)
                        ]),
                        createVNode("div", { class: "az-pay-summary__row az-pay-summary__row--bold" }, [
                          createVNode("span", null, "Outstanding Balance"),
                          createVNode("span", { class: "text-error font-weight-bold" }, toDisplayString(formatMoney(unref(selectedCredit).balance)), 1)
                        ])
                      ]),
                      createVNode("div", { class: "az-quick-amt" }, [
                        createVNode("button", {
                          class: "az-quick-amt__btn",
                          onClick: ($event) => paymentAmount.value = Number(unref(selectedCredit).balance)
                        }, "Full", 8, ["onClick"]),
                        createVNode("button", {
                          class: "az-quick-amt__btn",
                          onClick: ($event) => paymentAmount.value = Math.round(Number(unref(selectedCredit).balance) / 2)
                        }, "Half", 8, ["onClick"]),
                        createVNode("button", {
                          class: "az-quick-amt__btn",
                          onClick: ($event) => paymentAmount.value = Math.round(Number(unref(selectedCredit).balance) * 0.25)
                        }, "25%", 8, ["onClick"]),
                        createVNode("button", {
                          class: "az-quick-amt__btn",
                          onClick: ($event) => paymentAmount.value = 0
                        }, "Clear", 8, ["onClick"])
                      ]),
                      createVNode(VTextField, {
                        modelValue: unref(paymentAmount),
                        "onUpdate:modelValue": ($event) => isRef(paymentAmount) ? paymentAmount.value = $event : null,
                        modelModifiers: { number: true },
                        label: "Payment Amount",
                        type: "number",
                        prefix: "KSh",
                        density: "compact",
                        variant: "outlined",
                        "hide-details": "auto",
                        class: "mt-1"
                      }, null, 8, ["modelValue", "onUpdate:modelValue"]),
                      createVNode(VSelect, {
                        modelValue: unref(paymentMethod),
                        "onUpdate:modelValue": ($event) => isRef(paymentMethod) ? paymentMethod.value = $event : null,
                        items: paymentMethods,
                        label: "Payment Method",
                        density: "compact",
                        variant: "outlined",
                        "hide-details": "auto",
                        class: "mt-3"
                      }, null, 8, ["modelValue", "onUpdate:modelValue"]),
                      createVNode(VTextField, {
                        modelValue: unref(paymentRef),
                        "onUpdate:modelValue": ($event) => isRef(paymentRef) ? paymentRef.value = $event : null,
                        label: "Reference (optional)",
                        density: "compact",
                        variant: "outlined",
                        "hide-details": "auto",
                        class: "mt-3"
                      }, null, 8, ["modelValue", "onUpdate:modelValue"]),
                      createVNode(VTextarea, {
                        modelValue: unref(paymentNotes),
                        "onUpdate:modelValue": ($event) => isRef(paymentNotes) ? paymentNotes.value = $event : null,
                        label: "Notes (optional)",
                        density: "compact",
                        variant: "outlined",
                        "hide-details": "auto",
                        rows: "2",
                        class: "mt-3"
                      }, null, 8, ["modelValue", "onUpdate:modelValue"])
                    ]),
                    _: 1
                  })) : createCommentVNode("", true),
                  createVNode(VCardActions, { class: "px-4 pb-4" }, {
                    default: withCtx(() => [
                      createVNode(VSpacer),
                      createVNode(VBtn, {
                        variant: "text",
                        onClick: ($event) => paymentDialog.value = false
                      }, {
                        default: withCtx(() => [
                          createTextVNode("Cancel")
                        ]),
                        _: 1
                      }, 8, ["onClick"]),
                      createVNode(VBtn, {
                        variant: "flat",
                        color: "success",
                        "prepend-icon": "mdi-check",
                        onClick: recordPayment,
                        loading: unref(saving)
                      }, {
                        default: withCtx(() => [
                          createTextVNode("Record Payment")
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
        modelValue: unref(historyDialog),
        "onUpdate:modelValue": ($event) => isRef(historyDialog) ? historyDialog.value = $event : null,
        "max-width": "600"
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
                        _push4(ssrRenderComponent(VIcon, {
                          class: "mr-2",
                          color: "info"
                        }, {
                          default: withCtx((_4, _push5, _parent5, _scopeId4) => {
                            if (_push5) {
                              _push5(`mdi-history`);
                            } else {
                              return [
                                createTextVNode("mdi-history")
                              ];
                            }
                          }),
                          _: 1
                        }, _parent4, _scopeId3));
                        _push4(` Payment History — ${ssrInterpolate(unref(selectedCredit)?.customer_name)}`);
                      } else {
                        return [
                          createVNode(VIcon, {
                            class: "mr-2",
                            color: "info"
                          }, {
                            default: withCtx(() => [
                              createTextVNode("mdi-history")
                            ]),
                            _: 1
                          }),
                          createTextVNode(" Payment History — " + toDisplayString(unref(selectedCredit)?.customer_name), 1)
                        ];
                      }
                    }),
                    _: 1
                  }, _parent3, _scopeId2));
                  _push3(ssrRenderComponent(VCardText, null, {
                    default: withCtx((_3, _push4, _parent4, _scopeId3) => {
                      if (_push4) {
                        if (unref(selectedCredit)) {
                          _push4(`<div class="az-history-summary" data-v-38d20b62${_scopeId3}><div class="az-history-summary__item" data-v-38d20b62${_scopeId3}><p class="text-caption text-medium-emphasis" data-v-38d20b62${_scopeId3}>Total Credit</p><p class="text-h6 font-weight-bold" data-v-38d20b62${_scopeId3}>${ssrInterpolate(formatMoney(unref(selectedCredit).total_amount))}</p></div><div class="az-history-summary__item" data-v-38d20b62${_scopeId3}><p class="text-caption text-medium-emphasis" data-v-38d20b62${_scopeId3}>Total Paid</p><p class="text-h6 font-weight-bold text-success" data-v-38d20b62${_scopeId3}>${ssrInterpolate(formatMoney(unref(selectedCredit).amount_paid))}</p></div><div class="az-history-summary__item" data-v-38d20b62${_scopeId3}><p class="text-caption text-medium-emphasis" data-v-38d20b62${_scopeId3}>Balance</p><p class="text-h6 font-weight-bold text-error" data-v-38d20b62${_scopeId3}>${ssrInterpolate(formatMoney(unref(selectedCredit).balance))}</p></div></div>`);
                        } else {
                          _push4(`<!---->`);
                        }
                        if (unref(paymentHistory).length > 0) {
                          _push4(ssrRenderComponent(VDataTable, {
                            items: unref(paymentHistory),
                            headers: historyHeaders,
                            density: "compact",
                            "items-per-page-text": "Rows per page"
                          }, {
                            "item.amount": withCtx(({ item }, _push5, _parent5, _scopeId4) => {
                              if (_push5) {
                                _push5(`<span class="font-weight-bold text-success" data-v-38d20b62${_scopeId4}>${ssrInterpolate(formatMoney(item.amount))}</span>`);
                              } else {
                                return [
                                  createVNode("span", { class: "font-weight-bold text-success" }, toDisplayString(formatMoney(item.amount)), 1)
                                ];
                              }
                            }),
                            "item.payment_method": withCtx(({ item }, _push5, _parent5, _scopeId4) => {
                              if (_push5) {
                                _push5(ssrRenderComponent(VChip, {
                                  size: "small",
                                  variant: "tonal",
                                  color: methodColor(item.payment_method)
                                }, {
                                  default: withCtx((_4, _push6, _parent6, _scopeId5) => {
                                    if (_push6) {
                                      _push6(`${ssrInterpolate(item.payment_method)}`);
                                    } else {
                                      return [
                                        createTextVNode(toDisplayString(item.payment_method), 1)
                                      ];
                                    }
                                  }),
                                  _: 2
                                }, _parent5, _scopeId4));
                              } else {
                                return [
                                  createVNode(VChip, {
                                    size: "small",
                                    variant: "tonal",
                                    color: methodColor(item.payment_method)
                                  }, {
                                    default: withCtx(() => [
                                      createTextVNode(toDisplayString(item.payment_method), 1)
                                    ]),
                                    _: 2
                                  }, 1032, ["color"])
                                ];
                              }
                            }),
                            "item.created_at": withCtx(({ item }, _push5, _parent5, _scopeId4) => {
                              if (_push5) {
                                _push5(`${ssrInterpolate(formatDate(item.created_at))}`);
                              } else {
                                return [
                                  createTextVNode(toDisplayString(formatDate(item.created_at)), 1)
                                ];
                              }
                            }),
                            _: 1
                          }, _parent4, _scopeId3));
                        } else {
                          _push4(`<div class="text-center text-medium-emphasis py-8" data-v-38d20b62${_scopeId3}>`);
                          _push4(ssrRenderComponent(VIcon, {
                            size: "40",
                            color: "grey-lighten-1"
                          }, {
                            default: withCtx((_4, _push5, _parent5, _scopeId4) => {
                              if (_push5) {
                                _push5(`mdi-clock-outline`);
                              } else {
                                return [
                                  createTextVNode("mdi-clock-outline")
                                ];
                              }
                            }),
                            _: 1
                          }, _parent4, _scopeId3));
                          _push4(`<p class="mt-2" data-v-38d20b62${_scopeId3}>No payments recorded yet.</p></div>`);
                        }
                      } else {
                        return [
                          unref(selectedCredit) ? (openBlock(), createBlock("div", {
                            key: 0,
                            class: "az-history-summary"
                          }, [
                            createVNode("div", { class: "az-history-summary__item" }, [
                              createVNode("p", { class: "text-caption text-medium-emphasis" }, "Total Credit"),
                              createVNode("p", { class: "text-h6 font-weight-bold" }, toDisplayString(formatMoney(unref(selectedCredit).total_amount)), 1)
                            ]),
                            createVNode("div", { class: "az-history-summary__item" }, [
                              createVNode("p", { class: "text-caption text-medium-emphasis" }, "Total Paid"),
                              createVNode("p", { class: "text-h6 font-weight-bold text-success" }, toDisplayString(formatMoney(unref(selectedCredit).amount_paid)), 1)
                            ]),
                            createVNode("div", { class: "az-history-summary__item" }, [
                              createVNode("p", { class: "text-caption text-medium-emphasis" }, "Balance"),
                              createVNode("p", { class: "text-h6 font-weight-bold text-error" }, toDisplayString(formatMoney(unref(selectedCredit).balance)), 1)
                            ])
                          ])) : createCommentVNode("", true),
                          unref(paymentHistory).length > 0 ? (openBlock(), createBlock(VDataTable, {
                            key: 1,
                            items: unref(paymentHistory),
                            headers: historyHeaders,
                            density: "compact",
                            "items-per-page-text": "Rows per page"
                          }, {
                            "item.amount": withCtx(({ item }) => [
                              createVNode("span", { class: "font-weight-bold text-success" }, toDisplayString(formatMoney(item.amount)), 1)
                            ]),
                            "item.payment_method": withCtx(({ item }) => [
                              createVNode(VChip, {
                                size: "small",
                                variant: "tonal",
                                color: methodColor(item.payment_method)
                              }, {
                                default: withCtx(() => [
                                  createTextVNode(toDisplayString(item.payment_method), 1)
                                ]),
                                _: 2
                              }, 1032, ["color"])
                            ]),
                            "item.created_at": withCtx(({ item }) => [
                              createTextVNode(toDisplayString(formatDate(item.created_at)), 1)
                            ]),
                            _: 1
                          }, 8, ["items"])) : (openBlock(), createBlock("div", {
                            key: 2,
                            class: "text-center text-medium-emphasis py-8"
                          }, [
                            createVNode(VIcon, {
                              size: "40",
                              color: "grey-lighten-1"
                            }, {
                              default: withCtx(() => [
                                createTextVNode("mdi-clock-outline")
                              ]),
                              _: 1
                            }),
                            createVNode("p", { class: "mt-2" }, "No payments recorded yet.")
                          ]))
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
                          onClick: ($event) => historyDialog.value = false
                        }, {
                          default: withCtx((_4, _push5, _parent5, _scopeId4) => {
                            if (_push5) {
                              _push5(`Close`);
                            } else {
                              return [
                                createTextVNode("Close")
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
                            onClick: ($event) => historyDialog.value = false
                          }, {
                            default: withCtx(() => [
                              createTextVNode("Close")
                            ]),
                            _: 1
                          }, 8, ["onClick"])
                        ];
                      }
                    }),
                    _: 1
                  }, _parent3, _scopeId2));
                } else {
                  return [
                    createVNode(VCardTitle, { class: "text-h6 font-weight-bold px-4 pt-4" }, {
                      default: withCtx(() => [
                        createVNode(VIcon, {
                          class: "mr-2",
                          color: "info"
                        }, {
                          default: withCtx(() => [
                            createTextVNode("mdi-history")
                          ]),
                          _: 1
                        }),
                        createTextVNode(" Payment History — " + toDisplayString(unref(selectedCredit)?.customer_name), 1)
                      ]),
                      _: 1
                    }),
                    createVNode(VCardText, null, {
                      default: withCtx(() => [
                        unref(selectedCredit) ? (openBlock(), createBlock("div", {
                          key: 0,
                          class: "az-history-summary"
                        }, [
                          createVNode("div", { class: "az-history-summary__item" }, [
                            createVNode("p", { class: "text-caption text-medium-emphasis" }, "Total Credit"),
                            createVNode("p", { class: "text-h6 font-weight-bold" }, toDisplayString(formatMoney(unref(selectedCredit).total_amount)), 1)
                          ]),
                          createVNode("div", { class: "az-history-summary__item" }, [
                            createVNode("p", { class: "text-caption text-medium-emphasis" }, "Total Paid"),
                            createVNode("p", { class: "text-h6 font-weight-bold text-success" }, toDisplayString(formatMoney(unref(selectedCredit).amount_paid)), 1)
                          ]),
                          createVNode("div", { class: "az-history-summary__item" }, [
                            createVNode("p", { class: "text-caption text-medium-emphasis" }, "Balance"),
                            createVNode("p", { class: "text-h6 font-weight-bold text-error" }, toDisplayString(formatMoney(unref(selectedCredit).balance)), 1)
                          ])
                        ])) : createCommentVNode("", true),
                        unref(paymentHistory).length > 0 ? (openBlock(), createBlock(VDataTable, {
                          key: 1,
                          items: unref(paymentHistory),
                          headers: historyHeaders,
                          density: "compact",
                          "items-per-page-text": "Rows per page"
                        }, {
                          "item.amount": withCtx(({ item }) => [
                            createVNode("span", { class: "font-weight-bold text-success" }, toDisplayString(formatMoney(item.amount)), 1)
                          ]),
                          "item.payment_method": withCtx(({ item }) => [
                            createVNode(VChip, {
                              size: "small",
                              variant: "tonal",
                              color: methodColor(item.payment_method)
                            }, {
                              default: withCtx(() => [
                                createTextVNode(toDisplayString(item.payment_method), 1)
                              ]),
                              _: 2
                            }, 1032, ["color"])
                          ]),
                          "item.created_at": withCtx(({ item }) => [
                            createTextVNode(toDisplayString(formatDate(item.created_at)), 1)
                          ]),
                          _: 1
                        }, 8, ["items"])) : (openBlock(), createBlock("div", {
                          key: 2,
                          class: "text-center text-medium-emphasis py-8"
                        }, [
                          createVNode(VIcon, {
                            size: "40",
                            color: "grey-lighten-1"
                          }, {
                            default: withCtx(() => [
                              createTextVNode("mdi-clock-outline")
                            ]),
                            _: 1
                          }),
                          createVNode("p", { class: "mt-2" }, "No payments recorded yet.")
                        ]))
                      ]),
                      _: 1
                    }),
                    createVNode(VCardActions, { class: "px-4 pb-4" }, {
                      default: withCtx(() => [
                        createVNode(VSpacer),
                        createVNode(VBtn, {
                          variant: "text",
                          onClick: ($event) => historyDialog.value = false
                        }, {
                          default: withCtx(() => [
                            createTextVNode("Close")
                          ]),
                          _: 1
                        }, 8, ["onClick"])
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
                      createVNode(VIcon, {
                        class: "mr-2",
                        color: "info"
                      }, {
                        default: withCtx(() => [
                          createTextVNode("mdi-history")
                        ]),
                        _: 1
                      }),
                      createTextVNode(" Payment History — " + toDisplayString(unref(selectedCredit)?.customer_name), 1)
                    ]),
                    _: 1
                  }),
                  createVNode(VCardText, null, {
                    default: withCtx(() => [
                      unref(selectedCredit) ? (openBlock(), createBlock("div", {
                        key: 0,
                        class: "az-history-summary"
                      }, [
                        createVNode("div", { class: "az-history-summary__item" }, [
                          createVNode("p", { class: "text-caption text-medium-emphasis" }, "Total Credit"),
                          createVNode("p", { class: "text-h6 font-weight-bold" }, toDisplayString(formatMoney(unref(selectedCredit).total_amount)), 1)
                        ]),
                        createVNode("div", { class: "az-history-summary__item" }, [
                          createVNode("p", { class: "text-caption text-medium-emphasis" }, "Total Paid"),
                          createVNode("p", { class: "text-h6 font-weight-bold text-success" }, toDisplayString(formatMoney(unref(selectedCredit).amount_paid)), 1)
                        ]),
                        createVNode("div", { class: "az-history-summary__item" }, [
                          createVNode("p", { class: "text-caption text-medium-emphasis" }, "Balance"),
                          createVNode("p", { class: "text-h6 font-weight-bold text-error" }, toDisplayString(formatMoney(unref(selectedCredit).balance)), 1)
                        ])
                      ])) : createCommentVNode("", true),
                      unref(paymentHistory).length > 0 ? (openBlock(), createBlock(VDataTable, {
                        key: 1,
                        items: unref(paymentHistory),
                        headers: historyHeaders,
                        density: "compact",
                        "items-per-page-text": "Rows per page"
                      }, {
                        "item.amount": withCtx(({ item }) => [
                          createVNode("span", { class: "font-weight-bold text-success" }, toDisplayString(formatMoney(item.amount)), 1)
                        ]),
                        "item.payment_method": withCtx(({ item }) => [
                          createVNode(VChip, {
                            size: "small",
                            variant: "tonal",
                            color: methodColor(item.payment_method)
                          }, {
                            default: withCtx(() => [
                              createTextVNode(toDisplayString(item.payment_method), 1)
                            ]),
                            _: 2
                          }, 1032, ["color"])
                        ]),
                        "item.created_at": withCtx(({ item }) => [
                          createTextVNode(toDisplayString(formatDate(item.created_at)), 1)
                        ]),
                        _: 1
                      }, 8, ["items"])) : (openBlock(), createBlock("div", {
                        key: 2,
                        class: "text-center text-medium-emphasis py-8"
                      }, [
                        createVNode(VIcon, {
                          size: "40",
                          color: "grey-lighten-1"
                        }, {
                          default: withCtx(() => [
                            createTextVNode("mdi-clock-outline")
                          ]),
                          _: 1
                        }),
                        createVNode("p", { class: "mt-2" }, "No payments recorded yet.")
                      ]))
                    ]),
                    _: 1
                  }),
                  createVNode(VCardActions, { class: "px-4 pb-4" }, {
                    default: withCtx(() => [
                      createVNode(VSpacer),
                      createVNode(VBtn, {
                        variant: "text",
                        onClick: ($event) => historyDialog.value = false
                      }, {
                        default: withCtx(() => [
                          createTextVNode("Close")
                        ]),
                        _: 1
                      }, 8, ["onClick"])
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
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/credit/index.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const index = /* @__PURE__ */ _export_sfc(_sfc_main, [["__scopeId", "data-v-38d20b62"]]);
export {
  index as default
};
//# sourceMappingURL=index-BoAxoqdx.js.map
