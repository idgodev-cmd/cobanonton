import Container from "../../components/layout/Container";
import Skeleton from "../../components/ui/Skeleton";

export default function SearchLoading() {
  return (
    <Container>
      <div className="py-6">
        <div className="mb-6">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="mt-2 h-5 w-32" />
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
          {Array.from({ length: 12 }).map((_, idx) => (
            <div key={idx} className="overflow-hidden rounded-lg">
              <Skeleton className="aspect-3/4 w-full" />
              <div className="p-3">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="mt-2 h-3 w-2/3" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </Container>
  );
}
