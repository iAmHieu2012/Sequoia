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
      <>
        <button onClick={() => setSelectedTopic(null)} className="text-[10px] font-mono text-text-dim hover:text-white p-4 flex items-center gap-2 border-b border-panel-border w-full text-left bg-black/40 uppercase tracking-widest"><ArrowRight className="w-3 h-3 rotate-180" /> RETURN TO NEBULAS</button>
        {drilldownLoading ? <div className="p-4 text-turquoise animate-pulse text-xs">LOADING ARTICLES...</div> :
          articles.map((article) => (
            <div key={article.id} 
                 className="group cursor-pointer border-b border-panel-border px-5 py-4 hover:bg-turquoise/5 transition-all duration-300 relative overflow-hidden"
                 onMouseEnter={() => setMapTarget((prev) => {
                   const node = mapData?.nodes?.find(n => n.article_id === article.id);
                   return { ...prev, x: node ? node.x : prev.x, y: node ? node.y : prev.y, scale: 0.6, activeNodeId: article.id };
                 })}
                 onMouseLeave={() => setMapTarget((prev) => ({ ...prev, activeNodeId: undefined }))}
            >
              <div className="absolute left-0 top-0 w-1 h-full bg-turquoise scale-y-0 group-hover:scale-y-100 origin-center transition-transform duration-300 ease-out shadow-[0_0_10px_var(--color-turquoise)]" />
              <div className="relative z-10">
                <h3 className="text-sm font-heading font-bold text-white group-hover:text-turquoise transition-all duration-300 tracking-wide mb-1 uppercase">{article.title.replace(/ /g, "_")}</h3>
                <p className="text-text-dim text-xs font-mono leading-relaxed normal-case line-clamp-2 mb-4">&gt; {article.summary}</p>
                <div className="flex items-center justify-between border-t border-panel-border pt-3">
                  <div className="flex gap-4 text-xs font-mono">
                    <span className="text-text-dim">STATUS: <span className={`font-bold ${user && getNodeStatus(article.id) ? 'text-white' : 'text-text-dim'}`}>{user && getNodeStatus(article.id) ? 'DECODED' : 'UNEXPLORED'}</span></span>
                  </div>
                  <Link href={`/articles/${article.id}`} onClick={e => e.stopPropagation()} className="text-[10px] font-mono font-bold text-turquoise tracking-wider flex items-center gap-1 group-hover:translate-x-1 transition-transform duration-300">
                    INTERCEPT <Rocket className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            </div>
          ))
        }
      </>
    );
  }

  if (loading) return <div className="p-4 text-turquoise animate-pulse text-xs">SCANNING NEBULAS...</div>;

  return (
    <>
      {topics.map((topic) => (
        <div
          key={topic.id}
          className="group cursor-pointer border-b border-panel-border px-5 py-4 hover:bg-turquoise/5 transition-all duration-300 relative overflow-hidden"
          onMouseEnter={() => setMapTarget((prev) => ({ ...prev, x: 7500, y: 2500, scale: 0.2, mapId: topic.id, activeNodeId: undefined }))}
        >
          <div className="absolute left-0 top-0 w-1 h-full bg-turquoise scale-y-0 group-hover:scale-y-100 origin-center transition-transform duration-300 ease-out shadow-[0_0_10px_var(--color-turquoise)]" />
          <div className="absolute inset-0 -translate-x-[150%] group-hover:translate-x-[150%] bg-gradient-to-r from-transparent via-turquoise/10 to-transparent transition-transform duration-700 ease-out pointer-events-none" />
          
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] font-mono text-turquoise tracking-widest">[ NEBULA ]</span>
              <span className="text-[10px] font-mono text-text-dim">{topic.article_count} ARTICLES</span>
            </div>
            <h3 className="text-sm font-heading font-bold text-white group-hover:text-turquoise group-hover:drop-shadow-[0_0_8px_var(--color-turquoise)] transition-all duration-300 tracking-wide mb-1 uppercase">
              {topic.name}
            </h3>
            <p className="text-text-dim text-xs font-mono leading-relaxed normal-case line-clamp-2 mb-4">
              &gt; {topic.description}
            </p>
            <div className="flex items-center justify-between border-t border-panel-border pt-3">
              <div className="flex gap-4 text-xs font-mono">
                <span className="text-text-dim">NODES: <span className="text-white font-bold">{topic.article_count}</span></span>
                <span className="text-text-dim">STATUS: <span className={`font-bold ${(progressSummary?.topics[topic.id]?.completed ?? 0) === (progressSummary?.topics[topic.id]?.total ?? -1) && (progressSummary?.topics[topic.id]?.total ?? 0) > 0 ? 'text-white' : 'text-text-dim'}`}>{(progressSummary?.topics[topic.id]?.completed ?? 0) === (progressSummary?.topics[topic.id]?.total ?? -1) && (progressSummary?.topics[topic.id]?.total ?? 0) > 0 ? 'EXPLORED' : 'UNEXPLORED'}</span></span>
              </div>
              <button onClick={(e) => { e.stopPropagation(); fetchTopicArticles(topic); }} className="text-[10px] font-mono font-bold text-turquoise tracking-wider flex items-center gap-1 group-hover:translate-x-1 transition-transform duration-300">
                EXPLORE <Rocket className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>
      ))}
    </>
  );
}
