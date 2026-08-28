import { defineComponent, ref, computed, mergeProps, withCtx, createTextVNode, unref, isRef, createVNode, toDisplayString, useSSRContext } from 'file://D:/Projects/MY-APPS-2/DomendraPOS/frontend/node_modules/vue/index.mjs';
import { ssrRenderAttrs, ssrRenderComponent, ssrRenderList, ssrInterpolate, ssrRenderClass } from 'file://D:/Projects/MY-APPS-2/DomendraPOS/frontend/node_modules/vue/server-renderer/index.mjs';
import { D as useToast, a as VIcon, c as VBtn, a1 as VSkeletonLoader, b as VSpacer, v as VTextField, J as VSelect, n as VDataTable, o as VChip } from './server.mjs';
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

const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "billing",
  __ssrInlineRender: true,
  setup(__props) {
    const toast = useToast();
    const loading = ref(false);
    const invoices = ref([]);
    const payments = ref([]);
    const tenants = ref({});
    const invSearch = ref("");
    const invStatus = ref("all");
    const invStatusOptions = [
      { title: "All", value: "all" },
      { title: "Draft", value: "draft" },
      { title: "Sent", value: "sent" },
      { title: "Paid", value: "paid" },
      { title: "Overdue", value: "overdue" },
      { title: "Cancelled", value: "cancelled" }
    ];
    const invHeaders = [
      { title: "Invoice #", key: "invoice_number", sortable: true },
      { title: "Tenant", key: "tenant", sortable: false },
      { title: "Amount", key: "total", sortable: true },
      { title: "Status", key: "status", sortable: true },
      { title: "Issued", key: "issue_date", sortable: true },
      { title: "Due", key: "due_date", sortable: true },
      { title: "Paid", key: "paid_date", sortable: true }
    ];
    const payHeaders = [
      { title: "Amount", key: "amount", sortable: true },
      { title: "Tenant", key: "tenant", sortable: false },
      { title: "Method", key: "method", sortable: true },
      { title: "Reference", key: "reference", sortable: false },
      { title: "Date", key: "paid_at", sortable: true }
    ];
    const filteredInvoices = computed(() => {
      let list = invoices.value;
      if (invStatus.value !== "all") list = list.filter((i) => i.status === invStatus.value);
      if (invSearch.value) {
        const q = invSearch.value.toLowerCase();
        list = list.filter((i) => {
          var _a;
          return (_a = i.invoice_number) == null ? void 0 : _a.toLowerCase().includes(q);
        });
      }
      return list;
    });
    const totalInvoiced = computed(() => invoices.value.reduce((s, i) => s + Number(i.total || 0), 0));
    const totalPaid = computed(() => invoices.value.filter((i) => i.status === "paid").reduce((s, i) => s + Number(i.total || 0), 0));
    const totalOutstanding = computed(() => invoices.value.filter((i) => i.status !== "paid" && i.status !== "cancelled").reduce((s, i) => s + Number(i.total || 0), 0));
    const totalOverdue = computed(() => invoices.value.filter((i) => i.status === "overdue").reduce((s, i) => s + Number(i.total || 0), 0));
    const paidCount = computed(() => invoices.value.filter((i) => i.status === "paid").length);
    const openCount = computed(() => invoices.value.filter((i) => i.status !== "paid" && i.status !== "cancelled").length);
    const overdueCount = computed(() => invoices.value.filter((i) => i.status === "overdue").length);
    function statusColor(s) {
      const m = { paid: "success", overdue: "error", sent: "info", draft: "grey", cancelled: "grey" };
      return m[s] || "grey";
    }
    function isOverdue(inv) {
      return inv.status === "overdue" || inv.status !== "paid" && inv.due_date && new Date(inv.due_date) < /* @__PURE__ */ new Date();
    }
    function tenantName(id) {
      return tenants.value[id] || `Tenant #${id}`;
    }
    function tenantNameByInvoice(invoiceId) {
      const inv = invoices.value.find((i) => i.id === invoiceId);
      return inv ? tenantName(inv.tenant) : `Invoice #${invoiceId}`;
    }
    function formatDate(v) {
      if (!v) return "\u2014";
      return new Date(v).toLocaleDateString("en-GB", { year: "numeric", month: "short", day: "numeric" });
    }
    function formatMoney(v) {
      return `KSh ${Number(v || 0).toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
    }
    async function loadTenants() {
      try {
        const data = await useApi()("/tenants/manage/");
        const list = data.results || data || [];
        list.forEach((t) => {
          tenants.value[t.id] = t.name;
        });
      } catch {
      }
    }
    async function loadAll() {
      loading.value = true;
      try {
        const [inv, pay] = await Promise.all([
          useApi()("/billing/invoices/?page_size=500"),
          useApi()("/billing/payments/?page_size=500")
        ]);
        invoices.value = inv.results || inv || [];
        payments.value = pay.results || pay || [];
        if (Object.keys(tenants.value).length === 0) await loadTenants();
      } catch {
        toast.error("Failed to load billing data");
      } finally {
        loading.value = false;
      }
    }
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "sa-page" }, _attrs))}><div class="sa-header"><div class="sa-header__left"><div class="sa-header__title-icon">`);
      _push(ssrRenderComponent(VIcon, { size: "26" }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`mdi-file-document-outline`);
          } else {
            return [
              createTextVNode("mdi-file-document-outline")
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`</div><div><h1 class="text-h5 font-weight-bold">Platform Billing</h1><p class="text-body-2 text-medium-emphasis">Invoices &amp; payments across all tenants</p></div></div><div class="sa-header__actions">`);
      _push(ssrRenderComponent(VBtn, {
        variant: "tonal",
        "prepend-icon": "mdi-refresh",
        loading: unref(loading),
        onClick: loadAll
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
      if (unref(loading) && !unref(invoices).length) {
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
        _push(`<!--[--><div class="sa-kpi-grid"><div class="sa-kpi"><div class="sa-kpi__top"><span class="sa-kpi__label">Total Invoiced</span><div class="sa-kpi__icon sa-kpi__icon--primary">`);
        _push(ssrRenderComponent(VIcon, { size: "20" }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`mdi-file-document-multiple`);
            } else {
              return [
                createTextVNode("mdi-file-document-multiple")
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(`</div></div><p class="sa-kpi__value">${ssrInterpolate(formatMoney(unref(totalInvoiced)))}</p><div class="sa-kpi__sub">${ssrInterpolate(unref(invoices).length)} invoices</div></div><div class="sa-kpi"><div class="sa-kpi__top"><span class="sa-kpi__label">Total Paid</span><div class="sa-kpi__icon sa-kpi__icon--success">`);
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
        _push(`</div></div><p class="sa-kpi__value text-success">${ssrInterpolate(formatMoney(unref(totalPaid)))}</p><div class="sa-kpi__sub">${ssrInterpolate(unref(paidCount))} paid invoices</div></div><div class="sa-kpi"><div class="sa-kpi__top"><span class="sa-kpi__label">Outstanding</span><div class="sa-kpi__icon sa-kpi__icon--warning">`);
        _push(ssrRenderComponent(VIcon, { size: "20" }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`mdi-cash-clock`);
            } else {
              return [
                createTextVNode("mdi-cash-clock")
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(`</div></div><p class="sa-kpi__value text-warning">${ssrInterpolate(formatMoney(unref(totalOutstanding)))}</p><div class="sa-kpi__sub">${ssrInterpolate(unref(openCount))} unpaid invoices</div></div><div class="sa-kpi"><div class="sa-kpi__top"><span class="sa-kpi__label">Overdue</span><div class="sa-kpi__icon sa-kpi__icon--error">`);
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
        _push(`</div></div><p class="sa-kpi__value text-error">${ssrInterpolate(formatMoney(unref(totalOverdue)))}</p><div class="sa-kpi__sub">${ssrInterpolate(unref(overdueCount))} overdue</div></div></div><div class="sa-card"><div class="sa-card__header"><div class="sa-card__header-icon sa-card__header-icon--purple">`);
        _push(ssrRenderComponent(VIcon, { size: "20" }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`mdi-receipt-text-outline`);
            } else {
              return [
                createTextVNode("mdi-receipt-text-outline")
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(`</div><div><h3 class="sa-card__title">Invoices</h3><p class="sa-card__subtitle">${ssrInterpolate(unref(filteredInvoices).length)} invoices</p></div>`);
        _push(ssrRenderComponent(VSpacer, null, null, _parent));
        _push(ssrRenderComponent(VTextField, {
          modelValue: unref(invSearch),
          "onUpdate:modelValue": ($event) => isRef(invSearch) ? invSearch.value = $event : null,
          density: "compact",
          variant: "outlined",
          placeholder: "Search invoice #...",
          "prepend-inner-icon": "mdi-magnify",
          "hide-details": "",
          style: { "max-width": "220px" },
          class: "sa-search"
        }, null, _parent));
        _push(ssrRenderComponent(VSelect, {
          modelValue: unref(invStatus),
          "onUpdate:modelValue": ($event) => isRef(invStatus) ? invStatus.value = $event : null,
          items: invStatusOptions,
          density: "compact",
          variant: "outlined",
          "hide-details": "",
          style: { "max-width": "150px" },
          class: "sa-filter"
        }, null, _parent));
        _push(`</div>`);
        _push(ssrRenderComponent(VDataTable, {
          headers: invHeaders,
          items: unref(filteredInvoices),
          "items-per-page": 15,
          density: "comfortable",
          hover: ""
        }, {
          "item.invoice_number": withCtx(({ item }, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`<span class="text-body-2 font-weight-medium"${_scopeId}>${ssrInterpolate(item.invoice_number)}</span>`);
            } else {
              return [
                createVNode("span", { class: "text-body-2 font-weight-medium" }, toDisplayString(item.invoice_number), 1)
              ];
            }
          }),
          "item.tenant": withCtx(({ item }, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`<span class="text-body-2"${_scopeId}>${ssrInterpolate(tenantName(item.tenant))}</span>`);
            } else {
              return [
                createVNode("span", { class: "text-body-2" }, toDisplayString(tenantName(item.tenant)), 1)
              ];
            }
          }),
          "item.total": withCtx(({ item }, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`<span class="text-body-2 font-weight-medium"${_scopeId}>${ssrInterpolate(formatMoney(item.total))}</span>`);
            } else {
              return [
                createVNode("span", { class: "text-body-2 font-weight-medium" }, toDisplayString(formatMoney(item.total)), 1)
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
          "item.issue_date": withCtx(({ item }, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`<span class="text-body-2 text-medium-emphasis"${_scopeId}>${ssrInterpolate(formatDate(item.issue_date))}</span>`);
            } else {
              return [
                createVNode("span", { class: "text-body-2 text-medium-emphasis" }, toDisplayString(formatDate(item.issue_date)), 1)
              ];
            }
          }),
          "item.due_date": withCtx(({ item }, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`<span class="${ssrRenderClass([isOverdue(item) ? "text-error font-weight-medium" : "text-medium-emphasis", "text-body-2"])}"${_scopeId}>${ssrInterpolate(formatDate(item.due_date))}</span>`);
            } else {
              return [
                createVNode("span", {
                  class: ["text-body-2", isOverdue(item) ? "text-error font-weight-medium" : "text-medium-emphasis"]
                }, toDisplayString(formatDate(item.due_date)), 3)
              ];
            }
          }),
          "item.paid_date": withCtx(({ item }, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`<span class="text-body-2 text-medium-emphasis"${_scopeId}>${ssrInterpolate(item.paid_date ? formatDate(item.paid_date) : "\u2014")}</span>`);
            } else {
              return [
                createVNode("span", { class: "text-body-2 text-medium-emphasis" }, toDisplayString(item.paid_date ? formatDate(item.paid_date) : "\u2014"), 1)
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
                    _push3(`mdi-receipt-off-outline`);
                  } else {
                    return [
                      createTextVNode("mdi-receipt-off-outline")
                    ];
                  }
                }),
                _: 1
              }, _parent2, _scopeId));
              _push2(`<p class="text-body-2 text-medium-emphasis mt-2"${_scopeId}>No invoices</p></div>`);
            } else {
              return [
                createVNode("div", { class: "sa-empty" }, [
                  createVNode(VIcon, {
                    size: "44",
                    color: "grey-lighten-1"
                  }, {
                    default: withCtx(() => [
                      createTextVNode("mdi-receipt-off-outline")
                    ]),
                    _: 1
                  }),
                  createVNode("p", { class: "text-body-2 text-medium-emphasis mt-2" }, "No invoices")
                ])
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(`</div><div class="sa-card"><div class="sa-card__header"><div class="sa-card__header-icon sa-card__header-icon--green">`);
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
        _push(`</div><div><h3 class="sa-card__title">Payment Records</h3><p class="sa-card__subtitle">${ssrInterpolate(unref(payments).length)} payments recorded</p></div></div>`);
        _push(ssrRenderComponent(VDataTable, {
          headers: payHeaders,
          items: unref(payments),
          "items-per-page": 10,
          density: "comfortable",
          hover: ""
        }, {
          "item.amount": withCtx(({ item }, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`<span class="text-body-2 font-weight-medium text-success"${_scopeId}>${ssrInterpolate(formatMoney(item.amount))}</span>`);
            } else {
              return [
                createVNode("span", { class: "text-body-2 font-weight-medium text-success" }, toDisplayString(formatMoney(item.amount)), 1)
              ];
            }
          }),
          "item.tenant": withCtx(({ item }, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`<span class="text-body-2"${_scopeId}>${ssrInterpolate(tenantNameByInvoice(item.invoice))}</span>`);
            } else {
              return [
                createVNode("span", { class: "text-body-2" }, toDisplayString(tenantNameByInvoice(item.invoice)), 1)
              ];
            }
          }),
          "item.paid_at": withCtx(({ item }, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`<span class="text-body-2 text-medium-emphasis"${_scopeId}>${ssrInterpolate(formatDate(item.paid_at))}</span>`);
            } else {
              return [
                createVNode("span", { class: "text-body-2 text-medium-emphasis" }, toDisplayString(formatDate(item.paid_at)), 1)
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
              _push2(`<p class="text-body-2 text-medium-emphasis mt-2"${_scopeId}>No payments recorded</p></div>`);
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
                  createVNode("p", { class: "text-body-2 text-medium-emphasis mt-2" }, "No payments recorded")
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
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/superadmin/billing.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=billing-BJoAtUxx.mjs.map
