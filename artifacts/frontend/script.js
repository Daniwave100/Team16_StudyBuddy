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
  localStorage.removeItem("userEmail");

}
function isLoggedIn() {
  return localStorage.getItem("isLoggedIn") === "true";
}

// ==========================
// AUTH API (SUPABASE)
// ==========================
const SUPABASE_URL = "https://dxmvxdpqlxymrmsutwwh.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_Ln49ryeUgDU337oysI9egg_8PY4fpwF";

let supabaseClient = null;


async function getSupabaseClient() {
  if (supabaseClient) return supabaseClient;

  const { createClient } = await import("https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm");
  supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  return supabaseClient;
}

async function authSignup(email, password) {
  try {
    const supabase = await getSupabaseClient();
    const { error } = await supabase.auth.signUp({
      email,
      password
    });

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, error: null };
  } catch (err) {

    return { success: false, error: "Could not connect to Supabase." };
  }
}

async function authLogin(email, password) {
  try {
    const supabase = await getSupabaseClient();
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, error: null };
  } catch (err) {

    return { success: false, error: "Could not connect to Supabase." };
  }
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

    form.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (!validateLive(true)) return;

    const email = emailEl.value.trim();
    const pw = pwEl.value;

    const result = await authLogin(email, pw);

    if (result.success) {
      setMsg(msg, "Login successful! Redirecting…", "ok");
      setSession(email);
      window.location.href = "dashboard.html";
    } else {
      // TODO: When Supabase is connected, use the real auth error message if needed.
      setMsg(msg, result.error || "Login failed.", "error");
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

    form.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (!validateLive(true)) return;

    const email = emailEl.value.trim();
    const pw = pwEl.value;

    const result = await authSignup(email, pw);

    if (result.success) {
      setMsg(msg, "Signup successful! Redirecting…", "ok");
      setSession(email);
      window.location.href = "login.html";
    } else {
      // TODO: When Supabase is connected, use the real auth error message if needed.
      setMsg(msg, result.error || "Signup failed.", "error");
    }
  });
}

async function initDashboard() {
  const onDashboard = document.title.includes("Dashboard");
  if (!onDashboard) return;

  const chip = document.querySelector("#user-chip strong");
  const logoutBtn = document.getElementById("logout-btn");

  try {
    const supabase = await getSupabaseClient();
    const { data, error } = await supabase.auth.getSession();

    if (error || !data?.session) {
      clearSession();
      window.location.href = "login.html";
      return;
    }

    const user = data.session.user;
    const email = user?.email || "User";

    setSession(email);

    if (chip) chip.textContent = email;

    if (logoutBtn) {
      logoutBtn.style.display = "inline-flex";
      logoutBtn.addEventListener("click", async () => {
        await supabase.auth.signOut();
        clearSession();
        window.location.href = "index.html";
      });
    }
  } catch (err) {
    clearSession();
    window.location.href = "login.html";
  }
}

document.addEventListener("DOMContentLoaded", () => {
  initDashboard();
  initLogin();
  initSignup();
});