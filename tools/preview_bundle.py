#!/usr/bin/env python3
"""Bundle a variant's index.html into one self-contained preview file.

The private preview host only admits the page's own bytes, Google Fonts and a
few script CDNs, so this script inlines every local image, stylesheet and
script as data URIs or inline blocks, inlines Font Awesome (CSS plus woff2)
when the page links it from cdnjs, strips the analytics tag, and replaces each
third-party iframe with a static poster facade that links out to the original.
Nothing here changes the real site; the branch keeps the live embeds.

Usage: preview_bundle.py <site-dir> <out.html> [--cache <dir>]
"""

from __future__ import annotations

import argparse
import base64
import hashlib
import html
import mimetypes
import re
import urllib.request
from pathlib import Path

MIME = {
    ".webp": "image/webp",
    ".svg": "image/svg+xml",
    ".woff2": "font/woff2",
    ".ico": "image/x-icon",
    ".avif": "image/avif",
}


def data_uri(path: Path) -> str:
    """Return a base64 data URI for a local file, guessing the MIME type."""
    mime = MIME.get(path.suffix.lower()) or mimetypes.guess_type(str(path))[0] or "application/octet-stream"
    return f"data:{mime};base64,{base64.b64encode(path.read_bytes()).decode()}"


def fetch(url: str, cache: Path) -> bytes:
    """Download a URL once and cache it on disk by URL hash."""
    cache.mkdir(parents=True, exist_ok=True)
    key = cache / hashlib.sha1(url.encode()).hexdigest()
    if not key.exists():
        req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0 preview-bundle"})
        key.write_bytes(urllib.request.urlopen(req, timeout=60).read())
    return key.read_bytes()


def resolve(site: Path, ref: str) -> Path | None:
    """Map a relative URL in the page to a file under the site directory, or None."""
    ref = ref.split("?")[0].split("#")[0].strip()
    if not ref or ref.startswith(("http:", "https:", "data:", "//", "mailto:")):
        return None
    candidate = (site / ref.lstrip("./")).resolve()
    if candidate.is_file() and site.resolve() in candidate.parents:
        if candidate.suffix.lower() == ".gif" and candidate.with_suffix(".webp").exists():
            candidate = candidate.with_suffix(".webp")
        return candidate
    return None


def inline_css_urls(css: str, base: Path, site: Path) -> str:
    """Replace url(...) references to local files inside a CSS block."""

    def repl(m: re.Match[str]) -> str:
        ref = m.group(2)
        target = resolve(base, ref) or resolve(site, ref)
        return f"url({m.group(1)}{data_uri(target) if target else ref}{m.group(1)})"

    return re.sub(r"url\((['\"]?)([^'\")]+)\1\)", repl, css)


def inline_font_awesome(css_text: str, cache: Path) -> str:
    """Rewrite Font Awesome's font URLs to inlined woff2 data URIs (drop the ttf sources)."""
    base = "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.2/webfonts/"

    def src(m: re.Match[str]) -> str:
        name = m.group(1)
        uri = "data:font/woff2;base64," + base64.b64encode(fetch(base + name, cache)).decode()
        return f'src:url("{uri}") format("woff2")'

    css_text = re.sub(r"src:url\(\.\./webfonts/([^)]+\.woff2)\) format\(\"woff2\"\),url\([^)]+\) format\(\"truetype\"\)", src, css_text)
    return css_text


YT_POSTER = (
    '<a class="pv-facade" href="https://www.youtube.com/watch?v={vid}" target="_blank" rel="noopener" '
    'style="display:block;position:relative;width:100%;aspect-ratio:16/9;background:#000 url({poster}) center/cover;overflow:hidden">'
    '<span style="position:absolute;inset:0;display:grid;place-items:center">'
    '<span style="width:68px;height:48px;border-radius:12px;background:rgba(0,0,0,.72);display:grid;place-items:center">'
    '<svg viewBox="0 0 24 24" width="28" height="28" aria-hidden="true"><path d="M8 5v14l11-7z" fill="#fff"/></svg></span></span>'
    '<span style="position:absolute;left:0;right:0;bottom:0;padding:.35rem .6rem;font:600 .7rem/1.3 system-ui,sans-serif;'
    'letter-spacing:.04em;text-transform:uppercase;color:#ddd;background:linear-gradient(transparent,rgba(0,0,0,.75))">'
    'Preview poster · live embed on the real site</span></a>'
)

GENERIC_FACADE = (
    '<a class="pv-facade" href="{href}" target="_blank" rel="noopener" '
    'style="display:flex;flex-direction:column;justify-content:center;gap:.5rem;width:100%;min-height:{h}px;padding:1.5rem;'
    'box-sizing:border-box;background:{bg};color:{fg};text-decoration:none;font-family:system-ui,sans-serif">'
    '<span style="font-size:.7rem;letter-spacing:.08em;text-transform:uppercase;opacity:.7">{kind}</span>'
    '<span style="font-size:1.1rem;font-weight:600;line-height:1.3">{title}</span>'
    '<span style="font-size:.8rem;opacity:.7">Preview placeholder · the real site embeds this live. Click to open.</span></a>'
)


