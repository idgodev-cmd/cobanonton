import Skeleton from "../ui/Skeleton";

export function FeaturedSkeleton() {
  return (
    <section className="mt-6">
      <div className="flex items-baseline justify-between">
        <Skeleton className="h-6 w-40" />
        <Skeleton className="h-6 w-32" />
      </div>
      <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
        {Array.from({ length: 6 }).map((_, idx) => (
          <div key={idx} className="overflow-hidden rounded-lg">
            <Skeleton className="aspect-3/4 w-full" />
            <div className="p-3">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="mt-2 h-3 w-2/3" />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export function TrendingSkeleton() {
  return (
    <section className="mt-6">
      <Skeleton className="h-6 w-32" />
      <div className="mt-3 -mx-4 overflow-x-auto px-4">
        <div className="flex gap-3">
          {Array.from({ length: 6 }).map((_, idx) => (
            <div key={idx} className="w-40 shrink-0 overflow-hidden rounded-lg">
              <Skeleton className="aspect-3/4 w-full" />
              <div className="p-3">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="mt-2 h-3 w-2/3" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
