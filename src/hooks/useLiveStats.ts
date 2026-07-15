import { useState, useEffect } from 'react';

export interface TeamStats {
  name: string;
  xG: number;
  goals: number;
}

export interface LiveStats {
  matchId: string;
  elapsedTime: number;
  team1: TeamStats;
  team2: TeamStats;
  highImpactEvent: string | null;
}

export function useLiveStats() {
  const [data, setData] = useState<LiveStats | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isSimulated, setIsSimulated] = useState<boolean>(false);

  const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:3000";

  const fetchStats = async () => {
    try {
      const response = await fetch(`${apiUrl}/api/live-stats`, {
        headers: { 
          "Authorization": "Bearer MOCK_x402_PAYMENT_TOKEN",
          "Content-Type": "application/json"
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const json = await response.json();
      if (json.status === "success") {
        setData(json.data);
        setError(null);
        setLoading(false);
      }
    } catch (err: any) {
      console.warn("Failed to fetch live stats:", err.message);
      setError("Backend Offline - Check Server Connection");
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
    const intervalId = setInterval(fetchStats, 5000); // Poll every 5 seconds for snappier UI

    return () => {
      clearInterval(intervalId);
    };
  }, []);

  // Telemetry Controls for Simulation (sends mutations to backend)
  const simulateGoal = async (team: 1 | 2) => {
    setIsSimulated(true);
    if (!data) return;

    const payload = team === 1 ? {
      team1: {
        goals: data.team1.goals + 1,
        xG: Number((data.team1.xG + 0.75).toFixed(2))
      },
      highImpactEvent: `GOAL! ${data.team1.name} scores!`
    } : {
      team2: {
        goals: data.team2.goals + 1,
        xG: Number((data.team2.xG + 0.75).toFixed(2))
      },
      highImpactEvent: `GOAL! ${data.team2.name} scores!`
    };

    try {
      await fetch(`${apiUrl}/api/live-stats/simulate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      fetchStats();
    } catch (err) {
      console.error("Simulation failed:", err);
    }
  };

  const simulateMinuteTick = async () => {
    setIsSimulated(true);
    if (!data) return;

    if (data.elapsedTime >= 90) {
      try {
        await fetch(`${apiUrl}/api/live-stats/simulate`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ highImpactEvent: "Full Time Whistle!" })
        });
        fetchStats();
      } catch (err) {
        console.error("Simulation failed:", err);
      }
      return;
    }

    const t1xGInc = Math.random() > 0.7 ? 0.05 : 0;
    const t2xGInc = Math.random() > 0.7 ? 0.05 : 0;

    const payload = {
      elapsedTime: data.elapsedTime + 1,
      team1: { xG: Number((data.team1.xG + t1xGInc).toFixed(2)) },
      team2: { xG: Number((data.team2.xG + t2xGInc).toFixed(2)) },
      highImpactEvent: data.elapsedTime + 1 === 90 ? "Full Time!" : null
    };

    try {
      await fetch(`${apiUrl}/api/live-stats/simulate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      fetchStats();
    } catch (err) {
      console.error("Simulation failed:", err);
    }
  };

  const setTeamsData = async (t1xG: number, t2xG: number, t1Goals: number, t2Goals: number, elapsed: number) => {
    setIsSimulated(true);
    const payload = {
      elapsedTime: elapsed,
      team1: { xG: t1xG, goals: t1Goals },
      team2: { xG: t2xG, goals: t2Goals },
      highImpactEvent: null
    };

    try {
      await fetch(`${apiUrl}/api/live-stats/simulate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      fetchStats();
    } catch (err) {
      console.error("Simulation failed:", err);
    }
  };

  const resetSimulation = async () => {
    setIsSimulated(false);
    setLoading(true);
    try {
      await fetch(`${apiUrl}/api/live-stats/reset`, { method: "POST" });
      fetchStats();
    } catch (err) {
      console.error("Reset simulation failed:", err);
    }
  };

  return { 
    data, 
    error, 
    loading, 
    isSimulated, 
    simulateGoal, 
    simulateMinuteTick, 
    setTeamsData,
    resetSimulation 
  };
}
