# Opening the app on your phone (same Wi‑Fi)

## 1. Run the app on your PC

```bash
npm run dev
```

In the terminal you’ll see something like:

- **Local:**   http://localhost:5173/
- **Network:** http://10.52.195.75:5173/

## 2. Use the **Network** URL on your phone

- On your **phone**, open the browser and go to the **Network** URL (e.g. `http://10.52.195.75:5173/`).
- Do **not** use `localhost` on the phone — that points to the phone itself.

## 3. If it doesn’t open on the phone

1. **Same Wi‑Fi**  
   Phone and PC must be on the **same Wi‑Fi** (same router). Don’t use mobile data on the phone.

2. **Windows Firewall**  
   The first time you run `npm run dev`, Windows may ask “Allow Node.js to accept incoming connections?”  
   - Click **Allow access** (or Allow for Private networks).  
   - If you already chose “Block”, run again and allow when prompted, or:
     - Open **Windows Security** → **Firewall & network protection** → **Allow an app through firewall**
     - Find **Node.js** and enable **Private** (and **Public** if you need it).

3. **Correct IP**  
   The IP (e.g. `10.52.195.75`) can change. After each `npm run dev`, use the **Network** URL shown in the terminal.

4. **Try from PC first**  
   On the same PC, open the Network URL in another browser. If it works there but not on the phone, the problem is usually Wi‑Fi or firewall.

## 4. Data (exams, users) is per device

- **Users:** Same username/password works on every device (account is created on each device when you log in).
- **Exams:** Stored only on the device where the **admin** created them. So:
  - If the admin creates exams on the **PC**, students see those exams only when they open the app on **that same PC** (e.g. in the same browser or another browser on the PC).
  - If the student opens the app on their **phone**, that phone has its own empty storage, so they will see **no exams** unless you add a backend later to share data.

To see exams on the phone, the admin would need to log in on the phone, go to the Admin dashboard, and create exams there (then they’re stored on the phone).
