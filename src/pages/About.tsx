import React from 'react';
import { Card } from '../components/Card';

export const About: React.FC = () => {
  return (
    <div style={{ maxWidth: '1000px', margin: '2rem auto', padding: '0 1.5rem', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
        <div className="accent-stripe" style={{ margin: '0 auto 1rem auto' }}></div>
        <h2 style={{ fontSize: '3rem' }}>How AgenticCup Works</h2>
        <p style={{ fontSize: '1.125rem', color: 'var(--color-text-secondary)', maxWidth: '600px', margin: '0.5rem auto' }}>
          Discover the mathematical engine, micropayment gateways, and autonomous agent loops powering our sports hedging mechanism.
        </p>
      </div>

      {/* Poisson Explainer */}
      <Card title="1. Mathematical Odds Engine (Poisson Distribution)">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <p>
            At any minute t (from 0 to 90) of a football match, we calculate the remaining match duration T_rem = 90 - t. 
            Using the historical expected goals (xG1 and xG2) recorded by the live data oracle, the system estimates the scoring intensity rate (lambda) for the remainder of the match:
          </p>
          <div style={{ 
            padding: '1.25rem', 
            backgroundColor: 'rgba(15, 15, 17, 0.02)', 
            borderRadius: '12px',
            fontFamily: 'monospace',
            textAlign: 'center',
            fontSize: '1.1rem',
            color: 'var(--color-text-primary)',
            borderLeft: '4px solid var(--color-primary)'
          }}>
            λ₁ = (xG₁ / t) * (90 - t) &nbsp;&nbsp;|&nbsp;&nbsp; λ₂ = (xG₂ / t) * (90 - t)
          </div>
          <p>
            The probability of a team scoring exactly $g$ goals during the remainder of the match is calculated using the Poisson Probability Mass Function (PMF):
          </p>
          <div style={{ 
            padding: '1.25rem', 
            backgroundColor: 'rgba(15, 15, 17, 0.02)', 
            borderRadius: '12px',
            fontFamily: 'monospace',
            textAlign: 'center',
            fontSize: '1.1rem',
            color: 'var(--color-text-primary)',
            borderLeft: '4px solid var(--color-primary)'
          }}>
            P(g; λ) = (λᵍ * e⁻λ) / g!
          </div>
          <p>
            Finally, we calculate the win probability P_win by summing the joint probabilities of all scoring scenarios where the team's total goals (current goals + simulated remaining goals) exceeds the opponent's.
          </p>
        </div>
      </Card>

      {/* x402 Explainer */}
      <Card title="2. Paywalled Premium Telemetry (x402 Micropayments)">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <p>
            Traditional SaaS licensing and recurring subscriptions are poorly optimized for episodic, high-frequency software agents. 
            AgenticCup resolves this by monetizing its Live Stats Oracle with the **x402 Protocol** over the Base Sepolia network.
          </p>
          <ul style={{ paddingLeft: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <li><strong>Pay-Per-Request:</strong> Agents only pay for telemetry when they trigger calculations. Each GET request to the stats oracle costs exactly <strong>$0.01 USDC</strong>.</li>
            <li><strong>M2M Settlement:</strong> Standard EVM wallet handshake metadata is handled headers-side. The Express middleware directly validates on-chain payments prior to returning match details.</li>
            <li><strong>Mock Mode:</strong> During sandbox validation, developer test bypass tokens (<code>Authorization: Bearer MOCK_x402_PAYMENT_TOKEN</code>) are supported to prevent developer coin drainage.</li>
          </ul>
        </div>
      </Card>

      {/* Injective & MCP Explainer */}
      <Card title="3. Autonomous Trading & MCP Execution">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <p>
            When the calculated win probability deviates from the market implied odds (e.g. on Prediction Markets) by more than 5.0% (the edge threshold), the agent takes autonomous hedging action.
          </p>
          <p>
            Instead of manual clicks, the agent communicates with the **Injective MCP Server** using JSON-RPC standard tool invocations. The MCP server automatically handles wallet credentials, signs transactions, and broadcasts leverage derivative trades (perpetuals) to Injective testnet:
          </p>
          <div style={{ 
            padding: '1rem', 
            backgroundColor: 'rgba(15, 15, 17, 0.9)', 
            borderRadius: '12px',
            color: '#A7F3D0',
            fontFamily: 'monospace',
            fontSize: '0.85rem',
            overflowX: 'auto'
          }}>
            {`// Autonomous Agent MCP execution payload
mcpClient.callTool({
  name: "trade_open",
  arguments: {
    symbol: "INJ",
    side: "long",
    amount: "1.5004", // USDC notional size
    leverage: 5,
    address: "inj12hwzwusuejawqx2...edx",
    password: "agentic-password"
  }
});`}
          </div>
        </div>
      </Card>

    </div>
  );
};
