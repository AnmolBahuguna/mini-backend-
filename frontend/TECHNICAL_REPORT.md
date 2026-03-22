# DHIP Frontend Technical Report

Date: 2026-03-22  
Scope: Entire frontend workspace audit (code, routes, UI modules, hooks, tests, and integration surfaces)

## 1) Project Overview

- **Project name (workspace package):** `mini-project`
- **Product name (UI branding):** **DHIP** (Digital Harm Intelligence Platform)
- **Purpose:** A cyber-safety web platform for:
  - threat checking and risk scoring
  - live alerts and regional awareness
  - community reporting
  - women/adult safety support workflows
  - evidence vault and profile tools
- **UI type:** Multi-page **security dashboard + community intelligence platform** (not e-commerce, not portfolio)

Primary shell and route host:
- `src/main.tsx`
- `src/App.tsx`

---

## 2) Tech Stack

### Core Framework
- **React:** `18.3.1`
- **TypeScript:** `~5.9.3`
- **Vite:** `^8.0.1`

### Routing
- **react-router-dom:** `^7.13.1`

### Styling & UI
- **Tailwind CSS:** `^3.4.19`
- **PostCSS:** `^8.5.8`
- **Autoprefixer:** `^10.4.27`
- Global custom theme/utilities in `src/index.css`

### Forms & Validation
- **react-hook-form:** `^7.71.2`
- **zod:** `^4.3.6`
- **@hookform/resolvers:** `^5.2.2`

### Data/HTTP
- **axios:** `^1.13.6`
- API client configured in `src/lib/api.ts`

### Motion, 3D, Effects
- **framer-motion:** `^12.38.0`
- **three:** `^0.183.2`
- **@react-three/fiber:** `^8.17.14`
- **@react-three/drei:** `^9.122.0`
- **canvas-confetti:** `^1.9.4`
- **react-hot-toast:** `^2.6.0`

### Charts/Visualization
- **recharts:** `^3.8.0`
- **chart.js:** `^4.5.1`
- **react-chartjs-2:** `^5.3.1`

### Testing
- **Vitest:** `^4.1.0`
- **@testing-library/react / jest-dom / user-event**
- **msw:** `^2.12.14`
- **Playwright:** `^1.58.2`

### Linting
- **ESLint 9** with TypeScript + React hooks plugin

Reference files:
- `package.json`
- `vitest.config.ts`
- `playwright.config.ts`
- `eslint.config.js`
- `tailwind.config.js`

---

## 3) Folder Structure (Complete + Role)

