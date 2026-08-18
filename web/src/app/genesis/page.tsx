"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { Plus, Edit2, Trash2, Cpu, ChevronLeft, ArrowRight, Terminal, Activity, Zap } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import CyberBrackets from "@/components/ui/CyberBrackets";
import CosmosMapEditor from "@/components/admin/CosmosMapEditor";
import EntityForge from "@/components/admin/EntityForge";
import MarkdownRenderer from "@/components/ui/MarkdownRenderer";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";

export type AdminTab = "nebulas" | "anomalies" | "models" | "textbooks";
import { Topic, Article, Textbook, AiModel } from "@/types/dashboard";

export default function GenesisPage() {
  interface MapNode { article_id: string; x: number; y: number; [key: string]: unknown; }
  const router = useRouter();
  const { user, isAdmin, loading: authLoading } = useAuth();
  const hasFetched = useRef(false);

  const authFetch = useCallback(async (url: string, options: RequestInit = {}) => {
    if (!user) throw new Error("Unauthenticated");
    return fetch(url, options);
  }, [user]);
  const [activeTab, setActiveTab] = useState<AdminTab>("nebulas");
  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [rogueArticles, setRogueArticles] = useState<Article[]>([]);
  const [models, setModels] = useState<AiModel[]>([]);
  const [textbooks, setTextbooks] = useState<Textbook[]>([]);
  const [articles, setArticles] = useState<Article[]>([]); // Articles inside selected topic
  const [mapNodes, setMapNodes] = useState<MapNode[]>([]); // Nodes for the current active map

  const [loading, setLoading] = useState(true);
  const [drilldownLoading, setDrilldownLoading] = useState(false);

  const [hoverTarget, setHoverTarget] = useState<{ x: number, y: number, scale: number, mapId?: string, activeNodeId?: string }>({
    x: 7500, y: 2500, scale: 0.2
  });

  const [isForgeOpen, setIsForgeOpen] = useState(false);
  const [forgeInitialData, setForgeInitialData] = useState<Record<string, unknown> | null>(null);
  const [forgeTab, setForgeTab] = useState<"nebulas" | "stars" | "anomalies" | "models" | "textbooks">("nebulas");
  const [refreshKey, setRefreshKey] = useState(0);



  const [rightPanelMode, setRightPanelMode] = useState<'map' | 'preview'>('map');
  const [selectedArticleContent, setSelectedArticleContent] = useState<string>('');
  const [selectedArticleId, setSelectedArticleId] = useState<string | undefined>(undefined);
  const [selectedTextbook, setSelectedTextbook] = useState<Textbook | null>(null);
  const [selectedModel, setSelectedModel] = useState<AiModel | null>(null);

  const fetchData = useCallback(async (showLoading = true) => {
    if (showLoading) setLoading(true);
    try {
      const [tRes, rRes, mRes, txRes, mapRes] = await Promise.all([
        authFetch("/api/v1/topics").catch(() => null),
        authFetch("/api/v1/admin/articles/standalone").catch(() => null),
        authFetch("/api/v1/models").catch(() => null),
        authFetch("/api/v1/textbooks").catch(() => null),
        authFetch("/api/v1/cosmos/maps/standalone-articles").catch(() => null)
      ]);
      if (tRes && tRes.ok) {
        const data = (await tRes.json()).data || [];
        setTopics(data);
        if (data.length > 0) {
          setHoverTarget(prev => {
            if (prev.mapId === undefined && activeTab === 'nebulas') {
              return { ...prev, mapId: data[0].id };
            }
            return prev;
          });
        }
      }
      if (rRes && rRes.ok) setRogueArticles((await rRes.json()).data || []);
      if (mRes && mRes.ok) setModels((await mRes.json()).data || []);
      if (txRes && txRes.ok) setTextbooks((await txRes.json()).data || []);
      if (mapRes && mapRes.ok) setMapNodes((await mapRes.json()).data?.nodes || []);
      else setMapNodes([]);
    } catch (error) {
      console.error(error);
      setMapNodes([]);
    } finally {
      setLoading(false);
    }
  }, [activeTab, authFetch]);

  const fetchTopicArticles = async (topic: Topic) => {
    setSelectedTopic(topic);
    setDrilldownLoading(true);
    try {
      const [artRes, mapRes] = await Promise.all([
        authFetch(`/api/v1/admin/topics/${topic.id}/articles`),
        authFetch(`/api/v1/cosmos/maps/${topic.id}`).catch(() => null)
      ]);
      if (artRes.ok) setArticles((await artRes.json()).data || []);
      if (mapRes && mapRes.ok) setMapNodes((await mapRes.json()).data?.nodes || []);
      else setMapNodes([]);
    } catch (error) {
      console.error(error);
      setMapNodes([]);
    } finally {
      setDrilldownLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading) {
      if (!user || !isAdmin) {
        router.push("/dashboard");
      } else if (!hasFetched.current) {
        hasFetched.current = true;
        fetchData(false);
      }
    }
  }, [user, isAdmin, authLoading, router, fetchData]);

  const handleArticleSelect = async (article: Article, targetX: number, targetY: number, mapId: string) => {
    setSelectedArticleId(article.id);
    setHoverTarget({ x: targetX, y: targetY, scale: 1.5, mapId, activeNodeId: article.id });
    setSelectedArticleContent('LOADING_DATA_STREAM...');
    try {
      const res = await authFetch(`/api/v1/admin/articles/${article.id}`);
      if (res.ok) {
        const data = await res.json();
        setSelectedArticleContent(data.data.content || '');
      } else {
        setSelectedArticleContent('ERROR: FAILED_TO_FETCH_CONTENT');
      }
    } catch (error) {
      console.error("Failed to fetch article content:", error);
      setSelectedArticleContent('ERROR: CONNECTION_LOST');
    }
  };

  const handleEdit = async (tab: AdminTab | "stars", item: { id: string } & Partial<Topic & Article & AiModel & Textbook>, e: React.MouseEvent) => {
    e.stopPropagation();
    
    let fullItem: { id: string } & Partial<Topic & Article & AiModel & Textbook> & { x?: number; y?: number; connections?: unknown } = { ...item };
    
    if (tab === 'stars' || tab === 'anomalies') {
      try {
        const articleId = item.id;
        const res = await authFetch(`/api/v1/admin/articles/${articleId}`);
        if (res.ok) {
          const detail = (await res.json()).data;
          fullItem = { ...fullItem, ...detail };
        }
        
        // Also find node coordinates
        const node = mapNodes.find((n: MapNode) => n.article_id === articleId);
        if (node) {
          fullItem.x = node.x;
          fullItem.y = node.y;
          fullItem.connections = node.connections;
        }
      } catch (error) {
        console.error("Failed to fetch article details", error);
      }
    }
    
    setForgeTab(tab);
    setForgeInitialData(fullItem);
    setIsForgeOpen(true);
  };

  const handleCreate = (tab: AdminTab | "stars") => {
    setForgeTab(tab);
    setForgeInitialData(tab === 'stars' && selectedTopic ? { topic_id: selectedTopic.id } : null);
    setIsForgeOpen(true);
  };

  const handleSave = async (payload: Record<string, unknown>) => {
    try {
      let endpoint = '';
      if (forgeTab === 'stars' || forgeTab === 'anomalies') endpoint = '/api/v1/admin/articles';
      else if (forgeTab === 'nebulas') endpoint = '/api/v1/admin/topics';
      else if (forgeTab === 'models') endpoint = '/api/v1/admin/models';
      else if (forgeTab === 'textbooks') endpoint = '/api/v1/admin/textbooks';

      if (!endpoint) return;
      const res = await authFetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        setIsForgeOpen(false);
        fetchData();
        setRefreshKey(prev => prev + 1);
        if (selectedTopic && forgeTab === 'stars') fetchTopicArticles(selectedTopic);
      }
    } catch (error) {
      console.error("Save error:", error);
    }
  };

  const handleDelete = async (tab: AdminTab | "stars", item: { id: string } & Partial<Topic & Article & AiModel & Textbook>, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm(`Are you sure you want to delete this ${tab}? This action cannot be undone.`)) return;

    try {
      let endpoint = '';
      if (tab === 'stars' || tab === 'anomalies') endpoint = `/api/v1/admin/articles/${item.id}`;
      else if (tab === 'nebulas') endpoint = `/api/v1/admin/topics/${item.id}`;
      else if (tab === 'models') endpoint = `/api/v1/admin/models/${item.id}`;
      else if (tab === 'textbooks') endpoint = `/api/v1/admin/textbooks/${item.id}`;

      if (!endpoint) return;
      const res = await authFetch(endpoint, { method: 'DELETE' });
      if (res.ok) {
        fetchData();
        setRefreshKey(prev => prev + 1);
        if (selectedTopic && (tab === 'stars' || tab === 'anomalies')) fetchTopicArticles(selectedTopic);
      }
    } catch (error) {
      console.error("Delete error:", error);
    }
  };

  const TABS = [
    { id: "nebulas", label: "NEBULAS", sub: "Topics" },
    { id: "anomalies", label: "ROGUE", sub: "Standalone" },
    { id: "models", label: "LABS", sub: "Models" },
    { id: "textbooks", label: "MODULES", sub: "Textbooks" },
  ];

  return (
    <div className="h-screen w-screen bg-black text-white font-mono overflow-hidden flex flex-col relative selection:bg-white selection:text-black uppercase tracking-wider">
      
      {/* Background FX */}
      <div className="absolute inset-0 pointer-events-none z-50 opacity-[0.03] bg-[linear-gradient(to_bottom,transparent_50%,#fff_50%)] bg-[length:100%_4px]" />
      <div className="absolute inset-0 pointer-events-none z-0 shadow-[inset_0_0_200px_rgba(255,255,255,0.05)]" />
      <div 
        className="absolute inset-0 pointer-events-none z-0 opacity-10"
        style={{ backgroundImage: "radial-gradient(circle at center, white 1px, transparent 1px)", backgroundSize: "24px 24px" }}
      />

      {/* Universal Header (Monochrome) */}
      <header className="flex-shrink-0 relative z-50 flex items-center justify-between px-6 py-4 border-b border-white/20 bg-black/80 backdrop-blur-md">
        <div className="flex items-center gap-6">
          <Link href="/dashboard" className="inline-flex items-center text-[10px] font-mono tracking-widest uppercase bg-white/5 text-white px-4 py-2 hover:bg-white/20 hover:text-white transition-all duration-300 relative group overflow-hidden">
            <CyberBrackets color="border-white/30 group-hover:border-white transition-colors duration-300" />
            <div className="absolute left-0 top-0 w-1 h-full bg-white scale-y-0 group-hover:scale-y-100 origin-center transition-transform duration-300 ease-out shadow-[0_0_10px_rgba(255,255,255,0.8)]" />
            <div className="absolute inset-0 -translate-x-[150%] group-hover:translate-x-[150%] bg-gradient-to-r from-transparent via-white/10 to-transparent transition-transform duration-700 ease-out pointer-events-none" />
            <span className="relative z-10 flex items-center gap-1 group-hover:drop-shadow-[0_0_8px_rgba(255,255,255,0.8)]">
              <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform duration-300" />
              [ ESC ] EXIT_GENESIS
            </span>
          </Link>

          <div className="flex-col hidden sm:flex">
            <span className="text-[9px] font-mono text-white/50 tracking-widest uppercase">ADMIN_MODULE</span>
            <span className="text-sm font-heading font-bold text-white tracking-widest uppercase flex items-center gap-2">
              <Terminal className="w-4 h-4 text-white" />
              GENESIS_CORE
            </span>
          </div>
        </div>
        
        <div className="flex items-center gap-6">
          <div className="flex flex-col items-end hidden md:flex">
            <span className="text-[9px] font-mono text-white/50 tracking-widest uppercase">SYS_STATUS</span>
            <span className="text-xs font-mono text-white tracking-widest uppercase flex items-center gap-2">
              CORE_ONLINE
              <span className="w-2 h-2 bg-white shadow-[0_0_8px_rgba(255,255,255,0.8)] animate-pulse" />
            </span>
          </div>
        </div>
      </header>

      {/* Main layout (Dashboard style) */}
      <div className="flex-1 flex min-h-0 relative z-10 p-4 gap-4">
        
        {/* Left Panel: Content Browser Clone */}
        <div className="flex-shrink-0 w-full lg:w-[380px] flex flex-col min-h-0 bg-black/40 border border-white/20 relative">
          <CyberBrackets color="border-white/40" />

          {/* Tab bar */}
          <div className="flex flex-shrink-0 border-b border-white/20">
            {TABS.map(tab => (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id as AdminTab);
                  if (tab.id === 'nebulas') {
                    setHoverTarget({ x: 7500, y: 2500, scale: 0.2, mapId: topics.length > 0 ? topics[0].id : undefined, activeNodeId: undefined });
                  } else if (tab.id === 'anomalies') {
                    setHoverTarget({ x: 7500, y: 2500, scale: 0.2, mapId: 'standalone-articles', activeNodeId: undefined });
                    authFetch("/api/v1/cosmos/maps/standalone-articles")
                      .then(r => r.json())
                      .then(d => setMapNodes(d.data?.nodes || []))
                      .catch(() => setMapNodes([]));
                  } else {
                    setHoverTarget({ x: 7500, y: 2500, scale: 0.2, mapId: undefined, activeNodeId: undefined });
                  }
                  setSelectedTopic(null);
                  setSelectedArticleId(undefined);
                  setSelectedArticleContent('');
                  setSelectedTextbook(null);
                  setSelectedModel(null);
                }}
                className={`flex-1 py-3 px-1 text-center font-heading text-[10px] font-bold tracking-[0.1em] uppercase transition-all cursor-pointer border-b-2 ${
                  activeTab === tab.id
                    ? "text-white border-white bg-white/10 drop-shadow-[0_0_8px_rgba(255,255,255,0.5)]"
                    : "text-white/40 border-transparent hover:text-white hover:bg-white/5"
                }`}
              >
                {tab.label}
                <span className="block text-[8px] font-mono font-normal mt-0.5 opacity-50 normal-case tracking-wider">
                  {tab.sub}
                </span>
              </button>
            ))}
          </div>

          {/* Spawn Button */}
          <div className="p-3 border-b border-white/20 bg-black/60 sticky top-0 z-20">
            <button 
              onClick={() => handleCreate(activeTab === 'nebulas' && selectedTopic ? 'stars' : activeTab)}
              className="w-full group relative py-2.5 border border-white/50 hover:border-white transition-colors bg-white/5 flex items-center justify-center gap-2 text-xs tracking-widest overflow-hidden"
            >
              <div className="absolute inset-0 bg-white translate-y-[100%] group-hover:translate-y-0 transition-transform duration-300 ease-out" />
              <span className="relative z-10 group-hover:text-black font-bold flex items-center gap-2">
                <Plus className="w-4 h-4" /> INITIATE_SPAWN
              </span>
            </button>
          </div>

          {/* Tab content */}
          <div className="flex-1 overflow-y-auto min-h-0 [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-thumb]:bg-white/20 uppercase tracking-wider relative">
            
            {loading && <div className="p-6 text-center text-white/50 text-xs font-mono animate-pulse">FETCHING_DATABANKS...</div>}
            
            {!loading && activeTab === "nebulas" && (
              selectedTopic ? (
                // STARS (Inside a Nebula)
                <>
                  <button onClick={() => { setSelectedTopic(null); setSelectedArticleId(undefined); setSelectedArticleContent(''); }} className="text-[10px] font-mono text-white/50 hover:text-white p-4 flex items-center gap-2 border-b border-white/20 w-full text-left bg-black/40 transition-colors">
                    <ArrowRight className="w-3 h-3 rotate-180" /> RETURN_TO_NEBULAS
                  </button>
                  {drilldownLoading ? <div className="p-4 text-white/50 animate-pulse text-xs font-mono">LOADING_STARS...</div> :
                    articles.map((article) => {
                      const node = mapNodes.find(n => n.article_id === article.id);
                      const targetX = node ? node.x : 7500;
                      const targetY = node ? node.y : 2500;
                      
                      return (
                      <div key={article.id} 
                           className={`group cursor-pointer border-b border-white/10 px-5 py-4 hover:bg-white/5 transition-all duration-300 relative overflow-hidden flex flex-col ${selectedArticleId === article.id ? 'bg-white/10' : ''}`}
                           onMouseEnter={() => setHoverTarget({ x: targetX, y: targetY, scale: 0.8, mapId: selectedTopic.id, activeNodeId: article.id })}
                           onMouseLeave={() => setHoverTarget(prev => ({ ...prev, activeNodeId: undefined }))}
                           onClick={() => handleArticleSelect(article, targetX, targetY, selectedTopic.id)}
                      >
                        <div className="absolute left-0 top-0 w-1 h-full bg-white scale-y-0 group-hover:scale-y-100 origin-center transition-transform duration-300 ease-out shadow-[0_0_10px_rgba(255,255,255,0.8)]" />
                        <div className="absolute inset-0 -translate-x-[150%] group-hover:translate-x-[150%] bg-gradient-to-r from-transparent via-white/10 to-transparent transition-transform duration-700 ease-out pointer-events-none" />
                        
                        <div className="relative z-10 flex justify-between items-start">
                          <div className="flex-1 pr-4">
                            <div className="flex justify-between items-center mb-1">
                              <span className="text-[9px] font-mono text-white/50">[ STAR_NODE ]</span>
                              <div className="flex gap-2">
                                {article.is_published === false && (
                                  <span className="text-[8px] font-mono bg-red-500/20 text-red-400 px-1 border border-red-500/30">DRAFT</span>
                                )}
                                {article.tags && article.tags.length > 0 && (
                                  <span className="text-[8px] font-mono bg-white/10 px-1 border border-white/20">{article.tags[0]}</span>
                                )}
                              </div>
                            </div>
                            <h3 className="text-sm font-heading font-bold text-white group-hover:drop-shadow-[0_0_5px_rgba(255,255,255,0.5)] transition-all duration-300 mb-1">{article.title}</h3>
                            <p className="text-[10px] text-white/40 line-clamp-2 leading-relaxed lowercase font-mono">
                              &gt; {article.summary || "no data summary found"}
                            </p>
                          </div>
                          
                          <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={(e) => { e.stopPropagation(); handleEdit('stars', article, e); }} className="p-2 text-white/50 hover:text-white hover:bg-white/10 transition-colors border border-transparent hover:border-white/30">
                              <Edit2 className="w-3 h-3" />
                            </button>
                            <button onClick={(e) => { e.stopPropagation(); handleDelete('stars', article, e); }} className="p-2 text-white/50 hover:text-white hover:bg-white/10 transition-colors border border-transparent hover:border-white/30">
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      </div>
                    )})
                  }
                </>
              ) : (
                // NEBULAS LIST
                topics.map((topic) => (
                  <div
                    key={topic.id}
                    id={`topic-${topic.id}`}
                    className="group cursor-pointer border-b border-white/10 px-5 py-4 hover:bg-white/5 transition-all duration-300 relative overflow-hidden"
                    onMouseEnter={() => setHoverTarget({ x: 7500, y: 2500, scale: 0.2, mapId: topic.id, activeNodeId: undefined })}
                  >
                    <div className="absolute left-0 top-0 w-1 h-full bg-white scale-y-0 group-hover:scale-y-100 origin-center transition-transform duration-300 ease-out shadow-[0_0_10px_rgba(255,255,255,0.8)]" />
                    <div className="absolute inset-0 -translate-x-[150%] group-hover:translate-x-[150%] bg-gradient-to-r from-transparent via-white/10 to-transparent transition-transform duration-700 ease-out pointer-events-none" />
                    
                    <div className="relative z-10">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[9px] font-mono text-white/50 tracking-widest">[ NEBULA ]</span>
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={(e) => { e.stopPropagation(); handleEdit('nebulas', topic, e); }} className="p-1 text-white/50 hover:text-white"><Edit2 className="w-3 h-3" /></button>
                          <button onClick={(e) => { e.stopPropagation(); handleDelete('nebulas', topic, e); }} className="p-1 text-white/50 hover:text-white"><Trash2 className="w-3 h-3" /></button>
                        </div>
                      </div>
                      <h3 className="text-sm font-heading font-bold text-white group-hover:drop-shadow-[0_0_8px_rgba(255,255,255,0.5)] transition-all duration-300 mb-1">
                        {topic.name}
                      </h3>
                      <p className="text-[10px] text-white/40 line-clamp-2 leading-relaxed lowercase font-mono">
                        &gt; {topic.description || "no data description found"}
                      </p>

                      <div className="flex items-center justify-between border-t border-white/10 pt-3 mt-3">
                        <span className="text-[10px] font-mono text-white/50">{topic.article_count} STARS</span>
                        <button onClick={(e) => { e.stopPropagation(); fetchTopicArticles(topic); }} className="text-[10px] font-mono font-bold text-white tracking-wider flex items-center gap-1 group-hover:translate-x-1 transition-transform duration-300 bg-white/10 px-2 py-1 border border-white/20 hover:bg-white hover:text-black">
                          INSPECT <ArrowRight className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )
            )}

            {!loading && activeTab === "anomalies" && rogueArticles.map(article => {
              const node = mapNodes.find(n => n.article_id === article.id);
              const targetX = node ? node.x : 7500;
              const targetY = node ? node.y : 2500;
              
              return (
              <div key={article.id} className={`group cursor-pointer border-b border-white/10 px-5 py-4 hover:bg-white/5 transition-all duration-300 relative overflow-hidden flex flex-col ${selectedArticleId === article.id ? 'bg-white/10' : ''}`}
                   onMouseEnter={() => setHoverTarget({ x: targetX, y: targetY, scale: 0.8, mapId: 'standalone-articles', activeNodeId: article.id })}
                   onMouseLeave={() => setHoverTarget(prev => prev ? { ...prev, activeNodeId: undefined } : prev)}
                   onClick={() => handleArticleSelect(article, targetX, targetY, 'standalone-articles')}
              >
                <div className="absolute left-0 top-0 w-1 h-full bg-white scale-y-0 group-hover:scale-y-100 origin-center transition-transform duration-300 ease-out shadow-[0_0_10px_rgba(255,255,255,0.8)]" />
                <div className="absolute inset-0 -translate-x-[150%] group-hover:translate-x-[150%] bg-gradient-to-r from-transparent via-white/10 to-transparent transition-transform duration-700 ease-out pointer-events-none" />
                <div className="relative z-10 flex justify-between items-start">
                  <div className="flex-1 pr-4">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-[9px] font-mono text-white/50">[ ROGUE_ANOMALY ]</span>
                      <div className="flex gap-2">
                        {article.is_published === false && (
                          <span className="text-[8px] font-mono bg-red-500/20 text-red-400 px-1 border border-red-500/30">DRAFT</span>
                        )}
                        {article.tags && article.tags.length > 0 && (
                          <span className="text-[8px] font-mono bg-white/10 px-1 border border-white/20">{article.tags[0]}</span>
                        )}
                      </div>
                    </div>
                    <h3 className="text-sm font-heading font-bold text-white group-hover:drop-shadow-[0_0_5px_rgba(255,255,255,0.5)] transition-all duration-300 mb-1">{article.title}</h3>
                    <p className="text-[10px] text-white/40 line-clamp-2 leading-relaxed lowercase font-mono">
                      &gt; {article.summary || "no data summary found"}
                    </p>
                  </div>
                  <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={(e) => { e.stopPropagation(); handleEdit('anomalies', article, e); }} className="p-2 text-white/50 hover:text-white"><Edit2 className="w-3 h-3" /></button>
                    <button onClick={(e) => { e.stopPropagation(); handleDelete('anomalies', article, e); }} className="p-2 text-white/50 hover:text-white"><Trash2 className="w-3 h-3" /></button>
                  </div>
                </div>
              </div>
            )})}

            {!loading && activeTab === "models" && models.map(model => {
              const isSelected = selectedModel?.id === model.id;
              
              return (
              <div 
                key={model.id}
                id={`model-${model.id}`}
                className={`group transition-all duration-500 relative flex flex-col overflow-hidden ${isSelected ? 'bg-black/80 shadow-[0_0_20px_rgba(255,255,255,0.1)] my-2 border border-white/30' : 'border-b border-white/10 hover:bg-white/5 cursor-pointer'}`}
                onClick={() => {
                  if (isSelected) {
                    setSelectedModel(null);
                  } else {
                    setSelectedModel(model);
                    setTimeout(() => {
                      const el = document.getElementById(`model-${model.id}`);
                      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }, 100);
                  }
                }}
              >
                {/* Hover Effects */}
                <div className="absolute left-0 top-0 w-1 h-full bg-white scale-y-0 group-hover:scale-y-100 origin-center transition-transform duration-300 ease-out shadow-[0_0_10px_rgba(255,255,255,0.8)] z-0" />
                <div className="absolute inset-0 -translate-x-[150%] group-hover:translate-x-[150%] bg-gradient-to-r from-transparent via-white/10 to-transparent transition-transform duration-700 ease-out pointer-events-none z-0" />

                {/* Header Row */}
                <div className={`px-5 flex justify-between items-center relative z-10 ${isSelected ? 'py-6' : 'py-4'}`}>
                  <div className="relative flex-1">
                    <div className="text-[9px] font-mono text-white/50 mb-1 tracking-widest uppercase">[ AI_MODEL ] • {model.format} {model.version ? `v${model.version}` : ''}</div>
                    <h3 className={`font-heading font-bold text-white transition-all duration-300 ${isSelected ? 'text-xl drop-shadow-[0_0_8px_rgba(255,255,255,0.3)]' : 'text-sm group-hover:drop-shadow-[0_0_5px_rgba(255,255,255,0.5)]'}`}>{model.name}</h3>
                  </div>
                  <div className="relative flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={(e) => { e.stopPropagation(); handleEdit('models', model, e); }} className="p-2 text-white/50 hover:text-white"><Edit2 className="w-3 h-3" /></button>
                    <button onClick={(e) => { e.stopPropagation(); handleDelete('models', model, e); }} className="p-2 text-white/50 hover:text-white"><Trash2 className="w-3 h-3" /></button>
                  </div>
                </div>

                {/* Expanded Info */}
                {isSelected && (
                  <div className="px-5 pb-6 flex flex-col gap-4 animate-in slide-in-from-top-2 duration-300 relative z-10">
                    <div className="flex flex-col gap-2 p-4 border border-white/20 bg-white/5">
                      <div className="flex justify-between items-center text-[10px] font-mono tracking-widest uppercase">
                        <span className="text-white/50">TASK_TYPE:</span>
                        <span className="text-white font-bold bg-white/10 px-2 py-0.5 border border-white/20">{model.task_type.replace(/_/g, ' ')}</span>
                      </div>
                      <div className="flex justify-between items-center text-[10px] font-mono tracking-widest uppercase mt-1">
                        <span className="text-white/50">SIZE:</span>
                        <span className="text-white">{Math.round((model.file_size_bytes || 0) / 1024 / 1024)} MB</span>
                      </div>
                      <div className="flex justify-between items-center text-[10px] font-mono tracking-widest uppercase mt-1">
                        <span className="text-white/50">FILE_URL:</span>
                        <span className="text-white/50 truncate max-w-[200px]" title={model.file_url}>{model.file_url || 'N/A'}</span>
                      </div>
                    </div>
                    <p className="text-sm font-mono text-white/70 leading-relaxed">{model.description}</p>
                  </div>
                )}
              </div>
            )})}

            {!loading && activeTab === "textbooks" && textbooks.map(book => {
              const isSelected = selectedTextbook?.id === book.id;
              
              return (
              <div 
                key={book.id}
                id={`textbook-${book.id}`}
                className={`group transition-all duration-500 relative flex flex-col overflow-hidden ${isSelected ? 'bg-black/80 shadow-[0_0_20px_rgba(255,255,255,0.1)] my-2 border border-white/30' : 'border-b border-white/10 hover:bg-white/5 cursor-pointer'}`}
                onClick={() => {
                  if (isSelected) {
                    setSelectedTextbook(null);
                  } else {
                    setSelectedTextbook(book);
                    setTimeout(() => {
                      const el = document.getElementById(`textbook-${book.id}`);
                      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }, 100);
                  }
                }}
              >
                {/* Hover Effects for entire card */}
                <div className="absolute left-0 top-0 w-1 h-full bg-white scale-y-0 group-hover:scale-y-100 origin-center transition-transform duration-300 ease-out shadow-[0_0_10px_rgba(255,255,255,0.8)] z-0" />
                <div className="absolute inset-0 -translate-x-[150%] group-hover:translate-x-[150%] bg-gradient-to-r from-transparent via-white/10 to-transparent transition-transform duration-700 ease-out pointer-events-none z-0" />

                {/* Header Row */}
                <div className={`px-5 flex justify-between items-center relative z-10 ${isSelected ? 'py-6' : 'py-4'}`}>
                  <div className="relative flex-1">
                    <div className="text-[9px] font-mono text-white/50 mb-1">[ CODEX_MODULE ]</div>
                    <h3 className={`font-heading font-bold text-white transition-all duration-300 ${isSelected ? 'text-xl drop-shadow-[0_0_8px_rgba(255,255,255,0.3)]' : 'text-sm group-hover:drop-shadow-[0_0_5px_rgba(255,255,255,0.5)]'}`}>{book.title}</h3>
                  </div>
                  <div className="relative flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={(e) => { e.stopPropagation(); handleEdit('textbooks', book, e); }} className="p-2 text-white/50 hover:text-white"><Edit2 className="w-3 h-3" /></button>
                    <button onClick={(e) => { e.stopPropagation(); handleDelete('textbooks', book, e); }} className="p-2 text-white/50 hover:text-white"><Trash2 className="w-3 h-3" /></button>
                  </div>
                </div>

                {/* Expanded Info */}
                {isSelected && (
                  <div className="px-5 pb-6 flex flex-col gap-4 animate-in slide-in-from-top-2 duration-300 relative z-10">
                    <div className="flex gap-4">
                      {book.cover_image_url && (
                        <Image src={book.cover_image_url} alt="Cover" width={96} height={128} unoptimized className="w-24 h-32 object-cover border border-white/20 shadow-[0_0_10px_rgba(255,255,255,0.1)]" />
                      )}
                      <div className="flex-1 flex flex-col">
                        <div className="text-xs font-mono text-white/50 mb-2 tracking-widest uppercase">
                          AUTHORS: {book.authors?.join(', ') || 'UNKNOWN'}
                        </div>
                        <p className="text-sm font-mono text-white/70 flex-1 leading-relaxed">{book.description}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )})}

          </div>
        </div>

        {/* Center Panel: Map Preview (Only for Nebulas/Stars/Anomalies) */}
        {(activeTab === 'nebulas' || activeTab === 'anomalies') && (
          <div className="flex-1 relative bg-black/80 border border-white/20 overflow-hidden hidden md:block">
            <CyberBrackets color="border-white/30" />
            
            {rightPanelMode === 'map' && (
              <div className="absolute top-4 left-4 z-20 pointer-events-none transition-opacity duration-300">
                <span className="bg-black/90 text-white border border-white/30 px-3 py-1 text-[10px] font-mono tracking-widest uppercase flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-white animate-pulse" />
                  MAP_MONITOR
                </span>
              </div>
            )}

            <div className="absolute top-4 right-4 z-20 flex gap-2">
              <button 
                onClick={() => setRightPanelMode('map')}
                className={`px-3 py-1 text-[10px] font-mono tracking-widest uppercase border transition-colors ${rightPanelMode === 'map' ? 'bg-white text-black border-white shadow-[0_0_10px_rgba(255,255,255,0.5)]' : 'bg-black/60 text-white/50 border-white/30 hover:text-white'}`}
              >
                [ MAP_VIEW ]
              </button>
              <button 
                onClick={() => setRightPanelMode('preview')}
                className={`px-3 py-1 text-[10px] font-mono tracking-widest uppercase border transition-colors ${rightPanelMode === 'preview' ? 'bg-white text-black border-white shadow-[0_0_10px_rgba(255,255,255,0.5)]' : 'bg-black/60 text-white/50 border-white/30 hover:text-white'}`}
              >
                [ CONTENT_PREVIEW ]
              </button>
            </div>

            <div className="w-full h-full relative">
              <div className={`absolute inset-0 transition-opacity duration-300 ${rightPanelMode === 'map' ? 'opacity-100 z-10 pointer-events-auto' : 'opacity-0 z-0 pointer-events-none'}`}>
                <div className="w-full h-full">
                  <CosmosMapEditor 
                    className="w-full h-full"
                    targetX={hoverTarget.x} 
                    targetY={hoverTarget.y} 
                    targetScale={hoverTarget.scale}
                    mapId={hoverTarget.mapId}
                    activeNodeId={hoverTarget.activeNodeId || selectedArticleId}
                    refreshKey={refreshKey}
                  />
                </div>
              </div>

              <div className={`absolute inset-0 transition-opacity duration-300 overflow-y-auto [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-track]:bg-black/20 [&::-webkit-scrollbar-thumb]:bg-white/30 hover:[&::-webkit-scrollbar-thumb]:bg-white/50 p-12 bg-[#050505] prose prose-invert max-w-none ${rightPanelMode === 'preview' ? 'opacity-100 z-10 pointer-events-auto' : 'opacity-0 z-0 pointer-events-none'}`}>
                {selectedArticleContent === 'LOADING_DATA_STREAM...' ? (
                  <div className="text-white/30 font-mono text-center mt-32 text-xs tracking-widest animate-pulse">{selectedArticleContent}</div>
                ) : selectedArticleId ? (
                  <MarkdownRenderer content={selectedArticleContent} />
                ) : (
                  <div className="text-white/30 font-mono text-center mt-32 text-xs tracking-widest">AWAITING_NODE_SELECTION...</div>
                )}
              </div>
            </div>
            
            {rightPanelMode === 'map' && (
              <div className="absolute bottom-4 left-4 right-4 z-20 pointer-events-none flex justify-between items-end transition-opacity duration-300">
                <div className="text-[10px] font-mono text-white/40 tracking-[0.2em]">
                  COORD: X:{Math.round(hoverTarget.x)} Y:{Math.round(hoverTarget.y)} S:{hoverTarget.scale}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Center Panel: Textbook Preview */}
        {activeTab === 'textbooks' && (
          <div className="flex-1 relative bg-[#050505] border border-white/20 overflow-hidden hidden md:flex flex-col">
            <CyberBrackets color="border-white/30" />
            <div className="absolute top-4 left-4 z-20 pointer-events-none">
              <span className="bg-black/90 text-white border border-white/30 px-3 py-1 text-[10px] font-mono tracking-widest uppercase flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-white animate-pulse" />
                CODEX_VIEWER
              </span>
            </div>
            
            {selectedTextbook ? (
              <div className="flex-1 w-full relative bg-black mt-16">
                {selectedTextbook.pdf_url ? (
                  <iframe src={`${selectedTextbook.pdf_url}#toolbar=0`} className="w-full h-full bg-white" title="PDF Preview" />
                ) : (
                  <div className="flex items-center justify-center h-full text-white/30 font-mono text-sm tracking-widest uppercase">NO_PDF_URL_PROVIDED</div>
                )}
              </div>
            ) : (
               <div className="flex items-center justify-center h-full text-white/30 font-mono tracking-widest text-xs">
                 AWAITING_MODULE_SELECTION...
               </div>
            )}
          </div>
        )}

        {/* Center Panel: Model Playground Launcher */}
        {activeTab === 'models' && (
          <div className="flex-1 relative bg-black/80 border border-white/20 overflow-hidden hidden md:flex items-center justify-center">
            <div className="absolute inset-0 bg-[linear-gradient(to_bottom,transparent_50%,rgba(255,255,255,0.02)_50%)] bg-[length:100%_4px] pointer-events-none z-0" />
            <div className="absolute top-4 left-4 z-20 pointer-events-none">
              <span className="bg-black/90 text-white/70 border border-white/30 px-3 py-1 text-[10px] font-mono tracking-widest uppercase flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-white animate-pulse shadow-[0_0_5px_rgba(255,255,255,0.8)]" />
                PLAYGROUND_UPLINK
              </span>
            </div>
            
            {selectedModel ? (
              <div className="relative z-10 flex flex-col items-center justify-center p-8 text-center max-w-md animate-in zoom-in duration-500">
                <div className="w-28 h-28 mb-8 relative">
                  <div className="absolute inset-0 border border-white/50 rounded-full animate-[spin_10s_linear_infinite]" />
                  <div className="absolute inset-2 border border-white/30 rounded-full animate-[spin_15s_linear_infinite_reverse]" />
                  <div className="absolute inset-4 border border-white/10 rounded-full animate-[spin_5s_linear_infinite]" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Cpu className="w-10 h-10 text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.8)] animate-pulse" />
                  </div>
                </div>
                
                <h2 className="text-3xl font-heading font-black text-white mb-3 uppercase drop-shadow-[0_0_15px_rgba(255,255,255,0.3)] tracking-[0.1em]">{selectedModel.name}</h2>
                <div className="text-[10px] font-mono text-white font-bold mb-8 tracking-[0.2em] uppercase bg-white/10 px-4 py-1.5 border border-white/30 shadow-[0_0_10px_rgba(255,255,255,0.1)] flex items-center gap-2">
                  <Activity className="w-3 h-3" />
                  {selectedModel.task_type.replace(/_/g, ' ')}
                </div>
                
                <p className="text-sm font-mono text-white/50 mb-12 leading-relaxed">
                  SYSTEM READY. Initialize playground environment to benchmark inference capabilities, establish video feed, and monitor runtime telemetry.
                </p>
                
                <Link 
                  href={`/playground/${selectedModel.id}`} 
                  target="_blank" 
                  className="relative group px-10 py-4 border border-white/50 hover:border-white transition-all duration-300 bg-white/5 overflow-hidden flex items-center justify-center"
                >
                  <div className="absolute inset-0 bg-white translate-y-[100%] group-hover:translate-y-0 transition-transform duration-300 ease-out" />
                  <span className="relative z-10 group-hover:text-black text-white font-bold flex items-center gap-3 tracking-[0.2em] uppercase transition-colors">
                    <Zap className="w-4 h-4 group-hover:animate-bounce" /> INITIALIZE_PLAYGROUND
                  </span>
                </Link>
              </div>
            ) : (
               <div className="relative z-10 flex flex-col items-center justify-center h-full text-white/50 font-mono tracking-widest text-xs animate-pulse gap-4">
                 <Activity className="w-8 h-8 opacity-50" />
                 AWAITING_MODEL_SELECTION...
               </div>
            )}
          </div>
        )}
      </div>

      {isForgeOpen && (
        <EntityForge 
          activeTab={forgeTab} 
          onClose={() => setIsForgeOpen(false)} 
          onSave={handleSave}
          initialData={forgeInitialData}
        />
      )}
    </div>
  );
}
