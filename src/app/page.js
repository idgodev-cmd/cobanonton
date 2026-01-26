import { Suspense } from "react";
import Hero from "../components/sections/Hero";
import HomeContent from "../components/sections/HomeContent";
import Categories from "../components/sections/Categories";
import Container from "../components/layout/Container";
import { FeaturedSkeleton, TrendingSkeleton } from "../components/sections/HomeSkeleton";

export default function Home() {
  return (
    <div className="pb-10">
      <Hero />
      <Container>
        <Suspense fallback={
          <>
            <FeaturedSkeleton />
            <TrendingSkeleton />
          </>
        }>
          <HomeContent />
        </Suspense>
        <Categories />
      </Container>
    </div>
  );
}
