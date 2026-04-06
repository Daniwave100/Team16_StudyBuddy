# StudyBuddy Frontend

Static HTML/CSS/JavaScript frontend for the StudyBuddy AI study assistant. Provides the user-facing interface for authentication, class management, chatbot interaction, flashcard review, and quizzes.

## Purpose

Deliver a browser-based UI that:
- Lets students sign up, log in, and manage sessions
- Displays a class dashboard for selecting or creating classes
- Provides a chat interface for AI-assisted tutoring per class
- Renders flashcard sets for review
- Presents interactive quizzes with topic and difficulty selection

## Design

### Pages

| File | Purpose |
|---|---|
| `index.html` | Landing page — entry point with links to login/signup |
| `login.html` | Login form with email/password validation |
| `signup.html` | Signup form with email, password, and confirm password validation |
| `dashboard.html` | Class dashboard — shows enrolled classes, user chip, logout |
| `class.html` | Individual class view |
| `quiz.html` | Quiz interface with topic selection for high school and college levels |
| `subject-quiz.html` | Subject-specific quiz page |
| `flashcards-homepage.html` | Browse and select flashcard sets |
| `flashcards-individual.html` | View and flip through a single flashcard set |
| `flashcards-error-page.html` | Error state when flashcards fail to load |
| `chatbot-class-selector.html` | Pick a class before entering the chatbot |
| `chatbot-interface.html` | Main chat UI with message history, file upload, and suggestion chips |
| `StudyBuddyQuiz_Preview.html` | Static quiz design preview |

### JavaScript

| File | Purpose |
|---|---|
| `script.js` | Auth logic — login validation, signup with localStorage persistence, session management (set/clear/check `isLoggedIn`), password show/hide toggle, dashboard initialization with user chip and logout |
| `js/chatbot-interface.js` | Chat controller — message send/receive, file attachment UI, typing indicator, suggestion chips, welcome screen, chat history sidebar. API call to backend is stubbed with a placeholder response. |
| `js/chatbot-class-selector.js` | Renders class cards from hardcoded sample data, stores selection in `sessionStorage`, navigates to chatbot interface |
| `js/api.js` | Backend fetch helper — stub (empty) |
| `js/chat.js` | Chat tab logic — stub (empty) |
| `js/quiz.js` | Quiz tab logic — stub (empty) |
| `js/flashcards.js` | Flashcards tab logic — stub (empty) |
| `js/classes.js` | Dashboard class list logic — stub (empty) |

### CSS

| File | Purpose |
|---|---|
| `style.css` | Global styles for landing, login, signup pages |
| `css/styles.css` | Dashboard and class view styles |
| `css/chatbot-interface.css` | Chat UI styles (messages, input area, sidebar) |
| `css/chatbot-class-selector.css` | Class selector card grid styles |

### Authentication Flow

Authentication is frontend-only using `localStorage`:
1. **Signup** — Validates email format, password length (>=8), match confirmation. Stores `userEmail` and `userPassword` in `localStorage`. Sets `isLoggedIn = "true"`. Redirects to dashboard.
2. **Login** — Compares input against stored `userEmail`/`userPassword`. On match, sets session and redirects.
3. **Dashboard** — Reads `isLoggedIn` flag. If logged in, shows email in user chip and logout button. If not, shows "Guest" mode.
4. **Logout** — Removes `isLoggedIn` from `localStorage` and redirects to landing page.

### Navigation Flow

```
index.html → login.html / signup.html → dashboard.html
dashboard.html → class.html
dashboard.html → chatbot-class-selector.html → chatbot-interface.html
dashboard.html → quiz.html → subject-quiz.html
dashboard.html → flashcards-homepage.html → flashcards-individual.html
```

## Inputs / Outputs

**Inputs:**
- User interaction — form submissions, button clicks, file selections, chat messages

**Outputs:**
- Rendered HTML pages, chat message display, quiz question rendering, flashcard flip UI

## Dependencies

None — pure HTML/CSS/JS with no build step or package manager. Served as static files.

## Running

Open `index.html` in a browser, or serve the `frontend/` directory with any static file server:

```bash
cd artifacts/frontend
python -m http.server 3000
```

Then visit `http://localhost:3000`.

## Known Limitations

- Authentication is localStorage-only with no backend verification. Passwords are stored in plaintext in the browser.
- `api.js`, `chat.js`, `quiz.js`, `flashcards.js`, and `classes.js` are stubs — not yet wired to the backend API.
- `chatbot-interface.js` has a placeholder response instead of a real API call (see the `TODO` comment in `sendMessage()`).
- `chatbot-class-selector.js` uses hardcoded sample class data instead of fetching from the backend.
- No responsive/mobile layout optimization.
