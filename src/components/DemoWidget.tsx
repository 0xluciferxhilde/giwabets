import React from "react";
import { Shield, Coins, RotateCcw } from "lucide-react";
import { signals } from "../lib/modes";
import Coin from "./Coin";

// A real, already-settled LiteForge block (the one we analysed earlier).
const DEMO_BLOCK = {
  number: 14908225,
  hash: "0xd7fb8385af06e1b2f5e31af7da39e88a6a4fa4df23a10d130166efe0aca2de4c",
  txCount: 7,
  gasUsed: "494525",
};

export default function DemoWidget() {
  const [revealed, setRevealed] = React.useState(false);
  const [pick, setPick] = React.useState<"even" | "odd">("even");
  const sig = signals(DEMO_BLOCK);
  const result = sig.even ? "even" : "odd";
  const win = revealed && pick === result;

  return (
    <div className="demo-card">
      <div className="demo-head">
        <span className="demo-badge" style={{ color: "#FF6B00", background: "rgba(255,107,0,.12)", borderColor: "rgba(255,107,0,.35)" }}><Coins size={12} /> DEMO · Coin Flip</span>
        <span className="mono demo-bn">Block #{DEMO_BLOCK.number.toLocaleString()}</span>
      </div>

      <div className="demo-body">
        <p className="demo-q">If you bet 0.01 ETH on this block being…</p>
        <div className="demo-picks">
          <button className={`pick up ${pick === "even" ? "sel" : ""}`} onClick={() => { setPick("even"); setRevealed(false); }}>EVEN</button>
          <button className={`pick down ${pick === "odd" ? "sel" : ""}`} onClick={() => { setPick("odd"); setRevealed(false); }}>ODD</button>
        </div>

        {!revealed ? (
          <button className="demo-reveal-btn" onClick={() => setRevealed(true)}>Reveal the block →</button>
        ) : (
          <>
            <div className="demo-hash">
              {DEMO_BLOCK.hash.slice(0, -1)}<span className="lit">{DEMO_BLOCK.hash.slice(-1)}</span>
            </div>
            <div className="demo-calc">
              hash mod 2 = <b>{result.toUpperCase()}</b> &nbsp;→&nbsp; you picked <b>{pick.toUpperCase()}</b>
            </div>
            <div className={`demo-result ${win ? "w" : "l"}`}>
              {win ? <>✓ YOU WIN · +<Coin size={14} /> 0.0196 ETH</> : "✗ You lose · hash was " + result.toUpperCase()}
            </div>
            <a className="pf-btn" href={`https://sepolia-explorer.giwa.io/block/${DEMO_BLOCK.number}`} target="_blank" rel="noreferrer">
              <Shield size={11} /> Verify on explorer
            </a>
            <button className="demo-retry" onClick={() => setRevealed(false)}><RotateCcw size={12} /> Try the other side</button>
          </>
        )}
      </div>
    </div>
  );
}
