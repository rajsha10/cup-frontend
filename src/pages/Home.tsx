import React, { useState } from 'react';
import { Button } from '../components/Button';
import { useWeb3 } from '../context/Web3Context';

interface HomeProps {
  setCurrentTab: (tab: string) => void;
}

interface SeatTier {
  id: string;
  name: string;
  price: number;
  description: string;
  seats: number[];
  color: string;
}

const SEAT_TIERS: SeatTier[] = [
  {
    id: 'vip',
    name: 'VIP Platinum',
    price: 50,
    description: 'Pitchside access · Priority entry · Gold NFT eligibility',
    seats: [101, 102, 103, 104, 105],
    color: '#F59E0B',
  },
  {
    id: 'cat1',
    name: 'Category 1',
    price: 20,
    description: 'Lower tier · Central view · Standard NFT ticket',
    seats: [201, 202, 203, 204, 205, 206, 207],
    color: '#1868FF',
  },
];

type PurchaseStep = 'idle' | 'select-tier' | 'select-seat' | 'confirm' | 'minting' | 'minted';

export const Home: React.FC<HomeProps> = ({ setCurrentTab }) => {
  const { isConnected, connectWallet, usdcBalance, setTicketPurchased, walletAddress } = useWeb3();

  const [purchaseStep, setPurchaseStep] = useState<PurchaseStep>('idle');
  const [selectedTier, setSelectedTier] = useState<SeatTier | null>(null);
  const [selectedSeat, setSelectedSeat] = useState<number | null>(null);
  const [mintedTokenId, setMintedTokenId] = useState<string | null>(null);

  const handleBuyPass = () => {
    if (!isConnected) {
      connectWallet();
      return;
    }
    setPurchaseStep('select-tier');
  };

  const handleSelectTier = (tier: SeatTier) => {
    setSelectedTier(tier);
    setPurchaseStep('select-seat');
  };

  const handleSelectSeat = (seat: number) => {
    setSelectedSeat(seat);
    setPurchaseStep('confirm');
  };

  const handleConfirmPurchase = async () => {
    if (!selectedTier || !selectedSeat) return;
    setPurchaseStep('minting');
    // Simulate on-chain purchaseTicket() call
    await new Promise((r) => setTimeout(r, 2200));
    const tokenId = `${Date.now()}`.slice(-4);
    setMintedTokenId(tokenId);
    setTicketPurchased(tokenId, selectedSeat);
    setPurchaseStep('minted');
  };

  const closeModal = () => {
    setPurchaseStep('idle');
    setSelectedTier(null);
    setSelectedSeat(null);
  };

  const goToDashboard = () => {
    closeModal();
    setCurrentTab('ticket');
  };

  return (
    <div style={{ flex: 1, paddingBottom: '5rem' }}>

      {/* ══════════════════════════════════════════════════
          HERO SECTION
      ══════════════════════════════════════════════════ */}
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '4rem 1.5rem 3rem',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* CSS grid background */}
        <div className="hero-grid-bg" />

        {/* Floating orbs — Argentina blue + France deep blue */}
        <div style={{
          position: 'absolute', top: '5%', right: '3%',
          width: '420px', height: '420px', borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(24,104,255,0.1) 0%, rgba(96,165,250,0.06) 40%, transparent 70%)',
          pointerEvents: 'none', zIndex: 0,
        }} />
        <div style={{
          position: 'absolute', bottom: '5%', left: '-5%',
          width: '320px', height: '320px', borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(30,58,138,0.08) 0%, transparent 70%)',
          pointerEvents: 'none', zIndex: 0,
        }} />

        {/* Argentina stripe accents */}
        <div className="accent-stripe" style={{ position: 'absolute', top: '15%', right: '22%', transform: 'rotate(-15deg)', opacity: 0.55, zIndex: 1 }} />
        <div className="accent-stripe-small" style={{ position: 'absolute', bottom: '20%', left: '5%', transform: 'rotate(25deg)', opacity: 0.4, zIndex: 1 }} />

        <div style={{ position: 'relative', zIndex: 2, display: 'grid', gridTemplateColumns: '1fr', gap: '2rem' }}>
          {/* Eyebrow */}
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
            padding: '0.35rem 0.9rem', borderRadius: 'var(--radius-pill)',
            border: '1px solid rgba(24, 104, 255, 0.25)', background: 'rgba(24, 104, 255, 0.07)',
            color: 'var(--color-primary)', fontSize: '0.8rem', fontWeight: 700,
            letterSpacing: '0.08em', textTransform: 'uppercase', width: 'fit-content',
          }}>
            <span style={{
              width: '6px', height: '6px', borderRadius: '50%',
              background: 'var(--color-primary)', display: 'inline-block',
              animation: 'pulse-glow 1.5s infinite alternate',
            }} />
            World Cup 2026 · Finals · Injective Protocol
          </div>

          {/* Headline */}
          <h1 style={{
            fontSize: 'clamp(3.5rem, 8vw, 7rem)', lineHeight: 0.9,
            fontFamily: 'var(--font-family-display)', color: 'var(--color-text-primary)',
            margin: 0,
          }}>
            YOUR TICKET<br />
            TO <span className="gradient-text">WEB3</span><br />
            HISTORY
          </h1>

          <p style={{
            fontSize: '1.15rem', color: 'var(--color-text-secondary)',
            maxWidth: '520px', fontFamily: 'var(--font-family-body)', lineHeight: 1.7,
          }}>
            InjPass mints your seat as an on-chain NFT. Gate entry is protected by an x402 micropayment rotating QR code. If your team wins, your ticket upgrades to a Gold Victory Edition — autonomously, on-chain.
          </p>

          {/* CTAs */}
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <Button
              id="hero-buy-pass-btn"
              variant="primary"
              size="lg"
              onClick={handleBuyPass}
              icon={
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              }
              iconPosition="right"
            >
              {isConnected ? 'Book Your Seat' : 'Connect Wallet to Book'}
            </Button>
            {isConnected && (
              <Button variant="outline" size="lg" onClick={() => setCurrentTab('ticket')}>
                🎫 View My Ticket
              </Button>
            )}
            {!isConnected && (
              <Button variant="outline" size="lg" onClick={() => setCurrentTab('ticket')}>
                Watch Live Feed
              </Button>
            )}
          </div>

          {/* Wallet status note */}
          {!isConnected && (
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
              fontSize: '0.82rem', color: 'var(--color-text-muted)',
              fontFamily: 'var(--font-family-body)',
            }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <circle cx="12" cy="12" r="10" /><path d="M12 16v-4M12 8h.01" />
              </svg>
              Match cards are in preview mode until wallet connected
            </div>
          )}
        </div>
      </div>

      {/* ══════════════════════════════════════════════════
          STATS BANNER
      ══════════════════════════════════════════════════ */}
      <div style={{ maxWidth: '1200px', margin: '0 auto 1rem', padding: '0 1.5rem' }}>
        <div className="glass-panel" style={{ padding: 0, borderRadius: 'var(--radius-card)', overflow: 'hidden' }}>
          <div className="stats-grid-row">
            {[
              { value: '15s', label: 'Rotating Gate QR', color: 'var(--color-text-primary)' },
              { value: '$0.01', label: 'x402 Entry Fee', color: 'var(--color-primary)' },
              { value: 'AI', label: 'Autonomous NFT Upgrades', color: 'var(--color-text-primary)' },
              { value: '100%', label: 'On-Chain Validation', color: 'var(--color-primary)' },
            ].map((stat, i) => (
              <div key={i} className="stat-cell">
                <div className="data-value" style={{
                  fontSize: 'clamp(2.5rem, 4vw, 3.5rem)', color: stat.color, marginBottom: '0.4rem',
                  background: i % 2 === 1 ? 'linear-gradient(135deg, #1868FF, #60A5FA)' : undefined,
                  WebkitBackgroundClip: i % 2 === 1 ? 'text' : undefined,
                  WebkitTextFillColor: i % 2 === 1 ? 'transparent' : undefined,
                  backgroundClip: i % 2 === 1 ? 'text' : undefined,
                }}>
                  {stat.value}
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════
          MATCH CARD — Argentina vs France
      ══════════════════════════════════════════════════ */}
      <div style={{ maxWidth: '1200px', margin: '3rem auto 0', padding: '0 1.5rem' }}>
        <div style={{ marginBottom: '1.25rem' }}>
          <h2 style={{ fontSize: '1.2rem', color: 'var(--color-text-primary)', marginBottom: '0.3rem' }}>
            Available Fixtures
          </h2>
          <p style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', fontFamily: 'var(--font-family-body)' }}>
            {isConnected ? 'Select a match to purchase your NFT ticket.' : 'Connect your wallet to access ticket purchasing.'}
          </p>
        </div>

        <div className="glass-panel" style={{
          padding: '2rem',
          background: isConnected
            ? 'rgba(255,255,255,0.92)'
            : 'rgba(255,255,255,0.55)',
          filter: isConnected ? 'none' : 'grayscale(0.15)',
        }}>
          {/* Match header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.75rem' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.5rem' }}>
                <span className="badge-live">LIVE</span>
                <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-text-muted)', fontFamily: 'var(--font-family-body)' }}>
                  EVENT ID: WC2026-FIN
                </span>
              </div>
              <h3 style={{ fontSize: '1.75rem', color: 'var(--color-text-primary)', marginBottom: '0.25rem' }}>
                Argentina vs France
              </h3>
              <p style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', fontFamily: 'var(--font-family-body)' }}>
                FIFA World Cup 2026 · Final · MetLife Stadium, New Jersey
              </p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.3rem' }}>
                Starting from
              </div>
              <div className="data-value" style={{ fontSize: '2rem', color: 'var(--color-primary)' }}>
                $20 USDC
              </div>
            </div>
          </div>

          {/* Team display */}
          <div style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'center', padding: '1.5rem 0', borderTop: '1px solid var(--color-border)', borderBottom: '1px solid var(--color-border)', marginBottom: '1.75rem' }}>
            {/* Argentina */}
            <div style={{ textAlign: 'center' }}>
              <div style={{
                width: '72px', height: '72px', borderRadius: '50%', margin: '0 auto 0.75rem',
                background: 'linear-gradient(135deg, #74C0FC 0%, #1868FF 50%, #FFFFFF 100%)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '2rem', boxShadow: '0 4px 16px rgba(24,104,255,0.3)',
              }}>🇦🇷</div>
              <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--color-text-primary)', fontFamily: 'var(--font-family-display)' }}>ARGENTINA</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', fontFamily: 'var(--font-family-body)', marginTop: '0.2rem' }}>Home Favourite</div>
            </div>

            {/* VS */}
            <div style={{ textAlign: 'center' }}>
              <div className="data-value" style={{ fontSize: '2.5rem', color: 'var(--color-text-muted)', opacity: 0.5 }}>VS</div>
              <div style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)', fontFamily: 'var(--font-family-body)', marginTop: '0.35rem', fontWeight: 600 }}>72' · LIVE</div>
            </div>

            {/* France */}
            <div style={{ textAlign: 'center' }}>
              <div style={{
                width: '72px', height: '72px', borderRadius: '50%', margin: '0 auto 0.75rem',
                background: 'linear-gradient(135deg, #1E3A8A 0%, #2563EB 50%, #DC2626 100%)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '2rem', boxShadow: '0 4px 16px rgba(30,58,138,0.3)',
              }}>🇫🇷</div>
              <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--color-text-primary)', fontFamily: 'var(--font-family-display)' }}>FRANCE</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', fontFamily: 'var(--font-family-body)', marginTop: '0.2rem' }}>Defending Champions</div>
            </div>
          </div>

          {/* Buy button */}
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
            <Button
              id="match-card-buy-btn"
              variant="primary"
              size="lg"
              onClick={handleBuyPass}
              style={{ minWidth: '220px' }}
            >
              {isConnected ? '🎫 Purchase Ticket' : '🔐 Connect Wallet to Purchase'}
            </Button>
          </div>

          {/* Preview overlay when disconnected */}
          {!isConnected && (
            <div style={{
              marginTop: '1.25rem',
              padding: '0.75rem 1rem',
              background: 'rgba(245,158,11,0.06)',
              border: '1px solid rgba(245,158,11,0.2)',
              borderRadius: '10px',
              textAlign: 'center',
              fontSize: '0.82rem',
              color: 'var(--color-warning)',
              fontFamily: 'var(--font-family-body)',
              fontWeight: 600,
            }}>
              🔒 Preview only — Connect wallet above to unlock ticket purchasing
            </div>
          )}
        </div>
      </div>

      {/* ══════════════════════════════════════════════════
          FEATURE CARDS
      ══════════════════════════════════════════════════ */}
      <div style={{
        maxWidth: '1200px', margin: '4rem auto 0', padding: '0 1.5rem',
        display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.75rem',
      }}>
        {[
          {
            icon: '🎫',
            title: 'NFT Ticket Minting',
            body: 'Your seat is minted as an ERC-721 NFT on Injective. Seat number, event ID, and metadata are immutably recorded on-chain at the moment of purchase.',
          },
          {
            icon: '🔐',
            title: 'x402 Gate Entry',
            body: 'A rotating HMAC-SHA256 proof QR code — refreshed every 15 seconds — is gated behind a $0.01 USDC micropayment, making ticket forgery impossible.',
          },
          {
            icon: '🏆',
            title: 'Victory NFT Upgrade',
            body: 'If your team wins, the AI Fan Agent autonomously calls upgradeToVictoryMetadata() on-chain. Your ticket transforms into a Gold Victory Edition collectible.',
          },
        ].map((card, i) => (
          <div key={i} className="glass-panel" style={{ padding: '2rem', display: 'flex', flexDirection: 'column' }}>
            <div style={{
              width: '54px', height: '54px', borderRadius: '14px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: 'var(--color-primary-gradient)',
              boxShadow: '0 4px 16px rgba(24, 104, 255, 0.35)',
              marginBottom: '1.5rem', fontSize: '1.5rem',
            }}>
              {card.icon}
            </div>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '0.75rem', color: 'var(--color-text-primary)' }}>
              {card.title}
            </h3>
            <p style={{ color: 'var(--color-text-secondary)', lineHeight: 1.65, fontSize: '0.92rem', fontFamily: 'var(--font-family-body)' }}>
              {card.body}
            </p>
            <div style={{ marginTop: '1.75rem', height: '3px', width: '40px', background: 'linear-gradient(90deg, #1868FF, #3B82F6)', borderRadius: '2px' }} />
          </div>
        ))}
      </div>

      {/* ══════════════════════════════════════════════════
          PURCHASE MODAL OVERLAY
      ══════════════════════════════════════════════════ */}
      {purchaseStep !== 'idle' && (
        <div
          id="purchase-modal-overlay"
          onClick={(e) => { if (e.target === e.currentTarget && purchaseStep !== 'minting') closeModal(); }}
          style={{
            position: 'fixed', inset: 0, zIndex: 1000,
            background: 'rgba(10, 10, 15, 0.65)',
            backdropFilter: 'blur(8px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: '1.5rem',
          }}
        >
          <div className="glass-panel" style={{
            width: '100%', maxWidth: '480px', padding: '2.5rem',
            animation: 'modal-in 0.28s cubic-bezier(0.16,1,0.3,1)',
          }}>

            {/* ── Step: Select Tier ─────────────────── */}
            {purchaseStep === 'select-tier' && (
              <>
                <h2 style={{ marginBottom: '0.5rem', fontSize: '1.5rem' }}>Choose Your Tier</h2>
                <p style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', fontFamily: 'var(--font-family-body)', marginBottom: '1.75rem' }}>
                  Argentina vs France · WC2026-FIN
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem' }}>
                  {SEAT_TIERS.map((tier) => (
                    <button
                      key={tier.id}
                      onClick={() => handleSelectTier(tier)}
                      style={{
                        padding: '1.25rem 1.5rem', borderRadius: '16px', textAlign: 'left',
                        border: `2px solid ${tier.color}30`,
                        background: `${tier.color}08`, cursor: 'pointer',
                        transition: 'all var(--transition-fast)', display: 'block', width: '100%',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = tier.color;
                        e.currentTarget.style.background = `${tier.color}12`;
                        e.currentTarget.style.transform = 'translateY(-1px)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = `${tier.color}30`;
                        e.currentTarget.style.background = `${tier.color}08`;
                        e.currentTarget.style.transform = 'translateY(0)';
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                        <span style={{ fontFamily: 'var(--font-family-display)', fontSize: '1.1rem', color: 'var(--color-text-primary)', fontWeight: 700 }}>
                          {tier.name}
                        </span>
                        <span className="data-value" style={{ fontSize: '1.4rem', color: tier.color }}>
                          ${tier.price} USDC
                        </span>
                      </div>
                      <div style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)', fontFamily: 'var(--font-family-body)' }}>
                        {tier.description}
                      </div>
                    </button>
                  ))}
                </div>
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  <Button variant="outline" size="sm" onClick={closeModal} style={{ flex: 1 }}>Cancel</Button>
                </div>
              </>
            )}

            {/* ── Step: Select Seat ─────────────────── */}
            {purchaseStep === 'select-seat' && selectedTier && (
              <>
                <h2 style={{ marginBottom: '0.5rem', fontSize: '1.5rem' }}>Select Your Seat</h2>
                <p style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', fontFamily: 'var(--font-family-body)', marginBottom: '1.75rem' }}>
                  {selectedTier.name} — ${selectedTier.price} USDC per seat
                </p>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.6rem', marginBottom: '1.5rem' }}>
                  {selectedTier.seats.map((seat) => (
                    <button
                      key={seat}
                      onClick={() => handleSelectSeat(seat)}
                      style={{
                        padding: '0.875rem 0.5rem', borderRadius: '12px', textAlign: 'center',
                        border: '2px solid var(--color-border)',
                        background: 'rgba(15,15,17,0.02)', cursor: 'pointer',
                        fontFamily: 'var(--font-family-display)', fontSize: '1rem',
                        color: 'var(--color-text-primary)', fontWeight: 700,
                        transition: 'all var(--transition-fast)',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = 'var(--color-primary)';
                        e.currentTarget.style.background = 'var(--color-primary-light)';
                        e.currentTarget.style.color = 'var(--color-primary)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = 'var(--color-border)';
                        e.currentTarget.style.background = 'rgba(15,15,17,0.02)';
                        e.currentTarget.style.color = 'var(--color-text-primary)';
                      }}
                    >
                      {seat}
                    </button>
                  ))}
                </div>
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  <Button variant="outline" size="sm" onClick={() => setPurchaseStep('select-tier')} style={{ flex: 1 }}>← Back</Button>
                </div>
              </>
            )}

            {/* ── Step: Confirm ─────────────────────── */}
            {purchaseStep === 'confirm' && selectedTier && selectedSeat && (
              <>
                <h2 style={{ marginBottom: '0.5rem', fontSize: '1.5rem' }}>Confirm Purchase</h2>
                <p style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', fontFamily: 'var(--font-family-body)', marginBottom: '1.75rem' }}>
                  Review your order before minting
                </p>
                <div style={{
                  padding: '1.25rem', borderRadius: '14px',
                  background: 'rgba(24,104,255,0.04)', border: '1px solid rgba(24,104,255,0.12)',
                  marginBottom: '1.5rem',
                }}>
                  {[
                    ['Event', 'Argentina vs France · WC2026-FIN'],
                    ['Tier', selectedTier.name],
                    ['Seat Number', `#${selectedSeat}`],
                    ['Price', `${selectedTier.price} USDC`],
                    ['Your Balance', `${usdcBalance.toFixed(2)} USDC`],
                    ['Wallet', walletAddress ? `${walletAddress.slice(0, 10)}...` : '—'],
                  ].map(([label, value]) => (
                    <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid rgba(15,15,17,0.04)' }}>
                      <span style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)', fontFamily: 'var(--font-family-body)' }}>{label}</span>
                      <span style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--color-text-primary)', fontFamily: 'var(--font-family-body)' }}>{value}</span>
                    </div>
                  ))}
                </div>
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  <Button variant="outline" size="sm" onClick={() => setPurchaseStep('select-seat')} style={{ flex: '0 0 auto' }}>← Back</Button>
                  <Button variant="primary" size="sm" onClick={handleConfirmPurchase} style={{ flex: 1 }}>
                    ⚡ Confirm Payment & Mint NFT
                  </Button>
                </div>
              </>
            )}

            {/* ── Step: Minting ─────────────────────── */}
            {purchaseStep === 'minting' && (
              <div style={{ textAlign: 'center', padding: '2rem 0' }}>
                <div style={{
                  width: '80px', height: '80px', margin: '0 auto 1.5rem',
                  borderRadius: '50%', background: 'var(--color-primary-gradient)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '2.5rem', animation: 'spin 1.2s linear infinite',
                  boxShadow: '0 4px 24px rgba(24,104,255,0.4)',
                }}>
                  ⚡
                </div>
                <h2 style={{ marginBottom: '0.75rem', fontSize: '1.5rem' }}>Minting Your NFT</h2>
                <p style={{ color: 'var(--color-text-muted)', fontFamily: 'var(--font-family-body)', fontSize: '0.9rem' }}>
                  Calling purchaseTicket() on Injective...<br />
                  Waiting for block confirmation
                </p>
                <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'center', gap: '6px' }}>
                  {[0, 1, 2].map((i) => (
                    <div key={i} style={{
                      width: '8px', height: '8px', borderRadius: '50%',
                      background: 'var(--color-primary)',
                      animation: `bounce-dot 1.2s ${i * 0.2}s infinite ease-in-out`,
                    }} />
                  ))}
                </div>
              </div>
            )}

            {/* ── Step: Minted! ─────────────────────── */}
            {purchaseStep === 'minted' && mintedTokenId && selectedTier && selectedSeat && (
              <div style={{ textAlign: 'center' }}>
                <div style={{
                  width: '100px', height: '100px', margin: '0 auto 1.5rem',
                  borderRadius: '20px',
                  background: 'linear-gradient(135deg, #74C0FC 0%, #1868FF 50%, #60A5FA 100%)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '3rem', boxShadow: '0 8px 32px rgba(24,104,255,0.45)',
                  animation: 'bounce-in 0.6s cubic-bezier(0.34,1.56,0.64,1)',
                }}>
                  🎫
                </div>
                <h2 style={{ marginBottom: '0.5rem', fontSize: '1.6rem', color: 'var(--color-text-primary)' }}>
                  Ticket NFT Minted!
                </h2>
                <p style={{ color: 'var(--color-text-secondary)', fontFamily: 'var(--font-family-body)', marginBottom: '0.35rem' }}>
                  Argentina vs France · Seat #{selectedSeat}
                </p>
                <p style={{ color: 'var(--color-text-muted)', fontSize: '0.82rem', fontFamily: 'var(--font-family-body)', marginBottom: '1.75rem' }}>
                  Token ID: #{mintedTokenId} · {selectedTier.name}
                </p>
                <div style={{
                  padding: '0.875rem', borderRadius: '12px',
                  background: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.2)',
                  fontSize: '0.82rem', color: 'var(--color-success)', marginBottom: '1.5rem',
                  fontFamily: 'var(--font-family-body)', fontWeight: 600,
                }}>
                  ✅ Tx confirmed on Injective testnet
                </div>
                <Button id="go-to-ticket-btn" variant="primary" size="lg" onClick={goToDashboard} style={{ width: '100%' }}>
                  🎫 View My Ticket Wallet →
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};