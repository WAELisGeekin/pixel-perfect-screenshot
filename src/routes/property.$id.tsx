import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, BedDouble, Bath, Maximize, Rotate3d, Phone, Check, X, Video, CalendarDays, MapPin, MessageCircle } from "lucide-react";
import { properties, agent, amenityLabels } from "@/lib/data";
import { formatDZD, useI18n } from "@/lib/i18n";
import { BookingModal } from "@/components/BookingModal";
import { LazyMap } from "@/components/LazyMap";
import { Button } from "@/components/ui/button";
import agentPhoto from "@/assets/agent-yasmine.jpg";

export const Route = createFileRoute("/property/$id")({
  loader: ({ params }) => {
    const p = properties.find((x) => x.id === params.id);
    if (!p) throw notFound();
    return p;
  },
  head: ({ loaderData }) => ({
    meta: loaderData
      ? [
          { title: `${loaderData.title.fr} — ${loaderData.city.fr} | FAZTI` },
          { name: "description", content: loaderData.description.fr },
          { property: "og:title", content: `${loaderData.title.fr} | FAZTI` },
          { property: "og:description", content: loaderData.description.fr },
          { property: "og:type", content: "article" },
          { name: "twitter:card", content: "summary_large_image" },
        ]
      : [],
  }),
  notFoundComponent: NotFound,
  errorComponent: NotFound,
  component: PropertyPage,
});

function NotFound() {
  const { t } = useI18n();
  return (
    <div className="grid flex-1 place-items-center p-10 text-center">
      <div>
        <p className="text-xl font-bold text-foreground">{t("notFound")}</p>
        <Link to="/search" className="mt-4 inline-block font-semibold text-primary underline">{t("back")}</Link>
      </div>
    </div>
  );
}

