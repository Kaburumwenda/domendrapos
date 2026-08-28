import { defineComponent, ref, reactive, mergeProps, withCtx, createTextVNode, unref, toDisplayString, isRef, createVNode, useSSRContext } from "vue";
import { ssrRenderAttrs, ssrRenderComponent, ssrRenderList, ssrRenderStyle, ssrInterpolate } from "vue/server-renderer";
import { D as useToast, a as VIcon, c as VBtn, a1 as VSkeletonLoader, o as VChip, q as VDialog, g as VCard, r as VCardTitle, s as VCardText, v as VTextField, J as VSelect, $ as VTextarea, I as VSwitch, w as VCardActions, b as VSpacer } from "../server.mjs";
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
  __name: "plans",
  __ssrInlineRender: true,
  setup(__props) {
    const toast = useToast();
    const loading = ref(false);
    const saving = ref(false);
    const plans = ref([]);
    const dialogOpen = ref(false);
    const editing = ref(null);
    const featuresText = ref("{}");
    const form = reactive({
      name: "",
      price: 0,
      billing_cycle: "monthly",
      max_branches: 1,
      max_users: 5,
      max_products: 500,
      is_active: true
    });
    function planIcon(name) {
      const n = (name || "").toLowerCase();
      if (n.includes("free")) return "mdi-package-variant";
      if (n.includes("start")) return "mdi-rocket-launch";
      if (n.includes("busi")) return "mdi-briefcase";
      if (n.includes("enter")) return "mdi-domain";
      return "mdi-layers";
    }
    function planIconStyle(plan) {
      const n = (plan.name || "").toLowerCase();
      const c = n.includes("free") ? "#94a3b8" : n.includes("start") ? "#3b82f6" : n.includes("busi") ? "#8b5cf6" : n.includes("enter") ? "#f59e0b" : "#10b981";
      return { background: c + "22", color: c };
    }
    function formatNum(v) {
      return Number(v || 0).toLocaleString("en-US");
    }
    function openCreate() {
      editing.value = null;
      Object.assign(form, { name: "", price: 0, billing_cycle: "monthly", max_branches: 1, max_users: 5, max_products: 500, is_active: true });
      featuresText.value = "{}";
      dialogOpen.value = true;
    }
    function openEdit(plan) {
      editing.value = plan.id;
      Object.assign(form, {
        name: plan.name,
        price: Number(plan.price),
        billing_cycle: plan.billing_cycle,
        max_branches: plan.max_branches,
        max_users: plan.max_users,
        max_products: plan.max_products,
        is_active: plan.is_active
      });
      featuresText.value = JSON.stringify(plan.features || {}, null, 0);
      dialogOpen.value = true;
    }
    async function loadPlans() {
      loading.value = true;
      try {
        const data = await useApi()("/billing/plans/");
        plans.value = data.results || data || [];
      } catch {
        toast.error("Failed to load plans");
      } finally {
        loading.value = false;
      }
    }
    async function savePlan() {
      let features = {};
      try {
        features = JSON.parse(featuresText.value || "{}");
      } catch {
        toast.error("Features must be valid JSON");
        return;
      }
      saving.value = true;
      const payload = { ...form, features };
      try {
        if (editing.value) {
          await useApi()(`/billing/plans/${editing.value}/`, { method: "PATCH", body: payload });
          toast.success("Plan updated");
        } else {
          await useApi()("/billing/plans/", { method: "POST", body: payload });
          toast.success("Plan created");
        }
        dialogOpen.value = false;
        await loadPlans();
      } catch {
        toast.error("Failed to save plan");
      } finally {
        saving.value = false;
      }
    }
    async function deletePlan(plan) {
      if (!confirm(`Delete plan "${plan.name}"? This cannot be undone.`)) return;
      try {
        await useApi()(`/billing/plans/${plan.id}/`, { method: "DELETE" });
        toast.success("Plan deleted");
        await loadPlans();
      } catch {
        toast.error("Failed to delete plan");
      }
    }
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "sa-page" }, _attrs))}><div class="sa-header"><div class="sa-header__left"><div class="sa-header__title-icon">`);
      _push(ssrRenderComponent(VIcon, { size: "26" }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`mdi-layers-triple`);
          } else {
            return [
              createTextVNode("mdi-layers-triple")
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`</div><div><h1 class="text-h5 font-weight-bold">Subscription Plans</h1><p class="text-body-2 text-medium-emphasis">Configure pricing, features &amp; resource limits for each tier</p></div></div><div class="sa-header__actions">`);
      _push(ssrRenderComponent(VBtn, {
        color: "primary",
        "prepend-icon": "mdi-plus",
        onClick: openCreate
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`New Plan`);
          } else {
            return [
              createTextVNode("New Plan")
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(ssrRenderComponent(VBtn, {
        variant: "tonal",
        "prepend-icon": "mdi-refresh",
        loading: unref(loading),
        onClick: loadPlans
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
      if (unref(loading) && !unref(plans).length) {
        _push(`<div class="sa-skeleton"><div class="sa-kpi-grid"><!--[-->`);
        ssrRenderList(4, (n) => {
          _push(ssrRenderComponent(VSkeletonLoader, {
            key: n,
            type: "article",
            class: "sa-skel-kpi",
            boilerplate: ""
          }, null, _parent));
        });
        _push(`<!--]--></div></div>`);
      } else {
        _push(`<div class="sa-plan-grid" style="${ssrRenderStyle({ "grid-template-columns": "repeat(auto-fill, minmax(280px, 1fr))" })}"><!--[-->`);
        ssrRenderList(unref(plans), (plan) => {
          _push(`<div class="sa-card" style="${ssrRenderStyle({ "margin-bottom": "0" })}"><div class="sa-card__header"><div class="sa-card__header-icon" style="${ssrRenderStyle(planIconStyle(plan))}">`);
          _push(ssrRenderComponent(VIcon, { size: "20" }, {
            default: withCtx((_, _push2, _parent2, _scopeId) => {
              if (_push2) {
                _push2(`${ssrInterpolate(planIcon(plan.name))}`);
              } else {
                return [
                  createTextVNode(toDisplayString(planIcon(plan.name)), 1)
                ];
              }
            }),
            _: 2
          }, _parent));
          _push(`</div><div class="flex-grow-1"><h3 class="sa-card__title">${ssrInterpolate(plan.name)}</h3><p class="sa-card__subtitle">${ssrInterpolate(plan.billing_cycle)}</p></div>`);
          _push(ssrRenderComponent(VChip, {
            color: plan.is_active ? "success" : "grey",
            size: "x-small",
            variant: "tonal",
            label: ""
          }, {
            default: withCtx((_, _push2, _parent2, _scopeId) => {
              if (_push2) {
                _push2(`${ssrInterpolate(plan.is_active ? "Active" : "Inactive")}`);
              } else {
                return [
                  createTextVNode(toDisplayString(plan.is_active ? "Active" : "Inactive"), 1)
                ];
              }
            }),
            _: 2
          }, _parent));
          _push(`</div><div class="sa-card__body"><div class="d-flex align-baseline ga-1 mb-3"><span style="${ssrRenderStyle({ "font-size": "1.75rem", "font-weight": "800" })}">KSh ${ssrInterpolate(formatNum(plan.price))}</span><span class="text-body-2 text-medium-emphasis">/${ssrInterpolate(plan.billing_cycle)}</span></div><div class="sa-detail-grid mb-3"><div class="sa-detail-field"><span class="sa-detail-field__label">Branches</span><span class="sa-detail-field__value">${ssrInterpolate(plan.max_branches)}</span></div><div class="sa-detail-field"><span class="sa-detail-field__label">Users</span><span class="sa-detail-field__value">${ssrInterpolate(plan.max_users)}</span></div><div class="sa-detail-field"><span class="sa-detail-field__label">Products</span><span class="sa-detail-field__value">${ssrInterpolate(formatNum(plan.max_products))}</span></div><div class="sa-detail-field"><span class="sa-detail-field__label">ID</span><span class="sa-detail-field__value">#${ssrInterpolate(plan.id)}</span></div></div>`);
          if (plan.features && Object.keys(plan.features).length) {
            _push(`<div class="mb-3"><p class="text-caption text-medium-emphasis mb-1">FEATURES</p><div class="d-flex flex-wrap ga-1"><!--[-->`);
            ssrRenderList(plan.features, (v, k) => {
              _push(ssrRenderComponent(VChip, {
                key: k,
                size: "x-small",
                variant: "tonal",
                color: "primary",
                label: ""
              }, {
                default: withCtx((_, _push2, _parent2, _scopeId) => {
                  if (_push2) {
                    _push2(`${ssrInterpolate(k)}: ${ssrInterpolate(v)}`);
                  } else {
                    return [
                      createTextVNode(toDisplayString(k) + ": " + toDisplayString(v), 1)
                    ];
                  }
                }),
                _: 2
              }, _parent));
            });
            _push(`<!--]--></div></div>`);
          } else {
            _push(`<!---->`);
          }
          _push(`<div class="d-flex ga-2">`);
          _push(ssrRenderComponent(VBtn, {
            size: "small",
            variant: "outlined",
            "prepend-icon": "mdi-pencil",
            onClick: ($event) => openEdit(plan)
          }, {
            default: withCtx((_, _push2, _parent2, _scopeId) => {
              if (_push2) {
                _push2(`Edit`);
              } else {
                return [
                  createTextVNode("Edit")
                ];
              }
            }),
            _: 2
          }, _parent));
          _push(ssrRenderComponent(VBtn, {
            size: "small",
            variant: "text",
            color: "error",
            "prepend-icon": "mdi-delete",
            onClick: ($event) => deletePlan(plan)
          }, {
            default: withCtx((_, _push2, _parent2, _scopeId) => {
              if (_push2) {
                _push2(`Delete`);
              } else {
                return [
                  createTextVNode("Delete")
                ];
              }
            }),
            _: 2
          }, _parent));
          _push(`</div></div></div>`);
        });
        _push(`<!--]-->`);
        if (!unref(plans).length) {
          _push(`<div class="sa-empty" style="${ssrRenderStyle({ "grid-column": "1/-1" })}">`);
          _push(ssrRenderComponent(VIcon, {
            size: "48",
            color: "grey-lighten-1"
          }, {
            default: withCtx((_, _push2, _parent2, _scopeId) => {
              if (_push2) {
                _push2(`mdi-layers-off-outline`);
              } else {
                return [
                  createTextVNode("mdi-layers-off-outline")
                ];
              }
            }),
            _: 1
          }, _parent));
          _push(`<p class="text-body-1 text-medium-emphasis mt-2">No subscription plans yet</p>`);
          _push(ssrRenderComponent(VBtn, {
            color: "primary",
            class: "mt-3",
            "prepend-icon": "mdi-plus",
            onClick: openCreate
          }, {
            default: withCtx((_, _push2, _parent2, _scopeId) => {
              if (_push2) {
                _push2(`Create first plan`);
              } else {
                return [
                  createTextVNode("Create first plan")
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
      }
      _push(ssrRenderComponent(VDialog, {
        modelValue: unref(dialogOpen),
        "onUpdate:modelValue": ($event) => isRef(dialogOpen) ? dialogOpen.value = $event : null,
        "max-width": "560"
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(ssrRenderComponent(VCard, { rounded: "xl" }, {
              default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                if (_push3) {
                  _push3(ssrRenderComponent(VCardTitle, { class: "text-h6 font-weight-bold pa-5 pb-2" }, {
                    default: withCtx((_3, _push4, _parent4, _scopeId3) => {
                      if (_push4) {
                        _push4(`${ssrInterpolate(unref(editing) ? "Edit Plan" : "New Subscription Plan")}`);
                      } else {
                        return [
                          createTextVNode(toDisplayString(unref(editing) ? "Edit Plan" : "New Subscription Plan"), 1)
                        ];
                      }
                    }),
                    _: 1
                  }, _parent3, _scopeId2));
                  _push3(ssrRenderComponent(VCardText, { class: "px-5 pb-2" }, {
                    default: withCtx((_3, _push4, _parent4, _scopeId3) => {
                      if (_push4) {
                        _push4(ssrRenderComponent(VTextField, {
                          modelValue: unref(form).name,
                          "onUpdate:modelValue": ($event) => unref(form).name = $event,
                          label: "Plan name",
                          variant: "outlined",
                          density: "compact",
                          class: "mb-3"
                        }, null, _parent4, _scopeId3));
                        _push4(`<div class="d-flex ga-3 mb-3"${_scopeId3}>`);
                        _push4(ssrRenderComponent(VTextField, {
                          modelValue: unref(form).price,
                          "onUpdate:modelValue": ($event) => unref(form).price = $event,
                          modelModifiers: { number: true },
                          type: "number",
                          label: "Price (KSh)",
                          variant: "outlined",
                          density: "compact"
                        }, null, _parent4, _scopeId3));
                        _push4(ssrRenderComponent(VSelect, {
                          modelValue: unref(form).billing_cycle,
                          "onUpdate:modelValue": ($event) => unref(form).billing_cycle = $event,
                          items: ["monthly", "quarterly", "yearly"],
                          label: "Cycle",
                          variant: "outlined",
                          density: "compact"
                        }, null, _parent4, _scopeId3));
                        _push4(`</div><div class="d-flex ga-3 mb-3"${_scopeId3}>`);
                        _push4(ssrRenderComponent(VTextField, {
                          modelValue: unref(form).max_branches,
                          "onUpdate:modelValue": ($event) => unref(form).max_branches = $event,
                          modelModifiers: { number: true },
                          type: "number",
                          label: "Max Branches",
                          variant: "outlined",
                          density: "compact"
                        }, null, _parent4, _scopeId3));
                        _push4(ssrRenderComponent(VTextField, {
                          modelValue: unref(form).max_users,
                          "onUpdate:modelValue": ($event) => unref(form).max_users = $event,
                          modelModifiers: { number: true },
                          type: "number",
                          label: "Max Users",
                          variant: "outlined",
                          density: "compact"
                        }, null, _parent4, _scopeId3));
                        _push4(ssrRenderComponent(VTextField, {
                          modelValue: unref(form).max_products,
                          "onUpdate:modelValue": ($event) => unref(form).max_products = $event,
                          modelModifiers: { number: true },
                          type: "number",
                          label: "Max Products",
                          variant: "outlined",
                          density: "compact"
                        }, null, _parent4, _scopeId3));
                        _push4(`</div>`);
                        _push4(ssrRenderComponent(VTextarea, {
                          modelValue: unref(featuresText),
                          "onUpdate:modelValue": ($event) => isRef(featuresText) ? featuresText.value = $event : null,
                          label: "Features (JSON)",
                          variant: "outlined",
                          density: "compact",
                          rows: "3",
                          placeholder: '{"pos": true, "reports": true}',
                          class: "mb-1"
                        }, null, _parent4, _scopeId3));
                        _push4(ssrRenderComponent(VSwitch, {
                          modelValue: unref(form).is_active,
                          "onUpdate:modelValue": ($event) => unref(form).is_active = $event,
                          label: "Active",
                          color: "success",
                          density: "compact",
                          inset: ""
                        }, null, _parent4, _scopeId3));
                      } else {
                        return [
                          createVNode(VTextField, {
                            modelValue: unref(form).name,
                            "onUpdate:modelValue": ($event) => unref(form).name = $event,
                            label: "Plan name",
                            variant: "outlined",
                            density: "compact",
                            class: "mb-3"
                          }, null, 8, ["modelValue", "onUpdate:modelValue"]),
                          createVNode("div", { class: "d-flex ga-3 mb-3" }, [
                            createVNode(VTextField, {
                              modelValue: unref(form).price,
                              "onUpdate:modelValue": ($event) => unref(form).price = $event,
                              modelModifiers: { number: true },
                              type: "number",
                              label: "Price (KSh)",
                              variant: "outlined",
                              density: "compact"
                            }, null, 8, ["modelValue", "onUpdate:modelValue"]),
                            createVNode(VSelect, {
                              modelValue: unref(form).billing_cycle,
                              "onUpdate:modelValue": ($event) => unref(form).billing_cycle = $event,
                              items: ["monthly", "quarterly", "yearly"],
                              label: "Cycle",
                              variant: "outlined",
                              density: "compact"
                            }, null, 8, ["modelValue", "onUpdate:modelValue"])
                          ]),
                          createVNode("div", { class: "d-flex ga-3 mb-3" }, [
                            createVNode(VTextField, {
                              modelValue: unref(form).max_branches,
                              "onUpdate:modelValue": ($event) => unref(form).max_branches = $event,
                              modelModifiers: { number: true },
                              type: "number",
                              label: "Max Branches",
                              variant: "outlined",
                              density: "compact"
                            }, null, 8, ["modelValue", "onUpdate:modelValue"]),
                            createVNode(VTextField, {
                              modelValue: unref(form).max_users,
                              "onUpdate:modelValue": ($event) => unref(form).max_users = $event,
                              modelModifiers: { number: true },
                              type: "number",
                              label: "Max Users",
                              variant: "outlined",
                              density: "compact"
                            }, null, 8, ["modelValue", "onUpdate:modelValue"]),
                            createVNode(VTextField, {
                              modelValue: unref(form).max_products,
                              "onUpdate:modelValue": ($event) => unref(form).max_products = $event,
                              modelModifiers: { number: true },
                              type: "number",
                              label: "Max Products",
                              variant: "outlined",
                              density: "compact"
                            }, null, 8, ["modelValue", "onUpdate:modelValue"])
                          ]),
                          createVNode(VTextarea, {
                            modelValue: unref(featuresText),
                            "onUpdate:modelValue": ($event) => isRef(featuresText) ? featuresText.value = $event : null,
                            label: "Features (JSON)",
                            variant: "outlined",
                            density: "compact",
                            rows: "3",
                            placeholder: '{"pos": true, "reports": true}',
                            class: "mb-1"
                          }, null, 8, ["modelValue", "onUpdate:modelValue"]),
                          createVNode(VSwitch, {
                            modelValue: unref(form).is_active,
                            "onUpdate:modelValue": ($event) => unref(form).is_active = $event,
                            label: "Active",
                            color: "success",
                            density: "compact",
                            inset: ""
                          }, null, 8, ["modelValue", "onUpdate:modelValue"])
                        ];
                      }
                    }),
                    _: 1
                  }, _parent3, _scopeId2));
                  _push3(ssrRenderComponent(VCardActions, { class: "pa-5 pt-2" }, {
                    default: withCtx((_3, _push4, _parent4, _scopeId3) => {
                      if (_push4) {
                        _push4(ssrRenderComponent(VSpacer, null, null, _parent4, _scopeId3));
                        _push4(ssrRenderComponent(VBtn, {
                          variant: "text",
                          onClick: ($event) => dialogOpen.value = false
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
                          color: "primary",
                          loading: unref(saving),
                          onClick: savePlan
                        }, {
                          default: withCtx((_4, _push5, _parent5, _scopeId4) => {
                            if (_push5) {
                              _push5(`${ssrInterpolate(unref(editing) ? "Save Changes" : "Create Plan")}`);
                            } else {
                              return [
                                createTextVNode(toDisplayString(unref(editing) ? "Save Changes" : "Create Plan"), 1)
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
                            onClick: ($event) => dialogOpen.value = false
                          }, {
                            default: withCtx(() => [
                              createTextVNode("Cancel")
                            ]),
                            _: 1
                          }, 8, ["onClick"]),
                          createVNode(VBtn, {
                            color: "primary",
                            loading: unref(saving),
                            onClick: savePlan
                          }, {
                            default: withCtx(() => [
                              createTextVNode(toDisplayString(unref(editing) ? "Save Changes" : "Create Plan"), 1)
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
                    createVNode(VCardTitle, { class: "text-h6 font-weight-bold pa-5 pb-2" }, {
                      default: withCtx(() => [
                        createTextVNode(toDisplayString(unref(editing) ? "Edit Plan" : "New Subscription Plan"), 1)
                      ]),
                      _: 1
                    }),
                    createVNode(VCardText, { class: "px-5 pb-2" }, {
                      default: withCtx(() => [
                        createVNode(VTextField, {
                          modelValue: unref(form).name,
                          "onUpdate:modelValue": ($event) => unref(form).name = $event,
                          label: "Plan name",
                          variant: "outlined",
                          density: "compact",
                          class: "mb-3"
                        }, null, 8, ["modelValue", "onUpdate:modelValue"]),
                        createVNode("div", { class: "d-flex ga-3 mb-3" }, [
                          createVNode(VTextField, {
                            modelValue: unref(form).price,
                            "onUpdate:modelValue": ($event) => unref(form).price = $event,
                            modelModifiers: { number: true },
                            type: "number",
                            label: "Price (KSh)",
                            variant: "outlined",
                            density: "compact"
                          }, null, 8, ["modelValue", "onUpdate:modelValue"]),
                          createVNode(VSelect, {
                            modelValue: unref(form).billing_cycle,
                            "onUpdate:modelValue": ($event) => unref(form).billing_cycle = $event,
                            items: ["monthly", "quarterly", "yearly"],
                            label: "Cycle",
                            variant: "outlined",
                            density: "compact"
                          }, null, 8, ["modelValue", "onUpdate:modelValue"])
                        ]),
                        createVNode("div", { class: "d-flex ga-3 mb-3" }, [
                          createVNode(VTextField, {
                            modelValue: unref(form).max_branches,
                            "onUpdate:modelValue": ($event) => unref(form).max_branches = $event,
                            modelModifiers: { number: true },
                            type: "number",
                            label: "Max Branches",
                            variant: "outlined",
                            density: "compact"
                          }, null, 8, ["modelValue", "onUpdate:modelValue"]),
                          createVNode(VTextField, {
                            modelValue: unref(form).max_users,
                            "onUpdate:modelValue": ($event) => unref(form).max_users = $event,
                            modelModifiers: { number: true },
                            type: "number",
                            label: "Max Users",
                            variant: "outlined",
                            density: "compact"
                          }, null, 8, ["modelValue", "onUpdate:modelValue"]),
                          createVNode(VTextField, {
                            modelValue: unref(form).max_products,
                            "onUpdate:modelValue": ($event) => unref(form).max_products = $event,
                            modelModifiers: { number: true },
                            type: "number",
                            label: "Max Products",
                            variant: "outlined",
                            density: "compact"
                          }, null, 8, ["modelValue", "onUpdate:modelValue"])
                        ]),
                        createVNode(VTextarea, {
                          modelValue: unref(featuresText),
                          "onUpdate:modelValue": ($event) => isRef(featuresText) ? featuresText.value = $event : null,
                          label: "Features (JSON)",
                          variant: "outlined",
                          density: "compact",
                          rows: "3",
                          placeholder: '{"pos": true, "reports": true}',
                          class: "mb-1"
                        }, null, 8, ["modelValue", "onUpdate:modelValue"]),
                        createVNode(VSwitch, {
                          modelValue: unref(form).is_active,
                          "onUpdate:modelValue": ($event) => unref(form).is_active = $event,
                          label: "Active",
                          color: "success",
                          density: "compact",
                          inset: ""
                        }, null, 8, ["modelValue", "onUpdate:modelValue"])
                      ]),
                      _: 1
                    }),
                    createVNode(VCardActions, { class: "pa-5 pt-2" }, {
                      default: withCtx(() => [
                        createVNode(VSpacer),
                        createVNode(VBtn, {
                          variant: "text",
                          onClick: ($event) => dialogOpen.value = false
                        }, {
                          default: withCtx(() => [
                            createTextVNode("Cancel")
                          ]),
                          _: 1
                        }, 8, ["onClick"]),
                        createVNode(VBtn, {
                          color: "primary",
                          loading: unref(saving),
                          onClick: savePlan
                        }, {
                          default: withCtx(() => [
                            createTextVNode(toDisplayString(unref(editing) ? "Save Changes" : "Create Plan"), 1)
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
              createVNode(VCard, { rounded: "xl" }, {
                default: withCtx(() => [
                  createVNode(VCardTitle, { class: "text-h6 font-weight-bold pa-5 pb-2" }, {
                    default: withCtx(() => [
                      createTextVNode(toDisplayString(unref(editing) ? "Edit Plan" : "New Subscription Plan"), 1)
                    ]),
                    _: 1
                  }),
                  createVNode(VCardText, { class: "px-5 pb-2" }, {
                    default: withCtx(() => [
                      createVNode(VTextField, {
                        modelValue: unref(form).name,
                        "onUpdate:modelValue": ($event) => unref(form).name = $event,
                        label: "Plan name",
                        variant: "outlined",
                        density: "compact",
                        class: "mb-3"
                      }, null, 8, ["modelValue", "onUpdate:modelValue"]),
                      createVNode("div", { class: "d-flex ga-3 mb-3" }, [
                        createVNode(VTextField, {
                          modelValue: unref(form).price,
                          "onUpdate:modelValue": ($event) => unref(form).price = $event,
                          modelModifiers: { number: true },
                          type: "number",
                          label: "Price (KSh)",
                          variant: "outlined",
                          density: "compact"
                        }, null, 8, ["modelValue", "onUpdate:modelValue"]),
                        createVNode(VSelect, {
                          modelValue: unref(form).billing_cycle,
                          "onUpdate:modelValue": ($event) => unref(form).billing_cycle = $event,
                          items: ["monthly", "quarterly", "yearly"],
                          label: "Cycle",
                          variant: "outlined",
                          density: "compact"
                        }, null, 8, ["modelValue", "onUpdate:modelValue"])
                      ]),
                      createVNode("div", { class: "d-flex ga-3 mb-3" }, [
                        createVNode(VTextField, {
                          modelValue: unref(form).max_branches,
                          "onUpdate:modelValue": ($event) => unref(form).max_branches = $event,
                          modelModifiers: { number: true },
                          type: "number",
                          label: "Max Branches",
                          variant: "outlined",
                          density: "compact"
                        }, null, 8, ["modelValue", "onUpdate:modelValue"]),
                        createVNode(VTextField, {
                          modelValue: unref(form).max_users,
                          "onUpdate:modelValue": ($event) => unref(form).max_users = $event,
                          modelModifiers: { number: true },
                          type: "number",
                          label: "Max Users",
                          variant: "outlined",
                          density: "compact"
                        }, null, 8, ["modelValue", "onUpdate:modelValue"]),
                        createVNode(VTextField, {
                          modelValue: unref(form).max_products,
                          "onUpdate:modelValue": ($event) => unref(form).max_products = $event,
                          modelModifiers: { number: true },
                          type: "number",
                          label: "Max Products",
                          variant: "outlined",
                          density: "compact"
                        }, null, 8, ["modelValue", "onUpdate:modelValue"])
                      ]),
                      createVNode(VTextarea, {
                        modelValue: unref(featuresText),
                        "onUpdate:modelValue": ($event) => isRef(featuresText) ? featuresText.value = $event : null,
                        label: "Features (JSON)",
                        variant: "outlined",
                        density: "compact",
                        rows: "3",
                        placeholder: '{"pos": true, "reports": true}',
                        class: "mb-1"
                      }, null, 8, ["modelValue", "onUpdate:modelValue"]),
                      createVNode(VSwitch, {
                        modelValue: unref(form).is_active,
                        "onUpdate:modelValue": ($event) => unref(form).is_active = $event,
                        label: "Active",
                        color: "success",
                        density: "compact",
                        inset: ""
                      }, null, 8, ["modelValue", "onUpdate:modelValue"])
                    ]),
                    _: 1
                  }),
                  createVNode(VCardActions, { class: "pa-5 pt-2" }, {
                    default: withCtx(() => [
                      createVNode(VSpacer),
                      createVNode(VBtn, {
                        variant: "text",
                        onClick: ($event) => dialogOpen.value = false
                      }, {
                        default: withCtx(() => [
                          createTextVNode("Cancel")
                        ]),
                        _: 1
                      }, 8, ["onClick"]),
                      createVNode(VBtn, {
                        color: "primary",
                        loading: unref(saving),
                        onClick: savePlan
                      }, {
                        default: withCtx(() => [
                          createTextVNode(toDisplayString(unref(editing) ? "Save Changes" : "Create Plan"), 1)
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
      _push(`</div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/superadmin/plans.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
export {
  _sfc_main as default
};
//# sourceMappingURL=plans-DL4HYI3e.js.map
