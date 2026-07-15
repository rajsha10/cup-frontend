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
  // Base button styling classes using pure CSS variables
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
    whiteSpace: 'nowrap',
    userSelect: 'none',
  } as React.CSSProperties;

  // Sizes styles
  const sizeStyles = {
    sm: { padding: '0.5rem 1.25rem', fontSize: '0.875rem' },
    md: { padding: '0.75rem 1.75rem', fontSize: '1rem' },
    lg: { padding: '1rem 2.25rem', fontSize: '1.125rem' },
  }[size];

  // Variants styles
  const variantStyles = {
    primary: {
      backgroundColor: 'var(--color-primary)',
      color: 'var(--color-surface)',
      boxShadow: 'var(--shadow-sm)',
    },
    secondary: {
      backgroundColor: 'var(--color-text-primary)',
      color: 'var(--color-surface)',
      boxShadow: 'var(--shadow-sm)',
    },
    outline: {
      backgroundColor: 'transparent',
      color: 'var(--color-text-primary)',
      border: '1px solid var(--color-border)',
    },
    ghost: {
      backgroundColor: 'transparent',
      color: 'var(--color-text-secondary)',
    },
  }[variant];

  // Hover states using JS events for robustness, alongside CSS classes
  const [isHovered, setIsHovered] = React.useState(false);
  
  const hoverStyles = isHovered && !props.disabled ? {
    primary: { backgroundColor: 'var(--color-primary-hover)', transform: 'translateY(-1px)' },
    secondary: { backgroundColor: 'rgba(15, 15, 17, 0.9)', transform: 'translateY(-1px)' },
    outline: { borderColor: 'var(--color-text-primary)', backgroundColor: 'rgba(15, 15, 17, 0.02)', transform: 'translateY(-1px)' },
    ghost: { backgroundColor: 'rgba(15, 15, 17, 0.04)', color: 'var(--color-text-primary)' },
  }[variant] : {};

  const disabledStyles = props.disabled ? {
    opacity: 0.5,
    cursor: 'not-allowed',
    transform: 'none',
  } : {};

  const combinedStyles = {
    ...baseStyle,
    ...sizeStyles,
    ...variantStyles,
    ...hoverStyles,
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
