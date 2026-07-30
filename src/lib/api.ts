/** api.ts — thin client for the BetsOnBlock backend. */

import { API_BASE } from "./config";

export type RoundView = {
  id: number;
  status: "open" | "locked" | "settling" | "settled";
  openAt: number; lockAt: number; settleAt: number;
  msToLock: number; msToSettle: number;
  perfectBlockOpen?: boolean;
  perfectBlockClosesAt?: number;
  msToPerfectClose?: number;
  targetBlock: { number: number; hash: string; txCount: number; gasUsed: string } | null;
  result: any | null;
  totalBets: number; totalStaked: number; players: number;
  pools?: Array<{ mode: string; pick: string; stake: number; players: number }>;
};

export type Paginated<T> = { page: number; pages: number; total: number; limit: number } & T;

async function j<T>(url: string, init?: RequestInit): Promise<T> {
  const r = await fetch(url, init);
  if (!r.ok) {
    let msg = `http_${r.status}`;
    try { const e = await r.json(); msg = e.error || msg; } catch { /* */ }
    throw new Error(msg);
  }
  return r.json();
}

export const api = {
  rounds: () => j<{ rounds: RoundView[] }>(`${API_BASE}/api/rounds`),
  history: (n = 20) => j<{ history: RoundView[] }>(`${API_BASE}/api/history?n=${n}`),
  historyPage: (page = 1, limit = 20) =>
    j<Paginated<{ history: RoundView[] }>>(`${API_BASE}/api/history?page=${page}&limit=${limit}`),
  betsFor: (wallet: string, page = 1, limit = 20) =>
    j<Paginated<{ bets: any[] }>>(`${API_BASE}/api/bets/${wallet}?page=${page}&limit=${limit}`),
  head: () => j<{ block: number }>(`${API_BASE}/api/head`),
  verify: (block: number) => j<{ block: any; signals: any }>(`${API_BASE}/api/verify/${block}`),
  bet: (body: { wallet: string; roundId: number; mode: string; pick: string; stake: number; tx_hash?: string }) =>
    j<{ ok: boolean; error?: string; round?: RoundView }>(`${API_BASE}/api/bet`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }),
};
