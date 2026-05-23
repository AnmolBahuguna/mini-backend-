# Frontend (React + Vite)

This app is the DHIP client UI for threat checks, alerts, reports, evidence vault, and safety flows.

## Stack

- React 18 + TypeScript
- Vite
- React Query
- Zustand
- Tailwind CSS
- Axios API client

## Local Setup (Windows PowerShell)

```powershell
cd frontend
npm install
npm run dev
```

Open: `http://localhost:5173`

## Environment Variables

Create `frontend\.env.local`:

```env
VITE_API_BASE_URL=http://localhost:8000/api
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
```

`VITE_API_BASE_URL` is required by runtime environment validation.

## Scripts

- `npm run dev` - start development server
- `npm run build` - type-check and build for production
- `npm run preview` - preview built app
- `npm run lint` - lint source
- `npm run test` - run unit tests (if present)
- `npm run test:e2e` - run Playwright tests (if present)

## API Integration Notes

- `vite.config.ts` proxies `/api` to `http://localhost:8000`.
- Axios client attaches auth token where needed.
- 401 responses attempt token refresh and redirect to login on failure.

## Docker

From project root:

```powershell
docker compose up --build frontend
```

With full stack:

```powershell
docker compose up --build
```

## Troubleshooting

- Blank API responses: verify backend is up on port `8000`.
- CORS/proxy errors: confirm Vite proxy and backend CORS config.
- Missing env warnings in console: add required `VITE_*` values.
