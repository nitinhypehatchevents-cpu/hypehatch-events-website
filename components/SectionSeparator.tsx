"use client";

import { motion } from "framer-motion";
import { useReducedMotion } from "framer-motion";

interface SectionSeparatorProps {
  title: string;
  tagline?: string;
  className?: string;
}

export default function SectionSeparator({
  title,
  tagline,
  className = "",
}: SectionSeparatorProps) {
  const prefersReducedMotion = useReducedMotion() ?? false;

  return (
    <div className={`text-center mb-6 md:mb-8 lg:mb-10 ${className}`}>
      <motion.div
        className="relative inline-block"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          duration: prefersReducedMotion ? 0 : 0.6,
          ease: [0.16, 1, 0.3, 1],
        }}
      >
        {/* Main Title with Depth Shadow */}
        <h2
          className="text-3xl md:text-4xl lg:text-5xl font-heading font-extrabold uppercase tracking-wider relative z-10"
          style={{
            background: "linear-gradient(to bottom, #1A1A1E 0%, #888581 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
            color: "transparent",
            textShadow: "0 4px 8px rgba(0, 0, 0, 0.1), 0 8px 16px rgba(0, 0, 0, 0.08)",
            filter: "drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1)) drop-shadow(0 4px 8px rgba(0, 0, 0, 0.08))",
          }}
        >
          {title}
        </h2>

        {/* Depth Shadow Layers */}
        <div
          className="absolute inset-0 text-3xl md:text-4xl lg:text-5xl font-heading font-extrabold uppercase tracking-wider opacity-30"
          style={{
            background: "linear-gradient(to bottom, #1A1A1E 0%, #888581 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
            color: "transparent",
            transform: "translateY(4px) translateX(2px)",
            zIndex: 0,
            filter: "blur(2px)",
          }}
          aria-hidden="true"
        >
          {title}
        </div>
        <div
          className="absolute inset-0 text-3xl md:text-4xl lg:text-5xl font-heading font-extrabold uppercase tracking-wider opacity-20"
          style={{
            background: "linear-gradient(to bottom, #1A1A1E 0%, #888581 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
            color: "transparent",
            transform: "translateY(8px) translateX(4px)",
            zIndex: 0,
            filter: "blur(4px)",
          }}
          aria-hidden="true"
        >
          {title}
        </div>

        {/* Glowing Underline with Shadow */}
        <motion.div
          className="absolute bottom-0 left-0 right-0 h-1 origin-center"
          style={{
            background: "linear-gradient(to right, transparent, #FA9616, transparent)",
            boxShadow: "0 0 20px rgba(250, 150, 22, 0.5), 0 4px 8px rgba(250, 150, 22, 0.3)",
          }}
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{
            duration: prefersReducedMotion ? 0 : 0.8,
            delay: prefersReducedMotion ? 0 : 0.3,
            ease: [0.16, 1, 0.3, 1],
          }}
        />
      </motion.div>

      {/* Tagline */}
      {tagline && (
        <motion.p
          className="text-xs md:text-sm text-ink opacity-70 font-medium tracking-wide mt-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{
            duration: prefersReducedMotion ? 0 : 0.6,
            delay: prefersReducedMotion ? 0 : 0.5,
          }}
        >
          {tagline}
        </motion.p>
      )}
    </div>
  );
}

