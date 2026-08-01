import React from "react";
import { motion } from "framer-motion";
import { X, Sparkles } from "lucide-react";
import { type RoundView } from "../lib/api";
import { useOnchainRounds } from "../lib/chain";
import { MODE_MAP, signals as deriveSignals, TX_LINE, GAS_LINE, type ModeId } from "../lib/modes";

const EXPLANATIONS: Record<ModeId, string> = {
  coinflip: "Block hash last digit — EVEN (0,2,4,6,8) or ODD (1,3,5,7,9,a,b,c,d,e,f).",
  hilo: "Last hex digit LOW (0-7) or HIGH (8-f).",
  digit: "Guess the exact last hex digit of the block hash (0-f). Winners share the pool.",
  number: "Guess hash mod 100 (0-99). Winners share the pool.",
  txou: `More than ${TX_LINE} transactions in the block? OVER or UNDER.`,
  gasou: `Will gas used exceed ${GAS_LINE.toLocaleString()}? OVER or UNDER.`,
  closest: "Guess hash mod 1000 (0-999). Closest player wins the whole pot.",
  perfectblock: "Guess the exact block number. Winners share the pool.",
};

type Stats = { lines: string[]; suggestion?: string };

function computeStats(mode: ModeId, history: RoundView[]): Stats {
  const blocks = history.map((r) => r.result?.block || r.targetBlock).filter(Boolean) as any[];
  const total = blocks.length;
  if (total === 0) return { lines: ["No ended rounds yet — stats will appear soon."] };

  const sigs = blocks.map(deriveSignals);

  switch (mode) {
    case "coinflip": {
      const even = sigs.filter((s) => s.even).length;
      const odd = total - even;
      return {
        lines: [
          `Out of ${total} ended rounds:`,
          `EVEN came ${even} times (${Math.round((even / total) * 100)}%)`,
          `ODD came ${odd} times (${Math.round((odd / total) * 100)}%)`,
        ],
        suggestion: even >= odd ? "EVEN" : "ODD",
      };
    }
    case "hilo": {
      const hi = sigs.filter((s) => s.hilo === "high").length;
      const lo = total - hi;
      return {
        lines: [
          `Out of ${total} ended rounds:`,
          `HIGH came ${hi} times (${Math.round((hi / total) * 100)}%)`,
          `LOW came ${lo} times (${Math.round((lo / total) * 100)}%)`,
        ],
        suggestion: hi >= lo ? "HIGH" : "LOW",
      };
    }
    case "digit": {
      const counts: Record<string, number> = {};
      sigs.forEach((s) => { counts[s.digit] = (counts[s.digit] || 0) + 1; });
      const ranked = Object.entries(counts).sort((a, b) => b[1] - a[1]);
      const top = ranked.slice(0, 3).map(([d, c]) => `${d.toUpperCase()} (${c}×)`).join(", ");
      return {
        lines: [`Out of ${total} ended rounds:`, `Most frequent digits: ${top}`],
        suggestion: ranked[0]?.[0]?.toUpperCase(),
      };
    }
    case "number": {
      const nums = sigs.map((s) => s.mod100);
      const avg = Math.round(nums.reduce((a, b) => a + b, 0) / nums.length);
      const hi = nums.filter((n) => n >= 50).length;
      const lo = total - hi;
      return {
        lines: [
          `Out of ${total} ended rounds:`,
          `Average number: ${avg}`,
          `≥50: ${hi} times · <50: ${lo} times`,
        ],
        suggestion: String(avg),
      };
    }
    case "txou": {
      const over = sigs.filter((s) => s.txou === "over").length;
      const under = total - over;
      return {
        lines: [
          `Out of ${total} ended rounds:`,
          `OVER came ${over} times (${Math.round((over / total) * 100)}%)`,
          `UNDER came ${under} times (${Math.round((under / total) * 100)}%)`,
        ],
        suggestion: over >= under ? "OVER" : "UNDER",
      };
    }
    case "gasou": {
      const over = sigs.filter((s) => s.gasou === "over").length;
      const under = total - over;
      return {
        lines: [
          `Out of ${total} ended rounds:`,
          `OVER came ${over} times (${Math.round((over / total) * 100)}%)`,
          `UNDER came ${under} times (${Math.round((under / total) * 100)}%)`,
        ],
        suggestion: over >= under ? "OVER" : "UNDER",
      };
    }
    case "closest": {
      const nums = sigs.map((s) => s.mod1000);
      const avg = Math.round(nums.reduce((a, b) => a + b, 0) / nums.length);
      return {
        lines: [`Out of ${total} ended rounds:`, `Average winning number: ${avg}`],
        suggestion: String(avg),
      };
    }
    case "perfectblock": {
      const last = blocks.slice(0, 5).map((b) => `#${Number(b.number).toLocaleString()}`);
      return {
        lines: [`Last ${last.length} target block numbers:`, ...last],
      };
    }
  }
}

