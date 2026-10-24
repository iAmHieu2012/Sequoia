"use client";

import React from "react";
import Link from "next/link";
import { Terminal } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

import CyberGrid from '@/components/ui/CyberGrid';
import CyberBrackets from '@/components/ui/CyberBrackets';
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import StatsBar from "@/components/dashboard/StatsBar";
import ContentBrowser from "@/components/dashboard/ContentBrowser";
import InferenceLabs from "@/components/dashboard/InferenceLabs";
import AiAssistant from "@/components/dashboard/AiAssistant";
import CosmosMapPreview from "@/components/dashboard/CosmosMapPreview";

import { useDashboardContext } from "@/contexts/DashboardContext";

/**
 * Client-side orchestrator for the Desktop Dashboard view.
 * Handles tab navigation, map rendering targets, and layout management.
 */
export default function DesktopDashboard() {
  const { user } = useAuth();
  
  const {
    activeTab, setActiveTab,
    isAssistantOpen, setIsAssistantOpen,
    mapTarget, setMapTarget,
    topics, rogueArticles, textbooks, models, progressSummary, loading, loadingModels, dashboardError,
    userProgress, getNodeStatus, cosmosError,
    selectedTopic, setSelectedTopic, articles, drilldownLoading, fetchTopicArticles
  } = useDashboardContext();

  return (
    <div className="h-screen w-screen bg-space-bg text-text-main font-sans overflow-hidden select-none flex flex-col">
      <CyberGrid opacity="" />
      <DashboardHeader error={dashboardError || cosmosError} />

      {/* === MAIN LAYOUT (2 ZONES) === */}
      {(dashboardError || cosmosError) ? (
        <div className="flex-1 flex flex-col items-center justify-center p-6 z-10 relative">
           <div className="max-w-2xl w-full border border-coral bg-black/80 p-12 flex flex-col items-center text-center relative overflow-hidden">
             <CyberBrackets color="border-coral/50" />
             <div className="absolute inset-0 bg-coral/5 pointer-events-none" />             
             <div className="w-16 h-16 border border-coral/30 flex items-center justify-center rounded-full mb-6 relative">
               <div className="w-16 h-16 absolute border border-coral/50 rounded-full animate-ping" />
               <div className="w-8 h-8 bg-coral rounded-full shadow-[0_0_20px_var(--color-coral)]" />
             </div>
             
             <h2 className="text-3xl md:text-4xl font-mono text-coral tracking-[0.2em] uppercase mb-4 drop-shadow-[0_0_10px_var(--color-coral)]">
               Critical System Failure
             </h2>
             
             <div className="w-full h-px bg-coral/20 my-4" />
             
             <div className="text-coral/90 font-mono text-sm leading-relaxed max-w-lg mb-8 bg-coral/10 p-4 border border-coral/20 text-left overflow-y-auto max-h-[30vh]">
               <span className="opacity-70 animate-pulse mr-2">{">>"}</span>
               {dashboardError || cosmosError}
             </div>
             
             <button onClick={() => window.location.reload()} className="px-8 py-3 border border-coral text-coral uppercase tracking-[0.2em] font-mono text-xs hover:bg-coral hover:text-black transition-all duration-300 relative group overflow-hidden">
               <span className="relative z-10 font-bold">Initiate System Reboot</span>
               <div className="absolute inset-0 bg-coral translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
             </button>
           </div>
        </div>
      ) : (
        <div className="flex-1 flex gap-4 px-6 py-4 min-h-0 overflow-hidden relative z-10">
          {/* === EXPLORE ZONE (LEFT) === */}
          <div className={`flex-1 flex flex-col gap-4 min-w-0 transition-all duration-500 ${isAssistantOpen ? 'opacity-0 w-0 flex-none overflow-hidden -ml-4' : 'opacity-100'}`}>
            
            <StatsBar 
              user={user} 
              progressSummary={progressSummary} 
              rogueArticlesLength={rogueArticles.length} 
              textbooksLength={textbooks.length} 
              userProgress={userProgress} 
            />
            
            {/* TABS AND MAP */}
            <div className="flex-1 flex gap-4 min-h-0">
              <ContentBrowser 
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                topics={topics}
                rogueArticles={rogueArticles}
                textbooks={textbooks}
                articles={articles}
                loading={loading}
                drilldownLoading={drilldownLoading}
                selectedTopic={selectedTopic}
                setSelectedTopic={setSelectedTopic}
                fetchTopicArticles={fetchTopicArticles}
                setMapTarget={setMapTarget}
                user={user}
                getNodeStatus={getNodeStatus}
                progressSummary={progressSummary}
              />

              {/* Right column: Map preview */}
              <CosmosMapPreview 
                className="flex-1 min-h-0"
                targetX={mapTarget.x} 
                targetY={mapTarget.y} 
                targetScale={mapTarget.scale} 
                mapId={mapTarget.mapId} 
                activeNodeId={mapTarget.activeNodeId} 
              />
            </div>
          </div>

          {/* === COMMAND ZONE (RIGHT) === */}
          <div className={`shrink-0 flex flex-col gap-4 min-h-0 transition-all duration-500 ${isAssistantOpen ? 'w-full lg:w-full' : 'w-full lg:w-87.5'}`}>
            <div className={`flex flex-col gap-4 transition-all duration-500 overflow-hidden ${isAssistantOpen ? 'h-0 opacity-0' : 'flex-1 min-h-0 opacity-100'}`}>
              <InferenceLabs 
                models={models}
                loadingModels={loadingModels}
              />
              <Link
                href="/sandbox"
                className="flex items-center justify-center h-[46px] shrink-0 bg-black/40 border border-white/10 relative transition-all duration-500 overflow-hidden group/panel cursor-pointer hover:bg-white/10 hover:border-white/40"
              >
                <CyberBrackets color="transition-colors duration-300 border-white/10 group-hover/panel:border-white/40" />
                <div className="absolute left-0 top-0 w-1 h-full bg-white scale-y-0 group-hover/panel:scale-y-100 origin-center transition-transform duration-300 ease-out shadow-[0_0_10px_rgba(255,255,255,0.8)]" />
                <div className="absolute inset-0 -translate-x-[150%] group-hover/panel:translate-x-[150%] bg-gradient-to-r from-transparent via-white/10 to-transparent transition-transform duration-700 ease-out pointer-events-none" />
                <div className="flex items-center justify-center gap-2 py-2 px-4 font-mono text-xs font-bold tracking-[0.12em] uppercase text-white/40 group-hover/panel:text-white group-hover/panel:drop-shadow-[0_0_8px_rgba(255,255,255,0.8)] transition-all duration-300 relative z-10">
                  <Terminal className="w-5 h-5 transition-all duration-500 group-hover/panel:scale-110 opacity-70 group-hover/panel:opacity-100" />
                  <span>PYTHON SANDBOX</span>
                </div>
              </Link>
            </div>
            <AiAssistant isOpen={isAssistantOpen} setIsOpen={setIsAssistantOpen} />
          </div>
        </div>
      )}
    </div>
  );
}
