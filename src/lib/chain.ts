/** chain.ts — reads all game state straight from the GIWA Sepolia contracts.
 *
 *  There is no backend in the loop: rounds, pools, history, wallet bets and
 *  payouts are all read from the 8 game contracts / their events.
 */

import React from "react";
import { usePublicClient } from "wagmi";
import { formatEther } from "viem";
import { GAMES, STATUS, type GameDef } from "./contracts";
import type { RoundView } from "./api";
import type { ModeId } from "./modes";

/** how many recent roundIds to read per contract */
const WINDOW = 16;
const POLL_MS = 6000;

export type ChainRoundRaw = {
  game: GameDef;
  roundId: number;
  lockAt: number;       // ms
  settleAt: number;     // ms
  status: number;
  poolA: number;        // ETH (binary: option 1 pool; pool games: total pool)
  poolB: number;        // ETH (binary only)
  betCount: number;
  targetBlockNumber: number;
  targetBlockHash: string;
  metric: number | null; // txCount / gasUsed for the O/U games
  result: bigint;
};

function decodeRound(game: GameDef, out: readonly any[]): ChainRoundRaw {
  const n = (v: any) => Number(v ?? 0);
  const eth = (v: any) => Number(formatEther(BigInt(v ?? 0)));
  const base = {
    game,
    roundId: n(out[0]),
    lockAt: n(out[1]) * 1000,
    settleAt: n(out[2]) * 1000,
    status: n(out[3]),
  };
  if (game.shape === "pool") {
    return {
      ...base,
      poolA: eth(out[4]), poolB: 0, betCount: n(out[5]),
      targetBlockNumber: n(out[6]), targetBlockHash: String(out[7]),
      metric: null, result: BigInt(out[8] ?? 0),
    };
  }
  if (game.shape === "binary") {
    return {
      ...base,
      poolA: eth(out[4]), poolB: eth(out[5]), betCount: n(out[6]),
      targetBlockNumber: n(out[7]), targetBlockHash: String(out[8]),
      metric: null, result: BigInt(out[9] ?? 0),
    };
  }
  return {
    ...base,
    poolA: eth(out[4]), poolB: eth(out[5]), betCount: n(out[6]),
    targetBlockNumber: n(out[7]), targetBlockHash: String(out[8]),
    metric: n(out[9]), result: BigInt(out[10] ?? 0),
  };
}

export type OnchainRound = RoundView & {
  /** per-game roundId for this shared round (contracts have their own counters) */
  modeRoundIds: Partial<Record<ModeId, number>>;
};

function buildRound(entries: ChainRoundRaw[]): OnchainRound {
  const lockAt = entries[0].lockAt;
  const settleAt = entries[0].settleAt;
  const modeRoundIds: Partial<Record<ModeId, number>> = {};
  const pools: RoundView["pools"] = [];
  let totalStaked = 0;
  let totalBets = 0;
  let settledCount = 0;
  let blockNumber = 0;
  let blockHash = "";
  let txCount = 0;
  let gasUsed = 0;

  for (const e of entries) {
    modeRoundIds[e.game.mode] = e.roundId;
    totalStaked += e.poolA + e.poolB;
    totalBets += e.betCount;
    if (e.status === STATUS.SETTLED) {
      settledCount++;
      if (e.targetBlockNumber) { blockNumber = e.targetBlockNumber; blockHash = e.targetBlockHash; }
      if (e.game.mode === "txou" && e.metric != null) txCount = e.metric;
      if (e.game.mode === "gasou" && e.metric != null) gasUsed = e.metric;
    }
    if (e.game.picks) {
      pools.push({ mode: e.game.mode, pick: e.game.picks[0], stake: e.poolA, players: Math.round(e.poolA / 0.01) });
      pools.push({ mode: e.game.mode, pick: e.game.picks[1], stake: e.poolB, players: Math.round(e.poolB / 0.01) });
    } else {
      pools.push({ mode: e.game.mode, pick: "", stake: e.poolA, players: e.betCount });
    }
  }

  const settled = settledCount > 0 && blockNumber > 0;
  const status: RoundView["status"] =
    settled ? "settled" : Date.now() >= lockAt ? "locked" : "open";

  const result = settled
    ? {
        block: { number: blockNumber, hash: blockHash, txCount, gasUsed: String(gasUsed) },
        perBet: [] as any[],
        outcomes: Object.fromEntries(
          entries
            .filter((e) => e.status === STATUS.SETTLED)
            .map((e) => [e.game.mode, e.game.decodeResult(e.result)]),
        ),
        stats: { players: totalBets, bets: totalBets, pool: totalStaked },
      }
    : null;

  return {
    id: Math.floor(lockAt / 1000),
    status,
    openAt: lockAt - Math.max(60_000, settleAt - lockAt),
    lockAt,
    settleAt,
    msToLock: Math.max(0, lockAt - Date.now()),
    msToSettle: Math.max(0, settleAt - Date.now()),
    targetBlock: settled
      ? { number: blockNumber, hash: blockHash, txCount, gasUsed: String(gasUsed) }
      : null,
    result,
    totalBets,
    totalStaked,
    players: totalBets,
    pools,
    modeRoundIds,
  };
}

