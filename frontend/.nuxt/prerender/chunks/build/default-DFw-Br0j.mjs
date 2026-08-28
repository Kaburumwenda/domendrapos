import { _ as __nuxt_component_0 } from './nuxt-link-CSYEAARP.mjs';
import { defineComponent, ref, computed, watch, withCtx, createTextVNode, unref, toDisplayString, createVNode, openBlock, createBlock, createCommentVNode, Fragment, renderList, mergeProps, withModifiers, renderSlot, shallowRef, toValue, nextTick, getCurrentScope, onScopeDispose, getCurrentInstance, useSSRContext } from 'file://D:/Projects/MY-APPS-2/DomendraPOS/frontend/node_modules/vue/index.mjs';
import { ssrRenderComponent, ssrRenderAttr, ssrInterpolate, ssrRenderList, ssrRenderClass, ssrRenderSlot } from 'file://D:/Projects/MY-APPS-2/DomendraPOS/frontend/node_modules/vue/server-renderer/index.mjs';
import { u as useBranchStore } from './branch-CYAnxNUU.mjs';
import { _ as _export_sfc, E as useRoute$1, z as useCookie, al as VApp, a2 as VNavigationDrawer, a as VIcon, as as VAppBar, at as VAppBarNavIcon, b as VSpacer, c as VBtn, C as VMenu, M as VList, k as VDivider, N as VListItem, H as VAvatar, am as VMain, V as VContainer, A as useRuntimeConfig, ar as useTheme$1, J as VSelect } from './server.mjs';
import { a as useAuthStore } from './useApi-D4YG8JPQ.mjs';
import { u as useFormat } from './useFormat-BvVWDMYe.mjs';
import 'file://D:/Projects/MY-APPS-2/DomendraPOS/frontend/node_modules/ufo/dist/index.mjs';
import 'file://D:/Projects/MY-APPS-2/DomendraPOS/frontend/node_modules/pinia/dist/pinia.js';
import 'file://D:/Projects/MY-APPS-2/DomendraPOS/frontend/node_modules/ofetch/dist/node.mjs';
import '../_/renderer.mjs';
import 'file://D:/Projects/MY-APPS-2/DomendraPOS/frontend/node_modules/vue-bundle-renderer/dist/runtime.mjs';
import 'file://D:/Projects/MY-APPS-2/DomendraPOS/frontend/node_modules/h3/dist/index.mjs';
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

