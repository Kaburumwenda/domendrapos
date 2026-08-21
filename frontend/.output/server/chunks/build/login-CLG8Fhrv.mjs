import { _ as __nuxt_component_0 } from './nuxt-link-CMdK2Lfo.mjs';
import { defineComponent, reactive, ref, mergeProps, withCtx, createTextVNode, unref, toDisplayString, createVNode, openBlock, createBlock, createCommentVNode, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent, ssrInterpolate } from 'vue/server-renderer';
import { u as useAuthStore } from './auth-s-b-v9EY.mjs';
import { M as useToast, d as VIcon, Y as VForm, C as VTextField, X as VCheckbox, h as VAlert, g as VBtn, n as navigateTo } from './server.mjs';
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
import 'pinia';
import './useApi-9yTPzSUF.mjs';
import '../routes/renderer.mjs';
import 'vue-bundle-renderer/runtime';
import 'unhead/server';
import 'devalue';
import 'unhead/utils';
import 'vue-router';
import '@vue/shared';
import 'vue3-apexcharts';

const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "login",
  __ssrInlineRender: true,
  setup(__props) {
    const auth = useAuthStore();
    const toast = useToast();
    const form = reactive({ email: "", password: "", remember: false });
    const loading = ref(false);
    const error = ref("");
    const showPassword = ref(false);
    async function handleLogin() {
      loading.value = true;
      error.value = "";
      try {
        await auth.login(form.email, form.password);
      } catch (e) {
        error.value = e.data?.detail || "Invalid credentials. Please try again.";
        loading.value = false;
        return;
      }
      loading.value = false;
      toast.success("Welcome back!");
      const redirectTo = auth.isSuperAdmin ? "/superadmin" : "/dashboard";
      navigateTo(redirectTo);
    }
    return (_ctx, _push, _parent, _attrs) => {
      const _component_NuxtLink = __nuxt_component_0;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "login-content" }, _attrs))} data-v-3f19cc78><div class="d-flex align-center ga-3 mb-6" data-v-3f19cc78><div class="d-flex align-center justify-center logo-badge" data-v-3f19cc78>`);
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
      _push(`</div><div data-v-3f19cc78><div class="text-h5 font-weight-bold brand-title" data-v-3f19cc78>DomendraPOS</div><div class="text-caption text-muted" data-v-3f19cc78>Sign in to continue</div></div></div><div class="mb-6" data-v-3f19cc78><h2 class="text-h5 font-weight-semibold brand-title" data-v-3f19cc78>Welcome back</h2><p class="text-body-2 text-muted mt-1" data-v-3f19cc78>Sign in to your DomendraPOS account</p></div>`);
      _push(ssrRenderComponent(VForm, { onSubmit: handleLogin }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(ssrRenderComponent(VTextField, {
              modelValue: unref(form).email,
              "onUpdate:modelValue": ($event) => unref(form).email = $event,
              label: "Email address",
              type: "email",
              variant: "outlined",
              density: "comfortable",
              placeholder: "you@example.com",
              "prepend-inner-icon": "mdi-email-outline",
              class: "mb-4 field-glass",
              rules: [(v) => !!v || "Email is required"]
            }, null, _parent2, _scopeId));
            _push2(ssrRenderComponent(VTextField, {
              modelValue: unref(form).password,
              "onUpdate:modelValue": ($event) => unref(form).password = $event,
              label: "Password",
              type: unref(showPassword) ? "text" : "password",
              variant: "outlined",
              density: "comfortable",
              placeholder: "Enter your password",
              "prepend-inner-icon": "mdi-lock-outline",
              "append-inner-icon": unref(showPassword) ? "mdi-eye-off-outline" : "mdi-eye-outline",
              "onClick:appendInner": ($event) => showPassword.value = !unref(showPassword),
              class: "mb-2 field-glass",
              rules: [(v) => !!v || "Password is required"]
            }, null, _parent2, _scopeId));
            _push2(`<div class="d-flex align-center justify-space-between mb-4" data-v-3f19cc78${_scopeId}>`);
            _push2(ssrRenderComponent(VCheckbox, {
              modelValue: unref(form).remember,
              "onUpdate:modelValue": ($event) => unref(form).remember = $event,
              label: "Remember me",
              density: "compact",
              "hide-details": "",
              color: "primary",
              class: "remember-glass"
            }, null, _parent2, _scopeId));
            _push2(`<a href="#" class="text-body-2 text-link text-decoration-none" data-v-3f19cc78${_scopeId}>Forgot password?</a></div>`);
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
                  _push3(` Sign in `);
                } else {
                  return [
                    createTextVNode(" Sign in ")
                  ];
                }
              }),
              _: 1
            }, _parent2, _scopeId));
          } else {
            return [
              createVNode(VTextField, {
                modelValue: unref(form).email,
                "onUpdate:modelValue": ($event) => unref(form).email = $event,
                label: "Email address",
                type: "email",
                variant: "outlined",
                density: "comfortable",
                placeholder: "you@example.com",
                "prepend-inner-icon": "mdi-email-outline",
                class: "mb-4 field-glass",
                rules: [(v) => !!v || "Email is required"]
              }, null, 8, ["modelValue", "onUpdate:modelValue", "rules"]),
              createVNode(VTextField, {
                modelValue: unref(form).password,
                "onUpdate:modelValue": ($event) => unref(form).password = $event,
                label: "Password",
                type: unref(showPassword) ? "text" : "password",
                variant: "outlined",
                density: "comfortable",
                placeholder: "Enter your password",
                "prepend-inner-icon": "mdi-lock-outline",
                "append-inner-icon": unref(showPassword) ? "mdi-eye-off-outline" : "mdi-eye-outline",
                "onClick:appendInner": ($event) => showPassword.value = !unref(showPassword),
                class: "mb-2 field-glass",
                rules: [(v) => !!v || "Password is required"]
              }, null, 8, ["modelValue", "onUpdate:modelValue", "type", "append-inner-icon", "onClick:appendInner", "rules"]),
              createVNode("div", { class: "d-flex align-center justify-space-between mb-4" }, [
                createVNode(VCheckbox, {
                  modelValue: unref(form).remember,
                  "onUpdate:modelValue": ($event) => unref(form).remember = $event,
                  label: "Remember me",
                  density: "compact",
                  "hide-details": "",
                  color: "primary",
                  class: "remember-glass"
                }, null, 8, ["modelValue", "onUpdate:modelValue"]),
                createVNode("a", {
                  href: "#",
                  class: "text-body-2 text-link text-decoration-none"
                }, "Forgot password?")
              ]),
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
                  createTextVNode(" Sign in ")
                ]),
                _: 1
              }, 8, ["loading", "disabled"])
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`<p class="text-center text-body-2 mt-6 text-muted" data-v-3f19cc78> New to DomendraPOS? `);
      _push(ssrRenderComponent(_component_NuxtLink, {
        to: "/signup",
        class: "signup-link"
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`Create a workspace`);
          } else {
            return [
              createTextVNode("Create a workspace")
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`</p></div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/login.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const login = /* @__PURE__ */ _export_sfc(_sfc_main, [["__scopeId", "data-v-3f19cc78"]]);

export { login as default };
//# sourceMappingURL=login-CLG8Fhrv.mjs.map
