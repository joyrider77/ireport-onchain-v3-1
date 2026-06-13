# Design Brief: Period Close Feature

## Direction
Period Close Module — Administrative workflow for safely closing and reopening financial periods with clear status communication and audit trails.

## Tone
Refined, structured, trustworthy. Professional compliance aesthetic with status-aware color coding. No playfulness; every visual choice reinforces data integrity.

## Differentiation
Row-level status badges + integrated lock indicators make locked periods immediately recognizable without modal dialogs. Users cannot accidentally edit closed periods.

## Color Palette

| Token | OKLCH | Role |
|-------|-------|------|
| period-open | 0.94 0.01 220 | Neutral state, available for editing |
| period-ready | 0.75 0.12 80 | Intermediate, ready for close check |
| period-closed | 0.58 0.15 20 | Locked, restricted access |
| period-reopened | 0.42 0.085 196 | Recovered/restored state |

## Typography
- Display: Figtree — Page titles, section headers
- Body: Nunito — Tables, forms, descriptions
- Scale: h2 text-lg font-semibold, labels text-sm font-medium, body text-sm

## Elevation & Depth
Cards have subtle `border-border` and `bg-card`. Precheck panel uses left border accent (primary color) for emphasis. Lock indicators render with minimal shadow (border only).

## Structural Zones

| Zone | Background | Border | Notes |
|------|------------|--------|-------|
| Period Selector | bg-card | border-border | Compact form with month/year inputs |
| Precheck Panel | bg-card | border-l-4 primary | Warning/success icon indicators |
| Employee Table | bg-background | — | Row striping via alternating card styles |
| Actions | bg-background | — | Button group: "Abschluss durchführen", "Zurück" |
| Closed Entry Banner | bg-destructive/10 | border destructive/30 | Appears inline when period is locked |

## Spacing & Rhythm
Section gap 4 (1rem), card padding 3–4 (12–16px), badge padding 2–2.5 (8–10px). Rows in table maintain 3 (12px) padding for density.

## Component Patterns
- Status Badges: `.period-badge-{open|ready|closed|reopened}` — pill shape, semantic color + white text, no icon (text only)
- Lock Indicator: `.period-lock-indicator` — muted text, small border pill, lock icon + "Abgeschlossen"
- Precheck Item: `.period-precheck-item` — checkmark/warning/error icon + text
- Closed Period Banner: `.period-closed-banner` — destructive accent left border, inline info message

## Motion
- Entrance: Table rows fade in on load (no stagger)
- Hover: Row background brightens (bg-muted/50), no scale
- Status change: Badge color transition smooth (0.3s)

## Constraints
- No auto-scheduling UI (deferred feature)
- No multi-period range selector
- No detailed correction flags per row
- No approval workflows in UI
- Badge text only (no icon clutter)

## Signature Detail
Subtle left-border accent on precheck panel creates visual continuity with existing iReport design system while marking compliance checks as critical information.
