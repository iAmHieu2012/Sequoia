"use client";

import { useState, useEffect } from "react";
import { type User } from "@supabase/supabase-js";
import CyberPanel from "@/components/ui/CyberPanel";
import NebulasTab from "./tabs/NebulasTab";
import RogueTab from "./tabs/RogueTab";
import ModulesTab from "./tabs/ModulesTab";

import { Topic, Article, Textbook, ProgressSummary } from "@/types/dashboard";
import { CosmosMap } from "@/hooks/cosmos/useCosmosData";
import { CosmosService } from "@/services/cosmos.service";

type TabId = "nebulas" | "rogue" | "modules";

export interface TabTarget {
  x: number;
  y: number;
  scale: number;
  mapId: string | undefined;
  activeNodeId?: string;
}

interface ContentBrowserProps {
  /** Currently active tab ID */
  activeTab: TabId;
  /** State setter to change the active tab */
  setActiveTab: (tab: TabId) => void;
  /** List of main knowledge topics (Nebulas) */
  topics: Topic[];
  /** List of standalone articles (Rogue Papers) */
  rogueArticles: Article[];
  /** List of interactive textbooks (Modules) */
  textbooks: Textbook[];
  /** Articles belonging to the currently selected Topic */
  articles: Article[];
  /** Loading state for the main dashboard data */
  loading: boolean;
  /** Loading state specifically for fetching topic's articles */
  drilldownLoading: boolean;
  /** Currently selected topic for drill-down view */
  selectedTopic: Topic | null;
  /** State setter for selected topic */
  setSelectedTopic: (topic: Topic | null) => void;
  /** Function to fetch articles when a topic is clicked */
  fetchTopicArticles: (topic: Topic) => void;
  /** State setter to pan/zoom the Cosmos map to specific coordinates */
  setMapTarget: React.Dispatch<React.SetStateAction<TabTarget>>;
  /** The authenticated user */
  user: User | null;
  /** Function to check completion status of an article */
  getNodeStatus: (id: string) => boolean;
  /** Global progress statistics */
  progressSummary: ProgressSummary | null;
}

/**
 * The primary navigation sidebar for the Dashboard.
 * Allows users to browse through Nebulas (Topics), Rogue (Papers), and Modules (Textbooks).
 * Handles fetching its own structural map data via CosmosService.
 */
export default function ContentBrowser({
  activeTab, setActiveTab, topics, rogueArticles, textbooks, articles,
  loading, drilldownLoading, selectedTopic, setSelectedTopic,
  fetchTopicArticles, setMapTarget, user, getNodeStatus,
  progressSummary
}: ContentBrowserProps) {
  const [mapData, setMapData] = useState<CosmosMap | null>(null);
  const currentMapId = activeTab === "rogue" ? "standalone-articles" : (activeTab === "nebulas" && selectedTopic ? selectedTopic.id : undefined);

  useEffect(() => {
    let isMounted = true;
    
    const fetchMap = async () => {
      if (!currentMapId) return;
      const data = await CosmosService.getMapData(currentMapId);
      if (isMounted) setMapData(data);
    };

    fetchMap();

    return () => { 
      isMounted = false; 
      setMapData(null); 
    };
  }, [currentMapId]);

  return (
    <CyberPanel variant="solid-dark" chamfer="none" decorations="brackets" className="flex-shrink-0 w-full lg:w-[400px] flex flex-col min-h-0 relative z-10 bg-space-bg">
      {/* Tab bar */}
      <div className="flex flex-shrink-0 border-b border-white/10 bg-space-bg">
        {[
          { id: "nebulas", label: "NEBULAS", sub: "Topics", defaultTarget: { x: 0, y: 0, scale: 0.2, mapId: topics.length > 0 ? topics[0].id : undefined } },
          { id: "rogue", label: "ROGUE", sub: "Papers", defaultTarget: { x: 0, y: 0, scale: 0.2, mapId: "standalone-articles" } },
          { id: "modules", label: "MODULES", sub: "Textbooks", defaultTarget: { x: 0, y: 0, scale: 0.2, mapId: undefined } },
        ].map(tab => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id as TabId);
                setSelectedTopic(null);
                setMapTarget(prev => ({
                  ...prev,
                  x: tab.defaultTarget.x,
                  y: tab.defaultTarget.y,
                  scale: tab.defaultTarget.scale,
                  mapId: tab.defaultTarget.mapId ?? prev.mapId,
                  activeNodeId: undefined
                }));
              }}
              className={`group relative z-10 flex-1 h-14 md:h-16 flex flex-col justify-center px-4 md:px-6 transition-colors duration-200 cursor-pointer border-r border-white/10 last:border-r-0 bg-transparent overflow-hidden ${
                isActive ? "text-space-bg" : "text-white/40 hover:text-white"
              }`}
            >
              {/* Individual Slide Fill */}
              <div 
                className={`absolute top-0 left-0 h-full w-full bg-white clip-mod-1 transition-transform duration-300 ease-out z-0 ${
                  isActive ? "translate-x-0" : "-translate-x-full group-hover:-translate-x-[95%]"
                }`}
              />
              <div className="relative z-10 flex items-center justify-center w-full">
                <span className="text-sm font-mono font-bold tracking-[0.12em] uppercase">
                  {tab.label}
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Tab content */}
      <div key={activeTab} className="flex-1 overflow-y-auto min-h-0 animate-snap-in">
        {/* NEBULAS tab */}
        {activeTab === "nebulas" && (
          <NebulasTab 
            topics={topics}
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
            mapData={mapData}
          />
        )}

        {/* ROGUE tab */}
        {activeTab === "rogue" && (
          <RogueTab
            rogueArticles={rogueArticles}
            loading={loading}
            setMapTarget={setMapTarget}
            progressSummary={progressSummary}
            mapData={mapData}
          />
        )}

        {/* MODULES tab */}
        {activeTab === "modules" && (
          <ModulesTab textbooks={textbooks} />
        )}
      </div>
    </CyberPanel>
  );
}

