import React, { useState } from 'react';
import { Button } from './Button';
import { useWeb3 } from '../context/Web3Context';

interface NavbarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
}

const TABS = [
  { id: 'home',      label: 'Home',           icon: '🏟' },
  { id: 'ticket',    label: 'My Ticket',      icon: '🎫' },
  { id: 'validator', label: 'Turnstile Gate', icon: '🚧' },
  { id: 'agent',     label: 'AI Fan Agent',   icon: '🤖' },
  { id: 'arena',     label: 'Arena Feed',     icon: '📡' },
  { id: 'admin',     label: 'Admin',          icon: '⚙️' },
];

export const Navbar: React.FC<NavbarProps> = ({ currentTab, setCurrentTab }) => {
  const { walletAddress, usdcBalance, isConnecting, connectWallet, disconnectWallet, truncatedAddress } = useWeb3();
  const [showBalance, setShowBalance] = useState(false);

  return (
    <div className="pill-nav-container">
      <nav className="pill-nav">
        {/* ── Logo ──────────────────────────────────── */}
        <div
          style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }}
          onClick={() => setCurrentTab('home')}
        >
          <svg width="34" height="34" viewBox="0 0 34 34" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="nav-logo-bg" x1="0" y1="0" x2="34" y2="34" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#0A0A0F" />
                <stop offset="100%" stopColor="#1A1A2E" />
              </linearGradient>
              <linearGradient id="nav-logo-blue" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#1868FF" />
                <stop offset="100%" stopColor="#60A5FA" />
              </linearGradient>
            </defs>
            <rect width="34" height="34" rx="11" fill="url(#nav-logo-bg)" />
            {/* Ticket shape */}
            <rect x="7" y="12" width="20" height="10" rx="2" fill="url(#nav-logo-blue)" opacity="0.9" />
            <circle cx="7" cy="17" r="2" fill="#0A0A0F" />
            <circle cx="27" cy="17" r="2" fill="#0A0A0F" />
            <line x1="17" y1="12" x2="17" y2="22" stroke="#0A0A0F" strokeWidth="1.5" strokeDasharray="2 2" />
          </svg>
          <div>
            <span style={{
              fontFamily: 'var(--font-family-display)',
              fontSize: '1.2rem',
              fontWeight: 700,
              letterSpacing: '0.06em',
              color: 'var(--color-text-primary)',
              userSelect: 'none',
              textTransform: 'uppercase',
            }}>
              InjPass
            </span>
            <span style={{
              display: 'block',
              fontSize: '0.6rem',
              fontWeight: 600,
              letterSpacing: '0.12em',
              color: 'var(--color-primary)',
              textTransform: 'uppercase',
              marginTop: '-2px',
              fontFamily: 'var(--font-family-body)',
            }}>
              WC2026 Finals
            </span>
          </div>
        </div>

        {/* ── Navigation Tabs ───────────────────────── */}
        <div style={{ display: 'flex', gap: '0.15rem', alignItems: 'center' }}>
          {TABS.map((tab) => {
            const isActive = currentTab === tab.id;
            return (
              <button
                key={tab.id}
                id={`nav-${tab.id}`}
                onClick={() => setCurrentTab(tab.id)}
                style={{
                  padding: '0.48rem 1.1rem',
                  borderRadius: 'var(--radius-pill)',
                  fontWeight: isActive ? 700 : 500,
                  fontSize: '0.88rem',
                  fontFamily: 'var(--font-family-body)',
                  cursor: 'pointer',
                  transition: 'all var(--transition-fast)',
                  background: isActive
                    ? 'linear-gradient(135deg, #1868FF 0%, #3B82F6 100%)'
                    : 'transparent',
                  color: isActive ? '#FFFFFF' : 'var(--color-text-secondary)',
                  boxShadow: isActive
                    ? '0 2px 12px rgba(24, 104, 255, 0.35), 0 1px 3px rgba(24, 104, 255, 0.2)'
                    : 'none',
                  border: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.color = 'var(--color-text-primary)';
                    e.currentTarget.style.backgroundColor = 'rgba(15, 15, 17, 0.05)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.color = 'var(--color-text-secondary)';
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }
                }}
              >
                <span style={{ fontSize: '0.85rem' }}>{tab.icon}</span>
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* ── Wallet Section ────────────────────────── */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          {walletAddress ? (
            <>
              {/* USDC Balance badge */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  padding: '0.3rem 0.8rem',
                  borderRadius: 'var(--radius-pill)',
                  background: 'rgba(16, 185, 129, 0.08)',
                  border: '1px solid rgba(16, 185, 129, 0.25)',
                  cursor: 'pointer',
                  transition: 'all var(--transition-fast)',
                }}
                onClick={() => setShowBalance(!showBalance)}
                title="Toggle balance visibility"
              >
                <span style={{ fontSize: '0.75rem' }}>💵</span>
                <span style={{
                  fontSize: '0.82rem',
                  fontWeight: 700,
                  color: 'var(--color-success)',
                  fontFamily: 'var(--font-family-display)',
                }}>
                  {showBalance ? `${usdcBalance.toFixed(2)} USDC` : '••••'}
                </span>
              </div>

              {/* Connected address */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <div className="status-indicator" style={{ color: 'var(--color-success)', background: 'var(--color-success-bg)' }}>
                  <span className="status-dot active" />
                  Connected
                </div>
                <button
                  onClick={disconnectWallet}
                  style={{
                    padding: '0.42rem 0.9rem',
                    borderRadius: 'var(--radius-pill)',
                    border: '1px solid var(--color-border)',
                    background: 'transparent',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    fontFamily: 'ui-monospace, monospace',
                    color: 'var(--color-text-secondary)',
                    cursor: 'pointer',
                    transition: 'all var(--transition-fast)',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = 'var(--color-error)';
                    e.currentTarget.style.color = 'var(--color-error)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = 'var(--color-border)';
                    e.currentTarget.style.color = 'var(--color-text-secondary)';
                  }}
                  title="Disconnect wallet"
                >
                  {truncatedAddress}
                </button>
              </div>
            </>
          ) : (
            <Button
              id="connect-wallet-btn"
              variant="primary"
              size="sm"
              onClick={connectWallet}
              icon={
                isConnecting ? (
                  <svg className="spin" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                    <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                  </svg>
                ) : (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 12V7H5a2 2 0 0 1 0-4h14v4" />
                    <path d="M3 5v14a2 2 0 0 0 2 2h16v-5" />
                    <path d="M18 12a2 2 0 0 0 0 4h4v-4Z" />
                  </svg>
                )
              }
            >
              {isConnecting ? 'Connecting...' : 'Connect Wallet'}
            </Button>
          )}
        </div>
      </nav>
    </div>
  );
};