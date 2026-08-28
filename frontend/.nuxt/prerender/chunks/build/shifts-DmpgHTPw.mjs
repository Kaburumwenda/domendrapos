import { defineComponent, computed, ref, watch, mergeProps, withCtx, createTextVNode, unref, isRef, createVNode, openBlock, createBlock, createCommentVNode, withDirectives, Fragment, renderList, toDisplayString, vModelSelect, withKeys, vModelText, useSSRContext } from 'file://D:/Projects/MY-APPS-2/DomendraPOS/frontend/node_modules/vue/index.mjs';
import { ssrRenderAttrs, ssrRenderComponent, ssrInterpolate, ssrRenderClass, ssrRenderAttr, ssrRenderList, ssrIncludeBooleanAttr, ssrLooseContain, ssrLooseEqual } from 'file://D:/Projects/MY-APPS-2/DomendraPOS/frontend/node_modules/vue/server-renderer/index.mjs';
import { _ as _export_sfc, D as useToast, c as VBtn, a as VIcon, x as VProgressCircular, q as VDialog, g as VCard, k as VDivider } from './server.mjs';
import { u as useFormat } from './useFormat-BvVWDMYe.mjs';
import { a as useAuthStore, u as useApi } from './useApi-D4YG8JPQ.mjs';
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

