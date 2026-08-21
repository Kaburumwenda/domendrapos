import { ref, reactive, computed, mergeProps, withCtx, createTextVNode, createVNode, unref, toDisplayString, openBlock, createBlock, createCommentVNode, withModifiers, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent, ssrInterpolate, ssrRenderClass, ssrRenderAttr, ssrRenderStyle } from 'vue/server-renderer';
import { M as useToast, k as VCard, y as VCardTitle, z as VCardText, Q as VAvatar, d as VIcon, S as VSelect, h as VAlert, C as VTextField, g as VBtn, i as VRow, j as VCol, p as VDivider, T as VColorPicker, b as useRuntimeConfig } from './server.mjs';
import { u as useAuthStore } from './auth-s-b-v9EY.mjs';
import { u as useApi } from './useApi-9yTPzSUF.mjs';
import { _ as _export_sfc } from './_plugin-vue_export-helper-1tPrXgE0.mjs';
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
import 'pinia';
import 'vue-router';
import '@vue/shared';
import 'vue3-apexcharts';

const _sfc_main = {
  __name: "settings",
  __ssrInlineRender: true,
  setup(__props) {
    const auth = useAuthStore();
    const toast = useToast();
    const config = useRuntimeConfig();
    const saving = ref(false);
    const uploadingLogo = ref(false);
    const logoUrl = ref("");
    const logoError = ref("");
    const isDragging = ref(false);
    const fileInput = ref(null);
    const selectedFile = ref(null);
    const currencyChoices = ref([
      { code: "KES", label: "Kenyan Shilling (KSh)" },
      { code: "USD", label: "US Dollar ($)" },
      { code: "EUR", label: "Euro (€)" },
      { code: "GBP", label: "British Pound (£)" },
      { code: "UGX", label: "Ugandan Shilling (USh)" },
      { code: "TZS", label: "Tanzanian Shilling (TSh)" },
      { code: "NGN", label: "Nigerian Naira (₦)" },
      { code: "INR", label: "Indian Rupee (₹)" },
      { code: "CAD", label: "Canadian Dollar (C$)" },
      { code: "AUD", label: "Australian Dollar (A$)" },
      { code: "ZAR", label: "South African Rand (R)" },
      { code: "GHS", label: "Ghanaian Cedi (₵)" }
    ]);
    const symbolMap = {
      KES: "KSh",
      USD: "$",
      EUR: "€",
      GBP: "£",
      UGX: "USh",
      TZS: "TSh",
      NGN: "₦",
      INR: "₹",
      CAD: "C$",
      AUD: "A$",
      ZAR: "R",
      GHS: "₵"
    };
    const timezones = [
      "Africa/Nairobi",
      "Africa/Kampala",
      "Africa/Dar_es_Salaam",
      "Africa/Lagos",
      "Africa/Johannesburg",
      "Africa/Accra",
      "Africa/Cairo",
      "UTC",
      "Europe/London",
      "Europe/Paris",
      "America/New_York",
      "America/Los_Angeles",
      "America/Toronto",
      "Asia/Kolkata",
      "Asia/Singapore",
      "Asia/Tokyo",
      "Asia/Dubai",
      "Australia/Sydney"
    ];
    const form = reactive({
      name: "",
      currency_code: "KES",
      currency_symbol: "KSh",
      timezone: "Africa/Nairobi",
      country: "Kenya",
      contact_email: "",
      contact_phone: "",
      address_line1: "",
      address_line2: "",
      city: "",
      state_province: "",
      postal_code: "",
      primary_color: "#1976D2"
    });
    const formatPreviewAmount = computed(() => {
      const num = 123456789e-2;
      return num.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    });
    const currentSymbol = computed(() => form.currency_symbol || symbolMap[form.currency_code] || "$");
    function onCurrencyChange() {
      form.currency_symbol = symbolMap[form.currency_code] || "$";
    }
    async function saveSettings() {
      saving.value = true;
      try {
        const data = await useApi()("/tenants/settings/", {
          method: "PATCH",
          body: {
            name: form.name,
            currency_code: form.currency_code,
            currency_symbol: form.currency_symbol,
            timezone: form.timezone,
            country: form.country,
            contact_email: form.contact_email,
            contact_phone: form.contact_phone,
            address_line1: form.address_line1,
            address_line2: form.address_line2,
            city: form.city,
            state_province: form.state_province,
            postal_code: form.postal_code,
            primary_color: form.primary_color
          }
        });
        auth.setTenant({
          name: data.name,
          currency_code: data.currency_code,
          currency_symbol: data.currency_symbol,
          timezone: data.timezone,
          primary_color: data.primary_color,
          plan: auth.tenantPlan,
          logo: data.logo || null
        });
        toast.success("Settings saved! Currency: " + data.currency_code + " (" + data.currency_symbol + ")");
      } catch (e) {
        toast.error("Failed to save settings");
      } finally {
        saving.value = false;
      }
    }
    function resetForm() {
      if (auth.tenant) {
        form.currency_code = auth.currencyCode;
        form.currency_symbol = auth.currencySymbol;
        form.timezone = auth.tenant.timezone || "Africa/Nairobi";
        form.name = auth.tenantName;
      } else {
        form.currency_code = "KES";
        form.currency_symbol = "KSh";
        form.timezone = "Africa/Nairobi";
      }
    }
    function triggerFileInput() {
      fileInput.value?.click();
    }
    function onFileSelect(e) {
      const target = e.target;
      if (target.files && target.files[0]) {
        handleFile(target.files[0]);
      }
    }
    function onDragOver() {
      isDragging.value = true;
    }
    function onDragLeave() {
      isDragging.value = false;
    }
    function onDrop(e) {
      isDragging.value = false;
      const file = e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0];
      if (file) handleFile(file);
    }
    function handleFile(file) {
      logoError.value = "";
      if (!file.type.startsWith("image/")) {
        logoError.value = "Please select an image file (PNG, JPG, or SVG)";
        return;
      }
      if (file.size > 2 * 1024 * 1024) {
        logoError.value = "File too large. Maximum 2MB allowed.";
        return;
      }
      selectedFile.value = file;
      const reader = new FileReader();
      reader.onload = (e) => {
        logoUrl.value = e.target.result;
      };
      reader.readAsDataURL(file);
      uploadLogo(file);
    }
    async function uploadLogo(file) {
      uploadingLogo.value = true;
      logoError.value = "";
      try {
        const formData = new FormData();
        formData.append("logo", file);
        const data = await useApi()("/tenants/settings/", {
          method: "PATCH",
          body: formData
        });
        if (data.logo) {
          logoUrl.value = data.logo.startsWith("http") ? data.logo : `${config.public.apiBase.replace("/api", "")}/${data.logo}`;
        }
        auth.setTenant({
          name: data.name,
          currency_code: data.currency_code,
          currency_symbol: data.currency_symbol,
          timezone: data.timezone,
          primary_color: data.primary_color,
          plan: auth.tenantPlan,
          logo: data.logo || null
        });
        toast.success("Logo uploaded successfully!");
        selectedFile.value = null;
      } catch (e) {
        logoError.value = e?.data?.logo?.[0] || "Failed to upload logo";
        toast.error("Failed to upload logo");
      } finally {
        uploadingLogo.value = false;
      }
    }
    async function removeLogo() {
      uploadingLogo.value = true;
      logoError.value = "";
      try {
        const data = await useApi()("/tenants/settings/", {
          method: "PATCH",
          body: { logo: "" }
        });
        logoUrl.value = "";
        auth.setTenant({
          name: data.name,
          currency_code: data.currency_code,
          currency_symbol: data.currency_symbol,
          timezone: data.timezone,
          primary_color: data.primary_color,
          plan: auth.tenantPlan,
          logo: null
        });
        toast.success("Logo removed");
      } catch {
        toast.error("Failed to remove logo");
      } finally {
        uploadingLogo.value = false;
      }
    }
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "d-flex flex-column ga-6" }, _attrs))} data-v-0058557e><div class="d-flex align-center justify-space-between" data-v-0058557e><h2 class="text-h6 font-weight-bold" data-v-0058557e>Settings</h2></div>`);
      _push(ssrRenderComponent(VCard, {
        rounded: "lg",
        elevation: "2"
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(ssrRenderComponent(VCardTitle, { class: "text-body-1 font-weight-bold" }, {
              default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                if (_push3) {
                  _push3(`Currency &amp; Locale`);
                } else {
                  return [
                    createTextVNode("Currency & Locale")
                  ];
                }
              }),
              _: 1
            }, _parent2, _scopeId));
            _push2(ssrRenderComponent(VCardText, null, {
              default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                if (_push3) {
                  _push3(`<p class="text-body-2 text-medium-emphasis mb-4" data-v-0058557e${_scopeId2}> Set the default currency for this tenant. All sales, reports, and receipts will be displayed in this currency. The fallback currency is USD ($). </p>`);
                  _push3(ssrRenderComponent(VCard, {
                    variant: "tonal",
                    class: "mb-4"
                  }, {
                    default: withCtx((_3, _push4, _parent4, _scopeId3) => {
                      if (_push4) {
                        _push4(ssrRenderComponent(VCardText, { class: "d-flex align-center ga-4" }, {
                          default: withCtx((_4, _push5, _parent5, _scopeId4) => {
                            if (_push5) {
                              _push5(ssrRenderComponent(VAvatar, {
                                color: "primary",
                                size: "48",
                                rounded: "lg"
                              }, {
                                default: withCtx((_5, _push6, _parent6, _scopeId5) => {
                                  if (_push6) {
                                    _push6(ssrRenderComponent(VIcon, null, {
                                      default: withCtx((_6, _push7, _parent7, _scopeId6) => {
                                        if (_push7) {
                                          _push7(`mdi-currency-usd`);
                                        } else {
                                          return [
                                            createTextVNode("mdi-currency-usd")
                                          ];
                                        }
                                      }),
                                      _: 1
                                    }, _parent6, _scopeId5));
                                  } else {
                                    return [
                                      createVNode(VIcon, null, {
                                        default: withCtx(() => [
                                          createTextVNode("mdi-currency-usd")
                                        ]),
                                        _: 1
                                      })
                                    ];
                                  }
                                }),
                                _: 1
                              }, _parent5, _scopeId4));
                              _push5(`<div class="flex-1" data-v-0058557e${_scopeId4}><p class="text-body-2 text-medium-emphasis" data-v-0058557e${_scopeId4}>Current Currency</p><p class="text-body-1 font-weight-bold" data-v-0058557e${_scopeId4}>${ssrInterpolate(unref(form).currency_code)} · ${ssrInterpolate(unref(currentSymbol))}</p></div><div class="text-right" data-v-0058557e${_scopeId4}><p class="text-body-2 text-medium-emphasis" data-v-0058557e${_scopeId4}>Preview</p><p class="text-body-1 font-weight-bold" data-v-0058557e${_scopeId4}>${ssrInterpolate(unref(currentSymbol))}${ssrInterpolate(unref(formatPreviewAmount))}</p></div>`);
                            } else {
                              return [
                                createVNode(VAvatar, {
                                  color: "primary",
                                  size: "48",
                                  rounded: "lg"
                                }, {
                                  default: withCtx(() => [
                                    createVNode(VIcon, null, {
                                      default: withCtx(() => [
                                        createTextVNode("mdi-currency-usd")
                                      ]),
                                      _: 1
                                    })
                                  ]),
                                  _: 1
                                }),
                                createVNode("div", { class: "flex-1" }, [
                                  createVNode("p", { class: "text-body-2 text-medium-emphasis" }, "Current Currency"),
                                  createVNode("p", { class: "text-body-1 font-weight-bold" }, toDisplayString(unref(form).currency_code) + " · " + toDisplayString(unref(currentSymbol)), 1)
                                ]),
                                createVNode("div", { class: "text-right" }, [
                                  createVNode("p", { class: "text-body-2 text-medium-emphasis" }, "Preview"),
                                  createVNode("p", { class: "text-body-1 font-weight-bold" }, toDisplayString(unref(currentSymbol)) + toDisplayString(unref(formatPreviewAmount)), 1)
                                ])
                              ];
                            }
                          }),
                          _: 1
                        }, _parent4, _scopeId3));
                      } else {
                        return [
                          createVNode(VCardText, { class: "d-flex align-center ga-4" }, {
                            default: withCtx(() => [
                              createVNode(VAvatar, {
                                color: "primary",
                                size: "48",
                                rounded: "lg"
                              }, {
                                default: withCtx(() => [
                                  createVNode(VIcon, null, {
                                    default: withCtx(() => [
                                      createTextVNode("mdi-currency-usd")
                                    ]),
                                    _: 1
                                  })
                                ]),
                                _: 1
                              }),
                              createVNode("div", { class: "flex-1" }, [
                                createVNode("p", { class: "text-body-2 text-medium-emphasis" }, "Current Currency"),
                                createVNode("p", { class: "text-body-1 font-weight-bold" }, toDisplayString(unref(form).currency_code) + " · " + toDisplayString(unref(currentSymbol)), 1)
                              ]),
                              createVNode("div", { class: "text-right" }, [
                                createVNode("p", { class: "text-body-2 text-medium-emphasis" }, "Preview"),
                                createVNode("p", { class: "text-body-1 font-weight-bold" }, toDisplayString(unref(currentSymbol)) + toDisplayString(unref(formatPreviewAmount)), 1)
                              ])
                            ]),
                            _: 1
                          })
                        ];
                      }
                    }),
                    _: 1
                  }, _parent3, _scopeId2));
                  _push3(ssrRenderComponent(VSelect, {
                    modelValue: unref(form).currency_code,
                    "onUpdate:modelValue": [($event) => unref(form).currency_code = $event, onCurrencyChange],
                    items: unref(currencyChoices),
                    "item-title": "label",
                    "item-value": "code",
                    label: "Currency",
                    variant: "outlined",
                    density: "comfortable"
                  }, null, _parent3, _scopeId2));
                  if (!unref(form).currency_code) {
                    _push3(ssrRenderComponent(VAlert, {
                      type: "warning",
                      variant: "text",
                      density: "compact",
                      class: "mt-1"
                    }, {
                      default: withCtx((_3, _push4, _parent4, _scopeId3) => {
                        if (_push4) {
                          _push4(` No currency selected — falling back to USD ($). `);
                        } else {
                          return [
                            createTextVNode(" No currency selected — falling back to USD ($). ")
                          ];
                        }
                      }),
                      _: 1
                    }, _parent3, _scopeId2));
                  } else {
                    _push3(`<!---->`);
                  }
                  _push3(ssrRenderComponent(VTextField, {
                    modelValue: unref(form).currency_symbol,
                    "onUpdate:modelValue": ($event) => unref(form).currency_symbol = $event,
                    label: "Currency Symbol (auto-filled, editable)",
                    variant: "outlined",
                    density: "comfortable",
                    maxlength: "5",
                    style: { "max-width": "200px" },
                    placeholder: "KSh",
                    class: "mt-4",
                    hint: "Override the symbol displayed in the UI",
                    "persistent-hint": ""
                  }, null, _parent3, _scopeId2));
                  _push3(ssrRenderComponent(VSelect, {
                    modelValue: unref(form).timezone,
                    "onUpdate:modelValue": ($event) => unref(form).timezone = $event,
                    items: timezones,
                    label: "Timezone",
                    variant: "outlined",
                    density: "comfortable",
                    class: "mt-4"
                  }, null, _parent3, _scopeId2));
                  _push3(`<div class="d-flex align-center ga-3 pt-4" data-v-0058557e${_scopeId2}>`);
                  _push3(ssrRenderComponent(VBtn, {
                    color: "primary",
                    loading: unref(saving),
                    onClick: saveSettings
                  }, {
                    default: withCtx((_3, _push4, _parent4, _scopeId3) => {
                      if (_push4) {
                        _push4(`Save Currency Settings`);
                      } else {
                        return [
                          createTextVNode("Save Currency Settings")
                        ];
                      }
                    }),
                    _: 1
                  }, _parent3, _scopeId2));
                  _push3(ssrRenderComponent(VBtn, {
                    variant: "text",
                    onClick: resetForm
                  }, {
                    default: withCtx((_3, _push4, _parent4, _scopeId3) => {
                      if (_push4) {
                        _push4(`Reset`);
                      } else {
                        return [
                          createTextVNode("Reset")
                        ];
                      }
                    }),
                    _: 1
                  }, _parent3, _scopeId2));
                  _push3(`</div>`);
                } else {
                  return [
                    createVNode("p", { class: "text-body-2 text-medium-emphasis mb-4" }, " Set the default currency for this tenant. All sales, reports, and receipts will be displayed in this currency. The fallback currency is USD ($). "),
                    createVNode(VCard, {
                      variant: "tonal",
                      class: "mb-4"
                    }, {
                      default: withCtx(() => [
                        createVNode(VCardText, { class: "d-flex align-center ga-4" }, {
                          default: withCtx(() => [
                            createVNode(VAvatar, {
                              color: "primary",
                              size: "48",
                              rounded: "lg"
                            }, {
                              default: withCtx(() => [
                                createVNode(VIcon, null, {
                                  default: withCtx(() => [
                                    createTextVNode("mdi-currency-usd")
                                  ]),
                                  _: 1
                                })
                              ]),
                              _: 1
                            }),
                            createVNode("div", { class: "flex-1" }, [
                              createVNode("p", { class: "text-body-2 text-medium-emphasis" }, "Current Currency"),
                              createVNode("p", { class: "text-body-1 font-weight-bold" }, toDisplayString(unref(form).currency_code) + " · " + toDisplayString(unref(currentSymbol)), 1)
                            ]),
                            createVNode("div", { class: "text-right" }, [
                              createVNode("p", { class: "text-body-2 text-medium-emphasis" }, "Preview"),
                              createVNode("p", { class: "text-body-1 font-weight-bold" }, toDisplayString(unref(currentSymbol)) + toDisplayString(unref(formatPreviewAmount)), 1)
                            ])
                          ]),
                          _: 1
                        })
                      ]),
                      _: 1
                    }),
                    createVNode(VSelect, {
                      modelValue: unref(form).currency_code,
                      "onUpdate:modelValue": [($event) => unref(form).currency_code = $event, onCurrencyChange],
                      items: unref(currencyChoices),
                      "item-title": "label",
                      "item-value": "code",
                      label: "Currency",
                      variant: "outlined",
                      density: "comfortable"
                    }, null, 8, ["modelValue", "onUpdate:modelValue", "items"]),
                    !unref(form).currency_code ? (openBlock(), createBlock(VAlert, {
                      key: 0,
                      type: "warning",
                      variant: "text",
                      density: "compact",
                      class: "mt-1"
                    }, {
                      default: withCtx(() => [
                        createTextVNode(" No currency selected — falling back to USD ($). ")
                      ]),
                      _: 1
                    })) : createCommentVNode("", true),
                    createVNode(VTextField, {
                      modelValue: unref(form).currency_symbol,
                      "onUpdate:modelValue": ($event) => unref(form).currency_symbol = $event,
                      label: "Currency Symbol (auto-filled, editable)",
                      variant: "outlined",
                      density: "comfortable",
                      maxlength: "5",
                      style: { "max-width": "200px" },
                      placeholder: "KSh",
                      class: "mt-4",
                      hint: "Override the symbol displayed in the UI",
                      "persistent-hint": ""
                    }, null, 8, ["modelValue", "onUpdate:modelValue"]),
                    createVNode(VSelect, {
                      modelValue: unref(form).timezone,
                      "onUpdate:modelValue": ($event) => unref(form).timezone = $event,
                      items: timezones,
                      label: "Timezone",
                      variant: "outlined",
                      density: "comfortable",
                      class: "mt-4"
                    }, null, 8, ["modelValue", "onUpdate:modelValue"]),
                    createVNode("div", { class: "d-flex align-center ga-3 pt-4" }, [
                      createVNode(VBtn, {
                        color: "primary",
                        loading: unref(saving),
                        onClick: saveSettings
                      }, {
                        default: withCtx(() => [
                          createTextVNode("Save Currency Settings")
                        ]),
                        _: 1
                      }, 8, ["loading"]),
                      createVNode(VBtn, {
                        variant: "text",
                        onClick: resetForm
                      }, {
                        default: withCtx(() => [
                          createTextVNode("Reset")
                        ]),
                        _: 1
                      })
                    ])
                  ];
                }
              }),
              _: 1
            }, _parent2, _scopeId));
          } else {
            return [
              createVNode(VCardTitle, { class: "text-body-1 font-weight-bold" }, {
                default: withCtx(() => [
                  createTextVNode("Currency & Locale")
                ]),
                _: 1
              }),
              createVNode(VCardText, null, {
                default: withCtx(() => [
                  createVNode("p", { class: "text-body-2 text-medium-emphasis mb-4" }, " Set the default currency for this tenant. All sales, reports, and receipts will be displayed in this currency. The fallback currency is USD ($). "),
                  createVNode(VCard, {
                    variant: "tonal",
                    class: "mb-4"
                  }, {
                    default: withCtx(() => [
                      createVNode(VCardText, { class: "d-flex align-center ga-4" }, {
                        default: withCtx(() => [
                          createVNode(VAvatar, {
                            color: "primary",
                            size: "48",
                            rounded: "lg"
                          }, {
                            default: withCtx(() => [
                              createVNode(VIcon, null, {
                                default: withCtx(() => [
                                  createTextVNode("mdi-currency-usd")
                                ]),
                                _: 1
                              })
                            ]),
                            _: 1
                          }),
                          createVNode("div", { class: "flex-1" }, [
                            createVNode("p", { class: "text-body-2 text-medium-emphasis" }, "Current Currency"),
                            createVNode("p", { class: "text-body-1 font-weight-bold" }, toDisplayString(unref(form).currency_code) + " · " + toDisplayString(unref(currentSymbol)), 1)
                          ]),
                          createVNode("div", { class: "text-right" }, [
                            createVNode("p", { class: "text-body-2 text-medium-emphasis" }, "Preview"),
                            createVNode("p", { class: "text-body-1 font-weight-bold" }, toDisplayString(unref(currentSymbol)) + toDisplayString(unref(formatPreviewAmount)), 1)
                          ])
                        ]),
                        _: 1
                      })
                    ]),
                    _: 1
                  }),
                  createVNode(VSelect, {
                    modelValue: unref(form).currency_code,
                    "onUpdate:modelValue": [($event) => unref(form).currency_code = $event, onCurrencyChange],
                    items: unref(currencyChoices),
                    "item-title": "label",
                    "item-value": "code",
                    label: "Currency",
                    variant: "outlined",
                    density: "comfortable"
                  }, null, 8, ["modelValue", "onUpdate:modelValue", "items"]),
                  !unref(form).currency_code ? (openBlock(), createBlock(VAlert, {
                    key: 0,
                    type: "warning",
                    variant: "text",
                    density: "compact",
                    class: "mt-1"
                  }, {
                    default: withCtx(() => [
                      createTextVNode(" No currency selected — falling back to USD ($). ")
                    ]),
                    _: 1
                  })) : createCommentVNode("", true),
                  createVNode(VTextField, {
                    modelValue: unref(form).currency_symbol,
                    "onUpdate:modelValue": ($event) => unref(form).currency_symbol = $event,
                    label: "Currency Symbol (auto-filled, editable)",
                    variant: "outlined",
                    density: "comfortable",
                    maxlength: "5",
                    style: { "max-width": "200px" },
                    placeholder: "KSh",
                    class: "mt-4",
                    hint: "Override the symbol displayed in the UI",
                    "persistent-hint": ""
                  }, null, 8, ["modelValue", "onUpdate:modelValue"]),
                  createVNode(VSelect, {
                    modelValue: unref(form).timezone,
                    "onUpdate:modelValue": ($event) => unref(form).timezone = $event,
                    items: timezones,
                    label: "Timezone",
                    variant: "outlined",
                    density: "comfortable",
                    class: "mt-4"
                  }, null, 8, ["modelValue", "onUpdate:modelValue"]),
                  createVNode("div", { class: "d-flex align-center ga-3 pt-4" }, [
                    createVNode(VBtn, {
                      color: "primary",
                      loading: unref(saving),
                      onClick: saveSettings
                    }, {
                      default: withCtx(() => [
                        createTextVNode("Save Currency Settings")
                      ]),
                      _: 1
                    }, 8, ["loading"]),
                    createVNode(VBtn, {
                      variant: "text",
                      onClick: resetForm
                    }, {
                      default: withCtx(() => [
                        createTextVNode("Reset")
                      ]),
                      _: 1
                    })
                  ])
                ]),
                _: 1
              })
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(ssrRenderComponent(VCard, {
        rounded: "lg",
        elevation: "2"
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(ssrRenderComponent(VCardTitle, { class: "text-body-1 font-weight-bold" }, {
              default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                if (_push3) {
                  _push3(`Business Information`);
                } else {
                  return [
                    createTextVNode("Business Information")
                  ];
                }
              }),
              _: 1
            }, _parent2, _scopeId));
            _push2(ssrRenderComponent(VCardText, null, {
              default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                if (_push3) {
                  _push3(`<p class="text-body-2 text-medium-emphasis mb-4" data-v-0058557e${_scopeId2}>Update your business contact details.</p>`);
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
                                modelValue: unref(form).name,
                                "onUpdate:modelValue": ($event) => unref(form).name = $event,
                                label: "Business Name",
                                variant: "outlined",
                                density: "comfortable"
                              }, null, _parent5, _scopeId4));
                            } else {
                              return [
                                createVNode(VTextField, {
                                  modelValue: unref(form).name,
                                  "onUpdate:modelValue": ($event) => unref(form).name = $event,
                                  label: "Business Name",
                                  variant: "outlined",
                                  density: "comfortable"
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
                              _push5(ssrRenderComponent(VTextField, {
                                modelValue: unref(form).country,
                                "onUpdate:modelValue": ($event) => unref(form).country = $event,
                                label: "Country",
                                variant: "outlined",
                                density: "comfortable"
                              }, null, _parent5, _scopeId4));
                            } else {
                              return [
                                createVNode(VTextField, {
                                  modelValue: unref(form).country,
                                  "onUpdate:modelValue": ($event) => unref(form).country = $event,
                                  label: "Country",
                                  variant: "outlined",
                                  density: "comfortable"
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
                              _push5(ssrRenderComponent(VTextField, {
                                modelValue: unref(form).contact_email,
                                "onUpdate:modelValue": ($event) => unref(form).contact_email = $event,
                                label: "Contact Email",
                                variant: "outlined",
                                density: "comfortable",
                                type: "email"
                              }, null, _parent5, _scopeId4));
                            } else {
                              return [
                                createVNode(VTextField, {
                                  modelValue: unref(form).contact_email,
                                  "onUpdate:modelValue": ($event) => unref(form).contact_email = $event,
                                  label: "Contact Email",
                                  variant: "outlined",
                                  density: "comfortable",
                                  type: "email"
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
                              _push5(ssrRenderComponent(VTextField, {
                                modelValue: unref(form).contact_phone,
                                "onUpdate:modelValue": ($event) => unref(form).contact_phone = $event,
                                label: "Contact Phone",
                                variant: "outlined",
                                density: "comfortable"
                              }, null, _parent5, _scopeId4));
                            } else {
                              return [
                                createVNode(VTextField, {
                                  modelValue: unref(form).contact_phone,
                                  "onUpdate:modelValue": ($event) => unref(form).contact_phone = $event,
                                  label: "Contact Phone",
                                  variant: "outlined",
                                  density: "comfortable"
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
                                modelValue: unref(form).name,
                                "onUpdate:modelValue": ($event) => unref(form).name = $event,
                                label: "Business Name",
                                variant: "outlined",
                                density: "comfortable"
                              }, null, 8, ["modelValue", "onUpdate:modelValue"])
                            ]),
                            _: 1
                          }),
                          createVNode(VCol, {
                            cols: "12",
                            md: "6"
                          }, {
                            default: withCtx(() => [
                              createVNode(VTextField, {
                                modelValue: unref(form).country,
                                "onUpdate:modelValue": ($event) => unref(form).country = $event,
                                label: "Country",
                                variant: "outlined",
                                density: "comfortable"
                              }, null, 8, ["modelValue", "onUpdate:modelValue"])
                            ]),
                            _: 1
                          }),
                          createVNode(VCol, {
                            cols: "12",
                            md: "6"
                          }, {
                            default: withCtx(() => [
                              createVNode(VTextField, {
                                modelValue: unref(form).contact_email,
                                "onUpdate:modelValue": ($event) => unref(form).contact_email = $event,
                                label: "Contact Email",
                                variant: "outlined",
                                density: "comfortable",
                                type: "email"
                              }, null, 8, ["modelValue", "onUpdate:modelValue"])
                            ]),
                            _: 1
                          }),
                          createVNode(VCol, {
                            cols: "12",
                            md: "6"
                          }, {
                            default: withCtx(() => [
                              createVNode(VTextField, {
                                modelValue: unref(form).contact_phone,
                                "onUpdate:modelValue": ($event) => unref(form).contact_phone = $event,
                                label: "Contact Phone",
                                variant: "outlined",
                                density: "comfortable"
                              }, null, 8, ["modelValue", "onUpdate:modelValue"])
                            ]),
                            _: 1
                          })
                        ];
                      }
                    }),
                    _: 1
                  }, _parent3, _scopeId2));
                  _push3(`<div class="d-flex align-center ga-3 pt-2" data-v-0058557e${_scopeId2}>`);
                  _push3(ssrRenderComponent(VBtn, {
                    color: "primary",
                    loading: unref(saving),
                    onClick: saveSettings
                  }, {
                    default: withCtx((_3, _push4, _parent4, _scopeId3) => {
                      if (_push4) {
                        _push4(`Save Business Info`);
                      } else {
                        return [
                          createTextVNode("Save Business Info")
                        ];
                      }
                    }),
                    _: 1
                  }, _parent3, _scopeId2));
                  _push3(`</div>`);
                } else {
                  return [
                    createVNode("p", { class: "text-body-2 text-medium-emphasis mb-4" }, "Update your business contact details."),
                    createVNode(VRow, null, {
                      default: withCtx(() => [
                        createVNode(VCol, {
                          cols: "12",
                          md: "6"
                        }, {
                          default: withCtx(() => [
                            createVNode(VTextField, {
                              modelValue: unref(form).name,
                              "onUpdate:modelValue": ($event) => unref(form).name = $event,
                              label: "Business Name",
                              variant: "outlined",
                              density: "comfortable"
                            }, null, 8, ["modelValue", "onUpdate:modelValue"])
                          ]),
                          _: 1
                        }),
                        createVNode(VCol, {
                          cols: "12",
                          md: "6"
                        }, {
                          default: withCtx(() => [
                            createVNode(VTextField, {
                              modelValue: unref(form).country,
                              "onUpdate:modelValue": ($event) => unref(form).country = $event,
                              label: "Country",
                              variant: "outlined",
                              density: "comfortable"
                            }, null, 8, ["modelValue", "onUpdate:modelValue"])
                          ]),
                          _: 1
                        }),
                        createVNode(VCol, {
                          cols: "12",
                          md: "6"
                        }, {
                          default: withCtx(() => [
                            createVNode(VTextField, {
                              modelValue: unref(form).contact_email,
                              "onUpdate:modelValue": ($event) => unref(form).contact_email = $event,
                              label: "Contact Email",
                              variant: "outlined",
                              density: "comfortable",
                              type: "email"
                            }, null, 8, ["modelValue", "onUpdate:modelValue"])
                          ]),
                          _: 1
                        }),
                        createVNode(VCol, {
                          cols: "12",
                          md: "6"
                        }, {
                          default: withCtx(() => [
                            createVNode(VTextField, {
                              modelValue: unref(form).contact_phone,
                              "onUpdate:modelValue": ($event) => unref(form).contact_phone = $event,
                              label: "Contact Phone",
                              variant: "outlined",
                              density: "comfortable"
                            }, null, 8, ["modelValue", "onUpdate:modelValue"])
                          ]),
                          _: 1
                        })
                      ]),
                      _: 1
                    }),
                    createVNode("div", { class: "d-flex align-center ga-3 pt-2" }, [
                      createVNode(VBtn, {
                        color: "primary",
                        loading: unref(saving),
                        onClick: saveSettings
                      }, {
                        default: withCtx(() => [
                          createTextVNode("Save Business Info")
                        ]),
                        _: 1
                      }, 8, ["loading"])
                    ])
                  ];
                }
              }),
              _: 1
            }, _parent2, _scopeId));
          } else {
            return [
              createVNode(VCardTitle, { class: "text-body-1 font-weight-bold" }, {
                default: withCtx(() => [
                  createTextVNode("Business Information")
                ]),
                _: 1
              }),
              createVNode(VCardText, null, {
                default: withCtx(() => [
                  createVNode("p", { class: "text-body-2 text-medium-emphasis mb-4" }, "Update your business contact details."),
                  createVNode(VRow, null, {
                    default: withCtx(() => [
                      createVNode(VCol, {
                        cols: "12",
                        md: "6"
                      }, {
                        default: withCtx(() => [
                          createVNode(VTextField, {
                            modelValue: unref(form).name,
                            "onUpdate:modelValue": ($event) => unref(form).name = $event,
                            label: "Business Name",
                            variant: "outlined",
                            density: "comfortable"
                          }, null, 8, ["modelValue", "onUpdate:modelValue"])
                        ]),
                        _: 1
                      }),
                      createVNode(VCol, {
                        cols: "12",
                        md: "6"
                      }, {
                        default: withCtx(() => [
                          createVNode(VTextField, {
                            modelValue: unref(form).country,
                            "onUpdate:modelValue": ($event) => unref(form).country = $event,
                            label: "Country",
                            variant: "outlined",
                            density: "comfortable"
                          }, null, 8, ["modelValue", "onUpdate:modelValue"])
                        ]),
                        _: 1
                      }),
                      createVNode(VCol, {
                        cols: "12",
                        md: "6"
                      }, {
                        default: withCtx(() => [
                          createVNode(VTextField, {
                            modelValue: unref(form).contact_email,
                            "onUpdate:modelValue": ($event) => unref(form).contact_email = $event,
                            label: "Contact Email",
                            variant: "outlined",
                            density: "comfortable",
                            type: "email"
                          }, null, 8, ["modelValue", "onUpdate:modelValue"])
                        ]),
                        _: 1
                      }),
                      createVNode(VCol, {
                        cols: "12",
                        md: "6"
                      }, {
                        default: withCtx(() => [
                          createVNode(VTextField, {
                            modelValue: unref(form).contact_phone,
                            "onUpdate:modelValue": ($event) => unref(form).contact_phone = $event,
                            label: "Contact Phone",
                            variant: "outlined",
                            density: "comfortable"
                          }, null, 8, ["modelValue", "onUpdate:modelValue"])
                        ]),
                        _: 1
                      })
                    ]),
                    _: 1
                  }),
                  createVNode("div", { class: "d-flex align-center ga-3 pt-2" }, [
                    createVNode(VBtn, {
                      color: "primary",
                      loading: unref(saving),
                      onClick: saveSettings
                    }, {
                      default: withCtx(() => [
                        createTextVNode("Save Business Info")
                      ]),
                      _: 1
                    }, 8, ["loading"])
                  ])
                ]),
                _: 1
              })
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(ssrRenderComponent(VCard, {
        rounded: "lg",
        elevation: "2"
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(ssrRenderComponent(VCardTitle, { class: "text-body-1 font-weight-bold" }, {
              default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                if (_push3) {
                  _push3(`Logo &amp; Branding`);
                } else {
                  return [
                    createTextVNode("Logo & Branding")
                  ];
                }
              }),
              _: 1
            }, _parent2, _scopeId));
            _push2(ssrRenderComponent(VCardText, null, {
              default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                if (_push3) {
                  _push3(`<p class="text-body-2 text-medium-emphasis mb-4" data-v-0058557e${_scopeId2}>Upload your business logo and customize brand colors. The logo appears on receipts, the sidebar, and the POS interface.</p><div class="logo-section" data-v-0058557e${_scopeId2}><div class="logo-preview-wrap" data-v-0058557e${_scopeId2}><div class="${ssrRenderClass([{ "logo-preview--drag": unref(isDragging) }, "logo-preview"])}" data-v-0058557e${_scopeId2}>`);
                  if (unref(logoUrl)) {
                    _push3(`<img${ssrRenderAttr("src", unref(logoUrl))} alt="Logo" class="logo-preview__img" data-v-0058557e${_scopeId2}>`);
                  } else {
                    _push3(`<div class="logo-preview__placeholder" data-v-0058557e${_scopeId2}>`);
                    _push3(ssrRenderComponent(VIcon, {
                      size: "36",
                      class: "logo-preview__placeholder-icon"
                    }, {
                      default: withCtx((_3, _push4, _parent4, _scopeId3) => {
                        if (_push4) {
                          _push4(`mdi-image-outline`);
                        } else {
                          return [
                            createTextVNode("mdi-image-outline")
                          ];
                        }
                      }),
                      _: 1
                    }, _parent3, _scopeId2));
                    _push3(`<p class="logo-preview__placeholder-text" data-v-0058557e${_scopeId2}>Click or drag to upload</p><p class="logo-preview__placeholder-hint" data-v-0058557e${_scopeId2}>PNG, JPG, SVG up to 2MB</p></div>`);
                  }
                  _push3(`</div></div><div class="logo-actions" data-v-0058557e${_scopeId2}><input type="file" accept="image/png,image/jpeg,image/svg+xml" style="${ssrRenderStyle({ "display": "none" })}" data-v-0058557e${_scopeId2}>`);
                  _push3(ssrRenderComponent(VBtn, {
                    variant: "outlined",
                    density: "comfortable",
                    "prepend-icon": "mdi-upload",
                    onClick: triggerFileInput,
                    loading: unref(uploadingLogo)
                  }, {
                    default: withCtx((_3, _push4, _parent4, _scopeId3) => {
                      if (_push4) {
                        _push4(`${ssrInterpolate(unref(logoUrl) ? "Change Logo" : "Upload Logo")}`);
                      } else {
                        return [
                          createTextVNode(toDisplayString(unref(logoUrl) ? "Change Logo" : "Upload Logo"), 1)
                        ];
                      }
                    }),
                    _: 1
                  }, _parent3, _scopeId2));
                  if (unref(logoUrl)) {
                    _push3(ssrRenderComponent(VBtn, {
                      variant: "text",
                      density: "comfortable",
                      "prepend-icon": "mdi-delete-outline",
                      color: "error",
                      onClick: removeLogo,
                      loading: unref(uploadingLogo)
                    }, {
                      default: withCtx((_3, _push4, _parent4, _scopeId3) => {
                        if (_push4) {
                          _push4(` Remove `);
                        } else {
                          return [
                            createTextVNode(" Remove ")
                          ];
                        }
                      }),
                      _: 1
                    }, _parent3, _scopeId2));
                  } else {
                    _push3(`<!---->`);
                  }
                  if (unref(logoError)) {
                    _push3(ssrRenderComponent(VAlert, {
                      type: "error",
                      variant: "text",
                      density: "compact",
                      class: "mt-2"
                    }, {
                      default: withCtx((_3, _push4, _parent4, _scopeId3) => {
                        if (_push4) {
                          _push4(`${ssrInterpolate(unref(logoError))}`);
                        } else {
                          return [
                            createTextVNode(toDisplayString(unref(logoError)), 1)
                          ];
                        }
                      }),
                      _: 1
                    }, _parent3, _scopeId2));
                  } else {
                    _push3(`<!---->`);
                  }
                  _push3(`</div></div>`);
                  _push3(ssrRenderComponent(VDivider, { class: "my-5" }, null, _parent3, _scopeId2));
                  _push3(`<p class="text-body-2 font-weight-medium mb-2" data-v-0058557e${_scopeId2}>Primary Color</p><div class="d-flex align-center ga-3" data-v-0058557e${_scopeId2}>`);
                  _push3(ssrRenderComponent(VColorPicker, {
                    modelValue: unref(form).primary_color,
                    "onUpdate:modelValue": ($event) => unref(form).primary_color = $event,
                    mode: "hex",
                    "hide-inputs": "",
                    width: "120"
                  }, null, _parent3, _scopeId2));
                  _push3(ssrRenderComponent(VTextField, {
                    modelValue: unref(form).primary_color,
                    "onUpdate:modelValue": ($event) => unref(form).primary_color = $event,
                    label: "Primary Color",
                    variant: "outlined",
                    density: "comfortable",
                    style: { "max-width": "200px" },
                    placeholder: "#1976D2"
                  }, null, _parent3, _scopeId2));
                  _push3(ssrRenderComponent(VCard, {
                    rounded: "lg",
                    style: { backgroundColor: unref(form).primary_color },
                    class: "px-4 py-2"
                  }, {
                    default: withCtx((_3, _push4, _parent4, _scopeId3) => {
                      if (_push4) {
                        _push4(`<span class="text-white text-body-2 font-weight-medium" data-v-0058557e${_scopeId3}>Preview</span>`);
                      } else {
                        return [
                          createVNode("span", { class: "text-white text-body-2 font-weight-medium" }, "Preview")
                        ];
                      }
                    }),
                    _: 1
                  }, _parent3, _scopeId2));
                  _push3(`</div><div class="d-flex align-center ga-3 pt-4" data-v-0058557e${_scopeId2}>`);
                  _push3(ssrRenderComponent(VBtn, {
                    color: "primary",
                    loading: unref(saving),
                    onClick: saveSettings
                  }, {
                    default: withCtx((_3, _push4, _parent4, _scopeId3) => {
                      if (_push4) {
                        _push4(`Save Branding`);
                      } else {
                        return [
                          createTextVNode("Save Branding")
                        ];
                      }
                    }),
                    _: 1
                  }, _parent3, _scopeId2));
                  _push3(`</div>`);
                } else {
                  return [
                    createVNode("p", { class: "text-body-2 text-medium-emphasis mb-4" }, "Upload your business logo and customize brand colors. The logo appears on receipts, the sidebar, and the POS interface."),
                    createVNode("div", { class: "logo-section" }, [
                      createVNode("div", { class: "logo-preview-wrap" }, [
                        createVNode("div", {
                          class: ["logo-preview", { "logo-preview--drag": unref(isDragging) }],
                          onClick: triggerFileInput,
                          onDragover: withModifiers(onDragOver, ["prevent"]),
                          onDragleave: withModifiers(onDragLeave, ["prevent"]),
                          onDrop: withModifiers(onDrop, ["prevent"])
                        }, [
                          unref(logoUrl) ? (openBlock(), createBlock("img", {
                            key: 0,
                            src: unref(logoUrl),
                            alt: "Logo",
                            class: "logo-preview__img"
                          }, null, 8, ["src"])) : (openBlock(), createBlock("div", {
                            key: 1,
                            class: "logo-preview__placeholder"
                          }, [
                            createVNode(VIcon, {
                              size: "36",
                              class: "logo-preview__placeholder-icon"
                            }, {
                              default: withCtx(() => [
                                createTextVNode("mdi-image-outline")
                              ]),
                              _: 1
                            }),
                            createVNode("p", { class: "logo-preview__placeholder-text" }, "Click or drag to upload"),
                            createVNode("p", { class: "logo-preview__placeholder-hint" }, "PNG, JPG, SVG up to 2MB")
                          ]))
                        ], 34)
                      ]),
                      createVNode("div", { class: "logo-actions" }, [
                        createVNode("input", {
                          ref_key: "fileInput",
                          ref: fileInput,
                          type: "file",
                          accept: "image/png,image/jpeg,image/svg+xml",
                          style: { "display": "none" },
                          onChange: onFileSelect
                        }, null, 544),
                        createVNode(VBtn, {
                          variant: "outlined",
                          density: "comfortable",
                          "prepend-icon": "mdi-upload",
                          onClick: triggerFileInput,
                          loading: unref(uploadingLogo)
                        }, {
                          default: withCtx(() => [
                            createTextVNode(toDisplayString(unref(logoUrl) ? "Change Logo" : "Upload Logo"), 1)
                          ]),
                          _: 1
                        }, 8, ["loading"]),
                        unref(logoUrl) ? (openBlock(), createBlock(VBtn, {
                          key: 0,
                          variant: "text",
                          density: "comfortable",
                          "prepend-icon": "mdi-delete-outline",
                          color: "error",
                          onClick: removeLogo,
                          loading: unref(uploadingLogo)
                        }, {
                          default: withCtx(() => [
                            createTextVNode(" Remove ")
                          ]),
                          _: 1
                        }, 8, ["loading"])) : createCommentVNode("", true),
                        unref(logoError) ? (openBlock(), createBlock(VAlert, {
                          key: 1,
                          type: "error",
                          variant: "text",
                          density: "compact",
                          class: "mt-2"
                        }, {
                          default: withCtx(() => [
                            createTextVNode(toDisplayString(unref(logoError)), 1)
                          ]),
                          _: 1
                        })) : createCommentVNode("", true)
                      ])
                    ]),
                    createVNode(VDivider, { class: "my-5" }),
                    createVNode("p", { class: "text-body-2 font-weight-medium mb-2" }, "Primary Color"),
                    createVNode("div", { class: "d-flex align-center ga-3" }, [
                      createVNode(VColorPicker, {
                        modelValue: unref(form).primary_color,
                        "onUpdate:modelValue": ($event) => unref(form).primary_color = $event,
                        mode: "hex",
                        "hide-inputs": "",
                        width: "120"
                      }, null, 8, ["modelValue", "onUpdate:modelValue"]),
                      createVNode(VTextField, {
                        modelValue: unref(form).primary_color,
                        "onUpdate:modelValue": ($event) => unref(form).primary_color = $event,
                        label: "Primary Color",
                        variant: "outlined",
                        density: "comfortable",
                        style: { "max-width": "200px" },
                        placeholder: "#1976D2"
                      }, null, 8, ["modelValue", "onUpdate:modelValue"]),
                      createVNode(VCard, {
                        rounded: "lg",
                        style: { backgroundColor: unref(form).primary_color },
                        class: "px-4 py-2"
                      }, {
                        default: withCtx(() => [
                          createVNode("span", { class: "text-white text-body-2 font-weight-medium" }, "Preview")
                        ]),
                        _: 1
                      }, 8, ["style"])
                    ]),
                    createVNode("div", { class: "d-flex align-center ga-3 pt-4" }, [
                      createVNode(VBtn, {
                        color: "primary",
                        loading: unref(saving),
                        onClick: saveSettings
                      }, {
                        default: withCtx(() => [
                          createTextVNode("Save Branding")
                        ]),
                        _: 1
                      }, 8, ["loading"])
                    ])
                  ];
                }
              }),
              _: 1
            }, _parent2, _scopeId));
          } else {
            return [
              createVNode(VCardTitle, { class: "text-body-1 font-weight-bold" }, {
                default: withCtx(() => [
                  createTextVNode("Logo & Branding")
                ]),
                _: 1
              }),
              createVNode(VCardText, null, {
                default: withCtx(() => [
                  createVNode("p", { class: "text-body-2 text-medium-emphasis mb-4" }, "Upload your business logo and customize brand colors. The logo appears on receipts, the sidebar, and the POS interface."),
                  createVNode("div", { class: "logo-section" }, [
                    createVNode("div", { class: "logo-preview-wrap" }, [
                      createVNode("div", {
                        class: ["logo-preview", { "logo-preview--drag": unref(isDragging) }],
                        onClick: triggerFileInput,
                        onDragover: withModifiers(onDragOver, ["prevent"]),
                        onDragleave: withModifiers(onDragLeave, ["prevent"]),
                        onDrop: withModifiers(onDrop, ["prevent"])
                      }, [
                        unref(logoUrl) ? (openBlock(), createBlock("img", {
                          key: 0,
                          src: unref(logoUrl),
                          alt: "Logo",
                          class: "logo-preview__img"
                        }, null, 8, ["src"])) : (openBlock(), createBlock("div", {
                          key: 1,
                          class: "logo-preview__placeholder"
                        }, [
                          createVNode(VIcon, {
                            size: "36",
                            class: "logo-preview__placeholder-icon"
                          }, {
                            default: withCtx(() => [
                              createTextVNode("mdi-image-outline")
                            ]),
                            _: 1
                          }),
                          createVNode("p", { class: "logo-preview__placeholder-text" }, "Click or drag to upload"),
                          createVNode("p", { class: "logo-preview__placeholder-hint" }, "PNG, JPG, SVG up to 2MB")
                        ]))
                      ], 34)
                    ]),
                    createVNode("div", { class: "logo-actions" }, [
                      createVNode("input", {
                        ref_key: "fileInput",
                        ref: fileInput,
                        type: "file",
                        accept: "image/png,image/jpeg,image/svg+xml",
                        style: { "display": "none" },
                        onChange: onFileSelect
                      }, null, 544),
                      createVNode(VBtn, {
                        variant: "outlined",
                        density: "comfortable",
                        "prepend-icon": "mdi-upload",
                        onClick: triggerFileInput,
                        loading: unref(uploadingLogo)
                      }, {
                        default: withCtx(() => [
                          createTextVNode(toDisplayString(unref(logoUrl) ? "Change Logo" : "Upload Logo"), 1)
                        ]),
                        _: 1
                      }, 8, ["loading"]),
                      unref(logoUrl) ? (openBlock(), createBlock(VBtn, {
                        key: 0,
                        variant: "text",
                        density: "comfortable",
                        "prepend-icon": "mdi-delete-outline",
                        color: "error",
                        onClick: removeLogo,
                        loading: unref(uploadingLogo)
                      }, {
                        default: withCtx(() => [
                          createTextVNode(" Remove ")
                        ]),
                        _: 1
                      }, 8, ["loading"])) : createCommentVNode("", true),
                      unref(logoError) ? (openBlock(), createBlock(VAlert, {
                        key: 1,
                        type: "error",
                        variant: "text",
                        density: "compact",
                        class: "mt-2"
                      }, {
                        default: withCtx(() => [
                          createTextVNode(toDisplayString(unref(logoError)), 1)
                        ]),
                        _: 1
                      })) : createCommentVNode("", true)
                    ])
                  ]),
                  createVNode(VDivider, { class: "my-5" }),
                  createVNode("p", { class: "text-body-2 font-weight-medium mb-2" }, "Primary Color"),
                  createVNode("div", { class: "d-flex align-center ga-3" }, [
                    createVNode(VColorPicker, {
                      modelValue: unref(form).primary_color,
                      "onUpdate:modelValue": ($event) => unref(form).primary_color = $event,
                      mode: "hex",
                      "hide-inputs": "",
                      width: "120"
                    }, null, 8, ["modelValue", "onUpdate:modelValue"]),
                    createVNode(VTextField, {
                      modelValue: unref(form).primary_color,
                      "onUpdate:modelValue": ($event) => unref(form).primary_color = $event,
                      label: "Primary Color",
                      variant: "outlined",
                      density: "comfortable",
                      style: { "max-width": "200px" },
                      placeholder: "#1976D2"
                    }, null, 8, ["modelValue", "onUpdate:modelValue"]),
                    createVNode(VCard, {
                      rounded: "lg",
                      style: { backgroundColor: unref(form).primary_color },
                      class: "px-4 py-2"
                    }, {
                      default: withCtx(() => [
                        createVNode("span", { class: "text-white text-body-2 font-weight-medium" }, "Preview")
                      ]),
                      _: 1
                    }, 8, ["style"])
                  ]),
                  createVNode("div", { class: "d-flex align-center ga-3 pt-4" }, [
                    createVNode(VBtn, {
                      color: "primary",
                      loading: unref(saving),
                      onClick: saveSettings
                    }, {
                      default: withCtx(() => [
                        createTextVNode("Save Branding")
                      ]),
                      _: 1
                    }, 8, ["loading"])
                  ])
                ]),
                _: 1
              })
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(ssrRenderComponent(VCard, {
        rounded: "lg",
        elevation: "2"
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(ssrRenderComponent(VCardTitle, { class: "text-body-1 font-weight-bold" }, {
              default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                if (_push3) {
                  _push3(`Address`);
                } else {
                  return [
                    createTextVNode("Address")
                  ];
                }
              }),
              _: 1
            }, _parent2, _scopeId));
            _push2(ssrRenderComponent(VCardText, null, {
              default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                if (_push3) {
                  _push3(ssrRenderComponent(VRow, null, {
                    default: withCtx((_3, _push4, _parent4, _scopeId3) => {
                      if (_push4) {
                        _push4(ssrRenderComponent(VCol, { cols: "12" }, {
                          default: withCtx((_4, _push5, _parent5, _scopeId4) => {
                            if (_push5) {
                              _push5(ssrRenderComponent(VTextField, {
                                modelValue: unref(form).address_line1,
                                "onUpdate:modelValue": ($event) => unref(form).address_line1 = $event,
                                label: "Address Line 1",
                                variant: "outlined",
                                density: "comfortable"
                              }, null, _parent5, _scopeId4));
                            } else {
                              return [
                                createVNode(VTextField, {
                                  modelValue: unref(form).address_line1,
                                  "onUpdate:modelValue": ($event) => unref(form).address_line1 = $event,
                                  label: "Address Line 1",
                                  variant: "outlined",
                                  density: "comfortable"
                                }, null, 8, ["modelValue", "onUpdate:modelValue"])
                              ];
                            }
                          }),
                          _: 1
                        }, _parent4, _scopeId3));
                        _push4(ssrRenderComponent(VCol, { cols: "12" }, {
                          default: withCtx((_4, _push5, _parent5, _scopeId4) => {
                            if (_push5) {
                              _push5(ssrRenderComponent(VTextField, {
                                modelValue: unref(form).address_line2,
                                "onUpdate:modelValue": ($event) => unref(form).address_line2 = $event,
                                label: "Address Line 2",
                                variant: "outlined",
                                density: "comfortable"
                              }, null, _parent5, _scopeId4));
                            } else {
                              return [
                                createVNode(VTextField, {
                                  modelValue: unref(form).address_line2,
                                  "onUpdate:modelValue": ($event) => unref(form).address_line2 = $event,
                                  label: "Address Line 2",
                                  variant: "outlined",
                                  density: "comfortable"
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
                              _push5(ssrRenderComponent(VTextField, {
                                modelValue: unref(form).city,
                                "onUpdate:modelValue": ($event) => unref(form).city = $event,
                                label: "City",
                                variant: "outlined",
                                density: "comfortable"
                              }, null, _parent5, _scopeId4));
                            } else {
                              return [
                                createVNode(VTextField, {
                                  modelValue: unref(form).city,
                                  "onUpdate:modelValue": ($event) => unref(form).city = $event,
                                  label: "City",
                                  variant: "outlined",
                                  density: "comfortable"
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
                              _push5(ssrRenderComponent(VTextField, {
                                modelValue: unref(form).state_province,
                                "onUpdate:modelValue": ($event) => unref(form).state_province = $event,
                                label: "State / Province",
                                variant: "outlined",
                                density: "comfortable"
                              }, null, _parent5, _scopeId4));
                            } else {
                              return [
                                createVNode(VTextField, {
                                  modelValue: unref(form).state_province,
                                  "onUpdate:modelValue": ($event) => unref(form).state_province = $event,
                                  label: "State / Province",
                                  variant: "outlined",
                                  density: "comfortable"
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
                              _push5(ssrRenderComponent(VTextField, {
                                modelValue: unref(form).postal_code,
                                "onUpdate:modelValue": ($event) => unref(form).postal_code = $event,
                                label: "Postal Code",
                                variant: "outlined",
                                density: "comfortable"
                              }, null, _parent5, _scopeId4));
                            } else {
                              return [
                                createVNode(VTextField, {
                                  modelValue: unref(form).postal_code,
                                  "onUpdate:modelValue": ($event) => unref(form).postal_code = $event,
                                  label: "Postal Code",
                                  variant: "outlined",
                                  density: "comfortable"
                                }, null, 8, ["modelValue", "onUpdate:modelValue"])
                              ];
                            }
                          }),
                          _: 1
                        }, _parent4, _scopeId3));
                      } else {
                        return [
                          createVNode(VCol, { cols: "12" }, {
                            default: withCtx(() => [
                              createVNode(VTextField, {
                                modelValue: unref(form).address_line1,
                                "onUpdate:modelValue": ($event) => unref(form).address_line1 = $event,
                                label: "Address Line 1",
                                variant: "outlined",
                                density: "comfortable"
                              }, null, 8, ["modelValue", "onUpdate:modelValue"])
                            ]),
                            _: 1
                          }),
                          createVNode(VCol, { cols: "12" }, {
                            default: withCtx(() => [
                              createVNode(VTextField, {
                                modelValue: unref(form).address_line2,
                                "onUpdate:modelValue": ($event) => unref(form).address_line2 = $event,
                                label: "Address Line 2",
                                variant: "outlined",
                                density: "comfortable"
                              }, null, 8, ["modelValue", "onUpdate:modelValue"])
                            ]),
                            _: 1
                          }),
                          createVNode(VCol, {
                            cols: "12",
                            md: "6"
                          }, {
                            default: withCtx(() => [
                              createVNode(VTextField, {
                                modelValue: unref(form).city,
                                "onUpdate:modelValue": ($event) => unref(form).city = $event,
                                label: "City",
                                variant: "outlined",
                                density: "comfortable"
                              }, null, 8, ["modelValue", "onUpdate:modelValue"])
                            ]),
                            _: 1
                          }),
                          createVNode(VCol, {
                            cols: "12",
                            md: "6"
                          }, {
                            default: withCtx(() => [
                              createVNode(VTextField, {
                                modelValue: unref(form).state_province,
                                "onUpdate:modelValue": ($event) => unref(form).state_province = $event,
                                label: "State / Province",
                                variant: "outlined",
                                density: "comfortable"
                              }, null, 8, ["modelValue", "onUpdate:modelValue"])
                            ]),
                            _: 1
                          }),
                          createVNode(VCol, {
                            cols: "12",
                            md: "6"
                          }, {
                            default: withCtx(() => [
                              createVNode(VTextField, {
                                modelValue: unref(form).postal_code,
                                "onUpdate:modelValue": ($event) => unref(form).postal_code = $event,
                                label: "Postal Code",
                                variant: "outlined",
                                density: "comfortable"
                              }, null, 8, ["modelValue", "onUpdate:modelValue"])
                            ]),
                            _: 1
                          })
                        ];
                      }
                    }),
                    _: 1
                  }, _parent3, _scopeId2));
                  _push3(`<div class="d-flex align-center ga-3 pt-2" data-v-0058557e${_scopeId2}>`);
                  _push3(ssrRenderComponent(VBtn, {
                    color: "primary",
                    loading: unref(saving),
                    onClick: saveSettings
                  }, {
                    default: withCtx((_3, _push4, _parent4, _scopeId3) => {
                      if (_push4) {
                        _push4(`Save Address`);
                      } else {
                        return [
                          createTextVNode("Save Address")
                        ];
                      }
                    }),
                    _: 1
                  }, _parent3, _scopeId2));
                  _push3(`</div>`);
                } else {
                  return [
                    createVNode(VRow, null, {
                      default: withCtx(() => [
                        createVNode(VCol, { cols: "12" }, {
                          default: withCtx(() => [
                            createVNode(VTextField, {
                              modelValue: unref(form).address_line1,
                              "onUpdate:modelValue": ($event) => unref(form).address_line1 = $event,
                              label: "Address Line 1",
                              variant: "outlined",
                              density: "comfortable"
                            }, null, 8, ["modelValue", "onUpdate:modelValue"])
                          ]),
                          _: 1
                        }),
                        createVNode(VCol, { cols: "12" }, {
                          default: withCtx(() => [
                            createVNode(VTextField, {
                              modelValue: unref(form).address_line2,
                              "onUpdate:modelValue": ($event) => unref(form).address_line2 = $event,
                              label: "Address Line 2",
                              variant: "outlined",
                              density: "comfortable"
                            }, null, 8, ["modelValue", "onUpdate:modelValue"])
                          ]),
                          _: 1
                        }),
                        createVNode(VCol, {
                          cols: "12",
                          md: "6"
                        }, {
                          default: withCtx(() => [
                            createVNode(VTextField, {
                              modelValue: unref(form).city,
                              "onUpdate:modelValue": ($event) => unref(form).city = $event,
                              label: "City",
                              variant: "outlined",
                              density: "comfortable"
                            }, null, 8, ["modelValue", "onUpdate:modelValue"])
                          ]),
                          _: 1
                        }),
                        createVNode(VCol, {
                          cols: "12",
                          md: "6"
                        }, {
                          default: withCtx(() => [
                            createVNode(VTextField, {
                              modelValue: unref(form).state_province,
                              "onUpdate:modelValue": ($event) => unref(form).state_province = $event,
                              label: "State / Province",
                              variant: "outlined",
                              density: "comfortable"
                            }, null, 8, ["modelValue", "onUpdate:modelValue"])
                          ]),
                          _: 1
                        }),
                        createVNode(VCol, {
                          cols: "12",
                          md: "6"
                        }, {
                          default: withCtx(() => [
                            createVNode(VTextField, {
                              modelValue: unref(form).postal_code,
                              "onUpdate:modelValue": ($event) => unref(form).postal_code = $event,
                              label: "Postal Code",
                              variant: "outlined",
                              density: "comfortable"
                            }, null, 8, ["modelValue", "onUpdate:modelValue"])
                          ]),
                          _: 1
                        })
                      ]),
                      _: 1
                    }),
                    createVNode("div", { class: "d-flex align-center ga-3 pt-2" }, [
                      createVNode(VBtn, {
                        color: "primary",
                        loading: unref(saving),
                        onClick: saveSettings
                      }, {
                        default: withCtx(() => [
                          createTextVNode("Save Address")
                        ]),
                        _: 1
                      }, 8, ["loading"])
                    ])
                  ];
                }
              }),
              _: 1
            }, _parent2, _scopeId));
          } else {
            return [
              createVNode(VCardTitle, { class: "text-body-1 font-weight-bold" }, {
                default: withCtx(() => [
                  createTextVNode("Address")
                ]),
                _: 1
              }),
              createVNode(VCardText, null, {
                default: withCtx(() => [
                  createVNode(VRow, null, {
                    default: withCtx(() => [
                      createVNode(VCol, { cols: "12" }, {
                        default: withCtx(() => [
                          createVNode(VTextField, {
                            modelValue: unref(form).address_line1,
                            "onUpdate:modelValue": ($event) => unref(form).address_line1 = $event,
                            label: "Address Line 1",
                            variant: "outlined",
                            density: "comfortable"
                          }, null, 8, ["modelValue", "onUpdate:modelValue"])
                        ]),
                        _: 1
                      }),
                      createVNode(VCol, { cols: "12" }, {
                        default: withCtx(() => [
                          createVNode(VTextField, {
                            modelValue: unref(form).address_line2,
                            "onUpdate:modelValue": ($event) => unref(form).address_line2 = $event,
                            label: "Address Line 2",
                            variant: "outlined",
                            density: "comfortable"
                          }, null, 8, ["modelValue", "onUpdate:modelValue"])
                        ]),
                        _: 1
                      }),
                      createVNode(VCol, {
                        cols: "12",
                        md: "6"
                      }, {
                        default: withCtx(() => [
                          createVNode(VTextField, {
                            modelValue: unref(form).city,
                            "onUpdate:modelValue": ($event) => unref(form).city = $event,
                            label: "City",
                            variant: "outlined",
                            density: "comfortable"
                          }, null, 8, ["modelValue", "onUpdate:modelValue"])
                        ]),
                        _: 1
                      }),
                      createVNode(VCol, {
                        cols: "12",
                        md: "6"
                      }, {
                        default: withCtx(() => [
                          createVNode(VTextField, {
                            modelValue: unref(form).state_province,
                            "onUpdate:modelValue": ($event) => unref(form).state_province = $event,
                            label: "State / Province",
                            variant: "outlined",
                            density: "comfortable"
                          }, null, 8, ["modelValue", "onUpdate:modelValue"])
                        ]),
                        _: 1
                      }),
                      createVNode(VCol, {
                        cols: "12",
                        md: "6"
                      }, {
                        default: withCtx(() => [
                          createVNode(VTextField, {
                            modelValue: unref(form).postal_code,
                            "onUpdate:modelValue": ($event) => unref(form).postal_code = $event,
                            label: "Postal Code",
                            variant: "outlined",
                            density: "comfortable"
                          }, null, 8, ["modelValue", "onUpdate:modelValue"])
                        ]),
                        _: 1
                      })
                    ]),
                    _: 1
                  }),
                  createVNode("div", { class: "d-flex align-center ga-3 pt-2" }, [
                    createVNode(VBtn, {
                      color: "primary",
                      loading: unref(saving),
                      onClick: saveSettings
                    }, {
                      default: withCtx(() => [
                        createTextVNode("Save Address")
                      ]),
                      _: 1
                    }, 8, ["loading"])
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
};
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/admin/settings.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const settings = /* @__PURE__ */ _export_sfc(_sfc_main, [["__scopeId", "data-v-0058557e"]]);

export { settings as default };
//# sourceMappingURL=settings-DFxefZsk.mjs.map
