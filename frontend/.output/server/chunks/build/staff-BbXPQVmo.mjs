import { defineComponent, ref, reactive, computed, mergeProps, withCtx, createTextVNode, unref, toDisplayString, isRef, createVNode, withDirectives, vModelText, openBlock, createBlock, Fragment, renderList, vModelSelect, createCommentVNode, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent, ssrRenderList, ssrRenderClass, ssrInterpolate, ssrRenderAttr, ssrIncludeBooleanAttr, ssrLooseContain, ssrLooseEqual, ssrRenderStyle } from 'vue/server-renderer';
import { M as useToast, d as VIcon, x as VDialog, k as VCard, g as VBtn, p as VDivider, E as VProgressCircular } from './server.mjs';
import { u as useFormat } from './useFormat-C--cm8if.mjs';
import { u as useApi } from './useApi-9yTPzSUF.mjs';
import { _ as _export_sfc } from './_plugin-vue_export-helper-1tPrXgE0.mjs';
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
import 'pinia';
import 'vue-router';
import '@vue/shared';
import 'vue3-apexcharts';
import './auth-s-b-v9EY.mjs';

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
      password: ""
    });
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
      return roleOptions.find((r) => r.value === role)?.label || role.replace(/_/g, " ");
    }
    function fullName(u) {
      return `${u.first_name} ${u.last_name}`.trim() || u.email;
    }
    function initials(u) {
      const f = u.first_name?.[0] || "";
      const l = u.last_name?.[0] || "";
      return (f + l).toUpperCase() || "?";
    }
    function branchName(id) {
      if (!id) return "";
      return branches.value.find((b) => b.id === id)?.name || "";
    }
    const filteredUsers = computed(() => {
      let list = users.value;
      if (statusFilter.value === "active") list = list.filter((u) => u.is_active_employee);
      if (statusFilter.value === "inactive") list = list.filter((u) => !u.is_active_employee);
      return list;
    });
    const kpis = computed(() => [
      { label: "Total Staff", value: users.value.length, icon: "mdi-account-group", color: "blue" },
      { label: "Active", value: users.value.filter((u) => u.is_active_employee).length, icon: "mdi-account-check", color: "green" },
      { label: "Inactive", value: users.value.filter((u) => !u.is_active_employee).length, icon: "mdi-account-off", color: "red" },
      { label: "Managers", value: users.value.filter((u) => ["super_admin", "tenant_admin", "manager"].includes(u.role)).length, icon: "mdi-shield-account", color: "purple" }
    ]);
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
      if (!validate()) return;
      saving.value = true;
      try {
        if (editing.value && form.id) {
          const payload = {
            first_name: form.first_name,
            last_name: form.last_name,
            phone: form.phone,
            employee_id: form.employee_id,
            role: form.role,
            default_branch_id: form.default_branch_id,
            hire_date: form.hire_date || null
          };
          const updated = await useApi()(`/users/staff/${form.id}/`, { method: "PATCH", body: payload });
          const idx = users.value.findIndex((u) => u.id === form.id);
          if (idx >= 0) users.value[idx] = { ...users.value[idx], ...updated };
          toast.success("Staff member updated");
        } else {
          const payload = {
            first_name: form.first_name,
            last_name: form.last_name,
            email: form.email,
            phone: form.phone,
            employee_id: form.employee_id,
            role: form.role,
            default_branch_id: form.default_branch_id,
            hire_date: form.hire_date || null,
            password: form.password
          };
          const created = await useApi()("/users/staff/", { method: "POST", body: payload });
          users.value.unshift(created);
          toast.success("Staff member created");
        }
        dialog.value = false;
      } catch (e) {
        formError.value = e?.data?.email?.[0] || e?.data?.detail || "Failed to save staff member";
      } finally {
        saving.value = false;
      }
    }
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "staff-page" }, _attrs))} data-v-e6ddaeb1><div class="staff-header" data-v-e6ddaeb1><div class="staff-header__left" data-v-e6ddaeb1><h1 class="staff-header__title" data-v-e6ddaeb1>Staff Members</h1><p class="staff-header__sub" data-v-e6ddaeb1>Manage your team — roles, status, and branch assignments</p></div><div class="staff-header__actions" data-v-e6ddaeb1><button class="staff-btn staff-btn--ghost" data-v-e6ddaeb1>`);
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
      _push(` Refresh </button><button class="staff-btn staff-btn--primary" data-v-e6ddaeb1>`);
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
      _push(` Add Staff </button></div></div><div class="staff-kpi-grid" data-v-e6ddaeb1><!--[-->`);
      ssrRenderList(unref(kpis), (kpi) => {
        _push(`<div class="staff-kpi" data-v-e6ddaeb1><div class="${ssrRenderClass([`staff-kpi__icon--${kpi.color}`, "staff-kpi__icon"])}" data-v-e6ddaeb1>`);
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
        _push(`</div><div class="staff-kpi__body" data-v-e6ddaeb1><p class="staff-kpi__label" data-v-e6ddaeb1>${ssrInterpolate(kpi.label)}</p><p class="staff-kpi__value" data-v-e6ddaeb1>${ssrInterpolate(kpi.value)}</p></div></div>`);
      });
      _push(`<!--]--></div><div class="staff-toolbar" data-v-e6ddaeb1><div class="staff-toolbar__search" data-v-e6ddaeb1>`);
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
      _push(`<input${ssrRenderAttr("value", unref(search))} class="staff-toolbar__search-input" placeholder="Search by name, email, or employee ID…" data-v-e6ddaeb1>`);
      if (unref(search)) {
        _push(`<button class="staff-toolbar__search-clear" data-v-e6ddaeb1>`);
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
      _push(`</div><div class="staff-toolbar__filters" data-v-e6ddaeb1><select class="staff-toolbar__select" data-v-e6ddaeb1><option value="" data-v-e6ddaeb1${ssrIncludeBooleanAttr(Array.isArray(unref(roleFilter)) ? ssrLooseContain(unref(roleFilter), "") : ssrLooseEqual(unref(roleFilter), "")) ? " selected" : ""}>All Roles</option><!--[-->`);
      ssrRenderList(roleOptions, (r) => {
        _push(`<option${ssrRenderAttr("value", r.value)} data-v-e6ddaeb1${ssrIncludeBooleanAttr(Array.isArray(unref(roleFilter)) ? ssrLooseContain(unref(roleFilter), r.value) : ssrLooseEqual(unref(roleFilter), r.value)) ? " selected" : ""}>${ssrInterpolate(r.label)}</option>`);
      });
      _push(`<!--]--></select><select class="staff-toolbar__select" data-v-e6ddaeb1><option value="" data-v-e6ddaeb1${ssrIncludeBooleanAttr(Array.isArray(unref(branchFilter)) ? ssrLooseContain(unref(branchFilter), "") : ssrLooseEqual(unref(branchFilter), "")) ? " selected" : ""}>All Branches</option><!--[-->`);
      ssrRenderList(unref(branches), (b) => {
        _push(`<option${ssrRenderAttr("value", b.id)} data-v-e6ddaeb1${ssrIncludeBooleanAttr(Array.isArray(unref(branchFilter)) ? ssrLooseContain(unref(branchFilter), b.id) : ssrLooseEqual(unref(branchFilter), b.id)) ? " selected" : ""}>${ssrInterpolate(b.name)}</option>`);
      });
      _push(`<!--]--></select><select class="staff-toolbar__select" data-v-e6ddaeb1><option value="" data-v-e6ddaeb1${ssrIncludeBooleanAttr(Array.isArray(unref(statusFilter)) ? ssrLooseContain(unref(statusFilter), "") : ssrLooseEqual(unref(statusFilter), "")) ? " selected" : ""}>All Status</option><option value="active" data-v-e6ddaeb1${ssrIncludeBooleanAttr(Array.isArray(unref(statusFilter)) ? ssrLooseContain(unref(statusFilter), "active") : ssrLooseEqual(unref(statusFilter), "active")) ? " selected" : ""}>Active</option><option value="inactive" data-v-e6ddaeb1${ssrIncludeBooleanAttr(Array.isArray(unref(statusFilter)) ? ssrLooseContain(unref(statusFilter), "inactive") : ssrLooseEqual(unref(statusFilter), "inactive")) ? " selected" : ""}>Deactivated</option></select></div></div><div class="staff-table-wrap" data-v-e6ddaeb1><table class="staff-table" data-v-e6ddaeb1><thead data-v-e6ddaeb1><tr data-v-e6ddaeb1><th data-v-e6ddaeb1>Staff Member</th><th data-v-e6ddaeb1>Role</th><th data-v-e6ddaeb1>Phone</th><th data-v-e6ddaeb1>Branch</th><th data-v-e6ddaeb1>Status</th><th data-v-e6ddaeb1>Hired</th><th style="${ssrRenderStyle({ "width": "120px" })}" data-v-e6ddaeb1>Actions</th></tr></thead><tbody data-v-e6ddaeb1>`);
      if (unref(loading)) {
        _push(`<!--[-->`);
        ssrRenderList(6, (i) => {
          _push(`<tr data-v-e6ddaeb1><td data-v-e6ddaeb1><div class="staff-skeleton" style="${ssrRenderStyle({ "width": "160px", "height": "38px" })}" data-v-e6ddaeb1></div></td><td data-v-e6ddaeb1><div class="staff-skeleton" style="${ssrRenderStyle({ "width": "90px", "height": "22px" })}" data-v-e6ddaeb1></div></td><td data-v-e6ddaeb1><div class="staff-skeleton" style="${ssrRenderStyle({ "width": "100px", "height": "16px" })}" data-v-e6ddaeb1></div></td><td data-v-e6ddaeb1><div class="staff-skeleton" style="${ssrRenderStyle({ "width": "80px", "height": "16px" })}" data-v-e6ddaeb1></div></td><td data-v-e6ddaeb1><div class="staff-skeleton" style="${ssrRenderStyle({ "width": "70px", "height": "22px" })}" data-v-e6ddaeb1></div></td><td data-v-e6ddaeb1><div class="staff-skeleton" style="${ssrRenderStyle({ "width": "70px", "height": "16px" })}" data-v-e6ddaeb1></div></td><td data-v-e6ddaeb1><div class="staff-skeleton" style="${ssrRenderStyle({ "width": "100px", "height": "28px" })}" data-v-e6ddaeb1></div></td></tr>`);
        });
        _push(`<!--]-->`);
      } else if (!unref(filteredUsers).length) {
        _push(`<tr data-v-e6ddaeb1><td colspan="7" class="staff-empty" data-v-e6ddaeb1>`);
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
        _push(`<p class="staff-empty__title" data-v-e6ddaeb1>No staff members found</p><p class="staff-empty__sub" data-v-e6ddaeb1>Try adjusting your search or filters</p></td></tr>`);
      } else {
        _push(`<!---->`);
      }
      _push(`<!--[-->`);
      ssrRenderList(unref(filteredUsers), (user) => {
        _push(`<tr data-v-e6ddaeb1><td data-v-e6ddaeb1><div class="staff-cell-user" data-v-e6ddaeb1><div class="${ssrRenderClass([`staff-avatar--${roleColor(user.role)}`, "staff-avatar"])}" data-v-e6ddaeb1>${ssrInterpolate(initials(user))}</div><div class="staff-cell-user__info" data-v-e6ddaeb1><p class="staff-cell-user__name" data-v-e6ddaeb1>${ssrInterpolate(fullName(user))}</p><p class="staff-cell-user__email" data-v-e6ddaeb1>${ssrInterpolate(user.email)}</p></div></div></td><td data-v-e6ddaeb1><span class="${ssrRenderClass([`staff-role-chip--${roleColor(user.role)}`, "staff-role-chip"])}" data-v-e6ddaeb1>${ssrInterpolate(roleLabel(user.role))}</span></td><td data-v-e6ddaeb1>`);
        if (user.phone) {
          _push(`<span class="staff-cell-text" data-v-e6ddaeb1>${ssrInterpolate(user.phone)}</span>`);
        } else {
          _push(`<span class="staff-cell-muted" data-v-e6ddaeb1>—</span>`);
        }
        _push(`</td><td data-v-e6ddaeb1>`);
        if (branchName(user.default_branch_id)) {
          _push(`<span class="staff-cell-text" data-v-e6ddaeb1>${ssrInterpolate(branchName(user.default_branch_id))}</span>`);
        } else {
          _push(`<span class="staff-cell-muted" data-v-e6ddaeb1>Unassigned</span>`);
        }
        _push(`</td><td data-v-e6ddaeb1><span class="${ssrRenderClass([user.is_active_employee ? "staff-status--active" : "staff-status--inactive", "staff-status"])}" data-v-e6ddaeb1><span class="staff-status__dot" data-v-e6ddaeb1></span> ${ssrInterpolate(user.is_active_employee ? "Active" : "Inactive")}</span></td><td data-v-e6ddaeb1>`);
        if (user.hire_date) {
          _push(`<span class="staff-cell-text" data-v-e6ddaeb1>${ssrInterpolate(unref(fmt).date(user.hire_date))}</span>`);
        } else {
          _push(`<span class="staff-cell-muted" data-v-e6ddaeb1>—</span>`);
        }
        _push(`</td><td data-v-e6ddaeb1><div class="staff-actions" data-v-e6ddaeb1><button class="staff-action-btn" title="Edit" data-v-e6ddaeb1>`);
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
        _push(`</button><button class="${ssrRenderClass([user.is_active_employee ? "staff-action-btn--danger" : "staff-action-btn--success", "staff-action-btn"])}"${ssrRenderAttr("title", user.is_active_employee ? "Deactivate" : "Activate")}${ssrIncludeBooleanAttr(unref(togglingId) === user.id) ? " disabled" : ""} data-v-e6ddaeb1>`);
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
        _push(`</button></div></td></tr>`);
      });
      _push(`<!--]--></tbody></table></div>`);
      _push(ssrRenderComponent(VDialog, {
        modelValue: unref(dialog),
        "onUpdate:modelValue": ($event) => isRef(dialog) ? dialog.value = $event : null,
        "max-width": "560",
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
                  _push3(`<div class="staff-dialog__header" data-v-e6ddaeb1${_scopeId2}><div class="${ssrRenderClass([unref(editing) ? "staff-dialog__header-icon--edit" : "staff-dialog__header-icon--primary", "staff-dialog__header-icon"])}" data-v-e6ddaeb1${_scopeId2}>`);
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
                  _push3(`</div><div class="flex-1" data-v-e6ddaeb1${_scopeId2}><h3 class="staff-dialog__title" data-v-e6ddaeb1${_scopeId2}>${ssrInterpolate(unref(editing) ? "Edit Staff Member" : "Add New Staff")}</h3><p class="staff-dialog__sub" data-v-e6ddaeb1${_scopeId2}>${ssrInterpolate(unref(editing) ? "Update role and branch assignment" : "Create a new team member account")}</p></div>`);
                  _push3(ssrRenderComponent(VBtn, {
                    icon: "mdi-close",
                    variant: "text",
                    size: "small",
                    onClick: closeDialog
                  }, null, _parent3, _scopeId2));
                  _push3(`</div>`);
                  _push3(ssrRenderComponent(VDivider, null, null, _parent3, _scopeId2));
                  _push3(`<div class="staff-dialog__body" data-v-e6ddaeb1${_scopeId2}><div class="staff-form-row" data-v-e6ddaeb1${_scopeId2}><div class="staff-field" data-v-e6ddaeb1${_scopeId2}><label class="staff-field__label" data-v-e6ddaeb1${_scopeId2}>First Name</label><input${ssrRenderAttr("value", unref(form).first_name)} class="staff-field__input" placeholder="John" data-v-e6ddaeb1${_scopeId2}></div><div class="staff-field" data-v-e6ddaeb1${_scopeId2}><label class="staff-field__label" data-v-e6ddaeb1${_scopeId2}>Last Name</label><input${ssrRenderAttr("value", unref(form).last_name)} class="staff-field__input" placeholder="Doe" data-v-e6ddaeb1${_scopeId2}></div></div><div class="staff-field" data-v-e6ddaeb1${_scopeId2}><label class="staff-field__label" data-v-e6ddaeb1${_scopeId2}>Email</label><input${ssrRenderAttr("value", unref(form).email)} class="staff-field__input" type="email" placeholder="john@domendra.com"${ssrIncludeBooleanAttr(unref(editing)) ? " disabled" : ""} data-v-e6ddaeb1${_scopeId2}></div><div class="staff-form-row" data-v-e6ddaeb1${_scopeId2}><div class="staff-field" data-v-e6ddaeb1${_scopeId2}><label class="staff-field__label" data-v-e6ddaeb1${_scopeId2}>Phone</label><input${ssrRenderAttr("value", unref(form).phone)} class="staff-field__input" placeholder="+254700000000" data-v-e6ddaeb1${_scopeId2}></div><div class="staff-field" data-v-e6ddaeb1${_scopeId2}><label class="staff-field__label" data-v-e6ddaeb1${_scopeId2}>Employee ID</label><input${ssrRenderAttr("value", unref(form).employee_id)} class="staff-field__input" placeholder="EMP-001" data-v-e6ddaeb1${_scopeId2}></div></div><div class="staff-form-row" data-v-e6ddaeb1${_scopeId2}><div class="staff-field" data-v-e6ddaeb1${_scopeId2}><label class="staff-field__label" data-v-e6ddaeb1${_scopeId2}>Role</label><select class="staff-field__input" data-v-e6ddaeb1${_scopeId2}><!--[-->`);
                  ssrRenderList(roleOptions, (r) => {
                    _push3(`<option${ssrRenderAttr("value", r.value)} data-v-e6ddaeb1${ssrIncludeBooleanAttr(Array.isArray(unref(form).role) ? ssrLooseContain(unref(form).role, r.value) : ssrLooseEqual(unref(form).role, r.value)) ? " selected" : ""}${_scopeId2}>${ssrInterpolate(r.label)}</option>`);
                  });
                  _push3(`<!--]--></select></div><div class="staff-field" data-v-e6ddaeb1${_scopeId2}><label class="staff-field__label" data-v-e6ddaeb1${_scopeId2}>Default Branch</label><select class="staff-field__input" data-v-e6ddaeb1${_scopeId2}><option${ssrRenderAttr("value", null)} data-v-e6ddaeb1${ssrIncludeBooleanAttr(Array.isArray(unref(form).default_branch_id) ? ssrLooseContain(unref(form).default_branch_id, null) : ssrLooseEqual(unref(form).default_branch_id, null)) ? " selected" : ""}${_scopeId2}>Unassigned</option><!--[-->`);
                  ssrRenderList(unref(branches), (b) => {
                    _push3(`<option${ssrRenderAttr("value", b.id)} data-v-e6ddaeb1${ssrIncludeBooleanAttr(Array.isArray(unref(form).default_branch_id) ? ssrLooseContain(unref(form).default_branch_id, b.id) : ssrLooseEqual(unref(form).default_branch_id, b.id)) ? " selected" : ""}${_scopeId2}>${ssrInterpolate(b.name)}</option>`);
                  });
                  _push3(`<!--]--></select></div></div><div class="staff-form-row" data-v-e6ddaeb1${_scopeId2}><div class="staff-field" data-v-e6ddaeb1${_scopeId2}><label class="staff-field__label" data-v-e6ddaeb1${_scopeId2}>Hire Date</label><input${ssrRenderAttr("value", unref(form).hire_date)} class="staff-field__input" type="date" data-v-e6ddaeb1${_scopeId2}></div>`);
                  if (!unref(editing)) {
                    _push3(`<div class="staff-field" data-v-e6ddaeb1${_scopeId2}><label class="staff-field__label" data-v-e6ddaeb1${_scopeId2}>Password</label><input${ssrRenderAttr("value", unref(form).password)} class="staff-field__input" type="password" placeholder="Min 8 characters" data-v-e6ddaeb1${_scopeId2}></div>`);
                  } else {
                    _push3(`<!---->`);
                  }
                  _push3(`</div>`);
                  if (unref(formError)) {
                    _push3(`<p class="staff-form-error" data-v-e6ddaeb1${_scopeId2}>${ssrInterpolate(unref(formError))}</p>`);
                  } else {
                    _push3(`<!---->`);
                  }
                  _push3(`</div>`);
                  _push3(ssrRenderComponent(VDivider, null, null, _parent3, _scopeId2));
                  _push3(`<div class="staff-dialog__footer" data-v-e6ddaeb1${_scopeId2}><button class="staff-btn staff-btn--ghost" data-v-e6ddaeb1${_scopeId2}>Cancel</button><button class="staff-btn staff-btn--primary"${ssrIncludeBooleanAttr(unref(saving)) ? " disabled" : ""} data-v-e6ddaeb1${_scopeId2}>`);
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
                        createVNode("p", { class: "staff-dialog__sub" }, toDisplayString(unref(editing) ? "Update role and branch assignment" : "Create a new team member account"), 1)
                      ]),
                      createVNode(VBtn, {
                        icon: "mdi-close",
                        variant: "text",
                        size: "small",
                        onClick: closeDialog
                      })
                    ]),
                    createVNode(VDivider),
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
                        !unref(editing) ? (openBlock(), createBlock("div", {
                          key: 0,
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
                        ])) : createCommentVNode("", true)
                      ]),
                      unref(formError) ? (openBlock(), createBlock("p", {
                        key: 0,
                        class: "staff-form-error"
                      }, toDisplayString(unref(formError)), 1)) : createCommentVNode("", true)
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
                      createVNode("p", { class: "staff-dialog__sub" }, toDisplayString(unref(editing) ? "Update role and branch assignment" : "Create a new team member account"), 1)
                    ]),
                    createVNode(VBtn, {
                      icon: "mdi-close",
                      variant: "text",
                      size: "small",
                      onClick: closeDialog
                    })
                  ]),
                  createVNode(VDivider),
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
                      !unref(editing) ? (openBlock(), createBlock("div", {
                        key: 0,
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
                      ])) : createCommentVNode("", true)
                    ]),
                    unref(formError) ? (openBlock(), createBlock("p", {
                      key: 0,
                      class: "staff-form-error"
                    }, toDisplayString(unref(formError)), 1)) : createCommentVNode("", true)
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
const staff = /* @__PURE__ */ _export_sfc(_sfc_main, [["__scopeId", "data-v-e6ddaeb1"]]);

export { staff as default };
//# sourceMappingURL=staff-BbXPQVmo.mjs.map
