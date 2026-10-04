import { createFileRoute } from "@tanstack/react-router";
import { useRef, useState } from "react";
import { motion, AnimatePresence, Reorder } from "framer-motion";
import { UploadCloud, Star, X, CheckCircle2, MapPin } from "lucide-react";
import { useI18n, formatDZD } from "@/lib/i18n";
import { LazyMap } from "@/components/LazyMap";

export const Route = createFileRoute("/list-property")({
  head: () => ({
    meta: [
      { title: "Publier une annonce immobilière | FAZTI" },
      { name: "description", content: "Vendez votre bien en Algérie : adresse, photos HD, visite 360° et prix en DZD." },
      { property: "og:title", content: "Publier une annonce | FAZTI" },
      { property: "og:description", content: "Mettez votre bien en vente sur FAZTI en 3 étapes." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ListProperty,
});

type Photo = { id: string; url: string; name: string };

function ListProperty() {
  const { t, lang } = useI18n();
  const [step, setStep] = useState(0);
  const [address, setAddress] = useState("");
  const [pin, setPin] = useState<[number, number] | null>(null);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [progress, setProgress] = useState<Record<string, number>>({});
  const [tourUrl, setTourUrl] = useState("");
  const [price, setPrice] = useState("");
  const [beds, setBeds] = useState(3);
  const [baths, setBaths] = useState(1);
  const [area, setArea] = useState("");
  const [done, setDone] = useState(false);
  const [over, setOver] = useState(false);
  const input = useRef<HTMLInputElement>(null);

  const steps = [t("stepAddress"), t("stepMedia"), t("stepSpecs")];

  const addFiles = (files: FileList | null) => {
    if (!files) return;
    const next = Array.from(files).filter((f) => f.type.startsWith("image/")).map((f) => ({ id: crypto.randomUUID(), url: URL.createObjectURL(f), name: f.name }));
    setPhotos((p) => [...p, ...next]);
    // Simulated chunked upload progress
    next.forEach((ph) => {
      let v = 0;
      const tick = setInterval(() => {
        v = Math.min(100, v + 12 + Math.random() * 18);
        setProgress((pr) => ({ ...pr, [ph.id]: v }));
        if (v >= 100) clearInterval(tick);
      }, 180);
    });
  };

  const canContinue = step === 0 ? address.length > 3 && !!pin : step === 1 ? photos.length > 0 : !!price && !!area;
  const field = "w-full rounded-md border border-input bg-card px-3 py-2.5 text-sm font-medium text-foreground outline-none focus:ring-2 focus:ring-ring";

  if (done)
    return (
      <main className="grid flex-1 place-items-center p-6">
        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-center">
          <CheckCircle2 className="mx-auto h-16 w-16 text-accent" />
          <h1 className="mt-3 text-2xl font-extrabold text-foreground">{t("published")}</h1>
          <p className="mt-1 text-primary">{address} · {formatDZD(Number(price), lang)}</p>
        </motion.div>
      </main>
    );

  return (
    <main className="flex-1 pb-28">
      <div className="mx-auto w-full max-w-2xl px-4 pt-8">
        <h1 className="text-2xl font-extrabold text-foreground">{t("listTitle")}</h1>
        <div className="mt-5 grid grid-cols-3 gap-2">
          {steps.map((s, i) => (
            <div key={s} className="min-w-0">
              <div className={`h-1.5 rounded-full transition-colors ${i <= step ? "bg-foreground" : "bg-ring/50"}`} />
              <div className={`mt-1.5 truncate text-xs font-bold ${i === step ? "text-foreground" : "text-muted-foreground"}`}>{t("step")} {i + 1} · {s}</div>
            </div>
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div key={step} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="mt-6 rounded-md border border-border bg-card p-5">
            {step === 0 && (
              <div className="space-y-4">
                <label className="block">
                  <span className="mb-1.5 block text-sm font-bold text-foreground">{t("address")}</span>
                  <input value={address} onChange={(e) => setAddress(e.target.value)} placeholder={t("addressPh")} className={field} list="addr" />
                  <datalist id="addr">
                    {["Boulevard de l'ALN, Oran", "Rue Didouche Mourad, Alger", "Cité 5 Juillet, Constantine", "Centre-ville, Aïn Témouchent"].map((a) => <option key={a} value={a} />)}
                  </datalist>
                </label>
                <p className="flex items-center gap-1.5 text-xs font-semibold text-primary"><MapPin className="h-3.5 w-3.5" />{t("pinHint")}</p>
                <div className="h-72 overflow-hidden rounded-md border border-border">
                  <LazyMap center={[35.7, -0.63]} zoom={11} pin={pin} onPick={(a, b) => setPin([a, b])} />
                </div>
                {pin && <p className="text-xs text-muted-foreground" dir="ltr">{pin[0].toFixed(5)}, {pin[1].toFixed(5)}</p>}
              </div>
            )}

            {step === 1 && (
              <div className="space-y-4">
                <div
                  onDragOver={(e) => { e.preventDefault(); setOver(true); }}
                  onDragLeave={() => setOver(false)}
                  onDrop={(e) => { e.preventDefault(); setOver(false); addFiles(e.dataTransfer.files); }}
                  onClick={() => input.current?.click()}
                  className={`flex cursor-pointer flex-col items-center rounded-md border-2 border-dashed p-8 text-center transition-colors ${over ? "border-accent bg-accent/15" : "border-ring"}`}
                >
                  <UploadCloud className="h-10 w-10 text-primary" />
                  <p className="mt-2 font-bold text-foreground">{t("dropPhotos")}</p>
                  <p className="text-sm text-primary underline">{t("orBrowse")}</p>
                  <input ref={input} type="file" accept="image/*" multiple hidden onChange={(e) => addFiles(e.target.files)} />
                </div>
                <Reorder.Group axis="y" values={photos} onReorder={setPhotos} className="space-y-2">
                  {photos.map((ph, i) => (
                    <Reorder.Item key={ph.id} value={ph} className="flex cursor-grab items-center gap-3 rounded-md border border-border bg-card p-2 active:cursor-grabbing">
                      <img src={ph.url} alt="" className="h-14 w-20 shrink-0 rounded object-cover" />
                      <div className="min-w-0 flex-1">
                        <div className="truncate text-sm font-semibold text-foreground">{ph.name}</div>
                        <div className="mt-1 h-1 overflow-hidden rounded-full bg-secondary"><div className="h-full bg-accent transition-all" style={{ width: `${progress[ph.id] ?? 0}%` }} /></div>
                      </div>
                      {i === 0 ? (
                        <span className="flex shrink-0 items-center gap-1 rounded bg-accent px-2 py-1 text-xs font-bold text-accent-foreground"><Star className="h-3 w-3" />{t("cover")}</span>
                      ) : (
                        <button onClick={() => setPhotos((p) => [ph, ...p.filter((x) => x.id !== ph.id)])} className="shrink-0 rounded px-2 py-1 text-xs font-bold text-primary hover:bg-secondary">{t("setCover")}</button>
                      )}
                      <button onClick={() => setPhotos((p) => p.filter((x) => x.id !== ph.id))} className="shrink-0 rounded p-1 text-primary hover:bg-secondary"><X className="h-4 w-4" /></button>
                    </Reorder.Item>
                  ))}
                </Reorder.Group>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-5">
                <label className="block">
                  <span className="mb-1.5 block text-sm font-bold text-foreground">{t("tourUrl")}</span>
                  <input value={tourUrl} onChange={(e) => setTourUrl(e.target.value)} placeholder="https://my.matterport.com/show/?m=…" className={field} dir="ltr" />
                </label>
                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="block">
                    <span className="mb-1.5 block text-sm font-bold text-foreground">{t("priceDzd")}</span>
                    <input value={price} onChange={(e) => setPrice(e.target.value.replace(/\D/g, ""))} inputMode="numeric" placeholder="24000000" className={field} />
                    {price && <span className="mt-1 block text-xs font-semibold text-primary">{formatDZD(Number(price), lang)}</span>}
                  </label>
                  <label className="block">
                    <span className="mb-1.5 block text-sm font-bold text-foreground">{t("areaM2")}</span>
                    <input value={area} onChange={(e) => setArea(e.target.value.replace(/\D/g, ""))} inputMode="numeric" placeholder="120" className={field} />
                  </label>
                </div>
                {([[t("bedrooms"), beds, setBeds, [1, 2, 3, 4, 5, 6]], [t("bathrooms"), baths, setBaths, [1, 2, 3, 4]]] as const).map(([label, val, set, opts]) => (
                  <div key={label}>
                    <span className="mb-1.5 block text-sm font-bold text-foreground">{label}</span>
                    <div className="flex flex-wrap gap-2">
                      {opts.map((n) => (
                        <button key={n} onClick={() => set(n)} className={`h-10 w-12 rounded-md border text-sm font-extrabold transition-colors ${val === n ? "border-foreground bg-foreground text-deep-foreground" : "border-border text-primary hover:border-ring"}`}>
                          {n}{n === opts[opts.length - 1] ? "+" : ""}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Sticky footer */}
      <div className="fixed inset-x-0 bottom-0 z-[1000] border-t border-border bg-card">
        <div className="mx-auto flex w-full max-w-2xl items-center justify-between gap-3 px-4 py-3">
          <button disabled={step === 0} onClick={() => setStep(step - 1)} className="rounded-md border border-border px-5 py-2.5 text-sm font-bold text-primary disabled:opacity-40">{t("previous")}</button>
          {step < 2 ? (
            <button disabled={!canContinue} onClick={() => setStep(step + 1)} className="rounded-md bg-accent px-6 py-2.5 text-sm font-extrabold text-accent-foreground disabled:opacity-50">{t("continue")}</button>
          ) : (
            <button disabled={!canContinue} onClick={() => setDone(true)} className="rounded-md bg-foreground px-6 py-2.5 text-sm font-extrabold text-deep-foreground disabled:opacity-50">{t("publish")}</button>
          )}
        </div>
      </div>
    </main>
  );
}
