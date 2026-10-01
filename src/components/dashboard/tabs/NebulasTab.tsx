import Link from "next/link";
import { Rocket, ArrowRight } from "lucide-react";
import { Topic, Article, ProgressSummary } from "@/types/dashboard";
import { type User } from "@supabase/supabase-js";
import React from "react";
import { TabTarget } from "../ContentBrowser";
import { CosmosMap } from "@/hooks/cosmos/useCosmosData";

interface NebulasTabProps {
  /** List of main knowledge topics */
  topics: Topic[];
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
  /** Cached map spatial data for calculating hover target coordinates */
  mapData: CosmosMap | null;
}

/**
 * Renders the "Nebulas" tab within the ContentBrowser.
 * Displays a list of Topics, and allows drilling down into specific Topic Articles.
 * Triggers Cosmos map panning on hover.
 */
export default function NebulasTab({
  topics, articles, loading, drilldownLoading, selectedTopic, setSelectedTopic,
  fetchTopicArticles, setMapTarget, user, getNodeStatus, progressSummary, mapData
}: NebulasTabProps) {
  if (selectedTopic) {
    return (
      <div className="animate-snap-in">
        <button 
          onClick={() => setSelectedTopic(null)} 
          className="w-full text-left px-5 py-4 bg-space-bg text-white/40 hover:text-white font-mono text-xs tracking-widest uppercase flex items-center gap-2 transition-colors border-b border-white/10 group"
        >
          <ArrowRight className="w-3 h-3 rotate-180 group-hover:-translate-x-1 transition-transform" /> 
          RETURN TO NEBULAS
        </button>
        {drilldownLoading ? <div className="p-5 text-white/40 font-mono animate-pulse text-xs tracking-widest">LOADING ARTICLES...</div> :
          articles.map((article) => {
            const isDecoded = user && getNodeStatus(article.id);
            return (
              <div key={article.id} 
                  className="group cursor-pointer border-b border-white/10 bg-space-bg hover:bg-white/10 transition-colors relative overflow-hidden flex flex-col"
                  onClick={() => setMapTarget((prev) => {
                    const node = mapData?.nodes?.find(n => n.article_id === article.id);
                    return { ...prev, x: node ? node.x : prev.x, y: node ? node.y : prev.y, scale: 0.6, activeNodeId: article.id };
                  })}
              >
                <div className="absolute left-0 top-0 w-1 h-full bg-white scale-y-0 group-hover:scale-y-100 origin-top transition-transform duration-200" />
                
                <div className="relative z-10 w-full flex flex-col h-full">
                  <div className="flex justify-between items-start px-5 pt-5 pb-3">
                    <h3 className="text-sm md:text-base font-mono font-black text-white tracking-widest uppercase pr-4">
                      {article.title}
                    </h3>
                  </div>
                  
                  <div className="px-5 pb-5 flex-1 flex flex-col">
                    <p className="text-white/40 text-xs font-mono leading-relaxed normal-case line-clamp-2 mb-5">
                      &gt; {article.summary}
                    </p>

                    <div className="flex items-center justify-between mt-auto pt-2">
                      <div className="text-xs font-mono tracking-widest uppercase flex gap-2 items-center">
                        <span className="text-white/40">STATUS:</span>
                        <span className={isDecoded ? "text-white font-bold" : "text-white/40"}>
                          {isDecoded ? 'DECODED' : 'UNEXPLORED'}
                        </span>
                      </div>
                      
                      <Link href={`/articles/${article.id}`} onClick={e => e.stopPropagation()} 
                            className="px-4 py-2 text-xs font-mono font-bold tracking-widest flex items-center gap-2 text-white/40 group-hover:text-space-bg group-hover:bg-white transition-all">
                        INTERCEPT <Rocket className="w-3 h-3 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        }
      </div>
    );
  }

  if (loading) return <div className="p-5 text-white/40 font-mono animate-pulse text-xs tracking-widest">SCANNING NEBULAS...</div>;

  return (
    <div className="animate-snap-in">
      {topics.map((topic) => {
        const isExplored = (progressSummary?.topics[topic.id]?.completed ?? 0) === (progressSummary?.topics[topic.id]?.total ?? -1) && (progressSummary?.topics[topic.id]?.total ?? 0) > 0;
        
        return (
          <div
            key={topic.id}
            className="group cursor-pointer border-b border-white/10 bg-space-bg hover:bg-white/10 transition-colors relative overflow-hidden flex flex-col"
            onClick={() => setMapTarget((prev) => ({ ...prev, x: 0, y: 0, scale: 0.2, mapId: topic.id, activeNodeId: undefined }))}
          >
            <div className="absolute left-0 top-0 w-1 h-full bg-white scale-y-0 group-hover:scale-y-100 origin-top transition-transform duration-200" />
            
            <div className="relative z-10 w-full flex flex-col h-full">
              <div className="flex justify-between items-start px-5 pt-5 pb-3">
                <h3 className="text-sm md:text-base font-mono font-black text-white tracking-widest uppercase pr-4">
                  {topic.name}
                </h3>
              </div>
              
              <div className="px-5 pb-5 flex-1 flex flex-col">
                <p className="text-white/40 text-xs font-mono leading-relaxed normal-case line-clamp-2 mb-5">
                  &gt; {topic.description}
                </p>

                <div className="flex items-center justify-between mt-auto pt-2">
                  <div className="text-xs font-mono tracking-widest uppercase flex gap-2 items-center">
                    <span className="text-white/40">STATUS:</span>
                    <span className={isExplored ? "text-white font-bold" : "text-white/40"}>
                      {isExplored ? 'EXPLORED' : 'UNEXPLORED'}
                    </span>
                  </div>
                  
                  <button onClick={(e) => { 
                    e.stopPropagation(); 
                    fetchTopicArticles(topic); 
                    setMapTarget((prev) => ({ ...prev, x: 0, y: 0, scale: 0.2, mapId: topic.id, activeNodeId: undefined })); 
                  }} 
                  className="px-4 py-2 text-xs font-mono font-bold tracking-widest flex items-center gap-2 text-white/40 group-hover:text-space-bg group-hover:bg-white transition-all">
                    EXPLORE <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
