# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

## important
required:

1. x402 Paywall Bypass	
server.ts
current mock: Skips x402 payment verification if Authorization: Bearer MOCK_x402_PAYMENT_TOKEN header is passed.	
required : Evaluates real $0.01 USDC payment signatures via @x402/express against https://x402.org/facilitator on Base Sepolia (eip155:84532).

2. Frontend Live Feed	
useLiveFeed.ts
current mock : Uses a hardcoded FALLBACK_FEED if backend is offline.	
required: Fetches live events from the backend without fallback.

3. after demo can be done : In-Memory Match State	
server.ts
current mock: liveMatchState uses hardcoded strings ("Argentina 2 - 1 France").	
required: Connects to a real sports API data feed or web-hook stream.

4. Turnstile Gate Agent	
validator.ts
current mock: Uses mockScannedToken string; falls back to MCP trade_open tool if CONTRACT_ADDRESS or PRIVATE_KEY are not set.	
required: Receives live scanned tokenId from frontend and executes contract.validateGateEntry(tokenId) on-chain.

5. Fan Collectible Agent	
fanManager.ts
current mock : Relies on simulated endpoints /api/admin/simulate-trigger.	
required: Monitors real-time match events and submits on-chain transactions (upgradeToVictoryMetadata) via InjPassCollectible.sol.

## important end

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])

```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])

```
