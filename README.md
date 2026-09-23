# 💳 BudgetMind: Smart Expense Tracker

> An AI-powered, cloud-synced personal finance management web application featuring **Google Authentication**, **Firestore User Isolation**, **Receipt Vision AI Extraction**, and personalized **Gemini AI Financial Advice**.

![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)
![Firebase](https://img.shields.io/badge/Firebase_Auth_%26_Firestore-FFCA28?style=for-the-badge&logo=firebase&logoColor=black)
![Gemini AI](https://img.shields.io/badge/Google_Gemini_AI-4285F4?style=for-the-badge&logo=google&logoColor=white)
![Vercel](https://img.shields.io/badge/Vercel_Serverless-000000?style=for-the-badge&logo=vercel&logoColor=white)

---

## 🌟 Key Features

- 🔒 **Google Authentication & Access Control**
  - Full-screen sleek glassmorphism login gate requiring users to sign in with Google via Firebase Auth before accessing their dashboard.
  - Header profile container displaying user photo, name, and sign-out controls.

- 🛡️ **Strict User Data Isolation**
  - All expense entries in Firestore are tagged with `userId` (`currentUser.uid`) and queried with `.where("userId", "==", currentUser.uid)`.
  - Monthly budget goals and custom targets are stored per-user (`monthlyBudget_${uid}`) in `localStorage`.

- 📄 **Smart AI Bill & Receipt Scanner**
  - Upload bills in **PDF**, **Receipt Image (PNG/JPG)**, or **CSV** formats.
  - Powered by **Gemini Vision AI**, automatically reading vendor names, expense totals, and assigning categories ("Food", "Transport", "Shopping", "Education", "Entertainment", "Bills", "Other").

- 📊 **Monthly Summary & Budget Tracking**
  - Automatic category-wise breakdown with custom color bars and percentage metrics.
  - Budget progress bar with dynamic color indicators (`On track`, `Warning`, `Over budget`).

- ⚡ **AI Spending Advisor**
  - One-click financial audit powered by Gemini 1.5/3.1 Flash.
  - Analyzes daily burn rate, remaining budget, days left in the month, and provides actionable bullet points for immediate savings.

---

## 📁 Repository Structure

```
Expense_Tracker/
├── api/
│   ├── advice.js       # Vercel Serverless Function: Gemini AI Spending Advice
│   └── scan-bill.js    # Vercel Serverless Function: Gemini Vision Bill Scanner
├── index.html          # App UI Structure & Firebase SDK Integration
├── script.js           # Core App Logic, Auth Observer & Firestore Handlers
├── style.css           # Glassmorphism Design System & Responsive Layout
├── README.md           # Documentation
└── package.json        # Project Configuration
```

---

## 🛠️ Setup & Installation

### 1. Local Development

1. **Clone the Repository**
   ```bash
   git clone https://github.com/arinchaurasia/Smart_Expense_Tracker.git
   cd Smart_Expense_Tracker
   ```

2. **Open the Application**
   - Open `index.html` directly in your web browser or serve via VS Code **Live Server**.

---

## 🔑 Firebase & API Configuration

### 1. Firebase Authentication & Firestore Setup

1. Go to [Firebase Console](https://console.firebase.google.com/) and create a new project.
2. Enable **Google Authentication** under **Build → Authentication → Sign-in method**.
3. Create a **Firestore Database** in test mode under **Build → Firestore Database**.
4. Register a Web App and replace `firebaseConfig` in `script.js` with your credentials:

```javascript
var firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_PROJECT_ID.appspot.com",
    messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
    appId: "YOUR_APP_ID"
};
```

### 2. Gemini API Setup (Vercel Serverless)

1. Obtain a **Gemini API Key** from [Google AI Studio](https://aistudio.google.com/apikey).
2. When deploying to **Vercel**, add an environment variable:
   - **Key**: `GEMINI_API_KEY`
   - **Value**: `Your_Gemini_API_Key`

---

## 🚀 Deploying to Vercel

```bash
# Install Vercel CLI (optional)
npm install -g vercel

# Deploy project
vercel
```

Make sure `GEMINI_API_KEY` is added to your Vercel Project Environment Variables so the `/api/advice` and `/api/scan-bill` endpoints can interact with Gemini AI.

---

## 👤 Author

Developed & maintained by **Arin Chaurasia** ([@arinchaurasia](https://github.com/arinchaurasia)).