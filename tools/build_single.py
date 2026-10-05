#!/usr/bin/env python3
"""Inline css/ and js/ into one self-contained file: dist/portfolio.html

    python3 tools/build_single.py

Useful for hosts that only accept a single HTML file.
"""
import pathlib
import re

ROOT = pathlib.Path(__file__).resolve().parent.parent


def main():
    html = (ROOT / "index.html").read_text(encoding="utf-8")

    def inline_css(match):
        return "<style>\n" + (ROOT / match.group(1)).read_text(encoding="utf-8") + "\n</style>"

    def inline_js(match):
        code = (ROOT / match.group(1)).read_text(encoding="utf-8").replace("</script", "<\\/script")
        return "<script>\n" + code + "\n</script>"

    html = re.sub(r'<link rel="stylesheet" href="([^"]+)"\s*/?>', inline_css, html)
    html = re.sub(r'<script src="([^"]+)"></script>', inline_js, html)

    out = ROOT / "dist" / "portfolio.html"
    out.parent.mkdir(exist_ok=True)
    out.write_text(html, encoding="utf-8")
    print(f"{out.relative_to(ROOT)}: {out.stat().st_size // 1024} KB")


if __name__ == "__main__":
    main()
