/** modes.ts — UI-side mode metadata (mirrors shared/blockgame.js).
 *  Used to render pick options, multipliers and descriptions. Settlement is
 *  authoritative on the server; this is for display + payout preview. */

export type ModeId = "coinflip" | "hilo" | "digit" | "number" | "txou" | "gasou" | "closest" | "perfectblock";

/** Thresholds — must match backend (shared/blockgame.js) */
export const TX_LINE = 21;
export const GAS_LINE = 2000000;

export type ModeMeta = {
  id: ModeId;
  label: string;
  desc: string;
  multiplier: number;
  kind: "binary" | "digit" | "number" | "pvp" | "perfectblock";
  picks?: string[];
  hint?: string;
};

export const MODES: ModeMeta[] = [
  { id: "coinflip", label: "Coin Flip", desc: "Will the block hash be even or odd?", multiplier: 1.96, kind: "binary", picks: ["even", "odd"] },
  { id: "hilo", label: "Hi-Lo", desc: "Last hex digit Low (0-7) or High (8-f)?", multiplier: 1.96, kind: "binary", picks: ["low", "high"] },
  { id: "digit", label: "Lucky Digit", desc: "Guess the hash's last hex digit (0-f).", multiplier: 15.5, kind: "digit" },
  { id: "number", label: "Number 0-99", desc: "Guess hash mod 100. Winners share the pool.", multiplier: 97, kind: "number", hint: "0-99" },
  { id: "txou", label: "Txn O/U", desc: `More than ${TX_LINE} transactions in the block?`, multiplier: 1.96, kind: "binary", picks: ["over", "under"] },
  { id: "gasou", label: "Gas O/U", desc: `Will gas used exceed ${GAS_LINE.toLocaleString()}?`, multiplier: 1.96, kind: "binary", picks: ["over", "under"] },
  { id: "closest", label: "Closest", desc: "Guess hash mod 1000. Closest player wins the whole pot.", multiplier: 0, kind: "pvp", hint: "0-999" },
  { id: "perfectblock", label: "Perfect Block", desc: "Guess the exact block number → winners share the pool.", multiplier: 50, kind: "perfectblock", hint: "block number" },
];

export const MODE_MAP: Record<string, ModeMeta> = Object.fromEntries(MODES.map((m) => [m.id, m]));

export const HEX = ["0","1","2","3","4","5","6","7","8","9","a","b","c","d","e","f"];

/** derive display signals from a settled block (same math as backend) */
export function signals(block: { hash: string; txCount: number; gasUsed: string }) {
  const n = BigInt(block.hash);
  const lastNibble = parseInt(block.hash.slice(-1), 16);
  return {
    even: n % 2n === 0n,
    lastNibble,
    hilo: lastNibble >= 8 ? "high" : "low",
    digit: lastNibble.toString(16),
    mod100: Number(n % 100n),
    mod1000: Number(n % 1000n),
    txou: block.txCount > TX_LINE ? "over" : "under",
    gasou: Number(block.gasUsed) > GAS_LINE ? "over" : "under",
    decimal: n.toString(),
  };
}