/** Reads the recent rounds of all 8 contracts and groups them by lock time. */
export function useOnchainRounds(active: boolean) {
  const client = usePublicClient();
  const [live, setLive] = React.useState<OnchainRound[]>([]);
  const [history, setHistory] = React.useState<OnchainRound[]>([]);
  const [nonce, setNonce] = React.useState(0);

  const refresh = React.useCallback(() => setNonce((n) => n + 1), []);

  React.useEffect(() => {
    if (!active || !client) return;
    let alive = true;

    const load = async () => {
      try {
        const counters = await Promise.all(
          GAMES.map((g) =>
            client.readContract({ address: g.address, abi: g.abi, functionName: "roundCounter" }).catch(() => 0n),
          ),
        );

        const calls: Array<{ game: GameDef; roundId: number }> = [];
        GAMES.forEach((g, i) => {
          const rc = Number(counters[i] ?? 0n);
          for (let id = Math.max(1, rc - WINDOW + 1); id <= rc; id++) calls.push({ game: g, roundId: id });
        });
        if (calls.length === 0) return;

        const results = await client.multicall({
          allowFailure: true,
          contracts: calls.map((c) => ({
            address: c.game.address,
            abi: c.game.abi,
            functionName: "getRound",
            args: [BigInt(c.roundId)],
          })) as any,
        });

        const groups = new Map<number, ChainRoundRaw[]>();
        results.forEach((r, i) => {
          if (r.status !== "success" || !Array.isArray(r.result)) return;
          const raw = decodeRound(calls[i].game, r.result as readonly any[]);
          if (!raw.lockAt) return;
          const key = Math.floor(raw.lockAt / 1000);
          const arr = groups.get(key) || [];
          arr.push(raw);
          groups.set(key, arr);
        });

        const rounds = Array.from(groups.values()).map(buildRound).sort((a, b) => a.lockAt - b.lockAt);
        if (!alive) return;

        const now = Date.now();
        // keep every currently open/locked round live (backend runs ~5 concurrently)
        setLive(rounds.filter((r) => r.status !== "settled" && r.settleAt > now - 20_000));

        setHistory(rounds.filter((r) => r.status === "settled").sort((a, b) => b.lockAt - a.lockAt));
      } catch { /* rpc hiccup — keep last known state */ }
    };

    load();
    const id = setInterval(load, POLL_MS);
    return () => { alive = false; clearInterval(id); };
  }, [active, client, nonce]);

  return { live, history, refresh };
}

/** Live chain head block number. */
export function useHead(active: boolean) {
  const client = usePublicClient();
  const [head, setHead] = React.useState<number | null>(null);
  React.useEffect(() => {
    if (!active || !client) return;
    let alive = true;
    const t = async () => {
      try { const b = await client.getBlockNumber({ cacheTime: 0 }); if (alive) setHead(Number(b)); } catch { /* */ }
    };
    t();
    const id = setInterval(t, 2000);
    return () => { alive = false; clearInterval(id); };
  }, [active, client]);
  return head;
}

export type PayoutEvent = { wallet: string; payout: number; mode: string; block: number };

/** Recent Payout events across all contracts (used by the winners ticker). */
export function usePayouts(active: boolean, lookback = 8000n) {
  const client = usePublicClient();
  const [payouts, setPayouts] = React.useState<PayoutEvent[]>([]);

  React.useEffect(() => {
    if (!active || !client) return;
    let alive = true;
    const load = async () => {
      try {
        const head = await client.getBlockNumber();
        const fromBlock = head > lookback ? head - lookback : 0n;
        const per = await Promise.all(
          GAMES.map(async (g) => {
            try {
              const logs = await client.getContractEvents({
                address: g.address, abi: g.abi, eventName: "Payout", fromBlock, toBlock: head,
              });
              return logs.map((l: any) => ({
                wallet: String(l.args.winner),
                payout: Number(formatEther(BigInt(l.args.amount ?? 0n))),
                mode: g.mode as string,
                block: Number(l.blockNumber),
              }));
            } catch { return []; }
          }),
        );
        if (!alive) return;
        setPayouts(per.flat().sort((a, b) => b.block - a.block).slice(0, 40));
      } catch { /* */ }
    };
    load();
    const id = setInterval(load, 30000);
    return () => { alive = false; clearInterval(id); };
  }, [active, client, lookback]);

  return payouts;
}

export type WalletBet = {
  mode: string;
  pick: string;
  stake: number;
  roundId: number;    // per-contract round id
  roundKey: number;   // shared round key (floor(lockAt/1000)) — matches OnchainRound.id
  block: number;      // chain block the bet tx landed in
  win: boolean;
  payout: number;
  status: number;     // on-chain round status
  settled: boolean;   // single source of truth for live vs ended
  lockAt: number;
  settledAt: number;
  targetBlock: number;
};

