"use strict";
const target = document.querySelector("#target");
const launchButton = document.querySelector("#launch");
const statusBox = document.querySelector("#status");
let run = null;
function status(kind, title, detail) {
  statusBox.hidden = false;
  statusBox.dataset.kind = kind;
  document.querySelector("#status-title").textContent = title;
  document.querySelector("#status-detail").textContent = detail;
}
function cancel() {
  if (run) { clearTimeout(run.timer); clearTimeout(run.timeout); }
  run = null;
  launchButton.disabled = false;
}
function launch() {
  cancel();
  let url;
  try { url = new URL(target.value.trim()); } catch {
    status("warn", "Invalid URL", "Enter a full URL such as https://example.com."); return;
  }
  if (!["https:", "http:"].includes(url.protocol) || url.username || url.password) {
    status("warn", "Unsupported URL", "Use an HTTP or HTTPS URL without embedded credentials."); return;
  }
  if (url.origin === location.origin) {
    status("warn", "Use a different origin", "A same-origin target cannot demonstrate cross-origin opener isolation."); return;
  }
  const token = crypto.randomUUID();
  const landing = new URL("login.html", location.href);
  landing.hash = token;
  let popup;
  try { popup = window.open(url.href, "coop-" + token); } catch {
    status("warn", "Window could not open", "Press Launch test again after checking browser popup permissions."); return;
  }
  if (!popup) {
    status("warn", "Popup blocked", "Allow popups for this page, then press Launch test again."); return;
  }
  const current = { popup, token, landing: landing.href };
  run = current;
  launchButton.disabled = true;
  status("info", "Target opened", "Waiting five seconds before attempting navigation. Keep the target tab open.");
  current.timer = setTimeout(() => {
    if (run !== current) return;
    try {
      if (popup.closed) {
        status("warn", "Window unavailable — inconclusive", "The tab was closed or its handle was severed. COOP isolation is one possible cause; inspect the target response headers to verify.");
        cancel(); return;
      }
      popup.location.href = current.landing;
      status("info", "Navigation requested", "Waiting for the confirmation page. A navigation request alone does not confirm a redirect.");
      current.timeout = setTimeout(() => {
        if (run !== current) return;
        status("warn", "No confirmation — inconclusive", "The landing page did not report back. Browser restrictions, target loading, or opener isolation may have prevented confirmation.");
        cancel();
      }, 10000);
    } catch {
      status("warn", "Navigation blocked — inconclusive", "The browser rejected navigation. Check the target’s COOP headers and browser console to determine the cause.");
      cancel();
    }
  }, 5000);
}
window.addEventListener("message", event => {
  if (!run || event.origin !== location.origin || event.source !== run.popup ||
      event.data?.type !== "coop-landing" || event.data.token !== run.token) return;
  status("confirmed", "Redirect confirmed", "The opened tab reached the confirmation page through the retained handle. This demonstrates navigation access for this run, not a complete vulnerability assessment.");
  cancel();
});
document.querySelector("#test").addEventListener("submit", event => { event.preventDefault(); launch(); });
document.querySelector("#reset").addEventListener("click", () => { cancel(); statusBox.hidden = true; target.focus(); });
let theme;
try { theme = localStorage.getItem("coop-theme"); } catch {}
document.documentElement.dataset.theme = theme || (matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark");
document.querySelector("#theme").addEventListener("click", () => {
  const value = document.documentElement.dataset.theme === "dark" ? "light" : "dark";
  document.documentElement.dataset.theme = value;
  try { localStorage.setItem("coop-theme", value); } catch {}
});
window.addEventListener("pagehide", cancel);
const initial = new URLSearchParams(location.search).get("target");
if (initial) { target.value = initial; launch(); }
