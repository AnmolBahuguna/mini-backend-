# DHIP Cyber Safety Platform (Frontend)

React + TypeScript + Vite single-page app for threat scanning, alerts, community reporting, and safety tooling tailored to India.

## Stack
- React 18, Vite, TypeScript, Tailwind CSS, Framer Motion
- React Router 7 for routing, TanStack Query for data fetching/caching
- Supabase client for auth/session; Axios API client with bearer injection
- Charts via Chart.js/Recharts; 3D via three.js/@react-three/fiber
- Testing: Vitest + Testing Library; E2E: Playwright

## App Structure (frontend/)
- `src/routes/AppRoutes.tsx` – route map and protected routes
- `src/pages/` – page-level screens (Home, Threat Check, Alerts, Women/Adult Safety, Community, Report, Report Detail, Evidence Vault, Profile, Features, About, Auth)
- `src/components/` – UI building blocks (3D hero, charts, cards, layout shells, threat widgets)
- `src/hooks/` – data/state hooks (alerts feed, reports feed, dashboard stats, auth/session, threat check)
- `src/lib/` – Supabase client, Axios API client, crypto helpers, region metadata

## Key Features by Page
- Home – animated hero, live stats, platform overview, CTAs into scanner/safety/community
- Threat Check – scan URLs/phones/emails/UPI/messages, risk gauge, AI-style summary, geo slices, local scan history
- Alerts – realtime-like alert stream with filters (state/type/severity), regional risk meter, ticker
- Community – crowd-sourced reports feed with filters, heatmap visuals, anonymous submission modal
- Report – zod-validated report form (entity/type/description/state/victim count, anonymous toggle) with confetti
- Report Detail – placeholder shell for future backend wiring
- Women Safety – panic/SOS flow, helplines/NGOs, legal info, AI chatbot (Anthropic endpoint), evidence vault concept
- Adult Safety – scam playbooks (sextortion/digital arrest/crypto/loan apps/jobs/UPI) with guidance cards and report modal
- Evidence Vault – UI for encrypted uploads (local state only)
- Profile – protected; emergency contacts CRUD + notification toggles (reports/saved alerts tabs are placeholders)
- Auth – login/signup/forgot-password screens with zod + `react-hook-form`; Supabase-backed auth hooks
- Features – DHIP immersive marketing page with live mini-demos for Threat Scanner, Live Alerts, Women Safety Hub, Evidence Vault, and Community Intel
- About – mission and background

## Environment
Create `frontend/.env.local` (or `.env`) with:
```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
# Optional: overrides API base used by Axios (default http://localhost:8000)
VITE_API_BASE_URL=http://localhost:8000
```
- Supabase is used for auth; `scripts/check-supabase.mjs` can validate connectivity (reads `.env.local`).
- WomenSafety chatbot currently calls `https://api.anthropic.com/v1/messages`; wire a proxy or env-based API key before production.

## Install & Run (frontend)
```bash
cd frontend
npm install
npm run dev
```

## Testing & Quality
- Unit/Component: `npm run test` (Vitest), `npm run test:watch`, coverage via `npm run test:coverage`
- E2E: `npm run test:e2e` (Playwright), headed: `npm run test:e2e:headed`, debug: `npm run test:e2e:debug`
- Lint: `npm run lint`

## Build & Preview
```bash
npm run build   # type-check + production build
npm run preview # serve built assets locally
```

## Notes / TODO
- Alerts, Threat Check, Evidence Vault, and Report Detail use mock/local data; connect to backend/Supabase as needed.
- Auth wrappers under `src/pages` delegate to richer UIs in `src/pages/auth`; consolidate if desired.
