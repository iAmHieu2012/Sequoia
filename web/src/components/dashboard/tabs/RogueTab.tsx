import Link from "next/link";
import { Rocket } from "lucide-react";
import { Article, ProgressSummary } from "@/types/dashboard";
import React from "react";
import { TabTarget } from "../ContentBrowser";
import { CosmosMap } from "@/hooks/cosmos/useCosmosData";

interface RogueTabProps {
  /** List of standalone articles (Rogue Papers) */
  rogueArticles: Article[];
  /** Loading state for the main dashboard data */
  loading: boolean;
  /** State setter to pan/zoom the Cosmos map to specific coordinates */
  setMapTarget: React.Dispatch<React.SetStateAction<TabTarget>>;
  /** Global progress statistics */
  progressSummary: ProgressSummary | null;
  /** Cached map spatial data for calculating hover target coordinates */
  mapData: CosmosMap | null;
}

/**
 * Renders the "Rogue" tab within the ContentBrowser.
 * Displays a list of standalone anomalies (Articles without a specific topic)
 * and triggers Cosmos map panning on hover.
 */
export default function RogueTab({
  rogueArticles, loading, setMapTarget, progressSummary, mapData
}: RogueTabProps) {
  if (loading) return <div className="p-5 text-white/40 font-mono animate-pulse text-xs tracking-widest">DETECTING ANOMALIES...</div>;

  return (
    <div className="animate-snap-in">
      {rogueArticles.map((article) => {
        const isDecoded = progressSummary?.standalone?.[article.id];
        return (
          <div
            key={article.id}
            className="group cursor-pointer border-b border-white/10 bg-space-bg hover:bg-white/10 transition-colors relative overflow-hidden flex flex-col"
            onClick={() => setMapTarget((prev) => {
              const node = mapData?.nodes?.find(n => n.article_id === article.id);
              return { ...prev, x: node ? node.x : prev.x, y: node ? node.y : prev.y, scale: 0.6, mapId: "standalone-articles", activeNodeId: article.id };
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
                      {isDecoded ? 'DECODED' : 'DETECTED'}
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
      })}
    </div>
  );
}
