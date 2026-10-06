import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, Home, List, Map as MapIcon, Maximize2, Minimize2, Search } from "lucide-react";
import { properties, type PType } from "@/lib/data";
import { shortDZD, useI18n } from "@/lib/i18n";
import { LazyMap } from "@/components/LazyMap";
import { PropertyCard } from "@/components/PropertyCard";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/search")({
  head: () => ({
    meta: [
      { title: "FAZTI — Recherche immobilière sur carte en Algérie" },
      { name: "description", content: "Trouvez villas, appartements et maisons à Oran, Alger, Constantine et partout en Algérie, avec visites 360°." },
      { property: "og:title", content: "FAZTI — Recherche immobilière sur carte" },
      { property: "og:description", content: "Biens à vendre en Algérie, prix en DZD, visites virtuelles 360°." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: SearchPage,
});

function SearchPage() {
  const { t, lang } = useI18n();
  const navigate = useNavigate();
  const [q, setQ] = useState("");
  const [submitted, setSubmitted] = useState({ q: "", type: "" as PType | "" });
  const [type, setType] = useState<PType | "">("");
  const [hover, setHover] = useState<string | null>(null);
  const [mobileView, setMobileView] = useState<"map" | "list">("map");
  const [mapFullscreen, setMapFullscreen] = useState(false);

  const results = useMemo(
    () =>
      properties.filter((p) => {
        const s = submitted.q.trim().toLowerCase();
        if (s && !`${p.city.fr} ${p.city.ar} ${p.title.fr} ${p.title.ar}`.toLowerCase().includes(s)) return false;
        if (submitted.type && p.type !== submitted.type) return false;
        return true;
      }),
    [submitted],
  );

  const points = results.map((p) => ({ id: p.id, lat: p.lat, lng: p.lng, label: shortDZD(p.price, lang) }));
  const sel = "h-9 min-w-0 bg-transparent text-sm font-semibold text-foreground outline-none";

  const searchBar = (
    <form onSubmit={(event) => { event.preventDefault(); setSubmitted({ q, type }); }} className="pointer-events-auto mx-auto grid w-full max-w-3xl grid-cols-[minmax(0,1fr)_auto] gap-1 rounded-2xl border border-border bg-card p-1.5 shadow-float sm:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)_auto] sm:rounded-full">
      <label className="flex min-w-0 items-center gap-2 px-3">
        <MapPin className="h-4 w-4 shrink-0 text-primary" />
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={t("location")} className={`${sel} w-full placeholder:text-muted-foreground`} list="cities" />
        <datalist id="cities">
          {["Oran", "Alger", "Constantine", "Aïn Témouchent", "Tlemcen", "وهران", "الجزائر"].map((c) => <option key={c} value={c} />)}
        </datalist>
      </label>
      <label className="flex min-w-0 items-center gap-2 border-s border-border px-3">
        <Home className="h-4 w-4 shrink-0 text-primary" />
        <select value={type} onChange={(e) => setType(e.target.value as PType | "")} className={`${sel} w-full`}>
          <option value="">{t("anyType")}</option>
          {(["apartment", "villa", "house", "duplex"] as const).map((k) => <option key={k} value={k}>{t(k)}</option>)}
        </select>
      </label>
      <Button type="submit" aria-label={t("search")} className="col-span-2 flex h-10 items-center justify-center rounded-xl bg-primary px-5 text-primary-foreground transition-colors hover:bg-foreground sm:col-span-1 sm:w-10 sm:rounded-full sm:px-0">
        <Search className="h-4 w-4" />
      </Button>
    </form>
  );

  const list = (
    <div className="space-y-3 p-4">
      <div className="flex items-center justify-between text-sm font-bold text-foreground">
        <span>{results.length} {t("results")}</span>
        <MapIcon className="h-4 w-4 text-primary" />
      </div>
      {results.length === 0 && <p className="py-8 text-center text-sm text-muted-foreground">{lang === "ar" ? "لا توجد عقارات مطابقة" : "Aucun bien ne correspond à votre recherche."}</p>}
      <AnimatePresence mode="popLayout">
        {results.map((p, i) => (
          <motion.div key={p.id} layout initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ delay: i * 0.03 }}>
            <PropertyCard p={p} active={hover === p.id} onHover={setHover} />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );

  return (
    <main className="relative flex h-[calc(100vh-3.5rem)] overflow-hidden">
      {/* Desktop list 35% */}
      <aside className={`${mapFullscreen ? "hidden" : "hidden lg:block"} w-[35%] overflow-y-auto border-e border-border bg-background`}>{list}</aside>
      {/* Map 65% (full on mobile) */}
      <section className="relative flex-1">
        <LazyMap points={points} activeId={hover} onHover={setHover} onSelect={(id) => navigate({ to: "/property/$id", params: { id } })} fitPoints />
        <div className="pointer-events-none absolute inset-x-0 top-0 z-[500] p-3">{searchBar}</div>
        <Button size="icon" title={lang === "ar" ? "توسيع أو تصغير الخريطة" : "Agrandir ou réduire la carte"} onClick={() => setMapFullscreen((value) => !value)} aria-label={mapFullscreen ? "Réduire la carte" : "Agrandir la carte"} className="absolute bottom-24 end-4 z-[650] grid h-12 w-12 place-items-center rounded-full bg-primary text-primary-foreground shadow-float transition-transform hover:scale-105 lg:bottom-5">
          {mapFullscreen ? <Minimize2 className="h-5 w-5" /> : <Maximize2 className="h-5 w-5" />}
        </Button>
      </section>
      {/* Mobile bottom drawer */}
      <motion.div
        className={`${mapFullscreen ? "hidden" : "absolute"} inset-x-0 bottom-0 z-[600] rounded-t-2xl border-t border-border bg-background shadow-float lg:hidden`}
        animate={{ height: mobileView === "list" ? "75%" : "5.5rem" }}
        transition={{ type: "spring", damping: 28, stiffness: 260 }}
      >
        <Button variant="ghost" onClick={() => setMobileView(mobileView === "map" ? "list" : "map")} className="flex h-14 w-full flex-col items-center gap-1 pt-2 pb-3">
          <span className="h-1 w-10 rounded-full bg-ring" />
          <span className="flex items-center gap-2 text-sm font-bold text-foreground">
            {mobileView === "map" ? <List className="h-4 w-4" /> : <MapIcon className="h-4 w-4" />}
            {results.length} {t("results")} · {mobileView === "map" ? t("showList") : t("showMap")}
          </span>
        </Button>
        <div className="h-[calc(100%-3.5rem)] overflow-y-auto">{list}</div>
      </motion.div>
    </main>
  );
}
