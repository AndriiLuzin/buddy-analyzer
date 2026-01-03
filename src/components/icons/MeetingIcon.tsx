import React from 'react';

interface MeetingIconProps {
  size?: number;
  className?: string;
}

export const MeetingIcon: React.FC<MeetingIconProps> = ({ size = 48, className = '' }) => {
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
        <linearGradient id="meetingGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="1" />
          <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0.6" />
        </linearGradient>
        <linearGradient id="meetingGrad2" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.3" />
          <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0.1" />
        </linearGradient>
        <filter id="meetingShadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="hsl(var(--primary))" floodOpacity="0.3" />
        </filter>
      </defs>
      
      {/* Background circle with soft glow */}
      <circle cx="24" cy="24" r="22" fill="url(#meetingGrad2)" />
      
      {/* Calendar base */}
      <g filter="url(#meetingShadow)">
        <rect x="10" y="12" width="28" height="26" rx="4" fill="url(#meetingGrad1)" />
        
        {/* Calendar top bar */}
        <rect x="10" y="12" width="28" height="8" rx="4" fill="hsl(var(--primary))" />
        
        {/* Calendar rings */}
        <rect x="16" y="9" width="3" height="6" rx="1.5" fill="hsl(var(--primary-foreground))" />
        <rect x="29" y="9" width="3" height="6" rx="1.5" fill="hsl(var(--primary-foreground))" />
        
        {/* People icons inside calendar */}
        <circle cx="19" cy="28" r="3" fill="hsl(var(--primary-foreground))" opacity="0.9" />
        <circle cx="29" cy="28" r="3" fill="hsl(var(--primary-foreground))" opacity="0.9" />
        <circle cx="24" cy="26" r="4" fill="hsl(var(--primary-foreground))" />
        
        {/* Connection line */}
        <path d="M16 32 L24 30 L32 32" stroke="hsl(var(--primary-foreground))" strokeWidth="2" strokeLinecap="round" opacity="0.7" />
      </g>
    </svg>
  );
};
