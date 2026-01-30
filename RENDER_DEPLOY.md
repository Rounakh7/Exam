# Deploy the **backend only** on Render

Your repo has **two parts**:
- **Root folder** = Frontend (React + Vite) → deploy on **Vercel** ✅
- **`server` folder** = Backend (Node + Express) → deploy on **Render**

Render failed because it was running the **root** (Vite). You must tell Render to use **only the `server` folder**.

---

## Steps on Render

### 1. Create a **new** Web Service (or edit the existing one)

- Go to [dashboard.render.com](https://dashboard.render.com) → **New +** → **Web Service**
- Connect the **same GitHub repo** you use for Vercel

### 2. Set **Root Directory** to `server`

This is the critical step.

- In the service settings, find **Root Directory**
- Click **Configure** and enter: **`server`**
- Render will then use only the `server` folder (with its own `package.json` and `node index.js`), not the Vite frontend

### 3. Other settings

| Field | Value |
|-------|--------|
| **Name** | `exam-api` (or any name) |
| **Runtime** | Node |
| **Build Command** | `npm install` |
| **Start Command** | `npm start` |

(If Root Directory is `server`, Render runs these commands **inside** `server/`.)

### 4. Deploy

- Click **Create Web Service**
- Wait for the build. It should succeed because it’s now building the **backend** (Express), not Vite

### 5. Get your API URL

- When the service is live, Render shows a URL like:  
  **`https://exam-api-xxxx.onrender.com`**
- Copy this URL

### 6. Connect frontend to this API

- In **Vercel** → your project → **Settings** → **Environment Variables**
- Add: **`VITE_API_URL`** = `https://exam-api-xxxx.onrender.com` (your Render URL, no trailing slash)
- **Redeploy** the frontend on Vercel

---

## Summary

| What | Where | Root Directory |
|------|--------|----------------|
| Frontend (React + Vite) | **Vercel** | (leave default / repo root) |
| Backend (Node + Express) | **Render** | **`server`** |

Once **Root Directory** is set to **`server`** on Render, the backend will run correctly and the “Exited with status 1” error should go away.
