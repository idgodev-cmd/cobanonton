import Container from "../../../components/layout/Container";
import Skeleton from "../../../components/ui/Skeleton";

export default function WatchLoading() {
  return (
    <Container>
      <div className="py-6">
        <Skeleton className="h-7 w-3/4" />
        
        <div className="mt-4 overflow-hidden rounded-lg">
          <Skeleton className="aspect-video w-full" />
        </div>

        <div className="mt-6">
          <Skeleton className="h-32 w-full" />
        </div>
      </div>
    </Container>
  );
}
