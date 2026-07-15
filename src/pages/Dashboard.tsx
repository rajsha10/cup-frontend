import React, { useState, useEffect } from 'react';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import type { LiveStats } from '../hooks/useLiveStats';
import type { OracleLog } from '../hooks/useOracleLogs';

interface DashboardProps {
  liveStats: {
    data: LiveStats | null;
    error: string | null;
    loading: boolean;
    isSimulated: boolean;
    simulateGoal: (team: 1 | 2) => void;
    simulateMinuteTick: () => void;
    setTeamsData: (t1xG: number, t2xG: number, t1Goals: number, t2Goals: number, elapsed: number) => void;
    resetSimulation: () => void;
  };
  oracleLogs: {
    logs: OracleLog[];
    loading: boolean;
    addLog: (matchId: string, elapsedTime: number, team1xG: number, team2xG: number, winProbability: number) => void;
  };
}

// Custom Poisson distribution math for dynamic UI calculation
function poissonPMF(g: number, lambda: number): number {
  if (lambda === 0) return g === 0 ? 1 : 0;
  let factorial = 1;
  for (let i = 1; i <= g; i++) factorial *= i;
  return (Math.pow(lambda, g) * Math.exp(-lambda)) / factorial;
}

function calculatePoissonOdds(
  t: number,
  xG1: number,
  xG2: number,
  goals1: number,
  goals2: number
) {
  if (t <= 0) {
    return { team1Prob: 0.38, team2Prob: 0.38, drawProb: 0.24 };
  }
  if (t >= 90) {
    if (goals1 > goals2) return { team1Prob: 1.0, team2Prob: 0.0, drawProb: 0.0 };
    if (goals1 < goals2) return { team1Prob: 0.0, team2Prob: 1.0, drawProb: 0.0 };
    return { team1Prob: 0.0, team2Prob: 0.0, drawProb: 1.0 };
  }

  const Trem = 90 - t;
  const lambda1 = (xG1 / t) * Trem;
  const lambda2 = (xG2 / t) * Trem;

  let team1Wins = 0;
  let team2Wins = 0;
  let draws = 0;

  for (let g1 = 0; g1 <= 10; g1++) {
    const p1 = poissonPMF(g1, lambda1);
    for (let g2 = 0; g2 <= 10; g2++) {
      const p2 = poissonPMF(g2, lambda2);
      const jointProb = p1 * p2;

      const finalG1 = g1 + goals1;
      const finalG2 = g2 + goals2;

      if (finalG1 > finalG2) {
        team1Wins += jointProb;
      } else if (finalG1 < finalG2) {
        team2Wins += jointProb;
      } else {
        draws += jointProb;
      }
    }
  }

  const total = team1Wins + team2Wins + draws;
  if (total === 0) return { team1Prob: 0.33, team2Prob: 0.33, drawProb: 0.34 };

  return {
    team1Prob: team1Wins / total,
    team2Prob: team2Wins / total,
    drawProb: draws / total
  };
}

