import { useState, useRef, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Mail, MailOpen, MoreVertical, ChevronDown, Smartphone, Tablet, Monitor,
  ExternalLink, Paperclip, Download
} from 'lucide-react';
import type { EmailDetail, EmailTab, ViewMode } from '../../types';
import { emailsApi } from '../../services/api';
import { formatBytes } from '../../utils/formatters';
import { Skeleton } from '../common/Skeleton';
import clsx from 'clsx';

interface EmailPreviewProps {
  emailId: string;
  isRead: boolean;
  onToggleRead: () => void;
}

const viewSizes: Record<ViewMode, string> = {
  mobile: 'max-w-xs',
  tablet: 'max-w-lg',
  desktop: 'w-full',
};

function HtmlRenderer({ emailId }: { emailId: string }) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const { data: html, isLoading } = useQuery({
    queryKey: ['email-html', emailId],
    queryFn: () => emailsApi.getHtml(emailId),
    staleTime: 5 * 60 * 1000,
  });

  useEffect(() => {
    if (!html || !iframeRef.current) return;
    const doc = iframeRef.current.contentDocument;
    if (!doc) return;
    doc.open();
    doc.write(html);
    doc.close();
    // make links open in new tab
    doc.querySelectorAll('a').forEach((a) => {
      a.setAttribute('target', '_blank');
      a.setAttribute('rel', 'noopener noreferrer');
    });
  }, [html]);

  if (isLoading) {
    return (
      <div className="p-6 space-y-3">
        <Skeleton className="h-5 w-full" />
        <Skeleton className="h-4 w-4/5" />
        <Skeleton className="h-4 w-3/5" />
        <Skeleton className="h-32 w-full mt-4" />
      </div>
    );
  }

  return (
    <iframe
      ref={iframeRef}
      title="Email HTML"
      sandbox="allow-same-origin allow-popups"
      className="w-full h-full border-0 bg-white"
      style={{ minHeight: '500px' }}
    />
  );
}

function RawView({ email }: { email: EmailDetail }) {
  const headers = email.raw_headers || {};
  const lines = Object.entries(headers)
    .map(([k, v]) => `${k}: ${v}`)
    .join('\n');
  const body = email.text_body || email.html_body || '(no content)';
  return (
    <pre className="text-xs font-mono text-gray-700 dark:text-gray-300 whitespace-pre-wrap break-words p-4 overflow-auto">
      {lines ? lines + '\n\n' : ''}{body}
    </pre>
  );
}

