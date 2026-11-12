"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import Reveal from "@/components/animations/Reveal";
import Container from "@/components/shared/Container";
import { useLocale } from "@/components/i18n/LocaleProvider";

const servicesPageCopy = {
  en: {
    hero: ["Design.", "Develop.", "Realize."],
    introPrimary: "We approach architecture as a complete design process — from the first idea through detailed development and coordination.",
    introSecondary: "From concept to detailed design, we shape each project with clarity and precision. Where required, we support delivery through carefully selected specialist partners.",
    scroll: "Scroll to explore",
    sectionLabel: "01 — Services",
    heading: ["Architecture,", "interiors,", "design and advisory."],
    experience: "02 — Experience",
    next: "Next",
    services: [
      { number: "01", title: "Architecture", description: "Architectural concepts and complete design solutions shaped around context, function, and timeless form." },
      { number: "02", title: "Interior Design", description: "Interior spaces developed through material, proportion, light, and a clear relationship between architecture and experience." },
      { number: "03", title: "Design Development", description: "From concept to detailed design, we develop every element with precision, clarity, and attention to detail." },
      { number: "04", title: "Design & Delivery Advisory", description: "Where required, we advise on the selection and coordination of specialist delivery partners, helping carry the architectural vision through to realization with clarity and care." },
    ],
  },
  ar: {
    hero: ["تصميم.", "تطوير.", "تحقيق."],
    introPrimary: "نتعامل مع العمارة كعملية تصميم متكاملة — من الفكرة الأولى إلى التطوير التفصيلي والتنسيق.",
    introSecondary: "من الفكرة إلى التصميم التفصيلي، نطوّر كل مشروع بوضوح ودقة. وعند الحاجة، ندعم مرحلة التنفيذ من خلال شركاء متخصصين يتم اختيارهم بعناية.",
    scroll: "مرّر للاستكشاف",
    sectionLabel: "01 — الخدمات",
    heading: ["العمارة،", "والتصميم الداخلي،", "والتطوير والاستشارات."],
    experience: "02 — الخبرة",
    next: "التالي",
    services: [
      { number: "01", title: "العمارة", description: "أفكار معمارية وحلول تصميم متكاملة تتشكل وفقًا للسياق والوظيفة والشكل الخالد." },
      { number: "02", title: "التصميم الداخلي", description: "فراغات داخلية تتطور من خلال الخامات والنِسب والضوء والعلاقة الواضحة بين العمارة وتجربة المكان." },
      { number: "03", title: "تطوير التصميم", description: "من الفكرة إلى التصميم التفصيلي، نطوّر كل عنصر بدقة ووضوح واهتمام بالتفاصيل." },
      { number: "04", title: "استشارات التصميم ودعم التنفيذ", description: "عند الحاجة، نقدم المشورة في اختيار وتنسيق شركاء تنفيذ متخصصين، للمساعدة في تحقيق الرؤية المعمارية بوضوح وعناية." },
    ],
  },
  it: {
    hero: ["Progettare.", "Sviluppare.", "Realizzare."],
    introPrimary: "Affrontiamo l’architettura come un processo progettuale completo — dalla prima idea allo sviluppo del dettaglio e al coordinamento.",
    introSecondary: "Dal concept al progetto dettagliato, sviluppiamo ogni intervento con chiarezza e precisione. Quando richiesto, supportiamo la realizzazione attraverso partner specialistici selezionati con cura.",
    scroll: "Scorri per esplorare",
    sectionLabel: "01 — Servizi",
    heading: ["Architettura,", "interni,", "progetto e consulenza."],
    experience: "02 — Esperienza",
    next: "Avanti",
    services: [
      { number: "01", title: "Architettura", description: "Concept architettonici e soluzioni progettuali complete, definite dal contesto, dalla funzione e da forme senza tempo." },
      { number: "02", title: "Interior Design", description: "Spazi interni sviluppati attraverso materia, proporzione, luce e una relazione chiara tra architettura ed esperienza." },
      { number: "03", title: "Sviluppo del progetto", description: "Dal concept al progetto dettagliato, sviluppiamo ogni elemento con precisione, chiarezza e attenzione al dettaglio." },
      { number: "04", title: "Consulenza al progetto e alla realizzazione", description: "Quando richiesto, affianchiamo il cliente nella selezione e nel coordinamento di partner specialistici, preservando con chiarezza e cura la visione architettonica." },
    ],
  },
} as const;

