"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useInView, useReducedMotion, useScroll, useTransform } from "framer-motion";
import Reveal from "./Reveal";
import SectionSeparator from "./SectionSeparator";

export default function AboutSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-100px" });
  const prefersReducedMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });

  // Parallax transform for background hex grid
  const backgroundY = useTransform(scrollYProgress, [0, 1], [0, 50]);


  return (
    <section
      ref={sectionRef}
      id="about"
      className="relative pt-8 md:pt-12 lg:pt-16 pb-16 md:pb-20 lg:pb-24 my-8 md:my-12 lg:my-16 overflow-hidden bg-gray-50 border-t-4 border-[#FA9616] shadow-xl mx-4 md:mx-8 lg:mx-auto max-w-7xl rounded-2xl"
      aria-label="About Us section"
    >
      {/* Animated Flowing Lines Background - Storytelling Flow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 800">
          <defs>
            <linearGradient id="flowGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FA9616" stopOpacity="0.25" />
              <stop offset="50%" stopColor="#FA9616" stopOpacity="0.15" />
              <stop offset="100%" stopColor="#FA9616" stopOpacity="0.25" />
            </linearGradient>
          </defs>
          {[...Array(5)].map((_, i) => (
            <motion.path
              key={`flow-${i}`}
              d={`M ${i * 300} ${200 + i * 100} Q ${300 + i * 200} ${150 + i * 80}, ${600 + i * 300} ${250 + i * 120} T ${1200} ${300 + i * 100}`}
              fill="none"
              stroke="url(#flowGradient)"
              strokeWidth="3"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={isInView && !prefersReducedMotion ? {
                pathLength: 1,
                opacity: [0.4, 0.7, 0.4],
              } : { pathLength: 0, opacity: 0 }}
              transition={{
                pathLength: { duration: 3 + i * 0.5, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" },
                opacity: { duration: 2 + i * 0.3, repeat: Infinity, ease: "easeInOut" },
              }}
            />
          ))}
        </svg>
      </div>

      {/* Animated Floating Particles */}
      {!prefersReducedMotion && [...Array(8)].map((_, i) => (
        <motion.div
          key={`particle-${i}`}
          className="absolute w-3 h-3 rounded-full bg-[#FA9616]"
          style={{
            left: `${10 + i * 12}%`,
            top: `${20 + (i % 3) * 25}%`,
          }}
          animate={{
            y: [0, -30, 0],
            x: [0, 15, 0],
            scale: [1, 1.8, 1],
            opacity: [0.35, 0.6, 0.35],
          }}
          transition={{
            duration: 3 + i * 0.3,
            repeat: Infinity,
            ease: "easeInOut",
            delay: i * 0.2,
          }}
        />
      ))}

      <div className="relative z-10 max-w-container mx-auto px-8 md:px-16 lg:px-20">
        {/* Section Title */}
        <Reveal variant="fadeUp" delay={0.1}>
          <SectionSeparator
            title="ABOUT US"
            tagline="Experience. Crafted to Connect."
          />
        </Reveal>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-start mt-4 md:mt-6">
          {/* Left: Text Content */}
          <div className="space-y-6">
            {/* Headline */}
            <Reveal variant="fadeUp" delay={0.2}>
              <h2
                className="text-4xl md:text-5xl lg:text-6xl font-heading font-extrabold leading-tight tracking-tight"
                style={{
                  background: "linear-gradient(to bottom, #1A1A1E 0%, #888581 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                  color: "transparent",
                }}
              >
                EXPERIENCE. CRAFTED TO CONNECT.
              </h2>
            </Reveal>

            {/* Content Paragraphs */}
            <Reveal variant="fadeUp" delay={0.3}>
              <div className="space-y-6 text-body text-ink leading-relaxed">
                <p className="text-base md:text-lg">
                  At Hypehatch Events, we don&apos;t just execute events — we engineer
                  immersive brand experiences that spark emotion, drive engagement, and leave
                  a lasting impression.
                </p>
                <p className="text-base md:text-lg">
                  Every activation, launch, and exhibition is a story brought to life —
                  blending creativity, precision, and purpose. From retail branding and BTL
                  promotions to corporate experiences and large-scale exhibitions, each
                  project is tailored to connect audiences with the essence of your brand.
                </p>
                <p className="text-base md:text-lg">
                  We believe that every interaction is an opportunity to create impact. Our
                  multidisciplinary team brings together strategic thinking, design
                  innovation, and flawless execution to transform spaces into experiences —
                  where technology meets storytelling, and brands become unforgettable.
                </p>
                <p className="text-base md:text-lg">
                  With a proven presence across diverse industries, we continue to redefine
                  how audiences see, feel, and remember brands — turning every campaign into
                  a living story of connection.
                </p>
              </div>
            </Reveal>

            {/* Accent Line */}
            <Reveal variant="fadeUp" delay={0.4}>
              <div className="flex items-center gap-4 pt-4">
                <div
                  className="h-1 flex-1"
                  style={{
                    background: "linear-gradient(to right, #FA9616, transparent)",
                  }}
                />
                <div
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: "#FA9616" }}
                />
              </div>
            </Reveal>
          </div>

          {/* Right: PNG Image */}
          <Reveal variant="fadeScale" delay={0.2}>
            <div className="relative w-full flex items-start justify-center">
              <img
                src="/images/about/about-image.png"
                alt="Hypehatch Events Creative Process Infographic"
                className="w-full h-auto object-contain max-h-[500px] md:max-h-[600px]"
              />
            </div>
          </Reveal>
        </div>
      </div>

      {/* CSS for additional animations */}
      <style jsx>{`
        @keyframes hexFloat {
          0%,
          100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-10px);
          }
        }

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

