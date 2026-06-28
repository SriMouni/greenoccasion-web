# Green Occasion JMS — Public Site (`greenoccasion-web`)

A **static reading site** for the Green Occasion environmental research library. It has no
backend and no database of its own — it reads everything from the Green Occasion **API** at
runtime (papers, topics, authors, paper detail, downloads).

The admin/editorial application and the backend live in a **separate repository**
(`greenoccasion-admin`).

## Tech
React 19 · React Router · Tailwind v4 · Vite · lucide-react · motion. That's it — no server code.

## Develop
```bash
npm install
npm run dev          # http://localhost:3000  (proxies /api + /uploads to localhost:3001)
```
Run the backend (the admin repo) on `:3001` so the dev proxy can reach it. To point the dev
proxy elsewhere: `DEV_API_TARGET=https://api.example.com npm run dev`.

## Build (static)
```bash
npm run build        # outputs ./dist
npm run preview      # preview the production build
```

## Configure the API origin (production)
The static build talks to the backend cross-origin. Set the backend URL at **build time**:
```bash
# .env (or your host's build env)
VITE_API_BASE_URL=https://api.greenoccasion.in
```
All `/api` and `/uploads` requests are then prefixed with it (see `src/lib/api-base.ts`).
The backend must allow CORS for this site's origin (it does by default).

## Deploy — Cloudflare Pages (recommended, free)
- **Build command:** `npm run build`
- **Output directory:** `dist`
- **Environment variable:** `VITE_API_BASE_URL = https://<your-backend-host>`
- SPA routing is handled by `public/_redirects` (`/* /index.html 200`).

Works the same on Netlify (uses `_redirects`) or Vercel (add a rewrite to `/index.html`).
