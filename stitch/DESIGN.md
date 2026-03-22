# Design System Specification: Cyber-Intelligence & Tactical Depth

## 1. Overview & Creative North Star: "The Synthetic Sentinel"
This design system moves away from the "flat" web to embrace a high-fidelity, tactical aesthetic. The Creative North Star is **The Synthetic Sentinel**: a visual language that feels like a high-end heads-up display (HUD) used by elite security analysts. 

We break the "standard template" look through **Tonal Layering** and **Intentional Asymmetry**. We do not use rigid, centered layouts; instead, we favor left-weighted information densities and overlapping "glass" modules that suggest a complex, living data environment. The goal is an interface that feels like it’s projecting light from within the screen, rather than sitting on top of it.

---

## 2. Colors & Surface Philosophy
The palette is rooted in the void (`#0e0e0f`) and built upward through light-emitting accents.

### The "No-Line" Rule
**Explicit Instruction:** Do not use 1px solid borders to section off the UI. Separation must be achieved through background shifts.
*   **Primary Sectioning:** Use `surface-container-low` for sidebars and `surface` for the main stage. 
*   **Micro-Separation:** Instead of a line, use a `2px` vertical offset in color (e.g., a `surface-container-highest` element nested within `surface-container-low`).

### Surface Hierarchy & Nesting
Treat the UI as a series of physical layers of dark, polarized glass.
*   **Base:** `surface-container-lowest` (#000000) for deep background elements or grid-patterned areas.
*   **The Stage:** `surface` (#0e0e0f) for the primary workspace.
*   **Interactive Modules:** `surface-container` (#1a191b) for cards and data widgets.
*   **Elevated Details:** `surface-container-high` (#201f21) for popovers or active selection states.

### The "Glass & Gradient" Rule
To achieve "The Synthetic Sentinel" look, use `surface-variant` with a `backdrop-blur` of 12px–20px for floating panels. Main CTAs should never be flat; use a linear gradient from `primary` (#5cbfff) to `primary-dim` (#00a7f0) at a 135-degree angle to simulate glowing light.

---

### 3. Typography: Editorial Authority
We pair the geometric precision of **Space Grotesk** for data-heavy headlines with the high-legibility of **Inter** for analytical reading.

| Level | Token | Font | Size | Intent |
| :--- | :--- | :--- | :--- | :--- |
| **Display** | `display-lg` | Space Grotesk | 3.5rem | High-impact threat levels |
| **Headline** | `headline-md` | Space Grotesk | 1.75rem | Section headers / Module titles |
| **Title** | `title-md` | Inter | 1.125rem | Card headers / Modal titles |
| **Body** | `body-md` | Inter | 0.875rem | Standard analytical text |
| **Label** | `label-sm` | Inter | 0.6875rem | Metadata, timestamps, and tags |

**Editorial Note:** Use `on-surface-variant` (#adaaab) for body text to reduce eye strain, reserving pure `on-surface` (#ffffff) for headlines and critical alerts.

---

## 4. Elevation & Depth: Tonal Layering
Traditional drop shadows are forbidden. We use **Ambient Glows** and **Internal Radiance**.

*   **The Layering Principle:** Depth is achieved by "stacking." A `surface-container-highest` card should sit on a `surface-container-low` section. The contrast in black/charcoal values provides the "lift."
*   **Ambient Shadows:** For floating modals, use a shadow with a 40px blur, 0px offset, and 8% opacity using the `secondary` (#9093ff) color. This creates a "blue-light bleed" that feels high-tech.
*   **The Ghost Border Fallback:** If a boundary is required for accessibility, use `outline-variant` (#484849) at **15% opacity**. It should be felt, not seen.
*   **Signature Grid:** Apply a subtle 24px x 24px grid pattern to the `surface-container-lowest` layer using `outline` at 5% opacity to reinforce the "intelligence platform" aesthetic.

---

## 5. Components

### Buttons & Interaction
*   **Primary:** Gradient fill (`primary` to `primary-dim`). Corner radius: `md` (0.375rem). Add a subtle outer glow (box-shadow) using the `primary` color at 20% opacity on hover.
*   **Secondary:** Ghost style. `outline-variant` border (20% opacity) with `on-surface` text. On hover, the background shifts to `surface-bright`.
*   **Tertiary:** Text-only with `label-md` styling. Use `primary` color for the text.

### Glass Cards
*   **Execution:** Background: `surface-container` at 70% opacity. `backdrop-filter: blur(12px)`. 
*   **No Dividers:** Never use lines to separate content within a card. Use `Spacing 6` (1.3rem) to create clear groupings of data.

### Input Fields
*   **Default:** `surface-container-highest` background. No border, just a bottom-aligned `1px` stroke of `outline-variant`.
*   **Focus:** The bottom stroke animates to `primary` (#5cbfff) and a subtle `surface-tint` glow appears behind the text.

### Tactical Gauges (Custom Component)
*   Used for "Harm Intelligence" scores. Use `tertiary_dim` (#00edb4) for safe metrics and `error` (#ff716c) for critical threats. Gauges must use a "segmented" stroke (e.g., 20 dashes) rather than a continuous line to maintain the HUD aesthetic.

---

## 6. Do’s and Don’ts

### Do:
*   **Use Asymmetry:** Align primary data to the left and secondary "meta" data to the right to create a sophisticated, non-template look.
*   **Embrace Breathing Room:** Use `Spacing 12` (2.75rem) and `16` (3.5rem) between major modules to let the "glass" breathe.
*   **Layer Color:** Use `on-secondary-container` for text that sits on top of accent colors to ensure tactical legibility.

### Don’t:
*   **Don't use 100% White:** Avoid `#ffffff` for large blocks of text. It "blooms" too much on dark backgrounds. Use `on-surface-variant`.
*   **Don't use Rounded Corners:** Avoid `full` (pill) shapes for anything other than status chips. Stick to `sm` (0.125rem) or `md` (0.375rem) to keep the aesthetic sharp and aggressive.
*   **Don't use Hard Lines:** Never use `outline` at 100% opacity. It shatters the illusion of the "Glassmorphism" depth.