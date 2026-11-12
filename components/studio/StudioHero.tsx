"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";

import Container from "@/components/shared/Container";
import SecondaryLogo from "@/components/shared/SecondaryLogo";

export default function StudioHero() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!sectionRef.current) return;

    const ctx = gsap.context(() => {
      gsap.from(".studio-reveal", {
        y: 80,
        opacity: 0,
        duration: 1.1,
        stagger: 0.1,
        ease: "power4.out",
        delay: 0.15,
      });

      gsap.to(".studio-title", {
        y: -80,
        ease: "none",
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top top",
          end: "bottom top",
          scrub: 1,
        },
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="
        relative
        min-h-[100svh]
        overflow-hidden
        bg-[#f8f7f4]
        text-neutral-900
      "
    >
      <Container
        className="
          !max-w-none
          px-6
          pb-10
          pt-32
          sm:px-8
          md:px-12
          md:pt-40
          lg:px-16
          lg:pt-44
          xl:px-20
        "
      >
        {/* TOP META */}

        <div
          className="
            studio-reveal
            flex
            items-center
            justify-between
            border-b
            border-neutral-300
            pb-5
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
            01 — Studio
          </span>

          <span className="text-neutral-400" title="Mason & Arc">
            <SecondaryLogo className="h-5 w-5" />
          </span>
        </div>

        {/* MAIN */}

        <div
          className="
            grid
            min-h-[70svh]
            grid-cols-1
            items-end
            gap-16
            py-20
            lg:grid-cols-[1.45fr_0.55fr]
            lg:gap-20
            lg:py-24
          "
        >
          {/* TITLE */}

          <div className="studio-title">
            <div className="overflow-hidden">
              <h1
                className="
                  studio-reveal
                  text-[82px]
                  font-light
                  leading-[0.76]
                  tracking-[-0.065em]
                  sm:text-[110px]
                  md:text-[145px]
                  lg:text-[180px]
                  xl:text-[220px]
                  2xl:text-[250px]
                "
              >
                Studio
              </h1>
            </div>

            <div
              className="
                studio-reveal
                mt-8
                flex
                items-center
                gap-4
              "
            >
              <span className="h-px w-12 bg-neutral-900" />

              <span
                className="
                  text-[9px]
                  uppercase
                  tracking-[0.3em]
                  text-neutral-500
                "
              >
                Architecture / Interiors / Design Development
              </span>
            </div>
          </div>

          {/* DESCRIPTION */}

          <div className="studio-reveal lg:pb-3">
            <p
              className="
                max-w-[420px]
                text-[14px]
                font-light
                leading-[1.8]
                text-neutral-500
                md:text-[15px]
              "
            >
              We design architecture through clear thinking,
              material honesty, and a precise understanding of
              how people experience space.
            </p>

            <div
              className="
                mt-12
                border-t
                border-neutral-300
                pt-5
              "
            >
              <div
                className="
                  flex
                  items-center
                  justify-between
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
                  Based in
                </span>

                <span
                  className="
                    text-[9px]
                    uppercase
                    tracking-[0.25em]
                  "
                >
                  Cairo / Egypt
                </span>
              </div>

              <div
                className="
                  mt-5
                  flex
                  items-center
                  justify-between
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
                  Focus
                </span>

                <span
                  className="
                    text-[9px]
                    uppercase
                    tracking-[0.25em]
                  "
                >
                  Architecture
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* BOTTOM */}

        <div
          className="
            studio-reveal
            flex
            items-center
            justify-between
            border-t
            border-neutral-300
            pt-5
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
            Scroll to explore
          </span>

          <span
            className="
              text-[9px]
              uppercase
              tracking-[0.3em]
              text-neutral-400
            "
          >
            01 / 03
          </span>
        </div>
      </Container>
    </section>
  );
}
