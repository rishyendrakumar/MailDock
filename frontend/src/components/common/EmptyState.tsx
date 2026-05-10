import { Inbox } from 'lucide-react';

interface EmptyStateProps {
  message?: string;
  description?: string;
}

export default function EmptyState({
  message = 'No emails found',
  description = 'Try adjusting your search or checking back later.',
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center h-full gap-3 text-center p-8">
      <Inbox className="text-gray-300 dark:text-gray-600" size={48} />
      <p className="text-gray-700 dark:text-gray-300 font-medium">{message}</p>
      <p className="text-gray-400 dark:text-gray-500 text-sm max-w-xs">{description}</p>
    </div>
  );
}
