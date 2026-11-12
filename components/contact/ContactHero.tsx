"use client";

import Reveal from "@/components/animations/Reveal";
import Container from "@/components/shared/Container";
import { useLocale } from "@/components/i18n/LocaleProvider";

const contactCopy = {
  en: {
    heading: ["Let’s", "Create."],
    intro: "Have a project in mind? Tell us about it. From architecture and interior design to detailed design development and delivery advisory, we would be glad to hear from you.",
    email: "Email",
    egypt: "Egypt",
    whatsapp: "WhatsApp",
    italy: "Italy",
    instagram: "Instagram",
    start: "Start a conversation",
    disciplines: "Architecture · Interiors · Design Development",
  },
  ar: {
    heading: ["لنصمّم", "معًا."],
    intro: "هل لديك مشروع؟ حدّثنا عنه. من العمارة والتصميم الداخلي إلى التطوير التفصيلي واستشارات التنفيذ عند الحاجة، يسعدنا أن نسمع منك.",
    email: "البريد الإلكتروني",
    egypt: "مصر",
    whatsapp: "واتساب",
    italy: "إيطاليا",
    instagram: "إنستغرام",
    start: "ابدأ محادثة",
    disciplines: "العمارة · التصميم الداخلي · تطوير التصميم",
  },
  it: {
    heading: ["Creiamo", "insieme."],
    intro: "Hai un progetto in mente? Raccontacelo. Dall’architettura e dagli interni allo sviluppo del dettaglio e alla consulenza per la realizzazione, saremo lieti di ascoltarti.",
    email: "Email",
    egypt: "Egitto",
    whatsapp: "WhatsApp",
    italy: "Italia",
    instagram: "Instagram",
    start: "Inizia una conversazione",
    disciplines: "Architettura · Interni · Sviluppo del progetto",
  },
} as const;

export default function ContactHero() {
  const { locale } = useLocale();
  const copy = contactCopy[locale];
  return (
    <section className="min-h-screen bg-[#f8f7f4] text-neutral-900">
      <Container className="flex min-h-screen flex-col justify-between px-8 pb-12 pt-28 md:px-12 md:pb-16 md:pt-36 lg:px-16 lg:pb-20 lg:pt-40">

        {/* Top */}
        <div>
          <Reveal>
            <p >
              
            </p>
          </Reveal>
        </div>

        {/* Main */}
        <div className="grid grid-cols-1 gap-20 pb-20 lg:grid-cols-[1.35fr_0.65fr] lg:items-end">

          {/* Heading */}
          <div>
            <Reveal>
              <h1
                className="
                  max-w-[900px]
                  text-[72px]
                  font-extralight
                  leading-[0.84]
                  tracking-[-0.06em]
                  sm:text-[96px]
                  md:text-[125px]
                  lg:text-[150px]
                "
              >
                {copy.heading[0]}
                <br />
                {copy.heading[1]}
              </h1>
            </Reveal>

            <Reveal>
              <p className="mt-12 max-w-[560px] text-[15px] font-light leading-[1.9] text-neutral-600 md:text-[17px]">
                {copy.intro}
              </p>
            </Reveal>
          </div>

          {/* Contact Details */}
          <Reveal>
            <div className="border-t border-neutral-300">

              {/* Email */}
              <a
                href="mailto:Masonandarc@gmail.com"
                className="flex items-center justify-between gap-6 border-b border-neutral-300 py-7 transition-opacity duration-300 hover:opacity-50"
              >
                <span className="text-[10px] uppercase tracking-[0.35em] text-neutral-400">
                  {copy.email}
                </span>

                <span className="text-right text-[13px] font-light">
                  Masonandarc@gmail.com
                </span>
              </a>

              {/* Egypt */}
              <a
                href="tel:+201044007555"
                className="flex items-center justify-between gap-6 border-b border-neutral-300 py-7 transition-opacity duration-300 hover:opacity-50"
              >
                <span className="text-[10px] uppercase tracking-[0.35em] text-neutral-400">
                  {copy.egypt}
                </span>

                <span className="text-[13px] font-light">
                  +20 1044007555
                </span>
              </a>

              {/* WhatsApp */}
              <a
                href="https://wa.me/201044007555"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between gap-6 border-b border-neutral-300 py-7 transition-opacity duration-300 hover:opacity-50"
              >
                <span className="text-[10px] uppercase tracking-[0.35em] text-neutral-400">
                  {copy.whatsapp}
                </span>

                <span dir="ltr" className="text-[13px] font-light">
                  +20 10 440 07555 ↗
                </span>
              </a>

              {/* Italy */}
              <a
                href="tel:+393200534654"
                className="flex items-center justify-between gap-6 border-b border-neutral-300 py-7 transition-opacity duration-300 hover:opacity-50"
              >
                <span className="text-[10px] uppercase tracking-[0.35em] text-neutral-400">
                  {copy.italy}
                </span>

                <span className="text-[13px] font-light">
                  +39 320 053 4654
                </span>
              </a>

              {/* Instagram */}
              <a
                href="https://www.instagram.com/masonandarc/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between gap-6 border-b border-neutral-300 py-7 transition-opacity duration-300 hover:opacity-50"
              >
                <span className="text-[10px] uppercase tracking-[0.35em] text-neutral-400">
                  {copy.instagram}
                </span>

                <span className="text-[13px] font-light">
                  @masonandarc ↗
                </span>
              </a>

            </div>
          </Reveal>

        </div>

        {/* Bottom */}
        <Reveal>
          <div className="flex flex-col gap-4 border-t border-neutral-300 pt-6 text-[10px] uppercase tracking-[0.3em] text-neutral-400 md:flex-row md:items-center md:justify-between">
            <span>{copy.start}</span>
            <span>{copy.disciplines}</span>
          </div>
        </Reveal>

      </Container>
    </section>
  );
}