const itemsPerPage = 10;
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "shifts",
  __ssrInlineRender: true,
  setup(__props) {
    const toast = useToast();
    const { currency } = useFormat();
    const auth = useAuthStore();
    const currencySymbol = computed(() => auth.currencySymbol);
    function formatMoney(v) {
      return currency(v || 0);
    }
    function formatDate(v) {
      return new Date(v).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
    }
    function formatDateTime(v) {
      return new Date(v).toLocaleString("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit"
      });
    }
    function initialsOf(name) {
      if (!name) return "?";
      return name.split(" ").map((p) => p[0]).join("").substring(0, 2).toUpperCase();
    }
    function varianceClass(v) {
      return Number(v) >= 0 ? "shifts-table__variance--ok" : "shifts-table__variance--bad";
    }
    const loading = ref(false);
    const actionLoading = ref(false);
    const shifts2 = ref([]);
    const currentShift = ref(null);
    const branches = ref([]);
    const selectedBranch = ref(null);
    const openShiftDialog = ref(false);
    const closeShiftDialog = ref(false);
    const newFloat = ref(0);
    const actualCash = ref(0);
    const closeNotes = ref("");
    const detailDialog = ref(false);
    const detailShift = ref(null);
    const search = ref("");
    const activeFilter = ref("all");
    const page = ref(1);
    const quickFloat = [500, 1e3, 2e3, 5e3];
    const filterOptions = computed(() => [
      { value: "all", label: "All", count: shifts2.value.length },
      { value: "open", label: "Open", count: shifts2.value.filter((s) => s.status === "open").length },
      { value: "closed", label: "Closed", count: shifts2.value.filter((s) => s.status === "closed").length }
    ]);
    const filteredShifts = computed(() => {
      let result = shifts2.value;
      if (activeFilter.value !== "all") {
        result = result.filter((s) => s.status === activeFilter.value);
      }
      const q = search.value.trim().toLowerCase();
      if (q) {
        result = result.filter(
          (s) => s.reference.toLowerCase().includes(q) || (s.cashier_name || "").toLowerCase().includes(q) || (s.branch_name || "").toLowerCase().includes(q)
        );
      }
      return result;
    });
    const totalPages = computed(() => Math.max(1, Math.ceil(filteredShifts.value.length / itemsPerPage)));
    const paginatedShifts = computed(() => {
      const start = (page.value - 1) * itemsPerPage;
      return filteredShifts.value.slice(start, start + itemsPerPage);
    });
    watch([search, activeFilter], () => {
      page.value = 1;
    });
    const shiftStats = computed(() => {
      const total = shifts2.value.length;
      const open = shifts2.value.filter((s) => s.status === "open").length;
      const closed = shifts2.value.filter((s) => s.status === "closed");
      const revenue = closed.reduce((s, sh) => s + Number(sh.gross_revenue), 0);
      const variance = closed.reduce((s, sh) => s + Number(sh.cash_variance), 0);
      return { total, open, revenue, variance };
    });
    const currentShiftDuration = computed(() => {
      if (!currentShift.value) return "\u2014";
      const start = new Date(currentShift.value.opened_at).getTime();
      const elapsed = Date.now() - start;
      const h = Math.floor(elapsed / 36e5);
      const m = Math.floor(elapsed % 36e5 / 6e4);
      return `${h}h ${m}m`;
    });
    const expectedCashSales = computed(() => {
      if (!currentShift.value) return 0;
      return Math.max(0, Number(currentShift.value.expected_cash) - Number(currentShift.value.opening_float));
    });
    const expectedTotal = computed(() => {
      if (!currentShift.value) return 0;
      return Number(currentShift.value.opening_float) + expectedCashSales.value;
    });
    const variancePreview = computed(() => {
      return Number(actualCash.value || 0) - expectedTotal.value;
    });
    const quickActualOptions = computed(() => {
      const expected = expectedTotal.value;
      return [expected, Math.ceil(expected / 100) * 100, Math.ceil(expected / 500) * 500, Math.ceil(expected / 1e3) * 1e3];
    });
    async function loadData() {
      loading.value = true;
      try {
        const [allData, current] = await Promise.all([
          useApi()("/pos/shifts/?page_size=100"),
          useApi()("/pos/shifts/current/").catch(() => null)
        ]);
        shifts2.value = allData.results || allData;
        currentShift.value = current && current.reference ? current : null;
        if (branches.value.length === 0) {
          try {
            const branchData = await useApi()("/branches/");
            branches.value = branchData.results || branchData;
            if (!selectedBranch.value && branches.value.length > 0) {
              const hq = branches.value.find((b) => b.is_headquarters) || branches.value[0];
              selectedBranch.value = hq.id;
            }
          } catch {
          }
        }
      } catch {
        toast.error("Failed to load shifts");
      } finally {
        loading.value = false;
      }
    }
    async function confirmOpenShift() {
      var _a;
      if (newFloat.value < 0) {
        toast.warning("Float cannot be negative");
        return;
      }
      actionLoading.value = true;
      try {
        const body = {
          opening_float: Math.round(newFloat.value * 100) / 100
        };
        if (selectedBranch.value) body.branch = selectedBranch.value;
        await useApi()("/pos/shifts/", {
          method: "POST",
          body
        });
        openShiftDialog.value = false;
        newFloat.value = 0;
        toast.success("Shift opened successfully");
        await loadData();
      } catch (e) {
        const data = (e == null ? void 0 : e.data) || ((_a = e == null ? void 0 : e.response) == null ? void 0 : _a._data) || {};
        const msg = data.detail || Object.values(data).flat().join(", ") || "Failed to open shift";
        toast.error(typeof msg === "string" ? msg : "Failed to open shift");
      } finally {
        actionLoading.value = false;
      }
    }
    function openCloseDialog() {
      actualCash.value = 0;
      closeNotes.value = "";
      closeShiftDialog.value = true;
    }
    async function confirmCloseShift() {
      var _a;
      if (!currentShift.value) return;
      if (actualCash.value < 0) {
        toast.warning("Actual cash cannot be negative");
        return;
      }
      actionLoading.value = true;
      try {
        await useApi()(`/pos/shifts/${currentShift.value.id}/close/`, {
          method: "POST",
          body: {
            actual_cash: Math.round(actualCash.value * 100) / 100,
            notes: closeNotes.value
          }
        });
        closeShiftDialog.value = false;
        toast.success("Shift closed \u2014 Z-Report generated");
        await loadData();
      } catch (e) {
        const data = (e == null ? void 0 : e.data) || ((_a = e == null ? void 0 : e.response) == null ? void 0 : _a._data) || {};
        const msg = data.detail || Object.values(data).flat().join(", ") || "Failed to close shift";
        toast.error(typeof msg === "string" ? msg : "Failed to close shift");
      } finally {
        actionLoading.value = false;
      }
    }
    function openDetail(s) {
      detailShift.value = s;
      detailDialog.value = true;
    }
    function printZReport() {
      var _a;
      const el = (void 0).querySelector(".shifts-dialog");
      if (!el) return;
      const win = (void 0).open("", "_blank", "width=400,height=600");
      if (!win) return;
      win.document.write(`<html><head><title>Z-Report ${(_a = detailShift.value) == null ? void 0 : _a.reference}</title><style>
    body { font-family: 'Segoe UI', monospace; margin: 0; padding: 20px; color: #1a1a1a; }
    h3 { margin: 0 0 4px; } .row { display: flex; justify-content: space-between; padding: 4px 0; }
    .bold { font-weight: bold; } hr { border: none; border-top: 1px dashed #ccc; }
  </style></head><body>${el.innerHTML}</body></html>`);
      win.document.close();
      setTimeout(() => win.print(), 250);
    }
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "shifts-page" }, _attrs))} data-v-1afc2da0><div class="shifts-header" data-v-1afc2da0><div class="shifts-header__left" data-v-1afc2da0><div class="shifts-header__back" data-v-1afc2da0>`);
      _push(ssrRenderComponent(VBtn, {
        to: "/pos",
        variant: "text",
        size: "small",
        "prepend-icon": "mdi-arrow-left",
        density: "comfortable"
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`POS`);
          } else {
            return [
              createTextVNode("POS")
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`</div><div class="shifts-header__title" data-v-1afc2da0><h1 class="text-h5 font-weight-bold" data-v-1afc2da0>Cashier Shifts</h1><p class="text-body-2 text-medium-emphasis" data-v-1afc2da0>Manage drawer float, track cash variance, and close shifts with Z-reports</p></div></div><div class="shifts-header__actions" data-v-1afc2da0>`);
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
      if (unref(currentShift)) {
        _push(ssrRenderComponent(VBtn, {
          variant: "flat",
          color: "warning",
          "prepend-icon": "mdi-stop-circle",
          onClick: openCloseDialog
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`Close Shift`);
            } else {
              return [
                createTextVNode("Close Shift")
              ];
            }
          }),
          _: 1
        }, _parent));
      } else {
        _push(ssrRenderComponent(VBtn, {
          variant: "flat",
          color: "primary",
          "prepend-icon": "mdi-play-circle",
          onClick: ($event) => openShiftDialog.value = true
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`Open Shift`);
            } else {
              return [
                createTextVNode("Open Shift")
              ];
            }
          }),
          _: 1
        }, _parent));
      }
      _push(`</div></div><div class="shifts-kpi-grid" data-v-1afc2da0><div class="shifts-kpi" data-v-1afc2da0><div class="shifts-kpi__icon shifts-kpi__icon--primary" data-v-1afc2da0>`);
      _push(ssrRenderComponent(VIcon, { size: "22" }, {
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
      _push(`</div><div class="shifts-kpi__body" data-v-1afc2da0><p class="shifts-kpi__label" data-v-1afc2da0>Total Shifts</p><p class="shifts-kpi__value" data-v-1afc2da0>${ssrInterpolate(unref(shiftStats).total)}</p></div></div><div class="shifts-kpi" data-v-1afc2da0><div class="shifts-kpi__icon shifts-kpi__icon--success" data-v-1afc2da0>`);
      _push(ssrRenderComponent(VIcon, { size: "22" }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`mdi-store-open`);
          } else {
            return [
              createTextVNode("mdi-store-open")
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`</div><div class="shifts-kpi__body" data-v-1afc2da0><p class="shifts-kpi__label" data-v-1afc2da0>Open Now</p><p class="shifts-kpi__value text-success" data-v-1afc2da0>${ssrInterpolate(unref(shiftStats).open)}</p></div></div><div class="shifts-kpi" data-v-1afc2da0><div class="shifts-kpi__icon shifts-kpi__icon--info" data-v-1afc2da0>`);
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
      _push(`</div><div class="shifts-kpi__body" data-v-1afc2da0><p class="shifts-kpi__label" data-v-1afc2da0>Gross Revenue</p><p class="shifts-kpi__value" data-v-1afc2da0>${ssrInterpolate(formatMoney(unref(shiftStats).revenue))}</p></div></div><div class="shifts-kpi" data-v-1afc2da0><div class="shifts-kpi__icon shifts-kpi__icon--warn" data-v-1afc2da0>`);
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
      _push(`</div><div class="shifts-kpi__body" data-v-1afc2da0><p class="shifts-kpi__label" data-v-1afc2da0>Net Variance</p><p class="${ssrRenderClass([unref(shiftStats).variance >= 0 ? "text-success" : "text-error", "shifts-kpi__value"])}" data-v-1afc2da0>${ssrInterpolate(unref(shiftStats).variance >= 0 ? "+" : "")}${ssrInterpolate(formatMoney(unref(shiftStats).variance))}</p></div></div></div>`);
      if (unref(currentShift)) {
        _push(`<div class="shifts-active" data-v-1afc2da0><div class="shifts-active__indicator" data-v-1afc2da0><span class="shifts-active__pulse" data-v-1afc2da0></span><span class="shifts-active__dot" data-v-1afc2da0></span></div><div class="shifts-active__body" data-v-1afc2da0><div class="shifts-active__header" data-v-1afc2da0><span class="shifts-active__ref" data-v-1afc2da0>${ssrInterpolate(unref(currentShift).reference)}</span><span class="shifts-active__badge" data-v-1afc2da0>LIVE</span></div><p class="shifts-active__meta" data-v-1afc2da0>${ssrInterpolate(unref(currentShift).branch_name)} \xB7 ${ssrInterpolate(unref(currentShift).cashier_name)} \xB7 Opened ${ssrInterpolate(formatDateTime(unref(currentShift).opened_at))}</p></div><div class="shifts-active__stats" data-v-1afc2da0><div class="shifts-active__stat" data-v-1afc2da0><span class="shifts-active__stat-label" data-v-1afc2da0>Float</span><span class="shifts-active__stat-value" data-v-1afc2da0>${ssrInterpolate(formatMoney(unref(currentShift).opening_float))}</span></div><div class="shifts-active__stat" data-v-1afc2da0><span class="shifts-active__stat-label" data-v-1afc2da0>Duration</span><span class="shifts-active__stat-value" data-v-1afc2da0>${ssrInterpolate(unref(currentShiftDuration))}</span></div></div>`);
        _push(ssrRenderComponent(VBtn, {
          variant: "flat",
          color: "warning",
          size: "small",
          "prepend-icon": "mdi-stop-circle",
          onClick: openCloseDialog
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`Close`);
            } else {
              return [
                createTextVNode("Close")
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(`</div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`<div class="shifts-toolbar" data-v-1afc2da0><div class="shifts-toolbar__search" data-v-1afc2da0>`);
      _push(ssrRenderComponent(VIcon, {
        size: "18",
        class: "shifts-toolbar__icon"
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`mdi-magnify`);
          } else {
            return [
              createTextVNode("mdi-magnify")
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`<input${ssrRenderAttr("value", unref(search))} class="shifts-toolbar__input" placeholder="Search by reference or cashier..." data-v-1afc2da0></div><div class="shifts-toolbar__filters" data-v-1afc2da0><!--[-->`);
      ssrRenderList(unref(filterOptions), (f) => {
        _push(`<button class="${ssrRenderClass([{ "shifts-toolbar__pill--active": unref(activeFilter) === f.value }, "shifts-toolbar__pill"])}" data-v-1afc2da0>${ssrInterpolate(f.label)} <span class="shifts-toolbar__pill-count" data-v-1afc2da0>${ssrInterpolate(f.count)}</span></button>`);
      });
      _push(`<!--]--></div></div><div class="shifts-table-wrap" data-v-1afc2da0>`);
      if (unref(loading)) {
        _push(`<div class="shifts-loading" data-v-1afc2da0>`);
        _push(ssrRenderComponent(VProgressCircular, {
          indeterminate: "",
          size: "32",
          color: "primary"
        }, null, _parent));
        _push(`<p class="text-body-2 text-medium-emphasis mt-2" data-v-1afc2da0>Loading shifts...</p></div>`);
      } else if (unref(filteredShifts).length === 0) {
        _push(`<div class="shifts-empty" data-v-1afc2da0>`);
        _push(ssrRenderComponent(VIcon, {
          size: "48",
          class: "text-medium-emphasis"
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`mdi-clock-off-outline`);
            } else {
              return [
                createTextVNode("mdi-clock-off-outline")
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(`<p class="text-h6 mt-2" data-v-1afc2da0>No shifts found</p><p class="text-body-2 text-medium-emphasis" data-v-1afc2da0>${ssrInterpolate(unref(search) ? "Try a different search." : "Open a shift to get started.")}</p></div>`);
      } else {
        _push(`<table class="shifts-table" data-v-1afc2da0><thead data-v-1afc2da0><tr data-v-1afc2da0><th data-v-1afc2da0>Reference</th><th data-v-1afc2da0>Cashier</th><th data-v-1afc2da0>Branch</th><th data-v-1afc2da0>Duration</th><th class="text-right" data-v-1afc2da0>Float</th><th class="text-right" data-v-1afc2da0>Gross</th><th class="text-right" data-v-1afc2da0>Expected</th><th class="text-right" data-v-1afc2da0>Actual</th><th class="text-right" data-v-1afc2da0>Variance</th><th data-v-1afc2da0>Status</th><th data-v-1afc2da0></th></tr></thead><tbody data-v-1afc2da0><!--[-->`);
        ssrRenderList(unref(paginatedShifts), (s) => {
          _push(`<tr class="shifts-table__row" data-v-1afc2da0><td data-v-1afc2da0><div class="shifts-table__ref" data-v-1afc2da0>${ssrInterpolate(s.reference)}</div><div class="shifts-table__date" data-v-1afc2da0>${ssrInterpolate(formatDate(s.opened_at))}</div></td><td class="shifts-table__cashier" data-v-1afc2da0><div class="shifts-table__cashier-badge" data-v-1afc2da0>${ssrInterpolate(initialsOf(s.cashier_name))}</div><span data-v-1afc2da0>${ssrInterpolate(s.cashier_name)}</span></td><td class="text-medium-emphasis" data-v-1afc2da0>${ssrInterpolate(s.branch_name)}</td><td class="text-medium-emphasis" data-v-1afc2da0>${ssrInterpolate(s.duration)}</td><td class="text-right font-weight-medium" data-v-1afc2da0>${ssrInterpolate(formatMoney(s.opening_float))}</td><td class="text-right" data-v-1afc2da0>${ssrInterpolate(formatMoney(s.gross_revenue))}</td><td class="text-right text-medium-emphasis" data-v-1afc2da0>${ssrInterpolate(s.actual_cash !== null ? formatMoney(s.expected_cash) : "\u2014")}</td><td class="text-right" data-v-1afc2da0>${ssrInterpolate(s.actual_cash !== null ? formatMoney(s.actual_cash) : "\u2014")}</td><td class="text-right" data-v-1afc2da0>`);
          if (s.actual_cash !== null) {
            _push(`<span class="${ssrRenderClass([varianceClass(s.cash_variance), "shifts-table__variance"])}" data-v-1afc2da0>${ssrInterpolate(Number(s.cash_variance) >= 0 ? "+" : "")}${ssrInterpolate(formatMoney(s.cash_variance))}</span>`);
          } else {
            _push(`<span class="text-medium-emphasis" data-v-1afc2da0>\u2014</span>`);
          }
          _push(`</td><td data-v-1afc2da0><span class="${ssrRenderClass([`shifts-table__status--${s.status}`, "shifts-table__status"])}" data-v-1afc2da0><span class="shifts-table__status-dot" data-v-1afc2da0></span> ${ssrInterpolate(s.status_display)}</span></td><td data-v-1afc2da0>`);
          _push(ssrRenderComponent(VBtn, {
            icon: "mdi-chevron-right",
            size: "small",
            variant: "text",
            density: "compact",
            onClick: ($event) => openDetail(s)
          }, null, _parent));
          _push(`</td></tr>`);
        });
        _push(`<!--]--></tbody></table>`);
      }
      if (unref(filteredShifts).length > itemsPerPage) {
        _push(`<div class="shifts-pagination" data-v-1afc2da0><span class="shifts-pagination__info" data-v-1afc2da0> Showing ${ssrInterpolate((unref(page) - 1) * itemsPerPage + 1)}\u2013${ssrInterpolate(Math.min(unref(page) * itemsPerPage, unref(filteredShifts).length))} of ${ssrInterpolate(unref(filteredShifts).length)}</span><div class="shifts-pagination__nav" data-v-1afc2da0>`);
        _push(ssrRenderComponent(VBtn, {
          size: "small",
          variant: "text",
          disabled: unref(page) === 1,
          onClick: ($event) => page.value--,
          "prepend-icon": "mdi-chevron-left"
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
        _push(`<span class="shifts-pagination__page" data-v-1afc2da0>${ssrInterpolate(unref(page))} / ${ssrInterpolate(unref(totalPages))}</span>`);
        _push(ssrRenderComponent(VBtn, {
          size: "small",
          variant: "text",
          disabled: unref(page) === unref(totalPages),
          onClick: ($event) => page.value++,
          "append-icon": "mdi-chevron-right"
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
        _push(`</div></div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</div>`);
      _push(ssrRenderComponent(VDialog, {
        modelValue: unref(openShiftDialog),
        "onUpdate:modelValue": ($event) => isRef(openShiftDialog) ? openShiftDialog.value = $event : null,
        "max-width": "480",
        persistent: ""
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(ssrRenderComponent(VCard, {
              rounded: "xl",
              class: "shifts-dialog"
            }, {
              default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                if (_push3) {
                  _push3(`<div class="shifts-dialog__header" data-v-1afc2da0${_scopeId2}><div class="shifts-dialog__header-icon shifts-dialog__header-icon--primary" data-v-1afc2da0${_scopeId2}>`);
                  _push3(ssrRenderComponent(VIcon, { size: "24" }, {
                    default: withCtx((_3, _push4, _parent4, _scopeId3) => {
                      if (_push4) {
                        _push4(`mdi-play-circle`);
                      } else {
                        return [
                          createTextVNode("mdi-play-circle")
                        ];
                      }
                    }),
                    _: 1
                  }, _parent3, _scopeId2));
                  _push3(`</div><div data-v-1afc2da0${_scopeId2}><h3 class="text-h6 font-weight-bold" data-v-1afc2da0${_scopeId2}>Open New Shift</h3><p class="text-body-2 text-medium-emphasis" data-v-1afc2da0${_scopeId2}>Start a new cashier drawer session</p></div></div>`);
                  _push3(ssrRenderComponent(VDivider, null, null, _parent3, _scopeId2));
                  _push3(`<div class="shifts-dialog__body" data-v-1afc2da0${_scopeId2}>`);
                  if (unref(branches).length > 1) {
                    _push3(`<label class="shifts-dialog__label" data-v-1afc2da0${_scopeId2}>Branch</label>`);
                  } else {
                    _push3(`<!---->`);
                  }
                  if (unref(branches).length > 1) {
                    _push3(`<select class="shifts-dialog__select mb-3" data-v-1afc2da0${_scopeId2}><!--[-->`);
                    ssrRenderList(unref(branches), (b) => {
                      _push3(`<option${ssrRenderAttr("value", b.id)} data-v-1afc2da0${ssrIncludeBooleanAttr(Array.isArray(unref(selectedBranch)) ? ssrLooseContain(unref(selectedBranch), b.id) : ssrLooseEqual(unref(selectedBranch), b.id)) ? " selected" : ""}${_scopeId2}>${ssrInterpolate(b.name)}</option>`);
                    });
                    _push3(`<!--]--></select>`);
                  } else {
                    _push3(`<!---->`);
                  }
                  _push3(`<label class="shifts-dialog__label" data-v-1afc2da0${_scopeId2}>Opening Cash Float</label><div class="shifts-dialog__money-input" data-v-1afc2da0${_scopeId2}><span class="shifts-dialog__money-prefix" data-v-1afc2da0${_scopeId2}>${ssrInterpolate(unref(currencySymbol))}</span><input${ssrRenderAttr("value", unref(newFloat))} type="number" class="shifts-dialog__money-field" placeholder="0.00" min="0" step="0.01" data-v-1afc2da0${_scopeId2}></div><div class="shifts-dialog__quick-buttons" data-v-1afc2da0${_scopeId2}><!--[-->`);
                  ssrRenderList(quickFloat, (q) => {
                    _push3(`<button class="shifts-dialog__quick-btn" data-v-1afc2da0${_scopeId2}>${ssrInterpolate(unref(currencySymbol))}${ssrInterpolate(q.toLocaleString())}</button>`);
                  });
                  _push3(`<!--]--></div><p class="shifts-dialog__hint" data-v-1afc2da0${_scopeId2}>`);
                  _push3(ssrRenderComponent(VIcon, {
                    size: "14",
                    class: "mr-1"
                  }, {
                    default: withCtx((_3, _push4, _parent4, _scopeId3) => {
                      if (_push4) {
                        _push4(`mdi-information-outline`);
                      } else {
                        return [
                          createTextVNode("mdi-information-outline")
                        ];
                      }
                    }),
                    _: 1
                  }, _parent3, _scopeId2));
                  _push3(` The opening float is the cash amount counted into the drawer at the start of the shift. </p></div>`);
                  _push3(ssrRenderComponent(VDivider, null, null, _parent3, _scopeId2));
                  _push3(`<div class="shifts-dialog__actions" data-v-1afc2da0${_scopeId2}>`);
                  _push3(ssrRenderComponent(VBtn, {
                    variant: "text",
                    onClick: ($event) => openShiftDialog.value = false
                  }, {
                    default: withCtx((_3, _push4, _parent4, _scopeId3) => {
                      if (_push4) {
                        _push4(`Cancel`);
                      } else {
                        return [
                          createTextVNode("Cancel")
                        ];
                      }
                    }),
                    _: 1
                  }, _parent3, _scopeId2));
                  _push3(ssrRenderComponent(VBtn, {
                    variant: "flat",
                    color: "primary",
                    "prepend-icon": "mdi-check",
                    loading: unref(actionLoading),
                    onClick: confirmOpenShift
                  }, {
                    default: withCtx((_3, _push4, _parent4, _scopeId3) => {
                      if (_push4) {
                        _push4(`Open Shift`);
                      } else {
                        return [
                          createTextVNode("Open Shift")
                        ];
                      }
                    }),
                    _: 1
                  }, _parent3, _scopeId2));
                  _push3(`</div>`);
                } else {
                  return [
                    createVNode("div", { class: "shifts-dialog__header" }, [
                      createVNode("div", { class: "shifts-dialog__header-icon shifts-dialog__header-icon--primary" }, [
                        createVNode(VIcon, { size: "24" }, {
                          default: withCtx(() => [
                            createTextVNode("mdi-play-circle")
                          ]),
                          _: 1
                        })
                      ]),
                      createVNode("div", null, [
                        createVNode("h3", { class: "text-h6 font-weight-bold" }, "Open New Shift"),
                        createVNode("p", { class: "text-body-2 text-medium-emphasis" }, "Start a new cashier drawer session")
                      ])
                    ]),
                    createVNode(VDivider),
                    createVNode("div", { class: "shifts-dialog__body" }, [
                      unref(branches).length > 1 ? (openBlock(), createBlock("label", {
                        key: 0,
                        class: "shifts-dialog__label"
                      }, "Branch")) : createCommentVNode("", true),
                      unref(branches).length > 1 ? withDirectives((openBlock(), createBlock("select", {
                        key: 1,
                        "onUpdate:modelValue": ($event) => isRef(selectedBranch) ? selectedBranch.value = $event : null,
                        class: "shifts-dialog__select mb-3"
                      }, [
                        (openBlock(true), createBlock(Fragment, null, renderList(unref(branches), (b) => {
                          return openBlock(), createBlock("option", {
                            key: b.id,
                            value: b.id
                          }, toDisplayString(b.name), 9, ["value"]);
                        }), 128))
                      ], 8, ["onUpdate:modelValue"])), [
                        [vModelSelect, unref(selectedBranch)]
                      ]) : createCommentVNode("", true),
                      createVNode("label", { class: "shifts-dialog__label" }, "Opening Cash Float"),
                      createVNode("div", { class: "shifts-dialog__money-input" }, [
                        createVNode("span", { class: "shifts-dialog__money-prefix" }, toDisplayString(unref(currencySymbol)), 1),
                        withDirectives(createVNode("input", {
                          "onUpdate:modelValue": ($event) => isRef(newFloat) ? newFloat.value = $event : null,
                          type: "number",
                          class: "shifts-dialog__money-field",
                          placeholder: "0.00",
                          min: "0",
                          step: "0.01",
                          onKeyup: withKeys(confirmOpenShift, ["enter"])
                        }, null, 40, ["onUpdate:modelValue"]), [
                          [
                            vModelText,
                            unref(newFloat),
                            void 0,
                            { number: true }
                          ]
                        ])
                      ]),
                      createVNode("div", { class: "shifts-dialog__quick-buttons" }, [
                        (openBlock(), createBlock(Fragment, null, renderList(quickFloat, (q) => {
                          return createVNode("button", {
                            key: q,
                            class: "shifts-dialog__quick-btn",
                            onClick: ($event) => newFloat.value = q
                          }, toDisplayString(unref(currencySymbol)) + toDisplayString(q.toLocaleString()), 9, ["onClick"]);
                        }), 64))
                      ]),
                      createVNode("p", { class: "shifts-dialog__hint" }, [
                        createVNode(VIcon, {
                          size: "14",
                          class: "mr-1"
                        }, {
                          default: withCtx(() => [
                            createTextVNode("mdi-information-outline")
                          ]),
                          _: 1
                        }),
                        createTextVNode(" The opening float is the cash amount counted into the drawer at the start of the shift. ")
                      ])
                    ]),
                    createVNode(VDivider),
                    createVNode("div", { class: "shifts-dialog__actions" }, [
                      createVNode(VBtn, {
                        variant: "text",
                        onClick: ($event) => openShiftDialog.value = false
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
                        loading: unref(actionLoading),
                        onClick: confirmOpenShift
                      }, {
                        default: withCtx(() => [
                          createTextVNode("Open Shift")
                        ]),
                        _: 1
                      }, 8, ["loading"])
                    ])
                  ];
                }
              }),
              _: 1
            }, _parent2, _scopeId));
          } else {
            return [
              createVNode(VCard, {
                rounded: "xl",
                class: "shifts-dialog"
              }, {
                default: withCtx(() => [
                  createVNode("div", { class: "shifts-dialog__header" }, [
                    createVNode("div", { class: "shifts-dialog__header-icon shifts-dialog__header-icon--primary" }, [
                      createVNode(VIcon, { size: "24" }, {
                        default: withCtx(() => [
                          createTextVNode("mdi-play-circle")
                        ]),
                        _: 1
                      })
                    ]),
                    createVNode("div", null, [
                      createVNode("h3", { class: "text-h6 font-weight-bold" }, "Open New Shift"),
                      createVNode("p", { class: "text-body-2 text-medium-emphasis" }, "Start a new cashier drawer session")
                    ])
                  ]),
                  createVNode(VDivider),
                  createVNode("div", { class: "shifts-dialog__body" }, [
                    unref(branches).length > 1 ? (openBlock(), createBlock("label", {
                      key: 0,
                      class: "shifts-dialog__label"
                    }, "Branch")) : createCommentVNode("", true),
                    unref(branches).length > 1 ? withDirectives((openBlock(), createBlock("select", {
                      key: 1,
                      "onUpdate:modelValue": ($event) => isRef(selectedBranch) ? selectedBranch.value = $event : null,
                      class: "shifts-dialog__select mb-3"
                    }, [
                      (openBlock(true), createBlock(Fragment, null, renderList(unref(branches), (b) => {
                        return openBlock(), createBlock("option", {
                          key: b.id,
                          value: b.id
                        }, toDisplayString(b.name), 9, ["value"]);
                      }), 128))
                    ], 8, ["onUpdate:modelValue"])), [
                      [vModelSelect, unref(selectedBranch)]
                    ]) : createCommentVNode("", true),
                    createVNode("label", { class: "shifts-dialog__label" }, "Opening Cash Float"),
                    createVNode("div", { class: "shifts-dialog__money-input" }, [
                      createVNode("span", { class: "shifts-dialog__money-prefix" }, toDisplayString(unref(currencySymbol)), 1),
                      withDirectives(createVNode("input", {
                        "onUpdate:modelValue": ($event) => isRef(newFloat) ? newFloat.value = $event : null,
                        type: "number",
                        class: "shifts-dialog__money-field",
                        placeholder: "0.00",
                        min: "0",
                        step: "0.01",
                        onKeyup: withKeys(confirmOpenShift, ["enter"])
                      }, null, 40, ["onUpdate:modelValue"]), [
                        [
                          vModelText,
                          unref(newFloat),
                          void 0,
                          { number: true }
                        ]
                      ])
                    ]),
                    createVNode("div", { class: "shifts-dialog__quick-buttons" }, [
                      (openBlock(), createBlock(Fragment, null, renderList(quickFloat, (q) => {
                        return createVNode("button", {
                          key: q,
                          class: "shifts-dialog__quick-btn",
                          onClick: ($event) => newFloat.value = q
                        }, toDisplayString(unref(currencySymbol)) + toDisplayString(q.toLocaleString()), 9, ["onClick"]);
                      }), 64))
                    ]),
                    createVNode("p", { class: "shifts-dialog__hint" }, [
                      createVNode(VIcon, {
                        size: "14",
                        class: "mr-1"
                      }, {
                        default: withCtx(() => [
                          createTextVNode("mdi-information-outline")
                        ]),
                        _: 1
                      }),
                      createTextVNode(" The opening float is the cash amount counted into the drawer at the start of the shift. ")
                    ])
                  ]),
                  createVNode(VDivider),
                  createVNode("div", { class: "shifts-dialog__actions" }, [
                    createVNode(VBtn, {
                      variant: "text",
                      onClick: ($event) => openShiftDialog.value = false
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
                      loading: unref(actionLoading),
                      onClick: confirmOpenShift
                    }, {
                      default: withCtx(() => [
                        createTextVNode("Open Shift")
                      ]),
                      _: 1
                    }, 8, ["loading"])
                  ])
                ]),
                _: 2
              }, 1024)
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(ssrRenderComponent(VDialog, {
        modelValue: unref(closeShiftDialog),
        "onUpdate:modelValue": ($event) => isRef(closeShiftDialog) ? closeShiftDialog.value = $event : null,
        "max-width": "560",
        persistent: ""
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(ssrRenderComponent(VCard, {
              rounded: "xl",
              class: "shifts-dialog"
            }, {
              default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                var _a, _b, _c, _d, _e, _f;
                if (_push3) {
                  _push3(`<div class="shifts-dialog__header" data-v-1afc2da0${_scopeId2}><div class="shifts-dialog__header-icon shifts-dialog__header-icon--warning" data-v-1afc2da0${_scopeId2}>`);
                  _push3(ssrRenderComponent(VIcon, { size: "24" }, {
                    default: withCtx((_3, _push4, _parent4, _scopeId3) => {
                      if (_push4) {
                        _push4(`mdi-stop-circle`);
                      } else {
                        return [
                          createTextVNode("mdi-stop-circle")
                        ];
                      }
                    }),
                    _: 1
                  }, _parent3, _scopeId2));
                  _push3(`</div><div data-v-1afc2da0${_scopeId2}><h3 class="text-h6 font-weight-bold" data-v-1afc2da0${_scopeId2}>Close Shift \u2014 Z-Report</h3><p class="text-body-2 text-medium-emphasis" data-v-1afc2da0${_scopeId2}>${ssrInterpolate((_a = unref(currentShift)) == null ? void 0 : _a.reference)} \xB7 ${ssrInterpolate((_b = unref(currentShift)) == null ? void 0 : _b.branch_name)}</p></div></div>`);
                  _push3(ssrRenderComponent(VDivider, null, null, _parent3, _scopeId2));
                  _push3(`<div class="shifts-dialog__body" data-v-1afc2da0${_scopeId2}><div class="shifts-zreport" data-v-1afc2da0${_scopeId2}><div class="shifts-zreport__row" data-v-1afc2da0${_scopeId2}><span data-v-1afc2da0${_scopeId2}>Opening Float</span><span class="font-weight-medium" data-v-1afc2da0${_scopeId2}>${ssrInterpolate(formatMoney((_c = unref(currentShift)) == null ? void 0 : _c.opening_float))}</span></div><div class="shifts-zreport__row" data-v-1afc2da0${_scopeId2}><span data-v-1afc2da0${_scopeId2}>Cash Sales (expected)</span><span class="font-weight-medium" data-v-1afc2da0${_scopeId2}>${ssrInterpolate(formatMoney(unref(expectedCashSales)))}</span></div><div class="shifts-zreport__row shifts-zreport__row--bold" data-v-1afc2da0${_scopeId2}><span data-v-1afc2da0${_scopeId2}>Expected Cash in Drawer</span><span class="font-weight-bold" data-v-1afc2da0${_scopeId2}>${ssrInterpolate(formatMoney(unref(expectedTotal)))}</span></div>`);
                  _push3(ssrRenderComponent(VDivider, { class: "my-2" }, null, _parent3, _scopeId2));
                  _push3(`<label class="shifts-dialog__label mt-2" data-v-1afc2da0${_scopeId2}>Actual Cash Counted</label><div class="shifts-dialog__money-input" data-v-1afc2da0${_scopeId2}><span class="shifts-dialog__money-prefix" data-v-1afc2da0${_scopeId2}>${ssrInterpolate(unref(currencySymbol))}</span><input${ssrRenderAttr("value", unref(actualCash))} type="number" class="shifts-dialog__money-field" placeholder="0.00" min="0" step="0.01" data-v-1afc2da0${_scopeId2}></div><div class="shifts-dialog__quick-buttons" data-v-1afc2da0${_scopeId2}><!--[-->`);
                  ssrRenderList(unref(quickActualOptions), (q) => {
                    _push3(`<button class="shifts-dialog__quick-btn" data-v-1afc2da0${_scopeId2}>${ssrInterpolate(formatMoney(q))}</button>`);
                  });
                  _push3(`<!--]--></div><div class="${ssrRenderClass([unref(variancePreview) >= 0 ? "shifts-zreport__variance--ok" : "shifts-zreport__variance--bad", "shifts-zreport__variance"])}" data-v-1afc2da0${_scopeId2}>`);
                  _push3(ssrRenderComponent(VIcon, { size: "18" }, {
                    default: withCtx((_3, _push4, _parent4, _scopeId3) => {
                      if (_push4) {
                        _push4(`${ssrInterpolate(unref(variancePreview) >= 0 ? "mdi-check-circle" : "mdi-alert-circle")}`);
                      } else {
                        return [
                          createTextVNode(toDisplayString(unref(variancePreview) >= 0 ? "mdi-check-circle" : "mdi-alert-circle"), 1)
                        ];
                      }
                    }),
                    _: 1
                  }, _parent3, _scopeId2));
                  _push3(`<div data-v-1afc2da0${_scopeId2}><p class="font-weight-medium" data-v-1afc2da0${_scopeId2}>${ssrInterpolate(unref(variancePreview) >= 0 ? "Surplus" : "Shortfall")}: ${ssrInterpolate(formatMoney(Math.abs(unref(variancePreview))))}</p><p class="text-caption text-medium-emphasis" data-v-1afc2da0${_scopeId2}>${ssrInterpolate(unref(variancePreview) >= 0 ? "Drawer has more cash than expected" : "Drawer is short of expected cash")}</p></div></div><label class="shifts-dialog__label mt-3" data-v-1afc2da0${_scopeId2}>Closing Notes</label><textarea class="shifts-dialog__textarea" placeholder="Optional notes about this shift..." rows="2" data-v-1afc2da0${_scopeId2}>${ssrInterpolate(unref(closeNotes))}</textarea></div></div>`);
                  _push3(ssrRenderComponent(VDivider, null, null, _parent3, _scopeId2));
                  _push3(`<div class="shifts-dialog__actions" data-v-1afc2da0${_scopeId2}>`);
                  _push3(ssrRenderComponent(VBtn, {
                    variant: "text",
                    onClick: ($event) => closeShiftDialog.value = false
                  }, {
                    default: withCtx((_3, _push4, _parent4, _scopeId3) => {
                      if (_push4) {
                        _push4(`Cancel`);
                      } else {
                        return [
                          createTextVNode("Cancel")
                        ];
                      }
                    }),
                    _: 1
                  }, _parent3, _scopeId2));
                  _push3(ssrRenderComponent(VBtn, {
                    variant: "flat",
                    color: "warning",
                    "prepend-icon": "mdi-check",
                    loading: unref(actionLoading),
                    onClick: confirmCloseShift
                  }, {
                    default: withCtx((_3, _push4, _parent4, _scopeId3) => {
                      if (_push4) {
                        _push4(`Close Shift`);
                      } else {
                        return [
                          createTextVNode("Close Shift")
                        ];
                      }
                    }),
                    _: 1
                  }, _parent3, _scopeId2));
                  _push3(`</div>`);
                } else {
                  return [
                    createVNode("div", { class: "shifts-dialog__header" }, [
                      createVNode("div", { class: "shifts-dialog__header-icon shifts-dialog__header-icon--warning" }, [
                        createVNode(VIcon, { size: "24" }, {
                          default: withCtx(() => [
                            createTextVNode("mdi-stop-circle")
                          ]),
                          _: 1
                        })
                      ]),
                      createVNode("div", null, [
                        createVNode("h3", { class: "text-h6 font-weight-bold" }, "Close Shift \u2014 Z-Report"),
                        createVNode("p", { class: "text-body-2 text-medium-emphasis" }, toDisplayString((_d = unref(currentShift)) == null ? void 0 : _d.reference) + " \xB7 " + toDisplayString((_e = unref(currentShift)) == null ? void 0 : _e.branch_name), 1)
                      ])
                    ]),
                    createVNode(VDivider),
                    createVNode("div", { class: "shifts-dialog__body" }, [
                      createVNode("div", { class: "shifts-zreport" }, [
                        createVNode("div", { class: "shifts-zreport__row" }, [
                          createVNode("span", null, "Opening Float"),
                          createVNode("span", { class: "font-weight-medium" }, toDisplayString(formatMoney((_f = unref(currentShift)) == null ? void 0 : _f.opening_float)), 1)
                        ]),
                        createVNode("div", { class: "shifts-zreport__row" }, [
                          createVNode("span", null, "Cash Sales (expected)"),
                          createVNode("span", { class: "font-weight-medium" }, toDisplayString(formatMoney(unref(expectedCashSales))), 1)
                        ]),
                        createVNode("div", { class: "shifts-zreport__row shifts-zreport__row--bold" }, [
                          createVNode("span", null, "Expected Cash in Drawer"),
                          createVNode("span", { class: "font-weight-bold" }, toDisplayString(formatMoney(unref(expectedTotal))), 1)
                        ]),
                        createVNode(VDivider, { class: "my-2" }),
                        createVNode("label", { class: "shifts-dialog__label mt-2" }, "Actual Cash Counted"),
                        createVNode("div", { class: "shifts-dialog__money-input" }, [
                          createVNode("span", { class: "shifts-dialog__money-prefix" }, toDisplayString(unref(currencySymbol)), 1),
                          withDirectives(createVNode("input", {
                            "onUpdate:modelValue": ($event) => isRef(actualCash) ? actualCash.value = $event : null,
                            type: "number",
                            class: "shifts-dialog__money-field",
                            placeholder: "0.00",
                            min: "0",
                            step: "0.01",
                            onKeyup: withKeys(confirmCloseShift, ["enter"])
                          }, null, 40, ["onUpdate:modelValue"]), [
                            [
                              vModelText,
                              unref(actualCash),
                              void 0,
                              { number: true }
                            ]
                          ])
                        ]),
                        createVNode("div", { class: "shifts-dialog__quick-buttons" }, [
                          (openBlock(true), createBlock(Fragment, null, renderList(unref(quickActualOptions), (q) => {
                            return openBlock(), createBlock("button", {
                              key: q,
                              class: "shifts-dialog__quick-btn",
                              onClick: ($event) => actualCash.value = q
                            }, toDisplayString(formatMoney(q)), 9, ["onClick"]);
                          }), 128))
                        ]),
                        createVNode("div", {
                          class: ["shifts-zreport__variance", unref(variancePreview) >= 0 ? "shifts-zreport__variance--ok" : "shifts-zreport__variance--bad"]
                        }, [
                          createVNode(VIcon, { size: "18" }, {
                            default: withCtx(() => [
                              createTextVNode(toDisplayString(unref(variancePreview) >= 0 ? "mdi-check-circle" : "mdi-alert-circle"), 1)
                            ]),
                            _: 1
                          }),
                          createVNode("div", null, [
                            createVNode("p", { class: "font-weight-medium" }, toDisplayString(unref(variancePreview) >= 0 ? "Surplus" : "Shortfall") + ": " + toDisplayString(formatMoney(Math.abs(unref(variancePreview)))), 1),
                            createVNode("p", { class: "text-caption text-medium-emphasis" }, toDisplayString(unref(variancePreview) >= 0 ? "Drawer has more cash than expected" : "Drawer is short of expected cash"), 1)
                          ])
                        ], 2),
                        createVNode("label", { class: "shifts-dialog__label mt-3" }, "Closing Notes"),
                        withDirectives(createVNode("textarea", {
                          "onUpdate:modelValue": ($event) => isRef(closeNotes) ? closeNotes.value = $event : null,
                          class: "shifts-dialog__textarea",
                          placeholder: "Optional notes about this shift...",
                          rows: "2"
                        }, null, 8, ["onUpdate:modelValue"]), [
                          [vModelText, unref(closeNotes)]
                        ])
                      ])
                    ]),
                    createVNode(VDivider),
                    createVNode("div", { class: "shifts-dialog__actions" }, [
                      createVNode(VBtn, {
                        variant: "text",
                        onClick: ($event) => closeShiftDialog.value = false
                      }, {
                        default: withCtx(() => [
                          createTextVNode("Cancel")
                        ]),
                        _: 1
                      }, 8, ["onClick"]),
                      createVNode(VBtn, {
                        variant: "flat",
                        color: "warning",
                        "prepend-icon": "mdi-check",
                        loading: unref(actionLoading),
                        onClick: confirmCloseShift
                      }, {
                        default: withCtx(() => [
                          createTextVNode("Close Shift")
                        ]),
                        _: 1
                      }, 8, ["loading"])
                    ])
                  ];
                }
              }),
              _: 1
            }, _parent2, _scopeId));
          } else {
            return [
              createVNode(VCard, {
                rounded: "xl",
                class: "shifts-dialog"
              }, {
                default: withCtx(() => {
                  var _a, _b, _c;
                  return [
                    createVNode("div", { class: "shifts-dialog__header" }, [
                      createVNode("div", { class: "shifts-dialog__header-icon shifts-dialog__header-icon--warning" }, [
                        createVNode(VIcon, { size: "24" }, {
                          default: withCtx(() => [
                            createTextVNode("mdi-stop-circle")
                          ]),
                          _: 1
                        })
                      ]),
                      createVNode("div", null, [
                        createVNode("h3", { class: "text-h6 font-weight-bold" }, "Close Shift \u2014 Z-Report"),
                        createVNode("p", { class: "text-body-2 text-medium-emphasis" }, toDisplayString((_a = unref(currentShift)) == null ? void 0 : _a.reference) + " \xB7 " + toDisplayString((_b = unref(currentShift)) == null ? void 0 : _b.branch_name), 1)
                      ])
                    ]),
                    createVNode(VDivider),
                    createVNode("div", { class: "shifts-dialog__body" }, [
                      createVNode("div", { class: "shifts-zreport" }, [
                        createVNode("div", { class: "shifts-zreport__row" }, [
                          createVNode("span", null, "Opening Float"),
                          createVNode("span", { class: "font-weight-medium" }, toDisplayString(formatMoney((_c = unref(currentShift)) == null ? void 0 : _c.opening_float)), 1)
                        ]),
                        createVNode("div", { class: "shifts-zreport__row" }, [
                          createVNode("span", null, "Cash Sales (expected)"),
                          createVNode("span", { class: "font-weight-medium" }, toDisplayString(formatMoney(unref(expectedCashSales))), 1)
                        ]),
                        createVNode("div", { class: "shifts-zreport__row shifts-zreport__row--bold" }, [
                          createVNode("span", null, "Expected Cash in Drawer"),
                          createVNode("span", { class: "font-weight-bold" }, toDisplayString(formatMoney(unref(expectedTotal))), 1)
                        ]),
                        createVNode(VDivider, { class: "my-2" }),
                        createVNode("label", { class: "shifts-dialog__label mt-2" }, "Actual Cash Counted"),
                        createVNode("div", { class: "shifts-dialog__money-input" }, [
                          createVNode("span", { class: "shifts-dialog__money-prefix" }, toDisplayString(unref(currencySymbol)), 1),
                          withDirectives(createVNode("input", {
                            "onUpdate:modelValue": ($event) => isRef(actualCash) ? actualCash.value = $event : null,
                            type: "number",
                            class: "shifts-dialog__money-field",
                            placeholder: "0.00",
                            min: "0",
                            step: "0.01",
                            onKeyup: withKeys(confirmCloseShift, ["enter"])
                          }, null, 40, ["onUpdate:modelValue"]), [
                            [
                              vModelText,
                              unref(actualCash),
                              void 0,
                              { number: true }
                            ]
                          ])
                        ]),
                        createVNode("div", { class: "shifts-dialog__quick-buttons" }, [
                          (openBlock(true), createBlock(Fragment, null, renderList(unref(quickActualOptions), (q) => {
                            return openBlock(), createBlock("button", {
                              key: q,
                              class: "shifts-dialog__quick-btn",
                              onClick: ($event) => actualCash.value = q
                            }, toDisplayString(formatMoney(q)), 9, ["onClick"]);
                          }), 128))
                        ]),
                        createVNode("div", {
                          class: ["shifts-zreport__variance", unref(variancePreview) >= 0 ? "shifts-zreport__variance--ok" : "shifts-zreport__variance--bad"]
                        }, [
                          createVNode(VIcon, { size: "18" }, {
                            default: withCtx(() => [
                              createTextVNode(toDisplayString(unref(variancePreview) >= 0 ? "mdi-check-circle" : "mdi-alert-circle"), 1)
                            ]),
                            _: 1
                          }),
                          createVNode("div", null, [
                            createVNode("p", { class: "font-weight-medium" }, toDisplayString(unref(variancePreview) >= 0 ? "Surplus" : "Shortfall") + ": " + toDisplayString(formatMoney(Math.abs(unref(variancePreview)))), 1),
                            createVNode("p", { class: "text-caption text-medium-emphasis" }, toDisplayString(unref(variancePreview) >= 0 ? "Drawer has more cash than expected" : "Drawer is short of expected cash"), 1)
                          ])
                        ], 2),
                        createVNode("label", { class: "shifts-dialog__label mt-3" }, "Closing Notes"),
                        withDirectives(createVNode("textarea", {
                          "onUpdate:modelValue": ($event) => isRef(closeNotes) ? closeNotes.value = $event : null,
                          class: "shifts-dialog__textarea",
                          placeholder: "Optional notes about this shift...",
                          rows: "2"
                        }, null, 8, ["onUpdate:modelValue"]), [
                          [vModelText, unref(closeNotes)]
                        ])
                      ])
                    ]),
                    createVNode(VDivider),
                    createVNode("div", { class: "shifts-dialog__actions" }, [
                      createVNode(VBtn, {
                        variant: "text",
                        onClick: ($event) => closeShiftDialog.value = false
                      }, {
                        default: withCtx(() => [
                          createTextVNode("Cancel")
                        ]),
                        _: 1
                      }, 8, ["onClick"]),
                      createVNode(VBtn, {
                        variant: "flat",
                        color: "warning",
                        "prepend-icon": "mdi-check",
                        loading: unref(actionLoading),
                        onClick: confirmCloseShift
                      }, {
                        default: withCtx(() => [
                          createTextVNode("Close Shift")
                        ]),
                        _: 1
                      }, 8, ["loading"])
                    ])
                  ];
                }),
                _: 1
              })
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(ssrRenderComponent(VDialog, {
        modelValue: unref(detailDialog),
        "onUpdate:modelValue": ($event) => isRef(detailDialog) ? detailDialog.value = $event : null,
        "max-width": "600"
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            if (unref(detailShift)) {
              _push2(ssrRenderComponent(VCard, {
                rounded: "xl",
                class: "shifts-dialog"
              }, {
                default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                  if (_push3) {
                    _push3(`<div class="${ssrRenderClass([`shifts-detail__header--${unref(detailShift).status}`, "shifts-detail__header"])}" data-v-1afc2da0${_scopeId2}><div class="shifts-detail__header-top" data-v-1afc2da0${_scopeId2}><div data-v-1afc2da0${_scopeId2}><span class="shifts-detail__z-report" data-v-1afc2da0${_scopeId2}>Z-REPORT</span><h3 class="text-h6 font-weight-bold mt-1" data-v-1afc2da0${_scopeId2}>${ssrInterpolate(unref(detailShift).reference)}</h3></div><span class="${ssrRenderClass([`shifts-detail__status-badge--${unref(detailShift).status}`, "shifts-detail__status-badge"])}" data-v-1afc2da0${_scopeId2}>${ssrInterpolate(unref(detailShift).status_display)}</span></div><div class="shifts-detail__header-meta" data-v-1afc2da0${_scopeId2}><span data-v-1afc2da0${_scopeId2}>`);
                    _push3(ssrRenderComponent(VIcon, {
                      size: "14",
                      class: "mr-1"
                    }, {
                      default: withCtx((_3, _push4, _parent4, _scopeId3) => {
                        if (_push4) {
                          _push4(`mdi-store`);
                        } else {
                          return [
                            createTextVNode("mdi-store")
                          ];
                        }
                      }),
                      _: 1
                    }, _parent3, _scopeId2));
                    _push3(`${ssrInterpolate(unref(detailShift).branch_name)}</span><span data-v-1afc2da0${_scopeId2}>`);
                    _push3(ssrRenderComponent(VIcon, {
                      size: "14",
                      class: "mr-1"
                    }, {
                      default: withCtx((_3, _push4, _parent4, _scopeId3) => {
                        if (_push4) {
                          _push4(`mdi-account`);
                        } else {
                          return [
                            createTextVNode("mdi-account")
                          ];
                        }
                      }),
                      _: 1
                    }, _parent3, _scopeId2));
                    _push3(`${ssrInterpolate(unref(detailShift).cashier_name)}</span></div><div class="shifts-detail__header-times" data-v-1afc2da0${_scopeId2}><span data-v-1afc2da0${_scopeId2}>Opened: ${ssrInterpolate(formatDateTime(unref(detailShift).opened_at))}</span>`);
                    if (unref(detailShift).closed_at) {
                      _push3(`<span data-v-1afc2da0${_scopeId2}>Closed: ${ssrInterpolate(formatDateTime(unref(detailShift).closed_at))}</span>`);
                    } else {
                      _push3(`<!---->`);
                    }
                    _push3(`<span data-v-1afc2da0${_scopeId2}>Duration: ${ssrInterpolate(unref(detailShift).duration)}</span></div></div><div class="shifts-detail__body" data-v-1afc2da0${_scopeId2}><div class="shifts-detail__section" data-v-1afc2da0${_scopeId2}><h4 class="shifts-detail__section-title" data-v-1afc2da0${_scopeId2}>Sales Summary</h4><div class="shifts-detail__row" data-v-1afc2da0${_scopeId2}><span data-v-1afc2da0${_scopeId2}>Transactions</span><span class="font-weight-medium" data-v-1afc2da0${_scopeId2}>${ssrInterpolate(unref(detailShift).transaction_count)}</span></div><div class="shifts-detail__row" data-v-1afc2da0${_scopeId2}><span data-v-1afc2da0${_scopeId2}>Gross Revenue</span><span class="font-weight-medium" data-v-1afc2da0${_scopeId2}>${ssrInterpolate(formatMoney(unref(detailShift).gross_revenue))}</span></div><div class="shifts-detail__row" data-v-1afc2da0${_scopeId2}><span data-v-1afc2da0${_scopeId2}>Total Discounts</span><span class="text-error" data-v-1afc2da0${_scopeId2}>${ssrInterpolate(formatMoney(unref(detailShift).total_discounts))}</span></div><div class="shifts-detail__row" data-v-1afc2da0${_scopeId2}><span data-v-1afc2da0${_scopeId2}>Total Tax</span><span data-v-1afc2da0${_scopeId2}>${ssrInterpolate(formatMoney(unref(detailShift).total_tax))}</span></div></div><div class="shifts-detail__section" data-v-1afc2da0${_scopeId2}><h4 class="shifts-detail__section-title" data-v-1afc2da0${_scopeId2}>Cash Reconciliation</h4><div class="shifts-detail__row" data-v-1afc2da0${_scopeId2}><span data-v-1afc2da0${_scopeId2}>Opening Float</span><span data-v-1afc2da0${_scopeId2}>${ssrInterpolate(formatMoney(unref(detailShift).opening_float))}</span></div>`);
                    if (unref(detailShift).actual_cash !== null) {
                      _push3(`<div class="shifts-detail__row" data-v-1afc2da0${_scopeId2}><span data-v-1afc2da0${_scopeId2}>Expected Cash</span><span data-v-1afc2da0${_scopeId2}>${ssrInterpolate(formatMoney(unref(detailShift).expected_cash))}</span></div>`);
                    } else {
                      _push3(`<!---->`);
                    }
                    if (unref(detailShift).actual_cash !== null) {
                      _push3(`<div class="shifts-detail__row" data-v-1afc2da0${_scopeId2}><span data-v-1afc2da0${_scopeId2}>Actual Cash</span><span class="font-weight-bold" data-v-1afc2da0${_scopeId2}>${ssrInterpolate(formatMoney(unref(detailShift).actual_cash))}</span></div>`);
                    } else {
                      _push3(`<!---->`);
                    }
                    if (unref(detailShift).actual_cash !== null) {
                      _push3(`<div class="shifts-detail__row shifts-detail__row--bold" data-v-1afc2da0${_scopeId2}><span data-v-1afc2da0${_scopeId2}>Cash Variance</span><span class="${ssrRenderClass(Number(unref(detailShift).cash_variance) >= 0 ? "text-success" : "text-error")}" data-v-1afc2da0${_scopeId2}>${ssrInterpolate(Number(unref(detailShift).cash_variance) >= 0 ? "+" : "")}${ssrInterpolate(formatMoney(unref(detailShift).cash_variance))}</span></div>`);
                    } else {
                      _push3(`<!---->`);
                    }
                    _push3(`</div>`);
                    if (unref(detailShift).notes) {
                      _push3(`<div class="shifts-detail__section" data-v-1afc2da0${_scopeId2}><h4 class="shifts-detail__section-title" data-v-1afc2da0${_scopeId2}>Notes</h4><p class="shifts-detail__notes" data-v-1afc2da0${_scopeId2}>${ssrInterpolate(unref(detailShift).notes)}</p></div>`);
                    } else {
                      _push3(`<!---->`);
                    }
                    _push3(`</div>`);
                    _push3(ssrRenderComponent(VDivider, null, null, _parent3, _scopeId2));
                    _push3(`<div class="shifts-dialog__actions" data-v-1afc2da0${_scopeId2}>`);
                    _push3(ssrRenderComponent(VBtn, {
                      variant: "text",
                      "prepend-icon": "mdi-printer",
                      onClick: printZReport
                    }, {
                      default: withCtx((_3, _push4, _parent4, _scopeId3) => {
                        if (_push4) {
                          _push4(`Print`);
                        } else {
                          return [
                            createTextVNode("Print")
                          ];
                        }
                      }),
                      _: 1
                    }, _parent3, _scopeId2));
                    _push3(ssrRenderComponent(VBtn, {
                      variant: "flat",
                      color: "primary",
                      onClick: ($event) => detailDialog.value = false
                    }, {
                      default: withCtx((_3, _push4, _parent4, _scopeId3) => {
                        if (_push4) {
                          _push4(`Close`);
                        } else {
                          return [
                            createTextVNode("Close")
                          ];
                        }
                      }),
                      _: 1
                    }, _parent3, _scopeId2));
                    _push3(`</div>`);
                  } else {
                    return [
                      createVNode("div", {
                        class: ["shifts-detail__header", `shifts-detail__header--${unref(detailShift).status}`]
                      }, [
                        createVNode("div", { class: "shifts-detail__header-top" }, [
                          createVNode("div", null, [
                            createVNode("span", { class: "shifts-detail__z-report" }, "Z-REPORT"),
                            createVNode("h3", { class: "text-h6 font-weight-bold mt-1" }, toDisplayString(unref(detailShift).reference), 1)
                          ]),
                          createVNode("span", {
                            class: ["shifts-detail__status-badge", `shifts-detail__status-badge--${unref(detailShift).status}`]
                          }, toDisplayString(unref(detailShift).status_display), 3)
                        ]),
                        createVNode("div", { class: "shifts-detail__header-meta" }, [
                          createVNode("span", null, [
                            createVNode(VIcon, {
                              size: "14",
                              class: "mr-1"
                            }, {
                              default: withCtx(() => [
                                createTextVNode("mdi-store")
                              ]),
                              _: 1
                            }),
                            createTextVNode(toDisplayString(unref(detailShift).branch_name), 1)
                          ]),
                          createVNode("span", null, [
                            createVNode(VIcon, {
                              size: "14",
                              class: "mr-1"
                            }, {
                              default: withCtx(() => [
                                createTextVNode("mdi-account")
                              ]),
                              _: 1
                            }),
                            createTextVNode(toDisplayString(unref(detailShift).cashier_name), 1)
                          ])
                        ]),
                        createVNode("div", { class: "shifts-detail__header-times" }, [
                          createVNode("span", null, "Opened: " + toDisplayString(formatDateTime(unref(detailShift).opened_at)), 1),
                          unref(detailShift).closed_at ? (openBlock(), createBlock("span", { key: 0 }, "Closed: " + toDisplayString(formatDateTime(unref(detailShift).closed_at)), 1)) : createCommentVNode("", true),
                          createVNode("span", null, "Duration: " + toDisplayString(unref(detailShift).duration), 1)
                        ])
                      ], 2),
                      createVNode("div", { class: "shifts-detail__body" }, [
                        createVNode("div", { class: "shifts-detail__section" }, [
                          createVNode("h4", { class: "shifts-detail__section-title" }, "Sales Summary"),
                          createVNode("div", { class: "shifts-detail__row" }, [
                            createVNode("span", null, "Transactions"),
                            createVNode("span", { class: "font-weight-medium" }, toDisplayString(unref(detailShift).transaction_count), 1)
                          ]),
                          createVNode("div", { class: "shifts-detail__row" }, [
                            createVNode("span", null, "Gross Revenue"),
                            createVNode("span", { class: "font-weight-medium" }, toDisplayString(formatMoney(unref(detailShift).gross_revenue)), 1)
                          ]),
                          createVNode("div", { class: "shifts-detail__row" }, [
                            createVNode("span", null, "Total Discounts"),
                            createVNode("span", { class: "text-error" }, toDisplayString(formatMoney(unref(detailShift).total_discounts)), 1)
                          ]),
                          createVNode("div", { class: "shifts-detail__row" }, [
                            createVNode("span", null, "Total Tax"),
                            createVNode("span", null, toDisplayString(formatMoney(unref(detailShift).total_tax)), 1)
                          ])
                        ]),
                        createVNode("div", { class: "shifts-detail__section" }, [
                          createVNode("h4", { class: "shifts-detail__section-title" }, "Cash Reconciliation"),
                          createVNode("div", { class: "shifts-detail__row" }, [
                            createVNode("span", null, "Opening Float"),
                            createVNode("span", null, toDisplayString(formatMoney(unref(detailShift).opening_float)), 1)
                          ]),
                          unref(detailShift).actual_cash !== null ? (openBlock(), createBlock("div", {
                            key: 0,
                            class: "shifts-detail__row"
                          }, [
                            createVNode("span", null, "Expected Cash"),
                            createVNode("span", null, toDisplayString(formatMoney(unref(detailShift).expected_cash)), 1)
                          ])) : createCommentVNode("", true),
                          unref(detailShift).actual_cash !== null ? (openBlock(), createBlock("div", {
                            key: 1,
                            class: "shifts-detail__row"
                          }, [
                            createVNode("span", null, "Actual Cash"),
                            createVNode("span", { class: "font-weight-bold" }, toDisplayString(formatMoney(unref(detailShift).actual_cash)), 1)
                          ])) : createCommentVNode("", true),
                          unref(detailShift).actual_cash !== null ? (openBlock(), createBlock("div", {
                            key: 2,
                            class: "shifts-detail__row shifts-detail__row--bold"
                          }, [
                            createVNode("span", null, "Cash Variance"),
                            createVNode("span", {
                              class: Number(unref(detailShift).cash_variance) >= 0 ? "text-success" : "text-error"
                            }, toDisplayString(Number(unref(detailShift).cash_variance) >= 0 ? "+" : "") + toDisplayString(formatMoney(unref(detailShift).cash_variance)), 3)
                          ])) : createCommentVNode("", true)
                        ]),
                        unref(detailShift).notes ? (openBlock(), createBlock("div", {
                          key: 0,
                          class: "shifts-detail__section"
                        }, [
                          createVNode("h4", { class: "shifts-detail__section-title" }, "Notes"),
                          createVNode("p", { class: "shifts-detail__notes" }, toDisplayString(unref(detailShift).notes), 1)
                        ])) : createCommentVNode("", true)
                      ]),
                      createVNode(VDivider),
                      createVNode("div", { class: "shifts-dialog__actions" }, [
                        createVNode(VBtn, {
                          variant: "text",
                          "prepend-icon": "mdi-printer",
                          onClick: printZReport
                        }, {
                          default: withCtx(() => [
                            createTextVNode("Print")
                          ]),
                          _: 1
                        }),
                        createVNode(VBtn, {
                          variant: "flat",
                          color: "primary",
                          onClick: ($event) => detailDialog.value = false
                        }, {
                          default: withCtx(() => [
                            createTextVNode("Close")
                          ]),
                          _: 1
                        }, 8, ["onClick"])
                      ])
                    ];
                  }
                }),
                _: 1
              }, _parent2, _scopeId));
            } else {
              _push2(`<!---->`);
            }
          } else {
            return [
              unref(detailShift) ? (openBlock(), createBlock(VCard, {
                key: 0,
                rounded: "xl",
                class: "shifts-dialog"
              }, {
                default: withCtx(() => [
                  createVNode("div", {
                    class: ["shifts-detail__header", `shifts-detail__header--${unref(detailShift).status}`]
                  }, [
                    createVNode("div", { class: "shifts-detail__header-top" }, [
                      createVNode("div", null, [
                        createVNode("span", { class: "shifts-detail__z-report" }, "Z-REPORT"),
                        createVNode("h3", { class: "text-h6 font-weight-bold mt-1" }, toDisplayString(unref(detailShift).reference), 1)
                      ]),
                      createVNode("span", {
                        class: ["shifts-detail__status-badge", `shifts-detail__status-badge--${unref(detailShift).status}`]
                      }, toDisplayString(unref(detailShift).status_display), 3)
                    ]),
                    createVNode("div", { class: "shifts-detail__header-meta" }, [
                      createVNode("span", null, [
                        createVNode(VIcon, {
                          size: "14",
                          class: "mr-1"
                        }, {
                          default: withCtx(() => [
                            createTextVNode("mdi-store")
                          ]),
                          _: 1
                        }),
                        createTextVNode(toDisplayString(unref(detailShift).branch_name), 1)
                      ]),
                      createVNode("span", null, [
                        createVNode(VIcon, {
                          size: "14",
                          class: "mr-1"
                        }, {
                          default: withCtx(() => [
                            createTextVNode("mdi-account")
                          ]),
                          _: 1
                        }),
                        createTextVNode(toDisplayString(unref(detailShift).cashier_name), 1)
                      ])
                    ]),
                    createVNode("div", { class: "shifts-detail__header-times" }, [
                      createVNode("span", null, "Opened: " + toDisplayString(formatDateTime(unref(detailShift).opened_at)), 1),
                      unref(detailShift).closed_at ? (openBlock(), createBlock("span", { key: 0 }, "Closed: " + toDisplayString(formatDateTime(unref(detailShift).closed_at)), 1)) : createCommentVNode("", true),
                      createVNode("span", null, "Duration: " + toDisplayString(unref(detailShift).duration), 1)
                    ])
                  ], 2),
                  createVNode("div", { class: "shifts-detail__body" }, [
                    createVNode("div", { class: "shifts-detail__section" }, [
                      createVNode("h4", { class: "shifts-detail__section-title" }, "Sales Summary"),
                      createVNode("div", { class: "shifts-detail__row" }, [
                        createVNode("span", null, "Transactions"),
                        createVNode("span", { class: "font-weight-medium" }, toDisplayString(unref(detailShift).transaction_count), 1)
                      ]),
                      createVNode("div", { class: "shifts-detail__row" }, [
                        createVNode("span", null, "Gross Revenue"),
                        createVNode("span", { class: "font-weight-medium" }, toDisplayString(formatMoney(unref(detailShift).gross_revenue)), 1)
                      ]),
                      createVNode("div", { class: "shifts-detail__row" }, [
                        createVNode("span", null, "Total Discounts"),
                        createVNode("span", { class: "text-error" }, toDisplayString(formatMoney(unref(detailShift).total_discounts)), 1)
                      ]),
                      createVNode("div", { class: "shifts-detail__row" }, [
                        createVNode("span", null, "Total Tax"),
                        createVNode("span", null, toDisplayString(formatMoney(unref(detailShift).total_tax)), 1)
                      ])
                    ]),
                    createVNode("div", { class: "shifts-detail__section" }, [
                      createVNode("h4", { class: "shifts-detail__section-title" }, "Cash Reconciliation"),
                      createVNode("div", { class: "shifts-detail__row" }, [
                        createVNode("span", null, "Opening Float"),
                        createVNode("span", null, toDisplayString(formatMoney(unref(detailShift).opening_float)), 1)
                      ]),
                      unref(detailShift).actual_cash !== null ? (openBlock(), createBlock("div", {
                        key: 0,
                        class: "shifts-detail__row"
                      }, [
                        createVNode("span", null, "Expected Cash"),
                        createVNode("span", null, toDisplayString(formatMoney(unref(detailShift).expected_cash)), 1)
                      ])) : createCommentVNode("", true),
                      unref(detailShift).actual_cash !== null ? (openBlock(), createBlock("div", {
                        key: 1,
                        class: "shifts-detail__row"
                      }, [
                        createVNode("span", null, "Actual Cash"),
                        createVNode("span", { class: "font-weight-bold" }, toDisplayString(formatMoney(unref(detailShift).actual_cash)), 1)
                      ])) : createCommentVNode("", true),
                      unref(detailShift).actual_cash !== null ? (openBlock(), createBlock("div", {
                        key: 2,
                        class: "shifts-detail__row shifts-detail__row--bold"
                      }, [
                        createVNode("span", null, "Cash Variance"),
                        createVNode("span", {
                          class: Number(unref(detailShift).cash_variance) >= 0 ? "text-success" : "text-error"
                        }, toDisplayString(Number(unref(detailShift).cash_variance) >= 0 ? "+" : "") + toDisplayString(formatMoney(unref(detailShift).cash_variance)), 3)
                      ])) : createCommentVNode("", true)
                    ]),
                    unref(detailShift).notes ? (openBlock(), createBlock("div", {
                      key: 0,
                      class: "shifts-detail__section"
                    }, [
                      createVNode("h4", { class: "shifts-detail__section-title" }, "Notes"),
                      createVNode("p", { class: "shifts-detail__notes" }, toDisplayString(unref(detailShift).notes), 1)
                    ])) : createCommentVNode("", true)
                  ]),
                  createVNode(VDivider),
                  createVNode("div", { class: "shifts-dialog__actions" }, [
                    createVNode(VBtn, {
                      variant: "text",
                      "prepend-icon": "mdi-printer",
                      onClick: printZReport
                    }, {
                      default: withCtx(() => [
                        createTextVNode("Print")
                      ]),
                      _: 1
                    }),
                    createVNode(VBtn, {
                      variant: "flat",
                      color: "primary",
                      onClick: ($event) => detailDialog.value = false
                    }, {
                      default: withCtx(() => [
                        createTextVNode("Close")
                      ]),
                      _: 1
                    }, 8, ["onClick"])
                  ])
                ]),
                _: 1
              })) : createCommentVNode("", true)
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`</div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/pos/shifts.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const shifts = /* @__PURE__ */ _export_sfc(_sfc_main, [["__scopeId", "data-v-1afc2da0"]]);

export { shifts as default };
//# sourceMappingURL=shifts-DmpgHTPw.mjs.map
