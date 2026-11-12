import type { Metadata } from "next";
import StudioHero from "@/components/studio/StudioHero";
import Philosophy from "@/components/studio/Philosophy";
import Process from "@/components/studio/Process";

export const metadata: Metadata = {
  title: "Studio",
  description: "Inside the Mason & Arc studio, process, philosophy, and approach.",
  alternates: { canonical: "/studio" },
};

export default function StudioPage() {
  return (
    <main className="bg-[#f8f7f4]">
      <StudioHero />
      <Philosophy />
      <Process />
    </main>
  );
}
