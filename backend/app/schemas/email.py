from typing import Optional, Any
from pydantic import BaseModel


class AttachmentSchema(BaseModel):
    filename: str
    content_type: str
    size: Optional[int] = None
    id: Optional[str] = None


class EmailSummary(BaseModel):
    id: str
    subject: Optional[str] = None
    sender: Optional[str] = None
    recipients: list[str] = []
    date: Optional[str] = None
    has_attachments: bool = False
    has_html: bool = False
    snippet: Optional[str] = None
    size: Optional[int] = None
    attachments: list[AttachmentSchema] = []


class EmailDetail(EmailSummary):
    html_body: Optional[str] = None
    text_body: Optional[str] = None
    raw_headers: Optional[dict[str, Any]] = None
    attachments: list[AttachmentSchema] = []
    cc: list[str] = []
    bcc: list[str] = []


class EmailListResponse(BaseModel):
    emails: list[EmailSummary]
    total: int
    page: int
    limit: int
    has_more: bool


class EnvironmentSummary(BaseModel):
    name: str
    sender: Optional[str] = None
    redirect_to: Optional[str] = None
    redirect_message: Optional[str] = None
    total_sent: int = 0
    message_count: int = 0
    messages_limit: int = 0
    last_message: Optional[str] = None


class ProjectResponse(BaseModel):
    id: str
    name: str
    environments: list[EnvironmentSummary]
