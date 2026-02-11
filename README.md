# readme.docs

Turn any GitHub repo's README into a clean, browsable documentation site. No setup, no build step, no dependencies.

## The Problem

Most projects have a `README.md` and maybe a `docs/` folder scattered with markdown files. These docs are often unorganized, referenced from various places, and hard to browse. Setting up a proper documentation site (Docusaurus, GitBook, MkDocs) feels like overkill for a hobby project or a backend service that just needs its README to be readable.

## The Solution

**readme.docs** lets anyone turn their GitHub README into a static documentation website by just visiting a URL. No hosting, no config, no CI pipeline. Just share a link and your docs are live.

## How It Works

1. Visit your github repo — for example, `www.github.com/facebook/react`
2. Replace `github.com` with `domain-name` and that's it.
3. The app fetches the README from the repo's default branch via the GitHub API
4. Markdown is parsed and rendered as semantic HTML
5. Headings are extracted to build a navigable sidebar with collapsible sections
6. Scroll position is tracked to highlight the active section in the nav

That's it. One URL, instant docs.

## Features

**Zero dependencies** — No frameworks, no node_modules. A single HTML file with vanilla JS and minimal CSS. The entire app is under 15KB.

**Semantic HTML** — Uses `nav`, `main`, `article`, and proper heading hierarchy. Works well with terminal web readers like `w3m`, `lynx`, and screen readers.

**Auto-detected default branch** — Doesn't assume `main` or `master`. Fetches the actual default branch from the GitHub API.

**Built-in markdown parser** — Handles headings, fenced code blocks, inline code, tables, ordered and unordered lists, links, images, blockquotes, bold, italic, strikethrough, and horizontal rules. No marked.js, no showdown, no dependencies.

**Collapsible sidebar navigation** — Headings and subheadings are organized into a tree structure. H2s become top-level sections, H3s nest inside them, and so on. Sections can be collapsed and expanded.

**Active section highlighting** — As you scroll through the document, the sidebar highlights the current section using IntersectionObserver.

**Relative URL resolution** — Images and links with relative paths are automatically resolved to their raw GitHub URLs, so everything renders correctly.

**Clean URL routing** — Uses `history.pushState` for clean paths like `/owner/repo` instead of hash-based routing.

## Running Locally

Since the app uses client-side routing, you need a server that serves `index.html` for all routes.

### With npx (one command)

```bash
npx serve -s . -l 3000
```

Then visit `http://localhost:3000`.

## Project Structure

```
.
├── index.html    # The entire app — markup + styles
├── script.js     # Routing, markdown parser, sidebar nav, rendering
└── README.md     # You are here
```

## Limitations

- Only works for `github.com` repos as of now.
- Only parses the root `README.md` (doesn't crawl `docs/` folders yet)
- The markdown parser covers most common syntax but isn't fully CommonMark-compliant
- Subject to GitHub API rate limits (60 requests/hour unauthenticated)
- No caching yet — fetches the README on every page load

## License

MIT

## PS

No README or docs? Don't worry I got you covered. Check this out: [GithubWikiGenerator](https://github.com/Samyc2002/GithubWikiGenerator) for the repo and of course, [readmedocs.netlify.app/Samyc2002/GithubWikiGenerator](https://readmedocs.netlify.app/Samyc2002/GithubWikiGenerator) for the docs 😜
