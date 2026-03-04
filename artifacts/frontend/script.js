function setMsg(el, text, type) {
  if (!el) return;
  el.textContent = text || "";
  el.classList.remove("ok", "error");
  if (type) el.classList.add(type);
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function isValidPassword(pw) {
  return typeof pw === "string" && pw.length >= 8;
}

/* ===== Session helpers ===== */
function setSession(email) {
  localStorage.setItem("isLoggedIn", "true");
  localStorage.setItem("userEmail", email);
}
function clearSession() {
  localStorage.removeItem("isLoggedIn");

}
function isLoggedIn() {
  return localStorage.getItem("isLoggedIn") === "true";
}

/* ===== Password toggle ===== */
function wirePwToggle(inputId, btnId) {
  const input = document.getElementById(inputId);
  const btn = document.getElementById(btnId);
  if (!input || !btn) return;

  btn.addEventListener("click", () => {
    const hidden = input.type === "password";
    input.type = hidden ? "text" : "password";
    btn.textContent = hidden ? "Hide" : "Show";
    btn.setAttribute("aria-pressed", String(hidden));
  });
}


/* ===== Login ===== */
function initLogin() {
  const form = document.getElementById("login-form");
  if (!form) return;

  const msg = document.getElementById("login-msg");
  const emailEl = document.getElementById("login-email");
  const pwEl = document.getElementById("login-password");
  const submitBtn = document.getElementById("login-submit");

  wirePwToggle("login-password", "login-toggle-pw");

  function validateLive(showMsg) {
    const email = (emailEl?.value || "").trim();
    const pw = pwEl?.value || "";

    const ok = isValidEmail(email) && pw.length > 0;
    if (submitBtn) submitBtn.disabled = !ok;

    if (showMsg) {
      if (!email || !pw) setMsg(msg, "Please enter both email and password.", "error");
      else if (!isValidEmail(email)) setMsg(msg, "Please enter a valid email.", "error");
      else setMsg(msg, "", null);
    } else {
      setMsg(msg, "", null);
    }

    return ok;
  }

  emailEl?.addEventListener("input", () => validateLive(false));
  pwEl?.addEventListener("input", () => validateLive(false));
  validateLive(false);

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    if (!validateLive(true)) return;

    const email = emailEl.value.trim();
    const pw = pwEl.value;

    const storedEmail = localStorage.getItem("userEmail");
    const storedPw = localStorage.getItem("userPassword");

    if (email === storedEmail && pw === storedPw) {
      setMsg(msg, "Login successful! Redirecting…", "ok");
      setSession(email);
      window.location.href = "dashboard.html";
    } else {
      setMsg(msg, "Invalid email or password.", "error");
    }
  });
}

/* ===== Signup ===== */
function initSignup() {
  const form = document.getElementById("signup-form");
  if (!form) return;

  const msg = document.getElementById("signup-msg");
  const emailEl = document.getElementById("signup-email");
  const pwEl = document.getElementById("signup-password");
  const confirmEl = document.getElementById("confirm-password");
  const submitBtn = document.getElementById("signup-submit");

  wirePwToggle("signup-password", "signup-toggle-pw");
  wirePwToggle("confirm-password", "signup-toggle-confirm");

  function validateLive(showMsg) {
    const email = (emailEl?.value || "").trim();
    const pw = pwEl?.value || "";
    const confirm = confirmEl?.value || "";

    const ok = isValidEmail(email) && isValidPassword(pw) && pw === confirm;
    if (submitBtn) submitBtn.disabled = !ok;

    if (showMsg) {
      if (!email || !pw || !confirm) setMsg(msg, "Please fill in all fields.", "error");
      else if (!isValidEmail(email)) setMsg(msg, "Please enter a valid email.", "error");
      else if (!isValidPassword(pw)) setMsg(msg, "Password must be at least 8 characters.", "error");
      else if (pw !== confirm) setMsg(msg, "Passwords do not match.", "error");
      else setMsg(msg, "", null);
    } else {
      setMsg(msg, "", null);
    }

    return ok;
  }

  emailEl?.addEventListener("input", () => validateLive(false));
  pwEl?.addEventListener("input", () => validateLive(false));
  confirmEl?.addEventListener("input", () => validateLive(false));
  validateLive(false);

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    if (!validateLive(true)) return;

    const email = emailEl.value.trim();
    const pw = pwEl.value;

    localStorage.setItem("userEmail", email);
    localStorage.setItem("userPassword", pw);

    setMsg(msg, "Signup successful! Redirecting…", "ok");
    setSession(email);
    window.location.href = "dashboard.html";
  });
}

function initDashboard() {
  const onDashboard = document.title.includes("Dashboard");
  if (!onDashboard) return;

  const chip = document.querySelector("#user-chip strong");
  const logoutBtn = document.getElementById("logout-btn");

  const loggedIn = localStorage.getItem("isLoggedIn") === "true";
  const email = localStorage.getItem("userEmail");

  if (!loggedIn) {
    // Guest mode: allow viewing dashboard
    if (chip) chip.textContent = "Guest";
    if (logoutBtn) logoutBtn.style.display = "none";
    return;
  }

  // Logged-in mode
  if (chip && email) chip.textContent = email;

  if (logoutBtn) {
    logoutBtn.style.display = "inline-flex";
    logoutBtn.addEventListener("click", () => {
      localStorage.removeItem("isLoggedIn");
      window.location.href = "index.html";
    });
  }
}

document.addEventListener("DOMContentLoaded", () => {
  initDashboard();
  initLogin();
  initSignup();
});