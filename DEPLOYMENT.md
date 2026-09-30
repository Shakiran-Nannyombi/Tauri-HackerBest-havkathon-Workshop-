# Deployment Guide: ResearchBase on Vercel (Frontend) & Render (Backend)

This guide walks you through deploying **ResearchBase** with the frontend hosted on **Vercel** and the Python FastAPI backend service hosted on **Render**.

---

## Architecture Overview

```
+-------------------------------------------------+
| Vercel (Frontend SPA)                           |
| - Vite + React + Tailwind CSS                   |
| - Base URL: https://your-app.vercel.app         |
| - Connects to backend via VITE_BACKEND_URL      |
+-------------------------------------------------+
                        |
                        | HTTPS (CORS Enabled)
                        v
+-------------------------------------------------+
| Render (Backend Service)                        |
| - Python 3.11 + FastAPI + Uvicorn               |
| - Base URL: https://your-backend.onrender.com   |
| - Google AI Studio (Gemma-4 & Gemini API)       |
+-------------------------------------------------+
```

---

## Part 1: Deploy Backend to Render

### Option A: Using Render Blueprint (`render.yaml`) — Recommended

1. Push your repository to GitHub or GitLab.
2. In the [Render Dashboard](https://dashboard.render.com), click **New +** > **Blueprint**.
3. Connect your repository.
4. Render will automatically detect `/render.yaml` and configure:
   - **Root Directory:** `backend`
   - **Environment:** `Python`
   - **Build Command:** `pip install -r requirements.txt`
   - **Start Command:** `uvicorn main:app --host 0.0.0.0 --port $PORT`
5. In the Environment Variables section, add:
   - `GEMINI_API_KEY`: Your Google AI Studio API key.
   - `ALLOWED_ORIGINS`: `https://*.vercel.app` (or your specific Vercel domain).
6. Click **Apply**. Once deployed, copy your Render service URL (e.g., `https://researchbase-backend.onrender.com`).

---

### Option B: Manual Web Service Setup on Render

1. Click **New +** > **Web Service**.
2. Select your repository.
3. Configure the settings:
   - **Name:** `researchbase-backend`
   - **Root Directory:** `backend`
   - **Runtime:** `Python 3`
   - **Build Command:** `pip install -r requirements.txt`
   - **Start Command:** `uvicorn main:app --host 0.0.0.0 --port $PORT`
   - **Plan:** Free or Starter
4. Under **Advanced** > **Environment Variables**, add:
   - `GEMINI_API_KEY` = `your-google-ai-studio-api-key`
   - `PYTHON_VERSION` = `3.11.8`
   - `ALLOWED_ORIGINS` = `https://*.vercel.app`
5. Click **Deploy Web Service**.

Verify deployment by visiting:
`https://your-backend.onrender.com/health` (should return `{"status": "healthy"}`)
`https://your-backend.onrender.com/docs` (interactive Swagger UI)

---

## Part 2: Deploy Frontend to Vercel

1. In the [Vercel Dashboard](https://vercel.com), click **Add New...** > **Project**.
2. Import your GitHub repository.
3. Vercel will detect Vite automatically:
   - **Framework Preset:** `Vite`
   - **Root Directory:** `./`
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
4. Expand **Environment Variables** and add:
   - `VITE_BACKEND_URL`: Paste your Render URL from Part 1 (e.g., `https://researchbase-backend.onrender.com`).
5. Click **Deploy**.

Vercel will build the frontend and deploy it to a `https://<project-name>.vercel.app` domain. The included `vercel.json` ensures all client-side routes and static files are served seamlessly.

---

## Part 3: Connecting the Services

1. Copy your final Vercel URL (e.g., `https://researchbase.vercel.app`).
2. Go back to your Render Dashboard > `researchbase-backend` > **Environment**.
3. Update `ALLOWED_ORIGINS` to include your Vercel URL:
   ```env
   ALLOWED_ORIGINS=https://researchbase.vercel.app,http://localhost:3000
   ```
4. Click **Save Changes** (Render will automatically re-deploy with updated CORS rules).
