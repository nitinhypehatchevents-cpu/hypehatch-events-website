"use client";

import { useEffect } from "react";

/**
 * ScrollRestoration component
 * Ensures the page always starts at the top on reload/refresh
 * Unless there's a hash in the URL (for direct section links)
 */
export default function ScrollRestoration() {
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Check if there's a hash in the URL
    const hash = window.location.hash;
    
    if (hash) {
      // If there's a hash, scroll to that section after a short delay
      // This allows the page to render first
      const targetId = hash.replace('#', '');
      setTimeout(() => {
        const targetElement = document.getElementById(targetId);
        if (targetElement) {
          const offsetTop = targetElement.offsetTop - 80; // Account for sticky navbar
          window.scrollTo({
            top: offsetTop,
            behavior: 'smooth',
          });
        }
      }, 100);
    } else {
      // No hash - scroll to top immediately
      window.scrollTo(0, 0);
      
      // Also scroll to top after page load completes
      if (document.readyState === 'complete') {
        window.scrollTo(0, 0);
      } else {
        window.addEventListener('load', () => {
          window.scrollTo(0, 0);
        });
      }
    }

    // Disable browser's automatic scroll restoration
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }
  }, []);

  // Handle route changes (Next.js navigation)
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleRouteChange = () => {
      const hash = window.location.hash;
      
      if (hash) {
        // Wait for page to render, then scroll to hash
        setTimeout(() => {
          const targetId = hash.replace('#', '');
          const targetElement = document.getElementById(targetId);
          if (targetElement) {
            const offsetTop = targetElement.offsetTop - 80;
            window.scrollTo({
              top: offsetTop,
              behavior: 'smooth',
            });
          }
        }, 100);
      } else {
        // No hash - scroll to top
        window.scrollTo(0, 0);
      }
    };

    // Listen for popstate (back/forward navigation)
    window.addEventListener('popstate', handleRouteChange);
    
    // Also check on mount
    handleRouteChange();

    return () => {
      window.removeEventListener('popstate', handleRouteChange);
    };
  }, []);

  return null;
}


