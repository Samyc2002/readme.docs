# Theming

## Light and Dark Mode

readme.docs supports light and dark color schemes. The toggle button appears in the top-right corner of every view.

### How It Works

Theme state is managed via a CSS class on `<body>`:

- **Light mode** (default): no class
- **Dark mode**: `body.dark`

All dark mode styles are scoped under `body.dark` in `styles.css`.

### Persistence

The selected theme is saved to `localStorage` under the key `theme` (values: `"dark"` or `"light"`). On page load, the app checks:

1. If `localStorage.theme` is `"dark"` → apply dark mode
2. If no saved preference and `prefers-color-scheme: dark` matches → apply dark mode
3. Otherwise → light mode

### Color Palette

#### Light Mode

| Element | Color |
|---------|-------|
| Background | `#fff` |
| Text | `#1a1a1a` |
| Links | `#0366d6` |
| Code background | `#f0f0f0` / `#f6f6f6` |
| Borders | `#e0e0e0` / `#eee` |
| Sidebar nav | `#555` |
| Active nav link | `#000` |

#### Dark Mode

| Element | Color |
|---------|-------|
| Background | `#161b22` |
| Text | `#c9d1d9` |
| Links | `#58a6ff` |
| Code background | `#21262d` / `#0d1117` |
| Borders | `#30363d` |
| Sidebar nav | `#8b949e` |
| Active nav link | `#f0f0f0` |

### Theme Icon

The toggle button uses an inline SVG that changes between:

- **Light mode icon**: Moon path (`M21 12.79A9 9 0 1 1 11.21 3...`)
- **Dark mode icon**: Sun with rays (circle + 8 lines)

The icon is updated by `updateThemeIcon(isDark)` which replaces the SVG's `innerHTML`.

## CSS Architecture

Styles follow a flat, section-based organization:

```
Reset
Home page
Loading / Error views
Docs layout
Sidebar
Content area
Article typography
Utility components (buttons, icons)
Dark mode overrides
Responsive breakpoints
Docs-specific components (breadcrumb, directory listing)
```

### Responsive Design

A single breakpoint at `768px` switches to mobile layout:

- Sidebar becomes a fixed, off-screen drawer (slides in from the left)
- Hamburger menu button appears at top-left
- Semi-transparent overlay covers content when sidebar is open
- Content padding is reduced

### Typography

| Context | Font Stack |
|---------|-----------|
| Body text | `system-ui, -apple-system, sans-serif` |
| Code | `SFMono-Regular, Consolas, "Liberation Mono", Menlo, monospace` |
| Repo name | `monospace` |
| Sticky title | `monospace` |
