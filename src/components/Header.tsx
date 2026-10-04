import { Link } from "@tanstack/react-router";
import { Search, PlusSquare, LayoutDashboard } from "lucide-react";
import logo from "@/assets/fazti-dark.png.asset.json";
import { useI18n } from "@/lib/i18n";

export function Header() {
  const { t, lang, setLang } = useI18n();
  const links = [
    { to: "/" as const, label: t("search"), icon: Search },
    { to: "/list-property" as const, label: t("sell"), icon: PlusSquare },
    { to: "/agent" as const, label: t("agent"), icon: LayoutDashboard },
  ];
  return (
    <header className="sticky top-0 z-[1100] grid h-14 grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 border-b border-border bg-card px-4">
      <Link to="/" className="shrink-0" aria-label="FAZTI">
        <img src={logo.url} alt="FAZTI" className="h-5 w-auto" />
      </Link>
      <nav className="flex min-w-0 justify-center gap-1">
        {links.map((l) => (
          <Link
            key={l.to}
            to={l.to}
            activeOptions={{ exact: true }}
            className="flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-semibold text-primary transition-colors hover:bg-secondary"
            activeProps={{ className: "bg-accent/40 text-foreground" }}
          >
            <l.icon className="h-4 w-4 shrink-0" />
            <span className="hidden sm:inline">{l.label}</span>
          </Link>
        ))}
      </nav>
      <div className="flex shrink-0 rounded-md border border-border p-0.5 text-xs font-bold">
        {(["fr", "ar"] as const).map((l) => (
          <button
            key={l}
            onClick={() => setLang(l)}
            className={`rounded px-2.5 py-1 transition-colors ${lang === l ? "bg-foreground text-deep-foreground" : "text-primary hover:bg-secondary"}`}
          >
            {l === "fr" ? "FR" : "ع"}
          </button>
        ))}
      </div>
    </header>
  );
}
