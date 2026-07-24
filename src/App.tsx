import { useState } from 'react';
import { Web3Provider } from './context/Web3Context';
import { Navbar } from './components/Navbar';
import { Home } from './pages/Home';
import { Dashboard } from './pages/Dashboard';
import { ValidatorDemo } from './pages/ValidatorDemo';
import { Contact } from './pages/Contact';

type Tab = 'home' | 'ticket' | 'validator' | 'admin';

function AppContent() {
  const [currentTab, setCurrentTab] = useState<Tab>('home');

  // Wrapper that casts string → Tab so child components typed as
  // (tab: string) => void remain compatible without changing their prop types.
  const navigate = (tab: string) => setCurrentTab(tab as Tab);

  const renderContent = () => {
    switch (currentTab) {
      case 'home':
        return <Home setCurrentTab={navigate} />;
      case 'ticket':
        return <Dashboard activePane="ticket" setCurrentTab={navigate} />;
      case 'validator':
        return <ValidatorDemo setCurrentTab={navigate} />;
      case 'admin':
        return <Contact />;
      default:
        return <Home setCurrentTab={navigate} />;
    }
  };

  return (
    <>
      <Navbar currentTab={currentTab} setCurrentTab={navigate} />
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {renderContent()}
      </main>

      <footer style={{
        borderTop: '1px solid var(--color-border)',
        background: 'rgba(255,255,255,0.65)',
        backdropFilter: 'blur(12px)',
        padding: '1.75rem 1.5rem',
        marginTop: 'auto',
        fontFamily: 'var(--font-family-body)',
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            {/* InjPass Logo Mark */}
            <svg width="20" height="20" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <linearGradient id="foot-logo-bg" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
                  <stop offset="0%" stopColor="#0A0A0F" /><stop offset="100%" stopColor="#1A1A2E" />
                </linearGradient>
                <linearGradient id="foot-logo-blue" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#1868FF" /><stop offset="100%" stopColor="#3B82F6" />
                </linearGradient>
              </defs>
              <rect width="32" height="32" rx="10" fill="url(#foot-logo-bg)" />
              <circle cx="16" cy="11" r="5.5" fill="url(#foot-logo-blue)" />
              <circle cx="16" cy="21" r="5.5" fill="rgba(255,255,255,0.18)" />
            </svg>
            <span style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)', fontWeight: 500 }}>
              © 2026 InjPass — Web3 Stadium Ticketing on Injective Protocol.
            </span>
          </div>
          <div style={{ display: 'flex', gap: '1.5rem' }}>
            {[
              { label: 'How It Works', action: () => setCurrentTab('home' as Tab) },
              { label: 'Turnstile Demo', action: () => setCurrentTab('validator' as Tab) },
              { label: 'Admin Panel', action: () => setCurrentTab('admin' as Tab) },
            ].map((item) => (
              <span
                key={item.label}
                style={{
                  cursor: 'pointer',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  color: 'var(--color-text-secondary)',
                  transition: 'color var(--transition-fast)',
                }}
                onClick={item.action}
                onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--color-primary)')}
                onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--color-text-secondary)')}
              >
                {item.label}
              </span>
            ))}
            <a
              href="https://injective.com"
              target="_blank"
              rel="noreferrer"
              style={{
                fontSize: '0.85rem',
                fontWeight: 600,
                color: 'var(--color-text-secondary)',
                transition: 'color var(--transition-fast)',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--color-primary)')}
              onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--color-text-secondary)')}
            >
              Injective Docs ↗
            </a>
          </div>
        </div>
      </footer>
    </>
  );
}

function App() {
  return (
    <Web3Provider>
      <AppContent />
    </Web3Provider>
  );
}

export default App;