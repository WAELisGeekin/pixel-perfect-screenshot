import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { List, Map as MapIcon, RotateCcw, SlidersHorizontal, X } from "lucide-react";
import { COMMUNES, TYPE_LABELS, WILAYAS, useListings, wilayaBy, type ListingType, type PType } from "@/lib/data";
import { FIELDS, TRI_OPTIONS, fieldsFor, type FieldValue } from "@/lib/fields";
import { shortDZD, useI18n } from "@/lib/i18n";
import { LazyMap } from "@/components/LazyMap";
import { PropertyCard } from "@/components/PropertyCard";
import { FieldInput, chip } from "@/components/FieldInput";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "FAZTI Immobilier — Annonces à vendre et à louer en Algérie" },
      { name: "description", content: "Appartements, villas, terrains et locaux à vendre ou à louer dans les 58 wilayas, prix en DA, agences et particuliers." },
      { property: "og:title", content: "FAZTI Immobilier — Annonces immobilières en Algérie" },
      { property: "og:description", content: "Achetez ou louez : annonces d'agences et de particuliers partout en Algérie." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ListingsPage,
});

type Filters = {
  wilaya: string; commune: string; type: PType | ""; min: string; max: string; rooms: number | null;
  area: string; publisher: "all" | "agency" | "individual"; extra: Record<string, FieldValue | undefined>;
};
const EMPTY: Filters = { wilaya: "", commune: "", type: "", min: "", max: "", rooms: null, area: "", publisher: "all", extra: {} };
const input = "h-10 w-full rounded-md border border-border bg-card px-3 text-sm font-medium text-foreground outline-none focus:border-ring";

