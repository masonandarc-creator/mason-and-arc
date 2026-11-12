import type { Metadata } from "next";
import { getServerUser } from "@/lib/server/auth";
import { listPublishedWebsiteProjects } from "@/lib/server/websiteProjects";
import ProjectArchive from "@/components/projects/ProjectArchive";

export const metadata: Metadata = {
  title: "Projects",
  description: "Selected architecture, interiors, and spaces developed by Mason & Arc.",
  alternates: { canonical: "/projects" },
};
export const dynamic = "force-dynamic";

export default async function ProjectsPage() {
  const [projects, user] = await Promise.all([listPublishedWebsiteProjects(), getServerUser()]);
  return <ProjectArchive projects={projects} canEdit={user?.role === "Owner"} />;
}
