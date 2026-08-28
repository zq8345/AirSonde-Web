from __future__ import annotations

from pathlib import Path

import numpy as np
from PIL import Image


ROOT = Path(__file__).resolve().parents[1]
DESIGN = ROOT / "design"
SOURCE = DESIGN / "airsonde-circular-a-refined-v11.png"

BRAND_HEX = "#0C7A6B"
BRAND_RGB = (12, 122, 107)
COLORS = {
    "green": BRAND_RGB,
    "white": (255, 255, 255),
    "black": (0, 0, 0),
}


def recover_alpha(source: Image.Image) -> Image.Image:
    rgb = np.asarray(source.convert("RGB"), dtype=np.int16)
    distance = np.max(255 - rgb, axis=2).astype(np.float32)
    alpha = np.clip(distance * (255.0 / 243.0), 0, 255).astype(np.uint8)
    alpha[alpha < 3] = 0
    return Image.fromarray(alpha, mode="L")


def colored(alpha: Image.Image, rgb: tuple[int, int, int]) -> Image.Image:
    alpha_array = np.asarray(alpha, dtype=np.uint8)
    rgba = np.zeros((alpha.height, alpha.width, 4), dtype=np.uint8)
    visible = alpha_array > 0
    rgba[visible, 0] = rgb[0]
    rgba[visible, 1] = rgb[1]
    rgba[visible, 2] = rgb[2]
    rgba[:, :, 3] = alpha_array
    return Image.fromarray(rgba, mode="RGBA")


def padded_crop(alpha: Image.Image, pad_x: int, pad_y: int) -> Image.Image:
    bbox = alpha.getbbox()
    if bbox is None:
        raise RuntimeError("No visible logo pixels found")
    left, top, right, bottom = bbox
    left = max(0, left - pad_x)
    top = max(0, top - pad_y)
    right = min(alpha.width, right + pad_x)
    bottom = min(alpha.height, bottom + pad_y)
    return alpha.crop((left, top, right, bottom))


def square_icon(alpha: Image.Image, size: int, fill: tuple[int, int, int]) -> Image.Image:
    bbox = alpha.getbbox()
    if bbox is None:
        raise RuntimeError("No favicon pixels found")
    glyph = alpha.crop(bbox)
    canvas_size = 1024
    usable = 820
    scale = min(usable / glyph.width, usable / glyph.height)
    resized = glyph.resize(
        (round(glyph.width * scale), round(glyph.height * scale)),
        Image.Resampling.LANCZOS,
    )
    canvas_alpha = Image.new("L", (canvas_size, canvas_size), 0)
    canvas_alpha.paste(
        resized,
        ((canvas_size - resized.width) // 2, (canvas_size - resized.height) // 2),
    )
    icon = colored(canvas_alpha, fill)
    return icon.resize((size, size), Image.Resampling.LANCZOS)


def write_svg() -> None:
    # Exact construction values from the frozen v11 geometry, normalized to a
    # compact icon viewBox. The mask order is ring -> counter/opening -> foot.
    svg = f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256">
  <title>AirSonde</title>
  <mask id="a-mask" maskUnits="userSpaceOnUse" x="0" y="0" width="256" height="256">
    <rect width="256" height="256" fill="black"/>
    <circle cx="122" cy="128" r="101" fill="white"/>
    <circle cx="122" cy="128" r="61" fill="black"/>
    <rect x="77.5" y="39" width="62" height="16" rx="8" fill="black" transform="rotate(-118 108.5 47)"/>
    <rect x="186" y="128" width="37" height="101" rx="5" fill="white"/>
  </mask>
  <rect x="21" y="27" width="202" height="202" fill="{BRAND_HEX}" mask="url(#a-mask)"/>
</svg>
'''
    (DESIGN / "favicon.svg").write_text(svg, encoding="utf-8")


def main() -> None:
    source = Image.open(SOURCE).convert("RGB")
    full_alpha = recover_alpha(source)
    logo_alpha = padded_crop(full_alpha, pad_x=32, pad_y=32)

    for name, rgb in COLORS.items():
        path = DESIGN / f"airsonde-logo-{name}-transparent.png"
        colored(logo_alpha, rgb).save(path)

    # First letter is isolated from the known v11 glyph window.
    a_alpha = full_alpha.crop((125, 320, 355, 560))
    for size in (16, 32, 48, 180, 192, 512):
        square_icon(a_alpha, size, BRAND_RGB).save(DESIGN / f"favicon-{size}.png")

    ico_frames = [square_icon(a_alpha, size, BRAND_RGB) for size in (16, 32, 48)]
    ico_frames[-1].save(
        DESIGN / "favicon.ico",
        format="ICO",
        sizes=[(16, 16), (32, 32), (48, 48)],
        append_images=ico_frames[:-1],
    )
    write_svg()

    readme = f'''# AirSonde final logo assets

Frozen source: `airsonde-circular-a-refined-v11.png`

## Brand colours

- AirSonde green: `{BRAND_HEX}` — RGB `12, 122, 107`
- White: `#FFFFFF` — RGB `255, 255, 255`
- Black: `#000000` — RGB `0, 0, 0`

## Transparent wordmarks

- `airsonde-logo-green-transparent.png`
- `airsonde-logo-white-transparent.png`
- `airsonde-logo-black-transparent.png`

## Favicon files

- `favicon.svg` — preferred scalable website favicon
- `favicon.ico` — 16/32/48 px compatibility icon
- `favicon-16.png`, `favicon-32.png`, `favicon-48.png`
- `favicon-180.png` — Apple touch icon source
- `favicon-192.png`, `favicon-512.png` — web app icons

All PNG files use a real alpha channel. The three wordmark variants use the
same alpha mask, so their geometry is identical.
'''
    (DESIGN / "README-logo-assets.md").write_text(readme, encoding="utf-8")

    # Verification summary.
    print(f"Brand green: {BRAND_HEX} / RGB {BRAND_RGB}")
    for path in sorted(DESIGN.glob("airsonde-logo-*-transparent.png")):
        image = Image.open(path)
        alpha = image.getchannel("A")
        print(path.name, image.size, image.mode, "alpha bbox", alpha.getbbox())
    for path in sorted(DESIGN.glob("favicon-*.png")):
        image = Image.open(path)
        print(path.name, image.size, image.mode, "corner alpha", image.getpixel((0, 0))[3])
    print("favicon.svg", (DESIGN / "favicon.svg").stat().st_size, "bytes")
    print("favicon.ico", (DESIGN / "favicon.ico").stat().st_size, "bytes")


if __name__ == "__main__":
    main()
