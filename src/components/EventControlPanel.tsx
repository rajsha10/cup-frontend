import React, { useState } from 'react';
import { useLiveFeed, RecentEvent } from '../hooks/useLiveFeed';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

interface EventControlPanelProps {
  compact?: boolean;
}

export const EventControlPanel: React.FC<EventControlPanelProps> = ({ compact = false }) => {
  const { feed, loading, error } = useLiveFeed();

  // Form states
  const [eventId, setEventId] = useState<string>('WC2026-FIN');
  const [minute, setMinute] = useState<number>(75);
  const [score, setScore] = useState<string>('Argentina 2 - 1 France');
  const [eventType, setEventType] = useState<RecentEvent>('NONE');

  const [deploying, setDeploying] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const handleDeploy = async (overrideEvent?: RecentEvent, overrideScore?: string) => {
    setDeploying(true);
    setStatusMessage(null);

    const targetEvent = overrideEvent || eventType;
    const targetScore = overrideScore !== undefined ? overrideScore : score;

    try {
      const res = await fetch(`${API_URL}/api/admin/simulate-trigger`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventId,
          minute,
          score: targetScore,
          eventType: targetEvent,
        }),
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      if (data.success) {
        setStatusMessage({
          text: `Deployed "${targetEvent}" event to backend live feed!`,
          type: 'success',
        });
      } else {
        throw new Error(data.error || 'Failed to deploy event');
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Deployment error';
      setStatusMessage({
        text: `Deployment failed: ${msg}`,
        type: 'error',
      });
    } finally {
      setDeploying(false);
    }
  };

  return (
    <div style={{
      background: 'rgba(255, 255, 255, 0.85)',
      backdropFilter: 'blur(16px)',
      borderRadius: '20px',
      border: '1px solid rgba(226, 232, 240, 0.8)',
      boxShadow: '0 12px 32px rgba(0, 0, 0, 0.05)',
      padding: compact ? '1.25rem' : '2rem',
      fontFamily: 'var(--font-family-body, system-ui, sans-serif)',
    }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
        <div>
          <h3 style={{
            margin: 0,
            fontSize: compact ? '1.1rem' : '1.35rem',
            fontWeight: 700,
            background: 'linear-gradient(135deg, #0F172A 0%, #334155 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
          }}>
            ⚡ Live Match Event Panel
          </h3>
          {!compact && (
            <p style={{ margin: '0.25rem 0 0', fontSize: '0.85rem', color: '#64748B' }}>
              Create, customize, and deploy match events directly to the backend live feed
            </p>
          )}
        </div>

        {/* Live status badge */}
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.4rem',
          padding: '0.35rem 0.75rem',
          borderRadius: '9999px',
          fontSize: '0.78rem',
          fontWeight: 600,
          background: feed ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)',
          color: feed ? '#16A34A' : '#DC2626',
          border: `1px solid ${feed ? 'rgba(34, 197, 94, 0.25)' : 'rgba(239, 68, 68, 0.25)'}`,
        }}>
          <span style={{
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            backgroundColor: feed ? '#22C55E' : '#EF4444',
            boxShadow: feed ? '0 0 8px #22C55E' : 'none',
          }} />
          {feed ? 'Backend Live' : 'Backend Offline'}
        </div>
      </div>

      {/* Current Live Feed Monitor */}
      <div style={{
        background: '#F8FAFC',
        borderRadius: '12px',
        padding: '1rem',
        marginBottom: '1.5rem',
        border: '1px solid #E2E8F0',
      }}>
        <div style={{ fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#94A3B8', marginBottom: '0.5rem' }}>
          Current Active Live Feed State
        </div>

        {loading ? (
          <div style={{ fontSize: '0.85rem', color: '#64748B' }}>Polling live feed...</div>
        ) : feed ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '0.75rem' }}>
            <div>
              <span style={{ fontSize: '0.72rem', color: '#64748B', display: 'block' }}>Match ID</span>
              <strong style={{ fontSize: '0.9rem', color: '#0F172A' }}>{feed.eventId}</strong>
            </div>
            <div>
              <span style={{ fontSize: '0.72rem', color: '#64748B', display: 'block' }}>Minute</span>
              <strong style={{ fontSize: '0.9rem', color: '#0F172A' }}>{feed.minute}'</strong>
            </div>
            <div>
              <span style={{ fontSize: '0.72rem', color: '#64748B', display: 'block' }}>Score</span>
              <strong style={{ fontSize: '0.9rem', color: '#0F172A' }}>{feed.score}</strong>
            </div>
            <div>
              <span style={{ fontSize: '0.72rem', color: '#64748B', display: 'block' }}>Recent Event</span>
              <span style={{
                display: 'inline-block',
                fontSize: '0.75rem',
                fontWeight: 700,
                padding: '0.15rem 0.5rem',
                borderRadius: '6px',
                background: feed.recentEvent === 'GOAL' ? '#FEF08A' : feed.recentEvent === 'MATCH_END_WIN' ? '#DCFCE7' : '#E2E8F0',
                color: feed.recentEvent === 'GOAL' ? '#854D0E' : feed.recentEvent === 'MATCH_END_WIN' ? '#166534' : '#475569',
              }}>
                {feed.recentEvent}
              </span>
            </div>
          </div>
        ) : (
          <div style={{ fontSize: '0.85rem', color: '#EF4444', fontWeight: 500 }}>
            ⚠️ Backend feed offline ({error || 'No response'}). Start Express server on port 3000 to send/receive live events.
          </div>
        )}
      </div>

      {/* Quick Action Buttons */}
      <div style={{ marginBottom: '1.5rem' }}>
        <div style={{ fontSize: '0.78rem', fontWeight: 600, color: '#475569', marginBottom: '0.6rem' }}>
          ⚡ Quick Match Event Dispatchers
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={() => handleDeploy('GOAL', 'Argentina 2 - 1 France')}
            disabled={deploying}
            style={{
              flex: 1,
              minWidth: '130px',
              padding: '0.6rem 0.9rem',
              borderRadius: '10px',
              border: 'none',
              background: 'linear-gradient(135deg, #EAB308 0%, #CA8A04 100%)',
              color: '#FFFFFF',
              fontWeight: 600,
              fontSize: '0.82rem',
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(234, 179, 8, 0.25)',
              transition: 'transform 0.15s ease',
            }}
          >
            ⚽ Trigger GOAL
          </button>

          <button
            type="button"
            onClick={() => handleDeploy('MATCH_END_WIN', 'Argentina 2 - 1 France (FT)')}
            disabled={deploying}
            style={{
              flex: 1,
              minWidth: '140px',
              padding: '0.6rem 0.9rem',
              borderRadius: '10px',
              border: 'none',
              background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
              color: '#FFFFFF',
              fontWeight: 600,
              fontSize: '0.82rem',
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(16, 185, 129, 0.25)',
              transition: 'transform 0.15s ease',
            }}
          >
            🏆 Trigger Victory
          </button>

          <button
            type="button"
            onClick={() => handleDeploy('NONE', 'Argentina 0 - 0 France')}
            disabled={deploying}
            style={{
              padding: '0.6rem 0.9rem',
              borderRadius: '10px',
              border: '1px solid #CBD5E1',
              background: '#FFFFFF',
              color: '#475569',
              fontWeight: 600,
              fontSize: '0.82rem',
              cursor: 'pointer',
            }}
          >
            🔄 Reset
          </button>
        </div>
      </div>

      {/* Form to Customize Custom Event */}
      <form onSubmit={(e) => { e.preventDefault(); handleDeploy(); }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '0.85rem', marginBottom: '1.25rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#475569', marginBottom: '0.3rem' }}>
              Event ID
            </label>
            <input
              type="text"
              value={eventId}
              onChange={(e) => setEventId(e.target.value)}
              style={{
                width: '100%',
                padding: '0.5rem 0.75rem',
                borderRadius: '8px',
                border: '1px solid #CBD5E1',
                fontSize: '0.85rem',
                boxSizing: 'border-box',
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#475569', marginBottom: '0.3rem' }}>
              Match Minute ({minute}')
            </label>
            <input
              type="number"
              min={0}
              max={120}
              value={minute}
              onChange={(e) => setMinute(Number(e.target.value))}
              style={{
                width: '100%',
                padding: '0.5rem 0.75rem',
                borderRadius: '8px',
                border: '1px solid #CBD5E1',
                fontSize: '0.85rem',
                boxSizing: 'border-box',
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#475569', marginBottom: '0.3rem' }}>
              Score Line
            </label>
            <input
              type="text"
              value={score}
              onChange={(e) => setScore(e.target.value)}
              style={{
                width: '100%',
                padding: '0.5rem 0.75rem',
                borderRadius: '8px',
                border: '1px solid #CBD5E1',
                fontSize: '0.85rem',
                boxSizing: 'border-box',
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#475569', marginBottom: '0.3rem' }}>
              Event Type
            </label>
            <select
              value={eventType}
              onChange={(e) => setEventType(e.target.value as RecentEvent)}
              style={{
                width: '100%',
                padding: '0.5rem 0.75rem',
                borderRadius: '8px',
                border: '1px solid #CBD5E1',
                fontSize: '0.85rem',
                background: '#FFFFFF',
                boxSizing: 'border-box',
              }}
            >
              <option value="NONE">NONE (Normal Play)</option>
              <option value="GOAL">GOAL (Goal Scored)</option>
              <option value="MATCH_END_WIN">MATCH_END_WIN (Final Whistle Win)</option>
            </select>
          </div>
        </div>

        <button
          type="submit"
          disabled={deploying}
          style={{
            width: '100%',
            padding: '0.75rem 1rem',
            borderRadius: '10px',
            border: 'none',
            background: 'linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)',
            color: '#FFFFFF',
            fontWeight: 700,
            fontSize: '0.9rem',
            cursor: deploying ? 'not-allowed' : 'pointer',
            boxShadow: '0 4px 14px rgba(37, 99, 235, 0.3)',
            opacity: deploying ? 0.7 : 1,
            transition: 'all 0.2s ease',
          }}
        >
          {deploying ? 'Deploying Event...' : '🚀 Deploy Custom Event to Backend'}
        </button>
      </form>

      {/* Deployment status message */}
      {statusMessage && (
        <div style={{
          marginTop: '1rem',
          padding: '0.65rem 0.9rem',
          borderRadius: '8px',
          fontSize: '0.82rem',
          fontWeight: 600,
          background: statusMessage.type === 'success' ? '#DCFCE7' : '#FEE2E2',
          color: statusMessage.type === 'success' ? '#15803D' : '#B91C1C',
          border: `1px solid ${statusMessage.type === 'success' ? '#86EFAC' : '#FCA5A5'}`,
        }}>
          {statusMessage.text}
        </div>
      )}
    </div>
  );
};
