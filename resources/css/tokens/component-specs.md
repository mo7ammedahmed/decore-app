# Decore — Component Specifications

Component specs for the Decore liquid-glass design system. Every value references
the three-layer token system (see `design-tokens.json` → `tokens.css` → `app.css`).
Tokens are resolved through `app.css` (`@theme inline` bridge) or directly via
`var(--*)` in component CSS.

Token layers:
- **Primitive** — `--primitive-color-white-a-*`, `--primitive-color-brass-*`, `--primitive-space-*`, `--primitive-radius-*`, `--primitive-duration-*`, …
- **Semantic** — `--color-*`, `--radius-*`, `--shadow-*`, `--duration-*`
- **Component** — `--button-*`, `--input-*`, `--card-*`, `--badge-*`, `--table-*`, `--dialog-*`, `--sidebar-*`

---

## Button

### Implementations

| Component | Variants | Use Case |
|-----------|----------|----------|
| `GlassButton` | `primary` · `secondary` · `danger` · `ghost` | Primary/secondary actions, can render as Inertia `Link` |
| `DangerButton` | destructive only | Destructive confirmations |
| `PrimaryButton` / `SecondaryButton` | legacy Breeze | Breeze-compatible submit buttons |

### Variants (GlassButton)

| Variant | Background | Text | Border | Hover |
|---------|------------|------|--------|-------|
| `primary` | `var(--color-glass-strong)` | `--color-foreground` (white) | none | `white-a-07` |
| `secondary` | `var(--color-glass)` | `--color-foreground-soft` | none | `white-a-05` + white text |
| `danger` | `--color-danger` @ 10% | `--color-danger` | `--color-danger` @ 30% | `--color-danger` @ 20% |
| `ghost` | transparent | `--color-foreground-faint` | none | `white-a-05` + white text |

### Sizes / Geometry

| Property | Value | Token |
|----------|-------|-------|
| Padding X | `--button-padding-x` (space-5) | `1.25rem` |
| Padding Y | `--button-padding-y` (space-2-5) | `0.625rem` |
| Radius | `--button-radius` (radius-pill) | `9999px` |
| Font size / weight | `--button-font-size` (sm) · `--button-font-weight` (medium) | `.875rem` / 500 |
| Gap (icon–label) | `--button-gap` (space-2) | `.5rem` |
| Transition | `transition-all duration-200` | `--duration-normal` |

### States

| State | Treatment |
|-------|-----------|
| default | Variant tokens above |
| hover | `hover:bg-white/[0.05–0.07]` or `hover:bg-danger/20` |
| focus-visible | `ring-2` `--color-foreground` @ 30% (white) / `--color-danger` @ 40% |
| active | Browser default press (slightly darker surface) |
| disabled | `opacity: var(--button-disabled-opacity)` (0.4), `cursor: not-allowed` |

### Anatomy

```
[icon]  Label Text        ← inline-flex, gap-2, centered
```

---

## Input

### Implementations

`TextInput`, `SelectInput`, `Textarea`, `DateInput`, `CurrencyInput`, `Checkbox` —
all render `.form-input` / `.form-select` / `.form-textarea` classes.

### Geometry

| Property | Value | Token |
|----------|-------|-------|
| Padding X | `--input-padding-x` (space-3-5) | `.875rem` |
| Padding Y | `--input-padding-y` (space-2-5) | `.625rem` |
| Radius | `--input-radius` (radius-control) | `.75rem` |
| Font size | `--input-font-size` (sm) | `.875rem` |

### States

| State | Background | Border | Ring / Shadow |
|-------|------------|--------|---------------|
| default | `--input-bg` (white-a-04) | `--input-border` (white-a-10) | none |
| hover | `--input-hover-bg` (white-a-06) | `--input-border` | none |
| focus | `--input-hover-bg` | `--input-focus-border` (white-a-30) | `0 0 0 2px var(--input-focus-ring)` (white-a-10) |
| error (via `.field-error-border`) | — | `color-mix(danger 60%, transparent)` | — |
| placeholder | — | — | `--input-placeholder` (white-a-35) |
| disabled | — | — | `opacity: var(--input-disabled-opacity)` (0.5), `not-allowed` |

### Label & Errors

| Element | Class | Color |
|---------|-------|-------|
| Label | `.form-label` | `--color-secondary-text` (white-a-70) |
| Error text | `.field-error` | `--color-danger` |
| Required marker | `FormField` `<span class="text-accent">*</span>` | `--color-accent` |

---

## Card

### Implementations

| Component | Surface | Use Case |
|-----------|---------|----------|
| `GlassCard` (default) | `.liquid-glass` | Standard content card |
| `GlassCard strong` | `.liquid-glass-strong` | Prominent / primary surface |
| `MetricCard` | `.liquid-glass` | Dashboard metric, accent icon |

### Geometry

| Property | Value | Token |
|----------|-------|-------|
| Radius | `rounded-card` | `--radius-card` (radius-20, `1.25rem`) |
| Padding (inline usage) | `p-6` | `--card-padding` (space-6, `1.5rem`) |
| Border | none (masked gradient edge via `.liquid-glass::before`) | — |
| Shadow | `--card-shadow` (`--shadow-glass`) | inset 1px white-a-10 |

### Liquid-glass edge

`.liquid-glass::before` paints a 1.4px masked gradient border from
`--primitive-color-white-a-45` → `white-a-15` → transparent → `white-a-15` →
`white-a-45` (the "liquid" rim). Strong variant uses `white-a-50 / -20 / -04`.

### Fallback

Browsers without `backdrop-filter` get an opaque `rgba(20, 20, 22, 0.96)` surface.

---

## Badge

### Implementation

