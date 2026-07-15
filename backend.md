# 🏗️ AgenticCup Backend Documentation & Integration Specification

AgenticCup is an autonomous, statistically-driven sports prediction and hedging platform built on the **Model Context Protocol (MCP)**, **x402 Micropayments**, and the **Injective Protocol** decentralized derivatives exchange. 

This document provides a comprehensive breakdown of the backend architecture, APIs, mathematical models, agent behaviors, smart contracts, and step-by-step guides for connecting the React frontend.

---

## 🗺️ System Architecture

The following diagram illustrates the lifecycle of match data, payment flow, model calculations, and automated order execution:

```mermaid
sequenceDiagram
    autonumber
    participant FE as React Frontend
    participant BE as Express API Server (Oracle)
    participant Faci as x402 Facilitator (Public Testnet)
    participant Agent as Autonomous Trading Agent
    participant MCP as Injective MCP Server
    participant SC as AgenticCupOracleRegistry.sol
    participant Inj as Injective Chain (Testnet)

    %% Flow 1: Live Stats Fetching
    rect rgb(240, 245, 255)
        Note over FE, BE: Live Match Stats & Micropayments
        FE->>BE: GET /api/live-stats (with x402 Payment Headers or Mock Bearer Token)
        alt is Mock Mode (Authorization: Bearer MOCK_x402_PAYMENT_TOKEN)
            BE-->>FE: HTTP 200 OK: Live Stats JSON
        else is Live x402 Micropayment Mode
            BE->>BE: paymentMiddleware checks Payment Token
            BE->>Faci: Verify payment on-chain (Base Sepolia eip155:84532)
            BE-->>FE: HTTP 200 OK: Live Stats JSON (if paid)
        end
    end

    %% Flow 2: Autonomous Hedging & Probability Loop
    rect rgb(245, 240, 255)
        Note over Agent, Inj: Autonomous Decision & Hedging Loop
        loop Every 10 Seconds
            Agent->>BE: GET /api/live-stats (using Mock Token)
            BE-->>Agent: Live Stats Data (xG, elapsedTime, goals)
            Agent->>Agent: Calculate Win Probability via Poisson Distribution (jStat)
            Agent->>Agent: Compare against Implied Market Odds & Edge Threshold (±5%)
            alt Arbitrage Edge Detected
                Agent->>MCP: callTool("market_price", {symbol: "INJ"})
                MCP-->>Agent: Current INJ Price (e.g. $4.76)
                Agent->>Agent: Calculate Notional Amount (targetQty * price * 1.05 buffer)
                Agent->>MCP: callTool("trade_open", {symbol: "INJ", side, amount, leverage: 5, address, password})
                MCP->>Inj: Execute Perpetual Market Order (Cosmos Signing)
                Inj-->>MCP: Transaction Hash
                MCP-->>Agent: Execution Result / Tx Hash
            end
        end
    end
```

---

## ⚙️ Environment Variables (`.env`)

To run the backend, create a `.env` file in `d:\hackathon\cup\` with the following variables:

```ini
# Address to which x402 micropayments are routed ($0.01 per API request)
WALLET_ADDRESS=0x55dc27721cccbae0195f1f4156c3ae85a8461968

# Private key of the trading wallet on Injective testnet
TESTNET_PRIVATE_KEY=b1e87762ffd962075ef96ef915ec32bac6b47971f26539a460bbe4257df37ee0

# The corresponding Injective Address (derived from the private key)
INJECTIVE_ADDRESS=inj12hwzwusuejawqx2lraq4dsawsk5yvxtgfe0edx

# Port on which the Express Server runs
PORT=3000

# Frontend URL to allow CORS access
FRONTEND_URL=http://localhost:5173
```

---

## ⚡ Express API Server (`src/api/server.ts`)

The API server acts as the Premium Data Oracle, delivering live match stats paywalled by the **x402 Protocol**.

*   **Server Host:** `http://localhost:3000` (or `process.env.PORT`)
*   **Facilitator Node:** `https://x402.org/facilitator`
*   **Payment Asset & Network:** `$0.01 USDC` on Base Sepolia (`eip155:84532`)
*   **Destination Wallet:** `WALLET_ADDRESS` from `.env`

