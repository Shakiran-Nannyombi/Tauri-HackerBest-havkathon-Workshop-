# ResearchBase FastAPI Backend Service

This directory contains the Python FastAPI backend service for the **ResearchBase** desktop application.

## Endpoints Implemented

1. **`POST /api/v1/discover`**
   - Accepts: `{"topic": "research topic string", "discipline": "...", "repositories": ["Kaggle", "Hugging Face"]}`
   - Returns: Simulated and/or live AI dataset recommendations with repository queries, licenses, and Python acquisition snippets.

2. **`POST /api/v1/verify`**
   - Accepts: `{"dataset_name": "...", "declared_license": "...", "author_reputation": "...", "source_url_or_path": "..."}`
   - Analyzes trust factors: license, author reputation, and provenance indicators.
   - Returns: `trust_score` ("High", "Medium", or "Low"), numerical percentage, and a list of `risk_flags`.

3. **`GET /health`**
   - Returns service health and Google AI Studio API key configuration status.

## CORS Configuration
CORS middleware is pre-configured to allow local desktop apps (Electron, React, Tauri on `localhost:3000`, `localhost:5173`, `app://.`, etc.) to communicate without cross-origin blocks.

## Running the Service

```bash
# 1. Install dependencies
pip install -r requirements.txt

# 2. Set your Google AI Studio API key (optional for AI-augmented discovery)
export GEMINI_API_KEY="your-api-key"

# 3. Launch server with hot reloading
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

Interactive OpenAPI Swagger documentation will be available at:
`http://localhost:8000/docs`
