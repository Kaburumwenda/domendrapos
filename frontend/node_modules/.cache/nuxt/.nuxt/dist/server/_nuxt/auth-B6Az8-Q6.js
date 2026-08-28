import { executeAsync } from "D:/Projects/MY-APPS-2/DomendraPOS/frontend/node_modules/unctx/dist/index.mjs";
import { ap as defineNuxtRouteMiddleware, z as useCookie, y as navigateTo } from "../server.mjs";
import { a as useAuthStore } from "./useApi-D4YG8JPQ.js";
import "vue";
import "D:/Projects/MY-APPS-2/DomendraPOS/frontend/node_modules/ofetch/dist/node.mjs";
import "#internal/nuxt/paths";
import "D:/Projects/MY-APPS-2/DomendraPOS/frontend/node_modules/nuxt/node_modules/hookable/dist/index.mjs";
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
import "vue/server-renderer";
const auth = defineNuxtRouteMiddleware(async (to, from) => {
  let __temp, __restore;
  const auth2 = useAuthStore();
  const accessToken = useCookie("access_token");
  const refreshTokenCookie = useCookie("refresh_token");
  const loginCookie = useCookie("login_time");
  const permCookie = useCookie("rbac_permissions", { maxAge: 60 * 60 * 24 * 7 });
  const tenantCookie = useCookie("tenant_info");
  const publicPages = ["/login", "/signup", "/docs"];
  if (publicPages.includes(to.path)) return;
  if (!accessToken.value && !auth2.isAuthenticated) {
    return navigateTo("/login");
  }
  if (!auth2.user && accessToken.value) {
    try {
      const parts = accessToken.value.split(".");
      if (parts.length >= 2) {
        const payloadStr = atob(parts[1].replace(/-/g, "+").replace(/_/g, "/"));
        const payload = JSON.parse(payloadStr);
        auth2.accessToken = accessToken.value;
        auth2.refreshToken = refreshTokenCookie.value || null;
        auth2.user = {
          id: Number(payload.user_id),
          email: payload.email || "",
          first_name: payload.name?.split(" ")[0] || "",
          last_name: payload.name?.split(" ").slice(1).join(" ") || "",
          role: payload.role || "viewer",
          phone: "",
          avatar: null,
          is_active_employee: true,
          employee_id: "",
          default_branch_id: null
        };
        if (!auth2.loginTime) {
          auth2.loginTime = loginCookie.value || (/* @__PURE__ */ new Date()).toISOString();
        }
        if (!auth2.permissions || Object.keys(auth2.permissions).length === 0) {
          if (permCookie.value) {
            auth2.setPermissions(permCookie.value);
          }
        }
        const isManagerPlus = ["super_admin", "tenant_admin", "manager"].includes(payload.role || "");
        if (!isManagerPlus) {
          if (!auth2.permissions || Object.keys(auth2.permissions).length === 0) {
            ;
            [__temp, __restore] = executeAsync(() => auth2.fetchPermissions()), await __temp, __restore();
            ;
          }
          if (auth2.permissions && Object.keys(auth2.permissions).length > 0) {
            permCookie.value = auth2.permissions;
          }
        }
      }
    } catch {
    }
  }
  const superadminAllowedPrefixes = ["/superadmin", "/settings/profile"];
  const isSuperadminPage = superadminAllowedPrefixes.some((p) => to.path === p || to.path.startsWith(p + "/"));
  if (auth2.role === "super_admin") {
    if (!isSuperadminPage) {
      return navigateTo("/superadmin");
    }
    return;
  }
  const isSuperadminOnly = to.path === "/superadmin" || to.path.startsWith("/superadmin/");
  if (isSuperadminOnly) {
    return navigateTo("/dashboard");
  }
  if (!auth2.tenant) {
    if (tenantCookie.value) {
      try {
        const tenant = typeof tenantCookie.value === "string" ? JSON.parse(tenantCookie.value) : tenantCookie.value;
        auth2.setTenant(tenant);
      } catch {
      }
    }
  }
  const lockPages = ["/billing/overdue", "/billing/locked"];
  if (auth2.isAuthenticated && auth2.billingLocked && auth2.role !== "super_admin") {
    const lockPage = auth2.isTenantAdmin ? "/billing/overdue" : "/billing/locked";
    if (!lockPages.includes(to.path)) {
      return navigateTo(lockPage);
    }
    if (to.path === "/billing/overdue" && !auth2.isTenantAdmin) return navigateTo("/billing/locked");
    if (to.path === "/billing/locked" && auth2.isTenantAdmin) return navigateTo("/billing/overdue");
  }
  if (auth2.isAuthenticated && !auth2.billingLocked && lockPages.includes(to.path)) {
    if (!(to.path === "/billing/overdue" && auth2.isTenantAdmin && auth2.hasOverdue)) {
      return navigateTo("/dashboard");
    }
  }
  if (auth2.isAuthenticated && !auth2.isManager && auth2.role !== "super_admin") {
    const routeModuleMap = {
      "/products": "products",
      "/inventory": "inventory",
      "/pos": "sales",
      "/sales": "sales",
      "/customers": "customers",
      "/suppliers": "suppliers",
      "/reports": "reports",
      "/analytics": "analytics",
      "/accounts": "accounting",
      "/invoices": "accounting",
      "/credit": "accounting",
      "/expenses": "accounting",
      "/purchase-orders": "purchasing",
      "/admin/staff": "staff",
      "/admin/branches": "branches",
      "/admin/roles-permissions": "staff",
      "/admin/audit-logs": "staff",
      "/admin/security": "staff",
      "/admin/settings": "settings",
      "/admin/billing": "settings"
    };
    for (const [prefix, module] of Object.entries(routeModuleMap)) {
      if (to.path === prefix || to.path.startsWith(prefix + "/")) {
        if (!auth2.canAccess(module)) {
          return navigateTo("/dashboard");
        }
        break;
      }
    }
    if (to.path === "/dashboard" && !auth2.canAccess("analytics")) {
      if (auth2.canAccess("sales")) {
        return navigateTo("/pos");
      }
      const fallbackMods = ["products", "inventory", "customers", "suppliers", "reports", "accounting", "purchasing", "staff", "branches", "settings"];
      for (const mod of fallbackMods) {
        if (auth2.canAccess(mod)) {
          const modRoute = {
            products: "/products",
            inventory: "/inventory",
            customers: "/customers",
            suppliers: "/suppliers",
            reports: "/reports",
            accounting: "/accounts",
            purchasing: "/purchase-orders",
            staff: "/admin/staff",
            branches: "/admin/branches",
            settings: "/admin/settings"
          };
          return navigateTo(modRoute[mod] || "/settings/profile");
        }
      }
      return navigateTo("/settings/profile");
    }
  }
});
export {
  auth as default
};
//# sourceMappingURL=auth-B6Az8-Q6.js.map
