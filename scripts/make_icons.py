"""Rasterize the learn-cmd logo to PNG favicons and a header mark."""

from __future__ import annotations

from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parents[1]
ASSETS = ROOT / "assets"
ASSETS.mkdir(exist_ok=True)


def _font(size: int) -> ImageFont.FreeTypeFont:
    candidates = [
        r"C:\Windows\Fonts\consolab.ttf",
        r"C:\Windows\Fonts\consola.ttf",
        r"C:\Windows\Fonts\seguisb.ttf",
        r"C:\Windows\Fonts\arialbd.ttf",
    ]
    for path in candidates:
        if Path(path).exists():
            return ImageFont.truetype(path, size=size)
    return ImageFont.load_default()


def draw_icon(size: int) -> Image.Image:
    img = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)

    # Rounded shell — Win11 app icon
    pad = max(1, size // 16)
    box = (pad, pad, size - pad, size - pad)
    radius = max(4, int(size * 0.22))
    draw.rounded_rectangle(box, radius=radius, fill=(30, 39, 50, 255))
    # subtle top light
    draw.rounded_rectangle(
        (pad, pad, size - pad, size // 2),
        radius=radius,
        fill=(43, 58, 74, 255),
    )
    draw.rounded_rectangle(box, radius=radius, outline=(255, 255, 255, 36), width=max(1, size // 64))

    # Prompt text
    font = _font(max(10, int(size * 0.42)))
    text = "C:\\>"
    bbox = draw.textbbox((0, 0), text, font=font)
    tw, th = bbox[2] - bbox[0], bbox[3] - bbox[1]
    tx = (size - tw) // 2 - int(size * 0.04)
    ty = (size - th) // 2
    draw.text((tx, ty), text, font=font, fill=(255, 255, 255, 255))

    # Caret
    cw = max(2, size // 14)
    ch = max(6, int(size * 0.32))
    cx = tx + tw + max(2, size // 20)
    cy = (size - ch) // 2
    draw.rounded_rectangle((cx, cy, cx + cw, cy + ch), radius=max(1, cw // 3), fill=(96, 205, 255, 255))

    return img


def main() -> None:
    for name, size in [
        ("favicon-16.png", 16),
        ("favicon-32.png", 32),
        ("favicon-48.png", 48),
        ("apple-touch-icon.png", 180),
        ("logo-256.png", 256),
    ]:
        icon = draw_icon(size)
        path = ASSETS / name
        icon.save(path)
        print(f"wrote {path} ({size}x{size})")


if __name__ == "__main__":
    main()
