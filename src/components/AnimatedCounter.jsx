import { useEffect, useState, useRef } from 'react';

/**
 * AnimatedCounter Component
 * Animates a number from 0 to target value when visible in viewport
 *
 * @param {number} end - Target number to count to
 * @param {number} duration - Animation duration in milliseconds (default: 2000)
 * @param {string} suffix - Text to append after number (e.g., "+", "%")
 * @param {string} prefix - Text to prepend before number (e.g., "$", "Rp")
 * @param {boolean} separator - Add thousand separators (default: true)
 */
export default function AnimatedCounter({
  end,
  duration = 2000,
  suffix = "",
  prefix = "",
  separator = true,
  className = ""
}) {
  const [count, setCount] = useState(0);
  const [hasAnimated, setHasAnimated] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !hasAnimated) {
          setHasAnimated(true);

          let start = 0;
          const increment = end / (duration / 16); // 60fps

          const timer = setInterval(() => {
            start += increment;

            if (start >= end) {
              setCount(end);
              clearInterval(timer);
            } else {
              setCount(Math.floor(start));
            }
          }, 16);

          return () => clearInterval(timer);
        }
      },
      { threshold: 0.3 } // Trigger when 30% visible
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => {
      if (ref.current) {
        observer.unobserve(ref.current);
      }
    };
  }, [end, duration, hasAnimated]);

  // Format number with thousand separators
  const formatNumber = (num) => {
    if (!separator) return num.toString();
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  };

  return (
    <span ref={ref} className={className}>
      {prefix}{formatNumber(count)}{suffix}
    </span>
  );
}

/**
 * StatCard Component
 * Displays an animated statistic with label
 * Combines AnimatedCounter with styled card layout
 */
export function StatCard({
  value,
  label,
  suffix = "",
  prefix = "",
  icon: Icon,
  variant = "primary"
}) {
  const colorClasses = {
    primary: "text-primary bg-primary/5",
    secondary: "text-secondary bg-secondary/5",
    accent: "text-accent bg-accent/5"
  };

  return (
    <div className="text-center space-y-2 animate-fade-in-up">
      {Icon && (
        <div className={`inline-flex p-3 rounded-xl ${colorClasses[variant]} mb-2`}>
          <Icon className="icon-md" />
        </div>
      )}
      <div className="font-display text-4xl md:text-5xl font-bold text-primary">
        <AnimatedCounter
          end={value}
          suffix={suffix}
          prefix={prefix}
          duration={2500}
        />
      </div>
      <span className="block text-xs text-text-muted uppercase font-semibold tracking-wider">
        {label}
      </span>
    </div>
  );
}
