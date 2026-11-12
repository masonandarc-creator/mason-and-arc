"use client";

import Link from "next/link";
import Reveal from "@/components/animations/Reveal";
import Container from "@/components/shared/Container";
import SecondaryLogo from "@/components/shared/SecondaryLogo";
import { useLocale } from "@/components/i18n/LocaleProvider";

const themesCopy = {
  en: {
    label: "04 — Explore",
    title: ["Explore", "more."],
    themes: ["Architecture", "Interior Design", "Design Development", "Delivery Advisory"],
    end: "05 — End",
  },
  ar: {
    label: "04 — استكشف",
    title: ["استكشف", "المزيد."],
    themes: ["العمارة", "التصميم الداخلي", "تطوير التصميم", "استشارات التنفيذ"],
    end: "05 — النهاية",
  },
  it: {
    label: "04 — Esplora",
    title: ["Scopri", "di più."],
    themes: ["Architettura", "Interior Design", "Sviluppo del progetto", "Consulenza alla realizzazione"],
    end: "05 — Fine",
  },
} as const;

export default function Themes() {
  const { locale } = useLocale();
  const copy = themesCopy[locale];
  return (
    <section className="border-t border-neutral-300 bg-[#f8f7f4] text-neutral-900">
      <Container
        className="
          !max-w-none
          px-5
          py-28
          sm:px-8
          md:px-10
          md:py-40
          lg:px-14
          lg:py-52
          xl:px-16
        "
      >
        {/* HEADER */}

        <div
          className="
            grid
            grid-cols-1
            gap-12
            lg:grid-cols-[0.7fr_1.3fr]
            lg:gap-x-20
          "
        >
          <Reveal>
            <span
              className="
                text-[9px]
                uppercase
                tracking-[0.35em]
                text-neutral-400
              "
            >
              {copy.label}
            </span>
          </Reveal>

          <Reveal>
            <h2
              className="
                max-w-[1000px]
                text-[58px]
                font-extralight
                leading-[0.86]
                tracking-[-0.055em]
                sm:text-[76px]
                md:text-[100px]
                lg:text-[120px]
                xl:text-[135px]
              "
            >
              {copy.title[0]}
              <br />
              {copy.title[1]}
            </h2>
          </Reveal>
        </div>

        {/* THEMES */}

        <div className="mt-24 border-t border-neutral-300 md:mt-36">
          {copy.themes.map((theme, index) => (
            <Reveal key={theme}>
              <Link
                href="/services"
                className="
                  group
                  grid
                  grid-cols-[45px_1fr_30px]
                  items-center
                  gap-x-6
                  border-b
                  border-neutral-300
                  py-7
                  md:grid-cols-[70px_1fr_40px]
                  md:py-10
                  lg:py-12
                "
              >
                <span
                  className="
                    text-[9px]
                    tracking-[0.25em]
                    text-neutral-400
                  "
                >
                  {String(index + 1).padStart(2, "0")}
                </span>

                <span
                  className="
                    text-[32px]
                    font-extralight
                    leading-none
                    tracking-[-0.04em]
                    transition-transform
                    duration-500
                    group-hover:translate-x-3
                    sm:text-[42px]
                    md:text-[54px]
                    lg:text-[64px]
                  "
                >
                  {theme}
                </span>

                <span
                  className="
                    text-[16px]
                    font-light
                    text-neutral-400
                    transition-transform
                    duration-500
                    group-hover:translate-x-2
                  "
                >
                  ↗
                </span>
              </Link>
            </Reveal>
          ))}
        </div>

        {/* FOOTER MARKER */}

        <Reveal>
          <div
            className="
              mt-24
              flex
              items-center
              justify-between
              border-t
              border-neutral-300
              pt-7
              md:mt-36
            "
          >
            <span className="text-neutral-400" title="Mason & Arc">
              <SecondaryLogo className="h-5 w-5" />
            </span>

            <span
              className="
                text-[9px]
                uppercase
                tracking-[0.35em]
                text-neutral-400
              "
            >
              {copy.end}
            </span>
          </div>
        </Reveal>
      </Container>
    </section>
  );
}
