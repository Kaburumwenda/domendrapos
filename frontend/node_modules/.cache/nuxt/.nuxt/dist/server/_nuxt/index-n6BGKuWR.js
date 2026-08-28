import { u as usePosStore, _ as __nuxt_component_0 } from "./pos-D7JNQgAI.js";
import { defineComponent, ref, computed, watch, mergeProps, withCtx, createTextVNode, unref, toDisplayString, createVNode, isRef, openBlock, createBlock, Fragment, renderList, createCommentVNode, useSSRContext } from "vue";
import { ssrRenderAttrs, ssrRenderComponent, ssrInterpolate, ssrRenderList, ssrRenderClass, ssrIncludeBooleanAttr, ssrRenderAttr } from "vue/server-renderer";
import { u as useBranchStore } from "./branch-CYAnxNUU.js";
import { a as useAuthStore, u as useApi } from "./useApi-D4YG8JPQ.js";
import { u as useFormat } from "./useFormat-BvVWDMYe.js";
import { D as useToast, a as VIcon, b as VSpacer, c as VBtn, o as VChip, j as VBadge, J as VSelect, v as VTextField, W as VBtnToggle, p as VProgressLinear, ae as VImg, a0 as VPagination, k as VDivider, q as VDialog, g as VCard, r as VCardTitle, s as VCardText, af as VAutocomplete, d as VAlert, w as VCardActions, $ as VTextarea, H as VAvatar, _ as _export_sfc } from "../server.mjs";
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
  __name: "index",
  __ssrInlineRender: true,
  setup(__props) {
    const pos = usePosStore();
    const branchStore = useBranchStore();
    const auth = useAuthStore();
    const { currency, datetime } = useFormat();
    const toast = useToast();
    const format = useFormat();
    const escpos = useEscPos();
    const printing = ref(false);
    const printerConnected = computed(() => escpos.connected.value);
    watch(() => pos.$state, () => pos.syncPersist(), { deep: true });
    const currencySymbol = computed(() => auth.currencySymbol);
    const cashierShort = computed(() => {
      const name = auth.fullName;
      return name ? name.split(" ")[0].toUpperCase() : "—";
    });
    const today = (/* @__PURE__ */ new Date()).toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "short", year: "numeric" });
    function formatMoney(v) {
      return currency(Number(v || 0));
    }
    const branches = computed(() => branchStore.activeBranches);
    const branchOptions = computed(() => branches.value);
    function syncPosBranchFromGlobal() {
      if (branchStore.branchId && branchStore.branchId !== pos.branchId) {
        pos.setBranch(branchStore.branchId, branchStore.branchName);
      }
    }
    watch(() => branchStore.branchId, (id) => {
      if (id && id !== pos.branchId) {
        pos.setBranch(id, branchStore.branchName);
        loadProducts();
        loadShift();
      }
    });
    async function loadBranches() {
      await branchStore.init();
      syncPosBranchFromGlobal();
      if (branches.value.length > 0 && !pos.branchId) {
        const hq = branches.value.find((b) => b.is_headquarters) || branches.value[0];
        pos.setBranch(hq.id, hq.name);
        branchStore.setBranch(hq.id, hq.name);
      }
    }
    function onBranchChange() {
      const br = branches.value.find((b) => b.id === pos.branchId);
      const name = br?.name || "";
      pos.setBranch(pos.branchId, name);
      branchStore.setBranch(pos.branchId, name);
      loadProducts();
      loadShift();
    }
    const products = ref([]);
    const loading = ref(false);
    const search = ref("");
    const activeCat = ref(null);
    const viewMode = ref("grid");
    const page = ref(1);
    const pageSize = ref(24);
    const categories = computed(() => {
      const map = /* @__PURE__ */ new Map();
      for (const p of products.value) {
        const cat = p.category_name || "Uncategorized";
        map.set(cat, (map.get(cat) || 0) + 1);
      }
      return Array.from(map.entries()).map(([name]) => ({ id: name, name }));
    });
    const categoryOptions = computed(() => [
      { label: "All categories", value: null },
      ...categories.value.map((c) => ({ label: c.name, value: c.id }))
    ]);
    const filtered = computed(() => {
      let list = products.value.filter((p) => p.is_active !== false && p.is_sellable !== false);
      if (activeCat.value) {
        list = list.filter((p) => (p.category_name || "Uncategorized") === activeCat.value);
      }
      if (search.value) {
        const s = search.value.toLowerCase();
        list = list.filter(
          (p) => (p.name || "").toLowerCase().includes(s) || (p.sku || "").toLowerCase().includes(s) || (p.barcode || "").toLowerCase().includes(s)
        );
      }
      return list;
    });
    const pageCount = computed(() => Math.max(1, Math.ceil(filtered.value.length / pageSize.value)));
    const paginated = computed(() => {
      const start = (page.value - 1) * pageSize.value;
      return filtered.value.slice(start, start + pageSize.value);
    });
    const rangeLabel = computed(() => {
      if (filtered.value.length === 0) return "0 of 0";
      const start = (page.value - 1) * pageSize.value + 1;
      const end = Math.min(page.value * pageSize.value, filtered.value.length);
      return `${start}–${end} of ${filtered.value.length}`;
    });
    let searchTimer = null;
    function onSearch() {
      clearTimeout(searchTimer);
      searchTimer = setTimeout(() => {
        page.value = 1;
      }, 300);
    }
    function nameOf(p) {
      return p.name || "Unnamed";
    }
    function stockOf(p) {
      return Number(p.quantity_on_hand ?? p.total_quantity ?? 0);
    }
    function ipu(p) {
      return Number(p.items_per_unit || 1);
    }
    function unitLabel(p) {
      const u = (p.unit || "").trim();
      return u && u !== "each" ? u : "";
    }
    function pieceStock(p) {
      const n = ipu(p);
      return n > 1 ? ` (${Math.floor(stockOf(p) * n)} pcs)` : "";
    }
    function piecePrice(p) {
      const n = ipu(p);
      const unitPrice = Number(p.retail_price || 0);
      return n > 1 ? unitPrice / n : unitPrice;
    }
    function stockLevel(p) {
      const s = stockOf(p);
      if (s <= 0) return "out";
      if (Number(p.reorder_level) > 0 && s <= Number(p.reorder_level)) return "low";
      return "ok";
    }
    function addToCart(p) {
      if (stockOf(p) <= 0) {
        toast.error("Item is out of stock");
        return;
      }
      const ok = pos.addToCart(p);
      if (!ok) {
        toast.warning("No more stock available");
      }
    }
    function quickAddByBarcode() {
      if (!search.value) return;
      const match = products.value.find(
        (p) => p.barcode && p.barcode.toLowerCase() === search.value.toLowerCase()
      );
      if (match) {
        addToCart(match);
        search.value = "";
      }
    }
    async function loadProducts() {
      loading.value = true;
      try {
        const params = new URLSearchParams({ page_size: "5000", is_active: "true", is_sellable: "true", ordering: "name" });
        const data = await useApi()(`/products/?${params}`);
        products.value = data.results || data;
      } catch {
        toast.error("Failed to load products");
      } finally {
        loading.value = false;
      }
    }
    const customers = ref([]);
    const customerList = computed(() => [{ full_name: "Walk-in", phone: "", id: null }, ...customers.value]);
    function onCustomerSelect(name) {
      if (!name) {
        pos.customerName = "";
        return;
      }
      const c = customers.value.find((c2) => c2.full_name === name);
      if (c) {
        pos.customerName = c.full_name;
        pos.customerPhone = c.phone || "";
      } else {
        pos.customerName = name;
      }
    }
    const paymentOptions = [
      { value: "cash", label: "Cash", icon: "mdi-cash" },
      { value: "mpesa", label: "M-Pesa", icon: "mdi-cellphone" },
      { value: "card", label: "Card", icon: "mdi-credit-card" },
      { value: "insurance", label: "Insurance", icon: "mdi-shield-account" },
      { value: "credit", label: "Credit", icon: "mdi-account-cash" }
    ];
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
    function startCheckout() {
      if (pos.isEmpty) return;
      tendered.value = 0;
      mpesaPhone.value = pos.customerPhone || "";
      cardRef.value = "";
      insuranceProvider.value = "";
      insuranceMember.value = "";
      creditDueDate.value = "";
      creditPartial.value = 0;
      checkoutDialog.value = true;
    }
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
    const resumeDialog = ref(false);
    const resumeData = ref(null);
    function doResume() {
      if (!resumeData.value) return;
      pos.resumeFromParked(resumeData.value.items_data, resumeData.value.customer_name, resumeData.value.customer_phone);
      resumeDialog.value = false;
      if (resumeData.value.id) {
        useApi()(`/pos/parked-sales/${resumeData.value.id}/`, { method: "DELETE" }).catch(() => {
        });
      }
      toast.success("Parked sale resumed");
      loadParkedCount();
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
    const shiftDialog = ref(false);
    const shiftOpeningFloat = ref(0);
    const openingShift = ref(false);
    async function loadShift() {
      try {
        const data = await useApi()("/pos/shifts/current/");
        shift.value = data;
      } catch {
        shift.value = null;
      }
    }
    async function openShift() {
      openingShift.value = true;
      try {
        const data = await useApi()("/pos/shifts/", {
          method: "POST",
          body: {
            branch: pos.branchId,
            opening_float: shiftOpeningFloat.value
          }
        });
        shift.value = data;
        shiftDialog.value = false;
        shiftOpeningFloat.value = 0;
        toast.success("Shift opened");
      } catch (e) {
        toast.error(e?.data?.detail || "Failed to open shift");
      } finally {
        openingShift.value = false;
      }
    }
    const searchRef = ref();
    return (_ctx, _push, _parent, _attrs) => {
      const _component_PosReceipt = __nuxt_component_0;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "pos-shell" }, _attrs))} data-v-e4f0800e><div class="pos-topbar" data-v-e4f0800e>`);
      _push(ssrRenderComponent(VIcon, {
        size: "26",
        color: "primary",
        class: "mr-2"
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`mdi-cart-variant`);
          } else {
            return [
              createTextVNode("mdi-cart-variant")
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`<div data-v-e4f0800e><div class="text-subtitle-1 font-weight-bold" data-v-e4f0800e> Point of Sale<span class="text-caption text-medium-emphasis font-weight-regular" data-v-e4f0800e>· Walk-in / OTC sales</span></div><div class="text-caption text-medium-emphasis" data-v-e4f0800e>${ssrInterpolate(unref(today))} · Cashier: ${ssrInterpolate(unref(cashierShort))}</div></div>`);
      _push(ssrRenderComponent(VSpacer, null, null, _parent));
      _push(ssrRenderComponent(VBtn, {
        to: "/pos/smartpos",
        variant: "flat",
        color: "primary",
        rounded: "lg",
        "prepend-icon": "mdi-barcode-scan",
        class: "text-none d-none d-md-flex"
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(` Smart POS `);
          } else {
            return [
              createTextVNode(" Smart POS ")
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(ssrRenderComponent(VChip, {
        variant: "tonal",
        color: "info",
        size: "default",
        class: "mr-2 d-none d-sm-flex"
      }, {
        prepend: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(ssrRenderComponent(VIcon, { size: "18" }, {
              default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                if (_push3) {
                  _push3(`mdi-calendar-check-outline`);
                } else {
                  return [
                    createTextVNode("mdi-calendar-check-outline")
                  ];
                }
              }),
              _: 1
            }, _parent2, _scopeId));
          } else {
            return [
              createVNode(VIcon, { size: "18" }, {
                default: withCtx(() => [
                  createTextVNode("mdi-calendar-check-outline")
                ]),
                _: 1
              })
            ];
          }
        }),
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(` Today: ${ssrInterpolate(unref(todayStats).count)} · ${ssrInterpolate(formatMoney(unref(todayStats).revenue))}`);
          } else {
            return [
              createTextVNode(" Today: " + toDisplayString(unref(todayStats).count) + " · " + toDisplayString(formatMoney(unref(todayStats).revenue)), 1)
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(ssrRenderComponent(VBtn, {
        to: "/customers",
        variant: "text",
        rounded: "lg",
        "prepend-icon": "mdi-account-multiple-outline",
        class: "text-none"
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`Customers`);
          } else {
            return [
              createTextVNode("Customers")
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(ssrRenderComponent(VBtn, {
        to: "/pos/history",
        variant: "text",
        rounded: "lg",
        "prepend-icon": "mdi-receipt-text-outline",
        class: "text-none d-none d-sm-flex"
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`Sales History`);
          } else {
            return [
              createTextVNode("Sales History")
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(ssrRenderComponent(VBadge, {
        content: unref(parkedCount),
        color: "warning",
        overlap: ""
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(ssrRenderComponent(VBtn, {
              to: "/pos/parked",
              variant: "text",
              rounded: "lg",
              "prepend-icon": "mdi-pause-circle-outline",
              class: "text-none",
              title: "Sales on hold"
            }, {
              default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                if (_push3) {
                  _push3(`Hold`);
                } else {
                  return [
                    createTextVNode("Hold")
                  ];
                }
              }),
              _: 1
            }, _parent2, _scopeId));
          } else {
            return [
              createVNode(VBtn, {
                to: "/pos/parked",
                variant: "text",
                rounded: "lg",
                "prepend-icon": "mdi-pause-circle-outline",
                class: "text-none",
                title: "Sales on hold"
              }, {
                default: withCtx(() => [
                  createTextVNode("Hold")
                ]),
                _: 1
              })
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(ssrRenderComponent(VBtn, {
        to: "/pos/shifts",
        variant: "text",
        rounded: "lg",
        "prepend-icon": "mdi-account-clock-outline",
        class: "text-none",
        title: "Cashier shifts"
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`Shifts`);
          } else {
            return [
              createTextVNode("Shifts")
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(ssrRenderComponent(VSelect, {
        modelValue: unref(pos).branchId,
        "onUpdate:modelValue": [($event) => unref(pos).branchId = $event, onBranchChange],
        items: unref(branchOptions),
        "item-title": "name",
        "item-value": "id",
        variant: "outlined",
        density: "compact",
        "hide-details": "",
        rounded: "lg",
        "prepend-inner-icon": "mdi-store-outline",
        class: "topbar-branch"
      }, null, _parent));
      _push(`</div><div class="pos-grid" data-v-e4f0800e><section class="pos-products" data-v-e4f0800e><div class="pos-search-bar" data-v-e4f0800e>`);
      _push(ssrRenderComponent(VTextField, {
        ref_key: "searchRef",
        ref: searchRef,
        modelValue: unref(search),
        "onUpdate:modelValue": [($event) => isRef(search) ? search.value = $event : null, onSearch],
        "prepend-inner-icon": "mdi-magnify",
        placeholder: "Search products by name or SKU…",
        density: "compact",
        variant: "outlined",
        "hide-details": "",
        rounded: "lg",
        class: "flex-grow-1",
        clearable: "",
        onKeyup: quickAddByBarcode
      }, null, _parent));
      _push(ssrRenderComponent(VSelect, {
        modelValue: unref(activeCat),
        "onUpdate:modelValue": ($event) => isRef(activeCat) ? activeCat.value = $event : null,
        items: unref(categoryOptions),
        "item-title": "label",
        "item-value": "value",
        density: "compact",
        variant: "outlined",
        "hide-details": "",
        rounded: "lg",
        "prepend-inner-icon": "mdi-filter-variant",
        class: "pos-cat-select"
      }, null, _parent));
      _push(ssrRenderComponent(VBtnToggle, {
        modelValue: unref(viewMode),
        "onUpdate:modelValue": ($event) => isRef(viewMode) ? viewMode.value = $event : null,
        density: "compact",
        variant: "outlined",
        mandatory: "",
        divided: "",
        rounded: "lg"
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(ssrRenderComponent(VBtn, {
              value: "grid",
              size: "small",
              "aria-label": "Grid view"
            }, {
              default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                if (_push3) {
                  _push3(ssrRenderComponent(VIcon, null, {
                    default: withCtx((_3, _push4, _parent4, _scopeId3) => {
                      if (_push4) {
                        _push4(`mdi-view-grid-outline`);
                      } else {
                        return [
                          createTextVNode("mdi-view-grid-outline")
                        ];
                      }
                    }),
                    _: 1
                  }, _parent3, _scopeId2));
                } else {
                  return [
                    createVNode(VIcon, null, {
                      default: withCtx(() => [
                        createTextVNode("mdi-view-grid-outline")
                      ]),
                      _: 1
                    })
                  ];
                }
              }),
              _: 1
            }, _parent2, _scopeId));
            _push2(ssrRenderComponent(VBtn, {
              value: "list",
              size: "small",
              "aria-label": "List view"
            }, {
              default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                if (_push3) {
                  _push3(ssrRenderComponent(VIcon, null, {
                    default: withCtx((_3, _push4, _parent4, _scopeId3) => {
                      if (_push4) {
                        _push4(`mdi-view-list-outline`);
                      } else {
                        return [
                          createTextVNode("mdi-view-list-outline")
                        ];
                      }
                    }),
                    _: 1
                  }, _parent3, _scopeId2));
                } else {
                  return [
                    createVNode(VIcon, null, {
                      default: withCtx(() => [
                        createTextVNode("mdi-view-list-outline")
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
              createVNode(VBtn, {
                value: "grid",
                size: "small",
                "aria-label": "Grid view"
              }, {
                default: withCtx(() => [
                  createVNode(VIcon, null, {
                    default: withCtx(() => [
                      createTextVNode("mdi-view-grid-outline")
                    ]),
                    _: 1
                  })
                ]),
                _: 1
              }),
              createVNode(VBtn, {
                value: "list",
                size: "small",
                "aria-label": "List view"
              }, {
                default: withCtx(() => [
                  createVNode(VIcon, null, {
                    default: withCtx(() => [
                      createTextVNode("mdi-view-list-outline")
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
      if (unref(loading)) {
        _push(ssrRenderComponent(VProgressLinear, {
          indeterminate: "",
          color: "primary",
          height: "2"
        }, null, _parent));
      } else {
        _push(`<!---->`);
      }
      if (!unref(loading)) {
        _push(`<div class="pos-products-scroll" data-v-e4f0800e>`);
        if (unref(filtered).length === 0) {
          _push(`<div class="pos-products-empty" data-v-e4f0800e>`);
          _push(ssrRenderComponent(VIcon, {
            size: "48",
            color: "grey-lighten-1"
          }, {
            default: withCtx((_, _push2, _parent2, _scopeId) => {
              if (_push2) {
                _push2(`mdi-package-variant-remove`);
              } else {
                return [
                  createTextVNode("mdi-package-variant-remove")
                ];
              }
            }),
            _: 1
          }, _parent));
          _push(`<p class="mt-2 text-body-1 font-weight-medium" data-v-e4f0800e>No products found</p><p class="text-caption text-medium-emphasis" data-v-e4f0800e>Try a different search or category.</p></div>`);
        } else if (unref(viewMode) === "grid") {
          _push(`<div class="pos-product-grid" data-v-e4f0800e><!--[-->`);
          ssrRenderList(unref(paginated), (p) => {
            _push(`<button type="button" class="${ssrRenderClass([{ "is-out": stockOf(p) <= 0, "is-list": false }, "pos-product-card"])}"${ssrIncludeBooleanAttr(stockOf(p) <= 0) ? " disabled" : ""} data-v-e4f0800e><div class="pos-product-thumb" data-v-e4f0800e>`);
            if (p.image) {
              _push(ssrRenderComponent(VImg, {
                src: p.image,
                cover: "",
                class: "pos-product-img"
              }, null, _parent));
            } else {
              _push(ssrRenderComponent(VIcon, {
                size: "36",
                color: "primary"
              }, {
                default: withCtx((_, _push2, _parent2, _scopeId) => {
                  if (_push2) {
                    _push2(`mdi-cart-variant`);
                  } else {
                    return [
                      createTextVNode("mdi-cart-variant")
                    ];
                  }
                }),
                _: 2
              }, _parent));
            }
            if (stockLevel(p) !== "ok") {
              _push(`<span class="${ssrRenderClass([stockLevel(p) === "out" ? "bg-error" : "bg-warning", "pos-stock-badge"])}" data-v-e4f0800e>${ssrInterpolate(stockLevel(p) === "out" ? "Out" : "Low")}</span>`);
            } else {
              _push(`<!---->`);
            }
            _push(`</div><div class="pos-product-body" data-v-e4f0800e><div class="pos-product-name" data-v-e4f0800e>${ssrInterpolate(nameOf(p))}</div><div class="pos-product-meta" data-v-e4f0800e><span class="text-caption text-medium-emphasis" data-v-e4f0800e>Stock: ${ssrInterpolate(stockOf(p))} ${ssrInterpolate(unitLabel(p))}${ssrInterpolate(pieceStock(p))}</span></div></div><div class="pos-product-price" data-v-e4f0800e>${ssrInterpolate(formatMoney(piecePrice(p)))}`);
            if (Number(p.items_per_unit) > 1) {
              _push(`<!--[--> / piece<!--]-->`);
            } else {
              _push(`<!---->`);
            }
            _push(`</div></button>`);
          });
          _push(`<!--]--></div>`);
        } else {
          _push(`<div class="pos-product-grid pos-product-grid--list" data-v-e4f0800e><!--[-->`);
          ssrRenderList(unref(paginated), (p) => {
            _push(`<button type="button" class="${ssrRenderClass([{ "is-out": stockOf(p) <= 0 }, "pos-product-card is-list"])}"${ssrIncludeBooleanAttr(stockOf(p) <= 0) ? " disabled" : ""} data-v-e4f0800e><div class="pos-product-thumb" data-v-e4f0800e>`);
            if (p.image) {
              _push(ssrRenderComponent(VImg, {
                src: p.image,
                cover: "",
                class: "pos-product-img"
              }, null, _parent));
            } else {
              _push(ssrRenderComponent(VIcon, {
                size: "26",
                color: "primary"
              }, {
                default: withCtx((_, _push2, _parent2, _scopeId) => {
                  if (_push2) {
                    _push2(`mdi-cart-variant`);
                  } else {
                    return [
                      createTextVNode("mdi-cart-variant")
                    ];
                  }
                }),
                _: 2
              }, _parent));
            }
            if (stockLevel(p) !== "ok") {
              _push(`<span class="${ssrRenderClass([stockLevel(p) === "out" ? "bg-error" : "bg-warning", "pos-stock-badge"])}" data-v-e4f0800e>${ssrInterpolate(stockLevel(p) === "out" ? "Out" : "Low")}</span>`);
            } else {
              _push(`<!---->`);
            }
            _push(`</div><div class="pos-product-body" data-v-e4f0800e><div class="pos-product-name" data-v-e4f0800e>${ssrInterpolate(nameOf(p))}</div><div class="pos-product-meta" data-v-e4f0800e><span class="text-caption text-medium-emphasis" data-v-e4f0800e>${ssrInterpolate(p.sku || "—")} · Stock: ${ssrInterpolate(stockOf(p))} ${ssrInterpolate(unitLabel(p))}${ssrInterpolate(pieceStock(p))}</span></div></div><div class="pos-product-price" data-v-e4f0800e>${ssrInterpolate(formatMoney(piecePrice(p)))}`);
            if (Number(p.items_per_unit) > 1) {
              _push(`<!--[--> / piece<!--]-->`);
            } else {
              _push(`<!---->`);
            }
            _push(`</div></button>`);
          });
          _push(`<!--]--></div>`);
        }
        _push(`</div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`<div class="pos-pagination" data-v-e4f0800e><span class="text-caption text-medium-emphasis" data-v-e4f0800e>${ssrInterpolate(unref(rangeLabel))}</span>`);
      _push(ssrRenderComponent(VSelect, {
        modelValue: unref(pageSize),
        "onUpdate:modelValue": ($event) => isRef(pageSize) ? pageSize.value = $event : null,
        items: [12, 24, 48, 96],
        density: "compact",
        variant: "outlined",
        "hide-details": "",
        rounded: "lg",
        style: { "max-width": "90px" }
      }, null, _parent));
      _push(ssrRenderComponent(VSpacer, null, null, _parent));
      _push(ssrRenderComponent(VPagination, {
        modelValue: unref(page),
        "onUpdate:modelValue": ($event) => isRef(page) ? page.value = $event : null,
        length: unref(pageCount),
        "total-visible": 5,
        density: "comfortable",
        rounded: "lg",
        size: "small"
      }, null, _parent));
      _push(`</div></section><aside class="pos-cart" data-v-e4f0800e><div class="pos-cart-banner" data-v-e4f0800e><div class="d-flex align-center" data-v-e4f0800e>`);
      _push(ssrRenderComponent(VIcon, { class: "mr-2" }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`mdi-cart`);
          } else {
            return [
              createTextVNode("mdi-cart")
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`<div class="text-subtitle-1 font-weight-bold" data-v-e4f0800e>Current Sale</div>`);
      _push(ssrRenderComponent(VSpacer, null, null, _parent));
      _push(ssrRenderComponent(VChip, {
        size: "small",
        variant: "tonal",
        color: "white"
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`${ssrInterpolate(unref(pos).itemCount)} item${ssrInterpolate(unref(pos).itemCount === 1 ? "" : "s")}`);
          } else {
            return [
              createTextVNode(toDisplayString(unref(pos).itemCount) + " item" + toDisplayString(unref(pos).itemCount === 1 ? "" : "s"), 1)
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`</div></div><div class="pos-cart-header" data-v-e4f0800e>`);
      _push(ssrRenderComponent(VTextField, {
        modelValue: unref(pos).customerName,
        "onUpdate:modelValue": ($event) => unref(pos).customerName = $event,
        "prepend-inner-icon": "mdi-account-circle-outline",
        placeholder: "Walk-in customer",
        density: "compact",
        variant: "outlined",
        "hide-details": "",
        rounded: "lg",
        class: "mt-3",
        clearable: ""
      }, null, _parent));
      _push(`</div>`);
      _push(ssrRenderComponent(VDivider, null, null, _parent));
      _push(`<div class="pos-cart-items" data-v-e4f0800e>`);
      if (unref(pos).isEmpty) {
        _push(`<div class="pos-cart-empty" data-v-e4f0800e>`);
        _push(ssrRenderComponent(VIcon, {
          size: "64",
          color: "grey-lighten-1"
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`mdi-cart-outline`);
            } else {
              return [
                createTextVNode("mdi-cart-outline")
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(`<h3 class="text-h6 mt-2" data-v-e4f0800e>Cart is empty</h3><p class="text-body-2 text-medium-emphasis" data-v-e4f0800e>Tap a product to start a sale.</p></div>`);
      } else {
        _push(`<div class="px-3 py-2" data-v-e4f0800e><div${ssrRenderAttrs({ name: "cart-item" })} data-v-e4f0800e>`);
        ssrRenderList(unref(pos).cart, (item, i) => {
          _push(`<div class="pos-cart-row" data-v-e4f0800e><div class="flex-grow-1 min-width-0" data-v-e4f0800e><div class="text-body-2 font-weight-medium text-truncate" data-v-e4f0800e>${ssrInterpolate(item.name)}</div><div class="text-caption text-medium-emphasis" data-v-e4f0800e>${ssrInterpolate(formatMoney(item.price))} each`);
          if (item.items_per_unit > 1) {
            _push(`<!--[--> · ${ssrInterpolate(item.items_per_unit)} ${ssrInterpolate(item.unit)}/unit<!--]-->`);
          } else {
            _push(`<!---->`);
          }
          _push(`</div>`);
          if (item.items_per_unit > 1) {
            _push(`<div class="text-caption text-disabled" data-v-e4f0800e>${ssrInterpolate(item.qty)} pcs (${ssrInterpolate((item.qty / item.items_per_unit).toFixed(2))} ${ssrInterpolate(item.unit)})</div>`);
          } else {
            _push(`<!---->`);
          }
          _push(`</div><div class="pos-qty" data-v-e4f0800e>`);
          _push(ssrRenderComponent(VBtn, {
            icon: "mdi-minus",
            size: "x-small",
            variant: "tonal",
            rounded: "lg",
            disabled: item.qty <= 1,
            onClick: ($event) => unref(pos).decItem(i)
          }, null, _parent));
          _push(`<input${ssrRenderAttr("value", item.qty)} type="number" min="1"${ssrRenderAttr("max", item.max)} class="pos-qty-input" data-v-e4f0800e>`);
          _push(ssrRenderComponent(VBtn, {
            icon: "mdi-plus",
            size: "x-small",
            variant: "tonal",
            color: "primary",
            rounded: "lg",
            disabled: item.qty >= item.max,
            onClick: ($event) => unref(pos).incItem(i)
          }, null, _parent));
          _push(`</div><div class="pos-line-total" data-v-e4f0800e>${ssrInterpolate(formatMoney(item.price * item.qty))}</div>`);
          _push(ssrRenderComponent(VBtn, {
            icon: "mdi-close",
            size: "x-small",
            variant: "text",
            color: "error",
            rounded: "lg",
            onClick: ($event) => unref(pos).removeItem(i)
          }, null, _parent));
          _push(`</div>`);
        });
        _push(`</div></div>`);
      }
      _push(`</div><div class="pos-cart-footer" data-v-e4f0800e><div class="px-4 py-3" data-v-e4f0800e><div class="d-flex justify-space-between text-body-2 mb-1" data-v-e4f0800e><span class="text-medium-emphasis" data-v-e4f0800e>Subtotal</span><span data-v-e4f0800e>${ssrInterpolate(formatMoney(unref(pos).subtotal))}</span></div><div class="d-flex align-center justify-space-between text-body-2 mb-1" data-v-e4f0800e><span class="text-medium-emphasis" data-v-e4f0800e>Discount</span>`);
      _push(ssrRenderComponent(VTextField, {
        modelValue: unref(pos).discount.value,
        "onUpdate:modelValue": ($event) => unref(pos).discount.value = $event,
        modelModifiers: { number: true },
        type: "number",
        min: "0",
        max: unref(pos).subtotal,
        density: "compact",
        variant: "plain",
        "hide-details": "",
        class: "text-right pos-discount-input",
        suffix: unref(currencySymbol)
      }, null, _parent));
      _push(`</div><div class="d-flex justify-space-between text-body-2 mb-2" data-v-e4f0800e><span class="text-medium-emphasis" data-v-e4f0800e>Tax</span><span data-v-e4f0800e>${ssrInterpolate(formatMoney(unref(pos).taxAmount))}</span></div>`);
      _push(ssrRenderComponent(VDivider, { class: "mb-2" }, null, _parent));
      _push(`<div class="d-flex justify-space-between align-center" data-v-e4f0800e><span class="text-h6 font-weight-bold" data-v-e4f0800e>Total</span><span class="pos-total-value" data-v-e4f0800e>${ssrInterpolate(formatMoney(unref(pos).total))}</span></div></div><div class="px-4 pb-3" data-v-e4f0800e><div class="payment-methods mb-3" data-v-e4f0800e><!--[-->`);
      ssrRenderList(paymentOptions, (opt) => {
        _push(`<button type="button" class="${ssrRenderClass([{ "pay-btn--active": unref(pos).paymentMethod === opt.value }, "pay-btn"])}" data-v-e4f0800e>`);
        _push(ssrRenderComponent(VIcon, { size: "18" }, {
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
        _push(`<span data-v-e4f0800e>${ssrInterpolate(opt.label)}</span></button>`);
      });
      _push(`<!--]--></div><div class="d-flex ga-2" data-v-e4f0800e>`);
      _push(ssrRenderComponent(VBtn, {
        variant: "tonal",
        color: "secondary",
        rounded: "lg",
        size: "large",
        "prepend-icon": "mdi-pause",
        class: "text-none",
        disabled: unref(pos).isEmpty,
        onClick: ($event) => holdDialog.value = true
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`Hold`);
          } else {
            return [
              createTextVNode("Hold")
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(ssrRenderComponent(VBtn, {
        variant: "flat",
        color: "secondary",
        rounded: "lg",
        size: "large",
        class: "text-none flex-grow-1",
        disabled: unref(pos).isEmpty || unref(checkingOut),
        loading: unref(checkingOut),
        onClick: startCheckout
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(ssrRenderComponent(VIcon, { start: "" }, {
              default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                if (_push3) {
                  _push3(`mdi-cash-register`);
                } else {
                  return [
                    createTextVNode("mdi-cash-register")
                  ];
                }
              }),
              _: 1
            }, _parent2, _scopeId));
            _push2(` Charge ${ssrInterpolate(formatMoney(unref(pos).total))}`);
          } else {
            return [
              createVNode(VIcon, { start: "" }, {
                default: withCtx(() => [
                  createTextVNode("mdi-cash-register")
                ]),
                _: 1
              }),
              createTextVNode(" Charge " + toDisplayString(formatMoney(unref(pos).total)), 1)
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`</div></div></div></aside></div>`);
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
                          createTextVNode(" Complete Payment ")
                        ];
                      }
                    }),
                    _: 1
                  }, _parent3, _scopeId2));
                  _push3(ssrRenderComponent(VDivider, null, null, _parent3, _scopeId2));
                  _push3(ssrRenderComponent(VCardText, { class: "pt-4" }, {
                    default: withCtx((_3, _push4, _parent4, _scopeId3) => {
                      if (_push4) {
                        _push4(`<div class="checkout-total-banner" data-v-e4f0800e${_scopeId3}><span class="text-body-2 text-medium-emphasis" data-v-e4f0800e${_scopeId3}>Total Due</span><span class="checkout-total-banner__value" data-v-e4f0800e${_scopeId3}>${ssrInterpolate(formatMoney(unref(pos).total))}</span><div class="checkout-total-banner__method" data-v-e4f0800e${_scopeId3}>`);
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
                        _push4(`<span data-v-e4f0800e${_scopeId3}>${ssrInterpolate(paymentOptions.find((o) => o.value === unref(pos).paymentMethod)?.label)}</span></div></div>`);
                        _push4(ssrRenderComponent(VAutocomplete, {
                          modelValue: unref(pos).customerName,
                          "onUpdate:modelValue": [($event) => unref(pos).customerName = $event, onCustomerSelect],
                          items: unref(customerList),
                          "item-title": "full_name",
                          "item-value": "full_name",
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
                          _push4(`<!--[--><p class="text-subtitle-2 font-weight-medium mb-2" data-v-e4f0800e${_scopeId3}>Cash Received</p><div class="quick-cash-grid mb-2" data-v-e4f0800e${_scopeId3}><!--[-->`);
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
                          _push4(`<div class="${ssrRenderClass([{ "change-row--positive": unref(change) > 0 }, "change-row"])}" data-v-e4f0800e${_scopeId3}><span class="text-body-2" data-v-e4f0800e${_scopeId3}>Change</span><span class="text-h6 font-weight-bold" data-v-e4f0800e${_scopeId3}>${ssrInterpolate(formatMoney(Math.max(0, unref(change))))}</span></div><!--]-->`);
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
                          createVNode(VAutocomplete, {
                            modelValue: unref(pos).customerName,
                            "onUpdate:modelValue": [($event) => unref(pos).customerName = $event, onCustomerSelect],
                            items: unref(customerList),
                            "item-title": "full_name",
                            "item-value": "full_name",
                            label: "Customer",
                            placeholder: "Walk-in customer",
                            density: "comfortable",
                            variant: "outlined",
                            rounded: "lg",
                            "prepend-inner-icon": "mdi-account-outline",
                            clearable: "",
                            class: "mb-2"
                          }, null, 8, ["modelValue", "onUpdate:modelValue", "items"]),
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
                        createTextVNode(" Complete Payment ")
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
                        createVNode(VAutocomplete, {
                          modelValue: unref(pos).customerName,
                          "onUpdate:modelValue": [($event) => unref(pos).customerName = $event, onCustomerSelect],
                          items: unref(customerList),
                          "item-title": "full_name",
                          "item-value": "full_name",
                          label: "Customer",
                          placeholder: "Walk-in customer",
                          density: "comfortable",
                          variant: "outlined",
                          rounded: "lg",
                          "prepend-inner-icon": "mdi-account-outline",
                          clearable: "",
                          class: "mb-2"
                        }, null, 8, ["modelValue", "onUpdate:modelValue", "items"]),
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
                      createTextVNode(" Complete Payment ")
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
                      createVNode(VAutocomplete, {
                        modelValue: unref(pos).customerName,
                        "onUpdate:modelValue": [($event) => unref(pos).customerName = $event, onCustomerSelect],
                        items: unref(customerList),
                        "item-title": "full_name",
                        "item-value": "full_name",
                        label: "Customer",
                        placeholder: "Walk-in customer",
                        density: "comfortable",
                        variant: "outlined",
                        rounded: "lg",
                        "prepend-inner-icon": "mdi-account-outline",
                        clearable: "",
                        class: "mb-2"
                      }, null, 8, ["modelValue", "onUpdate:modelValue", "items"]),
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
                              _push5(`<div class="d-flex justify-space-between" data-v-e4f0800e${_scopeId4}><span data-v-e4f0800e${_scopeId4}>Items: ${ssrInterpolate(unref(pos).itemCount)}</span><span data-v-e4f0800e${_scopeId4}>Total: ${ssrInterpolate(formatMoney(unref(pos).total))}</span></div>`);
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
                  _push3(`<div class="receipt-success-header" data-v-e4f0800e${_scopeId2}>`);
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
                  _push3(`<h3 class="text-h6 font-weight-bold mt-2" data-v-e4f0800e${_scopeId2}>Sale Completed</h3><p class="text-caption text-medium-emphasis" data-v-e4f0800e${_scopeId2}>${ssrInterpolate(unref(lastTransaction)?.transaction_number)}</p></div>`);
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
      _push(ssrRenderComponent(VDialog, {
        modelValue: unref(shiftDialog),
        "onUpdate:modelValue": ($event) => isRef(shiftDialog) ? shiftDialog.value = $event : null,
        "max-width": "450"
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
                          color: "primary",
                          class: "mr-2"
                        }, {
                          default: withCtx((_4, _push5, _parent5, _scopeId4) => {
                            if (_push5) {
                              _push5(`mdi-account-clock`);
                            } else {
                              return [
                                createTextVNode("mdi-account-clock")
                              ];
                            }
                          }),
                          _: 1
                        }, _parent4, _scopeId3));
                        _push4(` ${ssrInterpolate(unref(shift) ? "Shift Info" : "Open Shift")}`);
                      } else {
                        return [
                          createVNode(VIcon, {
                            color: "primary",
                            class: "mr-2"
                          }, {
                            default: withCtx(() => [
                              createTextVNode("mdi-account-clock")
                            ]),
                            _: 1
                          }),
                          createTextVNode(" " + toDisplayString(unref(shift) ? "Shift Info" : "Open Shift"), 1)
                        ];
                      }
                    }),
                    _: 1
                  }, _parent3, _scopeId2));
                  _push3(ssrRenderComponent(VDivider, null, null, _parent3, _scopeId2));
                  _push3(ssrRenderComponent(VCardText, { class: "pt-4" }, {
                    default: withCtx((_3, _push4, _parent4, _scopeId3) => {
                      if (_push4) {
                        if (unref(shift)) {
                          _push4(`<!--[-->`);
                          _push4(ssrRenderComponent(VAlert, {
                            type: "success",
                            variant: "tonal",
                            density: "compact",
                            rounded: "lg",
                            class: "mb-3"
                          }, {
                            default: withCtx((_4, _push5, _parent5, _scopeId4) => {
                              if (_push5) {
                                _push5(` Active shift: ${ssrInterpolate(unref(shift).reference)}`);
                              } else {
                                return [
                                  createTextVNode(" Active shift: " + toDisplayString(unref(shift).reference), 1)
                                ];
                              }
                            }),
                            _: 1
                          }, _parent4, _scopeId3));
                          _push4(`<div class="shift-info-grid" data-v-e4f0800e${_scopeId3}><div class="shift-info-row" data-v-e4f0800e${_scopeId3}><span data-v-e4f0800e${_scopeId3}>Opened</span><span data-v-e4f0800e${_scopeId3}>${ssrInterpolate(unref(format).datetime(unref(shift).opened_at))}</span></div><div class="shift-info-row" data-v-e4f0800e${_scopeId3}><span data-v-e4f0800e${_scopeId3}>Duration</span><span data-v-e4f0800e${_scopeId3}>${ssrInterpolate(unref(shift).duration)}</span></div><div class="shift-info-row" data-v-e4f0800e${_scopeId3}><span data-v-e4f0800e${_scopeId3}>Opening Float</span><span data-v-e4f0800e${_scopeId3}>${ssrInterpolate(formatMoney(unref(shift).opening_float))}</span></div><div class="shift-info-row" data-v-e4f0800e${_scopeId3}><span data-v-e4f0800e${_scopeId3}>Transactions</span><span data-v-e4f0800e${_scopeId3}>${ssrInterpolate(unref(shift).transaction_count)}</span></div><div class="shift-info-row" data-v-e4f0800e${_scopeId3}><span data-v-e4f0800e${_scopeId3}>Gross Revenue</span><span data-v-e4f0800e${_scopeId3}>${ssrInterpolate(formatMoney(unref(shift).gross_revenue))}</span></div></div><!--]-->`);
                        } else {
                          _push4(`<!--[--><p class="text-body-2 text-medium-emphasis mb-3" data-v-e4f0800e${_scopeId3}>No active shift. Enter opening float to start a new shift.</p>`);
                          _push4(ssrRenderComponent(VTextField, {
                            modelValue: unref(shiftOpeningFloat),
                            "onUpdate:modelValue": ($event) => isRef(shiftOpeningFloat) ? shiftOpeningFloat.value = $event : null,
                            modelModifiers: { number: true },
                            label: "Opening float",
                            type: "number",
                            density: "comfortable",
                            variant: "outlined",
                            rounded: "lg",
                            prefix: unref(currencySymbol)
                          }, null, _parent4, _scopeId3));
                          _push4(`<!--]-->`);
                        }
                      } else {
                        return [
                          unref(shift) ? (openBlock(), createBlock(Fragment, { key: 0 }, [
                            createVNode(VAlert, {
                              type: "success",
                              variant: "tonal",
                              density: "compact",
                              rounded: "lg",
                              class: "mb-3"
                            }, {
                              default: withCtx(() => [
                                createTextVNode(" Active shift: " + toDisplayString(unref(shift).reference), 1)
                              ]),
                              _: 1
                            }),
                            createVNode("div", { class: "shift-info-grid" }, [
                              createVNode("div", { class: "shift-info-row" }, [
                                createVNode("span", null, "Opened"),
                                createVNode("span", null, toDisplayString(unref(format).datetime(unref(shift).opened_at)), 1)
                              ]),
                              createVNode("div", { class: "shift-info-row" }, [
                                createVNode("span", null, "Duration"),
                                createVNode("span", null, toDisplayString(unref(shift).duration), 1)
                              ]),
                              createVNode("div", { class: "shift-info-row" }, [
                                createVNode("span", null, "Opening Float"),
                                createVNode("span", null, toDisplayString(formatMoney(unref(shift).opening_float)), 1)
                              ]),
                              createVNode("div", { class: "shift-info-row" }, [
                                createVNode("span", null, "Transactions"),
                                createVNode("span", null, toDisplayString(unref(shift).transaction_count), 1)
                              ]),
                              createVNode("div", { class: "shift-info-row" }, [
                                createVNode("span", null, "Gross Revenue"),
                                createVNode("span", null, toDisplayString(formatMoney(unref(shift).gross_revenue)), 1)
                              ])
                            ])
                          ], 64)) : (openBlock(), createBlock(Fragment, { key: 1 }, [
                            createVNode("p", { class: "text-body-2 text-medium-emphasis mb-3" }, "No active shift. Enter opening float to start a new shift."),
                            createVNode(VTextField, {
                              modelValue: unref(shiftOpeningFloat),
                              "onUpdate:modelValue": ($event) => isRef(shiftOpeningFloat) ? shiftOpeningFloat.value = $event : null,
                              modelModifiers: { number: true },
                              label: "Opening float",
                              type: "number",
                              density: "comfortable",
                              variant: "outlined",
                              rounded: "lg",
                              prefix: unref(currencySymbol)
                            }, null, 8, ["modelValue", "onUpdate:modelValue", "prefix"])
                          ], 64))
                        ];
                      }
                    }),
                    _: 1
                  }, _parent3, _scopeId2));
                  _push3(ssrRenderComponent(VCardActions, { class: "pa-4" }, {
                    default: withCtx((_3, _push4, _parent4, _scopeId3) => {
                      if (_push4) {
                        _push4(ssrRenderComponent(VSpacer, null, null, _parent4, _scopeId3));
                        _push4(ssrRenderComponent(VBtn, {
                          variant: "text",
                          onClick: ($event) => shiftDialog.value = false
                        }, {
                          default: withCtx((_4, _push5, _parent5, _scopeId4) => {
                            if (_push5) {
                              _push5(`Close`);
                            } else {
                              return [
                                createTextVNode("Close")
                              ];
                            }
                          }),
                          _: 1
                        }, _parent4, _scopeId3));
                        if (!unref(shift)) {
                          _push4(ssrRenderComponent(VBtn, {
                            variant: "flat",
                            color: "primary",
                            rounded: "xl",
                            loading: unref(openingShift),
                            onClick: openShift
                          }, {
                            default: withCtx((_4, _push5, _parent5, _scopeId4) => {
                              if (_push5) {
                                _push5(`Open Shift`);
                              } else {
                                return [
                                  createTextVNode("Open Shift")
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
                          createVNode(VSpacer),
                          createVNode(VBtn, {
                            variant: "text",
                            onClick: ($event) => shiftDialog.value = false
                          }, {
                            default: withCtx(() => [
                              createTextVNode("Close")
                            ]),
                            _: 1
                          }, 8, ["onClick"]),
                          !unref(shift) ? (openBlock(), createBlock(VBtn, {
                            key: 0,
                            variant: "flat",
                            color: "primary",
                            rounded: "xl",
                            loading: unref(openingShift),
                            onClick: openShift
                          }, {
                            default: withCtx(() => [
                              createTextVNode("Open Shift")
                            ]),
                            _: 1
                          }, 8, ["loading"])) : createCommentVNode("", true)
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
                          color: "primary",
                          class: "mr-2"
                        }, {
                          default: withCtx(() => [
                            createTextVNode("mdi-account-clock")
                          ]),
                          _: 1
                        }),
                        createTextVNode(" " + toDisplayString(unref(shift) ? "Shift Info" : "Open Shift"), 1)
                      ]),
                      _: 1
                    }),
                    createVNode(VDivider),
                    createVNode(VCardText, { class: "pt-4" }, {
                      default: withCtx(() => [
                        unref(shift) ? (openBlock(), createBlock(Fragment, { key: 0 }, [
                          createVNode(VAlert, {
                            type: "success",
                            variant: "tonal",
                            density: "compact",
                            rounded: "lg",
                            class: "mb-3"
                          }, {
                            default: withCtx(() => [
                              createTextVNode(" Active shift: " + toDisplayString(unref(shift).reference), 1)
                            ]),
                            _: 1
                          }),
                          createVNode("div", { class: "shift-info-grid" }, [
                            createVNode("div", { class: "shift-info-row" }, [
                              createVNode("span", null, "Opened"),
                              createVNode("span", null, toDisplayString(unref(format).datetime(unref(shift).opened_at)), 1)
                            ]),
                            createVNode("div", { class: "shift-info-row" }, [
                              createVNode("span", null, "Duration"),
                              createVNode("span", null, toDisplayString(unref(shift).duration), 1)
                            ]),
                            createVNode("div", { class: "shift-info-row" }, [
                              createVNode("span", null, "Opening Float"),
                              createVNode("span", null, toDisplayString(formatMoney(unref(shift).opening_float)), 1)
                            ]),
                            createVNode("div", { class: "shift-info-row" }, [
                              createVNode("span", null, "Transactions"),
                              createVNode("span", null, toDisplayString(unref(shift).transaction_count), 1)
                            ]),
                            createVNode("div", { class: "shift-info-row" }, [
                              createVNode("span", null, "Gross Revenue"),
                              createVNode("span", null, toDisplayString(formatMoney(unref(shift).gross_revenue)), 1)
                            ])
                          ])
                        ], 64)) : (openBlock(), createBlock(Fragment, { key: 1 }, [
                          createVNode("p", { class: "text-body-2 text-medium-emphasis mb-3" }, "No active shift. Enter opening float to start a new shift."),
                          createVNode(VTextField, {
                            modelValue: unref(shiftOpeningFloat),
                            "onUpdate:modelValue": ($event) => isRef(shiftOpeningFloat) ? shiftOpeningFloat.value = $event : null,
                            modelModifiers: { number: true },
                            label: "Opening float",
                            type: "number",
                            density: "comfortable",
                            variant: "outlined",
                            rounded: "lg",
                            prefix: unref(currencySymbol)
                          }, null, 8, ["modelValue", "onUpdate:modelValue", "prefix"])
                        ], 64))
                      ]),
                      _: 1
                    }),
                    createVNode(VCardActions, { class: "pa-4" }, {
                      default: withCtx(() => [
                        createVNode(VSpacer),
                        createVNode(VBtn, {
                          variant: "text",
                          onClick: ($event) => shiftDialog.value = false
                        }, {
                          default: withCtx(() => [
                            createTextVNode("Close")
                          ]),
                          _: 1
                        }, 8, ["onClick"]),
                        !unref(shift) ? (openBlock(), createBlock(VBtn, {
                          key: 0,
                          variant: "flat",
                          color: "primary",
                          rounded: "xl",
                          loading: unref(openingShift),
                          onClick: openShift
                        }, {
                          default: withCtx(() => [
                            createTextVNode("Open Shift")
                          ]),
                          _: 1
                        }, 8, ["loading"])) : createCommentVNode("", true)
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
                        color: "primary",
                        class: "mr-2"
                      }, {
                        default: withCtx(() => [
                          createTextVNode("mdi-account-clock")
                        ]),
                        _: 1
                      }),
                      createTextVNode(" " + toDisplayString(unref(shift) ? "Shift Info" : "Open Shift"), 1)
                    ]),
                    _: 1
                  }),
                  createVNode(VDivider),
                  createVNode(VCardText, { class: "pt-4" }, {
                    default: withCtx(() => [
                      unref(shift) ? (openBlock(), createBlock(Fragment, { key: 0 }, [
                        createVNode(VAlert, {
                          type: "success",
                          variant: "tonal",
                          density: "compact",
                          rounded: "lg",
                          class: "mb-3"
                        }, {
                          default: withCtx(() => [
                            createTextVNode(" Active shift: " + toDisplayString(unref(shift).reference), 1)
                          ]),
                          _: 1
                        }),
                        createVNode("div", { class: "shift-info-grid" }, [
                          createVNode("div", { class: "shift-info-row" }, [
                            createVNode("span", null, "Opened"),
                            createVNode("span", null, toDisplayString(unref(format).datetime(unref(shift).opened_at)), 1)
                          ]),
                          createVNode("div", { class: "shift-info-row" }, [
                            createVNode("span", null, "Duration"),
                            createVNode("span", null, toDisplayString(unref(shift).duration), 1)
                          ]),
                          createVNode("div", { class: "shift-info-row" }, [
                            createVNode("span", null, "Opening Float"),
                            createVNode("span", null, toDisplayString(formatMoney(unref(shift).opening_float)), 1)
                          ]),
                          createVNode("div", { class: "shift-info-row" }, [
                            createVNode("span", null, "Transactions"),
                            createVNode("span", null, toDisplayString(unref(shift).transaction_count), 1)
                          ]),
                          createVNode("div", { class: "shift-info-row" }, [
                            createVNode("span", null, "Gross Revenue"),
                            createVNode("span", null, toDisplayString(formatMoney(unref(shift).gross_revenue)), 1)
                          ])
                        ])
                      ], 64)) : (openBlock(), createBlock(Fragment, { key: 1 }, [
                        createVNode("p", { class: "text-body-2 text-medium-emphasis mb-3" }, "No active shift. Enter opening float to start a new shift."),
                        createVNode(VTextField, {
                          modelValue: unref(shiftOpeningFloat),
                          "onUpdate:modelValue": ($event) => isRef(shiftOpeningFloat) ? shiftOpeningFloat.value = $event : null,
                          modelModifiers: { number: true },
                          label: "Opening float",
                          type: "number",
                          density: "comfortable",
                          variant: "outlined",
                          rounded: "lg",
                          prefix: unref(currencySymbol)
                        }, null, 8, ["modelValue", "onUpdate:modelValue", "prefix"])
                      ], 64))
                    ]),
                    _: 1
                  }),
                  createVNode(VCardActions, { class: "pa-4" }, {
                    default: withCtx(() => [
                      createVNode(VSpacer),
                      createVNode(VBtn, {
                        variant: "text",
                        onClick: ($event) => shiftDialog.value = false
                      }, {
                        default: withCtx(() => [
                          createTextVNode("Close")
                        ]),
                        _: 1
                      }, 8, ["onClick"]),
                      !unref(shift) ? (openBlock(), createBlock(VBtn, {
                        key: 0,
                        variant: "flat",
                        color: "primary",
                        rounded: "xl",
                        loading: unref(openingShift),
                        onClick: openShift
                      }, {
                        default: withCtx(() => [
                          createTextVNode("Open Shift")
                        ]),
                        _: 1
                      }, 8, ["loading"])) : createCommentVNode("", true)
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
        modelValue: unref(resumeDialog),
        "onUpdate:modelValue": ($event) => isRef(resumeDialog) ? resumeDialog.value = $event : null,
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
                          color: "success",
                          class: "mr-2"
                        }, {
                          default: withCtx((_4, _push5, _parent5, _scopeId4) => {
                            if (_push5) {
                              _push5(`mdi-play-circle`);
                            } else {
                              return [
                                createTextVNode("mdi-play-circle")
                              ];
                            }
                          }),
                          _: 1
                        }, _parent4, _scopeId3));
                        _push4(` Resume Parked Sale `);
                      } else {
                        return [
                          createVNode(VIcon, {
                            color: "success",
                            class: "mr-2"
                          }, {
                            default: withCtx(() => [
                              createTextVNode("mdi-play-circle")
                            ]),
                            _: 1
                          }),
                          createTextVNode(" Resume Parked Sale ")
                        ];
                      }
                    }),
                    _: 1
                  }, _parent3, _scopeId2));
                  _push3(ssrRenderComponent(VCardText, null, {
                    default: withCtx((_3, _push4, _parent4, _scopeId3) => {
                      if (_push4) {
                        _push4(ssrRenderComponent(VAlert, {
                          type: "info",
                          variant: "tonal",
                          rounded: "lg"
                        }, {
                          default: withCtx((_4, _push5, _parent5, _scopeId4) => {
                            if (_push5) {
                              _push5(`<div data-v-e4f0800e${_scopeId4}>Customer: ${ssrInterpolate(unref(resumeData)?.customer_name || "Walk-in")}</div><div data-v-e4f0800e${_scopeId4}>Items: ${ssrInterpolate(unref(resumeData)?.item_count)}</div><div data-v-e4f0800e${_scopeId4}>Total: ${ssrInterpolate(formatMoney(unref(resumeData)?.total || 0))}</div>`);
                            } else {
                              return [
                                createVNode("div", null, "Customer: " + toDisplayString(unref(resumeData)?.customer_name || "Walk-in"), 1),
                                createVNode("div", null, "Items: " + toDisplayString(unref(resumeData)?.item_count), 1),
                                createVNode("div", null, "Total: " + toDisplayString(formatMoney(unref(resumeData)?.total || 0)), 1)
                              ];
                            }
                          }),
                          _: 1
                        }, _parent4, _scopeId3));
                      } else {
                        return [
                          createVNode(VAlert, {
                            type: "info",
                            variant: "tonal",
                            rounded: "lg"
                          }, {
                            default: withCtx(() => [
                              createVNode("div", null, "Customer: " + toDisplayString(unref(resumeData)?.customer_name || "Walk-in"), 1),
                              createVNode("div", null, "Items: " + toDisplayString(unref(resumeData)?.item_count), 1),
                              createVNode("div", null, "Total: " + toDisplayString(formatMoney(unref(resumeData)?.total || 0)), 1)
                            ]),
                            _: 1
                          })
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
                          onClick: ($event) => resumeDialog.value = false
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
                          variant: "flat",
                          color: "success",
                          onClick: doResume
                        }, {
                          default: withCtx((_4, _push5, _parent5, _scopeId4) => {
                            if (_push5) {
                              _push5(`Resume`);
                            } else {
                              return [
                                createTextVNode("Resume")
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
                            onClick: ($event) => resumeDialog.value = false
                          }, {
                            default: withCtx(() => [
                              createTextVNode("Cancel")
                            ]),
                            _: 1
                          }, 8, ["onClick"]),
                          createVNode(VBtn, {
                            variant: "flat",
                            color: "success",
                            onClick: doResume
                          }, {
                            default: withCtx(() => [
                              createTextVNode("Resume")
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
                          color: "success",
                          class: "mr-2"
                        }, {
                          default: withCtx(() => [
                            createTextVNode("mdi-play-circle")
                          ]),
                          _: 1
                        }),
                        createTextVNode(" Resume Parked Sale ")
                      ]),
                      _: 1
                    }),
                    createVNode(VCardText, null, {
                      default: withCtx(() => [
                        createVNode(VAlert, {
                          type: "info",
                          variant: "tonal",
                          rounded: "lg"
                        }, {
                          default: withCtx(() => [
                            createVNode("div", null, "Customer: " + toDisplayString(unref(resumeData)?.customer_name || "Walk-in"), 1),
                            createVNode("div", null, "Items: " + toDisplayString(unref(resumeData)?.item_count), 1),
                            createVNode("div", null, "Total: " + toDisplayString(formatMoney(unref(resumeData)?.total || 0)), 1)
                          ]),
                          _: 1
                        })
                      ]),
                      _: 1
                    }),
                    createVNode(VCardActions, null, {
                      default: withCtx(() => [
                        createVNode(VSpacer),
                        createVNode(VBtn, {
                          variant: "text",
                          onClick: ($event) => resumeDialog.value = false
                        }, {
                          default: withCtx(() => [
                            createTextVNode("Cancel")
                          ]),
                          _: 1
                        }, 8, ["onClick"]),
                        createVNode(VBtn, {
                          variant: "flat",
                          color: "success",
                          onClick: doResume
                        }, {
                          default: withCtx(() => [
                            createTextVNode("Resume")
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
                        color: "success",
                        class: "mr-2"
                      }, {
                        default: withCtx(() => [
                          createTextVNode("mdi-play-circle")
                        ]),
                        _: 1
                      }),
                      createTextVNode(" Resume Parked Sale ")
                    ]),
                    _: 1
                  }),
                  createVNode(VCardText, null, {
                    default: withCtx(() => [
                      createVNode(VAlert, {
                        type: "info",
                        variant: "tonal",
                        rounded: "lg"
                      }, {
                        default: withCtx(() => [
                          createVNode("div", null, "Customer: " + toDisplayString(unref(resumeData)?.customer_name || "Walk-in"), 1),
                          createVNode("div", null, "Items: " + toDisplayString(unref(resumeData)?.item_count), 1),
                          createVNode("div", null, "Total: " + toDisplayString(formatMoney(unref(resumeData)?.total || 0)), 1)
                        ]),
                        _: 1
                      })
                    ]),
                    _: 1
                  }),
                  createVNode(VCardActions, null, {
                    default: withCtx(() => [
                      createVNode(VSpacer),
                      createVNode(VBtn, {
                        variant: "text",
                        onClick: ($event) => resumeDialog.value = false
                      }, {
                        default: withCtx(() => [
                          createTextVNode("Cancel")
                        ]),
                        _: 1
                      }, 8, ["onClick"]),
                      createVNode(VBtn, {
                        variant: "flat",
                        color: "success",
                        onClick: doResume
                      }, {
                        default: withCtx(() => [
                          createTextVNode("Resume")
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
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/pos/index.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const index = /* @__PURE__ */ _export_sfc(_sfc_main, [["__scopeId", "data-v-e4f0800e"]]);
export {
  index as default
};
//# sourceMappingURL=index-n6BGKuWR.js.map
