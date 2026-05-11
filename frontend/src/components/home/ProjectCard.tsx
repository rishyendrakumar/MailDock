import { useNavigate } from 'react-router-dom';
import { AlertCircle } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import type { ProjectResponse, EnvironmentSummary } from '../../types';
import { formatRelativeTime } from '../../utils/formatters';
import { slugify } from '../../utils/formatters';
import clsx from 'clsx';

function EllipsisMenu() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        aria-label="More options"
      >
        <svg viewBox="0 0 16 16" fill="currentColor" className="w-4 h-4">
          <circle cx="8" cy="3" r="1.5" />
          <circle cx="8" cy="8" r="1.5" />
          <circle cx="8" cy="13" r="1.5" />
        </svg>
      </button>
      {open && (
        <div className="absolute right-0 top-7 z-50 w-52 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg py-1">
          <button
            disabled
            className="w-full text-left px-4 py-2 text-sm text-gray-400 dark:text-gray-600 cursor-not-allowed flex items-center gap-2"
          >
            <svg viewBox="0 0 16 16" fill="none" className="w-3.5 h-3.5 shrink-0" stroke="currentColor" strokeWidth="1.5">
              <path d="M8 1v14M1 8h14" strokeLinecap="round" />
            </svg>
            Manage Message Limit
          </button>
        </div>
      )}
    </div>
  );
}

interface ProjectCardProps {
  project: ProjectResponse;
}

function EnvironmentRow({ env, project }: { env: EnvironmentSummary; project: ProjectResponse }) {
  const navigate = useNavigate();
  const isRedirect = !!env.redirect_to;
  const hasSenders = !!(env.senders && env.senders.length > 0);
  const isDisabled = !hasSenders && !isRedirect;

  const handleClick = () => {
    if (isRedirect && env.redirect_to) {
      navigate(`/inbox/${project.id}/${slugify(env.redirect_to + ' environment')}`);
    } else if (hasSenders) {
      navigate(`/inbox/${project.id}/${slugify(env.name)}`);
    }
  };

  return (
    <tr className="border-t border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
      <td className="px-6 py-3.5">
        <div className="flex flex-col gap-0.5">
          <button
            onClick={handleClick}
            className={clsx(
              'text-sm font-medium text-left transition-colors',
              isRedirect || hasSenders
                ? 'text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 cursor-pointer'
                : 'text-gray-400 dark:text-gray-500 cursor-default'
            )}
            disabled={isDisabled}
          >
            {env.name}
          </button>
          {isRedirect && env.redirect_message && (
            <div className="flex items-start gap-1 mt-1">
              <AlertCircle size={11} className="text-amber-500 mt-0.5 shrink-0" />
              <span className="text-xs text-amber-600 dark:text-amber-400">
                {env.redirect_message}{' '}
                <button onClick={handleClick} className="underline hover:no-underline font-medium">
                  Open Dev inbox →
                </button>
              </span>
            </div>
          )}
          {isDisabled && env.redirect_message && (
            <span className="text-xs text-gray-400 dark:text-gray-600">
              {env.redirect_message}
            </span>
          )}
        </div>
      </td>
      <td className="px-6 py-3.5 text-sm font-medium text-gray-700 dark:text-gray-300">
        {hasSenders ? env.message_count.toLocaleString() : <span className="text-gray-400 dark:text-gray-600">—</span>}
      </td>
      <td className="px-6 py-3.5 text-sm text-gray-600 dark:text-gray-400">
        {hasSenders ? env.messages_limit.toLocaleString() : <span className="text-gray-400 dark:text-gray-600">—</span>}
      </td>
      <td className="px-6 py-3.5 text-sm text-gray-500 dark:text-gray-500">
        {env.last_message ? formatRelativeTime(env.last_message) : <span className="text-gray-400 dark:text-gray-600">—</span>}
      </td>
    </tr>
  );
}

export default function ProjectCard({ project }: ProjectCardProps) {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm">
      {/* Project header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-800">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 bg-gray-100 dark:bg-gray-800 rounded flex items-center justify-center">
            <svg viewBox="0 0 16 16" fill="none" className="w-3 h-3 text-gray-500">
              <rect x="2" y="2" width="5" height="5" rx="1" fill="currentColor" />
              <rect x="9" y="2" width="5" height="5" rx="1" fill="currentColor" />
              <rect x="2" y="9" width="5" height="5" rx="1" fill="currentColor" />
              <rect x="9" y="9" width="5" height="5" rx="1" fill="currentColor" />
            </svg>
          </div>
          <h2 className="font-semibold text-gray-900 dark:text-white text-sm">{project.name}</h2>
        </div>
        <EllipsisMenu />
      </div>

      {/* Table */}
      <table className="w-full">
        <thead>
          <tr className="text-xs text-gray-400 dark:text-gray-500 uppercase tracking-wide">
            <th className="px-6 py-2.5 text-left font-medium">Inboxes</th>
            <th className="px-6 py-2.5 text-left font-medium">Total Messages</th>
            <th className="px-6 py-2.5 text-left font-medium">Messages Limit</th>
            <th className="px-6 py-2.5 text-left font-medium">Last message</th>
          </tr>
        </thead>
        <tbody>
          {project.environments.map((env) => (
            <EnvironmentRow key={env.name} env={env} project={project} />
          ))}
        </tbody>
      </table>
    </div>
  );
}
