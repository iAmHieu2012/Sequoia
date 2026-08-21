"use client";

import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";

import CyberGrid from '@/components/ui/CyberGrid';
import CyberBrackets from '@/components/ui/CyberBrackets';
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import StatsBar from "@/components/dashboard/StatsBar";
import ContentBrowser, { TabTarget } from "@/components/dashboard/ContentBrowser";
import InferenceLabs from "@/components/dashboard/InferenceLabs";
import AiAssistant from "@/components/dashboard/AiAssistant";
import CosmosMapPreview from "@/components/dashboard/CosmosMapPreview";

import { useCosmosData } from "@/hooks/cosmos/useCosmosData";
import { useDashboardData } from "@/hooks/dashboard/useDashboardData";
import { Topic, Article } from "@/types/dashboard";

import { TopicService } from "@/services/topic.service";

type TabId = "nebulas" | "rogue" | "modules";

/**
 * Client-side orchestrator for the main Dashboard view.
 * Handles tab navigation, map rendering targets, and layout management.
 */
export default function DashboardClient() {
  const { user } = useAuth();
  
  const [activeTab, setActiveTab] = useState<TabId>("nebulas");
  const [isAssistantOpen, setIsAssistantOpen] = useState(false);
  const [mapTarget, setMapTarget] = useState<TabTarget>({ x: 7500, y: 2500, scale: 0.2, mapId: undefined, activeNodeId: undefined });
  
  const {
    topics,
    rogueArticles,
    textbooks,
    models,
    progressSummary,
    loading,
    loadingModels,
    error: dashboardError
  } = useDashboardData(activeTab);

  const { userProgress, getNodeStatus, error: cosmosError } = useCosmosData();

  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null);
  const [articles, setArticles] = useState<Article[]>([]);
  const [drilldownLoading, setDrilldownLoading] = useState(false);

  // Derived state during render: Initialize mapId when topics are loaded
  if (topics.length > 0 && !mapTarget.mapId) {
    setMapTarget({ ...mapTarget, mapId: topics[0].id });
  }

  const fetchTopicArticles = async (topic: Topic) => {
    setDrilldownLoading(true);
    setSelectedTopic(topic);
    try {
      const data = await TopicService.getArticlesByTopic(topic.id);
      setArticles(data);
    } catch (error) {
      console.error(error);
    } finally {
      setDrilldownLoading(false);
    }
  };

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
             
             <h2 className="text-3xl md:text-4xl font-heading text-coral tracking-[0.2em] uppercase mb-4 drop-shadow-[0_0_10px_var(--color-coral)]">
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
            <div className={`flex flex-col transition-all duration-500 overflow-hidden ${isAssistantOpen ? 'h-0 opacity-0' : 'flex-1 min-h-0 opacity-100'}`}>
              <InferenceLabs 
                models={models}
                loadingModels={loadingModels}
              />
            </div>
            <AiAssistant isOpen={isAssistantOpen} setIsOpen={setIsAssistantOpen} />
          </div>
        </div>
      )}
    </div>
  );
}
