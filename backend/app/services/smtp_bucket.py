import httpx
from typing import Optional, Any
from app.config.settings import settings


SMTP_BUCKET_API = settings.smtp_bucket_base_url
SMTP_BUCKET_HTML = settings.smtp_bucket_html_base_url

TIMEOUT = httpx.Timeout(30.0, connect=10.0)


async def fetch_emails(
    sender: Optional[str] = None,
    recipient: Optional[str] = None,
    subject: Optional[str] = None,
    limit: int = 100,
    page: int = 1,
) -> dict[str, Any]:
    params: dict[str, Any] = {"limit": limit}
    if sender:
        params["sender"] = sender
    if recipient:
        params["recipient"] = recipient
    if subject:
        params["subject"] = subject

    async with httpx.AsyncClient(timeout=TIMEOUT) as client:
        resp = await client.get(f"{SMTP_BUCKET_API}/emails", params=params)
        resp.raise_for_status()
        data = resp.json()
        # SMTP Bucket returns { results: [...], totalResults, totalPages }
        return {
            "emails": data.get("results", []),
            "total": data.get("totalResults", 0),
            "total_pages": data.get("totalPages", 1),
        }


async def fetch_email(email_id: str) -> dict[str, Any]:
    async with httpx.AsyncClient(timeout=TIMEOUT) as client:
        resp = await client.get(f"{SMTP_BUCKET_API}/emails/{email_id}")
        resp.raise_for_status()
        return resp.json()


async def fetch_email_html(email_id: str) -> str:
    async with httpx.AsyncClient(timeout=TIMEOUT) as client:
        resp = await client.get(f"{SMTP_BUCKET_HTML}/emails/{email_id}/html")
        resp.raise_for_status()
        return resp.text


async def fetch_attachment(email_id: str, attachment_id: str) -> tuple[bytes, str, str]:
    """Download an attachment. Returns (content_bytes, content_type, filename)."""
    async with httpx.AsyncClient(timeout=TIMEOUT) as client:
        resp = await client.get(f"{SMTP_BUCKET_API}/emails/{email_id}/attachments/{attachment_id}")
        resp.raise_for_status()
        content_type = resp.headers.get("content-type", "application/octet-stream")
        disposition = resp.headers.get("content-disposition", "")
        filename = ""
        if "filename=" in disposition:
            filename = disposition.split("filename=")[-1].strip().strip('"')
        return resp.content, content_type, filename


async def delete_email(email_id: str) -> bool:
    async with httpx.AsyncClient(timeout=TIMEOUT) as client:
        resp = await client.delete(f"{SMTP_BUCKET_API}/emails/{email_id}")
        return resp.status_code in (200, 204)
