// State
let selectedFiles = [];
let messages = [];

// Initialize on page load
function init() {
    // Get class info from URL or sessionStorage
    const urlParams = new URLSearchParams(window.location.search);
    const classId = urlParams.get('class') || sessionStorage.getItem('selectedClass');
    const className = sessionStorage.getItem('selectedClassName') || 'Computer Science 101';
    
    document.getElementById('className').textContent = className;
    
    // Setup event listeners
    setupEventListeners();
}

// Setup all event listeners
function setupEventListeners() {
    const messageInput = document.getElementById('messageInput');
    
    // Auto-resize textarea
    messageInput.addEventListener('input', function() {
        this.style.height = 'auto';
        this.style.height = (this.scrollHeight) + 'px';
    });

    // Enter to send, Shift+Enter for new line
    messageInput.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    });

    // File input handler
    document.getElementById('fileInput').addEventListener('change', handleFileSelect);
}

// Handle file selection
function handleFileSelect(e) {
    const files = Array.from(e.target.files);
    selectedFiles = [...selectedFiles, ...files];
    renderFilePreview();
}

// Render file preview tags
function renderFilePreview() {
    const preview = document.getElementById('filePreview');
    if (selectedFiles.length === 0) {
        preview.innerHTML = '';
        return;
    }

    preview.innerHTML = selectedFiles.map((file, index) => `
        <div class="file-tag">
            <span>📄 ${file.name}</span>
            <span class="remove-file" onclick="removeFile(${index})">×</span>
        </div>
    `).join('');
}

// Remove file from selection
function removeFile(index) {
    selectedFiles.splice(index, 1);
    renderFilePreview();
}

// Send message - ADD YOUR API CALL HERE
function sendMessage() {
    const input = document.getElementById('messageInput');
    const message = input.value.trim();
    
    if (message === '' && selectedFiles.length === 0) return;
    
    // Hide welcome message
    document.getElementById('welcomeMessage').style.display = 'none';
    
    // Display user message in UI
    if (message) {
        addMessage('user', message, selectedFiles.length > 0 ? selectedFiles : null);
    }
    
    // Clear input and files
    input.value = '';
    input.style.height = 'auto';
    const filesToSend = [...selectedFiles];
    selectedFiles = [];
    renderFilePreview();
    
    // TODO: Add your API call here
    // Example:
    // sendToAPI(message, filesToSend).then(response => {
    //     addMessage('bot', response.text);
    // });
    
    // Temporary: Show typing indicator and mock response
    showTypingIndicator();
    setTimeout(() => {
        hideTypingIndicator();
        addMessage('bot', 'This is a placeholder response. Replace sendMessage() function with your API call.');
    }, 1500);
}

// Send suggestion chip as message
function sendSuggestion(text) {
    document.getElementById('messageInput').value = text;
    sendMessage();
}

// Add message to chat UI
function addMessage(sender, text, files = null) {
    const messagesContainer = document.getElementById('messagesContainer');
    const time = new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
    
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${sender}`;
    
    const avatar = sender === 'bot' ? '🤖' : '👤';
    let fileHTML = '';
    
    if (files && files.length > 0) {
        fileHTML = files.map(f => 
            `<div class="file-attachment">📄 ${f.name}</div>`
        ).join('');
    }
    
    messageDiv.innerHTML = `
        <div class="avatar ${sender}">${avatar}</div>
        <div>
            <div class="message-content">
                ${text}
                ${fileHTML}
            </div>
            <div class="message-time">${time}</div>
        </div>
    `;
    
    messagesContainer.appendChild(messageDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
    
    messages.push({ sender, text, time });
}

// Show typing indicator
function showTypingIndicator() {
    const messagesContainer = document.getElementById('messagesContainer');
    const typingDiv = document.createElement('div');
    typingDiv.className = 'message bot';
    typingDiv.id = 'typingIndicator';
    typingDiv.innerHTML = `
        <div class="avatar bot">🤖</div>
        <div class="typing-indicator active">
            <div class="typing-dot"></div>
            <div class="typing-dot"></div>
            <div class="typing-dot"></div>
        </div>
    `;
    messagesContainer.appendChild(typingDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

// Hide typing indicator
function hideTypingIndicator() {
    const typingIndicator = document.getElementById('typingIndicator');
    if (typingIndicator) {
        typingIndicator.remove();
    }
}

// Navigation: Change class
function changeClass() {
    window.location.href = 'chatbot-class-selector.html';
}

// Navigation: Start new chat
function newChat() {
    messages = [];
    document.getElementById('messagesContainer').innerHTML = `
        <div class="welcome-message" id="welcomeMessage">
            <h2>👋 Welcome!</h2>
            <p>I'm your AI study assistant. Ask me anything about your course materials!</p>
            <div class="welcome-suggestions">
                <div class="suggestion-chip" onclick="sendSuggestion('Explain binary search trees')">
                    Explain binary search trees
                </div>
                <div class="suggestion-chip" onclick="sendSuggestion('What is time complexity?')">
                    What is time complexity?
                </div>
                <div class="suggestion-chip" onclick="sendSuggestion('Summarize the last lecture')">
                    Summarize the last lecture
                </div>
            </div>
        </div>
    `;
}

// Clear chat history
function clearHistory() {
    if (confirm('Are you sure you want to clear all chat history?')) {
        document.getElementById('historyList').innerHTML = '<p style="color: #888; font-size: 14px;">No chat history</p>';
    }
}

// Load previous chat - ADD YOUR API CALL HERE
function loadChat(chatId) {
    // TODO: Add your API call to load chat history
    alert('Loading chat: ' + chatId + '\n\nAdd your API call here to load previous conversations.');
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', init);
