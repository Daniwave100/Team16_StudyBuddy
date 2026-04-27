// ─── Chat View ─── AI Chat Tutor ───

import { store } from '../store.js';
import { api } from '../api.js';
import { icon, toast } from '../components.js';

let conversationId = null;
let messages = [];
let isTyping = false;
let sessionList = [];

export default {
  mount(el, params) {
    const classes = store.get('classes') || [];
    let classId = params.classId || null;
    let className = '';

    if (classId) {
      const cls = classes.find(c => c.id === classId);
      className = cls?.name || classId;
    }

    // If no class selected, show class picker
    if (!classId) {
      renderClassPicker(el);
      return;
    }

    conversationId = null;
    messages = [];
    sessionList = [];

    function render() {
      el.innerHTML = `
        <div style="display:flex; height:calc(100dvh - 96px); gap:0; margin:-32px -40px; position:relative">
          <!-- Sessions sidebar -->
          <div class="chat-sidebar" id="chat-sidebar">
            <div style="padding:16px">
              <button class="btn btn-primary btn-block btn-sm" id="new-chat-btn">
                ${icon('plus', 16)} New Chat
              </button>
            </div>
            <div class="chat-sessions" id="session-list"></div>
          </div>

          <!-- Main chat area -->
          <div style="flex:1; display:flex; flex-direction:column; min-width:0">
            <!-- Header -->
            <div style="padding:16px 24px; border-bottom:1px solid var(--border); display:flex; align-items:center; justify-content:space-between">
              <div class="flex items-center gap-12">
                <button class="btn-icon" id="toggle-sessions" aria-label="Toggle sessions">${icon('menu', 18)}</button>
                <div>
                  <h3 style="font-size:1rem">${className}</h3>
                  <span class="text-xs text-muted">AI Study Tutor</span>
                </div>
              </div>
              <a href="#/chat" class="btn btn-ghost btn-sm">Change Class</a>
            </div>

            <!-- Messages -->
            <div class="chat-messages" id="chat-messages">
              ${messages.length === 0 ? renderWelcome() : messages.map(m => renderMessage(m)).join('')}
              ${isTyping ? renderTyping() : ''}
            </div>

            <!-- Input -->
            <div style="padding:16px 24px; border-top:1px solid var(--border)">
              <div class="chat-input-bar" style="border:none; padding:0">
                <textarea class="chat-input" id="chat-input" placeholder="Ask about ${className}..." rows="1"></textarea>
                <button class="btn btn-primary" id="send-btn" style="height:46px; padding:0 16px" disabled>
                  ${icon('send', 18)}
                </button>
              </div>
            </div>
          </div>
        </div>
      `;

      bindEvents();
      loadSessions();
      scrollToBottom();
    }

    function renderWelcome() {
      return `
        <div style="flex:1; display:flex; flex-direction:column; align-items:center; justify-content:center; text-align:center; padding:40px 20px">
          <div class="feature-icon" style="margin-bottom:16px; width:56px; height:56px; border-radius:16px">
            ${icon('sparkles', 28)}
          </div>
          <h3 style="margin-bottom:8px">AI Study Tutor</h3>
          <p class="text-sm text-muted" style="max-width:400px; margin-bottom:20px">
            Ask questions about your ${className} materials. I'll help you understand concepts, prepare for exams, and study more effectively.
          </p>
          <div class="suggestion-chips">
            <button class="chip suggestion" data-msg="Summarize the key concepts">Summarize key concepts</button>
            <button class="chip suggestion" data-msg="What are the most important topics?">Important topics</button>
            <button class="chip suggestion" data-msg="Help me understand the fundamentals">Explain fundamentals</button>
            <button class="chip suggestion" data-msg="Create a study plan for this class">Create study plan</button>
          </div>
        </div>
      `;
    }

    function renderMessage(msg) {
      const isUser = msg.role === 'user';
      const initial = isUser ? 'Y' : 'AI';
      return `
        <div class="chat-msg ${msg.role}">
          <div class="chat-avatar">${initial}</div>
          <div class="chat-bubble">${formatMessage(msg.content)}</div>
        </div>
      `;
    }

    function renderTyping() {
      return `
        <div class="chat-msg bot">
          <div class="chat-avatar">AI</div>
          <div class="chat-bubble">
            <div class="typing-dots"><span></span><span></span><span></span></div>
          </div>
        </div>
      `;
    }

    function formatMessage(text) {
      return text
        .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\n/g, '<br>');
    }

    function bindEvents() {
      const input = el.querySelector('#chat-input');
      const sendBtn = el.querySelector('#send-btn');
      const newChatBtn = el.querySelector('#new-chat-btn');
      const toggleBtn = el.querySelector('#toggle-sessions');

      input.addEventListener('input', () => {
        sendBtn.disabled = !input.value.trim();
        input.style.height = 'auto';
        input.style.height = Math.min(input.scrollHeight, 150) + 'px';
      });

      input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
          e.preventDefault();
          if (input.value.trim()) sendMessage(input.value.trim());
        }
      });

      sendBtn.addEventListener('click', () => {
        if (input.value.trim()) sendMessage(input.value.trim());
      });

      newChatBtn.addEventListener('click', () => {
        conversationId = null;
        messages = [];
        render();
      });

      toggleBtn.addEventListener('click', () => {
        el.querySelector('#chat-sidebar')?.classList.toggle('open');
      });

      // Suggestion chips
      el.querySelectorAll('.suggestion').forEach(chip => {
        chip.addEventListener('click', () => sendMessage(chip.dataset.msg));
      });
    }

    async function sendMessage(text) {
      messages.push({ role: 'user', content: text });
      isTyping = true;
      updateMessages();

      const input = el.querySelector('#chat-input');
      if (input) { input.value = ''; input.style.height = 'auto'; }
      el.querySelector('#send-btn').disabled = true;

      try {
        const result = await api.chat.send(classId, text, conversationId);
        conversationId = result.conversation_id || conversationId;
        messages.push({ role: 'bot', content: result.response });
      } catch (err) {
        messages.push({ role: 'bot', content: 'Sorry, I couldn\'t process that request. Make sure the backend is running and materials are uploaded.' });
      }

      isTyping = false;
      updateMessages();
    }

    function updateMessages() {
      const container = el.querySelector('#chat-messages');
      if (!container) return;
      container.innerHTML = messages.map(m => renderMessage(m)).join('') + (isTyping ? renderTyping() : '');
      scrollToBottom();
    }

    function scrollToBottom() {
      const container = el.querySelector('#chat-messages');
      if (container) container.scrollTop = container.scrollHeight;
    }

    async function loadSessions() {
      const list = el.querySelector('#session-list');
      if (!list) return;

      try {
        const data = await api.chat.getSessions(classId);
        sessionList = data.sessions || [];
        list.innerHTML = sessionList.length === 0
          ? '<p class="text-xs text-muted" style="padding:0 16px">No previous chats</p>'
          : sessionList.map(s => `
            <button class="session-item ${s.id === conversationId ? 'active' : ''}" data-id="${s.id}">
              <span class="text-sm">${s.title}</span>
              <span class="text-xs text-muted">${s.message_count} msgs</span>
            </button>
          `).join('');

        list.querySelectorAll('.session-item').forEach(btn => {
          btn.addEventListener('click', () => loadSession(btn.dataset.id));
        });
      } catch {
        list.innerHTML = '<p class="text-xs text-muted" style="padding:0 16px">No previous chats</p>';
      }
    }

    async function loadSession(sessionId) {
      try {
        const data = await api.chat.getSession(sessionId);
        conversationId = sessionId;
        messages = (data.messages || []).map(m => ({ role: m.role === 'assistant' ? 'bot' : m.role, content: m.content }));
        updateMessages();
        loadSessions(); // Update active state
      } catch (err) {
        toast('Failed to load chat session', 'error');
      }
    }

    render();
  },

  unmount() {
    conversationId = null;
    messages = [];
    isTyping = false;
  }
};

