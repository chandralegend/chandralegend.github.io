"use client";

import type { ReactNode } from "react";
import { OPEN_TERMINAL } from "@/lib/scene-store";

export default function TerminalButton({ className = "", children }: { className?: string; children: ReactNode }) {
  return (
    <button
      type="button"
      className={className}
      onClick={() => window.dispatchEvent(new Event(OPEN_TERMINAL))}
      data-cursor="Shell"
    >
      {children}
    </button>
  );
}
