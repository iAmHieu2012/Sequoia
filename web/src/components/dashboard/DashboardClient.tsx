"use client";

import { useState, useEffect } from "react";
import { DashboardProvider } from "@/contexts/DashboardContext";
import DesktopDashboard from "./DesktopDashboard";
import MobileDashboard from "./MobileDashboard";

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
