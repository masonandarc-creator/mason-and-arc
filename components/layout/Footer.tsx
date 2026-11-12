"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLocale } from "@/components/i18n/LocaleProvider";
import SecondaryLogo from "@/components/shared/SecondaryLogo";

export default function Footer() {
  const { copy } = useLocale();
  const isContactPage = usePathname() === "/contact";
  return (
    <footer className="bg-[#f8f7f4] text-neutral-900">
      <div className="px-6 pb-6 pt-12 sm:px-8 md:px-10 md:pb-7 md:pt-16 lg:px-16">

        {/* Top */}
        <div className={`grid grid-cols-1 gap-x-12 gap-y-12 border-t border-neutral-300 pt-9 md:grid-cols-2 md:gap-y-16 lg:gap-x-16 ${isContactPage ? "lg:grid-cols-[1.5fr_1fr]" : "lg:grid-cols-[1.25fr_0.75fr_1fr]"}`}>

          {/* Brand */}
          <div>
            <Link
              href="/"
              aria-label="Mason & Arc"
              className="block h-12 w-12 transition-opacity hover:opacity-60"
            >
              <SecondaryLogo className="h-full w-full text-neutral-900" />
            </Link>

            <p className="mt-5 max-w-[375px] text-[14px] font-normal leading-[1.7] text-neutral-600">
              {copy.footerTagline}
            </p>
          </div>

          {/* Navigation */}
          <div>
            <p className="mb-5 text-[10px] font-medium uppercase tracking-[0.2em] text-neutral-500">
              {copy.navigate}
            </p>

            <div className="flex flex-col gap-3 text-[14px] font-normal text-neutral-700">
              <Link href="/" className="transition-opacity hover:opacity-50">
                {copy.home}
              </Link>

              <Link
                href="/projects"
                className="transition-opacity hover:opacity-50"
              >
                {copy.projects}
              </Link>

              <Link
                href="/about"
                className="transition-opacity hover:opacity-50"
              >
                {copy.about}
              </Link>

              <Link
                href="/services"
                className="transition-opacity hover:opacity-50"
              >
                {copy.services}
              </Link>

              <Link
                href="/contact"
                className="transition-opacity hover:opacity-50"
              >
                {copy.contact}
              </Link>

              <Link
                href="/privacy"
                className="transition-opacity hover:opacity-50"
              >
                {copy.privacy}
              </Link>
            </div>
          </div>

          {/* Contact details already appear in the hero on the contact page. */}
          <div hidden={isContactPage}>
            <p className="mb-5 text-[10px] font-medium uppercase tracking-[0.2em] text-neutral-500">
              {copy.contact}
            </p>

            <div className="flex flex-col gap-3 text-[14px] font-normal text-neutral-700">

              <a
                href="mailto:Masonandarc@gmail.com"
                className="transition-opacity hover:opacity-50"
              >
                Masonandarc@gmail.com
              </a>

              <a
                href="tel:+201044007555"
                className="transition-opacity hover:opacity-50"
              >
                +20 10 440 07555
              </a>

              <a
                href="tel:+393200534654"
                className="transition-opacity hover:opacity-50"
              >
                +39 320 053 4654
              </a>

              <a href="https://wa.me/201044007555" target="_blank" rel="noopener noreferrer" className="transition-opacity hover:opacity-50">
                WhatsApp ↗
              </a>

              <a
                href="https://www.instagram.com/masonandarc/"
                target="_blank"
                rel="noopener noreferrer"
                className="transition-opacity hover:opacity-50"
              >
                Instagram ↗
              </a>

            </div>
          </div>

        </div>

        {/* Copyright: separate left/right alignment with consistent optical weight */}
        <div className="mt-12 flex flex-col items-start gap-3 border-t border-neutral-300 pt-4 text-[11px] font-normal leading-5 tracking-[-0.01em] text-neutral-500 md:mt-14 md:flex-row md:items-center md:justify-between md:gap-6">
          <div dir="ltr" className="inline-flex flex-nowrap items-baseline gap-[6px] whitespace-nowrap text-[11px] leading-none">
            <span className="whitespace-nowrap">© 2026</span>
            <Link
              href="/"
              aria-label="Mason & Arc home"
              className="relative top-px inline-block h-[11px] shrink-0 align-baseline transition-opacity hover:opacity-70"
            >
              <Image
                src="/images/logo-mason-arc.png"
                alt=""
                width={500}
                height={160}
                className="block h-[11px] w-auto shrink-0 object-contain brightness-0 opacity-[0.48]"
              />
            </Link>
            <span className="whitespace-nowrap">{copy.rights}</span>
          </div>
          <span dir="ltr" className="text-neutral-500 md:text-right">
            {copy.heroBuild} {copy.heroExperience}
          </span>
        </div>

      </div>
    </footer>
  );
}
