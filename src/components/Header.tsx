import { Link } from "@tanstack/react-router";
import { Heart, PlusSquare, LayoutDashboard } from "lucide-react";
import { AGENCY_NAME } from "@/lib/data";
import { useFavorites } from "@/lib/favorites";
import { useI18n } from "@/lib/i18n";

export function Header() {
  const { lang, setLang, tx } = useI18n();
  const favs = useFavorites();
  return (
    <header className="sticky top-0 z-[1100] flex h-14 items-center gap-2 border-b border-border bg-card px-3 sm:px-4">
      <Link to="/" className="min-w-0 truncate text-lg font-extrabold text-foreground sm:text-xl">{AGENCY_NAME}</Link>
      <div className="ms-auto flex items-center gap-1">
        <Link to="/vendre" className="flex items-center gap-1 rounded-md px-2 py-1.5 text-xs font-semibold text-primary hover:bg-secondary">
          <PlusSquare className="h-4 w-4" /><span className="hidden sm:inline">{tx("Vendre mon bien", "بيع عقارك")}</span>
        </Link>
        <Link to="/agent" aria-label={tx("Espace agence", "فضاء الوكالة")} className="rounded-md p-2 text-primary hover:bg-secondary"><LayoutDashboard className="h-4 w-4" /></Link>
        <Link to="/favoris" aria-label={tx("Favoris", "المفضلة")} className="relative rounded-md p-2 text-primary hover:bg-secondary">
          <Heart className="h-5 w-5" />
          {favs.length > 0 && <span className="absolute -end-0.5 -top-0.5 grid h-4 min-w-4 place-items-center rounded-full bg-accent px-1 text-[10px] font-bold text-accent-foreground">{favs.length}</span>}
        </Link>
        <div className="flex rounded-md border border-border p-0.5 text-xs font-bold">
          {(["fr", "ar"] as const).map((l) => (
            <button key={l} onClick={() => setLang(l)} className={`rounded px-2.5 py-1 transition-colors ${lang === l ? "bg-foreground text-deep-foreground" : "text-primary hover:bg-secondary"}`}>
              {l === "fr" ? "FR" : "ع"}
            </button>
          ))}
        </div>
      </div>
    </header>
  );
}
