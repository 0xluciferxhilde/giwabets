/** config.ts — single source of truth for backend + chain endpoints. */

/** Backend API base URL (cross-origin subdomain). */
export const API_BASE =
  (import.meta as any).env?.VITE_API_URL || "https://giwabetapi.test-hub.xyz";

/** GIWA Sepolia testnet */
export const CHAIN_ID = 91342;
export const CHAIN_ID_HEX = "0x1652E";
export const CHAIN_NAME = "GIWA Sepolia";
export const RPC_URL = "https://sepolia-rpc.giwa.io";
export const EXPLORER_URL = "https://sepolia-explorer.giwa.io";
export const NATIVE_CURRENCY = { name: "ETH", symbol: "ETH", decimals: 18 } as const;

/** House wallet that collects stakes and pays winners. */
export const HOUSE_ADDRESS = "0x809be5c77b5167C1C189FC5F658CC97C2c4A1811";
