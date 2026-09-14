interface SwipeCardProps {
  imageUrl?: string | null;
  badgeTopLeft?: string;
  badgeTopRight?: string;
  eyebrow: string;
  title: string;
  meta: { icon: string; label: string }[];
  tags: string[];
  footerRight?: string;
}

/** Carte de découverte façon swipe (brief : "cartes photo, infos clés, accepter/passer"). */
export function SwipeCard({
  imageUrl,
  badgeTopLeft,
  badgeTopRight,
  eyebrow,
  title,
  meta,
  tags,
  footerRight,
}: SwipeCardProps) {
  return (
    <div className="relative h-full w-full select-none overflow-hidden rounded-3xl shadow-[0_20px_50px_-12px_rgba(28,23,18,0.35)] ring-1 ring-noir-chaud/5">
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={
          imageUrl
            ? { backgroundImage: `url(${imageUrl})` }
            : { background: "linear-gradient(160deg, #6B2737 0%, #1C1712 55%, #A8793E 100%)" }
        }
      />
      <div className="absolute inset-0 bg-gradient-to-t from-noir-chaud via-noir-chaud/20 to-transparent" />
      <div className="absolute inset-0 ring-1 ring-inset ring-ivoire/10" />

      <div className="absolute inset-x-0 top-0 flex justify-between p-4">
        {badgeTopLeft && (
          <span className="rounded-full bg-noir-chaud/70 px-3 py-1 text-xs text-ivoire backdrop-blur">
            {badgeTopLeft}
          </span>
        )}
        {badgeTopRight && (
          <span className="rounded-full bg-bordeaux/80 px-3 py-1 text-xs text-ivoire backdrop-blur">
            {badgeTopRight}
          </span>
        )}
      </div>

      <div className="absolute inset-x-0 bottom-0 p-5 text-ivoire">
        <p className="text-xs uppercase tracking-widest text-ivoire/70">{eyebrow}</p>
        <h2 className="mt-1 font-serif text-3xl leading-tight">{title}</h2>

        <div className="mt-4 flex flex-wrap gap-x-5 gap-y-1 text-sm text-ivoire/90">
          {meta.map((m) => (
            <span key={m.label} className="flex items-center gap-1.5">
              <span aria-hidden>{m.icon}</span>
              {m.label}
            </span>
          ))}
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap gap-2">
            {tags.map((t) => (
              <span key={t} className="rounded-full border border-ivoire/30 bg-ivoire/10 px-3 py-1 text-xs backdrop-blur-sm">
                {t}
              </span>
            ))}
          </div>
          {footerRight && <span className="text-sm text-ivoire/80">{footerRight}</span>}
        </div>
      </div>
    </div>
  );
}
