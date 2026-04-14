"""
Creative service: orchestrates AI text, image gen, and composition.
"""

import uuid
import logging
from datetime import datetime
from typing import Optional

from app.core.database import get_supabase_admin
from app.models.schemas import CreativeGenerateRequest, CreativeOut, GeneratedImage, CreativeStatus
from app.services.ai_service import (
    generate_creative_text,
    build_image_prompt,
    generate_image_replicate,
    generate_placeholder_image_url,
)
from app.services.image_composer import compose_creative
from app.utils.festivals_data import get_festival_by_id

logger = logging.getLogger(__name__)


async def generate_creative(
    request: CreativeGenerateRequest,
    user_id: str,
) -> CreativeOut:
    db = get_supabase_admin()

    # 1. Fetch brand
    brand_resp = db.table("brands").select("*").eq("id", request.brand_id).single().execute()
    if not brand_resp.data:
        raise ValueError(f"Brand {request.brand_id} not found")
    brand = brand_resp.data

    # 2. Fetch festival if provided
    festival = None
    cultural_elements = {}
    festival_name = None
    if request.festival_id:
        festival = get_festival_by_id(request.festival_id)
        if festival:
            festival_name = festival["name"]
            cultural_elements = {
                "themes": festival.get("themes", []),
                "symbols": festival.get("symbols", []),
                "greetings": festival.get("greetings", {}),
                "colors": festival.get("colors", []),
            }

    # 3. Generate multilingual text
    logger.info(f"Generating text for brand={brand['name']}, festival={festival_name}")
    texts = generate_creative_text(
        brand_name=brand["name"],
        brand_guidelines=brand.get("guidelines"),
        festival_name=festival_name,
        occasion_type=request.occasion_type,
        tone=request.tone,
        languages=request.languages,
        custom_message=request.custom_message,
        include_offer=request.include_offer,
        cultural_elements=cultural_elements,
    )

    # 4. Build image prompt
    brand_colors = brand.get("colors") or []
    prompt, negative = build_image_prompt(
        brand_name=brand["name"],
        festival_name=festival_name,
        occasion_type=request.occasion_type,
        design_style=brand.get("design_style", "modern"),
        brand_colors=brand_colors,
        cultural_elements=cultural_elements,
        custom_message=request.custom_message,
    )

    # 5. Generate images per platform
    images = []
    for platform in request.platforms:
        platform_str = platform.value if hasattr(platform, "value") else platform

        # Try Replicate first, fall back to placeholder
        bg_url = await generate_image_replicate(prompt, negative)
        if not bg_url:
            bg_url = generate_placeholder_image_url(platform_str, festival_name or "general", brand["name"])

        # Compose final image with text/logo overlay
        main_text = texts.get("en") or list(texts.values())[0] if texts else brand["name"]
        try:
            composed_bytes = await compose_creative(
                platform=platform_str,
                background_url=bg_url,
                brand_text=brand["name"],
                brand_name=brand["name"],
                logo_url=brand.get("logo_url"),
                brand_colors=brand_colors,
                overlay_text=main_text[:100],
            )
            # Upload to Supabase Storage
            file_name = f"{uuid.uuid4()}.png"
            storage_path = f"creatives/{request.brand_id}/{file_name}"
            db.storage.from_("creatives").upload(
                path=storage_path,
                file=composed_bytes,
                file_options={"content-type": "image/png"},
            )
            public_url = db.storage.from_("creatives").get_public_url(storage_path)
            final_url = public_url
        except Exception as e:
            logger.warning(f"Composition failed, using raw bg: {e}")
            final_url = bg_url

        size_map = {
            "instagram-post": (1080, 1080),
            "instagram-story": (1080, 1920),
            "facebook-post": (1200, 630),
            "linkedin-post": (1200, 627),
            "whatsapp-business": (1080, 1080),
            "twitter-post": (1200, 675),
        }
        w, h = size_map.get(platform_str, (1080, 1080))
        images.append(GeneratedImage(platform=platform_str, width=w, height=h, url=final_url))

    # 6. Save to DB
    creative_id = str(uuid.uuid4())
    record = {
        "id": creative_id,
        "brand_id": request.brand_id,
        "created_by": user_id,
        "festival_id": request.festival_id,
        "occasion_type": request.occasion_type,
        "platforms": [p.value if hasattr(p, "value") else p for p in request.platforms],
        "texts": texts,
        "images": [img.model_dump() for img in images],
        "ai_prompt_used": prompt,
        "status": CreativeStatus.DRAFT.value,
        "generated_at": datetime.utcnow().isoformat(),
        "views": 0,
        "downloads": 0,
    }
    db.table("creatives").insert(record).execute()

    return CreativeOut(
        id=creative_id,
        brand_id=request.brand_id,
        festival_id=request.festival_id,
        occasion_type=request.occasion_type,
        platforms=[p.value if hasattr(p, "value") else p for p in request.platforms],
        texts=texts,
        images=images,
        ai_prompt_used=prompt,
        status=CreativeStatus.DRAFT,
        generated_at=datetime.utcnow(),
    )


async def list_creatives(brand_id: str, limit: int = 20, offset: int = 0) -> list[CreativeOut]:
    db = get_supabase_admin()
    resp = (
        db.table("creatives")
        .select("*")
        .eq("brand_id", brand_id)
        .order("generated_at", desc=True)
        .range(offset, offset + limit - 1)
        .execute()
    )
    results = []
    for row in resp.data or []:
        images = [GeneratedImage(**img) for img in (row.get("images") or [])]
        results.append(
            CreativeOut(
                id=row["id"],
                brand_id=row["brand_id"],
                festival_id=row.get("festival_id"),
                occasion_type=row["occasion_type"],
                platforms=row.get("platforms", []),
                texts=row.get("texts", {}),
                images=images,
                ai_prompt_used=row.get("ai_prompt_used"),
                status=row.get("status", "draft"),
                generated_at=row["generated_at"],
                views=row.get("views", 0),
                downloads=row.get("downloads", 0),
            )
        )
    return results