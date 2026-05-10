import { Paperclip, FileText, Image, FileArchive, Download } from 'lucide-react';
import type { EmailSummary } from '../../types';
import { formatRelativeTime, extractEmailAddress } from '../../utils/formatters';
import clsx from 'clsx';

interface EmailListItemProps {
  email: EmailSummary;
  isSelected: boolean;
  isRead: boolean;
  onClick: () => void;
}

function attachmentIcon(contentType: string) {
  if (contentType.startsWith('image/')) return <Image size={10} />;
  if (contentType.includes('pdf') || contentType.includes('word') || contentType.includes('text'))
    return <FileText size={10} />;
  if (contentType.includes('zip') || contentType.includes('archive') || contentType.includes('compressed'))
    return <FileArchive size={10} />;
  return <Paperclip size={10} />;
}

export default function EmailListItem({ email, isSelected, isRead, onClick }: EmailListItemProps) {
  const sender = email.sender || 'Unknown';
  const recipient = email.recipients?.[0] ? extractEmailAddress(email.recipients[0]) : '';

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => e.key === 'Enter' && onClick()}
      className={clsx(
        'w-full text-left px-4 py-3 border-b border-gray-100 dark:border-gray-800 transition-colors relative cursor-pointer',
        isSelected
          ? 'bg-blue-600 text-white'
          : 'hover:bg-gray-50 dark:hover:bg-gray-800/60 bg-white dark:bg-gray-900'
      )}
      aria-selected={isSelected}
    >
      {/* Unread dot */}
      {!isRead && !isSelected && (
        <span className="absolute left-1.5 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-blue-500" />
      )}

      <div className="pl-1">
        {/* Subject line */}
        <div className="flex items-start justify-between gap-2">
          <p
            className={clsx(
              'text-sm leading-snug line-clamp-1 flex-1',
              isSelected
                ? 'text-white font-medium'
                : isRead
                ? 'text-gray-700 dark:text-gray-300'
                : 'text-gray-900 dark:text-white font-semibold'
            )}
          >
            {email.subject || '(No Subject)'}
          </p>
          {email.has_attachments && (
            <Paperclip
              size={12}
              className={clsx('shrink-0 mt-0.5', isSelected ? 'text-blue-200' : 'text-gray-400')}
            />
          )}
        </div>

        {/* Attachment chips — shown below subject when attachments are known */}
        {email.attachments && email.attachments.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-1" onClick={(e) => e.stopPropagation()}>
            {email.attachments.map((att, i) => (
              <a
                key={att.id || i}
                href={`/api/emails/${email.id}/attachments/${att.id || i}`}
                download={att.filename}
                title={`Download ${att.filename}`}
                className={clsx(
                  'inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium transition-colors max-w-[120px]',
                  isSelected
                    ? 'bg-blue-500/40 text-blue-100 hover:bg-blue-500/60'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                )}
              >
                {attachmentIcon(att.content_type)}
                <span className="truncate">{att.filename}</span>
                <Download size={9} className="shrink-0 opacity-70" />
              </a>
            ))}
          </div>
        )}

        {/* Sender */}
        <p
          className={clsx(
            'text-xs mt-0.5 line-clamp-1',
            isSelected ? 'text-blue-100' : 'text-gray-500 dark:text-gray-500'
          )}
        >
          {sender}
        </p>

        {/* Recipient + timestamp */}
        <div className="flex items-center justify-between mt-0.5">
          <p
            className={clsx(
              'text-xs line-clamp-1 flex-1',
              isSelected ? 'text-blue-200' : 'text-gray-400 dark:text-gray-600'
            )}
          >
            to: &lt;{recipient}&gt;
          </p>
          <span
            className={clsx(
              'text-xs shrink-0 ml-2',
              isSelected ? 'text-blue-200' : 'text-gray-400 dark:text-gray-600'
            )}
          >
            {formatRelativeTime(email.date)}
          </span>
        </div>
      </div>
    </div>
  );
}
