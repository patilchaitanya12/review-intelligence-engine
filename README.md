# Review Intelligence Engine

Turn any Amazon product URL into a full competitive strategy report — in 30 seconds.

Paste your product URL + competitor URLs → get pros/cons, competitive strengths/weaknesses, and actionable business insights powered by an LLM pipeline.

---

## What It Does

| Stage | What happens |
|---|---|
| **Scrape** | Fetches Amazon reviews for your product and competitors |
| **Analyze** | LLM extracts pros, cons, and use cases from raw reviews |
| **Compare** | Semantic competitive comparison (strengths, weaknesses, market gaps) |
| **Insights** | Generates improvements, marketing angles, target audience, risk flags |

---

## Tech Stack

**Backend**
- Python 3.11+
- FastAPI + Uvicorn
- httpx + BeautifulSoup4
- uv (package manager)

**AI / LLM**
- OpenAI-compatible API (env-configured)
- JSON-mode structured prompting

**Frontend**
- React + Vite
- Material UI (MUI)
- Server-Sent Events for real-time streaming logs

---

## Project Structure

```
review-intelligence-engine/
│
├── app/
│   ├── api/
│   │   └── routes.py          # FastAPI endpoints (stream + standard)
│   ├── core/
│   │   └── config.py          # Env-based config
│   ├── models/
│   │   └── schemas.py         # Pydantic request models
│   ├── services/
│   │   ├── scraper.py         # Amazon review scraper with fallback
│   │   ├── analyzer.py        # LLM review analysis
│   │   ├── comparator.py      # Semantic competitive comparison
│   │   ├── insights.py        # Strategic insights generator
│   │   └── llm_client.py      # LLM API client with JSON parsing
│   └── main.py
│
├── frontend/
│   ├── src/
│   │   └── App.jsx            # React UI with streaming logs
│   └── package.json
│
├── .env                       # API keys (never commit this)
├── .gitignore
├── pyproject.toml
└── README.md
```

---

## Setup & Running

### Prerequisites
- Python 3.11+
- Node.js 18+
- uv (`pip install uv`)

### 1. Clone the repo

```bash
git clone https://github.com/YOUR_USERNAME/review-intelligence-engine.git
cd review-intelligence-engine
```

### 2. Configure environment

Create a `.env` file in the root:

```env
LLM_API_KEY=your_api_key_here
LLM_BASE_URL=https://api.openai.com/v1
LLM_MODEL=gpt-4o
```

Works with any OpenAI-compatible API (OpenAI, Together, Groq, Ollama, etc.)

### 3. Run the backend

```bash
uv venv
source .venv/bin/activate       # Windows: .venv\Scripts\activate
uv add fastapi uvicorn httpx beautifulsoup4
uv run uvicorn app.main:app --reload
```

Backend runs at: `http://localhost:8000`

### 4. Run the frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend runs at: `http://localhost:5173`

---

## API Reference

### `POST /analyze-stream`
Runs the full pipeline and streams progress logs via SSE.

**Request:**
```json
{
  "main_product": "https://www.amazon.in/dp/XXXXXXXXXX",
  "competitors": [
    "https://www.amazon.in/dp/YYYYYYYYYY",
    "https://www.amazon.in/dp/ZZZZZZZZZZ"
  ]
}
```

**Response (stream):**
```
data: {"log": "🔍 Starting analysis..."}
data: {"log": "📦 Scraping main product..."}
data: {"log": "✅ Analysis complete"}
data: {"result": { "main": {...}, "comparison": {...}, "insights": {...} }}
```

### `POST /analyze`
Same pipeline, non-streaming. Returns full JSON response.

### `GET /`
Health check.

---

## Output Schema

```json
{
  "main": {
    "pros": [],
    "cons": [],
    "use_cases": []
  },
  "comparison": {
    "strengths": [],
    "weaknesses": [],
    "shared_issues": [],
    "competitor_advantages": [],
    "market_gaps": [],
    "positioning": "",
    "summary": ""
  },
  "insights": {
    "improvements": [{ "area": "", "issue": "", "action": "" }],
    "marketing_angles": [{ "angle": "", "rationale": "" }],
    "target_audience": [{ "segment": "", "reason": "" }],
    "key_differentiators": [],
    "risk_flags": [{ "risk": "", "severity": "low|medium|high", "mitigation": "" }],
    "quick_wins": []
  }
}
```

---

## Key Design Decisions

**Why LLM-first comparison?**
The original comparator used Python set subtraction on strings. Near-duplicate phrases ("build quality is great" vs "excellent build quality") were treated as different items, causing competitor strengths to bleed into the main product's weaknesses column. Delegating the comparison to the LLM — which reasons semantically — fixed this entirely.

**Why Server-Sent Events (SSE)?**
The pipeline takes 15–30 seconds. Without streaming, the UI would show nothing until completion. SSE lets the frontend display live progress logs so the user knows exactly what stage is running.

**Why fallback reviews?**
Amazon aggressively blocks automated scraping. The scraper tries two strategies (listing page + reviews page) before falling back to realistic sample data. The entire LLM pipeline still runs — the architecture is production-ready; only the data source is mocked.

---

## Known Limitations & Roadmap

| Limitation | Fix |
|---|---|
| Amazon blocks scraping | Replace with BrightData / ScrapingBee / Playwright |
| No data persistence | Add MongoDB to save analysis history |
| No caching | Add Redis — same URL analyzed twice hits the LLM again |
| Single-page results | Add charts (Recharts) + PDF export |
| Revenue estimation missing | Combine BSR rank + review volume for monthly revenue estimate |

---

## Dependencies

**Python**
```
fastapi
uvicorn
httpx
beautifulsoup4
```

**JavaScript**
```
react
vite
@mui/material
@emotion/react
@emotion/styled
@mui/icons-material
```

---