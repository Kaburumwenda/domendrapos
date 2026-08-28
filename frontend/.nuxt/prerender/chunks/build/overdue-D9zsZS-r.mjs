import { defineComponent, computed, ref, reactive, mergeProps, withCtx, unref, createVNode, toDisplayString, createTextVNode, openBlock, createBlock, createCommentVNode, Fragment, renderList, useSSRContext } from 'file://D:/Projects/MY-APPS-2/DomendraPOS/frontend/node_modules/vue/index.mjs';
import { ssrRenderAttrs, ssrRenderStyle, ssrRenderComponent, ssrInterpolate, ssrRenderList } from 'file://D:/Projects/MY-APPS-2/DomendraPOS/frontend/node_modules/vue/server-renderer/index.mjs';
import { u as useApi, a as useAuthStore } from './useApi-D4YG8JPQ.mjs';
import { u as useFormat } from './useFormat-BvVWDMYe.mjs';
import { s as setInterval } from './interval-D9ov41Wl.mjs';
import { _ as _export_sfc, g as VCard, a as VIcon, d as VAlert, e as VRow, f as VCol, r as VCardTitle, b as VSpacer, c as VBtn, k as VDivider, M as VList, N as VListItem, O as VListItemTitle, o as VChip, P as VListItemSubtitle, H as VAvatar, p as VProgressLinear, q as VDialog, s as VCardText, t as VItemGroup, u as VItem, v as VTextField, w as VCardActions, x as VProgressCircular, y as navigateTo } from './server.mjs';
import 'file://D:/Projects/MY-APPS-2/DomendraPOS/frontend/node_modules/pinia/dist/pinia.js';
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
import 'file://D:/Projects/MY-APPS-2/DomendraPOS/frontend/node_modules/vue-router/vue-router.node.mjs';
import 'file://D:/Projects/MY-APPS-2/DomendraPOS/frontend/node_modules/perfect-debounce/dist/index.mjs';
import 'file://D:/Projects/MY-APPS-2/DomendraPOS/frontend/node_modules/@vue/shared/dist/shared.cjs.prod.js';
import 'file://D:/Projects/MY-APPS-2/DomendraPOS/frontend/node_modules/vue3-apexcharts/dist/vue3-apexcharts.js';
import 'file://D:/Projects/MY-APPS-2/DomendraPOS/frontend/node_modules/nuxt/node_modules/cookie-es/dist/index.mjs';

