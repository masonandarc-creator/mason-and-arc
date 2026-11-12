import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About",
  description: "About Mason & Arc — an architectural design studio for projects in Egypt and internationally.",
  alternates: { canonical: "/about" },
};

export default function AboutLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}
