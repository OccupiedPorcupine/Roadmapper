Here is the exact markdown documentation you can add to your repository. It outlines the precise codebase adjustments and configuration steps needed to deploy your Next.js frontend, FastAPI backend, and vector database for free.

You can save this directly as `DEPLOYMENT.md` in your monorepo root.

```markdown
# Free Tier Deployment Guide

This document outlines the required code changes and platform configurations to deploy the roadmap platform using Vercel (Frontend), Render (Backend), and Supabase (Database + Vector Store) on their free tiers.

## 1. FastAPI Backend Updates (Render Preparation)

Render's free tier only supports IPv4 network connections, while Supabase defaults to IPv6. Furthermore, the frontend will now be hosted on a separate domain (Vercel), requiring Cross-Origin Resource Sharing (CORS) configurations.

### Update `main.py` (CORS Setup)
Ensure your FastAPI application explicitly permits requests from the Vercel domain to prevent the browser from blocking your SSE streaming endpoints.

```python
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import os

app = FastAPI()

# FRONTEND_URL will be set in Render's environment dashboard. 
# It defaults to localhost for local development.
origins = [
    os.getenv("FRONTEND_URL", "http://localhost:3000")
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

```

### Update Database Engine (`pgvector` / SQLAlchemy)

To connect Render to Supabase over IPv4, you must use Supabase's Transaction Pooler (port `6543`). Because Supabase is pooling the connections, you must disable SQLAlchemy's internal pooling to prevent dropped connections during RAG queries.

```python
from sqlalchemy import create_engine
from sqlalchemy.pool import NullPool
import os

DATABASE_URL = os.getenv("DATABASE_URL")

# poolclass=NullPool is mandatory when using Supabase's Transaction Pooler
engine = create_engine(DATABASE_URL, poolclass=NullPool)

```

## 2. Next.js Frontend Updates (Vercel Preparation)

The frontend must dynamically route its requests (including Clerk authentication callbacks and React Flow/Dagre layout generations) to either the local Python server or the live Render URL, depending on the environment.

### Update API Fetch Calls

Replace any hardcoded `http://localhost:8000` strings with the following environment variable logic.

```javascript
// This variable will be automatically injected by Vercel in production
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

// Example implementation for the roadmap generation stream
const response = await fetch(`${API_BASE_URL}/api/generate-roadmap`, {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify(promptData),
});

```

## 3. Platform Configuration Checklist

Once the code updates above are merged into your `main` branch, configure the platforms exactly as follows:

### Step A: Supabase (Database)

1. Create a new Supabase project.
2. Navigate to **Database > Extensions** and enable `vector` (pgvector).
3. Navigate to **Project Settings > Database**.
4. Under **Connection string**, select **Transaction Pooler** (it should show port `6543`).
5. Copy this exact URI string.

### Step B: Render (FastAPI Backend)

1. Create a new **Web Service** connected to your GitHub monorepo.
2. Set the Root Directory to your Python backend folder.
3. Set the Build Command: `pip install -r requirements.txt`
4. Set the Start Command: `uvicorn main:app --host 0.0.0.0 --port 10000`
5. Add Environment Variables:
* `DATABASE_URL`: *[Paste the Supabase Transaction Pooler URI from Step A]*
* `FRONTEND_URL`: *[Leave blank for now, we will update this in Step D]*


6. Deploy and copy the resulting `https://your-app.onrender.com` URL.

### Step C: Vercel (Next.js Frontend)

1. Create a new Vercel project connected to your GitHub monorepo.
2. Set the Root Directory to your Next.js frontend folder.
3. Add Environment Variables:
* `NEXT_PUBLIC_API_URL`: *[Paste the Render URL from Step B]*
* `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`: *[Your Clerk public key]*
* `CLERK_SECRET_KEY`: *[Your Clerk secret key]*


4. Deploy the application and assign your custom domain.

### Step D: The Final Handshake

1. Copy your final, live custom domain from Vercel.
2. Go back to your **Render Web Service > Environment Variables**.
3. Update `FRONTEND_URL` with your Vercel domain (e.g., `https://yourdomain.com`).
4. Restart the Render web service.

```

---

Would you like me to write a quick script you can run to test if the `pgvector` extension is firing correctly on the Supabase end before you hook up the frontend?

```