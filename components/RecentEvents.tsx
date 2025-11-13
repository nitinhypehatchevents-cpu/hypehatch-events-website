"use client";

import { useState, useEffect } from "react";
import Reveal from "./Reveal";
import Image from "next/image";
import { useReducedMotion } from "framer-motion";

interface EventImage {
  id: string;
  title: string;
  category: string;
  imageUrl: string;
  thumbnailUrl: string;
  createdAt: string;
}

export default function RecentEvents() {
  const [events, setEvents] = useState<EventImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const response = await fetch("/api/gallery?limit=6");
      if (response.ok) {
        const data = await response.json();
        setEvents(data.images || []);
      }
    } catch (err) {
      console.error("Error fetching events:", err);
    } finally {
      setLoading(false);
    }
  };

  // Return null early if no data to avoid blank section
  if (!loading && (error || events.length === 0)) {
    return null;
  }

  return (
    <section
      id="recent-events"
      className="py-20 md:py-24 lg:py-32 my-8 md:my-12 bg-white shadow-md rounded-lg mx-4 md:mx-8 lg:mx-auto max-w-7xl"
      aria-label="Recent events section"
    >
      <div className="max-w-container mx-auto px-8 md:px-16 lg:px-20">
        <div className="mt-12">
          {loading ? (
            <Reveal variant="fadeIn">
              <div className="text-center text-brandMuted font-body py-12">
                Loading events...
              </div>
            </Reveal>
          ) : (
            <div className="flex gap-6 overflow-x-auto snap-x snap-mandatory scrollbar-hide pb-4 -mx-8 px-8 md:-mx-16 md:px-16 lg:-mx-20 lg:px-20">
              {events.map((event, index) => (
                <Reveal
                  key={event.id}
                  variant="fadeScale"
                  delay={prefersReducedMotion ? 0 : index * 0.1}
                >
                  <div className="flex-shrink-0 w-[300px] md:w-[400px] snap-start">
                    <div className="card-interactive bg-white rounded-lg overflow-hidden border border-gray-100">
                      <div className="aspect-video relative">
                        <Image
                          src={event.thumbnailUrl}
                          alt={event.title}
                          fill
                          className="object-cover"
                          loading="lazy"
                          sizes="(max-width: 768px) 300px, 400px"
                        />
                      </div>
                      <div className="p-6">
                        <span className="text-xs uppercase tracking-wider text-brand font-heading font-medium">
                          {event.category}
                        </span>
                        <h3 className="text-xl font-heading font-semibold text-ink mt-2 mb-2">
                          {event.title}
                        </h3>
                        <p className="text-sm text-brandMuted font-body">
                          {new Date(event.createdAt).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })}
                        </p>
                      </div>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
