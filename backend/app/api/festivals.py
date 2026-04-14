from fastapi import APIRouter, Query
from app.utils.festivals_data import FESTIVALS, get_upcoming_festivals, get_festival_by_id
from app.models.schemas import FestivalOut
from datetime import date

router = APIRouter(prefix="/festivals", tags=["festivals"])


@router.get("", response_model=list[FestivalOut])
async def list_festivals(
    upcoming_only: bool = Query(False),
    days_ahead: int = Query(30),
    region: str = Query(None),
):
    festivals = get_upcoming_festivals(days_ahead) if upcoming_only else FESTIVALS

    if region:
        festivals = [
            f for f in festivals
            if "all" in f.get("regions", []) or region in f.get("regions", [])
        ]

    return [
        FestivalOut(
            id=f["id"],
            name=f["name"],
            name_translations=f.get("name_translations", {}),
            festival_type=f["festival_type"],
            regions=f.get("regions", []),
            start_date=f["start_date"],
            end_date=f["end_date"],
            colors=f.get("colors", []),
            symbols=f.get("symbols", []),
            themes=f.get("themes", []),
            greetings=f.get("greetings", {}),
            marketing_relevance=f.get("marketing_relevance", "medium"),
            days_until=f.get("days_until"),
        )
        for f in festivals
    ]


@router.get("/upcoming", response_model=list[FestivalOut])
async def get_upcoming(days: int = Query(30, ge=1, le=365)):
    festivals = get_upcoming_festivals(days)
    return [
        FestivalOut(
            id=f["id"],
            name=f["name"],
            name_translations=f.get("name_translations", {}),
            festival_type=f["festival_type"],
            regions=f.get("regions", []),
            start_date=f["start_date"],
            end_date=f["end_date"],
            colors=f.get("colors", []),
            symbols=f.get("symbols", []),
            themes=f.get("themes", []),
            greetings=f.get("greetings", {}),
            marketing_relevance=f.get("marketing_relevance", "medium"),
            days_until=f.get("days_until"),
        )
        for f in festivals
    ]


@router.get("/{festival_id}", response_model=FestivalOut)
async def get_festival(festival_id: str):
    f = get_festival_by_id(festival_id)
    if not f:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="Festival not found")

    today = date.today()
    try:
        start = date.fromisoformat(f["start_date"])
        days_until = (start - today).days
    except Exception:
        days_until = None

    return FestivalOut(
        id=f["id"],
        name=f["name"],
        name_translations=f.get("name_translations", {}),
        festival_type=f["festival_type"],
        regions=f.get("regions", []),
        start_date=f["start_date"],
        end_date=f["end_date"],
        colors=f.get("colors", []),
        symbols=f.get("symbols", []),
        themes=f.get("themes", []),
        greetings=f.get("greetings", {}),
        marketing_relevance=f.get("marketing_relevance", "medium"),
        days_until=days_until,
    )