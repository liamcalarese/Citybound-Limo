#!/usr/bin/env python3
"""
Build the Citybound Limo blog.

    python3 tools/build_blog.py

Reads every Markdown file in content/blog/ and writes:
  - blog.html            the blog index (newest post first)
  - blog/<slug>.html     one page per post

The header, footer and <head> are copied from index.html, so blog pages
always match the rest of the site. No third-party packages are needed.
"""
import datetime
import html
import json
import math
import pathlib
import re
import sys

ROOT = pathlib.Path(__file__).resolve().parent.parent
POSTS_DIR = ROOT / "content" / "blog"
OUT_DIR = ROOT / "blog"
DEFAULT_IMAGE = "assets/img/hero-charlotte-night.jpg"


# --------------------------------------------------------------------------
# Front matter + Markdown
# --------------------------------------------------------------------------
def parse_front_matter(text, name):
    if not text.startswith("---"):
        sys.exit(f"{name}: must start with a '---' front matter block (title, date, ...).")
    _, fm, body = text.split("---", 2)
    meta = {}
    for line in fm.strip().splitlines():
        if not line.strip() or line.lstrip().startswith("#"):
            continue
        if ":" not in line:
            sys.exit(f"{name}: front matter line needs 'key: value' -> {line!r}")
        k, v = line.split(":", 1)
        meta[k.strip().lower()] = v.strip().strip('"').strip("'")
    return meta, body.strip()


def inline(text):
    """Inline Markdown: images, links, bold, italic, code. Escapes HTML."""
    out = html.escape(text, quote=False)
    out = re.sub(r"`([^`]+)`", r"<code>\1</code>", out)
    out = re.sub(
        r"!\[([^\]]*)\]\(([^)\s]+)\)",
        lambda m: f'<img src="{m.group(2)}" alt="{html.escape(m.group(1))}" loading="lazy">',
        out,
    )

    def link(m):
        label, url = m.group(1), m.group(2)
        ext = url.startswith("http") and "cityboundlimo.com" not in url
        attrs = ' target="_blank" rel="noopener"' if ext else ""
        return f'<a href="{url}"{attrs}>{label}</a>'

    out = re.sub(r"\[([^\]]+)\]\(([^)\s]+)\)", link, out)
    out = re.sub(r"\*\*(.+?)\*\*", r"<strong>\1</strong>", out)
    out = re.sub(r"(?<![\w*])\*(?!\s)(.+?)(?<!\s)\*(?![\w*])", r"<em>\1</em>", out)
    out = re.sub(r"(?<![\w_])_(?!\s)(.+?)(?<!\s)_(?![\w_])", r"<em>\1</em>", out)
    return out


def markdown(md):
    """Small Markdown subset: ## headings, paragraphs, lists, quotes, images, hr, raw HTML."""
    blocks, lines = [], md.splitlines()
    i = 0
    while i < len(lines):
        line = lines[i]
        s = line.strip()
        if not s:
            i += 1
            continue
        if s.startswith("<"):  # raw HTML block, passed through untouched
            buf = []
            while i < len(lines) and lines[i].strip():
                buf.append(lines[i]); i += 1
            blocks.append("\n".join(buf))
            continue
        m = re.match(r"^(#{1,4})\s+(.*)$", s)
        if m:
            level = max(2, len(m.group(1)))  # the post title is the page's only <h1>
            blocks.append(f"<h{level}>{inline(m.group(2))}</h{level}>")
            i += 1
            continue
        if re.match(r"^(-{3,}|\*{3,})$", s):
            blocks.append("<hr>")
            i += 1
            continue
        if s.startswith(">"):
            buf = []
            while i < len(lines) and lines[i].strip().startswith(">"):
                buf.append(lines[i].strip()[1:].strip()); i += 1
            blocks.append(f"<blockquote><p>{inline(' '.join(buf))}</p></blockquote>")
            continue
        if re.match(r"^[-*+]\s+", s) or re.match(r"^\d+[.)]\s+", s):
            ordered = bool(re.match(r"^\d+[.)]\s+", s))
            pat = r"^\d+[.)]\s+" if ordered else r"^[-*+]\s+"
            items = []
            while i < len(lines) and lines[i].strip():
                t = lines[i].strip()
                if re.match(pat, t):
                    items.append(re.sub(pat, "", t))
                elif items:
                    items[-1] += " " + t  # wrapped list line
                i += 1
            tag = "ol" if ordered else "ul"
            blocks.append(f"<{tag}>" + "".join(f"<li>{inline(x)}</li>" for x in items) + f"</{tag}>")
            continue
        m = re.match(r"^!\[([^\]]*)\]\(([^)\s]+)\)$", s)
        if m:
            blocks.append(inline(s))
            i += 1
            continue
        buf = []
        while i < len(lines) and lines[i].strip() and not re.match(r"^(#{1,4}\s|>|[-*+]\s|\d+[.)]\s|<)", lines[i].strip()):
            buf.append(lines[i].strip()); i += 1
        blocks.append(f"<p>{inline(' '.join(buf))}</p>")
    return "\n".join(blocks)


