"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export function DataModeSwitch() {
  const router = useRouter();
  const [mode, setMode] = useState<"mock" | "api">("mock");

  useEffect(() => {
    // Try to read current mode from a data attribute set server-side
    const el = document.getElementById("__data_mode__");
    const current = el?.getAttribute("data-mode");
    if (current === "api" || current === "mock") setMode(current);
  }, []);

  async function change(next: "mock" | "api") {
    await fetch("/api/datamode", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ mode: next }) });
    setMode(next);
    router.refresh(); // RSC refresh to pick up cookie
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div className="rounded-xl border border-white/10 bg-white/5 backdrop-blur px-3 py-2 text-sm">
        <span className="mr-2 text-zinc-400">Data:</span>
        <button onClick={() => change("mock")} className={`px-2 py-1 rounded ${mode === "mock" ? "bg-white/20" : "hover:bg-white/10"}`}>mock</button>
        <button onClick={() => change("api")} className={`ml-1 px-2 py-1 rounded ${mode === "api" ? "bg-white/20" : "hover:bg-white/10"}`}>api</button>
      </div>
    </div>
  );
}
