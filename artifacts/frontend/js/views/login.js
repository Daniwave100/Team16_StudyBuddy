// ─── Login View ───

import { auth } from '../auth.js';
import { icon, toast } from '../components.js';

export default {
  mount(el) {
    el.innerHTML = `
      <div class="auth-page">
        <div class="auth-card glass-card">
          <div class="auth-logo">
            ${icon('graduationCap', 28)}
            <span>StudyBuddy</span>
          </div>
          <h2 class="auth-title">Welcome back</h2>
          <p class="auth-subtitle">Sign in to continue studying</p>

          <div class="auth-msg" id="login-msg"></div>

          <form id="login-form" novalidate>
            <div class="field-group">
              <label class="field-label" for="login-email">Email</label>
              <input class="input" type="email" id="login-email" placeholder="you@university.edu" autocomplete="email" required>
            </div>

            <div class="field-group">
              <label class="field-label" for="login-pw">Password</label>
              <div class="input-pw-wrap">
                <input class="input" type="password" id="login-pw" placeholder="Enter your password" autocomplete="current-password" required>
                <button type="button" class="pw-toggle" id="pw-toggle" aria-label="Toggle password visibility">
                  ${icon('eye', 18)}
                </button>
              </div>
            </div>

            <button type="submit" class="btn btn-primary btn-block" id="login-submit" style="margin-top:24px" disabled>
              Sign In
            </button>
          </form>

          <div class="auth-footer">
            Don't have an account? <a href="#/signup">Sign up</a>
          </div>
        </div>
      </div>
    `;

    const form = el.querySelector('#login-form');
    const emailEl = el.querySelector('#login-email');
    const pwEl = el.querySelector('#login-pw');
    const submitBtn = el.querySelector('#login-submit');
    const msgEl = el.querySelector('#login-msg');
    const toggle = el.querySelector('#pw-toggle');

    function validate() {
      const email = emailEl.value.trim();
      const pw = pwEl.value;
      const ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && pw.length > 0;
      submitBtn.disabled = !ok;
      return ok;
    }

    emailEl.addEventListener('input', validate);
    pwEl.addEventListener('input', validate);

    toggle.addEventListener('click', () => {
      const showing = pwEl.type === 'text';
      pwEl.type = showing ? 'password' : 'text';
      toggle.innerHTML = showing ? icon('eye', 18) : icon('eyeOff', 18);
    });

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      if (!validate()) return;

      submitBtn.disabled = true;
      submitBtn.innerHTML = '<span class="spinner"></span> Signing in...';
      msgEl.className = 'auth-msg';

      const result = await auth.login(emailEl.value.trim(), pwEl.value);

      if (result.ok) {
        toast('Welcome back!', 'success');
        window.location.hash = '#/dashboard';
      } else {
        msgEl.textContent = result.error;
        msgEl.className = 'auth-msg visible error';
        submitBtn.disabled = false;
        submitBtn.textContent = 'Sign In';
      }
    });
  }
};
