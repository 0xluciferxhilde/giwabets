/** contracts.ts — GiwaBets on-chain game contracts (GIWA Sepolia, chainId 91342).
 *
 *  All 8 games are independent contracts. A "round" in the UI is the set of
 *  per-contract rounds that share the same lockAt/settleAt timestamps (the
 *  operator creates them together and settles them against the same block).
 */

import { parseEther } from "viem";
import type { ModeId } from "./modes";

export const STAKE_ETH = "0.01";
export const STAKE_WEI = parseEther(STAKE_ETH);

/* ------------------------------------------------------------------ ABIs */

const roundStatusOut = [
  { name: "id", type: "uint256" },
  { name: "lockAt", type: "uint256" },
  { name: "settleAt", type: "uint256" },
  { name: "status", type: "uint256" },
] as const;

/** CoinFlip / HiLo: two pools (option 1 / option 2). */
export const BINARY_ABI = [
  {
    type: "function", name: "getRound", stateMutability: "view",
    inputs: [{ name: "roundId", type: "uint256" }],
    outputs: [
      ...roundStatusOut,
      { name: "poolA", type: "uint256" },
      { name: "poolB", type: "uint256" },
      { name: "betCount", type: "uint256" },
      { name: "targetBlockNumber", type: "uint256" },
      { name: "targetBlockHash", type: "bytes32" },
      { name: "result", type: "uint256" },
    ],
  },
  {
    type: "function", name: "placeBet", stateMutability: "payable",
    inputs: [{ name: "roundId", type: "uint256" }, { name: "pick", type: "uint8" }],
    outputs: [],
  },
  { type: "function", name: "roundCounter", stateMutability: "view", inputs: [], outputs: [{ type: "uint256" }] },
  { type: "function", name: "treasuryBalance", stateMutability: "view", inputs: [], outputs: [{ type: "uint256" }] },
  {
    type: "event", name: "BetPlaced",
    inputs: [
      { name: "roundId", type: "uint256", indexed: true },
      { name: "player", type: "address", indexed: true },
      { name: "pick", type: "uint8", indexed: false },
      { name: "amount", type: "uint256", indexed: false },
    ],
  },
  {
    type: "event", name: "Payout",
    inputs: [
      { name: "roundId", type: "uint256", indexed: true },
      { name: "winner", type: "address", indexed: true },
      { name: "amount", type: "uint256", indexed: false },
    ],
  },
  {
    type: "event", name: "RoundSettled",
    inputs: [
      { name: "roundId", type: "uint256", indexed: true },
      { name: "result", type: "uint8", indexed: false },
      { name: "blockNumber", type: "uint256", indexed: false },
      { name: "blockHash", type: "bytes32", indexed: false },
    ],
  },
] as const;

/** TxOverUnder / GasOverUnder: binary pools + the measured block metric. */
export const BINARY_METRIC_ABI = [
  {
    type: "function", name: "getRound", stateMutability: "view",
    inputs: [{ name: "roundId", type: "uint256" }],
    outputs: [
      ...roundStatusOut,
      { name: "poolA", type: "uint256" },
      { name: "poolB", type: "uint256" },
      { name: "betCount", type: "uint256" },
      { name: "targetBlockNumber", type: "uint256" },
      { name: "targetBlockHash", type: "bytes32" },
      { name: "metric", type: "uint256" },
      { name: "result", type: "uint256" },
    ],
  },
  ...BINARY_ABI.filter((x) => x.name !== "getRound"),
] as const;

/** LuckyDigit / NumberGame: single shared pool, uint8 pick. */
export const POOL_U8_ABI = [
  {
    type: "function", name: "getRound", stateMutability: "view",
    inputs: [{ name: "roundId", type: "uint256" }],
    outputs: [
      ...roundStatusOut,
      { name: "totalPool", type: "uint256" },
      { name: "betCount", type: "uint256" },
      { name: "targetBlockNumber", type: "uint256" },
      { name: "targetBlockHash", type: "bytes32" },
      { name: "result", type: "uint256" },
    ],
  },
  ...BINARY_ABI.filter((x) => x.name !== "getRound"),
] as const;

