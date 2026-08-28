import { ref, computed, mergeProps, withCtx, createTextVNode, isRef, unref, createVNode, toDisplayString, openBlock, createBlock, createCommentVNode, Fragment, renderList, useSSRContext } from "vue";
import { ssrRenderAttrs, ssrRenderComponent, ssrRenderList, ssrInterpolate, ssrRenderClass } from "vue/server-renderer";
import { u as useFormat } from "./useFormat-BvVWDMYe.js";
import { u as useApi } from "./useApi-D4YG8JPQ.js";
import { c as VBtn, v as VTextField, x as VProgressCircular, a as VIcon, e as VRow, f as VCol, g as VCard, o as VChip, q as VDialog, r as VCardTitle, s as VCardText, w as VCardActions, b as VSpacer, y as navigateTo } from "../server.mjs";
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
const _sfc_main = {
  __name: "parked",
  __ssrInlineRender: true,
  setup(__props) {
    const { currency } = useFormat();
    function formatMoney(v) {
      return currency(v);
    }
    const loading = ref(false);
    const parked = ref([]);
    const searchText = ref("");
    const deleteDialog = ref(false);
    const deleteTarget = ref(null);
    function expiryLabel(expiresAt) {
      if (!expiresAt) return "";
      const diff = new Date(expiresAt).getTime() - Date.now();
      if (diff <= 0) return "soon";
      const h = Math.floor(diff / 36e5);
      if (h >= 1) return `in ${h}h`;
      const m = Math.floor(diff / 6e4);
      return `in ${m}m`;
    }
    function expiryClass(expiresAt) {
      if (!expiresAt) return "text-medium-emphasis";
      const diff = new Date(expiresAt).getTime() - Date.now();
      if (diff <= 36e5) return "text-error font-weight-medium";
      if (diff <= 216e5) return "text-warning font-weight-medium";
      return "text-medium-emphasis";
    }
    const filtered = computed(() => {
      if (!searchText.value) return parked.value;
      const s = searchText.value.toLowerCase();
      return parked.value.filter((p) => p.customer_name?.toLowerCase().includes(s) || p.customer_phone?.includes(s));
    });
    async function loadData() {
      loading.value = true;
      try {
        const data = await useApi()("/pos/parked-sales/?page_size=200");
        parked.value = data.results || data;
      } catch {
      } finally {
        loading.value = false;
      }
    }
    function resume(p) {
      sessionStorage.setItem("pos_resume_parked", JSON.stringify(p));
      navigateTo("/pos");
    }
    function deleteParked(p) {
      deleteTarget.value = p;
      deleteDialog.value = true;
    }
    async function confirmDelete() {
      try {
        await useApi()(`/pos/parked-sales/${deleteTarget.value.id}/`, { method: "DELETE" });
        parked.value = parked.value.filter((p) => p.id !== deleteTarget.value.id);
        deleteDialog.value = false;
      } catch {
      }
    }
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "pa-4" }, _attrs))}><div class="d-flex align-center mb-4 flex-wrap ga-3">`);
      _push(ssrRenderComponent(VBtn, {
        to: "/pos",
        variant: "text",
        "prepend-icon": "mdi-arrow-left"
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`POS`);
          } else {
            return [
              createTextVNode("POS")
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`<h2 class="text-h5 font-weight-bold">Parked Sales</h2>`);
      _push(ssrRenderComponent(VBtn, {
        variant: "tonal",
        size: "small",
        "prepend-icon": "mdi-refresh",
        onClick: loadData
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
      _push(`</div>`);
      _push(ssrRenderComponent(VTextField, {
        modelValue: unref(searchText),
        "onUpdate:modelValue": ($event) => isRef(searchText) ? searchText.value = $event : null,
        "prepend-inner-icon": "mdi-magnify",
        placeholder: "Search by customer or phone...",
        density: "compact",
        variant: "outlined",
        "hide-details": "",
        class: "mb-4"
      }, null, _parent));
      if (unref(loading)) {
        _push(`<div class="d-flex justify-center pa-8">`);
        _push(ssrRenderComponent(VProgressCircular, {
          indeterminate: "",
          color: "primary"
        }, null, _parent));
        _push(`</div>`);
      } else if (unref(filtered).length === 0) {
        _push(`<div class="text-center py-12 text-medium-emphasis">`);
        _push(ssrRenderComponent(VIcon, {
          size: "48",
          color: "grey-lighten-1"
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`mdi-tray-remove`);
            } else {
              return [
                createTextVNode("mdi-tray-remove")
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(`<p class="mt-2">No parked sales</p></div>`);
      } else {
        _push(ssrRenderComponent(VRow, null, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`<!--[-->`);
              ssrRenderList(unref(filtered), (p) => {
                _push2(ssrRenderComponent(VCol, {
                  key: p.id,
                  cols: "12",
                  md: "6",
                  lg: "4"
                }, {
                  default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                    if (_push3) {
                      _push3(ssrRenderComponent(VCard, {
                        rounded: "xl",
                        variant: "outlined",
                        class: "pa-3"
                      }, {
                        default: withCtx((_3, _push4, _parent4, _scopeId3) => {
                          if (_push4) {
                            _push4(`<div class="d-flex justify-space-between align-center mb-2"${_scopeId3}>`);
                            _push4(ssrRenderComponent(VChip, {
                              color: "warning",
                              variant: "flat",
                              size: "small"
                            }, {
                              default: withCtx((_4, _push5, _parent5, _scopeId4) => {
                                if (_push5) {
                                  _push5(ssrRenderComponent(VIcon, {
                                    start: "",
                                    size: "14"
                                  }, {
                                    default: withCtx((_5, _push6, _parent6, _scopeId5) => {
                                      if (_push6) {
                                        _push6(`mdi-pause`);
                                      } else {
                                        return [
                                          createTextVNode("mdi-pause")
                                        ];
                                      }
                                    }),
                                    _: 2
                                  }, _parent5, _scopeId4));
                                  _push5(`Park #${ssrInterpolate(p.id)}`);
                                } else {
                                  return [
                                    createVNode(VIcon, {
                                      start: "",
                                      size: "14"
                                    }, {
                                      default: withCtx(() => [
                                        createTextVNode("mdi-pause")
                                      ]),
                                      _: 1
                                    }),
                                    createTextVNode("Park #" + toDisplayString(p.id), 1)
                                  ];
                                }
                              }),
                              _: 2
                            }, _parent4, _scopeId3));
                            _push4(ssrRenderComponent(VChip, {
                              size: "small",
                              variant: "tonal"
                            }, {
                              default: withCtx((_4, _push5, _parent5, _scopeId4) => {
                                if (_push5) {
                                  _push5(`${ssrInterpolate(p.item_count)} items`);
                                } else {
                                  return [
                                    createTextVNode(toDisplayString(p.item_count) + " items", 1)
                                  ];
                                }
                              }),
                              _: 2
                            }, _parent4, _scopeId3));
                            _push4(`</div><p class="font-weight-medium"${_scopeId3}>${ssrInterpolate(p.customer_name || "Walk-in")}</p>`);
                            if (p.customer_phone) {
                              _push4(`<p class="text-caption text-medium-emphasis"${_scopeId3}>`);
                              _push4(ssrRenderComponent(VIcon, { size: "12" }, {
                                default: withCtx((_4, _push5, _parent5, _scopeId4) => {
                                  if (_push5) {
                                    _push5(`mdi-phone`);
                                  } else {
                                    return [
                                      createTextVNode("mdi-phone")
                                    ];
                                  }
                                }),
                                _: 2
                              }, _parent4, _scopeId3));
                              _push4(` ${ssrInterpolate(p.customer_phone)}</p>`);
                            } else {
                              _push4(`<!---->`);
                            }
                            _push4(`<p class="text-caption text-medium-emphasis"${_scopeId3}>`);
                            _push4(ssrRenderComponent(VIcon, { size: "12" }, {
                              default: withCtx((_4, _push5, _parent5, _scopeId4) => {
                                if (_push5) {
                                  _push5(`mdi-account-tie`);
                                } else {
                                  return [
                                    createTextVNode("mdi-account-tie")
                                  ];
                                }
                              }),
                              _: 2
                            }, _parent4, _scopeId3));
                            _push4(` ${ssrInterpolate(p.cashier_name)}</p><p class="text-caption text-medium-emphasis"${_scopeId3}>`);
                            _push4(ssrRenderComponent(VIcon, { size: "12" }, {
                              default: withCtx((_4, _push5, _parent5, _scopeId4) => {
                                if (_push5) {
                                  _push5(`mdi-clock`);
                                } else {
                                  return [
                                    createTextVNode("mdi-clock")
                                  ];
                                }
                              }),
                              _: 2
                            }, _parent4, _scopeId3));
                            _push4(` ${ssrInterpolate(new Date(p.created_at).toLocaleString())}</p><p class="${ssrRenderClass([expiryClass(p.expires_at), "text-caption"])}"${_scopeId3}>`);
                            _push4(ssrRenderComponent(VIcon, { size: "12" }, {
                              default: withCtx((_4, _push5, _parent5, _scopeId4) => {
                                if (_push5) {
                                  _push5(`mdi-timer-sand`);
                                } else {
                                  return [
                                    createTextVNode("mdi-timer-sand")
                                  ];
                                }
                              }),
                              _: 2
                            }, _parent4, _scopeId3));
                            _push4(` Auto-removed ${ssrInterpolate(expiryLabel(p.expires_at))}</p><div class="d-flex justify-space-between align-center mt-2"${_scopeId3}><span class="text-h6 font-weight-bold text-primary"${_scopeId3}>${ssrInterpolate(formatMoney(p.total))}</span><div class="d-flex ga-1"${_scopeId3}>`);
                            _push4(ssrRenderComponent(VBtn, {
                              size: "small",
                              color: "success",
                              variant: "flat",
                              "prepend-icon": "mdi-play",
                              onClick: ($event) => resume(p)
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
                              _: 2
                            }, _parent4, _scopeId3));
                            _push4(ssrRenderComponent(VBtn, {
                              size: "small",
                              color: "error",
                              variant: "text",
                              icon: "mdi-delete",
                              onClick: ($event) => deleteParked(p)
                            }, null, _parent4, _scopeId3));
                            _push4(`</div></div>`);
                          } else {
                            return [
                              createVNode("div", { class: "d-flex justify-space-between align-center mb-2" }, [
                                createVNode(VChip, {
                                  color: "warning",
                                  variant: "flat",
                                  size: "small"
                                }, {
                                  default: withCtx(() => [
                                    createVNode(VIcon, {
                                      start: "",
                                      size: "14"
                                    }, {
                                      default: withCtx(() => [
                                        createTextVNode("mdi-pause")
                                      ]),
                                      _: 1
                                    }),
                                    createTextVNode("Park #" + toDisplayString(p.id), 1)
                                  ]),
                                  _: 2
                                }, 1024),
                                createVNode(VChip, {
                                  size: "small",
                                  variant: "tonal"
                                }, {
                                  default: withCtx(() => [
                                    createTextVNode(toDisplayString(p.item_count) + " items", 1)
                                  ]),
                                  _: 2
                                }, 1024)
                              ]),
                              createVNode("p", { class: "font-weight-medium" }, toDisplayString(p.customer_name || "Walk-in"), 1),
                              p.customer_phone ? (openBlock(), createBlock("p", {
                                key: 0,
                                class: "text-caption text-medium-emphasis"
                              }, [
                                createVNode(VIcon, { size: "12" }, {
                                  default: withCtx(() => [
                                    createTextVNode("mdi-phone")
                                  ]),
                                  _: 1
                                }),
                                createTextVNode(" " + toDisplayString(p.customer_phone), 1)
                              ])) : createCommentVNode("", true),
                              createVNode("p", { class: "text-caption text-medium-emphasis" }, [
                                createVNode(VIcon, { size: "12" }, {
                                  default: withCtx(() => [
                                    createTextVNode("mdi-account-tie")
                                  ]),
                                  _: 1
                                }),
                                createTextVNode(" " + toDisplayString(p.cashier_name), 1)
                              ]),
                              createVNode("p", { class: "text-caption text-medium-emphasis" }, [
                                createVNode(VIcon, { size: "12" }, {
                                  default: withCtx(() => [
                                    createTextVNode("mdi-clock")
                                  ]),
                                  _: 1
                                }),
                                createTextVNode(" " + toDisplayString(new Date(p.created_at).toLocaleString()), 1)
                              ]),
                              createVNode("p", {
                                class: ["text-caption", expiryClass(p.expires_at)]
                              }, [
                                createVNode(VIcon, { size: "12" }, {
                                  default: withCtx(() => [
                                    createTextVNode("mdi-timer-sand")
                                  ]),
                                  _: 1
                                }),
                                createTextVNode(" Auto-removed " + toDisplayString(expiryLabel(p.expires_at)), 1)
                              ], 2),
                              createVNode("div", { class: "d-flex justify-space-between align-center mt-2" }, [
                                createVNode("span", { class: "text-h6 font-weight-bold text-primary" }, toDisplayString(formatMoney(p.total)), 1),
                                createVNode("div", { class: "d-flex ga-1" }, [
                                  createVNode(VBtn, {
                                    size: "small",
                                    color: "success",
                                    variant: "flat",
                                    "prepend-icon": "mdi-play",
                                    onClick: ($event) => resume(p)
                                  }, {
                                    default: withCtx(() => [
                                      createTextVNode("Resume")
                                    ]),
                                    _: 1
                                  }, 8, ["onClick"]),
                                  createVNode(VBtn, {
                                    size: "small",
                                    color: "error",
                                    variant: "text",
                                    icon: "mdi-delete",
                                    onClick: ($event) => deleteParked(p)
                                  }, null, 8, ["onClick"])
                                ])
                              ])
                            ];
                          }
                        }),
                        _: 2
                      }, _parent3, _scopeId2));
                    } else {
                      return [
                        createVNode(VCard, {
                          rounded: "xl",
                          variant: "outlined",
                          class: "pa-3"
                        }, {
                          default: withCtx(() => [
                            createVNode("div", { class: "d-flex justify-space-between align-center mb-2" }, [
                              createVNode(VChip, {
                                color: "warning",
                                variant: "flat",
                                size: "small"
                              }, {
                                default: withCtx(() => [
                                  createVNode(VIcon, {
                                    start: "",
                                    size: "14"
                                  }, {
                                    default: withCtx(() => [
                                      createTextVNode("mdi-pause")
                                    ]),
                                    _: 1
                                  }),
                                  createTextVNode("Park #" + toDisplayString(p.id), 1)
                                ]),
                                _: 2
                              }, 1024),
                              createVNode(VChip, {
                                size: "small",
                                variant: "tonal"
                              }, {
                                default: withCtx(() => [
                                  createTextVNode(toDisplayString(p.item_count) + " items", 1)
                                ]),
                                _: 2
                              }, 1024)
                            ]),
                            createVNode("p", { class: "font-weight-medium" }, toDisplayString(p.customer_name || "Walk-in"), 1),
                            p.customer_phone ? (openBlock(), createBlock("p", {
                              key: 0,
                              class: "text-caption text-medium-emphasis"
                            }, [
                              createVNode(VIcon, { size: "12" }, {
                                default: withCtx(() => [
                                  createTextVNode("mdi-phone")
                                ]),
                                _: 1
                              }),
                              createTextVNode(" " + toDisplayString(p.customer_phone), 1)
                            ])) : createCommentVNode("", true),
                            createVNode("p", { class: "text-caption text-medium-emphasis" }, [
                              createVNode(VIcon, { size: "12" }, {
                                default: withCtx(() => [
                                  createTextVNode("mdi-account-tie")
                                ]),
                                _: 1
                              }),
                              createTextVNode(" " + toDisplayString(p.cashier_name), 1)
                            ]),
                            createVNode("p", { class: "text-caption text-medium-emphasis" }, [
                              createVNode(VIcon, { size: "12" }, {
                                default: withCtx(() => [
                                  createTextVNode("mdi-clock")
                                ]),
                                _: 1
                              }),
                              createTextVNode(" " + toDisplayString(new Date(p.created_at).toLocaleString()), 1)
                            ]),
                            createVNode("p", {
                              class: ["text-caption", expiryClass(p.expires_at)]
                            }, [
                              createVNode(VIcon, { size: "12" }, {
                                default: withCtx(() => [
                                  createTextVNode("mdi-timer-sand")
                                ]),
                                _: 1
                              }),
                              createTextVNode(" Auto-removed " + toDisplayString(expiryLabel(p.expires_at)), 1)
                            ], 2),
                            createVNode("div", { class: "d-flex justify-space-between align-center mt-2" }, [
                              createVNode("span", { class: "text-h6 font-weight-bold text-primary" }, toDisplayString(formatMoney(p.total)), 1),
                              createVNode("div", { class: "d-flex ga-1" }, [
                                createVNode(VBtn, {
                                  size: "small",
                                  color: "success",
                                  variant: "flat",
                                  "prepend-icon": "mdi-play",
                                  onClick: ($event) => resume(p)
                                }, {
                                  default: withCtx(() => [
                                    createTextVNode("Resume")
                                  ]),
                                  _: 1
                                }, 8, ["onClick"]),
                                createVNode(VBtn, {
                                  size: "small",
                                  color: "error",
                                  variant: "text",
                                  icon: "mdi-delete",
                                  onClick: ($event) => deleteParked(p)
                                }, null, 8, ["onClick"])
                              ])
                            ])
                          ]),
                          _: 2
                        }, 1024)
                      ];
                    }
                  }),
                  _: 2
                }, _parent2, _scopeId));
              });
              _push2(`<!--]-->`);
            } else {
              return [
                (openBlock(true), createBlock(Fragment, null, renderList(unref(filtered), (p) => {
                  return openBlock(), createBlock(VCol, {
                    key: p.id,
                    cols: "12",
                    md: "6",
                    lg: "4"
                  }, {
                    default: withCtx(() => [
                      createVNode(VCard, {
                        rounded: "xl",
                        variant: "outlined",
                        class: "pa-3"
                      }, {
                        default: withCtx(() => [
                          createVNode("div", { class: "d-flex justify-space-between align-center mb-2" }, [
                            createVNode(VChip, {
                              color: "warning",
                              variant: "flat",
                              size: "small"
                            }, {
                              default: withCtx(() => [
                                createVNode(VIcon, {
                                  start: "",
                                  size: "14"
                                }, {
                                  default: withCtx(() => [
                                    createTextVNode("mdi-pause")
                                  ]),
                                  _: 1
                                }),
                                createTextVNode("Park #" + toDisplayString(p.id), 1)
                              ]),
                              _: 2
                            }, 1024),
                            createVNode(VChip, {
                              size: "small",
                              variant: "tonal"
                            }, {
                              default: withCtx(() => [
                                createTextVNode(toDisplayString(p.item_count) + " items", 1)
                              ]),
                              _: 2
                            }, 1024)
                          ]),
                          createVNode("p", { class: "font-weight-medium" }, toDisplayString(p.customer_name || "Walk-in"), 1),
                          p.customer_phone ? (openBlock(), createBlock("p", {
                            key: 0,
                            class: "text-caption text-medium-emphasis"
                          }, [
                            createVNode(VIcon, { size: "12" }, {
                              default: withCtx(() => [
                                createTextVNode("mdi-phone")
                              ]),
                              _: 1
                            }),
                            createTextVNode(" " + toDisplayString(p.customer_phone), 1)
                          ])) : createCommentVNode("", true),
                          createVNode("p", { class: "text-caption text-medium-emphasis" }, [
                            createVNode(VIcon, { size: "12" }, {
                              default: withCtx(() => [
                                createTextVNode("mdi-account-tie")
                              ]),
                              _: 1
                            }),
                            createTextVNode(" " + toDisplayString(p.cashier_name), 1)
                          ]),
                          createVNode("p", { class: "text-caption text-medium-emphasis" }, [
                            createVNode(VIcon, { size: "12" }, {
                              default: withCtx(() => [
                                createTextVNode("mdi-clock")
                              ]),
                              _: 1
                            }),
                            createTextVNode(" " + toDisplayString(new Date(p.created_at).toLocaleString()), 1)
                          ]),
                          createVNode("p", {
                            class: ["text-caption", expiryClass(p.expires_at)]
                          }, [
                            createVNode(VIcon, { size: "12" }, {
                              default: withCtx(() => [
                                createTextVNode("mdi-timer-sand")
                              ]),
                              _: 1
                            }),
                            createTextVNode(" Auto-removed " + toDisplayString(expiryLabel(p.expires_at)), 1)
                          ], 2),
                          createVNode("div", { class: "d-flex justify-space-between align-center mt-2" }, [
                            createVNode("span", { class: "text-h6 font-weight-bold text-primary" }, toDisplayString(formatMoney(p.total)), 1),
                            createVNode("div", { class: "d-flex ga-1" }, [
                              createVNode(VBtn, {
                                size: "small",
                                color: "success",
                                variant: "flat",
                                "prepend-icon": "mdi-play",
                                onClick: ($event) => resume(p)
                              }, {
                                default: withCtx(() => [
                                  createTextVNode("Resume")
                                ]),
                                _: 1
                              }, 8, ["onClick"]),
                              createVNode(VBtn, {
                                size: "small",
                                color: "error",
                                variant: "text",
                                icon: "mdi-delete",
                                onClick: ($event) => deleteParked(p)
                              }, null, 8, ["onClick"])
                            ])
                          ])
                        ]),
                        _: 2
                      }, 1024)
                    ]),
                    _: 2
                  }, 1024);
                }), 128))
              ];
            }
          }),
          _: 1
        }, _parent));
      }
      _push(ssrRenderComponent(VDialog, {
        modelValue: unref(deleteDialog),
        "onUpdate:modelValue": ($event) => isRef(deleteDialog) ? deleteDialog.value = $event : null,
        "max-width": "400"
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(ssrRenderComponent(VCard, { rounded: "xl" }, {
              default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                if (_push3) {
                  _push3(ssrRenderComponent(VCardTitle, { class: "text-h6 text-error" }, {
                    default: withCtx((_3, _push4, _parent4, _scopeId3) => {
                      if (_push4) {
                        _push4(`Delete Parked Sale?`);
                      } else {
                        return [
                          createTextVNode("Delete Parked Sale?")
                        ];
                      }
                    }),
                    _: 1
                  }, _parent3, _scopeId2));
                  _push3(ssrRenderComponent(VCardText, null, {
                    default: withCtx((_3, _push4, _parent4, _scopeId3) => {
                      if (_push4) {
                        _push4(`Are you sure you want to delete Park #${ssrInterpolate(unref(deleteTarget)?.id)} for ${ssrInterpolate(unref(deleteTarget)?.customer_name || "Walk-in")} (${ssrInterpolate(formatMoney(unref(deleteTarget)?.total))})?`);
                      } else {
                        return [
                          createTextVNode("Are you sure you want to delete Park #" + toDisplayString(unref(deleteTarget)?.id) + " for " + toDisplayString(unref(deleteTarget)?.customer_name || "Walk-in") + " (" + toDisplayString(formatMoney(unref(deleteTarget)?.total)) + ")?", 1)
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
                          onClick: ($event) => deleteDialog.value = false
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
                          color: "error",
                          onClick: confirmDelete
                        }, {
                          default: withCtx((_4, _push5, _parent5, _scopeId4) => {
                            if (_push5) {
                              _push5(`Delete`);
                            } else {
                              return [
                                createTextVNode("Delete")
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
                            onClick: ($event) => deleteDialog.value = false
                          }, {
                            default: withCtx(() => [
                              createTextVNode("Cancel")
                            ]),
                            _: 1
                          }, 8, ["onClick"]),
                          createVNode(VBtn, {
                            variant: "flat",
                            color: "error",
                            onClick: confirmDelete
                          }, {
                            default: withCtx(() => [
                              createTextVNode("Delete")
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
                    createVNode(VCardTitle, { class: "text-h6 text-error" }, {
                      default: withCtx(() => [
                        createTextVNode("Delete Parked Sale?")
                      ]),
                      _: 1
                    }),
                    createVNode(VCardText, null, {
                      default: withCtx(() => [
                        createTextVNode("Are you sure you want to delete Park #" + toDisplayString(unref(deleteTarget)?.id) + " for " + toDisplayString(unref(deleteTarget)?.customer_name || "Walk-in") + " (" + toDisplayString(formatMoney(unref(deleteTarget)?.total)) + ")?", 1)
                      ]),
                      _: 1
                    }),
                    createVNode(VCardActions, null, {
                      default: withCtx(() => [
                        createVNode(VSpacer),
                        createVNode(VBtn, {
                          variant: "text",
                          onClick: ($event) => deleteDialog.value = false
                        }, {
                          default: withCtx(() => [
                            createTextVNode("Cancel")
                          ]),
                          _: 1
                        }, 8, ["onClick"]),
                        createVNode(VBtn, {
                          variant: "flat",
                          color: "error",
                          onClick: confirmDelete
                        }, {
                          default: withCtx(() => [
                            createTextVNode("Delete")
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
                  createVNode(VCardTitle, { class: "text-h6 text-error" }, {
                    default: withCtx(() => [
                      createTextVNode("Delete Parked Sale?")
                    ]),
                    _: 1
                  }),
                  createVNode(VCardText, null, {
                    default: withCtx(() => [
                      createTextVNode("Are you sure you want to delete Park #" + toDisplayString(unref(deleteTarget)?.id) + " for " + toDisplayString(unref(deleteTarget)?.customer_name || "Walk-in") + " (" + toDisplayString(formatMoney(unref(deleteTarget)?.total)) + ")?", 1)
                    ]),
                    _: 1
                  }),
                  createVNode(VCardActions, null, {
                    default: withCtx(() => [
                      createVNode(VSpacer),
                      createVNode(VBtn, {
                        variant: "text",
                        onClick: ($event) => deleteDialog.value = false
                      }, {
                        default: withCtx(() => [
                          createTextVNode("Cancel")
                        ]),
                        _: 1
                      }, 8, ["onClick"]),
                      createVNode(VBtn, {
                        variant: "flat",
                        color: "error",
                        onClick: confirmDelete
                      }, {
                        default: withCtx(() => [
                          createTextVNode("Delete")
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
};
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/pos/parked.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
export {
  _sfc_main as default
};
//# sourceMappingURL=parked-DHacC-TP.js.map
