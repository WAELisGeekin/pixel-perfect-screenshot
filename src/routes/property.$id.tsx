import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowLeft, CalendarDays, ChevronLeft, ChevronRight, Heart, MapPin, MessageCircle, Phone, X } from "lucide-react";
import { SEED_LISTINGS, TYPE_LABELS, communeLabel, useListings, wilayaBy } from "@/lib/data";
import { fieldsFor, displayValue } from "@/lib/fields";
import { toggleFavorite, useFavorites } from "@/lib/favorites";
import { videoSource, waLink } from "@/lib/contact";
import { listingPrice, relativeDate, useI18n } from "@/lib/i18n";
import { BookingModal } from "@/components/BookingModal";
import { LazyMap } from "@/components/LazyMap";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/property/$id")({
  head: ({ params }) => {
    const l = SEED_LISTINGS.find((x) => x.id === params.id);
    const title = l ? `${l.title.fr} — ${l.commune} | FAZTI Immobilier` : "Annonce immobilière | FAZTI Immobilier";
    const desc = l?.description.fr ?? "Détails de l'annonce, photos, contact et localisation.";
    return { meta: [
      { title }, { name: "description", content: desc },
      { property: "og:title", content: title }, { property: "og:description", content: desc },
      { property: "og:type", content: "article" }, { name: "twitter:card", content: "summary_large_image" },
    ] };
  },
  component: PropertyPage,
});

