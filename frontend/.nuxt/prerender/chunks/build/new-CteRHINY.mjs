import { ref, computed, mergeProps, withCtx, createTextVNode, unref, createVNode, toDisplayString, useSSRContext } from 'file://D:/Projects/MY-APPS-2/DomendraPOS/frontend/node_modules/vue/index.mjs';
import { ssrRenderAttrs, ssrRenderComponent, ssrInterpolate, ssrRenderStyle } from 'file://D:/Projects/MY-APPS-2/DomendraPOS/frontend/node_modules/vue/server-renderer/index.mjs';
import { u as useFormat } from './useFormat-BvVWDMYe.mjs';
import { _ as _export_sfc, D as useToast, E as useRoute$1, Q as useRouter$1, a as VIcon, c as VBtn, Y as VForm, g as VCard, e as VRow, f as VCol, v as VTextField, Z as VCombobox, $ as VTextarea, J as VSelect, X as VCheckbox } from './server.mjs';
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

const _sfc_main = {
  __name: "new",
  __ssrInlineRender: true,
  setup(__props) {
    const { currency } = useFormat();
    const { success, error: errorToast } = useToast();
    const route = useRoute$1();
    const router = useRouter$1();
    const saving = ref(false);
    const formRef = ref();
    const defaultCategories = ["Rent", "Utilities", "Salaries", "Supplies", "Marketing", "Transport", "Maintenance", "Miscellaneous", "Insurance", "Legal", "Equipment", "Taxes", "Licenses"];
    const methodList = ["cash", "mpesa", "card", "bank_transfer", "cheque"];
    const statusOptions = ["Unpaid", "Pending Approval", "Approved", "Paid", "Cancelled"];
    const vendorList = [];
    const customCategories = ref([]);
    const categoryList = computed(() => {
      const customs = customCategories.value.map((c) => typeof c === "string" ? c : c.name).filter(Boolean);
      return [.../* @__PURE__ */ new Set([...defaultCategories, ...customs])].sort();
    });
    const form = ref({
      description: "",
      reference: "",
      category: "Miscellaneous",
      notes: "",
      amount: 0,
      tax: 0,
      payment_method: "cash",
      payment_reference: "",
      vendor: "",
      date: (/* @__PURE__ */ new Date()).toISOString().slice(0, 10),
      due_date: "",
      cost_price: 0,
      retail_price: 0,
      status: "Unpaid",
      recurring: false
    });
    const summaryTotal = computed(() => Number(form.value.amount || 0) + Number(form.value.tax || 0));
    const editing = computed(() => !!route.query.id);
    function goBack() {
      router.push("/expenses");
    }
    function formatMoney(v) {
      const n = Number(v) || 0;
      return "KSh" + n.toLocaleString("en-GB", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    }
    async function saveExpense() {
      saving.value = true;
      try {
        const payload = {
          description: form.value.description,
          reference: form.value.reference,
          category: form.value.category,
          amount: form.value.amount,
          cost_price: form.value.cost_price,
          retail_price: form.value.retail_price,
          payment_method: form.value.payment_method,
          payment_reference: form.value.payment_reference,
          vendor: form.value.vendor,
          date: form.value.date,
          due_date: form.value.due_date || null,
          notes: form.value.notes,
          status: form.value.status,
          recurring: form.value.recurring,
          tax: form.value.tax
        };
        if (editing.value) {
          await useApi()(`/accounting/expenses/${route.query.id}/`, { method: "PATCH", body: payload });
          success("Expense updated successfully");
        } else {
          await useApi()("/accounting/expenses/", { method: "POST", body: payload });
          success("Expense recorded successfully");
        }
        router.push("/expenses");
      } catch {
        errorToast(editing.value ? "Failed to update expense" : "Failed to record expense");
      } finally {
        saving.value = false;
      }
    }
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "az-page" }, _attrs))} data-v-62f6a138><div class="az-exp-header" data-v-62f6a138><div class="az-exp-header__info" data-v-62f6a138><div class="az-exp-header__icon" data-v-62f6a138>`);
      _push(ssrRenderComponent(VIcon, {
        size: "28",
        color: "primary"
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`mdi-cash-minus`);
          } else {
            return [
              createTextVNode("mdi-cash-minus")
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`</div><div data-v-62f6a138><h1 class="text-h5 font-weight-bold mb-1" data-v-62f6a138>${ssrInterpolate(unref(editing) ? "Edit Expense" : "New Expense")}</h1><p class="text-body-2 text-medium-emphasis ma-0" data-v-62f6a138>${ssrInterpolate(unref(editing) ? "Update expense details" : "Record a new business expense")}</p></div></div>`);
      _push(ssrRenderComponent(VBtn, {
        variant: "outlined",
        density: "comfortable",
        "prepend-icon": "mdi-arrow-left",
        onClick: goBack
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`Back`);
          } else {
            return [
              createTextVNode("Back")
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`</div>`);
      _push(ssrRenderComponent(VForm, {
        ref_key: "formRef",
        ref: formRef,
        onSubmit: saveExpense,
        class: "az-exp-layout"
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<div class="az-exp-layout__form" data-v-62f6a138${_scopeId}>`);
            _push2(ssrRenderComponent(VCard, {
              variant: "outlined",
              class: "az-exp-card az-exp-card--blue mb-4"
            }, {
              default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                if (_push3) {
                  _push3(`<div class="az-exp-card__header" data-v-62f6a138${_scopeId2}><div class="az-exp-card__icon az-exp-card__icon--blue" data-v-62f6a138${_scopeId2}>`);
                  _push3(ssrRenderComponent(VIcon, { size: "18" }, {
                    default: withCtx((_3, _push4, _parent4, _scopeId3) => {
                      if (_push4) {
                        _push4(`mdi-information-outline`);
                      } else {
                        return [
                          createTextVNode("mdi-information-outline")
                        ];
                      }
                    }),
                    _: 1
                  }, _parent3, _scopeId2));
                  _push3(`</div><span data-v-62f6a138${_scopeId2}>Expense Details</span></div>`);
                  _push3(ssrRenderComponent(VRow, null, {
                    default: withCtx((_3, _push4, _parent4, _scopeId3) => {
                      if (_push4) {
                        _push4(ssrRenderComponent(VCol, {
                          cols: "12",
                          md: "6"
                        }, {
                          default: withCtx((_4, _push5, _parent5, _scopeId4) => {
                            if (_push5) {
                              _push5(ssrRenderComponent(VTextField, {
                                modelValue: unref(form).description,
                                "onUpdate:modelValue": ($event) => unref(form).description = $event,
                                label: "Title *",
                                placeholder: "e.g. Office rent \u2014 May",
                                variant: "outlined",
                                density: "comfortable",
                                rules: [(v) => !!v || "Title is required"],
                                "hide-details": "auto"
                              }, null, _parent5, _scopeId4));
                            } else {
                              return [
                                createVNode(VTextField, {
                                  modelValue: unref(form).description,
                                  "onUpdate:modelValue": ($event) => unref(form).description = $event,
                                  label: "Title *",
                                  placeholder: "e.g. Office rent \u2014 May",
                                  variant: "outlined",
                                  density: "comfortable",
                                  rules: [(v) => !!v || "Title is required"],
                                  "hide-details": "auto"
                                }, null, 8, ["modelValue", "onUpdate:modelValue", "rules"])
                              ];
                            }
                          }),
                          _: 1
                        }, _parent4, _scopeId3));
                        _push4(ssrRenderComponent(VCol, {
                          cols: "12",
                          md: "3"
                        }, {
                          default: withCtx((_4, _push5, _parent5, _scopeId4) => {
                            if (_push5) {
                              _push5(ssrRenderComponent(VTextField, {
                                modelValue: unref(form).reference,
                                "onUpdate:modelValue": ($event) => unref(form).reference = $event,
                                label: "Reference",
                                placeholder: "Auto-generated",
                                variant: "outlined",
                                density: "comfortable",
                                hint: "Leave blank to auto-generate",
                                "persistent-hint": "",
                                "hide-details": "auto"
                              }, null, _parent5, _scopeId4));
                            } else {
                              return [
                                createVNode(VTextField, {
                                  modelValue: unref(form).reference,
                                  "onUpdate:modelValue": ($event) => unref(form).reference = $event,
                                  label: "Reference",
                                  placeholder: "Auto-generated",
                                  variant: "outlined",
                                  density: "comfortable",
                                  hint: "Leave blank to auto-generate",
                                  "persistent-hint": "",
                                  "hide-details": "auto"
                                }, null, 8, ["modelValue", "onUpdate:modelValue"])
                              ];
                            }
                          }),
                          _: 1
                        }, _parent4, _scopeId3));
                        _push4(ssrRenderComponent(VCol, {
                          cols: "12",
                          md: "3"
                        }, {
                          default: withCtx((_4, _push5, _parent5, _scopeId4) => {
                            if (_push5) {
                              _push5(ssrRenderComponent(VCombobox, {
                                modelValue: unref(form).category,
                                "onUpdate:modelValue": ($event) => unref(form).category = $event,
                                items: unref(categoryList),
                                label: "Category",
                                variant: "outlined",
                                density: "comfortable",
                                "prepend-inner-icon": "mdi-shape",
                                "hide-details": "auto"
                              }, null, _parent5, _scopeId4));
                            } else {
                              return [
                                createVNode(VCombobox, {
                                  modelValue: unref(form).category,
                                  "onUpdate:modelValue": ($event) => unref(form).category = $event,
                                  items: unref(categoryList),
                                  label: "Category",
                                  variant: "outlined",
                                  density: "comfortable",
                                  "prepend-inner-icon": "mdi-shape",
                                  "hide-details": "auto"
                                }, null, 8, ["modelValue", "onUpdate:modelValue", "items"])
                              ];
                            }
                          }),
                          _: 1
                        }, _parent4, _scopeId3));
                        _push4(ssrRenderComponent(VCol, { cols: "12" }, {
                          default: withCtx((_4, _push5, _parent5, _scopeId4) => {
                            if (_push5) {
                              _push5(ssrRenderComponent(VTextarea, {
                                modelValue: unref(form).notes,
                                "onUpdate:modelValue": ($event) => unref(form).notes = $event,
                                label: "Description",
                                variant: "outlined",
                                density: "comfortable",
                                rows: "2",
                                "auto-grow": "",
                                "hide-details": "auto"
                              }, null, _parent5, _scopeId4));
                            } else {
                              return [
                                createVNode(VTextarea, {
                                  modelValue: unref(form).notes,
                                  "onUpdate:modelValue": ($event) => unref(form).notes = $event,
                                  label: "Description",
                                  variant: "outlined",
                                  density: "comfortable",
                                  rows: "2",
                                  "auto-grow": "",
                                  "hide-details": "auto"
                                }, null, 8, ["modelValue", "onUpdate:modelValue"])
                              ];
                            }
                          }),
                          _: 1
                        }, _parent4, _scopeId3));
                      } else {
                        return [
                          createVNode(VCol, {
                            cols: "12",
                            md: "6"
                          }, {
                            default: withCtx(() => [
                              createVNode(VTextField, {
                                modelValue: unref(form).description,
                                "onUpdate:modelValue": ($event) => unref(form).description = $event,
                                label: "Title *",
                                placeholder: "e.g. Office rent \u2014 May",
                                variant: "outlined",
                                density: "comfortable",
                                rules: [(v) => !!v || "Title is required"],
                                "hide-details": "auto"
                              }, null, 8, ["modelValue", "onUpdate:modelValue", "rules"])
                            ]),
                            _: 1
                          }),
                          createVNode(VCol, {
                            cols: "12",
                            md: "3"
                          }, {
                            default: withCtx(() => [
                              createVNode(VTextField, {
                                modelValue: unref(form).reference,
                                "onUpdate:modelValue": ($event) => unref(form).reference = $event,
                                label: "Reference",
                                placeholder: "Auto-generated",
                                variant: "outlined",
                                density: "comfortable",
                                hint: "Leave blank to auto-generate",
                                "persistent-hint": "",
                                "hide-details": "auto"
                              }, null, 8, ["modelValue", "onUpdate:modelValue"])
                            ]),
                            _: 1
                          }),
                          createVNode(VCol, {
                            cols: "12",
                            md: "3"
                          }, {
                            default: withCtx(() => [
                              createVNode(VCombobox, {
                                modelValue: unref(form).category,
                                "onUpdate:modelValue": ($event) => unref(form).category = $event,
                                items: unref(categoryList),
                                label: "Category",
                                variant: "outlined",
                                density: "comfortable",
                                "prepend-inner-icon": "mdi-shape",
                                "hide-details": "auto"
                              }, null, 8, ["modelValue", "onUpdate:modelValue", "items"])
                            ]),
                            _: 1
                          }),
                          createVNode(VCol, { cols: "12" }, {
                            default: withCtx(() => [
                              createVNode(VTextarea, {
                                modelValue: unref(form).notes,
                                "onUpdate:modelValue": ($event) => unref(form).notes = $event,
                                label: "Description",
                                variant: "outlined",
                                density: "comfortable",
                                rows: "2",
                                "auto-grow": "",
                                "hide-details": "auto"
                              }, null, 8, ["modelValue", "onUpdate:modelValue"])
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
                    createVNode("div", { class: "az-exp-card__header" }, [
                      createVNode("div", { class: "az-exp-card__icon az-exp-card__icon--blue" }, [
                        createVNode(VIcon, { size: "18" }, {
                          default: withCtx(() => [
                            createTextVNode("mdi-information-outline")
                          ]),
                          _: 1
                        })
                      ]),
                      createVNode("span", null, "Expense Details")
                    ]),
                    createVNode(VRow, null, {
                      default: withCtx(() => [
                        createVNode(VCol, {
                          cols: "12",
                          md: "6"
                        }, {
                          default: withCtx(() => [
                            createVNode(VTextField, {
                              modelValue: unref(form).description,
                              "onUpdate:modelValue": ($event) => unref(form).description = $event,
                              label: "Title *",
                              placeholder: "e.g. Office rent \u2014 May",
                              variant: "outlined",
                              density: "comfortable",
                              rules: [(v) => !!v || "Title is required"],
                              "hide-details": "auto"
                            }, null, 8, ["modelValue", "onUpdate:modelValue", "rules"])
                          ]),
                          _: 1
                        }),
                        createVNode(VCol, {
                          cols: "12",
                          md: "3"
                        }, {
                          default: withCtx(() => [
                            createVNode(VTextField, {
                              modelValue: unref(form).reference,
                              "onUpdate:modelValue": ($event) => unref(form).reference = $event,
                              label: "Reference",
                              placeholder: "Auto-generated",
                              variant: "outlined",
                              density: "comfortable",
                              hint: "Leave blank to auto-generate",
                              "persistent-hint": "",
                              "hide-details": "auto"
                            }, null, 8, ["modelValue", "onUpdate:modelValue"])
                          ]),
                          _: 1
                        }),
                        createVNode(VCol, {
                          cols: "12",
                          md: "3"
                        }, {
                          default: withCtx(() => [
                            createVNode(VCombobox, {
                              modelValue: unref(form).category,
                              "onUpdate:modelValue": ($event) => unref(form).category = $event,
                              items: unref(categoryList),
                              label: "Category",
                              variant: "outlined",
                              density: "comfortable",
                              "prepend-inner-icon": "mdi-shape",
                              "hide-details": "auto"
                            }, null, 8, ["modelValue", "onUpdate:modelValue", "items"])
                          ]),
                          _: 1
                        }),
                        createVNode(VCol, { cols: "12" }, {
                          default: withCtx(() => [
                            createVNode(VTextarea, {
                              modelValue: unref(form).notes,
                              "onUpdate:modelValue": ($event) => unref(form).notes = $event,
                              label: "Description",
                              variant: "outlined",
                              density: "comfortable",
                              rows: "2",
                              "auto-grow": "",
                              "hide-details": "auto"
                            }, null, 8, ["modelValue", "onUpdate:modelValue"])
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
              variant: "outlined",
              class: "az-exp-card az-exp-card--green mb-4"
            }, {
              default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                if (_push3) {
                  _push3(`<div class="az-exp-card__header" data-v-62f6a138${_scopeId2}><div class="az-exp-card__icon az-exp-card__icon--green" data-v-62f6a138${_scopeId2}>`);
                  _push3(ssrRenderComponent(VIcon, { size: "18" }, {
                    default: withCtx((_3, _push4, _parent4, _scopeId3) => {
                      if (_push4) {
                        _push4(`mdi-cash`);
                      } else {
                        return [
                          createTextVNode("mdi-cash")
                        ];
                      }
                    }),
                    _: 1
                  }, _parent3, _scopeId2));
                  _push3(`</div><span data-v-62f6a138${_scopeId2}>Amount &amp; Payment</span></div>`);
                  _push3(ssrRenderComponent(VRow, null, {
                    default: withCtx((_3, _push4, _parent4, _scopeId3) => {
                      if (_push4) {
                        _push4(ssrRenderComponent(VCol, {
                          cols: "12",
                          md: "3"
                        }, {
                          default: withCtx((_4, _push5, _parent5, _scopeId4) => {
                            if (_push5) {
                              _push5(ssrRenderComponent(VTextField, {
                                modelValue: unref(form).amount,
                                "onUpdate:modelValue": ($event) => unref(form).amount = $event,
                                modelModifiers: { number: true },
                                label: "Amount *",
                                type: "number",
                                prefix: "KSh",
                                variant: "outlined",
                                density: "comfortable",
                                rules: [(v) => v > 0 || "Amount must be greater than 0"],
                                "hide-details": "auto"
                              }, null, _parent5, _scopeId4));
                            } else {
                              return [
                                createVNode(VTextField, {
                                  modelValue: unref(form).amount,
                                  "onUpdate:modelValue": ($event) => unref(form).amount = $event,
                                  modelModifiers: { number: true },
                                  label: "Amount *",
                                  type: "number",
                                  prefix: "KSh",
                                  variant: "outlined",
                                  density: "comfortable",
                                  rules: [(v) => v > 0 || "Amount must be greater than 0"],
                                  "hide-details": "auto"
                                }, null, 8, ["modelValue", "onUpdate:modelValue", "rules"])
                              ];
                            }
                          }),
                          _: 1
                        }, _parent4, _scopeId3));
                        _push4(ssrRenderComponent(VCol, {
                          cols: "12",
                          md: "3"
                        }, {
                          default: withCtx((_4, _push5, _parent5, _scopeId4) => {
                            if (_push5) {
                              _push5(ssrRenderComponent(VTextField, {
                                modelValue: unref(form).tax,
                                "onUpdate:modelValue": ($event) => unref(form).tax = $event,
                                modelModifiers: { number: true },
                                label: "Tax / VAT",
                                type: "number",
                                prefix: "KSh",
                                variant: "outlined",
                                density: "comfortable",
                                "hide-details": "auto"
                              }, null, _parent5, _scopeId4));
                            } else {
                              return [
                                createVNode(VTextField, {
                                  modelValue: unref(form).tax,
                                  "onUpdate:modelValue": ($event) => unref(form).tax = $event,
                                  modelModifiers: { number: true },
                                  label: "Tax / VAT",
                                  type: "number",
                                  prefix: "KSh",
                                  variant: "outlined",
                                  density: "comfortable",
                                  "hide-details": "auto"
                                }, null, 8, ["modelValue", "onUpdate:modelValue"])
                              ];
                            }
                          }),
                          _: 1
                        }, _parent4, _scopeId3));
                        _push4(ssrRenderComponent(VCol, {
                          cols: "12",
                          md: "3"
                        }, {
                          default: withCtx((_4, _push5, _parent5, _scopeId4) => {
                            if (_push5) {
                              _push5(ssrRenderComponent(VSelect, {
                                modelValue: unref(form).payment_method,
                                "onUpdate:modelValue": ($event) => unref(form).payment_method = $event,
                                items: methodList,
                                label: "Payment Method",
                                variant: "outlined",
                                density: "comfortable",
                                "prepend-inner-icon": "mdi-credit-card-outline",
                                "hide-details": "auto"
                              }, null, _parent5, _scopeId4));
                            } else {
                              return [
                                createVNode(VSelect, {
                                  modelValue: unref(form).payment_method,
                                  "onUpdate:modelValue": ($event) => unref(form).payment_method = $event,
                                  items: methodList,
                                  label: "Payment Method",
                                  variant: "outlined",
                                  density: "comfortable",
                                  "prepend-inner-icon": "mdi-credit-card-outline",
                                  "hide-details": "auto"
                                }, null, 8, ["modelValue", "onUpdate:modelValue"])
                              ];
                            }
                          }),
                          _: 1
                        }, _parent4, _scopeId3));
                        _push4(ssrRenderComponent(VCol, {
                          cols: "12",
                          md: "3"
                        }, {
                          default: withCtx((_4, _push5, _parent5, _scopeId4) => {
                            if (_push5) {
                              _push5(ssrRenderComponent(VTextField, {
                                modelValue: unref(form).payment_reference,
                                "onUpdate:modelValue": ($event) => unref(form).payment_reference = $event,
                                label: "Payment Reference",
                                placeholder: "M-Pesa code, cheque #",
                                variant: "outlined",
                                density: "comfortable",
                                "hide-details": "auto"
                              }, null, _parent5, _scopeId4));
                            } else {
                              return [
                                createVNode(VTextField, {
                                  modelValue: unref(form).payment_reference,
                                  "onUpdate:modelValue": ($event) => unref(form).payment_reference = $event,
                                  label: "Payment Reference",
                                  placeholder: "M-Pesa code, cheque #",
                                  variant: "outlined",
                                  density: "comfortable",
                                  "hide-details": "auto"
                                }, null, 8, ["modelValue", "onUpdate:modelValue"])
                              ];
                            }
                          }),
                          _: 1
                        }, _parent4, _scopeId3));
                        _push4(ssrRenderComponent(VCol, {
                          cols: "12",
                          md: "6"
                        }, {
                          default: withCtx((_4, _push5, _parent5, _scopeId4) => {
                            if (_push5) {
                              _push5(ssrRenderComponent(VCombobox, {
                                modelValue: unref(form).vendor,
                                "onUpdate:modelValue": ($event) => unref(form).vendor = $event,
                                items: vendorList,
                                label: "Vendor / Payee",
                                variant: "outlined",
                                density: "comfortable",
                                "prepend-inner-icon": "mdi-truck-delivery",
                                hint: "Pick a supplier or type any vendor name",
                                "persistent-hint": "",
                                "hide-details": "auto"
                              }, null, _parent5, _scopeId4));
                            } else {
                              return [
                                createVNode(VCombobox, {
                                  modelValue: unref(form).vendor,
                                  "onUpdate:modelValue": ($event) => unref(form).vendor = $event,
                                  items: vendorList,
                                  label: "Vendor / Payee",
                                  variant: "outlined",
                                  density: "comfortable",
                                  "prepend-inner-icon": "mdi-truck-delivery",
                                  hint: "Pick a supplier or type any vendor name",
                                  "persistent-hint": "",
                                  "hide-details": "auto"
                                }, null, 8, ["modelValue", "onUpdate:modelValue"])
                              ];
                            }
                          }),
                          _: 1
                        }, _parent4, _scopeId3));
                        _push4(ssrRenderComponent(VCol, {
                          cols: "12",
                          md: "3"
                        }, {
                          default: withCtx((_4, _push5, _parent5, _scopeId4) => {
                            if (_push5) {
                              _push5(ssrRenderComponent(VTextField, {
                                modelValue: unref(form).date,
                                "onUpdate:modelValue": ($event) => unref(form).date = $event,
                                label: "Expense Date *",
                                type: "date",
                                variant: "outlined",
                                density: "comfortable",
                                rules: [(v) => !!v || "Date is required"],
                                "hide-details": "auto"
                              }, null, _parent5, _scopeId4));
                            } else {
                              return [
                                createVNode(VTextField, {
                                  modelValue: unref(form).date,
                                  "onUpdate:modelValue": ($event) => unref(form).date = $event,
                                  label: "Expense Date *",
                                  type: "date",
                                  variant: "outlined",
                                  density: "comfortable",
                                  rules: [(v) => !!v || "Date is required"],
                                  "hide-details": "auto"
                                }, null, 8, ["modelValue", "onUpdate:modelValue", "rules"])
                              ];
                            }
                          }),
                          _: 1
                        }, _parent4, _scopeId3));
                        _push4(ssrRenderComponent(VCol, {
                          cols: "12",
                          md: "3"
                        }, {
                          default: withCtx((_4, _push5, _parent5, _scopeId4) => {
                            if (_push5) {
                              _push5(ssrRenderComponent(VTextField, {
                                modelValue: unref(form).due_date,
                                "onUpdate:modelValue": ($event) => unref(form).due_date = $event,
                                label: "Due Date",
                                type: "date",
                                variant: "outlined",
                                density: "comfortable",
                                hint: "Optional",
                                "persistent-hint": "",
                                "hide-details": "auto"
                              }, null, _parent5, _scopeId4));
                            } else {
                              return [
                                createVNode(VTextField, {
                                  modelValue: unref(form).due_date,
                                  "onUpdate:modelValue": ($event) => unref(form).due_date = $event,
                                  label: "Due Date",
                                  type: "date",
                                  variant: "outlined",
                                  density: "comfortable",
                                  hint: "Optional",
                                  "persistent-hint": "",
                                  "hide-details": "auto"
                                }, null, 8, ["modelValue", "onUpdate:modelValue"])
                              ];
                            }
                          }),
                          _: 1
                        }, _parent4, _scopeId3));
                        _push4(ssrRenderComponent(VCol, {
                          cols: "12",
                          md: "3"
                        }, {
                          default: withCtx((_4, _push5, _parent5, _scopeId4) => {
                            if (_push5) {
                              _push5(ssrRenderComponent(VTextField, {
                                modelValue: unref(form).cost_price,
                                "onUpdate:modelValue": ($event) => unref(form).cost_price = $event,
                                modelModifiers: { number: true },
                                label: "Cost Price",
                                type: "number",
                                prefix: "KSh",
                                variant: "outlined",
                                density: "comfortable",
                                "hide-details": "auto"
                              }, null, _parent5, _scopeId4));
                            } else {
                              return [
                                createVNode(VTextField, {
                                  modelValue: unref(form).cost_price,
                                  "onUpdate:modelValue": ($event) => unref(form).cost_price = $event,
                                  modelModifiers: { number: true },
                                  label: "Cost Price",
                                  type: "number",
                                  prefix: "KSh",
                                  variant: "outlined",
                                  density: "comfortable",
                                  "hide-details": "auto"
                                }, null, 8, ["modelValue", "onUpdate:modelValue"])
                              ];
                            }
                          }),
                          _: 1
                        }, _parent4, _scopeId3));
                        _push4(ssrRenderComponent(VCol, {
                          cols: "12",
                          md: "3"
                        }, {
                          default: withCtx((_4, _push5, _parent5, _scopeId4) => {
                            if (_push5) {
                              _push5(ssrRenderComponent(VTextField, {
                                modelValue: unref(form).retail_price,
                                "onUpdate:modelValue": ($event) => unref(form).retail_price = $event,
                                modelModifiers: { number: true },
                                label: "Retail Price",
                                type: "number",
                                prefix: "KSh",
                                variant: "outlined",
                                density: "comfortable",
                                "hide-details": "auto"
                              }, null, _parent5, _scopeId4));
                            } else {
                              return [
                                createVNode(VTextField, {
                                  modelValue: unref(form).retail_price,
                                  "onUpdate:modelValue": ($event) => unref(form).retail_price = $event,
                                  modelModifiers: { number: true },
                                  label: "Retail Price",
                                  type: "number",
                                  prefix: "KSh",
                                  variant: "outlined",
                                  density: "comfortable",
                                  "hide-details": "auto"
                                }, null, 8, ["modelValue", "onUpdate:modelValue"])
                              ];
                            }
                          }),
                          _: 1
                        }, _parent4, _scopeId3));
                      } else {
                        return [
                          createVNode(VCol, {
                            cols: "12",
                            md: "3"
                          }, {
                            default: withCtx(() => [
                              createVNode(VTextField, {
                                modelValue: unref(form).amount,
                                "onUpdate:modelValue": ($event) => unref(form).amount = $event,
                                modelModifiers: { number: true },
                                label: "Amount *",
                                type: "number",
                                prefix: "KSh",
                                variant: "outlined",
                                density: "comfortable",
                                rules: [(v) => v > 0 || "Amount must be greater than 0"],
                                "hide-details": "auto"
                              }, null, 8, ["modelValue", "onUpdate:modelValue", "rules"])
                            ]),
                            _: 1
                          }),
                          createVNode(VCol, {
                            cols: "12",
                            md: "3"
                          }, {
                            default: withCtx(() => [
                              createVNode(VTextField, {
                                modelValue: unref(form).tax,
                                "onUpdate:modelValue": ($event) => unref(form).tax = $event,
                                modelModifiers: { number: true },
                                label: "Tax / VAT",
                                type: "number",
                                prefix: "KSh",
                                variant: "outlined",
                                density: "comfortable",
                                "hide-details": "auto"
                              }, null, 8, ["modelValue", "onUpdate:modelValue"])
                            ]),
                            _: 1
                          }),
                          createVNode(VCol, {
                            cols: "12",
                            md: "3"
                          }, {
                            default: withCtx(() => [
                              createVNode(VSelect, {
                                modelValue: unref(form).payment_method,
                                "onUpdate:modelValue": ($event) => unref(form).payment_method = $event,
                                items: methodList,
                                label: "Payment Method",
                                variant: "outlined",
                                density: "comfortable",
                                "prepend-inner-icon": "mdi-credit-card-outline",
                                "hide-details": "auto"
                              }, null, 8, ["modelValue", "onUpdate:modelValue"])
                            ]),
                            _: 1
                          }),
                          createVNode(VCol, {
                            cols: "12",
                            md: "3"
                          }, {
                            default: withCtx(() => [
                              createVNode(VTextField, {
                                modelValue: unref(form).payment_reference,
                                "onUpdate:modelValue": ($event) => unref(form).payment_reference = $event,
                                label: "Payment Reference",
                                placeholder: "M-Pesa code, cheque #",
                                variant: "outlined",
                                density: "comfortable",
                                "hide-details": "auto"
                              }, null, 8, ["modelValue", "onUpdate:modelValue"])
                            ]),
                            _: 1
                          }),
                          createVNode(VCol, {
                            cols: "12",
                            md: "6"
                          }, {
                            default: withCtx(() => [
                              createVNode(VCombobox, {
                                modelValue: unref(form).vendor,
                                "onUpdate:modelValue": ($event) => unref(form).vendor = $event,
                                items: vendorList,
                                label: "Vendor / Payee",
                                variant: "outlined",
                                density: "comfortable",
                                "prepend-inner-icon": "mdi-truck-delivery",
                                hint: "Pick a supplier or type any vendor name",
                                "persistent-hint": "",
                                "hide-details": "auto"
                              }, null, 8, ["modelValue", "onUpdate:modelValue"])
                            ]),
                            _: 1
                          }),
                          createVNode(VCol, {
                            cols: "12",
                            md: "3"
                          }, {
                            default: withCtx(() => [
                              createVNode(VTextField, {
                                modelValue: unref(form).date,
                                "onUpdate:modelValue": ($event) => unref(form).date = $event,
                                label: "Expense Date *",
                                type: "date",
                                variant: "outlined",
                                density: "comfortable",
                                rules: [(v) => !!v || "Date is required"],
                                "hide-details": "auto"
                              }, null, 8, ["modelValue", "onUpdate:modelValue", "rules"])
                            ]),
                            _: 1
                          }),
                          createVNode(VCol, {
                            cols: "12",
                            md: "3"
                          }, {
                            default: withCtx(() => [
                              createVNode(VTextField, {
                                modelValue: unref(form).due_date,
                                "onUpdate:modelValue": ($event) => unref(form).due_date = $event,
                                label: "Due Date",
                                type: "date",
                                variant: "outlined",
                                density: "comfortable",
                                hint: "Optional",
                                "persistent-hint": "",
                                "hide-details": "auto"
                              }, null, 8, ["modelValue", "onUpdate:modelValue"])
                            ]),
                            _: 1
                          }),
                          createVNode(VCol, {
                            cols: "12",
                            md: "3"
                          }, {
                            default: withCtx(() => [
                              createVNode(VTextField, {
                                modelValue: unref(form).cost_price,
                                "onUpdate:modelValue": ($event) => unref(form).cost_price = $event,
                                modelModifiers: { number: true },
                                label: "Cost Price",
                                type: "number",
                                prefix: "KSh",
                                variant: "outlined",
                                density: "comfortable",
                                "hide-details": "auto"
                              }, null, 8, ["modelValue", "onUpdate:modelValue"])
                            ]),
                            _: 1
                          }),
                          createVNode(VCol, {
                            cols: "12",
                            md: "3"
                          }, {
                            default: withCtx(() => [
                              createVNode(VTextField, {
                                modelValue: unref(form).retail_price,
                                "onUpdate:modelValue": ($event) => unref(form).retail_price = $event,
                                modelModifiers: { number: true },
                                label: "Retail Price",
                                type: "number",
                                prefix: "KSh",
                                variant: "outlined",
                                density: "comfortable",
                                "hide-details": "auto"
                              }, null, 8, ["modelValue", "onUpdate:modelValue"])
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
                    createVNode("div", { class: "az-exp-card__header" }, [
                      createVNode("div", { class: "az-exp-card__icon az-exp-card__icon--green" }, [
                        createVNode(VIcon, { size: "18" }, {
                          default: withCtx(() => [
                            createTextVNode("mdi-cash")
                          ]),
                          _: 1
                        })
                      ]),
                      createVNode("span", null, "Amount & Payment")
                    ]),
                    createVNode(VRow, null, {
                      default: withCtx(() => [
                        createVNode(VCol, {
                          cols: "12",
                          md: "3"
                        }, {
                          default: withCtx(() => [
                            createVNode(VTextField, {
                              modelValue: unref(form).amount,
                              "onUpdate:modelValue": ($event) => unref(form).amount = $event,
                              modelModifiers: { number: true },
                              label: "Amount *",
                              type: "number",
                              prefix: "KSh",
                              variant: "outlined",
                              density: "comfortable",
                              rules: [(v) => v > 0 || "Amount must be greater than 0"],
                              "hide-details": "auto"
                            }, null, 8, ["modelValue", "onUpdate:modelValue", "rules"])
                          ]),
                          _: 1
                        }),
                        createVNode(VCol, {
                          cols: "12",
                          md: "3"
                        }, {
                          default: withCtx(() => [
                            createVNode(VTextField, {
                              modelValue: unref(form).tax,
                              "onUpdate:modelValue": ($event) => unref(form).tax = $event,
                              modelModifiers: { number: true },
                              label: "Tax / VAT",
                              type: "number",
                              prefix: "KSh",
                              variant: "outlined",
                              density: "comfortable",
                              "hide-details": "auto"
                            }, null, 8, ["modelValue", "onUpdate:modelValue"])
                          ]),
                          _: 1
                        }),
                        createVNode(VCol, {
                          cols: "12",
                          md: "3"
                        }, {
                          default: withCtx(() => [
                            createVNode(VSelect, {
                              modelValue: unref(form).payment_method,
                              "onUpdate:modelValue": ($event) => unref(form).payment_method = $event,
                              items: methodList,
                              label: "Payment Method",
                              variant: "outlined",
                              density: "comfortable",
                              "prepend-inner-icon": "mdi-credit-card-outline",
                              "hide-details": "auto"
                            }, null, 8, ["modelValue", "onUpdate:modelValue"])
                          ]),
                          _: 1
                        }),
                        createVNode(VCol, {
                          cols: "12",
                          md: "3"
                        }, {
                          default: withCtx(() => [
                            createVNode(VTextField, {
                              modelValue: unref(form).payment_reference,
                              "onUpdate:modelValue": ($event) => unref(form).payment_reference = $event,
                              label: "Payment Reference",
                              placeholder: "M-Pesa code, cheque #",
                              variant: "outlined",
                              density: "comfortable",
                              "hide-details": "auto"
                            }, null, 8, ["modelValue", "onUpdate:modelValue"])
                          ]),
                          _: 1
                        }),
                        createVNode(VCol, {
                          cols: "12",
                          md: "6"
                        }, {
                          default: withCtx(() => [
                            createVNode(VCombobox, {
                              modelValue: unref(form).vendor,
                              "onUpdate:modelValue": ($event) => unref(form).vendor = $event,
                              items: vendorList,
                              label: "Vendor / Payee",
                              variant: "outlined",
                              density: "comfortable",
                              "prepend-inner-icon": "mdi-truck-delivery",
                              hint: "Pick a supplier or type any vendor name",
                              "persistent-hint": "",
                              "hide-details": "auto"
                            }, null, 8, ["modelValue", "onUpdate:modelValue"])
                          ]),
                          _: 1
                        }),
                        createVNode(VCol, {
                          cols: "12",
                          md: "3"
                        }, {
                          default: withCtx(() => [
                            createVNode(VTextField, {
                              modelValue: unref(form).date,
                              "onUpdate:modelValue": ($event) => unref(form).date = $event,
                              label: "Expense Date *",
                              type: "date",
                              variant: "outlined",
                              density: "comfortable",
                              rules: [(v) => !!v || "Date is required"],
                              "hide-details": "auto"
                            }, null, 8, ["modelValue", "onUpdate:modelValue", "rules"])
                          ]),
                          _: 1
                        }),
                        createVNode(VCol, {
                          cols: "12",
                          md: "3"
                        }, {
                          default: withCtx(() => [
                            createVNode(VTextField, {
                              modelValue: unref(form).due_date,
                              "onUpdate:modelValue": ($event) => unref(form).due_date = $event,
                              label: "Due Date",
                              type: "date",
                              variant: "outlined",
                              density: "comfortable",
                              hint: "Optional",
                              "persistent-hint": "",
                              "hide-details": "auto"
                            }, null, 8, ["modelValue", "onUpdate:modelValue"])
                          ]),
                          _: 1
                        }),
                        createVNode(VCol, {
                          cols: "12",
                          md: "3"
                        }, {
                          default: withCtx(() => [
                            createVNode(VTextField, {
                              modelValue: unref(form).cost_price,
                              "onUpdate:modelValue": ($event) => unref(form).cost_price = $event,
                              modelModifiers: { number: true },
                              label: "Cost Price",
                              type: "number",
                              prefix: "KSh",
                              variant: "outlined",
                              density: "comfortable",
                              "hide-details": "auto"
                            }, null, 8, ["modelValue", "onUpdate:modelValue"])
                          ]),
                          _: 1
                        }),
                        createVNode(VCol, {
                          cols: "12",
                          md: "3"
                        }, {
                          default: withCtx(() => [
                            createVNode(VTextField, {
                              modelValue: unref(form).retail_price,
                              "onUpdate:modelValue": ($event) => unref(form).retail_price = $event,
                              modelModifiers: { number: true },
                              label: "Retail Price",
                              type: "number",
                              prefix: "KSh",
                              variant: "outlined",
                              density: "comfortable",
                              "hide-details": "auto"
                            }, null, 8, ["modelValue", "onUpdate:modelValue"])
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
              variant: "outlined",
              class: "az-exp-card az-exp-card--amber mb-4"
            }, {
              default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                if (_push3) {
                  _push3(`<div class="az-exp-card__header" data-v-62f6a138${_scopeId2}><div class="az-exp-card__icon az-exp-card__icon--amber" data-v-62f6a138${_scopeId2}>`);
                  _push3(ssrRenderComponent(VIcon, { size: "18" }, {
                    default: withCtx((_3, _push4, _parent4, _scopeId3) => {
                      if (_push4) {
                        _push4(`mdi-cog-outline`);
                      } else {
                        return [
                          createTextVNode("mdi-cog-outline")
                        ];
                      }
                    }),
                    _: 1
                  }, _parent3, _scopeId2));
                  _push3(`</div><span data-v-62f6a138${_scopeId2}>Status &amp; Options</span></div>`);
                  _push3(ssrRenderComponent(VRow, null, {
                    default: withCtx((_3, _push4, _parent4, _scopeId3) => {
                      if (_push4) {
                        _push4(ssrRenderComponent(VCol, {
                          cols: "12",
                          md: "4"
                        }, {
                          default: withCtx((_4, _push5, _parent5, _scopeId4) => {
                            if (_push5) {
                              _push5(ssrRenderComponent(VSelect, {
                                modelValue: unref(form).status,
                                "onUpdate:modelValue": ($event) => unref(form).status = $event,
                                items: statusOptions,
                                label: "Status",
                                variant: "outlined",
                                density: "comfortable",
                                "hide-details": "auto"
                              }, null, _parent5, _scopeId4));
                            } else {
                              return [
                                createVNode(VSelect, {
                                  modelValue: unref(form).status,
                                  "onUpdate:modelValue": ($event) => unref(form).status = $event,
                                  items: statusOptions,
                                  label: "Status",
                                  variant: "outlined",
                                  density: "comfortable",
                                  "hide-details": "auto"
                                }, null, 8, ["modelValue", "onUpdate:modelValue"])
                              ];
                            }
                          }),
                          _: 1
                        }, _parent4, _scopeId3));
                        _push4(ssrRenderComponent(VCol, {
                          cols: "12",
                          md: "4",
                          class: "d-flex align-center"
                        }, {
                          default: withCtx((_4, _push5, _parent5, _scopeId4) => {
                            if (_push5) {
                              _push5(ssrRenderComponent(VCheckbox, {
                                modelValue: unref(form).recurring,
                                "onUpdate:modelValue": ($event) => unref(form).recurring = $event,
                                label: "Recurring expense",
                                density: "comfortable",
                                "hide-details": "auto"
                              }, null, _parent5, _scopeId4));
                            } else {
                              return [
                                createVNode(VCheckbox, {
                                  modelValue: unref(form).recurring,
                                  "onUpdate:modelValue": ($event) => unref(form).recurring = $event,
                                  label: "Recurring expense",
                                  density: "comfortable",
                                  "hide-details": "auto"
                                }, null, 8, ["modelValue", "onUpdate:modelValue"])
                              ];
                            }
                          }),
                          _: 1
                        }, _parent4, _scopeId3));
                        _push4(ssrRenderComponent(VCol, { cols: "12" }, {
                          default: withCtx((_4, _push5, _parent5, _scopeId4) => {
                            if (_push5) {
                              _push5(ssrRenderComponent(VTextarea, {
                                modelValue: unref(form).notes,
                                "onUpdate:modelValue": ($event) => unref(form).notes = $event,
                                label: "Notes",
                                variant: "outlined",
                                density: "comfortable",
                                rows: "2",
                                "auto-grow": "",
                                "hide-details": "auto"
                              }, null, _parent5, _scopeId4));
                            } else {
                              return [
                                createVNode(VTextarea, {
                                  modelValue: unref(form).notes,
                                  "onUpdate:modelValue": ($event) => unref(form).notes = $event,
                                  label: "Notes",
                                  variant: "outlined",
                                  density: "comfortable",
                                  rows: "2",
                                  "auto-grow": "",
                                  "hide-details": "auto"
                                }, null, 8, ["modelValue", "onUpdate:modelValue"])
                              ];
                            }
                          }),
                          _: 1
                        }, _parent4, _scopeId3));
                      } else {
                        return [
                          createVNode(VCol, {
                            cols: "12",
                            md: "4"
                          }, {
                            default: withCtx(() => [
                              createVNode(VSelect, {
                                modelValue: unref(form).status,
                                "onUpdate:modelValue": ($event) => unref(form).status = $event,
                                items: statusOptions,
                                label: "Status",
                                variant: "outlined",
                                density: "comfortable",
                                "hide-details": "auto"
                              }, null, 8, ["modelValue", "onUpdate:modelValue"])
                            ]),
                            _: 1
                          }),
                          createVNode(VCol, {
                            cols: "12",
                            md: "4",
                            class: "d-flex align-center"
                          }, {
                            default: withCtx(() => [
                              createVNode(VCheckbox, {
                                modelValue: unref(form).recurring,
                                "onUpdate:modelValue": ($event) => unref(form).recurring = $event,
                                label: "Recurring expense",
                                density: "comfortable",
                                "hide-details": "auto"
                              }, null, 8, ["modelValue", "onUpdate:modelValue"])
                            ]),
                            _: 1
                          }),
                          createVNode(VCol, { cols: "12" }, {
                            default: withCtx(() => [
                              createVNode(VTextarea, {
                                modelValue: unref(form).notes,
                                "onUpdate:modelValue": ($event) => unref(form).notes = $event,
                                label: "Notes",
                                variant: "outlined",
                                density: "comfortable",
                                rows: "2",
                                "auto-grow": "",
                                "hide-details": "auto"
                              }, null, 8, ["modelValue", "onUpdate:modelValue"])
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
                    createVNode("div", { class: "az-exp-card__header" }, [
                      createVNode("div", { class: "az-exp-card__icon az-exp-card__icon--amber" }, [
                        createVNode(VIcon, { size: "18" }, {
                          default: withCtx(() => [
                            createTextVNode("mdi-cog-outline")
                          ]),
                          _: 1
                        })
                      ]),
                      createVNode("span", null, "Status & Options")
                    ]),
                    createVNode(VRow, null, {
                      default: withCtx(() => [
                        createVNode(VCol, {
                          cols: "12",
                          md: "4"
                        }, {
                          default: withCtx(() => [
                            createVNode(VSelect, {
                              modelValue: unref(form).status,
                              "onUpdate:modelValue": ($event) => unref(form).status = $event,
                              items: statusOptions,
                              label: "Status",
                              variant: "outlined",
                              density: "comfortable",
                              "hide-details": "auto"
                            }, null, 8, ["modelValue", "onUpdate:modelValue"])
                          ]),
                          _: 1
                        }),
                        createVNode(VCol, {
                          cols: "12",
                          md: "4",
                          class: "d-flex align-center"
                        }, {
                          default: withCtx(() => [
                            createVNode(VCheckbox, {
                              modelValue: unref(form).recurring,
                              "onUpdate:modelValue": ($event) => unref(form).recurring = $event,
                              label: "Recurring expense",
                              density: "comfortable",
                              "hide-details": "auto"
                            }, null, 8, ["modelValue", "onUpdate:modelValue"])
                          ]),
                          _: 1
                        }),
                        createVNode(VCol, { cols: "12" }, {
                          default: withCtx(() => [
                            createVNode(VTextarea, {
                              modelValue: unref(form).notes,
                              "onUpdate:modelValue": ($event) => unref(form).notes = $event,
                              label: "Notes",
                              variant: "outlined",
                              density: "comfortable",
                              rows: "2",
                              "auto-grow": "",
                              "hide-details": "auto"
                            }, null, 8, ["modelValue", "onUpdate:modelValue"])
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
            _push2(`</div><div class="az-exp-layout__summary" data-v-62f6a138${_scopeId}>`);
            _push2(ssrRenderComponent(VCard, {
              variant: "outlined",
              class: "az-exp-summary"
            }, {
              default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                if (_push3) {
                  _push3(`<div class="az-exp-summary__header" data-v-62f6a138${_scopeId2}><span class="text-caption text-uppercase font-weight-bold" data-v-62f6a138${_scopeId2}>Summary</span><span class="az-exp-summary__total" data-v-62f6a138${_scopeId2}>${ssrInterpolate(formatMoney(unref(summaryTotal)))}</span></div><div class="az-exp-summary__body" data-v-62f6a138${_scopeId2}><div class="az-exp-summary__stat" data-v-62f6a138${_scopeId2}><span class="text-caption text-medium-emphasis" data-v-62f6a138${_scopeId2}>Subtotal</span><span class="text-body-1 font-weight-bold" data-v-62f6a138${_scopeId2}>${ssrInterpolate(formatMoney(unref(form).amount))}</span></div><div class="az-exp-summary__stat" data-v-62f6a138${_scopeId2}><span class="text-caption text-medium-emphasis" data-v-62f6a138${_scopeId2}>Tax</span><span class="text-body-1 font-weight-bold" data-v-62f6a138${_scopeId2}>${ssrInterpolate(formatMoney(unref(form).tax))}</span></div><div class="az-exp-summary__stat" data-v-62f6a138${_scopeId2}><span class="text-caption text-medium-emphasis" data-v-62f6a138${_scopeId2}>Method</span><span class="text-body-1 font-weight-bold text-capitalize" data-v-62f6a138${_scopeId2}>${ssrInterpolate(unref(form).payment_method)}</span></div><div class="az-exp-summary__stat az-exp-summary__stat--total" data-v-62f6a138${_scopeId2}><span class="text-caption" style="${ssrRenderStyle({ "opacity": "0.85" })}" data-v-62f6a138${_scopeId2}>Total</span><span class="text-h6 font-weight-bold" data-v-62f6a138${_scopeId2}>${ssrInterpolate(formatMoney(unref(summaryTotal)))}</span></div></div><div class="az-exp-summary__actions" data-v-62f6a138${_scopeId2}>`);
                  _push3(ssrRenderComponent(VBtn, {
                    variant: "text",
                    block: "",
                    onClick: goBack
                  }, {
                    default: withCtx((_3, _push4, _parent4, _scopeId3) => {
                      if (_push4) {
                        _push4(`Cancel`);
                      } else {
                        return [
                          createTextVNode("Cancel")
                        ];
                      }
                    }),
                    _: 1
                  }, _parent3, _scopeId2));
                  _push3(ssrRenderComponent(VBtn, {
                    type: "submit",
                    block: "",
                    variant: "flat",
                    color: "primary",
                    loading: unref(saving),
                    disabled: !unref(form).amount || unref(form).amount <= 0 || !unref(form).description,
                    "prepend-icon": "mdi-check",
                    class: "mt-2"
                  }, {
                    default: withCtx((_3, _push4, _parent4, _scopeId3) => {
                      if (_push4) {
                        _push4(`${ssrInterpolate(unref(editing) ? "Update Expense" : "Create Expense")}`);
                      } else {
                        return [
                          createTextVNode(toDisplayString(unref(editing) ? "Update Expense" : "Create Expense"), 1)
                        ];
                      }
                    }),
                    _: 1
                  }, _parent3, _scopeId2));
                  _push3(`</div>`);
                } else {
                  return [
                    createVNode("div", { class: "az-exp-summary__header" }, [
                      createVNode("span", { class: "text-caption text-uppercase font-weight-bold" }, "Summary"),
                      createVNode("span", { class: "az-exp-summary__total" }, toDisplayString(formatMoney(unref(summaryTotal))), 1)
                    ]),
                    createVNode("div", { class: "az-exp-summary__body" }, [
                      createVNode("div", { class: "az-exp-summary__stat" }, [
                        createVNode("span", { class: "text-caption text-medium-emphasis" }, "Subtotal"),
                        createVNode("span", { class: "text-body-1 font-weight-bold" }, toDisplayString(formatMoney(unref(form).amount)), 1)
                      ]),
                      createVNode("div", { class: "az-exp-summary__stat" }, [
                        createVNode("span", { class: "text-caption text-medium-emphasis" }, "Tax"),
                        createVNode("span", { class: "text-body-1 font-weight-bold" }, toDisplayString(formatMoney(unref(form).tax)), 1)
                      ]),
                      createVNode("div", { class: "az-exp-summary__stat" }, [
                        createVNode("span", { class: "text-caption text-medium-emphasis" }, "Method"),
                        createVNode("span", { class: "text-body-1 font-weight-bold text-capitalize" }, toDisplayString(unref(form).payment_method), 1)
                      ]),
                      createVNode("div", { class: "az-exp-summary__stat az-exp-summary__stat--total" }, [
                        createVNode("span", {
                          class: "text-caption",
                          style: { "opacity": "0.85" }
                        }, "Total"),
                        createVNode("span", { class: "text-h6 font-weight-bold" }, toDisplayString(formatMoney(unref(summaryTotal))), 1)
                      ])
                    ]),
                    createVNode("div", { class: "az-exp-summary__actions" }, [
                      createVNode(VBtn, {
                        variant: "text",
                        block: "",
                        onClick: goBack
                      }, {
                        default: withCtx(() => [
                          createTextVNode("Cancel")
                        ]),
                        _: 1
                      }),
                      createVNode(VBtn, {
                        type: "submit",
                        block: "",
                        variant: "flat",
                        color: "primary",
                        loading: unref(saving),
                        disabled: !unref(form).amount || unref(form).amount <= 0 || !unref(form).description,
                        "prepend-icon": "mdi-check",
                        class: "mt-2"
                      }, {
                        default: withCtx(() => [
                          createTextVNode(toDisplayString(unref(editing) ? "Update Expense" : "Create Expense"), 1)
                        ]),
                        _: 1
                      }, 8, ["loading", "disabled"])
                    ])
                  ];
                }
              }),
              _: 1
            }, _parent2, _scopeId));
            _push2(`</div>`);
          } else {
            return [
              createVNode("div", { class: "az-exp-layout__form" }, [
                createVNode(VCard, {
                  variant: "outlined",
                  class: "az-exp-card az-exp-card--blue mb-4"
                }, {
                  default: withCtx(() => [
                    createVNode("div", { class: "az-exp-card__header" }, [
                      createVNode("div", { class: "az-exp-card__icon az-exp-card__icon--blue" }, [
                        createVNode(VIcon, { size: "18" }, {
                          default: withCtx(() => [
                            createTextVNode("mdi-information-outline")
                          ]),
                          _: 1
                        })
                      ]),
                      createVNode("span", null, "Expense Details")
                    ]),
                    createVNode(VRow, null, {
                      default: withCtx(() => [
                        createVNode(VCol, {
                          cols: "12",
                          md: "6"
                        }, {
                          default: withCtx(() => [
                            createVNode(VTextField, {
                              modelValue: unref(form).description,
                              "onUpdate:modelValue": ($event) => unref(form).description = $event,
                              label: "Title *",
                              placeholder: "e.g. Office rent \u2014 May",
                              variant: "outlined",
                              density: "comfortable",
                              rules: [(v) => !!v || "Title is required"],
                              "hide-details": "auto"
                            }, null, 8, ["modelValue", "onUpdate:modelValue", "rules"])
                          ]),
                          _: 1
                        }),
                        createVNode(VCol, {
                          cols: "12",
                          md: "3"
                        }, {
                          default: withCtx(() => [
                            createVNode(VTextField, {
                              modelValue: unref(form).reference,
                              "onUpdate:modelValue": ($event) => unref(form).reference = $event,
                              label: "Reference",
                              placeholder: "Auto-generated",
                              variant: "outlined",
                              density: "comfortable",
                              hint: "Leave blank to auto-generate",
                              "persistent-hint": "",
                              "hide-details": "auto"
                            }, null, 8, ["modelValue", "onUpdate:modelValue"])
                          ]),
                          _: 1
                        }),
                        createVNode(VCol, {
                          cols: "12",
                          md: "3"
                        }, {
                          default: withCtx(() => [
                            createVNode(VCombobox, {
                              modelValue: unref(form).category,
                              "onUpdate:modelValue": ($event) => unref(form).category = $event,
                              items: unref(categoryList),
                              label: "Category",
                              variant: "outlined",
                              density: "comfortable",
                              "prepend-inner-icon": "mdi-shape",
                              "hide-details": "auto"
                            }, null, 8, ["modelValue", "onUpdate:modelValue", "items"])
                          ]),
                          _: 1
                        }),
                        createVNode(VCol, { cols: "12" }, {
                          default: withCtx(() => [
                            createVNode(VTextarea, {
                              modelValue: unref(form).notes,
                              "onUpdate:modelValue": ($event) => unref(form).notes = $event,
                              label: "Description",
                              variant: "outlined",
                              density: "comfortable",
                              rows: "2",
                              "auto-grow": "",
                              "hide-details": "auto"
                            }, null, 8, ["modelValue", "onUpdate:modelValue"])
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
                  variant: "outlined",
                  class: "az-exp-card az-exp-card--green mb-4"
                }, {
                  default: withCtx(() => [
                    createVNode("div", { class: "az-exp-card__header" }, [
                      createVNode("div", { class: "az-exp-card__icon az-exp-card__icon--green" }, [
                        createVNode(VIcon, { size: "18" }, {
                          default: withCtx(() => [
                            createTextVNode("mdi-cash")
                          ]),
                          _: 1
                        })
                      ]),
                      createVNode("span", null, "Amount & Payment")
                    ]),
                    createVNode(VRow, null, {
                      default: withCtx(() => [
                        createVNode(VCol, {
                          cols: "12",
                          md: "3"
                        }, {
                          default: withCtx(() => [
                            createVNode(VTextField, {
                              modelValue: unref(form).amount,
                              "onUpdate:modelValue": ($event) => unref(form).amount = $event,
                              modelModifiers: { number: true },
                              label: "Amount *",
                              type: "number",
                              prefix: "KSh",
                              variant: "outlined",
                              density: "comfortable",
                              rules: [(v) => v > 0 || "Amount must be greater than 0"],
                              "hide-details": "auto"
                            }, null, 8, ["modelValue", "onUpdate:modelValue", "rules"])
                          ]),
                          _: 1
                        }),
                        createVNode(VCol, {
                          cols: "12",
                          md: "3"
                        }, {
                          default: withCtx(() => [
                            createVNode(VTextField, {
                              modelValue: unref(form).tax,
                              "onUpdate:modelValue": ($event) => unref(form).tax = $event,
                              modelModifiers: { number: true },
                              label: "Tax / VAT",
                              type: "number",
                              prefix: "KSh",
                              variant: "outlined",
                              density: "comfortable",
                              "hide-details": "auto"
                            }, null, 8, ["modelValue", "onUpdate:modelValue"])
                          ]),
                          _: 1
                        }),
                        createVNode(VCol, {
                          cols: "12",
                          md: "3"
                        }, {
                          default: withCtx(() => [
                            createVNode(VSelect, {
                              modelValue: unref(form).payment_method,
                              "onUpdate:modelValue": ($event) => unref(form).payment_method = $event,
                              items: methodList,
                              label: "Payment Method",
                              variant: "outlined",
                              density: "comfortable",
                              "prepend-inner-icon": "mdi-credit-card-outline",
                              "hide-details": "auto"
                            }, null, 8, ["modelValue", "onUpdate:modelValue"])
                          ]),
                          _: 1
                        }),
                        createVNode(VCol, {
                          cols: "12",
                          md: "3"
                        }, {
                          default: withCtx(() => [
                            createVNode(VTextField, {
                              modelValue: unref(form).payment_reference,
                              "onUpdate:modelValue": ($event) => unref(form).payment_reference = $event,
                              label: "Payment Reference",
                              placeholder: "M-Pesa code, cheque #",
                              variant: "outlined",
                              density: "comfortable",
                              "hide-details": "auto"
                            }, null, 8, ["modelValue", "onUpdate:modelValue"])
                          ]),
                          _: 1
                        }),
                        createVNode(VCol, {
                          cols: "12",
                          md: "6"
                        }, {
                          default: withCtx(() => [
                            createVNode(VCombobox, {
                              modelValue: unref(form).vendor,
                              "onUpdate:modelValue": ($event) => unref(form).vendor = $event,
                              items: vendorList,
                              label: "Vendor / Payee",
                              variant: "outlined",
                              density: "comfortable",
                              "prepend-inner-icon": "mdi-truck-delivery",
                              hint: "Pick a supplier or type any vendor name",
                              "persistent-hint": "",
                              "hide-details": "auto"
                            }, null, 8, ["modelValue", "onUpdate:modelValue"])
                          ]),
                          _: 1
                        }),
                        createVNode(VCol, {
                          cols: "12",
                          md: "3"
                        }, {
                          default: withCtx(() => [
                            createVNode(VTextField, {
                              modelValue: unref(form).date,
                              "onUpdate:modelValue": ($event) => unref(form).date = $event,
                              label: "Expense Date *",
                              type: "date",
                              variant: "outlined",
                              density: "comfortable",
                              rules: [(v) => !!v || "Date is required"],
                              "hide-details": "auto"
                            }, null, 8, ["modelValue", "onUpdate:modelValue", "rules"])
                          ]),
                          _: 1
                        }),
                        createVNode(VCol, {
                          cols: "12",
                          md: "3"
                        }, {
                          default: withCtx(() => [
                            createVNode(VTextField, {
                              modelValue: unref(form).due_date,
                              "onUpdate:modelValue": ($event) => unref(form).due_date = $event,
                              label: "Due Date",
                              type: "date",
                              variant: "outlined",
                              density: "comfortable",
                              hint: "Optional",
                              "persistent-hint": "",
                              "hide-details": "auto"
                            }, null, 8, ["modelValue", "onUpdate:modelValue"])
                          ]),
                          _: 1
                        }),
                        createVNode(VCol, {
                          cols: "12",
                          md: "3"
                        }, {
                          default: withCtx(() => [
                            createVNode(VTextField, {
                              modelValue: unref(form).cost_price,
                              "onUpdate:modelValue": ($event) => unref(form).cost_price = $event,
                              modelModifiers: { number: true },
                              label: "Cost Price",
                              type: "number",
                              prefix: "KSh",
                              variant: "outlined",
                              density: "comfortable",
                              "hide-details": "auto"
                            }, null, 8, ["modelValue", "onUpdate:modelValue"])
                          ]),
                          _: 1
                        }),
                        createVNode(VCol, {
                          cols: "12",
                          md: "3"
                        }, {
                          default: withCtx(() => [
                            createVNode(VTextField, {
                              modelValue: unref(form).retail_price,
                              "onUpdate:modelValue": ($event) => unref(form).retail_price = $event,
                              modelModifiers: { number: true },
                              label: "Retail Price",
                              type: "number",
                              prefix: "KSh",
                              variant: "outlined",
                              density: "comfortable",
                              "hide-details": "auto"
                            }, null, 8, ["modelValue", "onUpdate:modelValue"])
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
                  variant: "outlined",
                  class: "az-exp-card az-exp-card--amber mb-4"
                }, {
                  default: withCtx(() => [
                    createVNode("div", { class: "az-exp-card__header" }, [
                      createVNode("div", { class: "az-exp-card__icon az-exp-card__icon--amber" }, [
                        createVNode(VIcon, { size: "18" }, {
                          default: withCtx(() => [
                            createTextVNode("mdi-cog-outline")
                          ]),
                          _: 1
                        })
                      ]),
                      createVNode("span", null, "Status & Options")
                    ]),
                    createVNode(VRow, null, {
                      default: withCtx(() => [
                        createVNode(VCol, {
                          cols: "12",
                          md: "4"
                        }, {
                          default: withCtx(() => [
                            createVNode(VSelect, {
                              modelValue: unref(form).status,
                              "onUpdate:modelValue": ($event) => unref(form).status = $event,
                              items: statusOptions,
                              label: "Status",
                              variant: "outlined",
                              density: "comfortable",
                              "hide-details": "auto"
                            }, null, 8, ["modelValue", "onUpdate:modelValue"])
                          ]),
                          _: 1
                        }),
                        createVNode(VCol, {
                          cols: "12",
                          md: "4",
                          class: "d-flex align-center"
                        }, {
                          default: withCtx(() => [
                            createVNode(VCheckbox, {
                              modelValue: unref(form).recurring,
                              "onUpdate:modelValue": ($event) => unref(form).recurring = $event,
                              label: "Recurring expense",
                              density: "comfortable",
                              "hide-details": "auto"
                            }, null, 8, ["modelValue", "onUpdate:modelValue"])
                          ]),
                          _: 1
                        }),
                        createVNode(VCol, { cols: "12" }, {
                          default: withCtx(() => [
                            createVNode(VTextarea, {
                              modelValue: unref(form).notes,
                              "onUpdate:modelValue": ($event) => unref(form).notes = $event,
                              label: "Notes",
                              variant: "outlined",
                              density: "comfortable",
                              rows: "2",
                              "auto-grow": "",
                              "hide-details": "auto"
                            }, null, 8, ["modelValue", "onUpdate:modelValue"])
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
              createVNode("div", { class: "az-exp-layout__summary" }, [
                createVNode(VCard, {
                  variant: "outlined",
                  class: "az-exp-summary"
                }, {
                  default: withCtx(() => [
                    createVNode("div", { class: "az-exp-summary__header" }, [
                      createVNode("span", { class: "text-caption text-uppercase font-weight-bold" }, "Summary"),
                      createVNode("span", { class: "az-exp-summary__total" }, toDisplayString(formatMoney(unref(summaryTotal))), 1)
                    ]),
                    createVNode("div", { class: "az-exp-summary__body" }, [
                      createVNode("div", { class: "az-exp-summary__stat" }, [
                        createVNode("span", { class: "text-caption text-medium-emphasis" }, "Subtotal"),
                        createVNode("span", { class: "text-body-1 font-weight-bold" }, toDisplayString(formatMoney(unref(form).amount)), 1)
                      ]),
                      createVNode("div", { class: "az-exp-summary__stat" }, [
                        createVNode("span", { class: "text-caption text-medium-emphasis" }, "Tax"),
                        createVNode("span", { class: "text-body-1 font-weight-bold" }, toDisplayString(formatMoney(unref(form).tax)), 1)
                      ]),
                      createVNode("div", { class: "az-exp-summary__stat" }, [
                        createVNode("span", { class: "text-caption text-medium-emphasis" }, "Method"),
                        createVNode("span", { class: "text-body-1 font-weight-bold text-capitalize" }, toDisplayString(unref(form).payment_method), 1)
                      ]),
                      createVNode("div", { class: "az-exp-summary__stat az-exp-summary__stat--total" }, [
                        createVNode("span", {
                          class: "text-caption",
                          style: { "opacity": "0.85" }
                        }, "Total"),
                        createVNode("span", { class: "text-h6 font-weight-bold" }, toDisplayString(formatMoney(unref(summaryTotal))), 1)
                      ])
                    ]),
                    createVNode("div", { class: "az-exp-summary__actions" }, [
                      createVNode(VBtn, {
                        variant: "text",
                        block: "",
                        onClick: goBack
                      }, {
                        default: withCtx(() => [
                          createTextVNode("Cancel")
                        ]),
                        _: 1
                      }),
                      createVNode(VBtn, {
                        type: "submit",
                        block: "",
                        variant: "flat",
                        color: "primary",
                        loading: unref(saving),
                        disabled: !unref(form).amount || unref(form).amount <= 0 || !unref(form).description,
                        "prepend-icon": "mdi-check",
                        class: "mt-2"
                      }, {
                        default: withCtx(() => [
                          createTextVNode(toDisplayString(unref(editing) ? "Update Expense" : "Create Expense"), 1)
                        ]),
                        _: 1
                      }, 8, ["loading", "disabled"])
                    ])
                  ]),
                  _: 1
                })
              ])
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`</div>`);
    };
  }
};
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/expenses/new.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const _new = /* @__PURE__ */ _export_sfc(_sfc_main, [["__scopeId", "data-v-62f6a138"]]);

export { _new as default };
//# sourceMappingURL=new-CteRHINY.mjs.map
