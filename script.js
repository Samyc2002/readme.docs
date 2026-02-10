const GITHUB_RAW = "https://raw.githubusercontent.com";
const GITHUB_API = "https://api.github.com/repos";

let currentActiveId = "";

/* ── Routing ── */

function parseHash() {
    const h = location.pathname.replace(/^\//, "");
    if (!h) return null;
    const p = h.split("/").filter(Boolean);
    return p.length >= 2 ? { org: p[0], repo: p[1] } : null;
}

function goToRepo() {
    const v = document.getElementById("repo-input").value.trim();
    const cleaned = v.replace(/https?:\/\/(www\.)?github\.com\/?/, "").replace(
        /^\/+|\/+$/g,
        "",
    ).replace(/\.git$/, "");
    if (cleaned.includes("/")) {
        history.pushState(null, "", "/" + cleaned);
        onRouteChange();
    }
}

document.getElementById("repo-input").addEventListener("keydown", function(e) {
    if (e.key === "Enter") goToRepo();
});

/* ── View toggling ── */

function showView(name) {
    ["home", "loading", "error", "docs"].forEach(function(id) {
        const el = document.getElementById(id);
        el.style.display = "none";
        el.classList.remove("active");
    });
    const target = document.getElementById(name);
    target.style.display = "flex";
}

/* ── Markdown parser ── */

function parseMarkdown(md) {
    var html = md;

    // Stash code blocks
    var codeBlocks = [];
    html = html.replace(/```(\w*)\n([\s\S]*?)```/g, function(_, lang, code) {
        var escaped = code.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(
            />/g,
            "&gt;",
        );
        var ph = "%%CB_" + codeBlocks.length + "%%";
        codeBlocks.push(
            '<pre><code class="language-' + (lang || "text") + '">' +
            escaped.trimEnd() + "</code></pre>",
        );
        return ph;
    });

    html = html.replace(/`([^`]+)`/g, "<code>$1</code>");
    html = html.replace(
        /!\[([^\]]*)\]\(([^)]+)\)/g,
        '<img src="$2" alt="$1" loading="lazy" />',
    );
    html = html.replace(
        /\[([^\]]+)\]\(([^)]+)\)/g,
        '<a href="$2" target="_blank" rel="noopener">$1</a>',
    );

    html = html.replace(/^######\s+(.+)$/gm, "<h6>$1</h6>");
    html = html.replace(/^#####\s+(.+)$/gm, "<h5>$1</h5>");
    html = html.replace(/^####\s+(.+)$/gm, "<h4>$1</h4>");
    html = html.replace(/^###\s+(.+)$/gm, "<h3>$1</h3>");
    html = html.replace(/^##\s+(.+)$/gm, "<h2>$1</h2>");
    html = html.replace(/^#\s+(.+)$/gm, "<h1>$1</h1>");

    html = html.replace(/\*\*\*(.+?)\*\*\*/g, "<strong><em>$1</em></strong>");
    html = html.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
    html = html.replace(/\*(.+?)\*/g, "<em>$1</em>");
    html = html.replace(/~~(.+?)~~/g, "<del>$1</del>");

    html = html.replace(/^(-{3,}|\*{3,}|_{3,})$/gm, "<hr />");
    html = html.replace(/^>\s+(.+)$/gm, "<blockquote>$1</blockquote>");
    html = html.replace(/<\/blockquote>\n<blockquote>/g, "\n");

    // Tables
    html = html.replace(
        /^(\|.+\|)\n(\|[-| :]+\|)\n((?:\|.+\|\n?)*)/gm,
        function(_, hdr, _sep, body) {
            var ths = hdr.split("|").filter(function(c) {
                return c.trim();
            }).map(function(c) {
                return "<th>" + c.trim() + "</th>";
            }).join("");
            var rows = body.trim().split("\n").filter(function(r) {
                return r.trim();
            }).map(function(row) {
                var tds = row.split("|").filter(function(c) {
                    return c.trim();
                }).map(function(c) {
                    return "<td>" + c.trim() + "</td>";
                }).join("");
                return "<tr>" + tds + "</tr>";
            }).join("");
            return "<table><thead><tr>" + ths + "</tr></thead><tbody>" + rows +
                "</tbody></table>";
        },
    );

    // Lists
    html = html.replace(/^[\t ]*[-*+]\s+(.+)$/gm, "<li>$1</li>");
    html = html.replace(/((?:<li>.*<\/li>\n?)+)/g, "<ul>$1</ul>");
    html = html.replace(/^[\t ]*\d+\.\s+(.+)$/gm, "<oli>$1</oli>");
    html = html.replace(/((?:<oli>.*<\/oli>\n?)+)/g, function(m) {
        return "<ol>" + m.replace(/<\/?oli>/g, function(t) {
            return t.replace("oli", "li");
        }) + "</ol>";
    });

    // Paragraphs
    var lines = html.split("\n");
    var out = [];
    for (var i = 0; i < lines.length; i++) {
        var t = lines[i].trim();
        if (!t) {
            out.push("");
            continue;
        }
        if (/^<[a-z/]/.test(t) || /^%%CB_/.test(t)) {
            out.push(t);
            continue;
        }
        out.push("<p>" + t + "</p>");
    }
    html = out.join("\n").replace(/<p>\s*<\/p>/g, "");

    // Restore code blocks
    for (var j = 0; j < codeBlocks.length; j++) {
        html = html.replace("%%CB_" + j + "%%", codeBlocks[j]);
        html = html.replace("<p>%%CB_" + j + "%%</p>", codeBlocks[j]);
    }

    return html;
}

/* ── Heading extraction ── */

function extractHeadings(md) {
    var cleaned = md.replace(/```[\s\S]*?```/g, "");
    var headings = [];
    var re = /^(#{1,6})\s+(.+)$/gm;
    var m;
    while ((m = re.exec(cleaned)) !== null) {
        var level = m[1].length;
        var text = m[2].replace(/\[([^\]]+)\]\([^)]+\)/g, "$1").replace(
            /[*_`~]/g,
            "",
        ).trim();
        var id = text.toLowerCase().replace(/[^\w\s-]/g, "").replace(
            /\s+/g,
            "-",
        ).replace(/-+/g, "-");
        headings.push({ level: level, text: text, id: id });
    }
    return headings;
}