function PropertyPage() {
  const { id } = Route.useParams();
  const { lang, tx } = useI18n();
  const p = useListings().find((l) => l.id === id);
  const favs = useFavorites();
  const [idx, setIdx] = useState(0);
  const [lightbox, setLightbox] = useState(false);
  const [showPhone, setShowPhone] = useState(false);
  const [booking, setBooking] = useState(false);

  useEffect(() => {
    if (!lightbox || !p) return;
    const n = p.images.length;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setLightbox(false);
      if (e.key === "ArrowRight") setIdx((i) => (i + 1) % n);
      if (e.key === "ArrowLeft") setIdx((i) => (i - 1 + n) % n);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [lightbox, p]);

  if (!p) {
    return (
      <main className="p-10 text-center">
        <p className="font-bold text-foreground">{tx("Annonce introuvable", "الإعلان غير موجود")}</p>
        <Link to="/" className="text-sm font-bold text-primary underline">{tx("Retour aux annonces", "العودة إلى الإعلانات")}</Link>
      </main>
    );
  }

  const n = p.images.length;
  const details = [
    { k: tx("Type", "النوع"), v: TYPE_LABELS[p.type][lang] },
    ...(p.rooms > 0 ? [{ k: tx("Pièces", "الغرف"), v: `F${p.rooms}${p.rooms >= 5 ? "+" : ""}` }] : []),
    { k: tx("Surface", "المساحة"), v: `${p.area} m²` },
    { k: tx("Référence", "المرجع"), v: p.id },
    ...fieldsFor(p.type, p.listing_type).flatMap((f) => { const v = displayValue(f, p.fields[f.key], lang); return v ? [{ k: f.label[lang], v }] : []; }),
  ];
  const fav = favs.includes(p.id);

  return (
    <main className="mx-auto w-full max-w-6xl space-y-4 p-3 sm:p-4">
      <Link to="/" className="inline-flex items-center gap-1 text-sm font-bold text-primary"><ArrowLeft className="h-4 w-4 rtl:rotate-180" />{tx("Annonces", "الإعلانات")}</Link>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div className="min-w-0 space-y-4">
          <section className="space-y-2">
            <button onClick={() => setLightbox(true)} className="relative block aspect-[16/10] w-full overflow-hidden rounded-md bg-secondary" aria-label={tx("Agrandir la photo", "تكبير الصورة")}>
              {p.images[idx] && <img src={p.images[idx]} alt={p.title[lang]} className="h-full w-full object-cover" />}
              <span className="absolute bottom-2 end-2 rounded bg-foreground/80 px-2 py-0.5 text-xs font-bold text-deep-foreground">{idx + 1} / {n}</span>
            </button>
            <div className="flex gap-2 overflow-x-auto pb-1">
              {p.images.map((src, i) => (
                <button key={i} onClick={() => setIdx(i)} aria-label={`${tx("Photo", "صورة")} ${i + 1}`} className={`h-16 w-24 shrink-0 overflow-hidden rounded border-2 ${i === idx ? "border-accent" : "border-transparent"}`}>
                  <img src={src} alt="" className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          </section>

          <section className="rounded-md border border-border bg-card p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-2xl font-extrabold text-foreground">{listingPrice(p.price, p.listing_type === "rent", lang)}</div>
                <h1 className="text-lg font-bold text-primary">{p.title[lang]}</h1>
                <p className="mt-1 flex items-center gap-1 text-sm text-muted-foreground"><MapPin className="h-4 w-4" />{communeLabel(p.wilaya, p.commune, lang)}, {wilayaBy(p.wilaya)?.[lang]} · {relativeDate(p.createdAt, lang)}</p>
              </div>
              <Button variant="outline" size="icon" onClick={() => toggleFavorite(p.id)} aria-pressed={fav} aria-label={tx("Favori", "المفضلة")}>
                <Heart className={fav ? "fill-current text-destructive" : ""} />
              </Button>
            </div>
            <h2 className="mt-4 font-extrabold text-foreground">{tx("Description", "الوصف")}</h2>
            <p className="mt-1 whitespace-pre-line text-sm text-primary">{p.description[lang]}</p>
          </section>

          {p.videos.length > 0 && (
            <section className="space-y-2 rounded-md border border-border bg-card p-4">
              <h2 className="font-extrabold text-foreground">{tx("Vidéo", "فيديو")}</h2>
              {p.videos.map((url) => {
                const v = videoSource(url);
                return v.kind === "youtube"
                  ? <iframe key={url} src={v.src} title={tx("Vidéo du bien", "فيديو العقار")} className="aspect-video w-full rounded" allowFullScreen />
                  : <video key={url} src={v.src} controls className="aspect-video w-full rounded bg-foreground" />;
              })}
            </section>
          )}

          <section className="rounded-md border border-border bg-card p-4">
            <h2 className="mb-3 font-extrabold text-foreground">{tx("Détails", "التفاصيل")}</h2>
            <dl className="grid grid-cols-1 gap-x-6 gap-y-2 sm:grid-cols-2">
              {details.map((d) => (
                <div key={d.k} className="flex justify-between gap-3 border-b border-border py-1.5 text-sm">
                  <dt className="text-muted-foreground">{d.k}</dt><dd className="text-end font-semibold text-foreground">{d.v}</dd>
                </div>
              ))}
            </dl>
          </section>

          <section className="h-72 overflow-hidden rounded-md border border-border">
            <LazyMap points={[{ id: p.id, lat: p.lat, lng: p.lng, label: tx("Ici", "هنا") }]} center={[p.lat, p.lng]} zoom={13} />
          </section>
        </div>

        <aside className="lg:sticky lg:top-[4.5rem] lg:self-start">
          <div className="space-y-3 rounded-md border border-border bg-card p-4 shadow-float">
            <div className="text-xs font-bold uppercase text-muted-foreground">{p.publisher.kind === "agency" ? tx("Agence", "وكالة") : tx("Particulier", "خاص")}</div>
            {p.publisher.kind === "agency" && p.publisher.slug
              ? <Link to="/agence/$slug" params={{ slug: p.publisher.slug }} className="block text-lg font-extrabold text-foreground underline-offset-2 hover:underline">{p.publisher.name}</Link>
              : <div className="text-lg font-extrabold text-foreground">{p.publisher.name}</div>}
            {showPhone
              ? <Button asChild variant="outline" className="w-full"><a href={`tel:${p.publisher.phone}`}><Phone />{p.publisher.phone}</a></Button>
              : <Button variant="outline" className="w-full" onClick={() => setShowPhone(true)}><Phone />{tx("Afficher le numéro", "إظهار الرقم")}</Button>}
            <Button asChild className="w-full bg-whatsapp text-whatsapp-foreground hover:bg-whatsapp/90">
              <a href={waLink(p.publisher.whatsapp ?? p.publisher.phone, p.title[lang], p.id, lang)} target="_blank" rel="noreferrer"><MessageCircle />WhatsApp</a>
            </Button>
            {p.publisher.kind === "agency" && (
              <Button className="w-full" onClick={() => setBooking(true)}><CalendarDays />{tx("Réserver une visite", "حجز زيارة")}</Button>
            )}
          </div>
        </aside>
      </div>

      {lightbox && (
        <div role="dialog" aria-modal="true" className="fixed inset-0 z-[2000] flex items-center justify-center bg-foreground/95" onClick={() => setLightbox(false)}>
          <button className="absolute end-4 top-4 text-deep-foreground" aria-label={tx("Fermer", "إغلاق")}><X className="h-7 w-7" /></button>
          <button onClick={(e) => { e.stopPropagation(); setIdx((i) => (i - 1 + n) % n); }} className="absolute start-3 rounded-full bg-card/20 p-2 text-deep-foreground" aria-label={tx("Précédente", "السابقة")}><ChevronLeft className="h-7 w-7 rtl:rotate-180" /></button>
          {p.images[idx] && <img src={p.images[idx]} alt={p.title[lang]} onClick={(e) => e.stopPropagation()} className="max-h-[90vh] max-w-[92vw] object-contain" />}
          <button onClick={(e) => { e.stopPropagation(); setIdx((i) => (i + 1) % n); }} className="absolute end-3 rounded-full bg-card/20 p-2 text-deep-foreground" aria-label={tx("Suivante", "التالية")}><ChevronRight className="h-7 w-7 rtl:rotate-180" /></button>
        </div>
      )}
      <BookingModal open={booking} onClose={() => setBooking(false)} propertyTitle={p.title[lang]} />
    </main>
  );
}
