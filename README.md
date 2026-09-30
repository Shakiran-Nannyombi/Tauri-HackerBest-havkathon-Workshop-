# ResearchBase 🔬

> **Intelligent Desktop & Web Dashboard for Academic Dataset Discovery, Provenance Verification, and Research Governance.**

[![Live Web Application](https://img.shields.io/badge/Live%20App-Vercel-blue?style=for-the-badge&logo=vercel)](https://tauri-hacker-best-havkathon-worksho.vercel.app/)
[![Engine](https://img.shields.io/badge/Model-Gemma%204%20(31B--IT)-4F46E5?style=for-the-badge)](https://ai.google.dev/)
[![FastAPI Backend](https://img.shields.io/badge/Backend-FastAPI%20%2B%20Python%203.11-009688?style=for-the-badge&logo=fastapi)](https://render.com)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)

---

## 🌐 Live Deployment

- **Production Frontend (Vercel):** [https://tauri-hacker-best-havkathon-worksho.vercel.app/](https://tauri-hacker-best-havkathon-worksho.vercel.app/)
- **Single-File Standalone HTML Dashboard:** [https://tauri-hacker-best-havkathon-worksho.vercel.app/dashboard.html](https://tauri-hacker-best-havkathon-worksho.vercel.app/dashboard.html)
- **Deployment Documentation:** [`DEPLOYMENT.md`](./DEPLOYMENT.md)

---

## 📖 Overview

**ResearchBase** is an empirical data governance environment built for researchers, data scientists, and academics. It simplifies finding reputable open datasets across academic repositories, calculating objective provenance trust scores, designing standardized data dictionaries, and formatting publication-grade README documentation complying with FAIR data principles and Open Science Framework (OSF) standards.

---

## 🎨 Design & Layout System

- **Clean Minimalist White Canvas:** Surface palette designed around `#FFFFFF` and soft `slate-50` cards.
- **Primary Cobalt Blue Accent:** Vibrant `#2563EB` (`bg-blue-600`, `text-blue-600`) for active tabs, status indicators, and primary actions.
- **Deep Navy Typography:** `#0F172A` high-contrast typography for academic legibility.
- **Toggleable Sidebar Navigation:** Smooth toggle between full expanded mode (`w-64`) and compact icon-only rail (`w-16`).
- **Un-squeezed, Generous Padding:** Spacious navigation bars, rounded-xl tab switchers, and breathable data cards.

---

## ✨ Key Capabilities

### 1. Gemma 4 Academic Research Copilot (Left Panel)
- Real-time conversation powered by **Gemma 4 (31B-IT)** and **Gemini 3.8 Flash**.
- 1-click starter prompts for rapid discovery (`Climate Zenodo`, `License Audit`, `README Gen`).
- Evaluates repository candidates, license restrictions, and sampling bias.

### 2. Active Research Data Grid (Right Panel)
- **Curated Dataset Cards:** Real-time cards covering **Zenodo (CERN DOI)**, **Data.gov**, **Hugging Face**, and **Kaggle**.
- **Structured Trust Scores:** 4-pillar algorithmic evaluation (Provenance, Declared License, Methodology Rigor, Selection Bias Risk).
- **Copyable Python Snippets:** Instant pandas, requests, and huggingface dataset acquisition code.

### 3. Standardized Data Dictionary & Modern Tables
- Formatted tables with subtle borders, zebra hover states, and rounded containers.
- Standard scientific definitions, data types (`Float64`, `Datetime`, `String`, `Categorical`), allowable ranges, and missing value policies.
- 1-click CSV export.

### 4. Publication-Grade README.md Generator
- OSF-compliant research template generator.
- Includes abstract, permanent DOI citations, directory layout blueprints, and APA 7th edition notices.
- 1-click Markdown copy and `.md` file download.

### 5. Multi-Target Architecture
- **Web SPA:** Deployed on [Vercel](https://tauri-hacker-best-havkathon-worksho.vercel.app/).
- **Desktop Application Ready:** Optimized for packaging with **Tauri**, **Electron**, or local webviews.
- **Standalone Single-File HTML:** Portable `/public/dashboard.html` that runs in any browser with zero dependencies.
- **Python FastAPI Service:** Standalone microservice in `/backend` ready for **Render** or Docker deployment.

---

## 🏗️ Architecture

```
                                  +-------------------------------------------------+
                                  | Vercel Deployment                               |
                                  | https://tauri-hacker-best-havkathon-worksho     |
                                  | .vercel.app                                     |
                                  | - React 18 + Vite SPA                           |
                                  | - Tailwind CSS v4                               |
                                  +-------------------------------------------------+
                                                          |
                                      HTTPS REST API      | (VITE_BACKEND_URL)
                                                          v
+------------------------------------+        +-------------------------------------+
| Local Node.js Express Server       |        | Render Python FastAPI Service       |
| - server.ts (Port 3000)            |   OR   | - /backend/main.py (Port $PORT)     |
| - Gemini 3.8 Flash & Google Search |        | - Uvicorn / Gunicorn ASGI           |
| - Static file & HTML serving       |        | - Gemma-4 Google AI Studio Engine   |
+------------------------------------+        +-------------------------------------+
```

---

## 🚀 Quick Start (Local Development)

### Prerequisites
- Node.js 18+ or Bun
- Python 3.10+ (for backend service)
- Google AI Studio API key (`GEMINI_API_KEY`)

### 1. Frontend & Full-Stack Development

```bash
# Clone the repository
git clone https://github.com/your-username/researchbase.git
cd researchbase

# Install dependencies
npm install

# Set environment variables
cp .env.example .env
# Edit .env and supply GEMINI_API_KEY="your-google-ai-studio-api-key"

# Start development server on http://localhost:3000
npm run dev
```

### 2. Standalone Python FastAPI Service (Optional Backend)

```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install requirements
pip install -r requirements.txt

# Run FastAPI server
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```
Interactive Swagger API docs: `http://localhost:8000/docs`

---

## ☁️ Deployment Instructions

### Deploy Frontend to Vercel
1. Import repository on [Vercel](https://vercel.com).
2. Framework preset: **Vite** (auto-configured via `vercel.json`).
3. Set Environment Variable (if using external Render backend):
   - `VITE_BACKEND_URL`: `https://your-backend.onrender.com`
4. Click **Deploy**.

Live production: [https://tauri-hacker-best-havkathon-worksho.vercel.app/](https://tauri-hacker-best-havkathon-worksho.vercel.app/)

### Deploy Backend to Render
1. In [Render Dashboard](https://dashboard.render.com), choose **New Blueprint** and connect repository (`render.yaml`).
2. Set Environment Variables:
   - `GEMINI_API_KEY`: Your Google AI Studio Key.
   - `ALLOWED_ORIGINS`: `https://tauri-hacker-best-havkathon-worksho.vercel.app`
3. Click **Deploy**.

Detailed instructions available in [`DEPLOYMENT.md`](./DEPLOYMENT.md).

---

## 📂 Repository Structure

```
├── .env.example             # Template for API keys & deployment URLs
├── DEPLOYMENT.md            # Detailed Vercel & Render step-by-step guide
├── README.md                # Project documentation & live links
├── render.yaml              # Render Blueprint Infrastructure-as-Code
├── vercel.json              # Vercel Vite routing and build config
├── backend/
│   ├── main.py              # FastAPI application & Gemma-4 endpoints
│   ├── requirements.txt     # Python backend dependencies
│   ├── Procfile             # Render web process definition
│   └── render.yaml          # Subdirectory Render blueprint
├── public/
│   └── dashboard.html       # Standalone single-file HTML & Tailwind dashboard
├── src/
│   ├── components/
│   │   ├── DesktopHeader.tsx        # Titlebar with sidebar toggle & metrics
│   │   ├── Sidebar.tsx              # Toggleable collapsible navigation rail
│   │   ├── DesktopDashboardView.tsx # Split-panel Gemma 4 copilot & data cards
│   │   ├── DatasetDiscovery.tsx     # Repository search & acquisition
│   │   ├── SourceVerification.tsx   # Trust Score audit & bias detection
│   │   ├── DocumentationGenerator.tsx# README & Data dictionary generator
│   │   ├── OrganizationStrategy.tsx # Project folder hierarchies & FAIR plans
│   │   └── FastApiWorkbench.tsx     # Live Python service tester
│   ├── services/
│   │   ├── apiConfig.ts             # Dynamic Vercel / Render API resolver
│   │   └── geminiService.ts         # Google GenAI client integrations
│   ├── App.tsx                      # Root desktop application shell
│   └── main.tsx                     # Entry point
└── server.ts                # Express development & preview server
```

---

## 📜 License & Compliance

Distributed under the **MIT License**. Complies with **FAIR Principles** (Findability, Accessibility, Interoperability, and Reusability) for open scientific research.
