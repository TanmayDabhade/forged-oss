import React from "react";
import { Logo } from "./Logo";

export function Footer() {
  return (
      <footer className="border-t border-black/10">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 py-10 sm:flex-row">
          <div className="flex items-center gap-2">
            <Logo size={18} />
            <span className="text-sm">© {new Date().getFullYear()} OpenBoard</span>
          </div>
          <div className="flex items-center gap-6 text-sm">
            <a className="hover:opacity-70" href="#">Privacy</a>
            <a className="hover:opacity-70" href="#">Terms</a>
            <a className="hover:opacity-70" href="#">Contact</a>
          </div>
        </div>
      </footer>
    );
}
