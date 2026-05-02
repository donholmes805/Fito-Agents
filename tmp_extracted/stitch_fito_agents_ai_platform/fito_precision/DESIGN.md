---
name: Fito Precision
colors:
  surface: '#101415'
  surface-dim: '#101415'
  surface-bright: '#363a3b'
  surface-container-lowest: '#0b0f10'
  surface-container-low: '#191c1e'
  surface-container: '#1d2022'
  surface-container-high: '#272a2c'
  surface-container-highest: '#323537'
  on-surface: '#e0e3e5'
  on-surface-variant: '#c6c6cb'
  inverse-surface: '#e0e3e5'
  inverse-on-surface: '#2d3133'
  outline: '#8f9095'
  outline-variant: '#45474b'
  surface-tint: '#c3c6cf'
  primary: '#c3c6cf'
  on-primary: '#2d3137'
  primary-container: '#0a0e14'
  on-primary-container: '#787b83'
  inverse-primary: '#5b5e66'
  secondary: '#b6c4ff'
  on-secondary: '#002780'
  secondary-container: '#0356ff'
  on-secondary-container: '#e4e7ff'
  tertiary: '#4edea3'
  on-tertiary: '#003824'
  tertiary-container: '#001108'
  on-tertiary-container: '#008c60'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#dfe2eb'
  primary-fixed-dim: '#c3c6cf'
  on-primary-fixed: '#181c22'
  on-primary-fixed-variant: '#43474e'
  secondary-fixed: '#dce1ff'
  secondary-fixed-dim: '#b6c4ff'
  on-secondary-fixed: '#001551'
  on-secondary-fixed-variant: '#0039b3'
  tertiary-fixed: '#6ffbbe'
  tertiary-fixed-dim: '#4edea3'
  on-tertiary-fixed: '#002113'
  on-tertiary-fixed-variant: '#005236'
  background: '#101415'
  on-background: '#e0e3e5'
  surface-variant: '#323537'
typography:
  h1:
    fontFamily: Space Grotesk
    fontSize: 48px
    fontWeight: '600'
    lineHeight: '1.1'
    letterSpacing: -0.02em
  h2:
    fontFamily: Space Grotesk
    fontSize: 32px
    fontWeight: '600'
    lineHeight: '1.2'
    letterSpacing: -0.01em
  h3:
    fontFamily: Space Grotesk
    fontSize: 24px
    fontWeight: '500'
    lineHeight: '1.3'
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: '1.6'
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.5'
  label-caps:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '600'
    lineHeight: '1'
    letterSpacing: 0.05em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  unit: 4px
  container-max: 1440px
  gutter: 24px
  margin-page: 40px
  stack-sm: 8px
  stack-md: 16px
  stack-lg: 32px
---

## Brand & Style

The design system is anchored in a **Corporate / Modern** aesthetic with **Futuristic Minimalism** influences. It targets high-level stakeholders and enterprise users who require a platform that feels stable, intelligent, and authoritative. 

The visual language rejects the common "playful AI" tropes. Instead, it adopts a high-end technology aesthetic characterized by deep tonal depth, precision-engineered spacing, and a focus on data clarity. The emotional goal is to evoke a sense of "quiet power"—a platform that works tirelessly and intelligently in the background. Subtle glass effects and microscopic gradients provide a sense of technical sophistication without compromising the professional atmosphere.

## Colors

The palette is primarily **dark-mode centric** to emphasize the futuristic, premium nature of the "Fito Agents" platform. 

- **Foundation:** The interface utilizes a deep hierarchy of `surface_black` for the base background and `deep_navy` for structural sidebars. 
- **Accents:** `Electric Blue` is used strictly for primary actions and interactive states. `Emerald Green` is reserved for success states, active agent indicators, and positive growth metrics.
- **Gradients:** Use linear gradients (135°) transitioning from `electric_blue` to a deeper navy to add depth to primary buttons and active indicators. Avoid high-contrast rainbows; keep transitions smooth and technical.

## Typography

This design system utilizes a dual-typeface approach to balance technical innovation with readability.

- **Headlines:** **Space Grotesk** provides a geometric, cutting-edge feel for titles and dashboard metrics. Its slightly wide stance suggests modern engineering.
- **Body & Interface:** **Inter** is used for all functional text, data tables, and agent logs. It ensures maximum legibility across high-density information displays.
- **Weight Strategy:** Use `600` for headers to maintain a strong presence against dark backgrounds. Use `400` for body text with a slightly increased line height (1.6) to prevent visual fatigue in a dark environment.

## Layout & Spacing

The layout follows a **Fixed Grid** system for dashboard environments, ensuring that agent controls and data visualizations remain predictable. 

- **Grid:** A 12-column system with a 24px gutter.
- **Rhythm:** An 8px linear scale (4px, 8px, 16px, 24px, 32px, 48px, 64px) governs all padding and margins. 
- **Density:** Maintain generous white space (or "dark space") between major modules to reinforce the premium, uncluttered aesthetic. Group related agent parameters using tight 8px stack spacing, but separate primary cards with at least 32px.

## Elevation & Depth

Depth is conveyed through **Tonal Layering** and **Subtle Glassmorphism** rather than heavy shadows.

- **Z-Axis Hierarchy:**
    - **Level 0 (Base):** #020617 (Surface Black).
    - **Level 1 (Cards/Panels):** #0F172A (Deep Navy) with a 1px border of #1E293B.
    - **Level 2 (Modals/Overlays):** #1E293B with a subtle backdrop blur (12px) and a light-tinted 0.5px top border to simulate a "rim light."
- **Shadows:** Use a single "Ambient Glow" shadow for active elements: `0px 20px 40px rgba(0, 0, 0, 0.4)`. For active agent cards, a very faint `electric_blue` outer glow (2% opacity) may be applied.

## Shapes

The shape language is defined by the **2xl rounded card** (1.5rem / 24px), which softens the technical edges of the UI and makes the platform feel modern and accessible.

- **Cards:** 24px corner radius.
- **Buttons & Inputs:** 8px corner radius (Soft) to provide a more precise, functional contrast to the larger containers.
- **Status Indicators:** Fully pill-shaped (rounded-full) to distinguish them from interactive buttons.

## Components

- **Buttons:** Primary CTAs use a subtle vertical gradient of `electric_blue` with white text. Hover states should increase the brightness of the gradient rather than changing the color. Ghost buttons use the `1px border` style with `Inter` Semibold text.
- **Cards:** Utilize the `rounded-2xl` specification. Backgrounds should be `Deep Navy`. Every card requires a subtle 1px border (#1E293B) to ensure separation from the base background.
- **Inputs:** Darker than the card background with a focus state that highlights the border in `electric_blue`. Labels are always positioned above the field in `label-caps` typography.
- **Agent Status Chips:** Small pill-shaped components. "Active" uses a pulsing `emerald_green` dot; "Idle" uses a solid grey-blue dot. 
- **Data Visualizations:** Charts should use `electric_blue` for primary data lines and `emerald_green` for secondary/success trends. Use thin stroke weights (1.5px - 2px) to maintain a refined look.
- **Scrollbars:** Custom slim scrollbars (4px width) in `Deep Navy` to remain unobtrusive.