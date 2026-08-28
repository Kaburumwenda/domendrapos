import { u as usePosStore, _ as __nuxt_component_0 } from "./pos-D7JNQgAI.js";
import { defineComponent, ref, computed, watch, mergeProps, withCtx, createTextVNode, unref, createVNode, toDisplayString, openBlock, createBlock, createCommentVNode, isRef, Fragment, renderList, useSSRContext } from "vue";
import { ssrRenderAttrs, ssrRenderComponent, ssrInterpolate, ssrRenderClass, ssrRenderAttr, ssrRenderList, ssrIncludeBooleanAttr } from "vue/server-renderer";
import { a as useAuthStore, u as useApi } from "./useApi-D4YG8JPQ.js";
import { u as useFormat } from "./useFormat-BvVWDMYe.js";
import { D as useToast, a as VIcon, c as VBtn, o as VChip, H as VAvatar, j as VBadge, q as VDialog, g as VCard, r as VCardTitle, b as VSpacer, k as VDivider, s as VCardText, v as VTextField, d as VAlert, w as VCardActions, $ as VTextarea, _ as _export_sfc } from "../server.mjs";
import { u as useEscPos } from "./useEscPos-CPWtz9qm.js";
import "pinia";
import "D:/Projects/MY-APPS-2/DomendraPOS/frontend/node_modules/ofetch/dist/node.mjs";
import "#internal/nuxt/paths";
import "D:/Projects/MY-APPS-2/DomendraPOS/frontend/node_modules/nuxt/node_modules/hookable/dist/index.mjs";
import "D:/Projects/MY-APPS-2/DomendraPOS/frontend/node_modules/unctx/dist/index.mjs";
import "D:/Projects/MY-APPS-2/DomendraPOS/frontend/node_modules/@nuxt/nitro-server/dist/runtime/h3-compat.mjs";
import "D:/Projects/MY-APPS-2/DomendraPOS/frontend/node_modules/ufo/dist/index.mjs";
import "D:/Projects/MY-APPS-2/DomendraPOS/frontend/node_modules/defu/dist/defu.mjs";
import "vue-router";
import "D:/Projects/MY-APPS-2/DomendraPOS/frontend/node_modules/perfect-debounce/dist/index.mjs";
import "D:/Projects/MY-APPS-2/DomendraPOS/frontend/node_modules/ohash/dist/index.mjs";
import "@vue/shared";
import "D:/Projects/MY-APPS-2/DomendraPOS/frontend/node_modules/klona/dist/index.mjs";
import "vue3-apexcharts";
import "D:/Projects/MY-APPS-2/DomendraPOS/frontend/node_modules/nuxt/node_modules/cookie-es/dist/index.mjs";
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "smartpos",
  __ssrInlineRender: true,
  setup(__props) {
    const pos = usePosStore();
    const auth = useAuthStore();
    const { currency, datetime } = useFormat();
    const toast = useToast();
    useFormat();
    const escpos = useEscPos();
    const printing = ref(false);
    const printerConnected = computed(() => escpos.connected.value);
    watch(() => pos.$state, () => pos.syncPersist(), { deep: true });
    const currencySymbol = computed(() => auth.currencySymbol);
    const cashierShort = computed(() => {
      const name = auth.fullName;
      return name ? name.split(" ")[0].toUpperCase() : "—";
    });
    const cashierInitials = computed(() => {
      const name = auth.fullName;
      if (!name) return "—";
      return name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();
    });
    const itemCountLabel = computed(() => {
      const n = pos.itemCount;
      return `${n} item${n === 1 ? "" : "s"}`;
    });
    const nowLabel = (/* @__PURE__ */ new Date()).toLocaleDateString("en-GB", { weekday: "short", day: "2-digit", month: "short", year: "numeric" }) + " · " + (/* @__PURE__ */ new Date()).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", hour12: true });
    function formatMoney(v) {
      return currency(Number(v || 0));
    }
    const orderRef = ref(String(Date.now()).slice(-5) + Math.floor(Math.random() * 90 + 10));
    ref(null);
    const scanInput = ref("");
    const scannerReady = ref(true);
    const showSuggestions = ref(false);
    const suggestions = ref([]);
    const products = ref([]);
    const branches = ref([]);
    async function loadBranches() {
      try {
        const data = await useApi()("/branches/");
        branches.value = data.results || data;
        if (branches.value.length > 0 && !pos.branchId) {
          const hq = branches.value.find((b) => b.is_headquarters) || branches.value[0];
          pos.setBranch(hq.id, hq.name);
        }
      } catch {
      }
    }
    async function loadProducts() {
      try {
        const params = new URLSearchParams({ page_size: "5000", is_active: "true", is_sellable: "true", ordering: "name" });
        const data = await useApi()(`/products/?${params}`);
        products.value = data.results || data;
      } catch {
      }
    }
    function stockOf(p) {
      return Number(p.quantity_on_hand ?? p.total_quantity ?? 0);
    }
    function pieceStockLabel(p) {
      const n = Number(p.items_per_unit || 1);
      return n > 1 ? ` (${Math.floor(stockOf(p) * n)} pcs)` : "";
    }
    function piecePrice(p) {
      const n = Number(p.items_per_unit || 1);
      const unitPrice = Number(p.retail_price || 0);
      return n > 1 ? unitPrice / n : unitPrice;
    }
    const paymentOptions = [
      { value: "cash", label: "Cash", icon: "mdi-cash", hint: "Notes & coins" },
      { value: "mpesa", label: "M-Pesa", icon: "mdi-cellphone", hint: "Mobile money" },
      { value: "card", label: "Card", icon: "mdi-credit-card", hint: "Visa / Mastercard" },
      { value: "insurance", label: "Insurance", icon: "mdi-shield-account", hint: "Approved schemes" },
      { value: "credit", label: "Credit", icon: "mdi-account-cash", hint: "Customer account" }
    ];
    const quickDiscounts = [0, 5, 10, 15, 20];
    const quickDisc = ref(0);
    function voidCart() {
      pos.clearCart();
      quickDisc.value = 0;
      orderRef.value = String(Date.now()).slice(-5) + Math.floor(Math.random() * 90 + 10);
      toast.info("Cart voided");
    }
    const checkoutDialog = ref(false);
    const checkingOut = ref(false);
    const tendered = ref(0);
    const mpesaPhone = ref("");
    const cardRef = ref("");
    const insuranceProvider = ref("");
    const insuranceMember = ref("");
    const creditDueDate = ref("");
    const creditPartial = ref(0);
    const quickCashOptions = computed(() => {
      const t = pos.total;
      return [Math.ceil(t), Math.ceil(t / 100) * 100, Math.ceil(t / 500) * 500, Math.ceil(t / 1e3) * 1e3];
    });
    const change = computed(() => (tendered.value || 0) - pos.total);
    const canCompleteCheckout = computed(() => {
      if (pos.paymentMethod === "cash") return tendered.value >= pos.total;
      if (pos.paymentMethod === "credit") return pos.customerName.length > 0;
      return true;
    });
    const lastTransaction = ref(null);
    async function completeCheckout() {
      if (!canCompleteCheckout.value) return;
      checkingOut.value = true;
      try {
        if (!pos.branchId) {
          await loadBranches();
          if (!pos.branchId) {
            toast.error("No branch available. Please contact support.");
            return;
          }
        }
        let paymentRef = "";
        if (pos.paymentMethod === "mpesa") paymentRef = `M-Pesa: ${mpesaPhone.value}`;
        else if (pos.paymentMethod === "card") paymentRef = `Card: ${cardRef.value}`;
        else if (pos.paymentMethod === "insurance") paymentRef = `Insurance: ${insuranceProvider.value} / ${insuranceMember.value}`;
        else if (pos.paymentMethod === "credit") paymentRef = `Due: ${creditDueDate.value} / Partial: ${creditPartial.value}`;
        const round2 = (v) => Math.round((Number(v) || 0) * 100) / 100;
        const round3 = (v) => Math.round((Number(v) || 0) * 1e3) / 1e3;
        const body = {
          branch: pos.branchId,
          customer_name: pos.customerName || "Walk-in",
          customer_phone: pos.customerPhone || "",
          subtotal: round2(pos.subtotal),
          discount: round2(pos.discountAmount),
          tax: round2(pos.taxAmount),
          total: round2(pos.total),
          payment_method: pos.paymentMethod,
          payment_reference: paymentRef,
          status: "completed",
          ...pos.paymentMethod === "credit" ? {
            due_date: creditDueDate.value || null,
            partial_payment: round2(creditPartial.value || 0)
          } : {},
          items: pos.cart.map((i) => ({
            product: i.id,
            product_name: i.name,
            // Convert piece qty to unit qty for stock deduction when items_per_unit > 1
            quantity: round3(i.items_per_unit > 1 ? i.qty / i.items_per_unit : i.qty),
            unit_price: round2(i.price),
            line_total: round2(Number(i.price) * Number(i.qty))
          }))
        };
        const res = await useApi()("/pos/transactions/", { method: "POST", body });
        lastTransaction.value = {
          transaction_number: res.transaction_number,
          created_at: res.created_at,
          items: [...pos.cart.map((i) => ({ name: i.name, qty: i.qty, price: i.price }))],
          subtotal: pos.subtotal,
          discount: pos.discountAmount,
          item_discounts: 0,
          tax: pos.taxAmount,
          total: pos.total,
          payment_method: pos.paymentMethod,
          tendered: pos.paymentMethod === "cash" ? tendered.value : null,
          change: pos.paymentMethod === "cash" ? Math.max(0, change.value) : null,
          customer_name: pos.customerName,
          customer_phone: pos.customerPhone
        };
        pos.clearCart();
        checkoutDialog.value = false;
        receiptDialog.value = true;
        quickDisc.value = 0;
        orderRef.value = String(Date.now()).slice(-5) + Math.floor(Math.random() * 90 + 10);
        await Promise.all([loadProducts(), loadTodayStats(), loadParkedCount(), loadShift()]);
      } catch (e) {
        const data = e?.data || e?.response?._data || {};
        const msg = data.detail || Object.values(data).flat().join(", ") || "Checkout failed";
        toast.error(typeof msg === "string" ? msg : "Checkout failed");
      } finally {
        checkingOut.value = false;
      }
    }
    const receiptDialog = ref(false);
    function newSale() {
      receiptDialog.value = false;
      lastTransaction.value = null;
      pos.clearCart();
      quickDisc.value = 0;
      orderRef.value = String(Date.now()).slice(-5) + Math.floor(Math.random() * 90 + 10);
    }
    async function connectPrinter() {
      const ok = await escpos.connectUsb();
      if (!ok && escpos.supportsWebBluetooth.value) {
        await escpos.connectBluetooth();
      }
      if (escpos.error.value) {
        toast.error(escpos.error.value);
      } else if (escpos.connected.value) {
        toast.success("Thermal printer connected");
      }
    }
    async function printReceipt() {
      if (!lastTransaction.value) return;
      printing.value = true;
      try {
        const tx = lastTransaction.value;
        const sym = auth.currencySymbol || "KSh";
        const dateStr = tx.created_at ? new Date(tx.created_at).toLocaleString("en-GB", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }) : (/* @__PURE__ */ new Date()).toLocaleString("en-GB", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
        const paymentLabels = {
          cash: "Cash",
          mpesa: "M-Pesa",
          card: "Card",
          insurance: "Insurance",
          credit: "Credit",
          bank_transfer: "Bank Transfer"
        };
        await escpos.smartPrint({
          businessName: auth.tenantName || "DomendraPOS",
          branchName: pos.branchName || void 0,
          transactionNumber: tx.transaction_number || "N/A",
          Date: dateStr,
          cashierName: auth.fullName,
          customerName: tx.customer_name || void 0,
          customerPhone: tx.customer_phone || void 0,
          items: tx.items,
          subtotal: tx.subtotal,
          discount: tx.discount,
          itemDiscounts: 0,
          tax: tx.tax,
          total: tx.total,
          paymentMethod: paymentLabels[tx.payment_method] || tx.payment_method || "N/A",
          tendered: tx.tendered,
          change: tx.change,
          paymentReference: void 0,
          currencySymbol: sym
        }, { paperWidth: 48, codepage: 0 });
        if (escpos.error.value) {
          toast.error(escpos.error.value);
        } else {
          toast.success("Receipt printed");
        }
      } catch (e) {
        toast.error(e?.message || "Failed to print receipt");
      } finally {
        printing.value = false;
      }
    }
    const holdDialog = ref(false);
    const holdCustomer = ref("");
    const holdPhone = ref("");
    const holdNotes = ref("");
    async function confirmHold() {
      try {
        await useApi()("/pos/parked-sales/", {
          method: "POST",
          body: {
            branch: pos.branchId,
            customer_name: holdCustomer.value || pos.customerName || "Walk-in",
            customer_phone: holdPhone.value || pos.customerPhone || "",
            notes: holdNotes.value,
            items_data: pos.cart,
            total: pos.total
          }
        });
        pos.clearCart();
        holdDialog.value = false;
        holdCustomer.value = "";
        holdPhone.value = "";
        holdNotes.value = "";
        quickDisc.value = 0;
        toast.success("Sale parked");
        await loadParkedCount();
      } catch {
        toast.error("Failed to park sale");
      }
    }
    const parkedCount = ref(0);
    async function loadParkedCount() {
      try {
        const data = await useApi()("/pos/parked-sales/?page_size=1");
        parkedCount.value = data.count || (data.results || data).length;
      } catch {
      }
    }
    const todayStats = ref({ count: 0, revenue: 0 });
    async function loadTodayStats() {
      try {
        const data = await useApi()("/pos/transactions/?page_size=200");
        const txs = data.results || data;
        const todayStr = (/* @__PURE__ */ new Date()).toDateString();
        const todayTxs = txs.filter((t) => new Date(t.created_at).toDateString() === todayStr && t.status !== "voided");
        todayStats.value = {
          count: todayTxs.length,
          revenue: todayTxs.reduce((s, t) => s + Number(t.total), 0)
        };
      } catch {
      }
    }
    const shift = ref(null);
    ref(0);
    async function loadShift() {
      try {
        const data = await useApi()("/pos/shifts/current/");
        shift.value = data;
      } catch {
        shift.value = null;
      }
    }
    return (_ctx, _push, _parent, _attrs) => {
      const _component_PosReceipt = __nuxt_component_0;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "smart-pos-shell" }, _attrs))} data-v-43b2f167><header class="smart-topbar" data-v-43b2f167><div class="smart-brand" data-v-43b2f167><div class="smart-brand__mark" data-v-43b2f167>`);
      _push(ssrRenderComponent(VIcon, {
        size: "22",
        color: "primary"
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`mdi-barcode-scan`);
          } else {
            return [
              createTextVNode("mdi-barcode-scan")
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`</div><div class="smart-brand__text" data-v-43b2f167><h1 class="smart-brand__title" data-v-43b2f167>Smart POS</h1><p class="smart-brand__meta" data-v-43b2f167>Lane 01 · ${ssrInterpolate(nowLabel)}</p></div></div><div class="smart-search-wrap" data-v-43b2f167><div class="${ssrRenderClass([{ "smart-search--ready": unref(scannerReady) }, "smart-search"])}" data-v-43b2f167>`);
      _push(ssrRenderComponent(VIcon, {
        size: "20",
        class: "smart-search__icon"
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
      _push(`<input${ssrRenderAttr("value", unref(scanInput))} class="smart-search__input" placeholder="Scan barcode or type SKU / name…" data-v-43b2f167>`);
      if (unref(scanInput)) {
        _push(ssrRenderComponent(VBtn, {
          size: "x-small",
          variant: "text",
          icon: "mdi-close",
          class: "smart-search__clear",
          onClick: ($event) => {
            scanInput.value = "";
            suggestions.value = [];
          }
        }, null, _parent));
      } else {
        _push(`<!---->`);
      }
      if (unref(scannerReady) && !unref(scanInput)) {
        _push(ssrRenderComponent(VChip, {
          size: "x-small",
          color: "success",
          variant: "flat",
          class: "smart-search__chip"
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(ssrRenderComponent(VIcon, {
                size: "12",
                start: ""
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
              _push2(` Ready `);
            } else {
              return [
                createVNode(VIcon, {
                  size: "12",
                  start: ""
                }, {
                  default: withCtx(() => [
                    createTextVNode("mdi-check-circle")
                  ]),
                  _: 1
                }),
                createTextVNode(" Ready ")
              ];
            }
          }),
          _: 1
        }, _parent));
      } else {
        _push(`<!---->`);
      }
      if (unref(showSuggestions) && unref(suggestions).length > 0) {
        _push(`<div class="scan-suggestions" data-v-43b2f167><!--[-->`);
        ssrRenderList(unref(suggestions), (p) => {
          _push(`<button type="button" class="scan-suggestion"${ssrIncludeBooleanAttr(stockOf(p) <= 0) ? " disabled" : ""} data-v-43b2f167><div class="scan-suggestion__thumb" data-v-43b2f167>`);
          if (p.image) {
            _push(`<img${ssrRenderAttr("src", p.image)} alt="" data-v-43b2f167>`);
          } else {
            _push(ssrRenderComponent(VIcon, {
              size: "16",
              color: stockOf(p) <= 0 ? "grey" : "primary"
            }, {
              default: withCtx((_, _push2, _parent2, _scopeId) => {
                if (_push2) {
                  _push2(`mdi-package-variant-closed`);
                } else {
                  return [
                    createTextVNode("mdi-package-variant-closed")
                  ];
                }
              }),
              _: 2
            }, _parent));
          }
          _push(`</div><div class="scan-suggestion__body" data-v-43b2f167><div class="scan-suggestion__name" data-v-43b2f167>${ssrInterpolate(p.name)}</div><div class="scan-suggestion__meta" data-v-43b2f167>${ssrInterpolate(p.sku || "—")} · Stock ${ssrInterpolate(stockOf(p))}${ssrInterpolate(pieceStockLabel(p))}</div></div>`);
          if (p.barcode) {
            _push(`<div class="scan-suggestion__barcode" data-v-43b2f167>${ssrInterpolate(p.barcode)}</div>`);
          } else {
            _push(`<!---->`);
          }
          _push(`<div class="scan-suggestion__price" data-v-43b2f167>${ssrInterpolate(formatMoney(piecePrice(p)))}`);
          if (Number(p.items_per_unit) > 1) {
            _push(`<!--[--> /pc<!--]-->`);
          } else {
            _push(`<!---->`);
          }
          _push(`</div></button>`);
        });
        _push(`<!--]--></div>`);
      } else {
        _push(`<!---->`);
      }
      if (unref(showSuggestions) && unref(scanInput) && unref(suggestions).length === 0 && unref(products).length > 0) {
        _push(`<div class="scan-suggestions scan-suggestions--empty" data-v-43b2f167><div class="scan-suggestion__empty" data-v-43b2f167>No products match &quot;${ssrInterpolate(unref(scanInput))}&quot;</div></div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</div></div><div class="smart-topbar__actions" data-v-43b2f167><div class="smart-stat d-none d-md-flex" data-v-43b2f167><span class="smart-stat__label" data-v-43b2f167>Today</span><span class="smart-stat__value" data-v-43b2f167>${ssrInterpolate(unref(todayStats).count)} sales · ${ssrInterpolate(formatMoney(unref(todayStats).revenue))}</span></div><div class="smart-cashier d-none d-sm-flex" data-v-43b2f167>`);
      _push(ssrRenderComponent(VAvatar, {
        color: "primary",
        size: "34",
        class: "mr-2"
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<span class="text-caption font-weight-bold text-white" data-v-43b2f167${_scopeId}>${ssrInterpolate(unref(cashierInitials))}</span>`);
          } else {
            return [
              createVNode("span", { class: "text-caption font-weight-bold text-white" }, toDisplayString(unref(cashierInitials)), 1)
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`<div class="smart-cashier__text" data-v-43b2f167><div class="smart-cashier__name" data-v-43b2f167>${ssrInterpolate(unref(cashierShort))}</div><div class="smart-cashier__role" data-v-43b2f167>${ssrInterpolate(unref(auth).role)}</div></div></div>`);
      _push(ssrRenderComponent(VBtn, {
        to: "/pos/parked",
        variant: "tonal",
        color: "warning",
        rounded: "lg",
        size: "small",
        class: "text-none smart-hold-btn",
        disabled: unref(parkedCount) === 0
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(ssrRenderComponent(VIcon, {
              start: "",
              size: "18"
            }, {
              default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                if (_push3) {
                  _push3(`mdi-pause-circle-outline`);
                } else {
                  return [
                    createTextVNode("mdi-pause-circle-outline")
                  ];
                }
              }),
              _: 1
            }, _parent2, _scopeId));
            _push2(` Hold `);
            if (unref(parkedCount) > 0) {
              _push2(ssrRenderComponent(VBadge, {
                content: unref(parkedCount),
                color: "warning",
                inline: "",
                class: "ml-2"
              }, null, _parent2, _scopeId));
            } else {
              _push2(`<!---->`);
            }
          } else {
            return [
              createVNode(VIcon, {
                start: "",
                size: "18"
              }, {
                default: withCtx(() => [
                  createTextVNode("mdi-pause-circle-outline")
                ]),
                _: 1
              }),
              createTextVNode(" Hold "),
              unref(parkedCount) > 0 ? (openBlock(), createBlock(VBadge, {
                key: 0,
                content: unref(parkedCount),
                color: "warning",
                inline: "",
                class: "ml-2"
              }, null, 8, ["content"])) : createCommentVNode("", true)
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`</div></header><div class="smart-grid" data-v-43b2f167><section class="smart-order" data-v-43b2f167><div class="smart-order-header" data-v-43b2f167><div class="smart-order-tile" data-v-43b2f167><div class="smart-order-tile__label" data-v-43b2f167>Order</div><div class="smart-order-tile__value" data-v-43b2f167>${ssrInterpolate(unref(orderRef))}</div></div><div class="smart-order-tile smart-order-tile--grow" data-v-43b2f167><div class="smart-order-tile__label" data-v-43b2f167>Customer</div><input${ssrRenderAttr("value", unref(pos).customerName)} class="smart-order-tile__input" placeholder="Walk-in customer" data-v-43b2f167></div><div class="smart-order-tile smart-order-tile--right" data-v-43b2f167><div class="smart-order-tile__label" data-v-43b2f167>Items</div><div class="smart-order-tile__value" data-v-43b2f167>${ssrInterpolate(unref(pos).itemCount)}</div></div></div><div class="smart-cart-table" data-v-43b2f167>`);
      if (!unref(pos).isEmpty) {
        _push(`<div class="smart-cart-rows" data-v-43b2f167><!--[-->`);
        ssrRenderList(unref(pos).cart, (item, i) => {
          _push(`<article class="${ssrRenderClass([{ "smart-cart-item--alt": i % 2 === 0 }, "smart-cart-item"])}" data-v-43b2f167><div class="smart-cart-item__main" data-v-43b2f167><div class="smart-cart-item__thumb" data-v-43b2f167>`);
          if (item.image) {
            _push(`<img${ssrRenderAttr("src", item.image)}${ssrRenderAttr("alt", item.name)} data-v-43b2f167>`);
          } else {
            _push(ssrRenderComponent(VIcon, {
              size: "18",
              color: "primary"
            }, {
              default: withCtx((_, _push2, _parent2, _scopeId) => {
                if (_push2) {
                  _push2(`mdi-package-variant-closed`);
                } else {
                  return [
                    createTextVNode("mdi-package-variant-closed")
                  ];
                }
              }),
              _: 2
            }, _parent));
          }
          _push(`</div><div class="smart-cart-item__info" data-v-43b2f167><div class="smart-cart-item__title" data-v-43b2f167>${ssrInterpolate(item.name)}</div><div class="smart-cart-item__meta" data-v-43b2f167>${ssrInterpolate(item.sku || "—")} · ${ssrInterpolate(formatMoney(item.price))} each`);
          if (item.items_per_unit > 1) {
            _push(`<!--[--> · ${ssrInterpolate(item.qty)} pcs (${ssrInterpolate((item.qty / item.items_per_unit).toFixed(2))} ${ssrInterpolate(item.unit)})<!--]-->`);
          } else {
            _push(`<!---->`);
          }
          _push(`</div></div></div><div class="smart-cart-item__controls" data-v-43b2f167><div class="smart-qty" data-v-43b2f167><button type="button" class="smart-qty__btn"${ssrIncludeBooleanAttr(item.qty <= 1) ? " disabled" : ""} data-v-43b2f167>`);
          _push(ssrRenderComponent(VIcon, { size: "14" }, {
            default: withCtx((_, _push2, _parent2, _scopeId) => {
              if (_push2) {
                _push2(`mdi-minus`);
              } else {
                return [
                  createTextVNode("mdi-minus")
                ];
              }
            }),
            _: 2
          }, _parent));
          _push(`</button><input${ssrRenderAttr("value", item.qty)} type="number" min="1"${ssrRenderAttr("max", item.max)} class="smart-qty__input" data-v-43b2f167><button type="button" class="smart-qty__btn smart-qty__btn--plus"${ssrIncludeBooleanAttr(item.qty >= item.max) ? " disabled" : ""} data-v-43b2f167>`);
          _push(ssrRenderComponent(VIcon, { size: "14" }, {
            default: withCtx((_, _push2, _parent2, _scopeId) => {
              if (_push2) {
                _push2(`mdi-plus`);
              } else {
                return [
                  createTextVNode("mdi-plus")
                ];
              }
            }),
            _: 2
          }, _parent));
          _push(`</button></div><div class="smart-cart-item__total" data-v-43b2f167>${ssrInterpolate(formatMoney(item.price * item.qty))}</div><button type="button" class="smart-cart-item__del" data-v-43b2f167>`);
          _push(ssrRenderComponent(VIcon, { size: "16" }, {
            default: withCtx((_, _push2, _parent2, _scopeId) => {
              if (_push2) {
                _push2(`mdi-close`);
              } else {
                return [
                  createTextVNode("mdi-close")
                ];
              }
            }),
            _: 2
          }, _parent));
          _push(`</button></div></article>`);
        });
        _push(`<!--]--></div>`);
      } else {
        _push(`<div class="smart-cart-empty" data-v-43b2f167><div class="smart-cart-empty__card" data-v-43b2f167><div class="smart-cart-empty__ring" data-v-43b2f167>`);
        _push(ssrRenderComponent(VIcon, {
          size: "40",
          color: "primary"
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`mdi-barcode-scan`);
            } else {
              return [
                createTextVNode("mdi-barcode-scan")
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(`</div><div class="smart-cart-empty__title" data-v-43b2f167>Ready to scan</div><p class="smart-cart-empty__body" data-v-43b2f167>Scan a barcode, type a name or SKU to add your first item.</p><div class="smart-keyhints" data-v-43b2f167><div class="smart-keyhint" data-v-43b2f167><kbd data-v-43b2f167>Enter</kbd><span data-v-43b2f167>Add</span></div><div class="smart-keyhint" data-v-43b2f167><kbd data-v-43b2f167>F2</kbd><span data-v-43b2f167>Search</span></div><div class="smart-keyhint" data-v-43b2f167><kbd data-v-43b2f167>F9</kbd><span data-v-43b2f167>Pay</span></div><div class="smart-keyhint" data-v-43b2f167><kbd data-v-43b2f167>F4</kbd><span data-v-43b2f167>Park</span></div><div class="smart-keyhint" data-v-43b2f167><kbd data-v-43b2f167>Esc</kbd><span data-v-43b2f167>Void</span></div></div>`);
        if (unref(parkedCount) > 0) {
          _push(`<div class="smart-parked-reminder" data-v-43b2f167>`);
          _push(ssrRenderComponent(VIcon, {
            size: "18",
            color: "warning"
          }, {
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
          _push(`<span data-v-43b2f167>${ssrInterpolate(unref(parkedCount))} parked sale${ssrInterpolate(unref(parkedCount) === 1 ? "" : "s")}</span>`);
          _push(ssrRenderComponent(VBtn, {
            to: "/pos/parked",
            variant: "tonal",
            size: "small",
            color: "warning",
            rounded: "lg",
            class: "text-none"
          }, {
            default: withCtx((_, _push2, _parent2, _scopeId) => {
              if (_push2) {
                _push2(`View`);
              } else {
                return [
                  createTextVNode("View")
                ];
              }
            }),
            _: 1
          }, _parent));
          _push(`</div>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</div></div>`);
      }
      _push(`</div><div class="smart-totals" data-v-43b2f167><div class="smart-totals__row" data-v-43b2f167><span data-v-43b2f167>Subtotal</span><span data-v-43b2f167>${ssrInterpolate(formatMoney(unref(pos).subtotal))}</span></div><div class="smart-totals__row smart-totals__row--discount" data-v-43b2f167><span data-v-43b2f167>Discount</span><span data-v-43b2f167>- ${ssrInterpolate(formatMoney(unref(pos).discountAmount))}</span></div><div class="smart-totals__row" data-v-43b2f167><span data-v-43b2f167>Tax</span><span data-v-43b2f167>${ssrInterpolate(formatMoney(unref(pos).taxAmount))}</span></div><div class="smart-totals__row smart-totals__row--total" data-v-43b2f167><span data-v-43b2f167>Total</span><span data-v-43b2f167>${ssrInterpolate(formatMoney(unref(pos).total))}</span></div></div></section><aside class="smart-side" data-v-43b2f167><div class="smart-side-section" data-v-43b2f167><div class="smart-side-section__title" data-v-43b2f167>Payment Method</div><div class="smart-pay-grid" data-v-43b2f167><!--[-->`);
      ssrRenderList(paymentOptions, (opt) => {
        _push(`<button type="button" class="${ssrRenderClass([{ "smart-pay-btn--active": unref(pos).paymentMethod === opt.value }, "smart-pay-btn"])}" data-v-43b2f167><div class="smart-pay-btn__icon" data-v-43b2f167>`);
        _push(ssrRenderComponent(VIcon, { size: "22" }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`${ssrInterpolate(opt.icon)}`);
            } else {
              return [
                createTextVNode(toDisplayString(opt.icon), 1)
              ];
            }
          }),
          _: 2
        }, _parent));
        _push(`</div><div class="smart-pay-btn__text" data-v-43b2f167><div class="smart-pay-btn__name" data-v-43b2f167>${ssrInterpolate(opt.label)}</div><div class="smart-pay-btn__hint" data-v-43b2f167>${ssrInterpolate(opt.hint)}</div></div>`);
        _push(ssrRenderComponent(VIcon, {
          size: "14",
          class: "smart-pay-btn__check"
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`${ssrInterpolate(unref(pos).paymentMethod === opt.value ? "mdi-check-circle" : "mdi-circle-outline")}`);
            } else {
              return [
                createTextVNode(toDisplayString(unref(pos).paymentMethod === opt.value ? "mdi-check-circle" : "mdi-circle-outline"), 1)
              ];
            }
          }),
          _: 2
        }, _parent));
        _push(`</button>`);
      });
      _push(`<!--]--></div></div><div class="smart-side-section" data-v-43b2f167><div class="smart-side-section__title" data-v-43b2f167>QUICK DISCOUNT</div><div class="smart-quick-disc" data-v-43b2f167><!--[-->`);
      ssrRenderList(quickDiscounts, (d) => {
        _push(`<button type="button" class="${ssrRenderClass([{ "smart-quick-disc__btn--active": unref(quickDisc) === d }, "smart-quick-disc__btn"])}" data-v-43b2f167>${ssrInterpolate(d === 0 ? "None" : `${d}%`)}</button>`);
      });
      _push(`<!--]--></div></div><div class="smart-side-section" data-v-43b2f167><div class="smart-side-section__title" data-v-43b2f167>SALE ACTIONS</div><div class="smart-actions" data-v-43b2f167>`);
      _push(ssrRenderComponent(VBtn, {
        variant: "tonal",
        color: "warning",
        rounded: "lg",
        "prepend-icon": "mdi-pause",
        class: "text-none",
        disabled: unref(pos).isEmpty,
        onClick: ($event) => holdDialog.value = true
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(` Hold `);
          } else {
            return [
              createTextVNode(" Hold ")
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(ssrRenderComponent(VBtn, {
        variant: "tonal",
        color: "info",
        rounded: "lg",
        "prepend-icon": "mdi-play",
        class: "text-none",
        to: "/pos/parked"
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`Resume`);
          } else {
            return [
              createTextVNode("Resume")
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(ssrRenderComponent(VBtn, {
        variant: "tonal",
        color: "error",
        rounded: "lg",
        "prepend-icon": "mdi-close",
        class: "text-none",
        disabled: unref(pos).isEmpty,
        onClick: voidCart
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(` Void `);
          } else {
            return [
              createTextVNode(" Void ")
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`</div></div><button type="button" class="${ssrRenderClass([{ "smart-pay-now--disabled": unref(pos).isEmpty || unref(checkingOut) }, "smart-pay-now"])}"${ssrIncludeBooleanAttr(unref(pos).isEmpty || unref(checkingOut)) ? " disabled" : ""} data-v-43b2f167><div class="smart-pay-now__inner" data-v-43b2f167><div class="smart-pay-now__left" data-v-43b2f167><div class="smart-pay-now__icon" data-v-43b2f167>`);
      _push(ssrRenderComponent(VIcon, {
        size: "22",
        color: "white"
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`mdi-cash-register`);
          } else {
            return [
              createTextVNode("mdi-cash-register")
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`</div><div data-v-43b2f167><div class="smart-pay-now__label" data-v-43b2f167>Charge</div><div class="smart-pay-now__hint" data-v-43b2f167>${ssrInterpolate(unref(itemCountLabel))}</div></div></div><div class="smart-pay-now__amount" data-v-43b2f167>${ssrInterpolate(formatMoney(unref(pos).total))}</div></div></button></aside></div>`);
      _push(ssrRenderComponent(VDialog, {
        modelValue: unref(checkoutDialog),
        "onUpdate:modelValue": ($event) => isRef(checkoutDialog) ? checkoutDialog.value = $event : null,
        "max-width": "600",
        persistent: ""
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(ssrRenderComponent(VCard, { rounded: "xl" }, {
              default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                if (_push3) {
                  _push3(ssrRenderComponent(VCardTitle, { class: "text-h6 font-weight-bold d-flex align-center" }, {
                    default: withCtx((_3, _push4, _parent4, _scopeId3) => {
                      if (_push4) {
                        _push4(ssrRenderComponent(VIcon, {
                          color: "primary",
                          class: "mr-2"
                        }, {
                          default: withCtx((_4, _push5, _parent5, _scopeId4) => {
                            if (_push5) {
                              _push5(`mdi-cash-register`);
                            } else {
                              return [
                                createTextVNode("mdi-cash-register")
                              ];
                            }
                          }),
                          _: 1
                        }, _parent4, _scopeId3));
                        _push4(` Complete Payment `);
                        _push4(ssrRenderComponent(VSpacer, null, null, _parent4, _scopeId3));
                        _push4(ssrRenderComponent(VChip, {
                          size: "small",
                          variant: "tonal",
                          color: "primary"
                        }, {
                          default: withCtx((_4, _push5, _parent5, _scopeId4) => {
                            if (_push5) {
                              _push5(ssrRenderComponent(VIcon, {
                                size: "14",
                                start: ""
                              }, {
                                default: withCtx((_5, _push6, _parent6, _scopeId5) => {
                                  if (_push6) {
                                    _push6(`${ssrInterpolate(paymentOptions.find((o) => o.value === unref(pos).paymentMethod)?.icon)}`);
                                  } else {
                                    return [
                                      createTextVNode(toDisplayString(paymentOptions.find((o) => o.value === unref(pos).paymentMethod)?.icon), 1)
                                    ];
                                  }
                                }),
                                _: 1
                              }, _parent5, _scopeId4));
                              _push5(` ${ssrInterpolate(paymentOptions.find((o) => o.value === unref(pos).paymentMethod)?.label)}`);
                            } else {
                              return [
                                createVNode(VIcon, {
                                  size: "14",
                                  start: ""
                                }, {
                                  default: withCtx(() => [
                                    createTextVNode(toDisplayString(paymentOptions.find((o) => o.value === unref(pos).paymentMethod)?.icon), 1)
                                  ]),
                                  _: 1
                                }),
                                createTextVNode(" " + toDisplayString(paymentOptions.find((o) => o.value === unref(pos).paymentMethod)?.label), 1)
                              ];
                            }
                          }),
                          _: 1
                        }, _parent4, _scopeId3));
                      } else {
                        return [
                          createVNode(VIcon, {
                            color: "primary",
                            class: "mr-2"
                          }, {
                            default: withCtx(() => [
                              createTextVNode("mdi-cash-register")
                            ]),
                            _: 1
                          }),
                          createTextVNode(" Complete Payment "),
                          createVNode(VSpacer),
                          createVNode(VChip, {
                            size: "small",
                            variant: "tonal",
                            color: "primary"
                          }, {
                            default: withCtx(() => [
                              createVNode(VIcon, {
                                size: "14",
                                start: ""
                              }, {
                                default: withCtx(() => [
                                  createTextVNode(toDisplayString(paymentOptions.find((o) => o.value === unref(pos).paymentMethod)?.icon), 1)
                                ]),
                                _: 1
                              }),
                              createTextVNode(" " + toDisplayString(paymentOptions.find((o) => o.value === unref(pos).paymentMethod)?.label), 1)
                            ]),
                            _: 1
                          })
                        ];
                      }
                    }),
                    _: 1
                  }, _parent3, _scopeId2));
                  _push3(ssrRenderComponent(VDivider, null, null, _parent3, _scopeId2));
                  _push3(ssrRenderComponent(VCardText, { class: "pt-4" }, {
                    default: withCtx((_3, _push4, _parent4, _scopeId3) => {
                      if (_push4) {
                        _push4(`<div class="checkout-total-banner" data-v-43b2f167${_scopeId3}><span class="text-body-2 text-medium-emphasis" data-v-43b2f167${_scopeId3}>Total Due</span><span class="checkout-total-banner__value" data-v-43b2f167${_scopeId3}>${ssrInterpolate(formatMoney(unref(pos).total))}</span><div class="checkout-total-banner__method" data-v-43b2f167${_scopeId3}>`);
                        _push4(ssrRenderComponent(VIcon, { size: "14" }, {
                          default: withCtx((_4, _push5, _parent5, _scopeId4) => {
                            if (_push5) {
                              _push5(`${ssrInterpolate(paymentOptions.find((o) => o.value === unref(pos).paymentMethod)?.icon)}`);
                            } else {
                              return [
                                createTextVNode(toDisplayString(paymentOptions.find((o) => o.value === unref(pos).paymentMethod)?.icon), 1)
                              ];
                            }
                          }),
                          _: 1
                        }, _parent4, _scopeId3));
                        _push4(`<span data-v-43b2f167${_scopeId3}>${ssrInterpolate(paymentOptions.find((o) => o.value === unref(pos).paymentMethod)?.label)}</span></div></div>`);
                        _push4(ssrRenderComponent(VTextField, {
                          modelValue: unref(pos).customerName,
                          "onUpdate:modelValue": ($event) => unref(pos).customerName = $event,
                          label: "Customer",
                          placeholder: "Walk-in customer",
                          density: "comfortable",
                          variant: "outlined",
                          rounded: "lg",
                          "prepend-inner-icon": "mdi-account-outline",
                          clearable: "",
                          class: "mb-2"
                        }, null, _parent4, _scopeId3));
                        _push4(ssrRenderComponent(VTextField, {
                          modelValue: unref(pos).customerPhone,
                          "onUpdate:modelValue": ($event) => unref(pos).customerPhone = $event,
                          label: "Phone",
                          placeholder: "Optional",
                          density: "comfortable",
                          variant: "outlined",
                          rounded: "lg",
                          "prepend-inner-icon": "mdi-phone-outline",
                          class: "mb-2"
                        }, null, _parent4, _scopeId3));
                        if (unref(pos).paymentMethod === "cash") {
                          _push4(`<!--[--><p class="text-subtitle-2 font-weight-medium mb-2" data-v-43b2f167${_scopeId3}>Cash Received</p><div class="quick-cash-grid mb-2" data-v-43b2f167${_scopeId3}><!--[-->`);
                          ssrRenderList(unref(quickCashOptions), (amt) => {
                            _push4(ssrRenderComponent(VBtn, {
                              key: amt,
                              variant: "tonal",
                              size: "small",
                              rounded: "lg",
                              onClick: ($event) => tendered.value = amt
                            }, {
                              default: withCtx((_4, _push5, _parent5, _scopeId4) => {
                                if (_push5) {
                                  _push5(`${ssrInterpolate(formatMoney(amt))}`);
                                } else {
                                  return [
                                    createTextVNode(toDisplayString(formatMoney(amt)), 1)
                                  ];
                                }
                              }),
                              _: 2
                            }, _parent4, _scopeId3));
                          });
                          _push4(`<!--]--></div>`);
                          _push4(ssrRenderComponent(VTextField, {
                            modelValue: unref(tendered),
                            "onUpdate:modelValue": ($event) => isRef(tendered) ? tendered.value = $event : null,
                            modelModifiers: { number: true },
                            label: "Amount received",
                            density: "comfortable",
                            variant: "outlined",
                            rounded: "lg",
                            type: "number",
                            prefix: unref(currencySymbol),
                            class: "mb-2"
                          }, null, _parent4, _scopeId3));
                          _push4(`<div class="${ssrRenderClass([{ "change-row--positive": unref(change) > 0 }, "change-row"])}" data-v-43b2f167${_scopeId3}><span class="text-body-2" data-v-43b2f167${_scopeId3}>Change</span><span class="text-h6 font-weight-bold" data-v-43b2f167${_scopeId3}>${ssrInterpolate(formatMoney(Math.max(0, unref(change))))}</span></div><!--]-->`);
                        } else {
                          _push4(`<!---->`);
                        }
                        if (unref(pos).paymentMethod === "mpesa") {
                          _push4(`<!--[-->`);
                          _push4(ssrRenderComponent(VTextField, {
                            modelValue: unref(mpesaPhone),
                            "onUpdate:modelValue": ($event) => isRef(mpesaPhone) ? mpesaPhone.value = $event : null,
                            label: "Customer M-Pesa phone (optional)",
                            density: "comfortable",
                            variant: "outlined",
                            rounded: "lg",
                            "prepend-inner-icon": "mdi-cellphone",
                            placeholder: "07XX XXX XXX"
                          }, null, _parent4, _scopeId3));
                          _push4(ssrRenderComponent(VAlert, {
                            type: "info",
                            variant: "tonal",
                            density: "compact",
                            class: "mt-2",
                            rounded: "lg"
                          }, {
                            default: withCtx((_4, _push5, _parent5, _scopeId4) => {
                              if (_push5) {
                                _push5(` Confirm payment was received before completing the sale. `);
                              } else {
                                return [
                                  createTextVNode(" Confirm payment was received before completing the sale. ")
                                ];
                              }
                            }),
                            _: 1
                          }, _parent4, _scopeId3));
                          _push4(`<!--]-->`);
                        } else {
                          _push4(`<!---->`);
                        }
                        if (unref(pos).paymentMethod === "card") {
                          _push4(ssrRenderComponent(VTextField, {
                            modelValue: unref(cardRef),
                            "onUpdate:modelValue": ($event) => isRef(cardRef) ? cardRef.value = $event : null,
                            label: "Card reference / last 4 digits",
                            density: "comfortable",
                            variant: "outlined",
                            rounded: "lg",
                            "prepend-inner-icon": "mdi-credit-card-outline",
                            placeholder: "1234"
                          }, null, _parent4, _scopeId3));
                        } else {
                          _push4(`<!---->`);
                        }
                        if (unref(pos).paymentMethod === "insurance") {
                          _push4(`<!--[-->`);
                          _push4(ssrRenderComponent(VTextField, {
                            modelValue: unref(insuranceProvider),
                            "onUpdate:modelValue": ($event) => isRef(insuranceProvider) ? insuranceProvider.value = $event : null,
                            label: "Insurance provider",
                            density: "comfortable",
                            variant: "outlined",
                            rounded: "lg",
                            "prepend-inner-icon": "mdi-shield-account-outline",
                            placeholder: "Provider name"
                          }, null, _parent4, _scopeId3));
                          _push4(ssrRenderComponent(VTextField, {
                            modelValue: unref(insuranceMember),
                            "onUpdate:modelValue": ($event) => isRef(insuranceMember) ? insuranceMember.value = $event : null,
                            label: "Member number",
                            density: "comfortable",
                            variant: "outlined",
                            rounded: "lg",
                            class: "mt-2"
                          }, null, _parent4, _scopeId3));
                          _push4(`<!--]-->`);
                        } else {
                          _push4(`<!---->`);
                        }
                        if (unref(pos).paymentMethod === "credit") {
                          _push4(`<!--[-->`);
                          _push4(ssrRenderComponent(VTextField, {
                            modelValue: unref(creditDueDate),
                            "onUpdate:modelValue": ($event) => isRef(creditDueDate) ? creditDueDate.value = $event : null,
                            label: "Due date",
                            type: "date",
                            density: "comfortable",
                            variant: "outlined",
                            rounded: "lg",
                            class: "mt-2"
                          }, null, _parent4, _scopeId3));
                          _push4(ssrRenderComponent(VTextField, {
                            modelValue: unref(creditPartial),
                            "onUpdate:modelValue": ($event) => isRef(creditPartial) ? creditPartial.value = $event : null,
                            modelModifiers: { number: true },
                            label: "Partial payment (optional)",
                            density: "comfortable",
                            variant: "outlined",
                            rounded: "lg",
                            class: "mt-2",
                            type: "number",
                            min: "0",
                            prefix: unref(currencySymbol)
                          }, null, _parent4, _scopeId3));
                          _push4(ssrRenderComponent(VAlert, {
                            type: "info",
                            variant: "tonal",
                            density: "compact",
                            class: "mt-2",
                            rounded: "lg"
                          }, {
                            default: withCtx((_4, _push5, _parent5, _scopeId4) => {
                              if (_push5) {
                                _push5(` Balance on credit: ${ssrInterpolate(formatMoney(Math.max(0, unref(pos).total - (unref(creditPartial) || 0))))}`);
                              } else {
                                return [
                                  createTextVNode(" Balance on credit: " + toDisplayString(formatMoney(Math.max(0, unref(pos).total - (unref(creditPartial) || 0)))), 1)
                                ];
                              }
                            }),
                            _: 1
                          }, _parent4, _scopeId3));
                          _push4(`<!--]-->`);
                        } else {
                          _push4(`<!---->`);
                        }
                      } else {
                        return [
                          createVNode("div", { class: "checkout-total-banner" }, [
                            createVNode("span", { class: "text-body-2 text-medium-emphasis" }, "Total Due"),
                            createVNode("span", { class: "checkout-total-banner__value" }, toDisplayString(formatMoney(unref(pos).total)), 1),
                            createVNode("div", { class: "checkout-total-banner__method" }, [
                              createVNode(VIcon, { size: "14" }, {
                                default: withCtx(() => [
                                  createTextVNode(toDisplayString(paymentOptions.find((o) => o.value === unref(pos).paymentMethod)?.icon), 1)
                                ]),
                                _: 1
                              }),
                              createVNode("span", null, toDisplayString(paymentOptions.find((o) => o.value === unref(pos).paymentMethod)?.label), 1)
                            ])
                          ]),
                          createVNode(VTextField, {
                            modelValue: unref(pos).customerName,
                            "onUpdate:modelValue": ($event) => unref(pos).customerName = $event,
                            label: "Customer",
                            placeholder: "Walk-in customer",
                            density: "comfortable",
                            variant: "outlined",
                            rounded: "lg",
                            "prepend-inner-icon": "mdi-account-outline",
                            clearable: "",
                            class: "mb-2"
                          }, null, 8, ["modelValue", "onUpdate:modelValue"]),
                          createVNode(VTextField, {
                            modelValue: unref(pos).customerPhone,
                            "onUpdate:modelValue": ($event) => unref(pos).customerPhone = $event,
                            label: "Phone",
                            placeholder: "Optional",
                            density: "comfortable",
                            variant: "outlined",
                            rounded: "lg",
                            "prepend-inner-icon": "mdi-phone-outline",
                            class: "mb-2"
                          }, null, 8, ["modelValue", "onUpdate:modelValue"]),
                          unref(pos).paymentMethod === "cash" ? (openBlock(), createBlock(Fragment, { key: 0 }, [
                            createVNode("p", { class: "text-subtitle-2 font-weight-medium mb-2" }, "Cash Received"),
                            createVNode("div", { class: "quick-cash-grid mb-2" }, [
                              (openBlock(true), createBlock(Fragment, null, renderList(unref(quickCashOptions), (amt) => {
                                return openBlock(), createBlock(VBtn, {
                                  key: amt,
                                  variant: "tonal",
                                  size: "small",
                                  rounded: "lg",
                                  onClick: ($event) => tendered.value = amt
                                }, {
                                  default: withCtx(() => [
                                    createTextVNode(toDisplayString(formatMoney(amt)), 1)
                                  ]),
                                  _: 2
                                }, 1032, ["onClick"]);
                              }), 128))
                            ]),
                            createVNode(VTextField, {
                              modelValue: unref(tendered),
                              "onUpdate:modelValue": ($event) => isRef(tendered) ? tendered.value = $event : null,
                              modelModifiers: { number: true },
                              label: "Amount received",
                              density: "comfortable",
                              variant: "outlined",
                              rounded: "lg",
                              type: "number",
                              prefix: unref(currencySymbol),
                              class: "mb-2"
                            }, null, 8, ["modelValue", "onUpdate:modelValue", "prefix"]),
                            createVNode("div", {
                              class: ["change-row", { "change-row--positive": unref(change) > 0 }]
                            }, [
                              createVNode("span", { class: "text-body-2" }, "Change"),
                              createVNode("span", { class: "text-h6 font-weight-bold" }, toDisplayString(formatMoney(Math.max(0, unref(change)))), 1)
                            ], 2)
                          ], 64)) : createCommentVNode("", true),
                          unref(pos).paymentMethod === "mpesa" ? (openBlock(), createBlock(Fragment, { key: 1 }, [
                            createVNode(VTextField, {
                              modelValue: unref(mpesaPhone),
                              "onUpdate:modelValue": ($event) => isRef(mpesaPhone) ? mpesaPhone.value = $event : null,
                              label: "Customer M-Pesa phone (optional)",
                              density: "comfortable",
                              variant: "outlined",
                              rounded: "lg",
                              "prepend-inner-icon": "mdi-cellphone",
                              placeholder: "07XX XXX XXX"
                            }, null, 8, ["modelValue", "onUpdate:modelValue"]),
                            createVNode(VAlert, {
                              type: "info",
                              variant: "tonal",
                              density: "compact",
                              class: "mt-2",
                              rounded: "lg"
                            }, {
                              default: withCtx(() => [
                                createTextVNode(" Confirm payment was received before completing the sale. ")
                              ]),
                              _: 1
                            })
                          ], 64)) : createCommentVNode("", true),
                          unref(pos).paymentMethod === "card" ? (openBlock(), createBlock(VTextField, {
                            key: 2,
                            modelValue: unref(cardRef),
                            "onUpdate:modelValue": ($event) => isRef(cardRef) ? cardRef.value = $event : null,
                            label: "Card reference / last 4 digits",
                            density: "comfortable",
                            variant: "outlined",
                            rounded: "lg",
                            "prepend-inner-icon": "mdi-credit-card-outline",
                            placeholder: "1234"
                          }, null, 8, ["modelValue", "onUpdate:modelValue"])) : createCommentVNode("", true),
                          unref(pos).paymentMethod === "insurance" ? (openBlock(), createBlock(Fragment, { key: 3 }, [
                            createVNode(VTextField, {
                              modelValue: unref(insuranceProvider),
                              "onUpdate:modelValue": ($event) => isRef(insuranceProvider) ? insuranceProvider.value = $event : null,
                              label: "Insurance provider",
                              density: "comfortable",
                              variant: "outlined",
                              rounded: "lg",
                              "prepend-inner-icon": "mdi-shield-account-outline",
                              placeholder: "Provider name"
                            }, null, 8, ["modelValue", "onUpdate:modelValue"]),
                            createVNode(VTextField, {
                              modelValue: unref(insuranceMember),
                              "onUpdate:modelValue": ($event) => isRef(insuranceMember) ? insuranceMember.value = $event : null,
                              label: "Member number",
                              density: "comfortable",
                              variant: "outlined",
                              rounded: "lg",
                              class: "mt-2"
                            }, null, 8, ["modelValue", "onUpdate:modelValue"])
                          ], 64)) : createCommentVNode("", true),
                          unref(pos).paymentMethod === "credit" ? (openBlock(), createBlock(Fragment, { key: 4 }, [
                            createVNode(VTextField, {
                              modelValue: unref(creditDueDate),
                              "onUpdate:modelValue": ($event) => isRef(creditDueDate) ? creditDueDate.value = $event : null,
                              label: "Due date",
                              type: "date",
                              density: "comfortable",
                              variant: "outlined",
                              rounded: "lg",
                              class: "mt-2"
                            }, null, 8, ["modelValue", "onUpdate:modelValue"]),
                            createVNode(VTextField, {
                              modelValue: unref(creditPartial),
                              "onUpdate:modelValue": ($event) => isRef(creditPartial) ? creditPartial.value = $event : null,
                              modelModifiers: { number: true },
                              label: "Partial payment (optional)",
                              density: "comfortable",
                              variant: "outlined",
                              rounded: "lg",
                              class: "mt-2",
                              type: "number",
                              min: "0",
                              prefix: unref(currencySymbol)
                            }, null, 8, ["modelValue", "onUpdate:modelValue", "prefix"]),
                            createVNode(VAlert, {
                              type: "info",
                              variant: "tonal",
                              density: "compact",
                              class: "mt-2",
                              rounded: "lg"
                            }, {
                              default: withCtx(() => [
                                createTextVNode(" Balance on credit: " + toDisplayString(formatMoney(Math.max(0, unref(pos).total - (unref(creditPartial) || 0)))), 1)
                              ]),
                              _: 1
                            })
                          ], 64)) : createCommentVNode("", true)
                        ];
                      }
                    }),
                    _: 1
                  }, _parent3, _scopeId2));
                  _push3(ssrRenderComponent(VCardActions, { class: "pa-4" }, {
                    default: withCtx((_3, _push4, _parent4, _scopeId3) => {
                      if (_push4) {
                        _push4(ssrRenderComponent(VBtn, {
                          variant: "text",
                          onClick: ($event) => checkoutDialog.value = false
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
                        _push4(ssrRenderComponent(VSpacer, null, null, _parent4, _scopeId3));
                        _push4(ssrRenderComponent(VBtn, {
                          variant: "flat",
                          color: "primary",
                          size: "large",
                          rounded: "xl",
                          loading: unref(checkingOut),
                          disabled: !unref(canCompleteCheckout),
                          onClick: completeCheckout
                        }, {
                          default: withCtx((_4, _push5, _parent5, _scopeId4) => {
                            if (_push5) {
                              _push5(ssrRenderComponent(VIcon, { start: "" }, {
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
                              _push5(` Complete Sale `);
                            } else {
                              return [
                                createVNode(VIcon, { start: "" }, {
                                  default: withCtx(() => [
                                    createTextVNode("mdi-check-circle")
                                  ]),
                                  _: 1
                                }),
                                createTextVNode(" Complete Sale ")
                              ];
                            }
                          }),
                          _: 1
                        }, _parent4, _scopeId3));
                      } else {
                        return [
                          createVNode(VBtn, {
                            variant: "text",
                            onClick: ($event) => checkoutDialog.value = false
                          }, {
                            default: withCtx(() => [
                              createTextVNode("Cancel")
                            ]),
                            _: 1
                          }, 8, ["onClick"]),
                          createVNode(VSpacer),
                          createVNode(VBtn, {
                            variant: "flat",
                            color: "primary",
                            size: "large",
                            rounded: "xl",
                            loading: unref(checkingOut),
                            disabled: !unref(canCompleteCheckout),
                            onClick: completeCheckout
                          }, {
                            default: withCtx(() => [
                              createVNode(VIcon, { start: "" }, {
                                default: withCtx(() => [
                                  createTextVNode("mdi-check-circle")
                                ]),
                                _: 1
                              }),
                              createTextVNode(" Complete Sale ")
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
                    createVNode(VCardTitle, { class: "text-h6 font-weight-bold d-flex align-center" }, {
                      default: withCtx(() => [
                        createVNode(VIcon, {
                          color: "primary",
                          class: "mr-2"
                        }, {
                          default: withCtx(() => [
                            createTextVNode("mdi-cash-register")
                          ]),
                          _: 1
                        }),
                        createTextVNode(" Complete Payment "),
                        createVNode(VSpacer),
                        createVNode(VChip, {
                          size: "small",
                          variant: "tonal",
                          color: "primary"
                        }, {
                          default: withCtx(() => [
                            createVNode(VIcon, {
                              size: "14",
                              start: ""
                            }, {
                              default: withCtx(() => [
                                createTextVNode(toDisplayString(paymentOptions.find((o) => o.value === unref(pos).paymentMethod)?.icon), 1)
                              ]),
                              _: 1
                            }),
                            createTextVNode(" " + toDisplayString(paymentOptions.find((o) => o.value === unref(pos).paymentMethod)?.label), 1)
                          ]),
                          _: 1
                        })
                      ]),
                      _: 1
                    }),
                    createVNode(VDivider),
                    createVNode(VCardText, { class: "pt-4" }, {
                      default: withCtx(() => [
                        createVNode("div", { class: "checkout-total-banner" }, [
                          createVNode("span", { class: "text-body-2 text-medium-emphasis" }, "Total Due"),
                          createVNode("span", { class: "checkout-total-banner__value" }, toDisplayString(formatMoney(unref(pos).total)), 1),
                          createVNode("div", { class: "checkout-total-banner__method" }, [
                            createVNode(VIcon, { size: "14" }, {
                              default: withCtx(() => [
                                createTextVNode(toDisplayString(paymentOptions.find((o) => o.value === unref(pos).paymentMethod)?.icon), 1)
                              ]),
                              _: 1
                            }),
                            createVNode("span", null, toDisplayString(paymentOptions.find((o) => o.value === unref(pos).paymentMethod)?.label), 1)
                          ])
                        ]),
                        createVNode(VTextField, {
                          modelValue: unref(pos).customerName,
                          "onUpdate:modelValue": ($event) => unref(pos).customerName = $event,
                          label: "Customer",
                          placeholder: "Walk-in customer",
                          density: "comfortable",
                          variant: "outlined",
                          rounded: "lg",
                          "prepend-inner-icon": "mdi-account-outline",
                          clearable: "",
                          class: "mb-2"
                        }, null, 8, ["modelValue", "onUpdate:modelValue"]),
                        createVNode(VTextField, {
                          modelValue: unref(pos).customerPhone,
                          "onUpdate:modelValue": ($event) => unref(pos).customerPhone = $event,
                          label: "Phone",
                          placeholder: "Optional",
                          density: "comfortable",
                          variant: "outlined",
                          rounded: "lg",
                          "prepend-inner-icon": "mdi-phone-outline",
                          class: "mb-2"
                        }, null, 8, ["modelValue", "onUpdate:modelValue"]),
                        unref(pos).paymentMethod === "cash" ? (openBlock(), createBlock(Fragment, { key: 0 }, [
                          createVNode("p", { class: "text-subtitle-2 font-weight-medium mb-2" }, "Cash Received"),
                          createVNode("div", { class: "quick-cash-grid mb-2" }, [
                            (openBlock(true), createBlock(Fragment, null, renderList(unref(quickCashOptions), (amt) => {
                              return openBlock(), createBlock(VBtn, {
                                key: amt,
                                variant: "tonal",
                                size: "small",
                                rounded: "lg",
                                onClick: ($event) => tendered.value = amt
                              }, {
                                default: withCtx(() => [
                                  createTextVNode(toDisplayString(formatMoney(amt)), 1)
                                ]),
                                _: 2
                              }, 1032, ["onClick"]);
                            }), 128))
                          ]),
                          createVNode(VTextField, {
                            modelValue: unref(tendered),
                            "onUpdate:modelValue": ($event) => isRef(tendered) ? tendered.value = $event : null,
                            modelModifiers: { number: true },
                            label: "Amount received",
                            density: "comfortable",
                            variant: "outlined",
                            rounded: "lg",
                            type: "number",
                            prefix: unref(currencySymbol),
                            class: "mb-2"
                          }, null, 8, ["modelValue", "onUpdate:modelValue", "prefix"]),
                          createVNode("div", {
                            class: ["change-row", { "change-row--positive": unref(change) > 0 }]
                          }, [
                            createVNode("span", { class: "text-body-2" }, "Change"),
                            createVNode("span", { class: "text-h6 font-weight-bold" }, toDisplayString(formatMoney(Math.max(0, unref(change)))), 1)
                          ], 2)
                        ], 64)) : createCommentVNode("", true),
                        unref(pos).paymentMethod === "mpesa" ? (openBlock(), createBlock(Fragment, { key: 1 }, [
                          createVNode(VTextField, {
                            modelValue: unref(mpesaPhone),
                            "onUpdate:modelValue": ($event) => isRef(mpesaPhone) ? mpesaPhone.value = $event : null,
                            label: "Customer M-Pesa phone (optional)",
                            density: "comfortable",
                            variant: "outlined",
                            rounded: "lg",
                            "prepend-inner-icon": "mdi-cellphone",
                            placeholder: "07XX XXX XXX"
                          }, null, 8, ["modelValue", "onUpdate:modelValue"]),
                          createVNode(VAlert, {
                            type: "info",
                            variant: "tonal",
                            density: "compact",
                            class: "mt-2",
                            rounded: "lg"
                          }, {
                            default: withCtx(() => [
                              createTextVNode(" Confirm payment was received before completing the sale. ")
                            ]),
                            _: 1
                          })
                        ], 64)) : createCommentVNode("", true),
                        unref(pos).paymentMethod === "card" ? (openBlock(), createBlock(VTextField, {
                          key: 2,
                          modelValue: unref(cardRef),
                          "onUpdate:modelValue": ($event) => isRef(cardRef) ? cardRef.value = $event : null,
                          label: "Card reference / last 4 digits",
                          density: "comfortable",
                          variant: "outlined",
                          rounded: "lg",
                          "prepend-inner-icon": "mdi-credit-card-outline",
                          placeholder: "1234"
                        }, null, 8, ["modelValue", "onUpdate:modelValue"])) : createCommentVNode("", true),
                        unref(pos).paymentMethod === "insurance" ? (openBlock(), createBlock(Fragment, { key: 3 }, [
                          createVNode(VTextField, {
                            modelValue: unref(insuranceProvider),
                            "onUpdate:modelValue": ($event) => isRef(insuranceProvider) ? insuranceProvider.value = $event : null,
                            label: "Insurance provider",
                            density: "comfortable",
                            variant: "outlined",
                            rounded: "lg",
                            "prepend-inner-icon": "mdi-shield-account-outline",
                            placeholder: "Provider name"
                          }, null, 8, ["modelValue", "onUpdate:modelValue"]),
                          createVNode(VTextField, {
                            modelValue: unref(insuranceMember),
                            "onUpdate:modelValue": ($event) => isRef(insuranceMember) ? insuranceMember.value = $event : null,
                            label: "Member number",
                            density: "comfortable",
                            variant: "outlined",
                            rounded: "lg",
                            class: "mt-2"
                          }, null, 8, ["modelValue", "onUpdate:modelValue"])
                        ], 64)) : createCommentVNode("", true),
                        unref(pos).paymentMethod === "credit" ? (openBlock(), createBlock(Fragment, { key: 4 }, [
                          createVNode(VTextField, {
                            modelValue: unref(creditDueDate),
                            "onUpdate:modelValue": ($event) => isRef(creditDueDate) ? creditDueDate.value = $event : null,
                            label: "Due date",
                            type: "date",
                            density: "comfortable",
                            variant: "outlined",
                            rounded: "lg",
                            class: "mt-2"
                          }, null, 8, ["modelValue", "onUpdate:modelValue"]),
                          createVNode(VTextField, {
                            modelValue: unref(creditPartial),
                            "onUpdate:modelValue": ($event) => isRef(creditPartial) ? creditPartial.value = $event : null,
                            modelModifiers: { number: true },
                            label: "Partial payment (optional)",
                            density: "comfortable",
                            variant: "outlined",
                            rounded: "lg",
                            class: "mt-2",
                            type: "number",
                            min: "0",
                            prefix: unref(currencySymbol)
                          }, null, 8, ["modelValue", "onUpdate:modelValue", "prefix"]),
                          createVNode(VAlert, {
                            type: "info",
                            variant: "tonal",
                            density: "compact",
                            class: "mt-2",
                            rounded: "lg"
                          }, {
                            default: withCtx(() => [
                              createTextVNode(" Balance on credit: " + toDisplayString(formatMoney(Math.max(0, unref(pos).total - (unref(creditPartial) || 0)))), 1)
                            ]),
                            _: 1
                          })
                        ], 64)) : createCommentVNode("", true)
                      ]),
                      _: 1
                    }),
                    createVNode(VCardActions, { class: "pa-4" }, {
                      default: withCtx(() => [
                        createVNode(VBtn, {
                          variant: "text",
                          onClick: ($event) => checkoutDialog.value = false
                        }, {
                          default: withCtx(() => [
                            createTextVNode("Cancel")
                          ]),
                          _: 1
                        }, 8, ["onClick"]),
                        createVNode(VSpacer),
                        createVNode(VBtn, {
                          variant: "flat",
                          color: "primary",
                          size: "large",
                          rounded: "xl",
                          loading: unref(checkingOut),
                          disabled: !unref(canCompleteCheckout),
                          onClick: completeCheckout
                        }, {
                          default: withCtx(() => [
                            createVNode(VIcon, { start: "" }, {
                              default: withCtx(() => [
                                createTextVNode("mdi-check-circle")
                              ]),
                              _: 1
                            }),
                            createTextVNode(" Complete Sale ")
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
            return [
              createVNode(VCard, { rounded: "xl" }, {
                default: withCtx(() => [
                  createVNode(VCardTitle, { class: "text-h6 font-weight-bold d-flex align-center" }, {
                    default: withCtx(() => [
                      createVNode(VIcon, {
                        color: "primary",
                        class: "mr-2"
                      }, {
                        default: withCtx(() => [
                          createTextVNode("mdi-cash-register")
                        ]),
                        _: 1
                      }),
                      createTextVNode(" Complete Payment "),
                      createVNode(VSpacer),
                      createVNode(VChip, {
                        size: "small",
                        variant: "tonal",
                        color: "primary"
                      }, {
                        default: withCtx(() => [
                          createVNode(VIcon, {
                            size: "14",
                            start: ""
                          }, {
                            default: withCtx(() => [
                              createTextVNode(toDisplayString(paymentOptions.find((o) => o.value === unref(pos).paymentMethod)?.icon), 1)
                            ]),
                            _: 1
                          }),
                          createTextVNode(" " + toDisplayString(paymentOptions.find((o) => o.value === unref(pos).paymentMethod)?.label), 1)
                        ]),
                        _: 1
                      })
                    ]),
                    _: 1
                  }),
                  createVNode(VDivider),
                  createVNode(VCardText, { class: "pt-4" }, {
                    default: withCtx(() => [
                      createVNode("div", { class: "checkout-total-banner" }, [
                        createVNode("span", { class: "text-body-2 text-medium-emphasis" }, "Total Due"),
                        createVNode("span", { class: "checkout-total-banner__value" }, toDisplayString(formatMoney(unref(pos).total)), 1),
                        createVNode("div", { class: "checkout-total-banner__method" }, [
                          createVNode(VIcon, { size: "14" }, {
                            default: withCtx(() => [
                              createTextVNode(toDisplayString(paymentOptions.find((o) => o.value === unref(pos).paymentMethod)?.icon), 1)
                            ]),
                            _: 1
                          }),
                          createVNode("span", null, toDisplayString(paymentOptions.find((o) => o.value === unref(pos).paymentMethod)?.label), 1)
                        ])
                      ]),
                      createVNode(VTextField, {
                        modelValue: unref(pos).customerName,
                        "onUpdate:modelValue": ($event) => unref(pos).customerName = $event,
                        label: "Customer",
                        placeholder: "Walk-in customer",
                        density: "comfortable",
                        variant: "outlined",
                        rounded: "lg",
                        "prepend-inner-icon": "mdi-account-outline",
                        clearable: "",
                        class: "mb-2"
                      }, null, 8, ["modelValue", "onUpdate:modelValue"]),
                      createVNode(VTextField, {
                        modelValue: unref(pos).customerPhone,
                        "onUpdate:modelValue": ($event) => unref(pos).customerPhone = $event,
                        label: "Phone",
                        placeholder: "Optional",
                        density: "comfortable",
                        variant: "outlined",
                        rounded: "lg",
                        "prepend-inner-icon": "mdi-phone-outline",
                        class: "mb-2"
                      }, null, 8, ["modelValue", "onUpdate:modelValue"]),
                      unref(pos).paymentMethod === "cash" ? (openBlock(), createBlock(Fragment, { key: 0 }, [
                        createVNode("p", { class: "text-subtitle-2 font-weight-medium mb-2" }, "Cash Received"),
                        createVNode("div", { class: "quick-cash-grid mb-2" }, [
                          (openBlock(true), createBlock(Fragment, null, renderList(unref(quickCashOptions), (amt) => {
                            return openBlock(), createBlock(VBtn, {
                              key: amt,
                              variant: "tonal",
                              size: "small",
                              rounded: "lg",
                              onClick: ($event) => tendered.value = amt
                            }, {
                              default: withCtx(() => [
                                createTextVNode(toDisplayString(formatMoney(amt)), 1)
                              ]),
                              _: 2
                            }, 1032, ["onClick"]);
                          }), 128))
                        ]),
                        createVNode(VTextField, {
                          modelValue: unref(tendered),
                          "onUpdate:modelValue": ($event) => isRef(tendered) ? tendered.value = $event : null,
                          modelModifiers: { number: true },
                          label: "Amount received",
                          density: "comfortable",
                          variant: "outlined",
                          rounded: "lg",
                          type: "number",
                          prefix: unref(currencySymbol),
                          class: "mb-2"
                        }, null, 8, ["modelValue", "onUpdate:modelValue", "prefix"]),
                        createVNode("div", {
                          class: ["change-row", { "change-row--positive": unref(change) > 0 }]
                        }, [
                          createVNode("span", { class: "text-body-2" }, "Change"),
                          createVNode("span", { class: "text-h6 font-weight-bold" }, toDisplayString(formatMoney(Math.max(0, unref(change)))), 1)
                        ], 2)
                      ], 64)) : createCommentVNode("", true),
                      unref(pos).paymentMethod === "mpesa" ? (openBlock(), createBlock(Fragment, { key: 1 }, [
                        createVNode(VTextField, {
                          modelValue: unref(mpesaPhone),
                          "onUpdate:modelValue": ($event) => isRef(mpesaPhone) ? mpesaPhone.value = $event : null,
                          label: "Customer M-Pesa phone (optional)",
                          density: "comfortable",
                          variant: "outlined",
                          rounded: "lg",
                          "prepend-inner-icon": "mdi-cellphone",
                          placeholder: "07XX XXX XXX"
                        }, null, 8, ["modelValue", "onUpdate:modelValue"]),
                        createVNode(VAlert, {
                          type: "info",
                          variant: "tonal",
                          density: "compact",
                          class: "mt-2",
                          rounded: "lg"
                        }, {
                          default: withCtx(() => [
                            createTextVNode(" Confirm payment was received before completing the sale. ")
                          ]),
                          _: 1
                        })
                      ], 64)) : createCommentVNode("", true),
                      unref(pos).paymentMethod === "card" ? (openBlock(), createBlock(VTextField, {
                        key: 2,
                        modelValue: unref(cardRef),
                        "onUpdate:modelValue": ($event) => isRef(cardRef) ? cardRef.value = $event : null,
                        label: "Card reference / last 4 digits",
                        density: "comfortable",
                        variant: "outlined",
                        rounded: "lg",
                        "prepend-inner-icon": "mdi-credit-card-outline",
                        placeholder: "1234"
                      }, null, 8, ["modelValue", "onUpdate:modelValue"])) : createCommentVNode("", true),
                      unref(pos).paymentMethod === "insurance" ? (openBlock(), createBlock(Fragment, { key: 3 }, [
                        createVNode(VTextField, {
                          modelValue: unref(insuranceProvider),
                          "onUpdate:modelValue": ($event) => isRef(insuranceProvider) ? insuranceProvider.value = $event : null,
                          label: "Insurance provider",
                          density: "comfortable",
                          variant: "outlined",
                          rounded: "lg",
                          "prepend-inner-icon": "mdi-shield-account-outline",
                          placeholder: "Provider name"
                        }, null, 8, ["modelValue", "onUpdate:modelValue"]),
                        createVNode(VTextField, {
                          modelValue: unref(insuranceMember),
                          "onUpdate:modelValue": ($event) => isRef(insuranceMember) ? insuranceMember.value = $event : null,
                          label: "Member number",
                          density: "comfortable",
                          variant: "outlined",
                          rounded: "lg",
                          class: "mt-2"
                        }, null, 8, ["modelValue", "onUpdate:modelValue"])
                      ], 64)) : createCommentVNode("", true),
                      unref(pos).paymentMethod === "credit" ? (openBlock(), createBlock(Fragment, { key: 4 }, [
                        createVNode(VTextField, {
                          modelValue: unref(creditDueDate),
                          "onUpdate:modelValue": ($event) => isRef(creditDueDate) ? creditDueDate.value = $event : null,
                          label: "Due date",
                          type: "date",
                          density: "comfortable",
                          variant: "outlined",
                          rounded: "lg",
                          class: "mt-2"
                        }, null, 8, ["modelValue", "onUpdate:modelValue"]),
                        createVNode(VTextField, {
                          modelValue: unref(creditPartial),
                          "onUpdate:modelValue": ($event) => isRef(creditPartial) ? creditPartial.value = $event : null,
                          modelModifiers: { number: true },
                          label: "Partial payment (optional)",
                          density: "comfortable",
                          variant: "outlined",
                          rounded: "lg",
                          class: "mt-2",
                          type: "number",
                          min: "0",
                          prefix: unref(currencySymbol)
                        }, null, 8, ["modelValue", "onUpdate:modelValue", "prefix"]),
                        createVNode(VAlert, {
                          type: "info",
                          variant: "tonal",
                          density: "compact",
                          class: "mt-2",
                          rounded: "lg"
                        }, {
                          default: withCtx(() => [
                            createTextVNode(" Balance on credit: " + toDisplayString(formatMoney(Math.max(0, unref(pos).total - (unref(creditPartial) || 0)))), 1)
                          ]),
                          _: 1
                        })
                      ], 64)) : createCommentVNode("", true)
                    ]),
                    _: 1
                  }),
                  createVNode(VCardActions, { class: "pa-4" }, {
                    default: withCtx(() => [
                      createVNode(VBtn, {
                        variant: "text",
                        onClick: ($event) => checkoutDialog.value = false
                      }, {
                        default: withCtx(() => [
                          createTextVNode("Cancel")
                        ]),
                        _: 1
                      }, 8, ["onClick"]),
                      createVNode(VSpacer),
                      createVNode(VBtn, {
                        variant: "flat",
                        color: "primary",
                        size: "large",
                        rounded: "xl",
                        loading: unref(checkingOut),
                        disabled: !unref(canCompleteCheckout),
                        onClick: completeCheckout
                      }, {
                        default: withCtx(() => [
                          createVNode(VIcon, { start: "" }, {
                            default: withCtx(() => [
                              createTextVNode("mdi-check-circle")
                            ]),
                            _: 1
                          }),
                          createTextVNode(" Complete Sale ")
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
      }, _parent));
      _push(ssrRenderComponent(VDialog, {
        modelValue: unref(holdDialog),
        "onUpdate:modelValue": ($event) => isRef(holdDialog) ? holdDialog.value = $event : null,
        "max-width": "500"
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(ssrRenderComponent(VCard, { rounded: "xl" }, {
              default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                if (_push3) {
                  _push3(ssrRenderComponent(VCardTitle, { class: "text-h6 font-weight-bold" }, {
                    default: withCtx((_3, _push4, _parent4, _scopeId3) => {
                      if (_push4) {
                        _push4(ssrRenderComponent(VIcon, {
                          color: "warning",
                          class: "mr-2"
                        }, {
                          default: withCtx((_4, _push5, _parent5, _scopeId4) => {
                            if (_push5) {
                              _push5(`mdi-pause-circle`);
                            } else {
                              return [
                                createTextVNode("mdi-pause-circle")
                              ];
                            }
                          }),
                          _: 1
                        }, _parent4, _scopeId3));
                        _push4(` Hold Sale `);
                      } else {
                        return [
                          createVNode(VIcon, {
                            color: "warning",
                            class: "mr-2"
                          }, {
                            default: withCtx(() => [
                              createTextVNode("mdi-pause-circle")
                            ]),
                            _: 1
                          }),
                          createTextVNode(" Hold Sale ")
                        ];
                      }
                    }),
                    _: 1
                  }, _parent3, _scopeId2));
                  _push3(ssrRenderComponent(VDivider, null, null, _parent3, _scopeId2));
                  _push3(ssrRenderComponent(VCardText, { class: "pt-4" }, {
                    default: withCtx((_3, _push4, _parent4, _scopeId3) => {
                      if (_push4) {
                        _push4(ssrRenderComponent(VTextField, {
                          modelValue: unref(holdCustomer),
                          "onUpdate:modelValue": ($event) => isRef(holdCustomer) ? holdCustomer.value = $event : null,
                          label: "Customer name",
                          density: "compact",
                          variant: "outlined",
                          rounded: "lg"
                        }, null, _parent4, _scopeId3));
                        _push4(ssrRenderComponent(VTextField, {
                          modelValue: unref(holdPhone),
                          "onUpdate:modelValue": ($event) => isRef(holdPhone) ? holdPhone.value = $event : null,
                          label: "Phone (optional)",
                          density: "compact",
                          variant: "outlined",
                          rounded: "lg",
                          class: "mt-2"
                        }, null, _parent4, _scopeId3));
                        _push4(ssrRenderComponent(VTextarea, {
                          modelValue: unref(holdNotes),
                          "onUpdate:modelValue": ($event) => isRef(holdNotes) ? holdNotes.value = $event : null,
                          label: "Notes (optional)",
                          density: "compact",
                          variant: "outlined",
                          rounded: "lg",
                          class: "mt-2",
                          rows: "2"
                        }, null, _parent4, _scopeId3));
                        _push4(ssrRenderComponent(VAlert, {
                          type: "info",
                          variant: "tonal",
                          class: "mt-2",
                          rounded: "lg"
                        }, {
                          default: withCtx((_4, _push5, _parent5, _scopeId4) => {
                            if (_push5) {
                              _push5(`<div class="d-flex justify-space-between" data-v-43b2f167${_scopeId4}><span data-v-43b2f167${_scopeId4}>Items: ${ssrInterpolate(unref(pos).itemCount)}</span><span data-v-43b2f167${_scopeId4}>Total: ${ssrInterpolate(formatMoney(unref(pos).total))}</span></div>`);
                            } else {
                              return [
                                createVNode("div", { class: "d-flex justify-space-between" }, [
                                  createVNode("span", null, "Items: " + toDisplayString(unref(pos).itemCount), 1),
                                  createVNode("span", null, "Total: " + toDisplayString(formatMoney(unref(pos).total)), 1)
                                ])
                              ];
                            }
                          }),
                          _: 1
                        }, _parent4, _scopeId3));
                      } else {
                        return [
                          createVNode(VTextField, {
                            modelValue: unref(holdCustomer),
                            "onUpdate:modelValue": ($event) => isRef(holdCustomer) ? holdCustomer.value = $event : null,
                            label: "Customer name",
                            density: "compact",
                            variant: "outlined",
                            rounded: "lg"
                          }, null, 8, ["modelValue", "onUpdate:modelValue"]),
                          createVNode(VTextField, {
                            modelValue: unref(holdPhone),
                            "onUpdate:modelValue": ($event) => isRef(holdPhone) ? holdPhone.value = $event : null,
                            label: "Phone (optional)",
                            density: "compact",
                            variant: "outlined",
                            rounded: "lg",
                            class: "mt-2"
                          }, null, 8, ["modelValue", "onUpdate:modelValue"]),
                          createVNode(VTextarea, {
                            modelValue: unref(holdNotes),
                            "onUpdate:modelValue": ($event) => isRef(holdNotes) ? holdNotes.value = $event : null,
                            label: "Notes (optional)",
                            density: "compact",
                            variant: "outlined",
                            rounded: "lg",
                            class: "mt-2",
                            rows: "2"
                          }, null, 8, ["modelValue", "onUpdate:modelValue"]),
                          createVNode(VAlert, {
                            type: "info",
                            variant: "tonal",
                            class: "mt-2",
                            rounded: "lg"
                          }, {
                            default: withCtx(() => [
                              createVNode("div", { class: "d-flex justify-space-between" }, [
                                createVNode("span", null, "Items: " + toDisplayString(unref(pos).itemCount), 1),
                                createVNode("span", null, "Total: " + toDisplayString(formatMoney(unref(pos).total)), 1)
                              ])
                            ]),
                            _: 1
                          })
                        ];
                      }
                    }),
                    _: 1
                  }, _parent3, _scopeId2));
                  _push3(ssrRenderComponent(VCardActions, { class: "pa-4" }, {
                    default: withCtx((_3, _push4, _parent4, _scopeId3) => {
                      if (_push4) {
                        _push4(ssrRenderComponent(VBtn, {
                          variant: "text",
                          onClick: ($event) => holdDialog.value = false
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
                        _push4(ssrRenderComponent(VSpacer, null, null, _parent4, _scopeId3));
                        _push4(ssrRenderComponent(VBtn, {
                          variant: "flat",
                          color: "warning",
                          rounded: "xl",
                          onClick: confirmHold
                        }, {
                          default: withCtx((_4, _push5, _parent5, _scopeId4) => {
                            if (_push5) {
                              _push5(`Hold Sale`);
                            } else {
                              return [
                                createTextVNode("Hold Sale")
                              ];
                            }
                          }),
                          _: 1
                        }, _parent4, _scopeId3));
                      } else {
                        return [
                          createVNode(VBtn, {
                            variant: "text",
                            onClick: ($event) => holdDialog.value = false
                          }, {
                            default: withCtx(() => [
                              createTextVNode("Cancel")
                            ]),
                            _: 1
                          }, 8, ["onClick"]),
                          createVNode(VSpacer),
                          createVNode(VBtn, {
                            variant: "flat",
                            color: "warning",
                            rounded: "xl",
                            onClick: confirmHold
                          }, {
                            default: withCtx(() => [
                              createTextVNode("Hold Sale")
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
                    createVNode(VCardTitle, { class: "text-h6 font-weight-bold" }, {
                      default: withCtx(() => [
                        createVNode(VIcon, {
                          color: "warning",
                          class: "mr-2"
                        }, {
                          default: withCtx(() => [
                            createTextVNode("mdi-pause-circle")
                          ]),
                          _: 1
                        }),
                        createTextVNode(" Hold Sale ")
                      ]),
                      _: 1
                    }),
                    createVNode(VDivider),
                    createVNode(VCardText, { class: "pt-4" }, {
                      default: withCtx(() => [
                        createVNode(VTextField, {
                          modelValue: unref(holdCustomer),
                          "onUpdate:modelValue": ($event) => isRef(holdCustomer) ? holdCustomer.value = $event : null,
                          label: "Customer name",
                          density: "compact",
                          variant: "outlined",
                          rounded: "lg"
                        }, null, 8, ["modelValue", "onUpdate:modelValue"]),
                        createVNode(VTextField, {
                          modelValue: unref(holdPhone),
                          "onUpdate:modelValue": ($event) => isRef(holdPhone) ? holdPhone.value = $event : null,
                          label: "Phone (optional)",
                          density: "compact",
                          variant: "outlined",
                          rounded: "lg",
                          class: "mt-2"
                        }, null, 8, ["modelValue", "onUpdate:modelValue"]),
                        createVNode(VTextarea, {
                          modelValue: unref(holdNotes),
                          "onUpdate:modelValue": ($event) => isRef(holdNotes) ? holdNotes.value = $event : null,
                          label: "Notes (optional)",
                          density: "compact",
                          variant: "outlined",
                          rounded: "lg",
                          class: "mt-2",
                          rows: "2"
                        }, null, 8, ["modelValue", "onUpdate:modelValue"]),
                        createVNode(VAlert, {
                          type: "info",
                          variant: "tonal",
                          class: "mt-2",
                          rounded: "lg"
                        }, {
                          default: withCtx(() => [
                            createVNode("div", { class: "d-flex justify-space-between" }, [
                              createVNode("span", null, "Items: " + toDisplayString(unref(pos).itemCount), 1),
                              createVNode("span", null, "Total: " + toDisplayString(formatMoney(unref(pos).total)), 1)
                            ])
                          ]),
                          _: 1
                        })
                      ]),
                      _: 1
                    }),
                    createVNode(VCardActions, { class: "pa-4" }, {
                      default: withCtx(() => [
                        createVNode(VBtn, {
                          variant: "text",
                          onClick: ($event) => holdDialog.value = false
                        }, {
                          default: withCtx(() => [
                            createTextVNode("Cancel")
                          ]),
                          _: 1
                        }, 8, ["onClick"]),
                        createVNode(VSpacer),
                        createVNode(VBtn, {
                          variant: "flat",
                          color: "warning",
                          rounded: "xl",
                          onClick: confirmHold
                        }, {
                          default: withCtx(() => [
                            createTextVNode("Hold Sale")
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
          } else {
            return [
              createVNode(VCard, { rounded: "xl" }, {
                default: withCtx(() => [
                  createVNode(VCardTitle, { class: "text-h6 font-weight-bold" }, {
                    default: withCtx(() => [
                      createVNode(VIcon, {
                        color: "warning",
                        class: "mr-2"
                      }, {
                        default: withCtx(() => [
                          createTextVNode("mdi-pause-circle")
                        ]),
                        _: 1
                      }),
                      createTextVNode(" Hold Sale ")
                    ]),
                    _: 1
                  }),
                  createVNode(VDivider),
                  createVNode(VCardText, { class: "pt-4" }, {
                    default: withCtx(() => [
                      createVNode(VTextField, {
                        modelValue: unref(holdCustomer),
                        "onUpdate:modelValue": ($event) => isRef(holdCustomer) ? holdCustomer.value = $event : null,
                        label: "Customer name",
                        density: "compact",
                        variant: "outlined",
                        rounded: "lg"
                      }, null, 8, ["modelValue", "onUpdate:modelValue"]),
                      createVNode(VTextField, {
                        modelValue: unref(holdPhone),
                        "onUpdate:modelValue": ($event) => isRef(holdPhone) ? holdPhone.value = $event : null,
                        label: "Phone (optional)",
                        density: "compact",
                        variant: "outlined",
                        rounded: "lg",
                        class: "mt-2"
                      }, null, 8, ["modelValue", "onUpdate:modelValue"]),
                      createVNode(VTextarea, {
                        modelValue: unref(holdNotes),
                        "onUpdate:modelValue": ($event) => isRef(holdNotes) ? holdNotes.value = $event : null,
                        label: "Notes (optional)",
                        density: "compact",
                        variant: "outlined",
                        rounded: "lg",
                        class: "mt-2",
                        rows: "2"
                      }, null, 8, ["modelValue", "onUpdate:modelValue"]),
                      createVNode(VAlert, {
                        type: "info",
                        variant: "tonal",
                        class: "mt-2",
                        rounded: "lg"
                      }, {
                        default: withCtx(() => [
                          createVNode("div", { class: "d-flex justify-space-between" }, [
                            createVNode("span", null, "Items: " + toDisplayString(unref(pos).itemCount), 1),
                            createVNode("span", null, "Total: " + toDisplayString(formatMoney(unref(pos).total)), 1)
                          ])
                        ]),
                        _: 1
                      })
                    ]),
                    _: 1
                  }),
                  createVNode(VCardActions, { class: "pa-4" }, {
                    default: withCtx(() => [
                      createVNode(VBtn, {
                        variant: "text",
                        onClick: ($event) => holdDialog.value = false
                      }, {
                        default: withCtx(() => [
                          createTextVNode("Cancel")
                        ]),
                        _: 1
                      }, 8, ["onClick"]),
                      createVNode(VSpacer),
                      createVNode(VBtn, {
                        variant: "flat",
                        color: "warning",
                        rounded: "xl",
                        onClick: confirmHold
                      }, {
                        default: withCtx(() => [
                          createTextVNode("Hold Sale")
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
      }, _parent));
      _push(ssrRenderComponent(VDialog, {
        modelValue: unref(receiptDialog),
        "onUpdate:modelValue": ($event) => isRef(receiptDialog) ? receiptDialog.value = $event : null,
        "max-width": "420"
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(ssrRenderComponent(VCard, { rounded: "xl" }, {
              default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                if (_push3) {
                  _push3(`<div class="receipt-success-header" data-v-43b2f167${_scopeId2}>`);
                  _push3(ssrRenderComponent(VAvatar, {
                    color: "success",
                    size: "64"
                  }, {
                    default: withCtx((_3, _push4, _parent4, _scopeId3) => {
                      if (_push4) {
                        _push4(ssrRenderComponent(VIcon, {
                          size: "32",
                          color: "white"
                        }, {
                          default: withCtx((_4, _push5, _parent5, _scopeId4) => {
                            if (_push5) {
                              _push5(`mdi-check`);
                            } else {
                              return [
                                createTextVNode("mdi-check")
                              ];
                            }
                          }),
                          _: 1
                        }, _parent4, _scopeId3));
                      } else {
                        return [
                          createVNode(VIcon, {
                            size: "32",
                            color: "white"
                          }, {
                            default: withCtx(() => [
                              createTextVNode("mdi-check")
                            ]),
                            _: 1
                          })
                        ];
                      }
                    }),
                    _: 1
                  }, _parent3, _scopeId2));
                  _push3(`<h3 class="text-h6 font-weight-bold mt-2" data-v-43b2f167${_scopeId2}>Sale Completed</h3><p class="text-caption text-medium-emphasis" data-v-43b2f167${_scopeId2}>${ssrInterpolate(unref(lastTransaction)?.transaction_number)}</p></div>`);
                  _push3(ssrRenderComponent(VDivider, null, null, _parent3, _scopeId2));
                  _push3(ssrRenderComponent(VCardText, { class: "pa-0" }, {
                    default: withCtx((_3, _push4, _parent4, _scopeId3) => {
                      if (_push4) {
                        if (unref(lastTransaction)) {
                          _push4(ssrRenderComponent(_component_PosReceipt, {
                            number: unref(lastTransaction).transaction_number,
                            items: unref(lastTransaction).items,
                            subtotal: unref(lastTransaction).subtotal,
                            discount: unref(lastTransaction).discount,
                            "item-discounts": 0,
                            tax: unref(lastTransaction).tax,
                            total: unref(lastTransaction).total,
                            "payment-method": unref(lastTransaction).payment_method,
                            tendered: unref(lastTransaction).tendered,
                            change: unref(lastTransaction).change,
                            "cashier-name": unref(auth).fullName,
                            "customer-name": unref(lastTransaction).customer_name,
                            "customer-phone": unref(lastTransaction).customer_phone,
                            "branch-name": unref(pos).branchName
                          }, null, _parent4, _scopeId3));
                        } else {
                          _push4(`<!---->`);
                        }
                      } else {
                        return [
                          unref(lastTransaction) ? (openBlock(), createBlock(_component_PosReceipt, {
                            key: 0,
                            number: unref(lastTransaction).transaction_number,
                            items: unref(lastTransaction).items,
                            subtotal: unref(lastTransaction).subtotal,
                            discount: unref(lastTransaction).discount,
                            "item-discounts": 0,
                            tax: unref(lastTransaction).tax,
                            total: unref(lastTransaction).total,
                            "payment-method": unref(lastTransaction).payment_method,
                            tendered: unref(lastTransaction).tendered,
                            change: unref(lastTransaction).change,
                            "cashier-name": unref(auth).fullName,
                            "customer-name": unref(lastTransaction).customer_name,
                            "customer-phone": unref(lastTransaction).customer_phone,
                            "branch-name": unref(pos).branchName
                          }, null, 8, ["number", "items", "subtotal", "discount", "tax", "total", "payment-method", "tendered", "change", "cashier-name", "customer-name", "customer-phone", "branch-name"])) : createCommentVNode("", true)
                        ];
                      }
                    }),
                    _: 1
                  }, _parent3, _scopeId2));
                  _push3(ssrRenderComponent(VDivider, null, null, _parent3, _scopeId2));
                  _push3(ssrRenderComponent(VCardActions, { class: "pa-4" }, {
                    default: withCtx((_3, _push4, _parent4, _scopeId3) => {
                      if (_push4) {
                        _push4(ssrRenderComponent(VBtn, {
                          variant: "tonal",
                          rounded: "xl",
                          "prepend-icon": "mdi-printer",
                          loading: unref(printing),
                          onClick: printReceipt
                        }, {
                          default: withCtx((_4, _push5, _parent5, _scopeId4) => {
                            if (_push5) {
                              _push5(`Print`);
                            } else {
                              return [
                                createTextVNode("Print")
                              ];
                            }
                          }),
                          _: 1
                        }, _parent4, _scopeId3));
                        _push4(ssrRenderComponent(VBtn, {
                          variant: "tonal",
                          rounded: "xl",
                          "prepend-icon": "mdi-printer-pos",
                          onClick: connectPrinter
                        }, {
                          default: withCtx((_4, _push5, _parent5, _scopeId4) => {
                            if (_push5) {
                              _push5(`${ssrInterpolate(unref(printerConnected) ? "Connected" : "Thermal")}`);
                            } else {
                              return [
                                createTextVNode(toDisplayString(unref(printerConnected) ? "Connected" : "Thermal"), 1)
                              ];
                            }
                          }),
                          _: 1
                        }, _parent4, _scopeId3));
                        _push4(ssrRenderComponent(VSpacer, null, null, _parent4, _scopeId3));
                        _push4(ssrRenderComponent(VBtn, {
                          variant: "flat",
                          color: "primary",
                          rounded: "xl",
                          onClick: newSale
                        }, {
                          default: withCtx((_4, _push5, _parent5, _scopeId4) => {
                            if (_push5) {
                              _push5(`New Sale`);
                            } else {
                              return [
                                createTextVNode("New Sale")
                              ];
                            }
                          }),
                          _: 1
                        }, _parent4, _scopeId3));
                      } else {
                        return [
                          createVNode(VBtn, {
                            variant: "tonal",
                            rounded: "xl",
                            "prepend-icon": "mdi-printer",
                            loading: unref(printing),
                            onClick: printReceipt
                          }, {
                            default: withCtx(() => [
                              createTextVNode("Print")
                            ]),
                            _: 1
                          }, 8, ["loading"]),
                          createVNode(VBtn, {
                            variant: "tonal",
                            rounded: "xl",
                            "prepend-icon": "mdi-printer-pos",
                            onClick: connectPrinter
                          }, {
                            default: withCtx(() => [
                              createTextVNode(toDisplayString(unref(printerConnected) ? "Connected" : "Thermal"), 1)
                            ]),
                            _: 1
                          }),
                          createVNode(VSpacer),
                          createVNode(VBtn, {
                            variant: "flat",
                            color: "primary",
                            rounded: "xl",
                            onClick: newSale
                          }, {
                            default: withCtx(() => [
                              createTextVNode("New Sale")
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
                    createVNode("div", { class: "receipt-success-header" }, [
                      createVNode(VAvatar, {
                        color: "success",
                        size: "64"
                      }, {
                        default: withCtx(() => [
                          createVNode(VIcon, {
                            size: "32",
                            color: "white"
                          }, {
                            default: withCtx(() => [
                              createTextVNode("mdi-check")
                            ]),
                            _: 1
                          })
                        ]),
                        _: 1
                      }),
                      createVNode("h3", { class: "text-h6 font-weight-bold mt-2" }, "Sale Completed"),
                      createVNode("p", { class: "text-caption text-medium-emphasis" }, toDisplayString(unref(lastTransaction)?.transaction_number), 1)
                    ]),
                    createVNode(VDivider),
                    createVNode(VCardText, { class: "pa-0" }, {
                      default: withCtx(() => [
                        unref(lastTransaction) ? (openBlock(), createBlock(_component_PosReceipt, {
                          key: 0,
                          number: unref(lastTransaction).transaction_number,
                          items: unref(lastTransaction).items,
                          subtotal: unref(lastTransaction).subtotal,
                          discount: unref(lastTransaction).discount,
                          "item-discounts": 0,
                          tax: unref(lastTransaction).tax,
                          total: unref(lastTransaction).total,
                          "payment-method": unref(lastTransaction).payment_method,
                          tendered: unref(lastTransaction).tendered,
                          change: unref(lastTransaction).change,
                          "cashier-name": unref(auth).fullName,
                          "customer-name": unref(lastTransaction).customer_name,
                          "customer-phone": unref(lastTransaction).customer_phone,
                          "branch-name": unref(pos).branchName
                        }, null, 8, ["number", "items", "subtotal", "discount", "tax", "total", "payment-method", "tendered", "change", "cashier-name", "customer-name", "customer-phone", "branch-name"])) : createCommentVNode("", true)
                      ]),
                      _: 1
                    }),
                    createVNode(VDivider),
                    createVNode(VCardActions, { class: "pa-4" }, {
                      default: withCtx(() => [
                        createVNode(VBtn, {
                          variant: "tonal",
                          rounded: "xl",
                          "prepend-icon": "mdi-printer",
                          loading: unref(printing),
                          onClick: printReceipt
                        }, {
                          default: withCtx(() => [
                            createTextVNode("Print")
                          ]),
                          _: 1
                        }, 8, ["loading"]),
                        createVNode(VBtn, {
                          variant: "tonal",
                          rounded: "xl",
                          "prepend-icon": "mdi-printer-pos",
                          onClick: connectPrinter
                        }, {
                          default: withCtx(() => [
                            createTextVNode(toDisplayString(unref(printerConnected) ? "Connected" : "Thermal"), 1)
                          ]),
                          _: 1
                        }),
                        createVNode(VSpacer),
                        createVNode(VBtn, {
                          variant: "flat",
                          color: "primary",
                          rounded: "xl",
                          onClick: newSale
                        }, {
                          default: withCtx(() => [
                            createTextVNode("New Sale")
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
          } else {
            return [
              createVNode(VCard, { rounded: "xl" }, {
                default: withCtx(() => [
                  createVNode("div", { class: "receipt-success-header" }, [
                    createVNode(VAvatar, {
                      color: "success",
                      size: "64"
                    }, {
                      default: withCtx(() => [
                        createVNode(VIcon, {
                          size: "32",
                          color: "white"
                        }, {
                          default: withCtx(() => [
                            createTextVNode("mdi-check")
                          ]),
                          _: 1
                        })
                      ]),
                      _: 1
                    }),
                    createVNode("h3", { class: "text-h6 font-weight-bold mt-2" }, "Sale Completed"),
                    createVNode("p", { class: "text-caption text-medium-emphasis" }, toDisplayString(unref(lastTransaction)?.transaction_number), 1)
                  ]),
                  createVNode(VDivider),
                  createVNode(VCardText, { class: "pa-0" }, {
                    default: withCtx(() => [
                      unref(lastTransaction) ? (openBlock(), createBlock(_component_PosReceipt, {
                        key: 0,
                        number: unref(lastTransaction).transaction_number,
                        items: unref(lastTransaction).items,
                        subtotal: unref(lastTransaction).subtotal,
                        discount: unref(lastTransaction).discount,
                        "item-discounts": 0,
                        tax: unref(lastTransaction).tax,
                        total: unref(lastTransaction).total,
                        "payment-method": unref(lastTransaction).payment_method,
                        tendered: unref(lastTransaction).tendered,
                        change: unref(lastTransaction).change,
                        "cashier-name": unref(auth).fullName,
                        "customer-name": unref(lastTransaction).customer_name,
                        "customer-phone": unref(lastTransaction).customer_phone,
                        "branch-name": unref(pos).branchName
                      }, null, 8, ["number", "items", "subtotal", "discount", "tax", "total", "payment-method", "tendered", "change", "cashier-name", "customer-name", "customer-phone", "branch-name"])) : createCommentVNode("", true)
                    ]),
                    _: 1
                  }),
                  createVNode(VDivider),
                  createVNode(VCardActions, { class: "pa-4" }, {
                    default: withCtx(() => [
                      createVNode(VBtn, {
                        variant: "tonal",
                        rounded: "xl",
                        "prepend-icon": "mdi-printer",
                        loading: unref(printing),
                        onClick: printReceipt
                      }, {
                        default: withCtx(() => [
                          createTextVNode("Print")
                        ]),
                        _: 1
                      }, 8, ["loading"]),
                      createVNode(VBtn, {
                        variant: "tonal",
                        rounded: "xl",
                        "prepend-icon": "mdi-printer-pos",
                        onClick: connectPrinter
                      }, {
                        default: withCtx(() => [
                          createTextVNode(toDisplayString(unref(printerConnected) ? "Connected" : "Thermal"), 1)
                        ]),
                        _: 1
                      }),
                      createVNode(VSpacer),
                      createVNode(VBtn, {
                        variant: "flat",
                        color: "primary",
                        rounded: "xl",
                        onClick: newSale
                      }, {
                        default: withCtx(() => [
                          createTextVNode("New Sale")
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
      }, _parent));
      _push(`</div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/pos/smartpos.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const smartpos = /* @__PURE__ */ _export_sfc(_sfc_main, [["__scopeId", "data-v-43b2f167"]]);
export {
  smartpos as default
};
//# sourceMappingURL=smartpos-DYUccr_f.js.map
