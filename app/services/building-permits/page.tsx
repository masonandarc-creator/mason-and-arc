import type { Metadata } from "next";
import BuildingPermits from "@/components/services/BuildingPermits";

export const metadata: Metadata = {
  title: "Building Permits & Regulatory Approvals",
  description: "Building permit documentation, regulatory review and application follow-up for residential and commercial projects in Egypt, by Mason & Arc.",
  alternates: { canonical: "/services/building-permits" },
};

export default function BuildingPermitsPage() {
  return <BuildingPermits />;
}
