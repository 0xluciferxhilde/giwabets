import React from "react";
import { usePayouts } from "../lib/chain";
import { MODE_MAP } from "../lib/modes";

type Win = { wallet: string; payout: number; mode: string; block: number };

function shortAddr(a: string) {
  return `${a.slice(0, 6)}...${a.slice(-4)}`;
}

export default function WinnersMarquee() {
  const wins: Win[] = usePayouts(true);


  const items = wins.length === 0
    ? [<span key="empty">🎮 Be the first to win on GiwaBets!</span>]
    : wins.map((w, i) => (
        <span key={i}>
          🏆 <span style={{ fontFamily: "var(--mono)" }}>{shortAddr(w.wallet)}</span>{" "}
          won <span style={{ color: "#f59e0b", fontWeight: 800 }}>+{w.payout.toFixed(4)} ETH</span>{" "}
          on {MODE_MAP[w.mode]?.label || w.mode} at block{" "}
          <span style={{ fontFamily: "var(--mono)" }}>#{w.block.toLocaleString()}</span>
        </span>
      ));

  // duplicate items for seamless loop
  const renderRow = (keyPrefix: string) => (
    <div style={{ display: "inline-flex", alignItems: "center", gap: 24, paddingRight: 24 }}>
      {items.map((node, i) => (
        <React.Fragment key={`${keyPrefix}-${i}`}>
          {node}
          <span style={{ color: "#4b5563" }}>·</span>
        </React.Fragment>
      ))}
    </div>
  );

  // duration based on ~40px/sec — approximate by item count
  const duration = Math.max(20, items.length * 6);

  return (
    <div style={{
      background: "#0a0a0a", color: "#fff", height: 36, width: "100%",
      overflow: "hidden", borderBottom: "3px solid #000",
      display: "flex", alignItems: "center", position: "relative",
      fontFamily: "'Space Grotesk',system-ui,sans-serif", fontSize: 13, fontWeight: 600,
    }}>
      <style>{`
        @keyframes bob-marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>
      <div style={{
        display: "inline-flex", whiteSpace: "nowrap",
        animation: `bob-marquee ${duration}s linear infinite`,
        willChange: "transform",
      }}>
        {renderRow("a")}
        {renderRow("b")}
      </div>
    </div>
  );
}
