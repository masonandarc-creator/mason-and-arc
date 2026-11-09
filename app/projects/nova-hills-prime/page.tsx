import type { Metadata } from "next";
import NovaHillsCaseStudy from "@/components/projects/NovaHillsCaseStudy";

export const metadata: Metadata = {
  title: "NOVA HILLS PRIME — Integrated Collaboration",
  description: "NOVA HILLS PRIME: brand identity, digital experiences, architecture, interiors and execution collaboration by Mason&Arc. Project documentation in progress.",
  alternates: { canonical: "/projects/nova-hills-prime" },
  openGraph: {
    title: "NOVA HILLS PRIME | Mason&Arc",
    description: "Integrated branding, digital, architecture and delivery collaboration.",
    images: ["https://novahillseg.com/assets/NOVA-HILLS-PRIME-brand-experience.png"],
  },
};
export default function Page() { return <NovaHillsCaseStudy />; }
