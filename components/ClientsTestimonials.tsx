"use client";

import { useEffect, useState, useRef } from "react";
import Reveal from "./Reveal";
import SectionSeparator from "./SectionSeparator";
import { motion, useReducedMotion } from "framer-motion";

interface Client {
  id: string;
  name: string;
  logo: string;
  website?: string;
}

// Helper function to encode logo paths - simple and safe for SSR
const getLogoPath = (path: string): string => {
  return path.replace(/ /g, '%20');
};

// All data comes from dashboard - no static fallbacks

export default function ClientsTestimonials() {
  const prefersReducedMotion = useReducedMotion() ?? false;
  const carouselRef = useRef<HTMLDivElement>(null);
  const isManualScrollingRef = useRef(false);
  const [brands, setBrands] = useState<Client[]>([]);
  const [testimonials, setTestimonials] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch brands and testimonials from API
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch brands
        const brandsResponse = await fetch("/api/brands");
        if (brandsResponse.ok) {
          const brandsData = await brandsResponse.json();
          
          if (brandsData.brands && brandsData.brands.length > 0) {
            // Filter out any duplicates by ID to ensure each brand appears only once
            const uniqueBrands = brandsData.brands.filter((brand: any, index: number, self: any[]) =>
              index === self.findIndex((b: any) => b.id === brand.id)
            );
            // Use logoUrl if available (uploaded images), otherwise use logo (manual path)
            const apiBrands: Client[] = uniqueBrands.map((brand: any) => ({
              id: brand.id,
              name: brand.name,
              logo: brand.logoUrl || brand.logo, // Prefer logoUrl (uploaded) over logo (manual)
              website: brand.website,
            }));
            setBrands(apiBrands);
          } else {
            setBrands([]);
          }
        } else {
          console.error("Failed to fetch brands:", brandsResponse.status);
          setBrands([]);
        }

        // Fetch testimonials
        const testimonialsResponse = await fetch("/api/testimonials");
        if (testimonialsResponse.ok) {
          const testimonialsData = await testimonialsResponse.json();
          
          if (testimonialsData.testimonials && testimonialsData.testimonials.length > 0) {
            const apiTestimonials = testimonialsData.testimonials.map((test: any) => ({
              id: test.id,
              quote: test.quote,
              author: {
                name: test.author,
                title: test.role || "",
                company: test.company || "",
              },
            }));
            setTestimonials(apiTestimonials);
          } else {
            // No testimonials - show empty state
            setTestimonials([]);
          }
        } else {
          console.error("Failed to fetch testimonials:", testimonialsResponse.status);
          setTestimonials([]);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        // No fallback - show empty states
        setBrands([]);
        setTestimonials([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Show brands without duplication - each logo appears only once
  const displayBrands = brands;

  // Auto-scroll carousel (pauses when hovering)
  const isHoveringRef = useRef(false);
  
  useEffect(() => {
    if (!carouselRef.current || brands.length === 0 || prefersReducedMotion) return;

    const carousel = carouselRef.current;
    let scrollInterval: NodeJS.Timeout | null = null;

    const startAutoScroll = () => {
      if (scrollInterval) return; // Already running
      
      scrollInterval = setInterval(() => {
        if (!carousel || isHoveringRef.current) return; // Pause when hovering
        
        const maxScroll = carousel.scrollWidth - carousel.clientWidth;
        const currentScroll = carousel.scrollLeft;
        
        // If at the end, reset to start
        if (currentScroll >= maxScroll - 10) {
          carousel.scrollTo({ left: 0, behavior: "smooth" });
        } else {
          // Scroll forward smoothly - increased speed (2.5 pixels per frame = ~150 pixels/second)
          carousel.scrollBy({ left: 2.5, behavior: "auto" });
        }
      }, 16); // ~60fps smooth scroll
    };

    const stopAutoScroll = () => {
      if (scrollInterval) {
        clearInterval(scrollInterval);
        scrollInterval = null;
      }
    };

    // Start auto-scroll
    startAutoScroll();

    return () => {
      stopAutoScroll();
    };
  }, [brands.length, prefersReducedMotion]);

  // Mouse hover tracking for carousel control
  const mouseMoveRef = useRef<number | null>(null);
  
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!carouselRef.current || prefersReducedMotion) return;
    
    // Throttle mouse move for performance
    if (mouseMoveRef.current) {
      cancelAnimationFrame(mouseMoveRef.current);
    }
    
    mouseMoveRef.current = requestAnimationFrame(() => {
      if (!carouselRef.current) return;
      
      const carousel = carouselRef.current;
      const rect = carousel.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const carouselWidth = rect.width;
      const centerX = carouselWidth / 2;
      
      // Calculate scroll speed based on distance from center
      const distanceFromCenter = mouseX - centerX;
      const normalizedDistance = distanceFromCenter / (carouselWidth / 2); // -1 to 1
      const scrollSpeed = Math.abs(normalizedDistance); // 0 to 1
      const maxScrollSpeed = 4; // pixels per frame
      
      // Scroll direction: right if mouse is on right side, left if on left side
      if (normalizedDistance > 0.1) {
        // Mouse on right side - scroll right
        const scrollAmount = scrollSpeed * maxScrollSpeed;
        const maxScroll = carousel.scrollWidth - carousel.clientWidth;
        if (carousel.scrollLeft < maxScroll) {
          carousel.scrollBy({ left: scrollAmount, behavior: "auto" });
        }
      } else if (normalizedDistance < -0.1) {
        // Mouse on left side - scroll left
        const scrollAmount = scrollSpeed * maxScrollSpeed;
        if (carousel.scrollLeft > 0) {
          carousel.scrollBy({ left: -scrollAmount, behavior: "auto" });
        }
      }
    });
  };

  const handleMouseEnter = () => {
    isHoveringRef.current = true; // Pause auto-scroll when hovering
    isManualScrollingRef.current = true;
  };

  const handleMouseLeave = () => {
    isHoveringRef.current = false; // Resume auto-scroll when leaving
    isManualScrollingRef.current = false;
    if (mouseMoveRef.current) {
      cancelAnimationFrame(mouseMoveRef.current);
      mouseMoveRef.current = null;
    }
  };

  return (
    <section
      id="clients-testimonials"
      className="relative py-12 md:py-16 lg:py-20 my-8 md:my-12 overflow-hidden bg-white shadow-md rounded-lg mx-4 md:mx-8 lg:mx-auto max-w-7xl"
      aria-label="Clients and testimonials section"
    >
      {/* Network Connection Lines - Relationships & Connections */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 800">
          {[...Array(8)].map((_, i) => {
            const x1 = 100 + (i % 4) * 300;
            const y1 = 150 + Math.floor(i / 4) * 300;
            const x2 = 200 + ((i + 2) % 4) * 300;
            const y2 = 250 + Math.floor((i + 2) / 4) * 300;
            return (
              <motion.line
                key={`connection-${i}`}
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke="rgba(250, 150, 22, 0.25)"
                strokeWidth="2"
                strokeDasharray="8,4"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={!prefersReducedMotion ? {
                  pathLength: [0, 1, 0],
                  opacity: [0, 0.5, 0],
                } : { pathLength: 0, opacity: 0 }}
                transition={{
                  pathLength: { duration: 3 + i * 0.3, repeat: Infinity, ease: "easeInOut" },
                  opacity: { duration: 2 + i * 0.2, repeat: Infinity, ease: "easeInOut" },
                  delay: i * 0.3,
                }}
              />
            );
          })}
        </svg>
      </div>

      {/* Floating Connection Nodes */}
      {!prefersReducedMotion && [...Array(6)].map((_, i) => (
        <motion.div
          key={`node-${i}`}
          className="absolute w-4 h-4 rounded-full bg-[#FA9616]"
          style={{
            left: `${20 + (i % 3) * 30}%`,
            top: `${25 + Math.floor(i / 3) * 30}%`,
          }}
          animate={{
            scale: [1, 2.2, 1],
            opacity: [0.35, 0.65, 0.35],
          }}
          transition={{
            duration: 2 + i * 0.3,
            repeat: Infinity,
            ease: "easeInOut",
            delay: i * 0.4,
          }}
        />
      ))}

      <div className="relative z-10 max-w-container mx-auto px-8 md:px-16 lg:px-20">
        {/* Section Header */}
        <Reveal variant="fadeUp">
          <SectionSeparator
            title="OUR ESTEEMED CLIENTS"
            tagline="Trusted by brands that lead"
          />
        </Reveal>

        {/* Agency Partners Description */}
        <Reveal variant="fadeUp" delay={0.1}>
          <div className="mt-8 md:mt-10 mb-6 md:mb-8">
            <p className="text-base md:text-lg text-ink font-body leading-relaxed text-center max-w-4xl mx-auto">
              We have had the privilege of executing events and activations for these brands in association with our esteemed agency partners —{" "}
              <span className="font-semibold text-[#FA9616]">Jagran Solutions</span>,{" "}
              <span className="font-semibold text-[#FA9616]">Progems</span>,{" "}
              <span className="font-semibold text-[#FA9616]">Kies</span>,{" "}
              <span className="font-semibold text-[#FA9616]">Impacts Communication</span>,{" "}
              <span className="font-semibold text-[#FA9616]">Orienta Cine Advertising</span>,{" "}
              <span className="font-semibold text-[#FA9616]">MGroup</span>,{" "}
              <span className="font-semibold text-[#FA9616]">Tranzform</span>,{" "}
              <span className="font-semibold text-[#FA9616]">Tougue</span>,{" "}
              <span className="font-semibold text-[#FA9616]">Main Stage</span>, and others.
            </p>
          </div>
        </Reveal>

        {/* For Brands - Brand Logos */}
        <Reveal variant="fadeUp" delay={0.15}>
          <div className="mt-6 md:mt-8 mb-8 md:mb-10">
            <h3 className="text-lg md:text-xl font-heading font-semibold text-ink mb-4 md:mb-6 text-center">
              For Brands
            </h3>
            <div className="relative overflow-hidden">
              {brands.length > 0 ? (
              <div
                ref={carouselRef}
                onMouseMove={handleMouseMove}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
                className="flex gap-6 md:gap-8 lg:gap-10 overflow-x-auto overflow-y-visible scrollbar-hide px-4 md:px-8 py-4 relative z-0 cursor-grab active:cursor-grabbing"
                style={{
                  scrollBehavior: "smooth",
                }}
              >
                {displayBrands.map((brand, index) => (
                  <motion.div
                    key={`${brand.id}-${index}`}
                    className="flex-shrink-0 w-28 md:w-36 lg:w-40 h-20 md:h-28 lg:h-32 perspective-1000"
                    style={{ 
                      transformStyle: "preserve-3d",
                      perspective: "1000px",
                      overflow: "visible"
                    }}
                  >
                    <motion.div
                      className="relative w-full h-full bg-gradient-to-br from-white via-gray-50 to-gray-100 rounded-xl p-3 md:p-4 flex items-center justify-center shadow-lg border border-gray-200 hover:border-[#FA9616] hover:border-opacity-60 hover:shadow-2xl transition-all duration-200 grayscale hover:grayscale-0 group"
                      whileHover={prefersReducedMotion ? {} : { 
                        scale: 1.08, 
                        y: -6,
                        rotateY: 3,
                        rotateX: -3,
                        z: 15
                      }}
                      transition={{ duration: 0.15, ease: "easeOut" }}
                      style={{
                        transformStyle: "preserve-3d",
                        boxShadow: "0 10px 30px rgba(0, 0, 0, 0.1), 0 0 0 1px rgba(0, 0, 0, 0.05)",
                      }}
                    >
                      <motion.img
                        src={getLogoPath(brand.logo)}
                        alt={brand.name}
                        className="w-full h-full object-contain max-w-full max-h-full"
                        loading="lazy"
                        whileHover={prefersReducedMotion ? {} : {
                          scale: 1.05,
                          rotateZ: 1,
                          z: 5
                        }}
                        transition={{ duration: 0.15, ease: "easeOut" }}
                        style={{
                          transformStyle: "preserve-3d",
                          filter: "drop-shadow(0 4px 8px rgba(0, 0, 0, 0.15))"
                        }}
                        onError={(e) => {
                          console.error("Brand logo failed to load:", brand.logo);
                          // Hide the image on error
                          (e.target as HTMLImageElement).style.display = "none";
                        }}
                      />
                      {/* 3D shine effect overlay */}
                      <div 
                        className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none"
                        style={{
                          background: "linear-gradient(135deg, rgba(255, 255, 255, 0.3) 0%, transparent 50%)",
                          transform: "translateZ(5px)",
                          transformStyle: "preserve-3d"
                        }}
                      />
                    </motion.div>
                  </motion.div>
                ))}
              </div>
              ) : (
                <div className="text-center py-8 text-brandMuted font-body">
                  No brand logos available. Upload logos from the dashboard to see them here.
                </div>
              )}

            </div>
          </div>
        </Reveal>

        {/* Testimonials Section */}
        {testimonials.length > 0 && (
          <Reveal variant="fadeUp" delay={0.2}>
            <div className="mt-6">
              <h3 className="text-xl md:text-2xl font-heading font-semibold text-ink mb-6 md:mb-8 text-center">
                What Our Clients Say
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                {testimonials.map((testimonial, index) => (
                  <Reveal
                    key={testimonial.id}
                    variant="fadeUp"
                    delay={prefersReducedMotion ? 0 : index * 0.1}
                  >
                      <div className="card-interactive bg-white rounded-lg p-4 md:p-6 shadow-sm border border-gray-100 hover:shadow-md hover:border-[#FA9616] hover:border-opacity-40 transition-all duration-300">
                        <blockquote className="mb-4">
                          <p className="text-sm md:text-base text-ink font-body italic leading-relaxed">
                            &ldquo;{testimonial.quote}&rdquo;
                          </p>
                        </blockquote>
                        <div className="border-t border-gray-200 pt-3">
                          <p className="font-heading font-semibold text-ink text-xs md:text-sm">
                            {testimonial.author.name}
                          </p>
                          <p className="text-xs text-brandMuted font-body mt-1">
                            {testimonial.author.title}, {testimonial.author.company}
                          </p>
                        </div>
                      </div>
                  </Reveal>
                ))}
              </div>
            </div>
          </Reveal>
        )}
      </div>

      {/* CSS for carousel */}
      <style jsx>{`
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }

        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </section>
  );
}
