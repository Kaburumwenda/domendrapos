import { a9 as defineNuxtRouteMiddleware, F as useCookie, n as navigateTo } from './server.mjs';
import { u as useAuthStore } from './auth-s-b-v9EY.mjs';
import 'vue';
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
import 'vue/server-renderer';
import 'unhead/server';
import 'devalue';
import 'unhead/utils';
import 'pinia';
import 'vue-router';
import '@vue/shared';
import 'vue3-apexcharts';
import './useApi-9yTPzSUF.mjs';

const auth = defineNuxtRouteMiddleware((to, from) => {
  const auth2 = useAuthStore();
  const accessToken = useCookie("access_token");
  const publicPages = ["/login", "/signup"];
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
    const tenantCookie = useCookie("tenant_info");
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
});

export { auth as default };
//# sourceMappingURL=auth-IbT48v8-.mjs.map
