import React from 'react';

interface LogoProps {
  size?: 'small' | 'medium' | 'large' | 'xlarge';
  variant?: 'full' | 'icon' | 'text';
  showText?: boolean;
  className?: string;
}

export const ADVGDLogo: React.FC<LogoProps> = ({ 
  size = 'medium', 
  variant = 'full',
  showText = true,
  className = '' 
}) => {
  const sizeMap = {
    small: 40,
    medium: 60,
    large: 80,
    xlarge: 120,
  };

  const iconSize = sizeMap[size];
  const textSize = {
    small: 12,
    medium: 16,
    large: 20,
    xlarge: 28,
  }[size];

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {/* Logo Icon */}
      {(variant === 'full' || variant === 'icon') && (
        <svg
          width={iconSize}
          height={iconSize}
          viewBox="0 0 120 120"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="drop-shadow-lg"
        >
          {/* Círculo externo */}
          <circle cx="60" cy="60" r="55" stroke="#c9a961" strokeWidth="3" fill="none" />

          {/* Decorações dos lados */}
          <path
            d="M 30 60 Q 25 50 25 60 Q 25 70 30 60"
            fill="#c9a961"
            opacity="0.8"
          />
          <path
            d="M 90 60 Q 95 50 95 60 Q 95 70 90 60"
            fill="#c9a961"
            opacity="0.8"
          />

          {/* Letras D e P estilizadas */}
          <g fill="#003f7f">
            {/* D */}
            <path
              d="M 35 40 L 35 80 Q 35 85 40 85 Q 55 85 55 62 Q 55 40 40 40 Q 35 40 35 40"
              fill="#c9a961"
              stroke="#003f7f"
              strokeWidth="2"
            />
            {/* P */}
            <path
              d="M 65 85 L 65 40 L 80 40 Q 85 40 85 45 Q 85 55 70 55 L 65 55"
              fill="none"
              stroke="#c9a961"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            {/* Círculo do P */}
            <circle cx="77" cy="50" r="8" fill="none" stroke="#c9a961" strokeWidth="2.5" />
          </g>

          {/* Decoração inferior */}
          <line x1="40" y1="90" x2="80" y2="90" stroke="#c9a961" strokeWidth="2" opacity="0.5" />
        </svg>
      )}

      {/* Logo Text */}
      {(variant === 'full' || variant === 'text') && showText && (
        <div className="flex flex-col">
          <span
            style={{
              fontSize: `${textSize}px`,
              fontWeight: 'bold',
              color: '#003f7f',
              fontFamily: '"Segoe UI", sans-serif',
              lineHeight: '1.2',
            }}
          >
            ADVGD
          </span>
          <span
            style={{
              fontSize: `${textSize * 0.6}px`,
              color: '#c9a961',
              fontFamily: '"Segoe UI", sans-serif',
              fontWeight: '500',
              letterSpacing: '2px',
            }}
          >
            CRM
          </span>
        </div>
      )}
    </div>
  );
};

// Variante com texto completo (para header)
export const ADVGDLogoDiego: React.FC<LogoProps> = ({
  size = 'medium',
  className = '',
}) => {
  const textSize = {
    small: 14,
    medium: 18,
    large: 24,
    xlarge: 32,
  }[size];

  return (
    <div className={`flex flex-col items-center gap-2 ${className}`}>
      <ADVGDLogo size={size} variant="icon" showText={false} />
      <div className="text-center">
        <h1
          style={{
            fontSize: `${textSize}px`,
            fontWeight: 'bold',
            color: '#003f7f',
            margin: 0,
            letterSpacing: '1px',
          }}
        >
          DIEGO PATRÍCIO
        </h1>
        <p
          style={{
            fontSize: `${textSize * 0.5}px`,
            color: '#c9a961',
            margin: '2px 0 0 0',
            letterSpacing: '2px',
            fontWeight: '500',
          }}
        >
          ADVOGADO
        </p>
      </div>
    </div>
  );
};
