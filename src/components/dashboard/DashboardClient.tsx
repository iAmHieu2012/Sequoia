"use client";

import { useState, useEffect } from "react";
import { DashboardProvider } from "@/contexts/DashboardContext";
import DesktopDashboard from "./DesktopDashboard";
import MobileDashboard from "./MobileDashboard";

/**
 * Picks the desktop or mobile layout by window width (1024px = Tailwind `lg`).
 * Renders nothing until mounted, so nothing below is server-rendered and hooks may read
 * browser storage during their first render (see useGeminiApiKey).
 */
export default function DashboardClient() {
  const [isDesktop, setIsDesktop] = useState<boolean | null>(null);

  useEffect(() => {
    const checkScreen = () => setIsDesktop(window.innerWidth >= 1024);
    checkScreen();
    window.addEventListener("resize", checkScreen);
    return () => window.removeEventListener("resize", checkScreen);
  }, []);

  if (isDesktop === null) return null;

  return (
    <DashboardProvider>
      {isDesktop ? <DesktopDashboard /> : <MobileDashboard />}
    </DashboardProvider>
  );
}
