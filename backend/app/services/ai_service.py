"""
AI service: Groq (free) for multilingual text, Pollinations.ai (free) for image generation.
All services used are completely FREE — no credit card needed anywhere.

Groq free tier: 30 RPM, 14,400 requests/day, models like llama-3.3-70b-versatile.
Pollinations.ai: unlimited free image generation, no API key.
"""

import httpx
import json
import logging
from typing import Optional
from urllib.parse import quote
from app.core.config import settings

logger = logging.getLogger(__name__)


SYSTEM_PROMPT = """You are a creative social media copywriter specialising in Indian brands and cultural occasions.
You write engaging, culturally sensitive content that resonates with Indian audiences.
You understand Indian festivals, traditions, and regional nuances.
Always respond in the exact JSON format requested. No markdown, no extra text."""


def generate_creative_text(
    brand_name: str,
    brand_guidelines: Optional[str],
    festival_name: Optional[str],
    occasion_type: str,
    tone: str,
    languages: list[str],
    custom_message: Optional[str],
    include_offer: Optional[str],
    cultural_elements: dict,
) -> dict[str, str]:
    """
    Generate multilingual social media text using Groq (free tier).
    Returns a dict: { "en": "...", "hi": "...", ... }
    """
    festival_context = ""
    if festival_name:
        festival_context = f"""
Festival: {festival_name}
Cultural themes: {", ".join(cultural_elements.get("themes", []))}
Greetings available: {cultural_elements.get("greetings", {})}
"""

    offer_instruction = f"\nInclude this offer/CTA: {include_offer}" if include_offer else ""
    custom_instruction = f"\nCustom message to incorporate: {custom_message}" if custom_message else ""

    languages_str = ", ".join(languages)

    prompt = f"""Create social media post text for:
Brand: {brand_name}
Brand guidelines: {brand_guidelines or "Modern, friendly, trustworthy"}
Occasion type: {occasion_type}
Tone: {tone}
{festival_context}{offer_instruction}{custom_instruction}

Generate text in these languages: {languages_str}

Return a JSON object with language codes as keys and the post text as values.
Each text should be 2-3 sentences, emotionally resonant, and appropriate for social media.
Include relevant emojis. Do not include hashtags.

Example format:
{{"en": "Wishing you joy...", "hi": "आपको शुभकामनाएं..."}}

Only return the JSON. No other text. No markdown code fences."""

    # Use Groq API (free tier: 30 RPM, 14,400 RPD)
    if settings.groq_api_key:
        try:
            url = "https://api.groq.com/openai/v1/chat/completions"
            payload = {
                "model": "llama-3.3-70b-versatile",
                "messages": [
                    {"role": "system", "content": SYSTEM_PROMPT},
                    {"role": "user", "content": prompt},
                ],
                "temperature": 0.8,
                "max_tokens": 800,
                "response_format": {"type": "json_object"},
            }
            headers = {
                "Authorization": f"Bearer {settings.groq_api_key}",
                "Content-Type": "application/json",
            }

            with httpx.Client(timeout=30.0) as client:
                resp = client.post(url, json=payload, headers=headers)
                resp.raise_for_status()
                data = resp.json()

            text = data["choices"][0]["message"]["content"].strip()
            # Handle if model wraps response in ```json
            if text.startswith("```"):
                text = text.split("```")[1]
                if text.startswith("json"):
                    text = text[4:]
            return json.loads(text.strip())

        except Exception as e:
            logger.error(f"Groq API error: {e}")
            # Fall through to fallback

    # Fallback: generate basic text locally (no API needed)
    logger.warning("No Groq API key — using local fallback text generation")
    return _generate_fallback_text(
        brand_name, festival_name, occasion_type, tone, languages, cultural_elements
    )


