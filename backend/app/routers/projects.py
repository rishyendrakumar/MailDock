"""
/projects router — returns project + environment configuration with live stats.
"""
from fastapi import APIRouter, HTTPException
from typing import Any

from app.config.projects import PROJECTS
from app.services import smtp_bucket
from app.services.email_parser import _parse_time
from app.schemas.email import ProjectResponse, EnvironmentSummary

router = APIRouter(prefix="/projects", tags=["projects"])


async def _env_stats(sender: str | None) -> dict[str, Any]:
    """Fetch live stats for a single environment sender."""
    if not sender:
        return {"total_sent": 0, "message_count": 0, "messages_limit": 0, "last_message": None}
    try:
        data = await smtp_bucket.fetch_emails(sender=sender, limit=100)
        emails = data.get("emails", [])
        total_results = data.get("total", len(emails))
        fetched_limit = len(emails)
        last = _parse_time(emails[0].get("timeCreated")) if emails else None
        return {
            "total_sent": total_results,
            "message_count": total_results,
            "messages_limit": fetched_limit,
            "last_message": last,
        }
    except Exception:
        return {"total_sent": 0, "message_count": 0, "messages_limit": 0, "last_message": None}


@router.get("", response_model=list[ProjectResponse])
async def list_projects():
    result = []
    for proj in PROJECTS:
        envs = []
        for env in proj.environments:
            stats = await _env_stats(env.sender)
            envs.append(
                EnvironmentSummary(
                    name=env.name,
                    sender=env.sender,
                    redirect_to=env.redirect_to,
                    redirect_message=env.redirect_message,
                    **stats,
                )
            )
        result.append(ProjectResponse(id=proj.id, name=proj.name, environments=envs))
    return result
