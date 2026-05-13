# Routing

## Client-Side Routing

readme.docs uses the History API (`history.pushState`) for clean URL routing. There are no hash fragments — URLs look like native paths:

```
/                          → Home
/facebook/react            → Repo README
/facebook/react/docs/      → Docs folder listing
/facebook/react/docs/api.md → Specific docs file
```

## URL Parsing

`parseHash()` extracts the route from `location.pathname`:

```javascript
// "/facebook/react" → { org: "facebook", repo: "react" }
// "/facebook/react/docs/api.md" → { org: "facebook", repo: "react", docsPath: "docs/api.md" }
// "/" → null (home page)
```

Requires at least two path segments (org and repo). Any segments beyond the first two are joined into `docsPath`.

## Route Dispatch

`onRouteChange()` is the central dispatcher:

```
parseHash() result
    │
    ├─ null ──────────► showView("home")
    ├─ has docsPath ──► loadDocsContent(org, repo, docsPath)
    └─ org + repo ────► loadRepo(org, repo)
```

This function is called on:
- Initial page load
- `popstate` events (browser back/forward)
- Programmatic navigation via `history.pushState`

## Navigation Methods

### Input Field

The home page input accepts `owner/repo` or a full GitHub URL. `goToRepo()` strips the GitHub domain, trailing slashes, and `.git` suffix, then pushes the cleaned path.

### Example Links

Links with `data-route` attribute on the home page use `history.pushState` instead of a full page navigation.

### Internal Links

Links within rendered content that point to other docs files are marked with `data-internal`. A click handler on `#article` intercepts these and routes them through `onRouteChange()`.

### Link Click Handling

The `#article` element has a delegated click handler that processes links in priority order:

1. **Anchor links** (`#section`) → smooth scroll to the target element
2. **Internal links** (`data-internal`) → SPA navigation via `pushState`
3. **Self-referencing links** (same repo URL) → scroll to top
4. **GitHub blob/tree links** → pass through to GitHub (normal navigation)
5. **Same-origin links** → SPA navigation via `pushState`
6. **Everything else** → normal external navigation

## SPA Fallback

The `_redirects` file configures Netlify to serve `index.html` for all routes:

```
/*    /index.html   200
```

This is essential for client-side routing — without it, direct URL visits (e.g., refreshing `/facebook/react`) would return a 404.

For other hosts, configure the equivalent:

| Host | Config |
|------|--------|
| Netlify | `_redirects` with `/* /index.html 200` |
| Vercel | `vercel.json` with `rewrites` |
| nginx | `try_files $uri /index.html` |
| Apache | `.htaccess` with `FallbackResource /index.html` |
