"use client";

import Image from "next/image";
import Link from "next/link";
import { useLocale } from "@/components/i18n/LocaleProvider";

const logo = "https://novahillseg.com/assets/logo-novahills-transparent.png";
const identity = "https://novahillseg.com/assets/NOVA-HILLS-PRIME-brand-experience.png";

const words = {
  en: {
    index: "MASON & ARC / INTEGRATED COLLABORATION 001",
    discipline: "Brand identity · Digital · Architecture · Delivery",
    status: "Collaboration in progress",
    subtitle: "A company identity, a digital presence, and a wider design-to-delivery partnership — developed with one coordinated point of view.",
    overviewLabel: "01 / THE COLLABORATION",
    overviewTitle: "One partner. Across disciplines.",
    overview: "NOVA HILLS PRIME is a construction and real estate development business in Egypt. Mason & Arc's collaboration spans brand identity, website design and development, architectural design, interiors, and execution. The identity and website shown here are visible design work; architectural and on-site delivery work will be documented only as verified material becomes available.",
    previewLabel: "02 / IDENTITY & DIGITAL",
    previewTitle: "A brand built to be recognized.",
    previewBody: "The original NOVA HILLS PRIME mark remains intact. Its restrained red, charcoal and light-neutral system carries through the digital experience, with clear hierarchy, bilingual content and a responsive presentation.",
    scopeLabel: "03 / OUR ROLE",
    scopeTitle: "An integrated scope.",
    stages: [
      ["01", "Brand identity", "Identity direction and consistent brand applications.", "Identity direction"],
      ["02", "Website & digital", "Website design, bilingual experience and responsive implementation.", "Live website"],
      ["03", "Architecture", "Architectural concept, planning and design development.", "Within collaboration scope"],
      ["04", "Interiors", "Interior architecture, material thinking and detailing.", "Within collaboration scope"],
      ["05", "Execution", "Delivery coordination, construction and site execution.", "Within collaboration scope"],
    ],
    proof: "Scope does not imply completion. Built-work photography and construction results will only be added when independently documented and approved for publication.",
    viewSite: "Visit the NOVA HILLS PRIME website",
    back: "All projects",
    nextLabel: "HAVE A PROJECT IN MIND?",
    nextTitle: "Let's create.",
    nextAction: "Start a conversation",
    visualCaption: "NOVA HILLS PRIME — original brand artwork / design presentation."
  },
  ar: {
    index: "MASON & ARC / التعاون المتكامل ٠٠١",
    discipline: "الهوية البصرية · التجربة الرقمية · العمارة · التنفيذ",
    status: "التعاون مستمر",
    subtitle: "هوية شركة وحضور رقمي وشراكة أوسع في التصميم والتنفيذ، برؤية واحدة وتنسيق متكامل.",
    overviewLabel: "٠١ / التعاون",
    overviewTitle: "شريك واحد. تخصصات متكاملة.",
    overview: "NOVA HILLS PRIME شركة مقاولات وتطوير عقاري في مصر. يشمل نطاق تعاون Mason & Arc تطوير الهوية البصرية وتصميم الموقع وتطويره، والتصميم المعماري والداخلي وأعمال التنفيذ. الأعمال المعروضة حاليًا توثق اتجاه الهوية والموقع الإلكتروني، وستضاف الأعمال المعمارية والمنفذة فقط عند توفر توثيق حقيقي معتمد.",
    previewLabel: "٠٢ / الهوية والموقع",
    previewTitle: "هوية واضحة وحضور متكامل.",
    previewBody: "نحافظ على شعار NOVA HILLS PRIME الأصلي من دون تغيير، مع نظام بصري يعتمد الأحمر والرمادي الداكن والخلفيات الهادئة، وتسلسل بصري واضح وموقع متجاوب بلغتين.",
    scopeLabel: "٠٣ / نطاق عملنا",
    scopeTitle: "خدمات تحت رؤية واحدة.",
    stages: [
      ["٠١", "الهوية البصرية", "توجيه الهوية وتطبيقاتها المتسقة.", "تطوير الهوية"],
      ["٠٢", "الموقع والتجربة الرقمية", "تصميم وتطوير موقع متجاوب باللغتين.", "الموقع متاح"],
      ["٠٣", "التصميم المعماري", "المفاهيم المعمارية والتخطيط وتطوير التصميم.", "ضمن نطاق التعاون"],
      ["٠٤", "التصميم الداخلي", "تطوير الفراغات والخامات والتفاصيل.", "ضمن نطاق التعاون"],
      ["٠٥", "التنفيذ", "تنسيق أعمال التسليم والمقاولات والتنفيذ بالموقع.", "ضمن نطاق التعاون"],
    ],
    proof: "نطاق المسؤولية لا يعني اكتمال التنفيذ. لن ننشر صور مبانٍ منفذة أو نتائج إنشائية إلا بعد توثيقها واعتماد نشرها.",
    viewSite: "زيارة موقع NOVA HILLS PRIME",
    back: "كل المشروعات",
    nextLabel: "عندك مشروع؟",
    nextTitle: "خلّينا نبدأ.",
    nextAction: "تواصل معنا",
    visualCaption: "NOVA HILLS PRIME — تطبيق الهوية الأصلية وعرض التصميم."
  },
  it: {
    index: "MASON & ARC / COLLABORAZIONE INTEGRATA 001",
    discipline: "Identità · Digitale · Architettura · Realizzazione",
    status: "Collaborazione in corso",
    subtitle: "Identità aziendale, presenza digitale e collaborazione dal progetto alla realizzazione, con una visione coordinata.",
    overviewLabel: "01 / LA COLLABORAZIONE",
    overviewTitle: "Un partner. Più discipline.",
    overview: "NOVA HILLS PRIME opera nelle costruzioni e nello sviluppo immobiliare in Egitto. La collaborazione con Mason & Arc comprende identità visiva, sito web, progettazione architettonica e d'interni e realizzazione. Qui sono presentati i lavori di identità e web; le fasi architettoniche e di cantiere saranno documentate solo con materiali verificati.",
    previewLabel: "02 / IDENTITÀ E DIGITALE",
    previewTitle: "Un'identità riconoscibile.",
    previewBody: "Il marchio originale NOVA HILLS PRIME viene preservato. Rosso, antracite e toni chiari definiscono un sistema essenziale, applicato a un sito bilingue e responsive.",
    scopeLabel: "03 / IL NOSTRO RUOLO",
    scopeTitle: "Un incarico integrato.",
    stages: [
      ["01", "Identità visiva", "Direzione e applicazioni coordinate del marchio.", "Direzione visiva"],
      ["02", "Sito web", "Design e sviluppo responsive e bilingue.", "Sito online"],
      ["03", "Architettura", "Concept, pianificazione e sviluppo progettuale.", "Nell'ambito dell'incarico"],
      ["04", "Interni", "Spazi, materiali e dettagli.", "Nell'ambito dell'incarico"],
      ["05", "Realizzazione", "Coordinamento, costruzione e attività in cantiere.", "Nell'ambito dell'incarico"],
    ],
    proof: "L'ambito dell'incarico non equivale a opere completate. Fotografie e risultati di cantiere saranno pubblicati solo dopo verifica.",
    viewSite: "Visita il sito NOVA HILLS PRIME",
    back: "Tutti i progetti",
    nextLabel: "HAI UN PROGETTO?",
    nextTitle: "Creiamo insieme.",
    nextAction: "Contattaci",
    visualCaption: "NOVA HILLS PRIME — applicazioni del marchio originale."
  }
} as const;

