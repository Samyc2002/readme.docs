# Getting Started

## Quick Start

**readme.docs** turns any GitHub repository's README into a clean documentation website with zero setup.

### Usage

1. Take any GitHub repo URL — for example, `https://github.com/facebook/react`
2. Replace `github.com` with the readme.docs domain
3. Your docs are live

That's it. No hosting, no config, no CI pipeline.

### Try It

Enter an `owner/repo` or paste a full GitHub URL into the input on the home page:

```
facebook/react
expressjs/express
sindresorhus/awesome
```

You can also navigate directly by visiting `/<owner>/<repo>` in the URL bar.

## Running Locally

The app uses client-side routing, so you need a server that serves `index.html` for all routes.

### With npx (one command)

```bash
npx serve -s . -l 3000
```

Then visit [http://localhost:3000](http://localhost:3000).

### With Python

```bash
# Python 3
python -m http.server 3000

# Note: Python's server doesn't support SPA fallback routing.
# Only the home page will work — direct URL navigation won't.
```

### With any static server

Any static file server that supports SPA fallback (serving `index.html` for unknown routes) will work. The `_redirects` file is configured for Netlify, but you can adapt the same pattern to Vercel, Cloudflare Pages, or nginx.

## URL Patterns

| URL | What it shows |
|-----|---------------|
| `/` | Home page with input field |
| `/:owner/:repo` | Rendered README for that repo |
| `/:owner/:repo/docs/` | Docs folder listing (if the repo has one) |
| `/:owner/:repo/docs/path/to/file.md` | Rendered markdown file from docs/ |

## Features at a Glance

- **Dark/light mode** — Toggle with the theme button. Respects your system preference by default, remembers your choice via localStorage.
- **Collapsible sidebar** — Auto-generated from markdown headings. H2s become sections, H3+ nest inside them.
- **Active section tracking** — The sidebar highlights where you are as you scroll.
- **Mobile responsive** — Sidebar becomes a slide-out drawer on small screens.
- **Docs folder browsing** — If a repo has a `/docs` directory, a "Documentation" link appears in the sidebar.
