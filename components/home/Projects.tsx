"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import Reveal from "@/components/animations/Reveal";
import Container from "@/components/shared/Container";
import { localizedYear, projectCopy, useLocale } from "@/components/i18n/LocaleProvider";
import type { WebsiteProject } from "@/lib/server/websiteProjects";
import NovaHillsProjectCard from "@/components/projects/NovaHillsProjectCard";

gsap.registerPlugin(ScrollTrigger);

export default function Projects({ projects }: { projects: WebsiteProject[] }) {
  const sectionRef = useRef<HTMLElement>(null);
  const { locale, copy } = useLocale();

  useEffect(() => {
    if (!sectionRef.current) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const mobile = window.matchMedia("(max-width: 767px)").matches;
    if (reduceMotion || mobile) return;

    const ctx = gsap.context(() => {
      const cards = sectionRef.current!.querySelectorAll(".project-card");

      cards.forEach((card) => {
        const image = card.querySelector(".project-image");
        if (!image) return;

        gsap.fromTo(image, { scale: 1.08 }, {
          scale: 1,
          ease: "none",
          scrollTrigger: {
            trigger: card,
            start: "top bottom",
            end: "bottom top",
            scrub: 0.6,
          },
        });
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="
        bg-[#f8f7f4]
        text-neutral-900
      "
    >
      <Container
        className="
          !max-w-none
          px-5
          pb-20
          pt-20
          sm:px-8
          md:px-10
          md:pb-28
          lg:px-14
          lg:pb-32
          xl:px-16
        "
      >
        {/* =====================================================
            SECTION HEADER
        ====================================================== */}

        <div
          className="
            grid
            grid-cols-1
            gap-10
            border-t
            border-neutral-300
            pt-6
            lg:grid-cols-[0.35fr_1.65fr]
            lg:gap-x-12
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
              {copy.featuredLabel}
            </span>
          </Reveal>

          <Reveal>
            <div>
              <h2
                className="
                  max-w-[1200px]
                  text-[58px]
                  font-light
                  leading-[0.82]
                  tracking-[-0.055em]
                  sm:text-[80px]
                  md:text-[105px]
                  lg:text-[110px]
                  xl:text-[128px]
                "
              >
                {copy.featuredTitle1}
                <br />
                {copy.featuredTitle2}
              </h2>

              <p
                className="
                  mt-10
                  max-w-[580px]
                  text-[13px]
                  font-light
                  leading-[1.8]
                  text-neutral-500
                  md:text-[15px]
                "
              >
                {copy.featuredIntro}
              </p>
            </div>
          </Reveal>
        </div>

        {/* =====================================================
            PROJECT ARCHIVE
        ====================================================== */}

        <div
          className="
            mt-16
            border-t
            border-neutral-300
            md:mt-24
          "
        >
          <NovaHillsProjectCard mode="home" />
          {projects.filter((project) => project.slug !== "nova-hills-prime").map((project, index) => {
            const translated = projectCopy(project, locale);
            return (
            <article
              key={project.id}
              className="
                project-card
                border-b
                border-neutral-300
                py-8
                md:py-12
              "
            >
              <Link
                href={`/projects/${project.slug}`}
                className="group block"
              >
                {/* =================================================
                    PROJECT TOP META
                ================================================== */}

                <div
                  className="
                    mb-6
                    flex
                    items-center
                    justify-between
                  "
                >
                  <div
                    className="
                      flex
                      items-center
                      gap-4
                    "
                  >
                    <span
                      className="
                        text-[8px]
                        uppercase
                        tracking-[0.3em]
                        text-neutral-400
                      "
                    >
                      {String(index + 2).padStart(2, "0")}
                    </span>

                    <span className="h-px w-8 bg-neutral-300" />

                    <span
                      className="
                        text-[8px]
                        uppercase
                        tracking-[0.3em]
                        text-neutral-400
                      "
                    >
                      {translated.location}
                    </span>
                  </div>

                  <span
                    className="
                      text-[8px]
                      uppercase
                      tracking-[0.3em]
                      text-neutral-400
                    "
                  >
                      {localizedYear(project.year, locale)}
                  </span>
                </div>

                {/* =================================================
                    IMAGE
                ================================================== */}

                <div
                  className="
                    relative
                    h-[58vh]
                    min-h-[430px]
                    w-full
                    overflow-hidden
                    bg-neutral-200
                    md:h-[72vh]
                    lg:h-[80vh]
                  "
                >
                  <div
                    className="
                      project-image
                      absolute
                      inset-[-6%]
                      will-change-transform
                    "
                  >
                    <Image
                      src={project.image_url}
                      alt={translated.title}
                      fill
                      unoptimized
                      priority={index === 0}
                      sizes="100vw"
                      className="
                        object-cover
                        transition-transform
                        duration-[1200ms]
                        ease-out
                        group-hover:scale-[1.025]
                      "
                    />
                  </div>

                  {/* IMAGE OVERLAY */}

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

                  {/* OPEN */}

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

                {/* =================================================
                    TITLE
                ================================================== */}

                <div
                  className="
                    mt-7
                    flex
                    items-end
                    justify-between
                    gap-8
                  "
                >
                  <div>
                    <p className="mb-4 text-[9px] uppercase tracking-[0.3em] text-[#4F6B7A]">
                      {translated.category}
                    </p>
                    <h3
                      className="
                        text-[44px]
                        font-light
                        leading-[0.88]
                        tracking-[-0.05em]
                        transition-transform
                        duration-700
                        group-hover:translate-x-2
                        sm:text-[58px]
                        md:text-[76px]
                        lg:text-[92px]
                      "
                    >
                      {translated.title}
                    </h3>
                  </div>

                  <span
                    className="
                      hidden
                      pb-2
                      text-[9px]
                      uppercase
                      tracking-[0.3em]
                      text-neutral-400
                      md:block
                    "
                  >
                    {copy.view}
                  </span>
                </div>
              </Link>
            </article>
          )})}
        </div>

        {/* =====================================================
            PAGINATION / MORE
        ====================================================== */}

        <Reveal>
          <div
            className="
              border-b
              border-neutral-300
              py-10
              md:py-14
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
              <div
                className="
                  flex
                  items-center
                  gap-6
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
                  {copy.archive}
                </span>

                <span
                  className="
                    text-[28px]
                    font-light
                    tracking-[-0.04em]
                    transition-transform
                    duration-500
                    group-hover:translate-x-2
                    sm:text-[38px]
                  "
                >
                  {copy.exploreAll}
                </span>
              </div>

              <span
                className="
                  text-xl
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
