import { defineComponent, ref, reactive, computed, mergeProps, withCtx, createTextVNode, unref, toDisplayString, isRef, createVNode, withDirectives, vModelText, openBlock, createBlock, Fragment, renderList, vModelSelect, createCommentVNode, useSSRContext } from 'file://D:/Projects/MY-APPS-2/DomendraPOS/frontend/node_modules/vue/index.mjs';
import { ssrRenderAttrs, ssrRenderComponent, ssrRenderList, ssrRenderClass, ssrInterpolate, ssrRenderAttr, ssrIncludeBooleanAttr, ssrLooseContain, ssrLooseEqual, ssrRenderStyle } from 'file://D:/Projects/MY-APPS-2/DomendraPOS/frontend/node_modules/vue/server-renderer/index.mjs';
import { _ as _export_sfc, D as useToast, a as VIcon, q as VDialog, g as VCard, c as VBtn, k as VDivider, x as VProgressCircular } from './server.mjs';
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
  __name: "branches",
  __ssrInlineRender: true,
  setup(__props) {
    const toast = useToast();
    const branches2 = ref([]);
    const loading = ref(true);
    const saving = ref(false);
    const search = ref("");
    const statusFilter = ref("");
    const hqFilter = ref("");
    const dialog = ref(false);
    const editing = ref(false);
    const formError = ref("");
    const form = reactive({
      id: null,
      name: "",
      code: "",
      city: "",
      country: "Kenya",
      phone: "",
      email: "",
      currency_code: "USD",
      timezone: "UTC",
      tax_rate: "0",
      register_count: 1,
      address_line1: "",
      is_active: true
    });
    const currencyOptions = ["USD", "EUR", "GBP", "INR", "NGN", "CAD", "AUD", "KES"];
    const filteredBranches = computed(() => {
      let list = branches2.value;
      if (statusFilter.value === "active") list = list.filter((b) => b.is_active);
      if (statusFilter.value === "inactive") list = list.filter((b) => !b.is_active);
      if (hqFilter.value === "hq") list = list.filter((b) => b.is_headquarters);
      if (hqFilter.value === "store") list = list.filter((b) => !b.is_headquarters);
      if (search.value) {
        const q = search.value.toLowerCase();
        list = list.filter(
          (b) => {
            var _a;
            return b.name.toLowerCase().includes(q) || b.code.toLowerCase().includes(q) || ((_a = b.city) == null ? void 0 : _a.toLowerCase().includes(q));
          }
        );
      }
      return list;
    });
    const kpis = computed(() => [
      { label: "Total Branches", value: branches2.value.length, icon: "mdi-store", color: "blue" },
      { label: "Active", value: branches2.value.filter((b) => b.is_active).length, icon: "mdi-store-check", color: "green" },
      { label: "Headquarters", value: branches2.value.filter((b) => b.is_headquarters).length, icon: "mdi-domain", color: "purple" },
      { label: "Total Registers", value: branches2.value.reduce((s, b) => s + (b.register_count || 0), 0), icon: "mdi-cash-register", color: "orange" }
    ]);
    function closeDialog() {
      dialog.value = false;
      formError.value = "";
    }
    function validate() {
      if (!form.name.trim()) {
        formError.value = "Branch name is required";
        return false;
      }
      if (!form.code.trim()) {
        formError.value = "Branch code is required";
        return false;
      }
      formError.value = "";
      return true;
    }
    async function saveBranch() {
      var _a, _b, _c, _d, _e;
      if (!validate()) return;
      saving.value = true;
      try {
        const payload = {
          name: form.name,
          code: form.code,
          city: form.city,
          country: form.country,
          phone: form.phone,
          email: form.email,
          currency_code: form.currency_code,
          timezone: form.timezone,
          tax_rate: form.tax_rate,
          register_count: Number(form.register_count) || 1,
          address_line1: form.address_line1,
          is_active: form.is_active
        };
        if (editing.value && form.id) {
          const updated = await useApi()(`/branches/${form.id}/`, { method: "PATCH", body: payload });
          const idx = branches2.value.findIndex((b) => b.id === form.id);
          if (idx >= 0) branches2.value[idx] = { ...branches2.value[idx], ...updated };
          toast.success("Branch updated");
        } else {
          const created = await useApi()("/branches/", { method: "POST", body: payload });
          branches2.value.push(created);
          toast.success("Branch created");
        }
        dialog.value = false;
      } catch (e) {
        formError.value = ((_b = (_a = e == null ? void 0 : e.data) == null ? void 0 : _a.code) == null ? void 0 : _b[0]) || ((_d = (_c = e == null ? void 0 : e.data) == null ? void 0 : _c.name) == null ? void 0 : _d[0]) || ((_e = e == null ? void 0 : e.data) == null ? void 0 : _e.detail) || "Failed to save branch";
      } finally {
        saving.value = false;
      }
    }
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "br-page" }, _attrs))} data-v-b0f66ae5><div class="br-header" data-v-b0f66ae5><div class="br-header__left" data-v-b0f66ae5><h1 class="br-header__title" data-v-b0f66ae5>Branches</h1><p class="br-header__sub" data-v-b0f66ae5>Manage your store locations, registers, and regional settings</p></div><div class="br-header__actions" data-v-b0f66ae5><button class="br-btn br-btn--ghost" data-v-b0f66ae5>`);
      _push(ssrRenderComponent(VIcon, { size: "18" }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`mdi-refresh`);
          } else {
            return [
              createTextVNode("mdi-refresh")
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(` Refresh </button><button class="br-btn br-btn--primary" data-v-b0f66ae5>`);
      _push(ssrRenderComponent(VIcon, { size: "18" }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`mdi-plus`);
          } else {
            return [
              createTextVNode("mdi-plus")
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(` Add Branch </button></div></div><div class="br-kpi-grid" data-v-b0f66ae5><!--[-->`);
      ssrRenderList(unref(kpis), (kpi) => {
        _push(`<div class="br-kpi" data-v-b0f66ae5><div class="${ssrRenderClass([`br-kpi__icon--${kpi.color}`, "br-kpi__icon"])}" data-v-b0f66ae5>`);
        _push(ssrRenderComponent(VIcon, { size: "20" }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`${ssrInterpolate(kpi.icon)}`);
            } else {
              return [
                createTextVNode(toDisplayString(kpi.icon), 1)
              ];
            }
          }),
          _: 2
        }, _parent));
        _push(`</div><div class="br-kpi__body" data-v-b0f66ae5><p class="br-kpi__label" data-v-b0f66ae5>${ssrInterpolate(kpi.label)}</p><p class="br-kpi__value" data-v-b0f66ae5>${ssrInterpolate(kpi.value)}</p></div></div>`);
      });
      _push(`<!--]--></div><div class="br-toolbar" data-v-b0f66ae5><div class="br-toolbar__search" data-v-b0f66ae5>`);
      _push(ssrRenderComponent(VIcon, {
        size: "18",
        class: "br-toolbar__search-icon"
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
      _push(`<input${ssrRenderAttr("value", unref(search))} class="br-toolbar__search-input" placeholder="Search branches by name, code, city\u2026" data-v-b0f66ae5>`);
      if (unref(search)) {
        _push(`<button class="br-toolbar__search-clear" data-v-b0f66ae5>`);
        _push(ssrRenderComponent(VIcon, { size: "16" }, {
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
        _push(`</button>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</div><div class="br-toolbar__filters" data-v-b0f66ae5><select class="br-toolbar__select" data-v-b0f66ae5><option value="" data-v-b0f66ae5${ssrIncludeBooleanAttr(Array.isArray(unref(statusFilter)) ? ssrLooseContain(unref(statusFilter), "") : ssrLooseEqual(unref(statusFilter), "")) ? " selected" : ""}>All Status</option><option value="active" data-v-b0f66ae5${ssrIncludeBooleanAttr(Array.isArray(unref(statusFilter)) ? ssrLooseContain(unref(statusFilter), "active") : ssrLooseEqual(unref(statusFilter), "active")) ? " selected" : ""}>Active</option><option value="inactive" data-v-b0f66ae5${ssrIncludeBooleanAttr(Array.isArray(unref(statusFilter)) ? ssrLooseContain(unref(statusFilter), "inactive") : ssrLooseEqual(unref(statusFilter), "inactive")) ? " selected" : ""}>Inactive</option></select><select class="br-toolbar__select" data-v-b0f66ae5><option value="" data-v-b0f66ae5${ssrIncludeBooleanAttr(Array.isArray(unref(hqFilter)) ? ssrLooseContain(unref(hqFilter), "") : ssrLooseEqual(unref(hqFilter), "")) ? " selected" : ""}>All Types</option><option value="hq" data-v-b0f66ae5${ssrIncludeBooleanAttr(Array.isArray(unref(hqFilter)) ? ssrLooseContain(unref(hqFilter), "hq") : ssrLooseEqual(unref(hqFilter), "hq")) ? " selected" : ""}>Headquarters</option><option value="store" data-v-b0f66ae5${ssrIncludeBooleanAttr(Array.isArray(unref(hqFilter)) ? ssrLooseContain(unref(hqFilter), "store") : ssrLooseEqual(unref(hqFilter), "store")) ? " selected" : ""}>Stores</option></select></div></div>`);
      if (unref(loading)) {
        _push(`<div class="br-card-grid" data-v-b0f66ae5><!--[-->`);
        ssrRenderList(6, (i) => {
          _push(`<div class="br-card br-card--skeleton" data-v-b0f66ae5><div class="br-skeleton" style="${ssrRenderStyle({ "width": "48px", "height": "48px", "border-radius": "14px" })}" data-v-b0f66ae5></div><div class="br-skeleton" style="${ssrRenderStyle({ "width": "60%", "height": "20px", "margin-top": "16px" })}" data-v-b0f66ae5></div><div class="br-skeleton" style="${ssrRenderStyle({ "width": "40%", "height": "14px", "margin-top": "8px" })}" data-v-b0f66ae5></div><div class="br-skeleton" style="${ssrRenderStyle({ "width": "80%", "height": "14px", "margin-top": "20px" })}" data-v-b0f66ae5></div><div class="br-skeleton" style="${ssrRenderStyle({ "width": "70%", "height": "14px", "margin-top": "6px" })}" data-v-b0f66ae5></div><div class="br-skeleton" style="${ssrRenderStyle({ "width": "100%", "height": "36px", "margin-top": "20px", "border-radius": "10px" })}" data-v-b0f66ae5></div></div>`);
        });
        _push(`<!--]--></div>`);
      } else if (!unref(filteredBranches).length) {
        _push(`<div class="br-empty" data-v-b0f66ae5>`);
        _push(ssrRenderComponent(VIcon, {
          size: "48",
          class: "br-empty__icon"
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`mdi-store-off-outline`);
            } else {
              return [
                createTextVNode("mdi-store-off-outline")
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(`<p class="br-empty__title" data-v-b0f66ae5>No branches found</p><p class="br-empty__sub" data-v-b0f66ae5>Try adjusting your search or create a new branch</p></div>`);
      } else {
        _push(`<div class="br-card-grid" data-v-b0f66ae5><!--[-->`);
        ssrRenderList(unref(filteredBranches), (branch) => {
          _push(`<div class="${ssrRenderClass([{ "br-card--inactive": !branch.is_active }, "br-card"])}" data-v-b0f66ae5><div class="br-card__top" data-v-b0f66ae5><div class="${ssrRenderClass([branch.is_headquarters ? "br-card__icon--hq" : "br-card__icon--store", "br-card__icon"])}" data-v-b0f66ae5>`);
          _push(ssrRenderComponent(VIcon, { size: "24" }, {
            default: withCtx((_, _push2, _parent2, _scopeId) => {
              if (_push2) {
                _push2(`${ssrInterpolate(branch.is_headquarters ? "mdi-domain" : "mdi-store-outline")}`);
              } else {
                return [
                  createTextVNode(toDisplayString(branch.is_headquarters ? "mdi-domain" : "mdi-store-outline"), 1)
                ];
              }
            }),
            _: 2
          }, _parent));
          _push(`</div><div class="br-card__head-info" data-v-b0f66ae5><div class="br-card__name-row" data-v-b0f66ae5><h3 class="br-card__name" data-v-b0f66ae5>${ssrInterpolate(branch.name)}</h3>`);
          if (branch.is_headquarters) {
            _push(`<span class="br-hq-badge" data-v-b0f66ae5>HQ</span>`);
          } else {
            _push(`<!---->`);
          }
          _push(`</div><p class="br-card__code" data-v-b0f66ae5>${ssrInterpolate(branch.code)}</p></div><div class="br-card__menu" data-v-b0f66ae5><button class="br-icon-btn" title="Edit" data-v-b0f66ae5>`);
          _push(ssrRenderComponent(VIcon, { size: "16" }, {
            default: withCtx((_, _push2, _parent2, _scopeId) => {
              if (_push2) {
                _push2(`mdi-pencil-outline`);
              } else {
                return [
                  createTextVNode("mdi-pencil-outline")
                ];
              }
            }),
            _: 2
          }, _parent));
          _push(`</button><button class="${ssrRenderClass([branch.is_active ? "br-icon-btn--danger" : "br-icon-btn--success", "br-icon-btn"])}"${ssrRenderAttr("title", branch.is_active ? "Deactivate" : "Activate")}${ssrIncludeBooleanAttr(branch.is_headquarters) ? " disabled" : ""} data-v-b0f66ae5>`);
          _push(ssrRenderComponent(VIcon, { size: "16" }, {
            default: withCtx((_, _push2, _parent2, _scopeId) => {
              if (_push2) {
                _push2(`${ssrInterpolate(branch.is_active ? "mdi-power-off" : "mdi-power")}`);
              } else {
                return [
                  createTextVNode(toDisplayString(branch.is_active ? "mdi-power-off" : "mdi-power"), 1)
                ];
              }
            }),
            _: 2
          }, _parent));
          _push(`</button></div></div><div class="br-card__status" data-v-b0f66ae5><span class="${ssrRenderClass([branch.is_active ? "br-status--active" : "br-status--inactive", "br-status"])}" data-v-b0f66ae5><span class="br-status__dot" data-v-b0f66ae5></span> ${ssrInterpolate(branch.is_active ? "Active" : "Inactive")}</span><span class="br-card__tax" data-v-b0f66ae5> Tax: <strong data-v-b0f66ae5>${ssrInterpolate(Number(branch.tax_rate))}%</strong></span></div><div class="br-card__info" data-v-b0f66ae5><div class="br-info-row" data-v-b0f66ae5>`);
          _push(ssrRenderComponent(VIcon, {
            size: "15",
            class: "br-info-row__icon"
          }, {
            default: withCtx((_, _push2, _parent2, _scopeId) => {
              if (_push2) {
                _push2(`mdi-map-marker-outline`);
              } else {
                return [
                  createTextVNode("mdi-map-marker-outline")
                ];
              }
            }),
            _: 2
          }, _parent));
          _push(`<span class="br-info-row__text" data-v-b0f66ae5>${ssrInterpolate([branch.city, branch.country].filter(Boolean).join(", ") || "No address set")}</span></div><div class="br-info-row" data-v-b0f66ae5>`);
          _push(ssrRenderComponent(VIcon, {
            size: "15",
            class: "br-info-row__icon"
          }, {
            default: withCtx((_, _push2, _parent2, _scopeId) => {
              if (_push2) {
                _push2(`mdi-phone-outline`);
              } else {
                return [
                  createTextVNode("mdi-phone-outline")
                ];
              }
            }),
            _: 2
          }, _parent));
          if (branch.phone) {
            _push(`<span class="br-info-row__text" data-v-b0f66ae5>${ssrInterpolate(branch.phone)}</span>`);
          } else {
            _push(`<span class="br-info-row__text br-info-row__text--mute" data-v-b0f66ae5>No phone</span>`);
          }
          _push(`</div><div class="br-info-row" data-v-b0f66ae5>`);
          _push(ssrRenderComponent(VIcon, {
            size: "15",
            class: "br-info-row__icon"
          }, {
            default: withCtx((_, _push2, _parent2, _scopeId) => {
              if (_push2) {
                _push2(`mdi-email-outline`);
              } else {
                return [
                  createTextVNode("mdi-email-outline")
                ];
              }
            }),
            _: 2
          }, _parent));
          if (branch.email) {
            _push(`<span class="br-info-row__text br-info-row__text--truncate" data-v-b0f66ae5>${ssrInterpolate(branch.email)}</span>`);
          } else {
            _push(`<span class="br-info-row__text br-info-row__text--mute" data-v-b0f66ae5>No email</span>`);
          }
          _push(`</div><div class="br-info-row" data-v-b0f66ae5>`);
          _push(ssrRenderComponent(VIcon, {
            size: "15",
            class: "br-info-row__icon"
          }, {
            default: withCtx((_, _push2, _parent2, _scopeId) => {
              if (_push2) {
                _push2(`mdi-cash-multiple`);
              } else {
                return [
                  createTextVNode("mdi-cash-multiple")
                ];
              }
            }),
            _: 2
          }, _parent));
          _push(`<span class="br-info-row__text" data-v-b0f66ae5>${ssrInterpolate(branch.currency_code)} \xB7 ${ssrInterpolate(branch.timezone)}</span></div></div><div class="br-card__footer" data-v-b0f66ae5><div class="br-card__stat" data-v-b0f66ae5>`);
          _push(ssrRenderComponent(VIcon, { size: "14" }, {
            default: withCtx((_, _push2, _parent2, _scopeId) => {
              if (_push2) {
                _push2(`mdi-cash-register`);
              } else {
                return [
                  createTextVNode("mdi-cash-register")
                ];
              }
            }),
            _: 2
          }, _parent));
          _push(`<span data-v-b0f66ae5>${ssrInterpolate(branch.register_count || 0)} registers</span></div><button class="br-btn br-btn--ghost br-btn--sm" data-v-b0f66ae5>`);
          _push(ssrRenderComponent(VIcon, { size: "14" }, {
            default: withCtx((_, _push2, _parent2, _scopeId) => {
              if (_push2) {
                _push2(`mdi-pencil`);
              } else {
                return [
                  createTextVNode("mdi-pencil")
                ];
              }
            }),
            _: 2
          }, _parent));
          _push(` Edit </button></div></div>`);
        });
        _push(`<!--]--></div>`);
      }
      _push(ssrRenderComponent(VDialog, {
        modelValue: unref(dialog),
        "onUpdate:modelValue": ($event) => isRef(dialog) ? dialog.value = $event : null,
        "max-width": "640",
        persistent: "",
        "scroll-strategy": "block"
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(ssrRenderComponent(VCard, {
              rounded: "xl",
              class: "br-dialog"
            }, {
              default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                if (_push3) {
                  _push3(`<div class="br-dialog__header" data-v-b0f66ae5${_scopeId2}><div class="${ssrRenderClass([unref(editing) ? "br-dialog__header-icon--edit" : "br-dialog__header-icon--primary", "br-dialog__header-icon"])}" data-v-b0f66ae5${_scopeId2}>`);
                  _push3(ssrRenderComponent(VIcon, { size: "22" }, {
                    default: withCtx((_3, _push4, _parent4, _scopeId3) => {
                      if (_push4) {
                        _push4(`${ssrInterpolate(unref(editing) ? "mdi-pencil" : "mdi-store-plus-outline")}`);
                      } else {
                        return [
                          createTextVNode(toDisplayString(unref(editing) ? "mdi-pencil" : "mdi-store-plus-outline"), 1)
                        ];
                      }
                    }),
                    _: 1
                  }, _parent3, _scopeId2));
                  _push3(`</div><div class="flex-1" data-v-b0f66ae5${_scopeId2}><h3 class="br-dialog__title" data-v-b0f66ae5${_scopeId2}>${ssrInterpolate(unref(editing) ? "Edit Branch" : "Add New Branch")}</h3><p class="br-dialog__sub" data-v-b0f66ae5${_scopeId2}>${ssrInterpolate(unref(editing) ? "Update branch details and settings" : "Create a new store location")}</p></div>`);
                  _push3(ssrRenderComponent(VBtn, {
                    icon: "mdi-close",
                    variant: "text",
                    size: "small",
                    onClick: closeDialog
                  }, null, _parent3, _scopeId2));
                  _push3(`</div>`);
                  _push3(ssrRenderComponent(VDivider, null, null, _parent3, _scopeId2));
                  _push3(`<div class="br-dialog__body" data-v-b0f66ae5${_scopeId2}><div class="br-form-row" data-v-b0f66ae5${_scopeId2}><div class="br-field" data-v-b0f66ae5${_scopeId2}><label class="br-field__label" data-v-b0f66ae5${_scopeId2}>Branch Name</label><input${ssrRenderAttr("value", unref(form).name)} class="br-field__input" placeholder="Downtown Store" data-v-b0f66ae5${_scopeId2}></div><div class="br-field" data-v-b0f66ae5${_scopeId2}><label class="br-field__label" data-v-b0f66ae5${_scopeId2}>Code</label><input${ssrRenderAttr("value", unref(form).code)} class="br-field__input" placeholder="DTN"${ssrIncludeBooleanAttr(unref(editing)) ? " disabled" : ""} data-v-b0f66ae5${_scopeId2}></div></div><div class="br-form-row" data-v-b0f66ae5${_scopeId2}><div class="br-field" data-v-b0f66ae5${_scopeId2}><label class="br-field__label" data-v-b0f66ae5${_scopeId2}>City</label><input${ssrRenderAttr("value", unref(form).city)} class="br-field__input" placeholder="Nairobi" data-v-b0f66ae5${_scopeId2}></div><div class="br-field" data-v-b0f66ae5${_scopeId2}><label class="br-field__label" data-v-b0f66ae5${_scopeId2}>Country</label><input${ssrRenderAttr("value", unref(form).country)} class="br-field__input" placeholder="Kenya" data-v-b0f66ae5${_scopeId2}></div></div><div class="br-form-row" data-v-b0f66ae5${_scopeId2}><div class="br-field" data-v-b0f66ae5${_scopeId2}><label class="br-field__label" data-v-b0f66ae5${_scopeId2}>Phone</label><input${ssrRenderAttr("value", unref(form).phone)} class="br-field__input" placeholder="+254700000000" data-v-b0f66ae5${_scopeId2}></div><div class="br-field" data-v-b0f66ae5${_scopeId2}><label class="br-field__label" data-v-b0f66ae5${_scopeId2}>Email</label><input${ssrRenderAttr("value", unref(form).email)} class="br-field__input" type="email" placeholder="store@domendra.com" data-v-b0f66ae5${_scopeId2}></div></div><div class="br-form-row br-form-row--3" data-v-b0f66ae5${_scopeId2}><div class="br-field" data-v-b0f66ae5${_scopeId2}><label class="br-field__label" data-v-b0f66ae5${_scopeId2}>Currency</label><select class="br-field__input" data-v-b0f66ae5${_scopeId2}><!--[-->`);
                  ssrRenderList(currencyOptions, (c) => {
                    _push3(`<option${ssrRenderAttr("value", c)} data-v-b0f66ae5${ssrIncludeBooleanAttr(Array.isArray(unref(form).currency_code) ? ssrLooseContain(unref(form).currency_code, c) : ssrLooseEqual(unref(form).currency_code, c)) ? " selected" : ""}${_scopeId2}>${ssrInterpolate(c)}</option>`);
                  });
                  _push3(`<!--]--></select></div><div class="br-field" data-v-b0f66ae5${_scopeId2}><label class="br-field__label" data-v-b0f66ae5${_scopeId2}>Tax Rate (%)</label><input${ssrRenderAttr("value", unref(form).tax_rate)} class="br-field__input" type="number" step="0.01" placeholder="16.00" data-v-b0f66ae5${_scopeId2}></div><div class="br-field" data-v-b0f66ae5${_scopeId2}><label class="br-field__label" data-v-b0f66ae5${_scopeId2}>Registers</label><input${ssrRenderAttr("value", unref(form).register_count)} class="br-field__input" type="number" placeholder="1" data-v-b0f66ae5${_scopeId2}></div></div><div class="br-form-row" data-v-b0f66ae5${_scopeId2}><div class="br-field" data-v-b0f66ae5${_scopeId2}><label class="br-field__label" data-v-b0f66ae5${_scopeId2}>Timezone</label><input${ssrRenderAttr("value", unref(form).timezone)} class="br-field__input" placeholder="Africa/Nairobi" data-v-b0f66ae5${_scopeId2}></div><div class="br-field" data-v-b0f66ae5${_scopeId2}><label class="br-field__label" data-v-b0f66ae5${_scopeId2}>Address</label><input${ssrRenderAttr("value", unref(form).address_line1)} class="br-field__input" placeholder="123 Main Street" data-v-b0f66ae5${_scopeId2}></div></div>`);
                  if (unref(formError)) {
                    _push3(`<p class="br-form-error" data-v-b0f66ae5${_scopeId2}>${ssrInterpolate(unref(formError))}</p>`);
                  } else {
                    _push3(`<!---->`);
                  }
                  _push3(`</div>`);
                  _push3(ssrRenderComponent(VDivider, null, null, _parent3, _scopeId2));
                  _push3(`<div class="br-dialog__footer" data-v-b0f66ae5${_scopeId2}><button class="br-btn br-btn--ghost" data-v-b0f66ae5${_scopeId2}>Cancel</button><button class="br-btn br-btn--primary"${ssrIncludeBooleanAttr(unref(saving)) ? " disabled" : ""} data-v-b0f66ae5${_scopeId2}>`);
                  if (unref(saving)) {
                    _push3(ssrRenderComponent(VProgressCircular, {
                      indeterminate: "",
                      size: "16",
                      width: "2",
                      color: "white",
                      class: "mr-2"
                    }, null, _parent3, _scopeId2));
                  } else {
                    _push3(`<!---->`);
                  }
                  _push3(` ${ssrInterpolate(unref(editing) ? "Save Changes" : "Create Branch")}</button></div>`);
                } else {
                  return [
                    createVNode("div", { class: "br-dialog__header" }, [
                      createVNode("div", {
                        class: ["br-dialog__header-icon", unref(editing) ? "br-dialog__header-icon--edit" : "br-dialog__header-icon--primary"]
                      }, [
                        createVNode(VIcon, { size: "22" }, {
                          default: withCtx(() => [
                            createTextVNode(toDisplayString(unref(editing) ? "mdi-pencil" : "mdi-store-plus-outline"), 1)
                          ]),
                          _: 1
                        })
                      ], 2),
                      createVNode("div", { class: "flex-1" }, [
                        createVNode("h3", { class: "br-dialog__title" }, toDisplayString(unref(editing) ? "Edit Branch" : "Add New Branch"), 1),
                        createVNode("p", { class: "br-dialog__sub" }, toDisplayString(unref(editing) ? "Update branch details and settings" : "Create a new store location"), 1)
                      ]),
                      createVNode(VBtn, {
                        icon: "mdi-close",
                        variant: "text",
                        size: "small",
                        onClick: closeDialog
                      })
                    ]),
                    createVNode(VDivider),
                    createVNode("div", { class: "br-dialog__body" }, [
                      createVNode("div", { class: "br-form-row" }, [
                        createVNode("div", { class: "br-field" }, [
                          createVNode("label", { class: "br-field__label" }, "Branch Name"),
                          withDirectives(createVNode("input", {
                            "onUpdate:modelValue": ($event) => unref(form).name = $event,
                            class: "br-field__input",
                            placeholder: "Downtown Store"
                          }, null, 8, ["onUpdate:modelValue"]), [
                            [vModelText, unref(form).name]
                          ])
                        ]),
                        createVNode("div", { class: "br-field" }, [
                          createVNode("label", { class: "br-field__label" }, "Code"),
                          withDirectives(createVNode("input", {
                            "onUpdate:modelValue": ($event) => unref(form).code = $event,
                            class: "br-field__input",
                            placeholder: "DTN",
                            disabled: unref(editing)
                          }, null, 8, ["onUpdate:modelValue", "disabled"]), [
                            [vModelText, unref(form).code]
                          ])
                        ])
                      ]),
                      createVNode("div", { class: "br-form-row" }, [
                        createVNode("div", { class: "br-field" }, [
                          createVNode("label", { class: "br-field__label" }, "City"),
                          withDirectives(createVNode("input", {
                            "onUpdate:modelValue": ($event) => unref(form).city = $event,
                            class: "br-field__input",
                            placeholder: "Nairobi"
                          }, null, 8, ["onUpdate:modelValue"]), [
                            [vModelText, unref(form).city]
                          ])
                        ]),
                        createVNode("div", { class: "br-field" }, [
                          createVNode("label", { class: "br-field__label" }, "Country"),
                          withDirectives(createVNode("input", {
                            "onUpdate:modelValue": ($event) => unref(form).country = $event,
                            class: "br-field__input",
                            placeholder: "Kenya"
                          }, null, 8, ["onUpdate:modelValue"]), [
                            [vModelText, unref(form).country]
                          ])
                        ])
                      ]),
                      createVNode("div", { class: "br-form-row" }, [
                        createVNode("div", { class: "br-field" }, [
                          createVNode("label", { class: "br-field__label" }, "Phone"),
                          withDirectives(createVNode("input", {
                            "onUpdate:modelValue": ($event) => unref(form).phone = $event,
                            class: "br-field__input",
                            placeholder: "+254700000000"
                          }, null, 8, ["onUpdate:modelValue"]), [
                            [vModelText, unref(form).phone]
                          ])
                        ]),
                        createVNode("div", { class: "br-field" }, [
                          createVNode("label", { class: "br-field__label" }, "Email"),
                          withDirectives(createVNode("input", {
                            "onUpdate:modelValue": ($event) => unref(form).email = $event,
                            class: "br-field__input",
                            type: "email",
                            placeholder: "store@domendra.com"
                          }, null, 8, ["onUpdate:modelValue"]), [
                            [vModelText, unref(form).email]
                          ])
                        ])
                      ]),
                      createVNode("div", { class: "br-form-row br-form-row--3" }, [
                        createVNode("div", { class: "br-field" }, [
                          createVNode("label", { class: "br-field__label" }, "Currency"),
                          withDirectives(createVNode("select", {
                            "onUpdate:modelValue": ($event) => unref(form).currency_code = $event,
                            class: "br-field__input"
                          }, [
                            (openBlock(), createBlock(Fragment, null, renderList(currencyOptions, (c) => {
                              return createVNode("option", {
                                key: c,
                                value: c
                              }, toDisplayString(c), 9, ["value"]);
                            }), 64))
                          ], 8, ["onUpdate:modelValue"]), [
                            [vModelSelect, unref(form).currency_code]
                          ])
                        ]),
                        createVNode("div", { class: "br-field" }, [
                          createVNode("label", { class: "br-field__label" }, "Tax Rate (%)"),
                          withDirectives(createVNode("input", {
                            "onUpdate:modelValue": ($event) => unref(form).tax_rate = $event,
                            class: "br-field__input",
                            type: "number",
                            step: "0.01",
                            placeholder: "16.00"
                          }, null, 8, ["onUpdate:modelValue"]), [
                            [vModelText, unref(form).tax_rate]
                          ])
                        ]),
                        createVNode("div", { class: "br-field" }, [
                          createVNode("label", { class: "br-field__label" }, "Registers"),
                          withDirectives(createVNode("input", {
                            "onUpdate:modelValue": ($event) => unref(form).register_count = $event,
                            class: "br-field__input",
                            type: "number",
                            placeholder: "1"
                          }, null, 8, ["onUpdate:modelValue"]), [
                            [vModelText, unref(form).register_count]
                          ])
                        ])
                      ]),
                      createVNode("div", { class: "br-form-row" }, [
                        createVNode("div", { class: "br-field" }, [
                          createVNode("label", { class: "br-field__label" }, "Timezone"),
                          withDirectives(createVNode("input", {
                            "onUpdate:modelValue": ($event) => unref(form).timezone = $event,
                            class: "br-field__input",
                            placeholder: "Africa/Nairobi"
                          }, null, 8, ["onUpdate:modelValue"]), [
                            [vModelText, unref(form).timezone]
                          ])
                        ]),
                        createVNode("div", { class: "br-field" }, [
                          createVNode("label", { class: "br-field__label" }, "Address"),
                          withDirectives(createVNode("input", {
                            "onUpdate:modelValue": ($event) => unref(form).address_line1 = $event,
                            class: "br-field__input",
                            placeholder: "123 Main Street"
                          }, null, 8, ["onUpdate:modelValue"]), [
                            [vModelText, unref(form).address_line1]
                          ])
                        ])
                      ]),
                      unref(formError) ? (openBlock(), createBlock("p", {
                        key: 0,
                        class: "br-form-error"
                      }, toDisplayString(unref(formError)), 1)) : createCommentVNode("", true)
                    ]),
                    createVNode(VDivider),
                    createVNode("div", { class: "br-dialog__footer" }, [
                      createVNode("button", {
                        class: "br-btn br-btn--ghost",
                        onClick: closeDialog
                      }, "Cancel"),
                      createVNode("button", {
                        class: "br-btn br-btn--primary",
                        disabled: unref(saving),
                        onClick: saveBranch
                      }, [
                        unref(saving) ? (openBlock(), createBlock(VProgressCircular, {
                          key: 0,
                          indeterminate: "",
                          size: "16",
                          width: "2",
                          color: "white",
                          class: "mr-2"
                        })) : createCommentVNode("", true),
                        createTextVNode(" " + toDisplayString(unref(editing) ? "Save Changes" : "Create Branch"), 1)
                      ], 8, ["disabled"])
                    ])
                  ];
                }
              }),
              _: 1
            }, _parent2, _scopeId));
          } else {
            return [
              createVNode(VCard, {
                rounded: "xl",
                class: "br-dialog"
              }, {
                default: withCtx(() => [
                  createVNode("div", { class: "br-dialog__header" }, [
                    createVNode("div", {
                      class: ["br-dialog__header-icon", unref(editing) ? "br-dialog__header-icon--edit" : "br-dialog__header-icon--primary"]
                    }, [
                      createVNode(VIcon, { size: "22" }, {
                        default: withCtx(() => [
                          createTextVNode(toDisplayString(unref(editing) ? "mdi-pencil" : "mdi-store-plus-outline"), 1)
                        ]),
                        _: 1
                      })
                    ], 2),
                    createVNode("div", { class: "flex-1" }, [
                      createVNode("h3", { class: "br-dialog__title" }, toDisplayString(unref(editing) ? "Edit Branch" : "Add New Branch"), 1),
                      createVNode("p", { class: "br-dialog__sub" }, toDisplayString(unref(editing) ? "Update branch details and settings" : "Create a new store location"), 1)
                    ]),
                    createVNode(VBtn, {
                      icon: "mdi-close",
                      variant: "text",
                      size: "small",
                      onClick: closeDialog
                    })
                  ]),
                  createVNode(VDivider),
                  createVNode("div", { class: "br-dialog__body" }, [
                    createVNode("div", { class: "br-form-row" }, [
                      createVNode("div", { class: "br-field" }, [
                        createVNode("label", { class: "br-field__label" }, "Branch Name"),
                        withDirectives(createVNode("input", {
                          "onUpdate:modelValue": ($event) => unref(form).name = $event,
                          class: "br-field__input",
                          placeholder: "Downtown Store"
                        }, null, 8, ["onUpdate:modelValue"]), [
                          [vModelText, unref(form).name]
                        ])
                      ]),
                      createVNode("div", { class: "br-field" }, [
                        createVNode("label", { class: "br-field__label" }, "Code"),
                        withDirectives(createVNode("input", {
                          "onUpdate:modelValue": ($event) => unref(form).code = $event,
                          class: "br-field__input",
                          placeholder: "DTN",
                          disabled: unref(editing)
                        }, null, 8, ["onUpdate:modelValue", "disabled"]), [
                          [vModelText, unref(form).code]
                        ])
                      ])
                    ]),
                    createVNode("div", { class: "br-form-row" }, [
                      createVNode("div", { class: "br-field" }, [
                        createVNode("label", { class: "br-field__label" }, "City"),
                        withDirectives(createVNode("input", {
                          "onUpdate:modelValue": ($event) => unref(form).city = $event,
                          class: "br-field__input",
                          placeholder: "Nairobi"
                        }, null, 8, ["onUpdate:modelValue"]), [
                          [vModelText, unref(form).city]
                        ])
                      ]),
                      createVNode("div", { class: "br-field" }, [
                        createVNode("label", { class: "br-field__label" }, "Country"),
                        withDirectives(createVNode("input", {
                          "onUpdate:modelValue": ($event) => unref(form).country = $event,
                          class: "br-field__input",
                          placeholder: "Kenya"
                        }, null, 8, ["onUpdate:modelValue"]), [
                          [vModelText, unref(form).country]
                        ])
                      ])
                    ]),
                    createVNode("div", { class: "br-form-row" }, [
                      createVNode("div", { class: "br-field" }, [
                        createVNode("label", { class: "br-field__label" }, "Phone"),
                        withDirectives(createVNode("input", {
                          "onUpdate:modelValue": ($event) => unref(form).phone = $event,
                          class: "br-field__input",
                          placeholder: "+254700000000"
                        }, null, 8, ["onUpdate:modelValue"]), [
                          [vModelText, unref(form).phone]
                        ])
                      ]),
                      createVNode("div", { class: "br-field" }, [
                        createVNode("label", { class: "br-field__label" }, "Email"),
                        withDirectives(createVNode("input", {
                          "onUpdate:modelValue": ($event) => unref(form).email = $event,
                          class: "br-field__input",
                          type: "email",
                          placeholder: "store@domendra.com"
                        }, null, 8, ["onUpdate:modelValue"]), [
                          [vModelText, unref(form).email]
                        ])
                      ])
                    ]),
                    createVNode("div", { class: "br-form-row br-form-row--3" }, [
                      createVNode("div", { class: "br-field" }, [
                        createVNode("label", { class: "br-field__label" }, "Currency"),
                        withDirectives(createVNode("select", {
                          "onUpdate:modelValue": ($event) => unref(form).currency_code = $event,
                          class: "br-field__input"
                        }, [
                          (openBlock(), createBlock(Fragment, null, renderList(currencyOptions, (c) => {
                            return createVNode("option", {
                              key: c,
                              value: c
                            }, toDisplayString(c), 9, ["value"]);
                          }), 64))
                        ], 8, ["onUpdate:modelValue"]), [
                          [vModelSelect, unref(form).currency_code]
                        ])
                      ]),
                      createVNode("div", { class: "br-field" }, [
                        createVNode("label", { class: "br-field__label" }, "Tax Rate (%)"),
                        withDirectives(createVNode("input", {
                          "onUpdate:modelValue": ($event) => unref(form).tax_rate = $event,
                          class: "br-field__input",
                          type: "number",
                          step: "0.01",
                          placeholder: "16.00"
                        }, null, 8, ["onUpdate:modelValue"]), [
                          [vModelText, unref(form).tax_rate]
                        ])
                      ]),
                      createVNode("div", { class: "br-field" }, [
                        createVNode("label", { class: "br-field__label" }, "Registers"),
                        withDirectives(createVNode("input", {
                          "onUpdate:modelValue": ($event) => unref(form).register_count = $event,
                          class: "br-field__input",
                          type: "number",
                          placeholder: "1"
                        }, null, 8, ["onUpdate:modelValue"]), [
                          [vModelText, unref(form).register_count]
                        ])
                      ])
                    ]),
                    createVNode("div", { class: "br-form-row" }, [
                      createVNode("div", { class: "br-field" }, [
                        createVNode("label", { class: "br-field__label" }, "Timezone"),
                        withDirectives(createVNode("input", {
                          "onUpdate:modelValue": ($event) => unref(form).timezone = $event,
                          class: "br-field__input",
                          placeholder: "Africa/Nairobi"
                        }, null, 8, ["onUpdate:modelValue"]), [
                          [vModelText, unref(form).timezone]
                        ])
                      ]),
                      createVNode("div", { class: "br-field" }, [
                        createVNode("label", { class: "br-field__label" }, "Address"),
                        withDirectives(createVNode("input", {
                          "onUpdate:modelValue": ($event) => unref(form).address_line1 = $event,
                          class: "br-field__input",
                          placeholder: "123 Main Street"
                        }, null, 8, ["onUpdate:modelValue"]), [
                          [vModelText, unref(form).address_line1]
                        ])
                      ])
                    ]),
                    unref(formError) ? (openBlock(), createBlock("p", {
                      key: 0,
                      class: "br-form-error"
                    }, toDisplayString(unref(formError)), 1)) : createCommentVNode("", true)
                  ]),
                  createVNode(VDivider),
                  createVNode("div", { class: "br-dialog__footer" }, [
                    createVNode("button", {
                      class: "br-btn br-btn--ghost",
                      onClick: closeDialog
                    }, "Cancel"),
                    createVNode("button", {
                      class: "br-btn br-btn--primary",
                      disabled: unref(saving),
                      onClick: saveBranch
                    }, [
                      unref(saving) ? (openBlock(), createBlock(VProgressCircular, {
                        key: 0,
                        indeterminate: "",
                        size: "16",
                        width: "2",
                        color: "white",
                        class: "mr-2"
                      })) : createCommentVNode("", true),
                      createTextVNode(" " + toDisplayString(unref(editing) ? "Save Changes" : "Create Branch"), 1)
                    ], 8, ["disabled"])
                  ])
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
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/admin/branches.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const branches = /* @__PURE__ */ _export_sfc(_sfc_main, [["__scopeId", "data-v-b0f66ae5"]]);

export { branches as default };
//# sourceMappingURL=branches-mY2wOfGf.mjs.map
