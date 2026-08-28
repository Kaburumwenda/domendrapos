import { y as navigateTo, z as useCookie, A as useRuntimeConfig, B as useNuxtApp } from './server.mjs';
import { defineStore } from 'file://D:/Projects/MY-APPS-2/DomendraPOS/frontend/node_modules/pinia/dist/pinia.js';

const useAuthStore = defineStore("auth", {
  state: () => ({
    user: null,
    accessToken: null,
    refreshToken: null,
    tenant: null,
    loginTime: null,
    billing: null,
    permissions: {}
  }),
  getters: {
    isAuthenticated: (state) => !!state.accessToken,
    fullName: (state) => state.user ? `${state.user.first_name} ${state.user.last_name}` : "",
    isSuperAdmin: (state) => {
      var _a;
      return ((_a = state.user) == null ? void 0 : _a.role) === "super_admin";
    },
    isTenantAdmin: (state) => {
      var _a;
      return ((_a = state.user) == null ? void 0 : _a.role) === "tenant_admin";
    },
    isManager: (state) => {
      var _a;
      return ["super_admin", "tenant_admin", "manager"].includes(((_a = state.user) == null ? void 0 : _a.role) || "");
    },
    role: (state) => {
      var _a;
      return ((_a = state.user) == null ? void 0 : _a.role) || "";
    },
    currencyCode: (state) => {
      var _a;
      return ((_a = state.tenant) == null ? void 0 : _a.currency_code) || "KES";
    },
    currencySymbol: (state) => {
      var _a;
      return ((_a = state.tenant) == null ? void 0 : _a.currency_symbol) || "KSh";
    },
    tenantName: (state) => {
      var _a;
      return ((_a = state.tenant) == null ? void 0 : _a.name) || "";
    },
    tenantPlan: (state) => {
      var _a;
      return ((_a = state.tenant) == null ? void 0 : _a.plan) || "";
    },
    tenantEmail: (state) => {
      var _a, _b;
      return ((_a = state.tenant) == null ? void 0 : _a.contact_email) || ((_b = state.user) == null ? void 0 : _b.email) || "";
    },
    tenantPhone: (state) => {
      var _a;
      return ((_a = state.tenant) == null ? void 0 : _a.contact_phone) || "";
    },
    tenantAddress: (state) => {
      const t = state.tenant;
      if (!t) return "";
      return [t.address_line1, t.address_line2].filter(Boolean).join(", ");
    },
    tenantLogo: (state) => {
      var _a, _b;
      const logo = (_a = state.tenant) == null ? void 0 : _a.logo;
      if (!logo) return "";
      if (typeof logo === "string" && logo.startsWith("http")) return logo;
      const config = useRuntimeConfig();
      const base = ((_b = config.public.apiBase) == null ? void 0 : _b.replace(/\/api$/, "")) || "http://localhost:8000";
      return logo ? `${base}${logo}` : "";
    },
    billingLocked: (state) => {
      var _a;
      return !!((_a = state.billing) == null ? void 0 : _a.locked);
    },
    hasOverdue: (state) => {
      var _a;
      return !!((_a = state.billing) == null ? void 0 : _a.has_overdue);
    },
    overdueTotal: (state) => {
      var _a;
      return ((_a = state.billing) == null ? void 0 : _a.total_overdue) || "0";
    },
    billingReason: (state) => {
      var _a;
      return ((_a = state.billing) == null ? void 0 : _a.reason) || "";
    },
    /**
     * Check if the current user has a specific permission.
     * @param module  e.g. 'inventory', 'sales', 'products'
     * @param action  e.g. 'view', 'create', 'edit', 'delete'
     * Super admins, tenant admins, and managers bypass all checks.
     */
    can: (state) => (module, action = "view") => {
      var _a;
      const role = ((_a = state.user) == null ? void 0 : _a.role) || "";
      if (["super_admin", "tenant_admin", "manager"].includes(role)) return true;
      if (!state.permissions || !state.permissions[module]) return false;
      return state.permissions[module].includes(action);
    },
    /** Check if the user has ANY permission for a module (at least 'view') */
    canAccess: (state) => (module) => {
      var _a;
      const role = ((_a = state.user) == null ? void 0 : _a.role) || "";
      if (["super_admin", "tenant_admin", "manager"].includes(role)) return true;
      if (!state.permissions || !state.permissions[module]) return false;
      return state.permissions[module].length > 0;
    }
  },
  actions: {
    setAuth(access, refresh, user, tenant, billing) {
      this.accessToken = access;
      this.refreshToken = refresh;
      this.user = user;
      this.tenant = tenant || null;
      const now = (/* @__PURE__ */ new Date()).toISOString();
      this.loginTime = now;
      const accessToken = useCookie("access_token");
      const refreshToken2 = useCookie("refresh_token");
      accessToken.value = access;
      refreshToken2.value = refresh;
      if (billing) {
        this.billing = billing;
      }
      const tenantCookie = useCookie("tenant_info");
      tenantCookie.value = tenant ? JSON.stringify(tenant) : null;
      const loginCookie = useCookie("login_time");
      loginCookie.value = now;
    },
    setPermissions(matrix) {
      this.permissions = matrix;
    },
    async fetchPermissions() {
      if (!this.accessToken || !this.user) return;
      if (["super_admin", "tenant_admin", "manager"].includes(this.user.role)) {
        this.permissions = {};
        return;
      }
      try {
        const config = useRuntimeConfig();
        const data = await $fetch(`${config.public.apiBase}/users/role-permissions/matrix/`, {
          headers: { Authorization: `Bearer ${this.accessToken}` }
        });
        const roleKey = this.user.role;
        this.permissions = data[roleKey] || {};
        const permCookie = useCookie("rbac_permissions", { maxAge: 60 * 60 * 24 * 7 });
        permCookie.value = this.permissions;
      } catch {
        const permCookie = useCookie("rbac_permissions");
        if (permCookie.value) {
          this.permissions = permCookie.value;
        }
      }
    },
    clearAuth() {
      var _a;
      (_a = this.user) == null ? void 0 : _a.id;
      this.accessToken = null;
      this.refreshToken = null;
      this.user = null;
      this.tenant = null;
      this.loginTime = null;
      this.billing = null;
      this.permissions = {};
      const accessToken = useCookie("access_token");
      const refreshToken2 = useCookie("refresh_token");
      const tenantCookie = useCookie("tenant_info");
      const loginCookie = useCookie("login_time");
      const permCookie = useCookie("rbac_permissions");
      accessToken.value = null;
      refreshToken2.value = null;
      tenantCookie.value = null;
      loginCookie.value = null;
      permCookie.value = null;
    },
    setTenant(tenant) {
      this.tenant = tenant;
      const tenantCookie = useCookie("tenant_info");
      tenantCookie.value = JSON.stringify(tenant);
    },
    async login(email, password) {
      const config = useRuntimeConfig();
      const response = await $fetch(`${config.public.apiBase}/auth/login/`, {
        method: "POST",
        body: { email, password }
      });
      this.setAuth(response.access, response.refresh, response.user, response.tenant, response.billing);
      await this.fetchPermissions();
      return response;
    },
    async fetchTenantSettings() {
      try {
        const data = await useApi()("/tenants/me/");
        this.setTenant({
          name: data.name,
          currency_code: data.currency_code,
          currency_symbol: data.currency_symbol,
          timezone: data.timezone,
          primary_color: data.primary_color,
          plan: data.plan || "",
          logo: data.logo || null,
          contact_email: data.contact_email || "",
          contact_phone: data.contact_phone || "",
          address_line1: data.address_line1 || "",
          address_line2: data.address_line2 || ""
        });
        return data;
      } catch (e) {
        return null;
      }
    },
    logout() {
      try {
        useApi()("/auth/logout/", { method: "POST" });
      } catch {
      }
      this.clearAuth();
      navigateTo("/login");
    },
    async refresh() {
      try {
        const data = await useApi()("/users/staff/me/");
        if (data) {
          this.user = {
            id: data.id,
            email: data.email,
            first_name: data.first_name,
            last_name: data.last_name,
            role: data.role,
            phone: data.phone,
            avatar: data.avatar,
            is_active_employee: data.is_active_employee,
            employee_id: data.employee_id || "",
            default_branch_id: data.default_branch_id
          };
          if (data.billing) {
            this.billing = data.billing;
          }
        }
        return data;
      } catch {
        return null;
      }
    }
  }
});
let isRefreshing = false;
let refreshPromise = null;
async function refreshToken() {
  if (isRefreshing && refreshPromise) return refreshPromise;
  const refreshTokenCookie = useCookie("refresh_token");
  if (!refreshTokenCookie.value) return null;
  isRefreshing = true;
  const config = useRuntimeConfig();
  refreshPromise = (async () => {
    try {
      const refreshed = await $fetch(
        `${config.public.apiBase}/auth/refresh/`,
        {
          method: "POST",
          body: { refresh: refreshTokenCookie.value }
        }
      );
      const accessTokenCookie = useCookie("access_token");
      accessTokenCookie.value = refreshed.access;
      if (refreshed.refresh) {
        refreshTokenCookie.value = refreshed.refresh;
      }
      const auth = useAuthStore();
      auth.accessToken = refreshed.access;
      if (refreshed.refresh) auth.refreshToken = refreshed.refresh;
      return refreshed.access;
    } catch {
      const accessTokenCookie = useCookie("access_token");
      accessTokenCookie.value = null;
      refreshTokenCookie.value = null;
      const auth = useAuthStore();
      auth.accessToken = null;
      auth.refreshToken = null;
      navigateTo("/login");
      return null;
    } finally {
      isRefreshing = false;
      refreshPromise = null;
    }
  })();
  return refreshPromise;
}
let apiInstance = null;
function useApi() {
  if (apiInstance) return apiInstance;
  const config = useRuntimeConfig();
  apiInstance = $fetch.create({
    baseURL: config.public.apiBase,
    credentials: "include",
    onRequest({ options }) {
      const accessToken = useCookie("access_token");
      if (accessToken.value) {
        options.headers = {
          ...options.headers,
          Authorization: `Bearer ${accessToken.value}`
        };
      }
    },
    async onResponseError(context) {
      const { response, request, options } = context;
      if (response.status !== 401) return;
      if (String(request).includes("/auth/refresh/") || String(request).includes("/auth/login/")) {
        return;
      }
      if (options._retried) return;
      options._retried = true;
      const newToken = await refreshToken();
      if (!newToken) return;
      return $fetch(request, {
        ...options,
        headers: {
          ...options.headers,
          Authorization: `Bearer ${newToken}`
        }
      });
    },
    onResponse({ response }) {
      var _a;
      if (response.status >= 500) {
        const { $toast } = useNuxtApp();
        (_a = $toast == null ? void 0 : $toast.error) == null ? void 0 : _a.call($toast, "Server error. Please try again.");
      }
    }
  });
  return apiInstance;
}

export { useAuthStore as a, useApi as u };
//# sourceMappingURL=useApi-D4YG8JPQ.mjs.map
