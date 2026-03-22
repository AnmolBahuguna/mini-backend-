# DHIP Component-to-Route Usage Matrix

Date: 2026-03-22

Legend:
- ✅ Directly used in route page/runtime shell
- 🧩 Reusable component available but not currently mounted in routed pages
- 🧪 Referenced primarily in tests/mocks

## Route Inventory

| Route | Page File | Status |
|---|---|---|
| / | src/pages/HomePage.tsx | ✅ Built |
| /threat-check | src/pages/ThreatCheckPage.tsx | ✅ Built |
| /alerts | src/pages/AlertsPage.tsx | ✅ Built |
| /women-safety | src/pages/WomenSafetyPage.tsx | ✅ Built |
| /adult-safety | src/pages/AdultSafetyPage.tsx | ✅ Built |
| /evidence | src/pages/EvidenceVaultPage.tsx | ✅ Built |
| /community | src/pages/CommunityPage.tsx | ✅ Built |
| /features | src/pages/FeaturesPage.tsx | ✅ Built |
| /about | src/pages/AboutPage.tsx | ✅ Built |
| /community/report | src/pages/ReportPage.tsx | ✅ Built |
| /reports/:id | src/pages/ReportDetailPage.tsx | ⚠ Partial placeholder |
| /auth/login | src/pages/auth/LoginPage.tsx | ✅ Built |
| /auth/signup | src/pages/auth/SignupPage.tsx | ✅ Built |
| /auth/forgot-password | src/pages/ForgotPasswordPage.tsx | ✅ Built |
| /profile | src/pages/ProfilePage.tsx | ✅ Built (Protected) |

---

## A) Global Shell Components

| Component | File | Props Summary | Used In |
|---|---|---|---|
| NavBar | src/components/layout/NavBar.tsx | none | App shell (`src/App.tsx`) ✅ |
| Footer | src/components/layout/Footer.tsx | none | App shell (`src/App.tsx`) ✅ |
| PageTransition | src/components/layout/PageTransition.tsx | children | All route elements in `src/App.tsx` ✅ |
| CustomCursor | src/components/ui/CustomCursor.tsx | none | App shell (`src/App.tsx`) ✅ |
| PageHero | src/components/layout/PageHero.tsx | title, subtitle, Icon?, gradientClassName? | ReportPage, ReportDetailPage ✅ |

---

## B) Home Page Composition

Used by `src/pages/HomePage.tsx`:

| Component | File | Role |
|---|---|---|
| HeroSection | src/components/home/HeroSection.tsx | Hero + 3D background + quick scan chips |
| BentoGrid | src/components/home/BentoGrid.tsx | Capability cards/intelligence overview |
| HowItWorks | src/components/home/HowItWorks.tsx | Stepwise workflow cards |
| StatsSection | src/components/home/StatsSection.tsx | KPI counters + area chart |
| Testimonials | src/components/home/Testimonials.tsx | Rotating testimonial card |
| CTASection | src/components/home/CTASection.tsx | Final conversion CTA section |

All above are currently mounted in runtime: ✅

---

## C) Auth Flow Components

### Login (`src/pages/auth/LoginPage.tsx`)

| Component | Usage |
|---|---|
| FloatingShield | 3D side panel visual |
| FloatingLabel | Email input |
| GradientButton | Submit action |

### Signup (`src/pages/auth/SignupPage.tsx`)

| Component | Usage |
|---|---|
| FloatingShield | 3D side panel visual |
| FloatingLabel | Name/email/phone inputs |
| PasswordStrengthBar | Password quality indicator |
| GradientButton | Submit action |

All above are currently mounted in runtime auth routes: ✅

---

## D) Feature/About/Safety Pages Component Usage

| Page | Components used directly |
|---|---|
| FeaturesPage | GeometricShape, GlassCard, GradientButton |
| AboutPage | (no reusable local imports, page-local section blocks) |
| ThreatCheckPage | (page-local UI blocks, no custom component imports) |
| AlertsPage | (page-local UI blocks, no custom component imports) |
| WomenSafetyPage | (page-local UI blocks, no custom component imports) |
| AdultSafetyPage | (page-local UI blocks, no custom component imports) |
| EvidenceVaultPage | (page-local UI blocks, no custom component imports) |
| CommunityPage | (page-local UI blocks, no custom component imports) |
| ProfilePage | (page-local UI blocks, no custom component imports) |
| ForgotPasswordPage | (page-local UI blocks, no custom component imports) |

