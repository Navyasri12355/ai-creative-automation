"""
Image composition service using Pillow.
Overlays brand logo + text onto generated backgrounds.
"""

from PIL import Image, ImageDraw, ImageFont
from io import BytesIO
import httpx
import os
import logging
from typing import Optional

logger = logging.getLogger(__name__)

PLATFORM_SIZES = {
    "instagram-post":    (1080, 1080),
    "instagram-story":   (1080, 1920),
    "facebook-post":     (1200, 630),
    "linkedin-post":     (1200, 627),
    "whatsapp-business": (1080, 1080),
    "twitter-post":      (1200, 675),
}


async def compose_creative(
    platform: str,
    background_url: Optional[str],
    brand_text: str,
    brand_name: str,
    logo_url: Optional[str],
    brand_colors: list[dict],
    overlay_text: Optional[str] = None,
) -> bytes:
    """
    Compose a final creative image:
    1. Fetch or create background
    2. Apply colour overlay
    3. Add brand name text
    4. Add overlay text (greeting/offer)
    5. Add logo if available
    Returns PNG bytes.
    """
    width, height = PLATFORM_SIZES.get(platform, (1080, 1080))

    # 1. Background
    if background_url:
        try:
            async with httpx.AsyncClient(timeout=60.0, follow_redirects=True) as client:
                resp = await client.get(background_url)
                resp.raise_for_status()
                content_type = resp.headers.get("content-type", "")
                if not content_type.startswith("image/"):
                    raise ValueError(f"Expected image, got {content_type}")
                img = Image.open(BytesIO(resp.content)).convert("RGBA")
                img = img.resize((width, height), Image.LANCZOS)
        except Exception as e:
            logger.warning(f"Failed to fetch background: {e}")
            img = _gradient_background(width, height, brand_colors)
    else:
        img = _gradient_background(width, height, brand_colors)

    draw = ImageDraw.Draw(img)

    # 2. Semi-transparent overlay for text readability
    overlay = Image.new("RGBA", (width, height), (0, 0, 0, 0))
    ov_draw = ImageDraw.Draw(overlay)
    ov_draw.rectangle(
        [(0, int(height * 0.55)), (width, height)],
        fill=(0, 0, 0, 160),
    )
    img = Image.alpha_composite(img, overlay)
    draw = ImageDraw.Draw(img)

    # 3. Brand name (top area)
    _draw_text_centered(
        draw,
        brand_name.upper(),
        y_center=int(height * 0.12),
        width=width,
        font_size=int(width * 0.065),
        color=(255, 255, 255, 230),
    )

    # 4. Main overlay text
    if overlay_text:
        lines = _wrap_text(overlay_text, max_chars=35)
        y_start = int(height * 0.58)
        for i, line in enumerate(lines[:5]):
            _draw_text_centered(
                draw,
                line,
                y_center=y_start + i * int(width * 0.07),
                width=width,
                font_size=int(width * 0.055),
                color=(255, 255, 255, 255),
            )

    # 5. Logo (top-right corner)
    if logo_url:
        try:
            async with httpx.AsyncClient(timeout=15.0) as client:
                resp = await client.get(logo_url)
                logo = Image.open(BytesIO(resp.content)).convert("RGBA")
                logo_size = int(width * 0.15)
                logo = logo.resize((logo_size, logo_size), Image.LANCZOS)
                margin = int(width * 0.04)
                img.paste(logo, (width - logo_size - margin, margin), logo)
        except Exception as e:
            logger.warning(f"Failed to overlay logo: {e}")

    # Convert to RGB for PNG output
    final = img.convert("RGB")
    buf = BytesIO()
    final.save(buf, format="PNG", optimize=True)
    return buf.getvalue()


def _gradient_background(width: int, height: int, brand_colors: list[dict]) -> Image.Image:
    """Create a simple gradient background from brand colours."""
    img = Image.new("RGBA", (width, height))
    draw = ImageDraw.Draw(img)

    colors = [_hex_to_rgb(c["hex"]) for c in brand_colors if c.get("hex")]
    if not colors:
        colors = [(26, 35, 126), (74, 20, 140)]  # default deep blue/purple

    top_color = colors[0]
    bottom_color = colors[1] if len(colors) > 1 else tuple(max(0, c - 60) for c in top_color)

    for y in range(height):
        ratio = y / height
        r = int(top_color[0] + (bottom_color[0] - top_color[0]) * ratio)
        g = int(top_color[1] + (bottom_color[1] - top_color[1]) * ratio)
        b = int(top_color[2] + (bottom_color[2] - top_color[2]) * ratio)
        draw.line([(0, y), (width, y)], fill=(r, g, b, 255))

    return img


def _hex_to_rgb(hex_color: str) -> tuple:
    hex_color = hex_color.lstrip("#")
    return tuple(int(hex_color[i:i+2], 16) for i in (0, 2, 4))


def _draw_text_centered(draw, text, y_center, width, font_size, color):
    """Draw text horizontally centred at given y position."""
    try:
        # Try to use a bundled font; fall back to arial.ttf
        font_path = os.path.join(os.path.dirname(__file__), "..", "utils", "DejaVuSans-Bold.ttf")
        if os.path.exists(font_path):
            font = ImageFont.truetype(font_path, font_size)
        else:
            # On Windows, arial.ttf is almost always available
            font = ImageFont.truetype("arial.ttf", font_size)
    except Exception:
        font = ImageFont.load_default()

    bbox = draw.textbbox((0, 0), text, font=font)
    text_width = bbox[2] - bbox[0]
    x = (width - text_width) // 2
    # Shadow
    draw.text((x + 2, y_center + 2), text, font=font, fill=(0, 0, 0, 120))
    draw.text((x, y_center), text, font=font, fill=color)


def _wrap_text(text: str, max_chars: int = 30) -> list[str]:
    words = text.split()
    lines = []
    current = ""
    for word in words:
        if len(current) + len(word) + 1 <= max_chars:
            current = f"{current} {word}".strip()
        else:
            if current:
                lines.append(current)
            current = word
    if current:
        lines.append(current)
    return lines