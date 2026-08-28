import { g as VCard, b as VSpacer, c as VBtn, a8 as __nuxt_component_1$1, _ as _export_sfc, M as VList, a3 as VTimeline, a4 as VTimelineItem, d as VAlert, a as VIcon, n as VDataTable, a9 as VExpandTransition, e as VRow, f as VCol, o as VChip, y as navigateTo, k as VDivider, N as VListItem, aa as VExpansionPanels, ab as VExpansionPanel, ac as VExpansionPanelTitle, ad as VExpansionPanelText } from "../server.mjs";
import { defineComponent, ref, mergeProps, withCtx, createTextVNode, createVNode, toDisplayString, useSSRContext, computed, unref, openBlock, createBlock, createCommentVNode, Fragment, renderList, withDirectives, vShow, resolveComponent } from "vue";
import { ssrRenderAttrs, ssrRenderComponent, ssrInterpolate, ssrRenderAttr, ssrRenderList, ssrRenderStyle } from "vue/server-renderer";
import { u as useHead } from "./composables-BLSQz38p.js";
import "D:/Projects/MY-APPS-2/DomendraPOS/frontend/node_modules/ofetch/dist/node.mjs";
import "#internal/nuxt/paths";
import "D:/Projects/MY-APPS-2/DomendraPOS/frontend/node_modules/nuxt/node_modules/hookable/dist/index.mjs";
import "D:/Projects/MY-APPS-2/DomendraPOS/frontend/node_modules/unctx/dist/index.mjs";
import "D:/Projects/MY-APPS-2/DomendraPOS/frontend/node_modules/@nuxt/nitro-server/dist/runtime/h3-compat.mjs";
import "D:/Projects/MY-APPS-2/DomendraPOS/frontend/node_modules/ufo/dist/index.mjs";
import "pinia";
import "D:/Projects/MY-APPS-2/DomendraPOS/frontend/node_modules/defu/dist/defu.mjs";
import "vue-router";
import "D:/Projects/MY-APPS-2/DomendraPOS/frontend/node_modules/perfect-debounce/dist/index.mjs";
import "D:/Projects/MY-APPS-2/DomendraPOS/frontend/node_modules/ohash/dist/index.mjs";
import "@vue/shared";
import "D:/Projects/MY-APPS-2/DomendraPOS/frontend/node_modules/klona/dist/index.mjs";
import "vue3-apexcharts";
import "D:/Projects/MY-APPS-2/DomendraPOS/frontend/node_modules/nuxt/node_modules/cookie-es/dist/index.mjs";
import "D:/Projects/MY-APPS-2/DomendraPOS/frontend/node_modules/@unhead/vue/dist/index.mjs";
function useCsvExport() {
  function escapeCell(value) {
    if (value === null || value === void 0) return "";
    let str = typeof value === "string" ? value : String(value);
    if (/["\n\r,]/.test(str)) {
      str = `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  }
  function exportCsv(filename, rows, opts = {}) {
    if (!rows || rows.length === 0) {
      console.warn("[useCsvExport] No rows to export");
      return;
    }
    const delimiter = opts.delimiter || ",";
    const cols = opts.columns || Array.from(rows.reduce((s, r) => {
      Object.keys(r).forEach((k) => s.add(k));
      return s;
    }, /* @__PURE__ */ new Set()));
    const header = cols.map((c) => escapeCell(c)).join(delimiter);
    const body = rows.map((r) => cols.map((c) => escapeCell(r[c])).join(delimiter)).join("\r\n");
    const csv = `${header}\r
${body}`;
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = (void 0).createElement("a");
    a.href = url;
    a.download = filename.endsWith(".csv") ? filename : `${filename}.csv`;
    (void 0).body.appendChild(a);
    a.click();
    (void 0).body.removeChild(a);
    URL.revokeObjectURL(url);
  }
  return { exportCsv, escapeCell };
}
const _sfc_main$5 = /* @__PURE__ */ defineComponent({
  __name: "Snapshot",
  __ssrInlineRender: true,
  props: {
    src: {},
    alt: { default: "Screenshot" },
    label: { default: "Screenshot" }
  },
  setup(__props) {
    const dialog = ref(false);
    function openFull() {
      dialog.value = true;
    }
    async function downloadSvg() {
      return;
    }
    return (_ctx, _push, _parent, _attrs) => {
      const _component_ClientOnly = __nuxt_component_1$1;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "snapshot-root" }, _attrs))} data-v-50dd937e>`);
      _push(ssrRenderComponent(VCard, {
        rounded: "xl",
        flat: "",
        border: "",
        class: "snapshot-card pa-0 overflow-hidden",
        elevation: "0"
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<div class="snapshot-toolbar d-flex align-center ga-2 pa-2" data-v-50dd937e${_scopeId}><div class="snapshot-dots d-flex ga-1" data-v-50dd937e${_scopeId}><span class="dot dot-red" data-v-50dd937e${_scopeId}></span><span class="dot dot-yellow" data-v-50dd937e${_scopeId}></span><span class="dot dot-green" data-v-50dd937e${_scopeId}></span></div>`);
            _push2(ssrRenderComponent(VSpacer, null, null, _parent2, _scopeId));
            _push2(`<span class="text-caption text-medium-emphasis" data-v-50dd937e${_scopeId}>${ssrInterpolate(__props.label)}</span>`);
            _push2(ssrRenderComponent(VSpacer, null, null, _parent2, _scopeId));
            _push2(ssrRenderComponent(VBtn, {
              icon: "mdi-open-in-new",
              size: "x-small",
              variant: "text",
              title: "Open full size",
              onClick: openFull
            }, null, _parent2, _scopeId));
            _push2(ssrRenderComponent(VBtn, {
              icon: "mdi-download",
              size: "x-small",
              variant: "text",
              title: "Download snapshot",
              onClick: downloadSvg
            }, null, _parent2, _scopeId));
            _push2(`</div><div class="snapshot-frame" data-v-50dd937e${_scopeId}><img${ssrRenderAttr("src", __props.src)}${ssrRenderAttr("alt", __props.alt)} class="snapshot-img" data-v-50dd937e${_scopeId}><div class="snapshot-hover-overlay d-flex align-center justify-center" data-v-50dd937e${_scopeId}>`);
            _push2(ssrRenderComponent(VBtn, {
              color: "white",
              variant: "elevated",
              size: "small",
              "prepend-icon": "mdi-magnify-plus"
            }, {
              default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                if (_push3) {
                  _push3(` View full screen `);
                } else {
                  return [
                    createTextVNode(" View full screen ")
                  ];
                }
              }),
              _: 1
            }, _parent2, _scopeId));
            _push2(`</div></div>`);
          } else {
            return [
              createVNode("div", { class: "snapshot-toolbar d-flex align-center ga-2 pa-2" }, [
                createVNode("div", { class: "snapshot-dots d-flex ga-1" }, [
                  createVNode("span", { class: "dot dot-red" }),
                  createVNode("span", { class: "dot dot-yellow" }),
                  createVNode("span", { class: "dot dot-green" })
                ]),
                createVNode(VSpacer),
                createVNode("span", { class: "text-caption text-medium-emphasis" }, toDisplayString(__props.label), 1),
                createVNode(VSpacer),
                createVNode(VBtn, {
                  icon: "mdi-open-in-new",
                  size: "x-small",
                  variant: "text",
                  title: "Open full size",
                  onClick: openFull
                }),
                createVNode(VBtn, {
                  icon: "mdi-download",
                  size: "x-small",
                  variant: "text",
                  title: "Download snapshot",
                  onClick: downloadSvg
                })
              ]),
              createVNode("div", {
                class: "snapshot-frame",
                onClick: openFull
              }, [
                createVNode("img", {
                  src: __props.src,
                  alt: __props.alt,
                  class: "snapshot-img"
                }, null, 8, ["src", "alt"]),
                createVNode("div", { class: "snapshot-hover-overlay d-flex align-center justify-center" }, [
                  createVNode(VBtn, {
                    color: "white",
                    variant: "elevated",
                    size: "small",
                    "prepend-icon": "mdi-magnify-plus"
                  }, {
                    default: withCtx(() => [
                      createTextVNode(" View full screen ")
                    ]),
                    _: 1
                  })
                ])
              ])
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(ssrRenderComponent(_component_ClientOnly, null, {}, _parent));
      _push(`</div>`);
    };
  }
});
const _sfc_setup$5 = _sfc_main$5.setup;
_sfc_main$5.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/docs/Snapshot.vue");
  return _sfc_setup$5 ? _sfc_setup$5(props, ctx) : void 0;
};
const __nuxt_component_0 = /* @__PURE__ */ Object.assign(_export_sfc(_sfc_main$5, [["__scopeId", "data-v-50dd937e"]]), { __name: "DocsSnapshot" });
const _sfc_main$4 = /* @__PURE__ */ defineComponent({
  __name: "Toc",
  __ssrInlineRender: true,
  props: {
    sections: {}
  },
  setup(__props) {
    const props = __props;
    const items = computed(
      () => props.sections.map((s) => ({
        title: s.title,
        value: s.id,
        props: {
          class: s.level === 2 ? "toc-sub" : "toc-main"
        }
      }))
    );
    function onSelect(item) {
    }
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "toc-nav" }, _attrs))} data-v-4d5cac3b>`);
      _push(ssrRenderComponent(VCard, {
        rounded: "xl",
        flat: "",
        border: "",
        class: "pa-4"
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<div class="text-overline text-medium-emphasis mb-2 px-1" data-v-4d5cac3b${_scopeId}>On this page</div>`);
            _push2(ssrRenderComponent(VList, {
              density: "compact",
              class: "toc-list",
              items: unref(items),
              "onClick:select": onSelect
            }, null, _parent2, _scopeId));
          } else {
            return [
              createVNode("div", { class: "text-overline text-medium-emphasis mb-2 px-1" }, "On this page"),
              createVNode(VList, {
                density: "compact",
                class: "toc-list",
                items: unref(items),
                "onClick:select": onSelect
              }, null, 8, ["items"])
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`</div>`);
    };
  }
});
const _sfc_setup$4 = _sfc_main$4.setup;
_sfc_main$4.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/docs/Toc.vue");
  return _sfc_setup$4 ? _sfc_setup$4(props, ctx) : void 0;
};
const __nuxt_component_1 = /* @__PURE__ */ Object.assign(_export_sfc(_sfc_main$4, [["__scopeId", "data-v-4d5cac3b"]]), { __name: "DocsToc" });
const _sfc_main$3 = /* @__PURE__ */ defineComponent({
  __name: "StepTimeline",
  __ssrInlineRender: true,
  props: {
    steps: {}
  },
  setup(__props) {
    return (_ctx, _push, _parent, _attrs) => {
      _push(ssrRenderComponent(VCard, mergeProps({
        rounded: "xl",
        flat: "",
        border: "",
        class: "pa-4 section-card"
      }, _attrs), {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(ssrRenderComponent(VTimeline, {
              align: "start",
              density: "compact",
              class: "mt-2"
            }, {
              default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                if (_push3) {
                  _push3(`<!--[-->`);
                  ssrRenderList(__props.steps, (step, i) => {
                    _push3(ssrRenderComponent(VTimelineItem, {
                      key: i,
                      size: "small",
                      "dot-color": step.color || "primary",
                      icon: step.icon || "mdi-numeric-" + (i + 1) + "-circle"
                    }, {
                      default: withCtx((_3, _push4, _parent4, _scopeId3) => {
                        if (_push4) {
                          _push4(`<div class="mb-2" data-v-d1401191${_scopeId3}><div class="d-flex align-center ga-2" data-v-d1401191${_scopeId3}><span class="text-subtitle-1 font-weight-bold" data-v-d1401191${_scopeId3}>${ssrInterpolate(step.title)}</span></div><div class="text-body-2 text-medium-emphasis mt-1" data-v-d1401191${_scopeId3}>${ssrInterpolate(step.description)}</div>`);
                          if (step.tip) {
                            _push4(ssrRenderComponent(VAlert, {
                              type: "info",
                              variant: "tonal",
                              density: "compact",
                              class: "mt-2",
                              icon: "mdi-lightbulb-on-outline"
                            }, {
                              default: withCtx((_4, _push5, _parent5, _scopeId4) => {
                                if (_push5) {
                                  _push5(`${ssrInterpolate(step.tip)}`);
                                } else {
                                  return [
                                    createTextVNode(toDisplayString(step.tip), 1)
                                  ];
                                }
                              }),
                              _: 2
                            }, _parent4, _scopeId3));
                          } else {
                            _push4(`<!---->`);
                          }
                          _push4(`</div>`);
                        } else {
                          return [
                            createVNode("div", { class: "mb-2" }, [
                              createVNode("div", { class: "d-flex align-center ga-2" }, [
                                createVNode("span", { class: "text-subtitle-1 font-weight-bold" }, toDisplayString(step.title), 1)
                              ]),
                              createVNode("div", { class: "text-body-2 text-medium-emphasis mt-1" }, toDisplayString(step.description), 1),
                              step.tip ? (openBlock(), createBlock(VAlert, {
                                key: 0,
                                type: "info",
                                variant: "tonal",
                                density: "compact",
                                class: "mt-2",
                                icon: "mdi-lightbulb-on-outline"
                              }, {
                                default: withCtx(() => [
                                  createTextVNode(toDisplayString(step.tip), 1)
                                ]),
                                _: 2
                              }, 1024)) : createCommentVNode("", true)
                            ])
                          ];
                        }
                      }),
                      _: 2
                    }, _parent3, _scopeId2));
                  });
                  _push3(`<!--]-->`);
                } else {
                  return [
                    (openBlock(true), createBlock(Fragment, null, renderList(__props.steps, (step, i) => {
                      return openBlock(), createBlock(VTimelineItem, {
                        key: i,
                        size: "small",
                        "dot-color": step.color || "primary",
                        icon: step.icon || "mdi-numeric-" + (i + 1) + "-circle"
                      }, {
                        default: withCtx(() => [
                          createVNode("div", { class: "mb-2" }, [
                            createVNode("div", { class: "d-flex align-center ga-2" }, [
                              createVNode("span", { class: "text-subtitle-1 font-weight-bold" }, toDisplayString(step.title), 1)
                            ]),
                            createVNode("div", { class: "text-body-2 text-medium-emphasis mt-1" }, toDisplayString(step.description), 1),
                            step.tip ? (openBlock(), createBlock(VAlert, {
                              key: 0,
                              type: "info",
                              variant: "tonal",
                              density: "compact",
                              class: "mt-2",
                              icon: "mdi-lightbulb-on-outline"
                            }, {
                              default: withCtx(() => [
                                createTextVNode(toDisplayString(step.tip), 1)
                              ]),
                              _: 2
                            }, 1024)) : createCommentVNode("", true)
                          ])
                        ]),
                        _: 2
                      }, 1032, ["dot-color", "icon"]);
                    }), 128))
                  ];
                }
              }),
              _: 1
            }, _parent2, _scopeId));
          } else {
            return [
              createVNode(VTimeline, {
                align: "start",
                density: "compact",
                class: "mt-2"
              }, {
                default: withCtx(() => [
                  (openBlock(true), createBlock(Fragment, null, renderList(__props.steps, (step, i) => {
                    return openBlock(), createBlock(VTimelineItem, {
                      key: i,
                      size: "small",
                      "dot-color": step.color || "primary",
                      icon: step.icon || "mdi-numeric-" + (i + 1) + "-circle"
                    }, {
                      default: withCtx(() => [
                        createVNode("div", { class: "mb-2" }, [
                          createVNode("div", { class: "d-flex align-center ga-2" }, [
                            createVNode("span", { class: "text-subtitle-1 font-weight-bold" }, toDisplayString(step.title), 1)
                          ]),
                          createVNode("div", { class: "text-body-2 text-medium-emphasis mt-1" }, toDisplayString(step.description), 1),
                          step.tip ? (openBlock(), createBlock(VAlert, {
                            key: 0,
                            type: "info",
                            variant: "tonal",
                            density: "compact",
                            class: "mt-2",
                            icon: "mdi-lightbulb-on-outline"
                          }, {
                            default: withCtx(() => [
                              createTextVNode(toDisplayString(step.tip), 1)
                            ]),
                            _: 2
                          }, 1024)) : createCommentVNode("", true)
                        ])
                      ]),
                      _: 2
                    }, 1032, ["dot-color", "icon"]);
                  }), 128))
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
const _sfc_setup$3 = _sfc_main$3.setup;
_sfc_main$3.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/docs/StepTimeline.vue");
  return _sfc_setup$3 ? _sfc_setup$3(props, ctx) : void 0;
};
const __nuxt_component_2 = /* @__PURE__ */ Object.assign(_export_sfc(_sfc_main$3, [["__scopeId", "data-v-d1401191"]]), { __name: "DocsStepTimeline" });
const _sfc_main$2 = /* @__PURE__ */ defineComponent({
  __name: "CsvExportDemo",
  __ssrInlineRender: true,
  props: {
    title: { default: "CSV Export Demo" },
    description: { default: "Export sample data as a CSV file for spreadsheet analysis or record-keeping." },
    filename: { default: "export.csv" },
    rows: {},
    columns: {}
  },
  setup(__props) {
    const props = __props;
    const showPreview = ref(false);
    const headers = computed(
      () => props.columns.map((c) => ({
        title: c.charAt(0).toUpperCase() + c.slice(1).replace(/_/g, " "),
        key: c,
        sortable: true
      }))
    );
    function escapeCell(value) {
      if (value === null || value === void 0) return "";
      let str = typeof value === "string" ? value : String(value);
      if (/["\n\r,]/.test(str)) str = `"${str.replace(/"/g, '""')}"`;
      return str;
    }
    const csvText = computed(() => {
      const header = props.columns.map((c) => escapeCell(c)).join(",");
      const body = props.rows.map((r) => props.columns.map((c) => escapeCell(r[c])).join(",")).join("\n");
      return `${header}
${body}`;
    });
    return (_ctx, _push, _parent, _attrs) => {
      _push(ssrRenderComponent(VCard, mergeProps({
        rounded: "xl",
        flat: "",
        border: "",
        class: "pa-6 csv-demo-card"
      }, _attrs), {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<div class="d-flex align-center mb-2 ga-2" data-v-dc2f81ef${_scopeId}>`);
            _push2(ssrRenderComponent(VIcon, {
              color: "success",
              size: "24"
            }, {
              default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                if (_push3) {
                  _push3(`mdi-file-delimited-outline`);
                } else {
                  return [
                    createTextVNode("mdi-file-delimited-outline")
                  ];
                }
              }),
              _: 1
            }, _parent2, _scopeId));
            _push2(`<span class="text-h6 font-weight-bold" data-v-dc2f81ef${_scopeId}>${ssrInterpolate(__props.title)}</span></div><p class="text-body-2 text-medium-emphasis mb-4" data-v-dc2f81ef${_scopeId}>${ssrInterpolate(__props.description)}</p>`);
            _push2(ssrRenderComponent(VDataTable, {
              headers: unref(headers),
              items: __props.rows,
              density: "compact",
              class: "mb-4 csv-table",
              "items-per-page": "5"
            }, null, _parent2, _scopeId));
            _push2(ssrRenderComponent(VBtn, {
              color: "success",
              variant: "flat",
              "prepend-icon": "mdi-download",
              onClick: ($event) => _ctx.exportCsv(__props.filename, __props.rows, { columns: __props.columns })
            }, {
              default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                if (_push3) {
                  _push3(` Download CSV `);
                } else {
                  return [
                    createTextVNode(" Download CSV ")
                  ];
                }
              }),
              _: 1
            }, _parent2, _scopeId));
            _push2(ssrRenderComponent(VBtn, {
              variant: "outlined",
              class: "ml-2",
              "prepend-icon": "mdi-eye-outline",
              onClick: ($event) => showPreview.value = !unref(showPreview)
            }, {
              default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                if (_push3) {
                  _push3(`${ssrInterpolate(unref(showPreview) ? "Hide" : "Preview")} CSV `);
                } else {
                  return [
                    createTextVNode(toDisplayString(unref(showPreview) ? "Hide" : "Preview") + " CSV ", 1)
                  ];
                }
              }),
              _: 1
            }, _parent2, _scopeId));
            _push2(ssrRenderComponent(VExpandTransition, null, {
              default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                if (_push3) {
                  _push3(`<div style="${ssrRenderStyle(unref(showPreview) ? null : { display: "none" })}" data-v-dc2f81ef${_scopeId2}><pre class="csv-preview mt-3" data-v-dc2f81ef${_scopeId2}>${ssrInterpolate(unref(csvText))}</pre></div>`);
                } else {
                  return [
                    withDirectives(createVNode("div", null, [
                      createVNode("pre", { class: "csv-preview mt-3" }, toDisplayString(unref(csvText)), 1)
                    ], 512), [
                      [vShow, unref(showPreview)]
                    ])
                  ];
                }
              }),
              _: 1
            }, _parent2, _scopeId));
          } else {
            return [
              createVNode("div", { class: "d-flex align-center mb-2 ga-2" }, [
                createVNode(VIcon, {
                  color: "success",
                  size: "24"
                }, {
                  default: withCtx(() => [
                    createTextVNode("mdi-file-delimited-outline")
                  ]),
                  _: 1
                }),
                createVNode("span", { class: "text-h6 font-weight-bold" }, toDisplayString(__props.title), 1)
              ]),
              createVNode("p", { class: "text-body-2 text-medium-emphasis mb-4" }, toDisplayString(__props.description), 1),
              createVNode(VDataTable, {
                headers: unref(headers),
                items: __props.rows,
                density: "compact",
                class: "mb-4 csv-table",
                "items-per-page": "5"
              }, null, 8, ["headers", "items"]),
              createVNode(VBtn, {
                color: "success",
                variant: "flat",
                "prepend-icon": "mdi-download",
                onClick: ($event) => _ctx.exportCsv(__props.filename, __props.rows, { columns: __props.columns })
              }, {
                default: withCtx(() => [
                  createTextVNode(" Download CSV ")
                ]),
                _: 1
              }, 8, ["onClick"]),
              createVNode(VBtn, {
                variant: "outlined",
                class: "ml-2",
                "prepend-icon": "mdi-eye-outline",
                onClick: ($event) => showPreview.value = !unref(showPreview)
              }, {
                default: withCtx(() => [
                  createTextVNode(toDisplayString(unref(showPreview) ? "Hide" : "Preview") + " CSV ", 1)
                ]),
                _: 1
              }, 8, ["onClick"]),
              createVNode(VExpandTransition, null, {
                default: withCtx(() => [
                  withDirectives(createVNode("div", null, [
                    createVNode("pre", { class: "csv-preview mt-3" }, toDisplayString(unref(csvText)), 1)
                  ], 512), [
                    [vShow, unref(showPreview)]
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
const _sfc_setup$2 = _sfc_main$2.setup;
_sfc_main$2.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/docs/CsvExportDemo.vue");
  return _sfc_setup$2 ? _sfc_setup$2(props, ctx) : void 0;
};
const __nuxt_component_3 = /* @__PURE__ */ Object.assign(_export_sfc(_sfc_main$2, [["__scopeId", "data-v-dc2f81ef"]]), { __name: "DocsCsvExportDemo" });
const _sfc_main$1 = /* @__PURE__ */ defineComponent({
  __name: "ChartExportDemo",
  __ssrInlineRender: true,
  props: {
    title: { default: "Chart with CSV Export" },
    description: { default: "Visualize data and export it as CSV for further analysis." },
    filename: { default: "chart-data.csv" },
    categories: {},
    series: {}
  },
  setup(__props) {
    const { exportCsv: exportRowsCsv } = useCsvExport();
    const props = __props;
    const chartSeries = computed(() => props.series);
    const chartOptions = computed(() => ({
      chart: {
        type: "bar",
        fontFamily: "Segoe UI, Roboto, sans-serif",
        toolbar: { show: false },
        animations: { enabled: true, speed: 800 }
      },
      colors: ["#3478f6", "#f59e0b", "#22c55e", "#8b5cf6"],
      plotOptions: {
        bar: { borderRadius: 6, columnWidth: "60%" }
      },
      dataLabels: { enabled: false },
      stroke: { show: true, width: 2, colors: ["transparent"] },
      xaxis: {
        categories: props.categories,
        labels: { style: { fontSize: "12px" } }
      },
      yaxis: { labels: { formatter: (val) => val.toLocaleString() } },
      fill: { opacity: 1 },
      tooltip: { y: { formatter: (val) => val.toLocaleString() } },
      legend: { position: "top", fontSize: "13px" },
      grid: { borderColor: "#e2e8f0", strokeDashArray: 4 }
    }));
    function exportCsv() {
      const rows = props.categories.map((cat, i) => {
        const row = { category: cat };
        props.series.forEach((s) => {
          row[s.name] = s.data[i];
        });
        return row;
      });
      const columns = ["category", ...props.series.map((s) => s.name)];
      exportRowsCsv(props.filename, rows, { columns });
    }
    async function exportChartPng() {
      return;
    }
    `chart-${Math.random().toString(36).slice(2, 9)}`;
    return (_ctx, _push, _parent, _attrs) => {
      const _component_apexchart = resolveComponent("apexchart");
      _push(ssrRenderComponent(VCard, mergeProps({
        rounded: "xl",
        flat: "",
        border: "",
        class: "pa-6 chart-demo-card"
      }, _attrs), {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<div class="d-flex align-center mb-2 ga-2" data-v-31c0cd69${_scopeId}>`);
            _push2(ssrRenderComponent(VIcon, {
              color: "primary",
              size: "24"
            }, {
              default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                if (_push3) {
                  _push3(`mdi-chart-line`);
                } else {
                  return [
                    createTextVNode("mdi-chart-line")
                  ];
                }
              }),
              _: 1
            }, _parent2, _scopeId));
            _push2(`<span class="text-h6 font-weight-bold" data-v-31c0cd69${_scopeId}>${ssrInterpolate(__props.title)}</span></div><p class="text-body-2 text-medium-emphasis mb-4" data-v-31c0cd69${_scopeId}>${ssrInterpolate(__props.description)}</p>`);
            _push2(ssrRenderComponent(VRow, { density: "comfortable" }, {
              default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                if (_push3) {
                  _push3(ssrRenderComponent(VCol, {
                    cols: "12",
                    md: "8"
                  }, {
                    default: withCtx((_3, _push4, _parent4, _scopeId3) => {
                      if (_push4) {
                        _push4(`<div class="chart-wrap" data-v-31c0cd69${_scopeId3}>`);
                        _push4(ssrRenderComponent(_component_apexchart, {
                          type: "bar",
                          options: unref(chartOptions),
                          series: unref(chartSeries),
                          height: "300"
                        }, null, _parent4, _scopeId3));
                        _push4(`</div>`);
                      } else {
                        return [
                          createVNode("div", { class: "chart-wrap" }, [
                            createVNode(_component_apexchart, {
                              type: "bar",
                              options: unref(chartOptions),
                              series: unref(chartSeries),
                              height: "300"
                            }, null, 8, ["options", "series"])
                          ])
                        ];
                      }
                    }),
                    _: 1
                  }, _parent3, _scopeId2));
                  _push3(ssrRenderComponent(VCol, {
                    cols: "12",
                    md: "4",
                    class: "d-flex flex-column justify-center ga-3"
                  }, {
                    default: withCtx((_3, _push4, _parent4, _scopeId3) => {
                      if (_push4) {
                        _push4(ssrRenderComponent(VBtn, {
                          color: "success",
                          variant: "flat",
                          "prepend-icon": "mdi-download",
                          onClick: exportCsv
                        }, {
                          default: withCtx((_4, _push5, _parent5, _scopeId4) => {
                            if (_push5) {
                              _push5(` Export CSV `);
                            } else {
                              return [
                                createTextVNode(" Export CSV ")
                              ];
                            }
                          }),
                          _: 1
                        }, _parent4, _scopeId3));
                        _push4(ssrRenderComponent(VBtn, {
                          variant: "outlined",
                          "prepend-icon": "mdi-chart-bar",
                          onClick: exportChartPng
                        }, {
                          default: withCtx((_4, _push5, _parent5, _scopeId4) => {
                            if (_push5) {
                              _push5(` Export PNG `);
                            } else {
                              return [
                                createTextVNode(" Export PNG ")
                              ];
                            }
                          }),
                          _: 1
                        }, _parent4, _scopeId3));
                        _push4(`<p class="text-caption text-medium-emphasis text-center" data-v-31c0cd69${_scopeId3}> CSV data is generated from the chart series and can be opened in Excel or Google Sheets. </p>`);
                      } else {
                        return [
                          createVNode(VBtn, {
                            color: "success",
                            variant: "flat",
                            "prepend-icon": "mdi-download",
                            onClick: exportCsv
                          }, {
                            default: withCtx(() => [
                              createTextVNode(" Export CSV ")
                            ]),
                            _: 1
                          }),
                          createVNode(VBtn, {
                            variant: "outlined",
                            "prepend-icon": "mdi-chart-bar",
                            onClick: exportChartPng
                          }, {
                            default: withCtx(() => [
                              createTextVNode(" Export PNG ")
                            ]),
                            _: 1
                          }),
                          createVNode("p", { class: "text-caption text-medium-emphasis text-center" }, " CSV data is generated from the chart series and can be opened in Excel or Google Sheets. ")
                        ];
                      }
                    }),
                    _: 1
                  }, _parent3, _scopeId2));
                } else {
                  return [
                    createVNode(VCol, {
                      cols: "12",
                      md: "8"
                    }, {
                      default: withCtx(() => [
                        createVNode("div", { class: "chart-wrap" }, [
                          createVNode(_component_apexchart, {
                            type: "bar",
                            options: unref(chartOptions),
                            series: unref(chartSeries),
                            height: "300"
                          }, null, 8, ["options", "series"])
                        ])
                      ]),
                      _: 1
                    }),
                    createVNode(VCol, {
                      cols: "12",
                      md: "4",
                      class: "d-flex flex-column justify-center ga-3"
                    }, {
                      default: withCtx(() => [
                        createVNode(VBtn, {
                          color: "success",
                          variant: "flat",
                          "prepend-icon": "mdi-download",
                          onClick: exportCsv
                        }, {
                          default: withCtx(() => [
                            createTextVNode(" Export CSV ")
                          ]),
                          _: 1
                        }),
                        createVNode(VBtn, {
                          variant: "outlined",
                          "prepend-icon": "mdi-chart-bar",
                          onClick: exportChartPng
                        }, {
                          default: withCtx(() => [
                            createTextVNode(" Export PNG ")
                          ]),
                          _: 1
                        }),
                        createVNode("p", { class: "text-caption text-medium-emphasis text-center" }, " CSV data is generated from the chart series and can be opened in Excel or Google Sheets. ")
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
              createVNode("div", { class: "d-flex align-center mb-2 ga-2" }, [
                createVNode(VIcon, {
                  color: "primary",
                  size: "24"
                }, {
                  default: withCtx(() => [
                    createTextVNode("mdi-chart-line")
                  ]),
                  _: 1
                }),
                createVNode("span", { class: "text-h6 font-weight-bold" }, toDisplayString(__props.title), 1)
              ]),
              createVNode("p", { class: "text-body-2 text-medium-emphasis mb-4" }, toDisplayString(__props.description), 1),
              createVNode(VRow, { density: "comfortable" }, {
                default: withCtx(() => [
                  createVNode(VCol, {
                    cols: "12",
                    md: "8"
                  }, {
                    default: withCtx(() => [
                      createVNode("div", { class: "chart-wrap" }, [
                        createVNode(_component_apexchart, {
                          type: "bar",
                          options: unref(chartOptions),
                          series: unref(chartSeries),
                          height: "300"
                        }, null, 8, ["options", "series"])
                      ])
                    ]),
                    _: 1
                  }),
                  createVNode(VCol, {
                    cols: "12",
                    md: "4",
                    class: "d-flex flex-column justify-center ga-3"
                  }, {
                    default: withCtx(() => [
                      createVNode(VBtn, {
                        color: "success",
                        variant: "flat",
                        "prepend-icon": "mdi-download",
                        onClick: exportCsv
                      }, {
                        default: withCtx(() => [
                          createTextVNode(" Export CSV ")
                        ]),
                        _: 1
                      }),
                      createVNode(VBtn, {
                        variant: "outlined",
                        "prepend-icon": "mdi-chart-bar",
                        onClick: exportChartPng
                      }, {
                        default: withCtx(() => [
                          createTextVNode(" Export PNG ")
                        ]),
                        _: 1
                      }),
                      createVNode("p", { class: "text-caption text-medium-emphasis text-center" }, " CSV data is generated from the chart series and can be opened in Excel or Google Sheets. ")
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
    };
  }
});
const _sfc_setup$1 = _sfc_main$1.setup;
_sfc_main$1.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/docs/ChartExportDemo.vue");
  return _sfc_setup$1 ? _sfc_setup$1(props, ctx) : void 0;
};
const __nuxt_component_4 = /* @__PURE__ */ Object.assign(_export_sfc(_sfc_main$1, [["__scopeId", "data-v-31c0cd69"]]), { __name: "DocsChartExportDemo" });
const loginSnap = "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMjgwIDgwMCIgd2lkdGg9IjEyODAiIGhlaWdodD0iODAwIiBmb250LWZhbWlseT0iU2Vnb2UgVUksIFJvYm90bywgc2Fucy1zZXJpZiI+DQogIDxkZWZzPg0KICAgIDxsaW5lYXJHcmFkaWVudCBpZD0iYmctbGciIHgxPSIwIiB5MT0iMCIgeDI9IjEiIHkyPSIxIj4NCiAgICAgIDxzdG9wIG9mZnNldD0iMCIgc3RvcC1jb2xvcj0iI2Y4ZmFmYyIvPjxzdG9wIG9mZnNldD0iMSIgc3RvcC1jb2xvcj0iI2U4ZWRmNCIvPg0KICAgIDwvbGluZWFyR3JhZGllbnQ+DQogICAgPGxpbmVhckdyYWRpZW50IGlkPSJnYnRuIiB4MT0iMCIgeTE9IjAiIHgyPSIxIiB5Mj0iMCI+DQogICAgICA8c3RvcCBvZmZzZXQ9IjAiIHN0b3AtY29sb3I9IiMzNDc4ZjYiLz48c3RvcCBvZmZzZXQ9IjEiIHN0b3AtY29sb3I9IiMxYTVmZDAiLz4NCiAgICA8L2xpbmVhckdyYWRpZW50Pg0KICAgIDxmaWx0ZXIgaWQ9InNoLWxnIj48ZmVEcm9wU2hhZG93IGR4PSIwIiBkeT0iNCIgc3RkRGV2aWF0aW9uPSIxMCIgZmxvb2Qtb3BhY2l0eT0iMC4wOCIvPjwvZmlsdGVyPg0KICA8L2RlZnM+DQoNCiAgPHJlY3Qgd2lkdGg9IjEyODAiIGhlaWdodD0iODAwIiBmaWxsPSJ1cmwoI2JnLWxnKSIvPg0KDQogIDwhLS0gTGVmdCBicmFuZGluZyBwYW5lbCAtLT4NCiAgPHJlY3QgeD0iMCIgeT0iMCIgd2lkdGg9IjY0MCIgaGVpZ2h0PSI4MDAiIGZpbGw9IiMxZTI5M2IiLz4NCiAgPCEtLSBkZWNvcmF0aXZlIGJsb2JzIC0tPg0KICA8Y2lyY2xlIGN4PSIxMDAiIGN5PSIxMDAiIHI9IjE4MCIgZmlsbD0iIzM0NzhmNiIgb3BhY2l0eT0iMC4xNSIvPg0KICA8Y2lyY2xlIGN4PSI1NDAiIGN5PSI3MDAiIHI9IjIwMCIgZmlsbD0iIzhiNWNmNiIgb3BhY2l0eT0iMC4xMiIvPg0KICA8Y2lyY2xlIGN4PSI1MDAiIGN5PSIxODAiIHI9IjEyMCIgZmlsbD0iIzIyZDNlZSIgb3BhY2l0eT0iMC4wOCIvPg0KDQogIDwhLS0gZ2xhc3MgY2FyZCAtLT4NCiAgPHJlY3QgeD0iODAiIHk9IjE4MCIgd2lkdGg9IjQ4MCIgaGVpZ2h0PSI0NDAiIHJ4PSIyOCIgZmlsbD0iI2ZmZmZmZiIgb3BhY2l0eT0iMC41NSIvPg0KICA8cmVjdCB4PSI4MCIgeT0iMTgwIiB3aWR0aD0iNDgwIiBoZWlnaHQ9IjQ0MCIgcng9IjI4IiBmaWxsPSJub25lIiBzdHJva2U9IiM3ZGQzZmMiIHN0cm9rZS1vcGFjaXR5PSIwLjQiIHN0cm9rZS13aWR0aD0iMSIvPg0KDQogIDwhLS0gYnJhbmQgLS0+DQogIDxyZWN0IHg9IjExMiIgeT0iMjE2IiB3aWR0aD0iNTYiIGhlaWdodD0iNTYiIHJ4PSIxNiIgZmlsbD0idXJsKCNnYnRuKSIvPg0KICA8dGV4dCB4PSIxNDAiIHk9IjI1MiIgZm9udC1zaXplPSIyOCIgZmlsbD0iI2ZmZmZmZiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZG9taW5hbnQtYmFzZWxpbmU9Im1pZGRsZSI+TTwvdGV4dD4NCiAgPHRleHQgeD0iMTg4IiB5PSIyMzIiIGZvbnQtc2l6ZT0iMjQiIGZvbnQtd2VpZ2h0PSI3MDAiIGZpbGw9IiMwZjE3MmEiPkRvbWVuZHJhUE9TPC90ZXh0Pg0KICA8dGV4dCB4PSIxODgiIHk9IjI1MiIgZm9udC1zaXplPSIxMyIgZmlsbD0iIzQ3NTU2OSI+U2lnbiBpbiB0byBjb250aW51ZTwvdGV4dD4NCg0KICA8dGV4dCB4PSIxMTIiIHk9IjMxNiIgZm9udC1zaXplPSIyMCIgZm9udC13ZWlnaHQ9IjYwMCIgZmlsbD0iIzBmMTcyYSI+V2VsY29tZSBiYWNrPC90ZXh0Pg0KICA8dGV4dCB4PSIxMTIiIHk9IjM0MCIgZm9udC1zaXplPSIxMyIgZmlsbD0iIzQ3NTU2OSI+U2lnbiBpbiB0byB5b3VyIERvbWVuZHJhUE9TIGFjY291bnQ8L3RleHQ+DQoNCiAgPCEtLSBlbWFpbCBmaWVsZCAtLT4NCiAgPHJlY3QgeD0iMTEyIiB5PSIzNjAiIHdpZHRoPSI0MTYiIGhlaWdodD0iNTAiIHJ4PSIxNCIgZmlsbD0iI2ZmZmZmZiIgb3BhY2l0eT0iMC43NSIgc3Ryb2tlPSIjY2JkNWUxIi8+DQogIDx0ZXh0IHg9IjEzMCIgeT0iMzc2IiBmb250LXNpemU9IjExIiBmaWxsPSIjNjQ3NDhiIj5FbWFpbCBhZGRyZXNzPC90ZXh0Pg0KICA8dGV4dCB4PSI5ODIiIHk9IjI2MiIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk0YTNiOCI+PC90ZXh0Pg0KICA8cmVjdCB4PSIxMjgiIHk9IjM4NSIgd2lkdGg9IjM4NCIgaGVpZ2h0PSIxNiIgcng9IjMiIGZpbGw9IiNlMmU4ZjAiLz4NCg0KICA8IS0tIHBhc3N3b3JkIC0tPg0KICA8cmVjdCB4PSIxMTIiIHk9IjQyNiIgd2lkdGg9IjQxNiIgaGVpZ2h0PSI1MCIgcng9IjE0IiBmaWxsPSIjZmZmZmZmIiBvcGFjaXR5PSIwLjc1IiBzdHJva2U9IiNjYmQ1ZTEiLz4NCiAgPHRleHQgeD0iMTMwIiB5PSI0NDIiIGZvbnQtc2l6ZT0iMTEiIGZpbGw9IiM2NDc0OGIiPlBhc3N3b3JkPC90ZXh0Pg0KDQogIDwhLS0gcmVtZW1iZXIgKyBmb3Jnb3QgLS0+DQogIDxyZWN0IHg9IjExNiIgeT0iNDkyIiB3aWR0aD0iMTgiIGhlaWdodD0iMTgiIHJ4PSIzIiBmaWxsPSIjMzQ3OGY2Ii8+DQogIDx0ZXh0IHg9IjE0MiIgeT0iNTA2IiBmb250LXNpemU9IjEzIiBmaWxsPSIjNDc1NTY5Ij5SZW1lbWJlciBtZTwvdGV4dD4NCiAgPHRleHQgeD0iNTEwIiB5PSI1MDYiIGZvbnQtc2l6ZT0iMTMiIGZpbGw9IiMyNTYzZWIiIHRleHQtYW5jaG9yPSJlbmQiPkZvcmdvdCBwYXNzd29yZD88L3RleHQ+DQoNCiAgPCEtLSBzaWduIGluIGJ1dHRvbiAtLT4NCiAgPHJlY3QgeD0iMTEyIiB5PSI1MjQiIHdpZHRoPSI0MTYiIGhlaWdodD0iNTAiIHJ4PSIxNCIgZmlsbD0idXJsKCNnYnRuKSIvPg0KICA8dGV4dCB4PSIzMjAiIHk9IjU0MCIgZm9udC1zaXplPSIxNSIgZm9udC13ZWlnaHQ9IjcwMCIgZmlsbD0iI2ZmZmZmZiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZG9taW5hbnQtYmFzZWxpbmU9Im1pZGRsZSI+U2lnbiBpbjwvdGV4dD4NCg0KICA8IS0tIGRvY3VtZW50YXRpb24gYnV0dG9uIC0tPg0KICA8cmVjdCB4PSIxMTIiIHk9IjU4OCIgd2lkdGg9IjQxNiIgaGVpZ2h0PSI0NCIgcng9IjEyIiBmaWxsPSIjZmZmZmZmIiBvcGFjaXR5PSIwLjYiIHN0cm9rZT0iI2NiZDVlMSIgc3Ryb2tlLWRhc2hhcnJheT0iNCAzIi8+DQogIDxjaXJjbGUgY3g9IjE0NCIgY3k9IjYxMCIgcj0iMTIiIGZpbGw9IiMwZDk0ODgiIG9wYWNpdHk9IjAuMTUiLz4NCiAgPHRleHQgeD0iMTQ0IiB5PSI2MTUiIGZvbnQtc2l6ZT0iMTQiIGZpbGw9IiMwZDk0ODgiIHRleHQtYW5jaG9yPSJtaWRkbGUiPj88L3RleHQ+DQogIDx0ZXh0IHg9IjE3MiIgeT0iNjE2IiBmb250LXNpemU9IjE0IiBmb250LXdlaWdodD0iNjAwIiBmaWxsPSIjMGQ5NDg4Ij5Vc2VyIEd1aWRlbGluZXMgYW5kIERvY3VtZW50YXRpb248L3RleHQ+DQoNCiAgPCEtLSBzaWdudXAgbGluayAtLT4NCiAgPHRleHQgeD0iMzIwIiB5PSI2NjAiIGZvbnQtc2l6ZT0iMTMiIGZpbGw9IiM0NzU1NjkiIHRleHQtYW5jaG9yPSJtaWRkbGUiPk5ldyB0byBEb21lbmRyYVBPUz8gPHRzcGFuIGZpbGw9IiMyNTYzZWIiIGZvbnQtd2VpZ2h0PSI3MDAiPkNyZWF0ZSBhIHdvcmtzcGFjZTwvdHNwYW4+PC90ZXh0Pg0KDQogIDwhLS0gRm9vdGVyIG9uIHJpZ2h0IHNpZGUgLS0+DQogIDx0ZXh0IHg9IjMyMCIgeT0iNzAwIiBmb250LXNpemU9IjExIiBmaWxsPSIjOTRhM2I4IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj7CqSAyMDI2IERvbWVuZHJhUE9TLiBBbGwgcmlnaHRzIHJlc2VydmVkLjwvdGV4dD4NCjwvc3ZnPg0K";
const dashboardSnap = "" + __buildAssetsURL("snapshot-dashboard.BF2d59YY.svg");
const posSnap = "" + __buildAssetsURL("snapshot-pos.T285eseg.svg");
const inventorySnap = "" + __buildAssetsURL("snapshot-inventory.CQ4ZBlJt.svg");
const reportsSnap = "" + __buildAssetsURL("snapshot-reports.COV62vg3.svg");
const iamSnap = "" + __buildAssetsURL("snapshot-iam.BZvJzsRS.svg");
const auditSnap = "" + __buildAssetsURL("snapshot-audit.V1CFQsHZ.svg");
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "docs",
  __ssrInlineRender: true,
  setup(__props) {
    useHead({
      title: "User Guidelines — DomendraPOS",
      meta: [
        { name: "description", content: "Comprehensive user guide for DomendraPOS — POS, inventory, accounting, reports, roles, and API." }
      ]
    });
    const loginSnapshot = loginSnap;
    const dashboardSnapshot = dashboardSnap;
    const posSnapshot = posSnap;
    const inventorySnapshot = inventorySnap;
    const reportsSnapshot = reportsSnap;
    const iamSnapshot = iamSnap;
    const auditSnapshot = auditSnap;
    const tocSections = [
      { id: "overview", title: "Overview", level: 1 },
      { id: "getting-started", title: "Getting Started", level: 1 },
      { id: "module-pos", title: "Point of Sale", level: 2 },
      { id: "module-inventory", title: "Inventory", level: 2 },
      { id: "module-products", title: "Products", level: 2 },
      { id: "module-customers", title: "Customers", level: 2 },
      { id: "module-suppliers", title: "Suppliers", level: 2 },
      { id: "module-reports", title: "Reports", level: 2 },
      { id: "module-analytics", title: "Analytics", level: 2 },
      { id: "module-accounting", title: "Accounts and Finance", level: 2 },
      { id: "modules", title: "All Modules", level: 1 },
      { id: "roles", title: "Roles and Audit", level: 1 },
      { id: "api-and-exports", title: "API and Exports", level: 1 },
      { id: "faq", title: "FAQ", level: 1 }
    ];
    const stats = [
      { label: "Modules documented", value: "12+", icon: "mdi-view-module-outline", color: "primary" },
      { label: "Role types", value: "6", icon: "mdi-shield-account-outline", color: "success" },
      { label: "CSV samples", value: "8", icon: "mdi-file-delimited-outline", color: "warning" },
      { label: "Screenshots", value: "7", icon: "mdi-image-multiple", color: "info" }
    ];
    const loginSteps = [
      { title: "Open the login page", description: "Navigate to https://app.domendrapos.com/login (or your tenant URL)." },
      { title: "Enter your email", description: "Use the email registered by your workspace admin." },
      { title: "Enter your password", description: "Click the eye icon to reveal what you typed.", tip: "Use a strong password with at least 8 characters, mixing letters, numbers, and symbols." },
      { title: "Remember me (optional)", description: "Tick this box to stay signed in for 30 days on this device." },
      { title: "Click Sign in", description: "You are redirected to /dashboard (or /superadmin if you are a platform super-admin)." },
      { title: "Need help?", description: "Click the Documentation button on the login screen to open this guide." }
    ];
    const posSteps = [
      { title: "Select a branch", description: "In the top app bar, choose the branch for this session.", color: "primary" },
      { title: "Search or scan", description: "Type product name/SKU or scan a barcode. The match list filters as you type." },
      { title: "Tap to add", description: "Tap a product tile to add one unit. Tap again for more." },
      { title: "Set quantity / discount", description: "In the cart panel, change quantities and apply line or cart-level discounts." },
      { title: "Choose a customer (optional)", description: "Attach a walk-in or registered customer for loyalty and credit sales." },
      { title: "Take payment", description: "Tap Cash, M-Pesa, or Card. For cash, enter the amount tendered. For M-Pesa, enter the phone number. A sale receipt prints automatically." },
      { title: "Open or close shift", description: "At end of day, close your shift and print a reconciliation summary." }
    ];
    const productSteps = [
      { title: "Open Products", description: "Sidebar → Products. Use the toggle for table or grid view." },
      { title: "Add a product", description: "Click “+ New Product”. Fill in information, pricing, inventory, and variants tabs." },
      { title: "Manage categories, brands, units", description: "Use the sub-tabs inside the product modal or the settings page." },
      { title: "Bulk import (Excel)", description: "Download the template, fill rows, upload. The system validates and reports row errors." },
      { title: "Bulk edit (spreadsheet mode)", description: "Toggle bulk-edit on the table to edit prices inline for many products at once." },
      { title: "Activate / deactivate", description: "Use the status toggle or select rows and bulk-activate / bulk-deactivate." }
    ];
    const customerSteps = [
      { title: "Open Customers", description: "Sidebar → Customers to see the CRM list." },
      { title: "Add a customer", description: "Click “+ New Customer”. Enter name, phone, email, and loyalty tier." },
      { title: "Sell on credit", description: "In POS, attach the customer and choose “Credit” as the payment method. Their balance updates immediately." },
      { title: "View history", description: "Click any customer to see purchase history, loyalty points, and outstanding balance." },
      { title: "Redeem loyalty", description: "At checkout, apply loyalty points as a discount if the customer has enough points." }
    ];
    const supplierSteps = [
      { title: "Add a supplier", description: "Sidebar → Suppliers → “+ New Supplier”. Enter name, contact, and payment terms." },
      { title: "Raise a PO", description: "Sidebar → Purchasing → “+ New PO”. Select supplier, branch, and line items. Submit for approval." },
      { title: "Approve a PO", description: "A manager approves the PO. Stock is not affected yet." },
      { title: "Receive goods", description: "Open the approved PO and click “Receive”. Enter quantities received. Stock-on-hand updates; a journal entry is posted to the inventory account." },
      { title: "Record supplier invoice", description: "Match the PO to a supplier invoice; the payable is recorded in the general ledger." },
      { title: "Pay supplier", description: "Issue a payment via cash or bank; the PO closes and the supplier balance reduces." }
    ];
    const reportSteps = [
      { title: "Open Reports", description: "Sidebar → Reports and choose Sales Summary, Profit and Loss, VAT, or Stock Valuation." },
      { title: "Pick a period", description: "Use the date pickers or the quick period chip: Today / This Week / This Month / Quarter / Year." },
      { title: "Pick branches", description: "Choose All Branches or specific branches." },
      { title: "Run the report", description: "Click “Generate”. KPIs and charts populate instantly." },
      { title: "Export", description: "Click Export CSV (for data) or Export PDF (for a printable report)." },
      { title: "Schedule", description: "Accountants can schedule recurring reports to be emailed monthly." }
    ];
    const inventorySteps = [
      { title: "Adjustment", description: "Increase or decrease stock for a SKU. Choose a reason: damage, theft, recount, sample, return." },
      { title: "Transfer", description: "Move stock from one branch to another. Source loses; destination gains." },
      { title: "Receive", description: "Receive goods from a supplier PO. Updates stock and accounting simultaneously." },
      { title: "Return", description: "Return goods to a supplier. Creates a debit note and a payable reversal." },
      { title: "Recount", description: "A full physical count. Import a CSV of counted quantities and post the adjustments." }
    ];
    const accountingSteps = [
      { title: "Chart of accounts", description: "Settings → Accounting → Chart of Accounts. Define asset, liability, equity, income, expense accounts." },
      { title: "Post a journal entry", description: "Accounting → Journal → New. Enter date, debit and credit lines. The entry must balance before posting." },
      { title: "View ledgers", description: "Ledgers show all entries for an account in a date range with running balance." },
      { title: "Generate statements", description: "Reports → Profit and Loss or Balance Sheet. Exports to PDF for sharing." },
      { title: "VAT", description: "Reports → VAT Return. Generates the output VAT and input VAT for the period and the net payable." }
    ];
    const inventoryConcepts = [
      { title: "Stock on hand", text: "The quantity of each SKU currently in a branch.", icon: "mdi-package-variant", color: "primary" },
      { title: "Reorder point", text: "The minimum stock level that triggers a low-stock alert.", icon: "mdi-bell-alert-outline", color: "warning" },
      { title: "Stock value", text: "On-hand × cost price, shown per branch and in total.", icon: "mdi-cash", color: "success" },
      { title: "ABC class", text: "A = top 20% by value, B = next 30%, C = remaining 50%.", icon: "mdi-chart-bar", color: "info" },
      { title: "Adjustments", text: "Manual increases or decreases with a documented reason.", icon: "mdi-counter", color: "primary" },
      { title: "Transfers", text: "Inter-branch moves tracked with source and destination.", icon: "mdi-truck-fast-outline", color: "secondary" }
    ];
    const moduleHeaders = [
      { title: "", key: "icon", sortable: false },
      { title: "Module", key: "name", sortable: true },
      { title: "What it does", key: "description", sortable: false },
      { title: "Roles", key: "roles" },
      { title: "", key: "actions", sortable: false }
    ];
    const moduleRows = [
      { name: "Dashboard", description: "KPI overview: revenue, transactions, low stock, top products", roles: "All", icon: "mdi-view-dashboard-outline", color: "primary", link: "getting-started" },
      { name: "POS", description: "Make sales, accept payments, print receipts", roles: "Cashier, Manager", icon: "mdi-cart-outline", color: "primary", link: "module-pos" },
      { name: "Inventory", description: "Track stock, adjustments, transfers, ABC analysis", roles: "Manager, Stock Clerk", icon: "mdi-warehouse-outline", color: "warning", link: "module-inventory" },
      { name: "Products", description: "Catalog management, bulk Excel import, variants", roles: "Manager", icon: "mdi-package-variant-closed", color: "success", link: "module-products" },
      { name: "Customers", description: "CRM, loyalty, store credit, balances", roles: "Cashier, Manager", icon: "mdi-account-group-outline", color: "info", link: "module-customers" },
      { name: "Suppliers", description: "Supplier directory and PO management", roles: "Manager", icon: "mdi-truck-delivery-outline", color: "secondary", link: "module-suppliers" },
      { name: "Purchasing", description: "Raise, approve, receive purchase orders", roles: "Manager", icon: "mdi-clipboard-list-outline", color: "primary", link: "module-suppliers" },
      { name: "Reports", description: "Sales, P&L, VAT, stock valuation; CSV / PDF export", roles: "Manager, Accountant", icon: "mdi-chart-box-outline", color: "primary", link: "module-reports" },
      { name: "Analytics", description: "Interactive dashboards and trends", roles: "Manager, Owner", icon: "mdi-chart-multiple", color: "info", link: "module-analytics" },
      { name: "Accounts", description: "Chart of accounts, ledger, journal, statements", roles: "Accountant", icon: "mdi-calculator-variant-outline", color: "success", link: "module-accounting" },
      { name: "IAM and Security", description: "Users, roles, permissions, sessions", roles: "Admin", icon: "mdi-shield-account-outline", color: "error", link: "roles" },
      { name: "Audit Logs", description: "Immutable trail of every user action", roles: "Admin, Auditor", icon: "mdi-history", color: "warning", link: "roles" },
      { name: "Branches", description: "Multi-branch management", roles: "Admin", icon: "mdi-source-branch", color: "primary", link: "modules" },
      { name: "API Billing", description: "Usage metering and subscription", roles: "Admin", icon: "mdi-credit-card-chip-outline", color: "secondary", link: "modules" }
    ];
    const roleHeaders = [
      { title: "Role", key: "name" },
      { title: "Description", key: "description", sortable: false },
      { title: "Can make sales", key: "sell" },
      { title: "Can manage stock", key: "stock" },
      { title: "Can manage users", key: "users" },
      { title: "Can view reports", key: "reports" }
    ];
    const roleRows = [
      { name: "Super Admin", description: "Platform owner — manages all tenants and billing", sell: "No", stock: "All tenants", users: "All tenants", reports: "All tenants" },
      { name: "Tenant Admin", description: "Owner of a workspace — full access", sell: "Yes", stock: "All branches", users: "Yes", reports: "Yes" },
      { name: "Manager", description: "Branch manager — operations, approvals, reports", sell: "Yes", stock: "Own branch", users: "Own branch", reports: "Own branch" },
      { name: "Accountant", description: "Books, VAT, financial statements", sell: "No", stock: "View only", users: "No", reports: "Yes" },
      { name: "Cashier", description: "Front-of-house sales and shifts", sell: "Yes", stock: "No", users: "No", reports: "Own sales" },
      { name: "Auditor", description: "Read-only access to audit logs and reports", sell: "No", stock: "View only", users: "View only", reports: "Yes" }
    ];
    const inventorySampleRows = [
      { sku: "SKU-001", product: "Coca-Cola 500ml", category: "Beverages", on_hand: 240, unit: "bottle", reorder_point: 50, value: 14400, status: "In Stock" },
      { sku: "SKU-002", product: "Bread Loaf", category: "Bakery", on_hand: 42, unit: "loaf", reorder_point: 20, value: 2310, status: "In Stock" },
      { sku: "SKU-003", product: "Milk 1L", category: "Dairy", on_hand: 18, unit: "carton", reorder_point: 25, value: 2160, status: "Low Stock" },
      { sku: "SKU-004", product: "Sugar 1kg", category: "Groceries", on_hand: 87, unit: "bag", reorder_point: 30, value: 18270, status: "In Stock" },
      { sku: "SKU-005", product: "Eggs (tray)", category: "Dairy", on_hand: 0, unit: "tray", reorder_point: 10, value: 0, status: "Out of Stock" },
      { sku: "SKU-006", product: "Rice 2kg", category: "Groceries", on_hand: 56, unit: "bag", reorder_point: 20, value: 19040, status: "In Stock" },
      { sku: "SKU-007", product: "Cooking Oil 1L", category: "Groceries", on_hand: 73, unit: "bottle", reorder_point: 25, value: 18980, status: "In Stock" },
      { sku: "SKU-008", product: "Tea Bags 100pk", category: "Beverages", on_hand: 8, unit: "box", reorder_point: 15, value: 1440, status: "Low Stock" }
    ];
    const productSampleRows = [
      { sku: "SKU-001", name: "Coca-Cola 500ml", category: "Beverages", brand: "Coca-Cola", unit: "bottle", cost_price: 45, selling_price: 60, tax_rate: 16, is_active: true },
      { sku: "SKU-002", name: "Bread Loaf", category: "Bakery", brand: "Prima", unit: "loaf", cost_price: 40, selling_price: 55, tax_rate: 0, is_active: true },
      { sku: "SKU-003", name: "Milk 1L", category: "Dairy", brand: "Brookside", unit: "carton", cost_price: 105, selling_price: 120, tax_rate: 0, is_active: true },
      { sku: "SKU-004", name: "Sugar 1kg", category: "Groceries", brand: "Mumias", unit: "bag", cost_price: 190, selling_price: 210, tax_rate: 16, is_active: true },
      { sku: "SKU-005", name: "Eggs (tray)", category: "Dairy", brand: "Kenchic", unit: "tray", cost_price: 420, selling_price: 450, tax_rate: 0, is_active: false },
      { sku: "SKU-006", name: "Rice 2kg", category: "Groceries", brand: "Pishori", unit: "bag", cost_price: 300, selling_price: 340, tax_rate: 0, is_active: true }
    ];
    const customerSampleRows = [
      { name: "John Ade", phone: "+254712345678", email: "john@example.com", loyalty_points: 340, credit_balance: 1200, total_spent: 38400 },
      { name: "Sarah Kamau", phone: "+254722334455", email: "sarah@example.com", loyalty_points: 1280, credit_balance: 0, total_spent: 124500 },
      { name: "Moses Otieno", phone: "+254733445566", email: "moses@example.com", loyalty_points: 75, credit_balance: 450, total_spent: 7300 },
      { name: "Mary Wanjiru", phone: "+254700112233", email: "mary@example.com", loyalty_points: 850, credit_balance: 0, total_spent: 56700 },
      { name: "David Kiptoo", phone: "+254711998877", email: "david@example.com", loyalty_points: 12, credit_balance: 2100, total_spent: 1800 }
    ];
    const poSampleRows = [
      { po_number: "PO-2026-001", supplier: "Coca-Cola Ltd", branch: "City", status: "Approved", order_date: "2026-01-04", total: 48e3 },
      { po_number: "PO-2026-002", supplier: "Prima Bakeries", branch: "Town", status: "Received", order_date: "2026-01-05", total: 12e3 },
      { po_number: "PO-2026-003", supplier: "Brookside Dairy", branch: "City", status: "Pending", order_date: "2026-01-06", total: 38500 },
      { po_number: "PO-2026-004", supplier: "Mumias Sugar", branch: "Town", status: "Draft", order_date: "2026-01-06", total: 24e3 },
      { po_number: "PO-2026-005", supplier: "Kenchic Ltd", branch: "Highway", status: "Received", order_date: "2026-01-03", total: 16800 }
    ];
    const journalSampleRows = [
      { entry_no: "JE-1001", date: "2026-01-06", account: "Cash", description: "Cash sale #1024", debit: 1250, credit: 0 },
      { entry_no: "JE-1001", date: "2026-01-06", account: "Sales Revenue", description: "Cash sale #1024", debit: 0, credit: 1078 },
      { entry_no: "JE-1001", date: "2026-01-06", account: "VAT Output", description: "VAT on sale #1024", debit: 0, credit: 172 },
      { entry_no: "JE-1002", date: "2026-01-06", account: "M-Pesa", description: "M-Pesa sale #1025", debit: 821, credit: 0 },
      { entry_no: "JE-1002", date: "2026-01-06", account: "Sales Revenue", description: "M-Pesa sale #1025", debit: 0, credit: 708 },
      { entry_no: "JE-1002", date: "2026-01-06", account: "VAT Output", description: "VAT on sale #1025", debit: 0, credit: 113 }
    ];
    const auditSampleRows = [
      { timestamp: "2026-01-06 14:32:18", user: "John Ade", action: "LOGIN", module: "Auth", ip_address: "41.90.1.12", status: "Success" },
      { timestamp: "2026-01-06 14:30:02", user: "Sarah Kamau", action: "CREATE", module: "Products", ip_address: "41.90.1.15", status: "Success" },
      { timestamp: "2026-01-06 14:25:44", user: "Moses Otieno", action: "SALE", module: "POS", ip_address: "41.90.1.18", status: "Success" },
      { timestamp: "2026-01-06 14:20:11", user: "John Ade", action: "DELETE", module: "Inventory", ip_address: "41.90.1.12", status: "Denied" },
      { timestamp: "2026-01-06 14:15:33", user: "Mary Wanjiru", action: "UPDATE", module: "Accounting", ip_address: "41.90.1.20", status: "Success" },
      { timestamp: "2026-01-06 14:10:09", user: "David Kiptoo", action: "LOGIN_FAILED", module: "Auth", ip_address: "41.90.1.25", status: "Failed" }
    ];
    const reportCategories = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    const reportSeries = [
      { name: "Revenue (KSh)", data: [62e3, 71e3, 58e3, 84e3, 76e3, 98e3, 81e3] },
      { name: "Transactions", data: [310, 342, 295, 348, 320, 380, 351] }
    ];
    const analyticsCategories = ["Coca-Cola 500ml", "Bread Loaf", "Milk 1L", "Sugar 1kg", "Rice 2kg", "Cooking Oil 1L"];
    const analyticsSeries = [
      { name: "Revenue (KSh)", data: [12e3, 9400, 8100, 7200, 6500, 5800] }
    ];
    const faqs = [
      { q: "How do I reset my password?", a: "On the login screen, click “Forgot password?”. If your admin has enabled self-service, you will receive a reset email. Otherwise, contact your workspace admin." },
      { q: "Can I use DomendraPOS offline?", a: "The POS terminal supports an offline mode for cash sales. Once reconnected, offline sales sync to the server automatically." },
      { q: "How are branches isolated?", a: "Each branch has its own stock-on-hand and shift sessions. Reports and dashboards can be filtered by branch or show all branches combined." },
      { q: "What currencies are supported?", a: "The default currency is Kenyan Shillings (KSh), but any ISO 4217 currency can be configured per workspace by the tenant admin." },
      { q: "How is VAT handled?", a: "Each product has a tax rate (e.g. 16% for standard rated, 0% for zero-rated). Sales compute output VAT automatically and post it to a VAT Output account. VAT returns aggregate this for filing." },
      { q: "How do I export my data?", a: "Every list page has an Export CSV button. Reports also export to PDF. See the API section for programmatic CSV access." },
      { q: "Is my data backed up?", a: "Yes. Daily encrypted backups are retained for 30 days. Super-admins can trigger on-demand backups from the Platform Dashboard." },
      { q: "Can I bulk-import products?", a: "Yes. On the Products page, download the Excel template, fill rows, and upload. The system validates and shows per-row errors before committing." },
      { q: "What happens to sales data if a cashier leaves?", a: "Sales remain attached to the cashier user record. Deactivating the user blocks new logins but preserves all historical sales and audit entries." }
    ];
    function scrollTo(id) {
    }
    const { exportCsv } = useCsvExport();
    function downloadApiAuditCsv() {
      exportCsv("audit-log-sample.csv", auditSampleRows, {
        columns: ["timestamp", "user", "action", "module", "ip_address", "status"]
      });
    }
    function downloadApiCartCsv() {
      exportCsv("daily-sales-sample.csv", reportCategories.map((cat, i) => ({
        day: cat,
        revenue: reportSeries[0].data[i],
        transactions: reportSeries[1].data[i]
      })), { columns: ["day", "revenue", "transactions"] });
    }
    return (_ctx, _push, _parent, _attrs) => {
      const _component_DocsSnapshot = __nuxt_component_0;
      const _component_DocsToc = __nuxt_component_1;
      const _component_DocsStepTimeline = __nuxt_component_2;
      const _component_DocsCsvExportDemo = __nuxt_component_3;
      const _component_DocsChartExportDemo = __nuxt_component_4;
      _push(`<div${ssrRenderAttrs(_attrs)} data-v-669b0dc0><section id="overview" class="hero-section pa-8 pa-md-12 mb-8" data-v-669b0dc0>`);
      _push(ssrRenderComponent(VRow, { align: "center" }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(ssrRenderComponent(VCol, {
              cols: "12",
              md: "7"
            }, {
              default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                if (_push3) {
                  _push3(ssrRenderComponent(VChip, {
                    size: "small",
                    variant: "tonal",
                    color: "primary",
                    class: "mb-4"
                  }, {
                    default: withCtx((_3, _push4, _parent4, _scopeId3) => {
                      if (_push4) {
                        _push4(ssrRenderComponent(VIcon, {
                          start: "",
                          size: "16"
                        }, {
                          default: withCtx((_4, _push5, _parent5, _scopeId4) => {
                            if (_push5) {
                              _push5(`mdi-book-open-variant`);
                            } else {
                              return [
                                createTextVNode("mdi-book-open-variant")
                              ];
                            }
                          }),
                          _: 1
                        }, _parent4, _scopeId3));
                        _push4(` User Guidelines `);
                      } else {
                        return [
                          createVNode(VIcon, {
                            start: "",
                            size: "16"
                          }, {
                            default: withCtx(() => [
                              createTextVNode("mdi-book-open-variant")
                            ]),
                            _: 1
                          }),
                          createTextVNode(" User Guidelines ")
                        ];
                      }
                    }),
                    _: 1
                  }, _parent3, _scopeId2));
                  _push3(`<h1 class="text-h3 text-md-h2 font-weight-bold hero-title mb-4" data-v-669b0dc0${_scopeId2}> DomendraPOS Documentation </h1><p class="text-h6 text-medium-emphasis hero-lede mb-6" style="${ssrRenderStyle({ "max-width": "560px" })}" data-v-669b0dc0${_scopeId2}> Everything you need to run a modern multi-branch retail business — point-of-sale, inventory, accounting, customers, suppliers, analytics, role-based security, and more. This guide walks you through every module with annotated screenshots, actionable steps, and downloadable CSV samples. </p><div class="d-flex flex-wrap ga-3" data-v-669b0dc0${_scopeId2}>`);
                  _push3(ssrRenderComponent(VBtn, {
                    color: "primary",
                    size: "large",
                    "prepend-icon": "mdi-login",
                    onClick: ($event) => ("navigateTo" in _ctx ? _ctx.navigateTo : unref(navigateTo))("/login")
                  }, {
                    default: withCtx((_3, _push4, _parent4, _scopeId3) => {
                      if (_push4) {
                        _push4(` Sign in to your workspace `);
                      } else {
                        return [
                          createTextVNode(" Sign in to your workspace ")
                        ];
                      }
                    }),
                    _: 1
                  }, _parent3, _scopeId2));
                  _push3(ssrRenderComponent(VBtn, {
                    variant: "outlined",
                    size: "large",
                    "prepend-icon": "mdi-view-dashboard-outline",
                    onClick: ($event) => scrollTo()
                  }, {
                    default: withCtx((_3, _push4, _parent4, _scopeId3) => {
                      if (_push4) {
                        _push4(` Explore modules `);
                      } else {
                        return [
                          createTextVNode(" Explore modules ")
                        ];
                      }
                    }),
                    _: 1
                  }, _parent3, _scopeId2));
                  _push3(`</div>`);
                } else {
                  return [
                    createVNode(VChip, {
                      size: "small",
                      variant: "tonal",
                      color: "primary",
                      class: "mb-4"
                    }, {
                      default: withCtx(() => [
                        createVNode(VIcon, {
                          start: "",
                          size: "16"
                        }, {
                          default: withCtx(() => [
                            createTextVNode("mdi-book-open-variant")
                          ]),
                          _: 1
                        }),
                        createTextVNode(" User Guidelines ")
                      ]),
                      _: 1
                    }),
                    createVNode("h1", { class: "text-h3 text-md-h2 font-weight-bold hero-title mb-4" }, " DomendraPOS Documentation "),
                    createVNode("p", {
                      class: "text-h6 text-medium-emphasis hero-lede mb-6",
                      style: { "max-width": "560px" }
                    }, " Everything you need to run a modern multi-branch retail business — point-of-sale, inventory, accounting, customers, suppliers, analytics, role-based security, and more. This guide walks you through every module with annotated screenshots, actionable steps, and downloadable CSV samples. "),
                    createVNode("div", { class: "d-flex flex-wrap ga-3" }, [
                      createVNode(VBtn, {
                        color: "primary",
                        size: "large",
                        "prepend-icon": "mdi-login",
                        onClick: ($event) => ("navigateTo" in _ctx ? _ctx.navigateTo : unref(navigateTo))("/login")
                      }, {
                        default: withCtx(() => [
                          createTextVNode(" Sign in to your workspace ")
                        ]),
                        _: 1
                      }, 8, ["onClick"]),
                      createVNode(VBtn, {
                        variant: "outlined",
                        size: "large",
                        "prepend-icon": "mdi-view-dashboard-outline",
                        onClick: ($event) => scrollTo()
                      }, {
                        default: withCtx(() => [
                          createTextVNode(" Explore modules ")
                        ]),
                        _: 1
                      }, 8, ["onClick"])
                    ])
                  ];
                }
              }),
              _: 1
            }, _parent2, _scopeId));
            _push2(ssrRenderComponent(VCol, {
              cols: "12",
              md: "5",
              class: "d-none d-md-block"
            }, {
              default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                if (_push3) {
                  _push3(`<div class="hero-frame" data-v-669b0dc0${_scopeId2}>`);
                  _push3(ssrRenderComponent(_component_DocsSnapshot, {
                    src: unref(loginSnapshot),
                    alt: "DomendraPOS login screen",
                    label: "Login screen"
                  }, null, _parent3, _scopeId2));
                  _push3(`</div>`);
                } else {
                  return [
                    createVNode("div", { class: "hero-frame" }, [
                      createVNode(_component_DocsSnapshot, {
                        src: unref(loginSnapshot),
                        alt: "DomendraPOS login screen",
                        label: "Login screen"
                      }, null, 8, ["src"])
                    ])
                  ];
                }
              }),
              _: 1
            }, _parent2, _scopeId));
          } else {
            return [
              createVNode(VCol, {
                cols: "12",
                md: "7"
              }, {
                default: withCtx(() => [
                  createVNode(VChip, {
                    size: "small",
                    variant: "tonal",
                    color: "primary",
                    class: "mb-4"
                  }, {
                    default: withCtx(() => [
                      createVNode(VIcon, {
                        start: "",
                        size: "16"
                      }, {
                        default: withCtx(() => [
                          createTextVNode("mdi-book-open-variant")
                        ]),
                        _: 1
                      }),
                      createTextVNode(" User Guidelines ")
                    ]),
                    _: 1
                  }),
                  createVNode("h1", { class: "text-h3 text-md-h2 font-weight-bold hero-title mb-4" }, " DomendraPOS Documentation "),
                  createVNode("p", {
                    class: "text-h6 text-medium-emphasis hero-lede mb-6",
                    style: { "max-width": "560px" }
                  }, " Everything you need to run a modern multi-branch retail business — point-of-sale, inventory, accounting, customers, suppliers, analytics, role-based security, and more. This guide walks you through every module with annotated screenshots, actionable steps, and downloadable CSV samples. "),
                  createVNode("div", { class: "d-flex flex-wrap ga-3" }, [
                    createVNode(VBtn, {
                      color: "primary",
                      size: "large",
                      "prepend-icon": "mdi-login",
                      onClick: ($event) => ("navigateTo" in _ctx ? _ctx.navigateTo : unref(navigateTo))("/login")
                    }, {
                      default: withCtx(() => [
                        createTextVNode(" Sign in to your workspace ")
                      ]),
                      _: 1
                    }, 8, ["onClick"]),
                    createVNode(VBtn, {
                      variant: "outlined",
                      size: "large",
                      "prepend-icon": "mdi-view-dashboard-outline",
                      onClick: ($event) => scrollTo()
                    }, {
                      default: withCtx(() => [
                        createTextVNode(" Explore modules ")
                      ]),
                      _: 1
                    }, 8, ["onClick"])
                  ])
                ]),
                _: 1
              }),
              createVNode(VCol, {
                cols: "12",
                md: "5",
                class: "d-none d-md-block"
              }, {
                default: withCtx(() => [
                  createVNode("div", { class: "hero-frame" }, [
                    createVNode(_component_DocsSnapshot, {
                      src: unref(loginSnapshot),
                      alt: "DomendraPOS login screen",
                      label: "Login screen"
                    }, null, 8, ["src"])
                  ])
                ]),
                _: 1
              })
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(ssrRenderComponent(VRow, {
        class: "mt-8",
        density: "comfortable"
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<!--[-->`);
            ssrRenderList(stats, (stat) => {
              _push2(ssrRenderComponent(VCol, {
                key: stat.label,
                cols: "6",
                md: "3"
              }, {
                default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                  if (_push3) {
                    _push3(ssrRenderComponent(VCard, {
                      rounded: "xl",
                      flat: "",
                      border: "",
                      class: "pa-4"
                    }, {
                      default: withCtx((_3, _push4, _parent4, _scopeId3) => {
                        if (_push4) {
                          _push4(ssrRenderComponent(VIcon, {
                            color: stat.color,
                            size: "28",
                            class: "mb-2"
                          }, {
                            default: withCtx((_4, _push5, _parent5, _scopeId4) => {
                              if (_push5) {
                                _push5(`${ssrInterpolate(stat.icon)}`);
                              } else {
                                return [
                                  createTextVNode(toDisplayString(stat.icon), 1)
                                ];
                              }
                            }),
                            _: 2
                          }, _parent4, _scopeId3));
                          _push4(`<div class="text-h5 font-weight-bold" data-v-669b0dc0${_scopeId3}>${ssrInterpolate(stat.value)}</div><div class="text-caption text-medium-emphasis" data-v-669b0dc0${_scopeId3}>${ssrInterpolate(stat.label)}</div>`);
                        } else {
                          return [
                            createVNode(VIcon, {
                              color: stat.color,
                              size: "28",
                              class: "mb-2"
                            }, {
                              default: withCtx(() => [
                                createTextVNode(toDisplayString(stat.icon), 1)
                              ]),
                              _: 2
                            }, 1032, ["color"]),
                            createVNode("div", { class: "text-h5 font-weight-bold" }, toDisplayString(stat.value), 1),
                            createVNode("div", { class: "text-caption text-medium-emphasis" }, toDisplayString(stat.label), 1)
                          ];
                        }
                      }),
                      _: 2
                    }, _parent3, _scopeId2));
                  } else {
                    return [
                      createVNode(VCard, {
                        rounded: "xl",
                        flat: "",
                        border: "",
                        class: "pa-4"
                      }, {
                        default: withCtx(() => [
                          createVNode(VIcon, {
                            color: stat.color,
                            size: "28",
                            class: "mb-2"
                          }, {
                            default: withCtx(() => [
                              createTextVNode(toDisplayString(stat.icon), 1)
                            ]),
                            _: 2
                          }, 1032, ["color"]),
                          createVNode("div", { class: "text-h5 font-weight-bold" }, toDisplayString(stat.value), 1),
                          createVNode("div", { class: "text-caption text-medium-emphasis" }, toDisplayString(stat.label), 1)
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
              (openBlock(), createBlock(Fragment, null, renderList(stats, (stat) => {
                return createVNode(VCol, {
                  key: stat.label,
                  cols: "6",
                  md: "3"
                }, {
                  default: withCtx(() => [
                    createVNode(VCard, {
                      rounded: "xl",
                      flat: "",
                      border: "",
                      class: "pa-4"
                    }, {
                      default: withCtx(() => [
                        createVNode(VIcon, {
                          color: stat.color,
                          size: "28",
                          class: "mb-2"
                        }, {
                          default: withCtx(() => [
                            createTextVNode(toDisplayString(stat.icon), 1)
                          ]),
                          _: 2
                        }, 1032, ["color"]),
                        createVNode("div", { class: "text-h5 font-weight-bold" }, toDisplayString(stat.value), 1),
                        createVNode("div", { class: "text-caption text-medium-emphasis" }, toDisplayString(stat.label), 1)
                      ]),
                      _: 2
                    }, 1024)
                  ]),
                  _: 2
                }, 1024);
              }), 64))
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`</section>`);
      _push(ssrRenderComponent(VRow, null, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(ssrRenderComponent(VCol, {
              cols: "12",
              md: "3",
              lg: "2",
              class: "d-none d-md-block"
            }, {
              default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                if (_push3) {
                  _push3(ssrRenderComponent(_component_DocsToc, { sections: tocSections }, null, _parent3, _scopeId2));
                } else {
                  return [
                    createVNode(_component_DocsToc, { sections: tocSections })
                  ];
                }
              }),
              _: 1
            }, _parent2, _scopeId));
            _push2(ssrRenderComponent(VCol, {
              cols: "12",
              md: "9",
              lg: "8",
              "offset-lg": "0",
              class: "docs-main"
            }, {
              default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                if (_push3) {
                  _push3(`<section id="getting-started" class="docs-section" data-v-669b0dc0${_scopeId2}><h2 class="text-h4 font-weight-bold mb-2 section-title" data-v-669b0dc0${_scopeId2}>`);
                  _push3(ssrRenderComponent(VIcon, {
                    color: "primary",
                    class: "mr-2"
                  }, {
                    default: withCtx((_3, _push4, _parent4, _scopeId3) => {
                      if (_push4) {
                        _push4(`mdi-rocket-launch-outline`);
                      } else {
                        return [
                          createTextVNode("mdi-rocket-launch-outline")
                        ];
                      }
                    }),
                    _: 1
                  }, _parent3, _scopeId2));
                  _push3(` Getting Started </h2><p class="text-body-1 text-medium-emphasis mb-4" data-v-669b0dc0${_scopeId2}> Set up your workspace, log in, and navigate the main layout. </p><h3 class="text-h6 font-weight-bold mb-1 mt-6" data-v-669b0dc0${_scopeId2}>1. Create a workspace</h3><p class="text-body-2 mb-3" data-v-669b0dc0${_scopeId2}> On the login screen, click <strong data-v-669b0dc0${_scopeId2}>“New to DomendraPOS? Create a workspace”</strong>. Fill in the workspace name, your admin email, currency (e.g. KSh for Kenya Shilling), and timezone. After you submit, you receive a confirmation email and your tenant (workspace) is provisioned. </p><h3 class="text-h6 font-weight-bold mb-1 mt-6" data-v-669b0dc0${_scopeId2}>2. Log in</h3>`);
                  _push3(ssrRenderComponent(_component_DocsSnapshot, {
                    src: unref(loginSnapshot),
                    alt: "Login screen with email, password, remember me, sign in button, and Documentation link",
                    label: "Fig 1. The login screen",
                    class: "mb-3"
                  }, null, _parent3, _scopeId2));
                  _push3(ssrRenderComponent(_component_DocsStepTimeline, { steps: loginSteps }, null, _parent3, _scopeId2));
                  _push3(ssrRenderComponent(VAlert, {
                    type: "info",
                    variant: "tonal",
                    class: "mt-3",
                    icon: "mdi-shield-lock-outline"
                  }, {
                    default: withCtx((_3, _push4, _parent4, _scopeId3) => {
                      if (_push4) {
                        _push4(` For security, your account is locked for 5 minutes after 5 failed attempts. If you forgot your password, contact your tenant admin or use “Forgot password?” link (if enabled by your workspace). `);
                      } else {
                        return [
                          createTextVNode(" For security, your account is locked for 5 minutes after 5 failed attempts. If you forgot your password, contact your tenant admin or use “Forgot password?” link (if enabled by your workspace). ")
                        ];
                      }
                    }),
                    _: 1
                  }, _parent3, _scopeId2));
                  _push3(`<h3 class="text-h6 font-weight-bold mb-1 mt-6" data-v-669b0dc0${_scopeId2}>3. Navigate the dashboard</h3>`);
                  _push3(ssrRenderComponent(_component_DocsSnapshot, {
                    src: unref(dashboardSnapshot),
                    alt: "Main dashboard with KPI cards, revenue chart, top products, and recent transactions",
                    label: "Fig 2. The dashboard",
                    class: "mb-3"
                  }, null, _parent3, _scopeId2));
                  _push3(`<p class="text-body-2 mb-3" data-v-669b0dc0${_scopeId2}>The main layout has three regions:</p>`);
                  _push3(ssrRenderComponent(VCard, {
                    rounded: "xl",
                    flat: "",
                    border: "",
                    class: "pa-4 mb-3"
                  }, {
                    default: withCtx((_3, _push4, _parent4, _scopeId3) => {
                      if (_push4) {
                        _push4(ssrRenderComponent(VRow, { density: "comfortable" }, {
                          default: withCtx((_4, _push5, _parent5, _scopeId4) => {
                            if (_push5) {
                              _push5(ssrRenderComponent(VCol, {
                                cols: "12",
                                md: "4"
                              }, {
                                default: withCtx((_5, _push6, _parent6, _scopeId5) => {
                                  if (_push6) {
                                    _push6(`<div class="d-flex align-start ga-2" data-v-669b0dc0${_scopeId5}>`);
                                    _push6(ssrRenderComponent(VIcon, {
                                      color: "primary",
                                      class: "mt-1"
                                    }, {
                                      default: withCtx((_6, _push7, _parent7, _scopeId6) => {
                                        if (_push7) {
                                          _push7(`mdi-menu`);
                                        } else {
                                          return [
                                            createTextVNode("mdi-menu")
                                          ];
                                        }
                                      }),
                                      _: 1
                                    }, _parent6, _scopeId5));
                                    _push6(`<div data-v-669b0dc0${_scopeId5}><div class="font-weight-bold" data-v-669b0dc0${_scopeId5}>Left sidebar</div><div class="text-body-2 text-medium-emphasis" data-v-669b0dc0${_scopeId5}> Collapsible rail with grouped navigation — Main, Administration, Platform. </div></div></div>`);
                                  } else {
                                    return [
                                      createVNode("div", { class: "d-flex align-start ga-2" }, [
                                        createVNode(VIcon, {
                                          color: "primary",
                                          class: "mt-1"
                                        }, {
                                          default: withCtx(() => [
                                            createTextVNode("mdi-menu")
                                          ]),
                                          _: 1
                                        }),
                                        createVNode("div", null, [
                                          createVNode("div", { class: "font-weight-bold" }, "Left sidebar"),
                                          createVNode("div", { class: "text-body-2 text-medium-emphasis" }, " Collapsible rail with grouped navigation — Main, Administration, Platform. ")
                                        ])
                                      ])
                                    ];
                                  }
                                }),
                                _: 1
                              }, _parent5, _scopeId4));
                              _push5(ssrRenderComponent(VCol, {
                                cols: "12",
                                md: "4"
                              }, {
                                default: withCtx((_5, _push6, _parent6, _scopeId5) => {
                                  if (_push6) {
                                    _push6(`<div class="d-flex align-start ga-2" data-v-669b0dc0${_scopeId5}>`);
                                    _push6(ssrRenderComponent(VIcon, {
                                      color: "primary",
                                      class: "mt-1"
                                    }, {
                                      default: withCtx((_6, _push7, _parent7, _scopeId6) => {
                                        if (_push7) {
                                          _push7(`mdi-toolbar`);
                                        } else {
                                          return [
                                            createTextVNode("mdi-toolbar")
                                          ];
                                        }
                                      }),
                                      _: 1
                                    }, _parent6, _scopeId5));
                                    _push6(`<div data-v-669b0dc0${_scopeId5}><div class="font-weight-bold" data-v-669b0dc0${_scopeId5}>Top app bar</div><div class="text-body-2 text-medium-emphasis" data-v-669b0dc0${_scopeId5}> Rail toggle, live clock, today&#39;s revenue, branch selector, theme toggle, user menu. </div></div></div>`);
                                  } else {
                                    return [
                                      createVNode("div", { class: "d-flex align-start ga-2" }, [
                                        createVNode(VIcon, {
                                          color: "primary",
                                          class: "mt-1"
                                        }, {
                                          default: withCtx(() => [
                                            createTextVNode("mdi-toolbar")
                                          ]),
                                          _: 1
                                        }),
                                        createVNode("div", null, [
                                          createVNode("div", { class: "font-weight-bold" }, "Top app bar"),
                                          createVNode("div", { class: "text-body-2 text-medium-emphasis" }, " Rail toggle, live clock, today's revenue, branch selector, theme toggle, user menu. ")
                                        ])
                                      ])
                                    ];
                                  }
                                }),
                                _: 1
                              }, _parent5, _scopeId4));
                              _push5(ssrRenderComponent(VCol, {
                                cols: "12",
                                md: "4"
                              }, {
                                default: withCtx((_5, _push6, _parent6, _scopeId5) => {
                                  if (_push6) {
                                    _push6(`<div class="d-flex align-start ga-2" data-v-669b0dc0${_scopeId5}>`);
                                    _push6(ssrRenderComponent(VIcon, {
                                      color: "primary",
                                      class: "mt-1"
                                    }, {
                                      default: withCtx((_6, _push7, _parent7, _scopeId6) => {
                                        if (_push7) {
                                          _push7(`mdi-format-page-break`);
                                        } else {
                                          return [
                                            createTextVNode("mdi-format-page-break")
                                          ];
                                        }
                                      }),
                                      _: 1
                                    }, _parent6, _scopeId5));
                                    _push6(`<div data-v-669b0dc0${_scopeId5}><div class="font-weight-bold" data-v-669b0dc0${_scopeId5}>Content area</div><div class="text-body-2 text-medium-emphasis" data-v-669b0dc0${_scopeId5}> The active page (Dashboard, POS, Inventory, Reports, etc.). </div></div></div>`);
                                  } else {
                                    return [
                                      createVNode("div", { class: "d-flex align-start ga-2" }, [
                                        createVNode(VIcon, {
                                          color: "primary",
                                          class: "mt-1"
                                        }, {
                                          default: withCtx(() => [
                                            createTextVNode("mdi-format-page-break")
                                          ]),
                                          _: 1
                                        }),
                                        createVNode("div", null, [
                                          createVNode("div", { class: "font-weight-bold" }, "Content area"),
                                          createVNode("div", { class: "text-body-2 text-medium-emphasis" }, " The active page (Dashboard, POS, Inventory, Reports, etc.). ")
                                        ])
                                      ])
                                    ];
                                  }
                                }),
                                _: 1
                              }, _parent5, _scopeId4));
                            } else {
                              return [
                                createVNode(VCol, {
                                  cols: "12",
                                  md: "4"
                                }, {
                                  default: withCtx(() => [
                                    createVNode("div", { class: "d-flex align-start ga-2" }, [
                                      createVNode(VIcon, {
                                        color: "primary",
                                        class: "mt-1"
                                      }, {
                                        default: withCtx(() => [
                                          createTextVNode("mdi-menu")
                                        ]),
                                        _: 1
                                      }),
                                      createVNode("div", null, [
                                        createVNode("div", { class: "font-weight-bold" }, "Left sidebar"),
                                        createVNode("div", { class: "text-body-2 text-medium-emphasis" }, " Collapsible rail with grouped navigation — Main, Administration, Platform. ")
                                      ])
                                    ])
                                  ]),
                                  _: 1
                                }),
                                createVNode(VCol, {
                                  cols: "12",
                                  md: "4"
                                }, {
                                  default: withCtx(() => [
                                    createVNode("div", { class: "d-flex align-start ga-2" }, [
                                      createVNode(VIcon, {
                                        color: "primary",
                                        class: "mt-1"
                                      }, {
                                        default: withCtx(() => [
                                          createTextVNode("mdi-toolbar")
                                        ]),
                                        _: 1
                                      }),
                                      createVNode("div", null, [
                                        createVNode("div", { class: "font-weight-bold" }, "Top app bar"),
                                        createVNode("div", { class: "text-body-2 text-medium-emphasis" }, " Rail toggle, live clock, today's revenue, branch selector, theme toggle, user menu. ")
                                      ])
                                    ])
                                  ]),
                                  _: 1
                                }),
                                createVNode(VCol, {
                                  cols: "12",
                                  md: "4"
                                }, {
                                  default: withCtx(() => [
                                    createVNode("div", { class: "d-flex align-start ga-2" }, [
                                      createVNode(VIcon, {
                                        color: "primary",
                                        class: "mt-1"
                                      }, {
                                        default: withCtx(() => [
                                          createTextVNode("mdi-format-page-break")
                                        ]),
                                        _: 1
                                      }),
                                      createVNode("div", null, [
                                        createVNode("div", { class: "font-weight-bold" }, "Content area"),
                                        createVNode("div", { class: "text-body-2 text-medium-emphasis" }, " The active page (Dashboard, POS, Inventory, Reports, etc.). ")
                                      ])
                                    ])
                                  ]),
                                  _: 1
                                })
                              ];
                            }
                          }),
                          _: 1
                        }, _parent4, _scopeId3));
                      } else {
                        return [
                          createVNode(VRow, { density: "comfortable" }, {
                            default: withCtx(() => [
                              createVNode(VCol, {
                                cols: "12",
                                md: "4"
                              }, {
                                default: withCtx(() => [
                                  createVNode("div", { class: "d-flex align-start ga-2" }, [
                                    createVNode(VIcon, {
                                      color: "primary",
                                      class: "mt-1"
                                    }, {
                                      default: withCtx(() => [
                                        createTextVNode("mdi-menu")
                                      ]),
                                      _: 1
                                    }),
                                    createVNode("div", null, [
                                      createVNode("div", { class: "font-weight-bold" }, "Left sidebar"),
                                      createVNode("div", { class: "text-body-2 text-medium-emphasis" }, " Collapsible rail with grouped navigation — Main, Administration, Platform. ")
                                    ])
                                  ])
                                ]),
                                _: 1
                              }),
                              createVNode(VCol, {
                                cols: "12",
                                md: "4"
                              }, {
                                default: withCtx(() => [
                                  createVNode("div", { class: "d-flex align-start ga-2" }, [
                                    createVNode(VIcon, {
                                      color: "primary",
                                      class: "mt-1"
                                    }, {
                                      default: withCtx(() => [
                                        createTextVNode("mdi-toolbar")
                                      ]),
                                      _: 1
                                    }),
                                    createVNode("div", null, [
                                      createVNode("div", { class: "font-weight-bold" }, "Top app bar"),
                                      createVNode("div", { class: "text-body-2 text-medium-emphasis" }, " Rail toggle, live clock, today's revenue, branch selector, theme toggle, user menu. ")
                                    ])
                                  ])
                                ]),
                                _: 1
                              }),
                              createVNode(VCol, {
                                cols: "12",
                                md: "4"
                              }, {
                                default: withCtx(() => [
                                  createVNode("div", { class: "d-flex align-start ga-2" }, [
                                    createVNode(VIcon, {
                                      color: "primary",
                                      class: "mt-1"
                                    }, {
                                      default: withCtx(() => [
                                        createTextVNode("mdi-format-page-break")
                                      ]),
                                      _: 1
                                    }),
                                    createVNode("div", null, [
                                      createVNode("div", { class: "font-weight-bold" }, "Content area"),
                                      createVNode("div", { class: "text-body-2 text-medium-emphasis" }, " The active page (Dashboard, POS, Inventory, Reports, etc.). ")
                                    ])
                                  ])
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
                  }, _parent3, _scopeId2));
                  _push3(`<h3 class="text-h6 font-weight-bold mb-1 mt-6" data-v-669b0dc0${_scopeId2}>4. Select a branch</h3><p class="text-body-2 mb-3" data-v-669b0dc0${_scopeId2}> Use the branch selector in the top app bar (top right). The default is <strong data-v-669b0dc0${_scopeId2}>“All Branches”</strong>. When you select a specific branch, all subsequent transactions, stock views, and reports are scoped to that branch. </p>`);
                  _push3(ssrRenderComponent(VAlert, {
                    type: "tip",
                    variant: "tonal",
                    color: "primary",
                    class: "mb-3",
                    icon: "mdi-lightbulb-on-outline"
                  }, {
                    default: withCtx((_3, _push4, _parent4, _scopeId3) => {
                      if (_push4) {
                        _push4(` Cashiers must select a branch before starting a POS session — sales are recorded against the active branch. `);
                      } else {
                        return [
                          createTextVNode(" Cashiers must select a branch before starting a POS session — sales are recorded against the active branch. ")
                        ];
                      }
                    }),
                    _: 1
                  }, _parent3, _scopeId2));
                  _push3(`</section>`);
                  _push3(ssrRenderComponent(VDivider, { class: "my-6" }, null, _parent3, _scopeId2));
                  _push3(`<section id="module-pos" class="docs-section" data-v-669b0dc0${_scopeId2}><h2 class="text-h4 font-weight-bold mb-2 section-title" data-v-669b0dc0${_scopeId2}>`);
                  _push3(ssrRenderComponent(VIcon, {
                    color: "primary",
                    class: "mr-2"
                  }, {
                    default: withCtx((_3, _push4, _parent4, _scopeId3) => {
                      if (_push4) {
                        _push4(`mdi-cart-outline`);
                      } else {
                        return [
                          createTextVNode("mdi-cart-outline")
                        ];
                      }
                    }),
                    _: 1
                  }, _parent3, _scopeId2));
                  _push3(` Point of Sale (POS) </h2><p class="text-body-1 text-medium-emphasis mb-4" data-v-669b0dc0${_scopeId2}> Make sales fast — scan, tap, accept payments, and issue receipts. </p>`);
                  _push3(ssrRenderComponent(_component_DocsSnapshot, {
                    src: unref(posSnapshot),
                    alt: "POS screen with product grid on left and cart panel on right",
                    label: "Fig 3. The POS terminal",
                    class: "mb-4"
                  }, null, _parent3, _scopeId2));
                  _push3(ssrRenderComponent(_component_DocsStepTimeline, { steps: posSteps }, null, _parent3, _scopeId2));
                  _push3(`<h3 class="text-h6 font-weight-bold mt-4 mb-1" data-v-669b0dc0${_scopeId2}>Payment methods</h3>`);
                  _push3(ssrRenderComponent(VCard, {
                    rounded: "xl",
                    flat: "",
                    border: "",
                    class: "pa-4 mb-3"
                  }, {
                    default: withCtx((_3, _push4, _parent4, _scopeId3) => {
                      if (_push4) {
                        _push4(ssrRenderComponent(VRow, { density: "comfortable" }, {
                          default: withCtx((_4, _push5, _parent5, _scopeId4) => {
                            if (_push5) {
                              _push5(ssrRenderComponent(VCol, {
                                cols: "12",
                                md: "4"
                              }, {
                                default: withCtx((_5, _push6, _parent6, _scopeId5) => {
                                  if (_push6) {
                                    _push6(ssrRenderComponent(VChip, {
                                      color: "success",
                                      "prepend-icon": "mdi-cash",
                                      variant: "flat"
                                    }, {
                                      default: withCtx((_6, _push7, _parent7, _scopeId6) => {
                                        if (_push7) {
                                          _push7(`Cash`);
                                        } else {
                                          return [
                                            createTextVNode("Cash")
                                          ];
                                        }
                                      }),
                                      _: 1
                                    }, _parent6, _scopeId5));
                                    _push6(`<p class="text-body-2 mt-2" data-v-669b0dc0${_scopeId5}>Record a cash payment. Enter the amount tendered to compute change.</p>`);
                                  } else {
                                    return [
                                      createVNode(VChip, {
                                        color: "success",
                                        "prepend-icon": "mdi-cash",
                                        variant: "flat"
                                      }, {
                                        default: withCtx(() => [
                                          createTextVNode("Cash")
                                        ]),
                                        _: 1
                                      }),
                                      createVNode("p", { class: "text-body-2 mt-2" }, "Record a cash payment. Enter the amount tendered to compute change.")
                                    ];
                                  }
                                }),
                                _: 1
                              }, _parent5, _scopeId4));
                              _push5(ssrRenderComponent(VCol, {
                                cols: "12",
                                md: "4"
                              }, {
                                default: withCtx((_5, _push6, _parent6, _scopeId5) => {
                                  if (_push6) {
                                    _push6(ssrRenderComponent(VChip, {
                                      color: "warning",
                                      "prepend-icon": "mdi-cellphone",
                                      variant: "flat"
                                    }, {
                                      default: withCtx((_6, _push7, _parent7, _scopeId6) => {
                                        if (_push7) {
                                          _push7(`M-Pesa`);
                                        } else {
                                          return [
                                            createTextVNode("M-Pesa")
                                          ];
                                        }
                                      }),
                                      _: 1
                                    }, _parent6, _scopeId5));
                                    _push6(`<p class="text-body-2 mt-2" data-v-669b0dc0${_scopeId5}>Mobile money. Enter customer phone number and STK push reference.</p>`);
                                  } else {
                                    return [
                                      createVNode(VChip, {
                                        color: "warning",
                                        "prepend-icon": "mdi-cellphone",
                                        variant: "flat"
                                      }, {
                                        default: withCtx(() => [
                                          createTextVNode("M-Pesa")
                                        ]),
                                        _: 1
                                      }),
                                      createVNode("p", { class: "text-body-2 mt-2" }, "Mobile money. Enter customer phone number and STK push reference.")
                                    ];
                                  }
                                }),
                                _: 1
                              }, _parent5, _scopeId4));
                              _push5(ssrRenderComponent(VCol, {
                                cols: "12",
                                md: "4"
                              }, {
                                default: withCtx((_5, _push6, _parent6, _scopeId5) => {
                                  if (_push6) {
                                    _push6(ssrRenderComponent(VChip, {
                                      color: "primary",
                                      "prepend-icon": "mdi-credit-card",
                                      variant: "flat"
                                    }, {
                                      default: withCtx((_6, _push7, _parent7, _scopeId6) => {
                                        if (_push7) {
                                          _push7(`Card`);
                                        } else {
                                          return [
                                            createTextVNode("Card")
                                          ];
                                        }
                                      }),
                                      _: 1
                                    }, _parent6, _scopeId5));
                                    _push6(`<p class="text-body-2 mt-2" data-v-669b0dc0${_scopeId5}>Credit / debit card. Record the gateway reference for reconciliation.</p>`);
                                  } else {
                                    return [
                                      createVNode(VChip, {
                                        color: "primary",
                                        "prepend-icon": "mdi-credit-card",
                                        variant: "flat"
                                      }, {
                                        default: withCtx(() => [
                                          createTextVNode("Card")
                                        ]),
                                        _: 1
                                      }),
                                      createVNode("p", { class: "text-body-2 mt-2" }, "Credit / debit card. Record the gateway reference for reconciliation.")
                                    ];
                                  }
                                }),
                                _: 1
                              }, _parent5, _scopeId4));
                            } else {
                              return [
                                createVNode(VCol, {
                                  cols: "12",
                                  md: "4"
                                }, {
                                  default: withCtx(() => [
                                    createVNode(VChip, {
                                      color: "success",
                                      "prepend-icon": "mdi-cash",
                                      variant: "flat"
                                    }, {
                                      default: withCtx(() => [
                                        createTextVNode("Cash")
                                      ]),
                                      _: 1
                                    }),
                                    createVNode("p", { class: "text-body-2 mt-2" }, "Record a cash payment. Enter the amount tendered to compute change.")
                                  ]),
                                  _: 1
                                }),
                                createVNode(VCol, {
                                  cols: "12",
                                  md: "4"
                                }, {
                                  default: withCtx(() => [
                                    createVNode(VChip, {
                                      color: "warning",
                                      "prepend-icon": "mdi-cellphone",
                                      variant: "flat"
                                    }, {
                                      default: withCtx(() => [
                                        createTextVNode("M-Pesa")
                                      ]),
                                      _: 1
                                    }),
                                    createVNode("p", { class: "text-body-2 mt-2" }, "Mobile money. Enter customer phone number and STK push reference.")
                                  ]),
                                  _: 1
                                }),
                                createVNode(VCol, {
                                  cols: "12",
                                  md: "4"
                                }, {
                                  default: withCtx(() => [
                                    createVNode(VChip, {
                                      color: "primary",
                                      "prepend-icon": "mdi-credit-card",
                                      variant: "flat"
                                    }, {
                                      default: withCtx(() => [
                                        createTextVNode("Card")
                                      ]),
                                      _: 1
                                    }),
                                    createVNode("p", { class: "text-body-2 mt-2" }, "Credit / debit card. Record the gateway reference for reconciliation.")
                                  ]),
                                  _: 1
                                })
                              ];
                            }
                          }),
                          _: 1
                        }, _parent4, _scopeId3));
                      } else {
                        return [
                          createVNode(VRow, { density: "comfortable" }, {
                            default: withCtx(() => [
                              createVNode(VCol, {
                                cols: "12",
                                md: "4"
                              }, {
                                default: withCtx(() => [
                                  createVNode(VChip, {
                                    color: "success",
                                    "prepend-icon": "mdi-cash",
                                    variant: "flat"
                                  }, {
                                    default: withCtx(() => [
                                      createTextVNode("Cash")
                                    ]),
                                    _: 1
                                  }),
                                  createVNode("p", { class: "text-body-2 mt-2" }, "Record a cash payment. Enter the amount tendered to compute change.")
                                ]),
                                _: 1
                              }),
                              createVNode(VCol, {
                                cols: "12",
                                md: "4"
                              }, {
                                default: withCtx(() => [
                                  createVNode(VChip, {
                                    color: "warning",
                                    "prepend-icon": "mdi-cellphone",
                                    variant: "flat"
                                  }, {
                                    default: withCtx(() => [
                                      createTextVNode("M-Pesa")
                                    ]),
                                    _: 1
                                  }),
                                  createVNode("p", { class: "text-body-2 mt-2" }, "Mobile money. Enter customer phone number and STK push reference.")
                                ]),
                                _: 1
                              }),
                              createVNode(VCol, {
                                cols: "12",
                                md: "4"
                              }, {
                                default: withCtx(() => [
                                  createVNode(VChip, {
                                    color: "primary",
                                    "prepend-icon": "mdi-credit-card",
                                    variant: "flat"
                                  }, {
                                    default: withCtx(() => [
                                      createTextVNode("Card")
                                    ]),
                                    _: 1
                                  }),
                                  createVNode("p", { class: "text-body-2 mt-2" }, "Credit / debit card. Record the gateway reference for reconciliation.")
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
                  }, _parent3, _scopeId2));
                  _push3(`<h3 class="text-h6 font-weight-bold mt-4 mb-1" data-v-669b0dc0${_scopeId2}>POS features</h3>`);
                  _push3(ssrRenderComponent(VList, {
                    lines: "two",
                    border: ""
                  }, {
                    default: withCtx((_3, _push4, _parent4, _scopeId3) => {
                      if (_push4) {
                        _push4(ssrRenderComponent(VListItem, {
                          "prepend-icon": "mdi-pause-box",
                          title: "Park / hold a sale",
                          subtitle: "Park a cart to serve another customer, then resume it."
                        }, null, _parent4, _scopeId3));
                        _push4(ssrRenderComponent(VListItem, {
                          "prepend-icon": "mdi-account-cash",
                          title: "Customer credit",
                          subtitle: "Issue credit sales to registered customers with outstanding balances."
                        }, null, _parent4, _scopeId3));
                        _push4(ssrRenderComponent(VListItem, {
                          "prepend-icon": "mdi-clock-start",
                          title: "Shift management",
                          subtitle: "Open / close shifts and print shift summaries (cashier reconciliation)."
                        }, null, _parent4, _scopeId3));
                        _push4(ssrRenderComponent(VListItem, {
                          "prepend-icon": "mdi-receipt",
                          title: "Receipts",
                          subtitle: "Print or email receipts; thermal printer friendly."
                        }, null, _parent4, _scopeId3));
                      } else {
                        return [
                          createVNode(VListItem, {
                            "prepend-icon": "mdi-pause-box",
                            title: "Park / hold a sale",
                            subtitle: "Park a cart to serve another customer, then resume it."
                          }),
                          createVNode(VListItem, {
                            "prepend-icon": "mdi-account-cash",
                            title: "Customer credit",
                            subtitle: "Issue credit sales to registered customers with outstanding balances."
                          }),
                          createVNode(VListItem, {
                            "prepend-icon": "mdi-clock-start",
                            title: "Shift management",
                            subtitle: "Open / close shifts and print shift summaries (cashier reconciliation)."
                          }),
                          createVNode(VListItem, {
                            "prepend-icon": "mdi-receipt",
                            title: "Receipts",
                            subtitle: "Print or email receipts; thermal printer friendly."
                          })
                        ];
                      }
                    }),
                    _: 1
                  }, _parent3, _scopeId2));
                  _push3(`</section>`);
                  _push3(ssrRenderComponent(VDivider, { class: "my-6" }, null, _parent3, _scopeId2));
                  _push3(`<section id="module-inventory" class="docs-section" data-v-669b0dc0${_scopeId2}><h2 class="text-h4 font-weight-bold mb-2 section-title" data-v-669b0dc0${_scopeId2}>`);
                  _push3(ssrRenderComponent(VIcon, {
                    color: "primary",
                    class: "mr-2"
                  }, {
                    default: withCtx((_3, _push4, _parent4, _scopeId3) => {
                      if (_push4) {
                        _push4(`mdi-warehouse-outline`);
                      } else {
                        return [
                          createTextVNode("mdi-warehouse-outline")
                        ];
                      }
                    }),
                    _: 1
                  }, _parent3, _scopeId2));
                  _push3(` Inventory </h2><p class="text-body-1 text-medium-emphasis mb-4" data-v-669b0dc0${_scopeId2}> Track stock-on-hand across branches, adjust quantities, transfer stock, and get low-stock alerts. </p>`);
                  _push3(ssrRenderComponent(_component_DocsSnapshot, {
                    src: unref(inventorySnapshot),
                    alt: "Inventory page with KPI cards, filters, and SKUs table",
                    label: "Fig 4. The inventory stock-on-hand page",
                    class: "mb-4"
                  }, null, _parent3, _scopeId2));
                  _push3(`<h3 class="text-h6 font-weight-bold mb-2" data-v-669b0dc0${_scopeId2}>Core concepts</h3>`);
                  _push3(ssrRenderComponent(VRow, { density: "comfortable" }, {
                    default: withCtx((_3, _push4, _parent4, _scopeId3) => {
                      if (_push4) {
                        _push4(`<!--[-->`);
                        ssrRenderList(inventoryConcepts, (concept) => {
                          _push4(ssrRenderComponent(VCol, {
                            key: concept.title,
                            cols: "12",
                            md: "6"
                          }, {
                            default: withCtx((_4, _push5, _parent5, _scopeId4) => {
                              if (_push5) {
                                _push5(ssrRenderComponent(VCard, {
                                  rounded: "lg",
                                  flat: "",
                                  border: "",
                                  class: "pa-3"
                                }, {
                                  default: withCtx((_5, _push6, _parent6, _scopeId5) => {
                                    if (_push6) {
                                      _push6(`<div class="d-flex align-start ga-2" data-v-669b0dc0${_scopeId5}>`);
                                      _push6(ssrRenderComponent(VIcon, {
                                        color: concept.color,
                                        class: "mt-1"
                                      }, {
                                        default: withCtx((_6, _push7, _parent7, _scopeId6) => {
                                          if (_push7) {
                                            _push7(`${ssrInterpolate(concept.icon)}`);
                                          } else {
                                            return [
                                              createTextVNode(toDisplayString(concept.icon), 1)
                                            ];
                                          }
                                        }),
                                        _: 2
                                      }, _parent6, _scopeId5));
                                      _push6(`<div data-v-669b0dc0${_scopeId5}><div class="font-weight-bold" data-v-669b0dc0${_scopeId5}>${ssrInterpolate(concept.title)}</div><div class="text-body-2 text-medium-emphasis" data-v-669b0dc0${_scopeId5}>${ssrInterpolate(concept.text)}</div></div></div>`);
                                    } else {
                                      return [
                                        createVNode("div", { class: "d-flex align-start ga-2" }, [
                                          createVNode(VIcon, {
                                            color: concept.color,
                                            class: "mt-1"
                                          }, {
                                            default: withCtx(() => [
                                              createTextVNode(toDisplayString(concept.icon), 1)
                                            ]),
                                            _: 2
                                          }, 1032, ["color"]),
                                          createVNode("div", null, [
                                            createVNode("div", { class: "font-weight-bold" }, toDisplayString(concept.title), 1),
                                            createVNode("div", { class: "text-body-2 text-medium-emphasis" }, toDisplayString(concept.text), 1)
                                          ])
                                        ])
                                      ];
                                    }
                                  }),
                                  _: 2
                                }, _parent5, _scopeId4));
                              } else {
                                return [
                                  createVNode(VCard, {
                                    rounded: "lg",
                                    flat: "",
                                    border: "",
                                    class: "pa-3"
                                  }, {
                                    default: withCtx(() => [
                                      createVNode("div", { class: "d-flex align-start ga-2" }, [
                                        createVNode(VIcon, {
                                          color: concept.color,
                                          class: "mt-1"
                                        }, {
                                          default: withCtx(() => [
                                            createTextVNode(toDisplayString(concept.icon), 1)
                                          ]),
                                          _: 2
                                        }, 1032, ["color"]),
                                        createVNode("div", null, [
                                          createVNode("div", { class: "font-weight-bold" }, toDisplayString(concept.title), 1),
                                          createVNode("div", { class: "text-body-2 text-medium-emphasis" }, toDisplayString(concept.text), 1)
                                        ])
                                      ])
                                    ]),
                                    _: 2
                                  }, 1024)
                                ];
                              }
                            }),
                            _: 2
                          }, _parent4, _scopeId3));
                        });
                        _push4(`<!--]-->`);
                      } else {
                        return [
                          (openBlock(), createBlock(Fragment, null, renderList(inventoryConcepts, (concept) => {
                            return createVNode(VCol, {
                              key: concept.title,
                              cols: "12",
                              md: "6"
                            }, {
                              default: withCtx(() => [
                                createVNode(VCard, {
                                  rounded: "lg",
                                  flat: "",
                                  border: "",
                                  class: "pa-3"
                                }, {
                                  default: withCtx(() => [
                                    createVNode("div", { class: "d-flex align-start ga-2" }, [
                                      createVNode(VIcon, {
                                        color: concept.color,
                                        class: "mt-1"
                                      }, {
                                        default: withCtx(() => [
                                          createTextVNode(toDisplayString(concept.icon), 1)
                                        ]),
                                        _: 2
                                      }, 1032, ["color"]),
                                      createVNode("div", null, [
                                        createVNode("div", { class: "font-weight-bold" }, toDisplayString(concept.title), 1),
                                        createVNode("div", { class: "text-body-2 text-medium-emphasis" }, toDisplayString(concept.text), 1)
                                      ])
                                    ])
                                  ]),
                                  _: 2
                                }, 1024)
                              ]),
                              _: 2
                            }, 1024);
                          }), 64))
                        ];
                      }
                    }),
                    _: 1
                  }, _parent3, _scopeId2));
                  _push3(`<h3 class="text-h6 font-weight-bold mt-5 mb-2" data-v-669b0dc0${_scopeId2}>Stock movements</h3>`);
                  _push3(ssrRenderComponent(_component_DocsStepTimeline, { steps: inventorySteps }, null, _parent3, _scopeId2));
                  _push3(`<h3 class="text-h6 font-weight-bold mt-5 mb-2" data-v-669b0dc0${_scopeId2}>Sample stock data (exportable)</h3>`);
                  _push3(ssrRenderComponent(_component_DocsCsvExportDemo, {
                    title: "Stock on hand export",
                    description: "A preview of the data returned by the inventory export endpoint. Click Download to save it as CSV.",
                    filename: "stock-on-hand.csv",
                    rows: inventorySampleRows,
                    columns: ["sku", "product", "category", "on_hand", "unit", "reorder_point", "value", "status"]
                  }, null, _parent3, _scopeId2));
                  _push3(`</section>`);
                  _push3(ssrRenderComponent(VDivider, { class: "my-6" }, null, _parent3, _scopeId2));
                  _push3(`<section id="module-products" class="docs-section" data-v-669b0dc0${_scopeId2}><h2 class="text-h4 font-weight-bold mb-2 section-title" data-v-669b0dc0${_scopeId2}>`);
                  _push3(ssrRenderComponent(VIcon, {
                    color: "primary",
                    class: "mr-2"
                  }, {
                    default: withCtx((_3, _push4, _parent4, _scopeId3) => {
                      if (_push4) {
                        _push4(`mdi-package-variant-closed`);
                      } else {
                        return [
                          createTextVNode("mdi-package-variant-closed")
                        ];
                      }
                    }),
                    _: 1
                  }, _parent3, _scopeId2));
                  _push3(` Products </h2><p class="text-body-1 text-medium-emphasis mb-4" data-v-669b0dc0${_scopeId2}> Define the catalog: products, brands, categories, units of measure, variants, and bulk import. </p>`);
                  _push3(ssrRenderComponent(_component_DocsStepTimeline, { steps: productSteps }, null, _parent3, _scopeId2));
                  _push3(ssrRenderComponent(VAlert, {
                    type: "info",
                    variant: "tonal",
                    class: "my-3",
                    icon: "mdi-file-excel-outline"
                  }, {
                    default: withCtx((_3, _push4, _parent4, _scopeId3) => {
                      if (_push4) {
                        _push4(`<strong data-v-669b0dc0${_scopeId3}>Bulk Excel import.</strong> Download the template from the Products page, fill in rows, then upload. Supported columns: name, SKU, barcode, category, brand, unit, cost price, selling price, tax rate, opening stock. `);
                      } else {
                        return [
                          createVNode("strong", null, "Bulk Excel import."),
                          createTextVNode(" Download the template from the Products page, fill in rows, then upload. Supported columns: name, SKU, barcode, category, brand, unit, cost price, selling price, tax rate, opening stock. ")
                        ];
                      }
                    }),
                    _: 1
                  }, _parent3, _scopeId2));
                  _push3(`<p class="text-body-2 mb-2 mt-3" data-v-669b0dc0${_scopeId2}>Sample product catalog data (exportable):</p>`);
                  _push3(ssrRenderComponent(_component_DocsCsvExportDemo, {
                    title: "Product catalog export",
                    description: "Export your full product catalog with prices and stock for spreadsheet analysis.",
                    filename: "product-catalog.csv",
                    rows: productSampleRows,
                    columns: ["sku", "name", "category", "brand", "unit", "cost_price", "selling_price", "tax_rate", "is_active"]
                  }, null, _parent3, _scopeId2));
                  _push3(`</section>`);
                  _push3(ssrRenderComponent(VDivider, { class: "my-6" }, null, _parent3, _scopeId2));
                  _push3(`<section id="module-customers" class="docs-section" data-v-669b0dc0${_scopeId2}><h2 class="text-h4 font-weight-bold mb-2 section-title" data-v-669b0dc0${_scopeId2}>`);
                  _push3(ssrRenderComponent(VIcon, {
                    color: "primary",
                    class: "mr-2"
                  }, {
                    default: withCtx((_3, _push4, _parent4, _scopeId3) => {
                      if (_push4) {
                        _push4(`mdi-account-group-outline`);
                      } else {
                        return [
                          createTextVNode("mdi-account-group-outline")
                        ];
                      }
                    }),
                    _: 1
                  }, _parent3, _scopeId2));
                  _push3(` Customers </h2><p class="text-body-1 text-medium-emphasis mb-4" data-v-669b0dc0${_scopeId2}> Build a customer CRM — loyalty points, store credit, purchase history, and outstanding balances. </p>`);
                  _push3(ssrRenderComponent(_component_DocsStepTimeline, { steps: customerSteps }, null, _parent3, _scopeId2));
                  _push3(`<h3 class="text-h6 font-weight-bold mt-4 mb-2" data-v-669b0dc0${_scopeId2}>Customer balances export</h3>`);
                  _push3(ssrRenderComponent(_component_DocsCsvExportDemo, {
                    title: "Customer balances",
                    description: "Who owes you how much. Filter the list on the Customers page and export outstanding balances.",
                    filename: "customer-balances.csv",
                    rows: customerSampleRows,
                    columns: ["name", "phone", "email", "loyalty_points", "credit_balance", "total_spent"]
                  }, null, _parent3, _scopeId2));
                  _push3(`</section>`);
                  _push3(ssrRenderComponent(VDivider, { class: "my-6" }, null, _parent3, _scopeId2));
                  _push3(`<section id="module-suppliers" class="docs-section" data-v-669b0dc0${_scopeId2}><h2 class="text-h4 font-weight-bold mb-2 section-title" data-v-669b0dc0${_scopeId2}>`);
                  _push3(ssrRenderComponent(VIcon, {
                    color: "primary",
                    class: "mr-2"
                  }, {
                    default: withCtx((_3, _push4, _parent4, _scopeId3) => {
                      if (_push4) {
                        _push4(`mdi-truck-delivery-outline`);
                      } else {
                        return [
                          createTextVNode("mdi-truck-delivery-outline")
                        ];
                      }
                    }),
                    _: 1
                  }, _parent3, _scopeId2));
                  _push3(` Suppliers and Purchasing </h2><p class="text-body-1 text-medium-emphasis mb-4" data-v-669b0dc0${_scopeId2}> Manage suppliers, raise purchase orders (POs), receive goods into stock, and track payables. </p>`);
                  _push3(ssrRenderComponent(_component_DocsStepTimeline, { steps: supplierSteps }, null, _parent3, _scopeId2));
                  _push3(`<p class="text-body-2 mt-3 mb-2" data-v-669b0dc0${_scopeId2}>Sample purchase order data (exportable):</p>`);
                  _push3(ssrRenderComponent(_component_DocsCsvExportDemo, {
                    title: "Purchase orders export",
                    description: "POs by status with line totals and supplier info.",
                    filename: "purchase-orders.csv",
                    rows: poSampleRows,
                    columns: ["po_number", "supplier", "branch", "status", "order_date", "total"]
                  }, null, _parent3, _scopeId2));
                  _push3(`</section>`);
                  _push3(ssrRenderComponent(VDivider, { class: "my-6" }, null, _parent3, _scopeId2));
                  _push3(`<section id="module-reports" class="docs-section" data-v-669b0dc0${_scopeId2}><h2 class="text-h4 font-weight-bold mb-2 section-title" data-v-669b0dc0${_scopeId2}>`);
                  _push3(ssrRenderComponent(VIcon, {
                    color: "primary",
                    class: "mr-2"
                  }, {
                    default: withCtx((_3, _push4, _parent4, _scopeId3) => {
                      if (_push4) {
                        _push4(`mdi-chart-box-outline`);
                      } else {
                        return [
                          createTextVNode("mdi-chart-box-outline")
                        ];
                      }
                    }),
                    _: 1
                  }, _parent3, _scopeId2));
                  _push3(` Reports </h2><p class="text-body-1 text-medium-emphasis mb-4" data-v-669b0dc0${_scopeId2}> Generate sales summaries, profit and loss, VAT returns, and stock valuation for any period and branch. </p>`);
                  _push3(ssrRenderComponent(_component_DocsSnapshot, {
                    src: unref(reportsSnapshot),
                    alt: "Sales summary report with KPIs, line chart, and payment method breakdown",
                    label: "Fig 5. Sales summary report",
                    class: "mb-4"
                  }, null, _parent3, _scopeId2));
                  _push3(ssrRenderComponent(_component_DocsStepTimeline, { steps: reportSteps }, null, _parent3, _scopeId2));
                  _push3(ssrRenderComponent(VAlert, {
                    type: "info",
                    variant: "tonal",
                    class: "mb-3",
                    icon: "mdi-file-export-outline"
                  }, {
                    default: withCtx((_3, _push4, _parent4, _scopeId3) => {
                      if (_push4) {
                        _push4(` Every report page has <strong data-v-669b0dc0${_scopeId3}>Export CSV</strong> and <strong data-v-669b0dc0${_scopeId3}>Export PDF</strong> buttons. CSV gives you raw data for spreadsheets; PDF gives you a printable layout for sharing. `);
                      } else {
                        return [
                          createTextVNode(" Every report page has "),
                          createVNode("strong", null, "Export CSV"),
                          createTextVNode(" and "),
                          createVNode("strong", null, "Export PDF"),
                          createTextVNode(" buttons. CSV gives you raw data for spreadsheets; PDF gives you a printable layout for sharing. ")
                        ];
                      }
                    }),
                    _: 1
                  }, _parent3, _scopeId2));
                  _push3(`<h3 class="text-h6 font-weight-bold mb-2" data-v-669b0dc0${_scopeId2}>Interactive sample — Sales by day</h3>`);
                  _push3(ssrRenderComponent(_component_DocsChartExportDemo, {
                    title: "Daily sales (sample)",
                    description: "A sample chart produced by the Reports module. Export the underlying data as CSV.",
                    filename: "daily-sales.csv",
                    categories: reportCategories,
                    series: reportSeries
                  }, null, _parent3, _scopeId2));
                  _push3(`</section>`);
                  _push3(ssrRenderComponent(VDivider, { class: "my-6" }, null, _parent3, _scopeId2));
                  _push3(`<section id="module-analytics" class="docs-section" data-v-669b0dc0${_scopeId2}><h2 class="text-h4 font-weight-bold mb-2 section-title" data-v-669b0dc0${_scopeId2}>`);
                  _push3(ssrRenderComponent(VIcon, {
                    color: "primary",
                    class: "mr-2"
                  }, {
                    default: withCtx((_3, _push4, _parent4, _scopeId3) => {
                      if (_push4) {
                        _push4(`mdi-chart-multiple`);
                      } else {
                        return [
                          createTextVNode("mdi-chart-multiple")
                        ];
                      }
                    }),
                    _: 1
                  }, _parent3, _scopeId2));
                  _push3(` Analytics </h2><p class="text-body-1 text-medium-emphasis mb-4" data-v-669b0dc0${_scopeId2}> Interactive dashboards: ABC analysis, revenue trends, top products, staff performance, peak hours. </p>`);
                  _push3(ssrRenderComponent(_component_DocsChartExportDemo, {
                    title: "Top products by revenue (sample)",
                    description: "Visualize which products generate the most revenue. Export for further analysis.",
                    filename: "top-products.csv",
                    categories: analyticsCategories,
                    series: analyticsSeries
                  }, null, _parent3, _scopeId2));
                  _push3(ssrRenderComponent(VAlert, {
                    type: "info",
                    variant: "tonal",
                    class: "mb-3 mt-4",
                    icon: "mdi-chart-bell-curve"
                  }, {
                    default: withCtx((_3, _push4, _parent4, _scopeId3) => {
                      if (_push4) {
                        _push4(`<strong data-v-669b0dc0${_scopeId3}>ABC Analysis.</strong> Inventory is segmented into A (top 20% by value), B (next 30%), and C (remaining 50%) so you can prioritize reordering. `);
                      } else {
                        return [
                          createVNode("strong", null, "ABC Analysis."),
                          createTextVNode(" Inventory is segmented into A (top 20% by value), B (next 30%), and C (remaining 50%) so you can prioritize reordering. ")
                        ];
                      }
                    }),
                    _: 1
                  }, _parent3, _scopeId2));
                  _push3(`</section>`);
                  _push3(ssrRenderComponent(VDivider, { class: "my-6" }, null, _parent3, _scopeId2));
                  _push3(`<section id="module-accounting" class="docs-section" data-v-669b0dc0${_scopeId2}><h2 class="text-h4 font-weight-bold mb-2 section-title" data-v-669b0dc0${_scopeId2}>`);
                  _push3(ssrRenderComponent(VIcon, {
                    color: "primary",
                    class: "mr-2"
                  }, {
                    default: withCtx((_3, _push4, _parent4, _scopeId3) => {
                      if (_push4) {
                        _push4(`mdi-calculator-variant-outline`);
                      } else {
                        return [
                          createTextVNode("mdi-calculator-variant-outline")
                        ];
                      }
                    }),
                    _: 1
                  }, _parent3, _scopeId2));
                  _push3(` Accounts and Finance </h2><p class="text-body-1 text-medium-emphasis mb-4" data-v-669b0dc0${_scopeId2}> Chart of accounts, journal entries, ledgers, VAT, and financial statements. </p>`);
                  _push3(ssrRenderComponent(_component_DocsStepTimeline, { steps: accountingSteps }, null, _parent3, _scopeId2));
                  _push3(`<p class="text-body-2 mt-3 mb-2" data-v-669b0dc0${_scopeId2}>Sample journal entries (exportable):</p>`);
                  _push3(ssrRenderComponent(_component_DocsCsvExportDemo, {
                    title: "Journal entries export",
                    description: "Export posted journal entries with debit and credit lines for accounting review.",
                    filename: "journal-entries.csv",
                    rows: journalSampleRows,
                    columns: ["entry_no", "date", "account", "description", "debit", "credit"]
                  }, null, _parent3, _scopeId2));
                  _push3(`</section>`);
                  _push3(ssrRenderComponent(VDivider, { class: "my-6" }, null, _parent3, _scopeId2));
                  _push3(`<section id="modules" class="docs-section" data-v-669b0dc0${_scopeId2}><h2 class="text-h4 font-weight-bold mb-2 section-title" data-v-669b0dc0${_scopeId2}>`);
                  _push3(ssrRenderComponent(VIcon, {
                    color: "primary",
                    class: "mr-2"
                  }, {
                    default: withCtx((_3, _push4, _parent4, _scopeId3) => {
                      if (_push4) {
                        _push4(`mdi-view-module-outline`);
                      } else {
                        return [
                          createTextVNode("mdi-view-module-outline")
                        ];
                      }
                    }),
                    _: 1
                  }, _parent3, _scopeId2));
                  _push3(` All Modules at a Glance </h2><p class="text-body-1 text-medium-emphasis mb-4" data-v-669b0dc0${_scopeId2}> A quick reference table of every module and its main capabilities. </p>`);
                  _push3(ssrRenderComponent(VDataTable, {
                    headers: moduleHeaders,
                    items: moduleRows,
                    density: "comfortable",
                    class: "border rounded-xl",
                    "items-per-page": "-1"
                  }, {
                    "item.icon": withCtx(({ item }, _push4, _parent4, _scopeId3) => {
                      if (_push4) {
                        _push4(ssrRenderComponent(VIcon, {
                          color: item.color,
                          size: "22"
                        }, {
                          default: withCtx((_3, _push5, _parent5, _scopeId4) => {
                            if (_push5) {
                              _push5(`${ssrInterpolate(item.icon)}`);
                            } else {
                              return [
                                createTextVNode(toDisplayString(item.icon), 1)
                              ];
                            }
                          }),
                          _: 2
                        }, _parent4, _scopeId3));
                      } else {
                        return [
                          createVNode(VIcon, {
                            color: item.color,
                            size: "22"
                          }, {
                            default: withCtx(() => [
                              createTextVNode(toDisplayString(item.icon), 1)
                            ]),
                            _: 2
                          }, 1032, ["color"])
                        ];
                      }
                    }),
                    "item.actions": withCtx(({ item }, _push4, _parent4, _scopeId3) => {
                      if (_push4) {
                        _push4(ssrRenderComponent(VBtn, {
                          size: "small",
                          variant: "text",
                          color: "primary",
                          onClick: ($event) => scrollTo(item.link)
                        }, {
                          default: withCtx((_3, _push5, _parent5, _scopeId4) => {
                            if (_push5) {
                              _push5(` Read `);
                            } else {
                              return [
                                createTextVNode(" Read ")
                              ];
                            }
                          }),
                          _: 2
                        }, _parent4, _scopeId3));
                      } else {
                        return [
                          createVNode(VBtn, {
                            size: "small",
                            variant: "text",
                            color: "primary",
                            onClick: ($event) => scrollTo(item.link)
                          }, {
                            default: withCtx(() => [
                              createTextVNode(" Read ")
                            ]),
                            _: 1
                          }, 8, ["onClick"])
                        ];
                      }
                    }),
                    _: 1
                  }, _parent3, _scopeId2));
                  _push3(`</section>`);
                  _push3(ssrRenderComponent(VDivider, { class: "my-6" }, null, _parent3, _scopeId2));
                  _push3(`<section id="roles" class="docs-section" data-v-669b0dc0${_scopeId2}><h2 class="text-h4 font-weight-bold mb-2 section-title" data-v-669b0dc0${_scopeId2}>`);
                  _push3(ssrRenderComponent(VIcon, {
                    color: "primary",
                    class: "mr-2"
                  }, {
                    default: withCtx((_3, _push4, _parent4, _scopeId3) => {
                      if (_push4) {
                        _push4(`mdi-shield-account-outline`);
                      } else {
                        return [
                          createTextVNode("mdi-shield-account-outline")
                        ];
                      }
                    }),
                    _: 1
                  }, _parent3, _scopeId2));
                  _push3(` Roles, Permissions, and Audit </h2><p class="text-body-1 text-medium-emphasis mb-4" data-v-669b0dc0${_scopeId2}> Fine-grained Role-Based Access Control (RBAC) with audit logging. Every action is recorded. </p>`);
                  _push3(ssrRenderComponent(_component_DocsSnapshot, {
                    src: unref(iamSnapshot),
                    alt: "IAM page showing users with roles, statuses, and KPIs",
                    label: "Fig 6. The IAM page",
                    class: "mb-4"
                  }, null, _parent3, _scopeId2));
                  _push3(`<h3 class="text-h6 font-weight-bold mb-2" data-v-669b0dc0${_scopeId2}>Default roles</h3>`);
                  _push3(ssrRenderComponent(VDataTable, {
                    headers: roleHeaders,
                    items: roleRows,
                    density: "comfortable",
                    class: "border rounded-xl mb-4",
                    "items-per-page": "-1"
                  }, null, _parent3, _scopeId2));
                  _push3(`<h3 class="text-h6 font-weight-bold mb-2" data-v-669b0dc0${_scopeId2}>Audit logs</h3><p class="text-body-2 mb-3" data-v-669b0dc0${_scopeId2}> Every login, create, update, delete, permission change, and export is recorded with user, IP, module, action, and timestamp. Tenant admins and auditors can filter and export the audit trail. </p>`);
                  _push3(ssrRenderComponent(_component_DocsSnapshot, {
                    src: unref(auditSnapshot),
                    alt: "Audit logs page with filters and timeline of actions by user, module, status",
                    label: "Fig 7. The audit log",
                    class: "mb-4"
                  }, null, _parent3, _scopeId2));
                  _push3(ssrRenderComponent(_component_DocsCsvExportDemo, {
                    title: "Audit log export",
                    description: "Filter the audit log by user, action, module, date, and export for compliance reporting.",
                    filename: "audit-log.csv",
                    rows: auditSampleRows,
                    columns: ["timestamp", "user", "action", "module", "ip_address", "status"]
                  }, null, _parent3, _scopeId2));
                  _push3(`</section>`);
                  _push3(ssrRenderComponent(VDivider, { class: "my-6" }, null, _parent3, _scopeId2));
                  _push3(`<section id="api-and-exports" class="docs-section" data-v-669b0dc0${_scopeId2}><h2 class="text-h4 font-weight-bold mb-2 section-title" data-v-669b0dc0${_scopeId2}>`);
                  _push3(ssrRenderComponent(VIcon, {
                    color: "primary",
                    class: "mr-2"
                  }, {
                    default: withCtx((_3, _push4, _parent4, _scopeId3) => {
                      if (_push4) {
                        _push4(`mdi-api`);
                      } else {
                        return [
                          createTextVNode("mdi-api")
                        ];
                      }
                    }),
                    _: 1
                  }, _parent3, _scopeId2));
                  _push3(` API and Exports </h2><p class="text-body-1 text-medium-emphasis mb-4" data-v-669b0dc0${_scopeId2}> All list pages expose a REST API at <code data-v-669b0dc0${_scopeId2}>/api</code> and support CSV export. Here is how. </p><h3 class="text-h6 font-weight-bold mb-2" data-v-669b0dc0${_scopeId2}>Authentication</h3><p class="text-body-2 mb-3" data-v-669b0dc0${_scopeId2}> The frontend uses JWT access and refresh tokens. The token is sent as <code data-v-669b0dc0${_scopeId2}>Authorization: Bearer &lt;access_token&gt;</code>. Access tokens expire every 15 minutes and are refreshed automatically on 401 responses. </p>`);
                  _push3(ssrRenderComponent(VCard, {
                    rounded: "lg",
                    flat: "",
                    border: "",
                    class: "pa-4 mb-3"
                  }, {
                    default: withCtx((_3, _push4, _parent4, _scopeId3) => {
                      if (_push4) {
                        _push4(`<pre class="code-block" data-v-669b0dc0${_scopeId3}>POST /api/auth/login/
Content-Type: application/json

{
  &quot;email&quot;: &quot;you@example.com&quot;,
  &quot;password&quot;: &quot;your-password&quot;
}</pre>`);
                      } else {
                        return [
                          createVNode("pre", { class: "code-block" }, 'POST /api/auth/login/\nContent-Type: application/json\n\n{\n  "email": "you@example.com",\n  "password": "your-password"\n}')
                        ];
                      }
                    }),
                    _: 1
                  }, _parent3, _scopeId2));
                  _push3(`<h3 class="text-h6 font-weight-bold mb-2" data-v-669b0dc0${_scopeId2}>Refreshing the token</h3>`);
                  _push3(ssrRenderComponent(VCard, {
                    rounded: "lg",
                    flat: "",
                    border: "",
                    class: "pa-4 mb-3"
                  }, {
                    default: withCtx((_3, _push4, _parent4, _scopeId3) => {
                      if (_push4) {
                        _push4(`<pre class="code-block" data-v-669b0dc0${_scopeId3}>POST /api/auth/refresh/
Authorization: Bearer &lt;refresh_token&gt;</pre>`);
                      } else {
                        return [
                          createVNode("pre", { class: "code-block" }, "POST /api/auth/refresh/\nAuthorization: Bearer <refresh_token>")
                        ];
                      }
                    }),
                    _: 1
                  }, _parent3, _scopeId2));
                  _push3(`<h3 class="text-h6 font-weight-bold mb-2" data-v-669b0dc0${_scopeId2}>Listing resources</h3>`);
                  _push3(ssrRenderComponent(VCard, {
                    rounded: "lg",
                    flat: "",
                    border: "",
                    class: "pa-4 mb-3"
                  }, {
                    default: withCtx((_3, _push4, _parent4, _scopeId3) => {
                      if (_push4) {
                        _push4(`<pre class="code-block" data-v-669b0dc0${_scopeId3}>GET /api/products/?search=bread&amp;category=groceries&amp;ordering=-created_at
Authorization: Bearer &lt;access_token&gt;

# Response shape:
{
  &quot;count&quot;: 128,
  &quot;next&quot;: &quot;https://…/api/products/?page=2&quot;,
  &quot;previous&quot;: null,
  &quot;results&quot;: [ {…}, {…}, … ]
}</pre>`);
                      } else {
                        return [
                          createVNode("pre", { class: "code-block" }, 'GET /api/products/?search=bread&category=groceries&ordering=-created_at\nAuthorization: Bearer <access_token>\n\n# Response shape:\n{\n  "count": 128,\n  "next": "https://…/api/products/?page=2",\n  "previous": null,\n  "results": [ {…}, {…}, … ]\n}')
                        ];
                      }
                    }),
                    _: 1
                  }, _parent3, _scopeId2));
                  _push3(`<h3 class="text-h6 font-weight-bold mb-2" data-v-669b0dc0${_scopeId2}>Audit trail / Logs</h3>`);
                  _push3(ssrRenderComponent(VCard, {
                    rounded: "lg",
                    flat: "",
                    border: "",
                    class: "pa-3 mb-3"
                  }, {
                    default: withCtx((_3, _push4, _parent4, _scopeId3) => {
                      if (_push4) {
                        _push4(ssrRenderComponent(VRow, { density: "comfortable" }, {
                          default: withCtx((_4, _push5, _parent5, _scopeId4) => {
                            if (_push5) {
                              _push5(ssrRenderComponent(VCol, {
                                cols: "12",
                                md: "6"
                              }, {
                                default: withCtx((_5, _push6, _parent6, _scopeId5) => {
                                  if (_push6) {
                                    _push6(ssrRenderComponent(VRow, { density: "comfortable" }, {
                                      default: withCtx((_6, _push7, _parent7, _scopeId6) => {
                                        if (_push7) {
                                          _push7(ssrRenderComponent(VCol, { cols: "auto" }, {
                                            default: withCtx((_7, _push8, _parent8, _scopeId7) => {
                                              if (_push8) {
                                                _push8(ssrRenderComponent(VBtn, {
                                                  color: "primary",
                                                  variant: "flat",
                                                  size: "small",
                                                  "prepend-icon": "mdi-download",
                                                  onClick: downloadApiAuditCsv
                                                }, {
                                                  default: withCtx((_8, _push9, _parent9, _scopeId8) => {
                                                    if (_push9) {
                                                      _push9(`Download Audit Log CSV`);
                                                    } else {
                                                      return [
                                                        createTextVNode("Download Audit Log CSV")
                                                      ];
                                                    }
                                                  }),
                                                  _: 1
                                                }, _parent8, _scopeId7));
                                              } else {
                                                return [
                                                  createVNode(VBtn, {
                                                    color: "primary",
                                                    variant: "flat",
                                                    size: "small",
                                                    "prepend-icon": "mdi-download",
                                                    onClick: downloadApiAuditCsv
                                                  }, {
                                                    default: withCtx(() => [
                                                      createTextVNode("Download Audit Log CSV")
                                                    ]),
                                                    _: 1
                                                  })
                                                ];
                                              }
                                            }),
                                            _: 1
                                          }, _parent7, _scopeId6));
                                          _push7(ssrRenderComponent(VCol, { cols: "auto" }, {
                                            default: withCtx((_7, _push8, _parent8, _scopeId7) => {
                                              if (_push8) {
                                                _push8(ssrRenderComponent(VBtn, {
                                                  color: "primary",
                                                  variant: "flat",
                                                  size: "small",
                                                  "prepend-icon": "mdi-download",
                                                  onClick: downloadApiCartCsv
                                                }, {
                                                  default: withCtx((_8, _push9, _parent9, _scopeId8) => {
                                                    if (_push9) {
                                                      _push9(`Download Sales Data CSV`);
                                                    } else {
                                                      return [
                                                        createTextVNode("Download Sales Data CSV")
                                                      ];
                                                    }
                                                  }),
                                                  _: 1
                                                }, _parent8, _scopeId7));
                                              } else {
                                                return [
                                                  createVNode(VBtn, {
                                                    color: "primary",
                                                    variant: "flat",
                                                    size: "small",
                                                    "prepend-icon": "mdi-download",
                                                    onClick: downloadApiCartCsv
                                                  }, {
                                                    default: withCtx(() => [
                                                      createTextVNode("Download Sales Data CSV")
                                                    ]),
                                                    _: 1
                                                  })
                                                ];
                                              }
                                            }),
                                            _: 1
                                          }, _parent7, _scopeId6));
                                        } else {
                                          return [
                                            createVNode(VCol, { cols: "auto" }, {
                                              default: withCtx(() => [
                                                createVNode(VBtn, {
                                                  color: "primary",
                                                  variant: "flat",
                                                  size: "small",
                                                  "prepend-icon": "mdi-download",
                                                  onClick: downloadApiAuditCsv
                                                }, {
                                                  default: withCtx(() => [
                                                    createTextVNode("Download Audit Log CSV")
                                                  ]),
                                                  _: 1
                                                })
                                              ]),
                                              _: 1
                                            }),
                                            createVNode(VCol, { cols: "auto" }, {
                                              default: withCtx(() => [
                                                createVNode(VBtn, {
                                                  color: "primary",
                                                  variant: "flat",
                                                  size: "small",
                                                  "prepend-icon": "mdi-download",
                                                  onClick: downloadApiCartCsv
                                                }, {
                                                  default: withCtx(() => [
                                                    createTextVNode("Download Sales Data CSV")
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
                                    }, _parent6, _scopeId5));
                                  } else {
                                    return [
                                      createVNode(VRow, { density: "comfortable" }, {
                                        default: withCtx(() => [
                                          createVNode(VCol, { cols: "auto" }, {
                                            default: withCtx(() => [
                                              createVNode(VBtn, {
                                                color: "primary",
                                                variant: "flat",
                                                size: "small",
                                                "prepend-icon": "mdi-download",
                                                onClick: downloadApiAuditCsv
                                              }, {
                                                default: withCtx(() => [
                                                  createTextVNode("Download Audit Log CSV")
                                                ]),
                                                _: 1
                                              })
                                            ]),
                                            _: 1
                                          }),
                                          createVNode(VCol, { cols: "auto" }, {
                                            default: withCtx(() => [
                                              createVNode(VBtn, {
                                                color: "primary",
                                                variant: "flat",
                                                size: "small",
                                                "prepend-icon": "mdi-download",
                                                onClick: downloadApiCartCsv
                                              }, {
                                                default: withCtx(() => [
                                                  createTextVNode("Download Sales Data CSV")
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
                              }, _parent5, _scopeId4));
                            } else {
                              return [
                                createVNode(VCol, {
                                  cols: "12",
                                  md: "6"
                                }, {
                                  default: withCtx(() => [
                                    createVNode(VRow, { density: "comfortable" }, {
                                      default: withCtx(() => [
                                        createVNode(VCol, { cols: "auto" }, {
                                          default: withCtx(() => [
                                            createVNode(VBtn, {
                                              color: "primary",
                                              variant: "flat",
                                              size: "small",
                                              "prepend-icon": "mdi-download",
                                              onClick: downloadApiAuditCsv
                                            }, {
                                              default: withCtx(() => [
                                                createTextVNode("Download Audit Log CSV")
                                              ]),
                                              _: 1
                                            })
                                          ]),
                                          _: 1
                                        }),
                                        createVNode(VCol, { cols: "auto" }, {
                                          default: withCtx(() => [
                                            createVNode(VBtn, {
                                              color: "primary",
                                              variant: "flat",
                                              size: "small",
                                              "prepend-icon": "mdi-download",
                                              onClick: downloadApiCartCsv
                                            }, {
                                              default: withCtx(() => [
                                                createTextVNode("Download Sales Data CSV")
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
                                })
                              ];
                            }
                          }),
                          _: 1
                        }, _parent4, _scopeId3));
                      } else {
                        return [
                          createVNode(VRow, { density: "comfortable" }, {
                            default: withCtx(() => [
                              createVNode(VCol, {
                                cols: "12",
                                md: "6"
                              }, {
                                default: withCtx(() => [
                                  createVNode(VRow, { density: "comfortable" }, {
                                    default: withCtx(() => [
                                      createVNode(VCol, { cols: "auto" }, {
                                        default: withCtx(() => [
                                          createVNode(VBtn, {
                                            color: "primary",
                                            variant: "flat",
                                            size: "small",
                                            "prepend-icon": "mdi-download",
                                            onClick: downloadApiAuditCsv
                                          }, {
                                            default: withCtx(() => [
                                              createTextVNode("Download Audit Log CSV")
                                            ]),
                                            _: 1
                                          })
                                        ]),
                                        _: 1
                                      }),
                                      createVNode(VCol, { cols: "auto" }, {
                                        default: withCtx(() => [
                                          createVNode(VBtn, {
                                            color: "primary",
                                            variant: "flat",
                                            size: "small",
                                            "prepend-icon": "mdi-download",
                                            onClick: downloadApiCartCsv
                                          }, {
                                            default: withCtx(() => [
                                              createTextVNode("Download Sales Data CSV")
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
                              })
                            ]),
                            _: 1
                          })
                        ];
                      }
                    }),
                    _: 1
                  }, _parent3, _scopeId2));
                  _push3(ssrRenderComponent(VAlert, {
                    type: "info",
                    variant: "tonal",
                    icon: "mdi-information-outline"
                  }, {
                    default: withCtx((_3, _push4, _parent4, _scopeId3) => {
                      if (_push4) {
                        _push4(` Most authenticated endpoints accept <code data-v-669b0dc0${_scopeId3}>Accept: text/csv</code> instead of JSON to return a CSV stream directly. `);
                      } else {
                        return [
                          createTextVNode(" Most authenticated endpoints accept "),
                          createVNode("code", null, "Accept: text/csv"),
                          createTextVNode(" instead of JSON to return a CSV stream directly. ")
                        ];
                      }
                    }),
                    _: 1
                  }, _parent3, _scopeId2));
                  _push3(`</section>`);
                  _push3(ssrRenderComponent(VDivider, { class: "my-6" }, null, _parent3, _scopeId2));
                  _push3(`<section id="faq" class="docs-section" data-v-669b0dc0${_scopeId2}><h2 class="text-h4 font-weight-bold mb-2 section-title" data-v-669b0dc0${_scopeId2}>`);
                  _push3(ssrRenderComponent(VIcon, {
                    color: "primary",
                    class: "mr-2"
                  }, {
                    default: withCtx((_3, _push4, _parent4, _scopeId3) => {
                      if (_push4) {
                        _push4(`mdi-help-circle-outline`);
                      } else {
                        return [
                          createTextVNode("mdi-help-circle-outline")
                        ];
                      }
                    }),
                    _: 1
                  }, _parent3, _scopeId2));
                  _push3(` Frequently Asked Questions </h2>`);
                  _push3(ssrRenderComponent(VExpansionPanels, {
                    class: "mt-4",
                    variant: "accordion"
                  }, {
                    default: withCtx((_3, _push4, _parent4, _scopeId3) => {
                      if (_push4) {
                        _push4(`<!--[-->`);
                        ssrRenderList(faqs, (f, i) => {
                          _push4(ssrRenderComponent(VExpansionPanel, { key: i }, {
                            default: withCtx((_4, _push5, _parent5, _scopeId4) => {
                              if (_push5) {
                                _push5(ssrRenderComponent(VExpansionPanelTitle, { class: "text-subtitle-1 font-weight-bold" }, {
                                  default: withCtx((_5, _push6, _parent6, _scopeId5) => {
                                    if (_push6) {
                                      _push6(`${ssrInterpolate(f.q)}`);
                                    } else {
                                      return [
                                        createTextVNode(toDisplayString(f.q), 1)
                                      ];
                                    }
                                  }),
                                  _: 2
                                }, _parent5, _scopeId4));
                                _push5(ssrRenderComponent(VExpansionPanelText, null, {
                                  default: withCtx((_5, _push6, _parent6, _scopeId5) => {
                                    if (_push6) {
                                      _push6(`<p class="text-body-1" data-v-669b0dc0${_scopeId5}>${ssrInterpolate(f.a)}</p>`);
                                    } else {
                                      return [
                                        createVNode("p", { class: "text-body-1" }, toDisplayString(f.a), 1)
                                      ];
                                    }
                                  }),
                                  _: 2
                                }, _parent5, _scopeId4));
                              } else {
                                return [
                                  createVNode(VExpansionPanelTitle, { class: "text-subtitle-1 font-weight-bold" }, {
                                    default: withCtx(() => [
                                      createTextVNode(toDisplayString(f.q), 1)
                                    ]),
                                    _: 2
                                  }, 1024),
                                  createVNode(VExpansionPanelText, null, {
                                    default: withCtx(() => [
                                      createVNode("p", { class: "text-body-1" }, toDisplayString(f.a), 1)
                                    ]),
                                    _: 2
                                  }, 1024)
                                ];
                              }
                            }),
                            _: 2
                          }, _parent4, _scopeId3));
                        });
                        _push4(`<!--]-->`);
                      } else {
                        return [
                          (openBlock(), createBlock(Fragment, null, renderList(faqs, (f, i) => {
                            return createVNode(VExpansionPanel, { key: i }, {
                              default: withCtx(() => [
                                createVNode(VExpansionPanelTitle, { class: "text-subtitle-1 font-weight-bold" }, {
                                  default: withCtx(() => [
                                    createTextVNode(toDisplayString(f.q), 1)
                                  ]),
                                  _: 2
                                }, 1024),
                                createVNode(VExpansionPanelText, null, {
                                  default: withCtx(() => [
                                    createVNode("p", { class: "text-body-1" }, toDisplayString(f.a), 1)
                                  ]),
                                  _: 2
                                }, 1024)
                              ]),
                              _: 2
                            }, 1024);
                          }), 64))
                        ];
                      }
                    }),
                    _: 1
                  }, _parent3, _scopeId2));
                  _push3(ssrRenderComponent(VCard, {
                    rounded: "xl",
                    flat: "",
                    border: "",
                    class: "pa-4 mt-6 contact-card"
                  }, {
                    default: withCtx((_3, _push4, _parent4, _scopeId3) => {
                      if (_push4) {
                        _push4(ssrRenderComponent(VRow, { align: "center" }, {
                          default: withCtx((_4, _push5, _parent5, _scopeId4) => {
                            if (_push5) {
                              _push5(ssrRenderComponent(VCol, {
                                cols: "12",
                                md: "8"
                              }, {
                                default: withCtx((_5, _push6, _parent6, _scopeId5) => {
                                  if (_push6) {
                                    _push6(`<div class="text-h6 font-weight-bold" data-v-669b0dc0${_scopeId5}>Still need help?</div><p class="text-body-2 text-medium-emphasis mb-0" data-v-669b0dc0${_scopeId5}> Contact your workspace admin or visit our support center. If you are a super-admin, open the Platform Dashboard for tenant management. </p>`);
                                  } else {
                                    return [
                                      createVNode("div", { class: "text-h6 font-weight-bold" }, "Still need help?"),
                                      createVNode("p", { class: "text-body-2 text-medium-emphasis mb-0" }, " Contact your workspace admin or visit our support center. If you are a super-admin, open the Platform Dashboard for tenant management. ")
                                    ];
                                  }
                                }),
                                _: 1
                              }, _parent5, _scopeId4));
                              _push5(ssrRenderComponent(VCol, {
                                cols: "12",
                                md: "4",
                                class: "text-md-right"
                              }, {
                                default: withCtx((_5, _push6, _parent6, _scopeId5) => {
                                  if (_push6) {
                                    _push6(ssrRenderComponent(VBtn, {
                                      color: "primary",
                                      "prepend-icon": "mdi-login",
                                      onClick: ($event) => ("navigateTo" in _ctx ? _ctx.navigateTo : unref(navigateTo))("/login")
                                    }, {
                                      default: withCtx((_6, _push7, _parent7, _scopeId6) => {
                                        if (_push7) {
                                          _push7(` Go to login `);
                                        } else {
                                          return [
                                            createTextVNode(" Go to login ")
                                          ];
                                        }
                                      }),
                                      _: 1
                                    }, _parent6, _scopeId5));
                                  } else {
                                    return [
                                      createVNode(VBtn, {
                                        color: "primary",
                                        "prepend-icon": "mdi-login",
                                        onClick: ($event) => ("navigateTo" in _ctx ? _ctx.navigateTo : unref(navigateTo))("/login")
                                      }, {
                                        default: withCtx(() => [
                                          createTextVNode(" Go to login ")
                                        ]),
                                        _: 1
                                      }, 8, ["onClick"])
                                    ];
                                  }
                                }),
                                _: 1
                              }, _parent5, _scopeId4));
                            } else {
                              return [
                                createVNode(VCol, {
                                  cols: "12",
                                  md: "8"
                                }, {
                                  default: withCtx(() => [
                                    createVNode("div", { class: "text-h6 font-weight-bold" }, "Still need help?"),
                                    createVNode("p", { class: "text-body-2 text-medium-emphasis mb-0" }, " Contact your workspace admin or visit our support center. If you are a super-admin, open the Platform Dashboard for tenant management. ")
                                  ]),
                                  _: 1
                                }),
                                createVNode(VCol, {
                                  cols: "12",
                                  md: "4",
                                  class: "text-md-right"
                                }, {
                                  default: withCtx(() => [
                                    createVNode(VBtn, {
                                      color: "primary",
                                      "prepend-icon": "mdi-login",
                                      onClick: ($event) => ("navigateTo" in _ctx ? _ctx.navigateTo : unref(navigateTo))("/login")
                                    }, {
                                      default: withCtx(() => [
                                        createTextVNode(" Go to login ")
                                      ]),
                                      _: 1
                                    }, 8, ["onClick"])
                                  ]),
                                  _: 1
                                })
                              ];
                            }
                          }),
                          _: 1
                        }, _parent4, _scopeId3));
                      } else {
                        return [
                          createVNode(VRow, { align: "center" }, {
                            default: withCtx(() => [
                              createVNode(VCol, {
                                cols: "12",
                                md: "8"
                              }, {
                                default: withCtx(() => [
                                  createVNode("div", { class: "text-h6 font-weight-bold" }, "Still need help?"),
                                  createVNode("p", { class: "text-body-2 text-medium-emphasis mb-0" }, " Contact your workspace admin or visit our support center. If you are a super-admin, open the Platform Dashboard for tenant management. ")
                                ]),
                                _: 1
                              }),
                              createVNode(VCol, {
                                cols: "12",
                                md: "4",
                                class: "text-md-right"
                              }, {
                                default: withCtx(() => [
                                  createVNode(VBtn, {
                                    color: "primary",
                                    "prepend-icon": "mdi-login",
                                    onClick: ($event) => ("navigateTo" in _ctx ? _ctx.navigateTo : unref(navigateTo))("/login")
                                  }, {
                                    default: withCtx(() => [
                                      createTextVNode(" Go to login ")
                                    ]),
                                    _: 1
                                  }, 8, ["onClick"])
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
                  }, _parent3, _scopeId2));
                  _push3(`</section>`);
                } else {
                  return [
                    createVNode("section", {
                      id: "getting-started",
                      class: "docs-section"
                    }, [
                      createVNode("h2", { class: "text-h4 font-weight-bold mb-2 section-title" }, [
                        createVNode(VIcon, {
                          color: "primary",
                          class: "mr-2"
                        }, {
                          default: withCtx(() => [
                            createTextVNode("mdi-rocket-launch-outline")
                          ]),
                          _: 1
                        }),
                        createTextVNode(" Getting Started ")
                      ]),
                      createVNode("p", { class: "text-body-1 text-medium-emphasis mb-4" }, " Set up your workspace, log in, and navigate the main layout. "),
                      createVNode("h3", { class: "text-h6 font-weight-bold mb-1 mt-6" }, "1. Create a workspace"),
                      createVNode("p", { class: "text-body-2 mb-3" }, [
                        createTextVNode(" On the login screen, click "),
                        createVNode("strong", null, "“New to DomendraPOS? Create a workspace”"),
                        createTextVNode(". Fill in the workspace name, your admin email, currency (e.g. KSh for Kenya Shilling), and timezone. After you submit, you receive a confirmation email and your tenant (workspace) is provisioned. ")
                      ]),
                      createVNode("h3", { class: "text-h6 font-weight-bold mb-1 mt-6" }, "2. Log in"),
                      createVNode(_component_DocsSnapshot, {
                        src: unref(loginSnapshot),
                        alt: "Login screen with email, password, remember me, sign in button, and Documentation link",
                        label: "Fig 1. The login screen",
                        class: "mb-3"
                      }, null, 8, ["src"]),
                      createVNode(_component_DocsStepTimeline, { steps: loginSteps }),
                      createVNode(VAlert, {
                        type: "info",
                        variant: "tonal",
                        class: "mt-3",
                        icon: "mdi-shield-lock-outline"
                      }, {
                        default: withCtx(() => [
                          createTextVNode(" For security, your account is locked for 5 minutes after 5 failed attempts. If you forgot your password, contact your tenant admin or use “Forgot password?” link (if enabled by your workspace). ")
                        ]),
                        _: 1
                      }),
                      createVNode("h3", { class: "text-h6 font-weight-bold mb-1 mt-6" }, "3. Navigate the dashboard"),
                      createVNode(_component_DocsSnapshot, {
                        src: unref(dashboardSnapshot),
                        alt: "Main dashboard with KPI cards, revenue chart, top products, and recent transactions",
                        label: "Fig 2. The dashboard",
                        class: "mb-3"
                      }, null, 8, ["src"]),
                      createVNode("p", { class: "text-body-2 mb-3" }, "The main layout has three regions:"),
                      createVNode(VCard, {
                        rounded: "xl",
                        flat: "",
                        border: "",
                        class: "pa-4 mb-3"
                      }, {
                        default: withCtx(() => [
                          createVNode(VRow, { density: "comfortable" }, {
                            default: withCtx(() => [
                              createVNode(VCol, {
                                cols: "12",
                                md: "4"
                              }, {
                                default: withCtx(() => [
                                  createVNode("div", { class: "d-flex align-start ga-2" }, [
                                    createVNode(VIcon, {
                                      color: "primary",
                                      class: "mt-1"
                                    }, {
                                      default: withCtx(() => [
                                        createTextVNode("mdi-menu")
                                      ]),
                                      _: 1
                                    }),
                                    createVNode("div", null, [
                                      createVNode("div", { class: "font-weight-bold" }, "Left sidebar"),
                                      createVNode("div", { class: "text-body-2 text-medium-emphasis" }, " Collapsible rail with grouped navigation — Main, Administration, Platform. ")
                                    ])
                                  ])
                                ]),
                                _: 1
                              }),
                              createVNode(VCol, {
                                cols: "12",
                                md: "4"
                              }, {
                                default: withCtx(() => [
                                  createVNode("div", { class: "d-flex align-start ga-2" }, [
                                    createVNode(VIcon, {
                                      color: "primary",
                                      class: "mt-1"
                                    }, {
                                      default: withCtx(() => [
                                        createTextVNode("mdi-toolbar")
                                      ]),
                                      _: 1
                                    }),
                                    createVNode("div", null, [
                                      createVNode("div", { class: "font-weight-bold" }, "Top app bar"),
                                      createVNode("div", { class: "text-body-2 text-medium-emphasis" }, " Rail toggle, live clock, today's revenue, branch selector, theme toggle, user menu. ")
                                    ])
                                  ])
                                ]),
                                _: 1
                              }),
                              createVNode(VCol, {
                                cols: "12",
                                md: "4"
                              }, {
                                default: withCtx(() => [
                                  createVNode("div", { class: "d-flex align-start ga-2" }, [
                                    createVNode(VIcon, {
                                      color: "primary",
                                      class: "mt-1"
                                    }, {
                                      default: withCtx(() => [
                                        createTextVNode("mdi-format-page-break")
                                      ]),
                                      _: 1
                                    }),
                                    createVNode("div", null, [
                                      createVNode("div", { class: "font-weight-bold" }, "Content area"),
                                      createVNode("div", { class: "text-body-2 text-medium-emphasis" }, " The active page (Dashboard, POS, Inventory, Reports, etc.). ")
                                    ])
                                  ])
                                ]),
                                _: 1
                              })
                            ]),
                            _: 1
                          })
                        ]),
                        _: 1
                      }),
                      createVNode("h3", { class: "text-h6 font-weight-bold mb-1 mt-6" }, "4. Select a branch"),
                      createVNode("p", { class: "text-body-2 mb-3" }, [
                        createTextVNode(" Use the branch selector in the top app bar (top right). The default is "),
                        createVNode("strong", null, "“All Branches”"),
                        createTextVNode(". When you select a specific branch, all subsequent transactions, stock views, and reports are scoped to that branch. ")
                      ]),
                      createVNode(VAlert, {
                        type: "tip",
                        variant: "tonal",
                        color: "primary",
                        class: "mb-3",
                        icon: "mdi-lightbulb-on-outline"
                      }, {
                        default: withCtx(() => [
                          createTextVNode(" Cashiers must select a branch before starting a POS session — sales are recorded against the active branch. ")
                        ]),
                        _: 1
                      })
                    ]),
                    createVNode(VDivider, { class: "my-6" }),
                    createVNode("section", {
                      id: "module-pos",
                      class: "docs-section"
                    }, [
                      createVNode("h2", { class: "text-h4 font-weight-bold mb-2 section-title" }, [
                        createVNode(VIcon, {
                          color: "primary",
                          class: "mr-2"
                        }, {
                          default: withCtx(() => [
                            createTextVNode("mdi-cart-outline")
                          ]),
                          _: 1
                        }),
                        createTextVNode(" Point of Sale (POS) ")
                      ]),
                      createVNode("p", { class: "text-body-1 text-medium-emphasis mb-4" }, " Make sales fast — scan, tap, accept payments, and issue receipts. "),
                      createVNode(_component_DocsSnapshot, {
                        src: unref(posSnapshot),
                        alt: "POS screen with product grid on left and cart panel on right",
                        label: "Fig 3. The POS terminal",
                        class: "mb-4"
                      }, null, 8, ["src"]),
                      createVNode(_component_DocsStepTimeline, { steps: posSteps }),
                      createVNode("h3", { class: "text-h6 font-weight-bold mt-4 mb-1" }, "Payment methods"),
                      createVNode(VCard, {
                        rounded: "xl",
                        flat: "",
                        border: "",
                        class: "pa-4 mb-3"
                      }, {
                        default: withCtx(() => [
                          createVNode(VRow, { density: "comfortable" }, {
                            default: withCtx(() => [
                              createVNode(VCol, {
                                cols: "12",
                                md: "4"
                              }, {
                                default: withCtx(() => [
                                  createVNode(VChip, {
                                    color: "success",
                                    "prepend-icon": "mdi-cash",
                                    variant: "flat"
                                  }, {
                                    default: withCtx(() => [
                                      createTextVNode("Cash")
                                    ]),
                                    _: 1
                                  }),
                                  createVNode("p", { class: "text-body-2 mt-2" }, "Record a cash payment. Enter the amount tendered to compute change.")
                                ]),
                                _: 1
                              }),
                              createVNode(VCol, {
                                cols: "12",
                                md: "4"
                              }, {
                                default: withCtx(() => [
                                  createVNode(VChip, {
                                    color: "warning",
                                    "prepend-icon": "mdi-cellphone",
                                    variant: "flat"
                                  }, {
                                    default: withCtx(() => [
                                      createTextVNode("M-Pesa")
                                    ]),
                                    _: 1
                                  }),
                                  createVNode("p", { class: "text-body-2 mt-2" }, "Mobile money. Enter customer phone number and STK push reference.")
                                ]),
                                _: 1
                              }),
                              createVNode(VCol, {
                                cols: "12",
                                md: "4"
                              }, {
                                default: withCtx(() => [
                                  createVNode(VChip, {
                                    color: "primary",
                                    "prepend-icon": "mdi-credit-card",
                                    variant: "flat"
                                  }, {
                                    default: withCtx(() => [
                                      createTextVNode("Card")
                                    ]),
                                    _: 1
                                  }),
                                  createVNode("p", { class: "text-body-2 mt-2" }, "Credit / debit card. Record the gateway reference for reconciliation.")
                                ]),
                                _: 1
                              })
                            ]),
                            _: 1
                          })
                        ]),
                        _: 1
                      }),
                      createVNode("h3", { class: "text-h6 font-weight-bold mt-4 mb-1" }, "POS features"),
                      createVNode(VList, {
                        lines: "two",
                        border: ""
                      }, {
                        default: withCtx(() => [
                          createVNode(VListItem, {
                            "prepend-icon": "mdi-pause-box",
                            title: "Park / hold a sale",
                            subtitle: "Park a cart to serve another customer, then resume it."
                          }),
                          createVNode(VListItem, {
                            "prepend-icon": "mdi-account-cash",
                            title: "Customer credit",
                            subtitle: "Issue credit sales to registered customers with outstanding balances."
                          }),
                          createVNode(VListItem, {
                            "prepend-icon": "mdi-clock-start",
                            title: "Shift management",
                            subtitle: "Open / close shifts and print shift summaries (cashier reconciliation)."
                          }),
                          createVNode(VListItem, {
                            "prepend-icon": "mdi-receipt",
                            title: "Receipts",
                            subtitle: "Print or email receipts; thermal printer friendly."
                          })
                        ]),
                        _: 1
                      })
                    ]),
                    createVNode(VDivider, { class: "my-6" }),
                    createVNode("section", {
                      id: "module-inventory",
                      class: "docs-section"
                    }, [
                      createVNode("h2", { class: "text-h4 font-weight-bold mb-2 section-title" }, [
                        createVNode(VIcon, {
                          color: "primary",
                          class: "mr-2"
                        }, {
                          default: withCtx(() => [
                            createTextVNode("mdi-warehouse-outline")
                          ]),
                          _: 1
                        }),
                        createTextVNode(" Inventory ")
                      ]),
                      createVNode("p", { class: "text-body-1 text-medium-emphasis mb-4" }, " Track stock-on-hand across branches, adjust quantities, transfer stock, and get low-stock alerts. "),
                      createVNode(_component_DocsSnapshot, {
                        src: unref(inventorySnapshot),
                        alt: "Inventory page with KPI cards, filters, and SKUs table",
                        label: "Fig 4. The inventory stock-on-hand page",
                        class: "mb-4"
                      }, null, 8, ["src"]),
                      createVNode("h3", { class: "text-h6 font-weight-bold mb-2" }, "Core concepts"),
                      createVNode(VRow, { density: "comfortable" }, {
                        default: withCtx(() => [
                          (openBlock(), createBlock(Fragment, null, renderList(inventoryConcepts, (concept) => {
                            return createVNode(VCol, {
                              key: concept.title,
                              cols: "12",
                              md: "6"
                            }, {
                              default: withCtx(() => [
                                createVNode(VCard, {
                                  rounded: "lg",
                                  flat: "",
                                  border: "",
                                  class: "pa-3"
                                }, {
                                  default: withCtx(() => [
                                    createVNode("div", { class: "d-flex align-start ga-2" }, [
                                      createVNode(VIcon, {
                                        color: concept.color,
                                        class: "mt-1"
                                      }, {
                                        default: withCtx(() => [
                                          createTextVNode(toDisplayString(concept.icon), 1)
                                        ]),
                                        _: 2
                                      }, 1032, ["color"]),
                                      createVNode("div", null, [
                                        createVNode("div", { class: "font-weight-bold" }, toDisplayString(concept.title), 1),
                                        createVNode("div", { class: "text-body-2 text-medium-emphasis" }, toDisplayString(concept.text), 1)
                                      ])
                                    ])
                                  ]),
                                  _: 2
                                }, 1024)
                              ]),
                              _: 2
                            }, 1024);
                          }), 64))
                        ]),
                        _: 1
                      }),
                      createVNode("h3", { class: "text-h6 font-weight-bold mt-5 mb-2" }, "Stock movements"),
                      createVNode(_component_DocsStepTimeline, { steps: inventorySteps }),
                      createVNode("h3", { class: "text-h6 font-weight-bold mt-5 mb-2" }, "Sample stock data (exportable)"),
                      createVNode(_component_DocsCsvExportDemo, {
                        title: "Stock on hand export",
                        description: "A preview of the data returned by the inventory export endpoint. Click Download to save it as CSV.",
                        filename: "stock-on-hand.csv",
                        rows: inventorySampleRows,
                        columns: ["sku", "product", "category", "on_hand", "unit", "reorder_point", "value", "status"]
                      })
                    ]),
                    createVNode(VDivider, { class: "my-6" }),
                    createVNode("section", {
                      id: "module-products",
                      class: "docs-section"
                    }, [
                      createVNode("h2", { class: "text-h4 font-weight-bold mb-2 section-title" }, [
                        createVNode(VIcon, {
                          color: "primary",
                          class: "mr-2"
                        }, {
                          default: withCtx(() => [
                            createTextVNode("mdi-package-variant-closed")
                          ]),
                          _: 1
                        }),
                        createTextVNode(" Products ")
                      ]),
                      createVNode("p", { class: "text-body-1 text-medium-emphasis mb-4" }, " Define the catalog: products, brands, categories, units of measure, variants, and bulk import. "),
                      createVNode(_component_DocsStepTimeline, { steps: productSteps }),
                      createVNode(VAlert, {
                        type: "info",
                        variant: "tonal",
                        class: "my-3",
                        icon: "mdi-file-excel-outline"
                      }, {
                        default: withCtx(() => [
                          createVNode("strong", null, "Bulk Excel import."),
                          createTextVNode(" Download the template from the Products page, fill in rows, then upload. Supported columns: name, SKU, barcode, category, brand, unit, cost price, selling price, tax rate, opening stock. ")
                        ]),
                        _: 1
                      }),
                      createVNode("p", { class: "text-body-2 mb-2 mt-3" }, "Sample product catalog data (exportable):"),
                      createVNode(_component_DocsCsvExportDemo, {
                        title: "Product catalog export",
                        description: "Export your full product catalog with prices and stock for spreadsheet analysis.",
                        filename: "product-catalog.csv",
                        rows: productSampleRows,
                        columns: ["sku", "name", "category", "brand", "unit", "cost_price", "selling_price", "tax_rate", "is_active"]
                      })
                    ]),
                    createVNode(VDivider, { class: "my-6" }),
                    createVNode("section", {
                      id: "module-customers",
                      class: "docs-section"
                    }, [
                      createVNode("h2", { class: "text-h4 font-weight-bold mb-2 section-title" }, [
                        createVNode(VIcon, {
                          color: "primary",
                          class: "mr-2"
                        }, {
                          default: withCtx(() => [
                            createTextVNode("mdi-account-group-outline")
                          ]),
                          _: 1
                        }),
                        createTextVNode(" Customers ")
                      ]),
                      createVNode("p", { class: "text-body-1 text-medium-emphasis mb-4" }, " Build a customer CRM — loyalty points, store credit, purchase history, and outstanding balances. "),
                      createVNode(_component_DocsStepTimeline, { steps: customerSteps }),
                      createVNode("h3", { class: "text-h6 font-weight-bold mt-4 mb-2" }, "Customer balances export"),
                      createVNode(_component_DocsCsvExportDemo, {
                        title: "Customer balances",
                        description: "Who owes you how much. Filter the list on the Customers page and export outstanding balances.",
                        filename: "customer-balances.csv",
                        rows: customerSampleRows,
                        columns: ["name", "phone", "email", "loyalty_points", "credit_balance", "total_spent"]
                      })
                    ]),
                    createVNode(VDivider, { class: "my-6" }),
                    createVNode("section", {
                      id: "module-suppliers",
                      class: "docs-section"
                    }, [
                      createVNode("h2", { class: "text-h4 font-weight-bold mb-2 section-title" }, [
                        createVNode(VIcon, {
                          color: "primary",
                          class: "mr-2"
                        }, {
                          default: withCtx(() => [
                            createTextVNode("mdi-truck-delivery-outline")
                          ]),
                          _: 1
                        }),
                        createTextVNode(" Suppliers and Purchasing ")
                      ]),
                      createVNode("p", { class: "text-body-1 text-medium-emphasis mb-4" }, " Manage suppliers, raise purchase orders (POs), receive goods into stock, and track payables. "),
                      createVNode(_component_DocsStepTimeline, { steps: supplierSteps }),
                      createVNode("p", { class: "text-body-2 mt-3 mb-2" }, "Sample purchase order data (exportable):"),
                      createVNode(_component_DocsCsvExportDemo, {
                        title: "Purchase orders export",
                        description: "POs by status with line totals and supplier info.",
                        filename: "purchase-orders.csv",
                        rows: poSampleRows,
                        columns: ["po_number", "supplier", "branch", "status", "order_date", "total"]
                      })
                    ]),
                    createVNode(VDivider, { class: "my-6" }),
                    createVNode("section", {
                      id: "module-reports",
                      class: "docs-section"
                    }, [
                      createVNode("h2", { class: "text-h4 font-weight-bold mb-2 section-title" }, [
                        createVNode(VIcon, {
                          color: "primary",
                          class: "mr-2"
                        }, {
                          default: withCtx(() => [
                            createTextVNode("mdi-chart-box-outline")
                          ]),
                          _: 1
                        }),
                        createTextVNode(" Reports ")
                      ]),
                      createVNode("p", { class: "text-body-1 text-medium-emphasis mb-4" }, " Generate sales summaries, profit and loss, VAT returns, and stock valuation for any period and branch. "),
                      createVNode(_component_DocsSnapshot, {
                        src: unref(reportsSnapshot),
                        alt: "Sales summary report with KPIs, line chart, and payment method breakdown",
                        label: "Fig 5. Sales summary report",
                        class: "mb-4"
                      }, null, 8, ["src"]),
                      createVNode(_component_DocsStepTimeline, { steps: reportSteps }),
                      createVNode(VAlert, {
                        type: "info",
                        variant: "tonal",
                        class: "mb-3",
                        icon: "mdi-file-export-outline"
                      }, {
                        default: withCtx(() => [
                          createTextVNode(" Every report page has "),
                          createVNode("strong", null, "Export CSV"),
                          createTextVNode(" and "),
                          createVNode("strong", null, "Export PDF"),
                          createTextVNode(" buttons. CSV gives you raw data for spreadsheets; PDF gives you a printable layout for sharing. ")
                        ]),
                        _: 1
                      }),
                      createVNode("h3", { class: "text-h6 font-weight-bold mb-2" }, "Interactive sample — Sales by day"),
                      createVNode(_component_DocsChartExportDemo, {
                        title: "Daily sales (sample)",
                        description: "A sample chart produced by the Reports module. Export the underlying data as CSV.",
                        filename: "daily-sales.csv",
                        categories: reportCategories,
                        series: reportSeries
                      })
                    ]),
                    createVNode(VDivider, { class: "my-6" }),
                    createVNode("section", {
                      id: "module-analytics",
                      class: "docs-section"
                    }, [
                      createVNode("h2", { class: "text-h4 font-weight-bold mb-2 section-title" }, [
                        createVNode(VIcon, {
                          color: "primary",
                          class: "mr-2"
                        }, {
                          default: withCtx(() => [
                            createTextVNode("mdi-chart-multiple")
                          ]),
                          _: 1
                        }),
                        createTextVNode(" Analytics ")
                      ]),
                      createVNode("p", { class: "text-body-1 text-medium-emphasis mb-4" }, " Interactive dashboards: ABC analysis, revenue trends, top products, staff performance, peak hours. "),
                      createVNode(_component_DocsChartExportDemo, {
                        title: "Top products by revenue (sample)",
                        description: "Visualize which products generate the most revenue. Export for further analysis.",
                        filename: "top-products.csv",
                        categories: analyticsCategories,
                        series: analyticsSeries
                      }),
                      createVNode(VAlert, {
                        type: "info",
                        variant: "tonal",
                        class: "mb-3 mt-4",
                        icon: "mdi-chart-bell-curve"
                      }, {
                        default: withCtx(() => [
                          createVNode("strong", null, "ABC Analysis."),
                          createTextVNode(" Inventory is segmented into A (top 20% by value), B (next 30%), and C (remaining 50%) so you can prioritize reordering. ")
                        ]),
                        _: 1
                      })
                    ]),
                    createVNode(VDivider, { class: "my-6" }),
                    createVNode("section", {
                      id: "module-accounting",
                      class: "docs-section"
                    }, [
                      createVNode("h2", { class: "text-h4 font-weight-bold mb-2 section-title" }, [
                        createVNode(VIcon, {
                          color: "primary",
                          class: "mr-2"
                        }, {
                          default: withCtx(() => [
                            createTextVNode("mdi-calculator-variant-outline")
                          ]),
                          _: 1
                        }),
                        createTextVNode(" Accounts and Finance ")
                      ]),
                      createVNode("p", { class: "text-body-1 text-medium-emphasis mb-4" }, " Chart of accounts, journal entries, ledgers, VAT, and financial statements. "),
                      createVNode(_component_DocsStepTimeline, { steps: accountingSteps }),
                      createVNode("p", { class: "text-body-2 mt-3 mb-2" }, "Sample journal entries (exportable):"),
                      createVNode(_component_DocsCsvExportDemo, {
                        title: "Journal entries export",
                        description: "Export posted journal entries with debit and credit lines for accounting review.",
                        filename: "journal-entries.csv",
                        rows: journalSampleRows,
                        columns: ["entry_no", "date", "account", "description", "debit", "credit"]
                      })
                    ]),
                    createVNode(VDivider, { class: "my-6" }),
                    createVNode("section", {
                      id: "modules",
                      class: "docs-section"
                    }, [
                      createVNode("h2", { class: "text-h4 font-weight-bold mb-2 section-title" }, [
                        createVNode(VIcon, {
                          color: "primary",
                          class: "mr-2"
                        }, {
                          default: withCtx(() => [
                            createTextVNode("mdi-view-module-outline")
                          ]),
                          _: 1
                        }),
                        createTextVNode(" All Modules at a Glance ")
                      ]),
                      createVNode("p", { class: "text-body-1 text-medium-emphasis mb-4" }, " A quick reference table of every module and its main capabilities. "),
                      createVNode(VDataTable, {
                        headers: moduleHeaders,
                        items: moduleRows,
                        density: "comfortable",
                        class: "border rounded-xl",
                        "items-per-page": "-1"
                      }, {
                        "item.icon": withCtx(({ item }) => [
                          createVNode(VIcon, {
                            color: item.color,
                            size: "22"
                          }, {
                            default: withCtx(() => [
                              createTextVNode(toDisplayString(item.icon), 1)
                            ]),
                            _: 2
                          }, 1032, ["color"])
                        ]),
                        "item.actions": withCtx(({ item }) => [
                          createVNode(VBtn, {
                            size: "small",
                            variant: "text",
                            color: "primary",
                            onClick: ($event) => scrollTo(item.link)
                          }, {
                            default: withCtx(() => [
                              createTextVNode(" Read ")
                            ]),
                            _: 1
                          }, 8, ["onClick"])
                        ]),
                        _: 1
                      })
                    ]),
                    createVNode(VDivider, { class: "my-6" }),
                    createVNode("section", {
                      id: "roles",
                      class: "docs-section"
                    }, [
                      createVNode("h2", { class: "text-h4 font-weight-bold mb-2 section-title" }, [
                        createVNode(VIcon, {
                          color: "primary",
                          class: "mr-2"
                        }, {
                          default: withCtx(() => [
                            createTextVNode("mdi-shield-account-outline")
                          ]),
                          _: 1
                        }),
                        createTextVNode(" Roles, Permissions, and Audit ")
                      ]),
                      createVNode("p", { class: "text-body-1 text-medium-emphasis mb-4" }, " Fine-grained Role-Based Access Control (RBAC) with audit logging. Every action is recorded. "),
                      createVNode(_component_DocsSnapshot, {
                        src: unref(iamSnapshot),
                        alt: "IAM page showing users with roles, statuses, and KPIs",
                        label: "Fig 6. The IAM page",
                        class: "mb-4"
                      }, null, 8, ["src"]),
                      createVNode("h3", { class: "text-h6 font-weight-bold mb-2" }, "Default roles"),
                      createVNode(VDataTable, {
                        headers: roleHeaders,
                        items: roleRows,
                        density: "comfortable",
                        class: "border rounded-xl mb-4",
                        "items-per-page": "-1"
                      }),
                      createVNode("h3", { class: "text-h6 font-weight-bold mb-2" }, "Audit logs"),
                      createVNode("p", { class: "text-body-2 mb-3" }, " Every login, create, update, delete, permission change, and export is recorded with user, IP, module, action, and timestamp. Tenant admins and auditors can filter and export the audit trail. "),
                      createVNode(_component_DocsSnapshot, {
                        src: unref(auditSnapshot),
                        alt: "Audit logs page with filters and timeline of actions by user, module, status",
                        label: "Fig 7. The audit log",
                        class: "mb-4"
                      }, null, 8, ["src"]),
                      createVNode(_component_DocsCsvExportDemo, {
                        title: "Audit log export",
                        description: "Filter the audit log by user, action, module, date, and export for compliance reporting.",
                        filename: "audit-log.csv",
                        rows: auditSampleRows,
                        columns: ["timestamp", "user", "action", "module", "ip_address", "status"]
                      })
                    ]),
                    createVNode(VDivider, { class: "my-6" }),
                    createVNode("section", {
                      id: "api-and-exports",
                      class: "docs-section"
                    }, [
                      createVNode("h2", { class: "text-h4 font-weight-bold mb-2 section-title" }, [
                        createVNode(VIcon, {
                          color: "primary",
                          class: "mr-2"
                        }, {
                          default: withCtx(() => [
                            createTextVNode("mdi-api")
                          ]),
                          _: 1
                        }),
                        createTextVNode(" API and Exports ")
                      ]),
                      createVNode("p", { class: "text-body-1 text-medium-emphasis mb-4" }, [
                        createTextVNode(" All list pages expose a REST API at "),
                        createVNode("code", null, "/api"),
                        createTextVNode(" and support CSV export. Here is how. ")
                      ]),
                      createVNode("h3", { class: "text-h6 font-weight-bold mb-2" }, "Authentication"),
                      createVNode("p", { class: "text-body-2 mb-3" }, [
                        createTextVNode(" The frontend uses JWT access and refresh tokens. The token is sent as "),
                        createVNode("code", null, "Authorization: Bearer <access_token>"),
                        createTextVNode(". Access tokens expire every 15 minutes and are refreshed automatically on 401 responses. ")
                      ]),
                      createVNode(VCard, {
                        rounded: "lg",
                        flat: "",
                        border: "",
                        class: "pa-4 mb-3"
                      }, {
                        default: withCtx(() => [
                          createVNode("pre", { class: "code-block" }, 'POST /api/auth/login/\nContent-Type: application/json\n\n{\n  "email": "you@example.com",\n  "password": "your-password"\n}')
                        ]),
                        _: 1
                      }),
                      createVNode("h3", { class: "text-h6 font-weight-bold mb-2" }, "Refreshing the token"),
                      createVNode(VCard, {
                        rounded: "lg",
                        flat: "",
                        border: "",
                        class: "pa-4 mb-3"
                      }, {
                        default: withCtx(() => [
                          createVNode("pre", { class: "code-block" }, "POST /api/auth/refresh/\nAuthorization: Bearer <refresh_token>")
                        ]),
                        _: 1
                      }),
                      createVNode("h3", { class: "text-h6 font-weight-bold mb-2" }, "Listing resources"),
                      createVNode(VCard, {
                        rounded: "lg",
                        flat: "",
                        border: "",
                        class: "pa-4 mb-3"
                      }, {
                        default: withCtx(() => [
                          createVNode("pre", { class: "code-block" }, 'GET /api/products/?search=bread&category=groceries&ordering=-created_at\nAuthorization: Bearer <access_token>\n\n# Response shape:\n{\n  "count": 128,\n  "next": "https://…/api/products/?page=2",\n  "previous": null,\n  "results": [ {…}, {…}, … ]\n}')
                        ]),
                        _: 1
                      }),
                      createVNode("h3", { class: "text-h6 font-weight-bold mb-2" }, "Audit trail / Logs"),
                      createVNode(VCard, {
                        rounded: "lg",
                        flat: "",
                        border: "",
                        class: "pa-3 mb-3"
                      }, {
                        default: withCtx(() => [
                          createVNode(VRow, { density: "comfortable" }, {
                            default: withCtx(() => [
                              createVNode(VCol, {
                                cols: "12",
                                md: "6"
                              }, {
                                default: withCtx(() => [
                                  createVNode(VRow, { density: "comfortable" }, {
                                    default: withCtx(() => [
                                      createVNode(VCol, { cols: "auto" }, {
                                        default: withCtx(() => [
                                          createVNode(VBtn, {
                                            color: "primary",
                                            variant: "flat",
                                            size: "small",
                                            "prepend-icon": "mdi-download",
                                            onClick: downloadApiAuditCsv
                                          }, {
                                            default: withCtx(() => [
                                              createTextVNode("Download Audit Log CSV")
                                            ]),
                                            _: 1
                                          })
                                        ]),
                                        _: 1
                                      }),
                                      createVNode(VCol, { cols: "auto" }, {
                                        default: withCtx(() => [
                                          createVNode(VBtn, {
                                            color: "primary",
                                            variant: "flat",
                                            size: "small",
                                            "prepend-icon": "mdi-download",
                                            onClick: downloadApiCartCsv
                                          }, {
                                            default: withCtx(() => [
                                              createTextVNode("Download Sales Data CSV")
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
                              })
                            ]),
                            _: 1
                          })
                        ]),
                        _: 1
                      }),
                      createVNode(VAlert, {
                        type: "info",
                        variant: "tonal",
                        icon: "mdi-information-outline"
                      }, {
                        default: withCtx(() => [
                          createTextVNode(" Most authenticated endpoints accept "),
                          createVNode("code", null, "Accept: text/csv"),
                          createTextVNode(" instead of JSON to return a CSV stream directly. ")
                        ]),
                        _: 1
                      })
                    ]),
                    createVNode(VDivider, { class: "my-6" }),
                    createVNode("section", {
                      id: "faq",
                      class: "docs-section"
                    }, [
                      createVNode("h2", { class: "text-h4 font-weight-bold mb-2 section-title" }, [
                        createVNode(VIcon, {
                          color: "primary",
                          class: "mr-2"
                        }, {
                          default: withCtx(() => [
                            createTextVNode("mdi-help-circle-outline")
                          ]),
                          _: 1
                        }),
                        createTextVNode(" Frequently Asked Questions ")
                      ]),
                      createVNode(VExpansionPanels, {
                        class: "mt-4",
                        variant: "accordion"
                      }, {
                        default: withCtx(() => [
                          (openBlock(), createBlock(Fragment, null, renderList(faqs, (f, i) => {
                            return createVNode(VExpansionPanel, { key: i }, {
                              default: withCtx(() => [
                                createVNode(VExpansionPanelTitle, { class: "text-subtitle-1 font-weight-bold" }, {
                                  default: withCtx(() => [
                                    createTextVNode(toDisplayString(f.q), 1)
                                  ]),
                                  _: 2
                                }, 1024),
                                createVNode(VExpansionPanelText, null, {
                                  default: withCtx(() => [
                                    createVNode("p", { class: "text-body-1" }, toDisplayString(f.a), 1)
                                  ]),
                                  _: 2
                                }, 1024)
                              ]),
                              _: 2
                            }, 1024);
                          }), 64))
                        ]),
                        _: 1
                      }),
                      createVNode(VCard, {
                        rounded: "xl",
                        flat: "",
                        border: "",
                        class: "pa-4 mt-6 contact-card"
                      }, {
                        default: withCtx(() => [
                          createVNode(VRow, { align: "center" }, {
                            default: withCtx(() => [
                              createVNode(VCol, {
                                cols: "12",
                                md: "8"
                              }, {
                                default: withCtx(() => [
                                  createVNode("div", { class: "text-h6 font-weight-bold" }, "Still need help?"),
                                  createVNode("p", { class: "text-body-2 text-medium-emphasis mb-0" }, " Contact your workspace admin or visit our support center. If you are a super-admin, open the Platform Dashboard for tenant management. ")
                                ]),
                                _: 1
                              }),
                              createVNode(VCol, {
                                cols: "12",
                                md: "4",
                                class: "text-md-right"
                              }, {
                                default: withCtx(() => [
                                  createVNode(VBtn, {
                                    color: "primary",
                                    "prepend-icon": "mdi-login",
                                    onClick: ($event) => ("navigateTo" in _ctx ? _ctx.navigateTo : unref(navigateTo))("/login")
                                  }, {
                                    default: withCtx(() => [
                                      createTextVNode(" Go to login ")
                                    ]),
                                    _: 1
                                  }, 8, ["onClick"])
                                ]),
                                _: 1
                              })
                            ]),
                            _: 1
                          })
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
              createVNode(VCol, {
                cols: "12",
                md: "3",
                lg: "2",
                class: "d-none d-md-block"
              }, {
                default: withCtx(() => [
                  createVNode(_component_DocsToc, { sections: tocSections })
                ]),
                _: 1
              }),
              createVNode(VCol, {
                cols: "12",
                md: "9",
                lg: "8",
                "offset-lg": "0",
                class: "docs-main"
              }, {
                default: withCtx(() => [
                  createVNode("section", {
                    id: "getting-started",
                    class: "docs-section"
                  }, [
                    createVNode("h2", { class: "text-h4 font-weight-bold mb-2 section-title" }, [
                      createVNode(VIcon, {
                        color: "primary",
                        class: "mr-2"
                      }, {
                        default: withCtx(() => [
                          createTextVNode("mdi-rocket-launch-outline")
                        ]),
                        _: 1
                      }),
                      createTextVNode(" Getting Started ")
                    ]),
                    createVNode("p", { class: "text-body-1 text-medium-emphasis mb-4" }, " Set up your workspace, log in, and navigate the main layout. "),
                    createVNode("h3", { class: "text-h6 font-weight-bold mb-1 mt-6" }, "1. Create a workspace"),
                    createVNode("p", { class: "text-body-2 mb-3" }, [
                      createTextVNode(" On the login screen, click "),
                      createVNode("strong", null, "“New to DomendraPOS? Create a workspace”"),
                      createTextVNode(". Fill in the workspace name, your admin email, currency (e.g. KSh for Kenya Shilling), and timezone. After you submit, you receive a confirmation email and your tenant (workspace) is provisioned. ")
                    ]),
                    createVNode("h3", { class: "text-h6 font-weight-bold mb-1 mt-6" }, "2. Log in"),
                    createVNode(_component_DocsSnapshot, {
                      src: unref(loginSnapshot),
                      alt: "Login screen with email, password, remember me, sign in button, and Documentation link",
                      label: "Fig 1. The login screen",
                      class: "mb-3"
                    }, null, 8, ["src"]),
                    createVNode(_component_DocsStepTimeline, { steps: loginSteps }),
                    createVNode(VAlert, {
                      type: "info",
                      variant: "tonal",
                      class: "mt-3",
                      icon: "mdi-shield-lock-outline"
                    }, {
                      default: withCtx(() => [
                        createTextVNode(" For security, your account is locked for 5 minutes after 5 failed attempts. If you forgot your password, contact your tenant admin or use “Forgot password?” link (if enabled by your workspace). ")
                      ]),
                      _: 1
                    }),
                    createVNode("h3", { class: "text-h6 font-weight-bold mb-1 mt-6" }, "3. Navigate the dashboard"),
                    createVNode(_component_DocsSnapshot, {
                      src: unref(dashboardSnapshot),
                      alt: "Main dashboard with KPI cards, revenue chart, top products, and recent transactions",
                      label: "Fig 2. The dashboard",
                      class: "mb-3"
                    }, null, 8, ["src"]),
                    createVNode("p", { class: "text-body-2 mb-3" }, "The main layout has three regions:"),
                    createVNode(VCard, {
                      rounded: "xl",
                      flat: "",
                      border: "",
                      class: "pa-4 mb-3"
                    }, {
                      default: withCtx(() => [
                        createVNode(VRow, { density: "comfortable" }, {
                          default: withCtx(() => [
                            createVNode(VCol, {
                              cols: "12",
                              md: "4"
                            }, {
                              default: withCtx(() => [
                                createVNode("div", { class: "d-flex align-start ga-2" }, [
                                  createVNode(VIcon, {
                                    color: "primary",
                                    class: "mt-1"
                                  }, {
                                    default: withCtx(() => [
                                      createTextVNode("mdi-menu")
                                    ]),
                                    _: 1
                                  }),
                                  createVNode("div", null, [
                                    createVNode("div", { class: "font-weight-bold" }, "Left sidebar"),
                                    createVNode("div", { class: "text-body-2 text-medium-emphasis" }, " Collapsible rail with grouped navigation — Main, Administration, Platform. ")
                                  ])
                                ])
                              ]),
                              _: 1
                            }),
                            createVNode(VCol, {
                              cols: "12",
                              md: "4"
                            }, {
                              default: withCtx(() => [
                                createVNode("div", { class: "d-flex align-start ga-2" }, [
                                  createVNode(VIcon, {
                                    color: "primary",
                                    class: "mt-1"
                                  }, {
                                    default: withCtx(() => [
                                      createTextVNode("mdi-toolbar")
                                    ]),
                                    _: 1
                                  }),
                                  createVNode("div", null, [
                                    createVNode("div", { class: "font-weight-bold" }, "Top app bar"),
                                    createVNode("div", { class: "text-body-2 text-medium-emphasis" }, " Rail toggle, live clock, today's revenue, branch selector, theme toggle, user menu. ")
                                  ])
                                ])
                              ]),
                              _: 1
                            }),
                            createVNode(VCol, {
                              cols: "12",
                              md: "4"
                            }, {
                              default: withCtx(() => [
                                createVNode("div", { class: "d-flex align-start ga-2" }, [
                                  createVNode(VIcon, {
                                    color: "primary",
                                    class: "mt-1"
                                  }, {
                                    default: withCtx(() => [
                                      createTextVNode("mdi-format-page-break")
                                    ]),
                                    _: 1
                                  }),
                                  createVNode("div", null, [
                                    createVNode("div", { class: "font-weight-bold" }, "Content area"),
                                    createVNode("div", { class: "text-body-2 text-medium-emphasis" }, " The active page (Dashboard, POS, Inventory, Reports, etc.). ")
                                  ])
                                ])
                              ]),
                              _: 1
                            })
                          ]),
                          _: 1
                        })
                      ]),
                      _: 1
                    }),
                    createVNode("h3", { class: "text-h6 font-weight-bold mb-1 mt-6" }, "4. Select a branch"),
                    createVNode("p", { class: "text-body-2 mb-3" }, [
                      createTextVNode(" Use the branch selector in the top app bar (top right). The default is "),
                      createVNode("strong", null, "“All Branches”"),
                      createTextVNode(". When you select a specific branch, all subsequent transactions, stock views, and reports are scoped to that branch. ")
                    ]),
                    createVNode(VAlert, {
                      type: "tip",
                      variant: "tonal",
                      color: "primary",
                      class: "mb-3",
                      icon: "mdi-lightbulb-on-outline"
                    }, {
                      default: withCtx(() => [
                        createTextVNode(" Cashiers must select a branch before starting a POS session — sales are recorded against the active branch. ")
                      ]),
                      _: 1
                    })
                  ]),
                  createVNode(VDivider, { class: "my-6" }),
                  createVNode("section", {
                    id: "module-pos",
                    class: "docs-section"
                  }, [
                    createVNode("h2", { class: "text-h4 font-weight-bold mb-2 section-title" }, [
                      createVNode(VIcon, {
                        color: "primary",
                        class: "mr-2"
                      }, {
                        default: withCtx(() => [
                          createTextVNode("mdi-cart-outline")
                        ]),
                        _: 1
                      }),
                      createTextVNode(" Point of Sale (POS) ")
                    ]),
                    createVNode("p", { class: "text-body-1 text-medium-emphasis mb-4" }, " Make sales fast — scan, tap, accept payments, and issue receipts. "),
                    createVNode(_component_DocsSnapshot, {
                      src: unref(posSnapshot),
                      alt: "POS screen with product grid on left and cart panel on right",
                      label: "Fig 3. The POS terminal",
                      class: "mb-4"
                    }, null, 8, ["src"]),
                    createVNode(_component_DocsStepTimeline, { steps: posSteps }),
                    createVNode("h3", { class: "text-h6 font-weight-bold mt-4 mb-1" }, "Payment methods"),
                    createVNode(VCard, {
                      rounded: "xl",
                      flat: "",
                      border: "",
                      class: "pa-4 mb-3"
                    }, {
                      default: withCtx(() => [
                        createVNode(VRow, { density: "comfortable" }, {
                          default: withCtx(() => [
                            createVNode(VCol, {
                              cols: "12",
                              md: "4"
                            }, {
                              default: withCtx(() => [
                                createVNode(VChip, {
                                  color: "success",
                                  "prepend-icon": "mdi-cash",
                                  variant: "flat"
                                }, {
                                  default: withCtx(() => [
                                    createTextVNode("Cash")
                                  ]),
                                  _: 1
                                }),
                                createVNode("p", { class: "text-body-2 mt-2" }, "Record a cash payment. Enter the amount tendered to compute change.")
                              ]),
                              _: 1
                            }),
                            createVNode(VCol, {
                              cols: "12",
                              md: "4"
                            }, {
                              default: withCtx(() => [
                                createVNode(VChip, {
                                  color: "warning",
                                  "prepend-icon": "mdi-cellphone",
                                  variant: "flat"
                                }, {
                                  default: withCtx(() => [
                                    createTextVNode("M-Pesa")
                                  ]),
                                  _: 1
                                }),
                                createVNode("p", { class: "text-body-2 mt-2" }, "Mobile money. Enter customer phone number and STK push reference.")
                              ]),
                              _: 1
                            }),
                            createVNode(VCol, {
                              cols: "12",
                              md: "4"
                            }, {
                              default: withCtx(() => [
                                createVNode(VChip, {
                                  color: "primary",
                                  "prepend-icon": "mdi-credit-card",
                                  variant: "flat"
                                }, {
                                  default: withCtx(() => [
                                    createTextVNode("Card")
                                  ]),
                                  _: 1
                                }),
                                createVNode("p", { class: "text-body-2 mt-2" }, "Credit / debit card. Record the gateway reference for reconciliation.")
                              ]),
                              _: 1
                            })
                          ]),
                          _: 1
                        })
                      ]),
                      _: 1
                    }),
                    createVNode("h3", { class: "text-h6 font-weight-bold mt-4 mb-1" }, "POS features"),
                    createVNode(VList, {
                      lines: "two",
                      border: ""
                    }, {
                      default: withCtx(() => [
                        createVNode(VListItem, {
                          "prepend-icon": "mdi-pause-box",
                          title: "Park / hold a sale",
                          subtitle: "Park a cart to serve another customer, then resume it."
                        }),
                        createVNode(VListItem, {
                          "prepend-icon": "mdi-account-cash",
                          title: "Customer credit",
                          subtitle: "Issue credit sales to registered customers with outstanding balances."
                        }),
                        createVNode(VListItem, {
                          "prepend-icon": "mdi-clock-start",
                          title: "Shift management",
                          subtitle: "Open / close shifts and print shift summaries (cashier reconciliation)."
                        }),
                        createVNode(VListItem, {
                          "prepend-icon": "mdi-receipt",
                          title: "Receipts",
                          subtitle: "Print or email receipts; thermal printer friendly."
                        })
                      ]),
                      _: 1
                    })
                  ]),
                  createVNode(VDivider, { class: "my-6" }),
                  createVNode("section", {
                    id: "module-inventory",
                    class: "docs-section"
                  }, [
                    createVNode("h2", { class: "text-h4 font-weight-bold mb-2 section-title" }, [
                      createVNode(VIcon, {
                        color: "primary",
                        class: "mr-2"
                      }, {
                        default: withCtx(() => [
                          createTextVNode("mdi-warehouse-outline")
                        ]),
                        _: 1
                      }),
                      createTextVNode(" Inventory ")
                    ]),
                    createVNode("p", { class: "text-body-1 text-medium-emphasis mb-4" }, " Track stock-on-hand across branches, adjust quantities, transfer stock, and get low-stock alerts. "),
                    createVNode(_component_DocsSnapshot, {
                      src: unref(inventorySnapshot),
                      alt: "Inventory page with KPI cards, filters, and SKUs table",
                      label: "Fig 4. The inventory stock-on-hand page",
                      class: "mb-4"
                    }, null, 8, ["src"]),
                    createVNode("h3", { class: "text-h6 font-weight-bold mb-2" }, "Core concepts"),
                    createVNode(VRow, { density: "comfortable" }, {
                      default: withCtx(() => [
                        (openBlock(), createBlock(Fragment, null, renderList(inventoryConcepts, (concept) => {
                          return createVNode(VCol, {
                            key: concept.title,
                            cols: "12",
                            md: "6"
                          }, {
                            default: withCtx(() => [
                              createVNode(VCard, {
                                rounded: "lg",
                                flat: "",
                                border: "",
                                class: "pa-3"
                              }, {
                                default: withCtx(() => [
                                  createVNode("div", { class: "d-flex align-start ga-2" }, [
                                    createVNode(VIcon, {
                                      color: concept.color,
                                      class: "mt-1"
                                    }, {
                                      default: withCtx(() => [
                                        createTextVNode(toDisplayString(concept.icon), 1)
                                      ]),
                                      _: 2
                                    }, 1032, ["color"]),
                                    createVNode("div", null, [
                                      createVNode("div", { class: "font-weight-bold" }, toDisplayString(concept.title), 1),
                                      createVNode("div", { class: "text-body-2 text-medium-emphasis" }, toDisplayString(concept.text), 1)
                                    ])
                                  ])
                                ]),
                                _: 2
                              }, 1024)
                            ]),
                            _: 2
                          }, 1024);
                        }), 64))
                      ]),
                      _: 1
                    }),
                    createVNode("h3", { class: "text-h6 font-weight-bold mt-5 mb-2" }, "Stock movements"),
                    createVNode(_component_DocsStepTimeline, { steps: inventorySteps }),
                    createVNode("h3", { class: "text-h6 font-weight-bold mt-5 mb-2" }, "Sample stock data (exportable)"),
                    createVNode(_component_DocsCsvExportDemo, {
                      title: "Stock on hand export",
                      description: "A preview of the data returned by the inventory export endpoint. Click Download to save it as CSV.",
                      filename: "stock-on-hand.csv",
                      rows: inventorySampleRows,
                      columns: ["sku", "product", "category", "on_hand", "unit", "reorder_point", "value", "status"]
                    })
                  ]),
                  createVNode(VDivider, { class: "my-6" }),
                  createVNode("section", {
                    id: "module-products",
                    class: "docs-section"
                  }, [
                    createVNode("h2", { class: "text-h4 font-weight-bold mb-2 section-title" }, [
                      createVNode(VIcon, {
                        color: "primary",
                        class: "mr-2"
                      }, {
                        default: withCtx(() => [
                          createTextVNode("mdi-package-variant-closed")
                        ]),
                        _: 1
                      }),
                      createTextVNode(" Products ")
                    ]),
                    createVNode("p", { class: "text-body-1 text-medium-emphasis mb-4" }, " Define the catalog: products, brands, categories, units of measure, variants, and bulk import. "),
                    createVNode(_component_DocsStepTimeline, { steps: productSteps }),
                    createVNode(VAlert, {
                      type: "info",
                      variant: "tonal",
                      class: "my-3",
                      icon: "mdi-file-excel-outline"
                    }, {
                      default: withCtx(() => [
                        createVNode("strong", null, "Bulk Excel import."),
                        createTextVNode(" Download the template from the Products page, fill in rows, then upload. Supported columns: name, SKU, barcode, category, brand, unit, cost price, selling price, tax rate, opening stock. ")
                      ]),
                      _: 1
                    }),
                    createVNode("p", { class: "text-body-2 mb-2 mt-3" }, "Sample product catalog data (exportable):"),
                    createVNode(_component_DocsCsvExportDemo, {
                      title: "Product catalog export",
                      description: "Export your full product catalog with prices and stock for spreadsheet analysis.",
                      filename: "product-catalog.csv",
                      rows: productSampleRows,
                      columns: ["sku", "name", "category", "brand", "unit", "cost_price", "selling_price", "tax_rate", "is_active"]
                    })
                  ]),
                  createVNode(VDivider, { class: "my-6" }),
                  createVNode("section", {
                    id: "module-customers",
                    class: "docs-section"
                  }, [
                    createVNode("h2", { class: "text-h4 font-weight-bold mb-2 section-title" }, [
                      createVNode(VIcon, {
                        color: "primary",
                        class: "mr-2"
                      }, {
                        default: withCtx(() => [
                          createTextVNode("mdi-account-group-outline")
                        ]),
                        _: 1
                      }),
                      createTextVNode(" Customers ")
                    ]),
                    createVNode("p", { class: "text-body-1 text-medium-emphasis mb-4" }, " Build a customer CRM — loyalty points, store credit, purchase history, and outstanding balances. "),
                    createVNode(_component_DocsStepTimeline, { steps: customerSteps }),
                    createVNode("h3", { class: "text-h6 font-weight-bold mt-4 mb-2" }, "Customer balances export"),
                    createVNode(_component_DocsCsvExportDemo, {
                      title: "Customer balances",
                      description: "Who owes you how much. Filter the list on the Customers page and export outstanding balances.",
                      filename: "customer-balances.csv",
                      rows: customerSampleRows,
                      columns: ["name", "phone", "email", "loyalty_points", "credit_balance", "total_spent"]
                    })
                  ]),
                  createVNode(VDivider, { class: "my-6" }),
                  createVNode("section", {
                    id: "module-suppliers",
                    class: "docs-section"
                  }, [
                    createVNode("h2", { class: "text-h4 font-weight-bold mb-2 section-title" }, [
                      createVNode(VIcon, {
                        color: "primary",
                        class: "mr-2"
                      }, {
                        default: withCtx(() => [
                          createTextVNode("mdi-truck-delivery-outline")
                        ]),
                        _: 1
                      }),
                      createTextVNode(" Suppliers and Purchasing ")
                    ]),
                    createVNode("p", { class: "text-body-1 text-medium-emphasis mb-4" }, " Manage suppliers, raise purchase orders (POs), receive goods into stock, and track payables. "),
                    createVNode(_component_DocsStepTimeline, { steps: supplierSteps }),
                    createVNode("p", { class: "text-body-2 mt-3 mb-2" }, "Sample purchase order data (exportable):"),
                    createVNode(_component_DocsCsvExportDemo, {
                      title: "Purchase orders export",
                      description: "POs by status with line totals and supplier info.",
                      filename: "purchase-orders.csv",
                      rows: poSampleRows,
                      columns: ["po_number", "supplier", "branch", "status", "order_date", "total"]
                    })
                  ]),
                  createVNode(VDivider, { class: "my-6" }),
                  createVNode("section", {
                    id: "module-reports",
                    class: "docs-section"
                  }, [
                    createVNode("h2", { class: "text-h4 font-weight-bold mb-2 section-title" }, [
                      createVNode(VIcon, {
                        color: "primary",
                        class: "mr-2"
                      }, {
                        default: withCtx(() => [
                          createTextVNode("mdi-chart-box-outline")
                        ]),
                        _: 1
                      }),
                      createTextVNode(" Reports ")
                    ]),
                    createVNode("p", { class: "text-body-1 text-medium-emphasis mb-4" }, " Generate sales summaries, profit and loss, VAT returns, and stock valuation for any period and branch. "),
                    createVNode(_component_DocsSnapshot, {
                      src: unref(reportsSnapshot),
                      alt: "Sales summary report with KPIs, line chart, and payment method breakdown",
                      label: "Fig 5. Sales summary report",
                      class: "mb-4"
                    }, null, 8, ["src"]),
                    createVNode(_component_DocsStepTimeline, { steps: reportSteps }),
                    createVNode(VAlert, {
                      type: "info",
                      variant: "tonal",
                      class: "mb-3",
                      icon: "mdi-file-export-outline"
                    }, {
                      default: withCtx(() => [
                        createTextVNode(" Every report page has "),
                        createVNode("strong", null, "Export CSV"),
                        createTextVNode(" and "),
                        createVNode("strong", null, "Export PDF"),
                        createTextVNode(" buttons. CSV gives you raw data for spreadsheets; PDF gives you a printable layout for sharing. ")
                      ]),
                      _: 1
                    }),
                    createVNode("h3", { class: "text-h6 font-weight-bold mb-2" }, "Interactive sample — Sales by day"),
                    createVNode(_component_DocsChartExportDemo, {
                      title: "Daily sales (sample)",
                      description: "A sample chart produced by the Reports module. Export the underlying data as CSV.",
                      filename: "daily-sales.csv",
                      categories: reportCategories,
                      series: reportSeries
                    })
                  ]),
                  createVNode(VDivider, { class: "my-6" }),
                  createVNode("section", {
                    id: "module-analytics",
                    class: "docs-section"
                  }, [
                    createVNode("h2", { class: "text-h4 font-weight-bold mb-2 section-title" }, [
                      createVNode(VIcon, {
                        color: "primary",
                        class: "mr-2"
                      }, {
                        default: withCtx(() => [
                          createTextVNode("mdi-chart-multiple")
                        ]),
                        _: 1
                      }),
                      createTextVNode(" Analytics ")
                    ]),
                    createVNode("p", { class: "text-body-1 text-medium-emphasis mb-4" }, " Interactive dashboards: ABC analysis, revenue trends, top products, staff performance, peak hours. "),
                    createVNode(_component_DocsChartExportDemo, {
                      title: "Top products by revenue (sample)",
                      description: "Visualize which products generate the most revenue. Export for further analysis.",
                      filename: "top-products.csv",
                      categories: analyticsCategories,
                      series: analyticsSeries
                    }),
                    createVNode(VAlert, {
                      type: "info",
                      variant: "tonal",
                      class: "mb-3 mt-4",
                      icon: "mdi-chart-bell-curve"
                    }, {
                      default: withCtx(() => [
                        createVNode("strong", null, "ABC Analysis."),
                        createTextVNode(" Inventory is segmented into A (top 20% by value), B (next 30%), and C (remaining 50%) so you can prioritize reordering. ")
                      ]),
                      _: 1
                    })
                  ]),
                  createVNode(VDivider, { class: "my-6" }),
                  createVNode("section", {
                    id: "module-accounting",
                    class: "docs-section"
                  }, [
                    createVNode("h2", { class: "text-h4 font-weight-bold mb-2 section-title" }, [
                      createVNode(VIcon, {
                        color: "primary",
                        class: "mr-2"
                      }, {
                        default: withCtx(() => [
                          createTextVNode("mdi-calculator-variant-outline")
                        ]),
                        _: 1
                      }),
                      createTextVNode(" Accounts and Finance ")
                    ]),
                    createVNode("p", { class: "text-body-1 text-medium-emphasis mb-4" }, " Chart of accounts, journal entries, ledgers, VAT, and financial statements. "),
                    createVNode(_component_DocsStepTimeline, { steps: accountingSteps }),
                    createVNode("p", { class: "text-body-2 mt-3 mb-2" }, "Sample journal entries (exportable):"),
                    createVNode(_component_DocsCsvExportDemo, {
                      title: "Journal entries export",
                      description: "Export posted journal entries with debit and credit lines for accounting review.",
                      filename: "journal-entries.csv",
                      rows: journalSampleRows,
                      columns: ["entry_no", "date", "account", "description", "debit", "credit"]
                    })
                  ]),
                  createVNode(VDivider, { class: "my-6" }),
                  createVNode("section", {
                    id: "modules",
                    class: "docs-section"
                  }, [
                    createVNode("h2", { class: "text-h4 font-weight-bold mb-2 section-title" }, [
                      createVNode(VIcon, {
                        color: "primary",
                        class: "mr-2"
                      }, {
                        default: withCtx(() => [
                          createTextVNode("mdi-view-module-outline")
                        ]),
                        _: 1
                      }),
                      createTextVNode(" All Modules at a Glance ")
                    ]),
                    createVNode("p", { class: "text-body-1 text-medium-emphasis mb-4" }, " A quick reference table of every module and its main capabilities. "),
                    createVNode(VDataTable, {
                      headers: moduleHeaders,
                      items: moduleRows,
                      density: "comfortable",
                      class: "border rounded-xl",
                      "items-per-page": "-1"
                    }, {
                      "item.icon": withCtx(({ item }) => [
                        createVNode(VIcon, {
                          color: item.color,
                          size: "22"
                        }, {
                          default: withCtx(() => [
                            createTextVNode(toDisplayString(item.icon), 1)
                          ]),
                          _: 2
                        }, 1032, ["color"])
                      ]),
                      "item.actions": withCtx(({ item }) => [
                        createVNode(VBtn, {
                          size: "small",
                          variant: "text",
                          color: "primary",
                          onClick: ($event) => scrollTo(item.link)
                        }, {
                          default: withCtx(() => [
                            createTextVNode(" Read ")
                          ]),
                          _: 1
                        }, 8, ["onClick"])
                      ]),
                      _: 1
                    })
                  ]),
                  createVNode(VDivider, { class: "my-6" }),
                  createVNode("section", {
                    id: "roles",
                    class: "docs-section"
                  }, [
                    createVNode("h2", { class: "text-h4 font-weight-bold mb-2 section-title" }, [
                      createVNode(VIcon, {
                        color: "primary",
                        class: "mr-2"
                      }, {
                        default: withCtx(() => [
                          createTextVNode("mdi-shield-account-outline")
                        ]),
                        _: 1
                      }),
                      createTextVNode(" Roles, Permissions, and Audit ")
                    ]),
                    createVNode("p", { class: "text-body-1 text-medium-emphasis mb-4" }, " Fine-grained Role-Based Access Control (RBAC) with audit logging. Every action is recorded. "),
                    createVNode(_component_DocsSnapshot, {
                      src: unref(iamSnapshot),
                      alt: "IAM page showing users with roles, statuses, and KPIs",
                      label: "Fig 6. The IAM page",
                      class: "mb-4"
                    }, null, 8, ["src"]),
                    createVNode("h3", { class: "text-h6 font-weight-bold mb-2" }, "Default roles"),
                    createVNode(VDataTable, {
                      headers: roleHeaders,
                      items: roleRows,
                      density: "comfortable",
                      class: "border rounded-xl mb-4",
                      "items-per-page": "-1"
                    }),
                    createVNode("h3", { class: "text-h6 font-weight-bold mb-2" }, "Audit logs"),
                    createVNode("p", { class: "text-body-2 mb-3" }, " Every login, create, update, delete, permission change, and export is recorded with user, IP, module, action, and timestamp. Tenant admins and auditors can filter and export the audit trail. "),
                    createVNode(_component_DocsSnapshot, {
                      src: unref(auditSnapshot),
                      alt: "Audit logs page with filters and timeline of actions by user, module, status",
                      label: "Fig 7. The audit log",
                      class: "mb-4"
                    }, null, 8, ["src"]),
                    createVNode(_component_DocsCsvExportDemo, {
                      title: "Audit log export",
                      description: "Filter the audit log by user, action, module, date, and export for compliance reporting.",
                      filename: "audit-log.csv",
                      rows: auditSampleRows,
                      columns: ["timestamp", "user", "action", "module", "ip_address", "status"]
                    })
                  ]),
                  createVNode(VDivider, { class: "my-6" }),
                  createVNode("section", {
                    id: "api-and-exports",
                    class: "docs-section"
                  }, [
                    createVNode("h2", { class: "text-h4 font-weight-bold mb-2 section-title" }, [
                      createVNode(VIcon, {
                        color: "primary",
                        class: "mr-2"
                      }, {
                        default: withCtx(() => [
                          createTextVNode("mdi-api")
                        ]),
                        _: 1
                      }),
                      createTextVNode(" API and Exports ")
                    ]),
                    createVNode("p", { class: "text-body-1 text-medium-emphasis mb-4" }, [
                      createTextVNode(" All list pages expose a REST API at "),
                      createVNode("code", null, "/api"),
                      createTextVNode(" and support CSV export. Here is how. ")
                    ]),
                    createVNode("h3", { class: "text-h6 font-weight-bold mb-2" }, "Authentication"),
                    createVNode("p", { class: "text-body-2 mb-3" }, [
                      createTextVNode(" The frontend uses JWT access and refresh tokens. The token is sent as "),
                      createVNode("code", null, "Authorization: Bearer <access_token>"),
                      createTextVNode(". Access tokens expire every 15 minutes and are refreshed automatically on 401 responses. ")
                    ]),
                    createVNode(VCard, {
                      rounded: "lg",
                      flat: "",
                      border: "",
                      class: "pa-4 mb-3"
                    }, {
                      default: withCtx(() => [
                        createVNode("pre", { class: "code-block" }, 'POST /api/auth/login/\nContent-Type: application/json\n\n{\n  "email": "you@example.com",\n  "password": "your-password"\n}')
                      ]),
                      _: 1
                    }),
                    createVNode("h3", { class: "text-h6 font-weight-bold mb-2" }, "Refreshing the token"),
                    createVNode(VCard, {
                      rounded: "lg",
                      flat: "",
                      border: "",
                      class: "pa-4 mb-3"
                    }, {
                      default: withCtx(() => [
                        createVNode("pre", { class: "code-block" }, "POST /api/auth/refresh/\nAuthorization: Bearer <refresh_token>")
                      ]),
                      _: 1
                    }),
                    createVNode("h3", { class: "text-h6 font-weight-bold mb-2" }, "Listing resources"),
                    createVNode(VCard, {
                      rounded: "lg",
                      flat: "",
                      border: "",
                      class: "pa-4 mb-3"
                    }, {
                      default: withCtx(() => [
                        createVNode("pre", { class: "code-block" }, 'GET /api/products/?search=bread&category=groceries&ordering=-created_at\nAuthorization: Bearer <access_token>\n\n# Response shape:\n{\n  "count": 128,\n  "next": "https://…/api/products/?page=2",\n  "previous": null,\n  "results": [ {…}, {…}, … ]\n}')
                      ]),
                      _: 1
                    }),
                    createVNode("h3", { class: "text-h6 font-weight-bold mb-2" }, "Audit trail / Logs"),
                    createVNode(VCard, {
                      rounded: "lg",
                      flat: "",
                      border: "",
                      class: "pa-3 mb-3"
                    }, {
                      default: withCtx(() => [
                        createVNode(VRow, { density: "comfortable" }, {
                          default: withCtx(() => [
                            createVNode(VCol, {
                              cols: "12",
                              md: "6"
                            }, {
                              default: withCtx(() => [
                                createVNode(VRow, { density: "comfortable" }, {
                                  default: withCtx(() => [
                                    createVNode(VCol, { cols: "auto" }, {
                                      default: withCtx(() => [
                                        createVNode(VBtn, {
                                          color: "primary",
                                          variant: "flat",
                                          size: "small",
                                          "prepend-icon": "mdi-download",
                                          onClick: downloadApiAuditCsv
                                        }, {
                                          default: withCtx(() => [
                                            createTextVNode("Download Audit Log CSV")
                                          ]),
                                          _: 1
                                        })
                                      ]),
                                      _: 1
                                    }),
                                    createVNode(VCol, { cols: "auto" }, {
                                      default: withCtx(() => [
                                        createVNode(VBtn, {
                                          color: "primary",
                                          variant: "flat",
                                          size: "small",
                                          "prepend-icon": "mdi-download",
                                          onClick: downloadApiCartCsv
                                        }, {
                                          default: withCtx(() => [
                                            createTextVNode("Download Sales Data CSV")
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
                            })
                          ]),
                          _: 1
                        })
                      ]),
                      _: 1
                    }),
                    createVNode(VAlert, {
                      type: "info",
                      variant: "tonal",
                      icon: "mdi-information-outline"
                    }, {
                      default: withCtx(() => [
                        createTextVNode(" Most authenticated endpoints accept "),
                        createVNode("code", null, "Accept: text/csv"),
                        createTextVNode(" instead of JSON to return a CSV stream directly. ")
                      ]),
                      _: 1
                    })
                  ]),
                  createVNode(VDivider, { class: "my-6" }),
                  createVNode("section", {
                    id: "faq",
                    class: "docs-section"
                  }, [
                    createVNode("h2", { class: "text-h4 font-weight-bold mb-2 section-title" }, [
                      createVNode(VIcon, {
                        color: "primary",
                        class: "mr-2"
                      }, {
                        default: withCtx(() => [
                          createTextVNode("mdi-help-circle-outline")
                        ]),
                        _: 1
                      }),
                      createTextVNode(" Frequently Asked Questions ")
                    ]),
                    createVNode(VExpansionPanels, {
                      class: "mt-4",
                      variant: "accordion"
                    }, {
                      default: withCtx(() => [
                        (openBlock(), createBlock(Fragment, null, renderList(faqs, (f, i) => {
                          return createVNode(VExpansionPanel, { key: i }, {
                            default: withCtx(() => [
                              createVNode(VExpansionPanelTitle, { class: "text-subtitle-1 font-weight-bold" }, {
                                default: withCtx(() => [
                                  createTextVNode(toDisplayString(f.q), 1)
                                ]),
                                _: 2
                              }, 1024),
                              createVNode(VExpansionPanelText, null, {
                                default: withCtx(() => [
                                  createVNode("p", { class: "text-body-1" }, toDisplayString(f.a), 1)
                                ]),
                                _: 2
                              }, 1024)
                            ]),
                            _: 2
                          }, 1024);
                        }), 64))
                      ]),
                      _: 1
                    }),
                    createVNode(VCard, {
                      rounded: "xl",
                      flat: "",
                      border: "",
                      class: "pa-4 mt-6 contact-card"
                    }, {
                      default: withCtx(() => [
                        createVNode(VRow, { align: "center" }, {
                          default: withCtx(() => [
                            createVNode(VCol, {
                              cols: "12",
                              md: "8"
                            }, {
                              default: withCtx(() => [
                                createVNode("div", { class: "text-h6 font-weight-bold" }, "Still need help?"),
                                createVNode("p", { class: "text-body-2 text-medium-emphasis mb-0" }, " Contact your workspace admin or visit our support center. If you are a super-admin, open the Platform Dashboard for tenant management. ")
                              ]),
                              _: 1
                            }),
                            createVNode(VCol, {
                              cols: "12",
                              md: "4",
                              class: "text-md-right"
                            }, {
                              default: withCtx(() => [
                                createVNode(VBtn, {
                                  color: "primary",
                                  "prepend-icon": "mdi-login",
                                  onClick: ($event) => ("navigateTo" in _ctx ? _ctx.navigateTo : unref(navigateTo))("/login")
                                }, {
                                  default: withCtx(() => [
                                    createTextVNode(" Go to login ")
                                  ]),
                                  _: 1
                                }, 8, ["onClick"])
                              ]),
                              _: 1
                            })
                          ]),
                          _: 1
                        })
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
      _push(`</div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/docs.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const docs = /* @__PURE__ */ _export_sfc(_sfc_main, [["__scopeId", "data-v-669b0dc0"]]);
export {
  docs as default
};
//# sourceMappingURL=docs-D2ZaMwZ_.js.map
