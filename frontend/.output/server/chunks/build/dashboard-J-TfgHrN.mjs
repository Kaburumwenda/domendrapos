import { defineComponent, computed, ref, watch, resolveComponent, mergeProps, withCtx, createTextVNode, unref, isRef, openBlock, createBlock, createVNode, useModel, toDisplayString, Fragment, renderList, mergeModels, resolveDynamicComponent, createCommentVNode, renderSlot, onScopeDispose, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent, ssrInterpolate, ssrRenderList, ssrRenderVNode, ssrRenderClass, ssrRenderSlot } from 'vue/server-renderer';
import { M as useToast, d as VIcon, g as VBtn, U as VBtnGroup, x as VDialog, k as VCard, y as VCardTitle, z as VCardText, C as VTextField, D as VCardActions, f as VSpacer, a4 as VSkeletonLoader } from './server.mjs';
import { _ as _export_sfc } from './_plugin-vue_export-helper-1tPrXgE0.mjs';
import { _ as __nuxt_component_0$2 } from './nuxt-link-CMdK2Lfo.mjs';
import { u as useFormat } from './useFormat-C--cm8if.mjs';
import { u as useBranchStore } from './branch-BM2L0a8H.mjs';
import { u as useApi } from './useApi-9yTPzSUF.mjs';
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
import './auth-s-b-v9EY.mjs';

