import React from "react";

interface NxpLogoProps {
  className?: string;
  height?: number | string;
  width?: number | string;
  showText?: boolean;
}

export function NxpLogo({
  className = "",
  height = 24,
  width,
}: NxpLogoProps) {
  return (
    <svg
      viewBox="0 0 400 200"
      height={height}
      width={width}
      className={`shrink-0 ${className}`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* N (Orange) */}
      <path
        d="M 28 28 L 68 28 L 68 116 L 124 28 L 164 28 L 108 116 L 148 172 L 108 172 L 68 116 L 68 172 L 28 172 Z"
        fill="#F89C1E"
      />
      {/* X (Cyan Blue) */}
      <path
        d="M 136 28 L 176 28 L 208 80 L 240 28 L 280 28 L 228 100 L 280 172 L 240 172 L 208 120 L 176 172 L 136 172 L 188 100 Z"
        fill="#00A3E0"
      />
      {/* P (Bright Green) */}
      <path
        d="M 252 172 L 292 100 L 292 28 L 368 28 C 398 28 418 48 418 78 C 418 108 398 128 368 128 L 332 128 L 332 172 Z M 332 66 L 332 90 L 362 90 C 374 90 380 84 380 78 C 380 72 374 66 362 66 Z"
        fill="#78BE20"
      />
    </svg>
  );
}
