"use client";

import { useEffect, useRef, useState, ReactNode } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { fadeUp, fadeIn, fadeScale, reducedMotionVariants } from "@/lib/motion";

interface RevealProps {
  children: ReactNode;
  variant?: "fadeIn" | "fadeUp" | "fadeScale";
  delay?: number;
  className?: string;
}

const variantMap = {
  fadeIn,
  fadeUp,
  fadeScale,
};

export default function Reveal({
  children,
  variant = "fadeUp",
  delay = 0,
  className = "",
}: RevealProps) {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const hasAnimated = useRef(false);
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    if (hasAnimated.current || !ref.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !hasAnimated.current) {
            setIsVisible(true);
            hasAnimated.current = true;
            observer.disconnect();
          }
        });
      },
      {
        threshold: 0.1,
        rootMargin: "0px 0px -50px 0px",
      }
    );

    observer.observe(ref.current);

    return () => {
      observer.disconnect();
    };
  }, []);

  const selectedVariant = prefersReducedMotion
    ? reducedMotionVariants
    : variantMap[variant];

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={isVisible ? "visible" : "hidden"}
      variants={selectedVariant}
      transition={{
        delay: prefersReducedMotion ? 0 : delay,
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}


