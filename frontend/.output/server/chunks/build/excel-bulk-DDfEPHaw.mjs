import { N as useRoute$1, u as useRouter$1, M as useToast, V as VContainer, g as VBtn, d as VIcon, i as VRow, j as VCol, Q as VAvatar, n as navigateTo, k as VCard, l as VTabs, m as VTab, a0 as VWindow, a1 as VWindowItem, f as VSpacer, h as VAlert, a2 as VScaleTransition, P as VTable, C as VTextField, R as VSwitch, a3 as VSlideYTransition, I as VList, J as VListItem, L as VListItemSubtitle, K as VListItemTitle, v as VChip } from './server.mjs';
import { ref, computed, mergeProps, withCtx, createTextVNode, createVNode, unref, isRef, toDisplayString, withModifiers, openBlock, createBlock, Fragment, createCommentVNode, renderList, useSSRContext } from 'vue';
import { ssrRenderComponent, ssrRenderClass, ssrInterpolate, ssrRenderStyle, ssrRenderList } from 'vue/server-renderer';
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

const API_BASE = "/suppliers";
const _sfc_main = {
  __name: "excel-bulk",
  __ssrInlineRender: true,
  setup(__props) {
    const route = useRoute$1();
    const router = useRouter$1();
    const toast = useToast();
    const mode = ref("import");
    const fileInput = ref(null);
    const selectedFile = ref(null);
    const isDragging = ref(false);
    const parsing = ref(false);
    const preview = ref(null);
    const previewRows = ref([]);
    const parseErrors = ref([]);
    const saving = ref(false);
    const importResult = ref(null);
    const downloadingTemplate = ref(false);
    const exporting = ref(false);
    const resultBorderStyle = computed(() => {
      if (!importResult.value) return "";
      return importResult.value.failed > 0 ? "border-left: 4px solid rgb(var(--v-theme-warning)) !important;" : "border-left: 4px solid rgb(var(--v-theme-success)) !important;";
    });
    const emptyCodeCount = computed(
      () => previewRows.value.filter((r) => !r.supplier_code || !String(r.supplier_code).trim()).length
    );
    function rowInvalid(row) {
      if (!row.name || !String(row.name).trim()) return true;
      return false;
    }
    const exportInfo = [
      { icon: "mdi-format-columns", color: "indigo", title: "Formatted columns", subtitle: "Headers, frozen panes, right-aligned numeric columns" },
      { icon: "mdi-truck-outline", color: "success", title: "All suppliers", subtitle: "No pagination limit — exports everything" }
    ];
    const exportParams = computed(() => {
      const params = {};
      const q = route.query;
      if (q.search) params.search = q.search;
      if (q.is_active) params.is_active = q.is_active;
      if (q.country) params.country = q.country;
      if (q.ordering) params.ordering = q.ordering;
      return params;
    });
    const activeFilterChips = computed(() => {
      const chips = [];
      const q = route.query;
      if (q.search) chips.push({ label: `Search: "${q.search}"`, color: "primary" });
      if (q.is_active) chips.push({ label: q.is_active === "true" ? "Active" : "Inactive", color: "amber" });
      if (q.country) chips.push({ label: `Country: ${q.country}`, color: "indigo" });
      return chips;
    });
    function goBack() {
      router.push("/suppliers");
    }
    function openFileDialog() {
      fileInput.value?.click();
    }
    function onFileSelected(e) {
      const file = e.target.files?.[0];
      if (file) setFile(file);
    }
    function onDrop(e) {
      isDragging.value = false;
      const file = e.dataTransfer?.files?.[0];
      if (file) setFile(file);
    }
    function setFile(file) {
      const name = file.name.toLowerCase();
      if (!name.endsWith(".xlsx") && !name.endsWith(".xlsm")) {
        toast.error("Please select an .xlsx file");
        return;
      }
      if (file.size > 20 * 1024 * 1024) {
        toast.error("File too large (max 20MB)");
        return;
      }
      selectedFile.value = file;
      preview.value = null;
      previewRows.value = [];
      parseErrors.value = [];
      importResult.value = null;
      if (fileInput.value) fileInput.value.value = "";
    }
    function resetFile() {
      selectedFile.value = null;
      preview.value = null;
      previewRows.value = [];
      parseErrors.value = [];
      importResult.value = null;
      if (fileInput.value) fileInput.value.value = "";
    }
    function cancelPreview() {
      preview.value = null;
      previewRows.value = [];
      parseErrors.value = [];
    }
    function resetAll() {
      resetFile();
      mode.value = "import";
    }
    function formatSize(bytes) {
      if (bytes < 1024) return `${bytes} B`;
      if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
      return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
    }
    async function downloadTemplate() {
      downloadingTemplate.value = true;
      try {
        const blob = await useApi()(`${API_BASE}/import-excel-template/`, { method: "GET", responseType: "blob" });
        triggerDownload(blob, "suppliers_import_template.xlsx");
        toast.success("Template downloaded");
      } catch (e) {
        toast.error("Failed to download template");
      } finally {
        downloadingTemplate.value = false;
      }
    }
    async function parseFile() {
      if (!selectedFile.value) return;
      parsing.value = true;
      importResult.value = null;
      const formData = new FormData();
      formData.append("file", selectedFile.value);
      try {
        const result = await useApi()(`${API_BASE}/parse-excel/`, { method: "POST", body: formData });
        preview.value = result;
        for (const r of result.rows) r._autoSku = false;
        previewRows.value = result.rows;
        parseErrors.value = result.errors || [];
        if (result.rows.length === 0) toast.warning("No data rows found in the file");
        else toast.success(`${result.rows.length} row(s) ready for preview`);
      } catch (e) {
        toast.error(e?.data?.detail || "Failed to parse file");
      } finally {
        parsing.value = false;
      }
    }
    function addRow() {
      previewRows.value.push({
        supplier_code: "",
        name: "",
        contact_person: "",
        email: "",
        phone: "",
        city: "",
        country: "United States",
        payment_terms: "",
        lead_time_days: 7,
        is_active: true
      });
    }
    function removeRow(idx) {
      previewRows.value.splice(idx, 1);
    }
    async function saveBulk() {
      if (previewRows.value.length === 0) return;
      const invalid = previewRows.value.filter((r) => !r.name || !String(r.name).trim()).length;
      if (invalid > 0) {
        toast.error(`${invalid} row(s) missing a required Name — fix or remove them`);
        return;
      }
      saving.value = true;
      const items = previewRows.value.map((r) => {
        const out = {};
        for (const [k, v] of Object.entries(r)) {
          if (!k.startsWith("_")) out[k] = v;
        }
        return out;
      });
      try {
        const result = await useApi()(`${API_BASE}/bulk-upsert/`, { method: "POST", body: { items } });
        importResult.value = result;
        if (result.failed > 0) toast.warning(`Saved ${result.created + result.updated}, ${result.failed} failed`);
        else toast.success(`Import complete: ${result.created} created, ${result.updated} updated`);
        if (result.failed === 0) {
          preview.value = null;
          previewRows.value = [];
          parseErrors.value = [];
        }
      } catch (e) {
        toast.error(e?.data?.detail || "Save failed");
      } finally {
        saving.value = false;
      }
    }
    async function doExport() {
      exporting.value = true;
      try {
        const params = new URLSearchParams();
        for (const [k, v] of Object.entries(exportParams.value)) {
          if (v) params.append(k, String(v));
        }
        const qs = params.toString();
        const url = `${API_BASE}/export-excel/${qs ? `?${qs}` : ""}`;
        const blob = await useApi()(url, { method: "GET", responseType: "blob" });
        const today = (/* @__PURE__ */ new Date()).toISOString().slice(0, 10);
        triggerDownload(blob, `suppliers_export_${today}.xlsx`);
        toast.success("Export started");
      } catch (e) {
        toast.error("Failed to export suppliers");
      } finally {
        exporting.value = false;
      }
    }
    function triggerDownload(blob, filename) {
      const url = URL.createObjectURL(blob);
      const link = (void 0).createElement("a");
      link.href = url;
      link.download = filename;
      (void 0).body.appendChild(link);
      link.click();
      (void 0).body.removeChild(link);
      setTimeout(() => URL.revokeObjectURL(url), 1500);
    }
    return (_ctx, _push, _parent, _attrs) => {
      _push(ssrRenderComponent(VContainer, mergeProps({
        class: "pa-0",
        fluid: ""
      }, _attrs), {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<div class="d-flex align-center ga-2 mb-4 flex-wrap" data-v-6f982028${_scopeId}>`);
            _push2(ssrRenderComponent(VBtn, {
              variant: "text",
              size: "small",
              "prepend-icon": "mdi-arrow-left",
              onClick: goBack
            }, {
              default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                if (_push3) {
                  _push3(` Back to Suppliers `);
                } else {
                  return [
                    createTextVNode(" Back to Suppliers ")
                  ];
                }
              }),
              _: 1
            }, _parent2, _scopeId));
            _push2(ssrRenderComponent(VIcon, {
              size: "14",
              class: "text-disabled"
            }, {
              default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                if (_push3) {
                  _push3(`mdi-chevron-right`);
                } else {
                  return [
                    createTextVNode("mdi-chevron-right")
                  ];
                }
              }),
              _: 1
            }, _parent2, _scopeId));
            _push2(`<span class="text-body-2 text-medium-emphasis" data-v-6f982028${_scopeId}>Excel Import / Export</span></div>`);
            _push2(ssrRenderComponent(VRow, { class: "d-flex align-center justify-space-between mb-6" }, {
              default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                if (_push3) {
                  _push3(ssrRenderComponent(VCol, {
                    cols: "12",
                    sm: "7"
                  }, {
                    default: withCtx((_3, _push4, _parent4, _scopeId3) => {
                      if (_push4) {
                        _push4(`<div class="d-flex align-center ga-3" data-v-6f982028${_scopeId3}>`);
                        _push4(ssrRenderComponent(VAvatar, {
                          color: "success",
                          size: "48",
                          rounded: "lg"
                        }, {
                          default: withCtx((_4, _push5, _parent5, _scopeId4) => {
                            if (_push5) {
                              _push5(ssrRenderComponent(VIcon, { size: "26" }, {
                                default: withCtx((_5, _push6, _parent6, _scopeId5) => {
                                  if (_push6) {
                                    _push6(`mdi-microsoft-excel`);
                                  } else {
                                    return [
                                      createTextVNode("mdi-microsoft-excel")
                                    ];
                                  }
                                }),
                                _: 1
                              }, _parent5, _scopeId4));
                            } else {
                              return [
                                createVNode(VIcon, { size: "26" }, {
                                  default: withCtx(() => [
                                    createTextVNode("mdi-microsoft-excel")
                                  ]),
                                  _: 1
                                })
                              ];
                            }
                          }),
                          _: 1
                        }, _parent4, _scopeId3));
                        _push4(`<div data-v-6f982028${_scopeId3}><div class="text-h5 font-weight-bold" data-v-6f982028${_scopeId3}>Excel Import / Export</div><div class="text-body-2 text-medium-emphasis" data-v-6f982028${_scopeId3}> Bulk upload &amp; export suppliers via .xlsx workbook </div></div></div>`);
                      } else {
                        return [
                          createVNode("div", { class: "d-flex align-center ga-3" }, [
                            createVNode(VAvatar, {
                              color: "success",
                              size: "48",
                              rounded: "lg"
                            }, {
                              default: withCtx(() => [
                                createVNode(VIcon, { size: "26" }, {
                                  default: withCtx(() => [
                                    createTextVNode("mdi-microsoft-excel")
                                  ]),
                                  _: 1
                                })
                              ]),
                              _: 1
                            }),
                            createVNode("div", null, [
                              createVNode("div", { class: "text-h5 font-weight-bold" }, "Excel Import / Export"),
                              createVNode("div", { class: "text-body-2 text-medium-emphasis" }, " Bulk upload & export suppliers via .xlsx workbook ")
                            ])
                          ])
                        ];
                      }
                    }),
                    _: 1
                  }, _parent3, _scopeId2));
                  _push3(ssrRenderComponent(VCol, {
                    cols: "12",
                    sm: "5",
                    class: "d-flex justify-end ga-2 flex-wrap"
                  }, {
                    default: withCtx((_3, _push4, _parent4, _scopeId3) => {
                      if (_push4) {
                        _push4(ssrRenderComponent(VBtn, {
                          variant: "outlined",
                          "prepend-icon": "mdi-truck-outline",
                          onClick: ($event) => ("navigateTo" in _ctx ? _ctx.navigateTo : unref(navigateTo))("/suppliers")
                        }, {
                          default: withCtx((_4, _push5, _parent5, _scopeId4) => {
                            if (_push5) {
                              _push5(` View Suppliers `);
                            } else {
                              return [
                                createTextVNode(" View Suppliers ")
                              ];
                            }
                          }),
                          _: 1
                        }, _parent4, _scopeId3));
                      } else {
                        return [
                          createVNode(VBtn, {
                            variant: "outlined",
                            "prepend-icon": "mdi-truck-outline",
                            onClick: ($event) => ("navigateTo" in _ctx ? _ctx.navigateTo : unref(navigateTo))("/suppliers")
                          }, {
                            default: withCtx(() => [
                              createTextVNode(" View Suppliers ")
                            ]),
                            _: 1
                          }, 8, ["onClick"])
                        ];
                      }
                    }),
                    _: 1
                  }, _parent3, _scopeId2));
                } else {
                  return [
                    createVNode(VCol, {
                      cols: "12",
                      sm: "7"
                    }, {
                      default: withCtx(() => [
                        createVNode("div", { class: "d-flex align-center ga-3" }, [
                          createVNode(VAvatar, {
                            color: "success",
                            size: "48",
                            rounded: "lg"
                          }, {
                            default: withCtx(() => [
                              createVNode(VIcon, { size: "26" }, {
                                default: withCtx(() => [
                                  createTextVNode("mdi-microsoft-excel")
                                ]),
                                _: 1
                              })
                            ]),
                            _: 1
                          }),
                          createVNode("div", null, [
                            createVNode("div", { class: "text-h5 font-weight-bold" }, "Excel Import / Export"),
                            createVNode("div", { class: "text-body-2 text-medium-emphasis" }, " Bulk upload & export suppliers via .xlsx workbook ")
                          ])
                        ])
                      ]),
                      _: 1
                    }),
                    createVNode(VCol, {
                      cols: "12",
                      sm: "5",
                      class: "d-flex justify-end ga-2 flex-wrap"
                    }, {
                      default: withCtx(() => [
                        createVNode(VBtn, {
                          variant: "outlined",
                          "prepend-icon": "mdi-truck-outline",
                          onClick: ($event) => ("navigateTo" in _ctx ? _ctx.navigateTo : unref(navigateTo))("/suppliers")
                        }, {
                          default: withCtx(() => [
                            createTextVNode(" View Suppliers ")
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
            }, _parent2, _scopeId));
            _push2(ssrRenderComponent(VCard, {
              rounded: "xl",
              flat: "",
              border: "",
              class: "mb-6 overflow-hidden"
            }, {
              default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                if (_push3) {
                  _push3(ssrRenderComponent(VTabs, {
                    modelValue: unref(mode),
                    "onUpdate:modelValue": ($event) => isRef(mode) ? mode.value = $event : null,
                    color: "success",
                    density: "comfortable",
                    "show-arrows": ""
                  }, {
                    default: withCtx((_3, _push4, _parent4, _scopeId3) => {
                      if (_push4) {
                        _push4(ssrRenderComponent(VTab, {
                          value: "import",
                          "prepend-icon": "mdi-file-import-outline"
                        }, {
                          default: withCtx((_4, _push5, _parent5, _scopeId4) => {
                            if (_push5) {
                              _push5(`Import`);
                            } else {
                              return [
                                createTextVNode("Import")
                              ];
                            }
                          }),
                          _: 1
                        }, _parent4, _scopeId3));
                        _push4(ssrRenderComponent(VTab, {
                          value: "export",
                          "prepend-icon": "mdi-file-export-outline"
                        }, {
                          default: withCtx((_4, _push5, _parent5, _scopeId4) => {
                            if (_push5) {
                              _push5(`Export`);
                            } else {
                              return [
                                createTextVNode("Export")
                              ];
                            }
                          }),
                          _: 1
                        }, _parent4, _scopeId3));
                      } else {
                        return [
                          createVNode(VTab, {
                            value: "import",
                            "prepend-icon": "mdi-file-import-outline"
                          }, {
                            default: withCtx(() => [
                              createTextVNode("Import")
                            ]),
                            _: 1
                          }),
                          createVNode(VTab, {
                            value: "export",
                            "prepend-icon": "mdi-file-export-outline"
                          }, {
                            default: withCtx(() => [
                              createTextVNode("Export")
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
                    createVNode(VTabs, {
                      modelValue: unref(mode),
                      "onUpdate:modelValue": ($event) => isRef(mode) ? mode.value = $event : null,
                      color: "success",
                      density: "comfortable",
                      "show-arrows": ""
                    }, {
                      default: withCtx(() => [
                        createVNode(VTab, {
                          value: "import",
                          "prepend-icon": "mdi-file-import-outline"
                        }, {
                          default: withCtx(() => [
                            createTextVNode("Import")
                          ]),
                          _: 1
                        }),
                        createVNode(VTab, {
                          value: "export",
                          "prepend-icon": "mdi-file-export-outline"
                        }, {
                          default: withCtx(() => [
                            createTextVNode("Export")
                          ]),
                          _: 1
                        })
                      ]),
                      _: 1
                    }, 8, ["modelValue", "onUpdate:modelValue"])
                  ];
                }
              }),
              _: 1
            }, _parent2, _scopeId));
            _push2(ssrRenderComponent(VWindow, {
              modelValue: unref(mode),
              "onUpdate:modelValue": ($event) => isRef(mode) ? mode.value = $event : null
            }, {
              default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                if (_push3) {
                  _push3(ssrRenderComponent(VWindowItem, { value: "import" }, {
                    default: withCtx((_3, _push4, _parent4, _scopeId3) => {
                      if (_push4) {
                        _push4(ssrRenderComponent(VCard, {
                          rounded: "xl",
                          flat: "",
                          border: "",
                          class: "pa-6 mb-6"
                        }, {
                          default: withCtx((_4, _push5, _parent5, _scopeId4) => {
                            if (_push5) {
                              _push5(`<div class="d-flex align-center ga-3 mb-4 flex-wrap" data-v-6f982028${_scopeId4}>`);
                              _push5(ssrRenderComponent(VAvatar, {
                                color: "primary-lighten-5",
                                size: "36",
                                rounded: "lg"
                              }, {
                                default: withCtx((_5, _push6, _parent6, _scopeId5) => {
                                  if (_push6) {
                                    _push6(ssrRenderComponent(VIcon, {
                                      color: "primary",
                                      size: "20"
                                    }, {
                                      default: withCtx((_6, _push7, _parent7, _scopeId6) => {
                                        if (_push7) {
                                          _push7(`mdi-numeric-1-circle`);
                                        } else {
                                          return [
                                            createTextVNode("mdi-numeric-1-circle")
                                          ];
                                        }
                                      }),
                                      _: 1
                                    }, _parent6, _scopeId5));
                                  } else {
                                    return [
                                      createVNode(VIcon, {
                                        color: "primary",
                                        size: "20"
                                      }, {
                                        default: withCtx(() => [
                                          createTextVNode("mdi-numeric-1-circle")
                                        ]),
                                        _: 1
                                      })
                                    ];
                                  }
                                }),
                                _: 1
                              }, _parent5, _scopeId4));
                              _push5(`<div data-v-6f982028${_scopeId4}><div class="text-h6 font-weight-bold" data-v-6f982028${_scopeId4}>Download the Template</div><div class="text-body-2 text-medium-emphasis" data-v-6f982028${_scopeId4}> Pre-fill the workbook so column headers are recognized correctly </div></div>`);
                              _push5(ssrRenderComponent(VSpacer, null, null, _parent5, _scopeId4));
                              _push5(ssrRenderComponent(VBtn, {
                                color: "primary",
                                variant: "outlined",
                                "prepend-icon": "mdi-download",
                                onClick: downloadTemplate,
                                loading: unref(downloadingTemplate),
                                size: "large"
                              }, {
                                default: withCtx((_5, _push6, _parent6, _scopeId5) => {
                                  if (_push6) {
                                    _push6(` Download Template (.xlsx) `);
                                  } else {
                                    return [
                                      createTextVNode(" Download Template (.xlsx) ")
                                    ];
                                  }
                                }),
                                _: 1
                              }, _parent5, _scopeId4));
                              _push5(`</div>`);
                              _push5(ssrRenderComponent(VAlert, {
                                type: "info",
                                variant: "tonal",
                                density: "compact",
                                rounded: "lg"
                              }, {
                                default: withCtx((_5, _push6, _parent6, _scopeId5) => {
                                  if (_push6) {
                                    _push6(` Each row maps to one supplier. <strong data-v-6f982028${_scopeId5}>Supplier Code is optional</strong> — blank codes are auto-generated. Existing codes are updated. `);
                                  } else {
                                    return [
                                      createTextVNode(" Each row maps to one supplier. "),
                                      createVNode("strong", null, "Supplier Code is optional"),
                                      createTextVNode(" — blank codes are auto-generated. Existing codes are updated. ")
                                    ];
                                  }
                                }),
                                _: 1
                              }, _parent5, _scopeId4));
                            } else {
                              return [
                                createVNode("div", { class: "d-flex align-center ga-3 mb-4 flex-wrap" }, [
                                  createVNode(VAvatar, {
                                    color: "primary-lighten-5",
                                    size: "36",
                                    rounded: "lg"
                                  }, {
                                    default: withCtx(() => [
                                      createVNode(VIcon, {
                                        color: "primary",
                                        size: "20"
                                      }, {
                                        default: withCtx(() => [
                                          createTextVNode("mdi-numeric-1-circle")
                                        ]),
                                        _: 1
                                      })
                                    ]),
                                    _: 1
                                  }),
                                  createVNode("div", null, [
                                    createVNode("div", { class: "text-h6 font-weight-bold" }, "Download the Template"),
                                    createVNode("div", { class: "text-body-2 text-medium-emphasis" }, " Pre-fill the workbook so column headers are recognized correctly ")
                                  ]),
                                  createVNode(VSpacer),
                                  createVNode(VBtn, {
                                    color: "primary",
                                    variant: "outlined",
                                    "prepend-icon": "mdi-download",
                                    onClick: downloadTemplate,
                                    loading: unref(downloadingTemplate),
                                    size: "large"
                                  }, {
                                    default: withCtx(() => [
                                      createTextVNode(" Download Template (.xlsx) ")
                                    ]),
                                    _: 1
                                  }, 8, ["loading"])
                                ]),
                                createVNode(VAlert, {
                                  type: "info",
                                  variant: "tonal",
                                  density: "compact",
                                  rounded: "lg"
                                }, {
                                  default: withCtx(() => [
                                    createTextVNode(" Each row maps to one supplier. "),
                                    createVNode("strong", null, "Supplier Code is optional"),
                                    createTextVNode(" — blank codes are auto-generated. Existing codes are updated. ")
                                  ]),
                                  _: 1
                                })
                              ];
                            }
                          }),
                          _: 1
                        }, _parent4, _scopeId3));
                        _push4(ssrRenderComponent(VCard, {
                          rounded: "xl",
                          flat: "",
                          border: "",
                          class: "pa-6 mb-6"
                        }, {
                          default: withCtx((_4, _push5, _parent5, _scopeId4) => {
                            if (_push5) {
                              _push5(`<div class="d-flex align-center ga-3 mb-5 flex-wrap" data-v-6f982028${_scopeId4}>`);
                              _push5(ssrRenderComponent(VAvatar, {
                                color: "primary-lighten-5",
                                size: "36",
                                rounded: "lg"
                              }, {
                                default: withCtx((_5, _push6, _parent6, _scopeId5) => {
                                  if (_push6) {
                                    _push6(ssrRenderComponent(VIcon, {
                                      color: "primary",
                                      size: "20"
                                    }, {
                                      default: withCtx((_6, _push7, _parent7, _scopeId6) => {
                                        if (_push7) {
                                          _push7(`mdi-numeric-2-circle`);
                                        } else {
                                          return [
                                            createTextVNode("mdi-numeric-2-circle")
                                          ];
                                        }
                                      }),
                                      _: 1
                                    }, _parent6, _scopeId5));
                                  } else {
                                    return [
                                      createVNode(VIcon, {
                                        color: "primary",
                                        size: "20"
                                      }, {
                                        default: withCtx(() => [
                                          createTextVNode("mdi-numeric-2-circle")
                                        ]),
                                        _: 1
                                      })
                                    ];
                                  }
                                }),
                                _: 1
                              }, _parent5, _scopeId4));
                              _push5(`<div data-v-6f982028${_scopeId4}><div class="text-h6 font-weight-bold" data-v-6f982028${_scopeId4}>Upload &amp; Preview</div><div class="text-body-2 text-medium-emphasis" data-v-6f982028${_scopeId4}> Drag &amp; drop your completed workbook — review &amp; edit rows before saving </div></div></div><div class="${ssrRenderClass([{ "upload-zone-active": unref(isDragging), "upload-zone-has-file": unref(selectedFile) }, "upload-zone d-flex flex-column align-center justify-center ga-4 pa-10 mb-5 cursor-pointer"])}" data-v-6f982028${_scopeId4}><input type="file" accept=".xlsx,.xlsm" hidden data-v-6f982028${_scopeId4}>`);
                              _push5(ssrRenderComponent(VAvatar, {
                                color: unref(selectedFile) ? "success-lighten-5" : "grey-lighten-3",
                                size: "72",
                                rounded: "xl"
                              }, {
                                default: withCtx((_5, _push6, _parent6, _scopeId5) => {
                                  if (_push6) {
                                    _push6(ssrRenderComponent(VIcon, {
                                      color: unref(selectedFile) ? "success" : "grey",
                                      size: "40"
                                    }, {
                                      default: withCtx((_6, _push7, _parent7, _scopeId6) => {
                                        if (_push7) {
                                          _push7(`${ssrInterpolate(unref(selectedFile) ? "mdi-microsoft-excel" : "mdi-cloud-upload-outline")}`);
                                        } else {
                                          return [
                                            createTextVNode(toDisplayString(unref(selectedFile) ? "mdi-microsoft-excel" : "mdi-cloud-upload-outline"), 1)
                                          ];
                                        }
                                      }),
                                      _: 1
                                    }, _parent6, _scopeId5));
                                  } else {
                                    return [
                                      createVNode(VIcon, {
                                        color: unref(selectedFile) ? "success" : "grey",
                                        size: "40"
                                      }, {
                                        default: withCtx(() => [
                                          createTextVNode(toDisplayString(unref(selectedFile) ? "mdi-microsoft-excel" : "mdi-cloud-upload-outline"), 1)
                                        ]),
                                        _: 1
                                      }, 8, ["color"])
                                    ];
                                  }
                                }),
                                _: 1
                              }, _parent5, _scopeId4));
                              if (!unref(selectedFile)) {
                                _push5(`<!--[--><div class="text-h6 font-weight-bold" data-v-6f982028${_scopeId4}>Drop your .xlsx here or <span class="text-primary" data-v-6f982028${_scopeId4}>browse</span></div><div class="text-body-2 text-medium-emphasis" data-v-6f982028${_scopeId4}>Only .xlsx files · max 20MB · Supplier Code optional</div><!--]-->`);
                              } else {
                                _push5(`<!--[--><div class="text-h6 font-weight-bold" style="${ssrRenderStyle({ "word-break": "break-all" })}" data-v-6f982028${_scopeId4}>${ssrInterpolate(unref(selectedFile).name)}</div><div class="text-body-2 text-medium-emphasis" data-v-6f982028${_scopeId4}>${ssrInterpolate(formatSize(unref(selectedFile).size))}</div><!--]-->`);
                              }
                              _push5(`</div>`);
                              if (unref(selectedFile)) {
                                _push5(`<div class="d-flex ga-3 flex-wrap" data-v-6f982028${_scopeId4}>`);
                                _push5(ssrRenderComponent(VBtn, {
                                  color: "primary",
                                  "prepend-icon": "mdi-eye-outline",
                                  loading: unref(parsing),
                                  disabled: unref(parsing) || !!unref(preview),
                                  block: "",
                                  size: "large",
                                  onClick: parseFile
                                }, {
                                  default: withCtx((_5, _push6, _parent6, _scopeId5) => {
                                    if (_push6) {
                                      _push6(` Preview &amp; Edit `);
                                    } else {
                                      return [
                                        createTextVNode(" Preview & Edit ")
                                      ];
                                    }
                                  }),
                                  _: 1
                                }, _parent5, _scopeId4));
                                _push5(ssrRenderComponent(VBtn, {
                                  variant: "outlined",
                                  icon: "mdi-close",
                                  size: "large",
                                  onClick: resetFile,
                                  disabled: unref(parsing) || unref(saving),
                                  "aria-label": "Remove file"
                                }, null, _parent5, _scopeId4));
                                _push5(`</div>`);
                              } else {
                                _push5(`<!---->`);
                              }
                            } else {
                              return [
                                createVNode("div", { class: "d-flex align-center ga-3 mb-5 flex-wrap" }, [
                                  createVNode(VAvatar, {
                                    color: "primary-lighten-5",
                                    size: "36",
                                    rounded: "lg"
                                  }, {
                                    default: withCtx(() => [
                                      createVNode(VIcon, {
                                        color: "primary",
                                        size: "20"
                                      }, {
                                        default: withCtx(() => [
                                          createTextVNode("mdi-numeric-2-circle")
                                        ]),
                                        _: 1
                                      })
                                    ]),
                                    _: 1
                                  }),
                                  createVNode("div", null, [
                                    createVNode("div", { class: "text-h6 font-weight-bold" }, "Upload & Preview"),
                                    createVNode("div", { class: "text-body-2 text-medium-emphasis" }, " Drag & drop your completed workbook — review & edit rows before saving ")
                                  ])
                                ]),
                                createVNode("div", {
                                  class: ["upload-zone d-flex flex-column align-center justify-center ga-4 pa-10 mb-5 cursor-pointer", { "upload-zone-active": unref(isDragging), "upload-zone-has-file": unref(selectedFile) }],
                                  onClick: openFileDialog,
                                  onDragover: withModifiers(($event) => isDragging.value = true, ["prevent"]),
                                  onDragenter: withModifiers(($event) => isDragging.value = true, ["prevent"]),
                                  onDragleave: withModifiers(($event) => isDragging.value = false, ["prevent"]),
                                  onDrop: withModifiers(onDrop, ["prevent"])
                                }, [
                                  createVNode("input", {
                                    ref_key: "fileInput",
                                    ref: fileInput,
                                    type: "file",
                                    accept: ".xlsx,.xlsm",
                                    hidden: "",
                                    onChange: onFileSelected
                                  }, null, 544),
                                  createVNode(VAvatar, {
                                    color: unref(selectedFile) ? "success-lighten-5" : "grey-lighten-3",
                                    size: "72",
                                    rounded: "xl"
                                  }, {
                                    default: withCtx(() => [
                                      createVNode(VIcon, {
                                        color: unref(selectedFile) ? "success" : "grey",
                                        size: "40"
                                      }, {
                                        default: withCtx(() => [
                                          createTextVNode(toDisplayString(unref(selectedFile) ? "mdi-microsoft-excel" : "mdi-cloud-upload-outline"), 1)
                                        ]),
                                        _: 1
                                      }, 8, ["color"])
                                    ]),
                                    _: 1
                                  }, 8, ["color"]),
                                  !unref(selectedFile) ? (openBlock(), createBlock(Fragment, { key: 0 }, [
                                    createVNode("div", { class: "text-h6 font-weight-bold" }, [
                                      createTextVNode("Drop your .xlsx here or "),
                                      createVNode("span", { class: "text-primary" }, "browse")
                                    ]),
                                    createVNode("div", { class: "text-body-2 text-medium-emphasis" }, "Only .xlsx files · max 20MB · Supplier Code optional")
                                  ], 64)) : (openBlock(), createBlock(Fragment, { key: 1 }, [
                                    createVNode("div", {
                                      class: "text-h6 font-weight-bold",
                                      style: { "word-break": "break-all" }
                                    }, toDisplayString(unref(selectedFile).name), 1),
                                    createVNode("div", { class: "text-body-2 text-medium-emphasis" }, toDisplayString(formatSize(unref(selectedFile).size)), 1)
                                  ], 64))
                                ], 42, ["onDragover", "onDragenter", "onDragleave"]),
                                unref(selectedFile) ? (openBlock(), createBlock("div", {
                                  key: 0,
                                  class: "d-flex ga-3 flex-wrap"
                                }, [
                                  createVNode(VBtn, {
                                    color: "primary",
                                    "prepend-icon": "mdi-eye-outline",
                                    loading: unref(parsing),
                                    disabled: unref(parsing) || !!unref(preview),
                                    block: "",
                                    size: "large",
                                    onClick: parseFile
                                  }, {
                                    default: withCtx(() => [
                                      createTextVNode(" Preview & Edit ")
                                    ]),
                                    _: 1
                                  }, 8, ["loading", "disabled"]),
                                  createVNode(VBtn, {
                                    variant: "outlined",
                                    icon: "mdi-close",
                                    size: "large",
                                    onClick: resetFile,
                                    disabled: unref(parsing) || unref(saving),
                                    "aria-label": "Remove file"
                                  }, null, 8, ["disabled"])
                                ])) : createCommentVNode("", true)
                              ];
                            }
                          }),
                          _: 1
                        }, _parent4, _scopeId3));
                        _push4(ssrRenderComponent(VScaleTransition, null, {
                          default: withCtx((_4, _push5, _parent5, _scopeId4) => {
                            if (_push5) {
                              if (unref(preview)) {
                                _push5(ssrRenderComponent(VCard, {
                                  rounded: "xl",
                                  flat: "",
                                  border: "",
                                  class: "pa-6 mb-6"
                                }, {
                                  default: withCtx((_5, _push6, _parent6, _scopeId5) => {
                                    if (_push6) {
                                      _push6(`<div class="d-flex align-center ga-3 mb-5 flex-wrap" data-v-6f982028${_scopeId5}>`);
                                      _push6(ssrRenderComponent(VAvatar, {
                                        color: "success-lighten-5",
                                        size: "36",
                                        rounded: "lg"
                                      }, {
                                        default: withCtx((_6, _push7, _parent7, _scopeId6) => {
                                          if (_push7) {
                                            _push7(ssrRenderComponent(VIcon, {
                                              color: "success",
                                              size: "20"
                                            }, {
                                              default: withCtx((_7, _push8, _parent8, _scopeId7) => {
                                                if (_push8) {
                                                  _push8(`mdi-numeric-3-circle`);
                                                } else {
                                                  return [
                                                    createTextVNode("mdi-numeric-3-circle")
                                                  ];
                                                }
                                              }),
                                              _: 1
                                            }, _parent7, _scopeId6));
                                          } else {
                                            return [
                                              createVNode(VIcon, {
                                                color: "success",
                                                size: "20"
                                              }, {
                                                default: withCtx(() => [
                                                  createTextVNode("mdi-numeric-3-circle")
                                                ]),
                                                _: 1
                                              })
                                            ];
                                          }
                                        }),
                                        _: 1
                                      }, _parent6, _scopeId5));
                                      _push6(`<div data-v-6f982028${_scopeId5}><div class="text-h6 font-weight-bold" data-v-6f982028${_scopeId5}>Preview &amp; Edit Rows</div><div class="text-body-2 text-medium-emphasis" data-v-6f982028${_scopeId5}>${ssrInterpolate(unref(previewRows).length)} row(s) · ${ssrInterpolate(unref(preview).skipped)} empty row(s) skipped · click any cell to edit </div></div>`);
                                      _push6(ssrRenderComponent(VSpacer, null, null, _parent6, _scopeId5));
                                      _push6(ssrRenderComponent(VBtn, {
                                        variant: "text",
                                        size: "small",
                                        "prepend-icon": "mdi-plus",
                                        onClick: addRow,
                                        disabled: unref(saving)
                                      }, {
                                        default: withCtx((_6, _push7, _parent7, _scopeId6) => {
                                          if (_push7) {
                                            _push7(`Add Row`);
                                          } else {
                                            return [
                                              createTextVNode("Add Row")
                                            ];
                                          }
                                        }),
                                        _: 1
                                      }, _parent6, _scopeId5));
                                      _push6(ssrRenderComponent(VBtn, {
                                        variant: "text",
                                        size: "small",
                                        color: "error",
                                        "prepend-icon": "mdi-close",
                                        onClick: cancelPreview,
                                        disabled: unref(saving)
                                      }, {
                                        default: withCtx((_6, _push7, _parent7, _scopeId6) => {
                                          if (_push7) {
                                            _push7(`Cancel`);
                                          } else {
                                            return [
                                              createTextVNode("Cancel")
                                            ];
                                          }
                                        }),
                                        _: 1
                                      }, _parent6, _scopeId5));
                                      _push6(`</div>`);
                                      if (unref(parseErrors).length > 0) {
                                        _push6(ssrRenderComponent(VAlert, {
                                          type: "warning",
                                          variant: "tonal",
                                          density: "compact",
                                          class: "mb-4",
                                          rounded: "lg"
                                        }, {
                                          default: withCtx((_6, _push7, _parent7, _scopeId6) => {
                                            if (_push7) {
                                              _push7(`${ssrInterpolate(unref(parseErrors).length)} parse warning(s). Rows with issues are highlighted — fix or remove them before saving. `);
                                            } else {
                                              return [
                                                createTextVNode(toDisplayString(unref(parseErrors).length) + " parse warning(s). Rows with issues are highlighted — fix or remove them before saving. ", 1)
                                              ];
                                            }
                                          }),
                                          _: 1
                                        }, _parent6, _scopeId5));
                                      } else {
                                        _push6(`<!---->`);
                                      }
                                      _push6(`<div class="overflow-x-auto" data-v-6f982028${_scopeId5}>`);
                                      _push6(ssrRenderComponent(VTable, {
                                        density: "compact",
                                        class: "preview-table"
                                      }, {
                                        default: withCtx((_6, _push7, _parent7, _scopeId6) => {
                                          if (_push7) {
                                            _push7(`<thead class="bg-grey-lighten-4" data-v-6f982028${_scopeId6}><tr data-v-6f982028${_scopeId6}><th style="${ssrRenderStyle({ "min-width": "40px" })}" data-v-6f982028${_scopeId6}>#</th><th style="${ssrRenderStyle({ "min-width": "130px" })}" data-v-6f982028${_scopeId6}>Code</th><th style="${ssrRenderStyle({ "min-width": "180px" })}" data-v-6f982028${_scopeId6}>Name *</th><th style="${ssrRenderStyle({ "min-width": "150px" })}" data-v-6f982028${_scopeId6}>Contact Person</th><th style="${ssrRenderStyle({ "min-width": "180px" })}" data-v-6f982028${_scopeId6}>Email</th><th style="${ssrRenderStyle({ "min-width": "130px" })}" data-v-6f982028${_scopeId6}>Phone</th><th style="${ssrRenderStyle({ "min-width": "120px" })}" data-v-6f982028${_scopeId6}>City</th><th style="${ssrRenderStyle({ "min-width": "120px" })}" data-v-6f982028${_scopeId6}>Country</th><th style="${ssrRenderStyle({ "min-width": "110px" })}" data-v-6f982028${_scopeId6}>Payment Terms</th><th style="${ssrRenderStyle({ "min-width": "100px" })}" data-v-6f982028${_scopeId6}>Lead (days)</th><th style="${ssrRenderStyle({ "min-width": "90px" })}" data-v-6f982028${_scopeId6}>Active</th><th style="${ssrRenderStyle({ "min-width": "56px" })}" data-v-6f982028${_scopeId6}></th></tr></thead><tbody data-v-6f982028${_scopeId6}><!--[-->`);
                                            ssrRenderList(unref(previewRows), (row, i) => {
                                              _push7(`<tr class="${ssrRenderClass(rowInvalid(row) ? "bg-error-lighten-5" : "")}" data-v-6f982028${_scopeId6}><td class="text-caption text-disabled" data-v-6f982028${_scopeId6}>${ssrInterpolate(i + 1)}</td><td data-v-6f982028${_scopeId6}>`);
                                              _push7(ssrRenderComponent(VTextField, {
                                                modelValue: row.supplier_code,
                                                "onUpdate:modelValue": ($event) => row.supplier_code = $event,
                                                variant: "outlined",
                                                density: "compact",
                                                "hide-details": "",
                                                placeholder: "auto",
                                                class: "preview-input"
                                              }, null, _parent7, _scopeId6));
                                              _push7(`</td><td data-v-6f982028${_scopeId6}>`);
                                              _push7(ssrRenderComponent(VTextField, {
                                                modelValue: row.name,
                                                "onUpdate:modelValue": ($event) => row.name = $event,
                                                variant: "outlined",
                                                density: "compact",
                                                "hide-details": "",
                                                class: "preview-input"
                                              }, null, _parent7, _scopeId6));
                                              _push7(`</td><td data-v-6f982028${_scopeId6}>`);
                                              _push7(ssrRenderComponent(VTextField, {
                                                modelValue: row.contact_person,
                                                "onUpdate:modelValue": ($event) => row.contact_person = $event,
                                                variant: "outlined",
                                                density: "compact",
                                                "hide-details": "",
                                                class: "preview-input"
                                              }, null, _parent7, _scopeId6));
                                              _push7(`</td><td data-v-6f982028${_scopeId6}>`);
                                              _push7(ssrRenderComponent(VTextField, {
                                                modelValue: row.email,
                                                "onUpdate:modelValue": ($event) => row.email = $event,
                                                variant: "outlined",
                                                density: "compact",
                                                "hide-details": "",
                                                class: "preview-input"
                                              }, null, _parent7, _scopeId6));
                                              _push7(`</td><td data-v-6f982028${_scopeId6}>`);
                                              _push7(ssrRenderComponent(VTextField, {
                                                modelValue: row.phone,
                                                "onUpdate:modelValue": ($event) => row.phone = $event,
                                                variant: "outlined",
                                                density: "compact",
                                                "hide-details": "",
                                                class: "preview-input"
                                              }, null, _parent7, _scopeId6));
                                              _push7(`</td><td data-v-6f982028${_scopeId6}>`);
                                              _push7(ssrRenderComponent(VTextField, {
                                                modelValue: row.city,
                                                "onUpdate:modelValue": ($event) => row.city = $event,
                                                variant: "outlined",
                                                density: "compact",
                                                "hide-details": "",
                                                class: "preview-input"
                                              }, null, _parent7, _scopeId6));
                                              _push7(`</td><td data-v-6f982028${_scopeId6}>`);
                                              _push7(ssrRenderComponent(VTextField, {
                                                modelValue: row.country,
                                                "onUpdate:modelValue": ($event) => row.country = $event,
                                                variant: "outlined",
                                                density: "compact",
                                                "hide-details": "",
                                                class: "preview-input"
                                              }, null, _parent7, _scopeId6));
                                              _push7(`</td><td data-v-6f982028${_scopeId6}>`);
                                              _push7(ssrRenderComponent(VTextField, {
                                                modelValue: row.payment_terms,
                                                "onUpdate:modelValue": ($event) => row.payment_terms = $event,
                                                variant: "outlined",
                                                density: "compact",
                                                "hide-details": "",
                                                class: "preview-input"
                                              }, null, _parent7, _scopeId6));
                                              _push7(`</td><td data-v-6f982028${_scopeId6}>`);
                                              _push7(ssrRenderComponent(VTextField, {
                                                modelValue: row.lead_time_days,
                                                "onUpdate:modelValue": ($event) => row.lead_time_days = $event,
                                                type: "number",
                                                step: "1",
                                                variant: "outlined",
                                                density: "compact",
                                                "hide-details": "",
                                                class: "preview-input"
                                              }, null, _parent7, _scopeId6));
                                              _push7(`</td><td data-v-6f982028${_scopeId6}>`);
                                              _push7(ssrRenderComponent(VSwitch, {
                                                modelValue: row.is_active,
                                                "onUpdate:modelValue": ($event) => row.is_active = $event,
                                                color: "success",
                                                density: "compact",
                                                "hide-details": "",
                                                inset: ""
                                              }, null, _parent7, _scopeId6));
                                              _push7(`</td><td data-v-6f982028${_scopeId6}>`);
                                              _push7(ssrRenderComponent(VBtn, {
                                                icon: "mdi-delete",
                                                size: "small",
                                                variant: "text",
                                                color: "error",
                                                onClick: ($event) => removeRow(i)
                                              }, null, _parent7, _scopeId6));
                                              _push7(`</td></tr>`);
                                            });
                                            _push7(`<!--]--></tbody>`);
                                          } else {
                                            return [
                                              createVNode("thead", { class: "bg-grey-lighten-4" }, [
                                                createVNode("tr", null, [
                                                  createVNode("th", { style: { "min-width": "40px" } }, "#"),
                                                  createVNode("th", { style: { "min-width": "130px" } }, "Code"),
                                                  createVNode("th", { style: { "min-width": "180px" } }, "Name *"),
                                                  createVNode("th", { style: { "min-width": "150px" } }, "Contact Person"),
                                                  createVNode("th", { style: { "min-width": "180px" } }, "Email"),
                                                  createVNode("th", { style: { "min-width": "130px" } }, "Phone"),
                                                  createVNode("th", { style: { "min-width": "120px" } }, "City"),
                                                  createVNode("th", { style: { "min-width": "120px" } }, "Country"),
                                                  createVNode("th", { style: { "min-width": "110px" } }, "Payment Terms"),
                                                  createVNode("th", { style: { "min-width": "100px" } }, "Lead (days)"),
                                                  createVNode("th", { style: { "min-width": "90px" } }, "Active"),
                                                  createVNode("th", { style: { "min-width": "56px" } })
                                                ])
                                              ]),
                                              createVNode("tbody", null, [
                                                (openBlock(true), createBlock(Fragment, null, renderList(unref(previewRows), (row, i) => {
                                                  return openBlock(), createBlock("tr", {
                                                    key: i,
                                                    class: rowInvalid(row) ? "bg-error-lighten-5" : ""
                                                  }, [
                                                    createVNode("td", { class: "text-caption text-disabled" }, toDisplayString(i + 1), 1),
                                                    createVNode("td", null, [
                                                      createVNode(VTextField, {
                                                        modelValue: row.supplier_code,
                                                        "onUpdate:modelValue": ($event) => row.supplier_code = $event,
                                                        variant: "outlined",
                                                        density: "compact",
                                                        "hide-details": "",
                                                        placeholder: "auto",
                                                        class: "preview-input"
                                                      }, null, 8, ["modelValue", "onUpdate:modelValue"])
                                                    ]),
                                                    createVNode("td", null, [
                                                      createVNode(VTextField, {
                                                        modelValue: row.name,
                                                        "onUpdate:modelValue": ($event) => row.name = $event,
                                                        variant: "outlined",
                                                        density: "compact",
                                                        "hide-details": "",
                                                        class: "preview-input"
                                                      }, null, 8, ["modelValue", "onUpdate:modelValue"])
                                                    ]),
                                                    createVNode("td", null, [
                                                      createVNode(VTextField, {
                                                        modelValue: row.contact_person,
                                                        "onUpdate:modelValue": ($event) => row.contact_person = $event,
                                                        variant: "outlined",
                                                        density: "compact",
                                                        "hide-details": "",
                                                        class: "preview-input"
                                                      }, null, 8, ["modelValue", "onUpdate:modelValue"])
                                                    ]),
                                                    createVNode("td", null, [
                                                      createVNode(VTextField, {
                                                        modelValue: row.email,
                                                        "onUpdate:modelValue": ($event) => row.email = $event,
                                                        variant: "outlined",
                                                        density: "compact",
                                                        "hide-details": "",
                                                        class: "preview-input"
                                                      }, null, 8, ["modelValue", "onUpdate:modelValue"])
                                                    ]),
                                                    createVNode("td", null, [
                                                      createVNode(VTextField, {
                                                        modelValue: row.phone,
                                                        "onUpdate:modelValue": ($event) => row.phone = $event,
                                                        variant: "outlined",
                                                        density: "compact",
                                                        "hide-details": "",
                                                        class: "preview-input"
                                                      }, null, 8, ["modelValue", "onUpdate:modelValue"])
                                                    ]),
                                                    createVNode("td", null, [
                                                      createVNode(VTextField, {
                                                        modelValue: row.city,
                                                        "onUpdate:modelValue": ($event) => row.city = $event,
                                                        variant: "outlined",
                                                        density: "compact",
                                                        "hide-details": "",
                                                        class: "preview-input"
                                                      }, null, 8, ["modelValue", "onUpdate:modelValue"])
                                                    ]),
                                                    createVNode("td", null, [
                                                      createVNode(VTextField, {
                                                        modelValue: row.country,
                                                        "onUpdate:modelValue": ($event) => row.country = $event,
                                                        variant: "outlined",
                                                        density: "compact",
                                                        "hide-details": "",
                                                        class: "preview-input"
                                                      }, null, 8, ["modelValue", "onUpdate:modelValue"])
                                                    ]),
                                                    createVNode("td", null, [
                                                      createVNode(VTextField, {
                                                        modelValue: row.payment_terms,
                                                        "onUpdate:modelValue": ($event) => row.payment_terms = $event,
                                                        variant: "outlined",
                                                        density: "compact",
                                                        "hide-details": "",
                                                        class: "preview-input"
                                                      }, null, 8, ["modelValue", "onUpdate:modelValue"])
                                                    ]),
                                                    createVNode("td", null, [
                                                      createVNode(VTextField, {
                                                        modelValue: row.lead_time_days,
                                                        "onUpdate:modelValue": ($event) => row.lead_time_days = $event,
                                                        type: "number",
                                                        step: "1",
                                                        variant: "outlined",
                                                        density: "compact",
                                                        "hide-details": "",
                                                        class: "preview-input"
                                                      }, null, 8, ["modelValue", "onUpdate:modelValue"])
                                                    ]),
                                                    createVNode("td", null, [
                                                      createVNode(VSwitch, {
                                                        modelValue: row.is_active,
                                                        "onUpdate:modelValue": ($event) => row.is_active = $event,
                                                        color: "success",
                                                        density: "compact",
                                                        "hide-details": "",
                                                        inset: ""
                                                      }, null, 8, ["modelValue", "onUpdate:modelValue"])
                                                    ]),
                                                    createVNode("td", null, [
                                                      createVNode(VBtn, {
                                                        icon: "mdi-delete",
                                                        size: "small",
                                                        variant: "text",
                                                        color: "error",
                                                        onClick: ($event) => removeRow(i)
                                                      }, null, 8, ["onClick"])
                                                    ])
                                                  ], 2);
                                                }), 128))
                                              ])
                                            ];
                                          }
                                        }),
                                        _: 1
                                      }, _parent6, _scopeId5));
                                      _push6(`</div><div class="d-flex align-center ga-3 mt-5 flex-wrap" data-v-6f982028${_scopeId5}>`);
                                      _push6(ssrRenderComponent(VBtn, {
                                        color: "success",
                                        "prepend-icon": "mdi-content-save",
                                        loading: unref(saving),
                                        disabled: unref(saving) || unref(previewRows).length === 0,
                                        size: "large",
                                        onClick: saveBulk
                                      }, {
                                        default: withCtx((_6, _push7, _parent7, _scopeId6) => {
                                          if (_push7) {
                                            _push7(` Save ${ssrInterpolate(unref(previewRows).length)} Supplier(s) `);
                                          } else {
                                            return [
                                              createTextVNode(" Save " + toDisplayString(unref(previewRows).length) + " Supplier(s) ", 1)
                                            ];
                                          }
                                        }),
                                        _: 1
                                      }, _parent6, _scopeId5));
                                      if (unref(emptyCodeCount) > 0) {
                                        _push6(`<span class="text-body-2 text-medium-emphasis" data-v-6f982028${_scopeId5}>${ssrInterpolate(unref(emptyCodeCount))} row(s) will get auto-generated codes when saved </span>`);
                                      } else {
                                        _push6(`<!---->`);
                                      }
                                      _push6(`</div>`);
                                    } else {
                                      return [
                                        createVNode("div", { class: "d-flex align-center ga-3 mb-5 flex-wrap" }, [
                                          createVNode(VAvatar, {
                                            color: "success-lighten-5",
                                            size: "36",
                                            rounded: "lg"
                                          }, {
                                            default: withCtx(() => [
                                              createVNode(VIcon, {
                                                color: "success",
                                                size: "20"
                                              }, {
                                                default: withCtx(() => [
                                                  createTextVNode("mdi-numeric-3-circle")
                                                ]),
                                                _: 1
                                              })
                                            ]),
                                            _: 1
                                          }),
                                          createVNode("div", null, [
                                            createVNode("div", { class: "text-h6 font-weight-bold" }, "Preview & Edit Rows"),
                                            createVNode("div", { class: "text-body-2 text-medium-emphasis" }, toDisplayString(unref(previewRows).length) + " row(s) · " + toDisplayString(unref(preview).skipped) + " empty row(s) skipped · click any cell to edit ", 1)
                                          ]),
                                          createVNode(VSpacer),
                                          createVNode(VBtn, {
                                            variant: "text",
                                            size: "small",
                                            "prepend-icon": "mdi-plus",
                                            onClick: addRow,
                                            disabled: unref(saving)
                                          }, {
                                            default: withCtx(() => [
                                              createTextVNode("Add Row")
                                            ]),
                                            _: 1
                                          }, 8, ["disabled"]),
                                          createVNode(VBtn, {
                                            variant: "text",
                                            size: "small",
                                            color: "error",
                                            "prepend-icon": "mdi-close",
                                            onClick: cancelPreview,
                                            disabled: unref(saving)
                                          }, {
                                            default: withCtx(() => [
                                              createTextVNode("Cancel")
                                            ]),
                                            _: 1
                                          }, 8, ["disabled"])
                                        ]),
                                        unref(parseErrors).length > 0 ? (openBlock(), createBlock(VAlert, {
                                          key: 0,
                                          type: "warning",
                                          variant: "tonal",
                                          density: "compact",
                                          class: "mb-4",
                                          rounded: "lg"
                                        }, {
                                          default: withCtx(() => [
                                            createTextVNode(toDisplayString(unref(parseErrors).length) + " parse warning(s). Rows with issues are highlighted — fix or remove them before saving. ", 1)
                                          ]),
                                          _: 1
                                        })) : createCommentVNode("", true),
                                        createVNode("div", { class: "overflow-x-auto" }, [
                                          createVNode(VTable, {
                                            density: "compact",
                                            class: "preview-table"
                                          }, {
                                            default: withCtx(() => [
                                              createVNode("thead", { class: "bg-grey-lighten-4" }, [
                                                createVNode("tr", null, [
                                                  createVNode("th", { style: { "min-width": "40px" } }, "#"),
                                                  createVNode("th", { style: { "min-width": "130px" } }, "Code"),
                                                  createVNode("th", { style: { "min-width": "180px" } }, "Name *"),
                                                  createVNode("th", { style: { "min-width": "150px" } }, "Contact Person"),
                                                  createVNode("th", { style: { "min-width": "180px" } }, "Email"),
                                                  createVNode("th", { style: { "min-width": "130px" } }, "Phone"),
                                                  createVNode("th", { style: { "min-width": "120px" } }, "City"),
                                                  createVNode("th", { style: { "min-width": "120px" } }, "Country"),
                                                  createVNode("th", { style: { "min-width": "110px" } }, "Payment Terms"),
                                                  createVNode("th", { style: { "min-width": "100px" } }, "Lead (days)"),
                                                  createVNode("th", { style: { "min-width": "90px" } }, "Active"),
                                                  createVNode("th", { style: { "min-width": "56px" } })
                                                ])
                                              ]),
                                              createVNode("tbody", null, [
                                                (openBlock(true), createBlock(Fragment, null, renderList(unref(previewRows), (row, i) => {
                                                  return openBlock(), createBlock("tr", {
                                                    key: i,
                                                    class: rowInvalid(row) ? "bg-error-lighten-5" : ""
                                                  }, [
                                                    createVNode("td", { class: "text-caption text-disabled" }, toDisplayString(i + 1), 1),
                                                    createVNode("td", null, [
                                                      createVNode(VTextField, {
                                                        modelValue: row.supplier_code,
                                                        "onUpdate:modelValue": ($event) => row.supplier_code = $event,
                                                        variant: "outlined",
                                                        density: "compact",
                                                        "hide-details": "",
                                                        placeholder: "auto",
                                                        class: "preview-input"
                                                      }, null, 8, ["modelValue", "onUpdate:modelValue"])
                                                    ]),
                                                    createVNode("td", null, [
                                                      createVNode(VTextField, {
                                                        modelValue: row.name,
                                                        "onUpdate:modelValue": ($event) => row.name = $event,
                                                        variant: "outlined",
                                                        density: "compact",
                                                        "hide-details": "",
                                                        class: "preview-input"
                                                      }, null, 8, ["modelValue", "onUpdate:modelValue"])
                                                    ]),
                                                    createVNode("td", null, [
                                                      createVNode(VTextField, {
                                                        modelValue: row.contact_person,
                                                        "onUpdate:modelValue": ($event) => row.contact_person = $event,
                                                        variant: "outlined",
                                                        density: "compact",
                                                        "hide-details": "",
                                                        class: "preview-input"
                                                      }, null, 8, ["modelValue", "onUpdate:modelValue"])
                                                    ]),
                                                    createVNode("td", null, [
                                                      createVNode(VTextField, {
                                                        modelValue: row.email,
                                                        "onUpdate:modelValue": ($event) => row.email = $event,
                                                        variant: "outlined",
                                                        density: "compact",
                                                        "hide-details": "",
                                                        class: "preview-input"
                                                      }, null, 8, ["modelValue", "onUpdate:modelValue"])
                                                    ]),
                                                    createVNode("td", null, [
                                                      createVNode(VTextField, {
                                                        modelValue: row.phone,
                                                        "onUpdate:modelValue": ($event) => row.phone = $event,
                                                        variant: "outlined",
                                                        density: "compact",
                                                        "hide-details": "",
                                                        class: "preview-input"
                                                      }, null, 8, ["modelValue", "onUpdate:modelValue"])
                                                    ]),
                                                    createVNode("td", null, [
                                                      createVNode(VTextField, {
                                                        modelValue: row.city,
                                                        "onUpdate:modelValue": ($event) => row.city = $event,
                                                        variant: "outlined",
                                                        density: "compact",
                                                        "hide-details": "",
                                                        class: "preview-input"
                                                      }, null, 8, ["modelValue", "onUpdate:modelValue"])
                                                    ]),
                                                    createVNode("td", null, [
                                                      createVNode(VTextField, {
                                                        modelValue: row.country,
                                                        "onUpdate:modelValue": ($event) => row.country = $event,
                                                        variant: "outlined",
                                                        density: "compact",
                                                        "hide-details": "",
                                                        class: "preview-input"
                                                      }, null, 8, ["modelValue", "onUpdate:modelValue"])
                                                    ]),
                                                    createVNode("td", null, [
                                                      createVNode(VTextField, {
                                                        modelValue: row.payment_terms,
                                                        "onUpdate:modelValue": ($event) => row.payment_terms = $event,
                                                        variant: "outlined",
                                                        density: "compact",
                                                        "hide-details": "",
                                                        class: "preview-input"
                                                      }, null, 8, ["modelValue", "onUpdate:modelValue"])
                                                    ]),
                                                    createVNode("td", null, [
                                                      createVNode(VTextField, {
                                                        modelValue: row.lead_time_days,
                                                        "onUpdate:modelValue": ($event) => row.lead_time_days = $event,
                                                        type: "number",
                                                        step: "1",
                                                        variant: "outlined",
                                                        density: "compact",
                                                        "hide-details": "",
                                                        class: "preview-input"
                                                      }, null, 8, ["modelValue", "onUpdate:modelValue"])
                                                    ]),
                                                    createVNode("td", null, [
                                                      createVNode(VSwitch, {
                                                        modelValue: row.is_active,
                                                        "onUpdate:modelValue": ($event) => row.is_active = $event,
                                                        color: "success",
                                                        density: "compact",
                                                        "hide-details": "",
                                                        inset: ""
                                                      }, null, 8, ["modelValue", "onUpdate:modelValue"])
                                                    ]),
                                                    createVNode("td", null, [
                                                      createVNode(VBtn, {
                                                        icon: "mdi-delete",
                                                        size: "small",
                                                        variant: "text",
                                                        color: "error",
                                                        onClick: ($event) => removeRow(i)
                                                      }, null, 8, ["onClick"])
                                                    ])
                                                  ], 2);
                                                }), 128))
                                              ])
                                            ]),
                                            _: 1
                                          })
                                        ]),
                                        createVNode("div", { class: "d-flex align-center ga-3 mt-5 flex-wrap" }, [
                                          createVNode(VBtn, {
                                            color: "success",
                                            "prepend-icon": "mdi-content-save",
                                            loading: unref(saving),
                                            disabled: unref(saving) || unref(previewRows).length === 0,
                                            size: "large",
                                            onClick: saveBulk
                                          }, {
                                            default: withCtx(() => [
                                              createTextVNode(" Save " + toDisplayString(unref(previewRows).length) + " Supplier(s) ", 1)
                                            ]),
                                            _: 1
                                          }, 8, ["loading", "disabled"]),
                                          unref(emptyCodeCount) > 0 ? (openBlock(), createBlock("span", {
                                            key: 0,
                                            class: "text-body-2 text-medium-emphasis"
                                          }, toDisplayString(unref(emptyCodeCount)) + " row(s) will get auto-generated codes when saved ", 1)) : createCommentVNode("", true)
                                        ])
                                      ];
                                    }
                                  }),
                                  _: 1
                                }, _parent5, _scopeId4));
                              } else {
                                _push5(`<!---->`);
                              }
                            } else {
                              return [
                                unref(preview) ? (openBlock(), createBlock(VCard, {
                                  key: 0,
                                  rounded: "xl",
                                  flat: "",
                                  border: "",
                                  class: "pa-6 mb-6"
                                }, {
                                  default: withCtx(() => [
                                    createVNode("div", { class: "d-flex align-center ga-3 mb-5 flex-wrap" }, [
                                      createVNode(VAvatar, {
                                        color: "success-lighten-5",
                                        size: "36",
                                        rounded: "lg"
                                      }, {
                                        default: withCtx(() => [
                                          createVNode(VIcon, {
                                            color: "success",
                                            size: "20"
                                          }, {
                                            default: withCtx(() => [
                                              createTextVNode("mdi-numeric-3-circle")
                                            ]),
                                            _: 1
                                          })
                                        ]),
                                        _: 1
                                      }),
                                      createVNode("div", null, [
                                        createVNode("div", { class: "text-h6 font-weight-bold" }, "Preview & Edit Rows"),
                                        createVNode("div", { class: "text-body-2 text-medium-emphasis" }, toDisplayString(unref(previewRows).length) + " row(s) · " + toDisplayString(unref(preview).skipped) + " empty row(s) skipped · click any cell to edit ", 1)
                                      ]),
                                      createVNode(VSpacer),
                                      createVNode(VBtn, {
                                        variant: "text",
                                        size: "small",
                                        "prepend-icon": "mdi-plus",
                                        onClick: addRow,
                                        disabled: unref(saving)
                                      }, {
                                        default: withCtx(() => [
                                          createTextVNode("Add Row")
                                        ]),
                                        _: 1
                                      }, 8, ["disabled"]),
                                      createVNode(VBtn, {
                                        variant: "text",
                                        size: "small",
                                        color: "error",
                                        "prepend-icon": "mdi-close",
                                        onClick: cancelPreview,
                                        disabled: unref(saving)
                                      }, {
                                        default: withCtx(() => [
                                          createTextVNode("Cancel")
                                        ]),
                                        _: 1
                                      }, 8, ["disabled"])
                                    ]),
                                    unref(parseErrors).length > 0 ? (openBlock(), createBlock(VAlert, {
                                      key: 0,
                                      type: "warning",
                                      variant: "tonal",
                                      density: "compact",
                                      class: "mb-4",
                                      rounded: "lg"
                                    }, {
                                      default: withCtx(() => [
                                        createTextVNode(toDisplayString(unref(parseErrors).length) + " parse warning(s). Rows with issues are highlighted — fix or remove them before saving. ", 1)
                                      ]),
                                      _: 1
                                    })) : createCommentVNode("", true),
                                    createVNode("div", { class: "overflow-x-auto" }, [
                                      createVNode(VTable, {
                                        density: "compact",
                                        class: "preview-table"
                                      }, {
                                        default: withCtx(() => [
                                          createVNode("thead", { class: "bg-grey-lighten-4" }, [
                                            createVNode("tr", null, [
                                              createVNode("th", { style: { "min-width": "40px" } }, "#"),
                                              createVNode("th", { style: { "min-width": "130px" } }, "Code"),
                                              createVNode("th", { style: { "min-width": "180px" } }, "Name *"),
                                              createVNode("th", { style: { "min-width": "150px" } }, "Contact Person"),
                                              createVNode("th", { style: { "min-width": "180px" } }, "Email"),
                                              createVNode("th", { style: { "min-width": "130px" } }, "Phone"),
                                              createVNode("th", { style: { "min-width": "120px" } }, "City"),
                                              createVNode("th", { style: { "min-width": "120px" } }, "Country"),
                                              createVNode("th", { style: { "min-width": "110px" } }, "Payment Terms"),
                                              createVNode("th", { style: { "min-width": "100px" } }, "Lead (days)"),
                                              createVNode("th", { style: { "min-width": "90px" } }, "Active"),
                                              createVNode("th", { style: { "min-width": "56px" } })
                                            ])
                                          ]),
                                          createVNode("tbody", null, [
                                            (openBlock(true), createBlock(Fragment, null, renderList(unref(previewRows), (row, i) => {
                                              return openBlock(), createBlock("tr", {
                                                key: i,
                                                class: rowInvalid(row) ? "bg-error-lighten-5" : ""
                                              }, [
                                                createVNode("td", { class: "text-caption text-disabled" }, toDisplayString(i + 1), 1),
                                                createVNode("td", null, [
                                                  createVNode(VTextField, {
                                                    modelValue: row.supplier_code,
                                                    "onUpdate:modelValue": ($event) => row.supplier_code = $event,
                                                    variant: "outlined",
                                                    density: "compact",
                                                    "hide-details": "",
                                                    placeholder: "auto",
                                                    class: "preview-input"
                                                  }, null, 8, ["modelValue", "onUpdate:modelValue"])
                                                ]),
                                                createVNode("td", null, [
                                                  createVNode(VTextField, {
                                                    modelValue: row.name,
                                                    "onUpdate:modelValue": ($event) => row.name = $event,
                                                    variant: "outlined",
                                                    density: "compact",
                                                    "hide-details": "",
                                                    class: "preview-input"
                                                  }, null, 8, ["modelValue", "onUpdate:modelValue"])
                                                ]),
                                                createVNode("td", null, [
                                                  createVNode(VTextField, {
                                                    modelValue: row.contact_person,
                                                    "onUpdate:modelValue": ($event) => row.contact_person = $event,
                                                    variant: "outlined",
                                                    density: "compact",
                                                    "hide-details": "",
                                                    class: "preview-input"
                                                  }, null, 8, ["modelValue", "onUpdate:modelValue"])
                                                ]),
                                                createVNode("td", null, [
                                                  createVNode(VTextField, {
                                                    modelValue: row.email,
                                                    "onUpdate:modelValue": ($event) => row.email = $event,
                                                    variant: "outlined",
                                                    density: "compact",
                                                    "hide-details": "",
                                                    class: "preview-input"
                                                  }, null, 8, ["modelValue", "onUpdate:modelValue"])
                                                ]),
                                                createVNode("td", null, [
                                                  createVNode(VTextField, {
                                                    modelValue: row.phone,
                                                    "onUpdate:modelValue": ($event) => row.phone = $event,
                                                    variant: "outlined",
                                                    density: "compact",
                                                    "hide-details": "",
                                                    class: "preview-input"
                                                  }, null, 8, ["modelValue", "onUpdate:modelValue"])
                                                ]),
                                                createVNode("td", null, [
                                                  createVNode(VTextField, {
                                                    modelValue: row.city,
                                                    "onUpdate:modelValue": ($event) => row.city = $event,
                                                    variant: "outlined",
                                                    density: "compact",
                                                    "hide-details": "",
                                                    class: "preview-input"
                                                  }, null, 8, ["modelValue", "onUpdate:modelValue"])
                                                ]),
                                                createVNode("td", null, [
                                                  createVNode(VTextField, {
                                                    modelValue: row.country,
                                                    "onUpdate:modelValue": ($event) => row.country = $event,
                                                    variant: "outlined",
                                                    density: "compact",
                                                    "hide-details": "",
                                                    class: "preview-input"
                                                  }, null, 8, ["modelValue", "onUpdate:modelValue"])
                                                ]),
                                                createVNode("td", null, [
                                                  createVNode(VTextField, {
                                                    modelValue: row.payment_terms,
                                                    "onUpdate:modelValue": ($event) => row.payment_terms = $event,
                                                    variant: "outlined",
                                                    density: "compact",
                                                    "hide-details": "",
                                                    class: "preview-input"
                                                  }, null, 8, ["modelValue", "onUpdate:modelValue"])
                                                ]),
                                                createVNode("td", null, [
                                                  createVNode(VTextField, {
                                                    modelValue: row.lead_time_days,
                                                    "onUpdate:modelValue": ($event) => row.lead_time_days = $event,
                                                    type: "number",
                                                    step: "1",
                                                    variant: "outlined",
                                                    density: "compact",
                                                    "hide-details": "",
                                                    class: "preview-input"
                                                  }, null, 8, ["modelValue", "onUpdate:modelValue"])
                                                ]),
                                                createVNode("td", null, [
                                                  createVNode(VSwitch, {
                                                    modelValue: row.is_active,
                                                    "onUpdate:modelValue": ($event) => row.is_active = $event,
                                                    color: "success",
                                                    density: "compact",
                                                    "hide-details": "",
                                                    inset: ""
                                                  }, null, 8, ["modelValue", "onUpdate:modelValue"])
                                                ]),
                                                createVNode("td", null, [
                                                  createVNode(VBtn, {
                                                    icon: "mdi-delete",
                                                    size: "small",
                                                    variant: "text",
                                                    color: "error",
                                                    onClick: ($event) => removeRow(i)
                                                  }, null, 8, ["onClick"])
                                                ])
                                              ], 2);
                                            }), 128))
                                          ])
                                        ]),
                                        _: 1
                                      })
                                    ]),
                                    createVNode("div", { class: "d-flex align-center ga-3 mt-5 flex-wrap" }, [
                                      createVNode(VBtn, {
                                        color: "success",
                                        "prepend-icon": "mdi-content-save",
                                        loading: unref(saving),
                                        disabled: unref(saving) || unref(previewRows).length === 0,
                                        size: "large",
                                        onClick: saveBulk
                                      }, {
                                        default: withCtx(() => [
                                          createTextVNode(" Save " + toDisplayString(unref(previewRows).length) + " Supplier(s) ", 1)
                                        ]),
                                        _: 1
                                      }, 8, ["loading", "disabled"]),
                                      unref(emptyCodeCount) > 0 ? (openBlock(), createBlock("span", {
                                        key: 0,
                                        class: "text-body-2 text-medium-emphasis"
                                      }, toDisplayString(unref(emptyCodeCount)) + " row(s) will get auto-generated codes when saved ", 1)) : createCommentVNode("", true)
                                    ])
                                  ]),
                                  _: 1
                                })) : createCommentVNode("", true)
                              ];
                            }
                          }),
                          _: 1
                        }, _parent4, _scopeId3));
                        _push4(ssrRenderComponent(VSlideYTransition, null, {
                          default: withCtx((_4, _push5, _parent5, _scopeId4) => {
                            if (_push5) {
                              if (unref(importResult)) {
                                _push5(ssrRenderComponent(VCard, {
                                  rounded: "xl",
                                  flat: "",
                                  border: "",
                                  class: "pa-6",
                                  style: unref(resultBorderStyle)
                                }, {
                                  default: withCtx((_5, _push6, _parent6, _scopeId5) => {
                                    if (_push6) {
                                      _push6(`<div class="d-flex align-center ga-3 mb-5 flex-wrap" data-v-6f982028${_scopeId5}>`);
                                      _push6(ssrRenderComponent(VAvatar, {
                                        color: unref(importResult).failed > 0 ? "warning-lighten-5" : "success-lighten-5",
                                        size: "48",
                                        rounded: "lg"
                                      }, {
                                        default: withCtx((_6, _push7, _parent7, _scopeId6) => {
                                          if (_push7) {
                                            _push7(ssrRenderComponent(VIcon, {
                                              color: unref(importResult).failed > 0 ? "warning" : "success",
                                              size: "28"
                                            }, {
                                              default: withCtx((_7, _push8, _parent8, _scopeId7) => {
                                                if (_push8) {
                                                  _push8(`${ssrInterpolate(unref(importResult).failed > 0 ? "mdi-alert" : "mdi-check-circle")}`);
                                                } else {
                                                  return [
                                                    createTextVNode(toDisplayString(unref(importResult).failed > 0 ? "mdi-alert" : "mdi-check-circle"), 1)
                                                  ];
                                                }
                                              }),
                                              _: 1
                                            }, _parent7, _scopeId6));
                                          } else {
                                            return [
                                              createVNode(VIcon, {
                                                color: unref(importResult).failed > 0 ? "warning" : "success",
                                                size: "28"
                                              }, {
                                                default: withCtx(() => [
                                                  createTextVNode(toDisplayString(unref(importResult).failed > 0 ? "mdi-alert" : "mdi-check-circle"), 1)
                                                ]),
                                                _: 1
                                              }, 8, ["color"])
                                            ];
                                          }
                                        }),
                                        _: 1
                                      }, _parent6, _scopeId5));
                                      _push6(`<div data-v-6f982028${_scopeId5}><div class="text-h6 font-weight-bold" data-v-6f982028${_scopeId5}>${ssrInterpolate(unref(importResult).failed > 0 ? "Import Finished (with issues)" : "Import Successful")}</div><div class="text-body-2 text-medium-emphasis" data-v-6f982028${_scopeId5}>${ssrInterpolate(unref(importResult).total_processed)} row(s) processed</div></div>`);
                                      _push6(ssrRenderComponent(VSpacer, null, null, _parent6, _scopeId5));
                                      if (unref(importResult).failed === 0) {
                                        _push6(ssrRenderComponent(VBtn, {
                                          color: "success",
                                          "prepend-icon": "mdi-truck-outline",
                                          onClick: ($event) => ("navigateTo" in _ctx ? _ctx.navigateTo : unref(navigateTo))("/suppliers?imported=1")
                                        }, {
                                          default: withCtx((_6, _push7, _parent7, _scopeId6) => {
                                            if (_push7) {
                                              _push7(` View Suppliers `);
                                            } else {
                                              return [
                                                createTextVNode(" View Suppliers ")
                                              ];
                                            }
                                          }),
                                          _: 1
                                        }, _parent6, _scopeId5));
                                      } else {
                                        _push6(`<!---->`);
                                      }
                                      _push6(ssrRenderComponent(VBtn, {
                                        variant: "text",
                                        "prepend-icon": "mdi-refresh",
                                        onClick: resetAll
                                      }, {
                                        default: withCtx((_6, _push7, _parent7, _scopeId6) => {
                                          if (_push7) {
                                            _push7(`Start Over`);
                                          } else {
                                            return [
                                              createTextVNode("Start Over")
                                            ];
                                          }
                                        }),
                                        _: 1
                                      }, _parent6, _scopeId5));
                                      _push6(`</div>`);
                                      _push6(ssrRenderComponent(VRow, {
                                        dense: "",
                                        class: "mb-5"
                                      }, {
                                        default: withCtx((_6, _push7, _parent7, _scopeId6) => {
                                          if (_push7) {
                                            _push7(ssrRenderComponent(VCol, {
                                              cols: "6",
                                              sm: "3"
                                            }, {
                                              default: withCtx((_7, _push8, _parent8, _scopeId7) => {
                                                if (_push8) {
                                                  _push8(ssrRenderComponent(VCard, {
                                                    variant: "outlined",
                                                    rounded: "lg",
                                                    class: "pa-4 text-center",
                                                    flat: ""
                                                  }, {
                                                    default: withCtx((_8, _push9, _parent9, _scopeId8) => {
                                                      if (_push9) {
                                                        _push9(`<div class="text-caption text-medium-emphasis text-uppercase" data-v-6f982028${_scopeId8}>Created</div><div class="text-h4 font-weight-bold text-success mt-1" data-v-6f982028${_scopeId8}>${ssrInterpolate(unref(importResult).created)}</div>`);
                                                      } else {
                                                        return [
                                                          createVNode("div", { class: "text-caption text-medium-emphasis text-uppercase" }, "Created"),
                                                          createVNode("div", { class: "text-h4 font-weight-bold text-success mt-1" }, toDisplayString(unref(importResult).created), 1)
                                                        ];
                                                      }
                                                    }),
                                                    _: 1
                                                  }, _parent8, _scopeId7));
                                                } else {
                                                  return [
                                                    createVNode(VCard, {
                                                      variant: "outlined",
                                                      rounded: "lg",
                                                      class: "pa-4 text-center",
                                                      flat: ""
                                                    }, {
                                                      default: withCtx(() => [
                                                        createVNode("div", { class: "text-caption text-medium-emphasis text-uppercase" }, "Created"),
                                                        createVNode("div", { class: "text-h4 font-weight-bold text-success mt-1" }, toDisplayString(unref(importResult).created), 1)
                                                      ]),
                                                      _: 1
                                                    })
                                                  ];
                                                }
                                              }),
                                              _: 1
                                            }, _parent7, _scopeId6));
                                            _push7(ssrRenderComponent(VCol, {
                                              cols: "6",
                                              sm: "3"
                                            }, {
                                              default: withCtx((_7, _push8, _parent8, _scopeId7) => {
                                                if (_push8) {
                                                  _push8(ssrRenderComponent(VCard, {
                                                    variant: "outlined",
                                                    rounded: "lg",
                                                    class: "pa-4 text-center",
                                                    flat: ""
                                                  }, {
                                                    default: withCtx((_8, _push9, _parent9, _scopeId8) => {
                                                      if (_push9) {
                                                        _push9(`<div class="text-caption text-medium-emphasis text-uppercase" data-v-6f982028${_scopeId8}>Updated</div><div class="text-h4 font-weight-bold text-primary mt-1" data-v-6f982028${_scopeId8}>${ssrInterpolate(unref(importResult).updated)}</div>`);
                                                      } else {
                                                        return [
                                                          createVNode("div", { class: "text-caption text-medium-emphasis text-uppercase" }, "Updated"),
                                                          createVNode("div", { class: "text-h4 font-weight-bold text-primary mt-1" }, toDisplayString(unref(importResult).updated), 1)
                                                        ];
                                                      }
                                                    }),
                                                    _: 1
                                                  }, _parent8, _scopeId7));
                                                } else {
                                                  return [
                                                    createVNode(VCard, {
                                                      variant: "outlined",
                                                      rounded: "lg",
                                                      class: "pa-4 text-center",
                                                      flat: ""
                                                    }, {
                                                      default: withCtx(() => [
                                                        createVNode("div", { class: "text-caption text-medium-emphasis text-uppercase" }, "Updated"),
                                                        createVNode("div", { class: "text-h4 font-weight-bold text-primary mt-1" }, toDisplayString(unref(importResult).updated), 1)
                                                      ]),
                                                      _: 1
                                                    })
                                                  ];
                                                }
                                              }),
                                              _: 1
                                            }, _parent7, _scopeId6));
                                            _push7(ssrRenderComponent(VCol, {
                                              cols: "6",
                                              sm: "3"
                                            }, {
                                              default: withCtx((_7, _push8, _parent8, _scopeId7) => {
                                                if (_push8) {
                                                  _push8(ssrRenderComponent(VCard, {
                                                    variant: "outlined",
                                                    rounded: "lg",
                                                    class: "pa-4 text-center",
                                                    flat: ""
                                                  }, {
                                                    default: withCtx((_8, _push9, _parent9, _scopeId8) => {
                                                      if (_push9) {
                                                        _push9(`<div class="text-caption text-medium-emphasis text-uppercase" data-v-6f982028${_scopeId8}>Failed</div><div class="${ssrRenderClass([unref(importResult).failed > 0 ? "text-error" : "text-disabled", "text-h4 font-weight-bold mt-1"])}" data-v-6f982028${_scopeId8}>${ssrInterpolate(unref(importResult).failed)}</div>`);
                                                      } else {
                                                        return [
                                                          createVNode("div", { class: "text-caption text-medium-emphasis text-uppercase" }, "Failed"),
                                                          createVNode("div", {
                                                            class: ["text-h4 font-weight-bold mt-1", unref(importResult).failed > 0 ? "text-error" : "text-disabled"]
                                                          }, toDisplayString(unref(importResult).failed), 3)
                                                        ];
                                                      }
                                                    }),
                                                    _: 1
                                                  }, _parent8, _scopeId7));
                                                } else {
                                                  return [
                                                    createVNode(VCard, {
                                                      variant: "outlined",
                                                      rounded: "lg",
                                                      class: "pa-4 text-center",
                                                      flat: ""
                                                    }, {
                                                      default: withCtx(() => [
                                                        createVNode("div", { class: "text-caption text-medium-emphasis text-uppercase" }, "Failed"),
                                                        createVNode("div", {
                                                          class: ["text-h4 font-weight-bold mt-1", unref(importResult).failed > 0 ? "text-error" : "text-disabled"]
                                                        }, toDisplayString(unref(importResult).failed), 3)
                                                      ]),
                                                      _: 1
                                                    })
                                                  ];
                                                }
                                              }),
                                              _: 1
                                            }, _parent7, _scopeId6));
                                            _push7(ssrRenderComponent(VCol, {
                                              cols: "6",
                                              sm: "3"
                                            }, {
                                              default: withCtx((_7, _push8, _parent8, _scopeId7) => {
                                                if (_push8) {
                                                  _push8(ssrRenderComponent(VCard, {
                                                    variant: "outlined",
                                                    rounded: "lg",
                                                    class: "pa-4 text-center",
                                                    flat: ""
                                                  }, {
                                                    default: withCtx((_8, _push9, _parent9, _scopeId8) => {
                                                      if (_push9) {
                                                        _push9(`<div class="text-caption text-medium-emphasis text-uppercase" data-v-6f982028${_scopeId8}>Processed</div><div class="text-h4 font-weight-bold mt-1" data-v-6f982028${_scopeId8}>${ssrInterpolate(unref(importResult).total_processed)}</div>`);
                                                      } else {
                                                        return [
                                                          createVNode("div", { class: "text-caption text-medium-emphasis text-uppercase" }, "Processed"),
                                                          createVNode("div", { class: "text-h4 font-weight-bold mt-1" }, toDisplayString(unref(importResult).total_processed), 1)
                                                        ];
                                                      }
                                                    }),
                                                    _: 1
                                                  }, _parent8, _scopeId7));
                                                } else {
                                                  return [
                                                    createVNode(VCard, {
                                                      variant: "outlined",
                                                      rounded: "lg",
                                                      class: "pa-4 text-center",
                                                      flat: ""
                                                    }, {
                                                      default: withCtx(() => [
                                                        createVNode("div", { class: "text-caption text-medium-emphasis text-uppercase" }, "Processed"),
                                                        createVNode("div", { class: "text-h4 font-weight-bold mt-1" }, toDisplayString(unref(importResult).total_processed), 1)
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
                                              createVNode(VCol, {
                                                cols: "6",
                                                sm: "3"
                                              }, {
                                                default: withCtx(() => [
                                                  createVNode(VCard, {
                                                    variant: "outlined",
                                                    rounded: "lg",
                                                    class: "pa-4 text-center",
                                                    flat: ""
                                                  }, {
                                                    default: withCtx(() => [
                                                      createVNode("div", { class: "text-caption text-medium-emphasis text-uppercase" }, "Created"),
                                                      createVNode("div", { class: "text-h4 font-weight-bold text-success mt-1" }, toDisplayString(unref(importResult).created), 1)
                                                    ]),
                                                    _: 1
                                                  })
                                                ]),
                                                _: 1
                                              }),
                                              createVNode(VCol, {
                                                cols: "6",
                                                sm: "3"
                                              }, {
                                                default: withCtx(() => [
                                                  createVNode(VCard, {
                                                    variant: "outlined",
                                                    rounded: "lg",
                                                    class: "pa-4 text-center",
                                                    flat: ""
                                                  }, {
                                                    default: withCtx(() => [
                                                      createVNode("div", { class: "text-caption text-medium-emphasis text-uppercase" }, "Updated"),
                                                      createVNode("div", { class: "text-h4 font-weight-bold text-primary mt-1" }, toDisplayString(unref(importResult).updated), 1)
                                                    ]),
                                                    _: 1
                                                  })
                                                ]),
                                                _: 1
                                              }),
                                              createVNode(VCol, {
                                                cols: "6",
                                                sm: "3"
                                              }, {
                                                default: withCtx(() => [
                                                  createVNode(VCard, {
                                                    variant: "outlined",
                                                    rounded: "lg",
                                                    class: "pa-4 text-center",
                                                    flat: ""
                                                  }, {
                                                    default: withCtx(() => [
                                                      createVNode("div", { class: "text-caption text-medium-emphasis text-uppercase" }, "Failed"),
                                                      createVNode("div", {
                                                        class: ["text-h4 font-weight-bold mt-1", unref(importResult).failed > 0 ? "text-error" : "text-disabled"]
                                                      }, toDisplayString(unref(importResult).failed), 3)
                                                    ]),
                                                    _: 1
                                                  })
                                                ]),
                                                _: 1
                                              }),
                                              createVNode(VCol, {
                                                cols: "6",
                                                sm: "3"
                                              }, {
                                                default: withCtx(() => [
                                                  createVNode(VCard, {
                                                    variant: "outlined",
                                                    rounded: "lg",
                                                    class: "pa-4 text-center",
                                                    flat: ""
                                                  }, {
                                                    default: withCtx(() => [
                                                      createVNode("div", { class: "text-caption text-medium-emphasis text-uppercase" }, "Processed"),
                                                      createVNode("div", { class: "text-h4 font-weight-bold mt-1" }, toDisplayString(unref(importResult).total_processed), 1)
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
                                      if (unref(importResult).errors && unref(importResult).errors.length > 0) {
                                        _push6(`<div data-v-6f982028${_scopeId5}><div class="d-flex align-center ga-2 mb-3" data-v-6f982028${_scopeId5}>`);
                                        _push6(ssrRenderComponent(VIcon, {
                                          size: "18",
                                          color: "error"
                                        }, {
                                          default: withCtx((_6, _push7, _parent7, _scopeId6) => {
                                            if (_push7) {
                                              _push7(`mdi-alert-circle-outline`);
                                            } else {
                                              return [
                                                createTextVNode("mdi-alert-circle-outline")
                                              ];
                                            }
                                          }),
                                          _: 1
                                        }, _parent6, _scopeId5));
                                        _push6(`<span class="text-body-1 font-weight-bold" data-v-6f982028${_scopeId5}>Errors (${ssrInterpolate(unref(importResult).errors.length)}${ssrInterpolate(unref(importResult).errors_truncated ? "+" : "")})</span></div>`);
                                        _push6(ssrRenderComponent(VList, {
                                          variant: "outlined",
                                          rounded: "lg",
                                          density: "compact",
                                          class: "bg-surface",
                                          "max-height": "320",
                                          lines: "two"
                                        }, {
                                          default: withCtx((_6, _push7, _parent7, _scopeId6) => {
                                            if (_push7) {
                                              _push7(`<!--[-->`);
                                              ssrRenderList(unref(importResult).errors, (err, idx) => {
                                                _push7(ssrRenderComponent(VListItem, { key: idx }, {
                                                  prepend: withCtx((_7, _push8, _parent8, _scopeId7) => {
                                                    if (_push8) {
                                                      _push8(ssrRenderComponent(VAvatar, {
                                                        color: "error-lighten-5",
                                                        size: "32",
                                                        rounded: "lg"
                                                      }, {
                                                        default: withCtx((_8, _push9, _parent9, _scopeId8) => {
                                                          if (_push9) {
                                                            _push9(`<span class="text-caption font-weight-bold text-error" data-v-6f982028${_scopeId8}>#${ssrInterpolate(err.row)}</span>`);
                                                          } else {
                                                            return [
                                                              createVNode("span", { class: "text-caption font-weight-bold text-error" }, "#" + toDisplayString(err.row), 1)
                                                            ];
                                                          }
                                                        }),
                                                        _: 2
                                                      }, _parent8, _scopeId7));
                                                    } else {
                                                      return [
                                                        createVNode(VAvatar, {
                                                          color: "error-lighten-5",
                                                          size: "32",
                                                          rounded: "lg"
                                                        }, {
                                                          default: withCtx(() => [
                                                            createVNode("span", { class: "text-caption font-weight-bold text-error" }, "#" + toDisplayString(err.row), 1)
                                                          ]),
                                                          _: 2
                                                        }, 1024)
                                                      ];
                                                    }
                                                  }),
                                                  default: withCtx((_7, _push8, _parent8, _scopeId7) => {
                                                    if (_push8) {
                                                      _push8(ssrRenderComponent(VListItemSubtitle, { class: "text-body-2 text-error" }, {
                                                        default: withCtx((_8, _push9, _parent9, _scopeId8) => {
                                                          if (_push9) {
                                                            _push9(`${ssrInterpolate(err.detail)}`);
                                                          } else {
                                                            return [
                                                              createTextVNode(toDisplayString(err.detail), 1)
                                                            ];
                                                          }
                                                        }),
                                                        _: 2
                                                      }, _parent8, _scopeId7));
                                                    } else {
                                                      return [
                                                        createVNode(VListItemSubtitle, { class: "text-body-2 text-error" }, {
                                                          default: withCtx(() => [
                                                            createTextVNode(toDisplayString(err.detail), 1)
                                                          ]),
                                                          _: 2
                                                        }, 1024)
                                                      ];
                                                    }
                                                  }),
                                                  _: 2
                                                }, _parent7, _scopeId6));
                                              });
                                              _push7(`<!--]-->`);
                                            } else {
                                              return [
                                                (openBlock(true), createBlock(Fragment, null, renderList(unref(importResult).errors, (err, idx) => {
                                                  return openBlock(), createBlock(VListItem, { key: idx }, {
                                                    prepend: withCtx(() => [
                                                      createVNode(VAvatar, {
                                                        color: "error-lighten-5",
                                                        size: "32",
                                                        rounded: "lg"
                                                      }, {
                                                        default: withCtx(() => [
                                                          createVNode("span", { class: "text-caption font-weight-bold text-error" }, "#" + toDisplayString(err.row), 1)
                                                        ]),
                                                        _: 2
                                                      }, 1024)
                                                    ]),
                                                    default: withCtx(() => [
                                                      createVNode(VListItemSubtitle, { class: "text-body-2 text-error" }, {
                                                        default: withCtx(() => [
                                                          createTextVNode(toDisplayString(err.detail), 1)
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
                                        }, _parent6, _scopeId5));
                                        _push6(`</div>`);
                                      } else {
                                        _push6(`<!---->`);
                                      }
                                    } else {
                                      return [
                                        createVNode("div", { class: "d-flex align-center ga-3 mb-5 flex-wrap" }, [
                                          createVNode(VAvatar, {
                                            color: unref(importResult).failed > 0 ? "warning-lighten-5" : "success-lighten-5",
                                            size: "48",
                                            rounded: "lg"
                                          }, {
                                            default: withCtx(() => [
                                              createVNode(VIcon, {
                                                color: unref(importResult).failed > 0 ? "warning" : "success",
                                                size: "28"
                                              }, {
                                                default: withCtx(() => [
                                                  createTextVNode(toDisplayString(unref(importResult).failed > 0 ? "mdi-alert" : "mdi-check-circle"), 1)
                                                ]),
                                                _: 1
                                              }, 8, ["color"])
                                            ]),
                                            _: 1
                                          }, 8, ["color"]),
                                          createVNode("div", null, [
                                            createVNode("div", { class: "text-h6 font-weight-bold" }, toDisplayString(unref(importResult).failed > 0 ? "Import Finished (with issues)" : "Import Successful"), 1),
                                            createVNode("div", { class: "text-body-2 text-medium-emphasis" }, toDisplayString(unref(importResult).total_processed) + " row(s) processed", 1)
                                          ]),
                                          createVNode(VSpacer),
                                          unref(importResult).failed === 0 ? (openBlock(), createBlock(VBtn, {
                                            key: 0,
                                            color: "success",
                                            "prepend-icon": "mdi-truck-outline",
                                            onClick: ($event) => ("navigateTo" in _ctx ? _ctx.navigateTo : unref(navigateTo))("/suppliers?imported=1")
                                          }, {
                                            default: withCtx(() => [
                                              createTextVNode(" View Suppliers ")
                                            ]),
                                            _: 1
                                          }, 8, ["onClick"])) : createCommentVNode("", true),
                                          createVNode(VBtn, {
                                            variant: "text",
                                            "prepend-icon": "mdi-refresh",
                                            onClick: resetAll
                                          }, {
                                            default: withCtx(() => [
                                              createTextVNode("Start Over")
                                            ]),
                                            _: 1
                                          })
                                        ]),
                                        createVNode(VRow, {
                                          dense: "",
                                          class: "mb-5"
                                        }, {
                                          default: withCtx(() => [
                                            createVNode(VCol, {
                                              cols: "6",
                                              sm: "3"
                                            }, {
                                              default: withCtx(() => [
                                                createVNode(VCard, {
                                                  variant: "outlined",
                                                  rounded: "lg",
                                                  class: "pa-4 text-center",
                                                  flat: ""
                                                }, {
                                                  default: withCtx(() => [
                                                    createVNode("div", { class: "text-caption text-medium-emphasis text-uppercase" }, "Created"),
                                                    createVNode("div", { class: "text-h4 font-weight-bold text-success mt-1" }, toDisplayString(unref(importResult).created), 1)
                                                  ]),
                                                  _: 1
                                                })
                                              ]),
                                              _: 1
                                            }),
                                            createVNode(VCol, {
                                              cols: "6",
                                              sm: "3"
                                            }, {
                                              default: withCtx(() => [
                                                createVNode(VCard, {
                                                  variant: "outlined",
                                                  rounded: "lg",
                                                  class: "pa-4 text-center",
                                                  flat: ""
                                                }, {
                                                  default: withCtx(() => [
                                                    createVNode("div", { class: "text-caption text-medium-emphasis text-uppercase" }, "Updated"),
                                                    createVNode("div", { class: "text-h4 font-weight-bold text-primary mt-1" }, toDisplayString(unref(importResult).updated), 1)
                                                  ]),
                                                  _: 1
                                                })
                                              ]),
                                              _: 1
                                            }),
                                            createVNode(VCol, {
                                              cols: "6",
                                              sm: "3"
                                            }, {
                                              default: withCtx(() => [
                                                createVNode(VCard, {
                                                  variant: "outlined",
                                                  rounded: "lg",
                                                  class: "pa-4 text-center",
                                                  flat: ""
                                                }, {
                                                  default: withCtx(() => [
                                                    createVNode("div", { class: "text-caption text-medium-emphasis text-uppercase" }, "Failed"),
                                                    createVNode("div", {
                                                      class: ["text-h4 font-weight-bold mt-1", unref(importResult).failed > 0 ? "text-error" : "text-disabled"]
                                                    }, toDisplayString(unref(importResult).failed), 3)
                                                  ]),
                                                  _: 1
                                                })
                                              ]),
                                              _: 1
                                            }),
                                            createVNode(VCol, {
                                              cols: "6",
                                              sm: "3"
                                            }, {
                                              default: withCtx(() => [
                                                createVNode(VCard, {
                                                  variant: "outlined",
                                                  rounded: "lg",
                                                  class: "pa-4 text-center",
                                                  flat: ""
                                                }, {
                                                  default: withCtx(() => [
                                                    createVNode("div", { class: "text-caption text-medium-emphasis text-uppercase" }, "Processed"),
                                                    createVNode("div", { class: "text-h4 font-weight-bold mt-1" }, toDisplayString(unref(importResult).total_processed), 1)
                                                  ]),
                                                  _: 1
                                                })
                                              ]),
                                              _: 1
                                            })
                                          ]),
                                          _: 1
                                        }),
                                        unref(importResult).errors && unref(importResult).errors.length > 0 ? (openBlock(), createBlock("div", { key: 0 }, [
                                          createVNode("div", { class: "d-flex align-center ga-2 mb-3" }, [
                                            createVNode(VIcon, {
                                              size: "18",
                                              color: "error"
                                            }, {
                                              default: withCtx(() => [
                                                createTextVNode("mdi-alert-circle-outline")
                                              ]),
                                              _: 1
                                            }),
                                            createVNode("span", { class: "text-body-1 font-weight-bold" }, "Errors (" + toDisplayString(unref(importResult).errors.length) + toDisplayString(unref(importResult).errors_truncated ? "+" : "") + ")", 1)
                                          ]),
                                          createVNode(VList, {
                                            variant: "outlined",
                                            rounded: "lg",
                                            density: "compact",
                                            class: "bg-surface",
                                            "max-height": "320",
                                            lines: "two"
                                          }, {
                                            default: withCtx(() => [
                                              (openBlock(true), createBlock(Fragment, null, renderList(unref(importResult).errors, (err, idx) => {
                                                return openBlock(), createBlock(VListItem, { key: idx }, {
                                                  prepend: withCtx(() => [
                                                    createVNode(VAvatar, {
                                                      color: "error-lighten-5",
                                                      size: "32",
                                                      rounded: "lg"
                                                    }, {
                                                      default: withCtx(() => [
                                                        createVNode("span", { class: "text-caption font-weight-bold text-error" }, "#" + toDisplayString(err.row), 1)
                                                      ]),
                                                      _: 2
                                                    }, 1024)
                                                  ]),
                                                  default: withCtx(() => [
                                                    createVNode(VListItemSubtitle, { class: "text-body-2 text-error" }, {
                                                      default: withCtx(() => [
                                                        createTextVNode(toDisplayString(err.detail), 1)
                                                      ]),
                                                      _: 2
                                                    }, 1024)
                                                  ]),
                                                  _: 2
                                                }, 1024);
                                              }), 128))
                                            ]),
                                            _: 1
                                          })
                                        ])) : createCommentVNode("", true)
                                      ];
                                    }
                                  }),
                                  _: 1
                                }, _parent5, _scopeId4));
                              } else {
                                _push5(`<!---->`);
                              }
                            } else {
                              return [
                                unref(importResult) ? (openBlock(), createBlock(VCard, {
                                  key: 0,
                                  rounded: "xl",
                                  flat: "",
                                  border: "",
                                  class: "pa-6",
                                  style: unref(resultBorderStyle)
                                }, {
                                  default: withCtx(() => [
                                    createVNode("div", { class: "d-flex align-center ga-3 mb-5 flex-wrap" }, [
                                      createVNode(VAvatar, {
                                        color: unref(importResult).failed > 0 ? "warning-lighten-5" : "success-lighten-5",
                                        size: "48",
                                        rounded: "lg"
                                      }, {
                                        default: withCtx(() => [
                                          createVNode(VIcon, {
                                            color: unref(importResult).failed > 0 ? "warning" : "success",
                                            size: "28"
                                          }, {
                                            default: withCtx(() => [
                                              createTextVNode(toDisplayString(unref(importResult).failed > 0 ? "mdi-alert" : "mdi-check-circle"), 1)
                                            ]),
                                            _: 1
                                          }, 8, ["color"])
                                        ]),
                                        _: 1
                                      }, 8, ["color"]),
                                      createVNode("div", null, [
                                        createVNode("div", { class: "text-h6 font-weight-bold" }, toDisplayString(unref(importResult).failed > 0 ? "Import Finished (with issues)" : "Import Successful"), 1),
                                        createVNode("div", { class: "text-body-2 text-medium-emphasis" }, toDisplayString(unref(importResult).total_processed) + " row(s) processed", 1)
                                      ]),
                                      createVNode(VSpacer),
                                      unref(importResult).failed === 0 ? (openBlock(), createBlock(VBtn, {
                                        key: 0,
                                        color: "success",
                                        "prepend-icon": "mdi-truck-outline",
                                        onClick: ($event) => ("navigateTo" in _ctx ? _ctx.navigateTo : unref(navigateTo))("/suppliers?imported=1")
                                      }, {
                                        default: withCtx(() => [
                                          createTextVNode(" View Suppliers ")
                                        ]),
                                        _: 1
                                      }, 8, ["onClick"])) : createCommentVNode("", true),
                                      createVNode(VBtn, {
                                        variant: "text",
                                        "prepend-icon": "mdi-refresh",
                                        onClick: resetAll
                                      }, {
                                        default: withCtx(() => [
                                          createTextVNode("Start Over")
                                        ]),
                                        _: 1
                                      })
                                    ]),
                                    createVNode(VRow, {
                                      dense: "",
                                      class: "mb-5"
                                    }, {
                                      default: withCtx(() => [
                                        createVNode(VCol, {
                                          cols: "6",
                                          sm: "3"
                                        }, {
                                          default: withCtx(() => [
                                            createVNode(VCard, {
                                              variant: "outlined",
                                              rounded: "lg",
                                              class: "pa-4 text-center",
                                              flat: ""
                                            }, {
                                              default: withCtx(() => [
                                                createVNode("div", { class: "text-caption text-medium-emphasis text-uppercase" }, "Created"),
                                                createVNode("div", { class: "text-h4 font-weight-bold text-success mt-1" }, toDisplayString(unref(importResult).created), 1)
                                              ]),
                                              _: 1
                                            })
                                          ]),
                                          _: 1
                                        }),
                                        createVNode(VCol, {
                                          cols: "6",
                                          sm: "3"
                                        }, {
                                          default: withCtx(() => [
                                            createVNode(VCard, {
                                              variant: "outlined",
                                              rounded: "lg",
                                              class: "pa-4 text-center",
                                              flat: ""
                                            }, {
                                              default: withCtx(() => [
                                                createVNode("div", { class: "text-caption text-medium-emphasis text-uppercase" }, "Updated"),
                                                createVNode("div", { class: "text-h4 font-weight-bold text-primary mt-1" }, toDisplayString(unref(importResult).updated), 1)
                                              ]),
                                              _: 1
                                            })
                                          ]),
                                          _: 1
                                        }),
                                        createVNode(VCol, {
                                          cols: "6",
                                          sm: "3"
                                        }, {
                                          default: withCtx(() => [
                                            createVNode(VCard, {
                                              variant: "outlined",
                                              rounded: "lg",
                                              class: "pa-4 text-center",
                                              flat: ""
                                            }, {
                                              default: withCtx(() => [
                                                createVNode("div", { class: "text-caption text-medium-emphasis text-uppercase" }, "Failed"),
                                                createVNode("div", {
                                                  class: ["text-h4 font-weight-bold mt-1", unref(importResult).failed > 0 ? "text-error" : "text-disabled"]
                                                }, toDisplayString(unref(importResult).failed), 3)
                                              ]),
                                              _: 1
                                            })
                                          ]),
                                          _: 1
                                        }),
                                        createVNode(VCol, {
                                          cols: "6",
                                          sm: "3"
                                        }, {
                                          default: withCtx(() => [
                                            createVNode(VCard, {
                                              variant: "outlined",
                                              rounded: "lg",
                                              class: "pa-4 text-center",
                                              flat: ""
                                            }, {
                                              default: withCtx(() => [
                                                createVNode("div", { class: "text-caption text-medium-emphasis text-uppercase" }, "Processed"),
                                                createVNode("div", { class: "text-h4 font-weight-bold mt-1" }, toDisplayString(unref(importResult).total_processed), 1)
                                              ]),
                                              _: 1
                                            })
                                          ]),
                                          _: 1
                                        })
                                      ]),
                                      _: 1
                                    }),
                                    unref(importResult).errors && unref(importResult).errors.length > 0 ? (openBlock(), createBlock("div", { key: 0 }, [
                                      createVNode("div", { class: "d-flex align-center ga-2 mb-3" }, [
                                        createVNode(VIcon, {
                                          size: "18",
                                          color: "error"
                                        }, {
                                          default: withCtx(() => [
                                            createTextVNode("mdi-alert-circle-outline")
                                          ]),
                                          _: 1
                                        }),
                                        createVNode("span", { class: "text-body-1 font-weight-bold" }, "Errors (" + toDisplayString(unref(importResult).errors.length) + toDisplayString(unref(importResult).errors_truncated ? "+" : "") + ")", 1)
                                      ]),
                                      createVNode(VList, {
                                        variant: "outlined",
                                        rounded: "lg",
                                        density: "compact",
                                        class: "bg-surface",
                                        "max-height": "320",
                                        lines: "two"
                                      }, {
                                        default: withCtx(() => [
                                          (openBlock(true), createBlock(Fragment, null, renderList(unref(importResult).errors, (err, idx) => {
                                            return openBlock(), createBlock(VListItem, { key: idx }, {
                                              prepend: withCtx(() => [
                                                createVNode(VAvatar, {
                                                  color: "error-lighten-5",
                                                  size: "32",
                                                  rounded: "lg"
                                                }, {
                                                  default: withCtx(() => [
                                                    createVNode("span", { class: "text-caption font-weight-bold text-error" }, "#" + toDisplayString(err.row), 1)
                                                  ]),
                                                  _: 2
                                                }, 1024)
                                              ]),
                                              default: withCtx(() => [
                                                createVNode(VListItemSubtitle, { class: "text-body-2 text-error" }, {
                                                  default: withCtx(() => [
                                                    createTextVNode(toDisplayString(err.detail), 1)
                                                  ]),
                                                  _: 2
                                                }, 1024)
                                              ]),
                                              _: 2
                                            }, 1024);
                                          }), 128))
                                        ]),
                                        _: 1
                                      })
                                    ])) : createCommentVNode("", true)
                                  ]),
                                  _: 1
                                }, 8, ["style"])) : createCommentVNode("", true)
                              ];
                            }
                          }),
                          _: 1
                        }, _parent4, _scopeId3));
                      } else {
                        return [
                          createVNode(VCard, {
                            rounded: "xl",
                            flat: "",
                            border: "",
                            class: "pa-6 mb-6"
                          }, {
                            default: withCtx(() => [
                              createVNode("div", { class: "d-flex align-center ga-3 mb-4 flex-wrap" }, [
                                createVNode(VAvatar, {
                                  color: "primary-lighten-5",
                                  size: "36",
                                  rounded: "lg"
                                }, {
                                  default: withCtx(() => [
                                    createVNode(VIcon, {
                                      color: "primary",
                                      size: "20"
                                    }, {
                                      default: withCtx(() => [
                                        createTextVNode("mdi-numeric-1-circle")
                                      ]),
                                      _: 1
                                    })
                                  ]),
                                  _: 1
                                }),
                                createVNode("div", null, [
                                  createVNode("div", { class: "text-h6 font-weight-bold" }, "Download the Template"),
                                  createVNode("div", { class: "text-body-2 text-medium-emphasis" }, " Pre-fill the workbook so column headers are recognized correctly ")
                                ]),
                                createVNode(VSpacer),
                                createVNode(VBtn, {
                                  color: "primary",
                                  variant: "outlined",
                                  "prepend-icon": "mdi-download",
                                  onClick: downloadTemplate,
                                  loading: unref(downloadingTemplate),
                                  size: "large"
                                }, {
                                  default: withCtx(() => [
                                    createTextVNode(" Download Template (.xlsx) ")
                                  ]),
                                  _: 1
                                }, 8, ["loading"])
                              ]),
                              createVNode(VAlert, {
                                type: "info",
                                variant: "tonal",
                                density: "compact",
                                rounded: "lg"
                              }, {
                                default: withCtx(() => [
                                  createTextVNode(" Each row maps to one supplier. "),
                                  createVNode("strong", null, "Supplier Code is optional"),
                                  createTextVNode(" — blank codes are auto-generated. Existing codes are updated. ")
                                ]),
                                _: 1
                              })
                            ]),
                            _: 1
                          }),
                          createVNode(VCard, {
                            rounded: "xl",
                            flat: "",
                            border: "",
                            class: "pa-6 mb-6"
                          }, {
                            default: withCtx(() => [
                              createVNode("div", { class: "d-flex align-center ga-3 mb-5 flex-wrap" }, [
                                createVNode(VAvatar, {
                                  color: "primary-lighten-5",
                                  size: "36",
                                  rounded: "lg"
                                }, {
                                  default: withCtx(() => [
                                    createVNode(VIcon, {
                                      color: "primary",
                                      size: "20"
                                    }, {
                                      default: withCtx(() => [
                                        createTextVNode("mdi-numeric-2-circle")
                                      ]),
                                      _: 1
                                    })
                                  ]),
                                  _: 1
                                }),
                                createVNode("div", null, [
                                  createVNode("div", { class: "text-h6 font-weight-bold" }, "Upload & Preview"),
                                  createVNode("div", { class: "text-body-2 text-medium-emphasis" }, " Drag & drop your completed workbook — review & edit rows before saving ")
                                ])
                              ]),
                              createVNode("div", {
                                class: ["upload-zone d-flex flex-column align-center justify-center ga-4 pa-10 mb-5 cursor-pointer", { "upload-zone-active": unref(isDragging), "upload-zone-has-file": unref(selectedFile) }],
                                onClick: openFileDialog,
                                onDragover: withModifiers(($event) => isDragging.value = true, ["prevent"]),
                                onDragenter: withModifiers(($event) => isDragging.value = true, ["prevent"]),
                                onDragleave: withModifiers(($event) => isDragging.value = false, ["prevent"]),
                                onDrop: withModifiers(onDrop, ["prevent"])
                              }, [
                                createVNode("input", {
                                  ref_key: "fileInput",
                                  ref: fileInput,
                                  type: "file",
                                  accept: ".xlsx,.xlsm",
                                  hidden: "",
                                  onChange: onFileSelected
                                }, null, 544),
                                createVNode(VAvatar, {
                                  color: unref(selectedFile) ? "success-lighten-5" : "grey-lighten-3",
                                  size: "72",
                                  rounded: "xl"
                                }, {
                                  default: withCtx(() => [
                                    createVNode(VIcon, {
                                      color: unref(selectedFile) ? "success" : "grey",
                                      size: "40"
                                    }, {
                                      default: withCtx(() => [
                                        createTextVNode(toDisplayString(unref(selectedFile) ? "mdi-microsoft-excel" : "mdi-cloud-upload-outline"), 1)
                                      ]),
                                      _: 1
                                    }, 8, ["color"])
                                  ]),
                                  _: 1
                                }, 8, ["color"]),
                                !unref(selectedFile) ? (openBlock(), createBlock(Fragment, { key: 0 }, [
                                  createVNode("div", { class: "text-h6 font-weight-bold" }, [
                                    createTextVNode("Drop your .xlsx here or "),
                                    createVNode("span", { class: "text-primary" }, "browse")
                                  ]),
                                  createVNode("div", { class: "text-body-2 text-medium-emphasis" }, "Only .xlsx files · max 20MB · Supplier Code optional")
                                ], 64)) : (openBlock(), createBlock(Fragment, { key: 1 }, [
                                  createVNode("div", {
                                    class: "text-h6 font-weight-bold",
                                    style: { "word-break": "break-all" }
                                  }, toDisplayString(unref(selectedFile).name), 1),
                                  createVNode("div", { class: "text-body-2 text-medium-emphasis" }, toDisplayString(formatSize(unref(selectedFile).size)), 1)
                                ], 64))
                              ], 42, ["onDragover", "onDragenter", "onDragleave"]),
                              unref(selectedFile) ? (openBlock(), createBlock("div", {
                                key: 0,
                                class: "d-flex ga-3 flex-wrap"
                              }, [
                                createVNode(VBtn, {
                                  color: "primary",
                                  "prepend-icon": "mdi-eye-outline",
                                  loading: unref(parsing),
                                  disabled: unref(parsing) || !!unref(preview),
                                  block: "",
                                  size: "large",
                                  onClick: parseFile
                                }, {
                                  default: withCtx(() => [
                                    createTextVNode(" Preview & Edit ")
                                  ]),
                                  _: 1
                                }, 8, ["loading", "disabled"]),
                                createVNode(VBtn, {
                                  variant: "outlined",
                                  icon: "mdi-close",
                                  size: "large",
                                  onClick: resetFile,
                                  disabled: unref(parsing) || unref(saving),
                                  "aria-label": "Remove file"
                                }, null, 8, ["disabled"])
                              ])) : createCommentVNode("", true)
                            ]),
                            _: 1
                          }),
                          createVNode(VScaleTransition, null, {
                            default: withCtx(() => [
                              unref(preview) ? (openBlock(), createBlock(VCard, {
                                key: 0,
                                rounded: "xl",
                                flat: "",
                                border: "",
                                class: "pa-6 mb-6"
                              }, {
                                default: withCtx(() => [
                                  createVNode("div", { class: "d-flex align-center ga-3 mb-5 flex-wrap" }, [
                                    createVNode(VAvatar, {
                                      color: "success-lighten-5",
                                      size: "36",
                                      rounded: "lg"
                                    }, {
                                      default: withCtx(() => [
                                        createVNode(VIcon, {
                                          color: "success",
                                          size: "20"
                                        }, {
                                          default: withCtx(() => [
                                            createTextVNode("mdi-numeric-3-circle")
                                          ]),
                                          _: 1
                                        })
                                      ]),
                                      _: 1
                                    }),
                                    createVNode("div", null, [
                                      createVNode("div", { class: "text-h6 font-weight-bold" }, "Preview & Edit Rows"),
                                      createVNode("div", { class: "text-body-2 text-medium-emphasis" }, toDisplayString(unref(previewRows).length) + " row(s) · " + toDisplayString(unref(preview).skipped) + " empty row(s) skipped · click any cell to edit ", 1)
                                    ]),
                                    createVNode(VSpacer),
                                    createVNode(VBtn, {
                                      variant: "text",
                                      size: "small",
                                      "prepend-icon": "mdi-plus",
                                      onClick: addRow,
                                      disabled: unref(saving)
                                    }, {
                                      default: withCtx(() => [
                                        createTextVNode("Add Row")
                                      ]),
                                      _: 1
                                    }, 8, ["disabled"]),
                                    createVNode(VBtn, {
                                      variant: "text",
                                      size: "small",
                                      color: "error",
                                      "prepend-icon": "mdi-close",
                                      onClick: cancelPreview,
                                      disabled: unref(saving)
                                    }, {
                                      default: withCtx(() => [
                                        createTextVNode("Cancel")
                                      ]),
                                      _: 1
                                    }, 8, ["disabled"])
                                  ]),
                                  unref(parseErrors).length > 0 ? (openBlock(), createBlock(VAlert, {
                                    key: 0,
                                    type: "warning",
                                    variant: "tonal",
                                    density: "compact",
                                    class: "mb-4",
                                    rounded: "lg"
                                  }, {
                                    default: withCtx(() => [
                                      createTextVNode(toDisplayString(unref(parseErrors).length) + " parse warning(s). Rows with issues are highlighted — fix or remove them before saving. ", 1)
                                    ]),
                                    _: 1
                                  })) : createCommentVNode("", true),
                                  createVNode("div", { class: "overflow-x-auto" }, [
                                    createVNode(VTable, {
                                      density: "compact",
                                      class: "preview-table"
                                    }, {
                                      default: withCtx(() => [
                                        createVNode("thead", { class: "bg-grey-lighten-4" }, [
                                          createVNode("tr", null, [
                                            createVNode("th", { style: { "min-width": "40px" } }, "#"),
                                            createVNode("th", { style: { "min-width": "130px" } }, "Code"),
                                            createVNode("th", { style: { "min-width": "180px" } }, "Name *"),
                                            createVNode("th", { style: { "min-width": "150px" } }, "Contact Person"),
                                            createVNode("th", { style: { "min-width": "180px" } }, "Email"),
                                            createVNode("th", { style: { "min-width": "130px" } }, "Phone"),
                                            createVNode("th", { style: { "min-width": "120px" } }, "City"),
                                            createVNode("th", { style: { "min-width": "120px" } }, "Country"),
                                            createVNode("th", { style: { "min-width": "110px" } }, "Payment Terms"),
                                            createVNode("th", { style: { "min-width": "100px" } }, "Lead (days)"),
                                            createVNode("th", { style: { "min-width": "90px" } }, "Active"),
                                            createVNode("th", { style: { "min-width": "56px" } })
                                          ])
                                        ]),
                                        createVNode("tbody", null, [
                                          (openBlock(true), createBlock(Fragment, null, renderList(unref(previewRows), (row, i) => {
                                            return openBlock(), createBlock("tr", {
                                              key: i,
                                              class: rowInvalid(row) ? "bg-error-lighten-5" : ""
                                            }, [
                                              createVNode("td", { class: "text-caption text-disabled" }, toDisplayString(i + 1), 1),
                                              createVNode("td", null, [
                                                createVNode(VTextField, {
                                                  modelValue: row.supplier_code,
                                                  "onUpdate:modelValue": ($event) => row.supplier_code = $event,
                                                  variant: "outlined",
                                                  density: "compact",
                                                  "hide-details": "",
                                                  placeholder: "auto",
                                                  class: "preview-input"
                                                }, null, 8, ["modelValue", "onUpdate:modelValue"])
                                              ]),
                                              createVNode("td", null, [
                                                createVNode(VTextField, {
                                                  modelValue: row.name,
                                                  "onUpdate:modelValue": ($event) => row.name = $event,
                                                  variant: "outlined",
                                                  density: "compact",
                                                  "hide-details": "",
                                                  class: "preview-input"
                                                }, null, 8, ["modelValue", "onUpdate:modelValue"])
                                              ]),
                                              createVNode("td", null, [
                                                createVNode(VTextField, {
                                                  modelValue: row.contact_person,
                                                  "onUpdate:modelValue": ($event) => row.contact_person = $event,
                                                  variant: "outlined",
                                                  density: "compact",
                                                  "hide-details": "",
                                                  class: "preview-input"
                                                }, null, 8, ["modelValue", "onUpdate:modelValue"])
                                              ]),
                                              createVNode("td", null, [
                                                createVNode(VTextField, {
                                                  modelValue: row.email,
                                                  "onUpdate:modelValue": ($event) => row.email = $event,
                                                  variant: "outlined",
                                                  density: "compact",
                                                  "hide-details": "",
                                                  class: "preview-input"
                                                }, null, 8, ["modelValue", "onUpdate:modelValue"])
                                              ]),
                                              createVNode("td", null, [
                                                createVNode(VTextField, {
                                                  modelValue: row.phone,
                                                  "onUpdate:modelValue": ($event) => row.phone = $event,
                                                  variant: "outlined",
                                                  density: "compact",
                                                  "hide-details": "",
                                                  class: "preview-input"
                                                }, null, 8, ["modelValue", "onUpdate:modelValue"])
                                              ]),
                                              createVNode("td", null, [
                                                createVNode(VTextField, {
                                                  modelValue: row.city,
                                                  "onUpdate:modelValue": ($event) => row.city = $event,
                                                  variant: "outlined",
                                                  density: "compact",
                                                  "hide-details": "",
                                                  class: "preview-input"
                                                }, null, 8, ["modelValue", "onUpdate:modelValue"])
                                              ]),
                                              createVNode("td", null, [
                                                createVNode(VTextField, {
                                                  modelValue: row.country,
                                                  "onUpdate:modelValue": ($event) => row.country = $event,
                                                  variant: "outlined",
                                                  density: "compact",
                                                  "hide-details": "",
                                                  class: "preview-input"
                                                }, null, 8, ["modelValue", "onUpdate:modelValue"])
                                              ]),
                                              createVNode("td", null, [
                                                createVNode(VTextField, {
                                                  modelValue: row.payment_terms,
                                                  "onUpdate:modelValue": ($event) => row.payment_terms = $event,
                                                  variant: "outlined",
                                                  density: "compact",
                                                  "hide-details": "",
                                                  class: "preview-input"
                                                }, null, 8, ["modelValue", "onUpdate:modelValue"])
                                              ]),
                                              createVNode("td", null, [
                                                createVNode(VTextField, {
                                                  modelValue: row.lead_time_days,
                                                  "onUpdate:modelValue": ($event) => row.lead_time_days = $event,
                                                  type: "number",
                                                  step: "1",
                                                  variant: "outlined",
                                                  density: "compact",
                                                  "hide-details": "",
                                                  class: "preview-input"
                                                }, null, 8, ["modelValue", "onUpdate:modelValue"])
                                              ]),
                                              createVNode("td", null, [
                                                createVNode(VSwitch, {
                                                  modelValue: row.is_active,
                                                  "onUpdate:modelValue": ($event) => row.is_active = $event,
                                                  color: "success",
                                                  density: "compact",
                                                  "hide-details": "",
                                                  inset: ""
                                                }, null, 8, ["modelValue", "onUpdate:modelValue"])
                                              ]),
                                              createVNode("td", null, [
                                                createVNode(VBtn, {
                                                  icon: "mdi-delete",
                                                  size: "small",
                                                  variant: "text",
                                                  color: "error",
                                                  onClick: ($event) => removeRow(i)
                                                }, null, 8, ["onClick"])
                                              ])
                                            ], 2);
                                          }), 128))
                                        ])
                                      ]),
                                      _: 1
                                    })
                                  ]),
                                  createVNode("div", { class: "d-flex align-center ga-3 mt-5 flex-wrap" }, [
                                    createVNode(VBtn, {
                                      color: "success",
                                      "prepend-icon": "mdi-content-save",
                                      loading: unref(saving),
                                      disabled: unref(saving) || unref(previewRows).length === 0,
                                      size: "large",
                                      onClick: saveBulk
                                    }, {
                                      default: withCtx(() => [
                                        createTextVNode(" Save " + toDisplayString(unref(previewRows).length) + " Supplier(s) ", 1)
                                      ]),
                                      _: 1
                                    }, 8, ["loading", "disabled"]),
                                    unref(emptyCodeCount) > 0 ? (openBlock(), createBlock("span", {
                                      key: 0,
                                      class: "text-body-2 text-medium-emphasis"
                                    }, toDisplayString(unref(emptyCodeCount)) + " row(s) will get auto-generated codes when saved ", 1)) : createCommentVNode("", true)
                                  ])
                                ]),
                                _: 1
                              })) : createCommentVNode("", true)
                            ]),
                            _: 1
                          }),
                          createVNode(VSlideYTransition, null, {
                            default: withCtx(() => [
                              unref(importResult) ? (openBlock(), createBlock(VCard, {
                                key: 0,
                                rounded: "xl",
                                flat: "",
                                border: "",
                                class: "pa-6",
                                style: unref(resultBorderStyle)
                              }, {
                                default: withCtx(() => [
                                  createVNode("div", { class: "d-flex align-center ga-3 mb-5 flex-wrap" }, [
                                    createVNode(VAvatar, {
                                      color: unref(importResult).failed > 0 ? "warning-lighten-5" : "success-lighten-5",
                                      size: "48",
                                      rounded: "lg"
                                    }, {
                                      default: withCtx(() => [
                                        createVNode(VIcon, {
                                          color: unref(importResult).failed > 0 ? "warning" : "success",
                                          size: "28"
                                        }, {
                                          default: withCtx(() => [
                                            createTextVNode(toDisplayString(unref(importResult).failed > 0 ? "mdi-alert" : "mdi-check-circle"), 1)
                                          ]),
                                          _: 1
                                        }, 8, ["color"])
                                      ]),
                                      _: 1
                                    }, 8, ["color"]),
                                    createVNode("div", null, [
                                      createVNode("div", { class: "text-h6 font-weight-bold" }, toDisplayString(unref(importResult).failed > 0 ? "Import Finished (with issues)" : "Import Successful"), 1),
                                      createVNode("div", { class: "text-body-2 text-medium-emphasis" }, toDisplayString(unref(importResult).total_processed) + " row(s) processed", 1)
                                    ]),
                                    createVNode(VSpacer),
                                    unref(importResult).failed === 0 ? (openBlock(), createBlock(VBtn, {
                                      key: 0,
                                      color: "success",
                                      "prepend-icon": "mdi-truck-outline",
                                      onClick: ($event) => ("navigateTo" in _ctx ? _ctx.navigateTo : unref(navigateTo))("/suppliers?imported=1")
                                    }, {
                                      default: withCtx(() => [
                                        createTextVNode(" View Suppliers ")
                                      ]),
                                      _: 1
                                    }, 8, ["onClick"])) : createCommentVNode("", true),
                                    createVNode(VBtn, {
                                      variant: "text",
                                      "prepend-icon": "mdi-refresh",
                                      onClick: resetAll
                                    }, {
                                      default: withCtx(() => [
                                        createTextVNode("Start Over")
                                      ]),
                                      _: 1
                                    })
                                  ]),
                                  createVNode(VRow, {
                                    dense: "",
                                    class: "mb-5"
                                  }, {
                                    default: withCtx(() => [
                                      createVNode(VCol, {
                                        cols: "6",
                                        sm: "3"
                                      }, {
                                        default: withCtx(() => [
                                          createVNode(VCard, {
                                            variant: "outlined",
                                            rounded: "lg",
                                            class: "pa-4 text-center",
                                            flat: ""
                                          }, {
                                            default: withCtx(() => [
                                              createVNode("div", { class: "text-caption text-medium-emphasis text-uppercase" }, "Created"),
                                              createVNode("div", { class: "text-h4 font-weight-bold text-success mt-1" }, toDisplayString(unref(importResult).created), 1)
                                            ]),
                                            _: 1
                                          })
                                        ]),
                                        _: 1
                                      }),
                                      createVNode(VCol, {
                                        cols: "6",
                                        sm: "3"
                                      }, {
                                        default: withCtx(() => [
                                          createVNode(VCard, {
                                            variant: "outlined",
                                            rounded: "lg",
                                            class: "pa-4 text-center",
                                            flat: ""
                                          }, {
                                            default: withCtx(() => [
                                              createVNode("div", { class: "text-caption text-medium-emphasis text-uppercase" }, "Updated"),
                                              createVNode("div", { class: "text-h4 font-weight-bold text-primary mt-1" }, toDisplayString(unref(importResult).updated), 1)
                                            ]),
                                            _: 1
                                          })
                                        ]),
                                        _: 1
                                      }),
                                      createVNode(VCol, {
                                        cols: "6",
                                        sm: "3"
                                      }, {
                                        default: withCtx(() => [
                                          createVNode(VCard, {
                                            variant: "outlined",
                                            rounded: "lg",
                                            class: "pa-4 text-center",
                                            flat: ""
                                          }, {
                                            default: withCtx(() => [
                                              createVNode("div", { class: "text-caption text-medium-emphasis text-uppercase" }, "Failed"),
                                              createVNode("div", {
                                                class: ["text-h4 font-weight-bold mt-1", unref(importResult).failed > 0 ? "text-error" : "text-disabled"]
                                              }, toDisplayString(unref(importResult).failed), 3)
                                            ]),
                                            _: 1
                                          })
                                        ]),
                                        _: 1
                                      }),
                                      createVNode(VCol, {
                                        cols: "6",
                                        sm: "3"
                                      }, {
                                        default: withCtx(() => [
                                          createVNode(VCard, {
                                            variant: "outlined",
                                            rounded: "lg",
                                            class: "pa-4 text-center",
                                            flat: ""
                                          }, {
                                            default: withCtx(() => [
                                              createVNode("div", { class: "text-caption text-medium-emphasis text-uppercase" }, "Processed"),
                                              createVNode("div", { class: "text-h4 font-weight-bold mt-1" }, toDisplayString(unref(importResult).total_processed), 1)
                                            ]),
                                            _: 1
                                          })
                                        ]),
                                        _: 1
                                      })
                                    ]),
                                    _: 1
                                  }),
                                  unref(importResult).errors && unref(importResult).errors.length > 0 ? (openBlock(), createBlock("div", { key: 0 }, [
                                    createVNode("div", { class: "d-flex align-center ga-2 mb-3" }, [
                                      createVNode(VIcon, {
                                        size: "18",
                                        color: "error"
                                      }, {
                                        default: withCtx(() => [
                                          createTextVNode("mdi-alert-circle-outline")
                                        ]),
                                        _: 1
                                      }),
                                      createVNode("span", { class: "text-body-1 font-weight-bold" }, "Errors (" + toDisplayString(unref(importResult).errors.length) + toDisplayString(unref(importResult).errors_truncated ? "+" : "") + ")", 1)
                                    ]),
                                    createVNode(VList, {
                                      variant: "outlined",
                                      rounded: "lg",
                                      density: "compact",
                                      class: "bg-surface",
                                      "max-height": "320",
                                      lines: "two"
                                    }, {
                                      default: withCtx(() => [
                                        (openBlock(true), createBlock(Fragment, null, renderList(unref(importResult).errors, (err, idx) => {
                                          return openBlock(), createBlock(VListItem, { key: idx }, {
                                            prepend: withCtx(() => [
                                              createVNode(VAvatar, {
                                                color: "error-lighten-5",
                                                size: "32",
                                                rounded: "lg"
                                              }, {
                                                default: withCtx(() => [
                                                  createVNode("span", { class: "text-caption font-weight-bold text-error" }, "#" + toDisplayString(err.row), 1)
                                                ]),
                                                _: 2
                                              }, 1024)
                                            ]),
                                            default: withCtx(() => [
                                              createVNode(VListItemSubtitle, { class: "text-body-2 text-error" }, {
                                                default: withCtx(() => [
                                                  createTextVNode(toDisplayString(err.detail), 1)
                                                ]),
                                                _: 2
                                              }, 1024)
                                            ]),
                                            _: 2
                                          }, 1024);
                                        }), 128))
                                      ]),
                                      _: 1
                                    })
                                  ])) : createCommentVNode("", true)
                                ]),
                                _: 1
                              }, 8, ["style"])) : createCommentVNode("", true)
                            ]),
                            _: 1
                          })
                        ];
                      }
                    }),
                    _: 1
                  }, _parent3, _scopeId2));
                  _push3(ssrRenderComponent(VWindowItem, { value: "export" }, {
                    default: withCtx((_3, _push4, _parent4, _scopeId3) => {
                      if (_push4) {
                        _push4(ssrRenderComponent(VRow, null, {
                          default: withCtx((_4, _push5, _parent5, _scopeId4) => {
                            if (_push5) {
                              _push5(ssrRenderComponent(VCol, {
                                cols: "12",
                                lg: "7"
                              }, {
                                default: withCtx((_5, _push6, _parent6, _scopeId5) => {
                                  if (_push6) {
                                    _push6(ssrRenderComponent(VCard, {
                                      rounded: "xl",
                                      flat: "",
                                      border: "",
                                      class: "pa-6 h-100"
                                    }, {
                                      default: withCtx((_6, _push7, _parent7, _scopeId6) => {
                                        if (_push7) {
                                          _push7(`<div class="d-flex align-center ga-3 mb-5" data-v-6f982028${_scopeId6}>`);
                                          _push7(ssrRenderComponent(VAvatar, {
                                            color: "success-lighten-5",
                                            size: "48",
                                            rounded: "lg"
                                          }, {
                                            default: withCtx((_7, _push8, _parent8, _scopeId7) => {
                                              if (_push8) {
                                                _push8(ssrRenderComponent(VIcon, {
                                                  color: "success",
                                                  size: "26"
                                                }, {
                                                  default: withCtx((_8, _push9, _parent9, _scopeId8) => {
                                                    if (_push9) {
                                                      _push9(`mdi-file-excel-outline`);
                                                    } else {
                                                      return [
                                                        createTextVNode("mdi-file-excel-outline")
                                                      ];
                                                    }
                                                  }),
                                                  _: 1
                                                }, _parent8, _scopeId7));
                                              } else {
                                                return [
                                                  createVNode(VIcon, {
                                                    color: "success",
                                                    size: "26"
                                                  }, {
                                                    default: withCtx(() => [
                                                      createTextVNode("mdi-file-excel-outline")
                                                    ]),
                                                    _: 1
                                                  })
                                                ];
                                              }
                                            }),
                                            _: 1
                                          }, _parent7, _scopeId6));
                                          _push7(`<div data-v-6f982028${_scopeId6}><div class="text-h6 font-weight-bold" data-v-6f982028${_scopeId6}>Export Suppliers to Excel</div><div class="text-body-2 text-medium-emphasis" data-v-6f982028${_scopeId6}>Download all suppliers as a formatted .xlsx file</div></div></div>`);
                                          _push7(ssrRenderComponent(VList, {
                                            density: "compact",
                                            class: "bg-transparent px-0 mb-4"
                                          }, {
                                            default: withCtx((_7, _push8, _parent8, _scopeId7) => {
                                              if (_push8) {
                                                _push8(`<!--[-->`);
                                                ssrRenderList(exportInfo, (info) => {
                                                  _push8(ssrRenderComponent(VListItem, {
                                                    class: "px-0",
                                                    key: info.title
                                                  }, {
                                                    prepend: withCtx((_8, _push9, _parent9, _scopeId8) => {
                                                      if (_push9) {
                                                        _push9(ssrRenderComponent(VIcon, {
                                                          color: info.color,
                                                          size: "22"
                                                        }, {
                                                          default: withCtx((_9, _push10, _parent10, _scopeId9) => {
                                                            if (_push10) {
                                                              _push10(`${ssrInterpolate(info.icon)}`);
                                                            } else {
                                                              return [
                                                                createTextVNode(toDisplayString(info.icon), 1)
                                                              ];
                                                            }
                                                          }),
                                                          _: 2
                                                        }, _parent9, _scopeId8));
                                                      } else {
                                                        return [
                                                          createVNode(VIcon, {
                                                            color: info.color,
                                                            size: "22"
                                                          }, {
                                                            default: withCtx(() => [
                                                              createTextVNode(toDisplayString(info.icon), 1)
                                                            ]),
                                                            _: 2
                                                          }, 1032, ["color"])
                                                        ];
                                                      }
                                                    }),
                                                    default: withCtx((_8, _push9, _parent9, _scopeId8) => {
                                                      if (_push9) {
                                                        _push9(ssrRenderComponent(VListItemTitle, { class: "text-body-1 font-weight-medium" }, {
                                                          default: withCtx((_9, _push10, _parent10, _scopeId9) => {
                                                            if (_push10) {
                                                              _push10(`${ssrInterpolate(info.title)}`);
                                                            } else {
                                                              return [
                                                                createTextVNode(toDisplayString(info.title), 1)
                                                              ];
                                                            }
                                                          }),
                                                          _: 2
                                                        }, _parent9, _scopeId8));
                                                        _push9(ssrRenderComponent(VListItemSubtitle, { class: "text-body-2 text-medium-emphasis" }, {
                                                          default: withCtx((_9, _push10, _parent10, _scopeId9) => {
                                                            if (_push10) {
                                                              _push10(`${ssrInterpolate(info.subtitle)}`);
                                                            } else {
                                                              return [
                                                                createTextVNode(toDisplayString(info.subtitle), 1)
                                                              ];
                                                            }
                                                          }),
                                                          _: 2
                                                        }, _parent9, _scopeId8));
                                                      } else {
                                                        return [
                                                          createVNode(VListItemTitle, { class: "text-body-1 font-weight-medium" }, {
                                                            default: withCtx(() => [
                                                              createTextVNode(toDisplayString(info.title), 1)
                                                            ]),
                                                            _: 2
                                                          }, 1024),
                                                          createVNode(VListItemSubtitle, { class: "text-body-2 text-medium-emphasis" }, {
                                                            default: withCtx(() => [
                                                              createTextVNode(toDisplayString(info.subtitle), 1)
                                                            ]),
                                                            _: 2
                                                          }, 1024)
                                                        ];
                                                      }
                                                    }),
                                                    _: 2
                                                  }, _parent8, _scopeId7));
                                                });
                                                _push8(`<!--]-->`);
                                              } else {
                                                return [
                                                  (openBlock(), createBlock(Fragment, null, renderList(exportInfo, (info) => {
                                                    return createVNode(VListItem, {
                                                      class: "px-0",
                                                      key: info.title
                                                    }, {
                                                      prepend: withCtx(() => [
                                                        createVNode(VIcon, {
                                                          color: info.color,
                                                          size: "22"
                                                        }, {
                                                          default: withCtx(() => [
                                                            createTextVNode(toDisplayString(info.icon), 1)
                                                          ]),
                                                          _: 2
                                                        }, 1032, ["color"])
                                                      ]),
                                                      default: withCtx(() => [
                                                        createVNode(VListItemTitle, { class: "text-body-1 font-weight-medium" }, {
                                                          default: withCtx(() => [
                                                            createTextVNode(toDisplayString(info.title), 1)
                                                          ]),
                                                          _: 2
                                                        }, 1024),
                                                        createVNode(VListItemSubtitle, { class: "text-body-2 text-medium-emphasis" }, {
                                                          default: withCtx(() => [
                                                            createTextVNode(toDisplayString(info.subtitle), 1)
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
                                          }, _parent7, _scopeId6));
                                          _push7(ssrRenderComponent(VBtn, {
                                            color: "success",
                                            "prepend-icon": "mdi-microsoft-excel",
                                            block: "",
                                            size: "x-large",
                                            loading: unref(exporting),
                                            onClick: doExport
                                          }, {
                                            default: withCtx((_7, _push8, _parent8, _scopeId7) => {
                                              if (_push8) {
                                                _push8(` Download .xlsx `);
                                              } else {
                                                return [
                                                  createTextVNode(" Download .xlsx ")
                                                ];
                                              }
                                            }),
                                            _: 1
                                          }, _parent7, _scopeId6));
                                        } else {
                                          return [
                                            createVNode("div", { class: "d-flex align-center ga-3 mb-5" }, [
                                              createVNode(VAvatar, {
                                                color: "success-lighten-5",
                                                size: "48",
                                                rounded: "lg"
                                              }, {
                                                default: withCtx(() => [
                                                  createVNode(VIcon, {
                                                    color: "success",
                                                    size: "26"
                                                  }, {
                                                    default: withCtx(() => [
                                                      createTextVNode("mdi-file-excel-outline")
                                                    ]),
                                                    _: 1
                                                  })
                                                ]),
                                                _: 1
                                              }),
                                              createVNode("div", null, [
                                                createVNode("div", { class: "text-h6 font-weight-bold" }, "Export Suppliers to Excel"),
                                                createVNode("div", { class: "text-body-2 text-medium-emphasis" }, "Download all suppliers as a formatted .xlsx file")
                                              ])
                                            ]),
                                            createVNode(VList, {
                                              density: "compact",
                                              class: "bg-transparent px-0 mb-4"
                                            }, {
                                              default: withCtx(() => [
                                                (openBlock(), createBlock(Fragment, null, renderList(exportInfo, (info) => {
                                                  return createVNode(VListItem, {
                                                    class: "px-0",
                                                    key: info.title
                                                  }, {
                                                    prepend: withCtx(() => [
                                                      createVNode(VIcon, {
                                                        color: info.color,
                                                        size: "22"
                                                      }, {
                                                        default: withCtx(() => [
                                                          createTextVNode(toDisplayString(info.icon), 1)
                                                        ]),
                                                        _: 2
                                                      }, 1032, ["color"])
                                                    ]),
                                                    default: withCtx(() => [
                                                      createVNode(VListItemTitle, { class: "text-body-1 font-weight-medium" }, {
                                                        default: withCtx(() => [
                                                          createTextVNode(toDisplayString(info.title), 1)
                                                        ]),
                                                        _: 2
                                                      }, 1024),
                                                      createVNode(VListItemSubtitle, { class: "text-body-2 text-medium-emphasis" }, {
                                                        default: withCtx(() => [
                                                          createTextVNode(toDisplayString(info.subtitle), 1)
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
                                            createVNode(VBtn, {
                                              color: "success",
                                              "prepend-icon": "mdi-microsoft-excel",
                                              block: "",
                                              size: "x-large",
                                              loading: unref(exporting),
                                              onClick: doExport
                                            }, {
                                              default: withCtx(() => [
                                                createTextVNode(" Download .xlsx ")
                                              ]),
                                              _: 1
                                            }, 8, ["loading"])
                                          ];
                                        }
                                      }),
                                      _: 1
                                    }, _parent6, _scopeId5));
                                  } else {
                                    return [
                                      createVNode(VCard, {
                                        rounded: "xl",
                                        flat: "",
                                        border: "",
                                        class: "pa-6 h-100"
                                      }, {
                                        default: withCtx(() => [
                                          createVNode("div", { class: "d-flex align-center ga-3 mb-5" }, [
                                            createVNode(VAvatar, {
                                              color: "success-lighten-5",
                                              size: "48",
                                              rounded: "lg"
                                            }, {
                                              default: withCtx(() => [
                                                createVNode(VIcon, {
                                                  color: "success",
                                                  size: "26"
                                                }, {
                                                  default: withCtx(() => [
                                                    createTextVNode("mdi-file-excel-outline")
                                                  ]),
                                                  _: 1
                                                })
                                              ]),
                                              _: 1
                                            }),
                                            createVNode("div", null, [
                                              createVNode("div", { class: "text-h6 font-weight-bold" }, "Export Suppliers to Excel"),
                                              createVNode("div", { class: "text-body-2 text-medium-emphasis" }, "Download all suppliers as a formatted .xlsx file")
                                            ])
                                          ]),
                                          createVNode(VList, {
                                            density: "compact",
                                            class: "bg-transparent px-0 mb-4"
                                          }, {
                                            default: withCtx(() => [
                                              (openBlock(), createBlock(Fragment, null, renderList(exportInfo, (info) => {
                                                return createVNode(VListItem, {
                                                  class: "px-0",
                                                  key: info.title
                                                }, {
                                                  prepend: withCtx(() => [
                                                    createVNode(VIcon, {
                                                      color: info.color,
                                                      size: "22"
                                                    }, {
                                                      default: withCtx(() => [
                                                        createTextVNode(toDisplayString(info.icon), 1)
                                                      ]),
                                                      _: 2
                                                    }, 1032, ["color"])
                                                  ]),
                                                  default: withCtx(() => [
                                                    createVNode(VListItemTitle, { class: "text-body-1 font-weight-medium" }, {
                                                      default: withCtx(() => [
                                                        createTextVNode(toDisplayString(info.title), 1)
                                                      ]),
                                                      _: 2
                                                    }, 1024),
                                                    createVNode(VListItemSubtitle, { class: "text-body-2 text-medium-emphasis" }, {
                                                      default: withCtx(() => [
                                                        createTextVNode(toDisplayString(info.subtitle), 1)
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
                                          createVNode(VBtn, {
                                            color: "success",
                                            "prepend-icon": "mdi-microsoft-excel",
                                            block: "",
                                            size: "x-large",
                                            loading: unref(exporting),
                                            onClick: doExport
                                          }, {
                                            default: withCtx(() => [
                                              createTextVNode(" Download .xlsx ")
                                            ]),
                                            _: 1
                                          }, 8, ["loading"])
                                        ]),
                                        _: 1
                                      })
                                    ];
                                  }
                                }),
                                _: 1
                              }, _parent5, _scopeId4));
                              _push5(ssrRenderComponent(VCol, {
                                cols: "12",
                                lg: "5"
                              }, {
                                default: withCtx((_5, _push6, _parent6, _scopeId5) => {
                                  if (_push6) {
                                    _push6(ssrRenderComponent(VCard, {
                                      rounded: "xl",
                                      flat: "",
                                      border: "",
                                      class: "pa-6 h-100"
                                    }, {
                                      default: withCtx((_6, _push7, _parent7, _scopeId6) => {
                                        if (_push7) {
                                          _push7(`<div class="text-h6 font-weight-bold mb-4" data-v-6f982028${_scopeId6}>`);
                                          _push7(ssrRenderComponent(VIcon, {
                                            class: "mr-1",
                                            color: "primary"
                                          }, {
                                            default: withCtx((_7, _push8, _parent8, _scopeId7) => {
                                              if (_push8) {
                                                _push8(`mdi-filter-variant`);
                                              } else {
                                                return [
                                                  createTextVNode("mdi-filter-variant")
                                                ];
                                              }
                                            }),
                                            _: 1
                                          }, _parent7, _scopeId6));
                                          _push7(`Active Filters</div>`);
                                          if (unref(activeFilterChips).length === 0) {
                                            _push7(`<div class="text-body-2 text-medium-emphasis pa-4 text-center" data-v-6f982028${_scopeId6}>No filters active — export will include all suppliers.</div>`);
                                          } else {
                                            _push7(`<div class="d-flex flex-wrap ga-2" data-v-6f982028${_scopeId6}><!--[-->`);
                                            ssrRenderList(unref(activeFilterChips), (chip) => {
                                              _push7(ssrRenderComponent(VChip, {
                                                key: chip.label,
                                                size: "small",
                                                color: chip.color,
                                                variant: "tonal"
                                              }, {
                                                default: withCtx((_7, _push8, _parent8, _scopeId7) => {
                                                  if (_push8) {
                                                    _push8(`${ssrInterpolate(chip.label)}`);
                                                  } else {
                                                    return [
                                                      createTextVNode(toDisplayString(chip.label), 1)
                                                    ];
                                                  }
                                                }),
                                                _: 2
                                              }, _parent7, _scopeId6));
                                            });
                                            _push7(`<!--]--></div>`);
                                          }
                                          _push7(ssrRenderComponent(VAlert, {
                                            type: "info",
                                            variant: "tonal",
                                            density: "compact",
                                            class: "mt-5",
                                            rounded: "lg"
                                          }, {
                                            default: withCtx((_7, _push8, _parent8, _scopeId7) => {
                                              if (_push8) {
                                                _push8(` Filters carried over from the Suppliers page. Return there to change them, then re-open Import / Export. `);
                                              } else {
                                                return [
                                                  createTextVNode(" Filters carried over from the Suppliers page. Return there to change them, then re-open Import / Export. ")
                                                ];
                                              }
                                            }),
                                            _: 1
                                          }, _parent7, _scopeId6));
                                          _push7(ssrRenderComponent(VBtn, {
                                            variant: "text",
                                            color: "primary",
                                            "prepend-icon": "mdi-arrow-left",
                                            class: "mt-2",
                                            onClick: ($event) => ("navigateTo" in _ctx ? _ctx.navigateTo : unref(navigateTo))("/suppliers")
                                          }, {
                                            default: withCtx((_7, _push8, _parent8, _scopeId7) => {
                                              if (_push8) {
                                                _push8(`Back to Suppliers`);
                                              } else {
                                                return [
                                                  createTextVNode("Back to Suppliers")
                                                ];
                                              }
                                            }),
                                            _: 1
                                          }, _parent7, _scopeId6));
                                        } else {
                                          return [
                                            createVNode("div", { class: "text-h6 font-weight-bold mb-4" }, [
                                              createVNode(VIcon, {
                                                class: "mr-1",
                                                color: "primary"
                                              }, {
                                                default: withCtx(() => [
                                                  createTextVNode("mdi-filter-variant")
                                                ]),
                                                _: 1
                                              }),
                                              createTextVNode("Active Filters")
                                            ]),
                                            unref(activeFilterChips).length === 0 ? (openBlock(), createBlock("div", {
                                              key: 0,
                                              class: "text-body-2 text-medium-emphasis pa-4 text-center"
                                            }, "No filters active — export will include all suppliers.")) : (openBlock(), createBlock("div", {
                                              key: 1,
                                              class: "d-flex flex-wrap ga-2"
                                            }, [
                                              (openBlock(true), createBlock(Fragment, null, renderList(unref(activeFilterChips), (chip) => {
                                                return openBlock(), createBlock(VChip, {
                                                  key: chip.label,
                                                  size: "small",
                                                  color: chip.color,
                                                  variant: "tonal"
                                                }, {
                                                  default: withCtx(() => [
                                                    createTextVNode(toDisplayString(chip.label), 1)
                                                  ]),
                                                  _: 2
                                                }, 1032, ["color"]);
                                              }), 128))
                                            ])),
                                            createVNode(VAlert, {
                                              type: "info",
                                              variant: "tonal",
                                              density: "compact",
                                              class: "mt-5",
                                              rounded: "lg"
                                            }, {
                                              default: withCtx(() => [
                                                createTextVNode(" Filters carried over from the Suppliers page. Return there to change them, then re-open Import / Export. ")
                                              ]),
                                              _: 1
                                            }),
                                            createVNode(VBtn, {
                                              variant: "text",
                                              color: "primary",
                                              "prepend-icon": "mdi-arrow-left",
                                              class: "mt-2",
                                              onClick: ($event) => ("navigateTo" in _ctx ? _ctx.navigateTo : unref(navigateTo))("/suppliers")
                                            }, {
                                              default: withCtx(() => [
                                                createTextVNode("Back to Suppliers")
                                              ]),
                                              _: 1
                                            }, 8, ["onClick"])
                                          ];
                                        }
                                      }),
                                      _: 1
                                    }, _parent6, _scopeId5));
                                  } else {
                                    return [
                                      createVNode(VCard, {
                                        rounded: "xl",
                                        flat: "",
                                        border: "",
                                        class: "pa-6 h-100"
                                      }, {
                                        default: withCtx(() => [
                                          createVNode("div", { class: "text-h6 font-weight-bold mb-4" }, [
                                            createVNode(VIcon, {
                                              class: "mr-1",
                                              color: "primary"
                                            }, {
                                              default: withCtx(() => [
                                                createTextVNode("mdi-filter-variant")
                                              ]),
                                              _: 1
                                            }),
                                            createTextVNode("Active Filters")
                                          ]),
                                          unref(activeFilterChips).length === 0 ? (openBlock(), createBlock("div", {
                                            key: 0,
                                            class: "text-body-2 text-medium-emphasis pa-4 text-center"
                                          }, "No filters active — export will include all suppliers.")) : (openBlock(), createBlock("div", {
                                            key: 1,
                                            class: "d-flex flex-wrap ga-2"
                                          }, [
                                            (openBlock(true), createBlock(Fragment, null, renderList(unref(activeFilterChips), (chip) => {
                                              return openBlock(), createBlock(VChip, {
                                                key: chip.label,
                                                size: "small",
                                                color: chip.color,
                                                variant: "tonal"
                                              }, {
                                                default: withCtx(() => [
                                                  createTextVNode(toDisplayString(chip.label), 1)
                                                ]),
                                                _: 2
                                              }, 1032, ["color"]);
                                            }), 128))
                                          ])),
                                          createVNode(VAlert, {
                                            type: "info",
                                            variant: "tonal",
                                            density: "compact",
                                            class: "mt-5",
                                            rounded: "lg"
                                          }, {
                                            default: withCtx(() => [
                                              createTextVNode(" Filters carried over from the Suppliers page. Return there to change them, then re-open Import / Export. ")
                                            ]),
                                            _: 1
                                          }),
                                          createVNode(VBtn, {
                                            variant: "text",
                                            color: "primary",
                                            "prepend-icon": "mdi-arrow-left",
                                            class: "mt-2",
                                            onClick: ($event) => ("navigateTo" in _ctx ? _ctx.navigateTo : unref(navigateTo))("/suppliers")
                                          }, {
                                            default: withCtx(() => [
                                              createTextVNode("Back to Suppliers")
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
                              }, _parent5, _scopeId4));
                            } else {
                              return [
                                createVNode(VCol, {
                                  cols: "12",
                                  lg: "7"
                                }, {
                                  default: withCtx(() => [
                                    createVNode(VCard, {
                                      rounded: "xl",
                                      flat: "",
                                      border: "",
                                      class: "pa-6 h-100"
                                    }, {
                                      default: withCtx(() => [
                                        createVNode("div", { class: "d-flex align-center ga-3 mb-5" }, [
                                          createVNode(VAvatar, {
                                            color: "success-lighten-5",
                                            size: "48",
                                            rounded: "lg"
                                          }, {
                                            default: withCtx(() => [
                                              createVNode(VIcon, {
                                                color: "success",
                                                size: "26"
                                              }, {
                                                default: withCtx(() => [
                                                  createTextVNode("mdi-file-excel-outline")
                                                ]),
                                                _: 1
                                              })
                                            ]),
                                            _: 1
                                          }),
                                          createVNode("div", null, [
                                            createVNode("div", { class: "text-h6 font-weight-bold" }, "Export Suppliers to Excel"),
                                            createVNode("div", { class: "text-body-2 text-medium-emphasis" }, "Download all suppliers as a formatted .xlsx file")
                                          ])
                                        ]),
                                        createVNode(VList, {
                                          density: "compact",
                                          class: "bg-transparent px-0 mb-4"
                                        }, {
                                          default: withCtx(() => [
                                            (openBlock(), createBlock(Fragment, null, renderList(exportInfo, (info) => {
                                              return createVNode(VListItem, {
                                                class: "px-0",
                                                key: info.title
                                              }, {
                                                prepend: withCtx(() => [
                                                  createVNode(VIcon, {
                                                    color: info.color,
                                                    size: "22"
                                                  }, {
                                                    default: withCtx(() => [
                                                      createTextVNode(toDisplayString(info.icon), 1)
                                                    ]),
                                                    _: 2
                                                  }, 1032, ["color"])
                                                ]),
                                                default: withCtx(() => [
                                                  createVNode(VListItemTitle, { class: "text-body-1 font-weight-medium" }, {
                                                    default: withCtx(() => [
                                                      createTextVNode(toDisplayString(info.title), 1)
                                                    ]),
                                                    _: 2
                                                  }, 1024),
                                                  createVNode(VListItemSubtitle, { class: "text-body-2 text-medium-emphasis" }, {
                                                    default: withCtx(() => [
                                                      createTextVNode(toDisplayString(info.subtitle), 1)
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
                                        createVNode(VBtn, {
                                          color: "success",
                                          "prepend-icon": "mdi-microsoft-excel",
                                          block: "",
                                          size: "x-large",
                                          loading: unref(exporting),
                                          onClick: doExport
                                        }, {
                                          default: withCtx(() => [
                                            createTextVNode(" Download .xlsx ")
                                          ]),
                                          _: 1
                                        }, 8, ["loading"])
                                      ]),
                                      _: 1
                                    })
                                  ]),
                                  _: 1
                                }),
                                createVNode(VCol, {
                                  cols: "12",
                                  lg: "5"
                                }, {
                                  default: withCtx(() => [
                                    createVNode(VCard, {
                                      rounded: "xl",
                                      flat: "",
                                      border: "",
                                      class: "pa-6 h-100"
                                    }, {
                                      default: withCtx(() => [
                                        createVNode("div", { class: "text-h6 font-weight-bold mb-4" }, [
                                          createVNode(VIcon, {
                                            class: "mr-1",
                                            color: "primary"
                                          }, {
                                            default: withCtx(() => [
                                              createTextVNode("mdi-filter-variant")
                                            ]),
                                            _: 1
                                          }),
                                          createTextVNode("Active Filters")
                                        ]),
                                        unref(activeFilterChips).length === 0 ? (openBlock(), createBlock("div", {
                                          key: 0,
                                          class: "text-body-2 text-medium-emphasis pa-4 text-center"
                                        }, "No filters active — export will include all suppliers.")) : (openBlock(), createBlock("div", {
                                          key: 1,
                                          class: "d-flex flex-wrap ga-2"
                                        }, [
                                          (openBlock(true), createBlock(Fragment, null, renderList(unref(activeFilterChips), (chip) => {
                                            return openBlock(), createBlock(VChip, {
                                              key: chip.label,
                                              size: "small",
                                              color: chip.color,
                                              variant: "tonal"
                                            }, {
                                              default: withCtx(() => [
                                                createTextVNode(toDisplayString(chip.label), 1)
                                              ]),
                                              _: 2
                                            }, 1032, ["color"]);
                                          }), 128))
                                        ])),
                                        createVNode(VAlert, {
                                          type: "info",
                                          variant: "tonal",
                                          density: "compact",
                                          class: "mt-5",
                                          rounded: "lg"
                                        }, {
                                          default: withCtx(() => [
                                            createTextVNode(" Filters carried over from the Suppliers page. Return there to change them, then re-open Import / Export. ")
                                          ]),
                                          _: 1
                                        }),
                                        createVNode(VBtn, {
                                          variant: "text",
                                          color: "primary",
                                          "prepend-icon": "mdi-arrow-left",
                                          class: "mt-2",
                                          onClick: ($event) => ("navigateTo" in _ctx ? _ctx.navigateTo : unref(navigateTo))("/suppliers")
                                        }, {
                                          default: withCtx(() => [
                                            createTextVNode("Back to Suppliers")
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
                        }, _parent4, _scopeId3));
                      } else {
                        return [
                          createVNode(VRow, null, {
                            default: withCtx(() => [
                              createVNode(VCol, {
                                cols: "12",
                                lg: "7"
                              }, {
                                default: withCtx(() => [
                                  createVNode(VCard, {
                                    rounded: "xl",
                                    flat: "",
                                    border: "",
                                    class: "pa-6 h-100"
                                  }, {
                                    default: withCtx(() => [
                                      createVNode("div", { class: "d-flex align-center ga-3 mb-5" }, [
                                        createVNode(VAvatar, {
                                          color: "success-lighten-5",
                                          size: "48",
                                          rounded: "lg"
                                        }, {
                                          default: withCtx(() => [
                                            createVNode(VIcon, {
                                              color: "success",
                                              size: "26"
                                            }, {
                                              default: withCtx(() => [
                                                createTextVNode("mdi-file-excel-outline")
                                              ]),
                                              _: 1
                                            })
                                          ]),
                                          _: 1
                                        }),
                                        createVNode("div", null, [
                                          createVNode("div", { class: "text-h6 font-weight-bold" }, "Export Suppliers to Excel"),
                                          createVNode("div", { class: "text-body-2 text-medium-emphasis" }, "Download all suppliers as a formatted .xlsx file")
                                        ])
                                      ]),
                                      createVNode(VList, {
                                        density: "compact",
                                        class: "bg-transparent px-0 mb-4"
                                      }, {
                                        default: withCtx(() => [
                                          (openBlock(), createBlock(Fragment, null, renderList(exportInfo, (info) => {
                                            return createVNode(VListItem, {
                                              class: "px-0",
                                              key: info.title
                                            }, {
                                              prepend: withCtx(() => [
                                                createVNode(VIcon, {
                                                  color: info.color,
                                                  size: "22"
                                                }, {
                                                  default: withCtx(() => [
                                                    createTextVNode(toDisplayString(info.icon), 1)
                                                  ]),
                                                  _: 2
                                                }, 1032, ["color"])
                                              ]),
                                              default: withCtx(() => [
                                                createVNode(VListItemTitle, { class: "text-body-1 font-weight-medium" }, {
                                                  default: withCtx(() => [
                                                    createTextVNode(toDisplayString(info.title), 1)
                                                  ]),
                                                  _: 2
                                                }, 1024),
                                                createVNode(VListItemSubtitle, { class: "text-body-2 text-medium-emphasis" }, {
                                                  default: withCtx(() => [
                                                    createTextVNode(toDisplayString(info.subtitle), 1)
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
                                      createVNode(VBtn, {
                                        color: "success",
                                        "prepend-icon": "mdi-microsoft-excel",
                                        block: "",
                                        size: "x-large",
                                        loading: unref(exporting),
                                        onClick: doExport
                                      }, {
                                        default: withCtx(() => [
                                          createTextVNode(" Download .xlsx ")
                                        ]),
                                        _: 1
                                      }, 8, ["loading"])
                                    ]),
                                    _: 1
                                  })
                                ]),
                                _: 1
                              }),
                              createVNode(VCol, {
                                cols: "12",
                                lg: "5"
                              }, {
                                default: withCtx(() => [
                                  createVNode(VCard, {
                                    rounded: "xl",
                                    flat: "",
                                    border: "",
                                    class: "pa-6 h-100"
                                  }, {
                                    default: withCtx(() => [
                                      createVNode("div", { class: "text-h6 font-weight-bold mb-4" }, [
                                        createVNode(VIcon, {
                                          class: "mr-1",
                                          color: "primary"
                                        }, {
                                          default: withCtx(() => [
                                            createTextVNode("mdi-filter-variant")
                                          ]),
                                          _: 1
                                        }),
                                        createTextVNode("Active Filters")
                                      ]),
                                      unref(activeFilterChips).length === 0 ? (openBlock(), createBlock("div", {
                                        key: 0,
                                        class: "text-body-2 text-medium-emphasis pa-4 text-center"
                                      }, "No filters active — export will include all suppliers.")) : (openBlock(), createBlock("div", {
                                        key: 1,
                                        class: "d-flex flex-wrap ga-2"
                                      }, [
                                        (openBlock(true), createBlock(Fragment, null, renderList(unref(activeFilterChips), (chip) => {
                                          return openBlock(), createBlock(VChip, {
                                            key: chip.label,
                                            size: "small",
                                            color: chip.color,
                                            variant: "tonal"
                                          }, {
                                            default: withCtx(() => [
                                              createTextVNode(toDisplayString(chip.label), 1)
                                            ]),
                                            _: 2
                                          }, 1032, ["color"]);
                                        }), 128))
                                      ])),
                                      createVNode(VAlert, {
                                        type: "info",
                                        variant: "tonal",
                                        density: "compact",
                                        class: "mt-5",
                                        rounded: "lg"
                                      }, {
                                        default: withCtx(() => [
                                          createTextVNode(" Filters carried over from the Suppliers page. Return there to change them, then re-open Import / Export. ")
                                        ]),
                                        _: 1
                                      }),
                                      createVNode(VBtn, {
                                        variant: "text",
                                        color: "primary",
                                        "prepend-icon": "mdi-arrow-left",
                                        class: "mt-2",
                                        onClick: ($event) => ("navigateTo" in _ctx ? _ctx.navigateTo : unref(navigateTo))("/suppliers")
                                      }, {
                                        default: withCtx(() => [
                                          createTextVNode("Back to Suppliers")
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
                        ];
                      }
                    }),
                    _: 1
                  }, _parent3, _scopeId2));
                } else {
                  return [
                    createVNode(VWindowItem, { value: "import" }, {
                      default: withCtx(() => [
                        createVNode(VCard, {
                          rounded: "xl",
                          flat: "",
                          border: "",
                          class: "pa-6 mb-6"
                        }, {
                          default: withCtx(() => [
                            createVNode("div", { class: "d-flex align-center ga-3 mb-4 flex-wrap" }, [
                              createVNode(VAvatar, {
                                color: "primary-lighten-5",
                                size: "36",
                                rounded: "lg"
                              }, {
                                default: withCtx(() => [
                                  createVNode(VIcon, {
                                    color: "primary",
                                    size: "20"
                                  }, {
                                    default: withCtx(() => [
                                      createTextVNode("mdi-numeric-1-circle")
                                    ]),
                                    _: 1
                                  })
                                ]),
                                _: 1
                              }),
                              createVNode("div", null, [
                                createVNode("div", { class: "text-h6 font-weight-bold" }, "Download the Template"),
                                createVNode("div", { class: "text-body-2 text-medium-emphasis" }, " Pre-fill the workbook so column headers are recognized correctly ")
                              ]),
                              createVNode(VSpacer),
                              createVNode(VBtn, {
                                color: "primary",
                                variant: "outlined",
                                "prepend-icon": "mdi-download",
                                onClick: downloadTemplate,
                                loading: unref(downloadingTemplate),
                                size: "large"
                              }, {
                                default: withCtx(() => [
                                  createTextVNode(" Download Template (.xlsx) ")
                                ]),
                                _: 1
                              }, 8, ["loading"])
                            ]),
                            createVNode(VAlert, {
                              type: "info",
                              variant: "tonal",
                              density: "compact",
                              rounded: "lg"
                            }, {
                              default: withCtx(() => [
                                createTextVNode(" Each row maps to one supplier. "),
                                createVNode("strong", null, "Supplier Code is optional"),
                                createTextVNode(" — blank codes are auto-generated. Existing codes are updated. ")
                              ]),
                              _: 1
                            })
                          ]),
                          _: 1
                        }),
                        createVNode(VCard, {
                          rounded: "xl",
                          flat: "",
                          border: "",
                          class: "pa-6 mb-6"
                        }, {
                          default: withCtx(() => [
                            createVNode("div", { class: "d-flex align-center ga-3 mb-5 flex-wrap" }, [
                              createVNode(VAvatar, {
                                color: "primary-lighten-5",
                                size: "36",
                                rounded: "lg"
                              }, {
                                default: withCtx(() => [
                                  createVNode(VIcon, {
                                    color: "primary",
                                    size: "20"
                                  }, {
                                    default: withCtx(() => [
                                      createTextVNode("mdi-numeric-2-circle")
                                    ]),
                                    _: 1
                                  })
                                ]),
                                _: 1
                              }),
                              createVNode("div", null, [
                                createVNode("div", { class: "text-h6 font-weight-bold" }, "Upload & Preview"),
                                createVNode("div", { class: "text-body-2 text-medium-emphasis" }, " Drag & drop your completed workbook — review & edit rows before saving ")
                              ])
                            ]),
                            createVNode("div", {
                              class: ["upload-zone d-flex flex-column align-center justify-center ga-4 pa-10 mb-5 cursor-pointer", { "upload-zone-active": unref(isDragging), "upload-zone-has-file": unref(selectedFile) }],
                              onClick: openFileDialog,
                              onDragover: withModifiers(($event) => isDragging.value = true, ["prevent"]),
                              onDragenter: withModifiers(($event) => isDragging.value = true, ["prevent"]),
                              onDragleave: withModifiers(($event) => isDragging.value = false, ["prevent"]),
                              onDrop: withModifiers(onDrop, ["prevent"])
                            }, [
                              createVNode("input", {
                                ref_key: "fileInput",
                                ref: fileInput,
                                type: "file",
                                accept: ".xlsx,.xlsm",
                                hidden: "",
                                onChange: onFileSelected
                              }, null, 544),
                              createVNode(VAvatar, {
                                color: unref(selectedFile) ? "success-lighten-5" : "grey-lighten-3",
                                size: "72",
                                rounded: "xl"
                              }, {
                                default: withCtx(() => [
                                  createVNode(VIcon, {
                                    color: unref(selectedFile) ? "success" : "grey",
                                    size: "40"
                                  }, {
                                    default: withCtx(() => [
                                      createTextVNode(toDisplayString(unref(selectedFile) ? "mdi-microsoft-excel" : "mdi-cloud-upload-outline"), 1)
                                    ]),
                                    _: 1
                                  }, 8, ["color"])
                                ]),
                                _: 1
                              }, 8, ["color"]),
                              !unref(selectedFile) ? (openBlock(), createBlock(Fragment, { key: 0 }, [
                                createVNode("div", { class: "text-h6 font-weight-bold" }, [
                                  createTextVNode("Drop your .xlsx here or "),
                                  createVNode("span", { class: "text-primary" }, "browse")
                                ]),
                                createVNode("div", { class: "text-body-2 text-medium-emphasis" }, "Only .xlsx files · max 20MB · Supplier Code optional")
                              ], 64)) : (openBlock(), createBlock(Fragment, { key: 1 }, [
                                createVNode("div", {
                                  class: "text-h6 font-weight-bold",
                                  style: { "word-break": "break-all" }
                                }, toDisplayString(unref(selectedFile).name), 1),
                                createVNode("div", { class: "text-body-2 text-medium-emphasis" }, toDisplayString(formatSize(unref(selectedFile).size)), 1)
                              ], 64))
                            ], 42, ["onDragover", "onDragenter", "onDragleave"]),
                            unref(selectedFile) ? (openBlock(), createBlock("div", {
                              key: 0,
                              class: "d-flex ga-3 flex-wrap"
                            }, [
                              createVNode(VBtn, {
                                color: "primary",
                                "prepend-icon": "mdi-eye-outline",
                                loading: unref(parsing),
                                disabled: unref(parsing) || !!unref(preview),
                                block: "",
                                size: "large",
                                onClick: parseFile
                              }, {
                                default: withCtx(() => [
                                  createTextVNode(" Preview & Edit ")
                                ]),
                                _: 1
                              }, 8, ["loading", "disabled"]),
                              createVNode(VBtn, {
                                variant: "outlined",
                                icon: "mdi-close",
                                size: "large",
                                onClick: resetFile,
                                disabled: unref(parsing) || unref(saving),
                                "aria-label": "Remove file"
                              }, null, 8, ["disabled"])
                            ])) : createCommentVNode("", true)
                          ]),
                          _: 1
                        }),
                        createVNode(VScaleTransition, null, {
                          default: withCtx(() => [
                            unref(preview) ? (openBlock(), createBlock(VCard, {
                              key: 0,
                              rounded: "xl",
                              flat: "",
                              border: "",
                              class: "pa-6 mb-6"
                            }, {
                              default: withCtx(() => [
                                createVNode("div", { class: "d-flex align-center ga-3 mb-5 flex-wrap" }, [
                                  createVNode(VAvatar, {
                                    color: "success-lighten-5",
                                    size: "36",
                                    rounded: "lg"
                                  }, {
                                    default: withCtx(() => [
                                      createVNode(VIcon, {
                                        color: "success",
                                        size: "20"
                                      }, {
                                        default: withCtx(() => [
                                          createTextVNode("mdi-numeric-3-circle")
                                        ]),
                                        _: 1
                                      })
                                    ]),
                                    _: 1
                                  }),
                                  createVNode("div", null, [
                                    createVNode("div", { class: "text-h6 font-weight-bold" }, "Preview & Edit Rows"),
                                    createVNode("div", { class: "text-body-2 text-medium-emphasis" }, toDisplayString(unref(previewRows).length) + " row(s) · " + toDisplayString(unref(preview).skipped) + " empty row(s) skipped · click any cell to edit ", 1)
                                  ]),
                                  createVNode(VSpacer),
                                  createVNode(VBtn, {
                                    variant: "text",
                                    size: "small",
                                    "prepend-icon": "mdi-plus",
                                    onClick: addRow,
                                    disabled: unref(saving)
                                  }, {
                                    default: withCtx(() => [
                                      createTextVNode("Add Row")
                                    ]),
                                    _: 1
                                  }, 8, ["disabled"]),
                                  createVNode(VBtn, {
                                    variant: "text",
                                    size: "small",
                                    color: "error",
                                    "prepend-icon": "mdi-close",
                                    onClick: cancelPreview,
                                    disabled: unref(saving)
                                  }, {
                                    default: withCtx(() => [
                                      createTextVNode("Cancel")
                                    ]),
                                    _: 1
                                  }, 8, ["disabled"])
                                ]),
                                unref(parseErrors).length > 0 ? (openBlock(), createBlock(VAlert, {
                                  key: 0,
                                  type: "warning",
                                  variant: "tonal",
                                  density: "compact",
                                  class: "mb-4",
                                  rounded: "lg"
                                }, {
                                  default: withCtx(() => [
                                    createTextVNode(toDisplayString(unref(parseErrors).length) + " parse warning(s). Rows with issues are highlighted — fix or remove them before saving. ", 1)
                                  ]),
                                  _: 1
                                })) : createCommentVNode("", true),
                                createVNode("div", { class: "overflow-x-auto" }, [
                                  createVNode(VTable, {
                                    density: "compact",
                                    class: "preview-table"
                                  }, {
                                    default: withCtx(() => [
                                      createVNode("thead", { class: "bg-grey-lighten-4" }, [
                                        createVNode("tr", null, [
                                          createVNode("th", { style: { "min-width": "40px" } }, "#"),
                                          createVNode("th", { style: { "min-width": "130px" } }, "Code"),
                                          createVNode("th", { style: { "min-width": "180px" } }, "Name *"),
                                          createVNode("th", { style: { "min-width": "150px" } }, "Contact Person"),
                                          createVNode("th", { style: { "min-width": "180px" } }, "Email"),
                                          createVNode("th", { style: { "min-width": "130px" } }, "Phone"),
                                          createVNode("th", { style: { "min-width": "120px" } }, "City"),
                                          createVNode("th", { style: { "min-width": "120px" } }, "Country"),
                                          createVNode("th", { style: { "min-width": "110px" } }, "Payment Terms"),
                                          createVNode("th", { style: { "min-width": "100px" } }, "Lead (days)"),
                                          createVNode("th", { style: { "min-width": "90px" } }, "Active"),
                                          createVNode("th", { style: { "min-width": "56px" } })
                                        ])
                                      ]),
                                      createVNode("tbody", null, [
                                        (openBlock(true), createBlock(Fragment, null, renderList(unref(previewRows), (row, i) => {
                                          return openBlock(), createBlock("tr", {
                                            key: i,
                                            class: rowInvalid(row) ? "bg-error-lighten-5" : ""
                                          }, [
                                            createVNode("td", { class: "text-caption text-disabled" }, toDisplayString(i + 1), 1),
                                            createVNode("td", null, [
                                              createVNode(VTextField, {
                                                modelValue: row.supplier_code,
                                                "onUpdate:modelValue": ($event) => row.supplier_code = $event,
                                                variant: "outlined",
                                                density: "compact",
                                                "hide-details": "",
                                                placeholder: "auto",
                                                class: "preview-input"
                                              }, null, 8, ["modelValue", "onUpdate:modelValue"])
                                            ]),
                                            createVNode("td", null, [
                                              createVNode(VTextField, {
                                                modelValue: row.name,
                                                "onUpdate:modelValue": ($event) => row.name = $event,
                                                variant: "outlined",
                                                density: "compact",
                                                "hide-details": "",
                                                class: "preview-input"
                                              }, null, 8, ["modelValue", "onUpdate:modelValue"])
                                            ]),
                                            createVNode("td", null, [
                                              createVNode(VTextField, {
                                                modelValue: row.contact_person,
                                                "onUpdate:modelValue": ($event) => row.contact_person = $event,
                                                variant: "outlined",
                                                density: "compact",
                                                "hide-details": "",
                                                class: "preview-input"
                                              }, null, 8, ["modelValue", "onUpdate:modelValue"])
                                            ]),
                                            createVNode("td", null, [
                                              createVNode(VTextField, {
                                                modelValue: row.email,
                                                "onUpdate:modelValue": ($event) => row.email = $event,
                                                variant: "outlined",
                                                density: "compact",
                                                "hide-details": "",
                                                class: "preview-input"
                                              }, null, 8, ["modelValue", "onUpdate:modelValue"])
                                            ]),
                                            createVNode("td", null, [
                                              createVNode(VTextField, {
                                                modelValue: row.phone,
                                                "onUpdate:modelValue": ($event) => row.phone = $event,
                                                variant: "outlined",
                                                density: "compact",
                                                "hide-details": "",
                                                class: "preview-input"
                                              }, null, 8, ["modelValue", "onUpdate:modelValue"])
                                            ]),
                                            createVNode("td", null, [
                                              createVNode(VTextField, {
                                                modelValue: row.city,
                                                "onUpdate:modelValue": ($event) => row.city = $event,
                                                variant: "outlined",
                                                density: "compact",
                                                "hide-details": "",
                                                class: "preview-input"
                                              }, null, 8, ["modelValue", "onUpdate:modelValue"])
                                            ]),
                                            createVNode("td", null, [
                                              createVNode(VTextField, {
                                                modelValue: row.country,
                                                "onUpdate:modelValue": ($event) => row.country = $event,
                                                variant: "outlined",
                                                density: "compact",
                                                "hide-details": "",
                                                class: "preview-input"
                                              }, null, 8, ["modelValue", "onUpdate:modelValue"])
                                            ]),
                                            createVNode("td", null, [
                                              createVNode(VTextField, {
                                                modelValue: row.payment_terms,
                                                "onUpdate:modelValue": ($event) => row.payment_terms = $event,
                                                variant: "outlined",
                                                density: "compact",
                                                "hide-details": "",
                                                class: "preview-input"
                                              }, null, 8, ["modelValue", "onUpdate:modelValue"])
                                            ]),
                                            createVNode("td", null, [
                                              createVNode(VTextField, {
                                                modelValue: row.lead_time_days,
                                                "onUpdate:modelValue": ($event) => row.lead_time_days = $event,
                                                type: "number",
                                                step: "1",
                                                variant: "outlined",
                                                density: "compact",
                                                "hide-details": "",
                                                class: "preview-input"
                                              }, null, 8, ["modelValue", "onUpdate:modelValue"])
                                            ]),
                                            createVNode("td", null, [
                                              createVNode(VSwitch, {
                                                modelValue: row.is_active,
                                                "onUpdate:modelValue": ($event) => row.is_active = $event,
                                                color: "success",
                                                density: "compact",
                                                "hide-details": "",
                                                inset: ""
                                              }, null, 8, ["modelValue", "onUpdate:modelValue"])
                                            ]),
                                            createVNode("td", null, [
                                              createVNode(VBtn, {
                                                icon: "mdi-delete",
                                                size: "small",
                                                variant: "text",
                                                color: "error",
                                                onClick: ($event) => removeRow(i)
                                              }, null, 8, ["onClick"])
                                            ])
                                          ], 2);
                                        }), 128))
                                      ])
                                    ]),
                                    _: 1
                                  })
                                ]),
                                createVNode("div", { class: "d-flex align-center ga-3 mt-5 flex-wrap" }, [
                                  createVNode(VBtn, {
                                    color: "success",
                                    "prepend-icon": "mdi-content-save",
                                    loading: unref(saving),
                                    disabled: unref(saving) || unref(previewRows).length === 0,
                                    size: "large",
                                    onClick: saveBulk
                                  }, {
                                    default: withCtx(() => [
                                      createTextVNode(" Save " + toDisplayString(unref(previewRows).length) + " Supplier(s) ", 1)
                                    ]),
                                    _: 1
                                  }, 8, ["loading", "disabled"]),
                                  unref(emptyCodeCount) > 0 ? (openBlock(), createBlock("span", {
                                    key: 0,
                                    class: "text-body-2 text-medium-emphasis"
                                  }, toDisplayString(unref(emptyCodeCount)) + " row(s) will get auto-generated codes when saved ", 1)) : createCommentVNode("", true)
                                ])
                              ]),
                              _: 1
                            })) : createCommentVNode("", true)
                          ]),
                          _: 1
                        }),
                        createVNode(VSlideYTransition, null, {
                          default: withCtx(() => [
                            unref(importResult) ? (openBlock(), createBlock(VCard, {
                              key: 0,
                              rounded: "xl",
                              flat: "",
                              border: "",
                              class: "pa-6",
                              style: unref(resultBorderStyle)
                            }, {
                              default: withCtx(() => [
                                createVNode("div", { class: "d-flex align-center ga-3 mb-5 flex-wrap" }, [
                                  createVNode(VAvatar, {
                                    color: unref(importResult).failed > 0 ? "warning-lighten-5" : "success-lighten-5",
                                    size: "48",
                                    rounded: "lg"
                                  }, {
                                    default: withCtx(() => [
                                      createVNode(VIcon, {
                                        color: unref(importResult).failed > 0 ? "warning" : "success",
                                        size: "28"
                                      }, {
                                        default: withCtx(() => [
                                          createTextVNode(toDisplayString(unref(importResult).failed > 0 ? "mdi-alert" : "mdi-check-circle"), 1)
                                        ]),
                                        _: 1
                                      }, 8, ["color"])
                                    ]),
                                    _: 1
                                  }, 8, ["color"]),
                                  createVNode("div", null, [
                                    createVNode("div", { class: "text-h6 font-weight-bold" }, toDisplayString(unref(importResult).failed > 0 ? "Import Finished (with issues)" : "Import Successful"), 1),
                                    createVNode("div", { class: "text-body-2 text-medium-emphasis" }, toDisplayString(unref(importResult).total_processed) + " row(s) processed", 1)
                                  ]),
                                  createVNode(VSpacer),
                                  unref(importResult).failed === 0 ? (openBlock(), createBlock(VBtn, {
                                    key: 0,
                                    color: "success",
                                    "prepend-icon": "mdi-truck-outline",
                                    onClick: ($event) => ("navigateTo" in _ctx ? _ctx.navigateTo : unref(navigateTo))("/suppliers?imported=1")
                                  }, {
                                    default: withCtx(() => [
                                      createTextVNode(" View Suppliers ")
                                    ]),
                                    _: 1
                                  }, 8, ["onClick"])) : createCommentVNode("", true),
                                  createVNode(VBtn, {
                                    variant: "text",
                                    "prepend-icon": "mdi-refresh",
                                    onClick: resetAll
                                  }, {
                                    default: withCtx(() => [
                                      createTextVNode("Start Over")
                                    ]),
                                    _: 1
                                  })
                                ]),
                                createVNode(VRow, {
                                  dense: "",
                                  class: "mb-5"
                                }, {
                                  default: withCtx(() => [
                                    createVNode(VCol, {
                                      cols: "6",
                                      sm: "3"
                                    }, {
                                      default: withCtx(() => [
                                        createVNode(VCard, {
                                          variant: "outlined",
                                          rounded: "lg",
                                          class: "pa-4 text-center",
                                          flat: ""
                                        }, {
                                          default: withCtx(() => [
                                            createVNode("div", { class: "text-caption text-medium-emphasis text-uppercase" }, "Created"),
                                            createVNode("div", { class: "text-h4 font-weight-bold text-success mt-1" }, toDisplayString(unref(importResult).created), 1)
                                          ]),
                                          _: 1
                                        })
                                      ]),
                                      _: 1
                                    }),
                                    createVNode(VCol, {
                                      cols: "6",
                                      sm: "3"
                                    }, {
                                      default: withCtx(() => [
                                        createVNode(VCard, {
                                          variant: "outlined",
                                          rounded: "lg",
                                          class: "pa-4 text-center",
                                          flat: ""
                                        }, {
                                          default: withCtx(() => [
                                            createVNode("div", { class: "text-caption text-medium-emphasis text-uppercase" }, "Updated"),
                                            createVNode("div", { class: "text-h4 font-weight-bold text-primary mt-1" }, toDisplayString(unref(importResult).updated), 1)
                                          ]),
                                          _: 1
                                        })
                                      ]),
                                      _: 1
                                    }),
                                    createVNode(VCol, {
                                      cols: "6",
                                      sm: "3"
                                    }, {
                                      default: withCtx(() => [
                                        createVNode(VCard, {
                                          variant: "outlined",
                                          rounded: "lg",
                                          class: "pa-4 text-center",
                                          flat: ""
                                        }, {
                                          default: withCtx(() => [
                                            createVNode("div", { class: "text-caption text-medium-emphasis text-uppercase" }, "Failed"),
                                            createVNode("div", {
                                              class: ["text-h4 font-weight-bold mt-1", unref(importResult).failed > 0 ? "text-error" : "text-disabled"]
                                            }, toDisplayString(unref(importResult).failed), 3)
                                          ]),
                                          _: 1
                                        })
                                      ]),
                                      _: 1
                                    }),
                                    createVNode(VCol, {
                                      cols: "6",
                                      sm: "3"
                                    }, {
                                      default: withCtx(() => [
                                        createVNode(VCard, {
                                          variant: "outlined",
                                          rounded: "lg",
                                          class: "pa-4 text-center",
                                          flat: ""
                                        }, {
                                          default: withCtx(() => [
                                            createVNode("div", { class: "text-caption text-medium-emphasis text-uppercase" }, "Processed"),
                                            createVNode("div", { class: "text-h4 font-weight-bold mt-1" }, toDisplayString(unref(importResult).total_processed), 1)
                                          ]),
                                          _: 1
                                        })
                                      ]),
                                      _: 1
                                    })
                                  ]),
                                  _: 1
                                }),
                                unref(importResult).errors && unref(importResult).errors.length > 0 ? (openBlock(), createBlock("div", { key: 0 }, [
                                  createVNode("div", { class: "d-flex align-center ga-2 mb-3" }, [
                                    createVNode(VIcon, {
                                      size: "18",
                                      color: "error"
                                    }, {
                                      default: withCtx(() => [
                                        createTextVNode("mdi-alert-circle-outline")
                                      ]),
                                      _: 1
                                    }),
                                    createVNode("span", { class: "text-body-1 font-weight-bold" }, "Errors (" + toDisplayString(unref(importResult).errors.length) + toDisplayString(unref(importResult).errors_truncated ? "+" : "") + ")", 1)
                                  ]),
                                  createVNode(VList, {
                                    variant: "outlined",
                                    rounded: "lg",
                                    density: "compact",
                                    class: "bg-surface",
                                    "max-height": "320",
                                    lines: "two"
                                  }, {
                                    default: withCtx(() => [
                                      (openBlock(true), createBlock(Fragment, null, renderList(unref(importResult).errors, (err, idx) => {
                                        return openBlock(), createBlock(VListItem, { key: idx }, {
                                          prepend: withCtx(() => [
                                            createVNode(VAvatar, {
                                              color: "error-lighten-5",
                                              size: "32",
                                              rounded: "lg"
                                            }, {
                                              default: withCtx(() => [
                                                createVNode("span", { class: "text-caption font-weight-bold text-error" }, "#" + toDisplayString(err.row), 1)
                                              ]),
                                              _: 2
                                            }, 1024)
                                          ]),
                                          default: withCtx(() => [
                                            createVNode(VListItemSubtitle, { class: "text-body-2 text-error" }, {
                                              default: withCtx(() => [
                                                createTextVNode(toDisplayString(err.detail), 1)
                                              ]),
                                              _: 2
                                            }, 1024)
                                          ]),
                                          _: 2
                                        }, 1024);
                                      }), 128))
                                    ]),
                                    _: 1
                                  })
                                ])) : createCommentVNode("", true)
                              ]),
                              _: 1
                            }, 8, ["style"])) : createCommentVNode("", true)
                          ]),
                          _: 1
                        })
                      ]),
                      _: 1
                    }),
                    createVNode(VWindowItem, { value: "export" }, {
                      default: withCtx(() => [
                        createVNode(VRow, null, {
                          default: withCtx(() => [
                            createVNode(VCol, {
                              cols: "12",
                              lg: "7"
                            }, {
                              default: withCtx(() => [
                                createVNode(VCard, {
                                  rounded: "xl",
                                  flat: "",
                                  border: "",
                                  class: "pa-6 h-100"
                                }, {
                                  default: withCtx(() => [
                                    createVNode("div", { class: "d-flex align-center ga-3 mb-5" }, [
                                      createVNode(VAvatar, {
                                        color: "success-lighten-5",
                                        size: "48",
                                        rounded: "lg"
                                      }, {
                                        default: withCtx(() => [
                                          createVNode(VIcon, {
                                            color: "success",
                                            size: "26"
                                          }, {
                                            default: withCtx(() => [
                                              createTextVNode("mdi-file-excel-outline")
                                            ]),
                                            _: 1
                                          })
                                        ]),
                                        _: 1
                                      }),
                                      createVNode("div", null, [
                                        createVNode("div", { class: "text-h6 font-weight-bold" }, "Export Suppliers to Excel"),
                                        createVNode("div", { class: "text-body-2 text-medium-emphasis" }, "Download all suppliers as a formatted .xlsx file")
                                      ])
                                    ]),
                                    createVNode(VList, {
                                      density: "compact",
                                      class: "bg-transparent px-0 mb-4"
                                    }, {
                                      default: withCtx(() => [
                                        (openBlock(), createBlock(Fragment, null, renderList(exportInfo, (info) => {
                                          return createVNode(VListItem, {
                                            class: "px-0",
                                            key: info.title
                                          }, {
                                            prepend: withCtx(() => [
                                              createVNode(VIcon, {
                                                color: info.color,
                                                size: "22"
                                              }, {
                                                default: withCtx(() => [
                                                  createTextVNode(toDisplayString(info.icon), 1)
                                                ]),
                                                _: 2
                                              }, 1032, ["color"])
                                            ]),
                                            default: withCtx(() => [
                                              createVNode(VListItemTitle, { class: "text-body-1 font-weight-medium" }, {
                                                default: withCtx(() => [
                                                  createTextVNode(toDisplayString(info.title), 1)
                                                ]),
                                                _: 2
                                              }, 1024),
                                              createVNode(VListItemSubtitle, { class: "text-body-2 text-medium-emphasis" }, {
                                                default: withCtx(() => [
                                                  createTextVNode(toDisplayString(info.subtitle), 1)
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
                                    createVNode(VBtn, {
                                      color: "success",
                                      "prepend-icon": "mdi-microsoft-excel",
                                      block: "",
                                      size: "x-large",
                                      loading: unref(exporting),
                                      onClick: doExport
                                    }, {
                                      default: withCtx(() => [
                                        createTextVNode(" Download .xlsx ")
                                      ]),
                                      _: 1
                                    }, 8, ["loading"])
                                  ]),
                                  _: 1
                                })
                              ]),
                              _: 1
                            }),
                            createVNode(VCol, {
                              cols: "12",
                              lg: "5"
                            }, {
                              default: withCtx(() => [
                                createVNode(VCard, {
                                  rounded: "xl",
                                  flat: "",
                                  border: "",
                                  class: "pa-6 h-100"
                                }, {
                                  default: withCtx(() => [
                                    createVNode("div", { class: "text-h6 font-weight-bold mb-4" }, [
                                      createVNode(VIcon, {
                                        class: "mr-1",
                                        color: "primary"
                                      }, {
                                        default: withCtx(() => [
                                          createTextVNode("mdi-filter-variant")
                                        ]),
                                        _: 1
                                      }),
                                      createTextVNode("Active Filters")
                                    ]),
                                    unref(activeFilterChips).length === 0 ? (openBlock(), createBlock("div", {
                                      key: 0,
                                      class: "text-body-2 text-medium-emphasis pa-4 text-center"
                                    }, "No filters active — export will include all suppliers.")) : (openBlock(), createBlock("div", {
                                      key: 1,
                                      class: "d-flex flex-wrap ga-2"
                                    }, [
                                      (openBlock(true), createBlock(Fragment, null, renderList(unref(activeFilterChips), (chip) => {
                                        return openBlock(), createBlock(VChip, {
                                          key: chip.label,
                                          size: "small",
                                          color: chip.color,
                                          variant: "tonal"
                                        }, {
                                          default: withCtx(() => [
                                            createTextVNode(toDisplayString(chip.label), 1)
                                          ]),
                                          _: 2
                                        }, 1032, ["color"]);
                                      }), 128))
                                    ])),
                                    createVNode(VAlert, {
                                      type: "info",
                                      variant: "tonal",
                                      density: "compact",
                                      class: "mt-5",
                                      rounded: "lg"
                                    }, {
                                      default: withCtx(() => [
                                        createTextVNode(" Filters carried over from the Suppliers page. Return there to change them, then re-open Import / Export. ")
                                      ]),
                                      _: 1
                                    }),
                                    createVNode(VBtn, {
                                      variant: "text",
                                      color: "primary",
                                      "prepend-icon": "mdi-arrow-left",
                                      class: "mt-2",
                                      onClick: ($event) => ("navigateTo" in _ctx ? _ctx.navigateTo : unref(navigateTo))("/suppliers")
                                    }, {
                                      default: withCtx(() => [
                                        createTextVNode("Back to Suppliers")
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
              createVNode("div", { class: "d-flex align-center ga-2 mb-4 flex-wrap" }, [
                createVNode(VBtn, {
                  variant: "text",
                  size: "small",
                  "prepend-icon": "mdi-arrow-left",
                  onClick: goBack
                }, {
                  default: withCtx(() => [
                    createTextVNode(" Back to Suppliers ")
                  ]),
                  _: 1
                }),
                createVNode(VIcon, {
                  size: "14",
                  class: "text-disabled"
                }, {
                  default: withCtx(() => [
                    createTextVNode("mdi-chevron-right")
                  ]),
                  _: 1
                }),
                createVNode("span", { class: "text-body-2 text-medium-emphasis" }, "Excel Import / Export")
              ]),
              createVNode(VRow, { class: "d-flex align-center justify-space-between mb-6" }, {
                default: withCtx(() => [
                  createVNode(VCol, {
                    cols: "12",
                    sm: "7"
                  }, {
                    default: withCtx(() => [
                      createVNode("div", { class: "d-flex align-center ga-3" }, [
                        createVNode(VAvatar, {
                          color: "success",
                          size: "48",
                          rounded: "lg"
                        }, {
                          default: withCtx(() => [
                            createVNode(VIcon, { size: "26" }, {
                              default: withCtx(() => [
                                createTextVNode("mdi-microsoft-excel")
                              ]),
                              _: 1
                            })
                          ]),
                          _: 1
                        }),
                        createVNode("div", null, [
                          createVNode("div", { class: "text-h5 font-weight-bold" }, "Excel Import / Export"),
                          createVNode("div", { class: "text-body-2 text-medium-emphasis" }, " Bulk upload & export suppliers via .xlsx workbook ")
                        ])
                      ])
                    ]),
                    _: 1
                  }),
                  createVNode(VCol, {
                    cols: "12",
                    sm: "5",
                    class: "d-flex justify-end ga-2 flex-wrap"
                  }, {
                    default: withCtx(() => [
                      createVNode(VBtn, {
                        variant: "outlined",
                        "prepend-icon": "mdi-truck-outline",
                        onClick: ($event) => ("navigateTo" in _ctx ? _ctx.navigateTo : unref(navigateTo))("/suppliers")
                      }, {
                        default: withCtx(() => [
                          createTextVNode(" View Suppliers ")
                        ]),
                        _: 1
                      }, 8, ["onClick"])
                    ]),
                    _: 1
                  })
                ]),
                _: 1
              }),
              createVNode(VCard, {
                rounded: "xl",
                flat: "",
                border: "",
                class: "mb-6 overflow-hidden"
              }, {
                default: withCtx(() => [
                  createVNode(VTabs, {
                    modelValue: unref(mode),
                    "onUpdate:modelValue": ($event) => isRef(mode) ? mode.value = $event : null,
                    color: "success",
                    density: "comfortable",
                    "show-arrows": ""
                  }, {
                    default: withCtx(() => [
                      createVNode(VTab, {
                        value: "import",
                        "prepend-icon": "mdi-file-import-outline"
                      }, {
                        default: withCtx(() => [
                          createTextVNode("Import")
                        ]),
                        _: 1
                      }),
                      createVNode(VTab, {
                        value: "export",
                        "prepend-icon": "mdi-file-export-outline"
                      }, {
                        default: withCtx(() => [
                          createTextVNode("Export")
                        ]),
                        _: 1
                      })
                    ]),
                    _: 1
                  }, 8, ["modelValue", "onUpdate:modelValue"])
                ]),
                _: 1
              }),
              createVNode(VWindow, {
                modelValue: unref(mode),
                "onUpdate:modelValue": ($event) => isRef(mode) ? mode.value = $event : null
              }, {
                default: withCtx(() => [
                  createVNode(VWindowItem, { value: "import" }, {
                    default: withCtx(() => [
                      createVNode(VCard, {
                        rounded: "xl",
                        flat: "",
                        border: "",
                        class: "pa-6 mb-6"
                      }, {
                        default: withCtx(() => [
                          createVNode("div", { class: "d-flex align-center ga-3 mb-4 flex-wrap" }, [
                            createVNode(VAvatar, {
                              color: "primary-lighten-5",
                              size: "36",
                              rounded: "lg"
                            }, {
                              default: withCtx(() => [
                                createVNode(VIcon, {
                                  color: "primary",
                                  size: "20"
                                }, {
                                  default: withCtx(() => [
                                    createTextVNode("mdi-numeric-1-circle")
                                  ]),
                                  _: 1
                                })
                              ]),
                              _: 1
                            }),
                            createVNode("div", null, [
                              createVNode("div", { class: "text-h6 font-weight-bold" }, "Download the Template"),
                              createVNode("div", { class: "text-body-2 text-medium-emphasis" }, " Pre-fill the workbook so column headers are recognized correctly ")
                            ]),
                            createVNode(VSpacer),
                            createVNode(VBtn, {
                              color: "primary",
                              variant: "outlined",
                              "prepend-icon": "mdi-download",
                              onClick: downloadTemplate,
                              loading: unref(downloadingTemplate),
                              size: "large"
                            }, {
                              default: withCtx(() => [
                                createTextVNode(" Download Template (.xlsx) ")
                              ]),
                              _: 1
                            }, 8, ["loading"])
                          ]),
                          createVNode(VAlert, {
                            type: "info",
                            variant: "tonal",
                            density: "compact",
                            rounded: "lg"
                          }, {
                            default: withCtx(() => [
                              createTextVNode(" Each row maps to one supplier. "),
                              createVNode("strong", null, "Supplier Code is optional"),
                              createTextVNode(" — blank codes are auto-generated. Existing codes are updated. ")
                            ]),
                            _: 1
                          })
                        ]),
                        _: 1
                      }),
                      createVNode(VCard, {
                        rounded: "xl",
                        flat: "",
                        border: "",
                        class: "pa-6 mb-6"
                      }, {
                        default: withCtx(() => [
                          createVNode("div", { class: "d-flex align-center ga-3 mb-5 flex-wrap" }, [
                            createVNode(VAvatar, {
                              color: "primary-lighten-5",
                              size: "36",
                              rounded: "lg"
                            }, {
                              default: withCtx(() => [
                                createVNode(VIcon, {
                                  color: "primary",
                                  size: "20"
                                }, {
                                  default: withCtx(() => [
                                    createTextVNode("mdi-numeric-2-circle")
                                  ]),
                                  _: 1
                                })
                              ]),
                              _: 1
                            }),
                            createVNode("div", null, [
                              createVNode("div", { class: "text-h6 font-weight-bold" }, "Upload & Preview"),
                              createVNode("div", { class: "text-body-2 text-medium-emphasis" }, " Drag & drop your completed workbook — review & edit rows before saving ")
                            ])
                          ]),
                          createVNode("div", {
                            class: ["upload-zone d-flex flex-column align-center justify-center ga-4 pa-10 mb-5 cursor-pointer", { "upload-zone-active": unref(isDragging), "upload-zone-has-file": unref(selectedFile) }],
                            onClick: openFileDialog,
                            onDragover: withModifiers(($event) => isDragging.value = true, ["prevent"]),
                            onDragenter: withModifiers(($event) => isDragging.value = true, ["prevent"]),
                            onDragleave: withModifiers(($event) => isDragging.value = false, ["prevent"]),
                            onDrop: withModifiers(onDrop, ["prevent"])
                          }, [
                            createVNode("input", {
                              ref_key: "fileInput",
                              ref: fileInput,
                              type: "file",
                              accept: ".xlsx,.xlsm",
                              hidden: "",
                              onChange: onFileSelected
                            }, null, 544),
                            createVNode(VAvatar, {
                              color: unref(selectedFile) ? "success-lighten-5" : "grey-lighten-3",
                              size: "72",
                              rounded: "xl"
                            }, {
                              default: withCtx(() => [
                                createVNode(VIcon, {
                                  color: unref(selectedFile) ? "success" : "grey",
                                  size: "40"
                                }, {
                                  default: withCtx(() => [
                                    createTextVNode(toDisplayString(unref(selectedFile) ? "mdi-microsoft-excel" : "mdi-cloud-upload-outline"), 1)
                                  ]),
                                  _: 1
                                }, 8, ["color"])
                              ]),
                              _: 1
                            }, 8, ["color"]),
                            !unref(selectedFile) ? (openBlock(), createBlock(Fragment, { key: 0 }, [
                              createVNode("div", { class: "text-h6 font-weight-bold" }, [
                                createTextVNode("Drop your .xlsx here or "),
                                createVNode("span", { class: "text-primary" }, "browse")
                              ]),
                              createVNode("div", { class: "text-body-2 text-medium-emphasis" }, "Only .xlsx files · max 20MB · Supplier Code optional")
                            ], 64)) : (openBlock(), createBlock(Fragment, { key: 1 }, [
                              createVNode("div", {
                                class: "text-h6 font-weight-bold",
                                style: { "word-break": "break-all" }
                              }, toDisplayString(unref(selectedFile).name), 1),
                              createVNode("div", { class: "text-body-2 text-medium-emphasis" }, toDisplayString(formatSize(unref(selectedFile).size)), 1)
                            ], 64))
                          ], 42, ["onDragover", "onDragenter", "onDragleave"]),
                          unref(selectedFile) ? (openBlock(), createBlock("div", {
                            key: 0,
                            class: "d-flex ga-3 flex-wrap"
                          }, [
                            createVNode(VBtn, {
                              color: "primary",
                              "prepend-icon": "mdi-eye-outline",
                              loading: unref(parsing),
                              disabled: unref(parsing) || !!unref(preview),
                              block: "",
                              size: "large",
                              onClick: parseFile
                            }, {
                              default: withCtx(() => [
                                createTextVNode(" Preview & Edit ")
                              ]),
                              _: 1
                            }, 8, ["loading", "disabled"]),
                            createVNode(VBtn, {
                              variant: "outlined",
                              icon: "mdi-close",
                              size: "large",
                              onClick: resetFile,
                              disabled: unref(parsing) || unref(saving),
                              "aria-label": "Remove file"
                            }, null, 8, ["disabled"])
                          ])) : createCommentVNode("", true)
                        ]),
                        _: 1
                      }),
                      createVNode(VScaleTransition, null, {
                        default: withCtx(() => [
                          unref(preview) ? (openBlock(), createBlock(VCard, {
                            key: 0,
                            rounded: "xl",
                            flat: "",
                            border: "",
                            class: "pa-6 mb-6"
                          }, {
                            default: withCtx(() => [
                              createVNode("div", { class: "d-flex align-center ga-3 mb-5 flex-wrap" }, [
                                createVNode(VAvatar, {
                                  color: "success-lighten-5",
                                  size: "36",
                                  rounded: "lg"
                                }, {
                                  default: withCtx(() => [
                                    createVNode(VIcon, {
                                      color: "success",
                                      size: "20"
                                    }, {
                                      default: withCtx(() => [
                                        createTextVNode("mdi-numeric-3-circle")
                                      ]),
                                      _: 1
                                    })
                                  ]),
                                  _: 1
                                }),
                                createVNode("div", null, [
                                  createVNode("div", { class: "text-h6 font-weight-bold" }, "Preview & Edit Rows"),
                                  createVNode("div", { class: "text-body-2 text-medium-emphasis" }, toDisplayString(unref(previewRows).length) + " row(s) · " + toDisplayString(unref(preview).skipped) + " empty row(s) skipped · click any cell to edit ", 1)
                                ]),
                                createVNode(VSpacer),
                                createVNode(VBtn, {
                                  variant: "text",
                                  size: "small",
                                  "prepend-icon": "mdi-plus",
                                  onClick: addRow,
                                  disabled: unref(saving)
                                }, {
                                  default: withCtx(() => [
                                    createTextVNode("Add Row")
                                  ]),
                                  _: 1
                                }, 8, ["disabled"]),
                                createVNode(VBtn, {
                                  variant: "text",
                                  size: "small",
                                  color: "error",
                                  "prepend-icon": "mdi-close",
                                  onClick: cancelPreview,
                                  disabled: unref(saving)
                                }, {
                                  default: withCtx(() => [
                                    createTextVNode("Cancel")
                                  ]),
                                  _: 1
                                }, 8, ["disabled"])
                              ]),
                              unref(parseErrors).length > 0 ? (openBlock(), createBlock(VAlert, {
                                key: 0,
                                type: "warning",
                                variant: "tonal",
                                density: "compact",
                                class: "mb-4",
                                rounded: "lg"
                              }, {
                                default: withCtx(() => [
                                  createTextVNode(toDisplayString(unref(parseErrors).length) + " parse warning(s). Rows with issues are highlighted — fix or remove them before saving. ", 1)
                                ]),
                                _: 1
                              })) : createCommentVNode("", true),
                              createVNode("div", { class: "overflow-x-auto" }, [
                                createVNode(VTable, {
                                  density: "compact",
                                  class: "preview-table"
                                }, {
                                  default: withCtx(() => [
                                    createVNode("thead", { class: "bg-grey-lighten-4" }, [
                                      createVNode("tr", null, [
                                        createVNode("th", { style: { "min-width": "40px" } }, "#"),
                                        createVNode("th", { style: { "min-width": "130px" } }, "Code"),
                                        createVNode("th", { style: { "min-width": "180px" } }, "Name *"),
                                        createVNode("th", { style: { "min-width": "150px" } }, "Contact Person"),
                                        createVNode("th", { style: { "min-width": "180px" } }, "Email"),
                                        createVNode("th", { style: { "min-width": "130px" } }, "Phone"),
                                        createVNode("th", { style: { "min-width": "120px" } }, "City"),
                                        createVNode("th", { style: { "min-width": "120px" } }, "Country"),
                                        createVNode("th", { style: { "min-width": "110px" } }, "Payment Terms"),
                                        createVNode("th", { style: { "min-width": "100px" } }, "Lead (days)"),
                                        createVNode("th", { style: { "min-width": "90px" } }, "Active"),
                                        createVNode("th", { style: { "min-width": "56px" } })
                                      ])
                                    ]),
                                    createVNode("tbody", null, [
                                      (openBlock(true), createBlock(Fragment, null, renderList(unref(previewRows), (row, i) => {
                                        return openBlock(), createBlock("tr", {
                                          key: i,
                                          class: rowInvalid(row) ? "bg-error-lighten-5" : ""
                                        }, [
                                          createVNode("td", { class: "text-caption text-disabled" }, toDisplayString(i + 1), 1),
                                          createVNode("td", null, [
                                            createVNode(VTextField, {
                                              modelValue: row.supplier_code,
                                              "onUpdate:modelValue": ($event) => row.supplier_code = $event,
                                              variant: "outlined",
                                              density: "compact",
                                              "hide-details": "",
                                              placeholder: "auto",
                                              class: "preview-input"
                                            }, null, 8, ["modelValue", "onUpdate:modelValue"])
                                          ]),
                                          createVNode("td", null, [
                                            createVNode(VTextField, {
                                              modelValue: row.name,
                                              "onUpdate:modelValue": ($event) => row.name = $event,
                                              variant: "outlined",
                                              density: "compact",
                                              "hide-details": "",
                                              class: "preview-input"
                                            }, null, 8, ["modelValue", "onUpdate:modelValue"])
                                          ]),
                                          createVNode("td", null, [
                                            createVNode(VTextField, {
                                              modelValue: row.contact_person,
                                              "onUpdate:modelValue": ($event) => row.contact_person = $event,
                                              variant: "outlined",
                                              density: "compact",
                                              "hide-details": "",
                                              class: "preview-input"
                                            }, null, 8, ["modelValue", "onUpdate:modelValue"])
                                          ]),
                                          createVNode("td", null, [
                                            createVNode(VTextField, {
                                              modelValue: row.email,
                                              "onUpdate:modelValue": ($event) => row.email = $event,
                                              variant: "outlined",
                                              density: "compact",
                                              "hide-details": "",
                                              class: "preview-input"
                                            }, null, 8, ["modelValue", "onUpdate:modelValue"])
                                          ]),
                                          createVNode("td", null, [
                                            createVNode(VTextField, {
                                              modelValue: row.phone,
                                              "onUpdate:modelValue": ($event) => row.phone = $event,
                                              variant: "outlined",
                                              density: "compact",
                                              "hide-details": "",
                                              class: "preview-input"
                                            }, null, 8, ["modelValue", "onUpdate:modelValue"])
                                          ]),
                                          createVNode("td", null, [
                                            createVNode(VTextField, {
                                              modelValue: row.city,
                                              "onUpdate:modelValue": ($event) => row.city = $event,
                                              variant: "outlined",
                                              density: "compact",
                                              "hide-details": "",
                                              class: "preview-input"
                                            }, null, 8, ["modelValue", "onUpdate:modelValue"])
                                          ]),
                                          createVNode("td", null, [
                                            createVNode(VTextField, {
                                              modelValue: row.country,
                                              "onUpdate:modelValue": ($event) => row.country = $event,
                                              variant: "outlined",
                                              density: "compact",
                                              "hide-details": "",
                                              class: "preview-input"
                                            }, null, 8, ["modelValue", "onUpdate:modelValue"])
                                          ]),
                                          createVNode("td", null, [
                                            createVNode(VTextField, {
                                              modelValue: row.payment_terms,
                                              "onUpdate:modelValue": ($event) => row.payment_terms = $event,
                                              variant: "outlined",
                                              density: "compact",
                                              "hide-details": "",
                                              class: "preview-input"
                                            }, null, 8, ["modelValue", "onUpdate:modelValue"])
                                          ]),
                                          createVNode("td", null, [
                                            createVNode(VTextField, {
                                              modelValue: row.lead_time_days,
                                              "onUpdate:modelValue": ($event) => row.lead_time_days = $event,
                                              type: "number",
                                              step: "1",
                                              variant: "outlined",
                                              density: "compact",
                                              "hide-details": "",
                                              class: "preview-input"
                                            }, null, 8, ["modelValue", "onUpdate:modelValue"])
                                          ]),
                                          createVNode("td", null, [
                                            createVNode(VSwitch, {
                                              modelValue: row.is_active,
                                              "onUpdate:modelValue": ($event) => row.is_active = $event,
                                              color: "success",
                                              density: "compact",
                                              "hide-details": "",
                                              inset: ""
                                            }, null, 8, ["modelValue", "onUpdate:modelValue"])
                                          ]),
                                          createVNode("td", null, [
                                            createVNode(VBtn, {
                                              icon: "mdi-delete",
                                              size: "small",
                                              variant: "text",
                                              color: "error",
                                              onClick: ($event) => removeRow(i)
                                            }, null, 8, ["onClick"])
                                          ])
                                        ], 2);
                                      }), 128))
                                    ])
                                  ]),
                                  _: 1
                                })
                              ]),
                              createVNode("div", { class: "d-flex align-center ga-3 mt-5 flex-wrap" }, [
                                createVNode(VBtn, {
                                  color: "success",
                                  "prepend-icon": "mdi-content-save",
                                  loading: unref(saving),
                                  disabled: unref(saving) || unref(previewRows).length === 0,
                                  size: "large",
                                  onClick: saveBulk
                                }, {
                                  default: withCtx(() => [
                                    createTextVNode(" Save " + toDisplayString(unref(previewRows).length) + " Supplier(s) ", 1)
                                  ]),
                                  _: 1
                                }, 8, ["loading", "disabled"]),
                                unref(emptyCodeCount) > 0 ? (openBlock(), createBlock("span", {
                                  key: 0,
                                  class: "text-body-2 text-medium-emphasis"
                                }, toDisplayString(unref(emptyCodeCount)) + " row(s) will get auto-generated codes when saved ", 1)) : createCommentVNode("", true)
                              ])
                            ]),
                            _: 1
                          })) : createCommentVNode("", true)
                        ]),
                        _: 1
                      }),
                      createVNode(VSlideYTransition, null, {
                        default: withCtx(() => [
                          unref(importResult) ? (openBlock(), createBlock(VCard, {
                            key: 0,
                            rounded: "xl",
                            flat: "",
                            border: "",
                            class: "pa-6",
                            style: unref(resultBorderStyle)
                          }, {
                            default: withCtx(() => [
                              createVNode("div", { class: "d-flex align-center ga-3 mb-5 flex-wrap" }, [
                                createVNode(VAvatar, {
                                  color: unref(importResult).failed > 0 ? "warning-lighten-5" : "success-lighten-5",
                                  size: "48",
                                  rounded: "lg"
                                }, {
                                  default: withCtx(() => [
                                    createVNode(VIcon, {
                                      color: unref(importResult).failed > 0 ? "warning" : "success",
                                      size: "28"
                                    }, {
                                      default: withCtx(() => [
                                        createTextVNode(toDisplayString(unref(importResult).failed > 0 ? "mdi-alert" : "mdi-check-circle"), 1)
                                      ]),
                                      _: 1
                                    }, 8, ["color"])
                                  ]),
                                  _: 1
                                }, 8, ["color"]),
                                createVNode("div", null, [
                                  createVNode("div", { class: "text-h6 font-weight-bold" }, toDisplayString(unref(importResult).failed > 0 ? "Import Finished (with issues)" : "Import Successful"), 1),
                                  createVNode("div", { class: "text-body-2 text-medium-emphasis" }, toDisplayString(unref(importResult).total_processed) + " row(s) processed", 1)
                                ]),
                                createVNode(VSpacer),
                                unref(importResult).failed === 0 ? (openBlock(), createBlock(VBtn, {
                                  key: 0,
                                  color: "success",
                                  "prepend-icon": "mdi-truck-outline",
                                  onClick: ($event) => ("navigateTo" in _ctx ? _ctx.navigateTo : unref(navigateTo))("/suppliers?imported=1")
                                }, {
                                  default: withCtx(() => [
                                    createTextVNode(" View Suppliers ")
                                  ]),
                                  _: 1
                                }, 8, ["onClick"])) : createCommentVNode("", true),
                                createVNode(VBtn, {
                                  variant: "text",
                                  "prepend-icon": "mdi-refresh",
                                  onClick: resetAll
                                }, {
                                  default: withCtx(() => [
                                    createTextVNode("Start Over")
                                  ]),
                                  _: 1
                                })
                              ]),
                              createVNode(VRow, {
                                dense: "",
                                class: "mb-5"
                              }, {
                                default: withCtx(() => [
                                  createVNode(VCol, {
                                    cols: "6",
                                    sm: "3"
                                  }, {
                                    default: withCtx(() => [
                                      createVNode(VCard, {
                                        variant: "outlined",
                                        rounded: "lg",
                                        class: "pa-4 text-center",
                                        flat: ""
                                      }, {
                                        default: withCtx(() => [
                                          createVNode("div", { class: "text-caption text-medium-emphasis text-uppercase" }, "Created"),
                                          createVNode("div", { class: "text-h4 font-weight-bold text-success mt-1" }, toDisplayString(unref(importResult).created), 1)
                                        ]),
                                        _: 1
                                      })
                                    ]),
                                    _: 1
                                  }),
                                  createVNode(VCol, {
                                    cols: "6",
                                    sm: "3"
                                  }, {
                                    default: withCtx(() => [
                                      createVNode(VCard, {
                                        variant: "outlined",
                                        rounded: "lg",
                                        class: "pa-4 text-center",
                                        flat: ""
                                      }, {
                                        default: withCtx(() => [
                                          createVNode("div", { class: "text-caption text-medium-emphasis text-uppercase" }, "Updated"),
                                          createVNode("div", { class: "text-h4 font-weight-bold text-primary mt-1" }, toDisplayString(unref(importResult).updated), 1)
                                        ]),
                                        _: 1
                                      })
                                    ]),
                                    _: 1
                                  }),
                                  createVNode(VCol, {
                                    cols: "6",
                                    sm: "3"
                                  }, {
                                    default: withCtx(() => [
                                      createVNode(VCard, {
                                        variant: "outlined",
                                        rounded: "lg",
                                        class: "pa-4 text-center",
                                        flat: ""
                                      }, {
                                        default: withCtx(() => [
                                          createVNode("div", { class: "text-caption text-medium-emphasis text-uppercase" }, "Failed"),
                                          createVNode("div", {
                                            class: ["text-h4 font-weight-bold mt-1", unref(importResult).failed > 0 ? "text-error" : "text-disabled"]
                                          }, toDisplayString(unref(importResult).failed), 3)
                                        ]),
                                        _: 1
                                      })
                                    ]),
                                    _: 1
                                  }),
                                  createVNode(VCol, {
                                    cols: "6",
                                    sm: "3"
                                  }, {
                                    default: withCtx(() => [
                                      createVNode(VCard, {
                                        variant: "outlined",
                                        rounded: "lg",
                                        class: "pa-4 text-center",
                                        flat: ""
                                      }, {
                                        default: withCtx(() => [
                                          createVNode("div", { class: "text-caption text-medium-emphasis text-uppercase" }, "Processed"),
                                          createVNode("div", { class: "text-h4 font-weight-bold mt-1" }, toDisplayString(unref(importResult).total_processed), 1)
                                        ]),
                                        _: 1
                                      })
                                    ]),
                                    _: 1
                                  })
                                ]),
                                _: 1
                              }),
                              unref(importResult).errors && unref(importResult).errors.length > 0 ? (openBlock(), createBlock("div", { key: 0 }, [
                                createVNode("div", { class: "d-flex align-center ga-2 mb-3" }, [
                                  createVNode(VIcon, {
                                    size: "18",
                                    color: "error"
                                  }, {
                                    default: withCtx(() => [
                                      createTextVNode("mdi-alert-circle-outline")
                                    ]),
                                    _: 1
                                  }),
                                  createVNode("span", { class: "text-body-1 font-weight-bold" }, "Errors (" + toDisplayString(unref(importResult).errors.length) + toDisplayString(unref(importResult).errors_truncated ? "+" : "") + ")", 1)
                                ]),
                                createVNode(VList, {
                                  variant: "outlined",
                                  rounded: "lg",
                                  density: "compact",
                                  class: "bg-surface",
                                  "max-height": "320",
                                  lines: "two"
                                }, {
                                  default: withCtx(() => [
                                    (openBlock(true), createBlock(Fragment, null, renderList(unref(importResult).errors, (err, idx) => {
                                      return openBlock(), createBlock(VListItem, { key: idx }, {
                                        prepend: withCtx(() => [
                                          createVNode(VAvatar, {
                                            color: "error-lighten-5",
                                            size: "32",
                                            rounded: "lg"
                                          }, {
                                            default: withCtx(() => [
                                              createVNode("span", { class: "text-caption font-weight-bold text-error" }, "#" + toDisplayString(err.row), 1)
                                            ]),
                                            _: 2
                                          }, 1024)
                                        ]),
                                        default: withCtx(() => [
                                          createVNode(VListItemSubtitle, { class: "text-body-2 text-error" }, {
                                            default: withCtx(() => [
                                              createTextVNode(toDisplayString(err.detail), 1)
                                            ]),
                                            _: 2
                                          }, 1024)
                                        ]),
                                        _: 2
                                      }, 1024);
                                    }), 128))
                                  ]),
                                  _: 1
                                })
                              ])) : createCommentVNode("", true)
                            ]),
                            _: 1
                          }, 8, ["style"])) : createCommentVNode("", true)
                        ]),
                        _: 1
                      })
                    ]),
                    _: 1
                  }),
                  createVNode(VWindowItem, { value: "export" }, {
                    default: withCtx(() => [
                      createVNode(VRow, null, {
                        default: withCtx(() => [
                          createVNode(VCol, {
                            cols: "12",
                            lg: "7"
                          }, {
                            default: withCtx(() => [
                              createVNode(VCard, {
                                rounded: "xl",
                                flat: "",
                                border: "",
                                class: "pa-6 h-100"
                              }, {
                                default: withCtx(() => [
                                  createVNode("div", { class: "d-flex align-center ga-3 mb-5" }, [
                                    createVNode(VAvatar, {
                                      color: "success-lighten-5",
                                      size: "48",
                                      rounded: "lg"
                                    }, {
                                      default: withCtx(() => [
                                        createVNode(VIcon, {
                                          color: "success",
                                          size: "26"
                                        }, {
                                          default: withCtx(() => [
                                            createTextVNode("mdi-file-excel-outline")
                                          ]),
                                          _: 1
                                        })
                                      ]),
                                      _: 1
                                    }),
                                    createVNode("div", null, [
                                      createVNode("div", { class: "text-h6 font-weight-bold" }, "Export Suppliers to Excel"),
                                      createVNode("div", { class: "text-body-2 text-medium-emphasis" }, "Download all suppliers as a formatted .xlsx file")
                                    ])
                                  ]),
                                  createVNode(VList, {
                                    density: "compact",
                                    class: "bg-transparent px-0 mb-4"
                                  }, {
                                    default: withCtx(() => [
                                      (openBlock(), createBlock(Fragment, null, renderList(exportInfo, (info) => {
                                        return createVNode(VListItem, {
                                          class: "px-0",
                                          key: info.title
                                        }, {
                                          prepend: withCtx(() => [
                                            createVNode(VIcon, {
                                              color: info.color,
                                              size: "22"
                                            }, {
                                              default: withCtx(() => [
                                                createTextVNode(toDisplayString(info.icon), 1)
                                              ]),
                                              _: 2
                                            }, 1032, ["color"])
                                          ]),
                                          default: withCtx(() => [
                                            createVNode(VListItemTitle, { class: "text-body-1 font-weight-medium" }, {
                                              default: withCtx(() => [
                                                createTextVNode(toDisplayString(info.title), 1)
                                              ]),
                                              _: 2
                                            }, 1024),
                                            createVNode(VListItemSubtitle, { class: "text-body-2 text-medium-emphasis" }, {
                                              default: withCtx(() => [
                                                createTextVNode(toDisplayString(info.subtitle), 1)
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
                                  createVNode(VBtn, {
                                    color: "success",
                                    "prepend-icon": "mdi-microsoft-excel",
                                    block: "",
                                    size: "x-large",
                                    loading: unref(exporting),
                                    onClick: doExport
                                  }, {
                                    default: withCtx(() => [
                                      createTextVNode(" Download .xlsx ")
                                    ]),
                                    _: 1
                                  }, 8, ["loading"])
                                ]),
                                _: 1
                              })
                            ]),
                            _: 1
                          }),
                          createVNode(VCol, {
                            cols: "12",
                            lg: "5"
                          }, {
                            default: withCtx(() => [
                              createVNode(VCard, {
                                rounded: "xl",
                                flat: "",
                                border: "",
                                class: "pa-6 h-100"
                              }, {
                                default: withCtx(() => [
                                  createVNode("div", { class: "text-h6 font-weight-bold mb-4" }, [
                                    createVNode(VIcon, {
                                      class: "mr-1",
                                      color: "primary"
                                    }, {
                                      default: withCtx(() => [
                                        createTextVNode("mdi-filter-variant")
                                      ]),
                                      _: 1
                                    }),
                                    createTextVNode("Active Filters")
                                  ]),
                                  unref(activeFilterChips).length === 0 ? (openBlock(), createBlock("div", {
                                    key: 0,
                                    class: "text-body-2 text-medium-emphasis pa-4 text-center"
                                  }, "No filters active — export will include all suppliers.")) : (openBlock(), createBlock("div", {
                                    key: 1,
                                    class: "d-flex flex-wrap ga-2"
                                  }, [
                                    (openBlock(true), createBlock(Fragment, null, renderList(unref(activeFilterChips), (chip) => {
                                      return openBlock(), createBlock(VChip, {
                                        key: chip.label,
                                        size: "small",
                                        color: chip.color,
                                        variant: "tonal"
                                      }, {
                                        default: withCtx(() => [
                                          createTextVNode(toDisplayString(chip.label), 1)
                                        ]),
                                        _: 2
                                      }, 1032, ["color"]);
                                    }), 128))
                                  ])),
                                  createVNode(VAlert, {
                                    type: "info",
                                    variant: "tonal",
                                    density: "compact",
                                    class: "mt-5",
                                    rounded: "lg"
                                  }, {
                                    default: withCtx(() => [
                                      createTextVNode(" Filters carried over from the Suppliers page. Return there to change them, then re-open Import / Export. ")
                                    ]),
                                    _: 1
                                  }),
                                  createVNode(VBtn, {
                                    variant: "text",
                                    color: "primary",
                                    "prepend-icon": "mdi-arrow-left",
                                    class: "mt-2",
                                    onClick: ($event) => ("navigateTo" in _ctx ? _ctx.navigateTo : unref(navigateTo))("/suppliers")
                                  }, {
                                    default: withCtx(() => [
                                      createTextVNode("Back to Suppliers")
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
                    ]),
                    _: 1
                  })
                ]),
                _: 1
              }, 8, ["modelValue", "onUpdate:modelValue"])
            ];
          }
        }),
        _: 1
      }, _parent));
    };
  }
};
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/suppliers/excel-bulk.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const excelBulk = /* @__PURE__ */ _export_sfc(_sfc_main, [["__scopeId", "data-v-6f982028"]]);

export { excelBulk as default };
//# sourceMappingURL=excel-bulk-DDfEPHaw.mjs.map
