/**
 * IslamicPattern Component
 * Renders high-fidelity geometric and arabesque Islamic patterns as decorative backgrounds.
 * Usage: Place as a background layer with appropriate opacity.
 */
export default function IslamicPattern({
  className = "",
  variant = "star",
  opacity = 0.05
}) {
  if (variant === "star") {
    return (
      <svg
        className={`w-full h-full ${className}`}
        style={{ opacity }}
        viewBox="0 0 200 200"
        preserveAspectRatio="xMidYMid slice"
      >
        <defs>
          {/* Rub el Hizb (8-pointed star formed by 2 overlapping squares) */}
          <g id="rub-el-hizb">
            <rect x="-12" y="-12" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="0.8" />
            <rect x="-12" y="-12" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="0.8" transform="rotate(45)" />
            <circle cx="0" cy="0" r="8" fill="none" stroke="currentColor" strokeWidth="0.6" />
            <circle cx="0" cy="0" r="1.8" fill="currentColor" />
          </g>
          
          <pattern
            id="islamic-star-pattern"
            x="0"
            y="0"
            width="80"
            height="80"
            patternUnits="userSpaceOnUse"
          >
            {/* Fine Girih Grid Lines */}
            <g className="text-secondary/35">
              <line x1="0" y1="0" x2="80" y2="0" stroke="currentColor" strokeWidth="0.4" />
              <line x1="0" y1="40" x2="80" y2="40" stroke="currentColor" strokeWidth="0.4" />
              <line x1="0" y1="80" x2="80" y2="80" stroke="currentColor" strokeWidth="0.4" />
              <line x1="0" y1="0" x2="0" y2="80" stroke="currentColor" strokeWidth="0.4" />
              <line x1="40" y1="0" x2="40" y2="80" stroke="currentColor" strokeWidth="0.4" />
              <line x1="80" y1="0" x2="80" y2="80" stroke="currentColor" strokeWidth="0.4" />
              
              <line x1="0" y1="0" x2="80" y2="80" stroke="currentColor" strokeWidth="0.4" />
              <line x1="80" y1="0" x2="0" y2="80" stroke="currentColor" strokeWidth="0.4" />
              <line x1="40" y1="0" x2="0" y2="40" stroke="currentColor" strokeWidth="0.4" />
              <line x1="40" y1="0" x2="80" y2="40" stroke="currentColor" strokeWidth="0.4" />
              <line x1="0" y1="40" x2="40" y2="80" stroke="currentColor" strokeWidth="0.4" />
              <line x1="80" y1="40" x2="40" y2="80" stroke="currentColor" strokeWidth="0.4" />
            </g>

            {/* Placed Stars */}
            <g className="text-secondary">
              <use href="#rub-el-hizb" x="40" y="40" />
              <use href="#rub-el-hizb" x="0" y="0" />
              <use href="#rub-el-hizb" x="80" y="0" />
              <use href="#rub-el-hizb" x="0" y="80" />
              <use href="#rub-el-hizb" x="80" y="80" />
              <use href="#rub-el-hizb" x="40" y="0" />
              <use href="#rub-el-hizb" x="0" y="40" />
              <use href="#rub-el-hizb" x="80" y="40" />
              <use href="#rub-el-hizb" x="40" y="80" />
            </g>
          </pattern>
        </defs>
        <rect width="200" height="200" fill="url(#islamic-star-pattern)" />
      </svg>
    );
  }

  if (variant === "sparse-star") {
    return (
      <svg
        className={`w-full h-full ${className}`}
        style={{ opacity }}
        viewBox="0 0 200 200"
        preserveAspectRatio="xMidYMid slice"
      >
        <defs>
          <g id="rub-el-hizb-sparse">
            <rect x="-16" y="-16" width="32" height="32" fill="none" stroke="currentColor" strokeWidth="0.4" />
            <rect x="-16" y="-16" width="32" height="32" fill="none" stroke="currentColor" strokeWidth="0.4" transform="rotate(45)" />
            <circle cx="0" cy="0" r="10" fill="none" stroke="currentColor" strokeWidth="0.3" strokeDasharray="1 2" />
            <circle cx="0" cy="0" r="2" fill="currentColor" />
          </g>
          
          <pattern
            id="islamic-sparse-star-pattern"
            x="0"
            y="0"
            width="200"
            height="200"
            patternUnits="userSpaceOnUse"
          >
            {/* Very faint connecting lines */}
            <g className="text-secondary/15">
              <line x1="0" y1="100" x2="200" y2="100" stroke="currentColor" strokeWidth="0.3" strokeDasharray="2 4" />
              <line x1="100" y1="0" x2="100" y2="200" stroke="currentColor" strokeWidth="0.3" strokeDasharray="2 4" />
              <line x1="0" y1="0" x2="200" y2="200" stroke="currentColor" strokeWidth="0.3" strokeDasharray="2 4" />
              <line x1="200" y1="0" x2="0" y2="200" stroke="currentColor" strokeWidth="0.3" strokeDasharray="2 4" />
            </g>
            
            {/* Sparse Stars */}
            <g className="text-secondary/60">
              <use href="#rub-el-hizb-sparse" x="100" y="100" />
              <use href="#rub-el-hizb-sparse" x="0" y="0" />
              <use href="#rub-el-hizb-sparse" x="200" y="0" />
              <use href="#rub-el-hizb-sparse" x="0" y="200" />
              <use href="#rub-el-hizb-sparse" x="200" y="200" />
            </g>
          </pattern>
        </defs>
        <rect width="200" height="200" fill="url(#islamic-sparse-star-pattern)" />
      </svg>
    );
  }

  if (variant === "geometric") {
    return (
      <svg
        className={`w-full h-full ${className}`}
        style={{ opacity }}
        viewBox="0 0 200 200"
        preserveAspectRatio="xMidYMid slice"
      >
        <defs>
          {/* Regular Octagon (Muthamman) */}
          <g id="islamic-octagon">
            <polygon
              points="8.285,-20 20,-8.285 20,8.285 8.285,20 -8.285,20 -20,8.285 -20,-8.285 -8.285,-20"
              fill="none"
              stroke="currentColor"
              strokeWidth="0.8"
            />
            {/* Inner octagon */}
            <polygon
              points="4.971,-12 12,-4.971 12,4.971 4.971,12 -4.971,12 -12,4.971 -12,-4.971 -4.971,-12"
              fill="none"
              stroke="currentColor"
              strokeWidth="0.5"
              opacity="0.8"
            />
            {/* Inner 8-pointed star */}
            <rect x="-6" y="-6" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="0.6" />
            <rect x="-6" y="-6" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="0.6" transform="rotate(45)" />
            <circle cx="0" cy="0" r="2.5" fill="none" stroke="currentColor" strokeWidth="0.5" />
          </g>

          {/* Diamond gap fill */}
          <g id="islamic-diamond">
            <polygon
              points="0,-11.715 11.715,0 0,11.715 -11.715,0"
              fill="none"
              stroke="currentColor"
              strokeWidth="0.8"
            />
            <circle cx="0" cy="0" r="4" fill="none" stroke="currentColor" strokeWidth="0.5" />
            <circle cx="0" cy="0" r="1.2" fill="currentColor" />
          </g>
          
          <pattern
            id="islamic-geometric-pattern"
            x="0"
            y="0"
            width="80"
            height="80"
            patternUnits="userSpaceOnUse"
          >
            {/* Octagons (Primary/Emerald themed) */}
            <g className="text-primary/70">
              <use href="#islamic-octagon" x="0" y="0" />
              <use href="#islamic-octagon" x="40" y="0" />
              <use href="#islamic-octagon" x="80" y="0" />
              <use href="#islamic-octagon" x="0" y="40" />
              <use href="#islamic-octagon" x="40" y="40" />
              <use href="#islamic-octagon" x="80" y="40" />
              <use href="#islamic-octagon" x="0" y="80" />
              <use href="#islamic-octagon" x="40" y="80" />
              <use href="#islamic-octagon" x="80" y="80" />
            </g>
            {/* Diamonds (Secondary/Gold themed) */}
            <g className="text-secondary/70">
              <use href="#islamic-diamond" x="20" y="20" />
              <use href="#islamic-diamond" x="60" y="20" />
              <use href="#islamic-diamond" x="20" y="60" />
              <use href="#islamic-diamond" x="60" y="60" />
            </g>
          </pattern>
        </defs>
        <rect width="200" height="200" fill="url(#islamic-geometric-pattern)" />
      </svg>
    );
  }

  if (variant === "arabesque") {
    return (
      <svg
        className={`w-full h-full ${className}`}
        style={{ opacity }}
        viewBox="0 0 200 200"
        preserveAspectRatio="xMidYMid slice"
      >
        <defs>
          {/* Quadrant for Symmetrical Arabesque Tiling */}
          <g id="arabesque-quadrant">
            {/* Main vine */}
            <path
              d="M 0 -60 C -25 -45, -45 -25, -60 0"
              fill="none"
              stroke="currentColor"
              strokeWidth="0.8"
            />
            {/* Inner curling vine */}
            <path
              d="M -25 -25 C -15 -10, -5 -15, -10 -30 C -12 -38, -25 -35, -20 -25"
              fill="none"
              stroke="currentColor"
              strokeWidth="0.5"
            />
            {/* Leaves */}
            <path
              d="M -40 -20 C -45 -25, -40 -35, -30 -30 C -35 -20, -38 -20, -40 -20 Z"
              fill="currentColor"
              className="text-secondary/70"
              stroke="none"
            />
            <path
              d="M -20 -40 C -25 -45, -35 -40, -30 -30 C -20 -35, -20 -38, -20 -40 Z"
              fill="currentColor"
              className="text-secondary/70"
              stroke="none"
            />
            {/* Tiny Flower Bud */}
            <path
              d="M -12 -12 C -8 -8, -5 -15, -8 -18 C -11 -21, -18 -18, -12 -12 Z"
              fill="currentColor"
              className="text-primary/70"
              stroke="none"
            />
            {/* Micro rays */}
            <line x1="0" y1="0" x2="-12" y2="-12" stroke="currentColor" strokeWidth="0.4" strokeDasharray="1 1" />
          </g>
          
          <pattern
            id="islamic-arabesque-pattern"
            x="0"
            y="0"
            width="120"
            height="120"
            patternUnits="userSpaceOnUse"
          >
            <g transform="translate(60, 60)">
              {/* Central Rosette */}
              <g className="text-secondary">
                <circle cx="0" cy="0" r="10" fill="none" stroke="currentColor" strokeWidth="1" />
                <circle cx="0" cy="0" r="6" fill="none" stroke="currentColor" strokeWidth="0.6" strokeDasharray="1 1" />
                {Array.from({ length: 8 }).map((_, i) => (
                  <circle
                    key={i}
                    cx={7 * Math.cos((i * 45 * Math.PI) / 180)}
                    cy={7 * Math.sin((i * 45 * Math.PI) / 180)}
                    r="1.5"
                    fill="currentColor"
                    stroke="none"
                  />
                ))}
                <circle cx="0" cy="0" r="2.5" fill="currentColor" />
              </g>

              {/* 4 Quadrants Mirrored for Seamless Flow */}
              <g className="text-primary">
                {/* Top Left */}
                <use href="#arabesque-quadrant" />
                
                {/* Top Right */}
                <g transform="scale(-1, 1)">
                  <use href="#arabesque-quadrant" />
                </g>
                
                {/* Bottom Left */}
                <g transform="scale(1, -1)">
                  <use href="#arabesque-quadrant" />
                </g>
                
                {/* Bottom Right */}
                <g transform="scale(-1, -1)">
                  <use href="#arabesque-quadrant" />
                </g>
              </g>
            </g>
          </pattern>
        </defs>
        <rect width="200" height="200" fill="url(#islamic-arabesque-pattern)" />
      </svg>
    );
  }

  return null;
}

