# Contributing

## Project Philosophy

readme.docs is intentionally minimal. Before adding a feature, consider whether it belongs in a zero-dependency, single-page documentation viewer. The guiding principles:

- **No build step.** The app must work by opening `index.html` with a static server.
- **No dependencies.** Everything is vanilla JS/CSS. No npm, no CDN imports.
- **Under 15KB.** The combined size of `index.html`, `script.js`, and `styles.css` should stay small.

## Project Structure

```
.
├── index.html      # Page structure and embedded SVG icons
├── script.js       # All application logic
├── styles.css      # All styling, including dark mode and responsive
├── _redirects      # Netlify SPA routing config
├── README.md       # Project README
├── LICENSE         # MIT License
└── docs/           # This documentation
```

## Development Setup

1. Clone the repository:

```bash
git clone https://github.com/Samyc2002/readme.docs.git
cd readme.docs
```

2. Start a local server with SPA fallback:

```bash
npx serve -s . -l 3000
```

3. Open [http://localhost:3000](http://localhost:3000)

That's it — edit the files and refresh.

## Code Style

- **ES5-compatible JavaScript.** Uses `var`, `function`, and `for` loops. No arrow functions, no `let`/`const`, no template literals in the core logic (a few exist in `loadRepo` for sidebar rendering).
- **No semicolons omitted.** Every statement ends with `;`.
- **Flat CSS.** No nesting, no preprocessors. Dark mode is handled with `body.dark` selectors.

## Making Changes

### Adding Markdown Syntax

The parser in `parseMarkdown()` processes syntax in a specific order. If adding a new construct:

1. If it's a block element, stash it before inline processing (like code blocks)
2. Ensure it doesn't conflict with existing regex patterns
3. Test with repos that use the syntax heavily

### Adding a Feature

1. Keep it in `script.js` — avoid creating new files unless absolutely necessary
2. Follow the existing section comment pattern (`/* ── Section Name ── */`)
3. Test in both light and dark mode
4. Test on mobile viewport (sidebar drawer behavior)

### Modifying Styles

All styles are in `styles.css`. When adding styles:

1. Add the light mode version first
2. Add the `body.dark` override immediately below
3. Check the `@media (max-width: 768px)` section for mobile implications

## Testing

There's no test suite — the app is simple enough to test manually. When submitting changes, verify:

- [ ] Home page loads and input works
- [ ] A repo README renders correctly
- [ ] Sidebar navigation works (click + scroll tracking)
- [ ] Dark mode toggle works in all views
- [ ] Mobile layout works (sidebar drawer, responsive content)
- [ ] Docs folder browsing works (if applicable)
- [ ] Browser back/forward navigation works
- [ ] Direct URL access works (not just navigation from home)

## Deployment

The app is deployed on Netlify. Pushing to `main` triggers a deploy. The only build configuration is the `_redirects` file for SPA routing.
