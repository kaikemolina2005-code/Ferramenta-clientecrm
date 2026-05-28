import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { designSystem } from '@/theme/designSystem';

interface TopBarProps {
  title?: string;
  subtitle?: string;
  actions?: React.ReactNode;
}

export const TopBar: React.FC<TopBarProps> = ({ 
  title = 'Dashboard',
  subtitle,
  actions 
}) => {
  const { user } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);

  return (
    <div
      className="sticky top-0 z-40 px-8 py-4 shadow-md"
      style={{
        backgroundColor: designSystem.colors.neutral.white,
        borderBottom: `2px solid ${designSystem.colors.accent.gold}`,
      }}
    >
      <div className="flex items-center justify-between">
        {/* Left Section - Title */}
        <div>
          <h1
            className="text-2xl font-bold"
            style={{ color: designSystem.colors.primary.dark }}
          >
            {title}
          </h1>
          {subtitle && (
            <p
              className="text-sm mt-1"
              style={{ color: designSystem.colors.neutral.gray500 }}
            >
              {subtitle}
            </p>
          )}
        </div>

        {/* Middle Section - Actions */}
        {actions && (
          <div className="flex items-center gap-4">
            {actions}
          </div>
        )}

        {/* Right Section - User Profile */}
        <div className="relative">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-3 px-4 py-2 rounded-lg transition-all"
            style={{
              backgroundColor: designSystem.colors.primary.lighter,
              color: designSystem.colors.primary.dark,
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.backgroundColor =
                designSystem.colors.accent.light;
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.backgroundColor =
                designSystem.colors.primary.lighter;
            }}
          >
            <div className="w-8 h-8 rounded-full flex items-center justify-center font-bold"
              style={{
                backgroundColor: designSystem.colors.accent.gold,
                color: designSystem.colors.primary.dark,
              }}
            >
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <div className="text-left hidden sm:block">
              <p className="text-sm font-semibold">{user?.name}</p>
              <p className="text-xs" style={{ color: designSystem.colors.neutral.gray500 }}>
                {user?.role}
              </p>
            </div>
            <span className="ml-2">▼</span>
          </button>

          {/* Dropdown Menu */}
          {showUserMenu && (
            <div
              className="absolute right-0 mt-2 w-48 rounded-lg shadow-lg py-2 z-50"
              style={{
                backgroundColor: designSystem.colors.neutral.white,
                border: `1px solid ${designSystem.colors.neutral.gray300}`,
              }}
            >
              <button
                className="w-full text-left px-4 py-2 hover:bg-gray-100 flex items-center gap-2"
              >
                👤 Perfil
              </button>
              <button
                className="w-full text-left px-4 py-2 hover:bg-gray-100 flex items-center gap-2"
              >
                ⚙️ Configurações
              </button>
              <button
                className="w-full text-left px-4 py-2 hover:bg-gray-100 flex items-center gap-2 border-t"
                style={{
                  borderColor: designSystem.colors.neutral.gray300,
                  color: designSystem.colors.status.error,
                }}
              >
                🚪 Sair
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Card Component com design system
export const Card: React.FC<{
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  icon?: string;
  className?: string;
  hoverable?: boolean;
  style?: React.CSSProperties;
}> = ({ children, title, subtitle, icon, className = '', hoverable = false, style = {} }) => {
  return (
    <div
      className={`rounded-lg p-6 ${hoverable ? 'cursor-pointer transition-all' : ''} ${className}`}
      style={{
        backgroundColor: designSystem.colors.neutral.white,
        border: `1px solid ${designSystem.colors.neutral.gray200}`,
        boxShadow: designSystem.shadows.md,
        ...(hoverable && {
          transform: 'translateY(0)',
          transition: 'all 0.3s ease',
        }),
        ...style,
      }}
      onMouseEnter={(e) => {
        if (hoverable) {
          (e.currentTarget as HTMLElement).style.transform = 'translateY(-4px)';
          (e.currentTarget as HTMLElement).style.boxShadow = designSystem.shadows.lg;
        }
      }}
      onMouseLeave={(e) => {
        if (hoverable) {
          (e.currentTarget as HTMLElement).style.transform = 'translateY(0)';
          (e.currentTarget as HTMLElement).style.boxShadow = designSystem.shadows.md;
        }
      }}
    >
      {(title || icon) && (
        <div className="mb-4 flex items-center gap-3">
          {icon && <span className="text-2xl">{icon}</span>}
          <div>
            {title && (
              <h3
                className="font-semibold text-lg"
                style={{ color: designSystem.colors.primary.dark }}
              >
                {title}
              </h3>
            )}
            {subtitle && (
              <p
                className="text-sm"
                style={{ color: designSystem.colors.neutral.gray500 }}
              >
                {subtitle}
              </p>
            )}
          </div>
        </div>
      )}
      {children}
    </div>
  );
};

// Button Component com design system
export const Button: React.FC<{
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'success' | 'error' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  disabled?: boolean;
  style?: React.CSSProperties;
}> = ({ 
  children, 
  onClick, 
  variant = 'primary',
  size = 'md',
  className = '',
  disabled = false,
  style = {} 
}) => {
  const sizeStyles = {
    sm: 'px-3 py-1 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
  };

  const variantStyles = {
    primary: {
      backgroundColor: designSystem.colors.primary.dark,
      color: designSystem.colors.neutral.white,
      border: 'none',
    },
    secondary: {
      backgroundColor: designSystem.colors.accent.gold,
      color: designSystem.colors.primary.dark,
      border: 'none',
    },
    success: {
      backgroundColor: designSystem.colors.status.success,
      color: designSystem.colors.neutral.white,
      border: 'none',
    },
    error: {
      backgroundColor: designSystem.colors.status.error,
      color: designSystem.colors.neutral.white,
      border: 'none',
    },
    outline: {
      backgroundColor: 'transparent',
      color: designSystem.colors.primary.dark,
      border: `2px solid ${designSystem.colors.primary.dark}`,
    },
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`rounded-lg font-semibold transition-all ${sizeStyles[size]} ${className}`}
      style={{
        ...variantStyles[variant],
        opacity: disabled ? 0.5 : 1,
        cursor: disabled ? 'not-allowed' : 'pointer',
        ...style,
      }}
      onMouseEnter={(e) => {
        if (!disabled) {
          (e.currentTarget as HTMLElement).style.opacity = '0.9';
        }
      }}
      onMouseLeave={(e) => {
        if (!disabled) {
          (e.currentTarget as HTMLElement).style.opacity = '1';
        }
      }}
    >
      {children}
    </button>
  );
};

// Badge Component
export const Badge: React.FC<{
  children: React.ReactNode;
  variant?: 'primary' | 'success' | 'warning' | 'error' | 'info';
  size?: 'sm' | 'md';
}> = ({ children, variant = 'primary', size = 'md' }) => {
  const sizeStyles = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1 text-sm',
  };

  const variantColors = {
    primary: {
      bg: designSystem.colors.primary.lighter,
      text: designSystem.colors.primary.dark,
    },
    success: {
      bg: '#d4edda',
      text: designSystem.colors.status.success,
    },
    warning: {
      bg: '#fff3cd',
      text: designSystem.colors.status.warning,
    },
    error: {
      bg: '#f8d7da',
      text: designSystem.colors.status.error,
    },
    info: {
      bg: '#d1ecf1',
      text: designSystem.colors.status.info,
    },
  };

  return (
    <span
      className={`rounded-full font-medium ${sizeStyles[size]}`}
      style={{
        backgroundColor: variantColors[variant].bg,
        color: variantColors[variant].text,
      }}
    >
      {children}
    </span>
  );
};
