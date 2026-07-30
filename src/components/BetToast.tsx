import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ExternalLink, Check } from "lucide-react";
import { MODES } from "../lib/modes";
import Coin from "./Coin";

export type BetToastData =
  | {
      kind: "success";
      mode: string;          // mode id just bet on
      pick: string;
      stake: number;
      roundId: number;
      refId: string;
      blockNumber?: number | null; // est target block
      roundSettled?: boolean;
    }
  | { kind: "error"; message: string };

const DURATION = 4000;
const EXPLORER = "https://sepolia-explorer.giwa.io";

export default function BetToast({
  data,
  onClose,
}: {
  data: BetToastData | null;
  onClose: () => void;
}) {
  React.useEffect(() => {
    if (!data) return;
    const t = setTimeout(onClose, DURATION);
    return () => clearTimeout(t);
  }, [data, onClose]);

  return (
    <AnimatePresence>
      {data && (
        <motion.div
          key="bet-toast"
          initial={{ x: 80, y: 40, opacity: 0 }}
          animate={{ x: 0, y: 0, opacity: 1 }}
          exit={{ x: 80, y: 40, opacity: 0 }}
          transition={{ type: "spring", stiffness: 320, damping: 26 }}
          style={{
            position: "fixed",
            zIndex: 200,
            right: 20,
            bottom: 20,
            width: "min(340px, calc(100vw - 24px))",
            background: data.kind === "success" ? "#f0fdf4" : "#fef2f2",
            color: "#0a0a0a",
            border: `3px solid #000`,
            borderRadius: 14,
            boxShadow: "5px 5px 0 0 rgba(0,0,0,.9)",
            overflow: "hidden",
            fontFamily: "'Space Grotesk',system-ui,sans-serif",
          }}
        >
          {data.kind === "error" ? (
            <ErrorBody data={data} onClose={onClose} />
          ) : (
            <SuccessBody data={data} onClose={onClose} />
          )}
          <motion.div
            initial={{ width: "100%" }}
            animate={{ width: "0%" }}
            transition={{ duration: DURATION / 1000, ease: "linear" }}
            style={{
              height: 3,
              background: data.kind === "success" ? "#16a34a" : "#dc2626",
            }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function SuccessBody({
  data,
  onClose,
}: {
  data: Extract<BetToastData, { kind: "success" }>;
  onClose: () => void;
}) {
  const [tip, setTip] = React.useState(false);
  const checkedModes = new Set([data.mode]);

  const onVerify = () => {
    if (data.roundSettled && data.blockNumber) {
      window.open(`${EXPLORER}/block/${data.blockNumber}`, "_blank");
    } else {
      setTip(true);
      setTimeout(() => setTip(false), 1800);
    }
  };

  return (
    <div style={{ padding: "12px 14px 10px", position: "relative" }}>
      <button
        onClick={onClose}
        aria-label="Close"
        style={{
          position: "absolute", top: 6, right: 6, background: "transparent",
          border: 0, color: "#0a0a0a", cursor: "pointer", padding: 4,
        }}
      ><X size={15} /></button>

      {/* Top row: block + badge */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10, paddingRight: 18 }}>
        <span style={{
          fontFamily: "'JetBrains Mono',monospace", fontWeight: 800, fontSize: 13,
          color: "#0a0a0a",
        }}>
          #{data.blockNumber ? data.blockNumber.toLocaleString() : "—"}
        </span>
        <span style={{
          display: "inline-flex", alignItems: "center", gap: 4,
          background: "#16a34a", color: "#fff",
          fontFamily: "'JetBrains Mono',monospace", fontWeight: 800, fontSize: 11,
          padding: "4px 10px", borderRadius: 999, border: "2px solid #000",
        }}>
          PLACED −{data.stake.toFixed(4)}
        </span>
      </div>

      {/* Modes checklist */}
      <div style={{
        display: "grid", gridTemplateColumns: "1fr 1fr", gap: 5,
        padding: 8, background: "#fff",
        border: "2px solid #000", borderRadius: 10, marginBottom: 10,
      }}>
        {MODES.map((m) => {
          const on = checkedModes.has(m.id);
          return (
            <div key={m.id} style={{
              display: "inline-flex", alignItems: "center", gap: 5,
              fontSize: 10.5, fontWeight: 700,
              color: on ? "#fff" : "#6b7280",
              background: on ? "#3b82f6" : "transparent",
              padding: "4px 6px", borderRadius: 6,
              border: on ? "1.5px solid #000" : "1.5px solid transparent",
            }}>
              <span style={{
                width: 12, height: 12, borderRadius: 3,
                border: "1.5px solid " + (on ? "#000" : "#9ca3af"),
                background: on ? "#fff" : "transparent",
                display: "inline-grid", placeItems: "center", flexShrink: 0,
              }}>
                {on && <Check size={9} color="#3b82f6" strokeWidth={4} />}
              </span>
              <span style={{ lineHeight: 1 }}>{m.label}</span>
            </div>
          );
        })}
      </div>

      {/* Verify button */}
      <div style={{ position: "relative" }}>
        <button
          onClick={onVerify}
          style={{
            width: "100%", display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 6,
            background: "#16a34a", color: "#fff",
            border: "2px solid #000", borderRadius: 9,
            padding: "8px 12px", fontWeight: 900, fontSize: 12,
            letterSpacing: ".06em", textTransform: "uppercase",
            boxShadow: "3px 3px 0 0 #000", cursor: "pointer",
            fontFamily: "inherit",
          }}
        >
          <ExternalLink size={12} /> Verify
        </button>
        {tip && (
          <div style={{
            position: "absolute", bottom: "calc(100% + 6px)", left: "50%", transform: "translateX(-50%)",
            background: "#0a0a0a", color: "#fff", fontSize: 11, padding: "5px 9px",
            borderRadius: 6, whiteSpace: "nowrap", fontWeight: 600,
          }}>Available after round settles</div>
        )}
      </div>

      <div style={{ marginTop: 8, fontSize: 10, color: "#6b7280", fontFamily: "'JetBrains Mono',monospace", textAlign: "center" }}>
        {data.refId}
      </div>
    </div>
  );
}

function ErrorBody({ data, onClose }: { data: Extract<BetToastData, { kind: "error" }>; onClose: () => void }) {
  return (
    <div style={{ padding: "14px 16px 12px", position: "relative" }}>
      <button
        onClick={onClose}
        aria-label="Close"
        style={{
          position: "absolute", top: 6, right: 6, background: "transparent",
          border: 0, color: "#0a0a0a", cursor: "pointer", padding: 4,
        }}
      ><X size={15} /></button>
      <div style={{ fontWeight: 900, fontSize: 14, marginBottom: 6, color: "#7f1d1d" }}>
        ❌ Bet Failed
      </div>
      <div style={{ fontSize: 12.5, color: "#7f1d1d" }}>{data.message}</div>
      <Coin size={0} />
    </div>
  );
}
