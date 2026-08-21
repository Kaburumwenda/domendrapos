import { _ as _sfc_main$1 } from './PaginationBar-DZP-BWN7.mjs';
import { ref, computed, watch, mergeProps, withCtx, unref, createVNode, toDisplayString, createTextVNode, isRef, openBlock, createBlock, Fragment, createCommentVNode, renderList, useSSRContext } from 'vue';
import { ssrRenderComponent, ssrInterpolate, ssrRenderClass, ssrRenderStyle, ssrRenderList } from 'vue/server-renderer';
import { u as useFormat } from './useFormat-C--cm8if.mjs';
import { M as useToast, V as VContainer, i as VRow, j as VCol, g as VBtn, k as VCard, Q as VAvatar, d as VIcon, C as VTextField, S as VSelect, v as VChip, E as VProgressCircular, P as VTable } from './server.mjs';
import { u as useApi } from './useApi-9yTPzSUF.mjs';
import './auth-s-b-v9EY.mjs';
import 'pinia';
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
import 'vue-router';
import '@vue/shared';
import 'vue3-apexcharts';

const pageSize = 20;
const _sfc_main = {
  __name: "movements",
  __ssrInlineRender: true,
  setup(__props) {
    const { datetime, number: formatNumber } = useFormat();
    const toast = useToast();
    const loading = ref(false);
    const movements = ref([]);
    const searchQuery = ref("");
    const filterType = ref("");
    const filterBranch = ref("");
    const datePreset = ref("");
    const dateFrom = ref("");
    const dateTo = ref("");
    const sortBy = ref("-created_at");
    const currentPage = ref(1);
    const branchItems = computed(() => {
      const seen = /* @__PURE__ */ new Map();
      for (const m of movements.value) {
        if (m.branch_code && !seen.has(m.branch_code)) {
          seen.set(m.branch_code, { code: m.branch_code, name: m.branch_code });
        }
      }
      return Array.from(seen.values());
    });
    const typeFilterItems = [
      { title: "Purchase / Receive", value: "purchase" },
      { title: "Sale", value: "sale" },
      { title: "Return", value: "return" },
      { title: "Adjustment", value: "adjustment" },
      { title: "Transfer Out", value: "transfer_out" },
      { title: "Transfer In", value: "transfer_in" },
      { title: "Damage / Write-off", value: "damage" },
      { title: "Initial Stock", value: "initial" }
    ];
    const sortItems = [
      { title: "Sort: Newest First", value: "-created_at" },
      { title: "Sort: Oldest First", value: "created_at" }
    ];
    const datePresetItems = [
      { title: "Today", value: "today" },
      { title: "Yesterday", value: "yesterday" },
      { title: "Last 7 Days", value: "last_7d" },
      { title: "Last 30 Days", value: "last_30d" },
      { title: "This Month", value: "this_month" },
      { title: "Last Month", value: "last_month" },
      { title: "This Year", value: "this_year" },
      { title: "Custom Range", value: "custom" }
    ];
    const datePresetLabel = computed(
      () => datePresetItems.find((p) => p.value === datePreset.value)?.title || ""
    );
    const dateRange = computed(() => {
      if (!datePreset.value) {
        if (dateFrom.value || dateTo.value) {
          return {
            from: dateFrom.value ? new Date(dateFrom.value) : null,
            to: dateTo.value ? new Date(dateTo.value) : null
          };
        }
        return { from: null, to: null };
      }
      if (datePreset.value === "custom") {
        return {
          from: dateFrom.value ? new Date(dateFrom.value) : null,
          to: dateTo.value ? new Date(dateTo.value) : null
        };
      }
      const now = /* @__PURE__ */ new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      let from = null;
      let to = new Date(now);
      to.setHours(23, 59, 59, 999);
      switch (datePreset.value) {
        case "today":
          from = new Date(today);
          from.setHours(0, 0, 0, 0);
          break;
        case "yesterday": {
          from = new Date(today);
          from.setDate(from.getDate() - 1);
          from.setHours(0, 0, 0, 0);
          to = new Date(today);
          to.setDate(to.getDate() - 1);
          to.setHours(23, 59, 59, 999);
          break;
        }
        case "last_7d":
          from = new Date(today);
          from.setDate(from.getDate() - 6);
          from.setHours(0, 0, 0, 0);
          break;
        case "last_30d":
          from = new Date(today);
          from.setDate(from.getDate() - 29);
          from.setHours(0, 0, 0, 0);
          break;
        case "this_month":
          from = new Date(today.getFullYear(), today.getMonth(), 1, 0, 0, 0, 0);
          break;
        case "last_month":
          from = new Date(today.getFullYear(), today.getMonth() - 1, 1, 0, 0, 0, 0);
          to = new Date(today.getFullYear(), today.getMonth(), 0, 23, 59, 59, 999);
          break;
        case "this_year":
          from = new Date(today.getFullYear(), 0, 1, 0, 0, 0, 0);
          break;
      }
      return { from, to };
    });
    const hasActiveFilters = computed(() => !!(searchQuery.value || filterType.value || filterBranch.value || datePreset.value));
    const filteredMovements = computed(() => {
      let list = [...movements.value];
      const q = searchQuery.value?.toLowerCase().trim();
      if (q) {
        list = list.filter(
          (m) => (m.product_name || "").toLowerCase().includes(q) || (m.product_sku || "").toLowerCase().includes(q) || (m.reference || "").toLowerCase().includes(q)
        );
      }
      if (filterType.value) list = list.filter((m) => m.movement_type === filterType.value);
      if (filterBranch.value) list = list.filter((m) => m.branch_code === filterBranch.value);
      const { from, to } = dateRange.value;
      if (from) list = list.filter((m) => new Date(m.created_at) >= from);
      if (to) list = list.filter((m) => new Date(m.created_at) <= to);
      if (sortBy.value === "created_at") list.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
      else list.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      return list;
    });
    const totalPages = computed(() => Math.ceil(filteredMovements.value.length / pageSize) || 1);
    const pagedMovements = computed(() => {
      const start = (currentPage.value - 1) * pageSize;
      return filteredMovements.value.slice(start, start + pageSize);
    });
    const stats = computed(() => {
      const total = movements.value.length;
      let totalIn = 0;
      let totalOut = 0;
      for (const m of movements.value) {
        const qty = parseFloat(m.quantity_change) || 0;
        if (qty > 0) totalIn += qty;
        else totalOut += Math.abs(qty);
      }
      const netChange = totalIn - totalOut;
      return {
        total,
        totalIn,
        totalOut,
        netIn: totalIn,
        netOut: totalOut,
        netChange,
        netChangeColor: netChange > 0 ? "text-success" : netChange < 0 ? "text-error" : ""
      };
    });
    async function loadMovements() {
      loading.value = true;
      try {
        const data = await useApi()("/inventory/movements/?page_size=500");
        movements.value = data.results || data;
      } catch {
        toast.error("Failed to load stock movements");
      } finally {
        loading.value = false;
      }
    }
    const TYPE_COLORS = {
      purchase: "green",
      sale: "blue",
      return: "amber",
      adjustment: "deep-purple",
      transfer_out: "orange",
      transfer_in: "teal",
      damage: "red",
      initial: "indigo"
    };
    function typeColor(type) {
      return TYPE_COLORS[type] || "grey";
    }
    const TYPE_ICONS = {
      purchase: "mdi-package-plus",
      sale: "mdi-point-of-sale",
      return: "mdi-keyboard-backspace",
      adjustment: "mdi-clipboard-edit-outline",
      transfer_out: "mdi-arrow-top-right",
      transfer_in: "mdi-arrow-bottom-left",
      damage: "mdi-alert-circle-outline",
      initial: "mdi-clock-alert-outline"
    };
    function typeIcon(type) {
      return TYPE_ICONS[type] || "mdi-swap-horizontal";
    }
    function qtyClass(qty) {
      const v = parseFloat(qty) || 0;
      if (v > 0) return "text-success";
      if (v < 0) return "text-error";
      return "";
    }
    function typeLabel(value) {
      return typeFilterItems.find((t) => t.value === value)?.title || value;
    }
    function clearAllFilters() {
      searchQuery.value = "";
      filterType.value = "";
      filterBranch.value = "";
      datePreset.value = "";
      dateFrom.value = "";
      dateTo.value = "";
      sortBy.value = "-created_at";
      currentPage.value = 1;
    }
    function rowNumber(idx) {
      return (currentPage.value - 1) * pageSize + idx + 1;
    }
    function exportCsv() {
      const rows = filteredMovements.value;
      if (rows.length === 0) {
        toast.info("Nothing to export");
        return;
      }
      const header = ["Date", "Product", "SKU", "Branch", "Type", "Qty Change", "After", "Reference", "Performed By", "Notes"];
      const lines = [header.join(",")];
      for (const r of rows) {
        const cells = [
          r.created_at || "",
          `"${(r.product_name || "").replace(/"/g, '""')}"`,
          r.product_sku || "",
          r.branch_code || "",
          r.movement_type_display || r.movement_type || "",
          r.quantity_change ?? "",
          r.quantity_after ?? "",
          `"${(r.reference || "").replace(/"/g, '""')}"`,
          `"${(r.performed_by_name || "").replace(/"/g, '""')}"`,
          `"${(r.notes || "").replace(/"/g, '""')}"`
        ];
        lines.push(cells.join(","));
      }
      const csv = lines.join("\n");
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const a = (void 0).createElement("a");
      a.href = url;
      a.download = `stock-movements-${(/* @__PURE__ */ new Date()).toISOString().slice(0, 10)}.csv`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success("Exported to CSV");
    }
    watch([searchQuery, filterType, filterBranch, datePreset, dateFrom, dateTo, sortBy], () => {
      currentPage.value = 1;
    });
    return (_ctx, _push, _parent, _attrs) => {
      const _component_PaginationBar = _sfc_main$1;
      _push(ssrRenderComponent(VContainer, mergeProps({
        class: "pa-0",
        fluid: ""
      }, _attrs), {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(ssrRenderComponent(VRow, { class: "d-flex align-center justify-space-between mb-4" }, {
              default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                if (_push3) {
                  _push3(ssrRenderComponent(VCol, {
                    cols: "12",
                    sm: "6"
                  }, {
                    default: withCtx((_3, _push4, _parent4, _scopeId3) => {
                      if (_push4) {
                        _push4(`<div class="text-h5 font-weight-bold"${_scopeId3}>Stock Movements</div><div class="text-body-2 text-medium-emphasis"${_scopeId3}>${ssrInterpolate(unref(stats).total)} movements · ${ssrInterpolate(unref(stats).netIn)} units net in · ${ssrInterpolate(unref(stats).netOut)} units net out </div>`);
                      } else {
                        return [
                          createVNode("div", { class: "text-h5 font-weight-bold" }, "Stock Movements"),
                          createVNode("div", { class: "text-body-2 text-medium-emphasis" }, toDisplayString(unref(stats).total) + " movements · " + toDisplayString(unref(stats).netIn) + " units net in · " + toDisplayString(unref(stats).netOut) + " units net out ", 1)
                        ];
                      }
                    }),
                    _: 1
                  }, _parent3, _scopeId2));
                  _push3(ssrRenderComponent(VCol, {
                    cols: "12",
                    sm: "6",
                    class: "d-flex justify-end ga-2 flex-wrap"
                  }, {
                    default: withCtx((_3, _push4, _parent4, _scopeId3) => {
                      if (_push4) {
                        _push4(ssrRenderComponent(VBtn, {
                          variant: "outlined",
                          "prepend-icon": "mdi-download",
                          onClick: exportCsv
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
                        _push4(ssrRenderComponent(VBtn, {
                          variant: "outlined",
                          "prepend-icon": "mdi-refresh",
                          onClick: loadMovements
                        }, {
                          default: withCtx((_4, _push5, _parent5, _scopeId4) => {
                            if (_push5) {
                              _push5(`Refresh`);
                            } else {
                              return [
                                createTextVNode("Refresh")
                              ];
                            }
                          }),
                          _: 1
                        }, _parent4, _scopeId3));
                      } else {
                        return [
                          createVNode(VBtn, {
                            variant: "outlined",
                            "prepend-icon": "mdi-download",
                            onClick: exportCsv
                          }, {
                            default: withCtx(() => [
                              createTextVNode("Export")
                            ]),
                            _: 1
                          }),
                          createVNode(VBtn, {
                            variant: "outlined",
                            "prepend-icon": "mdi-refresh",
                            onClick: loadMovements
                          }, {
                            default: withCtx(() => [
                              createTextVNode("Refresh")
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
                    createVNode(VCol, {
                      cols: "12",
                      sm: "6"
                    }, {
                      default: withCtx(() => [
                        createVNode("div", { class: "text-h5 font-weight-bold" }, "Stock Movements"),
                        createVNode("div", { class: "text-body-2 text-medium-emphasis" }, toDisplayString(unref(stats).total) + " movements · " + toDisplayString(unref(stats).netIn) + " units net in · " + toDisplayString(unref(stats).netOut) + " units net out ", 1)
                      ]),
                      _: 1
                    }),
                    createVNode(VCol, {
                      cols: "12",
                      sm: "6",
                      class: "d-flex justify-end ga-2 flex-wrap"
                    }, {
                      default: withCtx(() => [
                        createVNode(VBtn, {
                          variant: "outlined",
                          "prepend-icon": "mdi-download",
                          onClick: exportCsv
                        }, {
                          default: withCtx(() => [
                            createTextVNode("Export")
                          ]),
                          _: 1
                        }),
                        createVNode(VBtn, {
                          variant: "outlined",
                          "prepend-icon": "mdi-refresh",
                          onClick: loadMovements
                        }, {
                          default: withCtx(() => [
                            createTextVNode("Refresh")
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
            _push2(ssrRenderComponent(VRow, { class: "mb-4" }, {
              default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                if (_push3) {
                  _push3(ssrRenderComponent(VCol, {
                    cols: "6",
                    lg: "3"
                  }, {
                    default: withCtx((_3, _push4, _parent4, _scopeId3) => {
                      if (_push4) {
                        _push4(ssrRenderComponent(VCard, {
                          class: "pa-5 bg-surface",
                          flat: "",
                          border: "",
                          style: { "border-top": "4px solid rgb(var(--v-theme-blue)) !important", "border-radius": "10px !important" }
                        }, {
                          default: withCtx((_4, _push5, _parent5, _scopeId4) => {
                            if (_push5) {
                              _push5(`<div class="d-flex align-start justify-space-between"${_scopeId4}><div${_scopeId4}><div class="text-caption text-medium-emphasis text-uppercase"${_scopeId4}>Total Movements</div><div class="text-h5 font-weight-bold mt-2"${_scopeId4}>${ssrInterpolate(unref(stats).total)}</div></div>`);
                              _push5(ssrRenderComponent(VAvatar, {
                                color: "blue-lighten-5",
                                rounded: "lg",
                                size: "40"
                              }, {
                                default: withCtx((_5, _push6, _parent6, _scopeId5) => {
                                  if (_push6) {
                                    _push6(ssrRenderComponent(VIcon, { color: "blue" }, {
                                      default: withCtx((_6, _push7, _parent7, _scopeId6) => {
                                        if (_push7) {
                                          _push7(`mdi-swap-horizontal`);
                                        } else {
                                          return [
                                            createTextVNode("mdi-swap-horizontal")
                                          ];
                                        }
                                      }),
                                      _: 1
                                    }, _parent6, _scopeId5));
                                  } else {
                                    return [
                                      createVNode(VIcon, { color: "blue" }, {
                                        default: withCtx(() => [
                                          createTextVNode("mdi-swap-horizontal")
                                        ]),
                                        _: 1
                                      })
                                    ];
                                  }
                                }),
                                _: 1
                              }, _parent5, _scopeId4));
                              _push5(`</div>`);
                            } else {
                              return [
                                createVNode("div", { class: "d-flex align-start justify-space-between" }, [
                                  createVNode("div", null, [
                                    createVNode("div", { class: "text-caption text-medium-emphasis text-uppercase" }, "Total Movements"),
                                    createVNode("div", { class: "text-h5 font-weight-bold mt-2" }, toDisplayString(unref(stats).total), 1)
                                  ]),
                                  createVNode(VAvatar, {
                                    color: "blue-lighten-5",
                                    rounded: "lg",
                                    size: "40"
                                  }, {
                                    default: withCtx(() => [
                                      createVNode(VIcon, { color: "blue" }, {
                                        default: withCtx(() => [
                                          createTextVNode("mdi-swap-horizontal")
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
                        }, _parent4, _scopeId3));
                      } else {
                        return [
                          createVNode(VCard, {
                            class: "pa-5 bg-surface",
                            flat: "",
                            border: "",
                            style: { "border-top": "4px solid rgb(var(--v-theme-blue)) !important", "border-radius": "10px !important" }
                          }, {
                            default: withCtx(() => [
                              createVNode("div", { class: "d-flex align-start justify-space-between" }, [
                                createVNode("div", null, [
                                  createVNode("div", { class: "text-caption text-medium-emphasis text-uppercase" }, "Total Movements"),
                                  createVNode("div", { class: "text-h5 font-weight-bold mt-2" }, toDisplayString(unref(stats).total), 1)
                                ]),
                                createVNode(VAvatar, {
                                  color: "blue-lighten-5",
                                  rounded: "lg",
                                  size: "40"
                                }, {
                                  default: withCtx(() => [
                                    createVNode(VIcon, { color: "blue" }, {
                                      default: withCtx(() => [
                                        createTextVNode("mdi-swap-horizontal")
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
                  }, _parent3, _scopeId2));
                  _push3(ssrRenderComponent(VCol, {
                    cols: "6",
                    lg: "3"
                  }, {
                    default: withCtx((_3, _push4, _parent4, _scopeId3) => {
                      if (_push4) {
                        _push4(ssrRenderComponent(VCard, {
                          class: "pa-5 bg-surface",
                          flat: "",
                          border: "",
                          style: { "border-top": "4px solid rgb(var(--v-theme-green)) !important", "border-radius": "10px !important" }
                        }, {
                          default: withCtx((_4, _push5, _parent5, _scopeId4) => {
                            if (_push5) {
                              _push5(`<div class="d-flex align-start justify-space-between"${_scopeId4}><div${_scopeId4}><div class="text-caption text-medium-emphasis text-uppercase"${_scopeId4}>Units In</div><div class="text-h5 font-weight-bold text-success mt-2"${_scopeId4}>+${ssrInterpolate(unref(formatNumber)(unref(stats).totalIn))}</div></div>`);
                              _push5(ssrRenderComponent(VAvatar, {
                                color: "green-lighten-5",
                                rounded: "lg",
                                size: "40"
                              }, {
                                default: withCtx((_5, _push6, _parent6, _scopeId5) => {
                                  if (_push6) {
                                    _push6(ssrRenderComponent(VIcon, { color: "green" }, {
                                      default: withCtx((_6, _push7, _parent7, _scopeId6) => {
                                        if (_push7) {
                                          _push7(`mdi-trending-up`);
                                        } else {
                                          return [
                                            createTextVNode("mdi-trending-up")
                                          ];
                                        }
                                      }),
                                      _: 1
                                    }, _parent6, _scopeId5));
                                  } else {
                                    return [
                                      createVNode(VIcon, { color: "green" }, {
                                        default: withCtx(() => [
                                          createTextVNode("mdi-trending-up")
                                        ]),
                                        _: 1
                                      })
                                    ];
                                  }
                                }),
                                _: 1
                              }, _parent5, _scopeId4));
                              _push5(`</div>`);
                            } else {
                              return [
                                createVNode("div", { class: "d-flex align-start justify-space-between" }, [
                                  createVNode("div", null, [
                                    createVNode("div", { class: "text-caption text-medium-emphasis text-uppercase" }, "Units In"),
                                    createVNode("div", { class: "text-h5 font-weight-bold text-success mt-2" }, "+" + toDisplayString(unref(formatNumber)(unref(stats).totalIn)), 1)
                                  ]),
                                  createVNode(VAvatar, {
                                    color: "green-lighten-5",
                                    rounded: "lg",
                                    size: "40"
                                  }, {
                                    default: withCtx(() => [
                                      createVNode(VIcon, { color: "green" }, {
                                        default: withCtx(() => [
                                          createTextVNode("mdi-trending-up")
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
                        }, _parent4, _scopeId3));
                      } else {
                        return [
                          createVNode(VCard, {
                            class: "pa-5 bg-surface",
                            flat: "",
                            border: "",
                            style: { "border-top": "4px solid rgb(var(--v-theme-green)) !important", "border-radius": "10px !important" }
                          }, {
                            default: withCtx(() => [
                              createVNode("div", { class: "d-flex align-start justify-space-between" }, [
                                createVNode("div", null, [
                                  createVNode("div", { class: "text-caption text-medium-emphasis text-uppercase" }, "Units In"),
                                  createVNode("div", { class: "text-h5 font-weight-bold text-success mt-2" }, "+" + toDisplayString(unref(formatNumber)(unref(stats).totalIn)), 1)
                                ]),
                                createVNode(VAvatar, {
                                  color: "green-lighten-5",
                                  rounded: "lg",
                                  size: "40"
                                }, {
                                  default: withCtx(() => [
                                    createVNode(VIcon, { color: "green" }, {
                                      default: withCtx(() => [
                                        createTextVNode("mdi-trending-up")
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
                  }, _parent3, _scopeId2));
                  _push3(ssrRenderComponent(VCol, {
                    cols: "6",
                    lg: "3"
                  }, {
                    default: withCtx((_3, _push4, _parent4, _scopeId3) => {
                      if (_push4) {
                        _push4(ssrRenderComponent(VCard, {
                          class: "pa-5 bg-surface",
                          flat: "",
                          border: "",
                          style: { "border-top": "4px solid rgb(var(--v-theme-red)) !important", "border-radius": "10px !important" }
                        }, {
                          default: withCtx((_4, _push5, _parent5, _scopeId4) => {
                            if (_push5) {
                              _push5(`<div class="d-flex align-start justify-space-between"${_scopeId4}><div${_scopeId4}><div class="text-caption text-medium-emphasis text-uppercase"${_scopeId4}>Units Out</div><div class="text-h5 font-weight-bold text-error mt-2"${_scopeId4}>-${ssrInterpolate(unref(formatNumber)(unref(stats).totalOut))}</div></div>`);
                              _push5(ssrRenderComponent(VAvatar, {
                                color: "red-lighten-5",
                                rounded: "lg",
                                size: "40"
                              }, {
                                default: withCtx((_5, _push6, _parent6, _scopeId5) => {
                                  if (_push6) {
                                    _push6(ssrRenderComponent(VIcon, { color: "red" }, {
                                      default: withCtx((_6, _push7, _parent7, _scopeId6) => {
                                        if (_push7) {
                                          _push7(`mdi-trending-down`);
                                        } else {
                                          return [
                                            createTextVNode("mdi-trending-down")
                                          ];
                                        }
                                      }),
                                      _: 1
                                    }, _parent6, _scopeId5));
                                  } else {
                                    return [
                                      createVNode(VIcon, { color: "red" }, {
                                        default: withCtx(() => [
                                          createTextVNode("mdi-trending-down")
                                        ]),
                                        _: 1
                                      })
                                    ];
                                  }
                                }),
                                _: 1
                              }, _parent5, _scopeId4));
                              _push5(`</div>`);
                            } else {
                              return [
                                createVNode("div", { class: "d-flex align-start justify-space-between" }, [
                                  createVNode("div", null, [
                                    createVNode("div", { class: "text-caption text-medium-emphasis text-uppercase" }, "Units Out"),
                                    createVNode("div", { class: "text-h5 font-weight-bold text-error mt-2" }, "-" + toDisplayString(unref(formatNumber)(unref(stats).totalOut)), 1)
                                  ]),
                                  createVNode(VAvatar, {
                                    color: "red-lighten-5",
                                    rounded: "lg",
                                    size: "40"
                                  }, {
                                    default: withCtx(() => [
                                      createVNode(VIcon, { color: "red" }, {
                                        default: withCtx(() => [
                                          createTextVNode("mdi-trending-down")
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
                        }, _parent4, _scopeId3));
                      } else {
                        return [
                          createVNode(VCard, {
                            class: "pa-5 bg-surface",
                            flat: "",
                            border: "",
                            style: { "border-top": "4px solid rgb(var(--v-theme-red)) !important", "border-radius": "10px !important" }
                          }, {
                            default: withCtx(() => [
                              createVNode("div", { class: "d-flex align-start justify-space-between" }, [
                                createVNode("div", null, [
                                  createVNode("div", { class: "text-caption text-medium-emphasis text-uppercase" }, "Units Out"),
                                  createVNode("div", { class: "text-h5 font-weight-bold text-error mt-2" }, "-" + toDisplayString(unref(formatNumber)(unref(stats).totalOut)), 1)
                                ]),
                                createVNode(VAvatar, {
                                  color: "red-lighten-5",
                                  rounded: "lg",
                                  size: "40"
                                }, {
                                  default: withCtx(() => [
                                    createVNode(VIcon, { color: "red" }, {
                                      default: withCtx(() => [
                                        createTextVNode("mdi-trending-down")
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
                  }, _parent3, _scopeId2));
                  _push3(ssrRenderComponent(VCol, {
                    cols: "6",
                    lg: "3"
                  }, {
                    default: withCtx((_3, _push4, _parent4, _scopeId3) => {
                      if (_push4) {
                        _push4(ssrRenderComponent(VCard, {
                          class: "pa-5 bg-surface",
                          flat: "",
                          border: "",
                          style: { "border-top": "4px solid rgb(var(--v-theme-deep-purple)) !important", "border-radius": "10px !important" }
                        }, {
                          default: withCtx((_4, _push5, _parent5, _scopeId4) => {
                            if (_push5) {
                              _push5(`<div class="d-flex align-start justify-space-between"${_scopeId4}><div${_scopeId4}><div class="text-caption text-medium-emphasis text-uppercase"${_scopeId4}>Net Change</div><div class="${ssrRenderClass([unref(stats).netChangeColor, "text-h5 font-weight-bold mt-2"])}"${_scopeId4}>${ssrInterpolate(unref(formatNumber)(unref(stats).netChange))}</div></div>`);
                              _push5(ssrRenderComponent(VAvatar, {
                                color: "deep-purple-lighten-5",
                                rounded: "lg",
                                size: "40"
                              }, {
                                default: withCtx((_5, _push6, _parent6, _scopeId5) => {
                                  if (_push6) {
                                    _push6(ssrRenderComponent(VIcon, { color: "deep-purple" }, {
                                      default: withCtx((_6, _push7, _parent7, _scopeId6) => {
                                        if (_push7) {
                                          _push7(`mdi-scale-balance`);
                                        } else {
                                          return [
                                            createTextVNode("mdi-scale-balance")
                                          ];
                                        }
                                      }),
                                      _: 1
                                    }, _parent6, _scopeId5));
                                  } else {
                                    return [
                                      createVNode(VIcon, { color: "deep-purple" }, {
                                        default: withCtx(() => [
                                          createTextVNode("mdi-scale-balance")
                                        ]),
                                        _: 1
                                      })
                                    ];
                                  }
                                }),
                                _: 1
                              }, _parent5, _scopeId4));
                              _push5(`</div>`);
                            } else {
                              return [
                                createVNode("div", { class: "d-flex align-start justify-space-between" }, [
                                  createVNode("div", null, [
                                    createVNode("div", { class: "text-caption text-medium-emphasis text-uppercase" }, "Net Change"),
                                    createVNode("div", {
                                      class: ["text-h5 font-weight-bold mt-2", unref(stats).netChangeColor]
                                    }, toDisplayString(unref(formatNumber)(unref(stats).netChange)), 3)
                                  ]),
                                  createVNode(VAvatar, {
                                    color: "deep-purple-lighten-5",
                                    rounded: "lg",
                                    size: "40"
                                  }, {
                                    default: withCtx(() => [
                                      createVNode(VIcon, { color: "deep-purple" }, {
                                        default: withCtx(() => [
                                          createTextVNode("mdi-scale-balance")
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
                        }, _parent4, _scopeId3));
                      } else {
                        return [
                          createVNode(VCard, {
                            class: "pa-5 bg-surface",
                            flat: "",
                            border: "",
                            style: { "border-top": "4px solid rgb(var(--v-theme-deep-purple)) !important", "border-radius": "10px !important" }
                          }, {
                            default: withCtx(() => [
                              createVNode("div", { class: "d-flex align-start justify-space-between" }, [
                                createVNode("div", null, [
                                  createVNode("div", { class: "text-caption text-medium-emphasis text-uppercase" }, "Net Change"),
                                  createVNode("div", {
                                    class: ["text-h5 font-weight-bold mt-2", unref(stats).netChangeColor]
                                  }, toDisplayString(unref(formatNumber)(unref(stats).netChange)), 3)
                                ]),
                                createVNode(VAvatar, {
                                  color: "deep-purple-lighten-5",
                                  rounded: "lg",
                                  size: "40"
                                }, {
                                  default: withCtx(() => [
                                    createVNode(VIcon, { color: "deep-purple" }, {
                                      default: withCtx(() => [
                                        createTextVNode("mdi-scale-balance")
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
                  }, _parent3, _scopeId2));
                } else {
                  return [
                    createVNode(VCol, {
                      cols: "6",
                      lg: "3"
                    }, {
                      default: withCtx(() => [
                        createVNode(VCard, {
                          class: "pa-5 bg-surface",
                          flat: "",
                          border: "",
                          style: { "border-top": "4px solid rgb(var(--v-theme-blue)) !important", "border-radius": "10px !important" }
                        }, {
                          default: withCtx(() => [
                            createVNode("div", { class: "d-flex align-start justify-space-between" }, [
                              createVNode("div", null, [
                                createVNode("div", { class: "text-caption text-medium-emphasis text-uppercase" }, "Total Movements"),
                                createVNode("div", { class: "text-h5 font-weight-bold mt-2" }, toDisplayString(unref(stats).total), 1)
                              ]),
                              createVNode(VAvatar, {
                                color: "blue-lighten-5",
                                rounded: "lg",
                                size: "40"
                              }, {
                                default: withCtx(() => [
                                  createVNode(VIcon, { color: "blue" }, {
                                    default: withCtx(() => [
                                      createTextVNode("mdi-swap-horizontal")
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
                      ]),
                      _: 1
                    }),
                    createVNode(VCol, {
                      cols: "6",
                      lg: "3"
                    }, {
                      default: withCtx(() => [
                        createVNode(VCard, {
                          class: "pa-5 bg-surface",
                          flat: "",
                          border: "",
                          style: { "border-top": "4px solid rgb(var(--v-theme-green)) !important", "border-radius": "10px !important" }
                        }, {
                          default: withCtx(() => [
                            createVNode("div", { class: "d-flex align-start justify-space-between" }, [
                              createVNode("div", null, [
                                createVNode("div", { class: "text-caption text-medium-emphasis text-uppercase" }, "Units In"),
                                createVNode("div", { class: "text-h5 font-weight-bold text-success mt-2" }, "+" + toDisplayString(unref(formatNumber)(unref(stats).totalIn)), 1)
                              ]),
                              createVNode(VAvatar, {
                                color: "green-lighten-5",
                                rounded: "lg",
                                size: "40"
                              }, {
                                default: withCtx(() => [
                                  createVNode(VIcon, { color: "green" }, {
                                    default: withCtx(() => [
                                      createTextVNode("mdi-trending-up")
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
                      ]),
                      _: 1
                    }),
                    createVNode(VCol, {
                      cols: "6",
                      lg: "3"
                    }, {
                      default: withCtx(() => [
                        createVNode(VCard, {
                          class: "pa-5 bg-surface",
                          flat: "",
                          border: "",
                          style: { "border-top": "4px solid rgb(var(--v-theme-red)) !important", "border-radius": "10px !important" }
                        }, {
                          default: withCtx(() => [
                            createVNode("div", { class: "d-flex align-start justify-space-between" }, [
                              createVNode("div", null, [
                                createVNode("div", { class: "text-caption text-medium-emphasis text-uppercase" }, "Units Out"),
                                createVNode("div", { class: "text-h5 font-weight-bold text-error mt-2" }, "-" + toDisplayString(unref(formatNumber)(unref(stats).totalOut)), 1)
                              ]),
                              createVNode(VAvatar, {
                                color: "red-lighten-5",
                                rounded: "lg",
                                size: "40"
                              }, {
                                default: withCtx(() => [
                                  createVNode(VIcon, { color: "red" }, {
                                    default: withCtx(() => [
                                      createTextVNode("mdi-trending-down")
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
                      ]),
                      _: 1
                    }),
                    createVNode(VCol, {
                      cols: "6",
                      lg: "3"
                    }, {
                      default: withCtx(() => [
                        createVNode(VCard, {
                          class: "pa-5 bg-surface",
                          flat: "",
                          border: "",
                          style: { "border-top": "4px solid rgb(var(--v-theme-deep-purple)) !important", "border-radius": "10px !important" }
                        }, {
                          default: withCtx(() => [
                            createVNode("div", { class: "d-flex align-start justify-space-between" }, [
                              createVNode("div", null, [
                                createVNode("div", { class: "text-caption text-medium-emphasis text-uppercase" }, "Net Change"),
                                createVNode("div", {
                                  class: ["text-h5 font-weight-bold mt-2", unref(stats).netChangeColor]
                                }, toDisplayString(unref(formatNumber)(unref(stats).netChange)), 3)
                              ]),
                              createVNode(VAvatar, {
                                color: "deep-purple-lighten-5",
                                rounded: "lg",
                                size: "40"
                              }, {
                                default: withCtx(() => [
                                  createVNode(VIcon, { color: "deep-purple" }, {
                                    default: withCtx(() => [
                                      createTextVNode("mdi-scale-balance")
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
              class: "pa-4 mb-4",
              flat: "",
              border: ""
            }, {
              default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                if (_push3) {
                  _push3(ssrRenderComponent(VRow, { density: "comfortable" }, {
                    default: withCtx((_3, _push4, _parent4, _scopeId3) => {
                      if (_push4) {
                        _push4(ssrRenderComponent(VCol, {
                          cols: "12",
                          lg: "5"
                        }, {
                          default: withCtx((_4, _push5, _parent5, _scopeId4) => {
                            if (_push5) {
                              _push5(ssrRenderComponent(VTextField, {
                                modelValue: unref(searchQuery),
                                "onUpdate:modelValue": ($event) => isRef(searchQuery) ? searchQuery.value = $event : null,
                                placeholder: "Search by product, SKU, reference...",
                                variant: "outlined",
                                density: "compact",
                                "prepend-inner-icon": "mdi-magnify",
                                "hide-details": "",
                                clearable: ""
                              }, null, _parent5, _scopeId4));
                            } else {
                              return [
                                createVNode(VTextField, {
                                  modelValue: unref(searchQuery),
                                  "onUpdate:modelValue": ($event) => isRef(searchQuery) ? searchQuery.value = $event : null,
                                  placeholder: "Search by product, SKU, reference...",
                                  variant: "outlined",
                                  density: "compact",
                                  "prepend-inner-icon": "mdi-magnify",
                                  "hide-details": "",
                                  clearable: ""
                                }, null, 8, ["modelValue", "onUpdate:modelValue"])
                              ];
                            }
                          }),
                          _: 1
                        }, _parent4, _scopeId3));
                        _push4(ssrRenderComponent(VCol, {
                          cols: "6",
                          lg: "2"
                        }, {
                          default: withCtx((_4, _push5, _parent5, _scopeId4) => {
                            if (_push5) {
                              _push5(ssrRenderComponent(VSelect, {
                                modelValue: unref(filterType),
                                "onUpdate:modelValue": ($event) => isRef(filterType) ? filterType.value = $event : null,
                                items: typeFilterItems,
                                "item-title": "title",
                                "item-value": "value",
                                label: "All Types",
                                variant: "outlined",
                                density: "compact",
                                "hide-details": "",
                                clearable: ""
                              }, null, _parent5, _scopeId4));
                            } else {
                              return [
                                createVNode(VSelect, {
                                  modelValue: unref(filterType),
                                  "onUpdate:modelValue": ($event) => isRef(filterType) ? filterType.value = $event : null,
                                  items: typeFilterItems,
                                  "item-title": "title",
                                  "item-value": "value",
                                  label: "All Types",
                                  variant: "outlined",
                                  density: "compact",
                                  "hide-details": "",
                                  clearable: ""
                                }, null, 8, ["modelValue", "onUpdate:modelValue"])
                              ];
                            }
                          }),
                          _: 1
                        }, _parent4, _scopeId3));
                        _push4(ssrRenderComponent(VCol, {
                          cols: "6",
                          lg: "2"
                        }, {
                          default: withCtx((_4, _push5, _parent5, _scopeId4) => {
                            if (_push5) {
                              _push5(ssrRenderComponent(VSelect, {
                                modelValue: unref(filterBranch),
                                "onUpdate:modelValue": ($event) => isRef(filterBranch) ? filterBranch.value = $event : null,
                                items: unref(branchItems),
                                "item-title": "name",
                                "item-value": "code",
                                label: "All Branches",
                                variant: "outlined",
                                density: "compact",
                                "hide-details": "",
                                clearable: ""
                              }, null, _parent5, _scopeId4));
                            } else {
                              return [
                                createVNode(VSelect, {
                                  modelValue: unref(filterBranch),
                                  "onUpdate:modelValue": ($event) => isRef(filterBranch) ? filterBranch.value = $event : null,
                                  items: unref(branchItems),
                                  "item-title": "name",
                                  "item-value": "code",
                                  label: "All Branches",
                                  variant: "outlined",
                                  density: "compact",
                                  "hide-details": "",
                                  clearable: ""
                                }, null, 8, ["modelValue", "onUpdate:modelValue", "items"])
                              ];
                            }
                          }),
                          _: 1
                        }, _parent4, _scopeId3));
                        _push4(ssrRenderComponent(VCol, {
                          cols: "6",
                          lg: "2"
                        }, {
                          default: withCtx((_4, _push5, _parent5, _scopeId4) => {
                            if (_push5) {
                              _push5(ssrRenderComponent(VSelect, {
                                modelValue: unref(datePreset),
                                "onUpdate:modelValue": ($event) => isRef(datePreset) ? datePreset.value = $event : null,
                                items: datePresetItems,
                                "item-title": "title",
                                "item-value": "value",
                                label: "All Dates",
                                variant: "outlined",
                                density: "compact",
                                "hide-details": "",
                                clearable: ""
                              }, null, _parent5, _scopeId4));
                            } else {
                              return [
                                createVNode(VSelect, {
                                  modelValue: unref(datePreset),
                                  "onUpdate:modelValue": ($event) => isRef(datePreset) ? datePreset.value = $event : null,
                                  items: datePresetItems,
                                  "item-title": "title",
                                  "item-value": "value",
                                  label: "All Dates",
                                  variant: "outlined",
                                  density: "compact",
                                  "hide-details": "",
                                  clearable: ""
                                }, null, 8, ["modelValue", "onUpdate:modelValue"])
                              ];
                            }
                          }),
                          _: 1
                        }, _parent4, _scopeId3));
                        if (unref(datePreset) === "custom") {
                          _push4(`<!--[-->`);
                          _push4(ssrRenderComponent(VCol, {
                            cols: "6",
                            lg: "2"
                          }, {
                            default: withCtx((_4, _push5, _parent5, _scopeId4) => {
                              if (_push5) {
                                _push5(ssrRenderComponent(VTextField, {
                                  modelValue: unref(dateFrom),
                                  "onUpdate:modelValue": ($event) => isRef(dateFrom) ? dateFrom.value = $event : null,
                                  type: "date",
                                  label: "From",
                                  variant: "outlined",
                                  density: "compact",
                                  "hide-details": "",
                                  clearable: ""
                                }, null, _parent5, _scopeId4));
                              } else {
                                return [
                                  createVNode(VTextField, {
                                    modelValue: unref(dateFrom),
                                    "onUpdate:modelValue": ($event) => isRef(dateFrom) ? dateFrom.value = $event : null,
                                    type: "date",
                                    label: "From",
                                    variant: "outlined",
                                    density: "compact",
                                    "hide-details": "",
                                    clearable: ""
                                  }, null, 8, ["modelValue", "onUpdate:modelValue"])
                                ];
                              }
                            }),
                            _: 1
                          }, _parent4, _scopeId3));
                          _push4(ssrRenderComponent(VCol, {
                            cols: "6",
                            lg: "2"
                          }, {
                            default: withCtx((_4, _push5, _parent5, _scopeId4) => {
                              if (_push5) {
                                _push5(ssrRenderComponent(VTextField, {
                                  modelValue: unref(dateTo),
                                  "onUpdate:modelValue": ($event) => isRef(dateTo) ? dateTo.value = $event : null,
                                  type: "date",
                                  label: "To",
                                  variant: "outlined",
                                  density: "compact",
                                  "hide-details": "",
                                  clearable: ""
                                }, null, _parent5, _scopeId4));
                              } else {
                                return [
                                  createVNode(VTextField, {
                                    modelValue: unref(dateTo),
                                    "onUpdate:modelValue": ($event) => isRef(dateTo) ? dateTo.value = $event : null,
                                    type: "date",
                                    label: "To",
                                    variant: "outlined",
                                    density: "compact",
                                    "hide-details": "",
                                    clearable: ""
                                  }, null, 8, ["modelValue", "onUpdate:modelValue"])
                                ];
                              }
                            }),
                            _: 1
                          }, _parent4, _scopeId3));
                          _push4(`<!--]-->`);
                        } else {
                          _push4(`<!---->`);
                        }
                        _push4(ssrRenderComponent(VCol, {
                          cols: "6",
                          lg: "2"
                        }, {
                          default: withCtx((_4, _push5, _parent5, _scopeId4) => {
                            if (_push5) {
                              _push5(ssrRenderComponent(VSelect, {
                                modelValue: unref(sortBy),
                                "onUpdate:modelValue": ($event) => isRef(sortBy) ? sortBy.value = $event : null,
                                items: sortItems,
                                "item-title": "title",
                                "item-value": "value",
                                label: "Sort",
                                variant: "outlined",
                                density: "compact",
                                "hide-details": ""
                              }, null, _parent5, _scopeId4));
                            } else {
                              return [
                                createVNode(VSelect, {
                                  modelValue: unref(sortBy),
                                  "onUpdate:modelValue": ($event) => isRef(sortBy) ? sortBy.value = $event : null,
                                  items: sortItems,
                                  "item-title": "title",
                                  "item-value": "value",
                                  label: "Sort",
                                  variant: "outlined",
                                  density: "compact",
                                  "hide-details": ""
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
                            lg: "5"
                          }, {
                            default: withCtx(() => [
                              createVNode(VTextField, {
                                modelValue: unref(searchQuery),
                                "onUpdate:modelValue": ($event) => isRef(searchQuery) ? searchQuery.value = $event : null,
                                placeholder: "Search by product, SKU, reference...",
                                variant: "outlined",
                                density: "compact",
                                "prepend-inner-icon": "mdi-magnify",
                                "hide-details": "",
                                clearable: ""
                              }, null, 8, ["modelValue", "onUpdate:modelValue"])
                            ]),
                            _: 1
                          }),
                          createVNode(VCol, {
                            cols: "6",
                            lg: "2"
                          }, {
                            default: withCtx(() => [
                              createVNode(VSelect, {
                                modelValue: unref(filterType),
                                "onUpdate:modelValue": ($event) => isRef(filterType) ? filterType.value = $event : null,
                                items: typeFilterItems,
                                "item-title": "title",
                                "item-value": "value",
                                label: "All Types",
                                variant: "outlined",
                                density: "compact",
                                "hide-details": "",
                                clearable: ""
                              }, null, 8, ["modelValue", "onUpdate:modelValue"])
                            ]),
                            _: 1
                          }),
                          createVNode(VCol, {
                            cols: "6",
                            lg: "2"
                          }, {
                            default: withCtx(() => [
                              createVNode(VSelect, {
                                modelValue: unref(filterBranch),
                                "onUpdate:modelValue": ($event) => isRef(filterBranch) ? filterBranch.value = $event : null,
                                items: unref(branchItems),
                                "item-title": "name",
                                "item-value": "code",
                                label: "All Branches",
                                variant: "outlined",
                                density: "compact",
                                "hide-details": "",
                                clearable: ""
                              }, null, 8, ["modelValue", "onUpdate:modelValue", "items"])
                            ]),
                            _: 1
                          }),
                          createVNode(VCol, {
                            cols: "6",
                            lg: "2"
                          }, {
                            default: withCtx(() => [
                              createVNode(VSelect, {
                                modelValue: unref(datePreset),
                                "onUpdate:modelValue": ($event) => isRef(datePreset) ? datePreset.value = $event : null,
                                items: datePresetItems,
                                "item-title": "title",
                                "item-value": "value",
                                label: "All Dates",
                                variant: "outlined",
                                density: "compact",
                                "hide-details": "",
                                clearable: ""
                              }, null, 8, ["modelValue", "onUpdate:modelValue"])
                            ]),
                            _: 1
                          }),
                          unref(datePreset) === "custom" ? (openBlock(), createBlock(Fragment, { key: 0 }, [
                            createVNode(VCol, {
                              cols: "6",
                              lg: "2"
                            }, {
                              default: withCtx(() => [
                                createVNode(VTextField, {
                                  modelValue: unref(dateFrom),
                                  "onUpdate:modelValue": ($event) => isRef(dateFrom) ? dateFrom.value = $event : null,
                                  type: "date",
                                  label: "From",
                                  variant: "outlined",
                                  density: "compact",
                                  "hide-details": "",
                                  clearable: ""
                                }, null, 8, ["modelValue", "onUpdate:modelValue"])
                              ]),
                              _: 1
                            }),
                            createVNode(VCol, {
                              cols: "6",
                              lg: "2"
                            }, {
                              default: withCtx(() => [
                                createVNode(VTextField, {
                                  modelValue: unref(dateTo),
                                  "onUpdate:modelValue": ($event) => isRef(dateTo) ? dateTo.value = $event : null,
                                  type: "date",
                                  label: "To",
                                  variant: "outlined",
                                  density: "compact",
                                  "hide-details": "",
                                  clearable: ""
                                }, null, 8, ["modelValue", "onUpdate:modelValue"])
                              ]),
                              _: 1
                            })
                          ], 64)) : createCommentVNode("", true),
                          createVNode(VCol, {
                            cols: "6",
                            lg: "2"
                          }, {
                            default: withCtx(() => [
                              createVNode(VSelect, {
                                modelValue: unref(sortBy),
                                "onUpdate:modelValue": ($event) => isRef(sortBy) ? sortBy.value = $event : null,
                                items: sortItems,
                                "item-title": "title",
                                "item-value": "value",
                                label: "Sort",
                                variant: "outlined",
                                density: "compact",
                                "hide-details": ""
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
                    createVNode(VRow, { density: "comfortable" }, {
                      default: withCtx(() => [
                        createVNode(VCol, {
                          cols: "12",
                          lg: "5"
                        }, {
                          default: withCtx(() => [
                            createVNode(VTextField, {
                              modelValue: unref(searchQuery),
                              "onUpdate:modelValue": ($event) => isRef(searchQuery) ? searchQuery.value = $event : null,
                              placeholder: "Search by product, SKU, reference...",
                              variant: "outlined",
                              density: "compact",
                              "prepend-inner-icon": "mdi-magnify",
                              "hide-details": "",
                              clearable: ""
                            }, null, 8, ["modelValue", "onUpdate:modelValue"])
                          ]),
                          _: 1
                        }),
                        createVNode(VCol, {
                          cols: "6",
                          lg: "2"
                        }, {
                          default: withCtx(() => [
                            createVNode(VSelect, {
                              modelValue: unref(filterType),
                              "onUpdate:modelValue": ($event) => isRef(filterType) ? filterType.value = $event : null,
                              items: typeFilterItems,
                              "item-title": "title",
                              "item-value": "value",
                              label: "All Types",
                              variant: "outlined",
                              density: "compact",
                              "hide-details": "",
                              clearable: ""
                            }, null, 8, ["modelValue", "onUpdate:modelValue"])
                          ]),
                          _: 1
                        }),
                        createVNode(VCol, {
                          cols: "6",
                          lg: "2"
                        }, {
                          default: withCtx(() => [
                            createVNode(VSelect, {
                              modelValue: unref(filterBranch),
                              "onUpdate:modelValue": ($event) => isRef(filterBranch) ? filterBranch.value = $event : null,
                              items: unref(branchItems),
                              "item-title": "name",
                              "item-value": "code",
                              label: "All Branches",
                              variant: "outlined",
                              density: "compact",
                              "hide-details": "",
                              clearable: ""
                            }, null, 8, ["modelValue", "onUpdate:modelValue", "items"])
                          ]),
                          _: 1
                        }),
                        createVNode(VCol, {
                          cols: "6",
                          lg: "2"
                        }, {
                          default: withCtx(() => [
                            createVNode(VSelect, {
                              modelValue: unref(datePreset),
                              "onUpdate:modelValue": ($event) => isRef(datePreset) ? datePreset.value = $event : null,
                              items: datePresetItems,
                              "item-title": "title",
                              "item-value": "value",
                              label: "All Dates",
                              variant: "outlined",
                              density: "compact",
                              "hide-details": "",
                              clearable: ""
                            }, null, 8, ["modelValue", "onUpdate:modelValue"])
                          ]),
                          _: 1
                        }),
                        unref(datePreset) === "custom" ? (openBlock(), createBlock(Fragment, { key: 0 }, [
                          createVNode(VCol, {
                            cols: "6",
                            lg: "2"
                          }, {
                            default: withCtx(() => [
                              createVNode(VTextField, {
                                modelValue: unref(dateFrom),
                                "onUpdate:modelValue": ($event) => isRef(dateFrom) ? dateFrom.value = $event : null,
                                type: "date",
                                label: "From",
                                variant: "outlined",
                                density: "compact",
                                "hide-details": "",
                                clearable: ""
                              }, null, 8, ["modelValue", "onUpdate:modelValue"])
                            ]),
                            _: 1
                          }),
                          createVNode(VCol, {
                            cols: "6",
                            lg: "2"
                          }, {
                            default: withCtx(() => [
                              createVNode(VTextField, {
                                modelValue: unref(dateTo),
                                "onUpdate:modelValue": ($event) => isRef(dateTo) ? dateTo.value = $event : null,
                                type: "date",
                                label: "To",
                                variant: "outlined",
                                density: "compact",
                                "hide-details": "",
                                clearable: ""
                              }, null, 8, ["modelValue", "onUpdate:modelValue"])
                            ]),
                            _: 1
                          })
                        ], 64)) : createCommentVNode("", true),
                        createVNode(VCol, {
                          cols: "6",
                          lg: "2"
                        }, {
                          default: withCtx(() => [
                            createVNode(VSelect, {
                              modelValue: unref(sortBy),
                              "onUpdate:modelValue": ($event) => isRef(sortBy) ? sortBy.value = $event : null,
                              items: sortItems,
                              "item-title": "title",
                              "item-value": "value",
                              label: "Sort",
                              variant: "outlined",
                              density: "compact",
                              "hide-details": ""
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
            if (unref(hasActiveFilters)) {
              _push2(`<div class="d-flex align-center flex-wrap ga-2 mb-4"${_scopeId}><span class="text-body-2 text-medium-emphasis"${_scopeId}>Filters:</span>`);
              if (unref(searchQuery)) {
                _push2(ssrRenderComponent(VChip, {
                  size: "small",
                  color: "primary",
                  closable: "",
                  "onClick:close": ($event) => searchQuery.value = ""
                }, {
                  default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                    if (_push3) {
                      _push3(` Search: &quot;${ssrInterpolate(unref(searchQuery))}&quot; `);
                    } else {
                      return [
                        createTextVNode(' Search: "' + toDisplayString(unref(searchQuery)) + '" ', 1)
                      ];
                    }
                  }),
                  _: 1
                }, _parent2, _scopeId));
              } else {
                _push2(`<!---->`);
              }
              if (unref(filterType)) {
                _push2(ssrRenderComponent(VChip, {
                  size: "small",
                  color: "indigo",
                  closable: "",
                  "onClick:close": ($event) => filterType.value = ""
                }, {
                  default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                    if (_push3) {
                      _push3(` Type: ${ssrInterpolate(typeLabel(unref(filterType)))}`);
                    } else {
                      return [
                        createTextVNode(" Type: " + toDisplayString(typeLabel(unref(filterType))), 1)
                      ];
                    }
                  }),
                  _: 1
                }, _parent2, _scopeId));
              } else {
                _push2(`<!---->`);
              }
              if (unref(filterBranch)) {
                _push2(ssrRenderComponent(VChip, {
                  size: "small",
                  color: "teal",
                  closable: "",
                  "onClick:close": ($event) => filterBranch.value = ""
                }, {
                  default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                    if (_push3) {
                      _push3(` Branch: ${ssrInterpolate(unref(filterBranch))}`);
                    } else {
                      return [
                        createTextVNode(" Branch: " + toDisplayString(unref(filterBranch)), 1)
                      ];
                    }
                  }),
                  _: 1
                }, _parent2, _scopeId));
              } else {
                _push2(`<!---->`);
              }
              if (unref(datePreset) && unref(datePreset) !== "custom") {
                _push2(ssrRenderComponent(VChip, {
                  size: "small",
                  color: "cyan",
                  closable: "",
                  "onClick:close": ($event) => datePreset.value = ""
                }, {
                  default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                    if (_push3) {
                      _push3(`${ssrInterpolate(unref(datePresetLabel))}`);
                    } else {
                      return [
                        createTextVNode(toDisplayString(unref(datePresetLabel)), 1)
                      ];
                    }
                  }),
                  _: 1
                }, _parent2, _scopeId));
              } else {
                _push2(`<!---->`);
              }
              if (unref(datePreset) === "custom") {
                _push2(`<!--[-->`);
                if (unref(dateFrom)) {
                  _push2(ssrRenderComponent(VChip, {
                    size: "small",
                    color: "cyan",
                    closable: "",
                    "onClick:close": ($event) => dateFrom.value = ""
                  }, {
                    default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                      if (_push3) {
                        _push3(` From: ${ssrInterpolate(unref(dateFrom))}`);
                      } else {
                        return [
                          createTextVNode(" From: " + toDisplayString(unref(dateFrom)), 1)
                        ];
                      }
                    }),
                    _: 1
                  }, _parent2, _scopeId));
                } else {
                  _push2(`<!---->`);
                }
                if (unref(dateTo)) {
                  _push2(ssrRenderComponent(VChip, {
                    size: "small",
                    color: "cyan",
                    closable: "",
                    "onClick:close": ($event) => dateTo.value = ""
                  }, {
                    default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                      if (_push3) {
                        _push3(` To: ${ssrInterpolate(unref(dateTo))}`);
                      } else {
                        return [
                          createTextVNode(" To: " + toDisplayString(unref(dateTo)), 1)
                        ];
                      }
                    }),
                    _: 1
                  }, _parent2, _scopeId));
                } else {
                  _push2(`<!---->`);
                }
                _push2(`<!--]-->`);
              } else {
                _push2(`<!---->`);
              }
              _push2(ssrRenderComponent(VBtn, {
                variant: "text",
                size: "small",
                color: "error",
                onClick: clearAllFilters
              }, {
                default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                  if (_push3) {
                    _push3(`Clear all`);
                  } else {
                    return [
                      createTextVNode("Clear all")
                    ];
                  }
                }),
                _: 1
              }, _parent2, _scopeId));
              _push2(`</div>`);
            } else {
              _push2(`<!---->`);
            }
            if (unref(loading)) {
              _push2(ssrRenderComponent(VCard, {
                flat: "",
                border: "",
                rounded: "xl",
                class: "py-16 d-flex flex-column align-center justify-center ga-4"
              }, {
                default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                  if (_push3) {
                    _push3(ssrRenderComponent(VProgressCircular, {
                      indeterminate: "",
                      color: "primary",
                      size: "48",
                      width: "4"
                    }, null, _parent3, _scopeId2));
                    _push3(`<div class="text-body-2 text-medium-emphasis"${_scopeId2}>Loading movements...</div>`);
                  } else {
                    return [
                      createVNode(VProgressCircular, {
                        indeterminate: "",
                        color: "primary",
                        size: "48",
                        width: "4"
                      }),
                      createVNode("div", { class: "text-body-2 text-medium-emphasis" }, "Loading movements...")
                    ];
                  }
                }),
                _: 1
              }, _parent2, _scopeId));
            } else if (unref(filteredMovements).length === 0) {
              _push2(ssrRenderComponent(VCard, {
                flat: "",
                border: "",
                rounded: "xl",
                class: "py-16 text-center"
              }, {
                default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                  if (_push3) {
                    _push3(ssrRenderComponent(VAvatar, {
                      color: "blue-lighten-5",
                      size: "80",
                      class: "mb-4"
                    }, {
                      default: withCtx((_3, _push4, _parent4, _scopeId3) => {
                        if (_push4) {
                          _push4(ssrRenderComponent(VIcon, {
                            color: "blue",
                            size: "40"
                          }, {
                            default: withCtx((_4, _push5, _parent5, _scopeId4) => {
                              if (_push5) {
                                _push5(`mdi-swap-horizontal`);
                              } else {
                                return [
                                  createTextVNode("mdi-swap-horizontal")
                                ];
                              }
                            }),
                            _: 1
                          }, _parent4, _scopeId3));
                        } else {
                          return [
                            createVNode(VIcon, {
                              color: "blue",
                              size: "40"
                            }, {
                              default: withCtx(() => [
                                createTextVNode("mdi-swap-horizontal")
                              ]),
                              _: 1
                            })
                          ];
                        }
                      }),
                      _: 1
                    }, _parent3, _scopeId2));
                    _push3(`<div class="text-h6 font-weight-bold mb-1"${_scopeId2}>No movements found</div><div class="text-body-2 text-medium-emphasis"${_scopeId2}>${ssrInterpolate(unref(hasActiveFilters) ? "Try adjusting your filters." : "Stock movements will appear here once recorded.")}</div>`);
                  } else {
                    return [
                      createVNode(VAvatar, {
                        color: "blue-lighten-5",
                        size: "80",
                        class: "mb-4"
                      }, {
                        default: withCtx(() => [
                          createVNode(VIcon, {
                            color: "blue",
                            size: "40"
                          }, {
                            default: withCtx(() => [
                              createTextVNode("mdi-swap-horizontal")
                            ]),
                            _: 1
                          })
                        ]),
                        _: 1
                      }),
                      createVNode("div", { class: "text-h6 font-weight-bold mb-1" }, "No movements found"),
                      createVNode("div", { class: "text-body-2 text-medium-emphasis" }, toDisplayString(unref(hasActiveFilters) ? "Try adjusting your filters." : "Stock movements will appear here once recorded."), 1)
                    ];
                  }
                }),
                _: 1
              }, _parent2, _scopeId));
            } else {
              _push2(ssrRenderComponent(VCard, {
                flat: "",
                border: "",
                rounded: "xl",
                class: "overflow-hidden"
              }, {
                default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                  if (_push3) {
                    _push3(ssrRenderComponent(VTable, {
                      density: "compact",
                      hover: ""
                    }, {
                      default: withCtx((_3, _push4, _parent4, _scopeId3) => {
                        if (_push4) {
                          _push4(`<thead class="bg-grey-lighten-4"${_scopeId3}><tr${_scopeId3}><th class="text-center" style="${ssrRenderStyle({ "width": "52px" })}"${_scopeId3}>#</th><th class="text-left" style="${ssrRenderStyle({ "min-width": "180px" })}"${_scopeId3}>Product</th><th class="text-left"${_scopeId3}>Branch</th><th class="text-left"${_scopeId3}>Type</th><th class="text-right"${_scopeId3}>Qty Change</th><th class="text-right"${_scopeId3}>After</th><th class="text-left"${_scopeId3}>Reference</th><th class="text-left"${_scopeId3}>By</th><th class="text-left"${_scopeId3}>Date</th></tr></thead><tbody${_scopeId3}><!--[-->`);
                          ssrRenderList(unref(pagedMovements), (m, idx) => {
                            _push4(`<tr${_scopeId3}><td class="text-center text-caption text-disabled font-weight-bold"${_scopeId3}>${ssrInterpolate(rowNumber(idx))}</td><td${_scopeId3}><div class="d-flex align-center ga-2"${_scopeId3}>`);
                            _push4(ssrRenderComponent(VAvatar, {
                              size: "32",
                              rounded: "lg",
                              color: typeColor(m.movement_type),
                              variant: "tonal"
                            }, {
                              default: withCtx((_4, _push5, _parent5, _scopeId4) => {
                                if (_push5) {
                                  _push5(ssrRenderComponent(VIcon, {
                                    size: "18",
                                    icon: typeIcon(m.movement_type)
                                  }, null, _parent5, _scopeId4));
                                } else {
                                  return [
                                    createVNode(VIcon, {
                                      size: "18",
                                      icon: typeIcon(m.movement_type)
                                    }, null, 8, ["icon"])
                                  ];
                                }
                              }),
                              _: 2
                            }, _parent4, _scopeId3));
                            _push4(`<div${_scopeId3}><div class="text-body-2 font-weight-bold"${_scopeId3}>${ssrInterpolate(m.product_name)}</div><div class="text-caption text-disabled"${_scopeId3}>${ssrInterpolate(m.product_sku)}</div></div></div></td><td class="text-body-2"${_scopeId3}>${ssrInterpolate(m.branch_code)}</td><td${_scopeId3}>`);
                            _push4(ssrRenderComponent(VChip, {
                              size: "small",
                              color: typeColor(m.movement_type),
                              variant: "tonal",
                              class: "text-capitalize"
                            }, {
                              default: withCtx((_4, _push5, _parent5, _scopeId4) => {
                                if (_push5) {
                                  _push5(`${ssrInterpolate(m.movement_type_display || m.movement_type)}`);
                                } else {
                                  return [
                                    createTextVNode(toDisplayString(m.movement_type_display || m.movement_type), 1)
                                  ];
                                }
                              }),
                              _: 2
                            }, _parent4, _scopeId3));
                            _push4(`</td><td class="text-right"${_scopeId3}><span class="${ssrRenderClass([qtyClass(m.quantity_change), "font-weight-bold"])}"${_scopeId3}>${ssrInterpolate(parseFloat(m.quantity_change) > 0 ? "+" : "")}${ssrInterpolate(unref(formatNumber)(m.quantity_change))}</span></td><td class="text-right text-body-2"${_scopeId3}>${ssrInterpolate(unref(formatNumber)(m.quantity_after))}</td><td${_scopeId3}>`);
                            if (m.reference) {
                              _push4(`<span class="text-body-2 font-mono"${_scopeId3}>${ssrInterpolate(m.reference)}</span>`);
                            } else {
                              _push4(`<span class="text-disabled"${_scopeId3}>—</span>`);
                            }
                            _push4(`</td><td class="text-body-2 text-medium-emphasis"${_scopeId3}>${ssrInterpolate(m.performed_by_name || "—")}</td><td class="text-body-2 text-medium-emphasis"${_scopeId3}>${ssrInterpolate(unref(datetime)(m.created_at))}</td></tr>`);
                          });
                          _push4(`<!--]--></tbody>`);
                        } else {
                          return [
                            createVNode("thead", { class: "bg-grey-lighten-4" }, [
                              createVNode("tr", null, [
                                createVNode("th", {
                                  class: "text-center",
                                  style: { "width": "52px" }
                                }, "#"),
                                createVNode("th", {
                                  class: "text-left",
                                  style: { "min-width": "180px" }
                                }, "Product"),
                                createVNode("th", { class: "text-left" }, "Branch"),
                                createVNode("th", { class: "text-left" }, "Type"),
                                createVNode("th", { class: "text-right" }, "Qty Change"),
                                createVNode("th", { class: "text-right" }, "After"),
                                createVNode("th", { class: "text-left" }, "Reference"),
                                createVNode("th", { class: "text-left" }, "By"),
                                createVNode("th", { class: "text-left" }, "Date")
                              ])
                            ]),
                            createVNode("tbody", null, [
                              (openBlock(true), createBlock(Fragment, null, renderList(unref(pagedMovements), (m, idx) => {
                                return openBlock(), createBlock("tr", {
                                  key: m.id
                                }, [
                                  createVNode("td", { class: "text-center text-caption text-disabled font-weight-bold" }, toDisplayString(rowNumber(idx)), 1),
                                  createVNode("td", null, [
                                    createVNode("div", { class: "d-flex align-center ga-2" }, [
                                      createVNode(VAvatar, {
                                        size: "32",
                                        rounded: "lg",
                                        color: typeColor(m.movement_type),
                                        variant: "tonal"
                                      }, {
                                        default: withCtx(() => [
                                          createVNode(VIcon, {
                                            size: "18",
                                            icon: typeIcon(m.movement_type)
                                          }, null, 8, ["icon"])
                                        ]),
                                        _: 2
                                      }, 1032, ["color"]),
                                      createVNode("div", null, [
                                        createVNode("div", { class: "text-body-2 font-weight-bold" }, toDisplayString(m.product_name), 1),
                                        createVNode("div", { class: "text-caption text-disabled" }, toDisplayString(m.product_sku), 1)
                                      ])
                                    ])
                                  ]),
                                  createVNode("td", { class: "text-body-2" }, toDisplayString(m.branch_code), 1),
                                  createVNode("td", null, [
                                    createVNode(VChip, {
                                      size: "small",
                                      color: typeColor(m.movement_type),
                                      variant: "tonal",
                                      class: "text-capitalize"
                                    }, {
                                      default: withCtx(() => [
                                        createTextVNode(toDisplayString(m.movement_type_display || m.movement_type), 1)
                                      ]),
                                      _: 2
                                    }, 1032, ["color"])
                                  ]),
                                  createVNode("td", { class: "text-right" }, [
                                    createVNode("span", {
                                      class: ["font-weight-bold", qtyClass(m.quantity_change)]
                                    }, toDisplayString(parseFloat(m.quantity_change) > 0 ? "+" : "") + toDisplayString(unref(formatNumber)(m.quantity_change)), 3)
                                  ]),
                                  createVNode("td", { class: "text-right text-body-2" }, toDisplayString(unref(formatNumber)(m.quantity_after)), 1),
                                  createVNode("td", null, [
                                    m.reference ? (openBlock(), createBlock("span", {
                                      key: 0,
                                      class: "text-body-2 font-mono"
                                    }, toDisplayString(m.reference), 1)) : (openBlock(), createBlock("span", {
                                      key: 1,
                                      class: "text-disabled"
                                    }, "—"))
                                  ]),
                                  createVNode("td", { class: "text-body-2 text-medium-emphasis" }, toDisplayString(m.performed_by_name || "—"), 1),
                                  createVNode("td", { class: "text-body-2 text-medium-emphasis" }, toDisplayString(unref(datetime)(m.created_at)), 1)
                                ]);
                              }), 128))
                            ])
                          ];
                        }
                      }),
                      _: 1
                    }, _parent3, _scopeId2));
                    _push3(ssrRenderComponent(_component_PaginationBar, {
                      count: unref(filteredMovements).length,
                      next: unref(currentPage) < unref(totalPages) ? "yes" : null,
                      previous: unref(currentPage) > 1 ? "yes" : null,
                      page: unref(currentPage),
                      pageSize,
                      totalPages: unref(totalPages),
                      onPageChange: ($event) => currentPage.value = $event
                    }, null, _parent3, _scopeId2));
                  } else {
                    return [
                      createVNode(VTable, {
                        density: "compact",
                        hover: ""
                      }, {
                        default: withCtx(() => [
                          createVNode("thead", { class: "bg-grey-lighten-4" }, [
                            createVNode("tr", null, [
                              createVNode("th", {
                                class: "text-center",
                                style: { "width": "52px" }
                              }, "#"),
                              createVNode("th", {
                                class: "text-left",
                                style: { "min-width": "180px" }
                              }, "Product"),
                              createVNode("th", { class: "text-left" }, "Branch"),
                              createVNode("th", { class: "text-left" }, "Type"),
                              createVNode("th", { class: "text-right" }, "Qty Change"),
                              createVNode("th", { class: "text-right" }, "After"),
                              createVNode("th", { class: "text-left" }, "Reference"),
                              createVNode("th", { class: "text-left" }, "By"),
                              createVNode("th", { class: "text-left" }, "Date")
                            ])
                          ]),
                          createVNode("tbody", null, [
                            (openBlock(true), createBlock(Fragment, null, renderList(unref(pagedMovements), (m, idx) => {
                              return openBlock(), createBlock("tr", {
                                key: m.id
                              }, [
                                createVNode("td", { class: "text-center text-caption text-disabled font-weight-bold" }, toDisplayString(rowNumber(idx)), 1),
                                createVNode("td", null, [
                                  createVNode("div", { class: "d-flex align-center ga-2" }, [
                                    createVNode(VAvatar, {
                                      size: "32",
                                      rounded: "lg",
                                      color: typeColor(m.movement_type),
                                      variant: "tonal"
                                    }, {
                                      default: withCtx(() => [
                                        createVNode(VIcon, {
                                          size: "18",
                                          icon: typeIcon(m.movement_type)
                                        }, null, 8, ["icon"])
                                      ]),
                                      _: 2
                                    }, 1032, ["color"]),
                                    createVNode("div", null, [
                                      createVNode("div", { class: "text-body-2 font-weight-bold" }, toDisplayString(m.product_name), 1),
                                      createVNode("div", { class: "text-caption text-disabled" }, toDisplayString(m.product_sku), 1)
                                    ])
                                  ])
                                ]),
                                createVNode("td", { class: "text-body-2" }, toDisplayString(m.branch_code), 1),
                                createVNode("td", null, [
                                  createVNode(VChip, {
                                    size: "small",
                                    color: typeColor(m.movement_type),
                                    variant: "tonal",
                                    class: "text-capitalize"
                                  }, {
                                    default: withCtx(() => [
                                      createTextVNode(toDisplayString(m.movement_type_display || m.movement_type), 1)
                                    ]),
                                    _: 2
                                  }, 1032, ["color"])
                                ]),
                                createVNode("td", { class: "text-right" }, [
                                  createVNode("span", {
                                    class: ["font-weight-bold", qtyClass(m.quantity_change)]
                                  }, toDisplayString(parseFloat(m.quantity_change) > 0 ? "+" : "") + toDisplayString(unref(formatNumber)(m.quantity_change)), 3)
                                ]),
                                createVNode("td", { class: "text-right text-body-2" }, toDisplayString(unref(formatNumber)(m.quantity_after)), 1),
                                createVNode("td", null, [
                                  m.reference ? (openBlock(), createBlock("span", {
                                    key: 0,
                                    class: "text-body-2 font-mono"
                                  }, toDisplayString(m.reference), 1)) : (openBlock(), createBlock("span", {
                                    key: 1,
                                    class: "text-disabled"
                                  }, "—"))
                                ]),
                                createVNode("td", { class: "text-body-2 text-medium-emphasis" }, toDisplayString(m.performed_by_name || "—"), 1),
                                createVNode("td", { class: "text-body-2 text-medium-emphasis" }, toDisplayString(unref(datetime)(m.created_at)), 1)
                              ]);
                            }), 128))
                          ])
                        ]),
                        _: 1
                      }),
                      createVNode(_component_PaginationBar, {
                        count: unref(filteredMovements).length,
                        next: unref(currentPage) < unref(totalPages) ? "yes" : null,
                        previous: unref(currentPage) > 1 ? "yes" : null,
                        page: unref(currentPage),
                        pageSize,
                        totalPages: unref(totalPages),
                        onPageChange: ($event) => currentPage.value = $event
                      }, null, 8, ["count", "next", "previous", "page", "totalPages", "onPageChange"])
                    ];
                  }
                }),
                _: 1
              }, _parent2, _scopeId));
            }
          } else {
            return [
              createVNode(VRow, { class: "d-flex align-center justify-space-between mb-4" }, {
                default: withCtx(() => [
                  createVNode(VCol, {
                    cols: "12",
                    sm: "6"
                  }, {
                    default: withCtx(() => [
                      createVNode("div", { class: "text-h5 font-weight-bold" }, "Stock Movements"),
                      createVNode("div", { class: "text-body-2 text-medium-emphasis" }, toDisplayString(unref(stats).total) + " movements · " + toDisplayString(unref(stats).netIn) + " units net in · " + toDisplayString(unref(stats).netOut) + " units net out ", 1)
                    ]),
                    _: 1
                  }),
                  createVNode(VCol, {
                    cols: "12",
                    sm: "6",
                    class: "d-flex justify-end ga-2 flex-wrap"
                  }, {
                    default: withCtx(() => [
                      createVNode(VBtn, {
                        variant: "outlined",
                        "prepend-icon": "mdi-download",
                        onClick: exportCsv
                      }, {
                        default: withCtx(() => [
                          createTextVNode("Export")
                        ]),
                        _: 1
                      }),
                      createVNode(VBtn, {
                        variant: "outlined",
                        "prepend-icon": "mdi-refresh",
                        onClick: loadMovements
                      }, {
                        default: withCtx(() => [
                          createTextVNode("Refresh")
                        ]),
                        _: 1
                      })
                    ]),
                    _: 1
                  })
                ]),
                _: 1
              }),
              createVNode(VRow, { class: "mb-4" }, {
                default: withCtx(() => [
                  createVNode(VCol, {
                    cols: "6",
                    lg: "3"
                  }, {
                    default: withCtx(() => [
                      createVNode(VCard, {
                        class: "pa-5 bg-surface",
                        flat: "",
                        border: "",
                        style: { "border-top": "4px solid rgb(var(--v-theme-blue)) !important", "border-radius": "10px !important" }
                      }, {
                        default: withCtx(() => [
                          createVNode("div", { class: "d-flex align-start justify-space-between" }, [
                            createVNode("div", null, [
                              createVNode("div", { class: "text-caption text-medium-emphasis text-uppercase" }, "Total Movements"),
                              createVNode("div", { class: "text-h5 font-weight-bold mt-2" }, toDisplayString(unref(stats).total), 1)
                            ]),
                            createVNode(VAvatar, {
                              color: "blue-lighten-5",
                              rounded: "lg",
                              size: "40"
                            }, {
                              default: withCtx(() => [
                                createVNode(VIcon, { color: "blue" }, {
                                  default: withCtx(() => [
                                    createTextVNode("mdi-swap-horizontal")
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
                    ]),
                    _: 1
                  }),
                  createVNode(VCol, {
                    cols: "6",
                    lg: "3"
                  }, {
                    default: withCtx(() => [
                      createVNode(VCard, {
                        class: "pa-5 bg-surface",
                        flat: "",
                        border: "",
                        style: { "border-top": "4px solid rgb(var(--v-theme-green)) !important", "border-radius": "10px !important" }
                      }, {
                        default: withCtx(() => [
                          createVNode("div", { class: "d-flex align-start justify-space-between" }, [
                            createVNode("div", null, [
                              createVNode("div", { class: "text-caption text-medium-emphasis text-uppercase" }, "Units In"),
                              createVNode("div", { class: "text-h5 font-weight-bold text-success mt-2" }, "+" + toDisplayString(unref(formatNumber)(unref(stats).totalIn)), 1)
                            ]),
                            createVNode(VAvatar, {
                              color: "green-lighten-5",
                              rounded: "lg",
                              size: "40"
                            }, {
                              default: withCtx(() => [
                                createVNode(VIcon, { color: "green" }, {
                                  default: withCtx(() => [
                                    createTextVNode("mdi-trending-up")
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
                    ]),
                    _: 1
                  }),
                  createVNode(VCol, {
                    cols: "6",
                    lg: "3"
                  }, {
                    default: withCtx(() => [
                      createVNode(VCard, {
                        class: "pa-5 bg-surface",
                        flat: "",
                        border: "",
                        style: { "border-top": "4px solid rgb(var(--v-theme-red)) !important", "border-radius": "10px !important" }
                      }, {
                        default: withCtx(() => [
                          createVNode("div", { class: "d-flex align-start justify-space-between" }, [
                            createVNode("div", null, [
                              createVNode("div", { class: "text-caption text-medium-emphasis text-uppercase" }, "Units Out"),
                              createVNode("div", { class: "text-h5 font-weight-bold text-error mt-2" }, "-" + toDisplayString(unref(formatNumber)(unref(stats).totalOut)), 1)
                            ]),
                            createVNode(VAvatar, {
                              color: "red-lighten-5",
                              rounded: "lg",
                              size: "40"
                            }, {
                              default: withCtx(() => [
                                createVNode(VIcon, { color: "red" }, {
                                  default: withCtx(() => [
                                    createTextVNode("mdi-trending-down")
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
                    ]),
                    _: 1
                  }),
                  createVNode(VCol, {
                    cols: "6",
                    lg: "3"
                  }, {
                    default: withCtx(() => [
                      createVNode(VCard, {
                        class: "pa-5 bg-surface",
                        flat: "",
                        border: "",
                        style: { "border-top": "4px solid rgb(var(--v-theme-deep-purple)) !important", "border-radius": "10px !important" }
                      }, {
                        default: withCtx(() => [
                          createVNode("div", { class: "d-flex align-start justify-space-between" }, [
                            createVNode("div", null, [
                              createVNode("div", { class: "text-caption text-medium-emphasis text-uppercase" }, "Net Change"),
                              createVNode("div", {
                                class: ["text-h5 font-weight-bold mt-2", unref(stats).netChangeColor]
                              }, toDisplayString(unref(formatNumber)(unref(stats).netChange)), 3)
                            ]),
                            createVNode(VAvatar, {
                              color: "deep-purple-lighten-5",
                              rounded: "lg",
                              size: "40"
                            }, {
                              default: withCtx(() => [
                                createVNode(VIcon, { color: "deep-purple" }, {
                                  default: withCtx(() => [
                                    createTextVNode("mdi-scale-balance")
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
                    ]),
                    _: 1
                  })
                ]),
                _: 1
              }),
              createVNode(VCard, {
                rounded: "xl",
                class: "pa-4 mb-4",
                flat: "",
                border: ""
              }, {
                default: withCtx(() => [
                  createVNode(VRow, { density: "comfortable" }, {
                    default: withCtx(() => [
                      createVNode(VCol, {
                        cols: "12",
                        lg: "5"
                      }, {
                        default: withCtx(() => [
                          createVNode(VTextField, {
                            modelValue: unref(searchQuery),
                            "onUpdate:modelValue": ($event) => isRef(searchQuery) ? searchQuery.value = $event : null,
                            placeholder: "Search by product, SKU, reference...",
                            variant: "outlined",
                            density: "compact",
                            "prepend-inner-icon": "mdi-magnify",
                            "hide-details": "",
                            clearable: ""
                          }, null, 8, ["modelValue", "onUpdate:modelValue"])
                        ]),
                        _: 1
                      }),
                      createVNode(VCol, {
                        cols: "6",
                        lg: "2"
                      }, {
                        default: withCtx(() => [
                          createVNode(VSelect, {
                            modelValue: unref(filterType),
                            "onUpdate:modelValue": ($event) => isRef(filterType) ? filterType.value = $event : null,
                            items: typeFilterItems,
                            "item-title": "title",
                            "item-value": "value",
                            label: "All Types",
                            variant: "outlined",
                            density: "compact",
                            "hide-details": "",
                            clearable: ""
                          }, null, 8, ["modelValue", "onUpdate:modelValue"])
                        ]),
                        _: 1
                      }),
                      createVNode(VCol, {
                        cols: "6",
                        lg: "2"
                      }, {
                        default: withCtx(() => [
                          createVNode(VSelect, {
                            modelValue: unref(filterBranch),
                            "onUpdate:modelValue": ($event) => isRef(filterBranch) ? filterBranch.value = $event : null,
                            items: unref(branchItems),
                            "item-title": "name",
                            "item-value": "code",
                            label: "All Branches",
                            variant: "outlined",
                            density: "compact",
                            "hide-details": "",
                            clearable: ""
                          }, null, 8, ["modelValue", "onUpdate:modelValue", "items"])
                        ]),
                        _: 1
                      }),
                      createVNode(VCol, {
                        cols: "6",
                        lg: "2"
                      }, {
                        default: withCtx(() => [
                          createVNode(VSelect, {
                            modelValue: unref(datePreset),
                            "onUpdate:modelValue": ($event) => isRef(datePreset) ? datePreset.value = $event : null,
                            items: datePresetItems,
                            "item-title": "title",
                            "item-value": "value",
                            label: "All Dates",
                            variant: "outlined",
                            density: "compact",
                            "hide-details": "",
                            clearable: ""
                          }, null, 8, ["modelValue", "onUpdate:modelValue"])
                        ]),
                        _: 1
                      }),
                      unref(datePreset) === "custom" ? (openBlock(), createBlock(Fragment, { key: 0 }, [
                        createVNode(VCol, {
                          cols: "6",
                          lg: "2"
                        }, {
                          default: withCtx(() => [
                            createVNode(VTextField, {
                              modelValue: unref(dateFrom),
                              "onUpdate:modelValue": ($event) => isRef(dateFrom) ? dateFrom.value = $event : null,
                              type: "date",
                              label: "From",
                              variant: "outlined",
                              density: "compact",
                              "hide-details": "",
                              clearable: ""
                            }, null, 8, ["modelValue", "onUpdate:modelValue"])
                          ]),
                          _: 1
                        }),
                        createVNode(VCol, {
                          cols: "6",
                          lg: "2"
                        }, {
                          default: withCtx(() => [
                            createVNode(VTextField, {
                              modelValue: unref(dateTo),
                              "onUpdate:modelValue": ($event) => isRef(dateTo) ? dateTo.value = $event : null,
                              type: "date",
                              label: "To",
                              variant: "outlined",
                              density: "compact",
                              "hide-details": "",
                              clearable: ""
                            }, null, 8, ["modelValue", "onUpdate:modelValue"])
                          ]),
                          _: 1
                        })
                      ], 64)) : createCommentVNode("", true),
                      createVNode(VCol, {
                        cols: "6",
                        lg: "2"
                      }, {
                        default: withCtx(() => [
                          createVNode(VSelect, {
                            modelValue: unref(sortBy),
                            "onUpdate:modelValue": ($event) => isRef(sortBy) ? sortBy.value = $event : null,
                            items: sortItems,
                            "item-title": "title",
                            "item-value": "value",
                            label: "Sort",
                            variant: "outlined",
                            density: "compact",
                            "hide-details": ""
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
              unref(hasActiveFilters) ? (openBlock(), createBlock("div", {
                key: 0,
                class: "d-flex align-center flex-wrap ga-2 mb-4"
              }, [
                createVNode("span", { class: "text-body-2 text-medium-emphasis" }, "Filters:"),
                unref(searchQuery) ? (openBlock(), createBlock(VChip, {
                  key: 0,
                  size: "small",
                  color: "primary",
                  closable: "",
                  "onClick:close": ($event) => searchQuery.value = ""
                }, {
                  default: withCtx(() => [
                    createTextVNode(' Search: "' + toDisplayString(unref(searchQuery)) + '" ', 1)
                  ]),
                  _: 1
                }, 8, ["onClick:close"])) : createCommentVNode("", true),
                unref(filterType) ? (openBlock(), createBlock(VChip, {
                  key: 1,
                  size: "small",
                  color: "indigo",
                  closable: "",
                  "onClick:close": ($event) => filterType.value = ""
                }, {
                  default: withCtx(() => [
                    createTextVNode(" Type: " + toDisplayString(typeLabel(unref(filterType))), 1)
                  ]),
                  _: 1
                }, 8, ["onClick:close"])) : createCommentVNode("", true),
                unref(filterBranch) ? (openBlock(), createBlock(VChip, {
                  key: 2,
                  size: "small",
                  color: "teal",
                  closable: "",
                  "onClick:close": ($event) => filterBranch.value = ""
                }, {
                  default: withCtx(() => [
                    createTextVNode(" Branch: " + toDisplayString(unref(filterBranch)), 1)
                  ]),
                  _: 1
                }, 8, ["onClick:close"])) : createCommentVNode("", true),
                unref(datePreset) && unref(datePreset) !== "custom" ? (openBlock(), createBlock(VChip, {
                  key: 3,
                  size: "small",
                  color: "cyan",
                  closable: "",
                  "onClick:close": ($event) => datePreset.value = ""
                }, {
                  default: withCtx(() => [
                    createTextVNode(toDisplayString(unref(datePresetLabel)), 1)
                  ]),
                  _: 1
                }, 8, ["onClick:close"])) : createCommentVNode("", true),
                unref(datePreset) === "custom" ? (openBlock(), createBlock(Fragment, { key: 4 }, [
                  unref(dateFrom) ? (openBlock(), createBlock(VChip, {
                    key: 0,
                    size: "small",
                    color: "cyan",
                    closable: "",
                    "onClick:close": ($event) => dateFrom.value = ""
                  }, {
                    default: withCtx(() => [
                      createTextVNode(" From: " + toDisplayString(unref(dateFrom)), 1)
                    ]),
                    _: 1
                  }, 8, ["onClick:close"])) : createCommentVNode("", true),
                  unref(dateTo) ? (openBlock(), createBlock(VChip, {
                    key: 1,
                    size: "small",
                    color: "cyan",
                    closable: "",
                    "onClick:close": ($event) => dateTo.value = ""
                  }, {
                    default: withCtx(() => [
                      createTextVNode(" To: " + toDisplayString(unref(dateTo)), 1)
                    ]),
                    _: 1
                  }, 8, ["onClick:close"])) : createCommentVNode("", true)
                ], 64)) : createCommentVNode("", true),
                createVNode(VBtn, {
                  variant: "text",
                  size: "small",
                  color: "error",
                  onClick: clearAllFilters
                }, {
                  default: withCtx(() => [
                    createTextVNode("Clear all")
                  ]),
                  _: 1
                })
              ])) : createCommentVNode("", true),
              unref(loading) ? (openBlock(), createBlock(VCard, {
                key: 1,
                flat: "",
                border: "",
                rounded: "xl",
                class: "py-16 d-flex flex-column align-center justify-center ga-4"
              }, {
                default: withCtx(() => [
                  createVNode(VProgressCircular, {
                    indeterminate: "",
                    color: "primary",
                    size: "48",
                    width: "4"
                  }),
                  createVNode("div", { class: "text-body-2 text-medium-emphasis" }, "Loading movements...")
                ]),
                _: 1
              })) : unref(filteredMovements).length === 0 ? (openBlock(), createBlock(VCard, {
                key: 2,
                flat: "",
                border: "",
                rounded: "xl",
                class: "py-16 text-center"
              }, {
                default: withCtx(() => [
                  createVNode(VAvatar, {
                    color: "blue-lighten-5",
                    size: "80",
                    class: "mb-4"
                  }, {
                    default: withCtx(() => [
                      createVNode(VIcon, {
                        color: "blue",
                        size: "40"
                      }, {
                        default: withCtx(() => [
                          createTextVNode("mdi-swap-horizontal")
                        ]),
                        _: 1
                      })
                    ]),
                    _: 1
                  }),
                  createVNode("div", { class: "text-h6 font-weight-bold mb-1" }, "No movements found"),
                  createVNode("div", { class: "text-body-2 text-medium-emphasis" }, toDisplayString(unref(hasActiveFilters) ? "Try adjusting your filters." : "Stock movements will appear here once recorded."), 1)
                ]),
                _: 1
              })) : (openBlock(), createBlock(VCard, {
                key: 3,
                flat: "",
                border: "",
                rounded: "xl",
                class: "overflow-hidden"
              }, {
                default: withCtx(() => [
                  createVNode(VTable, {
                    density: "compact",
                    hover: ""
                  }, {
                    default: withCtx(() => [
                      createVNode("thead", { class: "bg-grey-lighten-4" }, [
                        createVNode("tr", null, [
                          createVNode("th", {
                            class: "text-center",
                            style: { "width": "52px" }
                          }, "#"),
                          createVNode("th", {
                            class: "text-left",
                            style: { "min-width": "180px" }
                          }, "Product"),
                          createVNode("th", { class: "text-left" }, "Branch"),
                          createVNode("th", { class: "text-left" }, "Type"),
                          createVNode("th", { class: "text-right" }, "Qty Change"),
                          createVNode("th", { class: "text-right" }, "After"),
                          createVNode("th", { class: "text-left" }, "Reference"),
                          createVNode("th", { class: "text-left" }, "By"),
                          createVNode("th", { class: "text-left" }, "Date")
                        ])
                      ]),
                      createVNode("tbody", null, [
                        (openBlock(true), createBlock(Fragment, null, renderList(unref(pagedMovements), (m, idx) => {
                          return openBlock(), createBlock("tr", {
                            key: m.id
                          }, [
                            createVNode("td", { class: "text-center text-caption text-disabled font-weight-bold" }, toDisplayString(rowNumber(idx)), 1),
                            createVNode("td", null, [
                              createVNode("div", { class: "d-flex align-center ga-2" }, [
                                createVNode(VAvatar, {
                                  size: "32",
                                  rounded: "lg",
                                  color: typeColor(m.movement_type),
                                  variant: "tonal"
                                }, {
                                  default: withCtx(() => [
                                    createVNode(VIcon, {
                                      size: "18",
                                      icon: typeIcon(m.movement_type)
                                    }, null, 8, ["icon"])
                                  ]),
                                  _: 2
                                }, 1032, ["color"]),
                                createVNode("div", null, [
                                  createVNode("div", { class: "text-body-2 font-weight-bold" }, toDisplayString(m.product_name), 1),
                                  createVNode("div", { class: "text-caption text-disabled" }, toDisplayString(m.product_sku), 1)
                                ])
                              ])
                            ]),
                            createVNode("td", { class: "text-body-2" }, toDisplayString(m.branch_code), 1),
                            createVNode("td", null, [
                              createVNode(VChip, {
                                size: "small",
                                color: typeColor(m.movement_type),
                                variant: "tonal",
                                class: "text-capitalize"
                              }, {
                                default: withCtx(() => [
                                  createTextVNode(toDisplayString(m.movement_type_display || m.movement_type), 1)
                                ]),
                                _: 2
                              }, 1032, ["color"])
                            ]),
                            createVNode("td", { class: "text-right" }, [
                              createVNode("span", {
                                class: ["font-weight-bold", qtyClass(m.quantity_change)]
                              }, toDisplayString(parseFloat(m.quantity_change) > 0 ? "+" : "") + toDisplayString(unref(formatNumber)(m.quantity_change)), 3)
                            ]),
                            createVNode("td", { class: "text-right text-body-2" }, toDisplayString(unref(formatNumber)(m.quantity_after)), 1),
                            createVNode("td", null, [
                              m.reference ? (openBlock(), createBlock("span", {
                                key: 0,
                                class: "text-body-2 font-mono"
                              }, toDisplayString(m.reference), 1)) : (openBlock(), createBlock("span", {
                                key: 1,
                                class: "text-disabled"
                              }, "—"))
                            ]),
                            createVNode("td", { class: "text-body-2 text-medium-emphasis" }, toDisplayString(m.performed_by_name || "—"), 1),
                            createVNode("td", { class: "text-body-2 text-medium-emphasis" }, toDisplayString(unref(datetime)(m.created_at)), 1)
                          ]);
                        }), 128))
                      ])
                    ]),
                    _: 1
                  }),
                  createVNode(_component_PaginationBar, {
                    count: unref(filteredMovements).length,
                    next: unref(currentPage) < unref(totalPages) ? "yes" : null,
                    previous: unref(currentPage) > 1 ? "yes" : null,
                    page: unref(currentPage),
                    pageSize,
                    totalPages: unref(totalPages),
                    onPageChange: ($event) => currentPage.value = $event
                  }, null, 8, ["count", "next", "previous", "page", "totalPages", "onPageChange"])
                ]),
                _: 1
              }))
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
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/inventory/movements.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=movements-D-CMpPF4.mjs.map