def _generate_fallback_text(
    brand_name: str,
    festival_name: Optional[str],
    occasion_type: str,
    tone: str,
    languages: list[str],
    cultural_elements: dict,
) -> dict[str, str]:
    """Generate basic text without any API — total fallback."""
    texts = {}
    greetings = cultural_elements.get("greetings", {})

    for lang in languages:
        if lang in greetings:
            texts[lang] = f"{greetings[lang]} ✨ From {brand_name} with love! 🙏"
        elif festival_name:
            texts[lang] = (
                f"Happy {festival_name}! 🎉 {brand_name} wishes you joy and prosperity. ✨"
            )
        else:
            texts[lang] = (
                f"Something special from {brand_name}! ✨ Stay tuned for amazing things ahead. 🚀"
            )
    return texts


def build_image_prompt(
    brand_name: str,
    festival_name: Optional[str],
    occasion_type: str,
    design_style: str,
    brand_colors: list[dict],
    cultural_elements: dict,
    custom_message: Optional[str],
) -> tuple[str, str]:
    """Build a detailed image prompt for Pollinations.ai (free, no API key)."""
    color_desc = ""
    if brand_colors:
        hex_list = [c["hex"] for c in brand_colors[:3]]
        color_desc = f"color palette {', '.join(hex_list)}, "

    style_map = {
        "modern": "clean modern design, minimalist, bold typography",
        "traditional": "traditional Indian art style, intricate patterns, ornate borders",
        "minimal": "minimalist clean design, lots of white space, simple elegance",
        "vibrant": "vibrant colorful design, energetic, celebration mood",
    }
    style_desc = style_map.get(design_style, "modern clean design")

    festival_desc = ""
    if festival_name and cultural_elements:
        symbols = ", ".join(cultural_elements.get("symbols", [])[:3])
        themes = ", ".join(cultural_elements.get("themes", [])[:2])
        festival_desc = f"{festival_name} festival elements, {symbols}, {themes}, "

    custom_desc = f"{custom_message}, " if custom_message else ""

    prompt = (
        f"Social media creative for {brand_name}, {festival_desc}{custom_desc}"
        f"{style_desc}, {color_desc}"
        f"Indian brand marketing, professional graphic design, "
        f"high quality, social media post, 4k, sharp, "
        f"no text, no watermarks, commercial photography style"
    )

    negative = (
        "blurry, low quality, text, watermark, logo, signature, "
        "offensive content, western only style, generic stock photo"
    )

    return prompt, negative


async def generate_image_free(
    prompt: str,
    negative_prompt: str,
    width: int = 1080,
    height: int = 1080,
) -> Optional[str]:
    """
    Generate image via Pollinations.ai — 100% FREE, NO API KEY needed.
    Returns a direct image URL.
    """
    try:
        # Pollinations.ai provides free AI image generation via URL
        w = min(width, 1024)
        h = min(height, 1024)
        encoded_prompt = quote(prompt)
        image_url = (
            f"https://image.pollinations.ai/prompt/{encoded_prompt}"
            f"?width={w}&height={h}&nologo=true&seed={abs(hash(prompt)) % 10000}"
        )
        # Verify the URL is reachable (use GET with stream to validate actual image)
        async with httpx.AsyncClient(timeout=30.0, follow_redirects=True) as client:
            resp = await client.head(image_url)
            if resp.status_code < 400 and resp.headers.get("content-type", "").startswith("image/"):
                return image_url
    except Exception as e:
        logger.warning(f"Pollinations.ai error: {e}")

    return None


def generate_placeholder_image_url(
    platform: str, festival_name: str, brand_name: str
) -> str:
    """
    Fallback: return a colourful placeholder image URL.
    Uses picsum.photos (free, reliable).
    """
    sizes = {
        "instagram-post": "1080/1080",
        "instagram-story": "1080/1920",
        "facebook-post": "1200/630",
        "linkedin-post": "1200/627",
        "whatsapp-business": "1080/1080",
        "twitter-post": "1200/675",
    }
    size = sizes.get(platform, "1080/1080")
    seed = abs(hash(f"{brand_name}{festival_name}{platform}")) % 1000
    return f"https://picsum.photos/seed/{seed}/{size}"