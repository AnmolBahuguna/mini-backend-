# DHIP Cyber Safety Platform (Frontend)

React + TypeScript + Vite SPA for threat scanning, alerts, community reporting, evidence vault, and safety tooling.

## Stack
- React 18, Vite, TypeScript, Tailwind CSS, Framer Motion
- React Router 7, TanStack Query for data fetching/caching
- Supabase client for auth/session; Axios API client with bearer injection
- Charts via Chart.js/Recharts; 3D via three.js/@react-three/fiber
- Tests: Vitest + Testing Library; E2E: Playwright

## Quickstart
```bash
cd frontend
npm install
npm run dev
```

## Environment
Create `.env.local` with:
```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_API_BASE_URL=http://localhost:8000 # optional override
```

## Scripts
- `npm run dev` – start Vite dev server
- `npm run build` – type-check + production build
- `npm run preview` – serve built assets
- `npm run lint` – lint sources
- `npm run test` – unit/component tests (Vitest)
- `npm run test:e2e` – Playwright E2E

## Notable Pages
- Home – animated overview and CTAs
- Threat Check – scan URLs/phones/emails/UPI/messages with DRS-style score
- Alerts – regional live alert feed with filters
- Community – crowd-sourced reports and heatmap
- Women/Adult Safety – panic flows, helplines, playbooks
- Evidence Vault – encrypted upload UI (local state)
- Features – DHIP immersive marketing page with interactive mini-demos for scanner/alerts/women safety/vault/community
- About/Auth/Profile/Report/Report Detail – supporting flows and shells

## Notes
- Several data flows currently use mock/local data; wire to backend/Supabase as needed.
- WomenSafety chatbot calls Anthropic API endpoint; proxy and secure keys before production.
