"""
AI service: Claude for multilingual text, Replicate for image generation.
Falls back gracefully if Replicate key is absent.
"""

import anthropic
import httpx
from typing import Optional
from app.core.config import settings

_claude_client: Optional[anthropic.Anthropic] = None


def get_claude() -> anthropic.Anthropic:
    global _claude_client
    if _claude_client is None:
        _claude_client = anthropic.Anthropic(api_key=settings.anthropic_api_key)
    return _claude_client


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

Only return the JSON. No other text."""

    client = get_claude()
    message = client.messages.create(
        model="claude-3-5-haiku-20241022",
        max_tokens=800,
        messages=[{"role": "user", "content": prompt}],
        system=SYSTEM_PROMPT,
    )

    import json
    text = message.content[0].text.strip()
    # Handle if Claude wraps in ```json
    if text.startswith("```"):
        text = text.split("```")[1]
        if text.startswith("json"):
            text = text[4:]
    return json.loads(text.strip())


def build_image_prompt(
    brand_name: str,
    festival_name: Optional[str],
    occasion_type: str,
    design_style: str,
    brand_colors: list[dict],
    cultural_elements: dict,
    custom_message: Optional[str],
) -> str:
    """Build a detailed Stable Diffusion prompt for Indian social media creatives."""
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


async def generate_image_replicate(
    prompt: str,
    negative_prompt: str,
    width: int = 1080,
    height: int = 1080,
) -> Optional[str]:
    """
    Generate image via Replicate API.
    Returns image URL or None if unavailable.
    """
    if not settings.replicate_api_token:
        return None

    try:
        async with httpx.AsyncClient(timeout=120.0) as client:
            # Start prediction
            resp = await client.post(
                "https://api.replicate.com/v1/models/stability-ai/stable-diffusion-3/predictions",
                headers={
                    "Authorization": f"Bearer {settings.replicate_api_token}",
                    "Content-Type": "application/json",
                },
                json={
                    "input": {
                        "prompt": prompt,
                        "negative_prompt": negative_prompt,
                        "width": min(width, 1024),
                        "height": min(height, 1024),
                        "num_inference_steps": 28,
                        "guidance_scale": 7.5,
                    }
                },
            )
            resp.raise_for_status()
            prediction = resp.json()
            prediction_id = prediction["id"]

            # Poll for result (max 60s)
            for _ in range(30):
                import asyncio
                await asyncio.sleep(2)
                poll = await client.get(
                    f"https://api.replicate.com/v1/predictions/{prediction_id}",
                    headers={"Authorization": f"Bearer {settings.replicate_api_token}"},
                )
                data = poll.json()
                if data["status"] == "succeeded":
                    return data["output"][0]
                elif data["status"] == "failed":
                    return None

    except Exception as e:
        import logging
        logging.getLogger(__name__).error(f"Replicate error: {e}")
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
    # Seed based on name for consistency
    seed = abs(hash(f"{brand_name}{festival_name}{platform}")) % 1000
    return f"https://picsum.photos/seed/{seed}/{size}"