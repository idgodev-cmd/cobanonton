import { Suspense } from "react";
import Container from "../../components/layout/Container";
import SearchResults from "../../components/sections/SearchResults";
import ExploreContent from "../../components/sections/ExploreContent";
import Skeleton from "../../components/ui/Skeleton";

function SearchSkeleton() {
  return (
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
  );
}

export async function generateMetadata({ searchParams }) {
  const params = await searchParams;
  const query = params?.q || "";
  if (!query) return { title: "Explore - Anime & Drama" };
  return {
    title: `Hasil pencarian "${query}"`,
  };
}

export default async function SearchPage({ searchParams }) {
  const params = await searchParams;
  const query = params?.q || "";

  return (
    <Container>
      <div className="py-6">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold">
            {query ? `Hasil pencarian "${query}"` : "Jelajahi Konten"}
          </h1>
          {!query && (
            <p className="mt-1 text-sm text-muted">
              Temukan anime dan drama favorit kamu
            </p>
          )}
        </div>

        {query ? (
          <Suspense key={query} fallback={<SearchSkeleton />}>
            <SearchResults query={query} />
          </Suspense>
        ) : (
          <ExploreContent />
        )}
      </div>
    </Container>
  );
}