function buildNavTree(headings) {
    if (!headings.length) return [];
    var root = [];
    var stack = [{ children: root, level: 0 }];
    for (var i = 0; i < headings.length; i++) {
        var h = headings[i];
        var node = { level: h.level, text: h.text, id: h.id, children: [] };
        while (stack.length > 1 && stack[stack.length - 1].level >= h.level) {
            stack.pop();
        }
        stack[stack.length - 1].children.push(node);
        stack.push(node);
    }
    return root;
}

/* ── Add IDs to headings in HTML ── */

function addHeadingIds(html, headings) {
    var r = html;
    var used = {};
    for (var i = 0; i < headings.length; i++) {
        var h = headings[i];
        var tag = "h" + h.level;
        var safe = h.text.replace(/[^\w\s]/g, "");
        var re = new RegExp("<" + tag + ">([\\s\\S]*?)</" + tag + ">", "g");
        var m;
        while ((m = re.exec(r)) !== null) {
            if (used[m.index]) continue;
            var inner = m[1].replace(/<[^>]+>/g, "").replace(/[^\w\s]/g, "")
                .trim();
            if (inner.indexOf(safe) !== -1 || safe.indexOf(inner) !== -1) {
                var replacement = "<" + tag + ' id="' + h.id + '">' + m[1] +
                    "</" + tag + ">";
                r = r.slice(0, m.index) + replacement +
                    r.slice(m.index + m[0].length);
                used[m.index] = true;
                break;
            }
        }
    }
    return r;
}

/* ── Resolve relative URLs ── */

function resolveUrls(html, org, repo, branch) {
    var base = GITHUB_RAW + "/" + org + "/" + repo + "/" + branch;
    return html
        .replace(/src="(?!https?:\/\/|data:)([^"]+)"/g, 'src="' + base + '/$1"')
        .replace(
            /href="(?!https?:\/\/|#|mailto:)([^"]+)"/g,
            'href="' + base + '/$1"',
        );
}

/* ── Build sidebar nav DOM ── */

function renderNavTree(nodes, parentUl) {
    for (var i = 0; i < nodes.length; i++) {
        var node = nodes[i];
        var li = document.createElement("li");
        var row = document.createElement("div");
        row.className = "nav-row";

        if (node.children.length > 0) {
            var btn = document.createElement("button");
            btn.className = "toggle-btn";
            btn.textContent = "▼";
            btn.setAttribute("aria-label", "Collapse");
            (function(btn, li) {
                btn.addEventListener("click", function() {
                    var sub = li.querySelector("ul");
                    if (!sub) return;
                    var hidden = sub.style.display === "none";
                    sub.style.display = hidden ? "" : "none";
                    btn.textContent = hidden ? "▼" : "▶";
                    btn.setAttribute(
                        "aria-label",
                        hidden ? "Collapse" : "Expand",
                    );
                });
            })(btn, li);
            row.appendChild(btn);
        } else {
            var spacer = document.createElement("span");
            spacer.className = "spacer";
            row.appendChild(spacer);
        }

        var a = document.createElement("a");
        a.href = "#" + node.id;
        a.className = "nav-link" + (node.level > 2 ? " child" : "");
        a.textContent = node.text;
        a.setAttribute("data-id", node.id);
        a.addEventListener("click", function(e) {
            e.preventDefault();
            var id = this.getAttribute("data-id");
            var target = document.getElementById(id);
            if (target) {
                target.scrollIntoView({ behavior: "smooth", block: "start" });
                setActive(id);
            }
        });
        row.appendChild(a);
        li.appendChild(row);

        if (node.children.length > 0) {
            var sub = document.createElement("ul");
            renderNavTree(node.children, sub);
            li.appendChild(sub);
        }

        parentUl.appendChild(li);
    }
}

