import { defineComponent, computed, mergeProps, withCtx, createTextVNode, unref, useSSRContext } from "vue";
import { ssrRenderAttrs, ssrRenderComponent, ssrInterpolate, ssrRenderList } from "vue/server-renderer";
import { u as useFormat } from "./useFormat-BvVWDMYe.js";
import { a as useAuthStore } from "./useApi-D4YG8JPQ.js";
import { a as VIcon, _ as _export_sfc } from "../server.mjs";
import { defineStore } from "pinia";
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "Receipt",
  __ssrInlineRender: true,
  props: {
    number: {},
    items: {},
    subtotal: {},
    discount: {},
    itemDiscounts: {},
    tax: {},
    total: {},
    paymentMethod: {},
    tendered: {},
    change: {},
    paymentReference: {},
    cashierName: {},
    customerName: {},
    customerPhone: {},
    branchName: {},
    businessName: {}
  },
  setup(__props) {
    const props = __props;
    const { currency } = useFormat();
    const auth = useAuthStore();
    const businessName = computed(() => props.businessName || auth.tenantName || "DomendraPOS");
    const todayDate = (/* @__PURE__ */ new Date()).toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
    const formatDate = (/* @__PURE__ */ new Date()).toLocaleString("en-GB", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
    const paymentLabels = {
      cash: "Cash",
      mpesa: "M-Pesa",
      card: "Card",
      insurance: "Insurance",
      credit: "Credit",
      bank_transfer: "Bank Transfer"
    };
    const paymentMethodLabel = computed(() => paymentLabels[props.paymentMethod] || props.paymentMethod);
    function formatMoney(v) {
      return currency(v);
    }
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<div${ssrRenderAttrs(mergeProps({
        ref: "receiptEl",
        class: "receipt"
      }, _attrs))} data-v-d1e1c18d><div class="receipt__header" data-v-d1e1c18d><div class="receipt__logo" data-v-d1e1c18d>`);
      _push(ssrRenderComponent(VIcon, {
        color: "primary",
        size: "28"
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`mdi-store`);
          } else {
            return [
              createTextVNode("mdi-store")
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`</div><h2 class="receipt__biz" data-v-d1e1c18d>${ssrInterpolate(unref(businessName))}</h2>`);
      if (__props.branchName) {
        _push(`<p class="receipt__addr" data-v-d1e1c18d>${ssrInterpolate(__props.branchName)}</p>`);
      } else {
        _push(`<!---->`);
      }
      _push(`<p class="receipt__addr" data-v-d1e1c18d>${ssrInterpolate(unref(todayDate))}</p></div><div class="receipt__separator" data-v-d1e1c18d></div><div class="receipt__meta" data-v-d1e1c18d><div class="receipt__meta-row" data-v-d1e1c18d><span data-v-d1e1c18d>Receipt #</span><span class="receipt__mono" data-v-d1e1c18d>${ssrInterpolate(__props.number)}</span></div><div class="receipt__meta-row" data-v-d1e1c18d><span data-v-d1e1c18d>Date</span><span data-v-d1e1c18d>${ssrInterpolate(unref(formatDate))}</span></div><div class="receipt__meta-row" data-v-d1e1c18d><span data-v-d1e1c18d>Cashier</span><span data-v-d1e1c18d>${ssrInterpolate(__props.cashierName)}</span></div>`);
      if (__props.customerName) {
        _push(`<div class="receipt__meta-row" data-v-d1e1c18d><span data-v-d1e1c18d>Customer</span><span data-v-d1e1c18d>${ssrInterpolate(__props.customerName)}</span></div>`);
      } else {
        _push(`<!---->`);
      }
      if (__props.customerPhone) {
        _push(`<div class="receipt__meta-row" data-v-d1e1c18d><span data-v-d1e1c18d>Phone</span><span data-v-d1e1c18d>${ssrInterpolate(__props.customerPhone)}</span></div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</div><div class="receipt__separator" data-v-d1e1c18d></div><table class="receipt__items" data-v-d1e1c18d><thead data-v-d1e1c18d><tr data-v-d1e1c18d><th class="receipt__left" data-v-d1e1c18d>Item</th><th class="receipt__center" data-v-d1e1c18d>Qty</th><th class="receipt__right" data-v-d1e1c18d>Price</th><th class="receipt__right" data-v-d1e1c18d>Total</th></tr></thead><tbody data-v-d1e1c18d><!--[-->`);
      ssrRenderList(__props.items, (item, i) => {
        _push(`<tr data-v-d1e1c18d><td class="receipt__left receipt__item-name" data-v-d1e1c18d>${ssrInterpolate(item.name)}</td><td class="receipt__center" data-v-d1e1c18d>${ssrInterpolate(item.qty)}</td><td class="receipt__right" data-v-d1e1c18d>${ssrInterpolate(formatMoney(item.price))}</td><td class="receipt__right" data-v-d1e1c18d>${ssrInterpolate(formatMoney(item.price * item.qty))}</td></tr>`);
      });
      _push(`<!--]--></tbody></table><div class="receipt__separator" data-v-d1e1c18d></div><div class="receipt__totals" data-v-d1e1c18d><div class="receipt__totals-row" data-v-d1e1c18d><span data-v-d1e1c18d>Subtotal</span><span data-v-d1e1c18d>${ssrInterpolate(formatMoney(__props.subtotal))}</span></div>`);
      if (__props.discount > 0) {
        _push(`<div class="receipt__totals-row" data-v-d1e1c18d><span data-v-d1e1c18d>Discount</span><span data-v-d1e1c18d>-${ssrInterpolate(formatMoney(__props.discount))}</span></div>`);
      } else {
        _push(`<!---->`);
      }
      if (__props.itemDiscounts > 0) {
        _push(`<div class="receipt__totals-row" data-v-d1e1c18d><span data-v-d1e1c18d>Item Discounts</span><span data-v-d1e1c18d>-${ssrInterpolate(formatMoney(__props.itemDiscounts))}</span></div>`);
      } else {
        _push(`<!---->`);
      }
      if (__props.tax > 0) {
        _push(`<div class="receipt__totals-row" data-v-d1e1c18d><span data-v-d1e1c18d>Tax</span><span data-v-d1e1c18d>${ssrInterpolate(formatMoney(__props.tax))}</span></div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`<div class="receipt__grand" data-v-d1e1c18d><span data-v-d1e1c18d>TOTAL</span><span data-v-d1e1c18d>${ssrInterpolate(formatMoney(__props.total))}</span></div></div><div class="receipt__separator" data-v-d1e1c18d></div><div class="receipt__payment" data-v-d1e1c18d><div class="receipt__totals-row" data-v-d1e1c18d><span data-v-d1e1c18d>Payment Method</span><span class="receipt__cap" data-v-d1e1c18d>${ssrInterpolate(unref(paymentMethodLabel))}</span></div>`);
      if (__props.tendered != null) {
        _push(`<div class="receipt__totals-row" data-v-d1e1c18d><span data-v-d1e1c18d>Tendered</span><span data-v-d1e1c18d>${ssrInterpolate(formatMoney(__props.tendered))}</span></div>`);
      } else {
        _push(`<!---->`);
      }
      if (__props.change != null && __props.change > 0) {
        _push(`<div class="receipt__totals-row" data-v-d1e1c18d><span data-v-d1e1c18d>Change</span><span data-v-d1e1c18d>${ssrInterpolate(formatMoney(__props.change))}</span></div>`);
      } else {
        _push(`<!---->`);
      }
      if (__props.paymentReference) {
        _push(`<div class="receipt__totals-row" data-v-d1e1c18d><span data-v-d1e1c18d>Ref</span><span class="receipt__mono" data-v-d1e1c18d>${ssrInterpolate(__props.paymentReference)}</span></div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</div><div class="receipt__separator" data-v-d1e1c18d></div><div class="receipt__footer" data-v-d1e1c18d><p class="receipt__thanks" data-v-d1e1c18d>Thank you for shopping with us!</p><p class="receipt__small" data-v-d1e1c18d>Returns accepted within 7 days with receipt.</p><p class="receipt__small receipt__powered" data-v-d1e1c18d>Powered by DomendraPOS</p></div></div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/pos/Receipt.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const __nuxt_component_0 = /* @__PURE__ */ Object.assign(_export_sfc(_sfc_main, [["__scopeId", "data-v-d1e1c18d"]]), { __name: "PosReceipt" });
const usePosStore = defineStore("pos", {
  state: () => {
    const base = {
      cart: [],
      customer: null,
      customerName: "",
      customerPhone: "",
      paymentMethod: "cash",
      discount: { type: "percentage", value: 0 },
      branchId: null,
      branchName: "All Branches",
      notes: "",
      lastTransactionId: null
    };
    return base;
  },
  getters: {
    itemCount: (state) => state.cart.reduce((s, i) => s + i.qty, 0),
    uniqueCount: (state) => state.cart.length,
    lineSubtotals: (state) => {
      return state.cart.map((item) => item.price * item.qty - (item.discount || 0));
    },
    subtotal: (state) => {
      const raw = state.cart.reduce((s, i) => s + i.price * i.qty - (i.discount || 0), 0);
      return Math.round(raw * 100) / 100;
    },
    discountAmount: (state) => {
      const sub = state.cart.reduce((s, i) => s + i.price * i.qty, 0);
      const raw = state.discount.type === "percentage" ? sub * (state.discount.value / 100) : Math.min(state.discount.value, sub);
      return Math.round(raw * 100) / 100;
    },
    taxableBase() {
      return Math.round(Math.max(0, this.subtotal - this.discountAmount) * 100) / 100;
    },
    taxAmount(state) {
      const raw = state.cart.reduce((s, i) => {
        const lineBase = i.price * i.qty - (i.discount || 0);
        const lineAfterGlobal = lineBase * (1 - this.discountAmount / (this.subtotal || 1));
        return s + lineAfterGlobal * ((i.tax_rate || 0) / 100);
      }, 0);
      return Math.round(raw * 100) / 100;
    },
    total() {
      return Math.round(Math.max(0, this.taxableBase + this.taxAmount) * 100) / 100;
    },
    totalSavings() {
      return this.discountAmount + this.cart.reduce((s, i) => s + (i.discount || 0), 0);
    },
    isEmpty: (state) => state.cart.length === 0
  },
  actions: {
    addToCart(product) {
      const stockUnits = Number(product.quantity_on_hand ?? product.quantity ?? 0);
      const ipu = Number(product.items_per_unit || 1);
      const maxStock = ipu > 1 ? Math.floor(stockUnits * ipu) : stockUnits;
      const existing = this.cart.find((i) => i.id === product.id);
      if (existing) {
        if (existing.qty < maxStock) {
          existing.qty++;
        } else {
          return false;
        }
      } else {
        if (maxStock <= 0) return false;
        const unitPrice = Number(product.retail_price || product.selling_price || 0);
        const piecePrice = ipu > 1 ? unitPrice / ipu : unitPrice;
        this.cart.push({
          id: product.id,
          name: product.name,
          price: Math.round(piecePrice * 1e3) / 1e3,
          qty: 1,
          max: maxStock,
          sku: product.sku || "",
          tax_rate: Number(product.tax_rate || 0),
          image: product.image || null,
          discount: 0,
          unit: String(product.unit || "each"),
          items_per_unit: ipu
        });
      }
      this._persist();
      return true;
    },
    incItem(index) {
      const item = this.cart[index];
      if (item && item.qty < item.max) item.qty++;
      this._persist();
    },
    decItem(index) {
      if (this.cart[index]) {
        if (this.cart[index].qty > 1) {
          this.cart[index].qty--;
        } else {
          this.removeItem(index);
        }
      }
      this._persist();
    },
    updateQty(index, qty) {
      const item = this.cart[index];
      if (!item) return;
      if (qty < 1) {
        this.removeItem(index);
        return;
      }
      item.qty = Math.min(qty, item.max);
      this._persist();
    },
    removeItem(index) {
      this.cart.splice(index, 1);
      this._persist();
    },
    setItemDiscount(index, amount) {
      if (this.cart[index]) {
        this.cart[index].discount = Math.max(0, Math.min(amount, this.cart[index].price * this.cart[index].qty));
      }
    },
    clearCart() {
      this.cart = [];
      this.customer = null;
      this.customerName = "";
      this.customerPhone = "";
      this.discount = { type: "percentage", value: 0 };
      this.notes = "";
      this._persist();
    },
    setCustomer(customer) {
      this.customer = customer;
      this.customerName = customer ? customer.full_name : this.customerName;
      this.customerPhone = customer ? customer.phone : this.customerPhone;
      this._persist();
    },
    setPaymentMethod(method) {
      this.paymentMethod = method;
      this._persist();
    },
    setBranch(id, name) {
      this.branchId = id;
      this.branchName = name;
      this._persist();
    },
    resumeFromParked(items, customerName, customerPhone) {
      this.cart = items.map((i) => ({
        id: i.id,
        name: i.name,
        price: i.price,
        qty: i.qty,
        max: i.max || 999,
        sku: i.sku || "",
        tax_rate: i.tax_rate || 0,
        image: i.image || null,
        discount: i.discount || 0,
        unit: i.unit || "each",
        items_per_unit: i.items_per_unit || 1
      }));
      this.customerName = customerName || "";
      this.customerPhone = customerPhone || "";
      this._persist();
    },
    /** Restore cart from localStorage (called after auth is ready) */
    restoreCart() {
      return;
    },
    /** Persist current cart+state to localStorage (scoped by user ID) */
    _persist() {
      return;
    },
    /** Clear persisted cart for a specific user (used on logout) */
    clearForUser(userId) {
    },
    /** Sync direct v-model mutations (customerName, discount, etc.) to localStorage */
    syncPersist() {
      this._persist();
    }
  }
});
export {
  __nuxt_component_0 as _,
  usePosStore as u
};
//# sourceMappingURL=pos-D7JNQgAI.js.map
