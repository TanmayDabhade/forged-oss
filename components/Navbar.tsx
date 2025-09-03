"use client";
import { Logo } from "@/components/Logo";
import ModeSwitch from "@/components/ModeSwitch";
import React, { useState } from "react";

export function Navbar() {
    const [mode, setMode] = useState<"dummy" | "live">("dummy");
    return (
        <header className="sticky top-0 z-40 border-b bg-white backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl text-black items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <Logo />
            <span className="text-lg font-semibold text-black tracking-tight">OpenBoard</span>
          </div>
          <nav className="hidden items-center gap-6 md:flex">
            <a className="text-sm hover:opacity-70" href="/projects">Projects</a>
            <div className="flex items-center gap-2">
                <ModeSwitch mode={mode} onChange={setMode} />
          </div>
          </nav>
        </div>
      </header>
    );
}