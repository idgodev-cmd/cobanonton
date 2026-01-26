import Container from "../../components/layout/Container";
import Skeleton from "../../components/ui/Skeleton";

export default function DetailLoading() {
  return (
    <Container>
      <div className="py-6">
        {/* Header skeleton */}
        <div className="ios-surface ios-ring overflow-hidden">
          <div className="flex flex-col gap-4 p-5 sm:flex-row">
            <Skeleton className="h-72 w-full shrink-0 sm:w-48" />
            
            <div className="flex-1">
              <Skeleton className="h-8 w-3/4" />
              <Skeleton className="mt-2 h-4 w-1/2" />
              
              <div className="mt-3 flex flex-wrap gap-2">
                <Skeleton className="h-6 w-20" />
                <Skeleton className="h-6 w-24" />
                <Skeleton className="h-6 w-16" />
              </div>
              
              <div className="mt-4 space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
              </div>
              
              <div className="mt-4 flex flex-wrap gap-2">
                <Skeleton className="h-6 w-16" />
                <Skeleton className="h-6 w-20" />
                <Skeleton className="h-6 w-24" />
              </div>
            </div>
          </div>
          
          <div className="border-t border-black/5 p-5 dark:border-white/5">
            <Skeleton className="h-6 w-24" />
            <div className="mt-2 space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          </div>
        </div>

        {/* Episodes skeleton */}
        <div className="mt-6">
          <Skeleton className="mb-3 h-6 w-24" />
          <div className="space-y-2">
            {Array.from({ length: 8 }).map((_, idx) => (
              <div key={idx} className="ios-surface ios-ring p-4">
                <Skeleton className="h-5 w-24" />
                <Skeleton className="mt-2 h-4 w-32" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </Container>
  );
}
