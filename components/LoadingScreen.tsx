"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

export default function LoadingScreen() {
  const [isLoading, setIsLoading] = useState(true);
  const [progress, setProgress] = useState(0);
  const pathname = usePathname();

  // Don't show loading screen on admin routes
  const isAdminRoute = pathname?.startsWith('/admin');

  useEffect(() => {
    if (typeof window === 'undefined') {
      setIsLoading(false);
      return;
    }
    
    if (isAdminRoute) {
      setIsLoading(false);
      return;
    }
    
    // Force close after maximum 500ms (increased from 200ms for reliability)
    const maxTimeout = setTimeout(() => {
      setIsLoading(false);
    }, 500);

    const completeLoading = () => {
      clearTimeout(maxTimeout);
      setIsLoading(false);
    };

    // Check if already loaded
    if (typeof document !== 'undefined') {
      if (document.readyState === "complete" || document.readyState === "interactive") {
        // Already loaded, close immediately
        completeLoading();
        return;
      } else {
        // Wait for load events
        document.addEventListener("DOMContentLoaded", completeLoading, { once: true });
        if (typeof window !== 'undefined') {
          window.addEventListener("load", completeLoading, { once: true });
        }
      }
    }

    // Additional safety: Force close after 1 second regardless
    const safetyTimeout = setTimeout(() => {
      setIsLoading(false);
    }, 1000);

    return () => {
      clearTimeout(maxTimeout);
      clearTimeout(safetyTimeout);
      if (typeof document !== 'undefined') {
        document.removeEventListener("DOMContentLoaded", completeLoading);
      }
      if (typeof window !== 'undefined') {
        window.removeEventListener("load", completeLoading);
      }
    };
  }, [isAdminRoute, pathname]);

  // Don't show on admin routes or if already loaded
  if (isAdminRoute || !isLoading) return null;
  
  // Skip loading screen if page is already interactive
  if (typeof window !== 'undefined' && document.readyState === 'complete') {
    return null;
  }

  if (!isLoading) return null;

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key="loading-screen"
        initial={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2, ease: "easeInOut" }}
        className="fixed inset-0 z-[9999] bg-gradient-to-br from-[#1A1A1E] via-[#1A1A1E] to-[#0F0F12] flex items-center justify-center overflow-hidden"
        style={{ willChange: "opacity" }}
      >
          {/* Simplified Background - Less DOM elements */}
          <div className="absolute inset-0 opacity-10">
            <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern id="hexPattern" x="0" y="0" width="100" height="86.6" patternUnits="userSpaceOnUse">
                  <polygon points="50,5 90,30 90,70 50,90 10,70 10,30" fill="none" stroke="#FA9616" strokeWidth="1" opacity="0.3" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#hexPattern)" />
            </svg>
          </div>

          {/* Main Content */}
          <div className="relative z-10 flex flex-col items-center justify-center space-y-8">
            {/* Brand Logo/Name Animation */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="text-center"
            >
              {/* Animated Text Container */}
              <div className="relative">
                {/* HYPEHATCH - Letter by Letter */}
                <motion.h1
                  className="text-5xl md:text-7xl font-bold font-heading leading-tight flex justify-center gap-1 md:gap-2"
                >
                  {"HYPEHATCH".split("").map((letter, index) => (
                    <motion.span
                      key={`hypehatch-${index}`}
                      className="inline-block"
                      style={{
                        background: "linear-gradient(135deg, #FA9616 0%, #FFB84D 50%, #FA9616 100%)",
                        backgroundSize: "200% 100%",
                        WebkitBackgroundClip: "text",
                        WebkitTextFillColor: "transparent",
                        backgroundClip: "text",
                      }}
                      initial={{ opacity: 0, y: 30, scale: 0.3 }}
                      animate={{
                        opacity: 1,
                        y: [0, -8, 0],
                        scale: [1, 1.1, 1],
                        backgroundPosition: [
                          "0% 50%",
                          "100% 50%",
                          "0% 50%",
                        ],
                      }}
                      transition={{
                        opacity: { delay: index * 0.08, duration: 0.4 },
                        y: {
                          delay: index * 0.08,
                          duration: 1.5,
                          repeat: Infinity,
                          repeatDelay: 0.3,
                          ease: "easeInOut",
                        },
                        scale: {
                          delay: index * 0.08,
                          duration: 1.5,
                          repeat: Infinity,
                          repeatDelay: 0.3,
                          ease: "easeInOut",
                        },
                        backgroundPosition: {
                          duration: 2,
                          repeat: Infinity,
                          delay: index * 0.1,
                          ease: "linear",
                        },
                      }}
                    >
                      {letter === " " ? "\u00A0" : letter}
                    </motion.span>
                  ))}
                </motion.h1>

                {/* EVENTS - Letter by Letter */}
                <motion.h1
                  className="text-5xl md:text-7xl font-bold font-heading leading-tight flex justify-center gap-1 md:gap-2"
                >
                  {"EVENTS".split("").map((letter, index) => (
                    <motion.span
                      key={`events-${index}`}
                      className="inline-block"
                      style={{
                        background: "linear-gradient(135deg, #FA9616 0%, #FFB84D 50%, #FA9616 100%)",
                        backgroundSize: "200% 100%",
                        WebkitBackgroundClip: "text",
                        WebkitTextFillColor: "transparent",
                        backgroundClip: "text",
                      }}
                      initial={{ opacity: 0, y: 30, scale: 0.3 }}
                      animate={{
                        opacity: 1,
                        y: [0, 8, 0],
                        scale: [1, 1.1, 1],
                        backgroundPosition: [
                          "100% 50%",
                          "0% 50%",
                          "100% 50%",
                        ],
                      }}
                      transition={{
                        opacity: { delay: 0.7 + index * 0.08, duration: 0.4 },
                        y: {
                          delay: 0.7 + index * 0.08,
                          duration: 1.5,
                          repeat: Infinity,
                          repeatDelay: 0.3,
                          ease: "easeInOut",
                        },
                        scale: {
                          delay: 0.7 + index * 0.08,
                          duration: 1.5,
                          repeat: Infinity,
                          repeatDelay: 0.3,
                          ease: "easeInOut",
                        },
                        backgroundPosition: {
                          duration: 2,
                          repeat: Infinity,
                          delay: 0.5 + index * 0.1,
                          ease: "linear",
                        },
                      }}
                    >
                      {letter === " " ? "\u00A0" : letter}
                    </motion.span>
                  ))}
                </motion.h1>
                
                {/* Glowing Shadow Effect */}
                <motion.div
                  className="absolute inset-0 blur-2xl opacity-30 -z-10"
                  style={{
                    background: "linear-gradient(135deg, #FA9616 0%, #FFB84D 100%)",
                  }}
                  animate={{
                    opacity: [0.2, 0.5, 0.2],
                    scale: [1, 1.08, 1],
                  }}
                  transition={{
                    duration: 2.5,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                />
              </div>
            </motion.div>

            {/* Animated Hexagon Icon */}
            <motion.div
              className="relative"
              animate={{
                rotate: [0, 360],
              }}
              transition={{
                duration: 8,
                repeat: Infinity,
                ease: "linear",
              }}
            >
              <motion.div
                className="w-20 h-20 md:w-24 md:h-24 relative"
                animate={{
                  scale: [1, 1.1, 1],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              >
                <svg
                  width="100%"
                  height="100%"
                  viewBox="0 0 100 100"
                  className="text-[#FA9616]"
                >
                  <polygon
                    points="50,10 85,30 85,70 50,90 15,70 15,30"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <motion.polygon
                    points="50,10 85,30 85,70 50,90 15,70 15,30"
                    fill="none"
                    stroke="url(#gradient)"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeDasharray="200"
                    animate={{
                      strokeDashoffset: [200, 0],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "linear",
                    }}
                  />
                  <defs>
                    <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#FA9616" stopOpacity="1" />
                      <stop offset="100%" stopColor="#FFB84D" stopOpacity="0.5" />
                    </linearGradient>
                  </defs>
                </svg>
              </motion.div>
            </motion.div>

            {/* Progress Bar */}
            <div className="w-64 md:w-80 h-1 bg-[#2A2A2E] rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-[#FA9616] to-[#FFB84D] rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.3, ease: "easeOut" }}
              />
            </div>

            {/* Loading Text */}
            <motion.p
              className="text-sm md:text-base text-[#888581] font-body tracking-wide"
              animate={{
                opacity: [0.5, 1, 0.5],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            >
              Loading Experience...
            </motion.p>

            {/* Simplified Floating Particles - Less elements */}
            {Array.from({ length: 3 }).map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-2 h-2 bg-[#FA9616] rounded-full"
                style={{
                  left: `${30 + i * 20}%`,
                  top: `${40 + (i % 2) * 20}%`,
                }}
                animate={{
                  y: [0, -20, 0],
                  opacity: [0, 0.8, 0],
                  scale: [0, 1, 0],
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  delay: i * 0.5,
                  ease: "easeInOut",
                }}
              />
            ))}
          </div>
        </motion.div>
    </AnimatePresence>
  );
}

