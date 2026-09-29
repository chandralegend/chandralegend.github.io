"use client";

import { useSyncExternalStore } from "react";
import { site } from "@/lib/content";

const format = new Intl.DateTimeFormat("en-GB", {
  timeZone: site.location.timeZone,
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  hour12: false,
});

function subscribe(callback: () => void) {
  const id = setInterval(callback, 1000);
  return () => clearInterval(id);
}

const getTime = () => format.format(Date.now());

/** Live local time in Colombo. Renders a placeholder on the server. */
export default function Clock({ className = "" }: { className?: string }) {
  const time = useSyncExternalStore(subscribe, getTime, () => "--:--:--");
  return (
    <time className={`clock ${className}`} suppressHydrationWarning>
      {time}
    </time>
  );
}
