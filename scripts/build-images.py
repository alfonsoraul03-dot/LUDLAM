#!/usr/bin/env python3
"""
Builds the responsive images the site loads.

Source photos live in assets/photos/ (full size, as downloaded from the
property's media library). This writes WebP copies at three widths to
assets/img/<width>/<name>.webp. Run it again whenever you add or replace
a photo:

    python3 scripts/build-images.py

Requires Pillow (pip install Pillow).
"""
from pathlib import Path
from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "assets" / "photos"
OUT = ROOT / "assets" / "img"
WIDTHS = (640, 1280, 1920)

def main():
    count = 0
    for src in sorted(SRC.iterdir()):
        if src.suffix.lower() not in {".jpg", ".jpeg", ".png", ".webp"}:
            continue
        im = Image.open(src)
        has_alpha = im.mode in ("RGBA", "LA") or "transparency" in im.info
        im = im.convert("RGBA" if has_alpha else "RGB")
        for w in WIDTHS:
            dest = OUT / str(w) / (src.stem + ".webp")
            dest.parent.mkdir(parents=True, exist_ok=True)
            copy = im.copy()
            if copy.width > w:
                copy = copy.resize((w, round(copy.height * w / copy.width)), Image.LANCZOS)
            copy.save(dest, "WEBP", quality=88 if has_alpha else 78, method=6)
        count += 1
    print(f"Built {count} images x {len(WIDTHS)} sizes into {OUT.relative_to(ROOT)}/")

if __name__ == "__main__":
    main()
