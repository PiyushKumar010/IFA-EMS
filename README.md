# IFA EMS – Deployment Guide

## Overview
Full‑stack employee management system with a Node/Express + MongoDB API (`backend/`) and a Vite + React SPA (`frontend/`). WebSockets (Socket.IO) power the real‑time chat surface. This guide captures the steps needed to ship the project to a production host.

## Requirements
- Node 20+
- npm 10+
- MongoDB database URI (Atlas or self‑hosted)
- Google OAuth Client ID (same project as the authorized frontend origin)

## Environment Configuration
1. Copy the provided examples and fill in the secrets:
   - `cp backend/env.example backend/.env`
   - `cp frontend/env.example frontend/.env`
2. Set the values:
   - `MONGODB_URI` – connection string with credentials.
   - `JWT_SECRET` – long random string.
   - `GOOGLE_CLIENT_ID` – matches the OAuth app used on the frontend.
   - `CORS_ORIGINS` or `FRONTEND_URL` – comma‑separated list of allowed origins (e.g. `https://app.example.com`).
   - `VITE_GOOGLE_CLIENT_ID` – same as the backend value.  
   - Optional `VITE_API_BASE_URL` when serving the frontend from a different domain than the API.

> Tip: keep development values pointing to `http://localhost:5173` (frontend) and `http://localhost:5000` (backend) for cookies to work with `credentials: "include"`.

## Local Development
```bash
cd backend && npm install
cd ../frontend && npm install

# Terminal 1
cd backend
npm run dev

# Terminal 2
cd frontend
npm run dev
```
The Vite dev server proxies `/api` calls to the backend and preserves cookies.

## Production Build & Deployment
1. Build the SPA:
   ```bash
   cd frontend
   npm install
   npm run build
   ```
   This writes the optimized bundle to `frontend/dist/`.
2. Deploy the backend:
   - Commit or upload both `backend/` and the built `frontend/` folder if you plan to serve the SPA from Express.
   - Set the same environment variables you use locally.
   - Start command: `npm start` inside `backend/`.

When `NODE_ENV=production`, Express serves the static React build and automatically falls back to `index.html` for client-side routing.

## Render (backend) + Vercel (frontend)
**Backend on Render**
1. Push this repo to GitHub and create a new **Web Service** on Render pointing to the `backend/` directory.
2. Settings:
   - Build Command: `cd backend && npm install && cd ../frontend && npm install && npm run build`
   - Start Command: `cd backend && npm start`
   - Node version: 20+
3. Environment variables (Render dashboard → Environment):
   ```
   NODE_ENV=production
   PORT=10000
   MONGODB_URI=<your Mongo connection string>
   JWT_SECRET=<long random string>
   GOOGLE_CLIENT_ID=<same as frontend>
   CORS_ORIGINS=https://<your-vercel-domain>.vercel.app
   FRONTEND_URL=https://<your-vercel-domain>.vercel.app
   COOKIE_SAME_SITE=none
   COOKIE_DOMAIN=
   ```
   Add any other secrets (Cloudinary, etc.) as needed. Render injects `PORT`; reference it via `process.env.PORT`.

**Frontend on Vercel**
1. Import the repository in Vercel and choose the `frontend/` workspace.
2. Environment variables (Vercel dashboard → Settings → Environment Variables):
   ```
   VITE_GOOGLE_CLIENT_ID=<same as backend>
   VITE_API_BASE_URL=https://<your-render-service>.onrender.com
   ```
3. Build & Output:
   - Build Command: `npm run build`
   - Output Directory: `dist`
4. After deploy, visit the Vercel URL and confirm API calls are proxied to Render (network tab should show requests to the Render origin).

> Remember to update `CORS_ORIGINS` and `FRONTEND_URL` if you later add a custom domain (`https://app.yourcompany.com`).

## Health Checks & Monitoring
- API base URL: `https://<your-host>/api`
- Websocket namespace: inherits the same origin as the API.
- Logs: the server prints every inbound request plus Socket.IO connection events to aid debugging.

## Useful Scripts
| Location  | Command        | Description                         |
|-----------|----------------|-------------------------------------|
| backend   | `npm run dev`  | Express + Socket.IO with Nodemon    |
| backend   | `npm start`    | Production server (Node)            |
| frontend  | `npm run dev`  | Vite dev server w/ proxy            |
| frontend  | `npm run build`| Production React build (to `dist/`) |

