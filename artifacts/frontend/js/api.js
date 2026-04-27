// ─── API Client ─── Centralized backend communication ───

const API_BASE = 'http://localhost:8000/api';

async function request(method, path, body, isFormData = false) {
  const opts = {
    method,
    headers: isFormData ? {} : { 'Content-Type': 'application/json' },
  };
  if (body) opts.body = isFormData ? body : JSON.stringify(body);

  const res = await fetch(`${API_BASE}${path}`, opts);

  if (res.status === 204) return null;

  const data = await res.json().catch(() => null);

  if (!res.ok) {
    const msg = data?.detail || `Request failed (${res.status})`;
    throw new Error(msg);
  }
  return data;
}

export const api = {
  // ─── Chat ───
  chat: {
    send(classId, message, conversationId = null, focus = null) {
      return request('POST', '/chat', {
        class_id: classId, message, conversation_id: conversationId, focus
      });
    },
    getSessions(classId = null) {
      const q = classId ? `?class_id=${encodeURIComponent(classId)}` : '';
      return request('GET', `/chat/sessions${q}`);
    },
    getSession(id) {
      return request('GET', `/chat/sessions/${id}`);
    },
    createSession(classId, title = 'New Conversation') {
      return request('POST', '/chat/sessions', { class_id: classId, title });
    },
    updateTitle(id, title) {
      return request('PUT', `/chat/sessions/${id}/title?title=${encodeURIComponent(title)}`);
    },
    deleteSession(id) {
      return request('DELETE', `/chat/sessions/${id}`);
    },
    clearMessages(id) {
      return request('DELETE', `/chat/sessions/${id}/messages`);
    }
  },

  // ─── Study (Ingest + Flashcards + Quick Quiz) ───
  study: {
    ingest(classId, files) {
      const fd = new FormData();
      fd.append('class_id', classId);
      files.forEach(f => fd.append('files', f));
      return request('POST', '/ingest', fd, true);
    },
    generateFlashcards(classId, focus = null, count = 10) {
      return request('POST', '/flashcards', { class_id: classId, focus, count });
    },
    getFlashcards(classId = null) {
      const q = classId ? `?class_id=${encodeURIComponent(classId)}` : '';
      return request('GET', `/flashcards${q}`);
    },
    getFlashcardSet(id) {
      return request('GET', `/flashcards/${id}`);
    },
    deleteFlashcards(id) {
      return request('DELETE', `/flashcards/${id}`);
    },
    generateQuiz(classId, focus = null, count = 10) {
      return request('POST', '/quiz', { class_id: classId, focus, count });
    }
  },

  // ─── Quizzes (CRUD + Submissions) ───
  quizzes: {
    create(classId, title, opts = {}) {
      return request('POST', '/quizzes', {
        class_id: classId, title,
        description: opts.description || null,
        focus: opts.focus || null,
        question_count: opts.questionCount || 10,
        difficulty: opts.difficulty || 'medium'
      });
    },
    list(classId = null) {
      const q = classId ? `?class_id=${encodeURIComponent(classId)}` : '';
      return request('GET', `/quizzes${q}`);
    },
    get(id) {
      return request('GET', `/quizzes/${id}`);
    },
    update(id, data) {
      return request('PUT', `/quizzes/${id}`, data);
    },
    delete(id) {
      return request('DELETE', `/quizzes/${id}`);
    },
    submit(id, answers, timeTaken = null) {
      return request('POST', `/quizzes/${id}/submit`, {
        quiz_id: id, answers, time_taken: timeTaken
      });
    },
    getSubmissions(id) {
      return request('GET', `/quizzes/${id}/submissions`);
    }
  }
};
