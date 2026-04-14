from fastapi import APIRouter, HTTPException, status, Depends
from app.models.schemas import UserRegister, UserLogin, UserOut, TokenOut
from app.core.security import hash_password, verify_password, create_access_token, get_current_user
from app.core.database import get_supabase_admin
import uuid
from datetime import datetime

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/register", response_model=TokenOut, status_code=201)
async def register(payload: UserRegister):
    db = get_supabase_admin()

    # Check if email exists
    existing = db.table("users").select("id").eq("email", payload.email).execute()
    if existing.data:
        raise HTTPException(status_code=409, detail="Email already registered")

    user_id = str(uuid.uuid4())
    now = datetime.utcnow().isoformat()

    user_record = {
        "id": user_id,
        "email": payload.email,
        "name": payload.name,
        "role": payload.role.value,
        "password_hash": hash_password(payload.password),
        "brand_id": None,
        "created_at": now,
    }
    db.table("users").insert(user_record).execute()

    token = create_access_token({
        "sub": user_id,
        "email": payload.email,
        "role": payload.role.value,
    })

    return TokenOut(
        access_token=token,
        user=UserOut(
            id=user_id,
            email=payload.email,
            name=payload.name,
            role=payload.role,
            brand_id=None,
            created_at=datetime.utcnow(),
        ),
    )


@router.post("/login", response_model=TokenOut)
async def login(payload: UserLogin):
    db = get_supabase_admin()

    result = db.table("users").select("*").eq("email", payload.email).single().execute()
    if not result.data:
        raise HTTPException(status_code=401, detail="Invalid credentials")

    user = result.data
    if not verify_password(payload.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    token = create_access_token({
        "sub": user["id"],
        "email": user["email"],
        "role": user["role"],
    })

    return TokenOut(
        access_token=token,
        user=UserOut(
            id=user["id"],
            email=user["email"],
            name=user["name"],
            role=user["role"],
            brand_id=user.get("brand_id"),
            created_at=user["created_at"],
        ),
    )


@router.get("/me", response_model=UserOut)
async def get_me(current_user: dict = Depends(get_current_user)):
    db = get_supabase_admin()
    result = db.table("users").select("*").eq("id", current_user["user_id"]).single().execute()
    if not result.data:
        raise HTTPException(status_code=404, detail="User not found")
    u = result.data
    return UserOut(
        id=u["id"],
        email=u["email"],
        name=u["name"],
        role=u["role"],
        brand_id=u.get("brand_id"),
        created_at=u["created_at"],
    )