# --------------------------------------------------------------------------
# Posts
# --------------------------------------------------------------------------
def load_posts():
    posts = []
    for f in sorted(POSTS_DIR.glob("*.md")):
        if f.name.startswith("_"):
            continue  # _template.md etc.
        meta, body = parse_front_matter(f.read_text(encoding="utf-8"), f.name)
        if meta.get("draft", "").lower() in ("true", "yes", "1"):
            print(f"  skip (draft)  {f.name}")
            continue
        for req in ("title", "date"):
            if not meta.get(req):
                sys.exit(f"{f.name}: missing '{req}' in front matter.")
        try:
            date = datetime.date.fromisoformat(meta["date"])
        except ValueError:
            sys.exit(f"{f.name}: date must look like 2026-11-03, got {meta['date']!r}")
        slug = meta.get("slug") or re.sub(r"^\d{4}-\d{2}-\d{2}-", "", f.stem)
        slug = re.sub(r"[^a-z0-9-]+", "-", slug.lower()).strip("-")
        words = len(re.findall(r"\w+", body))
        first_para = next((p for p in body.split("\n\n") if p.strip() and not p.lstrip().startswith(("#", "!", "<", ">"))), "")
        excerpt = meta.get("description") or re.sub(r"[*_`\[\]]|\(.*?\)", "", first_para).strip()
        if len(excerpt) > 180:
            excerpt = excerpt[:177].rsplit(" ", 1)[0] + "…"
        posts.append({
            "title": meta["title"],
            "date": date,
            "date_label": f"{date:%B} {date.day}, {date.year}",
            "author": meta.get("author", "Citybound Limo"),
            "image": meta.get("image") or DEFAULT_IMAGE,
            "image_alt": meta.get("image_alt", meta["title"]),
            "excerpt": excerpt,
            "slug": slug,
            "file": f.name,
            "minutes": max(1, math.ceil(words / 220)),
            "html": markdown(body),
        })
    slugs = [p["slug"] for p in posts]
    dupes = {s for s in slugs if slugs.count(s) > 1}
    if dupes:
        sys.exit(f"Two posts share the same slug: {', '.join(dupes)}")
    posts.sort(key=lambda p: (p["date"], p["file"]), reverse=True)  # same date: later filename first
    return posts


# --------------------------------------------------------------------------
# Page shell (taken from index.html)
# --------------------------------------------------------------------------
def load_shell():
    idx = (ROOT / "index.html").read_text(encoding="utf-8")
    head, rest = idx.split('  <main id="main">', 1)
    tail = rest.split("  </main>", 1)[1]
    head = re.sub(r'\s*<script type="application/ld\+json">.*?</script>', "", head, flags=re.S)
    head = head.replace('<a href="index.html" aria-current="page">', '<a href="index.html">')
    head = head.replace('<a href="blog.html">', '<a href="blog.html" aria-current="page">', 1)
    return head, tail


def set_meta(head, title, desc, image):
    e = lambda x: html.escape(x, quote=True)
    head = re.sub(r"<title>.*?</title>", f"<title>{e(title)}</title>", head)
    head = re.sub(r'<meta name="description" content=".*?">', f'<meta name="description" content="{e(desc)}">', head)
    head = re.sub(r'<meta property="og:title" content=".*?">', f'<meta property="og:title" content="{e(title)}">', head)
    head = re.sub(r'<meta property="og:description" content=".*?">', f'<meta property="og:description" content="{e(desc)}">', head)
    head = re.sub(r'<meta property="og:image" content=".*?">', f'<meta property="og:image" content="{e(image)}">', head)
    return head


def to_subdir(page):
    """Rewrite root-relative links (assets/..., fleet.html) for pages inside blog/."""
    keep = ("http:", "https:", "mailto:", "tel:", "sms:", "#", "/", "data:", "../")

    def fix(m):
        attr, url = m.group(1), m.group(2)
        if url.startswith(keep):
            return m.group(0)
        if attr == "content" and not url.startswith("assets/"):
            return m.group(0)  # meta tags like viewport / theme-color
        return f'{attr}="../{url}"'

    page = re.sub(r'\b(href|src|data-src|content)="([^"]*)"', fix, page)
    return page.replace("url('assets/", "url('../assets/")


def card(p, prefix="", featured=False):
    cls = "post-card featured" if featured else "post-card"
    h = "h2" if featured else "h3"
    return f'''          <a class="{cls} reveal" href="{prefix}{p["slug"]}.html">
            <div class="post-card-media"><img src="{p["image"]}" alt="{html.escape(p["image_alt"])}" loading="lazy"></div>
            <div class="post-card-body">
              <div class="post-meta"><span>{p["date_label"]}</span><span>{p["minutes"]} min read</span></div>
              <{h}>{html.escape(p["title"])}</{h}>
              <p>{html.escape(p["excerpt"])}</p>
              <span class="read-more">Read article <svg><use href="#i-arrow"/></svg></span>
            </div>
          </a>'''


