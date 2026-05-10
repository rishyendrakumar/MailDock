export interface AttachmentInfo {
  filename: string;
  content_type: string;
  size?: number;
  id?: string;
}

export interface EmailSummary {
  id: string;
  subject?: string;
  sender?: string;
  recipients: string[];
  date?: string;
  has_attachments: boolean;
  has_html: boolean;
  snippet?: string;
  size?: number;
  attachments: AttachmentInfo[];
}

export interface EmailDetail extends EmailSummary {
  html_body?: string;
  text_body?: string;
  raw_headers?: Record<string, unknown>;
  attachments: AttachmentInfo[];
  cc: string[];
  bcc: string[];
}

export interface EmailListResponse {
  emails: EmailSummary[];
  total: number;
  page: number;
  limit: number;
  has_more: boolean;
}

export interface EnvironmentSummary {
  name: string;
  sender?: string;
  redirect_to?: string;
  redirect_message?: string;
  total_sent: number;
  message_count: number;
  messages_limit: number;
  last_message?: string;
}

export interface ProjectResponse {
  id: string;
  name: string;
  environments: EnvironmentSummary[];
}

export type EmailTab = 'html' | 'text' | 'raw';
export type ViewMode = 'mobile' | 'tablet' | 'desktop';