export default function ServicesHero() {
  const servicesRef = useRef<HTMLDivElement>(null);
  const { locale } = useLocale();
  const pageCopy = servicesPageCopy[locale];

  useEffect(() => {
    if (!servicesRef.current) return;

    const rows =
      servicesRef.current.querySelectorAll<HTMLElement>(".service-row");

    const ctx = gsap.context(() => {
      gsap.from(rows, {
        y: 70,
        opacity: 0,
        duration: 1,
        stagger: 0.12,
        ease: "power4.out",
        scrollTrigger: {
          trigger: servicesRef.current,
          start: "top 78%",
          once: true,
        },
      });
    }, servicesRef);

    return () => ctx.revert();
  }, []);

  return (
    <main className="bg-[#f8f7f4] text-neutral-900">

      {/* =====================================================
          HERO
      ====================================================== */}

      <section className="relative min-h-screen">

        <Container
          className="
            !max-w-none
            px-5
            pb-24
            pt-32
            sm:px-8
            md:px-10
            lg:px-14
            lg:pt-36
            xl:px-16
          "
        >

          <div
            className="
              grid
              min-h-[calc(100vh-8rem)]
              grid-cols-1
              lg:grid-cols-[1.05fr_0.95fr]
              lg:gap-x-16
              xl:grid-cols-[1.1fr_0.9fr]
              xl:gap-x-24
            "
          >

            {/* =================================================
                LEFT — TITLE
            ================================================== */}

            <Reveal>
              <div
                className="
                  flex
                  h-full
                  flex-col
                  justify-end
                  pb-10
                  lg:pb-20
                "
              >

                <h1
                  className="
                    max-w-[850px]
                    text-[72px]
                    font-extralight
                    leading-[0.82]
                    tracking-[-0.065em]
                    sm:text-[100px]
                    md:text-[125px]
                    lg:text-[145px]
                    xl:text-[165px]
                  "
                >
                  {pageCopy.hero.map((line) => (
                    <span key={line} className="block">{line}</span>
                  ))}
                </h1>


                <p
                  className="
                    mt-12
                    max-w-[560px]
                    text-[14px]
                    font-light
                    leading-[1.85]
                    text-neutral-600
                    sm:text-[15px]
                    md:text-[16px]
                    lg:mt-14
                  "
                >
                  {pageCopy.introPrimary}
                </p>

              </div>
            </Reveal>


            {/* =================================================
                RIGHT — INTRO
            ================================================== */}

            <div
              className="
                flex
                items-end
                pb-10
                lg:pb-20
              "
            >

              <Reveal>
                <div className="max-w-[720px]">

                  <p
                    className="
                      max-w-[680px]
                      text-[18px]
                      font-light
                      leading-[1.6]
                      tracking-[-0.01em]
                      text-neutral-600
                      sm:text-[20px]
                      md:text-[22px]
                    "
                  >
                    {pageCopy.introSecondary}
                  </p>


                  <div className="mt-12 flex items-center gap-4">

                    <span
                      className="
                        flex
                        h-9
                        w-5
                        items-start
                        justify-center
                        rounded-full
                        border
                        border-neutral-400
                      "
                    >
                      <span className="mt-2 h-2 w-px bg-neutral-800" />
                    </span>

                    <span
                      className="
                        text-[9px]
                        uppercase
                        tracking-[0.35em]
                        text-neutral-500
                      "
                    >
                      {pageCopy.scroll}
                    </span>

                  </div>

                </div>
              </Reveal>

            </div>

          </div>

        </Container>

      </section>


      {/* =====================================================
          SERVICES
      ====================================================== */}

      <section
        ref={servicesRef}
        className="
          border-t
          border-neutral-300
          bg-[#f8f7f4]
        "
      >

        <Container
          className="
            !max-w-none
            px-5
            py-24
            sm:px-8
            md:px-10
            md:py-32
            lg:px-14
            lg:py-40
            xl:px-16
          "
        >

          {/* SECTION INTRO */}

          <div
            className="
              mb-20
              grid
              grid-cols-1
              gap-10
              lg:grid-cols-[0.7fr_1.3fr]
              lg:gap-x-20
            "
          >

            <div>
              <span
                className="
                  text-[9px]
                  uppercase
                  tracking-[0.35em]
                  text-neutral-400
                "
              >
                {pageCopy.sectionLabel}
              </span>
            </div>


            <h2
              className="
                max-w-[900px]
                text-[42px]
                font-extralight
                leading-[0.95]
                tracking-[-0.045em]
                sm:text-[55px]
                md:text-[68px]
                lg:text-[78px]
              "
            >
              {pageCopy.heading.map((line) => (
                <span key={line} className="block">{line}</span>
              ))}
            </h2>

          </div>


          {/* =================================================
              SERVICE LIST
          ================================================== */}

          <div className="border-t border-neutral-300">

            {pageCopy.services.map((service) => (

              <div
                key={service.number}
                className="
                  service-row
                  group
                  border-b
                  border-neutral-300
                  py-8
                  sm:py-10
                  md:py-12
                  lg:py-14
                "
              >

                <div
                  className="
                    grid
                    grid-cols-[35px_1fr]
                    gap-x-5
                    md:grid-cols-[55px_0.8fr_1.2fr_30px]
                    md:gap-x-8
                    lg:gap-x-12
                  "
                >

                  {/* NUMBER */}

                  <span
                    className="
                      pt-2
                      text-[8px]
                      tracking-[0.25em]
                      text-neutral-400
                    "
                  >
                    {service.number}
                  </span>


                  {/* TITLE */}

                  <h3
                    className="
                      text-[32px]
                      font-extralight
                      leading-[0.95]
                      tracking-[-0.04em]
                      transition-transform
                      duration-500
                      group-hover:translate-x-3
                      sm:text-[40px]
                      md:text-[44px]
                      lg:text-[50px]
                    "
                  >
                    {service.title}
                  </h3>


                  {/* DESCRIPTION */}

                  <p
                    className="
                      col-start-2
                      mt-5
                      max-w-[650px]
                      text-[13px]
                      font-light
                      leading-[1.8]
                      text-neutral-500
                      md:col-start-3
                      md:mt-0
                      md:text-[14px]
                      lg:text-[15px]
                    "
                  >
                    {service.description}
                  </p>


                  {/* ARROW */}

                  <span
                    className="
                      hidden
                      pt-1
                      text-[16px]
                      font-light
                      text-neutral-400
                      transition-transform
                      duration-500
                      group-hover:translate-x-2
                      md:block
                    "
                  >
                    ↗
                  </span>

                </div>

              </div>

            ))}

          </div>

        </Container>

      </section>


      {/* =====================================================
          NEXT SECTION MARKER
      ====================================================== */}

      <section className="border-t border-neutral-300">

        <Container
          className="
            !max-w-none
            px-5
            py-24
            sm:px-8
            md:px-10
            md:py-32
            lg:px-14
            lg:py-40
            xl:px-16
          "
        >

          <div
            className="
              flex
              items-end
              justify-between
              gap-10
            "
          >

            <span
              className="
                text-[9px]
                uppercase
                tracking-[0.35em]
                text-neutral-400
              "
            >
              {pageCopy.experience}
            </span>


            <span
              className="
                text-[9px]
                uppercase
                tracking-[0.35em]
                text-neutral-400
              "
            >
              {pageCopy.next}
            </span>

          </div>

        </Container>

      </section>

    </main>
  );
}