function setActive(id) {
    if (id === currentActiveId) return;
    currentActiveId = id;
    var links = document.querySelectorAll("#sidebar a.nav-link");
    for (var i = 0; i < links.length; i++) {
        links[i].classList.toggle(
            "active",
            links[i].getAttribute("data-id") === id,
        );
    }
}

/* ── Intersection Observer for active heading ── */

var observer = null;

function setupObserver() {
    if (observer) observer.disconnect();
    observer = new IntersectionObserver(function(entries) {
        for (var i = 0; i < entries.length; i++) {
            if (entries[i].isIntersecting) {
                setActive(entries[i].target.id);
                break;
            }
        }
    }, { rootMargin: "-5% 0px -90% 0px" });

    var headings = document.querySelectorAll(
        "#article h1[id], #article h2[id], #article h3[id], #article h4[id], #article h5[id], #article h6[id]",
    );
    for (var i = 0; i < headings.length; i++) observer.observe(headings[i]);
}

/* ── Fetch and render ── */

async function loadRepo(org, repo) {
    showView("loading");
    document.getElementById("loading-msg").innerHTML =
        'Fetching README for <strong style="font-family:monospace">' + org +
        "/" + repo + "</strong>…";

    try {
        var repoRes = await fetch(GITHUB_API + "/" + org + "/" + repo);
        if (!repoRes.ok) {
            throw new Error("Repository not found: " + org + "/" + repo);
        }
        var repoData = await repoRes.json();
        var branch = repoData.default_branch || "main";

        var md = null;
        var files = ["README.md", "readme.md", "README", "Readme.md"];
        for (var i = 0; i < files.length; i++) {
            var res = await fetch(
                GITHUB_RAW + "/" + org + "/" + repo + "/" + branch + "/" +
                files[i],
            );
            if (res.ok) {
                md = await res.text();
                break;
            }
        }
        if (!md) throw new Error("No README found in this repository.");

        document.getElementById("sidebar-gh-link").href = "https://github.com/" + org + "/" + repo;

        // Parse
        var headings = extractHeadings(md);
        var tree = buildNavTree(headings);
        var html = parseMarkdown(md);
        html = addHeadingIds(html, headings);
        html = resolveUrls(html, org, repo, branch);

        // Render
        document.getElementById("sidebar-title").innerHTML = "";
        document.getElementById("sidebar-title").innerHTML +=
            `<div>${org}</div>`;
        document.getElementById("sidebar-title").innerHTML += `<div>/</div>`;
        document.getElementById("sidebar-title").innerHTML +=
            `<div>${repo}</div>`;
        document.title = org + "/" + repo + " — readme.docs";

        var navUl = document.getElementById("nav-tree");
        navUl.innerHTML = "";
        renderNavTree(tree, navUl);

        document.getElementById("article").innerHTML = html;

        showView("docs");

        window.github_url = "www.github.com/" + org + "/" + repo;

        // Start observer after DOM settles
        setTimeout(setupObserver, 100);
    } catch (err) {
        document.getElementById("error-msg").textContent = err.message;
        showView("error");
    }
}

/* ── Navigation handler ── */

document.querySelectorAll("a[data-route]").forEach(function(a) {
    a.addEventListener("click", function(e) {
        e.preventDefault();
        history.pushState(null, "", this.getAttribute("href"));
        onRouteChange();
    });
});

/* ── Hash change handler ── */

function onRouteChange() {
    var route = parseHash();
    if (route) {
        loadRepo(route.org, route.repo);
    } else {
        showView("home");
        document.title = "readme.docs";
        if (observer) observer.disconnect();
    }
}

window.addEventListener("popstate", onRouteChange);
onRouteChange();

function toggleTheme() {
    var isDark = document.body.classList.toggle("dark");
    localStorage.setItem("theme", isDark ? "dark" : "light");
    updateThemeIcon(isDark);
}

function updateThemeIcon(isDark) {
    var icon = document.getElementById("theme-icon");
    if (!icon) return;
    icon.innerHTML = isDark
        ? '<circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>'
        : '<path d="M21 12.79A9 9 0 1 1 11.21 3a7 7 0 0 0 9.79 9.79z"/>';
}

// Load saved theme on startup
(function() {
    var saved = localStorage.getItem("theme");
    if (
        saved === "dark" ||
        (!saved && window.matchMedia("(prefers-color-scheme: dark)").matches)
    ) {
        document.body.classList.add("dark");
        updateThemeIcon(true);
    }
})();
