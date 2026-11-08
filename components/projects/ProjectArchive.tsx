"use client";

import Link from "next/link";
import Image from "next/image";
import LetsCreateCTA from "@/components/shared/LetsCreateCTA";
import { localizedYear, projectCopy, useLocale } from "@/components/i18n/LocaleProvider";
import type { WebsiteProject } from "@/lib/server/websiteProjects";
import NovaHillsProjectCard from "@/components/projects/NovaHillsProjectCard";

export default function ProjectArchive({ projects, canEdit }: { projects: WebsiteProject[]; canEdit: boolean }) {
  const { locale, copy } = useLocale();

  return (
    <main className="min-h-screen bg-[#f8f7f4] text-neutral-900">
      <section className="px-6 pb-16 pt-32 sm:px-8 md:px-12 md:pt-40 lg:px-16 xl:px-20">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-[9px] uppercase tracking-[.35em] text-neutral-400">{copy.archiveEyebrow}</p>
            <h1 className={`mt-6 max-w-[1100px] font-light leading-[.82] tracking-[-.055em] ${locale === "ar" ? "text-[58px] sm:text-[78px] md:text-[104px] lg:text-[132px]" : "text-[64px] sm:text-[86px] md:text-[115px] lg:text-[145px]"}`}>{copy.archiveTitle}</h1>
            <p className="mt-10 max-w-xl text-sm leading-7 text-neutral-500">{copy.archiveIntro}</p>
          </div>
          {canEdit && <Link href="/app/admin/website-projects" className="w-fit rounded-full border border-neutral-300 bg-white px-5 py-3 text-xs font-medium uppercase tracking-[.12em]">Edit website projects</Link>}
        </div>
      </section>

      <section className="border-y border-neutral-300 px-6 py-5 text-[9px] uppercase tracking-[.3em] text-neutral-400 sm:px-8 md:px-12 lg:px-16 xl:px-20">
        {copy.publishedWork} · {projects.filter((project) => project.slug !== "nova-hills-prime").length + 1} {projects.filter((project) => project.slug !== "nova-hills-prime").length + 1 === 1 ? copy.projectSingular : copy.projectPlural}
      </section>

      <section className="px-5 pb-32 pt-10 sm:px-8 md:px-10 lg:px-14 xl:px-16">
        <div className="border-t border-neutral-300">
          <NovaHillsProjectCard mode="archive" />
          {projects.filter((project) => project.slug !== "nova-hills-prime").map((project, index) => {
            const translated = projectCopy(project, locale);
            return <Link key={project.id} href={`/projects/${project.slug}`} className="group block border-b border-neutral-300 py-8 md:py-12">
              <div className="mb-7 flex items-center justify-between gap-4 text-[8px] uppercase tracking-[.3em] text-neutral-400">
                <span>{String(index + 2).padStart(2, "0")} · {translated.location}</span><span>{localizedYear(project.year, locale)}</span>
              </div>
              <div className="relative h-[58vh] min-h-[380px] overflow-hidden bg-neutral-200 md:h-[72vh]">
                <Image src={project.image_url} alt={translated.title} fill priority={index === 0} sizes="100vw" className="object-cover transition-transform duration-[1400ms] group-hover:scale-[1.035]" />
              </div>
              <div className="mt-7 flex items-end justify-between gap-6">
                <div>
                  <span className="mb-3 block text-[8px] uppercase tracking-[.3em] text-neutral-400">{translated.category}</span>
                  <h2 className={`font-light leading-[.9] tracking-[-.05em] transition-transform duration-700 group-hover:translate-x-2 ${locale === "ar" ? "text-[40px] sm:text-[52px] md:text-[66px] lg:text-[80px]" : "text-[46px] sm:text-[58px] md:text-[76px] lg:text-[94px]"}`}>{translated.title}</h2>
                </div>
                <span className="hidden pb-2 text-[9px] uppercase tracking-[.3em] text-neutral-400 md:block">{copy.viewProject} ↗</span>
              </div>
            </Link>;
          })}
          {!projects.length && <div className="py-24 text-center text-sm text-neutral-500">{copy.emptyProjects}</div>}
        </div>
      </section>
      <LetsCreateCTA />
    </main>
  );
}
