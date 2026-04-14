from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List, Dict
from datetime import datetime
from enum import Enum


# ── Enums ─────────────────────────────────────────────────────────────────

class UserRole(str, Enum):
    BRAND_ADMIN = "brand-admin"
    MARKETING_MANAGER = "marketing-manager"
    CONTENT_CREATOR = "content-creator"


class Platform(str, Enum):
    INSTAGRAM_POST = "instagram-post"
    INSTAGRAM_STORY = "instagram-story"
    FACEBOOK_POST = "facebook-post"
    LINKEDIN_POST = "linkedin-post"
    WHATSAPP = "whatsapp-business"
    TWITTER = "twitter-post"


class DesignStyle(str, Enum):
    MODERN = "modern"
    TRADITIONAL = "traditional"
    MINIMAL = "minimal"
    VIBRANT = "vibrant"


class CreativeStatus(str, Enum):
    DRAFT = "draft"
    APPROVED = "approved"
    PUBLISHED = "published"


class FestivalType(str, Enum):
    NATIONAL = "national"
    REGIONAL = "regional"
    RELIGIOUS = "religious"
    CULTURAL = "cultural"


SUPPORTED_LANGUAGES = [
    "en", "hi", "te", "ta", "kn", "ml", "bn", "gu", "mr"
]

LANGUAGE_NAMES = {
    "en": "English", "hi": "Hindi", "te": "Telugu",
    "ta": "Tamil", "kn": "Kannada", "ml": "Malayalam",
    "bn": "Bengali", "gu": "Gujarati", "mr": "Marathi",
}


# ── User models ────────────────────────────────────────────────────────────

class UserRegister(BaseModel):
    email: EmailStr
    password: str = Field(min_length=8)
    name: str = Field(min_length=2)
    role: UserRole = UserRole.CONTENT_CREATOR


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserOut(BaseModel):
    id: str
    email: str
    name: str
    role: UserRole
    brand_id: Optional[str] = None
    created_at: datetime


class TokenOut(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserOut


# ── Brand models ───────────────────────────────────────────────────────────

class BrandColor(BaseModel):
    name: str
    hex: str
    usage: str = "primary"  # primary | secondary | accent | background


class BrandCreate(BaseModel):
    name: str
    industry: str
    target_regions: List[str] = []
    design_style: DesignStyle = DesignStyle.MODERN
    cultural_sensitivity: str = "medium"
    language_preferences: List[str] = ["en", "hi"]
    guidelines: Optional[str] = None
    colors: List[BrandColor] = []


class BrandOut(BaseModel):
    id: str
    name: str
    industry: str
    target_regions: List[str]
    design_style: str
    cultural_sensitivity: str
    language_preferences: List[str]
    guidelines: Optional[str]
    colors: List[dict]
    logo_url: Optional[str] = None
    created_at: datetime
    owner_id: str


# ── Festival models ────────────────────────────────────────────────────────

class FestivalOut(BaseModel):
    id: str
    name: str
    name_translations: Dict[str, str]
    festival_type: FestivalType
    regions: List[str]
    start_date: str
    end_date: str
    colors: List[str]
    symbols: List[str]
    themes: List[str]
    greetings: Dict[str, str]
    marketing_relevance: str
    days_until: Optional[int] = None


# ── Creative models ────────────────────────────────────────────────────────

class CreativeGenerateRequest(BaseModel):
    brand_id: str
    festival_id: Optional[str] = None
    occasion_type: str = "general"           # festival | campaign | product | announcement
    platforms: List[Platform] = [Platform.INSTAGRAM_POST]
    languages: List[str] = ["en"]
    custom_message: Optional[str] = None
    tone: Optional[str] = "warm"             # warm | professional | festive | minimal
    include_offer: Optional[str] = None      # e.g. "20% off"


class GeneratedImage(BaseModel):
    platform: str
    width: int
    height: int
    url: str
    format: str = "png"


class CreativeOut(BaseModel):
    id: str
    brand_id: str
    festival_id: Optional[str]
    occasion_type: str
    platforms: List[str]
    texts: Dict[str, str]         # lang_code -> text
    images: List[GeneratedImage]
    ai_prompt_used: Optional[str]
    status: CreativeStatus
    generated_at: datetime
    views: int = 0
    downloads: int = 0


# ── Analytics models ───────────────────────────────────────────────────────

class AnalyticsSummary(BaseModel):
    total_creatives: int
    total_downloads: int
    total_views: int
    top_platforms: List[Dict]
    top_festivals: List[Dict]
    recent_creatives: List[Dict]