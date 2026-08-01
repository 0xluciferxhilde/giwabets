<div align="center">

<img width="1910" height="912" alt="image" src="https://github.com/user-attachments/assets/dfc1f793-39ee-4a9d-b043-bf68d6ba561a" />

# GiwaBets

**Provably-fair, fully on-chain prediction games built on GIWA Sepolia.**

Every outcome is decided by a single shared future GIWA block. Nobody can predict it. Nobody can fake it. Every result  and every payout  happens entirely on-chain.

[![Live App](https://img.shields.io/badge/App-giwabets.test--hub.xyz-000000?style=for-the-badge&logoColor=white)](https://giwabets.test-hub.xyz/)
[![Explorer](https://img.shields.io/badge/Explorer-sepolia--explorer.giwa.io-orange?style=for-the-badge)](https://sepolia-explorer.giwa.io/)

</div>

---

## ✨ What is GiwaBets?

GiwaBets is a provably-fair, fully on-chain betting platform built on the GIWA Sepolia testnet. Players predict properties of a **future GIWA block**  its hash, transaction count, and gas used  before it's mined. The moment the block lands, all 8 games settle automatically and winners receive **real ETH** sent directly to their wallets, straight from the smart contracts.

Bets are placed by signing a transaction directly with your wallet  funds go straight into the game contract, never through a custodial or treasury wallet. Payouts on settlement are sent by the contract itself, on-chain, with no manual claim step.

- 🎲 **8 game modes**  from simple coin flips to a 50× perfect-block guess
- 🔗 **Fully on-chain**  bets, rounds, and payouts all live in 8 verified smart contracts, no backend custody of funds
- 🎯 **Shared target block**  every round settles all 8 games off the *same* confirmed GIWA block, so results are consistent and independently reproducible
- 🔄 **5 concurrent live rounds**  always something to bet on
- 💸 **Automatic on-chain payouts**  winners receive ETH directly in their wallet, no claim needed
- 🔍 **100% verifiable**  every contract's source is verified on the GIWA block explorer; click VERIFY on any ended round to check the result yourself

---

## 🎮 Game Modes (8 Total)

Every game reads its result from the **same shared target block** for a given round, using the block's hash, transaction count, or gas used. A backend engine creates rounds and locks/settles them on a synchronized timer, but the actual bet funds, round state, and payouts all live entirely in the contracts below.

| Mode | Mechanic | Payout style |
|---|---|---|
| **Coin Flip** | Is the block hash even or odd? | Pool split |
| **Hi-Lo** | Last hex digit Low (0-7) or High (8-f)? | Pool split |
| **Lucky Digit** | Guess the exact last hex digit (0-f) | Pool split |
| **Number 0-99** | Guess `hash mod 100` exactly (0-99) | Pool split |
| **Txn Over/Under** | Will the block have more than 21 transactions? | Pool split |
| **Gas Over/Under** | Will gas used exceed 2,000,000? | Pool split |
| **Closest (PvP)** | Guess `hash mod 1000`  nearest guess wins the pot | Equal split among closest |
| **Perfect Block** | Guess the **exact** block number that settles the round | Pool split |

---

## ✅ Provably Fair Design

Result derivation happens **on-chain, inside each contract**, using `blockhash()` for the 6 trustless games (Coin Flip, Hi-Lo, Lucky Digit, Number 0-99, Closest, Perfect Block). Transaction count and gas used aren't readable by the EVM after the fact, so **Txn Over/Under** and **Gas Over/Under** use a backend-submitted value that's checked against the real block hash and block number at settlement time  anyone can independently confirm the submitted values against the GIWA explorer.

**Why this is provably fair:**

- **Shared target block**  every game in a round settles against the exact same block, submitted explicitly by the backend rather than each contract independently guessing at "the next block"
- **No RNG**  outcomes for 6 of 8 games are fully deterministic from the block hash, computed directly in Solidity
- **Fully verifiable**  all 8 contracts are verified on the GIWA Sepolia explorer; anyone can read the source, the `getRound()` state, and the emitted `RoundSettled` / `Payout` events
- **On-chain payouts**  `settleRound()` calls `_pay()` internally, sending ETH straight to winners; no backend-signed payout transaction, no custodial wallet in the funds path
- **VERIFY button**  every ended round links directly to the GIWA block explorer for the target block and the settlement transaction

---

## 📜 Verified Contracts (GIWA Sepolia, Chain ID `91342`)

| Game | Address | Verified Source |
|---|---|---|
| Coin Flip | `0x17b1B887da0985335AA3112a9a93CB34844BA562` | [View](https://sepolia-explorer.giwa.io/address/0x17b1B887da0985335AA3112a9a93CB34844BA562#code) |
| Hi-Lo | `0x7DBeB4311B620a27af9925232be1CC877E5dA7D3` | [View](https://sepolia-explorer.giwa.io/address/0x7DBeB4311B620a27af9925232be1CC877E5dA7D3#code) |
| Lucky Digit | `0x1BfFF6a04E53392Cf4A03FeE3c05e312AE8F0f8B` | [View](https://sepolia-explorer.giwa.io/address/0x1BfFF6a04E53392Cf4A03FeE3c05e312AE8F0f8B#code) |
| Number 0-99 | `0xD2abE17989bD5e2F54c95959D15DeCd6409F2b09` | [View](https://sepolia-explorer.giwa.io/address/0xD2abE17989bD5e2F54c95959D15DeCd6409F2b09#code) |
| Closest (PvP) | `0x04764Cca2A234046Dbe68761aa268DD4c2F189dC` | [View](https://sepolia-explorer.giwa.io/address/0x04764Cca2A234046Dbe68761aa268DD4c2F189dC#code) |
| Perfect Block | `0x68a94e5c4Eb96A560B78e4E83b1aECfF5293319F` | [View](https://sepolia-explorer.giwa.io/address/0x68a94e5c4Eb96A560B78e4E83b1aECfF5293319F#code) |
| Txn Over/Under | `0x9131DFc812321E7C93BA985Dad49FbBBd9cfc564` | [View](https://sepolia-explorer.giwa.io/address/0x9131DFc812321E7C93BA985Dad49FbBBd9cfc564#code) |
| Gas Over/Under | `0x429Fa7120f24e4dDBd29a187a96cC27eC207281e` | [View](https://sepolia-explorer.giwa.io/address/0x429Fa7120f24e4dDBd29a187a96cC27eC207281e#code) |

Each contract exposes:

- `placeBet(roundId, pick)` *(payable)*  place a stake directly from your wallet
- `getRound(roundId)`  full round state: timing, pool totals, bet count, target block, result
- `roundCounter()`  the contract's own running round counter (not shared across games  see note below)
- `createRound / lockRound / settleRound`  owner-only lifecycle functions run by the backend engine

> **Note on round IDs:** each contract tracks its own independent `roundCounter`. Two games' round IDs are **not** guaranteed to match for the "same" round in time  match rounds across games by `lockAt` / `settleAt` timestamps, not by assuming identical round numbers.

---

## 🏗️ Architecture

```
giwabets/
├── contracts/               8 Solidity game contracts (GIWA Sepolia)
├── server/
│   └── chain-server.cjs     Round engine: creates/locks/settles shared rounds across all 8 contracts
├── shared/
│   └── blockgame.js         Legacy off-chain derive logic (superseded by on-chain settlement)
└── src/
    ├── components/
    │   ├── Home.tsx              Landing page: how it works, live demo
    │   ├── RoundCard.tsx         Per-round betting card: all 8 modes, live countdown, pot info
    │   ├── RoundsCarousel.tsx    Card carousel with arrow navigation for live rounds
    │   ├── YourBets.tsx          Live + ended bets panel per wallet
    │   ├── YourBetsModal.tsx     Full bets modal with win/loss details
    │   ├── ModeHelpModal.tsx     Per-mode help popup
    │   ├── ProvablyFair.tsx      On-chain verification panel
    │   ├── BetToast.tsx          Bet confirmed toast notification
    │   └── WalletButton.tsx      Wallet connect + balance display
    └── App.tsx                   Routing, contract reads, state management
```

**Stack:**

- **Frontend:** React + TypeScript + Vite + TailwindCSS + RainbowKit + wagmi + viem  reads round state and places bets directly against the contracts
- **Round engine:** Node.js backend that creates rounds, locks them, and settles all 8 contracts against one shared confirmed block  does **not** hold or move user funds
- **Chain:** GIWA Sepolia Testnet, Chain ID `91342`
- **Deployment:** Vercel (frontend) + VPS + PM2 (round engine)

---

## ⚙️ How Rounds Work

```
T+0:00    Round opens on all 8 contracts → accepts bets, each user signs their own tx
T+2:30    Betting LOCKS across all 8 contracts  no new bets accepted
T+3:00    Backend picks ONE confirmed GIWA block as the shared target
          → calls settleRound(roundId, targetBlock[, oracleValue]) on all 8 contracts
          → each contract derives its own result from that same block and pays winners directly
          → 5 rounds are always kept live in the pipeline, spaced 3 minutes apart
```

Because every game in a round settles off the same block, results across all 8 games for that round are derived from one single, publicly verifiable source.

---

## 🌐 GIWA Integration

- All block reads: `https://sepolia-rpc.giwa.io` (Chain ID `91342`)
- Contract source verification: [GIWA Sepolia block explorer](https://sepolia-explorer.giwa.io)
- Native token: `ETH`
- **Real on-chain payouts**  winners receive ETH via each contract's internal `_pay()` call at settlement, no wrapping, no bridges, no manual claims

---

## 🛣️ Roadmap

- [x] 8 game modes (Coin Flip, Hi-Lo, Lucky Digit, Number 0-99, Txn O/U, Gas O/U, Closest PvP, Perfect Block)
- [x] All 8 games migrated fully on-chain  bets, rounds, and payouts live in verified smart contracts
- [x] Shared target block across all 8 games per round
- [x] Automatic on-chain ETH payouts to winners
- [x] Contract source verified on GIWA Sepolia explorer
- [x] Concurrent live rounds (5 in the pipeline at all times)
- [ ] Frontend fully wired to contracts via wagmi/viem (in progress)
- [ ] Mainnet migration

---

## 👨‍💻 Built By

**0xDarkSeidBull**  Solo builder.

---

## 📄 License

MIT  see [LICENSE](LICENSE) for details.

---

<div align="center">

Built with ❤️ on **GIWA**.

</div>
