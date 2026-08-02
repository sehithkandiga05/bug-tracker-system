# Production Deployment Guide

This document covers deploying the **Bug Tracking Automation System** to cloud infrastructure:
- **Frontend**: Vercel
- **Backend**: Render
- **Database**: MongoDB Atlas

---

## 1. Database Deployment (MongoDB Atlas)

1. Sign up at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
2. Create a new Cluster (M0 Free Tier or M10 Production).
3. Under **Database Access**, create a database user with password.
4. Under **Network Access**, add IP address `0.0.0.0/0` (allow access from anywhere).
5. Copy the MongoDB Connection String:
   `mongodb+srv://<username>:<password>@cluster0.mongodb.net/bug_tracker_db?retryWrites=true&w=majority`

---

## 2. Backend Deployment (Render)

1. Push your repository to GitHub / GitLab.
2. Sign in to [Render](https://render.com/).
3. Click **New +** &rarr; **Web Service**.
4. Connect your repository and select the `backend` directory.
5. Configure parameters:
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `node server.js`
6. Add Environment Variables:
   - `NODE_ENV`: `production`
   - `MONGO_URI`: `<Your MongoDB Atlas Connection String>`
   - `JWT_SECRET`: `<Secure Random 64-char string>`
   - `JWT_REFRESH_SECRET`: `<Secure Random 64-char string>`
   - `GEMINI_API_KEY`: `<Your Gemini API Key>`
   - `CLIENT_URL`: `https://your-frontend.vercel.app`
7. Click **Create Web Service**. Note the deployed backend URL (e.g. `https://bug-tracker-backend.onrender.com`).

---

## 3. Frontend Deployment (Vercel)

1. Sign in to [Vercel](https://vercel.com/).
2. Click **Add New** &rarr; **Project**.
3. Import your repository and select the `frontend` directory as Root Directory.
4. Configure Framework Preset: **Vite**.
5. Set Build & Output Settings:
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
6. Add Environment Variables / Rewrites:
   Configure `vercel.json` in `frontend/`:
   ```json
   {
     "rewrites": [
       { "source": "/api/(.*)", "destination": "https://bug-tracker-backend.onrender.com/api/$1" },
       { "source": "/(.*)", "destination": "/index.html" }
     ]
   }
   ```
7. Click **Deploy**. Your SaaS application is now live on Vercel!