`StatusBadge` — pill with optional status dot. Tone is passed in per use site.

### Geometry

| Property | Value | Token |
|----------|-------|-------|
| Padding X / Y | `px-3 py-1` | `--badge-padding-x/y` (space-3 / space-1) |
| Radius | `rounded-full` | `--badge-radius` (radius-pill) |
| Font | `text-[11px] font-medium uppercase tracking-[0.12em]` | `--badge-font-size` (xs) / `--badge-font-weight` |

### Tone Recipes (used across pages)

| Tone | Classes | Tokens |
|------|---------|--------|
| neutral | `bg-white/[0.06] text-white/60` | white-a-06 / white-a-60 |
| accent | `bg-accent/15 text-accent` | `--color-accent` @ 15% |
| success | `bg-success/15 text-success` | `--color-success` @ 15% |
| danger | `bg-danger/15 text-danger` | `--color-danger` @ 15% |
| warning | `bg-warning/15 text-warning` | `--color-warning` @ 15% |
| info | `bg-info/15 text-info` | `--color-info` @ 15% |
| inactive | `bg-white/[0.06] text-white/45` | white-a-06 / white-a-45 |

---

## Table

### Implementation

`.table-glass` — applied to plain `<table>` elements across index pages.

### Geometry & Colors

| Element | Property | Token |
|---------|----------|-------|
| th | `color` | `--table-header-fg` (white-a-50) |
| th | `padding` | `--table-cell-padding-y/x` (space-3-5 / space-4) |
| th | typography | `text-[11px] font-semibold uppercase tracking-[0.14em]` |
| td | `color` | `--table-cell-fg` (white-a-80) |
| td | `padding` | `--table-cell-padding-y/x` |
| row | `border-top` | `--table-row-border` (white-a-06) |
| row hover | `background` | `--table-row-hover` (white-a-03) |

### Row States

| State | Background |
|-------|------------|
| default | transparent |
| hover | `--table-row-hover` (white-a-03), transition `--duration-fast` |

### Cell Alignment

Text left-aligned; numeric/money cells use `tabular-nums` + right alignment at
the call site; badges centered.

---

## Dialog

### Implementation

`Modal` (headless-ui `Dialog` + `Transition`) with `DialogPanel` on
`.liquid-glass-strong`; `ConfirmDialog` wraps it for confirm/cancel flows.

### Geometry

| Property | Value | Token |
|----------|-------|-------|
| Panel radius | `rounded-modal` | `--radius-modal` (radius-24, `1.5rem`) |
| Panel background | `.liquid-glass-strong` | `--color-glass-strong` (white-a-04) + blur(50px) |
| Panel shadow | `shadow-2xl` | `--dialog-shadow` (`--shadow-modal`, `0 20px 60px black-a-50`) |
| Padding (ConfirmDialog) | `p-7` | `--dialog-padding` (space-7, `1.75rem`) |
| Overlay | `bg-black/70 backdrop-blur-sm` | black @ 70% |

### Sizes

| Size | Max width | Use Case |
|------|-----------|----------|
| `sm` | `sm:max-w-sm` | Confirmations (ConfirmDialog) |
| `md`/`lg`/`xl`/`2xl` | standard scale | Forms, image preview |

### Anatomy

```
[overlay: black/70 + blur]
┌────────────────────────────────┐  ← liquid-glass-strong panel
│ Header: title (font-heading)   │
│ Message (white/55)             │
│         [Cancel] [Confirm]     │  ← SecondaryButton + Danger/PrimaryButton
└────────────────────────────────┘
```

### Transitions

Panel: enter/leave `duration-300` ease-out, `translate-y-4 sm:scale-95` →
origin. Overlay fades `duration-300`. Disabled buttons show `processing` label.

---

## Motion & Accessibility

| Concern | Spec |
|---------|------|
| Interactive transitions | `--duration-fast` (150ms) for colors, `--duration-normal` (200ms) for transform |
| Focus visibility | `focus-visible:ring-2` on all interactive controls |
| Reduced motion | Global `prefers-reduced-motion` override in `app.css` |
| Disabled affordance | Opacity token + `cursor: not-allowed` + `disabled` attribute |
| Contrast | White-on-black system; accents only for emphasis, never sole indicator |

## Token Maintenance

1. Edit `tokens/design-tokens.json` (source of truth).
2. Re-run: `node <skill>/scripts/generate-tokens.cjs --config tokens/design-tokens.json -o tokens/tokens.css`.
3. Add Tailwind-facing semantic tokens to the `@theme inline` block in `app.css`.
4. Run the validator: `node <skill>/scripts/validate-tokens.cjs --dir resources/ --ignore public`.

### Build & cascade notes

- **Compiler**: Tailwind v4 runs through PostCSS (`@tailwindcss/postcss` in
  `postcss.config.mjs`). Do **not** reintroduce `@tailwindcss/vite` — it silently
  no-ops on Vite 8 (transform errors are swallowed, leaving raw `@theme`/`@apply`
  directives and zero utilities in the built CSS). Content sources are declared
  explicitly with `@source` in `app.css`.
- **Cascade**: `tokens.css` declares semantic/component tokens unlayered on
  `:root`, so they beat any `@layer theme` emission. Override theme values via
  the `@theme inline` bridge — never bare `.dark { … }` rules, which would
  silently lose.
- **Opacity modifiers bypass the semantic layer**: `bg-accent/15` bakes the
  primitive into `color-mix(in oklab, var(--primitive-color-brass-400) 15%, …)`
  at build time, while plain `text-accent` keeps the runtime
  `var(--color-accent)` chain. Changing a primitive requires a rebuild; a
  runtime override of `--color-accent` affects plain utilities only.
