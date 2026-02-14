# Free Tier Deployment Guide

This document outlines the deployment architecture and provides a checklist for configuring Vercel (Frontend), Render (Backend), and Supabase (Database + Vector Store) on their free tiers.

The codebase has already been configured to support this setup.

## 1. Architecture Overview

### Backend (Render)
- **Framework**: FastAPI
- **Network**: Render Free Tier (IPv4 only)
- **Configuration**:
  - `origins` in `main.py` is configured to accept requests from the Frontend URL (via `FRONTEND_URL` env var).
  - SQLAlchemy `poolclass` is set to `NullPool` to work with Supabase Transaction Pooler.

### Database (Supabase)
- **Service**: PostgreSQL + pgvector
- **Connection**: Must use **Transaction Pooler** (Port 6543) to support IPv4 from Render.

### Frontend (Vercel)
- **Framework**: Next.js
- **Configuration**:
  - `NEXT_PUBLIC_API_URL` environment variable points to the Render Backend URL.

---

## 2. Platform Configuration Checklist

Follow these steps strictly to deploy the application.

### Step A: Supabase (Database)

1. **Create Project**: Create a new Supabase project.
2. **Enable Vector**: Navigate to **Database > Extensions** and enable `vector` (pgvector).
3. **Get Connection String**:
   - Navigate to **Project Settings > Database**.
   - Under **Connection string**, select **Transaction Pooler** (ensure it shows port `6543`, Mode: Transaction).
   - **Copy this exact URI string**. (You will need the password you set during project creation).

### Step B: Render (FastAPI Backend)

1. **New Service**: Create a new **Web Service** regarding your GitHub repository.
2. **Settings**:
   - **Root Directory**: `ai-roadmap-builder/backend`
   - **Runtime**: Python 3
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn main:app --host 0.0.0.0 --port 10000`
3. **Environment Variables**:
   - `DATABASE_URL`: *[Paste the Supabase Transaction Pooler URI from Step A]*
   - `FRONTEND_URL`: *[Leave blank for now, update in Step D]*
   - `gemini_api_key`: *[Your Google Gemini API Key]*
   - `auth_secret`: *[A random string for JWT signature verification]* (Must match Frontend's `AUTH_SECRET` if using NextAuth, or the shared secret config).
4. **Deploy**: Click **Create Web Service**.
5. **Copy URL**: Once live, copy the `https://your-app.onrender.com` URL.

### Step C: Vercel (Next.js Frontend)

1. **New Project**: Import your GitHub repository into Vercel.
2. **Settings**:
   - **Root Directory**: Edit and select `ai-roadmap-builder/frontend`.
   - **Framework Preset**: Next.js (should detect automatically).
3. **Environment Variables**:
   - `NEXT_PUBLIC_API_URL`: *[Paste the Render URL from Step B]* (e.g., `https://your-app.onrender.com`)
   - `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`: *[Your Clerk Public Key]* (if using Clerk)
   - `CLERK_SECRET_KEY`: *[Your Clerk Secret Key]* (if using Clerk)
   - `NEXTAUTH_SECRET`: *[Same secret as `auth_secret` in Backend]* (if using NextAuth)
   - `NEXTAUTH_URL`: *[Your Vercel Deployment URL]* (Vercel sets this automatically for deployments, but good to know).
4. **Deploy**: Click **Deploy**.

### Step D: The Final Handshake

1. **Get Frontend URL**: Copy your final Vercel domain (e.g., `https://project-name.vercel.app`).
2. **Update Backend**:
   - Go back to **Render Dashboard > Web Service > Environment Variables**.
   - Add/Update `FRONTEND_URL` with your Vercel domain.
3. **Restart**: Manual deploy or restart the Render service to apply the new CORS origin.

## 3. Verification

Once everything is running:
1. Open the Vercel URL.
2. Try to generate a roadmap.
3. If it fails, check the **Browser Console** (F12) for CORS errors or the **Render Logs** for database connection issues.
