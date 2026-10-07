# ElderEase (एल्डरईज)
### “An AI Companion for Safe and Independent Digital Living”

ElderEase is a comprehensive, human-centered assistive platform designed specifically for senior citizens and their family caregivers. It bridges the digital divide through:
* **Senior-First UX**: High contrast, 200% scalable typography, large touch controls, shallow 2-level navigation, and no confusing technical jargon.
* **Patient Multilingual Conversational AI**: Voice-first companion in Marathi, Hindi, and English that guides seniors one step at a time and provides reassuring comfort.
* **Proactive Medication & Health Reminders**: Voice notifications, [Taken] / [Remind Later] confirmations, and automated caregiver escalations for missed doses.
* **Daily “I Am Okay” Check-In**: One-tap morning check-ins giving peace of mind to elderly parents and children.
* **Emergency Distress & Family Loop**: Dedicated [I NEED HELP] dispatch with optional geolocation, caregiver alarm, and 1-tap family phone connection.
* **Digital Task Guidance & Safe Practice**: Step-by-step modules for WhatsApp, video calling, and a safe mock UPI payment practice environment.
* **Fraud & Scam Protection (“Is This Safe?”)**: Natural language scam analysis with cautious warnings for phishing links, fake utility bills, and bank OTP demands.
* **Chrome Manifest V3 Browser Helper**: Optional browser extension that explains third-party web pages and guides seniors through online forms safely.

---

## Architecture Overview

```
PBL-Project/
├── server/          # Node.js + Express + TypeScript + Prisma ORM Backend (Port 5000)
├── client/          # React 18 + TypeScript + Vite Frontend (Port 3000)
├── extension/       # Chrome Manifest V3 Browser Helper Extension
├── docs/            # Architecture, API, Security, Testing, Demo specifications
└── README.md
```

---

## Quick Start (Development & Evaluation)

### 1. Start Backend Server
```bash
cd server
npm install
npx prisma db push
npx tsx prisma/seed.ts
npm run dev
```
Backend runs at `http://localhost:5000`. Health check available at `http://localhost:5000/api/health`.

### 2. Start Frontend Web Application
In a separate terminal:
```bash
cd client
npm install
npm run dev
```
Frontend runs at `http://localhost:3000`.

---

## Demonstration Accounts & Evaluation

| Role | Login Identifier | Password | Profile Name | Details |
| :--- | :--- | :--- | :--- | :--- |
| **Senior** | `aai@elderease.com` | `aai123` | **Demo Aai (सुलोचना ताई)** | Large high-contrast UI, Marathi/English, voice AI, medicines |
| **Caregiver** | `daughter@elderease.com` | `daughter123` | **Demo Daughter (प्रिया)** | Caregiver dashboard, alerts, prescription scanner |
| **Admin** | `admin@elderease.com` | `admin123` | **System Admin** | CMS for guided tasks, system analytics |

### Development Mode Simulation Panel
Under Caregiver and Admin views, an explicit **DEVELOPMENT MODE** panel allows instant simulation of:
* Immediate Medicine Reminder
* Missed Medicine Escalation
* Missed Daily Check-in Alert
* Emergency Distress Dispatch

---

## Loading Browser Extension into Chrome

1. Open Google Chrome and navigate to `chrome://extensions/`.
2. Turn on **Developer mode** (top right switch).
3. Click **Load unpacked**.
4. Select the `PBL-Project/extension` folder.
5. Click the ElderEase puzzle icon to pin and interact!

---

## Testing & Verification

Run automated test suites:
```bash
npm test
```
Includes database relational integrity, authentication, multilingual AI engine, scam detection, browser extension API, and medicine scheduling.

---

## Documentation
* [Architecture Plan](docs/ARCHITECTURE.md)
* [Database Specification](docs/DATABASE.md)
* [REST API Specification](docs/API.md)
* [Security & Privacy](docs/SECURITY.md)
* [Browser Extension Guide](docs/EXTENSION.md)
* [Testing Matrix](docs/TESTING.md)
* [Setup Guide](docs/SETUP.md)
* [Demo Guide](docs/DEMO.md)
* [Implementation Status Tracker](docs/IMPLEMENTATION_STATUS.md)
