import React, { useState, useEffect, useRef } from 'react';
import QRCode from 'qrcode';
import { useWeb3 } from '../context/Web3Context';
import { useLiveFeed } from '../hooks/useLiveFeed';
import { useTicketProof } from '../hooks/useTicketProof';
import { EventControlPanel } from '../components/EventControlPanel';

interface DashboardProps {
  activePane?: 'ticket' | 'arena';
  setCurrentTab: (tab: string) => void;
}

// ─────────────────────────────────────────────────────────────
// QR Canvas Component
// ─────────────────────────────────────────────────────────────
const QRCanvas: React.FC<{ value: string }> = ({ value }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!canvasRef.current || !value) return;
    QRCode.toCanvas(canvasRef.current, value, {
      width: 200,
      margin: 2,
      color: { dark: '#0A0A0F', light: '#FFFFFF' },
      errorCorrectionLevel: 'H',
    }).catch(console.error);
  }, [value]);

  return (
    <canvas
      ref={canvasRef}
      style={{ borderRadius: '12px', boxShadow: '0 4px 20px rgba(15,15,17,0.12)' }}
    />
  );
};

// ─────────────────────────────────────────────────────────────
// Countdown Ring Component
// ─────────────────────────────────────────────────────────────
const CountdownRing: React.FC<{ seconds: number; total: number }> = ({ seconds, total }) => {
  const radius = 52;
  const circumference = 2 * Math.PI * radius;
  const progress = (seconds / total) * circumference;

  return (
    <svg width="120" height="120" style={{ position: 'absolute', top: -12, left: -12, zIndex: 2, pointerEvents: 'none' }}>
      <circle
        cx="60" cy="60" r={radius}
        fill="none"
        stroke="rgba(24,104,255,0.12)"
        strokeWidth="5"
      />
      <circle
        cx="60" cy="60" r={radius}
        fill="none"
        stroke="url(#ring-gradient)"
        strokeWidth="5"
        strokeLinecap="round"
        strokeDasharray={`${progress} ${circumference}`}
        transform="rotate(-90 60 60)"
        style={{ transition: 'stroke-dasharray 0.95s linear' }}
      />
      <defs>
        <linearGradient id="ring-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#1868FF" />
          <stop offset="100%" stopColor="#60A5FA" />
        </linearGradient>
      </defs>
      <text x="60" y="60" textAnchor="middle" dominantBaseline="central"
        style={{ fontSize: '1rem', fontWeight: 700, fontFamily: 'var(--font-family-display)', fill: 'var(--color-primary)' }}>
        {seconds}s
      </text>
    </svg>
  );
};

