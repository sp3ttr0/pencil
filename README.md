# Pencil

## COOP opener isolation checker

Open `COOP/index.html` through an HTTP server or GitHub Pages. The checker accepts a target URL, opens a new tab, waits five seconds, and attempts to navigate it to the bundled `COOP/login.html` confirmation page. No login form or credential collection is included.

Example hosted path: `/pencil/COOP/?target=https%3A%2F%2Fexample.com`. Query targets attempt launch automatically; if blocked, press Launch test. Reset cancels pending checks without closing target tabs.

Confirmation requires a message from the exact opened window, matching the checker origin and per-run token. Closed/severed handles, exceptions, and missing confirmations are inconclusive. This is a browser behavior demonstration, not a response-header scanner or proof of exploitability. Targets must be on a different origin from the checker. Slow target loads can affect results; verify final response headers separately.

The interface and five-second workflow were inspired by https://evanricafort.com/tools/coop/. The implementation is self-contained and has no external scripts, fonts, or analytics. Theme preference is stored locally in the browser.

For authorized security testing.
