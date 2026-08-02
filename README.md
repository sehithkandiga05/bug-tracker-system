# Bug Tracking Automation System

Tagline: **Detect • Log • Assign • Track • Resolve Bugs Automatically**

An enterprise-grade, full-stack SaaS application built with **React (Vite)**, **Tailwind CSS**, **Node.js**, **Express**, **MongoDB**, **Socket.io**, and **Gemini 2.5 AI Engine**.

---

## Key Features

### 1. 🤖 AI Automation Powered by Gemini 2.5
- **AI Bug Summary**: Converts verbose bug descriptions into 2-3 sentence summaries.
- **AI Priority & Severity Prediction**: Evaluates bug impact and suggests classification (`Critical`, `High`, `Medium`, `Low`).
- **AI Duplicate Scanner**: Scans database for similar bugs using text similarity algorithms to prevent duplicate logging.
- **AI Troubleshooting & Suggested Fix**: Generates root-cause developer remediation steps.

### 2. ⚡ Real-Time Socket.io Collaboration
- Instant notifications when bugs are created, assigned, or updated.
- Threaded discussion comments with `@mentions` and live broadcast listeners.
- Dynamic drag-and-drop status changes on the Kanban board.

### 3. 🎯 Smart Category Auto-Assignment
- Automatically routes bugs based on domain category:
  - `Frontend` / `UI/UX` &rarr; Frontend Engineer
  - `Backend` / `Security` &rarr; Backend Engineer
  - `Database` &rarr; Database Engineer
  - `DevOps` &rarr; Systems Engineer

### 4. 🔒 Role-Based Access Control (RBAC) & Security
- **Roles**: `Admin`, `Developer`, `Tester`, `Reporter`.
- **Authentication**: JWT Access Token + Refresh Token rotation, bcrypt password hashing.
- **Security Middleware**: Helmet headers, Rate limiting, Mongo injection protection, and Multer file upload sanitization.

### 5. 📊 Data Visualization & Exporters
- Chart.js Dashboard (Status breakdown pie chart, Priority bar chart, Monthly trend line chart).
- Exporters generating **CSV**, **Excel** (`exceljs`), and **PDF** (`pdfkit`) reports.

---

## Quick Start Guide

### Prerequisites
- Node.js (v18.x or higher)
- npm or yarn

### 1. Backend Setup
```bash
cd backend
npm install
npm run seed   # Pre-populates sample users & bugs
npm run dev    # Starts backend server on http://localhost:5000
```

### 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev    # Starts React Vite app on http://localhost:5173
```

---

## Credentials for Testing Roles

| Role | Demo Email | Password |
|---|---|---|
| **Admin** | `admin@bugtracker.system` | `password123` |
| **Developer (Frontend)** | `frontend@bugtracker.system` | `password123` |
| **Developer (Backend)** | `backend@bugtracker.system` | `password123` |
| **Tester (QA)** | `qa@bugtracker.system` | `password123` |
| **Reporter** | `reporter@bugtracker.system` | `password123` |

*Note: The top navbar also features a 1-click Demo Role Selector to instantly switch roles without re-typing passwords.*
