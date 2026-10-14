# 👵 ElderEase — AI-Powered Senior Technology Assistant

[![Node.js](https://img.shields.io/badge/Node.js-v18+-68a063?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-18.3-61dafb?style=for-the-badge&logo=react&logoColor=black)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-5.4-646cff?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38bdf8?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![MongoDB Atlas](https://img.shields.io/badge/MongoDB_Atlas-Live-47a248?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com/cloud/atlas)
[![Google Gemini](https://img.shields.io/badge/Google_Gemini-3.5_Flash-4285f4?style=for-the-badge&logo=google&logoColor=white)](https://ai.google.dev/)

> **Empowering Senior Citizens to Master Modern Technology with Patience, Warmth, and Confidence.**

ElderEase is a dedicated digital literacy and assistive platform built specifically for the elderly. By combining a **patient conversational AI tutor**, **multimodal screenshot vision assistance**, **real-time voice recognition and speech feedback**, and an **interactive step-by-step curriculum**, ElderEase bridges the generational digital divide while keeping seniors safe from online scams.

---

## 🌟 Key Features

### 1. 👵 AI Voice Teacher (`/teacher`)
- **Conversational Patience**: Breaks complex digital tasks into single, bite-sized, digestible steps.
- **Natural Voice Input & Audio Playback**: Seniors can speak naturally using their microphone (Web Speech API) and hear gentle, warm explanations spoken back to them.
- **Multilingual Support**: Supports English, Hindi (**हिंदी**), and Marathi (**मराठी**).
- **Clean Chat History**: Automatically isolates and saves chat sessions per user in MongoDB Atlas. Empty/abandoned chats without user messages are never cluttered into the history tab.
- **Instant De-duplication**: History is synchronized cleanly between local storage and Atlas with zero duplicate cards.

### 2. 📚 Curated Digital Skills Library (`/lessons`)
- **21+ Pre-loaded Real-World Lessons**: Practical tutorials tailored for daily Indian and global digital life:
  - *Sending Photos & Voice Notes on WhatsApp*
  - *Making Video Calls to Family & Grandchildren*
  - *Paying Safely via Google Pay & UPI QR Codes*
  - *Booking Train Tickets on IRCTC*
  - *Booking Cabs on Uber / Ola*
  - *Setting Medicine Reminders and Alarms*
  - *Adjusting Phone Font Size and Screen Magnification*
- **Interactive Practice Checks**: Multi-step checkpoints with celebratory feedback to build genuine confidence.

### 3. 🛡️ Scam & Cyber Safety Shield (`/safety`)
- **Suspicious Message Analyzer**: Seniors can paste suspicious WhatsApp messages, SMS texts, or lottery notifications to get an immediate risk rating and reassuring advice.
- **Plain-Language Explanations**: Explains *why* an OTP, bank details request, or urgent APK download link is fraudulent without technical jargon.
- **Emergency Checklist**: Step-by-step immediate actions if a senior suspects they have shared sensitive information.

### 4. 📸 Visual Screenshot Assistant (`/help-screenshot`)
- **Multimodal Vision AI**: Seniors can upload a screenshot of whatever has confused them on their phone.
- **Visual Callouts**: Identifies error popups, prompts, and permissions, highlighting exactly which button to tap and what to avoid.

### 5. 👨‍👩‍👧 Family Progress Dashboard (`/family`)
- **Caregiver Reassurance**: Family members can check which digital skills their elderly loved ones have mastered.
- **Privacy Guaranteed**: Family members can celebrate learning milestones and send encouraging notes while private AI tutoring conversations remain strictly confidential.

### 6. ♿ Senior-First Accessibility Engine
- **Jumbo Touch Targets & High Contrast**: Built with vibrant accessible palettes, high-contrast dark/light modes, and large fonts.
- **Adjustable Voice Rate**: Tune audio playback speed from gentle and slow (0.8x) to regular pace.
- **Zero Hurrying**: Eliminates aggressive timers, complex popups, and small close buttons.

---

## 🏗️ Architecture & Tech Stack

```
ElderEase/
├── client/                     # Frontend Application (React + Vite)
│   ├── src/
│   │   ├── components/         # Reusable UI (SeniorButton, VoiceVisualizer, etc.)
│   │   ├── context/            # AuthContext, AccessibilityContext, SpeechContext
│   │   ├── pages/              # AITeacherPage, Lessons, Safety, Family, Dashboard
│   │   ├── services/           # Axios/Fetch API clients (AI, lessons, safety, etc.)
│   │   └── App.jsx             # Main Router and Accessibility Layout
│   └── vite.config.js          # Vite config with API proxy to port 5001
│
├── server/                     # Backend Application (Node.js + Express)
│   ├── src/
│   │   ├── config/             # MongoDB Atlas connection & env resolution
│   │   ├── controllers/        # AI, Lessons, Auth, Safety, Progress controllers
│   │   ├── models/             # Mongoose schemas (User, Lesson, ChatConversation, etc.)
│   │   ├── routes/             # RESTful API endpoints
│   │   ├── seeds/              # 21 Pre-configured seed lessons
│   │   ├── services/           # Gemini AI multi-model fallback & prompt services
│   │   └── index.js            # Express server entry point (Port 5001)
│   └── package.json
│
└── package.json                # Root package with concurrently dev scripts
```

### Technology Highlights

| Layer | Technology |
|---|---|
| **Frontend Framework** | [React 18](https://reactjs.org/) + [Vite](https://vitejs.dev/) |
| **Styling & UI** | [Tailwind CSS 3.4](https://tailwindcss.com/) + [Lucide Icons](https://lucide.dev/) |
| **Speech & Audio** | Browser [Web Speech API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Speech_API) (`SpeechRecognition` & `SpeechSynthesis`) |
| **Backend Runtime** | [Node.js](https://nodejs.org/) (ES Modules) + [Express.js](https://expressjs.com/) |
| **Database** | [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) with [Mongoose ODM](https://mongoosejs.com/) |
| **AI Intelligence** | [Google Gemini API](https://ai.google.dev/) (`gemini-3.5-flash-lite`, `gemini-3.8-flash`, `gemini-3.5-flash`) |
| **Security & Auth** | JSON Web Tokens (JWT), Bcrypt password hashing, and user-scoped data isolation |

---

## 🚀 Getting Started

### Prerequisites

- **Node.js**: v18.0.0 or higher
- **npm**: v9.0.0 or higher
- **MongoDB**: A free [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) cluster connection string or local MongoDB instance.
- **Google Gemini API Key**: Free API key from [Google AI Studio](https://aistudio.google.com/).

---

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/aditishinde45/PBL-Project.git
   cd PBL-Project
   ```

2. **Install dependencies:**
   ```bash
   # Install root dependencies (concurrently)
   npm install

   # Install client and server dependencies
   npm --prefix server install
   npm --prefix client install
   ```

3. **Configure Environment Variables (`.env`):**
   Create a `.env` file in the root of the project:
   ```env
   PORT=5001
   NODE_ENV=development
   CLIENT_URL=http://localhost:5173

   # MongoDB Connection
   MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.xxxx.mongodb.net/elderease?retryWrites=true&w=majority

   # JWT Secret
   JWT_SECRET=your_secure_jwt_secret_key_2026

   # AI Configuration (Google Gemini)
   AI_PROVIDER=gemini
   AI_BASE_URL=https://generativelanguage.googleapis.com/v1beta/openai
   AI_API_KEY=your_gemini_api_key_here
   AI_MODEL=gemini-3.5-flash-lite
   AI_VISION_MODEL=gemini-3.5-flash-lite
   ```

4. **Seed the Curriculum Lessons:**
   Populate your MongoDB Atlas database with the 21 digital literacy lessons:
   ```bash
   npm run seed
   ```

5. **Start Development Server:**
   Run both the Express API and Vite React client with one command:
   ```bash
   npm run dev
   ```
   - **Frontend App**: `http://localhost:5173`
   - **Backend API**: `http://localhost:5001`
   - **API Health Check**: `http://localhost:5001/api/health`

---

## 📡 API Overview

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| `POST` | `/api/auth/register` | Register senior or family user | Public |
| `POST` | `/api/auth/login` | Login and obtain JWT token | Public |
| `GET` | `/api/auth/me` | Fetch authenticated user profile | Required |
| `POST` | `/api/ai/chat` | Multilingual step-by-step tutoring chat | Optional |
| `GET` | `/api/ai/conversations` | Fetch isolated chat history for user | Required |
| `POST` | `/api/ai/conversations` | Save chat conversation (non-empty only) | Required |
| `DELETE` | `/api/ai/conversations/:id` | Delete conversation record | Required |
| `GET` | `/api/lessons` | List available learning modules | Public |
| `GET` | `/api/lessons/:id` | Get lesson detail with interactive steps | Public |
| `POST` | `/api/safety/analyze` | Scam & fraud text risk analysis | Public |
| `POST` | `/api/vision/analyze-screenshot` | Multimodal visual UI help on screenshot | Public |
| `GET` | `/api/progress` | Fetch user learning streaks & milestones | Required |
| `GET` | `/api/family/connections` | Caregiver & family sharing connections | Required |

---

## 🔒 Privacy & Senior Safety Principles

- **No Data Leakage**: Senior citizens' personal queries and AI chat history are isolated by user ID and are never exposed to caregivers or third parties.
- **No False Quota Alerts**: Automatic multi-tier model fallback ensures the assistant never leaves a senior stranded during temporary network or API surges.
- **Accidental Click Prevention**: History avoids phantom or empty chats when a senior opens the app and closes it without speaking.

---

## 👥 Authors & Academic Context

Developed as a **Project-Based Learning (PBL)** initiative dedicated to human-centric technology, social impact, and senior accessibility.

- **Developer**: Aditi Shinde ([@aditishinde45](https://github.com/aditishinde45))
- **Project**: PBL-Project / ElderEase
- **Repository**: [https://github.com/aditishinde45/PBL-Project](https://github.com/aditishinde45/PBL-Project)

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).