export const Dashboard: React.FC<DashboardProps> = ({ liveStats, oracleLogs }) => {
  const {
    data,
    error,
    isSimulated,
    simulateGoal,
    simulateMinuteTick,
    setTeamsData,
    resetSimulation,
  } = liveStats;

  const { logs } = oracleLogs;

  // Agent State & Balances
  const [isAgentRunning, setIsAgentRunning] = useState<boolean>(true);
  const [leverage, setLeverage] = useState<number>(5);
  const [usdcBalance, setUsdcBalance] = useState<number>(1250.0);
  const [injBalance, setInjBalance] = useState<number>(245.85);
  const [walletAddress, setWalletAddress] = useState<string>("");
  
  // Custom execution logs
  const [tradeLogs, setTradeLogs] = useState<{
    time: string;
    action: string;
    notional: string;
    txHash: string;
  }[]>([]);

  const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:3000";

  const fetchAgentData = async () => {
    try {
      const configRes = await fetch(`${apiUrl}/api/agent/config`);
      const configData = await configRes.json();
      setIsAgentRunning(configData.isRunning);
      setLeverage(configData.leverage);

      const stateRes = await fetch(`${apiUrl}/api/agent/state`);
      const stateData = await stateRes.json();
      setUsdcBalance(stateData.usdcBalance);
      setInjBalance(stateData.injBalance);
      setWalletAddress(stateData.walletAddress);

      const logsRes = await fetch(`${apiUrl}/api/agent/trade-logs`);
      const logsData = await logsRes.json();
      setTradeLogs(logsData);
    } catch (err) {
      console.warn("Failed to fetch agent state:", err);
    }
  };

  useEffect(() => {
    fetchAgentData();
    const interval = setInterval(fetchAgentData, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleToggleAgent = async () => {
    const nextVal = !isAgentRunning;
    setIsAgentRunning(nextVal);
    try {
      await fetch(`${apiUrl}/api/agent/config`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isRunning: nextVal })
      });
    } catch (err) {
      console.error("Failed to toggle agent:", err);
    }
  };

  const handleLeverageChange = async (newLeverage: number) => {
    setLeverage(newLeverage);
    try {
      await fetch(`${apiUrl}/api/agent/config`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ leverage: newLeverage })
      });
    } catch (err) {
      console.error("Failed to set leverage:", err);
    }
  };

  // Read state safely with simulation fallback
  const matchId = data?.matchId || "WC2026-FINAL";
  const elapsedTime = data?.elapsedTime ?? 65;
  const team1 = data?.team1 || { name: "Argentina", xG: 1.85, goals: 1 };
  const team2 = data?.team2 || { name: "France", xG: 0.95, goals: 0 };
  const highImpactEvent = data?.highImpactEvent || null;

  // Calculated odds
  const { team1Prob, team2Prob, drawProb } = calculatePoissonOdds(
    elapsedTime,
    team1.xG,
    team2.xG,
    team1.goals,
    team2.goals
  );

  // Implied odds setup (simulate Polymarket/Market implied win rate for Argentina)
  const impliedMarketOdds = 0.50; // Constant benchmark
  const edgeThreshold = 0.05; // 5% edge
  const probabilityDelta = team1Prob - impliedMarketOdds;
  const hasArbitrageEdge = Math.abs(probabilityDelta) > edgeThreshold;

  return (
    <div style={{ flex: 1, paddingBottom: '3rem' }}>
      
      {/* Top Connection Status & Telemetry Mode Bar */}
      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 1.5rem', marginTop: '1rem' }}>
        <div className="glass-panel" style={{ 
          padding: '1rem 1.5rem', 
          display: 'flex', 
          flexWrap: 'wrap', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          gap: '1rem',
          borderRadius: '16px'
        }}>
          <div style={{ display: 'flex', gap: '1.25rem', flexWrap: 'wrap' }}>
            <div className="status-indicator" style={{ 
              color: error ? 'var(--color-warning)' : 'var(--color-success)',
              background: error ? 'rgba(245, 158, 11, 0.05)' : 'rgba(16, 185, 129, 0.05)'
            }}>
              <span className="status-dot active"></span>
              Oracle API: {error ? "Simulated Mode" : "Online"}
            </div>
            <div className="status-indicator" style={{ color: 'var(--color-success)', background: 'rgba(16, 185, 129, 0.05)' }}>
              <span className="status-dot active"></span>
              MCP Server: Connected
            </div>
            <div className="status-indicator" style={{ color: 'var(--color-success)', background: 'rgba(16, 185, 129, 0.05)' }}>
              <span className="status-dot active"></span>
              Smart Contract Sync: Active
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <span style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--color-text-secondary)' }}>
              Simulation Tools:
            </span>
            <Button variant="outline" size="sm" onClick={() => simulateMinuteTick()} style={{ padding: '0.4rem 1rem' }}>
              +1 Minute
            </Button>
            <Button variant="outline" size="sm" onClick={() => simulateGoal(1)} style={{ padding: '0.4rem 1rem' }}>
              Goal {team1.name}
            </Button>
            <Button variant="outline" size="sm" onClick={() => simulateGoal(2)} style={{ padding: '0.4rem 1rem' }}>
              Goal {team2.name}
            </Button>
            {isSimulated && (
              <button 
                onClick={() => resetSimulation()}
                style={{
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  color: 'var(--color-primary)',
                  cursor: 'pointer',
                  padding: '0.4rem 0.75rem',
                  border: 'none',
                  background: 'none'
                }}
              >
                Reset to API
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="dashboard-grid">
        
        {/* Left Side: Live Stats and probability calculations */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          {/* Live Match Oracle Card */}
          <Card 
            title="Live Match Oracle" 
            subtitle={`Match Event ID: ${matchId}`}
            badge={
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{
                  padding: '0.2rem 0.6rem',
                  backgroundColor: 'var(--color-primary)',
                  color: '#fff',
                  borderRadius: '6px',
                  fontWeight: 700,
                  fontSize: '0.85rem'
                }}>LIVE</span>
                <span className="accent-stripe-small"></span>
              </div>
            }
          >
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-around', 
              alignItems: 'center', 
              padding: '1.5rem 0',
              position: 'relative'
            }}>
              {/* Team 1 */}
              <div style={{ textAlign: 'center', flex: 1 }}>
                <h4 style={{ fontSize: '2.5rem', color: 'var(--color-text-primary)' }}>{team1.name}</h4>
                <div style={{ fontSize: '4.5rem', fontWeight: 700, fontFamily: 'var(--font-family-display)', color: 'var(--color-text-primary)' }}>
                  {team1.goals}
                </div>
                <div style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', fontWeight: 500 }}>
                  Expected Goals: {team1.xG.toFixed(2)} xG
                </div>
                {/* Simulated xG control */}
                <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginTop: '0.75rem' }}>
                  <Button variant="ghost" size="sm" style={{ padding: '2px 8px' }} onClick={() => setTeamsData(Math.max(0, team1.xG - 0.1), team2.xG, team1.goals, team2.goals, elapsedTime)}>-</Button>
                  <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>xG</span>
                  <Button variant="ghost" size="sm" style={{ padding: '2px 8px' }} onClick={() => setTeamsData(team1.xG + 0.1, team2.xG, team1.goals, team2.goals, elapsedTime)}>+</Button>
                </div>
              </div>

              {/* Time Counter */}
              <div style={{ textAlign: 'center', padding: '0 1rem' }}>
                <div style={{ 
                  fontFamily: 'var(--font-family-display)', 
                  fontSize: '3rem', 
                  color: 'var(--color-primary)',
                  letterSpacing: '0.05em'
                }}>
                  {elapsedTime}'
                </div>
                <div style={{ 
                  fontSize: '0.75rem', 
                  textTransform: 'uppercase', 
                  letterSpacing: '0.1em', 
                  color: 'var(--color-text-secondary)',
                  fontWeight: 600
                }}>
                  Match Minute
                </div>
                {/* Minute slider control */}
                <input 
                  type="range" 
                  min="1" 
                  max="90" 
                  value={elapsedTime} 
                  onChange={(e) => setTeamsData(team1.xG, team2.xG, team1.goals, team2.goals, parseInt(e.target.value))}
                  style={{
                    width: '100px',
                    marginTop: '1rem',
                    accentColor: 'var(--color-primary)',
                    cursor: 'pointer'
                  }}
                />
              </div>

              {/* Team 2 */}
              <div style={{ textAlign: 'center', flex: 1 }}>
                <h4 style={{ fontSize: '2.5rem', color: 'var(--color-text-primary)' }}>{team2.name}</h4>
                <div style={{ fontSize: '4.5rem', fontWeight: 700, fontFamily: 'var(--font-family-display)', color: 'var(--color-text-primary)' }}>
                  {team2.goals}
                </div>
                <div style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', fontWeight: 500 }}>
                  Expected Goals: {team2.xG.toFixed(2)} xG
                </div>
                {/* Simulated xG control */}
                <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginTop: '0.75rem' }}>
                  <Button variant="ghost" size="sm" style={{ padding: '2px 8px' }} onClick={() => setTeamsData(team1.xG, Math.max(0, team2.xG - 0.1), team1.goals, team2.goals, elapsedTime)}>-</Button>
                  <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>xG</span>
                  <Button variant="ghost" size="sm" style={{ padding: '2px 8px' }} onClick={() => setTeamsData(team1.xG, team2.xG + 0.1, team1.goals, team2.goals, elapsedTime)}>+</Button>
                </div>
              </div>
            </div>

            {/* High impact tickers */}
            {highImpactEvent && (
              <div style={{
                marginTop: '1rem',
                backgroundColor: 'rgba(24, 104, 255, 0.08)',
                border: '1px dashed var(--color-primary)',
                padding: '0.75rem 1rem',
                borderRadius: '8px',
                textAlign: 'center',
                fontWeight: 600,
                color: 'var(--color-primary)',
                animation: 'pulse-glow 1s infinite alternate'
              }}>
                📢 EVENT TICKER: {highImpactEvent}
              </div>
            )}
          </Card>

          {/* Win Probability Calculator & Odds Chart */}
          <Card 
            title="Win Probability Calculator" 
            subtitle="Poisson Math Model vs Implied Odds"
            headerAction={
              hasArbitrageEdge ? (
                <div 
                  className="status-indicator" 
                  style={{ 
                    color: 'var(--color-primary)', 
                    background: 'rgba(24, 104, 255, 0.08)',
                    borderColor: 'var(--color-primary)',
                    fontWeight: 700
                  }}
                >
                  ⚡ ARBITRAGE EDGE DETECTED
                </div>
              ) : (
                <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-text-secondary)' }}>
                  Market Odds Balanced
                </span>
              )
            }
          >
            <div style={{ padding: '1rem 0' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', textAlign: 'center', marginBottom: '2rem' }}>
                <div style={{ padding: '1rem', background: 'rgba(15, 15, 17, 0.02)', borderRadius: '12px' }}>
                  <div style={{ fontSize: '0.875rem', fontWeight: 500 }}>{team1.name} Win</div>
                  <div style={{ fontSize: '2rem', fontWeight: 700, fontFamily: 'var(--font-family-display)', color: 'var(--color-primary)' }}>
                    {(team1Prob * 100).toFixed(1)}%
                  </div>
                </div>
                <div style={{ padding: '1rem', background: 'rgba(15, 15, 17, 0.02)', borderRadius: '12px' }}>
                  <div style={{ fontSize: '0.875rem', fontWeight: 500 }}>Draw</div>
                  <div style={{ fontSize: '2rem', fontWeight: 700, fontFamily: 'var(--font-family-display)', color: 'var(--color-text-primary)' }}>
                    {(drawProb * 100).toFixed(1)}%
                  </div>
                </div>
                <div style={{ padding: '1rem', background: 'rgba(15, 15, 17, 0.02)', borderRadius: '12px' }}>
                  <div style={{ fontSize: '0.875rem', fontWeight: 500 }}>{team2.name} Win</div>
                  <div style={{ fontSize: '2rem', fontWeight: 700, fontFamily: 'var(--font-family-display)', color: 'var(--color-text-secondary)' }}>
                    {(team2Prob * 100).toFixed(1)}%
                  </div>
                </div>
              </div>

              {/* Graphic Odds Visualizer */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                
                {/* Team 1 Probability Bar vs Implied */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.5rem' }}>
                    <span>Poisson Win Prob ({team1.name}): {(team1Prob * 100).toFixed(1)}%</span>
                    <span style={{ color: 'var(--color-primary)' }}>
                      Delta: {probabilityDelta >= 0 ? '+' : ''}{(probabilityDelta * 100).toFixed(1)}%
                    </span>
                  </div>
                  <div style={{ height: '24px', background: 'rgba(15, 15, 17, 0.05)', borderRadius: '12px', overflow: 'hidden', position: 'relative' }}>
                    {/* Fill */}
                    <div style={{ 
                      width: `${team1Prob * 100}%`, 
                      height: '100%', 
                      backgroundColor: 'var(--color-primary)',
                      transition: 'width var(--transition-normal)'
                    }}></div>
                    
                    {/* Implied Market Marker Line */}
                    <div style={{
                      position: 'absolute',
                      left: `${impliedMarketOdds * 100}%`,
                      top: 0,
                      width: '2px',
                      height: '100%',
                      backgroundColor: 'var(--color-text-primary)',
                      zIndex: 5
                    }}></div>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--color-text-secondary)', marginTop: '0.25rem' }}>
                    <span>0% Prob</span>
                    <span>Market Implied Odd Benchmark ({impliedMarketOdds * 100}%)</span>
                    <span>100% Prob</span>
                  </div>
                </div>

                {/* Math Specs Explanation Block */}
                <div style={{
                  padding: '1rem',
                  backgroundColor: 'rgba(15, 15, 17, 0.02)',
                  borderRadius: '12px',
                  borderLeft: '4px solid var(--color-primary)',
                  fontSize: '0.875rem'
                }}>
                  💡 <strong>Model Specification:</strong> Estimating rate λ₁ = (xG₁ / t) * (90 - t). Win probability calculated via joint Poisson distribution sum where (g₁ + goals₁) &gt; (g₂ + goals₂).
                </div>

              </div>
            </div>
          </Card>

        </div>

        {/* Right Side: Wallet & Agent Controls, Action Logs */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          {/* Agent Control Center & Wallet Card */}
          <Card title="Control Center" subtitle="Autonomous Trading Wallet Status">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              
              {/* Wallet Info Layout */}
              <div style={{ 
                padding: '1.25rem', 
                background: 'rgba(15, 15, 17, 0.02)', 
                borderRadius: '16px',
                border: '1px solid var(--color-border)'
              }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-secondary)', textTransform: 'uppercase' }}>
                  Active Trading Wallet (Injective Testnet)
                </div>
                <div style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--color-text-primary)', margin: '0.25rem 0 1rem 0' }}>
                  {walletAddress || "Connecting Agent..."}
                </div>
                
                {/* Custom metrics divided by thin lines */}
                <div className="stats-grid-row" style={{ borderTop: '1px solid var(--color-border)', paddingTop: '1rem' }}>
                  <div className="stat-cell" style={{ padding: '0.5rem 0' }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>USDC Balance</div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--color-text-primary)' }}>
                      ${usdcBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </div>
                  </div>
                  <div className="stat-cell" style={{ padding: '0.5rem 0' }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>INJ Collateral</div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--color-primary)' }}>
                      {injBalance.toFixed(2)} INJ
                    </div>
                  </div>
                </div>
              </div>

              {/* Agent Runner Switch */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem 0' }}>
                <div>
                  <div style={{ fontWeight: 600, color: 'var(--color-text-primary)' }}>Autonomous Hedging Agent</div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>Run prediction hedging engine</div>
                </div>
                <div 
                  className={`switch-container ${isAgentRunning ? 'checked' : ''}`}
                  onClick={handleToggleAgent}
                >
                  <div className="switch-track">
                    <div className="switch-thumb"></div>
                  </div>
                </div>
              </div>

              {/* Leverage Slider */}
              <div style={{ padding: '0.5rem 0' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.5rem' }}>
                  <span>Derivatives Leverage Size</span>
                  <span style={{ color: 'var(--color-primary)' }}>{leverage}x</span>
                </div>
                <input 
                  type="range"
                  min="1"
                  max="10"
                  value={leverage}
                  onChange={(e) => handleLeverageChange(parseInt(e.target.value))}
                  style={{
                    width: '100%',
                    accentColor: 'var(--color-primary)',
                    cursor: 'pointer'
                  }}
                />
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>
                  <span>1x (Spot equivalent)</span>
                  <span>5x</span>
                  <span>10x Max</span>
                </div>
              </div>

            </div>
          </Card>

          {/* Action Log Ticker */}
          <Card title="Agent Execution Logs" subtitle="Live order transactions list">
            <div 
              className="custom-scrollbar"
              style={{ 
                height: '240px', 
                overflowY: 'auto', 
                display: 'flex', 
                flexDirection: 'column', 
                gap: '0.75rem',
                fontSize: '0.85rem'
              }}
            >
              {tradeLogs.map((log, index) => (
                <div 
                  key={index}
                  style={{
                    padding: '0.75rem',
                    backgroundColor: log.action.includes("🚨") ? 'rgba(24, 104, 255, 0.03)' : 'rgba(15, 15, 17, 0.01)',
                    borderLeft: `3px solid ${log.action.includes("🚨") ? 'var(--color-primary)' : 'var(--color-border)'}`,
                    borderRadius: '4px'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 600, color: 'var(--color-text-primary)' }}>
                    <span>{log.action}</span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>{log.time}</span>
                  </div>
                  {log.notional !== "-" && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.25rem', color: 'var(--color-text-secondary)' }}>
                      <span>Notional: {log.notional}</span>
                      <span style={{ fontSize: '0.75rem', fontFamily: 'monospace' }}>Tx: {log.txHash.slice(0, 10)}...</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </Card>

        </div>

      </div>

      {/* Row: Smart Contract Logs (Full Width) */}
      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 1.5rem', marginTop: '1.5rem' }}>
        <Card 
          title="On-Chain Oracle State Registry Logs" 
          subtitle="Audit ledger of AgenticCupOracleRegistry.sol updates"
        >
          <div style={{ overflowX: 'auto' }} className="custom-scrollbar">
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid var(--color-border)' }}>
                  <th style={{ padding: '0.75rem 0.5rem', color: 'var(--color-text-primary)' }}>Transaction Hash</th>
                  <th style={{ padding: '0.75rem 0.5rem', color: 'var(--color-text-primary)' }}>Match Minute</th>
                  <th style={{ padding: '0.75rem 0.5rem', color: 'var(--color-text-primary)' }}>Argentina xG</th>
                  <th style={{ padding: '0.75rem 0.5rem', color: 'var(--color-text-primary)' }}>France xG</th>
                  <th style={{ padding: '0.75rem 0.5rem', color: 'var(--color-text-primary)' }}>Win Probability</th>
                  <th style={{ padding: '0.75rem 0.5rem', color: 'var(--color-text-primary)' }}>Emitting Agent</th>
                  <th style={{ padding: '0.75rem 0.5rem', color: 'var(--color-text-primary)' }}>Block Timestamp</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log, index) => (
                  <tr key={index} style={{ borderBottom: '1px solid var(--color-border)' }}>
                    <td style={{ padding: '0.75rem 0.5rem', fontFamily: 'monospace', color: 'var(--color-primary)' }}>
                      <span style={{ cursor: 'pointer' }} onClick={() => navigator.clipboard.writeText(log.txHash)}>
                        {log.txHash.slice(0, 14)}...
                      </span>
                    </td>
                    <td style={{ padding: '0.75rem 0.5rem', fontWeight: 600 }}>{log.elapsedTime}'</td>
                    <td style={{ padding: '0.75rem 0.5rem' }}>{log.team1xG.toFixed(2)}</td>
                    <td style={{ padding: '0.75rem 0.5rem' }}>{log.team2xG.toFixed(2)}</td>
                    <td style={{ padding: '0.75rem 0.5rem', fontWeight: 700, color: 'var(--color-text-primary)' }}>
                      {log.winProbability}%
                    </td>
                    <td style={{ padding: '0.75rem 0.5rem', color: 'var(--color-text-secondary)', fontSize: '0.8rem' }}>
                      {log.agentAddress}
                    </td>
                    <td style={{ padding: '0.75rem 0.5rem', color: 'var(--color-text-secondary)' }}>
                      {log.timestamp.toLocaleTimeString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

    </div>
  );
};
