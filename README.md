# 💰 Smart Expense Tracker

A simple expense tracker web app that helps you track your daily spending, view monthly summaries, set budgets, and get **AI-powered spending advice** using Google's Gemini API.

Built with plain HTML, CSS, and JavaScript — no frameworks, no complicated setup.

![HTML](https://img.shields.io/badge/HTML5-E34F26?style=flat&logo=html5&logoColor=white)
![CSS](https://img.shields.io/badge/CSS3-1572B6?style=flat&logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=flat&logo=javascript&logoColor=black)
![Gemini](https://img.shields.io/badge/Gemini_API-4285F4?style=flat&logo=google&logoColor=white)


## What It Does

- **Add expenses** with name, amount, and category
- **Delete expenses** you don't need anymore
- **Filter by category** to see only specific spending
- **Monthly summary** with category-wise breakdown and visual bars
- **Budget tracking** with a progress bar that changes color
- **AI spending advice** powered by Gemini — gives you personalized tips based on your actual spending


## How to Run

1. Download or clone this repo
2. Open `index.html` in your browser
3. That's it — the app works right away using localStorage

```
git clone https://github.com/arinchaurasia/Smart_Expense_Tracker.git
cd Smart_Expense_Tracker
```

Then just double-click `index.html` or open it with Live Server in VS Code.


## How to Connect Gemini API

The app uses Google's Gemini API to analyze your expenses and give you smart financial tips. Here's how to set it up:

### Step 1: Get a Gemini API Key

1. Go to [Google AI Studio](https://aistudio.google.com/apikey)
2. Sign in with your Google account
3. Click **"Create API Key"**
4. Copy the API key it gives you

### Step 2: Add It to the App

1. Open the app in your browser
2. Scroll down to the **"AI Spending Plan"** section
3. Paste your API key in the **"Gemini API Key"** field
4. Click **Save**
5. Add some expenses, then click **"✨ Get AI Advice"**

The key gets saved in your browser's localStorage so you only need to enter it once. It never gets uploaded anywhere or stored in the code.

### How It Works Behind the Scenes

When you click "Get AI Advice", the app:
1. Collects your current month's expenses (category-wise totals, budget, days left)
2. Sends that data to Gemini API as a prompt
3. Gemini analyzes your spending and returns personalized tips
4. The app displays those tips in a nice card format

The API call uses `fetch()` to send a POST request to:
```
https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-lite:generateContent
```


## How to Connect Firebase (Optional)

If you want your expenses to be saved in a cloud database instead of localStorage (so data persists across devices), you can connect Firebase Firestore.

### Step 1: Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click **"Add Project"**
3. Give it a name (e.g., "expense-tracker") and click Continue
4. Disable Google Analytics (not needed) and click **Create Project**

### Step 2: Enable Firestore

1. In your Firebase project, go to **Build → Firestore Database** from the left sidebar
2. Click **"Create Database"**
3. Choose **"Start in test mode"** (allows read/write without login — fine for learning)
4. Pick a server location close to you and click **Enable**

### Step 3: Register Your Web App

1. Go to **Project Settings** (gear icon in sidebar)
2. Scroll down to **"Your apps"** section
3. Click the **web icon** `</>`
4. Give it a nickname (e.g., "expense-tracker-web")
5. Click **Register App**
6. You'll see a config object like this:

```javascript
const firebaseConfig = {
    apiKey: "AIzaSy...",
    authDomain: "your-project.firebaseapp.com",
    projectId: "your-project-id",
    storageBucket: "your-project.appspot.com",
    messagingSenderId: "123456789",
    appId: "1:123456789:web:abcdef"
};
```

### Step 4: Use It in Your Code

To switch from localStorage to Firebase, you'd import Firebase SDK and replace the save/load functions. Here's the basic idea:

```html
<!-- Add these scripts to index.html before your script.js -->
<script type="module">
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs, deleteDoc, doc } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
</script>
```

Then instead of `localStorage.setItem()`, you'd use `addDoc(collection(db, "expenses"), expense)` to save, and `getDocs(collection(db, "expenses"))` to load.

I kept it with localStorage for now because it works instantly without any setup, which is easier for demos and interviews.


## Project Structure

```
Smart_Expense_Tracker/
├── api/
│   └── advice.js  → Vercel Serverless Function (secure Gemini proxy)
├── index.html     → Page structure (form, cards, sections)
├── style.css      → All styling (gradient, cards, responsive)
├── script.js      → All logic (CRUD, summary, Gemini API)
└── README.md      → This file
```


## How to Deploy on Vercel (Secure API Key)

1. Import your GitHub repository into **[Vercel](https://vercel.com)**.
2. In **Project Settings → Environment Variables**:
   - Key: `GEMINI_API_KEY`
   - Value: `Your_Actual_Gemini_API_Key`
3. Click **Deploy**.

Vercel automatically handles calls to `/api/advice` via the serverless function, keeping your Gemini API key hidden and 100% secure!


## Tech Stack

| Technology | Used For |
|------------|----------|
| HTML5 | Page structure and layout |
| CSS3 | Styling, gradients, animations, responsive design |
| JavaScript | App logic, DOM manipulation, API calls |
| localStorage | Saving expenses and settings in browser |
| Gemini API | AI-powered spending advice |
| Firebase (optional) | Cloud database for persistent storage |


## Features Explained

**localStorage** — Built-in browser storage. Data stays even after you close the browser. We use `JSON.stringify()` to save arrays and `JSON.parse()` to read them back.

**Gemini API** — Google's AI model. We send expense data as a text prompt using `fetch()`, and it returns smart financial advice. The API key is stored locally, never in the source code.

**Monthly Summary** — Filters expenses by current month and groups them by category. Shows percentage bars so you can see where your money goes.

**Budget Progress** — You set a monthly budget, and the progress bar shows how much you've used. Green = good, orange = be careful, red = over budget.


## Screenshots

_Add your own screenshots here after running the app!_


## License

This project is open source. Feel free to use it for learning, interviews, or personal use.

---

Made by [Arin Chaurasia](https://github.com/arinchaurasia)