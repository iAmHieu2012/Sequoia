"use client";

import { useState, useEffect } from "react";
import CyberBrackets from "@/components/ui/CyberBrackets";
import { type User } from "@supabase/supabase-js";
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
    <div className="flex-shrink-0 w-full lg:w-[320px] flex flex-col min-h-0 bg-black/40 border border-panel-border relative">
      <CyberBrackets color="border-white/10" />

      {/* Tab bar */}
      <div className="flex flex-shrink-0 border-b border-panel-border">
        {[
          { id: "nebulas", label: "NEBULAS", sub: "Topics", accent: "turquoise", defaultTarget: { x: 7500, y: 2500, scale: 0.2, mapId: topics.length > 0 ? topics[0].id : undefined } },
          { id: "rogue", label: "ROGUE", sub: "Papers", accent: "purple", defaultTarget: { x: 8250, y: 3500, scale: 0.2, mapId: "standalone-articles" } },
          { id: "modules", label: "MODULES", sub: "Textbooks", accent: "orange", defaultTarget: { x: 7500, y: 2500, scale: 0.2, mapId: undefined } },
        ].map(tab => (
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
            className={`flex-1 py-3 px-1 text-center font-heading text-[11px] font-bold tracking-[0.12em] uppercase transition-all cursor-pointer border-b-2 ${
              activeTab === tab.id
                ? tab.id === "nebulas" ? "text-turquoise border-turquoise bg-turquoise/5" : tab.id === "rogue" ? "text-purple border-purple bg-purple/5" : tab.id === "modules" ? "text-orange border-orange bg-orange/5" : "text-white border-white bg-white/5"
                : "text-text-dim border-transparent hover:text-white hover:bg-white/5"
            }`}
          >
            {tab.label}
            <span className="block text-[8px] font-mono font-normal mt-0.5 opacity-50 normal-case tracking-wider">
              {tab.sub}
            </span>
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className={`flex-1 overflow-y-auto min-h-0 [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-track]:bg-black/20 uppercase tracking-wider ${
        activeTab === "nebulas" ? "[&::-webkit-scrollbar-thumb]:bg-turquoise/20 hover:[&::-webkit-scrollbar-thumb]:bg-turquoise/40" :
        activeTab === "rogue" ? "[&::-webkit-scrollbar-thumb]:bg-purple/20 hover:[&::-webkit-scrollbar-thumb]:bg-purple/40" :
        activeTab === "modules" ? "[&::-webkit-scrollbar-thumb]:bg-orange/20 hover:[&::-webkit-scrollbar-thumb]:bg-orange/40" :
        "[&::-webkit-scrollbar-thumb]:bg-white/20 hover:[&::-webkit-scrollbar-thumb]:bg-white/40"
      }`}>
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
    </div>
  );
}