---

## E) 3D Components Usage Map

| Component | File | Used In |
|---|---|---|
| FloatingShield | src/components/3d/FloatingShield.tsx | Home HeroSection, auth Login, auth Signup ✅ |
| ParticleField | src/components/3d/ParticleField.tsx | Home HeroSection, CTASection ✅ |
| GeometricShape | src/components/3d/GeometricShape.tsx | FeaturesPage, HowItWorks, CTASection ✅ |

---

## F) UI Primitive Usage Map

| Component | File | Runtime Usage |
|---|---|---|
| GradientButton | src/components/ui/GradientButton.tsx | Auth + Features + Home CTA ✅ |
| FloatingLabel | src/components/ui/FloatingLabel.tsx | Auth forms ✅ |
| PasswordStrengthBar | src/components/ui/PasswordStrengthBar.tsx | Signup ✅ |
| GlassCard | src/components/ui/GlassCard.tsx | Features + Home sections ✅ |
| CustomCursor | src/components/ui/CustomCursor.tsx | App shell ✅ |
| CircularMeter | src/components/ui/CircularMeter.tsx | 🧩 Not mounted in route pages |
| RiskBadge | src/components/ui/RiskBadge.tsx | 🧩 Not mounted in route pages |
| FilterBar | src/components/ui/FilterBar.tsx | 🧩 Not mounted in route pages |
| ChatBubble | src/components/ui/ChatBubble.tsx | 🧩 Not mounted in route pages |
| RiskGauge | src/components/ui/RiskGauge.tsx | 🧩 Not mounted in route pages |
| SafetyLayerTab | src/components/ui/SafetyLayerTab.tsx | 🧩 Not mounted in route pages |
| StatsCounter | src/components/ui/StatsCounter.tsx | 🧩 Not mounted in route pages |

---

## G) Threat/Chart Components Usage Map

| Component Group | Components | Runtime Usage |
|---|---|---|
| Threat cards | AlertItem, EvidenceItem, ThreatCard | 🧩 Present, not mounted in current route pages |
| Chart wrappers | BarChart, DoughnutChart, SparkLine | 🧩 Present, not mounted in current route pages |

---

## H) Hooks Usage Matrix

| Hook | File | Consumed By |
|---|---|---|
| useAuth | src/hooks/useAuth.ts (re-export) | App protected route + NavBar + auth pages + Profile (via store hook import path) ✅ |
| useCountUp | src/hooks/useCountUp.ts | StatsSection, StatsCounter ✅ |
| useTypewriter | src/hooks/useTypewriter.ts | BentoGrid ✅ |
| useMouseParallax | src/hooks/useMouseParallax.ts | ParticleField ✅ |
| useThreatCheck | src/hooks/useThreatCheck.ts | 🧩 Hook exists, not connected to ThreatCheckPage runtime |
| useAlerts | src/hooks/useAlerts.ts | 🧩 Exists, not connected to AlertsPage runtime |
| useLocalStorage | src/hooks/useLocalStorage.ts | 🧩 Exists, not actively consumed in route pages |
| useMagneticButton | src/hooks/useMagneticButton.ts | 🧩 Exists, not actively consumed in route pages |

---

## I) API/Integration Mapping

| Layer | File | Current Runtime Wiring |
|---|---|---|
| Axios client | src/lib/api.ts | ✅ Available globally |
| Threat check API hook | src/hooks/useThreatCheck.ts | 🧩 Implemented but not mounted in ThreatCheckPage |
| Test API mocks | src/test/mocks/handlers.ts | ✅ Used in tests |

---

## J) Key Gaps Revealed by Matrix

1. Several reusable threat/chart/UI components are ready but unused in routed pages.
2. ThreatCheck and Alerts pages currently rely on static/local state patterns rather than existing API hooks.
3. ReportDetail page route exists but remains a placeholder.
4. The component library is ahead of page integration, indicating low UI debt but moderate wiring debt.

---

## K) Recommended Next Integration Order

1. Wire `useThreatCheck` into `ThreatCheckPage`.
2. Replace `AlertsPage` local arrays with `useAlerts` (or API-backed version).
3. Upgrade `CommunityPage`/`EvidenceVaultPage` to use threat/evidence reusable card components.
4. Integrate chart wrappers where analytics are currently static visuals.
5. Complete `ReportDetailPage` with data fetch + timeline rendering.
