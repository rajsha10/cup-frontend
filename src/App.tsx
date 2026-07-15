import { useState } from 'react';
import { Navbar } from './components/Navbar';
import { Home } from './pages/Home';
import { Dashboard } from './pages/Dashboard';
import { About } from './pages/About';
import { Contact } from './pages/Contact';
import { useLiveStats } from './hooks/useLiveStats';
import { useOracleLogs } from './hooks/useOracleLogs';

function App() {
  const [currentTab, setCurrentTab] = useState<string>('dashboard');
  const [walletAddress, setWalletAddress] = useState<string | null>(null);

  // Load custom telemetry and oracle event logs
  const liveStats = useLiveStats();
  const oracleLogs = useOracleLogs();

  const handleConnectWallet = () => {
    // Simulate wallet connection handshake
    setTimeout(() => {
      setWalletAddress("inj12hwzwusuejawqx2lraq4dsawsk5yvxtgfe0edx");
    }, 400);
  };

  const renderContent = () => {
    switch (currentTab) {
      case 'home':
        return <Home setCurrentTab={setCurrentTab} />;
      case 'dashboard':
        return <Dashboard liveStats={liveStats} oracleLogs={oracleLogs} />;
      case 'about':
        return <About />;
      case 'contact':
        return <Contact />;
      default:
        return <Dashboard liveStats={liveStats} oracleLogs={oracleLogs} />;
    }
  };

  return (
    <>
      {/* Floating pill navigation chrome */}
      <Navbar 
        currentTab={currentTab} 
        setCurrentTab={setCurrentTab} 
        walletAddress={walletAddress} 
        onConnectWallet={handleConnectWallet} 
      />

      {/* Primary Main Workspace View */}
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {renderContent()}
      </main>

      {/* Sports Hub Slate Footer */}
      <footer style={{ 
        borderTop: '1px solid var(--color-border)', 
        padding: '2rem 1.5rem', 
        textAlign: 'center',
        fontSize: '0.85rem',
        color: 'var(--color-text-secondary)',
        marginTop: 'auto',
        fontFamily: 'var(--font-family-body)'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            &copy; 2026 AgenticCup Platform. All rights reserved.
          </div>
          <div style={{ display: 'flex', gap: '1.5rem' }}>
            <span style={{ cursor: 'pointer' }} onClick={() => setCurrentTab('about')}>Mechanics</span>
            <span style={{ cursor: 'pointer' }} onClick={() => setCurrentTab('contact')}>Support</span>
            <a href="https://github.com/injectivedev" target="_blank" rel="noreferrer">Documentation</a>
          </div>
        </div>
      </footer>
    </>
  );
}

export default App;
