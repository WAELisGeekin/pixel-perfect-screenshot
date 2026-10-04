import { Link } from "@tanstack/react-router";
import { BedDouble, Bath, Maximize, Rotate3d } from "lucide-react";
import type { Property } from "@/lib/data";
import { formatDZD, useI18n } from "@/lib/i18n";

export function PropertyCard({ p, active, onHover }: { p: Property; active?: boolean; onHover?: (id: string | null) => void }) {
  const { lang, t } = useI18n();
  return (
    <Link
      to="/property/$id"
      params={{ id: p.id }}
      onMouseEnter={() => onHover?.(p.id)}
      onMouseLeave={() => onHover?.(null)}
      className={`group block overflow-hidden rounded-md border bg-card transition-all ${active ? "border-accent shadow-float" : "border-border hover:border-ring"}`}
    >
      <div className="relative aspect-[16/10] overflow-hidden">
        <img src={p.images[0]} alt={p.title[lang]} loading="lazy" width={1280} height={864} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
        {p.has360 && (
          <span className="absolute start-2 top-2 flex items-center gap-1 rounded-md bg-card/95 px-2 py-1 text-xs font-bold text-foreground">
            <Rotate3d className="h-3.5 w-3.5" /> {t("tour360")}
          </span>
        )}
      </div>
      <div className="p-3">
        <div className="text-lg font-extrabold text-foreground">{formatDZD(p.price, lang)}</div>
        <div className="truncate text-sm font-semibold text-primary">{p.title[lang]}</div>
        <div className="truncate text-xs text-muted-foreground">{p.city[lang]}</div>
        <div className="mt-2 flex gap-3 text-xs font-medium text-primary">
          <span className="flex items-center gap-1"><BedDouble className="h-3.5 w-3.5" />{p.beds} {t("beds")}</span>
          <span className="flex items-center gap-1"><Bath className="h-3.5 w-3.5" />{p.baths} {t("baths")}</span>
          <span className="flex items-center gap-1"><Maximize className="h-3.5 w-3.5" />{p.area} {t("area")}</span>
        </div>
      </div>
    </Link>
  );
}
