import { http } from "wagmi";
import { defineChain } from "viem";
import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { CHAIN_ID, CHAIN_NAME, RPC_URL, EXPLORER_URL, NATIVE_CURRENCY } from "./config";

export const giwaSepolia = defineChain({
  id: CHAIN_ID,
  name: CHAIN_NAME,
  nativeCurrency: { ...NATIVE_CURRENCY },
  rpcUrls: {
    default: { http: [RPC_URL] },
  },
  blockExplorers: {
    default: { name: "GIWA Sepolia Explorer", url: EXPLORER_URL },
  },
  contracts: {
    multicall3: { address: "0xcA11bde05977b3631167028862bE2a173976CA11" },
  },
});


export const EXPLORER = giwaSepolia.blockExplorers.default.url;

export const wagmiConfig = getDefaultConfig({
  appName: "BetsOnBlock",
  projectId: "betsonblock-giwa",
  chains: [giwaSepolia],
  transports: { [giwaSepolia.id]: http() },
  ssr: false,
});
