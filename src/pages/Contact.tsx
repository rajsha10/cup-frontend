import React, { useState } from 'react';

type EventType = 'NONE' | 'GOAL' | 'MATCH_END_WIN';

interface SimulatePayload {
  eventType: EventType;
  score?: string;
}

interface ApiResponse {
  success: boolean;
  message?: string;
  error?: string;
}

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export const Contact: React.FC = () => {
  const [eventType, setEventType] = useState<EventType>('GOAL');
  const [score, setScore] = useState('Argentina 3 - 1 France');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ApiResponse | null>(null);
  const [liveFeed, setLiveFeed] = useState<{ eventId: string; minute: number; score: string; recentEvent: string } | null>(null);
  const [feedLoading, setFeedLoading] = useState(false);

  const fetchLiveFeed = async () => {
    setFeedLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/events/live-feed`);
      const data = await res.json();
      setLiveFeed(data);
    } catch {
      setLiveFeed({ eventId: 'WC2026-FIN', minute: 72, score: 'Argentina 2 - 1 France', recentEvent: 'NONE' });
    } finally {
      setFeedLoading(false);
    }
  };

  const handleSimulate = async () => {
    setLoading(true);
    setResult(null);
    const payload: SimulatePayload = { eventType };
    if (score.trim()) payload.score = score.trim();

    try {
      const res = await fetch(`${API_URL}/api/admin/simulate-trigger`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data: ApiResponse = await res.json();
      setResult(data);
      // Refresh feed after trigger
      setTimeout(fetchLiveFeed, 500);
    } catch {
      setResult({ success: false, error: 'Could not reach backend. Make sure server is running on port 3000.' });
    } finally {
      setLoading(false);
    }
  };

  const EVENT_TYPES: { value: EventType; label: string; description: string; color: string }[] = [
    { value: 'NONE', label: 'None', description: 'Reset to normal state', color: 'var(--color-text-muted)' },
    { value: 'GOAL', label: '⚽ Goal', description: 'Trigger a goal event alert', color: '#F59E0B' },
    { value: 'MATCH_END_WIN', label: '🏆 Match End Win', description: 'Trigger victory upgrade + gold NFT', color: '#D97706' },
  ];

  return (
    <div style={{ flex: 1, paddingBottom: '5rem' }}>
      <div style={{ maxWidth: '860px', margin: '0 auto', padding: '4rem 1.5rem' }}>

        {/* Header */}
        <div style={{ marginBottom: '2.5rem' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
            padding: '0.35rem 0.9rem', borderRadius: 'var(--radius-pill)',
            border: '1px solid rgba(239,68,68,0.25)', background: 'rgba(239,68,68,0.06)',
            color: 'var(--color-error)', fontSize: '0.78rem', fontWeight: 700,
            letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '1rem',
          }}>
            ⚙️ Demo Only — Admin Access
          </div>
          <h1 style={{ fontSize: 'clamp(2.2rem, 5vw, 3.5rem)', marginBottom: '0.75rem' }}>
            Admin Simulation Panel
          </h1>
          <p style={{ color: 'var(--color-text-secondary)', fontFamily: 'var(--font-family-body)', fontSize: '0.95rem', lineHeight: 1.65 }}>
            Use this panel to trigger match events and test the live fan experience. These calls POST to{' '}
            <code style={{ fontSize: '0.85em', padding: '2px 6px', background: 'var(--color-primary-light)', borderRadius: '6px', color: 'var(--color-primary)' }}>
              /api/admin/simulate-trigger
            </code>{' '}
            on the backend and update the live arena feed for all connected fans.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1.5rem' }}>

          {/* Trigger panel */}
          <div className="glass-panel" style={{ padding: '2rem' }}>
            <h2 style={{ fontSize: '1.1rem', marginBottom: '1.5rem', color: 'var(--color-text-primary)' }}>
              Trigger Match Event
            </h2>

            {/* Event type selection */}
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--color-text-muted)', marginBottom: '0.75rem', fontFamily: 'var(--font-family-body)' }}>
                Event Type
              </label>
              <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                {EVENT_TYPES.map((type) => (
                  <button
                    key={type.value}
                    onClick={() => setEventType(type.value)}
                    style={{
                      padding: '0.75rem 1.25rem', borderRadius: '12px', cursor: 'pointer',
                      border: eventType === type.value ? `2px solid ${type.color}` : '2px solid var(--color-border)',
                      background: eventType === type.value ? `${type.color}12` : 'rgba(15,15,17,0.02)',
                      fontWeight: 700, fontSize: '0.88rem',
                      color: eventType === type.value ? type.color : 'var(--color-text-secondary)',
                      fontFamily: 'var(--font-family-body)', transition: 'all var(--transition-fast)',
                    }}
                  >
                    <div>{type.label}</div>
                    <div style={{ fontSize: '0.7rem', fontWeight: 500, opacity: 0.75, marginTop: '0.2rem' }}>{type.description}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Score field */}
            <div style={{ marginBottom: '1.75rem' }}>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--color-text-muted)', marginBottom: '0.6rem', fontFamily: 'var(--font-family-body)' }}>
                Score String (optional)
              </label>
              <input
                type="text"
                value={score}
                onChange={(e) => setScore(e.target.value)}
                placeholder="e.g. Argentina 3 - 1 France"
                className="glass-input"
                style={{ color: 'var(--color-text-primary)', fontFamily: 'var(--font-family-body)' }}
              />
              <div style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)', marginTop: '0.4rem', fontFamily: 'var(--font-family-body)' }}>
                Updates the live score text visible to all fans on the Arena Feed.
              </div>
            </div>

            {/* Submit */}
            <button
              id="simulate-trigger-btn"
              onClick={handleSimulate}
              disabled={loading}
              style={{
                width: '100%', padding: '1rem',
                borderRadius: '14px',
                background: loading ? 'rgba(15,15,17,0.08)' : 'linear-gradient(135deg, #1868FF 0%, #3B82F6 100%)',
                color: loading ? 'var(--color-text-muted)' : '#fff',
                fontWeight: 700, fontSize: '1rem', cursor: loading ? 'not-allowed' : 'pointer',
                border: 'none', fontFamily: 'var(--font-family-display)',
                letterSpacing: '0.04em', transition: 'all var(--transition-fast)',
                boxShadow: loading ? 'none' : '0 4px 16px rgba(24,104,255,0.3)',
              }}
            >
              {loading ? '⏳ Sending...' : `⚡ Simulate: ${eventType}`}
            </button>

            {/* Result */}
            {result && (
              <div style={{
                marginTop: '1rem', padding: '0.875rem 1rem', borderRadius: '12px',
                background: result.success ? 'var(--color-success-bg)' : 'var(--color-error-bg)',
                border: `1px solid ${result.success ? 'rgba(16,185,129,0.25)' : 'rgba(239,68,68,0.25)'}`,
                fontSize: '0.875rem', color: result.success ? 'var(--color-success)' : 'var(--color-error)',
                fontWeight: 600, fontFamily: 'var(--font-family-body)',
              }}>
                {result.success ? `✅ ${result.message}` : `❌ ${result.error}`}
              </div>
            )}
          </div>

          {/* Live feed preview */}
          <div className="glass-panel" style={{ padding: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h2 style={{ fontSize: '1.05rem', color: 'var(--color-text-primary)', margin: 0 }}>
                📡 Current Live Feed State
              </h2>
              <button
                onClick={fetchLiveFeed}
                disabled={feedLoading}
                style={{
                  padding: '0.4rem 1rem', borderRadius: 'var(--radius-pill)',
                  border: '1px solid var(--color-border)', background: 'transparent',
                  fontSize: '0.8rem', color: 'var(--color-primary)', fontWeight: 600,
                  cursor: 'pointer', fontFamily: 'var(--font-family-body)',
                  transition: 'all var(--transition-fast)',
                }}
              >
                {feedLoading ? '⏳' : '↻ Refresh'}
              </button>
            </div>

            {liveFeed ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                {[
                  ['Event ID', liveFeed.eventId],
                  ['Score', liveFeed.score],
                  ['Minute', `${liveFeed.minute}'`],
                  ['Recent Event', liveFeed.recentEvent],
                ].map(([label, value]) => (
                  <div key={label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem 0', borderBottom: '1px solid rgba(15,15,17,0.04)' }}>
                    <span style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)', fontFamily: 'var(--font-family-body)', fontWeight: 600 }}>{label}</span>
                    <span style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--color-text-primary)', fontFamily: 'var(--font-family-body)' }}>{value}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '1.5rem', color: 'var(--color-text-muted)', fontFamily: 'var(--font-family-body)', fontSize: '0.875rem' }}>
                <p>Click "Refresh" to fetch the current live feed from the backend.</p>
              </div>
            )}
          </div>

          {/* API reference quick view */}
          <div className="glass-panel" style={{ padding: '2rem' }}>
            <h2 style={{ fontSize: '1.05rem', marginBottom: '1.25rem', color: 'var(--color-text-primary)' }}>
              📖 API Reference
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {[
                { method: 'POST', path: '/api/admin/simulate-trigger', desc: 'Trigger match event (NONE | GOAL | MATCH_END_WIN)' },
                { method: 'GET', path: '/api/events/live-feed', desc: 'Fetch current live match state' },
                { method: 'GET', path: '/api/ticket/secure-proof', desc: 'Generate x402-gated rotating HMAC proof token' },
              ].map(({ method, path, desc }) => (
                <div key={path} style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start', padding: '0.75rem 0', borderBottom: '1px solid rgba(15,15,17,0.04)' }}>
                  <span style={{
                    padding: '0.2rem 0.55rem', borderRadius: '6px', fontSize: '0.72rem',
                    fontWeight: 700, fontFamily: 'ui-monospace, monospace', flexShrink: 0,
                    background: method === 'POST' ? 'rgba(245,158,11,0.1)' : 'rgba(24,104,255,0.1)',
                    color: method === 'POST' ? '#D97706' : 'var(--color-primary)',
                    border: `1px solid ${method === 'POST' ? 'rgba(245,158,11,0.25)' : 'rgba(24,104,255,0.2)'}`,
                  }}>
                    {method}
                  </span>
                  <div>
                    <div style={{ fontSize: '0.82rem', fontFamily: 'ui-monospace, monospace', color: 'var(--color-text-primary)', fontWeight: 600, marginBottom: '0.2rem' }}>{path}</div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)', fontFamily: 'var(--font-family-body)' }}>{desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};