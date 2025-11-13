"use client";

import { useRef } from "react";
import { motion, useInView, useReducedMotion } from "framer-motion";
import Reveal from "./Reveal";
import SectionSeparator from "./SectionSeparator";
import { fadeUp, staggerContainer } from "@/lib/motion";

interface StrengthCardProps {
  icon: string;
  title: string;
  description: string;
  delay: number;
  prefersReducedMotion: boolean;
}

function StrengthCard({
  icon,
  title,
  description,
  delay,
  prefersReducedMotion,
}: StrengthCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(cardRef, { once: true, margin: "-50px" });

  // Split title to color first word differently
  const titleParts = title.split(" ");
  const firstWord = titleParts[0];
  const remainingWords = titleParts.slice(1).join(" ");

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
          animate={
            prefersReducedMotion
              ? {}
              : {
                  scale: [1, 1.1, 1],
                  filter: [
                    "drop-shadow(0 0 0px rgba(250, 150, 22, 0))",
                    "drop-shadow(0 0 12px rgba(250, 150, 22, 0.4))",
                    "drop-shadow(0 0 0px rgba(250, 150, 22, 0))",
                  ],
                }
          }
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="relative"
        >
          <div 
            className="w-16 h-16 md:w-20 md:h-20 relative"
          >
            <img
              src={`${icon}?v=2`}
              alt=""
              className="w-full h-full object-contain"
              aria-hidden="true"
              key={icon}
            />
          </div>
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

export default function OurStrengthSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-100px" });
  const prefersReducedMotion = useReducedMotion() ?? false;

  const strengths = [
    {
      icon: "/icons/strength/In House Fabrication.svg",
      title: "In-House Fabrication Facility",
      description:
        "We have a fully equipped fabrication setup that allows us to design and build custom event structures, stalls, and branding units in-house — ensuring high quality, quick turnaround, and cost-effective solutions with complete quality control.",
    },
    {
      icon: "/icons/strength/Manpower.svg",
      title: "Strong Manpower Network",
      description:
        "Our pan-India manpower base enables smooth execution of any scale of BTL or manpower-driven activity — from college activations and mall promotions to corporate events and retail branding — delivering consistent on-ground excellence.",
    },
    {
      icon: "/icons/strength/creativity.svg",
      title: "Creative + Strategic Thinking",
      description:
        "We blend creativity, strategy, and technology to create impactful brand experiences. Every project is designed to connect emotionally, communicate clearly, and deliver measurable results.",
    },
  ];

  return (
    <section
      ref={sectionRef}
      id="strength"
      className="relative py-12 md:py-16 lg:py-20 my-8 md:my-12 overflow-hidden bg-white shadow-md rounded-lg mx-4 md:mx-8 lg:mx-auto max-w-7xl"
      aria-label="Our Strength section"
    >
      {/* Dynamic Geometric Shapes - Power & Strength */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={`shape-${i}`}
            className="absolute"
            style={{
              width: `${80 + i * 30}px`,
              height: `${80 + i * 30}px`,
              left: `${15 + i * 15}%`,
              top: `${10 + (i % 2) * 40}%`,
              border: `3px solid rgba(250, 150, 22, ${0.25 + i * 0.05})`,
              borderRadius: i % 2 === 0 ? '50%' : '20%',
            }}
            animate={isInView && !prefersReducedMotion ? {
              rotate: [0, 360],
              scale: [1, 1.3, 1],
              opacity: [0.25, 0.5, 0.25],
            } : {}}
            transition={{
              rotate: { duration: 20 + i * 5, repeat: Infinity, ease: "linear" },
              scale: { duration: 3 + i * 0.5, repeat: Infinity, ease: "easeInOut" },
              opacity: { duration: 2 + i * 0.3, repeat: Infinity, ease: "easeInOut" },
              delay: i * 0.2,
            }}
          />
        ))}
      </div>

      {/* Pulsing Energy Waves */}
      {!prefersReducedMotion && [...Array(3)].map((_, i) => (
        <motion.div
          key={`wave-${i}`}
          className="absolute inset-0 rounded-full border-3 border-[#FA9616]"
          style={{
            left: `${30 + i * 20}%`,
            top: `${30 + i * 15}%`,
            width: `${200 + i * 100}px`,
            height: `${200 + i * 100}px`,
            transform: 'translate(-50%, -50%)',
            borderWidth: '3px',
          }}
          animate={{
            scale: [1, 2.2, 1],
            opacity: [0.3, 0, 0.3],
          }}
          transition={{
            duration: 4 + i,
            repeat: Infinity,
            ease: "easeOut",
            delay: i * 1.5,
          }}
        />
      ))}

      <div className="relative z-10 max-w-container mx-auto px-8 md:px-16 lg:px-20">
        {/* Section Title */}
        <Reveal variant="fadeUp" delay={0.1}>
          <SectionSeparator
            title="OUR STRENGTH"
            tagline="Driven by Precision. Defined by People. Powered by Ideas."
          />
        </Reveal>

        {/* Strength Cards Grid */}
        <motion.div
          variants={prefersReducedMotion ? {} : staggerContainer}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8"
        >
          {strengths.map((strength, index) => (
            <StrengthCard
              key={index}
              icon={strength.icon}
              title={strength.title}
              description={strength.description}
              delay={index * 0.15}
              prefersReducedMotion={prefersReducedMotion}
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

