# ElderEase Setup & Installation Guide

This guide details running ElderEase locally in both development and production modes.

## Prerequisites
- **Node.js**: v18.0 or later (v22+ supported)
- **npm**: v9.0 or later
- **Database**: SQLite (default out-of-the-box, zero external setup) OR PostgreSQL

---

## 1. Quick Start (Development Mode)

From the project root:

```bash
# 1. Install dependencies for server and client
cd server && npm install
cd ../client && npm install
cd ../extension && npm install

# 2. Setup SQLite Database with Prisma
cd ../server
npx prisma db push
npx tsx prisma/seed.ts

# 3. Start Server & Client
# In Terminal 1 (Backend - port 5000):
npm run dev

# In Terminal 2 (Frontend - port 3000):
cd ../client
npm run dev
```

The web application will be live at `http://localhost:3000`.

---

## 2. Environment Configuration

### Backend (`server/.env`)
```ini
PORT=5000
DATABASE_URL="file:./dev.db"
JWT_SECRET="elderease_jwt_super_secret_dev_key_2026"
AI_API_KEY="" # Optional: Google Gemini / OpenAI key; defaults to built-in smart AI engine
NODE_ENV="development"
CLIENT_URL="http://localhost:3000"
```

### PostgreSQL (Optional Alternative)
To switch from SQLite to PostgreSQL:
1. Change `provider = "sqlite"` to `provider = "postgresql"` in `server/prisma/schema.prisma`.
2. Update `DATABASE_URL` in `server/.env` (e.g., `postgresql://postgres:password@localhost:5432/elderease`).
3. Run `npx prisma db push`.
