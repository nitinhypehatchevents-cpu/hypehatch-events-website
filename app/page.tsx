import dynamic from "next/dynamic";
import NavBar from "@/components/NavBar";

// Lazy load ALL components for faster initial load
const Hero = dynamic(() => import("@/components/Hero"), {
  loading: () => <div className="min-h-screen" />,
  ssr: true, // Keep SSR for SEO
});
const AboutSection = dynamic(() => import("@/components/AboutSection"), {
  loading: () => null,
  ssr: true,
});
const OurStrengthSection = dynamic(() => import("@/components/OurStrengthSection"), {
  loading: () => null,
});
const OurServicesSection = dynamic(() => import("@/components/OurServicesSection"), {
  loading: () => null,
});
const PortfolioSection = dynamic(() => import("@/components/PortfolioSection"), {
  loading: () => null,
});
const ClientsTestimonials = dynamic(() => import("@/components/ClientsTestimonials"), {
  loading: () => null,
});
const Contact = dynamic(() => import("@/components/Contact"), {
  loading: () => null,
});
const Footer = dynamic(() => import("@/components/Footer"), {
  loading: () => null,
});

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ||
  process.env.PUBLIC_SITE_URL ||
  "https://hypehatchevents.com";

export default function Home() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Hypehatch Events",
    description:
      "Experiential marketing and BTL activations agency. We turn ideas into experiences that move people and brands.",
    url: siteUrl,
    logo: `${siteUrl}/logo.svg`,
    sameAs: [
      // Add your social media URLs here for better SEO
      // Example: "https://www.facebook.com/hypehatchevents",
      // Example: "https://www.instagram.com/hypehatchevents",
      // Example: "https://www.linkedin.com/company/hypehatchevents",
    ],
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "Customer Service",
      email: "info@hypehatchevents.com",
    },
    areaServed: {
      "@type": "Country",
      name: "India",
    },
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: "Event Services",
      itemListElement: [
        {
          "@type": "Offer",
          itemOffered: {
            "@type": "Service",
            name: "BTL Activations",
            description: "Below-the-line marketing activations",
          },
        },
        {
          "@type": "Offer",
          itemOffered: {
            "@type": "Service",
            name: "Events Management",
            description: "End-to-end event planning and execution",
          },
        },
        {
          "@type": "Offer",
          itemOffered: {
            "@type": "Service",
            name: "Exhibition Design",
            description: "Custom exhibition spaces and booths",
          },
        },
        {
          "@type": "Offer",
          itemOffered: {
            "@type": "Service",
            name: "Retail Branding",
            description: "Retail space design and branding solutions",
          },
        },
      ],
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <NavBar />
      <Hero />
      <AboutSection />
      <OurStrengthSection />
      <OurServicesSection />
      <PortfolioSection />
      <ClientsTestimonials />
      <Contact />
      <Footer />
    </>
  );
}
