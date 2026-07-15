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
        padding: '1.75rem 2rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '1.25rem',
        ...style
      }}
    >
      {/* Top accent line */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: '2rem',
        right: '2rem',
        height: '2px',
        background: 'linear-gradient(90deg, #1868FF 0%, #3B82F6 60%, transparent 100%)',
        borderRadius: '0 0 2px 2px',
        opacity: 0.5,
        pointerEvents: 'none',
      }} />

      {(title || subtitle || headerAction || badge) && (
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          gap: '1rem',
          borderBottom: title ? '1px solid var(--color-border)' : 'none',
          paddingBottom: title ? '1.1rem' : '0',
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              {title && (
                <h3 style={{
                  fontSize: '1.25rem',
                  letterSpacing: '0.01em',
                  fontFamily: 'var(--font-family-display)',
                  color: 'var(--color-text-primary)',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                }}>
                  {title}
                </h3>
              )}
              {badge}
            </div>
            {subtitle && (
              <p style={{
                fontSize: '0.825rem',
                color: 'var(--color-text-muted)',
                marginTop: '0.25rem',
                fontFamily: 'var(--font-family-body)',
                fontWeight: 500,
              }}>
                {subtitle}
              </p>
            )}
          </div>
          {headerAction && (
            <div style={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}>
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