def build():
    if not POSTS_DIR.is_dir():
        sys.exit(f"No posts folder at {POSTS_DIR}")
    head, tail = load_shell()
    posts = load_posts()
    OUT_DIR.mkdir(exist_ok=True)

    # Remove pages for posts that were deleted or renamed
    live = {p["slug"] + ".html" for p in posts}
    for old in OUT_DIR.glob("*.html"):
        if old.name not in live:
            old.unlink()
            print(f"  removed       blog/{old.name}")

    # ---- Index ----
    if posts:
        cards = [card(posts[0], "blog/", featured=True)] + [card(p, "blog/") for p in posts[1:]]
        listing = '        <div class="post-grid">\n' + "\n".join(cards) + "\n        </div>"
    else:
        listing = '        <div class="empty-state">No posts yet — check back soon.</div>'
    index_main = f'''    <section class="page-hero">
      <div class="hero-bg" style="background-image:url('assets/img/g-escalade-mtn.jpg')"></div>
      <div class="container">
        <span class="eyebrow">Blog</span>
        <h1>News, tips &amp; travel ideas</h1>
        <p>Planning advice, local favorites and updates from the Citybound Limo team.</p>
      </div>
    </section>

    <section class="section">
      <div class="container">
{listing}
      </div>
    </section>
'''
    page = set_meta(head, "Blog | Citybound Limo — News, Tips & Travel Ideas",
                    "Travel tips, event planning advice and news from Citybound Limo, Charlotte's premier transportation service.",
                    "assets/img/g-escalade-mtn.jpg")
    (ROOT / "blog.html").write_text(page + '  <main id="main">\n' + index_main + "  </main>" + tail, encoding="utf-8")
    print(f"  wrote         blog.html ({len(posts)} post{'s' if len(posts) != 1 else ''})")

    # ---- Posts ----
    for p in posts:
        more = [q for q in posts if q is not p][:3]
        more_html = ""
        if more:
            more_html = f'''
    <section class="section section-white">
      <div class="container">
        <div class="section-head"><span class="eyebrow">Keep Reading</span><h2>More from the blog</h2></div>
        <div class="post-grid">
{chr(10).join(card(q) for q in more)}
        </div>
      </div>
    </section>
'''
        ld = '  <script type="application/ld+json">' + json.dumps({
            "@context": "https://schema.org",
            "@type": "BlogPosting",
            "headline": p["title"],
            "datePublished": p["date"].isoformat(),
            "author": {"@type": "Organization", "name": p["author"]},
            "publisher": {"@type": "Organization", "name": "Citybound Limo"},
            "image": "https://www.cityboundlimo.com/" + p["image"],
            "description": p["excerpt"],
        }) + "</script>\n"
        post_main = f'''    <section class="page-hero post-hero">
      <div class="hero-bg" style="background-image:url('{p["image"]}')"></div>
      <div class="container">
        <a class="back-link" href="blog.html"><svg><use href="#i-left"/></svg> All posts</a>
        <h1>{html.escape(p["title"])}</h1>
        <div class="post-meta"><span>{p["date_label"]}</span><span>{p["minutes"]} min read</span><span>By {html.escape(p["author"])}</span></div>
      </div>
    </section>
    <div class="post-cover"><img src="{p["image"]}" alt="{html.escape(p["image_alt"])}"></div>

    <section class="section">
      <div class="container">
        <article class="prose">
{p["html"]}
        </article>
        <div class="cta-band post-cta">
          <div>
            <h2>Need a ride?</h2>
            <p>Book online in minutes, or call or text 980-358-4346 — we're available 24/7.</p>
          </div>
          <div class="cta-actions">
            <a class="btn btn-gold" href="contact.html#quote">Book or Get a Quote</a>
            <a class="btn btn-outline" href="tel:+19803584346"><svg><use href="#i-phone"/></svg> Call Now</a>
          </div>
        </div>
      </div>
    </section>
{more_html}'''
        page = set_meta(head, f'{p["title"]} | Citybound Limo Blog', p["excerpt"], p["image"])
        page = page.replace("</head>", ld + "</head>", 1)
        full = page + '  <main id="main">\n' + post_main + "  </main>" + tail
        # links inside post pages are written relative to the site root, then shifted into blog/
        full = to_subdir(full)
        # "more posts" cards live in the same folder
        for q in more:
            full = full.replace(f'href="../{q["slug"]}.html"', f'href="{q["slug"]}.html"')
        (OUT_DIR / f'{p["slug"]}.html').write_text(full, encoding="utf-8")
        print(f"  wrote         blog/{p['slug']}.html")


if __name__ == "__main__":
    build()
    print("Done.")
