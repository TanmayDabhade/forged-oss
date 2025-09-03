import React from "react";

interface BadgeProps {
  children: React.ReactNode;
}

export function Badge({ children }: BadgeProps) {
  return (
    <div className="mx-auto w-full max-w-[220px] rounded-full border border-black/15 px-3 py-1 text-center text-[11px] font-medium uppercase tracking-wider">
      {children}
    </div>
  );
}