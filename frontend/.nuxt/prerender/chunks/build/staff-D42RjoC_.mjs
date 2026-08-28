import { defineComponent, ref, reactive, computed, mergeProps, withCtx, createTextVNode, unref, toDisplayString, isRef, createVNode, openBlock, createBlock, createCommentVNode, withDirectives, vModelText, Fragment, renderList, vModelSelect, vModelCheckbox, useSSRContext } from 'file://D:/Projects/MY-APPS-2/DomendraPOS/frontend/node_modules/vue/index.mjs';
import { ssrRenderAttrs, ssrRenderComponent, ssrRenderList, ssrRenderClass, ssrInterpolate, ssrRenderAttr, ssrIncludeBooleanAttr, ssrLooseContain, ssrLooseEqual, ssrRenderStyle } from 'file://D:/Projects/MY-APPS-2/DomendraPOS/frontend/node_modules/vue/server-renderer/index.mjs';
import { _ as _export_sfc, D as useToast, a as VIcon, q as VDialog, g as VCard, c as VBtn, k as VDivider, x as VProgressCircular } from './server.mjs';
import { u as useFormat } from './useFormat-BvVWDMYe.mjs';
import { u as useApi } from './useApi-D4YG8JPQ.mjs';
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

const pageSize = 20;
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "staff",
  __ssrInlineRender: true,
  setup(__props) {
    const toast = useToast();
    const fmt = useFormat();
    const users = ref([]);
    const branches = ref([]);
    const loading = ref(true);
    const togglingId = ref(null);
    const search = ref("");
    const roleFilter = ref("");
    const branchFilter = ref("");
    const statusFilter = ref("");
    const sortBy = ref("date_joined");
    const sortDesc = ref(true);
    const selectedIds = ref([]);
    const pagination = reactive({
      count: 0,
      page: 1,
      totalPages: 1
    });
    const avatarInput = ref(null);
    const avatarFile = ref(null);
    const avatarPreview = ref("");
    const dialog = ref(false);
    const editing = ref(false);
    const saving = ref(false);
    const formError = ref("");
    const form = reactive({
      id: null,
      first_name: "",
      last_name: "",
      email: "",
      phone: "",
      employee_id: "",
      role: "cashier",
      default_branch_id: null,
      hire_date: "",
      termination_date: "",
      password: "",
      is_active_employee: true
    });
    const resetPwDialog = ref(false);
    const resetPwTarget = ref(null);
    const resetPwForm = reactive({ new_password: "", confirm: "" });
    const resetPwError = ref("");
    const resettingPw = ref(false);
    const deleteDialog = ref(false);
    const deleteTarget = ref(null);
    const hardDelete = ref(false);
    const deleting = ref(false);
    const confirmBulkDelete = ref(false);
    const bulkActioning = ref(false);
    const roleOptions = [
      { value: "super_admin", label: "Super Admin" },
      { value: "tenant_admin", label: "Tenant Admin" },
      { value: "manager", label: "Manager" },
      { value: "cashier", label: "Cashier" },
      { value: "inventory_clerk", label: "Inventory Clerk" },
      { value: "accountant", label: "Accountant" },
      { value: "sales_associate", label: "Sales Associate" },
      { value: "viewer", label: "Viewer" }
    ];
    const roleColors = {
      super_admin: "purple",
      tenant_admin: "indigo",
      manager: "blue",
      cashier: "teal",
      inventory_clerk: "orange",
      accountant: "green",
      sales_associate: "cyan",
      viewer: "grey"
    };
    function roleColor(role) {
      return roleColors[role] || "grey";
    }
    function roleLabel(role) {
      var _a;
      return ((_a = roleOptions.find((r) => r.value === role)) == null ? void 0 : _a.label) || role.replace(/_/g, " ");
    }
    function fullName(u) {
      return `${u.first_name} ${u.last_name}`.trim() || u.email;
    }
    function initials(u) {
      var _a, _b;
      const f = ((_a = u.first_name) == null ? void 0 : _a[0]) || "";
      const l = ((_b = u.last_name) == null ? void 0 : _b[0]) || "";
      return (f + l).toUpperCase() || "?";
    }
    function branchName(id) {
      var _a;
      if (!id) return "";
      return ((_a = branches.value.find((b) => b.id === id)) == null ? void 0 : _a.name) || "";
    }
    const formInitials = computed(() => {
      var _a, _b;
      const f = ((_a = form.first_name) == null ? void 0 : _a[0]) || "";
      const l = ((_b = form.last_name) == null ? void 0 : _b[0]) || "";
      return (f + l).toUpperCase() || "?";
    });
    const filteredUsers = computed(() => users.value);
    const isAllSelected = computed(() => {
      if (!users.value.length) return false;
      return users.value.every((u) => selectedIds.value.includes(u.id));
    });
    const isIndeterminate = computed(() => selectedIds.value.length > 0 && !isAllSelected.value);
    const pageNumbers = computed(() => {
      const pages = [];
      const start = Math.max(1, pagination.page - 2);
      const end = Math.min(pagination.totalPages, start + 4);
      for (let i = start; i <= end; i++) pages.push(i);
      return pages;
    });
    const kpis = computed(() => [
      { label: "Total Staff", value: pagination.count, icon: "mdi-account-group", color: "blue" },
      { label: "Active", value: users.value.filter((u) => u.is_active_employee).length, icon: "mdi-account-check", color: "green" },
      { label: "Inactive", value: users.value.filter((u) => !u.is_active_employee).length, icon: "mdi-account-off", color: "red" },
      { label: "Managers", value: users.value.filter((u) => ["super_admin", "tenant_admin", "manager"].includes(u.role)).length, icon: "mdi-shield-account", color: "purple" }
    ]);
    function clearSelection() {
      selectedIds.value = [];
    }
    function triggerAvatarInput() {
      var _a;
      (_a = avatarInput.value) == null ? void 0 : _a.click();
    }
    function onAvatarSelected(e) {
      const target = e.target;
      if (target.files && target.files[0]) {
        const file = target.files[0];
        if (!file.type.startsWith("image/")) {
          toast.error("Please select a valid image file");
          target.value = "";
          return;
        }
        if (file.size > 5 * 1024 * 1024) {
          toast.error("Image exceeds the 5 MB limit");
          target.value = "";
          return;
        }
        avatarFile.value = file;
        const reader = new FileReader();
        reader.onload = (ev) => {
          var _a;
          avatarPreview.value = (_a = ev.target) == null ? void 0 : _a.result;
        };
        reader.readAsDataURL(file);
      }
      target.value = "";
    }
    function removeAvatar() {
      avatarFile.value = null;
      avatarPreview.value = "";
    }
    function closeDialog() {
      dialog.value = false;
      formError.value = "";
    }
    function validate() {
      if (!form.first_name.trim()) {
        formError.value = "First name is required";
        return false;
      }
      if (!form.last_name.trim()) {
        formError.value = "Last name is required";
        return false;
      }
      if (!form.email.trim()) {
        formError.value = "Email is required";
        return false;
      }
      if (!editing.value && form.password.length < 8) {
        formError.value = "Password must be at least 8 characters";
        return false;
      }
      formError.value = "";
      return true;
    }
    async function saveStaff() {
      var _a, _b, _c, _d, _e;
      if (!validate()) return;
      saving.value = true;
      try {
        if (editing.value && form.id) {
          const baseData = {
            first_name: form.first_name,
            last_name: form.last_name,
            phone: form.phone,
            employee_id: form.employee_id,
            role: form.role,
            default_branch_id: (_a = form.default_branch_id) != null ? _a : "",
            hire_date: form.hire_date || null,
            termination_date: form.termination_date || null,
            is_active_employee: form.is_active_employee
          };
          let payload = baseData;
          let fetchOpts = {};
          if (avatarFile.value) {
            const formData = new FormData();
            for (const [key, value] of Object.entries(baseData)) {
              if (value === null || value === void 0) continue;
              formData.append(key, String(value));
            }
            formData.append("avatar", avatarFile.value);
            payload = formData;
            fetchOpts = { headers: {} };
          }
          const updated = await useApi()(`/users/staff/${form.id}/`, { method: "PATCH", body: payload, ...fetchOpts });
          const idx = users.value.findIndex((u) => u.id === form.id);
          if (idx >= 0) users.value[idx] = { ...users.value[idx], ...updated };
          toast.success("Staff member updated");
        } else {
          const baseData = {
            first_name: form.first_name,
            last_name: form.last_name,
            email: form.email,
            phone: form.phone,
            employee_id: form.employee_id,
            role: form.role,
            default_branch_id: (_b = form.default_branch_id) != null ? _b : "",
            hire_date: form.hire_date || null,
            password: form.password
          };
          let payload = baseData;
          let fetchOpts = {};
          if (avatarFile.value) {
            const formData = new FormData();
            for (const [key, value] of Object.entries(baseData)) {
              if (value === null || value === void 0) continue;
              formData.append(key, String(value));
            }
            formData.append("avatar", avatarFile.value);
            payload = formData;
            fetchOpts = { headers: {} };
          }
          const created = await useApi()("/users/staff/", { method: "POST", body: payload, ...fetchOpts });
          users.value.unshift(created);
          pagination.count++;
          toast.success("Staff member created");
        }
        dialog.value = false;
      } catch (e) {
        formError.value = ((_d = (_c = e == null ? void 0 : e.data) == null ? void 0 : _c.email) == null ? void 0 : _d[0]) || ((_e = e == null ? void 0 : e.data) == null ? void 0 : _e.detail) || "Failed to save staff member";
      } finally {
        saving.value = false;
      }
    }
    async function doResetPw() {
      var _a;
      if (!resetPwTarget.value) return;
      if (resetPwForm.new_password.length < 8) {
        resetPwError.value = "Password must be at least 8 characters";
        return;
      }
      if (resetPwForm.new_password !== resetPwForm.confirm) {
        resetPwError.value = "Passwords do not match";
        return;
      }
      resettingPw.value = true;
      try {
        await useApi()(`/users/staff/${resetPwTarget.value.id}/reset-password/`, {
          method: "POST",
          body: { new_password: resetPwForm.new_password }
        });
        toast.success("Password reset successfully");
        resetPwDialog.value = false;
      } catch (e) {
        resetPwError.value = ((_a = e == null ? void 0 : e.data) == null ? void 0 : _a.detail) || "Failed to reset password";
      } finally {
        resettingPw.value = false;
      }
    }
    async function doDelete() {
      if (!deleteTarget.value) return;
      deleting.value = true;
      try {
        const url = hardDelete.value ? `/users/staff/${deleteTarget.value.id}/?hard=1` : `/users/staff/${deleteTarget.value.id}/`;
        await useApi()(url, { method: "DELETE" });
        if (hardDelete.value) {
          users.value = users.value.filter((u) => u.id !== deleteTarget.value.id);
          pagination.count--;
        } else {
          const idx = users.value.findIndex((u) => u.id === deleteTarget.value.id);
          if (idx >= 0) users.value[idx].is_active_employee = false;
        }
        toast.success(hardDelete.value ? "Staff member deleted" : "Staff member deactivated");
        deleteDialog.value = false;
      } catch {
        toast.error("Failed to delete staff member");
      } finally {
        deleting.value = false;
      }
    }
    async function doBulkDelete() {
      bulkActioning.value = true;
      let ok = 0;
      for (const id of selectedIds.value) {
        try {
          const url = hardDelete.value ? `/users/staff/${id}/?hard=1` : `/users/staff/${id}/`;
          await useApi()(url, { method: "DELETE" });
          if (hardDelete.value) {
            users.value = users.value.filter((u) => u.id !== id);
          } else {
            const u = users.value.find((x) => x.id === id);
            if (u) u.is_active_employee = false;
          }
          ok++;
        } catch {
        }
      }
      bulkActioning.value = false;
      toast.success(`${ok} staff member(s) ${hardDelete.value ? "deleted" : "deactivated"}`);
      confirmBulkDelete.value = false;
      clearSelection();
      if (hardDelete.value) pagination.count -= ok;
    }
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "staff-page" }, _attrs))} data-v-8a6a1a9d><div class="staff-header" data-v-8a6a1a9d><div class="staff-header__left" data-v-8a6a1a9d><h1 class="staff-header__title" data-v-8a6a1a9d>Staff Members</h1><p class="staff-header__sub" data-v-8a6a1a9d>Manage your team \u2014 roles, status, branch assignments, and permissions</p></div><div class="staff-header__actions" data-v-8a6a1a9d><button class="staff-btn staff-btn--ghost" data-v-8a6a1a9d>`);
      _push(ssrRenderComponent(VIcon, { size: "18" }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`mdi-refresh`);
          } else {
            return [
              createTextVNode("mdi-refresh")
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(` Refresh </button><button class="staff-btn staff-btn--ghost" data-v-8a6a1a9d>`);
      _push(ssrRenderComponent(VIcon, { size: "18" }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`mdi-download`);
          } else {
            return [
              createTextVNode("mdi-download")
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(` Export </button><button class="staff-btn staff-btn--primary" data-v-8a6a1a9d>`);
      _push(ssrRenderComponent(VIcon, { size: "18" }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`mdi-plus`);
          } else {
            return [
              createTextVNode("mdi-plus")
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(` Add Staff </button></div></div><div class="staff-kpi-grid" data-v-8a6a1a9d><!--[-->`);
      ssrRenderList(unref(kpis), (kpi) => {
        _push(`<div class="staff-kpi" data-v-8a6a1a9d><div class="${ssrRenderClass([`staff-kpi__icon--${kpi.color}`, "staff-kpi__icon"])}" data-v-8a6a1a9d>`);
        _push(ssrRenderComponent(VIcon, { size: "20" }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`${ssrInterpolate(kpi.icon)}`);
            } else {
              return [
                createTextVNode(toDisplayString(kpi.icon), 1)
              ];
            }
          }),
          _: 2
        }, _parent));
        _push(`</div><div class="staff-kpi__body" data-v-8a6a1a9d><p class="staff-kpi__label" data-v-8a6a1a9d>${ssrInterpolate(kpi.label)}</p><p class="staff-kpi__value" data-v-8a6a1a9d>${ssrInterpolate(kpi.value)}</p></div></div>`);
      });
      _push(`<!--]--></div><div class="staff-toolbar" data-v-8a6a1a9d><div class="staff-toolbar__search" data-v-8a6a1a9d>`);
      _push(ssrRenderComponent(VIcon, {
        size: "18",
        class: "staff-toolbar__search-icon"
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
      _push(`<input${ssrRenderAttr("value", unref(search))} class="staff-toolbar__search-input" placeholder="Search by name, email, or employee ID\u2026" data-v-8a6a1a9d>`);
      if (unref(search)) {
        _push(`<button class="staff-toolbar__search-clear" data-v-8a6a1a9d>`);
        _push(ssrRenderComponent(VIcon, { size: "16" }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`mdi-close-circle`);
            } else {
              return [
                createTextVNode("mdi-close-circle")
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(`</button>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</div><div class="staff-toolbar__filters" data-v-8a6a1a9d><select class="staff-toolbar__select" data-v-8a6a1a9d><option value="" data-v-8a6a1a9d${ssrIncludeBooleanAttr(Array.isArray(unref(roleFilter)) ? ssrLooseContain(unref(roleFilter), "") : ssrLooseEqual(unref(roleFilter), "")) ? " selected" : ""}>All Roles</option><!--[-->`);
      ssrRenderList(roleOptions, (r) => {
        _push(`<option${ssrRenderAttr("value", r.value)} data-v-8a6a1a9d${ssrIncludeBooleanAttr(Array.isArray(unref(roleFilter)) ? ssrLooseContain(unref(roleFilter), r.value) : ssrLooseEqual(unref(roleFilter), r.value)) ? " selected" : ""}>${ssrInterpolate(r.label)}</option>`);
      });
      _push(`<!--]--></select><select class="staff-toolbar__select" data-v-8a6a1a9d><option value="" data-v-8a6a1a9d${ssrIncludeBooleanAttr(Array.isArray(unref(branchFilter)) ? ssrLooseContain(unref(branchFilter), "") : ssrLooseEqual(unref(branchFilter), "")) ? " selected" : ""}>All Branches</option><!--[-->`);
      ssrRenderList(unref(branches), (b) => {
        _push(`<option${ssrRenderAttr("value", b.id)} data-v-8a6a1a9d${ssrIncludeBooleanAttr(Array.isArray(unref(branchFilter)) ? ssrLooseContain(unref(branchFilter), b.id) : ssrLooseEqual(unref(branchFilter), b.id)) ? " selected" : ""}>${ssrInterpolate(b.name)}</option>`);
      });
      _push(`<!--]--></select><select class="staff-toolbar__select" data-v-8a6a1a9d><option value="" data-v-8a6a1a9d${ssrIncludeBooleanAttr(Array.isArray(unref(statusFilter)) ? ssrLooseContain(unref(statusFilter), "") : ssrLooseEqual(unref(statusFilter), "")) ? " selected" : ""}>All Status</option><option value="active" data-v-8a6a1a9d${ssrIncludeBooleanAttr(Array.isArray(unref(statusFilter)) ? ssrLooseContain(unref(statusFilter), "active") : ssrLooseEqual(unref(statusFilter), "active")) ? " selected" : ""}>Active</option><option value="inactive" data-v-8a6a1a9d${ssrIncludeBooleanAttr(Array.isArray(unref(statusFilter)) ? ssrLooseContain(unref(statusFilter), "inactive") : ssrLooseEqual(unref(statusFilter), "inactive")) ? " selected" : ""}>Deactivated</option></select></div></div>`);
      if (unref(selectedIds).length > 0) {
        _push(`<div class="staff-bulk-bar" data-v-8a6a1a9d><div class="staff-bulk-bar__left" data-v-8a6a1a9d>`);
        _push(ssrRenderComponent(VIcon, {
          size: "18",
          color: "primary"
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`mdi-check-circle`);
            } else {
              return [
                createTextVNode("mdi-check-circle")
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(`<span class="staff-bulk-bar__count" data-v-8a6a1a9d>${ssrInterpolate(unref(selectedIds).length)} selected</span><button class="staff-bulk-bar__clear" data-v-8a6a1a9d>Clear</button></div><div class="staff-bulk-bar__actions" data-v-8a6a1a9d><button class="staff-bulk-btn staff-bulk-btn--success"${ssrIncludeBooleanAttr(unref(bulkActioning)) ? " disabled" : ""} data-v-8a6a1a9d>`);
        _push(ssrRenderComponent(VIcon, { size: "16" }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`mdi-account-check-outline`);
            } else {
              return [
                createTextVNode("mdi-account-check-outline")
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(` Activate </button><button class="staff-bulk-btn staff-bulk-btn--danger"${ssrIncludeBooleanAttr(unref(bulkActioning)) ? " disabled" : ""} data-v-8a6a1a9d>`);
        _push(ssrRenderComponent(VIcon, { size: "16" }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`mdi-account-off-outline`);
            } else {
              return [
                createTextVNode("mdi-account-off-outline")
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(` Deactivate </button><button class="staff-bulk-btn staff-bulk-btn--danger"${ssrIncludeBooleanAttr(unref(bulkActioning)) ? " disabled" : ""} data-v-8a6a1a9d>`);
        _push(ssrRenderComponent(VIcon, { size: "16" }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`mdi-delete-outline`);
            } else {
              return [
                createTextVNode("mdi-delete-outline")
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(` Delete </button></div></div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`<div class="staff-table-wrap" data-v-8a6a1a9d><table class="staff-table" data-v-8a6a1a9d><thead data-v-8a6a1a9d><tr data-v-8a6a1a9d><th style="${ssrRenderStyle({ "width": "40px" })}" data-v-8a6a1a9d><input type="checkbox" class="staff-checkbox"${ssrIncludeBooleanAttr(unref(isAllSelected)) ? " checked" : ""}${ssrRenderAttr("indeterminate", unref(isIndeterminate))} data-v-8a6a1a9d></th><th class="staff-th-sort" data-v-8a6a1a9d>Staff Member `);
      if (unref(sortBy) === "first_name") {
        _push(ssrRenderComponent(VIcon, { size: "12" }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`${ssrInterpolate(unref(sortDesc) ? "mdi-arrow-down" : "mdi-arrow-up")}`);
            } else {
              return [
                createTextVNode(toDisplayString(unref(sortDesc) ? "mdi-arrow-down" : "mdi-arrow-up"), 1)
              ];
            }
          }),
          _: 1
        }, _parent));
      } else {
        _push(`<!---->`);
      }
      _push(`</th><th class="staff-th-sort" data-v-8a6a1a9d>Role `);
      if (unref(sortBy) === "role") {
        _push(ssrRenderComponent(VIcon, { size: "12" }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`${ssrInterpolate(unref(sortDesc) ? "mdi-arrow-down" : "mdi-arrow-up")}`);
            } else {
              return [
                createTextVNode(toDisplayString(unref(sortDesc) ? "mdi-arrow-down" : "mdi-arrow-up"), 1)
              ];
            }
          }),
          _: 1
        }, _parent));
      } else {
        _push(`<!---->`);
      }
      _push(`</th><th data-v-8a6a1a9d>Phone</th><th data-v-8a6a1a9d>Branch</th><th class="staff-th-sort" data-v-8a6a1a9d>Status `);
      if (unref(sortBy) === "is_active_employee") {
        _push(ssrRenderComponent(VIcon, { size: "12" }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`${ssrInterpolate(unref(sortDesc) ? "mdi-arrow-down" : "mdi-arrow-up")}`);
            } else {
              return [
                createTextVNode(toDisplayString(unref(sortDesc) ? "mdi-arrow-down" : "mdi-arrow-up"), 1)
              ];
            }
          }),
          _: 1
        }, _parent));
      } else {
        _push(`<!---->`);
      }
      _push(`</th><th class="staff-th-sort" data-v-8a6a1a9d>Hired `);
      if (unref(sortBy) === "hire_date") {
        _push(ssrRenderComponent(VIcon, { size: "12" }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`${ssrInterpolate(unref(sortDesc) ? "mdi-arrow-down" : "mdi-arrow-up")}`);
            } else {
              return [
                createTextVNode(toDisplayString(unref(sortDesc) ? "mdi-arrow-down" : "mdi-arrow-up"), 1)
              ];
            }
          }),
          _: 1
        }, _parent));
      } else {
        _push(`<!---->`);
      }
      _push(`</th><th style="${ssrRenderStyle({ "width": "140px" })}" data-v-8a6a1a9d>Actions</th></tr></thead><tbody data-v-8a6a1a9d>`);
      if (unref(loading)) {
        _push(`<!--[-->`);
        ssrRenderList(6, (i) => {
          _push(`<tr data-v-8a6a1a9d><td data-v-8a6a1a9d><div class="staff-skeleton" style="${ssrRenderStyle({ "width": "18px", "height": "18px" })}" data-v-8a6a1a9d></div></td><td data-v-8a6a1a9d><div class="staff-skeleton" style="${ssrRenderStyle({ "width": "160px", "height": "38px" })}" data-v-8a6a1a9d></div></td><td data-v-8a6a1a9d><div class="staff-skeleton" style="${ssrRenderStyle({ "width": "90px", "height": "22px" })}" data-v-8a6a1a9d></div></td><td data-v-8a6a1a9d><div class="staff-skeleton" style="${ssrRenderStyle({ "width": "100px", "height": "16px" })}" data-v-8a6a1a9d></div></td><td data-v-8a6a1a9d><div class="staff-skeleton" style="${ssrRenderStyle({ "width": "80px", "height": "16px" })}" data-v-8a6a1a9d></div></td><td data-v-8a6a1a9d><div class="staff-skeleton" style="${ssrRenderStyle({ "width": "70px", "height": "22px" })}" data-v-8a6a1a9d></div></td><td data-v-8a6a1a9d><div class="staff-skeleton" style="${ssrRenderStyle({ "width": "70px", "height": "16px" })}" data-v-8a6a1a9d></div></td><td data-v-8a6a1a9d><div class="staff-skeleton" style="${ssrRenderStyle({ "width": "120px", "height": "28px" })}" data-v-8a6a1a9d></div></td></tr>`);
        });
        _push(`<!--]-->`);
      } else if (!unref(filteredUsers).length) {
        _push(`<tr data-v-8a6a1a9d><td colspan="8" class="staff-empty" data-v-8a6a1a9d>`);
        _push(ssrRenderComponent(VIcon, {
          size: "40",
          class: "staff-empty__icon"
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`mdi-account-group-outline`);
            } else {
              return [
                createTextVNode("mdi-account-group-outline")
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(`<p class="staff-empty__title" data-v-8a6a1a9d>No staff members found</p><p class="staff-empty__sub" data-v-8a6a1a9d>Try adjusting your search or filters</p></td></tr>`);
      } else {
        _push(`<!---->`);
      }
      _push(`<!--[-->`);
      ssrRenderList(unref(filteredUsers), (user) => {
        _push(`<tr class="${ssrRenderClass({ "staff-row--selected": unref(selectedIds).includes(user.id) })}" data-v-8a6a1a9d><td data-v-8a6a1a9d><input type="checkbox" class="staff-checkbox"${ssrIncludeBooleanAttr(unref(selectedIds).includes(user.id)) ? " checked" : ""} data-v-8a6a1a9d></td><td data-v-8a6a1a9d><div class="staff-cell-user" data-v-8a6a1a9d><div class="${ssrRenderClass([`staff-avatar--${roleColor(user.role)}`, "staff-avatar"])}" data-v-8a6a1a9d>`);
        if (user.avatar) {
          _push(`<img${ssrRenderAttr("src", user.avatar)} class="staff-avatar__img" data-v-8a6a1a9d>`);
        } else {
          _push(`<span data-v-8a6a1a9d>${ssrInterpolate(initials(user))}</span>`);
        }
        _push(`</div><div class="staff-cell-user__info" data-v-8a6a1a9d><p class="staff-cell-user__name" data-v-8a6a1a9d>${ssrInterpolate(fullName(user))}</p><p class="staff-cell-user__email" data-v-8a6a1a9d>${ssrInterpolate(user.email)}</p></div></div></td><td data-v-8a6a1a9d><span class="${ssrRenderClass([`staff-role-chip--${roleColor(user.role)}`, "staff-role-chip"])}" data-v-8a6a1a9d>${ssrInterpolate(roleLabel(user.role))}</span></td><td data-v-8a6a1a9d>`);
        if (user.phone) {
          _push(`<span class="staff-cell-text" data-v-8a6a1a9d>${ssrInterpolate(user.phone)}</span>`);
        } else {
          _push(`<span class="staff-cell-muted" data-v-8a6a1a9d>\u2014</span>`);
        }
        _push(`</td><td data-v-8a6a1a9d>`);
        if (branchName(user.default_branch_id)) {
          _push(`<span class="staff-cell-text" data-v-8a6a1a9d>${ssrInterpolate(branchName(user.default_branch_id))}</span>`);
        } else {
          _push(`<span class="staff-cell-muted" data-v-8a6a1a9d>Unassigned</span>`);
        }
        _push(`</td><td data-v-8a6a1a9d><span class="${ssrRenderClass([user.is_active_employee ? "staff-status--active" : "staff-status--inactive", "staff-status"])}" data-v-8a6a1a9d><span class="staff-status__dot" data-v-8a6a1a9d></span> ${ssrInterpolate(user.is_active_employee ? "Active" : "Inactive")}</span></td><td data-v-8a6a1a9d>`);
        if (user.hire_date) {
          _push(`<span class="staff-cell-text" data-v-8a6a1a9d>${ssrInterpolate(unref(fmt).date(user.hire_date))}</span>`);
        } else {
          _push(`<span class="staff-cell-muted" data-v-8a6a1a9d>\u2014</span>`);
        }
        _push(`</td><td data-v-8a6a1a9d><div class="staff-actions" data-v-8a6a1a9d><button class="staff-action-btn" title="View / Edit" data-v-8a6a1a9d>`);
        _push(ssrRenderComponent(VIcon, { size: "16" }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`mdi-pencil-outline`);
            } else {
              return [
                createTextVNode("mdi-pencil-outline")
              ];
            }
          }),
          _: 2
        }, _parent));
        _push(`</button><button class="staff-action-btn" title="Reset Password" data-v-8a6a1a9d>`);
        _push(ssrRenderComponent(VIcon, { size: "16" }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`mdi-lock-reset`);
            } else {
              return [
                createTextVNode("mdi-lock-reset")
              ];
            }
          }),
          _: 2
        }, _parent));
        _push(`</button><button class="${ssrRenderClass([user.is_active_employee ? "staff-action-btn--danger" : "staff-action-btn--success", "staff-action-btn"])}"${ssrRenderAttr("title", user.is_active_employee ? "Deactivate" : "Activate")}${ssrIncludeBooleanAttr(unref(togglingId) === user.id) ? " disabled" : ""} data-v-8a6a1a9d>`);
        _push(ssrRenderComponent(VIcon, { size: "16" }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`${ssrInterpolate(user.is_active_employee ? "mdi-account-off-outline" : "mdi-account-check-outline")}`);
            } else {
              return [
                createTextVNode(toDisplayString(user.is_active_employee ? "mdi-account-off-outline" : "mdi-account-check-outline"), 1)
              ];
            }
          }),
          _: 2
        }, _parent));
        _push(`</button><button class="staff-action-btn staff-action-btn--danger" title="Delete" data-v-8a6a1a9d>`);
        _push(ssrRenderComponent(VIcon, { size: "16" }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`mdi-delete-outline`);
            } else {
              return [
                createTextVNode("mdi-delete-outline")
              ];
            }
          }),
          _: 2
        }, _parent));
        _push(`</button></div></td></tr>`);
      });
      _push(`<!--]--></tbody></table></div>`);
      if (!unref(loading) && unref(pagination).count > 0) {
        _push(`<div class="staff-pagination" data-v-8a6a1a9d><div class="staff-pagination__info" data-v-8a6a1a9d><span class="staff-pagination__info-num" data-v-8a6a1a9d>${ssrInterpolate((unref(pagination).page - 1) * pageSize + 1)}\u2013${ssrInterpolate(Math.min(unref(pagination).page * pageSize, unref(pagination).count))}</span><span class="staff-pagination__info-sep" data-v-8a6a1a9d>of</span><span class="staff-pagination__info-total" data-v-8a6a1a9d>${ssrInterpolate(unref(pagination).count)}</span><span class="staff-pagination__info-label" data-v-8a6a1a9d>staff members</span></div><div class="staff-pagination__controls" data-v-8a6a1a9d><button class="staff-page-btn staff-page-btn--nav"${ssrIncludeBooleanAttr(unref(pagination).page <= 1) ? " disabled" : ""} data-v-8a6a1a9d>`);
        _push(ssrRenderComponent(VIcon, { size: "16" }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`mdi-chevron-left`);
            } else {
              return [
                createTextVNode("mdi-chevron-left")
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(`<span data-v-8a6a1a9d>Prev</span></button><!--[-->`);
        ssrRenderList(unref(pageNumbers), (p) => {
          _push(`<button class="${ssrRenderClass([{ "staff-page-btn--active": p === unref(pagination).page }, "staff-page-btn"])}" data-v-8a6a1a9d>${ssrInterpolate(p)}</button>`);
        });
        _push(`<!--]--><button class="staff-page-btn staff-page-btn--nav"${ssrIncludeBooleanAttr(unref(pagination).page >= unref(pagination).totalPages) ? " disabled" : ""} data-v-8a6a1a9d><span data-v-8a6a1a9d>Next</span>`);
        _push(ssrRenderComponent(VIcon, { size: "16" }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`mdi-chevron-right`);
            } else {
              return [
                createTextVNode("mdi-chevron-right")
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(`</button></div></div>`);
      } else {
        _push(`<!---->`);
      }
      _push(ssrRenderComponent(VDialog, {
        modelValue: unref(dialog),
        "onUpdate:modelValue": ($event) => isRef(dialog) ? dialog.value = $event : null,
        "max-width": "640",
        persistent: "",
        "scroll-strategy": "block"
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(ssrRenderComponent(VCard, {
              rounded: "xl",
              class: "staff-dialog"
            }, {
              default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                if (_push3) {
                  _push3(`<div class="staff-dialog__header" data-v-8a6a1a9d${_scopeId2}><div class="${ssrRenderClass([unref(editing) ? "staff-dialog__header-icon--edit" : "staff-dialog__header-icon--primary", "staff-dialog__header-icon"])}" data-v-8a6a1a9d${_scopeId2}>`);
                  _push3(ssrRenderComponent(VIcon, { size: "22" }, {
                    default: withCtx((_3, _push4, _parent4, _scopeId3) => {
                      if (_push4) {
                        _push4(`${ssrInterpolate(unref(editing) ? "mdi-pencil" : "mdi-account-plus-outline")}`);
                      } else {
                        return [
                          createTextVNode(toDisplayString(unref(editing) ? "mdi-pencil" : "mdi-account-plus-outline"), 1)
                        ];
                      }
                    }),
                    _: 1
                  }, _parent3, _scopeId2));
                  _push3(`</div><div class="flex-1" data-v-8a6a1a9d${_scopeId2}><h3 class="staff-dialog__title" data-v-8a6a1a9d${_scopeId2}>${ssrInterpolate(unref(editing) ? "Edit Staff Member" : "Add New Staff")}</h3><p class="staff-dialog__sub" data-v-8a6a1a9d${_scopeId2}>${ssrInterpolate(unref(editing) ? "Update role, branch, and profile details" : "Create a new team member account")}</p></div>`);
                  _push3(ssrRenderComponent(VBtn, {
                    icon: "mdi-close",
                    variant: "text",
                    size: "small",
                    onClick: closeDialog
                  }, null, _parent3, _scopeId2));
                  _push3(`</div>`);
                  _push3(ssrRenderComponent(VDivider, null, null, _parent3, _scopeId2));
                  _push3(`<div class="staff-dialog__avatar-section" data-v-8a6a1a9d${_scopeId2}><input type="file" accept="image/*" class="d-none" data-v-8a6a1a9d${_scopeId2}><div class="${ssrRenderClass([`staff-avatar-lg--${roleColor(unref(form).role)}`, "staff-avatar-lg"])}" data-v-8a6a1a9d${_scopeId2}>`);
                  if (unref(avatarPreview)) {
                    _push3(`<img${ssrRenderAttr("src", unref(avatarPreview))} class="staff-avatar-lg__img" data-v-8a6a1a9d${_scopeId2}>`);
                  } else {
                    _push3(`<span data-v-8a6a1a9d${_scopeId2}>${ssrInterpolate(unref(formInitials))}</span>`);
                  }
                  _push3(`<div class="staff-avatar-overlay" data-v-8a6a1a9d${_scopeId2}>`);
                  _push3(ssrRenderComponent(VIcon, {
                    size: "18",
                    color: "white"
                  }, {
                    default: withCtx((_3, _push4, _parent4, _scopeId3) => {
                      if (_push4) {
                        _push4(`mdi-camera`);
                      } else {
                        return [
                          createTextVNode("mdi-camera")
                        ];
                      }
                    }),
                    _: 1
                  }, _parent3, _scopeId2));
                  _push3(`</div></div><div class="staff-avatar-actions" data-v-8a6a1a9d${_scopeId2}>`);
                  if (unref(avatarPreview)) {
                    _push3(`<button class="staff-btn staff-btn--ghost staff-btn--sm" data-v-8a6a1a9d${_scopeId2}>`);
                    _push3(ssrRenderComponent(VIcon, { size: "14" }, {
                      default: withCtx((_3, _push4, _parent4, _scopeId3) => {
                        if (_push4) {
                          _push4(`mdi-trash-can-outline`);
                        } else {
                          return [
                            createTextVNode("mdi-trash-can-outline")
                          ];
                        }
                      }),
                      _: 1
                    }, _parent3, _scopeId2));
                    _push3(` Remove </button>`);
                  } else {
                    _push3(`<!---->`);
                  }
                  _push3(`<button class="staff-btn staff-btn--ghost staff-btn--sm" data-v-8a6a1a9d${_scopeId2}>`);
                  _push3(ssrRenderComponent(VIcon, { size: "14" }, {
                    default: withCtx((_3, _push4, _parent4, _scopeId3) => {
                      if (_push4) {
                        _push4(`mdi-upload`);
                      } else {
                        return [
                          createTextVNode("mdi-upload")
                        ];
                      }
                    }),
                    _: 1
                  }, _parent3, _scopeId2));
                  _push3(` ${ssrInterpolate(unref(avatarPreview) ? "Change" : "Upload")} Photo </button></div></div><div class="staff-dialog__body" data-v-8a6a1a9d${_scopeId2}><div class="staff-form-row" data-v-8a6a1a9d${_scopeId2}><div class="staff-field" data-v-8a6a1a9d${_scopeId2}><label class="staff-field__label" data-v-8a6a1a9d${_scopeId2}>First Name</label><input${ssrRenderAttr("value", unref(form).first_name)} class="staff-field__input" placeholder="John" data-v-8a6a1a9d${_scopeId2}></div><div class="staff-field" data-v-8a6a1a9d${_scopeId2}><label class="staff-field__label" data-v-8a6a1a9d${_scopeId2}>Last Name</label><input${ssrRenderAttr("value", unref(form).last_name)} class="staff-field__input" placeholder="Doe" data-v-8a6a1a9d${_scopeId2}></div></div><div class="staff-field" data-v-8a6a1a9d${_scopeId2}><label class="staff-field__label" data-v-8a6a1a9d${_scopeId2}>Email</label><input${ssrRenderAttr("value", unref(form).email)} class="staff-field__input" type="email" placeholder="john@domendra.com"${ssrIncludeBooleanAttr(unref(editing)) ? " disabled" : ""} data-v-8a6a1a9d${_scopeId2}></div><div class="staff-form-row" data-v-8a6a1a9d${_scopeId2}><div class="staff-field" data-v-8a6a1a9d${_scopeId2}><label class="staff-field__label" data-v-8a6a1a9d${_scopeId2}>Phone</label><input${ssrRenderAttr("value", unref(form).phone)} class="staff-field__input" placeholder="+254700000000" data-v-8a6a1a9d${_scopeId2}></div><div class="staff-field" data-v-8a6a1a9d${_scopeId2}><label class="staff-field__label" data-v-8a6a1a9d${_scopeId2}>Employee ID</label><input${ssrRenderAttr("value", unref(form).employee_id)} class="staff-field__input" placeholder="EMP-001" data-v-8a6a1a9d${_scopeId2}></div></div><div class="staff-form-row" data-v-8a6a1a9d${_scopeId2}><div class="staff-field" data-v-8a6a1a9d${_scopeId2}><label class="staff-field__label" data-v-8a6a1a9d${_scopeId2}>Role</label><select class="staff-field__input" data-v-8a6a1a9d${_scopeId2}><!--[-->`);
                  ssrRenderList(roleOptions, (r) => {
                    _push3(`<option${ssrRenderAttr("value", r.value)} data-v-8a6a1a9d${ssrIncludeBooleanAttr(Array.isArray(unref(form).role) ? ssrLooseContain(unref(form).role, r.value) : ssrLooseEqual(unref(form).role, r.value)) ? " selected" : ""}${_scopeId2}>${ssrInterpolate(r.label)}</option>`);
                  });
                  _push3(`<!--]--></select></div><div class="staff-field" data-v-8a6a1a9d${_scopeId2}><label class="staff-field__label" data-v-8a6a1a9d${_scopeId2}>Default Branch</label><select class="staff-field__input" data-v-8a6a1a9d${_scopeId2}><option${ssrRenderAttr("value", null)} data-v-8a6a1a9d${ssrIncludeBooleanAttr(Array.isArray(unref(form).default_branch_id) ? ssrLooseContain(unref(form).default_branch_id, null) : ssrLooseEqual(unref(form).default_branch_id, null)) ? " selected" : ""}${_scopeId2}>Unassigned</option><!--[-->`);
                  ssrRenderList(unref(branches), (b) => {
                    _push3(`<option${ssrRenderAttr("value", b.id)} data-v-8a6a1a9d${ssrIncludeBooleanAttr(Array.isArray(unref(form).default_branch_id) ? ssrLooseContain(unref(form).default_branch_id, b.id) : ssrLooseEqual(unref(form).default_branch_id, b.id)) ? " selected" : ""}${_scopeId2}>${ssrInterpolate(b.name)}</option>`);
                  });
                  _push3(`<!--]--></select></div></div><div class="staff-form-row" data-v-8a6a1a9d${_scopeId2}><div class="staff-field" data-v-8a6a1a9d${_scopeId2}><label class="staff-field__label" data-v-8a6a1a9d${_scopeId2}>Hire Date</label><input${ssrRenderAttr("value", unref(form).hire_date)} class="staff-field__input" type="date" data-v-8a6a1a9d${_scopeId2}></div>`);
                  if (unref(editing)) {
                    _push3(`<div class="staff-field" data-v-8a6a1a9d${_scopeId2}><label class="staff-field__label" data-v-8a6a1a9d${_scopeId2}>Termination Date</label><input${ssrRenderAttr("value", unref(form).termination_date)} class="staff-field__input" type="date" data-v-8a6a1a9d${_scopeId2}></div>`);
                  } else {
                    _push3(`<div class="staff-field" data-v-8a6a1a9d${_scopeId2}><label class="staff-field__label" data-v-8a6a1a9d${_scopeId2}>Password</label><input${ssrRenderAttr("value", unref(form).password)} class="staff-field__input" type="password" placeholder="Min 8 characters" data-v-8a6a1a9d${_scopeId2}></div>`);
                  }
                  _push3(`</div>`);
                  if (unref(editing)) {
                    _push3(`<div class="staff-field staff-field--toggle" data-v-8a6a1a9d${_scopeId2}><label class="staff-toggle-row" data-v-8a6a1a9d${_scopeId2}><input type="checkbox"${ssrIncludeBooleanAttr(Array.isArray(unref(form).is_active_employee) ? ssrLooseContain(unref(form).is_active_employee, null) : unref(form).is_active_employee) ? " checked" : ""} class="staff-checkbox" data-v-8a6a1a9d${_scopeId2}><span class="staff-toggle-label" data-v-8a6a1a9d${_scopeId2}>Active Employee</span><span class="staff-toggle-desc" data-v-8a6a1a9d${_scopeId2}>When unchecked, this user cannot log in</span></label></div>`);
                  } else {
                    _push3(`<!---->`);
                  }
                  if (unref(formError)) {
                    _push3(`<div class="staff-form-error" data-v-8a6a1a9d${_scopeId2}>`);
                    _push3(ssrRenderComponent(VIcon, { size: "14" }, {
                      default: withCtx((_3, _push4, _parent4, _scopeId3) => {
                        if (_push4) {
                          _push4(`mdi-alert-circle`);
                        } else {
                          return [
                            createTextVNode("mdi-alert-circle")
                          ];
                        }
                      }),
                      _: 1
                    }, _parent3, _scopeId2));
                    _push3(` ${ssrInterpolate(unref(formError))}</div>`);
                  } else {
                    _push3(`<!---->`);
                  }
                  _push3(`</div>`);
                  _push3(ssrRenderComponent(VDivider, null, null, _parent3, _scopeId2));
                  _push3(`<div class="staff-dialog__footer" data-v-8a6a1a9d${_scopeId2}><button class="staff-btn staff-btn--ghost" data-v-8a6a1a9d${_scopeId2}>Cancel</button><button class="staff-btn staff-btn--primary"${ssrIncludeBooleanAttr(unref(saving)) ? " disabled" : ""} data-v-8a6a1a9d${_scopeId2}>`);
                  if (unref(saving)) {
                    _push3(ssrRenderComponent(VProgressCircular, {
                      indeterminate: "",
                      size: "16",
                      width: "2",
                      color: "white",
                      class: "mr-2"
                    }, null, _parent3, _scopeId2));
                  } else {
                    _push3(`<!---->`);
                  }
                  _push3(` ${ssrInterpolate(unref(editing) ? "Save Changes" : "Create Staff")}</button></div>`);
                } else {
                  return [
                    createVNode("div", { class: "staff-dialog__header" }, [
                      createVNode("div", {
                        class: ["staff-dialog__header-icon", unref(editing) ? "staff-dialog__header-icon--edit" : "staff-dialog__header-icon--primary"]
                      }, [
                        createVNode(VIcon, { size: "22" }, {
                          default: withCtx(() => [
                            createTextVNode(toDisplayString(unref(editing) ? "mdi-pencil" : "mdi-account-plus-outline"), 1)
                          ]),
                          _: 1
                        })
                      ], 2),
                      createVNode("div", { class: "flex-1" }, [
                        createVNode("h3", { class: "staff-dialog__title" }, toDisplayString(unref(editing) ? "Edit Staff Member" : "Add New Staff"), 1),
                        createVNode("p", { class: "staff-dialog__sub" }, toDisplayString(unref(editing) ? "Update role, branch, and profile details" : "Create a new team member account"), 1)
                      ]),
                      createVNode(VBtn, {
                        icon: "mdi-close",
                        variant: "text",
                        size: "small",
                        onClick: closeDialog
                      })
                    ]),
                    createVNode(VDivider),
                    createVNode("div", { class: "staff-dialog__avatar-section" }, [
                      createVNode("input", {
                        ref_key: "avatarInput",
                        ref: avatarInput,
                        type: "file",
                        accept: "image/*",
                        class: "d-none",
                        onChange: onAvatarSelected
                      }, null, 544),
                      createVNode("div", {
                        class: ["staff-avatar-lg", `staff-avatar-lg--${roleColor(unref(form).role)}`],
                        onClick: triggerAvatarInput
                      }, [
                        unref(avatarPreview) ? (openBlock(), createBlock("img", {
                          key: 0,
                          src: unref(avatarPreview),
                          class: "staff-avatar-lg__img"
                        }, null, 8, ["src"])) : (openBlock(), createBlock("span", { key: 1 }, toDisplayString(unref(formInitials)), 1)),
                        createVNode("div", { class: "staff-avatar-overlay" }, [
                          createVNode(VIcon, {
                            size: "18",
                            color: "white"
                          }, {
                            default: withCtx(() => [
                              createTextVNode("mdi-camera")
                            ]),
                            _: 1
                          })
                        ])
                      ], 2),
                      createVNode("div", { class: "staff-avatar-actions" }, [
                        unref(avatarPreview) ? (openBlock(), createBlock("button", {
                          key: 0,
                          class: "staff-btn staff-btn--ghost staff-btn--sm",
                          onClick: removeAvatar
                        }, [
                          createVNode(VIcon, { size: "14" }, {
                            default: withCtx(() => [
                              createTextVNode("mdi-trash-can-outline")
                            ]),
                            _: 1
                          }),
                          createTextVNode(" Remove ")
                        ])) : createCommentVNode("", true),
                        createVNode("button", {
                          class: "staff-btn staff-btn--ghost staff-btn--sm",
                          onClick: triggerAvatarInput
                        }, [
                          createVNode(VIcon, { size: "14" }, {
                            default: withCtx(() => [
                              createTextVNode("mdi-upload")
                            ]),
                            _: 1
                          }),
                          createTextVNode(" " + toDisplayString(unref(avatarPreview) ? "Change" : "Upload") + " Photo ", 1)
                        ])
                      ])
                    ]),
                    createVNode("div", { class: "staff-dialog__body" }, [
                      createVNode("div", { class: "staff-form-row" }, [
                        createVNode("div", { class: "staff-field" }, [
                          createVNode("label", { class: "staff-field__label" }, "First Name"),
                          withDirectives(createVNode("input", {
                            "onUpdate:modelValue": ($event) => unref(form).first_name = $event,
                            class: "staff-field__input",
                            placeholder: "John"
                          }, null, 8, ["onUpdate:modelValue"]), [
                            [vModelText, unref(form).first_name]
                          ])
                        ]),
                        createVNode("div", { class: "staff-field" }, [
                          createVNode("label", { class: "staff-field__label" }, "Last Name"),
                          withDirectives(createVNode("input", {
                            "onUpdate:modelValue": ($event) => unref(form).last_name = $event,
                            class: "staff-field__input",
                            placeholder: "Doe"
                          }, null, 8, ["onUpdate:modelValue"]), [
                            [vModelText, unref(form).last_name]
                          ])
                        ])
                      ]),
                      createVNode("div", { class: "staff-field" }, [
                        createVNode("label", { class: "staff-field__label" }, "Email"),
                        withDirectives(createVNode("input", {
                          "onUpdate:modelValue": ($event) => unref(form).email = $event,
                          class: "staff-field__input",
                          type: "email",
                          placeholder: "john@domendra.com",
                          disabled: unref(editing)
                        }, null, 8, ["onUpdate:modelValue", "disabled"]), [
                          [vModelText, unref(form).email]
                        ])
                      ]),
                      createVNode("div", { class: "staff-form-row" }, [
                        createVNode("div", { class: "staff-field" }, [
                          createVNode("label", { class: "staff-field__label" }, "Phone"),
                          withDirectives(createVNode("input", {
                            "onUpdate:modelValue": ($event) => unref(form).phone = $event,
                            class: "staff-field__input",
                            placeholder: "+254700000000"
                          }, null, 8, ["onUpdate:modelValue"]), [
                            [vModelText, unref(form).phone]
                          ])
                        ]),
                        createVNode("div", { class: "staff-field" }, [
                          createVNode("label", { class: "staff-field__label" }, "Employee ID"),
                          withDirectives(createVNode("input", {
                            "onUpdate:modelValue": ($event) => unref(form).employee_id = $event,
                            class: "staff-field__input",
                            placeholder: "EMP-001"
                          }, null, 8, ["onUpdate:modelValue"]), [
                            [vModelText, unref(form).employee_id]
                          ])
                        ])
                      ]),
                      createVNode("div", { class: "staff-form-row" }, [
                        createVNode("div", { class: "staff-field" }, [
                          createVNode("label", { class: "staff-field__label" }, "Role"),
                          withDirectives(createVNode("select", {
                            "onUpdate:modelValue": ($event) => unref(form).role = $event,
                            class: "staff-field__input"
                          }, [
                            (openBlock(), createBlock(Fragment, null, renderList(roleOptions, (r) => {
                              return createVNode("option", {
                                key: r.value,
                                value: r.value
                              }, toDisplayString(r.label), 9, ["value"]);
                            }), 64))
                          ], 8, ["onUpdate:modelValue"]), [
                            [vModelSelect, unref(form).role]
                          ])
                        ]),
                        createVNode("div", { class: "staff-field" }, [
                          createVNode("label", { class: "staff-field__label" }, "Default Branch"),
                          withDirectives(createVNode("select", {
                            "onUpdate:modelValue": ($event) => unref(form).default_branch_id = $event,
                            class: "staff-field__input"
                          }, [
                            createVNode("option", { value: null }, "Unassigned"),
                            (openBlock(true), createBlock(Fragment, null, renderList(unref(branches), (b) => {
                              return openBlock(), createBlock("option", {
                                key: b.id,
                                value: b.id
                              }, toDisplayString(b.name), 9, ["value"]);
                            }), 128))
                          ], 8, ["onUpdate:modelValue"]), [
                            [vModelSelect, unref(form).default_branch_id]
                          ])
                        ])
                      ]),
                      createVNode("div", { class: "staff-form-row" }, [
                        createVNode("div", { class: "staff-field" }, [
                          createVNode("label", { class: "staff-field__label" }, "Hire Date"),
                          withDirectives(createVNode("input", {
                            "onUpdate:modelValue": ($event) => unref(form).hire_date = $event,
                            class: "staff-field__input",
                            type: "date"
                          }, null, 8, ["onUpdate:modelValue"]), [
                            [vModelText, unref(form).hire_date]
                          ])
                        ]),
                        unref(editing) ? (openBlock(), createBlock("div", {
                          key: 0,
                          class: "staff-field"
                        }, [
                          createVNode("label", { class: "staff-field__label" }, "Termination Date"),
                          withDirectives(createVNode("input", {
                            "onUpdate:modelValue": ($event) => unref(form).termination_date = $event,
                            class: "staff-field__input",
                            type: "date"
                          }, null, 8, ["onUpdate:modelValue"]), [
                            [vModelText, unref(form).termination_date]
                          ])
                        ])) : (openBlock(), createBlock("div", {
                          key: 1,
                          class: "staff-field"
                        }, [
                          createVNode("label", { class: "staff-field__label" }, "Password"),
                          withDirectives(createVNode("input", {
                            "onUpdate:modelValue": ($event) => unref(form).password = $event,
                            class: "staff-field__input",
                            type: "password",
                            placeholder: "Min 8 characters"
                          }, null, 8, ["onUpdate:modelValue"]), [
                            [vModelText, unref(form).password]
                          ])
                        ]))
                      ]),
                      unref(editing) ? (openBlock(), createBlock("div", {
                        key: 0,
                        class: "staff-field staff-field--toggle"
                      }, [
                        createVNode("label", { class: "staff-toggle-row" }, [
                          withDirectives(createVNode("input", {
                            type: "checkbox",
                            "onUpdate:modelValue": ($event) => unref(form).is_active_employee = $event,
                            class: "staff-checkbox"
                          }, null, 8, ["onUpdate:modelValue"]), [
                            [vModelCheckbox, unref(form).is_active_employee]
                          ]),
                          createVNode("span", { class: "staff-toggle-label" }, "Active Employee"),
                          createVNode("span", { class: "staff-toggle-desc" }, "When unchecked, this user cannot log in")
                        ])
                      ])) : createCommentVNode("", true),
                      unref(formError) ? (openBlock(), createBlock("div", {
                        key: 1,
                        class: "staff-form-error"
                      }, [
                        createVNode(VIcon, { size: "14" }, {
                          default: withCtx(() => [
                            createTextVNode("mdi-alert-circle")
                          ]),
                          _: 1
                        }),
                        createTextVNode(" " + toDisplayString(unref(formError)), 1)
                      ])) : createCommentVNode("", true)
                    ]),
                    createVNode(VDivider),
                    createVNode("div", { class: "staff-dialog__footer" }, [
                      createVNode("button", {
                        class: "staff-btn staff-btn--ghost",
                        onClick: closeDialog
                      }, "Cancel"),
                      createVNode("button", {
                        class: "staff-btn staff-btn--primary",
                        disabled: unref(saving),
                        onClick: saveStaff
                      }, [
                        unref(saving) ? (openBlock(), createBlock(VProgressCircular, {
                          key: 0,
                          indeterminate: "",
                          size: "16",
                          width: "2",
                          color: "white",
                          class: "mr-2"
                        })) : createCommentVNode("", true),
                        createTextVNode(" " + toDisplayString(unref(editing) ? "Save Changes" : "Create Staff"), 1)
                      ], 8, ["disabled"])
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
                class: "staff-dialog"
              }, {
                default: withCtx(() => [
                  createVNode("div", { class: "staff-dialog__header" }, [
                    createVNode("div", {
                      class: ["staff-dialog__header-icon", unref(editing) ? "staff-dialog__header-icon--edit" : "staff-dialog__header-icon--primary"]
                    }, [
                      createVNode(VIcon, { size: "22" }, {
                        default: withCtx(() => [
                          createTextVNode(toDisplayString(unref(editing) ? "mdi-pencil" : "mdi-account-plus-outline"), 1)
                        ]),
                        _: 1
                      })
                    ], 2),
                    createVNode("div", { class: "flex-1" }, [
                      createVNode("h3", { class: "staff-dialog__title" }, toDisplayString(unref(editing) ? "Edit Staff Member" : "Add New Staff"), 1),
                      createVNode("p", { class: "staff-dialog__sub" }, toDisplayString(unref(editing) ? "Update role, branch, and profile details" : "Create a new team member account"), 1)
                    ]),
                    createVNode(VBtn, {
                      icon: "mdi-close",
                      variant: "text",
                      size: "small",
                      onClick: closeDialog
                    })
                  ]),
                  createVNode(VDivider),
                  createVNode("div", { class: "staff-dialog__avatar-section" }, [
                    createVNode("input", {
                      ref_key: "avatarInput",
                      ref: avatarInput,
                      type: "file",
                      accept: "image/*",
                      class: "d-none",
                      onChange: onAvatarSelected
                    }, null, 544),
                    createVNode("div", {
                      class: ["staff-avatar-lg", `staff-avatar-lg--${roleColor(unref(form).role)}`],
                      onClick: triggerAvatarInput
                    }, [
                      unref(avatarPreview) ? (openBlock(), createBlock("img", {
                        key: 0,
                        src: unref(avatarPreview),
                        class: "staff-avatar-lg__img"
                      }, null, 8, ["src"])) : (openBlock(), createBlock("span", { key: 1 }, toDisplayString(unref(formInitials)), 1)),
                      createVNode("div", { class: "staff-avatar-overlay" }, [
                        createVNode(VIcon, {
                          size: "18",
                          color: "white"
                        }, {
                          default: withCtx(() => [
                            createTextVNode("mdi-camera")
                          ]),
                          _: 1
                        })
                      ])
                    ], 2),
                    createVNode("div", { class: "staff-avatar-actions" }, [
                      unref(avatarPreview) ? (openBlock(), createBlock("button", {
                        key: 0,
                        class: "staff-btn staff-btn--ghost staff-btn--sm",
                        onClick: removeAvatar
                      }, [
                        createVNode(VIcon, { size: "14" }, {
                          default: withCtx(() => [
                            createTextVNode("mdi-trash-can-outline")
                          ]),
                          _: 1
                        }),
                        createTextVNode(" Remove ")
                      ])) : createCommentVNode("", true),
                      createVNode("button", {
                        class: "staff-btn staff-btn--ghost staff-btn--sm",
                        onClick: triggerAvatarInput
                      }, [
                        createVNode(VIcon, { size: "14" }, {
                          default: withCtx(() => [
                            createTextVNode("mdi-upload")
                          ]),
                          _: 1
                        }),
                        createTextVNode(" " + toDisplayString(unref(avatarPreview) ? "Change" : "Upload") + " Photo ", 1)
                      ])
                    ])
                  ]),
                  createVNode("div", { class: "staff-dialog__body" }, [
                    createVNode("div", { class: "staff-form-row" }, [
                      createVNode("div", { class: "staff-field" }, [
                        createVNode("label", { class: "staff-field__label" }, "First Name"),
                        withDirectives(createVNode("input", {
                          "onUpdate:modelValue": ($event) => unref(form).first_name = $event,
                          class: "staff-field__input",
                          placeholder: "John"
                        }, null, 8, ["onUpdate:modelValue"]), [
                          [vModelText, unref(form).first_name]
                        ])
                      ]),
                      createVNode("div", { class: "staff-field" }, [
                        createVNode("label", { class: "staff-field__label" }, "Last Name"),
                        withDirectives(createVNode("input", {
                          "onUpdate:modelValue": ($event) => unref(form).last_name = $event,
                          class: "staff-field__input",
                          placeholder: "Doe"
                        }, null, 8, ["onUpdate:modelValue"]), [
                          [vModelText, unref(form).last_name]
                        ])
                      ])
                    ]),
                    createVNode("div", { class: "staff-field" }, [
                      createVNode("label", { class: "staff-field__label" }, "Email"),
                      withDirectives(createVNode("input", {
                        "onUpdate:modelValue": ($event) => unref(form).email = $event,
                        class: "staff-field__input",
                        type: "email",
                        placeholder: "john@domendra.com",
                        disabled: unref(editing)
                      }, null, 8, ["onUpdate:modelValue", "disabled"]), [
                        [vModelText, unref(form).email]
                      ])
                    ]),
                    createVNode("div", { class: "staff-form-row" }, [
                      createVNode("div", { class: "staff-field" }, [
                        createVNode("label", { class: "staff-field__label" }, "Phone"),
                        withDirectives(createVNode("input", {
                          "onUpdate:modelValue": ($event) => unref(form).phone = $event,
                          class: "staff-field__input",
                          placeholder: "+254700000000"
                        }, null, 8, ["onUpdate:modelValue"]), [
                          [vModelText, unref(form).phone]
                        ])
                      ]),
                      createVNode("div", { class: "staff-field" }, [
                        createVNode("label", { class: "staff-field__label" }, "Employee ID"),
                        withDirectives(createVNode("input", {
                          "onUpdate:modelValue": ($event) => unref(form).employee_id = $event,
                          class: "staff-field__input",
                          placeholder: "EMP-001"
                        }, null, 8, ["onUpdate:modelValue"]), [
                          [vModelText, unref(form).employee_id]
                        ])
                      ])
                    ]),
                    createVNode("div", { class: "staff-form-row" }, [
                      createVNode("div", { class: "staff-field" }, [
                        createVNode("label", { class: "staff-field__label" }, "Role"),
                        withDirectives(createVNode("select", {
                          "onUpdate:modelValue": ($event) => unref(form).role = $event,
                          class: "staff-field__input"
                        }, [
                          (openBlock(), createBlock(Fragment, null, renderList(roleOptions, (r) => {
                            return createVNode("option", {
                              key: r.value,
                              value: r.value
                            }, toDisplayString(r.label), 9, ["value"]);
                          }), 64))
                        ], 8, ["onUpdate:modelValue"]), [
                          [vModelSelect, unref(form).role]
                        ])
                      ]),
                      createVNode("div", { class: "staff-field" }, [
                        createVNode("label", { class: "staff-field__label" }, "Default Branch"),
                        withDirectives(createVNode("select", {
                          "onUpdate:modelValue": ($event) => unref(form).default_branch_id = $event,
                          class: "staff-field__input"
                        }, [
                          createVNode("option", { value: null }, "Unassigned"),
                          (openBlock(true), createBlock(Fragment, null, renderList(unref(branches), (b) => {
                            return openBlock(), createBlock("option", {
                              key: b.id,
                              value: b.id
                            }, toDisplayString(b.name), 9, ["value"]);
                          }), 128))
                        ], 8, ["onUpdate:modelValue"]), [
                          [vModelSelect, unref(form).default_branch_id]
                        ])
                      ])
                    ]),
                    createVNode("div", { class: "staff-form-row" }, [
                      createVNode("div", { class: "staff-field" }, [
                        createVNode("label", { class: "staff-field__label" }, "Hire Date"),
                        withDirectives(createVNode("input", {
                          "onUpdate:modelValue": ($event) => unref(form).hire_date = $event,
                          class: "staff-field__input",
                          type: "date"
                        }, null, 8, ["onUpdate:modelValue"]), [
                          [vModelText, unref(form).hire_date]
                        ])
                      ]),
                      unref(editing) ? (openBlock(), createBlock("div", {
                        key: 0,
                        class: "staff-field"
                      }, [
                        createVNode("label", { class: "staff-field__label" }, "Termination Date"),
                        withDirectives(createVNode("input", {
                          "onUpdate:modelValue": ($event) => unref(form).termination_date = $event,
                          class: "staff-field__input",
                          type: "date"
                        }, null, 8, ["onUpdate:modelValue"]), [
                          [vModelText, unref(form).termination_date]
                        ])
                      ])) : (openBlock(), createBlock("div", {
                        key: 1,
                        class: "staff-field"
                      }, [
                        createVNode("label", { class: "staff-field__label" }, "Password"),
                        withDirectives(createVNode("input", {
                          "onUpdate:modelValue": ($event) => unref(form).password = $event,
                          class: "staff-field__input",
                          type: "password",
                          placeholder: "Min 8 characters"
                        }, null, 8, ["onUpdate:modelValue"]), [
                          [vModelText, unref(form).password]
                        ])
                      ]))
                    ]),
                    unref(editing) ? (openBlock(), createBlock("div", {
                      key: 0,
                      class: "staff-field staff-field--toggle"
                    }, [
                      createVNode("label", { class: "staff-toggle-row" }, [
                        withDirectives(createVNode("input", {
                          type: "checkbox",
                          "onUpdate:modelValue": ($event) => unref(form).is_active_employee = $event,
                          class: "staff-checkbox"
                        }, null, 8, ["onUpdate:modelValue"]), [
                          [vModelCheckbox, unref(form).is_active_employee]
                        ]),
                        createVNode("span", { class: "staff-toggle-label" }, "Active Employee"),
                        createVNode("span", { class: "staff-toggle-desc" }, "When unchecked, this user cannot log in")
                      ])
                    ])) : createCommentVNode("", true),
                    unref(formError) ? (openBlock(), createBlock("div", {
                      key: 1,
                      class: "staff-form-error"
                    }, [
                      createVNode(VIcon, { size: "14" }, {
                        default: withCtx(() => [
                          createTextVNode("mdi-alert-circle")
                        ]),
                        _: 1
                      }),
                      createTextVNode(" " + toDisplayString(unref(formError)), 1)
                    ])) : createCommentVNode("", true)
                  ]),
                  createVNode(VDivider),
                  createVNode("div", { class: "staff-dialog__footer" }, [
                    createVNode("button", {
                      class: "staff-btn staff-btn--ghost",
                      onClick: closeDialog
                    }, "Cancel"),
                    createVNode("button", {
                      class: "staff-btn staff-btn--primary",
                      disabled: unref(saving),
                      onClick: saveStaff
                    }, [
                      unref(saving) ? (openBlock(), createBlock(VProgressCircular, {
                        key: 0,
                        indeterminate: "",
                        size: "16",
                        width: "2",
                        color: "white",
                        class: "mr-2"
                      })) : createCommentVNode("", true),
                      createTextVNode(" " + toDisplayString(unref(editing) ? "Save Changes" : "Create Staff"), 1)
                    ], 8, ["disabled"])
                  ])
                ]),
                _: 1
              })
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(ssrRenderComponent(VDialog, {
        modelValue: unref(resetPwDialog),
        "onUpdate:modelValue": ($event) => isRef(resetPwDialog) ? resetPwDialog.value = $event : null,
        "max-width": "480",
        persistent: "",
        "scroll-strategy": "block"
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(ssrRenderComponent(VCard, {
              rounded: "xl",
              class: "staff-dialog"
            }, {
              default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                var _a, _b, _c, _d;
                if (_push3) {
                  _push3(`<div class="staff-dialog__header" data-v-8a6a1a9d${_scopeId2}><div class="staff-dialog__header-icon staff-dialog__header-icon--primary" data-v-8a6a1a9d${_scopeId2}>`);
                  _push3(ssrRenderComponent(VIcon, { size: "22" }, {
                    default: withCtx((_3, _push4, _parent4, _scopeId3) => {
                      if (_push4) {
                        _push4(`mdi-lock-reset`);
                      } else {
                        return [
                          createTextVNode("mdi-lock-reset")
                        ];
                      }
                    }),
                    _: 1
                  }, _parent3, _scopeId2));
                  _push3(`</div><div class="flex-1" data-v-8a6a1a9d${_scopeId2}><h3 class="staff-dialog__title" data-v-8a6a1a9d${_scopeId2}>Reset Password</h3><p class="staff-dialog__sub" data-v-8a6a1a9d${_scopeId2}>Set a new password for ${ssrInterpolate((_a = unref(resetPwTarget)) == null ? void 0 : _a.first_name)} ${ssrInterpolate((_b = unref(resetPwTarget)) == null ? void 0 : _b.last_name)}</p></div>`);
                  _push3(ssrRenderComponent(VBtn, {
                    icon: "mdi-close",
                    variant: "text",
                    size: "small",
                    onClick: ($event) => resetPwDialog.value = false
                  }, null, _parent3, _scopeId2));
                  _push3(`</div>`);
                  _push3(ssrRenderComponent(VDivider, null, null, _parent3, _scopeId2));
                  _push3(`<div class="staff-dialog__body" data-v-8a6a1a9d${_scopeId2}><div class="staff-field" data-v-8a6a1a9d${_scopeId2}><label class="staff-field__label" data-v-8a6a1a9d${_scopeId2}>New Password</label><input${ssrRenderAttr("value", unref(resetPwForm).new_password)} class="staff-field__input" type="password" placeholder="Min 8 characters" data-v-8a6a1a9d${_scopeId2}></div><div class="staff-field" data-v-8a6a1a9d${_scopeId2}><label class="staff-field__label" data-v-8a6a1a9d${_scopeId2}>Confirm Password</label><input${ssrRenderAttr("value", unref(resetPwForm).confirm)} class="staff-field__input" type="password" placeholder="Re-enter new password" data-v-8a6a1a9d${_scopeId2}></div>`);
                  if (unref(resetPwError)) {
                    _push3(`<p class="staff-form-error" data-v-8a6a1a9d${_scopeId2}>`);
                    _push3(ssrRenderComponent(VIcon, { size: "14" }, {
                      default: withCtx((_3, _push4, _parent4, _scopeId3) => {
                        if (_push4) {
                          _push4(`mdi-alert-circle`);
                        } else {
                          return [
                            createTextVNode("mdi-alert-circle")
                          ];
                        }
                      }),
                      _: 1
                    }, _parent3, _scopeId2));
                    _push3(` ${ssrInterpolate(unref(resetPwError))}</p>`);
                  } else {
                    _push3(`<!---->`);
                  }
                  _push3(`</div>`);
                  _push3(ssrRenderComponent(VDivider, null, null, _parent3, _scopeId2));
                  _push3(`<div class="staff-dialog__footer" data-v-8a6a1a9d${_scopeId2}><button class="staff-btn staff-btn--ghost" data-v-8a6a1a9d${_scopeId2}>Cancel</button><button class="staff-btn staff-btn--primary"${ssrIncludeBooleanAttr(unref(resettingPw)) ? " disabled" : ""} data-v-8a6a1a9d${_scopeId2}>`);
                  if (unref(resettingPw)) {
                    _push3(ssrRenderComponent(VProgressCircular, {
                      indeterminate: "",
                      size: "16",
                      width: "2",
                      color: "white",
                      class: "mr-2"
                    }, null, _parent3, _scopeId2));
                  } else {
                    _push3(`<!---->`);
                  }
                  _push3(` Reset Password </button></div>`);
                } else {
                  return [
                    createVNode("div", { class: "staff-dialog__header" }, [
                      createVNode("div", { class: "staff-dialog__header-icon staff-dialog__header-icon--primary" }, [
                        createVNode(VIcon, { size: "22" }, {
                          default: withCtx(() => [
                            createTextVNode("mdi-lock-reset")
                          ]),
                          _: 1
                        })
                      ]),
                      createVNode("div", { class: "flex-1" }, [
                        createVNode("h3", { class: "staff-dialog__title" }, "Reset Password"),
                        createVNode("p", { class: "staff-dialog__sub" }, "Set a new password for " + toDisplayString((_c = unref(resetPwTarget)) == null ? void 0 : _c.first_name) + " " + toDisplayString((_d = unref(resetPwTarget)) == null ? void 0 : _d.last_name), 1)
                      ]),
                      createVNode(VBtn, {
                        icon: "mdi-close",
                        variant: "text",
                        size: "small",
                        onClick: ($event) => resetPwDialog.value = false
                      }, null, 8, ["onClick"])
                    ]),
                    createVNode(VDivider),
                    createVNode("div", { class: "staff-dialog__body" }, [
                      createVNode("div", { class: "staff-field" }, [
                        createVNode("label", { class: "staff-field__label" }, "New Password"),
                        withDirectives(createVNode("input", {
                          "onUpdate:modelValue": ($event) => unref(resetPwForm).new_password = $event,
                          class: "staff-field__input",
                          type: "password",
                          placeholder: "Min 8 characters"
                        }, null, 8, ["onUpdate:modelValue"]), [
                          [vModelText, unref(resetPwForm).new_password]
                        ])
                      ]),
                      createVNode("div", { class: "staff-field" }, [
                        createVNode("label", { class: "staff-field__label" }, "Confirm Password"),
                        withDirectives(createVNode("input", {
                          "onUpdate:modelValue": ($event) => unref(resetPwForm).confirm = $event,
                          class: "staff-field__input",
                          type: "password",
                          placeholder: "Re-enter new password"
                        }, null, 8, ["onUpdate:modelValue"]), [
                          [vModelText, unref(resetPwForm).confirm]
                        ])
                      ]),
                      unref(resetPwError) ? (openBlock(), createBlock("p", {
                        key: 0,
                        class: "staff-form-error"
                      }, [
                        createVNode(VIcon, { size: "14" }, {
                          default: withCtx(() => [
                            createTextVNode("mdi-alert-circle")
                          ]),
                          _: 1
                        }),
                        createTextVNode(" " + toDisplayString(unref(resetPwError)), 1)
                      ])) : createCommentVNode("", true)
                    ]),
                    createVNode(VDivider),
                    createVNode("div", { class: "staff-dialog__footer" }, [
                      createVNode("button", {
                        class: "staff-btn staff-btn--ghost",
                        onClick: ($event) => resetPwDialog.value = false
                      }, "Cancel", 8, ["onClick"]),
                      createVNode("button", {
                        class: "staff-btn staff-btn--primary",
                        disabled: unref(resettingPw),
                        onClick: doResetPw
                      }, [
                        unref(resettingPw) ? (openBlock(), createBlock(VProgressCircular, {
                          key: 0,
                          indeterminate: "",
                          size: "16",
                          width: "2",
                          color: "white",
                          class: "mr-2"
                        })) : createCommentVNode("", true),
                        createTextVNode(" Reset Password ")
                      ], 8, ["disabled"])
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
                class: "staff-dialog"
              }, {
                default: withCtx(() => {
                  var _a, _b;
                  return [
                    createVNode("div", { class: "staff-dialog__header" }, [
                      createVNode("div", { class: "staff-dialog__header-icon staff-dialog__header-icon--primary" }, [
                        createVNode(VIcon, { size: "22" }, {
                          default: withCtx(() => [
                            createTextVNode("mdi-lock-reset")
                          ]),
                          _: 1
                        })
                      ]),
                      createVNode("div", { class: "flex-1" }, [
                        createVNode("h3", { class: "staff-dialog__title" }, "Reset Password"),
                        createVNode("p", { class: "staff-dialog__sub" }, "Set a new password for " + toDisplayString((_a = unref(resetPwTarget)) == null ? void 0 : _a.first_name) + " " + toDisplayString((_b = unref(resetPwTarget)) == null ? void 0 : _b.last_name), 1)
                      ]),
                      createVNode(VBtn, {
                        icon: "mdi-close",
                        variant: "text",
                        size: "small",
                        onClick: ($event) => resetPwDialog.value = false
                      }, null, 8, ["onClick"])
                    ]),
                    createVNode(VDivider),
                    createVNode("div", { class: "staff-dialog__body" }, [
                      createVNode("div", { class: "staff-field" }, [
                        createVNode("label", { class: "staff-field__label" }, "New Password"),
                        withDirectives(createVNode("input", {
                          "onUpdate:modelValue": ($event) => unref(resetPwForm).new_password = $event,
                          class: "staff-field__input",
                          type: "password",
                          placeholder: "Min 8 characters"
                        }, null, 8, ["onUpdate:modelValue"]), [
                          [vModelText, unref(resetPwForm).new_password]
                        ])
                      ]),
                      createVNode("div", { class: "staff-field" }, [
                        createVNode("label", { class: "staff-field__label" }, "Confirm Password"),
                        withDirectives(createVNode("input", {
                          "onUpdate:modelValue": ($event) => unref(resetPwForm).confirm = $event,
                          class: "staff-field__input",
                          type: "password",
                          placeholder: "Re-enter new password"
                        }, null, 8, ["onUpdate:modelValue"]), [
                          [vModelText, unref(resetPwForm).confirm]
                        ])
                      ]),
                      unref(resetPwError) ? (openBlock(), createBlock("p", {
                        key: 0,
                        class: "staff-form-error"
                      }, [
                        createVNode(VIcon, { size: "14" }, {
                          default: withCtx(() => [
                            createTextVNode("mdi-alert-circle")
                          ]),
                          _: 1
                        }),
                        createTextVNode(" " + toDisplayString(unref(resetPwError)), 1)
                      ])) : createCommentVNode("", true)
                    ]),
                    createVNode(VDivider),
                    createVNode("div", { class: "staff-dialog__footer" }, [
                      createVNode("button", {
                        class: "staff-btn staff-btn--ghost",
                        onClick: ($event) => resetPwDialog.value = false
                      }, "Cancel", 8, ["onClick"]),
                      createVNode("button", {
                        class: "staff-btn staff-btn--primary",
                        disabled: unref(resettingPw),
                        onClick: doResetPw
                      }, [
                        unref(resettingPw) ? (openBlock(), createBlock(VProgressCircular, {
                          key: 0,
                          indeterminate: "",
                          size: "16",
                          width: "2",
                          color: "white",
                          class: "mr-2"
                        })) : createCommentVNode("", true),
                        createTextVNode(" Reset Password ")
                      ], 8, ["disabled"])
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
        modelValue: unref(deleteDialog),
        "onUpdate:modelValue": ($event) => isRef(deleteDialog) ? deleteDialog.value = $event : null,
        "max-width": "440",
        persistent: "",
        "scroll-strategy": "block"
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(ssrRenderComponent(VCard, {
              rounded: "xl",
              class: "staff-dialog"
            }, {
              default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                var _a, _b, _c, _d, _e, _f;
                if (_push3) {
                  _push3(`<div class="staff-dialog__header" data-v-8a6a1a9d${_scopeId2}><div class="staff-dialog__header-icon staff-dialog__header-icon--danger" data-v-8a6a1a9d${_scopeId2}>`);
                  _push3(ssrRenderComponent(VIcon, { size: "22" }, {
                    default: withCtx((_3, _push4, _parent4, _scopeId3) => {
                      if (_push4) {
                        _push4(`mdi-delete-outline`);
                      } else {
                        return [
                          createTextVNode("mdi-delete-outline")
                        ];
                      }
                    }),
                    _: 1
                  }, _parent3, _scopeId2));
                  _push3(`</div><div class="flex-1" data-v-8a6a1a9d${_scopeId2}><h3 class="staff-dialog__title" data-v-8a6a1a9d${_scopeId2}>Delete Staff Member</h3><p class="staff-dialog__sub" data-v-8a6a1a9d${_scopeId2}>This will deactivate ${ssrInterpolate((_a = unref(deleteTarget)) == null ? void 0 : _a.first_name)} ${ssrInterpolate((_b = unref(deleteTarget)) == null ? void 0 : _b.last_name)}. You can optionally permanently delete them.</p></div>`);
                  _push3(ssrRenderComponent(VBtn, {
                    icon: "mdi-close",
                    variant: "text",
                    size: "small",
                    onClick: ($event) => deleteDialog.value = false
                  }, null, _parent3, _scopeId2));
                  _push3(`</div>`);
                  _push3(ssrRenderComponent(VDivider, null, null, _parent3, _scopeId2));
                  _push3(`<div class="staff-dialog__body" data-v-8a6a1a9d${_scopeId2}><div class="staff-delete-info" data-v-8a6a1a9d${_scopeId2}><div class="staff-avatar staff-avatar--grey" style="${ssrRenderStyle({ "width": "48px", "height": "48px", "font-size": "0.875rem" })}" data-v-8a6a1a9d${_scopeId2}><span data-v-8a6a1a9d${_scopeId2}>${ssrInterpolate(unref(deleteTarget) ? initials(unref(deleteTarget)) : "")}</span></div><div data-v-8a6a1a9d${_scopeId2}><p class="staff-delete-info__name" data-v-8a6a1a9d${_scopeId2}>${ssrInterpolate(unref(deleteTarget) ? fullName(unref(deleteTarget)) : "")}</p><p class="staff-delete-info__email" data-v-8a6a1a9d${_scopeId2}>${ssrInterpolate((_c = unref(deleteTarget)) == null ? void 0 : _c.email)}</p></div></div><label class="staff-delete-check" data-v-8a6a1a9d${_scopeId2}><input type="checkbox"${ssrIncludeBooleanAttr(Array.isArray(unref(hardDelete)) ? ssrLooseContain(unref(hardDelete), null) : unref(hardDelete)) ? " checked" : ""} class="staff-checkbox" data-v-8a6a1a9d${_scopeId2}><span data-v-8a6a1a9d${_scopeId2}>Permanently delete this user (cannot be undone)</span></label></div>`);
                  _push3(ssrRenderComponent(VDivider, null, null, _parent3, _scopeId2));
                  _push3(`<div class="staff-dialog__footer" data-v-8a6a1a9d${_scopeId2}><button class="staff-btn staff-btn--ghost" data-v-8a6a1a9d${_scopeId2}>Cancel</button><button class="staff-btn staff-btn--danger"${ssrIncludeBooleanAttr(unref(deleting)) ? " disabled" : ""} data-v-8a6a1a9d${_scopeId2}>`);
                  if (unref(deleting)) {
                    _push3(ssrRenderComponent(VProgressCircular, {
                      indeterminate: "",
                      size: "16",
                      width: "2",
                      color: "white",
                      class: "mr-2"
                    }, null, _parent3, _scopeId2));
                  } else {
                    _push3(`<!---->`);
                  }
                  _push3(` ${ssrInterpolate(unref(hardDelete) ? "Delete Permanently" : "Deactivate")}</button></div>`);
                } else {
                  return [
                    createVNode("div", { class: "staff-dialog__header" }, [
                      createVNode("div", { class: "staff-dialog__header-icon staff-dialog__header-icon--danger" }, [
                        createVNode(VIcon, { size: "22" }, {
                          default: withCtx(() => [
                            createTextVNode("mdi-delete-outline")
                          ]),
                          _: 1
                        })
                      ]),
                      createVNode("div", { class: "flex-1" }, [
                        createVNode("h3", { class: "staff-dialog__title" }, "Delete Staff Member"),
                        createVNode("p", { class: "staff-dialog__sub" }, "This will deactivate " + toDisplayString((_d = unref(deleteTarget)) == null ? void 0 : _d.first_name) + " " + toDisplayString((_e = unref(deleteTarget)) == null ? void 0 : _e.last_name) + ". You can optionally permanently delete them.", 1)
                      ]),
                      createVNode(VBtn, {
                        icon: "mdi-close",
                        variant: "text",
                        size: "small",
                        onClick: ($event) => deleteDialog.value = false
                      }, null, 8, ["onClick"])
                    ]),
                    createVNode(VDivider),
                    createVNode("div", { class: "staff-dialog__body" }, [
                      createVNode("div", { class: "staff-delete-info" }, [
                        createVNode("div", {
                          class: "staff-avatar staff-avatar--grey",
                          style: { "width": "48px", "height": "48px", "font-size": "0.875rem" }
                        }, [
                          createVNode("span", null, toDisplayString(unref(deleteTarget) ? initials(unref(deleteTarget)) : ""), 1)
                        ]),
                        createVNode("div", null, [
                          createVNode("p", { class: "staff-delete-info__name" }, toDisplayString(unref(deleteTarget) ? fullName(unref(deleteTarget)) : ""), 1),
                          createVNode("p", { class: "staff-delete-info__email" }, toDisplayString((_f = unref(deleteTarget)) == null ? void 0 : _f.email), 1)
                        ])
                      ]),
                      createVNode("label", { class: "staff-delete-check" }, [
                        withDirectives(createVNode("input", {
                          type: "checkbox",
                          "onUpdate:modelValue": ($event) => isRef(hardDelete) ? hardDelete.value = $event : null,
                          class: "staff-checkbox"
                        }, null, 8, ["onUpdate:modelValue"]), [
                          [vModelCheckbox, unref(hardDelete)]
                        ]),
                        createVNode("span", null, "Permanently delete this user (cannot be undone)")
                      ])
                    ]),
                    createVNode(VDivider),
                    createVNode("div", { class: "staff-dialog__footer" }, [
                      createVNode("button", {
                        class: "staff-btn staff-btn--ghost",
                        onClick: ($event) => deleteDialog.value = false
                      }, "Cancel", 8, ["onClick"]),
                      createVNode("button", {
                        class: "staff-btn staff-btn--danger",
                        disabled: unref(deleting),
                        onClick: doDelete
                      }, [
                        unref(deleting) ? (openBlock(), createBlock(VProgressCircular, {
                          key: 0,
                          indeterminate: "",
                          size: "16",
                          width: "2",
                          color: "white",
                          class: "mr-2"
                        })) : createCommentVNode("", true),
                        createTextVNode(" " + toDisplayString(unref(hardDelete) ? "Delete Permanently" : "Deactivate"), 1)
                      ], 8, ["disabled"])
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
                class: "staff-dialog"
              }, {
                default: withCtx(() => {
                  var _a, _b, _c;
                  return [
                    createVNode("div", { class: "staff-dialog__header" }, [
                      createVNode("div", { class: "staff-dialog__header-icon staff-dialog__header-icon--danger" }, [
                        createVNode(VIcon, { size: "22" }, {
                          default: withCtx(() => [
                            createTextVNode("mdi-delete-outline")
                          ]),
                          _: 1
                        })
                      ]),
                      createVNode("div", { class: "flex-1" }, [
                        createVNode("h3", { class: "staff-dialog__title" }, "Delete Staff Member"),
                        createVNode("p", { class: "staff-dialog__sub" }, "This will deactivate " + toDisplayString((_a = unref(deleteTarget)) == null ? void 0 : _a.first_name) + " " + toDisplayString((_b = unref(deleteTarget)) == null ? void 0 : _b.last_name) + ". You can optionally permanently delete them.", 1)
                      ]),
                      createVNode(VBtn, {
                        icon: "mdi-close",
                        variant: "text",
                        size: "small",
                        onClick: ($event) => deleteDialog.value = false
                      }, null, 8, ["onClick"])
                    ]),
                    createVNode(VDivider),
                    createVNode("div", { class: "staff-dialog__body" }, [
                      createVNode("div", { class: "staff-delete-info" }, [
                        createVNode("div", {
                          class: "staff-avatar staff-avatar--grey",
                          style: { "width": "48px", "height": "48px", "font-size": "0.875rem" }
                        }, [
                          createVNode("span", null, toDisplayString(unref(deleteTarget) ? initials(unref(deleteTarget)) : ""), 1)
                        ]),
                        createVNode("div", null, [
                          createVNode("p", { class: "staff-delete-info__name" }, toDisplayString(unref(deleteTarget) ? fullName(unref(deleteTarget)) : ""), 1),
                          createVNode("p", { class: "staff-delete-info__email" }, toDisplayString((_c = unref(deleteTarget)) == null ? void 0 : _c.email), 1)
                        ])
                      ]),
                      createVNode("label", { class: "staff-delete-check" }, [
                        withDirectives(createVNode("input", {
                          type: "checkbox",
                          "onUpdate:modelValue": ($event) => isRef(hardDelete) ? hardDelete.value = $event : null,
                          class: "staff-checkbox"
                        }, null, 8, ["onUpdate:modelValue"]), [
                          [vModelCheckbox, unref(hardDelete)]
                        ]),
                        createVNode("span", null, "Permanently delete this user (cannot be undone)")
                      ])
                    ]),
                    createVNode(VDivider),
                    createVNode("div", { class: "staff-dialog__footer" }, [
                      createVNode("button", {
                        class: "staff-btn staff-btn--ghost",
                        onClick: ($event) => deleteDialog.value = false
                      }, "Cancel", 8, ["onClick"]),
                      createVNode("button", {
                        class: "staff-btn staff-btn--danger",
                        disabled: unref(deleting),
                        onClick: doDelete
                      }, [
                        unref(deleting) ? (openBlock(), createBlock(VProgressCircular, {
                          key: 0,
                          indeterminate: "",
                          size: "16",
                          width: "2",
                          color: "white",
                          class: "mr-2"
                        })) : createCommentVNode("", true),
                        createTextVNode(" " + toDisplayString(unref(hardDelete) ? "Delete Permanently" : "Deactivate"), 1)
                      ], 8, ["disabled"])
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
        modelValue: unref(confirmBulkDelete),
        "onUpdate:modelValue": ($event) => isRef(confirmBulkDelete) ? confirmBulkDelete.value = $event : null,
        "max-width": "440",
        persistent: "",
        "scroll-strategy": "block"
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(ssrRenderComponent(VCard, {
              rounded: "xl",
              class: "staff-dialog"
            }, {
              default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                if (_push3) {
                  _push3(`<div class="staff-dialog__header" data-v-8a6a1a9d${_scopeId2}><div class="staff-dialog__header-icon staff-dialog__header-icon--danger" data-v-8a6a1a9d${_scopeId2}>`);
                  _push3(ssrRenderComponent(VIcon, { size: "22" }, {
                    default: withCtx((_3, _push4, _parent4, _scopeId3) => {
                      if (_push4) {
                        _push4(`mdi-delete-outline`);
                      } else {
                        return [
                          createTextVNode("mdi-delete-outline")
                        ];
                      }
                    }),
                    _: 1
                  }, _parent3, _scopeId2));
                  _push3(`</div><div class="flex-1" data-v-8a6a1a9d${_scopeId2}><h3 class="staff-dialog__title" data-v-8a6a1a9d${_scopeId2}>Delete ${ssrInterpolate(unref(selectedIds).length)} Staff Members</h3><p class="staff-dialog__sub" data-v-8a6a1a9d${_scopeId2}>This will deactivate the selected users. You can optionally permanently delete them.</p></div>`);
                  _push3(ssrRenderComponent(VBtn, {
                    icon: "mdi-close",
                    variant: "text",
                    size: "small",
                    onClick: ($event) => confirmBulkDelete.value = false
                  }, null, _parent3, _scopeId2));
                  _push3(`</div>`);
                  _push3(ssrRenderComponent(VDivider, null, null, _parent3, _scopeId2));
                  _push3(`<div class="staff-dialog__body" data-v-8a6a1a9d${_scopeId2}><label class="staff-delete-check" data-v-8a6a1a9d${_scopeId2}><input type="checkbox"${ssrIncludeBooleanAttr(Array.isArray(unref(hardDelete)) ? ssrLooseContain(unref(hardDelete), null) : unref(hardDelete)) ? " checked" : ""} class="staff-checkbox" data-v-8a6a1a9d${_scopeId2}><span data-v-8a6a1a9d${_scopeId2}>Permanently delete these users (cannot be undone)</span></label></div>`);
                  _push3(ssrRenderComponent(VDivider, null, null, _parent3, _scopeId2));
                  _push3(`<div class="staff-dialog__footer" data-v-8a6a1a9d${_scopeId2}><button class="staff-btn staff-btn--ghost" data-v-8a6a1a9d${_scopeId2}>Cancel</button><button class="staff-btn staff-btn--danger"${ssrIncludeBooleanAttr(unref(bulkActioning)) ? " disabled" : ""} data-v-8a6a1a9d${_scopeId2}>`);
                  if (unref(bulkActioning)) {
                    _push3(ssrRenderComponent(VProgressCircular, {
                      indeterminate: "",
                      size: "16",
                      width: "2",
                      color: "white",
                      class: "mr-2"
                    }, null, _parent3, _scopeId2));
                  } else {
                    _push3(`<!---->`);
                  }
                  _push3(` ${ssrInterpolate(unref(hardDelete) ? "Delete Permanently" : "Deactivate")} All </button></div>`);
                } else {
                  return [
                    createVNode("div", { class: "staff-dialog__header" }, [
                      createVNode("div", { class: "staff-dialog__header-icon staff-dialog__header-icon--danger" }, [
                        createVNode(VIcon, { size: "22" }, {
                          default: withCtx(() => [
                            createTextVNode("mdi-delete-outline")
                          ]),
                          _: 1
                        })
                      ]),
                      createVNode("div", { class: "flex-1" }, [
                        createVNode("h3", { class: "staff-dialog__title" }, "Delete " + toDisplayString(unref(selectedIds).length) + " Staff Members", 1),
                        createVNode("p", { class: "staff-dialog__sub" }, "This will deactivate the selected users. You can optionally permanently delete them.")
                      ]),
                      createVNode(VBtn, {
                        icon: "mdi-close",
                        variant: "text",
                        size: "small",
                        onClick: ($event) => confirmBulkDelete.value = false
                      }, null, 8, ["onClick"])
                    ]),
                    createVNode(VDivider),
                    createVNode("div", { class: "staff-dialog__body" }, [
                      createVNode("label", { class: "staff-delete-check" }, [
                        withDirectives(createVNode("input", {
                          type: "checkbox",
                          "onUpdate:modelValue": ($event) => isRef(hardDelete) ? hardDelete.value = $event : null,
                          class: "staff-checkbox"
                        }, null, 8, ["onUpdate:modelValue"]), [
                          [vModelCheckbox, unref(hardDelete)]
                        ]),
                        createVNode("span", null, "Permanently delete these users (cannot be undone)")
                      ])
                    ]),
                    createVNode(VDivider),
                    createVNode("div", { class: "staff-dialog__footer" }, [
                      createVNode("button", {
                        class: "staff-btn staff-btn--ghost",
                        onClick: ($event) => confirmBulkDelete.value = false
                      }, "Cancel", 8, ["onClick"]),
                      createVNode("button", {
                        class: "staff-btn staff-btn--danger",
                        disabled: unref(bulkActioning),
                        onClick: doBulkDelete
                      }, [
                        unref(bulkActioning) ? (openBlock(), createBlock(VProgressCircular, {
                          key: 0,
                          indeterminate: "",
                          size: "16",
                          width: "2",
                          color: "white",
                          class: "mr-2"
                        })) : createCommentVNode("", true),
                        createTextVNode(" " + toDisplayString(unref(hardDelete) ? "Delete Permanently" : "Deactivate") + " All ", 1)
                      ], 8, ["disabled"])
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
                class: "staff-dialog"
              }, {
                default: withCtx(() => [
                  createVNode("div", { class: "staff-dialog__header" }, [
                    createVNode("div", { class: "staff-dialog__header-icon staff-dialog__header-icon--danger" }, [
                      createVNode(VIcon, { size: "22" }, {
                        default: withCtx(() => [
                          createTextVNode("mdi-delete-outline")
                        ]),
                        _: 1
                      })
                    ]),
                    createVNode("div", { class: "flex-1" }, [
                      createVNode("h3", { class: "staff-dialog__title" }, "Delete " + toDisplayString(unref(selectedIds).length) + " Staff Members", 1),
                      createVNode("p", { class: "staff-dialog__sub" }, "This will deactivate the selected users. You can optionally permanently delete them.")
                    ]),
                    createVNode(VBtn, {
                      icon: "mdi-close",
                      variant: "text",
                      size: "small",
                      onClick: ($event) => confirmBulkDelete.value = false
                    }, null, 8, ["onClick"])
                  ]),
                  createVNode(VDivider),
                  createVNode("div", { class: "staff-dialog__body" }, [
                    createVNode("label", { class: "staff-delete-check" }, [
                      withDirectives(createVNode("input", {
                        type: "checkbox",
                        "onUpdate:modelValue": ($event) => isRef(hardDelete) ? hardDelete.value = $event : null,
                        class: "staff-checkbox"
                      }, null, 8, ["onUpdate:modelValue"]), [
                        [vModelCheckbox, unref(hardDelete)]
                      ]),
                      createVNode("span", null, "Permanently delete these users (cannot be undone)")
                    ])
                  ]),
                  createVNode(VDivider),
                  createVNode("div", { class: "staff-dialog__footer" }, [
                    createVNode("button", {
                      class: "staff-btn staff-btn--ghost",
                      onClick: ($event) => confirmBulkDelete.value = false
                    }, "Cancel", 8, ["onClick"]),
                    createVNode("button", {
                      class: "staff-btn staff-btn--danger",
                      disabled: unref(bulkActioning),
                      onClick: doBulkDelete
                    }, [
                      unref(bulkActioning) ? (openBlock(), createBlock(VProgressCircular, {
                        key: 0,
                        indeterminate: "",
                        size: "16",
                        width: "2",
                        color: "white",
                        class: "mr-2"
                      })) : createCommentVNode("", true),
                      createTextVNode(" " + toDisplayString(unref(hardDelete) ? "Delete Permanently" : "Deactivate") + " All ", 1)
                    ], 8, ["disabled"])
                  ])
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
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/admin/staff.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const staff = /* @__PURE__ */ _export_sfc(_sfc_main, [["__scopeId", "data-v-8a6a1a9d"]]);

export { staff as default };
//# sourceMappingURL=staff-D42RjoC_.mjs.map
