# QuentrexClaw v5.1 — Midnight Pro
**ICT/SMC Crypto Terminal** — 10 high-volume pairs, live Binance WebSocket, full trading toolkit.

---

## 🚀 Quick Start (Local)

```bash
npm install
npm run dev
```
Open http://localhost:5173

## 📦 Build for Production
```bash
npm run build
```
Output → `dist/` folder — ready to deploy anywhere.

---

## ☁️ Deploy to Vercel (Recommended — free)

### Option A — Vercel CLI
```bash
npm install -g vercel
vercel
```
Follow the prompts. Done. Live URL in ~60 seconds.

### Option B — Vercel Dashboard (no CLI)
1. Push this folder to a GitHub repo
2. Go to https://vercel.com → New Project
3. Import your repo → Framework: **Vite** → Deploy

### Option C — Netlify Drop
1. Run `npm run build`
2. Go to https://netlify.com/drop
3. Drag and drop the `dist/` folder → Live instantly

---

## 🔌 Live Features
| Feature | Source |
|---|---|
| Real-time prices | Binance WebSocket (`wss://stream.binance.com`) |
| 10 pairs | BTC ETH SOL BNB XRP DOGE ADA AVAX LINK DOT |
| Candlestick chart | Live tick updates + 60s bar close |
| Session clock | UTC-based 24h radar |
| Killzone timers | Live countdown to next open |

---

## 📁 File Structure
```
quentrexclaw/
├── index.html
├── vite.config.js
├── package.json
├── public/
│   └── favicon.svg
└── src/
    ├── main.jsx
    └── App.jsx      ← entire app lives here
```

---

## ⚙️ Stack
- React 18 + Vite (no TypeScript, zero config needed)
- Zero UI libraries — 100% custom components
- IBM Plex Mono via Google Fonts
- Binance public WebSocket API (no API key required)