/**
 * IslamicRosette Component
 * Detailed standalone circular ornament (mandala/rosette) for watermarks and focal points.
 */
export function IslamicRosette({
  className = "",
  size = "md",
  opacity = 1
}) {
  const sizeClasses = {
    sm: "w-24 h-24",
    md: "w-48 h-48",
    lg: "w-72 h-72",
    xl: "w-96 h-96",
    full: "w-full h-full"
  };

  const currentSizeClass = sizeClasses[size] || size;

  return (
    <svg
      className={`${currentSizeClass} ${className}`}
      style={{ opacity }}
      viewBox="0 0 200 200"
      fill="none"
      stroke="currentColor"
    >
      <g transform="translate(100, 100)">
        {/* Outer Ring */}
        <circle cx="0" cy="0" r="95" strokeWidth="1" strokeDasharray="4 2" />
        <circle cx="0" cy="0" r="91" strokeWidth="0.5" />
        
        {/* Radiating Rays */}
        {Array.from({ length: 16 }).map((_, i) => (
          <line
            key={i}
            x1="0"
            y1="0"
            x2={91 * Math.cos((i * 22.5 * Math.PI) / 180)}
            y2={91 * Math.sin((i * 22.5 * Math.PI) / 180)}
            strokeWidth="0.4"
            strokeDasharray="2 3"
            opacity="0.5"
          />
        ))}

        {/* 16 Outer Dots */}
        {Array.from({ length: 16 }).map((_, i) => (
          <circle
            key={i}
            cx={95 * Math.cos((i * 22.5 * Math.PI) / 180)}
            cy={95 * Math.sin((i * 22.5 * Math.PI) / 180)}
            r="1.5"
            fill="currentColor"
            stroke="none"
          />
        ))}

        {/* 16-pointed Star Core (Four overlapping squares rotated 0, 22.5, 45, 67.5 degrees) */}
        <g strokeWidth="0.8">
          <rect x="-65" y="-65" width="130" height="130" transform="rotate(0)" />
          <rect x="-65" y="-65" width="130" height="130" transform="rotate(22.5)" />
          <rect x="-65" y="-65" width="130" height="130" transform="rotate(45)" />
          <rect x="-65" y="-65" width="130" height="130" transform="rotate(67.5)" />
        </g>

        {/* Inner concentric ring */}
        <circle cx="0" cy="0" r="50" strokeWidth="0.8" />
        <circle cx="0" cy="0" r="46" strokeWidth="0.5" strokeDasharray="1 2" />

        {/* Inner 8-pointed star */}
        <g strokeWidth="0.8" opacity="0.9">
          <rect x="-30" y="-30" width="60" height="60" transform="rotate(11.25)" />
          <rect x="-30" y="-30" width="60" height="60" transform="rotate(56.25)" />
        </g>

        {/* Central Core */}
        <circle cx="0" cy="0" r="15" strokeWidth="0.8" fill="none" />
        <circle cx="0" cy="0" r="10" strokeWidth="0.5" strokeDasharray="1 1" />
        <circle cx="0" cy="0" r="4" fill="currentColor" stroke="none" />
      </g>
    </svg>
  );
}

