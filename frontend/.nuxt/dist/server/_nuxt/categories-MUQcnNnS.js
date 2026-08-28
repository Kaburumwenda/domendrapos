import { ref, computed, mergeProps, isRef, unref, withCtx, createTextVNode, createVNode, toDisplayString, openBlock, createBlock, Fragment, renderList, withKeys, useSSRContext } from "vue";
import { ssrRenderAttrs, ssrRenderComponent, ssrInterpolate, ssrRenderStyle, ssrRenderList, ssrRenderClass, ssrRenderAttr } from "vue/server-renderer";
import { u as useFormat } from "./useFormat-BvVWDMYe.js";
import { _ as _export_sfc, D as useToast, W as VBtnToggle, c as VBtn, a as VIcon, x as VProgressCircular, q as VDialog, g as VCard, r as VCardTitle, s as VCardText, v as VTextField, X as VCheckbox, w as VCardActions, b as VSpacer, k as VDivider } from "../server.mjs";
import { u as useApi } from "./useApi-D4YG8JPQ.js";
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
const _sfc_main = {
  __name: "categories",
  __ssrInlineRender: true,
  setup(__props) {
    const { currency } = useFormat();
    const { success, error: errorToast } = useToast();
    function formatMoney(v) {
      return currency(Number(v) || 0);
    }
    const categorySuggestions = ["Rent", "Utilities", "Salaries", "Supplies", "Equipment", "Transport", "Marketing", "Maintenance", "Insurance", "Taxes", "Licenses", "Miscellaneous"];
    const quickPickColors = [
      "#6366F1",
      "#3B82F6",
      "#06B6D4",
      "#14B8A6",
      "#22C55E",
      "#84CC16",
      "#F59E0B",
      "#F97316",
      "#EF4444",
      "#EC4899",
      "#A855F7",
      "#64748B"
    ];
    const suggestionIcons = {
      Rent: "mdi-home-outline",
      Utilities: "mdi-lightbulb-outline",
      Salaries: "mdi-account-cash-outline",
      Supplies: "mdi-package-variant-closed",
      Equipment: "mdi-chip",
      Transport: "mdi-truck-outline",
      Marketing: "mdi-bullhorn-outline",
      Maintenance: "mdi-wrench-outline",
      Insurance: "mdi-shield-check-outline",
      Taxes: "mdi-percent-outline",
      Licenses: " mdi-certificate-outline",
      Miscellaneous: "mdi-dots-horizontal"
    };
    const suggestionDescriptions = {
      Rent: "Premises lease, office space and rental charges",
      Utilities: "Electricity, water, gas and internet services",
      Salaries: "Staff wages, payroll and contractor fees",
      Supplies: "Office and consumable supplies",
      Equipment: "Machinery, hardware and fixture purchases",
      Transport: "Fuel, deliveries and travel costs",
      Marketing: "Advertising, promotions and brand campaigns",
      Maintenance: "Repairs and upkeep of equipment and premises",
      Insurance: "Business, asset and liability cover premiums",
      Taxes: "Statutory taxes and levies",
      Licenses: "Regulatory licenses and permit renewals",
      Miscellaneous: "Other uncategorized expenses"
    };
    function suggestionIcon(name) {
      return suggestionIcons[name] || "mdi-tag-outline";
    }
    function suggestionColor(name) {
      return categoryColorFromMap(name);
    }
    const defaultColorMap = {
      Rent: "#3B82F6",
      Utilities: "#06B6D4",
      Salaries: "#64748B",
      Supplies: "#14B8A6",
      Equipment: "#22C55E",
      Transport: "#F59E0B",
      Marketing: "#EC4899",
      Maintenance: "#F97316",
      Insurance: "#6366F1",
      Legal: "#A855F7",
      Miscellaneous: "#64748B",
      Taxes: "#EF4444",
      Licenses: "#0EA5E9"
    };
    const loading = ref(false);
    const expenses = ref([]);
    const customCategories = ref([]);
    ref("");
    const viewMode = ref("grid");
    const categoryDialog = ref(false);
    const editingCategory = ref(false);
    const editingCategoryName = ref(null);
    const catForm = ref({ name: "", description: "", color: "#6366F1", active: true });
    const viewDialog = ref(false);
    const viewingCategory = ref(null);
    const defaultCategories = ["Rent", "Utilities", "Salaries", "Supplies", "Marketing", "Transport", "Maintenance", "Miscellaneous", "Insurance", "Legal", "Equipment"];
    function saveCustomCategories() {
      localStorage.setItem("expense_custom_categories", JSON.stringify(customCategories.value));
    }
    const categoryList = computed(() => {
      const fromData = [...new Set(expenses.value.map((e) => e.category).filter(Boolean))];
      const all = [.../* @__PURE__ */ new Set([...defaultCategories, ...customCategories.value.map((c) => c.name || c), ...fromData])];
      return all.sort();
    });
    function categoryColorFromMap(name) {
      if (!name) return quickPickColors[0];
      const found = customCategories.value.find((c) => (c.name || c) === name);
      if (found && found.color) return found.color;
      if (defaultColorMap[name]) return defaultColorMap[name];
      let h = 0;
      for (let i = 0; i < name.length; i++) h = (h << 5) - h + name.charCodeAt(i) | 0;
      return quickPickColors[Math.abs(h) % quickPickColors.length];
    }
    function categoryColor(name) {
      return categoryColorFromMap(name);
    }
    function openCategoryDialog() {
      editingCategory.value = false;
      editingCategoryName.value = null;
      catForm.value = { name: "", description: "", color: "#6366F1", active: true };
      categoryDialog.value = true;
    }
    function openEditCategoryDialog(name) {
      const obj = customCategories.value.find((c) => (c.name || c) === name) || {};
      editingCategory.value = true;
      editingCategoryName.value = name;
      catForm.value = {
        name,
        description: obj.description || suggestionDescriptions[name] || "",
        color: obj.color || defaultColorMap[name] || "#6366F1",
        active: obj.active !== void 0 ? obj.active : true
      };
      categoryDialog.value = true;
    }
    function viewCategory(name) {
      viewingCategory.value = categoryStats.value.find((c) => c.name === name) || null;
      viewDialog.value = true;
    }
    function applySuggestion(name) {
      catForm.value.name = name;
      catForm.value.description = suggestionDescriptions[name] || "";
      catForm.value.color = defaultColorMap[name] || "#6366F1";
    }
    function saveCategoryFromDialog() {
      const name = catForm.value.name.trim();
      if (!name) return;
      if (editingCategory.value) {
        const existing = customCategories.value.find((c) => (c.name || c) === editingCategoryName.value);
        if (existing) {
          existing.name = name;
          existing.description = catForm.value.description.trim();
          existing.color = catForm.value.color;
          existing.active = catForm.value.active;
        }
        customCategories.value.sort((a, b) => (a.name || a).localeCompare(b.name || b));
        saveCustomCategories();
        categoryDialog.value = false;
        success(`Category "${name}" updated`);
        return;
      }
      const all = [...defaultCategories, ...customCategories.value.map((c) => c.name || c), ...expenses.value.map((e) => e.category).filter(Boolean)];
      if (all.some((c) => c.toLowerCase() === name.toLowerCase())) {
        errorToast("Category already exists");
        return;
      }
      customCategories.value.push({
        name,
        description: catForm.value.description.trim(),
        color: catForm.value.color,
        active: catForm.value.active
      });
      customCategories.value.sort((a, b) => (a.name || a).localeCompare(b.name || b));
      saveCustomCategories();
      categoryDialog.value = false;
      success(`Category "${name}" added`);
    }
    function deleteCustomCategory(name) {
      customCategories.value = customCategories.value.filter((c) => (c.name || c) !== name);
      saveCustomCategories();
      success(`Category "${name}" removed`);
    }
    function categoryDescription(name) {
      if (!name) return "";
      const found = customCategories.value.find((c) => (c.name || c) === name);
      if (found && found.description) return found.description;
      return suggestionDescriptions[name] || "";
    }
    function categoryActiveObj(name) {
      if (!name) return true;
      const found = customCategories.value.find((c) => (c.name || c) === name);
      return found ? found.active !== void 0 ? found.active : true : true;
    }
    function isDefaultCategory(name) {
      return defaultCategories.some((c) => c.toLowerCase() === name.toLowerCase());
    }
    function isUsedCategory(name) {
      return expenses.value.some((e) => e.category === name);
    }
    const activeCount = computed(() => {
      return categoryList.value.filter((c) => isUsedCategory(c)).length;
    });
    const totalSpend = computed(() => {
      return expenses.value.reduce((s, e) => s + Number(e.amount), 0);
    });
    const totalCost = computed(() => {
      return expenses.value.reduce((s, e) => s + Number(e.cost_price || 0), 0);
    });
    const totalRetail = computed(() => {
      return expenses.value.reduce((s, e) => s + Number(e.retail_price || 0), 0);
    });
    const categoryStats = computed(() => {
      const items = expenses.value;
      const map = {};
      categoryList.value.forEach((c) => {
        map[c] = { name: c, count: 0, spend: 0, cost: 0, retail: 0 };
      });
      items.forEach((e) => {
        const c = e.category || "Uncategorized";
        if (!map[c]) map[c] = { name: c, count: 0, spend: 0, cost: 0, retail: 0 };
        map[c].count++;
        map[c].spend += Number(e.amount);
        map[c].cost += Number(e.cost_price || 0);
        map[c].retail += Number(e.retail_price || 0);
      });
      const totalCostAll = items.reduce((s, e) => s + Number(e.cost_price || 0), 0);
      return Object.values(map).map((c) => ({ ...c, pct: totalCostAll > 0 ? c.cost / totalCostAll * 100 : 0 })).sort((a, b) => b.cost - a.cost);
    });
    async function loadData() {
      loading.value = true;
      try {
        const data = await useApi()("/accounting/expenses/?page_size=500");
        expenses.value = data.results || data;
      } catch {
      } finally {
        loading.value = false;
      }
    }
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "az-page" }, _attrs))} data-v-d021cb38><div class="az-header" data-v-d021cb38><div class="az-header__left" data-v-d021cb38><div class="az-header__title" data-v-d021cb38><h1 class="text-h5 font-weight-bold" data-v-d021cb38>Expense Categories</h1><p class="text-body-2 text-medium-emphasis" data-v-d021cb38>Manage and organise your expense categories</p></div></div><div class="az-header__actions" data-v-d021cb38>`);
      _push(ssrRenderComponent(VBtnToggle, {
        modelValue: unref(viewMode),
        "onUpdate:modelValue": ($event) => isRef(viewMode) ? viewMode.value = $event : null,
        mandatory: "",
        density: "compact",
        variant: "outlined",
        color: "primary",
        class: "mr-1"
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(ssrRenderComponent(VBtn, {
              value: "table",
              size: "small",
              variant: "text"
            }, {
              default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                if (_push3) {
                  _push3(ssrRenderComponent(VIcon, { size: "18" }, {
                    default: withCtx((_3, _push4, _parent4, _scopeId3) => {
                      if (_push4) {
                        _push4(`mdi-table-large`);
                      } else {
                        return [
                          createTextVNode("mdi-table-large")
                        ];
                      }
                    }),
                    _: 1
                  }, _parent3, _scopeId2));
                } else {
                  return [
                    createVNode(VIcon, { size: "18" }, {
                      default: withCtx(() => [
                        createTextVNode("mdi-table-large")
                      ]),
                      _: 1
                    })
                  ];
                }
              }),
              _: 1
            }, _parent2, _scopeId));
            _push2(ssrRenderComponent(VBtn, {
              value: "grid",
              size: "small",
              variant: "text"
            }, {
              default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                if (_push3) {
                  _push3(ssrRenderComponent(VIcon, { size: "18" }, {
                    default: withCtx((_3, _push4, _parent4, _scopeId3) => {
                      if (_push4) {
                        _push4(`mdi-view-grid-outline`);
                      } else {
                        return [
                          createTextVNode("mdi-view-grid-outline")
                        ];
                      }
                    }),
                    _: 1
                  }, _parent3, _scopeId2));
                } else {
                  return [
                    createVNode(VIcon, { size: "18" }, {
                      default: withCtx(() => [
                        createTextVNode("mdi-view-grid-outline")
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
              createVNode(VBtn, {
                value: "table",
                size: "small",
                variant: "text"
              }, {
                default: withCtx(() => [
                  createVNode(VIcon, { size: "18" }, {
                    default: withCtx(() => [
                      createTextVNode("mdi-table-large")
                    ]),
                    _: 1
                  })
                ]),
                _: 1
              }),
              createVNode(VBtn, {
                value: "grid",
                size: "small",
                variant: "text"
              }, {
                default: withCtx(() => [
                  createVNode(VIcon, { size: "18" }, {
                    default: withCtx(() => [
                      createTextVNode("mdi-view-grid-outline")
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
      _push(ssrRenderComponent(VBtn, {
        variant: "flat",
        color: "primary",
        "prepend-icon": "mdi-plus",
        size: "small",
        onClick: openCategoryDialog
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`Add Category`);
          } else {
            return [
              createTextVNode("Add Category")
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(ssrRenderComponent(VBtn, {
        variant: "tonal",
        "prepend-icon": "mdi-refresh",
        size: "small",
        onClick: loadData,
        loading: unref(loading)
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
        variant: "text",
        "prepend-icon": "mdi-arrow-left",
        size: "small",
        to: "/expenses"
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`Back to Expenses`);
          } else {
            return [
              createTextVNode("Back to Expenses")
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`</div></div>`);
      if (unref(loading) && unref(expenses).length === 0) {
        _push(`<div class="az-loading" data-v-d021cb38>`);
        _push(ssrRenderComponent(VProgressCircular, {
          indeterminate: "",
          color: "primary",
          size: "32",
          width: "3"
        }, null, _parent));
        _push(`<p class="text-body-2 text-medium-emphasis mt-3" data-v-d021cb38>Loading categories…</p></div>`);
      } else {
        _push(`<!--[--><div class="az-kpi-grid" data-v-d021cb38><div class="az-kpi az-kpi--primary" data-v-d021cb38><div class="az-kpi__icon az-kpi__icon--primary" data-v-d021cb38>`);
        _push(ssrRenderComponent(VIcon, { size: "20" }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`mdi-tag-multiple`);
            } else {
              return [
                createTextVNode("mdi-tag-multiple")
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(`</div><div class="az-kpi__body" data-v-d021cb38><p class="az-kpi__label" data-v-d021cb38>Total Categories</p><p class="az-kpi__value" data-v-d021cb38>${ssrInterpolate(unref(categoryList).length)}</p><p class="az-kpi__sub" data-v-d021cb38>${ssrInterpolate(unref(customCategories).length)} custom, ${ssrInterpolate(defaultCategories.length)} default</p></div></div><div class="az-kpi az-kpi--success" data-v-d021cb38><div class="az-kpi__icon az-kpi__icon--success" data-v-d021cb38>`);
        _push(ssrRenderComponent(VIcon, { size: "20" }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`mdi-check-circle`);
            } else {
              return [
                createTextVNode("mdi-check-circle")
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(`</div><div class="az-kpi__body" data-v-d021cb38><p class="az-kpi__label" data-v-d021cb38>Active Categories</p><p class="az-kpi__value text-success" data-v-d021cb38>${ssrInterpolate(unref(activeCount))}</p><p class="az-kpi__sub" data-v-d021cb38>used by at least one expense</p></div></div><div class="az-kpi az-kpi--warning" data-v-d021cb38><div class="az-kpi__icon az-kpi__icon--warning" data-v-d021cb38>`);
        _push(ssrRenderComponent(VIcon, { size: "20" }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`mdi-tag-off`);
            } else {
              return [
                createTextVNode("mdi-tag-off")
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(`</div><div class="az-kpi__body" data-v-d021cb38><p class="az-kpi__label" data-v-d021cb38>Unused</p><p class="az-kpi__value text-warning" data-v-d021cb38>${ssrInterpolate(unref(categoryList).length - unref(activeCount))}</p><p class="az-kpi__sub" data-v-d021cb38>no expenses assigned</p></div></div><div class="az-kpi az-kpi--error" data-v-d021cb38><div class="az-kpi__icon az-kpi__icon--error" data-v-d021cb38>`);
        _push(ssrRenderComponent(VIcon, { size: "20" }, {
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
        _push(`</div><div class="az-kpi__body" data-v-d021cb38><p class="az-kpi__label" data-v-d021cb38>Total Spend</p><p class="az-kpi__value text-error" data-v-d021cb38>${ssrInterpolate(formatMoney(unref(totalSpend)))}</p><p class="az-kpi__sub" data-v-d021cb38>${ssrInterpolate(unref(expenses).length)} expenses total</p></div></div><div class="az-kpi az-kpi--info" data-v-d021cb38><div class="az-kpi__icon az-kpi__icon--info" data-v-d021cb38>`);
        _push(ssrRenderComponent(VIcon, { size: "20" }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`mdi-cash-refund`);
            } else {
              return [
                createTextVNode("mdi-cash-refund")
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(`</div><div class="az-kpi__body" data-v-d021cb38><p class="az-kpi__label" data-v-d021cb38>Total Cost</p><p class="az-kpi__value text-info" data-v-d021cb38>${ssrInterpolate(formatMoney(unref(totalCost)))}</p><p class="az-kpi__sub" data-v-d021cb38>across all categories</p></div></div><div class="az-kpi az-kpi--purple" data-v-d021cb38><div class="az-kpi__icon az-kpi__icon--purple" data-v-d021cb38>`);
        _push(ssrRenderComponent(VIcon, { size: "20" }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`mdi-cash-multiple`);
            } else {
              return [
                createTextVNode("mdi-cash-multiple")
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(`</div><div class="az-kpi__body" data-v-d021cb38><p class="az-kpi__label" data-v-d021cb38>Total Retail</p><p class="az-kpi__value" style="${ssrRenderStyle({ "color": "#7C4DFF" })}" data-v-d021cb38>${ssrInterpolate(formatMoney(unref(totalRetail)))}</p><p class="az-kpi__sub" data-v-d021cb38>across all categories</p></div></div></div>`);
        if (unref(viewMode) === "table") {
          _push(`<div class="az-table-wrap" data-v-d021cb38><table class="az-table" data-v-d021cb38><thead data-v-d021cb38><tr data-v-d021cb38><th data-v-d021cb38>Category</th><th class="text-right" data-v-d021cb38>Expenses</th><th class="text-right" data-v-d021cb38>Total Cost</th><th class="text-right" data-v-d021cb38>Total Retail</th><th class="text-right" data-v-d021cb38>% Share</th><th data-v-d021cb38>Distribution</th><th data-v-d021cb38></th></tr></thead><tbody data-v-d021cb38><!--[-->`);
          ssrRenderList(unref(categoryStats), (c, idx) => {
            _push(`<tr class="az-table__row" data-v-d021cb38><td class="az-table__product" data-v-d021cb38><div class="az-cat-icon" style="${ssrRenderStyle({ background: categoryColor(c.name) })}" data-v-d021cb38>${ssrInterpolate((c.name || "?").charAt(0).toUpperCase())}</div><div data-v-d021cb38><span class="font-weight-medium" data-v-d021cb38>${ssrInterpolate(c.name || "Uncategorized")}</span><div class="az-cat-meta" data-v-d021cb38>`);
            if (isDefaultCategory(c.name)) {
              _push(`<span class="az-cat-badge az-cat-badge--default" data-v-d021cb38>Default</span>`);
            } else {
              _push(`<span class="az-cat-badge az-cat-badge--custom" data-v-d021cb38>Custom</span>`);
            }
            _push(`<span class="az-cat-badge az-cat-badge--count" data-v-d021cb38>${ssrInterpolate(formatMoney(c.spend))}</span></div></div></td><td class="text-right text-medium-emphasis" data-v-d021cb38>${ssrInterpolate(c.count)}</td><td class="text-right font-weight-bold text-info" data-v-d021cb38>${ssrInterpolate(formatMoney(c.cost))}</td><td class="text-right font-weight-bold" style="${ssrRenderStyle({ "color": "#7C4DFF" })}" data-v-d021cb38>${ssrInterpolate(formatMoney(c.retail))}</td><td class="text-right text-medium-emphasis" data-v-d021cb38>${ssrInterpolate(c.pct.toFixed(1))}%</td><td data-v-d021cb38><div class="az-bar-wrap" data-v-d021cb38><div class="az-bar-fill" style="${ssrRenderStyle({ width: c.pct + "%", background: categoryColor(c.name) })}" data-v-d021cb38></div></div></td><td data-v-d021cb38><div class="az-row-actions" data-v-d021cb38>`);
            _push(ssrRenderComponent(VBtn, {
              size: "small",
              variant: "text",
              icon: "mdi-eye-outline",
              color: "grey-darken-1",
              onClick: ($event) => viewCategory(c.name)
            }, null, _parent));
            _push(ssrRenderComponent(VBtn, {
              size: "small",
              variant: "text",
              icon: "mdi-pencil-outline",
              color: "primary",
              onClick: ($event) => openEditCategoryDialog(c.name)
            }, null, _parent));
            if (!isDefaultCategory(c.name) && c.count === 0) {
              _push(ssrRenderComponent(VBtn, {
                size: "small",
                variant: "text",
                icon: "mdi-delete-outline",
                color: "error",
                onClick: ($event) => deleteCustomCategory(c.name)
              }, null, _parent));
            } else {
              _push(`<!---->`);
            }
            _push(`</div></td></tr>`);
          });
          _push(`<!--]-->`);
          if (!unref(categoryStats).length) {
            _push(`<tr data-v-d021cb38><td colspan="7" class="az-table__empty" data-v-d021cb38>`);
            _push(ssrRenderComponent(VIcon, {
              size: "36",
              color: "grey-lighten-1"
            }, {
              default: withCtx((_, _push2, _parent2, _scopeId) => {
                if (_push2) {
                  _push2(`mdi-tag-off`);
                } else {
                  return [
                    createTextVNode("mdi-tag-off")
                  ];
                }
              }),
              _: 1
            }, _parent));
            _push(`<p class="text-body-2 mt-2 text-medium-emphasis" data-v-d021cb38>No categories found.</p></td></tr>`);
          } else {
            _push(`<!---->`);
          }
          _push(`</tbody></table></div>`);
        } else {
          _push(`<div class="az-cat-grid" data-v-d021cb38><!--[-->`);
          ssrRenderList(unref(categoryStats), (c) => {
            _push(`<div class="az-cat-grid__card" data-v-d021cb38><div class="az-cat-grid__card-top" data-v-d021cb38><div class="az-cat-grid__icon" style="${ssrRenderStyle({ background: categoryColor(c.name) })}" data-v-d021cb38>${ssrInterpolate((c.name || "?").charAt(0).toUpperCase())}</div><div class="az-row-actions" data-v-d021cb38>`);
            _push(ssrRenderComponent(VBtn, {
              size: "small",
              variant: "text",
              icon: "mdi-eye-outline",
              color: "grey-darken-1",
              density: "compact",
              onClick: ($event) => viewCategory(c.name)
            }, null, _parent));
            _push(ssrRenderComponent(VBtn, {
              size: "small",
              variant: "text",
              icon: "mdi-pencil-outline",
              color: "primary",
              density: "compact",
              onClick: ($event) => openEditCategoryDialog(c.name)
            }, null, _parent));
            if (!isDefaultCategory(c.name) && c.count === 0) {
              _push(ssrRenderComponent(VBtn, {
                size: "small",
                variant: "text",
                icon: "mdi-delete-outline",
                color: "error",
                density: "compact",
                onClick: ($event) => deleteCustomCategory(c.name)
              }, null, _parent));
            } else {
              _push(`<!---->`);
            }
            _push(`</div></div><div class="az-cat-grid__name" data-v-d021cb38>${ssrInterpolate(c.name || "Uncategorized")}</div><div class="az-cat-grid__badges" data-v-d021cb38>`);
            if (isDefaultCategory(c.name)) {
              _push(`<span class="az-cat-badge az-cat-badge--default" data-v-d021cb38>Default</span>`);
            } else {
              _push(`<span class="az-cat-badge az-cat-badge--custom" data-v-d021cb38>Custom</span>`);
            }
            _push(`</div><div class="az-cat-grid__stats" data-v-d021cb38><div class="az-cat-grid__stat" data-v-d021cb38><span class="az-cat-grid__stat-label" data-v-d021cb38>Expenses</span><span class="az-cat-grid__stat-value" data-v-d021cb38>${ssrInterpolate(c.count)}</span></div><div class="az-cat-grid__stat" data-v-d021cb38><span class="az-cat-grid__stat-label" data-v-d021cb38>Spend</span><span class="az-cat-grid__stat-value text-error" data-v-d021cb38>${ssrInterpolate(formatMoney(c.spend))}</span></div><div class="az-cat-grid__stat" data-v-d021cb38><span class="az-cat-grid__stat-label" data-v-d021cb38>Cost</span><span class="az-cat-grid__stat-value text-info" data-v-d021cb38>${ssrInterpolate(formatMoney(c.cost))}</span></div><div class="az-cat-grid__stat" data-v-d021cb38><span class="az-cat-grid__stat-label" data-v-d021cb38>Retail</span><span class="az-cat-grid__stat-value" style="${ssrRenderStyle({ "color": "#7C4DFF" })}" data-v-d021cb38>${ssrInterpolate(formatMoney(c.retail))}</span></div></div><div class="az-cat-grid__share" data-v-d021cb38><div class="d-flex align-center justify-space-between mb-1" data-v-d021cb38><span class="text-caption text-medium-emphasis" data-v-d021cb38>Share</span><span class="text-caption font-weight-bold" data-v-d021cb38>${ssrInterpolate(c.pct.toFixed(1))}%</span></div><div class="az-bar-wrap az-bar-wrap--full" data-v-d021cb38><div class="az-bar-fill" style="${ssrRenderStyle({ width: c.pct + "%", background: categoryColor(c.name) })}" data-v-d021cb38></div></div></div></div>`);
          });
          _push(`<!--]-->`);
          if (!unref(categoryStats).length) {
            _push(`<div class="az-table__empty" data-v-d021cb38>`);
            _push(ssrRenderComponent(VIcon, {
              size: "36",
              color: "grey-lighten-1"
            }, {
              default: withCtx((_, _push2, _parent2, _scopeId) => {
                if (_push2) {
                  _push2(`mdi-tag-off`);
                } else {
                  return [
                    createTextVNode("mdi-tag-off")
                  ];
                }
              }),
              _: 1
            }, _parent));
            _push(`<p class="text-body-2 mt-2 text-medium-emphasis" data-v-d021cb38>No categories found.</p></div>`);
          } else {
            _push(`<!---->`);
          }
          _push(`</div>`);
        }
        _push(`<!--]-->`);
      }
      _push(ssrRenderComponent(VDialog, {
        modelValue: unref(categoryDialog),
        "onUpdate:modelValue": ($event) => isRef(categoryDialog) ? categoryDialog.value = $event : null,
        "max-width": "520"
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(ssrRenderComponent(VCard, {
              rounded: "xl",
              class: "pa-2 az-cat-dialog"
            }, {
              default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                if (_push3) {
                  _push3(ssrRenderComponent(VCardTitle, { class: "text-h6 font-weight-bold px-4 pt-4 d-flex align-center" }, {
                    default: withCtx((_3, _push4, _parent4, _scopeId3) => {
                      if (_push4) {
                        _push4(ssrRenderComponent(VIcon, {
                          class: "mr-2",
                          color: "primary"
                        }, {
                          default: withCtx((_4, _push5, _parent5, _scopeId4) => {
                            if (_push5) {
                              _push5(`mdi-tag-plus-outline`);
                            } else {
                              return [
                                createTextVNode("mdi-tag-plus-outline")
                              ];
                            }
                          }),
                          _: 1
                        }, _parent4, _scopeId3));
                        _push4(` New Category `);
                      } else {
                        return [
                          createVNode(VIcon, {
                            class: "mr-2",
                            color: "primary"
                          }, {
                            default: withCtx(() => [
                              createTextVNode("mdi-tag-plus-outline")
                            ]),
                            _: 1
                          }),
                          createTextVNode(" New Category ")
                        ];
                      }
                    }),
                    _: 1
                  }, _parent3, _scopeId2));
                  _push3(ssrRenderComponent(VCardText, { class: "px-4 pb-2" }, {
                    default: withCtx((_3, _push4, _parent4, _scopeId3) => {
                      if (_push4) {
                        _push4(`<p class="text-caption text-medium-emphasis mb-2" data-v-d021cb38${_scopeId3}>Suggestions</p><div class="az-cat-dialog__suggestions" data-v-d021cb38${_scopeId3}><!--[-->`);
                        ssrRenderList(categorySuggestions, (s) => {
                          _push4(`<button type="button" class="az-cat-dialog__suggestion" data-v-d021cb38${_scopeId3}>`);
                          _push4(ssrRenderComponent(VIcon, {
                            size: "15",
                            color: suggestionColor(s)
                          }, {
                            default: withCtx((_4, _push5, _parent5, _scopeId4) => {
                              if (_push5) {
                                _push5(`${ssrInterpolate(suggestionIcon(s))}`);
                              } else {
                                return [
                                  createTextVNode(toDisplayString(suggestionIcon(s)), 1)
                                ];
                              }
                            }),
                            _: 2
                          }, _parent4, _scopeId3));
                          _push4(` ${ssrInterpolate(s)}</button>`);
                        });
                        _push4(`<!--]--></div>`);
                        _push4(ssrRenderComponent(VTextField, {
                          modelValue: unref(catForm).name,
                          "onUpdate:modelValue": ($event) => unref(catForm).name = $event,
                          label: "Name",
                          placeholder: "e.g. Rent",
                          density: "compact",
                          variant: "outlined",
                          class: "mt-3",
                          "hide-details": "",
                          onKeyup: saveCategoryFromDialog
                        }, null, _parent4, _scopeId3));
                        _push4(ssrRenderComponent(VTextField, {
                          modelValue: unref(catForm).description,
                          "onUpdate:modelValue": ($event) => unref(catForm).description = $event,
                          label: "Description",
                          placeholder: "What this category covers",
                          density: "compact",
                          variant: "outlined",
                          class: "mt-3",
                          "hide-details": ""
                        }, null, _parent4, _scopeId3));
                        _push4(ssrRenderComponent(VTextField, {
                          modelValue: unref(catForm).color,
                          "onUpdate:modelValue": ($event) => unref(catForm).color = $event,
                          label: "Color (hex)",
                          placeholder: "#6366f1",
                          density: "compact",
                          variant: "outlined",
                          class: "mt-3",
                          "hide-details": ""
                        }, null, _parent4, _scopeId3));
                        _push4(`<div class="az-cat-dialog__colors mt-3" data-v-d021cb38${_scopeId3}><!--[-->`);
                        ssrRenderList(quickPickColors, (c) => {
                          _push4(`<button type="button" class="${ssrRenderClass([{ "az-cat-dialog__swatch--active": unref(catForm).color.toLowerCase() === c.toLowerCase() }, "az-cat-dialog__swatch"])}" style="${ssrRenderStyle({ background: c })}"${ssrRenderAttr("aria-label", c)} data-v-d021cb38${_scopeId3}></button>`);
                        });
                        _push4(`<!--]--></div>`);
                        _push4(ssrRenderComponent(VCheckbox, {
                          modelValue: unref(catForm).active,
                          "onUpdate:modelValue": ($event) => unref(catForm).active = $event,
                          label: "Active",
                          density: "compact",
                          "hide-details": "",
                          class: "mt-3"
                        }, null, _parent4, _scopeId3));
                      } else {
                        return [
                          createVNode("p", { class: "text-caption text-medium-emphasis mb-2" }, "Suggestions"),
                          createVNode("div", { class: "az-cat-dialog__suggestions" }, [
                            (openBlock(), createBlock(Fragment, null, renderList(categorySuggestions, (s) => {
                              return createVNode("button", {
                                key: s,
                                type: "button",
                                class: "az-cat-dialog__suggestion",
                                onClick: ($event) => applySuggestion(s)
                              }, [
                                createVNode(VIcon, {
                                  size: "15",
                                  color: suggestionColor(s)
                                }, {
                                  default: withCtx(() => [
                                    createTextVNode(toDisplayString(suggestionIcon(s)), 1)
                                  ]),
                                  _: 2
                                }, 1032, ["color"]),
                                createTextVNode(" " + toDisplayString(s), 1)
                              ], 8, ["onClick"]);
                            }), 64))
                          ]),
                          createVNode(VTextField, {
                            modelValue: unref(catForm).name,
                            "onUpdate:modelValue": ($event) => unref(catForm).name = $event,
                            label: "Name",
                            placeholder: "e.g. Rent",
                            density: "compact",
                            variant: "outlined",
                            class: "mt-3",
                            "hide-details": "",
                            onKeyup: withKeys(saveCategoryFromDialog, ["enter"])
                          }, null, 8, ["modelValue", "onUpdate:modelValue"]),
                          createVNode(VTextField, {
                            modelValue: unref(catForm).description,
                            "onUpdate:modelValue": ($event) => unref(catForm).description = $event,
                            label: "Description",
                            placeholder: "What this category covers",
                            density: "compact",
                            variant: "outlined",
                            class: "mt-3",
                            "hide-details": ""
                          }, null, 8, ["modelValue", "onUpdate:modelValue"]),
                          createVNode(VTextField, {
                            modelValue: unref(catForm).color,
                            "onUpdate:modelValue": ($event) => unref(catForm).color = $event,
                            label: "Color (hex)",
                            placeholder: "#6366f1",
                            density: "compact",
                            variant: "outlined",
                            class: "mt-3",
                            "hide-details": ""
                          }, null, 8, ["modelValue", "onUpdate:modelValue"]),
                          createVNode("div", { class: "az-cat-dialog__colors mt-3" }, [
                            (openBlock(), createBlock(Fragment, null, renderList(quickPickColors, (c) => {
                              return createVNode("button", {
                                key: c,
                                type: "button",
                                class: ["az-cat-dialog__swatch", { "az-cat-dialog__swatch--active": unref(catForm).color.toLowerCase() === c.toLowerCase() }],
                                style: { background: c },
                                "aria-label": c,
                                onClick: ($event) => unref(catForm).color = c
                              }, null, 14, ["aria-label", "onClick"]);
                            }), 64))
                          ]),
                          createVNode(VCheckbox, {
                            modelValue: unref(catForm).active,
                            "onUpdate:modelValue": ($event) => unref(catForm).active = $event,
                            label: "Active",
                            density: "compact",
                            "hide-details": "",
                            class: "mt-3"
                          }, null, 8, ["modelValue", "onUpdate:modelValue"])
                        ];
                      }
                    }),
                    _: 1
                  }, _parent3, _scopeId2));
                  _push3(ssrRenderComponent(VCardActions, { class: "px-4 pb-4" }, {
                    default: withCtx((_3, _push4, _parent4, _scopeId3) => {
                      if (_push4) {
                        _push4(ssrRenderComponent(VSpacer, null, null, _parent4, _scopeId3));
                        _push4(ssrRenderComponent(VBtn, {
                          variant: "text",
                          onClick: ($event) => categoryDialog.value = false
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
                          color: "primary",
                          disabled: !unref(catForm).name.trim(),
                          onClick: saveCategoryFromDialog
                        }, {
                          default: withCtx((_4, _push5, _parent5, _scopeId4) => {
                            if (_push5) {
                              _push5(`${ssrInterpolate(unref(editingCategory) ? "Update" : "Save")}`);
                            } else {
                              return [
                                createTextVNode(toDisplayString(unref(editingCategory) ? "Update" : "Save"), 1)
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
                            onClick: ($event) => categoryDialog.value = false
                          }, {
                            default: withCtx(() => [
                              createTextVNode("Cancel")
                            ]),
                            _: 1
                          }, 8, ["onClick"]),
                          createVNode(VBtn, {
                            variant: "flat",
                            color: "primary",
                            disabled: !unref(catForm).name.trim(),
                            onClick: saveCategoryFromDialog
                          }, {
                            default: withCtx(() => [
                              createTextVNode(toDisplayString(unref(editingCategory) ? "Update" : "Save"), 1)
                            ]),
                            _: 1
                          }, 8, ["disabled"])
                        ];
                      }
                    }),
                    _: 1
                  }, _parent3, _scopeId2));
                } else {
                  return [
                    createVNode(VCardTitle, { class: "text-h6 font-weight-bold px-4 pt-4 d-flex align-center" }, {
                      default: withCtx(() => [
                        createVNode(VIcon, {
                          class: "mr-2",
                          color: "primary"
                        }, {
                          default: withCtx(() => [
                            createTextVNode("mdi-tag-plus-outline")
                          ]),
                          _: 1
                        }),
                        createTextVNode(" New Category ")
                      ]),
                      _: 1
                    }),
                    createVNode(VCardText, { class: "px-4 pb-2" }, {
                      default: withCtx(() => [
                        createVNode("p", { class: "text-caption text-medium-emphasis mb-2" }, "Suggestions"),
                        createVNode("div", { class: "az-cat-dialog__suggestions" }, [
                          (openBlock(), createBlock(Fragment, null, renderList(categorySuggestions, (s) => {
                            return createVNode("button", {
                              key: s,
                              type: "button",
                              class: "az-cat-dialog__suggestion",
                              onClick: ($event) => applySuggestion(s)
                            }, [
                              createVNode(VIcon, {
                                size: "15",
                                color: suggestionColor(s)
                              }, {
                                default: withCtx(() => [
                                  createTextVNode(toDisplayString(suggestionIcon(s)), 1)
                                ]),
                                _: 2
                              }, 1032, ["color"]),
                              createTextVNode(" " + toDisplayString(s), 1)
                            ], 8, ["onClick"]);
                          }), 64))
                        ]),
                        createVNode(VTextField, {
                          modelValue: unref(catForm).name,
                          "onUpdate:modelValue": ($event) => unref(catForm).name = $event,
                          label: "Name",
                          placeholder: "e.g. Rent",
                          density: "compact",
                          variant: "outlined",
                          class: "mt-3",
                          "hide-details": "",
                          onKeyup: withKeys(saveCategoryFromDialog, ["enter"])
                        }, null, 8, ["modelValue", "onUpdate:modelValue"]),
                        createVNode(VTextField, {
                          modelValue: unref(catForm).description,
                          "onUpdate:modelValue": ($event) => unref(catForm).description = $event,
                          label: "Description",
                          placeholder: "What this category covers",
                          density: "compact",
                          variant: "outlined",
                          class: "mt-3",
                          "hide-details": ""
                        }, null, 8, ["modelValue", "onUpdate:modelValue"]),
                        createVNode(VTextField, {
                          modelValue: unref(catForm).color,
                          "onUpdate:modelValue": ($event) => unref(catForm).color = $event,
                          label: "Color (hex)",
                          placeholder: "#6366f1",
                          density: "compact",
                          variant: "outlined",
                          class: "mt-3",
                          "hide-details": ""
                        }, null, 8, ["modelValue", "onUpdate:modelValue"]),
                        createVNode("div", { class: "az-cat-dialog__colors mt-3" }, [
                          (openBlock(), createBlock(Fragment, null, renderList(quickPickColors, (c) => {
                            return createVNode("button", {
                              key: c,
                              type: "button",
                              class: ["az-cat-dialog__swatch", { "az-cat-dialog__swatch--active": unref(catForm).color.toLowerCase() === c.toLowerCase() }],
                              style: { background: c },
                              "aria-label": c,
                              onClick: ($event) => unref(catForm).color = c
                            }, null, 14, ["aria-label", "onClick"]);
                          }), 64))
                        ]),
                        createVNode(VCheckbox, {
                          modelValue: unref(catForm).active,
                          "onUpdate:modelValue": ($event) => unref(catForm).active = $event,
                          label: "Active",
                          density: "compact",
                          "hide-details": "",
                          class: "mt-3"
                        }, null, 8, ["modelValue", "onUpdate:modelValue"])
                      ]),
                      _: 1
                    }),
                    createVNode(VCardActions, { class: "px-4 pb-4" }, {
                      default: withCtx(() => [
                        createVNode(VSpacer),
                        createVNode(VBtn, {
                          variant: "text",
                          onClick: ($event) => categoryDialog.value = false
                        }, {
                          default: withCtx(() => [
                            createTextVNode("Cancel")
                          ]),
                          _: 1
                        }, 8, ["onClick"]),
                        createVNode(VBtn, {
                          variant: "flat",
                          color: "primary",
                          disabled: !unref(catForm).name.trim(),
                          onClick: saveCategoryFromDialog
                        }, {
                          default: withCtx(() => [
                            createTextVNode(toDisplayString(unref(editingCategory) ? "Update" : "Save"), 1)
                          ]),
                          _: 1
                        }, 8, ["disabled"])
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
              createVNode(VCard, {
                rounded: "xl",
                class: "pa-2 az-cat-dialog"
              }, {
                default: withCtx(() => [
                  createVNode(VCardTitle, { class: "text-h6 font-weight-bold px-4 pt-4 d-flex align-center" }, {
                    default: withCtx(() => [
                      createVNode(VIcon, {
                        class: "mr-2",
                        color: "primary"
                      }, {
                        default: withCtx(() => [
                          createTextVNode("mdi-tag-plus-outline")
                        ]),
                        _: 1
                      }),
                      createTextVNode(" New Category ")
                    ]),
                    _: 1
                  }),
                  createVNode(VCardText, { class: "px-4 pb-2" }, {
                    default: withCtx(() => [
                      createVNode("p", { class: "text-caption text-medium-emphasis mb-2" }, "Suggestions"),
                      createVNode("div", { class: "az-cat-dialog__suggestions" }, [
                        (openBlock(), createBlock(Fragment, null, renderList(categorySuggestions, (s) => {
                          return createVNode("button", {
                            key: s,
                            type: "button",
                            class: "az-cat-dialog__suggestion",
                            onClick: ($event) => applySuggestion(s)
                          }, [
                            createVNode(VIcon, {
                              size: "15",
                              color: suggestionColor(s)
                            }, {
                              default: withCtx(() => [
                                createTextVNode(toDisplayString(suggestionIcon(s)), 1)
                              ]),
                              _: 2
                            }, 1032, ["color"]),
                            createTextVNode(" " + toDisplayString(s), 1)
                          ], 8, ["onClick"]);
                        }), 64))
                      ]),
                      createVNode(VTextField, {
                        modelValue: unref(catForm).name,
                        "onUpdate:modelValue": ($event) => unref(catForm).name = $event,
                        label: "Name",
                        placeholder: "e.g. Rent",
                        density: "compact",
                        variant: "outlined",
                        class: "mt-3",
                        "hide-details": "",
                        onKeyup: withKeys(saveCategoryFromDialog, ["enter"])
                      }, null, 8, ["modelValue", "onUpdate:modelValue"]),
                      createVNode(VTextField, {
                        modelValue: unref(catForm).description,
                        "onUpdate:modelValue": ($event) => unref(catForm).description = $event,
                        label: "Description",
                        placeholder: "What this category covers",
                        density: "compact",
                        variant: "outlined",
                        class: "mt-3",
                        "hide-details": ""
                      }, null, 8, ["modelValue", "onUpdate:modelValue"]),
                      createVNode(VTextField, {
                        modelValue: unref(catForm).color,
                        "onUpdate:modelValue": ($event) => unref(catForm).color = $event,
                        label: "Color (hex)",
                        placeholder: "#6366f1",
                        density: "compact",
                        variant: "outlined",
                        class: "mt-3",
                        "hide-details": ""
                      }, null, 8, ["modelValue", "onUpdate:modelValue"]),
                      createVNode("div", { class: "az-cat-dialog__colors mt-3" }, [
                        (openBlock(), createBlock(Fragment, null, renderList(quickPickColors, (c) => {
                          return createVNode("button", {
                            key: c,
                            type: "button",
                            class: ["az-cat-dialog__swatch", { "az-cat-dialog__swatch--active": unref(catForm).color.toLowerCase() === c.toLowerCase() }],
                            style: { background: c },
                            "aria-label": c,
                            onClick: ($event) => unref(catForm).color = c
                          }, null, 14, ["aria-label", "onClick"]);
                        }), 64))
                      ]),
                      createVNode(VCheckbox, {
                        modelValue: unref(catForm).active,
                        "onUpdate:modelValue": ($event) => unref(catForm).active = $event,
                        label: "Active",
                        density: "compact",
                        "hide-details": "",
                        class: "mt-3"
                      }, null, 8, ["modelValue", "onUpdate:modelValue"])
                    ]),
                    _: 1
                  }),
                  createVNode(VCardActions, { class: "px-4 pb-4" }, {
                    default: withCtx(() => [
                      createVNode(VSpacer),
                      createVNode(VBtn, {
                        variant: "text",
                        onClick: ($event) => categoryDialog.value = false
                      }, {
                        default: withCtx(() => [
                          createTextVNode("Cancel")
                        ]),
                        _: 1
                      }, 8, ["onClick"]),
                      createVNode(VBtn, {
                        variant: "flat",
                        color: "primary",
                        disabled: !unref(catForm).name.trim(),
                        onClick: saveCategoryFromDialog
                      }, {
                        default: withCtx(() => [
                          createTextVNode(toDisplayString(unref(editingCategory) ? "Update" : "Save"), 1)
                        ]),
                        _: 1
                      }, 8, ["disabled"])
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
      _push(ssrRenderComponent(VDialog, {
        modelValue: unref(viewDialog),
        "onUpdate:modelValue": ($event) => isRef(viewDialog) ? viewDialog.value = $event : null,
        "max-width": "480"
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(ssrRenderComponent(VCard, {
              rounded: "xl",
              class: "pa-2"
            }, {
              default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                if (_push3) {
                  _push3(ssrRenderComponent(VCardTitle, { class: "text-h6 font-weight-bold px-4 pt-4 d-flex align-center" }, {
                    default: withCtx((_3, _push4, _parent4, _scopeId3) => {
                      if (_push4) {
                        _push4(`<div class="az-cat-grid__icon mr-3" style="${ssrRenderStyle({ background: categoryColor(unref(viewingCategory)?.name) })}" data-v-d021cb38${_scopeId3}>${ssrInterpolate((unref(viewingCategory)?.name || "?").charAt(0).toUpperCase())}</div> ${ssrInterpolate(unref(viewingCategory)?.name || "Uncategorized")}`);
                      } else {
                        return [
                          createVNode("div", {
                            class: "az-cat-grid__icon mr-3",
                            style: { background: categoryColor(unref(viewingCategory)?.name) }
                          }, toDisplayString((unref(viewingCategory)?.name || "?").charAt(0).toUpperCase()), 5),
                          createTextVNode(" " + toDisplayString(unref(viewingCategory)?.name || "Uncategorized"), 1)
                        ];
                      }
                    }),
                    _: 1
                  }, _parent3, _scopeId2));
                  _push3(ssrRenderComponent(VCardText, { class: "px-4 pb-2" }, {
                    default: withCtx((_3, _push4, _parent4, _scopeId3) => {
                      if (_push4) {
                        _push4(`<div class="az-cat-view__row" data-v-d021cb38${_scopeId3}><span class="az-cat-view__label" data-v-d021cb38${_scopeId3}>Type</span><span data-v-d021cb38${_scopeId3}>`);
                        if (unref(viewingCategory) && isDefaultCategory(unref(viewingCategory).name)) {
                          _push4(`<span class="az-cat-badge az-cat-badge--default" data-v-d021cb38${_scopeId3}>Default</span>`);
                        } else {
                          _push4(`<span class="az-cat-badge az-cat-badge--custom" data-v-d021cb38${_scopeId3}>Custom</span>`);
                        }
                        _push4(`</span></div><div class="az-cat-view__row" data-v-d021cb38${_scopeId3}><span class="az-cat-view__label" data-v-d021cb38${_scopeId3}>Description</span><span class="text-medium-emphasis" data-v-d021cb38${_scopeId3}>${ssrInterpolate(categoryDescription(unref(viewingCategory)?.name) || "—")}</span></div><div class="az-cat-view__row" data-v-d021cb38${_scopeId3}><span class="az-cat-view__label" data-v-d021cb38${_scopeId3}>Color</span><span class="d-flex align-center gap-2" data-v-d021cb38${_scopeId3}><span class="az-cat-view__swatch" style="${ssrRenderStyle({ background: categoryColor(unref(viewingCategory)?.name) })}" data-v-d021cb38${_scopeId3}></span><code data-v-d021cb38${_scopeId3}>${ssrInterpolate(categoryColor(unref(viewingCategory)?.name))}</code></span></div><div class="az-cat-view__row" data-v-d021cb38${_scopeId3}><span class="az-cat-view__label" data-v-d021cb38${_scopeId3}>Status</span><span data-v-d021cb38${_scopeId3}><span class="${ssrRenderClass([categoryActiveObj(unref(viewingCategory)?.name) ? "az-cat-badge--custom" : "az-cat-badge--count", "az-cat-badge"])}" data-v-d021cb38${_scopeId3}>${ssrInterpolate(categoryActiveObj(unref(viewingCategory)?.name) ? "Active" : "Inactive")}</span></span></div>`);
                        _push4(ssrRenderComponent(VDivider, { class: "my-3" }, null, _parent4, _scopeId3));
                        _push4(`<div class="az-cat-view__stats" data-v-d021cb38${_scopeId3}><div class="az-cat-view__stat" data-v-d021cb38${_scopeId3}><span class="az-cat-view__stat-num" data-v-d021cb38${_scopeId3}>${ssrInterpolate(unref(viewingCategory)?.count ?? 0)}</span><span class="az-cat-view__stat-label" data-v-d021cb38${_scopeId3}>Expenses</span></div><div class="az-cat-view__stat" data-v-d021cb38${_scopeId3}><span class="az-cat-view__stat-num text-error" data-v-d021cb38${_scopeId3}>${ssrInterpolate(formatMoney(unref(viewingCategory)?.spend))}</span><span class="az-cat-view__stat-label" data-v-d021cb38${_scopeId3}>Spend</span></div><div class="az-cat-view__stat" data-v-d021cb38${_scopeId3}><span class="az-cat-view__stat-num text-info" data-v-d021cb38${_scopeId3}>${ssrInterpolate(formatMoney(unref(viewingCategory)?.cost))}</span><span class="az-cat-view__stat-label" data-v-d021cb38${_scopeId3}>Cost</span></div><div class="az-cat-view__stat" data-v-d021cb38${_scopeId3}><span class="az-cat-view__stat-num" style="${ssrRenderStyle({ "color": "#7C4DFF" })}" data-v-d021cb38${_scopeId3}>${ssrInterpolate(formatMoney(unref(viewingCategory)?.retail))}</span><span class="az-cat-view__stat-label" data-v-d021cb38${_scopeId3}>Retail</span></div></div><div class="mt-3" data-v-d021cb38${_scopeId3}><div class="d-flex align-center justify-space-between mb-1" data-v-d021cb38${_scopeId3}><span class="text-caption text-medium-emphasis" data-v-d021cb38${_scopeId3}>Share of total cost</span><span class="text-caption font-weight-bold" data-v-d021cb38${_scopeId3}>${ssrInterpolate((unref(viewingCategory)?.pct ?? 0).toFixed(1))}%</span></div><div class="az-bar-wrap az-bar-wrap--full" data-v-d021cb38${_scopeId3}><div class="az-bar-fill" style="${ssrRenderStyle({ width: (unref(viewingCategory)?.pct ?? 0) + "%", background: categoryColor(unref(viewingCategory)?.name) })}" data-v-d021cb38${_scopeId3}></div></div></div>`);
                      } else {
                        return [
                          createVNode("div", { class: "az-cat-view__row" }, [
                            createVNode("span", { class: "az-cat-view__label" }, "Type"),
                            createVNode("span", null, [
                              unref(viewingCategory) && isDefaultCategory(unref(viewingCategory).name) ? (openBlock(), createBlock("span", {
                                key: 0,
                                class: "az-cat-badge az-cat-badge--default"
                              }, "Default")) : (openBlock(), createBlock("span", {
                                key: 1,
                                class: "az-cat-badge az-cat-badge--custom"
                              }, "Custom"))
                            ])
                          ]),
                          createVNode("div", { class: "az-cat-view__row" }, [
                            createVNode("span", { class: "az-cat-view__label" }, "Description"),
                            createVNode("span", { class: "text-medium-emphasis" }, toDisplayString(categoryDescription(unref(viewingCategory)?.name) || "—"), 1)
                          ]),
                          createVNode("div", { class: "az-cat-view__row" }, [
                            createVNode("span", { class: "az-cat-view__label" }, "Color"),
                            createVNode("span", { class: "d-flex align-center gap-2" }, [
                              createVNode("span", {
                                class: "az-cat-view__swatch",
                                style: { background: categoryColor(unref(viewingCategory)?.name) }
                              }, null, 4),
                              createVNode("code", null, toDisplayString(categoryColor(unref(viewingCategory)?.name)), 1)
                            ])
                          ]),
                          createVNode("div", { class: "az-cat-view__row" }, [
                            createVNode("span", { class: "az-cat-view__label" }, "Status"),
                            createVNode("span", null, [
                              createVNode("span", {
                                class: ["az-cat-badge", categoryActiveObj(unref(viewingCategory)?.name) ? "az-cat-badge--custom" : "az-cat-badge--count"]
                              }, toDisplayString(categoryActiveObj(unref(viewingCategory)?.name) ? "Active" : "Inactive"), 3)
                            ])
                          ]),
                          createVNode(VDivider, { class: "my-3" }),
                          createVNode("div", { class: "az-cat-view__stats" }, [
                            createVNode("div", { class: "az-cat-view__stat" }, [
                              createVNode("span", { class: "az-cat-view__stat-num" }, toDisplayString(unref(viewingCategory)?.count ?? 0), 1),
                              createVNode("span", { class: "az-cat-view__stat-label" }, "Expenses")
                            ]),
                            createVNode("div", { class: "az-cat-view__stat" }, [
                              createVNode("span", { class: "az-cat-view__stat-num text-error" }, toDisplayString(formatMoney(unref(viewingCategory)?.spend)), 1),
                              createVNode("span", { class: "az-cat-view__stat-label" }, "Spend")
                            ]),
                            createVNode("div", { class: "az-cat-view__stat" }, [
                              createVNode("span", { class: "az-cat-view__stat-num text-info" }, toDisplayString(formatMoney(unref(viewingCategory)?.cost)), 1),
                              createVNode("span", { class: "az-cat-view__stat-label" }, "Cost")
                            ]),
                            createVNode("div", { class: "az-cat-view__stat" }, [
                              createVNode("span", {
                                class: "az-cat-view__stat-num",
                                style: { "color": "#7C4DFF" }
                              }, toDisplayString(formatMoney(unref(viewingCategory)?.retail)), 1),
                              createVNode("span", { class: "az-cat-view__stat-label" }, "Retail")
                            ])
                          ]),
                          createVNode("div", { class: "mt-3" }, [
                            createVNode("div", { class: "d-flex align-center justify-space-between mb-1" }, [
                              createVNode("span", { class: "text-caption text-medium-emphasis" }, "Share of total cost"),
                              createVNode("span", { class: "text-caption font-weight-bold" }, toDisplayString((unref(viewingCategory)?.pct ?? 0).toFixed(1)) + "%", 1)
                            ]),
                            createVNode("div", { class: "az-bar-wrap az-bar-wrap--full" }, [
                              createVNode("div", {
                                class: "az-bar-fill",
                                style: { width: (unref(viewingCategory)?.pct ?? 0) + "%", background: categoryColor(unref(viewingCategory)?.name) }
                              }, null, 4)
                            ])
                          ])
                        ];
                      }
                    }),
                    _: 1
                  }, _parent3, _scopeId2));
                  _push3(ssrRenderComponent(VCardActions, { class: "px-4 pb-4" }, {
                    default: withCtx((_3, _push4, _parent4, _scopeId3) => {
                      if (_push4) {
                        _push4(ssrRenderComponent(VSpacer, null, null, _parent4, _scopeId3));
                        _push4(ssrRenderComponent(VBtn, {
                          variant: "text",
                          onClick: ($event) => viewDialog.value = false
                        }, {
                          default: withCtx((_4, _push5, _parent5, _scopeId4) => {
                            if (_push5) {
                              _push5(`Close`);
                            } else {
                              return [
                                createTextVNode("Close")
                              ];
                            }
                          }),
                          _: 1
                        }, _parent4, _scopeId3));
                        _push4(ssrRenderComponent(VBtn, {
                          variant: "flat",
                          color: "primary",
                          "prepend-icon": "mdi-pencil-outline",
                          onClick: ($event) => {
                            viewDialog.value = false;
                            openEditCategoryDialog(unref(viewingCategory)?.name);
                          }
                        }, {
                          default: withCtx((_4, _push5, _parent5, _scopeId4) => {
                            if (_push5) {
                              _push5(`Edit`);
                            } else {
                              return [
                                createTextVNode("Edit")
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
                            onClick: ($event) => viewDialog.value = false
                          }, {
                            default: withCtx(() => [
                              createTextVNode("Close")
                            ]),
                            _: 1
                          }, 8, ["onClick"]),
                          createVNode(VBtn, {
                            variant: "flat",
                            color: "primary",
                            "prepend-icon": "mdi-pencil-outline",
                            onClick: ($event) => {
                              viewDialog.value = false;
                              openEditCategoryDialog(unref(viewingCategory)?.name);
                            }
                          }, {
                            default: withCtx(() => [
                              createTextVNode("Edit")
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
                    createVNode(VCardTitle, { class: "text-h6 font-weight-bold px-4 pt-4 d-flex align-center" }, {
                      default: withCtx(() => [
                        createVNode("div", {
                          class: "az-cat-grid__icon mr-3",
                          style: { background: categoryColor(unref(viewingCategory)?.name) }
                        }, toDisplayString((unref(viewingCategory)?.name || "?").charAt(0).toUpperCase()), 5),
                        createTextVNode(" " + toDisplayString(unref(viewingCategory)?.name || "Uncategorized"), 1)
                      ]),
                      _: 1
                    }),
                    createVNode(VCardText, { class: "px-4 pb-2" }, {
                      default: withCtx(() => [
                        createVNode("div", { class: "az-cat-view__row" }, [
                          createVNode("span", { class: "az-cat-view__label" }, "Type"),
                          createVNode("span", null, [
                            unref(viewingCategory) && isDefaultCategory(unref(viewingCategory).name) ? (openBlock(), createBlock("span", {
                              key: 0,
                              class: "az-cat-badge az-cat-badge--default"
                            }, "Default")) : (openBlock(), createBlock("span", {
                              key: 1,
                              class: "az-cat-badge az-cat-badge--custom"
                            }, "Custom"))
                          ])
                        ]),
                        createVNode("div", { class: "az-cat-view__row" }, [
                          createVNode("span", { class: "az-cat-view__label" }, "Description"),
                          createVNode("span", { class: "text-medium-emphasis" }, toDisplayString(categoryDescription(unref(viewingCategory)?.name) || "—"), 1)
                        ]),
                        createVNode("div", { class: "az-cat-view__row" }, [
                          createVNode("span", { class: "az-cat-view__label" }, "Color"),
                          createVNode("span", { class: "d-flex align-center gap-2" }, [
                            createVNode("span", {
                              class: "az-cat-view__swatch",
                              style: { background: categoryColor(unref(viewingCategory)?.name) }
                            }, null, 4),
                            createVNode("code", null, toDisplayString(categoryColor(unref(viewingCategory)?.name)), 1)
                          ])
                        ]),
                        createVNode("div", { class: "az-cat-view__row" }, [
                          createVNode("span", { class: "az-cat-view__label" }, "Status"),
                          createVNode("span", null, [
                            createVNode("span", {
                              class: ["az-cat-badge", categoryActiveObj(unref(viewingCategory)?.name) ? "az-cat-badge--custom" : "az-cat-badge--count"]
                            }, toDisplayString(categoryActiveObj(unref(viewingCategory)?.name) ? "Active" : "Inactive"), 3)
                          ])
                        ]),
                        createVNode(VDivider, { class: "my-3" }),
                        createVNode("div", { class: "az-cat-view__stats" }, [
                          createVNode("div", { class: "az-cat-view__stat" }, [
                            createVNode("span", { class: "az-cat-view__stat-num" }, toDisplayString(unref(viewingCategory)?.count ?? 0), 1),
                            createVNode("span", { class: "az-cat-view__stat-label" }, "Expenses")
                          ]),
                          createVNode("div", { class: "az-cat-view__stat" }, [
                            createVNode("span", { class: "az-cat-view__stat-num text-error" }, toDisplayString(formatMoney(unref(viewingCategory)?.spend)), 1),
                            createVNode("span", { class: "az-cat-view__stat-label" }, "Spend")
                          ]),
                          createVNode("div", { class: "az-cat-view__stat" }, [
                            createVNode("span", { class: "az-cat-view__stat-num text-info" }, toDisplayString(formatMoney(unref(viewingCategory)?.cost)), 1),
                            createVNode("span", { class: "az-cat-view__stat-label" }, "Cost")
                          ]),
                          createVNode("div", { class: "az-cat-view__stat" }, [
                            createVNode("span", {
                              class: "az-cat-view__stat-num",
                              style: { "color": "#7C4DFF" }
                            }, toDisplayString(formatMoney(unref(viewingCategory)?.retail)), 1),
                            createVNode("span", { class: "az-cat-view__stat-label" }, "Retail")
                          ])
                        ]),
                        createVNode("div", { class: "mt-3" }, [
                          createVNode("div", { class: "d-flex align-center justify-space-between mb-1" }, [
                            createVNode("span", { class: "text-caption text-medium-emphasis" }, "Share of total cost"),
                            createVNode("span", { class: "text-caption font-weight-bold" }, toDisplayString((unref(viewingCategory)?.pct ?? 0).toFixed(1)) + "%", 1)
                          ]),
                          createVNode("div", { class: "az-bar-wrap az-bar-wrap--full" }, [
                            createVNode("div", {
                              class: "az-bar-fill",
                              style: { width: (unref(viewingCategory)?.pct ?? 0) + "%", background: categoryColor(unref(viewingCategory)?.name) }
                            }, null, 4)
                          ])
                        ])
                      ]),
                      _: 1
                    }),
                    createVNode(VCardActions, { class: "px-4 pb-4" }, {
                      default: withCtx(() => [
                        createVNode(VSpacer),
                        createVNode(VBtn, {
                          variant: "text",
                          onClick: ($event) => viewDialog.value = false
                        }, {
                          default: withCtx(() => [
                            createTextVNode("Close")
                          ]),
                          _: 1
                        }, 8, ["onClick"]),
                        createVNode(VBtn, {
                          variant: "flat",
                          color: "primary",
                          "prepend-icon": "mdi-pencil-outline",
                          onClick: ($event) => {
                            viewDialog.value = false;
                            openEditCategoryDialog(unref(viewingCategory)?.name);
                          }
                        }, {
                          default: withCtx(() => [
                            createTextVNode("Edit")
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
          } else {
            return [
              createVNode(VCard, {
                rounded: "xl",
                class: "pa-2"
              }, {
                default: withCtx(() => [
                  createVNode(VCardTitle, { class: "text-h6 font-weight-bold px-4 pt-4 d-flex align-center" }, {
                    default: withCtx(() => [
                      createVNode("div", {
                        class: "az-cat-grid__icon mr-3",
                        style: { background: categoryColor(unref(viewingCategory)?.name) }
                      }, toDisplayString((unref(viewingCategory)?.name || "?").charAt(0).toUpperCase()), 5),
                      createTextVNode(" " + toDisplayString(unref(viewingCategory)?.name || "Uncategorized"), 1)
                    ]),
                    _: 1
                  }),
                  createVNode(VCardText, { class: "px-4 pb-2" }, {
                    default: withCtx(() => [
                      createVNode("div", { class: "az-cat-view__row" }, [
                        createVNode("span", { class: "az-cat-view__label" }, "Type"),
                        createVNode("span", null, [
                          unref(viewingCategory) && isDefaultCategory(unref(viewingCategory).name) ? (openBlock(), createBlock("span", {
                            key: 0,
                            class: "az-cat-badge az-cat-badge--default"
                          }, "Default")) : (openBlock(), createBlock("span", {
                            key: 1,
                            class: "az-cat-badge az-cat-badge--custom"
                          }, "Custom"))
                        ])
                      ]),
                      createVNode("div", { class: "az-cat-view__row" }, [
                        createVNode("span", { class: "az-cat-view__label" }, "Description"),
                        createVNode("span", { class: "text-medium-emphasis" }, toDisplayString(categoryDescription(unref(viewingCategory)?.name) || "—"), 1)
                      ]),
                      createVNode("div", { class: "az-cat-view__row" }, [
                        createVNode("span", { class: "az-cat-view__label" }, "Color"),
                        createVNode("span", { class: "d-flex align-center gap-2" }, [
                          createVNode("span", {
                            class: "az-cat-view__swatch",
                            style: { background: categoryColor(unref(viewingCategory)?.name) }
                          }, null, 4),
                          createVNode("code", null, toDisplayString(categoryColor(unref(viewingCategory)?.name)), 1)
                        ])
                      ]),
                      createVNode("div", { class: "az-cat-view__row" }, [
                        createVNode("span", { class: "az-cat-view__label" }, "Status"),
                        createVNode("span", null, [
                          createVNode("span", {
                            class: ["az-cat-badge", categoryActiveObj(unref(viewingCategory)?.name) ? "az-cat-badge--custom" : "az-cat-badge--count"]
                          }, toDisplayString(categoryActiveObj(unref(viewingCategory)?.name) ? "Active" : "Inactive"), 3)
                        ])
                      ]),
                      createVNode(VDivider, { class: "my-3" }),
                      createVNode("div", { class: "az-cat-view__stats" }, [
                        createVNode("div", { class: "az-cat-view__stat" }, [
                          createVNode("span", { class: "az-cat-view__stat-num" }, toDisplayString(unref(viewingCategory)?.count ?? 0), 1),
                          createVNode("span", { class: "az-cat-view__stat-label" }, "Expenses")
                        ]),
                        createVNode("div", { class: "az-cat-view__stat" }, [
                          createVNode("span", { class: "az-cat-view__stat-num text-error" }, toDisplayString(formatMoney(unref(viewingCategory)?.spend)), 1),
                          createVNode("span", { class: "az-cat-view__stat-label" }, "Spend")
                        ]),
                        createVNode("div", { class: "az-cat-view__stat" }, [
                          createVNode("span", { class: "az-cat-view__stat-num text-info" }, toDisplayString(formatMoney(unref(viewingCategory)?.cost)), 1),
                          createVNode("span", { class: "az-cat-view__stat-label" }, "Cost")
                        ]),
                        createVNode("div", { class: "az-cat-view__stat" }, [
                          createVNode("span", {
                            class: "az-cat-view__stat-num",
                            style: { "color": "#7C4DFF" }
                          }, toDisplayString(formatMoney(unref(viewingCategory)?.retail)), 1),
                          createVNode("span", { class: "az-cat-view__stat-label" }, "Retail")
                        ])
                      ]),
                      createVNode("div", { class: "mt-3" }, [
                        createVNode("div", { class: "d-flex align-center justify-space-between mb-1" }, [
                          createVNode("span", { class: "text-caption text-medium-emphasis" }, "Share of total cost"),
                          createVNode("span", { class: "text-caption font-weight-bold" }, toDisplayString((unref(viewingCategory)?.pct ?? 0).toFixed(1)) + "%", 1)
                        ]),
                        createVNode("div", { class: "az-bar-wrap az-bar-wrap--full" }, [
                          createVNode("div", {
                            class: "az-bar-fill",
                            style: { width: (unref(viewingCategory)?.pct ?? 0) + "%", background: categoryColor(unref(viewingCategory)?.name) }
                          }, null, 4)
                        ])
                      ])
                    ]),
                    _: 1
                  }),
                  createVNode(VCardActions, { class: "px-4 pb-4" }, {
                    default: withCtx(() => [
                      createVNode(VSpacer),
                      createVNode(VBtn, {
                        variant: "text",
                        onClick: ($event) => viewDialog.value = false
                      }, {
                        default: withCtx(() => [
                          createTextVNode("Close")
                        ]),
                        _: 1
                      }, 8, ["onClick"]),
                      createVNode(VBtn, {
                        variant: "flat",
                        color: "primary",
                        "prepend-icon": "mdi-pencil-outline",
                        onClick: ($event) => {
                          viewDialog.value = false;
                          openEditCategoryDialog(unref(viewingCategory)?.name);
                        }
                      }, {
                        default: withCtx(() => [
                          createTextVNode("Edit")
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
      }, _parent));
      _push(`</div>`);
    };
  }
};
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/expenses/categories.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const categories = /* @__PURE__ */ _export_sfc(_sfc_main, [["__scopeId", "data-v-d021cb38"]]);
export {
  categories as default
};
//# sourceMappingURL=categories-MUQcnNnS.js.map