const _sfc_main$1 = /* @__PURE__ */ defineComponent({
  __name: "BranchSelector",
  __ssrInlineRender: true,
  setup(__props) {
    const branchStore = useBranchStore();
    function onChange(id) {
      const br = branchStore.branches.find((b) => b.id === id);
      branchStore.setBranch(id, br == null ? void 0 : br.name);
    }
    return (_ctx, _push, _parent, _attrs) => {
      _push(ssrRenderComponent(VSelect, mergeProps({
        modelValue: unref(branchStore).branchId,
        "onUpdate:modelValue": [($event) => unref(branchStore).branchId = $event, onChange],
        items: unref(branchStore).branchOptions,
        "item-title": "name",
        "item-value": "id",
        loading: unref(branchStore).loading,
        variant: "outlined",
        density: "compact",
        "hide-details": "",
        rounded: "lg",
        "prepend-inner-icon": "mdi-store-outline",
        class: "branch-selector"
      }, _attrs), null, _parent));
    };
  }
});
const _sfc_setup$1 = _sfc_main$1.setup;
_sfc_main$1.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/BranchSelector.vue");
  return _sfc_setup$1 ? _sfc_setup$1(props, ctx) : void 0;
};
const __nuxt_component_1 = /* @__PURE__ */ Object.assign(_export_sfc(_sfc_main$1, [["__scopeId", "data-v-1355692f"]]), { __name: "BranchSelector" });
function tryOnScopeDispose(fn, failSilently) {
  if (getCurrentScope()) {
    onScopeDispose(fn, failSilently);
    return true;
  }
  return false;
}
typeof WorkerGlobalScope !== "undefined" && globalThis instanceof WorkerGlobalScope;
const toString = Object.prototype.toString;
const isObject = (val) => toString.call(val) === "[object Object]";
function toArray(value) {
  return Array.isArray(value) ? value : [value];
}
function getLifeCycleTarget(target) {
  return getCurrentInstance();
}
function tryOnMounted(fn, sync = true, target) {
  if (getLifeCycleTarget()) ;
  else if (sync) fn();
  else nextTick(fn);
}
function watchImmediate(source, cb, options) {
  return watch(source, cb, {
    ...options,
    immediate: true
  });
}
const defaultWindow = void 0;
const defaultDocument = void 0;
function unrefElement(elRef) {
  var _$el;
  const plain = toValue(elRef);
  return (_$el = plain === null || plain === void 0 ? void 0 : plain.$el) !== null && _$el !== void 0 ? _$el : plain;
}
function useEventListener(...args) {
  const register = (el, event, listener, options) => {
    el.addEventListener(event, listener, options);
    return () => el.removeEventListener(event, listener, options);
  };
  const firstParamTargets = computed(() => {
    const test = toArray(toValue(args[0])).filter((e) => e != null);
    return test.every((e) => typeof e !== "string") ? test : void 0;
  });
  return watchImmediate(() => {
    var _firstParamTargets$va, _firstParamTargets$va2;
    return [
      (_firstParamTargets$va = (_firstParamTargets$va2 = firstParamTargets.value) === null || _firstParamTargets$va2 === void 0 ? void 0 : _firstParamTargets$va2.map((e) => unrefElement(e))) !== null && _firstParamTargets$va !== void 0 ? _firstParamTargets$va : [defaultWindow].filter((e) => e != null),
      toArray(toValue(firstParamTargets.value ? args[1] : args[0])),
      toArray(unref(firstParamTargets.value ? args[2] : args[1])),
      toValue(firstParamTargets.value ? args[3] : args[2])
    ];
  }, ([raw_targets, raw_events, raw_listeners, raw_options], _, onCleanup) => {
    if (!(raw_targets === null || raw_targets === void 0 ? void 0 : raw_targets.length) || !(raw_events === null || raw_events === void 0 ? void 0 : raw_events.length) || !(raw_listeners === null || raw_listeners === void 0 ? void 0 : raw_listeners.length)) return;
    const optionsClone = isObject(raw_options) ? { ...raw_options } : raw_options;
    const cleanups = raw_targets.flatMap((el) => raw_events.flatMap((event) => raw_listeners.map((listener) => register(el, event, listener, optionsClone))));
    onCleanup(() => {
      cleanups.forEach((fn) => fn());
    });
  }, { flush: "post" });
}
// @__NO_SIDE_EFFECTS__
function useMounted() {
  const isMounted = shallowRef(false);
  getCurrentInstance();
  return isMounted;
}
// @__NO_SIDE_EFFECTS__
function useSupported(callback) {
  const isMounted = /* @__PURE__ */ useMounted();
  return computed(() => {
    isMounted.value;
    return Boolean(callback());
  });
}
const eventHandlers = [
  "fullscreenchange",
  "webkitfullscreenchange",
  "webkitendfullscreen",
  "mozfullscreenchange",
  "MSFullscreenChange"
];
function useFullscreen(target, options = {}) {
  const { document: document2 = defaultDocument, autoExit = false } = options;
  const targetRef = computed(() => {
    var _unrefElement;
    return (_unrefElement = unrefElement(target)) !== null && _unrefElement !== void 0 ? _unrefElement : document2 === null || document2 === void 0 ? void 0 : document2.documentElement;
  });
  const isFullscreen = shallowRef(false);
  const requestMethod = computed(() => {
    return [
      "requestFullscreen",
      "webkitRequestFullscreen",
      "webkitEnterFullscreen",
      "webkitEnterFullScreen",
      "webkitRequestFullScreen",
      "mozRequestFullScreen",
      "msRequestFullscreen"
    ].find((m) => document2 && m in document2 || targetRef.value && m in targetRef.value);
  });
  const exitMethod = computed(() => {
    return [
      "exitFullscreen",
      "webkitExitFullscreen",
      "webkitExitFullScreen",
      "webkitCancelFullScreen",
      "mozCancelFullScreen",
      "msExitFullscreen"
    ].find((m) => document2 && m in document2 || targetRef.value && m in targetRef.value);
  });
  const fullscreenEnabled = computed(() => {
    return [
      "fullScreen",
      "webkitIsFullScreen",
      "webkitDisplayingFullscreen",
      "mozFullScreen",
      "msFullscreenElement"
    ].find((m) => document2 && m in document2 || targetRef.value && m in targetRef.value);
  });
  const fullscreenElementMethod = [
    "fullscreenElement",
    "webkitFullscreenElement",
    "mozFullScreenElement",
    "msFullscreenElement"
  ].find((m) => document2 && m in document2);
  const isSupported = /* @__PURE__ */ useSupported(() => targetRef.value && document2 && requestMethod.value !== void 0 && exitMethod.value !== void 0 && fullscreenEnabled.value !== void 0);
  const isCurrentElementFullScreen = () => {
    if (fullscreenElementMethod) return (document2 === null || document2 === void 0 ? void 0 : document2[fullscreenElementMethod]) === targetRef.value;
    return false;
  };
  const isElementFullScreen = () => {
    if (fullscreenEnabled.value) if (document2 && document2[fullscreenEnabled.value] != null) return document2[fullscreenEnabled.value];
    else {
      const target2 = targetRef.value;
      if ((target2 === null || target2 === void 0 ? void 0 : target2[fullscreenEnabled.value]) != null) return Boolean(target2[fullscreenEnabled.value]);
    }
    return false;
  };
  async function exit() {
    if (!isSupported.value || !isFullscreen.value) return;
    if (exitMethod.value) if ((document2 === null || document2 === void 0 ? void 0 : document2[exitMethod.value]) != null) await document2[exitMethod.value]();
    else {
      const target2 = targetRef.value;
      if ((target2 === null || target2 === void 0 ? void 0 : target2[exitMethod.value]) != null) await target2[exitMethod.value]();
    }
    isFullscreen.value = false;
  }
  async function enter() {
    if (!isSupported.value || isFullscreen.value) return;
    if (isElementFullScreen()) await exit();
    const target2 = targetRef.value;
    if (requestMethod.value && (target2 === null || target2 === void 0 ? void 0 : target2[requestMethod.value]) != null) {
      await target2[requestMethod.value]();
      isFullscreen.value = true;
    }
  }
  async function toggle() {
    await (isFullscreen.value ? exit() : enter());
  }
  const handlerCallback = () => {
    const isElementFullScreenValue = isElementFullScreen();
    if (!isElementFullScreenValue || isElementFullScreenValue && isCurrentElementFullScreen()) isFullscreen.value = isElementFullScreenValue;
  };
  const listenerOptions = {
    capture: false,
    passive: true
  };
  useEventListener(document2, eventHandlers, handlerCallback, listenerOptions);
  useEventListener(() => unrefElement(targetRef), eventHandlers, handlerCallback, listenerOptions);
  tryOnMounted(handlerCallback, false);
  if (autoExit) tryOnScopeDispose(exit);
  return {
    isSupported,
    isFullscreen,
    enter,
    exit,
    toggle
  };
}
const COOKIE_KEY = "domendrapos-theme";
const mode = ref("light");
let initialized = false;
let vuetifyTheme = null;
const themeCookieRef = ref(null);
function resolveInitialMode() {
  var _a;
  const cookie = (_a = themeCookieRef.value) == null ? void 0 : _a.value;
  if (cookie === "light" || cookie === "dark") return cookie;
  return "light";
}
async function applyTheme(next) {
  if (vuetifyTheme) {
    try {
      await vuetifyTheme.change(next);
    } catch {
      vuetifyTheme.global.name.value = next;
    }
  }
}
function init() {
  if (initialized) return;
  initialized = true;
  try {
    themeCookieRef.value = useCookie(COOKIE_KEY, {
      default: () => "light",
      maxAge: 60 * 60 * 24 * 365,
      sameSite: "lax"
    });
  } catch {
    themeCookieRef.value = null;
  }
  try {
    vuetifyTheme = useTheme$1();
  } catch {
    vuetifyTheme = null;
  }
  mode.value = resolveInitialMode();
  applyTheme(mode.value);
  watch(mode, (next) => {
    if (themeCookieRef.value) themeCookieRef.value.value = next;
    applyTheme(next);
  });
}
function useTheme() {
  init();
  function toggle() {
    mode.value = mode.value === "dark" ? "light" : "dark";
  }
  function setDark() {
    mode.value = "dark";
  }
  function setLight() {
    mode.value = "light";
  }
  return {
    mode,
    isDark: computed(() => mode.value === "dark"),
    toggle,
    setDark,
    setLight
  };
}
const iconDashboard = "mdi-view-dashboard-outline";
const iconSales = "mdi-receipt-text-outline";
const iconPOS = "mdi-cash-register";
const iconProducts = "mdi-package-variant-closed";
const iconInventory = "mdi-archive-outline";
const iconAdjustment = "mdi-clipboard-edit-outline";
const iconStockOnHand = "mdi-clipboard-list";
const iconMovements = "mdi-swap-horizontal";
const iconLowStockAlert = "mdi-alert-octagon-outline";
const iconCustomers = "mdi-account-group-outline";
const iconReports = "mdi-chart-box-outline";
const iconStaff = "mdi-account-tie-outline";
const iconBranches = "mdi-store-outline";
const iconTruck = "mdi-truck-fast-outline";
const iconSettings = "mdi-cog-outline";
const iconFinance = "mdi-finance";
const iconChart = "mdi-chart-line";
const iconReceipt = "mdi-receipt-outline";
const iconCredit = "mdi-credit-card-outline";
const iconInvoice = "mdi-file-document-outline";
const iconExpense = "mdi-cash-minus";
const iconClipboard = "mdi-clipboard-list-outline";
const iconShield = "mdi-shield-account-outline";
const iconKey = "mdi-key-variant";
const iconLock = "mdi-lock-outline";
const iconAudit = "mdi-file-document-multiple-outline";
const iconBilling = "mdi-credit-card-clock-outline";
const iconUsage = "mdi-chart-bar";
const iconPayments = "mdi-cash-fast";
const iconDomain = "mdi-domain";
const iconCog = "mdi-cog-outline";
const iconLayers = "mdi-layers-triple";
const iconCellphone = "mdi-cellphone-link";
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "default",
  __ssrInlineRender: true,
  setup(__props) {
    const route = useRoute$1();
    const auth = useAuthStore();
    const theme = useTheme();
    const { isFullscreen, toggle: toggleFullscreen } = useFullscreen();
    const drawer = ref(true);
    const rail = ref(true);
    const config = useRuntimeConfig();
    const tenantLogoUrl = computed(() => {
      var _a;
      const logo = (_a = auth.tenant) == null ? void 0 : _a.logo;
      if (!logo) return "";
      if (logo.startsWith("http")) return logo;
      return config.public.apiBase.replace("/api", "") + "/" + logo;
    });
    const expandedGroups = ref({});
    const activeGroupName = ref(null);
    function toggleGroup(label) {
      if (expandedGroups.value[label]) {
        expandedGroups.value[label] = false;
        activeGroupName.value = null;
      } else {
        expandedGroups.value = {};
        expandedGroups.value[label] = true;
        activeGroupName.value = label;
      }
    }
    function isGroupActive(item) {
      var _a, _b;
      return (_b = (_a = item.children) == null ? void 0 : _a.some((c) => isActive(c.path))) != null ? _b : false;
    }
    function filterNavItems(items) {
      if (auth.isManager) return items;
      return items.map((item) => {
        if (item.module && !auth.canAccess(item.module)) return null;
        if (item.children) {
          const children = item.children.filter((c) => !c.module || auth.canAccess(c.module));
          if (children.length === 0) return null;
          return { ...item, children };
        }
        if (item.module && !auth.canAccess(item.module)) return null;
        return item;
      }).filter(Boolean);
    }
    const navItems = computed(() => filterNavItems([
      { path: "/dashboard", label: "Dashboard", icon: iconDashboard },
      {
        label: "Point of Sale",
        icon: iconPOS,
        children: [
          { path: "/pos", label: "Checkout", icon: iconPOS, module: "sales" },
          { path: "/pos/history", label: "Sales History", icon: iconSales, module: "sales" },
          { path: "/pos/parked", label: "Parked Sales", icon: iconReceipt, module: "sales" },
          { path: "/pos/shifts", label: "Cashier Shifts", icon: iconStaff, module: "sales" }
        ]
      },
      {
        label: "Inventory",
        icon: iconInventory,
        children: [
          { path: "/products", label: "Stock Items", icon: iconProducts, module: "products" },
          { path: "/inventory/stock", label: "Stock on Hand", icon: iconStockOnHand, module: "inventory" },
          { path: "/inventory/movements", label: "Stock Movements", icon: iconMovements, module: "inventory" },
          { path: "/inventory/low-stock", label: "Low Stock Alerts", icon: iconLowStockAlert, module: "inventory" },
          { path: "/inventory/adjustments", label: "Adjustments", icon: iconAdjustment, module: "inventory" },
          { path: "/inventory/stock-analysis", label: "Stock Analysis", icon: iconChart, module: "inventory" }
        ]
      },
      { path: "/customers", label: "Customers", icon: iconCustomers, module: "customers" },
      { path: "/suppliers", label: "Suppliers", icon: iconTruck, module: "suppliers" },
      { path: "/reports", label: "Reports", icon: iconReports, module: "reports" },
      // ---- Pharmacy Section ----
      {
        label: "Accounts & Finance",
        icon: iconFinance,
        children: [
          { path: "/accounts", label: "Overview", icon: iconFinance, module: "accounting" },
          { path: "/invoices", label: "Invoices", icon: iconInvoice, module: "accounting" },
          { path: "/credit", label: "Credit Accounts", icon: iconCredit, module: "accounting" },
          { path: "/expenses", label: "Expenses", icon: iconExpense, module: "accounting" },
          { path: "/purchase-orders", label: "Purchase Orders", icon: iconClipboard, module: "purchasing" }
        ]
      },
      {
        label: "Analytics",
        icon: iconChart,
        module: "analytics",
        children: [
          { path: "/analytics", label: "Overview", icon: iconChart, module: "analytics" },
          { path: "/analytics/categories", label: "Categories", icon: iconChart, module: "analytics" },
          { path: "/analytics/products", label: "Products", icon: iconProducts, module: "analytics" },
          { path: "/sales", label: "Sales", icon: iconSales, module: "sales" }
        ]
      }
    ]));
    const adminItems = computed(() => filterNavItems([
      { path: "/admin/staff", label: "Staff Management", icon: iconStaff, module: "staff" },
      { path: "/admin/branches", label: "Branches", icon: iconBranches, module: "branches" },
      {
        label: "IAM & Security",
        icon: iconShield,
        children: [
          { path: "/admin/roles-permissions", label: "Roles & Permissions", icon: iconKey, module: "staff" },
          { path: "/admin/audit-logs", label: "Audit Logs", icon: iconAudit, module: "staff" },
          { path: "/admin/security", label: "Security Control", icon: iconLock, module: "staff" }
        ]
      },
      {
        label: "API Billing",
        icon: iconBilling,
        children: [
          { path: "/admin/billing/usage", label: "API Usage", icon: iconUsage, module: "settings" },
          { path: "/admin/billing/payments", label: "Payments", icon: iconPayments, module: "settings" }
        ]
      },
      { path: "/admin/settings", label: "Settings", icon: iconSettings, module: "settings" }
    ]));
    const superadminItems = computed(() => [
      { path: "/superadmin", label: "Platform Dashboard", icon: iconDashboard },
      { path: "/superadmin/tenants", label: "Tenants", icon: iconDomain },
      {
        label: "Subscriptions & Billing",
        icon: iconBilling,
        children: [
          { path: "/superadmin/billing", label: "Invoices", icon: iconInvoice },
          { path: "/superadmin/plans", label: "Plans", icon: iconLayers },
          { path: "/superadmin/payments", label: "M-Pesa Payments", icon: iconCellphone }
        ]
      },
      { path: "/superadmin/settings", label: "Gateway Settings", icon: iconCog }
    ]);
    computed(() => {
      const titles = {
        "/dashboard": "Dashboard",
        "/pos": "Point of Sale",
        "/pos/history": "POS Sales History",
        "/pos/parked": "Parked Sales",
        "/pos/shifts": "Cashier Shifts",
        "/sales": "Sales",
        "/products": "Stock Items",
        "/inventory": "Inventory",
        "/inventory/stock": "Stock on Hand",
        "/inventory/movements": "Stock Movements",
        "/inventory/low-stock": "Low Stock Alerts",
        "/inventory/adjustments": "Stock Adjustments",
        "/inventory/stock-analysis": "Stock Analysis",
        "/customers": "Customer CRM",
        "/suppliers": "Suppliers",
        "/reports": "Reports",
        "/admin/staff": "Staff Management",
        "/admin/branches": "Branch Management",
        "/admin/roles-permissions": "Roles & Permissions",
        "/admin/audit-logs": "Audit Logs",
        "/admin/billing/usage": "API Usage",
        "/admin/billing/payments": "API Billing Payments",
        "/admin/settings": "Settings",
        // Pharmacy
        "/accounts": "Accounts & Finance",
        "/invoices": "Customer Invoices",
        "/credit": "Credit Accounts",
        "/expenses": "Operating Expenses",
        "/expenses/categories": "Expense Categories",
        "/purchase-orders": "Purchase Orders",
        "/analytics": "Analytics Overview",
        "/analytics/categories": "Category Analysis",
        "/analytics/products": "Product Analysis",
        "/sales": "Sales",
        // Super-admin
        "/superadmin": "Platform Dashboard",
        "/superadmin/tenants": "Tenant Management",
        "/superadmin/billing": "Platform Billing",
        "/superadmin/plans": "Subscription Plans",
        "/superadmin/payments": "M-Pesa Payments",
        "/superadmin/settings": "Gateway Settings"
      };
      return titles[route.path] || "DomendraPOS";
    });
    computed(() => {
      return (/* @__PURE__ */ new Date()).toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric", year: "numeric" });
    });
    const isActive = (path) => route.path === path || route.path.startsWith(path + "/");
    watch(route, () => {
      const allGroups = [
        ...navItems.value,
        ...auth.isManager && !auth.isSuperAdmin ? adminItems.value : [],
        ...auth.isSuperAdmin ? superadminItems.value : []
      ];
      let foundGroup = false;
      for (const item of allGroups) {
        if (item.children && item.children.some((c) => isActive(c.path))) {
          expandedGroups.value = {};
          expandedGroups.value[item.label] = true;
          activeGroupName.value = item.label;
          foundGroup = true;
        }
      }
      if (!foundGroup) {
        expandedGroups.value = {};
        activeGroupName.value = null;
      }
    }, { immediate: true });
    const initials = computed(() => {
      if (!auth.user) return "";
      return (auth.user.first_name[0] || "") + (auth.user.last_name[0] || "");
    });
    const clockDigits = ref({ h1: "0", h2: "0", m1: "0", m2: "0", s1: "0", s2: "0" });
    const clockColon = ref(true);
    const countdown = ref("");
    const storeOpen = ref(true);
    const sessionDuration = ref("");
    useCookie("login_time");
    const todayKpis = ref({ revenue: 0, txCount: 0, items: 0 });
    async function fetchTodayStats() {
      if (!auth.isAuthenticated || true) return;
    }
    const branchStore = useBranchStore();
    const { currency } = useFormat();
    function formatMoney(v) {
      return currency(Number(v) || 0);
    }
    watch([() => route.path, () => branchStore.branchId], () => fetchTodayStats());
    return (_ctx, _push, _parent, _attrs) => {
      const _component_NuxtLink = __nuxt_component_0;
      const _component_BranchSelector = __nuxt_component_1;
      _push(ssrRenderComponent(VApp, _attrs, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(ssrRenderComponent(VNavigationDrawer, {
              modelValue: drawer.value,
              "onUpdate:modelValue": ($event) => drawer.value = $event,
              rail: rail.value,
              "rail-width": "72",
              width: "260",
              permanent: "",
              app: "",
              class: "sidebar-drawer"
            }, {
              append: withCtx((_2, _push3, _parent3, _scopeId2) => {
                if (_push3) {
                  _push3(`<div class="sidebar-rail-toggle" data-v-36979901${_scopeId2}><button class="sidebar-item sidebar-item--rail" data-v-36979901${_scopeId2}>`);
                  _push3(ssrRenderComponent(VIcon, {
                    size: "18",
                    class: "sidebar-item__icon"
                  }, {
                    default: withCtx((_3, _push4, _parent4, _scopeId3) => {
                      if (_push4) {
                        _push4(`${ssrInterpolate(rail.value ? "mdi-chevron-double-right" : "mdi-chevron-double-left")}`);
                      } else {
                        return [
                          createTextVNode(toDisplayString(rail.value ? "mdi-chevron-double-right" : "mdi-chevron-double-left"), 1)
                        ];
                      }
                    }),
                    _: 1
                  }, _parent3, _scopeId2));
                  if (!rail.value) {
                    _push3(`<span class="sidebar-item__label" data-v-36979901${_scopeId2}>Collapse</span>`);
                  } else {
                    _push3(`<!---->`);
                  }
                  _push3(`</button></div>`);
                } else {
                  return [
                    createVNode("div", { class: "sidebar-rail-toggle" }, [
                      createVNode("button", {
                        class: "sidebar-item sidebar-item--rail",
                        onClick: ($event) => rail.value = !rail.value
                      }, [
                        createVNode(VIcon, {
                          size: "18",
                          class: "sidebar-item__icon"
                        }, {
                          default: withCtx(() => [
                            createTextVNode(toDisplayString(rail.value ? "mdi-chevron-double-right" : "mdi-chevron-double-left"), 1)
                          ]),
                          _: 1
                        }),
                        !rail.value ? (openBlock(), createBlock("span", {
                          key: 0,
                          class: "sidebar-item__label"
                        }, "Collapse")) : createCommentVNode("", true)
                      ], 8, ["onClick"])
                    ])
                  ];
                }
              }),
              default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                if (_push3) {
                  _push3(`<div class="sidebar-logo" data-v-36979901${_scopeId2}><div class="sidebar-logo__icon" data-v-36979901${_scopeId2}>`);
                  if (tenantLogoUrl.value) {
                    _push3(`<img${ssrRenderAttr("src", tenantLogoUrl.value)} alt="Logo" class="sidebar-logo__img" data-v-36979901${_scopeId2}>`);
                  } else {
                    _push3(ssrRenderComponent(VIcon, {
                      size: "22",
                      color: "white"
                    }, {
                      default: withCtx((_3, _push4, _parent4, _scopeId3) => {
                        if (_push4) {
                          _push4(`mdi-monitor`);
                        } else {
                          return [
                            createTextVNode("mdi-monitor")
                          ];
                        }
                      }),
                      _: 1
                    }, _parent3, _scopeId2));
                  }
                  _push3(`</div>`);
                  if (!rail.value) {
                    _push3(`<div class="sidebar-logo__text" data-v-36979901${_scopeId2}><span class="sidebar-logo__title" data-v-36979901${_scopeId2}>${ssrInterpolate(unref(auth).isSuperAdmin ? "DomendraPOS" : unref(auth).tenantName || "DomendraPOS")}</span><p class="sidebar-logo__sub" data-v-36979901${_scopeId2}>${ssrInterpolate(unref(auth).isSuperAdmin ? "Platform Admin" : "Point of Sale")}</p></div>`);
                  } else {
                    _push3(`<!---->`);
                  }
                  _push3(`</div>`);
                  if (!unref(auth).isSuperAdmin) {
                    _push3(`<nav class="sidebar-nav" data-v-36979901${_scopeId2}><!--[-->`);
                    ssrRenderList(navItems.value, (item) => {
                      _push3(`<!--[-->`);
                      if (item.children) {
                        _push3(`<div class="sidebar-group" data-v-36979901${_scopeId2}><button class="${ssrRenderClass([{ "sidebar-item--active": isGroupActive(item), "sidebar-item--open": expandedGroups.value[item.label] }, "sidebar-item"])}" data-v-36979901${_scopeId2}>`);
                        _push3(ssrRenderComponent(VIcon, {
                          size: "20",
                          class: "sidebar-item__icon"
                        }, {
                          default: withCtx((_3, _push4, _parent4, _scopeId3) => {
                            if (_push4) {
                              _push4(`${ssrInterpolate(item.icon)}`);
                            } else {
                              return [
                                createTextVNode(toDisplayString(item.icon), 1)
                              ];
                            }
                          }),
                          _: 2
                        }, _parent3, _scopeId2));
                        if (!rail.value) {
                          _push3(`<span class="sidebar-item__label" data-v-36979901${_scopeId2}>${ssrInterpolate(item.label)}</span>`);
                        } else {
                          _push3(`<!---->`);
                        }
                        if (!rail.value) {
                          _push3(ssrRenderComponent(VIcon, {
                            size: "16",
                            class: "sidebar-item__chevron"
                          }, {
                            default: withCtx((_3, _push4, _parent4, _scopeId3) => {
                              if (_push4) {
                                _push4(`${ssrInterpolate(expandedGroups.value[item.label] ? "mdi-chevron-up" : "mdi-chevron-down")}`);
                              } else {
                                return [
                                  createTextVNode(toDisplayString(expandedGroups.value[item.label] ? "mdi-chevron-up" : "mdi-chevron-down"), 1)
                                ];
                              }
                            }),
                            _: 2
                          }, _parent3, _scopeId2));
                        } else {
                          _push3(`<!---->`);
                        }
                        _push3(`</button>`);
                        if (!rail.value && expandedGroups.value[item.label]) {
                          _push3(`<div class="sidebar-group__children" data-v-36979901${_scopeId2}><!--[-->`);
                          ssrRenderList(item.children, (child) => {
                            _push3(ssrRenderComponent(_component_NuxtLink, {
                              key: child.path,
                              to: child.path,
                              class: ["sidebar-child", { "sidebar-child--active": isActive(child.path) }]
                            }, {
                              default: withCtx((_3, _push4, _parent4, _scopeId3) => {
                                if (_push4) {
                                  _push4(ssrRenderComponent(VIcon, {
                                    size: "18",
                                    class: "sidebar-child__icon"
                                  }, {
                                    default: withCtx((_4, _push5, _parent5, _scopeId4) => {
                                      if (_push5) {
                                        _push5(`${ssrInterpolate(child.icon)}`);
                                      } else {
                                        return [
                                          createTextVNode(toDisplayString(child.icon), 1)
                                        ];
                                      }
                                    }),
                                    _: 2
                                  }, _parent4, _scopeId3));
                                  _push4(`<span class="sidebar-child__label" data-v-36979901${_scopeId3}>${ssrInterpolate(child.label)}</span>`);
                                } else {
                                  return [
                                    createVNode(VIcon, {
                                      size: "18",
                                      class: "sidebar-child__icon"
                                    }, {
                                      default: withCtx(() => [
                                        createTextVNode(toDisplayString(child.icon), 1)
                                      ]),
                                      _: 2
                                    }, 1024),
                                    createVNode("span", { class: "sidebar-child__label" }, toDisplayString(child.label), 1)
                                  ];
                                }
                              }),
                              _: 2
                            }, _parent3, _scopeId2));
                          });
                          _push3(`<!--]--></div>`);
                        } else {
                          _push3(`<!---->`);
                        }
                        _push3(`</div>`);
                      } else {
                        _push3(ssrRenderComponent(_component_NuxtLink, {
                          to: item.path,
                          class: ["sidebar-item", { "sidebar-item--active": isActive(item.path) }]
                        }, {
                          default: withCtx((_3, _push4, _parent4, _scopeId3) => {
                            if (_push4) {
                              _push4(ssrRenderComponent(VIcon, {
                                size: "20",
                                class: "sidebar-item__icon"
                              }, {
                                default: withCtx((_4, _push5, _parent5, _scopeId4) => {
                                  if (_push5) {
                                    _push5(`${ssrInterpolate(item.icon)}`);
                                  } else {
                                    return [
                                      createTextVNode(toDisplayString(item.icon), 1)
                                    ];
                                  }
                                }),
                                _: 2
                              }, _parent4, _scopeId3));
                              if (!rail.value) {
                                _push4(`<span class="sidebar-item__label" data-v-36979901${_scopeId3}>${ssrInterpolate(item.label)}</span>`);
                              } else {
                                _push4(`<!---->`);
                              }
                            } else {
                              return [
                                createVNode(VIcon, {
                                  size: "20",
                                  class: "sidebar-item__icon"
                                }, {
                                  default: withCtx(() => [
                                    createTextVNode(toDisplayString(item.icon), 1)
                                  ]),
                                  _: 2
                                }, 1024),
                                !rail.value ? (openBlock(), createBlock("span", {
                                  key: 0,
                                  class: "sidebar-item__label"
                                }, toDisplayString(item.label), 1)) : createCommentVNode("", true)
                              ];
                            }
                          }),
                          _: 2
                        }, _parent3, _scopeId2));
                      }
                      _push3(`<!--]-->`);
                    });
                    _push3(`<!--]--></nav>`);
                  } else {
                    _push3(`<!---->`);
                  }
                  if (unref(auth).isManager) {
                    _push3(`<!--[-->`);
                    if (!rail.value) {
                      _push3(`<div class="sidebar-section-label" data-v-36979901${_scopeId2}>Administration</div>`);
                    } else {
                      _push3(`<!---->`);
                    }
                    _push3(`<nav class="sidebar-nav sidebar-nav--admin" data-v-36979901${_scopeId2}><!--[-->`);
                    ssrRenderList(adminItems.value, (item) => {
                      _push3(`<!--[-->`);
                      if (item.children) {
                        _push3(`<div class="sidebar-group" data-v-36979901${_scopeId2}><button class="${ssrRenderClass([{ "sidebar-item--active": isGroupActive(item), "sidebar-item--open": expandedGroups.value[item.label] }, "sidebar-item"])}" data-v-36979901${_scopeId2}>`);
                        _push3(ssrRenderComponent(VIcon, {
                          size: "20",
                          class: "sidebar-item__icon"
                        }, {
                          default: withCtx((_3, _push4, _parent4, _scopeId3) => {
                            if (_push4) {
                              _push4(`${ssrInterpolate(item.icon)}`);
                            } else {
                              return [
                                createTextVNode(toDisplayString(item.icon), 1)
                              ];
                            }
                          }),
                          _: 2
                        }, _parent3, _scopeId2));
                        if (!rail.value) {
                          _push3(`<span class="sidebar-item__label" data-v-36979901${_scopeId2}>${ssrInterpolate(item.label)}</span>`);
                        } else {
                          _push3(`<!---->`);
                        }
                        if (!rail.value) {
                          _push3(ssrRenderComponent(VIcon, {
                            size: "16",
                            class: "sidebar-item__chevron"
                          }, {
                            default: withCtx((_3, _push4, _parent4, _scopeId3) => {
                              if (_push4) {
                                _push4(`${ssrInterpolate(expandedGroups.value[item.label] ? "mdi-chevron-up" : "mdi-chevron-down")}`);
                              } else {
                                return [
                                  createTextVNode(toDisplayString(expandedGroups.value[item.label] ? "mdi-chevron-up" : "mdi-chevron-down"), 1)
                                ];
                              }
                            }),
                            _: 2
                          }, _parent3, _scopeId2));
                        } else {
                          _push3(`<!---->`);
                        }
                        _push3(`</button>`);
                        if (!rail.value && expandedGroups.value[item.label]) {
                          _push3(`<div class="sidebar-group__children" data-v-36979901${_scopeId2}><!--[-->`);
                          ssrRenderList(item.children, (child) => {
                            _push3(ssrRenderComponent(_component_NuxtLink, {
                              key: child.path,
                              to: child.path,
                              class: ["sidebar-child", { "sidebar-child--active": isActive(child.path) }]
                            }, {
                              default: withCtx((_3, _push4, _parent4, _scopeId3) => {
                                if (_push4) {
                                  _push4(ssrRenderComponent(VIcon, {
                                    size: "18",
                                    class: "sidebar-child__icon"
                                  }, {
                                    default: withCtx((_4, _push5, _parent5, _scopeId4) => {
                                      if (_push5) {
                                        _push5(`${ssrInterpolate(child.icon)}`);
                                      } else {
                                        return [
                                          createTextVNode(toDisplayString(child.icon), 1)
                                        ];
                                      }
                                    }),
                                    _: 2
                                  }, _parent4, _scopeId3));
                                  _push4(`<span class="sidebar-child__label" data-v-36979901${_scopeId3}>${ssrInterpolate(child.label)}</span>`);
                                } else {
                                  return [
                                    createVNode(VIcon, {
                                      size: "18",
                                      class: "sidebar-child__icon"
                                    }, {
                                      default: withCtx(() => [
                                        createTextVNode(toDisplayString(child.icon), 1)
                                      ]),
                                      _: 2
                                    }, 1024),
                                    createVNode("span", { class: "sidebar-child__label" }, toDisplayString(child.label), 1)
                                  ];
                                }
                              }),
                              _: 2
                            }, _parent3, _scopeId2));
                          });
                          _push3(`<!--]--></div>`);
                        } else {
                          _push3(`<!---->`);
                        }
                        _push3(`</div>`);
                      } else {
                        _push3(ssrRenderComponent(_component_NuxtLink, {
                          to: item.path,
                          class: ["sidebar-item", { "sidebar-item--active": isActive(item.path) }]
                        }, {
                          default: withCtx((_3, _push4, _parent4, _scopeId3) => {
                            if (_push4) {
                              _push4(ssrRenderComponent(VIcon, {
                                size: "20",
                                class: "sidebar-item__icon"
                              }, {
                                default: withCtx((_4, _push5, _parent5, _scopeId4) => {
                                  if (_push5) {
                                    _push5(`${ssrInterpolate(item.icon)}`);
                                  } else {
                                    return [
                                      createTextVNode(toDisplayString(item.icon), 1)
                                    ];
                                  }
                                }),
                                _: 2
                              }, _parent4, _scopeId3));
                              if (!rail.value) {
                                _push4(`<span class="sidebar-item__label" data-v-36979901${_scopeId3}>${ssrInterpolate(item.label)}</span>`);
                              } else {
                                _push4(`<!---->`);
                              }
                            } else {
                              return [
                                createVNode(VIcon, {
                                  size: "20",
                                  class: "sidebar-item__icon"
                                }, {
                                  default: withCtx(() => [
                                    createTextVNode(toDisplayString(item.icon), 1)
                                  ]),
                                  _: 2
                                }, 1024),
                                !rail.value ? (openBlock(), createBlock("span", {
                                  key: 0,
                                  class: "sidebar-item__label"
                                }, toDisplayString(item.label), 1)) : createCommentVNode("", true)
                              ];
                            }
                          }),
                          _: 2
                        }, _parent3, _scopeId2));
                      }
                      _push3(`<!--]-->`);
                    });
                    _push3(`<!--]--></nav><!--]-->`);
                  } else {
                    _push3(`<!---->`);
                  }
                  if (unref(auth).isSuperAdmin) {
                    _push3(`<!--[-->`);
                    if (!rail.value) {
                      _push3(`<div class="sidebar-section-label" data-v-36979901${_scopeId2}>Platform</div>`);
                    } else {
                      _push3(`<!---->`);
                    }
                    _push3(`<nav class="sidebar-nav sidebar-nav--admin" data-v-36979901${_scopeId2}><!--[-->`);
                    ssrRenderList(superadminItems.value, (item) => {
                      _push3(`<!--[-->`);
                      if (item.children) {
                        _push3(`<div class="sidebar-group" data-v-36979901${_scopeId2}><button class="${ssrRenderClass([{ "sidebar-item--active": isGroupActive(item), "sidebar-item--open": expandedGroups.value[item.label] }, "sidebar-item"])}" data-v-36979901${_scopeId2}>`);
                        _push3(ssrRenderComponent(VIcon, {
                          size: "20",
                          class: "sidebar-item__icon"
                        }, {
                          default: withCtx((_3, _push4, _parent4, _scopeId3) => {
                            if (_push4) {
                              _push4(`${ssrInterpolate(item.icon)}`);
                            } else {
                              return [
                                createTextVNode(toDisplayString(item.icon), 1)
                              ];
                            }
                          }),
                          _: 2
                        }, _parent3, _scopeId2));
                        if (!rail.value) {
                          _push3(`<span class="sidebar-item__label" data-v-36979901${_scopeId2}>${ssrInterpolate(item.label)}</span>`);
                        } else {
                          _push3(`<!---->`);
                        }
                        if (!rail.value) {
                          _push3(ssrRenderComponent(VIcon, {
                            size: "16",
                            class: "sidebar-item__chevron"
                          }, {
                            default: withCtx((_3, _push4, _parent4, _scopeId3) => {
                              if (_push4) {
                                _push4(`${ssrInterpolate(expandedGroups.value[item.label] ? "mdi-chevron-up" : "mdi-chevron-down")}`);
                              } else {
                                return [
                                  createTextVNode(toDisplayString(expandedGroups.value[item.label] ? "mdi-chevron-up" : "mdi-chevron-down"), 1)
                                ];
                              }
                            }),
                            _: 2
                          }, _parent3, _scopeId2));
                        } else {
                          _push3(`<!---->`);
                        }
                        _push3(`</button>`);
                        if (!rail.value && expandedGroups.value[item.label]) {
                          _push3(`<div class="sidebar-group__children" data-v-36979901${_scopeId2}><!--[-->`);
                          ssrRenderList(item.children, (child) => {
                            _push3(ssrRenderComponent(_component_NuxtLink, {
                              key: child.path,
                              to: child.path,
                              class: ["sidebar-child", { "sidebar-child--active": isActive(child.path) }]
                            }, {
                              default: withCtx((_3, _push4, _parent4, _scopeId3) => {
                                if (_push4) {
                                  _push4(ssrRenderComponent(VIcon, {
                                    size: "18",
                                    class: "sidebar-child__icon"
                                  }, {
                                    default: withCtx((_4, _push5, _parent5, _scopeId4) => {
                                      if (_push5) {
                                        _push5(`${ssrInterpolate(child.icon)}`);
                                      } else {
                                        return [
                                          createTextVNode(toDisplayString(child.icon), 1)
                                        ];
                                      }
                                    }),
                                    _: 2
                                  }, _parent4, _scopeId3));
                                  _push4(`<span class="sidebar-child__label" data-v-36979901${_scopeId3}>${ssrInterpolate(child.label)}</span>`);
                                } else {
                                  return [
                                    createVNode(VIcon, {
                                      size: "18",
                                      class: "sidebar-child__icon"
                                    }, {
                                      default: withCtx(() => [
                                        createTextVNode(toDisplayString(child.icon), 1)
                                      ]),
                                      _: 2
                                    }, 1024),
                                    createVNode("span", { class: "sidebar-child__label" }, toDisplayString(child.label), 1)
                                  ];
                                }
                              }),
                              _: 2
                            }, _parent3, _scopeId2));
                          });
                          _push3(`<!--]--></div>`);
                        } else {
                          _push3(`<!---->`);
                        }
                        _push3(`</div>`);
                      } else {
                        _push3(ssrRenderComponent(_component_NuxtLink, {
                          to: item.path,
                          class: ["sidebar-item", { "sidebar-item--active": isActive(item.path) }]
                        }, {
                          default: withCtx((_3, _push4, _parent4, _scopeId3) => {
                            if (_push4) {
                              _push4(ssrRenderComponent(VIcon, {
                                size: "20",
                                class: "sidebar-item__icon"
                              }, {
                                default: withCtx((_4, _push5, _parent5, _scopeId4) => {
                                  if (_push5) {
                                    _push5(`${ssrInterpolate(item.icon)}`);
                                  } else {
                                    return [
                                      createTextVNode(toDisplayString(item.icon), 1)
                                    ];
                                  }
                                }),
                                _: 2
                              }, _parent4, _scopeId3));
                              if (!rail.value) {
                                _push4(`<span class="sidebar-item__label" data-v-36979901${_scopeId3}>${ssrInterpolate(item.label)}</span>`);
                              } else {
                                _push4(`<!---->`);
                              }
                            } else {
                              return [
                                createVNode(VIcon, {
                                  size: "20",
                                  class: "sidebar-item__icon"
                                }, {
                                  default: withCtx(() => [
                                    createTextVNode(toDisplayString(item.icon), 1)
                                  ]),
                                  _: 2
                                }, 1024),
                                !rail.value ? (openBlock(), createBlock("span", {
                                  key: 0,
                                  class: "sidebar-item__label"
                                }, toDisplayString(item.label), 1)) : createCommentVNode("", true)
                              ];
                            }
                          }),
                          _: 2
                        }, _parent3, _scopeId2));
                      }
                      _push3(`<!--]-->`);
                    });
                    _push3(`<!--]--></nav><!--]-->`);
                  } else {
                    _push3(`<!---->`);
                  }
                } else {
                  return [
                    createVNode("div", { class: "sidebar-logo" }, [
                      createVNode("div", { class: "sidebar-logo__icon" }, [
                        tenantLogoUrl.value ? (openBlock(), createBlock("img", {
                          key: 0,
                          src: tenantLogoUrl.value,
                          alt: "Logo",
                          class: "sidebar-logo__img"
                        }, null, 8, ["src"])) : (openBlock(), createBlock(VIcon, {
                          key: 1,
                          size: "22",
                          color: "white"
                        }, {
                          default: withCtx(() => [
                            createTextVNode("mdi-monitor")
                          ]),
                          _: 1
                        }))
                      ]),
                      !rail.value ? (openBlock(), createBlock("div", {
                        key: 0,
                        class: "sidebar-logo__text"
                      }, [
                        createVNode("span", { class: "sidebar-logo__title" }, toDisplayString(unref(auth).isSuperAdmin ? "DomendraPOS" : unref(auth).tenantName || "DomendraPOS"), 1),
                        createVNode("p", { class: "sidebar-logo__sub" }, toDisplayString(unref(auth).isSuperAdmin ? "Platform Admin" : "Point of Sale"), 1)
                      ])) : createCommentVNode("", true)
                    ]),
                    !unref(auth).isSuperAdmin ? (openBlock(), createBlock("nav", {
                      key: 0,
                      class: "sidebar-nav"
                    }, [
                      (openBlock(true), createBlock(Fragment, null, renderList(navItems.value, (item) => {
                        return openBlock(), createBlock(Fragment, {
                          key: item.path || item.label
                        }, [
                          item.children ? (openBlock(), createBlock("div", {
                            key: 0,
                            class: "sidebar-group"
                          }, [
                            createVNode("button", {
                              class: ["sidebar-item", { "sidebar-item--active": isGroupActive(item), "sidebar-item--open": expandedGroups.value[item.label] }],
                              onClick: ($event) => toggleGroup(item.label)
                            }, [
                              createVNode(VIcon, {
                                size: "20",
                                class: "sidebar-item__icon"
                              }, {
                                default: withCtx(() => [
                                  createTextVNode(toDisplayString(item.icon), 1)
                                ]),
                                _: 2
                              }, 1024),
                              !rail.value ? (openBlock(), createBlock("span", {
                                key: 0,
                                class: "sidebar-item__label"
                              }, toDisplayString(item.label), 1)) : createCommentVNode("", true),
                              !rail.value ? (openBlock(), createBlock(VIcon, {
                                key: 1,
                                size: "16",
                                class: "sidebar-item__chevron"
                              }, {
                                default: withCtx(() => [
                                  createTextVNode(toDisplayString(expandedGroups.value[item.label] ? "mdi-chevron-up" : "mdi-chevron-down"), 1)
                                ]),
                                _: 2
                              }, 1024)) : createCommentVNode("", true)
                            ], 10, ["onClick"]),
                            !rail.value && expandedGroups.value[item.label] ? (openBlock(), createBlock("div", {
                              key: 0,
                              class: "sidebar-group__children"
                            }, [
                              (openBlock(true), createBlock(Fragment, null, renderList(item.children, (child) => {
                                return openBlock(), createBlock(_component_NuxtLink, {
                                  key: child.path,
                                  to: child.path,
                                  class: ["sidebar-child", { "sidebar-child--active": isActive(child.path) }]
                                }, {
                                  default: withCtx(() => [
                                    createVNode(VIcon, {
                                      size: "18",
                                      class: "sidebar-child__icon"
                                    }, {
                                      default: withCtx(() => [
                                        createTextVNode(toDisplayString(child.icon), 1)
                                      ]),
                                      _: 2
                                    }, 1024),
                                    createVNode("span", { class: "sidebar-child__label" }, toDisplayString(child.label), 1)
                                  ]),
                                  _: 2
                                }, 1032, ["to", "class"]);
                              }), 128))
                            ])) : createCommentVNode("", true)
                          ])) : (openBlock(), createBlock(_component_NuxtLink, {
                            key: 1,
                            to: item.path,
                            class: ["sidebar-item", { "sidebar-item--active": isActive(item.path) }]
                          }, {
                            default: withCtx(() => [
                              createVNode(VIcon, {
                                size: "20",
                                class: "sidebar-item__icon"
                              }, {
                                default: withCtx(() => [
                                  createTextVNode(toDisplayString(item.icon), 1)
                                ]),
                                _: 2
                              }, 1024),
                              !rail.value ? (openBlock(), createBlock("span", {
                                key: 0,
                                class: "sidebar-item__label"
                              }, toDisplayString(item.label), 1)) : createCommentVNode("", true)
                            ]),
                            _: 2
                          }, 1032, ["to", "class"]))
                        ], 64);
                      }), 128))
                    ])) : createCommentVNode("", true),
                    unref(auth).isManager ? (openBlock(), createBlock(Fragment, { key: 1 }, [
                      !rail.value ? (openBlock(), createBlock("div", {
                        key: 0,
                        class: "sidebar-section-label"
                      }, "Administration")) : createCommentVNode("", true),
                      createVNode("nav", { class: "sidebar-nav sidebar-nav--admin" }, [
                        (openBlock(true), createBlock(Fragment, null, renderList(adminItems.value, (item) => {
                          return openBlock(), createBlock(Fragment, {
                            key: item.path || item.label
                          }, [
                            item.children ? (openBlock(), createBlock("div", {
                              key: 0,
                              class: "sidebar-group"
                            }, [
                              createVNode("button", {
                                class: ["sidebar-item", { "sidebar-item--active": isGroupActive(item), "sidebar-item--open": expandedGroups.value[item.label] }],
                                onClick: ($event) => toggleGroup(item.label)
                              }, [
                                createVNode(VIcon, {
                                  size: "20",
                                  class: "sidebar-item__icon"
                                }, {
                                  default: withCtx(() => [
                                    createTextVNode(toDisplayString(item.icon), 1)
                                  ]),
                                  _: 2
                                }, 1024),
                                !rail.value ? (openBlock(), createBlock("span", {
                                  key: 0,
                                  class: "sidebar-item__label"
                                }, toDisplayString(item.label), 1)) : createCommentVNode("", true),
                                !rail.value ? (openBlock(), createBlock(VIcon, {
                                  key: 1,
                                  size: "16",
                                  class: "sidebar-item__chevron"
                                }, {
                                  default: withCtx(() => [
                                    createTextVNode(toDisplayString(expandedGroups.value[item.label] ? "mdi-chevron-up" : "mdi-chevron-down"), 1)
                                  ]),
                                  _: 2
                                }, 1024)) : createCommentVNode("", true)
                              ], 10, ["onClick"]),
                              !rail.value && expandedGroups.value[item.label] ? (openBlock(), createBlock("div", {
                                key: 0,
                                class: "sidebar-group__children"
                              }, [
                                (openBlock(true), createBlock(Fragment, null, renderList(item.children, (child) => {
                                  return openBlock(), createBlock(_component_NuxtLink, {
                                    key: child.path,
                                    to: child.path,
                                    class: ["sidebar-child", { "sidebar-child--active": isActive(child.path) }]
                                  }, {
                                    default: withCtx(() => [
                                      createVNode(VIcon, {
                                        size: "18",
                                        class: "sidebar-child__icon"
                                      }, {
                                        default: withCtx(() => [
                                          createTextVNode(toDisplayString(child.icon), 1)
                                        ]),
                                        _: 2
                                      }, 1024),
                                      createVNode("span", { class: "sidebar-child__label" }, toDisplayString(child.label), 1)
                                    ]),
                                    _: 2
                                  }, 1032, ["to", "class"]);
                                }), 128))
                              ])) : createCommentVNode("", true)
                            ])) : (openBlock(), createBlock(_component_NuxtLink, {
                              key: 1,
                              to: item.path,
                              class: ["sidebar-item", { "sidebar-item--active": isActive(item.path) }]
                            }, {
                              default: withCtx(() => [
                                createVNode(VIcon, {
                                  size: "20",
                                  class: "sidebar-item__icon"
                                }, {
                                  default: withCtx(() => [
                                    createTextVNode(toDisplayString(item.icon), 1)
                                  ]),
                                  _: 2
                                }, 1024),
                                !rail.value ? (openBlock(), createBlock("span", {
                                  key: 0,
                                  class: "sidebar-item__label"
                                }, toDisplayString(item.label), 1)) : createCommentVNode("", true)
                              ]),
                              _: 2
                            }, 1032, ["to", "class"]))
                          ], 64);
                        }), 128))
                      ])
                    ], 64)) : createCommentVNode("", true),
                    unref(auth).isSuperAdmin ? (openBlock(), createBlock(Fragment, { key: 2 }, [
                      !rail.value ? (openBlock(), createBlock("div", {
                        key: 0,
                        class: "sidebar-section-label"
                      }, "Platform")) : createCommentVNode("", true),
                      createVNode("nav", { class: "sidebar-nav sidebar-nav--admin" }, [
                        (openBlock(true), createBlock(Fragment, null, renderList(superadminItems.value, (item) => {
                          return openBlock(), createBlock(Fragment, {
                            key: item.path || item.label
                          }, [
                            item.children ? (openBlock(), createBlock("div", {
                              key: 0,
                              class: "sidebar-group"
                            }, [
                              createVNode("button", {
                                class: ["sidebar-item", { "sidebar-item--active": isGroupActive(item), "sidebar-item--open": expandedGroups.value[item.label] }],
                                onClick: ($event) => toggleGroup(item.label)
                              }, [
                                createVNode(VIcon, {
                                  size: "20",
                                  class: "sidebar-item__icon"
                                }, {
                                  default: withCtx(() => [
                                    createTextVNode(toDisplayString(item.icon), 1)
                                  ]),
                                  _: 2
                                }, 1024),
                                !rail.value ? (openBlock(), createBlock("span", {
                                  key: 0,
                                  class: "sidebar-item__label"
                                }, toDisplayString(item.label), 1)) : createCommentVNode("", true),
                                !rail.value ? (openBlock(), createBlock(VIcon, {
                                  key: 1,
                                  size: "16",
                                  class: "sidebar-item__chevron"
                                }, {
                                  default: withCtx(() => [
                                    createTextVNode(toDisplayString(expandedGroups.value[item.label] ? "mdi-chevron-up" : "mdi-chevron-down"), 1)
                                  ]),
                                  _: 2
                                }, 1024)) : createCommentVNode("", true)
                              ], 10, ["onClick"]),
                              !rail.value && expandedGroups.value[item.label] ? (openBlock(), createBlock("div", {
                                key: 0,
                                class: "sidebar-group__children"
                              }, [
                                (openBlock(true), createBlock(Fragment, null, renderList(item.children, (child) => {
                                  return openBlock(), createBlock(_component_NuxtLink, {
                                    key: child.path,
                                    to: child.path,
                                    class: ["sidebar-child", { "sidebar-child--active": isActive(child.path) }]
                                  }, {
                                    default: withCtx(() => [
                                      createVNode(VIcon, {
                                        size: "18",
                                        class: "sidebar-child__icon"
                                      }, {
                                        default: withCtx(() => [
                                          createTextVNode(toDisplayString(child.icon), 1)
                                        ]),
                                        _: 2
                                      }, 1024),
                                      createVNode("span", { class: "sidebar-child__label" }, toDisplayString(child.label), 1)
                                    ]),
                                    _: 2
                                  }, 1032, ["to", "class"]);
                                }), 128))
                              ])) : createCommentVNode("", true)
                            ])) : (openBlock(), createBlock(_component_NuxtLink, {
                              key: 1,
                              to: item.path,
                              class: ["sidebar-item", { "sidebar-item--active": isActive(item.path) }]
                            }, {
                              default: withCtx(() => [
                                createVNode(VIcon, {
                                  size: "20",
                                  class: "sidebar-item__icon"
                                }, {
                                  default: withCtx(() => [
                                    createTextVNode(toDisplayString(item.icon), 1)
                                  ]),
                                  _: 2
                                }, 1024),
                                !rail.value ? (openBlock(), createBlock("span", {
                                  key: 0,
                                  class: "sidebar-item__label"
                                }, toDisplayString(item.label), 1)) : createCommentVNode("", true)
                              ]),
                              _: 2
                            }, 1032, ["to", "class"]))
                          ], 64);
                        }), 128))
                      ])
                    ], 64)) : createCommentVNode("", true)
                  ];
                }
              }),
              _: 1
            }, _parent2, _scopeId));
            _push2(ssrRenderComponent(VAppBar, {
              flat: "",
              border: "b",
              height: "64"
            }, {
              default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                if (_push3) {
                  _push3(ssrRenderComponent(VAppBarNavIcon, {
                    variant: "text",
                    onClick: ($event) => rail.value = !rail.value,
                    class: "d-none d-md-flex"
                  }, null, _parent3, _scopeId2));
                  _push3(ssrRenderComponent(VAppBarNavIcon, {
                    variant: "text",
                    onClick: ($event) => drawer.value = !drawer.value,
                    class: "d-flex d-md-none"
                  }, null, _parent3, _scopeId2));
                  if (sessionDuration.value) {
                    _push3(`<div class="nav-brand-clock" data-v-36979901${_scopeId2}><div class="nav-brand-clock__session" data-v-36979901${_scopeId2}>`);
                    _push3(ssrRenderComponent(VIcon, { size: "12" }, {
                      default: withCtx((_3, _push4, _parent4, _scopeId3) => {
                        if (_push4) {
                          _push4(`mdi-timer-outline`);
                        } else {
                          return [
                            createTextVNode("mdi-timer-outline")
                          ];
                        }
                      }),
                      _: 1
                    }, _parent3, _scopeId2));
                    _push3(`<span class="nav-brand-clock__session-label" data-v-36979901${_scopeId2}>Session</span><span class="nav-brand-clock__session-value" data-v-36979901${_scopeId2}>${ssrInterpolate(sessionDuration.value)}</span></div></div>`);
                  } else {
                    _push3(`<!---->`);
                  }
                  _push3(ssrRenderComponent(VSpacer, null, null, _parent3, _scopeId2));
                  if (!unref(auth).isSuperAdmin) {
                    _push3(ssrRenderComponent(_component_BranchSelector, { class: "mr-2 d-none d-sm-flex" }, null, _parent3, _scopeId2));
                  } else {
                    _push3(`<!---->`);
                  }
                  if (!unref(auth).isSuperAdmin) {
                    _push3(`<div class="nav-today" data-v-36979901${_scopeId2}><span class="nav-today__label" data-v-36979901${_scopeId2}>TODAY</span>`);
                    if (todayKpis.value.txCount > 0) {
                      _push3(`<div class="nav-today__live" data-v-36979901${_scopeId2}><span class="nav-today__live-dot" data-v-36979901${_scopeId2}></span><span class="nav-today__live-text" data-v-36979901${_scopeId2}>LIVE</span></div>`);
                    } else {
                      _push3(`<!---->`);
                    }
                    _push3(`<div class="nav-clock" data-v-36979901${_scopeId2}><span class="nav-clock__digit" data-v-36979901${_scopeId2}>${ssrInterpolate(clockDigits.value.h1)}</span><span class="nav-clock__digit" data-v-36979901${_scopeId2}>${ssrInterpolate(clockDigits.value.h2)}</span><span class="${ssrRenderClass([{ "nav-clock__colon--blink": clockColon.value }, "nav-clock__colon"])}" data-v-36979901${_scopeId2}>:</span><span class="nav-clock__digit" data-v-36979901${_scopeId2}>${ssrInterpolate(clockDigits.value.m1)}</span><span class="nav-clock__digit" data-v-36979901${_scopeId2}>${ssrInterpolate(clockDigits.value.m2)}</span><span class="${ssrRenderClass([{ "nav-clock__colon--blink": clockColon.value }, "nav-clock__colon"])}" data-v-36979901${_scopeId2}>:</span><span class="nav-clock__digit" data-v-36979901${_scopeId2}>${ssrInterpolate(clockDigits.value.s1)}</span><span class="nav-clock__digit" data-v-36979901${_scopeId2}>${ssrInterpolate(clockDigits.value.s2)}</span></div>`);
                    if (storeOpen.value) {
                      _push3(`<div class="nav-countdown" data-v-36979901${_scopeId2}>`);
                      _push3(ssrRenderComponent(VIcon, {
                        size: "13",
                        color: "primary"
                      }, {
                        default: withCtx((_3, _push4, _parent4, _scopeId3) => {
                          if (_push4) {
                            _push4(`mdi-store-clock-outline`);
                          } else {
                            return [
                              createTextVNode("mdi-store-clock-outline")
                            ];
                          }
                        }),
                        _: 1
                      }, _parent3, _scopeId2));
                      _push3(`<span class="nav-countdown__value" data-v-36979901${_scopeId2}>${ssrInterpolate(countdown.value)}</span></div>`);
                    } else {
                      _push3(`<div class="nav-countdown nav-countdown--closed" data-v-36979901${_scopeId2}>`);
                      _push3(ssrRenderComponent(VIcon, {
                        size: "13",
                        color: "error"
                      }, {
                        default: withCtx((_3, _push4, _parent4, _scopeId3) => {
                          if (_push4) {
                            _push4(`mdi-store-off-outline`);
                          } else {
                            return [
                              createTextVNode("mdi-store-off-outline")
                            ];
                          }
                        }),
                        _: 1
                      }, _parent3, _scopeId2));
                      _push3(`<span class="nav-countdown__value" data-v-36979901${_scopeId2}>Closed</span></div>`);
                    }
                    _push3(`<div class="nav-today__stats" data-v-36979901${_scopeId2}><div class="nav-today__stat" data-v-36979901${_scopeId2}><span class="nav-today__stat-label" data-v-36979901${_scopeId2}>Revenue</span><span class="nav-today__stat-value text-success" data-v-36979901${_scopeId2}>${ssrInterpolate(formatMoney(todayKpis.value.revenue))}</span></div><div class="nav-today__sep" data-v-36979901${_scopeId2}></div><div class="nav-today__stat" data-v-36979901${_scopeId2}><span class="nav-today__stat-label" data-v-36979901${_scopeId2}>Txns</span><span class="nav-today__stat-value" data-v-36979901${_scopeId2}>${ssrInterpolate(todayKpis.value.txCount)}</span></div></div></div>`);
                  } else {
                    _push3(`<!---->`);
                  }
                  _push3(ssrRenderComponent(VBtn, {
                    class: "fullscreen-toggle",
                    icon: unref(isFullscreen) ? "mdi-fullscreen-exit" : "mdi-fullscreen",
                    variant: "text",
                    onClick: ($event) => unref(toggleFullscreen)(),
                    title: unref(isFullscreen) ? "Exit fullscreen" : "Enter fullscreen",
                    "aria-label": "Toggle fullscreen"
                  }, null, _parent3, _scopeId2));
                  _push3(ssrRenderComponent(VBtn, {
                    icon: unref(theme).isDark.value ? "mdi-white-balance-sunny" : "mdi-moon-waning-crescent",
                    variant: "text",
                    onClick: ($event) => unref(theme).toggle(),
                    title: unref(theme).isDark.value ? "Switch to light mode" : "Switch to dark mode",
                    "aria-label": "Toggle dark mode"
                  }, null, _parent3, _scopeId2));
                  _push3(ssrRenderComponent(VMenu, {
                    location: "bottom end",
                    offset: "8",
                    "min-width": "220"
                  }, {
                    activator: withCtx(({ props: menuProps }, _push4, _parent4, _scopeId3) => {
                      if (_push4) {
                        _push4(ssrRenderComponent(VBtn, mergeProps(menuProps, {
                          variant: "text",
                          rounded: "lg",
                          class: "px-1"
                        }), {
                          default: withCtx((_3, _push5, _parent5, _scopeId4) => {
                            if (_push5) {
                              _push5(ssrRenderComponent(VAvatar, {
                                color: "primary",
                                size: "32",
                                class: "mr-1"
                              }, {
                                default: withCtx((_4, _push6, _parent6, _scopeId5) => {
                                  if (_push6) {
                                    _push6(`<span class="text-white font-weight-bold text-body-2" data-v-36979901${_scopeId5}>${ssrInterpolate(initials.value)}</span>`);
                                  } else {
                                    return [
                                      createVNode("span", { class: "text-white font-weight-bold text-body-2" }, toDisplayString(initials.value), 1)
                                    ];
                                  }
                                }),
                                _: 2
                              }, _parent5, _scopeId4));
                              _push5(ssrRenderComponent(VIcon, { size: "18" }, {
                                default: withCtx((_4, _push6, _parent6, _scopeId5) => {
                                  if (_push6) {
                                    _push6(`mdi-chevron-down`);
                                  } else {
                                    return [
                                      createTextVNode("mdi-chevron-down")
                                    ];
                                  }
                                }),
                                _: 2
                              }, _parent5, _scopeId4));
                            } else {
                              return [
                                createVNode(VAvatar, {
                                  color: "primary",
                                  size: "32",
                                  class: "mr-1"
                                }, {
                                  default: withCtx(() => [
                                    createVNode("span", { class: "text-white font-weight-bold text-body-2" }, toDisplayString(initials.value), 1)
                                  ]),
                                  _: 1
                                }),
                                createVNode(VIcon, { size: "18" }, {
                                  default: withCtx(() => [
                                    createTextVNode("mdi-chevron-down")
                                  ]),
                                  _: 1
                                })
                              ];
                            }
                          }),
                          _: 2
                        }, _parent4, _scopeId3));
                      } else {
                        return [
                          createVNode(VBtn, mergeProps(menuProps, {
                            variant: "text",
                            rounded: "lg",
                            class: "px-1"
                          }), {
                            default: withCtx(() => [
                              createVNode(VAvatar, {
                                color: "primary",
                                size: "32",
                                class: "mr-1"
                              }, {
                                default: withCtx(() => [
                                  createVNode("span", { class: "text-white font-weight-bold text-body-2" }, toDisplayString(initials.value), 1)
                                ]),
                                _: 1
                              }),
                              createVNode(VIcon, { size: "18" }, {
                                default: withCtx(() => [
                                  createTextVNode("mdi-chevron-down")
                                ]),
                                _: 1
                              })
                            ]),
                            _: 1
                          }, 16)
                        ];
                      }
                    }),
                    default: withCtx((_3, _push4, _parent4, _scopeId3) => {
                      if (_push4) {
                        _push4(ssrRenderComponent(VList, {
                          density: "comfortable",
                          nav: "",
                          "min-width": "220"
                        }, {
                          default: withCtx((_4, _push5, _parent5, _scopeId4) => {
                            var _a, _b;
                            if (_push5) {
                              _push5(`<div class="px-4 py-2" data-v-36979901${_scopeId4}><p class="text-body-2 font-weight-bold" data-v-36979901${_scopeId4}>${ssrInterpolate(unref(auth).fullName)}</p><p class="text-caption text-medium-emphasis" data-v-36979901${_scopeId4}>${ssrInterpolate((_a = unref(auth).user) == null ? void 0 : _a.email)}</p></div>`);
                              _push5(ssrRenderComponent(VDivider, null, null, _parent5, _scopeId4));
                              _push5(ssrRenderComponent(VListItem, {
                                to: "/settings/profile",
                                "prepend-icon": "mdi-account-circle-outline",
                                title: "Profile Settings"
                              }, null, _parent5, _scopeId4));
                              _push5(ssrRenderComponent(VListItem, {
                                "prepend-icon": "mdi-logout",
                                title: "Sign out",
                                "base-color": "error",
                                onClick: ($event) => unref(auth).logout()
                              }, null, _parent5, _scopeId4));
                            } else {
                              return [
                                createVNode("div", { class: "px-4 py-2" }, [
                                  createVNode("p", { class: "text-body-2 font-weight-bold" }, toDisplayString(unref(auth).fullName), 1),
                                  createVNode("p", { class: "text-caption text-medium-emphasis" }, toDisplayString((_b = unref(auth).user) == null ? void 0 : _b.email), 1)
                                ]),
                                createVNode(VDivider),
                                createVNode(VListItem, {
                                  to: "/settings/profile",
                                  "prepend-icon": "mdi-account-circle-outline",
                                  title: "Profile Settings"
                                }),
                                createVNode(VListItem, {
                                  "prepend-icon": "mdi-logout",
                                  title: "Sign out",
                                  "base-color": "error",
                                  onClick: ($event) => unref(auth).logout()
                                }, null, 8, ["onClick"])
                              ];
                            }
                          }),
                          _: 1
                        }, _parent4, _scopeId3));
                      } else {
                        return [
                          createVNode(VList, {
                            density: "comfortable",
                            nav: "",
                            "min-width": "220"
                          }, {
                            default: withCtx(() => {
                              var _a;
                              return [
                                createVNode("div", { class: "px-4 py-2" }, [
                                  createVNode("p", { class: "text-body-2 font-weight-bold" }, toDisplayString(unref(auth).fullName), 1),
                                  createVNode("p", { class: "text-caption text-medium-emphasis" }, toDisplayString((_a = unref(auth).user) == null ? void 0 : _a.email), 1)
                                ]),
                                createVNode(VDivider),
                                createVNode(VListItem, {
                                  to: "/settings/profile",
                                  "prepend-icon": "mdi-account-circle-outline",
                                  title: "Profile Settings"
                                }),
                                createVNode(VListItem, {
                                  "prepend-icon": "mdi-logout",
                                  title: "Sign out",
                                  "base-color": "error",
                                  onClick: ($event) => unref(auth).logout()
                                }, null, 8, ["onClick"])
                              ];
                            }),
                            _: 1
                          })
                        ];
                      }
                    }),
                    _: 1
                  }, _parent3, _scopeId2));
                } else {
                  return [
                    createVNode(VAppBarNavIcon, {
                      variant: "text",
                      onClick: withModifiers(($event) => rail.value = !rail.value, ["stop"]),
                      class: "d-none d-md-flex"
                    }, null, 8, ["onClick"]),
                    createVNode(VAppBarNavIcon, {
                      variant: "text",
                      onClick: withModifiers(($event) => drawer.value = !drawer.value, ["stop"]),
                      class: "d-flex d-md-none"
                    }, null, 8, ["onClick"]),
                    sessionDuration.value ? (openBlock(), createBlock("div", {
                      key: 0,
                      class: "nav-brand-clock"
                    }, [
                      createVNode("div", { class: "nav-brand-clock__session" }, [
                        createVNode(VIcon, { size: "12" }, {
                          default: withCtx(() => [
                            createTextVNode("mdi-timer-outline")
                          ]),
                          _: 1
                        }),
                        createVNode("span", { class: "nav-brand-clock__session-label" }, "Session"),
                        createVNode("span", { class: "nav-brand-clock__session-value" }, toDisplayString(sessionDuration.value), 1)
                      ])
                    ])) : createCommentVNode("", true),
                    createVNode(VSpacer),
                    !unref(auth).isSuperAdmin ? (openBlock(), createBlock(_component_BranchSelector, {
                      key: 1,
                      class: "mr-2 d-none d-sm-flex"
                    })) : createCommentVNode("", true),
                    !unref(auth).isSuperAdmin ? (openBlock(), createBlock("div", {
                      key: 2,
                      class: "nav-today"
                    }, [
                      createVNode("span", { class: "nav-today__label" }, "TODAY"),
                      todayKpis.value.txCount > 0 ? (openBlock(), createBlock("div", {
                        key: 0,
                        class: "nav-today__live"
                      }, [
                        createVNode("span", { class: "nav-today__live-dot" }),
                        createVNode("span", { class: "nav-today__live-text" }, "LIVE")
                      ])) : createCommentVNode("", true),
                      createVNode("div", { class: "nav-clock" }, [
                        createVNode("span", { class: "nav-clock__digit" }, toDisplayString(clockDigits.value.h1), 1),
                        createVNode("span", { class: "nav-clock__digit" }, toDisplayString(clockDigits.value.h2), 1),
                        createVNode("span", {
                          class: ["nav-clock__colon", { "nav-clock__colon--blink": clockColon.value }]
                        }, ":", 2),
                        createVNode("span", { class: "nav-clock__digit" }, toDisplayString(clockDigits.value.m1), 1),
                        createVNode("span", { class: "nav-clock__digit" }, toDisplayString(clockDigits.value.m2), 1),
                        createVNode("span", {
                          class: ["nav-clock__colon", { "nav-clock__colon--blink": clockColon.value }]
                        }, ":", 2),
                        createVNode("span", { class: "nav-clock__digit" }, toDisplayString(clockDigits.value.s1), 1),
                        createVNode("span", { class: "nav-clock__digit" }, toDisplayString(clockDigits.value.s2), 1)
                      ]),
                      storeOpen.value ? (openBlock(), createBlock("div", {
                        key: 1,
                        class: "nav-countdown"
                      }, [
                        createVNode(VIcon, {
                          size: "13",
                          color: "primary"
                        }, {
                          default: withCtx(() => [
                            createTextVNode("mdi-store-clock-outline")
                          ]),
                          _: 1
                        }),
                        createVNode("span", { class: "nav-countdown__value" }, toDisplayString(countdown.value), 1)
                      ])) : (openBlock(), createBlock("div", {
                        key: 2,
                        class: "nav-countdown nav-countdown--closed"
                      }, [
                        createVNode(VIcon, {
                          size: "13",
                          color: "error"
                        }, {
                          default: withCtx(() => [
                            createTextVNode("mdi-store-off-outline")
                          ]),
                          _: 1
                        }),
                        createVNode("span", { class: "nav-countdown__value" }, "Closed")
                      ])),
                      createVNode("div", { class: "nav-today__stats" }, [
                        createVNode("div", { class: "nav-today__stat" }, [
                          createVNode("span", { class: "nav-today__stat-label" }, "Revenue"),
                          createVNode("span", { class: "nav-today__stat-value text-success" }, toDisplayString(formatMoney(todayKpis.value.revenue)), 1)
                        ]),
                        createVNode("div", { class: "nav-today__sep" }),
                        createVNode("div", { class: "nav-today__stat" }, [
                          createVNode("span", { class: "nav-today__stat-label" }, "Txns"),
                          createVNode("span", { class: "nav-today__stat-value" }, toDisplayString(todayKpis.value.txCount), 1)
                        ])
                      ])
                    ])) : createCommentVNode("", true),
                    createVNode(VBtn, {
                      class: "fullscreen-toggle",
                      icon: unref(isFullscreen) ? "mdi-fullscreen-exit" : "mdi-fullscreen",
                      variant: "text",
                      onClick: ($event) => unref(toggleFullscreen)(),
                      title: unref(isFullscreen) ? "Exit fullscreen" : "Enter fullscreen",
                      "aria-label": "Toggle fullscreen"
                    }, null, 8, ["icon", "onClick", "title"]),
                    createVNode(VBtn, {
                      icon: unref(theme).isDark.value ? "mdi-white-balance-sunny" : "mdi-moon-waning-crescent",
                      variant: "text",
                      onClick: ($event) => unref(theme).toggle(),
                      title: unref(theme).isDark.value ? "Switch to light mode" : "Switch to dark mode",
                      "aria-label": "Toggle dark mode"
                    }, null, 8, ["icon", "onClick", "title"]),
                    createVNode(VMenu, {
                      location: "bottom end",
                      offset: "8",
                      "min-width": "220"
                    }, {
                      activator: withCtx(({ props: menuProps }) => [
                        createVNode(VBtn, mergeProps(menuProps, {
                          variant: "text",
                          rounded: "lg",
                          class: "px-1"
                        }), {
                          default: withCtx(() => [
                            createVNode(VAvatar, {
                              color: "primary",
                              size: "32",
                              class: "mr-1"
                            }, {
                              default: withCtx(() => [
                                createVNode("span", { class: "text-white font-weight-bold text-body-2" }, toDisplayString(initials.value), 1)
                              ]),
                              _: 1
                            }),
                            createVNode(VIcon, { size: "18" }, {
                              default: withCtx(() => [
                                createTextVNode("mdi-chevron-down")
                              ]),
                              _: 1
                            })
                          ]),
                          _: 1
                        }, 16)
                      ]),
                      default: withCtx(() => [
                        createVNode(VList, {
                          density: "comfortable",
                          nav: "",
                          "min-width": "220"
                        }, {
                          default: withCtx(() => {
                            var _a;
                            return [
                              createVNode("div", { class: "px-4 py-2" }, [
                                createVNode("p", { class: "text-body-2 font-weight-bold" }, toDisplayString(unref(auth).fullName), 1),
                                createVNode("p", { class: "text-caption text-medium-emphasis" }, toDisplayString((_a = unref(auth).user) == null ? void 0 : _a.email), 1)
                              ]),
                              createVNode(VDivider),
                              createVNode(VListItem, {
                                to: "/settings/profile",
                                "prepend-icon": "mdi-account-circle-outline",
                                title: "Profile Settings"
                              }),
                              createVNode(VListItem, {
                                "prepend-icon": "mdi-logout",
                                title: "Sign out",
                                "base-color": "error",
                                onClick: ($event) => unref(auth).logout()
                              }, null, 8, ["onClick"])
                            ];
                          }),
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
            _push2(ssrRenderComponent(VMain, null, {
              default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                if (_push3) {
                  _push3(ssrRenderComponent(VContainer, {
                    fluid: "",
                    class: "px-4 px-md-6 pb-4 pb-md-6 pt-2",
                    style: { "max-width": "1600px" }
                  }, {
                    default: withCtx((_3, _push4, _parent4, _scopeId3) => {
                      if (_push4) {
                        ssrRenderSlot(_ctx.$slots, "default", {}, null, _push4, _parent4, _scopeId3);
                      } else {
                        return [
                          renderSlot(_ctx.$slots, "default", {}, void 0, true)
                        ];
                      }
                    }),
                    _: 3
                  }, _parent3, _scopeId2));
                } else {
                  return [
                    createVNode(VContainer, {
                      fluid: "",
                      class: "px-4 px-md-6 pb-4 pb-md-6 pt-2",
                      style: { "max-width": "1600px" }
                    }, {
                      default: withCtx(() => [
                        renderSlot(_ctx.$slots, "default", {}, void 0, true)
                      ]),
                      _: 3
                    })
                  ];
                }
              }),
              _: 3
            }, _parent2, _scopeId));
          } else {
            return [
              createVNode(VNavigationDrawer, {
                modelValue: drawer.value,
                "onUpdate:modelValue": ($event) => drawer.value = $event,
                rail: rail.value,
                "rail-width": "72",
                width: "260",
                permanent: "",
                app: "",
                class: "sidebar-drawer"
              }, {
                append: withCtx(() => [
                  createVNode("div", { class: "sidebar-rail-toggle" }, [
                    createVNode("button", {
                      class: "sidebar-item sidebar-item--rail",
                      onClick: ($event) => rail.value = !rail.value
                    }, [
                      createVNode(VIcon, {
                        size: "18",
                        class: "sidebar-item__icon"
                      }, {
                        default: withCtx(() => [
                          createTextVNode(toDisplayString(rail.value ? "mdi-chevron-double-right" : "mdi-chevron-double-left"), 1)
                        ]),
                        _: 1
                      }),
                      !rail.value ? (openBlock(), createBlock("span", {
                        key: 0,
                        class: "sidebar-item__label"
                      }, "Collapse")) : createCommentVNode("", true)
                    ], 8, ["onClick"])
                  ])
                ]),
                default: withCtx(() => [
                  createVNode("div", { class: "sidebar-logo" }, [
                    createVNode("div", { class: "sidebar-logo__icon" }, [
                      tenantLogoUrl.value ? (openBlock(), createBlock("img", {
                        key: 0,
                        src: tenantLogoUrl.value,
                        alt: "Logo",
                        class: "sidebar-logo__img"
                      }, null, 8, ["src"])) : (openBlock(), createBlock(VIcon, {
                        key: 1,
                        size: "22",
                        color: "white"
                      }, {
                        default: withCtx(() => [
                          createTextVNode("mdi-monitor")
                        ]),
                        _: 1
                      }))
                    ]),
                    !rail.value ? (openBlock(), createBlock("div", {
                      key: 0,
                      class: "sidebar-logo__text"
                    }, [
                      createVNode("span", { class: "sidebar-logo__title" }, toDisplayString(unref(auth).isSuperAdmin ? "DomendraPOS" : unref(auth).tenantName || "DomendraPOS"), 1),
                      createVNode("p", { class: "sidebar-logo__sub" }, toDisplayString(unref(auth).isSuperAdmin ? "Platform Admin" : "Point of Sale"), 1)
                    ])) : createCommentVNode("", true)
                  ]),
                  !unref(auth).isSuperAdmin ? (openBlock(), createBlock("nav", {
                    key: 0,
                    class: "sidebar-nav"
                  }, [
                    (openBlock(true), createBlock(Fragment, null, renderList(navItems.value, (item) => {
                      return openBlock(), createBlock(Fragment, {
                        key: item.path || item.label
                      }, [
                        item.children ? (openBlock(), createBlock("div", {
                          key: 0,
                          class: "sidebar-group"
                        }, [
                          createVNode("button", {
                            class: ["sidebar-item", { "sidebar-item--active": isGroupActive(item), "sidebar-item--open": expandedGroups.value[item.label] }],
                            onClick: ($event) => toggleGroup(item.label)
                          }, [
                            createVNode(VIcon, {
                              size: "20",
                              class: "sidebar-item__icon"
                            }, {
                              default: withCtx(() => [
                                createTextVNode(toDisplayString(item.icon), 1)
                              ]),
                              _: 2
                            }, 1024),
                            !rail.value ? (openBlock(), createBlock("span", {
                              key: 0,
                              class: "sidebar-item__label"
                            }, toDisplayString(item.label), 1)) : createCommentVNode("", true),
                            !rail.value ? (openBlock(), createBlock(VIcon, {
                              key: 1,
                              size: "16",
                              class: "sidebar-item__chevron"
                            }, {
                              default: withCtx(() => [
                                createTextVNode(toDisplayString(expandedGroups.value[item.label] ? "mdi-chevron-up" : "mdi-chevron-down"), 1)
                              ]),
                              _: 2
                            }, 1024)) : createCommentVNode("", true)
                          ], 10, ["onClick"]),
                          !rail.value && expandedGroups.value[item.label] ? (openBlock(), createBlock("div", {
                            key: 0,
                            class: "sidebar-group__children"
                          }, [
                            (openBlock(true), createBlock(Fragment, null, renderList(item.children, (child) => {
                              return openBlock(), createBlock(_component_NuxtLink, {
                                key: child.path,
                                to: child.path,
                                class: ["sidebar-child", { "sidebar-child--active": isActive(child.path) }]
                              }, {
                                default: withCtx(() => [
                                  createVNode(VIcon, {
                                    size: "18",
                                    class: "sidebar-child__icon"
                                  }, {
                                    default: withCtx(() => [
                                      createTextVNode(toDisplayString(child.icon), 1)
                                    ]),
                                    _: 2
                                  }, 1024),
                                  createVNode("span", { class: "sidebar-child__label" }, toDisplayString(child.label), 1)
                                ]),
                                _: 2
                              }, 1032, ["to", "class"]);
                            }), 128))
                          ])) : createCommentVNode("", true)
                        ])) : (openBlock(), createBlock(_component_NuxtLink, {
                          key: 1,
                          to: item.path,
                          class: ["sidebar-item", { "sidebar-item--active": isActive(item.path) }]
                        }, {
                          default: withCtx(() => [
                            createVNode(VIcon, {
                              size: "20",
                              class: "sidebar-item__icon"
                            }, {
                              default: withCtx(() => [
                                createTextVNode(toDisplayString(item.icon), 1)
                              ]),
                              _: 2
                            }, 1024),
                            !rail.value ? (openBlock(), createBlock("span", {
                              key: 0,
                              class: "sidebar-item__label"
                            }, toDisplayString(item.label), 1)) : createCommentVNode("", true)
                          ]),
                          _: 2
                        }, 1032, ["to", "class"]))
                      ], 64);
                    }), 128))
                  ])) : createCommentVNode("", true),
                  unref(auth).isManager ? (openBlock(), createBlock(Fragment, { key: 1 }, [
                    !rail.value ? (openBlock(), createBlock("div", {
                      key: 0,
                      class: "sidebar-section-label"
                    }, "Administration")) : createCommentVNode("", true),
                    createVNode("nav", { class: "sidebar-nav sidebar-nav--admin" }, [
                      (openBlock(true), createBlock(Fragment, null, renderList(adminItems.value, (item) => {
                        return openBlock(), createBlock(Fragment, {
                          key: item.path || item.label
                        }, [
                          item.children ? (openBlock(), createBlock("div", {
                            key: 0,
                            class: "sidebar-group"
                          }, [
                            createVNode("button", {
                              class: ["sidebar-item", { "sidebar-item--active": isGroupActive(item), "sidebar-item--open": expandedGroups.value[item.label] }],
                              onClick: ($event) => toggleGroup(item.label)
                            }, [
                              createVNode(VIcon, {
                                size: "20",
                                class: "sidebar-item__icon"
                              }, {
                                default: withCtx(() => [
                                  createTextVNode(toDisplayString(item.icon), 1)
                                ]),
                                _: 2
                              }, 1024),
                              !rail.value ? (openBlock(), createBlock("span", {
                                key: 0,
                                class: "sidebar-item__label"
                              }, toDisplayString(item.label), 1)) : createCommentVNode("", true),
                              !rail.value ? (openBlock(), createBlock(VIcon, {
                                key: 1,
                                size: "16",
                                class: "sidebar-item__chevron"
                              }, {
                                default: withCtx(() => [
                                  createTextVNode(toDisplayString(expandedGroups.value[item.label] ? "mdi-chevron-up" : "mdi-chevron-down"), 1)
                                ]),
                                _: 2
                              }, 1024)) : createCommentVNode("", true)
                            ], 10, ["onClick"]),
                            !rail.value && expandedGroups.value[item.label] ? (openBlock(), createBlock("div", {
                              key: 0,
                              class: "sidebar-group__children"
                            }, [
                              (openBlock(true), createBlock(Fragment, null, renderList(item.children, (child) => {
                                return openBlock(), createBlock(_component_NuxtLink, {
                                  key: child.path,
                                  to: child.path,
                                  class: ["sidebar-child", { "sidebar-child--active": isActive(child.path) }]
                                }, {
                                  default: withCtx(() => [
                                    createVNode(VIcon, {
                                      size: "18",
                                      class: "sidebar-child__icon"
                                    }, {
                                      default: withCtx(() => [
                                        createTextVNode(toDisplayString(child.icon), 1)
                                      ]),
                                      _: 2
                                    }, 1024),
                                    createVNode("span", { class: "sidebar-child__label" }, toDisplayString(child.label), 1)
                                  ]),
                                  _: 2
                                }, 1032, ["to", "class"]);
                              }), 128))
                            ])) : createCommentVNode("", true)
                          ])) : (openBlock(), createBlock(_component_NuxtLink, {
                            key: 1,
                            to: item.path,
                            class: ["sidebar-item", { "sidebar-item--active": isActive(item.path) }]
                          }, {
                            default: withCtx(() => [
                              createVNode(VIcon, {
                                size: "20",
                                class: "sidebar-item__icon"
                              }, {
                                default: withCtx(() => [
                                  createTextVNode(toDisplayString(item.icon), 1)
                                ]),
                                _: 2
                              }, 1024),
                              !rail.value ? (openBlock(), createBlock("span", {
                                key: 0,
                                class: "sidebar-item__label"
                              }, toDisplayString(item.label), 1)) : createCommentVNode("", true)
                            ]),
                            _: 2
                          }, 1032, ["to", "class"]))
                        ], 64);
                      }), 128))
                    ])
                  ], 64)) : createCommentVNode("", true),
                  unref(auth).isSuperAdmin ? (openBlock(), createBlock(Fragment, { key: 2 }, [
                    !rail.value ? (openBlock(), createBlock("div", {
                      key: 0,
                      class: "sidebar-section-label"
                    }, "Platform")) : createCommentVNode("", true),
                    createVNode("nav", { class: "sidebar-nav sidebar-nav--admin" }, [
                      (openBlock(true), createBlock(Fragment, null, renderList(superadminItems.value, (item) => {
                        return openBlock(), createBlock(Fragment, {
                          key: item.path || item.label
                        }, [
                          item.children ? (openBlock(), createBlock("div", {
                            key: 0,
                            class: "sidebar-group"
                          }, [
                            createVNode("button", {
                              class: ["sidebar-item", { "sidebar-item--active": isGroupActive(item), "sidebar-item--open": expandedGroups.value[item.label] }],
                              onClick: ($event) => toggleGroup(item.label)
                            }, [
                              createVNode(VIcon, {
                                size: "20",
                                class: "sidebar-item__icon"
                              }, {
                                default: withCtx(() => [
                                  createTextVNode(toDisplayString(item.icon), 1)
                                ]),
                                _: 2
                              }, 1024),
                              !rail.value ? (openBlock(), createBlock("span", {
                                key: 0,
                                class: "sidebar-item__label"
                              }, toDisplayString(item.label), 1)) : createCommentVNode("", true),
                              !rail.value ? (openBlock(), createBlock(VIcon, {
                                key: 1,
                                size: "16",
                                class: "sidebar-item__chevron"
                              }, {
                                default: withCtx(() => [
                                  createTextVNode(toDisplayString(expandedGroups.value[item.label] ? "mdi-chevron-up" : "mdi-chevron-down"), 1)
                                ]),
                                _: 2
                              }, 1024)) : createCommentVNode("", true)
                            ], 10, ["onClick"]),
                            !rail.value && expandedGroups.value[item.label] ? (openBlock(), createBlock("div", {
                              key: 0,
                              class: "sidebar-group__children"
                            }, [
                              (openBlock(true), createBlock(Fragment, null, renderList(item.children, (child) => {
                                return openBlock(), createBlock(_component_NuxtLink, {
                                  key: child.path,
                                  to: child.path,
                                  class: ["sidebar-child", { "sidebar-child--active": isActive(child.path) }]
                                }, {
                                  default: withCtx(() => [
                                    createVNode(VIcon, {
                                      size: "18",
                                      class: "sidebar-child__icon"
                                    }, {
                                      default: withCtx(() => [
                                        createTextVNode(toDisplayString(child.icon), 1)
                                      ]),
                                      _: 2
                                    }, 1024),
                                    createVNode("span", { class: "sidebar-child__label" }, toDisplayString(child.label), 1)
                                  ]),
                                  _: 2
                                }, 1032, ["to", "class"]);
                              }), 128))
                            ])) : createCommentVNode("", true)
                          ])) : (openBlock(), createBlock(_component_NuxtLink, {
                            key: 1,
                            to: item.path,
                            class: ["sidebar-item", { "sidebar-item--active": isActive(item.path) }]
                          }, {
                            default: withCtx(() => [
                              createVNode(VIcon, {
                                size: "20",
                                class: "sidebar-item__icon"
                              }, {
                                default: withCtx(() => [
                                  createTextVNode(toDisplayString(item.icon), 1)
                                ]),
                                _: 2
                              }, 1024),
                              !rail.value ? (openBlock(), createBlock("span", {
                                key: 0,
                                class: "sidebar-item__label"
                              }, toDisplayString(item.label), 1)) : createCommentVNode("", true)
                            ]),
                            _: 2
                          }, 1032, ["to", "class"]))
                        ], 64);
                      }), 128))
                    ])
                  ], 64)) : createCommentVNode("", true)
                ]),
                _: 1
              }, 8, ["modelValue", "onUpdate:modelValue", "rail"]),
              createVNode(VAppBar, {
                flat: "",
                border: "b",
                height: "64"
              }, {
                default: withCtx(() => [
                  createVNode(VAppBarNavIcon, {
                    variant: "text",
                    onClick: withModifiers(($event) => rail.value = !rail.value, ["stop"]),
                    class: "d-none d-md-flex"
                  }, null, 8, ["onClick"]),
                  createVNode(VAppBarNavIcon, {
                    variant: "text",
                    onClick: withModifiers(($event) => drawer.value = !drawer.value, ["stop"]),
                    class: "d-flex d-md-none"
                  }, null, 8, ["onClick"]),
                  sessionDuration.value ? (openBlock(), createBlock("div", {
                    key: 0,
                    class: "nav-brand-clock"
                  }, [
                    createVNode("div", { class: "nav-brand-clock__session" }, [
                      createVNode(VIcon, { size: "12" }, {
                        default: withCtx(() => [
                          createTextVNode("mdi-timer-outline")
                        ]),
                        _: 1
                      }),
                      createVNode("span", { class: "nav-brand-clock__session-label" }, "Session"),
                      createVNode("span", { class: "nav-brand-clock__session-value" }, toDisplayString(sessionDuration.value), 1)
                    ])
                  ])) : createCommentVNode("", true),
                  createVNode(VSpacer),
                  !unref(auth).isSuperAdmin ? (openBlock(), createBlock(_component_BranchSelector, {
                    key: 1,
                    class: "mr-2 d-none d-sm-flex"
                  })) : createCommentVNode("", true),
                  !unref(auth).isSuperAdmin ? (openBlock(), createBlock("div", {
                    key: 2,
                    class: "nav-today"
                  }, [
                    createVNode("span", { class: "nav-today__label" }, "TODAY"),
                    todayKpis.value.txCount > 0 ? (openBlock(), createBlock("div", {
                      key: 0,
                      class: "nav-today__live"
                    }, [
                      createVNode("span", { class: "nav-today__live-dot" }),
                      createVNode("span", { class: "nav-today__live-text" }, "LIVE")
                    ])) : createCommentVNode("", true),
                    createVNode("div", { class: "nav-clock" }, [
                      createVNode("span", { class: "nav-clock__digit" }, toDisplayString(clockDigits.value.h1), 1),
                      createVNode("span", { class: "nav-clock__digit" }, toDisplayString(clockDigits.value.h2), 1),
                      createVNode("span", {
                        class: ["nav-clock__colon", { "nav-clock__colon--blink": clockColon.value }]
                      }, ":", 2),
                      createVNode("span", { class: "nav-clock__digit" }, toDisplayString(clockDigits.value.m1), 1),
                      createVNode("span", { class: "nav-clock__digit" }, toDisplayString(clockDigits.value.m2), 1),
                      createVNode("span", {
                        class: ["nav-clock__colon", { "nav-clock__colon--blink": clockColon.value }]
                      }, ":", 2),
                      createVNode("span", { class: "nav-clock__digit" }, toDisplayString(clockDigits.value.s1), 1),
                      createVNode("span", { class: "nav-clock__digit" }, toDisplayString(clockDigits.value.s2), 1)
                    ]),
                    storeOpen.value ? (openBlock(), createBlock("div", {
                      key: 1,
                      class: "nav-countdown"
                    }, [
                      createVNode(VIcon, {
                        size: "13",
                        color: "primary"
                      }, {
                        default: withCtx(() => [
                          createTextVNode("mdi-store-clock-outline")
                        ]),
                        _: 1
                      }),
                      createVNode("span", { class: "nav-countdown__value" }, toDisplayString(countdown.value), 1)
                    ])) : (openBlock(), createBlock("div", {
                      key: 2,
                      class: "nav-countdown nav-countdown--closed"
                    }, [
                      createVNode(VIcon, {
                        size: "13",
                        color: "error"
                      }, {
                        default: withCtx(() => [
                          createTextVNode("mdi-store-off-outline")
                        ]),
                        _: 1
                      }),
                      createVNode("span", { class: "nav-countdown__value" }, "Closed")
                    ])),
                    createVNode("div", { class: "nav-today__stats" }, [
                      createVNode("div", { class: "nav-today__stat" }, [
                        createVNode("span", { class: "nav-today__stat-label" }, "Revenue"),
                        createVNode("span", { class: "nav-today__stat-value text-success" }, toDisplayString(formatMoney(todayKpis.value.revenue)), 1)
                      ]),
                      createVNode("div", { class: "nav-today__sep" }),
                      createVNode("div", { class: "nav-today__stat" }, [
                        createVNode("span", { class: "nav-today__stat-label" }, "Txns"),
                        createVNode("span", { class: "nav-today__stat-value" }, toDisplayString(todayKpis.value.txCount), 1)
                      ])
                    ])
                  ])) : createCommentVNode("", true),
                  createVNode(VBtn, {
                    class: "fullscreen-toggle",
                    icon: unref(isFullscreen) ? "mdi-fullscreen-exit" : "mdi-fullscreen",
                    variant: "text",
                    onClick: ($event) => unref(toggleFullscreen)(),
                    title: unref(isFullscreen) ? "Exit fullscreen" : "Enter fullscreen",
                    "aria-label": "Toggle fullscreen"
                  }, null, 8, ["icon", "onClick", "title"]),
                  createVNode(VBtn, {
                    icon: unref(theme).isDark.value ? "mdi-white-balance-sunny" : "mdi-moon-waning-crescent",
                    variant: "text",
                    onClick: ($event) => unref(theme).toggle(),
                    title: unref(theme).isDark.value ? "Switch to light mode" : "Switch to dark mode",
                    "aria-label": "Toggle dark mode"
                  }, null, 8, ["icon", "onClick", "title"]),
                  createVNode(VMenu, {
                    location: "bottom end",
                    offset: "8",
                    "min-width": "220"
                  }, {
                    activator: withCtx(({ props: menuProps }) => [
                      createVNode(VBtn, mergeProps(menuProps, {
                        variant: "text",
                        rounded: "lg",
                        class: "px-1"
                      }), {
                        default: withCtx(() => [
                          createVNode(VAvatar, {
                            color: "primary",
                            size: "32",
                            class: "mr-1"
                          }, {
                            default: withCtx(() => [
                              createVNode("span", { class: "text-white font-weight-bold text-body-2" }, toDisplayString(initials.value), 1)
                            ]),
                            _: 1
                          }),
                          createVNode(VIcon, { size: "18" }, {
                            default: withCtx(() => [
                              createTextVNode("mdi-chevron-down")
                            ]),
                            _: 1
                          })
                        ]),
                        _: 1
                      }, 16)
                    ]),
                    default: withCtx(() => [
                      createVNode(VList, {
                        density: "comfortable",
                        nav: "",
                        "min-width": "220"
                      }, {
                        default: withCtx(() => {
                          var _a;
                          return [
                            createVNode("div", { class: "px-4 py-2" }, [
                              createVNode("p", { class: "text-body-2 font-weight-bold" }, toDisplayString(unref(auth).fullName), 1),
                              createVNode("p", { class: "text-caption text-medium-emphasis" }, toDisplayString((_a = unref(auth).user) == null ? void 0 : _a.email), 1)
                            ]),
                            createVNode(VDivider),
                            createVNode(VListItem, {
                              to: "/settings/profile",
                              "prepend-icon": "mdi-account-circle-outline",
                              title: "Profile Settings"
                            }),
                            createVNode(VListItem, {
                              "prepend-icon": "mdi-logout",
                              title: "Sign out",
                              "base-color": "error",
                              onClick: ($event) => unref(auth).logout()
                            }, null, 8, ["onClick"])
                          ];
                        }),
                        _: 1
                      })
                    ]),
                    _: 1
                  })
                ]),
                _: 1
              }),
              createVNode(VMain, null, {
                default: withCtx(() => [
                  createVNode(VContainer, {
                    fluid: "",
                    class: "px-4 px-md-6 pb-4 pb-md-6 pt-2",
                    style: { "max-width": "1600px" }
                  }, {
                    default: withCtx(() => [
                      renderSlot(_ctx.$slots, "default", {}, void 0, true)
                    ]),
                    _: 3
                  })
                ]),
                _: 3
              })
            ];
          }
        }),
        _: 3
      }, _parent));
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("layouts/default.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const _default = /* @__PURE__ */ _export_sfc(_sfc_main, [["__scopeId", "data-v-36979901"]]);

export { _default as default };
//# sourceMappingURL=default-DFw-Br0j.mjs.map
