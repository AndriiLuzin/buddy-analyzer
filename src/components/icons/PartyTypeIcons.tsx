import React from 'react';

interface IconProps {
  size?: number;
  className?: string;
}

// Birthday Cake Icon
export const BirthdayCakeIcon: React.FC<IconProps> = ({ size = 48, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <defs>
      <linearGradient id="cakeGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#FFE4C4" />
        <stop offset="100%" stopColor="#F5DEB3" />
      </linearGradient>
      <linearGradient id="cakeGrad2" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#FF69B4" />
        <stop offset="100%" stopColor="#FF1493" />
      </linearGradient>
      <linearGradient id="cakeGrad3" x1="0%" y1="100%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#8B4513" />
        <stop offset="100%" stopColor="#A0522D" />
      </linearGradient>
      <filter id="cakeShadow" x="-20%" y="-20%" width="140%" height="140%">
        <feDropShadow dx="0" dy="2" stdDeviation="2" floodColor="#FF69B4" floodOpacity="0.3" />
      </filter>
    </defs>
    
    {/* Cake base */}
    <g filter="url(#cakeShadow)">
      <ellipse cx="24" cy="42" rx="16" ry="4" fill="url(#cakeGrad3)" />
      <rect x="8" y="28" width="32" height="14" rx="2" fill="url(#cakeGrad1)" />
      <rect x="10" y="22" width="28" height="8" rx="2" fill="url(#cakeGrad2)" />
      
      {/* Frosting drips */}
      <path d="M10 28 Q12 32 10 34 L10 28" fill="url(#cakeGrad2)" />
      <path d="M18 28 Q20 34 18 36 L18 28" fill="url(#cakeGrad2)" />
      <path d="M26 28 Q28 33 26 35 L26 28" fill="url(#cakeGrad2)" />
      <path d="M34 28 Q36 32 34 34 L34 28" fill="url(#cakeGrad2)" />
      
      {/* Candles */}
      <rect x="15" y="12" width="3" height="10" rx="1" fill="#FFD700" />
      <rect x="23" y="10" width="3" height="12" rx="1" fill="#87CEEB" />
      <rect x="31" y="12" width="3" height="10" rx="1" fill="#98FB98" />
      
      {/* Flames */}
      <ellipse cx="16.5" cy="10" rx="2.5" ry="4" fill="#FF6B00">
        <animate attributeName="ry" values="4;3.5;4" dur="0.5s" repeatCount="indefinite" />
      </ellipse>
      <ellipse cx="16.5" cy="10" rx="1.5" ry="2.5" fill="#FFFF00" />
      
      <ellipse cx="24.5" cy="8" rx="2.5" ry="4" fill="#FF6B00">
        <animate attributeName="ry" values="4;4.5;4" dur="0.6s" repeatCount="indefinite" />
      </ellipse>
      <ellipse cx="24.5" cy="8" rx="1.5" ry="2.5" fill="#FFFF00" />
      
      <ellipse cx="32.5" cy="10" rx="2.5" ry="4" fill="#FF6B00">
        <animate attributeName="ry" values="4;3.5;4" dur="0.4s" repeatCount="indefinite" />
      </ellipse>
      <ellipse cx="32.5" cy="10" rx="1.5" ry="2.5" fill="#FFFF00" />
    </g>
  </svg>
);

// Party Popper Icon
export const PartyPopperIcon: React.FC<IconProps> = ({ size = 48, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <defs>
      <linearGradient id="popperGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#FFD700" />
        <stop offset="100%" stopColor="#FFA500" />
      </linearGradient>
      <linearGradient id="popperGrad2" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#FF6B9D" />
        <stop offset="100%" stopColor="#C44569" />
      </linearGradient>
      <filter id="popperShadow" x="-20%" y="-20%" width="140%" height="140%">
        <feDropShadow dx="0" dy="2" stdDeviation="2" floodColor="#FFD700" floodOpacity="0.4" />
      </filter>
    </defs>
    
    {/* Confetti */}
    <rect x="30" y="6" width="4" height="4" rx="1" fill="#FF6B9D" transform="rotate(15 32 8)">
      <animate attributeName="y" values="6;4;6" dur="1s" repeatCount="indefinite" />
    </rect>
    <rect x="38" y="12" width="3" height="5" rx="1" fill="#4D96FF" transform="rotate(-20 39.5 14.5)" />
    <rect x="35" y="20" width="4" height="3" rx="1" fill="#6BCB77" transform="rotate(30 37 21.5)" />
    <circle cx="42" cy="8" r="2.5" fill="#FFD93D" />
    <rect x="40" y="16" width="3" height="3" rx="0.5" fill="#C44569" transform="rotate(45 41.5 17.5)" />
    <circle cx="28" cy="8" r="2" fill="#4D96FF" />
    
    {/* Popper cone */}
    <g filter="url(#popperShadow)">
      <path d="M8 40 L18 18 L28 28 L8 40" fill="url(#popperGrad1)" />
      <path d="M18 18 L28 28 L24 32 L14 22 L18 18" fill="url(#popperGrad2)" />
      
      {/* Stripes on cone */}
      <path d="M10 38 L16 24" stroke="#FFA500" strokeWidth="2" strokeLinecap="round" opacity="0.5" />
      <path d="M14 36 L20 22" stroke="#FF6B9D" strokeWidth="2" strokeLinecap="round" opacity="0.5" />
      
      {/* Cone tip */}
      <circle cx="8" cy="40" r="2" fill="#8B4513" />
    </g>
    
    {/* More sparkles */}
    <path d="M32 14 L33 16 L35 15 L33 16.5 L34 19 L32.5 17 L30 18 L32 16 Z" fill="#FFD93D" />
    <circle cx="26" cy="14" r="1.5" fill="#FF6B9D" />
  </svg>
);

// BBQ Icon
export const BBQIcon: React.FC<IconProps> = ({ size = 48, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <defs>
      <linearGradient id="meatGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#CD853F" />
        <stop offset="50%" stopColor="#8B4513" />
        <stop offset="100%" stopColor="#A0522D" />
      </linearGradient>
      <linearGradient id="meatGrad2" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#F5F5DC" />
        <stop offset="100%" stopColor="#FAEBD7" />
      </linearGradient>
      <filter id="bbqShadow" x="-20%" y="-20%" width="140%" height="140%">
        <feDropShadow dx="0" dy="2" stdDeviation="2" floodColor="#8B4513" floodOpacity="0.4" />
      </filter>
    </defs>
    
    <g filter="url(#bbqShadow)">
      {/* Drumstick bone */}
      <ellipse cx="36" cy="32" rx="6" ry="4" fill="url(#meatGrad2)" />
      <rect x="30" y="28" width="12" height="8" rx="3" fill="url(#meatGrad2)" />
      
      {/* Drumstick meat */}
      <ellipse cx="20" cy="24" rx="14" ry="10" fill="url(#meatGrad1)" />
      <ellipse cx="18" cy="22" rx="4" ry="3" fill="#A0522D" opacity="0.5" />
      <ellipse cx="24" cy="26" rx="3" ry="2" fill="#CD853F" opacity="0.6" />
      
      {/* Grill marks */}
      <path d="M10 20 L14 28" stroke="#5D3A1A" strokeWidth="1.5" strokeLinecap="round" opacity="0.4" />
      <path d="M16 18 L20 26" stroke="#5D3A1A" strokeWidth="1.5" strokeLinecap="round" opacity="0.4" />
      <path d="M22 18 L26 26" stroke="#5D3A1A" strokeWidth="1.5" strokeLinecap="round" opacity="0.4" />
      
      {/* Steam */}
      <path d="M14 14 Q16 10 14 6" stroke="#888" strokeWidth="1.5" strokeLinecap="round" fill="none" opacity="0.5">
        <animate attributeName="d" values="M14 14 Q16 10 14 6;M14 14 Q12 10 14 6;M14 14 Q16 10 14 6" dur="2s" repeatCount="indefinite" />
      </path>
      <path d="M22 12 Q24 8 22 4" stroke="#888" strokeWidth="1.5" strokeLinecap="round" fill="none" opacity="0.5">
        <animate attributeName="d" values="M22 12 Q24 8 22 4;M22 12 Q20 8 22 4;M22 12 Q24 8 22 4" dur="2.5s" repeatCount="indefinite" />
      </path>
    </g>
  </svg>
);

// Wedding Church Icon
export const WeddingIcon: React.FC<IconProps> = ({ size = 48, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <defs>
      <linearGradient id="churchGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#FFB6C1" />
        <stop offset="100%" stopColor="#FF69B4" />
      </linearGradient>
      <linearGradient id="churchGrad2" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#FFC0CB" />
        <stop offset="100%" stopColor="#FFB6C1" />
      </linearGradient>
      <filter id="churchShadow" x="-20%" y="-20%" width="140%" height="140%">
        <feDropShadow dx="0" dy="2" stdDeviation="2" floodColor="#FF69B4" floodOpacity="0.3" />
      </filter>
    </defs>
    
    <g filter="url(#churchShadow)">
      {/* Church base */}
      <rect x="10" y="24" width="28" height="20" rx="2" fill="url(#churchGrad2)" />
      
      {/* Roof */}
      <path d="M6 26 L24 12 L42 26 L6 26" fill="url(#churchGrad1)" />
      
      {/* Tower */}
      <rect x="18" y="8" width="12" height="18" fill="url(#churchGrad2)" />
      <path d="M16 10 L24 2 L32 10 L16 10" fill="url(#churchGrad1)" />
      
      {/* Cross */}
      <rect x="22.5" y="0" width="3" height="8" rx="0.5" fill="#FFD700" />
      <rect x="20" y="2" width="8" height="3" rx="0.5" fill="#FFD700" />
      
      {/* Heart on church */}
      <path d="M24 20 C24 18 22 16 20 16 C18 16 16 18 16 20 C16 24 24 28 24 28 C24 28 32 24 32 20 C32 18 30 16 28 16 C26 16 24 18 24 20" fill="#FF1493" />
      
      {/* Door */}
      <rect x="20" y="32" width="8" height="12" rx="4" fill="#8B4513" />
      
      {/* Windows */}
      <circle cx="14" cy="32" r="2.5" fill="#87CEEB" />
      <circle cx="34" cy="32" r="2.5" fill="#87CEEB" />
    </g>
  </svg>
);

// New Year Tree Icon
export const NewYearIcon: React.FC<IconProps> = ({ size = 48, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <defs>
      <linearGradient id="treeGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#228B22" />
        <stop offset="100%" stopColor="#006400" />
      </linearGradient>
      <linearGradient id="treeGrad2" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#32CD32" />
        <stop offset="100%" stopColor="#228B22" />
      </linearGradient>
      <filter id="treeShadow" x="-20%" y="-20%" width="140%" height="140%">
        <feDropShadow dx="0" dy="2" stdDeviation="2" floodColor="#006400" floodOpacity="0.4" />
      </filter>
    </defs>
    
    <g filter="url(#treeShadow)">
      {/* Tree trunk */}
      <rect x="20" y="40" width="8" height="6" rx="1" fill="#8B4513" />
      
      {/* Tree layers */}
      <path d="M24 4 L36 20 L12 20 Z" fill="url(#treeGrad2)" />
      <path d="M24 12 L40 32 L8 32 Z" fill="url(#treeGrad1)" />
      <path d="M24 22 L42 42 L6 42 Z" fill="url(#treeGrad1)" />
      
      {/* Star */}
      <path d="M24 2 L25.5 6 L30 6 L26.5 8.5 L28 13 L24 10 L20 13 L21.5 8.5 L18 6 L22.5 6 Z" fill="#FFD700">
        <animate attributeName="opacity" values="1;0.7;1" dur="1.5s" repeatCount="indefinite" />
      </path>
      
      {/* Ornaments */}
      <circle cx="20" cy="16" r="2" fill="#FF0000" />
      <circle cx="28" cy="18" r="2" fill="#FFD700" />
      <circle cx="16" cy="26" r="2.5" fill="#4169E1" />
      <circle cx="32" cy="28" r="2" fill="#FF69B4" />
      <circle cx="24" cy="32" r="2.5" fill="#FF0000" />
      <circle cx="14" cy="36" r="2" fill="#FFD700" />
      <circle cx="34" cy="38" r="2" fill="#32CD32" />
      
      {/* Garland */}
      <path d="M14 24 Q18 22 22 26 Q26 30 30 26 Q34 22 38 26" stroke="#FFD700" strokeWidth="1.5" fill="none" opacity="0.8" />
    </g>
  </svg>
);

// Corporate Building Icon
export const CorporateIcon: React.FC<IconProps> = ({ size = 48, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <defs>
      <linearGradient id="buildingGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#708090" />
        <stop offset="100%" stopColor="#4A5568" />
      </linearGradient>
      <linearGradient id="buildingGrad2" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#A0AEC0" />
        <stop offset="100%" stopColor="#718096" />
      </linearGradient>
      <filter id="buildingShadow" x="-20%" y="-20%" width="140%" height="140%">
        <feDropShadow dx="0" dy="2" stdDeviation="2" floodColor="#4A5568" floodOpacity="0.4" />
      </filter>
    </defs>
    
    <g filter="url(#buildingShadow)">
      {/* Main building */}
      <rect x="8" y="12" width="32" height="34" rx="2" fill="url(#buildingGrad1)" />
      
      {/* Roof */}
      <rect x="6" y="10" width="36" height="4" rx="1" fill="url(#buildingGrad2)" />
      
      {/* Windows row 1 */}
      <rect x="12" y="16" width="5" height="5" rx="0.5" fill="#87CEEB" />
      <rect x="21" y="16" width="5" height="5" rx="0.5" fill="#87CEEB" />
      <rect x="30" y="16" width="5" height="5" rx="0.5" fill="#FFD93D" />
      
      {/* Windows row 2 */}
      <rect x="12" y="24" width="5" height="5" rx="0.5" fill="#FFD93D" />
      <rect x="21" y="24" width="5" height="5" rx="0.5" fill="#87CEEB" />
      <rect x="30" y="24" width="5" height="5" rx="0.5" fill="#87CEEB" />
      
      {/* Windows row 3 */}
      <rect x="12" y="32" width="5" height="5" rx="0.5" fill="#87CEEB" />
      <rect x="21" y="32" width="5" height="5" rx="0.5" fill="#FFD93D" />
      <rect x="30" y="32" width="5" height="5" rx="0.5" fill="#87CEEB" />
      
      {/* Door */}
      <rect x="19" y="40" width="10" height="6" rx="1" fill="#2D3748" />
      <rect x="23" y="42" width="2" height="2" rx="1" fill="#FFD700" />
    </g>
  </svg>
);

// Other/General Party Icon
export const OtherPartyIcon: React.FC<IconProps> = ({ size = 48, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <defs>
      <linearGradient id="otherGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#9B59B6" />
        <stop offset="100%" stopColor="#8E44AD" />
      </linearGradient>
      <linearGradient id="otherGrad2" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#F39C12" />
        <stop offset="100%" stopColor="#E67E22" />
      </linearGradient>
      <filter id="otherShadow" x="-20%" y="-20%" width="140%" height="140%">
        <feDropShadow dx="0" dy="2" stdDeviation="2" floodColor="#9B59B6" floodOpacity="0.4" />
      </filter>
    </defs>
    
    {/* Background confetti */}
    <circle cx="8" cy="12" r="2" fill="#FF6B9D" />
    <circle cx="40" cy="8" r="2.5" fill="#4D96FF" />
    <rect x="36" y="36" width="4" height="4" rx="1" fill="#6BCB77" transform="rotate(15 38 38)" />
    <rect x="6" y="32" width="3" height="5" rx="1" fill="#FFD93D" transform="rotate(-10 7.5 34.5)" />
    
    <g filter="url(#otherShadow)">
      {/* Gift box */}
      <rect x="12" y="22" width="24" height="20" rx="2" fill="url(#otherGrad1)" />
      <rect x="12" y="18" width="24" height="6" rx="2" fill="url(#otherGrad2)" />
      
      {/* Ribbon vertical */}
      <rect x="22" y="18" width="4" height="24" fill="url(#otherGrad2)" />
      
      {/* Bow */}
      <ellipse cx="18" cy="14" rx="6" ry="4" fill="url(#otherGrad2)" />
      <ellipse cx="30" cy="14" rx="6" ry="4" fill="url(#otherGrad2)" />
      <circle cx="24" cy="16" r="3" fill="#D35400" />
      
      {/* Ribbon tails */}
      <path d="M18 14 Q14 8 10 10" stroke="url(#otherGrad2)" strokeWidth="3" fill="none" strokeLinecap="round" />
      <path d="M30 14 Q34 8 38 10" stroke="url(#otherGrad2)" strokeWidth="3" fill="none" strokeLinecap="round" />
    </g>
    
    {/* Sparkles */}
    <path d="M42 20 L43 22 L45 21 L43 22.5 L44 25 L42.5 23 L40 24 L42 22 Z" fill="#FFD93D" />
    <path d="M6 22 L7 24 L9 23 L7 24.5 L8 27 L6.5 25 L4 26 L6 24 Z" fill="#4D96FF" />
  </svg>
);

// Export mapping for easy use
export const partyTypeIcons: Record<string, React.FC<IconProps>> = {
  birthday: BirthdayCakeIcon,
  party: PartyPopperIcon,
  bbq: BBQIcon,
  wedding: WeddingIcon,
  newyear: NewYearIcon,
  corporate: CorporateIcon,
  other: OtherPartyIcon,
};
