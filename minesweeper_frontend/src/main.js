/* global console */
import "./style.css";
import App from "./App.svelte";

console.log("[MAIN.JS_START]"); // Mount marker

let app;
try {
  app = new App({
    target: document.getElementById("app"),
  });
  console.log("[MAIN.JS_MOUNTED]");
} catch (err) {
  console.error("[MAIN.JS_ERROR]", err);
  const el = document.getElementById("app");
  if (el) {
    el.innerHTML =
      "<pre style='color:red;font-size:1.2em'>Svelte mount error:<br>" +
      (err?.message ? err.message : String(err)) +
      "</pre>";
  }
}

// Allow import of app (default export)
export default app;
