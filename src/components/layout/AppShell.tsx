"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Header from "@/components/layout/Header";

export default function AppShell({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();
  const isVisualisation = pathname.startsWith("/visualisations/");
  const [embedMode, setEmbedMode] = useState(false);

  useEffect(() => {
    setEmbedMode(isVisualisation && new URLSearchParams(window.location.search).get("embed") === "1");
  }, [isVisualisation]);

  return (
    <div
      className={
        isVisualisation
          ? "flex h-dvh min-w-0 flex-col overflow-hidden bg-background"
          : "min-h-dvh min-w-0 bg-background"
      }
    >
      {embedMode ? null : <Header />}
      <main className={isVisualisation ? "min-h-0 min-w-0 flex-1 overflow-hidden" : "min-w-0"}>
        {children}
      </main>
    </div>
  );
}
