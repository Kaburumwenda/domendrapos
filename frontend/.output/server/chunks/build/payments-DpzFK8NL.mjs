import { defineComponent, computed, ref, reactive, mergeProps, withCtx, createTextVNode, toDisplayString, unref, createVNode, openBlock, createBlock, createCommentVNode, Fragment, useSSRContext } from 'vue';
import { ssrRenderComponent, ssrInterpolate, ssrRenderClass } from 'vue/server-renderer';
import { u as useApi } from './useApi-9yTPzSUF.mjs';
import { u as useFormat } from './useFormat-C--cm8if.mjs';
import { u as useAuthStore } from './auth-s-b-v9EY.mjs';
import { s as setInterval } from './interval-D9ov41Wl.mjs';
import { V as VContainer, d as VIcon, f as VSpacer, g as VBtn, h as VAlert, i as VRow, j as VCol, k as VCard, l as VTabs, m as VTab, o as VBadge, p as VDivider, q as VTabsWindow, s as VTabsWindowItem, t as VDataTable, v as VChip, w as VProgressLinear, x as VDialog, y as VCardTitle, z as VCardText, A as VItemGroup, B as VItem, C as VTextField, D as VCardActions, E as VProgressCircular } from './server.mjs';
import { _ as _export_sfc } from './_plugin-vue_export-helper-1tPrXgE0.mjs';
import 'pinia';
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
import 'vue-router';
import '@vue/shared';
import 'vue3-apexcharts';

