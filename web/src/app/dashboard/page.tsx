"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Compass, Rocket, Activity, Database, Crosshair, TerminalSquare, Cpu, Radar, ShieldCheck, User, LogOut, ArrowRight } from "lucide-react";
import CosmosMapPreview from "@/components/CosmosMapPreview";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";

import CyberBrackets from '@/components/ui/CyberBrackets';

type TabId = "sectors" | "nebulas" | "rogue";

interface Textbook {
  id: string;
  title: string;
  description: string;
  totalChapters: number;
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
  slug: string;
}

interface CategoryProgress {
  total: number;
  completed: number;
  decoding: number;
}

interface ProgressSummary {
  textbooks: Record<string, CategoryProgress>;
  topics: Record<string, CategoryProgress>;
  standalone: Record<string, string>;
}

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState<TabId>("sectors");
  const [mapTarget, setMapTarget] = useState({ x: 5000, y: 5000, scale: 0.2, mapId: undefined as string | undefined, activeNodeId: undefined as string | undefined });
  const hoverChapterCache = useRef<Record<string, string>>({});

  const [textbooks, setTextbooks] = useState<Textbook[]>([]);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [rogueArticles, setRogueArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [progressSummary, setProgressSummary] = useState<ProgressSummary | null>(null);

  const [selectedTextbook, setSelectedTextbook] = useState<Textbook | null>(null);
  const [selectedChapter, setSelectedChapter] = useState<Chapter | null>(null);
  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [articles, setArticles] = useState<Article[]>([]);
  const [drilldownLoading, setDrilldownLoading] = useState(false);

  const [user, setUser] = useState<any>(null);
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
      }
    });
    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    await signOut(auth);
    setShowProfileMenu(false);
  };


  const fetchChapters = async (textbook: Textbook) => {
    setDrilldownLoading(true);
    setSelectedTextbook(textbook);
    const res = await fetch(`/api/v1/textbooks/${textbook.id}/chapters`);
    const json = await res.json();
    setChapters(json.data || []);
    setDrilldownLoading(false);
  };

  const fetchChapterArticles = async (chapter: Chapter) => {
    setDrilldownLoading(true);
    setSelectedChapter(chapter);
    const res = await fetch(`/api/v1/chapters/${chapter.id}/articles`);
    const json = await res.json();
    setArticles(json.data || []);
    setDrilldownLoading(false);
  };

  const fetchTopicArticles = async (topic: Topic) => {
    setDrilldownLoading(true);
    setSelectedTopic(topic);
    const res = await fetch(`/api/v1/topics/${topic.id}/articles`);
    const json = await res.json();
    setArticles(json.data || []);
    setDrilldownLoading(false);
  };

  const handleChapterHover = async (chapter: Chapter, idx: number) => {
    if (hoverChapterCache.current[chapter.id]) {
       setMapTarget(prev => ({ ...prev, scale: 0.4, activeNodeId: hoverChapterCache.current[chapter.id] }));
       return;
    }
    setMapTarget(prev => ({ ...prev, scale: 0.3, activeNodeId: undefined }));
    try {
      const res = await fetch(`/api/v1/chapters/${chapter.id}/articles`);
      const json = await res.json();
      if (json.data && json.data.length > 0) {
        hoverChapterCache.current[chapter.id] = json.data[0].id;
        setMapTarget(prev => ({ ...prev, scale: 0.4, activeNodeId: json.data[0].id }));
      }
    } catch(e) {}
  };

  useEffect(() => {
    async function fetchData() {
      try {
        const tbRes = await fetch('/api/v1/textbooks');
        const tpRes = await fetch('/api/v1/topics');
        const rogueRes = await fetch('/api/v1/articles/standalone');
        
        const tbJson = await tbRes.json();
        const tpJson = await tpRes.json();
        const rogueJson = await rogueRes.json();

        setTextbooks(tbJson.data || []);
        setTopics(tpJson.data || []);
        setRogueArticles(rogueJson.data || []);

        if (tbJson.data && tbJson.data.length > 0) {
          setMapTarget(prev => ({ ...prev, mapId: tbJson.data[0].id }));
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

  let sigDecoded = 0;
  let activeDecode = 0;
  let anomalies = rogueArticles.length;
  let totalNodes = 0;

  if (progressSummary) {
    Object.values(progressSummary.textbooks).forEach(p => {
      sigDecoded += p.completed;
      activeDecode += p.decoding;
      totalNodes += p.total;
    });
    Object.values(progressSummary.topics).forEach(p => {
      sigDecoded += p.completed;
      activeDecode += p.decoding;
      totalNodes += p.total;
    });
    Object.values(progressSummary.standalone).forEach(status => {
      if (status === 'decoded') sigDecoded++;
      if (status === 'decoding') activeDecode++;
      totalNodes++;
    });
  }

  const sysProgress = totalNodes > 0 ? (sigDecoded / totalNodes) : 0;
  const sysProgressPercent = Math.round(sysProgress * 100);
  const sysProgressOffset = 125.6 - (125.6 * sysProgress);

  return (
    <div
      className="h-screen w-screen bg-[#020205] text-text-main font-sans overflow-hidden"
      style={{ display: "grid", gridTemplateRows: "auto auto 1fr" }}
    >
      {/* Cyber Grid Background */}
      <div className="fixed inset-0 pointer-events-none z-0" style={{
        backgroundImage: 'linear-gradient(rgba(0, 229, 255, 0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(0, 229, 255, 0.03) 1px, transparent 1px)',
        backgroundSize: '40px 40px'
      }} />

      {/* === ROW 1: Header === */}
      <header className="relative z-50 flex items-center justify-between px-6 py-3 border-b border-panel-border uppercase tracking-wider">
        <div className="flex items-center gap-3">
          <Crosshair className="w-4 h-4 text-decoded animate-[spin_4s_linear_infinite]" />
          <div>
            <div className="flex items-center gap-2 mb-1 text-decoded">
              <span className="font-mono text-[10px] tracking-[0.3em]">SYS.CMD.CENTER // ROOT</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-heading font-black text-white tracking-[0.15em] m-0 leading-none drop-shadow-[0_0_10px_rgba(0,229,255,0.4)]">
              SEQUOIA
            </h1>

          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="bg-black/80 border border-decoded/30 px-4 py-2 relative hidden md:block">
            <CyberBrackets />
            <span className="block text-[9px] font-mono text-text-dim mb-1">NETWORK_STATUS</span>
            <span className="text-xs font-heading text-decoded flex items-center gap-2 font-bold tracking-widest">
              <span className="w-1.5 h-1.5 bg-decoded shadow-[0_0_8px_#00e5ff] animate-pulse" />
              LINK_ACTIVE
            </span>
          </div>
        </div>
      </header>

      {/* === ROW 2: Stats bar === */}
      <div className="relative z-10 grid grid-cols-4 gap-3 px-6 py-3 border-b border-panel-border">
        
        {/* Stat 1: SIG_DECODED */}
        <div className="bg-black/60 border border-panel-border hover:border-decoded/50 p-3 relative group hover:bg-decoded/5 transition-all duration-300 flex items-center gap-4 overflow-hidden cursor-default">
          <CyberBrackets color="border-decoded/30 group-hover:border-decoded transition-colors duration-300" />
          {/* Animated Left Bar */}
          <div className="absolute left-0 top-0 w-1 h-full bg-decoded scale-y-0 group-hover:scale-y-100 origin-center transition-transform duration-300 ease-out shadow-[0_0_10px_rgba(0,229,255,0.8)]" />
          {/* Sweep Light */}
          <div className="absolute inset-0 -translate-x-[150%] group-hover:translate-x-[150%] bg-gradient-to-r from-transparent via-decoded/10 to-transparent transition-transform duration-700 ease-out pointer-events-none" />
          
          <div className="w-10 h-10 bg-decoded/5 border border-decoded/20 group-hover:border-decoded/50 group-hover:shadow-[0_0_15px_rgba(0,229,255,0.3)] flex items-center justify-center text-decoded shrink-0 relative transition-all duration-300">
            <ShieldCheck className="w-5 h-5 relative z-10 opacity-60 group-hover:opacity-100 group-hover:scale-110 transition-all duration-300" />
          </div>
          <div className="flex flex-col relative z-10">
            <span className="block text-[9px] font-mono text-text-dim group-hover:text-decoded/80 tracking-widest mb-1 uppercase transition-colors duration-300">SIG_DECODED</span>
            <div className="flex items-baseline gap-2">
              <span className="text-xl font-heading font-bold text-white group-hover:drop-shadow-[0_0_8px_rgba(0,229,255,0.8)] group-hover:text-decoded transition-all duration-300">{sigDecoded}</span>
            </div>
          </div>
        </div>

        {/* Stat 2: ACTIVE_DECODE */}
        <div className="bg-black/60 border border-panel-border hover:border-decoding/50 p-3 relative group hover:bg-decoding/5 transition-all duration-300 flex items-center gap-4 overflow-hidden cursor-default">
          <CyberBrackets color="border-decoding/30 group-hover:border-decoding transition-colors duration-300" />
          <div className="absolute left-0 top-0 w-1 h-full bg-decoding scale-y-0 group-hover:scale-y-100 origin-center transition-transform duration-300 ease-out shadow-[0_0_10px_rgba(255,170,0,0.8)]" />
          <div className="absolute inset-0 -translate-x-[150%] group-hover:translate-x-[150%] bg-gradient-to-r from-transparent via-decoding/10 to-transparent transition-transform duration-700 ease-out pointer-events-none" />
          
          <div className="w-10 h-10 bg-decoding/5 border border-decoding/20 group-hover:border-decoding/50 group-hover:shadow-[0_0_15px_rgba(255,170,0,0.3)] flex items-center justify-center text-decoding shrink-0 relative transition-all duration-300">
            <Cpu className="w-5 h-5 relative z-10 opacity-60 group-hover:opacity-100 group-hover:scale-110 group-hover:animate-pulse transition-all duration-300" />
          </div>
          <div className="flex flex-col relative z-10">
            <span className="block text-[9px] font-mono text-text-dim group-hover:text-decoding/80 tracking-widest mb-1 uppercase transition-colors duration-300">ACTIVE_DECODE</span>
            <div className="flex items-baseline gap-2">
              <span className="text-xl font-heading font-bold text-white group-hover:drop-shadow-[0_0_8px_rgba(255,170,0,0.8)] group-hover:text-decoding transition-all duration-300">{activeDecode}</span>
              <span className="text-[10px] font-mono text-decoding/60 group-hover:text-decoding transition-colors duration-300">{activeDecode > 0 ? 'COMPUTING...' : 'STANDBY'}</span>
            </div>
          </div>
        </div>

        {/* Stat 3: ANOMALIES */}
        <div className="bg-black/60 border border-panel-border hover:border-anomaly/50 p-3 relative group hover:bg-anomaly/5 transition-all duration-300 flex items-center gap-4 overflow-hidden cursor-default">
          <CyberBrackets color="border-anomaly/30 group-hover:border-anomaly transition-colors duration-300" />
          <div className="absolute left-0 top-0 w-1 h-full bg-anomaly scale-y-0 group-hover:scale-y-100 origin-center transition-transform duration-300 ease-out shadow-[0_0_10px_rgba(255,0,85,0.8)]" />
          <div className="absolute inset-0 -translate-x-[150%] group-hover:translate-x-[150%] bg-gradient-to-r from-transparent via-anomaly/10 to-transparent transition-transform duration-700 ease-out pointer-events-none" />
          
          <div className="w-10 h-10 bg-anomaly/5 border border-anomaly/20 group-hover:border-anomaly/50 group-hover:shadow-[0_0_15px_rgba(255,0,85,0.3)] flex items-center justify-center text-anomaly shrink-0 relative transition-all duration-300">
            <Radar className="w-5 h-5 relative z-10 opacity-60 group-hover:opacity-100 transition-all duration-300 group-hover:animate-[spin_2s_linear_infinite]" />
          </div>
          <div className="flex flex-col relative z-10">
            <span className="block text-[9px] font-mono text-text-dim group-hover:text-anomaly/80 tracking-widest mb-1 uppercase transition-colors duration-300">ANOMALIES</span>
            <div className="flex items-baseline gap-2">
              <span className="text-xl font-heading font-bold text-white group-hover:drop-shadow-[0_0_8px_rgba(255,0,85,0.8)] group-hover:text-anomaly transition-all duration-300">{anomalies}</span>
              <span className="text-[10px] font-mono text-anomaly/60 group-hover:text-anomaly transition-colors duration-300">DETECTED</span>
            </div>
          </div>
        </div>

        {/* Stat 4: SYS_PROGRESS (Orbital Ring) */}
        <div className="bg-black/60 border border-panel-border hover:border-white/40 p-3 relative group hover:bg-white/5 transition-all duration-300 flex items-center gap-4 overflow-hidden cursor-default">
          <CyberBrackets color="border-white/30 group-hover:border-white transition-colors duration-300" />
          <div className="absolute left-0 top-0 w-1 h-full bg-white scale-y-0 group-hover:scale-y-100 origin-center transition-transform duration-300 ease-out shadow-[0_0_10px_rgba(255,255,255,0.8)]" />
          <div className="absolute inset-0 -translate-x-[150%] group-hover:translate-x-[150%] bg-gradient-to-r from-transparent via-white/10 to-transparent transition-transform duration-700 ease-out pointer-events-none" />
          
          <div className="w-12 h-12 relative flex items-center justify-center shrink-0">
            {/* Background Track */}
            <svg className="absolute inset-0 w-full h-full -rotate-90">
              <circle cx="24" cy="24" r="20" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="3" />
              {/* Orbital Progress */}
              <circle cx="24" cy="24" r="20" fill="none" stroke="rgba(255,255,255,0.8)" strokeWidth="3" 
                strokeDasharray="125.6" strokeDashoffset={sysProgressOffset}
                strokeLinecap="round"
                className="group-hover:stroke-white group-hover:drop-shadow-[0_0_8px_rgba(255,255,255,0.8)] transition-all duration-1000 ease-out" 
              />
            </svg>
            <span className="absolute text-[10px] font-mono font-bold text-white tracking-tighter">{sysProgressPercent}%</span>
          </div>

          <div className="flex flex-col w-full pr-2 justify-center relative z-10">
            <span className="block text-[9px] font-mono text-text-dim group-hover:text-white/80 tracking-widest mb-1 uppercase transition-colors duration-300">SYS_PROGRESS</span>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-white/60">OVERALL_COMPLETION</span>
            </div>
          </div>
        </div>
        
      </div>

      {/* === ROW 3: Main content (fills all remaining space) === */}
      <div className="relative z-10 flex flex-col lg:flex-row gap-4 px-6 py-4 min-h-0 overflow-hidden">

        {/* Left column: Tabbed navigation */}
        <div className="flex-shrink-0 w-full lg:w-[400px] flex flex-col min-h-0 bg-black/40 border border-panel-border relative">
          <CyberBrackets color="border-white/10" />

          {/* Tab bar */}
          <div className="flex flex-shrink-0 border-b border-panel-border">
            {[
              { id: "sectors", label: "SECTORS", sub: "Textbooks", accent: "decoded", defaultTarget: { x: 5000, y: 4800, scale: 0.2, mapId: textbooks.length > 0 ? textbooks[0].id : undefined } },
              { id: "nebulas", label: "NEBULAS", sub: "Topics", accent: "decoding", defaultTarget: { x: 7500, y: 2500, scale: 0.2, mapId: topics.length > 0 ? topics[0].id : undefined } },
              { id: "rogue", label: "ROGUE", sub: "Papers", accent: "anomaly", defaultTarget: { x: 8250, y: 3500, scale: 0.2, mapId: "standalone_articles" } },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id as TabId);
                  setSelectedTextbook(null);
                  setSelectedChapter(null);
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
                    ? `text-${tab.accent} border-${tab.accent} bg-${tab.accent}/5`
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

            {/* SECTORS tab */}
            {activeTab === "sectors" && (
              selectedChapter ? (
                <>
                  <button onClick={() => setSelectedChapter(null)} className="text-[10px] font-mono text-text-dim hover:text-white p-4 flex items-center gap-2 border-b border-panel-border w-full text-left bg-black/40 uppercase tracking-widest"><ArrowRight className="w-3 h-3 rotate-180" /> RETURN TO CHAPTERS</button>
                  {drilldownLoading ? <div className="p-4 text-decoded animate-pulse text-xs">LOADING ARTICLES...</div> :
                    articles.map((article, idx) => (
                      <div key={article.id} 
                           className="group cursor-pointer border-b border-panel-border px-5 py-4 hover:bg-decoded/5 transition-all duration-300 relative overflow-hidden"
                           onMouseEnter={() => setMapTarget(prev => ({ ...prev, scale: 0.6, activeNodeId: article.id }))}
                           onMouseLeave={() => setMapTarget(prev => ({ ...prev, activeNodeId: undefined }))}
                      >
                        <div className="absolute left-0 top-0 w-1 h-full bg-decoded scale-y-0 group-hover:scale-y-100 origin-center transition-transform duration-300 ease-out shadow-[0_0_10px_rgba(0,229,255,0.8)]" />
                        <div className="relative z-10">
                          <h3 className="text-sm font-heading font-bold text-white group-hover:text-decoded transition-all duration-300 tracking-wide mb-1 uppercase">{article.title.replace(/ /g, "_")}</h3>
                          <p className="text-text-dim text-xs font-mono leading-relaxed normal-case line-clamp-2 mb-4">&gt; {article.summary}</p>
                          <div className="flex items-center justify-between border-t border-panel-border pt-3">
                            <Link href={`/articles/${article.slug}`} onClick={e => e.stopPropagation()} className="text-[10px] font-mono font-bold text-decoded tracking-wider flex items-center gap-1 group-hover:translate-x-1 transition-transform duration-300">
                              INTERCEPT <Rocket className="w-3 h-3" />
                            </Link>
                          </div>
                        </div>
                      </div>
                    ))
                  }
                </>
              ) : selectedTextbook ? (
                <>
                  <button onClick={() => setSelectedTextbook(null)} className="text-[10px] font-mono text-text-dim hover:text-white p-4 flex items-center gap-2 border-b border-panel-border w-full text-left bg-black/40 uppercase tracking-widest"><ArrowRight className="w-3 h-3 rotate-180" /> RETURN TO SECTORS</button>
                  {drilldownLoading ? <div className="p-4 text-decoded animate-pulse text-xs">LOADING CHAPTERS...</div> :
                    chapters.map((chapter, idx) => (
                      <div key={chapter.id} 
                           className="group cursor-pointer border-b border-panel-border px-5 py-4 hover:bg-decoded/5 transition-all duration-300 relative overflow-hidden"
                           onMouseEnter={() => handleChapterHover(chapter, idx)}
                           onMouseLeave={() => setMapTarget(prev => ({ ...prev, activeNodeId: undefined }))}
                      >
                        <div className="absolute left-0 top-0 w-1 h-full bg-decoded scale-y-0 group-hover:scale-y-100 origin-center transition-transform duration-300 ease-out shadow-[0_0_10px_rgba(0,229,255,0.8)]" />
                        <div className="relative z-10">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-[10px] font-mono text-decoded tracking-widest">[ CHAPTER ]</span>
                            <span className="text-[10px] font-mono text-text-dim">{chapter.articleCount} ARTICLES</span>
                          </div>
                          <h3 className="text-sm font-heading font-bold text-white group-hover:text-decoded transition-all duration-300 tracking-wide mb-1 uppercase">{chapter.title}</h3>
                          <p className="text-text-dim text-xs font-mono leading-relaxed normal-case line-clamp-2 mb-4">&gt; {chapter.description}</p>
                          <div className="flex items-center justify-between border-t border-panel-border pt-3">
                            <button onClick={(e) => { e.stopPropagation(); fetchChapterArticles(chapter); }} className="text-[10px] font-mono font-bold text-decoded tracking-wider flex items-center gap-1 group-hover:translate-x-1 transition-transform duration-300">
                              INITIATE <Rocket className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  }
                </>
              ) : (
              loading ? <div className="p-4 text-decoded animate-pulse text-xs">SCANNING SECTORS...</div> :
              textbooks.map((tb, idx) => (
                <div
                  key={tb.id}
                  className="group cursor-pointer border-b border-panel-border px-5 py-4 hover:bg-decoded/5 transition-all duration-300 relative overflow-hidden"
                  onMouseEnter={() => setMapTarget(prev => ({ ...prev, x: 5000, y: 4800, scale: 0.15, mapId: tb.id, activeNodeId: undefined }))}
                >
                  <div className="absolute left-0 top-0 w-1 h-full bg-decoded scale-y-0 group-hover:scale-y-100 origin-center transition-transform duration-300 ease-out shadow-[0_0_10px_rgba(0,229,255,0.8)]" />
                  <div className="absolute inset-0 -translate-x-[150%] group-hover:translate-x-[150%] bg-gradient-to-r from-transparent via-decoded/10 to-transparent transition-transform duration-700 ease-out pointer-events-none" />
                  
                  <div className="relative z-10">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] font-mono text-decoded tracking-widest">[ SECTOR_MAP ]</span>
                      <span className="text-[10px] font-mono text-text-dim">{tb.totalChapters} CHAPTERS</span>
                    </div>
                    <h3 className="text-sm font-heading font-bold text-white group-hover:text-decoded group-hover:drop-shadow-[0_0_8px_rgba(0,229,255,0.5)] transition-all duration-300 tracking-wide mb-1 uppercase">
                      {tb.title}
                    </h3>
                    <p className="text-text-dim text-xs font-mono leading-relaxed normal-case line-clamp-2 mb-4">
                      &gt; {tb.description}
                    </p>
                    <div className="flex items-center justify-between border-t border-panel-border pt-3">
                      <div className="flex gap-4 text-xs font-mono">
                        <span className="text-text-dim">NODES: <span className="text-white font-bold">{tb.totalChapters * 4}</span></span>
                        <span className="text-text-dim">DONE: <span className="text-decoded font-bold">{progressSummary?.textbooks[tb.id] ? Math.round((progressSummary.textbooks[tb.id].completed / Math.max(progressSummary.textbooks[tb.id].total, 1)) * 100) : 0}%</span></span>
                      </div>
                      <button onClick={(e) => { e.stopPropagation(); fetchChapters(tb); }} className="text-[10px] font-mono font-bold text-decoded tracking-wider flex items-center gap-1 group-hover:translate-x-1 transition-transform duration-300">
                        INITIATE <Rocket className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            ))}

            {/* NEBULAS tab */}
            {activeTab === "nebulas" && (
              selectedTopic ? (
                <>
                  <button onClick={() => setSelectedTopic(null)} className="text-[10px] font-mono text-text-dim hover:text-white p-4 flex items-center gap-2 border-b border-panel-border w-full text-left bg-black/40 uppercase tracking-widest"><ArrowRight className="w-3 h-3 rotate-180" /> RETURN TO NEBULAS</button>
                  {drilldownLoading ? <div className="p-4 text-decoding animate-pulse text-xs">LOADING ARTICLES...</div> :
                    articles.map((article, idx) => (
                      <div key={article.id} 
                           className="group cursor-pointer border-b border-panel-border px-5 py-4 hover:bg-decoding/5 transition-all duration-300 relative overflow-hidden"
                           onMouseEnter={() => setMapTarget(prev => ({ ...prev, scale: 0.6, activeNodeId: article.id }))}
                           onMouseLeave={() => setMapTarget(prev => ({ ...prev, activeNodeId: undefined }))}
                      >
                        <div className="absolute left-0 top-0 w-1 h-full bg-decoding scale-y-0 group-hover:scale-y-100 origin-center transition-transform duration-300 ease-out shadow-[0_0_10px_rgba(255,170,0,0.8)]" />
                        <div className="relative z-10">
                          <h3 className="text-sm font-heading font-bold text-white group-hover:text-decoding transition-all duration-300 tracking-wide mb-1 uppercase">{article.title.replace(/ /g, "_")}</h3>
                          <p className="text-text-dim text-xs font-mono leading-relaxed normal-case line-clamp-2 mb-4">&gt; {article.summary}</p>
                          <div className="flex items-center justify-between border-t border-panel-border pt-3">
                            <Link href={`/articles/${article.slug}`} onClick={e => e.stopPropagation()} className="text-[10px] font-mono font-bold text-decoding tracking-wider flex items-center gap-1 group-hover:translate-x-1 transition-transform duration-300">
                              INTERCEPT <Rocket className="w-3 h-3" />
                            </Link>
                          </div>
                        </div>
                      </div>
                    ))
                  }
                </>
              ) : (
              loading ? <div className="p-4 text-decoding animate-pulse text-xs">SCANNING NEBULAS...</div> :
              topics.map((topic, idx) => (
                <div
                  key={topic.id}
                  className="group cursor-pointer border-b border-panel-border px-5 py-4 hover:bg-decoding/5 transition-all duration-300 relative overflow-hidden"
                  onMouseEnter={() => setMapTarget(prev => ({ ...prev, x: 7500, y: 2500, scale: 0.2, mapId: topic.id, activeNodeId: undefined }))}
                >
                  <div className="absolute left-0 top-0 w-1 h-full bg-decoding scale-y-0 group-hover:scale-y-100 origin-center transition-transform duration-300 ease-out shadow-[0_0_10px_rgba(255,170,0,0.8)]" />
                  <div className="absolute inset-0 -translate-x-[150%] group-hover:translate-x-[150%] bg-gradient-to-r from-transparent via-decoding/10 to-transparent transition-transform duration-700 ease-out pointer-events-none" />
                  
                  <div className="relative z-10">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] font-mono text-decoding tracking-widest">[ NEBULA ]</span>
                      <span className="text-[10px] font-mono text-text-dim">{topic.articleCount} ARTICLES</span>
                    </div>
                    <h3 className="text-sm font-heading font-bold text-white group-hover:text-decoding group-hover:drop-shadow-[0_0_8px_rgba(255,170,0,0.5)] transition-all duration-300 tracking-wide mb-1 uppercase">
                      {topic.name}
                    </h3>
                    <p className="text-text-dim text-xs font-mono leading-relaxed normal-case line-clamp-2 mb-4">
                      &gt; {topic.description}
                    </p>
                    <div className="flex items-center justify-between border-t border-panel-border pt-3">
                      <div className="flex gap-4 text-xs font-mono">
                        <span className="text-text-dim">NODES: <span className="text-white font-bold">{topic.articleCount}</span></span>
                        <span className="text-text-dim">STATUS: <span className={`font-bold ${progressSummary?.topics[topic.id]?.completed === progressSummary?.topics[topic.id]?.total && progressSummary?.topics[topic.id]?.total ? 'text-decoded' : progressSummary?.topics[topic.id]?.decoding || progressSummary?.topics[topic.id]?.completed ? 'text-decoding' : 'text-text-dim'}`}>{progressSummary?.topics[topic.id]?.completed === progressSummary?.topics[topic.id]?.total && progressSummary?.topics[topic.id]?.total ? 'SYNCED' : progressSummary?.topics[topic.id]?.decoding || progressSummary?.topics[topic.id]?.completed ? 'DECODING' : 'LOCKED'}</span></span>
                      </div>
                      <button onClick={(e) => { e.stopPropagation(); fetchTopicArticles(topic); }} className="text-[10px] font-mono font-bold text-decoding tracking-wider flex items-center gap-1 group-hover:translate-x-1 transition-transform duration-300">
                        EXPLORE <Rocket className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            ))}

            {/* ROGUE tab */}
            {activeTab === "rogue" && (
              loading ? <div className="p-4 text-anomaly animate-pulse text-xs">DETECTING ANOMALIES...</div> :
              rogueArticles.map((article, idx) => (
                <div
                  key={article.id}
                  className="group cursor-pointer border-b border-panel-border px-5 py-4 hover:bg-anomaly/5 transition-all duration-300 relative overflow-hidden"
                  onMouseEnter={() => setMapTarget(prev => ({ ...prev, scale: 0.6, mapId: "standalone_articles", activeNodeId: article.id }))}
                  onMouseLeave={() => setMapTarget(prev => ({ ...prev, activeNodeId: undefined }))}
                >
                  <div className="absolute left-0 top-0 w-1 h-full bg-anomaly scale-y-0 group-hover:scale-y-100 origin-center transition-transform duration-300 ease-out shadow-[0_0_10px_rgba(255,0,85,0.8)]" />
                  <div className="absolute inset-0 -translate-x-[150%] group-hover:translate-x-[150%] bg-gradient-to-r from-transparent via-anomaly/10 to-transparent transition-transform duration-700 ease-out pointer-events-none" />
                  
                  <div className="relative z-10">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] font-mono text-anomaly tracking-widest">[ ROGUE_ANOMALY ]</span>
                    </div>
                    <h3 className="text-sm font-heading font-bold text-white group-hover:text-anomaly group-hover:drop-shadow-[0_0_8px_rgba(255,0,85,0.5)] transition-all duration-300 tracking-wide mb-1 uppercase">
                      {article.title.replace(/ /g, "_")}
                    </h3>
                    <p className="text-text-dim text-xs font-mono leading-relaxed normal-case line-clamp-2 mb-4">
                      &gt; {article.summary}
                    </p>
                    <div className="flex items-center justify-between border-t border-panel-border pt-3">
                      <div className="flex gap-4 text-xs font-mono">
                        <span className="text-text-dim">STATUS: <span className={`font-bold ${progressSummary?.standalone[article.id] === 'decoded' ? 'text-decoded' : progressSummary?.standalone[article.id] === 'decoding' ? 'text-decoding animate-pulse' : 'text-anomaly animate-pulse'}`}>{progressSummary?.standalone[article.id] === 'decoded' ? 'DECODED' : progressSummary?.standalone[article.id] === 'decoding' ? 'DECODING' : 'DETECTED'}</span></span>
                      </div>
                      <Link href={`/articles/${article.slug}`} onClick={e => e.stopPropagation()} className="text-[10px] font-mono font-bold text-anomaly tracking-wider flex items-center gap-1 group-hover:translate-x-1 transition-transform duration-300">
                        INTERCEPT <Rocket className="w-3 h-3" />
                      </Link>
                    </div>
                  </div>
                </div>
              ))
            )}

          </div>

          {/* User Profile Bar at bottom of Left Column */}
          <div className="flex-shrink-0 border-t border-panel-border p-4 bg-black/80 flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-[9px] font-mono text-text-dim tracking-widest mb-1 uppercase">ID_ENTITY</span>
              <span className="text-xs font-heading text-white flex items-center gap-2 font-bold tracking-widest">
                <User className="w-3.5 h-3.5 text-decoded" />
                {user ? user.displayName?.toUpperCase() || 'USER_NODE' : 'GUEST_ACCESS'}
              </span>
            </div>
            
            {user ? (
              <button 
                onClick={handleLogout}
                className="px-3 py-1.5 border border-anomaly/30 hover:border-anomaly bg-anomaly/5 hover:bg-anomaly/20 text-anomaly text-[10px] font-mono tracking-widest uppercase transition-colors flex items-center gap-2"
              >
                <LogOut className="w-3 h-3" />
                TERMINATE
              </button>
            ) : (
              <Link href="/login">
                <button className="px-3 py-1.5 border border-decoded/30 hover:border-decoded bg-decoded/5 hover:bg-decoded/20 text-decoded text-[10px] font-mono tracking-widest uppercase transition-colors flex items-center gap-2">
                  <Cpu className="w-3 h-3" />
                  ESTABLISH
                </button>
              </Link>
            )}
          </div>
        </div>

        {/* Right column: Map preview */}
        <div className="flex-1 relative min-h-0 bg-black/60 border border-panel-border overflow-hidden">
          <CyberBrackets color="border-decoded/30" />
          <div className="absolute top-3 left-3 z-20 pointer-events-none">
            <span className="bg-black/90 text-decoded border border-decoded/30 px-2 py-0.5 text-[8px] font-mono tracking-widest uppercase">
              MAP_PREVIEW
            </span>
          </div>
          
          <div className="absolute inset-0">
            <CosmosMapPreview targetX={mapTarget.x} targetY={mapTarget.y} targetScale={mapTarget.scale} mapId={mapTarget.mapId} activeNodeId={mapTarget.activeNodeId} />
          </div>
        </div>

      </div>
    </div>
  );
}
