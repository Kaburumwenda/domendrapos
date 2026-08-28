import { E as useRoute, D as useToast, a as VIcon, c as VBtn, y as navigateTo, Y as VForm, v as VTextField, d as VAlert, A as useRuntimeConfig, _ as _export_sfc } from "../server.mjs";
import { defineComponent, computed, reactive, ref, mergeProps, withCtx, createTextVNode, unref, toDisplayString, createVNode, openBlock, createBlock, createCommentVNode, useSSRContext } from "vue";
import { ssrRenderAttrs, ssrRenderComponent, ssrInterpolate } from "vue/server-renderer";
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
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "reset-password",
  __ssrInlineRender: true,
  setup(__props) {
    const config = useRuntimeConfig();
    const route = useRoute();
    const toast = useToast();
    const token = computed(() => route.query.token || "");
    const validToken = computed(() => !!token.value);
    const form = reactive({ password: "", confirmPassword: "" });
    const loading = ref(false);
    const error = ref("");
    const success = ref(false);
    const showPassword = ref(false);
    async function handleSubmit() {
      if (form.password !== form.confirmPassword) {
        error.value = "Passwords do not match.";
        return;
      }
      loading.value = true;
      error.value = "";
      try {
        await $fetch(`${config.public.apiBase}/auth/reset-password/`, {
          method: "POST",
          body: { token: token.value, password: form.password }
        });
        success.value = true;
        toast.success("Password reset successfully!");
      } catch (e) {
        const msg = e?.data?.detail || e?.data?.password?.[0] || "Failed to reset password. Please try again.";
        error.value = msg;
      } finally {
        loading.value = false;
      }
    }
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "login-content" }, _attrs))} data-v-3b3f4784><div class="d-flex align-center ga-3 mb-6" data-v-3b3f4784><div class="d-flex align-center justify-center logo-badge" data-v-3b3f4784>`);
      _push(ssrRenderComponent(VIcon, {
        size: "28",
        color: "white"
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`mdi-monitor`);
          } else {
            return [
              createTextVNode("mdi-monitor")
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`</div><div data-v-3b3f4784><div class="text-h5 font-weight-bold brand-title" data-v-3b3f4784>DomendraPOS</div><div class="text-caption text-muted" data-v-3b3f4784>Set a New Password</div></div></div>`);
      if (unref(success)) {
        _push(`<div class="text-center py-8" data-v-3b3f4784>`);
        _push(ssrRenderComponent(VIcon, {
          size: "56",
          color: "success",
          class: "mb-4"
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`mdi-check-circle-outline`);
            } else {
              return [
                createTextVNode("mdi-check-circle-outline")
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(`<h3 class="text-h6 font-weight-bold brand-title mb-2" data-v-3b3f4784>Password Reset!</h3><p class="text-body-2 text-muted mb-6" data-v-3b3f4784> Your password has been reset successfully. You can now log in with your new password. </p>`);
        _push(ssrRenderComponent(VBtn, {
          variant: "tonal",
          color: "primary",
          rounded: "lg",
          "prepend-icon": "mdi-login",
          onClick: ($event) => ("navigateTo" in _ctx ? _ctx.navigateTo : unref(navigateTo))("/login")
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(` Go to Login `);
            } else {
              return [
                createTextVNode(" Go to Login ")
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(`</div>`);
      } else if (!unref(validToken)) {
        _push(`<div class="text-center py-8" data-v-3b3f4784>`);
        _push(ssrRenderComponent(VIcon, {
          size: "56",
          color: "error",
          class: "mb-4"
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
        _push(`<h3 class="text-h6 font-weight-bold brand-title mb-2" data-v-3b3f4784>Invalid Link</h3><p class="text-body-2 text-muted mb-6" data-v-3b3f4784> This password reset link is invalid or has expired. </p>`);
        _push(ssrRenderComponent(VBtn, {
          variant: "tonal",
          color: "primary",
          rounded: "lg",
          "prepend-icon": "mdi-refresh",
          onClick: ($event) => ("navigateTo" in _ctx ? _ctx.navigateTo : unref(navigateTo))("/forgot-password")
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(` Request New Link `);
            } else {
              return [
                createTextVNode(" Request New Link ")
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(`</div>`);
      } else {
        _push(`<div data-v-3b3f4784><div class="mb-6" data-v-3b3f4784><h2 class="text-h5 font-weight-semibold brand-title" data-v-3b3f4784>Reset Password</h2><p class="text-body-2 text-muted mt-1" data-v-3b3f4784>Enter your new password below.</p></div>`);
        _push(ssrRenderComponent(VForm, { onSubmit: handleSubmit }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(ssrRenderComponent(VTextField, {
                modelValue: unref(form).password,
                "onUpdate:modelValue": ($event) => unref(form).password = $event,
                label: "New password",
                type: unref(showPassword) ? "text" : "password",
                variant: "outlined",
                density: "comfortable",
                placeholder: "Enter your new password",
                "prepend-inner-icon": "mdi-lock-outline",
                "append-inner-icon": unref(showPassword) ? "mdi-eye-off-outline" : "mdi-eye-outline",
                class: "mb-4 field-glass",
                rules: [
                  (v) => !!v || "Password is required",
                  (v) => v.length >= 8 || "Password must be at least 8 characters"
                ],
                "onClick:appendInner": ($event) => showPassword.value = !unref(showPassword)
              }, null, _parent2, _scopeId));
              _push2(ssrRenderComponent(VTextField, {
                modelValue: unref(form).confirmPassword,
                "onUpdate:modelValue": ($event) => unref(form).confirmPassword = $event,
                label: "Confirm new password",
                type: unref(showPassword) ? "text" : "password",
                variant: "outlined",
                density: "comfortable",
                placeholder: "Re-enter your new password",
                "prepend-inner-icon": "mdi-lock-check-outline",
                "append-inner-icon": unref(showPassword) ? "mdi-eye-off-outline" : "mdi-eye-outline",
                class: "mb-4 field-glass",
                rules: [
                  (v) => !!v || "Please confirm your password",
                  (v) => v === unref(form).password || "Passwords do not match"
                ],
                "onClick:appendInner": ($event) => showPassword.value = !unref(showPassword)
              }, null, _parent2, _scopeId));
              if (unref(error)) {
                _push2(ssrRenderComponent(VAlert, {
                  type: "error",
                  variant: "tonal",
                  density: "comfortable",
                  class: "mb-4"
                }, {
                  default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                    if (_push3) {
                      _push3(`${ssrInterpolate(unref(error))}`);
                    } else {
                      return [
                        createTextVNode(toDisplayString(unref(error)), 1)
                      ];
                    }
                  }),
                  _: 1
                }, _parent2, _scopeId));
              } else {
                _push2(`<!---->`);
              }
              _push2(ssrRenderComponent(VBtn, {
                type: "submit",
                block: "",
                size: "large",
                color: "primary",
                loading: unref(loading),
                disabled: unref(loading),
                class: "signin-btn"
              }, {
                default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                  if (_push3) {
                    _push3(` Reset Password `);
                  } else {
                    return [
                      createTextVNode(" Reset Password ")
                    ];
                  }
                }),
                _: 1
              }, _parent2, _scopeId));
            } else {
              return [
                createVNode(VTextField, {
                  modelValue: unref(form).password,
                  "onUpdate:modelValue": ($event) => unref(form).password = $event,
                  label: "New password",
                  type: unref(showPassword) ? "text" : "password",
                  variant: "outlined",
                  density: "comfortable",
                  placeholder: "Enter your new password",
                  "prepend-inner-icon": "mdi-lock-outline",
                  "append-inner-icon": unref(showPassword) ? "mdi-eye-off-outline" : "mdi-eye-outline",
                  class: "mb-4 field-glass",
                  rules: [
                    (v) => !!v || "Password is required",
                    (v) => v.length >= 8 || "Password must be at least 8 characters"
                  ],
                  "onClick:appendInner": ($event) => showPassword.value = !unref(showPassword)
                }, null, 8, ["modelValue", "onUpdate:modelValue", "type", "append-inner-icon", "rules", "onClick:appendInner"]),
                createVNode(VTextField, {
                  modelValue: unref(form).confirmPassword,
                  "onUpdate:modelValue": ($event) => unref(form).confirmPassword = $event,
                  label: "Confirm new password",
                  type: unref(showPassword) ? "text" : "password",
                  variant: "outlined",
                  density: "comfortable",
                  placeholder: "Re-enter your new password",
                  "prepend-inner-icon": "mdi-lock-check-outline",
                  "append-inner-icon": unref(showPassword) ? "mdi-eye-off-outline" : "mdi-eye-outline",
                  class: "mb-4 field-glass",
                  rules: [
                    (v) => !!v || "Please confirm your password",
                    (v) => v === unref(form).password || "Passwords do not match"
                  ],
                  "onClick:appendInner": ($event) => showPassword.value = !unref(showPassword)
                }, null, 8, ["modelValue", "onUpdate:modelValue", "type", "append-inner-icon", "rules", "onClick:appendInner"]),
                unref(error) ? (openBlock(), createBlock(VAlert, {
                  key: 0,
                  type: "error",
                  variant: "tonal",
                  density: "comfortable",
                  class: "mb-4"
                }, {
                  default: withCtx(() => [
                    createTextVNode(toDisplayString(unref(error)), 1)
                  ]),
                  _: 1
                })) : createCommentVNode("", true),
                createVNode(VBtn, {
                  type: "submit",
                  block: "",
                  size: "large",
                  color: "primary",
                  loading: unref(loading),
                  disabled: unref(loading),
                  class: "signin-btn"
                }, {
                  default: withCtx(() => [
                    createTextVNode(" Reset Password ")
                  ]),
                  _: 1
                }, 8, ["loading", "disabled"])
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(`</div>`);
      }
      _push(`</div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/reset-password.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const resetPassword = /* @__PURE__ */ _export_sfc(_sfc_main, [["__scopeId", "data-v-3b3f4784"]]);
export {
  resetPassword as default
};
//# sourceMappingURL=reset-password-DIxz1dU8.js.map
