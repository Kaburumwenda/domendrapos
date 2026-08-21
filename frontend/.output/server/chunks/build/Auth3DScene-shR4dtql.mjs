import { defineComponent, ref, computed, mergeProps, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderStyle } from 'vue/server-renderer';
import { ac as useState } from './server.mjs';
import { _ as _export_sfc } from './_plugin-vue_export-helper-1tPrXgE0.mjs';

const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "Auth3DScene",
  __ssrInlineRender: true,
  setup(__props) {
    const sceneEl = ref(null);
    const tx = useState("auth3d-tx", () => 0);
    const ty = useState("auth3d-ty", () => 0);
    const rotX = computed(() => `${(-ty.value * 14).toFixed(2)}deg`);
    const rotY = computed(() => `${(tx.value * 18).toFixed(2)}deg`);
    function depthStyle(layer) {
      const f = 0.35 + layer * 0.22;
      return {
        transform: `translate3d(${(tx.value * 26 * f).toFixed(2)}px, ${(ty.value * 26 * f).toFixed(2)}px, ${(layer * 30).toFixed(0)}px) rotateX(${(parseFloat(rotX.value) * f).toFixed(2)}deg) rotateY(${(parseFloat(rotY.value) * f).toFixed(2)}deg)`
      };
    }
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<div${ssrRenderAttrs(mergeProps({
        ref_key: "sceneEl",
        ref: sceneEl,
        class: "auth3d-root",
        "aria-hidden": "true"
      }, _attrs))} data-v-e6c3cda5><div class="layer-grain" data-v-e6c3cda5></div><div class="layer-grid" style="${ssrRenderStyle(depthStyle(0))}" data-v-e6c3cda5></div><div class="orbits" style="${ssrRenderStyle(depthStyle(1))}" data-v-e6c3cda5><div class="orbit l1" data-v-e6c3cda5></div><div class="orbit l2" data-v-e6c3cda5></div><div class="orbit l3" data-v-e6c3cda5></div></div><div class="floats" style="${ssrRenderStyle(depthStyle(2))}" data-v-e6c3cda5><div class="shape cube" style="${ssrRenderStyle({ "--x": "-22%", "--y": "-18%", "--z": "110", "--delay": "0s", "--dur": "14s" })}" data-v-e6c3cda5><div class="face fx" data-v-e6c3cda5><div class="cube-knot" data-v-e6c3cda5></div></div><div class="face fx back" data-v-e6c3cda5></div><div class="face fy" data-v-e6c3cda5></div><div class="face fy back" data-v-e6c3cda5></div><div class="face fz" data-v-e6c3cda5></div><div class="face fz back" data-v-e6c3cda5></div></div><div class="shape pyramid" style="${ssrRenderStyle({ "--x": "26%", "--y": "-8%", "--z": "90", "--delay": "-3s", "--dur": "16s" })}" data-v-e6c3cda5><div class="py-face px1" data-v-e6c3cda5></div><div class="py-face px2" data-v-e6c3cda5></div><div class="py-face px3" data-v-e6c3cda5></div><div class="py-face px4" data-v-e6c3cda5></div></div><div class="shape torus" style="${ssrRenderStyle({ "--x": "18%", "--y": "24%", "--z": "70", "--delay": "-6s", "--dur": "20s" })}" data-v-e6c3cda5></div><div class="shape diamond" style="${ssrRenderStyle({ "--x": "-28%", "--y": "22%", "--z": "130", "--delay": "-1.5s", "--dur": "13s" })}" data-v-e6c3cda5></div><div class="shape ring" style="${ssrRenderStyle({ "--x": "5%", "--y": "-32%", "--z": "150", "--delay": "-9s", "--dur": "22s" })}" data-v-e6c3cda5></div><div class="shape star" style="${ssrRenderStyle({ "--x": "-10%", "--y": "8%", "--z": "60", "--delay": "-4s", "--dur": "18s" })}" data-v-e6c3cda5></div></div><div class="hero-mark" style="${ssrRenderStyle(depthStyle(3))}" data-v-e6c3cda5><div class="hm-icon" data-v-e6c3cda5><div class="hm-core" data-v-e6c3cda5></div><div class="hm-bar" data-v-e6c3cda5></div></div><div class="hm-text" data-v-e6c3cda5><span class="hm-line" data-v-e6c3cda5>POS</span><span class="hm-line sub" data-v-e6c3cda5>.cloud</span></div></div><div class="vignette" data-v-e6c3cda5></div></div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/Auth3DScene.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const __nuxt_component_0 = /* @__PURE__ */ Object.assign(_export_sfc(_sfc_main, [["__scopeId", "data-v-e6c3cda5"]]), { __name: "Auth3DScene" });

export { __nuxt_component_0 as _ };
//# sourceMappingURL=Auth3DScene-shR4dtql.mjs.map
