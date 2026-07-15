import { useState, useEffect, useRef } from 'react';

// ─── Types ────────────────────────────────────────────────────────────────────
export type RecentEvent = 'NONE' | 'GOAL' | 'MATCH_END_WIN';

export interface LiveFeed {
  eventId: string;
  minute: number;
  score: string;
  recentEvent: RecentEvent;
}

export interface UseLiveFeedReturn {
  feed: LiveFeed | null;
  loading: boolean;
  error: string | null;
  lastUpdated: Date | null;
}

// ─── Hook ─────────────────────────────────────────────────────────────────────
const POLL_INTERVAL_MS = 8000; // 8 seconds per spec
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

// Fallback data when backend is offline
const FALLBACK_FEED: LiveFeed = {
  eventId: 'WC2026-FIN',
  minute: 72,
  score: 'Argentina 2 - 1 France',
  recentEvent: 'NONE',
};

export function useLiveFeed(): UseLiveFeedReturn {
  const [feed, setFeed] = useState<LiveFeed | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchFeed = async () => {
    try {
      const res = await fetch(`${API_URL}/api/events/live-feed`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data: LiveFeed = await res.json();
      setFeed(data);
      setError(null);
      setLastUpdated(new Date());
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Unknown error';
      console.warn('[useLiveFeed] Backend offline, using fallback:', msg);
      setError('Backend offline — showing demo data');
      // Use fallback so UI still renders
      setFeed(FALLBACK_FEED);
      setLastUpdated(new Date());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeed();
    intervalRef.current = setInterval(fetchFeed, POLL_INTERVAL_MS);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  return { feed, loading, error, lastUpdated };
}