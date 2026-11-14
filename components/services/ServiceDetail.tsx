"use client";

import Link from "next/link";
import Reveal from "@/components/animations/Reveal";
import LetsCreateCTA from "@/components/shared/LetsCreateCTA";
import { useLocale } from "@/components/i18n/LocaleProvider";
import { serviceSlugs, servicesContent, type ServiceSlug } from "@/components/services/ServicesHero";

const navigationCopy = {
  en: { back: "All services", capabilities: "Capabilities", for: "Who it is for", deliverables: "Typical deliverables", examples: "Where it can lead", specialist: "Specialist offering", cta: "Start a conversation" },
  ar: { back: "كل الخدمات", capabilities: "القدرات", for: "لمن هذه الخدمة", deliverables: "المخرجات المعتادة", examples: "ما الذي يمكن أن تصنعه", specialist: "خدمة متخصصة", cta: "ابدأ محادثة" },
  it: { back: "Tutti i servizi", capabilities: "Competenze", for: "Per chi", deliverables: "Deliverable tipici", examples: "Dove può portare", specialist: "Offerta specialistica", cta: "Inizia una conversazione" },
} as const;

export default function ServiceDetail({ slug }: { slug: ServiceSlug }) {
  const { locale } = useLocale();
  const index = serviceSlugs.indexOf(slug);
  const service = servicesContent[locale].services[index];
  const copy = navigationCopy[locale];

  return (
    <main className="bg-[#f8f7f4] text-neutral-900">
      <section className="px-6 pb-20 pt-32 sm:px-8 md:px-10 md:pb-28 lg:px-16 lg:pt-40">
        <div className="mx-auto max-w-[1600px]">
          <Link href="/services" className="inline-flex text-[9px] uppercase tracking-[.3em] text-neutral-500 transition hover:text-black">← {copy.back}</Link>
          <div className="mt-16 grid gap-10 lg:grid-cols-[120px_minmax(0,1fr)] lg:gap-10">
            <p className="text-[10px] tracking-[.25em] text-[#4F6B7A]">0{index + 1}</p>
            <div>
              <Reveal>
                <h1 className={`${locale === "ar" ? "text-[clamp(3.3rem,8vw,7rem)]" : "text-[clamp(3.8rem,8vw,7.8rem)]"} max-w-6xl font-extralight leading-[.88] tracking-[-.06em]`}>{service.title}</h1>
              </Reveal>
              <p className="mt-10 max-w-3xl text-xl font-light leading-9 text-neutral-600 md:text-2xl md:leading-10">{service.intro}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="border-t border-neutral-300 px-6 py-20 sm:px-8 md:px-10 md:py-28 lg:px-16">
        <div className="mx-auto grid max-w-[1600px] gap-14 lg:grid-cols-[120px_minmax(0,1fr)] lg:gap-10">
          <p className="text-[9px] uppercase tracking-[.3em] text-neutral-400">{copy.capabilities}</p>
          <ul className="grid gap-x-12 gap-y-5 text-xl font-light leading-8 sm:grid-cols-2 lg:text-2xl">
            {service.capabilities.map((item) => <li key={item} className="border-b border-neutral-300 pb-5">{item}</li>)}
          </ul>
        </div>
      </section>

      <section className="bg-neutral-900 px-6 py-20 text-white sm:px-8 md:px-10 md:py-28 lg:px-16">
        <div className="mx-auto grid max-w-[1600px] gap-px bg-white/15 md:grid-cols-3">
          <DetailBlock label={copy.for} text={service.for} />
          <DetailBlock label={copy.deliverables} text={service.deliverables} />
          <DetailBlock label={copy.examples} text={service.examples} />
        </div>
        <div className="mx-auto mt-16 grid max-w-[1600px] gap-8 border-t border-white/20 pt-10 lg:grid-cols-[120px_minmax(0,1fr)]">
          <p className="text-[9px] uppercase tracking-[.3em] text-white/45">{copy.specialist}</p>
          <p className="max-w-4xl text-2xl font-light leading-9 text-white/80 md:text-4xl md:leading-[1.25]">{service.specialist}</p>
        </div>
      </section>

      <LetsCreateCTA href={`/contact?service=discipline-${index + 1}`} />
    </main>
  );
}

function DetailBlock({ label, text }: { label: string; text: string }) {
  return <div className="bg-neutral-900 p-8 md:p-10"><p className="text-[9px] uppercase tracking-[.3em] text-white/40">{label}</p><p className="mt-8 text-base font-light leading-8 text-white/70">{text}</p></div>;
}
