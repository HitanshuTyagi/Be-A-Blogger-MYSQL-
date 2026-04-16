# 🚀 Deployment Guide — Be-A-Blogger

## Flow

```
User → Vercel (React Frontend) → Render (Express Backend) → MySQL (Aiven/Railway)
         :443                        :10000                      :3306
```

---

# Step-by-Step (Follow in Order)

---

## ✅ Step 1 — Push Code to GitHub

1. Create a repo on [github.com](https://github.com) (if not already)
2. Push your code:
```bash
git add -A
git commit -m "ready for deployment"
git push origin main
```
3. Make sure both root files AND `client/` folder are in the same repo

---

## ✅ Step 2 — Create MySQL Database

Render does NOT provide MySQL. Use one of these:

| Provider | Free? | Link |
|---|---|---|
| **Aiven** | ✅ Free MySQL | [aiven.io](https://aiven.io) |
| **Railway** | ✅ Trial credits | [railway.app](https://railway.app) |

1. Sign up on Aiven or Railway
2. Create a new **MySQL** service
3. Wait for it to be **Running**
4. Copy these 5 values (you'll need them in Step 3):
   - **Host** → `DB_HOST`
   - **Port** → `DB_PORT` (usually 3306)
   - **User** → `DB_USER`
   - **Password** → `DB_PASSWORD`
   - **Database** → `DB_NAME`

> ⚠️ Aiven/Railway provides a **CA Certificate** — download it, you may need it for SSL connection.

---

## ✅ Step 3 — Deploy Backend on Render

1. Go to [render.com](https://render.com) → sign up
2. Click **New** → **Web Service**
3. Click **Connect account** → select your GitHub repo
4. Fill these settings:

| Field | Value |
|---|---|
| Name | `be-a-blogger-api` (or anything) |
| Root Directory | `.` (leave empty) |
| Environment | `Node` |
| Build Command | `npm install` |
| Start Command | `npm start` |
| Instance Type | `Free` |

5. Scroll down to **Environment Variables** → click **Add Environment Variable** and add ALL of these:

| Key | Value |
|---|---|
| `DB_HOST` | *(from Step 2)* |
| `DB_PORT` | `3306` |
| `DB_USER` | *(from Step 2)* |
| `DB_PASSWORD` | *(from Step 2)* |
| `DB_NAME` | *(from Step 2)* |
| `JWT_SECRET` | `any-long-random-string-here-2024!@#` |
| `CLIENT_URL` | `https TEMP-placeholder` *(will update in Step 5)* |
| `EMAIL_USER` | your Gmail address |
| `EMAIL_PASS` | Gmail App Password (generate at [myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords)) |
| `EMAIL_TO` | your Gmail address |

> For `CLIENT_URL`, put `https://temp-will-update-later.vercel.app` for now. We'll fix it in Step 5.

6. Click **Create Web Service**
7. Wait for build to finish (2-3 minutes)
8. Once it says **Live**, copy your backend URL from the top:
   - Example: `https://be-a-blogger-api.onrender.com`
   - **Save this URL — you need it in Step 4**

---

## ✅ Step 4 — Deploy Frontend on Vercel

1. Go to [vercel.com](https://vercel.com) → sign up with GitHub
2. Click **Add New** → **Project**
3. Find your repo → click **Import**
4. Configure:

| Field | Value |
|---|---|
| Framework Preset | `Vite` |
| Root Directory | click **Edit** → type `client` → click Continue |
| Build Command | `npm run build` (auto-filled) |
| Output Directory | `dist` (auto-filled) |

5. Expand **Environment Variables** section → add:

| Key | Value |
|---|---|
| `VITE_API_URL` | `https://YOUR-BACKEND-URL.onrender.com/api` |

> Replace `YOUR-BACKEND-URL` with the URL you copied from Step 3.

6. Click **Deploy**
7. Wait for build to finish
8. Copy your frontend URL:
   - Example: `https://be-a-blogger.vercel.app`
   - **Save this URL — you need it in Step 5**

---

## ✅ Step 5 — Connect Frontend & Backend (CORS Fix)

Right now the backend's `CLIENT_URL` is a placeholder. Fix it:

1. Go to [render.com](https://render.com) → click your backend service
2. Click **Environment** in the left sidebar
3. Find `CLIENT_URL` → click **Edit**
4. Change value to your **Vercel URL** from Step 4:
   - Example: `https://be-a-blogger.vercel.app`
5. Click **Save Changes**
6. Render will **auto-redeploy** — wait for it to go Live again

---

## ✅ Step 6 — Seed Admin User

Your database is empty. Create the admin user:

**Option A** — Run locally with production DB credentials:
```bash
# Windows PowerShell
$env:DB_HOST="your-host"
$env:DB_PORT="3306"
$env:DB_USER="your-user"
$env:DB_PASSWORD="your-password"
$env:DB_NAME="your-db"
node seedAdmin.js
```

**Option B** — Register on the live site, then manually set role to `admin` in your MySQL database (using Aiven/Railway SQL console).

---

## ✅ Step 7 — Test Everything

1. Open your **Vercel URL** (frontend)
2. Try **Register** → should work
3. Try **Login** → should redirect to home
4. Try **Create Post** → should save
5. Try **Admin Dashboard** (if admin) → should show stats + posts
6. If anything fails, check:
   - Vercel → **Deployments** → click latest → check **Build Logs**
   - Render → click your service → check **Logs**

---

# ⚠️ Known Limitation: File Uploads

Render's filesystem is **ephemeral** — uploaded images in `/uploads` are **deleted on every deploy/restart**.

For production, switch to cloud storage:
- **Cloudinary** (recommended, free tier)
- **AWS S3**
- **Uploadthing**

Works fine for testing/demo.

---

# 🔧 Local Development

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

# 📝 All Environment Variables (Quick Reference)

### Backend — Render Environment Variables
```
DB_HOST=your-mysql-host
DB_PORT=3306
DB_USER=your-mysql-user
DB_PASSWORD=your-mysql-password
DB_NAME=your-mysql-database
JWT_SECRET=any-long-random-string
CLIENT_URL=https://your-vercel-app.vercel.app
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-gmail-app-password
EMAIL_TO=your-email@gmail.com
```

### Frontend — Vercel Environment Variables
```
VITE_API_URL=https://your-backend.onrender.com/api
```

### Local Development — .env file (backend root)
```
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=1234
DB_NAME=blog_db
JWT_SECRET=blogJwtSuperSecret_2024!@#xYz
CLIENT_URL=http://localhost:5173
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
EMAIL_TO=your-email@gmail.com
```
