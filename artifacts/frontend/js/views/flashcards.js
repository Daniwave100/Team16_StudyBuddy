// ─── Flashcards View ─── Browse sets + study mode ───

import { store } from '../store.js';
import { api } from '../api.js';
import { icon, toast, modal, emptyState, skeleton } from '../components.js';

let studyMode = false;
let studyCards = [];
let studyIndex = 0;
let flipped = false;
let knownCards = new Set();

function resetStudy() {
  studyMode = false;
  studyCards = [];
  studyIndex = 0;
  flipped = false;
  knownCards = new Set();
}

export default {
  mount(el, params) {
    const classes = store.get('classes') || [];

    // If we have a flashcard set ID, go directly to study mode
    if (params.id) {
      loadAndStudy(el, params.id);
      return;
    }

    async function render() {
      if (studyMode) {
        renderStudyMode(el);
        return;
      }

      el.innerHTML = `
        <div class="page-header">
          <div class="flex items-center justify-between">
            <div>
              <h1>Flashcards</h1>
              <p>Review your AI-generated flashcard sets.</p>
            </div>
            <button class="btn btn-primary btn-sm" id="gen-btn">
              ${icon('sparkles', 16)} Generate New Set
            </button>
          </div>
        </div>
        <div id="sets-list">${skeleton(4)}</div>
      `;

      el.querySelector('#gen-btn').addEventListener('click', showGenerateModal);
      loadAllSets(el);
    }

    async function loadAllSets(el) {
      const list = el.querySelector('#sets-list');
      try {
        const data = await api.study.getFlashcards();
        const sets = data.flashcard_sets || [];

        if (sets.length === 0) {
          list.innerHTML = emptyState('layers', 'No flashcard sets',
            'Generate flashcards from your class materials to start studying.',
            '<button class="btn btn-primary" id="empty-gen">' + icon('sparkles', 16) + ' Generate Set</button>');
          list.querySelector('#empty-gen')?.addEventListener('click', showGenerateModal);
          return;
        }

        list.innerHTML = `<div class="grid grid-auto">${sets.map(set => {
          const cls = classes.find(c => c.id === set.class_id);
          return `
            <div class="glass-card interactive" data-id="${set.id}">
              <div class="card-body">
                <div class="flex items-center justify-between" style="margin-bottom:12px">
                  <span class="badge badge-accent">${cls?.name || set.class_id}</span>
                  <button class="btn-icon del-set" data-id="${set.id}" aria-label="Delete">${icon('trash', 16)}</button>
                </div>
                <h4>${set.count} Flashcards</h4>
                <p class="text-xs text-muted" style="margin-top:4px">${set.created_at ? new Date(set.created_at).toLocaleDateString() : 'Just created'}</p>
              </div>
            </div>
          `;
        }).join('')}</div>`;

        list.querySelectorAll('.glass-card.interactive').forEach(card => {
          card.addEventListener('click', (e) => {
            if (e.target.closest('.del-set')) return;
            const set = sets.find(s => s.id === card.dataset.id);
            if (set) startStudy(set);
          });
        });

        list.querySelectorAll('.del-set').forEach(btn => {
          btn.addEventListener('click', async (e) => {
            e.stopPropagation();
            try {
              await api.study.deleteFlashcards(btn.dataset.id);
              toast('Set deleted', 'info');
              loadAllSets(el);
            } catch (err) { toast(err.message, 'error'); }
          });
        });
      } catch {
        list.innerHTML = emptyState('layers', 'No flashcard sets',
          'Generate flashcards from your class materials.',
          '<button class="btn btn-primary" id="empty-gen">' + icon('sparkles', 16) + ' Generate Set</button>');
        list.querySelector('#empty-gen')?.addEventListener('click', showGenerateModal);
      }
    }

    async function showGenerateModal() {
      await modal('Generate Flashcards', `
        <div class="field-group">
          <label class="field-label" for="fc-class">Class *</label>
          <select class="select" id="fc-class">
            <option value="">Select a class</option>
            ${classes.map(c => `<option value="${c.id}">${c.name}</option>`).join('')}
          </select>
        </div>
        <div class="field-group">
          <label class="field-label" for="fc-focus">Focus Topic (optional)</label>
          <input class="input" id="fc-focus" placeholder="e.g. Chapter 5, data structures">
        </div>
        <div class="field-group">
          <label class="field-label" for="fc-count">Number of Cards</label>
          <select class="select" id="fc-count">
            <option value="5">5</option>
            <option value="10" selected>10</option>
            <option value="15">15</option>
            <option value="20">20</option>
          </select>
        </div>
      `, {
        footer: `
          <button class="btn btn-ghost modal-cancel">Cancel</button>
          <button class="btn btn-primary" id="gen-go">Generate</button>
        `,
        onMount(overlay, close) {
          overlay.querySelector('.modal-cancel').onclick = () => close(null);
          overlay.querySelector('#gen-go').onclick = async () => {
            const classId = overlay.querySelector('#fc-class').value;
            if (!classId) { toast('Select a class', 'error'); return; }

            const btn = overlay.querySelector('#gen-go');
            btn.disabled = true;
            btn.innerHTML = '<span class="spinner"></span> Generating...';

            try {
              const focus = overlay.querySelector('#fc-focus').value.trim() || null;
              const count = parseInt(overlay.querySelector('#fc-count').value);
              const result = await api.study.generateFlashcards(classId, focus, count);
              toast(`${result.flashcards.length} flashcards generated!`, 'success');
              close(true);

              if (result.flashcards.length > 0) {
                startStudy(result);
              } else {
                render();
              }
            } catch (err) {
              toast(err.message || 'Generation failed', 'error');
              btn.disabled = false;
              btn.innerHTML = 'Generate';
            }
          };
        }
      });
    }

    function startStudy(set) {
      studyMode = true;
      studyCards = set.flashcards || [];
      studyIndex = 0;
      flipped = false;
      knownCards = new Set();
      renderStudyMode(el);
    }

    function renderStudyMode(el) {
      const card = studyCards[studyIndex];
      if (!card) { resetStudy(); render(); return; }

      const total = studyCards.length;
      const progress = ((knownCards.size) / total) * 100;

      el.innerHTML = `
        <div class="flex items-center justify-between" style="margin-bottom:24px">
          <button class="btn btn-ghost btn-sm" id="exit-study">
            ${icon('chevronLeft', 16)} Back to Sets
          </button>
          <div class="flex items-center gap-8">
            <button class="btn-icon" id="shuffle-btn" title="Shuffle" aria-label="Shuffle">${icon('shuffle', 18)}</button>
            <button class="btn-icon" id="reset-btn" title="Reset" aria-label="Reset">${icon('rotateCcw', 18)}</button>
          </div>
        </div>

        <div style="text-align:center; margin-bottom:24px">
          <span class="text-sm text-muted">${studyIndex + 1} of ${total}</span>
          <div class="progress-bar" style="max-width:400px; margin:8px auto 0">
            <div class="progress-fill success" style="width:${progress}%"></div>
          </div>
          <span class="text-xs text-muted">${knownCards.size} known</span>
        </div>

        <div class="flashcard-container" id="fc-flip">
          <div class="flashcard ${flipped ? 'flipped' : ''}">
            <div class="flashcard-face flashcard-front">
              <div>${card.front}</div>
            </div>
            <div class="flashcard-face flashcard-back">
              <div>${card.back}</div>
            </div>
          </div>
        </div>

        <p class="text-xs text-muted" style="text-align:center; margin-top:12px">Click card or press Space to flip</p>

        <div class="flex justify-center gap-16" style="margin-top:24px">
          <button class="btn btn-ghost" id="prev-card" ${studyIndex === 0 ? 'disabled' : ''}>
            ${icon('chevronLeft', 16)} Prev
          </button>
          <button class="btn btn-ghost" id="review-btn" style="border-color:var(--warning); color:var(--warning)">
            ${icon('rotateCcw', 16)} Review Later
          </button>
          <button class="btn btn-primary" id="know-btn" style="background:var(--success); border-color:var(--success)">
            ${icon('check', 16)} I Know This
          </button>
          <button class="btn btn-ghost" id="next-card" ${studyIndex === total - 1 ? 'disabled' : ''}>
            Next ${icon('chevronRight', 16)}
          </button>
        </div>
      `;

      // Flip
      el.querySelector('#fc-flip').addEventListener('click', () => {
        flipped = !flipped;
        el.querySelector('.flashcard').classList.toggle('flipped', flipped);
      });

      // Navigation
      el.querySelector('#prev-card').addEventListener('click', () => {
        if (studyIndex > 0) { studyIndex--; flipped = false; renderStudyMode(el); }
      });

      el.querySelector('#next-card').addEventListener('click', () => {
        if (studyIndex < total - 1) { studyIndex++; flipped = false; renderStudyMode(el); }
      });

      // Know / Review
      el.querySelector('#know-btn').addEventListener('click', () => {
        knownCards.add(studyIndex);
        if (studyIndex < total - 1) { studyIndex++; flipped = false; renderStudyMode(el); }
        else { toast(`Done! You knew ${knownCards.size}/${total} cards.`, 'success'); }
      });

      el.querySelector('#review-btn').addEventListener('click', () => {
        knownCards.delete(studyIndex);
        if (studyIndex < total - 1) { studyIndex++; flipped = false; renderStudyMode(el); }
      });

      // Shuffle
      el.querySelector('#shuffle-btn').addEventListener('click', () => {
        for (let i = studyCards.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [studyCards[i], studyCards[j]] = [studyCards[j], studyCards[i]];
        }
        studyIndex = 0; flipped = false; knownCards.clear();
        toast('Cards shuffled!', 'info');
        renderStudyMode(el);
      });

      // Reset
      el.querySelector('#reset-btn').addEventListener('click', () => {
        studyIndex = 0; flipped = false; knownCards.clear();
        renderStudyMode(el);
      });

      // Exit
      el.querySelector('#exit-study').addEventListener('click', () => {
        resetStudy();
        render();
      });

      // Keyboard
      const keyHandler = (e) => {
        if (e.key === ' ' || e.key === 'Spacebar') { e.preventDefault(); flipped = !flipped; el.querySelector('.flashcard').classList.toggle('flipped', flipped); }
        if (e.key === 'ArrowLeft' && studyIndex > 0) { studyIndex--; flipped = false; renderStudyMode(el); }
        if (e.key === 'ArrowRight' && studyIndex < total - 1) { studyIndex++; flipped = false; renderStudyMode(el); }
      };
      document.addEventListener('keydown', keyHandler);
      el._keyHandler = keyHandler;
    }

    async function loadAndStudy(el, setId) {
      el.innerHTML = `<div style="padding:40px;text-align:center"><span class="spinner" style="width:24px;height:24px;border:3px solid var(--border);border-top-color:var(--accent)"></span></div>`;
      try {
        const set = await api.study.getFlashcardSet(setId);
        startStudy(set);
      } catch (err) {
        el.innerHTML = emptyState('alertCircle', 'Flashcard set not found', err.message,
          '<a href="#/flashcards" class="btn btn-primary">Back to Flashcards</a>');
      }
    }

    render();
  },

  unmount() {
    if (document.querySelector('#view')?._keyHandler) {
      document.removeEventListener('keydown', document.querySelector('#view')._keyHandler);
    }
    resetStudy();
  }
};
