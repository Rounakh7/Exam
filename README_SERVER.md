# Exam App – Server & Database

The app uses a **Node.js server** and **SQLite database** so that users, exams, and results are shared across all devices.

---

## Run on same WiFi (PC + phone on same network)

### 1. Run the server

```bash
cd server
npm install
npm start
```

API: **http://localhost:3001**

### 2. Run the frontend (second terminal)

```bash
npm install
npm run dev
```

Open **http://localhost:5173** (or the **Network** URL, e.g. `http://10.52.195.75:5173`, on another device on the same WiFi).

---

## Use from different WiFi or mobile data

When the phone uses **mobile data** or a **different WiFi**, it cannot reach your PC’s local IP. Use one of these:

### Option A: Tunnel (ngrok) – quick, no deployment

This exposes your PC’s server and frontend with **public URLs** so any device (different WiFi, mobile data) can open the app.

1. **Install ngrok** (one time): https://ngrok.com/download  
   Or run: `npx ngrok@latest http 3001` (no install).

2. **Start the server** (terminal 1):
   ```bash
   cd server
   npm start
   ```

3. **Expose the API** (terminal 2):
   ```bash
   npx ngrok http 3001
   ```
   You’ll see a line like: **Forwarding** `https://abc123.ngrok-free.app` → http://localhost:3001  
   Copy that **https** URL (e.g. `https://abc123.ngrok-free.app`).

4. **Point the frontend at that API URL**  
   In the project root, create a file named `.env` (copy from `.env.example` if you have it) and set:
   ```env
   VITE_API_URL=https://abc123.ngrok-free.app
   ```
   Use your actual ngrok URL (no trailing slash).

5. **Start the frontend** (terminal 3):
   ```bash
   npm run dev
   ```

6. **Expose the frontend** (terminal 4):
   ```bash
   npx ngrok http 5173
   ```
   You’ll get another URL, e.g. `https://xyz789.ngrok-free.app`.

7. **On your phone (mobile data or any WiFi)**  
   Open the **frontend** ngrok URL (e.g. `https://xyz789.ngrok-free.app`) in the browser.  
   Log in with the same student/admin accounts; data is the same because the app uses the API from step 3.

**Notes:**
- Free ngrok URLs change each time you restart ngrok. Update `.env` with the new API URL and restart `npm run dev` if the API URL changes.
- On first open, ngrok free may show a “Visit Site” button; click it to continue.

### Option B: Deploy (permanent URLs)

Deploy the **server** (e.g. Render, Railway, Fly.io) and the **frontend** (e.g. Vercel, Netlify). Set the frontend’s build env to `VITE_API_URL=https://your-deployed-api.com`. Then open the deployed frontend URL from any device (different WiFi, mobile data).

---

## Default admin

- **Username:** `admin`  
- **Password:** `admin123`

Create other users (e.g. `admin@gmail.com`, `abdul@gmail.com`) via **Register**. All data is stored on the server and is the same on every device.

---

## Custom API URL (tunnel or deployed server)

Create a `.env` file in the project root (see `.env.example`):

```env
VITE_API_URL=https://your-api-url.com
```

Then restart the frontend (`npm run dev`). The app will call this URL for the API from any device (same WiFi, different WiFi, or mobile data).
