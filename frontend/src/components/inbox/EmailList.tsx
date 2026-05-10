import { useRef, useEffect } from "react";
import { RefreshCw, Inbox } from "lucide-react";
import SearchBar from "./SearchBar";
import EmailListItem from "./EmailListItem";
import { EmailListSkeleton } from "../common/Skeleton";
import EmptyState from "../common/EmptyState";
import ErrorState from "../common/ErrorState";
import type { EmailSummary } from "../../types";

interface EmailListProps {
  emails: EmailSummary[];
  isLoading: boolean;
  isRefreshing: boolean;
  isError: boolean;
  selectedId?: string;
  search: string;
  onSearchChange: (v: string) => void;
  onRefresh: () => void;
  onSelect: (email: EmailSummary) => void;
  isRead: (id: string) => boolean;
  onRetry: () => void;
  onMarkAllRead: () => void;
}

export default function EmailList({
  emails,
  isLoading,
  isRefreshing,
  isError,
  selectedId,
  search,
  onSearchChange,
  onRefresh,
  onSelect,
  isRead,
  onRetry,
  onMarkAllRead,
}: EmailListProps) {
  const listRef = useRef<HTMLDivElement>(null);
  const showSkeleton = isLoading || isRefreshing;
  const isSpinning = isLoading || isRefreshing;

  // Scroll to top when list reloads
  useEffect(() => {
    if (!isLoading && !isRefreshing) {
      listRef.current?.scrollTo({ top: 0 });
    }
  }, [isLoading, isRefreshing]);

  return (
    <div className="flex flex-col h-full border-r border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
      {/* Toolbar */}
      <div className="sticky top-0 z-10 px-3 py-2.5 border-b border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 flex items-center gap-2">
        <SearchBar value={search} onChange={onSearchChange} placeholder="Search..." />
        <button
          onClick={onRefresh}
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400 transition-colors disabled:opacity-40"
          aria-label="Refresh"
          title="Refresh"
          disabled={isSpinning}
        >
          <RefreshCw size={15} className={isSpinning ? "animate-spin" : ""} />
        </button>
        <button
          onClick={onMarkAllRead}
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400 transition-colors cursor-pointer"
          aria-label="Mark all as read"
          title="Mark all as read"
        >
          <Inbox size={15} />
        </button>
      </div>

      {/* Count badge */}
      {!showSkeleton && !isError && emails.length > 0 && (
        <div className="px-4 py-1.5 border-b border-gray-50 dark:border-gray-800 bg-gray-50 dark:bg-gray-900">
          <span className="text-xs text-gray-400 dark:text-gray-600">
            {emails.length} email{emails.length !== 1 ? "s" : ""}
          </span>
        </div>
      )}

      {/* List body */}
      <div ref={listRef} className="flex-1 overflow-y-auto scrollbar-thin">
        {showSkeleton ? (
          <EmailListSkeleton />
        ) : isError ? (
          <ErrorState
            message="Failed to load emails. Check your connection or try again."
            onRetry={onRetry}
          />
        ) : emails.length === 0 ? (
          <EmptyState
            message="No emails found"
            description={
              search
                ? "Try a different search term."
                : "No emails in this inbox yet."
            }
          />
        ) : (
          emails.map((email) => (
            <EmailListItem
              key={email.id}
              email={email}
              isSelected={email.id === selectedId}
              isRead={isRead(email.id)}
              onClick={() => onSelect(email)}
            />
          ))
        )}
      </div>
    </div>
  );
}
