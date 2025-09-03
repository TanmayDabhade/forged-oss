import React from "react";

export default function ModeSwitch({
  mode,
  onChange,
}: {
  mode: "dummy" | "live";
  onChange: (m: "dummy" | "live") => void;
}) {
  return (
    <button
      onClick={() => onChange(mode === "dummy" ? "live" : "dummy")}
      className="inline-flex items-center gap-2 rounded-full border border-black px-3 py-1.5 text-xs font-semibold hover:bg-black hover:text-white"
      title="Toggle data source"
    >
      <span className="inline-block h-2 w-2 rounded-full" style={{ background: mode === "dummy" ? "#bbb" : "#000" }} />
      {mode === "dummy" ? "Demo data" : "Live API"}
    </button>
  );
}