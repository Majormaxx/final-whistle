# Final Whistle

Self-resolving prediction markets on Somnia. Markets settle themselves — smart contracts call live sports APIs through Somnia Agents, validators reach consensus, and winnings land in wallets seconds after the event.

No dispute panel. No resolution queue. The market reads the world itself.

**Live**: [app-pearl-seven-19.vercel.app](https://app-pearl-seven-19.vercel.app)

## Architecture

```
contracts/   Solidity contracts — market factory, LMSR pricing, resolver agent
sdk/         TypeScript SDK — typed event subscriptions, market queries, bet helpers
app/         Web frontend — match list, live odds, bet flow, bot leaderboard
bot/         Demo trader bot — programmatic SDK usage, live PnL
```

## Contracts

- **MarketFactory** — spawns match markets from fixture data
- **MatchMarket** — 1X2 LMSR market, auto-closes at full-time
- **NextGoalMarket** — binary window market, spawns reactively during live matches
- **ResolverAgent** — calls Somnia Agents platform, writes consensus result on-chain

Network: Somnia Testnet (chain ID 50312)

- ResolverAgent: `0x0FEb20D1705307F610DB6284ADECA9FA89a41DA0`
- MarketFactory: `0x22d0081678Fe1E47cde6fd85512C6BFaB3849BF7`

## Quickstart

```bash
# contracts
cd contracts && forge build

# sdk
cd sdk && pnpm install && pnpm build

# app
cd app && pnpm install && pnpm dev

# bot
cd bot && pnpm install && pnpm start
```

## Built for

Somnia Agentathon — Encode Club × Somnia, June 2026

---

[Majormaxx](https://github.com/Majormaxx) · [@Majormaxx_](https://x.com/Majormaxx_)
