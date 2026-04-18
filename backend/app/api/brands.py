from fastapi import APIRouter, HTTPException, Depends, UploadFile, File
from app.models.schemas import BrandCreate, BrandOut
from app.core.security import get_current_user
from app.core.database import get_supabase_admin
import uuid
from datetime import datetime

router = APIRouter(prefix="/brands", tags=["brands"])


@router.post("", response_model=BrandOut, status_code=201)
async def create_brand(payload: BrandCreate, current_user: dict = Depends(get_current_user)):
    db = get_supabase_admin()
    brand_id = str(uuid.uuid4())
    now = datetime.utcnow().isoformat()

    record = {
        "id": brand_id,
        "owner_id": current_user["user_id"],
        "name": payload.name,
        "industry": payload.industry,
        "target_regions": payload.target_regions,
        "design_style": payload.design_style.value,
        "cultural_sensitivity": payload.cultural_sensitivity,
        "language_preferences": payload.language_preferences,
        "guidelines": payload.guidelines,
        "colors": [c.model_dump() for c in payload.colors],
        "logo_url": None,
        "created_at": now,
    }
    db.table("brands").insert(record).execute()

    # Associate brand with user
    db.table("users").update({"brand_id": brand_id}).eq("id", current_user["user_id"]).execute()

    return BrandOut(**record)


@router.get("", response_model=list[BrandOut])
async def list_brands(current_user: dict = Depends(get_current_user)):
    db = get_supabase_admin()
    resp = db.table("brands").select("*").eq("owner_id", current_user["user_id"]).execute()
    results = []
    for row in resp.data or []:
        results.append(BrandOut(**{**row, "created_at": row.get("created_at", datetime.utcnow())}))
    return results


@router.get("/{brand_id}", response_model=BrandOut)
async def get_brand(brand_id: str, current_user: dict = Depends(get_current_user)):
    db = get_supabase_admin()
    resp = db.table("brands").select("*").eq("id", brand_id).single().execute()
    if not resp.data:
        raise HTTPException(status_code=404, detail="Brand not found")
    return BrandOut(**{**resp.data, "created_at": resp.data.get("created_at", datetime.utcnow())})


@router.put("/{brand_id}", response_model=BrandOut)
async def update_brand(
    brand_id: str,
    payload: BrandCreate,
    current_user: dict = Depends(get_current_user),
):
    db = get_supabase_admin()
    update_data = {
        "name": payload.name,
        "industry": payload.industry,
        "target_regions": payload.target_regions,
        "design_style": payload.design_style.value,
        "cultural_sensitivity": payload.cultural_sensitivity,
        "language_preferences": payload.language_preferences,
        "guidelines": payload.guidelines,
        "colors": [c.model_dump() for c in payload.colors],
    }
    db.table("brands").update(update_data).eq("id", brand_id).execute()
    resp = db.table("brands").select("*").eq("id", brand_id).single().execute()
    return BrandOut(**{**resp.data, "created_at": resp.data.get("created_at", datetime.utcnow())})


@router.post("/{brand_id}/logo")
async def upload_logo(
    brand_id: str,
    file: UploadFile = File(...),
    current_user: dict = Depends(get_current_user),
):
    """Upload a brand logo to Supabase Storage."""
    allowed = {"image/png", "image/jpeg", "image/svg+xml", "image/webp"}
    if file.content_type not in allowed:
        raise HTTPException(status_code=400, detail="Logo must be PNG, JPG, SVG or WebP")

    db = get_supabase_admin()
    content = await file.read()
    ext = file.filename.split(".")[-1]
    path = f"logos/{brand_id}/logo.{ext}"

    db.storage.from_("brand-assets").upload(
        path=path, file=content,
        file_options={"content-type": file.content_type, "upsert": "true"},
    )
    public_url = db.storage.from_("brand-assets").get_public_url(path)
    db.table("brands").update({"logo_url": public_url}).eq("id", brand_id).execute()

    return {"logo_url": public_url}