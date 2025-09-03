import React from "react";

interface LogoProps {
  size?: number;
}

export function Logo({ size = 20 }: LogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <rect x="2" y="2" width="20" height="20" rx="4" className="fill-black" />
      <path d="M8 8h8v2H8zM8 12h8v2H8zM8 16h5v2H8z" className="fill-white" />
    </svg>
  );
}