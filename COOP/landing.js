"use strict";
if (window.opener && location.hash.length > 1) {
  window.opener.postMessage({ type: "coop-landing", token: location.hash.slice(1) }, location.origin);
}

let savedTheme;
try { savedTheme = localStorage.getItem("coop-theme"); } catch {}
document.documentElement.dataset.theme = savedTheme || (matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark");
document.querySelector("#demo-login").addEventListener("submit", event => {
  event.preventDefault();
  event.currentTarget.reset();
  const feedback = document.querySelector("#demo-feedback");
  feedback.textContent = "Demo complete. No details were sent or saved. Return to the checker to review the redirect result.";
  feedback.hidden = false;
});
