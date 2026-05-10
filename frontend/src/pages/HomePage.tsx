import { useQuery } from '@tanstack/react-query';
import { projectsApi } from '../services/api';
import ProjectCard from '../components/home/ProjectCard';
import { ProjectSkeleton } from '../components/common/Skeleton';
import ErrorState from '../components/common/ErrorState';

export default function HomePage() {
  const { data: projects, isLoading, isError, refetch } = useQuery({
    queryKey: ['projects'],
    queryFn: projectsApi.list,
    staleTime: 60 * 1000,
  });

  return (
    <div className="h-full overflow-y-auto scrollbar-thin bg-gray-50 dark:bg-gray-950">
      <div className="max-w-5xl mx-auto px-6 py-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-8">Projects</h1>

        {isLoading ? (
          <ProjectSkeleton />
        ) : isError ? (
          <ErrorState
            message="Failed to load projects. Make sure the backend is running."
            onRetry={refetch}
          />
        ) : (
          <div className="space-y-8">
            {(projects ?? []).map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
