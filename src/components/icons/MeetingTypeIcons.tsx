import React from 'react';

interface IconProps {
  size?: number;
  className?: string;
}

// Coffee Icon
export const CoffeeIcon: React.FC<IconProps> = ({ size = 48, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <defs>
      <linearGradient id="coffeeGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#8B4513" />
        <stop offset="100%" stopColor="#5D3A1A" />
      </linearGradient>
      <linearGradient id="coffeeGrad2" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#F5F5DC" />
        <stop offset="100%" stopColor="#E8E8D0" />
      </linearGradient>
      <filter id="coffeeShadow" x="-20%" y="-20%" width="140%" height="140%">
        <feDropShadow dx="0" dy="2" stdDeviation="2" floodColor="#5D3A1A" floodOpacity="0.4" />
      </filter>
    </defs>
    
    <g filter="url(#coffeeShadow)">
      {/* Saucer */}
      <ellipse cx="22" cy="42" rx="16" ry="4" fill="url(#coffeeGrad2)" />
      <ellipse cx="22" cy="40" rx="14" ry="3" fill="#D4D4C4" />
      
      {/* Cup */}
      <path d="M8 20 L10 38 L34 38 L36 20 Z" fill="url(#coffeeGrad2)" />
      <ellipse cx="22" cy="20" rx="14" ry="4" fill="#E8E8D0" />
      
      {/* Coffee liquid */}
      <ellipse cx="22" cy="22" rx="11" ry="3" fill="url(#coffeeGrad1)" />
      
      {/* Handle */}
      <path d="M36 24 Q44 24 44 30 Q44 36 36 36" stroke="url(#coffeeGrad2)" strokeWidth="4" fill="none" />
      
      {/* Steam */}
      <path d="M16 14 Q18 10 16 6" stroke="#888" strokeWidth="1.5" strokeLinecap="round" fill="none" opacity="0.5">
        <animate attributeName="d" values="M16 14 Q18 10 16 6;M16 14 Q14 10 16 6;M16 14 Q18 10 16 6" dur="2s" repeatCount="indefinite" />
      </path>
      <path d="M22 12 Q24 8 22 4" stroke="#888" strokeWidth="1.5" strokeLinecap="round" fill="none" opacity="0.5">
        <animate attributeName="d" values="M22 12 Q24 8 22 4;M22 12 Q20 8 22 4;M22 12 Q24 8 22 4" dur="2.5s" repeatCount="indefinite" />
      </path>
      <path d="M28 14 Q30 10 28 6" stroke="#888" strokeWidth="1.5" strokeLinecap="round" fill="none" opacity="0.5">
        <animate attributeName="d" values="M28 14 Q30 10 28 6;M28 14 Q26 10 28 6;M28 14 Q30 10 28 6" dur="2.2s" repeatCount="indefinite" />
      </path>
    </g>
  </svg>
);

// Lunch/Dining Icon
export const LunchIcon: React.FC<IconProps> = ({ size = 48, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <defs>
      <linearGradient id="plateGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#E8E8E8" />
        <stop offset="100%" stopColor="#C0C0C0" />
      </linearGradient>
      <linearGradient id="utensilGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#C0C0C0" />
        <stop offset="100%" stopColor="#A0A0A0" />
      </linearGradient>
      <filter id="plateShadow" x="-20%" y="-20%" width="140%" height="140%">
        <feDropShadow dx="0" dy="2" stdDeviation="2" floodColor="#808080" floodOpacity="0.3" />
      </filter>
    </defs>
    
    <g filter="url(#plateShadow)">
      {/* Plate */}
      <ellipse cx="24" cy="32" rx="16" ry="8" fill="url(#plateGrad1)" />
      <ellipse cx="24" cy="30" rx="12" ry="5" fill="#F5F5F5" />
      <ellipse cx="24" cy="29" rx="8" ry="3" fill="#E8E8E8" />
      
      {/* Fork */}
      <g transform="translate(8, 6)">
        <rect x="0" y="12" width="2" height="18" rx="1" fill="url(#utensilGrad)" />
        <rect x="0" y="0" width="2" height="10" rx="0.5" fill="url(#utensilGrad)" />
        <rect x="4" y="0" width="2" height="10" rx="0.5" fill="url(#utensilGrad)" />
        <rect x="8" y="0" width="2" height="10" rx="0.5" fill="url(#utensilGrad)" />
        <rect x="0" y="10" width="10" height="4" rx="1" fill="url(#utensilGrad)" />
      </g>
      
      {/* Knife */}
      <g transform="translate(32, 6)">
        <rect x="2" y="12" width="2" height="18" rx="1" fill="url(#utensilGrad)" />
        <path d="M0 0 L6 0 L6 12 L0 12 Q2 6 0 0" fill="url(#utensilGrad)" />
      </g>
    </g>
  </svg>
);

// Movie Icon
export const MovieIcon: React.FC<IconProps> = ({ size = 48, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <defs>
      <linearGradient id="clapperGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#2D2D2D" />
        <stop offset="100%" stopColor="#1A1A1A" />
      </linearGradient>
      <linearGradient id="clapperGrad2" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#F5F5F5" />
        <stop offset="100%" stopColor="#E0E0E0" />
      </linearGradient>
      <filter id="clapperShadow" x="-20%" y="-20%" width="140%" height="140%">
        <feDropShadow dx="0" dy="2" stdDeviation="2" floodColor="#1A1A1A" floodOpacity="0.4" />
      </filter>
    </defs>
    
    <g filter="url(#clapperShadow)">
      {/* Bottom part */}
      <rect x="4" y="18" width="40" height="26" rx="2" fill="url(#clapperGrad1)" />
      
      {/* Top clapper */}
      <path d="M4 18 L8 6 L44 6 L40 18 Z" fill="url(#clapperGrad1)" />
      
      {/* White stripes on clapper */}
      <path d="M10 6 L8 18 L14 18 L16 6 Z" fill="url(#clapperGrad2)" />
      <path d="M22 6 L20 18 L26 18 L28 6 Z" fill="url(#clapperGrad2)" />
      <path d="M34 6 L32 18 L38 18 L40 6 Z" fill="url(#clapperGrad2)" />
      
      {/* Text lines */}
      <rect x="8" y="24" width="16" height="3" rx="1" fill="#444" />
      <rect x="8" y="30" width="24" height="2" rx="1" fill="#444" />
      <rect x="8" y="35" width="20" height="2" rx="1" fill="#444" />
      
      {/* Circle */}
      <circle cx="36" cy="32" r="6" fill="#333" stroke="#555" strokeWidth="2" />
      <circle cx="36" cy="32" r="2" fill="#666" />
    </g>
  </svg>
);

// Sport/Running Icon
export const SportIcon: React.FC<IconProps> = ({ size = 48, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <defs>
      <linearGradient id="runnerGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#FFD93D" />
        <stop offset="100%" stopColor="#FF9500" />
      </linearGradient>
      <linearGradient id="runnerGrad2" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#4D96FF" />
        <stop offset="100%" stopColor="#3672CC" />
      </linearGradient>
      <filter id="runnerShadow" x="-20%" y="-20%" width="140%" height="140%">
        <feDropShadow dx="0" dy="2" stdDeviation="2" floodColor="#FF9500" floodOpacity="0.4" />
      </filter>
    </defs>
    
    <g filter="url(#runnerShadow)">
      {/* Head */}
      <circle cx="32" cy="10" r="6" fill="url(#runnerGrad1)" />
      
      {/* Body */}
      <path d="M28 16 L24 28 L32 28 L28 16" fill="url(#runnerGrad2)" />
      <ellipse cx="28" cy="22" rx="6" ry="8" fill="url(#runnerGrad2)" />
      
      {/* Arms */}
      <path d="M22 20 L10 16" stroke="url(#runnerGrad1)" strokeWidth="4" strokeLinecap="round" />
      <path d="M34 20 L40 28" stroke="url(#runnerGrad1)" strokeWidth="4" strokeLinecap="round" />
      
      {/* Legs */}
      <path d="M26 28 L14 40" stroke="url(#runnerGrad2)" strokeWidth="4" strokeLinecap="round" />
      <path d="M30 28 L40 42" stroke="url(#runnerGrad2)" strokeWidth="4" strokeLinecap="round" />
      
      {/* Shoes */}
      <ellipse cx="12" cy="42" rx="4" ry="2" fill="#FF5722" />
      <ellipse cx="42" cy="44" rx="4" ry="2" fill="#FF5722" />
      
      {/* Motion lines */}
      <path d="M6 18 L2 18" stroke="#FFD93D" strokeWidth="2" strokeLinecap="round" opacity="0.6" />
      <path d="M8 24 L4 24" stroke="#FFD93D" strokeWidth="2" strokeLinecap="round" opacity="0.6" />
    </g>
  </svg>
);

// Shopping Icon
export const ShoppingIcon: React.FC<IconProps> = ({ size = 48, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <defs>
      <linearGradient id="bagGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#FF69B4" />
        <stop offset="100%" stopColor="#FF1493" />
      </linearGradient>
      <linearGradient id="bagGrad2" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#9B59B6" />
        <stop offset="100%" stopColor="#8E44AD" />
      </linearGradient>
      <linearGradient id="bagGrad3" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#F39C12" />
        <stop offset="100%" stopColor="#E67E22" />
      </linearGradient>
      <filter id="bagShadow" x="-20%" y="-20%" width="140%" height="140%">
        <feDropShadow dx="0" dy="2" stdDeviation="2" floodColor="#FF1493" floodOpacity="0.4" />
      </filter>
    </defs>
    
    <g filter="url(#bagShadow)">
      {/* Back bag */}
      <rect x="28" y="16" width="14" height="28" rx="2" fill="url(#bagGrad3)" />
      <path d="M32 16 Q35 6 38 16" stroke="url(#bagGrad3)" strokeWidth="3" fill="none" />
      
      {/* Middle bag */}
      <rect x="16" y="14" width="16" height="30" rx="2" fill="url(#bagGrad2)" />
      <path d="M20 14 Q24 4 28 14" stroke="url(#bagGrad2)" strokeWidth="3" fill="none" />
      
      {/* Front bag */}
      <rect x="4" y="18" width="18" height="26" rx="2" fill="url(#bagGrad1)" />
      <path d="M8 18 Q13 8 18 18" stroke="url(#bagGrad1)" strokeWidth="3" fill="none" />
      
      {/* Decorative dots */}
      <circle cx="13" cy="30" r="2" fill="white" opacity="0.5" />
      <circle cx="24" cy="28" r="2" fill="white" opacity="0.5" />
    </g>
  </svg>
);

// Party Icon
export const PartyMeetingIcon: React.FC<IconProps> = ({ size = 48, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <defs>
      <linearGradient id="partyMGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#FFD700" />
        <stop offset="100%" stopColor="#FFA500" />
      </linearGradient>
      <linearGradient id="partyMGrad2" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#FF6B9D" />
        <stop offset="100%" stopColor="#C44569" />
      </linearGradient>
      <filter id="partyMShadow" x="-20%" y="-20%" width="140%" height="140%">
        <feDropShadow dx="0" dy="2" stdDeviation="2" floodColor="#FFD700" floodOpacity="0.4" />
      </filter>
    </defs>
    
    {/* Confetti */}
    <rect x="30" y="6" width="4" height="4" rx="1" fill="#FF6B9D" transform="rotate(15 32 8)">
      <animate attributeName="y" values="6;4;6" dur="1s" repeatCount="indefinite" />
    </rect>
    <rect x="38" y="12" width="3" height="5" rx="1" fill="#4D96FF" transform="rotate(-20 39.5 14.5)" />
    <circle cx="42" cy="8" r="2.5" fill="#FFD93D" />
    <circle cx="28" cy="8" r="2" fill="#4D96FF" />
    
    <g filter="url(#partyMShadow)">
      <path d="M8 40 L18 18 L28 28 L8 40" fill="url(#partyMGrad1)" />
      <path d="M18 18 L28 28 L24 32 L14 22 L18 18" fill="url(#partyMGrad2)" />
      <path d="M10 38 L16 24" stroke="#FFA500" strokeWidth="2" strokeLinecap="round" opacity="0.5" />
      <circle cx="8" cy="40" r="2" fill="#8B4513" />
    </g>
    
    <path d="M32 14 L33 16 L35 15 L33 16.5 L34 19 L32.5 17 L30 18 L32 16 Z" fill="#FFD93D" />
  </svg>
);

// Work/Briefcase Icon
export const WorkIcon: React.FC<IconProps> = ({ size = 48, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <defs>
      <linearGradient id="briefcaseGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#8B4513" />
        <stop offset="100%" stopColor="#5D3A1A" />
      </linearGradient>
      <linearGradient id="briefcaseGrad2" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#A0522D" />
        <stop offset="100%" stopColor="#8B4513" />
      </linearGradient>
      <filter id="briefcaseShadow" x="-20%" y="-20%" width="140%" height="140%">
        <feDropShadow dx="0" dy="2" stdDeviation="2" floodColor="#5D3A1A" floodOpacity="0.4" />
      </filter>
    </defs>
    
    <g filter="url(#briefcaseShadow)">
      {/* Handle */}
      <path d="M16 14 L16 10 Q16 6 20 6 L28 6 Q32 6 32 10 L32 14" stroke="url(#briefcaseGrad1)" strokeWidth="3" fill="none" />
      
      {/* Main body */}
      <rect x="4" y="14" width="40" height="28" rx="4" fill="url(#briefcaseGrad1)" />
      
      {/* Front panel */}
      <rect x="6" y="16" width="36" height="24" rx="2" fill="url(#briefcaseGrad2)" />
      
      {/* Clasp */}
      <rect x="20" y="24" width="8" height="6" rx="1" fill="#FFD700" />
      <rect x="22" y="26" width="4" height="2" rx="0.5" fill="#8B4513" />
      
      {/* Stitching */}
      <path d="M10 18 L10 38" stroke="#5D3A1A" strokeWidth="1" strokeDasharray="2 2" opacity="0.3" />
      <path d="M38 18 L38 38" stroke="#5D3A1A" strokeWidth="1" strokeDasharray="2 2" opacity="0.3" />
    </g>
  </svg>
);

// Walk Icon
export const WalkIcon: React.FC<IconProps> = ({ size = 48, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <defs>
      <linearGradient id="walkGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#4D96FF" />
        <stop offset="100%" stopColor="#3672CC" />
      </linearGradient>
      <linearGradient id="walkGrad2" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#FFD93D" />
        <stop offset="100%" stopColor="#FFB800" />
      </linearGradient>
      <filter id="walkShadow" x="-20%" y="-20%" width="140%" height="140%">
        <feDropShadow dx="0" dy="2" stdDeviation="2" floodColor="#4D96FF" floodOpacity="0.4" />
      </filter>
    </defs>
    
    <g filter="url(#walkShadow)">
      {/* Head */}
      <circle cx="24" cy="10" r="6" fill="url(#walkGrad2)" />
      
      {/* Body */}
      <ellipse cx="24" cy="24" rx="6" ry="10" fill="url(#walkGrad1)" />
      
      {/* Arms */}
      <path d="M18 20 L8 28" stroke="url(#walkGrad2)" strokeWidth="4" strokeLinecap="round" />
      <path d="M30 20 L38 14" stroke="url(#walkGrad2)" strokeWidth="4" strokeLinecap="round" />
      
      {/* Legs */}
      <path d="M22 34 L16 46" stroke="url(#walkGrad1)" strokeWidth="4" strokeLinecap="round" />
      <path d="M26 34 L34 44" stroke="url(#walkGrad1)" strokeWidth="4" strokeLinecap="round" />
      
      {/* Shoes */}
      <ellipse cx="14" cy="46" rx="4" ry="2" fill="#333" />
      <ellipse cx="36" cy="44" rx="4" ry="2" fill="#333" />
    </g>
  </svg>
);

// Bar/Beer Icon
export const BarIcon: React.FC<IconProps> = ({ size = 48, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <defs>
      <linearGradient id="beerGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#FFD700" />
        <stop offset="100%" stopColor="#FFA500" />
      </linearGradient>
      <linearGradient id="beerGrad2" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#FFFAF0" />
        <stop offset="100%" stopColor="#F5DEB3" />
      </linearGradient>
      <filter id="beerShadow" x="-20%" y="-20%" width="140%" height="140%">
        <feDropShadow dx="0" dy="2" stdDeviation="2" floodColor="#FFA500" floodOpacity="0.4" />
      </filter>
    </defs>
    
    <g filter="url(#beerShadow)">
      {/* Mug body */}
      <rect x="8" y="14" width="24" height="30" rx="4" fill="url(#beerGrad1)" />
      
      {/* Beer */}
      <rect x="10" y="16" width="20" height="26" rx="2" fill="#CC9900" />
      
      {/* Foam */}
      <ellipse cx="20" cy="14" rx="12" ry="4" fill="url(#beerGrad2)" />
      <ellipse cx="14" cy="12" rx="4" ry="3" fill="url(#beerGrad2)" />
      <ellipse cx="26" cy="12" rx="4" ry="3" fill="url(#beerGrad2)" />
      <ellipse cx="20" cy="10" rx="3" ry="2" fill="url(#beerGrad2)" />
      
      {/* Handle */}
      <path d="M32 20 Q42 20 42 28 Q42 38 32 38" stroke="url(#beerGrad1)" strokeWidth="5" fill="none" />
      
      {/* Bubbles */}
      <circle cx="14" cy="28" r="1.5" fill="#FFE4B5" opacity="0.6">
        <animate attributeName="cy" values="28;24;28" dur="2s" repeatCount="indefinite" />
      </circle>
      <circle cx="22" cy="32" r="1" fill="#FFE4B5" opacity="0.6">
        <animate attributeName="cy" values="32;28;32" dur="2.5s" repeatCount="indefinite" />
      </circle>
      <circle cx="18" cy="36" r="1.5" fill="#FFE4B5" opacity="0.6">
        <animate attributeName="cy" values="36;32;36" dur="1.8s" repeatCount="indefinite" />
      </circle>
    </g>
  </svg>
);

// Restaurant Icon
export const RestaurantIcon: React.FC<IconProps> = ({ size = 48, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <defs>
      <linearGradient id="forkGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#C0C0C0" />
        <stop offset="100%" stopColor="#A0A0A0" />
      </linearGradient>
      <filter id="forkShadow" x="-20%" y="-20%" width="140%" height="140%">
        <feDropShadow dx="0" dy="2" stdDeviation="2" floodColor="#808080" floodOpacity="0.4" />
      </filter>
    </defs>
    
    <g filter="url(#forkShadow)">
      {/* Fork */}
      <g transform="translate(10, 4)">
        <rect x="0" y="0" width="2.5" height="14" rx="0.5" fill="url(#forkGrad)" />
        <rect x="5" y="0" width="2.5" height="14" rx="0.5" fill="url(#forkGrad)" />
        <rect x="10" y="0" width="2.5" height="14" rx="0.5" fill="url(#forkGrad)" />
        <rect x="0" y="12" width="12.5" height="6" rx="2" fill="url(#forkGrad)" />
        <rect x="4" y="16" width="4.5" height="24" rx="2" fill="url(#forkGrad)" />
      </g>
      
      {/* Knife */}
      <g transform="translate(28, 4)">
        <path d="M0 0 L8 0 L8 18 Q4 22 0 18 L0 0" fill="url(#forkGrad)" />
        <rect x="2" y="16" width="4" height="24" rx="2" fill="url(#forkGrad)" />
      </g>
    </g>
  </svg>
);

// Concert Icon
export const ConcertIcon: React.FC<IconProps> = ({ size = 48, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <defs>
      <linearGradient id="noteGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#9B59B6" />
        <stop offset="100%" stopColor="#8E44AD" />
      </linearGradient>
      <linearGradient id="noteGrad2" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#3498DB" />
        <stop offset="100%" stopColor="#2980B9" />
      </linearGradient>
      <filter id="noteShadow" x="-20%" y="-20%" width="140%" height="140%">
        <feDropShadow dx="0" dy="2" stdDeviation="2" floodColor="#9B59B6" floodOpacity="0.4" />
      </filter>
    </defs>
    
    <g filter="url(#noteShadow)">
      {/* First note */}
      <ellipse cx="14" cy="38" rx="6" ry="5" fill="url(#noteGrad1)" />
      <rect x="18" y="8" width="4" height="30" fill="url(#noteGrad1)" />
      <ellipse cx="14" cy="38" rx="4" ry="3" fill="#7B2D8E" />
      
      {/* Second note */}
      <ellipse cx="36" cy="34" rx="6" ry="5" fill="url(#noteGrad2)" />
      <rect x="40" y="6" width="4" height="28" fill="url(#noteGrad2)" />
      <ellipse cx="36" cy="34" rx="4" ry="3" fill="#1F6391" />
      
      {/* Beam connecting notes */}
      <path d="M20 8 L42 6 L42 12 L20 14 Z" fill="url(#noteGrad1)" />
      
      {/* Music symbols */}
      <circle cx="8" cy="12" r="2" fill="#FFD93D" />
      <circle cx="40" cy="20" r="1.5" fill="#FF6B9D" />
      <path d="M28 18 L29 20 L31 19 L29 20.5 L30 23 L28.5 21 L26 22 L28 20 Z" fill="#6BCB77" />
    </g>
  </svg>
);

// Game Icon
export const GameIcon: React.FC<IconProps> = ({ size = 48, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <defs>
      <linearGradient id="controllerGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#2D2D2D" />
        <stop offset="100%" stopColor="#1A1A1A" />
      </linearGradient>
      <linearGradient id="controllerGrad2" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#444" />
        <stop offset="100%" stopColor="#333" />
      </linearGradient>
      <filter id="controllerShadow" x="-20%" y="-20%" width="140%" height="140%">
        <feDropShadow dx="0" dy="2" stdDeviation="2" floodColor="#1A1A1A" floodOpacity="0.4" />
      </filter>
    </defs>
    
    <g filter="url(#controllerShadow)">
      {/* Controller body */}
      <path d="M4 20 Q4 12 12 12 L36 12 Q44 12 44 20 L44 28 Q44 40 36 42 L32 42 Q28 42 26 38 L22 38 Q20 42 16 42 L12 42 Q4 40 4 28 Z" fill="url(#controllerGrad1)" />
      
      {/* D-pad */}
      <rect x="10" y="22" width="4" height="12" rx="1" fill="url(#controllerGrad2)" />
      <rect x="6" y="26" width="12" height="4" rx="1" fill="url(#controllerGrad2)" />
      
      {/* Buttons */}
      <circle cx="36" cy="22" r="3" fill="#4CAF50" />
      <circle cx="42" cy="28" r="3" fill="#F44336" />
      <circle cx="36" cy="34" r="3" fill="#2196F3" />
      <circle cx="30" cy="28" r="3" fill="#FFEB3B" />
      
      {/* Analog sticks */}
      <circle cx="18" cy="34" r="4" fill="#555" />
      <circle cx="30" cy="18" r="4" fill="#555" />
    </g>
  </svg>
);

// Travel Icon
export const TravelIcon: React.FC<IconProps> = ({ size = 48, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <defs>
      <linearGradient id="planeGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#4D96FF" />
        <stop offset="100%" stopColor="#3672CC" />
      </linearGradient>
      <linearGradient id="planeGrad2" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#87CEEB" />
        <stop offset="100%" stopColor="#4D96FF" />
      </linearGradient>
      <filter id="planeShadow" x="-20%" y="-20%" width="140%" height="140%">
        <feDropShadow dx="0" dy="2" stdDeviation="2" floodColor="#3672CC" floodOpacity="0.4" />
      </filter>
    </defs>
    
    <g filter="url(#planeShadow)">
      {/* Fuselage */}
      <ellipse cx="24" cy="24" rx="20" ry="6" fill="url(#planeGrad1)" transform="rotate(-30 24 24)" />
      
      {/* Wings */}
      <path d="M18 22 L8 32 L28 26 Z" fill="url(#planeGrad2)" />
      <path d="M30 18 L42 10 L26 20 Z" fill="url(#planeGrad2)" />
      
      {/* Tail */}
      <path d="M36 28 L44 26 L42 32 Z" fill="url(#planeGrad2)" />
      <path d="M38 26 L44 22 L40 28 Z" fill="url(#planeGrad1)" />
      
      {/* Windows */}
      <circle cx="18" cy="22" r="1.5" fill="#87CEEB" />
      <circle cx="22" cy="21" r="1.5" fill="#87CEEB" />
      <circle cx="26" cy="20" r="1.5" fill="#87CEEB" />
      
      {/* Nose */}
      <ellipse cx="10" cy="28" rx="4" ry="2" fill="url(#planeGrad1)" transform="rotate(-30 10 28)" />
      
      {/* Contrails */}
      <path d="M42 30 L46 32" stroke="white" strokeWidth="2" strokeLinecap="round" opacity="0.5" />
      <path d="M44 34 L48 36" stroke="white" strokeWidth="2" strokeLinecap="round" opacity="0.4" />
    </g>
  </svg>
);

// Study Icon
export const StudyIcon: React.FC<IconProps> = ({ size = 48, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <defs>
      <linearGradient id="bookGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#3498DB" />
        <stop offset="100%" stopColor="#2980B9" />
      </linearGradient>
      <linearGradient id="bookGrad2" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#E74C3C" />
        <stop offset="100%" stopColor="#C0392B" />
      </linearGradient>
      <linearGradient id="bookGrad3" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#2ECC71" />
        <stop offset="100%" stopColor="#27AE60" />
      </linearGradient>
      <filter id="bookShadow" x="-20%" y="-20%" width="140%" height="140%">
        <feDropShadow dx="0" dy="2" stdDeviation="2" floodColor="#2980B9" floodOpacity="0.4" />
      </filter>
    </defs>
    
    <g filter="url(#bookShadow)">
      {/* Bottom book */}
      <rect x="6" y="30" width="36" height="10" rx="1" fill="url(#bookGrad3)" />
      <rect x="8" y="32" width="32" height="6" fill="#27AE60" />
      
      {/* Middle book */}
      <rect x="8" y="20" width="32" height="10" rx="1" fill="url(#bookGrad2)" />
      <rect x="10" y="22" width="28" height="6" fill="#C0392B" />
      
      {/* Top book */}
      <rect x="4" y="10" width="34" height="10" rx="1" fill="url(#bookGrad1)" />
      <rect x="6" y="12" width="30" height="6" fill="#2980B9" />
      
      {/* Book details */}
      <rect x="12" y="14" width="8" height="2" rx="0.5" fill="#F5F5F5" opacity="0.5" />
      <rect x="14" y="24" width="12" height="2" rx="0.5" fill="#F5F5F5" opacity="0.5" />
      <rect x="10" y="34" width="6" height="2" rx="0.5" fill="#F5F5F5" opacity="0.5" />
      
      {/* Pages */}
      <rect x="38" y="12" width="2" height="6" fill="#F5F5F5" />
      <rect x="40" y="22" width="2" height="6" fill="#F5F5F5" />
      <rect x="42" y="32" width="2" height="6" fill="#F5F5F5" />
    </g>
  </svg>
);

// Other/Pin Icon
export const OtherMeetingIcon: React.FC<IconProps> = ({ size = 48, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <defs>
      <linearGradient id="pinGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#E74C3C" />
        <stop offset="100%" stopColor="#C0392B" />
      </linearGradient>
      <linearGradient id="pinGrad2" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#F5F5F5" />
        <stop offset="100%" stopColor="#E0E0E0" />
      </linearGradient>
      <filter id="pinShadow" x="-20%" y="-20%" width="140%" height="140%">
        <feDropShadow dx="0" dy="2" stdDeviation="2" floodColor="#C0392B" floodOpacity="0.4" />
      </filter>
    </defs>
    
    <g filter="url(#pinShadow)">
      {/* Pin head */}
      <circle cx="24" cy="16" r="12" fill="url(#pinGrad1)" />
      <circle cx="24" cy="16" r="8" fill="url(#pinGrad2)" />
      <circle cx="24" cy="16" r="4" fill="url(#pinGrad1)" />
      
      {/* Pin needle */}
      <path d="M24 28 L24 44" stroke="url(#pinGrad2)" strokeWidth="4" strokeLinecap="round" />
      <path d="M24 40 L24 46" stroke="#A0A0A0" strokeWidth="3" strokeLinecap="round" />
      
      {/* Shine */}
      <ellipse cx="20" cy="12" rx="2" ry="3" fill="white" opacity="0.4" />
    </g>
  </svg>
);

// Export mapping
export const meetingTypeIcons: Record<string, React.FC<IconProps>> = {
  coffee: CoffeeIcon,
  lunch: LunchIcon,
  movie: MovieIcon,
  sport: SportIcon,
  shopping: ShoppingIcon,
  party: PartyMeetingIcon,
  work: WorkIcon,
  walk: WalkIcon,
  bar: BarIcon,
  restaurant: RestaurantIcon,
  concert: ConcertIcon,
  game: GameIcon,
  travel: TravelIcon,
  study: StudyIcon,
  other: OtherMeetingIcon,
};