### Endpoints

#### `GET /api/live-stats`

Retrieve real-time stats including match duration elapsed and team expected goals (`xG`).

*   **Headers for Bypassing Paywall (Development Mode):**
    ```http
    Authorization: Bearer MOCK_x402_PAYMENT_TOKEN
    ```
*   **Response Payload (HTTP 200 OK):**
    ```json
    {
      "status": "success",
      "paid": true,
      "data": {
        "matchId": "WC2026-FINAL",
        "elapsedTime": 65,
        "team1": {
          "name": "Argentina",
          "xG": 1.85,
          "goals": 1
        },
        "team2": {
          "name": "France",
          "xG": 0.95,
          "goals": 0
        },
        "highImpactEvent": null
      }
    }
    ```
*   **Live Mode Behavior (without Mock Token):**
    The `paymentMiddleware` intercepts the request. If no valid x402 payment proof is provided in the headers, the server responds with **HTTP 402 Payment Required** along with the metadata headers detailing the target chain, destination wallet, and price.

---

## 🧮 Mathematical Win Probability Engine

The Autonomous Agent uses a Poisson distribution framework (provided by the `jstat` library) to translate raw Expected Goals (`xG`) into a real-time win probability.

### Mathematical Equations

For a football match at minute $t$ ($t \in [0, 90]$):
1.  **Remaining Time ($T_{rem}$):**
    $$T_{rem} = 90 - t$$
2.  **Expected Goal Rate (Lambda):**
    We calculate the expected future scoring rate per minute based on historical performance ($xG$) and scale it to the remaining duration:
    $$\lambda_1 = \frac{xG_1}{t} \times T_{rem}$$
    $$\lambda_2 = \frac{xG_2}{t} \times T_{rem}$$
3.  **Poisson Probability Mass Function (PMF):**
    The probability of scoring exactly $g$ goals during the remainder of the match is:
    $$P(g; \lambda) = \frac{\lambda^g e^{-\lambda}}{g!}$$
4.  **Win Probability calculation:**
    We sum all joint probabilities where the future goals of Team 1 ($g_1$) exceed Team 2 ($g_2$) up to a maximum limit (e.g. 10 goals):
    $$P(\text{Win}) = \sum_{g_1=0}^{10} \sum_{g_2=0}^{g_1-1} P(g_1; \lambda_1) \times P(g_2; \lambda_2)$$

### ⚠️ Important Model Detail & Constraint
The `calculateWinProbability` function currently evaluates the win probability **purely based on future goals scored from the current minute forward**. It does **not** offset the calculation by the current actual score (e.g. the fact that Argentina is already up 1-0 at minute 65). 
*   *For a complete model calculation, the integration should modify the inequality constraint to:*
    $$g_1 + \text{currentGoals}_1 > g_2 + \text{currentGoals}_2$$

---

## 🤖 Autonomous Hedging Loop & Injective MCP Bridge

The agent runs in a continuous loop (`src/agent/trader.ts`) and interacts with the Injective blockchain using the Model Context Protocol (MCP) server.

### Operational Step-by-Step Flow

1.  **Start and Connection:** Connects via standard I/O (stdio) to the Injective MCP server located at `../mcp-server/dist/mcp/server.js`.
2.  **Wallet Import:** Calls MCP tool `wallet_import` using the private key configured in the `.env` file and password `"agentic-password"`.
3.  **Address Discovery:** Calls MCP tool `wallet_list` to fetch all local wallet addresses and assigns the derived address to `activeWalletAddress` (falls back to `INJECTIVE_ADDRESS`).
4.  **Interval Trigger (Every 10 Seconds):**
    *   Fetches latest stats from `http://localhost:3000/api/live-stats` using the bypass token.
    *   Calculates Win Probability ($P_{win}$).
    *   Compares $P_{win}$ against the implied market odds ($50.00\%$) and edge threshold ($5.00\%$):
        *   **Long Arbitrage Trigger:** If $P_{win} > 55.00\%$ ($0.50 + 0.05$), calls `executeHedge("long", 0.3)`.
        *   **Short Arbitrage Trigger:** If $P_{win} < 45.00\%$ ($0.50 - 0.05$), calls `executeHedge("short", 0.3)`.
        *   Otherwise, does nothing and waits for the next tick.

