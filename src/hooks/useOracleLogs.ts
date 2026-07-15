import { useState, useEffect } from 'react';

export interface OracleLog {
  matchId: string;
  elapsedTime: number;
  team1xG: number;
  team2xG: number;
  winProbability: number;
  agentAddress: string;
  timestamp: Date;
  txHash: string;
}


export function useOracleLogs() {
  const [logs, setLogs] = useState<OracleLog[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isContractMode, setIsContractMode] = useState<boolean>(false);

  const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:3000";

  const fetchLogs = async () => {
    try {
      const response = await fetch(`${apiUrl}/api/oracle-logs`);
      const data = await response.json();
      const formattedLogs = data.map((item: any) => ({
        ...item,
        timestamp: new Date(item.timestamp)
      }));
      setLogs(formattedLogs);
      setLoading(false);
    } catch (err) {
      console.warn("Failed to fetch oracle logs:", err);
      setLoading(false);
    }
  };

  // Allow appending new logs (POSTs to backend)
  const addLog = async (
    matchId: string,
    elapsedTime: number,
    team1xG: number,
    team2xG: number,
    winProbability: number
  ) => {
    try {
      await fetch(`${apiUrl}/api/oracle-logs`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          matchId,
          elapsedTime,
          team1xG,
          team2xG,
          winProbability,
          agentAddress: "inj12hwzwusuejawqx2lraq4dsawsk5yvxtgfe0edx"
        })
      });
      fetchLogs();
    } catch (err) {
      console.error("Failed to add oracle log:", err);
    }
  };

  useEffect(() => {
    if (isContractMode) {
      // Standard viem/ethers call setup would go here if contract existed.
      setLoading(false);
      return;
    }

    fetchLogs();
    const intervalId = setInterval(fetchLogs, 5000); // Poll every 5s

    return () => {
      clearInterval(intervalId);
    };
  }, [isContractMode]);

  return { logs, loading, addLog, isContractMode, setIsContractMode };
}
