// ─── Landing Page ───

import { icon } from '../components.js';

export default {
  mount(el) {
    el.innerHTML = `
      <div class="landing-page">
        <nav class="landing-nav">
          <div class="landing-nav-brand">
            ${icon('graduationCap', 28)}
            <span>StudyBuddy</span>
          </div>
          <div class="landing-nav-actions">
            <a href="#/login" class="btn btn-ghost btn-sm">Log In</a>
            <a href="#/signup" class="btn btn-primary btn-sm">Sign Up Free</a>
          </div>
        </nav>

        <section class="landing-hero">
          <div class="hero-badge">
            <span class="badge badge-accent">${icon('sparkles', 14)} AI-Powered Study Tools</span>
          </div>
          <h1 class="hero-title">
            Study Smarter<br>with <span class="accent">AI</span>
          </h1>
          <p class="hero-subtitle">
            Upload your course materials and let AI generate flashcards, quizzes, and provide
            a personal tutor — all in one place.
          </p>
          <div class="hero-actions">
            <a href="#/signup" class="btn btn-primary btn-lg">Get Started</a>
            <a href="#/login" class="btn btn-ghost btn-lg">I have an account</a>
          </div>
        </section>

        <section class="landing-features">
          <div class="features-grid">
            <div class="glass-card feature-card">
              <div class="feature-icon">${icon('messageCircle', 24)}</div>
              <h3 class="feature-title">AI Chat Tutor</h3>
              <p class="feature-desc">Ask questions about your course material and get instant, context-aware answers from your AI study companion.</p>
            </div>
            <div class="glass-card feature-card">
              <div class="feature-icon">${icon('layers', 24)}</div>
              <h3 class="feature-title">Smart Flashcards</h3>
              <p class="feature-desc">Auto-generate flashcards from your uploaded notes. Study with a flip-card interface and track your progress.</p>
            </div>
            <div class="glass-card feature-card">
              <div class="feature-icon">${icon('brain', 24)}</div>
              <h3 class="feature-title">Adaptive Quizzes</h3>
              <p class="feature-desc">AI-generated quizzes with explanations. Review your weak topics and improve your understanding.</p>
            </div>
          </div>
        </section>
      </div>
    `;
  }
};
