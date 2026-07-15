import React, { createContext, useContext, useState, useCallback } from 'react';

// ─── Types ────────────────────────────────────────────────────────────────────
export interface Web3ContextValue {
  walletAddress: string | null;
  usdcBalance: number;
  injBalance: number;
  isConnecting: boolean;
  isConnected: boolean;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
  truncatedAddress: string;
  // Ticket state (set after purchase)
  ticketTokenId: string | null;
  ticketSeat: number | null;
  ticketEventId: string;
  isCheckedIn: boolean;
  isVictoryEdition: boolean;
  setTicketPurchased: (tokenId: string, seat: number) => void;
  setCheckedIn: () => void;
  setVictoryEdition: () => void;
}

// ─── Context ──────────────────────────────────────────────────────────────────
const Web3Context = createContext<Web3ContextValue | null>(null);

// ─── Provider ─────────────────────────────────────────────────────────────────
export const Web3Provider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [usdcBalance, setUsdcBalance] = useState<number>(500.0);
  const [injBalance, setInjBalance] = useState<number>(0);
  const [isConnecting, setIsConnecting] = useState<boolean>(false);

  // Ticket NFT state
  const [ticketTokenId, setTicketTokenId] = useState<string | null>(null);
  const [ticketSeat, setTicketSeat] = useState<number | null>(null);
  const [isCheckedIn, setIsCheckedInState] = useState<boolean>(false);
  const [isVictoryEdition, setIsVictoryEditionState] = useState<boolean>(false);
  const ticketEventId = 'WC2026-FIN';

  // Simulated wallet connection — swap for MetaMask/Keplr SDK later
  // REMINDER: Integrate real MetaMask/Keplr wallet SDK here in a future task.
  const connectWallet = useCallback(async () => {
    setIsConnecting(true);
    await new Promise((res) => setTimeout(res, 800));
    const mockAddress = 'inj1' + Array.from({ length: 38 }, () =>
      '0123456789abcdefghijklmnopqrstuvwxyz'[Math.floor(Math.random() * 36)]
    ).join('');
    setWalletAddress(mockAddress);
    setUsdcBalance(500.0);
    setInjBalance(12.45);
    setIsConnecting(false);
  }, []);

  const disconnectWallet = useCallback(() => {
    setWalletAddress(null);
    setUsdcBalance(500.0);
    setInjBalance(0);
    setTicketTokenId(null);
    setTicketSeat(null);
    setIsCheckedInState(false);
    setIsVictoryEditionState(false);
  }, []);

  const setTicketPurchased = useCallback((tokenId: string, seat: number) => {
    setTicketTokenId(tokenId);
    setTicketSeat(seat);
    // Deduct ticket price from balance (simulated)
    setUsdcBalance((prev) => Math.max(0, prev - 50));
  }, []);

  const setCheckedIn = useCallback(() => setIsCheckedInState(true), []);
  const setVictoryEdition = useCallback(() => setIsVictoryEditionState(true), []);

  const truncatedAddress = walletAddress
    ? `${walletAddress.slice(0, 8)}...${walletAddress.slice(-4)}`
    : '';

  return (
    <Web3Context.Provider value={{
      walletAddress,
      usdcBalance,
      injBalance,
      isConnecting,
      isConnected: !!walletAddress,
      connectWallet,
      disconnectWallet,
      truncatedAddress,
      ticketTokenId,
      ticketSeat,
      ticketEventId,
      isCheckedIn,
      isVictoryEdition,
      setTicketPurchased,
      setCheckedIn,
      setVictoryEdition,
    }}>
      {children}
    </Web3Context.Provider>
  );
};

// ─── Hook ─────────────────────────────────────────────────────────────────────
export function useWeb3(): Web3ContextValue {
  const ctx = useContext(Web3Context);
  if (!ctx) throw new Error('useWeb3 must be used inside <Web3Provider>');
  return ctx;
}