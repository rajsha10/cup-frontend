# InjPass Mocked vs. Functional Specifications

---

## 1. Mocked vs. Real Functionality

| Feature Component | Working / Ready to Test | Mocked / Simulated |
| :--- | :--- | :--- |
| **Ticket Purchase & Minting** | Selection of ticket tiers (VIP, Category 1) and seat numbers in [Home.tsx](file:///home/dayshift/Documents/cms/cup-frontend/src/pages/Home.tsx) is fully interactive. | The actual minting transaction is a mock simulation in [Home.tsx](file:///home/dayshift/Documents/cms/cup-frontend/src/pages/Home.tsx#L68-L74) (using `setTimeout` and local state) rather than a live on-chain call. |
| **Wallet Connection** | Real EIP-1193 MetaMask integration with automatic Injective inEVM Network switching in [Web3Context.tsx](file:///home/dayshift/Documents/cms/cup-frontend/src/context/Web3Context.tsx#L68-L93). | Falls back to a mock/simulated wallet address with loaded balances if MetaMask is unavailable. |
| **x402 API Paywall** | The Express server setup in [server.ts](file:///home/dayshift/Documents/cms/cup-backend/src/server.ts) applies the `gatePaywall` middleware on secure proof endpoints. | Currently bypassed using `Authorization: Bearer MOCK_x402_PAYMENT_TOKEN` headers (real USDC signature validation is stubbed). |
| **Smart Contract Interactions** | The contract [InjPassCollectible.sol](file:///home/dayshift/Documents/cms/cup-backend/src/contract/InjPassCollectible.sol) is written and compiled. | The script [deploy.ts](file:///home/dayshift/Documents/cms/cup-backend/src/contract/deploy.ts) is a template logger, and agents fall back to Injective MCP trading actions if `CONTRACT_ADDRESS` is not defined in `.env`. |
| **Live Match Feed & Events** | Polling the match scoreboard from the Express backend via [useLiveFeed.ts](file:///home/dayshift/Documents/cms/cup-frontend/src/hooks/useLiveFeed.ts) is functional. | The live match minute and score are stored in-memory in [server.ts](file:///home/dayshift/Documents/cms/cup-backend/src/server.ts#L16-L21) rather than a real external sports feed. |
| **AI Agents Telemetry** | [validator.ts](file:///home/dayshift/Documents/cms/cup-backend/src/agent/validator.ts) and [fanManager.ts](file:///home/dayshift/Documents/cms/cup-backend/src/agent/fanManager.ts) connect to the Injective MCP server to sign transactions. | Turnstile scans and goal milestone events are simulated using endpoint triggers. |

---

## 2. How to Test the Working Integration Flow

To test the entire interaction loop (Match Feed → Turnstile QR generation → Ticket Check-In → AI Fan upgrade):

### Step 1: Start the Backend & Validator Agent
Run this inside `cup-backend/` to launch both the Express API and the Validator Agent:
```bash
npm run dev
```

### Step 2: Start the Frontend
Run this inside `cup-frontend/` to launch the Vite server:
```bash
npm run dev
```
Open your browser at `http://localhost:5173`.

### Step 3: Test the Purchase and Ticket QR Flow
1. Connect your wallet (or use the simulated fallback wallet) on the landing page.
2. Select **Book Your Seat** $\rightarrow$ choose a tier $\rightarrow$ choose a seat $\rightarrow$ confirm minting.
3. Once minted, click **View My Ticket Wallet** or navigate to the **My Ticket** tab.
4. Click **Get Turnstile Access**. You will see the **dynamic QR code** generate, complete with a rotating 15-second countdown progress ring fueled by backend proof tokens.

### Step 4: Test the Gate Entry check-in
1. Go to the **Turnstile Demo** tab.
2. Click **Simulate Turnstile Scan**.
3. Watch the validator agent's terminal logs verify the proof and execute the gate unlock sequence.

### Step 5: Test the AI Fan Engagement Agent (NFT Upgrades)
1. Go to the **AI Agent Demo** tab.
2. Under **Match Event Simulator**, click **Simulate Goal (GOAL)** or **Simulate Argentina Victory (MATCH_END_WIN)**.
3. The match feed updates, and the AI agent detects the milestone, upgrade-triggering the NFT ticket into a **Gold Victory Edition** both on the ticket view and in the agent's telemetry console.
