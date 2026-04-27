// ─── Shared UI Components ───

import { auth } from './auth.js';
import { store } from './store.js';

// ─── Icons (Lucide SVG paths) ───
const ICONS = {
  home: '<path d="M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8"/><path d="M3 10a2 2 0 0 1 .709-1.528l7-5.999a2 2 0 0 1 2.582 0l7 5.999A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>',
  book: '<path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H19a1 1 0 0 1 1 1v18a1 1 0 0 1-1 1H6.5a1 1 0 0 1 0-5H20"/>',
  layers: '<path d="M12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83Z"/><path d="m22 17.65-9.17 4.16a2 2 0 0 1-1.66 0L2 17.65"/><path d="m22 12.65-9.17 4.16a2 2 0 0 1-1.66 0L2 12.65"/>',
  brain: '<path d="M12 5a3 3 0 1 0-5.997.125 4 4 0 0 0-2.526 5.77 4 4 0 0 0 .556 6.588A4 4 0 1 0 12 18Z"/><path d="M12 5a3 3 0 1 1 5.997.125 4 4 0 0 1 2.526 5.77 4 4 0 0 1-.556 6.588A4 4 0 1 1 12 18Z"/><path d="M15 13a4.5 4.5 0 0 1-3-4 4.5 4.5 0 0 1-3 4"/><path d="M17.599 6.5a3 3 0 0 0 .399-1.375"/><path d="M6.003 5.125A3 3 0 0 0 6.401 6.5"/><path d="M3.477 10.896a4 4 0 0 1 .585-.396"/><path d="M19.938 10.5a4 4 0 0 1 .585.396"/><path d="M6 18a4 4 0 0 1-1.967-.516"/><path d="M19.967 17.484A4 4 0 0 1 18 18"/>',
  messageCircle: '<path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"/>',
  upload: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" x2="12" y1="3" y2="15"/>',
  plus: '<path d="M5 12h14"/><path d="M12 5v14"/>',
  x: '<path d="M18 6 6 18"/><path d="m6 6 12 12"/>',
  check: '<path d="M20 6 9 17l-5-5"/>',
  chevronRight: '<path d="m9 18 6-6-6-6"/>',
  chevronLeft: '<path d="m15 18-6-6 6-6"/>',
  settings: '<path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/>',
  logOut: '<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" x2="9" y1="12" y2="12"/>',
  file: '<path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/>',
  trash: '<path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>',
  sparkles: '<path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z"/><path d="M20 3v4"/><path d="M22 5h-4"/>',
  clock: '<circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>',
  trophy: '<path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/>',
  barChart: '<line x1="12" x2="12" y1="20" y2="10"/><line x1="18" x2="18" y1="20" y2="4"/><line x1="6" x2="6" y1="20" y2="16"/>',
  menu: '<line x1="4" x2="20" y1="12" y2="12"/><line x1="4" x2="20" y1="6" y2="6"/><line x1="4" x2="20" y1="18" y2="18"/>',
  eye: '<path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0"/><circle cx="12" cy="12" r="3"/>',
  eyeOff: '<path d="M10.733 5.076a10.744 10.744 0 0 1 11.205 6.575 1 1 0 0 1 0 .696 10.747 10.747 0 0 1-1.444 2.49"/><path d="M14.084 14.158a3 3 0 0 1-4.242-4.242"/><path d="M17.479 17.499a10.75 10.75 0 0 1-15.417-5.151 1 1 0 0 1 0-.696 10.75 10.75 0 0 1 4.446-5.143"/><path d="m2 2 20 20"/>',
  shuffle: '<path d="M2 18h1.4c1.3 0 2.5-.6 3.3-1.7l6.1-8.6c.7-1.1 2-1.7 3.3-1.7H22"/><path d="m18 2 4 4-4 4"/><path d="M2 6h1.9c1.5 0 2.9.9 3.6 2.2"/><path d="M22 18h-5.9c-1.3 0-2.6-.7-3.3-1.8l-.5-.8"/><path d="m18 14 4 4-4 4"/>',
  rotateCcw: '<path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/>',
  alertCircle: '<circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="8" y2="12"/><line x1="12" x2="12.01" y1="16" y2="16"/>',
  folderOpen: '<path d="m6 14 1.5-2.9A2 2 0 0 1 9.24 10H20a2 2 0 0 1 1.94 2.5l-1.54 6a2 2 0 0 1-1.95 1.5H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h3.9a2 2 0 0 1 1.69.9l.81 1.2a2 2 0 0 0 1.67.9H18a2 2 0 0 1 2 2v2"/>',
  graduationCap: '<path d="M21.42 10.922a1 1 0 0 0-.019-1.838L12.83 5.18a2 2 0 0 0-1.66 0L2.6 9.08a1 1 0 0 0 0 1.832l8.57 3.908a2 2 0 0 0 1.66 0z"/><path d="M22 10v6"/><path d="M6 12.5V16a6 3 0 0 0 12 0v-3.5"/>',
  zap: '<path d="M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z"/>',
  send: '<path d="M14.536 21.686a.5.5 0 0 0 .937-.024l6.5-19a.496.496 0 0 0-.635-.635l-19 6.5a.5.5 0 0 0-.024.937l7.93 3.18a2 2 0 0 1 1.112 1.11z"/><path d="m21.854 2.147-10.94 10.939"/>',
  paperclip: '<path d="m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l8.57-8.57A4 4 0 1 1 18 8.84l-8.59 8.57a2 2 0 0 1-2.83-2.83l8.49-8.48"/>',
};

