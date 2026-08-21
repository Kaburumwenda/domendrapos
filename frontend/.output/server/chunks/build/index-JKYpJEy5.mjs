import { ref, reactive, computed, mergeProps, withCtx, createTextVNode, unref, toDisplayString, createVNode, openBlock, createBlock, Fragment, renderList, isRef, createCommentVNode, useSSRContext } from 'vue';
import { ssrRenderComponent, ssrRenderList, ssrInterpolate, ssrRenderClass } from 'vue/server-renderer';
import { M as useToast, N as useRoute$1, V as VContainer, d as VIcon, g as VBtn, i as VRow, j as VCol, k as VCard, O as VFadeTransition, E as VProgressCircular, P as VTable, Q as VAvatar, v as VChip, C as VTextField, p as VDivider, h as VAlert, R as VSwitch, x as VDialog } from './server.mjs';
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

const API = "/security";
const _sfc_main = {
  __name: "index",
  __ssrInlineRender: true,
  setup(__props) {
    const toast = useToast();
    useRoute$1();
    const loading = ref(false);
    const loadingAttempts = ref(false);
    const loadingLogs = ref(false);
    const loadingSessions = ref(false);
    const savingSettings = ref(false);
    const resetting = ref(false);
    const unlocking = ref(false);
    const activeTab = ref("locked");
    const resetAllDialog = ref(false);
    const unlockUserDialog = ref(false);
    const unlockForm = reactive({ username: "", ip: "" });
    const attemptsSearch = ref("");
    const overview = ref({});
    const locked = ref([]);
    const attempts = ref([]);
    const failureLogs = ref([]);
    const sessions = ref([]);
    const settingsForm = reactive({
      failure_limit: 5,
      cooloff_time_hours: 1,
      reset_on_success: true
    });
    const tabs = computed(() => [
      {
        value: "locked",
        label: "Locked Users",
        icon: "mdi-lock-alert",
        count: overview.value.locked_count ?? 0
      },
      {
        value: "attempts",
        label: "All Attempts",
        icon: "mdi-login",
        count: overview.value.total_attempts ?? 0
      },
      {
        value: "logs",
        label: "Failure Logs",
        icon: "mdi-alert-circle-outline",
        count: overview.value.total_failure_logs ?? 0
      },
      {
        value: "sessions",
        label: "Active Sessions",
        icon: "mdi-account-clock",
        count: sessions.value.length
      },
      {
        value: "settings",
        label: "Settings",
        icon: "mdi-cog-outline"
      }
    ]);
    const kpis = computed(() => [
      {
        label: "Locked Out",
        value: overview.value.locked_count ?? 0,
        sub: "users/IPs currently blocked",
        icon: "mdi-lock-alert",
        color: "error"
      },
      {
        label: "Access Attempts",
        value: overview.value.total_attempts ?? 0,
        sub: `${overview.value.unique_ips ?? 0} unique IPs`,
        icon: "mdi-login",
        color: "warning"
      },
      {
        label: "Active Sessions",
        value: overview.value.active_sessions ?? 0,
        sub: "currently logged in",
        icon: "mdi-account-clock",
        color: "primary"
      },
      {
        label: "Recent Failures (24h)",
        value: overview.value.recent_failures_24h ?? 0,
        sub: `of ${overview.value.total_failure_logs ?? 0} total failures`,
        icon: "mdi-alert-circle-outline",
        color: "purple"
      }
    ]);
    const filteredAttempts = computed(() => {
      if (!attemptsSearch.value) return attempts.value;
      const s = attemptsSearch.value.toLowerCase();
      return attempts.value.filter(
        (a) => (a.username || "").toLowerCase().includes(s) || (a.ip_address || "").toLowerCase().includes(s)
      );
    });
    function formatDateTime(dt) {
      if (!dt) return "—";
      const d = new Date(dt);
      return d.toLocaleString("en-GB", {
        day: "2-digit",
        month: "short",
        hour: "2-digit",
        minute: "2-digit"
      });
    }
    function roleColor(role) {
      const map = {
        super_admin: "error",
        tenant_admin: "primary",
        manager: "info",
        cashier: "success",
        accountant: "warning"
      };
      return map[role] || "default";
    }
    function formatRole(role) {
      if (!role) return "—";
      return role.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
    }
    async function loadOverview() {
      try {
        const data = await useApi()(`${API}/overview/`);
        overview.value = data;
        if (data.settings) {
          settingsForm.failure_limit = data.settings.failure_limit;
          settingsForm.cooloff_time_hours = data.settings.cooloff_time_hours;
          settingsForm.reset_on_success = data.settings.reset_on_success;
        }
      } catch {
        toast.error("Failed to load security overview");
      }
    }
    async function loadLocked() {
      loading.value = true;
      try {
        const data = await useApi()(`${API}/locked/`);
        locked.value = Array.isArray(data) ? data : [];
      } catch {
        toast.error("Failed to load locked users");
      } finally {
        loading.value = false;
      }
    }
    async function loadAttempts() {
      loadingAttempts.value = true;
      try {
        const data = await useApi()(`${API}/attempts/`);
        attempts.value = data.results || [];
      } catch {
        toast.error("Failed to load access attempts");
      } finally {
        loadingAttempts.value = false;
      }
    }
    async function loadFailureLogs() {
      loadingLogs.value = true;
      try {
        const data = await useApi()(`${API}/failure_logs/`);
        failureLogs.value = data.results || [];
      } catch {
        toast.error("Failed to load failure logs");
      } finally {
        loadingLogs.value = false;
      }
    }
    async function loadSessions() {
      loadingSessions.value = true;
      try {
        const data = await useApi()(`${API}/logged_users/`);
        sessions.value = Array.isArray(data) ? data : [];
      } catch {
        toast.error("Failed to load active sessions");
      } finally {
        loadingSessions.value = false;
      }
    }
    async function loadSettings() {
      try {
        const data = await useApi()(`${API}/config/`);
        settingsForm.failure_limit = data.failure_limit;
        settingsForm.cooloff_time_hours = data.cooloff_time_hours;
        settingsForm.reset_on_success = data.reset_on_success;
      } catch {
        toast.error("Failed to load settings");
      }
    }
    async function unlockEntry(id) {
      try {
        await useApi()(`${API}/${id}/unlock/`, { method: "POST" });
        toast.success("User unlocked successfully");
        await loadOverview();
        await loadLocked();
        if (attempts.value.length > 0) loadAttempts();
      } catch {
        toast.error("Failed to unlock user");
      }
    }
    async function unlockUserOrIp() {
      if (unlockForm.username) {
        try {
          unlocking.value = true;
          const res = await useApi()(`${API}/unlock_user/`, {
            method: "POST",
            body: { username: unlockForm.username }
          });
          toast.success(res.detail || "User unlocked");
          unlockUserDialog.value = false;
          unlockForm.username = "";
          unlockForm.ip = "";
          await loadOverview();
          await loadLocked();
        } catch {
          toast.error("Failed to unlock user");
        } finally {
          unlocking.value = false;
        }
        return;
      }
      if (unlockForm.ip) {
        try {
          unlocking.value = true;
          const res = await useApi()(`${API}/unlock_ip/`, {
            method: "POST",
            body: { ip_address: unlockForm.ip }
          });
          toast.success(res.detail || "IP unlocked");
          unlockUserDialog.value = false;
          unlockForm.username = "";
          unlockForm.ip = "";
          await loadOverview();
          await loadLocked();
        } catch {
          toast.error("Failed to unlock IP");
        } finally {
          unlocking.value = false;
        }
      }
    }
    function confirmResetAll() {
      resetAllDialog.value = true;
    }
    async function resetAll() {
      try {
        resetting.value = true;
        const res = await useApi()(`${API}/reset_all/`, { method: "POST" });
        toast.success(res.detail || "All locks reset");
        resetAllDialog.value = false;
        await loadOverview();
        await loadLocked();
        if (activeTab.value === "attempts") loadAttempts();
      } catch {
        toast.error("Failed to reset all locks");
      } finally {
        resetting.value = false;
      }
    }
    async function saveSettings() {
      savingSettings.value = true;
      try {
        const res = await useApi()(`${API}/update-config/`, {
          method: "PATCH",
          body: {
            failure_limit: settingsForm.failure_limit,
            cooloff_time_hours: settingsForm.cooloff_time_hours,
            reset_on_success: settingsForm.reset_on_success
          }
        });
        toast.success("Security settings updated");
        await loadOverview();
      } catch {
        toast.error("Failed to update settings");
      } finally {
        savingSettings.value = false;
      }
    }
    async function refreshAll() {
      await Promise.all([loadOverview(), loadLocked(), loadAttempts(), loadFailureLogs(), loadSessions(), loadSettings()]);
    }
    return (_ctx, _push, _parent, _attrs) => {
      _push(ssrRenderComponent(VContainer, mergeProps({
        fluid: "",
        class: "sec-page"
      }, _attrs), {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<div class="sec-hero" data-v-4f4f123d${_scopeId}><div class="sec-hero__content" data-v-4f4f123d${_scopeId}><div class="sec-hero__icon" data-v-4f4f123d${_scopeId}>`);
            _push2(ssrRenderComponent(VIcon, { size: "28" }, {
              default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                if (_push3) {
                  _push3(`mdi-shield-key`);
                } else {
                  return [
                    createTextVNode("mdi-shield-key")
                  ];
                }
              }),
              _: 1
            }, _parent2, _scopeId));
            _push2(`</div><div class="sec-hero__text" data-v-4f4f123d${_scopeId}><h1 class="sec-hero__title" data-v-4f4f123d${_scopeId}>Security Control Center</h1><p class="sec-hero__sub" data-v-4f4f123d${_scopeId}> Monitor login attempts, manage locked users, and configure django-axes security policy </p></div></div><div class="sec-hero__actions" data-v-4f4f123d${_scopeId}>`);
            _push2(ssrRenderComponent(VBtn, {
              variant: "tonal",
              color: "primary",
              "prepend-icon": "mdi-refresh",
              loading: unref(loading),
              rounded: "lg",
              size: "small",
              onClick: refreshAll
            }, {
              default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                if (_push3) {
                  _push3(` Refresh `);
                } else {
                  return [
                    createTextVNode(" Refresh ")
                  ];
                }
              }),
              _: 1
            }, _parent2, _scopeId));
            _push2(ssrRenderComponent(VBtn, {
              variant: "outlined",
              "prepend-icon": "mdi-lock-open-variant",
              rounded: "lg",
              size: "small",
              onClick: ($event) => unlockUserDialog.value = true
            }, {
              default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                if (_push3) {
                  _push3(` Unlock by User/IP `);
                } else {
                  return [
                    createTextVNode(" Unlock by User/IP ")
                  ];
                }
              }),
              _: 1
            }, _parent2, _scopeId));
            _push2(`</div></div>`);
            _push2(ssrRenderComponent(VRow, { class: "mb-1" }, {
              default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                if (_push3) {
                  _push3(`<!--[-->`);
                  ssrRenderList(unref(kpis), (kpi) => {
                    _push3(ssrRenderComponent(VCol, {
                      key: kpi.label,
                      cols: "12",
                      sm: "6",
                      lg: "3"
                    }, {
                      default: withCtx((_3, _push4, _parent4, _scopeId3) => {
                        if (_push4) {
                          _push4(ssrRenderComponent(VCard, {
                            rounded: "xl",
                            class: ["sec-kpi", `sec-kpi--${kpi.color}`],
                            flat: "",
                            border: ""
                          }, {
                            default: withCtx((_4, _push5, _parent5, _scopeId4) => {
                              if (_push5) {
                                _push5(`<div class="sec-kpi__top" data-v-4f4f123d${_scopeId4}><div class="sec-kpi__icon" data-v-4f4f123d${_scopeId4}>`);
                                _push5(ssrRenderComponent(VIcon, { size: "20" }, {
                                  default: withCtx((_5, _push6, _parent6, _scopeId5) => {
                                    if (_push6) {
                                      _push6(`${ssrInterpolate(kpi.icon)}`);
                                    } else {
                                      return [
                                        createTextVNode(toDisplayString(kpi.icon), 1)
                                      ];
                                    }
                                  }),
                                  _: 2
                                }, _parent5, _scopeId4));
                                _push5(`</div><div class="${ssrRenderClass([`sec-kpi__badge--${kpi.color}`, "sec-kpi__badge"])}" data-v-4f4f123d${_scopeId4}>${ssrInterpolate(kpi.value)}</div></div><p class="sec-kpi__label" data-v-4f4f123d${_scopeId4}>${ssrInterpolate(kpi.label)}</p><p class="sec-kpi__sub" data-v-4f4f123d${_scopeId4}>${ssrInterpolate(kpi.sub)}</p>`);
                              } else {
                                return [
                                  createVNode("div", { class: "sec-kpi__top" }, [
                                    createVNode("div", { class: "sec-kpi__icon" }, [
                                      createVNode(VIcon, { size: "20" }, {
                                        default: withCtx(() => [
                                          createTextVNode(toDisplayString(kpi.icon), 1)
                                        ]),
                                        _: 2
                                      }, 1024)
                                    ]),
                                    createVNode("div", {
                                      class: ["sec-kpi__badge", `sec-kpi__badge--${kpi.color}`]
                                    }, toDisplayString(kpi.value), 3)
                                  ]),
                                  createVNode("p", { class: "sec-kpi__label" }, toDisplayString(kpi.label), 1),
                                  createVNode("p", { class: "sec-kpi__sub" }, toDisplayString(kpi.sub), 1)
                                ];
                              }
                            }),
                            _: 2
                          }, _parent4, _scopeId3));
                        } else {
                          return [
                            createVNode(VCard, {
                              rounded: "xl",
                              class: ["sec-kpi", `sec-kpi--${kpi.color}`],
                              flat: "",
                              border: ""
                            }, {
                              default: withCtx(() => [
                                createVNode("div", { class: "sec-kpi__top" }, [
                                  createVNode("div", { class: "sec-kpi__icon" }, [
                                    createVNode(VIcon, { size: "20" }, {
                                      default: withCtx(() => [
                                        createTextVNode(toDisplayString(kpi.icon), 1)
                                      ]),
                                      _: 2
                                    }, 1024)
                                  ]),
                                  createVNode("div", {
                                    class: ["sec-kpi__badge", `sec-kpi__badge--${kpi.color}`]
                                  }, toDisplayString(kpi.value), 3)
                                ]),
                                createVNode("p", { class: "sec-kpi__label" }, toDisplayString(kpi.label), 1),
                                createVNode("p", { class: "sec-kpi__sub" }, toDisplayString(kpi.sub), 1)
                              ]),
                              _: 2
                            }, 1032, ["class"])
                          ];
                        }
                      }),
                      _: 2
                    }, _parent3, _scopeId2));
                  });
                  _push3(`<!--]-->`);
                } else {
                  return [
                    (openBlock(true), createBlock(Fragment, null, renderList(unref(kpis), (kpi) => {
                      return openBlock(), createBlock(VCol, {
                        key: kpi.label,
                        cols: "12",
                        sm: "6",
                        lg: "3"
                      }, {
                        default: withCtx(() => [
                          createVNode(VCard, {
                            rounded: "xl",
                            class: ["sec-kpi", `sec-kpi--${kpi.color}`],
                            flat: "",
                            border: ""
                          }, {
                            default: withCtx(() => [
                              createVNode("div", { class: "sec-kpi__top" }, [
                                createVNode("div", { class: "sec-kpi__icon" }, [
                                  createVNode(VIcon, { size: "20" }, {
                                    default: withCtx(() => [
                                      createTextVNode(toDisplayString(kpi.icon), 1)
                                    ]),
                                    _: 2
                                  }, 1024)
                                ]),
                                createVNode("div", {
                                  class: ["sec-kpi__badge", `sec-kpi__badge--${kpi.color}`]
                                }, toDisplayString(kpi.value), 3)
                              ]),
                              createVNode("p", { class: "sec-kpi__label" }, toDisplayString(kpi.label), 1),
                              createVNode("p", { class: "sec-kpi__sub" }, toDisplayString(kpi.sub), 1)
                            ]),
                            _: 2
                          }, 1032, ["class"])
                        ]),
                        _: 2
                      }, 1024);
                    }), 128))
                  ];
                }
              }),
              _: 1
            }, _parent2, _scopeId));
            _push2(`<div class="sec-nav mb-4" data-v-4f4f123d${_scopeId}><!--[-->`);
            ssrRenderList(unref(tabs), (tab) => {
              _push2(`<div class="${ssrRenderClass([{ "sec-nav__item--active": unref(activeTab) === tab.value }, "sec-nav__item"])}" data-v-4f4f123d${_scopeId}>`);
              _push2(ssrRenderComponent(VIcon, {
                size: "18",
                class: "sec-nav__icon"
              }, {
                default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                  if (_push3) {
                    _push3(`${ssrInterpolate(tab.icon)}`);
                  } else {
                    return [
                      createTextVNode(toDisplayString(tab.icon), 1)
                    ];
                  }
                }),
                _: 2
              }, _parent2, _scopeId));
              _push2(`<span class="sec-nav__label" data-v-4f4f123d${_scopeId}>${ssrInterpolate(tab.label)}</span>`);
              if (tab.count !== void 0) {
                _push2(`<span class="sec-nav__badge" data-v-4f4f123d${_scopeId}>${ssrInterpolate(tab.count)}</span>`);
              } else {
                _push2(`<!---->`);
              }
              _push2(`</div>`);
            });
            _push2(`<!--]--></div>`);
            _push2(ssrRenderComponent(VFadeTransition, { mode: "out-in" }, {
              default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                if (_push3) {
                  _push3(`<div data-v-4f4f123d${_scopeId2}>`);
                  if (unref(activeTab) === "locked") {
                    _push3(`<!--[-->`);
                    if (unref(locked).length > 0) {
                      _push3(`<div class="d-flex ga-2 mb-4 flex-wrap" data-v-4f4f123d${_scopeId2}>`);
                      _push3(ssrRenderComponent(VBtn, {
                        variant: "flat",
                        color: "error",
                        "prepend-icon": "mdi-lock-open-variant",
                        rounded: "lg",
                        size: "small",
                        onClick: confirmResetAll
                      }, {
                        default: withCtx((_3, _push4, _parent4, _scopeId3) => {
                          if (_push4) {
                            _push4(` Unlock All (${ssrInterpolate(unref(locked).length)}) `);
                          } else {
                            return [
                              createTextVNode(" Unlock All (" + toDisplayString(unref(locked).length) + ") ", 1)
                            ];
                          }
                        }),
                        _: 1
                      }, _parent3, _scopeId2));
                      _push3(`</div>`);
                    } else {
                      _push3(`<!---->`);
                    }
                    if (unref(loading)) {
                      _push3(ssrRenderComponent(VCard, {
                        flat: "",
                        class: "sec-skeleton"
                      }, {
                        default: withCtx((_3, _push4, _parent4, _scopeId3) => {
                          if (_push4) {
                            _push4(ssrRenderComponent(VProgressCircular, {
                              indeterminate: "",
                              color: "primary",
                              size: "40",
                              width: "3"
                            }, null, _parent4, _scopeId3));
                          } else {
                            return [
                              createVNode(VProgressCircular, {
                                indeterminate: "",
                                color: "primary",
                                size: "40",
                                width: "3"
                              })
                            ];
                          }
                        }),
                        _: 1
                      }, _parent3, _scopeId2));
                    } else if (unref(locked).length === 0) {
                      _push3(`<div class="sec-empty" data-v-4f4f123d${_scopeId2}><div class="sec-empty__icon sec-empty__icon--success" data-v-4f4f123d${_scopeId2}>`);
                      _push3(ssrRenderComponent(VIcon, { size: "32" }, {
                        default: withCtx((_3, _push4, _parent4, _scopeId3) => {
                          if (_push4) {
                            _push4(`mdi-shield-check`);
                          } else {
                            return [
                              createTextVNode("mdi-shield-check")
                            ];
                          }
                        }),
                        _: 1
                      }, _parent3, _scopeId2));
                      _push3(`</div><p class="sec-empty__title" data-v-4f4f123d${_scopeId2}>No Locked Users</p><p class="sec-empty__sub" data-v-4f4f123d${_scopeId2}> All clear — no IP addresses or usernames are currently locked out. </p></div>`);
                    } else {
                      _push3(ssrRenderComponent(VCard, {
                        flat: "",
                        border: "",
                        rounded: "xl",
                        class: "sec-table-card"
                      }, {
                        default: withCtx((_3, _push4, _parent4, _scopeId3) => {
                          if (_push4) {
                            _push4(ssrRenderComponent(VTable, { density: "comfortable" }, {
                              default: withCtx((_4, _push5, _parent5, _scopeId4) => {
                                if (_push5) {
                                  _push5(`<thead data-v-4f4f123d${_scopeId4}><tr data-v-4f4f123d${_scopeId4}><th class="text-left font-weight-bold" data-v-4f4f123d${_scopeId4}>Username / Email</th><th class="text-left font-weight-bold" data-v-4f4f123d${_scopeId4}>IP Address</th><th class="text-center font-weight-bold" data-v-4f4f123d${_scopeId4}>Failed Attempts</th><th class="text-left font-weight-bold" data-v-4f4f123d${_scopeId4}>Attempt Time</th><th class="text-left font-weight-bold" data-v-4f4f123d${_scopeId4}>Path</th><th class="text-right font-weight-bold" data-v-4f4f123d${_scopeId4}>Actions</th></tr></thead><tbody data-v-4f4f123d${_scopeId4}><!--[-->`);
                                  ssrRenderList(unref(locked), (item) => {
                                    _push5(`<tr class="sec-row sec-row--error" data-v-4f4f123d${_scopeId4}><td data-v-4f4f123d${_scopeId4}><div class="d-flex align-center ga-3" data-v-4f4f123d${_scopeId4}>`);
                                    _push5(ssrRenderComponent(VAvatar, {
                                      size: "36",
                                      rounded: "lg",
                                      color: "error",
                                      variant: "tonal"
                                    }, {
                                      default: withCtx((_5, _push6, _parent6, _scopeId5) => {
                                        if (_push6) {
                                          _push6(ssrRenderComponent(VIcon, {
                                            size: "18",
                                            color: "error"
                                          }, {
                                            default: withCtx((_6, _push7, _parent7, _scopeId6) => {
                                              if (_push7) {
                                                _push7(`mdi-lock`);
                                              } else {
                                                return [
                                                  createTextVNode("mdi-lock")
                                                ];
                                              }
                                            }),
                                            _: 2
                                          }, _parent6, _scopeId5));
                                        } else {
                                          return [
                                            createVNode(VIcon, {
                                              size: "18",
                                              color: "error"
                                            }, {
                                              default: withCtx(() => [
                                                createTextVNode("mdi-lock")
                                              ]),
                                              _: 1
                                            })
                                          ];
                                        }
                                      }),
                                      _: 2
                                    }, _parent5, _scopeId4));
                                    _push5(`<span class="text-body-1 font-weight-medium" data-v-4f4f123d${_scopeId4}>${ssrInterpolate(item.username)}</span></div></td><td class="text-body-2" data-v-4f4f123d${_scopeId4}>${ssrInterpolate(item.ip_address)}</td><td class="text-center" data-v-4f4f123d${_scopeId4}>`);
                                    _push5(ssrRenderComponent(VChip, {
                                      size: "small",
                                      color: "error",
                                      variant: "tonal",
                                      label: ""
                                    }, {
                                      default: withCtx((_5, _push6, _parent6, _scopeId5) => {
                                        if (_push6) {
                                          _push6(`${ssrInterpolate(item.failures_since_start)}x `);
                                        } else {
                                          return [
                                            createTextVNode(toDisplayString(item.failures_since_start) + "x ", 1)
                                          ];
                                        }
                                      }),
                                      _: 2
                                    }, _parent5, _scopeId4));
                                    _push5(`</td><td class="text-body-2 text-medium-emphasis" data-v-4f4f123d${_scopeId4}>${ssrInterpolate(formatDateTime(item.attempt_time))}</td><td class="text-caption text-medium-emphasis" data-v-4f4f123d${_scopeId4}>${ssrInterpolate(item.path_info)}</td><td class="text-right" data-v-4f4f123d${_scopeId4}>`);
                                    _push5(ssrRenderComponent(VBtn, {
                                      size: "small",
                                      variant: "tonal",
                                      color: "success",
                                      "prepend-icon": "mdi-lock-open-variant",
                                      rounded: "lg",
                                      onClick: ($event) => unlockEntry(item.id)
                                    }, {
                                      default: withCtx((_5, _push6, _parent6, _scopeId5) => {
                                        if (_push6) {
                                          _push6(` Unlock `);
                                        } else {
                                          return [
                                            createTextVNode(" Unlock ")
                                          ];
                                        }
                                      }),
                                      _: 2
                                    }, _parent5, _scopeId4));
                                    _push5(`</td></tr>`);
                                  });
                                  _push5(`<!--]--></tbody>`);
                                } else {
                                  return [
                                    createVNode("thead", null, [
                                      createVNode("tr", null, [
                                        createVNode("th", { class: "text-left font-weight-bold" }, "Username / Email"),
                                        createVNode("th", { class: "text-left font-weight-bold" }, "IP Address"),
                                        createVNode("th", { class: "text-center font-weight-bold" }, "Failed Attempts"),
                                        createVNode("th", { class: "text-left font-weight-bold" }, "Attempt Time"),
                                        createVNode("th", { class: "text-left font-weight-bold" }, "Path"),
                                        createVNode("th", { class: "text-right font-weight-bold" }, "Actions")
                                      ])
                                    ]),
                                    createVNode("tbody", null, [
                                      (openBlock(true), createBlock(Fragment, null, renderList(unref(locked), (item) => {
                                        return openBlock(), createBlock("tr", {
                                          key: item.id,
                                          class: "sec-row sec-row--error"
                                        }, [
                                          createVNode("td", null, [
                                            createVNode("div", { class: "d-flex align-center ga-3" }, [
                                              createVNode(VAvatar, {
                                                size: "36",
                                                rounded: "lg",
                                                color: "error",
                                                variant: "tonal"
                                              }, {
                                                default: withCtx(() => [
                                                  createVNode(VIcon, {
                                                    size: "18",
                                                    color: "error"
                                                  }, {
                                                    default: withCtx(() => [
                                                      createTextVNode("mdi-lock")
                                                    ]),
                                                    _: 1
                                                  })
                                                ]),
                                                _: 1
                                              }),
                                              createVNode("span", { class: "text-body-1 font-weight-medium" }, toDisplayString(item.username), 1)
                                            ])
                                          ]),
                                          createVNode("td", { class: "text-body-2" }, toDisplayString(item.ip_address), 1),
                                          createVNode("td", { class: "text-center" }, [
                                            createVNode(VChip, {
                                              size: "small",
                                              color: "error",
                                              variant: "tonal",
                                              label: ""
                                            }, {
                                              default: withCtx(() => [
                                                createTextVNode(toDisplayString(item.failures_since_start) + "x ", 1)
                                              ]),
                                              _: 2
                                            }, 1024)
                                          ]),
                                          createVNode("td", { class: "text-body-2 text-medium-emphasis" }, toDisplayString(formatDateTime(item.attempt_time)), 1),
                                          createVNode("td", { class: "text-caption text-medium-emphasis" }, toDisplayString(item.path_info), 1),
                                          createVNode("td", { class: "text-right" }, [
                                            createVNode(VBtn, {
                                              size: "small",
                                              variant: "tonal",
                                              color: "success",
                                              "prepend-icon": "mdi-lock-open-variant",
                                              rounded: "lg",
                                              onClick: ($event) => unlockEntry(item.id)
                                            }, {
                                              default: withCtx(() => [
                                                createTextVNode(" Unlock ")
                                              ]),
                                              _: 1
                                            }, 8, ["onClick"])
                                          ])
                                        ]);
                                      }), 128))
                                    ])
                                  ];
                                }
                              }),
                              _: 1
                            }, _parent4, _scopeId3));
                          } else {
                            return [
                              createVNode(VTable, { density: "comfortable" }, {
                                default: withCtx(() => [
                                  createVNode("thead", null, [
                                    createVNode("tr", null, [
                                      createVNode("th", { class: "text-left font-weight-bold" }, "Username / Email"),
                                      createVNode("th", { class: "text-left font-weight-bold" }, "IP Address"),
                                      createVNode("th", { class: "text-center font-weight-bold" }, "Failed Attempts"),
                                      createVNode("th", { class: "text-left font-weight-bold" }, "Attempt Time"),
                                      createVNode("th", { class: "text-left font-weight-bold" }, "Path"),
                                      createVNode("th", { class: "text-right font-weight-bold" }, "Actions")
                                    ])
                                  ]),
                                  createVNode("tbody", null, [
                                    (openBlock(true), createBlock(Fragment, null, renderList(unref(locked), (item) => {
                                      return openBlock(), createBlock("tr", {
                                        key: item.id,
                                        class: "sec-row sec-row--error"
                                      }, [
                                        createVNode("td", null, [
                                          createVNode("div", { class: "d-flex align-center ga-3" }, [
                                            createVNode(VAvatar, {
                                              size: "36",
                                              rounded: "lg",
                                              color: "error",
                                              variant: "tonal"
                                            }, {
                                              default: withCtx(() => [
                                                createVNode(VIcon, {
                                                  size: "18",
                                                  color: "error"
                                                }, {
                                                  default: withCtx(() => [
                                                    createTextVNode("mdi-lock")
                                                  ]),
                                                  _: 1
                                                })
                                              ]),
                                              _: 1
                                            }),
                                            createVNode("span", { class: "text-body-1 font-weight-medium" }, toDisplayString(item.username), 1)
                                          ])
                                        ]),
                                        createVNode("td", { class: "text-body-2" }, toDisplayString(item.ip_address), 1),
                                        createVNode("td", { class: "text-center" }, [
                                          createVNode(VChip, {
                                            size: "small",
                                            color: "error",
                                            variant: "tonal",
                                            label: ""
                                          }, {
                                            default: withCtx(() => [
                                              createTextVNode(toDisplayString(item.failures_since_start) + "x ", 1)
                                            ]),
                                            _: 2
                                          }, 1024)
                                        ]),
                                        createVNode("td", { class: "text-body-2 text-medium-emphasis" }, toDisplayString(formatDateTime(item.attempt_time)), 1),
                                        createVNode("td", { class: "text-caption text-medium-emphasis" }, toDisplayString(item.path_info), 1),
                                        createVNode("td", { class: "text-right" }, [
                                          createVNode(VBtn, {
                                            size: "small",
                                            variant: "tonal",
                                            color: "success",
                                            "prepend-icon": "mdi-lock-open-variant",
                                            rounded: "lg",
                                            onClick: ($event) => unlockEntry(item.id)
                                          }, {
                                            default: withCtx(() => [
                                              createTextVNode(" Unlock ")
                                            ]),
                                            _: 1
                                          }, 8, ["onClick"])
                                        ])
                                      ]);
                                    }), 128))
                                  ])
                                ]),
                                _: 1
                              })
                            ];
                          }
                        }),
                        _: 1
                      }, _parent3, _scopeId2));
                    }
                    _push3(`<!--]-->`);
                  } else {
                    _push3(`<!---->`);
                  }
                  if (unref(activeTab) === "attempts") {
                    _push3(`<!--[--><div class="d-flex ga-3 mb-4 flex-wrap align-center" data-v-4f4f123d${_scopeId2}>`);
                    _push3(ssrRenderComponent(VTextField, {
                      modelValue: unref(attemptsSearch),
                      "onUpdate:modelValue": ($event) => isRef(attemptsSearch) ? attemptsSearch.value = $event : null,
                      "prepend-inner-icon": "mdi-magnify",
                      placeholder: "Search by username or IP...",
                      density: "compact",
                      variant: "outlined",
                      "hide-details": "",
                      rounded: "lg",
                      style: { "max-width": "320px" },
                      clearable: ""
                    }, null, _parent3, _scopeId2));
                    if (unref(overview).total_attempts > 0) {
                      _push3(ssrRenderComponent(VBtn, {
                        variant: "outlined",
                        color: "error",
                        size: "small",
                        "prepend-icon": "mdi-delete-sweep",
                        rounded: "lg",
                        onClick: confirmResetAll
                      }, {
                        default: withCtx((_3, _push4, _parent4, _scopeId3) => {
                          if (_push4) {
                            _push4(` Clear All Attempts `);
                          } else {
                            return [
                              createTextVNode(" Clear All Attempts ")
                            ];
                          }
                        }),
                        _: 1
                      }, _parent3, _scopeId2));
                    } else {
                      _push3(`<!---->`);
                    }
                    _push3(`</div>`);
                    if (unref(loadingAttempts)) {
                      _push3(ssrRenderComponent(VCard, {
                        flat: "",
                        class: "sec-skeleton"
                      }, {
                        default: withCtx((_3, _push4, _parent4, _scopeId3) => {
                          if (_push4) {
                            _push4(ssrRenderComponent(VProgressCircular, {
                              indeterminate: "",
                              color: "primary",
                              size: "40",
                              width: "3"
                            }, null, _parent4, _scopeId3));
                          } else {
                            return [
                              createVNode(VProgressCircular, {
                                indeterminate: "",
                                color: "primary",
                                size: "40",
                                width: "3"
                              })
                            ];
                          }
                        }),
                        _: 1
                      }, _parent3, _scopeId2));
                    } else if (unref(filteredAttempts).length > 0) {
                      _push3(ssrRenderComponent(VCard, {
                        flat: "",
                        border: "",
                        rounded: "xl",
                        class: "sec-table-card"
                      }, {
                        default: withCtx((_3, _push4, _parent4, _scopeId3) => {
                          if (_push4) {
                            _push4(ssrRenderComponent(VTable, { density: "comfortable" }, {
                              default: withCtx((_4, _push5, _parent5, _scopeId4) => {
                                if (_push5) {
                                  _push5(`<thead data-v-4f4f123d${_scopeId4}><tr data-v-4f4f123d${_scopeId4}><th class="text-left font-weight-bold" data-v-4f4f123d${_scopeId4}>Username</th><th class="text-left font-weight-bold" data-v-4f4f123d${_scopeId4}>IP Address</th><th class="text-center font-weight-bold" data-v-4f4f123d${_scopeId4}>Failures</th><th class="text-center font-weight-bold" data-v-4f4f123d${_scopeId4}>Status</th><th class="text-left font-weight-bold" data-v-4f4f123d${_scopeId4}>Attempt Time</th><th class="text-right font-weight-bold" data-v-4f4f123d${_scopeId4}>Actions</th></tr></thead><tbody data-v-4f4f123d${_scopeId4}><!--[-->`);
                                  ssrRenderList(unref(filteredAttempts), (item) => {
                                    _push5(`<tr class="${ssrRenderClass([{ "sec-row--error": item.locked }, "sec-row"])}" data-v-4f4f123d${_scopeId4}><td class="text-body-1 font-weight-medium" data-v-4f4f123d${_scopeId4}>${ssrInterpolate(item.username)}</td><td class="text-body-2" data-v-4f4f123d${_scopeId4}>${ssrInterpolate(item.ip_address)}</td><td class="text-center" data-v-4f4f123d${_scopeId4}>`);
                                    _push5(ssrRenderComponent(VChip, {
                                      size: "small",
                                      color: item.failures_since_start >= 5 ? "error" : "warning",
                                      variant: "tonal",
                                      label: ""
                                    }, {
                                      default: withCtx((_5, _push6, _parent6, _scopeId5) => {
                                        if (_push6) {
                                          _push6(`${ssrInterpolate(item.failures_since_start)}`);
                                        } else {
                                          return [
                                            createTextVNode(toDisplayString(item.failures_since_start), 1)
                                          ];
                                        }
                                      }),
                                      _: 2
                                    }, _parent5, _scopeId4));
                                    _push5(`</td><td class="text-center" data-v-4f4f123d${_scopeId4}>`);
                                    _push5(ssrRenderComponent(VChip, {
                                      size: "x-small",
                                      color: item.locked ? "error" : "default",
                                      variant: item.locked ? "tonal" : "text",
                                      label: ""
                                    }, {
                                      default: withCtx((_5, _push6, _parent6, _scopeId5) => {
                                        if (_push6) {
                                          _push6(ssrRenderComponent(VIcon, {
                                            size: "12",
                                            class: "mr-1"
                                          }, {
                                            default: withCtx((_6, _push7, _parent7, _scopeId6) => {
                                              if (_push7) {
                                                _push7(`${ssrInterpolate(item.locked ? "mdi-lock" : "mdi-eye")}`);
                                              } else {
                                                return [
                                                  createTextVNode(toDisplayString(item.locked ? "mdi-lock" : "mdi-eye"), 1)
                                                ];
                                              }
                                            }),
                                            _: 2
                                          }, _parent6, _scopeId5));
                                          _push6(` ${ssrInterpolate(item.locked ? "Locked" : "Tracking")}`);
                                        } else {
                                          return [
                                            createVNode(VIcon, {
                                              size: "12",
                                              class: "mr-1"
                                            }, {
                                              default: withCtx(() => [
                                                createTextVNode(toDisplayString(item.locked ? "mdi-lock" : "mdi-eye"), 1)
                                              ]),
                                              _: 2
                                            }, 1024),
                                            createTextVNode(" " + toDisplayString(item.locked ? "Locked" : "Tracking"), 1)
                                          ];
                                        }
                                      }),
                                      _: 2
                                    }, _parent5, _scopeId4));
                                    _push5(`</td><td class="text-body-2 text-medium-emphasis" data-v-4f4f123d${_scopeId4}>${ssrInterpolate(formatDateTime(item.attempt_time))}</td><td class="text-right" data-v-4f4f123d${_scopeId4}>`);
                                    if (item.locked) {
                                      _push5(ssrRenderComponent(VBtn, {
                                        size: "small",
                                        variant: "tonal",
                                        color: "success",
                                        "prepend-icon": "mdi-lock-open-variant",
                                        rounded: "lg",
                                        onClick: ($event) => unlockEntry(item.id)
                                      }, {
                                        default: withCtx((_5, _push6, _parent6, _scopeId5) => {
                                          if (_push6) {
                                            _push6(` Unlock `);
                                          } else {
                                            return [
                                              createTextVNode(" Unlock ")
                                            ];
                                          }
                                        }),
                                        _: 2
                                      }, _parent5, _scopeId4));
                                    } else {
                                      _push5(`<span class="text-caption text-disabled" data-v-4f4f123d${_scopeId4}>—</span>`);
                                    }
                                    _push5(`</td></tr>`);
                                  });
                                  _push5(`<!--]--></tbody>`);
                                } else {
                                  return [
                                    createVNode("thead", null, [
                                      createVNode("tr", null, [
                                        createVNode("th", { class: "text-left font-weight-bold" }, "Username"),
                                        createVNode("th", { class: "text-left font-weight-bold" }, "IP Address"),
                                        createVNode("th", { class: "text-center font-weight-bold" }, "Failures"),
                                        createVNode("th", { class: "text-center font-weight-bold" }, "Status"),
                                        createVNode("th", { class: "text-left font-weight-bold" }, "Attempt Time"),
                                        createVNode("th", { class: "text-right font-weight-bold" }, "Actions")
                                      ])
                                    ]),
                                    createVNode("tbody", null, [
                                      (openBlock(true), createBlock(Fragment, null, renderList(unref(filteredAttempts), (item) => {
                                        return openBlock(), createBlock("tr", {
                                          key: item.id,
                                          class: ["sec-row", { "sec-row--error": item.locked }]
                                        }, [
                                          createVNode("td", { class: "text-body-1 font-weight-medium" }, toDisplayString(item.username), 1),
                                          createVNode("td", { class: "text-body-2" }, toDisplayString(item.ip_address), 1),
                                          createVNode("td", { class: "text-center" }, [
                                            createVNode(VChip, {
                                              size: "small",
                                              color: item.failures_since_start >= 5 ? "error" : "warning",
                                              variant: "tonal",
                                              label: ""
                                            }, {
                                              default: withCtx(() => [
                                                createTextVNode(toDisplayString(item.failures_since_start), 1)
                                              ]),
                                              _: 2
                                            }, 1032, ["color"])
                                          ]),
                                          createVNode("td", { class: "text-center" }, [
                                            createVNode(VChip, {
                                              size: "x-small",
                                              color: item.locked ? "error" : "default",
                                              variant: item.locked ? "tonal" : "text",
                                              label: ""
                                            }, {
                                              default: withCtx(() => [
                                                createVNode(VIcon, {
                                                  size: "12",
                                                  class: "mr-1"
                                                }, {
                                                  default: withCtx(() => [
                                                    createTextVNode(toDisplayString(item.locked ? "mdi-lock" : "mdi-eye"), 1)
                                                  ]),
                                                  _: 2
                                                }, 1024),
                                                createTextVNode(" " + toDisplayString(item.locked ? "Locked" : "Tracking"), 1)
                                              ]),
                                              _: 2
                                            }, 1032, ["color", "variant"])
                                          ]),
                                          createVNode("td", { class: "text-body-2 text-medium-emphasis" }, toDisplayString(formatDateTime(item.attempt_time)), 1),
                                          createVNode("td", { class: "text-right" }, [
                                            item.locked ? (openBlock(), createBlock(VBtn, {
                                              key: 0,
                                              size: "small",
                                              variant: "tonal",
                                              color: "success",
                                              "prepend-icon": "mdi-lock-open-variant",
                                              rounded: "lg",
                                              onClick: ($event) => unlockEntry(item.id)
                                            }, {
                                              default: withCtx(() => [
                                                createTextVNode(" Unlock ")
                                              ]),
                                              _: 1
                                            }, 8, ["onClick"])) : (openBlock(), createBlock("span", {
                                              key: 1,
                                              class: "text-caption text-disabled"
                                            }, "—"))
                                          ])
                                        ], 2);
                                      }), 128))
                                    ])
                                  ];
                                }
                              }),
                              _: 1
                            }, _parent4, _scopeId3));
                          } else {
                            return [
                              createVNode(VTable, { density: "comfortable" }, {
                                default: withCtx(() => [
                                  createVNode("thead", null, [
                                    createVNode("tr", null, [
                                      createVNode("th", { class: "text-left font-weight-bold" }, "Username"),
                                      createVNode("th", { class: "text-left font-weight-bold" }, "IP Address"),
                                      createVNode("th", { class: "text-center font-weight-bold" }, "Failures"),
                                      createVNode("th", { class: "text-center font-weight-bold" }, "Status"),
                                      createVNode("th", { class: "text-left font-weight-bold" }, "Attempt Time"),
                                      createVNode("th", { class: "text-right font-weight-bold" }, "Actions")
                                    ])
                                  ]),
                                  createVNode("tbody", null, [
                                    (openBlock(true), createBlock(Fragment, null, renderList(unref(filteredAttempts), (item) => {
                                      return openBlock(), createBlock("tr", {
                                        key: item.id,
                                        class: ["sec-row", { "sec-row--error": item.locked }]
                                      }, [
                                        createVNode("td", { class: "text-body-1 font-weight-medium" }, toDisplayString(item.username), 1),
                                        createVNode("td", { class: "text-body-2" }, toDisplayString(item.ip_address), 1),
                                        createVNode("td", { class: "text-center" }, [
                                          createVNode(VChip, {
                                            size: "small",
                                            color: item.failures_since_start >= 5 ? "error" : "warning",
                                            variant: "tonal",
                                            label: ""
                                          }, {
                                            default: withCtx(() => [
                                              createTextVNode(toDisplayString(item.failures_since_start), 1)
                                            ]),
                                            _: 2
                                          }, 1032, ["color"])
                                        ]),
                                        createVNode("td", { class: "text-center" }, [
                                          createVNode(VChip, {
                                            size: "x-small",
                                            color: item.locked ? "error" : "default",
                                            variant: item.locked ? "tonal" : "text",
                                            label: ""
                                          }, {
                                            default: withCtx(() => [
                                              createVNode(VIcon, {
                                                size: "12",
                                                class: "mr-1"
                                              }, {
                                                default: withCtx(() => [
                                                  createTextVNode(toDisplayString(item.locked ? "mdi-lock" : "mdi-eye"), 1)
                                                ]),
                                                _: 2
                                              }, 1024),
                                              createTextVNode(" " + toDisplayString(item.locked ? "Locked" : "Tracking"), 1)
                                            ]),
                                            _: 2
                                          }, 1032, ["color", "variant"])
                                        ]),
                                        createVNode("td", { class: "text-body-2 text-medium-emphasis" }, toDisplayString(formatDateTime(item.attempt_time)), 1),
                                        createVNode("td", { class: "text-right" }, [
                                          item.locked ? (openBlock(), createBlock(VBtn, {
                                            key: 0,
                                            size: "small",
                                            variant: "tonal",
                                            color: "success",
                                            "prepend-icon": "mdi-lock-open-variant",
                                            rounded: "lg",
                                            onClick: ($event) => unlockEntry(item.id)
                                          }, {
                                            default: withCtx(() => [
                                              createTextVNode(" Unlock ")
                                            ]),
                                            _: 1
                                          }, 8, ["onClick"])) : (openBlock(), createBlock("span", {
                                            key: 1,
                                            class: "text-caption text-disabled"
                                          }, "—"))
                                        ])
                                      ], 2);
                                    }), 128))
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
                      _push3(`<div class="sec-empty" data-v-4f4f123d${_scopeId2}><div class="sec-empty__icon sec-empty__icon--neutral" data-v-4f4f123d${_scopeId2}>`);
                      _push3(ssrRenderComponent(VIcon, { size: "32" }, {
                        default: withCtx((_3, _push4, _parent4, _scopeId3) => {
                          if (_push4) {
                            _push4(`mdi-login-variant`);
                          } else {
                            return [
                              createTextVNode("mdi-login-variant")
                            ];
                          }
                        }),
                        _: 1
                      }, _parent3, _scopeId2));
                      _push3(`</div><p class="sec-empty__title" data-v-4f4f123d${_scopeId2}>No Access Attempts</p><p class="sec-empty__sub" data-v-4f4f123d${_scopeId2}>No login attempts have been recorded yet.</p></div>`);
                    }
                    _push3(`<!--]-->`);
                  } else {
                    _push3(`<!---->`);
                  }
                  if (unref(activeTab) === "logs") {
                    _push3(`<!--[-->`);
                    if (unref(loadingLogs)) {
                      _push3(ssrRenderComponent(VCard, {
                        flat: "",
                        class: "sec-skeleton"
                      }, {
                        default: withCtx((_3, _push4, _parent4, _scopeId3) => {
                          if (_push4) {
                            _push4(ssrRenderComponent(VProgressCircular, {
                              indeterminate: "",
                              color: "primary",
                              size: "40",
                              width: "3"
                            }, null, _parent4, _scopeId3));
                          } else {
                            return [
                              createVNode(VProgressCircular, {
                                indeterminate: "",
                                color: "primary",
                                size: "40",
                                width: "3"
                              })
                            ];
                          }
                        }),
                        _: 1
                      }, _parent3, _scopeId2));
                    } else if (unref(failureLogs).length > 0) {
                      _push3(ssrRenderComponent(VCard, {
                        flat: "",
                        border: "",
                        rounded: "xl",
                        class: "sec-table-card"
                      }, {
                        default: withCtx((_3, _push4, _parent4, _scopeId3) => {
                          if (_push4) {
                            _push4(ssrRenderComponent(VTable, { density: "comfortable" }, {
                              default: withCtx((_4, _push5, _parent5, _scopeId4) => {
                                if (_push5) {
                                  _push5(`<thead data-v-4f4f123d${_scopeId4}><tr data-v-4f4f123d${_scopeId4}><th class="text-left font-weight-bold" data-v-4f4f123d${_scopeId4}>Username</th><th class="text-left font-weight-bold" data-v-4f4f123d${_scopeId4}>IP Address</th><th class="text-center font-weight-bold" data-v-4f4f123d${_scopeId4}>Locked Out</th><th class="text-left font-weight-bold" data-v-4f4f123d${_scopeId4}>Attempt Time</th><th class="text-left font-weight-bold" data-v-4f4f123d${_scopeId4}>Path</th></tr></thead><tbody data-v-4f4f123d${_scopeId4}><!--[-->`);
                                  ssrRenderList(unref(failureLogs), (log) => {
                                    _push5(`<tr class="sec-row" data-v-4f4f123d${_scopeId4}><td class="text-body-1 font-weight-medium" data-v-4f4f123d${_scopeId4}>${ssrInterpolate(log.username)}</td><td class="text-body-2" data-v-4f4f123d${_scopeId4}>${ssrInterpolate(log.ip_address)}</td><td class="text-center" data-v-4f4f123d${_scopeId4}>`);
                                    _push5(ssrRenderComponent(VIcon, {
                                      color: log.locked_out ? "error" : "grey",
                                      size: "20"
                                    }, {
                                      default: withCtx((_5, _push6, _parent6, _scopeId5) => {
                                        if (_push6) {
                                          _push6(`${ssrInterpolate(log.locked_out ? "mdi-lock" : "mdi-lock-open")}`);
                                        } else {
                                          return [
                                            createTextVNode(toDisplayString(log.locked_out ? "mdi-lock" : "mdi-lock-open"), 1)
                                          ];
                                        }
                                      }),
                                      _: 2
                                    }, _parent5, _scopeId4));
                                    _push5(`</td><td class="text-body-2 text-medium-emphasis" data-v-4f4f123d${_scopeId4}>${ssrInterpolate(formatDateTime(log.attempt_time))}</td><td class="text-caption text-medium-emphasis" data-v-4f4f123d${_scopeId4}>${ssrInterpolate(log.path_info)}</td></tr>`);
                                  });
                                  _push5(`<!--]--></tbody>`);
                                } else {
                                  return [
                                    createVNode("thead", null, [
                                      createVNode("tr", null, [
                                        createVNode("th", { class: "text-left font-weight-bold" }, "Username"),
                                        createVNode("th", { class: "text-left font-weight-bold" }, "IP Address"),
                                        createVNode("th", { class: "text-center font-weight-bold" }, "Locked Out"),
                                        createVNode("th", { class: "text-left font-weight-bold" }, "Attempt Time"),
                                        createVNode("th", { class: "text-left font-weight-bold" }, "Path")
                                      ])
                                    ]),
                                    createVNode("tbody", null, [
                                      (openBlock(true), createBlock(Fragment, null, renderList(unref(failureLogs), (log) => {
                                        return openBlock(), createBlock("tr", {
                                          key: log.id,
                                          class: "sec-row"
                                        }, [
                                          createVNode("td", { class: "text-body-1 font-weight-medium" }, toDisplayString(log.username), 1),
                                          createVNode("td", { class: "text-body-2" }, toDisplayString(log.ip_address), 1),
                                          createVNode("td", { class: "text-center" }, [
                                            createVNode(VIcon, {
                                              color: log.locked_out ? "error" : "grey",
                                              size: "20"
                                            }, {
                                              default: withCtx(() => [
                                                createTextVNode(toDisplayString(log.locked_out ? "mdi-lock" : "mdi-lock-open"), 1)
                                              ]),
                                              _: 2
                                            }, 1032, ["color"])
                                          ]),
                                          createVNode("td", { class: "text-body-2 text-medium-emphasis" }, toDisplayString(formatDateTime(log.attempt_time)), 1),
                                          createVNode("td", { class: "text-caption text-medium-emphasis" }, toDisplayString(log.path_info), 1)
                                        ]);
                                      }), 128))
                                    ])
                                  ];
                                }
                              }),
                              _: 1
                            }, _parent4, _scopeId3));
                          } else {
                            return [
                              createVNode(VTable, { density: "comfortable" }, {
                                default: withCtx(() => [
                                  createVNode("thead", null, [
                                    createVNode("tr", null, [
                                      createVNode("th", { class: "text-left font-weight-bold" }, "Username"),
                                      createVNode("th", { class: "text-left font-weight-bold" }, "IP Address"),
                                      createVNode("th", { class: "text-center font-weight-bold" }, "Locked Out"),
                                      createVNode("th", { class: "text-left font-weight-bold" }, "Attempt Time"),
                                      createVNode("th", { class: "text-left font-weight-bold" }, "Path")
                                    ])
                                  ]),
                                  createVNode("tbody", null, [
                                    (openBlock(true), createBlock(Fragment, null, renderList(unref(failureLogs), (log) => {
                                      return openBlock(), createBlock("tr", {
                                        key: log.id,
                                        class: "sec-row"
                                      }, [
                                        createVNode("td", { class: "text-body-1 font-weight-medium" }, toDisplayString(log.username), 1),
                                        createVNode("td", { class: "text-body-2" }, toDisplayString(log.ip_address), 1),
                                        createVNode("td", { class: "text-center" }, [
                                          createVNode(VIcon, {
                                            color: log.locked_out ? "error" : "grey",
                                            size: "20"
                                          }, {
                                            default: withCtx(() => [
                                              createTextVNode(toDisplayString(log.locked_out ? "mdi-lock" : "mdi-lock-open"), 1)
                                            ]),
                                            _: 2
                                          }, 1032, ["color"])
                                        ]),
                                        createVNode("td", { class: "text-body-2 text-medium-emphasis" }, toDisplayString(formatDateTime(log.attempt_time)), 1),
                                        createVNode("td", { class: "text-caption text-medium-emphasis" }, toDisplayString(log.path_info), 1)
                                      ]);
                                    }), 128))
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
                      _push3(`<div class="sec-empty" data-v-4f4f123d${_scopeId2}><div class="sec-empty__icon sec-empty__icon--neutral" data-v-4f4f123d${_scopeId2}>`);
                      _push3(ssrRenderComponent(VIcon, { size: "32" }, {
                        default: withCtx((_3, _push4, _parent4, _scopeId3) => {
                          if (_push4) {
                            _push4(`mdi-alert-circle-outline`);
                          } else {
                            return [
                              createTextVNode("mdi-alert-circle-outline")
                            ];
                          }
                        }),
                        _: 1
                      }, _parent3, _scopeId2));
                      _push3(`</div><p class="sec-empty__title" data-v-4f4f123d${_scopeId2}>No Failure Logs</p><p class="sec-empty__sub" data-v-4f4f123d${_scopeId2}>No login failure logs have been recorded.</p></div>`);
                    }
                    _push3(`<!--]-->`);
                  } else {
                    _push3(`<!---->`);
                  }
                  if (unref(activeTab) === "sessions") {
                    _push3(`<!--[-->`);
                    if (unref(loadingSessions)) {
                      _push3(ssrRenderComponent(VCard, {
                        flat: "",
                        class: "sec-skeleton"
                      }, {
                        default: withCtx((_3, _push4, _parent4, _scopeId3) => {
                          if (_push4) {
                            _push4(ssrRenderComponent(VProgressCircular, {
                              indeterminate: "",
                              color: "primary",
                              size: "40",
                              width: "3"
                            }, null, _parent4, _scopeId3));
                          } else {
                            return [
                              createVNode(VProgressCircular, {
                                indeterminate: "",
                                color: "primary",
                                size: "40",
                                width: "3"
                              })
                            ];
                          }
                        }),
                        _: 1
                      }, _parent3, _scopeId2));
                    } else if (unref(sessions).length > 0) {
                      _push3(ssrRenderComponent(VCard, {
                        flat: "",
                        border: "",
                        rounded: "xl",
                        class: "sec-table-card"
                      }, {
                        default: withCtx((_3, _push4, _parent4, _scopeId3) => {
                          if (_push4) {
                            _push4(ssrRenderComponent(VTable, { density: "comfortable" }, {
                              default: withCtx((_4, _push5, _parent5, _scopeId4) => {
                                if (_push5) {
                                  _push5(`<thead data-v-4f4f123d${_scopeId4}><tr data-v-4f4f123d${_scopeId4}><th class="text-left font-weight-bold" data-v-4f4f123d${_scopeId4}>User</th><th class="text-left font-weight-bold" data-v-4f4f123d${_scopeId4}>Email</th><th class="text-left font-weight-bold" data-v-4f4f123d${_scopeId4}>Role</th><th class="text-left font-weight-bold" data-v-4f4f123d${_scopeId4}>Branch</th><th class="text-left font-weight-bold" data-v-4f4f123d${_scopeId4}>Last Login</th><th class="text-left font-weight-bold" data-v-4f4f123d${_scopeId4}>Session Expires</th></tr></thead><tbody data-v-4f4f123d${_scopeId4}><!--[-->`);
                                  ssrRenderList(unref(sessions), (s) => {
                                    _push5(`<tr class="sec-row sec-row--primary" data-v-4f4f123d${_scopeId4}><td data-v-4f4f123d${_scopeId4}><div class="d-flex align-center ga-3" data-v-4f4f123d${_scopeId4}>`);
                                    _push5(ssrRenderComponent(VAvatar, {
                                      size: "36",
                                      rounded: "lg",
                                      color: "primary",
                                      variant: "tonal"
                                    }, {
                                      default: withCtx((_5, _push6, _parent6, _scopeId5) => {
                                        if (_push6) {
                                          _push6(`<span class="text-body-1 font-weight-bold text-primary" data-v-4f4f123d${_scopeId5}>${ssrInterpolate((s.name || s.user_name || "?").charAt(0).toUpperCase())}</span>`);
                                        } else {
                                          return [
                                            createVNode("span", { class: "text-body-1 font-weight-bold text-primary" }, toDisplayString((s.name || s.user_name || "?").charAt(0).toUpperCase()), 1)
                                          ];
                                        }
                                      }),
                                      _: 2
                                    }, _parent5, _scopeId4));
                                    _push5(`<span class="text-body-1 font-weight-medium" data-v-4f4f123d${_scopeId4}>${ssrInterpolate(s.name || s.user_name)}</span></div></td><td class="text-body-2" data-v-4f4f123d${_scopeId4}>${ssrInterpolate(s.email || s.user_email)}</td><td data-v-4f4f123d${_scopeId4}>`);
                                    _push5(ssrRenderComponent(VChip, {
                                      size: "small",
                                      color: roleColor(s.role || s.user_role),
                                      variant: "tonal",
                                      label: ""
                                    }, {
                                      default: withCtx((_5, _push6, _parent6, _scopeId5) => {
                                        if (_push6) {
                                          _push6(`${ssrInterpolate(formatRole(s.role || s.user_role))}`);
                                        } else {
                                          return [
                                            createTextVNode(toDisplayString(formatRole(s.role || s.user_role)), 1)
                                          ];
                                        }
                                      }),
                                      _: 2
                                    }, _parent5, _scopeId4));
                                    _push5(`</td><td class="text-body-2 text-medium-emphasis" data-v-4f4f123d${_scopeId4}>${ssrInterpolate(s.branch || "—")}</td><td class="text-body-2 text-medium-emphasis" data-v-4f4f123d${_scopeId4}>${ssrInterpolate(formatDateTime(s.last_login))}</td><td class="text-body-2 text-medium-emphasis" data-v-4f4f123d${_scopeId4}>${ssrInterpolate(formatDateTime(s.session_expires))}</td></tr>`);
                                  });
                                  _push5(`<!--]--></tbody>`);
                                } else {
                                  return [
                                    createVNode("thead", null, [
                                      createVNode("tr", null, [
                                        createVNode("th", { class: "text-left font-weight-bold" }, "User"),
                                        createVNode("th", { class: "text-left font-weight-bold" }, "Email"),
                                        createVNode("th", { class: "text-left font-weight-bold" }, "Role"),
                                        createVNode("th", { class: "text-left font-weight-bold" }, "Branch"),
                                        createVNode("th", { class: "text-left font-weight-bold" }, "Last Login"),
                                        createVNode("th", { class: "text-left font-weight-bold" }, "Session Expires")
                                      ])
                                    ]),
                                    createVNode("tbody", null, [
                                      (openBlock(true), createBlock(Fragment, null, renderList(unref(sessions), (s) => {
                                        return openBlock(), createBlock("tr", {
                                          key: s.session_key,
                                          class: "sec-row sec-row--primary"
                                        }, [
                                          createVNode("td", null, [
                                            createVNode("div", { class: "d-flex align-center ga-3" }, [
                                              createVNode(VAvatar, {
                                                size: "36",
                                                rounded: "lg",
                                                color: "primary",
                                                variant: "tonal"
                                              }, {
                                                default: withCtx(() => [
                                                  createVNode("span", { class: "text-body-1 font-weight-bold text-primary" }, toDisplayString((s.name || s.user_name || "?").charAt(0).toUpperCase()), 1)
                                                ]),
                                                _: 2
                                              }, 1024),
                                              createVNode("span", { class: "text-body-1 font-weight-medium" }, toDisplayString(s.name || s.user_name), 1)
                                            ])
                                          ]),
                                          createVNode("td", { class: "text-body-2" }, toDisplayString(s.email || s.user_email), 1),
                                          createVNode("td", null, [
                                            createVNode(VChip, {
                                              size: "small",
                                              color: roleColor(s.role || s.user_role),
                                              variant: "tonal",
                                              label: ""
                                            }, {
                                              default: withCtx(() => [
                                                createTextVNode(toDisplayString(formatRole(s.role || s.user_role)), 1)
                                              ]),
                                              _: 2
                                            }, 1032, ["color"])
                                          ]),
                                          createVNode("td", { class: "text-body-2 text-medium-emphasis" }, toDisplayString(s.branch || "—"), 1),
                                          createVNode("td", { class: "text-body-2 text-medium-emphasis" }, toDisplayString(formatDateTime(s.last_login)), 1),
                                          createVNode("td", { class: "text-body-2 text-medium-emphasis" }, toDisplayString(formatDateTime(s.session_expires)), 1)
                                        ]);
                                      }), 128))
                                    ])
                                  ];
                                }
                              }),
                              _: 1
                            }, _parent4, _scopeId3));
                          } else {
                            return [
                              createVNode(VTable, { density: "comfortable" }, {
                                default: withCtx(() => [
                                  createVNode("thead", null, [
                                    createVNode("tr", null, [
                                      createVNode("th", { class: "text-left font-weight-bold" }, "User"),
                                      createVNode("th", { class: "text-left font-weight-bold" }, "Email"),
                                      createVNode("th", { class: "text-left font-weight-bold" }, "Role"),
                                      createVNode("th", { class: "text-left font-weight-bold" }, "Branch"),
                                      createVNode("th", { class: "text-left font-weight-bold" }, "Last Login"),
                                      createVNode("th", { class: "text-left font-weight-bold" }, "Session Expires")
                                    ])
                                  ]),
                                  createVNode("tbody", null, [
                                    (openBlock(true), createBlock(Fragment, null, renderList(unref(sessions), (s) => {
                                      return openBlock(), createBlock("tr", {
                                        key: s.session_key,
                                        class: "sec-row sec-row--primary"
                                      }, [
                                        createVNode("td", null, [
                                          createVNode("div", { class: "d-flex align-center ga-3" }, [
                                            createVNode(VAvatar, {
                                              size: "36",
                                              rounded: "lg",
                                              color: "primary",
                                              variant: "tonal"
                                            }, {
                                              default: withCtx(() => [
                                                createVNode("span", { class: "text-body-1 font-weight-bold text-primary" }, toDisplayString((s.name || s.user_name || "?").charAt(0).toUpperCase()), 1)
                                              ]),
                                              _: 2
                                            }, 1024),
                                            createVNode("span", { class: "text-body-1 font-weight-medium" }, toDisplayString(s.name || s.user_name), 1)
                                          ])
                                        ]),
                                        createVNode("td", { class: "text-body-2" }, toDisplayString(s.email || s.user_email), 1),
                                        createVNode("td", null, [
                                          createVNode(VChip, {
                                            size: "small",
                                            color: roleColor(s.role || s.user_role),
                                            variant: "tonal",
                                            label: ""
                                          }, {
                                            default: withCtx(() => [
                                              createTextVNode(toDisplayString(formatRole(s.role || s.user_role)), 1)
                                            ]),
                                            _: 2
                                          }, 1032, ["color"])
                                        ]),
                                        createVNode("td", { class: "text-body-2 text-medium-emphasis" }, toDisplayString(s.branch || "—"), 1),
                                        createVNode("td", { class: "text-body-2 text-medium-emphasis" }, toDisplayString(formatDateTime(s.last_login)), 1),
                                        createVNode("td", { class: "text-body-2 text-medium-emphasis" }, toDisplayString(formatDateTime(s.session_expires)), 1)
                                      ]);
                                    }), 128))
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
                      _push3(`<div class="sec-empty" data-v-4f4f123d${_scopeId2}><div class="sec-empty__icon sec-empty__icon--neutral" data-v-4f4f123d${_scopeId2}>`);
                      _push3(ssrRenderComponent(VIcon, { size: "32" }, {
                        default: withCtx((_3, _push4, _parent4, _scopeId3) => {
                          if (_push4) {
                            _push4(`mdi-account-clock`);
                          } else {
                            return [
                              createTextVNode("mdi-account-clock")
                            ];
                          }
                        }),
                        _: 1
                      }, _parent3, _scopeId2));
                      _push3(`</div><p class="sec-empty__title" data-v-4f4f123d${_scopeId2}>No Active Sessions</p><p class="sec-empty__sub" data-v-4f4f123d${_scopeId2}>No users are currently logged in.</p></div>`);
                    }
                    _push3(`<!--]-->`);
                  } else {
                    _push3(`<!---->`);
                  }
                  if (unref(activeTab) === "settings") {
                    _push3(ssrRenderComponent(VCard, {
                      flat: "",
                      border: "",
                      rounded: "xl",
                      "max-width": "640",
                      class: "sec-settings-card"
                    }, {
                      default: withCtx((_3, _push4, _parent4, _scopeId3) => {
                        if (_push4) {
                          _push4(`<div class="sec-settings__header" data-v-4f4f123d${_scopeId3}><div class="sec-settings__icon" data-v-4f4f123d${_scopeId3}>`);
                          _push4(ssrRenderComponent(VIcon, {
                            size: "24",
                            color: "primary"
                          }, {
                            default: withCtx((_4, _push5, _parent5, _scopeId4) => {
                              if (_push5) {
                                _push5(`mdi-shield-lock`);
                              } else {
                                return [
                                  createTextVNode("mdi-shield-lock")
                                ];
                              }
                            }),
                            _: 1
                          }, _parent4, _scopeId3));
                          _push4(`</div><div data-v-4f4f123d${_scopeId3}><p class="text-h6 font-weight-bold mb-0" data-v-4f4f123d${_scopeId3}>Login Security Policy</p><p class="text-body-2 text-medium-emphasis mb-0" data-v-4f4f123d${_scopeId3}> Configure brute-force login protection </p></div></div>`);
                          _push4(ssrRenderComponent(VDivider, { class: "mb-5" }, null, _parent4, _scopeId3));
                          _push4(ssrRenderComponent(VAlert, {
                            type: "info",
                            variant: "tonal",
                            density: "compact",
                            rounded: "lg",
                            class: "mb-5"
                          }, {
                            prepend: withCtx((_4, _push5, _parent5, _scopeId4) => {
                              if (_push5) {
                                _push5(ssrRenderComponent(VIcon, { size: "18" }, {
                                  default: withCtx((_5, _push6, _parent6, _scopeId5) => {
                                    if (_push6) {
                                      _push6(`mdi-information-outline`);
                                    } else {
                                      return [
                                        createTextVNode("mdi-information-outline")
                                      ];
                                    }
                                  }),
                                  _: 1
                                }, _parent5, _scopeId4));
                              } else {
                                return [
                                  createVNode(VIcon, { size: "18" }, {
                                    default: withCtx(() => [
                                      createTextVNode("mdi-information-outline")
                                    ]),
                                    _: 1
                                  })
                                ];
                              }
                            }),
                            default: withCtx((_4, _push5, _parent5, _scopeId4) => {
                              if (_push5) {
                                _push5(` Changes apply immediately at runtime. They reset when the server restarts unless also updated in <code class="mx-1" data-v-4f4f123d${_scopeId4}>settings.py</code>. `);
                              } else {
                                return [
                                  createTextVNode(" Changes apply immediately at runtime. They reset when the server restarts unless also updated in "),
                                  createVNode("code", { class: "mx-1" }, "settings.py"),
                                  createTextVNode(". ")
                                ];
                              }
                            }),
                            _: 1
                          }, _parent4, _scopeId3));
                          _push4(`<div class="sec-setting-row" data-v-4f4f123d${_scopeId3}><div class="sec-setting-row__icon sec-setting-row__icon--primary" data-v-4f4f123d${_scopeId3}>`);
                          _push4(ssrRenderComponent(VIcon, {
                            size: "20",
                            color: "primary"
                          }, {
                            default: withCtx((_4, _push5, _parent5, _scopeId4) => {
                              if (_push5) {
                                _push5(`mdi-counter`);
                              } else {
                                return [
                                  createTextVNode("mdi-counter")
                                ];
                              }
                            }),
                            _: 1
                          }, _parent4, _scopeId3));
                          _push4(`</div><div class="sec-setting-row__body" data-v-4f4f123d${_scopeId3}><p class="sec-setting-row__title" data-v-4f4f123d${_scopeId3}>Failure Limit</p><p class="sec-setting-row__desc" data-v-4f4f123d${_scopeId3}> Number of failed login attempts before a user/IP is locked out. </p></div><div class="sec-setting-row__control" data-v-4f4f123d${_scopeId3}>`);
                          _push4(ssrRenderComponent(VTextField, {
                            modelValue: unref(settingsForm).failure_limit,
                            "onUpdate:modelValue": ($event) => unref(settingsForm).failure_limit = $event,
                            modelModifiers: { number: true },
                            type: "number",
                            variant: "outlined",
                            density: "compact",
                            min: "1",
                            max: "100",
                            "hide-details": "",
                            rounded: "lg",
                            style: { "width": "120px" }
                          }, null, _parent4, _scopeId3));
                          _push4(`</div></div>`);
                          _push4(ssrRenderComponent(VDivider, { class: "my-1" }, null, _parent4, _scopeId3));
                          _push4(`<div class="sec-setting-row" data-v-4f4f123d${_scopeId3}><div class="sec-setting-row__icon sec-setting-row__icon--info" data-v-4f4f123d${_scopeId3}>`);
                          _push4(ssrRenderComponent(VIcon, {
                            size: "20",
                            color: "info"
                          }, {
                            default: withCtx((_4, _push5, _parent5, _scopeId4) => {
                              if (_push5) {
                                _push5(`mdi-timer-outline`);
                              } else {
                                return [
                                  createTextVNode("mdi-timer-outline")
                                ];
                              }
                            }),
                            _: 1
                          }, _parent4, _scopeId3));
                          _push4(`</div><div class="sec-setting-row__body" data-v-4f4f123d${_scopeId3}><p class="sec-setting-row__title" data-v-4f4f123d${_scopeId3}>Cool-off Time (hours)</p><p class="sec-setting-row__desc" data-v-4f4f123d${_scopeId3}> Hours before a locked-out user/IP is automatically unlocked. </p></div><div class="sec-setting-row__control" data-v-4f4f123d${_scopeId3}>`);
                          _push4(ssrRenderComponent(VTextField, {
                            modelValue: unref(settingsForm).cooloff_time_hours,
                            "onUpdate:modelValue": ($event) => unref(settingsForm).cooloff_time_hours = $event,
                            modelModifiers: { number: true },
                            type: "number",
                            variant: "outlined",
                            density: "compact",
                            min: "0",
                            step: "0.5",
                            "hide-details": "",
                            rounded: "lg",
                            style: { "width": "120px" }
                          }, null, _parent4, _scopeId3));
                          _push4(`</div></div>`);
                          _push4(ssrRenderComponent(VDivider, { class: "my-1" }, null, _parent4, _scopeId3));
                          _push4(`<div class="sec-setting-row" data-v-4f4f123d${_scopeId3}><div class="sec-setting-row__icon sec-setting-row__icon--success" data-v-4f4f123d${_scopeId3}>`);
                          _push4(ssrRenderComponent(VIcon, {
                            size: "20",
                            color: "success"
                          }, {
                            default: withCtx((_4, _push5, _parent5, _scopeId4) => {
                              if (_push5) {
                                _push5(`mdi-refresh-circle`);
                              } else {
                                return [
                                  createTextVNode("mdi-refresh-circle")
                                ];
                              }
                            }),
                            _: 1
                          }, _parent4, _scopeId3));
                          _push4(`</div><div class="sec-setting-row__body" data-v-4f4f123d${_scopeId3}><p class="sec-setting-row__title" data-v-4f4f123d${_scopeId3}>Reset on Successful Login</p><p class="sec-setting-row__desc" data-v-4f4f123d${_scopeId3}> If on, a successful login resets the failure counter for that user/IP. </p></div><div class="sec-setting-row__control" data-v-4f4f123d${_scopeId3}>`);
                          _push4(ssrRenderComponent(VSwitch, {
                            modelValue: unref(settingsForm).reset_on_success,
                            "onUpdate:modelValue": ($event) => unref(settingsForm).reset_on_success = $event,
                            color: "primary",
                            density: "compact",
                            "hide-details": "",
                            inset: ""
                          }, null, _parent4, _scopeId3));
                          _push4(`</div></div>`);
                          _push4(ssrRenderComponent(VDivider, { class: "mt-3 mb-4" }, null, _parent4, _scopeId3));
                          _push4(`<div class="d-flex justify-end ga-3" data-v-4f4f123d${_scopeId3}>`);
                          _push4(ssrRenderComponent(VBtn, {
                            variant: "text",
                            rounded: "lg",
                            onClick: loadSettings
                          }, {
                            default: withCtx((_4, _push5, _parent5, _scopeId4) => {
                              if (_push5) {
                                _push5(`Reset`);
                              } else {
                                return [
                                  createTextVNode("Reset")
                                ];
                              }
                            }),
                            _: 1
                          }, _parent4, _scopeId3));
                          _push4(ssrRenderComponent(VBtn, {
                            variant: "flat",
                            color: "primary",
                            "prepend-icon": "mdi-content-save",
                            loading: unref(savingSettings),
                            rounded: "lg",
                            onClick: saveSettings
                          }, {
                            default: withCtx((_4, _push5, _parent5, _scopeId4) => {
                              if (_push5) {
                                _push5(` Save Changes `);
                              } else {
                                return [
                                  createTextVNode(" Save Changes ")
                                ];
                              }
                            }),
                            _: 1
                          }, _parent4, _scopeId3));
                          _push4(`</div>`);
                        } else {
                          return [
                            createVNode("div", { class: "sec-settings__header" }, [
                              createVNode("div", { class: "sec-settings__icon" }, [
                                createVNode(VIcon, {
                                  size: "24",
                                  color: "primary"
                                }, {
                                  default: withCtx(() => [
                                    createTextVNode("mdi-shield-lock")
                                  ]),
                                  _: 1
                                })
                              ]),
                              createVNode("div", null, [
                                createVNode("p", { class: "text-h6 font-weight-bold mb-0" }, "Login Security Policy"),
                                createVNode("p", { class: "text-body-2 text-medium-emphasis mb-0" }, " Configure brute-force login protection ")
                              ])
                            ]),
                            createVNode(VDivider, { class: "mb-5" }),
                            createVNode(VAlert, {
                              type: "info",
                              variant: "tonal",
                              density: "compact",
                              rounded: "lg",
                              class: "mb-5"
                            }, {
                              prepend: withCtx(() => [
                                createVNode(VIcon, { size: "18" }, {
                                  default: withCtx(() => [
                                    createTextVNode("mdi-information-outline")
                                  ]),
                                  _: 1
                                })
                              ]),
                              default: withCtx(() => [
                                createTextVNode(" Changes apply immediately at runtime. They reset when the server restarts unless also updated in "),
                                createVNode("code", { class: "mx-1" }, "settings.py"),
                                createTextVNode(". ")
                              ]),
                              _: 1
                            }),
                            createVNode("div", { class: "sec-setting-row" }, [
                              createVNode("div", { class: "sec-setting-row__icon sec-setting-row__icon--primary" }, [
                                createVNode(VIcon, {
                                  size: "20",
                                  color: "primary"
                                }, {
                                  default: withCtx(() => [
                                    createTextVNode("mdi-counter")
                                  ]),
                                  _: 1
                                })
                              ]),
                              createVNode("div", { class: "sec-setting-row__body" }, [
                                createVNode("p", { class: "sec-setting-row__title" }, "Failure Limit"),
                                createVNode("p", { class: "sec-setting-row__desc" }, " Number of failed login attempts before a user/IP is locked out. ")
                              ]),
                              createVNode("div", { class: "sec-setting-row__control" }, [
                                createVNode(VTextField, {
                                  modelValue: unref(settingsForm).failure_limit,
                                  "onUpdate:modelValue": ($event) => unref(settingsForm).failure_limit = $event,
                                  modelModifiers: { number: true },
                                  type: "number",
                                  variant: "outlined",
                                  density: "compact",
                                  min: "1",
                                  max: "100",
                                  "hide-details": "",
                                  rounded: "lg",
                                  style: { "width": "120px" }
                                }, null, 8, ["modelValue", "onUpdate:modelValue"])
                              ])
                            ]),
                            createVNode(VDivider, { class: "my-1" }),
                            createVNode("div", { class: "sec-setting-row" }, [
                              createVNode("div", { class: "sec-setting-row__icon sec-setting-row__icon--info" }, [
                                createVNode(VIcon, {
                                  size: "20",
                                  color: "info"
                                }, {
                                  default: withCtx(() => [
                                    createTextVNode("mdi-timer-outline")
                                  ]),
                                  _: 1
                                })
                              ]),
                              createVNode("div", { class: "sec-setting-row__body" }, [
                                createVNode("p", { class: "sec-setting-row__title" }, "Cool-off Time (hours)"),
                                createVNode("p", { class: "sec-setting-row__desc" }, " Hours before a locked-out user/IP is automatically unlocked. ")
                              ]),
                              createVNode("div", { class: "sec-setting-row__control" }, [
                                createVNode(VTextField, {
                                  modelValue: unref(settingsForm).cooloff_time_hours,
                                  "onUpdate:modelValue": ($event) => unref(settingsForm).cooloff_time_hours = $event,
                                  modelModifiers: { number: true },
                                  type: "number",
                                  variant: "outlined",
                                  density: "compact",
                                  min: "0",
                                  step: "0.5",
                                  "hide-details": "",
                                  rounded: "lg",
                                  style: { "width": "120px" }
                                }, null, 8, ["modelValue", "onUpdate:modelValue"])
                              ])
                            ]),
                            createVNode(VDivider, { class: "my-1" }),
                            createVNode("div", { class: "sec-setting-row" }, [
                              createVNode("div", { class: "sec-setting-row__icon sec-setting-row__icon--success" }, [
                                createVNode(VIcon, {
                                  size: "20",
                                  color: "success"
                                }, {
                                  default: withCtx(() => [
                                    createTextVNode("mdi-refresh-circle")
                                  ]),
                                  _: 1
                                })
                              ]),
                              createVNode("div", { class: "sec-setting-row__body" }, [
                                createVNode("p", { class: "sec-setting-row__title" }, "Reset on Successful Login"),
                                createVNode("p", { class: "sec-setting-row__desc" }, " If on, a successful login resets the failure counter for that user/IP. ")
                              ]),
                              createVNode("div", { class: "sec-setting-row__control" }, [
                                createVNode(VSwitch, {
                                  modelValue: unref(settingsForm).reset_on_success,
                                  "onUpdate:modelValue": ($event) => unref(settingsForm).reset_on_success = $event,
                                  color: "primary",
                                  density: "compact",
                                  "hide-details": "",
                                  inset: ""
                                }, null, 8, ["modelValue", "onUpdate:modelValue"])
                              ])
                            ]),
                            createVNode(VDivider, { class: "mt-3 mb-4" }),
                            createVNode("div", { class: "d-flex justify-end ga-3" }, [
                              createVNode(VBtn, {
                                variant: "text",
                                rounded: "lg",
                                onClick: loadSettings
                              }, {
                                default: withCtx(() => [
                                  createTextVNode("Reset")
                                ]),
                                _: 1
                              }),
                              createVNode(VBtn, {
                                variant: "flat",
                                color: "primary",
                                "prepend-icon": "mdi-content-save",
                                loading: unref(savingSettings),
                                rounded: "lg",
                                onClick: saveSettings
                              }, {
                                default: withCtx(() => [
                                  createTextVNode(" Save Changes ")
                                ]),
                                _: 1
                              }, 8, ["loading"])
                            ])
                          ];
                        }
                      }),
                      _: 1
                    }, _parent3, _scopeId2));
                  } else {
                    _push3(`<!---->`);
                  }
                  _push3(`</div>`);
                } else {
                  return [
                    (openBlock(), createBlock("div", { key: unref(activeTab) }, [
                      unref(activeTab) === "locked" ? (openBlock(), createBlock(Fragment, { key: 0 }, [
                        unref(locked).length > 0 ? (openBlock(), createBlock("div", {
                          key: 0,
                          class: "d-flex ga-2 mb-4 flex-wrap"
                        }, [
                          createVNode(VBtn, {
                            variant: "flat",
                            color: "error",
                            "prepend-icon": "mdi-lock-open-variant",
                            rounded: "lg",
                            size: "small",
                            onClick: confirmResetAll
                          }, {
                            default: withCtx(() => [
                              createTextVNode(" Unlock All (" + toDisplayString(unref(locked).length) + ") ", 1)
                            ]),
                            _: 1
                          })
                        ])) : createCommentVNode("", true),
                        unref(loading) ? (openBlock(), createBlock(VCard, {
                          key: 1,
                          flat: "",
                          class: "sec-skeleton"
                        }, {
                          default: withCtx(() => [
                            createVNode(VProgressCircular, {
                              indeterminate: "",
                              color: "primary",
                              size: "40",
                              width: "3"
                            })
                          ]),
                          _: 1
                        })) : unref(locked).length === 0 ? (openBlock(), createBlock("div", {
                          key: 2,
                          class: "sec-empty"
                        }, [
                          createVNode("div", { class: "sec-empty__icon sec-empty__icon--success" }, [
                            createVNode(VIcon, { size: "32" }, {
                              default: withCtx(() => [
                                createTextVNode("mdi-shield-check")
                              ]),
                              _: 1
                            })
                          ]),
                          createVNode("p", { class: "sec-empty__title" }, "No Locked Users"),
                          createVNode("p", { class: "sec-empty__sub" }, " All clear — no IP addresses or usernames are currently locked out. ")
                        ])) : (openBlock(), createBlock(VCard, {
                          key: 3,
                          flat: "",
                          border: "",
                          rounded: "xl",
                          class: "sec-table-card"
                        }, {
                          default: withCtx(() => [
                            createVNode(VTable, { density: "comfortable" }, {
                              default: withCtx(() => [
                                createVNode("thead", null, [
                                  createVNode("tr", null, [
                                    createVNode("th", { class: "text-left font-weight-bold" }, "Username / Email"),
                                    createVNode("th", { class: "text-left font-weight-bold" }, "IP Address"),
                                    createVNode("th", { class: "text-center font-weight-bold" }, "Failed Attempts"),
                                    createVNode("th", { class: "text-left font-weight-bold" }, "Attempt Time"),
                                    createVNode("th", { class: "text-left font-weight-bold" }, "Path"),
                                    createVNode("th", { class: "text-right font-weight-bold" }, "Actions")
                                  ])
                                ]),
                                createVNode("tbody", null, [
                                  (openBlock(true), createBlock(Fragment, null, renderList(unref(locked), (item) => {
                                    return openBlock(), createBlock("tr", {
                                      key: item.id,
                                      class: "sec-row sec-row--error"
                                    }, [
                                      createVNode("td", null, [
                                        createVNode("div", { class: "d-flex align-center ga-3" }, [
                                          createVNode(VAvatar, {
                                            size: "36",
                                            rounded: "lg",
                                            color: "error",
                                            variant: "tonal"
                                          }, {
                                            default: withCtx(() => [
                                              createVNode(VIcon, {
                                                size: "18",
                                                color: "error"
                                              }, {
                                                default: withCtx(() => [
                                                  createTextVNode("mdi-lock")
                                                ]),
                                                _: 1
                                              })
                                            ]),
                                            _: 1
                                          }),
                                          createVNode("span", { class: "text-body-1 font-weight-medium" }, toDisplayString(item.username), 1)
                                        ])
                                      ]),
                                      createVNode("td", { class: "text-body-2" }, toDisplayString(item.ip_address), 1),
                                      createVNode("td", { class: "text-center" }, [
                                        createVNode(VChip, {
                                          size: "small",
                                          color: "error",
                                          variant: "tonal",
                                          label: ""
                                        }, {
                                          default: withCtx(() => [
                                            createTextVNode(toDisplayString(item.failures_since_start) + "x ", 1)
                                          ]),
                                          _: 2
                                        }, 1024)
                                      ]),
                                      createVNode("td", { class: "text-body-2 text-medium-emphasis" }, toDisplayString(formatDateTime(item.attempt_time)), 1),
                                      createVNode("td", { class: "text-caption text-medium-emphasis" }, toDisplayString(item.path_info), 1),
                                      createVNode("td", { class: "text-right" }, [
                                        createVNode(VBtn, {
                                          size: "small",
                                          variant: "tonal",
                                          color: "success",
                                          "prepend-icon": "mdi-lock-open-variant",
                                          rounded: "lg",
                                          onClick: ($event) => unlockEntry(item.id)
                                        }, {
                                          default: withCtx(() => [
                                            createTextVNode(" Unlock ")
                                          ]),
                                          _: 1
                                        }, 8, ["onClick"])
                                      ])
                                    ]);
                                  }), 128))
                                ])
                              ]),
                              _: 1
                            })
                          ]),
                          _: 1
                        }))
                      ], 64)) : createCommentVNode("", true),
                      unref(activeTab) === "attempts" ? (openBlock(), createBlock(Fragment, { key: 1 }, [
                        createVNode("div", { class: "d-flex ga-3 mb-4 flex-wrap align-center" }, [
                          createVNode(VTextField, {
                            modelValue: unref(attemptsSearch),
                            "onUpdate:modelValue": ($event) => isRef(attemptsSearch) ? attemptsSearch.value = $event : null,
                            "prepend-inner-icon": "mdi-magnify",
                            placeholder: "Search by username or IP...",
                            density: "compact",
                            variant: "outlined",
                            "hide-details": "",
                            rounded: "lg",
                            style: { "max-width": "320px" },
                            clearable: ""
                          }, null, 8, ["modelValue", "onUpdate:modelValue"]),
                          unref(overview).total_attempts > 0 ? (openBlock(), createBlock(VBtn, {
                            key: 0,
                            variant: "outlined",
                            color: "error",
                            size: "small",
                            "prepend-icon": "mdi-delete-sweep",
                            rounded: "lg",
                            onClick: confirmResetAll
                          }, {
                            default: withCtx(() => [
                              createTextVNode(" Clear All Attempts ")
                            ]),
                            _: 1
                          })) : createCommentVNode("", true)
                        ]),
                        unref(loadingAttempts) ? (openBlock(), createBlock(VCard, {
                          key: 0,
                          flat: "",
                          class: "sec-skeleton"
                        }, {
                          default: withCtx(() => [
                            createVNode(VProgressCircular, {
                              indeterminate: "",
                              color: "primary",
                              size: "40",
                              width: "3"
                            })
                          ]),
                          _: 1
                        })) : unref(filteredAttempts).length > 0 ? (openBlock(), createBlock(VCard, {
                          key: 1,
                          flat: "",
                          border: "",
                          rounded: "xl",
                          class: "sec-table-card"
                        }, {
                          default: withCtx(() => [
                            createVNode(VTable, { density: "comfortable" }, {
                              default: withCtx(() => [
                                createVNode("thead", null, [
                                  createVNode("tr", null, [
                                    createVNode("th", { class: "text-left font-weight-bold" }, "Username"),
                                    createVNode("th", { class: "text-left font-weight-bold" }, "IP Address"),
                                    createVNode("th", { class: "text-center font-weight-bold" }, "Failures"),
                                    createVNode("th", { class: "text-center font-weight-bold" }, "Status"),
                                    createVNode("th", { class: "text-left font-weight-bold" }, "Attempt Time"),
                                    createVNode("th", { class: "text-right font-weight-bold" }, "Actions")
                                  ])
                                ]),
                                createVNode("tbody", null, [
                                  (openBlock(true), createBlock(Fragment, null, renderList(unref(filteredAttempts), (item) => {
                                    return openBlock(), createBlock("tr", {
                                      key: item.id,
                                      class: ["sec-row", { "sec-row--error": item.locked }]
                                    }, [
                                      createVNode("td", { class: "text-body-1 font-weight-medium" }, toDisplayString(item.username), 1),
                                      createVNode("td", { class: "text-body-2" }, toDisplayString(item.ip_address), 1),
                                      createVNode("td", { class: "text-center" }, [
                                        createVNode(VChip, {
                                          size: "small",
                                          color: item.failures_since_start >= 5 ? "error" : "warning",
                                          variant: "tonal",
                                          label: ""
                                        }, {
                                          default: withCtx(() => [
                                            createTextVNode(toDisplayString(item.failures_since_start), 1)
                                          ]),
                                          _: 2
                                        }, 1032, ["color"])
                                      ]),
                                      createVNode("td", { class: "text-center" }, [
                                        createVNode(VChip, {
                                          size: "x-small",
                                          color: item.locked ? "error" : "default",
                                          variant: item.locked ? "tonal" : "text",
                                          label: ""
                                        }, {
                                          default: withCtx(() => [
                                            createVNode(VIcon, {
                                              size: "12",
                                              class: "mr-1"
                                            }, {
                                              default: withCtx(() => [
                                                createTextVNode(toDisplayString(item.locked ? "mdi-lock" : "mdi-eye"), 1)
                                              ]),
                                              _: 2
                                            }, 1024),
                                            createTextVNode(" " + toDisplayString(item.locked ? "Locked" : "Tracking"), 1)
                                          ]),
                                          _: 2
                                        }, 1032, ["color", "variant"])
                                      ]),
                                      createVNode("td", { class: "text-body-2 text-medium-emphasis" }, toDisplayString(formatDateTime(item.attempt_time)), 1),
                                      createVNode("td", { class: "text-right" }, [
                                        item.locked ? (openBlock(), createBlock(VBtn, {
                                          key: 0,
                                          size: "small",
                                          variant: "tonal",
                                          color: "success",
                                          "prepend-icon": "mdi-lock-open-variant",
                                          rounded: "lg",
                                          onClick: ($event) => unlockEntry(item.id)
                                        }, {
                                          default: withCtx(() => [
                                            createTextVNode(" Unlock ")
                                          ]),
                                          _: 1
                                        }, 8, ["onClick"])) : (openBlock(), createBlock("span", {
                                          key: 1,
                                          class: "text-caption text-disabled"
                                        }, "—"))
                                      ])
                                    ], 2);
                                  }), 128))
                                ])
                              ]),
                              _: 1
                            })
                          ]),
                          _: 1
                        })) : (openBlock(), createBlock("div", {
                          key: 2,
                          class: "sec-empty"
                        }, [
                          createVNode("div", { class: "sec-empty__icon sec-empty__icon--neutral" }, [
                            createVNode(VIcon, { size: "32" }, {
                              default: withCtx(() => [
                                createTextVNode("mdi-login-variant")
                              ]),
                              _: 1
                            })
                          ]),
                          createVNode("p", { class: "sec-empty__title" }, "No Access Attempts"),
                          createVNode("p", { class: "sec-empty__sub" }, "No login attempts have been recorded yet.")
                        ]))
                      ], 64)) : createCommentVNode("", true),
                      unref(activeTab) === "logs" ? (openBlock(), createBlock(Fragment, { key: 2 }, [
                        unref(loadingLogs) ? (openBlock(), createBlock(VCard, {
                          key: 0,
                          flat: "",
                          class: "sec-skeleton"
                        }, {
                          default: withCtx(() => [
                            createVNode(VProgressCircular, {
                              indeterminate: "",
                              color: "primary",
                              size: "40",
                              width: "3"
                            })
                          ]),
                          _: 1
                        })) : unref(failureLogs).length > 0 ? (openBlock(), createBlock(VCard, {
                          key: 1,
                          flat: "",
                          border: "",
                          rounded: "xl",
                          class: "sec-table-card"
                        }, {
                          default: withCtx(() => [
                            createVNode(VTable, { density: "comfortable" }, {
                              default: withCtx(() => [
                                createVNode("thead", null, [
                                  createVNode("tr", null, [
                                    createVNode("th", { class: "text-left font-weight-bold" }, "Username"),
                                    createVNode("th", { class: "text-left font-weight-bold" }, "IP Address"),
                                    createVNode("th", { class: "text-center font-weight-bold" }, "Locked Out"),
                                    createVNode("th", { class: "text-left font-weight-bold" }, "Attempt Time"),
                                    createVNode("th", { class: "text-left font-weight-bold" }, "Path")
                                  ])
                                ]),
                                createVNode("tbody", null, [
                                  (openBlock(true), createBlock(Fragment, null, renderList(unref(failureLogs), (log) => {
                                    return openBlock(), createBlock("tr", {
                                      key: log.id,
                                      class: "sec-row"
                                    }, [
                                      createVNode("td", { class: "text-body-1 font-weight-medium" }, toDisplayString(log.username), 1),
                                      createVNode("td", { class: "text-body-2" }, toDisplayString(log.ip_address), 1),
                                      createVNode("td", { class: "text-center" }, [
                                        createVNode(VIcon, {
                                          color: log.locked_out ? "error" : "grey",
                                          size: "20"
                                        }, {
                                          default: withCtx(() => [
                                            createTextVNode(toDisplayString(log.locked_out ? "mdi-lock" : "mdi-lock-open"), 1)
                                          ]),
                                          _: 2
                                        }, 1032, ["color"])
                                      ]),
                                      createVNode("td", { class: "text-body-2 text-medium-emphasis" }, toDisplayString(formatDateTime(log.attempt_time)), 1),
                                      createVNode("td", { class: "text-caption text-medium-emphasis" }, toDisplayString(log.path_info), 1)
                                    ]);
                                  }), 128))
                                ])
                              ]),
                              _: 1
                            })
                          ]),
                          _: 1
                        })) : (openBlock(), createBlock("div", {
                          key: 2,
                          class: "sec-empty"
                        }, [
                          createVNode("div", { class: "sec-empty__icon sec-empty__icon--neutral" }, [
                            createVNode(VIcon, { size: "32" }, {
                              default: withCtx(() => [
                                createTextVNode("mdi-alert-circle-outline")
                              ]),
                              _: 1
                            })
                          ]),
                          createVNode("p", { class: "sec-empty__title" }, "No Failure Logs"),
                          createVNode("p", { class: "sec-empty__sub" }, "No login failure logs have been recorded.")
                        ]))
                      ], 64)) : createCommentVNode("", true),
                      unref(activeTab) === "sessions" ? (openBlock(), createBlock(Fragment, { key: 3 }, [
                        unref(loadingSessions) ? (openBlock(), createBlock(VCard, {
                          key: 0,
                          flat: "",
                          class: "sec-skeleton"
                        }, {
                          default: withCtx(() => [
                            createVNode(VProgressCircular, {
                              indeterminate: "",
                              color: "primary",
                              size: "40",
                              width: "3"
                            })
                          ]),
                          _: 1
                        })) : unref(sessions).length > 0 ? (openBlock(), createBlock(VCard, {
                          key: 1,
                          flat: "",
                          border: "",
                          rounded: "xl",
                          class: "sec-table-card"
                        }, {
                          default: withCtx(() => [
                            createVNode(VTable, { density: "comfortable" }, {
                              default: withCtx(() => [
                                createVNode("thead", null, [
                                  createVNode("tr", null, [
                                    createVNode("th", { class: "text-left font-weight-bold" }, "User"),
                                    createVNode("th", { class: "text-left font-weight-bold" }, "Email"),
                                    createVNode("th", { class: "text-left font-weight-bold" }, "Role"),
                                    createVNode("th", { class: "text-left font-weight-bold" }, "Branch"),
                                    createVNode("th", { class: "text-left font-weight-bold" }, "Last Login"),
                                    createVNode("th", { class: "text-left font-weight-bold" }, "Session Expires")
                                  ])
                                ]),
                                createVNode("tbody", null, [
                                  (openBlock(true), createBlock(Fragment, null, renderList(unref(sessions), (s) => {
                                    return openBlock(), createBlock("tr", {
                                      key: s.session_key,
                                      class: "sec-row sec-row--primary"
                                    }, [
                                      createVNode("td", null, [
                                        createVNode("div", { class: "d-flex align-center ga-3" }, [
                                          createVNode(VAvatar, {
                                            size: "36",
                                            rounded: "lg",
                                            color: "primary",
                                            variant: "tonal"
                                          }, {
                                            default: withCtx(() => [
                                              createVNode("span", { class: "text-body-1 font-weight-bold text-primary" }, toDisplayString((s.name || s.user_name || "?").charAt(0).toUpperCase()), 1)
                                            ]),
                                            _: 2
                                          }, 1024),
                                          createVNode("span", { class: "text-body-1 font-weight-medium" }, toDisplayString(s.name || s.user_name), 1)
                                        ])
                                      ]),
                                      createVNode("td", { class: "text-body-2" }, toDisplayString(s.email || s.user_email), 1),
                                      createVNode("td", null, [
                                        createVNode(VChip, {
                                          size: "small",
                                          color: roleColor(s.role || s.user_role),
                                          variant: "tonal",
                                          label: ""
                                        }, {
                                          default: withCtx(() => [
                                            createTextVNode(toDisplayString(formatRole(s.role || s.user_role)), 1)
                                          ]),
                                          _: 2
                                        }, 1032, ["color"])
                                      ]),
                                      createVNode("td", { class: "text-body-2 text-medium-emphasis" }, toDisplayString(s.branch || "—"), 1),
                                      createVNode("td", { class: "text-body-2 text-medium-emphasis" }, toDisplayString(formatDateTime(s.last_login)), 1),
                                      createVNode("td", { class: "text-body-2 text-medium-emphasis" }, toDisplayString(formatDateTime(s.session_expires)), 1)
                                    ]);
                                  }), 128))
                                ])
                              ]),
                              _: 1
                            })
                          ]),
                          _: 1
                        })) : (openBlock(), createBlock("div", {
                          key: 2,
                          class: "sec-empty"
                        }, [
                          createVNode("div", { class: "sec-empty__icon sec-empty__icon--neutral" }, [
                            createVNode(VIcon, { size: "32" }, {
                              default: withCtx(() => [
                                createTextVNode("mdi-account-clock")
                              ]),
                              _: 1
                            })
                          ]),
                          createVNode("p", { class: "sec-empty__title" }, "No Active Sessions"),
                          createVNode("p", { class: "sec-empty__sub" }, "No users are currently logged in.")
                        ]))
                      ], 64)) : createCommentVNode("", true),
                      unref(activeTab) === "settings" ? (openBlock(), createBlock(VCard, {
                        key: 4,
                        flat: "",
                        border: "",
                        rounded: "xl",
                        "max-width": "640",
                        class: "sec-settings-card"
                      }, {
                        default: withCtx(() => [
                          createVNode("div", { class: "sec-settings__header" }, [
                            createVNode("div", { class: "sec-settings__icon" }, [
                              createVNode(VIcon, {
                                size: "24",
                                color: "primary"
                              }, {
                                default: withCtx(() => [
                                  createTextVNode("mdi-shield-lock")
                                ]),
                                _: 1
                              })
                            ]),
                            createVNode("div", null, [
                              createVNode("p", { class: "text-h6 font-weight-bold mb-0" }, "Login Security Policy"),
                              createVNode("p", { class: "text-body-2 text-medium-emphasis mb-0" }, " Configure brute-force login protection ")
                            ])
                          ]),
                          createVNode(VDivider, { class: "mb-5" }),
                          createVNode(VAlert, {
                            type: "info",
                            variant: "tonal",
                            density: "compact",
                            rounded: "lg",
                            class: "mb-5"
                          }, {
                            prepend: withCtx(() => [
                              createVNode(VIcon, { size: "18" }, {
                                default: withCtx(() => [
                                  createTextVNode("mdi-information-outline")
                                ]),
                                _: 1
                              })
                            ]),
                            default: withCtx(() => [
                              createTextVNode(" Changes apply immediately at runtime. They reset when the server restarts unless also updated in "),
                              createVNode("code", { class: "mx-1" }, "settings.py"),
                              createTextVNode(". ")
                            ]),
                            _: 1
                          }),
                          createVNode("div", { class: "sec-setting-row" }, [
                            createVNode("div", { class: "sec-setting-row__icon sec-setting-row__icon--primary" }, [
                              createVNode(VIcon, {
                                size: "20",
                                color: "primary"
                              }, {
                                default: withCtx(() => [
                                  createTextVNode("mdi-counter")
                                ]),
                                _: 1
                              })
                            ]),
                            createVNode("div", { class: "sec-setting-row__body" }, [
                              createVNode("p", { class: "sec-setting-row__title" }, "Failure Limit"),
                              createVNode("p", { class: "sec-setting-row__desc" }, " Number of failed login attempts before a user/IP is locked out. ")
                            ]),
                            createVNode("div", { class: "sec-setting-row__control" }, [
                              createVNode(VTextField, {
                                modelValue: unref(settingsForm).failure_limit,
                                "onUpdate:modelValue": ($event) => unref(settingsForm).failure_limit = $event,
                                modelModifiers: { number: true },
                                type: "number",
                                variant: "outlined",
                                density: "compact",
                                min: "1",
                                max: "100",
                                "hide-details": "",
                                rounded: "lg",
                                style: { "width": "120px" }
                              }, null, 8, ["modelValue", "onUpdate:modelValue"])
                            ])
                          ]),
                          createVNode(VDivider, { class: "my-1" }),
                          createVNode("div", { class: "sec-setting-row" }, [
                            createVNode("div", { class: "sec-setting-row__icon sec-setting-row__icon--info" }, [
                              createVNode(VIcon, {
                                size: "20",
                                color: "info"
                              }, {
                                default: withCtx(() => [
                                  createTextVNode("mdi-timer-outline")
                                ]),
                                _: 1
                              })
                            ]),
                            createVNode("div", { class: "sec-setting-row__body" }, [
                              createVNode("p", { class: "sec-setting-row__title" }, "Cool-off Time (hours)"),
                              createVNode("p", { class: "sec-setting-row__desc" }, " Hours before a locked-out user/IP is automatically unlocked. ")
                            ]),
                            createVNode("div", { class: "sec-setting-row__control" }, [
                              createVNode(VTextField, {
                                modelValue: unref(settingsForm).cooloff_time_hours,
                                "onUpdate:modelValue": ($event) => unref(settingsForm).cooloff_time_hours = $event,
                                modelModifiers: { number: true },
                                type: "number",
                                variant: "outlined",
                                density: "compact",
                                min: "0",
                                step: "0.5",
                                "hide-details": "",
                                rounded: "lg",
                                style: { "width": "120px" }
                              }, null, 8, ["modelValue", "onUpdate:modelValue"])
                            ])
                          ]),
                          createVNode(VDivider, { class: "my-1" }),
                          createVNode("div", { class: "sec-setting-row" }, [
                            createVNode("div", { class: "sec-setting-row__icon sec-setting-row__icon--success" }, [
                              createVNode(VIcon, {
                                size: "20",
                                color: "success"
                              }, {
                                default: withCtx(() => [
                                  createTextVNode("mdi-refresh-circle")
                                ]),
                                _: 1
                              })
                            ]),
                            createVNode("div", { class: "sec-setting-row__body" }, [
                              createVNode("p", { class: "sec-setting-row__title" }, "Reset on Successful Login"),
                              createVNode("p", { class: "sec-setting-row__desc" }, " If on, a successful login resets the failure counter for that user/IP. ")
                            ]),
                            createVNode("div", { class: "sec-setting-row__control" }, [
                              createVNode(VSwitch, {
                                modelValue: unref(settingsForm).reset_on_success,
                                "onUpdate:modelValue": ($event) => unref(settingsForm).reset_on_success = $event,
                                color: "primary",
                                density: "compact",
                                "hide-details": "",
                                inset: ""
                              }, null, 8, ["modelValue", "onUpdate:modelValue"])
                            ])
                          ]),
                          createVNode(VDivider, { class: "mt-3 mb-4" }),
                          createVNode("div", { class: "d-flex justify-end ga-3" }, [
                            createVNode(VBtn, {
                              variant: "text",
                              rounded: "lg",
                              onClick: loadSettings
                            }, {
                              default: withCtx(() => [
                                createTextVNode("Reset")
                              ]),
                              _: 1
                            }),
                            createVNode(VBtn, {
                              variant: "flat",
                              color: "primary",
                              "prepend-icon": "mdi-content-save",
                              loading: unref(savingSettings),
                              rounded: "lg",
                              onClick: saveSettings
                            }, {
                              default: withCtx(() => [
                                createTextVNode(" Save Changes ")
                              ]),
                              _: 1
                            }, 8, ["loading"])
                          ])
                        ]),
                        _: 1
                      })) : createCommentVNode("", true)
                    ]))
                  ];
                }
              }),
              _: 1
            }, _parent2, _scopeId));
            _push2(ssrRenderComponent(VDialog, {
              modelValue: unref(resetAllDialog),
              "onUpdate:modelValue": ($event) => isRef(resetAllDialog) ? resetAllDialog.value = $event : null,
              "max-width": "460"
            }, {
              default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                if (_push3) {
                  _push3(ssrRenderComponent(VCard, {
                    rounded: "xl",
                    class: "sec-dialog"
                  }, {
                    default: withCtx((_3, _push4, _parent4, _scopeId3) => {
                      if (_push4) {
                        _push4(`<div class="sec-dialog__header" data-v-4f4f123d${_scopeId3}><div class="sec-dialog__icon sec-dialog__icon--warning" data-v-4f4f123d${_scopeId3}>`);
                        _push4(ssrRenderComponent(VIcon, {
                          size: "24",
                          color: "warning"
                        }, {
                          default: withCtx((_4, _push5, _parent5, _scopeId4) => {
                            if (_push5) {
                              _push5(`mdi-alert-circle`);
                            } else {
                              return [
                                createTextVNode("mdi-alert-circle")
                              ];
                            }
                          }),
                          _: 1
                        }, _parent4, _scopeId3));
                        _push4(`</div>`);
                        _push4(ssrRenderComponent(VBtn, {
                          icon: "mdi-close",
                          variant: "text",
                          size: "x-small",
                          class: "sec-dialog__close",
                          onClick: ($event) => resetAllDialog.value = false
                        }, null, _parent4, _scopeId3));
                        _push4(`</div><h3 class="sec-dialog__title" data-v-4f4f123d${_scopeId3}>Unlock All?</h3><p class="sec-dialog__body" data-v-4f4f123d${_scopeId3}> This will delete ALL ${ssrInterpolate(unref(overview).total_attempts)} access attempt(s) and unlock every locked IP/user. This action cannot be undone. </p><div class="sec-dialog__actions" data-v-4f4f123d${_scopeId3}>`);
                        _push4(ssrRenderComponent(VBtn, {
                          variant: "text",
                          rounded: "lg",
                          onClick: ($event) => resetAllDialog.value = false
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
                          color: "warning",
                          variant: "flat",
                          loading: unref(resetting),
                          rounded: "lg",
                          "prepend-icon": "mdi-lock-open-variant",
                          onClick: resetAll
                        }, {
                          default: withCtx((_4, _push5, _parent5, _scopeId4) => {
                            if (_push5) {
                              _push5(` Unlock All `);
                            } else {
                              return [
                                createTextVNode(" Unlock All ")
                              ];
                            }
                          }),
                          _: 1
                        }, _parent4, _scopeId3));
                        _push4(`</div>`);
                      } else {
                        return [
                          createVNode("div", { class: "sec-dialog__header" }, [
                            createVNode("div", { class: "sec-dialog__icon sec-dialog__icon--warning" }, [
                              createVNode(VIcon, {
                                size: "24",
                                color: "warning"
                              }, {
                                default: withCtx(() => [
                                  createTextVNode("mdi-alert-circle")
                                ]),
                                _: 1
                              })
                            ]),
                            createVNode(VBtn, {
                              icon: "mdi-close",
                              variant: "text",
                              size: "x-small",
                              class: "sec-dialog__close",
                              onClick: ($event) => resetAllDialog.value = false
                            }, null, 8, ["onClick"])
                          ]),
                          createVNode("h3", { class: "sec-dialog__title" }, "Unlock All?"),
                          createVNode("p", { class: "sec-dialog__body" }, " This will delete ALL " + toDisplayString(unref(overview).total_attempts) + " access attempt(s) and unlock every locked IP/user. This action cannot be undone. ", 1),
                          createVNode("div", { class: "sec-dialog__actions" }, [
                            createVNode(VBtn, {
                              variant: "text",
                              rounded: "lg",
                              onClick: ($event) => resetAllDialog.value = false
                            }, {
                              default: withCtx(() => [
                                createTextVNode("Cancel")
                              ]),
                              _: 1
                            }, 8, ["onClick"]),
                            createVNode(VBtn, {
                              color: "warning",
                              variant: "flat",
                              loading: unref(resetting),
                              rounded: "lg",
                              "prepend-icon": "mdi-lock-open-variant",
                              onClick: resetAll
                            }, {
                              default: withCtx(() => [
                                createTextVNode(" Unlock All ")
                              ]),
                              _: 1
                            }, 8, ["loading"])
                          ])
                        ];
                      }
                    }),
                    _: 1
                  }, _parent3, _scopeId2));
                } else {
                  return [
                    createVNode(VCard, {
                      rounded: "xl",
                      class: "sec-dialog"
                    }, {
                      default: withCtx(() => [
                        createVNode("div", { class: "sec-dialog__header" }, [
                          createVNode("div", { class: "sec-dialog__icon sec-dialog__icon--warning" }, [
                            createVNode(VIcon, {
                              size: "24",
                              color: "warning"
                            }, {
                              default: withCtx(() => [
                                createTextVNode("mdi-alert-circle")
                              ]),
                              _: 1
                            })
                          ]),
                          createVNode(VBtn, {
                            icon: "mdi-close",
                            variant: "text",
                            size: "x-small",
                            class: "sec-dialog__close",
                            onClick: ($event) => resetAllDialog.value = false
                          }, null, 8, ["onClick"])
                        ]),
                        createVNode("h3", { class: "sec-dialog__title" }, "Unlock All?"),
                        createVNode("p", { class: "sec-dialog__body" }, " This will delete ALL " + toDisplayString(unref(overview).total_attempts) + " access attempt(s) and unlock every locked IP/user. This action cannot be undone. ", 1),
                        createVNode("div", { class: "sec-dialog__actions" }, [
                          createVNode(VBtn, {
                            variant: "text",
                            rounded: "lg",
                            onClick: ($event) => resetAllDialog.value = false
                          }, {
                            default: withCtx(() => [
                              createTextVNode("Cancel")
                            ]),
                            _: 1
                          }, 8, ["onClick"]),
                          createVNode(VBtn, {
                            color: "warning",
                            variant: "flat",
                            loading: unref(resetting),
                            rounded: "lg",
                            "prepend-icon": "mdi-lock-open-variant",
                            onClick: resetAll
                          }, {
                            default: withCtx(() => [
                              createTextVNode(" Unlock All ")
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
            }, _parent2, _scopeId));
            _push2(ssrRenderComponent(VDialog, {
              modelValue: unref(unlockUserDialog),
              "onUpdate:modelValue": ($event) => isRef(unlockUserDialog) ? unlockUserDialog.value = $event : null,
              "max-width": "500"
            }, {
              default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                if (_push3) {
                  _push3(ssrRenderComponent(VCard, {
                    rounded: "xl",
                    class: "sec-dialog"
                  }, {
                    default: withCtx((_3, _push4, _parent4, _scopeId3) => {
                      if (_push4) {
                        _push4(`<div class="sec-dialog__header" data-v-4f4f123d${_scopeId3}><div class="sec-dialog__icon sec-dialog__icon--success" data-v-4f4f123d${_scopeId3}>`);
                        _push4(ssrRenderComponent(VIcon, {
                          size: "24",
                          color: "success"
                        }, {
                          default: withCtx((_4, _push5, _parent5, _scopeId4) => {
                            if (_push5) {
                              _push5(`mdi-lock-open-variant`);
                            } else {
                              return [
                                createTextVNode("mdi-lock-open-variant")
                              ];
                            }
                          }),
                          _: 1
                        }, _parent4, _scopeId3));
                        _push4(`</div>`);
                        _push4(ssrRenderComponent(VBtn, {
                          icon: "mdi-close",
                          variant: "text",
                          size: "x-small",
                          class: "sec-dialog__close",
                          onClick: ($event) => unlockUserDialog.value = false
                        }, null, _parent4, _scopeId3));
                        _push4(`</div><h3 class="sec-dialog__title" data-v-4f4f123d${_scopeId3}>Unlock User by Email/IP</h3><p class="sec-dialog__body mb-4" data-v-4f4f123d${_scopeId3}> Enter the username/email or IP address to unlock. </p>`);
                        _push4(ssrRenderComponent(VTextField, {
                          modelValue: unref(unlockForm).username,
                          "onUpdate:modelValue": ($event) => unref(unlockForm).username = $event,
                          label: "Username / Email",
                          variant: "outlined",
                          density: "compact",
                          "prepend-inner-icon": "mdi-account",
                          "hide-details": "",
                          rounded: "lg",
                          class: "mb-3"
                        }, null, _parent4, _scopeId3));
                        _push4(ssrRenderComponent(VTextField, {
                          modelValue: unref(unlockForm).ip,
                          "onUpdate:modelValue": ($event) => unref(unlockForm).ip = $event,
                          label: "IP Address (optional)",
                          variant: "outlined",
                          density: "compact",
                          "prepend-inner-icon": "mdi-ip",
                          "hide-details": "",
                          rounded: "lg"
                        }, null, _parent4, _scopeId3));
                        _push4(`<div class="sec-dialog__actions" data-v-4f4f123d${_scopeId3}>`);
                        _push4(ssrRenderComponent(VBtn, {
                          variant: "text",
                          rounded: "lg",
                          onClick: ($event) => unlockUserDialog.value = false
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
                          color: "success",
                          variant: "flat",
                          loading: unref(unlocking),
                          rounded: "lg",
                          "prepend-icon": "mdi-lock-open-variant",
                          onClick: unlockUserOrIp
                        }, {
                          default: withCtx((_4, _push5, _parent5, _scopeId4) => {
                            if (_push5) {
                              _push5(` Unlock `);
                            } else {
                              return [
                                createTextVNode(" Unlock ")
                              ];
                            }
                          }),
                          _: 1
                        }, _parent4, _scopeId3));
                        _push4(`</div>`);
                      } else {
                        return [
                          createVNode("div", { class: "sec-dialog__header" }, [
                            createVNode("div", { class: "sec-dialog__icon sec-dialog__icon--success" }, [
                              createVNode(VIcon, {
                                size: "24",
                                color: "success"
                              }, {
                                default: withCtx(() => [
                                  createTextVNode("mdi-lock-open-variant")
                                ]),
                                _: 1
                              })
                            ]),
                            createVNode(VBtn, {
                              icon: "mdi-close",
                              variant: "text",
                              size: "x-small",
                              class: "sec-dialog__close",
                              onClick: ($event) => unlockUserDialog.value = false
                            }, null, 8, ["onClick"])
                          ]),
                          createVNode("h3", { class: "sec-dialog__title" }, "Unlock User by Email/IP"),
                          createVNode("p", { class: "sec-dialog__body mb-4" }, " Enter the username/email or IP address to unlock. "),
                          createVNode(VTextField, {
                            modelValue: unref(unlockForm).username,
                            "onUpdate:modelValue": ($event) => unref(unlockForm).username = $event,
                            label: "Username / Email",
                            variant: "outlined",
                            density: "compact",
                            "prepend-inner-icon": "mdi-account",
                            "hide-details": "",
                            rounded: "lg",
                            class: "mb-3"
                          }, null, 8, ["modelValue", "onUpdate:modelValue"]),
                          createVNode(VTextField, {
                            modelValue: unref(unlockForm).ip,
                            "onUpdate:modelValue": ($event) => unref(unlockForm).ip = $event,
                            label: "IP Address (optional)",
                            variant: "outlined",
                            density: "compact",
                            "prepend-inner-icon": "mdi-ip",
                            "hide-details": "",
                            rounded: "lg"
                          }, null, 8, ["modelValue", "onUpdate:modelValue"]),
                          createVNode("div", { class: "sec-dialog__actions" }, [
                            createVNode(VBtn, {
                              variant: "text",
                              rounded: "lg",
                              onClick: ($event) => unlockUserDialog.value = false
                            }, {
                              default: withCtx(() => [
                                createTextVNode("Cancel")
                              ]),
                              _: 1
                            }, 8, ["onClick"]),
                            createVNode(VBtn, {
                              color: "success",
                              variant: "flat",
                              loading: unref(unlocking),
                              rounded: "lg",
                              "prepend-icon": "mdi-lock-open-variant",
                              onClick: unlockUserOrIp
                            }, {
                              default: withCtx(() => [
                                createTextVNode(" Unlock ")
                              ]),
                              _: 1
                            }, 8, ["loading"])
                          ])
                        ];
                      }
                    }),
                    _: 1
                  }, _parent3, _scopeId2));
                } else {
                  return [
                    createVNode(VCard, {
                      rounded: "xl",
                      class: "sec-dialog"
                    }, {
                      default: withCtx(() => [
                        createVNode("div", { class: "sec-dialog__header" }, [
                          createVNode("div", { class: "sec-dialog__icon sec-dialog__icon--success" }, [
                            createVNode(VIcon, {
                              size: "24",
                              color: "success"
                            }, {
                              default: withCtx(() => [
                                createTextVNode("mdi-lock-open-variant")
                              ]),
                              _: 1
                            })
                          ]),
                          createVNode(VBtn, {
                            icon: "mdi-close",
                            variant: "text",
                            size: "x-small",
                            class: "sec-dialog__close",
                            onClick: ($event) => unlockUserDialog.value = false
                          }, null, 8, ["onClick"])
                        ]),
                        createVNode("h3", { class: "sec-dialog__title" }, "Unlock User by Email/IP"),
                        createVNode("p", { class: "sec-dialog__body mb-4" }, " Enter the username/email or IP address to unlock. "),
                        createVNode(VTextField, {
                          modelValue: unref(unlockForm).username,
                          "onUpdate:modelValue": ($event) => unref(unlockForm).username = $event,
                          label: "Username / Email",
                          variant: "outlined",
                          density: "compact",
                          "prepend-inner-icon": "mdi-account",
                          "hide-details": "",
                          rounded: "lg",
                          class: "mb-3"
                        }, null, 8, ["modelValue", "onUpdate:modelValue"]),
                        createVNode(VTextField, {
                          modelValue: unref(unlockForm).ip,
                          "onUpdate:modelValue": ($event) => unref(unlockForm).ip = $event,
                          label: "IP Address (optional)",
                          variant: "outlined",
                          density: "compact",
                          "prepend-inner-icon": "mdi-ip",
                          "hide-details": "",
                          rounded: "lg"
                        }, null, 8, ["modelValue", "onUpdate:modelValue"]),
                        createVNode("div", { class: "sec-dialog__actions" }, [
                          createVNode(VBtn, {
                            variant: "text",
                            rounded: "lg",
                            onClick: ($event) => unlockUserDialog.value = false
                          }, {
                            default: withCtx(() => [
                              createTextVNode("Cancel")
                            ]),
                            _: 1
                          }, 8, ["onClick"]),
                          createVNode(VBtn, {
                            color: "success",
                            variant: "flat",
                            loading: unref(unlocking),
                            rounded: "lg",
                            "prepend-icon": "mdi-lock-open-variant",
                            onClick: unlockUserOrIp
                          }, {
                            default: withCtx(() => [
                              createTextVNode(" Unlock ")
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
            }, _parent2, _scopeId));
          } else {
            return [
              createVNode("div", { class: "sec-hero" }, [
                createVNode("div", { class: "sec-hero__content" }, [
                  createVNode("div", { class: "sec-hero__icon" }, [
                    createVNode(VIcon, { size: "28" }, {
                      default: withCtx(() => [
                        createTextVNode("mdi-shield-key")
                      ]),
                      _: 1
                    })
                  ]),
                  createVNode("div", { class: "sec-hero__text" }, [
                    createVNode("h1", { class: "sec-hero__title" }, "Security Control Center"),
                    createVNode("p", { class: "sec-hero__sub" }, " Monitor login attempts, manage locked users, and configure django-axes security policy ")
                  ])
                ]),
                createVNode("div", { class: "sec-hero__actions" }, [
                  createVNode(VBtn, {
                    variant: "tonal",
                    color: "primary",
                    "prepend-icon": "mdi-refresh",
                    loading: unref(loading),
                    rounded: "lg",
                    size: "small",
                    onClick: refreshAll
                  }, {
                    default: withCtx(() => [
                      createTextVNode(" Refresh ")
                    ]),
                    _: 1
                  }, 8, ["loading"]),
                  createVNode(VBtn, {
                    variant: "outlined",
                    "prepend-icon": "mdi-lock-open-variant",
                    rounded: "lg",
                    size: "small",
                    onClick: ($event) => unlockUserDialog.value = true
                  }, {
                    default: withCtx(() => [
                      createTextVNode(" Unlock by User/IP ")
                    ]),
                    _: 1
                  }, 8, ["onClick"])
                ])
              ]),
              createVNode(VRow, { class: "mb-1" }, {
                default: withCtx(() => [
                  (openBlock(true), createBlock(Fragment, null, renderList(unref(kpis), (kpi) => {
                    return openBlock(), createBlock(VCol, {
                      key: kpi.label,
                      cols: "12",
                      sm: "6",
                      lg: "3"
                    }, {
                      default: withCtx(() => [
                        createVNode(VCard, {
                          rounded: "xl",
                          class: ["sec-kpi", `sec-kpi--${kpi.color}`],
                          flat: "",
                          border: ""
                        }, {
                          default: withCtx(() => [
                            createVNode("div", { class: "sec-kpi__top" }, [
                              createVNode("div", { class: "sec-kpi__icon" }, [
                                createVNode(VIcon, { size: "20" }, {
                                  default: withCtx(() => [
                                    createTextVNode(toDisplayString(kpi.icon), 1)
                                  ]),
                                  _: 2
                                }, 1024)
                              ]),
                              createVNode("div", {
                                class: ["sec-kpi__badge", `sec-kpi__badge--${kpi.color}`]
                              }, toDisplayString(kpi.value), 3)
                            ]),
                            createVNode("p", { class: "sec-kpi__label" }, toDisplayString(kpi.label), 1),
                            createVNode("p", { class: "sec-kpi__sub" }, toDisplayString(kpi.sub), 1)
                          ]),
                          _: 2
                        }, 1032, ["class"])
                      ]),
                      _: 2
                    }, 1024);
                  }), 128))
                ]),
                _: 1
              }),
              createVNode("div", { class: "sec-nav mb-4" }, [
                (openBlock(true), createBlock(Fragment, null, renderList(unref(tabs), (tab) => {
                  return openBlock(), createBlock("div", {
                    key: tab.value,
                    class: ["sec-nav__item", { "sec-nav__item--active": unref(activeTab) === tab.value }],
                    onClick: ($event) => activeTab.value = tab.value
                  }, [
                    createVNode(VIcon, {
                      size: "18",
                      class: "sec-nav__icon"
                    }, {
                      default: withCtx(() => [
                        createTextVNode(toDisplayString(tab.icon), 1)
                      ]),
                      _: 2
                    }, 1024),
                    createVNode("span", { class: "sec-nav__label" }, toDisplayString(tab.label), 1),
                    tab.count !== void 0 ? (openBlock(), createBlock("span", {
                      key: 0,
                      class: "sec-nav__badge"
                    }, toDisplayString(tab.count), 1)) : createCommentVNode("", true)
                  ], 10, ["onClick"]);
                }), 128))
              ]),
              createVNode(VFadeTransition, { mode: "out-in" }, {
                default: withCtx(() => [
                  (openBlock(), createBlock("div", { key: unref(activeTab) }, [
                    unref(activeTab) === "locked" ? (openBlock(), createBlock(Fragment, { key: 0 }, [
                      unref(locked).length > 0 ? (openBlock(), createBlock("div", {
                        key: 0,
                        class: "d-flex ga-2 mb-4 flex-wrap"
                      }, [
                        createVNode(VBtn, {
                          variant: "flat",
                          color: "error",
                          "prepend-icon": "mdi-lock-open-variant",
                          rounded: "lg",
                          size: "small",
                          onClick: confirmResetAll
                        }, {
                          default: withCtx(() => [
                            createTextVNode(" Unlock All (" + toDisplayString(unref(locked).length) + ") ", 1)
                          ]),
                          _: 1
                        })
                      ])) : createCommentVNode("", true),
                      unref(loading) ? (openBlock(), createBlock(VCard, {
                        key: 1,
                        flat: "",
                        class: "sec-skeleton"
                      }, {
                        default: withCtx(() => [
                          createVNode(VProgressCircular, {
                            indeterminate: "",
                            color: "primary",
                            size: "40",
                            width: "3"
                          })
                        ]),
                        _: 1
                      })) : unref(locked).length === 0 ? (openBlock(), createBlock("div", {
                        key: 2,
                        class: "sec-empty"
                      }, [
                        createVNode("div", { class: "sec-empty__icon sec-empty__icon--success" }, [
                          createVNode(VIcon, { size: "32" }, {
                            default: withCtx(() => [
                              createTextVNode("mdi-shield-check")
                            ]),
                            _: 1
                          })
                        ]),
                        createVNode("p", { class: "sec-empty__title" }, "No Locked Users"),
                        createVNode("p", { class: "sec-empty__sub" }, " All clear — no IP addresses or usernames are currently locked out. ")
                      ])) : (openBlock(), createBlock(VCard, {
                        key: 3,
                        flat: "",
                        border: "",
                        rounded: "xl",
                        class: "sec-table-card"
                      }, {
                        default: withCtx(() => [
                          createVNode(VTable, { density: "comfortable" }, {
                            default: withCtx(() => [
                              createVNode("thead", null, [
                                createVNode("tr", null, [
                                  createVNode("th", { class: "text-left font-weight-bold" }, "Username / Email"),
                                  createVNode("th", { class: "text-left font-weight-bold" }, "IP Address"),
                                  createVNode("th", { class: "text-center font-weight-bold" }, "Failed Attempts"),
                                  createVNode("th", { class: "text-left font-weight-bold" }, "Attempt Time"),
                                  createVNode("th", { class: "text-left font-weight-bold" }, "Path"),
                                  createVNode("th", { class: "text-right font-weight-bold" }, "Actions")
                                ])
                              ]),
                              createVNode("tbody", null, [
                                (openBlock(true), createBlock(Fragment, null, renderList(unref(locked), (item) => {
                                  return openBlock(), createBlock("tr", {
                                    key: item.id,
                                    class: "sec-row sec-row--error"
                                  }, [
                                    createVNode("td", null, [
                                      createVNode("div", { class: "d-flex align-center ga-3" }, [
                                        createVNode(VAvatar, {
                                          size: "36",
                                          rounded: "lg",
                                          color: "error",
                                          variant: "tonal"
                                        }, {
                                          default: withCtx(() => [
                                            createVNode(VIcon, {
                                              size: "18",
                                              color: "error"
                                            }, {
                                              default: withCtx(() => [
                                                createTextVNode("mdi-lock")
                                              ]),
                                              _: 1
                                            })
                                          ]),
                                          _: 1
                                        }),
                                        createVNode("span", { class: "text-body-1 font-weight-medium" }, toDisplayString(item.username), 1)
                                      ])
                                    ]),
                                    createVNode("td", { class: "text-body-2" }, toDisplayString(item.ip_address), 1),
                                    createVNode("td", { class: "text-center" }, [
                                      createVNode(VChip, {
                                        size: "small",
                                        color: "error",
                                        variant: "tonal",
                                        label: ""
                                      }, {
                                        default: withCtx(() => [
                                          createTextVNode(toDisplayString(item.failures_since_start) + "x ", 1)
                                        ]),
                                        _: 2
                                      }, 1024)
                                    ]),
                                    createVNode("td", { class: "text-body-2 text-medium-emphasis" }, toDisplayString(formatDateTime(item.attempt_time)), 1),
                                    createVNode("td", { class: "text-caption text-medium-emphasis" }, toDisplayString(item.path_info), 1),
                                    createVNode("td", { class: "text-right" }, [
                                      createVNode(VBtn, {
                                        size: "small",
                                        variant: "tonal",
                                        color: "success",
                                        "prepend-icon": "mdi-lock-open-variant",
                                        rounded: "lg",
                                        onClick: ($event) => unlockEntry(item.id)
                                      }, {
                                        default: withCtx(() => [
                                          createTextVNode(" Unlock ")
                                        ]),
                                        _: 1
                                      }, 8, ["onClick"])
                                    ])
                                  ]);
                                }), 128))
                              ])
                            ]),
                            _: 1
                          })
                        ]),
                        _: 1
                      }))
                    ], 64)) : createCommentVNode("", true),
                    unref(activeTab) === "attempts" ? (openBlock(), createBlock(Fragment, { key: 1 }, [
                      createVNode("div", { class: "d-flex ga-3 mb-4 flex-wrap align-center" }, [
                        createVNode(VTextField, {
                          modelValue: unref(attemptsSearch),
                          "onUpdate:modelValue": ($event) => isRef(attemptsSearch) ? attemptsSearch.value = $event : null,
                          "prepend-inner-icon": "mdi-magnify",
                          placeholder: "Search by username or IP...",
                          density: "compact",
                          variant: "outlined",
                          "hide-details": "",
                          rounded: "lg",
                          style: { "max-width": "320px" },
                          clearable: ""
                        }, null, 8, ["modelValue", "onUpdate:modelValue"]),
                        unref(overview).total_attempts > 0 ? (openBlock(), createBlock(VBtn, {
                          key: 0,
                          variant: "outlined",
                          color: "error",
                          size: "small",
                          "prepend-icon": "mdi-delete-sweep",
                          rounded: "lg",
                          onClick: confirmResetAll
                        }, {
                          default: withCtx(() => [
                            createTextVNode(" Clear All Attempts ")
                          ]),
                          _: 1
                        })) : createCommentVNode("", true)
                      ]),
                      unref(loadingAttempts) ? (openBlock(), createBlock(VCard, {
                        key: 0,
                        flat: "",
                        class: "sec-skeleton"
                      }, {
                        default: withCtx(() => [
                          createVNode(VProgressCircular, {
                            indeterminate: "",
                            color: "primary",
                            size: "40",
                            width: "3"
                          })
                        ]),
                        _: 1
                      })) : unref(filteredAttempts).length > 0 ? (openBlock(), createBlock(VCard, {
                        key: 1,
                        flat: "",
                        border: "",
                        rounded: "xl",
                        class: "sec-table-card"
                      }, {
                        default: withCtx(() => [
                          createVNode(VTable, { density: "comfortable" }, {
                            default: withCtx(() => [
                              createVNode("thead", null, [
                                createVNode("tr", null, [
                                  createVNode("th", { class: "text-left font-weight-bold" }, "Username"),
                                  createVNode("th", { class: "text-left font-weight-bold" }, "IP Address"),
                                  createVNode("th", { class: "text-center font-weight-bold" }, "Failures"),
                                  createVNode("th", { class: "text-center font-weight-bold" }, "Status"),
                                  createVNode("th", { class: "text-left font-weight-bold" }, "Attempt Time"),
                                  createVNode("th", { class: "text-right font-weight-bold" }, "Actions")
                                ])
                              ]),
                              createVNode("tbody", null, [
                                (openBlock(true), createBlock(Fragment, null, renderList(unref(filteredAttempts), (item) => {
                                  return openBlock(), createBlock("tr", {
                                    key: item.id,
                                    class: ["sec-row", { "sec-row--error": item.locked }]
                                  }, [
                                    createVNode("td", { class: "text-body-1 font-weight-medium" }, toDisplayString(item.username), 1),
                                    createVNode("td", { class: "text-body-2" }, toDisplayString(item.ip_address), 1),
                                    createVNode("td", { class: "text-center" }, [
                                      createVNode(VChip, {
                                        size: "small",
                                        color: item.failures_since_start >= 5 ? "error" : "warning",
                                        variant: "tonal",
                                        label: ""
                                      }, {
                                        default: withCtx(() => [
                                          createTextVNode(toDisplayString(item.failures_since_start), 1)
                                        ]),
                                        _: 2
                                      }, 1032, ["color"])
                                    ]),
                                    createVNode("td", { class: "text-center" }, [
                                      createVNode(VChip, {
                                        size: "x-small",
                                        color: item.locked ? "error" : "default",
                                        variant: item.locked ? "tonal" : "text",
                                        label: ""
                                      }, {
                                        default: withCtx(() => [
                                          createVNode(VIcon, {
                                            size: "12",
                                            class: "mr-1"
                                          }, {
                                            default: withCtx(() => [
                                              createTextVNode(toDisplayString(item.locked ? "mdi-lock" : "mdi-eye"), 1)
                                            ]),
                                            _: 2
                                          }, 1024),
                                          createTextVNode(" " + toDisplayString(item.locked ? "Locked" : "Tracking"), 1)
                                        ]),
                                        _: 2
                                      }, 1032, ["color", "variant"])
                                    ]),
                                    createVNode("td", { class: "text-body-2 text-medium-emphasis" }, toDisplayString(formatDateTime(item.attempt_time)), 1),
                                    createVNode("td", { class: "text-right" }, [
                                      item.locked ? (openBlock(), createBlock(VBtn, {
                                        key: 0,
                                        size: "small",
                                        variant: "tonal",
                                        color: "success",
                                        "prepend-icon": "mdi-lock-open-variant",
                                        rounded: "lg",
                                        onClick: ($event) => unlockEntry(item.id)
                                      }, {
                                        default: withCtx(() => [
                                          createTextVNode(" Unlock ")
                                        ]),
                                        _: 1
                                      }, 8, ["onClick"])) : (openBlock(), createBlock("span", {
                                        key: 1,
                                        class: "text-caption text-disabled"
                                      }, "—"))
                                    ])
                                  ], 2);
                                }), 128))
                              ])
                            ]),
                            _: 1
                          })
                        ]),
                        _: 1
                      })) : (openBlock(), createBlock("div", {
                        key: 2,
                        class: "sec-empty"
                      }, [
                        createVNode("div", { class: "sec-empty__icon sec-empty__icon--neutral" }, [
                          createVNode(VIcon, { size: "32" }, {
                            default: withCtx(() => [
                              createTextVNode("mdi-login-variant")
                            ]),
                            _: 1
                          })
                        ]),
                        createVNode("p", { class: "sec-empty__title" }, "No Access Attempts"),
                        createVNode("p", { class: "sec-empty__sub" }, "No login attempts have been recorded yet.")
                      ]))
                    ], 64)) : createCommentVNode("", true),
                    unref(activeTab) === "logs" ? (openBlock(), createBlock(Fragment, { key: 2 }, [
                      unref(loadingLogs) ? (openBlock(), createBlock(VCard, {
                        key: 0,
                        flat: "",
                        class: "sec-skeleton"
                      }, {
                        default: withCtx(() => [
                          createVNode(VProgressCircular, {
                            indeterminate: "",
                            color: "primary",
                            size: "40",
                            width: "3"
                          })
                        ]),
                        _: 1
                      })) : unref(failureLogs).length > 0 ? (openBlock(), createBlock(VCard, {
                        key: 1,
                        flat: "",
                        border: "",
                        rounded: "xl",
                        class: "sec-table-card"
                      }, {
                        default: withCtx(() => [
                          createVNode(VTable, { density: "comfortable" }, {
                            default: withCtx(() => [
                              createVNode("thead", null, [
                                createVNode("tr", null, [
                                  createVNode("th", { class: "text-left font-weight-bold" }, "Username"),
                                  createVNode("th", { class: "text-left font-weight-bold" }, "IP Address"),
                                  createVNode("th", { class: "text-center font-weight-bold" }, "Locked Out"),
                                  createVNode("th", { class: "text-left font-weight-bold" }, "Attempt Time"),
                                  createVNode("th", { class: "text-left font-weight-bold" }, "Path")
                                ])
                              ]),
                              createVNode("tbody", null, [
                                (openBlock(true), createBlock(Fragment, null, renderList(unref(failureLogs), (log) => {
                                  return openBlock(), createBlock("tr", {
                                    key: log.id,
                                    class: "sec-row"
                                  }, [
                                    createVNode("td", { class: "text-body-1 font-weight-medium" }, toDisplayString(log.username), 1),
                                    createVNode("td", { class: "text-body-2" }, toDisplayString(log.ip_address), 1),
                                    createVNode("td", { class: "text-center" }, [
                                      createVNode(VIcon, {
                                        color: log.locked_out ? "error" : "grey",
                                        size: "20"
                                      }, {
                                        default: withCtx(() => [
                                          createTextVNode(toDisplayString(log.locked_out ? "mdi-lock" : "mdi-lock-open"), 1)
                                        ]),
                                        _: 2
                                      }, 1032, ["color"])
                                    ]),
                                    createVNode("td", { class: "text-body-2 text-medium-emphasis" }, toDisplayString(formatDateTime(log.attempt_time)), 1),
                                    createVNode("td", { class: "text-caption text-medium-emphasis" }, toDisplayString(log.path_info), 1)
                                  ]);
                                }), 128))
                              ])
                            ]),
                            _: 1
                          })
                        ]),
                        _: 1
                      })) : (openBlock(), createBlock("div", {
                        key: 2,
                        class: "sec-empty"
                      }, [
                        createVNode("div", { class: "sec-empty__icon sec-empty__icon--neutral" }, [
                          createVNode(VIcon, { size: "32" }, {
                            default: withCtx(() => [
                              createTextVNode("mdi-alert-circle-outline")
                            ]),
                            _: 1
                          })
                        ]),
                        createVNode("p", { class: "sec-empty__title" }, "No Failure Logs"),
                        createVNode("p", { class: "sec-empty__sub" }, "No login failure logs have been recorded.")
                      ]))
                    ], 64)) : createCommentVNode("", true),
                    unref(activeTab) === "sessions" ? (openBlock(), createBlock(Fragment, { key: 3 }, [
                      unref(loadingSessions) ? (openBlock(), createBlock(VCard, {
                        key: 0,
                        flat: "",
                        class: "sec-skeleton"
                      }, {
                        default: withCtx(() => [
                          createVNode(VProgressCircular, {
                            indeterminate: "",
                            color: "primary",
                            size: "40",
                            width: "3"
                          })
                        ]),
                        _: 1
                      })) : unref(sessions).length > 0 ? (openBlock(), createBlock(VCard, {
                        key: 1,
                        flat: "",
                        border: "",
                        rounded: "xl",
                        class: "sec-table-card"
                      }, {
                        default: withCtx(() => [
                          createVNode(VTable, { density: "comfortable" }, {
                            default: withCtx(() => [
                              createVNode("thead", null, [
                                createVNode("tr", null, [
                                  createVNode("th", { class: "text-left font-weight-bold" }, "User"),
                                  createVNode("th", { class: "text-left font-weight-bold" }, "Email"),
                                  createVNode("th", { class: "text-left font-weight-bold" }, "Role"),
                                  createVNode("th", { class: "text-left font-weight-bold" }, "Branch"),
                                  createVNode("th", { class: "text-left font-weight-bold" }, "Last Login"),
                                  createVNode("th", { class: "text-left font-weight-bold" }, "Session Expires")
                                ])
                              ]),
                              createVNode("tbody", null, [
                                (openBlock(true), createBlock(Fragment, null, renderList(unref(sessions), (s) => {
                                  return openBlock(), createBlock("tr", {
                                    key: s.session_key,
                                    class: "sec-row sec-row--primary"
                                  }, [
                                    createVNode("td", null, [
                                      createVNode("div", { class: "d-flex align-center ga-3" }, [
                                        createVNode(VAvatar, {
                                          size: "36",
                                          rounded: "lg",
                                          color: "primary",
                                          variant: "tonal"
                                        }, {
                                          default: withCtx(() => [
                                            createVNode("span", { class: "text-body-1 font-weight-bold text-primary" }, toDisplayString((s.name || s.user_name || "?").charAt(0).toUpperCase()), 1)
                                          ]),
                                          _: 2
                                        }, 1024),
                                        createVNode("span", { class: "text-body-1 font-weight-medium" }, toDisplayString(s.name || s.user_name), 1)
                                      ])
                                    ]),
                                    createVNode("td", { class: "text-body-2" }, toDisplayString(s.email || s.user_email), 1),
                                    createVNode("td", null, [
                                      createVNode(VChip, {
                                        size: "small",
                                        color: roleColor(s.role || s.user_role),
                                        variant: "tonal",
                                        label: ""
                                      }, {
                                        default: withCtx(() => [
                                          createTextVNode(toDisplayString(formatRole(s.role || s.user_role)), 1)
                                        ]),
                                        _: 2
                                      }, 1032, ["color"])
                                    ]),
                                    createVNode("td", { class: "text-body-2 text-medium-emphasis" }, toDisplayString(s.branch || "—"), 1),
                                    createVNode("td", { class: "text-body-2 text-medium-emphasis" }, toDisplayString(formatDateTime(s.last_login)), 1),
                                    createVNode("td", { class: "text-body-2 text-medium-emphasis" }, toDisplayString(formatDateTime(s.session_expires)), 1)
                                  ]);
                                }), 128))
                              ])
                            ]),
                            _: 1
                          })
                        ]),
                        _: 1
                      })) : (openBlock(), createBlock("div", {
                        key: 2,
                        class: "sec-empty"
                      }, [
                        createVNode("div", { class: "sec-empty__icon sec-empty__icon--neutral" }, [
                          createVNode(VIcon, { size: "32" }, {
                            default: withCtx(() => [
                              createTextVNode("mdi-account-clock")
                            ]),
                            _: 1
                          })
                        ]),
                        createVNode("p", { class: "sec-empty__title" }, "No Active Sessions"),
                        createVNode("p", { class: "sec-empty__sub" }, "No users are currently logged in.")
                      ]))
                    ], 64)) : createCommentVNode("", true),
                    unref(activeTab) === "settings" ? (openBlock(), createBlock(VCard, {
                      key: 4,
                      flat: "",
                      border: "",
                      rounded: "xl",
                      "max-width": "640",
                      class: "sec-settings-card"
                    }, {
                      default: withCtx(() => [
                        createVNode("div", { class: "sec-settings__header" }, [
                          createVNode("div", { class: "sec-settings__icon" }, [
                            createVNode(VIcon, {
                              size: "24",
                              color: "primary"
                            }, {
                              default: withCtx(() => [
                                createTextVNode("mdi-shield-lock")
                              ]),
                              _: 1
                            })
                          ]),
                          createVNode("div", null, [
                            createVNode("p", { class: "text-h6 font-weight-bold mb-0" }, "Login Security Policy"),
                            createVNode("p", { class: "text-body-2 text-medium-emphasis mb-0" }, " Configure brute-force login protection ")
                          ])
                        ]),
                        createVNode(VDivider, { class: "mb-5" }),
                        createVNode(VAlert, {
                          type: "info",
                          variant: "tonal",
                          density: "compact",
                          rounded: "lg",
                          class: "mb-5"
                        }, {
                          prepend: withCtx(() => [
                            createVNode(VIcon, { size: "18" }, {
                              default: withCtx(() => [
                                createTextVNode("mdi-information-outline")
                              ]),
                              _: 1
                            })
                          ]),
                          default: withCtx(() => [
                            createTextVNode(" Changes apply immediately at runtime. They reset when the server restarts unless also updated in "),
                            createVNode("code", { class: "mx-1" }, "settings.py"),
                            createTextVNode(". ")
                          ]),
                          _: 1
                        }),
                        createVNode("div", { class: "sec-setting-row" }, [
                          createVNode("div", { class: "sec-setting-row__icon sec-setting-row__icon--primary" }, [
                            createVNode(VIcon, {
                              size: "20",
                              color: "primary"
                            }, {
                              default: withCtx(() => [
                                createTextVNode("mdi-counter")
                              ]),
                              _: 1
                            })
                          ]),
                          createVNode("div", { class: "sec-setting-row__body" }, [
                            createVNode("p", { class: "sec-setting-row__title" }, "Failure Limit"),
                            createVNode("p", { class: "sec-setting-row__desc" }, " Number of failed login attempts before a user/IP is locked out. ")
                          ]),
                          createVNode("div", { class: "sec-setting-row__control" }, [
                            createVNode(VTextField, {
                              modelValue: unref(settingsForm).failure_limit,
                              "onUpdate:modelValue": ($event) => unref(settingsForm).failure_limit = $event,
                              modelModifiers: { number: true },
                              type: "number",
                              variant: "outlined",
                              density: "compact",
                              min: "1",
                              max: "100",
                              "hide-details": "",
                              rounded: "lg",
                              style: { "width": "120px" }
                            }, null, 8, ["modelValue", "onUpdate:modelValue"])
                          ])
                        ]),
                        createVNode(VDivider, { class: "my-1" }),
                        createVNode("div", { class: "sec-setting-row" }, [
                          createVNode("div", { class: "sec-setting-row__icon sec-setting-row__icon--info" }, [
                            createVNode(VIcon, {
                              size: "20",
                              color: "info"
                            }, {
                              default: withCtx(() => [
                                createTextVNode("mdi-timer-outline")
                              ]),
                              _: 1
                            })
                          ]),
                          createVNode("div", { class: "sec-setting-row__body" }, [
                            createVNode("p", { class: "sec-setting-row__title" }, "Cool-off Time (hours)"),
                            createVNode("p", { class: "sec-setting-row__desc" }, " Hours before a locked-out user/IP is automatically unlocked. ")
                          ]),
                          createVNode("div", { class: "sec-setting-row__control" }, [
                            createVNode(VTextField, {
                              modelValue: unref(settingsForm).cooloff_time_hours,
                              "onUpdate:modelValue": ($event) => unref(settingsForm).cooloff_time_hours = $event,
                              modelModifiers: { number: true },
                              type: "number",
                              variant: "outlined",
                              density: "compact",
                              min: "0",
                              step: "0.5",
                              "hide-details": "",
                              rounded: "lg",
                              style: { "width": "120px" }
                            }, null, 8, ["modelValue", "onUpdate:modelValue"])
                          ])
                        ]),
                        createVNode(VDivider, { class: "my-1" }),
                        createVNode("div", { class: "sec-setting-row" }, [
                          createVNode("div", { class: "sec-setting-row__icon sec-setting-row__icon--success" }, [
                            createVNode(VIcon, {
                              size: "20",
                              color: "success"
                            }, {
                              default: withCtx(() => [
                                createTextVNode("mdi-refresh-circle")
                              ]),
                              _: 1
                            })
                          ]),
                          createVNode("div", { class: "sec-setting-row__body" }, [
                            createVNode("p", { class: "sec-setting-row__title" }, "Reset on Successful Login"),
                            createVNode("p", { class: "sec-setting-row__desc" }, " If on, a successful login resets the failure counter for that user/IP. ")
                          ]),
                          createVNode("div", { class: "sec-setting-row__control" }, [
                            createVNode(VSwitch, {
                              modelValue: unref(settingsForm).reset_on_success,
                              "onUpdate:modelValue": ($event) => unref(settingsForm).reset_on_success = $event,
                              color: "primary",
                              density: "compact",
                              "hide-details": "",
                              inset: ""
                            }, null, 8, ["modelValue", "onUpdate:modelValue"])
                          ])
                        ]),
                        createVNode(VDivider, { class: "mt-3 mb-4" }),
                        createVNode("div", { class: "d-flex justify-end ga-3" }, [
                          createVNode(VBtn, {
                            variant: "text",
                            rounded: "lg",
                            onClick: loadSettings
                          }, {
                            default: withCtx(() => [
                              createTextVNode("Reset")
                            ]),
                            _: 1
                          }),
                          createVNode(VBtn, {
                            variant: "flat",
                            color: "primary",
                            "prepend-icon": "mdi-content-save",
                            loading: unref(savingSettings),
                            rounded: "lg",
                            onClick: saveSettings
                          }, {
                            default: withCtx(() => [
                              createTextVNode(" Save Changes ")
                            ]),
                            _: 1
                          }, 8, ["loading"])
                        ])
                      ]),
                      _: 1
                    })) : createCommentVNode("", true)
                  ]))
                ]),
                _: 1
              }),
              createVNode(VDialog, {
                modelValue: unref(resetAllDialog),
                "onUpdate:modelValue": ($event) => isRef(resetAllDialog) ? resetAllDialog.value = $event : null,
                "max-width": "460"
              }, {
                default: withCtx(() => [
                  createVNode(VCard, {
                    rounded: "xl",
                    class: "sec-dialog"
                  }, {
                    default: withCtx(() => [
                      createVNode("div", { class: "sec-dialog__header" }, [
                        createVNode("div", { class: "sec-dialog__icon sec-dialog__icon--warning" }, [
                          createVNode(VIcon, {
                            size: "24",
                            color: "warning"
                          }, {
                            default: withCtx(() => [
                              createTextVNode("mdi-alert-circle")
                            ]),
                            _: 1
                          })
                        ]),
                        createVNode(VBtn, {
                          icon: "mdi-close",
                          variant: "text",
                          size: "x-small",
                          class: "sec-dialog__close",
                          onClick: ($event) => resetAllDialog.value = false
                        }, null, 8, ["onClick"])
                      ]),
                      createVNode("h3", { class: "sec-dialog__title" }, "Unlock All?"),
                      createVNode("p", { class: "sec-dialog__body" }, " This will delete ALL " + toDisplayString(unref(overview).total_attempts) + " access attempt(s) and unlock every locked IP/user. This action cannot be undone. ", 1),
                      createVNode("div", { class: "sec-dialog__actions" }, [
                        createVNode(VBtn, {
                          variant: "text",
                          rounded: "lg",
                          onClick: ($event) => resetAllDialog.value = false
                        }, {
                          default: withCtx(() => [
                            createTextVNode("Cancel")
                          ]),
                          _: 1
                        }, 8, ["onClick"]),
                        createVNode(VBtn, {
                          color: "warning",
                          variant: "flat",
                          loading: unref(resetting),
                          rounded: "lg",
                          "prepend-icon": "mdi-lock-open-variant",
                          onClick: resetAll
                        }, {
                          default: withCtx(() => [
                            createTextVNode(" Unlock All ")
                          ]),
                          _: 1
                        }, 8, ["loading"])
                      ])
                    ]),
                    _: 1
                  })
                ]),
                _: 1
              }, 8, ["modelValue", "onUpdate:modelValue"]),
              createVNode(VDialog, {
                modelValue: unref(unlockUserDialog),
                "onUpdate:modelValue": ($event) => isRef(unlockUserDialog) ? unlockUserDialog.value = $event : null,
                "max-width": "500"
              }, {
                default: withCtx(() => [
                  createVNode(VCard, {
                    rounded: "xl",
                    class: "sec-dialog"
                  }, {
                    default: withCtx(() => [
                      createVNode("div", { class: "sec-dialog__header" }, [
                        createVNode("div", { class: "sec-dialog__icon sec-dialog__icon--success" }, [
                          createVNode(VIcon, {
                            size: "24",
                            color: "success"
                          }, {
                            default: withCtx(() => [
                              createTextVNode("mdi-lock-open-variant")
                            ]),
                            _: 1
                          })
                        ]),
                        createVNode(VBtn, {
                          icon: "mdi-close",
                          variant: "text",
                          size: "x-small",
                          class: "sec-dialog__close",
                          onClick: ($event) => unlockUserDialog.value = false
                        }, null, 8, ["onClick"])
                      ]),
                      createVNode("h3", { class: "sec-dialog__title" }, "Unlock User by Email/IP"),
                      createVNode("p", { class: "sec-dialog__body mb-4" }, " Enter the username/email or IP address to unlock. "),
                      createVNode(VTextField, {
                        modelValue: unref(unlockForm).username,
                        "onUpdate:modelValue": ($event) => unref(unlockForm).username = $event,
                        label: "Username / Email",
                        variant: "outlined",
                        density: "compact",
                        "prepend-inner-icon": "mdi-account",
                        "hide-details": "",
                        rounded: "lg",
                        class: "mb-3"
                      }, null, 8, ["modelValue", "onUpdate:modelValue"]),
                      createVNode(VTextField, {
                        modelValue: unref(unlockForm).ip,
                        "onUpdate:modelValue": ($event) => unref(unlockForm).ip = $event,
                        label: "IP Address (optional)",
                        variant: "outlined",
                        density: "compact",
                        "prepend-inner-icon": "mdi-ip",
                        "hide-details": "",
                        rounded: "lg"
                      }, null, 8, ["modelValue", "onUpdate:modelValue"]),
                      createVNode("div", { class: "sec-dialog__actions" }, [
                        createVNode(VBtn, {
                          variant: "text",
                          rounded: "lg",
                          onClick: ($event) => unlockUserDialog.value = false
                        }, {
                          default: withCtx(() => [
                            createTextVNode("Cancel")
                          ]),
                          _: 1
                        }, 8, ["onClick"]),
                        createVNode(VBtn, {
                          color: "success",
                          variant: "flat",
                          loading: unref(unlocking),
                          rounded: "lg",
                          "prepend-icon": "mdi-lock-open-variant",
                          onClick: unlockUserOrIp
                        }, {
                          default: withCtx(() => [
                            createTextVNode(" Unlock ")
                          ]),
                          _: 1
                        }, 8, ["loading"])
                      ])
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
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/admin/security/index.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const index = /* @__PURE__ */ _export_sfc(_sfc_main, [["__scopeId", "data-v-4f4f123d"]]);

export { index as default };
//# sourceMappingURL=index-JKYpJEy5.mjs.map
