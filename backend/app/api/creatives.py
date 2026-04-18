from fastapi import APIRouter, Depends, HTTPException, Query
from app.models.schemas import CreativeGenerateRequest, CreativeOut
from app.core.security import get_current_user
from app.services.creative_service import generate_creative, list_creatives
from app.core.database import get_supabase_admin

router = APIRouter(prefix="/creatives", tags=["creatives"])


@router.post("/generate", response_model=CreativeOut, status_code=201)
async def create_creative(
    payload: CreativeGenerateRequest,
    current_user: dict = Depends(get_current_user),
):
    try:
        return await generate_creative(payload, current_user["user_id"])
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Creative generation failed: {str(e)}")


@router.get("", response_model=list[CreativeOut])
async def get_creatives(
    brand_id: str = Query(...),
    limit: int = Query(20, ge=1, le=100),
    offset: int = Query(0, ge=0),
    current_user: dict = Depends(get_current_user),
):
    return await list_creatives(brand_id, limit, offset)


@router.get("/{creative_id}", response_model=CreativeOut)
async def get_creative(
    creative_id: str,
    current_user: dict = Depends(get_current_user),
):
    db = get_supabase_admin()
    resp = db.table("creatives").select("*").eq("id", creative_id).single().execute()
    if not resp.data:
        raise HTTPException(status_code=404, detail="Creative not found")
    row = resp.data
    from app.models.schemas import GeneratedImage, CreativeStatus
    images = [GeneratedImage(**img) for img in (row.get("images") or [])]
    return CreativeOut(
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


@router.patch("/{creative_id}", response_model=CreativeOut)
async def update_creative(
    creative_id: str,
    updates: dict,
    current_user: dict = Depends(get_current_user),
):
    valid_keys = {"texts"}
    update_data = {k: v for k, v in updates.items() if k in valid_keys}
    if not update_data:
        raise HTTPException(status_code=400, detail="No valid fields to update")
        
    db = get_supabase_admin()
    db.table("creatives").update(update_data).eq("id", creative_id).execute()
    return await get_creative(creative_id=creative_id, current_user=current_user)


@router.patch("/{creative_id}/status")
async def update_status(
    creative_id: str,
    status: str,
    current_user: dict = Depends(get_current_user),
):
    valid = {"draft", "approved", "published"}
    if status not in valid:
        raise HTTPException(status_code=400, detail=f"Status must be one of {valid}")
    db = get_supabase_admin()
    db.table("creatives").update({"status": status}).eq("id", creative_id).execute()
    return {"id": creative_id, "status": status}


@router.post("/{creative_id}/download")
async def track_download(
    creative_id: str,
    current_user: dict = Depends(get_current_user),
):
    """Increment download counter."""
    db = get_supabase_admin()
    resp = db.table("creatives").select("downloads").eq("id", creative_id).single().execute()
    if resp.data:
        db.table("creatives").update({
            "downloads": (resp.data.get("downloads") or 0) + 1
        }).eq("id", creative_id).execute()
    return {"ok": True}


@router.delete("/{creative_id}", status_code=204)
async def delete_creative(
    creative_id: str,
    current_user: dict = Depends(get_current_user),
):
    db = get_supabase_admin()
    db.table("creatives").delete().eq("id", creative_id).execute()