"use client";

import { useRef } from "react";
import { motion, useInView, useReducedMotion } from "framer-motion";
import Reveal from "./Reveal";
import SectionSeparator from "./SectionSeparator";
import { fadeUp, staggerContainer } from "@/lib/motion";

interface ServiceCardProps {
  icon: string;
  title: string;
  description: string;
  delay: number;
  prefersReducedMotion: boolean;
  animationType: "pulse" | "spark" | "shimmer" | "sweep" | "rotate" | "glow";
}

function ServiceCard({
  icon,
  title,
  description,
  delay,
  prefersReducedMotion,
  animationType,
}: ServiceCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(cardRef, { once: true, margin: "-50px" });

  // Split title to color first word differently
  const titleParts = title.split(" ");
  const firstWord = titleParts[0];
  const remainingWords = titleParts.slice(1).join(" ");

  // Animation variants for different service types
  const getIconAnimation = () => {
    if (prefersReducedMotion) return {};

    switch (animationType) {
      case "pulse":
        return {
          scale: [1, 1.05, 1],
          opacity: [1, 0.9, 1],
        };
      case "spark":
        return {
          scale: [1, 1.08, 1],
          rotate: [0, 5, -5, 0],
        };
      case "shimmer":
        return {
          scale: [1, 1.03, 1],
          filter: [
            "brightness(1)",
            "brightness(1.2)",
            "brightness(1)",
          ],
        };
      case "sweep":
        return {
          scale: [1, 1.05, 1],
          opacity: [1, 0.95, 1],
        };
      case "rotate":
        return {
          rotate: [0, 360],
          scale: [1, 1.05, 1],
        };
      case "glow":
        return {
          scale: [1, 1.06, 1],
          filter: [
            "drop-shadow(0 0 0px rgba(250, 150, 22, 0))",
            "drop-shadow(0 0 12px rgba(250, 150, 22, 0.5))",
            "drop-shadow(0 0 0px rgba(250, 150, 22, 0))",
          ],
        };
      default:
        return {
          scale: [1, 1.03, 1],
        };
    }
  };

  return (
    <motion.div
      ref={cardRef}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      variants={prefersReducedMotion ? { hidden: { opacity: 1 }, visible: { opacity: 1 } } : fadeUp}
      transition={{ duration: 0.6, delay: prefersReducedMotion ? 0 : delay }}
      whileHover={prefersReducedMotion ? {} : { y: -4, transition: { duration: 0.3 } }}
      className="relative bg-white rounded-lg p-6 md:p-8 shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100 hover:border-[#FA9616] hover:border-opacity-40"
      style={{
        boxShadow: isInView && !prefersReducedMotion
          ? "0 2px 12px rgba(0, 0, 0, 0.08)"
          : "0 1px 4px rgba(0, 0, 0, 0.04)",
      }}
    >
      {/* Animated Icon */}
      <div className="relative mb-5 flex justify-center">
        <motion.div
          animate={prefersReducedMotion ? {} : getIconAnimation()}
          transition={{
            duration: animationType === "rotate" ? 8 : 3,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="relative"
        >
          {/* Original Icon - No Background */}
          <img
            src={icon}
            alt=""
            width={icon.includes("Events") ? 90 : 80}
            height={icon.includes("Events") ? 90 : 80}
            className={icon.includes("Events") ? "w-24 h-24 md:w-28 md:h-28 object-contain" : "w-20 h-20 md:w-24 md:h-24 object-contain"}
            aria-hidden="true"
            style={{
              display: "block",
            }}
            onError={(e) => {
              console.error("Icon failed to load:", icon);
            }}
          />
        </motion.div>
      </div>

      {/* Heading */}
      <h3 className="text-xl md:text-2xl font-heading font-bold mb-3 leading-tight">
        <span style={{ color: "#FA9616" }}>{firstWord}</span>
        {remainingWords && (
          <>
            {" "}
            <span style={{ color: "#888581" }}>{remainingWords}</span>
          </>
        )}
      </h3>

      {/* Description */}
      <p className="text-body text-ink leading-relaxed text-sm md:text-base">
        {description}
      </p>
    </motion.div>
  );
}

export default function OurServicesSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-100px" });
  const prefersReducedMotion = useReducedMotion() ?? false;

  const services = [
    {
      icon: "/icons/services/BTL.jpg",
      title: "BTL",
      description:
        "Below-the-line marketing creates personal connections, driving engagement through focused campaigns that resonate with target audiences effectively.",
      animationType: "pulse" as const,
    },
    {
      icon: "/icons/services/Events.png",
      title: "Events",
      description:
        "Our events are designed to create memorable experiences, fostering brand loyalty and community engagement through interactive participation.",
      animationType: "spark" as const,
    },
    {
      icon: "/icons/services/Retail.png",
      title: "Retail",
      description:
        "Tailored retail activations enhance customer experiences, blending product interaction with creative presentations to captivate shoppers' attention.",
      animationType: "shimmer" as const,
    },
    {
      icon: "/icons/services/Exhibition.png",
      title: "Exhibitions",
      description:
        "We craft immersive exhibitions that showcase brands uniquely, ensuring visitors leave with a lasting impression and engaging memories.",
      animationType: "sweep" as const,
    },
    {
      icon: "/icons/services/Fabrication.png",
      title: "Fabrication",
      description:
        "Our fabrication services transform ideas into tangible assets, delivering innovative displays that stand out and communicate brand narratives effectively.",
      animationType: "rotate" as const,
    },
    {
      icon: "/icons/services/Manpower.png",
      title: "Manpower",
      description:
        "Backed by strong manpower support, our strategic promotions blend creativity and timing to maximize brand visibility and drive sales through targeted outreach and compelling messaging.",
      animationType: "glow" as const,
    },
  ];

  return (
    <section
      ref={sectionRef}
      id="services"
      className="relative pt-8 md:pt-12 lg:pt-16 pb-12 md:pb-16 lg:pb-20 my-8 md:my-12 overflow-hidden bg-white shadow-md rounded-lg mx-4 md:mx-8 lg:mx-auto max-w-7xl"
      aria-label="Our Services section"
    >
      {/* Animated Service Elements - Tools & Versatility */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
        {/* Animated Service Icons/Tools Floating */}
        {!prefersReducedMotion && [...Array(6)].map((_, i) => (
          <motion.div
            key={`service-icon-${i}`}
            className="absolute"
            style={{
              width: `${50 + (i % 3) * 25}px`,
              height: `${50 + (i % 3) * 25}px`,
              left: `${10 + (i % 3) * 30}%`,
              top: `${15 + Math.floor(i / 3) * 35}%`,
              border: `3px solid rgba(250, 150, 22, ${0.4 + (i % 2) * 0.15})`,
              borderRadius: i % 2 === 0 ? '50%' : '12px',
            }}
            animate={isInView ? {
              y: [0, -25, 0],
              x: [0, 15, 0],
              rotate: [0, 20, -20, 0],
              scale: [1, 1.15, 1],
              opacity: [0.4, 0.65, 0.4],
            } : {}}
            transition={{
              duration: 4 + i * 0.5,
              repeat: Infinity,
              ease: "easeInOut",
              delay: i * 0.6,
            }}
          />
        ))}

        {/* Interconnected Service Nodes */}
        {!prefersReducedMotion && (
          <svg className="w-full h-full absolute inset-0" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 800">
            <defs>
              <linearGradient id="serviceGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FA9616" stopOpacity="0.35" />
                <stop offset="50%" stopColor="#FA9616" stopOpacity="0.2" />
                <stop offset="100%" stopColor="#FA9616" stopOpacity="0.35" />
              </linearGradient>
            </defs>
            {[...Array(8)].map((_, i) => {
              const x1 = 150 + (i % 4) * 300;
              const y1 = 150 + Math.floor(i / 4) * 300;
              const x2 = 250 + ((i + 2) % 4) * 300;
              const y2 = 250 + Math.floor((i + 2) / 4) * 300;
              return (
                <motion.line
                  key={`service-line-${i}`}
                  x1={x1}
                  y1={y1}
                  x2={x2}
                  y2={y2}
                  stroke="url(#serviceGradient)"
                  strokeWidth="3"
                  strokeDasharray="8,4"
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={isInView ? {
                    pathLength: [0, 1, 0],
                    opacity: [0, 0.6, 0],
                  } : { pathLength: 0, opacity: 0 }}
                  transition={{
                    pathLength: { duration: 3 + i * 0.3, repeat: Infinity, ease: "easeInOut" },
                    opacity: { duration: 2 + i * 0.2, repeat: Infinity, ease: "easeInOut" },
                    delay: i * 0.4,
                  }}
                />
              );
            })}
          </svg>
        )}

        {/* Animated Service Badges/Medals */}
        {!prefersReducedMotion && [...Array(4)].map((_, i) => (
          <motion.div
            key={`service-badge-${i}`}
            className="absolute rounded-full border-3 border-[#FA9616]"
            style={{
              width: `${70 + i * 20}px`,
              height: `${70 + i * 20}px`,
              left: `${20 + i * 25}%`,
              top: `${25 + (i % 2) * 50}%`,
              borderWidth: '3px',
            }}
            animate={isInView ? {
              scale: [1, 1.4, 1],
              rotate: [0, 180, 360],
              opacity: [0.3, 0.55, 0.3],
            } : {}}
            transition={{
              duration: 5 + i * 0.8,
              repeat: Infinity,
              ease: "easeInOut",
              delay: i * 1.2,
            }}
          >
            {/* Inner circle for badge effect */}
            <motion.div
              className="absolute inset-3 rounded-full border-2 border-[#FA9616]"
              style={{
                borderWidth: '2px',
              }}
              animate={isInView ? {
                scale: [1, 0.7, 1],
                opacity: [0.35, 0.65, 0.35],
              } : {}}
              transition={{
                duration: 3 + i * 0.5,
                repeat: Infinity,
                ease: "easeInOut",
                delay: i * 0.8,
              }}
            />
          </motion.div>
        ))}

        {/* Flowing Service Ribbons */}
        {!prefersReducedMotion && [...Array(3)].map((_, i) => (
          <motion.div
            key={`service-ribbon-${i}`}
            className="absolute w-full"
            style={{
              top: `${30 + i * 25}%`,
              height: '3px',
              background: `linear-gradient(90deg, transparent, rgba(250, 150, 22, ${0.35 + i * 0.1}), transparent)`,
              transform: 'skewX(-15deg)',
            }}
            animate={isInView ? {
              x: ["-100%", "100%"],
              opacity: [0, 0.75, 0],
            } : {}}
            transition={{
              duration: 5 + i * 1.5,
              repeat: Infinity,
              ease: "linear",
              delay: i * 2,
            }}
          />
        ))}
      </div>

      <div className="relative z-10 max-w-container mx-auto px-8 md:px-16 lg:px-20">
        {/* Section Title */}
        <Reveal variant="fadeUp" delay={0.1}>
          <SectionSeparator
            title="OUR SERVICES"
            tagline="Crafted Experiences. Measurable Impact."
          />
        </Reveal>

        {/* Services Cards Grid - 3x2 on desktop, 2x3 on tablet, 1x6 on mobile */}
        <motion.div
          variants={prefersReducedMotion ? {} : staggerContainer}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8"
        >
          {services.map((service, index) => (
            <ServiceCard
              key={index}
              icon={service.icon}
              title={service.title}
              description={service.description}
              delay={index * 0.15}
              prefersReducedMotion={prefersReducedMotion}
              animationType={service.animationType}
            />
          ))}
        </motion.div>
      </div>

      {/* CSS for additional animations */}
      <style jsx>{`
        @media (prefers-reduced-motion: reduce) {
          * {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.01ms !important;
          }
        }
      `}</style>
    </section>
  );
}

