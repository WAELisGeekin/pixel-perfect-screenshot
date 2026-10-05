import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ArrowRight, Building2 } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import { useState } from "react";
import { LandingScene } from "@/components/LandingScene";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "FAZTI — L'immobilier d'exception en Algérie" },
      { name: "description", content: "Votre portail vers les propriétés d'exception en Algérie, avec recherche sur carte et visites virtuelles." },
      { property: "og:title", content: "FAZTI — L'immobilier d'exception en Algérie" },
      { property: "og:description", content: "Explorez l'immobilier algérien autrement, sur carte et en visite virtuelle." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: LandingPage,
});

function LandingPage() {
  const navigate = useNavigate();
  const reducedMotion = useReducedMotion() ?? false;
  const [entering, setEntering] = useState(false);

  const enterSearch = () => {
    if (entering) return;
    if (reducedMotion) {
      void navigate({ to: "/search" });
      return;
    }
    setEntering(true);
    window.setTimeout(() => void navigate({ to: "/search" }), 850);
  };

  return (
    <main className="relative isolate min-h-screen overflow-hidden bg-deep text-deep-foreground">
      <motion.div
        className="portal-grid absolute inset-0 origin-center"
        animate={entering ? { scale: 3.5, filter: "blur(18px)", opacity: 0 } : { scale: 1, filter: "blur(0px)", opacity: 1 }}
        transition={{ duration: 0.9, ease: [0.76, 0, 0.24, 1] }}
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,var(--portal-glow),transparent_42%)]" />
        <div className="absolute inset-x-0 top-[7vh] mx-auto h-[47vh] max-h-[470px] min-h-[310px] w-full max-w-2xl" aria-hidden="true">
          <LandingScene reducedMotion={reducedMotion} />
        </div>
      </motion.div>

      <motion.section
        className="relative z-10 mx-auto flex min-h-screen w-full max-w-5xl flex-col items-center justify-end px-5 pb-[7vh] pt-[52vh] text-center sm:pb-[8vh] sm:pt-[54vh]"
        animate={entering ? { scale: 1.4, opacity: 0, filter: "blur(12px)" } : { scale: 1, opacity: 1, filter: "blur(0px)" }}
        transition={{ duration: 0.7, ease: [0.76, 0, 0.24, 1] }}
      >
        <p className="mb-3 text-xs font-bold uppercase text-accent sm:text-sm">Immobilier · Algérie · عقارات</p>
        <h1 className="max-w-4xl text-3xl font-extrabold leading-tight sm:text-5xl lg:text-6xl">L'immobilier d'exception en Algérie</h1>
        <p className="mt-3 text-xl font-bold text-accent sm:text-3xl" lang="ar" dir="rtl">وجهتك العقارية الأولى في الجزائر</p>
        <div className="mt-8 flex w-full max-w-xl flex-col justify-center gap-3 sm:flex-row">
          <Button onClick={enterSearch} size="lg" className="h-13 flex-1 bg-accent px-5 font-extrabold text-accent-foreground hover:bg-ring">
            <span>Explorer la Carte</span><span aria-hidden="true">/</span><span lang="ar">استكشف الخريطة</span><ArrowRight className="rtl:rotate-180" />
          </Button>
          <Button onClick={() => void navigate({ to: "/list-property" })} variant="outline" size="lg" className="h-13 flex-1 border-ring bg-deep/70 px-5 font-extrabold text-deep-foreground backdrop-blur hover:bg-primary hover:text-primary-foreground">
            <Building2 /><span>Déposer une Annonce</span><span aria-hidden="true">/</span><span lang="ar">بيع عقارك</span>
          </Button>
        </div>
      </motion.section>
    </main>
  );
}
