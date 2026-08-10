"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { createClient } from "@/utils/supabase/client";

import CyberGrid from '@/components/ui/CyberGrid';
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import StatsBar from "@/components/dashboard/StatsBar";
import ContentBrowser, { TabTarget } from "@/components/dashboard/ContentBrowser";
import InferenceLabs from "@/components/dashboard/InferenceLabs";
import AiAssistant from "@/components/dashboard/AiAssistant";
import CosmosMapPreview from "@/components/dashboard/CosmosMapPreview";

import useCosmosData from "@/hooks/cosmos/useCosmosData";
import { useDashboardData } from "@/hooks/dashboard/useDashboardData";
import { Topic, Article } from "@/types/dashboard";

type TabId = "nebulas" | "rogue" | "modules";

export default function Dashboard() {
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
    loadingModels
  } = useDashboardData(activeTab);

  const { userProgress, getNodeStatus } = useCosmosData();

  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null);
  const [articles, setArticles] = useState<Article[]>([]);
  const [drilldownLoading, setDrilldownLoading] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  useEffect(() => {
    if (topics.length > 0 && !mapTarget.mapId) {
      setMapTarget(prev => ({ ...prev, mapId: topics[0].id }));
    }
  }, [topics, mapTarget.mapId]);

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    setShowProfileMenu(false);
  };

  const fetchTopicArticles = async (topic: Topic) => {
    setDrilldownLoading(true);
    setSelectedTopic(topic);
    try {
      const res = await fetch(`/api/v1/topics/${topic.id}/articles`);
      const json = await res.json();
      setArticles(json.data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setDrilldownLoading(false);
    }
  };

  return (
    <div className="h-screen w-screen bg-space-bg text-text-main font-sans overflow-hidden select-none flex flex-col">
      <CyberGrid opacity="" />
      <DashboardHeader />

      {/* === MAIN LAYOUT (2 ZONES) === */}
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
        <div className={`flex-shrink-0 flex flex-col gap-4 min-h-0 transition-all duration-500 ${isAssistantOpen ? 'w-full lg:w-full' : 'w-full lg:w-[350px]'}`}>
          <div className={`flex flex-col transition-all duration-500 overflow-hidden ${isAssistantOpen ? 'h-0 opacity-0' : 'flex-1 min-h-0 opacity-100'}`}>
            <InferenceLabs 
              models={models}
              loadingModels={loadingModels}
            />
          </div>
          <AiAssistant isOpen={isAssistantOpen} setIsOpen={setIsAssistantOpen} />
        </div>

      </div>
    </div>
  );
}
