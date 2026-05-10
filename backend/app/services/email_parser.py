"""
Email parsing utilities — normalise raw SMTP Bucket API responses into
the schemas used by the rest of the backend.

SMTP Bucket field names:
  List item:  { id, sender, recipients, subject, timeCreated (ms epoch) }
  Detail:     { id, sender, recipients, subject, body (raw MIME), html (bool), timeCreated }

The `body` field in detail responses is the full raw MIME message (EML format).
We parse it with Python's `email` module to extract HTML, plain text, and attachments.
"""
from typing import Any, Optional
from datetime import datetime, timezone
import re
import email as email_lib
from email import policy
from email.parser import BytesParser, Parser

from app.schemas.email import AttachmentSchema, EmailSummary, EmailDetail


def _list(value: Any) -> list[str]:
    """Ensure a field is always a list of strings."""
    if value is None:
        return []
    if isinstance(value, list):
        return [str(v) for v in value]
    return [str(value)]


def _parse_time(value: Any) -> Optional[str]:
    """Convert timeCreated (ms epoch int) or ISO string to ISO-8601 string."""
    if value is None:
        return None
    if isinstance(value, (int, float)):
        try:
            dt = datetime.fromtimestamp(value / 1000, tz=timezone.utc)
            return dt.isoformat()
        except Exception:
            return None
    return str(value)


def _strip_html(html: str) -> str:
    clean = re.sub(r"<[^>]+>", " ", html)
    return re.sub(r"\s+", " ", clean).strip()


def _parse_mime(raw_body: str) -> dict[str, Any]:
    """
    Parse a raw MIME message string and extract:
      - html_body: HTML part content
      - text_body: plain-text part content
      - attachments: list of AttachmentSchema
    """
    try:
        msg = Parser(policy=policy.compat32).parsestr(raw_body)
    except Exception:
        return {"html_body": None, "text_body": raw_body, "attachments": [], "raw_headers": {}}

    html_body: Optional[str] = None
    text_body: Optional[str] = None
    attachments: list[AttachmentSchema] = []

    def _walk(part: Any) -> None:
        nonlocal html_body, text_body
        content_disposition = part.get_content_disposition() or ""
        content_type = part.get_content_type()
        filename = part.get_filename()

        if content_disposition == "attachment" or filename:
            # It's an attachment
            try:
                payload = part.get_payload(decode=True)
                size = len(payload) if payload else None
            except Exception:
                size = None
            attachments.append(
                AttachmentSchema(
                    filename=filename or "attachment",
                    content_type=content_type or "application/octet-stream",
                    size=size,
                    id=filename or str(len(attachments)),
                )
            )
        elif content_type == "text/html" and html_body is None:
            try:
                charset = part.get_content_charset() or "utf-8"
                payload = part.get_payload(decode=True)
                if payload:
                    html_body = payload.decode(charset, errors="replace")
            except Exception:
                pass
        elif content_type == "text/plain" and text_body is None:
            try:
                charset = part.get_content_charset() or "utf-8"
                payload = part.get_payload(decode=True)
                if payload:
                    text_body = payload.decode(charset, errors="replace")
            except Exception:
                pass

        if part.is_multipart():
            for subpart in part.get_payload():
                _walk(subpart)

    _walk(msg)

    # Extract raw headers
    raw_headers = {k: v for k, v in msg.items()}

    return {
        "html_body": html_body,
        "text_body": text_body,
        "attachments": attachments,
        "raw_headers": raw_headers,
    }


def extract_attachment_bytes(raw_body: str, attachment_id: str) -> Optional[tuple[bytes, str, str]]:
    """
    Re-parse the MIME body and extract a specific attachment by filename/id.
    Returns (content_bytes, content_type, filename) or None.
    """
    try:
        msg = Parser(policy=policy.compat32).parsestr(raw_body)
    except Exception:
        return None

    idx = 0

    def _find(part: Any) -> Optional[tuple[bytes, str, str]]:
        nonlocal idx
        content_disposition = part.get_content_disposition() or ""
        filename = part.get_filename()

        if content_disposition == "attachment" or filename:
            current_id = filename or str(idx)
            idx += 1
            if current_id == attachment_id or str(idx - 1) == attachment_id:
                try:
                    payload = part.get_payload(decode=True)
                    if payload:
                        return (payload, part.get_content_type() or "application/octet-stream", filename or "attachment")
                except Exception:
                    return None

        if part.is_multipart():
            for subpart in part.get_payload():
                result = _find(subpart)
                if result:
                    return result

        return None

    return _find(msg)


def parse_email_summary(raw: dict[str, Any]) -> EmailSummary:
    """Parse a list-endpoint email item. No MIME body available here."""
    has_html = bool(raw.get("html"))

    recipients_raw = raw.get("recipients") or raw.get("to") or []
    if isinstance(recipients_raw, str):
        recipients_raw = [recipients_raw]

    return EmailSummary(
        id=str(raw.get("id", "")),
        subject=raw.get("subject") or "(No Subject)",
        sender=raw.get("sender") or raw.get("from") or "",
        recipients=_list(recipients_raw),
        date=_parse_time(raw.get("timeCreated") or raw.get("date") or raw.get("receivedAt")),
        has_attachments=has_html and False,  # updated in detail; list doesn't have body
        has_html=has_html,
        snippet=None,
        size=raw.get("size"),
        attachments=[],
    )


def parse_email_detail(raw: dict[str, Any]) -> EmailDetail:
    """Parse a detail-endpoint email, including full MIME body."""
    recipients_raw = raw.get("recipients") or raw.get("to") or []
    if isinstance(recipients_raw, str):
        recipients_raw = [recipients_raw]

    has_html_flag = bool(raw.get("html"))

    # The `body` field is the full raw MIME message — parse it
    raw_body: str = raw.get("body") or ""
    mime = _parse_mime(raw_body)

    html_body = mime["html_body"]
    text_body = mime["text_body"]
    attachments: list[AttachmentSchema] = mime["attachments"]
    raw_headers: dict = mime["raw_headers"]

    # Snippet from plain text
    snippet_text = text_body or (_strip_html(html_body) if html_body else "")
    snippet = snippet_text[:120] + ("…" if len(snippet_text) > 120 else "") if snippet_text else None

    cc_raw = raw.get("cc") or []
    bcc_raw = raw.get("bcc") or []

    return EmailDetail(
        id=str(raw.get("id", "")),
        subject=raw.get("subject") or "(No Subject)",
        sender=raw.get("sender") or raw.get("from") or "",
        recipients=_list(recipients_raw),
        date=_parse_time(raw.get("timeCreated") or raw.get("date") or raw.get("receivedAt")),
        has_attachments=bool(attachments),
        has_html=has_html_flag,
        snippet=snippet,
        size=raw.get("size"),
        attachments=attachments,
        html_body=html_body,
        text_body=text_body,
        raw_headers=raw_headers if raw_headers else None,
        cc=_list(cc_raw),
        bcc=_list(bcc_raw),
    )
