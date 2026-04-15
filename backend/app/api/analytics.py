from fastapi import APIRouter, Depends, Query
from app.core.security import get_current_user
from app.core.database import get_supabase_admin
from app.models.schemas import AnalyticsSummary

router = APIRouter(prefix="/analytics", tags=["analytics"])


@router.get("/summary", response_model=AnalyticsSummary)
async def get_summary(
    brand_id: str = Query(...),
    current_user: dict = Depends(get_current_user),
):
    db = get_supabase_admin()

    creatives_resp = db.table("creatives").select("*").eq("brand_id", brand_id).execute()
    rows = creatives_resp.data or []

    total_creatives = len(rows)
    total_downloads = sum(r.get("downloads", 0) for r in rows)
    total_views = sum(r.get("views", 0) for r in rows)

    # Top platforms
    platform_counts: dict = {}
    for row in rows:
        for p in row.get("platforms", []):
            platform_counts[p] = platform_counts.get(p, 0) + 1
    top_platforms = sorted(
        [{"platform": k, "count": v} for k, v in platform_counts.items()],
        key=lambda x: x["count"],
        reverse=True,
    )[:5]

    # Top festivals
    festival_counts: dict = {}
    for row in rows:
        fid = row.get("festival_id")
        if fid:
            festival_counts[fid] = festival_counts.get(fid, 0) + 1
    top_festivals = sorted(
        [{"festival_id": k, "count": v} for k, v in festival_counts.items()],
        key=lambda x: x["count"],
        reverse=True,
    )[:5]

    # Recent creatives
    recent = sorted(rows, key=lambda x: x.get("generated_at", ""), reverse=True)[:5]
    recent_creatives = [
        {
            "id": r["id"],
            "occasion_type": r["occasion_type"],
            "status": r.get("status", "draft"),
            "generated_at": r["generated_at"],
            "downloads": r.get("downloads", 0),
        }
        for r in recent
    ]

    return AnalyticsSummary(
        total_creatives=total_creatives,
        total_downloads=total_downloads,
        total_views=total_views,
        top_platforms=top_platforms,
        top_festivals=top_festivals,
        recent_creatives=recent_creatives,
    )