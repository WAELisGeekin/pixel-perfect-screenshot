import { Link } from "@tanstack/react-router";
import { Building2, Heart, Plus, LayoutDashboard, Search } from "lucide-react";
import { AGENCY_NAME } from "@/lib/data";
import { useFavorites } from "@/lib/favorites";
import { useI18n } from "@/lib/i18n";

export function Header() {
  const { lang, setLang, tx } = useI18n();
  const favs = useFavorites();
  return (
    <header className="sticky top-0 z-[1100] border-b border-border/80 bg-card/95 shadow-[0_4px_20px_-18px_oklch(0.27_0.025_250/50%)] backdrop-blur-xl">
      <div className="mx-auto flex h-[4.25rem] max-w-7xl items-center gap-3 px-3 sm:px-6">
        <Link to="/" className="flex min-w-0 items-center gap-2.5 text-foreground">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-primary text-primary-foreground shadow-sm"><Building2 className="h-5 w-5" /></span>
          <span className="truncate text-lg font-extrabold tracking-tight sm:text-xl">{AGENCY_NAME}</span>
        </Link>
        <nav aria-label={tx("Navigation principale", "التنقل الرئيسي")} className="ms-7 hidden items-center gap-1 md:flex">
          <Link to="/" activeOptions={{ exact: true }} activeProps={{ className: "bg-secondary text-foreground" }} className="flex items-center gap-2 rounded-lg px-3.5 py-2 text-sm font-semibold text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground">
            <Search className="h-4 w-4" />{tx("Explorer", "اكتشف")}
          </Link>
          <Link to="/agent" activeProps={{ className: "bg-secondary text-foreground" }} className="flex items-center gap-2 rounded-lg px-3.5 py-2 text-sm font-semibold text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground">
            <LayoutDashboard className="h-4 w-4" />{tx("Espace agence", "فضاء الوكالة")}
          </Link>
        </nav>
        <div className="ms-auto flex items-center gap-1.5 sm:gap-2">
          <Link to="/vendre" className="inline-flex h-10 items-center gap-2 rounded-lg bg-primary px-3 text-sm font-bold text-primary-foreground shadow-sm transition-all hover:-translate-y-0.5 hover:bg-primary/90 hover:shadow-md sm:px-4">
            <Plus className="h-4 w-4" /><span className="hidden sm:inline">{tx("Déposer une annonce", "أضف إعلانًا")}</span><span className="sm:hidden">{tx("Déposer", "أضف")}</span>
          </Link>
          <Link to="/favoris" aria-label={tx("Favoris", "المفضلة")} className="relative grid h-10 w-10 place-items-center rounded-lg text-foreground transition-colors hover:bg-secondary">
          <Heart className="h-5 w-5" />
          {favs.length > 0 && <span className="absolute -end-0.5 -top-0.5 grid h-4 min-w-4 place-items-center rounded-full bg-accent px-1 text-[10px] font-bold text-accent-foreground">{favs.length}</span>}
          </Link>
        <div className="flex rounded-lg border border-border bg-background p-0.5 text-xs font-bold">
          {(["fr", "ar"] as const).map((l) => (
            <button key={l} onClick={() => setLang(l)} className={`rounded-md px-2.5 py-1.5 transition-colors ${lang === l ? "bg-foreground text-deep-foreground shadow-sm" : "text-muted-foreground hover:bg-secondary hover:text-foreground"}`}>
              {l === "fr" ? "FR" : "ع"}
            </button>
          ))}
        </div>
        </div>
      </div>
    </header>
  );
}
