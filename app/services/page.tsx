import type { Metadata } from "next";
import ServicesHero from "@/components/services/ServicesHero";
import ServicesProjects from "@/components/services/Projects";
import Timeline from "@/components/sections/Timeline";
import Themes from "@/components/sections/Themes";
import { listPublishedWebsiteProjects } from "@/lib/server/websiteProjects";

export const metadata: Metadata = {
  title: "Services",
  description: "Architecture, interiors, detailed design development, and optional delivery advisory by Mason & Arc.",
  alternates: { canonical: "/services" },
};

export const dynamic = "force-dynamic";

export default async function ServicesPage() {
  const projects = await listPublishedWebsiteProjects();
  return (
    <main>
      <ServicesHero />
      <ServicesProjects projects={projects} />
      <Timeline />
      <Themes />
    </main>
  );
}
