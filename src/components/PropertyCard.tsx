import { Link } from "@tanstack/react-router";
import { Heart, Camera, Maximize, DoorOpen, MapPin, Clock } from "lucide-react";
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
  return (
    <div
      onMouseEnter={() => onHover?.(p.id)}
      onMouseLeave={() => onHover?.(null)}
      className={`relative flex flex-col overflow-hidden rounded-md border bg-card transition-all sm:flex-row ${active ? "border-accent shadow-float" : "border-border hover:border-ring"}`}
    >
      <Link to="/property/$id" params={{ id: p.id }} className="flex shrink-0 flex-col gap-0.5 sm:w-56">
        <div className="relative aspect-[16/10] overflow-hidden bg-secondary">
          {p.images[0] && <img src={p.images[0]} alt={p.title[lang]} loading="lazy" className="h-full w-full object-cover" />}
          <span className="absolute bottom-1.5 start-1.5 flex items-center gap-1 rounded bg-foreground/80 px-1.5 py-0.5 text-[11px] font-bold text-deep-foreground"><Camera className="h-3 w-3" />{p.images.length}</span>
        </div>
        {p.images.length > 1 && (
          <div className="grid grid-cols-3 gap-0.5">
            {[1, 2, 3].map((i) => (
              <div key={i} className="aspect-[4/3] overflow-hidden bg-secondary">{p.images[i] && <img src={p.images[i]} alt="" loading="lazy" className="h-full w-full object-cover" />}</div>
            ))}
          </div>
        )}
      </Link>
      <div className="flex min-w-0 flex-1 flex-col p-3">
        <Link to="/property/$id" params={{ id: p.id }} className="pe-8">
          <div className="text-lg font-extrabold text-foreground">{listingPrice(p.price, p.listing_type === "rent", lang)}</div>
          <div className="line-clamp-2 text-sm font-semibold text-primary">{p.title[lang]}</div>
        </Link>
        <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-muted-foreground">
          <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{communeLabel(p.wilaya, p.commune, lang)}, {w?.[lang]}</span>
          <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{relativeDate(p.createdAt, lang)}</span>
        </div>
        <div className="mt-2 flex flex-wrap gap-3 text-xs font-medium text-primary">
          <span>{TYPE_LABELS[p.type][lang]}</span>
          {p.rooms > 0 && <span className="flex items-center gap-1"><DoorOpen className="h-3.5 w-3.5" />F{p.rooms}{p.rooms >= 5 ? "+" : ""}</span>}
          <span className="flex items-center gap-1"><Maximize className="h-3.5 w-3.5" />{p.area} m²</span>
        </div>
        <div className="mt-2 flex flex-wrap gap-1">
          {keyBadges(p, lang).map((b) => <span key={b} className="rounded bg-secondary px-1.5 py-0.5 text-[11px] font-semibold text-foreground">{b}</span>)}
        </div>
        <div className="mt-auto pt-2 text-xs font-bold">
          {p.publisher.kind === "agency"
            ? <span className="rounded bg-foreground px-1.5 py-0.5 text-deep-foreground">{p.publisher.name}</span>
            : <span className="rounded border border-border px-1.5 py-0.5 text-primary">{tx("Particulier", "خاص")}</span>}
        </div>
      </div>
      <button
        onClick={() => toggleFavorite(p.id)}
        aria-label={fav ? tx("Retirer des favoris", "إزالة من المفضلة") : tx("Ajouter aux favoris", "أضف إلى المفضلة")}
        aria-pressed={fav}
        className="absolute end-2 top-2 grid h-8 w-8 place-items-center rounded-full bg-card/95 text-primary shadow-sm sm:top-3"
      >
        <Heart className={`h-4 w-4 ${fav ? "fill-current text-destructive" : ""}`} />
      </button>
    </div>
  );
}
