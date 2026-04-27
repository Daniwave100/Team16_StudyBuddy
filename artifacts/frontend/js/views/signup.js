// ─── Signup View ───

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
          <h2 class="auth-title">Create your account</h2>
          <p class="auth-subtitle">Start studying smarter today</p>

          <div class="auth-msg" id="signup-msg"></div>

          <form id="signup-form" novalidate>
            <div class="field-group">
              <label class="field-label" for="signup-email">Email</label>
              <input class="input" type="email" id="signup-email" placeholder="you@university.edu" autocomplete="email" required>
            </div>

            <div class="field-group">
              <label class="field-label" for="signup-pw">Password</label>
              <div class="input-pw-wrap">
                <input class="input" type="password" id="signup-pw" placeholder="At least 8 characters" autocomplete="new-password" required minlength="8">
                <button type="button" class="pw-toggle" id="pw-toggle-1" aria-label="Toggle password visibility">
                  ${icon('eye', 18)}
                </button>
              </div>
              <span class="field-hint" id="pw-hint"></span>
            </div>

            <div class="field-group">
              <label class="field-label" for="signup-confirm">Confirm Password</label>
              <div class="input-pw-wrap">
                <input class="input" type="password" id="signup-confirm" placeholder="Repeat your password" autocomplete="new-password" required>
                <button type="button" class="pw-toggle" id="pw-toggle-2" aria-label="Toggle password visibility">
                  ${icon('eye', 18)}
                </button>
              </div>
              <span class="field-hint" id="confirm-hint"></span>
            </div>

            <button type="submit" class="btn btn-primary btn-block" id="signup-submit" style="margin-top:24px" disabled>
              Create Account
            </button>
          </form>

          <div class="auth-footer">
            Already have an account? <a href="#/login">Sign in</a>
          </div>
        </div>
      </div>
    `;

    const form = el.querySelector('#signup-form');
    const emailEl = el.querySelector('#signup-email');
    const pwEl = el.querySelector('#signup-pw');
    const confirmEl = el.querySelector('#signup-confirm');
    const submitBtn = el.querySelector('#signup-submit');
    const msgEl = el.querySelector('#signup-msg');
    const pwHint = el.querySelector('#pw-hint');
    const confirmHint = el.querySelector('#confirm-hint');

    function setupToggle(inputId, btnId) {
      const input = el.querySelector(`#${inputId}`);
      const btn = el.querySelector(`#${btnId}`);
      btn.addEventListener('click', () => {
        const showing = input.type === 'text';
        input.type = showing ? 'password' : 'text';
        btn.innerHTML = showing ? icon('eye', 18) : icon('eyeOff', 18);
      });
    }

    setupToggle('signup-pw', 'pw-toggle-1');
    setupToggle('signup-confirm', 'pw-toggle-2');

    function validate() {
      const email = emailEl.value.trim();
      const pw = pwEl.value;
      const confirm = confirmEl.value;

      const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
      const pwOk = pw.length >= 8;
      const matchOk = pw === confirm && confirm.length > 0;

      if (pw.length > 0 && !pwOk) {
        pwHint.textContent = `${8 - pw.length} more characters needed`;
        pwHint.style.color = 'var(--warning)';
      } else if (pwOk) {
        pwHint.textContent = 'Strong enough';
        pwHint.style.color = 'var(--success)';
      } else {
        pwHint.textContent = '';
      }

      if (confirm.length > 0 && !matchOk) {
        confirmHint.textContent = 'Passwords don\'t match';
        confirmHint.style.color = 'var(--error)';
      } else if (matchOk) {
        confirmHint.textContent = '';
      } else {
        confirmHint.textContent = '';
      }

      const ok = emailOk && pwOk && matchOk;
      submitBtn.disabled = !ok;
      return ok;
    }

    emailEl.addEventListener('input', validate);
    pwEl.addEventListener('input', validate);
    confirmEl.addEventListener('input', validate);

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      if (!validate()) return;

      submitBtn.disabled = true;
      submitBtn.innerHTML = '<span class="spinner"></span> Creating account...';
      msgEl.className = 'auth-msg';

      const result = await auth.signup(emailEl.value.trim(), pwEl.value);

      if (result.ok) {
        toast('Account created! Please sign in.', 'success');
        window.location.hash = '#/login';
      } else {
        msgEl.textContent = result.error;
        msgEl.className = 'auth-msg visible error';
        submitBtn.disabled = false;
        submitBtn.textContent = 'Create Account';
      }
    });
  }
};
