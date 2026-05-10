import { useState, useCallback, useEffect, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ChevronRight } from "lucide-react";
import EmailList from "../components/inbox/EmailList";
import EmailPreview from "../components/inbox/EmailPreview";
import EmptyState from "../components/common/EmptyState";
import { emailsApi } from "../services/api";
import { useReadState } from "../hooks/useReadState";
import { useToast } from "../context/ToastContext";
import type { EmailSummary } from "../types";

const ENV_LABELS: Record<string, string> = {
  "dev-environment": "Dev Environment",
  "stage-environment": "Stage Environment",
  "uat-environment": "UAT Environment",
  "local-environment": "Local Environment",
};

const PROJECT_LABELS: Record<string, string> = {
  "keka-hr": "Keka HR",
  "keka-bizz": "Keka Bizz",
};

export default function InboxPage() {
  const { projectId = "", envSlug = "" } = useParams<{
    projectId: string;
    envSlug: string;
  }>();
  const { isRead, markRead, markUnread, markAllRead } = useReadState();
  const { addToast } = useToast();

  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState<string | undefined>();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const envLabel = ENV_LABELS[envSlug] || envSlug;
  const projectLabel = PROJECT_LABELS[projectId] || projectId;

  // Reset selection when route changes
  const prevRouteRef = useRef({ projectId, envSlug });
  useEffect(() => {
    const prev = prevRouteRef.current;
    if (prev.projectId !== projectId || prev.envSlug !== envSlug) {
      prevRouteRef.current = { projectId, envSlug };
      setSelectedId(undefined);
      setSearch("");
    }
  }, [projectId, envSlug]);

  // Single query — fetch all emails at once, no pagination
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["emails", projectId, envSlug, search],
    queryFn: () =>
      emailsApi.list({
        project: projectId,
        environment: envLabel,
        search: search || undefined,
        limit: 200,
      }),
    staleTime: 30 * 1000,
    refetchOnWindowFocus: false,
  });

  const emails: EmailSummary[] = data?.emails ?? [];

  // Auto-select first email when list loads
  useEffect(() => {
    if (!selectedId && emails.length > 0) {
      setSelectedId(emails[0].id);
      markRead(emails[0].id);
    }
  }, [emails, selectedId, markRead]);

  // Auto-refresh every 30s in background (silent, no spinner)
  useEffect(() => {
    const interval = setInterval(() => refetch(), 30_000);
    return () => clearInterval(interval);
  }, [refetch]);

  const handleSelect = useCallback(
    (email: EmailSummary) => {
      setSelectedId(email.id);
      markRead(email.id);
    },
    [markRead]
  );

  // Refresh: show shimmer, fetch, clear shimmer
  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    setSelectedId(undefined);
    await refetch();
    setIsRefreshing(false);
  }, [refetch]);

  const handleSearchChange = useCallback((v: string) => {
    setSearch(v);
    setSelectedId(undefined);
  }, []);

  const handleMarkAllRead = useCallback(() => {
    markAllRead(emails.map((e) => e.id));
    addToast("All messages have been marked as read", "success");
  }, [emails, markAllRead, addToast]);

  const selectedSubject = emails.find((e) => e.id === selectedId)?.subject;

  return (
    <div className="flex flex-col h-full">
      {/* Breadcrumb */}
      <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400 shrink-0">
        <Link
          to="/"
          className="hover:text-gray-800 dark:hover:text-white transition-colors"
        >
          Inbox
        </Link>
        <ChevronRight size={14} />
        <span className="text-gray-700 dark:text-gray-300">{projectLabel}</span>
        <ChevronRight size={14} />
        <span
          className="text-gray-900 dark:text-white font-medium truncate max-w-xs"
          title={selectedSubject ?? envLabel}
        >
          {selectedSubject ?? envLabel}
        </span>
      </div>

      {/* Two-panel layout */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left: Email list */}
        <div className="w-80 shrink-0 flex flex-col overflow-hidden">
          <EmailList
            emails={emails}
            isLoading={isLoading}
            isRefreshing={isRefreshing}
            isError={isError}
            selectedId={selectedId}
            search={search}
            onSearchChange={handleSearchChange}
            onRefresh={handleRefresh}
            onSelect={handleSelect}
            isRead={isRead}
            onRetry={handleRefresh}
            onMarkAllRead={handleMarkAllRead}
          />
        </div>

        {/* Right: Preview */}
        <div className="flex-1 overflow-hidden">
          {selectedId ? (
            <EmailPreview
              emailId={selectedId}
              isRead={isRead(selectedId)}
              onToggleRead={() => {
                if (isRead(selectedId)) markUnread(selectedId);
                else markRead(selectedId);
              }}
            />
          ) : (
            <EmptyState
              message="Select an email to preview"
              description="Choose an email from the list on the left."
            />
          )}
        </div>
      </div>
    </div>
  );
}
