import { Link } from "@tanstack/react-router";
import { Heart, Camera, MapPin, Clock, Building2, BedDouble, Ruler } from "lucide-react";
import { communeLabel, TYPE_LABELS, wilayaBy, type Listing } from "@/lib/data";
import { FIELDS, displayValue } from "@/lib/fields";
import { toggleFavorite, useFavorites } from "@/lib/favorites";
import { listingPrice, relativeDate, useI18n } from "@/lib/i18n";

const BADGE_KEYS = ["papers", "negotiable", "furnished", "scheme", "exchange", "landUse"];

export function keyBadges(l: Listing, lang: "fr" | "ar") {
  const out: string[] = [];
  for (const k of BADGE_KEYS) {
    const f = FIELDS.find((x) => x.key === k);
    const v = f && displayValue(f, l.fields[k], lang);
    if (f && v) out.push(f.type === "tri" ? f.label[lang] : v);
    if (out.length === 3) break;
  }
  return out;
}

export function PropertyCard({ p, active, onHover }: { p: Listing; active?: boolean; onHover?: (id: string | null) => void }) {
  const { lang, tx } = useI18n();
  const favs = useFavorites();
  const fav = favs.includes(p.id);
  const w = wilayaBy(p.wilaya);
  const badges = keyBadges(p, lang);
  return (
    <div
      onMouseEnter={() => onHover?.(p.id)}
      onMouseLeave={() => onHover?.(null)}
      className={`group relative flex min-w-0 flex-col overflow-hidden rounded-2xl border bg-card transition-all duration-300 ${active ? "border-primary/40 shadow-float ring-2 ring-primary/10" : "border-border/80 shadow-[0_10px_32px_-28px_oklch(0.27_0.025_250/55%)] hover:-translate-y-0.5 hover:border-primary/25 hover:shadow-float"}`}
    >
      <Link to="/property/$id" params={{ id: p.id }} className="relative block aspect-[4/3] shrink-0 overflow-hidden bg-secondary">
        {p.images[0]
          ? <img src={p.images[0]} alt={p.title[lang]} loading="lazy" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.04]" />
          : <div className="grid h-full w-full place-items-center bg-gradient-to-br from-secondary via-background to-accent/20 text-primary/35"><Building2 className="h-12 w-12" /></div>}
        <span className="absolute start-3 top-3 rounded-full border border-white/70 bg-card/95 px-3 py-1 text-[11px] font-extrabold tracking-wide text-primary shadow-sm">{tx(p.listing_type === "rent" ? "À louer" : "À vendre", p.listing_type === "rent" ? "للكراء" : "للبيع")}</span>
        <span className="absolute bottom-3 start-3 flex items-center gap-1.5 rounded-full border border-white/10 bg-foreground/75 px-2.5 py-1 text-[11px] font-bold text-deep-foreground backdrop-blur-sm"><Camera className="h-3.5 w-3.5" />{p.images.length}</span>
      </Link>
      <div className="min-w-0 p-4">
        <Link to="/property/$id" params={{ id: p.id }} className="pe-8">
          <div className="text-xl font-extrabold tracking-tight text-foreground">{listingPrice(p.price, p.listing_type === "rent", lang)}</div>
          {p.listing_type === "sale" && <div className="mt-0.5 text-xs font-medium text-muted-foreground">{tx("Soit", "يعادل")} {new Intl.NumberFormat(lang === "ar" ? "ar-DZ" : "fr-DZ").format(p.price)} {lang === "ar" ? "د.ج" : "DA"}</div>}
          <div className="mt-1 line-clamp-2 text-sm font-semibold leading-5 text-foreground/85">{p.title[lang]}</div>
        </Link>
        <div className="mt-2 flex min-w-0 flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
          <span className="flex min-w-0 items-center gap-1.5"><MapPin className="h-3.5 w-3.5 shrink-0 text-primary" /><span className="truncate">{communeLabel(p.wilaya, p.commune, lang)}, {w?.[lang]}</span></span>
          <span className="flex shrink-0 items-center gap-1"><Clock className="h-3 w-3" />{relativeDate(p.createdAt, lang)}</span>
        </div>
        <div className="mt-3 flex items-center gap-3 border-y border-border/70 py-2.5 text-xs font-semibold text-muted-foreground">
          <span className="flex min-w-0 items-center gap-1.5 truncate"><Building2 className="h-3.5 w-3.5 shrink-0 text-primary" /><span className="truncate">{TYPE_LABELS[p.type][lang]}</span></span>
          {p.rooms > 0 && <span className="flex shrink-0 items-center gap-1.5"><BedDouble className="h-3.5 w-3.5 text-primary" />F{p.rooms}{p.rooms >= 5 ? "+" : ""}</span>}
          <span className="flex shrink-0 items-center gap-1.5"><Ruler className="h-3.5 w-3.5 text-primary" />{p.area} m²</span>
        </div>
        {badges.length > 0 && <div className="mt-2 flex flex-wrap gap-1.5">
          {badges.map((b) => <span key={b} className="rounded-full bg-secondary px-2.5 py-1 text-[10px] font-bold text-secondary-foreground">{b}</span>)}
        </div>}
      </div>
      <button
        onClick={() => toggleFavorite(p.id)}
        aria-label={fav ? tx("Retirer des favoris", "إزالة من المفضلة") : tx("Ajouter aux favoris", "أضف إلى المفضلة")}
        aria-pressed={fav}
        className="absolute end-3 top-3 grid h-9 w-9 place-items-center rounded-full bg-card/95 text-primary shadow-md transition-transform hover:scale-110"
      >
        <Heart className={`h-4 w-4 ${fav ? "fill-current text-destructive" : ""}`} />
      </button>
    </div>
  );
}
