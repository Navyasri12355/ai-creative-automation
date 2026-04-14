"""
Comprehensive Indian festival calendar.
Dates are approximate for 2024-2025 (lunar festivals shift yearly).
"""

FESTIVALS = [
    {
        "id": "diwali-2024",
        "name": "Diwali",
        "name_translations": {
            "hi": "दीपावली", "te": "దీపావళి", "ta": "தீபாவளி",
            "kn": "ದೀಪಾವಳಿ", "ml": "ദീപാവലി", "bn": "দীপাবলি",
            "gu": "દિવાળી", "mr": "दिवाळी"
        },
        "festival_type": "national",
        "regions": ["all"],
        "start_date": "2024-11-01",
        "end_date": "2024-11-05",
        "colors": ["#FFD700", "#FF6B00", "#8B0000", "#800080"],
        "symbols": ["diya", "lotus", "lakshmi", "fireworks", "rangoli"],
        "themes": ["prosperity", "light over darkness", "family", "new beginnings"],
        "greetings": {
            "en": "Wishing you a bright and prosperous Diwali!",
            "hi": "दीपावली की हार्दिक शुभकामनाएं!",
            "te": "దీపావళి శుభాకాంక్షలు!",
            "ta": "தீபாவளி நல்வாழ்த்துக்கள்!",
            "kn": "ದೀಪಾವಳಿ ಶುಭಾಶಯಗಳು!",
            "ml": "ദീപാവലി ആശംസകൾ!",
            "bn": "শুভ দীপাবলি!",
            "gu": "શુભ દિવાળી!",
            "mr": "शुभ दिवाळी!"
        },
        "marketing_relevance": "high",
    },
    {
        "id": "holi-2025",
        "name": "Holi",
        "name_translations": {
            "hi": "होली", "te": "హోళి", "ta": "ஹோலி",
            "kn": "ಹೋಳಿ", "ml": "ഹോളി", "bn": "হোলি",
            "gu": "હોળી", "mr": "होळी"
        },
        "festival_type": "national",
        "regions": ["all"],
        "start_date": "2025-03-13",
        "end_date": "2025-03-14",
        "colors": ["#FF0000", "#00FF00", "#0000FF", "#FFFF00", "#FF00FF"],
        "symbols": ["colors", "pichkari", "bonfire", "gulal"],
        "themes": ["colors", "joy", "spring", "love", "togetherness"],
        "greetings": {
            "en": "Happy Holi! May your life be filled with colors!",
            "hi": "होली की हार्दिक शुभकामनाएं! रंगों भरी होली!",
            "te": "హోళి శుభాకాంక్షలు!",
            "ta": "ஹோலி நல்வாழ்த்துக்கள்!",
        },
        "marketing_relevance": "high",
    },
    {
        "id": "durga-puja-2024",
        "name": "Durga Puja",
        "name_translations": {
            "hi": "दुर्गा पूजा", "bn": "দুর্গাপূজা", "te": "దుర్గా పూజ"
        },
        "festival_type": "regional",
        "regions": ["West Bengal", "Odisha", "Assam", "Jharkhand", "Bihar"],
        "start_date": "2024-10-09",
        "end_date": "2024-10-13",
        "colors": ["#FF4500", "#FFD700", "#8B0000"],
        "symbols": ["durga", "dhak", "sindoor", "saptami"],
        "themes": ["victory", "goddess", "celebration", "community"],
        "greetings": {
            "en": "Shubho Bijoya! May Goddess Durga bless you!",
            "bn": "শুভো বিজয়া! মা দুর্গার আশীর্বাদ নিন!",
            "hi": "शुभो विजया! दुर्गा पूजा की शुभकामनाएं!",
        },
        "marketing_relevance": "high",
    },
    {
        "id": "onam-2024",
        "name": "Onam",
        "name_translations": {
            "ml": "ഓണം", "en": "Onam", "hi": "ओणम"
        },
        "festival_type": "regional",
        "regions": ["Kerala"],
        "start_date": "2024-09-06",
        "end_date": "2024-09-15",
        "colors": ["#FFD700", "#008000", "#FF6B00"],
        "symbols": ["pookalam", "vallam-kali", "onam-sadhya", "thiruvathira"],
        "themes": ["harvest", "homecoming", "prosperity", "culture"],
        "greetings": {
            "en": "Happy Onam! May King Mahabali's blessings be with you!",
            "ml": "ഓണാശംസകൾ!",
        },
        "marketing_relevance": "high",
    },
    {
        "id": "ganesh-chaturthi-2024",
        "name": "Ganesh Chaturthi",
        "name_translations": {
            "hi": "गणेश चतुर्थी", "mr": "गणेश चतुर्थी", "te": "వినాయక చవితి",
            "kn": "ಗಣೇಶ ಚತುರ್ಥಿ", "ta": "விநாயகர் சதுர்த்தி"
        },
        "festival_type": "national",
        "regions": ["Maharashtra", "Karnataka", "Andhra Pradesh", "Telangana", "Tamil Nadu"],
        "start_date": "2024-09-07",
        "end_date": "2024-09-17",
        "colors": ["#FF6B00", "#FFD700", "#008000"],
        "symbols": ["ganesh", "modak", "elephant", "lotus"],
        "themes": ["wisdom", "new beginnings", "prosperity", "devotion"],
        "greetings": {
            "en": "Happy Ganesh Chaturthi! May Lord Ganesha bless you!",
            "hi": "गणेश चतुर्थी की शुभकामनाएं!",
            "mr": "गणपती बाप्पा मोरया!",
            "te": "వినాయక చవితి శుభాకాంక్షలు!",
        },
        "marketing_relevance": "high",
    },
    {
        "id": "eid-ul-fitr-2025",
        "name": "Eid ul-Fitr",
        "name_translations": {
            "hi": "ईद उल-फ़ित्र", "ur": "عید الفطر", "bn": "ঈদুল ফিতর"
        },
        "festival_type": "religious",
        "regions": ["all"],
        "start_date": "2025-03-30",
        "end_date": "2025-04-01",
        "colors": ["#008000", "#FFD700", "#FFFFFF"],
        "symbols": ["crescent", "star", "mosque", "sevaiyan"],
        "themes": ["gratitude", "community", "feast", "new clothes", "prayer"],
        "greetings": {
            "en": "Eid Mubarak! May Allah bless you with joy and prosperity!",
            "hi": "ईद मुबारक!",
            "ur": "عید مبارک!",
            "bn": "ঈদ মোবারক!",
        },
        "marketing_relevance": "high",
    },
    {
        "id": "christmas-2024",
        "name": "Christmas",
        "name_translations": {
            "hi": "क्रिसमस", "ml": "ക്രിസ്മസ്", "ta": "கிறிஸ்துமஸ்",
            "te": "క్రిస్మస్", "bn": "বড়দিন"
        },
        "festival_type": "religious",
        "regions": ["all"],
        "start_date": "2024-12-25",
        "end_date": "2024-12-25",
        "colors": ["#FF0000", "#008000", "#FFD700"],
        "symbols": ["christmas-tree", "santa", "star", "bells", "gifts"],
        "themes": ["joy", "giving", "family", "peace", "celebration"],
        "greetings": {
            "en": "Merry Christmas and a Happy New Year!",
            "hi": "क्रिसमस की शुभकामनाएं!",
            "ml": "ക്രിസ്മസ് ആശംസകൾ!",
            "ta": "கிறிஸ்துமஸ் வாழ்த்துக்கள்!",
        },
        "marketing_relevance": "high",
    },
    {
        "id": "new-year-2025",
        "name": "New Year",
        "name_translations": {
            "hi": "नव वर्ष", "te": "నూతన సంవత్సరం", "ta": "புத்தாண்டு"
        },
        "festival_type": "cultural",
        "regions": ["all"],
        "start_date": "2025-01-01",
        "end_date": "2025-01-01",
        "colors": ["#FFD700", "#C0C0C0", "#0000FF"],
        "symbols": ["fireworks", "clock", "champagne", "star"],
        "themes": ["new beginnings", "hope", "celebration", "resolution"],
        "greetings": {
            "en": "Happy New Year 2025! Wishing you joy and success!",
            "hi": "नव वर्ष 2025 की शुभकामनाएं!",
        },
        "marketing_relevance": "high",
    },
    {
        "id": "republic-day-2025",
        "name": "Republic Day",
        "name_translations": {
            "hi": "गणतंत्र दिवस", "te": "గణతంత్ర దినోత్సవం", "ta": "குடியரசு தினம்"
        },
        "festival_type": "national",
        "regions": ["all"],
        "start_date": "2025-01-26",
        "end_date": "2025-01-26",
        "colors": ["#FF9933", "#FFFFFF", "#138808", "#000080"],
        "symbols": ["tricolor", "ashoka-chakra", "parade", "india-gate"],
        "themes": ["patriotism", "democracy", "unity", "pride"],
        "greetings": {
            "en": "Happy Republic Day! Jai Hind!",
            "hi": "गणतंत्र दिवस की शुभकामनाएं! जय हिन्द!",
        },
        "marketing_relevance": "medium",
    },
    {
        "id": "independence-day-2025",
        "name": "Independence Day",
        "name_translations": {
            "hi": "स्वतंत्रता दिवस", "te": "స్వాతంత్ర్య దినోత్సవం"
        },
        "festival_type": "national",
        "regions": ["all"],
        "start_date": "2025-08-15",
        "end_date": "2025-08-15",
        "colors": ["#FF9933", "#FFFFFF", "#138808"],
        "symbols": ["tricolor", "flag", "kite", "ashoka-chakra"],
        "themes": ["freedom", "patriotism", "pride", "unity in diversity"],
        "greetings": {
            "en": "Happy Independence Day! Proud to be Indian!",
            "hi": "स्वतंत्रता दिवस की शुभकामनाएं! जय हिन्द!",
        },
        "marketing_relevance": "medium",
    },
    {
        "id": "pongal-2025",
        "name": "Pongal",
        "name_translations": {
            "ta": "பொங்கல்", "te": "పొంగల్", "kn": "ಸಂಕ್ರಾಂತಿ"
        },
        "festival_type": "regional",
        "regions": ["Tamil Nadu", "Andhra Pradesh", "Telangana", "Karnataka"],
        "start_date": "2025-01-14",
        "end_date": "2025-01-17",
        "colors": ["#FFD700", "#FF6B00", "#8B4513"],
        "symbols": ["pongal-pot", "sugarcane", "kolam", "cattle"],
        "themes": ["harvest", "sun worship", "gratitude", "prosperity"],
        "greetings": {
            "en": "Happy Pongal! May your life overflow with joy!",
            "ta": "இனிய பொங்கல் நல்வாழ்த்துக்கள்!",
            "te": "సంక్రాంతి శుభాకాంక్షలు!",
        },
        "marketing_relevance": "high",
    },
    {
        "id": "navratri-2024",
        "name": "Navratri",
        "name_translations": {
            "hi": "नवरात्रि", "gu": "નવરાત્રી", "mr": "नवरात्री"
        },
        "festival_type": "national",
        "regions": ["all"],
        "start_date": "2024-10-03",
        "end_date": "2024-10-12",
        "colors": ["#FF0000", "#FFD700", "#8B0000", "#800080"],
        "symbols": ["garba", "dandiya", "goddess", "durga"],
        "themes": ["goddess worship", "dance", "devotion", "nine nights"],
        "greetings": {
            "en": "Happy Navratri! May Goddess Durga bless you!",
            "hi": "नवरात्रि की शुभकामनाएं! माँ दुर्गा की कृपा बनी रहे!",
            "gu": "નવરાત્રીની શુભ કામનાઓ!",
        },
        "marketing_relevance": "high",
    },
    {
        "id": "valentines-day-2025",
        "name": "Valentine's Day",
        "name_translations": {
            "hi": "वेलेंटाइन दिवस"
        },
        "festival_type": "cultural",
        "regions": ["urban"],
        "start_date": "2025-02-14",
        "end_date": "2025-02-14",
        "colors": ["#FF0000", "#FF69B4", "#FFFFFF"],
        "symbols": ["heart", "roses", "cupid", "gift"],
        "themes": ["love", "romance", "gifting", "couples"],
        "greetings": {
            "en": "Happy Valentine's Day! Spread love everywhere!",
            "hi": "वेलेंटाइन डे की शुभकामनाएं!",
        },
        "marketing_relevance": "high",
    },
    {
        "id": "mothers-day-2025",
        "name": "Mother's Day",
        "name_translations": {
            "hi": "मातृ दिवस"
        },
        "festival_type": "cultural",
        "regions": ["all"],
        "start_date": "2025-05-11",
        "end_date": "2025-05-11",
        "colors": ["#FF69B4", "#FFFFFF", "#FFD700"],
        "symbols": ["flowers", "heart", "mother-child"],
        "themes": ["love", "gratitude", "family", "caring"],
        "greetings": {
            "en": "Happy Mother's Day! Celebrating the heart of every home!",
            "hi": "मातृ दिवस की शुभकामनाएं!",
        },
        "marketing_relevance": "high",
    },
]


def get_upcoming_festivals(days_ahead: int = 30) -> list:
    """Return festivals occurring within the next `days_ahead` days."""
    from datetime import date, timedelta
    today = date.today()
    upcoming = []
    for f in FESTIVALS:
        try:
            start = date.fromisoformat(f["start_date"])
            diff = (start - today).days
            if -3 <= diff <= days_ahead:
                f_copy = dict(f)
                f_copy["days_until"] = diff
                upcoming.append(f_copy)
        except Exception:
            continue
    return sorted(upcoming, key=lambda x: x.get("days_until", 999))


def get_festival_by_id(festival_id: str) -> dict | None:
    return next((f for f in FESTIVALS if f["id"] == festival_id), None)