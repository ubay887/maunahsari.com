import { useEffect, useState } from 'react';

/**
 * useParallax Hook
 * Tracks scroll position and provides parallax transform values
 *
 * @param {number} speed - Parallax speed multiplier (0.1 to 1.0)
 * @returns {object} - { scrollY, parallaxY }
 */
export function useParallax(speed = 0.5) {
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };

    // Add scroll listener with passive flag for performance
    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const parallaxY = scrollY * speed;

  return { scrollY, parallaxY };
}

/**
 * useScrollAnimation Hook
 * Detects when elements enter viewport and adds animation classes
 *
 * @param {number} threshold - Intersection threshold (0 to 1)
 */
export function useScrollAnimation(threshold = 0.1) {
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animate-visible');
          }
        });
      },
      {
        threshold,
        rootMargin: '0px 0px -50px 0px' // Trigger slightly before visible
      }
    );

    // Observe all elements with .animate-on-scroll class
    const elements = document.querySelectorAll('.animate-on-scroll');
    elements.forEach(el => observer.observe(el));

    return () => {
      elements.forEach(el => observer.unobserve(el));
    };
  }, [threshold]);
}
