"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Reveal from "./Reveal";

interface ContactInfo {
  phone: string;
  email: string;
  address: string;
  website: string;
  facebook: string;
  instagram: string;
  linkedin: string;
  twitter: string;
  youtube: string;
  whatsapp: string;
}

export default function Footer() {
  const [contactInfo, setContactInfo] = useState<ContactInfo>({
    phone: "",
    email: "",
    address: "",
    website: "",
    facebook: "",
    instagram: "",
    linkedin: "",
    twitter: "",
    youtube: "",
    whatsapp: "",
  });

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
      }
    };

    fetchContactInfo();
  }, []);

  const navLinks = [
    { label: "About", href: "#about" },
    { label: "Services", href: "#services" },
    { label: "Portfolio", href: "#portfolio" },
    { label: "Contact", href: "#contact" },
  ];

  // Build social links from API data - always show main social icons
  const socialLinks = [
    {
      name: "Facebook",
      href: contactInfo.facebook || "#",
      iconPath: "/icons/social/facebook.svg",
    },
    {
      name: "Instagram",
      href: contactInfo.instagram || "#",
      iconPath: "/icons/social/instagram.svg",
    },
    {
      name: "LinkedIn",
      href: contactInfo.linkedin || "#",
      iconPath: "/icons/social/linkedin.svg",
    },
    {
      name: "X (Twitter)",
      href: contactInfo.twitter || "#",
      iconPath: "/icons/social/x-twitter.svg",
    },
    ...(contactInfo.youtube
      ? [
          {
            name: "YouTube",
            href: contactInfo.youtube,
            iconPath: "/icons/social/youtube.svg",
          },
        ]
      : []),
  ];

  return (
    <footer className="bg-[#1A1A1E] text-white py-6 md:py-8" aria-label="Site footer">
      <div className="max-w-container mx-auto px-8 md:px-16 lg:px-20">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 md:gap-6">
          {/* Left: Brand & Navigation */}
          <div className="flex flex-col md:flex-row items-center md:items-start gap-4 md:gap-8">
            {/* Brand */}
            <div className="text-center md:text-left">
              <h3 className="text-lg md:text-xl font-heading font-bold mb-1">
                Hypehatch Events
              </h3>
              <p className="text-xs text-gray-400 font-body">
                Experiential. Futuristic. Crafted.
              </p>
            </div>

            {/* Navigation Links */}
            <nav aria-label="Footer navigation" className="flex flex-wrap justify-center md:justify-start gap-4 md:gap-6">
              {navLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  className="text-xs md:text-sm text-gray-400 hover:text-[#FA9616] transition-colors font-body focus:outline-none focus:ring-2 focus:ring-[#FA9616] rounded"
                >
                  {link.label}
                </a>
              ))}
            </nav>
          </div>

          {/* Right: Social Media Icons */}
          <div className="flex items-center gap-3">
            {socialLinks.map((social, index) => (
              <motion.a
                key={social.name}
                href={social.href !== "#" ? social.href : undefined}
                onClick={(e) => {
                  if (social.href === "#") {
                    e.preventDefault();
                  }
                }}
                target={social.href !== "#" ? "_blank" : undefined}
                rel={social.href !== "#" ? "noopener noreferrer" : undefined}
                className="w-9 h-9 rounded-full bg-white/10 hover:bg-[#FA9616] flex items-center justify-center text-white transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-[#FA9616] focus:ring-offset-2 focus:ring-offset-[#1A1A1E]"
                aria-label={social.name}
                whileHover={{ scale: 1.1, rotate: 5 }}
                whileTap={{ scale: 0.95 }}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <img
                  src={social.iconPath}
                  alt={social.name}
                  className="w-5 h-5"
                  style={{ filter: 'brightness(0) invert(1)' }}
                />
              </motion.a>
            ))}
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-white/10 mt-4 md:mt-6 pt-4 text-center">
          <p className="text-xs text-gray-400 font-body">
            &copy; {new Date().getFullYear()} Hypehatch Events. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}

