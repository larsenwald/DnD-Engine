/*
 * Super‑simple toast helper
 * usage: showToast(message [, selector = "body" [, maxVisible = Infinity]])
 * --------------------------------------------------------
 */
(function (global) {
  /** Duration of the CSS animation (keep in sync with @keyframes) */
  const TOAST_MS = 3000;

  function showToast(message, selector = "body", maxVisible = Infinity) {
    /* 1. Decide where the toast lives */
    const host = document.querySelector(selector) || document.body;

    /* 2. Inject stylesheet once */
    if (!document.getElementById("simple‑toast‑style")) {
      const style = document.createElement("style");
      style.id = "simple‑toast‑style";
      style.textContent = `
.simple‑toast-box { position: absolute; right: 0; bottom: 0; translate: 0 -100%; pointer-events: none; }
.simple‑toast      { 
  padding: 8px 14px;
  background: rgba(0,0,0,.85);
  color: #fff;
  border-radius: 4px;
  font-family: system-ui, sans-serif;
  font-size: .875rem;
  opacity: 0;
  animation: toast-fade ${TOAST_MS}ms ease forwards;
}
@keyframes toast-fade {
  0%   { opacity: 0; transform: translateY(20px); }
  10%  { opacity: 1; transform: translateY(0);    }
  90%  { opacity: 1; transform: translateY(0);    }
  100% { opacity: 0; transform: translateY(-20px);}
}`;
      document.head.appendChild(style);
    }

    /* 3. Make sure host can position children */
    if (getComputedStyle(host).position === "static") {
      host.style.position = host === document.body ? "fixed" : "relative";
    }

    /* 4. Create / reuse wrapper */
    let box = host.querySelector(".simple‑toast-box");
    if (!box) {
      box = document.createElement("div");
      box.className = "simple‑toast-box";
      if (host === document.body) box.style.position = "fixed";
      host.appendChild(box);
    }

    /* 5. Enforce visible‑toast cap (remove oldest first) */
    while (box.children.length >= maxVisible) {
      box.firstElementChild?.remove();
    }

    /* 6. Build the toast */
    const toast = document.createElement("div");
    toast.className = "simple‑toast";
    toast.textContent = message;
    box.appendChild(toast);

    /* 7. Auto‑cleanup */
    toast.addEventListener("animationend", () => toast.remove(), { once: true });
    /*  Fallback in case animation never fires (e.g. host is display:none) */
    setTimeout(() => toast.isConnected && toast.remove(), TOAST_MS + 100);
  }

  /* 8. Expose globally */
  global.showToast = showToast;
})(window);
