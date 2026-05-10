import { formatDistanceToNow, parseISO, isValid } from 'date-fns';

export function formatRelativeTime(dateStr?: string): string {
  if (!dateStr) return '—';
  try {
    const d = parseISO(dateStr);
    if (!isValid(d)) return dateStr;
    return formatDistanceToNow(d, { addSuffix: true });
  } catch {
    return dateStr;
  }
}

export function formatBytes(bytes?: number): string {
  if (bytes === undefined || bytes === null) return '';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

export function extractEmailAddress(str?: string): string {
  if (!str) return '';
  const match = str.match(/<([^>]+)>/);
  return match ? match[1] : str;
}

export function extractDisplayName(str?: string): string {
  if (!str) return '';
  const match = str.match(/^(.+?)\s*</);
  return match ? match[1].trim() : str;
}

export function slugify(str: string): string {
  return str.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
}
