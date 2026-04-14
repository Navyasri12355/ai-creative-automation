# Indian Social Media Platform

AI-powered social media creative generator for Indian brands — festivals, occasions, multilingual content.

## Tech Stack (Student-friendly, mostly free)

| Layer | Tech | Free tier |
|---|---|---|
| Frontend | Next.js 14 + Tailwind CSS | Vercel free |
| Backend | FastAPI (Python 3.11) | Railway / Render free |
| Database | Supabase (PostgreSQL) | 500 MB free |
| Storage | Supabase Storage | 1 GB free |
| Auth | Supabase Auth | Free |
| AI text | Anthropic Claude API | Pay-per-use ~$0.001/call |
| AI image | Replicate (Stable Diffusion) | ~$0.003/image |
| Email | Resend | 100 emails/day free |
| Cache/Queue | Upstash Redis | 10k req/day free |

**Estimated cost for student use: < $2/month**

## Prerequisites

- Python 3.11+
- Node.js 18+
- A Supabase account (free) → https://supabase.com
- An Anthropic API key → https://console.anthropic.com
- A Replicate account → https://replicate.com (optional, for images)
- A Resend account → https://resend.com (optional, for email)
- An Upstash account → https://upstash.com (optional, for queues)

## Quick Start

### 1. Clone and set up environment

```bash
git clone <repo>
cd indian-social-platform
```

### 2. Backend setup

```bash
cd backend
python -m venv venv
source venv/bin/activate          # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env              # then fill in your keys
```

### 3. Set up Supabase

1. Create a project at https://supabase.com
2. Go to SQL Editor and run the contents of `backend/supabase_schema.sql`
3. Copy your project URL and anon key into `.env`

### 4. Run backend

```bash
cd backend
uvicorn app.main:app --reload --port 8000
```

API docs at: http://localhost:8000/docs

### 5. Frontend setup

```bash
cd frontend
npm install
cp .env.local.example .env.local   # fill in your keys
npm run dev
```

App at: http://localhost:3000

## Project Structure

```
indian-social-platform/
├── backend/
│   ├── app/
│   │   ├── main.py              # FastAPI app entry
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
│   │   ├── models/              # Pydantic schemas
│   │   │   ├── brand.py
│   │   │   ├── creative.py
│   │   │   ├── festival.py
│   │   │   └── user.py
│   │   ├── services/            # Business logic
│   │   │   ├── ai_service.py    # Claude + Replicate
│   │   │   ├── brand_service.py
│   │   │   ├── creative_service.py
│   │   │   ├── festival_service.py
│   │   │   ├── image_composer.py # Pillow composition
│   │   │   └── scheduler.py     # APScheduler jobs
│   │   └── utils/
│   │       ├── festivals_data.py # Hard-coded festival calendar
│   │       └── templates.py
│   ├── tests/
│   ├── supabase_schema.sql
│   ├── requirements.txt
│   └── .env.example
└── frontend/
    ├── src/
    │   ├── app/                 # Next.js App Router
    │   │   ├── layout.tsx
    │   │   ├── page.tsx         # Landing
    │   │   ├── (auth)/
    │   │   │   ├── login/
    │   │   │   └── register/
    │   │   └── dashboard/
    │   │       ├── page.tsx
    │   │       ├── brand/
    │   │       ├── creatives/
    │   │       ├── festivals/
    │   │       └── analytics/
    │   ├── components/
    │   ├── lib/                 # API client, Supabase client
    │   ├── hooks/
    │   └── types/
    ├── package.json
    └── .env.local.example
```

## Deployment (Free)

### Backend → Railway
```bash
# Install Railway CLI
npm i -g @railway/cli
railway login
railway init
railway up
```

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