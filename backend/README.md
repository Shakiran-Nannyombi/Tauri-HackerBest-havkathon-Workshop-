# ResearchBase FastAPI Backend Service

This directory contains the Python FastAPI backend service for the **ResearchBase** application.

- **Live Frontend (Vercel):** [https://tauri-hacker-best-havkathon-worksho.vercel.app/](https://tauri-hacker-best-havkathon-worksho.vercel.app/)
- **Render Service Blueprint:** `render.yaml` & `Procfile`

---

## Endpoints Implemented

1. **`POST /api/v1/discover`**
   - Accepts: `{"topic": "research topic string", "discipline": "...", "repositories": ["Kaggle", "Hugging Face"]}`
   - Returns: Live Google AI Studio / Gemma-4 dataset recommendations with repository queries, licenses, and Python acquisition snippets.

2. **`POST /api/v1/verify`**
   - Accepts: `{"dataset_name": "...", "declared_license": "...", "author_reputation": "...", "source_url_or_path": "..."}`
   - Analyzes trust factors: license, author reputation, and provenance indicators.
   - Returns: `trust_score` ("High", "Medium", or "Low"), numerical percentage, and a list of `risk_flags`.

3. **`GET /health`**
   - Returns service health and Google AI Studio API key configuration status.

---

## CORS Configuration

CORS middleware allows:
- Local desktop environments (`localhost:3000`, `localhost:5173`, `app://.`)
- Production Vercel domain: `https://tauri-hacker-best-havkathon-worksho.vercel.app/`
- Wildcard support for Vercel preview URLs via regex: `https://.*\.vercel\.app`

To add custom domains, set the `ALLOWED_ORIGINS` environment variable:
```env
ALLOWED_ORIGINS=https://tauri-hacker-best-havkathon-worksho.vercel.app,http://localhost:3000
```

---

## Running Locally

```bash
# 1. Install dependencies
pip install -r requirements.txt

# 2. Set your Google AI Studio API key
export GEMINI_API_KEY="your-api-key"

# 3. Launch server with hot reloading
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

Interactive OpenAPI Swagger documentation:
`http://localhost:8000/docs`

---

## Deploying to Render

1. On [Render](https://dashboard.render.com), create a new **Web Service** or **Blueprint**.
2. Connect this repository and set the Root Directory to `backend`.
3. Set the Environment Variables:
   - `GEMINI_API_KEY`: Your Google AI Studio API key.
   - `ALLOWED_ORIGINS`: `https://tauri-hacker-best-havkathon-worksho.vercel.app`
4. Deploy!
