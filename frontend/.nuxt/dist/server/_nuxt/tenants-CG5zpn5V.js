import { defineComponent, ref, computed, reactive, mergeProps, withCtx, createTextVNode, unref, isRef, createVNode, withModifiers, openBlock, createBlock, toDisplayString, Fragment, renderList, createCommentVNode, useSSRContext } from "vue";
import { ssrRenderAttrs, ssrRenderComponent, ssrInterpolate, ssrRenderStyle, ssrRenderList } from "vue/server-renderer";
import { D as useToast, a as VIcon, c as VBtn, a1 as VSkeletonLoader, b as VSpacer, v as VTextField, J as VSelect, n as VDataTable, o as VChip, a2 as VNavigationDrawer, h as VTabs, i as VTab, R as VWindow, S as VWindowItem, d as VAlert, a3 as VTimeline, a4 as VTimelineItem, M as VList, N as VListItem, O as VListItemTitle, P as VListItemSubtitle, _ as _export_sfc } from "../server.mjs";
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
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "tenants",
  __ssrInlineRender: true,
  setup(__props) {
    const toast = useToast();
    const loading = ref(false);
    const tenants2 = ref([]);
    const search = ref("");
    const statusFilter = ref("all");
    const planFilter = ref("all");
    const actionLoading = ref(null);
    const statusOptions = [
      { title: "All Status", value: "all" },
      { title: "Active", value: "active" },
      { title: "Trial", value: "trial" },
      { title: "Suspended", value: "suspended" },
      { title: "Cancelled", value: "cancelled" }
    ];
    const planOptions = [
      { title: "All Plans", value: "all" },
      { title: "Free", value: "free" },
      { title: "Starter", value: "starter" },
      { title: "Business", value: "business" },
      { title: "Enterprise", value: "enterprise" }
    ];
    const planValues = ["free", "starter", "business", "enterprise"];
    const headers = [
      { title: "Tenant", key: "name", sortable: true },
      { title: "Plan", key: "plan", sortable: true },
      { title: "Status", key: "status", sortable: true },
      { title: "Limits", key: "limits", sortable: false },
      { title: "Trial", key: "trial", sortable: false },
      { title: "Created", key: "created_on", sortable: true },
      { title: "Actions", key: "actions", sortable: false, align: "end" }
    ];
    const filteredTenants = computed(() => {
      let list = tenants2.value;
      if (statusFilter.value !== "all") list = list.filter((t) => t.status === statusFilter.value);
      if (planFilter.value !== "all") list = list.filter((t) => t.plan === planFilter.value);
      if (search.value) {
        const q = search.value.toLowerCase();
        list = list.filter(
          (t) => t.name?.toLowerCase().includes(q) || t.contact_email?.toLowerCase().includes(q) || t.schema_name?.toLowerCase().includes(q)
        );
      }
      return list;
    });
    const drawerOpen = ref(false);
    const selected = ref(null);
    const detailTab = ref("overview");
    const manageForm = reactive({
      plan: "free",
      max_branches: 1,
      max_users: 5,
      max_products: 500,
      trial_days: 7
    });
    const loadingDrill = ref(false);
    const activity = ref([]);
    const billing = ref(null);
    function openDetail(_event, item) {
      const t = item?.item || item || _event;
      selected.value = t;
      if (selected.value) {
        manageForm.plan = selected.value.plan;
        manageForm.max_branches = selected.value.max_branches;
        manageForm.max_users = selected.value.max_users;
        manageForm.max_products = selected.value.max_products;
        manageForm.trial_days = 7;
      }
      activity.value = [];
      billing.value = null;
      detailTab.value = "overview";
      drawerOpen.value = true;
    }
    function planColor(plan) {
      const map = { free: "grey", starter: "primary", business: "purple", enterprise: "amber" };
      return map[plan] || "grey";
    }
    function statusColor(status) {
      const map = { trial: "info", active: "success", suspended: "warning", cancelled: "error" };
      return map[status] || "grey";
    }
    function activityColor(action) {
      if (action?.includes("create")) return "success";
      if (action?.includes("delete")) return "error";
      if (action?.includes("update")) return "warning";
      return "primary";
    }
    function invColor(s) {
      const m = { paid: "success", overdue: "error", sent: "info", draft: "grey", cancelled: "grey" };
      return m[s] || "grey";
    }
    function avatarStyle(name) {
      const colors = ["#3b82f6", "#8b5cf6", "#f59e0b", "#10b981", "#ec4899", "#06b6d4", "#f43f5e"];
      const idx = (name?.charCodeAt(0) || 0) % colors.length;
      const c = colors[idx];
      return { background: c + "22", color: c };
    }
    function formatDate(v) {
      return new Date(v).toLocaleDateString("en-GB", { year: "numeric", month: "short", day: "numeric" });
    }
    function formatTime(v) {
      return new Date(v).toLocaleString("en-GB", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
    }
    function formatNum(v) {
      return Number(v || 0).toLocaleString("en-US");
    }
    async function loadTenants() {
      loading.value = true;
      try {
        const data = await useApi()("/tenants/manage/");
        tenants2.value = data.results || data;
      } catch {
        toast.error("Failed to load tenants");
      } finally {
        loading.value = false;
      }
    }
    async function apiAction(id, action, body) {
      actionLoading.value = id;
      try {
        const res = await useApi()(`/tenants/manage/${id}/${action}/`, { method: "POST", body });
        return res;
      } finally {
        actionLoading.value = null;
      }
    }
    async function refreshSelected() {
      if (!selected.value) return;
      try {
        const updated = await useApi()(`/tenants/manage/${selected.value.id}/`);
        Object.assign(selected.value, updated);
      } catch {
      }
    }
    async function suspendTenant(t) {
      try {
        await apiAction(t.id, "suspend", { reason: "Suspended by platform admin" });
        toast.success(`${t.name} suspended`);
        await refreshSelected();
        await loadTenants();
      } catch {
        toast.error("Failed to suspend tenant");
      }
    }
    async function activateTenant(t) {
      try {
        await apiAction(t.id, "activate");
        toast.success(`${t.name} activated`);
        await refreshSelected();
        await loadTenants();
      } catch {
        toast.error("Failed to activate tenant");
      }
    }
    async function cancelTenant(t) {
      try {
        await apiAction(t.id, "cancel");
        toast.success(`${t.name} cancelled`);
        await refreshSelected();
        await loadTenants();
      } catch {
        toast.error("Failed to cancel tenant");
      }
    }
    async function changePlan() {
      if (!selected.value) return;
      try {
        await apiAction(selected.value.id, "change_plan", { plan: manageForm.plan });
        toast.success(`Plan changed to ${manageForm.plan}`);
        await refreshSelected();
        await loadTenants();
      } catch {
        toast.error("Failed to change plan");
      }
    }
    async function setLimits() {
      if (!selected.value) return;
      try {
        await apiAction(selected.value.id, "set-limits", {
          max_branches: manageForm.max_branches,
          max_users: manageForm.max_users,
          max_products: manageForm.max_products
        });
        toast.success("Limits updated");
        await refreshSelected();
        await loadTenants();
      } catch {
        toast.error("Failed to set limits");
      }
    }
    async function extendTrial() {
      if (!selected.value) return;
      try {
        await apiAction(selected.value.id, "extend-trial", { days: manageForm.trial_days });
        toast.success(`Trial extended by ${manageForm.trial_days} days`);
        await refreshSelected();
        await loadTenants();
      } catch {
        toast.error("Failed to extend trial");
      }
    }
    async function loadActivity() {
      if (!selected.value) return;
      loadingDrill.value = true;
      try {
        const res = await useApi()(`/tenants/manage/${selected.value.id}/activity/`);
        activity.value = res.logs || res.results || res || [];
      } catch {
        toast.error("Failed to load activity");
      } finally {
        loadingDrill.value = false;
      }
    }
    async function loadBilling() {
      if (!selected.value) return;
      loadingDrill.value = true;
      try {
        billing.value = await useApi()(`/tenants/manage/${selected.value.id}/billing/`);
      } catch {
        toast.error("Failed to load billing");
      } finally {
        loadingDrill.value = false;
      }
    }
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "sa-page" }, _attrs))} data-v-f4f395f6><div class="sa-header" data-v-f4f395f6><div class="sa-header__left" data-v-f4f395f6><div class="sa-header__title-icon" data-v-f4f395f6>`);
      _push(ssrRenderComponent(VIcon, { size: "26" }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`mdi-domain`);
          } else {
            return [
              createTextVNode("mdi-domain")
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`</div><div data-v-f4f395f6><h1 class="text-h5 font-weight-bold" data-v-f4f395f6>Tenant Management</h1><p class="text-body-2 text-medium-emphasis" data-v-f4f395f6>Manage all workspaces — plans, limits, lifecycle &amp; domains</p></div></div><div class="sa-header__actions" data-v-f4f395f6>`);
      _push(ssrRenderComponent(VBtn, {
        variant: "outlined",
        "prepend-icon": "mdi-open-in-new",
        to: "/superadmin"
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`Dashboard`);
          } else {
            return [
              createTextVNode("Dashboard")
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(ssrRenderComponent(VBtn, {
        variant: "tonal",
        "prepend-icon": "mdi-refresh",
        loading: unref(loading),
        onClick: loadTenants
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
      _push(`</div></div>`);
      if (unref(loading) && unref(tenants2).length === 0) {
        _push(`<div class="sa-skeleton" data-v-f4f395f6>`);
        _push(ssrRenderComponent(VSkeletonLoader, {
          type: "table-tbody",
          class: "sa-skel-table",
          boilerplate: ""
        }, null, _parent));
        _push(`</div>`);
      } else {
        _push(`<div class="sa-card" data-v-f4f395f6><div class="sa-card__header" data-v-f4f395f6><div class="sa-card__header-icon sa-card__header-icon--indigo" data-v-f4f395f6>`);
        _push(ssrRenderComponent(VIcon, { size: "20" }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`mdi-domain`);
            } else {
              return [
                createTextVNode("mdi-domain")
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(`</div><div data-v-f4f395f6><h3 class="sa-card__title" data-v-f4f395f6>All Tenants</h3><p class="sa-card__subtitle" data-v-f4f395f6>${ssrInterpolate(unref(filteredTenants).length)} of ${ssrInterpolate(unref(tenants2).length)} tenants</p></div>`);
        _push(ssrRenderComponent(VSpacer, null, null, _parent));
        _push(ssrRenderComponent(VTextField, {
          modelValue: unref(search),
          "onUpdate:modelValue": ($event) => isRef(search) ? search.value = $event : null,
          density: "compact",
          variant: "outlined",
          placeholder: "Search tenants...",
          "prepend-inner-icon": "mdi-magnify",
          "hide-details": "",
          class: "sa-search",
          style: { "max-width": "260px" }
        }, null, _parent));
        _push(ssrRenderComponent(VSelect, {
          modelValue: unref(statusFilter),
          "onUpdate:modelValue": ($event) => isRef(statusFilter) ? statusFilter.value = $event : null,
          density: "compact",
          variant: "outlined",
          items: statusOptions,
          "hide-details": "",
          class: "sa-filter",
          style: { "max-width": "150px" }
        }, null, _parent));
        _push(ssrRenderComponent(VSelect, {
          modelValue: unref(planFilter),
          "onUpdate:modelValue": ($event) => isRef(planFilter) ? planFilter.value = $event : null,
          density: "compact",
          variant: "outlined",
          items: planOptions,
          "hide-details": "",
          class: "sa-filter",
          style: { "max-width": "150px" }
        }, null, _parent));
        _push(`</div>`);
        _push(ssrRenderComponent(VDataTable, {
          headers,
          items: unref(filteredTenants),
          "items-per-page": 15,
          density: "comfortable",
          hover: "",
          "onClick:row": openDetail
        }, {
          "item.name": withCtx(({ item }, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`<div class="d-flex align-center ga-2" data-v-f4f395f6${_scopeId}><div class="sa-tenant-row__avatar" style="${ssrRenderStyle(avatarStyle(item.name))}" data-v-f4f395f6${_scopeId}>${ssrInterpolate(item.name?.charAt(0)?.toUpperCase())}</div><div data-v-f4f395f6${_scopeId}><p class="text-body-2 font-weight-medium" data-v-f4f395f6${_scopeId}>${ssrInterpolate(item.name)}</p><p class="text-caption text-medium-emphasis" data-v-f4f395f6${_scopeId}>${ssrInterpolate(item.contact_email)}</p></div></div>`);
            } else {
              return [
                createVNode("div", { class: "d-flex align-center ga-2" }, [
                  createVNode("div", {
                    class: "sa-tenant-row__avatar",
                    style: avatarStyle(item.name)
                  }, toDisplayString(item.name?.charAt(0)?.toUpperCase()), 5),
                  createVNode("div", null, [
                    createVNode("p", { class: "text-body-2 font-weight-medium" }, toDisplayString(item.name), 1),
                    createVNode("p", { class: "text-caption text-medium-emphasis" }, toDisplayString(item.contact_email), 1)
                  ])
                ])
              ];
            }
          }),
          "item.plan": withCtx(({ item }, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(ssrRenderComponent(VChip, {
                color: planColor(item.plan),
                size: "small",
                variant: "tonal",
                label: ""
              }, {
                default: withCtx((_, _push3, _parent3, _scopeId2) => {
                  if (_push3) {
                    _push3(`${ssrInterpolate(item.plan)}`);
                  } else {
                    return [
                      createTextVNode(toDisplayString(item.plan), 1)
                    ];
                  }
                }),
                _: 2
              }, _parent2, _scopeId));
            } else {
              return [
                createVNode(VChip, {
                  color: planColor(item.plan),
                  size: "small",
                  variant: "tonal",
                  label: ""
                }, {
                  default: withCtx(() => [
                    createTextVNode(toDisplayString(item.plan), 1)
                  ]),
                  _: 2
                }, 1032, ["color"])
              ];
            }
          }),
          "item.status": withCtx(({ item }, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(ssrRenderComponent(VChip, {
                color: statusColor(item.status),
                size: "small",
                variant: "tonal",
                label: ""
              }, {
                default: withCtx((_, _push3, _parent3, _scopeId2) => {
                  if (_push3) {
                    _push3(`${ssrInterpolate(item.status)}`);
                  } else {
                    return [
                      createTextVNode(toDisplayString(item.status), 1)
                    ];
                  }
                }),
                _: 2
              }, _parent2, _scopeId));
            } else {
              return [
                createVNode(VChip, {
                  color: statusColor(item.status),
                  size: "small",
                  variant: "tonal",
                  label: ""
                }, {
                  default: withCtx(() => [
                    createTextVNode(toDisplayString(item.status), 1)
                  ]),
                  _: 2
                }, 1032, ["color"])
              ];
            }
          }),
          "item.limits": withCtx(({ item }, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`<span class="text-body-2 text-medium-emphasis" data-v-f4f395f6${_scopeId}>${ssrInterpolate(item.max_branches)}b · ${ssrInterpolate(item.max_users)}u · ${ssrInterpolate(item.max_products)}p </span>`);
            } else {
              return [
                createVNode("span", { class: "text-body-2 text-medium-emphasis" }, toDisplayString(item.max_branches) + "b · " + toDisplayString(item.max_users) + "u · " + toDisplayString(item.max_products) + "p ", 1)
              ];
            }
          }),
          "item.trial": withCtx(({ item }, _push2, _parent2, _scopeId) => {
            if (_push2) {
              if (item.on_trial && item.trial_ends_at) {
                _push2(`<span class="text-body-2" data-v-f4f395f6${_scopeId}>`);
                _push2(ssrRenderComponent(VIcon, {
                  size: "14",
                  color: item.days_to_trial_end <= 3 ? "warning" : "info"
                }, {
                  default: withCtx((_, _push3, _parent3, _scopeId2) => {
                    if (_push3) {
                      _push3(`mdi-clock-outline`);
                    } else {
                      return [
                        createTextVNode("mdi-clock-outline")
                      ];
                    }
                  }),
                  _: 2
                }, _parent2, _scopeId));
                _push2(` ${ssrInterpolate(item.days_to_trial_end)}d left </span>`);
              } else {
                _push2(`<span class="text-body-2 text-medium-emphasis" data-v-f4f395f6${_scopeId}>—</span>`);
              }
            } else {
              return [
                item.on_trial && item.trial_ends_at ? (openBlock(), createBlock("span", {
                  key: 0,
                  class: "text-body-2"
                }, [
                  createVNode(VIcon, {
                    size: "14",
                    color: item.days_to_trial_end <= 3 ? "warning" : "info"
                  }, {
                    default: withCtx(() => [
                      createTextVNode("mdi-clock-outline")
                    ]),
                    _: 1
                  }, 8, ["color"]),
                  createTextVNode(" " + toDisplayString(item.days_to_trial_end) + "d left ", 1)
                ])) : (openBlock(), createBlock("span", {
                  key: 1,
                  class: "text-body-2 text-medium-emphasis"
                }, "—"))
              ];
            }
          }),
          "item.created_on": withCtx(({ item }, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`<span class="text-body-2 text-medium-emphasis" data-v-f4f395f6${_scopeId}>${ssrInterpolate(formatDate(item.created_on))}</span>`);
            } else {
              return [
                createVNode("span", { class: "text-body-2 text-medium-emphasis" }, toDisplayString(formatDate(item.created_on)), 1)
              ];
            }
          }),
          "item.actions": withCtx(({ item }, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`<div class="d-flex ga-1" data-v-f4f395f6${_scopeId}>`);
              if (item.status !== "suspended") {
                _push2(ssrRenderComponent(VBtn, {
                  size: "small",
                  variant: "text",
                  color: "warning",
                  loading: unref(actionLoading) === item.id,
                  onClick: ($event) => suspendTenant(item)
                }, {
                  default: withCtx((_, _push3, _parent3, _scopeId2) => {
                    if (_push3) {
                      _push3(`Suspend`);
                    } else {
                      return [
                        createTextVNode("Suspend")
                      ];
                    }
                  }),
                  _: 2
                }, _parent2, _scopeId));
              } else {
                _push2(ssrRenderComponent(VBtn, {
                  size: "small",
                  variant: "text",
                  color: "success",
                  loading: unref(actionLoading) === item.id,
                  onClick: ($event) => activateTenant(item)
                }, {
                  default: withCtx((_, _push3, _parent3, _scopeId2) => {
                    if (_push3) {
                      _push3(`Activate`);
                    } else {
                      return [
                        createTextVNode("Activate")
                      ];
                    }
                  }),
                  _: 2
                }, _parent2, _scopeId));
              }
              _push2(ssrRenderComponent(VBtn, {
                size: "small",
                variant: "text",
                onClick: ($event) => openDetail(item)
              }, {
                default: withCtx((_, _push3, _parent3, _scopeId2) => {
                  if (_push3) {
                    _push3(`Manage`);
                  } else {
                    return [
                      createTextVNode("Manage")
                    ];
                  }
                }),
                _: 2
              }, _parent2, _scopeId));
              _push2(`</div>`);
            } else {
              return [
                createVNode("div", {
                  class: "d-flex ga-1",
                  onClick: withModifiers(() => {
                  }, ["stop"])
                }, [
                  item.status !== "suspended" ? (openBlock(), createBlock(VBtn, {
                    key: 0,
                    size: "small",
                    variant: "text",
                    color: "warning",
                    loading: unref(actionLoading) === item.id,
                    onClick: ($event) => suspendTenant(item)
                  }, {
                    default: withCtx(() => [
                      createTextVNode("Suspend")
                    ]),
                    _: 1
                  }, 8, ["loading", "onClick"])) : (openBlock(), createBlock(VBtn, {
                    key: 1,
                    size: "small",
                    variant: "text",
                    color: "success",
                    loading: unref(actionLoading) === item.id,
                    onClick: ($event) => activateTenant(item)
                  }, {
                    default: withCtx(() => [
                      createTextVNode("Activate")
                    ]),
                    _: 1
                  }, 8, ["loading", "onClick"])),
                  createVNode(VBtn, {
                    size: "small",
                    variant: "text",
                    onClick: ($event) => openDetail(item)
                  }, {
                    default: withCtx(() => [
                      createTextVNode("Manage")
                    ]),
                    _: 1
                  }, 8, ["onClick"])
                ], 8, ["onClick"])
              ];
            }
          }),
          "no-data": withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`<div class="sa-empty" data-v-f4f395f6${_scopeId}>`);
              _push2(ssrRenderComponent(VIcon, {
                size: "48",
                color: "grey-lighten-1"
              }, {
                default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                  if (_push3) {
                    _push3(`mdi-domain-off`);
                  } else {
                    return [
                      createTextVNode("mdi-domain-off")
                    ];
                  }
                }),
                _: 1
              }, _parent2, _scopeId));
              _push2(`<p class="text-body-1 text-medium-emphasis mt-2" data-v-f4f395f6${_scopeId}>No tenants found</p></div>`);
            } else {
              return [
                createVNode("div", { class: "sa-empty" }, [
                  createVNode(VIcon, {
                    size: "48",
                    color: "grey-lighten-1"
                  }, {
                    default: withCtx(() => [
                      createTextVNode("mdi-domain-off")
                    ]),
                    _: 1
                  }),
                  createVNode("p", { class: "text-body-1 text-medium-emphasis mt-2" }, "No tenants found")
                ])
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(`</div>`);
      }
      _push(ssrRenderComponent(VNavigationDrawer, {
        modelValue: unref(drawerOpen),
        "onUpdate:modelValue": ($event) => isRef(drawerOpen) ? drawerOpen.value = $event : null,
        location: "right",
        width: "520",
        temporary: "",
        class: "sa-drawer"
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            if (unref(selected)) {
              _push2(`<!--[--><div class="sa-drawer__header" data-v-f4f395f6${_scopeId}><div class="d-flex align-center ga-3" data-v-f4f395f6${_scopeId}><div class="sa-tenant-row__avatar" style="${ssrRenderStyle([avatarStyle(unref(selected).name), { "width": "48px", "height": "48px", "font-size": "1.2rem" }])}" data-v-f4f395f6${_scopeId}>${ssrInterpolate(unref(selected).name?.charAt(0)?.toUpperCase())}</div><div class="flex-grow-1" style="${ssrRenderStyle({ "min-width": "0" })}" data-v-f4f395f6${_scopeId}><h3 class="text-h6 font-weight-bold" style="${ssrRenderStyle({ "overflow": "hidden", "text-overflow": "ellipsis", "white-space": "nowrap" })}" data-v-f4f395f6${_scopeId}>${ssrInterpolate(unref(selected).name)}</h3><p class="text-caption text-medium-emphasis" data-v-f4f395f6${_scopeId}>${ssrInterpolate(unref(selected).contact_email || "—")}</p></div>`);
              _push2(ssrRenderComponent(VBtn, {
                icon: "mdi-close",
                variant: "text",
                size: "small",
                onClick: ($event) => drawerOpen.value = false
              }, null, _parent2, _scopeId));
              _push2(`</div><div class="d-flex ga-2 mt-3 flex-wrap" data-v-f4f395f6${_scopeId}>`);
              _push2(ssrRenderComponent(VChip, {
                color: planColor(unref(selected).plan),
                size: "small",
                variant: "tonal",
                label: ""
              }, {
                default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                  if (_push3) {
                    _push3(`${ssrInterpolate(unref(selected).plan)}`);
                  } else {
                    return [
                      createTextVNode(toDisplayString(unref(selected).plan), 1)
                    ];
                  }
                }),
                _: 1
              }, _parent2, _scopeId));
              _push2(ssrRenderComponent(VChip, {
                color: statusColor(unref(selected).status),
                size: "small",
                variant: "tonal",
                label: ""
              }, {
                default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                  if (_push3) {
                    _push3(`${ssrInterpolate(unref(selected).status)}`);
                  } else {
                    return [
                      createTextVNode(toDisplayString(unref(selected).status), 1)
                    ];
                  }
                }),
                _: 1
              }, _parent2, _scopeId));
              if (unref(selected).on_trial) {
                _push2(ssrRenderComponent(VChip, {
                  size: "small",
                  variant: "tonal",
                  color: "info",
                  label: ""
                }, {
                  default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                    if (_push3) {
                      _push3(`${ssrInterpolate(unref(selected).days_to_trial_end)}d trial left `);
                    } else {
                      return [
                        createTextVNode(toDisplayString(unref(selected).days_to_trial_end) + "d trial left ", 1)
                      ];
                    }
                  }),
                  _: 1
                }, _parent2, _scopeId));
              } else {
                _push2(`<!---->`);
              }
              _push2(`</div></div>`);
              _push2(ssrRenderComponent(VTabs, {
                modelValue: unref(detailTab),
                "onUpdate:modelValue": ($event) => isRef(detailTab) ? detailTab.value = $event : null,
                density: "compact",
                color: "primary",
                grow: ""
              }, {
                default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                  if (_push3) {
                    _push3(ssrRenderComponent(VTab, {
                      value: "overview",
                      "prepend-icon": "mdi-information-outline"
                    }, {
                      default: withCtx((_3, _push4, _parent4, _scopeId3) => {
                        if (_push4) {
                          _push4(`Overview`);
                        } else {
                          return [
                            createTextVNode("Overview")
                          ];
                        }
                      }),
                      _: 1
                    }, _parent3, _scopeId2));
                    _push3(ssrRenderComponent(VTab, {
                      value: "manage",
                      "prepend-icon": "mdi-pencil-outline"
                    }, {
                      default: withCtx((_3, _push4, _parent4, _scopeId3) => {
                        if (_push4) {
                          _push4(`Manage`);
                        } else {
                          return [
                            createTextVNode("Manage")
                          ];
                        }
                      }),
                      _: 1
                    }, _parent3, _scopeId2));
                    _push3(ssrRenderComponent(VTab, {
                      value: "activity",
                      "prepend-icon": "mdi-history"
                    }, {
                      default: withCtx((_3, _push4, _parent4, _scopeId3) => {
                        if (_push4) {
                          _push4(`Activity`);
                        } else {
                          return [
                            createTextVNode("Activity")
                          ];
                        }
                      }),
                      _: 1
                    }, _parent3, _scopeId2));
                    _push3(ssrRenderComponent(VTab, {
                      value: "billing",
                      "prepend-icon": "mdi-cash-multiple"
                    }, {
                      default: withCtx((_3, _push4, _parent4, _scopeId3) => {
                        if (_push4) {
                          _push4(`Billing`);
                        } else {
                          return [
                            createTextVNode("Billing")
                          ];
                        }
                      }),
                      _: 1
                    }, _parent3, _scopeId2));
                  } else {
                    return [
                      createVNode(VTab, {
                        value: "overview",
                        "prepend-icon": "mdi-information-outline"
                      }, {
                        default: withCtx(() => [
                          createTextVNode("Overview")
                        ]),
                        _: 1
                      }),
                      createVNode(VTab, {
                        value: "manage",
                        "prepend-icon": "mdi-pencil-outline"
                      }, {
                        default: withCtx(() => [
                          createTextVNode("Manage")
                        ]),
                        _: 1
                      }),
                      createVNode(VTab, {
                        value: "activity",
                        "prepend-icon": "mdi-history"
                      }, {
                        default: withCtx(() => [
                          createTextVNode("Activity")
                        ]),
                        _: 1
                      }),
                      createVNode(VTab, {
                        value: "billing",
                        "prepend-icon": "mdi-cash-multiple"
                      }, {
                        default: withCtx(() => [
                          createTextVNode("Billing")
                        ]),
                        _: 1
                      })
                    ];
                  }
                }),
                _: 1
              }, _parent2, _scopeId));
              _push2(`<div class="sa-drawer__body" data-v-f4f395f6${_scopeId}>`);
              _push2(ssrRenderComponent(VWindow, {
                modelValue: unref(detailTab),
                "onUpdate:modelValue": ($event) => isRef(detailTab) ? detailTab.value = $event : null
              }, {
                default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                  if (_push3) {
                    _push3(ssrRenderComponent(VWindowItem, { value: "overview" }, {
                      default: withCtx((_3, _push4, _parent4, _scopeId3) => {
                        if (_push4) {
                          _push4(`<div class="sa-detail-grid mt-3" data-v-f4f395f6${_scopeId3}><div class="sa-detail-field" data-v-f4f395f6${_scopeId3}><span class="sa-detail-field__label" data-v-f4f395f6${_scopeId3}>Schema</span><span class="sa-detail-field__value" data-v-f4f395f6${_scopeId3}>${ssrInterpolate(unref(selected).schema_name)}</span></div><div class="sa-detail-field" data-v-f4f395f6${_scopeId3}><span class="sa-detail-field__label" data-v-f4f395f6${_scopeId3}>Currency</span><span class="sa-detail-field__value" data-v-f4f395f6${_scopeId3}>${ssrInterpolate(unref(selected).currency_code)} (${ssrInterpolate(unref(selected).currency_symbol)})</span></div><div class="sa-detail-field" data-v-f4f395f6${_scopeId3}><span class="sa-detail-field__label" data-v-f4f395f6${_scopeId3}>Timezone</span><span class="sa-detail-field__value" data-v-f4f395f6${_scopeId3}>${ssrInterpolate(unref(selected).timezone)}</span></div><div class="sa-detail-field" data-v-f4f395f6${_scopeId3}><span class="sa-detail-field__label" data-v-f4f395f6${_scopeId3}>Country</span><span class="sa-detail-field__value" data-v-f4f395f6${_scopeId3}>${ssrInterpolate(unref(selected).country || "—")}</span></div><div class="sa-detail-field" data-v-f4f395f6${_scopeId3}><span class="sa-detail-field__label" data-v-f4f395f6${_scopeId3}>Phone</span><span class="sa-detail-field__value" data-v-f4f395f6${_scopeId3}>${ssrInterpolate(unref(selected).contact_phone || "—")}</span></div><div class="sa-detail-field" data-v-f4f395f6${_scopeId3}><span class="sa-detail-field__label" data-v-f4f395f6${_scopeId3}>Created</span><span class="sa-detail-field__value" data-v-f4f395f6${_scopeId3}>${ssrInterpolate(formatDate(unref(selected).created_on))}</span></div><div class="sa-detail-field" data-v-f4f395f6${_scopeId3}><span class="sa-detail-field__label" data-v-f4f395f6${_scopeId3}>Max Branches</span><span class="sa-detail-field__value" data-v-f4f395f6${_scopeId3}>${ssrInterpolate(unref(selected).max_branches)}</span></div><div class="sa-detail-field" data-v-f4f395f6${_scopeId3}><span class="sa-detail-field__label" data-v-f4f395f6${_scopeId3}>Max Users</span><span class="sa-detail-field__value" data-v-f4f395f6${_scopeId3}>${ssrInterpolate(unref(selected).max_users)}</span></div><div class="sa-detail-field" data-v-f4f395f6${_scopeId3}><span class="sa-detail-field__label" data-v-f4f395f6${_scopeId3}>Max Products</span><span class="sa-detail-field__value" data-v-f4f395f6${_scopeId3}>${ssrInterpolate(unref(selected).max_products)}</span></div><div class="sa-detail-field" data-v-f4f395f6${_scopeId3}><span class="sa-detail-field__label" data-v-f4f395f6${_scopeId3}>Est. MRR</span><span class="sa-detail-field__value" data-v-f4f395f6${_scopeId3}>KSh ${ssrInterpolate(formatNum(unref(selected).mrr_estimate))}</span></div></div><div class="sa-divider" data-v-f4f395f6${_scopeId3}></div><p class="text-caption text-medium-emphasis mb-2" data-v-f4f395f6${_scopeId3}>DOMAINS</p><div class="d-flex flex-wrap ga-2" data-v-f4f395f6${_scopeId3}><!--[-->`);
                          ssrRenderList(unref(selected).domains, (d) => {
                            _push4(ssrRenderComponent(VChip, {
                              key: d.id,
                              size: "small",
                              variant: "outlined",
                              label: "",
                              color: d.is_primary ? "primary" : void 0
                            }, {
                              default: withCtx((_4, _push5, _parent5, _scopeId4) => {
                                if (_push5) {
                                  _push5(ssrRenderComponent(VIcon, {
                                    size: "14",
                                    start: ""
                                  }, {
                                    default: withCtx((_5, _push6, _parent6, _scopeId5) => {
                                      if (_push6) {
                                        _push6(`${ssrInterpolate(d.is_primary ? "mdi-star" : "mdi-web")}`);
                                      } else {
                                        return [
                                          createTextVNode(toDisplayString(d.is_primary ? "mdi-star" : "mdi-web"), 1)
                                        ];
                                      }
                                    }),
                                    _: 2
                                  }, _parent5, _scopeId4));
                                  _push5(` ${ssrInterpolate(d.domain)}`);
                                } else {
                                  return [
                                    createVNode(VIcon, {
                                      size: "14",
                                      start: ""
                                    }, {
                                      default: withCtx(() => [
                                        createTextVNode(toDisplayString(d.is_primary ? "mdi-star" : "mdi-web"), 1)
                                      ]),
                                      _: 2
                                    }, 1024),
                                    createTextVNode(" " + toDisplayString(d.domain), 1)
                                  ];
                                }
                              }),
                              _: 2
                            }, _parent4, _scopeId3));
                          });
                          _push4(`<!--]-->`);
                          if (!unref(selected).domains?.length) {
                            _push4(`<span class="text-body-2 text-medium-emphasis" data-v-f4f395f6${_scopeId3}>No domains</span>`);
                          } else {
                            _push4(`<!---->`);
                          }
                          _push4(`</div><div class="sa-divider" data-v-f4f395f6${_scopeId3}></div><p class="text-caption text-medium-emphasis mb-2" data-v-f4f395f6${_scopeId3}>NOTES</p><p class="text-body-2" data-v-f4f395f6${_scopeId3}>${ssrInterpolate(unref(selected).notes || "No internal notes")}</p>`);
                        } else {
                          return [
                            createVNode("div", { class: "sa-detail-grid mt-3" }, [
                              createVNode("div", { class: "sa-detail-field" }, [
                                createVNode("span", { class: "sa-detail-field__label" }, "Schema"),
                                createVNode("span", { class: "sa-detail-field__value" }, toDisplayString(unref(selected).schema_name), 1)
                              ]),
                              createVNode("div", { class: "sa-detail-field" }, [
                                createVNode("span", { class: "sa-detail-field__label" }, "Currency"),
                                createVNode("span", { class: "sa-detail-field__value" }, toDisplayString(unref(selected).currency_code) + " (" + toDisplayString(unref(selected).currency_symbol) + ")", 1)
                              ]),
                              createVNode("div", { class: "sa-detail-field" }, [
                                createVNode("span", { class: "sa-detail-field__label" }, "Timezone"),
                                createVNode("span", { class: "sa-detail-field__value" }, toDisplayString(unref(selected).timezone), 1)
                              ]),
                              createVNode("div", { class: "sa-detail-field" }, [
                                createVNode("span", { class: "sa-detail-field__label" }, "Country"),
                                createVNode("span", { class: "sa-detail-field__value" }, toDisplayString(unref(selected).country || "—"), 1)
                              ]),
                              createVNode("div", { class: "sa-detail-field" }, [
                                createVNode("span", { class: "sa-detail-field__label" }, "Phone"),
                                createVNode("span", { class: "sa-detail-field__value" }, toDisplayString(unref(selected).contact_phone || "—"), 1)
                              ]),
                              createVNode("div", { class: "sa-detail-field" }, [
                                createVNode("span", { class: "sa-detail-field__label" }, "Created"),
                                createVNode("span", { class: "sa-detail-field__value" }, toDisplayString(formatDate(unref(selected).created_on)), 1)
                              ]),
                              createVNode("div", { class: "sa-detail-field" }, [
                                createVNode("span", { class: "sa-detail-field__label" }, "Max Branches"),
                                createVNode("span", { class: "sa-detail-field__value" }, toDisplayString(unref(selected).max_branches), 1)
                              ]),
                              createVNode("div", { class: "sa-detail-field" }, [
                                createVNode("span", { class: "sa-detail-field__label" }, "Max Users"),
                                createVNode("span", { class: "sa-detail-field__value" }, toDisplayString(unref(selected).max_users), 1)
                              ]),
                              createVNode("div", { class: "sa-detail-field" }, [
                                createVNode("span", { class: "sa-detail-field__label" }, "Max Products"),
                                createVNode("span", { class: "sa-detail-field__value" }, toDisplayString(unref(selected).max_products), 1)
                              ]),
                              createVNode("div", { class: "sa-detail-field" }, [
                                createVNode("span", { class: "sa-detail-field__label" }, "Est. MRR"),
                                createVNode("span", { class: "sa-detail-field__value" }, "KSh " + toDisplayString(formatNum(unref(selected).mrr_estimate)), 1)
                              ])
                            ]),
                            createVNode("div", { class: "sa-divider" }),
                            createVNode("p", { class: "text-caption text-medium-emphasis mb-2" }, "DOMAINS"),
                            createVNode("div", { class: "d-flex flex-wrap ga-2" }, [
                              (openBlock(true), createBlock(Fragment, null, renderList(unref(selected).domains, (d) => {
                                return openBlock(), createBlock(VChip, {
                                  key: d.id,
                                  size: "small",
                                  variant: "outlined",
                                  label: "",
                                  color: d.is_primary ? "primary" : void 0
                                }, {
                                  default: withCtx(() => [
                                    createVNode(VIcon, {
                                      size: "14",
                                      start: ""
                                    }, {
                                      default: withCtx(() => [
                                        createTextVNode(toDisplayString(d.is_primary ? "mdi-star" : "mdi-web"), 1)
                                      ]),
                                      _: 2
                                    }, 1024),
                                    createTextVNode(" " + toDisplayString(d.domain), 1)
                                  ]),
                                  _: 2
                                }, 1032, ["color"]);
                              }), 128)),
                              !unref(selected).domains?.length ? (openBlock(), createBlock("span", {
                                key: 0,
                                class: "text-body-2 text-medium-emphasis"
                              }, "No domains")) : createCommentVNode("", true)
                            ]),
                            createVNode("div", { class: "sa-divider" }),
                            createVNode("p", { class: "text-caption text-medium-emphasis mb-2" }, "NOTES"),
                            createVNode("p", { class: "text-body-2" }, toDisplayString(unref(selected).notes || "No internal notes"), 1)
                          ];
                        }
                      }),
                      _: 1
                    }, _parent3, _scopeId2));
                    _push3(ssrRenderComponent(VWindowItem, { value: "manage" }, {
                      default: withCtx((_3, _push4, _parent4, _scopeId3) => {
                        if (_push4) {
                          _push4(`<div class="mt-3" data-v-f4f395f6${_scopeId3}><p class="text-caption text-medium-emphasis mb-2" data-v-f4f395f6${_scopeId3}>PLAN &amp; STATUS</p><div class="d-flex ga-2 flex-wrap mb-3" data-v-f4f395f6${_scopeId3}>`);
                          _push4(ssrRenderComponent(VSelect, {
                            modelValue: unref(manageForm).plan,
                            "onUpdate:modelValue": ($event) => unref(manageForm).plan = $event,
                            items: planValues,
                            density: "compact",
                            variant: "outlined",
                            label: "Plan",
                            "hide-details": "",
                            style: { "max-width": "180px" }
                          }, null, _parent4, _scopeId3));
                          _push4(ssrRenderComponent(VBtn, {
                            color: "primary",
                            variant: "tonal",
                            "prepend-icon": "mdi-swap-horizontal",
                            loading: unref(actionLoading) === unref(selected).id,
                            onClick: changePlan
                          }, {
                            default: withCtx((_4, _push5, _parent5, _scopeId4) => {
                              if (_push5) {
                                _push5(`Change Plan`);
                              } else {
                                return [
                                  createTextVNode("Change Plan")
                                ];
                              }
                            }),
                            _: 1
                          }, _parent4, _scopeId3));
                          _push4(`</div><div class="d-flex ga-2 flex-wrap mb-3" data-v-f4f395f6${_scopeId3}>`);
                          if (unref(selected).status !== "suspended") {
                            _push4(ssrRenderComponent(VBtn, {
                              size: "small",
                              variant: "outlined",
                              color: "warning",
                              "prepend-icon": "mdi-pause",
                              loading: unref(actionLoading) === unref(selected).id,
                              onClick: ($event) => suspendTenant(unref(selected))
                            }, {
                              default: withCtx((_4, _push5, _parent5, _scopeId4) => {
                                if (_push5) {
                                  _push5(`Suspend`);
                                } else {
                                  return [
                                    createTextVNode("Suspend")
                                  ];
                                }
                              }),
                              _: 1
                            }, _parent4, _scopeId3));
                          } else {
                            _push4(`<!---->`);
                          }
                          if (unref(selected).status !== "active") {
                            _push4(ssrRenderComponent(VBtn, {
                              size: "small",
                              variant: "outlined",
                              color: "success",
                              "prepend-icon": "mdi-play",
                              loading: unref(actionLoading) === unref(selected).id,
                              onClick: ($event) => activateTenant(unref(selected))
                            }, {
                              default: withCtx((_4, _push5, _parent5, _scopeId4) => {
                                if (_push5) {
                                  _push5(`Activate`);
                                } else {
                                  return [
                                    createTextVNode("Activate")
                                  ];
                                }
                              }),
                              _: 1
                            }, _parent4, _scopeId3));
                          } else {
                            _push4(`<!---->`);
                          }
                          if (unref(selected).status !== "cancelled") {
                            _push4(ssrRenderComponent(VBtn, {
                              size: "small",
                              variant: "outlined",
                              color: "error",
                              "prepend-icon": "mdi-cancel",
                              loading: unref(actionLoading) === unref(selected).id,
                              onClick: ($event) => cancelTenant(unref(selected))
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
                          } else {
                            _push4(`<!---->`);
                          }
                          _push4(`</div><p class="text-caption text-medium-emphasis mb-2 mt-4" data-v-f4f395f6${_scopeId3}>RESOURCE LIMITS</p><div class="sa-detail-grid" data-v-f4f395f6${_scopeId3}>`);
                          _push4(ssrRenderComponent(VTextField, {
                            modelValue: unref(manageForm).max_branches,
                            "onUpdate:modelValue": ($event) => unref(manageForm).max_branches = $event,
                            modelModifiers: { number: true },
                            type: "number",
                            density: "compact",
                            variant: "outlined",
                            label: "Max Branches",
                            "hide-details": ""
                          }, null, _parent4, _scopeId3));
                          _push4(ssrRenderComponent(VTextField, {
                            modelValue: unref(manageForm).max_users,
                            "onUpdate:modelValue": ($event) => unref(manageForm).max_users = $event,
                            modelModifiers: { number: true },
                            type: "number",
                            density: "compact",
                            variant: "outlined",
                            label: "Max Users",
                            "hide-details": ""
                          }, null, _parent4, _scopeId3));
                          _push4(ssrRenderComponent(VTextField, {
                            modelValue: unref(manageForm).max_products,
                            "onUpdate:modelValue": ($event) => unref(manageForm).max_products = $event,
                            modelModifiers: { number: true },
                            type: "number",
                            density: "compact",
                            variant: "outlined",
                            label: "Max Products",
                            "hide-details": ""
                          }, null, _parent4, _scopeId3));
                          _push4(`</div>`);
                          _push4(ssrRenderComponent(VBtn, {
                            class: "mt-3",
                            color: "primary",
                            variant: "tonal",
                            "prepend-icon": "mdi-content-save",
                            loading: unref(actionLoading) === unref(selected).id,
                            onClick: setLimits
                          }, {
                            default: withCtx((_4, _push5, _parent5, _scopeId4) => {
                              if (_push5) {
                                _push5(`Save Limits`);
                              } else {
                                return [
                                  createTextVNode("Save Limits")
                                ];
                              }
                            }),
                            _: 1
                          }, _parent4, _scopeId3));
                          _push4(`<p class="text-caption text-medium-emphasis mb-2 mt-5" data-v-f4f395f6${_scopeId3}>TRIAL</p><div class="d-flex ga-2 align-center flex-wrap" data-v-f4f395f6${_scopeId3}>`);
                          _push4(ssrRenderComponent(VTextField, {
                            modelValue: unref(manageForm).trial_days,
                            "onUpdate:modelValue": ($event) => unref(manageForm).trial_days = $event,
                            type: "number",
                            density: "compact",
                            variant: "outlined",
                            label: "Extend by (days)",
                            "hide-details": "",
                            style: { "max-width": "140px" }
                          }, null, _parent4, _scopeId3));
                          _push4(ssrRenderComponent(VBtn, {
                            color: "info",
                            variant: "tonal",
                            "prepend-icon": "mdi-calendar-clock",
                            loading: unref(actionLoading) === unref(selected).id,
                            onClick: extendTrial
                          }, {
                            default: withCtx((_4, _push5, _parent5, _scopeId4) => {
                              if (_push5) {
                                _push5(`Extend Trial`);
                              } else {
                                return [
                                  createTextVNode("Extend Trial")
                                ];
                              }
                            }),
                            _: 1
                          }, _parent4, _scopeId3));
                          _push4(`</div></div>`);
                        } else {
                          return [
                            createVNode("div", { class: "mt-3" }, [
                              createVNode("p", { class: "text-caption text-medium-emphasis mb-2" }, "PLAN & STATUS"),
                              createVNode("div", { class: "d-flex ga-2 flex-wrap mb-3" }, [
                                createVNode(VSelect, {
                                  modelValue: unref(manageForm).plan,
                                  "onUpdate:modelValue": ($event) => unref(manageForm).plan = $event,
                                  items: planValues,
                                  density: "compact",
                                  variant: "outlined",
                                  label: "Plan",
                                  "hide-details": "",
                                  style: { "max-width": "180px" }
                                }, null, 8, ["modelValue", "onUpdate:modelValue"]),
                                createVNode(VBtn, {
                                  color: "primary",
                                  variant: "tonal",
                                  "prepend-icon": "mdi-swap-horizontal",
                                  loading: unref(actionLoading) === unref(selected).id,
                                  onClick: changePlan
                                }, {
                                  default: withCtx(() => [
                                    createTextVNode("Change Plan")
                                  ]),
                                  _: 1
                                }, 8, ["loading"])
                              ]),
                              createVNode("div", { class: "d-flex ga-2 flex-wrap mb-3" }, [
                                unref(selected).status !== "suspended" ? (openBlock(), createBlock(VBtn, {
                                  key: 0,
                                  size: "small",
                                  variant: "outlined",
                                  color: "warning",
                                  "prepend-icon": "mdi-pause",
                                  loading: unref(actionLoading) === unref(selected).id,
                                  onClick: ($event) => suspendTenant(unref(selected))
                                }, {
                                  default: withCtx(() => [
                                    createTextVNode("Suspend")
                                  ]),
                                  _: 1
                                }, 8, ["loading", "onClick"])) : createCommentVNode("", true),
                                unref(selected).status !== "active" ? (openBlock(), createBlock(VBtn, {
                                  key: 1,
                                  size: "small",
                                  variant: "outlined",
                                  color: "success",
                                  "prepend-icon": "mdi-play",
                                  loading: unref(actionLoading) === unref(selected).id,
                                  onClick: ($event) => activateTenant(unref(selected))
                                }, {
                                  default: withCtx(() => [
                                    createTextVNode("Activate")
                                  ]),
                                  _: 1
                                }, 8, ["loading", "onClick"])) : createCommentVNode("", true),
                                unref(selected).status !== "cancelled" ? (openBlock(), createBlock(VBtn, {
                                  key: 2,
                                  size: "small",
                                  variant: "outlined",
                                  color: "error",
                                  "prepend-icon": "mdi-cancel",
                                  loading: unref(actionLoading) === unref(selected).id,
                                  onClick: ($event) => cancelTenant(unref(selected))
                                }, {
                                  default: withCtx(() => [
                                    createTextVNode("Cancel")
                                  ]),
                                  _: 1
                                }, 8, ["loading", "onClick"])) : createCommentVNode("", true)
                              ]),
                              createVNode("p", { class: "text-caption text-medium-emphasis mb-2 mt-4" }, "RESOURCE LIMITS"),
                              createVNode("div", { class: "sa-detail-grid" }, [
                                createVNode(VTextField, {
                                  modelValue: unref(manageForm).max_branches,
                                  "onUpdate:modelValue": ($event) => unref(manageForm).max_branches = $event,
                                  modelModifiers: { number: true },
                                  type: "number",
                                  density: "compact",
                                  variant: "outlined",
                                  label: "Max Branches",
                                  "hide-details": ""
                                }, null, 8, ["modelValue", "onUpdate:modelValue"]),
                                createVNode(VTextField, {
                                  modelValue: unref(manageForm).max_users,
                                  "onUpdate:modelValue": ($event) => unref(manageForm).max_users = $event,
                                  modelModifiers: { number: true },
                                  type: "number",
                                  density: "compact",
                                  variant: "outlined",
                                  label: "Max Users",
                                  "hide-details": ""
                                }, null, 8, ["modelValue", "onUpdate:modelValue"]),
                                createVNode(VTextField, {
                                  modelValue: unref(manageForm).max_products,
                                  "onUpdate:modelValue": ($event) => unref(manageForm).max_products = $event,
                                  modelModifiers: { number: true },
                                  type: "number",
                                  density: "compact",
                                  variant: "outlined",
                                  label: "Max Products",
                                  "hide-details": ""
                                }, null, 8, ["modelValue", "onUpdate:modelValue"])
                              ]),
                              createVNode(VBtn, {
                                class: "mt-3",
                                color: "primary",
                                variant: "tonal",
                                "prepend-icon": "mdi-content-save",
                                loading: unref(actionLoading) === unref(selected).id,
                                onClick: setLimits
                              }, {
                                default: withCtx(() => [
                                  createTextVNode("Save Limits")
                                ]),
                                _: 1
                              }, 8, ["loading"]),
                              createVNode("p", { class: "text-caption text-medium-emphasis mb-2 mt-5" }, "TRIAL"),
                              createVNode("div", { class: "d-flex ga-2 align-center flex-wrap" }, [
                                createVNode(VTextField, {
                                  modelValue: unref(manageForm).trial_days,
                                  "onUpdate:modelValue": ($event) => unref(manageForm).trial_days = $event,
                                  type: "number",
                                  density: "compact",
                                  variant: "outlined",
                                  label: "Extend by (days)",
                                  "hide-details": "",
                                  style: { "max-width": "140px" }
                                }, null, 8, ["modelValue", "onUpdate:modelValue"]),
                                createVNode(VBtn, {
                                  color: "info",
                                  variant: "tonal",
                                  "prepend-icon": "mdi-calendar-clock",
                                  loading: unref(actionLoading) === unref(selected).id,
                                  onClick: extendTrial
                                }, {
                                  default: withCtx(() => [
                                    createTextVNode("Extend Trial")
                                  ]),
                                  _: 1
                                }, 8, ["loading"])
                              ])
                            ])
                          ];
                        }
                      }),
                      _: 1
                    }, _parent3, _scopeId2));
                    _push3(ssrRenderComponent(VWindowItem, { value: "activity" }, {
                      default: withCtx((_3, _push4, _parent4, _scopeId3) => {
                        if (_push4) {
                          _push4(`<div class="mt-3" data-v-f4f395f6${_scopeId3}>`);
                          _push4(ssrRenderComponent(VBtn, {
                            color: "primary",
                            variant: "tonal",
                            size: "small",
                            "prepend-icon": "mdi-refresh",
                            loading: unref(loadingDrill),
                            onClick: loadActivity,
                            class: "mb-3"
                          }, {
                            default: withCtx((_4, _push5, _parent5, _scopeId4) => {
                              if (_push5) {
                                _push5(`Load Activity`);
                              } else {
                                return [
                                  createTextVNode("Load Activity")
                                ];
                              }
                            }),
                            _: 1
                          }, _parent4, _scopeId3));
                          if (!unref(activity).length && !unref(loadingDrill)) {
                            _push4(ssrRenderComponent(VAlert, {
                              type: "info",
                              variant: "tonal",
                              density: "compact"
                            }, {
                              default: withCtx((_4, _push5, _parent5, _scopeId4) => {
                                if (_push5) {
                                  _push5(`Click &quot;Load Activity&quot; to fetch this tenant&#39;s audit log.`);
                                } else {
                                  return [
                                    createTextVNode(`Click "Load Activity" to fetch this tenant's audit log.`)
                                  ];
                                }
                              }),
                              _: 1
                            }, _parent4, _scopeId3));
                          } else {
                            _push4(`<!---->`);
                          }
                          if (unref(activity).length) {
                            _push4(ssrRenderComponent(VTimeline, {
                              density: "compact",
                              side: "end"
                            }, {
                              default: withCtx((_4, _push5, _parent5, _scopeId4) => {
                                if (_push5) {
                                  _push5(`<!--[-->`);
                                  ssrRenderList(unref(activity), (a, i) => {
                                    _push5(ssrRenderComponent(VTimelineItem, {
                                      key: i,
                                      size: "x-small",
                                      "dot-color": activityColor(a.action)
                                    }, {
                                      default: withCtx((_5, _push6, _parent6, _scopeId5) => {
                                        if (_push6) {
                                          _push6(`<div class="d-flex justify-space-between" data-v-f4f395f6${_scopeId5}><span class="text-body-2 font-weight-medium" data-v-f4f395f6${_scopeId5}>${ssrInterpolate(a.action)}</span><span class="text-caption text-medium-emphasis" data-v-f4f395f6${_scopeId5}>${ssrInterpolate(formatTime(a.timestamp))}</span></div><p class="text-caption text-medium-emphasis" data-v-f4f395f6${_scopeId5}>${ssrInterpolate(a.user_email || "system")} · ${ssrInterpolate(a.resource_type)}</p>`);
                                        } else {
                                          return [
                                            createVNode("div", { class: "d-flex justify-space-between" }, [
                                              createVNode("span", { class: "text-body-2 font-weight-medium" }, toDisplayString(a.action), 1),
                                              createVNode("span", { class: "text-caption text-medium-emphasis" }, toDisplayString(formatTime(a.timestamp)), 1)
                                            ]),
                                            createVNode("p", { class: "text-caption text-medium-emphasis" }, toDisplayString(a.user_email || "system") + " · " + toDisplayString(a.resource_type), 1)
                                          ];
                                        }
                                      }),
                                      _: 2
                                    }, _parent5, _scopeId4));
                                  });
                                  _push5(`<!--]-->`);
                                } else {
                                  return [
                                    (openBlock(true), createBlock(Fragment, null, renderList(unref(activity), (a, i) => {
                                      return openBlock(), createBlock(VTimelineItem, {
                                        key: i,
                                        size: "x-small",
                                        "dot-color": activityColor(a.action)
                                      }, {
                                        default: withCtx(() => [
                                          createVNode("div", { class: "d-flex justify-space-between" }, [
                                            createVNode("span", { class: "text-body-2 font-weight-medium" }, toDisplayString(a.action), 1),
                                            createVNode("span", { class: "text-caption text-medium-emphasis" }, toDisplayString(formatTime(a.timestamp)), 1)
                                          ]),
                                          createVNode("p", { class: "text-caption text-medium-emphasis" }, toDisplayString(a.user_email || "system") + " · " + toDisplayString(a.resource_type), 1)
                                        ]),
                                        _: 2
                                      }, 1032, ["dot-color"]);
                                    }), 128))
                                  ];
                                }
                              }),
                              _: 1
                            }, _parent4, _scopeId3));
                          } else {
                            _push4(`<!---->`);
                          }
                          _push4(`</div>`);
                        } else {
                          return [
                            createVNode("div", { class: "mt-3" }, [
                              createVNode(VBtn, {
                                color: "primary",
                                variant: "tonal",
                                size: "small",
                                "prepend-icon": "mdi-refresh",
                                loading: unref(loadingDrill),
                                onClick: loadActivity,
                                class: "mb-3"
                              }, {
                                default: withCtx(() => [
                                  createTextVNode("Load Activity")
                                ]),
                                _: 1
                              }, 8, ["loading"]),
                              !unref(activity).length && !unref(loadingDrill) ? (openBlock(), createBlock(VAlert, {
                                key: 0,
                                type: "info",
                                variant: "tonal",
                                density: "compact"
                              }, {
                                default: withCtx(() => [
                                  createTextVNode(`Click "Load Activity" to fetch this tenant's audit log.`)
                                ]),
                                _: 1
                              })) : createCommentVNode("", true),
                              unref(activity).length ? (openBlock(), createBlock(VTimeline, {
                                key: 1,
                                density: "compact",
                                side: "end"
                              }, {
                                default: withCtx(() => [
                                  (openBlock(true), createBlock(Fragment, null, renderList(unref(activity), (a, i) => {
                                    return openBlock(), createBlock(VTimelineItem, {
                                      key: i,
                                      size: "x-small",
                                      "dot-color": activityColor(a.action)
                                    }, {
                                      default: withCtx(() => [
                                        createVNode("div", { class: "d-flex justify-space-between" }, [
                                          createVNode("span", { class: "text-body-2 font-weight-medium" }, toDisplayString(a.action), 1),
                                          createVNode("span", { class: "text-caption text-medium-emphasis" }, toDisplayString(formatTime(a.timestamp)), 1)
                                        ]),
                                        createVNode("p", { class: "text-caption text-medium-emphasis" }, toDisplayString(a.user_email || "system") + " · " + toDisplayString(a.resource_type), 1)
                                      ]),
                                      _: 2
                                    }, 1032, ["dot-color"]);
                                  }), 128))
                                ]),
                                _: 1
                              })) : createCommentVNode("", true)
                            ])
                          ];
                        }
                      }),
                      _: 1
                    }, _parent3, _scopeId2));
                    _push3(ssrRenderComponent(VWindowItem, { value: "billing" }, {
                      default: withCtx((_3, _push4, _parent4, _scopeId3) => {
                        if (_push4) {
                          _push4(`<div class="mt-3" data-v-f4f395f6${_scopeId3}>`);
                          _push4(ssrRenderComponent(VBtn, {
                            color: "primary",
                            variant: "tonal",
                            size: "small",
                            "prepend-icon": "mdi-refresh",
                            loading: unref(loadingDrill),
                            onClick: loadBilling,
                            class: "mb-3"
                          }, {
                            default: withCtx((_4, _push5, _parent5, _scopeId4) => {
                              if (_push5) {
                                _push5(`Load Billing`);
                              } else {
                                return [
                                  createTextVNode("Load Billing")
                                ];
                              }
                            }),
                            _: 1
                          }, _parent4, _scopeId3));
                          if (unref(billing) === null && !unref(loadingDrill)) {
                            _push4(ssrRenderComponent(VAlert, {
                              type: "info",
                              variant: "tonal",
                              density: "compact"
                            }, {
                              default: withCtx((_4, _push5, _parent5, _scopeId4) => {
                                if (_push5) {
                                  _push5(`Click &quot;Load Billing&quot; to fetch invoices &amp; payments.`);
                                } else {
                                  return [
                                    createTextVNode('Click "Load Billing" to fetch invoices & payments.')
                                  ];
                                }
                              }),
                              _: 1
                            }, _parent4, _scopeId3));
                          } else {
                            _push4(`<!---->`);
                          }
                          if (unref(billing)) {
                            _push4(`<!--[--><div class="d-flex ga-3 flex-wrap mb-4" data-v-f4f395f6${_scopeId3}>`);
                            _push4(ssrRenderComponent(VChip, {
                              color: "success",
                              variant: "tonal",
                              size: "small"
                            }, {
                              default: withCtx((_4, _push5, _parent5, _scopeId4) => {
                                if (_push5) {
                                  _push5(`Paid: KSh ${ssrInterpolate(formatNum(unref(billing).paid_total))}`);
                                } else {
                                  return [
                                    createTextVNode("Paid: KSh " + toDisplayString(formatNum(unref(billing).paid_total)), 1)
                                  ];
                                }
                              }),
                              _: 1
                            }, _parent4, _scopeId3));
                            _push4(ssrRenderComponent(VChip, {
                              color: "primary",
                              variant: "tonal",
                              size: "small"
                            }, {
                              default: withCtx((_4, _push5, _parent5, _scopeId4) => {
                                if (_push5) {
                                  _push5(`${ssrInterpolate(unref(billing).invoices.length)} invoices`);
                                } else {
                                  return [
                                    createTextVNode(toDisplayString(unref(billing).invoices.length) + " invoices", 1)
                                  ];
                                }
                              }),
                              _: 1
                            }, _parent4, _scopeId3));
                            _push4(ssrRenderComponent(VChip, {
                              color: "info",
                              variant: "tonal",
                              size: "small"
                            }, {
                              default: withCtx((_4, _push5, _parent5, _scopeId4) => {
                                if (_push5) {
                                  _push5(`${ssrInterpolate(unref(billing).payments.length)} payments`);
                                } else {
                                  return [
                                    createTextVNode(toDisplayString(unref(billing).payments.length) + " payments", 1)
                                  ];
                                }
                              }),
                              _: 1
                            }, _parent4, _scopeId3));
                            _push4(`</div><p class="text-caption text-medium-emphasis mb-1" data-v-f4f395f6${_scopeId3}>INVOICES</p>`);
                            _push4(ssrRenderComponent(VList, {
                              density: "compact",
                              lines: "one",
                              class: "px-0"
                            }, {
                              default: withCtx((_4, _push5, _parent5, _scopeId4) => {
                                if (_push5) {
                                  _push5(`<!--[-->`);
                                  ssrRenderList(unref(billing).invoices, (inv) => {
                                    _push5(ssrRenderComponent(VListItem, {
                                      key: inv.id
                                    }, {
                                      append: withCtx((_5, _push6, _parent6, _scopeId5) => {
                                        if (_push6) {
                                          _push6(ssrRenderComponent(VChip, {
                                            color: invColor(inv.status),
                                            size: "x-small",
                                            variant: "tonal",
                                            label: ""
                                          }, {
                                            default: withCtx((_6, _push7, _parent7, _scopeId6) => {
                                              if (_push7) {
                                                _push7(`${ssrInterpolate(inv.status)}`);
                                              } else {
                                                return [
                                                  createTextVNode(toDisplayString(inv.status), 1)
                                                ];
                                              }
                                            }),
                                            _: 2
                                          }, _parent6, _scopeId5));
                                        } else {
                                          return [
                                            createVNode(VChip, {
                                              color: invColor(inv.status),
                                              size: "x-small",
                                              variant: "tonal",
                                              label: ""
                                            }, {
                                              default: withCtx(() => [
                                                createTextVNode(toDisplayString(inv.status), 1)
                                              ]),
                                              _: 2
                                            }, 1032, ["color"])
                                          ];
                                        }
                                      }),
                                      default: withCtx((_5, _push6, _parent6, _scopeId5) => {
                                        if (_push6) {
                                          _push6(ssrRenderComponent(VListItemTitle, { class: "text-body-2" }, {
                                            default: withCtx((_6, _push7, _parent7, _scopeId6) => {
                                              if (_push7) {
                                                _push7(`${ssrInterpolate(inv.invoice_number)} — KSh ${ssrInterpolate(formatNum(inv.total))}`);
                                              } else {
                                                return [
                                                  createTextVNode(toDisplayString(inv.invoice_number) + " — KSh " + toDisplayString(formatNum(inv.total)), 1)
                                                ];
                                              }
                                            }),
                                            _: 2
                                          }, _parent6, _scopeId5));
                                          _push6(ssrRenderComponent(VListItemSubtitle, null, {
                                            default: withCtx((_6, _push7, _parent7, _scopeId6) => {
                                              if (_push7) {
                                                _push7(`${ssrInterpolate(inv.status)} · due ${ssrInterpolate(formatDate(inv.due_date))}`);
                                              } else {
                                                return [
                                                  createTextVNode(toDisplayString(inv.status) + " · due " + toDisplayString(formatDate(inv.due_date)), 1)
                                                ];
                                              }
                                            }),
                                            _: 2
                                          }, _parent6, _scopeId5));
                                        } else {
                                          return [
                                            createVNode(VListItemTitle, { class: "text-body-2" }, {
                                              default: withCtx(() => [
                                                createTextVNode(toDisplayString(inv.invoice_number) + " — KSh " + toDisplayString(formatNum(inv.total)), 1)
                                              ]),
                                              _: 2
                                            }, 1024),
                                            createVNode(VListItemSubtitle, null, {
                                              default: withCtx(() => [
                                                createTextVNode(toDisplayString(inv.status) + " · due " + toDisplayString(formatDate(inv.due_date)), 1)
                                              ]),
                                              _: 2
                                            }, 1024)
                                          ];
                                        }
                                      }),
                                      _: 2
                                    }, _parent5, _scopeId4));
                                  });
                                  _push5(`<!--]-->`);
                                } else {
                                  return [
                                    (openBlock(true), createBlock(Fragment, null, renderList(unref(billing).invoices, (inv) => {
                                      return openBlock(), createBlock(VListItem, {
                                        key: inv.id
                                      }, {
                                        append: withCtx(() => [
                                          createVNode(VChip, {
                                            color: invColor(inv.status),
                                            size: "x-small",
                                            variant: "tonal",
                                            label: ""
                                          }, {
                                            default: withCtx(() => [
                                              createTextVNode(toDisplayString(inv.status), 1)
                                            ]),
                                            _: 2
                                          }, 1032, ["color"])
                                        ]),
                                        default: withCtx(() => [
                                          createVNode(VListItemTitle, { class: "text-body-2" }, {
                                            default: withCtx(() => [
                                              createTextVNode(toDisplayString(inv.invoice_number) + " — KSh " + toDisplayString(formatNum(inv.total)), 1)
                                            ]),
                                            _: 2
                                          }, 1024),
                                          createVNode(VListItemSubtitle, null, {
                                            default: withCtx(() => [
                                              createTextVNode(toDisplayString(inv.status) + " · due " + toDisplayString(formatDate(inv.due_date)), 1)
                                            ]),
                                            _: 2
                                          }, 1024)
                                        ]),
                                        _: 2
                                      }, 1024);
                                    }), 128))
                                  ];
                                }
                              }),
                              _: 1
                            }, _parent4, _scopeId3));
                            _push4(`<!--]-->`);
                          } else {
                            _push4(`<!---->`);
                          }
                          _push4(`</div>`);
                        } else {
                          return [
                            createVNode("div", { class: "mt-3" }, [
                              createVNode(VBtn, {
                                color: "primary",
                                variant: "tonal",
                                size: "small",
                                "prepend-icon": "mdi-refresh",
                                loading: unref(loadingDrill),
                                onClick: loadBilling,
                                class: "mb-3"
                              }, {
                                default: withCtx(() => [
                                  createTextVNode("Load Billing")
                                ]),
                                _: 1
                              }, 8, ["loading"]),
                              unref(billing) === null && !unref(loadingDrill) ? (openBlock(), createBlock(VAlert, {
                                key: 0,
                                type: "info",
                                variant: "tonal",
                                density: "compact"
                              }, {
                                default: withCtx(() => [
                                  createTextVNode('Click "Load Billing" to fetch invoices & payments.')
                                ]),
                                _: 1
                              })) : createCommentVNode("", true),
                              unref(billing) ? (openBlock(), createBlock(Fragment, { key: 1 }, [
                                createVNode("div", { class: "d-flex ga-3 flex-wrap mb-4" }, [
                                  createVNode(VChip, {
                                    color: "success",
                                    variant: "tonal",
                                    size: "small"
                                  }, {
                                    default: withCtx(() => [
                                      createTextVNode("Paid: KSh " + toDisplayString(formatNum(unref(billing).paid_total)), 1)
                                    ]),
                                    _: 1
                                  }),
                                  createVNode(VChip, {
                                    color: "primary",
                                    variant: "tonal",
                                    size: "small"
                                  }, {
                                    default: withCtx(() => [
                                      createTextVNode(toDisplayString(unref(billing).invoices.length) + " invoices", 1)
                                    ]),
                                    _: 1
                                  }),
                                  createVNode(VChip, {
                                    color: "info",
                                    variant: "tonal",
                                    size: "small"
                                  }, {
                                    default: withCtx(() => [
                                      createTextVNode(toDisplayString(unref(billing).payments.length) + " payments", 1)
                                    ]),
                                    _: 1
                                  })
                                ]),
                                createVNode("p", { class: "text-caption text-medium-emphasis mb-1" }, "INVOICES"),
                                createVNode(VList, {
                                  density: "compact",
                                  lines: "one",
                                  class: "px-0"
                                }, {
                                  default: withCtx(() => [
                                    (openBlock(true), createBlock(Fragment, null, renderList(unref(billing).invoices, (inv) => {
                                      return openBlock(), createBlock(VListItem, {
                                        key: inv.id
                                      }, {
                                        append: withCtx(() => [
                                          createVNode(VChip, {
                                            color: invColor(inv.status),
                                            size: "x-small",
                                            variant: "tonal",
                                            label: ""
                                          }, {
                                            default: withCtx(() => [
                                              createTextVNode(toDisplayString(inv.status), 1)
                                            ]),
                                            _: 2
                                          }, 1032, ["color"])
                                        ]),
                                        default: withCtx(() => [
                                          createVNode(VListItemTitle, { class: "text-body-2" }, {
                                            default: withCtx(() => [
                                              createTextVNode(toDisplayString(inv.invoice_number) + " — KSh " + toDisplayString(formatNum(inv.total)), 1)
                                            ]),
                                            _: 2
                                          }, 1024),
                                          createVNode(VListItemSubtitle, null, {
                                            default: withCtx(() => [
                                              createTextVNode(toDisplayString(inv.status) + " · due " + toDisplayString(formatDate(inv.due_date)), 1)
                                            ]),
                                            _: 2
                                          }, 1024)
                                        ]),
                                        _: 2
                                      }, 1024);
                                    }), 128))
                                  ]),
                                  _: 1
                                })
                              ], 64)) : createCommentVNode("", true)
                            ])
                          ];
                        }
                      }),
                      _: 1
                    }, _parent3, _scopeId2));
                  } else {
                    return [
                      createVNode(VWindowItem, { value: "overview" }, {
                        default: withCtx(() => [
                          createVNode("div", { class: "sa-detail-grid mt-3" }, [
                            createVNode("div", { class: "sa-detail-field" }, [
                              createVNode("span", { class: "sa-detail-field__label" }, "Schema"),
                              createVNode("span", { class: "sa-detail-field__value" }, toDisplayString(unref(selected).schema_name), 1)
                            ]),
                            createVNode("div", { class: "sa-detail-field" }, [
                              createVNode("span", { class: "sa-detail-field__label" }, "Currency"),
                              createVNode("span", { class: "sa-detail-field__value" }, toDisplayString(unref(selected).currency_code) + " (" + toDisplayString(unref(selected).currency_symbol) + ")", 1)
                            ]),
                            createVNode("div", { class: "sa-detail-field" }, [
                              createVNode("span", { class: "sa-detail-field__label" }, "Timezone"),
                              createVNode("span", { class: "sa-detail-field__value" }, toDisplayString(unref(selected).timezone), 1)
                            ]),
                            createVNode("div", { class: "sa-detail-field" }, [
                              createVNode("span", { class: "sa-detail-field__label" }, "Country"),
                              createVNode("span", { class: "sa-detail-field__value" }, toDisplayString(unref(selected).country || "—"), 1)
                            ]),
                            createVNode("div", { class: "sa-detail-field" }, [
                              createVNode("span", { class: "sa-detail-field__label" }, "Phone"),
                              createVNode("span", { class: "sa-detail-field__value" }, toDisplayString(unref(selected).contact_phone || "—"), 1)
                            ]),
                            createVNode("div", { class: "sa-detail-field" }, [
                              createVNode("span", { class: "sa-detail-field__label" }, "Created"),
                              createVNode("span", { class: "sa-detail-field__value" }, toDisplayString(formatDate(unref(selected).created_on)), 1)
                            ]),
                            createVNode("div", { class: "sa-detail-field" }, [
                              createVNode("span", { class: "sa-detail-field__label" }, "Max Branches"),
                              createVNode("span", { class: "sa-detail-field__value" }, toDisplayString(unref(selected).max_branches), 1)
                            ]),
                            createVNode("div", { class: "sa-detail-field" }, [
                              createVNode("span", { class: "sa-detail-field__label" }, "Max Users"),
                              createVNode("span", { class: "sa-detail-field__value" }, toDisplayString(unref(selected).max_users), 1)
                            ]),
                            createVNode("div", { class: "sa-detail-field" }, [
                              createVNode("span", { class: "sa-detail-field__label" }, "Max Products"),
                              createVNode("span", { class: "sa-detail-field__value" }, toDisplayString(unref(selected).max_products), 1)
                            ]),
                            createVNode("div", { class: "sa-detail-field" }, [
                              createVNode("span", { class: "sa-detail-field__label" }, "Est. MRR"),
                              createVNode("span", { class: "sa-detail-field__value" }, "KSh " + toDisplayString(formatNum(unref(selected).mrr_estimate)), 1)
                            ])
                          ]),
                          createVNode("div", { class: "sa-divider" }),
                          createVNode("p", { class: "text-caption text-medium-emphasis mb-2" }, "DOMAINS"),
                          createVNode("div", { class: "d-flex flex-wrap ga-2" }, [
                            (openBlock(true), createBlock(Fragment, null, renderList(unref(selected).domains, (d) => {
                              return openBlock(), createBlock(VChip, {
                                key: d.id,
                                size: "small",
                                variant: "outlined",
                                label: "",
                                color: d.is_primary ? "primary" : void 0
                              }, {
                                default: withCtx(() => [
                                  createVNode(VIcon, {
                                    size: "14",
                                    start: ""
                                  }, {
                                    default: withCtx(() => [
                                      createTextVNode(toDisplayString(d.is_primary ? "mdi-star" : "mdi-web"), 1)
                                    ]),
                                    _: 2
                                  }, 1024),
                                  createTextVNode(" " + toDisplayString(d.domain), 1)
                                ]),
                                _: 2
                              }, 1032, ["color"]);
                            }), 128)),
                            !unref(selected).domains?.length ? (openBlock(), createBlock("span", {
                              key: 0,
                              class: "text-body-2 text-medium-emphasis"
                            }, "No domains")) : createCommentVNode("", true)
                          ]),
                          createVNode("div", { class: "sa-divider" }),
                          createVNode("p", { class: "text-caption text-medium-emphasis mb-2" }, "NOTES"),
                          createVNode("p", { class: "text-body-2" }, toDisplayString(unref(selected).notes || "No internal notes"), 1)
                        ]),
                        _: 1
                      }),
                      createVNode(VWindowItem, { value: "manage" }, {
                        default: withCtx(() => [
                          createVNode("div", { class: "mt-3" }, [
                            createVNode("p", { class: "text-caption text-medium-emphasis mb-2" }, "PLAN & STATUS"),
                            createVNode("div", { class: "d-flex ga-2 flex-wrap mb-3" }, [
                              createVNode(VSelect, {
                                modelValue: unref(manageForm).plan,
                                "onUpdate:modelValue": ($event) => unref(manageForm).plan = $event,
                                items: planValues,
                                density: "compact",
                                variant: "outlined",
                                label: "Plan",
                                "hide-details": "",
                                style: { "max-width": "180px" }
                              }, null, 8, ["modelValue", "onUpdate:modelValue"]),
                              createVNode(VBtn, {
                                color: "primary",
                                variant: "tonal",
                                "prepend-icon": "mdi-swap-horizontal",
                                loading: unref(actionLoading) === unref(selected).id,
                                onClick: changePlan
                              }, {
                                default: withCtx(() => [
                                  createTextVNode("Change Plan")
                                ]),
                                _: 1
                              }, 8, ["loading"])
                            ]),
                            createVNode("div", { class: "d-flex ga-2 flex-wrap mb-3" }, [
                              unref(selected).status !== "suspended" ? (openBlock(), createBlock(VBtn, {
                                key: 0,
                                size: "small",
                                variant: "outlined",
                                color: "warning",
                                "prepend-icon": "mdi-pause",
                                loading: unref(actionLoading) === unref(selected).id,
                                onClick: ($event) => suspendTenant(unref(selected))
                              }, {
                                default: withCtx(() => [
                                  createTextVNode("Suspend")
                                ]),
                                _: 1
                              }, 8, ["loading", "onClick"])) : createCommentVNode("", true),
                              unref(selected).status !== "active" ? (openBlock(), createBlock(VBtn, {
                                key: 1,
                                size: "small",
                                variant: "outlined",
                                color: "success",
                                "prepend-icon": "mdi-play",
                                loading: unref(actionLoading) === unref(selected).id,
                                onClick: ($event) => activateTenant(unref(selected))
                              }, {
                                default: withCtx(() => [
                                  createTextVNode("Activate")
                                ]),
                                _: 1
                              }, 8, ["loading", "onClick"])) : createCommentVNode("", true),
                              unref(selected).status !== "cancelled" ? (openBlock(), createBlock(VBtn, {
                                key: 2,
                                size: "small",
                                variant: "outlined",
                                color: "error",
                                "prepend-icon": "mdi-cancel",
                                loading: unref(actionLoading) === unref(selected).id,
                                onClick: ($event) => cancelTenant(unref(selected))
                              }, {
                                default: withCtx(() => [
                                  createTextVNode("Cancel")
                                ]),
                                _: 1
                              }, 8, ["loading", "onClick"])) : createCommentVNode("", true)
                            ]),
                            createVNode("p", { class: "text-caption text-medium-emphasis mb-2 mt-4" }, "RESOURCE LIMITS"),
                            createVNode("div", { class: "sa-detail-grid" }, [
                              createVNode(VTextField, {
                                modelValue: unref(manageForm).max_branches,
                                "onUpdate:modelValue": ($event) => unref(manageForm).max_branches = $event,
                                modelModifiers: { number: true },
                                type: "number",
                                density: "compact",
                                variant: "outlined",
                                label: "Max Branches",
                                "hide-details": ""
                              }, null, 8, ["modelValue", "onUpdate:modelValue"]),
                              createVNode(VTextField, {
                                modelValue: unref(manageForm).max_users,
                                "onUpdate:modelValue": ($event) => unref(manageForm).max_users = $event,
                                modelModifiers: { number: true },
                                type: "number",
                                density: "compact",
                                variant: "outlined",
                                label: "Max Users",
                                "hide-details": ""
                              }, null, 8, ["modelValue", "onUpdate:modelValue"]),
                              createVNode(VTextField, {
                                modelValue: unref(manageForm).max_products,
                                "onUpdate:modelValue": ($event) => unref(manageForm).max_products = $event,
                                modelModifiers: { number: true },
                                type: "number",
                                density: "compact",
                                variant: "outlined",
                                label: "Max Products",
                                "hide-details": ""
                              }, null, 8, ["modelValue", "onUpdate:modelValue"])
                            ]),
                            createVNode(VBtn, {
                              class: "mt-3",
                              color: "primary",
                              variant: "tonal",
                              "prepend-icon": "mdi-content-save",
                              loading: unref(actionLoading) === unref(selected).id,
                              onClick: setLimits
                            }, {
                              default: withCtx(() => [
                                createTextVNode("Save Limits")
                              ]),
                              _: 1
                            }, 8, ["loading"]),
                            createVNode("p", { class: "text-caption text-medium-emphasis mb-2 mt-5" }, "TRIAL"),
                            createVNode("div", { class: "d-flex ga-2 align-center flex-wrap" }, [
                              createVNode(VTextField, {
                                modelValue: unref(manageForm).trial_days,
                                "onUpdate:modelValue": ($event) => unref(manageForm).trial_days = $event,
                                type: "number",
                                density: "compact",
                                variant: "outlined",
                                label: "Extend by (days)",
                                "hide-details": "",
                                style: { "max-width": "140px" }
                              }, null, 8, ["modelValue", "onUpdate:modelValue"]),
                              createVNode(VBtn, {
                                color: "info",
                                variant: "tonal",
                                "prepend-icon": "mdi-calendar-clock",
                                loading: unref(actionLoading) === unref(selected).id,
                                onClick: extendTrial
                              }, {
                                default: withCtx(() => [
                                  createTextVNode("Extend Trial")
                                ]),
                                _: 1
                              }, 8, ["loading"])
                            ])
                          ])
                        ]),
                        _: 1
                      }),
                      createVNode(VWindowItem, { value: "activity" }, {
                        default: withCtx(() => [
                          createVNode("div", { class: "mt-3" }, [
                            createVNode(VBtn, {
                              color: "primary",
                              variant: "tonal",
                              size: "small",
                              "prepend-icon": "mdi-refresh",
                              loading: unref(loadingDrill),
                              onClick: loadActivity,
                              class: "mb-3"
                            }, {
                              default: withCtx(() => [
                                createTextVNode("Load Activity")
                              ]),
                              _: 1
                            }, 8, ["loading"]),
                            !unref(activity).length && !unref(loadingDrill) ? (openBlock(), createBlock(VAlert, {
                              key: 0,
                              type: "info",
                              variant: "tonal",
                              density: "compact"
                            }, {
                              default: withCtx(() => [
                                createTextVNode(`Click "Load Activity" to fetch this tenant's audit log.`)
                              ]),
                              _: 1
                            })) : createCommentVNode("", true),
                            unref(activity).length ? (openBlock(), createBlock(VTimeline, {
                              key: 1,
                              density: "compact",
                              side: "end"
                            }, {
                              default: withCtx(() => [
                                (openBlock(true), createBlock(Fragment, null, renderList(unref(activity), (a, i) => {
                                  return openBlock(), createBlock(VTimelineItem, {
                                    key: i,
                                    size: "x-small",
                                    "dot-color": activityColor(a.action)
                                  }, {
                                    default: withCtx(() => [
                                      createVNode("div", { class: "d-flex justify-space-between" }, [
                                        createVNode("span", { class: "text-body-2 font-weight-medium" }, toDisplayString(a.action), 1),
                                        createVNode("span", { class: "text-caption text-medium-emphasis" }, toDisplayString(formatTime(a.timestamp)), 1)
                                      ]),
                                      createVNode("p", { class: "text-caption text-medium-emphasis" }, toDisplayString(a.user_email || "system") + " · " + toDisplayString(a.resource_type), 1)
                                    ]),
                                    _: 2
                                  }, 1032, ["dot-color"]);
                                }), 128))
                              ]),
                              _: 1
                            })) : createCommentVNode("", true)
                          ])
                        ]),
                        _: 1
                      }),
                      createVNode(VWindowItem, { value: "billing" }, {
                        default: withCtx(() => [
                          createVNode("div", { class: "mt-3" }, [
                            createVNode(VBtn, {
                              color: "primary",
                              variant: "tonal",
                              size: "small",
                              "prepend-icon": "mdi-refresh",
                              loading: unref(loadingDrill),
                              onClick: loadBilling,
                              class: "mb-3"
                            }, {
                              default: withCtx(() => [
                                createTextVNode("Load Billing")
                              ]),
                              _: 1
                            }, 8, ["loading"]),
                            unref(billing) === null && !unref(loadingDrill) ? (openBlock(), createBlock(VAlert, {
                              key: 0,
                              type: "info",
                              variant: "tonal",
                              density: "compact"
                            }, {
                              default: withCtx(() => [
                                createTextVNode('Click "Load Billing" to fetch invoices & payments.')
                              ]),
                              _: 1
                            })) : createCommentVNode("", true),
                            unref(billing) ? (openBlock(), createBlock(Fragment, { key: 1 }, [
                              createVNode("div", { class: "d-flex ga-3 flex-wrap mb-4" }, [
                                createVNode(VChip, {
                                  color: "success",
                                  variant: "tonal",
                                  size: "small"
                                }, {
                                  default: withCtx(() => [
                                    createTextVNode("Paid: KSh " + toDisplayString(formatNum(unref(billing).paid_total)), 1)
                                  ]),
                                  _: 1
                                }),
                                createVNode(VChip, {
                                  color: "primary",
                                  variant: "tonal",
                                  size: "small"
                                }, {
                                  default: withCtx(() => [
                                    createTextVNode(toDisplayString(unref(billing).invoices.length) + " invoices", 1)
                                  ]),
                                  _: 1
                                }),
                                createVNode(VChip, {
                                  color: "info",
                                  variant: "tonal",
                                  size: "small"
                                }, {
                                  default: withCtx(() => [
                                    createTextVNode(toDisplayString(unref(billing).payments.length) + " payments", 1)
                                  ]),
                                  _: 1
                                })
                              ]),
                              createVNode("p", { class: "text-caption text-medium-emphasis mb-1" }, "INVOICES"),
                              createVNode(VList, {
                                density: "compact",
                                lines: "one",
                                class: "px-0"
                              }, {
                                default: withCtx(() => [
                                  (openBlock(true), createBlock(Fragment, null, renderList(unref(billing).invoices, (inv) => {
                                    return openBlock(), createBlock(VListItem, {
                                      key: inv.id
                                    }, {
                                      append: withCtx(() => [
                                        createVNode(VChip, {
                                          color: invColor(inv.status),
                                          size: "x-small",
                                          variant: "tonal",
                                          label: ""
                                        }, {
                                          default: withCtx(() => [
                                            createTextVNode(toDisplayString(inv.status), 1)
                                          ]),
                                          _: 2
                                        }, 1032, ["color"])
                                      ]),
                                      default: withCtx(() => [
                                        createVNode(VListItemTitle, { class: "text-body-2" }, {
                                          default: withCtx(() => [
                                            createTextVNode(toDisplayString(inv.invoice_number) + " — KSh " + toDisplayString(formatNum(inv.total)), 1)
                                          ]),
                                          _: 2
                                        }, 1024),
                                        createVNode(VListItemSubtitle, null, {
                                          default: withCtx(() => [
                                            createTextVNode(toDisplayString(inv.status) + " · due " + toDisplayString(formatDate(inv.due_date)), 1)
                                          ]),
                                          _: 2
                                        }, 1024)
                                      ]),
                                      _: 2
                                    }, 1024);
                                  }), 128))
                                ]),
                                _: 1
                              })
                            ], 64)) : createCommentVNode("", true)
                          ])
                        ]),
                        _: 1
                      })
                    ];
                  }
                }),
                _: 1
              }, _parent2, _scopeId));
              _push2(`</div><!--]-->`);
            } else {
              _push2(`<!---->`);
            }
          } else {
            return [
              unref(selected) ? (openBlock(), createBlock(Fragment, { key: 0 }, [
                createVNode("div", { class: "sa-drawer__header" }, [
                  createVNode("div", { class: "d-flex align-center ga-3" }, [
                    createVNode("div", {
                      class: "sa-tenant-row__avatar",
                      style: [avatarStyle(unref(selected).name), { "width": "48px", "height": "48px", "font-size": "1.2rem" }]
                    }, toDisplayString(unref(selected).name?.charAt(0)?.toUpperCase()), 5),
                    createVNode("div", {
                      class: "flex-grow-1",
                      style: { "min-width": "0" }
                    }, [
                      createVNode("h3", {
                        class: "text-h6 font-weight-bold",
                        style: { "overflow": "hidden", "text-overflow": "ellipsis", "white-space": "nowrap" }
                      }, toDisplayString(unref(selected).name), 1),
                      createVNode("p", { class: "text-caption text-medium-emphasis" }, toDisplayString(unref(selected).contact_email || "—"), 1)
                    ]),
                    createVNode(VBtn, {
                      icon: "mdi-close",
                      variant: "text",
                      size: "small",
                      onClick: ($event) => drawerOpen.value = false
                    }, null, 8, ["onClick"])
                  ]),
                  createVNode("div", { class: "d-flex ga-2 mt-3 flex-wrap" }, [
                    createVNode(VChip, {
                      color: planColor(unref(selected).plan),
                      size: "small",
                      variant: "tonal",
                      label: ""
                    }, {
                      default: withCtx(() => [
                        createTextVNode(toDisplayString(unref(selected).plan), 1)
                      ]),
                      _: 1
                    }, 8, ["color"]),
                    createVNode(VChip, {
                      color: statusColor(unref(selected).status),
                      size: "small",
                      variant: "tonal",
                      label: ""
                    }, {
                      default: withCtx(() => [
                        createTextVNode(toDisplayString(unref(selected).status), 1)
                      ]),
                      _: 1
                    }, 8, ["color"]),
                    unref(selected).on_trial ? (openBlock(), createBlock(VChip, {
                      key: 0,
                      size: "small",
                      variant: "tonal",
                      color: "info",
                      label: ""
                    }, {
                      default: withCtx(() => [
                        createTextVNode(toDisplayString(unref(selected).days_to_trial_end) + "d trial left ", 1)
                      ]),
                      _: 1
                    })) : createCommentVNode("", true)
                  ])
                ]),
                createVNode(VTabs, {
                  modelValue: unref(detailTab),
                  "onUpdate:modelValue": ($event) => isRef(detailTab) ? detailTab.value = $event : null,
                  density: "compact",
                  color: "primary",
                  grow: ""
                }, {
                  default: withCtx(() => [
                    createVNode(VTab, {
                      value: "overview",
                      "prepend-icon": "mdi-information-outline"
                    }, {
                      default: withCtx(() => [
                        createTextVNode("Overview")
                      ]),
                      _: 1
                    }),
                    createVNode(VTab, {
                      value: "manage",
                      "prepend-icon": "mdi-pencil-outline"
                    }, {
                      default: withCtx(() => [
                        createTextVNode("Manage")
                      ]),
                      _: 1
                    }),
                    createVNode(VTab, {
                      value: "activity",
                      "prepend-icon": "mdi-history"
                    }, {
                      default: withCtx(() => [
                        createTextVNode("Activity")
                      ]),
                      _: 1
                    }),
                    createVNode(VTab, {
                      value: "billing",
                      "prepend-icon": "mdi-cash-multiple"
                    }, {
                      default: withCtx(() => [
                        createTextVNode("Billing")
                      ]),
                      _: 1
                    })
                  ]),
                  _: 1
                }, 8, ["modelValue", "onUpdate:modelValue"]),
                createVNode("div", { class: "sa-drawer__body" }, [
                  createVNode(VWindow, {
                    modelValue: unref(detailTab),
                    "onUpdate:modelValue": ($event) => isRef(detailTab) ? detailTab.value = $event : null
                  }, {
                    default: withCtx(() => [
                      createVNode(VWindowItem, { value: "overview" }, {
                        default: withCtx(() => [
                          createVNode("div", { class: "sa-detail-grid mt-3" }, [
                            createVNode("div", { class: "sa-detail-field" }, [
                              createVNode("span", { class: "sa-detail-field__label" }, "Schema"),
                              createVNode("span", { class: "sa-detail-field__value" }, toDisplayString(unref(selected).schema_name), 1)
                            ]),
                            createVNode("div", { class: "sa-detail-field" }, [
                              createVNode("span", { class: "sa-detail-field__label" }, "Currency"),
                              createVNode("span", { class: "sa-detail-field__value" }, toDisplayString(unref(selected).currency_code) + " (" + toDisplayString(unref(selected).currency_symbol) + ")", 1)
                            ]),
                            createVNode("div", { class: "sa-detail-field" }, [
                              createVNode("span", { class: "sa-detail-field__label" }, "Timezone"),
                              createVNode("span", { class: "sa-detail-field__value" }, toDisplayString(unref(selected).timezone), 1)
                            ]),
                            createVNode("div", { class: "sa-detail-field" }, [
                              createVNode("span", { class: "sa-detail-field__label" }, "Country"),
                              createVNode("span", { class: "sa-detail-field__value" }, toDisplayString(unref(selected).country || "—"), 1)
                            ]),
                            createVNode("div", { class: "sa-detail-field" }, [
                              createVNode("span", { class: "sa-detail-field__label" }, "Phone"),
                              createVNode("span", { class: "sa-detail-field__value" }, toDisplayString(unref(selected).contact_phone || "—"), 1)
                            ]),
                            createVNode("div", { class: "sa-detail-field" }, [
                              createVNode("span", { class: "sa-detail-field__label" }, "Created"),
                              createVNode("span", { class: "sa-detail-field__value" }, toDisplayString(formatDate(unref(selected).created_on)), 1)
                            ]),
                            createVNode("div", { class: "sa-detail-field" }, [
                              createVNode("span", { class: "sa-detail-field__label" }, "Max Branches"),
                              createVNode("span", { class: "sa-detail-field__value" }, toDisplayString(unref(selected).max_branches), 1)
                            ]),
                            createVNode("div", { class: "sa-detail-field" }, [
                              createVNode("span", { class: "sa-detail-field__label" }, "Max Users"),
                              createVNode("span", { class: "sa-detail-field__value" }, toDisplayString(unref(selected).max_users), 1)
                            ]),
                            createVNode("div", { class: "sa-detail-field" }, [
                              createVNode("span", { class: "sa-detail-field__label" }, "Max Products"),
                              createVNode("span", { class: "sa-detail-field__value" }, toDisplayString(unref(selected).max_products), 1)
                            ]),
                            createVNode("div", { class: "sa-detail-field" }, [
                              createVNode("span", { class: "sa-detail-field__label" }, "Est. MRR"),
                              createVNode("span", { class: "sa-detail-field__value" }, "KSh " + toDisplayString(formatNum(unref(selected).mrr_estimate)), 1)
                            ])
                          ]),
                          createVNode("div", { class: "sa-divider" }),
                          createVNode("p", { class: "text-caption text-medium-emphasis mb-2" }, "DOMAINS"),
                          createVNode("div", { class: "d-flex flex-wrap ga-2" }, [
                            (openBlock(true), createBlock(Fragment, null, renderList(unref(selected).domains, (d) => {
                              return openBlock(), createBlock(VChip, {
                                key: d.id,
                                size: "small",
                                variant: "outlined",
                                label: "",
                                color: d.is_primary ? "primary" : void 0
                              }, {
                                default: withCtx(() => [
                                  createVNode(VIcon, {
                                    size: "14",
                                    start: ""
                                  }, {
                                    default: withCtx(() => [
                                      createTextVNode(toDisplayString(d.is_primary ? "mdi-star" : "mdi-web"), 1)
                                    ]),
                                    _: 2
                                  }, 1024),
                                  createTextVNode(" " + toDisplayString(d.domain), 1)
                                ]),
                                _: 2
                              }, 1032, ["color"]);
                            }), 128)),
                            !unref(selected).domains?.length ? (openBlock(), createBlock("span", {
                              key: 0,
                              class: "text-body-2 text-medium-emphasis"
                            }, "No domains")) : createCommentVNode("", true)
                          ]),
                          createVNode("div", { class: "sa-divider" }),
                          createVNode("p", { class: "text-caption text-medium-emphasis mb-2" }, "NOTES"),
                          createVNode("p", { class: "text-body-2" }, toDisplayString(unref(selected).notes || "No internal notes"), 1)
                        ]),
                        _: 1
                      }),
                      createVNode(VWindowItem, { value: "manage" }, {
                        default: withCtx(() => [
                          createVNode("div", { class: "mt-3" }, [
                            createVNode("p", { class: "text-caption text-medium-emphasis mb-2" }, "PLAN & STATUS"),
                            createVNode("div", { class: "d-flex ga-2 flex-wrap mb-3" }, [
                              createVNode(VSelect, {
                                modelValue: unref(manageForm).plan,
                                "onUpdate:modelValue": ($event) => unref(manageForm).plan = $event,
                                items: planValues,
                                density: "compact",
                                variant: "outlined",
                                label: "Plan",
                                "hide-details": "",
                                style: { "max-width": "180px" }
                              }, null, 8, ["modelValue", "onUpdate:modelValue"]),
                              createVNode(VBtn, {
                                color: "primary",
                                variant: "tonal",
                                "prepend-icon": "mdi-swap-horizontal",
                                loading: unref(actionLoading) === unref(selected).id,
                                onClick: changePlan
                              }, {
                                default: withCtx(() => [
                                  createTextVNode("Change Plan")
                                ]),
                                _: 1
                              }, 8, ["loading"])
                            ]),
                            createVNode("div", { class: "d-flex ga-2 flex-wrap mb-3" }, [
                              unref(selected).status !== "suspended" ? (openBlock(), createBlock(VBtn, {
                                key: 0,
                                size: "small",
                                variant: "outlined",
                                color: "warning",
                                "prepend-icon": "mdi-pause",
                                loading: unref(actionLoading) === unref(selected).id,
                                onClick: ($event) => suspendTenant(unref(selected))
                              }, {
                                default: withCtx(() => [
                                  createTextVNode("Suspend")
                                ]),
                                _: 1
                              }, 8, ["loading", "onClick"])) : createCommentVNode("", true),
                              unref(selected).status !== "active" ? (openBlock(), createBlock(VBtn, {
                                key: 1,
                                size: "small",
                                variant: "outlined",
                                color: "success",
                                "prepend-icon": "mdi-play",
                                loading: unref(actionLoading) === unref(selected).id,
                                onClick: ($event) => activateTenant(unref(selected))
                              }, {
                                default: withCtx(() => [
                                  createTextVNode("Activate")
                                ]),
                                _: 1
                              }, 8, ["loading", "onClick"])) : createCommentVNode("", true),
                              unref(selected).status !== "cancelled" ? (openBlock(), createBlock(VBtn, {
                                key: 2,
                                size: "small",
                                variant: "outlined",
                                color: "error",
                                "prepend-icon": "mdi-cancel",
                                loading: unref(actionLoading) === unref(selected).id,
                                onClick: ($event) => cancelTenant(unref(selected))
                              }, {
                                default: withCtx(() => [
                                  createTextVNode("Cancel")
                                ]),
                                _: 1
                              }, 8, ["loading", "onClick"])) : createCommentVNode("", true)
                            ]),
                            createVNode("p", { class: "text-caption text-medium-emphasis mb-2 mt-4" }, "RESOURCE LIMITS"),
                            createVNode("div", { class: "sa-detail-grid" }, [
                              createVNode(VTextField, {
                                modelValue: unref(manageForm).max_branches,
                                "onUpdate:modelValue": ($event) => unref(manageForm).max_branches = $event,
                                modelModifiers: { number: true },
                                type: "number",
                                density: "compact",
                                variant: "outlined",
                                label: "Max Branches",
                                "hide-details": ""
                              }, null, 8, ["modelValue", "onUpdate:modelValue"]),
                              createVNode(VTextField, {
                                modelValue: unref(manageForm).max_users,
                                "onUpdate:modelValue": ($event) => unref(manageForm).max_users = $event,
                                modelModifiers: { number: true },
                                type: "number",
                                density: "compact",
                                variant: "outlined",
                                label: "Max Users",
                                "hide-details": ""
                              }, null, 8, ["modelValue", "onUpdate:modelValue"]),
                              createVNode(VTextField, {
                                modelValue: unref(manageForm).max_products,
                                "onUpdate:modelValue": ($event) => unref(manageForm).max_products = $event,
                                modelModifiers: { number: true },
                                type: "number",
                                density: "compact",
                                variant: "outlined",
                                label: "Max Products",
                                "hide-details": ""
                              }, null, 8, ["modelValue", "onUpdate:modelValue"])
                            ]),
                            createVNode(VBtn, {
                              class: "mt-3",
                              color: "primary",
                              variant: "tonal",
                              "prepend-icon": "mdi-content-save",
                              loading: unref(actionLoading) === unref(selected).id,
                              onClick: setLimits
                            }, {
                              default: withCtx(() => [
                                createTextVNode("Save Limits")
                              ]),
                              _: 1
                            }, 8, ["loading"]),
                            createVNode("p", { class: "text-caption text-medium-emphasis mb-2 mt-5" }, "TRIAL"),
                            createVNode("div", { class: "d-flex ga-2 align-center flex-wrap" }, [
                              createVNode(VTextField, {
                                modelValue: unref(manageForm).trial_days,
                                "onUpdate:modelValue": ($event) => unref(manageForm).trial_days = $event,
                                type: "number",
                                density: "compact",
                                variant: "outlined",
                                label: "Extend by (days)",
                                "hide-details": "",
                                style: { "max-width": "140px" }
                              }, null, 8, ["modelValue", "onUpdate:modelValue"]),
                              createVNode(VBtn, {
                                color: "info",
                                variant: "tonal",
                                "prepend-icon": "mdi-calendar-clock",
                                loading: unref(actionLoading) === unref(selected).id,
                                onClick: extendTrial
                              }, {
                                default: withCtx(() => [
                                  createTextVNode("Extend Trial")
                                ]),
                                _: 1
                              }, 8, ["loading"])
                            ])
                          ])
                        ]),
                        _: 1
                      }),
                      createVNode(VWindowItem, { value: "activity" }, {
                        default: withCtx(() => [
                          createVNode("div", { class: "mt-3" }, [
                            createVNode(VBtn, {
                              color: "primary",
                              variant: "tonal",
                              size: "small",
                              "prepend-icon": "mdi-refresh",
                              loading: unref(loadingDrill),
                              onClick: loadActivity,
                              class: "mb-3"
                            }, {
                              default: withCtx(() => [
                                createTextVNode("Load Activity")
                              ]),
                              _: 1
                            }, 8, ["loading"]),
                            !unref(activity).length && !unref(loadingDrill) ? (openBlock(), createBlock(VAlert, {
                              key: 0,
                              type: "info",
                              variant: "tonal",
                              density: "compact"
                            }, {
                              default: withCtx(() => [
                                createTextVNode(`Click "Load Activity" to fetch this tenant's audit log.`)
                              ]),
                              _: 1
                            })) : createCommentVNode("", true),
                            unref(activity).length ? (openBlock(), createBlock(VTimeline, {
                              key: 1,
                              density: "compact",
                              side: "end"
                            }, {
                              default: withCtx(() => [
                                (openBlock(true), createBlock(Fragment, null, renderList(unref(activity), (a, i) => {
                                  return openBlock(), createBlock(VTimelineItem, {
                                    key: i,
                                    size: "x-small",
                                    "dot-color": activityColor(a.action)
                                  }, {
                                    default: withCtx(() => [
                                      createVNode("div", { class: "d-flex justify-space-between" }, [
                                        createVNode("span", { class: "text-body-2 font-weight-medium" }, toDisplayString(a.action), 1),
                                        createVNode("span", { class: "text-caption text-medium-emphasis" }, toDisplayString(formatTime(a.timestamp)), 1)
                                      ]),
                                      createVNode("p", { class: "text-caption text-medium-emphasis" }, toDisplayString(a.user_email || "system") + " · " + toDisplayString(a.resource_type), 1)
                                    ]),
                                    _: 2
                                  }, 1032, ["dot-color"]);
                                }), 128))
                              ]),
                              _: 1
                            })) : createCommentVNode("", true)
                          ])
                        ]),
                        _: 1
                      }),
                      createVNode(VWindowItem, { value: "billing" }, {
                        default: withCtx(() => [
                          createVNode("div", { class: "mt-3" }, [
                            createVNode(VBtn, {
                              color: "primary",
                              variant: "tonal",
                              size: "small",
                              "prepend-icon": "mdi-refresh",
                              loading: unref(loadingDrill),
                              onClick: loadBilling,
                              class: "mb-3"
                            }, {
                              default: withCtx(() => [
                                createTextVNode("Load Billing")
                              ]),
                              _: 1
                            }, 8, ["loading"]),
                            unref(billing) === null && !unref(loadingDrill) ? (openBlock(), createBlock(VAlert, {
                              key: 0,
                              type: "info",
                              variant: "tonal",
                              density: "compact"
                            }, {
                              default: withCtx(() => [
                                createTextVNode('Click "Load Billing" to fetch invoices & payments.')
                              ]),
                              _: 1
                            })) : createCommentVNode("", true),
                            unref(billing) ? (openBlock(), createBlock(Fragment, { key: 1 }, [
                              createVNode("div", { class: "d-flex ga-3 flex-wrap mb-4" }, [
                                createVNode(VChip, {
                                  color: "success",
                                  variant: "tonal",
                                  size: "small"
                                }, {
                                  default: withCtx(() => [
                                    createTextVNode("Paid: KSh " + toDisplayString(formatNum(unref(billing).paid_total)), 1)
                                  ]),
                                  _: 1
                                }),
                                createVNode(VChip, {
                                  color: "primary",
                                  variant: "tonal",
                                  size: "small"
                                }, {
                                  default: withCtx(() => [
                                    createTextVNode(toDisplayString(unref(billing).invoices.length) + " invoices", 1)
                                  ]),
                                  _: 1
                                }),
                                createVNode(VChip, {
                                  color: "info",
                                  variant: "tonal",
                                  size: "small"
                                }, {
                                  default: withCtx(() => [
                                    createTextVNode(toDisplayString(unref(billing).payments.length) + " payments", 1)
                                  ]),
                                  _: 1
                                })
                              ]),
                              createVNode("p", { class: "text-caption text-medium-emphasis mb-1" }, "INVOICES"),
                              createVNode(VList, {
                                density: "compact",
                                lines: "one",
                                class: "px-0"
                              }, {
                                default: withCtx(() => [
                                  (openBlock(true), createBlock(Fragment, null, renderList(unref(billing).invoices, (inv) => {
                                    return openBlock(), createBlock(VListItem, {
                                      key: inv.id
                                    }, {
                                      append: withCtx(() => [
                                        createVNode(VChip, {
                                          color: invColor(inv.status),
                                          size: "x-small",
                                          variant: "tonal",
                                          label: ""
                                        }, {
                                          default: withCtx(() => [
                                            createTextVNode(toDisplayString(inv.status), 1)
                                          ]),
                                          _: 2
                                        }, 1032, ["color"])
                                      ]),
                                      default: withCtx(() => [
                                        createVNode(VListItemTitle, { class: "text-body-2" }, {
                                          default: withCtx(() => [
                                            createTextVNode(toDisplayString(inv.invoice_number) + " — KSh " + toDisplayString(formatNum(inv.total)), 1)
                                          ]),
                                          _: 2
                                        }, 1024),
                                        createVNode(VListItemSubtitle, null, {
                                          default: withCtx(() => [
                                            createTextVNode(toDisplayString(inv.status) + " · due " + toDisplayString(formatDate(inv.due_date)), 1)
                                          ]),
                                          _: 2
                                        }, 1024)
                                      ]),
                                      _: 2
                                    }, 1024);
                                  }), 128))
                                ]),
                                _: 1
                              })
                            ], 64)) : createCommentVNode("", true)
                          ])
                        ]),
                        _: 1
                      })
                    ]),
                    _: 1
                  }, 8, ["modelValue", "onUpdate:modelValue"])
                ])
              ], 64)) : createCommentVNode("", true)
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
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/superadmin/tenants.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const tenants = /* @__PURE__ */ _export_sfc(_sfc_main, [["__scopeId", "data-v-f4f395f6"]]);
export {
  tenants as default
};
//# sourceMappingURL=tenants-CG5zpn5V.js.map
