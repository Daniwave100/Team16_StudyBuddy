# StudyBuddy User Guide

This guide walks through every core feature of StudyBuddy from the end-user perspective.

---

## Getting Started

### 1. Create an Account

1. Go to the landing page (`index.html`) and click **Sign Up**.
2. Enter your email and a password, then click **Create Account**.
3. You'll be redirected to your **Dashboard**.

### 2. Log In

1. From the landing page, click **Log In**.
2. Enter your credentials and click **Login**.
3. You'll land on your Dashboard.

> Your session is stored in the browser's localStorage. You stay logged in until you explicitly log out.

---

## Dashboard — Managing Classes

The Dashboard is your home base. It shows all your classes.

- **Add a class** — Click "Add Class" or the `+` button and give it a name.
- **Open a class** — Click any class card to go to the class view.

---

## Uploading Course Materials

From inside a class:

1. Click **Upload** (or the upload area).
2. Select one or more files — **PDF**, **DOCX**, or **TXT** are supported.
3. Click **Upload** to ingest the files.

The backend parses each file into ~900-character chunks, embeds them with OpenAI, and stores them in the vector store. A success message will confirm how many files and chunks were indexed.

> **Tip:** Upload lecture slides, notes, or readings before using Chat, Flashcards, or Quiz — those features pull from your uploaded content.

---

## Chat — AI Tutor

1. From the Dashboard, click **Chatbot** or navigate to the class and open Chat.
2. Select the class you want to chat about (if prompted).
3. Type a question in the message box and press **Send** (or Enter).
4. The AI retrieves relevant passages from your uploaded materials and answers your question in context.

**What to ask:**
- "Explain the difference between mitosis and meiosis."
- "What were the main causes of World War I according to my notes?"
- "Summarize the key concepts from this chapter."

Chat sessions are preserved within a browser session. Each conversation has a unique session ID.

---

## Flashcards

1. Navigate to a class and click **Flashcards**.
2. Click **Generate Flashcards**.
3. (Optional) Enter a focus topic to narrow the cards to a specific subject area.
4. Set the number of cards (default: 10) and click **Generate**.
5. Browse cards by clicking through them — the front shows the question/term, the back shows the answer/definition.

Previously generated sets are listed and can be reopened at any time.

---

## Quizzes

### Taking a Quiz

1. Navigate to a class and click **Quiz**.
2. Select a quiz level (High School or College) or choose a subject-specific quiz.
3. Answer each multiple-choice question by clicking your selection.
4. Click **Submit** when finished.
5. View your score and per-question feedback including the correct answer and explanation.

### Generating a New Quiz

1. From the Quiz page, click **Generate Quiz**.
2. Enter a title and optional focus topic.
3. Set the number of questions and difficulty.
4. Click **Generate** — the quiz is created from your uploaded materials.

Quiz history and past scores can be viewed from the quiz page.

---

## Logging Out

Click your profile / avatar icon and select **Log Out**. Your session is cleared from localStorage.

---

## Troubleshooting

| Problem | What to check |
|---------|--------------|
| Chat gives generic answers | Make sure you've uploaded course materials for that class first |
| Upload fails | Only PDF, DOCX, and TXT are supported; check file isn't corrupted |
| Blank screen on a page | Check the browser console for JS errors; make sure the backend is running |
| "Failed to fetch" errors | Confirm the backend is running on `http://localhost:8000` |
| Session lost on refresh | This is expected in the current build — localStorage auth only |