function PropertyPage() {
  const p = Route.useLoaderData();
  const { t, lang } = useI18n();
  const [booking, setBooking] = useState<null | "in_person" | "virtual">(null);
  const [tour, setTour] = useState(false);

  return (
    <main className="mx-auto w-full max-w-7xl px-4 pb-16">
      <Link to="/search" className="my-4 inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:text-foreground">
        <ArrowLeft className="h-4 w-4 rtl:rotate-180" /> {t("back")}
      </Link>

      {/* Hero gallery 50vh */}
      <div className="relative grid h-[50vh] min-h-[320px] grid-cols-4 grid-rows-2 gap-2 overflow-hidden rounded-md">
        <img src={p.images[0]} alt={p.title[lang]} width={1280} height={864} className="col-span-4 row-span-2 h-full w-full object-cover md:col-span-2" />
        {p.images.slice(1, 4).map((src, i) => (
          <img key={i} src={src} alt="" loading="lazy" width={1280} height={864} className={`hidden h-full w-full object-cover md:block ${i === 0 ? "col-span-2" : ""}`} />
        ))}
        {p.has360 && (
          <Button variant="ghost" onClick={() => setTour(true)} className="absolute bottom-4 start-4 flex items-center gap-2 rounded-md bg-card px-4 py-2.5 text-sm font-extrabold text-foreground shadow-float transition-transform hover:scale-105">
            <Rotate3d className="h-5 w-5" /> {t("launchTour")}
          </Button>
        )}
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-[7fr_3fr]">
        <div className="min-w-0 space-y-8">
          <div>
            <div className="text-3xl font-extrabold text-foreground sm:text-4xl">{formatDZD(p.price, lang)}</div>
            <h1 className="mt-1 text-xl font-bold text-primary sm:text-2xl">{p.title[lang]}</h1>
            <p className="mt-1 flex items-center gap-1 text-sm text-muted-foreground"><MapPin className="h-4 w-4" />{p.city[lang]}</p>
          </div>

          <div className="grid grid-cols-3 gap-3">
            {[[BedDouble, p.beds, t("bedrooms")], [Bath, p.baths, t("bathrooms")], [Maximize, `${p.area} m²`, t("areaM2")]].map(([Icon, v, l], i) => {
              const I = Icon as typeof BedDouble;
              return (
                <div key={i} className="rounded-md border border-border bg-card p-4">
                  <I className="h-5 w-5 text-primary" />
                  <div className="mt-2 text-xl font-extrabold text-foreground">{v as string}</div>
                  <div className="text-xs text-muted-foreground">{l as string}</div>
                </div>
              );
            })}
          </div>

          <section>
            <h2 className="mb-2 text-lg font-extrabold text-foreground">{t("description")}</h2>
            <p className="leading-relaxed text-primary">{p.description[lang]}</p>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-extrabold text-foreground">{t("amenities")}</h2>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {p.amenities.map((a) => (
                <div key={a} className="flex items-center gap-2 rounded-md border border-border bg-card px-3 py-2.5 text-sm font-semibold text-primary">
                  <Check className="h-4 w-4 shrink-0 text-accent" /> {amenityLabels[a]?.[lang] ?? a}
                </div>
              ))}
            </div>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-extrabold text-foreground">{t("floorPlan")}</h2>
            <FloorPlan beds={p.beds} baths={p.baths} />
          </section>

          <section className="h-72 overflow-hidden rounded-md border border-border">
            <LazyMap center={[p.lat, p.lng]} zoom={13} points={[{ id: p.id, lat: p.lat, lng: p.lng, label: "📍" }]} />
          </section>
        </div>

        {/* Sticky action card */}
        <aside>
          <div className="sticky top-20 space-y-4 rounded-md border border-border bg-card p-5 shadow-float">
            <div className="flex items-center gap-3">
              <img src={agentPhoto} alt={agent.name} loading="lazy" width={816} height={816} className="h-12 w-12 shrink-0 rounded-full object-cover ring-2 ring-accent" />
              <div className="min-w-0">
                <div className="truncate font-extrabold text-foreground">{agent.name}</div>
                <div className="truncate text-xs text-muted-foreground">{t("agentLabel")} · {agent.agency}</div>
              </div>
            </div>
            <p className="text-xs font-semibold text-primary">{t("responds")}</p>
            <Button variant="ghost" onClick={() => setBooking("virtual")} className="flex w-full items-center justify-center gap-2 rounded-md bg-accent py-3 text-sm font-extrabold text-accent-foreground transition-transform hover:scale-[1.02]">
              <Video className="h-4 w-4" /> {t("requestTour")}
            </Button>
            <Button variant="ghost" onClick={() => setBooking("in_person")} className="flex w-full items-center justify-center gap-2 rounded-md bg-primary py-3 text-sm font-extrabold text-primary-foreground transition-transform hover:scale-[1.02]">
              <CalendarDays className="h-4 w-4" /> {t("scheduleVisit")}
            </Button>
            <a href={`sms:${agent.phone.replace(/\s/g, "")}`} className="flex w-full items-center justify-center gap-2 rounded-md border border-border py-2.5 text-sm font-bold text-primary hover:bg-secondary" dir="ltr">
              <MessageCircle className="h-4 w-4" /> {lang === "ar" ? "رسالة" : "Message"}
            </a>
          </div>
        </aside>
      </div>

      <BookingModal key={booking ?? "x"} open={!!booking} onClose={() => setBooking(null)} propertyTitle={p.title[lang]} defaultType={booking ?? "in_person"} />

      <AnimatePresence>
        {tour && (
          <motion.div className="fixed inset-0 z-[2000] bg-foreground" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <PanoViewer src={p.images[0] ?? ""} />
            <Button variant="ghost" onClick={() => setTour(false)} className="absolute end-4 top-4 rounded-full bg-card p-2 text-foreground" aria-label={t("close")}><X className="h-5 w-5" /></Button>
            <div className="pointer-events-none absolute bottom-6 inset-x-0 text-center text-sm font-bold text-deep-foreground">{t("tour360")} · ← →</div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}

/** Lightweight drag-to-pan panorama preview. Real 360° embeds (Matterport/Kuula) can replace this. */
function PanoViewer({ src }: { src: string }) {
  const [x, setX] = useState(0);
  const [drag, setDrag] = useState<number | null>(null);
  return (
    <div
      className="h-full w-full cursor-grab touch-none active:cursor-grabbing"
      style={{ backgroundImage: `url(${src})`, backgroundSize: "auto 100%", backgroundRepeat: "repeat-x", backgroundPosition: `${x}px center` }}
      onPointerDown={(e) => setDrag(e.clientX)}
      onPointerMove={(e) => { if (drag !== null) { setX((v) => v + (e.clientX - drag)); setDrag(e.clientX); } }}
      onPointerUp={() => setDrag(null)}
      onPointerLeave={() => setDrag(null)}
    />
  );
}

function FloorPlan({ beds, baths }: { beds: number; baths: number }) {
  const { t } = useI18n();
  const rooms = [
    ...Array.from({ length: beds }, (_, i) => `${t("bedrooms").slice(0, 3)}. ${i + 1}`),
    ...Array.from({ length: baths }, (_, i) => `${t("bathrooms").slice(0, 3)}. ${i + 1}`),
  ];
  return (
    <div className="grid grid-cols-4 gap-1 rounded-md border-2 border-foreground bg-card p-1" dir="ltr">
      <div className="col-span-2 row-span-2 grid place-items-center border border-ring bg-secondary p-6 text-sm font-bold text-foreground">Salon / الصالون</div>
      {rooms.map((r) => (
        <div key={r} className="grid place-items-center border border-ring p-4 text-xs font-semibold text-primary">{r}</div>
      ))}
    </div>
  );
}
