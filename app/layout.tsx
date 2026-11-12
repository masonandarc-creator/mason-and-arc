import type { Metadata } from "next";
import { Inter, Bebas_Neue, Noto_Sans_Arabic } from "next/font/google";

import "./globals.css";

import RouteChrome from "@/components/layout/RouteChrome";
import { LocaleProvider } from "@/components/i18n/LocaleProvider";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});

const bebas = Bebas_Neue({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-display",
  display: "swap",
});

const notoArabic = Noto_Sans_Arabic({
  subsets: ["arabic"],
  weight: ["300", "400", "500", "700"],
  variable: "--font-arabic",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://www.masonandarc.com"),
  title: { default: "Mason & Arc — Architecture Studio", template: "%s | Mason & Arc" },
  description: "Mason & Arc is an architectural design studio specializing in architecture, interiors, and detailed design development, with delivery advisory available where required.",
  applicationName: "Mason & Arc",
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    url: "/",
    siteName: "Mason & Arc",
    title: "Mason & Arc — Architecture Studio",
    description: "Architecture, interiors, and detailed design development by Mason & Arc.",
    images: [{ url: "/images/hero.png", alt: "Mason & Arc — Architecture Studio" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Mason & Arc — Architecture Studio",
    description: "Architecture, interiors, and detailed design development by Mason & Arc.",
    images: ["/images/hero.png"],
  },

  icons: {
    icon: "/icon.png",
    shortcut: "/icon.png",
    apple: "/icon.png",
  },

  verification: {
    google: "QzUt6qN9m0LhOjmUVnxItudzs6V1hJMrs1psWxLLJaU",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} ${bebas.variable} ${notoArabic.variable} antialiased`}
      >
        <LocaleProvider><RouteChrome>{children}</RouteChrome></LocaleProvider>
      </body>
    </html>
  );
}
