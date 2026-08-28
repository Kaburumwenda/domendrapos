import { defineComponent, computed, unref, ref, watch, onScopeDispose, useSSRContext } from 'file://D:/Projects/MY-APPS-2/DomendraPOS/frontend/node_modules/vue/index.mjs';
import { ssrRenderAttrs, ssrInterpolate } from 'file://D:/Projects/MY-APPS-2/DomendraPOS/frontend/node_modules/vue/server-renderer/index.mjs';
import { u as useFormat } from './useFormat-BvVWDMYe.mjs';

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
const _sfc_main = /* @__PURE__ */ defineComponent({
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
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/CountUpText.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const __nuxt_component_0 = Object.assign(_sfc_main, { __name: "CountUpText" });

export { __nuxt_component_0 as _ };
//# sourceMappingURL=CountUpText-BuFErCq9.mjs.map