/** Closest: single pool, uint16 pick (0-999). */
export const POOL_U16_ABI = [
  ...POOL_U8_ABI.filter((x) => x.name !== "placeBet" && x.name !== "BetPlaced"),
  {
    type: "function", name: "placeBet", stateMutability: "payable",
    inputs: [{ name: "roundId", type: "uint256" }, { name: "pick", type: "uint16" }],
    outputs: [],
  },
  {
    type: "event", name: "BetPlaced",
    inputs: [
      { name: "roundId", type: "uint256", indexed: true },
      { name: "player", type: "address", indexed: true },
      { name: "pick", type: "uint16", indexed: false },
      { name: "amount", type: "uint256", indexed: false },
    ],
  },
] as const;

/** PerfectBlock: single pool, uint256 pick (guessed block number). */
export const POOL_U256_ABI = [
  ...POOL_U8_ABI.filter((x) => x.name !== "placeBet" && x.name !== "BetPlaced"),
  {
    type: "function", name: "placeBet", stateMutability: "payable",
    inputs: [{ name: "roundId", type: "uint256" }, { name: "pick", type: "uint256" }],
    outputs: [],
  },
  {
    type: "event", name: "BetPlaced",
    inputs: [
      { name: "roundId", type: "uint256", indexed: true },
      { name: "player", type: "address", indexed: true },
      { name: "pick", type: "uint256", indexed: false },
      { name: "amount", type: "uint256", indexed: false },
    ],
  },
] as const;

/* -------------------------------------------------------------- registry */

export type RoundShape = "binary" | "binaryMetric" | "pool";

export type GameDef = {
  mode: ModeId;
  address: `0x${string}`;
  abi: any;
  shape: RoundShape;
  /** encode a UI pick string into the contract argument */
  encodePick: (pick: string) => bigint | number;
  /** decode an on-chain result value back into the UI pick string */
  decodeResult: (v: bigint) => string;
  /** binary games expose two pools, in this pick order */
  picks?: [string, string];
};

const bin = (a: [string, string]) => ({
  encodePick: (p: string) => (p === a[0] ? 1 : 2),
  decodeResult: (v: bigint) => (v === 1n ? a[0] : v === 2n ? a[1] : ""),
  picks: a,
});

export const GAMES: GameDef[] = [
  {
    mode: "coinflip", address: "0x17b1B887da0985335AA3112a9a93CB34844BA562",
    abi: BINARY_ABI, shape: "binary", ...bin(["even", "odd"]),
  },
  {
    mode: "hilo", address: "0x7DBeB4311B620a27af9925232be1CC877E5dA7D3",
    abi: BINARY_ABI, shape: "binary", ...bin(["low", "high"]),
  },
  {
    mode: "digit", address: "0x1BfFF6a04E53392Cf4A03FeE3c05e312AE8F0f8B",
    abi: POOL_U8_ABI, shape: "pool",
    encodePick: (p) => parseInt(p, 16),
    decodeResult: (v) => Number(v).toString(16),
  },
  {
    mode: "number", address: "0xD2abE17989bD5e2F54c95959D15DeCd6409F2b09",
    abi: POOL_U8_ABI, shape: "pool",
    encodePick: (p) => Number(p),
    decodeResult: (v) => String(v),
  },
  {
    mode: "closest", address: "0x04764Cca2A234046Dbe68761aa268DD4c2F189dC",
    abi: POOL_U16_ABI, shape: "pool",
    encodePick: (p) => Number(p),
    decodeResult: (v) => String(v),
  },
  {
    mode: "perfectblock", address: "0x68a94e5c4Eb96A560B78e4E83b1aECfF5293319F",
    abi: POOL_U256_ABI, shape: "pool",
    encodePick: (p) => BigInt(p),
    decodeResult: (v) => String(v),
  },
  {
    mode: "txou", address: "0x9131DFc812321E7C93BA985Dad49FbBBd9cfc564",
    abi: BINARY_METRIC_ABI, shape: "binaryMetric", ...bin(["over", "under"]),
  },
  {
    mode: "gasou", address: "0x429Fa7120f24e4dDBd29a187a96cC27eC207281e",
    abi: BINARY_METRIC_ABI, shape: "binaryMetric", ...bin(["over", "under"]),
  },
];

export const GAME_BY_MODE: Record<string, GameDef> =
  Object.fromEntries(GAMES.map((g) => [g.mode, g]));

/** on-chain round status enum */
export const STATUS = { OPEN: 0, LOCKED: 1, SETTLED: 2 } as const;
