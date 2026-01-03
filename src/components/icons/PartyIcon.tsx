import React from 'react';

interface PartyIconProps {
  size?: number;
  className?: string;
}

export const PartyIcon: React.FC<PartyIconProps> = ({ size = 48, className = '' }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <defs>
        <linearGradient id="partyGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FF6B9D" />
          <stop offset="50%" stopColor="#C44569" />
          <stop offset="100%" stopColor="#8B2AB4" />
        </linearGradient>
        <linearGradient id="partyGrad2" x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#FFD93D" />
          <stop offset="100%" stopColor="#FF8B3D" />
        </linearGradient>
        <linearGradient id="partyGrad3" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#6BCB77" />
          <stop offset="100%" stopColor="#4D96FF" />
        </linearGradient>
        <filter id="partyShadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="2" stdDeviation="2" floodColor="#FF6B9D" floodOpacity="0.4" />
        </filter>
        <filter id="partyGlow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="2" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      
      {/* Soft background glow */}
      <circle cx="24" cy="24" r="22" fill="url(#partyGrad1)" opacity="0.15" />
      
      {/* Confetti pieces */}
      <g filter="url(#partyGlow)">
        <rect x="8" y="8" width="4" height="4" rx="1" fill="#FFD93D" transform="rotate(15 10 10)" />
        <rect x="36" y="6" width="3" height="6" rx="1" fill="#4D96FF" transform="rotate(-20 37.5 9)" />
        <rect x="6" y="28" width="5" height="3" rx="1" fill="#6BCB77" transform="rotate(30 8.5 29.5)" />
        <rect x="38" y="32" width="4" height="4" rx="1" fill="#FF6B9D" transform="rotate(-15 40 34)" />
        <circle cx="14" cy="16" r="2" fill="#FF8B3D" />
        <circle cx="36" y="20" r="2.5" fill="#C44569" />
      </g>
      
      {/* Party hat */}
      <g filter="url(#partyShadow)">
        <path
          d="M24 8 L34 36 L14 36 Z"
          fill="url(#partyGrad1)"
        />
        
        {/* Hat stripes */}
        <path
          d="M24 8 L26 16 L22 16 Z"
          fill="url(#partyGrad2)"
          opacity="0.9"
        />
        <path
          d="M22 16 L28 28 L20 28 Z"
          fill="url(#partyGrad3)"
          opacity="0.7"
        />
        
        {/* Pom pom on top */}
        <circle cx="24" cy="7" r="3" fill="url(#partyGrad2)" />
        <circle cx="23" cy="6" r="1" fill="white" opacity="0.6" />
        
        {/* Hat rim */}
        <ellipse cx="24" cy="36" rx="12" ry="3" fill="url(#partyGrad1)" />
        
        {/* Decorative dots on hat */}
        <circle cx="21" cy="22" r="1.5" fill="white" opacity="0.8" />
        <circle cx="27" cy="26" r="1.5" fill="white" opacity="0.8" />
        <circle cx="23" cy="30" r="1.5" fill="white" opacity="0.8" />
      </g>
      
      {/* Sparkle effects */}
      <g opacity="0.9">
        <path d="M40 14 L41 16 L43 15 L41 16.5 L42 19 L40.5 17 L38 18 L40 16 Z" fill="#FFD93D" />
        <path d="M8 22 L9 24 L11 23 L9 24.5 L10 27 L8.5 25 L6 26 L8 24 Z" fill="#4D96FF" />
      </g>
    </svg>
  );
};
