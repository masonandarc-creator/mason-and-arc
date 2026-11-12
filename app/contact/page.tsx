import type { Metadata } from "next";
import ContactHero from "@/components/contact/ContactHero";
import ContactForm from "./ContactForm";

export const metadata: Metadata = {
  title: "Contact",
  description: "Start a conversation with Mason & Arc about architecture, interiors, detailed design development, and optional delivery advisory.",
  alternates: { canonical: "/contact" },
};

export default function ContactPage() {
  return (
    <main>
      <ContactHero />
      <ContactForm />
    </main>
  );
}
