"use client";

import { useRef, useState, useEffect } from "react";
import { motion, useInView, useReducedMotion, AnimatePresence } from "framer-motion";
import SectionSeparator from "./SectionSeparator";

interface AddressItem {
  city?: string;
  address?: string;
}

interface ContactMethod {
  id: string;
  icon: string;
  label: string;
  value: string;
  city?: string; // City name for addresses
  address?: string; // Address text for addresses
  link: string;
}

interface ContactInfo {
  phone: string;
  email: string;
  address: string; // Deprecated - kept for backward compatibility
  addresses: AddressItem[]; // Array of address objects with city and address
  website: string;
  facebook: string;
  instagram: string;
  linkedin: string;
  twitter: string;
  youtube: string;
  whatsapp: string;
}

export default function Contact() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-100px" });
  const prefersReducedMotion = useReducedMotion() ?? false;
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);
  const [contactInfo, setContactInfo] = useState<ContactInfo>({
    phone: "",
    email: "",
    address: "",
    addresses: [],
    website: "",
    facebook: "",
    instagram: "",
    linkedin: "",
    twitter: "",
    youtube: "",
    whatsapp: "",
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<"success" | "error" | null>(null);
  const [submitMessage, setSubmitMessage] = useState("");
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    const fetchContactInfo = async () => {
      try {
        const response = await fetch("/api/contact");
        if (response.ok) {
          const data = await response.json();
          setContactInfo(data);
        }
      } catch (error) {
        console.error("Error fetching contact info:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchContactInfo();
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus(null);
    setSubmitMessage("");

    const form = e.currentTarget;
    if (!form) {
      console.error("Form element not found");
      setIsSubmitting(false);
      return;
    }

    const formData = new FormData(form);
    const data = {
      name: formData.get("name") as string,
      email: formData.get("email") as string,
      phone: formData.get("phone") as string || undefined,
      subject: formData.get("subject") as string || undefined,
      message: formData.get("message") as string,
    };

    try {
      const response = await fetch("/api/contact-messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        setSubmitStatus("success");
        setSubmitMessage("Message sent successfully! We'll get back to you soon.");
        // Reset form safely using ref or currentTarget
        if (formRef.current) {
          formRef.current.reset();
        } else if (form) {
          form.reset();
        }
      } else {
        setSubmitStatus("error");
        const errorMsg = result.error || result.details || "Failed to send message. Please try again.";
        setSubmitMessage(errorMsg);
        console.error("Form submission error:", result);
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      setSubmitStatus("error");
      const errorMsg = error instanceof Error ? error.message : "Failed to send message. Please try again.";
      setSubmitMessage(errorMsg);
    } finally {
      setIsSubmitting(false);
      // Clear message after 5 seconds
      setTimeout(() => {
        setSubmitStatus(null);
        setSubmitMessage("");
      }, 5000);
    }
  };

  // Get addresses array, handle both old (string[]) and new (object[]) formats
  let addresses: AddressItem[] = [];
  if (contactInfo.addresses && Array.isArray(contactInfo.addresses) && contactInfo.addresses.length > 0) {
    // Check if it's old format (string[]) or new format (object[])
    const firstItem = contactInfo.addresses[0];
    if (typeof firstItem === 'string') {
      // Old format: convert to new format
      addresses = (contactInfo.addresses as string[]).map((addr: string) => ({ address: addr }));
    } else {
      // New format: array of objects
      addresses = contactInfo.addresses as AddressItem[];
    }
  } else if (contactInfo.address) {
    addresses = [{ address: contactInfo.address }];
  } else {
    addresses = [{ city: "Mumbai", address: "123 Event Street, Maharashtra 400001, India" }];
  }

  // Build contact methods from API data
  const contactMethods: ContactMethod[] = [
    {
      id: "phone",
      icon: "/icons/contact/phone.svg",
      label: "Phone",
      value: contactInfo.phone || "+91 98765 43210",
      link: contactInfo.phone ? `tel:${contactInfo.phone.replace(/\s/g, "")}` : "tel:+919876543210",
    },
    {
      id: "email",
      icon: "/icons/contact/email.svg",
      label: "Email",
      value: contactInfo.email || "info@hypehatchevents.com",
      link: contactInfo.email ? `mailto:${contactInfo.email}` : "mailto:info@hypehatchevents.com",
    },
    // Add address cards for each address
    ...addresses.map((addrItem, index) => {
      const fullAddress = addrItem.city && addrItem.address 
        ? `${addrItem.city}, ${addrItem.address}`
        : addrItem.address || addrItem.city || "";
      return {
        id: `address-${index}`,
        icon: "/icons/contact/address.svg",
        label: addresses.length > 1 ? `Address ${index + 1}` : "Address",
        value: fullAddress, // Full address for link
        city: addrItem.city || "",
        address: addrItem.address || "",
        link: fullAddress ? `https://maps.google.com/search?q=${encodeURIComponent(fullAddress)}` : "https://maps.google.com",
      };
    }),
    {
      id: "website",
      icon: "/icons/contact/website.svg",
      label: "Website",
      value: contactInfo.website ? contactInfo.website.replace(/^https?:\/\//, "") : "www.hypehatchevents.com",
      link: contactInfo.website || "https://hypehatchevents.com",
    },
  ].filter((method) => {
    const m = method as ContactMethod;
    return m.value || m.city || m.address;
  }); // Only show methods with values

  return (
    <section
      ref={sectionRef}
      id="contact"
      className="relative py-12 md:py-16 lg:py-20 my-8 md:my-12 overflow-hidden bg-white shadow-md rounded-lg mx-4 md:mx-8 lg:mx-auto max-w-7xl"
      aria-label="Contact section"
    >
      {/* Communication Waves & Ripples - Reaching Out */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
        {/* Animated Ripple Waves */}
        {!prefersReducedMotion && [...Array(4)].map((_, i) => (
          <motion.div
            key={`ripple-${i}`}
            className="absolute rounded-full border-3 border-[#FA9616]"
            style={{
              left: `${25 + i * 15}%`,
              top: `${30 + i * 10}%`,
              width: `${150 + i * 50}px`,
              height: `${150 + i * 50}px`,
              transform: 'translate(-50%, -50%)',
              borderWidth: '3px',
            }}
            animate={{
              scale: [0.5, 2.2, 2.5],
              opacity: [0.4, 0.15, 0],
            }}
            transition={{
              duration: 3 + i * 0.5,
              repeat: Infinity,
              ease: "easeOut",
              delay: i * 0.8,
            }}
          />
        ))}

        {/* Communication Signal Lines */}
        <svg className="w-full h-full absolute inset-0" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 800">
          {[...Array(6)].map((_, i) => (
            <motion.path
              key={`signal-${i}`}
              d={`M ${100 + i * 200} ${100 + (i % 2) * 200} Q ${300 + i * 150} ${150 + (i % 2) * 150}, ${500 + i * 200} ${200 + (i % 2) * 200}`}
              fill="none"
              stroke="rgba(250, 150, 22, 0.3)"
              strokeWidth="3"
              strokeDasharray="8,4"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={isInView && !prefersReducedMotion ? {
                pathLength: [0, 1, 0],
                opacity: [0, 0.6, 0],
              } : { pathLength: 0, opacity: 0 }}
              transition={{
                pathLength: { duration: 2.5 + i * 0.3, repeat: Infinity, ease: "easeInOut" },
                opacity: { duration: 2 + i * 0.2, repeat: Infinity, ease: "easeInOut" },
                delay: i * 0.4,
              }}
            />
          ))}
        </svg>

        {/* Floating Communication Icons */}
        {!prefersReducedMotion && [...Array(5)].map((_, i) => (
          <motion.div
            key={`comm-icon-${i}`}
            className="absolute w-5 h-5 rounded-full bg-[#FA9616]"
            style={{
              left: `${15 + i * 18}%`,
              top: `${20 + (i % 2) * 40}%`,
            }}
            animate={{
              y: [0, -30, 0],
              x: [0, 25, 0],
              scale: [1, 1.8, 1],
              opacity: [0.3, 0.55, 0.3],
            }}
            transition={{
              duration: 3 + i * 0.4,
              repeat: Infinity,
              ease: "easeInOut",
              delay: i * 0.5,
            }}
          />
        ))}
      </div>

      {/* Gradient Mesh Background */}
      <div
        className="absolute inset-0 pointer-events-none opacity-20"
        style={{
          background: `
            radial-gradient(at 20% 30%, rgba(250, 150, 22, 0.1) 0px, transparent 50%),
            radial-gradient(at 80% 70%, rgba(250, 150, 22, 0.08) 0px, transparent 50%),
            radial-gradient(at 50% 50%, rgba(250, 150, 22, 0.05) 0px, transparent 50%)
          `,
        }}
        aria-hidden="true"
      />

      <div className="relative z-10 max-w-7xl mx-auto px-8 md:px-16 lg:px-20">
        {/* Creative Header */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: -30 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        >
          <SectionSeparator
            title="LET'S CONNECT"
            tagline="Ready to bring your vision to life? Get in touch and let's create something amazing together."
          />
        </motion.div>

        {/* Creative Split Layout: Contact Cards on Left, Form on Right */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8 items-center">
          {/* Left Side: Animated Contact Cards */}
          <motion.div
            className="space-y-2 md:space-y-3"
            initial={{ opacity: 0, x: -50 }}
            animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -50 }}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            {contactMethods.map((method, index) => (
              <motion.a
                key={method.id}
                href={method.link}
                target={method.link.startsWith("http") ? "_blank" : undefined}
                rel={method.link.startsWith("http") ? "noopener noreferrer" : undefined}
                className="block group relative"
                onMouseEnter={() => setHoveredCard(method.id)}
                onMouseLeave={() => setHoveredCard(null)}
                initial={{ opacity: 0, x: -30 }}
                animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -30 }}
                transition={{
                  duration: 0.6,
                  delay: 0.4 + index * 0.1,
                  ease: [0.16, 1, 0.3, 1],
                }}
                whileHover={
                  prefersReducedMotion
                    ? {}
                    : {
                        x: 10,
                        transition: { duration: 0.3 },
                      }
                }
              >
                <div className="relative bg-white rounded-xl p-3 md:p-4 shadow-lg border-2 border-gray-100 overflow-hidden group-hover:border-[#FA9616] transition-all duration-500">
                  {/* Animated Background Gradient */}
                  <motion.div
                    className="absolute inset-0 opacity-0 group-hover:opacity-100"
                    style={{
                      background: `linear-gradient(135deg, ${hoveredCard === method.id ? "#FA9616" : "transparent"}15 0%, transparent 100%)`,
                    }}
                    transition={{ duration: 0.3 }}
                  />

                  {/* Animated Icon Container */}
                  <div className="relative flex items-center gap-3 md:gap-4">
                    <motion.div
                      className="relative flex-shrink-0"
                      animate={
                        prefersReducedMotion
                          ? {}
                          : hoveredCard === method.id
                            ? {
                                rotate: [0, -10, 10, -10, 0],
                                scale: [1, 1.15, 1.1, 1.15, 1],
                              }
                            : {
                                y: [0, -5, 0],
                              }
                      }
                      transition={{
                        duration: hoveredCard === method.id ? 0.6 : 3,
                        repeat: hoveredCard === method.id ? 0 : Infinity,
                        ease: "easeInOut",
                      }}
                    >
                      <div
                        className="w-12 h-12 md:w-14 md:h-14 rounded-lg flex items-center justify-center relative"
                        style={{
                          background: `linear-gradient(135deg, #FA9616 0%, #FFB84D 100%)`,
                          boxShadow: hoveredCard === method.id ? "0 10px 30px rgba(250, 150, 22, 0.4)" : "0 4px 15px rgba(250, 150, 22, 0.2)",
                        }}
                      >
                        <img
                          src={method.icon}
                          alt={method.label}
                          width={28}
                          height={28}
                          className="w-7 h-7 md:w-8 md:h-8 object-contain filter brightness-0 invert"
                          style={{ display: 'block' }}
                        />
                        {/* Pulsing Ring Effect */}
                        {hoveredCard === method.id && !prefersReducedMotion && (
                          <motion.div
                            className="absolute inset-0 rounded-2xl border-2 border-[#FA9616]"
                            initial={{ scale: 1, opacity: 0.8 }}
                            animate={{ scale: 1.5, opacity: 0 }}
                            transition={{ duration: 1, repeat: Infinity }}
                          />
                        )}
                      </div>
                    </motion.div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <h3 className="text-xs font-heading font-bold text-[#FA9616] uppercase tracking-wide mb-0.5">
                        {method.label}
                      </h3>
                      {/* For addresses, show city in bold on top, then address below */}
                      {method.city || method.address ? (
                        <div>
                          {method.city && (
                            <p className="text-xs md:text-sm font-body font-bold text-ink mb-1 break-words">
                              {method.city}
                            </p>
                          )}
                          {method.address && (
                            <p className="text-xs md:text-sm font-body text-ink leading-tight break-words">
                              {method.address}
                            </p>
                          )}
                        </div>
                      ) : (
                        <p className="text-xs md:text-sm font-body text-ink leading-tight break-words">
                          {method.value}
                        </p>
                      )}
                    </div>

                    {/* Animated Arrow */}
                    <motion.div
                      className="flex-shrink-0 text-[#FA9616]"
                      animate={
                        prefersReducedMotion
                          ? {}
                          : hoveredCard === method.id
                            ? { x: [0, 5, 0] }
                            : {}
                      }
                      transition={{ duration: 0.6, repeat: hoveredCard === method.id ? Infinity : 0 }}
                    >
                      <svg
                        className="w-6 h-6"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M13 7l5 5m0 0l-5 5m5-5H6"
                        />
                      </svg>
                    </motion.div>
                  </div>
                </div>
              </motion.a>
            ))}
          </motion.div>

          {/* Right Side: Creative Contact Form */}
          <motion.div
            className="relative"
            initial={{ opacity: 0, x: 50 }}
            animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: 50 }}
            transition={{ duration: 0.8, delay: 0.5 }}
          >
            <div className="relative bg-white rounded-xl p-4 md:p-5 shadow-2xl border border-gray-100">
              {/* Decorative Corner Elements */}
              <div className="absolute top-0 left-0 w-10 h-10 border-t-2 border-l-2 border-[#FA9616] rounded-tl-xl opacity-20" />
              <div className="absolute bottom-0 right-0 w-10 h-10 border-b-2 border-r-2 border-[#FA9616] rounded-br-xl opacity-20" />

              <h3 className="text-base md:text-lg font-heading font-bold text-ink mb-3 text-center">
                Send Us a Message
              </h3>

              <form ref={formRef} className="space-y-2.5 md:space-y-3" aria-label="Contact form" onSubmit={handleSubmit}>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                  transition={{ duration: 0.5, delay: 0.6 }}
                >
                  <label
                    htmlFor="name"
                    className="block text-ink font-body font-semibold mb-1 text-xs"
                  >
                    Name <span className="text-[#FA9616]">*</span>
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    required
                    className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FA9616] focus:border-[#FA9616] transition-all duration-300 font-body text-xs md:text-sm text-ink bg-white hover:border-[#FA9616]/50"
                    aria-required="true"
                  />
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                  transition={{ duration: 0.5, delay: 0.7 }}
                >
                  <label
                    htmlFor="email"
                    className="block text-ink font-body font-semibold mb-1 text-xs"
                  >
                    Email <span className="text-[#FA9616]">*</span>
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    required
                    className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FA9616] focus:border-[#FA9616] transition-all duration-300 font-body text-xs md:text-sm text-ink bg-white hover:border-[#FA9616]/50"
                    aria-required="true"
                  />
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                  transition={{ duration: 0.5, delay: 0.8 }}
                >
                  <label
                    htmlFor="phone"
                    className="block text-ink font-body font-semibold mb-1 text-xs"
                  >
                    Phone
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FA9616] focus:border-[#FA9616] transition-all duration-300 font-body text-xs md:text-sm text-ink bg-white hover:border-[#FA9616]/50"
                  />
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                  transition={{ duration: 0.5, delay: 0.9 }}
                >
                  <label
                    htmlFor="message"
                    className="block text-ink font-body font-semibold mb-1 text-xs"
                  >
                    Message <span className="text-[#FA9616]">*</span>
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    rows={2}
                    required
                    className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FA9616] focus:border-[#FA9616] transition-all duration-300 font-body text-xs md:text-sm text-ink bg-white resize-y hover:border-[#FA9616]/50"
                    aria-required="true"
                  />
                </motion.div>

                {/* Submit Status Message */}
                {submitStatus && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`p-3 rounded-lg text-xs font-body ${
                      submitStatus === "success"
                        ? "bg-green-50 text-green-700 border border-green-200"
                        : "bg-red-50 text-red-700 border border-red-200"
                    }`}
                  >
                    {submitMessage}
                  </motion.div>
                )}

                <motion.div
                  className="flex justify-center pt-0"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.5, delay: 1 }}
                >
                  <motion.button
                    type="submit"
                    disabled={isSubmitting}
                    className="relative px-6 py-2 bg-gradient-to-r from-[#FA9616] to-[#FFB84D] text-white rounded-full font-bold font-body text-xs md:text-sm overflow-hidden group disabled:opacity-50 disabled:cursor-not-allowed"
                    whileHover={
                      prefersReducedMotion || isSubmitting
                        ? {}
                        : {
                            scale: 1.05,
                            boxShadow: "0 15px 40px rgba(250, 150, 22, 0.5)",
                          }
                    }
                    whileTap={prefersReducedMotion || isSubmitting ? {} : { scale: 0.95 }}
                  >
                    <span className="relative z-10">
                      {isSubmitting ? "Sending..." : "Send Message"}
                    </span>
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-[#FFB84D] to-[#FA9616] opacity-0 group-hover:opacity-100"
                      transition={{ duration: 0.3 }}
                    />
                  </motion.button>
                </motion.div>
              </form>
            </div>
          </motion.div>
        </div>
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
