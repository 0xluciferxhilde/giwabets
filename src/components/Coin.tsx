import React from "react";

const URL = "https://raw.githubusercontent.com/wholt-dev/koko-s-creative-corner/main/ethereum-eth-logo.png";

export default function Coin({ size = 16, style }: { size?: number; style?: React.CSSProperties }) {
  return (
    <img
      src={URL}
      alt="ETH"
      width={size}
      height={size}
      style={{
        display: "inline-block",
        width: size,
        height: size,
        borderRadius: "50%",
        verticalAlign: "-3px",
        objectFit: "cover",
        flexShrink: 0,
        ...style,
      }}
    />
  );
}
