(() => {
  document.addEventListener("click", (e) => {
    // Google Analytics
    gtag('event','car_page_back_button_click');

    const a = e.target.closest("a.backLink");
    if (!a) return;

    // If user has history, go back (keeps scroll position)
    if (window.history.length > 1) {
      e.preventDefault();
      window.history.back();
    }
    // else: allow normal navigation via href
  });
})();