```text
frontend/
├─ .env.local                       # Environment template (API/AI/Twilio keys)
├─ eslint.config.js                 # ESLint flat config
├─ index.html                       # Vite host HTML
├─ package.json                     # Scripts + dependencies
├─ package-lock.json                # NPM lockfile
├─ playwright.config.ts             # E2E config
├─ postcss.config.js                # Tailwind + autoprefixer pipeline
├─ README.md                        # Default Vite template readme (not project-tailored)
├─ tailwind.config.js               # Tailwind theme extensions
├─ tsconfig.app.json                # App TS config
├─ tsconfig.json                    # TS project references
├─ tsconfig.node.json               # Node/tooling TS config
├─ vite.config.ts                   # Vite config
├─ vitest.config.ts                 # Vitest unit/integration config
├─ e2e/
│  ├─ alerts.spec.ts                # Alerts E2E scenarios
│  ├─ auth.spec.ts                  # Auth E2E scenarios
│  ├─ evidence-vault.spec.ts        # Evidence Vault E2E scenarios
│  ├─ report.spec.ts                # Report form E2E scenarios
│  └─ threat-check.spec.ts          # Threat Check E2E scenarios
├─ public/
│  ├─ favicon.svg                   # Static favicon
│  └─ icons.svg                     # Static icon asset
└─ src/
   ├─ App.css                       # Legacy template style residue
   ├─ App.tsx                       # Router, shell, protected route, toaster
   ├─ index.css                     # Global theme/tokens/util classes
   ├─ main.tsx                      # React root bootstrap
   ├─ assets/
   │  ├─ hero.png
   │  ├─ react.svg
   │  └─ vite.svg
   ├─ components/
   │  ├─ 3d/
   │  │  ├─ FloatingShield.tsx      # Interactive 3D shield object
   │  │  ├─ GeometricShape.tsx      # Reusable 3D primitive renderer
   │  │  └─ ParticleField.tsx       # Instanced particle background system
   │  ├─ charts/
   │  │  ├─ BarChart.tsx            # Recharts bar wrapper
   │  │  ├─ DoughnutChart.tsx       # Chart.js doughnut wrapper
   │  │  └─ SparkLine.tsx           # Recharts sparkline wrapper
   │  ├─ home/
   │  │  ├─ BentoGrid.tsx           # Home capabilities grid
   │  │  ├─ CTASection.tsx          # Home CTA section
   │  │  ├─ HeroSection.tsx         # Home hero with 3D + quick scan chips
   │  │  ├─ HowItWorks.tsx          # Home workflow section
   │  │  ├─ StatsSection.tsx        # Home KPI + chart section
   │  │  └─ Testimonials.tsx        # Home testimonial carousel
   │  ├─ layout/
   │  │  ├─ Footer.tsx              # Global footer links
   │  │  ├─ NavBar.tsx              # Global desktop/mobile navigation
   │  │  ├─ PageHero.tsx            # Generic page hero block
   │  │  └─ PageTransition.tsx      # Route transition animation wrapper
   │  ├─ threat/
   │  │  ├─ AlertItem.tsx           # Alert list card primitive
   │  │  ├─ EvidenceItem.tsx        # Evidence list card primitive
   │  │  └─ ThreatCard.tsx          # Threat report card primitive
   │  └─ ui/
   │     ├─ ChatBubble.tsx          # Chat message bubble
   │     ├─ CircularMeter.tsx       # Circular progress/risk meter
   │     ├─ CustomCursor.tsx        # Cursor + follower effect
   │     ├─ FilterBar.tsx           # Generic multi-select filter bar
   │     ├─ FloatingLabel.tsx       # Labeled input primitive
   │     ├─ GlassCard.tsx           # Glass-style card container
   │     ├─ GradientButton.tsx      # Themed button with variants/loading
   │     ├─ PasswordStrengthBar.tsx # Password strength indicator
   │     ├─ RiskBadge.tsx           # Severity badge
   │     ├─ RiskGauge.tsx           # Arc risk gauge
   │     ├─ SafetyLayerTab.tsx      # Women safety layer tab button
   │     └─ StatsCounter.tsx        # Animated metric counter
   ├─ hooks/
   │  ├─ useAlerts.ts               # Mock alert filter logic
   │  ├─ useAuth.ts                 # Re-export of auth context hook
   │  ├─ useCountUp.ts              # Count-up animation logic
   │  ├─ useLocalStorage.ts         # Generic localStorage state hook
   │  ├─ useMagneticButton.ts       # Magnetic cursor offset hook
   │  ├─ useMouseParallax.ts        # Mouse parallax vector hook
   │  ├─ useThreatCheck.ts          # API threat-check hook
   │  └─ useTypewriter.ts           # Typewriter text reveal hook
   ├─ lib/
   │  ├─ api.ts                     # Axios client + interceptors
   │  ├─ crypto.ts                  # Client-side crypto (AES-GCM + SHA-256)
   │  └─ indiaRegions.ts            # Indian state/UT list
   ├─ pages/
   │  ├─ AboutPage.tsx
   │  ├─ AdultSafetyPage.tsx
   │  ├─ AlertsPage.tsx
   │  ├─ CommunityPage.tsx
   │  ├─ EvidenceVaultPage.tsx
   │  ├─ FeaturesPage.tsx
   │  ├─ ForgotPasswordPage.tsx
   │  ├─ HomePage.tsx
   │  ├─ LoginPage.tsx              # Re-export wrapper
   │  ├─ ProfilePage.tsx
   │  ├─ ReportDetailPage.tsx
   │  ├─ ReportPage.tsx
   │  ├─ SignupPage.tsx             # Re-export wrapper
   │  ├─ ThreatCheckPage.tsx
   │  ├─ WomenSafetyPage.tsx
   │  └─ auth/
   │     ├─ LoginPage.tsx           # Actual login implementation
   │     └─ SignupPage.tsx          # Actual signup implementation
   ├─ store/
   │  └─ AuthContext.tsx            # Global auth context (localStorage-backed)
   ├─ test/
   │  ├─ setup.ts                   # Vitest setup
   │  ├─ mocks/
   │  │  └─ handlers.ts             # MSW API handlers
   │  └─ __tests__/
   │     ├─ auth/
   │     ├─ components/
   │     ├─ hooks/
   │     ├─ lib/
   │     └─ pages/
   └─ types/
      ├─ auth.ts                    # User/contact type definitions
      └─ threat.ts                  # Threat/risk type definitions
```

---

## 4) Completed Pages & Screens

### Built and operational (UI-level)
- Home
- Threat Check
- Alerts
- Women Safety
- Adult Safety
- Evidence Vault
- Community
- Features
- About
- Report form
- Profile
- Login
- Signup
- Forgot Password

### Partially built
- **Report Detail** (`src/pages/ReportDetailPage.tsx`) is a scaffold and explicitly states backend timeline/details are pending.

### Notes
- `src/pages/LoginPage.tsx` and `src/pages/SignupPage.tsx` are wrappers that re-export the actual auth pages from `src/pages/auth/`.

---

## 5) Component Breakdown

A detailed component-to-route matrix is provided in:
- `COMPONENT_ROUTE_MATRIX.md`

### High-level findings
- **Actively mounted in runtime route flow:**
  - Layout: NavBar, Footer, PageTransition, CustomCursor
  - Home suite: HeroSection, BentoGrid, HowItWorks, StatsSection, Testimonials, CTASection
  - Auth primitives: FloatingLabel, GradientButton, PasswordStrengthBar, FloatingShield
  - Shared cards: GlassCard