function ListingsPage() {
  const { lang, tx } = useI18n();
  const navigate = useNavigate();
  const all = useListings();
  const [mode, setMode] = useState<ListingType>("sale");
  const [f, setF] = useState<Filters>(EMPTY);
  const [wilayaText, setWilayaText] = useState("");
  const [sort, setSort] = useState<"recent" | "asc" | "desc">("recent");
  const [view, setView] = useState<"list" | "map">("list");
  const [showFilters, setShowFilters] = useState(false);
  const [showMore, setShowMore] = useState(false);
  const [hover, setHover] = useState<string | null>(null);
  const set = (p: Partial<Filters>) => setF((cur) => ({ ...cur, ...p }));

  const results = useMemo(() => {
    const r = all.filter((l) => {
      if (l.listing_type !== mode) return false;
      if (f.wilaya && l.wilaya !== f.wilaya) return false;
      if (f.commune && l.commune !== f.commune) return false;
      if (f.type && l.type !== f.type) return false;
      if (f.min && l.price < Number(f.min)) return false;
      if (f.max && l.price > Number(f.max)) return false;
      if (f.rooms && (f.rooms === 5 ? l.rooms < 5 : l.rooms !== f.rooms)) return false;
      if (f.area && l.area < Number(f.area)) return false;
      if (f.publisher !== "all" && l.publisher.kind !== f.publisher) return false;
      for (const [k, want] of Object.entries(f.extra)) {
        if (want === undefined || (Array.isArray(want) && !want.length)) continue;
        const have = l.fields[k];
        if (Array.isArray(want)) { if (!Array.isArray(have) || !want.every((w) => have.includes(w))) return false; }
        else if (typeof want === "number") { if (typeof have !== "number" || have < want) return false; }
        else if (have !== want) return false;
      }
      return true;
    });
    return r.sort((a, b) => sort === "asc" ? a.price - b.price : sort === "desc" ? b.price - a.price : b.createdAt.localeCompare(a.createdAt));
  }, [all, mode, f, sort]);

  const label = (k: string) => FIELDS.find((x) => x.key === k);
  const chips: { key: string; text: string; clear: () => void }[] = [];
  if (f.wilaya) chips.push({ key: "w", text: wilayaBy(f.wilaya)?.[lang] ?? "", clear: () => { set({ wilaya: "", commune: "" }); setWilayaText(""); } });
  if (f.commune) chips.push({ key: "c", text: COMMUNES[f.wilaya]?.find((c) => c.fr === f.commune)?.[lang] ?? f.commune, clear: () => set({ commune: "" }) });
  if (f.type) chips.push({ key: "t", text: TYPE_LABELS[f.type][lang], clear: () => set({ type: "" }) });
  if (f.min) chips.push({ key: "min", text: `≥ ${Number(f.min).toLocaleString()} DA`, clear: () => set({ min: "" }) });
  if (f.max) chips.push({ key: "max", text: `≤ ${Number(f.max).toLocaleString()} DA`, clear: () => set({ max: "" }) });
  if (f.rooms) chips.push({ key: "r", text: `F${f.rooms}${f.rooms === 5 ? "+" : ""}`, clear: () => set({ rooms: null }) });
  if (f.area) chips.push({ key: "a", text: `≥ ${f.area} m²`, clear: () => set({ area: "" }) });
  if (f.publisher !== "all") chips.push({ key: "p", text: f.publisher === "agency" ? tx("Agences", "وكالات") : tx("Particuliers", "خواص"), clear: () => set({ publisher: "all" }) });
  for (const [k, v] of Object.entries(f.extra)) {
    const def = label(k);
    if (!def || v === undefined || (Array.isArray(v) && !v.length)) continue;
    const opt = (x: string) => (def.type === "tri" ? TRI_OPTIONS : def.options ?? []).find((o) => o.value === x)?.[lang] ?? x;
    const text = typeof v === "number" ? `${v}` : Array.isArray(v) ? v.map(opt).join(", ") : opt(v);
    chips.push({ key: k, text: `${def.label[lang]} : ${text}`, clear: () => set({ extra: { ...f.extra, [k]: undefined } }) });
  }
  const reset = () => { setF(EMPTY); setWilayaText(""); };

  const pickWilaya = (text: string) => {
    setWilayaText(text);
    const w = WILAYAS.find((x) => x.fr.toLowerCase() === text.trim().toLowerCase() || x.ar === text.trim() || `${x.code} - ${x[lang]}` === text);
    set({ wilaya: w?.code ?? "", commune: "" });
  };

  const filtersPanel = (
    <div className="space-y-3">
      <label className="block space-y-1"><span className="text-xs font-bold text-foreground">{tx("Wilaya", "الولاية")}</span>
        <input list="wilayas" value={wilayaText} onChange={(e) => pickWilaya(e.target.value)} placeholder={tx("Rechercher une wilaya", "ابحث عن ولاية")} className={input} />
        <datalist id="wilayas">{WILAYAS.map((w) => <option key={w.code} value={`${w.code} - ${w[lang]}`} />)}</datalist>
      </label>
      <label className="block space-y-1"><span className="text-xs font-bold text-foreground">{tx("Commune", "البلدية")}</span>
        <select value={f.commune} onChange={(e) => set({ commune: e.target.value })} disabled={!COMMUNES[f.wilaya]} className={input}>
          <option value="">{tx("Toutes les communes", "كل البلديات")}</option>
          {(COMMUNES[f.wilaya] ?? []).map((c) => <option key={c.fr} value={c.fr}>{c[lang]}</option>)}
        </select>
      </label>
      <label className="block space-y-1"><span className="text-xs font-bold text-foreground">{tx("Type de bien", "نوع العقار")}</span>
        <select value={f.type} onChange={(e) => set({ type: e.target.value as PType | "", extra: {} })} className={input}>
          <option value="">{tx("Tous types", "كل الأنواع")}</option>
          {(Object.keys(TYPE_LABELS) as PType[]).map((k) => <option key={k} value={k}>{TYPE_LABELS[k][lang]}</option>)}
        </select>
      </label>
      <div className="space-y-1"><span className="text-xs font-bold text-foreground">{tx("Prix (DA)", "السعر (د.ج)")}</span>
        <div className="grid grid-cols-2 gap-2">
          <input type="number" min={0} value={f.min} onChange={(e) => set({ min: e.target.value })} placeholder={tx("Min", "من")} className={input} />
          <input type="number" min={0} value={f.max} onChange={(e) => set({ max: e.target.value })} placeholder={tx("Max", "إلى")} className={input} />
        </div>
      </div>
      <div className="space-y-1"><span className="text-xs font-bold text-foreground">{tx("Pièces", "الغرف")}</span>
        <div className="flex flex-wrap gap-1.5">{[1, 2, 3, 4, 5].map((n) => (
          <button key={n} type="button" aria-pressed={f.rooms === n} onClick={() => set({ rooms: f.rooms === n ? null : n })} className={chip(f.rooms === n)}>F{n}{n === 5 ? "+" : ""}</button>
        ))}</div>
      </div>
      <label className="block space-y-1"><span className="text-xs font-bold text-foreground">{tx("Surface min (m²)", "المساحة الدنيا (م²)")}</span>
        <input type="number" min={0} value={f.area} onChange={(e) => set({ area: e.target.value })} className={input} />
      </label>
      <div className="space-y-1"><span className="text-xs font-bold text-foreground">{tx("Annonceur", "المعلن")}</span>
        <div className="flex flex-wrap gap-1.5">{([["all", "Tous", "الكل"], ["agency", "Agences", "وكالات"], ["individual", "Particuliers", "خواص"]] as const).map(([v, fr, ar]) => (
          <button key={v} type="button" aria-pressed={f.publisher === v} onClick={() => set({ publisher: v })} className={chip(f.publisher === v)}>{tx(fr, ar)}</button>
        ))}</div>
      </div>
      <Button type="button" variant="outline" className="w-full" onClick={() => setShowMore((v) => !v)}><SlidersHorizontal />{tx("Autres filtres", "فلاتر أخرى")}</Button>
      {showMore && (
        <div className="space-y-3 rounded-md border border-border bg-background p-3">
          {fieldsFor(f.type, mode).map((def) => (
            <FieldInput key={def.key} f={def} value={f.extra[def.key]} onChange={(v) => set({ extra: { ...f.extra, [def.key]: v } })} />
          ))}
        </div>
      )}
    </div>
  );

  const points = results.map((p) => ({ id: p.id, lat: p.lat, lng: p.lng, label: shortDZD(p.price, lang) }));

  return (
    <main className="mx-auto w-full max-w-7xl flex-1 p-3 sm:p-4">
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <div role="tablist" className="inline-flex rounded-md border border-border bg-card p-1">
          {([["sale", "Acheter", "شراء"], ["rent", "Louer", "كراء"]] as const).map(([v, fr, ar]) => (
            <button key={v} role="tab" aria-selected={mode === v} onClick={() => { setMode(v); set({ extra: {} }); }}
              className={`rounded px-5 py-2 text-sm font-extrabold transition-colors ${mode === v ? "bg-foreground text-deep-foreground" : "text-primary hover:bg-secondary"}`}>{tx(fr, ar)}</button>
          ))}
        </div>
        <Button variant="outline" className="lg:hidden" onClick={() => setShowFilters((v) => !v)}><SlidersHorizontal />{tx("Filtres", "تصفية")}</Button>
        <div className="ms-auto flex items-center gap-2">
          <select value={sort} onChange={(e) => setSort(e.target.value as typeof sort)} aria-label={tx("Trier", "ترتيب")} className="h-9 rounded-md border border-border bg-card px-2 text-sm font-semibold text-foreground">
            <option value="recent">{tx("Plus récent", "الأحدث")}</option>
            <option value="asc">{tx("Prix ↑", "السعر ↑")}</option>
            <option value="desc">{tx("Prix ↓", "السعر ↓")}</option>
          </select>
          <div className="inline-flex rounded-md border border-border bg-card p-0.5">
            <button onClick={() => setView("list")} aria-label={tx("Liste", "القائمة")} aria-pressed={view === "list"} className={`rounded p-1.5 ${view === "list" ? "bg-foreground text-deep-foreground" : "text-primary"}`}><List className="h-4 w-4" /></button>
            <button onClick={() => setView("map")} aria-label={tx("Carte", "الخريطة")} aria-pressed={view === "map"} className={`rounded p-1.5 ${view === "map" ? "bg-foreground text-deep-foreground" : "text-primary"}`}><MapIcon className="h-4 w-4" /></button>
          </div>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[280px_minmax(0,1fr)]">
        <aside className={`${showFilters ? "block" : "hidden"} rounded-md border border-border bg-card p-3 lg:sticky lg:top-[4.5rem] lg:block lg:max-h-[calc(100vh-5.5rem)] lg:overflow-y-auto`}>{filtersPanel}</aside>
        <section className="min-w-0 space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-bold text-foreground">{results.length} {tx("annonces", "إعلان")}</span>
            {chips.map((c) => (
              <button key={c.key} onClick={c.clear} className="flex items-center gap-1 rounded-full bg-accent/50 px-2.5 py-1 text-xs font-semibold text-foreground hover:bg-accent">
                {c.text}<X className="h-3 w-3" aria-label={tx("Retirer", "إزالة")} />
              </button>
            ))}
            {chips.length > 0 && <button onClick={reset} className="flex items-center gap-1 text-xs font-bold text-primary underline"><RotateCcw className="h-3 w-3" />{tx("Réinitialiser", "إعادة تعيين")}</button>}
          </div>
          {view === "map" ? (
            <div className="h-[70vh] overflow-hidden rounded-md border border-border">
              <LazyMap key={results.map((r) => r.id).join()} points={points} activeId={hover} onHover={setHover} onSelect={(id) => navigate({ to: "/property/$id", params: { id } })} fitPoints />
            </div>
          ) : results.length === 0 ? (
            <p className="rounded-md border border-border bg-card py-10 text-center text-sm text-muted-foreground">{tx("Aucune annonce ne correspond à vos critères.", "لا توجد إعلانات مطابقة.")}</p>
          ) : (
            results.map((p) => <PropertyCard key={p.id} p={p} active={hover === p.id} onHover={setHover} />)
          )}
        </section>
      </div>
    </main>
  );
}
