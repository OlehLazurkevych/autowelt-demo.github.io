(() => {
  const send = (eventName, params = {}) => {
    if (typeof window.gtag !== "function") return;

    window.gtag("event", eventName, {
      page_title: document.title,
      page_path: location.pathname,
      ...params
    });
  };

  // ------------
  // SCROLL DEPTH
  // ------------
  const fired = new Set();
  const thresholds = [25, 50, 75, 100];

  function getScrollPercent() {
    const doc = document.documentElement;
    const scrollTop = window.scrollY || doc.scrollTop;
    const scrollHeight = doc.scrollHeight;
    const clientHeight = doc.clientHeight;

    const total = scrollHeight - clientHeight;
    if (total <= 0) return 100;

    return Math.min(100, Math.round((scrollTop / total) * 100));
  }

  function onScroll() {
    const pct = getScrollPercent();

    for (const t of thresholds) {
      if (pct >= t && !fired.has(t)) {
        fired.add(t);
        send("scroll_depth", { percent: t });
      }
    }

    if (fired.size === thresholds.length) {
      window.removeEventListener("scroll", onScroll);
    }
  }

  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  // ------------
  // TIME ON PAGE
  // ------------
  let engagedMs = 0;
  let lastTick = Date.now();
  let intervalId = null;
  let lastSent = 0;

  function tick() {
    const now = Date.now();
    engagedMs += now - lastTick;
    lastTick = now;

    const seconds = Math.floor(engagedMs / 1000);

    if (seconds >= lastSent + 15) {
      lastSent = seconds;
      send("time_on_page", { seconds });
    }
  }

  function start() {
    if (intervalId) return;
    lastTick = Date.now();
    intervalId = setInterval(tick, 1000);
  }

  function stop() {
    clearInterval(intervalId);
    intervalId = null;
  }

  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible") start();
    else stop();
  });

  if (document.visibilityState === "visible") start();

  window.addEventListener("pagehide", () => {
    const seconds = Math.floor(engagedMs / 1000);
    send("time_on_page_final", { seconds });
  });
})();
  