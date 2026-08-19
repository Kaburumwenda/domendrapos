import "D:/Projects/MY-APPS-2/DomendraPOS/frontend/node_modules/@nuxt/nitro-server/dist/runtime/h3-compat.mjs";
import "vue";
import "../server.mjs";
const intervalError = "[nuxt] `setInterval` should not be used on the server. Consider wrapping it with an `onNuxtReady`, `onBeforeMount` or `onMounted` lifecycle hook, or ensure you only call it in the browser by checking `false`.";
const setInterval = (() => {
  console.error(intervalError);
});
export {
  setInterval as s
};
//# sourceMappingURL=interval-D9ov41Wl.js.map
