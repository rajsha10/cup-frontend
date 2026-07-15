import React from 'react';
import { Button } from '../components/Button';

interface HomeProps {
  setCurrentTab: (tab: string) => void;
}

export const Home: React.FC<HomeProps> = ({ setCurrentTab }) => {
  return (
    <div style={{ flex: 1, paddingBottom: '4rem' }}>
      {/* Hero Layout Section */}
      <div style={{ 
        maxWidth: '1200px', 
        margin: '0 auto', 
        padding: '3rem 1.5rem',
        display: 'grid',
        gridTemplateColumns: '1fr',
        gap: '2rem',
        alignItems: 'center',
        position: 'relative'
      }}>
        {/* Slanted decoration background */}
        <div className="accent-stripe" style={{ position: 'absolute', top: '10%', left: '50%', transform: 'rotate(-15deg)', opacity: 0.8 }}></div>
        <div className="accent-stripe" style={{ position: 'absolute', bottom: '20%', left: '10%', transform: 'rotate(25deg)', opacity: 0.5 }}></div>

        <div style={{ zIndex: 2 }}>
          {/* Main big display titles */}
          <h1 style={{ 
            fontSize: 'clamp(3.5rem, 8vw, 7rem)', 
            lineHeight: 0.85, 
            marginBottom: '1rem',
            fontFamily: 'var(--font-family-display)'
          }}>
            PLAY WITH <br/>
            <span style={{ color: 'var(--color-primary)' }}>PASSION</span> & STATS
          </h1>
          <p style={{ 
            fontSize: '1.25rem', 
            color: 'var(--color-text-secondary)', 
            maxWidth: '540px',
            marginBottom: '2rem',
            fontFamily: 'var(--font-family-body)'
          }}>
            An autonomous, statistically-driven sports prediction and hedging platform powered by Poisson distributions, x402 micropayments, and Injective smart contracts.
          </p>

          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <Button 
              variant="primary" 
              onClick={() => setCurrentTab('dashboard')}
              icon={
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14M12 5l7 7-7 7"/>
                </svg>
              }
              iconPosition="right"
            >
              Launch Dashboard
            </Button>
            <Button variant="outline" onClick={() => setCurrentTab('about')}>
              How it works
            </Button>
          </div>
        </div>
      </div>

      {/* Stats Banner Grid (from reference layout) */}
      <div style={{ maxWidth: '1200px', margin: '2rem auto', padding: '0 1.5rem' }}>
        <div className="glass-panel" style={{ padding: 0, borderRadius: 'var(--radius-card)', overflow: 'hidden' }}>
          <div className="stats-grid-row">
            <div className="stat-cell">
              <div style={{ fontSize: '3.5rem', fontWeight: 700, fontFamily: 'var(--font-family-display)', color: 'var(--color-text-primary)' }}>
                10s
              </div>
              <div style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', fontWeight: 600, textTransform: 'uppercase' }}>
                Refresh Frequency
              </div>
            </div>
            <div className="stat-cell">
              <div style={{ fontSize: '3.5rem', fontWeight: 700, fontFamily: 'var(--font-family-display)', color: 'var(--color-primary)' }}>
                $0.01
              </div>
              <div style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', fontWeight: 600, textTransform: 'uppercase' }}>
                x402 Micropayment Rate
              </div>
            </div>
            <div className="stat-cell">
              <div style={{ fontSize: '3.5rem', fontWeight: 700, fontFamily: 'var(--font-family-display)', color: 'var(--color-text-primary)' }}>
                5x
              </div>
              <div style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', fontWeight: 600, textTransform: 'uppercase' }}>
                Hedge Leverage Target
              </div>
            </div>
            <div className="stat-cell">
              <div style={{ fontSize: '3.5rem', fontWeight: 700, fontFamily: 'var(--font-family-display)', color: 'var(--color-primary)' }}>
                98.4%
              </div>
              <div style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', fontWeight: 600, textTransform: 'uppercase' }}>
                Poisson PMF Accuracy
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Feature Section cards */}
      <div style={{ 
        maxWidth: '1200px', 
        margin: '4rem auto 0 auto', 
        padding: '0 1.5rem',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
        gap: '2rem'
      }}>
        <div className="glass-panel" style={{ padding: '2rem' }}>
          <div style={{ 
            width: '48px', 
            height: '48px', 
            borderRadius: '12px', 
            backgroundColor: 'rgba(24, 104, 255, 0.08)', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            color: 'var(--color-primary)',
            marginBottom: '1.5rem'
          }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="3" width="20" height="14" rx="2" ry="2"/>
              <line x1="8" y1="21" x2="16" y2="21"/>
              <line x1="12" y1="17" x2="12" y2="21"/>
            </svg>
          </div>
          <h3 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>Paywalled Data Oracle</h3>
          <p style={{ color: 'var(--color-text-secondary)' }}>
            Oracle endpoints monetized via x402, delivering expected goals (xG) and telemetry updates on a pay-per-request M2M billing structure.
          </p>
        </div>

        <div className="glass-panel" style={{ padding: '2rem' }}>
          <div style={{ 
            width: '48px', 
            height: '48px', 
            borderRadius: '12px', 
            backgroundColor: 'rgba(24, 104, 255, 0.08)', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            color: 'var(--color-primary)',
            marginBottom: '1.5rem'
          }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="20" x2="18" y2="10"/>
              <line x1="12" y1="20" x2="12" y2="4"/>
              <line x1="6" y1="20" x2="6" y2="14"/>
            </svg>
          </div>
          <h3 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>Poisson Distribution Model</h3>
          <p style={{ color: 'var(--color-text-secondary)' }}>
            Calculates win, draw, and loss probabilities dynamically over match progression relative to current goal advantages and xG metrics.
          </p>
        </div>

        <div className="glass-panel" style={{ padding: '2rem' }}>
          <div style={{ 
            width: '48px', 
            height: '48px', 
            borderRadius: '12px', 
            backgroundColor: 'rgba(24, 104, 255, 0.08)', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            color: 'var(--color-primary)',
            marginBottom: '1.5rem'
          }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
            </svg>
          </div>
          <h3 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>Autonomous Hedging (MCP)</h3>
          <p style={{ color: 'var(--color-text-secondary)' }}>
            Compares implied betting odds with statistical math odds and initiates leveraged perpetual hedges on the Injective Protocol chain.
          </p>
        </div>
      </div>

    </div>
  );
};
