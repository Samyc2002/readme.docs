# GitHub API Integration

## Endpoints Used

readme.docs uses two GitHub services to fetch and render repository content:

### GitHub REST API v3

Base URL: `https://api.github.com/repos`

| Endpoint | Purpose |
|----------|---------|
| `GET /repos/:owner/:repo` | Fetch repository metadata (default branch, homepage, description) |
| `GET /repos/:owner/:repo/contents/:path?ref=:branch` | Fetch directory listings and file metadata for docs browsing |

### GitHub Raw Content

Base URL: `https://raw.githubusercontent.com`

| Endpoint | Purpose |
|----------|---------|
| `GET /:owner/:repo/:branch/README.md` | Fetch the raw README file |
| `GET /:owner/:repo/:branch/:path` | Fetch raw file content for docs folder files |

## README Detection

The app tries multiple filename variations in order:

1. `README.md`
2. `readme.md`
3. `README`
4. `Readme.md`

The first successful fetch is used.

## Default Branch Detection

Rather than hardcoding `main` or `master`, the app fetches repo metadata and reads `default_branch` from the response. This handles repos that use `trunk`, `develop`, or any custom branch name.

## Metadata Caching

Repository metadata is cached in memory using a simple object keyed by `org/repo`:

```javascript
var repoMetaCache = {};

async function getRepoMeta(org, repo) {
    var key = org + "/" + repo;
    if (repoMetaCache[key]) return repoMetaCache[key];
    var res = await fetch(GITHUB_API + "/" + org + "/" + repo);
    var data = await res.json();
    repoMetaCache[key] = data;
    return data;
}
```

This avoids redundant API calls when navigating between a repo's README and its docs folder within the same session. The cache is not persisted — it resets on page reload.

## Rate Limits

GitHub's unauthenticated API rate limit is **60 requests per hour** per IP address. Each page view consumes:

| Action | API Calls |
|--------|-----------|
| View a README | 1-2 (metadata + docs folder check) |
| Browse docs folder | 1 (directory listing, metadata is cached) |
| View a docs file | 1 (raw file content) |

Heavy usage or automated tools will hit the rate limit. The app does not currently support authenticated requests or display rate limit warnings.

## URL Resolution

Relative URLs in markdown (images, links) need to point to the correct location on GitHub's servers. Two functions handle this:

### `resolveUrls(html, org, repo, branch)`

Used for the root README. Converts relative paths to raw GitHub URLs:

```
src="logo.png" → src="https://raw.githubusercontent.com/owner/repo/main/logo.png"
href="CONTRIBUTING.md" → href="https://raw.githubusercontent.com/owner/repo/main/CONTRIBUTING.md"
```

Skips absolute URLs (`https://`), data URIs (`data:`), anchor links (`#`), and mailto links.

### `resolveDocsUrls(html, org, repo, branch, docsPath)`

Used for files inside the docs folder. Handles two cases:

- **Markdown links** (`.md` files) — resolved to internal app routes (`/owner/repo/docs/path.md`) with `data-internal` attribute for SPA navigation
- **Other relative paths** — resolved to raw GitHub URLs relative to the current docs directory