### 🛠️ Injective MCP Tool Details

When executing a trade (`executeHedge`), the agent invokes the following JSON-RPC tool calls on the MCP:

#### 1. Retrieve Current Asset Price (`market_price`)
*   **Arguments:**
    ```json
    { "symbol": "INJ" }
    ```
*   **Output:** Returns current price data (used to calculate notional amount).

#### 2. Execute Perpetual Market Order (`trade_open`)
*   **Notional Amount Calculation:**
    The agent adds a 5% buffer to guarantee that the quantity matches or exceeds the target `0.3 INJ`:
    $$\text{notionalAmount} = \text{targetQty} \times \text{price} \times 1.05$$
*   **Arguments:**
    ```json
    {
      "symbol": "INJ",
      "side": "long" | "short",
      "amount": "1.5004", // USDC notional amount (stringified float)
      "leverage": 5,
      "address": "inj12hwzwusuejawqx2lraq4dsawsk5yvxtgfe0edx",
      "password": "agentic-password"
    }
    ```
*   **Output:** Transaction hash of the executed order, or `"no liquidity"` warning (common on testnet environment but indicates successful routing).

---

## 📜 Smart Contract Specification (`AgenticCupOracleRegistry.sol`)

The platform includes a smart contract registry (`src/contract/AgenticCupOracleRegistry.sol`) which logs mathematical and match states on-chain, acting as the historical audit trail for the frontend.

### Contract Struct & State
```solidity
struct OracleData {
    string matchId;
    uint256 elapsedTime;
    uint256 team1xG;         // Scaled by 100 (e.g., 1.85 xG = 185)
    uint256 team2xG;         // Scaled by 100
    uint256 winProbability;  // Scaled by 100 (e.g., 39.55% = 3955)
    address agentAddress;
    uint256 timestamp;
}

address public adminAgent;     // Authorized agent address allowed to submit logs
OracleData[] public oracleHistory;
```

### Events
```solidity
event OracleUpdate(
    string matchId, 
    uint256 elapsedTime, 
    uint256 winProbability, 
    address agent
);
```

### Callable Functions
*   `publishOracleState(string matchId, uint256 elapsedTime, uint256 team1xG, uint256 team2xG, uint256 winProbability)`
    *   *Permissions:* `onlyAgent` (restricted to `adminAgent`).
    *   *Behavior:* Adds a new record to `oracleHistory` and emits the `OracleUpdate` event.
*   `getUpdateCount()`
    *   *Type:* `view` / `external`.
    *   *Returns:* `uint256` count of total history entries.

---

## 🔌 Frontend Connection Guide

This blueprint details how the frontend should connect to the Express API and read the on-chain smart contract logs.

### 1. Connecting to the Express Data Server (`http://localhost:3000`)

Use this React custom hook inside `cup-frontend/src/hooks/useLiveStats.ts` to sync the dashboard with real-time stats:

```typescript
import { useState, useEffect } from 'react';

export interface LiveStats {
  matchId: string;
  elapsedTime: number;
  team1: { name: string; xG: number; goals: number };
  team2: { name: string; xG: number; goals: number };
  highImpactEvent: string | null;
}

export function useLiveStats() {
  const [data, setData] = useState<LiveStats | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch("http://localhost:3000/api/live-stats", {
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
        }
      } catch (err: any) {
        setError(err.message || "Failed to fetch stats");
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
    const interval = setInterval(fetchStats, 10000); // Poll every 10 seconds
    return () => clearInterval(interval);
  }, []);

  return { data, error, loading };
}
```

### 2. Reading Smart Contract Logs (Base Sepolia / Injective EVM)

Use this hook inside `cup-frontend/src/hooks/useOracleLogs.ts` to read the log database and listen to updates using **viem** or **ethers.js**:

