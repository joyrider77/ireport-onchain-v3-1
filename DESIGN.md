# Design Brief: iReport Onchain V3.1

**Purpose**: Professional HR and time-tracking system for Swiss companies. Enterprise CRUD application + landing page showcase. Interior requires high information density and trusted corporate aesthetic; landing page emphasizes value proposition and Swiss SaaS polish.

**Tone**: Professional, utilitarian, trustworthy. Swiss precision with geometric clarity. Landing page adds welcoming warmth without sacrificing credibility.

**Interior Differentiation**: Corporate teal primary (#006066) with neutral greys; fixed header + collapsible sidebar as navigation backbone.

**Landing Page Differentiation**: Deep Cornflower Blue hero (#0A4A75) with 2-column layout (headline + visual), trust badges, feature grid, mobile mockup, benefits, pricing, FAQ, sticky nav, footer with Nutzungsbedingungen link. Minimal effects, subtle shadows, rounded corners 4-8px.

## Color Palette — Landing Page (Light Mode)

| Token | OKLCH | Usage |
|-------|-------|-------|
| Hero BG | `0.26 0.12 256` | Deep Cornflower Blue — hero background |
| Primary | `0.42 0.09 256` | Strong Cornflower Blue — CTAs, accents |
| Secondary | `0.54 0.11 256` | Brilliant Azure — highlights, badges |
| White | `0.995 0 0` | White text on dark, light backgrounds |
| Light BG | `0.97 0.01 254` | Light neutral — content sections |
| Text | `0.15 0.02 250` | Dark text on light backgrounds |
| Text Secondary | `0.45 0.02 250` | Medium-dark text for secondary info |

## Color Palette — App Interior (Light Mode)

| Token | OKLCH | Usage |
|-------|-------|-------|
| Primary | `0.42 0.085 196` | Corporate teal — buttons, active states |
| Foreground | `0.25 0.02 250` | Primary text on light backgrounds |
| Background | `0.99 0 0` | Main content area |
| Card | `1.0 0 0` | Card/panel backgrounds |
| Destructive | `0.55 0.22 25` | Delete, reject, error actions |

## Typography

| Layer | Font | Usage | Size | Weight |
|-------|------|-------|------|--------|
| Display | Figtree | Page titles, section headers | 1.5–3rem | 600–700 |
| Body | Nunito | Prose, form labels, tables | 0.875–1rem | 400–500 |
| Mono | Geist Mono | Timestamps, codes, data | 0.75–0.875rem | 400 |

## Structural Zones

| Zone | Background | Border | Elevation | Purpose |
|------|------------|--------|-----------|---------|
| Landing Hero | `--landing-hero-bg` | None | None | Brand message, 2-column headline + visual |
| Landing Content | `--landing-light-bg` | None | Subtle | Feature grid, benefits, pricing, FAQ |
| App Header | `--sidebar` | `--sidebar-border` | Card shadow | Brand, logo, user menu |
| App Sidebar | `--sidebar` | `--sidebar-border` | None | Navigation (collapsible) |
| App Card/Panel | `--card` | `--border` | Card shadow | Data containers, modals |

## Spacing & Rhythm

- Base unit: 4px (Tailwind standard)
- Density: Compact (European corporate standard)
- Vertical rhythm: 0.5rem / 0.75rem / 1rem / 1.5rem / 2rem
- Max-width: 1200–1280px (landing page content sections)

## Component Patterns

**Landing Page**: Hero (2-col), Trust Badges, Feature Cards, Mobile Section, Pricing, FAQ Accordion, Sticky Nav, Footer.
**App Interior**: Buttons (Primary/Secondary/Destructive), Inputs, Cards, Tables, Modals. All use interior teal primary.

## Motion

- Transition default: `all 0.3s cubic-bezier(0.4, 0, 0.2, 1)` (smooth ease-in-out)
- Minimal animations; stable, professional interactions
- Landing page: Subtle fade-in on scroll for content sections

## Signature Detail

Swiss precision through token-driven design. Deep Cornflower Blue hero anchors trust; white typography ensures clarity. Clean grids, rounded corners 4-8px, subtle shadows. iReport logo (200% size, transparent) in header and footer. Sticky navigation keeps CTA visible.

