import Container from "../../components/layout/Container";
import LibraryContent from "../../components/sections/LibraryContent";

export const metadata = {
  title: "Library - Koleksi Favorit & Watchlist",
  description: "Kelola koleksi favorit dan watchlist anime dan drama kamu.",
};

export default function LibraryPage() {
  return (
    <Container>
      <div className="py-6">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold">Library Saya</h1>
          <p className="mt-1 text-sm text-muted">
            Kelola favorit dan watchlist kamu
          </p>
        </div>

        <LibraryContent />
      </div>
    </Container>
  );
}
