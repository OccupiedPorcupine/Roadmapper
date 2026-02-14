================================================================================
  AI Roadmap Builder - How to launch the frontend and UI
================================================================================

FRONTEND (Next.js)

  1. Open a terminal and go to the frontend directory:

       cd ai-roadmap-builder/frontend

  2. Install dependencies (first time only):

       npm install

  3. Run the development server:

       npm run dev

  4. Open the app in your browser:

       http://localhost:3000

  Other commands:
    - npm run build   Build for production
    - npm run start   Run production build (run "npm run build" first)
    - npm run lint    Run the linter

--------------------------------------------------------------------------------
BACKEND (optional, for full app later)

  The landing page works without the backend. When you need the API:

  1. Go to the backend directory:

       cd ai-roadmap-builder/backend

  2. Create a virtual environment and install deps (first time):

       python -m venv .venv
       source .venv/bin/activate   # On Windows: .venv\Scripts\activate
       pip install -r requirements.txt

  3. Run the FastAPI server:

       uvicorn main:app --reload

  API will be at http://localhost:8000

--------------------------------------------------------------------------------
LANDING PAGE BEHAVIOUR

  - Top left: Hamburger menu (active only when signed in; opens "Your Roadmaps" drawer).
  - Top right: "Sign In" / "Sign Out" (click Sign In to simulate login for testing).
  - Center: Headline with gradient on "today?" and a rainbow-glass input field.
  - Submitting the input is wired for future roadmap generation.

--------------------------------------------------------------------------------
SHADCN-STYLE STRUCTURE, TAILWIND & TYPESCRIPT

  This project already supports:
    - shadcn-style layout: reusable UI primitives live under src/components/ui/
    - Tailwind CSS for styling (tailwind.config.ts, postcss.config.cjs)
    - TypeScript (tsconfig.json, strict typing)

  Default paths:
    - Components:  src/components/  (feature components in features/, UI in ui/)
    - Styles:      src/app/globals.css  (Tailwind + CSS variables)
    - Utils:       src/lib/utils.ts  (e.g. cn() for class names)

  Why use src/components/ui?
    - Keeps primitives (buttons, inputs, etc.) in one place so they stay
      consistent and can be reused or swapped (e.g. shadcn CLI adds here).
    - Feature components (e.g. LandingNavBar, HeroSection) import from @/components/ui.

  Integrated components:
    - RainbowButton:  src/components/ui/rainbow-button.tsx
    - Demo usage:     src/components/ui/rainbow-button-demo.tsx  (e.g. "Get Unlimited Access")
    - Sign In in the nav uses RainbowButton; the hero input uses the same rainbow
      color variables (--color-1..5) for the glowing rainbow-glass border.

  If you need to add more shadcn components via CLI:
    npx shadcn@latest init
    (Choose src/components for components path and @/ for alias; then add components with npx shadcn@latest add <name>)

================================================================================
