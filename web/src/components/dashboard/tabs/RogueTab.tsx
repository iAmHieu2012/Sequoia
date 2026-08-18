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
  if (loading) return <div className="p-4 text-purple animate-pulse text-xs">DETECTING ANOMALIES...</div>;

  return (
    <>
      {rogueArticles.map((article) => (
        <div
          key={article.id}
          className="group cursor-pointer border-b border-panel-border px-5 py-4 hover:bg-purple/5 transition-all duration-300 relative overflow-hidden"
          onMouseEnter={() => setMapTarget((prev) => {
            const node = mapData?.nodes?.find(n => n.article_id === article.id);
            return { ...prev, x: node ? node.x : prev.x, y: node ? node.y : prev.y, scale: 0.6, mapId: "standalone-articles", activeNodeId: article.id };
          })}
          onMouseLeave={() => setMapTarget((prev) => ({ ...prev, activeNodeId: undefined }))}
        >
          <div className="absolute left-0 top-0 w-1 h-full bg-purple scale-y-0 group-hover:scale-y-100 origin-center transition-transform duration-300 ease-out shadow-[0_0_10px_var(--color-purple)]" />
          <div className="absolute inset-0 -translate-x-[150%] group-hover:translate-x-[150%] bg-gradient-to-r from-transparent via-purple/10 to-transparent transition-transform duration-700 ease-out pointer-events-none" />
          
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] font-mono text-purple tracking-widest">[ ROGUE_ANOMALY ]</span>
            </div>
            <h3 className="text-sm font-heading font-bold text-white group-hover:text-purple group-hover:drop-shadow-[0_0_8px_var(--color-purple)] transition-all duration-300 tracking-wide mb-1 uppercase">
              {article.title.replace(/ /g, "_")}
            </h3>
            <p className="text-text-dim text-xs font-mono leading-relaxed normal-case line-clamp-2 mb-4">
              &gt; {article.summary}
            </p>
            <div className="flex items-center justify-between border-t border-panel-border pt-3">
              <div className="flex gap-4 text-xs font-mono">
                <span className="text-text-dim">STATUS: <span className={`font-bold ${progressSummary?.standalone?.[article.id] ? 'text-white' : 'text-text-dim'}`}>{progressSummary?.standalone?.[article.id] ? 'DECODED' : 'DETECTED'}</span></span>
              </div>
              <Link href={`/articles/${article.id}`} onClick={e => e.stopPropagation()} className="text-[10px] font-mono font-bold text-purple tracking-wider flex items-center gap-1 group-hover:translate-x-1 transition-transform duration-300">
                INTERCEPT <Rocket className="w-3 h-3" />
              </Link>
            </div>
          </div>
        </div>
      ))}
    </>
  );
}
