import { API_BASE } from "../lib/config";
import React from "react";



type Stats = { totalBets: number; totalWon: number; totalLoss: number };

export default function HeaderStats() {
  const [stats, setStats] = React.useState<Stats>({ totalBets: 0, totalWon: 0, totalLoss: 0 });

  const load = React.useCallback(async () => {
    try {
      const r = await fetch(`${API_BASE}/api/stats`, {
        cache: "no-store",
        headers: { "Cache-Control": "no-cache", Pragma: "no-cache" },
      });
      if (!r.ok) return;
      const j = await r.json();
      const num = (v: any) => {
        const n = typeof v === "string" ? Number(v) : (typeof v === "number" ? v : 0);
        return Number.isFinite(n) ? n : 0;
      };
      setStats({
        totalBets: num(j.totalBets ?? j.total_bets ?? j.bets),
        totalWon: num(j.totalWon ?? j.total_won ?? j.won ?? j.wins),
        totalLoss: num(j.totalLoss ?? j.total_loss ?? j.loss ?? j.losses ?? j.losts),
      });
    } catch { /* */ }
  }, []);

  React.useEffect(() => {
    let alive = true;
    const tick = () => { if (alive) load(); };
    tick();
    const id = setInterval(tick, 5000);
    const onNav = () => tick();
    window.addEventListener("popstate", onNav);
    window.addEventListener("hashchange", onNav);
    window.addEventListener("focus", onNav);
    return () => {
      alive = false;
      clearInterval(id);
      window.removeEventListener("popstate", onNav);
      window.removeEventListener("hashchange", onNav);
      window.removeEventListener("focus", onNav);
    };
  }, [load]);

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
        }}>{stats.totalBets.toLocaleString()}</span>
      </div>
    </div>
  );
}