```typescript
import { useState, useEffect } from 'react';
import { createPublicClient, http, parseAbi } from 'viem';
import { baseSepolia } from 'viem/chains';

const CONTRACT_ABI = parseAbi([
  'struct OracleData { string matchId; uint256 elapsedTime; uint256 team1xG; uint256 team2xG; uint256 winProbability; address agentAddress; uint256 timestamp; }',
  'function getUpdateCount() view returns (uint256)',
  'function oracleHistory(uint256) view returns (OracleData)',
  'event OracleUpdate(string matchId, uint256 elapsedTime, uint256 winProbability, address agent)'
]);

const CONTRACT_ADDRESS = "0xYourDeployedOracleContractAddressHere";

export function useOracleLogs() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const client = createPublicClient({
      chain: baseSepolia,
      transport: http()
    });

    const fetchHistory = async () => {
      try {
        const count = await client.readContract({
          address: CONTRACT_ADDRESS,
          abi: CONTRACT_ABI,
          functionName: 'getUpdateCount'
        }) as bigint;

        const history: any[] = [];
        for (let i = 0; i < Number(count); i++) {
          const item = await client.readContract({
            address: CONTRACT_ADDRESS,
            abi: CONTRACT_ABI,
            functionName: 'oracleHistory',
            args: [BigInt(i)]
          }) as any;
          
          history.push({
            matchId: item.matchId,
            elapsedTime: Number(item.elapsedTime),
            team1xG: Number(item.team1xG) / 100, // Unscale
            team2xG: Number(item.team2xG) / 100, // Unscale
            winProbability: Number(item.winProbability) / 100, // Unscale (e.g. 39.55)
            agentAddress: item.agentAddress,
            timestamp: new Date(Number(item.timestamp) * 1000)
          });
        }
        setLogs(history.reverse()); // Show newest first
      } catch (err) {
        console.error("Failed to read contract logs:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();

    // Listen to real-time events
    const unwatch = client.watchContractEvent({
      address: CONTRACT_ADDRESS,
      abi: CONTRACT_ABI,
      eventName: 'OracleUpdate',
      onLogs: (eventLogs) => {
        fetchHistory(); // Refresh history upon new oracle update
      }
    });

    return () => unwatch();
  }, []);

  return { logs, loading };
}
```

### 3. Simulating Live x402 Micropayments (Optional Production Integration)

If you migrate from mock mode to live micropayments on the frontend, wrap the requests using the `@x402/fetch` wrapper:

```typescript
import { wrapFetchWithPaymentFromConfig } from "@x402/fetch";
import { ExactEvmScheme } from "@x402/evm";
import { createWalletClient, custom } from "viem";
import { baseSepolia } from "viem/chains";

export async function createPaidFetchClient() {
  // 1. Get browser provider (MetaMask / Coinbase Wallet)
  const [account] = await window.ethereum.request({ method: 'eth_requestAccounts' });
  const walletClient = createWalletClient({
    account,
    chain: baseSepolia,
    transport: custom(window.ethereum)
  });

  // 2. Wrap standard fetch with the EVM Exact payment scheme
  return wrapFetchWithPaymentFromConfig(window.fetch, {
    schemes: [
      {
        network: "eip155:84532",
        client: new ExactEvmScheme(walletClient),
      },
    ],
  });
}
```

---

## 🛠️ Loop Gap Fix (On-Chain Logging)

Currently, the Node.js agent (`src/agent/trader.ts`) calculates data and submits hedges but does not write to the `AgenticCupOracleRegistry` smart contract. To make this complete and fully working in production, the agent can write updates on-chain directly before executing hedges.

You can implement this in `trader.ts` using the MCP tool `evm_broadcast` or a standard Ethereum signer (via Viem/Ethers):

### Code snippet for Agent to write on-chain:
```typescript
import { encodeFunctionData } from 'viem';

// Encode contract function arguments
const calldata = encodeFunctionData({
  abi: CONTRACT_ABI,
  functionName: 'publishOracleState',
  args: [
    data.matchId,
    BigInt(data.elapsedTime),
    BigInt(Math.round(data.team1.xG * 100)),
    BigInt(Math.round(data.team2.xG * 100)),
    BigInt(Math.round(winProb * 10000)) // Scaled by 100 in terms of percent (e.g. 3955)
  ]
});

// Broadcast using Injective EVM via MCP
await mcpClient.callTool({
  name: "evm_broadcast",
  arguments: {
    to: CONTRACT_ADDRESS,
    data: calldata,
    password: "agentic-password"
  }
});
```