export default function ModeHelpModal({ modeId, onClose }: { modeId: ModeId; onClose: () => void }) {
  const [history, setHistory] = React.useState<RoundView[]>([]);
  const [loading, setLoading] = React.useState(true);
  const meta = MODE_MAP[modeId];

  React.useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const h = await api.history(100);
        if (alive) setHistory(h.history || []);
      } catch { /* */ }
      finally { if (alive) setLoading(false); }
    })();
    return () => { alive = false; };
  }, []);

  const stats = computeStats(modeId, history);

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed", inset: 0, zIndex: 220, display: "grid", placeItems: "center",
        background: "rgba(0,0,0,.6)", backdropFilter: "blur(6px)", padding: 16,
      }}
    >
      <motion.div
        initial={{ scale: .9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "min(440px,100%)", background: "#fff", border: "4px solid #000",
          borderRadius: 16, boxShadow: "8px 8px 0 0 rgba(0,0,0,.9)",
          padding: 22, fontFamily: "'Space Grotesk',system-ui,sans-serif",
          color: "#0a0a0a", position: "relative",
        }}
      >
        <button
          onClick={onClose} aria-label="Close"
          style={{
            position: "absolute", top: 10, right: 10, background: "#fff",
            border: "3px solid #000", borderRadius: 10, padding: 6, cursor: "pointer",
            boxShadow: "3px 3px 0 0 rgba(0,0,0,.9)",
          }}
        ><X size={16} /></button>

        <div style={{ fontSize: 11, letterSpacing: ".18em", color: "#6b7280", fontWeight: 800 }}>
          MODE HELP
        </div>
        <h3 style={{ fontSize: 22, fontWeight: 900, letterSpacing: "-.02em", margin: "4px 0 12px" }}>
          {meta.label}
        </h3>

        <div style={{
          background: "#f5f5f5", border: "2px solid #000", borderRadius: 10,
          padding: 12, fontSize: 13, lineHeight: 1.55, color: "#374151",
          boxShadow: "2px 2px 0 0 rgba(0,0,0,.9)", marginBottom: 14,
        }}>
          {EXPLANATIONS[modeId]}
        </div>

        <div style={{ fontSize: 11, letterSpacing: ".14em", color: "#6b7280", fontWeight: 800, marginBottom: 6 }}>
          HISTORY STATS
        </div>
        <div style={{
          background: "#fff", border: "2px solid #000", borderRadius: 10, padding: 12,
          boxShadow: "2px 2px 0 0 rgba(0,0,0,.9)", marginBottom: 14,
          fontFamily: "'JetBrains Mono',monospace", fontSize: 12.5, lineHeight: 1.8,
        }}>
          {loading ? "Loading…" : stats.lines.map((l, i) => <div key={i}>{l}</div>)}
        </div>

        {stats.suggestion && (
          <div style={{
            background: "#f97316", color: "#fff", border: "3px solid #000", borderRadius: 12,
            padding: "12px 14px", fontWeight: 900, fontSize: 14,
            boxShadow: "3px 3px 0 0 rgba(0,0,0,.9)",
            display: "flex", alignItems: "center", gap: 8,
          }}>
            <Sparkles size={16} /> AI suggests: <span style={{ fontFamily: "'JetBrains Mono',monospace" }}>{stats.suggestion}</span> for this round
          </div>
        )}
      </motion.div>
    </div>
  );
}