export function icon(name, size = 20) {
  const svg = ICONS[name];
  if (!svg) return '';
  return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${svg}</svg>`;
}

// ─── Toast System ───
let _toastContainer = null;

function _ensureToastContainer() {
  if (_toastContainer) return _toastContainer;
  _toastContainer = document.createElement('div');
  _toastContainer.className = 'toast-container';
  document.body.appendChild(_toastContainer);
  return _toastContainer;
}

export function toast(message, type = 'info', duration = 4000) {
  const container = _ensureToastContainer();
  const el = document.createElement('div');
  el.className = `toast toast-${type}`;
  const iconName = type === 'success' ? 'check' : type === 'error' ? 'alertCircle' : 'sparkles';
  el.innerHTML = `<span class="toast-icon">${icon(iconName, 18)}</span><span class="toast-msg">${message}</span>`;
  container.appendChild(el);
  requestAnimationFrame(() => el.classList.add('toast-visible'));
  setTimeout(() => {
    el.classList.remove('toast-visible');
    el.addEventListener('transitionend', () => el.remove());
  }, duration);
}

// ─── Modal System ───
export function modal(title, contentHTML, opts = {}) {
  return new Promise(resolve => {
    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    overlay.innerHTML = `
      <div class="modal-box glass-card" style="${opts.width ? `max-width:${opts.width}px` : ''}">
        <div class="modal-header">
          <h3>${title}</h3>
          <button class="btn-icon modal-close" aria-label="Close">${icon('x', 20)}</button>
        </div>
        <div class="modal-body">${contentHTML}</div>
        ${opts.footer ? `<div class="modal-footer">${opts.footer}</div>` : ''}
      </div>
    `;

    function close(val) {
      overlay.classList.add('modal-out');
      overlay.addEventListener('animationend', () => {
        overlay.remove();
        resolve(val);
      });
    }

    overlay.querySelector('.modal-close').onclick = () => close(null);
    overlay.addEventListener('click', e => { if (e.target === overlay) close(null); });
    document.addEventListener('keydown', function esc(e) {
      if (e.key === 'Escape') { document.removeEventListener('keydown', esc); close(null); }
    });

    document.body.appendChild(overlay);
    requestAnimationFrame(() => overlay.classList.add('modal-visible'));

    // Expose close to callers
    overlay._close = close;
    if (opts.onMount) opts.onMount(overlay, close);
  });
}

// ─── Confirm Dialog ───
export async function confirm(title, message, confirmText = 'Confirm', danger = false) {
  return modal(title, `<p class="confirm-msg">${message}</p>`, {
    width: 420,
    footer: `
      <button class="btn btn-ghost modal-cancel">Cancel</button>
      <button class="btn ${danger ? 'btn-danger' : 'btn-primary'} modal-confirm">${confirmText}</button>
    `,
    onMount(overlay, close) {
      overlay.querySelector('.modal-cancel').onclick = () => close(false);
      overlay.querySelector('.modal-confirm').onclick = () => close(true);
    }
  });
}

// ─── Sidebar ───
export function renderSidebar(currentPath) {
  const user = auth.getCachedUser();
  const email = user?.email || 'User';
  const initial = email[0].toUpperCase();

  const navItems = [
    { path: '#/dashboard', icon: 'home', label: 'Dashboard' },
    { path: '#/flashcards', icon: 'layers', label: 'Flashcards' },
    { path: '#/quiz', icon: 'brain', label: 'Quizzes' },
    { path: '#/chat', icon: 'messageCircle', label: 'AI Chat' },
  ];

  const isActive = (path) => {
    if (path === '#/dashboard') return currentPath === '/dashboard' || currentPath === '/';
    return currentPath.startsWith(path.replace('#', ''));
  };

  return `
    <aside class="sidebar" id="sidebar">
      <div class="sidebar-top">
        <div class="sidebar-brand">
          ${icon('graduationCap', 28)}
          <span class="brand-text">StudyBuddy</span>
        </div>
        <button class="btn-icon sidebar-toggle" id="sidebar-toggle" aria-label="Toggle sidebar">
          ${icon('menu', 20)}
        </button>
      </div>

      <nav class="sidebar-nav">
        ${navItems.map(item => `
          <a href="${item.path}" class="nav-item ${isActive(item.path) ? 'active' : ''}">
            <span class="nav-icon">${icon(item.icon, 20)}</span>
            <span class="nav-label">${item.label}</span>
          </a>
        `).join('')}
      </nav>

      <div class="sidebar-bottom">
        <div class="sidebar-user">
          <div class="user-avatar">${initial}</div>
          <div class="user-info">
            <span class="user-email">${email}</span>
          </div>
          <button class="btn-icon" id="logout-btn" aria-label="Logout" title="Logout">
            ${icon('logOut', 18)}
          </button>
        </div>
      </div>
    </aside>
  `;
}

export function bindSidebar() {
  const toggle = document.getElementById('sidebar-toggle');
  const sidebar = document.getElementById('sidebar');
  if (toggle && sidebar) {
    toggle.addEventListener('click', () => {
      sidebar.classList.toggle('collapsed');
      localStorage.setItem('sidebar_collapsed', sidebar.classList.contains('collapsed'));
    });
    if (localStorage.getItem('sidebar_collapsed') === 'true') {
      sidebar.classList.add('collapsed');
    }
  }

  const logoutBtn = document.getElementById('logout-btn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', async () => {
      await auth.logout();
      window.location.hash = '#/';
    });
  }
}

// ─── Empty State ───
export function emptyState(iconName, title, description, actionHTML = '') {
  return `
    <div class="empty-state">
      <div class="empty-icon">${icon(iconName, 48)}</div>
      <h3 class="empty-title">${title}</h3>
      <p class="empty-desc">${description}</p>
      ${actionHTML}
    </div>
  `;
}

// ─── Skeleton ───
export function skeleton(lines = 3) {
  return `<div class="skeleton-group">${
    Array.from({ length: lines }, (_, i) =>
      `<div class="skeleton" style="width:${80 - i * 15}%"></div>`
    ).join('')
  }</div>`;
}

// ─── File Uploader ───
export function fileUploader(onFiles) {
  const id = 'fu_' + Math.random().toString(36).slice(2, 8);
  setTimeout(() => {
    const zone = document.getElementById(id);
    if (!zone) return;
    const input = zone.querySelector('input[type="file"]');

    zone.addEventListener('dragover', e => { e.preventDefault(); zone.classList.add('drag-over'); });
    zone.addEventListener('dragleave', () => zone.classList.remove('drag-over'));
    zone.addEventListener('drop', e => {
      e.preventDefault(); zone.classList.remove('drag-over');
      if (e.dataTransfer.files.length) onFiles(Array.from(e.dataTransfer.files));
    });
    zone.addEventListener('click', () => input.click());
    input.addEventListener('change', () => {
      if (input.files.length) onFiles(Array.from(input.files));
      input.value = '';
    });
  }, 0);

  return `
    <div class="file-upload-zone" id="${id}">
      <input type="file" multiple accept=".pdf,.docx,.txt" hidden>
      <div class="upload-icon">${icon('upload', 32)}</div>
      <p class="upload-text">Drag & drop files here, or click to browse</p>
      <p class="upload-hint">PDF, DOCX, or TXT files</p>
    </div>
  `;
}
