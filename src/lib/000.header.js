/**
 * From: https://github.com/allnulled/universal-store
 * Also: https://www.npmjs.com/package/@allnulled/universal-store
 */
(function (factory) {

  const mod = factory();

  if (typeof window !== "undefined") {
    window.UniversalStore = mod;
  }
  if (typeof global !== "undefined") {
    global.UniversalStore = mod;
  }
  if (typeof module !== "undefined") {
    module.exports = mod;
  }

})(function () {