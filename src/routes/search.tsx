import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, Home, Wallet, SlidersHorizontal, List, Map as MapIcon } from "lucide-react";
import { properties, type PType } from "@/lib/data";
import { shortDZD, useI18n } from "@/lib/i18n";
import { LazyMap } from "@/components/LazyMap";
import { PropertyCard } from "@/components/PropertyCard";

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

const priceSteps = [0, 15000000, 30000000, 50000000];

function SearchPage() {
  const { t, lang } = useI18n();
  const navigate = useNavigate();
  const [q, setQ] = useState("");
  const [type, setType] = useState<PType | "">("");
  const [max, setMax] = useState(0);
  const [hover, setHover] = useState<string | null>(null);
  const [mobileView, setMobileView] = useState<"map" | "list">("map");

  const results = useMemo(
    () =>
      properties.filter((p) => {
        const s = q.trim().toLowerCase();
        if (s && !`${p.city.fr} ${p.city.ar} ${p.title.fr} ${p.title.ar}`.toLowerCase().includes(s)) return false;
        if (type && p.type !== type) return false;
        if (max && p.price > max) return false;
        return true;
      }),
    [q, type, max],
  );

  const points = results.map((p) => ({ id: p.id, lat: p.lat, lng: p.lng, label: shortDZD(p.price, lang) }));
  const sel = "h-9 min-w-0 bg-transparent text-sm font-semibold text-foreground outline-none";

  const searchBar = (
    <div className="pointer-events-auto mx-auto grid w-full max-w-3xl grid-cols-1 gap-1 rounded-2xl border border-border bg-card p-1.5 shadow-float sm:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)_minmax(0,1fr)] sm:rounded-full">
      <label className="flex min-w-0 items-center gap-2 px-3">
        <MapPin className="h-4 w-4 shrink-0 text-primary" />
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={t("location")} className={`${sel} w-full placeholder:text-muted-foreground`} list="cities" />
        <datalist id="cities">
          {["Oran", "Alger", "Constantine", "Aïn Témouchent", "Tlemcen", "وهران", "الجزائر"].map((c) => <option key={c} value={c} />)}
        </datalist>
      </label>
      <label className="flex min-w-0 items-center gap-2 border-border px-3 sm:border-s">
        <Home className="h-4 w-4 shrink-0 text-primary" />
        <select value={type} onChange={(e) => setType(e.target.value as PType | "")} className={`${sel} w-full`}>
          <option value="">{t("anyType")}</option>
          {(["apartment", "villa", "house", "duplex"] as const).map((k) => <option key={k} value={k}>{t(k)}</option>)}
        </select>
      </label>
      <label className="flex min-w-0 items-center gap-2 border-border px-3 sm:border-s">
        <Wallet className="h-4 w-4 shrink-0 text-primary" />
        <select value={max} onChange={(e) => setMax(Number(e.target.value))} className={`${sel} w-full`}>
          {priceSteps.map((v) => <option key={v} value={v}>{v ? `≤ ${shortDZD(v, lang)} ${lang === "ar" ? "د.ج" : "DA"}` : t("anyPrice")}</option>)}
        </select>
      </label>
    </div>
  );

  const list = (
    <div className="space-y-3 p-4">
      <div className="flex items-center justify-between text-sm font-bold text-foreground">
        <span>{results.length} {t("results")}</span>
        <SlidersHorizontal className="h-4 w-4 text-primary" />
      </div>
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
      <aside className="hidden w-[35%] overflow-y-auto border-e border-border bg-background lg:block">{list}</aside>
      {/* Map 65% (full on mobile) */}
      <section className="relative flex-1">
        <LazyMap points={points} activeId={hover} onHover={setHover} onSelect={(id) => navigate({ to: "/property/$id", params: { id } })} fitPoints />
        <div className="pointer-events-none absolute inset-x-0 top-0 z-[500] p-3">{searchBar}</div>
      </section>
      {/* Mobile bottom drawer */}
      <motion.div
        className="absolute inset-x-0 bottom-0 z-[600] rounded-t-2xl border-t border-border bg-background shadow-float lg:hidden"
        animate={{ height: mobileView === "list" ? "75%" : "5.5rem" }}
        transition={{ type: "spring", damping: 28, stiffness: 260 }}
      >
        <button onClick={() => setMobileView(mobileView === "map" ? "list" : "map")} className="flex w-full flex-col items-center gap-1 pt-2 pb-3">
          <span className="h-1 w-10 rounded-full bg-ring" />
          <span className="flex items-center gap-2 text-sm font-bold text-foreground">
            {mobileView === "map" ? <List className="h-4 w-4" /> : <MapIcon className="h-4 w-4" />}
            {results.length} {t("results")} · {mobileView === "map" ? t("showList") : t("showMap")}
          </span>
        </button>
        <div className="h-[calc(100%-3.5rem)] overflow-y-auto">{list}</div>
      </motion.div>
    </main>
  );
}
