# API Documentation - Bug Tracking Automation System

Base URL: `http://localhost:5000/api`

---

## 🔐 Authentication Endpoints

### `POST /api/auth/register`
Creates a new user account.
- **Body**: `{ name, email, password, role, department }`
- **Response**: `{ success: true, token, refreshToken, user }`

### `POST /api/auth/login`
Authenticates a user.
- **Body**: `{ email, password }`
- **Response**: `{ success: true, token, refreshToken, user }`

### `GET /api/auth/me`
Fetches current authenticated user profile.
- **Headers**: `Authorization: Bearer <token>`
- **Response**: `{ success: true, user }`

### `POST /api/auth/refresh`
Refreshes access token using valid refresh token.
- **Body**: `{ refreshToken }`
- **Response**: `{ success: true, token }`

---

## 🐞 Bug Management Endpoints

### `GET /api/bugs`
Retrieves bugs with search, filter, and pagination support.
- **Query Parameters**: `search`, `status`, `priority`, `category`, `page`, `limit`
- **Response**: `{ success: true, count, total, page, bugs }`

### `POST /api/bugs`
Creates a new bug, triggers AI summary & priority prediction, and auto-assigns a developer.
- **Form Data**: `title`, `description`, `category`, `priority`, `attachments` (files)
- **Response**: `{ success: true, bug }`

### `GET /api/bugs/:id`
Fetches bug details by ID.

### `PUT /api/bugs/:id`
Updates bug details or status (Kanban workflow drag & drop).

### `DELETE /api/bugs/:id`
Deletes a bug (Admin only).

### `GET /api/bugs/export/:format`
Exports bugs to `csv`, `excel`, or `pdf`.

---

## 🤖 AI Automation Endpoints

### `POST /api/ai/summarize`
Generates a concise summary for long descriptions.
- **Body**: `{ title, description }`

### `POST /api/ai/predict-priority`
Predicts priority and severity levels with reasoning.
- **Body**: `{ title, description }`

### `POST /api/ai/detect-duplicates`
Scans existing bugs for similarity matches.
- **Body**: `{ title, description }`

### `POST /api/ai/suggested-fix`
Generates developer troubleshooting and code remediation steps.
- **Body**: `{ title, description, category }`

---

## 💬 Threaded Discussion Endpoints

### `GET /api/comments/bug/:bugId`
Retrieves threaded comments for a bug.

### `POST /api/comments`
Posts a comment with `@mentions` support.
- **Body**: `{ bugId, content, parentCommentId }`

---

## 📊 Analytics Endpoints

### `GET /api/analytics/dashboard`
Returns KPI counters, status breakdown, priority distribution, and monthly trends.

### `GET /api/analytics/developer-performance`
Returns developer resolution velocity leaderboard metrics.
