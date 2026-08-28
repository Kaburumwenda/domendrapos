import { _ as __nuxt_component_0 } from './nuxt-link-CSYEAARP.mjs';
import { defineComponent, ref, computed, mergeProps, withCtx, createTextVNode, unref, toDisplayString, createVNode, useSSRContext } from 'file://D:/Projects/MY-APPS-2/DomendraPOS/frontend/node_modules/vue/index.mjs';
import { ssrRenderAttrs, ssrRenderComponent, ssrRenderList, ssrInterpolate, ssrRenderStyle } from 'file://D:/Projects/MY-APPS-2/DomendraPOS/frontend/node_modules/vue/server-renderer/index.mjs';
import { D as useToast, a as VIcon, c as VBtn, a1 as VSkeletonLoader, o as VChip, b as VSpacer } from './server.mjs';
import { u as useApi } from './useApi-D4YG8JPQ.mjs';
import 'file://D:/Projects/MY-APPS-2/DomendraPOS/frontend/node_modules/ufo/dist/index.mjs';
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
import 'file://D:/Projects/MY-APPS-2/DomendraPOS/frontend/node_modules/pinia/dist/pinia.js';
import 'file://D:/Projects/MY-APPS-2/DomendraPOS/frontend/node_modules/vue-router/vue-router.node.mjs';
import 'file://D:/Projects/MY-APPS-2/DomendraPOS/frontend/node_modules/perfect-debounce/dist/index.mjs';
import 'file://D:/Projects/MY-APPS-2/DomendraPOS/frontend/node_modules/@vue/shared/dist/shared.cjs.prod.js';
import 'file://D:/Projects/MY-APPS-2/DomendraPOS/frontend/node_modules/vue3-apexcharts/dist/vue3-apexcharts.js';
import 'file://D:/Projects/MY-APPS-2/DomendraPOS/frontend/node_modules/nuxt/node_modules/cookie-es/dist/index.mjs';

