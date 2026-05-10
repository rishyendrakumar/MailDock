import clsx from 'clsx';

interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className }: SkeletonProps) {
  return (
    <div className={clsx('animate-pulse bg-gray-200 dark:bg-gray-700 rounded', className)} />
  );
}

export function EmailListSkeleton() {
  return (
    <div className="divide-y divide-gray-100 dark:divide-gray-800">
      {Array.from({ length: 10 }).map((_, i) => (
        <div key={i} className="px-4 py-3 space-y-2 animate-pulse">
          {/* Subject line with optional attachment icon */}
          <div className="flex items-center gap-2">
            <div className="h-3.5 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
            {i % 4 === 0 && (
              <div className="h-3 w-3 bg-gray-200 dark:bg-gray-700 rounded ml-auto shrink-0" />
            )}
          </div>
          {/* Sender */}
          <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
          {/* Recipient + timestamp row */}
          <div className="flex items-center justify-between">
            <div className="h-2.5 bg-gray-100 dark:bg-gray-800 rounded w-2/5" />
            <div className="h-2.5 bg-gray-100 dark:bg-gray-800 rounded w-1/5" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function ProjectSkeleton() {
  return (
    <div className="space-y-6">
      {[1, 2].map((i) => (
        <div key={i} className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800">
            <Skeleton className="h-5 w-32" />
          </div>
          <div className="divide-y divide-gray-100 dark:divide-gray-800">
            {[1, 2, 3].map((j) => (
              <div key={j} className="px-6 py-4 flex gap-4">
                <Skeleton className="h-4 w-40" />
                <Skeleton className="h-4 w-16 ml-auto" />
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-8" />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