def facade(tag: str, cache: Path) -> str:
    """Turn one <iframe ...></iframe> into a static, clickable facade."""
    src = re.search(r'src="([^"]+)"', tag)
    if not src:
        return ""
    url = html.unescape(src.group(1))
    yt = re.search(r"youtube(?:-nocookie)?\.com/embed/([A-Za-z0-9_-]{6,})", url)
    if yt:
        vid = yt.group(1)
        poster = "data:image/jpeg;base64," + base64.b64encode(fetch(f"https://i.ytimg.com/vi/{vid}/hqdefault.jpg", cache)).decode()
        return YT_POSTER.format(vid=vid, poster=poster)
    height = re.search(r'height="(\d+)"', tag)
    h = height.group(1) if height else "320"
    if "spotify.com" in url:
        return GENERIC_FACADE.format(href=url.replace("/embed/", "/"), h=h, bg="#1a1a1a", fg="#fff", kind="Spotify episode", title="Electric Twin & MLOps Community London")
    if "linkedin.com" in url:
        return GENERIC_FACADE.format(href="https://www.linkedin.com/in/glukicov", h=h, bg="#0f1a26", fg="#e8eef4", kind="LinkedIn post", title="AAIF Community London · embedded post")
    return GENERIC_FACADE.format(href=url, h=h, bg="#1a1a1a", fg="#fff", kind="Embedded frame", title=url)


def bundle(site: Path, cache: Path) -> str:
    """Produce the single-file preview HTML for the site directory."""
    src = (site / "index.html").read_text(encoding="utf-8")

    src = re.sub(r"<!--.*?-->", "", src, flags=re.S)
    src = re.sub(r"<style\b[^>]*>(.*?)</style>", lambda m: m.group(0).replace(m.group(1), re.sub(r"/\*.*?\*/", "", m.group(1), flags=re.S)), src, flags=re.S)
    src = re.sub(r"<script[^>]*googletagmanager[^>]*></script>\s*<script>.*?gtag\(\"config\"[^<]*</script>", "", src, flags=re.S)

    def link_repl(m: re.Match[str]) -> str:
        tag = m.group(0)
        href = re.search(r'href="([^"]+)"', tag)
        if not href:
            return tag
        ref = html.unescape(href.group(1))
        if "font-awesome" in ref and "cdnjs.cloudflare.com" in ref:
            css_text = fetch(ref, cache).decode()
            return f"<style>{inline_font_awesome(css_text, cache)}</style>"
        if 'rel="stylesheet"' in tag or "stylesheet" in tag:
            target = resolve(site, ref)
            if target:
                return f"<style>{inline_css_urls(target.read_text(encoding='utf-8'), target.parent, site)}</style>"
        if "icon" in tag or "preload" in tag:
            target = resolve(site, ref)
            if target:
                return tag.replace(href.group(1), data_uri(target))
        return tag

    src = re.sub(r"<link\b[^>]*>", link_repl, src)

    def script_repl(m: re.Match[str]) -> str:
        tag = m.group(0)
        s = re.search(r'src="([^"]+)"', tag)
        target = resolve(site, html.unescape(s.group(1))) if s else None
        if target:
            attrs = re.sub(r'\ssrc="[^"]+"', "", tag[: tag.index(">") + 1])
            return f"{attrs}{target.read_text(encoding='utf-8')}</script>"
        return tag

    src = re.sub(r"<script\b[^>]*\bsrc=\"[^\"]+\"[^>]*>\s*</script>", script_repl, src)
    src = re.sub(r"<style\b[^>]*>(.*?)</style>", lambda m: m.group(0).replace(m.group(1), inline_css_urls(m.group(1), site, site)), src, flags=re.S)
    src = re.sub(r'style="([^"]*url\([^"]*)"', lambda m: 'style="' + inline_css_urls(m.group(1), site, site) + '"', src)

    def picture_repl(m: re.Match[str]) -> str:
        block = m.group(0)
        webp = re.search(r'<source[^>]*srcset="([^"]+\.webp)"[^>]*>', block)
        img = re.search(r"<img\b[^>]*>", block)
        if webp and img:
            target = resolve(site, webp.group(1))
            if target:
                new_img = re.sub(r'src="[^"]+"', f'src="{data_uri(target)}"', img.group(0))
                return new_img
        return block

    src = re.sub(r"<picture\b[^>]*>.*?</picture>", picture_repl, src, flags=re.S)

    def attr_repl(m: re.Match[str]) -> str:
        target = resolve(site, html.unescape(m.group(2)))
        return f'{m.group(1)}="{data_uri(target) if target else m.group(2)}"'

    src = re.sub(r'\b(src|poster|href)="((?:\./)?(?:images|assets|img|media)/[^"]+)"', attr_repl, src)

    def srcset_repl(m: re.Match[str]) -> str:
        parts = []
        for item in m.group(1).split(","):
            bits = item.strip().split()
            if not bits:
                continue
            target = resolve(site, bits[0])
            bits[0] = data_uri(target) if target else bits[0]
            parts.append(" ".join(bits))
        return f'srcset="{", ".join(parts)}"'

    src = re.sub(r'srcset="([^"]+)"', srcset_repl, src)
    src = re.sub(r"<iframe\b[^>]*>\s*</iframe>", lambda m: facade(m.group(0), cache), src, flags=re.S)
    src = re.sub(r'href="((?:\./)?files/[^"]+)"', lambda m: f'href="https://glukicov.github.io/{m.group(1).lstrip("./")}"', src)
    src = re.sub(r"^\s*<!doctype html>\s*", "", src, flags=re.I)
    return src


def main() -> None:
    """CLI entry point."""
    ap = argparse.ArgumentParser(description=__doc__)
    ap.add_argument("site", type=Path)
    ap.add_argument("out", type=Path)
    ap.add_argument("--cache", type=Path, default=Path.home() / ".cache" / "preview-bundle")
    a = ap.parse_args()
    out = bundle(a.site, a.cache)
    a.out.write_text(out, encoding="utf-8")
    print(f"{a.out}: {len(out.encode()) / 1024:.0f} KB")


if __name__ == "__main__":
    main()