/**
 * OrnamentalCorner Component
 * Decorative SVG corner ornaments for cards and sections.
 */
export function OrnamentalCorner({
  position = "top-left",
  className = "",
  size = "md"
}) {
  const sizeClasses = {
    sm: "w-8 h-8",
    md: "w-12 h-12",
    lg: "w-16 h-16"
  };

  const rotations = {
    "top-left": "none",
    "top-right": "rotate(90deg)",
    "bottom-right": "rotate(180deg)",
    "bottom-left": "rotate(-90deg)"
  };

  const positionClasses = {
    "top-left": "top-0 left-0",
    "top-right": "top-0 right-0",
    "bottom-left": "bottom-0 left-0",
    "bottom-right": "bottom-0 right-0"
  };

  return (
    <svg
      className={`absolute ${positionClasses[position]} ${sizeClasses[size]} text-secondary/40 pointer-events-none ${className}`}
      style={{ transform: rotations[position], transformOrigin: 'center', margin: 0 }}
      viewBox="0 0 48 48"
      fill="none"
      stroke="currentColor"
    >
      {/* Ornate corner border */}
      <path
        d="M 2 48 L 2 12 C 2 6, 6 2, 12 2 L 48 2"
        strokeWidth="1.5"
      />
      {/* Inner decorative dashed line */}
      <path
        d="M 8 48 L 8 20 C 8 14, 14 8, 20 8 L 48 8"
        strokeWidth="0.8"
        strokeDasharray="1 2"
      />
      {/* Corner leaf motif */}
      <path
        d="M 2 2 C 8 8, 14 14, 16 16 C 14 18, 12 18, 10 16 Z"
        fill="currentColor"
        stroke="none"
      />
      <path
        d="M 20 2 C 16 6, 12 10, 10 12"
        strokeWidth="1"
      />
      <path
        d="M 2 20 C 6 16, 10 12, 12 10"
        strokeWidth="1"
      />
      <circle cx="24" cy="4" r="1.5" fill="currentColor" stroke="none" />
      <circle cx="4" cy="24" r="1.5" fill="currentColor" stroke="none" />
    </svg>
  );
}