export default function EmailPreview({ emailId, isRead, onToggleRead }: EmailPreviewProps) {
  const [tab, setTab] = useState<EmailTab>('html');
  const [viewMode, setViewMode] = useState<ViewMode>('desktop');
  const [showHeaders, setShowHeaders] = useState(false);

  const { data: email, isLoading, isError } = useQuery({
    queryKey: ['email', emailId],
    queryFn: () => emailsApi.get(emailId),
    staleTime: 5 * 60 * 1000,
  });

  if (isLoading) {
    return (
      <div className="flex-1 p-6 space-y-4">
        <Skeleton className="h-7 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
        <Skeleton className="h-4 w-2/5" />
        <Skeleton className="h-96 w-full mt-6" />
      </div>
    );
  }

  if (isError || !email) {
    return (
      <div className="flex-1 flex items-center justify-center text-gray-400 dark:text-gray-600">
        Failed to load email.
      </div>
    );
  }

  const fromDisplay = email.sender || 'Unknown';
  const toDisplay = email.recipients.join(', ');
  const dateDisplay = email.date
    ? new Date(email.date).toLocaleString('en-US', {
        year: 'numeric', month: 'short', day: 'numeric',
        hour: '2-digit', minute: '2-digit',
      })
    : '—';

  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-900 overflow-hidden">
      {/* Header */}
      <div className="sticky top-0 z-10 px-6 py-4 border-b border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900">
        <div className="flex items-start justify-between gap-4">
          <h1 className="text-lg font-semibold text-gray-900 dark:text-white leading-tight">
            {email.subject || '(No Subject)'}
          </h1>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={onToggleRead}
              className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors cursor-pointer"
              aria-label={isRead ? 'Mark as unread' : 'Mark as read'}
              title={isRead ? 'Mark as unread' : 'Mark as read'}
            >
              {isRead
                ? <MailOpen size={16} className="text-blue-500 dark:text-blue-400" />
                : <Mail size={16} className="text-gray-400" />
              }
            </button>
            <button className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded text-gray-400 transition-colors">
              <MoreVertical size={16} />
            </button>
          </div>
        </div>

        {/* From / To */}
        <div className="mt-2 space-y-0.5 text-sm">
          <p className="text-gray-600 dark:text-gray-400">
            <span className="font-medium text-gray-700 dark:text-gray-300">From:</span>{' '}
            {fromDisplay}
          </p>
          <p className="text-gray-600 dark:text-gray-400 line-clamp-1">
            <span className="font-medium text-gray-700 dark:text-gray-300">To:</span>{' '}
            {toDisplay}
          </p>
        </div>

        {/* Date + attachments */}
        <div className="flex items-center justify-between mt-2">
          <button
            onClick={() => setShowHeaders((h) => !h)}
            className="text-xs text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
          >
            {showHeaders ? 'Hide Headers' : 'Show Headers'}
            <ChevronDown size={12} className={clsx('transition-transform', showHeaders && 'rotate-180')} />
          </button>
          <div className="flex items-center gap-3 text-xs text-gray-400 dark:text-gray-600">
            <span>{dateDisplay}{email.size ? `, ${formatBytes(email.size)}` : ''}</span>
            {email.has_attachments && (
              <button className="text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1">
                <Paperclip size={12} />
                Attachments ({email.attachments.length})
              </button>
            )}
          </div>
        </div>

        {/* Headers panel */}
        {showHeaders && email.raw_headers && (
          <div className="mt-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg text-xs font-mono text-gray-600 dark:text-gray-400 max-h-40 overflow-y-auto scrollbar-thin">
            {Object.entries(email.raw_headers).map(([k, v]) => (
              <div key={k}>
                <span className="font-semibold">{k}:</span> {String(v)}
              </div>
            ))}
          </div>
        )}

        {/* Attachments */}
        {email.has_attachments && email.attachments.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {email.attachments.map((att, i) => (
              <div
                key={i}
                className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-xs text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <Paperclip size={12} className="text-gray-400" />
                <span>{att.filename}</span>
                {att.size && <span className="text-gray-400">({formatBytes(att.size)})</span>}
                <a
                  href={`/api/emails/${emailId}/attachments/${att.id || i}`}
                  download={att.filename}
                  className="text-blue-600 dark:text-blue-400 hover:text-blue-800"
                  aria-label={`Download ${att.filename}`}
                >
                  <Download size={12} />
                </a>
              </div>
            ))}
          </div>
        )}

        {/* Tabs */}
        <div className="flex items-center gap-4 mt-3 border-b border-gray-100 dark:border-gray-800 -mb-px">
          {(['html', 'text', 'raw'] as EmailTab[]).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={clsx(
                'pb-2 text-sm font-medium capitalize border-b-2 transition-colors',
                tab === t
                  ? 'border-blue-600 text-blue-600 dark:text-blue-400 dark:border-blue-400'
                  : 'border-transparent text-gray-400 dark:text-gray-600 hover:text-gray-700 dark:hover:text-gray-300'
              )}
            >
              {t.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* View mode selector (for HTML tab) */}
      {tab === 'html' && (
        <div className="flex items-center justify-center gap-3 px-6 py-2 border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-900">
          {([
            { mode: 'mobile' as ViewMode, icon: Smartphone },
            { mode: 'tablet' as ViewMode, icon: Tablet },
            { mode: 'desktop' as ViewMode, icon: Monitor },
          ]).map(({ mode, icon: Icon }) => (
            <button
              key={mode}
              onClick={() => setViewMode(mode)}
              className={clsx(
                'p-1.5 rounded transition-colors',
                viewMode === mode
                  ? 'text-blue-600 dark:text-blue-400'
                  : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
              )}
              aria-label={`${mode} view`}
            >
              <Icon size={16} />
            </button>
          ))}
          <a
            href={`/api/emails/${emailId}/html`}
            target="_blank"
            rel="noopener noreferrer"
            className="p-1.5 rounded text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors ml-2"
            aria-label="Open in new tab"
          >
            <ExternalLink size={15} />
          </a>
        </div>
      )}

      {/* Content */}
      <div className="flex-1 overflow-auto scrollbar-thin">
        {tab === 'html' && (
          <div className={clsx('mx-auto h-full transition-all', viewSizes[viewMode])}>
            {email.has_html ? (
              <HtmlRenderer emailId={emailId} />
            ) : (
              <div className="p-6 text-sm text-gray-500 dark:text-gray-500 italic">
                No HTML content available.
              </div>
            )}
          </div>
        )}
        {tab === 'text' && (
          <div className="p-6">
            {email.text_body ? (
              <pre className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap break-words font-sans leading-relaxed">
                {email.text_body}
              </pre>
            ) : (
              <p className="text-sm text-gray-400 italic">No plain text content available.</p>
            )}
          </div>
        )}
        {tab === 'raw' && <RawView email={email} />}
      </div>
    </div>
  );
}