const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "index",
  __ssrInlineRender: true,
  setup(__props) {
    const toast = useToast();
    const loading = ref(false);
    const stats = ref(null);
    const PLAN_META = {
      free: { label: "Free", icon: "mdi-package-variant", color: "#94a3b8", mrr: 0 },
      starter: { label: "Starter", icon: "mdi-rocket-launch", color: "#3b82f6", mrr: 1500 },
      business: { label: "Business", icon: "mdi-briefcase", color: "#8b5cf6", mrr: 5e3 },
      enterprise: { label: "Enterprise", icon: "mdi-domain", color: "#f59e0b", mrr: 15e3 }
    };
    const planCards = computed(() => {
      var _a;
      const total = ((_a = stats.value) == null ? void 0 : _a.total_tenants) || 1;
      return Object.keys(PLAN_META).map((key) => {
        var _a2, _b, _c;
        const meta = PLAN_META[key];
        const count = (_c = (_b = (_a2 = stats.value) == null ? void 0 : _a2.by_plan) == null ? void 0 : _b[key]) != null ? _c : 0;
        return {
          key,
          label: meta.label,
          icon: meta.icon,
          color: meta.color,
          count,
          mrr: count * meta.mrr,
          pct: Math.round(count / total * 100)
        };
      });
    });
    const recentTenants = computed(() => {
      var _a, _b;
      return (_b = (_a = stats.value) == null ? void 0 : _a.recent_tenants) != null ? _b : [];
    });
    const activePct = computed(() => {
      var _a, _b, _c;
      const t = ((_a = stats.value) == null ? void 0 : _a.total_tenants) || 0;
      return t > 0 ? Math.round(((_c = (_b = stats.value) == null ? void 0 : _b.active) != null ? _c : 0) / t * 100) : 0;
    });
    const monthName = computed(
      () => (/* @__PURE__ */ new Date()).toLocaleDateString("en-US", { month: "long" })
    );
    function statusColor(status) {
      const map = {
        trial: "info",
        active: "success",
        suspended: "warning",
        cancelled: "error"
      };
      return map[status] || "grey";
    }
    function avatarStyle(name) {
      const colors = ["#3b82f6", "#8b5cf6", "#f59e0b", "#10b981", "#ec4899", "#06b6d4", "#f43f5e"];
      const idx = ((name == null ? void 0 : name.charCodeAt(0)) || 0) % colors.length;
      const c = colors[idx];
      return { background: c + "22", color: c };
    }
    function formatDate(value) {
      return new Date(value).toLocaleDateString("en-GB", { year: "numeric", month: "short", day: "numeric" });
    }
    function formatNum(v) {
      return Number(v || 0).toLocaleString("en-US");
    }
    async function loadData() {
      loading.value = true;
      try {
        stats.value = await useApi()("/tenants/manage/stats/");
      } catch {
        toast.error("Failed to load platform data");
      } finally {
        loading.value = false;
      }
    }
    return (_ctx, _push, _parent, _attrs) => {
      var _a, _b, _c, _d, _e, _f, _g, _h, _i, _j, _k, _l, _m, _n, _o, _p, _q, _r, _s, _t;
      const _component_NuxtLink = __nuxt_component_0;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "sa-page" }, _attrs))}><div class="sa-header"><div class="sa-header__left"><div class="sa-header__title-icon">`);
      _push(ssrRenderComponent(VIcon, { size: "26" }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`mdi-server-network`);
          } else {
            return [
              createTextVNode("mdi-server-network")
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`</div><div><h1 class="text-h5 font-weight-bold">Platform Dashboard</h1><p class="text-body-2 text-medium-emphasis">Manage all tenants across the DomendraPOS platform</p></div></div><div class="sa-header__actions">`);
      _push(ssrRenderComponent(VBtn, {
        variant: "outlined",
        "prepend-icon": "mdi-account-plus-outline",
        to: "/superadmin/tenants"
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`Manage Tenants`);
          } else {
            return [
              createTextVNode("Manage Tenants")
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(ssrRenderComponent(VBtn, {
        variant: "tonal",
        "prepend-icon": "mdi-refresh",
        loading: unref(loading),
        onClick: loadData
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
      if (unref(loading) && unref(stats) === null) {
        _push(`<div class="sa-skeleton"><div class="sa-kpi-grid"><!--[-->`);
        ssrRenderList(8, (n) => {
          _push(ssrRenderComponent(VSkeletonLoader, {
            key: n,
            type: "article",
            class: "sa-skel-kpi",
            boilerplate: ""
          }, null, _parent));
        });
        _push(`<!--]--></div>`);
        _push(ssrRenderComponent(VSkeletonLoader, {
          type: "card, table-tbody",
          class: "sa-skel-table",
          boilerplate: ""
        }, null, _parent));
        _push(`</div>`);
      } else {
        _push(`<!--[--><div class="sa-kpi-grid"><div class="sa-kpi"><div class="sa-kpi__top"><span class="sa-kpi__label">Total Tenants</span><div class="sa-kpi__icon sa-kpi__icon--primary">`);
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
        _push(`</div></div><p class="sa-kpi__value">${ssrInterpolate((_b = (_a = unref(stats)) == null ? void 0 : _a.total_tenants) != null ? _b : 0)}</p><div class="sa-kpi__sub"><span class="sa-kpi__delta sa-kpi__delta--up">`);
        _push(ssrRenderComponent(VIcon, { size: "12" }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`mdi-trending-up`);
            } else {
              return [
                createTextVNode("mdi-trending-up")
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(` ${ssrInterpolate((_d = (_c = unref(stats)) == null ? void 0 : _c.new_this_month) != null ? _d : 0)} new this month </span></div></div><div class="sa-kpi"><div class="sa-kpi__top"><span class="sa-kpi__label">Active</span><div class="sa-kpi__icon sa-kpi__icon--success">`);
        _push(ssrRenderComponent(VIcon, { size: "20" }, {
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
        _push(`</div></div><p class="sa-kpi__value text-success">${ssrInterpolate((_f = (_e = unref(stats)) == null ? void 0 : _e.active) != null ? _f : 0)}</p><div class="sa-kpi__sub">${ssrInterpolate(unref(activePct))}% of all tenants</div></div><div class="sa-kpi"><div class="sa-kpi__top"><span class="sa-kpi__label">On Trial</span><div class="sa-kpi__icon sa-kpi__icon--info">`);
        _push(ssrRenderComponent(VIcon, { size: "20" }, {
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
        _push(`</div></div><p class="sa-kpi__value text-info">${ssrInterpolate((_h = (_g = unref(stats)) == null ? void 0 : _g.trial) != null ? _h : 0)}</p><div class="sa-kpi__sub">${ssrInterpolate((_j = (_i = unref(stats)) == null ? void 0 : _i.trial_expiring) != null ? _j : 0)} expiring soon</div></div><div class="sa-kpi"><div class="sa-kpi__top"><span class="sa-kpi__label">Est. Monthly Revenue</span><div class="sa-kpi__icon sa-kpi__icon--teal">`);
        _push(ssrRenderComponent(VIcon, { size: "20" }, {
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
        _push(`</div></div><p class="sa-kpi__value">KSh ${ssrInterpolate(formatNum((_l = (_k = unref(stats)) == null ? void 0 : _k.mrr_estimate) != null ? _l : 0))}</p><div class="sa-kpi__sub">Projected MRR across active plans</div></div><div class="sa-kpi"><div class="sa-kpi__top"><span class="sa-kpi__label">Suspended</span><div class="sa-kpi__icon sa-kpi__icon--warning">`);
        _push(ssrRenderComponent(VIcon, { size: "20" }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`mdi-pause-circle`);
            } else {
              return [
                createTextVNode("mdi-pause-circle")
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(`</div></div><p class="sa-kpi__value text-warning">${ssrInterpolate((_n = (_m = unref(stats)) == null ? void 0 : _m.suspended) != null ? _n : 0)}</p><div class="sa-kpi__sub">Temporarily disabled</div></div><div class="sa-kpi"><div class="sa-kpi__top"><span class="sa-kpi__label">Cancelled</span><div class="sa-kpi__icon sa-kpi__icon--error">`);
        _push(ssrRenderComponent(VIcon, { size: "20" }, {
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
        _push(`</div></div><p class="sa-kpi__value text-error">${ssrInterpolate((_p = (_o = unref(stats)) == null ? void 0 : _o.cancelled) != null ? _p : 0)}</p><div class="sa-kpi__sub">No longer active</div></div><div class="sa-kpi"><div class="sa-kpi__top"><span class="sa-kpi__label">New This Month</span><div class="sa-kpi__icon sa-kpi__icon--accent">`);
        _push(ssrRenderComponent(VIcon, { size: "20" }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`mdi-account-plus`);
            } else {
              return [
                createTextVNode("mdi-account-plus")
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(`</div></div><p class="sa-kpi__value">${ssrInterpolate((_r = (_q = unref(stats)) == null ? void 0 : _q.new_this_month) != null ? _r : 0)}</p><div class="sa-kpi__sub">Tenants onboarded in ${ssrInterpolate(unref(monthName))}</div></div><div class="sa-kpi"><div class="sa-kpi__top"><span class="sa-kpi__label">Trial Expiring</span><div class="sa-kpi__icon sa-kpi__icon--warning">`);
        _push(ssrRenderComponent(VIcon, { size: "20" }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`mdi-alert-clock`);
            } else {
              return [
                createTextVNode("mdi-alert-clock")
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(`</div></div><p class="sa-kpi__value text-warning">${ssrInterpolate((_t = (_s = unref(stats)) == null ? void 0 : _s.trial_expiring) != null ? _t : 0)}</p><div class="sa-kpi__sub">Within 3 days \u2014 follow up</div></div></div><div class="sa-two-col"><div class="sa-card"><div class="sa-card__header"><div class="sa-card__header-icon sa-card__header-icon--indigo">`);
        _push(ssrRenderComponent(VIcon, { size: "20" }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`mdi-credit-card-outline`);
            } else {
              return [
                createTextVNode("mdi-credit-card-outline")
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(`</div><div><h3 class="sa-card__title">Plan Distribution</h3><p class="sa-card__subtitle">Tenants by subscription plan &amp; projected revenue</p></div></div><div class="sa-card__body"><!--[-->`);
        ssrRenderList(unref(planCards), (plan) => {
          _push(`<div class="sa-bar-row"><div class="sa-bar-row__top"><div class="d-flex align-center ga-2">`);
          _push(ssrRenderComponent(VIcon, {
            size: "18",
            color: plan.color
          }, {
            default: withCtx((_, _push2, _parent2, _scopeId) => {
              if (_push2) {
                _push2(`${ssrInterpolate(plan.icon)}`);
              } else {
                return [
                  createTextVNode(toDisplayString(plan.icon), 1)
                ];
              }
            }),
            _: 2
          }, _parent));
          _push(`<span class="sa-bar-row__label" style="${ssrRenderStyle({ color: plan.color })}">${ssrInterpolate(plan.label)}</span></div><div class="d-flex align-center ga-2"><span class="sa-bar-row__count">${ssrInterpolate(plan.count)} tenants</span>`);
          _push(ssrRenderComponent(VChip, {
            size: "x-small",
            variant: "tonal",
            color: plan.color
          }, {
            default: withCtx((_, _push2, _parent2, _scopeId) => {
              if (_push2) {
                _push2(`KSh ${ssrInterpolate(formatNum(plan.mrr))}/mo`);
              } else {
                return [
                  createTextVNode("KSh " + toDisplayString(formatNum(plan.mrr)) + "/mo", 1)
                ];
              }
            }),
            _: 2
          }, _parent));
          _push(`</div></div><div class="sa-bar"><div class="sa-bar__fill" style="${ssrRenderStyle({ width: plan.pct + "%", background: plan.color })}"></div></div></div>`);
        });
        _push(`<!--]--></div></div><div class="sa-card"><div class="sa-card__header"><div class="sa-card__header-icon sa-card__header-icon--blue">`);
        _push(ssrRenderComponent(VIcon, { size: "20" }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`mdi-clock-alert-outline`);
            } else {
              return [
                createTextVNode("mdi-clock-alert-outline")
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(`</div><div><h3 class="sa-card__title">Recent Tenants</h3><p class="sa-card__subtitle">Latest onboarded workspaces</p></div>`);
        _push(ssrRenderComponent(VSpacer, null, null, _parent));
        _push(ssrRenderComponent(VBtn, {
          variant: "text",
          size: "small",
          to: "/superadmin/tenants",
          "append-icon": "mdi-arrow-right"
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`View all`);
            } else {
              return [
                createTextVNode("View all")
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(`</div><div class="sa-card__body">`);
        if (unref(recentTenants).length === 0) {
          _push(`<div class="sa-empty">`);
          _push(ssrRenderComponent(VIcon, {
            size: "40",
            color: "grey-lighten-1"
          }, {
            default: withCtx((_, _push2, _parent2, _scopeId) => {
              if (_push2) {
                _push2(`mdi-domain-off`);
              } else {
                return [
                  createTextVNode("mdi-domain-off")
                ];
              }
            }),
            _: 1
          }, _parent));
          _push(`<p class="text-body-2 text-medium-emphasis mt-2">No tenants yet</p></div>`);
        } else {
          _push(`<!---->`);
        }
        _push(`<!--[-->`);
        ssrRenderList(unref(recentTenants), (t) => {
          var _a2, _b2;
          _push(`<div class="sa-tenant-row"><div class="sa-tenant-row__avatar" style="${ssrRenderStyle(avatarStyle(t.name))}">${ssrInterpolate((_b2 = (_a2 = t.name) == null ? void 0 : _a2.charAt(0)) == null ? void 0 : _b2.toUpperCase())}</div><div class="flex-grow-1" style="${ssrRenderStyle({ "min-width": "0" })}"><p class="sa-tenant-row__name" style="${ssrRenderStyle({ "overflow": "hidden", "text-overflow": "ellipsis", "white-space": "nowrap" })}">${ssrInterpolate(t.name)}</p><p class="sa-tenant-row__meta">${ssrInterpolate(t.contact_email || "\u2014")} \xB7 ${ssrInterpolate(formatDate(t.created_on))}</p></div>`);
          _push(ssrRenderComponent(VChip, {
            color: statusColor(t.status),
            size: "x-small",
            variant: "tonal",
            label: ""
          }, {
            default: withCtx((_, _push2, _parent2, _scopeId) => {
              if (_push2) {
                _push2(`${ssrInterpolate(t.status)}`);
              } else {
                return [
                  createTextVNode(toDisplayString(t.status), 1)
                ];
              }
            }),
            _: 2
          }, _parent));
          _push(`</div>`);
        });
        _push(`<!--]--></div></div></div><div class="sa-card"><div class="sa-card__header"><div class="sa-card__header-icon sa-card__header-icon--green">`);
        _push(ssrRenderComponent(VIcon, { size: "20" }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`mdi-flash-outline`);
            } else {
              return [
                createTextVNode("mdi-flash-outline")
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(`</div><div><h3 class="sa-card__title">Quick Actions</h3><p class="sa-card__subtitle">Jump to common platform tasks</p></div></div><div class="sa-card__body"><div class="sa-quick-grid">`);
        _push(ssrRenderComponent(_component_NuxtLink, {
          to: "/superadmin/tenants",
          class: "sa-quick"
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`<div class="sa-quick__icon" style="${ssrRenderStyle({ "background": "rgba(52,120,246,0.14)", "color": "rgb(52,120,246)" })}"${_scopeId}>`);
              _push2(ssrRenderComponent(VIcon, { size: "20" }, {
                default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                  if (_push3) {
                    _push3(`mdi-domain`);
                  } else {
                    return [
                      createTextVNode("mdi-domain")
                    ];
                  }
                }),
                _: 1
              }, _parent2, _scopeId));
              _push2(`</div><div${_scopeId}><p class="sa-quick__label"${_scopeId}>Manage Tenants</p><p class="sa-quick__desc"${_scopeId}>Suspend, activate, change plans &amp; limits</p></div>`);
            } else {
              return [
                createVNode("div", {
                  class: "sa-quick__icon",
                  style: { "background": "rgba(52,120,246,0.14)", "color": "rgb(52,120,246)" }
                }, [
                  createVNode(VIcon, { size: "20" }, {
                    default: withCtx(() => [
                      createTextVNode("mdi-domain")
                    ]),
                    _: 1
                  })
                ]),
                createVNode("div", null, [
                  createVNode("p", { class: "sa-quick__label" }, "Manage Tenants"),
                  createVNode("p", { class: "sa-quick__desc" }, "Suspend, activate, change plans & limits")
                ])
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(ssrRenderComponent(_component_NuxtLink, {
          to: "/superadmin/billing",
          class: "sa-quick"
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`<div class="sa-quick__icon" style="${ssrRenderStyle({ "background": "rgba(139,92,246,0.14)", "color": "rgb(139,92,246)" })}"${_scopeId}>`);
              _push2(ssrRenderComponent(VIcon, { size: "20" }, {
                default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                  if (_push3) {
                    _push3(`mdi-file-document-outline`);
                  } else {
                    return [
                      createTextVNode("mdi-file-document-outline")
                    ];
                  }
                }),
                _: 1
              }, _parent2, _scopeId));
              _push2(`</div><div${_scopeId}><p class="sa-quick__label"${_scopeId}>Platform Invoices</p><p class="sa-quick__desc"${_scopeId}>View invoices &amp; payments across tenants</p></div>`);
            } else {
              return [
                createVNode("div", {
                  class: "sa-quick__icon",
                  style: { "background": "rgba(139,92,246,0.14)", "color": "rgb(139,92,246)" }
                }, [
                  createVNode(VIcon, { size: "20" }, {
                    default: withCtx(() => [
                      createTextVNode("mdi-file-document-outline")
                    ]),
                    _: 1
                  })
                ]),
                createVNode("div", null, [
                  createVNode("p", { class: "sa-quick__label" }, "Platform Invoices"),
                  createVNode("p", { class: "sa-quick__desc" }, "View invoices & payments across tenants")
                ])
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(ssrRenderComponent(_component_NuxtLink, {
          to: "/superadmin/payments",
          class: "sa-quick"
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`<div class="sa-quick__icon" style="${ssrRenderStyle({ "background": "rgba(13,148,136,0.14)", "color": "rgb(13,148,136)" })}"${_scopeId}>`);
              _push2(ssrRenderComponent(VIcon, { size: "20" }, {
                default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                  if (_push3) {
                    _push3(`mdi-cellphone-link`);
                  } else {
                    return [
                      createTextVNode("mdi-cellphone-link")
                    ];
                  }
                }),
                _: 1
              }, _parent2, _scopeId));
              _push2(`</div><div${_scopeId}><p class="sa-quick__label"${_scopeId}>M-Pesa Payments</p><p class="sa-quick__desc"${_scopeId}>All mobile money transactions</p></div>`);
            } else {
              return [
                createVNode("div", {
                  class: "sa-quick__icon",
                  style: { "background": "rgba(13,148,136,0.14)", "color": "rgb(13,148,136)" }
                }, [
                  createVNode(VIcon, { size: "20" }, {
                    default: withCtx(() => [
                      createTextVNode("mdi-cellphone-link")
                    ]),
                    _: 1
                  })
                ]),
                createVNode("div", null, [
                  createVNode("p", { class: "sa-quick__label" }, "M-Pesa Payments"),
                  createVNode("p", { class: "sa-quick__desc" }, "All mobile money transactions")
                ])
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(ssrRenderComponent(_component_NuxtLink, {
          to: "/superadmin/plans",
          class: "sa-quick"
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`<div class="sa-quick__icon" style="${ssrRenderStyle({ "background": "rgba(245,158,11,0.14)", "color": "rgb(245,158,11)" })}"${_scopeId}>`);
              _push2(ssrRenderComponent(VIcon, { size: "20" }, {
                default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                  if (_push3) {
                    _push3(`mdi-layers-triple`);
                  } else {
                    return [
                      createTextVNode("mdi-layers-triple")
                    ];
                  }
                }),
                _: 1
              }, _parent2, _scopeId));
              _push2(`</div><div${_scopeId}><p class="sa-quick__label"${_scopeId}>Subscription Plans</p><p class="sa-quick__desc"${_scopeId}>Configure pricing, features &amp; limits</p></div>`);
            } else {
              return [
                createVNode("div", {
                  class: "sa-quick__icon",
                  style: { "background": "rgba(245,158,11,0.14)", "color": "rgb(245,158,11)" }
                }, [
                  createVNode(VIcon, { size: "20" }, {
                    default: withCtx(() => [
                      createTextVNode("mdi-layers-triple")
                    ]),
                    _: 1
                  })
                ]),
                createVNode("div", null, [
                  createVNode("p", { class: "sa-quick__label" }, "Subscription Plans"),
                  createVNode("p", { class: "sa-quick__desc" }, "Configure pricing, features & limits")
                ])
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(`</div></div></div><!--]-->`);
      }
      _push(`</div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/superadmin/index.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=index-B9Fd2_jF.mjs.map
