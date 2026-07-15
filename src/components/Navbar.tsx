import React from 'react';
import { Button } from './Button';

interface NavbarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  walletAddress: string | null;
  onConnectWallet: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  setCurrentTab,
  walletAddress,
  onConnectWallet,
}) => {
  const tabs = [
    { id: 'home', label: 'Home' },
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'about', label: 'About' },
    { id: 'contact', label: 'Contact' },
  ];

  return (
    <div className="pill-nav-container">
      <nav className="pill-nav">
        {/* Logo Section */}
        <div 
          style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }}
          onClick={() => setCurrentTab('home')}
        >
          {/* Custom SVG logo based on the reference design (4-petal dark logo) */}
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 0C18.6274 0 24 5.37258 24 12C24 18.6274 18.6274 24 12 24C5.37258 24 0 18.6274 0 12C0 5.37258 5.37258 0 12 0Z" fill="#0F0F11" />
            <path d="M12 4C14.2091 4 16 5.79086 16 8C16 10.2091 14.2091 12 12 12C9.79086 12 8 10.2091 8 8C8 5.79086 9.79086 4 12 4Z" fill="#1868FF" />
            <path d="M12 12C14.2091 12 16 13.7909 16 16C16 18.2091 14.2091 20 12 20C9.79086 20 8 18.2091 8 16C8 13.7909 9.79086 12 12 12Z" fill="#FFFFFF" fillOpacity="0.4" />
          </svg>
          <span style={{ 
            fontFamily: 'var(--font-family-display)', 
            fontSize: '1.25rem', 
            fontWeight: 700, 
            letterSpacing: '0.05em',
            color: 'var(--color-text-primary)'
          }}>
            AGENTICCUP
          </span>
        </div>

        {/* Navigation Tabs */}
        <div style={{ display: 'flex', gap: '0.25rem', alignItems: 'center' }}>
          {tabs.map((tab) => {
            const isActive = currentTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setCurrentTab(tab.id)}
                style={{
                  padding: '0.5rem 1.25rem',
                  borderRadius: 'var(--radius-pill)',
                  fontWeight: 500,
                  fontSize: '0.925rem',
                  fontFamily: 'var(--font-family-body)',
                  cursor: 'pointer',
                  transition: 'all var(--transition-fast)',
                  backgroundColor: isActive ? 'var(--color-text-primary)' : 'transparent',
                  color: isActive ? 'var(--color-surface)' : 'var(--color-text-secondary)',
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.color = 'var(--color-text-primary)';
                    e.currentTarget.style.backgroundColor = 'rgba(15, 15, 17, 0.04)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.color = 'var(--color-text-secondary)';
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }
                }}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Connect Wallet / Sign In */}
        <div>
          {walletAddress ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div 
                className="status-indicator" 
                style={{ color: 'var(--color-success)', background: 'rgba(16, 185, 129, 0.06)' }}
              >
                <span className="status-dot active"></span>
                Connected
              </div>
              <Button 
                variant="outline" 
                size="sm"
                style={{ fontFamily: 'var(--font-family-body)', fontSize: '0.85rem' }}
              >
                {`${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`}
              </Button>
            </div>
          ) : (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={onConnectWallet}
              icon={
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 12V7H5a2 2 0 0 1 0-4h14v4" />
                  <path d="M3 5v14a2 2 0 0 0 2 2h16v-5" />
                  <path d="M18 12a2 2 0 0 0 0 4h4v-4Z" />
                </svg>
              }
            >
              Connect Wallet
            </Button>
          )}
        </div>
      </nav>
    </div>
  );
};
