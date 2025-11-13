"use client";

import { useState, useRef, useEffect } from "react";
import { motion, useInView, useReducedMotion, AnimatePresence } from "framer-motion";
import Reveal from "./Reveal";
import SectionSeparator from "./SectionSeparator";
import { fadeUp, staggerContainer } from "@/lib/motion";

type Category = "events" | "activations";

interface PortfolioImage {
  id: string;
  src: string;
  alt: string;
  category: Category;
  width: number;
  height: number;
}

export default function PortfolioSection() {
  const [activeCategory, setActiveCategory] = useState<Category>("events");
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);
  const [failedImages, setFailedImages] = useState<Set<string>>(new Set());
  const [portfolioImages, setPortfolioImages] = useState<PortfolioImage[]>([]);
  const [loading, setLoading] = useState(true);
  const sectionRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-100px" });
  const prefersReducedMotion = useReducedMotion() ?? false;
  
  // Disabled scroll-based animations to prevent memory leaks and server crashes
  // const { scrollYProgress } = useScroll({
  //   target: sectionRef,
  //   offset: ["start end", "end start"],
  // });

  // Parallax transform for background hex grid - disabled for stability
  const backgroundY = 0;

  // All data comes from API - no static fallbacks

  // Fetch portfolio images from API
  useEffect(() => {
    const fetchPortfolio = async () => {
      try {
        const response = await fetch("/api/portfolio");
        const data = await response.json();
        
        if (data.images && data.images.length > 0) {
          // Convert API data to PortfolioImage format
          const apiImages: PortfolioImage[] = data.images.map((img: any) => ({
            id: img.id,
            src: img.src || img.imageUrl,
            alt: img.alt || img.title || "Portfolio image",
            category: img.category as Category,
            width: img.width || 800,
            height: img.height || 600,
          }));
          setPortfolioImages(apiImages);
        } else {
          // No fallback - show empty state
          setPortfolioImages([]);
        }
      } catch (error) {
        console.error("Error fetching portfolio:", error);
        // No fallback - show empty state
        setPortfolioImages([]);
      } finally {
        setLoading(false);
      }
    };

    fetchPortfolio();
  }, []);

  // Use portfolio images from API only
  const currentPortfolioImages = portfolioImages;

  // Filter images by category and exclude failed images
  const filteredImages = currentPortfolioImages.filter(
    (img) => img.category === activeCategory && !failedImages.has(img.src)
  );
  
  const selectedImage = selectedImageIndex !== null ? filteredImages[selectedImageIndex] : null;
  
  // Handle image load error - hide failed images completely
  const handleImageError = (src: string) => {
    // Silently add to failed images set - they will be filtered out
    setFailedImages((prev) => {
      const newSet = new Set(prev);
      newSet.add(src);
      return newSet;
    });
  };
  
  const handleNextImage = () => {
    if (selectedImageIndex !== null && selectedImageIndex < filteredImages.length - 1) {
      setSelectedImageIndex(selectedImageIndex + 1);
    }
  };
  
  const handlePreviousImage = () => {
    if (selectedImageIndex !== null && selectedImageIndex > 0) {
      setSelectedImageIndex(selectedImageIndex - 1);
    }
  };
  
  const handleImageClick = (image: PortfolioImage) => {
    const index = filteredImages.findIndex((img) => img.id === image.id);
    if (index !== -1) {
      setSelectedImageIndex(index);
    }
  };
  
  const handleCloseLightbox = () => {
    setSelectedImageIndex(null);
  };

  const categories: { id: Category; label: string }[] = [
    { id: "events", label: "Events" },
    { id: "activations", label: "Activations" },
  ];

  // Keyboard navigation for lightbox (Arrow keys and Escape)
  useEffect(() => {
    if (selectedImageIndex === null || typeof window === 'undefined') return;

    const handleKeyPress = (e: KeyboardEvent) => {
      if (selectedImageIndex === null) return;
      
      // Get current filtered images
      const currentFiltered = portfolioImages.filter(
        (img) => img.category === activeCategory && !failedImages.has(img.src)
      );
      
      if (e.key === "ArrowLeft" && selectedImageIndex > 0) {
        setSelectedImageIndex((prev) => prev !== null ? prev - 1 : null);
      } else if (e.key === "ArrowRight" && selectedImageIndex < currentFiltered.length - 1) {
        setSelectedImageIndex((prev) => {
          if (prev === null) return null;
          return prev + 1;
        });
      } else if (e.key === "Escape") {
        setSelectedImageIndex(null);
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => {
      window.removeEventListener("keydown", handleKeyPress);
    };
  }, [selectedImageIndex, activeCategory, failedImages, portfolioImages]);

  return (
    <section
      ref={sectionRef}
      id="portfolio"
      className="relative py-12 md:py-16 lg:py-20 my-8 md:my-12 overflow-hidden bg-white shadow-md rounded-lg mx-4 md:mx-8 lg:mx-auto max-w-7xl"
      aria-label="Portfolio section"
    >
      {/* Floating Image Frames - Creativity & Showcase */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
        {[...Array(5)].map((_, i) => (
          <motion.div
            key={`frame-${i}`}
            className="absolute border-3 border-[#FA9616]"
            style={{
              width: `${100 + i * 40}px`,
              height: `${80 + i * 30}px`,
              left: `${10 + i * 18}%`,
              top: `${15 + (i % 2) * 35}%`,
              borderRadius: '8px',
              borderWidth: '3px',
            }}
            animate={isInView && !prefersReducedMotion ? {
              y: [0, -25, 0],
              rotate: [0, 5, -5, 0],
              opacity: [0.25, 0.45, 0.25],
            } : {}}
            transition={{
              duration: 4 + i * 0.5,
              repeat: Infinity,
              ease: "easeInOut",
              delay: i * 0.4,
            }}
          />
        ))}
      </div>

      {/* Animated Spotlight Effect */}
      {!prefersReducedMotion && (
        <motion.div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: "radial-gradient(ellipse 800px 600px at 50% 50%, rgba(250, 150, 22, 0.25), transparent 70%)",
          }}
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.25, 0.4, 0.25],
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      )}

      <div className="relative z-10 max-w-container mx-auto px-8 md:px-16 lg:px-20">
        {/* Section Title */}
        <Reveal variant="fadeUp" delay={0.1}>
          <SectionSeparator
            title="OUR PORTFOLIO"
            tagline="Where Experiences Come Alive."
          />
        </Reveal>

        {/* Category Tabs */}
        <Reveal variant="fadeUp" delay={0.2}>
          <div className="flex justify-center mb-6 md:mb-8">
            <div className="inline-flex gap-2 p-1 bg-white rounded-lg shadow-sm border border-gray-100">
              {categories.map((category) => {
                const isActive = activeCategory === category.id;
                return (
                  <motion.button
                    key={category.id}
                    onClick={() => setActiveCategory(category.id)}
                    className={`relative px-6 md:px-8 py-3 md:py-4 rounded-md font-body font-medium text-sm md:text-base transition-colors focus:outline-none focus:ring-2 focus:ring-[#FA9616] focus:ring-offset-2 ${
                      isActive
                        ? "text-white"
                        : "text-ink hover:text-[#FA9616]"
                    }`}
                    whileHover={prefersReducedMotion ? {} : { scale: 1.05 }}
                    whileTap={prefersReducedMotion ? {} : { scale: 0.95 }}
                  >
                    {/* Active Background */}
                    <AnimatePresence>
                      {isActive && (
                        <motion.div
                          className="absolute inset-0 rounded-md"
                          style={{ backgroundColor: "#FA9616" }}
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.8 }}
                          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                          layoutId="activeTab"
                        />
                      )}
                    </AnimatePresence>
                    <span className="relative z-10">{category.label}</span>
                  </motion.button>
                );
              })}
            </div>
          </div>
        </Reveal>

        {/* Empty State */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-[#FA9616]"></div>
            <p className="mt-4 text-brandMuted">Loading portfolio...</p>
          </div>
        ) : filteredImages.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-brandMuted font-body text-lg">
              No {activeCategory} images available. Upload images from the dashboard to see them here.
            </p>
          </div>
        ) : (
        /* Compact Portfolio Grid - Album View */
        <AnimatePresence mode="wait">
          <motion.div
            key={activeCategory}
            initial="hidden"
            animate="visible"
            exit="hidden"
            variants={prefersReducedMotion ? {} : staggerContainer}
            className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-1.5 md:gap-2"
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          >
            {filteredImages.map((image, index) => (
              <motion.div
                key={image.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{
                  duration: 0.3,
                  delay: index * 0.05,
                  ease: [0.16, 1, 0.3, 1],
                }}
                whileHover={
                  prefersReducedMotion
                    ? {}
                    : {
                        scale: 1.05,
                        zIndex: 10,
                        transition: { duration: 0.2 },
                      }
                }
                className="relative group cursor-pointer"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleImageClick(image);
                }}
              >
                {/* Compact Image Thumbnail */}
                <div className="relative aspect-square overflow-hidden rounded-md bg-gray-100 shadow-sm">
                  <img
                    src={image.src}
                    alt={image.alt}
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                    loading="lazy"
                    onError={(e) => {
                      // Silently handle image errors - they will be filtered out
                      handleImageError(image.src);
                    }}
                  />
                  
                  {/* Hover Overlay */}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300" />
                  
                  {/* View Icon on Hover */}
                  <motion.div
                    className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    initial={{ scale: 0.8 }}
                    whileHover={{ scale: 1 }}
                  >
                    <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-white/90 flex items-center justify-center">
                      <svg
                        className="w-4 h-4 md:w-5 md:h-5 text-[#FA9616]"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v6m3-3H7"
                        />
                      </svg>
                    </div>
                  </motion.div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </AnimatePresence>
        )}
      </div>

      {/* Lightbox Modal with Navigation */}
      <AnimatePresence mode="wait">
        {selectedImage && selectedImageIndex !== null && selectedImageIndex >= 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 p-4 md:p-8"
            onClick={handleCloseLightbox}
          >
            {/* Close Button */}
            <button
              onClick={handleCloseLightbox}
              className="absolute top-4 right-4 md:top-8 md:right-8 text-white hover:text-[#FA9616] transition-colors focus:outline-none focus:ring-2 focus:ring-[#FA9616] rounded-lg p-2 z-10"
              aria-label="Close lightbox"
            >
              <svg
                className="w-8 h-8 md:w-10 md:h-10"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>

            {/* Previous Arrow */}
            {selectedImageIndex > 0 && (
              <motion.button
                onClick={(e) => {
                  e.stopPropagation();
                  handlePreviousImage();
                }}
                className="absolute left-4 md:left-8 text-white hover:text-[#FA9616] transition-colors focus:outline-none focus:ring-2 focus:ring-[#FA9616] rounded-lg p-3 md:p-4 z-10"
                aria-label="Previous image"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <svg
                  className="w-8 h-8 md:w-10 md:h-10"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
              </motion.button>
            )}

            {/* Next Arrow */}
            {selectedImageIndex < filteredImages.length - 1 && (
              <motion.button
                onClick={(e) => {
                  e.stopPropagation();
                  handleNextImage();
                }}
                className="absolute right-4 md:right-8 text-white hover:text-[#FA9616] transition-colors focus:outline-none focus:ring-2 focus:ring-[#FA9616] rounded-lg p-3 md:p-4 z-10"
                aria-label="Next image"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <svg
                  className="w-8 h-8 md:w-10 md:h-10"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </motion.button>
            )}

            {/* Image Container */}
            <motion.div
              key={`${selectedImage.id}-${selectedImageIndex}`}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="relative max-w-6xl max-h-[90vh] w-full h-full flex items-center justify-center"
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={selectedImage.src}
                alt={selectedImage.alt}
                className="max-w-full max-h-[90vh] w-auto h-auto object-contain"
                key={selectedImage.src}
                onError={(e) => {
                  console.error("Lightbox image failed to load:", selectedImage.src);
                }}
              />
              
              {/* Image Counter */}
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/60 text-white px-4 py-2 rounded-full text-sm md:text-base">
                {selectedImageIndex + 1} / {filteredImages.length}
              </div>
            </motion.div>

          </motion.div>
        )}
      </AnimatePresence>

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

