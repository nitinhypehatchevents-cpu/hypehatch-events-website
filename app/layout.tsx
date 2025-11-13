import type { Metadata } from "next";
import { Poppins, Inter } from "next/font/google";
import "./globals.css";
import ScrollToTop from "@/components/ScrollToTop";
import ScrollRestoration from "@/components/ScrollRestoration";
import LoadingScreen from "@/components/LoadingScreen";

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
  preload: false, // Don't preload to speed up initial load
  fallback: ["system-ui", "arial"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
  preload: false, // Don't preload to speed up initial load
  fallback: ["system-ui", "arial"],
});

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ||
  process.env.PUBLIC_SITE_URL ||
  "https://hypehatchevents.com";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Hypehatch Events | Experiential Marketing & BTL Activations",
    template: "%s | Hypehatch Events",
  },
  description:
    "We turn ideas into experiences that move people and brands. Experiential marketing, BTL activations, events management, exhibition design, and retail branding in India.",
  keywords: [
    "experiential marketing",
    "BTL activations",
    "events management",
    "exhibition design",
    "retail branding",
    "fabrication",
    "manpower solutions",
    "India",
    "Mumbai",
  ],
  authors: [{ name: "Hypehatch Events" }],
  creator: "Hypehatch Events",
  publisher: "Hypehatch Events",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: siteUrl,
    siteName: "Hypehatch Events",
    title: "Hypehatch Events | Experiential Marketing & BTL Activations",
    description:
      "We turn ideas into experiences that move people and brands. Experiential marketing, BTL activations, events management, and retail branding.",
    images: [
      {
        url: `${siteUrl}/og-image.jpg`,
        width: 1200,
        height: 630,
        alt: "Hypehatch Events - Experiential Marketing",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Hypehatch Events | Experiential Marketing & BTL Activations",
    description:
      "We turn ideas into experiences that move people and brands. Experiential marketing, BTL activations, events management, and retail branding.",
    images: [`${siteUrl}/og-image.jpg`],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    // Add Google Search Console verification token here after setup
    // google: "your-google-verification-token",
  },
  alternates: {
    canonical: siteUrl,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${poppins.variable} ${inter.variable}`}>
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <meta name="theme-color" content="#FA9616" />
        <style dangerouslySetInnerHTML={{
          __html: `
            /* Critical CSS for immediate loading screen display */
            body { margin: 0; padding: 0; }
            #__next { min-height: 100vh; }
          `
        }} />
      </head>
      <body className="font-body antialiased bg-gray-50 text-ink">
        <ScrollRestoration />
        <LoadingScreen />
        <a href="#main-content" className="skip-link">
          Skip to main content
        </a>
        <main id="main-content">{children}</main>
        <ScrollToTop />
      </body>
    </html>
  );
}
