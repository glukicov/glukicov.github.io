#!/usr/bin/env python3
"""Number the figures and references in index.html (v07 · Muon).

The page is set like a paper: every external link in <main> gets a
superscript reference marker, and the References section lists them in order
of first citation. Every <figure id="fig-..."> gets "Fig. N" in its caption,
and <a class="figref" href="#fig-..."> cross-references resolve to that
number. Run this after editing content; the output is static HTML, so the
site itself needs no build step.

Usage: python3 tools/refs.py [--check]
"""

from __future__ import annotations

import re
import sys
from pathlib import Path

HERE = Path(__file__).resolve().parent.parent
PAGE = HERE / "index.html"

SUP_RE = re.compile(r'<sup class="ref">.*?</sup>', re.S)
LINK_RE = re.compile(r'<a\b([^>]*)href="([^"]+)"([^>]*)>(.*?)</a>', re.S)
FIG_RE = re.compile(r'<figure\b[^>]*\bid="(fig-[^"]+)"[^>]*>.*?</figure>', re.S)
CAP_RE = re.compile(r"(<figcaption[^>]*>)(\s*)(?:<span class=\"fig-label\">.*?</span> — )?", re.S)
FIGREF_RE = re.compile(r'(<a class="figref" href="#(fig-[^"]+)">)(.*?)(</a>)', re.S)
TAG_RE = re.compile(r"<(?!/?(?:cite|i|sub|sup)\b)[^>]+>")


def citable(href: str) -> bool:
    return href.startswith(("http://", "https://")) or href.startswith("files/")


def display_url(href: str) -> str:
    u = re.sub(r"^https?://(www\.)?", "", href)
    u = u.rstrip("/")
    if href.startswith("files/"):
        u = "glukicov.github.io/" + href
    return u if len(u) <= 72 else u[:70] + "…"


def clean_text(inner: str) -> str:
    text = TAG_RE.sub("", inner)
    return re.sub(r"\s+", " ", text).strip()


def main() -> int:
    src = PAGE.read_text(encoding="utf-8")
    original = src
    head, rest = src.split("<main", 1)
    main_open, body = rest.split(">", 1)
    body, tail = body.split("</main>", 1)

    # Reset previous output.
    body = SUP_RE.sub("", body)
    body = re.sub(r"<!-- refs:start -->.*?<!-- refs:end -->", "<!-- refs:start -->\n<!-- refs:end -->", body, flags=re.S)

    # Figures.
    fig_num: dict[str, int] = {}
    def number_figure(m: re.Match[str]) -> str:
        fid = m.group(1)
        fig_num[fid] = len(fig_num) + 1
        label = f'<span class="fig-label">Fig. {fig_num[fid]}</span> — '
        return CAP_RE.sub(lambda c: c.group(1) + label, m.group(0), count=1)
    body = FIG_RE.sub(number_figure, body)
    body = FIGREF_RE.sub(lambda m: f"{m.group(1)}Fig. {fig_num[m.group(2)]}{m.group(4)}", body)

    # References.
    refs: list[dict] = []
    index: dict[str, int] = {}
    def cite(m: re.Match[str]) -> str:
        pre, href, post, inner = m.groups()
        if not citable(href):
            return m.group(0)
        attrs = pre + post
        title = re.search(r'data-ref="([^"]*)"', attrs)
        if href not in index:
            index[href] = len(refs) + 1
            refs.append({"href": href, "title": title.group(1) if title else clean_text(inner)})
        elif title and not refs[index[href] - 1].get("titled"):
            refs[index[href] - 1]["title"] = title.group(1)
        if title:
            refs[index[href] - 1]["titled"] = True
        n = index[href]
        if "<img" in inner:  # image links are cited by the text link beside them
            return m.group(0)
        return f'{m.group(0)}<sup class="ref"><a href="#ref-{n}" aria-label="Reference {n}">{n}</a></sup>'
    body = LINK_RE.sub(cite, body)

    items = []
    for i, r in enumerate(refs, 1):
        href = r["href"]
        target = ' target="_blank" rel="noopener"'
        items.append(
            f'                    <li id="ref-{i}"><a href="{href}"{target}>{r["title"]}</a>'
            f'<span class="ref-url">{display_url(href)}</span></li>'
        )
    ol = '<ol class="refs">\n' + "\n".join(items) + "\n                    </ol>"
    body = body.replace("<!-- refs:start -->\n<!-- refs:end -->", "<!-- refs:start -->\n                    " + ol + "\n                    <!-- refs:end -->")

    out = head + "<main" + main_open + ">" + body + "</main>" + tail
    if "--check" in sys.argv:
        ok = out == original
        print("up to date" if ok else "STALE: run tools/refs.py")
        return 0 if ok else 1
    PAGE.write_text(out, encoding="utf-8")
    print(f"{len(fig_num)} figures, {len(refs)} references")
    return 0


if __name__ == "__main__":
    sys.exit(main())
