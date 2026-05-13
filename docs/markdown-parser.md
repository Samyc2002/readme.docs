# Markdown Parser

## Overview

readme.docs includes a built-in markdown parser (`parseMarkdown` in `script.js`) that converts raw markdown to semantic HTML. It's regex-based, handles the most common markdown constructs, and requires no external libraries.

## Supported Syntax

### Block Elements

| Syntax | Output |
|--------|--------|
| `# Heading` through `###### Heading` | `<h1>` through `<h6>` |
| `` ```lang ... ``` `` | `<pre><code class="language-lang">` |
| `> Quote` | `<blockquote>` |
| `- Item` / `* Item` / `+ Item` | `<ul><li>` |
| `1. Item` | `<ol><li>` |
| `---` / `***` / `___` | `<hr />` |
| Pipe tables | `<table>` with `<thead>` and `<tbody>` |
| Plain text | `<p>` |

### Inline Elements

| Syntax | Output |
|--------|--------|
| `` `code` `` | `<code>` |
| `**bold**` | `<strong>` |
| `*italic*` | `<em>` |
| `***bold italic***` | `<strong><em>` |
| `~~strikethrough~~` | `<del>` |
| `[text](url)` | `<a href="url" target="_blank">` |
| `![alt](src)` | `<img src="src" alt="alt" loading="lazy">` |

## How It Works

The parser uses a stash-and-replace strategy to avoid regex conflicts between block and inline elements:

### 1. Stash Code Blocks

Fenced code blocks are extracted first and replaced with placeholders (`%%CB_0%%`, `%%CB_1%%`, etc.). This prevents the content inside code blocks from being parsed as markdown.

```
Input:  ```js\nconsole.log("hello")\n```
Stash:  %%CB_0%%
Block:  <pre><code class="language-js">console.log("hello")</code></pre>
```

### 2. Inline Elements

Inline code, images, and links are processed next (in that order to avoid conflicts):

- Inline code: `` `text` `` → `<code>text</code>`
- Images: `![alt](src)` → `<img>` (before links, since image syntax contains link syntax)
- Links: `[text](url)` → `<a>`

### 3. Block Elements

Headings, emphasis, horizontal rules, blockquotes, tables, and lists are processed via line-by-line regex replacements.

### 4. Paragraph Wrapping

Lines that don't start with an HTML block tag or a code block placeholder are wrapped in `<p>` tags. Empty paragraphs are stripped.

### 5. Restore Code Blocks

Placeholders are replaced with the original stashed `<pre><code>` blocks.

## Heading ID Generation

The `extractHeadings` function parses headings from raw markdown (after stripping code blocks) and generates URL-safe IDs:

```
"Getting Started" → "getting-started"
"API & Usage"     → "api--usage"
"What's New?"     → "whats-new"
```

The algorithm:
1. Strip link syntax and formatting characters
2. Convert to lowercase
3. Remove non-word characters (except spaces and hyphens)
4. Replace spaces with hyphens
5. Collapse consecutive hyphens

These IDs are injected into the rendered HTML by `addHeadingIds`, which matches heading tags by comparing their text content to find the right insertion point.

## Limitations

- Not fully CommonMark-compliant
- Nested lists are flattened (indentation is not preserved)
- No support for footnotes, definition lists, or task lists
- Tables require the header separator row (`|---|---|`)
- Blockquotes don't nest
- No syntax highlighting — code blocks get a `language-*` class but no token coloring