// ─────────────────────────────────────────────────────────────
// Main Dashboard Component
// ─────────────────────────────────────────────────────────────
export const Dashboard: React.FC<DashboardProps> = ({ activePane = 'ticket', setCurrentTab }) => {
  const {
    walletAddress, isConnected, connectWallet,
    ticketTokenId, ticketSeat, ticketEventId,
    isCheckedIn, isVictoryEdition,
    setCheckedIn, setVictoryEdition,
  } = useWeb3();

  const { feed, loading: feedLoading, error: feedError } = useLiveFeed();
  const { proof, secondsRemaining, loading: proofLoading, isActive: qrActive, requestProof, stopProof } = useTicketProof(ticketTokenId, walletAddress);

  const [activeTab, setActiveTab] = useState<'ticket' | 'arena'>(activePane);
  const [showVictoryModal, setShowVictoryModal] = useState(false);
  const [goalFlash, setGoalFlash] = useState(false);
  const prevRecentEvent = useRef<string | null>(null);

  // Watch for live feed events
  useEffect(() => {
    if (!feed) return;
    const prev = prevRecentEvent.current;
    const curr = feed.recentEvent;

    if (curr !== prev) {
      if (curr === 'GOAL') {
        setGoalFlash(true);
        setTimeout(() => setGoalFlash(false), 2200);
      }
      if (curr === 'MATCH_END_WIN') {
        setVictoryEdition();
        setTimeout(() => setShowVictoryModal(true), 400);
      }
      prevRecentEvent.current = curr;
    }
  }, [feed?.recentEvent, setVictoryEdition]);

  // Tab sync with prop
  useEffect(() => {
    setActiveTab(activePane);
  }, [activePane]);

  const hasTicket = !!ticketTokenId;

  // ── Status badge helper ──────────────────────────────────
  const getStatusBadge = () => {
    if (isVictoryEdition) return { label: '🏆 Victory Edition', color: '#F59E0B', bg: 'rgba(245,158,11,0.1)', border: 'rgba(245,158,11,0.35)' };
    if (isCheckedIn) return { label: '✅ Checked In', color: 'var(--color-success)', bg: 'var(--color-success-bg)', border: 'rgba(16,185,129,0.3)' };
    return { label: '🎫 Active · Unused', color: '#F59E0B', bg: 'rgba(245,158,11,0.08)', border: 'rgba(245,158,11,0.25)' };
  };

  const badge = getStatusBadge();

  // ─────────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────────
  return (
    <div style={{ flex: 1, paddingBottom: '3rem' }}>

      {/* ── Goal Flash Overlay ── */}
      {goalFlash && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 2000, pointerEvents: 'none',
          background: 'radial-gradient(ellipse at center, rgba(245,158,11,0.25) 0%, transparent 70%)',
          animation: 'goal-flash 2.2s ease-out forwards',
        }} />
      )}

      {/* ── Victory Modal ── */}
      {showVictoryModal && (
        <div
          onClick={() => setShowVictoryModal(false)}
          style={{
            position: 'fixed', inset: 0, zIndex: 1500,
            background: 'rgba(10,10,15,0.7)',
            backdropFilter: 'blur(10px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: '1.5rem',
          }}
        >
          <div className="glass-panel" style={{
            maxWidth: '440px', width: '100%', padding: '2.5rem', textAlign: 'center',
            background: 'linear-gradient(135deg, rgba(255,255,255,0.98) 0%, rgba(254,252,232,0.98) 100%)',
            border: '2px solid rgba(245,158,11,0.35)',
            boxShadow: '0 0 0 1px rgba(245,158,11,0.2), 0 24px 64px rgba(245,158,11,0.2), var(--shadow-lg)',
            animation: 'bounce-in 0.5s cubic-bezier(0.34,1.56,0.64,1)',
          }}>
            <div style={{ fontSize: '4rem', marginBottom: '1rem', animation: 'float 3s ease-in-out infinite' }}>🏆</div>
            <h2 style={{ fontSize: '1.75rem', color: '#92400E', marginBottom: '0.5rem' }}>VICTORY DETECTED!</h2>
            <p style={{ color: '#A16207', fontFamily: 'var(--font-family-body)', fontSize: '1rem', marginBottom: '0.5rem' }}>
              Argentina Won! Your Fan Pass has upgraded!
            </p>
            <p style={{ color: '#B45309', fontFamily: 'var(--font-family-body)', fontSize: '0.875rem', marginBottom: '1.75rem' }}>
              Your NFT ticket has transformed into a<br />
              <strong>Gold Victory Edition</strong> collectible. 🎉
            </p>
            <button
              onClick={() => setShowVictoryModal(false)}
              style={{
                padding: '0.75rem 2rem', borderRadius: 'var(--radius-pill)',
                background: 'linear-gradient(135deg, #F59E0B, #D97706)',
                color: '#fff', fontWeight: 700, fontSize: '1rem',
                fontFamily: 'var(--font-family-display)', cursor: 'pointer',
                border: 'none', boxShadow: '0 4px 16px rgba(245,158,11,0.4)',
                letterSpacing: '0.05em',
              }}
            >
              VIEW MY GOLD TICKET ✨
            </button>
          </div>
        </div>
      )}

      {/* ── Header / Status Bar ── */}
      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 1.5rem', marginTop: '1rem' }}>
        <div className="glass-panel" style={{
          padding: '0.875rem 1.5rem',
          display: 'flex', flexWrap: 'wrap',
          justifyContent: 'space-between', alignItems: 'center', gap: '1rem',
          borderRadius: '16px',
        }}>
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
            <div className="status-indicator" style={{ color: feedError ? 'var(--color-warning)' : 'var(--color-success)', background: feedError ? 'var(--color-warning-bg)' : 'var(--color-success-bg)' }}>
              <span className="status-dot active" />
              Arena Feed: {feedError ? 'Demo Mode' : 'Live'}
            </div>
            <div className="status-indicator" style={{ color: 'var(--color-success)', background: 'var(--color-success-bg)' }}>
              <span className="status-dot active" />
              AI Agent: Active
            </div>
            <div className="status-indicator" style={{ color: 'var(--color-success)', background: 'var(--color-success-bg)' }}>
              <span className="status-dot active" />
              Contract Sync: Online
            </div>
          </div>
          {/* Pane tabs */}
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            {(['ticket', 'arena'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                style={{
                  padding: '0.4rem 1rem', borderRadius: 'var(--radius-pill)',
                  border: 'none', cursor: 'pointer', fontWeight: 600,
                  fontSize: '0.82rem', fontFamily: 'var(--font-family-body)',
                  transition: 'all var(--transition-fast)',
                  background: activeTab === tab
                    ? 'linear-gradient(135deg, #1868FF, #3B82F6)'
                    : 'rgba(15,15,17,0.05)',
                  color: activeTab === tab ? '#fff' : 'var(--color-text-secondary)',
                }}
              >
                {tab === 'ticket' ? '🎫 My Ticket' : '📡 Arena Feed'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Two-Pane Dashboard Grid ── */}
      <div className="dashboard-grid" style={{ marginTop: '1.25rem' }}>

        {/* ════════════════════════════════════
            LEFT PANE — Digital Pass / NFT Ticket
        ════════════════════════════════════ */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

          {/* Not connected */}
          {!isConnected && (
            <div className="glass-panel" style={{ padding: '2.5rem', textAlign: 'center' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔐</div>
              <h3 style={{ marginBottom: '0.75rem', fontSize: '1.35rem' }}>Connect Your Wallet</h3>
              <p style={{ color: 'var(--color-text-muted)', fontFamily: 'var(--font-family-body)', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
                Connect your wallet to view and manage your InjPass NFT ticket.
              </p>
              <button
                onClick={connectWallet}
                style={{
                  padding: '0.75rem 2rem', borderRadius: 'var(--radius-pill)',
                  background: 'var(--color-primary-gradient)', color: '#fff',
                  fontWeight: 700, fontSize: '0.95rem', cursor: 'pointer',
                  border: 'none', boxShadow: '0 4px 16px rgba(24,104,255,0.3)',
                }}
              >
                Connect Wallet
              </button>
            </div>
          )}

          {/* No ticket purchased yet */}
          {isConnected && !hasTicket && (
            <div className="glass-panel" style={{ padding: '2.5rem', textAlign: 'center' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🎫</div>
              <h3 style={{ marginBottom: '0.75rem', fontSize: '1.35rem' }}>No Ticket Found</h3>
              <p style={{ color: 'var(--color-text-muted)', fontFamily: 'var(--font-family-body)', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
                You haven't purchased an InjPass ticket yet. Head to the marketplace to mint yours!
              </p>
              <button
                onClick={() => setCurrentTab('home')}
                style={{
                  padding: '0.75rem 2rem', borderRadius: 'var(--radius-pill)',
                  background: 'var(--color-primary-gradient)', color: '#fff',
                  fontWeight: 700, fontSize: '0.95rem', cursor: 'pointer',
                  border: 'none', boxShadow: '0 4px 16px rgba(24,104,255,0.3)',
                }}
              >
                Buy a Ticket →
              </button>
            </div>
          )}

          {/* Ticket Card */}
          {isConnected && hasTicket && (
            <div className={`glass-panel ticket-card ${isVictoryEdition ? 'victory-edition' : ''}`} style={{
              padding: '2rem',
              background: isVictoryEdition
                ? 'linear-gradient(135deg, rgba(254,252,232,0.98) 0%, rgba(255,255,255,0.95) 50%, rgba(254,243,199,0.98) 100%)'
                : 'rgba(255,255,255,0.95)',
              border: isVictoryEdition
                ? '2px solid rgba(245,158,11,0.45)'
                : '1px solid rgba(255,255,255,0.7)',
              boxShadow: isVictoryEdition
                ? '0 0 0 1px rgba(245,158,11,0.2), 0 8px 40px rgba(245,158,11,0.2), var(--shadow-md)'
                : 'var(--shadow-md)',
            }}>
              {/* Card header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
                <div>
                  <div style={{
                    fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase',
                    letterSpacing: '0.12em', color: isVictoryEdition ? '#A16207' : 'var(--color-text-muted)',
                    marginBottom: '0.3rem',
                  }}>
                    {isVictoryEdition ? '🏆 InjPass · Gold Victory Edition' : 'InjPass · Digital Fan Ticket'}
                  </div>
                  <h3 style={{ fontSize: '1.4rem', color: 'var(--color-text-primary)', margin: 0 }}>
                    Argentina vs France
                  </h3>
                </div>
                <span style={{
                  padding: '0.3rem 0.85rem', borderRadius: 'var(--radius-pill)',
                  fontSize: '0.78rem', fontWeight: 700,
                  color: badge.color, background: badge.bg, border: `1px solid ${badge.border}`,
                  animation: 'pulse-glow 2s infinite alternate',
                  fontFamily: 'var(--font-family-body)',
                }}>
                  {badge.label}
                </span>
              </div>

              {/* Ticket info grid */}
              <div style={{
                display: 'grid', gridTemplateColumns: '1fr 1fr',
                gap: '1rem', padding: '1.25rem',
                background: isVictoryEdition ? 'rgba(245,158,11,0.06)' : 'rgba(24,104,255,0.04)',
                borderRadius: '14px',
                border: isVictoryEdition ? '1px solid rgba(245,158,11,0.15)' : '1px solid rgba(24,104,255,0.1)',
                marginBottom: '1.5rem',
              }}>
                {[
                  ['Token ID', `#${ticketTokenId}`],
                  ['Event ID', ticketEventId],
                  ['Seat', `#${ticketSeat}`],
                  ['Status', isCheckedIn ? 'Validated ✓' : isVictoryEdition ? 'Victory Edition' : 'Unused'],
                ].map(([label, value]) => (
                  <div key={label}>
                    <div style={{ fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--color-text-muted)', marginBottom: '0.25rem' }}>{label}</div>
                    <div style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--color-text-primary)', fontFamily: 'var(--font-family-body)' }}>{value}</div>
                  </div>
                ))}
              </div>

              {/* Victory score lock-in */}
              {isVictoryEdition && (
                <div style={{
                  padding: '0.875rem 1.25rem', borderRadius: '12px',
                  background: 'linear-gradient(135deg, rgba(245,158,11,0.12), rgba(217,119,6,0.08))',
                  border: '1px solid rgba(245,158,11,0.3)',
                  marginBottom: '1.5rem', textAlign: 'center',
                }}>
                  <div style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#A16207', marginBottom: '0.3rem' }}>
                    Final Score · Locked On-Chain
                  </div>
                  <div className="data-value" style={{ fontSize: '1.5rem', color: '#D97706' }}>
                    {feed?.score || 'Argentina 3 - 1 France'}
                  </div>
                </div>
              )}

              {/* QR Code section */}
              {!qrActive ? (
                <button
                  id="get-turnstile-btn"
                  onClick={requestProof}
                  disabled={proofLoading}
                  style={{
                    width: '100%', padding: '1rem',
                    borderRadius: '14px',
                    background: 'linear-gradient(135deg, #1868FF 0%, #3B82F6 100%)',
                    color: '#fff', fontWeight: 700, fontSize: '1rem',
                    fontFamily: 'var(--font-family-display)', cursor: 'pointer',
                    border: 'none', letterSpacing: '0.04em',
                    boxShadow: '0 4px 20px rgba(24,104,255,0.35)',
                    transition: 'all var(--transition-fast)',
                    opacity: proofLoading ? 0.7 : 1,
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 28px rgba(24,104,255,0.45)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 20px rgba(24,104,255,0.35)'; }}
                >
                  {proofLoading ? '⏳ Requesting Pass...' : '🔐 Get Turnstile Access'}
                </button>
              ) : (
                /* QR Code display */
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--color-text-muted)', marginBottom: '1rem' }}>
                    Turnstile QR Code · Rotate in {secondsRemaining}s
                  </div>

                  {/* QR + countdown ring */}
                  <div style={{ position: 'relative', display: 'inline-block', margin: '0 auto' }}>
                    <CountdownRing seconds={secondsRemaining} total={15} />
                    <div style={{ padding: '4px', background: '#fff', borderRadius: '12px', display: 'inline-block' }}>
                      {proof ? (
                        <QRCanvas value={`injpass://proof/${proof.proofToken}`} />
                      ) : (
                        <div style={{
                          width: '200px', height: '200px', display: 'flex',
                          alignItems: 'center', justifyContent: 'center',
                          background: '#f5f5f8', borderRadius: '12px',
                          color: 'var(--color-text-muted)', fontSize: '0.85rem',
                        }}>
                          Loading QR...
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Match context */}
                  {proof?.matchContext && (
                    <div style={{ marginTop: '0.875rem', fontSize: '0.82rem', fontWeight: 600, color: 'var(--color-text-secondary)', fontFamily: 'var(--font-family-body)' }}>
                      🏟 {proof.matchContext}
                    </div>
                  )}

                  {/* Simulate checked-in (demo) */}
                  {!isCheckedIn && (
                    <button
                      onClick={() => { setCheckedIn(); stopProof(); }}
                      style={{
                        marginTop: '1rem', padding: '0.6rem 1.5rem',
                        borderRadius: 'var(--radius-pill)',
                        background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.25)',
                        color: 'var(--color-success)', fontWeight: 700, fontSize: '0.82rem',
                        cursor: 'pointer', fontFamily: 'var(--font-family-body)',
                        transition: 'all var(--transition-fast)',
                      }}
                    >
                      ✅ Simulate: Turnstile Scan
                    </button>
                  )}

                  <button
                    onClick={stopProof}
                    style={{
                      display: 'block', margin: '0.75rem auto 0',
                      background: 'none', border: 'none',
                      fontSize: '0.8rem', color: 'var(--color-text-muted)',
                      cursor: 'pointer', fontFamily: 'var(--font-family-body)',
                    }}
                  >
                    ✕ Close QR
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* ════════════════════════════════════
            RIGHT PANE — Live Arena Feed
        ════════════════════════════════════ */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

          {/* Live Scorecard */}
          <div className="glass-panel" style={{ padding: '1.75rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <div>
                <h3 style={{ fontSize: '1.1rem', color: 'var(--color-text-primary)', marginBottom: '0.15rem' }}>Live Scorecard</h3>
                <p style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)', fontFamily: 'var(--font-family-body)' }}>
                  {feed?.eventId || 'WC2026-FIN'} · Polling every 8s
                </p>
              </div>
              <span className="badge-live">LIVE</span>
            </div>

            {/* Score display */}
            <div style={{
              padding: '1.5rem 1rem', borderRadius: '16px',
              background: isVictoryEdition
                ? 'linear-gradient(135deg, rgba(245,158,11,0.08), rgba(217,119,6,0.05))'
                : 'linear-gradient(135deg, rgba(24,104,255,0.05), rgba(59,130,246,0.03))',
              border: isVictoryEdition ? '1px solid rgba(245,158,11,0.2)' : '1px solid rgba(24,104,255,0.1)',
              textAlign: 'center', marginBottom: '1.25rem',
            }}>
              {feedLoading ? (
                <div style={{ color: 'var(--color-text-muted)', fontFamily: 'var(--font-family-body)', fontSize: '0.9rem' }}>Loading...</div>
              ) : (
                <>
                  <div className="data-value" style={{
                    fontSize: '1.6rem', marginBottom: '0.5rem',
                    color: isVictoryEdition ? '#D97706' : 'var(--color-text-primary)',
                  }}>
                    {feed?.score || 'Argentina 2 - 1 France'}
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--color-primary)', fontFamily: 'var(--font-family-body)' }}>
                      ⏱ {feed?.minute ?? 72}'
                    </span>
                    <span style={{
                      fontSize: '0.78rem', fontWeight: 700, padding: '0.2rem 0.65rem',
                      borderRadius: 'var(--radius-pill)',
                      color: feed?.recentEvent === 'MATCH_END_WIN' ? '#D97706' : feed?.recentEvent === 'GOAL' ? '#F59E0B' : 'var(--color-success)',
                      background: feed?.recentEvent === 'MATCH_END_WIN' ? 'rgba(245,158,11,0.1)' : feed?.recentEvent === 'GOAL' ? 'rgba(245,158,11,0.08)' : 'var(--color-success-bg)',
                      border: `1px solid ${feed?.recentEvent === 'MATCH_END_WIN' ? 'rgba(245,158,11,0.3)' : feed?.recentEvent === 'GOAL' ? 'rgba(245,158,11,0.25)' : 'rgba(16,185,129,0.25)'}`,
                      fontFamily: 'var(--font-family-body)',
                    }}>
                      {feed?.recentEvent === 'MATCH_END_WIN' ? '🏆 Match End · WIN' : feed?.recentEvent === 'GOAL' ? '⚽ GOAL!' : '● Match Active'}
                    </span>
                  </div>
                </>
              )}
            </div>

            {/* Team mini cards */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              {[
                { flag: '🇦🇷', name: 'Argentina', color: '#1868FF' },
                { flag: '🇫🇷', name: 'France', color: '#1E3A8A' },
              ].map((team) => (
                <div key={team.name} style={{
                  padding: '0.875rem', borderRadius: '12px',
                  background: 'rgba(15,15,17,0.02)', border: '1px solid var(--color-border)',
                  textAlign: 'center',
                }}>
                  <div style={{ fontSize: '1.5rem', marginBottom: '0.35rem' }}>{team.flag}</div>
                  <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--color-text-primary)', fontFamily: 'var(--font-family-display)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    {team.name}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Arena Info Card */}
          <div className="glass-panel" style={{ padding: '1.75rem' }}>
            <h3 style={{ fontSize: '1.05rem', marginBottom: '1rem', color: 'var(--color-text-primary)' }}>
              📋 Match Information
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {[
                { label: 'Fixture', value: 'Argentina vs France' },
                { label: 'Competition', value: 'FIFA World Cup 2026 Final' },
                { label: 'Venue', value: 'MetLife Stadium, NJ' },
                { label: 'Event ID', value: 'WC2026-FIN' },
                { label: 'Contract', value: 'InjPassCollectible.sol' },
                { label: 'Agent Status', value: '🤖 Active · Monitoring' },
              ].map(({ label, value }) => (
                <div key={label} style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  padding: '0.6rem 0', borderBottom: '1px solid rgba(15,15,17,0.04)',
                }}>
                  <span style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)', fontFamily: 'var(--font-family-body)', fontWeight: 600 }}>{label}</span>
                  <span style={{ fontSize: '0.82rem', color: 'var(--color-text-secondary)', fontFamily: 'var(--font-family-body)', fontWeight: 700 }}>{value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Simulate Victory (demo) */}
          <div className="glass-panel" style={{ padding: '1.5rem' }}>
            <h3 style={{ fontSize: '0.95rem', marginBottom: '0.75rem', color: 'var(--color-text-primary)' }}>
              ⚙️ Demo Controls
            </h3>
            <p style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)', fontFamily: 'var(--font-family-body)', marginBottom: '1rem' }}>
              Simulate contract events for demonstration purposes.
            </p>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              <button
                onClick={() => setVictoryEdition()}
                style={{
                  padding: '0.5rem 1rem', borderRadius: 'var(--radius-pill)', cursor: 'pointer',
                  background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.3)',
                  color: '#D97706', fontWeight: 700, fontSize: '0.8rem',
                  fontFamily: 'var(--font-family-body)', transition: 'all var(--transition-fast)',
                }}
              >
                🏆 Simulate Victory Upgrade
              </button>
              <button
                onClick={() => setCheckedIn()}
                style={{
                  padding: '0.5rem 1rem', borderRadius: 'var(--radius-pill)', cursor: 'pointer',
                  background: 'var(--color-success-bg)', border: '1px solid rgba(16,185,129,0.3)',
                  color: 'var(--color-success)', fontWeight: 700, fontSize: '0.8rem',
                  fontFamily: 'var(--font-family-body)', transition: 'all var(--transition-fast)',
                }}
              >
                ✅ Simulate Check-In
              </button>
            </div>
          </div>

          {/* Event Control & Deployment Panel */}
          <EventControlPanel compact />
        </div>
      </div>
    </div>
  );
};