const _sfc_main$a = /* @__PURE__ */ defineComponent({
  __name: "PeriodSelector",
  __ssrInlineRender: true,
  props: {
    "modelValue": { default: "thisMonth" },
    "modelModifiers": {}
  },
  emits: /* @__PURE__ */ mergeModels(["custom"], ["update:modelValue"]),
  setup(__props, { emit: __emit }) {
    const model = useModel(__props, "modelValue");
    const emit = __emit;
    const options = [
      { value: "today", short: "Today" },
      { value: "7d", short: "7D" },
      { value: "30d", short: "30D" },
      { value: "thisMonth", short: "Month" },
      { value: "ytd", short: "YTD" },
      { value: "all", short: "All" }
    ];
    const customDialog = ref(false);
    const customRange = ref({ from: "", to: "" });
    function applyCustom() {
      model.value = "custom";
      emit("custom", { ...customRange.value });
      customDialog.value = false;
    }
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<!--[-->`);
      _push(ssrRenderComponent(VBtnGroup, {
        density: "compact",
        variant: "outlined",
        color: "primary",
        class: "period-selector"
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<!--[-->`);
            ssrRenderList(options, (opt) => {
              _push2(ssrRenderComponent(VBtn, {
                key: opt.value,
                variant: model.value === opt.value ? "flat" : "text",
                color: model.value === opt.value ? "primary" : void 0,
                size: "small",
                onClick: ($event) => model.value = opt.value
              }, {
                default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                  if (_push3) {
                    _push3(`${ssrInterpolate(opt.short)}`);
                  } else {
                    return [
                      createTextVNode(toDisplayString(opt.short), 1)
                    ];
                  }
                }),
                _: 2
              }, _parent2, _scopeId));
            });
            _push2(`<!--]-->`);
            _push2(ssrRenderComponent(VBtn, {
              variant: model.value === "custom" ? "flat" : "text",
              color: model.value === "custom" ? "primary" : void 0,
              size: "small",
              onClick: ($event) => customDialog.value = true
            }, {
              default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                if (_push3) {
                  _push3(` Custom `);
                } else {
                  return [
                    createTextVNode(" Custom ")
                  ];
                }
              }),
              _: 1
            }, _parent2, _scopeId));
          } else {
            return [
              (openBlock(), createBlock(Fragment, null, renderList(options, (opt) => {
                return createVNode(VBtn, {
                  key: opt.value,
                  variant: model.value === opt.value ? "flat" : "text",
                  color: model.value === opt.value ? "primary" : void 0,
                  size: "small",
                  onClick: ($event) => model.value = opt.value
                }, {
                  default: withCtx(() => [
                    createTextVNode(toDisplayString(opt.short), 1)
                  ]),
                  _: 2
                }, 1032, ["variant", "color", "onClick"]);
              }), 64)),
              createVNode(VBtn, {
                variant: model.value === "custom" ? "flat" : "text",
                color: model.value === "custom" ? "primary" : void 0,
                size: "small",
                onClick: ($event) => customDialog.value = true
              }, {
                default: withCtx(() => [
                  createTextVNode(" Custom ")
                ]),
                _: 1
              }, 8, ["variant", "color", "onClick"])
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(ssrRenderComponent(VDialog, {
        modelValue: unref(customDialog),
        "onUpdate:modelValue": ($event) => isRef(customDialog) ? customDialog.value = $event : null,
        "max-width": "420"
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(ssrRenderComponent(VCard, { rounded: "xl" }, {
              default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                if (_push3) {
                  _push3(ssrRenderComponent(VCardTitle, { class: "text-h6" }, {
                    default: withCtx((_3, _push4, _parent4, _scopeId3) => {
                      if (_push4) {
                        _push4(`Custom Date Range`);
                      } else {
                        return [
                          createTextVNode("Custom Date Range")
                        ];
                      }
                    }),
                    _: 1
                  }, _parent3, _scopeId2));
                  _push3(ssrRenderComponent(VCardText, null, {
                    default: withCtx((_3, _push4, _parent4, _scopeId3) => {
                      if (_push4) {
                        _push4(ssrRenderComponent(VTextField, {
                          modelValue: unref(customRange).from,
                          "onUpdate:modelValue": ($event) => unref(customRange).from = $event,
                          type: "date",
                          label: "From",
                          variant: "outlined",
                          density: "compact",
                          class: "mb-3"
                        }, null, _parent4, _scopeId3));
                        _push4(ssrRenderComponent(VTextField, {
                          modelValue: unref(customRange).to,
                          "onUpdate:modelValue": ($event) => unref(customRange).to = $event,
                          type: "date",
                          label: "To",
                          variant: "outlined",
                          density: "compact"
                        }, null, _parent4, _scopeId3));
                      } else {
                        return [
                          createVNode(VTextField, {
                            modelValue: unref(customRange).from,
                            "onUpdate:modelValue": ($event) => unref(customRange).from = $event,
                            type: "date",
                            label: "From",
                            variant: "outlined",
                            density: "compact",
                            class: "mb-3"
                          }, null, 8, ["modelValue", "onUpdate:modelValue"]),
                          createVNode(VTextField, {
                            modelValue: unref(customRange).to,
                            "onUpdate:modelValue": ($event) => unref(customRange).to = $event,
                            type: "date",
                            label: "To",
                            variant: "outlined",
                            density: "compact"
                          }, null, 8, ["modelValue", "onUpdate:modelValue"])
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
                          onClick: ($event) => customDialog.value = false
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
                          variant: "flat",
                          onClick: applyCustom
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
                            onClick: ($event) => customDialog.value = false
                          }, {
                            default: withCtx(() => [
                              createTextVNode("Cancel")
                            ]),
                            _: 1
                          }, 8, ["onClick"]),
                          createVNode(VBtn, {
                            color: "primary",
                            variant: "flat",
                            onClick: applyCustom
                          }, {
                            default: withCtx(() => [
                              createTextVNode("Apply")
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
                    createVNode(VCardTitle, { class: "text-h6" }, {
                      default: withCtx(() => [
                        createTextVNode("Custom Date Range")
                      ]),
                      _: 1
                    }),
                    createVNode(VCardText, null, {
                      default: withCtx(() => [
                        createVNode(VTextField, {
                          modelValue: unref(customRange).from,
                          "onUpdate:modelValue": ($event) => unref(customRange).from = $event,
                          type: "date",
                          label: "From",
                          variant: "outlined",
                          density: "compact",
                          class: "mb-3"
                        }, null, 8, ["modelValue", "onUpdate:modelValue"]),
                        createVNode(VTextField, {
                          modelValue: unref(customRange).to,
                          "onUpdate:modelValue": ($event) => unref(customRange).to = $event,
                          type: "date",
                          label: "To",
                          variant: "outlined",
                          density: "compact"
                        }, null, 8, ["modelValue", "onUpdate:modelValue"])
                      ]),
                      _: 1
                    }),
                    createVNode(VCardActions, null, {
                      default: withCtx(() => [
                        createVNode(VSpacer),
                        createVNode(VBtn, {
                          variant: "text",
                          onClick: ($event) => customDialog.value = false
                        }, {
                          default: withCtx(() => [
                            createTextVNode("Cancel")
                          ]),
                          _: 1
                        }, 8, ["onClick"]),
                        createVNode(VBtn, {
                          color: "primary",
                          variant: "flat",
                          onClick: applyCustom
                        }, {
                          default: withCtx(() => [
                            createTextVNode("Apply")
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
                  createVNode(VCardTitle, { class: "text-h6" }, {
                    default: withCtx(() => [
                      createTextVNode("Custom Date Range")
                    ]),
                    _: 1
                  }),
                  createVNode(VCardText, null, {
                    default: withCtx(() => [
                      createVNode(VTextField, {
                        modelValue: unref(customRange).from,
                        "onUpdate:modelValue": ($event) => unref(customRange).from = $event,
                        type: "date",
                        label: "From",
                        variant: "outlined",
                        density: "compact",
                        class: "mb-3"
                      }, null, 8, ["modelValue", "onUpdate:modelValue"]),
                      createVNode(VTextField, {
                        modelValue: unref(customRange).to,
                        "onUpdate:modelValue": ($event) => unref(customRange).to = $event,
                        type: "date",
                        label: "To",
                        variant: "outlined",
                        density: "compact"
                      }, null, 8, ["modelValue", "onUpdate:modelValue"])
                    ]),
                    _: 1
                  }),
                  createVNode(VCardActions, null, {
                    default: withCtx(() => [
                      createVNode(VSpacer),
                      createVNode(VBtn, {
                        variant: "text",
                        onClick: ($event) => customDialog.value = false
                      }, {
                        default: withCtx(() => [
                          createTextVNode("Cancel")
                        ]),
                        _: 1
                      }, 8, ["onClick"]),
                      createVNode(VBtn, {
                        color: "primary",
                        variant: "flat",
                        onClick: applyCustom
                      }, {
                        default: withCtx(() => [
                          createTextVNode("Apply")
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
      _push(`<!--]-->`);
    };
  }
});
const _sfc_setup$a = _sfc_main$a.setup;
_sfc_main$a.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/dashboard/PeriodSelector.vue");
  return _sfc_setup$a ? _sfc_setup$a(props, ctx) : void 0;
};
const __nuxt_component_0$1 = /* @__PURE__ */ Object.assign(_export_sfc(_sfc_main$a, [["__scopeId", "data-v-b335f4f3"]]), { __name: "DashboardPeriodSelector" });
const _sfc_main$9 = /* @__PURE__ */ defineComponent({
  __name: "ErrorState",
  __ssrInlineRender: true,
  props: {
    title: { default: "Failed to load data" },
    subtitle: { default: "Something went wrong while fetching the dashboard. Please try again." },
    onRetry: {}
  },
  setup(__props) {
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "dash-error" }, _attrs))} data-v-f073fddf>`);
      _push(ssrRenderComponent(VIcon, {
        color: "error",
        size: "48"
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`mdi-alert-circle-outline`);
          } else {
            return [
              createTextVNode("mdi-alert-circle-outline")
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`<h3 class="dash-error__title" data-v-f073fddf>${ssrInterpolate(__props.title)}</h3><p class="dash-error__subtitle" data-v-f073fddf>${ssrInterpolate(__props.subtitle)}</p>`);
      if (__props.onRetry) {
        _push(ssrRenderComponent(VBtn, {
          color: "primary",
          variant: "flat",
          "prepend-icon": "mdi-refresh",
          onClick: __props.onRetry
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(` Retry `);
            } else {
              return [
                createTextVNode(" Retry ")
              ];
            }
          }),
          _: 1
        }, _parent));
      } else {
        _push(`<!---->`);
      }
      _push(`</div>`);
    };
  }
});
const _sfc_setup$9 = _sfc_main$9.setup;
_sfc_main$9.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/dashboard/ErrorState.vue");
  return _sfc_setup$9 ? _sfc_setup$9(props, ctx) : void 0;
};
const __nuxt_component_1 = /* @__PURE__ */ Object.assign(_export_sfc(_sfc_main$9, [["__scopeId", "data-v-f073fddf"]]), { __name: "DashboardErrorState" });
const _sfc_main$8 = {};
function _sfc_ssrRender(_ctx, _push, _parent, _attrs) {
  _push(`<div${ssrRenderAttrs(mergeProps({ class: "dash-skeleton" }, _attrs))} data-v-2d77ff32><div class="dash-skeleton__kpis" data-v-2d77ff32><!--[-->`);
  ssrRenderList(6, (n) => {
    _push(ssrRenderComponent(VSkeletonLoader, {
      key: `kpi-${n}`,
      type: "article",
      class: "dash-skeleton__kpi",
      boilerplate: ""
    }, null, _parent));
  });
  _push(`<!--]--></div><div class="dash-skeleton__charts dash-skeleton__charts--wide" data-v-2d77ff32>`);
  _push(ssrRenderComponent(VSkeletonLoader, {
    type: "image",
    class: "dash-skeleton__chart dash-skeleton__chart--wide",
    boilerplate: ""
  }, null, _parent));
  _push(ssrRenderComponent(VSkeletonLoader, {
    type: "image",
    class: "dash-skeleton__chart dash-skeleton__chart--narrow",
    boilerplate: ""
  }, null, _parent));
  _push(`</div><div class="dash-skeleton__charts" data-v-2d77ff32>`);
  _push(ssrRenderComponent(VSkeletonLoader, {
    type: "image",
    class: "dash-skeleton__chart",
    boilerplate: ""
  }, null, _parent));
  _push(ssrRenderComponent(VSkeletonLoader, {
    type: "image",
    class: "dash-skeleton__chart",
    boilerplate: ""
  }, null, _parent));
  _push(`</div><div class="dash-skeleton__bottom" data-v-2d77ff32>`);
  _push(ssrRenderComponent(VSkeletonLoader, {
    type: "list-item-three-line@5",
    class: "dash-skeleton__list",
    boilerplate: ""
  }, null, _parent));
  _push(ssrRenderComponent(VSkeletonLoader, {
    type: "list-item-three-line@5",
    class: "dash-skeleton__list",
    boilerplate: ""
  }, null, _parent));
  _push(`</div></div>`);
}
const _sfc_setup$8 = _sfc_main$8.setup;
_sfc_main$8.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/dashboard/Skeleton.vue");
  return _sfc_setup$8 ? _sfc_setup$8(props, ctx) : void 0;
};
const __nuxt_component_2$1 = /* @__PURE__ */ Object.assign(_export_sfc(_sfc_main$8, [["ssrRender", _sfc_ssrRender], ["__scopeId", "data-v-2d77ff32"]]), { __name: "DashboardSkeleton" });
const _sfc_main$7 = /* @__PURE__ */ defineComponent({
  __name: "GradientIcon",
  __ssrInlineRender: true,
  props: {
    icon: {},
    color: { default: "primary" }
  },
  setup(__props) {
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<div${ssrRenderAttrs(mergeProps({
        class: ["gradient-icon", `gradient-icon--${__props.color}`]
      }, _attrs))} data-v-79f4d432>`);
      _push(ssrRenderComponent(VIcon, { size: "20" }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`${ssrInterpolate(__props.icon)}`);
          } else {
            return [
              createTextVNode(toDisplayString(__props.icon), 1)
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`</div>`);
    };
  }
});
const _sfc_setup$7 = _sfc_main$7.setup;
_sfc_main$7.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/GradientIcon.vue");
  return _sfc_setup$7 ? _sfc_setup$7(props, ctx) : void 0;
};
const __nuxt_component_0 = /* @__PURE__ */ Object.assign(_export_sfc(_sfc_main$7, [["__scopeId", "data-v-79f4d432"]]), { __name: "GradientIcon" });
function useCountUp(source, duration = 800) {
  const display = ref(0);
  let raf;
  let from = 0;
  let startTime = 0;
  function animate(target) {
    if (from === target) {
      display.value = target;
      return;
    }
    startTime = performance.now();
    const startVal = from;
    function step(now) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      display.value = startVal + (target - startVal) * eased;
      if (progress < 1) {
        raf = requestAnimationFrame(step);
      } else {
        from = target;
      }
    }
    if (raf) cancelAnimationFrame(raf);
    raf = requestAnimationFrame(step);
  }
  watch(source, (target) => {
    animate(target);
  }, { immediate: true });
  onScopeDispose(() => {
    if (raf) cancelAnimationFrame(raf);
  });
  return display;
}
const _sfc_main$6 = /* @__PURE__ */ defineComponent({
  __name: "CountUpText",
  __ssrInlineRender: true,
  props: {
    value: {},
    format: { default: "none" },
    decimals: { default: 0 },
    duration: { default: 800 }
  },
  setup(__props) {
    const props = __props;
    const { currency, number, percent } = useFormat();
    const source = computed(() => Number(props.value) || 0);
    const animated = useCountUp(() => source.value, props.duration);
    const formatted = computed(() => {
      switch (props.format) {
        case "currency":
          return currency(animated.value);
        case "number":
          return number(Math.round(animated.value));
        case "percent":
          return percent(animated.value, props.decimals);
        default:
          return props.decimals > 0 ? animated.value.toFixed(props.decimals) : number(Math.round(animated.value));
      }
    });
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<span${ssrRenderAttrs(_attrs)}>${ssrInterpolate(unref(formatted))}</span>`);
    };
  }
});
const _sfc_setup$6 = _sfc_main$6.setup;
_sfc_main$6.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/CountUpText.vue");
  return _sfc_setup$6 ? _sfc_setup$6(props, ctx) : void 0;
};
const __nuxt_component_2 = Object.assign(_sfc_main$6, { __name: "CountUpText" });
function rgbFromVar(name, fallback) {
  return fallback;
}
function useChartTheme() {
  const colors = computed(() => {
    const primary = rgbFromVar("--v-theme-primary", "52, 120, 246");
    const success = rgbFromVar("--v-theme-success", "76, 175, 80");
    const warning = rgbFromVar("--v-theme-warning", "255, 152, 0");
    const error = rgbFromVar("--v-theme-error", "239, 83, 80");
    const info = rgbFromVar("--v-theme-info", "33, 150, 243");
    const secondary = rgbFromVar("--v-theme-secondary", "124, 77, 255");
    const surface = rgbFromVar("--v-theme-surface", "255, 255, 255");
    const onSurface = rgbFromVar("--v-theme-on-surface", "0, 0, 0");
    const isDark = surface.split(",").reduce((sum, v) => sum + Number(v), 0) / 3 < 128;
    const foreColor = `rgba(${onSurface}, ${isDark ? 0.7 : 0.6})`;
    const grid = `rgba(${onSurface}, ${isDark ? 0.1 : 0.08})`;
    const muted = `rgba(${onSurface}, ${isDark ? 0.5 : 0.4})`;
    return {
      primary,
      success,
      warning,
      error,
      info,
      secondary,
      surface,
      onSurface,
      grid,
      foreColor,
      muted
    };
  });
  const palette = computed(() => [
    `rgb(${colors.value.primary})`,
    `rgb(${colors.value.success})`,
    `rgb(${colors.value.warning})`,
    `rgb(${colors.value.error})`,
    `rgb(${colors.value.secondary})`,
    `rgb(${colors.value.info})`,
    "#10b981",
    "#f43f5e",
    "#6366f1",
    "#f59e0b"
  ]);
  return {
    colors,
    palette
  };
}
const _sfc_main$5 = /* @__PURE__ */ defineComponent({
  __name: "KpiCard",
  __ssrInlineRender: true,
  props: {
    icon: { type: String, required: true },
    label: { type: String, required: true },
    value: { type: Number, default: 0 },
    format: { type: String, default: "none" },
    decimals: { type: Number, default: 0 },
    color: { type: String, default: "primary" },
    trend: { type: Number, default: void 0 },
    subtext: { type: String, default: "" },
    valueClass: { type: String, default: "" },
    to: { type: String, default: "" },
    sparklineSeries: { type: Array, default: () => [] }
  },
  setup(__props) {
    const NuxtLink = __nuxt_component_0$2;
    const { currency } = useFormat();
    const { colors } = useChartTheme();
    const sparkOptions = computed(() => ({
      chart: {
        type: "area",
        sparkline: { enabled: true },
        animations: { enabled: true },
        background: "transparent",
        foreColor: "transparent",
        fontFamily: '"Segoe UI Variable", Inter, system-ui, sans-serif'
      },
      colors: [`rgb(${colors.value.primary})`],
      stroke: { curve: "smooth", width: 2 },
      fill: {
        type: "gradient",
        gradient: {
          shadeIntensity: 1,
          opacityFrom: 0.35,
          opacityTo: 0,
          stops: [0, 100]
        }
      },
      tooltip: {
        fixed: { enabled: false },
        y: { formatter: (v) => currency(v) }
      }
    }));
    return (_ctx, _push, _parent, _attrs) => {
      const _component_GradientIcon = __nuxt_component_0;
      const _component_CountUpText = __nuxt_component_2;
      const _component_apexchart = resolveComponent("apexchart");
      ssrRenderVNode(_push, createVNode(resolveDynamicComponent(__props.to ? unref(NuxtLink) : "div"), mergeProps({
        to: __props.to,
        class: ["kpi-card", { "kpi-card--clickable": !!__props.to }]
      }, _attrs), {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<div class="kpi-card__top" data-v-e0a0cfdd${_scopeId}><span class="kpi-card__label" data-v-e0a0cfdd${_scopeId}>${ssrInterpolate(__props.label)}</span>`);
            _push2(ssrRenderComponent(_component_GradientIcon, {
              icon: __props.icon,
              color: __props.color
            }, null, _parent2, _scopeId));
            _push2(`</div><div class="${ssrRenderClass([__props.valueClass, "kpi-card__value"])}" data-v-e0a0cfdd${_scopeId}>`);
            _push2(ssrRenderComponent(_component_CountUpText, {
              value: __props.value,
              format: __props.format,
              decimals: __props.decimals
            }, null, _parent2, _scopeId));
            _push2(`</div>`);
            if (__props.trend !== void 0) {
              _push2(`<div class="${ssrRenderClass([__props.trend >= 0 ? "kpi-card__trend--up" : "kpi-card__trend--down", "kpi-card__trend"])}" data-v-e0a0cfdd${_scopeId}>`);
              _push2(ssrRenderComponent(VIcon, { size: "14" }, {
                default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                  if (_push3) {
                    _push3(`${ssrInterpolate(__props.trend >= 0 ? "mdi-trending-up" : "mdi-trending-down")}`);
                  } else {
                    return [
                      createTextVNode(toDisplayString(__props.trend >= 0 ? "mdi-trending-up" : "mdi-trending-down"), 1)
                    ];
                  }
                }),
                _: 1
              }, _parent2, _scopeId));
              _push2(`<span data-v-e0a0cfdd${_scopeId}>${ssrInterpolate(Math.abs(__props.trend).toFixed(1))}% vs prev</span></div>`);
            } else if (__props.subtext) {
              _push2(`<div class="kpi-card__subtext" data-v-e0a0cfdd${_scopeId}>${ssrInterpolate(__props.subtext)}</div>`);
            } else {
              _push2(`<!---->`);
            }
            if (__props.sparklineSeries && __props.sparklineSeries[0]?.data?.length) {
              _push2(`<div class="kpi-card__spark" data-v-e0a0cfdd${_scopeId}>`);
              _push2(ssrRenderComponent(_component_apexchart, {
                type: "area",
                height: "40",
                options: unref(sparkOptions),
                series: __props.sparklineSeries
              }, null, _parent2, _scopeId));
              _push2(`</div>`);
            } else {
              _push2(`<!---->`);
            }
          } else {
            return [
              createVNode("div", { class: "kpi-card__top" }, [
                createVNode("span", { class: "kpi-card__label" }, toDisplayString(__props.label), 1),
                createVNode(_component_GradientIcon, {
                  icon: __props.icon,
                  color: __props.color
                }, null, 8, ["icon", "color"])
              ]),
              createVNode("div", {
                class: ["kpi-card__value", __props.valueClass]
              }, [
                createVNode(_component_CountUpText, {
                  value: __props.value,
                  format: __props.format,
                  decimals: __props.decimals
                }, null, 8, ["value", "format", "decimals"])
              ], 2),
              __props.trend !== void 0 ? (openBlock(), createBlock("div", {
                key: 0,
                class: ["kpi-card__trend", __props.trend >= 0 ? "kpi-card__trend--up" : "kpi-card__trend--down"]
              }, [
                createVNode(VIcon, { size: "14" }, {
                  default: withCtx(() => [
                    createTextVNode(toDisplayString(__props.trend >= 0 ? "mdi-trending-up" : "mdi-trending-down"), 1)
                  ]),
                  _: 1
                }),
                createVNode("span", null, toDisplayString(Math.abs(__props.trend).toFixed(1)) + "% vs prev", 1)
              ], 2)) : __props.subtext ? (openBlock(), createBlock("div", {
                key: 1,
                class: "kpi-card__subtext"
              }, toDisplayString(__props.subtext), 1)) : createCommentVNode("", true),
              __props.sparklineSeries && __props.sparklineSeries[0]?.data?.length ? (openBlock(), createBlock("div", {
                key: 2,
                class: "kpi-card__spark"
              }, [
                createVNode(_component_apexchart, {
                  type: "area",
                  height: "40",
                  options: unref(sparkOptions),
                  series: __props.sparklineSeries
                }, null, 8, ["options", "series"])
              ])) : createCommentVNode("", true)
            ];
          }
        }),
        _: 1
      }), _parent);
    };
  }
});
const _sfc_setup$5 = _sfc_main$5.setup;
_sfc_main$5.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/dashboard/KpiCard.vue");
  return _sfc_setup$5 ? _sfc_setup$5(props, ctx) : void 0;
};
const __nuxt_component_3 = /* @__PURE__ */ Object.assign(_export_sfc(_sfc_main$5, [["__scopeId", "data-v-e0a0cfdd"]]), { __name: "DashboardKpiCard" });
const _sfc_main$4 = /* @__PURE__ */ defineComponent({
  __name: "ChartCard",
  __ssrInlineRender: true,
  props: {
    icon: {},
    title: {},
    subtitle: { default: "" },
    color: { default: "primary" },
    to: { default: "" },
    onView: {}
  },
  setup(__props) {
    return (_ctx, _push, _parent, _attrs) => {
      const _component_GradientIcon = __nuxt_component_0;
      _push(ssrRenderComponent(VCard, mergeProps({
        rounded: "xl",
        flat: "",
        border: "",
        class: "chart-card"
      }, _attrs), {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<div class="chart-card__header" data-v-4967f841${_scopeId}>`);
            _push2(ssrRenderComponent(_component_GradientIcon, {
              icon: __props.icon,
              color: __props.color,
              class: "chart-card__icon"
            }, null, _parent2, _scopeId));
            _push2(`<div class="chart-card__titles" data-v-4967f841${_scopeId}><h3 class="chart-card__title" data-v-4967f841${_scopeId}>${ssrInterpolate(__props.title)}</h3>`);
            if (__props.subtitle) {
              _push2(`<p class="chart-card__subtitle" data-v-4967f841${_scopeId}>${ssrInterpolate(__props.subtitle)}</p>`);
            } else {
              _push2(`<!---->`);
            }
            _push2(`</div>`);
            if (__props.to) {
              _push2(ssrRenderComponent(VBtn, {
                variant: "text",
                size: "x-small",
                class: "ml-auto",
                to: __props.to,
                "prepend-icon": "mdi-arrow-right"
              }, {
                default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                  if (_push3) {
                    _push3(` View `);
                  } else {
                    return [
                      createTextVNode(" View ")
                    ];
                  }
                }),
                _: 1
              }, _parent2, _scopeId));
            } else if (__props.onView) {
              _push2(ssrRenderComponent(VBtn, {
                variant: "text",
                size: "x-small",
                class: "ml-auto",
                "prepend-icon": "mdi-arrow-right",
                onClick: __props.onView
              }, {
                default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                  if (_push3) {
                    _push3(` View `);
                  } else {
                    return [
                      createTextVNode(" View ")
                    ];
                  }
                }),
                _: 1
              }, _parent2, _scopeId));
            } else {
              _push2(`<!---->`);
            }
            _push2(`</div>`);
            _push2(ssrRenderComponent(VCardText, { class: "chart-card__body" }, {
              default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                if (_push3) {
                  ssrRenderSlot(_ctx.$slots, "default", {}, null, _push3, _parent3, _scopeId2);
                } else {
                  return [
                    renderSlot(_ctx.$slots, "default", {}, void 0, true)
                  ];
                }
              }),
              _: 3
            }, _parent2, _scopeId));
          } else {
            return [
              createVNode("div", { class: "chart-card__header" }, [
                createVNode(_component_GradientIcon, {
                  icon: __props.icon,
                  color: __props.color,
                  class: "chart-card__icon"
                }, null, 8, ["icon", "color"]),
                createVNode("div", { class: "chart-card__titles" }, [
                  createVNode("h3", { class: "chart-card__title" }, toDisplayString(__props.title), 1),
                  __props.subtitle ? (openBlock(), createBlock("p", {
                    key: 0,
                    class: "chart-card__subtitle"
                  }, toDisplayString(__props.subtitle), 1)) : createCommentVNode("", true)
                ]),
                __props.to ? (openBlock(), createBlock(VBtn, {
                  key: 0,
                  variant: "text",
                  size: "x-small",
                  class: "ml-auto",
                  to: __props.to,
                  "prepend-icon": "mdi-arrow-right"
                }, {
                  default: withCtx(() => [
                    createTextVNode(" View ")
                  ]),
                  _: 1
                }, 8, ["to"])) : __props.onView ? (openBlock(), createBlock(VBtn, {
                  key: 1,
                  variant: "text",
                  size: "x-small",
                  class: "ml-auto",
                  "prepend-icon": "mdi-arrow-right",
                  onClick: __props.onView
                }, {
                  default: withCtx(() => [
                    createTextVNode(" View ")
                  ]),
                  _: 1
                }, 8, ["onClick"])) : createCommentVNode("", true)
              ]),
              createVNode(VCardText, { class: "chart-card__body" }, {
                default: withCtx(() => [
                  renderSlot(_ctx.$slots, "default", {}, void 0, true)
                ]),
                _: 3
              })
            ];
          }
        }),
        _: 3
      }, _parent));
    };
  }
});
const _sfc_setup$4 = _sfc_main$4.setup;
_sfc_main$4.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/dashboard/ChartCard.vue");
  return _sfc_setup$4 ? _sfc_setup$4(props, ctx) : void 0;
};
const __nuxt_component_4 = /* @__PURE__ */ Object.assign(_export_sfc(_sfc_main$4, [["__scopeId", "data-v-4967f841"]]), { __name: "DashboardChartCard" });
const _sfc_main$3 = /* @__PURE__ */ defineComponent({
  __name: "EmptyState",
  __ssrInlineRender: true,
  props: {
    icon: {},
    title: {},
    subtitle: { default: "" },
    iconColor: { default: "grey-lighten-1" }
  },
  setup(__props) {
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "dash-empty" }, _attrs))} data-v-e8b41df5>`);
      _push(ssrRenderComponent(VIcon, {
        color: __props.iconColor,
        size: "40"
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`${ssrInterpolate(__props.icon)}`);
          } else {
            return [
              createTextVNode(toDisplayString(__props.icon), 1)
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`<p class="dash-empty__title text-body-2 text-medium-emphasis mt-2" data-v-e8b41df5>${ssrInterpolate(__props.title)}</p>`);
      if (__props.subtitle) {
        _push(`<p class="dash-empty__subtitle text-caption text-medium-emphasis" data-v-e8b41df5>${ssrInterpolate(__props.subtitle)}</p>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</div>`);
    };
  }
});
const _sfc_setup$3 = _sfc_main$3.setup;
_sfc_main$3.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/dashboard/EmptyState.vue");
  return _sfc_setup$3 ? _sfc_setup$3(props, ctx) : void 0;
};
const __nuxt_component_5 = /* @__PURE__ */ Object.assign(_export_sfc(_sfc_main$3, [["__scopeId", "data-v-e8b41df5"]]), { __name: "DashboardEmptyState" });
const _sfc_main$2 = /* @__PURE__ */ defineComponent({
  __name: "LowStockList",
  __ssrInlineRender: true,
  props: {
    items: {},
    loading: { type: Boolean, default: false },
    limit: { default: 8 }
  },
  setup(__props) {
    const props = __props;
    const limitedItems = computed(() => props.items.slice(0, props.limit));
    return (_ctx, _push, _parent, _attrs) => {
      const _component_GradientIcon = __nuxt_component_0;
      const _component_DashboardEmptyState = __nuxt_component_5;
      _push(ssrRenderComponent(VCard, mergeProps({
        rounded: "xl",
        flat: "",
        border: "",
        class: "low-stock-card"
      }, _attrs), {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<div class="low-stock-card__header" data-v-3e92fc40${_scopeId}>`);
            _push2(ssrRenderComponent(_component_GradientIcon, {
              icon: "mdi-package-down",
              color: "rose"
            }, null, _parent2, _scopeId));
            _push2(`<div class="low-stock-card__titles" data-v-3e92fc40${_scopeId}><h3 class="low-stock-card__title" data-v-3e92fc40${_scopeId}>Low Stock Alerts</h3><p class="low-stock-card__subtitle" data-v-3e92fc40${_scopeId}>${ssrInterpolate(__props.items.length)} items need attention</p></div>`);
            _push2(ssrRenderComponent(VBtn, {
              variant: "text",
              size: "x-small",
              class: "ml-auto",
              to: "/inventory/low-stock",
              "prepend-icon": "mdi-arrow-right"
            }, {
              default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                if (_push3) {
                  _push3(` View All `);
                } else {
                  return [
                    createTextVNode(" View All ")
                  ];
                }
              }),
              _: 1
            }, _parent2, _scopeId));
            _push2(`</div>`);
            _push2(ssrRenderComponent(VCardText, { class: "low-stock-card__body" }, {
              default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                if (_push3) {
                  if (!__props.items.length && !__props.loading) {
                    _push3(ssrRenderComponent(_component_DashboardEmptyState, {
                      icon: "mdi-check-circle-outline",
                      "icon-color": "success",
                      title: "All stock levels are healthy!"
                    }, null, _parent3, _scopeId2));
                  } else if (__props.loading) {
                    _push3(ssrRenderComponent(VSkeletonLoader, {
                      type: "list-item-three-line@6",
                      boilerplate: ""
                    }, null, _parent3, _scopeId2));
                  } else {
                    _push3(`<div class="low-stock-list" data-v-3e92fc40${_scopeId2}><!--[-->`);
                    ssrRenderList(unref(limitedItems), (item) => {
                      _push3(`<div class="low-stock-item" data-v-3e92fc40${_scopeId2}><div class="low-stock-item__info" data-v-3e92fc40${_scopeId2}><p class="low-stock-item__name" data-v-3e92fc40${_scopeId2}>${ssrInterpolate(item.product)}</p><p class="low-stock-item__sku" data-v-3e92fc40${_scopeId2}>SKU: ${ssrInterpolate(item.sku)} · ${ssrInterpolate(item.branch)}</p></div><div class="low-stock-item__qty" data-v-3e92fc40${_scopeId2}><span class="low-stock-badge" data-v-3e92fc40${_scopeId2}>${ssrInterpolate(item.on_hand)}</span><span class="low-stock-divider" data-v-3e92fc40${_scopeId2}>/</span><span class="low-stock-reorder" data-v-3e92fc40${_scopeId2}>${ssrInterpolate(item.reorder_level)}</span></div></div>`);
                    });
                    _push3(`<!--]--></div>`);
                  }
                } else {
                  return [
                    !__props.items.length && !__props.loading ? (openBlock(), createBlock(_component_DashboardEmptyState, {
                      key: 0,
                      icon: "mdi-check-circle-outline",
                      "icon-color": "success",
                      title: "All stock levels are healthy!"
                    })) : __props.loading ? (openBlock(), createBlock(VSkeletonLoader, {
                      key: 1,
                      type: "list-item-three-line@6",
                      boilerplate: ""
                    })) : (openBlock(), createBlock("div", {
                      key: 2,
                      class: "low-stock-list"
                    }, [
                      (openBlock(true), createBlock(Fragment, null, renderList(unref(limitedItems), (item) => {
                        return openBlock(), createBlock("div", {
                          key: item.sku,
                          class: "low-stock-item"
                        }, [
                          createVNode("div", { class: "low-stock-item__info" }, [
                            createVNode("p", { class: "low-stock-item__name" }, toDisplayString(item.product), 1),
                            createVNode("p", { class: "low-stock-item__sku" }, "SKU: " + toDisplayString(item.sku) + " · " + toDisplayString(item.branch), 1)
                          ]),
                          createVNode("div", { class: "low-stock-item__qty" }, [
                            createVNode("span", { class: "low-stock-badge" }, toDisplayString(item.on_hand), 1),
                            createVNode("span", { class: "low-stock-divider" }, "/"),
                            createVNode("span", { class: "low-stock-reorder" }, toDisplayString(item.reorder_level), 1)
                          ])
                        ]);
                      }), 128))
                    ]))
                  ];
                }
              }),
              _: 1
            }, _parent2, _scopeId));
          } else {
            return [
              createVNode("div", { class: "low-stock-card__header" }, [
                createVNode(_component_GradientIcon, {
                  icon: "mdi-package-down",
                  color: "rose"
                }),
                createVNode("div", { class: "low-stock-card__titles" }, [
                  createVNode("h3", { class: "low-stock-card__title" }, "Low Stock Alerts"),
                  createVNode("p", { class: "low-stock-card__subtitle" }, toDisplayString(__props.items.length) + " items need attention", 1)
                ]),
                createVNode(VBtn, {
                  variant: "text",
                  size: "x-small",
                  class: "ml-auto",
                  to: "/inventory/low-stock",
                  "prepend-icon": "mdi-arrow-right"
                }, {
                  default: withCtx(() => [
                    createTextVNode(" View All ")
                  ]),
                  _: 1
                })
              ]),
              createVNode(VCardText, { class: "low-stock-card__body" }, {
                default: withCtx(() => [
                  !__props.items.length && !__props.loading ? (openBlock(), createBlock(_component_DashboardEmptyState, {
                    key: 0,
                    icon: "mdi-check-circle-outline",
                    "icon-color": "success",
                    title: "All stock levels are healthy!"
                  })) : __props.loading ? (openBlock(), createBlock(VSkeletonLoader, {
                    key: 1,
                    type: "list-item-three-line@6",
                    boilerplate: ""
                  })) : (openBlock(), createBlock("div", {
                    key: 2,
                    class: "low-stock-list"
                  }, [
                    (openBlock(true), createBlock(Fragment, null, renderList(unref(limitedItems), (item) => {
                      return openBlock(), createBlock("div", {
                        key: item.sku,
                        class: "low-stock-item"
                      }, [
                        createVNode("div", { class: "low-stock-item__info" }, [
                          createVNode("p", { class: "low-stock-item__name" }, toDisplayString(item.product), 1),
                          createVNode("p", { class: "low-stock-item__sku" }, "SKU: " + toDisplayString(item.sku) + " · " + toDisplayString(item.branch), 1)
                        ]),
                        createVNode("div", { class: "low-stock-item__qty" }, [
                          createVNode("span", { class: "low-stock-badge" }, toDisplayString(item.on_hand), 1),
                          createVNode("span", { class: "low-stock-divider" }, "/"),
                          createVNode("span", { class: "low-stock-reorder" }, toDisplayString(item.reorder_level), 1)
                        ])
                      ]);
                    }), 128))
                  ]))
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
const _sfc_setup$2 = _sfc_main$2.setup;
_sfc_main$2.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/dashboard/LowStockList.vue");
  return _sfc_setup$2 ? _sfc_setup$2(props, ctx) : void 0;
};
const __nuxt_component_6 = /* @__PURE__ */ Object.assign(_export_sfc(_sfc_main$2, [["__scopeId", "data-v-3e92fc40"]]), { __name: "DashboardLowStockList" });
const _sfc_main$1 = /* @__PURE__ */ defineComponent({
  __name: "RecentTransactions",
  __ssrInlineRender: true,
  props: {
    transactions: {},
    loading: { type: Boolean, default: false }
  },
  setup(__props) {
    const { currency, datetime } = useFormat();
    function formatMoney(v) {
      return currency(Number(v) || 0);
    }
    function formatTxDate(v) {
      return datetime(v);
    }
    return (_ctx, _push, _parent, _attrs) => {
      const _component_GradientIcon = __nuxt_component_0;
      const _component_DashboardEmptyState = __nuxt_component_5;
      const _component_NuxtLink = __nuxt_component_0$2;
      _push(ssrRenderComponent(VCard, mergeProps({
        rounded: "xl",
        flat: "",
        border: "",
        class: "tx-card"
      }, _attrs), {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<div class="tx-card__header" data-v-64cb10da${_scopeId}>`);
            _push2(ssrRenderComponent(_component_GradientIcon, {
              icon: "mdi-receipt-text-clock",
              color: "teal"
            }, null, _parent2, _scopeId));
            _push2(`<div class="tx-card__titles" data-v-64cb10da${_scopeId}><h3 class="tx-card__title" data-v-64cb10da${_scopeId}>Recent Transactions</h3><p class="tx-card__subtitle" data-v-64cb10da${_scopeId}>Latest sales activity</p></div>`);
            _push2(ssrRenderComponent(VBtn, {
              variant: "text",
              size: "x-small",
              class: "ml-auto",
              to: "/sales",
              "prepend-icon": "mdi-arrow-right"
            }, {
              default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                if (_push3) {
                  _push3(` View All `);
                } else {
                  return [
                    createTextVNode(" View All ")
                  ];
                }
              }),
              _: 1
            }, _parent2, _scopeId));
            _push2(`</div>`);
            _push2(ssrRenderComponent(VCardText, { class: "tx-card__body" }, {
              default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                if (_push3) {
                  if (!__props.transactions.length && !__props.loading) {
                    _push3(ssrRenderComponent(_component_DashboardEmptyState, {
                      icon: "mdi-receipt-text-outline",
                      title: "No transactions yet"
                    }, null, _parent3, _scopeId2));
                  } else if (__props.loading) {
                    _push3(ssrRenderComponent(VSkeletonLoader, {
                      type: "list-item-three-line@6",
                      boilerplate: ""
                    }, null, _parent3, _scopeId2));
                  } else {
                    _push3(`<div class="tx-list" data-v-64cb10da${_scopeId2}><!--[-->`);
                    ssrRenderList(__props.transactions, (tx) => {
                      _push3(ssrRenderComponent(_component_NuxtLink, {
                        key: tx.id,
                        to: `/sales/${tx.id}`,
                        class: "tx-item"
                      }, {
                        default: withCtx((_3, _push4, _parent4, _scopeId3) => {
                          if (_push4) {
                            _push4(`<div class="tx-item__left" data-v-64cb10da${_scopeId3}><div class="${ssrRenderClass([`tx-item__avatar--${tx.id % 4}`, "tx-item__avatar"])}" data-v-64cb10da${_scopeId3}>${ssrInterpolate((tx.cashier_name || "?").charAt(0).toUpperCase())}</div><div class="tx-item__info" data-v-64cb10da${_scopeId3}><div class="tx-item__top" data-v-64cb10da${_scopeId3}><span class="tx-item__number" data-v-64cb10da${_scopeId3}>${ssrInterpolate(tx.transaction_number)}</span><span class="tx-chip tx-chip--method" data-v-64cb10da${_scopeId3}>${ssrInterpolate(tx.payment_method_display || tx.payment_method)}</span><span class="tx-chip tx-chip--items" data-v-64cb10da${_scopeId3}>${ssrInterpolate(tx.items_count || 0)} items</span></div><p class="tx-item__meta" data-v-64cb10da${_scopeId3}>${ssrInterpolate(tx.cashier_name || "Unknown")} · ${ssrInterpolate(tx.customer_name || "Walk-in")} · ${ssrInterpolate(formatTxDate(tx.created_at))}</p>`);
                            if (tx.branch_name) {
                              _push4(`<p class="tx-item__branch" data-v-64cb10da${_scopeId3}>`);
                              _push4(ssrRenderComponent(VIcon, { size: "11" }, {
                                default: withCtx((_4, _push5, _parent5, _scopeId4) => {
                                  if (_push5) {
                                    _push5(`mdi-store-outline`);
                                  } else {
                                    return [
                                      createTextVNode("mdi-store-outline")
                                    ];
                                  }
                                }),
                                _: 2
                              }, _parent4, _scopeId3));
                              _push4(` ${ssrInterpolate(tx.branch_name)}</p>`);
                            } else {
                              _push4(`<!---->`);
                            }
                            _push4(`</div></div><div class="tx-item__right" data-v-64cb10da${_scopeId3}><span class="tx-item__total" data-v-64cb10da${_scopeId3}>${ssrInterpolate(formatMoney(tx.total))}</span><span class="${ssrRenderClass([`tx-status--${tx.status}`, "tx-status"])}" data-v-64cb10da${_scopeId3}><span class="tx-status__dot" data-v-64cb10da${_scopeId3}></span> ${ssrInterpolate(tx.status_display || tx.status)}</span></div>`);
                          } else {
                            return [
                              createVNode("div", { class: "tx-item__left" }, [
                                createVNode("div", {
                                  class: ["tx-item__avatar", `tx-item__avatar--${tx.id % 4}`]
                                }, toDisplayString((tx.cashier_name || "?").charAt(0).toUpperCase()), 3),
                                createVNode("div", { class: "tx-item__info" }, [
                                  createVNode("div", { class: "tx-item__top" }, [
                                    createVNode("span", { class: "tx-item__number" }, toDisplayString(tx.transaction_number), 1),
                                    createVNode("span", { class: "tx-chip tx-chip--method" }, toDisplayString(tx.payment_method_display || tx.payment_method), 1),
                                    createVNode("span", { class: "tx-chip tx-chip--items" }, toDisplayString(tx.items_count || 0) + " items", 1)
                                  ]),
                                  createVNode("p", { class: "tx-item__meta" }, toDisplayString(tx.cashier_name || "Unknown") + " · " + toDisplayString(tx.customer_name || "Walk-in") + " · " + toDisplayString(formatTxDate(tx.created_at)), 1),
                                  tx.branch_name ? (openBlock(), createBlock("p", {
                                    key: 0,
                                    class: "tx-item__branch"
                                  }, [
                                    createVNode(VIcon, { size: "11" }, {
                                      default: withCtx(() => [
                                        createTextVNode("mdi-store-outline")
                                      ]),
                                      _: 1
                                    }),
                                    createTextVNode(" " + toDisplayString(tx.branch_name), 1)
                                  ])) : createCommentVNode("", true)
                                ])
                              ]),
                              createVNode("div", { class: "tx-item__right" }, [
                                createVNode("span", { class: "tx-item__total" }, toDisplayString(formatMoney(tx.total)), 1),
                                createVNode("span", {
                                  class: ["tx-status", `tx-status--${tx.status}`]
                                }, [
                                  createVNode("span", { class: "tx-status__dot" }),
                                  createTextVNode(" " + toDisplayString(tx.status_display || tx.status), 1)
                                ], 2)
                              ])
                            ];
                          }
                        }),
                        _: 2
                      }, _parent3, _scopeId2));
                    });
                    _push3(`<!--]--></div>`);
                  }
                } else {
                  return [
                    !__props.transactions.length && !__props.loading ? (openBlock(), createBlock(_component_DashboardEmptyState, {
                      key: 0,
                      icon: "mdi-receipt-text-outline",
                      title: "No transactions yet"
                    })) : __props.loading ? (openBlock(), createBlock(VSkeletonLoader, {
                      key: 1,
                      type: "list-item-three-line@6",
                      boilerplate: ""
                    })) : (openBlock(), createBlock("div", {
                      key: 2,
                      class: "tx-list"
                    }, [
                      (openBlock(true), createBlock(Fragment, null, renderList(__props.transactions, (tx) => {
                        return openBlock(), createBlock(_component_NuxtLink, {
                          key: tx.id,
                          to: `/sales/${tx.id}`,
                          class: "tx-item"
                        }, {
                          default: withCtx(() => [
                            createVNode("div", { class: "tx-item__left" }, [
                              createVNode("div", {
                                class: ["tx-item__avatar", `tx-item__avatar--${tx.id % 4}`]
                              }, toDisplayString((tx.cashier_name || "?").charAt(0).toUpperCase()), 3),
                              createVNode("div", { class: "tx-item__info" }, [
                                createVNode("div", { class: "tx-item__top" }, [
                                  createVNode("span", { class: "tx-item__number" }, toDisplayString(tx.transaction_number), 1),
                                  createVNode("span", { class: "tx-chip tx-chip--method" }, toDisplayString(tx.payment_method_display || tx.payment_method), 1),
                                  createVNode("span", { class: "tx-chip tx-chip--items" }, toDisplayString(tx.items_count || 0) + " items", 1)
                                ]),
                                createVNode("p", { class: "tx-item__meta" }, toDisplayString(tx.cashier_name || "Unknown") + " · " + toDisplayString(tx.customer_name || "Walk-in") + " · " + toDisplayString(formatTxDate(tx.created_at)), 1),
                                tx.branch_name ? (openBlock(), createBlock("p", {
                                  key: 0,
                                  class: "tx-item__branch"
                                }, [
                                  createVNode(VIcon, { size: "11" }, {
                                    default: withCtx(() => [
                                      createTextVNode("mdi-store-outline")
                                    ]),
                                    _: 1
                                  }),
                                  createTextVNode(" " + toDisplayString(tx.branch_name), 1)
                                ])) : createCommentVNode("", true)
                              ])
                            ]),
                            createVNode("div", { class: "tx-item__right" }, [
                              createVNode("span", { class: "tx-item__total" }, toDisplayString(formatMoney(tx.total)), 1),
                              createVNode("span", {
                                class: ["tx-status", `tx-status--${tx.status}`]
                              }, [
                                createVNode("span", { class: "tx-status__dot" }),
                                createTextVNode(" " + toDisplayString(tx.status_display || tx.status), 1)
                              ], 2)
                            ])
                          ]),
                          _: 2
                        }, 1032, ["to"]);
                      }), 128))
                    ]))
                  ];
                }
              }),
              _: 1
            }, _parent2, _scopeId));
          } else {
            return [
              createVNode("div", { class: "tx-card__header" }, [
                createVNode(_component_GradientIcon, {
                  icon: "mdi-receipt-text-clock",
                  color: "teal"
                }),
                createVNode("div", { class: "tx-card__titles" }, [
                  createVNode("h3", { class: "tx-card__title" }, "Recent Transactions"),
                  createVNode("p", { class: "tx-card__subtitle" }, "Latest sales activity")
                ]),
                createVNode(VBtn, {
                  variant: "text",
                  size: "x-small",
                  class: "ml-auto",
                  to: "/sales",
                  "prepend-icon": "mdi-arrow-right"
                }, {
                  default: withCtx(() => [
                    createTextVNode(" View All ")
                  ]),
                  _: 1
                })
              ]),
              createVNode(VCardText, { class: "tx-card__body" }, {
                default: withCtx(() => [
                  !__props.transactions.length && !__props.loading ? (openBlock(), createBlock(_component_DashboardEmptyState, {
                    key: 0,
                    icon: "mdi-receipt-text-outline",
                    title: "No transactions yet"
                  })) : __props.loading ? (openBlock(), createBlock(VSkeletonLoader, {
                    key: 1,
                    type: "list-item-three-line@6",
                    boilerplate: ""
                  })) : (openBlock(), createBlock("div", {
                    key: 2,
                    class: "tx-list"
                  }, [
                    (openBlock(true), createBlock(Fragment, null, renderList(__props.transactions, (tx) => {
                      return openBlock(), createBlock(_component_NuxtLink, {
                        key: tx.id,
                        to: `/sales/${tx.id}`,
                        class: "tx-item"
                      }, {
                        default: withCtx(() => [
                          createVNode("div", { class: "tx-item__left" }, [
                            createVNode("div", {
                              class: ["tx-item__avatar", `tx-item__avatar--${tx.id % 4}`]
                            }, toDisplayString((tx.cashier_name || "?").charAt(0).toUpperCase()), 3),
                            createVNode("div", { class: "tx-item__info" }, [
                              createVNode("div", { class: "tx-item__top" }, [
                                createVNode("span", { class: "tx-item__number" }, toDisplayString(tx.transaction_number), 1),
                                createVNode("span", { class: "tx-chip tx-chip--method" }, toDisplayString(tx.payment_method_display || tx.payment_method), 1),
                                createVNode("span", { class: "tx-chip tx-chip--items" }, toDisplayString(tx.items_count || 0) + " items", 1)
                              ]),
                              createVNode("p", { class: "tx-item__meta" }, toDisplayString(tx.cashier_name || "Unknown") + " · " + toDisplayString(tx.customer_name || "Walk-in") + " · " + toDisplayString(formatTxDate(tx.created_at)), 1),
                              tx.branch_name ? (openBlock(), createBlock("p", {
                                key: 0,
                                class: "tx-item__branch"
                              }, [
                                createVNode(VIcon, { size: "11" }, {
                                  default: withCtx(() => [
                                    createTextVNode("mdi-store-outline")
                                  ]),
                                  _: 1
                                }),
                                createTextVNode(" " + toDisplayString(tx.branch_name), 1)
                              ])) : createCommentVNode("", true)
                            ])
                          ]),
                          createVNode("div", { class: "tx-item__right" }, [
                            createVNode("span", { class: "tx-item__total" }, toDisplayString(formatMoney(tx.total)), 1),
                            createVNode("span", {
                              class: ["tx-status", `tx-status--${tx.status}`]
                            }, [
                              createVNode("span", { class: "tx-status__dot" }),
                              createTextVNode(" " + toDisplayString(tx.status_display || tx.status), 1)
                            ], 2)
                          ])
                        ]),
                        _: 2
                      }, 1032, ["to"]);
                    }), 128))
                  ]))
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
const _sfc_setup$1 = _sfc_main$1.setup;
_sfc_main$1.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/dashboard/RecentTransactions.vue");
  return _sfc_setup$1 ? _sfc_setup$1(props, ctx) : void 0;
};
const __nuxt_component_7 = /* @__PURE__ */ Object.assign(_export_sfc(_sfc_main$1, [["__scopeId", "data-v-64cb10da"]]), { __name: "DashboardRecentTransactions" });
const fontFamily = '"Segoe UI Variable", Inter, system-ui, sans-serif';
function useChartOptions() {
  const { colors } = useChartTheme();
  const { currency, number } = useFormat();
  const isDark = computed(() => {
    const s = colors.value.surface.split(",").map((v) => Number(v));
    return s.length === 3 && s.reduce((sum, v) => sum + v, 0) / 3 < 128;
  });
  computed(() => isDark.value ? "dark" : "light");
  const baseChart = computed(() => ({
    background: "transparent",
    foreColor: colors.value.foreColor,
    fontFamily,
    toolbar: { show: false },
    animations: { enabled: true }
  }));
  function commonOptions() {
    return {
      chart: { ...baseChart.value },
      theme: { mode: isDark.value ? "dark" : "light" },
      dataLabels: { enabled: false },
      grid: {
        borderColor: colors.value.grid,
        strokeDashArray: 4
      },
      legend: {
        position: "top",
        horizontalAlign: "right",
        fontSize: "12px",
        labels: { colors: colors.value.foreColor },
        markers: { size: 4, strokeWidth: 0 }
      }
    };
  }
  function areaOptions(opts = {}) {
    const c = colors.value;
    const strokeColors = opts.colors || [c.primary];
    return {
      chart: { type: "area", ...baseChart.value, toolbar: { show: false } },
      colors: strokeColors,
      stroke: { curve: "smooth", width: 2.5 },
      fill: {
        type: "gradient",
        gradient: {
          shadeIntensity: 1,
          type: "vertical",
          gradientToColors: strokeColors,
          opacityFrom: 0.4,
          opacityTo: 0.05,
          stops: [0, 100]
        }
      },
      dataLabels: { enabled: false },
      grid: {
        borderColor: c.grid,
        strokeDashArray: 4,
        padding: { left: 10, right: 10 }
      },
      xaxis: {
        type: opts.xaxisType || "datetime",
        labels: {
          style: { colors: c.foreColor, fontSize: "11px" },
          format: opts.monthly ? "MMM yy" : "dd MMM",
          datetimeFormatter: opts.monthly ? { year: "yyyy", month: "MMM 'yy", day: "dd MMM" } : { year: "yyyy", month: "MMM", day: "dd MMM" }
        },
        axisBorder: { show: false },
        axisTicks: { show: false }
      },
      yaxis: {
        decimalsInFloat: 0,
        labels: {
          style: { colors: c.foreColor },
          formatter: opts.yaxisFormatter || ((v) => Math.round(v).toLocaleString("en-GB"))
        }
      },
      tooltip: {
        theme: isDark.value ? "dark" : "light",
        y: { formatter: opts.tooltipFormatter || ((v) => currency(v)) }
      }
    };
  }
  function barOptions(opts = {}) {
    const c = colors.value;
    const valueFormatter = opts.valueFormatter || ((v) => currency(v));
    return {
      chart: { type: "bar", ...baseChart.value, toolbar: { show: false } },
      colors: [opts.color || c.primary],
      plotOptions: {
        bar: {
          borderRadius: 6,
          horizontal: opts.horizontal ?? true,
          barHeight: "70%",
          columnWidth: opts.horizontal ? void 0 : "55%"
        }
      },
      dataLabels: { enabled: false },
      grid: {
        borderColor: c.grid,
        xaxis: { lines: { show: true } },
        yaxis: { lines: { show: false } }
      },
      xaxis: {
        categories: opts.categories || [],
        labels: {
          style: { colors: c.foreColor, fontSize: "11px" },
          formatter: valueFormatter
        }
      },
      yaxis: {
        labels: {
          style: { colors: c.foreColor },
          formatter: (v) => String(v)
        }
      },
      tooltip: {
        theme: isDark.value ? "dark" : "light",
        x: { formatter: valueFormatter },
        y: { formatter: opts.tooltipFormatter || ((v) => currency(v)) }
      }
    };
  }
  function donutOptions(opts = {}) {
    const c = colors.value;
    return {
      chart: { type: "donut", ...baseChart.value },
      labels: opts.labels || [],
      colors: opts.colors || useChartTheme().palette.value,
      legend: {
        position: "bottom",
        fontSize: "13px",
        labels: { colors: c.foreColor }
      },
      dataLabels: {
        enabled: true,
        formatter: (val) => `${val.toFixed(0)}%`,
        style: { colors: [c.foreColor] }
      },
      tooltip: {
        theme: isDark.value ? "dark" : "light",
        y: { formatter: opts.tooltipFormatter || ((v) => currency(v)) }
      },
      stroke: { width: 2, colors: [`rgb(${c.surface})`] },
      plotOptions: {
        pie: {
          donut: {
            size: "65%",
            labels: {
              show: false
            }
          }
        }
      }
    };
  }
  function heatmapOptions(opts = {}) {
    const c = colors.value;
    const primary = c.primary;
    const defaultScale = [
      { from: 0, to: 0, color: `rgba(${primary}, 0.06)`, name: "No sales" },
      { from: 0.1, to: 1e3, color: `rgba(${primary}, 0.25)`, name: "Low" },
      { from: 1001, to: 3e3, color: `rgba(${primary}, 0.45)`, name: "Moderate" },
      { from: 3001, to: 6e3, color: `rgba(${primary}, 0.7)`, name: "Busy" },
      { from: 6001, to: 1e5, color: `rgba(${primary}, 0.95)`, name: "Peak" }
    ];
    return {
      chart: { type: "heatmap", ...baseChart.value, toolbar: { show: false } },
      colors: [`rgb(${primary})`],
      dataLabels: { enabled: false },
      xaxis: {
        type: "category",
        labels: { style: { colors: c.foreColor, fontSize: "10px" } },
        axisBorder: { show: false },
        axisTicks: { show: false }
      },
      yaxis: {
        reversed: true,
        labels: { style: { colors: c.foreColor, fontSize: "11px" } }
      },
      grid: { padding: { right: 20 } },
      plotOptions: {
        heatmap: {
          radius: 3,
          enableShades: false,
          colorScale: { ranges: opts.colorScale || defaultScale }
        }
      },
      legend: {
        show: true,
        position: "bottom",
        fontSize: "11px",
        labels: { colors: c.foreColor },
        markers: { size: 6, strokeWidth: 0 }
      },
      tooltip: {
        theme: isDark.value ? "dark" : "light",
        y: { formatter: opts.tooltipFormatter || ((v) => v === 0 ? "No sales" : currency(v)) }
      }
    };
  }
  return {
    colors,
    commonOptions,
    areaOptions,
    barOptions,
    donutOptions,
    heatmapOptions
  };
}
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "dashboard",
  __ssrInlineRender: true,
  setup(__props) {
    const { currency, datetime, number } = useFormat();
    const toast = useToast();
    const branchStore = useBranchStore();
    const chartOptions = useChartOptions();
    const { areaOptions, barOptions, donutOptions, heatmapOptions } = chartOptions;
    const { colors: chartColors } = useChartTheme();
    function formatMoney(v) {
      return currency(Number(v) || 0);
    }
    const greeting = computed(() => {
      const h = (/* @__PURE__ */ new Date()).getHours();
      if (h < 12) return "Good morning";
      if (h < 17) return "Good afternoon";
      return "Good evening";
    });
    const period = ref("thisMonth");
    const customRange = ref({ from: "", to: "" });
    const isCustom = computed(() => period.value === "custom");
    const periodLabel = computed(() => {
      if (isCustom.value) {
        const r = resolveRange("custom");
        return `${r[0].toLocaleDateString("en-GB", { day: "2-digit", month: "short" })} – ${r[1].toLocaleDateString("en-GB", { day: "2-digit", month: "short" })}`;
      }
      const labels = {
        today: "Today",
        "7d": "Last 7 days",
        "30d": "Last 30 days",
        thisMonth: "This month",
        ytd: "Year to date",
        all: "All time"
      };
      return labels[period.value] || "This month";
    });
    function resolveRange(key) {
      const now = /* @__PURE__ */ new Date();
      const end = new Date(now);
      end.setHours(23, 59, 59, 999);
      const start = new Date(now);
      start.setHours(0, 0, 0, 0);
      if (key === "today") return [start, end];
      if (key === "7d") {
        start.setDate(start.getDate() - 7);
        return [start, end];
      }
      if (key === "30d") {
        start.setDate(start.getDate() - 30);
        return [start, end];
      }
      if (key === "thisMonth") {
        start.setDate(1);
        return [start, end];
      }
      if (key === "ytd") {
        start.setMonth(0, 1);
        return [start, end];
      }
      if (key === "all") {
        start.setFullYear(2e3, 0, 1);
        return [start, end];
      }
      if (key === "custom") {
        const s = /* @__PURE__ */ new Date(customRange.value.from + "T00:00:00");
        const e = /* @__PURE__ */ new Date(customRange.value.to + "T23:59:59");
        if (s && e && !isNaN(s.getTime()) && !isNaN(e.getTime())) return [s, e];
        return [start, end];
      }
      return [start, end];
    }
    function applyCustomRange(range) {
      customRange.value = range;
      period.value = "custom";
    }
    const rangeDays = computed(() => {
      const [start, end] = resolveRange(period.value);
      return Math.max(1, Math.ceil((end.getTime() - start.getTime()) / 864e5));
    });
    const isMonthlyGroup = computed(() => rangeDays.value > 90);
    function monthKey(d) {
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    }
    const loading = ref(false);
    const error = ref(false);
    const transactions = ref([]);
    const products = ref([]);
    const lowStockItems = ref([]);
    const lastUpdated = ref(null);
    function branchParam(prefix = "&") {
      return branchStore.branchId ? `${prefix}branch=${branchStore.branchId}` : "";
    }
    const inRange = computed(() => {
      const [start, end] = resolveRange(period.value);
      return transactions.value.filter((t) => {
        const d = new Date(t.created_at);
        return d >= start && d <= end && t.status === "completed";
      });
    });
    const kpis = computed(() => {
      const list = inRange.value;
      const revenue = list.reduce((s, t) => s + Number(t.total), 0);
      const txCount = list.length;
      const items = list.reduce((s, t) => s + (t.items_count || 0), 0);
      const aov = txCount ? revenue / txCount : 0;
      const [pStart, pEnd] = resolveRange(period.value);
      const days = (pEnd.getTime() - pStart.getTime()) / 864e5;
      const prevEnd = new Date(pStart);
      prevEnd.setHours(0, 0, 0, 0);
      const prevStart = new Date(prevEnd);
      prevStart.setDate(prevStart.getDate() - days);
      const prevRev = transactions.value.filter((t) => {
        const d = new Date(t.created_at);
        return d >= prevStart && d < prevEnd && t.status === "completed";
      }).reduce((s, t) => s + Number(t.total), 0);
      const revGrowth = prevRev ? (revenue - prevRev) / prevRev * 100 : 0;
      const stockItems = products.value.length;
      const stockValue = products.value.reduce((s, p) => s + Number(p.quantity_on_hand || 0) * Number(p.cost_price || 0), 0);
      return { revenue, txCount, items, aov, stockItems, stockValue, revGrowth };
    });
    const grossProfit = computed(() => {
      let cost = 0;
      inRange.value.forEach((t) => {
        (t.items || []).forEach((i) => {
          const prod = products.value.find((p) => p.name === i.product_name);
          cost += Number(i.quantity || 0) * Number(prod?.cost_price || 0);
        });
      });
      return kpis.value.revenue - cost;
    });
    const grossMarginPct = computed(() => kpis.value.revenue ? grossProfit.value / kpis.value.revenue * 100 : 0);
    const inventoryTurnover = computed(() => {
      const cogs = inRange.value.reduce((s, t) => {
        let txCost = 0;
        (t.items || []).forEach((i) => {
          const prod = products.value.find((p) => p.name === i.product_name);
          txCost += Number(i.quantity || 0) * Number(prod?.cost_price || 0);
        });
        return s + txCost;
      }, 0);
      const avgInventory = kpis.value.stockValue;
      return avgInventory > 0 ? cogs / avgInventory : 0;
    });
    const inventoryTurnoverDays = computed(() => {
      const turnover = inventoryTurnover.value;
      if (turnover <= 0) return 0;
      return rangeDays.value / turnover;
    });
    const sparklineSeries = computed(() => {
      const monthly = isMonthlyGroup.value;
      const map = /* @__PURE__ */ new Map();
      for (const t of inRange.value) {
        const d = new Date(t.created_at);
        const key = monthly ? monthKey(d) : d.toISOString().slice(0, 10);
        map.set(key, (map.get(key) || 0) + Number(t.total));
      }
      const keys = [...map.keys()].sort((a, b) => a.localeCompare(b));
      return [{ name: "Revenue", data: keys.map((k) => map.get(k) || 0) }];
    });
    const revenueSeries = computed(() => {
      const monthly = isMonthlyGroup.value;
      const revMap = /* @__PURE__ */ new Map();
      const costMap = /* @__PURE__ */ new Map();
      for (const t of inRange.value) {
        const d = new Date(t.created_at);
        const key = monthly ? monthKey(d) : d.toISOString().slice(0, 10);
        revMap.set(key, (revMap.get(key) || 0) + Number(t.total));
        let txCost = 0;
        for (const item of t.items || []) {
          const prod = products.value.find((p) => p.name === item.product_name);
          txCost += Number(item.quantity || 0) * Number(prod?.cost_price || 0);
        }
        costMap.set(key, (costMap.get(key) || 0) + txCost);
      }
      const keys = [.../* @__PURE__ */ new Set([...revMap.keys(), ...costMap.keys()])].sort((a, b) => a.localeCompare(b));
      return [
        { name: "Revenue", data: keys.map((k) => ({ x: k, y: revMap.get(k) || 0 })) },
        { name: "Cost", data: keys.map((k) => ({ x: k, y: costMap.get(k) || 0 })) },
        { name: "Profit", data: keys.map((k) => ({ x: k, y: (revMap.get(k) || 0) - (costMap.get(k) || 0) })) }
      ];
    });
    const revenueOptions = computed(
      () => areaOptions({
        colors: [`rgb(${chartColors.value.primary})`, `rgb(${chartColors.value.error})`, `rgb(${chartColors.value.success})`],
        monthly: isMonthlyGroup.value
      })
    );
    const paymentMap = computed(() => {
      const map = {};
      inRange.value.forEach((t) => {
        map[t.payment_method] = (map[t.payment_method] || 0) + Number(t.total);
      });
      return map;
    });
    const paymentSeries = computed(() => Object.values(paymentMap.value));
    const paymentOptions = computed(() => donutOptions({ labels: Object.keys(paymentMap.value) }));
    const topProductsData = computed(() => {
      const map = {};
      inRange.value.forEach((t) => (t.items || []).forEach((i) => {
        map[i.product_name] = (map[i.product_name] || 0) + Number(i.line_total);
      }));
      return Object.entries(map).sort((a, b) => b[1] - a[1]).slice(0, 10);
    });
    const topProductsSeries = computed(() => [{ name: "Revenue", data: topProductsData.value.map((e) => e[1]) }]);
    const topProductsOptions = computed(
      () => barOptions({
        color: `rgb(${chartColors.value.primary})`,
        horizontal: true,
        categories: topProductsData.value.map((e) => e[0])
      })
    );
    const categoryMap = computed(() => {
      const map = {};
      inRange.value.forEach((t) => (t.items || []).forEach((i) => {
        const cat = i.category_name || "Uncategorized";
        map[cat] = (map[cat] || 0) + Number(i.line_total);
      }));
      return map;
    });
    const categorySeries = computed(() => Object.values(categoryMap.value));
    const categoryOptions = computed(() => donutOptions({ labels: Object.keys(categoryMap.value) }));
    const heatmapSeries = computed(() => {
      const now = /* @__PURE__ */ new Date();
      const months = [];
      for (let i = 5; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        months.push({ label: d.toLocaleDateString("en-GB", { month: "short" }), year: d.getFullYear(), month: d.getMonth() });
      }
      return months.map((m) => {
        const days = [];
        const daysInMonth = new Date(m.year, m.month + 1, 0).getDate();
        for (let day = 1; day <= daysInMonth; day++) {
          const dStr = `${m.year}-${String(m.month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
          const total = transactions.value.filter((t) => {
            const td = new Date(t.created_at);
            return td.toISOString().slice(0, 10) === dStr && t.status === "completed";
          }).reduce((s, t) => s + Number(t.total), 0);
          days.push({ x: String(day), y: Math.round(total) });
        }
        return { name: m.label, data: days };
      });
    });
    const heatmapChartOptions = computed(() => heatmapOptions());
    const recentTransactions = computed(() => {
      return [...inRange.value].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).slice(0, 8);
    });
    async function loadData() {
      if (loading.value) return;
      loading.value = true;
      error.value = false;
      try {
        const [txData, prodData, lowStockData] = await Promise.all([
          useApi()(`/pos/transactions/?page_size=2000${branchParam()}`),
          useApi()(`/products/?page_size=500${branchParam()}`).catch(() => ({ results: [] })),
          useApi()(`/reports/low-stock/${branchParam("?")}`).catch(() => [])
        ]);
        transactions.value = txData.results || txData;
        products.value = prodData.results || prodData;
        lowStockItems.value = lowStockData || [];
        lastUpdated.value = (/* @__PURE__ */ new Date()).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
      } catch (e) {
        error.value = true;
        toast.error("Failed to load dashboard data");
      } finally {
        loading.value = false;
      }
    }
    watch([() => branchStore.branchId, () => period.value], () => {
      loadData();
    });
    function exportCSV() {
      const rows = inRange.value;
      if (!rows.length) {
        toast.warning("No transactions to export");
        return;
      }
      const header = ["Transaction #", "Date", "Cashier", "Customer", "Branch", "Payment Method", "Subtotal", "Discount", "Tax", "Total", "Items", "Status"];
      const csvRows = rows.map((t) => [
        t.transaction_number || "",
        new Date(t.created_at).toISOString(),
        t.cashier_name || "",
        t.customer_name || "Walk-in",
        t.branch_name || "",
        t.payment_method_display || t.payment_method || "",
        t.subtotal || 0,
        t.discount || 0,
        t.tax || 0,
        t.total || 0,
        t.items_count || 0,
        t.status_display || t.status || ""
      ].map((v) => `"${String(v).replace(/"/g, '""')}"`).join(","));
      const csv = [header.join(","), ...csvRows].join("\n");
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = (void 0).createElement("a");
      link.href = url;
      link.download = `dashboard-export-${period.value}-${(/* @__PURE__ */ new Date()).toISOString().slice(0, 10)}.csv`;
      link.click();
      URL.revokeObjectURL(url);
      toast.success(`Exported ${rows.length} transactions`);
    }
    return (_ctx, _push, _parent, _attrs) => {
      const _component_DashboardPeriodSelector = __nuxt_component_0$1;
      const _component_DashboardErrorState = __nuxt_component_1;
      const _component_DashboardSkeleton = __nuxt_component_2$1;
      const _component_DashboardKpiCard = __nuxt_component_3;
      const _component_DashboardChartCard = __nuxt_component_4;
      const _component_apexchart = resolveComponent("apexchart");
      const _component_DashboardEmptyState = __nuxt_component_5;
      const _component_DashboardLowStockList = __nuxt_component_6;
      const _component_DashboardRecentTransactions = __nuxt_component_7;
      const _component_NuxtLink = __nuxt_component_0$2;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "dash-page" }, _attrs))} data-v-1ce1710b><div class="dash-header" data-v-1ce1710b><div class="dash-header__left" data-v-1ce1710b><div class="dash-header__title-icon" data-v-1ce1710b>`);
      _push(ssrRenderComponent(VIcon, { size: "24" }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`mdi-view-dashboard-outline`);
          } else {
            return [
              createTextVNode("mdi-view-dashboard-outline")
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`</div><div data-v-1ce1710b><h1 class="text-h5 font-weight-bold" data-v-1ce1710b>Dashboard</h1><p class="text-body-2 text-medium-emphasis" data-v-1ce1710b>${ssrInterpolate(unref(greeting))} — here&#39;s your store at a glance</p></div></div><div class="dash-header__actions" data-v-1ce1710b><div class="dash-header__branch d-none d-md-flex align-center" data-v-1ce1710b>`);
      _push(ssrRenderComponent(VIcon, {
        size: "16",
        color: "medium-emphasis",
        class: "mr-1"
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`mdi-store-outline`);
          } else {
            return [
              createTextVNode("mdi-store-outline")
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`<span class="text-caption text-medium-emphasis" data-v-1ce1710b>${ssrInterpolate(unref(branchStore).branchName)}</span></div>`);
      _push(ssrRenderComponent(_component_DashboardPeriodSelector, {
        modelValue: unref(period),
        "onUpdate:modelValue": ($event) => isRef(period) ? period.value = $event : null,
        onCustom: applyCustomRange
      }, null, _parent));
      _push(ssrRenderComponent(VBtn, {
        variant: "tonal",
        "prepend-icon": "mdi-refresh",
        size: "small",
        loading: unref(loading),
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
      _push(ssrRenderComponent(VBtn, {
        variant: "outlined",
        "prepend-icon": "mdi-download",
        size: "small",
        onClick: exportCSV
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`Export`);
          } else {
            return [
              createTextVNode("Export")
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`</div></div>`);
      if (unref(lastUpdated) && !unref(loading)) {
        _push(`<div class="dash-last-updated text-caption text-medium-emphasis" data-v-1ce1710b> Last updated: ${ssrInterpolate(unref(lastUpdated))}</div>`);
      } else {
        _push(`<!---->`);
      }
      if (unref(error) && !unref(loading)) {
        _push(ssrRenderComponent(_component_DashboardErrorState, {
          "on-retry": loadData,
          class: "mb-6"
        }, null, _parent));
      } else {
        _push(`<!---->`);
      }
      if (unref(loading) && unref(transactions).length === 0) {
        _push(ssrRenderComponent(_component_DashboardSkeleton, null, null, _parent));
      } else if (!unref(error)) {
        _push(`<!--[--><div class="dash-kpi-grid" data-v-1ce1710b>`);
        _push(ssrRenderComponent(_component_DashboardKpiCard, {
          class: "dash-animate dash-animate--1",
          icon: "mdi-cash-multiple",
          label: "Revenue",
          value: unref(kpis).revenue,
          format: "currency",
          color: "success",
          trend: unref(kpis).revGrowth,
          "sparkline-series": unref(sparklineSeries),
          to: "/sales"
        }, null, _parent));
        _push(ssrRenderComponent(_component_DashboardKpiCard, {
          class: "dash-animate dash-animate--2",
          icon: "mdi-receipt-text-outline",
          label: "Transactions",
          value: unref(kpis).txCount,
          format: "number",
          color: "primary",
          subtext: `${unref(number)(unref(kpis).items)} items sold`,
          to: "/sales"
        }, null, _parent));
        _push(ssrRenderComponent(_component_DashboardKpiCard, {
          class: "dash-animate dash-animate--3",
          icon: "mdi-chart-line",
          label: "Avg. Order Value",
          value: unref(kpis).aov,
          format: "currency",
          color: "info",
          subtext: "per transaction",
          to: "/sales"
        }, null, _parent));
        _push(ssrRenderComponent(_component_DashboardKpiCard, {
          class: "dash-animate dash-animate--4",
          icon: "mdi-package-variant",
          label: "Stock Value",
          value: unref(kpis).stockValue,
          format: "currency",
          color: "teal",
          subtext: `${unref(number)(unref(kpis).stockItems)} SKUs`,
          to: "/inventory/stock"
        }, null, _parent));
        _push(ssrRenderComponent(_component_DashboardKpiCard, {
          class: "dash-animate dash-animate--5",
          icon: "mdi-percent-circle",
          label: "Gross Margin",
          value: unref(grossMarginPct),
          format: "percent",
          decimals: 1,
          color: "secondary",
          subtext: `${formatMoney(unref(grossProfit))} profit`,
          to: "/reports"
        }, null, _parent));
        _push(ssrRenderComponent(_component_DashboardKpiCard, {
          class: "dash-animate dash-animate--6",
          icon: "mdi-swap-horizontal",
          label: "Inventory Turnover",
          value: unref(inventoryTurnover),
          decimals: 2,
          color: "warning",
          subtext: `${unref(inventoryTurnoverDays).toFixed(0)} days to sell`,
          to: "/inventory/stock-analysis"
        }, null, _parent));
        _push(`</div><div class="dash-chart-row dash-chart-row--wide dash-animate dash-animate--2" data-v-1ce1710b>`);
        _push(ssrRenderComponent(_component_DashboardChartCard, {
          icon: "mdi-chart-areaspline",
          title: "Revenue Trend",
          subtitle: `Daily revenue — ${unref(periodLabel)}`,
          color: "primary",
          to: "/analytics"
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              if (unref(revenueSeries)[0].data.length) {
                _push2(ssrRenderComponent(_component_apexchart, {
                  type: "area",
                  height: "300",
                  options: unref(revenueOptions),
                  series: unref(revenueSeries)
                }, null, _parent2, _scopeId));
              } else {
                _push2(ssrRenderComponent(_component_DashboardEmptyState, {
                  icon: "mdi-chart-areaspline",
                  title: "No revenue data for this period"
                }, null, _parent2, _scopeId));
              }
            } else {
              return [
                unref(revenueSeries)[0].data.length ? (openBlock(), createBlock(_component_apexchart, {
                  key: 0,
                  type: "area",
                  height: "300",
                  options: unref(revenueOptions),
                  series: unref(revenueSeries)
                }, null, 8, ["options", "series"])) : (openBlock(), createBlock(_component_DashboardEmptyState, {
                  key: 1,
                  icon: "mdi-chart-areaspline",
                  title: "No revenue data for this period"
                }))
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(ssrRenderComponent(_component_DashboardChartCard, {
          icon: "mdi-chart-donut",
          title: "Payment Methods",
          subtitle: "Revenue by payment type",
          color: "success",
          to: "/reports"
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              if (unref(paymentSeries).length) {
                _push2(ssrRenderComponent(_component_apexchart, {
                  type: "donut",
                  height: "300",
                  options: unref(paymentOptions),
                  series: unref(paymentSeries)
                }, null, _parent2, _scopeId));
              } else {
                _push2(ssrRenderComponent(_component_DashboardEmptyState, {
                  icon: "mdi-chart-donut",
                  title: "No payment data yet"
                }, null, _parent2, _scopeId));
              }
            } else {
              return [
                unref(paymentSeries).length ? (openBlock(), createBlock(_component_apexchart, {
                  key: 0,
                  type: "donut",
                  height: "300",
                  options: unref(paymentOptions),
                  series: unref(paymentSeries)
                }, null, 8, ["options", "series"])) : (openBlock(), createBlock(_component_DashboardEmptyState, {
                  key: 1,
                  icon: "mdi-chart-donut",
                  title: "No payment data yet"
                }))
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(`</div><div class="dash-chart-row dash-animate dash-animate--3" data-v-1ce1710b>`);
        _push(ssrRenderComponent(_component_DashboardChartCard, {
          icon: "mdi-trophy-award",
          title: "Top 10 Products",
          subtitle: "Best sellers by revenue",
          color: "indigo",
          to: "/analytics/products"
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              if (unref(topProductsSeries)[0].data.length) {
                _push2(ssrRenderComponent(_component_apexchart, {
                  type: "bar",
                  height: "300",
                  options: unref(topProductsOptions),
                  series: unref(topProductsSeries)
                }, null, _parent2, _scopeId));
              } else {
                _push2(ssrRenderComponent(_component_DashboardEmptyState, {
                  icon: "mdi-trophy-outline",
                  title: "No product sales yet"
                }, null, _parent2, _scopeId));
              }
            } else {
              return [
                unref(topProductsSeries)[0].data.length ? (openBlock(), createBlock(_component_apexchart, {
                  key: 0,
                  type: "bar",
                  height: "300",
                  options: unref(topProductsOptions),
                  series: unref(topProductsSeries)
                }, null, 8, ["options", "series"])) : (openBlock(), createBlock(_component_DashboardEmptyState, {
                  key: 1,
                  icon: "mdi-trophy-outline",
                  title: "No product sales yet"
                }))
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(ssrRenderComponent(_component_DashboardChartCard, {
          icon: "mdi-chart-pie",
          title: "Sales by Category",
          subtitle: "Revenue distribution",
          color: "amber",
          to: "/analytics/categories"
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              if (unref(categorySeries).length) {
                _push2(ssrRenderComponent(_component_apexchart, {
                  type: "donut",
                  height: "300",
                  options: unref(categoryOptions),
                  series: unref(categorySeries)
                }, null, _parent2, _scopeId));
              } else {
                _push2(ssrRenderComponent(_component_DashboardEmptyState, {
                  icon: "mdi-chart-arc",
                  title: "No category data yet"
                }, null, _parent2, _scopeId));
              }
            } else {
              return [
                unref(categorySeries).length ? (openBlock(), createBlock(_component_apexchart, {
                  key: 0,
                  type: "donut",
                  height: "300",
                  options: unref(categoryOptions),
                  series: unref(categorySeries)
                }, null, 8, ["options", "series"])) : (openBlock(), createBlock(_component_DashboardEmptyState, {
                  key: 1,
                  icon: "mdi-chart-arc",
                  title: "No category data yet"
                }))
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(`</div><div class="dash-chart-row dash-chart-row--full dash-animate dash-animate--4" data-v-1ce1710b>`);
        _push(ssrRenderComponent(_component_DashboardChartCard, {
          icon: "mdi-calendar-blank-multiple",
          title: "Sales Activity",
          subtitle: "Daily revenue intensity (last 6 months)",
          color: "secondary",
          to: "/analytics"
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              if (unref(heatmapSeries).length) {
                _push2(ssrRenderComponent(_component_apexchart, {
                  type: "heatmap",
                  height: "280",
                  options: unref(heatmapChartOptions),
                  series: unref(heatmapSeries)
                }, null, _parent2, _scopeId));
              } else {
                _push2(ssrRenderComponent(_component_DashboardEmptyState, {
                  icon: "mdi-calendar-blank",
                  title: "No activity data yet"
                }, null, _parent2, _scopeId));
              }
            } else {
              return [
                unref(heatmapSeries).length ? (openBlock(), createBlock(_component_apexchart, {
                  key: 0,
                  type: "heatmap",
                  height: "280",
                  options: unref(heatmapChartOptions),
                  series: unref(heatmapSeries)
                }, null, 8, ["options", "series"])) : (openBlock(), createBlock(_component_DashboardEmptyState, {
                  key: 1,
                  icon: "mdi-calendar-blank",
                  title: "No activity data yet"
                }))
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(`</div><div class="dash-bottom-row dash-animate dash-animate--5" data-v-1ce1710b>`);
        _push(ssrRenderComponent(_component_DashboardLowStockList, {
          items: unref(lowStockItems),
          loading: unref(loading),
          class: "dash-bottom-row__list"
        }, null, _parent));
        _push(ssrRenderComponent(_component_DashboardRecentTransactions, {
          transactions: unref(recentTransactions),
          loading: unref(loading),
          class: "dash-bottom-row__list"
        }, null, _parent));
        _push(`</div><div class="dash-quick-actions dash-animate dash-animate--6" data-v-1ce1710b><div class="dash-quick-actions__title" data-v-1ce1710b>`);
        _push(ssrRenderComponent(VIcon, {
          size: "18",
          icon: "mdi-lightning-bolt"
        }, null, _parent));
        _push(` Quick Actions </div><div class="dash-quick-actions__grid" data-v-1ce1710b>`);
        _push(ssrRenderComponent(_component_NuxtLink, {
          to: "/pos",
          class: "qa-card qa-card--pos"
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`<div class="qa-card__icon" data-v-1ce1710b${_scopeId}>`);
              _push2(ssrRenderComponent(VIcon, {
                size: "22",
                icon: "mdi-cash-register"
              }, null, _parent2, _scopeId));
              _push2(`</div><div class="qa-card__label" data-v-1ce1710b${_scopeId}>New Sale</div><div class="qa-card__desc" data-v-1ce1710b${_scopeId}>Open POS register</div>`);
            } else {
              return [
                createVNode("div", { class: "qa-card__icon" }, [
                  createVNode(VIcon, {
                    size: "22",
                    icon: "mdi-cash-register"
                  })
                ]),
                createVNode("div", { class: "qa-card__label" }, "New Sale"),
                createVNode("div", { class: "qa-card__desc" }, "Open POS register")
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(ssrRenderComponent(_component_NuxtLink, {
          to: "/products",
          class: "qa-card qa-card--products"
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`<div class="qa-card__icon" data-v-1ce1710b${_scopeId}>`);
              _push2(ssrRenderComponent(VIcon, {
                size: "22",
                icon: "mdi-package-variant-closed"
              }, null, _parent2, _scopeId));
              _push2(`</div><div class="qa-card__label" data-v-1ce1710b${_scopeId}>Add Product</div><div class="qa-card__desc" data-v-1ce1710b${_scopeId}>Manage stock items</div>`);
            } else {
              return [
                createVNode("div", { class: "qa-card__icon" }, [
                  createVNode(VIcon, {
                    size: "22",
                    icon: "mdi-package-variant-closed"
                  })
                ]),
                createVNode("div", { class: "qa-card__label" }, "Add Product"),
                createVNode("div", { class: "qa-card__desc" }, "Manage stock items")
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(ssrRenderComponent(_component_NuxtLink, {
          to: "/pos/history",
          class: "qa-card qa-card--history"
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`<div class="qa-card__icon" data-v-1ce1710b${_scopeId}>`);
              _push2(ssrRenderComponent(VIcon, {
                size: "22",
                icon: "mdi-receipt-text-outline"
              }, null, _parent2, _scopeId));
              _push2(`</div><div class="qa-card__label" data-v-1ce1710b${_scopeId}>Sales History</div><div class="qa-card__desc" data-v-1ce1710b${_scopeId}>View past sales</div>`);
            } else {
              return [
                createVNode("div", { class: "qa-card__icon" }, [
                  createVNode(VIcon, {
                    size: "22",
                    icon: "mdi-receipt-text-outline"
                  })
                ]),
                createVNode("div", { class: "qa-card__label" }, "Sales History"),
                createVNode("div", { class: "qa-card__desc" }, "View past sales")
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(ssrRenderComponent(_component_NuxtLink, {
          to: "/customers",
          class: "qa-card qa-card--customers"
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`<div class="qa-card__icon" data-v-1ce1710b${_scopeId}>`);
              _push2(ssrRenderComponent(VIcon, {
                size: "22",
                icon: "mdi-account-plus-outline"
              }, null, _parent2, _scopeId));
              _push2(`</div><div class="qa-card__label" data-v-1ce1710b${_scopeId}>New Customer</div><div class="qa-card__desc" data-v-1ce1710b${_scopeId}>Add or manage</div>`);
            } else {
              return [
                createVNode("div", { class: "qa-card__icon" }, [
                  createVNode(VIcon, {
                    size: "22",
                    icon: "mdi-account-plus-outline"
                  })
                ]),
                createVNode("div", { class: "qa-card__label" }, "New Customer"),
                createVNode("div", { class: "qa-card__desc" }, "Add or manage")
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(ssrRenderComponent(_component_NuxtLink, {
          to: "/products?tab=products",
          class: "qa-card qa-card--inventory"
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`<div class="qa-card__icon" data-v-1ce1710b${_scopeId}>`);
              _push2(ssrRenderComponent(VIcon, {
                size: "22",
                icon: "mdi-clipboard-list-outline"
              }, null, _parent2, _scopeId));
              _push2(`</div><div class="qa-card__label" data-v-1ce1710b${_scopeId}>Inventory</div><div class="qa-card__desc" data-v-1ce1710b${_scopeId}>Stock levels</div>`);
            } else {
              return [
                createVNode("div", { class: "qa-card__icon" }, [
                  createVNode(VIcon, {
                    size: "22",
                    icon: "mdi-clipboard-list-outline"
                  })
                ]),
                createVNode("div", { class: "qa-card__label" }, "Inventory"),
                createVNode("div", { class: "qa-card__desc" }, "Stock levels")
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(ssrRenderComponent(_component_NuxtLink, {
          to: "/analytics",
          class: "qa-card qa-card--reports"
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`<div class="qa-card__icon" data-v-1ce1710b${_scopeId}>`);
              _push2(ssrRenderComponent(VIcon, {
                size: "22",
                icon: "mdi-chart-box-outline"
              }, null, _parent2, _scopeId));
              _push2(`</div><div class="qa-card__label" data-v-1ce1710b${_scopeId}>Analytics</div><div class="qa-card__desc" data-v-1ce1710b${_scopeId}>Insights and trends</div>`);
            } else {
              return [
                createVNode("div", { class: "qa-card__icon" }, [
                  createVNode(VIcon, {
                    size: "22",
                    icon: "mdi-chart-box-outline"
                  })
                ]),
                createVNode("div", { class: "qa-card__label" }, "Analytics"),
                createVNode("div", { class: "qa-card__desc" }, "Insights and trends")
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(ssrRenderComponent(_component_NuxtLink, {
          to: "/pos/parked",
          class: "qa-card qa-card--parked"
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`<div class="qa-card__icon" data-v-1ce1710b${_scopeId}>`);
              _push2(ssrRenderComponent(VIcon, {
                size: "22",
                icon: "mdi-pause-circle-outline"
              }, null, _parent2, _scopeId));
              _push2(`</div><div class="qa-card__label" data-v-1ce1710b${_scopeId}>Parked Sales</div><div class="qa-card__desc" data-v-1ce1710b${_scopeId}>Resume held sales</div>`);
            } else {
              return [
                createVNode("div", { class: "qa-card__icon" }, [
                  createVNode(VIcon, {
                    size: "22",
                    icon: "mdi-pause-circle-outline"
                  })
                ]),
                createVNode("div", { class: "qa-card__label" }, "Parked Sales"),
                createVNode("div", { class: "qa-card__desc" }, "Resume held sales")
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(ssrRenderComponent(_component_NuxtLink, {
          to: "/pos/shifts",
          class: "qa-card qa-card--shifts"
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`<div class="qa-card__icon" data-v-1ce1710b${_scopeId}>`);
              _push2(ssrRenderComponent(VIcon, {
                size: "22",
                icon: "mdi-clock-outline"
              }, null, _parent2, _scopeId));
              _push2(`</div><div class="qa-card__label" data-v-1ce1710b${_scopeId}>Shifts</div><div class="qa-card__desc" data-v-1ce1710b${_scopeId}>Open or close shift</div>`);
            } else {
              return [
                createVNode("div", { class: "qa-card__icon" }, [
                  createVNode(VIcon, {
                    size: "22",
                    icon: "mdi-clock-outline"
                  })
                ]),
                createVNode("div", { class: "qa-card__label" }, "Shifts"),
                createVNode("div", { class: "qa-card__desc" }, "Open or close shift")
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(`</div></div><!--]-->`);
      } else {
        _push(`<!---->`);
      }
      _push(`</div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/dashboard.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const dashboard = /* @__PURE__ */ _export_sfc(_sfc_main, [["__scopeId", "data-v-1ce1710b"]]);

export { dashboard as default };
//# sourceMappingURL=dashboard-J-TfgHrN.mjs.map
