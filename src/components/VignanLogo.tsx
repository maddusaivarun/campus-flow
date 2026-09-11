import React from 'react';

interface VignanLogoProps {
  className?: string;
  variant?: 'full' | 'crest-only' | 'badge';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
}

export const VignanLogo: React.FC<VignanLogoProps> = ({
  className = '',
  variant = 'full',
  size = 'md',
  showText = true
}) => {
  const sizeStyles = {
    sm: 'h-8',
    md: 'h-11',
    lg: 'h-14',
    xl: 'h-18'
  };

  const isCrestOnly = variant === 'crest-only' || showText === false;

  if (isCrestOnly) {
    return (
      <div className={`inline-flex items-center justify-center shrink-0 ${className}`}>
        <svg
          viewBox="0 0 100 110"
          className={sizeStyles[size]}
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Shield Outer Boundary */}
          <path
            d="M 14 10 L 86 10 Q 90 10 90 14 L 90 48 C 90 78, 56 96, 50 100 C 44 96, 10 78, 10 48 L 10 14 Q 10 10 14 10 Z"
            fill="#A8B4FC"
            stroke="#5B67EC"
            strokeWidth="4"
            strokeLinejoin="round"
          />
          {/* Inner Shield Rim */}
          <path
            d="M 18 14 L 82 14 C 82 46, 76 74, 50 94 C 24 74, 18 46, 18 14 Z"
            fill="#B5C0FE"
          />
          {/* Central Wheel */}
          <g transform="translate(50, 48)">
            <circle cx="0" cy="0" r="24" fill="none" stroke="#0263C7" strokeWidth="4.5" />
            <line x1="0" y1="0" x2="-14.1" y2="-19.4" stroke="#0263C7" strokeWidth="4.5" strokeLinecap="round" />
            <line x1="0" y1="0" x2="14.1" y2="-19.4" stroke="#0263C7" strokeWidth="4.5" strokeLinecap="round" />
            <line x1="0" y1="0" x2="0" y2="24" stroke="#0263C7" strokeWidth="4.5" strokeLinecap="round" />
            <line x1="0" y1="0" x2="-22.8" y2="7.4" stroke="#0263C7" strokeWidth="4.5" strokeLinecap="round" />
            <line x1="0" y1="0" x2="22.8" y2="7.4" stroke="#0263C7" strokeWidth="4.5" strokeLinecap="round" />
            <circle cx="0" cy="0" r="10" fill="#0263C7" />
            <polygon
              points="0,-6.5 1.9,-2 6.5,-1.4 3.1,1.8 4,6.4 0,4.1 -4,6.4 -3.1,1.8 -6.5,-1.4 -1.9,-2"
              fill="#FFFFFF"
            />
          </g>
        </svg>
      </div>
    );
  }

  // Full official institutional banner representation (exact match to official university brand)
  return (
    <div className={`inline-block bg-white rounded-md p-1 shadow-2xs ${className}`}>
      <img
        src="/vignan-logo.svg"
        alt="VIGNAN'S Foundation for Science, Technology & Research (Deemed to be University)"
        className={`${sizeStyles[size]} w-auto object-contain`}
      />
    </div>
  );
};