export default function NovaHillsCaseStudy() {
  const { locale } = useLocale();
  const t = words[locale];
  return (
    <main dir={locale === "ar" ? "rtl" : "ltr"} className="overflow-x-hidden bg-[#f7f6f3] text-[#1c2226]">
      <section className="relative bg-[#161b20] px-6 pb-20 pt-36 text-white sm:px-10 md:pb-28 md:pt-44 lg:px-16">
        <div className="mx-auto max-w-[1450px]">
          <div className="flex flex-wrap items-center justify-between gap-5 text-[10px] uppercase tracking-[.25em] text-white/55">
            <span>{t.index}</span>
            <span className="border border-white/30 px-3 py-2">{t.status}</span>
          </div>
          <div className="mt-16 grid items-end gap-16 lg:grid-cols-[1.15fr_.85fr]">
            <div>
              <p className="text-[11px] uppercase tracking-[.22em] text-[#b8c6cf]">{t.discipline}</p>
              <h1 className="mt-7 max-w-[850px] font-light text-[clamp(3.4rem,9vw,9rem)] leading-[.86] tracking-[-.06em]">NOVA<br />HILLS PRIME<span className="text-[#b51220]">.</span></h1>
              <p className="mt-10 max-w-xl text-[clamp(1.15rem,1.8vw,1.5rem)] font-light leading-relaxed text-white/65">{t.subtitle}</p>
            </div>
            <div className="flex min-h-[260px] items-center justify-center border border-white/15 bg-[#232a30] p-12">
              <Image src={logo} alt="Original NOVA HILLS PRIME logo" width={560} height={220} unoptimized sizes="(max-width: 1024px) 85vw, 40vw" className="h-auto max-h-[170px] w-full object-contain" />
            </div>
          </div>
        </div>
      </section>
      <section className="px-6 py-24 sm:px-10 md:py-36 lg:px-16">
        <div className="mx-auto grid max-w-[1450px] gap-10 lg:grid-cols-[.35fr_1fr]">
          <p className="text-[10px] uppercase tracking-[.28em] text-[#4f6b7a]">{t.overviewLabel}</p>
          <div><h2 className="max-w-[1000px] text-[clamp(2.8rem,6vw,6rem)] font-light leading-[.95] tracking-[-.055em]">{t.overviewTitle}</h2><p className="mt-10 max-w-3xl text-lg leading-[1.85] text-[#596067]">{t.overview}</p></div>
        </div>
      </section>
      <section className="bg-[#e8e7e3] px-6 py-24 sm:px-10 lg:px-16">
        <div className="mx-auto max-w-[1450px]">
          <div className="grid gap-7 pb-12 lg:grid-cols-[.35fr_1fr]"><p className="text-[10px] uppercase tracking-[.28em] text-[#4f6b7a]">{t.previewLabel}</p><div><h2 className="text-[clamp(2.7rem,5.5vw,5.8rem)] font-light leading-[.95] tracking-[-.045em]">{t.previewTitle}</h2><p className="mt-7 max-w-3xl text-base leading-8 text-[#596067]">{t.previewBody}</p></div></div>
          <figure><div className="relative aspect-[16/10] w-full overflow-hidden bg-white"><Image src={identity} fill unoptimized sizes="100vw" alt="NOVA HILLS PRIME brand presentation visual" className="object-contain" /></div><figcaption className="mt-4 text-[10px] uppercase tracking-[.15em] text-[#596067]">{t.visualCaption}</figcaption></figure>
          <a href="https://novahillseg.com/" target="_blank" rel="noopener noreferrer" className="mt-10 inline-flex border-b border-[#4f6b7a] pb-3 text-xs uppercase tracking-[.18em] hover:text-[#4f6b7a]">{t.viewSite} ↗</a>
        </div>
      </section>
      <section className="px-6 py-24 sm:px-10 md:py-36 lg:px-16">
        <div className="mx-auto max-w-[1450px]">
          <p className="text-[10px] uppercase tracking-[.28em] text-[#4f6b7a]">{t.scopeLabel}</p>
          <h2 className="mt-7 text-[clamp(2.8rem,6vw,6rem)] font-light leading-[.95] tracking-[-.055em]">{t.scopeTitle}</h2>
          <div className="mt-14 border-t border-[#c7c7c1]">{t.stages.map(([number,title,description,status]) => <div key={number} className="grid gap-4 border-b border-[#c7c7c1] py-8 md:grid-cols-[80px_1fr_1.5fr_220px] md:items-center"><span className="text-[11px] text-[#4f6b7a]">{number}</span><h3 className="text-[clamp(1.4rem,2vw,2rem)] font-light">{title}</h3><p className="max-w-lg text-sm leading-7 text-[#596067]">{description}</p><p className="text-xs text-[#4f6b7a]">{status}</p></div>)}</div>
          <p className="mt-8 max-w-2xl border-s-2 border-[#4f6b7a] ps-5 text-sm leading-7 text-[#596067]">{t.proof}</p>
        </div>
      </section>
      <section className="bg-[#4f6b7a] px-6 py-24 text-white sm:px-10 md:py-32 lg:px-16"><div className="mx-auto max-w-[1450px]"><p className="text-[10px] uppercase tracking-[.3em] text-white/60">{t.nextLabel}</p><h2 className="mt-7 text-[clamp(3.3rem,9vw,9rem)] font-light leading-[.9] tracking-[-.055em]">{t.nextTitle}</h2><div className="mt-14 flex flex-wrap gap-8 text-sm"><Link href="/contact" className="border-b border-white pb-2">{t.nextAction} ↗</Link><Link href="/projects" className="border-b border-white/40 pb-2">{t.back} ↗</Link></div></div></section>
    </main>
  );
}
