"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import Reveal from "@/components/animations/Reveal";
import Container from "@/components/shared/Container";

gsap.registerPlugin(ScrollTrigger);

const steps = [
  {
    number: "01",
    title: "Listen",
    text: "We begin by understanding the context, the people, and the ambition behind every project.",
  },
  {
    number: "02",
    title: "Design",
    text: "Ideas become spatial strategies through proportion, material, light, and careful detailing.",
  },
  {
    number: "03",
    title: "Coordinate",
    text: "The design is resolved in detail, with delivery guidance and specialist coordination available when required.",
  },
  {
    number: "04",
    title: "Experience",
    text: "The final space is measured by how naturally people inhabit it, move through it, and remember it.",
  },
];

export default function Process() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!sectionRef.current) return;

    const ctx = gsap.context(() => {
      gsap.utils.toArray<HTMLElement>(".process-item").forEach((item) => {
        gsap.from(item, {
          y: 70,
          opacity: 0,
          duration: 0.9,
          ease: "power4.out",
          scrollTrigger: {
            trigger: item,
            start: "top 82%",
            once: true,
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
        border-t
        border-neutral-300
        bg-[#f8f7f4]
        text-neutral-900
      "
    >
      <Container
        className="
          !max-w-none
          px-6
          py-28
          sm:px-8
          md:px-12
          md:py-40
          lg:px-16
          lg:py-52
          xl:px-20
        "
      >
        {/* HEADER */}

        <div
          className="
            grid
            grid-cols-1
            gap-12
            lg:grid-cols-[0.35fr_1.65fr]
            lg:gap-x-16
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
              03 — Process
            </span>
          </Reveal>

          <Reveal>
            <h2
              className="
                max-w-[1100px]
                text-[58px]
                font-light
                leading-[0.82]
                tracking-[-0.055em]
                sm:text-[76px]
                md:text-[100px]
                lg:text-[125px]
              "
            >
              From idea
              <br />
              to experience.
            </h2>
          </Reveal>
        </div>

        {/* PROCESS */}

        <div
          className="
            mt-24
            border-t
            border-neutral-300
            md:mt-36
          "
        >
          {steps.map((step) => (
            <div
              key={step.number}
              className="
                process-item
                grid
                grid-cols-[45px_1fr]
                gap-6
                border-b
                border-neutral-300
                py-8
                md:grid-cols-[80px_0.8fr_1.2fr]
                md:gap-10
                md:py-12
              "
            >
              <span
                className="
                  pt-1
                  text-[9px]
                  tracking-[0.25em]
                  text-neutral-400
                "
              >
                {step.number}
              </span>

              <h3
                className="
                  text-[36px]
                  font-light
                  leading-none
                  tracking-[-0.04em]
                  sm:text-[46px]
                  md:text-[58px]
                "
              >
                {step.title}
              </h3>

              <p
                className="
                  col-start-2
                  max-w-[500px]
                  text-[13px]
                  font-light
                  leading-[1.8]
                  text-neutral-500
                  md:col-start-3
                  md:pt-2
                  md:text-[15px]
                "
              >
                {step.text}
              </p>
            </div>
          ))}
        </div>

        {/* END MARKER */}

        <Reveal>
          <div
            className="
              mt-24
              flex
              items-center
              justify-between
              border-t
              border-neutral-300
              pt-5
              md:mt-36
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
              Listen / Design / Coordinate / Experience
            </span>

            <span
              className="
                text-[8px]
                uppercase
                tracking-[0.3em]
                text-neutral-400
              "
            >
              End
            </span>
          </div>
        </Reveal>
      </Container>
    </section>
  );
}
