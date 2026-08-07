"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Compass, Rocket, Activity, Database, Orbit, TerminalSquare, Cpu, Radar, ShieldCheck, User as UserIcon, LogOut, ArrowRight, BookOpen, Bot, FlaskConical } from "lucide-react";
import CosmosMapPreview from "@/components/dashboard/CosmosMapPreview";
import useCosmosData from "@/hooks/cosmos/useCosmosData";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged, signOut, User } from "firebase/auth";

import CyberBrackets from '@/components/ui/CyberBrackets';
import CyberGrid from '@/components/ui/CyberGrid';

import DashboardHeader from "@/components/dashboard/DashboardHeader";
import StatsBar from "@/components/dashboard/StatsBar";
import ContentBrowser, { TabTarget } from "@/components/dashboard/ContentBrowser";
import InferenceLabs from "@/components/dashboard/InferenceLabs";
import AiAssistant from "@/components/dashboard/AiAssistant";
type TabId = "nebulas" | "rogue" | "modules";

interface Textbook {
  id: string;
  title: string;
  description: string;
  authors: string[];
}

interface Chapter {
  id: string;
  title: string;
  description: string;
  articleCount: number;
}

interface Topic {
  id: string;
  name: string;
  description: string;
  articleCount: number;
}

interface Article {
  id: string;
  title: string;
  summary: string;
}

interface CategoryProgress {
  total: number;
  completed: number;
}

interface ProgressSummary {
  textbooks: Record<string, CategoryProgress>;
  topics: Record<string, CategoryProgress>;
  standalone: Record<string, boolean>;
}

interface AiModel {
  id: string;
  name: string;
  description: string;
  taskType: string;
  fileUrl: string;
  version: string;
  format: string;
}



export default function Dashboard() {
  const [activeTab, setActiveTab] = useState<TabId>("nebulas");
  const [isAssistantOpen, setIsAssistantOpen] = useState(false);
  const [mapTarget, setMapTarget] = useState<TabTarget>({ x: 7500, y: 2500, scale: 0.2, mapId: undefined, activeNodeId: undefined });
  
  const [topics, setTopics] = useState<Topic[]>([]);
  const [rogueArticles, setRogueArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [models, setModels] = useState<AiModel[]>([]);
  const [textbooks, setTextbooks] = useState<Textbook[]>([]);
  const [loadingModels, setLoadingModels] = useState(false);

  useEffect(() => {
    if (models.length === 0) {
      setLoadingModels(true);
      fetch('/api/v1/models') // Proxy to Ktor
        .then(res => res.json())
        .then(data => {
          setModels(data.data || []);
          setLoadingModels(false);
        })
        .catch(err => {
          console.error(err);
          setLoadingModels(false);
        });
    }
  }, [activeTab, models.length]);

  useEffect(() => {
    fetch('/api/v1/textbooks')
      .then(res => res.json())
      .then(data => {
        if (data.data) setTextbooks(data.data);
      })
      .catch(err => console.error(err));
  }, []);

  const [progressSummary, setProgressSummary] = useState<ProgressSummary | null>(null);
  const { userProgress, getNodeStatus } = useCosmosData();

  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null);
  const [articles, setArticles] = useState<Article[]>([]);
  const [drilldownLoading, setDrilldownLoading] = useState(false);

  const [user, setUser] = useState<User | null>(null);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        try {
          const token = await currentUser.getIdToken();
          const progressRes = await fetch('/api/v1/users/progress/summary', {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          const progressJson = await progressRes.json();
          if (progressJson.data) {
            setProgressSummary(progressJson.data);
          }
        } catch (e) {
          console.error('Progress summary fetch failed', e);
        }
      } else {
        setProgressSummary(null);
      }
    });
    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    await signOut(auth);
    setShowProfileMenu(false);
  };


  const fetchTopicArticles = async (topic: Topic) => {
    setDrilldownLoading(true);
    setSelectedTopic(topic);
    const res = await fetch(`/api/v1/topics/${topic.id}/articles`);
    const json = await res.json();
    setArticles(json.data || []);
    setDrilldownLoading(false);
  };

  useEffect(() => {
    async function fetchData() {
      try {
        const tpRes = await fetch('/api/v1/topics');
        const rogueRes = await fetch('/api/v1/articles/standalone');
        
        const tpJson = await tpRes.json();
        const rogueJson = await rogueRes.json();

        setTopics(tpJson.data || []);
        setRogueArticles(rogueJson.data || []);

        if (tpJson.data && tpJson.data.length > 0) {
          setMapTarget(prev => ({ ...prev, mapId: tpJson.data[0].id }));
        }

        // Progress is fetched in onAuthStateChanged
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

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
              handleLogout={handleLogout}
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
