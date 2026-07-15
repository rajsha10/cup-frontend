import React from 'react';

interface CardProps {
  title?: string;
  subtitle?: string;
  headerAction?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  badge?: React.ReactNode;
}

export const Card: React.FC<CardProps> = ({
  title,
  subtitle,
  headerAction,
  children,
  className = '',
  style,
  badge,
}) => {
  return (
    <div 
      className={`glass-panel ${className}`} 
      style={{ 
        padding: '2rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '1.25rem',
        ...style 
      }}
    >
      {(title || subtitle || headerAction || badge) && (
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          gap: '1rem',
          borderBottom: title ? '1px solid var(--color-border)' : 'none',
          paddingBottom: title ? '1rem' : '0'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              {title && (
                <h3 style={{ 
                  fontSize: '1.5rem', 
                  letterSpacing: '-0.01em',
                  fontFamily: 'var(--font-family-display)',
                  color: 'var(--color-text-primary)'
                }}>
                  {title}
                </h3>
              )}
              {badge}
            </div>
            {subtitle && (
              <p style={{ 
                fontSize: '0.875rem', 
                color: 'var(--color-text-secondary)',
                marginTop: '0.25rem',
                fontFamily: 'var(--font-family-body)'
              }}>
                {subtitle}
              </p>
            )}
          </div>
          {headerAction && (
            <div style={{ display: 'flex', alignItems: 'center' }}>
              {headerAction}
            </div>
          )}
        </div>
      )}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {children}
      </div>
    </div>
  );
};
