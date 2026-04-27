// ─── Quiz View ─── Setup → Taking → Results ───

import { store } from '../store.js';
import { api } from '../api.js';
import { icon, toast, emptyState } from '../components.js';

let phase = 'setup'; // setup | taking | results
let quiz = null;
let currentQ = 0;
let answers = {};
let startTime = 0;
let timerInterval = null;
let submissionResult = null;

function cleanup() {
  if (timerInterval) clearInterval(timerInterval);
  phase = 'setup';
  quiz = null;
  currentQ = 0;
  answers = {};
  submissionResult = null;
}

export default {
  mount(el, params) {
    const classes = store.get('classes') || [];
    const preselectedClass = new URLSearchParams(window.location.hash.split('?')[1]).get('classId');

    // If we have a quiz ID, load it directly
    if (params.id) {
      phase = 'setup';
      loadExistingQuiz(el, params.id);
      return;
    }

    function render() {
      switch (phase) {
        case 'setup': renderSetup(); break;
        case 'taking': renderQuestion(); break;
        case 'results': renderResults(); break;
      }
    }

    function renderSetup() {
      el.innerHTML = `
        <div class="page-header">
          <h1>Create a Quiz</h1>
          <p>Generate an AI-powered quiz from your study materials.</p>
        </div>

        <div class="glass-card" style="max-width:600px">
          <div class="card-body">
            <div class="field-group">
              <label class="field-label" for="quiz-class">Class *</label>
              <select class="select" id="quiz-class">
                <option value="">Select a class</option>
                ${classes.map(c => `<option value="${c.id}" ${c.id === preselectedClass ? 'selected' : ''}>${c.name}</option>`).join('')}
              </select>
            </div>

            <div class="field-group">
              <label class="field-label" for="quiz-title">Quiz Title</label>
              <input class="input" id="quiz-title" placeholder="e.g. Midterm Review" value="Quick Quiz">
            </div>

            <div class="grid grid-2" style="margin-top:16px">
              <div class="field-group">
                <label class="field-label" for="quiz-count">Questions</label>
                <select class="select" id="quiz-count">
                  <option value="5">5</option>
                  <option value="10" selected>10</option>
                  <option value="15">15</option>
                  <option value="20">20</option>
                </select>
              </div>
              <div class="field-group">
                <label class="field-label" for="quiz-diff">Difficulty</label>
                <select class="select" id="quiz-diff">
                  <option value="easy">Easy</option>
                  <option value="medium" selected>Medium</option>
                  <option value="hard">Hard</option>
                </select>
              </div>
            </div>

            <div class="field-group">
              <label class="field-label" for="quiz-focus">Focus Topic (optional)</label>
              <input class="input" id="quiz-focus" placeholder="e.g. Chapter 3, sorting algorithms">
            </div>

            <button class="btn btn-primary btn-block" id="start-quiz" style="margin-top:24px">
              ${icon('sparkles', 16)} Generate & Start Quiz
            </button>
          </div>
        </div>
      `;

      el.querySelector('#start-quiz').addEventListener('click', async () => {
        const classId = el.querySelector('#quiz-class').value;
        if (!classId) { toast('Please select a class', 'error'); return; }

        const btn = el.querySelector('#start-quiz');
        btn.disabled = true;
        btn.innerHTML = '<span class="spinner"></span> Generating quiz...';

        try {
          const title = el.querySelector('#quiz-title').value.trim() || 'Quick Quiz';
          const count = parseInt(el.querySelector('#quiz-count').value);
          const difficulty = el.querySelector('#quiz-diff').value;
          const focus = el.querySelector('#quiz-focus').value.trim() || null;

          quiz = await api.quizzes.create(classId, title, {
            questionCount: count,
            difficulty,
            focus
          });

          if (!quiz.questions || quiz.questions.length === 0) {
            toast('No questions generated. Try uploading materials first.', 'error');
            btn.disabled = false;
            btn.innerHTML = `${icon('sparkles', 16)} Generate & Start Quiz`;
            return;
          }

          phase = 'taking';
          currentQ = 0;
          answers = {};
          startTime = Date.now();
          timerInterval = setInterval(() => updateTimer(), 1000);
          render();
        } catch (err) {
          toast(err.message || 'Failed to generate quiz', 'error');
          btn.disabled = false;
          btn.innerHTML = `${icon('sparkles', 16)} Generate & Start Quiz`;
        }
      });
    }

    function updateTimer() {
      const timerEl = document.getElementById('quiz-timer');
      if (!timerEl) return;
      const elapsed = Math.floor((Date.now() - startTime) / 1000);
      const m = Math.floor(elapsed / 60);
      const s = elapsed % 60;
      timerEl.textContent = `${m}:${String(s).padStart(2, '0')}`;
    }

    function renderQuestion() {
      const q = quiz.questions[currentQ];
      const total = quiz.questions.length;
      const progress = ((currentQ + 1) / total) * 100;
      const selected = answers[q.id || currentQ];

      el.innerHTML = `
        <div class="flex items-center justify-between" style="margin-bottom:24px">
          <div class="flex items-center gap-12">
            <h3>${quiz.title || 'Quiz'}</h3>
            <span class="badge badge-neutral">${currentQ + 1} of ${total}</span>
          </div>
          <div class="flex items-center gap-12">
            <span class="badge badge-neutral">${icon('clock', 14)} <span id="quiz-timer">0:00</span></span>
          </div>
        </div>

        <div class="progress-bar" style="margin-bottom:32px">
          <div class="progress-fill" style="width:${progress}%"></div>
        </div>

        <div class="glass-card" style="max-width:720px">
          <div class="card-body">
            <h3 style="margin-bottom:24px; line-height:1.6">${q.question}</h3>

            <div class="flex flex-col gap-8" id="options">
              ${(q.options || []).map((opt, i) => {
                const letter = String.fromCharCode(65 + i);
                const isSelected = selected === opt;
                return `
                  <div class="quiz-option ${isSelected ? 'selected' : ''}" data-value="${opt}">
                    <span class="option-letter">${letter}</span>
                    <span>${opt}</span>
                  </div>
                `;
              }).join('')}
            </div>

            <div class="flex justify-between" style="margin-top:28px">
              <button class="btn btn-ghost" id="prev-q" ${currentQ === 0 ? 'disabled' : ''}>
                ${icon('chevronLeft', 16)} Previous
              </button>
              ${currentQ === total - 1 ? `
                <button class="btn btn-primary" id="submit-quiz" ${Object.keys(answers).length < total ? 'disabled' : ''}>
                  ${icon('check', 16)} Submit Quiz
                </button>
              ` : `
                <button class="btn btn-primary" id="next-q">
                  Next ${icon('chevronRight', 16)}
                </button>
              `}
            </div>
          </div>
        </div>
      `;

      updateTimer();

      el.querySelectorAll('.quiz-option').forEach(opt => {
        opt.addEventListener('click', () => {
          answers[q.id || currentQ] = opt.dataset.value;
          el.querySelectorAll('.quiz-option').forEach(o => o.classList.remove('selected'));
          opt.classList.add('selected');
        });
      });

      el.querySelector('#prev-q')?.addEventListener('click', () => {
        if (currentQ > 0) { currentQ--; render(); }
      });

      el.querySelector('#next-q')?.addEventListener('click', () => {
        if (currentQ < total - 1) { currentQ++; render(); }
      });

      el.querySelector('#submit-quiz')?.addEventListener('click', submitQuiz);
    }

    async function submitQuiz() {
      if (timerInterval) clearInterval(timerInterval);
      const timeTaken = Math.floor((Date.now() - startTime) / 1000);

      const btn = el.querySelector('#submit-quiz');
      btn.disabled = true;
      btn.innerHTML = '<span class="spinner"></span> Submitting...';

      try {
        submissionResult = await api.quizzes.submit(quiz.id, answers, timeTaken);
        phase = 'results';
        render();
      } catch (err) {
        // Fallback: grade locally
        let correct = 0;
        const results = quiz.questions.map((q, i) => {
          const userAnswer = answers[q.id || i] || '';
          const isCorrect = userAnswer === q.answer;
          if (isCorrect) correct++;
          return { question_text: q.question, user_answer: userAnswer, correct_answer: q.answer, is_correct: isCorrect, explanation: q.explanation };
        });
        submissionResult = {
          score: Math.round((correct / quiz.questions.length) * 100),
          correct_count: correct,
          total_count: quiz.questions.length,
          time_taken: timeTaken,
          results
        };
        phase = 'results';
        render();
      }
    }

    function renderResults() {
      const r = submissionResult;
      const minutes = Math.floor((r.time_taken || 0) / 60);
      const seconds = (r.time_taken || 0) % 60;

      el.innerHTML = `
        <div class="page-header">
          <h1>Quiz Results</h1>
          <p>${quiz.title || 'Quiz'}</p>
        </div>

        <div class="grid grid-3" style="margin-bottom:32px">
          <div class="glass-card stat-card">
            <div class="stat-value" style="color:${r.score >= 70 ? 'var(--success)' : r.score >= 50 ? 'var(--warning)' : 'var(--error)'}">${r.score}%</div>
            <div class="stat-label">Score</div>
          </div>
          <div class="glass-card stat-card">
            <div class="stat-value">${r.correct_count}/${r.total_count}</div>
            <div class="stat-label">Correct</div>
          </div>
          <div class="glass-card stat-card">
            <div class="stat-value">${minutes}:${String(seconds).padStart(2, '0')}</div>
            <div class="stat-label">Time</div>
          </div>
        </div>

        <h3 style="margin-bottom:16px">Question Review</h3>
        <div class="flex flex-col gap-12">
          ${(r.results || []).map((res, i) => `
            <div class="glass-card">
              <div class="card-body">
                <div class="flex items-center gap-8" style="margin-bottom:10px">
                  <span class="badge ${res.is_correct ? 'badge-success' : 'badge-error'}">
                    ${res.is_correct ? icon('check', 14) + ' Correct' : icon('x', 14) + ' Incorrect'}
                  </span>
                  <span class="text-xs text-muted">Question ${i + 1}</span>
                </div>
                <p style="margin-bottom:8px; font-weight:500">${res.question_text}</p>
                ${!res.is_correct ? `<p class="text-sm" style="color:var(--error); margin-bottom:4px">Your answer: ${res.user_answer || 'No answer'}</p>` : ''}
                <p class="text-sm" style="color:var(--success)">Correct answer: ${res.correct_answer}</p>
                ${res.explanation ? `<p class="text-sm text-muted" style="margin-top:8px">${res.explanation}</p>` : ''}
              </div>
            </div>
          `).join('')}
        </div>

        <div class="flex gap-12" style="margin-top:32px">
          <button class="btn btn-primary" id="retake-btn">${icon('rotateCcw', 16)} New Quiz</button>
          <a href="#/dashboard" class="btn btn-ghost">Back to Dashboard</a>
        </div>
      `;

      el.querySelector('#retake-btn').addEventListener('click', () => {
        cleanup();
        render();
      });
    }

    async function loadExistingQuiz(el, quizId) {
      el.innerHTML = `<div style="padding:40px;text-align:center"><span class="spinner" style="width:24px;height:24px;border:3px solid var(--border);border-top-color:var(--accent)"></span></div>`;
      try {
        quiz = await api.quizzes.get(quizId);
        phase = 'taking';
        currentQ = 0;
        answers = {};
        startTime = Date.now();
        timerInterval = setInterval(() => updateTimer(), 1000);
        render();
      } catch (err) {
        el.innerHTML = emptyState('alertCircle', 'Quiz not found', err.message,
          '<a href="#/quiz" class="btn btn-primary">Create New Quiz</a>');
      }
    }

    render();
  },

  unmount() {
    cleanup();
  }
};
