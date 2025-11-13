"use client";

import { useState, useEffect } from "react";
import { motion, useScroll, useReducedMotion, useMotionValueEvent, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { SECTION_IDS } from "@/lib/constants";

export default function NavBar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState<string>("");
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const { scrollY } = useScroll();
  const prefersReducedMotion = useReducedMotion();

  // Track scroll position for navbar background
  useMotionValueEvent(scrollY, "change", (latest) => {
    setIsScrolled(latest > 50);
  });

  // Detect active section based on scroll position
  useEffect(() => {
    if (prefersReducedMotion) return;
    if (typeof window === 'undefined') return;

    const handleScroll = () => {
      const sections = Object.values(SECTION_IDS);
      const scrollPosition = window.scrollY + 100;

      for (let i = sections.length - 1; i >= 0; i--) {
        const section = document.getElementById(sections[i]);
        if (section) {
          const offsetTop = section.offsetTop;
          if (scrollPosition >= offsetTop) {
            setActiveSection(sections[i]);
            break;
          }
        }
      }

      // If at top, set hero as active
      if (window.scrollY < 100) {
        setActiveSection(SECTION_IDS.hero);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll(); // Initial check

    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener("scroll", handleScroll);
      }
    };
  }, [prefersReducedMotion]);

  // Smooth scroll handler
  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    const targetId = href.replace("#", "");
    const targetElement = document.getElementById(targetId);

    if (targetElement) {
      const offsetTop = targetElement.offsetTop - 80; // Account for sticky navbar
      window.scrollTo({
        top: offsetTop,
        behavior: prefersReducedMotion ? "auto" : "smooth",
      });
    }

    // Close mobile menu if open
    setIsMobileMenuOpen(false);
  };

  const navItems = [
    { id: SECTION_IDS.hero, label: "Home", href: `#${SECTION_IDS.hero}` },
    { id: SECTION_IDS.about, label: "About", href: `#${SECTION_IDS.about}` },
    {
      id: SECTION_IDS.strength,
      label: "Our Strength",
      href: `#${SECTION_IDS.strength}`,
    },
    {
      id: SECTION_IDS.services,
      label: "Services",
      href: `#${SECTION_IDS.services}`,
    },
    {
      id: SECTION_IDS.portfolio,
      label: "Portfolio",
      href: `#${SECTION_IDS.portfolio}`,
    },
    {
      id: SECTION_IDS.clientsTestimonials,
      label: "Clients",
      href: `#${SECTION_IDS.clientsTestimonials}`,
    },
    {
      id: SECTION_IDS.contact,
      label: "Contact",
      href: `#${SECTION_IDS.contact}`,
    },
  ];

  return (
    <motion.nav
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{
        duration: prefersReducedMotion ? 0 : 0.8,
        ease: [0.16, 1, 0.3, 1],
      }}
      className={`sticky top-0 z-50 transition-all duration-300 ${
        isScrolled
          ? "bg-white shadow-lg"
          : "bg-white/95 backdrop-blur-sm border-b border-gray-100"
      }`}
      role="navigation"
      aria-label="Main navigation"
    >
      <div className="max-w-container mx-auto px-8 md:px-16 lg:px-20">
        <div className="flex items-center justify-between py-2 md:py-3">
          {/* Enlarged Logo with impressive animation */}
          <motion.a
            href={`#${SECTION_IDS.hero}`}
            className="flex items-center focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 rounded-lg"
            aria-label="Hypehatch Events home"
            initial={{ opacity: 0, scale: 0.5, rotate: -180 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            transition={{
              duration: prefersReducedMotion ? 0 : 0.8,
              delay: prefersReducedMotion ? 0 : 0.1,
              ease: [0.34, 1.56, 0.64, 1],
              type: "spring",
              stiffness: 200,
              damping: 15,
            }}
            whileHover={
              prefersReducedMotion
                ? {}
                : {
                    scale: 1.1,
                    rotate: [0, -10, 10, -5, 0],
                    transition: { duration: 0.6 },
                  }
            }
            whileTap={prefersReducedMotion ? {} : { scale: 0.95 }}
          >
            <motion.div
              className="relative"
              whileHover={prefersReducedMotion ? {} : { y: -3 }}
            >
              <img
                src="/logo.svg"
                alt="Hypehatch Events Logo"
                width={220}
                height={65}
                className="h-12 md:h-14 lg:h-16 w-auto"
                style={{ display: 'block' }}
              />
            </motion.div>
          </motion.a>

          {/* Desktop Navigation with impressive animations */}
          <ul className="hidden md:flex gap-4 lg:gap-6 items-center">
            {navItems.map((item, index) => {
              const isActive = activeSection === item.id;
              const isHovered = hoveredItem === item.id;

              return (
                <motion.li
                  key={item.id}
                  initial={{ opacity: 0, y: -30, scale: 0.8 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{
                    duration: prefersReducedMotion ? 0 : 0.5,
                    delay: prefersReducedMotion ? 0 : 0.4 + index * 0.1,
                    ease: [0.34, 1.56, 0.64, 1],
                    type: "spring",
                    stiffness: 300,
                    damping: 20,
                  }}
                  onHoverStart={() => setHoveredItem(item.id)}
                  onHoverEnd={() => setHoveredItem(null)}
                >
                  <motion.a
                    href={item.href}
                    onClick={(e) => handleNavClick(e, item.href)}
                    className={`relative text-ink font-body font-medium text-base lg:text-lg focus:outline-none focus:ring-2 focus:ring-offset-2 rounded-lg px-4 py-2 transition-colors ${
                      isActive ? "text-[#FF7A00]" : "hover:text-[#FF7A00]"
                    }`}
                    style={{ "--tw-ring-color": "#FF7A00" } as React.CSSProperties}
                    aria-label={`Navigate to ${item.label} section`}
                    aria-current={isActive ? "page" : undefined}
                    whileHover={
                      prefersReducedMotion
                        ? {}
                        : {
                            y: -4,
                            scale: 1.08,
                            transition: {
                              type: "spring",
                              stiffness: 400,
                              damping: 17,
                            },
                          }
                    }
                    whileTap={prefersReducedMotion ? {} : { scale: 0.92, y: 0 }}
                  >
                    {/* Orange animated background on hover */}
                    <motion.div
                      className="absolute inset-0 rounded-lg"
                      style={{ backgroundColor: "rgba(255, 122, 0, 0.15)" }}
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{
                        scale: isHovered || isActive ? 1 : 0,
                        opacity: isHovered || isActive ? 1 : 0,
                      }}
                      transition={{
                        duration: 0.3,
                        ease: [0.16, 1, 0.3, 1],
                      }}
                    />

                    {/* Text with glow effect */}
                    <motion.span
                      className="relative z-10"
                      animate={
                        isHovered && !prefersReducedMotion
                          ? {
                              textShadow: [
                                "0 0 0px rgba(255, 122, 0, 0)",
                                "0 0 12px rgba(255, 122, 0, 0.6)",
                                "0 0 0px rgba(255, 122, 0, 0)",
                              ],
                            }
                          : {}
                      }
                      transition={{
                        duration: 1.5,
                        repeat: isHovered && !prefersReducedMotion ? Infinity : 0,
                        ease: "easeInOut",
                      }}
                    >
                      {item.label}
                    </motion.span>

                    {/* Orange animated underline */}
                    <motion.span
                      className="absolute bottom-0 left-0 right-0 h-1 origin-left rounded-full"
                      style={{ backgroundColor: "#FF7A00" }}
                      initial={{ scaleX: 0 }}
                      animate={{
                        scaleX: isActive ? 1 : isHovered ? 1 : 0,
                      }}
                      transition={{
                        duration: 0.4,
                        ease: [0.16, 1, 0.3, 1],
                      }}
                    />

                    {/* Orange active indicator with pulse */}
                    <AnimatePresence>
                      {isActive && (
                        <motion.span
                          className="absolute -top-1 -right-1 w-3 h-3 rounded-full"
                          style={{ backgroundColor: "#FF7A00" }}
                          initial={{ scale: 0, opacity: 0 }}
                          animate={{
                            scale: [1, 1.4, 1],
                            opacity: [1, 0.6, 1],
                            boxShadow: [
                              "0 0 0px rgba(255, 122, 0, 0)",
                              "0 0 8px rgba(255, 122, 0, 0.8)",
                              "0 0 0px rgba(255, 122, 0, 0)",
                            ],
                          }}
                          exit={{ scale: 0, opacity: 0 }}
                          transition={{
                            duration: 2,
                            repeat: Infinity,
                            ease: "easeInOut",
                          }}
                        />
                      )}
                    </AnimatePresence>

                    {/* Orange ripple effect on click */}
                    <motion.span
                      className="absolute inset-0 rounded-lg"
                      style={{ backgroundColor: "rgba(255, 122, 0, 0.3)" }}
                      initial={{ scale: 0, opacity: 0.6 }}
                      whileTap={
                        prefersReducedMotion
                          ? {}
                          : {
                              scale: 2,
                              opacity: 0,
                              transition: { duration: 0.4 },
                            }
                      }
                    />
                  </motion.a>
                </motion.li>
              );
            })}
          </ul>

          {/* Mobile menu button with enhanced animation */}
          <motion.button
            className="md:hidden text-ink hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 rounded-lg p-2 relative z-50"
            aria-label="Toggle mobile menu"
            aria-expanded={isMobileMenuOpen}
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            whileTap={prefersReducedMotion ? {} : { scale: 0.85 }}
            whileHover={prefersReducedMotion ? {} : { scale: 1.15, rotate: 90 }}
            transition={{ type: "spring", stiffness: 400, damping: 17 }}
          >
            <motion.div
              className="w-7 h-7 relative flex items-center justify-center"
              animate={isMobileMenuOpen ? { rotate: 180 } : { rotate: 0 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            >
              <AnimatePresence mode="wait">
                {isMobileMenuOpen ? (
                  <motion.svg
                    key="close"
                    className="w-7 h-7 absolute"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                    initial={{ rotate: -90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: 90, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <motion.path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2.5}
                      d="M6 18L18 6M6 6l12 12"
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: 1 }}
                      transition={{ duration: 0.4 }}
                    />
                  </motion.svg>
                ) : (
                  <motion.svg
                    key="menu"
                    className="w-7 h-7 absolute"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                    initial={{ rotate: 90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: -90, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <motion.path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2.5}
                      d="M4 6h16M4 12h16M4 18h16"
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: 1 }}
                      transition={{ duration: 0.5, delay: 0.1 }}
                    />
                  </motion.svg>
                )}
              </AnimatePresence>
            </motion.div>
          </motion.button>
        </div>

        {/* Mobile menu with impressive animations */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{
                duration: prefersReducedMotion ? 0 : 0.5,
                ease: [0.16, 1, 0.3, 1],
              }}
              className="md:hidden overflow-hidden"
            >
              <motion.ul
                className="py-4 space-y-2"
                initial="closed"
                animate="open"
                exit="closed"
                variants={{
                  open: {
                    transition: {
                      staggerChildren: prefersReducedMotion ? 0 : 0.1,
                      delayChildren: prefersReducedMotion ? 0 : 0.15,
                    },
                  },
                  closed: {
                    transition: {
                      staggerChildren: 0.05,
                      staggerDirection: -1,
                    },
                  },
                }}
              >
                {navItems.map((item) => {
                  const isActive = activeSection === item.id;

                  return (
                    <motion.li
                      key={item.id}
                      variants={{
                        open: {
                          opacity: 1,
                          x: 0,
                          scale: 1,
                          transition: {
                            duration: prefersReducedMotion ? 0 : 0.4,
                            ease: [0.34, 1.56, 0.64, 1],
                            type: "spring",
                            stiffness: 300,
                            damping: 25,
                          },
                        },
                        closed: {
                          opacity: 0,
                          x: -30,
                          scale: 0.8,
                          transition: {
                            duration: prefersReducedMotion ? 0 : 0.3,
                          },
                        },
                      }}
                    >
                      <motion.a
                        href={item.href}
                        onClick={(e) => handleNavClick(e, item.href)}
                        className={`block text-ink font-body font-medium text-lg py-4 px-6 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 transition-colors relative overflow-hidden ${
                          isActive
                            ? "text-ink font-semibold bg-gray-100"
                            : "hover:text-gray-700 hover:bg-gray-50"
                        }`}
                        aria-label={`Navigate to ${item.label} section`}
                        aria-current={isActive ? "page" : undefined}
                        whileHover={
                          prefersReducedMotion
                            ? {}
                            : {
                                x: 8,
                                scale: 1.02,
                                transition: {
                                  type: "spring",
                                  stiffness: 400,
                                  damping: 20,
                                },
                              }
                        }
                        whileTap={prefersReducedMotion ? {} : { scale: 0.98 }}
                      >
                        <span className="relative z-10 flex items-center justify-between">
                          {item.label}
                          {isActive && (
                            <motion.span
                              className="w-2 h-2 bg-gray-600 rounded-full"
                              initial={{ scale: 0 }}
                              animate={{
                                scale: [1, 1.3, 1],
                                opacity: [1, 0.7, 1],
                              }}
                              transition={{
                                duration: 1.5,
                                repeat: Infinity,
                                ease: "easeInOut",
                              }}
                            />
                          )}
                        </span>
                      </motion.a>
                    </motion.li>
                  );
                })}
              </motion.ul>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.nav>
  );
}
