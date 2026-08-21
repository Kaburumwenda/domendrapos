import { defineComponent, ref, computed, watch, mergeProps, withCtx, createTextVNode, unref, toDisplayString, isRef, createVNode, openBlock, createBlock, createCommentVNode, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent, ssrIncludeBooleanAttr, ssrRenderList, ssrRenderClass, ssrInterpolate, ssrRenderAttr, ssrRenderStyle, ssrLooseContain, ssrLooseEqual } from 'vue/server-renderer';
import { u as useApi } from './useApi-9yTPzSUF.mjs';
import { M as useToast, d as VIcon, E as VProgressCircular, x as VDialog, k as VCard, g as VBtn, p as VDivider } from './server.mjs';
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

const pageSize = 20;
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "audit-logs",
  __ssrInlineRender: true,
  setup(__props) {
    useApi();
    useToast();
    const loading = ref(false);
    const logs = ref([]);
    const summary = ref(null);
    const detailDialog = ref(false);
    const selected = ref(null);
    const search = ref("");
    const actionFilter = ref("");
    const resourceFilter = ref("");
    const userFilter = ref("");
    const page = ref(1);
    const actionLabels = {
      create: "Create",
      update: "Update",
      delete: "Delete",
      login: "Login",
      logout: "Logout",
      approve: "Approve",
      reject: "Reject",
      void: "Void",
      refund: "Refund",
      export: "Export",
      config_change: "Config Change"
    };
    const actionColors = {
      create: "success",
      update: "info",
      delete: "error",
      login: "primary",
      logout: "neutral",
      approve: "success",
      reject: "warning",
      void: "error",
      refund: "warning",
      export: "info",
      config_change: "secondary"
    };
    const resourceLabels = {
      User: "Staff",
      Product: "Product",
      Customer: "Customer",
      Supplier: "Supplier",
      PurchaseOrder: "Purchase Order",
      GoodsReceipt: "Goods Receipt",
      POSTransaction: "POS Sale",
      ParkedSale: "Parked Sale",
      POSShift: "Cashier Shift",
      POSCredit: "Credit Account",
      Sale: "Sale",
      Refund: "Refund",
      StockItem: "Stock Item",
      StockAdjustment: "Stock Adjustment",
      Expense: "Expense",
      CustomerInvoice: "Invoice",
      Permission: "Permission",
      RolePermission: "Role Permission",
      Client: "Tenant",
      Branch: "Branch",
      Register: "Register",
      StockTransfer: "Stock Transfer"
    };
    function actionIcon(a) {
      const map = {
        create: "mdi-plus-circle-outline",
        update: "mdi-pencil-outline",
        delete: "mdi-delete-outline",
        login: "mdi-login",
        logout: "mdi-logout",
        approve: "mdi-check-decagram-outline",
        reject: "mdi-close-circle-outline",
        void: "mdi-cancel",
        refund: "mdi-cash-refund",
        export: "mdi-download-outline",
        config_change: "mdi-cog-outline"
      };
      return map[a] || "mdi-circle-outline";
    }
    const resourceOptions = computed(() => {
      const s = /* @__PURE__ */ new Set();
      for (const l of logs.value) s.add(l.resource_type);
      return Array.from(s).sort();
    });
    const userOptions = computed(() => {
      const s = /* @__PURE__ */ new Set();
      for (const l of logs.value) if (l.user_email) s.add(l.user_email);
      return Array.from(s).sort();
    });
    const actionOptions = computed(() => {
      return Object.keys(actionLabels).map((v) => ({ value: v, label: actionLabels[v] }));
    });
    const actionPills = computed(() => {
      return Object.keys(actionLabels).map((v) => ({
        value: v,
        label: actionLabels[v],
        color: actionColors[v],
        count: logs.value.filter((l) => l.action === v).length
      }));
    });
    const maxDayCount = computed(() => {
      if (!summary.value?.by_day?.length) return 1;
      return Math.max(1, ...summary.value.by_day.map((d) => d.count));
    });
    const filteredLogs = computed(() => {
      let out = logs.value;
      const q = search.value.trim().toLowerCase();
      if (q) {
        out = out.filter(
          (l) => (l.description || "").toLowerCase().includes(q) || (l.resource_id || "").toLowerCase().includes(q) || (l.user_email || "").toLowerCase().includes(q)
        );
      }
      if (actionFilter.value) out = out.filter((l) => l.action === actionFilter.value);
      if (resourceFilter.value) out = out.filter((l) => l.resource_type === resourceFilter.value);
      if (userFilter.value) out = out.filter((l) => l.user_email === userFilter.value);
      return out;
    });
    const totalPages = computed(() => Math.max(1, Math.ceil(filteredLogs.value.length / pageSize)));
    const pageStart = computed(() => (page.value - 1) * pageSize);
    const pageEnd = computed(() => Math.min(filteredLogs.value.length, pageStart.value + pageSize));
    const paginatedLogs = computed(
      () => filteredLogs.value.slice(pageStart.value, pageStart.value + pageSize)
    );
    const kpis = computed(() => [
      {
        label: "Total Events",
        value: summary.value?.total ?? logs.value.length,
        icon: "mdi-shield-key-outline",
        color: "primary"
      },
      {
        label: "Last 24 Hours",
        value: summary.value?.recent_24h ?? 0,
        icon: "mdi-clock-outline",
        color: "info"
      },
      {
        label: "Last 7 Days",
        value: summary.value?.recent_7d ?? 0,
        icon: "mdi-calendar-week-begin",
        color: "success"
      },
      {
        label: "Active Users",
        value: summary.value?.by_user?.length ?? 0,
        icon: "mdi-account-group-outline",
        color: "warning"
      },
      {
        label: "Actions Today",
        value: todayCount.value,
        icon: "mdi-gesture-tap-button",
        color: "purple"
      },
      {
        label: "Resources Touched",
        value: uniqueResources.value,
        icon: "mdi-shape-outline",
        color: "neutral"
      }
    ]);
    const todayCount = computed(() => {
      const today = (/* @__PURE__ */ new Date()).toISOString().slice(0, 10);
      return logs.value.filter((l) => l.timestamp?.startsWith(today)).length;
    });
    const uniqueResources = computed(() => new Set(logs.value.map((l) => l.resource_type)).size);
    watch([search, actionFilter, resourceFilter, userFilter], () => {
      page.value = 1;
    });
    function relativeTime(iso) {
      if (!iso) return "";
      const d = new Date(iso);
      const now = Date.now();
      const diff = (now - d.getTime()) / 1e3;
      if (diff < 60) return "just now";
      if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
      if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
      if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
      return d.toLocaleDateString();
    }
    function formatDateTime(iso) {
      if (!iso) return "";
      return new Date(iso).toLocaleString(void 0, {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit"
      });
    }
    function formatDayShort(iso) {
      const d = new Date(iso);
      return d.toLocaleDateString(void 0, { weekday: "short" }).slice(0, 3);
    }
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "aud-page" }, _attrs))} data-v-9fe4abfe><div class="aud-header" data-v-9fe4abfe><div class="aud-header__left" data-v-9fe4abfe><h1 class="aud-header__title" data-v-9fe4abfe>Audit Logs</h1><p class="aud-header__sub" data-v-9fe4abfe> Immutable trail of every security-relevant action across the system </p></div><div class="aud-header__actions" data-v-9fe4abfe><button class="aud-btn aud-btn--ghost" data-v-9fe4abfe>`);
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
      _push(` Refresh </button><button class="aud-btn aud-btn--ghost"${ssrIncludeBooleanAttr(!unref(filteredLogs).length) ? " disabled" : ""} data-v-9fe4abfe>`);
      _push(ssrRenderComponent(VIcon, { size: "18" }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`mdi-download`);
          } else {
            return [
              createTextVNode("mdi-download")
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(` Export CSV </button></div></div><div class="aud-kpi-grid" data-v-9fe4abfe><!--[-->`);
      ssrRenderList(unref(kpis), (kpi) => {
        _push(`<div class="aud-kpi" data-v-9fe4abfe><div class="${ssrRenderClass([`aud-kpi__icon--${kpi.color}`, "aud-kpi__icon"])}" data-v-9fe4abfe>`);
        _push(ssrRenderComponent(VIcon, { size: "22" }, {
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
        _push(`</div><div class="aud-kpi__body" data-v-9fe4abfe><p class="aud-kpi__label" data-v-9fe4abfe>${ssrInterpolate(kpi.label)}</p><p class="aud-kpi__value" data-v-9fe4abfe>${ssrInterpolate(kpi.value)}</p></div></div>`);
      });
      _push(`<!--]--></div>`);
      if (unref(summary)) {
        _push(`<div class="aud-chart-card" data-v-9fe4abfe><div class="aud-chart-card__head" data-v-9fe4abfe><div data-v-9fe4abfe><h3 class="aud-chart-card__title" data-v-9fe4abfe>Activity — Last 7 Days</h3><p class="aud-chart-card__sub" data-v-9fe4abfe>Daily audit events</p></div><div class="aud-chart-card__legend" data-v-9fe4abfe><span class="aud-chart-card__legend-dot" data-v-9fe4abfe></span> Events </div></div><div class="aud-chart" data-v-9fe4abfe><!--[-->`);
        ssrRenderList(unref(summary).by_day, (day, i) => {
          _push(`<div class="aud-chart__bar-col"${ssrRenderAttr("title", `${day.date}: ${day.count} events`)} data-v-9fe4abfe><div class="aud-chart__bar-value" data-v-9fe4abfe>${ssrInterpolate(day.count || "")}</div><div class="aud-chart__bar-track" data-v-9fe4abfe><div class="aud-chart__bar-fill" style="${ssrRenderStyle({ height: `${day.count / unref(maxDayCount) * 100}%` })}" data-v-9fe4abfe></div></div><div class="aud-chart__bar-label" data-v-9fe4abfe>${ssrInterpolate(formatDayShort(day.date))}</div></div>`);
        });
        _push(`<!--]--></div></div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`<div class="aud-toolbar" data-v-9fe4abfe><div class="aud-toolbar__search" data-v-9fe4abfe>`);
      _push(ssrRenderComponent(VIcon, {
        size: "18",
        class: "aud-toolbar__icon"
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
      _push(`<input${ssrRenderAttr("value", unref(search))} class="aud-toolbar__input" placeholder="Search description, resource ID, user..." data-v-9fe4abfe></div><div class="aud-toolbar__selects" data-v-9fe4abfe><select class="aud-toolbar__select" data-v-9fe4abfe><option value="" data-v-9fe4abfe${ssrIncludeBooleanAttr(Array.isArray(unref(actionFilter)) ? ssrLooseContain(unref(actionFilter), "") : ssrLooseEqual(unref(actionFilter), "")) ? " selected" : ""}>All Actions</option><!--[-->`);
      ssrRenderList(unref(actionOptions), (a) => {
        _push(`<option${ssrRenderAttr("value", a.value)} data-v-9fe4abfe${ssrIncludeBooleanAttr(Array.isArray(unref(actionFilter)) ? ssrLooseContain(unref(actionFilter), a.value) : ssrLooseEqual(unref(actionFilter), a.value)) ? " selected" : ""}>${ssrInterpolate(a.label)}</option>`);
      });
      _push(`<!--]--></select><select class="aud-toolbar__select" data-v-9fe4abfe><option value="" data-v-9fe4abfe${ssrIncludeBooleanAttr(Array.isArray(unref(resourceFilter)) ? ssrLooseContain(unref(resourceFilter), "") : ssrLooseEqual(unref(resourceFilter), "")) ? " selected" : ""}>All Resources</option><!--[-->`);
      ssrRenderList(unref(resourceOptions), (r) => {
        _push(`<option${ssrRenderAttr("value", r)} data-v-9fe4abfe${ssrIncludeBooleanAttr(Array.isArray(unref(resourceFilter)) ? ssrLooseContain(unref(resourceFilter), r) : ssrLooseEqual(unref(resourceFilter), r)) ? " selected" : ""}>${ssrInterpolate(resourceLabels[r] || r)}</option>`);
      });
      _push(`<!--]--></select><select class="aud-toolbar__select" data-v-9fe4abfe><option value="" data-v-9fe4abfe${ssrIncludeBooleanAttr(Array.isArray(unref(userFilter)) ? ssrLooseContain(unref(userFilter), "") : ssrLooseEqual(unref(userFilter), "")) ? " selected" : ""}>All Users</option><!--[-->`);
      ssrRenderList(unref(userOptions), (u) => {
        _push(`<option${ssrRenderAttr("value", u)} data-v-9fe4abfe${ssrIncludeBooleanAttr(Array.isArray(unref(userFilter)) ? ssrLooseContain(unref(userFilter), u) : ssrLooseEqual(unref(userFilter), u)) ? " selected" : ""}>${ssrInterpolate(u)}</option>`);
      });
      _push(`<!--]--></select></div></div><div class="aud-pills" data-v-9fe4abfe><button class="${ssrRenderClass([{ "aud-pills__pill--active": unref(actionFilter) === "" }, "aud-pills__pill"])}" data-v-9fe4abfe> All <span class="aud-pills__count" data-v-9fe4abfe>${ssrInterpolate(unref(logs).length)}</span></button><!--[-->`);
      ssrRenderList(unref(actionPills), (a) => {
        _push(`<button class="${ssrRenderClass([{ "aud-pills__pill--active": unref(actionFilter) === a.value }, "aud-pills__pill"])}" data-v-9fe4abfe><span class="${ssrRenderClass([`aud-pills__dot--${a.color}`, "aud-pills__dot"])}" data-v-9fe4abfe></span> ${ssrInterpolate(a.label)} <span class="aud-pills__count" data-v-9fe4abfe>${ssrInterpolate(a.count)}</span></button>`);
      });
      _push(`<!--]--></div><div class="aud-table-wrap" data-v-9fe4abfe>`);
      if (unref(loading)) {
        _push(`<div class="aud-loading" data-v-9fe4abfe>`);
        _push(ssrRenderComponent(VProgressCircular, {
          indeterminate: "",
          color: "primary",
          size: "48",
          width: "4"
        }, null, _parent));
        _push(`<p data-v-9fe4abfe>Loading audit trail...</p></div>`);
      } else if (!unref(filteredLogs).length) {
        _push(`<div class="aud-empty" data-v-9fe4abfe>`);
        _push(ssrRenderComponent(VIcon, {
          size: "48",
          class: "aud-empty__icon"
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`mdi-shield-check-outline`);
            } else {
              return [
                createTextVNode("mdi-shield-check-outline")
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(`<p class="aud-empty__title" data-v-9fe4abfe>No matching audit entries</p><p class="aud-empty__sub" data-v-9fe4abfe>Try adjusting your filters</p></div>`);
      } else {
        _push(`<div class="aud-table-scroll" data-v-9fe4abfe><table class="aud-table" data-v-9fe4abfe><thead data-v-9fe4abfe><tr data-v-9fe4abfe><th class="aud-table__th" data-v-9fe4abfe>Action</th><th class="aud-table__th" data-v-9fe4abfe>Resource</th><th class="aud-table__th" data-v-9fe4abfe>Description</th><th class="aud-table__th" data-v-9fe4abfe>User</th><th class="aud-table__th" data-v-9fe4abfe>IP</th><th class="aud-table__th" data-v-9fe4abfe>Time</th><th class="aud-table__th aud-table__th--right" data-v-9fe4abfe></th></tr></thead><tbody data-v-9fe4abfe><!--[-->`);
        ssrRenderList(unref(paginatedLogs), (log) => {
          _push(`<tr class="aud-table__row" data-v-9fe4abfe><td class="aud-table__cell" data-v-9fe4abfe><span class="${ssrRenderClass([`aud-action-chip--${log.action}`, "aud-action-chip"])}" data-v-9fe4abfe>`);
          _push(ssrRenderComponent(VIcon, { size: "14" }, {
            default: withCtx((_, _push2, _parent2, _scopeId) => {
              if (_push2) {
                _push2(`${ssrInterpolate(actionIcon(log.action))}`);
              } else {
                return [
                  createTextVNode(toDisplayString(actionIcon(log.action)), 1)
                ];
              }
            }),
            _: 2
          }, _parent));
          _push(` ${ssrInterpolate(log.action_label)}</span></td><td class="aud-table__cell" data-v-9fe4abfe><div class="aud-resource" data-v-9fe4abfe><span class="aud-resource__type" data-v-9fe4abfe>${ssrInterpolate(log.resource_label || log.resource_type)}</span>`);
          if (log.resource_id) {
            _push(`<span class="aud-resource__id" data-v-9fe4abfe>#${ssrInterpolate(log.resource_id)}</span>`);
          } else {
            _push(`<!---->`);
          }
          _push(`</div></td><td class="aud-table__cell aud-table__cell--desc" data-v-9fe4abfe><p class="aud-table__desc" data-v-9fe4abfe>${ssrInterpolate(log.description)}</p></td><td class="aud-table__cell" data-v-9fe4abfe><span class="aud-user" data-v-9fe4abfe>${ssrInterpolate(log.user_email || "anonymous")}</span></td><td class="aud-table__cell" data-v-9fe4abfe><span class="aud-ip" data-v-9fe4abfe>${ssrInterpolate(log.ip_address || "—")}</span></td><td class="aud-table__cell" data-v-9fe4abfe><div class="aud-time" data-v-9fe4abfe><p class="aud-time__rel" data-v-9fe4abfe>${ssrInterpolate(relativeTime(log.timestamp))}</p><p class="aud-time__abs" data-v-9fe4abfe>${ssrInterpolate(formatDateTime(log.timestamp))}</p></div></td><td class="aud-table__cell aud-table__cell--right" data-v-9fe4abfe>`);
          _push(ssrRenderComponent(VIcon, {
            size: "18",
            class: "aud-table__chevron"
          }, {
            default: withCtx((_, _push2, _parent2, _scopeId) => {
              if (_push2) {
                _push2(`mdi-chevron-right`);
              } else {
                return [
                  createTextVNode("mdi-chevron-right")
                ];
              }
            }),
            _: 2
          }, _parent));
          _push(`</td></tr>`);
        });
        _push(`<!--]--></tbody></table></div>`);
      }
      if (unref(filteredLogs).length) {
        _push(`<div class="aud-pagination" data-v-9fe4abfe><p class="aud-pagination__info" data-v-9fe4abfe> Showing ${ssrInterpolate(unref(pageStart) + 1)}–${ssrInterpolate(unref(pageEnd))} of ${ssrInterpolate(unref(filteredLogs).length)}</p><div class="aud-pagination__nav" data-v-9fe4abfe><button class="aud-pagination__page"${ssrIncludeBooleanAttr(unref(page) === 1) ? " disabled" : ""} data-v-9fe4abfe>`);
        _push(ssrRenderComponent(VIcon, { size: "16" }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`mdi-chevron-left`);
            } else {
              return [
                createTextVNode("mdi-chevron-left")
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(`</button><span class="aud-pagination__current" data-v-9fe4abfe>${ssrInterpolate(unref(page))} / ${ssrInterpolate(unref(totalPages))}</span><button class="aud-pagination__page"${ssrIncludeBooleanAttr(unref(page) === unref(totalPages)) ? " disabled" : ""} data-v-9fe4abfe>`);
        _push(ssrRenderComponent(VIcon, { size: "16" }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`mdi-chevron-right`);
            } else {
              return [
                createTextVNode("mdi-chevron-right")
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(`</button></div></div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</div>`);
      _push(ssrRenderComponent(VDialog, {
        modelValue: unref(detailDialog),
        "onUpdate:modelValue": ($event) => isRef(detailDialog) ? detailDialog.value = $event : null,
        "max-width": "680",
        "scroll-strategy": "block"
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            if (unref(selected)) {
              _push2(ssrRenderComponent(VCard, {
                rounded: "xl",
                class: "aud-dialog"
              }, {
                default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                  if (_push3) {
                    _push3(`<div class="aud-dialog__header" data-v-9fe4abfe${_scopeId2}><div class="${ssrRenderClass([`aud-dialog__header-icon--${unref(selected).action_color}`, "aud-dialog__header-icon"])}" data-v-9fe4abfe${_scopeId2}>`);
                    _push3(ssrRenderComponent(VIcon, { size: "24" }, {
                      default: withCtx((_3, _push4, _parent4, _scopeId3) => {
                        if (_push4) {
                          _push4(`${ssrInterpolate(actionIcon(unref(selected).action))}`);
                        } else {
                          return [
                            createTextVNode(toDisplayString(actionIcon(unref(selected).action)), 1)
                          ];
                        }
                      }),
                      _: 1
                    }, _parent3, _scopeId2));
                    _push3(`</div><div class="flex-1" data-v-9fe4abfe${_scopeId2}><h3 class="text-h6 font-weight-bold" data-v-9fe4abfe${_scopeId2}>${ssrInterpolate(unref(selected).action_label)} — ${ssrInterpolate(unref(selected).resource_label)}</h3><p class="text-body-2 text-medium-emphasis" data-v-9fe4abfe${_scopeId2}>${ssrInterpolate(unref(selected).description)}</p></div>`);
                    _push3(ssrRenderComponent(VBtn, {
                      icon: "mdi-close",
                      variant: "text",
                      size: "small",
                      onClick: ($event) => detailDialog.value = false
                    }, null, _parent3, _scopeId2));
                    _push3(`</div>`);
                    _push3(ssrRenderComponent(VDivider, null, null, _parent3, _scopeId2));
                    _push3(`<div class="aud-dialog__body" data-v-9fe4abfe${_scopeId2}><div class="aud-detail-grid" data-v-9fe4abfe${_scopeId2}><div class="aud-detail-item" data-v-9fe4abfe${_scopeId2}><p class="aud-detail__label" data-v-9fe4abfe${_scopeId2}>User</p><p class="aud-detail__value" data-v-9fe4abfe${_scopeId2}>${ssrInterpolate(unref(selected).user_email || "anonymous")}</p></div><div class="aud-detail-item" data-v-9fe4abfe${_scopeId2}><p class="aud-detail__label" data-v-9fe4abfe${_scopeId2}>User ID</p><p class="aud-detail__value" data-v-9fe4abfe${_scopeId2}>${ssrInterpolate(unref(selected).user_id || "—")}</p></div><div class="aud-detail-item" data-v-9fe4abfe${_scopeId2}><p class="aud-detail__label" data-v-9fe4abfe${_scopeId2}>Resource ID</p><p class="aud-detail__value" data-v-9fe4abfe${_scopeId2}>${ssrInterpolate(unref(selected).resource_id || "—")}</p></div><div class="aud-detail-item" data-v-9fe4abfe${_scopeId2}><p class="aud-detail__label" data-v-9fe4abfe${_scopeId2}>IP address</p><p class="aud-detail__value" data-v-9fe4abfe${_scopeId2}>${ssrInterpolate(unref(selected).ip_address || "—")}</p></div><div class="aud-detail-item" data-v-9fe4abfe${_scopeId2}><p class="aud-detail__label" data-v-9fe4abfe${_scopeId2}>Timestamp</p><p class="aud-detail__value" data-v-9fe4abfe${_scopeId2}>${ssrInterpolate(formatDateTime(unref(selected).timestamp))}</p></div><div class="aud-detail-item aud-detail-item--wide" data-v-9fe4abfe${_scopeId2}><p class="aud-detail__label" data-v-9fe4abfe${_scopeId2}>User agent</p><p class="aud-detail__value aud-detail__value--mono" data-v-9fe4abfe${_scopeId2}>${ssrInterpolate(unref(selected).user_agent || "—")}</p></div></div>`);
                    if (unref(selected).new_values && Object.keys(unref(selected).new_values).length) {
                      _push3(`<div class="aud-detail-values" data-v-9fe4abfe${_scopeId2}><p class="aud-detail__label" data-v-9fe4abfe${_scopeId2}>Submitted values</p><pre class="aud-detail__json" data-v-9fe4abfe${_scopeId2}>${ssrInterpolate(JSON.stringify(unref(selected).new_values, null, 2))}</pre></div>`);
                    } else {
                      _push3(`<!---->`);
                    }
                    _push3(`</div>`);
                  } else {
                    return [
                      createVNode("div", { class: "aud-dialog__header" }, [
                        createVNode("div", {
                          class: ["aud-dialog__header-icon", `aud-dialog__header-icon--${unref(selected).action_color}`]
                        }, [
                          createVNode(VIcon, { size: "24" }, {
                            default: withCtx(() => [
                              createTextVNode(toDisplayString(actionIcon(unref(selected).action)), 1)
                            ]),
                            _: 1
                          })
                        ], 2),
                        createVNode("div", { class: "flex-1" }, [
                          createVNode("h3", { class: "text-h6 font-weight-bold" }, toDisplayString(unref(selected).action_label) + " — " + toDisplayString(unref(selected).resource_label), 1),
                          createVNode("p", { class: "text-body-2 text-medium-emphasis" }, toDisplayString(unref(selected).description), 1)
                        ]),
                        createVNode(VBtn, {
                          icon: "mdi-close",
                          variant: "text",
                          size: "small",
                          onClick: ($event) => detailDialog.value = false
                        }, null, 8, ["onClick"])
                      ]),
                      createVNode(VDivider),
                      createVNode("div", { class: "aud-dialog__body" }, [
                        createVNode("div", { class: "aud-detail-grid" }, [
                          createVNode("div", { class: "aud-detail-item" }, [
                            createVNode("p", { class: "aud-detail__label" }, "User"),
                            createVNode("p", { class: "aud-detail__value" }, toDisplayString(unref(selected).user_email || "anonymous"), 1)
                          ]),
                          createVNode("div", { class: "aud-detail-item" }, [
                            createVNode("p", { class: "aud-detail__label" }, "User ID"),
                            createVNode("p", { class: "aud-detail__value" }, toDisplayString(unref(selected).user_id || "—"), 1)
                          ]),
                          createVNode("div", { class: "aud-detail-item" }, [
                            createVNode("p", { class: "aud-detail__label" }, "Resource ID"),
                            createVNode("p", { class: "aud-detail__value" }, toDisplayString(unref(selected).resource_id || "—"), 1)
                          ]),
                          createVNode("div", { class: "aud-detail-item" }, [
                            createVNode("p", { class: "aud-detail__label" }, "IP address"),
                            createVNode("p", { class: "aud-detail__value" }, toDisplayString(unref(selected).ip_address || "—"), 1)
                          ]),
                          createVNode("div", { class: "aud-detail-item" }, [
                            createVNode("p", { class: "aud-detail__label" }, "Timestamp"),
                            createVNode("p", { class: "aud-detail__value" }, toDisplayString(formatDateTime(unref(selected).timestamp)), 1)
                          ]),
                          createVNode("div", { class: "aud-detail-item aud-detail-item--wide" }, [
                            createVNode("p", { class: "aud-detail__label" }, "User agent"),
                            createVNode("p", { class: "aud-detail__value aud-detail__value--mono" }, toDisplayString(unref(selected).user_agent || "—"), 1)
                          ])
                        ]),
                        unref(selected).new_values && Object.keys(unref(selected).new_values).length ? (openBlock(), createBlock("div", {
                          key: 0,
                          class: "aud-detail-values"
                        }, [
                          createVNode("p", { class: "aud-detail__label" }, "Submitted values"),
                          createVNode("pre", { class: "aud-detail__json" }, toDisplayString(JSON.stringify(unref(selected).new_values, null, 2)), 1)
                        ])) : createCommentVNode("", true)
                      ])
                    ];
                  }
                }),
                _: 1
              }, _parent2, _scopeId));
            } else {
              _push2(`<!---->`);
            }
          } else {
            return [
              unref(selected) ? (openBlock(), createBlock(VCard, {
                key: 0,
                rounded: "xl",
                class: "aud-dialog"
              }, {
                default: withCtx(() => [
                  createVNode("div", { class: "aud-dialog__header" }, [
                    createVNode("div", {
                      class: ["aud-dialog__header-icon", `aud-dialog__header-icon--${unref(selected).action_color}`]
                    }, [
                      createVNode(VIcon, { size: "24" }, {
                        default: withCtx(() => [
                          createTextVNode(toDisplayString(actionIcon(unref(selected).action)), 1)
                        ]),
                        _: 1
                      })
                    ], 2),
                    createVNode("div", { class: "flex-1" }, [
                      createVNode("h3", { class: "text-h6 font-weight-bold" }, toDisplayString(unref(selected).action_label) + " — " + toDisplayString(unref(selected).resource_label), 1),
                      createVNode("p", { class: "text-body-2 text-medium-emphasis" }, toDisplayString(unref(selected).description), 1)
                    ]),
                    createVNode(VBtn, {
                      icon: "mdi-close",
                      variant: "text",
                      size: "small",
                      onClick: ($event) => detailDialog.value = false
                    }, null, 8, ["onClick"])
                  ]),
                  createVNode(VDivider),
                  createVNode("div", { class: "aud-dialog__body" }, [
                    createVNode("div", { class: "aud-detail-grid" }, [
                      createVNode("div", { class: "aud-detail-item" }, [
                        createVNode("p", { class: "aud-detail__label" }, "User"),
                        createVNode("p", { class: "aud-detail__value" }, toDisplayString(unref(selected).user_email || "anonymous"), 1)
                      ]),
                      createVNode("div", { class: "aud-detail-item" }, [
                        createVNode("p", { class: "aud-detail__label" }, "User ID"),
                        createVNode("p", { class: "aud-detail__value" }, toDisplayString(unref(selected).user_id || "—"), 1)
                      ]),
                      createVNode("div", { class: "aud-detail-item" }, [
                        createVNode("p", { class: "aud-detail__label" }, "Resource ID"),
                        createVNode("p", { class: "aud-detail__value" }, toDisplayString(unref(selected).resource_id || "—"), 1)
                      ]),
                      createVNode("div", { class: "aud-detail-item" }, [
                        createVNode("p", { class: "aud-detail__label" }, "IP address"),
                        createVNode("p", { class: "aud-detail__value" }, toDisplayString(unref(selected).ip_address || "—"), 1)
                      ]),
                      createVNode("div", { class: "aud-detail-item" }, [
                        createVNode("p", { class: "aud-detail__label" }, "Timestamp"),
                        createVNode("p", { class: "aud-detail__value" }, toDisplayString(formatDateTime(unref(selected).timestamp)), 1)
                      ]),
                      createVNode("div", { class: "aud-detail-item aud-detail-item--wide" }, [
                        createVNode("p", { class: "aud-detail__label" }, "User agent"),
                        createVNode("p", { class: "aud-detail__value aud-detail__value--mono" }, toDisplayString(unref(selected).user_agent || "—"), 1)
                      ])
                    ]),
                    unref(selected).new_values && Object.keys(unref(selected).new_values).length ? (openBlock(), createBlock("div", {
                      key: 0,
                      class: "aud-detail-values"
                    }, [
                      createVNode("p", { class: "aud-detail__label" }, "Submitted values"),
                      createVNode("pre", { class: "aud-detail__json" }, toDisplayString(JSON.stringify(unref(selected).new_values, null, 2)), 1)
                    ])) : createCommentVNode("", true)
                  ])
                ]),
                _: 1
              })) : createCommentVNode("", true)
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
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/admin/audit-logs.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const auditLogs = /* @__PURE__ */ _export_sfc(_sfc_main, [["__scopeId", "data-v-9fe4abfe"]]);

export { auditLogs as default };
//# sourceMappingURL=audit-logs-CpT1FJkk.mjs.map
