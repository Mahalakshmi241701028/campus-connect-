import React from 'react';

/**
 * BrandLogo - Rajalakshmi Engineering College inspired visual branding for CampusConnect
 * Uses Purple (#581C87) & Gold (#D97706 / #F59E0B) with clean minimal typography.
 *
 * Variants:
 * - 'navbar': Compact logo with icon and 'CampusConnect' text
 * - 'login': Prominent display with college name and torch emblem
 * - 'icon': Just the emblem icon
 * - 'loading': Animated glowing emblem for loading screens
 */
export const BrandLogo = ({ variant = 'navbar', className = '', size = 'md' }) => {
  // SVG Icon Mark: Stylized Rajalakshmi "R" with academic torch flame
  const renderIconMark = (dimensions = 36) => (
    <svg
      width={dimensions}
      height={dimensions}
      viewBox="0 0 120 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="flex-shrink-0 transition-transform duration-300"
    >
      <defs>
        <linearGradient id="purpleCrest" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#6B21A8" />
          <stop offset="100%" stopColor="#4A044E" />
        </linearGradient>
        <linearGradient id="goldFlame" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#F59E0B" />
          <stop offset="50%" stopColor="#D97706" />
          <stop offset="100%" stopColor="#B45309" />
        </linearGradient>
      </defs>

      {/* Rounded Crest Shield */}
      <rect width="120" height="120" rx="26" fill="url(#purpleCrest)" />
      
      {/* Subtle Gold Outline */}
      <rect
        x="4"
        y="4"
        width="112"
        height="112"
        rx="22"
        fill="none"
        stroke="url(#goldFlame)"
        strokeWidth="2.5"
        strokeOpacity="0.5"
      />

      {/* Academic Torch Flame */}
      <path
        d="M 60 20 C 60 20, 69 32, 66 40 C 63 45, 60 48, 60 48 C 60 48, 57 45, 54 40 C 51 32, 60 20, 60 20 Z"
        fill="url(#goldFlame)"
      />
      <circle cx="60" cy="38" r="3" fill="#FEF3C7" />

      {/* Left Stem of "R" */}
      <path d="M 40 45 L 49 45 L 49 95 L 40 95 Z" fill="#FFFFFF" />

      {/* Loop of "R" */}
      <path
        d="M 48 45 L 68 45 C 77 45, 82 50, 82 58 C 82 66, 76 71, 67 71 L 48 71 Z M 49 53 L 49 63 L 66 63 C 71 63, 73 61, 73 58 C 73 55, 71 53, 66 53 Z"
        fill="#FFFFFF"
        fillRule="evenodd"
      />

      {/* Dynamic Gold Leg of "R" */}
      <path d="M 63 67 L 83 95 L 72 95 L 54 70 Z" fill="url(#goldFlame)" />

      {/* Torch Holder Base in Gold */}
      <path d="M 52 48 L 68 48 L 64 53 L 56 53 Z" fill="url(#goldFlame)" />
    </svg>
  );

  if (variant === 'icon') {
    const dim = size === 'sm' ? 28 : size === 'lg' ? 48 : size === 'xl' ? 64 : 36;
    return <div className={`inline-flex items-center justify-center ${className}`}>{renderIconMark(dim)}</div>;
  }

  if (variant === 'loading') {
    return (
      <div className={`flex flex-col items-center justify-center gap-3 ${className}`}>
        <div className="relative animate-pulse">
          {renderIconMark(60)}
          <div className="absolute inset-0 rounded-2xl bg-amber-400/20 blur-md animate-ping" />
        </div>
        <div className="text-center">
          <p className="text-sm font-bold tracking-tight text-purple-900">CampusConnect</p>
          <p className="text-[10px] text-amber-700 font-medium tracking-wide">Rajalakshmi Engineering College</p>
        </div>
      </div>
    );
  }

  if (variant === 'login') {
    return (
      <div className={`flex flex-col items-center text-center ${className}`}>
        <div className="mb-3.5 relative hover:scale-105 transition-transform duration-300">
          {renderIconMark(68)}
        </div>
        <div className="flex items-center gap-1.5 justify-center">
          <span className="text-2xl font-black tracking-tight text-purple-950">CampusConnect</span>
          <span className="w-2 h-2 rounded-full bg-amber-500 inline-block"></span>
        </div>
        <p className="text-xs font-semibold text-purple-800/80 mt-1 uppercase tracking-wider">
          Rajalakshmi Engineering College
        </p>
        <p className="text-[11px] text-slate-500">Thandalam, Chennai</p>
      </div>
    );
  }

  // Default navbar variant
  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      {renderIconMark(34)}
      <div className="flex flex-col">
        <div className="flex items-center gap-1 leading-none">
          <span className="text-base font-black tracking-tight text-purple-950">CampusConnect</span>
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 inline-block"></span>
        </div>
        <span className="text-[10px] font-semibold text-purple-800/80 tracking-wide leading-tight mt-0.5">
          REC Thandalam
        </span>
      </div>
    </div>
  );
};

export default BrandLogo;
