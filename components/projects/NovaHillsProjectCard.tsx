"use client";

import Image from "next/image";
import { useLocale } from "@/components/i18n/LocaleProvider";

const identity = "/images/projects/nova-hills/nova-hills-brand-experience.png";

const copy = {
  en: { eyebrow: "PROJECT 001 / INTEGRATED PARTNERSHIP", location: "EGYPT", status: "ONGOING COLLABORATION", view: "Explore the case study", title: "NOVA HILLS PRIME", role: "Identity · Digital · Architecture · Interiors · Execution" },
  ar: { eyebrow: "المشروع ٠٠١ / تعاون متكامل", location: "مصر", status: "تعاون مستمر", view: "استكشف المشروع", title: "NOVA HILLS PRIME", role: "الهوية · الموقع · العمارة · التصميم الداخلي · التنفيذ" },
  it: { eyebrow: "PROGETTO 001 / COLLABORAZIONE INTEGRATA", location: "EGITTO", status: "COLLABORAZIONE IN CORSO", view: "Scopri il progetto", title: "NOVA HILLS PRIME", role: "Identità · Digitale · Architettura · Interni · Realizzazione" },
} as const;

export default function NovaHillsProjectCard({ mode = "home" }: { mode?: "home" | "archive" }) {
  const { locale } = useLocale();
  const t = copy[locale];

  return (
    <article dir={locale === "ar" ? "rtl" : "ltr"} className={mode === "home" ? "project-card border-b border-neutral-300 py-8 md:py-12" : "border-b border-neutral-300 py-8 md:py-12"}>
      <a href="/projects/nova-hills-prime" className="group block">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4 text-[9px] uppercase tracking-[.2em] text-neutral-500">
          <span>{t.eyebrow} · {t.location}</span>
          <span className="inline-flex items-center gap-2"><span className="h-1.5 w-1.5 rounded-full bg-[#b51220]" aria-hidden="true" />{t.status}</span>
        </div>
        <div className="relative aspect-[16/10] overflow-hidden bg-[#151b20]">
          <Image src={identity} alt="NOVA HILLS PRIME identity and digital experience" fill sizes="100vw" className="object-cover transition-transform duration-[1400ms] ease-out group-hover:scale-[1.025]" />
          <span className="absolute right-5 top-5 inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/65 bg-black/25 text-white backdrop-blur-sm transition-transform group-hover:-translate-y-1 group-hover:translate-x-1 sm:right-8 sm:top-8" aria-hidden="true">↗</span>
        </div>
        <div className="mt-7 grid gap-5 md:grid-cols-[1fr_auto] md:items-end">
          <div>
            <p className="mb-3 text-[9px] uppercase tracking-[.22em] text-neutral-500">{t.role}</p>
            <h3 className="text-[clamp(2.5rem,5.3vw,5.8rem)] font-light leading-[.9] tracking-[-.06em]">{t.title}</h3>
          </div>
          <span className="inline-flex items-center gap-3 text-[10px] uppercase tracking-[.2em] text-neutral-500 transition-colors group-hover:text-neutral-900">{t.view}<span aria-hidden="true" className="transition-transform group-hover:-translate-y-1 group-hover:translate-x-1">↗</span></span>
        </div>
      </a>
    </article>
  );
}
