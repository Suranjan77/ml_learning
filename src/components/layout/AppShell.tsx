"use client";

import { usePathname } from "next/navigation";
import Header from "@/components/layout/Header";

export default function AppShell({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();
  const isVisualisation = pathname.startsWith("/visualisations/");

  return (
    <div
      className={
        isVisualisation
          ? "flex h-dvh min-w-0 flex-col overflow-hidden bg-background"
          : "min-h-dvh min-w-0 bg-background"
      }
    >
      <Header />
      <main className={isVisualisation ? "min-h-0 min-w-0 flex-1 overflow-hidden" : "min-w-0"}>
        {children}
      </main>
    </div>
  );
}