/**
 * All bets for one wallet, read straight from the 8 game contracts.
 *
 * BetPlaced logs give the (round, pick, stake) tuples; a single multicall over
 * `getRound` for those rounds gives the authoritative status. `settled` is the
 * one flag that decides whether a bet is live or ended — nothing is cached in
 * component state, so a refresh never loses a live bet.
 */
export function useWalletBets(address: string | null, lookback = 20000n) {
  const client = usePublicClient();
  const [bets, setBets] = React.useState<WalletBet[]>([]);
  const [nonce, setNonce] = React.useState(0);
  const refetch = React.useCallback(() => setNonce((n) => n + 1), []);

  React.useEffect(() => {
    if (!client || !address) { setBets([]); return; }
    let alive = true;

    const load = async () => {
      try {
        const head = await client.getBlockNumber();
        const fromBlock = head > lookback ? head - lookback : 0n;

        // 1. BetPlaced + Payout events per contract for this wallet
        const per = await Promise.all(
          GAMES.map(async (g) => {
            try {
              const [placed, paid] = await Promise.all([
                client.getContractEvents({
                  address: g.address, abi: g.abi, eventName: "BetPlaced",
                  args: { player: address as `0x${string}` }, fromBlock, toBlock: head,
                }),
                client.getContractEvents({
                  address: g.address, abi: g.abi, eventName: "Payout",
                  args: { winner: address as `0x${string}` }, fromBlock, toBlock: head,
                }),
              ]);
              return { game: g, placed, paid };
            } catch {
              return { game: g, placed: [] as any[], paid: [] as any[] };
            }
          }),
        );

        // 2. one multicall for every (contract, roundId) the wallet touched
        const roundCalls: Array<{ game: GameDef; roundId: number }> = [];
        per.forEach(({ game, placed }) => {
          const ids = Array.from(new Set(placed.map((l: any) => Number(l.args.roundId))));
          ids.forEach((roundId) => roundCalls.push({ game, roundId }));
        });

        const roundMap = new Map<string, ChainRoundRaw>();
        if (roundCalls.length > 0) {
          const results = await client.multicall({
            allowFailure: true,
            contracts: roundCalls.map((c) => ({
              address: c.game.address,
              abi: c.game.abi,
              functionName: "getRound",
              args: [BigInt(c.roundId)],
            })) as any,
          });
          results.forEach((r, i) => {
            if (r.status !== "success" || !Array.isArray(r.result)) return;
            const c = roundCalls[i];
            roundMap.set(`${c.game.mode}:${c.roundId}`, decodeRound(c.game, r.result as readonly any[]));
          });
        }

        // 3. build the bet list — classification comes only from round.status
        const out: WalletBet[] = [];
        per.forEach(({ game, placed, paid }) => {
          const payByRound = new Map<number, number>();
          paid.forEach((l: any) => {
            const rid = Number(l.args.roundId);
            payByRound.set(rid, (payByRound.get(rid) || 0) + Number(formatEther(BigInt(l.args.amount ?? 0n))));
          });
          placed.forEach((l: any) => {
            const rid = Number(l.args.roundId);
            const info = roundMap.get(`${game.mode}:${rid}`);
            const payout = payByRound.get(rid) || 0;
            const status = info ? info.status : STATUS.OPEN;
            out.push({
              mode: game.mode as string,
              pick: game.picks ? game.picks[Number(l.args.pick) === 1 ? 0 : 1] : String(l.args.pick),
              stake: Number(formatEther(BigInt(l.args.amount ?? 0n))),
              roundId: rid,
              roundKey: info ? Math.floor(info.lockAt / 1000) : 0,
              block: Number(l.blockNumber),
              win: payout > 0,
              payout,
              status,
              settled: status === STATUS.SETTLED,
              lockAt: info ? info.lockAt : 0,
              settledAt: info ? info.settleAt : 0,
              targetBlock: info ? info.targetBlockNumber : 0,
            });
          });
        });

        if (!alive) return;
        setBets(out.sort((a, b) => b.block - a.block));
      } catch { /* rpc hiccup — keep last known state */ }
    };

    load();
    const id = setInterval(load, 8000);
    return () => { alive = false; clearInterval(id); };
  }, [client, address, lookback, nonce]);

  return { bets, refetch };
}


/** Block facts for the Provably Fair panel — straight from the RPC. */
export function useBlockFacts(blockNumber: number | null) {
  const client = usePublicClient();
  const [data, setData] = React.useState<{ block: any; signals: any } | null>(null);
  const [err, setErr] = React.useState("");

  React.useEffect(() => {
    if (!client || blockNumber == null) return;
    let alive = true;
    setData(null); setErr("");
    client.getBlock({ blockNumber: BigInt(blockNumber) })
      .then((b) => {
        if (!alive) return;
        const block = {
          number: Number(b.number),
          hash: b.hash as string,
          txCount: b.transactions.length,
          gasUsed: String(b.gasUsed),
        };
        setData({ block, signals: { decimal: BigInt(block.hash).toString() } });
      })
      .catch((e) => alive && setErr(e?.shortMessage || e?.message || "failed"));
    return () => { alive = false; };
  }, [client, blockNumber]);

  return { data, err };
}
