"use client";

import { useState } from "react";
import { useDashboardContext } from "@/contexts/DashboardContext";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import StatsBar from "@/components/dashboard/StatsBar";
import ContentBrowser from "@/components/dashboard/ContentBrowser";
import InferenceLabs from "@/components/dashboard/InferenceLabs";
import AiAssistant from "@/components/dashboard/AiAssistant";
import CosmosMapPreview from "@/components/dashboard/CosmosMapPreview";
import { Activity, Compass, FlaskConical, TerminalSquare } from "lucide-react";
import CyberBrackets from "@/components/ui/CyberBrackets";

import { useAuth } from "@/contexts/AuthContext";

type MobileTab = "stats" | "explore" | "labs" | "ai";

export default function MobileDashboard() {
  const [mobileTab, setMobileTab] = useState<MobileTab>("stats");
  const { user } = useAuth();
  
  const { 
    activeTab, setActiveTab, // Tab state for ContentBrowser
    mapTarget, setMapTarget,
    topics, articles, loading,
    selectedTopic, setSelectedTopic, drilldownLoading, fetchTopicArticles,
    getNodeStatus,
    progressSummary, rogueArticles, textbooks, models, loadingModels, userProgress, dashboardError, cosmosError 
  } = useDashboardContext();

  return (
    <div className="h-screen w-screen bg-space-bg text-text-main overflow-hidden flex flex-col-reverse landscape:flex-row">
      
      {/* NAVIGATION BAR: Bottom in Portrait, Left in Landscape */}
      <nav className="shrink-0 bg-black/90 border-t landscape:border-t-0 landscape:border-r border-panel-border flex landscape:flex-col justify-around landscape:justify-center p-1 landscape:p-2 gap-1 landscape:w-20 z-50">
        <NavButton icon={<Activity className="w-5 h-5" />} label="STATS" active={mobileTab === "stats"} onClick={() => setMobileTab("stats")} />
        <NavButton icon={<Compass className="w-5 h-5" />} label="EXPLORE" active={mobileTab === "explore"} onClick={() => setMobileTab("explore")} />
        <NavButton icon={<FlaskConical className="w-5 h-5" />} label="LABS" active={mobileTab === "labs"} onClick={() => setMobileTab("labs")} />
        <NavButton icon={<TerminalSquare className="w-5 h-5" />} label="AI" active={mobileTab === "ai"} onClick={() => setMobileTab("ai")} />
      </nav>

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col min-h-0 min-w-0">
        <DashboardHeader error={dashboardError || cosmosError} />
        
        <div className="flex-1 min-h-0 p-4 flex flex-col">
          {mobileTab === "stats" && (
            <div className="flex flex-col gap-4 animate-in fade-in duration-300 overflow-y-auto flex-1 pb-4">
              <div className="[&>div]:!grid-cols-1 sm:[&>div]:!grid-cols-2 [&>div>div:nth-child(5)]:!order-first [&>div>div:nth-child(5)]:sm:!col-span-2 gap-4">
                <StatsBar 
                  user={user}
                  progressSummary={progressSummary}
                  rogueArticlesLength={rogueArticles.length}
                  textbooksLength={textbooks.length}
                  userProgress={userProgress}
                />
              </div>
            </div>
          )}
          
          {mobileTab === "explore" && (
            <div className="flex-1 min-h-0 flex flex-col landscape:flex-row gap-4 animate-in fade-in duration-300">
              {/* Top/Left: Map Preview */}
              <div className="aspect-square w-full landscape:aspect-auto landscape:h-full landscape:w-1/2 min-h-0 shrink-0">
                <CosmosMapPreview 
                  className="h-full w-full"
                  targetX={mapTarget.x} 
                  targetY={mapTarget.y} 
                  targetScale={mapTarget.scale} 
                  mapId={mapTarget.mapId} 
                  activeNodeId={mapTarget.activeNodeId} 
                />
              </div>
              
              {/* Bottom/Right: Content Browser */}
              <div className="landscape:h-full landscape:w-1/2 min-h-0 flex-1 flex flex-col [&>div]:h-full">
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
              </div>
            </div>
          )}
          
          {mobileTab === "labs" && (
            <div className="flex-1 min-h-0 flex flex-col animate-in fade-in duration-300">
              <InferenceLabs models={models} loadingModels={loadingModels} />
            </div>
          )}
          {mobileTab === "ai" && (
            <div className="flex-1 min-h-0 flex flex-col animate-in fade-in duration-300 pb-4">
              <AiAssistant isOpen={true} setIsOpen={(open) => { if (!open) setMobileTab("explore"); }} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function NavButton({ icon, label, active, onClick }: { icon: React.ReactNode, label: string, active: boolean, onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-center justify-center p-1.5 transition-all duration-300 relative group
        ${active ? 'text-system' : 'text-text-dim hover:text-white'}
      `}
    >
      <div className={`relative z-10 mb-0.5 transition-transform duration-300 ${active ? 'scale-110 drop-shadow-[0_0_8px_var(--color-system)]' : 'group-hover:scale-110'}`}>
        {icon}
      </div>
      <span className="text-[8px] font-mono tracking-widest uppercase">{label}</span>
      
      {active && (
        <div className="absolute inset-0 bg-system/10 border border-system/30 z-0">
          <CyberBrackets color="border-system/50" />
        </div>
      )}
    </button>
  );
}