/**
 * SectionDivider Component
 * Ornamental divider between major sections.
 */
export function SectionDivider({
  className = "",
  variant = "default"
}) {
  if (variant === "ornamental") {
    return (
      <div className={`flex items-center gap-4 py-8 ${className}`}>
        <div className="h-px flex-1 bg-gradient-to-r from-transparent via-secondary/50 to-transparent"></div>
        <div className="text-secondary shrink-0">
          <svg className="w-48 h-8" viewBox="0 0 192 32" fill="none" stroke="currentColor">
            {/* Central Rosette Star */}
            <g transform="translate(96, 16)">
              <rect x="-8" y="-8" width="16" height="16" strokeWidth="1.2" transform="rotate(0)" />
              <rect x="-8" y="-8" width="16" height="16" strokeWidth="1.2" transform="rotate(45)" />
              <circle cx="0" cy="0" r="4" fill="currentColor" />
              <circle cx="0" cy="-12" r="1.5" fill="currentColor" stroke="none" />
              <circle cx="0" cy="12" r="1.5" fill="currentColor" stroke="none" />
              <circle cx="-12" cy="0" r="1.5" fill="currentColor" stroke="none" />
              <circle cx="12" cy="0" r="1.5" fill="currentColor" stroke="none" />
            </g>
            {/* Left Wing (Symmetrical Curving Vines) */}
            <path
              d="M80 16 C 70 16, 65 10, 55 10 C 45 10, 40 22, 30 22 C 20 22, 15 16, 0 16"
              strokeWidth="1"
            />
            {/* Left Wing Leaf */}
            <path
              d="M50 12 C 48 8, 42 8, 40 12 C 42 16, 48 16, 50 12 Z"
              fill="currentColor"
              stroke="none"
              opacity="0.8"
            />
            <circle cx="30" cy="22" r="2" fill="currentColor" stroke="none" />
            
            {/* Right Wing (Mirrored Symmetrical Curving Vines) */}
            <path
              d="M112 16 C 122 16, 127 10, 137 10 C 147 10, 152 22, 162 22 C 172 22, 177 16, 192 16"
              strokeWidth="1"
            />
            {/* Right Wing Leaf */}
            <path
              d="M142 12 C 144 8, 150 8, 152 12 C 150 16, 144 16, 142 12 Z"
              fill="currentColor"
              stroke="none"
              opacity="0.8"
            />
            <circle cx="162" cy="22" r="2" fill="currentColor" stroke="none" />
          </svg>
        </div>
        <div className="h-px flex-1 bg-gradient-to-r from-transparent via-secondary/50 to-transparent"></div>
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-4 py-6 ${className}`}>
      <div className="h-px flex-1 bg-gradient-to-r from-transparent via-primary/20 to-transparent"></div>
    </div>
  );
}
