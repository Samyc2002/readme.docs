# Architecture

## Overview

readme.docs is a zero-dependency, client-side-only web application. The entire app consists of three files:

```
index.html    — Markup and page structure
script.js     — All application logic
styles.css    — Styling with light/dark mode support
```

There is no build step, no bundler, no framework. The app runs entirely in the browser and fetches content from the GitHub API at runtime.

## How It Works

```
User visits /:owner/:repo
        │
        ▼
  parseHash() extracts org + repo from URL
        │
        ▼
  onRouteChange() dispatches to the right loader
        │
        ├─ No path segments ──► showView("home")
        ├─ /owner/repo ──────► loadRepo(org, repo)
        └─ /owner/repo/docs/ ► loadDocsContent(org, repo, docsPath)
```

### loadRepo Flow

1. Fetch repo metadata from `api.github.com/repos/:owner/:repo` (cached in memory)
2. Detect the default branch (doesn't assume `main` or `master`)
3. Check for a `/docs` folder in parallel
4. Fetch the raw README from `raw.githubusercontent.com`
5. Parse markdown → HTML
6. Extract headings → build sidebar navigation tree
7. Inject heading IDs for scroll-to-section links
8. Resolve relative URLs (images, links) to raw GitHub URLs
9. Render into the DOM
10. Set up IntersectionObserver for active section tracking

### loadDocsContent Flow

1. Fetch repo metadata (cached)
2. Fetch directory or file contents from the GitHub Contents API
3. If directory → render a file listing with breadcrumb navigation
4. If markdown file → parse and render with sidebar navigation
5. If non-markdown file → show as plain text with a "View on GitHub" link

## Key Design Decisions

### No Dependencies

Everything is built from scratch: markdown parser, URL router, sidebar tree builder. This keeps the total app size under 15KB and eliminates supply chain concerns.

### Client-Side Routing

Uses `history.pushState` for clean URLs like `/facebook/react` instead of hash-based routing (`/#/facebook/react`). The `_redirects` file tells Netlify to serve `index.html` for all paths, enabling this SPA pattern.

### In-Memory Caching

Repository metadata is cached in a plain object (`repoMetaCache`) to avoid redundant API calls when navigating between a repo's README and its docs folder. README content is not cached — it's re-fetched on each visit to ensure freshness.

### IntersectionObserver

Scroll position tracking for active section highlighting uses `IntersectionObserver` with a `rootMargin` of `-5% 0px -90% 0px`. This fires when a heading enters the top 5-10% of the viewport, giving a natural "you're reading this section" feel without expensive scroll event handlers.

## Module Organization

All code lives in `script.js`, organized into sections:

| Section | Functions |
|---------|-----------|
| **API** | `getRepoMeta` |
| **Routing** | `parseHash`, `goToRepo`, `onRouteChange` |
| **View toggling** | `showView` |
| **Markdown parser** | `parseMarkdown` |
| **Heading extraction** | `extractHeadings`, `buildNavTree`, `addHeadingIds` |
| **URL resolution** | `resolveUrls`, `resolveDocsUrls`, `resolvePath` |
| **Sidebar nav** | `renderNavTree`, `setActive`, `setupObserver` |
| **Rendering** | `loadRepo`, `loadDocsContent`, `renderDocFile`, `renderDirectoryListing` |
| **Docs navigation** | `buildBreadcrumb`, `formatPathTitle`, `setupInternalLinks`, `setupSidebarForDocs` |
| **Theme** | `toggleTheme`, `updateThemeIcon` |
| **UI** | `toggleSidebar`, `setupStickyTitle` |
