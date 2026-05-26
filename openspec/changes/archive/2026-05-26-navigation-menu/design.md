# Design: Navigation Menu (Spec 00)

## Component Architecture

### `Layout.tsx`

Two internal components:

```
Layout (default export)
├── Sidebar (internal component)
│   ├── Brand header (logo + name, collapsed: logo only)
│   ├── <nav> — 7 nav items
│   │   └── Selection Process item
│   │       ├── Link to /selection-process
│   │       ├── Chevron toggle button (aria-expanded)
│   │       └── Sub-stages list (10 items, collapsible)
│   └── User footer (avatar, name, email, logout button)
│
└── Layout
    ├── <aside> desktop — hidden lg:flex, w-64 — <Sidebar />
    ├── <aside> tablet  — hidden md:flex lg:hidden, w-16 — <Sidebar collapsed />
    ├── Mobile drawer overlay (z-40, backdrop + w-72 panel) — <Sidebar onClose />
    ├── Mobile top bar (hamburger + brand, md:hidden)
    └── <main> — flex-1 overflow-y-auto
```

### Responsive Strategy

| Breakpoint | Width | Sidebar behaviour |
|------------|-------|-------------------|
| `< md` (< 768px) | — | Hidden; top bar + hamburger → drawer |
| `md` (768–1023px) | w-16 | Icon-only rail; labels as `title` tooltips |
| `lg+` (≥ 1024px) | w-64 | Full sidebar (icon + label) |

The `collapsed` prop drives all differences:
- `collapsed=true`: `justify-center` on items, labels hidden with `{!collapsed && ...}`
- Brand collapses to icon only
- Sub-stages hidden in collapsed mode (no room)
- User footer shows avatar only + icon logout

### Selection Process Sub-stages

```
State: selectionOpen (boolean, default false)
Auto-opens: useEffect on location.pathname
  → opens when pathname starts with /candidature/ or equals /selection-process

Toggle: chevron button (aria-expanded, rotates 180° when open)
Sub-stages: <ul role="list"> with 10 <li> items
  → each item: emoji icon + stage label (text only, not links)
  → styled as muted text inside a left-border indent
```

Stage links are intentionally not clickable at nav level — stage navigation happens within the SelectionProcess page itself (clicking a stage row loads AI prep for that stage).

### Accessibility (WCAG 2.1 AA)

- All links: `aria-current="page"` when active
- All links: `aria-label={item.label}` when collapsed (tooltip equivalent)
- Toggle button: `aria-expanded={selectionOpen}`, `aria-label`
- Close button on drawer: `aria-label="Close navigation menu"`
- Hamburger: `aria-label="Open navigation menu"`, `aria-expanded`
- Keyboard: all interactive elements use `focus-visible:ring-2 focus-visible:ring-primary-500`
- Backdrop: `aria-hidden="true"`

### Route additions

| Route | Component | Notes |
|-------|-----------|-------|
| `/selection-process` | `SelectionProcessList` | Lists all open candidatures; links to `/candidature/:id` |
| `/closing` | `Closing` | Placeholder; full impl in spec 05 |

### Transitions

- Nav item hover/active: `transition-colors duration-150` (< 200ms ✅ NFR-01)
- Chevron rotation: `transition-transform duration-200`
- Drawer: no CSS animation (instant open/close — acceptable for v1, can add slide-in later)
