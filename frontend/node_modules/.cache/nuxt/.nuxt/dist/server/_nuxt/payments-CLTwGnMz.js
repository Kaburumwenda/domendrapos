import { defineComponent, ref, computed, watch, mergeProps, withCtx, createTextVNode, unref, isRef, createVNode, toDisplayString, useSSRContext } from "vue";
import { ssrRenderAttrs, ssrRenderComponent, ssrRenderList, ssrInterpolate, ssrRenderStyle } from "vue/server-renderer";
import { D as useToast, a as VIcon, c as VBtn, a1 as VSkeletonLoader, b as VSpacer, v as VTextField, J as VSelect, n as VDataTable, o as VChip } from "../server.mjs";
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
  __name: "payments",
  __ssrInlineRender: true,
  setup(__props) {
    const toast = useToast();
    const loading = ref(false);
    const transactions = ref([]);
    const totals = ref({});
    const fSearch = ref("");
    const fStatus = ref("");
    const fPurpose = ref("");
    const statusOptions = [
      { title: "All Status", value: "" },
      { title: "Success", value: "success" },
      { title: "Pending", value: "pending" },
      { title: "Failed", value: "failed" }
    ];
    const purposeOptions = [
      { title: "All Purposes", value: "" },
      { title: "Bill", value: "bill" },
      { title: "Wallet", value: "wallet" }
    ];
    const headers = [
      { title: "Tenant", key: "tenant_name", sortable: true },
      { title: "Amount", key: "amount", sortable: true },
      { title: "Status", key: "status", sortable: true },
      { title: "Purpose", key: "purpose", sortable: true },
      { title: "Phone", key: "phone", sortable: false },
      { title: "Period", key: "bill_period", sortable: false },
      { title: "Date", key: "created_at", sortable: true },
      { title: "Result", key: "result_desc", sortable: false }
    ];
    const filteredTxns = computed(() => {
      let list = transactions.value;
      if (fSearch.value) {
        const q = fSearch.value.toLowerCase();
        list = list.filter(
          (t) => t.tenant_name?.toLowerCase().includes(q) || t.phone?.toLowerCase().includes(q) || t.checkout_request_id?.toLowerCase().includes(q)
        );
      }
      return list;
    });
    function statusColor(s) {
      const m = { success: "success", pending: "warning", failed: "error" };
      return m[s] || "grey";
    }
    function formatMoney(v) {
      return Number(v || 0).toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 2 });
    }
    function formatTime(v) {
      if (!v) return "—";
      return new Date(v).toLocaleString("en-GB", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
    }
    async function loadPayments() {
      loading.value = true;
      try {
        const params = new URLSearchParams();
        if (fStatus.value) params.set("status", fStatus.value);
        if (fPurpose.value) params.set("purpose", fPurpose.value);
        const qs = params.toString();
        const res = await useApi()(`/usage-billing/admin/payments/${qs ? `?${qs}` : ""}`);
        totals.value = res.totals || {};
        transactions.value = res.transactions || [];
      } catch {
        toast.error("Failed to load payments");
      } finally {
        loading.value = false;
      }
    }
    watch([fStatus, fPurpose], () => loadPayments());
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "sa-page" }, _attrs))}><div class="sa-header"><div class="sa-header__left"><div class="sa-header__title-icon">`);
      _push(ssrRenderComponent(VIcon, { size: "26" }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`mdi-cellphone-link`);
          } else {
            return [
              createTextVNode("mdi-cellphone-link")
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`</div><div><h1 class="text-h5 font-weight-bold">M-Pesa Payments</h1><p class="text-body-2 text-medium-emphasis">All mobile money transactions across the platform</p></div></div><div class="sa-header__actions">`);
      _push(ssrRenderComponent(VBtn, {
        variant: "tonal",
        "prepend-icon": "mdi-refresh",
        loading: unref(loading),
        onClick: loadPayments
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
      if (unref(loading) && !unref(transactions).length) {
        _push(`<div class="sa-skeleton"><div class="sa-kpi-grid"><!--[-->`);
        ssrRenderList(4, (n) => {
          _push(ssrRenderComponent(VSkeletonLoader, {
            key: n,
            type: "article",
            class: "sa-skel-kpi",
            boilerplate: ""
          }, null, _parent));
        });
        _push(`<!--]--></div>`);
        _push(ssrRenderComponent(VSkeletonLoader, {
          type: "table-tbody",
          class: "sa-skel-table",
          boilerplate: ""
        }, null, _parent));
        _push(`</div>`);
      } else {
        _push(`<!--[--><div class="sa-kpi-grid"><div class="sa-kpi"><div class="sa-kpi__top"><span class="sa-kpi__label">Total Transactions</span><div class="sa-kpi__icon sa-kpi__icon--primary">`);
        _push(ssrRenderComponent(VIcon, { size: "20" }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`mdi-swap-horizontal`);
            } else {
              return [
                createTextVNode("mdi-swap-horizontal")
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(`</div></div><p class="sa-kpi__value">${ssrInterpolate(unref(totals).count ?? 0)}</p><div class="sa-kpi__sub">All M-Pesa requests</div></div><div class="sa-kpi"><div class="sa-kpi__top"><span class="sa-kpi__label">Collected</span><div class="sa-kpi__icon sa-kpi__icon--success">`);
        _push(ssrRenderComponent(VIcon, { size: "20" }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`mdi-cash-check`);
            } else {
              return [
                createTextVNode("mdi-cash-check")
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(`</div></div><p class="sa-kpi__value text-success">${ssrInterpolate(formatMoney(unref(totals).collected))}</p><div class="sa-kpi__sub">${ssrInterpolate(unref(totals).success)} successful</div></div><div class="sa-kpi"><div class="sa-kpi__top"><span class="sa-kpi__label">Pending</span><div class="sa-kpi__icon sa-kpi__icon--warning">`);
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
        _push(`</div></div><p class="sa-kpi__value text-warning">${ssrInterpolate(unref(totals).pending ?? 0)}</p><div class="sa-kpi__sub">Awaiting confirmation</div></div><div class="sa-kpi"><div class="sa-kpi__top"><span class="sa-kpi__label">Failed</span><div class="sa-kpi__icon sa-kpi__icon--error">`);
        _push(ssrRenderComponent(VIcon, { size: "20" }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`mdi-alert-circle-outline`);
            } else {
              return [
                createTextVNode("mdi-alert-circle-outline")
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(`</div></div><p class="sa-kpi__value text-error">${ssrInterpolate(unref(totals).failed ?? 0)}</p><div class="sa-kpi__sub">Unsuccessful payments</div></div></div><div class="sa-card"><div class="sa-card__header"><div class="sa-card__header-icon sa-card__header-icon--teal">`);
        _push(ssrRenderComponent(VIcon, { size: "20" }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`mdi-cash-fast`);
            } else {
              return [
                createTextVNode("mdi-cash-fast")
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(`</div><div><h3 class="sa-card__title">Transactions</h3><p class="sa-card__subtitle">${ssrInterpolate(unref(filteredTxns).length)} of ${ssrInterpolate(unref(transactions).length)} transactions</p></div>`);
        _push(ssrRenderComponent(VSpacer, null, null, _parent));
        _push(ssrRenderComponent(VTextField, {
          modelValue: unref(fSearch),
          "onUpdate:modelValue": ($event) => isRef(fSearch) ? fSearch.value = $event : null,
          density: "compact",
          variant: "outlined",
          placeholder: "Search...",
          "prepend-inner-icon": "mdi-magnify",
          "hide-details": "",
          style: { "max-width": "200px" },
          class: "sa-search"
        }, null, _parent));
        _push(ssrRenderComponent(VSelect, {
          modelValue: unref(fStatus),
          "onUpdate:modelValue": ($event) => isRef(fStatus) ? fStatus.value = $event : null,
          items: statusOptions,
          density: "compact",
          variant: "outlined",
          "hide-details": "",
          style: { "max-width": "140px" },
          class: "sa-filter"
        }, null, _parent));
        _push(ssrRenderComponent(VSelect, {
          modelValue: unref(fPurpose),
          "onUpdate:modelValue": ($event) => isRef(fPurpose) ? fPurpose.value = $event : null,
          items: purposeOptions,
          density: "compact",
          variant: "outlined",
          "hide-details": "",
          style: { "max-width": "140px" },
          class: "sa-filter"
        }, null, _parent));
        _push(`</div>`);
        _push(ssrRenderComponent(VDataTable, {
          headers,
          items: unref(filteredTxns),
          "items-per-page": 15,
          density: "comfortable",
          hover: ""
        }, {
          "item.tenant_name": withCtx(({ item }, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`<div${_scopeId}><p class="text-body-2 font-weight-medium"${_scopeId}>${ssrInterpolate(item.tenant_name || "—")}</p><p class="text-caption text-medium-emphasis"${_scopeId}>${ssrInterpolate(item.tenant_schema || "")}</p></div>`);
            } else {
              return [
                createVNode("div", null, [
                  createVNode("p", { class: "text-body-2 font-weight-medium" }, toDisplayString(item.tenant_name || "—"), 1),
                  createVNode("p", { class: "text-caption text-medium-emphasis" }, toDisplayString(item.tenant_schema || ""), 1)
                ])
              ];
            }
          }),
          "item.amount": withCtx(({ item }, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`<span class="text-body-2 font-weight-medium"${_scopeId}>${ssrInterpolate(formatMoney(item.amount))} ${ssrInterpolate(item.currency)}</span>`);
            } else {
              return [
                createVNode("span", { class: "text-body-2 font-weight-medium" }, toDisplayString(formatMoney(item.amount)) + " " + toDisplayString(item.currency), 1)
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
                    _push3(`${ssrInterpolate(item.status_display || item.status)}`);
                  } else {
                    return [
                      createTextVNode(toDisplayString(item.status_display || item.status), 1)
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
                    createTextVNode(toDisplayString(item.status_display || item.status), 1)
                  ]),
                  _: 2
                }, 1032, ["color"])
              ];
            }
          }),
          "item.purpose": withCtx(({ item }, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(ssrRenderComponent(VChip, {
                size: "x-small",
                variant: "outlined",
                label: ""
              }, {
                default: withCtx((_, _push3, _parent3, _scopeId2) => {
                  if (_push3) {
                    _push3(`${ssrInterpolate(item.purpose_display || item.purpose)}`);
                  } else {
                    return [
                      createTextVNode(toDisplayString(item.purpose_display || item.purpose), 1)
                    ];
                  }
                }),
                _: 2
              }, _parent2, _scopeId));
            } else {
              return [
                createVNode(VChip, {
                  size: "x-small",
                  variant: "outlined",
                  label: ""
                }, {
                  default: withCtx(() => [
                    createTextVNode(toDisplayString(item.purpose_display || item.purpose), 1)
                  ]),
                  _: 2
                }, 1024)
              ];
            }
          }),
          "item.phone": withCtx(({ item }, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`<span class="text-body-2 text-medium-emphasis"${_scopeId}>${ssrInterpolate(item.phone || "—")}</span>`);
            } else {
              return [
                createVNode("span", { class: "text-body-2 text-medium-emphasis" }, toDisplayString(item.phone || "—"), 1)
              ];
            }
          }),
          "item.bill_period": withCtx(({ item }, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`<span class="text-body-2 text-medium-emphasis"${_scopeId}>${ssrInterpolate(item.bill_period || "—")}</span>`);
            } else {
              return [
                createVNode("span", { class: "text-body-2 text-medium-emphasis" }, toDisplayString(item.bill_period || "—"), 1)
              ];
            }
          }),
          "item.created_at": withCtx(({ item }, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`<span class="text-body-2 text-medium-emphasis"${_scopeId}>${ssrInterpolate(formatTime(item.created_at))}</span>`);
            } else {
              return [
                createVNode("span", { class: "text-body-2 text-medium-emphasis" }, toDisplayString(formatTime(item.created_at)), 1)
              ];
            }
          }),
          "item.result_desc": withCtx(({ item }, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`<span class="text-caption text-medium-emphasis" style="${ssrRenderStyle({ "max-width": "180px", "display": "block", "overflow": "hidden", "text-overflow": "ellipsis", "white-space": "nowrap" })}"${_scopeId}>${ssrInterpolate(item.result_desc || "—")}</span>`);
            } else {
              return [
                createVNode("span", {
                  class: "text-caption text-medium-emphasis",
                  style: { "max-width": "180px", "display": "block", "overflow": "hidden", "text-overflow": "ellipsis", "white-space": "nowrap" }
                }, toDisplayString(item.result_desc || "—"), 1)
              ];
            }
          }),
          "no-data": withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`<div class="sa-empty"${_scopeId}>`);
              _push2(ssrRenderComponent(VIcon, {
                size: "44",
                color: "grey-lighten-1"
              }, {
                default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                  if (_push3) {
                    _push3(`mdi-cash-off`);
                  } else {
                    return [
                      createTextVNode("mdi-cash-off")
                    ];
                  }
                }),
                _: 1
              }, _parent2, _scopeId));
              _push2(`<p class="text-body-2 text-medium-emphasis mt-2"${_scopeId}>No transactions</p></div>`);
            } else {
              return [
                createVNode("div", { class: "sa-empty" }, [
                  createVNode(VIcon, {
                    size: "44",
                    color: "grey-lighten-1"
                  }, {
                    default: withCtx(() => [
                      createTextVNode("mdi-cash-off")
                    ]),
                    _: 1
                  }),
                  createVNode("p", { class: "text-body-2 text-medium-emphasis mt-2" }, "No transactions")
                ])
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(`</div><!--]-->`);
      }
      _push(`</div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/superadmin/payments.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
export {
  _sfc_main as default
};
//# sourceMappingURL=payments-CLTwGnMz.js.map
