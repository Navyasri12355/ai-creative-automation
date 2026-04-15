# IndiSocial — AI Social Media Platform

AI-powered social media creative generator for Indian brands — festivals, occasions, multilingual content.


## Tech Stack

| Layer | Tech |
|---|---|
| Frontend | Next.js 14 + Tailwind CSS |
| Backend | FastAPI (Python 3.11) |
| Database | Supabase (PostgreSQL) |
| Storage | Supabase Storage |
| Auth | JWT (self-managed) |
| AI text | Groq API (Llama 3.3 70B) |
| AI image | Pollinations.ai |
| Hosting | Vercel + Render/Railway free tier | 

## Prerequisites

- Python 3.11+
- Node.js 18+
- A Supabase account → https://supabase.com
- A Groq API key → https://console.groq.com/keys

## Quick Start

### 1. Clone and set up environment

```bash
git clone <repo>
cd ai-creative-automation
```

### 2. Backend setup

```bash
cd backend
python -m venv venv
venv\Scripts\activate              # Mac/Linux: source venv/bin/activate
pip install -r requirements.txt
copy .env.example .env             # Mac/Linux: cp .env.example .env
# Then fill in your Supabase and Groq keys
```

### 3. Set up Supabase

1. Create a project at https://supabase.com (free, no card)
2. Go to SQL Editor and run the contents of `backend/supabase_schema.sql`
3. Create storage buckets: `brand-assets` (public) and `creatives` (public)
4. Copy your project URL and anon/service keys into `.env`

### 4. Run backend

```bash
cd backend
uvicorn main:app --reload --port 8000
```

API docs at: http://localhost:8000/docs

### 5. Frontend setup

```bash
cd frontend
npm install
copy .env.local.example .env.local   # fill in your keys
npm run dev
```

App at: http://localhost:3000

## Project Structure

```
ai-creative-automation/
├── backend/
│   ├── app/
│   │   ├── api/                 # Route handlers
│   │   │   ├── auth.py
│   │   │   ├── brands.py
│   │   │   ├── creatives.py
│   │   │   ├── festivals.py
│   │   │   └── analytics.py
│   │   ├── core/                # Config, DB, auth middleware
│   │   │   ├── config.py
│   │   │   ├── database.py
│   │   │   └── security.py
│   │   ├── models/
│   │   │   └── schemas.py       # Pydantic schemas
│   │   ├── services/
│   │   │   ├── ai_service.py    # Groq + Pollinations.ai (FREE)
│   │   │   ├── creative_service.py
│   │   │   ├── image_composer.py # Pillow composition
│   │   │   └── scheduler.py     # APScheduler jobs
│   │   └── utils/
│   │       └── festivals_data.py # Indian festival calendar
│   ├── main.py
│   ├── supabase_schema.sql
│   ├── requirements.txt
│   └── .env.example
└── frontend/
    ├── src/
    │   ├── app/
    │   │   ├── layout.tsx
    │   │   ├── page.tsx         # Landing page
    │   │   ├── (auth)/
    │   │   │   ├── login/
    │   │   │   └── register/
    │   │   └── dashboard/
    │   │       ├── page.tsx     # Overview
    │   │       ├── brand/       # Brand settings
    │   │       ├── creatives/   # Generate & view
    │   │       ├── festivals/   # Festival calendar
    │   │       └── analytics/   # Performance stats
    │   └── lib/
    │       └── api.ts           # API client + types
    ├── package.json
    ├── tsconfig.json
    ├── tailwind.config.ts
    ├── postcss.config.js
    ├── next.config.js
    └── .env.local.example
```

## Free Deployment

### Backend → Render
1. Go to https://render.com
2. Create a new Web Service → connect your GitHub repo
3. Build command: `pip install -r requirements.txt`
4. Start command: `uvicorn main:app --host 0.0.0.0 --port $PORT`
5. Add environment variables from `.env.example`

### Frontend → Vercel
```bash
npm i -g vercel
vercel --prod
```

## Running Tests

```bash
cd backend
pytest tests/ -v
```

## Cost Summary

| Service | Free Tier |
|---|---|
| Supabase | 500MB DB, 1GB storage, 50K auth users |
| Groq | 30 RPM, 14,400 requests/day, Llama 3.3 70B |
| Pollinations.ai | Unlimited image generation |
| Vercel | 100GB bandwidth/month |
| Render | 750 hours/month |
