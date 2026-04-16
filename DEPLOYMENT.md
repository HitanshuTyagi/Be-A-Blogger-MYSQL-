# 🚀 Deployment Guide — Be-A-Blogger

## Architecture

```
Vercel (Frontend)  →  Render (Backend API)  →  MySQL (Aiven/Railway)
   React/Vite           Express/Node             Database
   :443                 :10000                   :3306
```

---

## Prerequisites

- Push your code to a **GitHub repo** (root + `client/` folder together in same repo)
- Accounts on: [GitHub](https://github.com), [Vercel](https://vercel.com), [Render](https://render.com)

---

## Step 1 — MySQL Database

Render doesn't offer free MySQL, so use one of these:

| Provider | Free Tier | URL |
|---|---|---|
| **Aiven** | ✅ Free MySQL | [aiven.io](https://aiven.io) |
| **Railway** | ✅ Trial credits | [railway.app](https://railway.app) |
| **PlanetScale** | ✅ Free (Vitess) | [planetscale.com](https://planetscale.com) |

1. Create a MySQL database on any of the above
2. Note down these connection details:
   - `DB_HOST`
   - `DB_PORT` (usually 3306)
   - `DB_USER`
   - `DB_PASSWORD`
   - `DB_NAME`

---

## Step 2 — Backend on Render

1. Go to [render.com](https://render.com) → **New** → **Web Service**
2. Connect your GitHub repo
3. Configure:

| Setting | Value |
|---|---|
| **Root Directory** | `.` (leave empty) |
| **Environment** | `Node` |
| **Build Command** | `npm install` |
| **Start Command** | `npm start` |
| **Instance Type** | Free |

4. Add **Environment Variables**:

| Key | Value |
|---|---|
| `DB_HOST` | your MySQL host |
| `DB_PORT` | 3306 |
| `DB_USER` | your MySQL user |
| `DB_PASSWORD` | your MySQL password |
| `DB_NAME` | your MySQL database name |
| `JWT_SECRET` | any long random string (e.g. `mySuperSecretJwtKey_2024!@#xYz`) |
| `CLIENT_URL` | `https://your-vercel-app.vercel.app` (add after Step 3) |
| `EMAIL_USER` | your Gmail address |
| `EMAIL_PASS` | Gmail App Password (not your regular password) |
| `EMAIL_TO` | your Gmail address |

5. Click **Deploy**
6. Note your backend URL: `https://your-backend.onrender.com`

---

## Step 3 — Frontend on Vercel

1. Go to [vercel.com](https://vercel.com) → **New Project**
2. Import your GitHub repo
3. Configure:

| Setting | Value |
|---|---|
| **Root Directory** | `client` |
| **Framework Preset** | `Vite` |

4. Add **Environment Variable**:

| Key | Value |
|---|---|
| `VITE_API_URL` | `https://your-backend.onrender.com/api` |

5. Click **Deploy**
6. Note your frontend URL: `https://your-app.vercel.app`

---

## Step 4 — Connect Frontend & Backend

1. Go back to **Render** → your backend service → **Environment**
2. Set `CLIENT_URL` = `https://your-app.vercel.app`
3. Redeploy the backend (Render → Manual Deploy → Deploy latest commit)

---

## Step 5 — Seed Admin User

Run this **locally** with your **production** DB credentials:

```bash
DB_HOST=your-host DB_PORT=3306 DB_USER=your-user DB_PASSWORD=your-pass DB_NAME=your-db node seedAdmin.js
```

This creates the default admin user so you can log in.

---

## ⚠️ Important: File Uploads

Render's filesystem is **ephemeral** — uploaded images in `/uploads` will be **deleted on each deploy/restart**.

For a production app, switch to cloud storage:
- **Cloudinary** (recommended, free tier available)
- **AWS S3**
- **Uploadthing**

This works fine for testing/demo purposes though.

---

## 🔧 Local Development

```bash
# Install dependencies
npm install
cd client && npm install && cd ..

# Start both servers
npm run dev
```

- Frontend: `http://localhost:5173`
- Backend: `http://localhost:3001`

---

## 📝 Environment Variables Summary

### Backend (.env)
```
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=1234
DB_NAME=blog_db
JWT_SECRET=blogJwtSuperSecret_2024!@#xYz
PORT=3001
CLIENT_URL=http://localhost:5173
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
EMAIL_TO=your-email@gmail.com
```

### Frontend (Vercel env vars)
```
VITE_API_URL=http://localhost:3001/api   # for local dev
VITE_API_URL=https://your-backend.onrender.com/api   # for production
```
