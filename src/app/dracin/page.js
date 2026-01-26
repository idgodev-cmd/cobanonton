import Container from "../../components/layout/Container";
import Card from "../../components/ui/Card";

async function getDracinData() {
    try {
        const res = await fetch(
            `https://dramabos.asia/api/dramabox/api/list/1?lang=in&genre=1319`,
            { next: { revalidate: 3600 } }
        );
        if (!res.ok) return [];
        const json = await res.json();
        return json?.records || [];
    } catch (e) {
        console.error("Dracin fetch error:", e);
        return [];
    }
}

export const metadata = {
    title: "China Drama (Dracin) - COBANONTON",
    description: "Streaming Drama China (Dracin) terbaru subtitle Indonesia kualitas HD gratis tanpa iklan. Koleksi lengkap dari Dramabox hanya di COBANONTON.",
};

export default async function DracinPage() {
    const dracinData = await getDracinData();

    return (
        <div className="pb-20 pt-10">
            <Container>
                <div className="mb-12">
                    <h1 className="text-4xl font-black text-white mb-2 uppercase tracking-tighter md:text-6xl">
                        DRAMA CHINA
                    </h1>
                    <p className="text-muted font-bold tracking-[0.3em] uppercase text-[10px] md:text-sm">
                        Koleksi Dracin Terbaru Sub Indo
                    </p>
                </div>

                {dracinData.length === 0 ? (
                    <div className="text-center py-20 bg-zinc-900/30 rounded-3xl border border-white/5">
                        <p className="text-muted italic">Belum ada konten Dracin yang tersedia.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
                        {dracinData.map((item, idx) => (
                            <Card
                                key={item.bookId || idx}
                                title={item.bookName}
                                cover={item.imageUrl || item.coverWap || item.cover}
                                slug={`dr-${item.bookId}`}
                                type="Dracin"
                                episode={item.latestChapter || item.chapterCount}
                                contextPath="/dracin"
                            />
                        ))}
                    </div>
                )}
            </Container>
        </div>
    );
}
