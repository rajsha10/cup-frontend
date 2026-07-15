import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  children,
  icon,
  iconPosition = 'left',
  className = '',
  ...props
}) => {
  const [isHovered, setIsHovered] = React.useState(false);

  // Base button styling
  const baseStyle = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.5rem',
    fontWeight: 600,
    fontFamily: 'var(--font-family-body)',
    borderRadius: 'var(--radius-pill)',
    cursor: 'pointer',
    transition: 'all var(--transition-fast)',
    whiteSpace: 'nowrap' as const,
    userSelect: 'none' as const,
    letterSpacing: '0.01em',
    position: 'relative' as const,
    overflow: 'hidden' as const,
  } as React.CSSProperties;

  // Size styles
  const sizeStyles = {
    sm: { padding: '0.48rem 1.2rem', fontSize: '0.875rem' },
    md: { padding: '0.72rem 1.75rem', fontSize: '1rem' },
    lg: { padding: '0.95rem 2.25rem', fontSize: '1.1rem' },
  }[size];

  // Variant styles
  const variantStyles: Record<string, React.CSSProperties> = {
    primary: {
      background: 'linear-gradient(135deg, #1868FF 0%, #3B82F6 100%)',
      color: '#FFFFFF',
      boxShadow: '0 2px 8px rgba(24, 104, 255, 0.3), 0 1px 3px rgba(24, 104, 255, 0.15), inset 0 1px 0 rgba(255,255,255,0.15)',
      border: 'none',
    },
    secondary: {
      background: 'linear-gradient(135deg, #0A0A0F 0%, #1A1A2E 100%)',
      color: '#FFFFFF',
      boxShadow: '0 2px 8px rgba(10, 10, 15, 0.25), inset 0 1px 0 rgba(255,255,255,0.1)',
      border: 'none',
    },
    outline: {
      backgroundColor: 'rgba(255, 255, 255, 0.9)',
      color: 'var(--color-text-primary)',
      border: '1px solid var(--color-border)',
      boxShadow: '0 1px 3px rgba(15, 15, 17, 0.06)',
    },
    ghost: {
      backgroundColor: 'transparent',
      color: 'var(--color-text-secondary)',
      border: 'none',
      boxShadow: 'none',
    },
  };

  const hoverStyles: Record<string, React.CSSProperties> = isHovered && !props.disabled ? {
    primary: {
      background: 'linear-gradient(135deg, #0051D9 0%, #1868FF 100%)',
      transform: 'translateY(-2px)',
      boxShadow: '0 6px 20px rgba(24, 104, 255, 0.4), 0 2px 8px rgba(24, 104, 255, 0.2), inset 0 1px 0 rgba(255,255,255,0.2)',
    },
    secondary: {
      transform: 'translateY(-2px)',
      boxShadow: '0 6px 20px rgba(10, 10, 15, 0.35), inset 0 1px 0 rgba(255,255,255,0.15)',
    },
    outline: {
      borderColor: 'rgba(24, 104, 255, 0.4)',
      backgroundColor: 'rgba(24, 104, 255, 0.04)',
      transform: 'translateY(-1px)',
      boxShadow: '0 4px 12px rgba(24, 104, 255, 0.12)',
      color: 'var(--color-primary)',
    },
    ghost: {
      backgroundColor: 'rgba(15, 15, 17, 0.05)',
      color: 'var(--color-text-primary)',
    },
  } : { primary: {}, secondary: {}, outline: {}, ghost: {} };

  const disabledStyles: React.CSSProperties = props.disabled ? {
    opacity: 0.45,
    cursor: 'not-allowed',
    transform: 'none',
  } : {};

  const combinedStyles: React.CSSProperties = {
    ...baseStyle,
    ...sizeStyles,
    ...variantStyles[variant],
    ...(hoverStyles[variant] || {}),
    ...disabledStyles,
  };

  return (
    <button
      className={`btn-${variant} ${className}`}
      style={combinedStyles}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      {...props}
    >
      {icon && iconPosition === 'left' && <span style={{ display: 'inline-flex' }}>{icon}</span>}
      {children}
      {icon && iconPosition === 'right' && <span style={{ display: 'inline-flex' }}>{icon}</span>}
    </button>
  );
};