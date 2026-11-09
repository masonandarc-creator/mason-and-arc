"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect } from "react";
import { useLocale } from "@/components/i18n/LocaleProvider";

const identity = "/images/projects/nova-hills/nova-hills-brand-experience.png";

const words = {
  en: {
    index: "Case study / 001",
    collaboration: "Integrated collaboration",
    discipline: "Identity · Digital · Architecture · Interiors · Delivery",
    status: "Collaboration in progress",
    subtitle: "A company identity, a digital presence and a wider design-to-delivery partnership — developed through one coordinated point of view.",
    locationLabel: "Location",
    sectorLabel: "Sector",
    location: "Egypt",
    sector: "Construction & real estate",
    overviewLabel: "01 / The collaboration",
    overviewTitle: "One partner. Across disciplines.",
    overview: "NOVA HILLS PRIME is a construction and real estate development business in Egypt. Mason&Arc’s collaboration spans brand identity, website design and development, architectural design, interiors and execution. The identity and website shown here are completed design work; architectural and on-site delivery will be documented as verified material becomes available.",
    scopeLabel: "02 / Our role",
    scopeTitle: "One connected scope.",
    stages: [
      ["01", "Brand identity", "Identity direction and consistent brand applications.", "Identity direction"],
      ["02", "Website & digital", "Bilingual experience, responsive design and implementation.", "Live website"],
      ["03", "Architecture", "Architectural concept, planning and design development.", "In progress"],
      ["04", "Interiors", "Interior architecture, material thinking and detailing.", "In progress"],
      ["05", "Execution", "Delivery coordination, construction and site execution.", "In progress"],
    ],
    proof: "The scope describes the collaboration, not unverified completion. Built-work photography and construction results will only be published after documentation and approval.",
    viewSite: "Visit the NOVA HILLS PRIME website",
    back: "All projects",
    nextLabel: "Have a project in mind?",
    nextTitle: "Let’s create.",
    nextAction: "Start a conversation",
    visualCaption: "NOVA HILLS PRIME — identity system and digital experience."
  },
  ar: {
    index: "دراسة حالة / ٠٠١",
    collaboration: "تعاون متكامل",
    discipline: "الهوية · الموقع · العمارة · التصميم الداخلي · التنفيذ",
    status: "التعاون مستمر",
    subtitle: "هوية شركة وحضور رقمي وشراكة أوسع من التصميم إلى التنفيذ، برؤية واحدة وتنسيق متكامل.",
    locationLabel: "الموقع",
    sectorLabel: "القطاع",
    location: "مصر",
    sector: "المقاولات والتطوير العقاري",
    overviewLabel: "٠١ / التعاون",
    overviewTitle: "شريك واحد. تخصصات متكاملة.",
    overview: "NOVA HILLS PRIME شركة مقاولات وتطوير عقاري في مصر. يشمل تعاون Mason&Arc تطوير الهوية البصرية وتصميم الموقع وتطويره، والتصميم المعماري والداخلي وأعمال التنفيذ. الأعمال المعروضة توثّق الهوية والتجربة الرقمية المكتملة، وستُضاف الأعمال المعمارية والمنفذة عند توفر توثيق حقيقي معتمد.",
    scopeLabel: "٠٢ / نطاق عملنا",
    scopeTitle: "نطاق واحد مترابط.",
    stages: [
      ["٠١", "الهوية البصرية", "توجيه الهوية وتطبيقاتها المتسقة.", "تطوير الهوية"],
      ["٠٢", "الموقع والتجربة الرقمية", "تجربة ثنائية اللغة وتصميم متجاوب وتنفيذ كامل.", "الموقع متاح"],
      ["٠٣", "التصميم المعماري", "المفاهيم المعمارية والتخطيط وتطوير التصميم.", "قيد التطوير"],
      ["٠٤", "التصميم الداخلي", "تطوير الفراغات والخامات والتفاصيل.", "قيد التطوير"],
      ["٠٥", "التنفيذ", "تنسيق أعمال التسليم والمقاولات والتنفيذ بالموقع.", "قيد التطوير"],
    ],
    proof: "النطاق يصف التعاون ولا يعني اكتمال أعمال غير موثقة. لن تُنشر صور التنفيذ أو نتائج الموقع إلا بعد توثيقها واعتمادها.",
    viewSite: "زيارة موقع NOVA HILLS PRIME",
    back: "كل المشروعات",
    nextLabel: "عندك مشروع؟",
    nextTitle: "خلّينا نبدأ.",
    nextAction: "تواصل معنا",
    visualCaption: "NOVA HILLS PRIME — نظام الهوية والتجربة الرقمية."
  },
  it: {
    index: "Case study / 001",
    collaboration: "Collaborazione integrata",
    discipline: "Identità · Digitale · Architettura · Interni · Realizzazione",
    status: "Collaborazione in corso",
    subtitle: "Identità aziendale, presenza digitale e collaborazione dal progetto alla realizzazione, con una visione coordinata.",
    locationLabel: "Luogo",
    sectorLabel: "Settore",
    location: "Egitto",
    sector: "Costruzioni e sviluppo immobiliare",
    overviewLabel: "01 / La collaborazione",
    overviewTitle: "Un partner. Più discipline.",
    overview: "NOVA HILLS PRIME opera nelle costruzioni e nello sviluppo immobiliare in Egitto. La collaborazione con Mason&Arc comprende identità visiva, sito web, progettazione architettonica e d’interni e realizzazione. Qui sono presentati l’identità e il lavoro digitale completato; le fasi architettoniche e di cantiere saranno documentate con materiali verificati.",
    scopeLabel: "02 / Il nostro ruolo",
    scopeTitle: "Un incarico coordinato.",
    stages: [
      ["01", "Identità visiva", "Direzione e applicazioni coordinate del marchio.", "Direzione visiva"],
      ["02", "Sito web", "Esperienza bilingue, design responsive e sviluppo.", "Sito online"],
      ["03", "Architettura", "Concept, pianificazione e sviluppo progettuale.", "In corso"],
      ["04", "Interni", "Spazi, materiali e dettagli.", "In corso"],
      ["05", "Realizzazione", "Coordinamento, costruzione e attività in cantiere.", "In corso"],
    ],
    proof: "L’incarico descrive la collaborazione, non opere non verificate. Fotografie e risultati di cantiere saranno pubblicati solo dopo documentazione e approvazione.",
    viewSite: "Visita il sito NOVA HILLS PRIME",
    back: "Tutti i progetti",
    nextLabel: "Hai un progetto?",
    nextTitle: "Creiamo insieme.",
    nextAction: "Contattaci",
    visualCaption: "NOVA HILLS PRIME — sistema d’identità ed esperienza digitale."
  }
} as const;