const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "overdue",
  __ssrInlineRender: true,
  setup(__props) {
    const api = useApi();
    const auth = useAuthStore();
    const { currency: fmtCurrency, date: fmtDate } = useFormat();
    const currencySymbol = computed(() => auth.currencySymbol || "$");
    const data = ref(null);
    const loading = ref(false);
    const error = ref(null);
    const toast = ref(null);
    const checking = ref(false);
    const payDialog = ref(false);
    const payTarget = ref(null);
    const payMethod = ref("mpesa");
    const payAmount = ref(0);
    const payPhone = ref("");
    const paying = ref(false);
    const payError = ref(null);
    const couponDialog = ref(false);
    const couponTarget = ref(null);
    const couponCode = ref("");
    const couponBusy = ref(false);
    const couponError = ref(null);
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
    const summary = computed(() => {
      var _a;
      return ((_a = data.value) == null ? void 0 : _a.summary) || {};
    });
    const statusReason = computed(() => auth.billingReason);
    const overdueTotal = computed(() => auth.overdueTotal);
    const billBalance = computed(() => {
      var _a, _b, _c, _d;
      return Number((_d = (_c = (_a = payTarget.value) == null ? void 0 : _a.balance) != null ? _c : (_b = payTarget.value) == null ? void 0 : _b.amount) != null ? _d : 0);
    });
    const mpesaTimeoutLeft = computed(() => Math.max(0, mpesa.timeout - mpesa.elapsed));
    const canPay = computed(() => {
      var _a;
      if (!(payAmount.value > 0)) return false;
      if (payMethod.value === "wallet") return Number((_a = data.value) == null ? void 0 : _a.wallet_balance) >= Number(payAmount.value);
      if (payMethod.value === "mpesa") return !!payPhone.value;
      return false;
    });
    const billsToClear = computed(() => {
      var _a;
      const out = ((_a = data.value) == null ? void 0 : _a.outstanding_bills) || [];
      return [...out].sort((a, b) => b.is_overdue - a.is_overdue || a.year - b.year || a.month - b.month);
    });
    function openPay(bill) {
      var _a, _b, _c;
      payTarget.value = bill;
      payError.value = null;
      payMethod.value = "mpesa";
      payAmount.value = Number((_b = (_a = bill.balance) != null ? _a : bill.amount) != null ? _b : 0);
      payPhone.value = ((_c = data.value) == null ? void 0 : _c.phone) || "";
      payDialog.value = true;
    }
    function openCoupon(bill) {
      couponTarget.value = bill;
      couponCode.value = "";
      couponError.value = null;
      couponDialog.value = true;
    }
    async function applyCoupon() {
      var _a;
      couponBusy.value = true;
      couponError.value = null;
      try {
        const res = await api("/usage-billing/payments/coupon/apply/", {
          method: "POST",
          body: { bill_id: couponTarget.value.id, code: couponCode.value.trim() }
        });
        couponDialog.value = false;
        toast.value = (res == null ? void 0 : res.detail) || "Coupon applied.";
        await afterPayment();
      } catch (e) {
        couponError.value = ((_a = e == null ? void 0 : e.data) == null ? void 0 : _a.detail) || "Could not apply coupon.";
      } finally {
        couponBusy.value = false;
      }
    }
    async function confirmPay() {
      var _a;
      paying.value = true;
      payError.value = null;
      try {
        if (payMethod.value === "wallet") {
          const res = await api("/usage-billing/payments/wallet/pay-bill/", {
            method: "POST",
            body: { bill_id: payTarget.value.id, amount: payAmount.value }
          });
          payDialog.value = false;
          toast.value = (res == null ? void 0 : res.detail) || "Bill paid from wallet.";
          await afterPayment();
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
        payError.value = ((_a = e == null ? void 0 : e.data) == null ? void 0 : _a.detail) || e.message || "Payment failed.";
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
      var _a;
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
          await afterPayment();
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
          mpesa.message = "Payment timed out. If you were charged, it will reflect shortly \u2014 please refresh.";
          stopTimers();
          return;
        }
        schedulePoll(mpesa.interval * 1e3);
      } catch (e) {
        if (mpesa.elapsed >= mpesa.timeout) {
          mpesa.state = "failed";
          mpesa.message = ((_a = e == null ? void 0 : e.data) == null ? void 0 : _a.detail) || "Payment timed out.";
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
    async function afterPayment() {
      var _a;
      await reload();
      const me = await auth.refresh();
      if (me && !((_a = me.billing) == null ? void 0 : _a.locked)) {
        setTimeout(() => navigateTo("/dashboard"), 900);
      }
    }
    async function reload() {
      var _a;
      loading.value = true;
      try {
        const [pay, st] = await Promise.all([
          api("/usage-billing/payments/"),
          api("/usage-billing/billing-status/")
        ]);
        data.value = pay;
        auth.billing = st;
      } catch (e) {
        error.value = ((_a = e == null ? void 0 : e.data) == null ? void 0 : _a.detail) || e.message || "Failed to load data.";
      } finally {
        loading.value = false;
      }
    }
    async function recheck() {
      var _a;
      checking.value = true;
      try {
        const me = await auth.refresh();
        if (me && !((_a = me.billing) == null ? void 0 : _a.locked)) {
          await navigateTo("/dashboard");
        } else {
          await reload();
          toast.value = "Still restricted \u2014 please clear the remaining balance.";
        }
      } finally {
        checking.value = false;
      }
    }
    async function doLogout() {
      auth.logout();
    }
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "lock-bg lock-bg--overdue pa-4 pa-md-6" }, _attrs))} data-v-4b3b5688><div class="mx-auto" style="${ssrRenderStyle({ "max-width": "960px" })}" data-v-4b3b5688>`);
      _push(ssrRenderComponent(VCard, {
        rounded: "xl",
        color: "error",
        variant: "flat",
        class: "pa-5 mb-4"
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<div class="d-flex align-center flex-wrap ga-3" data-v-4b3b5688${_scopeId}>`);
            _push2(ssrRenderComponent(VIcon, {
              icon: "mdi-lock-alert",
              size: "44"
            }, null, _parent2, _scopeId));
            _push2(`<div class="flex-grow-1" style="${ssrRenderStyle({ "min-width": "220px" })}" data-v-4b3b5688${_scopeId}><div class="text-overline" style="${ssrRenderStyle({ "opacity": ".85" })}" data-v-4b3b5688${_scopeId}>Service restricted</div><h1 class="text-h5 font-weight-bold ma-0" data-v-4b3b5688${_scopeId}>Clear your bills to continue</h1><div class="text-body-2 mt-1" style="${ssrRenderStyle({ "opacity": ".9" })}" data-v-4b3b5688${_scopeId}>${ssrInterpolate(statusReason.value || "Your account has overdue API usage bills. Settle them to restore access for your team.")}</div></div><div class="text-right" data-v-4b3b5688${_scopeId}><div class="text-caption" style="${ssrRenderStyle({ "opacity": ".85" })}" data-v-4b3b5688${_scopeId}>Overdue balance</div><div class="text-h4 font-weight-bold" data-v-4b3b5688${_scopeId}>${ssrInterpolate(unref(fmtCurrency)(summary.value.total_overdue || overdueTotal.value))}</div></div></div>`);
          } else {
            return [
              createVNode("div", { class: "d-flex align-center flex-wrap ga-3" }, [
                createVNode(VIcon, {
                  icon: "mdi-lock-alert",
                  size: "44"
                }),
                createVNode("div", {
                  class: "flex-grow-1",
                  style: { "min-width": "220px" }
                }, [
                  createVNode("div", {
                    class: "text-overline",
                    style: { "opacity": ".85" }
                  }, "Service restricted"),
                  createVNode("h1", { class: "text-h5 font-weight-bold ma-0" }, "Clear your bills to continue"),
                  createVNode("div", {
                    class: "text-body-2 mt-1",
                    style: { "opacity": ".9" }
                  }, toDisplayString(statusReason.value || "Your account has overdue API usage bills. Settle them to restore access for your team."), 1)
                ]),
                createVNode("div", { class: "text-right" }, [
                  createVNode("div", {
                    class: "text-caption",
                    style: { "opacity": ".85" }
                  }, "Overdue balance"),
                  createVNode("div", { class: "text-h4 font-weight-bold" }, toDisplayString(unref(fmtCurrency)(summary.value.total_overdue || overdueTotal.value)), 1)
                ])
              ])
            ];
          }
        }),
        _: 1
      }, _parent));
      if (toast.value) {
        _push(ssrRenderComponent(VAlert, {
          type: "success",
          variant: "tonal",
          class: "mb-4",
          closable: "",
          "onClick:close": ($event) => toast.value = null
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`${ssrInterpolate(toast.value)}`);
            } else {
              return [
                createTextVNode(toDisplayString(toast.value), 1)
              ];
            }
          }),
          _: 1
        }, _parent));
      } else {
        _push(`<!---->`);
      }
      if (error.value) {
        _push(ssrRenderComponent(VAlert, {
          type: "error",
          variant: "tonal",
          class: "mb-4",
          closable: "",
          "onClick:close": ($event) => error.value = null
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`${ssrInterpolate(error.value)}`);
            } else {
              return [
                createTextVNode(toDisplayString(error.value), 1)
              ];
            }
          }),
          _: 1
        }, _parent));
      } else {
        _push(`<!---->`);
      }
      if (data.value) {
        _push(`<div data-v-4b3b5688>`);
        _push(ssrRenderComponent(VRow, { class: "mb-1" }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(ssrRenderComponent(VCol, {
                cols: "12",
                md: "4",
                sm: "6"
              }, {
                default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                  if (_push3) {
                    _push3(ssrRenderComponent(VCard, {
                      rounded: "lg",
                      class: "pa-4"
                    }, {
                      default: withCtx((_3, _push4, _parent4, _scopeId3) => {
                        if (_push4) {
                          _push4(`<div class="d-flex align-center justify-space-between" data-v-4b3b5688${_scopeId3}><div class="text-caption text-medium-emphasis" data-v-4b3b5688${_scopeId3}>Outstanding</div>`);
                          _push4(ssrRenderComponent(VIcon, {
                            size: "20",
                            color: "warning"
                          }, {
                            default: withCtx((_4, _push5, _parent5, _scopeId4) => {
                              if (_push5) {
                                _push5(`mdi-cash-clock`);
                              } else {
                                return [
                                  createTextVNode("mdi-cash-clock")
                                ];
                              }
                            }),
                            _: 1
                          }, _parent4, _scopeId3));
                          _push4(`</div><div class="text-h6 font-weight-bold mt-1" data-v-4b3b5688${_scopeId3}>${ssrInterpolate(unref(fmtCurrency)(summary.value.total_outstanding))}</div><div class="text-caption text-medium-emphasis mt-1" data-v-4b3b5688${_scopeId3}>${ssrInterpolate(summary.value.outstanding_count)} unpaid</div>`);
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
                            createVNode("div", { class: "text-h6 font-weight-bold mt-1" }, toDisplayString(unref(fmtCurrency)(summary.value.total_outstanding)), 1),
                            createVNode("div", { class: "text-caption text-medium-emphasis mt-1" }, toDisplayString(summary.value.outstanding_count) + " unpaid", 1)
                          ];
                        }
                      }),
                      _: 1
                    }, _parent3, _scopeId2));
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
                          createVNode("div", { class: "text-h6 font-weight-bold mt-1" }, toDisplayString(unref(fmtCurrency)(summary.value.total_outstanding)), 1),
                          createVNode("div", { class: "text-caption text-medium-emphasis mt-1" }, toDisplayString(summary.value.outstanding_count) + " unpaid", 1)
                        ]),
                        _: 1
                      })
                    ];
                  }
                }),
                _: 1
              }, _parent2, _scopeId));
              _push2(ssrRenderComponent(VCol, {
                cols: "12",
                md: "4",
                sm: "6"
              }, {
                default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                  if (_push3) {
                    _push3(ssrRenderComponent(VCard, {
                      rounded: "lg",
                      class: "pa-4",
                      color: Number(summary.value.total_overdue) > 0 ? "error" : void 0,
                      variant: Number(summary.value.total_overdue) > 0 ? "tonal" : void 0
                    }, {
                      default: withCtx((_3, _push4, _parent4, _scopeId3) => {
                        if (_push4) {
                          _push4(`<div class="d-flex align-center justify-space-between" data-v-4b3b5688${_scopeId3}><div class="text-caption text-medium-emphasis" data-v-4b3b5688${_scopeId3}>Overdue</div>`);
                          _push4(ssrRenderComponent(VIcon, {
                            size: "20",
                            color: "error"
                          }, {
                            default: withCtx((_4, _push5, _parent5, _scopeId4) => {
                              if (_push5) {
                                _push5(`mdi-alert-circle`);
                              } else {
                                return [
                                  createTextVNode("mdi-alert-circle")
                                ];
                              }
                            }),
                            _: 1
                          }, _parent4, _scopeId3));
                          _push4(`</div><div class="text-h6 font-weight-bold mt-1" data-v-4b3b5688${_scopeId3}>${ssrInterpolate(unref(fmtCurrency)(summary.value.total_overdue))}</div><div class="text-caption text-medium-emphasis mt-1" data-v-4b3b5688${_scopeId3}>${ssrInterpolate(summary.value.overdue_count)} overdue</div>`);
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
                            createVNode("div", { class: "text-h6 font-weight-bold mt-1" }, toDisplayString(unref(fmtCurrency)(summary.value.total_overdue)), 1),
                            createVNode("div", { class: "text-caption text-medium-emphasis mt-1" }, toDisplayString(summary.value.overdue_count) + " overdue", 1)
                          ];
                        }
                      }),
                      _: 1
                    }, _parent3, _scopeId2));
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
                          createVNode("div", { class: "text-h6 font-weight-bold mt-1" }, toDisplayString(unref(fmtCurrency)(summary.value.total_overdue)), 1),
                          createVNode("div", { class: "text-caption text-medium-emphasis mt-1" }, toDisplayString(summary.value.overdue_count) + " overdue", 1)
                        ]),
                        _: 1
                      }, 8, ["color", "variant"])
                    ];
                  }
                }),
                _: 1
              }, _parent2, _scopeId));
              _push2(ssrRenderComponent(VCol, {
                cols: "12",
                md: "4",
                sm: "6"
              }, {
                default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                  if (_push3) {
                    _push3(ssrRenderComponent(VCard, {
                      rounded: "lg",
                      class: "pa-4",
                      color: "success",
                      variant: "tonal"
                    }, {
                      default: withCtx((_3, _push4, _parent4, _scopeId3) => {
                        if (_push4) {
                          _push4(`<div class="d-flex align-center justify-space-between" data-v-4b3b5688${_scopeId3}><div class="text-caption text-medium-emphasis" data-v-4b3b5688${_scopeId3}>Wallet balance</div>`);
                          _push4(ssrRenderComponent(VIcon, { size: "20" }, {
                            default: withCtx((_4, _push5, _parent5, _scopeId4) => {
                              if (_push5) {
                                _push5(`mdi-wallet`);
                              } else {
                                return [
                                  createTextVNode("mdi-wallet")
                                ];
                              }
                            }),
                            _: 1
                          }, _parent4, _scopeId3));
                          _push4(`</div><div class="text-h6 font-weight-bold mt-1" data-v-4b3b5688${_scopeId3}>${ssrInterpolate(unref(fmtCurrency)(data.value.wallet_balance))}</div><div class="text-caption text-medium-emphasis mt-1" data-v-4b3b5688${_scopeId3}>Pre-funded credit</div>`);
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
                            createVNode("div", { class: "text-h6 font-weight-bold mt-1" }, toDisplayString(unref(fmtCurrency)(data.value.wallet_balance)), 1),
                            createVNode("div", { class: "text-caption text-medium-emphasis mt-1" }, "Pre-funded credit")
                          ];
                        }
                      }),
                      _: 1
                    }, _parent3, _scopeId2));
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
                          createVNode("div", { class: "text-h6 font-weight-bold mt-1" }, toDisplayString(unref(fmtCurrency)(data.value.wallet_balance)), 1),
                          createVNode("div", { class: "text-caption text-medium-emphasis mt-1" }, "Pre-funded credit")
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
                        createVNode("div", { class: "text-h6 font-weight-bold mt-1" }, toDisplayString(unref(fmtCurrency)(summary.value.total_outstanding)), 1),
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
                        createVNode("div", { class: "text-h6 font-weight-bold mt-1" }, toDisplayString(unref(fmtCurrency)(summary.value.total_overdue)), 1),
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
                        createVNode("div", { class: "text-h6 font-weight-bold mt-1" }, toDisplayString(unref(fmtCurrency)(data.value.wallet_balance)), 1),
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
        }, _parent));
        _push(ssrRenderComponent(VCard, {
          rounded: "xl",
          class: "mb-4"
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(ssrRenderComponent(VCardTitle, { class: "d-flex align-center" }, {
                default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                  if (_push3) {
                    _push3(ssrRenderComponent(VIcon, {
                      class: "mr-2",
                      color: "error"
                    }, {
                      default: withCtx((_3, _push4, _parent4, _scopeId3) => {
                        if (_push4) {
                          _push4(`mdi-receipt-text-alert`);
                        } else {
                          return [
                            createTextVNode("mdi-receipt-text-alert")
                          ];
                        }
                      }),
                      _: 1
                    }, _parent3, _scopeId2));
                    _push3(` Bills to clear `);
                    _push3(ssrRenderComponent(VSpacer, null, null, _parent3, _scopeId2));
                    _push3(ssrRenderComponent(VBtn, {
                      size: "small",
                      variant: "tonal",
                      "prepend-icon": "mdi-refresh",
                      loading: loading.value,
                      onClick: reload
                    }, {
                      default: withCtx((_3, _push4, _parent4, _scopeId3) => {
                        if (_push4) {
                          _push4(`Refresh`);
                        } else {
                          return [
                            createTextVNode("Refresh")
                          ];
                        }
                      }),
                      _: 1
                    }, _parent3, _scopeId2));
                  } else {
                    return [
                      createVNode(VIcon, {
                        class: "mr-2",
                        color: "error"
                      }, {
                        default: withCtx(() => [
                          createTextVNode("mdi-receipt-text-alert")
                        ]),
                        _: 1
                      }),
                      createTextVNode(" Bills to clear "),
                      createVNode(VSpacer),
                      createVNode(VBtn, {
                        size: "small",
                        variant: "tonal",
                        "prepend-icon": "mdi-refresh",
                        loading: loading.value,
                        onClick: reload
                      }, {
                        default: withCtx(() => [
                          createTextVNode("Refresh")
                        ]),
                        _: 1
                      }, 8, ["loading"])
                    ];
                  }
                }),
                _: 1
              }, _parent2, _scopeId));
              _push2(ssrRenderComponent(VDivider, null, null, _parent2, _scopeId));
              if (billsToClear.value.length) {
                _push2(ssrRenderComponent(VList, { lines: "two" }, {
                  default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                    if (_push3) {
                      _push3(`<!--[-->`);
                      ssrRenderList(billsToClear.value, (b, i) => {
                        _push3(`<!--[-->`);
                        _push3(ssrRenderComponent(VListItem, null, {
                          prepend: withCtx((_3, _push4, _parent4, _scopeId3) => {
                            if (_push4) {
                              _push4(ssrRenderComponent(VAvatar, {
                                color: b.is_overdue ? "error" : "warning",
                                variant: "tonal"
                              }, {
                                default: withCtx((_4, _push5, _parent5, _scopeId4) => {
                                  if (_push5) {
                                    _push5(ssrRenderComponent(VIcon, {
                                      icon: b.is_overdue ? "mdi-alert" : "mdi-clock-outline"
                                    }, null, _parent5, _scopeId4));
                                  } else {
                                    return [
                                      createVNode(VIcon, {
                                        icon: b.is_overdue ? "mdi-alert" : "mdi-clock-outline"
                                      }, null, 8, ["icon"])
                                    ];
                                  }
                                }),
                                _: 2
                              }, _parent4, _scopeId3));
                            } else {
                              return [
                                createVNode(VAvatar, {
                                  color: b.is_overdue ? "error" : "warning",
                                  variant: "tonal"
                                }, {
                                  default: withCtx(() => [
                                    createVNode(VIcon, {
                                      icon: b.is_overdue ? "mdi-alert" : "mdi-clock-outline"
                                    }, null, 8, ["icon"])
                                  ]),
                                  _: 2
                                }, 1032, ["color"])
                              ];
                            }
                          }),
                          append: withCtx((_3, _push4, _parent4, _scopeId3) => {
                            if (_push4) {
                              _push4(`<div class="d-flex ga-1" data-v-4b3b5688${_scopeId3}>`);
                              _push4(ssrRenderComponent(VBtn, {
                                size: "small",
                                variant: "text",
                                "prepend-icon": "mdi-ticket-percent",
                                onClick: ($event) => openCoupon(b)
                              }, {
                                default: withCtx((_4, _push5, _parent5, _scopeId4) => {
                                  if (_push5) {
                                    _push5(`Coupon`);
                                  } else {
                                    return [
                                      createTextVNode("Coupon")
                                    ];
                                  }
                                }),
                                _: 2
                              }, _parent4, _scopeId3));
                              _push4(ssrRenderComponent(VBtn, {
                                size: "small",
                                color: "primary",
                                variant: "flat",
                                "prepend-icon": "mdi-cash-fast",
                                onClick: ($event) => openPay(b)
                              }, {
                                default: withCtx((_4, _push5, _parent5, _scopeId4) => {
                                  if (_push5) {
                                    _push5(`Pay`);
                                  } else {
                                    return [
                                      createTextVNode("Pay")
                                    ];
                                  }
                                }),
                                _: 2
                              }, _parent4, _scopeId3));
                              _push4(`</div>`);
                            } else {
                              return [
                                createVNode("div", { class: "d-flex ga-1" }, [
                                  createVNode(VBtn, {
                                    size: "small",
                                    variant: "text",
                                    "prepend-icon": "mdi-ticket-percent",
                                    onClick: ($event) => openCoupon(b)
                                  }, {
                                    default: withCtx(() => [
                                      createTextVNode("Coupon")
                                    ]),
                                    _: 1
                                  }, 8, ["onClick"]),
                                  createVNode(VBtn, {
                                    size: "small",
                                    color: "primary",
                                    variant: "flat",
                                    "prepend-icon": "mdi-cash-fast",
                                    onClick: ($event) => openPay(b)
                                  }, {
                                    default: withCtx(() => [
                                      createTextVNode("Pay")
                                    ]),
                                    _: 1
                                  }, 8, ["onClick"])
                                ])
                              ];
                            }
                          }),
                          default: withCtx((_3, _push4, _parent4, _scopeId3) => {
                            if (_push4) {
                              _push4(ssrRenderComponent(VListItemTitle, { class: "font-weight-medium" }, {
                                default: withCtx((_4, _push5, _parent5, _scopeId4) => {
                                  if (_push5) {
                                    _push5(`${ssrInterpolate(b.period_label || b.year + "-" + String(b.month).padStart(2, "0"))} `);
                                    _push5(ssrRenderComponent(VChip, {
                                      size: "x-small",
                                      variant: "tonal",
                                      class: "ml-1",
                                      color: b.is_overdue ? "error" : "warning",
                                      label: ""
                                    }, {
                                      default: withCtx((_5, _push6, _parent6, _scopeId5) => {
                                        if (_push6) {
                                          _push6(`${ssrInterpolate((b.effective_status || b.status).toUpperCase())}`);
                                        } else {
                                          return [
                                            createTextVNode(toDisplayString((b.effective_status || b.status).toUpperCase()), 1)
                                          ];
                                        }
                                      }),
                                      _: 2
                                    }, _parent5, _scopeId4));
                                  } else {
                                    return [
                                      createTextVNode(toDisplayString(b.period_label || b.year + "-" + String(b.month).padStart(2, "0")) + " ", 1),
                                      createVNode(VChip, {
                                        size: "x-small",
                                        variant: "tonal",
                                        class: "ml-1",
                                        color: b.is_overdue ? "error" : "warning",
                                        label: ""
                                      }, {
                                        default: withCtx(() => [
                                          createTextVNode(toDisplayString((b.effective_status || b.status).toUpperCase()), 1)
                                        ]),
                                        _: 2
                                      }, 1032, ["color"])
                                    ];
                                  }
                                }),
                                _: 2
                              }, _parent4, _scopeId3));
                              _push4(ssrRenderComponent(VListItemSubtitle, null, {
                                default: withCtx((_4, _push5, _parent5, _scopeId4) => {
                                  var _a, _b;
                                  if (_push5) {
                                    _push5(` Balance <strong data-v-4b3b5688${_scopeId4}>${ssrInterpolate(unref(fmtCurrency)((_a = b.balance) != null ? _a : b.amount))}</strong>`);
                                    if (b.due_date) {
                                      _push5(`<span data-v-4b3b5688${_scopeId4}> \xB7 due ${ssrInterpolate(unref(fmtDate)(b.due_date))}</span>`);
                                    } else {
                                      _push5(`<!---->`);
                                    }
                                    if (Number(b.discount_amount) > 0) {
                                      _push5(`<span data-v-4b3b5688${_scopeId4}> \xB7 ${ssrInterpolate(unref(fmtCurrency)(b.discount_amount))} discount applied</span>`);
                                    } else {
                                      _push5(`<!---->`);
                                    }
                                  } else {
                                    return [
                                      createTextVNode(" Balance "),
                                      createVNode("strong", null, toDisplayString(unref(fmtCurrency)((_b = b.balance) != null ? _b : b.amount)), 1),
                                      b.due_date ? (openBlock(), createBlock("span", { key: 0 }, " \xB7 due " + toDisplayString(unref(fmtDate)(b.due_date)), 1)) : createCommentVNode("", true),
                                      Number(b.discount_amount) > 0 ? (openBlock(), createBlock("span", { key: 1 }, " \xB7 " + toDisplayString(unref(fmtCurrency)(b.discount_amount)) + " discount applied", 1)) : createCommentVNode("", true)
                                    ];
                                  }
                                }),
                                _: 2
                              }, _parent4, _scopeId3));
                            } else {
                              return [
                                createVNode(VListItemTitle, { class: "font-weight-medium" }, {
                                  default: withCtx(() => [
                                    createTextVNode(toDisplayString(b.period_label || b.year + "-" + String(b.month).padStart(2, "0")) + " ", 1),
                                    createVNode(VChip, {
                                      size: "x-small",
                                      variant: "tonal",
                                      class: "ml-1",
                                      color: b.is_overdue ? "error" : "warning",
                                      label: ""
                                    }, {
                                      default: withCtx(() => [
                                        createTextVNode(toDisplayString((b.effective_status || b.status).toUpperCase()), 1)
                                      ]),
                                      _: 2
                                    }, 1032, ["color"])
                                  ]),
                                  _: 2
                                }, 1024),
                                createVNode(VListItemSubtitle, null, {
                                  default: withCtx(() => {
                                    var _a;
                                    return [
                                      createTextVNode(" Balance "),
                                      createVNode("strong", null, toDisplayString(unref(fmtCurrency)((_a = b.balance) != null ? _a : b.amount)), 1),
                                      b.due_date ? (openBlock(), createBlock("span", { key: 0 }, " \xB7 due " + toDisplayString(unref(fmtDate)(b.due_date)), 1)) : createCommentVNode("", true),
                                      Number(b.discount_amount) > 0 ? (openBlock(), createBlock("span", { key: 1 }, " \xB7 " + toDisplayString(unref(fmtCurrency)(b.discount_amount)) + " discount applied", 1)) : createCommentVNode("", true)
                                    ];
                                  }),
                                  _: 2
                                }, 1024)
                              ];
                            }
                          }),
                          _: 2
                        }, _parent3, _scopeId2));
                        if (i < billsToClear.value.length - 1) {
                          _push3(ssrRenderComponent(VDivider, null, null, _parent3, _scopeId2));
                        } else {
                          _push3(`<!---->`);
                        }
                        _push3(`<!--]-->`);
                      });
                      _push3(`<!--]-->`);
                    } else {
                      return [
                        (openBlock(true), createBlock(Fragment, null, renderList(billsToClear.value, (b, i) => {
                          return openBlock(), createBlock(Fragment, {
                            key: b.id
                          }, [
                            createVNode(VListItem, null, {
                              prepend: withCtx(() => [
                                createVNode(VAvatar, {
                                  color: b.is_overdue ? "error" : "warning",
                                  variant: "tonal"
                                }, {
                                  default: withCtx(() => [
                                    createVNode(VIcon, {
                                      icon: b.is_overdue ? "mdi-alert" : "mdi-clock-outline"
                                    }, null, 8, ["icon"])
                                  ]),
                                  _: 2
                                }, 1032, ["color"])
                              ]),
                              append: withCtx(() => [
                                createVNode("div", { class: "d-flex ga-1" }, [
                                  createVNode(VBtn, {
                                    size: "small",
                                    variant: "text",
                                    "prepend-icon": "mdi-ticket-percent",
                                    onClick: ($event) => openCoupon(b)
                                  }, {
                                    default: withCtx(() => [
                                      createTextVNode("Coupon")
                                    ]),
                                    _: 1
                                  }, 8, ["onClick"]),
                                  createVNode(VBtn, {
                                    size: "small",
                                    color: "primary",
                                    variant: "flat",
                                    "prepend-icon": "mdi-cash-fast",
                                    onClick: ($event) => openPay(b)
                                  }, {
                                    default: withCtx(() => [
                                      createTextVNode("Pay")
                                    ]),
                                    _: 1
                                  }, 8, ["onClick"])
                                ])
                              ]),
                              default: withCtx(() => [
                                createVNode(VListItemTitle, { class: "font-weight-medium" }, {
                                  default: withCtx(() => [
                                    createTextVNode(toDisplayString(b.period_label || b.year + "-" + String(b.month).padStart(2, "0")) + " ", 1),
                                    createVNode(VChip, {
                                      size: "x-small",
                                      variant: "tonal",
                                      class: "ml-1",
                                      color: b.is_overdue ? "error" : "warning",
                                      label: ""
                                    }, {
                                      default: withCtx(() => [
                                        createTextVNode(toDisplayString((b.effective_status || b.status).toUpperCase()), 1)
                                      ]),
                                      _: 2
                                    }, 1032, ["color"])
                                  ]),
                                  _: 2
                                }, 1024),
                                createVNode(VListItemSubtitle, null, {
                                  default: withCtx(() => {
                                    var _a;
                                    return [
                                      createTextVNode(" Balance "),
                                      createVNode("strong", null, toDisplayString(unref(fmtCurrency)((_a = b.balance) != null ? _a : b.amount)), 1),
                                      b.due_date ? (openBlock(), createBlock("span", { key: 0 }, " \xB7 due " + toDisplayString(unref(fmtDate)(b.due_date)), 1)) : createCommentVNode("", true),
                                      Number(b.discount_amount) > 0 ? (openBlock(), createBlock("span", { key: 1 }, " \xB7 " + toDisplayString(unref(fmtCurrency)(b.discount_amount)) + " discount applied", 1)) : createCommentVNode("", true)
                                    ];
                                  }),
                                  _: 2
                                }, 1024)
                              ]),
                              _: 2
                            }, 1024),
                            i < billsToClear.value.length - 1 ? (openBlock(), createBlock(VDivider, { key: 0 })) : createCommentVNode("", true)
                          ], 64);
                        }), 128))
                      ];
                    }
                  }),
                  _: 1
                }, _parent2, _scopeId));
              } else {
                _push2(`<div class="text-center py-8" data-v-4b3b5688${_scopeId}>`);
                _push2(ssrRenderComponent(VIcon, {
                  size: "48",
                  color: "success",
                  class: "mb-3"
                }, {
                  default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                    if (_push3) {
                      _push3(`mdi-check-circle`);
                    } else {
                      return [
                        createTextVNode("mdi-check-circle")
                      ];
                    }
                  }),
                  _: 1
                }, _parent2, _scopeId));
                _push2(`<div class="text-h6 font-weight-bold mb-2" data-v-4b3b5688${_scopeId}>All bills settled!</div>`);
                _push2(ssrRenderComponent(VBtn, {
                  color: "primary",
                  variant: "flat",
                  "prepend-icon": "mdi-arrow-right",
                  onClick: recheck
                }, {
                  default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                    if (_push3) {
                      _push3(` Continue to app `);
                    } else {
                      return [
                        createTextVNode(" Continue to app ")
                      ];
                    }
                  }),
                  _: 1
                }, _parent2, _scopeId));
                _push2(`</div>`);
              }
            } else {
              return [
                createVNode(VCardTitle, { class: "d-flex align-center" }, {
                  default: withCtx(() => [
                    createVNode(VIcon, {
                      class: "mr-2",
                      color: "error"
                    }, {
                      default: withCtx(() => [
                        createTextVNode("mdi-receipt-text-alert")
                      ]),
                      _: 1
                    }),
                    createTextVNode(" Bills to clear "),
                    createVNode(VSpacer),
                    createVNode(VBtn, {
                      size: "small",
                      variant: "tonal",
                      "prepend-icon": "mdi-refresh",
                      loading: loading.value,
                      onClick: reload
                    }, {
                      default: withCtx(() => [
                        createTextVNode("Refresh")
                      ]),
                      _: 1
                    }, 8, ["loading"])
                  ]),
                  _: 1
                }),
                createVNode(VDivider),
                billsToClear.value.length ? (openBlock(), createBlock(VList, {
                  key: 0,
                  lines: "two"
                }, {
                  default: withCtx(() => [
                    (openBlock(true), createBlock(Fragment, null, renderList(billsToClear.value, (b, i) => {
                      return openBlock(), createBlock(Fragment, {
                        key: b.id
                      }, [
                        createVNode(VListItem, null, {
                          prepend: withCtx(() => [
                            createVNode(VAvatar, {
                              color: b.is_overdue ? "error" : "warning",
                              variant: "tonal"
                            }, {
                              default: withCtx(() => [
                                createVNode(VIcon, {
                                  icon: b.is_overdue ? "mdi-alert" : "mdi-clock-outline"
                                }, null, 8, ["icon"])
                              ]),
                              _: 2
                            }, 1032, ["color"])
                          ]),
                          append: withCtx(() => [
                            createVNode("div", { class: "d-flex ga-1" }, [
                              createVNode(VBtn, {
                                size: "small",
                                variant: "text",
                                "prepend-icon": "mdi-ticket-percent",
                                onClick: ($event) => openCoupon(b)
                              }, {
                                default: withCtx(() => [
                                  createTextVNode("Coupon")
                                ]),
                                _: 1
                              }, 8, ["onClick"]),
                              createVNode(VBtn, {
                                size: "small",
                                color: "primary",
                                variant: "flat",
                                "prepend-icon": "mdi-cash-fast",
                                onClick: ($event) => openPay(b)
                              }, {
                                default: withCtx(() => [
                                  createTextVNode("Pay")
                                ]),
                                _: 1
                              }, 8, ["onClick"])
                            ])
                          ]),
                          default: withCtx(() => [
                            createVNode(VListItemTitle, { class: "font-weight-medium" }, {
                              default: withCtx(() => [
                                createTextVNode(toDisplayString(b.period_label || b.year + "-" + String(b.month).padStart(2, "0")) + " ", 1),
                                createVNode(VChip, {
                                  size: "x-small",
                                  variant: "tonal",
                                  class: "ml-1",
                                  color: b.is_overdue ? "error" : "warning",
                                  label: ""
                                }, {
                                  default: withCtx(() => [
                                    createTextVNode(toDisplayString((b.effective_status || b.status).toUpperCase()), 1)
                                  ]),
                                  _: 2
                                }, 1032, ["color"])
                              ]),
                              _: 2
                            }, 1024),
                            createVNode(VListItemSubtitle, null, {
                              default: withCtx(() => {
                                var _a;
                                return [
                                  createTextVNode(" Balance "),
                                  createVNode("strong", null, toDisplayString(unref(fmtCurrency)((_a = b.balance) != null ? _a : b.amount)), 1),
                                  b.due_date ? (openBlock(), createBlock("span", { key: 0 }, " \xB7 due " + toDisplayString(unref(fmtDate)(b.due_date)), 1)) : createCommentVNode("", true),
                                  Number(b.discount_amount) > 0 ? (openBlock(), createBlock("span", { key: 1 }, " \xB7 " + toDisplayString(unref(fmtCurrency)(b.discount_amount)) + " discount applied", 1)) : createCommentVNode("", true)
                                ];
                              }),
                              _: 2
                            }, 1024)
                          ]),
                          _: 2
                        }, 1024),
                        i < billsToClear.value.length - 1 ? (openBlock(), createBlock(VDivider, { key: 0 })) : createCommentVNode("", true)
                      ], 64);
                    }), 128))
                  ]),
                  _: 1
                })) : (openBlock(), createBlock("div", {
                  key: 1,
                  class: "text-center py-8"
                }, [
                  createVNode(VIcon, {
                    size: "48",
                    color: "success",
                    class: "mb-3"
                  }, {
                    default: withCtx(() => [
                      createTextVNode("mdi-check-circle")
                    ]),
                    _: 1
                  }),
                  createVNode("div", { class: "text-h6 font-weight-bold mb-2" }, "All bills settled!"),
                  createVNode(VBtn, {
                    color: "primary",
                    variant: "flat",
                    "prepend-icon": "mdi-arrow-right",
                    onClick: recheck
                  }, {
                    default: withCtx(() => [
                      createTextVNode(" Continue to app ")
                    ]),
                    _: 1
                  })
                ]))
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(`<div class="d-flex justify-space-between flex-wrap ga-2" data-v-4b3b5688>`);
        _push(ssrRenderComponent(VBtn, {
          variant: "text",
          "prepend-icon": "mdi-refresh",
          loading: checking.value,
          onClick: recheck
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(` Re-check access `);
            } else {
              return [
                createTextVNode(" Re-check access ")
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(ssrRenderComponent(VBtn, {
          variant: "text",
          "prepend-icon": "mdi-logout",
          onClick: doLogout
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`Sign out`);
            } else {
              return [
                createTextVNode("Sign out")
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(`</div></div>`);
      } else if (loading.value) {
        _push(ssrRenderComponent(VProgressLinear, {
          indeterminate: "",
          color: "primary"
        }, null, _parent));
      } else {
        _push(`<!---->`);
      }
      _push(`</div>`);
      _push(ssrRenderComponent(VDialog, {
        modelValue: payDialog.value,
        "onUpdate:modelValue": ($event) => payDialog.value = $event,
        "max-width": "520",
        persistent: ""
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            if (payTarget.value) {
              _push2(ssrRenderComponent(VCard, { rounded: "lg" }, {
                default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                  if (_push3) {
                    _push3(ssrRenderComponent(VCardTitle, { class: "d-flex align-center" }, {
                      default: withCtx((_3, _push4, _parent4, _scopeId3) => {
                        if (_push4) {
                          _push4(ssrRenderComponent(VIcon, {
                            class: "mr-2",
                            color: "primary"
                          }, {
                            default: withCtx((_4, _push5, _parent5, _scopeId4) => {
                              if (_push5) {
                                _push5(`mdi-cash-fast`);
                              } else {
                                return [
                                  createTextVNode("mdi-cash-fast")
                                ];
                              }
                            }),
                            _: 1
                          }, _parent4, _scopeId3));
                          _push4(` Pay bill \u2014 ${ssrInterpolate(payTarget.value.period_label)}`);
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
                            createTextVNode(" Pay bill \u2014 " + toDisplayString(payTarget.value.period_label), 1)
                          ];
                        }
                      }),
                      _: 1
                    }, _parent3, _scopeId2));
                    _push3(ssrRenderComponent(VCardText, null, {
                      default: withCtx((_3, _push4, _parent4, _scopeId3) => {
                        var _a, _b;
                        if (_push4) {
                          _push4(`<div class="d-flex justify-space-between mb-1" data-v-4b3b5688${_scopeId3}><span class="text-medium-emphasis" data-v-4b3b5688${_scopeId3}>Bill amount</span><span class="font-weight-bold" data-v-4b3b5688${_scopeId3}>${ssrInterpolate(unref(fmtCurrency)(payTarget.value.amount))}</span></div><div class="d-flex justify-space-between mb-3" data-v-4b3b5688${_scopeId3}><span class="text-medium-emphasis" data-v-4b3b5688${_scopeId3}>Balance due</span><span class="font-weight-bold text-warning" data-v-4b3b5688${_scopeId3}>${ssrInterpolate(unref(fmtCurrency)(billBalance.value))}</span></div><div class="text-caption text-medium-emphasis mb-1" data-v-4b3b5688${_scopeId3}>Payment method</div>`);
                          _push4(ssrRenderComponent(VItemGroup, {
                            modelValue: payMethod.value,
                            "onUpdate:modelValue": ($event) => payMethod.value = $event,
                            mandatory: "",
                            class: "mb-4"
                          }, {
                            default: withCtx((_4, _push5, _parent5, _scopeId4) => {
                              if (_push5) {
                                _push5(ssrRenderComponent(VRow, null, {
                                  default: withCtx((_5, _push6, _parent6, _scopeId5) => {
                                    if (_push6) {
                                      _push6(ssrRenderComponent(VCol, { cols: "6" }, {
                                        default: withCtx((_6, _push7, _parent7, _scopeId6) => {
                                          if (_push7) {
                                            _push7(ssrRenderComponent(VItem, { value: "mpesa" }, {
                                              default: withCtx(({ isSelected, toggle }, _push8, _parent8, _scopeId7) => {
                                                if (_push8) {
                                                  _push8(ssrRenderComponent(VCard, {
                                                    rounded: "lg",
                                                    variant: "outlined",
                                                    class: ["pa-2 text-center method-card", { "method-card--active": isSelected }],
                                                    onClick: toggle
                                                  }, {
                                                    default: withCtx((_7, _push9, _parent9, _scopeId8) => {
                                                      if (_push9) {
                                                        _push9(ssrRenderComponent(VIcon, {
                                                          size: "26",
                                                          color: "success"
                                                        }, {
                                                          default: withCtx((_8, _push10, _parent10, _scopeId9) => {
                                                            if (_push10) {
                                                              _push10(`mdi-cellphone`);
                                                            } else {
                                                              return [
                                                                createTextVNode("mdi-cellphone")
                                                              ];
                                                            }
                                                          }),
                                                          _: 2
                                                        }, _parent9, _scopeId8));
                                                        _push9(`<div class="text-caption mt-1" data-v-4b3b5688${_scopeId8}>M-Pesa</div>`);
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
                                                  }, _parent8, _scopeId7));
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
                                            }, _parent7, _scopeId6));
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
                                      }, _parent6, _scopeId5));
                                      _push6(ssrRenderComponent(VCol, { cols: "6" }, {
                                        default: withCtx((_6, _push7, _parent7, _scopeId6) => {
                                          if (_push7) {
                                            _push7(ssrRenderComponent(VItem, { value: "wallet" }, {
                                              default: withCtx(({ isSelected, toggle }, _push8, _parent8, _scopeId7) => {
                                                if (_push8) {
                                                  _push8(ssrRenderComponent(VCard, {
                                                    rounded: "lg",
                                                    variant: "outlined",
                                                    class: ["pa-2 text-center method-card", { "method-card--active": isSelected }],
                                                    onClick: toggle
                                                  }, {
                                                    default: withCtx((_7, _push9, _parent9, _scopeId8) => {
                                                      var _a2, _b2;
                                                      if (_push9) {
                                                        _push9(ssrRenderComponent(VIcon, {
                                                          size: "26",
                                                          color: "success"
                                                        }, {
                                                          default: withCtx((_8, _push10, _parent10, _scopeId9) => {
                                                            if (_push10) {
                                                              _push10(`mdi-wallet`);
                                                            } else {
                                                              return [
                                                                createTextVNode("mdi-wallet")
                                                              ];
                                                            }
                                                          }),
                                                          _: 2
                                                        }, _parent9, _scopeId8));
                                                        _push9(`<div class="text-caption mt-1" data-v-4b3b5688${_scopeId8}>Wallet</div><div class="text-caption text-medium-emphasis" data-v-4b3b5688${_scopeId8}>${ssrInterpolate(unref(fmtCurrency)((_a2 = data.value) == null ? void 0 : _a2.wallet_balance))}</div>`);
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
                                                          createVNode("div", { class: "text-caption text-medium-emphasis" }, toDisplayString(unref(fmtCurrency)((_b2 = data.value) == null ? void 0 : _b2.wallet_balance)), 1)
                                                        ];
                                                      }
                                                    }),
                                                    _: 2
                                                  }, _parent8, _scopeId7));
                                                } else {
                                                  return [
                                                    createVNode(VCard, {
                                                      rounded: "lg",
                                                      variant: "outlined",
                                                      class: ["pa-2 text-center method-card", { "method-card--active": isSelected }],
                                                      onClick: toggle
                                                    }, {
                                                      default: withCtx(() => {
                                                        var _a2;
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
                                                          createVNode("div", { class: "text-caption text-medium-emphasis" }, toDisplayString(unref(fmtCurrency)((_a2 = data.value) == null ? void 0 : _a2.wallet_balance)), 1)
                                                        ];
                                                      }),
                                                      _: 1
                                                    }, 8, ["class", "onClick"])
                                                  ];
                                                }
                                              }),
                                              _: 1
                                            }, _parent7, _scopeId6));
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
                                                    default: withCtx(() => {
                                                      var _a2;
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
                                                        createVNode("div", { class: "text-caption text-medium-emphasis" }, toDisplayString(unref(fmtCurrency)((_a2 = data.value) == null ? void 0 : _a2.wallet_balance)), 1)
                                                      ];
                                                    }),
                                                    _: 1
                                                  }, 8, ["class", "onClick"])
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
                                                  default: withCtx(() => {
                                                    var _a2;
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
                                                      createVNode("div", { class: "text-caption text-medium-emphasis" }, toDisplayString(unref(fmtCurrency)((_a2 = data.value) == null ? void 0 : _a2.wallet_balance)), 1)
                                                    ];
                                                  }),
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
                                }, _parent5, _scopeId4));
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
                                                default: withCtx(() => {
                                                  var _a2;
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
                                                    createVNode("div", { class: "text-caption text-medium-emphasis" }, toDisplayString(unref(fmtCurrency)((_a2 = data.value) == null ? void 0 : _a2.wallet_balance)), 1)
                                                  ];
                                                }),
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
                          }, _parent4, _scopeId3));
                          _push4(ssrRenderComponent(VTextField, {
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
                          }, null, _parent4, _scopeId3));
                          if (payMethod.value === "mpesa") {
                            _push4(ssrRenderComponent(VTextField, {
                              modelValue: payPhone.value,
                              "onUpdate:modelValue": ($event) => payPhone.value = $event,
                              label: "M-Pesa phone number",
                              variant: "outlined",
                              density: "comfortable",
                              placeholder: "07XXXXXXXX",
                              "prepend-inner-icon": "mdi-cellphone"
                            }, null, _parent4, _scopeId3));
                          } else {
                            _push4(`<!---->`);
                          }
                          if (payMethod.value === "wallet" && Number((_a = data.value) == null ? void 0 : _a.wallet_balance) < Number(payAmount.value || 0)) {
                            _push4(ssrRenderComponent(VAlert, {
                              type: "warning",
                              variant: "tonal",
                              density: "compact",
                              class: "mt-1"
                            }, {
                              default: withCtx((_4, _push5, _parent5, _scopeId4) => {
                                if (_push5) {
                                  _push5(` Insufficient wallet balance. Add funds or choose another method. `);
                                } else {
                                  return [
                                    createTextVNode(" Insufficient wallet balance. Add funds or choose another method. ")
                                  ];
                                }
                              }),
                              _: 1
                            }, _parent4, _scopeId3));
                          } else {
                            _push4(`<!---->`);
                          }
                          if (payError.value) {
                            _push4(ssrRenderComponent(VAlert, {
                              type: "error",
                              variant: "tonal",
                              density: "compact",
                              class: "mt-3"
                            }, {
                              default: withCtx((_4, _push5, _parent5, _scopeId4) => {
                                if (_push5) {
                                  _push5(`${ssrInterpolate(payError.value)}`);
                                } else {
                                  return [
                                    createTextVNode(toDisplayString(payError.value), 1)
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
                                              default: withCtx(() => {
                                                var _a2;
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
                                                  createVNode("div", { class: "text-caption text-medium-emphasis" }, toDisplayString(unref(fmtCurrency)((_a2 = data.value) == null ? void 0 : _a2.wallet_balance)), 1)
                                                ];
                                              }),
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
                            payMethod.value === "wallet" && Number((_b = data.value) == null ? void 0 : _b.wallet_balance) < Number(payAmount.value || 0) ? (openBlock(), createBlock(VAlert, {
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
                    }, _parent3, _scopeId2));
                    _push3(ssrRenderComponent(VCardActions, null, {
                      default: withCtx((_3, _push4, _parent4, _scopeId3) => {
                        if (_push4) {
                          _push4(ssrRenderComponent(VSpacer, null, null, _parent4, _scopeId3));
                          _push4(ssrRenderComponent(VBtn, {
                            variant: "text",
                            onClick: ($event) => payDialog.value = false
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
                            loading: paying.value,
                            disabled: !canPay.value,
                            onClick: confirmPay
                          }, {
                            default: withCtx((_4, _push5, _parent5, _scopeId4) => {
                              if (_push5) {
                                _push5(`${ssrInterpolate(payMethod.value === "mpesa" ? "Send M-Pesa request" : "Confirm payment")}`);
                              } else {
                                return [
                                  createTextVNode(toDisplayString(payMethod.value === "mpesa" ? "Send M-Pesa request" : "Confirm payment"), 1)
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
                    }, _parent3, _scopeId2));
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
                          createTextVNode(" Pay bill \u2014 " + toDisplayString(payTarget.value.period_label), 1)
                        ]),
                        _: 1
                      }),
                      createVNode(VCardText, null, {
                        default: withCtx(() => {
                          var _a;
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
                                              default: withCtx(() => {
                                                var _a2;
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
                                                  createVNode("div", { class: "text-caption text-medium-emphasis" }, toDisplayString(unref(fmtCurrency)((_a2 = data.value) == null ? void 0 : _a2.wallet_balance)), 1)
                                                ];
                                              }),
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
                            payMethod.value === "wallet" && Number((_a = data.value) == null ? void 0 : _a.wallet_balance) < Number(payAmount.value || 0) ? (openBlock(), createBlock(VAlert, {
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
                        }),
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
              }, _parent2, _scopeId));
            } else {
              _push2(`<!---->`);
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
                      createTextVNode(" Pay bill \u2014 " + toDisplayString(payTarget.value.period_label), 1)
                    ]),
                    _: 1
                  }),
                  createVNode(VCardText, null, {
                    default: withCtx(() => {
                      var _a;
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
                                          default: withCtx(() => {
                                            var _a2;
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
                                              createVNode("div", { class: "text-caption text-medium-emphasis" }, toDisplayString(unref(fmtCurrency)((_a2 = data.value) == null ? void 0 : _a2.wallet_balance)), 1)
                                            ];
                                          }),
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
                        payMethod.value === "wallet" && Number((_a = data.value) == null ? void 0 : _a.wallet_balance) < Number(payAmount.value || 0) ? (openBlock(), createBlock(VAlert, {
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
                    }),
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
      }, _parent));
      _push(ssrRenderComponent(VDialog, {
        modelValue: couponDialog.value,
        "onUpdate:modelValue": ($event) => couponDialog.value = $event,
        "max-width": "440"
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            if (couponTarget.value) {
              _push2(ssrRenderComponent(VCard, { rounded: "lg" }, {
                default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                  if (_push3) {
                    _push3(ssrRenderComponent(VCardTitle, { class: "d-flex align-center" }, {
                      default: withCtx((_3, _push4, _parent4, _scopeId3) => {
                        if (_push4) {
                          _push4(ssrRenderComponent(VIcon, {
                            class: "mr-2",
                            color: "success"
                          }, {
                            default: withCtx((_4, _push5, _parent5, _scopeId4) => {
                              if (_push5) {
                                _push5(`mdi-ticket-percent`);
                              } else {
                                return [
                                  createTextVNode("mdi-ticket-percent")
                                ];
                              }
                            }),
                            _: 1
                          }, _parent4, _scopeId3));
                          _push4(` Apply coupon \u2014 ${ssrInterpolate(couponTarget.value.period_label)}`);
                        } else {
                          return [
                            createVNode(VIcon, {
                              class: "mr-2",
                              color: "success"
                            }, {
                              default: withCtx(() => [
                                createTextVNode("mdi-ticket-percent")
                              ]),
                              _: 1
                            }),
                            createTextVNode(" Apply coupon \u2014 " + toDisplayString(couponTarget.value.period_label), 1)
                          ];
                        }
                      }),
                      _: 1
                    }, _parent3, _scopeId2));
                    _push3(ssrRenderComponent(VCardText, null, {
                      default: withCtx((_3, _push4, _parent4, _scopeId3) => {
                        var _a, _b;
                        if (_push4) {
                          _push4(`<div class="d-flex justify-space-between mb-3" data-v-4b3b5688${_scopeId3}><span class="text-medium-emphasis" data-v-4b3b5688${_scopeId3}>Balance due</span><span class="font-weight-bold text-warning" data-v-4b3b5688${_scopeId3}>${ssrInterpolate(unref(fmtCurrency)((_a = couponTarget.value.balance) != null ? _a : couponTarget.value.amount))}</span></div>`);
                          _push4(ssrRenderComponent(VTextField, {
                            modelValue: couponCode.value,
                            "onUpdate:modelValue": ($event) => couponCode.value = $event,
                            label: "Coupon code",
                            variant: "outlined",
                            density: "comfortable",
                            "prepend-inner-icon": "mdi-ticket-percent",
                            class: "mb-2"
                          }, null, _parent4, _scopeId3));
                          if (couponError.value) {
                            _push4(ssrRenderComponent(VAlert, {
                              type: "error",
                              variant: "tonal",
                              density: "compact",
                              class: "mt-2"
                            }, {
                              default: withCtx((_4, _push5, _parent5, _scopeId4) => {
                                if (_push5) {
                                  _push5(`${ssrInterpolate(couponError.value)}`);
                                } else {
                                  return [
                                    createTextVNode(toDisplayString(couponError.value), 1)
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
                            createVNode("div", { class: "d-flex justify-space-between mb-3" }, [
                              createVNode("span", { class: "text-medium-emphasis" }, "Balance due"),
                              createVNode("span", { class: "font-weight-bold text-warning" }, toDisplayString(unref(fmtCurrency)((_b = couponTarget.value.balance) != null ? _b : couponTarget.value.amount)), 1)
                            ]),
                            createVNode(VTextField, {
                              modelValue: couponCode.value,
                              "onUpdate:modelValue": ($event) => couponCode.value = $event,
                              label: "Coupon code",
                              variant: "outlined",
                              density: "comfortable",
                              "prepend-inner-icon": "mdi-ticket-percent",
                              class: "mb-2"
                            }, null, 8, ["modelValue", "onUpdate:modelValue"]),
                            couponError.value ? (openBlock(), createBlock(VAlert, {
                              key: 0,
                              type: "error",
                              variant: "tonal",
                              density: "compact",
                              class: "mt-2"
                            }, {
                              default: withCtx(() => [
                                createTextVNode(toDisplayString(couponError.value), 1)
                              ]),
                              _: 1
                            })) : createCommentVNode("", true)
                          ];
                        }
                      }),
                      _: 1
                    }, _parent3, _scopeId2));
                    _push3(ssrRenderComponent(VCardActions, null, {
                      default: withCtx((_3, _push4, _parent4, _scopeId3) => {
                        if (_push4) {
                          _push4(ssrRenderComponent(VSpacer, null, null, _parent4, _scopeId3));
                          _push4(ssrRenderComponent(VBtn, {
                            variant: "text",
                            onClick: ($event) => couponDialog.value = false
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
                            color: "success",
                            loading: couponBusy.value,
                            disabled: !couponCode.value.trim(),
                            onClick: applyCoupon
                          }, {
                            default: withCtx((_4, _push5, _parent5, _scopeId4) => {
                              if (_push5) {
                                _push5(`Apply`);
                              } else {
                                return [
                                  createTextVNode("Apply")
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
                              onClick: ($event) => couponDialog.value = false
                            }, {
                              default: withCtx(() => [
                                createTextVNode("Cancel")
                              ]),
                              _: 1
                            }, 8, ["onClick"]),
                            createVNode(VBtn, {
                              color: "success",
                              loading: couponBusy.value,
                              disabled: !couponCode.value.trim(),
                              onClick: applyCoupon
                            }, {
                              default: withCtx(() => [
                                createTextVNode("Apply")
                              ]),
                              _: 1
                            }, 8, ["loading", "disabled"])
                          ];
                        }
                      }),
                      _: 1
                    }, _parent3, _scopeId2));
                  } else {
                    return [
                      createVNode(VCardTitle, { class: "d-flex align-center" }, {
                        default: withCtx(() => [
                          createVNode(VIcon, {
                            class: "mr-2",
                            color: "success"
                          }, {
                            default: withCtx(() => [
                              createTextVNode("mdi-ticket-percent")
                            ]),
                            _: 1
                          }),
                          createTextVNode(" Apply coupon \u2014 " + toDisplayString(couponTarget.value.period_label), 1)
                        ]),
                        _: 1
                      }),
                      createVNode(VCardText, null, {
                        default: withCtx(() => {
                          var _a;
                          return [
                            createVNode("div", { class: "d-flex justify-space-between mb-3" }, [
                              createVNode("span", { class: "text-medium-emphasis" }, "Balance due"),
                              createVNode("span", { class: "font-weight-bold text-warning" }, toDisplayString(unref(fmtCurrency)((_a = couponTarget.value.balance) != null ? _a : couponTarget.value.amount)), 1)
                            ]),
                            createVNode(VTextField, {
                              modelValue: couponCode.value,
                              "onUpdate:modelValue": ($event) => couponCode.value = $event,
                              label: "Coupon code",
                              variant: "outlined",
                              density: "comfortable",
                              "prepend-inner-icon": "mdi-ticket-percent",
                              class: "mb-2"
                            }, null, 8, ["modelValue", "onUpdate:modelValue"]),
                            couponError.value ? (openBlock(), createBlock(VAlert, {
                              key: 0,
                              type: "error",
                              variant: "tonal",
                              density: "compact",
                              class: "mt-2"
                            }, {
                              default: withCtx(() => [
                                createTextVNode(toDisplayString(couponError.value), 1)
                              ]),
                              _: 1
                            })) : createCommentVNode("", true)
                          ];
                        }),
                        _: 1
                      }),
                      createVNode(VCardActions, null, {
                        default: withCtx(() => [
                          createVNode(VSpacer),
                          createVNode(VBtn, {
                            variant: "text",
                            onClick: ($event) => couponDialog.value = false
                          }, {
                            default: withCtx(() => [
                              createTextVNode("Cancel")
                            ]),
                            _: 1
                          }, 8, ["onClick"]),
                          createVNode(VBtn, {
                            color: "success",
                            loading: couponBusy.value,
                            disabled: !couponCode.value.trim(),
                            onClick: applyCoupon
                          }, {
                            default: withCtx(() => [
                              createTextVNode("Apply")
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
              }, _parent2, _scopeId));
            } else {
              _push2(`<!---->`);
            }
          } else {
            return [
              couponTarget.value ? (openBlock(), createBlock(VCard, {
                key: 0,
                rounded: "lg"
              }, {
                default: withCtx(() => [
                  createVNode(VCardTitle, { class: "d-flex align-center" }, {
                    default: withCtx(() => [
                      createVNode(VIcon, {
                        class: "mr-2",
                        color: "success"
                      }, {
                        default: withCtx(() => [
                          createTextVNode("mdi-ticket-percent")
                        ]),
                        _: 1
                      }),
                      createTextVNode(" Apply coupon \u2014 " + toDisplayString(couponTarget.value.period_label), 1)
                    ]),
                    _: 1
                  }),
                  createVNode(VCardText, null, {
                    default: withCtx(() => {
                      var _a;
                      return [
                        createVNode("div", { class: "d-flex justify-space-between mb-3" }, [
                          createVNode("span", { class: "text-medium-emphasis" }, "Balance due"),
                          createVNode("span", { class: "font-weight-bold text-warning" }, toDisplayString(unref(fmtCurrency)((_a = couponTarget.value.balance) != null ? _a : couponTarget.value.amount)), 1)
                        ]),
                        createVNode(VTextField, {
                          modelValue: couponCode.value,
                          "onUpdate:modelValue": ($event) => couponCode.value = $event,
                          label: "Coupon code",
                          variant: "outlined",
                          density: "comfortable",
                          "prepend-inner-icon": "mdi-ticket-percent",
                          class: "mb-2"
                        }, null, 8, ["modelValue", "onUpdate:modelValue"]),
                        couponError.value ? (openBlock(), createBlock(VAlert, {
                          key: 0,
                          type: "error",
                          variant: "tonal",
                          density: "compact",
                          class: "mt-2"
                        }, {
                          default: withCtx(() => [
                            createTextVNode(toDisplayString(couponError.value), 1)
                          ]),
                          _: 1
                        })) : createCommentVNode("", true)
                      ];
                    }),
                    _: 1
                  }),
                  createVNode(VCardActions, null, {
                    default: withCtx(() => [
                      createVNode(VSpacer),
                      createVNode(VBtn, {
                        variant: "text",
                        onClick: ($event) => couponDialog.value = false
                      }, {
                        default: withCtx(() => [
                          createTextVNode("Cancel")
                        ]),
                        _: 1
                      }, 8, ["onClick"]),
                      createVNode(VBtn, {
                        color: "success",
                        loading: couponBusy.value,
                        disabled: !couponCode.value.trim(),
                        onClick: applyCoupon
                      }, {
                        default: withCtx(() => [
                          createTextVNode("Apply")
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
      }, _parent));
      _push(ssrRenderComponent(VDialog, {
        modelValue: mpesa.dialog,
        "onUpdate:modelValue": ($event) => mpesa.dialog = $event,
        "max-width": "440",
        persistent: ""
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(ssrRenderComponent(VCard, {
              rounded: "lg",
              class: "text-center pa-2"
            }, {
              default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                if (_push3) {
                  _push3(ssrRenderComponent(VCardText, { class: "pa-6" }, {
                    default: withCtx((_3, _push4, _parent4, _scopeId3) => {
                      if (_push4) {
                        _push4(ssrRenderComponent(VIcon, {
                          color: "success",
                          size: "48",
                          class: "mb-4"
                        }, {
                          default: withCtx((_4, _push5, _parent5, _scopeId4) => {
                            if (_push5) {
                              _push5(`mdi-cellphone`);
                            } else {
                              return [
                                createTextVNode("mdi-cellphone")
                              ];
                            }
                          }),
                          _: 1
                        }, _parent4, _scopeId3));
                        if (mpesa.state === "processing") {
                          _push4(`<!--[-->`);
                          _push4(ssrRenderComponent(VProgressCircular, {
                            indeterminate: "",
                            color: "success",
                            size: "64",
                            width: "5",
                            class: "mb-4"
                          }, null, _parent4, _scopeId3));
                          _push4(`<div class="text-h6 font-weight-bold mb-1" data-v-4b3b5688${_scopeId3}>Awaiting your confirmation</div><p class="text-body-2 text-medium-emphasis mb-2" data-v-4b3b5688${_scopeId3}> Check your phone and enter your M-Pesa PIN to authorise the payment. </p>`);
                          _push4(ssrRenderComponent(VChip, {
                            color: "warning",
                            variant: "tonal",
                            size: "small",
                            class: "mb-3"
                          }, {
                            default: withCtx((_4, _push5, _parent5, _scopeId4) => {
                              if (_push5) {
                                _push5(ssrRenderComponent(VIcon, {
                                  start: "",
                                  size: "16"
                                }, {
                                  default: withCtx((_5, _push6, _parent6, _scopeId5) => {
                                    if (_push6) {
                                      _push6(`mdi-alert`);
                                    } else {
                                      return [
                                        createTextVNode("mdi-alert")
                                      ];
                                    }
                                  }),
                                  _: 1
                                }, _parent5, _scopeId4));
                                _push5(` Please do not close or leave this page `);
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
                          }, _parent4, _scopeId3));
                          _push4(ssrRenderComponent(VProgressLinear, {
                            "model-value": mpesa.elapsed / mpesa.timeout * 100,
                            color: "success",
                            height: "6",
                            rounded: "",
                            class: "mb-1"
                          }, null, _parent4, _scopeId3));
                          _push4(`<div class="text-caption text-medium-emphasis" data-v-4b3b5688${_scopeId3}>`);
                          if (mpesaTimeoutLeft.value > 0) {
                            _push4(`<!--[-->${ssrInterpolate(mpesaTimeoutLeft.value)}s remaining<!--]-->`);
                          } else {
                            _push4(`<!--[-->Timed out<!--]-->`);
                          }
                          _push4(`</div><!--]-->`);
                        } else if (mpesa.state === "success") {
                          _push4(`<!--[-->`);
                          _push4(ssrRenderComponent(VIcon, {
                            color: "success",
                            size: "72",
                            class: "mb-3"
                          }, {
                            default: withCtx((_4, _push5, _parent5, _scopeId4) => {
                              if (_push5) {
                                _push5(`mdi-check-circle`);
                              } else {
                                return [
                                  createTextVNode("mdi-check-circle")
                                ];
                              }
                            }),
                            _: 1
                          }, _parent4, _scopeId3));
                          _push4(`<div class="text-h6 font-weight-bold mb-1" data-v-4b3b5688${_scopeId3}>Payment successful</div><p class="text-body-2 text-medium-emphasis" data-v-4b3b5688${_scopeId3}>${ssrInterpolate(mpesa.message)}</p><!--]-->`);
                        } else if (mpesa.state === "failed") {
                          _push4(`<!--[-->`);
                          _push4(ssrRenderComponent(VIcon, {
                            color: "error",
                            size: "72",
                            class: "mb-3"
                          }, {
                            default: withCtx((_4, _push5, _parent5, _scopeId4) => {
                              if (_push5) {
                                _push5(`mdi-close-circle`);
                              } else {
                                return [
                                  createTextVNode("mdi-close-circle")
                                ];
                              }
                            }),
                            _: 1
                          }, _parent4, _scopeId3));
                          _push4(`<div class="text-h6 font-weight-bold mb-1" data-v-4b3b5688${_scopeId3}>Payment not completed</div><p class="text-body-2 text-medium-emphasis" data-v-4b3b5688${_scopeId3}>${ssrInterpolate(mpesa.message)}</p><!--]-->`);
                        } else {
                          _push4(`<!---->`);
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
                  }, _parent3, _scopeId2));
                  if (mpesa.state !== "processing") {
                    _push3(ssrRenderComponent(VCardActions, null, {
                      default: withCtx((_3, _push4, _parent4, _scopeId3) => {
                        if (_push4) {
                          _push4(ssrRenderComponent(VSpacer, null, null, _parent4, _scopeId3));
                          _push4(ssrRenderComponent(VBtn, {
                            color: "primary",
                            variant: "flat",
                            onClick: closeMpesa
                          }, {
                            default: withCtx((_4, _push5, _parent5, _scopeId4) => {
                              if (_push5) {
                                _push5(`Done`);
                              } else {
                                return [
                                  createTextVNode("Done")
                                ];
                              }
                            }),
                            _: 1
                          }, _parent4, _scopeId3));
                          _push4(ssrRenderComponent(VSpacer, null, null, _parent4, _scopeId3));
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
                    }, _parent3, _scopeId2));
                  } else {
                    _push3(`<!---->`);
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
            }, _parent2, _scopeId));
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
      }, _parent));
      _push(`</div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/billing/overdue.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const overdue = /* @__PURE__ */ _export_sfc(_sfc_main, [["__scopeId", "data-v-4b3b5688"]]);

export { overdue as default };
//# sourceMappingURL=overdue-D9zsZS-r.mjs.map