- **Defined but currently not mounted on primary route pages:**
  - Threat primitives: AlertItem, EvidenceItem, ThreatCard
  - Chart wrappers: BarChart, DoughnutChart, SparkLine
  - Several UI helpers: ChatBubble, RiskGauge, SafetyLayerTab, FilterBar, StatsCounter, CircularMeter, RiskBadge

These unused components are still valuable assets and partially test-covered, but not yet integrated into the current page implementations.

---

## 6) Styling Approach

### Methodology
- Tailwind utility classes + custom reusable CSS utility layer in `src/index.css`.
- Dark, cyber-style visual language with gradients, glow, blur/glass effects, and motion.

### Design Tokens / Palette
Primary token variables in `src/index.css` include:
- `--bg`, `--surface`, `--surface2`
- `--blue`, `--indigo`, `--cyan`
- `--red`, `--green`, `--amber`
- `--text`, `--muted`

Tailwind extension (`tailwind.config.js`) adds:
- `dhip.*` color namespace
- `shadow.glow`
- marquee animation/keyframes

### Typography
- Inter/system font stack defined globally in `src/index.css`.

### Theming
- Dark mode baseline is fixed (`color-scheme: dark`).
- Focus styles and reduced-motion fallback are explicitly handled.

---

## 7) Routing & Navigation

Defined in `src/App.tsx`:
- `/`
- `/threat-check`
- `/alerts`
- `/women-safety`
- `/adult-safety`
- `/evidence`
- `/community`
- `/features`
- `/about`
- `/community/report`
- `/reports/:id`
- `/auth/login`
- `/auth/signup`
- `/auth/forgot-password`
- `/profile` (protected)
- `*` redirects to `/`

### Protected routes
- `/profile` is wrapped with `ProtectedRoute`.
- Guard condition depends on `useAuth()` user state.
- If unauthenticated, redirect to `/auth/login`.

### Navigation structure
- Main nav links are in `components/layout/NavBar.tsx`.
- Footer provides secondary access paths to core modules.

---

## 8) State Management & Data Flow

### Patterns in use
- Local component state: `useState`, `useMemo`, `useEffect`
- Global auth state: React Context in `store/AuthContext.tsx`
- Utility custom hooks for animation/local behavior

### Auth data flow
- `AuthProvider` initializes user from localStorage.
- Sign-up stores profile + password in browser storage.
- Sign-in validates from browser storage.
- Sign-out clears current user key.

### What is not used (runtime)
- No Redux/Zustand store
- No active React Query QueryClient/useQuery integration despite package presence

---

## 9) API Integration

### Real call structure currently coded
- `src/lib/api.ts` defines Axios instance and response interceptor.
- `src/hooks/useThreatCheck.ts` calls:
  - `POST /api/threat-check/`
  - `GET /api/threat-check/:id/enrichment/` (polling)

### Mock ecosystem
- `src/test/mocks/handlers.ts` includes mocked endpoints for:
  - threat-check + enrichment
  - alerts
  - reports
  - chatbot
  - panic
  - evidence
  - profile

### Current runtime status
- Most pages still use static local arrays/toast simulations for displayed content.
- Backend integration exists as infrastructure and test mocks, but only partially wired into page UI behavior.

---

## 10) Progress Summary (Estimated)

### Overall frontend completion
- **Estimated completion: 78%**

### Module-wise estimate
- App shell, layout, routing: **95%**
- Home/landing experience: **92%**
- Auth UX (login/signup/forgot): **85%**
- Threat check module: **68%**
- Alerts + community feed: **75%**
- Reporting flow: **72%**
- Evidence vault: **60%**
- Profile/account module: **65%**
- Testing scaffolding/coverage footprint: **85%**

---

## 11) What’s Incomplete, Broken, or In Progress

1. **Report details page is placeholder-level**
   - `src/pages/ReportDetailPage.tsx` still indicates pending backend timeline/details.

2. **Evidence vault interaction is mocked**
   - Upload CTA currently triggers a toast (“file picker would open here”).

3. **ThreatCheck page does not consume the threat API hook yet**
   - `useThreatCheck` is implemented, but `ThreatCheckPage.tsx` currently uses simulated local flow.

4. **Reusable components not yet integrated into active routes**
   - Domain cards/charts/gauges exist but are mostly disconnected from runtime pages.

5. **README is not aligned with current product architecture**
   - `README.md` remains the default Vite template documentation.

6. **Environment keys are present but not operationally wired across runtime pages**
   - `.env.local` includes provider keys, but those integrations are mostly represented in mock/test or static UI text.

---

## 12) Final Assessment

This frontend is visually mature and structurally strong, with robust routing, polished UX, reusable primitives, and a substantial test suite. The main gap is not UI capability but **feature wiring**: connecting existing API/hooks and reusable components into end-to-end production workflows.

If the next phase prioritizes integration and data orchestration, this codebase is in good condition to move from polished prototype to fully functional frontend application.
