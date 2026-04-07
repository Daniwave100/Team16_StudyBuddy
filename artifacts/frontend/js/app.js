// ─── App Router ─── Hash-based SPA routing ───

import { auth } from './auth.js';
import { renderSidebar, bindSidebar } from './components.js';

// ─── View Registry (lazy loaded) ───
const views = {
  '/':           () => import('./views/landing.js'),
  '/login':      () => import('./views/login.js'),
  '/signup':     () => import('./views/signup.js'),
  '/dashboard':  () => import('./views/dashboard.js'),
  '/class/:id':  () => import('./views/classroom.js'),
  '/quiz':       () => import('./views/quiz.js'),
  '/quiz/:id':   () => import('./views/quiz.js'),
  '/flashcards': () => import('./views/flashcards.js'),
  '/flashcards/:id': () => import('./views/flashcards.js'),
  '/chat':       () => import('./views/chat.js'),
  '/chat/:classId': () => import('./views/chat.js'),
};

const publicPaths = ['/', '/login', '/signup'];

let currentView = null;

// ─── Route Matching ───
function matchRoute(path) {
  // Exact match first
  if (views[path]) return { loader: views[path], params: {} };

  // Parameterized match
  for (const pattern of Object.keys(views)) {
    if (!pattern.includes(':')) continue;
    const patternParts = pattern.split('/');
    const pathParts = path.split('/');
    if (patternParts.length !== pathParts.length) continue;

    const params = {};
    let match = true;
    for (let i = 0; i < patternParts.length; i++) {
      if (patternParts[i].startsWith(':')) {
        params[patternParts[i].slice(1)] = decodeURIComponent(pathParts[i]);
      } else if (patternParts[i] !== pathParts[i]) {
        match = false;
        break;
      }
    }
    if (match) return { loader: views[pattern], params };
  }

  return null;
}

// ─── Render ───
async function navigate() {
  const fullHash = window.location.hash.slice(1) || '/';
  const hash = fullHash.split('?')[0]; // Strip query strings
  const loggedIn = auth.isLoggedIn();

  // Auth guard
  if (!loggedIn && !publicPaths.includes(hash.split('/').slice(0, 2).join('/') || '/')) {
    window.location.hash = '#/login';
    return;
  }

  // Redirect logged-in users away from auth pages
  if (loggedIn && ['/', '/login', '/signup'].includes(hash)) {
    window.location.hash = '#/dashboard';
    return;
  }

  const route = matchRoute(hash);
  if (!route) {
    window.location.hash = loggedIn ? '#/dashboard' : '#/';
    return;
  }

  // Unmount previous view
  if (currentView?.unmount) {
    try { currentView.unmount(); } catch {}
  }

  const app = document.getElementById('app');
  const needsSidebar = loggedIn && !publicPaths.includes(hash);

  if (needsSidebar) {
    app.innerHTML = `
      <div class="app-layout">
        ${renderSidebar(hash)}
        <main class="main-content">
          <div class="mobile-header" style="display:none">
            <button class="btn-icon" id="mobile-menu-btn" aria-label="Menu">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="4" x2="20" y1="12" y2="12"/><line x1="4" x2="20" y1="6" y2="6"/><line x1="4" x2="20" y1="18" y2="18"/></svg>
            </button>
            <span style="font-weight:600">StudyBuddy</span>
          </div>
          <div id="view" class="fade-in"></div>
        </main>
      </div>
    `;
    bindSidebar();
    setupMobileMenu();
  } else {
    app.innerHTML = `<div id="view" class="fade-in"></div>`;
  }

  // Load and mount view
  try {
    const mod = await route.loader();
    const view = mod.default || mod;
    currentView = view;
    const viewEl = document.getElementById('view');
    if (view.mount) {
      await view.mount(viewEl, route.params);
    } else if (typeof view === 'function') {
      const instance = view(viewEl, route.params);
      currentView = instance;
    }
  } catch (err) {
    console.error('View load error:', err);
    document.getElementById('view').innerHTML = `
      <div class="empty-state">
        <h3>Something went wrong</h3>
        <p class="text-muted">${err.message}</p>
        <a href="#/dashboard" class="btn btn-primary" style="margin-top:16px">Go to Dashboard</a>
      </div>
    `;
  }
}

function setupMobileMenu() {
  const menuBtn = document.getElementById('mobile-menu-btn');
  const sidebar = document.getElementById('sidebar');
  const overlay = document.getElementById('mobile-overlay');

  if (!menuBtn || !sidebar) return;

  // Show mobile header on small screens
  const mobileHeader = document.querySelector('.mobile-header');
  if (window.innerWidth <= 768 && mobileHeader) {
    mobileHeader.style.display = 'flex';
  }

  function openSidebar() {
    sidebar.classList.add('mobile-open');
    overlay?.classList.add('active');
  }

  function closeSidebar() {
    sidebar.classList.remove('mobile-open');
    overlay?.classList.remove('active');
  }

  menuBtn.addEventListener('click', openSidebar);
  overlay?.addEventListener('click', closeSidebar);

  // Close sidebar on nav click (mobile)
  sidebar.querySelectorAll('.nav-item').forEach(a => {
    a.addEventListener('click', closeSidebar);
  });

  window.addEventListener('resize', () => {
    if (mobileHeader) {
      mobileHeader.style.display = window.innerWidth <= 768 ? 'flex' : 'none';
    }
    if (window.innerWidth > 768) closeSidebar();
  });
}

// ─── Init ───
window.addEventListener('hashchange', navigate);
window.addEventListener('load', async () => {
  // Try to restore session
  await auth.getUser();
  navigate();
});
