"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Reveal from "./Reveal";
import { useReducedMotion } from "framer-motion";

interface GalleryImage {
  id: string;
  title: string;
  category: string;
  imageUrl: string;
  thumbnailUrl: string;
  createdAt: string;
}

export default function GalleryGrid() {
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    fetchGallery();
  }, []);

  const fetchGallery = async () => {
    try {
      const response = await fetch("/api/gallery?limit=12");
      if (response.ok) {
        const data = await response.json();
        setImages(data.images || []);
      }
    } catch (err) {
      console.error("Error fetching gallery:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <section
        id="gallery"
        className="py-20 md:py-24 lg:py-32 my-8 md:my-12 bg-white shadow-md rounded-lg mx-4 md:mx-8 lg:mx-auto max-w-7xl"
        aria-label="Gallery section"
      >
        <div className="max-w-container mx-auto px-8 md:px-16 lg:px-20">
          <Reveal variant="fadeIn">
            <div className="text-center text-brandMuted font-body">
              Loading gallery...
            </div>
          </Reveal>
        </div>
      </section>
    );
  }

  if (error || images.length === 0) {
    return null;
  }

  return (
    <section
      id="gallery"
      className="py-20 md:py-24 lg:py-32 my-8 md:my-12 bg-white shadow-md rounded-lg mx-4 md:mx-8 lg:mx-auto max-w-7xl"
      aria-label="Gallery section"
    >
      <div className="max-w-container mx-auto px-8 md:px-16 lg:px-20">
        <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-4 md:gap-6">
          {images.map((image, index) => (
            <Reveal
              key={image.id}
              variant="fadeScale"
              delay={prefersReducedMotion ? 0 : index * 0.05}
            >
              <div className="mb-4 md:mb-6 break-inside-avoid">
                <div className="card-interactive bg-white rounded-lg overflow-hidden aspect-[4/3] relative group">
                  <Image
                    src={image.thumbnailUrl}
                    alt={image.title}
                    fill
                    className="object-cover"
                    loading="lazy"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-ink/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                    <div>
                      <p className="text-white text-sm font-heading font-medium">
                        {image.title}
                      </p>
                      <p className="text-white/80 text-xs font-body">
                        {image.category}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
