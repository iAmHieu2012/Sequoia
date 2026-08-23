"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";
import { useCosmosData, UserProgress } from "@/hooks/cosmos/useCosmosData";
import { useDashboardData } from "@/hooks/dashboard/useDashboardData";
import { Topic, Article, Textbook, ProgressSummary } from "@/types/dashboard";
import { TopicService } from "@/services/topic.service";
import { TabTarget } from "@/components/dashboard/ContentBrowser";

export type TabId = "nebulas" | "rogue" | "modules";

export interface AiModel {
  id: string;
  name: string;
  description: string;
  task_type: string;
  file_url: string;
  version: string;
  format: string;
}

interface DashboardContextType {
  activeTab: TabId;
  setActiveTab: React.Dispatch<React.SetStateAction<TabId>>;
  isAssistantOpen: boolean;
  setIsAssistantOpen: React.Dispatch<React.SetStateAction<boolean>>;
  mapTarget: TabTarget;
  setMapTarget: React.Dispatch<React.SetStateAction<TabTarget>>;
  
  topics: Topic[];
  rogueArticles: Article[];
  textbooks: Textbook[];
  models: AiModel[];
  progressSummary: ProgressSummary | null;
  loading: boolean;
  loadingModels: boolean;
  dashboardError: string | null;
  
  userProgress: UserProgress | null;
  getNodeStatus: (id: string) => boolean;
  cosmosError: string | null;
  
  selectedTopic: Topic | null;
  setSelectedTopic: React.Dispatch<React.SetStateAction<Topic | null>>;
  articles: Article[];
  setArticles: React.Dispatch<React.SetStateAction<Article[]>>;
  drilldownLoading: boolean;
  fetchTopicArticles: (topic: Topic) => Promise<void>;
}

const DashboardContext = createContext<DashboardContextType | undefined>(undefined);

export function DashboardProvider({ children }: { children: ReactNode }) {
  const [activeTab, setActiveTab] = useState<TabId>("nebulas");
  const [isAssistantOpen, setIsAssistantOpen] = useState(false);
  const [mapTarget, setMapTarget] = useState<TabTarget>({ x: 0, y: 0, scale: 0.2, mapId: undefined, activeNodeId: undefined });
  
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
    <DashboardContext.Provider
      value={{
        activeTab, setActiveTab,
        isAssistantOpen, setIsAssistantOpen,
        mapTarget, setMapTarget,
        topics, rogueArticles, textbooks, models, progressSummary, loading, loadingModels, dashboardError,
        userProgress, getNodeStatus, cosmosError,
        selectedTopic, setSelectedTopic, articles, setArticles, drilldownLoading, fetchTopicArticles
      }}
    >
      {children}
    </DashboardContext.Provider>
  );
}

export function useDashboardContext() {
  const context = useContext(DashboardContext);
  if (context === undefined) {
    throw new Error("useDashboardContext must be used within a DashboardProvider");
  }
  return context;
}
