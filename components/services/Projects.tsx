"use client";

import Link from "next/link";
import Image from "next/image";

import Reveal from "@/components/animations/Reveal";
import Container from "@/components/shared/Container";
import { localizedYear, projectCopy, useLocale } from "@/components/i18n/LocaleProvider";
import type { WebsiteProject } from "@/lib/server/websiteProjects";

const servicesProjectsCopy = {
  en: {
    label: "02 — Projects",
    title: ["Selected", "Projects."],
    intro: "A selection of spaces shaped through architecture, interiors, and detailed design.",
    viewAll: "View all projects",
  },
  ar: {
    label: "02 — المشروعات",
    title: ["مشروعات", "مختارة."],
    intro: "مجموعة مختارة من الفراغات التي صاغتها العمارة والتصميم الداخلي والتطوير التفصيلي.",
    viewAll: "عرض كل المشروعات",
  },
  it: {
    label: "02 — Progetti",
    title: ["Progetti", "selezionati."],
    intro: "Una selezione di spazi definiti attraverso architettura, interni e sviluppo del dettaglio.",
    viewAll: "Tutti i progetti",
  },
} as const;

export default function ServicesProjects({ projects }: { projects: WebsiteProject[] }) {
  const { locale } = useLocale();
  const copy = servicesProjectsCopy[locale];
  return (
    <section className="bg-[#f8f7f4] text-neutral-900">
      <Container
        className="
          px-6
          py-32
          sm:px-8
          md:px-12
          md:py-40
          lg:px-16
          lg:py-52
        "
      >
        {/* SECTION INTRO */}

        <div
          className="
            grid
            grid-cols-1
            gap-12
            lg:grid-cols-[0.7fr_1.3fr]
            lg:gap-20
          "
        >
          <Reveal>
            <p
              className="
                text-[9px]
                uppercase
                tracking-[0.35em]
                text-neutral-400
              "
            >
              {copy.label}
            </p>
          </Reveal>

          <Reveal>
            <div>
              <h2
                className="
                  max-w-[900px]
                  text-[58px]
                  font-extralight
                  leading-[0.86]
                  tracking-[-0.055em]
                  sm:text-[76px]
                  md:text-[100px]
                  lg:text-[125px]
                "
              >
                {copy.title[0]}
                <br />
                {copy.title[1]}
              </h2>

              <p
                className="
                  mt-10
                  max-w-[600px]
                  text-[14px]
                  font-light
                  leading-[1.85]
                  text-neutral-500
                  md:text-[16px]
                "
              >
                {copy.intro}
              </p>
            </div>
          </Reveal>
        </div>

        {/* PROJECT LIST */}

        <div className="mt-32 space-y-40 md:mt-48 md:space-y-56">
          {projects.map((project, index) => {
            const translated = projectCopy(project, locale);
            return (
            <Reveal key={project.id}>
              <Link
                href={`/projects/${project.slug}`}
                className="group block"
              >
                {/* IMAGE */}

                <div
                  className="
                    relative
                    h-[58vh]
                    min-h-[420px]
                    w-full
                    overflow-hidden
                    bg-neutral-200
                    md:h-[72vh]
                    lg:h-[78vh]
                  "
                >
                  <Image
                    src={project.image_url}
                    alt={translated.title}
                    fill
                    priority={index === 0}
                    sizes="100vw"
                    className="
                      object-cover
                      transition-transform
                      duration-[1200ms]
                      ease-out
                      group-hover:scale-[1.035]
                    "
                  />

                  {/* DARK HOVER */}

                  <div
                    className="
                      absolute
                      inset-0
                      bg-black/0
                      transition-colors
                      duration-700
                      group-hover:bg-black/10
                    "
                  />

                  {/* NUMBER */}

                  <div
                    className="
                      absolute
                      left-6
                      top-6
                      md:left-10
                      md:top-10
                    "
                  >
                    <span
                      className="
                        text-[9px]
                        uppercase
                        tracking-[0.3em]
                        text-white
                      "
                    >
                      0{index + 1}
                    </span>
                  </div>

                  {/* ARROW */}

                  <div
                    className="
                      absolute
                      bottom-6
                      right-6
                      flex
                      h-12
                      w-12
                      items-center
                      justify-center
                      rounded-full
                      border
                      border-white/60
                      text-lg
                      text-white
                      opacity-0
                      transition-all
                      duration-500
                      group-hover:opacity-100
                      md:bottom-10
                      md:right-10
                    "
                  >
                    ↗
                  </div>
                </div>

                {/* PROJECT INFORMATION */}

                <div
                  className="
                    grid
                    grid-cols-1
                    gap-6
                    border-b
                    border-neutral-300
                    py-7
                    md:grid-cols-[1fr_auto]
                    md:items-end
                    md:py-9
                  "
                >
                  <div>
                    <div
                      className="
                        mb-4
                        flex
                        items-center
                        gap-4
                      "
                    >
                      <span
                        className="
                          text-[9px]
                          uppercase
                          tracking-[0.3em]
                          text-neutral-400
                        "
                      >
                        {translated.location}
                      </span>

                      <span className="h-px w-8 bg-neutral-300" />

                      <span
                        className="
                          text-[9px]
                          uppercase
                          tracking-[0.3em]
                          text-neutral-400
                        "
                      >
                        {translated.category}
                      </span>
                    </div>

                    <h3
                      className="
                        text-[42px]
                        font-extralight
                        leading-none
                        tracking-[-0.045em]
                        transition-transform
                        duration-700
                        group-hover:translate-x-2
                        sm:text-[54px]
                        md:text-[68px]
                        lg:text-[78px]
                      "
                    >
                      {translated.title}
                    </h3>
                  </div>

                  <span
                    className="
                      text-[10px]
                      uppercase
                      tracking-[0.25em]
                      text-neutral-400
                    "
                  >
                    {localizedYear(project.year, locale)}
                  </span>
                </div>
              </Link>
            </Reveal>
          )})}
        </div>

        {/* ALL PROJECTS */}

        <Reveal>
          <div
            className="
              mt-32
              border-t
              border-neutral-300
              pt-7
              md:mt-44
            "
          >
            <Link
              href="/projects"
              className="
                group
                flex
                items-center
                justify-between
              "
            >
              <span
                className="
                  text-[10px]
                  uppercase
                  tracking-[0.35em]
                  text-neutral-500
                "
              >
                {copy.viewAll}
              </span>

              <span
                className="
                  text-lg
                  transition-transform
                  duration-500
                  group-hover:translate-x-2
                "
              >
                ↗
              </span>
            </Link>
          </div>
        </Reveal>
      </Container>
    </section>
  );
}
