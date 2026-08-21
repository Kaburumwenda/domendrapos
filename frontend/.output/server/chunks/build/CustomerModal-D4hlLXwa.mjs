import { defineComponent, computed, ref, reactive, watch, mergeProps, withCtx, unref, createVNode, createTextVNode, isRef, openBlock, createBlock, toDisplayString, Fragment, renderList, createCommentVNode, useSSRContext } from 'vue';
import { ssrRenderComponent, ssrInterpolate, ssrRenderList, ssrRenderClass } from 'vue/server-renderer';
import { M as useToast, x as VDialog, k as VCard, Q as VAvatar, d as VIcon, g as VBtn, p as VDivider, a0 as VWindow, a1 as VWindowItem, i as VRow, j as VCol, S as VSelect, C as VTextField, _ as VTextarea, R as VSwitch } from './server.mjs';
import { u as useAuthStore } from './auth-s-b-v9EY.mjs';
import { u as useApi } from './useApi-9yTPzSUF.mjs';
import { _ as _export_sfc } from './_plugin-vue_export-helper-1tPrXgE0.mjs';

const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "CustomerModal",
  __ssrInlineRender: true,
  props: {
    show: { type: Boolean, default: false },
    customer: { type: Object, default: null },
    branches: { type: Array, default: () => [] }
  },
  emits: ["close", "saved"],
  setup(__props, { emit: __emit }) {
    const props = __props;
    const emit = __emit;
    const toast = useToast();
    const { currencySymbol } = useAuthStore();
    const symbol = computed(() => currencySymbol || "KSh");
    const saving = ref(false);
    const errors = ref({});
    const isEdit = computed(() => !!props.customer);
    const stepList = [
      { id: "profile", label: "Profile", desc: "Name, contact, type" },
      { id: "address", label: "Address", desc: "Location and notes" },
      { id: "loyalty", label: "Loyalty and Credit", desc: "Tier, credit, tax" }
    ];
    const activeTab = ref("profile");
    const currentStepIndex = computed(() => {
      const idx = stepList.findIndex((s) => s.id === activeTab.value);
      return idx >= 0 ? idx : 0;
    });
    function nextStep() {
      if (currentStepIndex.value < stepList.length - 1) {
        activeTab.value = stepList[currentStepIndex.value + 1].id;
      }
    }
    const customerTypeItems = [
      { label: "Individual", value: "individual" },
      { label: "Business", value: "business" }
    ];
    const genderItems = [
      { label: "Male", value: "male" },
      { label: "Female", value: "female" },
      { label: "Other", value: "other" },
      { label: "Prefer Not to Say", value: "undisclosed" }
    ];
    const tierItems = [
      { label: "Bronze", value: "bronze" },
      { label: "Silver", value: "silver" },
      { label: "Gold", value: "gold" },
      { label: "Platinum", value: "platinum" },
      { label: "Diamond", value: "diamond" }
    ];
    const defaultForm = () => ({
      customer_type: "individual",
      customer_code: "",
      first_name: "",
      last_name: "",
      company_name: "",
      email: "",
      phone: "",
      secondary_phone: "",
      date_of_birth: "",
      gender: "",
      address_line1: "",
      address_line2: "",
      city: "",
      state_province: "",
      postal_code: "",
      country: "United States",
      loyalty_tier: "bronze",
      loyalty_member_since: "",
      credit_limit: 0,
      preferred_branch: null,
      tax_exempt: false,
      tax_id: "",
      notes: "",
      is_active: true
    });
    const form = reactive(defaultForm());
    watch(
      () => props.show,
      (val) => {
        if (val) {
          if (props.customer) {
            const c = props.customer;
            Object.assign(form, {
              ...defaultForm(),
              ...c,
              loyalty_member_since: c.loyalty_member_since || "",
              date_of_birth: c.date_of_birth || ""
            });
          } else {
            Object.assign(form, defaultForm());
            generateCustomerCode();
          }
          errors.value = {};
          activeTab.value = "profile";
        }
      }
    );
    function generateCustomerCode() {
      const ts = Date.now().toString().slice(-6);
      form.customer_code = `CUST-${ts}`;
    }
    function firstError(data) {
      if (!data || typeof data !== "object") return null;
      for (const key of Object.keys(data)) {
        const val = data[key];
        if (Array.isArray(val) && val.length) return val[0];
        if (typeof val === "string") return val;
      }
      return null;
    }
    function buildPayload() {
      const p = { ...form };
      p.credit_limit = p.credit_limit === "" ? 0 : parseFloat(p.credit_limit);
      ["date_of_birth", "loyalty_member_since"].forEach((f) => {
        if (p[f] === "") p[f] = null;
      });
      if (!p.preferred_branch) p.preferred_branch = null;
      delete p.full_name;
      delete p.loyalty_points;
      delete p.current_credit_balance;
      delete p.created_at;
      delete p.updated_at;
      delete p.id;
      delete p.groups;
      return p;
    }
    async function save() {
      errors.value = {};
      if (!form.customer_code.trim()) {
        errors.value = { customer_code: "Customer code is required" };
        return;
      }
      saving.value = true;
      try {
        const payload = buildPayload();
        if (isEdit.value) {
          await useApi()(`/customers/${props.customer.id}/`, { method: "PATCH", body: payload });
          toast.success("Customer updated");
        } else {
          await useApi()("/customers/", { method: "POST", body: payload });
          toast.success("Customer created");
        }
        emit("saved");
      } catch (e) {
        const msg = firstError(e?.data);
        if (msg) {
          if (e?.data) {
            for (const key of Object.keys(e.data)) {
              if (key in form) errors.value[key] = Array.isArray(e.data[key]) ? e.data[key][0] : e.data[key];
            }
          }
          if (Object.keys(errors.value).length === 0) toast.error(msg);
        } else {
          toast.error("Failed to save customer");
        }
      } finally {
        saving.value = false;
      }
    }
    return (_ctx, _push, _parent, _attrs) => {
      _push(ssrRenderComponent(VDialog, mergeProps({
        "model-value": __props.show,
        "onUpdate:modelValue": ($event) => _ctx.$emit("close"),
        "max-width": "1000",
        scrollable: ""
      }, _attrs), {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(ssrRenderComponent(VCard, {
              rounded: "xl",
              class: "cust-modal-card"
            }, {
              default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                if (_push3) {
                  _push3(`<div class="modal-header" data-v-824d6d4a${_scopeId2}><div class="d-flex align-center ga-3" data-v-824d6d4a${_scopeId2}>`);
                  _push3(ssrRenderComponent(VAvatar, {
                    color: unref(isEdit) ? "deep-purple" : "success",
                    size: "44",
                    rounded: "lg"
                  }, {
                    default: withCtx((_3, _push4, _parent4, _scopeId3) => {
                      if (_push4) {
                        _push4(ssrRenderComponent(VIcon, {
                          size: "22",
                          icon: "mdi-account-details"
                        }, null, _parent4, _scopeId3));
                      } else {
                        return [
                          createVNode(VIcon, {
                            size: "22",
                            icon: "mdi-account-details"
                          })
                        ];
                      }
                    }),
                    _: 1
                  }, _parent3, _scopeId2));
                  _push3(`<div data-v-824d6d4a${_scopeId2}><div class="text-h6 font-weight-bold" data-v-824d6d4a${_scopeId2}>${ssrInterpolate(unref(isEdit) ? "Edit Customer" : "Add New Customer")}</div><div class="text-body-2 text-medium-emphasis" data-v-824d6d4a${_scopeId2}>${ssrInterpolate(unref(isEdit) ? "Update customer details and preferences" : "Create a new customer profile")}</div></div></div>`);
                  _push3(ssrRenderComponent(VBtn, {
                    icon: "",
                    variant: "text",
                    size: "small",
                    onClick: ($event) => _ctx.$emit("close")
                  }, {
                    default: withCtx((_3, _push4, _parent4, _scopeId3) => {
                      if (_push4) {
                        _push4(ssrRenderComponent(VIcon, null, {
                          default: withCtx((_4, _push5, _parent5, _scopeId4) => {
                            if (_push5) {
                              _push5(`mdi-close`);
                            } else {
                              return [
                                createTextVNode("mdi-close")
                              ];
                            }
                          }),
                          _: 1
                        }, _parent4, _scopeId3));
                      } else {
                        return [
                          createVNode(VIcon, null, {
                            default: withCtx(() => [
                              createTextVNode("mdi-close")
                            ]),
                            _: 1
                          })
                        ];
                      }
                    }),
                    _: 1
                  }, _parent3, _scopeId2));
                  _push3(`</div>`);
                  _push3(ssrRenderComponent(VDivider, null, null, _parent3, _scopeId2));
                  _push3(`<div class="modal-body" data-v-824d6d4a${_scopeId2}><div class="stepper-nav" data-v-824d6d4a${_scopeId2}><!--[-->`);
                  ssrRenderList(stepList, (step, i) => {
                    _push3(`<div class="${ssrRenderClass([{ active: unref(activeTab) === step.id }, "stepper-item"])}" data-v-824d6d4a${_scopeId2}><div class="stepper-num" data-v-824d6d4a${_scopeId2}>${ssrInterpolate(i + 1)}</div><div class="stepper-text" data-v-824d6d4a${_scopeId2}><div class="stepper-label" data-v-824d6d4a${_scopeId2}>${ssrInterpolate(step.label)}</div><div class="stepper-desc" data-v-824d6d4a${_scopeId2}>${ssrInterpolate(step.desc)}</div></div></div>`);
                  });
                  _push3(`<!--]--></div><div class="stepper-content" data-v-824d6d4a${_scopeId2}>`);
                  _push3(ssrRenderComponent(VWindow, {
                    modelValue: unref(activeTab),
                    "onUpdate:modelValue": ($event) => isRef(activeTab) ? activeTab.value = $event : null,
                    class: "fill-height"
                  }, {
                    default: withCtx((_3, _push4, _parent4, _scopeId3) => {
                      if (_push4) {
                        _push4(ssrRenderComponent(VWindowItem, { value: "profile" }, {
                          default: withCtx((_4, _push5, _parent5, _scopeId4) => {
                            if (_push5) {
                              _push5(`<div class="step-title" data-v-824d6d4a${_scopeId4}>Customer Profile</div><div class="step-subtitle" data-v-824d6d4a${_scopeId4}>Basic information about this customer.</div>`);
                              _push5(ssrRenderComponent(VRow, {
                                dense: "",
                                class: "mt-2"
                              }, {
                                default: withCtx((_5, _push6, _parent6, _scopeId5) => {
                                  if (_push6) {
                                    _push6(ssrRenderComponent(VCol, {
                                      cols: "12",
                                      sm: "6"
                                    }, {
                                      default: withCtx((_6, _push7, _parent7, _scopeId6) => {
                                        if (_push7) {
                                          _push7(ssrRenderComponent(VSelect, {
                                            modelValue: unref(form).customer_type,
                                            "onUpdate:modelValue": ($event) => unref(form).customer_type = $event,
                                            items: customerTypeItems,
                                            "item-title": "label",
                                            "item-value": "value",
                                            label: "Customer Type",
                                            variant: "outlined",
                                            density: "comfortable",
                                            "prepend-inner-icon": "mdi-account-group"
                                          }, null, _parent7, _scopeId6));
                                        } else {
                                          return [
                                            createVNode(VSelect, {
                                              modelValue: unref(form).customer_type,
                                              "onUpdate:modelValue": ($event) => unref(form).customer_type = $event,
                                              items: customerTypeItems,
                                              "item-title": "label",
                                              "item-value": "value",
                                              label: "Customer Type",
                                              variant: "outlined",
                                              density: "comfortable",
                                              "prepend-inner-icon": "mdi-account-group"
                                            }, null, 8, ["modelValue", "onUpdate:modelValue"])
                                          ];
                                        }
                                      }),
                                      _: 1
                                    }, _parent6, _scopeId5));
                                    _push6(ssrRenderComponent(VCol, {
                                      cols: "12",
                                      sm: "6"
                                    }, {
                                      default: withCtx((_6, _push7, _parent7, _scopeId6) => {
                                        if (_push7) {
                                          _push7(ssrRenderComponent(VTextField, {
                                            modelValue: unref(form).customer_code,
                                            "onUpdate:modelValue": ($event) => unref(form).customer_code = $event,
                                            label: "Customer Code",
                                            variant: "outlined",
                                            density: "comfortable",
                                            "append-inner-icon": "mdi-refresh",
                                            "onClick:appendInner": generateCustomerCode,
                                            hint: "Click the icon to auto-generate",
                                            "persistent-hint": "",
                                            "error-messages": unref(errors).customer_code,
                                            placeholder: "CUST-001"
                                          }, null, _parent7, _scopeId6));
                                        } else {
                                          return [
                                            createVNode(VTextField, {
                                              modelValue: unref(form).customer_code,
                                              "onUpdate:modelValue": ($event) => unref(form).customer_code = $event,
                                              label: "Customer Code",
                                              variant: "outlined",
                                              density: "comfortable",
                                              "append-inner-icon": "mdi-refresh",
                                              "onClick:appendInner": generateCustomerCode,
                                              hint: "Click the icon to auto-generate",
                                              "persistent-hint": "",
                                              "error-messages": unref(errors).customer_code,
                                              placeholder: "CUST-001"
                                            }, null, 8, ["modelValue", "onUpdate:modelValue", "error-messages"])
                                          ];
                                        }
                                      }),
                                      _: 1
                                    }, _parent6, _scopeId5));
                                  } else {
                                    return [
                                      createVNode(VCol, {
                                        cols: "12",
                                        sm: "6"
                                      }, {
                                        default: withCtx(() => [
                                          createVNode(VSelect, {
                                            modelValue: unref(form).customer_type,
                                            "onUpdate:modelValue": ($event) => unref(form).customer_type = $event,
                                            items: customerTypeItems,
                                            "item-title": "label",
                                            "item-value": "value",
                                            label: "Customer Type",
                                            variant: "outlined",
                                            density: "comfortable",
                                            "prepend-inner-icon": "mdi-account-group"
                                          }, null, 8, ["modelValue", "onUpdate:modelValue"])
                                        ]),
                                        _: 1
                                      }),
                                      createVNode(VCol, {
                                        cols: "12",
                                        sm: "6"
                                      }, {
                                        default: withCtx(() => [
                                          createVNode(VTextField, {
                                            modelValue: unref(form).customer_code,
                                            "onUpdate:modelValue": ($event) => unref(form).customer_code = $event,
                                            label: "Customer Code",
                                            variant: "outlined",
                                            density: "comfortable",
                                            "append-inner-icon": "mdi-refresh",
                                            "onClick:appendInner": generateCustomerCode,
                                            hint: "Click the icon to auto-generate",
                                            "persistent-hint": "",
                                            "error-messages": unref(errors).customer_code,
                                            placeholder: "CUST-001"
                                          }, null, 8, ["modelValue", "onUpdate:modelValue", "error-messages"])
                                        ]),
                                        _: 1
                                      })
                                    ];
                                  }
                                }),
                                _: 1
                              }, _parent5, _scopeId4));
                              if (unref(form).customer_type === "individual") {
                                _push5(ssrRenderComponent(VRow, { dense: "" }, {
                                  default: withCtx((_5, _push6, _parent6, _scopeId5) => {
                                    if (_push6) {
                                      _push6(ssrRenderComponent(VCol, {
                                        cols: "12",
                                        sm: "6"
                                      }, {
                                        default: withCtx((_6, _push7, _parent7, _scopeId6) => {
                                          if (_push7) {
                                            _push7(ssrRenderComponent(VTextField, {
                                              modelValue: unref(form).first_name,
                                              "onUpdate:modelValue": ($event) => unref(form).first_name = $event,
                                              label: "First Name",
                                              variant: "outlined",
                                              density: "comfortable",
                                              "error-messages": unref(errors).first_name,
                                              "prepend-inner-icon": "mdi-account"
                                            }, null, _parent7, _scopeId6));
                                          } else {
                                            return [
                                              createVNode(VTextField, {
                                                modelValue: unref(form).first_name,
                                                "onUpdate:modelValue": ($event) => unref(form).first_name = $event,
                                                label: "First Name",
                                                variant: "outlined",
                                                density: "comfortable",
                                                "error-messages": unref(errors).first_name,
                                                "prepend-inner-icon": "mdi-account"
                                              }, null, 8, ["modelValue", "onUpdate:modelValue", "error-messages"])
                                            ];
                                          }
                                        }),
                                        _: 1
                                      }, _parent6, _scopeId5));
                                      _push6(ssrRenderComponent(VCol, {
                                        cols: "12",
                                        sm: "6"
                                      }, {
                                        default: withCtx((_6, _push7, _parent7, _scopeId6) => {
                                          if (_push7) {
                                            _push7(ssrRenderComponent(VTextField, {
                                              modelValue: unref(form).last_name,
                                              "onUpdate:modelValue": ($event) => unref(form).last_name = $event,
                                              label: "Last Name",
                                              variant: "outlined",
                                              density: "comfortable",
                                              "error-messages": unref(errors).last_name,
                                              "prepend-inner-icon": "mdi-account-outline"
                                            }, null, _parent7, _scopeId6));
                                          } else {
                                            return [
                                              createVNode(VTextField, {
                                                modelValue: unref(form).last_name,
                                                "onUpdate:modelValue": ($event) => unref(form).last_name = $event,
                                                label: "Last Name",
                                                variant: "outlined",
                                                density: "comfortable",
                                                "error-messages": unref(errors).last_name,
                                                "prepend-inner-icon": "mdi-account-outline"
                                              }, null, 8, ["modelValue", "onUpdate:modelValue", "error-messages"])
                                            ];
                                          }
                                        }),
                                        _: 1
                                      }, _parent6, _scopeId5));
                                    } else {
                                      return [
                                        createVNode(VCol, {
                                          cols: "12",
                                          sm: "6"
                                        }, {
                                          default: withCtx(() => [
                                            createVNode(VTextField, {
                                              modelValue: unref(form).first_name,
                                              "onUpdate:modelValue": ($event) => unref(form).first_name = $event,
                                              label: "First Name",
                                              variant: "outlined",
                                              density: "comfortable",
                                              "error-messages": unref(errors).first_name,
                                              "prepend-inner-icon": "mdi-account"
                                            }, null, 8, ["modelValue", "onUpdate:modelValue", "error-messages"])
                                          ]),
                                          _: 1
                                        }),
                                        createVNode(VCol, {
                                          cols: "12",
                                          sm: "6"
                                        }, {
                                          default: withCtx(() => [
                                            createVNode(VTextField, {
                                              modelValue: unref(form).last_name,
                                              "onUpdate:modelValue": ($event) => unref(form).last_name = $event,
                                              label: "Last Name",
                                              variant: "outlined",
                                              density: "comfortable",
                                              "error-messages": unref(errors).last_name,
                                              "prepend-inner-icon": "mdi-account-outline"
                                            }, null, 8, ["modelValue", "onUpdate:modelValue", "error-messages"])
                                          ]),
                                          _: 1
                                        })
                                      ];
                                    }
                                  }),
                                  _: 1
                                }, _parent5, _scopeId4));
                              } else {
                                _push5(ssrRenderComponent(VTextField, {
                                  modelValue: unref(form).company_name,
                                  "onUpdate:modelValue": ($event) => unref(form).company_name = $event,
                                  label: "Company Name",
                                  variant: "outlined",
                                  density: "comfortable",
                                  "error-messages": unref(errors).company_name,
                                  "prepend-inner-icon": "mdi-domain",
                                  class: "mt-2"
                                }, null, _parent5, _scopeId4));
                              }
                              _push5(ssrRenderComponent(VRow, { dense: "" }, {
                                default: withCtx((_5, _push6, _parent6, _scopeId5) => {
                                  if (_push6) {
                                    _push6(ssrRenderComponent(VCol, {
                                      cols: "12",
                                      sm: "6"
                                    }, {
                                      default: withCtx((_6, _push7, _parent7, _scopeId6) => {
                                        if (_push7) {
                                          _push7(ssrRenderComponent(VTextField, {
                                            modelValue: unref(form).email,
                                            "onUpdate:modelValue": ($event) => unref(form).email = $event,
                                            label: "Email",
                                            variant: "outlined",
                                            density: "comfortable",
                                            type: "email",
                                            "error-messages": unref(errors).email,
                                            "prepend-inner-icon": "mdi-email-outline"
                                          }, null, _parent7, _scopeId6));
                                        } else {
                                          return [
                                            createVNode(VTextField, {
                                              modelValue: unref(form).email,
                                              "onUpdate:modelValue": ($event) => unref(form).email = $event,
                                              label: "Email",
                                              variant: "outlined",
                                              density: "comfortable",
                                              type: "email",
                                              "error-messages": unref(errors).email,
                                              "prepend-inner-icon": "mdi-email-outline"
                                            }, null, 8, ["modelValue", "onUpdate:modelValue", "error-messages"])
                                          ];
                                        }
                                      }),
                                      _: 1
                                    }, _parent6, _scopeId5));
                                    _push6(ssrRenderComponent(VCol, {
                                      cols: "12",
                                      sm: "6"
                                    }, {
                                      default: withCtx((_6, _push7, _parent7, _scopeId6) => {
                                        if (_push7) {
                                          _push7(ssrRenderComponent(VTextField, {
                                            modelValue: unref(form).phone,
                                            "onUpdate:modelValue": ($event) => unref(form).phone = $event,
                                            label: "Phone",
                                            variant: "outlined",
                                            density: "comfortable",
                                            "error-messages": unref(errors).phone,
                                            "prepend-inner-icon": "mdi-phone-outline"
                                          }, null, _parent7, _scopeId6));
                                        } else {
                                          return [
                                            createVNode(VTextField, {
                                              modelValue: unref(form).phone,
                                              "onUpdate:modelValue": ($event) => unref(form).phone = $event,
                                              label: "Phone",
                                              variant: "outlined",
                                              density: "comfortable",
                                              "error-messages": unref(errors).phone,
                                              "prepend-inner-icon": "mdi-phone-outline"
                                            }, null, 8, ["modelValue", "onUpdate:modelValue", "error-messages"])
                                          ];
                                        }
                                      }),
                                      _: 1
                                    }, _parent6, _scopeId5));
                                  } else {
                                    return [
                                      createVNode(VCol, {
                                        cols: "12",
                                        sm: "6"
                                      }, {
                                        default: withCtx(() => [
                                          createVNode(VTextField, {
                                            modelValue: unref(form).email,
                                            "onUpdate:modelValue": ($event) => unref(form).email = $event,
                                            label: "Email",
                                            variant: "outlined",
                                            density: "comfortable",
                                            type: "email",
                                            "error-messages": unref(errors).email,
                                            "prepend-inner-icon": "mdi-email-outline"
                                          }, null, 8, ["modelValue", "onUpdate:modelValue", "error-messages"])
                                        ]),
                                        _: 1
                                      }),
                                      createVNode(VCol, {
                                        cols: "12",
                                        sm: "6"
                                      }, {
                                        default: withCtx(() => [
                                          createVNode(VTextField, {
                                            modelValue: unref(form).phone,
                                            "onUpdate:modelValue": ($event) => unref(form).phone = $event,
                                            label: "Phone",
                                            variant: "outlined",
                                            density: "comfortable",
                                            "error-messages": unref(errors).phone,
                                            "prepend-inner-icon": "mdi-phone-outline"
                                          }, null, 8, ["modelValue", "onUpdate:modelValue", "error-messages"])
                                        ]),
                                        _: 1
                                      })
                                    ];
                                  }
                                }),
                                _: 1
                              }, _parent5, _scopeId4));
                              _push5(ssrRenderComponent(VRow, { dense: "" }, {
                                default: withCtx((_5, _push6, _parent6, _scopeId5) => {
                                  if (_push6) {
                                    _push6(ssrRenderComponent(VCol, {
                                      cols: "12",
                                      sm: "6"
                                    }, {
                                      default: withCtx((_6, _push7, _parent7, _scopeId6) => {
                                        if (_push7) {
                                          _push7(ssrRenderComponent(VTextField, {
                                            modelValue: unref(form).secondary_phone,
                                            "onUpdate:modelValue": ($event) => unref(form).secondary_phone = $event,
                                            label: "Secondary Phone",
                                            variant: "outlined",
                                            density: "comfortable",
                                            "prepend-inner-icon": "mdi-phone-plus"
                                          }, null, _parent7, _scopeId6));
                                        } else {
                                          return [
                                            createVNode(VTextField, {
                                              modelValue: unref(form).secondary_phone,
                                              "onUpdate:modelValue": ($event) => unref(form).secondary_phone = $event,
                                              label: "Secondary Phone",
                                              variant: "outlined",
                                              density: "comfortable",
                                              "prepend-inner-icon": "mdi-phone-plus"
                                            }, null, 8, ["modelValue", "onUpdate:modelValue"])
                                          ];
                                        }
                                      }),
                                      _: 1
                                    }, _parent6, _scopeId5));
                                    _push6(ssrRenderComponent(VCol, {
                                      cols: "12",
                                      sm: "6"
                                    }, {
                                      default: withCtx((_6, _push7, _parent7, _scopeId6) => {
                                        if (_push7) {
                                          _push7(ssrRenderComponent(VSelect, {
                                            modelValue: unref(form).gender,
                                            "onUpdate:modelValue": ($event) => unref(form).gender = $event,
                                            items: genderItems,
                                            "item-title": "label",
                                            "item-value": "value",
                                            label: "Gender",
                                            variant: "outlined",
                                            density: "comfortable",
                                            clearable: "",
                                            "prepend-inner-icon": "mdi-human-edit"
                                          }, null, _parent7, _scopeId6));
                                        } else {
                                          return [
                                            createVNode(VSelect, {
                                              modelValue: unref(form).gender,
                                              "onUpdate:modelValue": ($event) => unref(form).gender = $event,
                                              items: genderItems,
                                              "item-title": "label",
                                              "item-value": "value",
                                              label: "Gender",
                                              variant: "outlined",
                                              density: "comfortable",
                                              clearable: "",
                                              "prepend-inner-icon": "mdi-human-edit"
                                            }, null, 8, ["modelValue", "onUpdate:modelValue"])
                                          ];
                                        }
                                      }),
                                      _: 1
                                    }, _parent6, _scopeId5));
                                  } else {
                                    return [
                                      createVNode(VCol, {
                                        cols: "12",
                                        sm: "6"
                                      }, {
                                        default: withCtx(() => [
                                          createVNode(VTextField, {
                                            modelValue: unref(form).secondary_phone,
                                            "onUpdate:modelValue": ($event) => unref(form).secondary_phone = $event,
                                            label: "Secondary Phone",
                                            variant: "outlined",
                                            density: "comfortable",
                                            "prepend-inner-icon": "mdi-phone-plus"
                                          }, null, 8, ["modelValue", "onUpdate:modelValue"])
                                        ]),
                                        _: 1
                                      }),
                                      createVNode(VCol, {
                                        cols: "12",
                                        sm: "6"
                                      }, {
                                        default: withCtx(() => [
                                          createVNode(VSelect, {
                                            modelValue: unref(form).gender,
                                            "onUpdate:modelValue": ($event) => unref(form).gender = $event,
                                            items: genderItems,
                                            "item-title": "label",
                                            "item-value": "value",
                                            label: "Gender",
                                            variant: "outlined",
                                            density: "comfortable",
                                            clearable: "",
                                            "prepend-inner-icon": "mdi-human-edit"
                                          }, null, 8, ["modelValue", "onUpdate:modelValue"])
                                        ]),
                                        _: 1
                                      })
                                    ];
                                  }
                                }),
                                _: 1
                              }, _parent5, _scopeId4));
                              _push5(ssrRenderComponent(VTextField, {
                                modelValue: unref(form).date_of_birth,
                                "onUpdate:modelValue": ($event) => unref(form).date_of_birth = $event,
                                type: "date",
                                label: "Date of Birth",
                                variant: "outlined",
                                density: "comfortable",
                                "prepend-inner-icon": "mdi-cake-variant",
                                class: "mt-2"
                              }, null, _parent5, _scopeId4));
                            } else {
                              return [
                                createVNode("div", { class: "step-title" }, "Customer Profile"),
                                createVNode("div", { class: "step-subtitle" }, "Basic information about this customer."),
                                createVNode(VRow, {
                                  dense: "",
                                  class: "mt-2"
                                }, {
                                  default: withCtx(() => [
                                    createVNode(VCol, {
                                      cols: "12",
                                      sm: "6"
                                    }, {
                                      default: withCtx(() => [
                                        createVNode(VSelect, {
                                          modelValue: unref(form).customer_type,
                                          "onUpdate:modelValue": ($event) => unref(form).customer_type = $event,
                                          items: customerTypeItems,
                                          "item-title": "label",
                                          "item-value": "value",
                                          label: "Customer Type",
                                          variant: "outlined",
                                          density: "comfortable",
                                          "prepend-inner-icon": "mdi-account-group"
                                        }, null, 8, ["modelValue", "onUpdate:modelValue"])
                                      ]),
                                      _: 1
                                    }),
                                    createVNode(VCol, {
                                      cols: "12",
                                      sm: "6"
                                    }, {
                                      default: withCtx(() => [
                                        createVNode(VTextField, {
                                          modelValue: unref(form).customer_code,
                                          "onUpdate:modelValue": ($event) => unref(form).customer_code = $event,
                                          label: "Customer Code",
                                          variant: "outlined",
                                          density: "comfortable",
                                          "append-inner-icon": "mdi-refresh",
                                          "onClick:appendInner": generateCustomerCode,
                                          hint: "Click the icon to auto-generate",
                                          "persistent-hint": "",
                                          "error-messages": unref(errors).customer_code,
                                          placeholder: "CUST-001"
                                        }, null, 8, ["modelValue", "onUpdate:modelValue", "error-messages"])
                                      ]),
                                      _: 1
                                    })
                                  ]),
                                  _: 1
                                }),
                                unref(form).customer_type === "individual" ? (openBlock(), createBlock(VRow, {
                                  key: 0,
                                  dense: ""
                                }, {
                                  default: withCtx(() => [
                                    createVNode(VCol, {
                                      cols: "12",
                                      sm: "6"
                                    }, {
                                      default: withCtx(() => [
                                        createVNode(VTextField, {
                                          modelValue: unref(form).first_name,
                                          "onUpdate:modelValue": ($event) => unref(form).first_name = $event,
                                          label: "First Name",
                                          variant: "outlined",
                                          density: "comfortable",
                                          "error-messages": unref(errors).first_name,
                                          "prepend-inner-icon": "mdi-account"
                                        }, null, 8, ["modelValue", "onUpdate:modelValue", "error-messages"])
                                      ]),
                                      _: 1
                                    }),
                                    createVNode(VCol, {
                                      cols: "12",
                                      sm: "6"
                                    }, {
                                      default: withCtx(() => [
                                        createVNode(VTextField, {
                                          modelValue: unref(form).last_name,
                                          "onUpdate:modelValue": ($event) => unref(form).last_name = $event,
                                          label: "Last Name",
                                          variant: "outlined",
                                          density: "comfortable",
                                          "error-messages": unref(errors).last_name,
                                          "prepend-inner-icon": "mdi-account-outline"
                                        }, null, 8, ["modelValue", "onUpdate:modelValue", "error-messages"])
                                      ]),
                                      _: 1
                                    })
                                  ]),
                                  _: 1
                                })) : (openBlock(), createBlock(VTextField, {
                                  key: 1,
                                  modelValue: unref(form).company_name,
                                  "onUpdate:modelValue": ($event) => unref(form).company_name = $event,
                                  label: "Company Name",
                                  variant: "outlined",
                                  density: "comfortable",
                                  "error-messages": unref(errors).company_name,
                                  "prepend-inner-icon": "mdi-domain",
                                  class: "mt-2"
                                }, null, 8, ["modelValue", "onUpdate:modelValue", "error-messages"])),
                                createVNode(VRow, { dense: "" }, {
                                  default: withCtx(() => [
                                    createVNode(VCol, {
                                      cols: "12",
                                      sm: "6"
                                    }, {
                                      default: withCtx(() => [
                                        createVNode(VTextField, {
                                          modelValue: unref(form).email,
                                          "onUpdate:modelValue": ($event) => unref(form).email = $event,
                                          label: "Email",
                                          variant: "outlined",
                                          density: "comfortable",
                                          type: "email",
                                          "error-messages": unref(errors).email,
                                          "prepend-inner-icon": "mdi-email-outline"
                                        }, null, 8, ["modelValue", "onUpdate:modelValue", "error-messages"])
                                      ]),
                                      _: 1
                                    }),
                                    createVNode(VCol, {
                                      cols: "12",
                                      sm: "6"
                                    }, {
                                      default: withCtx(() => [
                                        createVNode(VTextField, {
                                          modelValue: unref(form).phone,
                                          "onUpdate:modelValue": ($event) => unref(form).phone = $event,
                                          label: "Phone",
                                          variant: "outlined",
                                          density: "comfortable",
                                          "error-messages": unref(errors).phone,
                                          "prepend-inner-icon": "mdi-phone-outline"
                                        }, null, 8, ["modelValue", "onUpdate:modelValue", "error-messages"])
                                      ]),
                                      _: 1
                                    })
                                  ]),
                                  _: 1
                                }),
                                createVNode(VRow, { dense: "" }, {
                                  default: withCtx(() => [
                                    createVNode(VCol, {
                                      cols: "12",
                                      sm: "6"
                                    }, {
                                      default: withCtx(() => [
                                        createVNode(VTextField, {
                                          modelValue: unref(form).secondary_phone,
                                          "onUpdate:modelValue": ($event) => unref(form).secondary_phone = $event,
                                          label: "Secondary Phone",
                                          variant: "outlined",
                                          density: "comfortable",
                                          "prepend-inner-icon": "mdi-phone-plus"
                                        }, null, 8, ["modelValue", "onUpdate:modelValue"])
                                      ]),
                                      _: 1
                                    }),
                                    createVNode(VCol, {
                                      cols: "12",
                                      sm: "6"
                                    }, {
                                      default: withCtx(() => [
                                        createVNode(VSelect, {
                                          modelValue: unref(form).gender,
                                          "onUpdate:modelValue": ($event) => unref(form).gender = $event,
                                          items: genderItems,
                                          "item-title": "label",
                                          "item-value": "value",
                                          label: "Gender",
                                          variant: "outlined",
                                          density: "comfortable",
                                          clearable: "",
                                          "prepend-inner-icon": "mdi-human-edit"
                                        }, null, 8, ["modelValue", "onUpdate:modelValue"])
                                      ]),
                                      _: 1
                                    })
                                  ]),
                                  _: 1
                                }),
                                createVNode(VTextField, {
                                  modelValue: unref(form).date_of_birth,
                                  "onUpdate:modelValue": ($event) => unref(form).date_of_birth = $event,
                                  type: "date",
                                  label: "Date of Birth",
                                  variant: "outlined",
                                  density: "comfortable",
                                  "prepend-inner-icon": "mdi-cake-variant",
                                  class: "mt-2"
                                }, null, 8, ["modelValue", "onUpdate:modelValue"])
                              ];
                            }
                          }),
                          _: 1
                        }, _parent4, _scopeId3));
                        _push4(ssrRenderComponent(VWindowItem, { value: "address" }, {
                          default: withCtx((_4, _push5, _parent5, _scopeId4) => {
                            if (_push5) {
                              _push5(`<div class="step-title" data-v-824d6d4a${_scopeId4}>Address and Notes</div><div class="step-subtitle" data-v-824d6d4a${_scopeId4}>Where this customer is located and any internal notes.</div>`);
                              _push5(ssrRenderComponent(VTextField, {
                                modelValue: unref(form).address_line1,
                                "onUpdate:modelValue": ($event) => unref(form).address_line1 = $event,
                                label: "Address Line 1",
                                variant: "outlined",
                                density: "comfortable",
                                "prepend-inner-icon": "mdi-map-marker",
                                class: "mt-2"
                              }, null, _parent5, _scopeId4));
                              _push5(ssrRenderComponent(VTextField, {
                                modelValue: unref(form).address_line2,
                                "onUpdate:modelValue": ($event) => unref(form).address_line2 = $event,
                                label: "Address Line 2",
                                variant: "outlined",
                                density: "comfortable",
                                "prepend-inner-icon": "mdi-map-marker-outline"
                              }, null, _parent5, _scopeId4));
                              _push5(ssrRenderComponent(VRow, { dense: "" }, {
                                default: withCtx((_5, _push6, _parent6, _scopeId5) => {
                                  if (_push6) {
                                    _push6(ssrRenderComponent(VCol, {
                                      cols: "12",
                                      sm: "6"
                                    }, {
                                      default: withCtx((_6, _push7, _parent7, _scopeId6) => {
                                        if (_push7) {
                                          _push7(ssrRenderComponent(VTextField, {
                                            modelValue: unref(form).city,
                                            "onUpdate:modelValue": ($event) => unref(form).city = $event,
                                            label: "City",
                                            variant: "outlined",
                                            density: "comfortable",
                                            "prepend-inner-icon": "mdi-city"
                                          }, null, _parent7, _scopeId6));
                                        } else {
                                          return [
                                            createVNode(VTextField, {
                                              modelValue: unref(form).city,
                                              "onUpdate:modelValue": ($event) => unref(form).city = $event,
                                              label: "City",
                                              variant: "outlined",
                                              density: "comfortable",
                                              "prepend-inner-icon": "mdi-city"
                                            }, null, 8, ["modelValue", "onUpdate:modelValue"])
                                          ];
                                        }
                                      }),
                                      _: 1
                                    }, _parent6, _scopeId5));
                                    _push6(ssrRenderComponent(VCol, {
                                      cols: "12",
                                      sm: "6"
                                    }, {
                                      default: withCtx((_6, _push7, _parent7, _scopeId6) => {
                                        if (_push7) {
                                          _push7(ssrRenderComponent(VTextField, {
                                            modelValue: unref(form).state_province,
                                            "onUpdate:modelValue": ($event) => unref(form).state_province = $event,
                                            label: "State / Province",
                                            variant: "outlined",
                                            density: "comfortable",
                                            "prepend-inner-icon": "mdi-map"
                                          }, null, _parent7, _scopeId6));
                                        } else {
                                          return [
                                            createVNode(VTextField, {
                                              modelValue: unref(form).state_province,
                                              "onUpdate:modelValue": ($event) => unref(form).state_province = $event,
                                              label: "State / Province",
                                              variant: "outlined",
                                              density: "comfortable",
                                              "prepend-inner-icon": "mdi-map"
                                            }, null, 8, ["modelValue", "onUpdate:modelValue"])
                                          ];
                                        }
                                      }),
                                      _: 1
                                    }, _parent6, _scopeId5));
                                  } else {
                                    return [
                                      createVNode(VCol, {
                                        cols: "12",
                                        sm: "6"
                                      }, {
                                        default: withCtx(() => [
                                          createVNode(VTextField, {
                                            modelValue: unref(form).city,
                                            "onUpdate:modelValue": ($event) => unref(form).city = $event,
                                            label: "City",
                                            variant: "outlined",
                                            density: "comfortable",
                                            "prepend-inner-icon": "mdi-city"
                                          }, null, 8, ["modelValue", "onUpdate:modelValue"])
                                        ]),
                                        _: 1
                                      }),
                                      createVNode(VCol, {
                                        cols: "12",
                                        sm: "6"
                                      }, {
                                        default: withCtx(() => [
                                          createVNode(VTextField, {
                                            modelValue: unref(form).state_province,
                                            "onUpdate:modelValue": ($event) => unref(form).state_province = $event,
                                            label: "State / Province",
                                            variant: "outlined",
                                            density: "comfortable",
                                            "prepend-inner-icon": "mdi-map"
                                          }, null, 8, ["modelValue", "onUpdate:modelValue"])
                                        ]),
                                        _: 1
                                      })
                                    ];
                                  }
                                }),
                                _: 1
                              }, _parent5, _scopeId4));
                              _push5(ssrRenderComponent(VRow, { dense: "" }, {
                                default: withCtx((_5, _push6, _parent6, _scopeId5) => {
                                  if (_push6) {
                                    _push6(ssrRenderComponent(VCol, {
                                      cols: "12",
                                      sm: "6"
                                    }, {
                                      default: withCtx((_6, _push7, _parent7, _scopeId6) => {
                                        if (_push7) {
                                          _push7(ssrRenderComponent(VTextField, {
                                            modelValue: unref(form).postal_code,
                                            "onUpdate:modelValue": ($event) => unref(form).postal_code = $event,
                                            label: "Postal Code",
                                            variant: "outlined",
                                            density: "comfortable",
                                            "prepend-inner-icon": "mdi-mailbox"
                                          }, null, _parent7, _scopeId6));
                                        } else {
                                          return [
                                            createVNode(VTextField, {
                                              modelValue: unref(form).postal_code,
                                              "onUpdate:modelValue": ($event) => unref(form).postal_code = $event,
                                              label: "Postal Code",
                                              variant: "outlined",
                                              density: "comfortable",
                                              "prepend-inner-icon": "mdi-mailbox"
                                            }, null, 8, ["modelValue", "onUpdate:modelValue"])
                                          ];
                                        }
                                      }),
                                      _: 1
                                    }, _parent6, _scopeId5));
                                    _push6(ssrRenderComponent(VCol, {
                                      cols: "12",
                                      sm: "6"
                                    }, {
                                      default: withCtx((_6, _push7, _parent7, _scopeId6) => {
                                        if (_push7) {
                                          _push7(ssrRenderComponent(VTextField, {
                                            modelValue: unref(form).country,
                                            "onUpdate:modelValue": ($event) => unref(form).country = $event,
                                            label: "Country",
                                            variant: "outlined",
                                            density: "comfortable",
                                            "prepend-inner-icon": "mdi-flag-outline"
                                          }, null, _parent7, _scopeId6));
                                        } else {
                                          return [
                                            createVNode(VTextField, {
                                              modelValue: unref(form).country,
                                              "onUpdate:modelValue": ($event) => unref(form).country = $event,
                                              label: "Country",
                                              variant: "outlined",
                                              density: "comfortable",
                                              "prepend-inner-icon": "mdi-flag-outline"
                                            }, null, 8, ["modelValue", "onUpdate:modelValue"])
                                          ];
                                        }
                                      }),
                                      _: 1
                                    }, _parent6, _scopeId5));
                                  } else {
                                    return [
                                      createVNode(VCol, {
                                        cols: "12",
                                        sm: "6"
                                      }, {
                                        default: withCtx(() => [
                                          createVNode(VTextField, {
                                            modelValue: unref(form).postal_code,
                                            "onUpdate:modelValue": ($event) => unref(form).postal_code = $event,
                                            label: "Postal Code",
                                            variant: "outlined",
                                            density: "comfortable",
                                            "prepend-inner-icon": "mdi-mailbox"
                                          }, null, 8, ["modelValue", "onUpdate:modelValue"])
                                        ]),
                                        _: 1
                                      }),
                                      createVNode(VCol, {
                                        cols: "12",
                                        sm: "6"
                                      }, {
                                        default: withCtx(() => [
                                          createVNode(VTextField, {
                                            modelValue: unref(form).country,
                                            "onUpdate:modelValue": ($event) => unref(form).country = $event,
                                            label: "Country",
                                            variant: "outlined",
                                            density: "comfortable",
                                            "prepend-inner-icon": "mdi-flag-outline"
                                          }, null, 8, ["modelValue", "onUpdate:modelValue"])
                                        ]),
                                        _: 1
                                      })
                                    ];
                                  }
                                }),
                                _: 1
                              }, _parent5, _scopeId4));
                              _push5(ssrRenderComponent(VTextarea, {
                                modelValue: unref(form).notes,
                                "onUpdate:modelValue": ($event) => unref(form).notes = $event,
                                label: "Notes",
                                variant: "outlined",
                                density: "comfortable",
                                rows: "2",
                                placeholder: "Internal notes about this customer...",
                                "prepend-inner-icon": "mdi-note-edit-outline",
                                class: "mt-2"
                              }, null, _parent5, _scopeId4));
                            } else {
                              return [
                                createVNode("div", { class: "step-title" }, "Address and Notes"),
                                createVNode("div", { class: "step-subtitle" }, "Where this customer is located and any internal notes."),
                                createVNode(VTextField, {
                                  modelValue: unref(form).address_line1,
                                  "onUpdate:modelValue": ($event) => unref(form).address_line1 = $event,
                                  label: "Address Line 1",
                                  variant: "outlined",
                                  density: "comfortable",
                                  "prepend-inner-icon": "mdi-map-marker",
                                  class: "mt-2"
                                }, null, 8, ["modelValue", "onUpdate:modelValue"]),
                                createVNode(VTextField, {
                                  modelValue: unref(form).address_line2,
                                  "onUpdate:modelValue": ($event) => unref(form).address_line2 = $event,
                                  label: "Address Line 2",
                                  variant: "outlined",
                                  density: "comfortable",
                                  "prepend-inner-icon": "mdi-map-marker-outline"
                                }, null, 8, ["modelValue", "onUpdate:modelValue"]),
                                createVNode(VRow, { dense: "" }, {
                                  default: withCtx(() => [
                                    createVNode(VCol, {
                                      cols: "12",
                                      sm: "6"
                                    }, {
                                      default: withCtx(() => [
                                        createVNode(VTextField, {
                                          modelValue: unref(form).city,
                                          "onUpdate:modelValue": ($event) => unref(form).city = $event,
                                          label: "City",
                                          variant: "outlined",
                                          density: "comfortable",
                                          "prepend-inner-icon": "mdi-city"
                                        }, null, 8, ["modelValue", "onUpdate:modelValue"])
                                      ]),
                                      _: 1
                                    }),
                                    createVNode(VCol, {
                                      cols: "12",
                                      sm: "6"
                                    }, {
                                      default: withCtx(() => [
                                        createVNode(VTextField, {
                                          modelValue: unref(form).state_province,
                                          "onUpdate:modelValue": ($event) => unref(form).state_province = $event,
                                          label: "State / Province",
                                          variant: "outlined",
                                          density: "comfortable",
                                          "prepend-inner-icon": "mdi-map"
                                        }, null, 8, ["modelValue", "onUpdate:modelValue"])
                                      ]),
                                      _: 1
                                    })
                                  ]),
                                  _: 1
                                }),
                                createVNode(VRow, { dense: "" }, {
                                  default: withCtx(() => [
                                    createVNode(VCol, {
                                      cols: "12",
                                      sm: "6"
                                    }, {
                                      default: withCtx(() => [
                                        createVNode(VTextField, {
                                          modelValue: unref(form).postal_code,
                                          "onUpdate:modelValue": ($event) => unref(form).postal_code = $event,
                                          label: "Postal Code",
                                          variant: "outlined",
                                          density: "comfortable",
                                          "prepend-inner-icon": "mdi-mailbox"
                                        }, null, 8, ["modelValue", "onUpdate:modelValue"])
                                      ]),
                                      _: 1
                                    }),
                                    createVNode(VCol, {
                                      cols: "12",
                                      sm: "6"
                                    }, {
                                      default: withCtx(() => [
                                        createVNode(VTextField, {
                                          modelValue: unref(form).country,
                                          "onUpdate:modelValue": ($event) => unref(form).country = $event,
                                          label: "Country",
                                          variant: "outlined",
                                          density: "comfortable",
                                          "prepend-inner-icon": "mdi-flag-outline"
                                        }, null, 8, ["modelValue", "onUpdate:modelValue"])
                                      ]),
                                      _: 1
                                    })
                                  ]),
                                  _: 1
                                }),
                                createVNode(VTextarea, {
                                  modelValue: unref(form).notes,
                                  "onUpdate:modelValue": ($event) => unref(form).notes = $event,
                                  label: "Notes",
                                  variant: "outlined",
                                  density: "comfortable",
                                  rows: "2",
                                  placeholder: "Internal notes about this customer...",
                                  "prepend-inner-icon": "mdi-note-edit-outline",
                                  class: "mt-2"
                                }, null, 8, ["modelValue", "onUpdate:modelValue"])
                              ];
                            }
                          }),
                          _: 1
                        }, _parent4, _scopeId3));
                        _push4(ssrRenderComponent(VWindowItem, { value: "loyalty" }, {
                          default: withCtx((_4, _push5, _parent5, _scopeId4) => {
                            if (_push5) {
                              _push5(`<div class="step-title" data-v-824d6d4a${_scopeId4}>Loyalty and Credit</div><div class="step-subtitle" data-v-824d6d4a${_scopeId4}>Manage loyalty tier, credit limit, and tax settings.</div><div class="settings-card" data-v-824d6d4a${_scopeId4}><div class="settings-card-label" data-v-824d6d4a${_scopeId4}>Loyalty Program</div>`);
                              _push5(ssrRenderComponent(VRow, {
                                dense: "",
                                class: "mt-1"
                              }, {
                                default: withCtx((_5, _push6, _parent6, _scopeId5) => {
                                  if (_push6) {
                                    _push6(ssrRenderComponent(VCol, {
                                      cols: "12",
                                      sm: "6"
                                    }, {
                                      default: withCtx((_6, _push7, _parent7, _scopeId6) => {
                                        if (_push7) {
                                          _push7(ssrRenderComponent(VSelect, {
                                            modelValue: unref(form).loyalty_tier,
                                            "onUpdate:modelValue": ($event) => unref(form).loyalty_tier = $event,
                                            items: tierItems,
                                            "item-title": "label",
                                            "item-value": "value",
                                            label: "Loyalty Tier",
                                            variant: "outlined",
                                            density: "comfortable",
                                            "prepend-inner-icon": "mdi-medal"
                                          }, null, _parent7, _scopeId6));
                                        } else {
                                          return [
                                            createVNode(VSelect, {
                                              modelValue: unref(form).loyalty_tier,
                                              "onUpdate:modelValue": ($event) => unref(form).loyalty_tier = $event,
                                              items: tierItems,
                                              "item-title": "label",
                                              "item-value": "value",
                                              label: "Loyalty Tier",
                                              variant: "outlined",
                                              density: "comfortable",
                                              "prepend-inner-icon": "mdi-medal"
                                            }, null, 8, ["modelValue", "onUpdate:modelValue"])
                                          ];
                                        }
                                      }),
                                      _: 1
                                    }, _parent6, _scopeId5));
                                    _push6(ssrRenderComponent(VCol, {
                                      cols: "12",
                                      sm: "6"
                                    }, {
                                      default: withCtx((_6, _push7, _parent7, _scopeId6) => {
                                        if (_push7) {
                                          _push7(ssrRenderComponent(VTextField, {
                                            modelValue: unref(form).loyalty_member_since,
                                            "onUpdate:modelValue": ($event) => unref(form).loyalty_member_since = $event,
                                            type: "date",
                                            label: "Member Since",
                                            variant: "outlined",
                                            density: "comfortable",
                                            "prepend-inner-icon": "mdi-calendar-star"
                                          }, null, _parent7, _scopeId6));
                                        } else {
                                          return [
                                            createVNode(VTextField, {
                                              modelValue: unref(form).loyalty_member_since,
                                              "onUpdate:modelValue": ($event) => unref(form).loyalty_member_since = $event,
                                              type: "date",
                                              label: "Member Since",
                                              variant: "outlined",
                                              density: "comfortable",
                                              "prepend-inner-icon": "mdi-calendar-star"
                                            }, null, 8, ["modelValue", "onUpdate:modelValue"])
                                          ];
                                        }
                                      }),
                                      _: 1
                                    }, _parent6, _scopeId5));
                                  } else {
                                    return [
                                      createVNode(VCol, {
                                        cols: "12",
                                        sm: "6"
                                      }, {
                                        default: withCtx(() => [
                                          createVNode(VSelect, {
                                            modelValue: unref(form).loyalty_tier,
                                            "onUpdate:modelValue": ($event) => unref(form).loyalty_tier = $event,
                                            items: tierItems,
                                            "item-title": "label",
                                            "item-value": "value",
                                            label: "Loyalty Tier",
                                            variant: "outlined",
                                            density: "comfortable",
                                            "prepend-inner-icon": "mdi-medal"
                                          }, null, 8, ["modelValue", "onUpdate:modelValue"])
                                        ]),
                                        _: 1
                                      }),
                                      createVNode(VCol, {
                                        cols: "12",
                                        sm: "6"
                                      }, {
                                        default: withCtx(() => [
                                          createVNode(VTextField, {
                                            modelValue: unref(form).loyalty_member_since,
                                            "onUpdate:modelValue": ($event) => unref(form).loyalty_member_since = $event,
                                            type: "date",
                                            label: "Member Since",
                                            variant: "outlined",
                                            density: "comfortable",
                                            "prepend-inner-icon": "mdi-calendar-star"
                                          }, null, 8, ["modelValue", "onUpdate:modelValue"])
                                        ]),
                                        _: 1
                                      })
                                    ];
                                  }
                                }),
                                _: 1
                              }, _parent5, _scopeId4));
                              _push5(`</div><div class="settings-card" data-v-824d6d4a${_scopeId4}><div class="settings-card-label" data-v-824d6d4a${_scopeId4}>Credit and Tax</div>`);
                              _push5(ssrRenderComponent(VRow, {
                                dense: "",
                                class: "mt-1"
                              }, {
                                default: withCtx((_5, _push6, _parent6, _scopeId5) => {
                                  if (_push6) {
                                    _push6(ssrRenderComponent(VCol, {
                                      cols: "12",
                                      sm: "6"
                                    }, {
                                      default: withCtx((_6, _push7, _parent7, _scopeId6) => {
                                        if (_push7) {
                                          _push7(ssrRenderComponent(VTextField, {
                                            modelValue: unref(form).credit_limit,
                                            "onUpdate:modelValue": ($event) => unref(form).credit_limit = $event,
                                            label: `Credit Limit (${unref(symbol)})`,
                                            variant: "outlined",
                                            density: "comfortable",
                                            type: "number",
                                            step: "0.01",
                                            min: "0",
                                            "error-messages": unref(errors).credit_limit,
                                            "prepend-inner-icon": "mdi-credit-card-clock-outline"
                                          }, null, _parent7, _scopeId6));
                                        } else {
                                          return [
                                            createVNode(VTextField, {
                                              modelValue: unref(form).credit_limit,
                                              "onUpdate:modelValue": ($event) => unref(form).credit_limit = $event,
                                              label: `Credit Limit (${unref(symbol)})`,
                                              variant: "outlined",
                                              density: "comfortable",
                                              type: "number",
                                              step: "0.01",
                                              min: "0",
                                              "error-messages": unref(errors).credit_limit,
                                              "prepend-inner-icon": "mdi-credit-card-clock-outline"
                                            }, null, 8, ["modelValue", "onUpdate:modelValue", "label", "error-messages"])
                                          ];
                                        }
                                      }),
                                      _: 1
                                    }, _parent6, _scopeId5));
                                    _push6(ssrRenderComponent(VCol, {
                                      cols: "12",
                                      sm: "6"
                                    }, {
                                      default: withCtx((_6, _push7, _parent7, _scopeId6) => {
                                        if (_push7) {
                                          _push7(ssrRenderComponent(VSelect, {
                                            modelValue: unref(form).preferred_branch,
                                            "onUpdate:modelValue": ($event) => unref(form).preferred_branch = $event,
                                            items: __props.branches,
                                            "item-title": "name",
                                            "item-value": "id",
                                            label: "Preferred Branch",
                                            variant: "outlined",
                                            density: "comfortable",
                                            clearable: "",
                                            "prepend-inner-icon": "mdi-store-outline"
                                          }, null, _parent7, _scopeId6));
                                        } else {
                                          return [
                                            createVNode(VSelect, {
                                              modelValue: unref(form).preferred_branch,
                                              "onUpdate:modelValue": ($event) => unref(form).preferred_branch = $event,
                                              items: __props.branches,
                                              "item-title": "name",
                                              "item-value": "id",
                                              label: "Preferred Branch",
                                              variant: "outlined",
                                              density: "comfortable",
                                              clearable: "",
                                              "prepend-inner-icon": "mdi-store-outline"
                                            }, null, 8, ["modelValue", "onUpdate:modelValue", "items"])
                                          ];
                                        }
                                      }),
                                      _: 1
                                    }, _parent6, _scopeId5));
                                  } else {
                                    return [
                                      createVNode(VCol, {
                                        cols: "12",
                                        sm: "6"
                                      }, {
                                        default: withCtx(() => [
                                          createVNode(VTextField, {
                                            modelValue: unref(form).credit_limit,
                                            "onUpdate:modelValue": ($event) => unref(form).credit_limit = $event,
                                            label: `Credit Limit (${unref(symbol)})`,
                                            variant: "outlined",
                                            density: "comfortable",
                                            type: "number",
                                            step: "0.01",
                                            min: "0",
                                            "error-messages": unref(errors).credit_limit,
                                            "prepend-inner-icon": "mdi-credit-card-clock-outline"
                                          }, null, 8, ["modelValue", "onUpdate:modelValue", "label", "error-messages"])
                                        ]),
                                        _: 1
                                      }),
                                      createVNode(VCol, {
                                        cols: "12",
                                        sm: "6"
                                      }, {
                                        default: withCtx(() => [
                                          createVNode(VSelect, {
                                            modelValue: unref(form).preferred_branch,
                                            "onUpdate:modelValue": ($event) => unref(form).preferred_branch = $event,
                                            items: __props.branches,
                                            "item-title": "name",
                                            "item-value": "id",
                                            label: "Preferred Branch",
                                            variant: "outlined",
                                            density: "comfortable",
                                            clearable: "",
                                            "prepend-inner-icon": "mdi-store-outline"
                                          }, null, 8, ["modelValue", "onUpdate:modelValue", "items"])
                                        ]),
                                        _: 1
                                      })
                                    ];
                                  }
                                }),
                                _: 1
                              }, _parent5, _scopeId4));
                              _push5(ssrRenderComponent(VTextField, {
                                modelValue: unref(form).tax_id,
                                "onUpdate:modelValue": ($event) => unref(form).tax_id = $event,
                                label: "Tax ID",
                                variant: "outlined",
                                density: "comfortable",
                                "prepend-inner-icon": "mdi-file-document-outline",
                                class: "mt-2"
                              }, null, _parent5, _scopeId4));
                              _push5(`</div><div class="status-toggles" data-v-824d6d4a${_scopeId4}><div class="status-toggles-label" data-v-824d6d4a${_scopeId4}>Customer Status</div><div class="toggle-grid" data-v-824d6d4a${_scopeId4}><div class="${ssrRenderClass([{ active: unref(form).tax_exempt }, "toggle-item"])}" data-v-824d6d4a${_scopeId4}>`);
                              _push5(ssrRenderComponent(VSwitch, {
                                modelValue: unref(form).tax_exempt,
                                "onUpdate:modelValue": ($event) => unref(form).tax_exempt = $event,
                                color: "primary",
                                density: "compact",
                                "hide-details": "",
                                inset: ""
                              }, null, _parent5, _scopeId4));
                              _push5(`<div class="toggle-text" data-v-824d6d4a${_scopeId4}><div class="toggle-title" data-v-824d6d4a${_scopeId4}>Tax Exempt</div><div class="toggle-desc" data-v-824d6d4a${_scopeId4}>Customer is exempt from sales tax</div></div></div><div class="${ssrRenderClass([{ active: unref(form).is_active }, "toggle-item"])}" data-v-824d6d4a${_scopeId4}>`);
                              _push5(ssrRenderComponent(VSwitch, {
                                modelValue: unref(form).is_active,
                                "onUpdate:modelValue": ($event) => unref(form).is_active = $event,
                                color: "primary",
                                density: "compact",
                                "hide-details": "",
                                inset: ""
                              }, null, _parent5, _scopeId4));
                              _push5(`<div class="toggle-text" data-v-824d6d4a${_scopeId4}><div class="toggle-title" data-v-824d6d4a${_scopeId4}>Active</div><div class="toggle-desc" data-v-824d6d4a${_scopeId4}>Customer can make purchases</div></div></div></div></div>`);
                            } else {
                              return [
                                createVNode("div", { class: "step-title" }, "Loyalty and Credit"),
                                createVNode("div", { class: "step-subtitle" }, "Manage loyalty tier, credit limit, and tax settings."),
                                createVNode("div", { class: "settings-card" }, [
                                  createVNode("div", { class: "settings-card-label" }, "Loyalty Program"),
                                  createVNode(VRow, {
                                    dense: "",
                                    class: "mt-1"
                                  }, {
                                    default: withCtx(() => [
                                      createVNode(VCol, {
                                        cols: "12",
                                        sm: "6"
                                      }, {
                                        default: withCtx(() => [
                                          createVNode(VSelect, {
                                            modelValue: unref(form).loyalty_tier,
                                            "onUpdate:modelValue": ($event) => unref(form).loyalty_tier = $event,
                                            items: tierItems,
                                            "item-title": "label",
                                            "item-value": "value",
                                            label: "Loyalty Tier",
                                            variant: "outlined",
                                            density: "comfortable",
                                            "prepend-inner-icon": "mdi-medal"
                                          }, null, 8, ["modelValue", "onUpdate:modelValue"])
                                        ]),
                                        _: 1
                                      }),
                                      createVNode(VCol, {
                                        cols: "12",
                                        sm: "6"
                                      }, {
                                        default: withCtx(() => [
                                          createVNode(VTextField, {
                                            modelValue: unref(form).loyalty_member_since,
                                            "onUpdate:modelValue": ($event) => unref(form).loyalty_member_since = $event,
                                            type: "date",
                                            label: "Member Since",
                                            variant: "outlined",
                                            density: "comfortable",
                                            "prepend-inner-icon": "mdi-calendar-star"
                                          }, null, 8, ["modelValue", "onUpdate:modelValue"])
                                        ]),
                                        _: 1
                                      })
                                    ]),
                                    _: 1
                                  })
                                ]),
                                createVNode("div", { class: "settings-card" }, [
                                  createVNode("div", { class: "settings-card-label" }, "Credit and Tax"),
                                  createVNode(VRow, {
                                    dense: "",
                                    class: "mt-1"
                                  }, {
                                    default: withCtx(() => [
                                      createVNode(VCol, {
                                        cols: "12",
                                        sm: "6"
                                      }, {
                                        default: withCtx(() => [
                                          createVNode(VTextField, {
                                            modelValue: unref(form).credit_limit,
                                            "onUpdate:modelValue": ($event) => unref(form).credit_limit = $event,
                                            label: `Credit Limit (${unref(symbol)})`,
                                            variant: "outlined",
                                            density: "comfortable",
                                            type: "number",
                                            step: "0.01",
                                            min: "0",
                                            "error-messages": unref(errors).credit_limit,
                                            "prepend-inner-icon": "mdi-credit-card-clock-outline"
                                          }, null, 8, ["modelValue", "onUpdate:modelValue", "label", "error-messages"])
                                        ]),
                                        _: 1
                                      }),
                                      createVNode(VCol, {
                                        cols: "12",
                                        sm: "6"
                                      }, {
                                        default: withCtx(() => [
                                          createVNode(VSelect, {
                                            modelValue: unref(form).preferred_branch,
                                            "onUpdate:modelValue": ($event) => unref(form).preferred_branch = $event,
                                            items: __props.branches,
                                            "item-title": "name",
                                            "item-value": "id",
                                            label: "Preferred Branch",
                                            variant: "outlined",
                                            density: "comfortable",
                                            clearable: "",
                                            "prepend-inner-icon": "mdi-store-outline"
                                          }, null, 8, ["modelValue", "onUpdate:modelValue", "items"])
                                        ]),
                                        _: 1
                                      })
                                    ]),
                                    _: 1
                                  }),
                                  createVNode(VTextField, {
                                    modelValue: unref(form).tax_id,
                                    "onUpdate:modelValue": ($event) => unref(form).tax_id = $event,
                                    label: "Tax ID",
                                    variant: "outlined",
                                    density: "comfortable",
                                    "prepend-inner-icon": "mdi-file-document-outline",
                                    class: "mt-2"
                                  }, null, 8, ["modelValue", "onUpdate:modelValue"])
                                ]),
                                createVNode("div", { class: "status-toggles" }, [
                                  createVNode("div", { class: "status-toggles-label" }, "Customer Status"),
                                  createVNode("div", { class: "toggle-grid" }, [
                                    createVNode("div", {
                                      class: ["toggle-item", { active: unref(form).tax_exempt }]
                                    }, [
                                      createVNode(VSwitch, {
                                        modelValue: unref(form).tax_exempt,
                                        "onUpdate:modelValue": ($event) => unref(form).tax_exempt = $event,
                                        color: "primary",
                                        density: "compact",
                                        "hide-details": "",
                                        inset: ""
                                      }, null, 8, ["modelValue", "onUpdate:modelValue"]),
                                      createVNode("div", { class: "toggle-text" }, [
                                        createVNode("div", { class: "toggle-title" }, "Tax Exempt"),
                                        createVNode("div", { class: "toggle-desc" }, "Customer is exempt from sales tax")
                                      ])
                                    ], 2),
                                    createVNode("div", {
                                      class: ["toggle-item", { active: unref(form).is_active }]
                                    }, [
                                      createVNode(VSwitch, {
                                        modelValue: unref(form).is_active,
                                        "onUpdate:modelValue": ($event) => unref(form).is_active = $event,
                                        color: "primary",
                                        density: "compact",
                                        "hide-details": "",
                                        inset: ""
                                      }, null, 8, ["modelValue", "onUpdate:modelValue"]),
                                      createVNode("div", { class: "toggle-text" }, [
                                        createVNode("div", { class: "toggle-title" }, "Active"),
                                        createVNode("div", { class: "toggle-desc" }, "Customer can make purchases")
                                      ])
                                    ], 2)
                                  ])
                                ])
                              ];
                            }
                          }),
                          _: 1
                        }, _parent4, _scopeId3));
                      } else {
                        return [
                          createVNode(VWindowItem, { value: "profile" }, {
                            default: withCtx(() => [
                              createVNode("div", { class: "step-title" }, "Customer Profile"),
                              createVNode("div", { class: "step-subtitle" }, "Basic information about this customer."),
                              createVNode(VRow, {
                                dense: "",
                                class: "mt-2"
                              }, {
                                default: withCtx(() => [
                                  createVNode(VCol, {
                                    cols: "12",
                                    sm: "6"
                                  }, {
                                    default: withCtx(() => [
                                      createVNode(VSelect, {
                                        modelValue: unref(form).customer_type,
                                        "onUpdate:modelValue": ($event) => unref(form).customer_type = $event,
                                        items: customerTypeItems,
                                        "item-title": "label",
                                        "item-value": "value",
                                        label: "Customer Type",
                                        variant: "outlined",
                                        density: "comfortable",
                                        "prepend-inner-icon": "mdi-account-group"
                                      }, null, 8, ["modelValue", "onUpdate:modelValue"])
                                    ]),
                                    _: 1
                                  }),
                                  createVNode(VCol, {
                                    cols: "12",
                                    sm: "6"
                                  }, {
                                    default: withCtx(() => [
                                      createVNode(VTextField, {
                                        modelValue: unref(form).customer_code,
                                        "onUpdate:modelValue": ($event) => unref(form).customer_code = $event,
                                        label: "Customer Code",
                                        variant: "outlined",
                                        density: "comfortable",
                                        "append-inner-icon": "mdi-refresh",
                                        "onClick:appendInner": generateCustomerCode,
                                        hint: "Click the icon to auto-generate",
                                        "persistent-hint": "",
                                        "error-messages": unref(errors).customer_code,
                                        placeholder: "CUST-001"
                                      }, null, 8, ["modelValue", "onUpdate:modelValue", "error-messages"])
                                    ]),
                                    _: 1
                                  })
                                ]),
                                _: 1
                              }),
                              unref(form).customer_type === "individual" ? (openBlock(), createBlock(VRow, {
                                key: 0,
                                dense: ""
                              }, {
                                default: withCtx(() => [
                                  createVNode(VCol, {
                                    cols: "12",
                                    sm: "6"
                                  }, {
                                    default: withCtx(() => [
                                      createVNode(VTextField, {
                                        modelValue: unref(form).first_name,
                                        "onUpdate:modelValue": ($event) => unref(form).first_name = $event,
                                        label: "First Name",
                                        variant: "outlined",
                                        density: "comfortable",
                                        "error-messages": unref(errors).first_name,
                                        "prepend-inner-icon": "mdi-account"
                                      }, null, 8, ["modelValue", "onUpdate:modelValue", "error-messages"])
                                    ]),
                                    _: 1
                                  }),
                                  createVNode(VCol, {
                                    cols: "12",
                                    sm: "6"
                                  }, {
                                    default: withCtx(() => [
                                      createVNode(VTextField, {
                                        modelValue: unref(form).last_name,
                                        "onUpdate:modelValue": ($event) => unref(form).last_name = $event,
                                        label: "Last Name",
                                        variant: "outlined",
                                        density: "comfortable",
                                        "error-messages": unref(errors).last_name,
                                        "prepend-inner-icon": "mdi-account-outline"
                                      }, null, 8, ["modelValue", "onUpdate:modelValue", "error-messages"])
                                    ]),
                                    _: 1
                                  })
                                ]),
                                _: 1
                              })) : (openBlock(), createBlock(VTextField, {
                                key: 1,
                                modelValue: unref(form).company_name,
                                "onUpdate:modelValue": ($event) => unref(form).company_name = $event,
                                label: "Company Name",
                                variant: "outlined",
                                density: "comfortable",
                                "error-messages": unref(errors).company_name,
                                "prepend-inner-icon": "mdi-domain",
                                class: "mt-2"
                              }, null, 8, ["modelValue", "onUpdate:modelValue", "error-messages"])),
                              createVNode(VRow, { dense: "" }, {
                                default: withCtx(() => [
                                  createVNode(VCol, {
                                    cols: "12",
                                    sm: "6"
                                  }, {
                                    default: withCtx(() => [
                                      createVNode(VTextField, {
                                        modelValue: unref(form).email,
                                        "onUpdate:modelValue": ($event) => unref(form).email = $event,
                                        label: "Email",
                                        variant: "outlined",
                                        density: "comfortable",
                                        type: "email",
                                        "error-messages": unref(errors).email,
                                        "prepend-inner-icon": "mdi-email-outline"
                                      }, null, 8, ["modelValue", "onUpdate:modelValue", "error-messages"])
                                    ]),
                                    _: 1
                                  }),
                                  createVNode(VCol, {
                                    cols: "12",
                                    sm: "6"
                                  }, {
                                    default: withCtx(() => [
                                      createVNode(VTextField, {
                                        modelValue: unref(form).phone,
                                        "onUpdate:modelValue": ($event) => unref(form).phone = $event,
                                        label: "Phone",
                                        variant: "outlined",
                                        density: "comfortable",
                                        "error-messages": unref(errors).phone,
                                        "prepend-inner-icon": "mdi-phone-outline"
                                      }, null, 8, ["modelValue", "onUpdate:modelValue", "error-messages"])
                                    ]),
                                    _: 1
                                  })
                                ]),
                                _: 1
                              }),
                              createVNode(VRow, { dense: "" }, {
                                default: withCtx(() => [
                                  createVNode(VCol, {
                                    cols: "12",
                                    sm: "6"
                                  }, {
                                    default: withCtx(() => [
                                      createVNode(VTextField, {
                                        modelValue: unref(form).secondary_phone,
                                        "onUpdate:modelValue": ($event) => unref(form).secondary_phone = $event,
                                        label: "Secondary Phone",
                                        variant: "outlined",
                                        density: "comfortable",
                                        "prepend-inner-icon": "mdi-phone-plus"
                                      }, null, 8, ["modelValue", "onUpdate:modelValue"])
                                    ]),
                                    _: 1
                                  }),
                                  createVNode(VCol, {
                                    cols: "12",
                                    sm: "6"
                                  }, {
                                    default: withCtx(() => [
                                      createVNode(VSelect, {
                                        modelValue: unref(form).gender,
                                        "onUpdate:modelValue": ($event) => unref(form).gender = $event,
                                        items: genderItems,
                                        "item-title": "label",
                                        "item-value": "value",
                                        label: "Gender",
                                        variant: "outlined",
                                        density: "comfortable",
                                        clearable: "",
                                        "prepend-inner-icon": "mdi-human-edit"
                                      }, null, 8, ["modelValue", "onUpdate:modelValue"])
                                    ]),
                                    _: 1
                                  })
                                ]),
                                _: 1
                              }),
                              createVNode(VTextField, {
                                modelValue: unref(form).date_of_birth,
                                "onUpdate:modelValue": ($event) => unref(form).date_of_birth = $event,
                                type: "date",
                                label: "Date of Birth",
                                variant: "outlined",
                                density: "comfortable",
                                "prepend-inner-icon": "mdi-cake-variant",
                                class: "mt-2"
                              }, null, 8, ["modelValue", "onUpdate:modelValue"])
                            ]),
                            _: 1
                          }),
                          createVNode(VWindowItem, { value: "address" }, {
                            default: withCtx(() => [
                              createVNode("div", { class: "step-title" }, "Address and Notes"),
                              createVNode("div", { class: "step-subtitle" }, "Where this customer is located and any internal notes."),
                              createVNode(VTextField, {
                                modelValue: unref(form).address_line1,
                                "onUpdate:modelValue": ($event) => unref(form).address_line1 = $event,
                                label: "Address Line 1",
                                variant: "outlined",
                                density: "comfortable",
                                "prepend-inner-icon": "mdi-map-marker",
                                class: "mt-2"
                              }, null, 8, ["modelValue", "onUpdate:modelValue"]),
                              createVNode(VTextField, {
                                modelValue: unref(form).address_line2,
                                "onUpdate:modelValue": ($event) => unref(form).address_line2 = $event,
                                label: "Address Line 2",
                                variant: "outlined",
                                density: "comfortable",
                                "prepend-inner-icon": "mdi-map-marker-outline"
                              }, null, 8, ["modelValue", "onUpdate:modelValue"]),
                              createVNode(VRow, { dense: "" }, {
                                default: withCtx(() => [
                                  createVNode(VCol, {
                                    cols: "12",
                                    sm: "6"
                                  }, {
                                    default: withCtx(() => [
                                      createVNode(VTextField, {
                                        modelValue: unref(form).city,
                                        "onUpdate:modelValue": ($event) => unref(form).city = $event,
                                        label: "City",
                                        variant: "outlined",
                                        density: "comfortable",
                                        "prepend-inner-icon": "mdi-city"
                                      }, null, 8, ["modelValue", "onUpdate:modelValue"])
                                    ]),
                                    _: 1
                                  }),
                                  createVNode(VCol, {
                                    cols: "12",
                                    sm: "6"
                                  }, {
                                    default: withCtx(() => [
                                      createVNode(VTextField, {
                                        modelValue: unref(form).state_province,
                                        "onUpdate:modelValue": ($event) => unref(form).state_province = $event,
                                        label: "State / Province",
                                        variant: "outlined",
                                        density: "comfortable",
                                        "prepend-inner-icon": "mdi-map"
                                      }, null, 8, ["modelValue", "onUpdate:modelValue"])
                                    ]),
                                    _: 1
                                  })
                                ]),
                                _: 1
                              }),
                              createVNode(VRow, { dense: "" }, {
                                default: withCtx(() => [
                                  createVNode(VCol, {
                                    cols: "12",
                                    sm: "6"
                                  }, {
                                    default: withCtx(() => [
                                      createVNode(VTextField, {
                                        modelValue: unref(form).postal_code,
                                        "onUpdate:modelValue": ($event) => unref(form).postal_code = $event,
                                        label: "Postal Code",
                                        variant: "outlined",
                                        density: "comfortable",
                                        "prepend-inner-icon": "mdi-mailbox"
                                      }, null, 8, ["modelValue", "onUpdate:modelValue"])
                                    ]),
                                    _: 1
                                  }),
                                  createVNode(VCol, {
                                    cols: "12",
                                    sm: "6"
                                  }, {
                                    default: withCtx(() => [
                                      createVNode(VTextField, {
                                        modelValue: unref(form).country,
                                        "onUpdate:modelValue": ($event) => unref(form).country = $event,
                                        label: "Country",
                                        variant: "outlined",
                                        density: "comfortable",
                                        "prepend-inner-icon": "mdi-flag-outline"
                                      }, null, 8, ["modelValue", "onUpdate:modelValue"])
                                    ]),
                                    _: 1
                                  })
                                ]),
                                _: 1
                              }),
                              createVNode(VTextarea, {
                                modelValue: unref(form).notes,
                                "onUpdate:modelValue": ($event) => unref(form).notes = $event,
                                label: "Notes",
                                variant: "outlined",
                                density: "comfortable",
                                rows: "2",
                                placeholder: "Internal notes about this customer...",
                                "prepend-inner-icon": "mdi-note-edit-outline",
                                class: "mt-2"
                              }, null, 8, ["modelValue", "onUpdate:modelValue"])
                            ]),
                            _: 1
                          }),
                          createVNode(VWindowItem, { value: "loyalty" }, {
                            default: withCtx(() => [
                              createVNode("div", { class: "step-title" }, "Loyalty and Credit"),
                              createVNode("div", { class: "step-subtitle" }, "Manage loyalty tier, credit limit, and tax settings."),
                              createVNode("div", { class: "settings-card" }, [
                                createVNode("div", { class: "settings-card-label" }, "Loyalty Program"),
                                createVNode(VRow, {
                                  dense: "",
                                  class: "mt-1"
                                }, {
                                  default: withCtx(() => [
                                    createVNode(VCol, {
                                      cols: "12",
                                      sm: "6"
                                    }, {
                                      default: withCtx(() => [
                                        createVNode(VSelect, {
                                          modelValue: unref(form).loyalty_tier,
                                          "onUpdate:modelValue": ($event) => unref(form).loyalty_tier = $event,
                                          items: tierItems,
                                          "item-title": "label",
                                          "item-value": "value",
                                          label: "Loyalty Tier",
                                          variant: "outlined",
                                          density: "comfortable",
                                          "prepend-inner-icon": "mdi-medal"
                                        }, null, 8, ["modelValue", "onUpdate:modelValue"])
                                      ]),
                                      _: 1
                                    }),
                                    createVNode(VCol, {
                                      cols: "12",
                                      sm: "6"
                                    }, {
                                      default: withCtx(() => [
                                        createVNode(VTextField, {
                                          modelValue: unref(form).loyalty_member_since,
                                          "onUpdate:modelValue": ($event) => unref(form).loyalty_member_since = $event,
                                          type: "date",
                                          label: "Member Since",
                                          variant: "outlined",
                                          density: "comfortable",
                                          "prepend-inner-icon": "mdi-calendar-star"
                                        }, null, 8, ["modelValue", "onUpdate:modelValue"])
                                      ]),
                                      _: 1
                                    })
                                  ]),
                                  _: 1
                                })
                              ]),
                              createVNode("div", { class: "settings-card" }, [
                                createVNode("div", { class: "settings-card-label" }, "Credit and Tax"),
                                createVNode(VRow, {
                                  dense: "",
                                  class: "mt-1"
                                }, {
                                  default: withCtx(() => [
                                    createVNode(VCol, {
                                      cols: "12",
                                      sm: "6"
                                    }, {
                                      default: withCtx(() => [
                                        createVNode(VTextField, {
                                          modelValue: unref(form).credit_limit,
                                          "onUpdate:modelValue": ($event) => unref(form).credit_limit = $event,
                                          label: `Credit Limit (${unref(symbol)})`,
                                          variant: "outlined",
                                          density: "comfortable",
                                          type: "number",
                                          step: "0.01",
                                          min: "0",
                                          "error-messages": unref(errors).credit_limit,
                                          "prepend-inner-icon": "mdi-credit-card-clock-outline"
                                        }, null, 8, ["modelValue", "onUpdate:modelValue", "label", "error-messages"])
                                      ]),
                                      _: 1
                                    }),
                                    createVNode(VCol, {
                                      cols: "12",
                                      sm: "6"
                                    }, {
                                      default: withCtx(() => [
                                        createVNode(VSelect, {
                                          modelValue: unref(form).preferred_branch,
                                          "onUpdate:modelValue": ($event) => unref(form).preferred_branch = $event,
                                          items: __props.branches,
                                          "item-title": "name",
                                          "item-value": "id",
                                          label: "Preferred Branch",
                                          variant: "outlined",
                                          density: "comfortable",
                                          clearable: "",
                                          "prepend-inner-icon": "mdi-store-outline"
                                        }, null, 8, ["modelValue", "onUpdate:modelValue", "items"])
                                      ]),
                                      _: 1
                                    })
                                  ]),
                                  _: 1
                                }),
                                createVNode(VTextField, {
                                  modelValue: unref(form).tax_id,
                                  "onUpdate:modelValue": ($event) => unref(form).tax_id = $event,
                                  label: "Tax ID",
                                  variant: "outlined",
                                  density: "comfortable",
                                  "prepend-inner-icon": "mdi-file-document-outline",
                                  class: "mt-2"
                                }, null, 8, ["modelValue", "onUpdate:modelValue"])
                              ]),
                              createVNode("div", { class: "status-toggles" }, [
                                createVNode("div", { class: "status-toggles-label" }, "Customer Status"),
                                createVNode("div", { class: "toggle-grid" }, [
                                  createVNode("div", {
                                    class: ["toggle-item", { active: unref(form).tax_exempt }]
                                  }, [
                                    createVNode(VSwitch, {
                                      modelValue: unref(form).tax_exempt,
                                      "onUpdate:modelValue": ($event) => unref(form).tax_exempt = $event,
                                      color: "primary",
                                      density: "compact",
                                      "hide-details": "",
                                      inset: ""
                                    }, null, 8, ["modelValue", "onUpdate:modelValue"]),
                                    createVNode("div", { class: "toggle-text" }, [
                                      createVNode("div", { class: "toggle-title" }, "Tax Exempt"),
                                      createVNode("div", { class: "toggle-desc" }, "Customer is exempt from sales tax")
                                    ])
                                  ], 2),
                                  createVNode("div", {
                                    class: ["toggle-item", { active: unref(form).is_active }]
                                  }, [
                                    createVNode(VSwitch, {
                                      modelValue: unref(form).is_active,
                                      "onUpdate:modelValue": ($event) => unref(form).is_active = $event,
                                      color: "primary",
                                      density: "compact",
                                      "hide-details": "",
                                      inset: ""
                                    }, null, 8, ["modelValue", "onUpdate:modelValue"]),
                                    createVNode("div", { class: "toggle-text" }, [
                                      createVNode("div", { class: "toggle-title" }, "Active"),
                                      createVNode("div", { class: "toggle-desc" }, "Customer can make purchases")
                                    ])
                                  ], 2)
                                ])
                              ])
                            ]),
                            _: 1
                          })
                        ];
                      }
                    }),
                    _: 1
                  }, _parent3, _scopeId2));
                  _push3(`</div></div>`);
                  _push3(ssrRenderComponent(VDivider, null, null, _parent3, _scopeId2));
                  _push3(`<div class="modal-footer" data-v-824d6d4a${_scopeId2}><div class="d-flex align-center ga-2 text-body-2 text-medium-emphasis" data-v-824d6d4a${_scopeId2}>`);
                  _push3(ssrRenderComponent(VIcon, {
                    size: "16",
                    icon: unref(activeTab) === "profile" ? "mdi-account-details" : unref(activeTab) === "address" ? "mdi-map-marker" : "mdi-medal"
                  }, null, _parent3, _scopeId2));
                  _push3(` Step ${ssrInterpolate(unref(currentStepIndex) + 1)} of ${ssrInterpolate(stepList.length)} — ${ssrInterpolate(stepList[unref(currentStepIndex)].label)}</div><div class="d-flex ga-2" data-v-824d6d4a${_scopeId2}>`);
                  _push3(ssrRenderComponent(VBtn, {
                    variant: "text",
                    onClick: ($event) => _ctx.$emit("close")
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
                  if (unref(currentStepIndex) < stepList.length - 1) {
                    _push3(ssrRenderComponent(VBtn, {
                      variant: "outlined",
                      onClick: nextStep
                    }, {
                      default: withCtx((_3, _push4, _parent4, _scopeId3) => {
                        if (_push4) {
                          _push4(` Next `);
                          _push4(ssrRenderComponent(VIcon, { end: "" }, {
                            default: withCtx((_4, _push5, _parent5, _scopeId4) => {
                              if (_push5) {
                                _push5(`mdi-chevron-right`);
                              } else {
                                return [
                                  createTextVNode("mdi-chevron-right")
                                ];
                              }
                            }),
                            _: 1
                          }, _parent4, _scopeId3));
                        } else {
                          return [
                            createTextVNode(" Next "),
                            createVNode(VIcon, { end: "" }, {
                              default: withCtx(() => [
                                createTextVNode("mdi-chevron-right")
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
                  _push3(ssrRenderComponent(VBtn, {
                    color: "deep-purple",
                    loading: unref(saving),
                    onClick: save
                  }, {
                    default: withCtx((_3, _push4, _parent4, _scopeId3) => {
                      if (_push4) {
                        _push4(ssrRenderComponent(VIcon, {
                          start: "",
                          size: "18"
                        }, {
                          default: withCtx((_4, _push5, _parent5, _scopeId4) => {
                            if (_push5) {
                              _push5(`${ssrInterpolate(unref(isEdit) ? "mdi-content-save" : "mdi-check")}`);
                            } else {
                              return [
                                createTextVNode(toDisplayString(unref(isEdit) ? "mdi-content-save" : "mdi-check"), 1)
                              ];
                            }
                          }),
                          _: 1
                        }, _parent4, _scopeId3));
                        _push4(` ${ssrInterpolate(unref(isEdit) ? "Update" : "Create")}`);
                      } else {
                        return [
                          createVNode(VIcon, {
                            start: "",
                            size: "18"
                          }, {
                            default: withCtx(() => [
                              createTextVNode(toDisplayString(unref(isEdit) ? "mdi-content-save" : "mdi-check"), 1)
                            ]),
                            _: 1
                          }),
                          createTextVNode(" " + toDisplayString(unref(isEdit) ? "Update" : "Create"), 1)
                        ];
                      }
                    }),
                    _: 1
                  }, _parent3, _scopeId2));
                  _push3(`</div></div>`);
                } else {
                  return [
                    createVNode("div", { class: "modal-header" }, [
                      createVNode("div", { class: "d-flex align-center ga-3" }, [
                        createVNode(VAvatar, {
                          color: unref(isEdit) ? "deep-purple" : "success",
                          size: "44",
                          rounded: "lg"
                        }, {
                          default: withCtx(() => [
                            createVNode(VIcon, {
                              size: "22",
                              icon: "mdi-account-details"
                            })
                          ]),
                          _: 1
                        }, 8, ["color"]),
                        createVNode("div", null, [
                          createVNode("div", { class: "text-h6 font-weight-bold" }, toDisplayString(unref(isEdit) ? "Edit Customer" : "Add New Customer"), 1),
                          createVNode("div", { class: "text-body-2 text-medium-emphasis" }, toDisplayString(unref(isEdit) ? "Update customer details and preferences" : "Create a new customer profile"), 1)
                        ])
                      ]),
                      createVNode(VBtn, {
                        icon: "",
                        variant: "text",
                        size: "small",
                        onClick: ($event) => _ctx.$emit("close")
                      }, {
                        default: withCtx(() => [
                          createVNode(VIcon, null, {
                            default: withCtx(() => [
                              createTextVNode("mdi-close")
                            ]),
                            _: 1
                          })
                        ]),
                        _: 1
                      }, 8, ["onClick"])
                    ]),
                    createVNode(VDivider),
                    createVNode("div", { class: "modal-body" }, [
                      createVNode("div", { class: "stepper-nav" }, [
                        (openBlock(), createBlock(Fragment, null, renderList(stepList, (step, i) => {
                          return createVNode("div", {
                            key: step.id,
                            class: ["stepper-item", { active: unref(activeTab) === step.id }],
                            onClick: ($event) => activeTab.value = step.id
                          }, [
                            createVNode("div", { class: "stepper-num" }, toDisplayString(i + 1), 1),
                            createVNode("div", { class: "stepper-text" }, [
                              createVNode("div", { class: "stepper-label" }, toDisplayString(step.label), 1),
                              createVNode("div", { class: "stepper-desc" }, toDisplayString(step.desc), 1)
                            ])
                          ], 10, ["onClick"]);
                        }), 64))
                      ]),
                      createVNode("div", { class: "stepper-content" }, [
                        createVNode(VWindow, {
                          modelValue: unref(activeTab),
                          "onUpdate:modelValue": ($event) => isRef(activeTab) ? activeTab.value = $event : null,
                          class: "fill-height"
                        }, {
                          default: withCtx(() => [
                            createVNode(VWindowItem, { value: "profile" }, {
                              default: withCtx(() => [
                                createVNode("div", { class: "step-title" }, "Customer Profile"),
                                createVNode("div", { class: "step-subtitle" }, "Basic information about this customer."),
                                createVNode(VRow, {
                                  dense: "",
                                  class: "mt-2"
                                }, {
                                  default: withCtx(() => [
                                    createVNode(VCol, {
                                      cols: "12",
                                      sm: "6"
                                    }, {
                                      default: withCtx(() => [
                                        createVNode(VSelect, {
                                          modelValue: unref(form).customer_type,
                                          "onUpdate:modelValue": ($event) => unref(form).customer_type = $event,
                                          items: customerTypeItems,
                                          "item-title": "label",
                                          "item-value": "value",
                                          label: "Customer Type",
                                          variant: "outlined",
                                          density: "comfortable",
                                          "prepend-inner-icon": "mdi-account-group"
                                        }, null, 8, ["modelValue", "onUpdate:modelValue"])
                                      ]),
                                      _: 1
                                    }),
                                    createVNode(VCol, {
                                      cols: "12",
                                      sm: "6"
                                    }, {
                                      default: withCtx(() => [
                                        createVNode(VTextField, {
                                          modelValue: unref(form).customer_code,
                                          "onUpdate:modelValue": ($event) => unref(form).customer_code = $event,
                                          label: "Customer Code",
                                          variant: "outlined",
                                          density: "comfortable",
                                          "append-inner-icon": "mdi-refresh",
                                          "onClick:appendInner": generateCustomerCode,
                                          hint: "Click the icon to auto-generate",
                                          "persistent-hint": "",
                                          "error-messages": unref(errors).customer_code,
                                          placeholder: "CUST-001"
                                        }, null, 8, ["modelValue", "onUpdate:modelValue", "error-messages"])
                                      ]),
                                      _: 1
                                    })
                                  ]),
                                  _: 1
                                }),
                                unref(form).customer_type === "individual" ? (openBlock(), createBlock(VRow, {
                                  key: 0,
                                  dense: ""
                                }, {
                                  default: withCtx(() => [
                                    createVNode(VCol, {
                                      cols: "12",
                                      sm: "6"
                                    }, {
                                      default: withCtx(() => [
                                        createVNode(VTextField, {
                                          modelValue: unref(form).first_name,
                                          "onUpdate:modelValue": ($event) => unref(form).first_name = $event,
                                          label: "First Name",
                                          variant: "outlined",
                                          density: "comfortable",
                                          "error-messages": unref(errors).first_name,
                                          "prepend-inner-icon": "mdi-account"
                                        }, null, 8, ["modelValue", "onUpdate:modelValue", "error-messages"])
                                      ]),
                                      _: 1
                                    }),
                                    createVNode(VCol, {
                                      cols: "12",
                                      sm: "6"
                                    }, {
                                      default: withCtx(() => [
                                        createVNode(VTextField, {
                                          modelValue: unref(form).last_name,
                                          "onUpdate:modelValue": ($event) => unref(form).last_name = $event,
                                          label: "Last Name",
                                          variant: "outlined",
                                          density: "comfortable",
                                          "error-messages": unref(errors).last_name,
                                          "prepend-inner-icon": "mdi-account-outline"
                                        }, null, 8, ["modelValue", "onUpdate:modelValue", "error-messages"])
                                      ]),
                                      _: 1
                                    })
                                  ]),
                                  _: 1
                                })) : (openBlock(), createBlock(VTextField, {
                                  key: 1,
                                  modelValue: unref(form).company_name,
                                  "onUpdate:modelValue": ($event) => unref(form).company_name = $event,
                                  label: "Company Name",
                                  variant: "outlined",
                                  density: "comfortable",
                                  "error-messages": unref(errors).company_name,
                                  "prepend-inner-icon": "mdi-domain",
                                  class: "mt-2"
                                }, null, 8, ["modelValue", "onUpdate:modelValue", "error-messages"])),
                                createVNode(VRow, { dense: "" }, {
                                  default: withCtx(() => [
                                    createVNode(VCol, {
                                      cols: "12",
                                      sm: "6"
                                    }, {
                                      default: withCtx(() => [
                                        createVNode(VTextField, {
                                          modelValue: unref(form).email,
                                          "onUpdate:modelValue": ($event) => unref(form).email = $event,
                                          label: "Email",
                                          variant: "outlined",
                                          density: "comfortable",
                                          type: "email",
                                          "error-messages": unref(errors).email,
                                          "prepend-inner-icon": "mdi-email-outline"
                                        }, null, 8, ["modelValue", "onUpdate:modelValue", "error-messages"])
                                      ]),
                                      _: 1
                                    }),
                                    createVNode(VCol, {
                                      cols: "12",
                                      sm: "6"
                                    }, {
                                      default: withCtx(() => [
                                        createVNode(VTextField, {
                                          modelValue: unref(form).phone,
                                          "onUpdate:modelValue": ($event) => unref(form).phone = $event,
                                          label: "Phone",
                                          variant: "outlined",
                                          density: "comfortable",
                                          "error-messages": unref(errors).phone,
                                          "prepend-inner-icon": "mdi-phone-outline"
                                        }, null, 8, ["modelValue", "onUpdate:modelValue", "error-messages"])
                                      ]),
                                      _: 1
                                    })
                                  ]),
                                  _: 1
                                }),
                                createVNode(VRow, { dense: "" }, {
                                  default: withCtx(() => [
                                    createVNode(VCol, {
                                      cols: "12",
                                      sm: "6"
                                    }, {
                                      default: withCtx(() => [
                                        createVNode(VTextField, {
                                          modelValue: unref(form).secondary_phone,
                                          "onUpdate:modelValue": ($event) => unref(form).secondary_phone = $event,
                                          label: "Secondary Phone",
                                          variant: "outlined",
                                          density: "comfortable",
                                          "prepend-inner-icon": "mdi-phone-plus"
                                        }, null, 8, ["modelValue", "onUpdate:modelValue"])
                                      ]),
                                      _: 1
                                    }),
                                    createVNode(VCol, {
                                      cols: "12",
                                      sm: "6"
                                    }, {
                                      default: withCtx(() => [
                                        createVNode(VSelect, {
                                          modelValue: unref(form).gender,
                                          "onUpdate:modelValue": ($event) => unref(form).gender = $event,
                                          items: genderItems,
                                          "item-title": "label",
                                          "item-value": "value",
                                          label: "Gender",
                                          variant: "outlined",
                                          density: "comfortable",
                                          clearable: "",
                                          "prepend-inner-icon": "mdi-human-edit"
                                        }, null, 8, ["modelValue", "onUpdate:modelValue"])
                                      ]),
                                      _: 1
                                    })
                                  ]),
                                  _: 1
                                }),
                                createVNode(VTextField, {
                                  modelValue: unref(form).date_of_birth,
                                  "onUpdate:modelValue": ($event) => unref(form).date_of_birth = $event,
                                  type: "date",
                                  label: "Date of Birth",
                                  variant: "outlined",
                                  density: "comfortable",
                                  "prepend-inner-icon": "mdi-cake-variant",
                                  class: "mt-2"
                                }, null, 8, ["modelValue", "onUpdate:modelValue"])
                              ]),
                              _: 1
                            }),
                            createVNode(VWindowItem, { value: "address" }, {
                              default: withCtx(() => [
                                createVNode("div", { class: "step-title" }, "Address and Notes"),
                                createVNode("div", { class: "step-subtitle" }, "Where this customer is located and any internal notes."),
                                createVNode(VTextField, {
                                  modelValue: unref(form).address_line1,
                                  "onUpdate:modelValue": ($event) => unref(form).address_line1 = $event,
                                  label: "Address Line 1",
                                  variant: "outlined",
                                  density: "comfortable",
                                  "prepend-inner-icon": "mdi-map-marker",
                                  class: "mt-2"
                                }, null, 8, ["modelValue", "onUpdate:modelValue"]),
                                createVNode(VTextField, {
                                  modelValue: unref(form).address_line2,
                                  "onUpdate:modelValue": ($event) => unref(form).address_line2 = $event,
                                  label: "Address Line 2",
                                  variant: "outlined",
                                  density: "comfortable",
                                  "prepend-inner-icon": "mdi-map-marker-outline"
                                }, null, 8, ["modelValue", "onUpdate:modelValue"]),
                                createVNode(VRow, { dense: "" }, {
                                  default: withCtx(() => [
                                    createVNode(VCol, {
                                      cols: "12",
                                      sm: "6"
                                    }, {
                                      default: withCtx(() => [
                                        createVNode(VTextField, {
                                          modelValue: unref(form).city,
                                          "onUpdate:modelValue": ($event) => unref(form).city = $event,
                                          label: "City",
                                          variant: "outlined",
                                          density: "comfortable",
                                          "prepend-inner-icon": "mdi-city"
                                        }, null, 8, ["modelValue", "onUpdate:modelValue"])
                                      ]),
                                      _: 1
                                    }),
                                    createVNode(VCol, {
                                      cols: "12",
                                      sm: "6"
                                    }, {
                                      default: withCtx(() => [
                                        createVNode(VTextField, {
                                          modelValue: unref(form).state_province,
                                          "onUpdate:modelValue": ($event) => unref(form).state_province = $event,
                                          label: "State / Province",
                                          variant: "outlined",
                                          density: "comfortable",
                                          "prepend-inner-icon": "mdi-map"
                                        }, null, 8, ["modelValue", "onUpdate:modelValue"])
                                      ]),
                                      _: 1
                                    })
                                  ]),
                                  _: 1
                                }),
                                createVNode(VRow, { dense: "" }, {
                                  default: withCtx(() => [
                                    createVNode(VCol, {
                                      cols: "12",
                                      sm: "6"
                                    }, {
                                      default: withCtx(() => [
                                        createVNode(VTextField, {
                                          modelValue: unref(form).postal_code,
                                          "onUpdate:modelValue": ($event) => unref(form).postal_code = $event,
                                          label: "Postal Code",
                                          variant: "outlined",
                                          density: "comfortable",
                                          "prepend-inner-icon": "mdi-mailbox"
                                        }, null, 8, ["modelValue", "onUpdate:modelValue"])
                                      ]),
                                      _: 1
                                    }),
                                    createVNode(VCol, {
                                      cols: "12",
                                      sm: "6"
                                    }, {
                                      default: withCtx(() => [
                                        createVNode(VTextField, {
                                          modelValue: unref(form).country,
                                          "onUpdate:modelValue": ($event) => unref(form).country = $event,
                                          label: "Country",
                                          variant: "outlined",
                                          density: "comfortable",
                                          "prepend-inner-icon": "mdi-flag-outline"
                                        }, null, 8, ["modelValue", "onUpdate:modelValue"])
                                      ]),
                                      _: 1
                                    })
                                  ]),
                                  _: 1
                                }),
                                createVNode(VTextarea, {
                                  modelValue: unref(form).notes,
                                  "onUpdate:modelValue": ($event) => unref(form).notes = $event,
                                  label: "Notes",
                                  variant: "outlined",
                                  density: "comfortable",
                                  rows: "2",
                                  placeholder: "Internal notes about this customer...",
                                  "prepend-inner-icon": "mdi-note-edit-outline",
                                  class: "mt-2"
                                }, null, 8, ["modelValue", "onUpdate:modelValue"])
                              ]),
                              _: 1
                            }),
                            createVNode(VWindowItem, { value: "loyalty" }, {
                              default: withCtx(() => [
                                createVNode("div", { class: "step-title" }, "Loyalty and Credit"),
                                createVNode("div", { class: "step-subtitle" }, "Manage loyalty tier, credit limit, and tax settings."),
                                createVNode("div", { class: "settings-card" }, [
                                  createVNode("div", { class: "settings-card-label" }, "Loyalty Program"),
                                  createVNode(VRow, {
                                    dense: "",
                                    class: "mt-1"
                                  }, {
                                    default: withCtx(() => [
                                      createVNode(VCol, {
                                        cols: "12",
                                        sm: "6"
                                      }, {
                                        default: withCtx(() => [
                                          createVNode(VSelect, {
                                            modelValue: unref(form).loyalty_tier,
                                            "onUpdate:modelValue": ($event) => unref(form).loyalty_tier = $event,
                                            items: tierItems,
                                            "item-title": "label",
                                            "item-value": "value",
                                            label: "Loyalty Tier",
                                            variant: "outlined",
                                            density: "comfortable",
                                            "prepend-inner-icon": "mdi-medal"
                                          }, null, 8, ["modelValue", "onUpdate:modelValue"])
                                        ]),
                                        _: 1
                                      }),
                                      createVNode(VCol, {
                                        cols: "12",
                                        sm: "6"
                                      }, {
                                        default: withCtx(() => [
                                          createVNode(VTextField, {
                                            modelValue: unref(form).loyalty_member_since,
                                            "onUpdate:modelValue": ($event) => unref(form).loyalty_member_since = $event,
                                            type: "date",
                                            label: "Member Since",
                                            variant: "outlined",
                                            density: "comfortable",
                                            "prepend-inner-icon": "mdi-calendar-star"
                                          }, null, 8, ["modelValue", "onUpdate:modelValue"])
                                        ]),
                                        _: 1
                                      })
                                    ]),
                                    _: 1
                                  })
                                ]),
                                createVNode("div", { class: "settings-card" }, [
                                  createVNode("div", { class: "settings-card-label" }, "Credit and Tax"),
                                  createVNode(VRow, {
                                    dense: "",
                                    class: "mt-1"
                                  }, {
                                    default: withCtx(() => [
                                      createVNode(VCol, {
                                        cols: "12",
                                        sm: "6"
                                      }, {
                                        default: withCtx(() => [
                                          createVNode(VTextField, {
                                            modelValue: unref(form).credit_limit,
                                            "onUpdate:modelValue": ($event) => unref(form).credit_limit = $event,
                                            label: `Credit Limit (${unref(symbol)})`,
                                            variant: "outlined",
                                            density: "comfortable",
                                            type: "number",
                                            step: "0.01",
                                            min: "0",
                                            "error-messages": unref(errors).credit_limit,
                                            "prepend-inner-icon": "mdi-credit-card-clock-outline"
                                          }, null, 8, ["modelValue", "onUpdate:modelValue", "label", "error-messages"])
                                        ]),
                                        _: 1
                                      }),
                                      createVNode(VCol, {
                                        cols: "12",
                                        sm: "6"
                                      }, {
                                        default: withCtx(() => [
                                          createVNode(VSelect, {
                                            modelValue: unref(form).preferred_branch,
                                            "onUpdate:modelValue": ($event) => unref(form).preferred_branch = $event,
                                            items: __props.branches,
                                            "item-title": "name",
                                            "item-value": "id",
                                            label: "Preferred Branch",
                                            variant: "outlined",
                                            density: "comfortable",
                                            clearable: "",
                                            "prepend-inner-icon": "mdi-store-outline"
                                          }, null, 8, ["modelValue", "onUpdate:modelValue", "items"])
                                        ]),
                                        _: 1
                                      })
                                    ]),
                                    _: 1
                                  }),
                                  createVNode(VTextField, {
                                    modelValue: unref(form).tax_id,
                                    "onUpdate:modelValue": ($event) => unref(form).tax_id = $event,
                                    label: "Tax ID",
                                    variant: "outlined",
                                    density: "comfortable",
                                    "prepend-inner-icon": "mdi-file-document-outline",
                                    class: "mt-2"
                                  }, null, 8, ["modelValue", "onUpdate:modelValue"])
                                ]),
                                createVNode("div", { class: "status-toggles" }, [
                                  createVNode("div", { class: "status-toggles-label" }, "Customer Status"),
                                  createVNode("div", { class: "toggle-grid" }, [
                                    createVNode("div", {
                                      class: ["toggle-item", { active: unref(form).tax_exempt }]
                                    }, [
                                      createVNode(VSwitch, {
                                        modelValue: unref(form).tax_exempt,
                                        "onUpdate:modelValue": ($event) => unref(form).tax_exempt = $event,
                                        color: "primary",
                                        density: "compact",
                                        "hide-details": "",
                                        inset: ""
                                      }, null, 8, ["modelValue", "onUpdate:modelValue"]),
                                      createVNode("div", { class: "toggle-text" }, [
                                        createVNode("div", { class: "toggle-title" }, "Tax Exempt"),
                                        createVNode("div", { class: "toggle-desc" }, "Customer is exempt from sales tax")
                                      ])
                                    ], 2),
                                    createVNode("div", {
                                      class: ["toggle-item", { active: unref(form).is_active }]
                                    }, [
                                      createVNode(VSwitch, {
                                        modelValue: unref(form).is_active,
                                        "onUpdate:modelValue": ($event) => unref(form).is_active = $event,
                                        color: "primary",
                                        density: "compact",
                                        "hide-details": "",
                                        inset: ""
                                      }, null, 8, ["modelValue", "onUpdate:modelValue"]),
                                      createVNode("div", { class: "toggle-text" }, [
                                        createVNode("div", { class: "toggle-title" }, "Active"),
                                        createVNode("div", { class: "toggle-desc" }, "Customer can make purchases")
                                      ])
                                    ], 2)
                                  ])
                                ])
                              ]),
                              _: 1
                            })
                          ]),
                          _: 1
                        }, 8, ["modelValue", "onUpdate:modelValue"])
                      ])
                    ]),
                    createVNode(VDivider),
                    createVNode("div", { class: "modal-footer" }, [
                      createVNode("div", { class: "d-flex align-center ga-2 text-body-2 text-medium-emphasis" }, [
                        createVNode(VIcon, {
                          size: "16",
                          icon: unref(activeTab) === "profile" ? "mdi-account-details" : unref(activeTab) === "address" ? "mdi-map-marker" : "mdi-medal"
                        }, null, 8, ["icon"]),
                        createTextVNode(" Step " + toDisplayString(unref(currentStepIndex) + 1) + " of " + toDisplayString(stepList.length) + " — " + toDisplayString(stepList[unref(currentStepIndex)].label), 1)
                      ]),
                      createVNode("div", { class: "d-flex ga-2" }, [
                        createVNode(VBtn, {
                          variant: "text",
                          onClick: ($event) => _ctx.$emit("close")
                        }, {
                          default: withCtx(() => [
                            createTextVNode("Cancel")
                          ]),
                          _: 1
                        }, 8, ["onClick"]),
                        unref(currentStepIndex) < stepList.length - 1 ? (openBlock(), createBlock(VBtn, {
                          key: 0,
                          variant: "outlined",
                          onClick: nextStep
                        }, {
                          default: withCtx(() => [
                            createTextVNode(" Next "),
                            createVNode(VIcon, { end: "" }, {
                              default: withCtx(() => [
                                createTextVNode("mdi-chevron-right")
                              ]),
                              _: 1
                            })
                          ]),
                          _: 1
                        })) : createCommentVNode("", true),
                        createVNode(VBtn, {
                          color: "deep-purple",
                          loading: unref(saving),
                          onClick: save
                        }, {
                          default: withCtx(() => [
                            createVNode(VIcon, {
                              start: "",
                              size: "18"
                            }, {
                              default: withCtx(() => [
                                createTextVNode(toDisplayString(unref(isEdit) ? "mdi-content-save" : "mdi-check"), 1)
                              ]),
                              _: 1
                            }),
                            createTextVNode(" " + toDisplayString(unref(isEdit) ? "Update" : "Create"), 1)
                          ]),
                          _: 1
                        }, 8, ["loading"])
                      ])
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
                class: "cust-modal-card"
              }, {
                default: withCtx(() => [
                  createVNode("div", { class: "modal-header" }, [
                    createVNode("div", { class: "d-flex align-center ga-3" }, [
                      createVNode(VAvatar, {
                        color: unref(isEdit) ? "deep-purple" : "success",
                        size: "44",
                        rounded: "lg"
                      }, {
                        default: withCtx(() => [
                          createVNode(VIcon, {
                            size: "22",
                            icon: "mdi-account-details"
                          })
                        ]),
                        _: 1
                      }, 8, ["color"]),
                      createVNode("div", null, [
                        createVNode("div", { class: "text-h6 font-weight-bold" }, toDisplayString(unref(isEdit) ? "Edit Customer" : "Add New Customer"), 1),
                        createVNode("div", { class: "text-body-2 text-medium-emphasis" }, toDisplayString(unref(isEdit) ? "Update customer details and preferences" : "Create a new customer profile"), 1)
                      ])
                    ]),
                    createVNode(VBtn, {
                      icon: "",
                      variant: "text",
                      size: "small",
                      onClick: ($event) => _ctx.$emit("close")
                    }, {
                      default: withCtx(() => [
                        createVNode(VIcon, null, {
                          default: withCtx(() => [
                            createTextVNode("mdi-close")
                          ]),
                          _: 1
                        })
                      ]),
                      _: 1
                    }, 8, ["onClick"])
                  ]),
                  createVNode(VDivider),
                  createVNode("div", { class: "modal-body" }, [
                    createVNode("div", { class: "stepper-nav" }, [
                      (openBlock(), createBlock(Fragment, null, renderList(stepList, (step, i) => {
                        return createVNode("div", {
                          key: step.id,
                          class: ["stepper-item", { active: unref(activeTab) === step.id }],
                          onClick: ($event) => activeTab.value = step.id
                        }, [
                          createVNode("div", { class: "stepper-num" }, toDisplayString(i + 1), 1),
                          createVNode("div", { class: "stepper-text" }, [
                            createVNode("div", { class: "stepper-label" }, toDisplayString(step.label), 1),
                            createVNode("div", { class: "stepper-desc" }, toDisplayString(step.desc), 1)
                          ])
                        ], 10, ["onClick"]);
                      }), 64))
                    ]),
                    createVNode("div", { class: "stepper-content" }, [
                      createVNode(VWindow, {
                        modelValue: unref(activeTab),
                        "onUpdate:modelValue": ($event) => isRef(activeTab) ? activeTab.value = $event : null,
                        class: "fill-height"
                      }, {
                        default: withCtx(() => [
                          createVNode(VWindowItem, { value: "profile" }, {
                            default: withCtx(() => [
                              createVNode("div", { class: "step-title" }, "Customer Profile"),
                              createVNode("div", { class: "step-subtitle" }, "Basic information about this customer."),
                              createVNode(VRow, {
                                dense: "",
                                class: "mt-2"
                              }, {
                                default: withCtx(() => [
                                  createVNode(VCol, {
                                    cols: "12",
                                    sm: "6"
                                  }, {
                                    default: withCtx(() => [
                                      createVNode(VSelect, {
                                        modelValue: unref(form).customer_type,
                                        "onUpdate:modelValue": ($event) => unref(form).customer_type = $event,
                                        items: customerTypeItems,
                                        "item-title": "label",
                                        "item-value": "value",
                                        label: "Customer Type",
                                        variant: "outlined",
                                        density: "comfortable",
                                        "prepend-inner-icon": "mdi-account-group"
                                      }, null, 8, ["modelValue", "onUpdate:modelValue"])
                                    ]),
                                    _: 1
                                  }),
                                  createVNode(VCol, {
                                    cols: "12",
                                    sm: "6"
                                  }, {
                                    default: withCtx(() => [
                                      createVNode(VTextField, {
                                        modelValue: unref(form).customer_code,
                                        "onUpdate:modelValue": ($event) => unref(form).customer_code = $event,
                                        label: "Customer Code",
                                        variant: "outlined",
                                        density: "comfortable",
                                        "append-inner-icon": "mdi-refresh",
                                        "onClick:appendInner": generateCustomerCode,
                                        hint: "Click the icon to auto-generate",
                                        "persistent-hint": "",
                                        "error-messages": unref(errors).customer_code,
                                        placeholder: "CUST-001"
                                      }, null, 8, ["modelValue", "onUpdate:modelValue", "error-messages"])
                                    ]),
                                    _: 1
                                  })
                                ]),
                                _: 1
                              }),
                              unref(form).customer_type === "individual" ? (openBlock(), createBlock(VRow, {
                                key: 0,
                                dense: ""
                              }, {
                                default: withCtx(() => [
                                  createVNode(VCol, {
                                    cols: "12",
                                    sm: "6"
                                  }, {
                                    default: withCtx(() => [
                                      createVNode(VTextField, {
                                        modelValue: unref(form).first_name,
                                        "onUpdate:modelValue": ($event) => unref(form).first_name = $event,
                                        label: "First Name",
                                        variant: "outlined",
                                        density: "comfortable",
                                        "error-messages": unref(errors).first_name,
                                        "prepend-inner-icon": "mdi-account"
                                      }, null, 8, ["modelValue", "onUpdate:modelValue", "error-messages"])
                                    ]),
                                    _: 1
                                  }),
                                  createVNode(VCol, {
                                    cols: "12",
                                    sm: "6"
                                  }, {
                                    default: withCtx(() => [
                                      createVNode(VTextField, {
                                        modelValue: unref(form).last_name,
                                        "onUpdate:modelValue": ($event) => unref(form).last_name = $event,
                                        label: "Last Name",
                                        variant: "outlined",
                                        density: "comfortable",
                                        "error-messages": unref(errors).last_name,
                                        "prepend-inner-icon": "mdi-account-outline"
                                      }, null, 8, ["modelValue", "onUpdate:modelValue", "error-messages"])
                                    ]),
                                    _: 1
                                  })
                                ]),
                                _: 1
                              })) : (openBlock(), createBlock(VTextField, {
                                key: 1,
                                modelValue: unref(form).company_name,
                                "onUpdate:modelValue": ($event) => unref(form).company_name = $event,
                                label: "Company Name",
                                variant: "outlined",
                                density: "comfortable",
                                "error-messages": unref(errors).company_name,
                                "prepend-inner-icon": "mdi-domain",
                                class: "mt-2"
                              }, null, 8, ["modelValue", "onUpdate:modelValue", "error-messages"])),
                              createVNode(VRow, { dense: "" }, {
                                default: withCtx(() => [
                                  createVNode(VCol, {
                                    cols: "12",
                                    sm: "6"
                                  }, {
                                    default: withCtx(() => [
                                      createVNode(VTextField, {
                                        modelValue: unref(form).email,
                                        "onUpdate:modelValue": ($event) => unref(form).email = $event,
                                        label: "Email",
                                        variant: "outlined",
                                        density: "comfortable",
                                        type: "email",
                                        "error-messages": unref(errors).email,
                                        "prepend-inner-icon": "mdi-email-outline"
                                      }, null, 8, ["modelValue", "onUpdate:modelValue", "error-messages"])
                                    ]),
                                    _: 1
                                  }),
                                  createVNode(VCol, {
                                    cols: "12",
                                    sm: "6"
                                  }, {
                                    default: withCtx(() => [
                                      createVNode(VTextField, {
                                        modelValue: unref(form).phone,
                                        "onUpdate:modelValue": ($event) => unref(form).phone = $event,
                                        label: "Phone",
                                        variant: "outlined",
                                        density: "comfortable",
                                        "error-messages": unref(errors).phone,
                                        "prepend-inner-icon": "mdi-phone-outline"
                                      }, null, 8, ["modelValue", "onUpdate:modelValue", "error-messages"])
                                    ]),
                                    _: 1
                                  })
                                ]),
                                _: 1
                              }),
                              createVNode(VRow, { dense: "" }, {
                                default: withCtx(() => [
                                  createVNode(VCol, {
                                    cols: "12",
                                    sm: "6"
                                  }, {
                                    default: withCtx(() => [
                                      createVNode(VTextField, {
                                        modelValue: unref(form).secondary_phone,
                                        "onUpdate:modelValue": ($event) => unref(form).secondary_phone = $event,
                                        label: "Secondary Phone",
                                        variant: "outlined",
                                        density: "comfortable",
                                        "prepend-inner-icon": "mdi-phone-plus"
                                      }, null, 8, ["modelValue", "onUpdate:modelValue"])
                                    ]),
                                    _: 1
                                  }),
                                  createVNode(VCol, {
                                    cols: "12",
                                    sm: "6"
                                  }, {
                                    default: withCtx(() => [
                                      createVNode(VSelect, {
                                        modelValue: unref(form).gender,
                                        "onUpdate:modelValue": ($event) => unref(form).gender = $event,
                                        items: genderItems,
                                        "item-title": "label",
                                        "item-value": "value",
                                        label: "Gender",
                                        variant: "outlined",
                                        density: "comfortable",
                                        clearable: "",
                                        "prepend-inner-icon": "mdi-human-edit"
                                      }, null, 8, ["modelValue", "onUpdate:modelValue"])
                                    ]),
                                    _: 1
                                  })
                                ]),
                                _: 1
                              }),
                              createVNode(VTextField, {
                                modelValue: unref(form).date_of_birth,
                                "onUpdate:modelValue": ($event) => unref(form).date_of_birth = $event,
                                type: "date",
                                label: "Date of Birth",
                                variant: "outlined",
                                density: "comfortable",
                                "prepend-inner-icon": "mdi-cake-variant",
                                class: "mt-2"
                              }, null, 8, ["modelValue", "onUpdate:modelValue"])
                            ]),
                            _: 1
                          }),
                          createVNode(VWindowItem, { value: "address" }, {
                            default: withCtx(() => [
                              createVNode("div", { class: "step-title" }, "Address and Notes"),
                              createVNode("div", { class: "step-subtitle" }, "Where this customer is located and any internal notes."),
                              createVNode(VTextField, {
                                modelValue: unref(form).address_line1,
                                "onUpdate:modelValue": ($event) => unref(form).address_line1 = $event,
                                label: "Address Line 1",
                                variant: "outlined",
                                density: "comfortable",
                                "prepend-inner-icon": "mdi-map-marker",
                                class: "mt-2"
                              }, null, 8, ["modelValue", "onUpdate:modelValue"]),
                              createVNode(VTextField, {
                                modelValue: unref(form).address_line2,
                                "onUpdate:modelValue": ($event) => unref(form).address_line2 = $event,
                                label: "Address Line 2",
                                variant: "outlined",
                                density: "comfortable",
                                "prepend-inner-icon": "mdi-map-marker-outline"
                              }, null, 8, ["modelValue", "onUpdate:modelValue"]),
                              createVNode(VRow, { dense: "" }, {
                                default: withCtx(() => [
                                  createVNode(VCol, {
                                    cols: "12",
                                    sm: "6"
                                  }, {
                                    default: withCtx(() => [
                                      createVNode(VTextField, {
                                        modelValue: unref(form).city,
                                        "onUpdate:modelValue": ($event) => unref(form).city = $event,
                                        label: "City",
                                        variant: "outlined",
                                        density: "comfortable",
                                        "prepend-inner-icon": "mdi-city"
                                      }, null, 8, ["modelValue", "onUpdate:modelValue"])
                                    ]),
                                    _: 1
                                  }),
                                  createVNode(VCol, {
                                    cols: "12",
                                    sm: "6"
                                  }, {
                                    default: withCtx(() => [
                                      createVNode(VTextField, {
                                        modelValue: unref(form).state_province,
                                        "onUpdate:modelValue": ($event) => unref(form).state_province = $event,
                                        label: "State / Province",
                                        variant: "outlined",
                                        density: "comfortable",
                                        "prepend-inner-icon": "mdi-map"
                                      }, null, 8, ["modelValue", "onUpdate:modelValue"])
                                    ]),
                                    _: 1
                                  })
                                ]),
                                _: 1
                              }),
                              createVNode(VRow, { dense: "" }, {
                                default: withCtx(() => [
                                  createVNode(VCol, {
                                    cols: "12",
                                    sm: "6"
                                  }, {
                                    default: withCtx(() => [
                                      createVNode(VTextField, {
                                        modelValue: unref(form).postal_code,
                                        "onUpdate:modelValue": ($event) => unref(form).postal_code = $event,
                                        label: "Postal Code",
                                        variant: "outlined",
                                        density: "comfortable",
                                        "prepend-inner-icon": "mdi-mailbox"
                                      }, null, 8, ["modelValue", "onUpdate:modelValue"])
                                    ]),
                                    _: 1
                                  }),
                                  createVNode(VCol, {
                                    cols: "12",
                                    sm: "6"
                                  }, {
                                    default: withCtx(() => [
                                      createVNode(VTextField, {
                                        modelValue: unref(form).country,
                                        "onUpdate:modelValue": ($event) => unref(form).country = $event,
                                        label: "Country",
                                        variant: "outlined",
                                        density: "comfortable",
                                        "prepend-inner-icon": "mdi-flag-outline"
                                      }, null, 8, ["modelValue", "onUpdate:modelValue"])
                                    ]),
                                    _: 1
                                  })
                                ]),
                                _: 1
                              }),
                              createVNode(VTextarea, {
                                modelValue: unref(form).notes,
                                "onUpdate:modelValue": ($event) => unref(form).notes = $event,
                                label: "Notes",
                                variant: "outlined",
                                density: "comfortable",
                                rows: "2",
                                placeholder: "Internal notes about this customer...",
                                "prepend-inner-icon": "mdi-note-edit-outline",
                                class: "mt-2"
                              }, null, 8, ["modelValue", "onUpdate:modelValue"])
                            ]),
                            _: 1
                          }),
                          createVNode(VWindowItem, { value: "loyalty" }, {
                            default: withCtx(() => [
                              createVNode("div", { class: "step-title" }, "Loyalty and Credit"),
                              createVNode("div", { class: "step-subtitle" }, "Manage loyalty tier, credit limit, and tax settings."),
                              createVNode("div", { class: "settings-card" }, [
                                createVNode("div", { class: "settings-card-label" }, "Loyalty Program"),
                                createVNode(VRow, {
                                  dense: "",
                                  class: "mt-1"
                                }, {
                                  default: withCtx(() => [
                                    createVNode(VCol, {
                                      cols: "12",
                                      sm: "6"
                                    }, {
                                      default: withCtx(() => [
                                        createVNode(VSelect, {
                                          modelValue: unref(form).loyalty_tier,
                                          "onUpdate:modelValue": ($event) => unref(form).loyalty_tier = $event,
                                          items: tierItems,
                                          "item-title": "label",
                                          "item-value": "value",
                                          label: "Loyalty Tier",
                                          variant: "outlined",
                                          density: "comfortable",
                                          "prepend-inner-icon": "mdi-medal"
                                        }, null, 8, ["modelValue", "onUpdate:modelValue"])
                                      ]),
                                      _: 1
                                    }),
                                    createVNode(VCol, {
                                      cols: "12",
                                      sm: "6"
                                    }, {
                                      default: withCtx(() => [
                                        createVNode(VTextField, {
                                          modelValue: unref(form).loyalty_member_since,
                                          "onUpdate:modelValue": ($event) => unref(form).loyalty_member_since = $event,
                                          type: "date",
                                          label: "Member Since",
                                          variant: "outlined",
                                          density: "comfortable",
                                          "prepend-inner-icon": "mdi-calendar-star"
                                        }, null, 8, ["modelValue", "onUpdate:modelValue"])
                                      ]),
                                      _: 1
                                    })
                                  ]),
                                  _: 1
                                })
                              ]),
                              createVNode("div", { class: "settings-card" }, [
                                createVNode("div", { class: "settings-card-label" }, "Credit and Tax"),
                                createVNode(VRow, {
                                  dense: "",
                                  class: "mt-1"
                                }, {
                                  default: withCtx(() => [
                                    createVNode(VCol, {
                                      cols: "12",
                                      sm: "6"
                                    }, {
                                      default: withCtx(() => [
                                        createVNode(VTextField, {
                                          modelValue: unref(form).credit_limit,
                                          "onUpdate:modelValue": ($event) => unref(form).credit_limit = $event,
                                          label: `Credit Limit (${unref(symbol)})`,
                                          variant: "outlined",
                                          density: "comfortable",
                                          type: "number",
                                          step: "0.01",
                                          min: "0",
                                          "error-messages": unref(errors).credit_limit,
                                          "prepend-inner-icon": "mdi-credit-card-clock-outline"
                                        }, null, 8, ["modelValue", "onUpdate:modelValue", "label", "error-messages"])
                                      ]),
                                      _: 1
                                    }),
                                    createVNode(VCol, {
                                      cols: "12",
                                      sm: "6"
                                    }, {
                                      default: withCtx(() => [
                                        createVNode(VSelect, {
                                          modelValue: unref(form).preferred_branch,
                                          "onUpdate:modelValue": ($event) => unref(form).preferred_branch = $event,
                                          items: __props.branches,
                                          "item-title": "name",
                                          "item-value": "id",
                                          label: "Preferred Branch",
                                          variant: "outlined",
                                          density: "comfortable",
                                          clearable: "",
                                          "prepend-inner-icon": "mdi-store-outline"
                                        }, null, 8, ["modelValue", "onUpdate:modelValue", "items"])
                                      ]),
                                      _: 1
                                    })
                                  ]),
                                  _: 1
                                }),
                                createVNode(VTextField, {
                                  modelValue: unref(form).tax_id,
                                  "onUpdate:modelValue": ($event) => unref(form).tax_id = $event,
                                  label: "Tax ID",
                                  variant: "outlined",
                                  density: "comfortable",
                                  "prepend-inner-icon": "mdi-file-document-outline",
                                  class: "mt-2"
                                }, null, 8, ["modelValue", "onUpdate:modelValue"])
                              ]),
                              createVNode("div", { class: "status-toggles" }, [
                                createVNode("div", { class: "status-toggles-label" }, "Customer Status"),
                                createVNode("div", { class: "toggle-grid" }, [
                                  createVNode("div", {
                                    class: ["toggle-item", { active: unref(form).tax_exempt }]
                                  }, [
                                    createVNode(VSwitch, {
                                      modelValue: unref(form).tax_exempt,
                                      "onUpdate:modelValue": ($event) => unref(form).tax_exempt = $event,
                                      color: "primary",
                                      density: "compact",
                                      "hide-details": "",
                                      inset: ""
                                    }, null, 8, ["modelValue", "onUpdate:modelValue"]),
                                    createVNode("div", { class: "toggle-text" }, [
                                      createVNode("div", { class: "toggle-title" }, "Tax Exempt"),
                                      createVNode("div", { class: "toggle-desc" }, "Customer is exempt from sales tax")
                                    ])
                                  ], 2),
                                  createVNode("div", {
                                    class: ["toggle-item", { active: unref(form).is_active }]
                                  }, [
                                    createVNode(VSwitch, {
                                      modelValue: unref(form).is_active,
                                      "onUpdate:modelValue": ($event) => unref(form).is_active = $event,
                                      color: "primary",
                                      density: "compact",
                                      "hide-details": "",
                                      inset: ""
                                    }, null, 8, ["modelValue", "onUpdate:modelValue"]),
                                    createVNode("div", { class: "toggle-text" }, [
                                      createVNode("div", { class: "toggle-title" }, "Active"),
                                      createVNode("div", { class: "toggle-desc" }, "Customer can make purchases")
                                    ])
                                  ], 2)
                                ])
                              ])
                            ]),
                            _: 1
                          })
                        ]),
                        _: 1
                      }, 8, ["modelValue", "onUpdate:modelValue"])
                    ])
                  ]),
                  createVNode(VDivider),
                  createVNode("div", { class: "modal-footer" }, [
                    createVNode("div", { class: "d-flex align-center ga-2 text-body-2 text-medium-emphasis" }, [
                      createVNode(VIcon, {
                        size: "16",
                        icon: unref(activeTab) === "profile" ? "mdi-account-details" : unref(activeTab) === "address" ? "mdi-map-marker" : "mdi-medal"
                      }, null, 8, ["icon"]),
                      createTextVNode(" Step " + toDisplayString(unref(currentStepIndex) + 1) + " of " + toDisplayString(stepList.length) + " — " + toDisplayString(stepList[unref(currentStepIndex)].label), 1)
                    ]),
                    createVNode("div", { class: "d-flex ga-2" }, [
                      createVNode(VBtn, {
                        variant: "text",
                        onClick: ($event) => _ctx.$emit("close")
                      }, {
                        default: withCtx(() => [
                          createTextVNode("Cancel")
                        ]),
                        _: 1
                      }, 8, ["onClick"]),
                      unref(currentStepIndex) < stepList.length - 1 ? (openBlock(), createBlock(VBtn, {
                        key: 0,
                        variant: "outlined",
                        onClick: nextStep
                      }, {
                        default: withCtx(() => [
                          createTextVNode(" Next "),
                          createVNode(VIcon, { end: "" }, {
                            default: withCtx(() => [
                              createTextVNode("mdi-chevron-right")
                            ]),
                            _: 1
                          })
                        ]),
                        _: 1
                      })) : createCommentVNode("", true),
                      createVNode(VBtn, {
                        color: "deep-purple",
                        loading: unref(saving),
                        onClick: save
                      }, {
                        default: withCtx(() => [
                          createVNode(VIcon, {
                            start: "",
                            size: "18"
                          }, {
                            default: withCtx(() => [
                              createTextVNode(toDisplayString(unref(isEdit) ? "mdi-content-save" : "mdi-check"), 1)
                            ]),
                            _: 1
                          }),
                          createTextVNode(" " + toDisplayString(unref(isEdit) ? "Update" : "Create"), 1)
                        ]),
                        _: 1
                      }, 8, ["loading"])
                    ])
                  ])
                ]),
                _: 1
              })
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
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/customers/CustomerModal.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const __nuxt_component_1 = /* @__PURE__ */ Object.assign(_export_sfc(_sfc_main, [["__scopeId", "data-v-824d6d4a"]]), { __name: "CustomersCustomerModal" });

export { __nuxt_component_1 as _ };
//# sourceMappingURL=CustomerModal-D4hlLXwa.mjs.map
