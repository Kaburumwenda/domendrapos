import { hasInjectionContext, inject } from "vue";
import { useHead as useHead$1, headSymbol } from "D:/Projects/MY-APPS-2/DomendraPOS/frontend/node_modules/@unhead/vue/dist/index.mjs";
import { B as useNuxtApp } from "../server.mjs";
function injectHead(nuxtApp) {
  const nuxt = nuxtApp || useNuxtApp();
  return nuxt.ssrContext?.head || nuxt.runWithContext(() => {
    if (hasInjectionContext()) {
      const head = inject(headSymbol);
      if (!head) {
        throw new Error("[nuxt] [unhead] Missing Unhead instance.");
      }
      return head;
    }
  });
}
function useHead(input, options = {}) {
  const head = options.head || injectHead(options.nuxt);
  return useHead$1(input, { head, ...options });
}
export {
  useHead as u
};
//# sourceMappingURL=composables-BLSQz38p.js.map