const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "payments",
  __ssrInlineRender: true,
  setup(__props) {
    const api = useApi();
    const { currency: fmtCurrency, date: fmtDate, datetime: fmtDateTime } = useFormat();
    const auth = useAuthStore();
    const currencySymbol = computed(() => auth.currencySymbol || "$");
    const data = ref(null);
    const loading = ref(false);
    const error = ref(null);
    const toast = ref(null);
    const payDialog = ref(false);
    const payTarget = ref(null);
    const payMethod = ref("mpesa");
    const payAmount = ref(0);
    const payPhone = ref("");
    const paying = ref(false);
    const payError = ref(null);
    const fundsDialog = ref(false);
    const fundsAmount = ref(0);
    const fundsPhone = ref("");
    const fundsError = ref(null);
    const mpesa = reactive({
      dialog: false,
      state: "processing",
      message: "",
      txnId: null,
      elapsed: 0,
      timeout: 60,
      interval: 6
    });
    let pollTimer = null;
    let tickTimer = null;
    let pollCancelled = false;
    const summary = computed(() => data.value?.summary || {});
    const billBalance = computed(() => Number(payTarget.value?.balance ?? payTarget.value?.amount ?? 0));
    const activeTab = ref("outstanding");
    const mpesaTimeoutLeft = computed(() => Math.max(0, mpesa.timeout - mpesa.elapsed));
    const canPay = computed(() => {
      if (!(payAmount.value > 0)) return false;
      if (payMethod.value === "wallet") return Number(data.value?.wallet_balance) >= Number(payAmount.value);
      if (payMethod.value === "mpesa") return !!payPhone.value;
      return false;
    });
    const outHeaders = [
      { title: "Period", key: "period" },
      { title: "Amount", key: "amount" },
      { title: "Balance", key: "balance" },
      { title: "Due date", key: "due_date" },
      { title: "Status", key: "status" },
      { title: "", key: "actions", sortable: false, align: "end" }
    ];
    const paidHeaders = [
      { title: "Period", key: "period" },
      { title: "Amount", key: "amount" },
      { title: "Paid on", key: "paid_at" },
      { title: "Status", key: "status" }
    ];
    const mpesaHeaders = [
      { title: "Date", key: "created_at" },
      { title: "Purpose", key: "purpose" },
      { title: "Phone", key: "phone" },
      { title: "Amount", key: "amount" },
      { title: "Status", key: "status" }
    ];
    const walletHeaders = [
      { title: "Date", key: "created_at" },
      { title: "Reason", key: "reason" },
      { title: "Amount", key: "amount", align: "end" },
      { title: "Balance", key: "balance_after", align: "end" }
    ];
    function statusColor(status) {
      const map = {
        DRAFT: "grey",
        ISSUED: "info",
        PARTIAL: "warning",
        PAID: "success",
        CANCELLED: "grey",
        WAIVED: "secondary",
        OVERDUE: "error"
      };
      return map[status] || "grey";
    }
    function mpesaStatusColor(status) {
      const map = {
        pending: "warning",
        success: "success",
        failed: "error"
      };
      return map[status] || "grey";
    }
    function openPay(bill) {
      payTarget.value = bill;
      payError.value = null;
      payMethod.value = "mpesa";
      payAmount.value = Number(bill.balance ?? bill.amount ?? 0);
      payPhone.value = data.value?.phone || "";
      payDialog.value = true;
    }
    function openAddFunds() {
      fundsError.value = null;
      fundsAmount.value = 0;
      fundsPhone.value = data.value?.phone || "";
      fundsDialog.value = true;
    }
    async function confirmPay() {
      paying.value = true;
      payError.value = null;
      try {
        if (payMethod.value === "wallet") {
          const res = await api("/usage-billing/payments/wallet/pay-bill/", {
            method: "POST",
            body: { bill_id: payTarget.value.id, amount: payAmount.value }
          });
          payDialog.value = false;
          toast.value = res?.detail || "Bill paid from wallet.";
          await load();
        } else {
          await startMpesa({
            purpose: "bill",
            bill_id: payTarget.value.id,
            amount: payAmount.value,
            phone: payPhone.value
          });
          payDialog.value = false;
        }
      } catch (e) {
        payError.value = e?.data?.detail || e.message || "Payment failed.";
      } finally {
        paying.value = false;
      }
    }
    async function confirmAddFunds() {
      paying.value = true;
      fundsError.value = null;
      try {
        await startMpesa({
          purpose: "wallet",
          amount: fundsAmount.value,
          phone: fundsPhone.value
        });
        fundsDialog.value = false;
      } catch (e) {
        fundsError.value = e?.data?.detail || e.message || "Could not start payment.";
      } finally {
        paying.value = false;
      }
    }
    async function startMpesa({ purpose, bill_id, amount, phone }) {
      const res = await api("/usage-billing/payments/mpesa/initiate/", {
        method: "POST",
        body: { purpose, bill_id, amount, phone }
      });
      mpesa.txnId = res.transaction_id;
      mpesa.timeout = res.timeout_seconds || 60;
      mpesa.interval = res.poll_interval_seconds || 6;
      mpesa.elapsed = 0;
      mpesa.state = "processing";
      mpesa.message = res.detail || "";
      mpesa.dialog = true;
      pollCancelled = false;
      startTicker();
      schedulePoll(mpesa.interval * 1e3);
    }
    function startTicker() {
      if (tickTimer) clearInterval(tickTimer);
      tickTimer = setInterval();
    }
    function schedulePoll(delay) {
      if (pollTimer) clearTimeout(pollTimer);
      pollTimer = setTimeout(pollMpesa, delay);
    }
    async function pollMpesa() {
      if (pollCancelled) return;
      try {
        const res = await api("/usage-billing/payments/mpesa/confirm/", {
          method: "POST",
          body: { transaction_id: mpesa.txnId }
        });
        if (res.status === "success") {
          mpesa.state = "success";
          mpesa.message = res.detail || "Payment confirmed.";
          stopTimers();
          await load();
          return;
        }
        if (res.status === "failed") {
          mpesa.state = "failed";
          mpesa.message = res.detail || "Payment failed.";
          stopTimers();
          return;
        }
        if (mpesa.elapsed >= mpesa.timeout) {
          mpesa.state = "failed";
          mpesa.message = "Payment timed out. If you were charged, it will reflect shortly — please refresh.";
          stopTimers();
          return;
        }
        schedulePoll(mpesa.interval * 1e3);
      } catch (e) {
        if (mpesa.elapsed >= mpesa.timeout) {
          mpesa.state = "failed";
          mpesa.message = e?.data?.detail || "Payment timed out.";
          stopTimers();
          return;
        }
        schedulePoll(mpesa.interval * 1e3);
      }
    }
    function stopTimers() {
      pollCancelled = true;
      if (pollTimer) clearTimeout(pollTimer);
      if (tickTimer) clearInterval(tickTimer);
    }
    function closeMpesa() {
      stopTimers();
      mpesa.dialog = false;
    }
    async function load() {
      loading.value = true;
      error.value = null;
      try {
        const res = await api("/usage-billing/payments/");
        data.value = res;
      } catch (e) {
        error.value = e?.data?.detail || e.message || "Failed to load payments.";
      } finally {
        loading.value = false;
      }
    }
    return (_ctx, _push, _parent, _attrs) => {
      _push(ssrRenderComponent(VContainer, mergeProps({
        fluid: "",
        class: "pa-4 pa-md-6"
      }, _attrs), {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<div class="d-flex align-center mb-4" data-v-a6648732${_scopeId}>`);
            _push2(ssrRenderComponent(VIcon, {
              class: "mr-2",
              color: "primary"
            }, {
              default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                if (_push3) {
                  _push3(`mdi-credit-card-outline`);
                } else {
                  return [
                    createTextVNode("mdi-credit-card-outline")
                  ];
                }
              }),
              _: 1
            }, _parent2, _scopeId));
            _push2(`<h1 class="text-h5 font-weight-bold" data-v-a6648732${_scopeId}>API Billing — Payments</h1>`);
            _push2(ssrRenderComponent(VSpacer, null, null, _parent2, _scopeId));
            _push2(ssrRenderComponent(VBtn, {
              variant: "text",
              "prepend-icon": "mdi-chart-box",
              to: "/admin/billing/usage"
            }, {
              default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                if (_push3) {
                  _push3(`Usage &amp; Bills`);
                } else {
                  return [
                    createTextVNode("Usage & Bills")
                  ];
                }
              }),
              _: 1
            }, _parent2, _scopeId));
            _push2(ssrRenderComponent(VBtn, {
              color: "primary",
              variant: "flat",
              "prepend-icon": "mdi-wallet-plus",
              class: "ml-2",
              onClick: openAddFunds
            }, {
              default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                if (_push3) {
                  _push3(`Add funds`);
                } else {
                  return [
                    createTextVNode("Add funds")
                  ];
                }
              }),
              _: 1
            }, _parent2, _scopeId));
            _push2(ssrRenderComponent(VBtn, {
              variant: "tonal",
              "prepend-icon": "mdi-refresh",
              loading: loading.value,
              class: "ml-2",
              onClick: load
            }, {
              default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                if (_push3) {
                  _push3(`Refresh`);
                } else {
                  return [
                    createTextVNode("Refresh")
                  ];
                }
              }),
              _: 1
            }, _parent2, _scopeId));
            _push2(`</div>`);
            if (error.value) {
              _push2(ssrRenderComponent(VAlert, {
                type: "error",
                variant: "tonal",
                class: "mb-4"
              }, {
                default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                  if (_push3) {
                    _push3(`${ssrInterpolate(error.value)}`);
                  } else {
                    return [
                      createTextVNode(toDisplayString(error.value), 1)
                    ];
                  }
                }),
                _: 1
              }, _parent2, _scopeId));
            } else {
              _push2(`<!---->`);
            }
            if (toast.value) {
              _push2(ssrRenderComponent(VAlert, {
                type: "success",
                variant: "tonal",
                class: "mb-4",
                closable: "",
                "onClick:close": ($event) => toast.value = null
              }, {
                default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                  if (_push3) {
                    _push3(`${ssrInterpolate(toast.value)}`);
                  } else {
                    return [
                      createTextVNode(toDisplayString(toast.value), 1)
                    ];
                  }
                }),
                _: 1
              }, _parent2, _scopeId));
            } else {
              _push2(`<!---->`);
            }
            if (data.value) {
              _push2(`<div data-v-a6648732${_scopeId}>`);
              _push2(ssrRenderComponent(VRow, null, {
                default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                  if (_push3) {
                    _push3(ssrRenderComponent(VCol, {
                      cols: "12",
                      md: "4",
                      sm: "6"
                    }, {
                      default: withCtx((_3, _push4, _parent4, _scopeId3) => {
                        if (_push4) {
                          _push4(ssrRenderComponent(VCard, {
                            rounded: "lg",
                            class: "pa-4"
                          }, {
                            default: withCtx((_4, _push5, _parent5, _scopeId4) => {
                              if (_push5) {
                                _push5(`<div class="d-flex align-center justify-space-between" data-v-a6648732${_scopeId4}><div class="text-caption text-medium-emphasis" data-v-a6648732${_scopeId4}>Outstanding</div>`);
                                _push5(ssrRenderComponent(VIcon, {
                                  size: "20",
                                  color: "warning"
                                }, {
                                  default: withCtx((_5, _push6, _parent6, _scopeId5) => {
                                    if (_push6) {
                                      _push6(`mdi-cash-clock`);
                                    } else {
                                      return [
                                        createTextVNode("mdi-cash-clock")
                                      ];
                                    }
                                  }),
                                  _: 1
                                }, _parent5, _scopeId4));
                                _push5(`</div><div class="text-h5 font-weight-bold mt-1" data-v-a6648732${_scopeId4}>${ssrInterpolate(unref(fmtCurrency)(summary.value.total_outstanding))}</div><div class="text-caption text-medium-emphasis mt-1" data-v-a6648732${_scopeId4}>${ssrInterpolate(summary.value.outstanding_count)} unpaid</div>`);
                              } else {
                                return [
                                  createVNode("div", { class: "d-flex align-center justify-space-between" }, [
                                    createVNode("div", { class: "text-caption text-medium-emphasis" }, "Outstanding"),
                                    createVNode(VIcon, {
                                      size: "20",
                                      color: "warning"
                                    }, {
                                      default: withCtx(() => [
                                        createTextVNode("mdi-cash-clock")
                                      ]),
                                      _: 1
                                    })
                                  ]),
                                  createVNode("div", { class: "text-h5 font-weight-bold mt-1" }, toDisplayString(unref(fmtCurrency)(summary.value.total_outstanding)), 1),
                                  createVNode("div", { class: "text-caption text-medium-emphasis mt-1" }, toDisplayString(summary.value.outstanding_count) + " unpaid", 1)
                                ];
                              }
                            }),
                            _: 1
                          }, _parent4, _scopeId3));
                        } else {
                          return [
                            createVNode(VCard, {
                              rounded: "lg",
                              class: "pa-4"
                            }, {
                              default: withCtx(() => [
                                createVNode("div", { class: "d-flex align-center justify-space-between" }, [
                                  createVNode("div", { class: "text-caption text-medium-emphasis" }, "Outstanding"),
                                  createVNode(VIcon, {
                                    size: "20",
                                    color: "warning"
                                  }, {
                                    default: withCtx(() => [
                                      createTextVNode("mdi-cash-clock")
                                    ]),
                                    _: 1
                                  })
                                ]),
                                createVNode("div", { class: "text-h5 font-weight-bold mt-1" }, toDisplayString(unref(fmtCurrency)(summary.value.total_outstanding)), 1),
                                createVNode("div", { class: "text-caption text-medium-emphasis mt-1" }, toDisplayString(summary.value.outstanding_count) + " unpaid", 1)
                              ]),
                              _: 1
                            })
                          ];
                        }
                      }),
                      _: 1
                    }, _parent3, _scopeId2));
                    _push3(ssrRenderComponent(VCol, {
                      cols: "12",
                      md: "4",
                      sm: "6"
                    }, {
                      default: withCtx((_3, _push4, _parent4, _scopeId3) => {
                        if (_push4) {
                          _push4(ssrRenderComponent(VCard, {
                            rounded: "lg",
                            class: "pa-4",
                            color: Number(summary.value.total_overdue) > 0 ? "error" : void 0,
                            variant: Number(summary.value.total_overdue) > 0 ? "tonal" : void 0
                          }, {
                            default: withCtx((_4, _push5, _parent5, _scopeId4) => {
                              if (_push5) {
                                _push5(`<div class="d-flex align-center justify-space-between" data-v-a6648732${_scopeId4}><div class="text-caption text-medium-emphasis" data-v-a6648732${_scopeId4}>Overdue</div>`);
                                _push5(ssrRenderComponent(VIcon, {
                                  size: "20",
                                  color: "error"
                                }, {
                                  default: withCtx((_5, _push6, _parent6, _scopeId5) => {
                                    if (_push6) {
                                      _push6(`mdi-alert-circle`);
                                    } else {
                                      return [
                                        createTextVNode("mdi-alert-circle")
                                      ];
                                    }
                                  }),
                                  _: 1
                                }, _parent5, _scopeId4));
                                _push5(`</div><div class="text-h5 font-weight-bold mt-1" data-v-a6648732${_scopeId4}>${ssrInterpolate(unref(fmtCurrency)(summary.value.total_overdue))}</div><div class="text-caption text-medium-emphasis mt-1" data-v-a6648732${_scopeId4}>${ssrInterpolate(summary.value.overdue_count)} overdue</div>`);
                              } else {
                                return [
                                  createVNode("div", { class: "d-flex align-center justify-space-between" }, [
                                    createVNode("div", { class: "text-caption text-medium-emphasis" }, "Overdue"),
                                    createVNode(VIcon, {
                                      size: "20",
                                      color: "error"
                                    }, {
                                      default: withCtx(() => [
                                        createTextVNode("mdi-alert-circle")
                                      ]),
                                      _: 1
                                    })
                                  ]),
                                  createVNode("div", { class: "text-h5 font-weight-bold mt-1" }, toDisplayString(unref(fmtCurrency)(summary.value.total_overdue)), 1),
                                  createVNode("div", { class: "text-caption text-medium-emphasis mt-1" }, toDisplayString(summary.value.overdue_count) + " overdue", 1)
                                ];
                              }
                            }),
                            _: 1
                          }, _parent4, _scopeId3));
                        } else {
                          return [
                            createVNode(VCard, {
                              rounded: "lg",
                              class: "pa-4",
                              color: Number(summary.value.total_overdue) > 0 ? "error" : void 0,
                              variant: Number(summary.value.total_overdue) > 0 ? "tonal" : void 0
                            }, {
                              default: withCtx(() => [
                                createVNode("div", { class: "d-flex align-center justify-space-between" }, [
                                  createVNode("div", { class: "text-caption text-medium-emphasis" }, "Overdue"),
                                  createVNode(VIcon, {
                                    size: "20",
                                    color: "error"
                                  }, {
                                    default: withCtx(() => [
                                      createTextVNode("mdi-alert-circle")
                                    ]),
                                    _: 1
                                  })
                                ]),
                                createVNode("div", { class: "text-h5 font-weight-bold mt-1" }, toDisplayString(unref(fmtCurrency)(summary.value.total_overdue)), 1),
                                createVNode("div", { class: "text-caption text-medium-emphasis mt-1" }, toDisplayString(summary.value.overdue_count) + " overdue", 1)
                              ]),
                              _: 1
                            }, 8, ["color", "variant"])
                          ];
                        }
                      }),
                      _: 1
                    }, _parent3, _scopeId2));
                    _push3(ssrRenderComponent(VCol, {
                      cols: "12",
                      md: "4",
                      sm: "6"
                    }, {
                      default: withCtx((_3, _push4, _parent4, _scopeId3) => {
                        if (_push4) {
                          _push4(ssrRenderComponent(VCard, {
                            rounded: "lg",
                            class: "pa-4",
                            color: "success",
                            variant: "tonal"
                          }, {
                            default: withCtx((_4, _push5, _parent5, _scopeId4) => {
                              if (_push5) {
                                _push5(`<div class="d-flex align-center justify-space-between" data-v-a6648732${_scopeId4}><div class="text-caption text-medium-emphasis" data-v-a6648732${_scopeId4}>Wallet balance</div>`);
                                _push5(ssrRenderComponent(VIcon, { size: "20" }, {
                                  default: withCtx((_5, _push6, _parent6, _scopeId5) => {
                                    if (_push6) {
                                      _push6(`mdi-wallet`);
                                    } else {
                                      return [
                                        createTextVNode("mdi-wallet")
                                      ];
                                    }
                                  }),
                                  _: 1
                                }, _parent5, _scopeId4));
                                _push5(`</div><div class="text-h5 font-weight-bold mt-1" data-v-a6648732${_scopeId4}>${ssrInterpolate(unref(fmtCurrency)(data.value.wallet_balance))}</div><div class="text-caption text-medium-emphasis mt-1" data-v-a6648732${_scopeId4}>Pre-funded credit</div>`);
                              } else {
                                return [
                                  createVNode("div", { class: "d-flex align-center justify-space-between" }, [
                                    createVNode("div", { class: "text-caption text-medium-emphasis" }, "Wallet balance"),
                                    createVNode(VIcon, { size: "20" }, {
                                      default: withCtx(() => [
                                        createTextVNode("mdi-wallet")
                                      ]),
                                      _: 1
                                    })
                                  ]),
                                  createVNode("div", { class: "text-h5 font-weight-bold mt-1" }, toDisplayString(unref(fmtCurrency)(data.value.wallet_balance)), 1),
                                  createVNode("div", { class: "text-caption text-medium-emphasis mt-1" }, "Pre-funded credit")
                                ];
                              }
                            }),
                            _: 1
                          }, _parent4, _scopeId3));
                        } else {
                          return [
                            createVNode(VCard, {
                              rounded: "lg",
                              class: "pa-4",
                              color: "success",
                              variant: "tonal"
                            }, {
                              default: withCtx(() => [
                                createVNode("div", { class: "d-flex align-center justify-space-between" }, [
                                  createVNode("div", { class: "text-caption text-medium-emphasis" }, "Wallet balance"),
                                  createVNode(VIcon, { size: "20" }, {
                                    default: withCtx(() => [
                                      createTextVNode("mdi-wallet")
                                    ]),
                                    _: 1
                                  })
                                ]),
                                createVNode("div", { class: "text-h5 font-weight-bold mt-1" }, toDisplayString(unref(fmtCurrency)(data.value.wallet_balance)), 1),
                                createVNode("div", { class: "text-caption text-medium-emphasis mt-1" }, "Pre-funded credit")
                              ]),
                              _: 1
                            })
                          ];
                        }
                      }),
                      _: 1
                    }, _parent3, _scopeId2));
                  } else {
                    return [
                      createVNode(VCol, {
                        cols: "12",
                        md: "4",
                        sm: "6"
                      }, {
                        default: withCtx(() => [
                          createVNode(VCard, {
                            rounded: "lg",
                            class: "pa-4"
                          }, {
                            default: withCtx(() => [
                              createVNode("div", { class: "d-flex align-center justify-space-between" }, [
                                createVNode("div", { class: "text-caption text-medium-emphasis" }, "Outstanding"),
                                createVNode(VIcon, {
                                  size: "20",
                                  color: "warning"
                                }, {
                                  default: withCtx(() => [
                                    createTextVNode("mdi-cash-clock")
                                  ]),
                                  _: 1
                                })
                              ]),
                              createVNode("div", { class: "text-h5 font-weight-bold mt-1" }, toDisplayString(unref(fmtCurrency)(summary.value.total_outstanding)), 1),
                              createVNode("div", { class: "text-caption text-medium-emphasis mt-1" }, toDisplayString(summary.value.outstanding_count) + " unpaid", 1)
                            ]),
                            _: 1
                          })
                        ]),
                        _: 1
                      }),
                      createVNode(VCol, {
                        cols: "12",
                        md: "4",
                        sm: "6"
                      }, {
                        default: withCtx(() => [
                          createVNode(VCard, {
                            rounded: "lg",
                            class: "pa-4",
                            color: Number(summary.value.total_overdue) > 0 ? "error" : void 0,
                            variant: Number(summary.value.total_overdue) > 0 ? "tonal" : void 0
                          }, {
                            default: withCtx(() => [
                              createVNode("div", { class: "d-flex align-center justify-space-between" }, [
                                createVNode("div", { class: "text-caption text-medium-emphasis" }, "Overdue"),
                                createVNode(VIcon, {
                                  size: "20",
                                  color: "error"
                                }, {
                                  default: withCtx(() => [
                                    createTextVNode("mdi-alert-circle")
                                  ]),
                                  _: 1
                                })
                              ]),
                              createVNode("div", { class: "text-h5 font-weight-bold mt-1" }, toDisplayString(unref(fmtCurrency)(summary.value.total_overdue)), 1),
                              createVNode("div", { class: "text-caption text-medium-emphasis mt-1" }, toDisplayString(summary.value.overdue_count) + " overdue", 1)
                            ]),
                            _: 1
                          }, 8, ["color", "variant"])
                        ]),
                        _: 1
                      }),
                      createVNode(VCol, {
                        cols: "12",
                        md: "4",
                        sm: "6"
                      }, {
                        default: withCtx(() => [
                          createVNode(VCard, {
                            rounded: "lg",
                            class: "pa-4",
                            color: "success",
                            variant: "tonal"
                          }, {
                            default: withCtx(() => [
                              createVNode("div", { class: "d-flex align-center justify-space-between" }, [
                                createVNode("div", { class: "text-caption text-medium-emphasis" }, "Wallet balance"),
                                createVNode(VIcon, { size: "20" }, {
                                  default: withCtx(() => [
                                    createTextVNode("mdi-wallet")
                                  ]),
                                  _: 1
                                })
                              ]),
                              createVNode("div", { class: "text-h5 font-weight-bold mt-1" }, toDisplayString(unref(fmtCurrency)(data.value.wallet_balance)), 1),
                              createVNode("div", { class: "text-caption text-medium-emphasis mt-1" }, "Pre-funded credit")
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
              }, _parent2, _scopeId));
              _push2(ssrRenderComponent(VCard, {
                rounded: "lg",
                class: "mt-4"
              }, {
                default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                  if (_push3) {
                    _push3(ssrRenderComponent(VTabs, {
                      modelValue: activeTab.value,
                      "onUpdate:modelValue": ($event) => activeTab.value = $event,
                      color: "primary",
                      "align-tabs": "start"
                    }, {
                      default: withCtx((_3, _push4, _parent4, _scopeId3) => {
                        if (_push4) {
                          _push4(ssrRenderComponent(VTab, {
                            value: "outstanding",
                            "prepend-icon": "mdi-receipt-text-clock"
                          }, {
                            default: withCtx((_4, _push5, _parent5, _scopeId4) => {
                              if (_push5) {
                                _push5(` Outstanding bills `);
                                if (data.value.outstanding_bills.length) {
                                  _push5(ssrRenderComponent(VBadge, {
                                    content: data.value.outstanding_bills.length,
                                    color: "warning",
                                    inline: "",
                                    class: "ml-2"
                                  }, null, _parent5, _scopeId4));
                                } else {
                                  _push5(`<!---->`);
                                }
                              } else {
                                return [
                                  createTextVNode(" Outstanding bills "),
                                  data.value.outstanding_bills.length ? (openBlock(), createBlock(VBadge, {
                                    key: 0,
                                    content: data.value.outstanding_bills.length,
                                    color: "warning",
                                    inline: "",
                                    class: "ml-2"
                                  }, null, 8, ["content"])) : createCommentVNode("", true)
                                ];
                              }
                            }),
                            _: 1
                          }, _parent4, _scopeId3));
                          _push4(ssrRenderComponent(VTab, {
                            value: "history",
                            "prepend-icon": "mdi-history"
                          }, {
                            default: withCtx((_4, _push5, _parent5, _scopeId4) => {
                              if (_push5) {
                                _push5(`Payment history`);
                              } else {
                                return [
                                  createTextVNode("Payment history")
                                ];
                              }
                            }),
                            _: 1
                          }, _parent4, _scopeId3));
                          _push4(ssrRenderComponent(VTab, {
                            value: "mpesa",
                            "prepend-icon": "mdi-cellphone-nfc"
                          }, {
                            default: withCtx((_4, _push5, _parent5, _scopeId4) => {
                              if (_push5) {
                                _push5(`M-Pesa transactions`);
                              } else {
                                return [
                                  createTextVNode("M-Pesa transactions")
                                ];
                              }
                            }),
                            _: 1
                          }, _parent4, _scopeId3));
                          _push4(ssrRenderComponent(VTab, {
                            value: "wallet",
                            "prepend-icon": "mdi-wallet-outline"
                          }, {
                            default: withCtx((_4, _push5, _parent5, _scopeId4) => {
                              if (_push5) {
                                _push5(`Wallet activity`);
                              } else {
                                return [
                                  createTextVNode("Wallet activity")
                                ];
                              }
                            }),
                            _: 1
                          }, _parent4, _scopeId3));
                        } else {
                          return [
                            createVNode(VTab, {
                              value: "outstanding",
                              "prepend-icon": "mdi-receipt-text-clock"
                            }, {
                              default: withCtx(() => [
                                createTextVNode(" Outstanding bills "),
                                data.value.outstanding_bills.length ? (openBlock(), createBlock(VBadge, {
                                  key: 0,
                                  content: data.value.outstanding_bills.length,
                                  color: "warning",
                                  inline: "",
                                  class: "ml-2"
                                }, null, 8, ["content"])) : createCommentVNode("", true)
                              ]),
                              _: 1
                            }),
                            createVNode(VTab, {
                              value: "history",
                              "prepend-icon": "mdi-history"
                            }, {
                              default: withCtx(() => [
                                createTextVNode("Payment history")
                              ]),
                              _: 1
                            }),
                            createVNode(VTab, {
                              value: "mpesa",
                              "prepend-icon": "mdi-cellphone-nfc"
                            }, {
                              default: withCtx(() => [
                                createTextVNode("M-Pesa transactions")
                              ]),
                              _: 1
                            }),
                            createVNode(VTab, {
                              value: "wallet",
                              "prepend-icon": "mdi-wallet-outline"
                            }, {
                              default: withCtx(() => [
                                createTextVNode("Wallet activity")
                              ]),
                              _: 1
                            })
                          ];
                        }
                      }),
                      _: 1
                    }, _parent3, _scopeId2));
                    _push3(ssrRenderComponent(VDivider, null, null, _parent3, _scopeId2));
                    _push3(ssrRenderComponent(VTabsWindow, {
                      modelValue: activeTab.value,
                      "onUpdate:modelValue": ($event) => activeTab.value = $event
                    }, {
                      default: withCtx((_3, _push4, _parent4, _scopeId3) => {
                        if (_push4) {
                          _push4(ssrRenderComponent(VTabsWindowItem, { value: "outstanding" }, {
                            default: withCtx((_4, _push5, _parent5, _scopeId4) => {
                              if (_push5) {
                                _push5(ssrRenderComponent(VDataTable, {
                                  headers: outHeaders,
                                  items: data.value.outstanding_bills,
                                  density: "comfortable",
                                  "items-per-page": 10,
                                  "hide-default-footer": ""
                                }, {
                                  "item.period": withCtx(({ item }, _push6, _parent6, _scopeId5) => {
                                    if (_push6) {
                                      _push6(`${ssrInterpolate(item.period_label || item.year + "-" + String(item.month).padStart(2, "0"))}`);
                                    } else {
                                      return [
                                        createTextVNode(toDisplayString(item.period_label || item.year + "-" + String(item.month).padStart(2, "0")), 1)
                                      ];
                                    }
                                  }),
                                  "item.amount": withCtx(({ item }, _push6, _parent6, _scopeId5) => {
                                    if (_push6) {
                                      _push6(`${ssrInterpolate(unref(fmtCurrency)(item.amount))}`);
                                    } else {
                                      return [
                                        createTextVNode(toDisplayString(unref(fmtCurrency)(item.amount)), 1)
                                      ];
                                    }
                                  }),
                                  "item.balance": withCtx(({ item }, _push6, _parent6, _scopeId5) => {
                                    if (_push6) {
                                      _push6(`<span class="font-weight-medium" data-v-a6648732${_scopeId5}>${ssrInterpolate(unref(fmtCurrency)(item.balance ?? item.amount))}</span>`);
                                    } else {
                                      return [
                                        createVNode("span", { class: "font-weight-medium" }, toDisplayString(unref(fmtCurrency)(item.balance ?? item.amount)), 1)
                                      ];
                                    }
                                  }),
                                  "item.due_date": withCtx(({ item }, _push6, _parent6, _scopeId5) => {
                                    if (_push6) {
                                      _push6(`<span class="${ssrRenderClass({ "text-error font-weight-medium": item.is_overdue })}" data-v-a6648732${_scopeId5}>${ssrInterpolate(item.due_date ? unref(fmtDate)(item.due_date) : "—")}</span>`);
                                    } else {
                                      return [
                                        createVNode("span", {
                                          class: { "text-error font-weight-medium": item.is_overdue }
                                        }, toDisplayString(item.due_date ? unref(fmtDate)(item.due_date) : "—"), 3)
                                      ];
                                    }
                                  }),
                                  "item.status": withCtx(({ item }, _push6, _parent6, _scopeId5) => {
                                    if (_push6) {
                                      _push6(ssrRenderComponent(VChip, {
                                        color: statusColor(item.effective_status || item.status),
                                        size: "small",
                                        variant: "tonal",
                                        label: ""
                                      }, {
                                        default: withCtx((_5, _push7, _parent7, _scopeId6) => {
                                          if (_push7) {
                                            _push7(`${ssrInterpolate((item.effective_status || item.status).toUpperCase())}`);
                                          } else {
                                            return [
                                              createTextVNode(toDisplayString((item.effective_status || item.status).toUpperCase()), 1)
                                            ];
                                          }
                                        }),
                                        _: 2
                                      }, _parent6, _scopeId5));
                                    } else {
                                      return [
                                        createVNode(VChip, {
                                          color: statusColor(item.effective_status || item.status),
                                          size: "small",
                                          variant: "tonal",
                                          label: ""
                                        }, {
                                          default: withCtx(() => [
                                            createTextVNode(toDisplayString((item.effective_status || item.status).toUpperCase()), 1)
                                          ]),
                                          _: 2
                                        }, 1032, ["color"])
                                      ];
                                    }
                                  }),
                                  "item.actions": withCtx(({ item }, _push6, _parent6, _scopeId5) => {
                                    if (_push6) {
                                      _push6(ssrRenderComponent(VBtn, {
                                        size: "small",
                                        color: "primary",
                                        variant: "flat",
                                        "prepend-icon": "mdi-cash-fast",
                                        class: "mr-1",
                                        onClick: ($event) => openPay(item)
                                      }, {
                                        default: withCtx((_5, _push7, _parent7, _scopeId6) => {
                                          if (_push7) {
                                            _push7(` Pay `);
                                          } else {
                                            return [
                                              createTextVNode(" Pay ")
                                            ];
                                          }
                                        }),
                                        _: 2
                                      }, _parent6, _scopeId5));
                                    } else {
                                      return [
                                        createVNode(VBtn, {
                                          size: "small",
                                          color: "primary",
                                          variant: "flat",
                                          "prepend-icon": "mdi-cash-fast",
                                          class: "mr-1",
                                          onClick: ($event) => openPay(item)
                                        }, {
                                          default: withCtx(() => [
                                            createTextVNode(" Pay ")
                                          ]),
                                          _: 1
                                        }, 8, ["onClick"])
                                      ];
                                    }
                                  }),
                                  "no-data": withCtx((_5, _push6, _parent6, _scopeId5) => {
                                    if (_push6) {
                                      _push6(`<div class="text-medium-emphasis py-6 text-center" data-v-a6648732${_scopeId5}>No outstanding bills. You&#39;re all caught up.</div>`);
                                    } else {
                                      return [
                                        createVNode("div", { class: "text-medium-emphasis py-6 text-center" }, "No outstanding bills. You're all caught up.")
                                      ];
                                    }
                                  }),
                                  _: 1
                                }, _parent5, _scopeId4));
                              } else {
                                return [
                                  createVNode(VDataTable, {
                                    headers: outHeaders,
                                    items: data.value.outstanding_bills,
                                    density: "comfortable",
                                    "items-per-page": 10,
                                    "hide-default-footer": ""
                                  }, {
                                    "item.period": withCtx(({ item }) => [
                                      createTextVNode(toDisplayString(item.period_label || item.year + "-" + String(item.month).padStart(2, "0")), 1)
                                    ]),
                                    "item.amount": withCtx(({ item }) => [
                                      createTextVNode(toDisplayString(unref(fmtCurrency)(item.amount)), 1)
                                    ]),
                                    "item.balance": withCtx(({ item }) => [
                                      createVNode("span", { class: "font-weight-medium" }, toDisplayString(unref(fmtCurrency)(item.balance ?? item.amount)), 1)
                                    ]),
                                    "item.due_date": withCtx(({ item }) => [
                                      createVNode("span", {
                                        class: { "text-error font-weight-medium": item.is_overdue }
                                      }, toDisplayString(item.due_date ? unref(fmtDate)(item.due_date) : "—"), 3)
                                    ]),
                                    "item.status": withCtx(({ item }) => [
                                      createVNode(VChip, {
                                        color: statusColor(item.effective_status || item.status),
                                        size: "small",
                                        variant: "tonal",
                                        label: ""
                                      }, {
                                        default: withCtx(() => [
                                          createTextVNode(toDisplayString((item.effective_status || item.status).toUpperCase()), 1)
                                        ]),
                                        _: 2
                                      }, 1032, ["color"])
                                    ]),
                                    "item.actions": withCtx(({ item }) => [
                                      createVNode(VBtn, {
                                        size: "small",
                                        color: "primary",
                                        variant: "flat",
                                        "prepend-icon": "mdi-cash-fast",
                                        class: "mr-1",
                                        onClick: ($event) => openPay(item)
                                      }, {
                                        default: withCtx(() => [
                                          createTextVNode(" Pay ")
                                        ]),
                                        _: 1
                                      }, 8, ["onClick"])
                                    ]),
                                    "no-data": withCtx(() => [
                                      createVNode("div", { class: "text-medium-emphasis py-6 text-center" }, "No outstanding bills. You're all caught up.")
                                    ]),
                                    _: 1
                                  }, 8, ["items"])
                                ];
                              }
                            }),
                            _: 1
                          }, _parent4, _scopeId3));
                          _push4(ssrRenderComponent(VTabsWindowItem, { value: "history" }, {
                            default: withCtx((_4, _push5, _parent5, _scopeId4) => {
                              if (_push5) {
                                _push5(ssrRenderComponent(VDataTable, {
                                  headers: paidHeaders,
                                  items: data.value.paid_bills,
                                  density: "comfortable",
                                  "items-per-page": 10,
                                  "hide-default-footer": ""
                                }, {
                                  "item.period": withCtx(({ item }, _push6, _parent6, _scopeId5) => {
                                    if (_push6) {
                                      _push6(`${ssrInterpolate(item.period_label || item.year + "-" + String(item.month).padStart(2, "0"))}`);
                                    } else {
                                      return [
                                        createTextVNode(toDisplayString(item.period_label || item.year + "-" + String(item.month).padStart(2, "0")), 1)
                                      ];
                                    }
                                  }),
                                  "item.amount": withCtx(({ item }, _push6, _parent6, _scopeId5) => {
                                    if (_push6) {
                                      _push6(`${ssrInterpolate(unref(fmtCurrency)(item.amount))}`);
                                    } else {
                                      return [
                                        createTextVNode(toDisplayString(unref(fmtCurrency)(item.amount)), 1)
                                      ];
                                    }
                                  }),
                                  "item.paid_at": withCtx(({ item }, _push6, _parent6, _scopeId5) => {
                                    if (_push6) {
                                      _push6(`${ssrInterpolate(item.paid_at ? unref(fmtDateTime)(item.paid_at) : "—")}`);
                                    } else {
                                      return [
                                        createTextVNode(toDisplayString(item.paid_at ? unref(fmtDateTime)(item.paid_at) : "—"), 1)
                                      ];
                                    }
                                  }),
                                  "item.status": withCtx(({ item }, _push6, _parent6, _scopeId5) => {
                                    if (_push6) {
                                      _push6(ssrRenderComponent(VChip, {
                                        color: statusColor(item.status),
                                        size: "small",
                                        variant: "tonal",
                                        label: ""
                                      }, {
                                        default: withCtx((_5, _push7, _parent7, _scopeId6) => {
                                          if (_push7) {
                                            _push7(`${ssrInterpolate(item.status.toUpperCase())}`);
                                          } else {
                                            return [
                                              createTextVNode(toDisplayString(item.status.toUpperCase()), 1)
                                            ];
                                          }
                                        }),
                                        _: 2
                                      }, _parent6, _scopeId5));
                                    } else {
                                      return [
                                        createVNode(VChip, {
                                          color: statusColor(item.status),
                                          size: "small",
                                          variant: "tonal",
                                          label: ""
                                        }, {
                                          default: withCtx(() => [
                                            createTextVNode(toDisplayString(item.status.toUpperCase()), 1)
                                          ]),
                                          _: 2
                                        }, 1032, ["color"])
                                      ];
                                    }
                                  }),
                                  "no-data": withCtx((_5, _push6, _parent6, _scopeId5) => {
                                    if (_push6) {
                                      _push6(`<div class="text-medium-emphasis py-6 text-center" data-v-a6648732${_scopeId5}>No payments yet.</div>`);
                                    } else {
                                      return [
                                        createVNode("div", { class: "text-medium-emphasis py-6 text-center" }, "No payments yet.")
                                      ];
                                    }
                                  }),
                                  _: 1
                                }, _parent5, _scopeId4));
                              } else {
                                return [
                                  createVNode(VDataTable, {
                                    headers: paidHeaders,
                                    items: data.value.paid_bills,
                                    density: "comfortable",
                                    "items-per-page": 10,
                                    "hide-default-footer": ""
                                  }, {
                                    "item.period": withCtx(({ item }) => [
                                      createTextVNode(toDisplayString(item.period_label || item.year + "-" + String(item.month).padStart(2, "0")), 1)
                                    ]),
                                    "item.amount": withCtx(({ item }) => [
                                      createTextVNode(toDisplayString(unref(fmtCurrency)(item.amount)), 1)
                                    ]),
                                    "item.paid_at": withCtx(({ item }) => [
                                      createTextVNode(toDisplayString(item.paid_at ? unref(fmtDateTime)(item.paid_at) : "—"), 1)
                                    ]),
                                    "item.status": withCtx(({ item }) => [
                                      createVNode(VChip, {
                                        color: statusColor(item.status),
                                        size: "small",
                                        variant: "tonal",
                                        label: ""
                                      }, {
                                        default: withCtx(() => [
                                          createTextVNode(toDisplayString(item.status.toUpperCase()), 1)
                                        ]),
                                        _: 2
                                      }, 1032, ["color"])
                                    ]),
                                    "no-data": withCtx(() => [
                                      createVNode("div", { class: "text-medium-emphasis py-6 text-center" }, "No payments yet.")
                                    ]),
                                    _: 1
                                  }, 8, ["items"])
                                ];
                              }
                            }),
                            _: 1
                          }, _parent4, _scopeId3));
                          _push4(ssrRenderComponent(VTabsWindowItem, { value: "mpesa" }, {
                            default: withCtx((_4, _push5, _parent5, _scopeId4) => {
                              if (_push5) {
                                _push5(`<div class="d-flex align-center px-4 pt-3 pb-1" data-v-a6648732${_scopeId4}>`);
                                _push5(ssrRenderComponent(VIcon, {
                                  class: "mr-2",
                                  color: "success"
                                }, {
                                  default: withCtx((_5, _push6, _parent6, _scopeId5) => {
                                    if (_push6) {
                                      _push6(`mdi-cellphone`);
                                    } else {
                                      return [
                                        createTextVNode("mdi-cellphone")
                                      ];
                                    }
                                  }),
                                  _: 1
                                }, _parent5, _scopeId4));
                                _push5(`<span class="text-caption text-medium-emphasis" data-v-a6648732${_scopeId4}>All M-Pesa STK push requests</span></div>`);
                                _push5(ssrRenderComponent(VDataTable, {
                                  headers: mpesaHeaders,
                                  items: data.value.mpesa_transactions,
                                  density: "comfortable",
                                  "items-per-page": 10,
                                  "hide-default-footer": ""
                                }, {
                                  "item.created_at": withCtx(({ item }, _push6, _parent6, _scopeId5) => {
                                    if (_push6) {
                                      _push6(`${ssrInterpolate(unref(fmtDateTime)(item.created_at))}`);
                                    } else {
                                      return [
                                        createTextVNode(toDisplayString(unref(fmtDateTime)(item.created_at)), 1)
                                      ];
                                    }
                                  }),
                                  "item.purpose": withCtx(({ item }, _push6, _parent6, _scopeId5) => {
                                    if (_push6) {
                                      _push6(`${ssrInterpolate(item.purpose_display)}`);
                                    } else {
                                      return [
                                        createTextVNode(toDisplayString(item.purpose_display), 1)
                                      ];
                                    }
                                  }),
                                  "item.amount": withCtx(({ item }, _push6, _parent6, _scopeId5) => {
                                    if (_push6) {
                                      _push6(`${ssrInterpolate(unref(fmtCurrency)(item.amount))}`);
                                    } else {
                                      return [
                                        createTextVNode(toDisplayString(unref(fmtCurrency)(item.amount)), 1)
                                      ];
                                    }
                                  }),
                                  "item.status": withCtx(({ item }, _push6, _parent6, _scopeId5) => {
                                    if (_push6) {
                                      _push6(ssrRenderComponent(VChip, {
                                        color: mpesaStatusColor(item.status),
                                        size: "small",
                                        variant: "tonal",
                                        label: ""
                                      }, {
                                        default: withCtx((_5, _push7, _parent7, _scopeId6) => {
                                          if (_push7) {
                                            _push7(`${ssrInterpolate(item.status.toUpperCase())}`);
                                          } else {
                                            return [
                                              createTextVNode(toDisplayString(item.status.toUpperCase()), 1)
                                            ];
                                          }
                                        }),
                                        _: 2
                                      }, _parent6, _scopeId5));
                                    } else {
                                      return [
                                        createVNode(VChip, {
                                          color: mpesaStatusColor(item.status),
                                          size: "small",
                                          variant: "tonal",
                                          label: ""
                                        }, {
                                          default: withCtx(() => [
                                            createTextVNode(toDisplayString(item.status.toUpperCase()), 1)
                                          ]),
                                          _: 2
                                        }, 1032, ["color"])
                                      ];
                                    }
                                  }),
                                  "no-data": withCtx((_5, _push6, _parent6, _scopeId5) => {
                                    if (_push6) {
                                      _push6(`<div class="text-medium-emphasis py-6 text-center" data-v-a6648732${_scopeId5}>No M-Pesa payments yet.</div>`);
                                    } else {
                                      return [
                                        createVNode("div", { class: "text-medium-emphasis py-6 text-center" }, "No M-Pesa payments yet.")
                                      ];
                                    }
                                  }),
                                  _: 1
                                }, _parent5, _scopeId4));
                              } else {
                                return [
                                  createVNode("div", { class: "d-flex align-center px-4 pt-3 pb-1" }, [
                                    createVNode(VIcon, {
                                      class: "mr-2",
                                      color: "success"
                                    }, {
                                      default: withCtx(() => [
                                        createTextVNode("mdi-cellphone")
                                      ]),
                                      _: 1
                                    }),
                                    createVNode("span", { class: "text-caption text-medium-emphasis" }, "All M-Pesa STK push requests")
                                  ]),
                                  createVNode(VDataTable, {
                                    headers: mpesaHeaders,
                                    items: data.value.mpesa_transactions,
                                    density: "comfortable",
                                    "items-per-page": 10,
                                    "hide-default-footer": ""
                                  }, {
                                    "item.created_at": withCtx(({ item }) => [
                                      createTextVNode(toDisplayString(unref(fmtDateTime)(item.created_at)), 1)
                                    ]),
                                    "item.purpose": withCtx(({ item }) => [
                                      createTextVNode(toDisplayString(item.purpose_display), 1)
                                    ]),
                                    "item.amount": withCtx(({ item }) => [
                                      createTextVNode(toDisplayString(unref(fmtCurrency)(item.amount)), 1)
                                    ]),
                                    "item.status": withCtx(({ item }) => [
                                      createVNode(VChip, {
                                        color: mpesaStatusColor(item.status),
                                        size: "small",
                                        variant: "tonal",
                                        label: ""
                                      }, {
                                        default: withCtx(() => [
                                          createTextVNode(toDisplayString(item.status.toUpperCase()), 1)
                                        ]),
                                        _: 2
                                      }, 1032, ["color"])
                                    ]),
                                    "no-data": withCtx(() => [
                                      createVNode("div", { class: "text-medium-emphasis py-6 text-center" }, "No M-Pesa payments yet.")
                                    ]),
                                    _: 1
                                  }, 8, ["items"])
                                ];
                              }
                            }),
                            _: 1
                          }, _parent4, _scopeId3));
                          _push4(ssrRenderComponent(VTabsWindowItem, { value: "wallet" }, {
                            default: withCtx((_4, _push5, _parent5, _scopeId4) => {
                              if (_push5) {
                                _push5(ssrRenderComponent(VDataTable, {
                                  headers: walletHeaders,
                                  items: data.value.wallet_transactions,
                                  density: "comfortable",
                                  "items-per-page": 10,
                                  "hide-default-footer": ""
                                }, {
                                  "item.created_at": withCtx(({ item }, _push6, _parent6, _scopeId5) => {
                                    if (_push6) {
                                      _push6(`${ssrInterpolate(unref(fmtDateTime)(item.created_at))}`);
                                    } else {
                                      return [
                                        createTextVNode(toDisplayString(unref(fmtDateTime)(item.created_at)), 1)
                                      ];
                                    }
                                  }),
                                  "item.amount": withCtx(({ item }, _push6, _parent6, _scopeId5) => {
                                    if (_push6) {
                                      _push6(`<span class="${ssrRenderClass(item.type === "credit" ? "text-success" : "text-error")}" data-v-a6648732${_scopeId5}>${ssrInterpolate(item.type === "credit" ? "+" : "-")} ${ssrInterpolate(unref(fmtCurrency)(item.amount))}</span>`);
                                    } else {
                                      return [
                                        createVNode("span", {
                                          class: item.type === "credit" ? "text-success" : "text-error"
                                        }, toDisplayString(item.type === "credit" ? "+" : "-") + " " + toDisplayString(unref(fmtCurrency)(item.amount)), 3)
                                      ];
                                    }
                                  }),
                                  "item.balance_after": withCtx(({ item }, _push6, _parent6, _scopeId5) => {
                                    if (_push6) {
                                      _push6(`${ssrInterpolate(unref(fmtCurrency)(item.balance_after))}`);
                                    } else {
                                      return [
                                        createTextVNode(toDisplayString(unref(fmtCurrency)(item.balance_after)), 1)
                                      ];
                                    }
                                  }),
                                  "no-data": withCtx((_5, _push6, _parent6, _scopeId5) => {
                                    if (_push6) {
                                      _push6(`<div class="text-medium-emphasis py-6 text-center" data-v-a6648732${_scopeId5}>No wallet activity yet.</div>`);
                                    } else {
                                      return [
                                        createVNode("div", { class: "text-medium-emphasis py-6 text-center" }, "No wallet activity yet.")
                                      ];
                                    }
                                  }),
                                  _: 1
                                }, _parent5, _scopeId4));
                              } else {
                                return [
                                  createVNode(VDataTable, {
                                    headers: walletHeaders,
                                    items: data.value.wallet_transactions,
                                    density: "comfortable",
                                    "items-per-page": 10,
                                    "hide-default-footer": ""
                                  }, {
                                    "item.created_at": withCtx(({ item }) => [
                                      createTextVNode(toDisplayString(unref(fmtDateTime)(item.created_at)), 1)
                                    ]),
                                    "item.amount": withCtx(({ item }) => [
                                      createVNode("span", {
                                        class: item.type === "credit" ? "text-success" : "text-error"
                                      }, toDisplayString(item.type === "credit" ? "+" : "-") + " " + toDisplayString(unref(fmtCurrency)(item.amount)), 3)
                                    ]),
                                    "item.balance_after": withCtx(({ item }) => [
                                      createTextVNode(toDisplayString(unref(fmtCurrency)(item.balance_after)), 1)
                                    ]),
                                    "no-data": withCtx(() => [
                                      createVNode("div", { class: "text-medium-emphasis py-6 text-center" }, "No wallet activity yet.")
                                    ]),
                                    _: 1
                                  }, 8, ["items"])
                                ];
                              }
                            }),
                            _: 1
                          }, _parent4, _scopeId3));
                        } else {
                          return [
                            createVNode(VTabsWindowItem, { value: "outstanding" }, {
                              default: withCtx(() => [
                                createVNode(VDataTable, {
                                  headers: outHeaders,
                                  items: data.value.outstanding_bills,
                                  density: "comfortable",
                                  "items-per-page": 10,
                                  "hide-default-footer": ""
                                }, {
                                  "item.period": withCtx(({ item }) => [
                                    createTextVNode(toDisplayString(item.period_label || item.year + "-" + String(item.month).padStart(2, "0")), 1)
                                  ]),
                                  "item.amount": withCtx(({ item }) => [
                                    createTextVNode(toDisplayString(unref(fmtCurrency)(item.amount)), 1)
                                  ]),
                                  "item.balance": withCtx(({ item }) => [
                                    createVNode("span", { class: "font-weight-medium" }, toDisplayString(unref(fmtCurrency)(item.balance ?? item.amount)), 1)
                                  ]),
                                  "item.due_date": withCtx(({ item }) => [
                                    createVNode("span", {
                                      class: { "text-error font-weight-medium": item.is_overdue }
                                    }, toDisplayString(item.due_date ? unref(fmtDate)(item.due_date) : "—"), 3)
                                  ]),
                                  "item.status": withCtx(({ item }) => [
                                    createVNode(VChip, {
                                      color: statusColor(item.effective_status || item.status),
                                      size: "small",
                                      variant: "tonal",
                                      label: ""
                                    }, {
                                      default: withCtx(() => [
                                        createTextVNode(toDisplayString((item.effective_status || item.status).toUpperCase()), 1)
                                      ]),
                                      _: 2
                                    }, 1032, ["color"])
                                  ]),
                                  "item.actions": withCtx(({ item }) => [
                                    createVNode(VBtn, {
                                      size: "small",
                                      color: "primary",
                                      variant: "flat",
                                      "prepend-icon": "mdi-cash-fast",
                                      class: "mr-1",
                                      onClick: ($event) => openPay(item)
                                    }, {
                                      default: withCtx(() => [
                                        createTextVNode(" Pay ")
                                      ]),
                                      _: 1
                                    }, 8, ["onClick"])
                                  ]),
                                  "no-data": withCtx(() => [
                                    createVNode("div", { class: "text-medium-emphasis py-6 text-center" }, "No outstanding bills. You're all caught up.")
                                  ]),
                                  _: 1
                                }, 8, ["items"])
                              ]),
                              _: 1
                            }),
                            createVNode(VTabsWindowItem, { value: "history" }, {
                              default: withCtx(() => [
                                createVNode(VDataTable, {
                                  headers: paidHeaders,
                                  items: data.value.paid_bills,
                                  density: "comfortable",
                                  "items-per-page": 10,
                                  "hide-default-footer": ""
                                }, {
                                  "item.period": withCtx(({ item }) => [
                                    createTextVNode(toDisplayString(item.period_label || item.year + "-" + String(item.month).padStart(2, "0")), 1)
                                  ]),
                                  "item.amount": withCtx(({ item }) => [
                                    createTextVNode(toDisplayString(unref(fmtCurrency)(item.amount)), 1)
                                  ]),
                                  "item.paid_at": withCtx(({ item }) => [
                                    createTextVNode(toDisplayString(item.paid_at ? unref(fmtDateTime)(item.paid_at) : "—"), 1)
                                  ]),
                                  "item.status": withCtx(({ item }) => [
                                    createVNode(VChip, {
                                      color: statusColor(item.status),
                                      size: "small",
                                      variant: "tonal",
                                      label: ""
                                    }, {
                                      default: withCtx(() => [
                                        createTextVNode(toDisplayString(item.status.toUpperCase()), 1)
                                      ]),
                                      _: 2
                                    }, 1032, ["color"])
                                  ]),
                                  "no-data": withCtx(() => [
                                    createVNode("div", { class: "text-medium-emphasis py-6 text-center" }, "No payments yet.")
                                  ]),
                                  _: 1
                                }, 8, ["items"])
                              ]),
                              _: 1
                            }),
                            createVNode(VTabsWindowItem, { value: "mpesa" }, {
                              default: withCtx(() => [
                                createVNode("div", { class: "d-flex align-center px-4 pt-3 pb-1" }, [
                                  createVNode(VIcon, {
                                    class: "mr-2",
                                    color: "success"
                                  }, {
                                    default: withCtx(() => [
                                      createTextVNode("mdi-cellphone")
                                    ]),
                                    _: 1
                                  }),
                                  createVNode("span", { class: "text-caption text-medium-emphasis" }, "All M-Pesa STK push requests")
                                ]),
                                createVNode(VDataTable, {
                                  headers: mpesaHeaders,
                                  items: data.value.mpesa_transactions,
                                  density: "comfortable",
                                  "items-per-page": 10,
                                  "hide-default-footer": ""
                                }, {
                                  "item.created_at": withCtx(({ item }) => [
                                    createTextVNode(toDisplayString(unref(fmtDateTime)(item.created_at)), 1)
                                  ]),
                                  "item.purpose": withCtx(({ item }) => [
                                    createTextVNode(toDisplayString(item.purpose_display), 1)
                                  ]),
                                  "item.amount": withCtx(({ item }) => [
                                    createTextVNode(toDisplayString(unref(fmtCurrency)(item.amount)), 1)
                                  ]),
                                  "item.status": withCtx(({ item }) => [
                                    createVNode(VChip, {
                                      color: mpesaStatusColor(item.status),
                                      size: "small",
                                      variant: "tonal",
                                      label: ""
                                    }, {
                                      default: withCtx(() => [
                                        createTextVNode(toDisplayString(item.status.toUpperCase()), 1)
                                      ]),
                                      _: 2
                                    }, 1032, ["color"])
                                  ]),
                                  "no-data": withCtx(() => [
                                    createVNode("div", { class: "text-medium-emphasis py-6 text-center" }, "No M-Pesa payments yet.")
                                  ]),
                                  _: 1
                                }, 8, ["items"])
                              ]),
                              _: 1
                            }),
                            createVNode(VTabsWindowItem, { value: "wallet" }, {
                              default: withCtx(() => [
                                createVNode(VDataTable, {
                                  headers: walletHeaders,
                                  items: data.value.wallet_transactions,
                                  density: "comfortable",
                                  "items-per-page": 10,
                                  "hide-default-footer": ""
                                }, {
                                  "item.created_at": withCtx(({ item }) => [
                                    createTextVNode(toDisplayString(unref(fmtDateTime)(item.created_at)), 1)
                                  ]),
                                  "item.amount": withCtx(({ item }) => [
                                    createVNode("span", {
                                      class: item.type === "credit" ? "text-success" : "text-error"
                                    }, toDisplayString(item.type === "credit" ? "+" : "-") + " " + toDisplayString(unref(fmtCurrency)(item.amount)), 3)
                                  ]),
                                  "item.balance_after": withCtx(({ item }) => [
                                    createTextVNode(toDisplayString(unref(fmtCurrency)(item.balance_after)), 1)
                                  ]),
                                  "no-data": withCtx(() => [
                                    createVNode("div", { class: "text-medium-emphasis py-6 text-center" }, "No wallet activity yet.")
                                  ]),
                                  _: 1
                                }, 8, ["items"])
                              ]),
                              _: 1
                            })
                          ];
                        }
                      }),
                      _: 1
                    }, _parent3, _scopeId2));
                  } else {
                    return [
                      createVNode(VTabs, {
                        modelValue: activeTab.value,
                        "onUpdate:modelValue": ($event) => activeTab.value = $event,
                        color: "primary",
                        "align-tabs": "start"
                      }, {
                        default: withCtx(() => [
                          createVNode(VTab, {
                            value: "outstanding",
                            "prepend-icon": "mdi-receipt-text-clock"
                          }, {
                            default: withCtx(() => [
                              createTextVNode(" Outstanding bills "),
                              data.value.outstanding_bills.length ? (openBlock(), createBlock(VBadge, {
                                key: 0,
                                content: data.value.outstanding_bills.length,
                                color: "warning",
                                inline: "",
                                class: "ml-2"
                              }, null, 8, ["content"])) : createCommentVNode("", true)
                            ]),
                            _: 1
                          }),
                          createVNode(VTab, {
                            value: "history",
                            "prepend-icon": "mdi-history"
                          }, {
                            default: withCtx(() => [
                              createTextVNode("Payment history")
                            ]),
                            _: 1
                          }),
                          createVNode(VTab, {
                            value: "mpesa",
                            "prepend-icon": "mdi-cellphone-nfc"
                          }, {
                            default: withCtx(() => [
                              createTextVNode("M-Pesa transactions")
                            ]),
                            _: 1
                          }),
                          createVNode(VTab, {
                            value: "wallet",
                            "prepend-icon": "mdi-wallet-outline"
                          }, {
                            default: withCtx(() => [
                              createTextVNode("Wallet activity")
                            ]),
                            _: 1
                          })
                        ]),
                        _: 1
                      }, 8, ["modelValue", "onUpdate:modelValue"]),
                      createVNode(VDivider),
                      createVNode(VTabsWindow, {
                        modelValue: activeTab.value,
                        "onUpdate:modelValue": ($event) => activeTab.value = $event
                      }, {
                        default: withCtx(() => [
                          createVNode(VTabsWindowItem, { value: "outstanding" }, {
                            default: withCtx(() => [
                              createVNode(VDataTable, {
                                headers: outHeaders,
                                items: data.value.outstanding_bills,
                                density: "comfortable",
                                "items-per-page": 10,
                                "hide-default-footer": ""
                              }, {
                                "item.period": withCtx(({ item }) => [
                                  createTextVNode(toDisplayString(item.period_label || item.year + "-" + String(item.month).padStart(2, "0")), 1)
                                ]),
                                "item.amount": withCtx(({ item }) => [
                                  createTextVNode(toDisplayString(unref(fmtCurrency)(item.amount)), 1)
                                ]),
                                "item.balance": withCtx(({ item }) => [
                                  createVNode("span", { class: "font-weight-medium" }, toDisplayString(unref(fmtCurrency)(item.balance ?? item.amount)), 1)
                                ]),
                                "item.due_date": withCtx(({ item }) => [
                                  createVNode("span", {
                                    class: { "text-error font-weight-medium": item.is_overdue }
                                  }, toDisplayString(item.due_date ? unref(fmtDate)(item.due_date) : "—"), 3)
                                ]),
                                "item.status": withCtx(({ item }) => [
                                  createVNode(VChip, {
                                    color: statusColor(item.effective_status || item.status),
                                    size: "small",
                                    variant: "tonal",
                                    label: ""
                                  }, {
                                    default: withCtx(() => [
                                      createTextVNode(toDisplayString((item.effective_status || item.status).toUpperCase()), 1)
                                    ]),
                                    _: 2
                                  }, 1032, ["color"])
                                ]),
                                "item.actions": withCtx(({ item }) => [
                                  createVNode(VBtn, {
                                    size: "small",
                                    color: "primary",
                                    variant: "flat",
                                    "prepend-icon": "mdi-cash-fast",
                                    class: "mr-1",
                                    onClick: ($event) => openPay(item)
                                  }, {
                                    default: withCtx(() => [
                                      createTextVNode(" Pay ")
                                    ]),
                                    _: 1
                                  }, 8, ["onClick"])
                                ]),
                                "no-data": withCtx(() => [
                                  createVNode("div", { class: "text-medium-emphasis py-6 text-center" }, "No outstanding bills. You're all caught up.")
                                ]),
                                _: 1
                              }, 8, ["items"])
                            ]),
                            _: 1
                          }),
                          createVNode(VTabsWindowItem, { value: "history" }, {
                            default: withCtx(() => [
                              createVNode(VDataTable, {
                                headers: paidHeaders,
                                items: data.value.paid_bills,
                                density: "comfortable",
                                "items-per-page": 10,
                                "hide-default-footer": ""
                              }, {
                                "item.period": withCtx(({ item }) => [
                                  createTextVNode(toDisplayString(item.period_label || item.year + "-" + String(item.month).padStart(2, "0")), 1)
                                ]),
                                "item.amount": withCtx(({ item }) => [
                                  createTextVNode(toDisplayString(unref(fmtCurrency)(item.amount)), 1)
                                ]),
                                "item.paid_at": withCtx(({ item }) => [
                                  createTextVNode(toDisplayString(item.paid_at ? unref(fmtDateTime)(item.paid_at) : "—"), 1)
                                ]),
                                "item.status": withCtx(({ item }) => [
                                  createVNode(VChip, {
                                    color: statusColor(item.status),
                                    size: "small",
                                    variant: "tonal",
                                    label: ""
                                  }, {
                                    default: withCtx(() => [
                                      createTextVNode(toDisplayString(item.status.toUpperCase()), 1)
                                    ]),
                                    _: 2
                                  }, 1032, ["color"])
                                ]),
                                "no-data": withCtx(() => [
                                  createVNode("div", { class: "text-medium-emphasis py-6 text-center" }, "No payments yet.")
                                ]),
                                _: 1
                              }, 8, ["items"])
                            ]),
                            _: 1
                          }),
                          createVNode(VTabsWindowItem, { value: "mpesa" }, {
                            default: withCtx(() => [
                              createVNode("div", { class: "d-flex align-center px-4 pt-3 pb-1" }, [
                                createVNode(VIcon, {
                                  class: "mr-2",
                                  color: "success"
                                }, {
                                  default: withCtx(() => [
                                    createTextVNode("mdi-cellphone")
                                  ]),
                                  _: 1
                                }),
                                createVNode("span", { class: "text-caption text-medium-emphasis" }, "All M-Pesa STK push requests")
                              ]),
                              createVNode(VDataTable, {
                                headers: mpesaHeaders,
                                items: data.value.mpesa_transactions,
                                density: "comfortable",
                                "items-per-page": 10,
                                "hide-default-footer": ""
                              }, {
                                "item.created_at": withCtx(({ item }) => [
                                  createTextVNode(toDisplayString(unref(fmtDateTime)(item.created_at)), 1)
                                ]),
                                "item.purpose": withCtx(({ item }) => [
                                  createTextVNode(toDisplayString(item.purpose_display), 1)
                                ]),
                                "item.amount": withCtx(({ item }) => [
                                  createTextVNode(toDisplayString(unref(fmtCurrency)(item.amount)), 1)
                                ]),
                                "item.status": withCtx(({ item }) => [
                                  createVNode(VChip, {
                                    color: mpesaStatusColor(item.status),
                                    size: "small",
                                    variant: "tonal",
                                    label: ""
                                  }, {
                                    default: withCtx(() => [
                                      createTextVNode(toDisplayString(item.status.toUpperCase()), 1)
                                    ]),
                                    _: 2
                                  }, 1032, ["color"])
                                ]),
                                "no-data": withCtx(() => [
                                  createVNode("div", { class: "text-medium-emphasis py-6 text-center" }, "No M-Pesa payments yet.")
                                ]),
                                _: 1
                              }, 8, ["items"])
                            ]),
                            _: 1
                          }),
                          createVNode(VTabsWindowItem, { value: "wallet" }, {
                            default: withCtx(() => [
                              createVNode(VDataTable, {
                                headers: walletHeaders,
                                items: data.value.wallet_transactions,
                                density: "comfortable",
                                "items-per-page": 10,
                                "hide-default-footer": ""
                              }, {
                                "item.created_at": withCtx(({ item }) => [
                                  createTextVNode(toDisplayString(unref(fmtDateTime)(item.created_at)), 1)
                                ]),
                                "item.amount": withCtx(({ item }) => [
                                  createVNode("span", {
                                    class: item.type === "credit" ? "text-success" : "text-error"
                                  }, toDisplayString(item.type === "credit" ? "+" : "-") + " " + toDisplayString(unref(fmtCurrency)(item.amount)), 3)
                                ]),
                                "item.balance_after": withCtx(({ item }) => [
                                  createTextVNode(toDisplayString(unref(fmtCurrency)(item.balance_after)), 1)
                                ]),
                                "no-data": withCtx(() => [
                                  createVNode("div", { class: "text-medium-emphasis py-6 text-center" }, "No wallet activity yet.")
                                ]),
                                _: 1
                              }, 8, ["items"])
                            ]),
                            _: 1
                          })
                        ]),
                        _: 1
                      }, 8, ["modelValue", "onUpdate:modelValue"])
                    ];
                  }
                }),
                _: 1
              }, _parent2, _scopeId));
              _push2(`</div>`);
            } else if (loading.value) {
              _push2(ssrRenderComponent(VProgressLinear, {
                indeterminate: "",
                color: "primary"
              }, null, _parent2, _scopeId));
            } else {
              _push2(`<!---->`);
            }
            _push2(ssrRenderComponent(VDialog, {
              modelValue: payDialog.value,
              "onUpdate:modelValue": ($event) => payDialog.value = $event,
              "max-width": "520",
              persistent: ""
            }, {
              default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                if (_push3) {
                  if (payTarget.value) {
                    _push3(ssrRenderComponent(VCard, { rounded: "lg" }, {
                      default: withCtx((_3, _push4, _parent4, _scopeId3) => {
                        if (_push4) {
                          _push4(ssrRenderComponent(VCardTitle, { class: "d-flex align-center" }, {
                            default: withCtx((_4, _push5, _parent5, _scopeId4) => {
                              if (_push5) {
                                _push5(ssrRenderComponent(VIcon, {
                                  class: "mr-2",
                                  color: "primary"
                                }, {
                                  default: withCtx((_5, _push6, _parent6, _scopeId5) => {
                                    if (_push6) {
                                      _push6(`mdi-cash-fast`);
                                    } else {
                                      return [
                                        createTextVNode("mdi-cash-fast")
                                      ];
                                    }
                                  }),
                                  _: 1
                                }, _parent5, _scopeId4));
                                _push5(` Pay bill — ${ssrInterpolate(payTarget.value.period_label)}`);
                              } else {
                                return [
                                  createVNode(VIcon, {
                                    class: "mr-2",
                                    color: "primary"
                                  }, {
                                    default: withCtx(() => [
                                      createTextVNode("mdi-cash-fast")
                                    ]),
                                    _: 1
                                  }),
                                  createTextVNode(" Pay bill — " + toDisplayString(payTarget.value.period_label), 1)
                                ];
                              }
                            }),
                            _: 1
                          }, _parent4, _scopeId3));
                          _push4(ssrRenderComponent(VCardText, null, {
                            default: withCtx((_4, _push5, _parent5, _scopeId4) => {
                              if (_push5) {
                                _push5(`<div class="d-flex justify-space-between mb-1" data-v-a6648732${_scopeId4}><span class="text-medium-emphasis" data-v-a6648732${_scopeId4}>Bill amount</span><span class="font-weight-bold" data-v-a6648732${_scopeId4}>${ssrInterpolate(unref(fmtCurrency)(payTarget.value.amount))}</span></div><div class="d-flex justify-space-between mb-3" data-v-a6648732${_scopeId4}><span class="text-medium-emphasis" data-v-a6648732${_scopeId4}>Balance due</span><span class="font-weight-bold text-warning" data-v-a6648732${_scopeId4}>${ssrInterpolate(unref(fmtCurrency)(billBalance.value))}</span></div><div class="text-caption text-medium-emphasis mb-1" data-v-a6648732${_scopeId4}>Payment method</div>`);
                                _push5(ssrRenderComponent(VItemGroup, {
                                  modelValue: payMethod.value,
                                  "onUpdate:modelValue": ($event) => payMethod.value = $event,
                                  mandatory: "",
                                  class: "mb-4"
                                }, {
                                  default: withCtx((_5, _push6, _parent6, _scopeId5) => {
                                    if (_push6) {
                                      _push6(ssrRenderComponent(VRow, null, {
                                        default: withCtx((_6, _push7, _parent7, _scopeId6) => {
                                          if (_push7) {
                                            _push7(ssrRenderComponent(VCol, { cols: "6" }, {
                                              default: withCtx((_7, _push8, _parent8, _scopeId7) => {
                                                if (_push8) {
                                                  _push8(ssrRenderComponent(VItem, { value: "mpesa" }, {
                                                    default: withCtx(({ isSelected, toggle }, _push9, _parent9, _scopeId8) => {
                                                      if (_push9) {
                                                        _push9(ssrRenderComponent(VCard, {
                                                          rounded: "lg",
                                                          variant: "outlined",
                                                          class: ["pa-2 text-center method-card", { "method-card--active": isSelected }],
                                                          onClick: toggle
                                                        }, {
                                                          default: withCtx((_8, _push10, _parent10, _scopeId9) => {
                                                            if (_push10) {
                                                              _push10(ssrRenderComponent(VIcon, {
                                                                size: "26",
                                                                color: "success"
                                                              }, {
                                                                default: withCtx((_9, _push11, _parent11, _scopeId10) => {
                                                                  if (_push11) {
                                                                    _push11(`mdi-cellphone`);
                                                                  } else {
                                                                    return [
                                                                      createTextVNode("mdi-cellphone")
                                                                    ];
                                                                  }
                                                                }),
                                                                _: 2
                                                              }, _parent10, _scopeId9));
                                                              _push10(`<div class="text-caption mt-1" data-v-a6648732${_scopeId9}>M-Pesa</div>`);
                                                            } else {
                                                              return [
                                                                createVNode(VIcon, {
                                                                  size: "26",
                                                                  color: "success"
                                                                }, {
                                                                  default: withCtx(() => [
                                                                    createTextVNode("mdi-cellphone")
                                                                  ]),
                                                                  _: 1
                                                                }),
                                                                createVNode("div", { class: "text-caption mt-1" }, "M-Pesa")
                                                              ];
                                                            }
                                                          }),
                                                          _: 2
                                                        }, _parent9, _scopeId8));
                                                      } else {
                                                        return [
                                                          createVNode(VCard, {
                                                            rounded: "lg",
                                                            variant: "outlined",
                                                            class: ["pa-2 text-center method-card", { "method-card--active": isSelected }],
                                                            onClick: toggle
                                                          }, {
                                                            default: withCtx(() => [
                                                              createVNode(VIcon, {
                                                                size: "26",
                                                                color: "success"
                                                              }, {
                                                                default: withCtx(() => [
                                                                  createTextVNode("mdi-cellphone")
                                                                ]),
                                                                _: 1
                                                              }),
                                                              createVNode("div", { class: "text-caption mt-1" }, "M-Pesa")
                                                            ]),
                                                            _: 1
                                                          }, 8, ["class", "onClick"])
                                                        ];
                                                      }
                                                    }),
                                                    _: 1
                                                  }, _parent8, _scopeId7));
                                                } else {
                                                  return [
                                                    createVNode(VItem, { value: "mpesa" }, {
                                                      default: withCtx(({ isSelected, toggle }) => [
                                                        createVNode(VCard, {
                                                          rounded: "lg",
                                                          variant: "outlined",
                                                          class: ["pa-2 text-center method-card", { "method-card--active": isSelected }],
                                                          onClick: toggle
                                                        }, {
                                                          default: withCtx(() => [
                                                            createVNode(VIcon, {
                                                              size: "26",
                                                              color: "success"
                                                            }, {
                                                              default: withCtx(() => [
                                                                createTextVNode("mdi-cellphone")
                                                              ]),
                                                              _: 1
                                                            }),
                                                            createVNode("div", { class: "text-caption mt-1" }, "M-Pesa")
                                                          ]),
                                                          _: 1
                                                        }, 8, ["class", "onClick"])
                                                      ]),
                                                      _: 1
                                                    })
                                                  ];
                                                }
                                              }),
                                              _: 1
                                            }, _parent7, _scopeId6));
                                            _push7(ssrRenderComponent(VCol, { cols: "6" }, {
                                              default: withCtx((_7, _push8, _parent8, _scopeId7) => {
                                                if (_push8) {
                                                  _push8(ssrRenderComponent(VItem, { value: "wallet" }, {
                                                    default: withCtx(({ isSelected, toggle }, _push9, _parent9, _scopeId8) => {
                                                      if (_push9) {
                                                        _push9(ssrRenderComponent(VCard, {
                                                          rounded: "lg",
                                                          variant: "outlined",
                                                          class: ["pa-2 text-center method-card", { "method-card--active": isSelected }],
                                                          onClick: toggle
                                                        }, {
                                                          default: withCtx((_8, _push10, _parent10, _scopeId9) => {
                                                            if (_push10) {
                                                              _push10(ssrRenderComponent(VIcon, {
                                                                size: "26",
                                                                color: "success"
                                                              }, {
                                                                default: withCtx((_9, _push11, _parent11, _scopeId10) => {
                                                                  if (_push11) {
                                                                    _push11(`mdi-wallet`);
                                                                  } else {
                                                                    return [
                                                                      createTextVNode("mdi-wallet")
                                                                    ];
                                                                  }
                                                                }),
                                                                _: 2
                                                              }, _parent10, _scopeId9));
                                                              _push10(`<div class="text-caption mt-1" data-v-a6648732${_scopeId9}>Wallet</div><div class="text-caption text-medium-emphasis" data-v-a6648732${_scopeId9}>${ssrInterpolate(unref(fmtCurrency)(data.value.wallet_balance))}</div>`);
                                                            } else {
                                                              return [
                                                                createVNode(VIcon, {
                                                                  size: "26",
                                                                  color: "success"
                                                                }, {
                                                                  default: withCtx(() => [
                                                                    createTextVNode("mdi-wallet")
                                                                  ]),
                                                                  _: 1
                                                                }),
                                                                createVNode("div", { class: "text-caption mt-1" }, "Wallet"),
                                                                createVNode("div", { class: "text-caption text-medium-emphasis" }, toDisplayString(unref(fmtCurrency)(data.value.wallet_balance)), 1)
                                                              ];
                                                            }
                                                          }),
                                                          _: 2
                                                        }, _parent9, _scopeId8));
                                                      } else {
                                                        return [
                                                          createVNode(VCard, {
                                                            rounded: "lg",
                                                            variant: "outlined",
                                                            class: ["pa-2 text-center method-card", { "method-card--active": isSelected }],
                                                            onClick: toggle
                                                          }, {
                                                            default: withCtx(() => [
                                                              createVNode(VIcon, {
                                                                size: "26",
                                                                color: "success"
                                                              }, {
                                                                default: withCtx(() => [
                                                                  createTextVNode("mdi-wallet")
                                                                ]),
                                                                _: 1
                                                              }),
                                                              createVNode("div", { class: "text-caption mt-1" }, "Wallet"),
                                                              createVNode("div", { class: "text-caption text-medium-emphasis" }, toDisplayString(unref(fmtCurrency)(data.value.wallet_balance)), 1)
                                                            ]),
                                                            _: 1
                                                          }, 8, ["class", "onClick"])
                                                        ];
                                                      }
                                                    }),
                                                    _: 1
                                                  }, _parent8, _scopeId7));
                                                } else {
                                                  return [
                                                    createVNode(VItem, { value: "wallet" }, {
                                                      default: withCtx(({ isSelected, toggle }) => [
                                                        createVNode(VCard, {
                                                          rounded: "lg",
                                                          variant: "outlined",
                                                          class: ["pa-2 text-center method-card", { "method-card--active": isSelected }],
                                                          onClick: toggle
                                                        }, {
                                                          default: withCtx(() => [
                                                            createVNode(VIcon, {
                                                              size: "26",
                                                              color: "success"
                                                            }, {
                                                              default: withCtx(() => [
                                                                createTextVNode("mdi-wallet")
                                                              ]),
                                                              _: 1
                                                            }),
                                                            createVNode("div", { class: "text-caption mt-1" }, "Wallet"),
                                                            createVNode("div", { class: "text-caption text-medium-emphasis" }, toDisplayString(unref(fmtCurrency)(data.value.wallet_balance)), 1)
                                                          ]),
                                                          _: 1
                                                        }, 8, ["class", "onClick"])
                                                      ]),
                                                      _: 1
                                                    })
                                                  ];
                                                }
                                              }),
                                              _: 1
                                            }, _parent7, _scopeId6));
                                          } else {
                                            return [
                                              createVNode(VCol, { cols: "6" }, {
                                                default: withCtx(() => [
                                                  createVNode(VItem, { value: "mpesa" }, {
                                                    default: withCtx(({ isSelected, toggle }) => [
                                                      createVNode(VCard, {
                                                        rounded: "lg",
                                                        variant: "outlined",
                                                        class: ["pa-2 text-center method-card", { "method-card--active": isSelected }],
                                                        onClick: toggle
                                                      }, {
                                                        default: withCtx(() => [
                                                          createVNode(VIcon, {
                                                            size: "26",
                                                            color: "success"
                                                          }, {
                                                            default: withCtx(() => [
                                                              createTextVNode("mdi-cellphone")
                                                            ]),
                                                            _: 1
                                                          }),
                                                          createVNode("div", { class: "text-caption mt-1" }, "M-Pesa")
                                                        ]),
                                                        _: 1
                                                      }, 8, ["class", "onClick"])
                                                    ]),
                                                    _: 1
                                                  })
                                                ]),
                                                _: 1
                                              }),
                                              createVNode(VCol, { cols: "6" }, {
                                                default: withCtx(() => [
                                                  createVNode(VItem, { value: "wallet" }, {
                                                    default: withCtx(({ isSelected, toggle }) => [
                                                      createVNode(VCard, {
                                                        rounded: "lg",
                                                        variant: "outlined",
                                                        class: ["pa-2 text-center method-card", { "method-card--active": isSelected }],
                                                        onClick: toggle
                                                      }, {
                                                        default: withCtx(() => [
                                                          createVNode(VIcon, {
                                                            size: "26",
                                                            color: "success"
                                                          }, {
                                                            default: withCtx(() => [
                                                              createTextVNode("mdi-wallet")
                                                            ]),
                                                            _: 1
                                                          }),
                                                          createVNode("div", { class: "text-caption mt-1" }, "Wallet"),
                                                          createVNode("div", { class: "text-caption text-medium-emphasis" }, toDisplayString(unref(fmtCurrency)(data.value.wallet_balance)), 1)
                                                        ]),
                                                        _: 1
                                                      }, 8, ["class", "onClick"])
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
                                      }, _parent6, _scopeId5));
                                    } else {
                                      return [
                                        createVNode(VRow, null, {
                                          default: withCtx(() => [
                                            createVNode(VCol, { cols: "6" }, {
                                              default: withCtx(() => [
                                                createVNode(VItem, { value: "mpesa" }, {
                                                  default: withCtx(({ isSelected, toggle }) => [
                                                    createVNode(VCard, {
                                                      rounded: "lg",
                                                      variant: "outlined",
                                                      class: ["pa-2 text-center method-card", { "method-card--active": isSelected }],
                                                      onClick: toggle
                                                    }, {
                                                      default: withCtx(() => [
                                                        createVNode(VIcon, {
                                                          size: "26",
                                                          color: "success"
                                                        }, {
                                                          default: withCtx(() => [
                                                            createTextVNode("mdi-cellphone")
                                                          ]),
                                                          _: 1
                                                        }),
                                                        createVNode("div", { class: "text-caption mt-1" }, "M-Pesa")
                                                      ]),
                                                      _: 1
                                                    }, 8, ["class", "onClick"])
                                                  ]),
                                                  _: 1
                                                })
                                              ]),
                                              _: 1
                                            }),
                                            createVNode(VCol, { cols: "6" }, {
                                              default: withCtx(() => [
                                                createVNode(VItem, { value: "wallet" }, {
                                                  default: withCtx(({ isSelected, toggle }) => [
                                                    createVNode(VCard, {
                                                      rounded: "lg",
                                                      variant: "outlined",
                                                      class: ["pa-2 text-center method-card", { "method-card--active": isSelected }],
                                                      onClick: toggle
                                                    }, {
                                                      default: withCtx(() => [
                                                        createVNode(VIcon, {
                                                          size: "26",
                                                          color: "success"
                                                        }, {
                                                          default: withCtx(() => [
                                                            createTextVNode("mdi-wallet")
                                                          ]),
                                                          _: 1
                                                        }),
                                                        createVNode("div", { class: "text-caption mt-1" }, "Wallet"),
                                                        createVNode("div", { class: "text-caption text-medium-emphasis" }, toDisplayString(unref(fmtCurrency)(data.value.wallet_balance)), 1)
                                                      ]),
                                                      _: 1
                                                    }, 8, ["class", "onClick"])
                                                  ]),
                                                  _: 1
                                                })
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
                                }, _parent5, _scopeId4));
                                _push5(ssrRenderComponent(VTextField, {
                                  modelValue: payAmount.value,
                                  "onUpdate:modelValue": ($event) => payAmount.value = $event,
                                  modelModifiers: { number: true },
                                  type: "number",
                                  label: "Amount to pay",
                                  variant: "outlined",
                                  density: "comfortable",
                                  prefix: currencySymbol.value,
                                  hint: `You can pay part of the balance (max ${unref(fmtCurrency)(billBalance.value)})`,
                                  "persistent-hint": "",
                                  class: "mb-2"
                                }, null, _parent5, _scopeId4));
                                if (payMethod.value === "mpesa") {
                                  _push5(ssrRenderComponent(VTextField, {
                                    modelValue: payPhone.value,
                                    "onUpdate:modelValue": ($event) => payPhone.value = $event,
                                    label: "M-Pesa phone number",
                                    variant: "outlined",
                                    density: "comfortable",
                                    placeholder: "07XXXXXXXX",
                                    "prepend-inner-icon": "mdi-cellphone"
                                  }, null, _parent5, _scopeId4));
                                } else {
                                  _push5(`<!---->`);
                                }
                                if (payMethod.value === "wallet" && Number(data.value.wallet_balance) < Number(payAmount.value || 0)) {
                                  _push5(ssrRenderComponent(VAlert, {
                                    type: "warning",
                                    variant: "tonal",
                                    density: "compact",
                                    class: "mt-1"
                                  }, {
                                    default: withCtx((_5, _push6, _parent6, _scopeId5) => {
                                      if (_push6) {
                                        _push6(` Insufficient wallet balance. Add funds or choose another method. `);
                                      } else {
                                        return [
                                          createTextVNode(" Insufficient wallet balance. Add funds or choose another method. ")
                                        ];
                                      }
                                    }),
                                    _: 1
                                  }, _parent5, _scopeId4));
                                } else {
                                  _push5(`<!---->`);
                                }
                                if (payError.value) {
                                  _push5(ssrRenderComponent(VAlert, {
                                    type: "error",
                                    variant: "tonal",
                                    density: "compact",
                                    class: "mt-3"
                                  }, {
                                    default: withCtx((_5, _push6, _parent6, _scopeId5) => {
                                      if (_push6) {
                                        _push6(`${ssrInterpolate(payError.value)}`);
                                      } else {
                                        return [
                                          createTextVNode(toDisplayString(payError.value), 1)
                                        ];
                                      }
                                    }),
                                    _: 1
                                  }, _parent5, _scopeId4));
                                } else {
                                  _push5(`<!---->`);
                                }
                              } else {
                                return [
                                  createVNode("div", { class: "d-flex justify-space-between mb-1" }, [
                                    createVNode("span", { class: "text-medium-emphasis" }, "Bill amount"),
                                    createVNode("span", { class: "font-weight-bold" }, toDisplayString(unref(fmtCurrency)(payTarget.value.amount)), 1)
                                  ]),
                                  createVNode("div", { class: "d-flex justify-space-between mb-3" }, [
                                    createVNode("span", { class: "text-medium-emphasis" }, "Balance due"),
                                    createVNode("span", { class: "font-weight-bold text-warning" }, toDisplayString(unref(fmtCurrency)(billBalance.value)), 1)
                                  ]),
                                  createVNode("div", { class: "text-caption text-medium-emphasis mb-1" }, "Payment method"),
                                  createVNode(VItemGroup, {
                                    modelValue: payMethod.value,
                                    "onUpdate:modelValue": ($event) => payMethod.value = $event,
                                    mandatory: "",
                                    class: "mb-4"
                                  }, {
                                    default: withCtx(() => [
                                      createVNode(VRow, null, {
                                        default: withCtx(() => [
                                          createVNode(VCol, { cols: "6" }, {
                                            default: withCtx(() => [
                                              createVNode(VItem, { value: "mpesa" }, {
                                                default: withCtx(({ isSelected, toggle }) => [
                                                  createVNode(VCard, {
                                                    rounded: "lg",
                                                    variant: "outlined",
                                                    class: ["pa-2 text-center method-card", { "method-card--active": isSelected }],
                                                    onClick: toggle
                                                  }, {
                                                    default: withCtx(() => [
                                                      createVNode(VIcon, {
                                                        size: "26",
                                                        color: "success"
                                                      }, {
                                                        default: withCtx(() => [
                                                          createTextVNode("mdi-cellphone")
                                                        ]),
                                                        _: 1
                                                      }),
                                                      createVNode("div", { class: "text-caption mt-1" }, "M-Pesa")
                                                    ]),
                                                    _: 1
                                                  }, 8, ["class", "onClick"])
                                                ]),
                                                _: 1
                                              })
                                            ]),
                                            _: 1
                                          }),
                                          createVNode(VCol, { cols: "6" }, {
                                            default: withCtx(() => [
                                              createVNode(VItem, { value: "wallet" }, {
                                                default: withCtx(({ isSelected, toggle }) => [
                                                  createVNode(VCard, {
                                                    rounded: "lg",
                                                    variant: "outlined",
                                                    class: ["pa-2 text-center method-card", { "method-card--active": isSelected }],
                                                    onClick: toggle
                                                  }, {
                                                    default: withCtx(() => [
                                                      createVNode(VIcon, {
                                                        size: "26",
                                                        color: "success"
                                                      }, {
                                                        default: withCtx(() => [
                                                          createTextVNode("mdi-wallet")
                                                        ]),
                                                        _: 1
                                                      }),
                                                      createVNode("div", { class: "text-caption mt-1" }, "Wallet"),
                                                      createVNode("div", { class: "text-caption text-medium-emphasis" }, toDisplayString(unref(fmtCurrency)(data.value.wallet_balance)), 1)
                                                    ]),
                                                    _: 1
                                                  }, 8, ["class", "onClick"])
                                                ]),
                                                _: 1
                                              })
                                            ]),
                                            _: 1
                                          })
                                        ]),
                                        _: 1
                                      })
                                    ]),
                                    _: 1
                                  }, 8, ["modelValue", "onUpdate:modelValue"]),
                                  createVNode(VTextField, {
                                    modelValue: payAmount.value,
                                    "onUpdate:modelValue": ($event) => payAmount.value = $event,
                                    modelModifiers: { number: true },
                                    type: "number",
                                    label: "Amount to pay",
                                    variant: "outlined",
                                    density: "comfortable",
                                    prefix: currencySymbol.value,
                                    hint: `You can pay part of the balance (max ${unref(fmtCurrency)(billBalance.value)})`,
                                    "persistent-hint": "",
                                    class: "mb-2"
                                  }, null, 8, ["modelValue", "onUpdate:modelValue", "prefix", "hint"]),
                                  payMethod.value === "mpesa" ? (openBlock(), createBlock(VTextField, {
                                    key: 0,
                                    modelValue: payPhone.value,
                                    "onUpdate:modelValue": ($event) => payPhone.value = $event,
                                    label: "M-Pesa phone number",
                                    variant: "outlined",
                                    density: "comfortable",
                                    placeholder: "07XXXXXXXX",
                                    "prepend-inner-icon": "mdi-cellphone"
                                  }, null, 8, ["modelValue", "onUpdate:modelValue"])) : createCommentVNode("", true),
                                  payMethod.value === "wallet" && Number(data.value.wallet_balance) < Number(payAmount.value || 0) ? (openBlock(), createBlock(VAlert, {
                                    key: 1,
                                    type: "warning",
                                    variant: "tonal",
                                    density: "compact",
                                    class: "mt-1"
                                  }, {
                                    default: withCtx(() => [
                                      createTextVNode(" Insufficient wallet balance. Add funds or choose another method. ")
                                    ]),
                                    _: 1
                                  })) : createCommentVNode("", true),
                                  payError.value ? (openBlock(), createBlock(VAlert, {
                                    key: 2,
                                    type: "error",
                                    variant: "tonal",
                                    density: "compact",
                                    class: "mt-3"
                                  }, {
                                    default: withCtx(() => [
                                      createTextVNode(toDisplayString(payError.value), 1)
                                    ]),
                                    _: 1
                                  })) : createCommentVNode("", true)
                                ];
                              }
                            }),
                            _: 1
                          }, _parent4, _scopeId3));
                          _push4(ssrRenderComponent(VCardActions, null, {
                            default: withCtx((_4, _push5, _parent5, _scopeId4) => {
                              if (_push5) {
                                _push5(ssrRenderComponent(VSpacer, null, null, _parent5, _scopeId4));
                                _push5(ssrRenderComponent(VBtn, {
                                  variant: "text",
                                  onClick: ($event) => payDialog.value = false
                                }, {
                                  default: withCtx((_5, _push6, _parent6, _scopeId5) => {
                                    if (_push6) {
                                      _push6(`Cancel`);
                                    } else {
                                      return [
                                        createTextVNode("Cancel")
                                      ];
                                    }
                                  }),
                                  _: 1
                                }, _parent5, _scopeId4));
                                _push5(ssrRenderComponent(VBtn, {
                                  color: "primary",
                                  loading: paying.value,
                                  disabled: !canPay.value,
                                  onClick: confirmPay
                                }, {
                                  default: withCtx((_5, _push6, _parent6, _scopeId5) => {
                                    if (_push6) {
                                      _push6(`${ssrInterpolate(payMethod.value === "mpesa" ? "Send M-Pesa request" : "Confirm payment")}`);
                                    } else {
                                      return [
                                        createTextVNode(toDisplayString(payMethod.value === "mpesa" ? "Send M-Pesa request" : "Confirm payment"), 1)
                                      ];
                                    }
                                  }),
                                  _: 1
                                }, _parent5, _scopeId4));
                              } else {
                                return [
                                  createVNode(VSpacer),
                                  createVNode(VBtn, {
                                    variant: "text",
                                    onClick: ($event) => payDialog.value = false
                                  }, {
                                    default: withCtx(() => [
                                      createTextVNode("Cancel")
                                    ]),
                                    _: 1
                                  }, 8, ["onClick"]),
                                  createVNode(VBtn, {
                                    color: "primary",
                                    loading: paying.value,
                                    disabled: !canPay.value,
                                    onClick: confirmPay
                                  }, {
                                    default: withCtx(() => [
                                      createTextVNode(toDisplayString(payMethod.value === "mpesa" ? "Send M-Pesa request" : "Confirm payment"), 1)
                                    ]),
                                    _: 1
                                  }, 8, ["loading", "disabled"])
                                ];
                              }
                            }),
                            _: 1
                          }, _parent4, _scopeId3));
                        } else {
                          return [
                            createVNode(VCardTitle, { class: "d-flex align-center" }, {
                              default: withCtx(() => [
                                createVNode(VIcon, {
                                  class: "mr-2",
                                  color: "primary"
                                }, {
                                  default: withCtx(() => [
                                    createTextVNode("mdi-cash-fast")
                                  ]),
                                  _: 1
                                }),
                                createTextVNode(" Pay bill — " + toDisplayString(payTarget.value.period_label), 1)
                              ]),
                              _: 1
                            }),
                            createVNode(VCardText, null, {
                              default: withCtx(() => [
                                createVNode("div", { class: "d-flex justify-space-between mb-1" }, [
                                  createVNode("span", { class: "text-medium-emphasis" }, "Bill amount"),
                                  createVNode("span", { class: "font-weight-bold" }, toDisplayString(unref(fmtCurrency)(payTarget.value.amount)), 1)
                                ]),
                                createVNode("div", { class: "d-flex justify-space-between mb-3" }, [
                                  createVNode("span", { class: "text-medium-emphasis" }, "Balance due"),
                                  createVNode("span", { class: "font-weight-bold text-warning" }, toDisplayString(unref(fmtCurrency)(billBalance.value)), 1)
                                ]),
                                createVNode("div", { class: "text-caption text-medium-emphasis mb-1" }, "Payment method"),
                                createVNode(VItemGroup, {
                                  modelValue: payMethod.value,
                                  "onUpdate:modelValue": ($event) => payMethod.value = $event,
                                  mandatory: "",
                                  class: "mb-4"
                                }, {
                                  default: withCtx(() => [
                                    createVNode(VRow, null, {
                                      default: withCtx(() => [
                                        createVNode(VCol, { cols: "6" }, {
                                          default: withCtx(() => [
                                            createVNode(VItem, { value: "mpesa" }, {
                                              default: withCtx(({ isSelected, toggle }) => [
                                                createVNode(VCard, {
                                                  rounded: "lg",
                                                  variant: "outlined",
                                                  class: ["pa-2 text-center method-card", { "method-card--active": isSelected }],
                                                  onClick: toggle
                                                }, {
                                                  default: withCtx(() => [
                                                    createVNode(VIcon, {
                                                      size: "26",
                                                      color: "success"
                                                    }, {
                                                      default: withCtx(() => [
                                                        createTextVNode("mdi-cellphone")
                                                      ]),
                                                      _: 1
                                                    }),
                                                    createVNode("div", { class: "text-caption mt-1" }, "M-Pesa")
                                                  ]),
                                                  _: 1
                                                }, 8, ["class", "onClick"])
                                              ]),
                                              _: 1
                                            })
                                          ]),
                                          _: 1
                                        }),
                                        createVNode(VCol, { cols: "6" }, {
                                          default: withCtx(() => [
                                            createVNode(VItem, { value: "wallet" }, {
                                              default: withCtx(({ isSelected, toggle }) => [
                                                createVNode(VCard, {
                                                  rounded: "lg",
                                                  variant: "outlined",
                                                  class: ["pa-2 text-center method-card", { "method-card--active": isSelected }],
                                                  onClick: toggle
                                                }, {
                                                  default: withCtx(() => [
                                                    createVNode(VIcon, {
                                                      size: "26",
                                                      color: "success"
                                                    }, {
                                                      default: withCtx(() => [
                                                        createTextVNode("mdi-wallet")
                                                      ]),
                                                      _: 1
                                                    }),
                                                    createVNode("div", { class: "text-caption mt-1" }, "Wallet"),
                                                    createVNode("div", { class: "text-caption text-medium-emphasis" }, toDisplayString(unref(fmtCurrency)(data.value.wallet_balance)), 1)
                                                  ]),
                                                  _: 1
                                                }, 8, ["class", "onClick"])
                                              ]),
                                              _: 1
                                            })
                                          ]),
                                          _: 1
                                        })
                                      ]),
                                      _: 1
                                    })
                                  ]),
                                  _: 1
                                }, 8, ["modelValue", "onUpdate:modelValue"]),
                                createVNode(VTextField, {
                                  modelValue: payAmount.value,
                                  "onUpdate:modelValue": ($event) => payAmount.value = $event,
                                  modelModifiers: { number: true },
                                  type: "number",
                                  label: "Amount to pay",
                                  variant: "outlined",
                                  density: "comfortable",
                                  prefix: currencySymbol.value,
                                  hint: `You can pay part of the balance (max ${unref(fmtCurrency)(billBalance.value)})`,
                                  "persistent-hint": "",
                                  class: "mb-2"
                                }, null, 8, ["modelValue", "onUpdate:modelValue", "prefix", "hint"]),
                                payMethod.value === "mpesa" ? (openBlock(), createBlock(VTextField, {
                                  key: 0,
                                  modelValue: payPhone.value,
                                  "onUpdate:modelValue": ($event) => payPhone.value = $event,
                                  label: "M-Pesa phone number",
                                  variant: "outlined",
                                  density: "comfortable",
                                  placeholder: "07XXXXXXXX",
                                  "prepend-inner-icon": "mdi-cellphone"
                                }, null, 8, ["modelValue", "onUpdate:modelValue"])) : createCommentVNode("", true),
                                payMethod.value === "wallet" && Number(data.value.wallet_balance) < Number(payAmount.value || 0) ? (openBlock(), createBlock(VAlert, {
                                  key: 1,
                                  type: "warning",
                                  variant: "tonal",
                                  density: "compact",
                                  class: "mt-1"
                                }, {
                                  default: withCtx(() => [
                                    createTextVNode(" Insufficient wallet balance. Add funds or choose another method. ")
                                  ]),
                                  _: 1
                                })) : createCommentVNode("", true),
                                payError.value ? (openBlock(), createBlock(VAlert, {
                                  key: 2,
                                  type: "error",
                                  variant: "tonal",
                                  density: "compact",
                                  class: "mt-3"
                                }, {
                                  default: withCtx(() => [
                                    createTextVNode(toDisplayString(payError.value), 1)
                                  ]),
                                  _: 1
                                })) : createCommentVNode("", true)
                              ]),
                              _: 1
                            }),
                            createVNode(VCardActions, null, {
                              default: withCtx(() => [
                                createVNode(VSpacer),
                                createVNode(VBtn, {
                                  variant: "text",
                                  onClick: ($event) => payDialog.value = false
                                }, {
                                  default: withCtx(() => [
                                    createTextVNode("Cancel")
                                  ]),
                                  _: 1
                                }, 8, ["onClick"]),
                                createVNode(VBtn, {
                                  color: "primary",
                                  loading: paying.value,
                                  disabled: !canPay.value,
                                  onClick: confirmPay
                                }, {
                                  default: withCtx(() => [
                                    createTextVNode(toDisplayString(payMethod.value === "mpesa" ? "Send M-Pesa request" : "Confirm payment"), 1)
                                  ]),
                                  _: 1
                                }, 8, ["loading", "disabled"])
                              ]),
                              _: 1
                            })
                          ];
                        }
                      }),
                      _: 1
                    }, _parent3, _scopeId2));
                  } else {
                    _push3(`<!---->`);
                  }
                } else {
                  return [
                    payTarget.value ? (openBlock(), createBlock(VCard, {
                      key: 0,
                      rounded: "lg"
                    }, {
                      default: withCtx(() => [
                        createVNode(VCardTitle, { class: "d-flex align-center" }, {
                          default: withCtx(() => [
                            createVNode(VIcon, {
                              class: "mr-2",
                              color: "primary"
                            }, {
                              default: withCtx(() => [
                                createTextVNode("mdi-cash-fast")
                              ]),
                              _: 1
                            }),
                            createTextVNode(" Pay bill — " + toDisplayString(payTarget.value.period_label), 1)
                          ]),
                          _: 1
                        }),
                        createVNode(VCardText, null, {
                          default: withCtx(() => [
                            createVNode("div", { class: "d-flex justify-space-between mb-1" }, [
                              createVNode("span", { class: "text-medium-emphasis" }, "Bill amount"),
                              createVNode("span", { class: "font-weight-bold" }, toDisplayString(unref(fmtCurrency)(payTarget.value.amount)), 1)
                            ]),
                            createVNode("div", { class: "d-flex justify-space-between mb-3" }, [
                              createVNode("span", { class: "text-medium-emphasis" }, "Balance due"),
                              createVNode("span", { class: "font-weight-bold text-warning" }, toDisplayString(unref(fmtCurrency)(billBalance.value)), 1)
                            ]),
                            createVNode("div", { class: "text-caption text-medium-emphasis mb-1" }, "Payment method"),
                            createVNode(VItemGroup, {
                              modelValue: payMethod.value,
                              "onUpdate:modelValue": ($event) => payMethod.value = $event,
                              mandatory: "",
                              class: "mb-4"
                            }, {
                              default: withCtx(() => [
                                createVNode(VRow, null, {
                                  default: withCtx(() => [
                                    createVNode(VCol, { cols: "6" }, {
                                      default: withCtx(() => [
                                        createVNode(VItem, { value: "mpesa" }, {
                                          default: withCtx(({ isSelected, toggle }) => [
                                            createVNode(VCard, {
                                              rounded: "lg",
                                              variant: "outlined",
                                              class: ["pa-2 text-center method-card", { "method-card--active": isSelected }],
                                              onClick: toggle
                                            }, {
                                              default: withCtx(() => [
                                                createVNode(VIcon, {
                                                  size: "26",
                                                  color: "success"
                                                }, {
                                                  default: withCtx(() => [
                                                    createTextVNode("mdi-cellphone")
                                                  ]),
                                                  _: 1
                                                }),
                                                createVNode("div", { class: "text-caption mt-1" }, "M-Pesa")
                                              ]),
                                              _: 1
                                            }, 8, ["class", "onClick"])
                                          ]),
                                          _: 1
                                        })
                                      ]),
                                      _: 1
                                    }),
                                    createVNode(VCol, { cols: "6" }, {
                                      default: withCtx(() => [
                                        createVNode(VItem, { value: "wallet" }, {
                                          default: withCtx(({ isSelected, toggle }) => [
                                            createVNode(VCard, {
                                              rounded: "lg",
                                              variant: "outlined",
                                              class: ["pa-2 text-center method-card", { "method-card--active": isSelected }],
                                              onClick: toggle
                                            }, {
                                              default: withCtx(() => [
                                                createVNode(VIcon, {
                                                  size: "26",
                                                  color: "success"
                                                }, {
                                                  default: withCtx(() => [
                                                    createTextVNode("mdi-wallet")
                                                  ]),
                                                  _: 1
                                                }),
                                                createVNode("div", { class: "text-caption mt-1" }, "Wallet"),
                                                createVNode("div", { class: "text-caption text-medium-emphasis" }, toDisplayString(unref(fmtCurrency)(data.value.wallet_balance)), 1)
                                              ]),
                                              _: 1
                                            }, 8, ["class", "onClick"])
                                          ]),
                                          _: 1
                                        })
                                      ]),
                                      _: 1
                                    })
                                  ]),
                                  _: 1
                                })
                              ]),
                              _: 1
                            }, 8, ["modelValue", "onUpdate:modelValue"]),
                            createVNode(VTextField, {
                              modelValue: payAmount.value,
                              "onUpdate:modelValue": ($event) => payAmount.value = $event,
                              modelModifiers: { number: true },
                              type: "number",
                              label: "Amount to pay",
                              variant: "outlined",
                              density: "comfortable",
                              prefix: currencySymbol.value,
                              hint: `You can pay part of the balance (max ${unref(fmtCurrency)(billBalance.value)})`,
                              "persistent-hint": "",
                              class: "mb-2"
                            }, null, 8, ["modelValue", "onUpdate:modelValue", "prefix", "hint"]),
                            payMethod.value === "mpesa" ? (openBlock(), createBlock(VTextField, {
                              key: 0,
                              modelValue: payPhone.value,
                              "onUpdate:modelValue": ($event) => payPhone.value = $event,
                              label: "M-Pesa phone number",
                              variant: "outlined",
                              density: "comfortable",
                              placeholder: "07XXXXXXXX",
                              "prepend-inner-icon": "mdi-cellphone"
                            }, null, 8, ["modelValue", "onUpdate:modelValue"])) : createCommentVNode("", true),
                            payMethod.value === "wallet" && Number(data.value.wallet_balance) < Number(payAmount.value || 0) ? (openBlock(), createBlock(VAlert, {
                              key: 1,
                              type: "warning",
                              variant: "tonal",
                              density: "compact",
                              class: "mt-1"
                            }, {
                              default: withCtx(() => [
                                createTextVNode(" Insufficient wallet balance. Add funds or choose another method. ")
                              ]),
                              _: 1
                            })) : createCommentVNode("", true),
                            payError.value ? (openBlock(), createBlock(VAlert, {
                              key: 2,
                              type: "error",
                              variant: "tonal",
                              density: "compact",
                              class: "mt-3"
                            }, {
                              default: withCtx(() => [
                                createTextVNode(toDisplayString(payError.value), 1)
                              ]),
                              _: 1
                            })) : createCommentVNode("", true)
                          ]),
                          _: 1
                        }),
                        createVNode(VCardActions, null, {
                          default: withCtx(() => [
                            createVNode(VSpacer),
                            createVNode(VBtn, {
                              variant: "text",
                              onClick: ($event) => payDialog.value = false
                            }, {
                              default: withCtx(() => [
                                createTextVNode("Cancel")
                              ]),
                              _: 1
                            }, 8, ["onClick"]),
                            createVNode(VBtn, {
                              color: "primary",
                              loading: paying.value,
                              disabled: !canPay.value,
                              onClick: confirmPay
                            }, {
                              default: withCtx(() => [
                                createTextVNode(toDisplayString(payMethod.value === "mpesa" ? "Send M-Pesa request" : "Confirm payment"), 1)
                              ]),
                              _: 1
                            }, 8, ["loading", "disabled"])
                          ]),
                          _: 1
                        })
                      ]),
                      _: 1
                    })) : createCommentVNode("", true)
                  ];
                }
              }),
              _: 1
            }, _parent2, _scopeId));
            _push2(ssrRenderComponent(VDialog, {
              modelValue: fundsDialog.value,
              "onUpdate:modelValue": ($event) => fundsDialog.value = $event,
              "max-width": "460",
              persistent: ""
            }, {
              default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                if (_push3) {
                  _push3(ssrRenderComponent(VCard, { rounded: "lg" }, {
                    default: withCtx((_3, _push4, _parent4, _scopeId3) => {
                      if (_push4) {
                        _push4(ssrRenderComponent(VCardTitle, { class: "d-flex align-center" }, {
                          default: withCtx((_4, _push5, _parent5, _scopeId4) => {
                            if (_push5) {
                              _push5(ssrRenderComponent(VIcon, {
                                class: "mr-2",
                                color: "success"
                              }, {
                                default: withCtx((_5, _push6, _parent6, _scopeId5) => {
                                  if (_push6) {
                                    _push6(`mdi-wallet-plus`);
                                  } else {
                                    return [
                                      createTextVNode("mdi-wallet-plus")
                                    ];
                                  }
                                }),
                                _: 1
                              }, _parent5, _scopeId4));
                              _push5(` Add funds to wallet `);
                            } else {
                              return [
                                createVNode(VIcon, {
                                  class: "mr-2",
                                  color: "success"
                                }, {
                                  default: withCtx(() => [
                                    createTextVNode("mdi-wallet-plus")
                                  ]),
                                  _: 1
                                }),
                                createTextVNode(" Add funds to wallet ")
                              ];
                            }
                          }),
                          _: 1
                        }, _parent4, _scopeId3));
                        _push4(ssrRenderComponent(VCardText, null, {
                          default: withCtx((_4, _push5, _parent5, _scopeId4) => {
                            if (_push5) {
                              _push5(`<p class="text-body-2 text-medium-emphasis mb-3" data-v-a6648732${_scopeId4}> Top up your DomendraPOS wallet via M-Pesa and use the balance to pay future bills. </p><div class="d-flex align-center mb-4" data-v-a6648732${_scopeId4}>`);
                              _push5(ssrRenderComponent(VIcon, {
                                class: "mr-2",
                                color: "success"
                              }, {
                                default: withCtx((_5, _push6, _parent6, _scopeId5) => {
                                  if (_push6) {
                                    _push6(`mdi-cellphone`);
                                  } else {
                                    return [
                                      createTextVNode("mdi-cellphone")
                                    ];
                                  }
                                }),
                                _: 1
                              }, _parent5, _scopeId4));
                              _push5(`<span class="text-body-2" data-v-a6648732${_scopeId4}>Lipa na M-Pesa</span></div>`);
                              _push5(ssrRenderComponent(VTextField, {
                                modelValue: fundsAmount.value,
                                "onUpdate:modelValue": ($event) => fundsAmount.value = $event,
                                modelModifiers: { number: true },
                                type: "number",
                                label: "Amount",
                                variant: "outlined",
                                density: "comfortable",
                                prefix: currencySymbol.value,
                                class: "mb-2"
                              }, null, _parent5, _scopeId4));
                              _push5(ssrRenderComponent(VTextField, {
                                modelValue: fundsPhone.value,
                                "onUpdate:modelValue": ($event) => fundsPhone.value = $event,
                                label: "M-Pesa phone number",
                                variant: "outlined",
                                density: "comfortable",
                                placeholder: "07XXXXXXXX",
                                "prepend-inner-icon": "mdi-cellphone"
                              }, null, _parent5, _scopeId4));
                              if (fundsError.value) {
                                _push5(ssrRenderComponent(VAlert, {
                                  type: "error",
                                  variant: "tonal",
                                  density: "compact",
                                  class: "mt-2"
                                }, {
                                  default: withCtx((_5, _push6, _parent6, _scopeId5) => {
                                    if (_push6) {
                                      _push6(`${ssrInterpolate(fundsError.value)}`);
                                    } else {
                                      return [
                                        createTextVNode(toDisplayString(fundsError.value), 1)
                                      ];
                                    }
                                  }),
                                  _: 1
                                }, _parent5, _scopeId4));
                              } else {
                                _push5(`<!---->`);
                              }
                            } else {
                              return [
                                createVNode("p", { class: "text-body-2 text-medium-emphasis mb-3" }, " Top up your DomendraPOS wallet via M-Pesa and use the balance to pay future bills. "),
                                createVNode("div", { class: "d-flex align-center mb-4" }, [
                                  createVNode(VIcon, {
                                    class: "mr-2",
                                    color: "success"
                                  }, {
                                    default: withCtx(() => [
                                      createTextVNode("mdi-cellphone")
                                    ]),
                                    _: 1
                                  }),
                                  createVNode("span", { class: "text-body-2" }, "Lipa na M-Pesa")
                                ]),
                                createVNode(VTextField, {
                                  modelValue: fundsAmount.value,
                                  "onUpdate:modelValue": ($event) => fundsAmount.value = $event,
                                  modelModifiers: { number: true },
                                  type: "number",
                                  label: "Amount",
                                  variant: "outlined",
                                  density: "comfortable",
                                  prefix: currencySymbol.value,
                                  class: "mb-2"
                                }, null, 8, ["modelValue", "onUpdate:modelValue", "prefix"]),
                                createVNode(VTextField, {
                                  modelValue: fundsPhone.value,
                                  "onUpdate:modelValue": ($event) => fundsPhone.value = $event,
                                  label: "M-Pesa phone number",
                                  variant: "outlined",
                                  density: "comfortable",
                                  placeholder: "07XXXXXXXX",
                                  "prepend-inner-icon": "mdi-cellphone"
                                }, null, 8, ["modelValue", "onUpdate:modelValue"]),
                                fundsError.value ? (openBlock(), createBlock(VAlert, {
                                  key: 0,
                                  type: "error",
                                  variant: "tonal",
                                  density: "compact",
                                  class: "mt-2"
                                }, {
                                  default: withCtx(() => [
                                    createTextVNode(toDisplayString(fundsError.value), 1)
                                  ]),
                                  _: 1
                                })) : createCommentVNode("", true)
                              ];
                            }
                          }),
                          _: 1
                        }, _parent4, _scopeId3));
                        _push4(ssrRenderComponent(VCardActions, null, {
                          default: withCtx((_4, _push5, _parent5, _scopeId4) => {
                            if (_push5) {
                              _push5(ssrRenderComponent(VSpacer, null, null, _parent5, _scopeId4));
                              _push5(ssrRenderComponent(VBtn, {
                                variant: "text",
                                onClick: ($event) => fundsDialog.value = false
                              }, {
                                default: withCtx((_5, _push6, _parent6, _scopeId5) => {
                                  if (_push6) {
                                    _push6(`Cancel`);
                                  } else {
                                    return [
                                      createTextVNode("Cancel")
                                    ];
                                  }
                                }),
                                _: 1
                              }, _parent5, _scopeId4));
                              _push5(ssrRenderComponent(VBtn, {
                                color: "success",
                                loading: paying.value,
                                disabled: !(fundsAmount.value > 0 && fundsPhone.value),
                                onClick: confirmAddFunds
                              }, {
                                default: withCtx((_5, _push6, _parent6, _scopeId5) => {
                                  if (_push6) {
                                    _push6(` Send M-Pesa request `);
                                  } else {
                                    return [
                                      createTextVNode(" Send M-Pesa request ")
                                    ];
                                  }
                                }),
                                _: 1
                              }, _parent5, _scopeId4));
                            } else {
                              return [
                                createVNode(VSpacer),
                                createVNode(VBtn, {
                                  variant: "text",
                                  onClick: ($event) => fundsDialog.value = false
                                }, {
                                  default: withCtx(() => [
                                    createTextVNode("Cancel")
                                  ]),
                                  _: 1
                                }, 8, ["onClick"]),
                                createVNode(VBtn, {
                                  color: "success",
                                  loading: paying.value,
                                  disabled: !(fundsAmount.value > 0 && fundsPhone.value),
                                  onClick: confirmAddFunds
                                }, {
                                  default: withCtx(() => [
                                    createTextVNode(" Send M-Pesa request ")
                                  ]),
                                  _: 1
                                }, 8, ["loading", "disabled"])
                              ];
                            }
                          }),
                          _: 1
                        }, _parent4, _scopeId3));
                      } else {
                        return [
                          createVNode(VCardTitle, { class: "d-flex align-center" }, {
                            default: withCtx(() => [
                              createVNode(VIcon, {
                                class: "mr-2",
                                color: "success"
                              }, {
                                default: withCtx(() => [
                                  createTextVNode("mdi-wallet-plus")
                                ]),
                                _: 1
                              }),
                              createTextVNode(" Add funds to wallet ")
                            ]),
                            _: 1
                          }),
                          createVNode(VCardText, null, {
                            default: withCtx(() => [
                              createVNode("p", { class: "text-body-2 text-medium-emphasis mb-3" }, " Top up your DomendraPOS wallet via M-Pesa and use the balance to pay future bills. "),
                              createVNode("div", { class: "d-flex align-center mb-4" }, [
                                createVNode(VIcon, {
                                  class: "mr-2",
                                  color: "success"
                                }, {
                                  default: withCtx(() => [
                                    createTextVNode("mdi-cellphone")
                                  ]),
                                  _: 1
                                }),
                                createVNode("span", { class: "text-body-2" }, "Lipa na M-Pesa")
                              ]),
                              createVNode(VTextField, {
                                modelValue: fundsAmount.value,
                                "onUpdate:modelValue": ($event) => fundsAmount.value = $event,
                                modelModifiers: { number: true },
                                type: "number",
                                label: "Amount",
                                variant: "outlined",
                                density: "comfortable",
                                prefix: currencySymbol.value,
                                class: "mb-2"
                              }, null, 8, ["modelValue", "onUpdate:modelValue", "prefix"]),
                              createVNode(VTextField, {
                                modelValue: fundsPhone.value,
                                "onUpdate:modelValue": ($event) => fundsPhone.value = $event,
                                label: "M-Pesa phone number",
                                variant: "outlined",
                                density: "comfortable",
                                placeholder: "07XXXXXXXX",
                                "prepend-inner-icon": "mdi-cellphone"
                              }, null, 8, ["modelValue", "onUpdate:modelValue"]),
                              fundsError.value ? (openBlock(), createBlock(VAlert, {
                                key: 0,
                                type: "error",
                                variant: "tonal",
                                density: "compact",
                                class: "mt-2"
                              }, {
                                default: withCtx(() => [
                                  createTextVNode(toDisplayString(fundsError.value), 1)
                                ]),
                                _: 1
                              })) : createCommentVNode("", true)
                            ]),
                            _: 1
                          }),
                          createVNode(VCardActions, null, {
                            default: withCtx(() => [
                              createVNode(VSpacer),
                              createVNode(VBtn, {
                                variant: "text",
                                onClick: ($event) => fundsDialog.value = false
                              }, {
                                default: withCtx(() => [
                                  createTextVNode("Cancel")
                                ]),
                                _: 1
                              }, 8, ["onClick"]),
                              createVNode(VBtn, {
                                color: "success",
                                loading: paying.value,
                                disabled: !(fundsAmount.value > 0 && fundsPhone.value),
                                onClick: confirmAddFunds
                              }, {
                                default: withCtx(() => [
                                  createTextVNode(" Send M-Pesa request ")
                                ]),
                                _: 1
                              }, 8, ["loading", "disabled"])
                            ]),
                            _: 1
                          })
                        ];
                      }
                    }),
                    _: 1
                  }, _parent3, _scopeId2));
                } else {
                  return [
                    createVNode(VCard, { rounded: "lg" }, {
                      default: withCtx(() => [
                        createVNode(VCardTitle, { class: "d-flex align-center" }, {
                          default: withCtx(() => [
                            createVNode(VIcon, {
                              class: "mr-2",
                              color: "success"
                            }, {
                              default: withCtx(() => [
                                createTextVNode("mdi-wallet-plus")
                              ]),
                              _: 1
                            }),
                            createTextVNode(" Add funds to wallet ")
                          ]),
                          _: 1
                        }),
                        createVNode(VCardText, null, {
                          default: withCtx(() => [
                            createVNode("p", { class: "text-body-2 text-medium-emphasis mb-3" }, " Top up your DomendraPOS wallet via M-Pesa and use the balance to pay future bills. "),
                            createVNode("div", { class: "d-flex align-center mb-4" }, [
                              createVNode(VIcon, {
                                class: "mr-2",
                                color: "success"
                              }, {
                                default: withCtx(() => [
                                  createTextVNode("mdi-cellphone")
                                ]),
                                _: 1
                              }),
                              createVNode("span", { class: "text-body-2" }, "Lipa na M-Pesa")
                            ]),
                            createVNode(VTextField, {
                              modelValue: fundsAmount.value,
                              "onUpdate:modelValue": ($event) => fundsAmount.value = $event,
                              modelModifiers: { number: true },
                              type: "number",
                              label: "Amount",
                              variant: "outlined",
                              density: "comfortable",
                              prefix: currencySymbol.value,
                              class: "mb-2"
                            }, null, 8, ["modelValue", "onUpdate:modelValue", "prefix"]),
                            createVNode(VTextField, {
                              modelValue: fundsPhone.value,
                              "onUpdate:modelValue": ($event) => fundsPhone.value = $event,
                              label: "M-Pesa phone number",
                              variant: "outlined",
                              density: "comfortable",
                              placeholder: "07XXXXXXXX",
                              "prepend-inner-icon": "mdi-cellphone"
                            }, null, 8, ["modelValue", "onUpdate:modelValue"]),
                            fundsError.value ? (openBlock(), createBlock(VAlert, {
                              key: 0,
                              type: "error",
                              variant: "tonal",
                              density: "compact",
                              class: "mt-2"
                            }, {
                              default: withCtx(() => [
                                createTextVNode(toDisplayString(fundsError.value), 1)
                              ]),
                              _: 1
                            })) : createCommentVNode("", true)
                          ]),
                          _: 1
                        }),
                        createVNode(VCardActions, null, {
                          default: withCtx(() => [
                            createVNode(VSpacer),
                            createVNode(VBtn, {
                              variant: "text",
                              onClick: ($event) => fundsDialog.value = false
                            }, {
                              default: withCtx(() => [
                                createTextVNode("Cancel")
                              ]),
                              _: 1
                            }, 8, ["onClick"]),
                            createVNode(VBtn, {
                              color: "success",
                              loading: paying.value,
                              disabled: !(fundsAmount.value > 0 && fundsPhone.value),
                              onClick: confirmAddFunds
                            }, {
                              default: withCtx(() => [
                                createTextVNode(" Send M-Pesa request ")
                              ]),
                              _: 1
                            }, 8, ["loading", "disabled"])
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
            }, _parent2, _scopeId));
            _push2(ssrRenderComponent(VDialog, {
              modelValue: mpesa.dialog,
              "onUpdate:modelValue": ($event) => mpesa.dialog = $event,
              "max-width": "440",
              persistent: ""
            }, {
              default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                if (_push3) {
                  _push3(ssrRenderComponent(VCard, {
                    rounded: "lg",
                    class: "text-center pa-2"
                  }, {
                    default: withCtx((_3, _push4, _parent4, _scopeId3) => {
                      if (_push4) {
                        _push4(ssrRenderComponent(VCardText, { class: "pa-6" }, {
                          default: withCtx((_4, _push5, _parent5, _scopeId4) => {
                            if (_push5) {
                              _push5(ssrRenderComponent(VIcon, {
                                color: "success",
                                size: "48",
                                class: "mb-4"
                              }, {
                                default: withCtx((_5, _push6, _parent6, _scopeId5) => {
                                  if (_push6) {
                                    _push6(`mdi-cellphone`);
                                  } else {
                                    return [
                                      createTextVNode("mdi-cellphone")
                                    ];
                                  }
                                }),
                                _: 1
                              }, _parent5, _scopeId4));
                              if (mpesa.state === "processing") {
                                _push5(`<!--[-->`);
                                _push5(ssrRenderComponent(VProgressCircular, {
                                  indeterminate: "",
                                  color: "success",
                                  size: "64",
                                  width: "5",
                                  class: "mb-4"
                                }, null, _parent5, _scopeId4));
                                _push5(`<div class="text-h6 font-weight-bold mb-1" data-v-a6648732${_scopeId4}>Awaiting your confirmation</div><p class="text-body-2 text-medium-emphasis mb-2" data-v-a6648732${_scopeId4}> Check your phone and enter your M-Pesa PIN to authorise the payment. </p>`);
                                _push5(ssrRenderComponent(VChip, {
                                  color: "warning",
                                  variant: "tonal",
                                  size: "small",
                                  class: "mb-3"
                                }, {
                                  default: withCtx((_5, _push6, _parent6, _scopeId5) => {
                                    if (_push6) {
                                      _push6(ssrRenderComponent(VIcon, {
                                        start: "",
                                        size: "16"
                                      }, {
                                        default: withCtx((_6, _push7, _parent7, _scopeId6) => {
                                          if (_push7) {
                                            _push7(`mdi-alert`);
                                          } else {
                                            return [
                                              createTextVNode("mdi-alert")
                                            ];
                                          }
                                        }),
                                        _: 1
                                      }, _parent6, _scopeId5));
                                      _push6(` Please do not close or leave this page `);
                                    } else {
                                      return [
                                        createVNode(VIcon, {
                                          start: "",
                                          size: "16"
                                        }, {
                                          default: withCtx(() => [
                                            createTextVNode("mdi-alert")
                                          ]),
                                          _: 1
                                        }),
                                        createTextVNode(" Please do not close or leave this page ")
                                      ];
                                    }
                                  }),
                                  _: 1
                                }, _parent5, _scopeId4));
                                _push5(ssrRenderComponent(VProgressLinear, {
                                  "model-value": mpesa.elapsed / mpesa.timeout * 100,
                                  color: "success",
                                  height: "6",
                                  rounded: "",
                                  class: "mb-1"
                                }, null, _parent5, _scopeId4));
                                _push5(`<div class="text-caption text-medium-emphasis" data-v-a6648732${_scopeId4}>`);
                                if (mpesaTimeoutLeft.value > 0) {
                                  _push5(`<!--[-->${ssrInterpolate(mpesaTimeoutLeft.value)}s remaining<!--]-->`);
                                } else {
                                  _push5(`<!--[-->Timed out<!--]-->`);
                                }
                                _push5(`</div><!--]-->`);
                              } else if (mpesa.state === "success") {
                                _push5(`<!--[-->`);
                                _push5(ssrRenderComponent(VIcon, {
                                  color: "success",
                                  size: "72",
                                  class: "mb-3"
                                }, {
                                  default: withCtx((_5, _push6, _parent6, _scopeId5) => {
                                    if (_push6) {
                                      _push6(`mdi-check-circle`);
                                    } else {
                                      return [
                                        createTextVNode("mdi-check-circle")
                                      ];
                                    }
                                  }),
                                  _: 1
                                }, _parent5, _scopeId4));
                                _push5(`<div class="text-h6 font-weight-bold mb-1" data-v-a6648732${_scopeId4}>Payment successful</div><p class="text-body-2 text-medium-emphasis" data-v-a6648732${_scopeId4}>${ssrInterpolate(mpesa.message)}</p><!--]-->`);
                              } else if (mpesa.state === "failed") {
                                _push5(`<!--[-->`);
                                _push5(ssrRenderComponent(VIcon, {
                                  color: "error",
                                  size: "72",
                                  class: "mb-3"
                                }, {
                                  default: withCtx((_5, _push6, _parent6, _scopeId5) => {
                                    if (_push6) {
                                      _push6(`mdi-close-circle`);
                                    } else {
                                      return [
                                        createTextVNode("mdi-close-circle")
                                      ];
                                    }
                                  }),
                                  _: 1
                                }, _parent5, _scopeId4));
                                _push5(`<div class="text-h6 font-weight-bold mb-1" data-v-a6648732${_scopeId4}>Payment not completed</div><p class="text-body-2 text-medium-emphasis" data-v-a6648732${_scopeId4}>${ssrInterpolate(mpesa.message)}</p><!--]-->`);
                              } else {
                                _push5(`<!---->`);
                              }
                            } else {
                              return [
                                createVNode(VIcon, {
                                  color: "success",
                                  size: "48",
                                  class: "mb-4"
                                }, {
                                  default: withCtx(() => [
                                    createTextVNode("mdi-cellphone")
                                  ]),
                                  _: 1
                                }),
                                mpesa.state === "processing" ? (openBlock(), createBlock(Fragment, { key: 0 }, [
                                  createVNode(VProgressCircular, {
                                    indeterminate: "",
                                    color: "success",
                                    size: "64",
                                    width: "5",
                                    class: "mb-4"
                                  }),
                                  createVNode("div", { class: "text-h6 font-weight-bold mb-1" }, "Awaiting your confirmation"),
                                  createVNode("p", { class: "text-body-2 text-medium-emphasis mb-2" }, " Check your phone and enter your M-Pesa PIN to authorise the payment. "),
                                  createVNode(VChip, {
                                    color: "warning",
                                    variant: "tonal",
                                    size: "small",
                                    class: "mb-3"
                                  }, {
                                    default: withCtx(() => [
                                      createVNode(VIcon, {
                                        start: "",
                                        size: "16"
                                      }, {
                                        default: withCtx(() => [
                                          createTextVNode("mdi-alert")
                                        ]),
                                        _: 1
                                      }),
                                      createTextVNode(" Please do not close or leave this page ")
                                    ]),
                                    _: 1
                                  }),
                                  createVNode(VProgressLinear, {
                                    "model-value": mpesa.elapsed / mpesa.timeout * 100,
                                    color: "success",
                                    height: "6",
                                    rounded: "",
                                    class: "mb-1"
                                  }, null, 8, ["model-value"]),
                                  createVNode("div", { class: "text-caption text-medium-emphasis" }, [
                                    mpesaTimeoutLeft.value > 0 ? (openBlock(), createBlock(Fragment, { key: 0 }, [
                                      createTextVNode(toDisplayString(mpesaTimeoutLeft.value) + "s remaining", 1)
                                    ], 64)) : (openBlock(), createBlock(Fragment, { key: 1 }, [
                                      createTextVNode("Timed out")
                                    ], 64))
                                  ])
                                ], 64)) : mpesa.state === "success" ? (openBlock(), createBlock(Fragment, { key: 1 }, [
                                  createVNode(VIcon, {
                                    color: "success",
                                    size: "72",
                                    class: "mb-3"
                                  }, {
                                    default: withCtx(() => [
                                      createTextVNode("mdi-check-circle")
                                    ]),
                                    _: 1
                                  }),
                                  createVNode("div", { class: "text-h6 font-weight-bold mb-1" }, "Payment successful"),
                                  createVNode("p", { class: "text-body-2 text-medium-emphasis" }, toDisplayString(mpesa.message), 1)
                                ], 64)) : mpesa.state === "failed" ? (openBlock(), createBlock(Fragment, { key: 2 }, [
                                  createVNode(VIcon, {
                                    color: "error",
                                    size: "72",
                                    class: "mb-3"
                                  }, {
                                    default: withCtx(() => [
                                      createTextVNode("mdi-close-circle")
                                    ]),
                                    _: 1
                                  }),
                                  createVNode("div", { class: "text-h6 font-weight-bold mb-1" }, "Payment not completed"),
                                  createVNode("p", { class: "text-body-2 text-medium-emphasis" }, toDisplayString(mpesa.message), 1)
                                ], 64)) : createCommentVNode("", true)
                              ];
                            }
                          }),
                          _: 1
                        }, _parent4, _scopeId3));
                        if (mpesa.state !== "processing") {
                          _push4(ssrRenderComponent(VCardActions, null, {
                            default: withCtx((_4, _push5, _parent5, _scopeId4) => {
                              if (_push5) {
                                _push5(ssrRenderComponent(VSpacer, null, null, _parent5, _scopeId4));
                                _push5(ssrRenderComponent(VBtn, {
                                  color: "primary",
                                  variant: "flat",
                                  onClick: closeMpesa
                                }, {
                                  default: withCtx((_5, _push6, _parent6, _scopeId5) => {
                                    if (_push6) {
                                      _push6(`Done`);
                                    } else {
                                      return [
                                        createTextVNode("Done")
                                      ];
                                    }
                                  }),
                                  _: 1
                                }, _parent5, _scopeId4));
                                _push5(ssrRenderComponent(VSpacer, null, null, _parent5, _scopeId4));
                              } else {
                                return [
                                  createVNode(VSpacer),
                                  createVNode(VBtn, {
                                    color: "primary",
                                    variant: "flat",
                                    onClick: closeMpesa
                                  }, {
                                    default: withCtx(() => [
                                      createTextVNode("Done")
                                    ]),
                                    _: 1
                                  }),
                                  createVNode(VSpacer)
                                ];
                              }
                            }),
                            _: 1
                          }, _parent4, _scopeId3));
                        } else {
                          _push4(`<!---->`);
                        }
                      } else {
                        return [
                          createVNode(VCardText, { class: "pa-6" }, {
                            default: withCtx(() => [
                              createVNode(VIcon, {
                                color: "success",
                                size: "48",
                                class: "mb-4"
                              }, {
                                default: withCtx(() => [
                                  createTextVNode("mdi-cellphone")
                                ]),
                                _: 1
                              }),
                              mpesa.state === "processing" ? (openBlock(), createBlock(Fragment, { key: 0 }, [
                                createVNode(VProgressCircular, {
                                  indeterminate: "",
                                  color: "success",
                                  size: "64",
                                  width: "5",
                                  class: "mb-4"
                                }),
                                createVNode("div", { class: "text-h6 font-weight-bold mb-1" }, "Awaiting your confirmation"),
                                createVNode("p", { class: "text-body-2 text-medium-emphasis mb-2" }, " Check your phone and enter your M-Pesa PIN to authorise the payment. "),
                                createVNode(VChip, {
                                  color: "warning",
                                  variant: "tonal",
                                  size: "small",
                                  class: "mb-3"
                                }, {
                                  default: withCtx(() => [
                                    createVNode(VIcon, {
                                      start: "",
                                      size: "16"
                                    }, {
                                      default: withCtx(() => [
                                        createTextVNode("mdi-alert")
                                      ]),
                                      _: 1
                                    }),
                                    createTextVNode(" Please do not close or leave this page ")
                                  ]),
                                  _: 1
                                }),
                                createVNode(VProgressLinear, {
                                  "model-value": mpesa.elapsed / mpesa.timeout * 100,
                                  color: "success",
                                  height: "6",
                                  rounded: "",
                                  class: "mb-1"
                                }, null, 8, ["model-value"]),
                                createVNode("div", { class: "text-caption text-medium-emphasis" }, [
                                  mpesaTimeoutLeft.value > 0 ? (openBlock(), createBlock(Fragment, { key: 0 }, [
                                    createTextVNode(toDisplayString(mpesaTimeoutLeft.value) + "s remaining", 1)
                                  ], 64)) : (openBlock(), createBlock(Fragment, { key: 1 }, [
                                    createTextVNode("Timed out")
                                  ], 64))
                                ])
                              ], 64)) : mpesa.state === "success" ? (openBlock(), createBlock(Fragment, { key: 1 }, [
                                createVNode(VIcon, {
                                  color: "success",
                                  size: "72",
                                  class: "mb-3"
                                }, {
                                  default: withCtx(() => [
                                    createTextVNode("mdi-check-circle")
                                  ]),
                                  _: 1
                                }),
                                createVNode("div", { class: "text-h6 font-weight-bold mb-1" }, "Payment successful"),
                                createVNode("p", { class: "text-body-2 text-medium-emphasis" }, toDisplayString(mpesa.message), 1)
                              ], 64)) : mpesa.state === "failed" ? (openBlock(), createBlock(Fragment, { key: 2 }, [
                                createVNode(VIcon, {
                                  color: "error",
                                  size: "72",
                                  class: "mb-3"
                                }, {
                                  default: withCtx(() => [
                                    createTextVNode("mdi-close-circle")
                                  ]),
                                  _: 1
                                }),
                                createVNode("div", { class: "text-h6 font-weight-bold mb-1" }, "Payment not completed"),
                                createVNode("p", { class: "text-body-2 text-medium-emphasis" }, toDisplayString(mpesa.message), 1)
                              ], 64)) : createCommentVNode("", true)
                            ]),
                            _: 1
                          }),
                          mpesa.state !== "processing" ? (openBlock(), createBlock(VCardActions, { key: 0 }, {
                            default: withCtx(() => [
                              createVNode(VSpacer),
                              createVNode(VBtn, {
                                color: "primary",
                                variant: "flat",
                                onClick: closeMpesa
                              }, {
                                default: withCtx(() => [
                                  createTextVNode("Done")
                                ]),
                                _: 1
                              }),
                              createVNode(VSpacer)
                            ]),
                            _: 1
                          })) : createCommentVNode("", true)
                        ];
                      }
                    }),
                    _: 1
                  }, _parent3, _scopeId2));
                } else {
                  return [
                    createVNode(VCard, {
                      rounded: "lg",
                      class: "text-center pa-2"
                    }, {
                      default: withCtx(() => [
                        createVNode(VCardText, { class: "pa-6" }, {
                          default: withCtx(() => [
                            createVNode(VIcon, {
                              color: "success",
                              size: "48",
                              class: "mb-4"
                            }, {
                              default: withCtx(() => [
                                createTextVNode("mdi-cellphone")
                              ]),
                              _: 1
                            }),
                            mpesa.state === "processing" ? (openBlock(), createBlock(Fragment, { key: 0 }, [
                              createVNode(VProgressCircular, {
                                indeterminate: "",
                                color: "success",
                                size: "64",
                                width: "5",
                                class: "mb-4"
                              }),
                              createVNode("div", { class: "text-h6 font-weight-bold mb-1" }, "Awaiting your confirmation"),
                              createVNode("p", { class: "text-body-2 text-medium-emphasis mb-2" }, " Check your phone and enter your M-Pesa PIN to authorise the payment. "),
                              createVNode(VChip, {
                                color: "warning",
                                variant: "tonal",
                                size: "small",
                                class: "mb-3"
                              }, {
                                default: withCtx(() => [
                                  createVNode(VIcon, {
                                    start: "",
                                    size: "16"
                                  }, {
                                    default: withCtx(() => [
                                      createTextVNode("mdi-alert")
                                    ]),
                                    _: 1
                                  }),
                                  createTextVNode(" Please do not close or leave this page ")
                                ]),
                                _: 1
                              }),
                              createVNode(VProgressLinear, {
                                "model-value": mpesa.elapsed / mpesa.timeout * 100,
                                color: "success",
                                height: "6",
                                rounded: "",
                                class: "mb-1"
                              }, null, 8, ["model-value"]),
                              createVNode("div", { class: "text-caption text-medium-emphasis" }, [
                                mpesaTimeoutLeft.value > 0 ? (openBlock(), createBlock(Fragment, { key: 0 }, [
                                  createTextVNode(toDisplayString(mpesaTimeoutLeft.value) + "s remaining", 1)
                                ], 64)) : (openBlock(), createBlock(Fragment, { key: 1 }, [
                                  createTextVNode("Timed out")
                                ], 64))
                              ])
                            ], 64)) : mpesa.state === "success" ? (openBlock(), createBlock(Fragment, { key: 1 }, [
                              createVNode(VIcon, {
                                color: "success",
                                size: "72",
                                class: "mb-3"
                              }, {
                                default: withCtx(() => [
                                  createTextVNode("mdi-check-circle")
                                ]),
                                _: 1
                              }),
                              createVNode("div", { class: "text-h6 font-weight-bold mb-1" }, "Payment successful"),
                              createVNode("p", { class: "text-body-2 text-medium-emphasis" }, toDisplayString(mpesa.message), 1)
                            ], 64)) : mpesa.state === "failed" ? (openBlock(), createBlock(Fragment, { key: 2 }, [
                              createVNode(VIcon, {
                                color: "error",
                                size: "72",
                                class: "mb-3"
                              }, {
                                default: withCtx(() => [
                                  createTextVNode("mdi-close-circle")
                                ]),
                                _: 1
                              }),
                              createVNode("div", { class: "text-h6 font-weight-bold mb-1" }, "Payment not completed"),
                              createVNode("p", { class: "text-body-2 text-medium-emphasis" }, toDisplayString(mpesa.message), 1)
                            ], 64)) : createCommentVNode("", true)
                          ]),
                          _: 1
                        }),
                        mpesa.state !== "processing" ? (openBlock(), createBlock(VCardActions, { key: 0 }, {
                          default: withCtx(() => [
                            createVNode(VSpacer),
                            createVNode(VBtn, {
                              color: "primary",
                              variant: "flat",
                              onClick: closeMpesa
                            }, {
                              default: withCtx(() => [
                                createTextVNode("Done")
                              ]),
                              _: 1
                            }),
                            createVNode(VSpacer)
                          ]),
                          _: 1
                        })) : createCommentVNode("", true)
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
              createVNode("div", { class: "d-flex align-center mb-4" }, [
                createVNode(VIcon, {
                  class: "mr-2",
                  color: "primary"
                }, {
                  default: withCtx(() => [
                    createTextVNode("mdi-credit-card-outline")
                  ]),
                  _: 1
                }),
                createVNode("h1", { class: "text-h5 font-weight-bold" }, "API Billing — Payments"),
                createVNode(VSpacer),
                createVNode(VBtn, {
                  variant: "text",
                  "prepend-icon": "mdi-chart-box",
                  to: "/admin/billing/usage"
                }, {
                  default: withCtx(() => [
                    createTextVNode("Usage & Bills")
                  ]),
                  _: 1
                }),
                createVNode(VBtn, {
                  color: "primary",
                  variant: "flat",
                  "prepend-icon": "mdi-wallet-plus",
                  class: "ml-2",
                  onClick: openAddFunds
                }, {
                  default: withCtx(() => [
                    createTextVNode("Add funds")
                  ]),
                  _: 1
                }),
                createVNode(VBtn, {
                  variant: "tonal",
                  "prepend-icon": "mdi-refresh",
                  loading: loading.value,
                  class: "ml-2",
                  onClick: load
                }, {
                  default: withCtx(() => [
                    createTextVNode("Refresh")
                  ]),
                  _: 1
                }, 8, ["loading"])
              ]),
              error.value ? (openBlock(), createBlock(VAlert, {
                key: 0,
                type: "error",
                variant: "tonal",
                class: "mb-4"
              }, {
                default: withCtx(() => [
                  createTextVNode(toDisplayString(error.value), 1)
                ]),
                _: 1
              })) : createCommentVNode("", true),
              toast.value ? (openBlock(), createBlock(VAlert, {
                key: 1,
                type: "success",
                variant: "tonal",
                class: "mb-4",
                closable: "",
                "onClick:close": ($event) => toast.value = null
              }, {
                default: withCtx(() => [
                  createTextVNode(toDisplayString(toast.value), 1)
                ]),
                _: 1
              }, 8, ["onClick:close"])) : createCommentVNode("", true),
              data.value ? (openBlock(), createBlock("div", { key: 2 }, [
                createVNode(VRow, null, {
                  default: withCtx(() => [
                    createVNode(VCol, {
                      cols: "12",
                      md: "4",
                      sm: "6"
                    }, {
                      default: withCtx(() => [
                        createVNode(VCard, {
                          rounded: "lg",
                          class: "pa-4"
                        }, {
                          default: withCtx(() => [
                            createVNode("div", { class: "d-flex align-center justify-space-between" }, [
                              createVNode("div", { class: "text-caption text-medium-emphasis" }, "Outstanding"),
                              createVNode(VIcon, {
                                size: "20",
                                color: "warning"
                              }, {
                                default: withCtx(() => [
                                  createTextVNode("mdi-cash-clock")
                                ]),
                                _: 1
                              })
                            ]),
                            createVNode("div", { class: "text-h5 font-weight-bold mt-1" }, toDisplayString(unref(fmtCurrency)(summary.value.total_outstanding)), 1),
                            createVNode("div", { class: "text-caption text-medium-emphasis mt-1" }, toDisplayString(summary.value.outstanding_count) + " unpaid", 1)
                          ]),
                          _: 1
                        })
                      ]),
                      _: 1
                    }),
                    createVNode(VCol, {
                      cols: "12",
                      md: "4",
                      sm: "6"
                    }, {
                      default: withCtx(() => [
                        createVNode(VCard, {
                          rounded: "lg",
                          class: "pa-4",
                          color: Number(summary.value.total_overdue) > 0 ? "error" : void 0,
                          variant: Number(summary.value.total_overdue) > 0 ? "tonal" : void 0
                        }, {
                          default: withCtx(() => [
                            createVNode("div", { class: "d-flex align-center justify-space-between" }, [
                              createVNode("div", { class: "text-caption text-medium-emphasis" }, "Overdue"),
                              createVNode(VIcon, {
                                size: "20",
                                color: "error"
                              }, {
                                default: withCtx(() => [
                                  createTextVNode("mdi-alert-circle")
                                ]),
                                _: 1
                              })
                            ]),
                            createVNode("div", { class: "text-h5 font-weight-bold mt-1" }, toDisplayString(unref(fmtCurrency)(summary.value.total_overdue)), 1),
                            createVNode("div", { class: "text-caption text-medium-emphasis mt-1" }, toDisplayString(summary.value.overdue_count) + " overdue", 1)
                          ]),
                          _: 1
                        }, 8, ["color", "variant"])
                      ]),
                      _: 1
                    }),
                    createVNode(VCol, {
                      cols: "12",
                      md: "4",
                      sm: "6"
                    }, {
                      default: withCtx(() => [
                        createVNode(VCard, {
                          rounded: "lg",
                          class: "pa-4",
                          color: "success",
                          variant: "tonal"
                        }, {
                          default: withCtx(() => [
                            createVNode("div", { class: "d-flex align-center justify-space-between" }, [
                              createVNode("div", { class: "text-caption text-medium-emphasis" }, "Wallet balance"),
                              createVNode(VIcon, { size: "20" }, {
                                default: withCtx(() => [
                                  createTextVNode("mdi-wallet")
                                ]),
                                _: 1
                              })
                            ]),
                            createVNode("div", { class: "text-h5 font-weight-bold mt-1" }, toDisplayString(unref(fmtCurrency)(data.value.wallet_balance)), 1),
                            createVNode("div", { class: "text-caption text-medium-emphasis mt-1" }, "Pre-funded credit")
                          ]),
                          _: 1
                        })
                      ]),
                      _: 1
                    })
                  ]),
                  _: 1
                }),
                createVNode(VCard, {
                  rounded: "lg",
                  class: "mt-4"
                }, {
                  default: withCtx(() => [
                    createVNode(VTabs, {
                      modelValue: activeTab.value,
                      "onUpdate:modelValue": ($event) => activeTab.value = $event,
                      color: "primary",
                      "align-tabs": "start"
                    }, {
                      default: withCtx(() => [
                        createVNode(VTab, {
                          value: "outstanding",
                          "prepend-icon": "mdi-receipt-text-clock"
                        }, {
                          default: withCtx(() => [
                            createTextVNode(" Outstanding bills "),
                            data.value.outstanding_bills.length ? (openBlock(), createBlock(VBadge, {
                              key: 0,
                              content: data.value.outstanding_bills.length,
                              color: "warning",
                              inline: "",
                              class: "ml-2"
                            }, null, 8, ["content"])) : createCommentVNode("", true)
                          ]),
                          _: 1
                        }),
                        createVNode(VTab, {
                          value: "history",
                          "prepend-icon": "mdi-history"
                        }, {
                          default: withCtx(() => [
                            createTextVNode("Payment history")
                          ]),
                          _: 1
                        }),
                        createVNode(VTab, {
                          value: "mpesa",
                          "prepend-icon": "mdi-cellphone-nfc"
                        }, {
                          default: withCtx(() => [
                            createTextVNode("M-Pesa transactions")
                          ]),
                          _: 1
                        }),
                        createVNode(VTab, {
                          value: "wallet",
                          "prepend-icon": "mdi-wallet-outline"
                        }, {
                          default: withCtx(() => [
                            createTextVNode("Wallet activity")
                          ]),
                          _: 1
                        })
                      ]),
                      _: 1
                    }, 8, ["modelValue", "onUpdate:modelValue"]),
                    createVNode(VDivider),
                    createVNode(VTabsWindow, {
                      modelValue: activeTab.value,
                      "onUpdate:modelValue": ($event) => activeTab.value = $event
                    }, {
                      default: withCtx(() => [
                        createVNode(VTabsWindowItem, { value: "outstanding" }, {
                          default: withCtx(() => [
                            createVNode(VDataTable, {
                              headers: outHeaders,
                              items: data.value.outstanding_bills,
                              density: "comfortable",
                              "items-per-page": 10,
                              "hide-default-footer": ""
                            }, {
                              "item.period": withCtx(({ item }) => [
                                createTextVNode(toDisplayString(item.period_label || item.year + "-" + String(item.month).padStart(2, "0")), 1)
                              ]),
                              "item.amount": withCtx(({ item }) => [
                                createTextVNode(toDisplayString(unref(fmtCurrency)(item.amount)), 1)
                              ]),
                              "item.balance": withCtx(({ item }) => [
                                createVNode("span", { class: "font-weight-medium" }, toDisplayString(unref(fmtCurrency)(item.balance ?? item.amount)), 1)
                              ]),
                              "item.due_date": withCtx(({ item }) => [
                                createVNode("span", {
                                  class: { "text-error font-weight-medium": item.is_overdue }
                                }, toDisplayString(item.due_date ? unref(fmtDate)(item.due_date) : "—"), 3)
                              ]),
                              "item.status": withCtx(({ item }) => [
                                createVNode(VChip, {
                                  color: statusColor(item.effective_status || item.status),
                                  size: "small",
                                  variant: "tonal",
                                  label: ""
                                }, {
                                  default: withCtx(() => [
                                    createTextVNode(toDisplayString((item.effective_status || item.status).toUpperCase()), 1)
                                  ]),
                                  _: 2
                                }, 1032, ["color"])
                              ]),
                              "item.actions": withCtx(({ item }) => [
                                createVNode(VBtn, {
                                  size: "small",
                                  color: "primary",
                                  variant: "flat",
                                  "prepend-icon": "mdi-cash-fast",
                                  class: "mr-1",
                                  onClick: ($event) => openPay(item)
                                }, {
                                  default: withCtx(() => [
                                    createTextVNode(" Pay ")
                                  ]),
                                  _: 1
                                }, 8, ["onClick"])
                              ]),
                              "no-data": withCtx(() => [
                                createVNode("div", { class: "text-medium-emphasis py-6 text-center" }, "No outstanding bills. You're all caught up.")
                              ]),
                              _: 1
                            }, 8, ["items"])
                          ]),
                          _: 1
                        }),
                        createVNode(VTabsWindowItem, { value: "history" }, {
                          default: withCtx(() => [
                            createVNode(VDataTable, {
                              headers: paidHeaders,
                              items: data.value.paid_bills,
                              density: "comfortable",
                              "items-per-page": 10,
                              "hide-default-footer": ""
                            }, {
                              "item.period": withCtx(({ item }) => [
                                createTextVNode(toDisplayString(item.period_label || item.year + "-" + String(item.month).padStart(2, "0")), 1)
                              ]),
                              "item.amount": withCtx(({ item }) => [
                                createTextVNode(toDisplayString(unref(fmtCurrency)(item.amount)), 1)
                              ]),
                              "item.paid_at": withCtx(({ item }) => [
                                createTextVNode(toDisplayString(item.paid_at ? unref(fmtDateTime)(item.paid_at) : "—"), 1)
                              ]),
                              "item.status": withCtx(({ item }) => [
                                createVNode(VChip, {
                                  color: statusColor(item.status),
                                  size: "small",
                                  variant: "tonal",
                                  label: ""
                                }, {
                                  default: withCtx(() => [
                                    createTextVNode(toDisplayString(item.status.toUpperCase()), 1)
                                  ]),
                                  _: 2
                                }, 1032, ["color"])
                              ]),
                              "no-data": withCtx(() => [
                                createVNode("div", { class: "text-medium-emphasis py-6 text-center" }, "No payments yet.")
                              ]),
                              _: 1
                            }, 8, ["items"])
                          ]),
                          _: 1
                        }),
                        createVNode(VTabsWindowItem, { value: "mpesa" }, {
                          default: withCtx(() => [
                            createVNode("div", { class: "d-flex align-center px-4 pt-3 pb-1" }, [
                              createVNode(VIcon, {
                                class: "mr-2",
                                color: "success"
                              }, {
                                default: withCtx(() => [
                                  createTextVNode("mdi-cellphone")
                                ]),
                                _: 1
                              }),
                              createVNode("span", { class: "text-caption text-medium-emphasis" }, "All M-Pesa STK push requests")
                            ]),
                            createVNode(VDataTable, {
                              headers: mpesaHeaders,
                              items: data.value.mpesa_transactions,
                              density: "comfortable",
                              "items-per-page": 10,
                              "hide-default-footer": ""
                            }, {
                              "item.created_at": withCtx(({ item }) => [
                                createTextVNode(toDisplayString(unref(fmtDateTime)(item.created_at)), 1)
                              ]),
                              "item.purpose": withCtx(({ item }) => [
                                createTextVNode(toDisplayString(item.purpose_display), 1)
                              ]),
                              "item.amount": withCtx(({ item }) => [
                                createTextVNode(toDisplayString(unref(fmtCurrency)(item.amount)), 1)
                              ]),
                              "item.status": withCtx(({ item }) => [
                                createVNode(VChip, {
                                  color: mpesaStatusColor(item.status),
                                  size: "small",
                                  variant: "tonal",
                                  label: ""
                                }, {
                                  default: withCtx(() => [
                                    createTextVNode(toDisplayString(item.status.toUpperCase()), 1)
                                  ]),
                                  _: 2
                                }, 1032, ["color"])
                              ]),
                              "no-data": withCtx(() => [
                                createVNode("div", { class: "text-medium-emphasis py-6 text-center" }, "No M-Pesa payments yet.")
                              ]),
                              _: 1
                            }, 8, ["items"])
                          ]),
                          _: 1
                        }),
                        createVNode(VTabsWindowItem, { value: "wallet" }, {
                          default: withCtx(() => [
                            createVNode(VDataTable, {
                              headers: walletHeaders,
                              items: data.value.wallet_transactions,
                              density: "comfortable",
                              "items-per-page": 10,
                              "hide-default-footer": ""
                            }, {
                              "item.created_at": withCtx(({ item }) => [
                                createTextVNode(toDisplayString(unref(fmtDateTime)(item.created_at)), 1)
                              ]),
                              "item.amount": withCtx(({ item }) => [
                                createVNode("span", {
                                  class: item.type === "credit" ? "text-success" : "text-error"
                                }, toDisplayString(item.type === "credit" ? "+" : "-") + " " + toDisplayString(unref(fmtCurrency)(item.amount)), 3)
                              ]),
                              "item.balance_after": withCtx(({ item }) => [
                                createTextVNode(toDisplayString(unref(fmtCurrency)(item.balance_after)), 1)
                              ]),
                              "no-data": withCtx(() => [
                                createVNode("div", { class: "text-medium-emphasis py-6 text-center" }, "No wallet activity yet.")
                              ]),
                              _: 1
                            }, 8, ["items"])
                          ]),
                          _: 1
                        })
                      ]),
                      _: 1
                    }, 8, ["modelValue", "onUpdate:modelValue"])
                  ]),
                  _: 1
                })
              ])) : loading.value ? (openBlock(), createBlock(VProgressLinear, {
                key: 3,
                indeterminate: "",
                color: "primary"
              })) : createCommentVNode("", true),
              createVNode(VDialog, {
                modelValue: payDialog.value,
                "onUpdate:modelValue": ($event) => payDialog.value = $event,
                "max-width": "520",
                persistent: ""
              }, {
                default: withCtx(() => [
                  payTarget.value ? (openBlock(), createBlock(VCard, {
                    key: 0,
                    rounded: "lg"
                  }, {
                    default: withCtx(() => [
                      createVNode(VCardTitle, { class: "d-flex align-center" }, {
                        default: withCtx(() => [
                          createVNode(VIcon, {
                            class: "mr-2",
                            color: "primary"
                          }, {
                            default: withCtx(() => [
                              createTextVNode("mdi-cash-fast")
                            ]),
                            _: 1
                          }),
                          createTextVNode(" Pay bill — " + toDisplayString(payTarget.value.period_label), 1)
                        ]),
                        _: 1
                      }),
                      createVNode(VCardText, null, {
                        default: withCtx(() => [
                          createVNode("div", { class: "d-flex justify-space-between mb-1" }, [
                            createVNode("span", { class: "text-medium-emphasis" }, "Bill amount"),
                            createVNode("span", { class: "font-weight-bold" }, toDisplayString(unref(fmtCurrency)(payTarget.value.amount)), 1)
                          ]),
                          createVNode("div", { class: "d-flex justify-space-between mb-3" }, [
                            createVNode("span", { class: "text-medium-emphasis" }, "Balance due"),
                            createVNode("span", { class: "font-weight-bold text-warning" }, toDisplayString(unref(fmtCurrency)(billBalance.value)), 1)
                          ]),
                          createVNode("div", { class: "text-caption text-medium-emphasis mb-1" }, "Payment method"),
                          createVNode(VItemGroup, {
                            modelValue: payMethod.value,
                            "onUpdate:modelValue": ($event) => payMethod.value = $event,
                            mandatory: "",
                            class: "mb-4"
                          }, {
                            default: withCtx(() => [
                              createVNode(VRow, null, {
                                default: withCtx(() => [
                                  createVNode(VCol, { cols: "6" }, {
                                    default: withCtx(() => [
                                      createVNode(VItem, { value: "mpesa" }, {
                                        default: withCtx(({ isSelected, toggle }) => [
                                          createVNode(VCard, {
                                            rounded: "lg",
                                            variant: "outlined",
                                            class: ["pa-2 text-center method-card", { "method-card--active": isSelected }],
                                            onClick: toggle
                                          }, {
                                            default: withCtx(() => [
                                              createVNode(VIcon, {
                                                size: "26",
                                                color: "success"
                                              }, {
                                                default: withCtx(() => [
                                                  createTextVNode("mdi-cellphone")
                                                ]),
                                                _: 1
                                              }),
                                              createVNode("div", { class: "text-caption mt-1" }, "M-Pesa")
                                            ]),
                                            _: 1
                                          }, 8, ["class", "onClick"])
                                        ]),
                                        _: 1
                                      })
                                    ]),
                                    _: 1
                                  }),
                                  createVNode(VCol, { cols: "6" }, {
                                    default: withCtx(() => [
                                      createVNode(VItem, { value: "wallet" }, {
                                        default: withCtx(({ isSelected, toggle }) => [
                                          createVNode(VCard, {
                                            rounded: "lg",
                                            variant: "outlined",
                                            class: ["pa-2 text-center method-card", { "method-card--active": isSelected }],
                                            onClick: toggle
                                          }, {
                                            default: withCtx(() => [
                                              createVNode(VIcon, {
                                                size: "26",
                                                color: "success"
                                              }, {
                                                default: withCtx(() => [
                                                  createTextVNode("mdi-wallet")
                                                ]),
                                                _: 1
                                              }),
                                              createVNode("div", { class: "text-caption mt-1" }, "Wallet"),
                                              createVNode("div", { class: "text-caption text-medium-emphasis" }, toDisplayString(unref(fmtCurrency)(data.value.wallet_balance)), 1)
                                            ]),
                                            _: 1
                                          }, 8, ["class", "onClick"])
                                        ]),
                                        _: 1
                                      })
                                    ]),
                                    _: 1
                                  })
                                ]),
                                _: 1
                              })
                            ]),
                            _: 1
                          }, 8, ["modelValue", "onUpdate:modelValue"]),
                          createVNode(VTextField, {
                            modelValue: payAmount.value,
                            "onUpdate:modelValue": ($event) => payAmount.value = $event,
                            modelModifiers: { number: true },
                            type: "number",
                            label: "Amount to pay",
                            variant: "outlined",
                            density: "comfortable",
                            prefix: currencySymbol.value,
                            hint: `You can pay part of the balance (max ${unref(fmtCurrency)(billBalance.value)})`,
                            "persistent-hint": "",
                            class: "mb-2"
                          }, null, 8, ["modelValue", "onUpdate:modelValue", "prefix", "hint"]),
                          payMethod.value === "mpesa" ? (openBlock(), createBlock(VTextField, {
                            key: 0,
                            modelValue: payPhone.value,
                            "onUpdate:modelValue": ($event) => payPhone.value = $event,
                            label: "M-Pesa phone number",
                            variant: "outlined",
                            density: "comfortable",
                            placeholder: "07XXXXXXXX",
                            "prepend-inner-icon": "mdi-cellphone"
                          }, null, 8, ["modelValue", "onUpdate:modelValue"])) : createCommentVNode("", true),
                          payMethod.value === "wallet" && Number(data.value.wallet_balance) < Number(payAmount.value || 0) ? (openBlock(), createBlock(VAlert, {
                            key: 1,
                            type: "warning",
                            variant: "tonal",
                            density: "compact",
                            class: "mt-1"
                          }, {
                            default: withCtx(() => [
                              createTextVNode(" Insufficient wallet balance. Add funds or choose another method. ")
                            ]),
                            _: 1
                          })) : createCommentVNode("", true),
                          payError.value ? (openBlock(), createBlock(VAlert, {
                            key: 2,
                            type: "error",
                            variant: "tonal",
                            density: "compact",
                            class: "mt-3"
                          }, {
                            default: withCtx(() => [
                              createTextVNode(toDisplayString(payError.value), 1)
                            ]),
                            _: 1
                          })) : createCommentVNode("", true)
                        ]),
                        _: 1
                      }),
                      createVNode(VCardActions, null, {
                        default: withCtx(() => [
                          createVNode(VSpacer),
                          createVNode(VBtn, {
                            variant: "text",
                            onClick: ($event) => payDialog.value = false
                          }, {
                            default: withCtx(() => [
                              createTextVNode("Cancel")
                            ]),
                            _: 1
                          }, 8, ["onClick"]),
                          createVNode(VBtn, {
                            color: "primary",
                            loading: paying.value,
                            disabled: !canPay.value,
                            onClick: confirmPay
                          }, {
                            default: withCtx(() => [
                              createTextVNode(toDisplayString(payMethod.value === "mpesa" ? "Send M-Pesa request" : "Confirm payment"), 1)
                            ]),
                            _: 1
                          }, 8, ["loading", "disabled"])
                        ]),
                        _: 1
                      })
                    ]),
                    _: 1
                  })) : createCommentVNode("", true)
                ]),
                _: 1
              }, 8, ["modelValue", "onUpdate:modelValue"]),
              createVNode(VDialog, {
                modelValue: fundsDialog.value,
                "onUpdate:modelValue": ($event) => fundsDialog.value = $event,
                "max-width": "460",
                persistent: ""
              }, {
                default: withCtx(() => [
                  createVNode(VCard, { rounded: "lg" }, {
                    default: withCtx(() => [
                      createVNode(VCardTitle, { class: "d-flex align-center" }, {
                        default: withCtx(() => [
                          createVNode(VIcon, {
                            class: "mr-2",
                            color: "success"
                          }, {
                            default: withCtx(() => [
                              createTextVNode("mdi-wallet-plus")
                            ]),
                            _: 1
                          }),
                          createTextVNode(" Add funds to wallet ")
                        ]),
                        _: 1
                      }),
                      createVNode(VCardText, null, {
                        default: withCtx(() => [
                          createVNode("p", { class: "text-body-2 text-medium-emphasis mb-3" }, " Top up your DomendraPOS wallet via M-Pesa and use the balance to pay future bills. "),
                          createVNode("div", { class: "d-flex align-center mb-4" }, [
                            createVNode(VIcon, {
                              class: "mr-2",
                              color: "success"
                            }, {
                              default: withCtx(() => [
                                createTextVNode("mdi-cellphone")
                              ]),
                              _: 1
                            }),
                            createVNode("span", { class: "text-body-2" }, "Lipa na M-Pesa")
                          ]),
                          createVNode(VTextField, {
                            modelValue: fundsAmount.value,
                            "onUpdate:modelValue": ($event) => fundsAmount.value = $event,
                            modelModifiers: { number: true },
                            type: "number",
                            label: "Amount",
                            variant: "outlined",
                            density: "comfortable",
                            prefix: currencySymbol.value,
                            class: "mb-2"
                          }, null, 8, ["modelValue", "onUpdate:modelValue", "prefix"]),
                          createVNode(VTextField, {
                            modelValue: fundsPhone.value,
                            "onUpdate:modelValue": ($event) => fundsPhone.value = $event,
                            label: "M-Pesa phone number",
                            variant: "outlined",
                            density: "comfortable",
                            placeholder: "07XXXXXXXX",
                            "prepend-inner-icon": "mdi-cellphone"
                          }, null, 8, ["modelValue", "onUpdate:modelValue"]),
                          fundsError.value ? (openBlock(), createBlock(VAlert, {
                            key: 0,
                            type: "error",
                            variant: "tonal",
                            density: "compact",
                            class: "mt-2"
                          }, {
                            default: withCtx(() => [
                              createTextVNode(toDisplayString(fundsError.value), 1)
                            ]),
                            _: 1
                          })) : createCommentVNode("", true)
                        ]),
                        _: 1
                      }),
                      createVNode(VCardActions, null, {
                        default: withCtx(() => [
                          createVNode(VSpacer),
                          createVNode(VBtn, {
                            variant: "text",
                            onClick: ($event) => fundsDialog.value = false
                          }, {
                            default: withCtx(() => [
                              createTextVNode("Cancel")
                            ]),
                            _: 1
                          }, 8, ["onClick"]),
                          createVNode(VBtn, {
                            color: "success",
                            loading: paying.value,
                            disabled: !(fundsAmount.value > 0 && fundsPhone.value),
                            onClick: confirmAddFunds
                          }, {
                            default: withCtx(() => [
                              createTextVNode(" Send M-Pesa request ")
                            ]),
                            _: 1
                          }, 8, ["loading", "disabled"])
                        ]),
                        _: 1
                      })
                    ]),
                    _: 1
                  })
                ]),
                _: 1
              }, 8, ["modelValue", "onUpdate:modelValue"]),
              createVNode(VDialog, {
                modelValue: mpesa.dialog,
                "onUpdate:modelValue": ($event) => mpesa.dialog = $event,
                "max-width": "440",
                persistent: ""
              }, {
                default: withCtx(() => [
                  createVNode(VCard, {
                    rounded: "lg",
                    class: "text-center pa-2"
                  }, {
                    default: withCtx(() => [
                      createVNode(VCardText, { class: "pa-6" }, {
                        default: withCtx(() => [
                          createVNode(VIcon, {
                            color: "success",
                            size: "48",
                            class: "mb-4"
                          }, {
                            default: withCtx(() => [
                              createTextVNode("mdi-cellphone")
                            ]),
                            _: 1
                          }),
                          mpesa.state === "processing" ? (openBlock(), createBlock(Fragment, { key: 0 }, [
                            createVNode(VProgressCircular, {
                              indeterminate: "",
                              color: "success",
                              size: "64",
                              width: "5",
                              class: "mb-4"
                            }),
                            createVNode("div", { class: "text-h6 font-weight-bold mb-1" }, "Awaiting your confirmation"),
                            createVNode("p", { class: "text-body-2 text-medium-emphasis mb-2" }, " Check your phone and enter your M-Pesa PIN to authorise the payment. "),
                            createVNode(VChip, {
                              color: "warning",
                              variant: "tonal",
                              size: "small",
                              class: "mb-3"
                            }, {
                              default: withCtx(() => [
                                createVNode(VIcon, {
                                  start: "",
                                  size: "16"
                                }, {
                                  default: withCtx(() => [
                                    createTextVNode("mdi-alert")
                                  ]),
                                  _: 1
                                }),
                                createTextVNode(" Please do not close or leave this page ")
                              ]),
                              _: 1
                            }),
                            createVNode(VProgressLinear, {
                              "model-value": mpesa.elapsed / mpesa.timeout * 100,
                              color: "success",
                              height: "6",
                              rounded: "",
                              class: "mb-1"
                            }, null, 8, ["model-value"]),
                            createVNode("div", { class: "text-caption text-medium-emphasis" }, [
                              mpesaTimeoutLeft.value > 0 ? (openBlock(), createBlock(Fragment, { key: 0 }, [
                                createTextVNode(toDisplayString(mpesaTimeoutLeft.value) + "s remaining", 1)
                              ], 64)) : (openBlock(), createBlock(Fragment, { key: 1 }, [
                                createTextVNode("Timed out")
                              ], 64))
                            ])
                          ], 64)) : mpesa.state === "success" ? (openBlock(), createBlock(Fragment, { key: 1 }, [
                            createVNode(VIcon, {
                              color: "success",
                              size: "72",
                              class: "mb-3"
                            }, {
                              default: withCtx(() => [
                                createTextVNode("mdi-check-circle")
                              ]),
                              _: 1
                            }),
                            createVNode("div", { class: "text-h6 font-weight-bold mb-1" }, "Payment successful"),
                            createVNode("p", { class: "text-body-2 text-medium-emphasis" }, toDisplayString(mpesa.message), 1)
                          ], 64)) : mpesa.state === "failed" ? (openBlock(), createBlock(Fragment, { key: 2 }, [
                            createVNode(VIcon, {
                              color: "error",
                              size: "72",
                              class: "mb-3"
                            }, {
                              default: withCtx(() => [
                                createTextVNode("mdi-close-circle")
                              ]),
                              _: 1
                            }),
                            createVNode("div", { class: "text-h6 font-weight-bold mb-1" }, "Payment not completed"),
                            createVNode("p", { class: "text-body-2 text-medium-emphasis" }, toDisplayString(mpesa.message), 1)
                          ], 64)) : createCommentVNode("", true)
                        ]),
                        _: 1
                      }),
                      mpesa.state !== "processing" ? (openBlock(), createBlock(VCardActions, { key: 0 }, {
                        default: withCtx(() => [
                          createVNode(VSpacer),
                          createVNode(VBtn, {
                            color: "primary",
                            variant: "flat",
                            onClick: closeMpesa
                          }, {
                            default: withCtx(() => [
                              createTextVNode("Done")
                            ]),
                            _: 1
                          }),
                          createVNode(VSpacer)
                        ]),
                        _: 1
                      })) : createCommentVNode("", true)
                    ]),
                    _: 1
                  })
                ]),
                _: 1
              }, 8, ["modelValue", "onUpdate:modelValue"])
            ];
          }
        }),
        _: 1
      }, _parent));
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/admin/billing/payments.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const payments = /* @__PURE__ */ _export_sfc(_sfc_main, [["__scopeId", "data-v-a6648732"]]);

export { payments as default };
//# sourceMappingURL=payments-DpzFK8NL.mjs.map
