import { useState, useEffect, useRef, useCallback } from 'react';

// ─── Types ────────────────────────────────────────────────────────────────────
export interface TicketProof {
  tokenId: string;
  proofToken: string;
  expiresIn: number;        // seconds (15)
  matchContext: string;
}

export interface UseTicketProofReturn {
  proof: TicketProof | null;
  secondsRemaining: number;
  loading: boolean;
  error: string | null;
  isActive: boolean;        // true while QR is being shown
  requestProof: () => void; // call to start QR flow
  stopProof: () => void;    // call to cancel
}

// ─── Constants ────────────────────────────────────────────────────────────────
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
const ROTATION_SECONDS = 15;

// ─── Hook ─────────────────────────────────────────────────────────────────────
export function useTicketProof(tokenId: string | null, ownerAddress: string | null): UseTicketProofReturn {
  const [proof, setProof] = useState<TicketProof | null>(null);
  const [secondsRemaining, setSecondsRemaining] = useState<number>(ROTATION_SECONDS);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isActive, setIsActive] = useState<boolean>(false);

  const fetchIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const countdownIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Fetch secure proof from backend (mock x402 payment header)
  // REMINDER: Replace mock header with real @x402/core payment signing in a future task.
  const fetchProof = useCallback(async () => {
    if (!tokenId || !ownerAddress) return;
    setLoading(true);
    setError(null);
    try {
      const url = `${API_URL}/api/ticket/secure-proof?tokenId=${encodeURIComponent(tokenId)}&ownerAddress=${encodeURIComponent(ownerAddress)}`;
      const res = await fetch(url, {
        headers: {
          // Mock x402 payment token — real signing deferred to a future task
          'Authorization': 'Bearer MOCK_x402_PAYMENT_TOKEN',
          'X-402-Payment': 'mock-usdc-payment-proof',
        },
      });

      if (res.status === 402) {
        // x402 Payment Required — in real implementation, settle payment here
        setError('Payment required ($0.01 USDC) — mock auto-settling...');
        // Simulate payment settlement and retry
        await new Promise((r) => setTimeout(r, 600));
        // Retry with same mock token
        const retryRes = await fetch(url, {
          headers: {
            'Authorization': 'Bearer MOCK_x402_PAYMENT_TOKEN',
            'X-402-Payment': 'mock-usdc-payment-proof',
          },
        });
        if (!retryRes.ok) throw new Error(`Retry failed: ${retryRes.status}`);
        const retryData = await retryRes.json();
        if (!retryData.success) throw new Error(retryData.error || 'Proof generation failed');
        setProof(retryData);
        setSecondsRemaining(ROTATION_SECONDS);
        setError(null);
      } else if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      } else {
        const data = await res.json();
        if (!data.success) throw new Error(data.error || 'Proof generation failed');
        setProof(data);
        setSecondsRemaining(ROTATION_SECONDS);
        setError(null);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Unknown error';
      console.warn('[useTicketProof] Backend offline, using mock proof:', msg);
      // Generate mock proof so QR renders even without backend
      setProof({
        tokenId: tokenId || '1',
        proofToken: `mock-proof-${Date.now()}-${Math.random().toString(36).slice(2)}`,
        expiresIn: ROTATION_SECONDS,
        matchContext: 'Argentina 2 - 1 France',
      });
      setSecondsRemaining(ROTATION_SECONDS);
      setError(null);
    } finally {
      setLoading(false);
    }
  }, [tokenId, ownerAddress]);

  // Start the QR flow
  const requestProof = useCallback(() => {
    setIsActive(true);
    fetchProof();

    // Auto-refresh every 15 seconds
    fetchIntervalRef.current = setInterval(fetchProof, ROTATION_SECONDS * 1000);

    // Countdown ticker every second
    countdownIntervalRef.current = setInterval(() => {
      setSecondsRemaining((prev) => (prev <= 1 ? ROTATION_SECONDS : prev - 1));
    }, 1000);
  }, [fetchProof]);

  // Stop the QR flow
  const stopProof = useCallback(() => {
    setIsActive(false);
    setProof(null);
    setSecondsRemaining(ROTATION_SECONDS);
    if (fetchIntervalRef.current) clearInterval(fetchIntervalRef.current);
    if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (fetchIntervalRef.current) clearInterval(fetchIntervalRef.current);
      if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
    };
  }, []);

  return { proof, secondsRemaining, loading, error, isActive, requestProof, stopProof };
}