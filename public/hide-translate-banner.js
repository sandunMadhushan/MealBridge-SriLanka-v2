// Hide Google Translate banner immediately
(function () {
  "use strict";

  function hideBanner() {
    const selectors = [
      ".goog-te-banner-frame",
      ".goog-te-ftab",
      "iframe.goog-te-banner-frame",
      'iframe[id*="goog-te-banner"]',
      'iframe[src*="translate.google"]',
      ".skiptranslate iframe",
      "body > .skiptranslate",
      "body > iframe.goog-te-banner-frame",
    ];

    selectors.forEach((selector) => {
      const elements = document.querySelectorAll(selector);
      elements.forEach((element) => {
        element.style.display = "none";
        element.style.visibility = "hidden";
        element.style.position = "absolute";
        element.style.top = "-9999px";
        element.style.left = "-9999px";
        element.style.width = "0";
        element.style.height = "0";
        element.style.opacity = "0";
        element.style.zIndex = "-9999";
      });
    });

    // Reset body positioning
    document.body.style.top = "0";
    document.body.style.marginTop = "0";
    document.body.style.position = "relative";
    document.documentElement.style.top = "0";
  }

  // Hide immediately
  hideBanner();

  // Hide on DOM changes
  const observer = new MutationObserver(hideBanner);
  observer.observe(document.body, {
    childList: true,
    subtree: true,
  });

  // Hide periodically as backup
  setInterval(hideBanner, 1000);
})();
