"""
/emails router.
"""
import asyncio
from fastapi import APIRouter, HTTPException, Query
from fastapi.responses import HTMLResponse, StreamingResponse
from typing import Optional

from app.services import smtp_bucket, email_parser
from app.schemas.email import EmailListResponse, EmailDetail, EmailSummary
from app.config.projects import PROJECTS

router = APIRouter(prefix="/emails", tags=["emails"])


def _senders_for(project_id: str, environment: str) -> list[str]:
    """Look up all senders for a given project/environment pair."""
    proj = next((p for p in PROJECTS if p.id == project_id), None)
    if proj is None:
        return []
    env = next((e for e in proj.environments if e.name.lower() == environment.lower()), None)
    if env is None:
        return []
    # If this env redirects, follow the redirect
    if env.redirect_to:
        target_env = next(
            (e for e in proj.environments if e.name.lower().startswith(env.redirect_to.lower())),
            None,
        )
        return target_env.senders if target_env else []
    return env.senders


@router.get("", response_model=EmailListResponse)
async def list_emails(
    project: Optional[str] = Query(None),
    environment: Optional[str] = Query(None),
    sender: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    limit: int = Query(200, ge=1, le=500),
):
    # Resolve senders from project/environment if not explicitly provided
    resolved_senders: list[str] = []
    if sender:
        resolved_senders = [sender]
    elif project and environment:
        resolved_senders = _senders_for(project, environment)

    try:
        if resolved_senders:
            results = await asyncio.gather(*[
                smtp_bucket.fetch_emails(sender=s, limit=limit)
                for s in resolved_senders
            ])
            seen_ids: set[str] = set()
            emails_raw: list = []
            for raw in results:
                for e in raw.get("emails", []):
                    eid = str(e.get("id") or e.get("_id") or "")
                    if eid not in seen_ids:
                        seen_ids.add(eid)
                        emails_raw.append(e)
            emails_raw.sort(key=lambda e: e.get("timeCreated", ""), reverse=True)
        else:
            raw = await smtp_bucket.fetch_emails(limit=limit)
            emails_raw = raw.get("emails", [])
    except Exception as exc:
        raise HTTPException(status_code=502, detail=f"SMTP Bucket error: {exc}")

    # Apply search filter
    if search:
        q = search.lower()
        emails_raw = [
            e for e in emails_raw
            if q in (e.get("subject") or "").lower()
            or q in (e.get("sender") or e.get("from") or "").lower()
            or q in str(e.get("recipients") or e.get("to") or "").lower()
        ]

    summaries = [email_parser.parse_email_summary(e) for e in emails_raw]

    return EmailListResponse(
        emails=summaries,
        total=len(summaries),
        page=1,
        limit=limit,
        has_more=False,
    )


@router.get("/{email_id}", response_model=EmailDetail)
async def get_email(email_id: str):
    try:
        raw = await smtp_bucket.fetch_email(email_id)
    except Exception as exc:
        raise HTTPException(status_code=502, detail=f"SMTP Bucket error: {exc}")
    return email_parser.parse_email_detail(raw)


@router.get("/{email_id}/html", response_class=HTMLResponse)
async def get_email_html(email_id: str):
    try:
        html = await smtp_bucket.fetch_email_html(email_id)
        return HTMLResponse(content=html)
    except Exception as exc:
        raise HTTPException(status_code=502, detail=f"SMTP Bucket error: {exc}")


@router.get("/{email_id}/attachments/{attachment_id}")
async def download_attachment(email_id: str, attachment_id: str):
    """Extract and stream an attachment by re-parsing the MIME body."""
    try:
        raw = await smtp_bucket.fetch_email(email_id)
    except Exception as exc:
        raise HTTPException(status_code=502, detail=f"SMTP Bucket error: {exc}")

    raw_body: str = raw.get("body") or ""
    result = email_parser.extract_attachment_bytes(raw_body, attachment_id)
    if not result:
        raise HTTPException(status_code=404, detail="Attachment not found")

    content, content_type, filename = result
    headers = {}
    if filename:
        headers["Content-Disposition"] = f'attachment; filename="{filename}"'
    return StreamingResponse(
        iter([content]),
        media_type=content_type or "application/octet-stream",
        headers=headers,
    )


@router.delete("/{email_id}")
async def delete_email(email_id: str):
    try:
        success = await smtp_bucket.delete_email(email_id)
        if not success:
            raise HTTPException(status_code=404, detail="Email not found or could not be deleted")
        return {"success": True}
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(status_code=502, detail=f"SMTP Bucket error: {exc}")
