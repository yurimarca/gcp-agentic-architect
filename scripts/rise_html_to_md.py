# /// script
# requires-python = ">=3.10"
# dependencies = ["beautifulsoup4", "markdownify"]
# ///
"""Convert saved Articulate Rise lesson pages (e.g. Google Cloud Skills Boost
courses saved with "Save page as...") into Markdown files.

Usage:
    uv run scripts/rise_html_to_md.py resources/agentops
    uv run scripts/rise_html_to_md.py resources/agentops --out notes/agentops
    uv run scripts/rise_html_to_md.py "resources/agentops/12-Some lesson.html"

From Python:
    from rise_html_to_md import convert_folder, convert_file, html_to_markdown
"""

from __future__ import annotations

import argparse
import re
import sys
from pathlib import Path
from urllib.parse import unquote

from bs4 import BeautifulSoup, Tag
from markdownify import markdownify

NOISE_SELECTORS = [
    "svg", "style", "script", "button", "video", "iframe", "input",
    ".visually-hidden-always", ".block-list__number", ".flashcard-side-flip",
    ".ov-control-bar", ".carousel-controls", ".block-text__copy-button",
]


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _md(node: Tag | None) -> str:
    """Rich-text fragment -> Markdown, with Rise UI chrome stripped."""
    if node is None:
        return ""
    node = BeautifulSoup(str(node), "html.parser")
    for sel in NOISE_SELECTORS:
        for el in node.select(sel):
            el.decompose()
    text = markdownify(str(node), heading_style="ATX", bullets="-", strip=["img"])
    text = text.replace("\xa0", " ")
    text = re.sub(r"^(#+ )\*\*(.+?)\*\*\s*$", r"\1\2", text, flags=re.M)  # "## **X**" -> "## X"
    text = re.sub(r"[ \t]+\n", "\n", text)
    # Blank line after headings, leaving fenced code blocks untouched
    chunks = re.split(r"(^```.*?^```)", text, flags=re.M | re.S)
    text = "".join(c if c.startswith("```") else re.sub(r"^(#+ .+)\n(?=\S)", r"\1\n\n", c, flags=re.M)
                   for c in chunks)
    return re.sub(r"\n{3,}", "\n\n", text).strip()


def _inline(node: Tag | None) -> str:
    """Rich-text fragment -> single-line Markdown (for titles/labels)."""
    text = re.sub(r"^#+\s*", "", _md(node), flags=re.M)
    return re.sub(r"\s*\n+\s*", " ", text).strip()


def _img(img: Tag | None, html_path: Path, out_dir: Path) -> str:
    if img is None or not img.get("src"):
        return ""
    src = unquote(img["src"])
    if re.search(r"divider", Path(src).stem, re.I):  # decorative separators
        return ""
    local = (html_path.parent / src).resolve()
    if local.exists():
        src = Path(_relpath(local, out_dir)).as_posix()
    alt = (img.get("alt") or "").strip() or Path(src).stem
    return f"![{alt}](<{src}>)"


def _relpath(target: Path, start: Path) -> str:
    import os
    return os.path.relpath(target, start.resolve())


def _slug(text: str) -> str:
    text = re.sub(r"[^\w\s-]", "", text.lower())
    return re.sub(r"[\s_-]+", "-", text).strip("-") or "lesson"


# ---------------------------------------------------------------------------
# Block handlers (one per Rise block type)
# ---------------------------------------------------------------------------

def _accordion(block, **_):
    parts = []
    for item in block.select(".blocks-accordion__item"):
        title = _inline(item.select_one(".blocks-accordion__title"))
        body = _md(item.select_one(".blocks-accordion__description"))
        parts.append(f"#### {title}\n\n{body}")
    return "\n\n".join(parts)


def _tabs(block, **_):
    titles = [_inline(t.select_one(".fr-view")) for t in block.select(".blocks-tabs__header-item")]
    bodies = [_md(b) for b in block.select(".blocks-tabs__content-item")]
    return "\n\n".join(f"#### {t}\n\n{b}" for t, b in zip(titles, bodies))


def _flashcards(block, **_):
    rows = []
    for card in block.select(".flashcard"):
        front = _inline(card.select_one(".flashcard-side--front .flashcard-side__description"))
        back = _md(card.select_one(".flashcard-side--back .flashcard-side__description"))
        rows.append(f"- **{front}**: {back}")
    return "\n".join(rows)


def _process(block, **_):
    parts = []
    for card in block.select(".block-process-card"):
        number = _inline(card.select_one(".block-process-card__number"))
        title = _inline(card.select_one(".block-process-card__title"))
        heading = " – ".join(x for x in (number, title) if x)
        body = _md(card.select_one(".block-process-card__description"))
        parts.append(f"#### {heading}\n\n{body}" if heading else body)
    return "\n\n".join(parts)


def _labeled_graphic(block, html_path, out_dir):
    parts = [_img(block.select_one("img"), html_path, out_dir), ""]
    for bubble in block.select(".bubble"):
        title = _inline(bubble.select_one(".bubble__title"))
        desc = _md(bubble.select_one(".bubble__description"))
        parts.append(f"- **{title}**: {desc}")
    return "\n".join(p for p in parts if p)


