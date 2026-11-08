"use client";

import Link from "next/link";
import Image from "next/image";
import { useLocale } from "@/components/i18n/LocaleProvider";

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
      <Link href="/projects/nova-hills-prime" className="group block">
        <div className="mb-7 flex flex-wrap items-center justify-between gap-4 text-[9px] uppercase tracking-[.2em] text-neutral-500">
          <span>{t.eyebrow} · {t.location}</span><span>{t.status}</span>
        </div>
        <div className="relative flex min-h-[400px] w-full flex-col justify-between overflow-hidden bg-[#1b2228] px-7 py-10 text-white sm:min-h-[520px] sm:px-12 md:min-h-[590px] md:px-16">
          <div className="absolute inset-0 opacity-[.13] [background:repeating-linear-gradient(90deg,transparent,transparent_14.8%,rgba(255,255,255,.3)_14.85%,transparent_15%)]" aria-hidden="true" />
          <div className="relative z-10 flex items-start justify-between gap-5">
            <span className="text-[10px] uppercase tracking-[.3em] text-white/55">MASON & ARC</span>
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/40 transition-transform group-hover:-translate-y-1 group-hover:translate-x-1" aria-hidden="true">↗</span>
          </div>
          <div className="relative z-10 grid items-end gap-9 lg:grid-cols-[1fr_.8fr]">
            <div>
              <p className="mb-5 max-w-2xl text-xs leading-relaxed tracking-[.12em] text-white/55">{t.role}</p>
              <h3 className="max-w-3xl text-[clamp(3.3rem,7.5vw,8.5rem)] font-light leading-[.85] tracking-[-.065em]">NOVA<br />HILLS PRIME<span className="text-[#b51220]">.</span></h3>
            </div>
            <div className="relative h-[130px] bg-white/5 p-5 sm:h-[170px]">
              <Image src="https://novahillseg.com/assets/logo-novahills-transparent.png" alt="NOVA HILLS PRIME original identity" fill unoptimized sizes="(max-width: 1024px) 75vw, 40vw" className="object-contain p-5" />
            </div>
          </div>
        </div>
        <div className="mt-7 flex flex-wrap items-end justify-between gap-3">
          <div><p className="mb-3 text-[9px] uppercase tracking-[.24em] text-neutral-500">{t.role}</p><h3 className="text-[clamp(2.3rem,5vw,5.5rem)] font-light leading-none tracking-[-.055em]">{t.title}</h3></div>
          <span className="text-[10px] uppercase tracking-[.2em] text-neutral-500 transition-colors group-hover:text-neutral-900">{t.view} ↗</span>
        </div>
      </Link>
    </article>
  );
}
