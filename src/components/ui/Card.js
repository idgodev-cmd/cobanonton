import Link from "next/link";
import Image from "next/image";

export default function Card({ title, subtitle, cover, slug, type, episode, children, className = "", contextPath }) {
  const content = (
    <>
      <div className="relative aspect-2/3 w-full overflow-hidden bg-zinc-900 group">
        {cover ? (
          <div className="relative h-full w-full">
            <Image
              src={cover}
              alt={title}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-110"
              sizes="(max-width: 768px) 50vw, (max-width: 1200px) 25vw, 15vw"
            />
          </div>
        ) : (
          <div className="h-full w-full bg-linear-to-br from-zinc-800 to-zinc-900 flex items-center justify-center">
            <span className="text-zinc-700 font-bold uppercase tracking-tighter text-xl opacity-20">COBANONTON</span>
          </div>
        )}

        {/* Quality/Episode Badge */}
        <div className="absolute top-2 left-2 flex flex-col gap-1 items-start z-10">
          <div className="flex items-center gap-1">
            <span className="bg-primary text-white text-[9px] font-black px-1.5 py-0.5 rounded shadow-lg uppercase tracking-wider">
              {episode ? `EP ${episode}` : (type === "Movie" ? "MOVIE" : "SERIES")}
            </span>
            <span className="bg-blue-600 text-white text-[9px] font-black px-1.5 py-0.5 rounded shadow-lg uppercase tracking-wider">
              {slug?.includes('netshort') ? 'NET' : 'HD'}
            </span>
          </div>
        </div>

        {/* Rating Badge */}
        <div className="absolute top-2 right-2 z-10">
          <div className="bg-black/60 backdrop-blur-md text-white text-[9px] font-bold px-1.5 py-0.5 rounded flex items-center gap-1 border border-white/5">
            <svg className="w-2 h-2 text-yellow-500 fill-current" viewBox="0 0 24 24"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" /></svg>
            9.8
          </div>
        </div>

        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity bg-black/40 flex items-center justify-center">
          <div className="w-12 h-12 rounded-full border-2 border-white flex items-center justify-center bg-black/20 backdrop-blur-sm">
            <svg className="w-6 h-6 fill-white ml-1" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
          </div>
        </div>

        <div className="absolute inset-x-0 bottom-0 h-1/2 bg-linear-to-t from-black/90 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>

      <div className="pt-3 pb-1 px-1">
        <div className="text-foreground text-[13px] font-bold truncate group-hover:text-primary transition-colors">{title}</div>
        {subtitle && (
          <div className="text-muted text-[10px] mt-0.5 font-medium truncate opacity-60 uppercase tracking-wide">{subtitle}</div>
        )}
        {children}
      </div>
    </>
  );

  const cardClasses = `group relative cursor-pointer ${className}`;

  if (slug) {
    const isDracin = slug.startsWith("dr-");
    const isEpisode = slug.includes("-episode-") || slug.match(/-ep-?\d+/i) || (isDracin && slug.split("-").length > 2);
    const isDramaSlug = slug.startsWith("drama/");
    const isDramaId = /^[0-9a-f]{24}$/i.test(slug);
    const isDrama = type === "Drama" || type === "Dracin" || isDramaSlug || isDramaId || isDracin;
    const isMovie = type === "Movie" || contextPath === "/movie";

    const normalizedSlug = !isEpisode
      ? slug.replace(/^anime-?/, "")
      : slug;

    let href;
    if (isEpisode) {
      href = `/watch/${slug}`;
    } else if (isMovie) {
      href = `/movie/${normalizedSlug}`;
    } else if (isDracin) {
      href = `/${slug}`;
    } else if (isDrama) {
      href = `/${isDramaSlug ? normalizedSlug : `drama/${normalizedSlug}`}`;
    } else {
      href = `/${normalizedSlug}`;
    }

    return (
      <Link href={href} className={cardClasses}>
        {content}
      </Link>
    );
  }

  return (
    <div className={cardClasses}>
      {content}
    </div>
  );
}
