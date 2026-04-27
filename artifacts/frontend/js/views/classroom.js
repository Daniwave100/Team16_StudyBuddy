// ─── Classroom View ─── Individual class with tabs: Materials, Flashcards, Quizzes, Chat ───

import { store } from '../store.js';
import { api } from '../api.js';
import { icon, toast, fileUploader, emptyState, skeleton } from '../components.js';

let currentTab = 'materials';
let classData = null;
let uploadedFiles = [];

export default {
  mount(el, params) {
    const classes = store.get('classes') || [];
    classData = classes.find(c => c.id === params.id);

    if (!classData) {
      el.innerHTML = emptyState('alertCircle', 'Class not found', 'This class may have been deleted.',
        '<a href="#/dashboard" class="btn btn-primary">Back to Dashboard</a>');
      return;
    }

    store.set('currentClass', classData);
    uploadedFiles = JSON.parse(localStorage.getItem(`files_${params.id}`) || '[]');

    function render() {
      el.innerHTML = `
        <div class="page-header">
          <div class="flex items-center gap-12" style="margin-bottom:4px">
            <a href="#/dashboard" class="btn-icon" aria-label="Back to dashboard">${icon('chevronLeft', 20)}</a>
            <div>
              <div class="flex items-center gap-8">
                <h1>${classData.name}</h1>
                ${classData.code ? `<span class="badge badge-accent">${classData.code}</span>` : ''}
              </div>
              ${classData.description ? `<p>${classData.description}</p>` : ''}
            </div>
          </div>
        </div>

        <div class="tabs" style="margin-bottom:24px">
          <button class="tab ${currentTab === 'materials' ? 'active' : ''}" data-tab="materials">
            ${icon('upload', 16)} Materials
          </button>
          <button class="tab ${currentTab === 'flashcards' ? 'active' : ''}" data-tab="flashcards">
            ${icon('layers', 16)} Flashcards
          </button>
          <button class="tab ${currentTab === 'quizzes' ? 'active' : ''}" data-tab="quizzes">
            ${icon('brain', 16)} Quizzes
          </button>
          <button class="tab ${currentTab === 'chat' ? 'active' : ''}" data-tab="chat">
            ${icon('messageCircle', 16)} Chat
          </button>
        </div>

        <div id="tab-content" class="fade-in"></div>
      `;

      el.querySelectorAll('.tab').forEach(tab => {
        tab.addEventListener('click', () => {
          currentTab = tab.dataset.tab;
          render();
        });
      });

      renderTabContent();
    }

    function renderTabContent() {
      const content = el.querySelector('#tab-content');
      switch (currentTab) {
        case 'materials': renderMaterials(content); break;
        case 'flashcards': renderFlashcards(content); break;
        case 'quizzes': renderQuizzes(content); break;
        case 'chat': renderChat(content); break;
      }
    }

    function renderMaterials(container) {
      container.innerHTML = `
        <div style="margin-bottom:24px">
          ${fileUploader(handleFileUpload)}
        </div>
        <div id="file-list">
          ${uploadedFiles.length === 0
            ? '<p class="text-sm text-muted">No files uploaded yet. Upload PDFs, DOCX, or TXT files to get started.</p>'
            : `<div class="flex flex-col gap-8">${uploadedFiles.map((f, i) => `
                <div class="glass-card">
                  <div class="card-body flex items-center justify-between" style="padding:14px 18px">
                    <div class="flex items-center gap-12">
                      ${icon('file', 18)}
                      <div>
                        <span class="text-sm">${f.name}</span>
                        <span class="text-xs text-muted" style="margin-left:8px">${f.chunks ? f.chunks + ' chunks indexed' : 'Uploaded'}</span>
                      </div>
                    </div>
                    <button class="btn-icon remove-file" data-idx="${i}" aria-label="Remove file">${icon('x', 16)}</button>
                  </div>
                </div>
              `).join('')}</div>`
          }
        </div>
      `;

      container.querySelectorAll('.remove-file').forEach(btn => {
        btn.addEventListener('click', () => {
          uploadedFiles.splice(parseInt(btn.dataset.idx), 1);
          localStorage.setItem(`files_${params.id}`, JSON.stringify(uploadedFiles));
          renderMaterials(container);
        });
      });
    }

    async function handleFileUpload(files) {
      const statusEl = document.createElement('div');
      statusEl.className = 'badge badge-accent';
      statusEl.style.cssText = 'margin-top:12px';
      statusEl.innerHTML = `<span class="spinner" style="width:12px;height:12px;border-width:1.5px"></span> Uploading ${files.length} file(s)...`;
      el.querySelector('#file-list')?.prepend(statusEl);

      try {
        const result = await api.study.ingest(classData.id, files);
        files.forEach((f, i) => {
          uploadedFiles.push({
            name: f.name,
            chunks: result.files?.[i]?.chunk_count || 0,
            uploadedAt: new Date().toISOString()
          });
        });
        localStorage.setItem(`files_${params.id}`, JSON.stringify(uploadedFiles));

        // Update class file count
        classData.files = uploadedFiles.length;
        const classes = store.get('classes') || [];
        const idx = classes.findIndex(c => c.id === classData.id);
        if (idx >= 0) { classes[idx] = classData; store.set('classes', classes); }

        toast(`${result.chunks_indexed} chunks indexed from ${result.files_indexed} file(s)`, 'success');
        renderMaterials(el.querySelector('#tab-content'));
      } catch (err) {
        statusEl.remove();
        toast(err.message || 'Upload failed', 'error');
      }
    }

    function renderFlashcards(container) {
      container.innerHTML = `
        <div class="flex items-center justify-between" style="margin-bottom:20px">
          <p class="text-sm text-muted">Generate flashcards from your uploaded materials.</p>
          <button class="btn btn-primary btn-sm" id="gen-flash-btn">
            ${icon('sparkles', 16)} Generate Flashcards
          </button>
        </div>
        <div id="flashcard-list">${skeleton(3)}</div>
      `;

      container.querySelector('#gen-flash-btn').addEventListener('click', async () => {
        const btn = container.querySelector('#gen-flash-btn');
        btn.disabled = true;
        btn.innerHTML = '<span class="spinner"></span> Generating...';

        try {
          const result = await api.study.generateFlashcards(classData.id);
          toast(`${result.flashcards.length} flashcards generated!`, 'success');
          loadFlashcards(container);
        } catch (err) {
          toast(err.message || 'Failed to generate flashcards', 'error');
          btn.disabled = false;
          btn.innerHTML = `${icon('sparkles', 16)} Generate Flashcards`;
        }
      });

      loadFlashcards(container);
    }

    async function loadFlashcards(container) {
      const list = container.querySelector('#flashcard-list');
      try {
        const data = await api.study.getFlashcards(classData.id);
        const sets = data.flashcard_sets || [];
        if (sets.length === 0) {
          list.innerHTML = '<p class="text-sm text-muted">No flashcard sets yet. Generate some above!</p>';
          return;
        }
        list.innerHTML = sets.map(set => `
          <div class="glass-card" style="margin-bottom:12px">
            <div class="card-body flex items-center justify-between" style="padding:16px 20px">
              <div>
                <span class="text-sm">${set.count} flashcards</span>
                <span class="text-xs text-muted" style="margin-left:8px">${set.created_at ? new Date(set.created_at).toLocaleDateString() : ''}</span>
              </div>
              <div class="flex gap-8">
                <a href="#/flashcards/${set.id}" class="btn btn-sm btn-ghost">Study</a>
                <button class="btn-icon del-flash" data-id="${set.id}" aria-label="Delete">${icon('trash', 16)}</button>
              </div>
            </div>
          </div>
        `).join('');

        list.querySelectorAll('.del-flash').forEach(btn => {
          btn.addEventListener('click', async () => {
            try {
              await api.study.deleteFlashcards(btn.dataset.id);
              toast('Flashcard set deleted', 'info');
              loadFlashcards(container);
            } catch (err) { toast(err.message, 'error'); }
          });
        });
      } catch {
        list.innerHTML = '<p class="text-sm text-muted">No flashcard sets yet. Generate some above!</p>';
      }
    }

    function renderQuizzes(container) {
      container.innerHTML = `
        <div class="flex items-center justify-between" style="margin-bottom:20px">
          <p class="text-sm text-muted">Generate quizzes from your uploaded materials.</p>
          <button class="btn btn-primary btn-sm" id="gen-quiz-btn">
            ${icon('sparkles', 16)} Generate Quiz
          </button>
        </div>
        <div id="quiz-list">${skeleton(3)}</div>
      `;

      container.querySelector('#gen-quiz-btn').addEventListener('click', () => {
        window.location.hash = `#/quiz?classId=${classData.id}`;
      });

      loadQuizzes(container);
    }

    async function loadQuizzes(container) {
      const list = container.querySelector('#quiz-list');
      try {
        const data = await api.quizzes.list(classData.id);
        const quizzes = data.quizzes || [];
        if (quizzes.length === 0) {
          list.innerHTML = '<p class="text-sm text-muted">No quizzes yet. Generate one above!</p>';
          return;
        }
        list.innerHTML = quizzes.map(q => `
          <div class="glass-card" style="margin-bottom:12px">
            <div class="card-body flex items-center justify-between" style="padding:16px 20px">
              <div>
                <span class="text-sm" style="font-weight:500">${q.title}</span>
                <div class="flex gap-8" style="margin-top:4px">
                  <span class="badge badge-neutral">${q.question_count} questions</span>
                  <span class="badge badge-neutral">${q.difficulty || 'medium'}</span>
                </div>
              </div>
              <a href="#/quiz/${q.id}" class="btn btn-sm btn-primary">Take Quiz</a>
            </div>
          </div>
        `).join('');
      } catch {
        list.innerHTML = '<p class="text-sm text-muted">No quizzes yet. Generate one above!</p>';
      }
    }

    function renderChat(container) {
      container.innerHTML = `
        <div style="text-align:center;padding:40px 0">
          <div class="feature-icon" style="margin:0 auto 16px">${icon('messageCircle', 28)}</div>
          <h3 style="margin-bottom:8px">Chat about ${classData.name}</h3>
          <p class="text-sm text-muted" style="margin-bottom:20px">Ask your AI tutor questions about the materials you've uploaded.</p>
          <a href="#/chat/${classData.id}" class="btn btn-primary">Open Chat</a>
        </div>
      `;
    }

    render();
  },

  unmount() {
    currentTab = 'materials';
  }
};
