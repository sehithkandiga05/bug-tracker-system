# Installation & Local Setup Guide

Follow this guide to install, configure, and run the **Bug Tracking Automation System** on your local workstation.

---

## Environment Prerequisites

1. **Node.js**: Install Node.js v18.0.0 or higher.
2. **MongoDB** *(Optional)*: If MongoDB is installed locally or a MongoDB Atlas URI is provided in `backend/.env`, the system will connect automatically. If no MongoDB server is running, the app automatically activates **Dynamic In-Memory Demo Mode** so you can run and test immediately without database configuration!

---

## Step 1: Clone or Navigate to Project Folder
```bash
cd C:\Users\sehit\.gemini\antigravity\scratch\bug-tracker-system
```

---

## Step 2: Backend Setup

1. Open terminal in the backend directory:
   ```bash
   cd backend
   ```
2. Install npm dependencies:
   ```bash
   npm install
   ```
3. Configure `.env` file (Pre-configured defaults provided in `backend/.env`):
   ```env
   PORT=5000
   MONGO_URI=mongodb://127.0.0.1:27017/bug_tracker_db
   JWT_SECRET=super_secret_jwt_key_bug_tracker_2026_antigravity
   JWT_REFRESH_SECRET=super_secret_refresh_key_bug_tracker_2026_antigravity
   GEMINI_API_KEY=your_gemini_api_key_here
   ```
4. Run database seeder (Optional):
   ```bash
   npm run seed
   ```
5. Start backend development server:
   ```bash
   npm run dev
   ```
   *The backend will boot on `http://localhost:5000`*

---

## Step 3: Frontend Setup

1. Open a second terminal window in the frontend directory:
   ```bash
   cd frontend
   ```
2. Install npm dependencies:
   ```bash
   npm install
   ```
3. Start the Vite React development server:
   ```bash
   npm run dev
   ```
4. Open your web browser and navigate to:
   `http://localhost:5173`

---

## Step 4: Login & Role Exploration
Click any of the **1-Click Demo Role** buttons on the top navbar or login page:
- 👑 **Admin**: Full control, user administration, bug deletion.
- 💻 **Developer**: Kanban board status transitions, AI suggested fixes, resolution actions.
- 🧪 **Tester**: Bug creation, QA testing workflows.
- 📝 **Reporter**: Issue submission & discussion tracking.
