/** api.ts — shared view types for on-chain round data.
 *  (The app talks directly to the game contracts; there is no REST backend.) */

export type RoundView = {
  id: number;
  status: "open" | "locked" | "settling" | "settled";
  openAt: number; lockAt: number; settleAt: number;
  msToLock: number; msToSettle: number;
  targetBlock: { number: number; hash: string; txCount: number; gasUsed: string } | null;
  result: any | null;
  totalBets: number; totalStaked: number; players: number;
  pools?: Array<{ mode: string; pick: string; stake: number; players: number }>;
  modeRoundIds?: Partial<Record<string, number>>;
};
