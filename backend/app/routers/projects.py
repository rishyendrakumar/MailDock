"""
/projects router — returns project + environment configuration with live stats.
"""
import asyncio
from fastapi import APIRouter, HTTPException
from typing import Any

from app.config.projects import PROJECTS
from app.services import smtp_bucket
from app.services.email_parser import _parse_time
from app.schemas.email import ProjectResponse, EnvironmentSummary

router = APIRouter(prefix="/projects", tags=["projects"])


async def _env_stats(senders: list[str]) -> dict[str, Any]:
    """Fetch live stats aggregated across all senders for an environment."""
    if not senders:
        return {"total_sent": 0, "message_count": 0, "messages_limit": 0, "last_message": None}
    try:
        results = await asyncio.gather(*[
            smtp_bucket.fetch_emails(sender=s, limit=100)
            for s in senders
        ])
        total_results = sum(r.get("total", len(r.get("emails", []))) for r in results)
        fetched_limit = sum(len(r.get("emails", [])) for r in results)
        all_emails = [e for r in results for e in r.get("emails", [])]
        all_emails.sort(key=lambda e: e.get("timeCreated", ""), reverse=True)
        last = _parse_time(all_emails[0].get("timeCreated")) if all_emails else None
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
            stats = await _env_stats(env.senders)
            envs.append(
                EnvironmentSummary(
                    name=env.name,
                    senders=env.senders,
                    redirect_to=env.redirect_to,
                    redirect_message=env.redirect_message,
                    **stats,
                )
            )
        result.append(ProjectResponse(id=proj.id, name=proj.name, environments=envs))
    return result
