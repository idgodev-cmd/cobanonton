import { Suspense } from "react";
import Container from "../../../components/layout/Container";
import ListTabs from "../../../components/layout/ListTabs";
import DramaList from "../../../components/sections/DramaList";
import Skeleton from "../../../components/ui/Skeleton";

function DramaListSkeleton() {
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

export const metadata = {
  title: "Semua Drama - Xenaflix",
  description: "Jelajahi koleksi lengkap drama dengan subtitle Indonesia",
};

export default function DramaListPage() {
  return (
    <Container>
      <div className="py-6">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold">Semua Drama</h1>
          <p className="mt-1 text-sm text-muted">
            Koleksi lengkap drama dengan subtitle Indonesia
          </p>
        </div>

        <ListTabs />

        <Suspense fallback={<DramaListSkeleton />}>
          <DramaList />
        </Suspense>
      </div>
    </Container>
  );
}
