import React from "react";

interface FeatureCardProps {
  title: string;
  desc: string;
  icon: React.ReactNode;
}

export function FeatureCard({ title, desc, icon }: FeatureCardProps) {
  return (
    <div className="rounded-3xl border border-black/15 bg-white p-6 transition hover:-translate-y-0.5 hover:shadow-[0_8px_0_#000]">
      <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-xl border border-black/20">
        {icon}
      </div>
      <h3 className="text-lg font-semibold">{title}</h3>
      <p className="mt-1 text-sm text-black/70">{desc}</p>
    </div>
  );
}