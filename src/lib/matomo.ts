declare global {
    interface Window {
        _paq: Array<string[]>;
    }
}

function initMatomo() {
    // Only track prod builds
    if (!import.meta.env.PROD) return;

    const _paq = (window._paq = window._paq || []);
    const u = import.meta.env.VITE_MATOMO_URL;
    _paq.push(["trackPageView"]);
    _paq.push(["enableLinkTracking"]);
    _paq.push(["setTrackerUrl", u + "matomo.php"]);
    _paq.push(["setSiteId", import.meta.env.VITE_MATOMO_SITE_ID]);
    const d = document,
        g = d.createElement("script"),
        s = d.getElementsByTagName("script")[0];
    g.type = "text/javascript";
    g.async = true;
    g.src = u + "matomo.js";
    s.parentNode.insertBefore(g, s);
}

export default initMatomo;
