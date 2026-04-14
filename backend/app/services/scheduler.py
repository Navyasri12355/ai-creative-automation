"""
APScheduler jobs for festival reminders and automated suggestions.
"""

import logging
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from apscheduler.triggers.cron import CronTrigger

logger = logging.getLogger(__name__)
scheduler = AsyncIOScheduler()


async def check_upcoming_festivals():
    """Runs daily: find festivals in next 7 days and notify brand admins."""
    from app.utils.festivals_data import get_upcoming_festivals
    from app.core.database import get_supabase_admin

    upcoming = [f for f in get_upcoming_festivals(days_ahead=7) if f.get("days_until", 99) >= 0]
    if not upcoming:
        return

    logger.info(f"Found {len(upcoming)} upcoming festivals in next 7 days")
    db = get_supabase_admin()

    # Get all brand admins
    admins = db.table("users").select("id,email,name,brand_id").eq("role", "brand-admin").execute()

    for admin in admins.data or []:
        for festival in upcoming[:3]:  # max 3 reminders per day
            # Store notification in DB
            db.table("notifications").insert({
                "user_id": admin["id"],
                "brand_id": admin.get("brand_id"),
                "type": "festival_reminder",
                "title": f"{festival['name']} is in {festival['days_until']} days!",
                "body": f"Create your {festival['name']} social media creatives now.",
                "festival_id": festival["id"],
                "is_read": False,
            }).execute()

    # Send emails if Resend is configured
    try:
        from app.core.config import settings
        if settings.resend_api_key:
            import resend
            resend.api_key = settings.resend_api_key
            for admin in (admins.data or [])[:10]:  # cap at 10
                names = ", ".join(f["name"] for f in upcoming[:3])
                resend.Emails.send({
                    "from": settings.email_from,
                    "to": admin["email"],
                    "subject": f"🎉 Upcoming: {upcoming[0]['name']} — Create your creatives!",
                    "html": f"""
<h2>Festival Alert! 🎊</h2>
<p>Hi {admin['name']},</p>
<p>The following festivals are coming up soon:</p>
<ul>{''.join(f"<li><strong>{f['name']}</strong> — {f['days_until']} days away</li>" for f in upcoming[:3])}</ul>
<p><a href="https://your-app.vercel.app/dashboard/creatives/new">Generate your creatives now →</a></p>
                    """,
                })
    except Exception as e:
        logger.warning(f"Email send failed: {e}")


def start_scheduler():
    """Start background jobs."""
    scheduler.add_job(
        check_upcoming_festivals,
        CronTrigger(hour=9, minute=0),  # 9 AM daily
        id="festival_reminders",
        replace_existing=True,
    )
    scheduler.start()
    logger.info("Scheduler started")


def stop_scheduler():
    if scheduler.running:
        scheduler.shutdown()