function renderClassPicker(el) {
  const classes = store.get('classes') || [];

  el.innerHTML = `
    <div class="page-header">
      <h1>AI Chat Tutor</h1>
      <p>Select a class to start chatting about your study materials.</p>
    </div>

    ${classes.length === 0 ? `
      <div class="empty-state">
        <div class="empty-icon">${icon('folderOpen', 48)}</div>
        <h3 class="empty-title">No classes yet</h3>
        <p class="empty-desc">Create a class and upload materials first, then come back to chat.</p>
        <a href="#/dashboard" class="btn btn-primary">Go to Dashboard</a>
      </div>
    ` : `
      <div class="grid grid-auto">
        ${classes.map(cls => `
          <a href="#/chat/${cls.id}" class="glass-card interactive" style="text-decoration:none">
            <div class="card-body" style="text-align:center; padding:32px 24px">
              <div class="feature-icon" style="margin:0 auto 16px">${icon('messageCircle', 24)}</div>
              <h3 style="margin-bottom:4px">${cls.name}</h3>
              ${cls.code ? `<span class="badge badge-accent" style="margin-bottom:8px">${cls.code}</span>` : ''}
              <p class="text-sm text-muted">${cls.description || 'Chat about this class'}</p>
            </div>
          </a>
        `).join('')}
      </div>
    `}
  `;
}
