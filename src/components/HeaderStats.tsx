import React from "react";

/** Total bets counter — value is read on-chain (betCount across all 8 game
 *  contracts) and passed in from App. */
export default function HeaderStats({ totalBets = 0 }: { totalBets?: number }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      <div
        style={{
          display: "inline-flex", alignItems: "center", gap: 10,
          background: "#fff7ed", color: "#0a0a0a", border: "3px solid #000",
          borderRadius: 12, padding: "12px 20px", fontWeight: 900,
          fontFamily: "'Space Grotesk',system-ui,sans-serif",
          letterSpacing: ".04em", textTransform: "uppercase",
          boxShadow: "5px 5px 0 0 rgba(0,0,0,.9)",
          lineHeight: 1,
        }}
      >
        <span style={{
          fontSize: 11, letterSpacing: ".12em",
          color: "rgba(10,10,10,.6)", fontWeight: 800,
        }}>Total Bets</span>
        <span style={{
          fontSize: 16, fontWeight: 900, color: "#0a0a0a",
          fontFamily: "'JetBrains Mono',monospace", letterSpacing: "-.01em",
        }}>{totalBets.toLocaleString()}</span>
      </div>
    </div>
  );
}
