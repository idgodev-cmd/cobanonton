import Container from "../../components/layout/Container";
import Card from "../../components/ui/Card";
import Image from "next/image";

async function getRankData() {
    try {
        const res = await fetch(
            `https://dramabos.asia/api/dramabox/api/rank/1?lang=in`,
            { next: { revalidate: 3600 } }
        );
        if (!res.ok) return [];
        const json = await res.json();
        return json?.data?.list || [];
    } catch (e) {
        return [];
    }
}

export const metadata = {
    title: "Top 10 Chart",
    description: "Daftar 10 drama dan anime terpopuler hari ini di COBANONTON.",
};

export default async function RankPage() {
    const rankData = await getRankData();

    return (
        <div className="pb-20 pt-10">
            <Container>
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-black text-white mb-2 uppercase tracking-tighter md:text-6xl">
                        TOP 10 CHART
                    </h1>
                    <p className="text-muted font-bold tracking-[0.3em] uppercase text-[10px] md:text-sm">
                        Populer di Indonesia Hari Ini
                    </p>
                </div>

                <div className="max-w-4xl mx-auto space-y-4">
                    {rankData.slice(0, 10).map((item, idx) => (
                        <div
                            key={item.bookId || idx}
                            className="flex items-center gap-4 bg-zinc-900/50 hover:bg-zinc-800/50 p-4 rounded-xl transition-all group border border-white/5 hover:border-primary/20 relative overflow-hidden"
                        >
                            {/* Number Background */}
                            <span className={`text-6xl md:text-8xl font-black italic absolute left-2 -bottom-2 opacity-10 transition-opacity group-hover:opacity-20 ${idx < 3 ? 'text-primary' : 'text-white'}`}>
                                {idx + 1}
                            </span>

                            <div className="text-4xl md:text-6xl font-black w-16 md:w-24 text-center shrink-0 z-10">
                                <span className={idx < 3 ? 'text-primary drop-shadow-[0_0_15px_rgba(229,9,20,0.4)]' : 'text-white/20'}>
                                    {idx + 1}
                                </span>
                            </div>

                            <div className="relative w-20 md:w-24 shrink-0 aspect-2/3 rounded-md overflow-hidden shadow-xl z-10 transition-transform group-hover:scale-105">
                                <Image
                                    src={item.imageUrl || item.cover}
                                    alt={item.bookName}
                                    fill
                                    className="object-cover"
                                />
                            </div>

                            <div className="flex-1 min-w-0 z-10">
                                <h3 className="text-lg md:text-2xl font-black text-white truncate mb-2 group-hover:text-primary transition-colors">
                                    {item.bookName}
                                </h3>
                                <div className="flex flex-wrap items-center gap-2 md:gap-4">
                                    <span className="bg-zinc-800 text-muted px-2 py-0.5 rounded text-[10px] md:text-xs font-bold uppercase tracking-wider">
                                        {item.category || "Drama"}
                                    </span>
                                    <div className="flex items-center gap-1 text-primary text-[10px] md:text-xs font-black">
                                        <svg className="w-3 h-3 fill-current" viewBox="0 0 24 24"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" /></svg>
                                        <span>{item.score || "9.8"} MATCH</span>
                                    </div>
                                </div>
                            </div>

                            <div className="hidden md:block shrink-0 z-10 px-4">
                                <div className="w-12 h-12 rounded-full border-2 border-white/10 flex items-center justify-center group-hover:border-primary group-hover:bg-primary/10 transition-all">
                                    <svg className="w-6 h-6 text-white group-hover:text-primary ml-1" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </Container>
        </div>
    );
}
