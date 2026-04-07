// ─── Dashboard View ───

import { auth } from '../auth.js';
import { store } from '../store.js';
import { icon, toast, modal, confirm as confirmDialog, emptyState } from '../components.js';

function getClasses() {
  return store.get('classes') || [];
}

function saveClass(cls) {
  const classes = getClasses();
  classes.push(cls);
  store.set('classes', classes);
}

function deleteClass(id) {
  store.set('classes', getClasses().filter(c => c.id !== id));
}

export default {
  mount(el) {
    const user = auth.getCachedUser();
    const name = user?.email?.split('@')[0] || 'there';

    function render() {
      const classes = getClasses();

      el.innerHTML = `
        <div class="page-header">
          <h1>Welcome back, ${name}</h1>
          <p>Pick up where you left off or start something new.</p>
        </div>

        <div class="flex items-center justify-between" style="margin-bottom:20px">
          <h3>Your Classes</h3>
          <button class="btn btn-primary btn-sm" id="add-class-btn">
            ${icon('plus', 16)} Add Class
          </button>
        </div>

        ${classes.length === 0 ? emptyState(
          'folderOpen',
          'No classes yet',
          'Create your first class to start uploading materials and studying.',
          '<button class="btn btn-primary" id="empty-add-btn">' + icon('plus', 16) + ' Create a Class</button>'
        ) : `
          <div class="grid grid-auto">
            ${classes.map(cls => `
              <div class="glass-card interactive class-card" data-id="${cls.id}">
                <div class="card-body">
                  <div class="flex items-center justify-between" style="margin-bottom:12px">
                    <span class="badge badge-accent">${cls.code || 'Class'}</span>
                    <button class="btn-icon delete-class-btn" data-id="${cls.id}" title="Delete class" aria-label="Delete class">
                      ${icon('trash', 16)}
                    </button>
                  </div>
                  <h3 style="margin-bottom:6px">${cls.name}</h3>
                  <p class="text-sm text-muted" style="margin-bottom:16px">${cls.description || 'No description'}</p>
                  <div class="flex gap-8 flex-wrap">
                    <span class="badge badge-neutral">${icon('file', 12)} ${cls.files || 0} files</span>
                    <span class="badge badge-neutral">${icon('layers', 12)} ${cls.flashcardSets || 0} sets</span>
                    <span class="badge badge-neutral">${icon('brain', 12)} ${cls.quizzes || 0} quizzes</span>
                  </div>
                </div>
              </div>
            `).join('')}
          </div>
        `}

        <div style="margin-top:48px">
          <h3 style="margin-bottom:16px">Quick Actions</h3>
          <div class="grid grid-3">
            <a href="#/chat" class="glass-card interactive" style="text-decoration:none">
              <div class="card-body flex items-center gap-16">
                <div class="feature-icon">${icon('messageCircle', 22)}</div>
                <div>
                  <h4>AI Chat</h4>
                  <p class="text-sm text-muted">Ask your AI tutor</p>
                </div>
              </div>
            </a>
            <a href="#/flashcards" class="glass-card interactive" style="text-decoration:none">
              <div class="card-body flex items-center gap-16">
                <div class="feature-icon">${icon('layers', 22)}</div>
                <div>
                  <h4>Flashcards</h4>
                  <p class="text-sm text-muted">Review your cards</p>
                </div>
              </div>
            </a>
            <a href="#/quiz" class="glass-card interactive" style="text-decoration:none">
              <div class="card-body flex items-center gap-16">
                <div class="feature-icon">${icon('brain', 22)}</div>
                <div>
                  <h4>Quizzes</h4>
                  <p class="text-sm text-muted">Test yourself</p>
                </div>
              </div>
            </a>
          </div>
        </div>
      `;

      // Bind events
      el.querySelectorAll('#add-class-btn, #empty-add-btn').forEach(btn => {
        btn?.addEventListener('click', showAddClassModal);
      });

      el.querySelectorAll('.class-card').forEach(card => {
        card.addEventListener('click', (e) => {
          if (e.target.closest('.delete-class-btn')) return;
          window.location.hash = `#/class/${card.dataset.id}`;
        });
      });

      el.querySelectorAll('.delete-class-btn').forEach(btn => {
        btn.addEventListener('click', async (e) => {
          e.stopPropagation();
          const id = btn.dataset.id;
          const cls = getClasses().find(c => c.id === id);
          if (!cls) return;
          const ok = await confirmDialog('Delete Class', `Delete "${cls.name}"? This cannot be undone.`, 'Delete', true);
          if (ok) {
            deleteClass(id);
            toast('Class deleted', 'info');
            render();
          }
        });
      });
    }

    async function showAddClassModal() {
      await modal('Add a Class', `
        <div class="field-group">
          <label class="field-label" for="class-name">Class Name *</label>
          <input class="input" id="class-name" placeholder="e.g. Computer Science 101" required>
        </div>
        <div class="field-group">
          <label class="field-label" for="class-code">Class Code</label>
          <input class="input" id="class-code" placeholder="e.g. CS101">
        </div>
        <div class="field-group">
          <label class="field-label" for="class-desc">Description</label>
          <textarea class="textarea" id="class-desc" rows="2" placeholder="Optional description"></textarea>
        </div>
      `, {
        footer: `
          <button class="btn btn-ghost modal-cancel">Cancel</button>
          <button class="btn btn-primary" id="save-class-btn">Create Class</button>
        `,
        onMount(overlay, close) {
          overlay.querySelector('.modal-cancel').onclick = () => close(null);
          overlay.querySelector('#save-class-btn').onclick = () => {
            const name = overlay.querySelector('#class-name').value.trim();
            if (!name) {
              overlay.querySelector('#class-name').style.borderColor = 'var(--error)';
              return;
            }
            const code = overlay.querySelector('#class-code').value.trim();
            const description = overlay.querySelector('#class-desc').value.trim();
            const id = crypto.randomUUID?.() || Date.now().toString(36);
            saveClass({ id, name, code, description, files: 0, flashcardSets: 0, quizzes: 0 });
            toast(`"${name}" created!`, 'success');
            close(true);
            render();
          };
          setTimeout(() => overlay.querySelector('#class-name')?.focus(), 100);
        }
      });
    }

    render();
  }
};
