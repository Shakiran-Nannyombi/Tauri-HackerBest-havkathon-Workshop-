"""
ResearchBase - Intelligent Academic Dataset Engine (Backend Service)
Built with FastAPI, Google GenAI SDK, and Gemma-4 Model Hooks.

This backend powers the ResearchBase desktop application for discovering,
organizing, verifying, and documenting academic datasets.

To run:
    pip install -r requirements.txt
    export GEMINI_API_KEY="your-google-ai-studio-api-key"
    uvicorn main:app --reload --host 0.0.0.0 --port 8000
"""

import os
import json
from typing import List, Optional, Dict, Any
from fastapi import FastAPI, HTTPException, Query, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from dotenv import load_dotenv

load_dotenv()

# ==============================================================================
# 1. FASTAPI APP INITIALIZATION & CORS CONFIGURATION
# ==============================================================================
# Requirement 3: Set up CORS so a local desktop frontend (Electron, React, etc.)
# can communicate seamlessly with the local backend service.

app = FastAPI(
    title="ResearchBase Academic Engine API",
    description="Backend microservice for academic dataset discovery, provenance audits, and trust scoring.",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

app.add_middleware(
    CORSMiddleware,
    # Allow local desktop frontend environments (localhost Vite, Electron, Tauri, etc.)
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:8000",
        "http://127.0.0.1:8000",
        "app://.",
        "*"  # Allows desktop apps with non-standard file:// or local schemes
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ==============================================================================
# 2. GOOGLE AI STUDIO / GEMMA 4 API CLIENT HOOK
# ==============================================================================
# Requirement 4: Code comments and helper methods explaining how to hook
# these routes directly into Google AI Studio's API client using Gemma 4 ("gemma-4-31b-it").

def get_genai_client():
    """
    Initializes the modern Google GenAI SDK client for Google AI Studio.
    Requires GEMINI_API_KEY in the environment.
    """
    try:
        from google import genai
        api_key = os.environ.get("GEMINI_API_KEY")
        if not api_key:
            return None
        return genai.Client(api_key=api_key)
    except ImportError:
        # Fallback if google-genai is not yet installed in local python environment
        return None


# The recommended model identifier in Google AI Studio for Gemma-4 instructions
GEMMA_MODEL_ID = "gemma-4-31b-it"


# ==============================================================================
# 3. PYDANTIC REQUEST & RESPONSE SCHEMAS
# ==============================================================================

class DatasetItem(BaseModel):
    id: str
    title: str
    repository: str  # e.g., "Kaggle", "Hugging Face", "Zenodo", "Data.gov"
    author_institution: Optional[str] = "Independent / Community Contributor"
    search_query: str
    direct_url: Optional[str] = None
    license: str  # e.g., "CC-BY 4.0", "Apache-2.0", "Unknown"
    trust_score: str = Field(description="Low, Medium, or High")
    trust_percentage: int = Field(default=85, ge=0, le=100)
    description: str
    biases_and_risks: str
    python_snippet: Optional[str] = None


class DiscoverRequest(BaseModel):
    topic: str = Field(..., description="Research topic or scientific hypothesis")
    discipline: Optional[str] = "General Science / Interdisciplinary"
    repositories: Optional[List[str]] = ["Zenodo", "Kaggle", "Hugging Face", "Data.gov"]
    use_ai: Optional[bool] = True


class DiscoverResponse(BaseModel):
    topic: str
    engine: str
    summary: str
    recommended_keywords: List[str]
    datasets: List[DatasetItem]


class VerifyRequest(BaseModel):
    dataset_name: str
    source_url_or_path: Optional[str] = None
    declared_license: Optional[str] = "Unknown"
    author_reputation: Optional[str] = "Unknown"
    provenance_indicators: Optional[str] = None
    sample_columns: Optional[str] = None


class VerifyResponse(BaseModel):
    dataset_name: str
    trust_score: str = Field(description="Low, Medium, or High")
    score_percentage: int = Field(ge=0, le=100)
    verdict_headline: str
    risk_flags: List[str]
    provenance_analysis: str
    licensing_analysis: str
    bias_evaluation: str
    mitigation_checklist: List[str]
    citations: Dict[str, str]


# ==============================================================================
# 4. ENDPOINT: /api/v1/discover (Requirement 1)
# ==============================================================================

@app.post("/api/v1/discover", response_model=DiscoverResponse, tags=["Dataset Discovery"])
async def discover_datasets(request: DiscoverRequest):
    """
    Accepts a research topic string and returns simulated + AI-curated dataset results
    from reputable repositories like Kaggle, Hugging Face, Zenodo, and Data.gov.
    """
    topic_clean = request.topic.strip()
    if not topic_clean:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Research topic string cannot be empty."
        )

    client = get_genai_client() if request.use_ai else None

    # --------------------------------------------------------------------------
    # AI Hook: If Google AI Studio client is available, query Gemma 4 ("gemma-4-31b-it")
    # --------------------------------------------------------------------------
    if client:
        try:
            from google.genai import types

            prompt = f"""
            You are ResearchBase's academic discovery engine.
            The user wants datasets for the following research topic: "{topic_clean}"
            Academic discipline: {request.discipline}
            Preferred repositories: {', '.join(request.repositories or ['Zenodo', 'Kaggle', 'Hugging Face'])}

            Suggest 3-4 realistic or actual accessible datasets from Kaggle, Hugging Face, or Zenodo.
            Evaluate their license, author reputation, and assign a Trust Score (High/Medium/Low).
            
            Return STRICT JSON format matching this schema:
            {{
                "summary": "2-3 sentence overview of open data availability for this topic.",
                "recommended_keywords": ["keyword1", "keyword2", "keyword3"],
                "datasets": [
                    {{
                        "id": "slug-id-1",
                        "title": "Dataset Title",
                        "repository": "Kaggle / Hugging Face / Zenodo",
                        "author_institution": "Author or Lab",
                        "search_query": "Exact query string",
                        "direct_url": "https://...",
                        "license": "CC-BY 4.0 / Apache-2.0 / Unknown",
                        "trust_score": "High",
                        "trust_percentage": 90,
                        "description": "Short description of variables and size",
                        "biases_and_risks": "Potential demographic or temporal bias",
                        "python_snippet": "import pandas as pd\\n..."
                    }}
                ]
            }}
            """

            response = client.models.generate_content(
                model=GEMMA_MODEL_ID,
                contents=prompt,
                config=types.GenerateContentConfig(
                    temperature=0.4,
                    response_mime_type="application/json"
                )
            )

            if response.text:
                data = json.loads(response.text)
                return DiscoverResponse(
                    topic=topic_clean,
                    engine=f"Google AI Studio ({GEMMA_MODEL_ID})",
                    summary=data.get("summary", "Datasets discovered for topic."),
                    recommended_keywords=data.get("recommended_keywords", [topic_clean]),
                    datasets=[DatasetItem(**d) for d in data.get("datasets", [])]
                )
        except Exception as e:
            # Fall back to high-fidelity simulated response if AI call fails or model is loading
            print(f"[ResearchBase] Gemma 4 query encountered exception: {e}. Falling back to simulated repository results.")

    # --------------------------------------------------------------------------
    # Fallback / Simulated Dataset Generator for Offline & Local Desktop Testing
    # --------------------------------------------------------------------------
    simulated_datasets = [
        DatasetItem(
            id="ds-kaggle-01",
            title=f"Kaggle Community Benchmark: {topic_clean.title()}",
            repository="Kaggle",
            author_institution="Data Science Open Research Collaborative",
            search_query=f"{topic_clean} dataset site:kaggle.com/datasets",
            direct_url="https://www.kaggle.com/datasets",
            license="CC-BY-SA 4.0",
            trust_score="Medium",
            trust_percentage=74,
            description=f"Standardized multi-feature tabular dataset curated for empirical modeling of {topic_clean}.",
            biases_and_risks="Crowdsourced annotations; potential demographic skew toward self-reported online cohorts.",
            python_snippet=(
                "import pandas as pd\n"
                "# Ingestion script using Kaggle CLI or pandas\n"
                "df = pd.read_csv('kaggle_dataset.csv')\n"
                "print(df.info())\n"
                "print('Missingness Summary:\\n', df.isna().mean())"
            )
        ),
        DatasetItem(
            id="ds-hf-02",
            title=f"Hugging Face Multimodal Corpus for {topic_clean.title()}",
            repository="Hugging Face",
            author_institution="Open Academic Data Initiative",
            search_query=f"{topic_clean} site:huggingface.co/datasets",
            direct_url="https://huggingface.co/datasets",
            license="Apache-2.0",
            trust_score="High",
            trust_percentage=91,
            description="Peer-reviewed multimodal research corpus partitioned into train, validation, and out-of-distribution test splits.",
            biases_and_risks="English-language text dominance; longitudinal drift over multi-year collection intervals.",
            python_snippet=(
                "from datasets import load_dataset\n"
                f"# Streaming dataset from Hugging Face Hub\n"
                f"ds = load_dataset('academic-org/{topic_clean.lower().replace(' ', '-')}', split='train')\n"
                "print('Sample instance:', ds[0])"
            )
        ),
        DatasetItem(
            id="ds-zenodo-03",
            title=f"Zenodo Institutional Archive: {topic_clean.title()} (CERN DOI)",
            repository="Zenodo",
            author_institution="European Open Science Cloud (EOSC)",
            search_query=f"{topic_clean} doi:10.5281/zenodo site:zenodo.org",
            direct_url="https://zenodo.org",
            license="Creative Commons Attribution 4.0 International (CC-BY 4.0)",
            trust_score="High",
            trust_percentage=96,
            description="Calibrated research measurements with permanent DOI reference, sensor metadata, and open FAIR data compliance.",
            biases_and_risks="Spatial sensor density biased toward urban observation nodes.",
            python_snippet=(
                "import urllib.request\n"
                "import pandas as pd\n"
                "# Direct DOI-linked parquet ingestion\n"
                "df = pd.read_parquet('https://zenodo.org/record/sample/data.parquet')\n"
                "print(df.describe())"
            )
        )
    ]

    return DiscoverResponse(
        topic=topic_clean,
        engine="ResearchBase Simulated Repository Engine (Offline Mode / Gemma 4 Compatible)",
        summary=f"Discovered 3 verified repository sources addressing '{topic_clean}' across Kaggle, Hugging Face, and Zenodo.",
        recommended_keywords=[
            f"{topic_clean} benchmark",
            f"{topic_clean} longitudinal dataset",
            f"{topic_clean} ground truth open data"
        ],
        datasets=simulated_datasets
    )


# ==============================================================================
# 5. ENDPOINT: /api/v1/verify (Requirement 2)
# ==============================================================================

@app.post("/api/v1/verify", response_model=VerifyResponse, tags=["Source Verification"])
async def verify_dataset(request: VerifyRequest):
    """
    Requirement 2: Analyzes dataset metadata, source path, or repository URL.
    Evaluates trust factors (license, author reputation, provenance indicators),
    and returns a JSON payload with 'trust_score' (Low/Medium/High) and risk flags.
    """
    name = request.dataset_name.strip()
    if not name:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="dataset_name is required for verification."
        )

    license_str = (request.declared_license or "Unknown").strip()
    author = (request.author_reputation or "Unknown").strip()
    provenance = (request.provenance_indicators or "None provided").strip()
    source = request.source_url_or_path or "Local / Unspecified"

    client = get_genai_client()

    # --------------------------------------------------------------------------
    # AI Hook: Gemma 4 verification query
    # --------------------------------------------------------------------------
    if client:
        try:
            from google.genai import types

            prompt = f"""
            Perform an academic provenance and trust audit for this research dataset:
            Dataset Name: "{name}"
            Source URL or File Path: "{source}"
            Declared License: "{license_str}"
            Author / Reputation: "{author}"
            Provenance Indicators: "{provenance}"
            Sample Columns: "{request.sample_columns or 'Not provided'}"

            Evaluate:
            1. License enforceability (CC-BY, Apache-2.0 vs Unknown/Proprietary).
            2. Author institutional backing (University/Gov agency vs Anonymous scraper).
            3. Risk of selection biases.
            
            Return STRICT JSON:
            {{
                "trust_score": "High" | "Medium" | "Low",
                "score_percentage": 88,
                "verdict_headline": "One sentence summary of reliability.",
                "risk_flags": ["Risk flag 1", "Risk flag 2"],
                "provenance_analysis": "Detailed provenance breakdown",
                "licensing_analysis": "Detailed licensing evaluation",
                "bias_evaluation": "Selection bias evaluation",
                "mitigation_checklist": ["Action 1", "Action 2"],
                "citations": {{
                    "apa": "APA 7th citation",
                    "bibtex": "@misc{{...}}"
                }}
            }}
            """

            response = client.models.generate_content(
                model=GEMMA_MODEL_ID,
                contents=prompt,
                config=types.GenerateContentConfig(
                    temperature=0.3,
                    response_mime_type="application/json"
                )
            )

            if response.text:
                data = json.loads(response.text)
                return VerifyResponse(
                    dataset_name=name,
                    trust_score=data.get("trust_score", "Medium"),
                    score_percentage=int(data.get("score_percentage", 75)),
                    verdict_headline=data.get("verdict_headline", "Audit completed."),
                    risk_flags=data.get("risk_flags", []),
                    provenance_analysis=data.get("provenance_analysis", ""),
                    licensing_analysis=data.get("licensing_analysis", ""),
                    bias_evaluation=data.get("bias_evaluation", ""),
                    mitigation_checklist=data.get("mitigation_checklist", []),
                    citations=data.get("citations", {
                        "apa": f"{author}. (2026). {name}. {source}.",
                        "bibtex": f"@misc{{dataset,\n  author = {{{author}}},\n  title = {{{name}}},\n  year = {{2026}}\n}}"
                    })
                )
        except Exception as e:
            print(f"[ResearchBase] Gemma 4 verification error: {e}. Using deterministic heuristic audit.")

    # --------------------------------------------------------------------------
    # Deterministic Rule-Based Trust Scoring Engine
    # --------------------------------------------------------------------------
    risk_flags = []
    base_score = 75

    # 1. License factor
    norm_lic = license_str.lower()
    if "unknown" in norm_lic or "no license" in norm_lic or "none" in norm_lic:
        risk_flags.append("Missing License: No declared reuse permissions; publication creates copyright exposure.")
        base_score -= 30
    elif any(l in norm_lic for l in ["cc0", "public domain", "cc-by", "apache", "mit"]):
        base_score += 15
    elif "non-commercial" in norm_lic or "cc-by-nc" in norm_lic:
        risk_flags.append("Non-Commercial Constraint (NC): Restricted from commercial reproduction or industry sponsorship.")
        base_score -= 10

    # 2. Author & Provenance factor
    norm_auth = author.lower()
    if "anon" in norm_auth or "unknown" in norm_auth or "unverified" in norm_auth:
        risk_flags.append("Unverified Provenance: Contributed by an independent or anonymous uploader without institutional peer review.")
        base_score -= 20
    elif any(a in norm_auth for a in ["university", "institute", "laboratory", "cern", "gov", "agency"]):
        base_score += 10

    # 3. Source path / format
    if "scrape" in source.lower() or "crawl" in source.lower():
        risk_flags.append("Web Scraping Risk: High likelihood of bot contamination, duplicate DOM elements, and survivor bias.")
        base_score -= 15

    score_percentage = max(10, min(98, base_score))

    if score_percentage >= 80:
        trust_score = "High"
        verdict = "High academic reliability; clear legal reuse terms and documented institutional provenance."
    elif score_percentage >= 50:
        trust_score = "Medium"
        verdict = "Moderate reliability; requires license confirmation and demographic bias adjustment prior to publication."
    else:
        trust_score = "Low"
        verdict = "Critical risks identified; missing license or unverified provenance creates publication vulnerability."

    return VerifyResponse(
        dataset_name=name,
        trust_score=trust_score,
        score_percentage=score_percentage,
        verdict_headline=verdict,
        risk_flags=risk_flags,
        provenance_analysis=(
            f"Source associated with '{author}'. Verified institutional repositories like Zenodo or official government "
            f"data portals offer higher provenance durability than unmoderated user uploads."
        ),
        licensing_analysis=(
            f"License declared as '{license_str}'. Always preserve attribution and ensure compatibility with "
            f"open-access publishing mandates (e.g. Plan S)."
        ),
        bias_evaluation=(
            "Assess potential geographic, temporal, and demographic sampling skew. Ensure sample distribution "
            "aligns with your scientific target population."
        ),
        mitigation_checklist=[
            "Verify license terms with original data maintainers if ambiguous.",
            "Record exact acquisition date and repository commit hash / DOI in research methodology.",
            "Conduct missingness and outlier distribution audits before running inferential regressions."
        ],
        citations={
            "apa": f"{author if author != 'Unknown' else 'Contributor'}. (2026). {name} [Data set]. {source}.",
            "bibtex": (
                f"@misc{{{name.lower().replace(' ', '_')}_2026,\n"
                f"  author = {{{author}}},\n"
                f"  title = {{{name}}},\n"
                f"  year = {{2026}},\n"
                f"  url = {{{source}}}\n"
                f"}}"
            )
        }
    )


# ==============================================================================
# 6. HEALTH CHECK
# ==============================================================================

@app.get("/health", tags=["System"])
async def health_check():
    return {
        "status": "healthy",
        "service": "ResearchBase FastAPI Backend",
        "model_hook": GEMMA_MODEL_ID,
        "ai_studio_api_key_configured": bool(os.environ.get("GEMINI_API_KEY"))
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