export default function NovaHillsCaseStudy() {
  const { locale } = useLocale();
  const t = words[locale];
  const isArabic = locale === "ar";

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <main dir={isArabic ? "rtl" : "ltr"} className="overflow-x-hidden bg-[#f4f2ed] text-[#171c20]">
      <section className="relative bg-[#151b20] px-5 pb-16 pt-28 text-white sm:px-8 md:pb-24 md:pt-32 lg:px-16">
        <div className="mx-auto max-w-[1480px]">
          <div className="flex flex-col gap-5 border-y border-white/15 py-4 sm:flex-row sm:items-center sm:justify-between">
            <span className="text-[9px] uppercase tracking-[.23em] text-white/45">{t.index}</span>
            <div className="flex items-center gap-3 text-[9px] uppercase tracking-[.23em] text-white/55">
              <span className="h-1.5 w-1.5 rounded-full bg-[#c51b29]" aria-hidden="true" />
              <span>{t.status}</span>
            </div>
          </div>

          <div className="grid gap-12 pb-14 pt-14 lg:grid-cols-[1.3fr_.7fr] lg:items-end lg:pb-20 lg:pt-20">
            <div>
              <p className="text-[10px] uppercase tracking-[.24em] text-white/45">{t.discipline}</p>
              <h1 dir="ltr" className={`mt-7 max-w-[980px] text-[clamp(4.15rem,10vw,10.5rem)] font-light leading-[.8] tracking-[-.065em] ${isArabic ? "text-right" : ""}`}>NOVA<br />HILLS PRIME<span className="text-[#c51b29]">.</span></h1>
            </div>
            <div className="border-t border-white/20 pt-6 lg:mb-1">
              <p className="text-[10px] uppercase tracking-[.24em] text-white/40">{t.collaboration}</p>
              <p className="mt-5 max-w-xl text-[clamp(1.05rem,1.45vw,1.35rem)] font-light leading-[1.7] text-white/65">{t.subtitle}</p>
              <dl className="mt-8 grid grid-cols-2 gap-5 border-t border-white/10 pt-5 text-[9px] uppercase tracking-[.2em] text-white/35">
                <div><dt>{t.locationLabel}</dt><dd className="mt-2 text-white/70">{t.location}</dd></div>
                <div><dt>{t.sectorLabel}</dt><dd className="mt-2 text-white/70">{t.sector}</dd></div>
              </dl>
            </div>
          </div>

          <figure>
            <div className="relative aspect-[16/9] overflow-hidden border border-white/15 bg-[#0d1013]">
              <Image src={identity} alt="NOVA HILLS PRIME identity system and website presentation" fill priority sizes="(max-width: 1536px) 100vw, 1480px" className="object-cover" />
            </div>
            <div className="flex flex-col gap-4 border-b border-white/15 py-5 sm:flex-row sm:items-center sm:justify-between">
              <figcaption className="text-[9px] uppercase tracking-[.2em] text-white/40">{t.visualCaption}</figcaption>
              <a href="https://novahillseg.com/" target="_blank" rel="noopener noreferrer" className="group inline-flex items-center gap-3 text-[10px] uppercase tracking-[.2em] text-white/70 transition-colors hover:text-white">{t.viewSite}<span aria-hidden="true" className="transition-transform group-hover:-translate-y-1 group-hover:translate-x-1">↗</span></a>
            </div>
          </figure>
        </div>
      </section>

      <section className="px-5 py-24 sm:px-8 md:py-36 lg:px-16">
        <div className="mx-auto grid max-w-[1480px] gap-12 lg:grid-cols-[.32fr_1fr]">
          <p className="text-[9px] uppercase tracking-[.26em] text-[#65747d]">{t.overviewLabel}</p>
          <div>
            <h2 className="max-w-[1100px] text-[clamp(3rem,7vw,7.3rem)] font-light leading-[.9] tracking-[-.06em]">{t.overviewTitle}</h2>
            <p className="mt-10 max-w-4xl text-[clamp(1.05rem,1.5vw,1.35rem)] leading-[1.85] text-[#59636a]">{t.overview}</p>
          </div>
        </div>
      </section>

      <section className="border-y border-[#c9c7c1] bg-[#ebe8e1] px-5 py-24 sm:px-8 md:py-32 lg:px-16">
        <div className="mx-auto max-w-[1480px]">
          <div className="grid gap-8 lg:grid-cols-[.32fr_1fr]">
            <p className="text-[9px] uppercase tracking-[.26em] text-[#65747d]">{t.scopeLabel}</p>
            <h2 className="text-[clamp(3rem,6vw,6.6rem)] font-light leading-[.9] tracking-[-.055em]">{t.scopeTitle}</h2>
          </div>
          <div className="mt-16 border-t border-[#bdbab2]">
            {t.stages.map(([number, title, description, status]) => (
              <div key={number} className="grid gap-4 border-b border-[#bdbab2] py-7 md:grid-cols-[70px_1fr_1.35fr_180px] md:items-center md:py-9">
                <span className="text-[10px] text-[#65747d]">{number}</span>
                <h3 className="text-[clamp(1.35rem,2.1vw,2.25rem)] font-light tracking-[-.035em]">{title}</h3>
                <p className="max-w-xl text-sm leading-7 text-[#59636a]">{description}</p>
                <p className="text-[10px] uppercase tracking-[.16em] text-[#65747d]">{status}</p>
              </div>
            ))}
          </div>
          <p className="mt-9 max-w-3xl border-s-2 border-[#c51b29] ps-5 text-sm leading-7 text-[#59636a]">{t.proof}</p>
        </div>
      </section>

      <section className="bg-[#4e6673] px-5 py-24 text-white sm:px-8 md:py-32 lg:px-16">
        <div className="mx-auto max-w-[1480px]">
          <p className="text-[9px] uppercase tracking-[.28em] text-white/55">{t.nextLabel}</p>
          <h2 className="mt-7 text-[clamp(3.8rem,10vw,10rem)] font-light leading-[.82] tracking-[-.06em]">{t.nextTitle}</h2>
          <div className="mt-14 flex flex-wrap gap-8 text-sm">
            <Link href="/contact" className="border-b border-white pb-2">{t.nextAction} ↗</Link>
            <Link href="/projects" className="border-b border-white/35 pb-2">{t.back} ↗</Link>
          </div>
        </div>
      </section>
    </main>
  );
}