def _knowledge(block, **_):
    parts = []
    for card in block.select(".quiz-card"):
        question = _md(card.select_one(".quiz-card__title"))
        options = card.select(".quiz-multiple-choice-option__label, .quiz-card__option")
        opts = "\n".join(f"- [ ] {_inline(o)}" for o in options)
        parts.append(f"> **Knowledge check:** {question}\n\n{opts}")
    return "\n\n".join(parts)


def _video(block, html_path, out_dir):
    source = block.select_one("video source")
    name = Path(unquote(source["src"].split("?")[0])).stem if source else "video"
    poster = _img(block.select_one("img.ov-poster"), html_path, out_dir)
    caption = _md(block.select_one("figcaption"))
    return "\n\n".join(x for x in (f"*[Video: {name}]*", poster, caption) if x)


def _embed(block, **_):
    iframe = block.select_one("iframe")
    src = unquote(iframe["src"]) if iframe and iframe.get("src") else ""
    yt = re.fullmatch(r"([\w-]{11})\.html", Path(src).name)
    if yt:
        return f"*[Embedded video: https://www.youtube.com/watch?v={yt.group(1)}]*"
    return f"*[Embedded media: {src}]*" if src else ""


def _statement(block, **_):
    text = _md(block)
    return "\n".join(f"> {line}" if line else ">" for line in text.splitlines()) if text else ""


def _image(block, html_path, out_dir):
    img = _img(block.select_one("img"), html_path, out_dir)
    text = _md(block.select_one(".block-image__text, .block-image__caption, figcaption"))
    return "\n\n".join(x for x in (img, text) if x)


HANDLERS = {
    "blocks-accordion": _accordion,
    "blocks-tabs": _tabs,
    "block-flashcards": _flashcards,
    "block-process": _process,
    "block-labeled-graphic": _labeled_graphic,
    "block-knowledge": _knowledge,
    "block-video": _video,
    "block-embed": _embed,
    "block-statement": _statement,
    "block-image": _image,
}


# ---------------------------------------------------------------------------
# Public API
# ---------------------------------------------------------------------------

def html_to_markdown(html_path: str | Path, out_dir: str | Path | None = None) -> tuple[str, str]:
    """Return (lesson_title, markdown) for one saved Rise lesson page.

    `out_dir` is only used to compute relative image links.
    """
    html_path = Path(html_path)
    out_dir = Path(out_dir) if out_dir else html_path.parent
    soup = BeautifulSoup(html_path.read_text(encoding="utf-8"), "html.parser")

    title_el = soup.select_one(".lesson-header__title")
    title = title_el.get_text(" ", strip=True) if title_el else html_path.stem
    course = soup.title.get_text(strip=True) if soup.title else ""

    lesson = soup.select_one("section.blocks-lesson")
    if lesson is None:
        raise ValueError(f"No Rise lesson content found in {html_path}")

    parts = []
    for block in lesson.select(".block-wrapper"):
        kind = next((c for c in block.get("class", []) if c.startswith(("block-", "blocks-"))), "")
        handler = HANDLERS.get(kind)
        md = handler(block, html_path=html_path, out_dir=out_dir) if handler else _md(block)
        if md.strip():
            parts.append(md.strip())

    header = f"# {title}\n\n" + (f"*Course: {course}*\n\n" if course else "")
    return title, header + "\n\n".join(parts) + "\n"


def convert_file(html_path: str | Path, out_dir: str | Path | None = None) -> Path:
    """Convert one lesson HTML file and write `<NN>-<lesson-title>.md` into `out_dir`
    (defaults to `<html folder>/md`). Returns the written path."""
    html_path = Path(html_path)
    out_dir = Path(out_dir) if out_dir else html_path.parent / "md"
    out_dir.mkdir(parents=True, exist_ok=True)

    title, md = html_to_markdown(html_path, out_dir)
    num = re.match(r"(\d+)", html_path.name)
    prefix = f"{int(num.group(1)):02d}-" if num else ""
    out_path = out_dir / f"{prefix}{_slug(title)}.md"
    out_path.write_text(md, encoding="utf-8")
    return out_path


def convert_folder(src_dir: str | Path, out_dir: str | Path | None = None) -> list[Path]:
    """Convert every `*.html` in `src_dir` (re-running is safe: files are overwritten)."""
    src_dir = Path(src_dir)
    written = []
    for html_path in sorted(src_dir.glob("*.html"), key=_natural_key):
        try:
            written.append(convert_file(html_path, out_dir))
        except ValueError as e:
            print(f"skip: {e}", file=sys.stderr)
    return written


def _natural_key(p: Path):
    return [int(t) if t.isdigit() else t for t in re.split(r"(\d+)", p.name)]


def main(argv: list[str] | None = None) -> None:
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("paths", nargs="+", help="HTML files and/or folders containing them")
    ap.add_argument("--out", help="output folder (default: <source folder>/md)")
    args = ap.parse_args(argv)

    for p in map(Path, args.paths):
        outputs = convert_folder(p, args.out) if p.is_dir() else [convert_file(p, args.out)]
        for out in outputs:
            print(out)


if __name__ == "__main__":
    main()
