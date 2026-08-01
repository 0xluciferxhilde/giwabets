import React from "react";
import { Wallet, Copy, LogOut, X, Check } from "lucide-react";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAccount, useBalance, useDisconnect } from "wagmi";
import Jazzicon, { jsNumberForAddress } from "react-jazzicon";
import Coin from "./Coin";

export default function WalletButton() {
  const { address, isConnected } = useAccount();
  // always reflect on-chain truth: poll the node instead of trusting a cached read
  const { data: bal } = useBalance({ address, query: { refetchInterval: 5000 } });
  const { disconnect } = useDisconnect();
  const [open, setOpen] = React.useState(false);
  const [copied, setCopied] = React.useState(false);

  const balNum = bal ? Number(bal.formatted) : 0;

  return (
    <ConnectButton.Custom>
      {({ openConnectModal, mounted }) => {
        const ready = mounted;
        if (!ready) return <div style={{ width: 160, height: 32 }} />;

        if (!isConnected || !address) {
          return (
            <button className="btn btn-primary btn-sm" onClick={openConnectModal}>
              <Wallet size={14} /> Connect Wallet
            </button>
          );
        }

        const short = `${address.slice(0, 6)}…${address.slice(-4)}`;

        return (
          <>
            <div className="bal" style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
              <Coin size={14} />
              {balNum.toLocaleString(undefined, { maximumFractionDigits: 4 })} ETH
            </div>
            <button className="btn btn-ghost btn-sm wallet-chip" onClick={() => setOpen(true)}>
              <span className="wb-avatar"><Jazzicon diameter={18} seed={jsNumberForAddress(address)} /></span>
              {short}
            </button>

            {open && (
              <div className="wb-overlay" onClick={() => setOpen(false)}>
                <div
                  className="wb-modal-dark"
                  onClick={(e) => e.stopPropagation()}
                  style={{
                    position: "relative",
                    width: "min(360px,100%)",
                    background: "#0d0d0d",
                    border: "1px solid rgba(255,255,255,.12)",
                    borderRadius: 18,
                    padding: "26px 22px 22px",
                    textAlign: "center",
                    boxShadow: "0 30px 80px rgba(0,0,0,.7), 0 0 0 1px rgba(249,115,22,.15)",
                    color: "#fff",
                    fontFamily: "'Space Grotesk',system-ui,sans-serif",
                  }}
                >
                  <button
                    onClick={() => setOpen(false)}
                    aria-label="Close"
                    style={{
                      position: "absolute", top: 10, right: 10, background: "transparent",
                      border: 0, color: "#9ca3af", cursor: "pointer", padding: 6, borderRadius: 8,
                    }}
                  ><X size={18} /></button>

                  <div
                    style={{
                      display: "inline-flex", borderRadius: "50%", overflow: "hidden",
                      lineHeight: 0, marginBottom: 14,
                      boxShadow: "0 0 0 3px #1a1a1a, 0 0 0 4px #f97316",
                    }}
                  >
                    <Jazzicon diameter={64} seed={jsNumberForAddress(address)} />
                  </div>

                  <div
                    className="mono"
                    style={{ fontSize: 14, color: "#fff", fontWeight: 600, marginBottom: 16, letterSpacing: ".02em" }}
                  >{short}</div>

                  <div
                    style={{
                      display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                      padding: "16px 14px", marginBottom: 18,
                      background: "#161616", border: "1px solid rgba(255,255,255,.08)", borderRadius: 12,
                    }}
                  >
                    <Coin size={22} />
                    <b style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 22, color: "#fff", fontWeight: 800 }}>
                      {balNum.toLocaleString(undefined, { maximumFractionDigits: 6 })}
                    </b>
                    <span style={{ color: "#9ca3af", fontSize: 12, textTransform: "uppercase", letterSpacing: ".12em" }}>
                      ETH
                    </span>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                    <button
                      onClick={async () => {
                        await navigator.clipboard.writeText(address);
                        setCopied(true);
                        setTimeout(() => setCopied(false), 1500);
                      }}
                      style={{
                        display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 6,
                        background: "transparent", border: "1px solid rgba(255,255,255,.18)",
                        color: "#fff", fontWeight: 700, fontSize: 12, padding: "11px 10px",
                        borderRadius: 10, cursor: "pointer", fontFamily: "inherit",
                      }}
                    >
                      {copied ? <Check size={14} /> : <Copy size={14} />}
                      {copied ? "Copied" : "Copy Address"}
                    </button>
                    <button
                      onClick={() => { disconnect(); setOpen(false); }}
                      style={{
                        display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 6,
                        background: "#f97316", border: "1px solid #f97316",
                        color: "#0a0a0a", fontWeight: 800, fontSize: 12, padding: "11px 10px",
                        borderRadius: 10, cursor: "pointer", fontFamily: "inherit",
                      }}
                    >
                      <LogOut size={14} /> Disconnect
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        );
      }}
    </ConnectButton.Custom>
  );
}
