"use client";

import { useEffect, useState, useRef } from "react";

const SLOGANS = [
  "CRAFTING IMPACT. CREATING STORIES.",
  "WE ENGINEER EXPERIENCES",
  "EXPERIENCE. CRAFTED TO CONNECT",
];

const STATS = [
  { value: 500, suffix: "+", label: "Events Delivered" },
  { value: 150, suffix: "+", label: "Happy Clients" },
  { value: 10, suffix: "+", label: "Years Experience" },
  { value: 50, suffix: "+", label: "Cities Covered" },
];

export default function Hero() {
  const [isClient, setIsClient] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [displayText, setDisplayText] = useState("");

  // Use refs to persist animation state across re-renders
  const currentCharIndexRef = useRef(0);
  const sloganIndexRef = useRef(0);
  const timeoutIdsRef = useRef<NodeJS.Timeout[]>([]);
  const isAnimatingRef = useRef(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    setIsClient(true);
    // Check for reduced motion preference
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mediaQuery.matches);

    const handleChange = (e: MediaQueryListEvent) => {
      setReducedMotion(e.matches);
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => {
      if (typeof window !== 'undefined') {
        mediaQuery.removeEventListener("change", handleChange);
      }
    };
  }, []);

  // Auto-write animation - cycles through all slogans
  useEffect(() => {
    if (!isClient) {
      return;
    }

    if (reducedMotion) {
      setDisplayText(SLOGANS[0]);
      isAnimatingRef.current = false;
      return;
    }

    // Clear any existing timeouts before starting new animation
    timeoutIdsRef.current.forEach((id) => clearTimeout(id));
    timeoutIdsRef.current = [];
    
    // Reset animation state when starting
    currentCharIndexRef.current = 0;
    sloganIndexRef.current = 0;
    setDisplayText(""); // Start with empty text
    isAnimatingRef.current = true;

    const addTimeout = (callback: () => void, delay: number) => {
      const id = setTimeout(callback, delay);
      timeoutIdsRef.current.push(id);
      return id;
    };

    const typeText = () => {
      if (!isAnimatingRef.current) return; // Safety check
      
      const currentSlogan = SLOGANS[sloganIndexRef.current];
      
      if (currentCharIndexRef.current < currentSlogan.length) {
        setDisplayText(currentSlogan.slice(0, currentCharIndexRef.current + 1));
        currentCharIndexRef.current++;
        addTimeout(typeText, 50); // Typing speed
      } else {
        // Finished typing, move to next slogan after pause
        addTimeout(() => {
          if (!isAnimatingRef.current) return; // Safety check
          sloganIndexRef.current = (sloganIndexRef.current + 1) % SLOGANS.length;
          currentCharIndexRef.current = 0;
          setDisplayText("");
          // Start typing next slogan
          addTimeout(typeText, 200);
        }, 3000); // Pause before next slogan
      }
    };

    // Start typing immediately (no delay for better UX)
    addTimeout(typeText, 100);

    return () => {
      // Clear all timeouts and reset animation flag
      timeoutIdsRef.current.forEach((id) => clearTimeout(id));
      timeoutIdsRef.current = [];
      isAnimatingRef.current = false;
    };
  }, [isClient, reducedMotion]);

  const [heroImages, setHeroImages] = useState<string[]>([]);

  // Fetch hero images from API (non-blocking, with timeout)
  useEffect(() => {
    if (!isClient) return;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000); // 3s timeout

    const fetchHeroImages = async () => {
      try {
        const response = await fetch("/api/hero", { 
          signal: controller.signal,
          cache: 'force-cache', // Cache for faster loads
        });
        if (!response.ok) throw new Error('Failed to fetch');
        const data = await response.json();
        if (data.images && data.images.length > 0) {
          const urls = data.images.map((img: { url: string }) => img.url);
          setHeroImages(urls);
        } else {
          setHeroImages([]);
        }
      } catch (error) {
        if (error instanceof Error && error.name !== 'AbortError') {
          console.error("Error fetching hero images:", error);
        }
        setHeroImages([]);
      } finally {
        clearTimeout(timeoutId);
      }
    };

    // Delay fetch slightly to not block initial render
    const fetchTimeout = setTimeout(fetchHeroImages, 100);
    
    return () => {
      clearTimeout(fetchTimeout);
      clearTimeout(timeoutId);
      controller.abort();
    };
  }, [isClient]);

  // Animated counter state - MUST be before early return
  const [counters, setCounters] = useState(STATS.map(() => 0));
  const countersAnimatedRef = useRef(false);

  // Animate counters when component is visible
  useEffect(() => {
    if (!isClient || reducedMotion || countersAnimatedRef.current) return;

    const duration = 2000; // 2 seconds
    const steps = 60;
    const stepDuration = duration / steps;
    const timeoutIds: NodeJS.Timeout[] = [];

    STATS.forEach((stat, index) => {
      const targetValue = stat.value;
      const increment = targetValue / steps;
      let currentStep = 0;

      const animateCounter = () => {
        if (currentStep < steps) {
          setCounters((prev) => {
            const newCounters = [...prev];
            newCounters[index] = Math.min(
              Math.floor(increment * (currentStep + 1)),
              targetValue
            );
            return newCounters;
          });
          currentStep++;
          const timeoutId = setTimeout(animateCounter, stepDuration);
          timeoutIds.push(timeoutId);
        } else {
          // Ensure final value is exact
          setCounters((prev) => {
            const newCounters = [...prev];
            newCounters[index] = targetValue;
            return newCounters;
          });
        }
      };

      // Stagger the start of each counter
      const startTimeout = setTimeout(() => {
        animateCounter();
      }, index * 100);
      timeoutIds.push(startTimeout);
    });

    countersAnimatedRef.current = true;

    return () => {
      timeoutIds.forEach((id) => clearTimeout(id));
      countersAnimatedRef.current = false;
    };
  }, [isClient, reducedMotion]);

  // Cycle through images
  useEffect(() => {
    if (!isClient || reducedMotion || heroImages.length === 0) return;

    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % heroImages.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [isClient, reducedMotion, heroImages.length]);

  // Use dynamic images only - no fallback
  const images = heroImages;
  
  // Show empty state if no images - but keep animations working
  if (!isClient) {
    return (
      <section className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-[#1A1A1E] to-[#0F0F12]">
        <div className="text-center px-8">
          <h1 className="font-heading font-extrabold uppercase text-4xl md:text-6xl mb-4 text-white">
            HYPEHATCH EVENTS
          </h1>
          <p className="text-gray-400 text-lg">Loading...</p>
        </div>
      </section>
    );
  }

  return (
    <section
      id="hero"
      className="min-h-screen flex items-center justify-center relative overflow-hidden bg-[#0D0D0D]"
      aria-label="Hero section"
    >
      {/* Cinematic Blurred Background with Pan/Zoom */}
      {images.length > 0 ? (
        <div
          className={`absolute inset-0 z-0 transition-opacity duration-1000 ${
            reducedMotion ? "" : "animate-cinematic-pan-zoom"
          }`}
          style={{
            backgroundImage: `url('${images[currentImageIndex]}')`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
            filter: "blur(8px)",
            WebkitFilter: "blur(8px)",
            willChange: reducedMotion ? "auto" : "transform",
            transform: "translateZ(0)", // Force GPU acceleration
            backfaceVisibility: "hidden", // Better performance on mobile
            WebkitBackfaceVisibility: "hidden",
          }}
        >
          {/* Dark gradient overlay */}
          <div
            className="absolute inset-0"
            style={{
              background: "linear-gradient(to bottom, #0D0D0D 0%, #1A1A1E 100%)",
              opacity: 0.75,
            }}
          />
        </div>
      ) : (
        <div
          className="absolute inset-0 z-0"
          style={{
            background: "linear-gradient(to bottom, #0D0D0D 0%, #1A1A1E 100%)",
          }}
        />
      )}

      {/* Content */}
      <div className="relative z-10 w-full max-w-container mx-auto px-8 md:px-16 lg:px-20 py-20 md:py-32 text-center">
        {/* Large Centered Text with Auto-write Animation */}
        <div
          className={`relative mb-16 ${
            reducedMotion ? "opacity-100" : "opacity-0 animate-fade-in"
          }`}
          style={{
            animationDelay: reducedMotion ? "0s" : "0.5s",
            animationFillMode: "forwards",
          }}
        >
          <h1
            className="font-heading font-extrabold uppercase leading-[0.95] tracking-tight relative"
            style={{
              fontSize: "clamp(3.5rem, 10vw, 7.5rem)",
              background: "linear-gradient(to bottom, #FFFFFF 0%, #FA9616 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
              color: "transparent",
              lineHeight: "0.9",
              letterSpacing: "-0.02em",
              textShadow: "0 0 40px rgba(250, 150, 22, 0.3)",
              filter: "drop-shadow(0 0 30px rgba(250, 150, 22, 0.2))",
              minHeight: "1.2em",
            }}
          >
            {displayText || (reducedMotion ? SLOGANS[0] : "")}
            {/* Blinking cursor */}
            {isClient && !reducedMotion && (
              <span
                className="inline-block w-1 h-[0.9em] ml-1 align-middle"
                style={{
                  backgroundColor: "#FA9616",
                  animation: "blink 1s ease-in-out infinite",
                  opacity: displayText.length > 0 ? 1 : 0.3,
                }}
              />
            )}
          </h1>

          {/* Amber Glow Around Text */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: "transparent",
              filter: "blur(20px)",
              opacity: 0.3,
            }}
            aria-hidden="true"
          >
            <h1
              className="font-heading font-extrabold uppercase leading-[0.95] tracking-tight"
              style={{
                fontSize: "clamp(3.5rem, 10vw, 7.5rem)",
                color: "#FA9616",
                lineHeight: "0.9",
                letterSpacing: "-0.02em",
              }}
            >
              {displayText || (reducedMotion ? SLOGANS[0] : "")}
            </h1>
          </div>
        </div>

        {/* Stats Counters */}
        <div
          className={`grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12 max-w-5xl mx-auto mb-12 ${
            reducedMotion ? "opacity-100" : "opacity-0 animate-fade-in"
          }`}
          style={{
            animationDelay: reducedMotion ? "0s" : "1s",
            animationFillMode: "forwards",
          }}
        >
          {STATS.map((stat, index) => (
            <div
              key={index}
              className="flex flex-col items-center"
              style={{
                background: "rgba(26, 26, 30, 0.6)",
                backdropFilter: "blur(10px)",
                borderRadius: "16px",
                padding: "24px 16px",
                border: "1px solid rgba(250, 150, 22, 0.2)",
              }}
            >
              <div
                className="text-3xl md:text-4xl lg:text-5xl font-heading font-bold mb-2"
                style={{
                  color: "#FA9616",
                  textShadow: "0 0 20px rgba(250, 150, 22, 0.5)",
                }}
              >
                {counters[index] || 0}
                {stat.suffix}
              </div>
              <p
                className="text-sm md:text-base font-body"
                style={{ color: "rgba(255, 255, 255, 0.8)" }}
              >
                {stat.label}
              </p>
            </div>
          ))}
        </div>

        {/* CTA Button with Subtle Glow */}
        <div
          className={`${
            reducedMotion ? "opacity-100" : "opacity-0 animate-fade-in"
          }`}
          style={{
            animationDelay: reducedMotion ? "0s" : "1.4s",
            animationFillMode: "forwards",
          }}
        >
          <a
            href="#recent-events"
            className="inline-block px-10 py-5 rounded-full font-medium font-body text-lg min-w-[220px] text-center focus:outline-none focus:ring-2 focus:ring-[#FA9616] focus:ring-offset-2 transition-all duration-300"
            style={{
              background: "rgba(26, 26, 30, 0.8)",
              color: "#FFFFFF",
              border: "2px solid rgba(250, 150, 22, 0.4)",
              backdropFilter: "blur(10px)",
              boxShadow: "0 0 20px rgba(250, 150, 22, 0.2)",
            }}
            onMouseEnter={(e) => {
              if (!reducedMotion) {
                e.currentTarget.style.borderColor = "rgba(250, 150, 22, 0.9)";
                e.currentTarget.style.boxShadow =
                  "0 0 30px rgba(250, 150, 22, 0.5), 0 0 60px rgba(250, 150, 22, 0.3)";
                e.currentTarget.style.transform = "scale(1.05)";
              }
            }}
            onMouseLeave={(e) => {
              if (!reducedMotion) {
                e.currentTarget.style.borderColor = "rgba(250, 150, 22, 0.4)";
                e.currentTarget.style.boxShadow = "0 0 20px rgba(250, 150, 22, 0.2)";
                e.currentTarget.style.transform = "scale(1)";
              }
            }}
            aria-label="Explore our recent events"
          >
            Explore Our Work
          </a>
        </div>
      </div>

      {/* CSS Animations */}
      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes cinematic-pan-zoom {
          0% {
            transform: scale(1.05) translate(0%, 0%);
          }
          25% {
            transform: scale(1.08) translate(-1%, -0.5%);
          }
          50% {
            transform: scale(1.1) translate(-2%, -1%);
          }
          75% {
            transform: scale(1.08) translate(-1%, -0.5%);
          }
          100% {
            transform: scale(1.05) translate(0%, 0%);
          }
        }

        @keyframes blink {
          0%, 50% {
            opacity: 1;
          }
          51%, 100% {
            opacity: 0;
          }
        }

        .animate-fade-in {
          animation: fade-in 1s ease-out;
        }

        .animate-cinematic-pan-zoom {
          animation: cinematic-pan-zoom 10s ease-in-out infinite;
          will-change: transform;
          transform: translateZ(0);
          backface-visibility: hidden;
          -webkit-backface-visibility: hidden;
        }

        /* Ensure animation works on mobile */
        @media (max-width: 768px) {
          .animate-cinematic-pan-zoom {
            animation: cinematic-pan-zoom 10s ease-in-out infinite;
            will-change: transform;
            transform: translateZ(0);
            -webkit-transform: translateZ(0);
            backface-visibility: hidden;
            -webkit-backface-visibility: hidden;
            -webkit-perspective: 1000;
            perspective: 1000;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .animate-fade-in,
          .animate-cinematic-pan-zoom {
            animation: none;
          }
        }
      `}</style>
    </section>
  );
}
