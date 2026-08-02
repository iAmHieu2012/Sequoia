"use client";

import Link from "next/link";
import { Rocket, ArrowRight, User as UserIcon, LogOut, Cpu } from "lucide-react";
import CyberBrackets from "@/components/ui/CyberBrackets";
import { User } from "firebase/auth";

type TabId = "nebulas" | "rogue" | "modules";

export interface TabTarget {
  x: number;
  y: number;
  scale: number;
  mapId: string | undefined;
  activeNodeId?: string;
}

interface ContentBrowserProps {
  activeTab: TabId;
  setActiveTab: (tab: TabId) => void;
  topics: any[];
  rogueArticles: any[];
  textbooks: any[];
  articles: any[];
  loading: boolean;
  drilldownLoading: boolean;
  selectedTopic: any | null;
  setSelectedTopic: (topic: any | null) => void;
  fetchTopicArticles: (topic: any) => void;
  setMapTarget: React.Dispatch<React.SetStateAction<TabTarget>>;
  user: User | null;
  getNodeStatus: (id: string) => boolean;
  progressSummary: any;
  handleLogout: () => void;
}

export default function ContentBrowser({
  activeTab, setActiveTab, topics, rogueArticles, textbooks, articles,
  loading, drilldownLoading, selectedTopic, setSelectedTopic,
  fetchTopicArticles, setMapTarget, user, getNodeStatus,
  progressSummary, handleLogout
}: ContentBrowserProps) {
  return (
    <div className="flex-shrink-0 w-full lg:w-[320px] flex flex-col min-h-0 bg-black/40 border border-panel-border relative">
      <CyberBrackets color="border-white/10" />

      {/* Tab bar */}
      <div className="flex flex-shrink-0 border-b border-panel-border">
        {[
          { id: "nebulas", label: "NEBULAS", sub: "Topics", accent: "turquoise", defaultTarget: { x: 7500, y: 2500, scale: 0.2, mapId: topics.length > 0 ? topics[0].id : undefined } },
          { id: "rogue", label: "ROGUE", sub: "Papers", accent: "purple", defaultTarget: { x: 8250, y: 3500, scale: 0.2, mapId: "standalone_articles" } },
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
      <div className="flex-1 overflow-y-auto min-h-0 [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-thumb]:bg-white/20 uppercase tracking-wider">

        {/* NEBULAS tab */}
        {activeTab === "nebulas" && (
          selectedTopic ? (
            <>
              <button onClick={() => setSelectedTopic(null)} className="text-[10px] font-mono text-text-dim hover:text-white p-4 flex items-center gap-2 border-b border-panel-border w-full text-left bg-black/40 uppercase tracking-widest"><ArrowRight className="w-3 h-3 rotate-180" /> RETURN TO NEBULAS</button>
              {drilldownLoading ? <div className="p-4 text-turquoise animate-pulse text-xs">LOADING ARTICLES...</div> :
                articles.map((article) => (
                  <div key={article.id} 
                       className="group cursor-pointer border-b border-panel-border px-5 py-4 hover:bg-turquoise/5 transition-all duration-300 relative overflow-hidden"
                       onMouseEnter={() => setMapTarget(prev => ({ ...prev, scale: 0.6, activeNodeId: article.id }))}
                       onMouseLeave={() => setMapTarget(prev => ({ ...prev, activeNodeId: undefined }))}
                  >
                    <div className="absolute left-0 top-0 w-1 h-full bg-turquoise scale-y-0 group-hover:scale-y-100 origin-center transition-transform duration-300 ease-out shadow-[0_0_10px_var(--color-turquoise)]" />
                    <div className="relative z-10">
                      <h3 className="text-sm font-heading font-bold text-white group-hover:text-turquoise transition-all duration-300 tracking-wide mb-1 uppercase">{article.title.replace(/ /g, "_")}</h3>
                      <p className="text-text-dim text-xs font-mono leading-relaxed normal-case line-clamp-2 mb-4">&gt; {article.summary}</p>
                      <div className="flex items-center justify-between border-t border-panel-border pt-3">
                        <div className="flex gap-4 text-xs font-mono">
                          <span className="text-text-dim">STATUS: <span className={`font-bold ${user && getNodeStatus(article.id) ? 'text-white' : 'text-text-dim'}`}>{user && getNodeStatus(article.id) ? 'DECODED' : 'UNEXPLORED'}</span></span>
                        </div>
                        <Link href={`/articles/${article.slug}`} onClick={e => e.stopPropagation()} className="text-[10px] font-mono font-bold text-turquoise tracking-wider flex items-center gap-1 group-hover:translate-x-1 transition-transform duration-300">
                          INTERCEPT <Rocket className="w-3 h-3" />
                        </Link>
                      </div>
                    </div>
                  </div>
                ))
              }
            </>
          ) : (
          loading ? <div className="p-4 text-turquoise animate-pulse text-xs">SCANNING NEBULAS...</div> :
          topics.map((topic) => (
            <div
              key={topic.id}
              className="group cursor-pointer border-b border-panel-border px-5 py-4 hover:bg-turquoise/5 transition-all duration-300 relative overflow-hidden"
              onMouseEnter={() => setMapTarget(prev => ({ ...prev, x: 7500, y: 2500, scale: 0.2, mapId: topic.id, activeNodeId: undefined }))}
            >
              <div className="absolute left-0 top-0 w-1 h-full bg-turquoise scale-y-0 group-hover:scale-y-100 origin-center transition-transform duration-300 ease-out shadow-[0_0_10px_var(--color-turquoise)]" />
              <div className="absolute inset-0 -translate-x-[150%] group-hover:translate-x-[150%] bg-gradient-to-r from-transparent via-turquoise/10 to-transparent transition-transform duration-700 ease-out pointer-events-none" />
              
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-mono text-turquoise tracking-widest">[ NEBULA ]</span>
                  <span className="text-[10px] font-mono text-text-dim">{topic.articleCount} ARTICLES</span>
                </div>
                <h3 className="text-sm font-heading font-bold text-white group-hover:text-turquoise group-hover:drop-shadow-[0_0_8px_var(--color-turquoise)] transition-all duration-300 tracking-wide mb-1 uppercase">
                  {topic.name}
                </h3>
                <p className="text-text-dim text-xs font-mono leading-relaxed normal-case line-clamp-2 mb-4">
                  &gt; {topic.description}
                </p>
                <div className="flex items-center justify-between border-t border-panel-border pt-3">
                  <div className="flex gap-4 text-xs font-mono">
                    <span className="text-text-dim">NODES: <span className="text-white font-bold">{topic.articleCount}</span></span>
                    <span className="text-text-dim">STATUS: <span className={`font-bold ${(progressSummary?.topics[topic.id]?.completed ?? 0) === (progressSummary?.topics[topic.id]?.total ?? -1) && (progressSummary?.topics[topic.id]?.total ?? 0) > 0 ? 'text-white' : 'text-text-dim'}`}>{(progressSummary?.topics[topic.id]?.completed ?? 0) === (progressSummary?.topics[topic.id]?.total ?? -1) && (progressSummary?.topics[topic.id]?.total ?? 0) > 0 ? 'EXPLORED' : 'UNEXPLORED'}</span></span>
                  </div>
                  <button onClick={(e) => { e.stopPropagation(); fetchTopicArticles(topic); }} className="text-[10px] font-mono font-bold text-turquoise tracking-wider flex items-center gap-1 group-hover:translate-x-1 transition-transform duration-300">
                    EXPLORE <Rocket className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>
          ))
        ))}

        {/* ROGUE tab */}
        {activeTab === "rogue" && (
          loading ? <div className="p-4 text-purple animate-pulse text-xs">DETECTING ANOMALIES...</div> :
          rogueArticles.map((article) => (
            <div
              key={article.id}
              className="group cursor-pointer border-b border-panel-border px-5 py-4 hover:bg-purple/5 transition-all duration-300 relative overflow-hidden"
              onMouseEnter={() => setMapTarget(prev => ({ ...prev, scale: 0.6, mapId: "standalone_articles", activeNodeId: article.id }))}
              onMouseLeave={() => setMapTarget(prev => ({ ...prev, activeNodeId: undefined }))}
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
                  <Link href={`/articles/${article.slug}`} onClick={e => e.stopPropagation()} className="text-[10px] font-mono font-bold text-purple tracking-wider flex items-center gap-1 group-hover:translate-x-1 transition-transform duration-300">
                    INTERCEPT <Rocket className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            </div>
          ))
        )}

        {/* MODULES tab */}
        {activeTab === "modules" && (
          <>
            {textbooks.length === 0 ? (
              <div className="p-8 text-center text-text-dim font-mono text-xs">NO MODULES ACTIVE.</div>
            ) : (
              textbooks.map(book => (
                <div key={book.id} className="group cursor-pointer border-b border-panel-border px-5 py-4 hover:bg-orange/5 transition-all duration-300 relative overflow-hidden">
                  <div className="absolute left-0 top-0 w-1 h-full bg-orange scale-y-0 group-hover:scale-y-100 origin-center transition-transform duration-300 ease-out shadow-[0_0_10px_var(--color-orange)]" />
                  <div className="absolute inset-0 -translate-x-[150%] group-hover:translate-x-[150%] bg-gradient-to-r from-transparent via-orange/10 to-transparent transition-transform duration-700 ease-out pointer-events-none" />
                  
                  <div className="relative z-10">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-heading text-sm font-bold text-white group-hover:text-orange group-hover:drop-shadow-[0_0_8px_var(--color-orange)] transition-all duration-300 tracking-wide uppercase">{book.title}</h3>
                    </div>
                    <p className="text-text-dim text-xs font-mono leading-relaxed normal-case line-clamp-2 mb-4">
                      &gt; {book.description}
                    </p>
                    <div className="flex justify-between items-center border-t border-panel-border pt-3">
                      <span className="text-[10px] text-text-dim font-mono">{book.authors?.join(", ") || "UNKNOWN"}</span>
                      <Link href={`/textbooks/${book.id}`} className="text-[10px] font-mono font-bold text-orange tracking-wider flex items-center gap-1 group-hover:translate-x-1 transition-transform duration-300">
                        ENTER <ArrowRight className="w-3 h-3" />
                      </Link>
                    </div>
                  </div>
                </div>
              ))
            )}
          </>
        )}

        </div>

      {/* User Profile Bar at bottom of Left Column */}
      <div className="flex-shrink-0 border-t border-panel-border p-4 bg-black/80 flex items-center justify-between">
        <div className="flex flex-col">
          <span className="text-[9px] font-mono text-text-dim tracking-widest mb-1 uppercase">ID_ENTITY</span>
          <span className="text-xs font-heading text-white flex items-center gap-2 font-bold tracking-widest">
            <UserIcon className="w-3.5 h-3.5 text-system" />
            {user ? user.displayName?.toUpperCase() || 'USER_NODE' : 'GUEST_ACCESS'}
          </span>
        </div>
        
        {user ? (
          <button 
            onClick={handleLogout}
            className="px-3 py-1.5 border border-coral/30 hover:border-coral bg-coral/5 hover:bg-coral/20 text-coral text-[10px] font-mono tracking-widest uppercase transition-colors flex items-center gap-2"
          >
            <LogOut className="w-3 h-3" />
            TERMINATE
          </button>
        ) : (
          <Link href="/auth">
            <button className="px-3 py-1.5 border border-system/30 hover:border-system bg-system/5 hover:bg-system/20 text-system text-[10px] font-mono tracking-widest uppercase transition-colors flex items-center gap-2">
              <Cpu className="w-3 h-3" />
              ESTABLISH
            </button>
          </Link>
        )}
      </div>
    </div>
  );
}
