// Sample class data - replace with API call
const classes = [
    { 
        id: 'cs101', 
        name: 'Computer Science 101', 
        description: 'Introduction to programming, algorithms, and data structures',
        icon: '💻',
        documents: 24,
        conversations: 5
    },
    { 
        id: 'math201', 
        name: 'Calculus II', 
        description: 'Advanced integration, series, and differential equations',
        icon: '📐',
        documents: 18,
        conversations: 3
    },
    { 
        id: 'phys150', 
        name: 'Physics I', 
        description: 'Mechanics, energy, and motion fundamentals',
        icon: '⚡',
        documents: 30,
        conversations: 7
    },
    { 
        id: 'eng210', 
        name: 'Engineering Design', 
        description: 'Design process, prototyping, and project management',
        icon: '⚙️',
        documents: 15,
        conversations: 2
    }
];

// Initialize on page load
function init() {
    renderClasses();
}

// Render class cards
function renderClasses() {
    const classGrid = document.getElementById('classGrid');
    
    classes.forEach(cls => {
        const card = document.createElement('div');
        card.className = 'class-card';
        card.innerHTML = `
            <div class="chat-badge">Chat Ready</div>
            <div class="class-icon">${cls.icon}</div>
            <div class="class-name">${cls.name}</div>
            <div class="class-description">${cls.description}</div>
            <div class="class-stats">
                <div class="stat">
                    <span class="stat-label">Documents</span>
                    <span class="stat-value">${cls.documents}</span>
                </div>
                <div class="stat">
                    <span class="stat-label">Past Chats</span>
                    <span class="stat-value">${cls.conversations}</span>
                </div>
            </div>
        `;
        
        card.addEventListener('click', () => openChat(cls.id, cls.name));
        classGrid.appendChild(card);
    });
}

// Open chat for selected class
function openChat(classId, className) {
    // Store class info in sessionStorage
    sessionStorage.setItem('selectedClass', classId);
    sessionStorage.setItem('selectedClassName', className);
    
    // Navigate to chat interface
    window.location.href = `chatbot-interface.html?class=${classId}`;
}

// Back to home
function goHome() {
    window.location.href = 'index.html';
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', init);
