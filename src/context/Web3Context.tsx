import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';

// ─── Injective EVM Testnet Network Configuration (Chain ID 1439) ───────────────
const INJECTIVE_INEVM_TESTNET = {
  chainId: '0x59F', // 1439 in hex
  chainName: 'Injective EVM Testnet',
  nativeCurrency: { name: 'Injective', symbol: 'INJ', decimals: 18 },
  rpcUrls: ['https://k8s.testnet.json-rpc.injective.network/'],
  blockExplorerUrls: ['https://testnet.blockscout.injective.network/'],
};

async function switchToInjectiveNetwork(provider: any) {
  try {
    await provider.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: INJECTIVE_INEVM_TESTNET.chainId }],
    });
  } catch (switchError: any) {
    // Unrecognized chain (4902) -> add network to wallet
    if (switchError.code === 4902) {
      await provider.request({
        method: 'wallet_addEthereumChain',
        params: [INJECTIVE_INEVM_TESTNET],
      });
    }
  }
}

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

  // Ticket NFT state (loaded dynamically from database)
  const [ticketTokenId, setTicketTokenId] = useState<string | null>(null);
  const [ticketSeat, setTicketSeat] = useState<number | null>(null);
  const [isCheckedIn, setIsCheckedInState] = useState<boolean>(false);
  const [isVictoryEdition, setIsVictoryEditionState] = useState<boolean>(false);
  const ticketEventId = 'WC2026-FIN';

  // Real Web3 Wallet Connection (MetaMask / EIP-1193) with fallback
  const connectWallet = useCallback(async () => {
    setIsConnecting(true);

    try {
      const ethereum = (window as any).ethereum;
      if (ethereum) {
        // Request MetaMask account connection
        const accounts = await ethereum.request({ method: 'eth_requestAccounts' });
        if (accounts && accounts.length > 0) {
          // Automatically switch/add Injective inEVM Testnet
          try {
            await switchToInjectiveNetwork(ethereum);
          } catch (netErr) {
            console.warn('Network switch warning:', netErr);
          }

          const userAddress = accounts[0];
          setWalletAddress(userAddress);
          setUsdcBalance(500.0);
          setInjBalance(12.45);

          // Fetch ticket from Supabase via backend API
          try {
            const res = await fetch(`http://localhost:3000/api/tickets?ownerAddress=${userAddress}`);
            const data = await res.json();
            if (data.success && data.ticket) {
              setTicketTokenId(data.ticket.tokenId);
              setTicketSeat(data.ticket.seat);
              setIsCheckedInState(data.ticket.isCheckedIn);
              setIsVictoryEditionState(data.ticket.isVictoryEdition);
            } else {
              setTicketTokenId(null);
              setTicketSeat(null);
              setIsCheckedInState(false);
              setIsVictoryEditionState(false);
            }
          } catch (dbErr) {
            console.warn('DB ticket fetch error, defaulting:', dbErr);
            setTicketTokenId(null);
            setTicketSeat(null);
          }

          setIsConnecting(false);
          return;
        }
      }
    } catch (err) {
      console.warn('MetaMask connection rejected or unavailable, falling back to demo wallet:', err);
    }

    // Fallback: Instant simulated wallet connection
    await new Promise((res) => setTimeout(res, 500));
    const mockAddress = '0x' + Array.from({ length: 40 }, () =>
      '0123456789abcdef'[Math.floor(Math.random() * 16)]
    ).join('');
    setWalletAddress(mockAddress);
    setUsdcBalance(500.0);
    setInjBalance(12.45);

    // Fetch ticket for mock address (will be null initially)
    try {
      const res = await fetch(`http://localhost:3000/api/tickets?ownerAddress=${mockAddress}`);
      const data = await res.json();
      if (data.success && data.ticket) {
        setTicketTokenId(data.ticket.tokenId);
        setTicketSeat(data.ticket.seat);
        setIsCheckedInState(data.ticket.isCheckedIn);
        setIsVictoryEditionState(data.ticket.isVictoryEdition);
      } else {
        setTicketTokenId(null);
        setTicketSeat(null);
        setIsCheckedInState(false);
        setIsVictoryEditionState(false);
      }
    } catch {
      setTicketTokenId(null);
      setTicketSeat(null);
    }

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
    setUsdcBalance((prev) => Math.max(0, prev - 50));

    // Save ticket purchase to DB
    if (walletAddress) {
      fetch('http://localhost:3000/api/tickets/purchase', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tokenId, seat, ownerAddress: walletAddress })
      }).catch(err => console.error("Failed to sync ticket purchase to DB:", err));
    }
  }, [walletAddress]);

  const setCheckedIn = useCallback(() => {
    setIsCheckedInState(true);
    // Synced upon scan on the backend `/api/validator/scan`
  }, []);

  const setVictoryEdition = useCallback(() => {
    setIsVictoryEditionState(true);
    if (ticketTokenId) {
      fetch('http://localhost:3000/api/tickets/sync-victory', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tokenId: ticketTokenId })
      }).catch(err => console.error("Failed to sync victory ticket state to DB:", err));
    }
  }, [ticketTokenId]);

  // Handle wallet account switching automatically
  useEffect(() => {
    const ethereum = (window as any).ethereum;
    if (ethereum && ethereum.on) {
      const handleAccountsChanged = (accounts: string[]) => {
        if (accounts.length > 0) {
          setWalletAddress(accounts[0]);
        } else {
          disconnectWallet();
        }
      };
      ethereum.on('accountsChanged', handleAccountsChanged);
      return () => {
        if (ethereum.removeListener) {
          ethereum.removeListener('accountsChanged', handleAccountsChanged);
        }
      };
    }
  }, [disconnectWallet]);

  const truncatedAddress = walletAddress
    ? `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`
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