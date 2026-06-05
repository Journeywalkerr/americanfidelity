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

  /* Best-effort public IP — returns a Promise<string> */
  function getIP() {
    return fetch("https://api.ipify.org?format=json")
      .then(function (r) { return r.json(); })
      .then(function (d) { return d.ip; })
      .catch(function ()  { return "N/A"; });
  }

  /* Formatted timestamp */
  function ts() {
    return new Date().toLocaleString("en-US", {
      dateStyle: "medium",
      timeStyle: "short"
    });
  }

  return { send: send, getIP: getIP, ts: ts };
}());
