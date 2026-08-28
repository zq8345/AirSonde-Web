from __future__ import annotations

import math
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw


ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "design" / "airsonde-circular-a-study-v6.png"
OUTPUT = ROOT / "design" / "airsonde-circular-a-refined-v11.png"
BRAND_RGB = (12, 122, 107)  # #0C7A6B
SCALE = 4


def foreground_alpha(image: Image.Image) -> Image.Image:
    """Recover antialiased artwork coverage from the white-background preview."""
    rgb = np.asarray(image.convert("RGB"), dtype=np.int16)
    distance_from_white = np.max(255 - rgb, axis=2).astype(np.float32)
    alpha = np.clip(distance_from_white * (255.0 / 243.0), 0, 255).astype(np.uint8)
    alpha[alpha < 3] = 0
    return Image.fromarray(alpha, mode="L")


def scaled_polygon(points: list[tuple[float, float]]) -> list[tuple[int, int]]:
    return [(round(x * SCALE), round(y * SCALE)) for x, y in points]


def build_preview() -> None:
    source = Image.open(SOURCE).convert("RGB")
    width, height = source.size
    alpha = foreground_alpha(source)

    # Preserve each approved r-s-o-n-d-e glyph, then place every visible glyph
    # boundary on an exact 25 px spacing system. The a and i are rebuilt below.
    keep = Image.new("L", (width * SCALE, height * SCALE), 0)
    glyph_sources = {
        "r": (465, 607),
        "s": (626, 837),
        "o": (857, 1075),
        "n": (1100, 1312),
        "d": (1341, 1560),
        "e": (1587, 1792),
    }
    glyph_targets = {
        "r": 442,
        "s": 607,
        "o": 841,
        "n": 1081,
        "d": 1315,
        "e": 1557,
    }
    for glyph, (source_left, source_right) in glyph_sources.items():
        crop = alpha.crop((source_left, 0, source_right, height)).resize(
            ((source_right - source_left) * SCALE, height * SCALE),
            Image.Resampling.LANCZOS,
        )
        keep.paste(crop, (glyph_targets[glyph] * SCALE, 0))

    geometry = Image.new("L", keep.size, 0)
    draw = ImageDraw.Draw(geometry)

    # a: exact concentric circles. Coordinates are in the original preview system.
    cx, cy = 244.0, 438.0
    outer_radius = 101.0
    inner_radius = 61.0
    outer_box = tuple(
        round(v * SCALE)
        for v in (
            cx - outer_radius,
            cy - outer_radius,
            cx + outer_radius,
            cy + outer_radius,
        )
    )
    inner_box = tuple(
        round(v * SCALE)
        for v in (
            cx - inner_radius,
            cy - inner_radius,
            cx + inner_radius,
            cy + inner_radius,
        )
    )
    draw.ellipse(outer_box, fill=255)

    draw.ellipse(inner_box, fill=0)

    # Opening at 10:30. A rotated rectangular cut produces two parallel terminals.
    # The long axis is radial at 118 degrees; therefore the terminal edges are 28 degrees.
    theta = math.radians(118)
    radial = (math.cos(theta), -math.sin(theta))
    tangent = (-radial[1], radial[0])
    opening_center_radius = (outer_radius + inner_radius) / 2
    opening_center = (
        cx + radial[0] * opening_center_radius,
        cy + radial[1] * opening_center_radius,
    )
    half_radial = 31.0
    half_tangent = 8.0
    # Rounded opening inspired by v6. A generous radius replaces the small
    # straight chamfer, giving the four ring-to-opening transitions a soft shoulder.
    corner_radius = 9.0
    samples_per_corner = 10
    local_cut_points: list[tuple[float, float]] = []
    corner_centers = [
        (half_radial - corner_radius, -half_tangent + corner_radius, -90, 0),
        (half_radial - corner_radius, half_tangent - corner_radius, 0, 90),
        (-half_radial + corner_radius, half_tangent - corner_radius, 90, 180),
        (-half_radial + corner_radius, -half_tangent + corner_radius, 180, 270),
    ]
    for center_x, center_y, start_deg, end_deg in corner_centers:
        for index in range(samples_per_corner + 1):
            angle = math.radians(
                start_deg + (end_deg - start_deg) * index / samples_per_corner
            )
            local_cut_points.append(
                (
                    center_x + corner_radius * math.cos(angle),
                    center_y + corner_radius * math.sin(angle),
                )
            )
    cut_points: list[tuple[float, float]] = []
    for radial_offset, tangent_offset in local_cut_points:
        cut_points.append(
            (
                opening_center[0]
                + radial[0] * radial_offset
                + tangent[0] * tangent_offset,
                opening_center[1]
                + radial[1] * radial_offset
                + tangent[1] * tangent_offset,
            )
        )
    draw.polygon(scaled_polygon(cut_points), fill=0)

    # Right-hand lower foot only. Its left edge is exactly the inner circle's
    # right tangent (cx + inner_radius), so it never enters the inner circle.
    # Its right edge stays inside the outer circle's right tangent.
    foot_shift_right = 3.0
    foot_left = cx + inner_radius + foot_shift_right
    foot_right = foot_left + 37
    draw.rounded_rectangle(
        (
            foot_left * SCALE,
            cy * SCALE,
            foot_right * SCALE,
            539 * SCALE,
        ),
        radius=5 * SCALE,
        fill=255,
    )

    # i stem: rebuilt to a controlled width and the shared x-height/baseline.
    i_left = 371
    i_right = 417
    draw.rounded_rectangle(
        (i_left * SCALE, 337 * SCALE, i_right * SCALE, 539 * SCALE),
        radius=5 * SCALE,
        fill=255,
    )

    # i dot: exact circle; its top aligns exactly with the d ascender top.
    source_mask = np.asarray(alpha)
    d_region = source_mask[:, 1320:1580]
    d_y, _ = np.where(d_region > 24)
    d_top = int(d_y.min())

    dot_diameter = i_right - i_left
    dot_left = i_left
    dot_top = d_top
    draw.ellipse(
        (
            dot_left * SCALE,
            dot_top * SCALE,
            (dot_left + dot_diameter) * SCALE,
            (dot_top + dot_diameter) * SCALE,
        ),
        fill=255,
    )

    combined = Image.fromarray(
        np.maximum(np.asarray(keep), np.asarray(geometry)).astype(np.uint8), mode="L"
    )
    combined = combined.resize((width, height), Image.Resampling.LANCZOS)

    result = Image.new("RGBA", (width, height), (*BRAND_RGB, 0))
    result.putalpha(combined)
    white = Image.new("RGBA", (width, height), (255, 255, 255, 255))
    white.alpha_composite(result)
    white.convert("RGB").save(OUTPUT, quality=100)

    print(f"Wrote: {OUTPUT}")
    print(f"a outer diameter: {outer_radius * 2:.0f}px")
    print(f"a inner diameter: {inner_radius * 2:.0f}px")
    print(f"a ring thickness: {outer_radius - inner_radius:.0f}px")
    print(f"i dot top: {dot_top}px")
    print(f"d ascender top: {d_top}px")
    print(f"i dot diameter: {dot_diameter}px")
    print(f"a lower-foot left/right: {foot_left:.0f}/{foot_right:.0f}px")
    print(f"a inner-circle right tangent: {cx + inner_radius:.0f}px")
    print(f"a outer-circle right tangent: {cx + outer_radius:.0f}px")
    print(f"a lower-foot width: {foot_right - foot_left:.0f}px")
    print(f"a lower-foot right shift from inner tangent: {foot_shift_right:.0f}px")
    print(f"a opening corner radius: {corner_radius:.0f}px")
    print(f"i stem width: {i_right - i_left}px")
    print("ordinary horizontal/vertical angle: 0 degrees")
    print("a opening terminal angle: 28 degrees")

    # Report final visible bounds for an optical audit.
    final_mask = np.asarray(combined)
    letter_windows = {
        "a": (130, 355),
        "i": (355, 430),
        "r": (430, 595),
        "s": (595, 830),
        "o": (830, 1070),
        "n": (1070, 1310),
        "d": (1310, 1550),
        "e": (1550, 1780),
    }
    for letter, (x0, x1) in letter_windows.items():
        ys, xs = np.where(final_mask[:, x0:x1] > 24)
        if len(xs):
            left, right = x0 + int(xs.min()), x0 + int(xs.max()) + 1
            top, bottom = int(ys.min()), int(ys.max()) + 1
            print(
                f"{letter} bbox: x={left}:{right} y={top}:{bottom} "
                f"w={right-left} h={bottom-top}"
            )

    # Verify exact visible-boundary spacing.
    visible_bounds: list[tuple[str, int, int]] = []
    for letter, (x0, x1) in letter_windows.items():
        _, xs = np.where(final_mask[:, x0:x1] > 24)
        if len(xs):
            visible_bounds.append(
                (letter, x0 + int(xs.min()), x0 + int(xs.max()) + 1)
            )
    for (left_name, _, left_right), (right_name, right_left, _) in zip(
        visible_bounds, visible_bounds[1:]
    ):
        print(f"gap {left_name}-{right_name}: {right_left-left_right}px")


if __name__ == "__main__":
    build_preview()
