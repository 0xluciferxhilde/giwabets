import React from "react";

const URL = "https://raw.githubusercontent.com/dopedopex/your-friendly-helper/main/zkltc.jpg";

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
