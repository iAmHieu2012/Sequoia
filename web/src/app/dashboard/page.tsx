"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Compass, Rocket, Activity, Database, Orbit, TerminalSquare, Cpu, Radar, ShieldCheck, User as UserIcon, LogOut, ArrowRight, BookOpen, Bot, FlaskConical } from "lucide-react";
import CosmosMapPreview from "@/components/CosmosMapPreview";
import useCosmosData from "@/hooks/useCosmosData";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged, signOut, User } from "firebase/auth";

import CyberBrackets from '@/components/ui/CyberBrackets';

type TabId = "nebulas" | "rogue" | "codex";

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
  slug: string;
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

interface Textbook {
  id: string;
  title: string;
  description: string;
}

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState<TabId>("nebulas");
  const [activeCommandPanel, setActiveCommandPanel] = useState<'labs' | 'assistant'>('labs');
  const [mapTarget, setMapTarget] = useState({ x: 7500, y: 2500, scale: 0.2, mapId: undefined as string | undefined, activeNodeId: undefined as string | undefined });
  
  const [topics, setTopics] = useState<Topic[]>([]);
  const [rogueArticles, setRogueArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState<Date | null>(null);
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

  useEffect(() => {
    setCurrentTime(new Date());
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
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

  let sigDecoded = 0;
  let undiscovered = 0;
  let anomalies = rogueArticles.length;
  let totalNodes = 0;

  if (progressSummary) {
    Object.values(progressSummary.topics).forEach(p => {
      sigDecoded += p.completed;
      totalNodes += p.total;
    });
    Object.values(progressSummary.standalone).forEach(isCompleted => {
      if (isCompleted) sigDecoded++;
      totalNodes++;
    });
    undiscovered = totalNodes - sigDecoded;
  }

  const sysProgress = totalNodes > 0 ? (sigDecoded / totalNodes) : 0;
  const sysProgressPercent = Math.round(sysProgress * 100);
  const sysProgressOffset = user ? (125.6 - (125.6 * sysProgress)) : 125.6;

  return (
    <div
      className="h-screen w-screen bg-space-bg text-text-main font-sans overflow-hidden select-none flex flex-col"
    >
      {/* Cyber Grid Background */}
      <div className="fixed inset-0 pointer-events-none z-0" style={{
        backgroundImage: 'linear-gradient(color-mix(in srgb, var(--color-system) 3%, transparent) 1px, transparent 1px), linear-gradient(90deg, color-mix(in srgb, var(--color-system) 3%, transparent) 1px, transparent 1px)',
        backgroundSize: '40px 40px'
      }} />

      {/* === ROW 1: Header === */}
      <header className="relative z-50 flex items-center justify-between px-6 py-3 border-b border-panel-border uppercase tracking-wider">
        <div className="flex items-center gap-3">
          <Orbit className="w-5 h-5 text-system animate-[spin_20s_linear_infinite]" />
          <div>
            <div className="flex items-center gap-2 mb-1 text-system">
              <span className="font-mono text-[10px] tracking-[0.3em]">SYS.CMD.CENTER // ROOT</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-heading font-black text-white tracking-[0.15em] m-0 leading-none drop-shadow-[0_0_10px_var(--color-system)]">
              SEQUOIA
            </h1>

          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="bg-black/80 border border-cyan/30 px-4 py-2 relative hidden md:block w-[180px]">
            <CyberBrackets />
            <span className="block text-[9px] font-mono text-text-dim mb-1">LOCAL_TIME</span>
            <span className="text-xs font-mono text-cyan flex items-center gap-2 font-bold tracking-wider uppercase">
              <span className="w-1.5 h-1.5 bg-cyan shadow-[0_0_8px_var(--color-cyan)] animate-pulse" />
              {currentTime ? currentTime.toLocaleString('en-US', { hour12: false, month: 'short', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit' }) : 'SYNCING...'}
            </span>
          </div>
        </div>
      </header>

      
      {/* === MAIN LAYOUT (2 ZONES) === */}
      <div className="flex-1 flex gap-4 px-6 py-4 min-h-0 overflow-hidden relative z-10">

        {/* === EXPLORE ZONE (LEFT) === */}
        <div className="flex-1 flex flex-col gap-4 min-w-0">
          
          {/* STATS BAR */}
          <div className="grid grid-cols-5 gap-3">
        
        {/* Stat 1: SIG_DECODED */}
        <div className="bg-black/60 border border-panel-border hover:border-blue/50 p-3 relative group hover:bg-blue/5 transition-all duration-300 flex items-center gap-4 overflow-hidden cursor-default">
          <CyberBrackets color="border-blue/30 group-hover:border-blue transition-colors duration-300" />
          {/* Animated Left Bar */}
          <div className="absolute left-0 top-0 w-1 h-full bg-blue scale-y-0 group-hover:scale-y-100 origin-center transition-transform duration-300 ease-out shadow-[0_0_10px_var(--color-blue)]" />
          {/* Sweep Light */}
          <div className="absolute inset-0 -translate-x-[150%] group-hover:translate-x-[150%] bg-gradient-to-r from-transparent via-blue/10 to-transparent transition-transform duration-700 ease-out pointer-events-none" />
          
          <div className="w-10 h-10 bg-blue/5 border border-blue/20 group-hover:border-blue/50 group-hover:shadow-[0_0_15px_color-mix(in_srgb,var(--color-blue)_30%,transparent)] flex items-center justify-center text-blue shrink-0 relative transition-all duration-300">
            <ShieldCheck className="w-5 h-5 relative z-10 opacity-60 group-hover:opacity-100 group-hover:scale-110 group-hover:animate-pulse transition-all duration-300" />
          </div>
          <div className="flex flex-col relative z-10">
            <span className="block text-[9px] font-mono text-text-dim group-hover:text-blue/80 tracking-widest mb-1 uppercase transition-colors duration-300">DECODED</span>
            <div className="flex items-baseline gap-2">
              <span className="text-xl font-heading font-bold text-white group-hover:drop-shadow-[0_0_8px_var(--color-blue)] group-hover:text-blue transition-all duration-300">{user ? sigDecoded : '---'}</span>
              <span className="text-[10px] font-mono text-blue/60 group-hover:text-blue transition-colors duration-300">SIGNALS</span>
            </div>
          </div>
        </div>

        {/* Stat 2: ACTIVE_DECODE */}
        <div className="bg-black/60 border border-panel-border hover:border-green/50 p-3 relative group hover:bg-green/5 transition-all duration-300 flex items-center gap-4 overflow-hidden cursor-default">
          <CyberBrackets color="border-green/30 group-hover:border-green transition-colors duration-300" />
          <div className="absolute left-0 top-0 w-1 h-full bg-green scale-y-0 group-hover:scale-y-100 origin-center transition-transform duration-300 ease-out shadow-[0_0_10px_var(--color-green)]" />
          <div className="absolute inset-0 -translate-x-[150%] group-hover:translate-x-[150%] bg-gradient-to-r from-transparent via-green/10 to-transparent transition-transform duration-700 ease-out pointer-events-none" />
          
          <div className="w-10 h-10 bg-green/5 border border-green/20 group-hover:border-green/50 group-hover:shadow-[0_0_15px_color-mix(in_srgb,var(--color-green)_30%,transparent)] flex items-center justify-center text-green shrink-0 relative transition-all duration-300">
            <Cpu className="w-5 h-5 relative z-10 opacity-60 group-hover:opacity-100 group-hover:scale-110 group-hover:animate-pulse transition-all duration-300" />
          </div>
          <div className="flex flex-col relative z-10">
            <span className="block text-[9px] font-mono text-text-dim group-hover:text-green/80 tracking-widest mb-1 uppercase transition-colors duration-300">UNKNOWN</span>
            <div className="flex items-baseline gap-2">
              <span className="text-xl font-heading font-bold text-white group-hover:drop-shadow-[0_0_8px_var(--color-green)] group-hover:text-green transition-all duration-300">{user ? undiscovered : '---'}</span>
              <span className="text-[10px] font-mono text-green/60 group-hover:text-green transition-colors duration-300">WAITING</span>
            </div>
          </div>
        </div>

        {/* Stat 3: ANOMALIES */}
        <div className="bg-black/60 border border-panel-border hover:border-pink/50 p-3 relative group hover:bg-pink/5 transition-all duration-300 flex items-center gap-4 overflow-hidden cursor-default">
          <CyberBrackets color="border-pink/30 group-hover:border-pink transition-colors duration-300" />
          <div className="absolute left-0 top-0 w-1 h-full bg-pink scale-y-0 group-hover:scale-y-100 origin-center transition-transform duration-300 ease-out shadow-[0_0_10px_var(--color-pink)]" />
          <div className="absolute inset-0 -translate-x-[150%] group-hover:translate-x-[150%] bg-gradient-to-r from-transparent via-pink/10 to-transparent transition-transform duration-700 ease-out pointer-events-none" />
          
          <div className="w-10 h-10 bg-pink/5 border border-pink/20 group-hover:border-pink/50 group-hover:shadow-[0_0_15px_color-mix(in_srgb,var(--color-pink)_30%,transparent)] flex items-center justify-center text-pink shrink-0 relative transition-all duration-300">
            <Radar className="w-5 h-5 relative z-10 opacity-60 group-hover:opacity-100 group-hover:scale-110 group-hover:animate-pulse transition-all duration-300" />
          </div>
          <div className="flex flex-col relative z-10">
            <span className="block text-[9px] font-mono text-text-dim group-hover:text-pink/80 tracking-widest mb-1 uppercase transition-colors duration-300">ANOMALIES</span>
            <div className="flex items-baseline gap-2">
              <span className="text-xl font-heading font-bold text-white group-hover:drop-shadow-[0_0_8px_var(--color-pink)] group-hover:text-pink transition-all duration-300">{user ? anomalies : '---'}</span>
              <span className="text-[10px] font-mono text-pink/60 group-hover:text-pink transition-colors duration-300">DETECTED</span>
            </div>
          </div>
        </div>

        {/* Stat 4: TEXTBOOKS */}
        <div className="bg-black/60 border border-panel-border hover:border-yellow/50 p-3 relative group hover:bg-yellow/5 transition-all duration-300 flex items-center gap-4 overflow-hidden cursor-default">
          <CyberBrackets color="border-yellow/30 group-hover:border-yellow transition-colors duration-300" />
          <div className="absolute left-0 top-0 w-1 h-full bg-yellow scale-y-0 group-hover:scale-y-100 origin-center transition-transform duration-300 ease-out shadow-[0_0_10px_var(--color-yellow)]" />
          <div className="absolute inset-0 -translate-x-[150%] group-hover:translate-x-[150%] bg-gradient-to-r from-transparent via-yellow/10 to-transparent transition-transform duration-700 ease-out pointer-events-none" />
          
          <div className="w-10 h-10 bg-yellow/5 border border-yellow/20 group-hover:border-yellow/50 group-hover:shadow-[0_0_15px_color-mix(in_srgb,var(--color-yellow)_30%,transparent)] flex items-center justify-center text-yellow shrink-0 relative transition-all duration-300">
            <BookOpen className="w-5 h-5 relative z-10 opacity-60 group-hover:opacity-100 group-hover:scale-110 group-hover:animate-pulse transition-all duration-300" />
          </div>
          <div className="flex flex-col relative z-10">
            <span className="block text-[9px] font-mono text-text-dim group-hover:text-yellow/80 tracking-widest mb-1 uppercase transition-colors duration-300">CODEX</span>
            <div className="flex items-baseline gap-2">
              <span className="text-xl font-heading font-bold text-white group-hover:drop-shadow-[0_0_8px_var(--color-yellow)] group-hover:text-yellow transition-all duration-300">{user ? textbooks.length : '---'}</span>
              <span className="text-[10px] font-mono text-yellow/60 group-hover:text-yellow transition-colors duration-300">ACTIVE</span>
            </div>
          </div>
        </div>

        {/* Stat 5: SYS_STATUS (Combined Streak & Progress) */}
        <div className="bg-black/60 border border-panel-border hover:border-white/50 p-3 relative group hover:bg-white/5 transition-all duration-300 flex items-center gap-3 overflow-hidden cursor-default">
          <CyberBrackets color="border-white/20 group-hover:border-white transition-colors duration-300" />
          <div className="absolute left-0 top-0 w-1 h-full bg-white scale-y-0 group-hover:scale-y-100 origin-center transition-transform duration-300 ease-out shadow-[0_0_10px_var(--color-white)]" />
          <div className="absolute inset-0 -translate-x-[150%] group-hover:translate-x-[150%] bg-gradient-to-r from-transparent via-white/10 to-transparent transition-transform duration-700 ease-out pointer-events-none" />
          
          {/* Left Icon: Circular Progress (No Text) */}
          <div className="w-10 h-10 relative flex items-center justify-center shrink-0">
            <svg className="absolute inset-0 w-full h-full -rotate-90">
              <circle cx="20" cy="20" r="16" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="2" />
              <circle cx="20" cy="20" r="16" fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="2" 
                strokeDasharray="100.5" strokeDashoffset={user ? (100.5 - (sysProgressPercent / 100) * 100.5) : 100.5}
                strokeLinecap="round"
                className="group-hover:stroke-white group-hover:drop-shadow-[0_0_8px_rgba(255,255,255,0.8)] transition-all duration-1000 ease-out" 
              />
            </svg>
            <Activity className="absolute w-4 h-4 text-white/50 group-hover:text-white group-hover:scale-110 group-hover:animate-pulse transition-all duration-300" />
          </div>

          {/* Right Content: Dual Rows */}
          <div className="flex flex-col relative z-10 w-full pr-1">
            {/* Row 1: STREAK */}
            <div className="flex items-center justify-between w-full mb-1">
              <span className="text-[9px] font-mono text-white/50 group-hover:text-white/80 transition-colors uppercase tracking-widest">STREAK</span>
              <div className="flex items-baseline gap-1">
                <span className="text-sm font-heading font-bold text-white/70 group-hover:drop-shadow-[0_0_5px_var(--color-white)] group-hover:text-white transition-all">{user ? (userProgress?.currentStreak || 0) : '---'}</span>
                <span className="text-[8px] font-mono text-white/30 group-hover:text-white/70 transition-colors">CYC</span>
              </div>
            </div>

            {/* Divider */}
            <div className="w-full h-[1px] bg-white/10 group-hover:bg-white/30 mb-1 transition-colors"></div>

            {/* Row 2: PROGRESS */}
            <div className="flex items-center justify-between w-full">
              <span className="text-[9px] font-mono text-white/50 group-hover:text-white/80 transition-colors uppercase tracking-widest">PROGRESS</span>
              <div className="flex items-baseline gap-1">
                <span className="text-sm font-heading font-bold text-white/70 group-hover:drop-shadow-[0_0_5px_var(--color-white)] group-hover:text-white transition-all">{user ? sysProgressPercent : '--'}</span>
                <span className="text-[8px] font-mono text-white/30 group-hover:text-white/70 transition-colors">%</span>
              </div>
            </div>
          </div>
        </div>
        
      </div>
          
          {/* TABS AND MAP */}
          <div className="flex-1 flex gap-4 min-h-0">
            {/* Left column: Tabbed navigation */}
        <div className="flex-shrink-0 w-full lg:w-[320px] flex flex-col min-h-0 bg-black/40 border border-panel-border relative">
          <CyberBrackets color="border-white/10" />

          {/* Tab bar */}
          <div className="flex flex-shrink-0 border-b border-panel-border">
            {[
              { id: "nebulas", label: "NEBULAS", sub: "Topics", accent: "turquoise", defaultTarget: { x: 7500, y: 2500, scale: 0.2, mapId: topics.length > 0 ? topics[0].id : undefined } },
              { id: "rogue", label: "ROGUE", sub: "Papers", accent: "purple", defaultTarget: { x: 8250, y: 3500, scale: 0.2, mapId: "standalone_articles" } },
              { id: "codex", label: "MODULES", sub: "Textbooks", accent: "orange", defaultTarget: { x: 7500, y: 2500, scale: 0.2, mapId: undefined } },
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
                    ? tab.id === "nebulas" ? "text-turquoise border-turquoise bg-turquoise/5" : tab.id === "rogue" ? "text-purple border-purple bg-purple/5" : tab.id === "codex" ? "text-orange border-orange bg-orange/5" : "text-white border-white bg-white/5"
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
                    articles.map((article, idx) => (
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
              topics.map((topic, idx) => (
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
              rogueArticles.map((article, idx) => (
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
                        <span className="text-text-dim">STATUS: <span className={`font-bold ${progressSummary?.standalone[article.id] ? 'text-white' : 'text-text-dim'}`}>{progressSummary?.standalone[article.id] ? 'DECODED' : 'DETECTED'}</span></span>
                      </div>
                      <Link href={`/articles/${article.slug}`} onClick={e => e.stopPropagation()} className="text-[10px] font-mono font-bold text-purple tracking-wider flex items-center gap-1 group-hover:translate-x-1 transition-transform duration-300">
                        INTERCEPT <Rocket className="w-3 h-3" />
                      </Link>
                    </div>
                  </div>
                </div>
              ))
            )}

            {/* CODEX tab */}
            {activeTab === "codex" && (
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
              <Link href="/login">
                <button className="px-3 py-1.5 border border-system/30 hover:border-system bg-system/5 hover:bg-system/20 text-system text-[10px] font-mono tracking-widest uppercase transition-colors flex items-center gap-2">
                  <Cpu className="w-3 h-3" />
                  ESTABLISH
                </button>
              </Link>
            )}
          </div>
        </div>

        {/* Right column: Map preview */}
        <div className="flex-1 relative min-h-0 bg-black/60 border border-panel-border overflow-hidden">
          <CyberBrackets color="border-red/30" />
          <div className="absolute top-3 left-3 z-20 pointer-events-none">
            <span className="bg-black/90 text-red border border-red/30 px-2 py-0.5 text-[8px] font-mono tracking-widest uppercase">
              MAP_PREVIEW
            </span>
          </div>
          
          <div className="absolute inset-0">
            <CosmosMapPreview targetX={mapTarget.x} targetY={mapTarget.y} targetScale={mapTarget.scale} mapId={mapTarget.mapId} activeNodeId={mapTarget.activeNodeId} />
          </div>
        </div>
          </div>
        </div>


        {/* === COMMAND ZONE (RIGHT) === */}
        <div className="flex-shrink-0 w-full lg:w-[350px] flex flex-col gap-4 min-h-0">
          
          {/* LABS Panel */}
          <div 
            className={`flex flex-col bg-black/40 border border-panel-border relative transition-all duration-500 overflow-hidden group/panel ${activeCommandPanel === 'labs' ? 'flex-1 min-h-0' : 'h-[46px] shrink-0 cursor-pointer hover:bg-white/5 hover:border-white/30 hover:shadow-[0_0_15px_rgba(255,255,255,0.05)]'}`}
            onClick={() => { if (activeCommandPanel !== 'labs') setActiveCommandPanel('labs'); }}
          >
            <CyberBrackets color="border-white/10" />
            <div className="flex flex-shrink-0 border-b border-panel-border">
              <div className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 font-heading text-[11px] font-bold tracking-[0.12em] uppercase border-b-2 transition-colors duration-300 ${activeCommandPanel === 'labs' ? 'text-white border-white bg-white/5' : 'text-text-dim border-transparent group-hover/panel:text-white'}`}>
                <FlaskConical className={`w-4 h-4 transition-transform duration-500 ${activeCommandPanel === 'labs' ? 'text-white' : 'group-hover/panel:rotate-12'}`} />
                <div className="text-left">
                  LABS
                  {activeCommandPanel === 'labs' && <span className="block text-[8px] font-mono font-normal mt-0.5 opacity-50 normal-case tracking-wider">Playground</span>}
                </div>
              </div>
            </div>
            
            <div className={`flex-1 overflow-y-auto min-h-0 [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-thumb]:bg-white/20 uppercase tracking-wider transition-opacity duration-300 ${activeCommandPanel === 'labs' ? 'opacity-100' : 'opacity-0'}`}>
              {loadingModels ? (
                  <div className="p-4 text-white animate-pulse text-xs font-mono">SCANNING FOR MODELS...</div>
                ) : models.length === 0 ? (
                  <div className="p-4 text-text-dim text-xs font-mono">NO MODELS DETECTED</div>
                ) : (
                  models.map(model => (
                    <div key={model.id} className="group cursor-pointer border-b border-panel-border px-5 py-4 hover:bg-white/5 transition-all duration-300 relative overflow-hidden">
                      <div className="absolute left-0 top-0 w-1 h-full bg-white scale-y-0 group-hover:scale-y-100 origin-center transition-transform duration-300 ease-out shadow-[0_0_10px_var(--color-white)]" />
                      <div className="absolute inset-0 -translate-x-[150%] group-hover:translate-x-[150%] bg-gradient-to-r from-transparent via-white/10 to-transparent transition-transform duration-700 ease-out pointer-events-none" />
                      
                      <div className="relative z-10">
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="font-heading text-sm font-bold text-white group-hover:text-white group-hover:drop-shadow-[0_0_8px_var(--color-white)] transition-all duration-300 tracking-wide uppercase">{model.name}</h3>
                          <div className="text-[9px] font-mono bg-white/10 text-white px-1.5 py-0.5 border border-white/20">{model.taskType.replace(/_/g, ' ')}</div>
                        </div>
                        <p className="text-text-dim text-xs font-mono leading-relaxed normal-case line-clamp-2 mb-4">
                          &gt; {model.description}
                        </p>
                        <div className="flex justify-between items-center border-t border-panel-border pt-3">
                          <span className="text-[10px] text-text-dim font-mono">v{model.version} // {model.format.toUpperCase()}</span>
                          <Link href={`/playground/${model.id}`} className="text-[10px] font-mono font-bold text-white tracking-wider flex items-center gap-1 group-hover:translate-x-1 transition-transform duration-300">
                            INIT_RUNTIME <Cpu className="w-3 h-3" />
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))
                )}
            </div>
          </div>

          {/* ASSISTANT Panel */}
          <div 
            className={`flex flex-col bg-black/40 border border-panel-border relative transition-all duration-500 overflow-hidden group/panel ${activeCommandPanel === 'assistant' ? 'flex-1 min-h-0' : 'h-[46px] shrink-0 cursor-pointer hover:bg-system/10 hover:border-system/50 hover:shadow-[0_0_15px_var(--color-system)]'}`}
            onClick={() => { if (activeCommandPanel !== 'assistant') setActiveCommandPanel('assistant'); }}
          >
            <CyberBrackets color="border-white/10" />
            
            <div className="flex flex-shrink-0 border-b border-panel-border">
              <div className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 text-left font-heading text-[11px] font-bold tracking-[0.12em] uppercase border-b-2 transition-colors duration-300 ${activeCommandPanel === 'assistant' ? 'text-system border-system bg-system/5' : 'text-text-dim border-transparent group-hover/panel:text-system'}`}>
                <Bot className={`w-4 h-4 transition-all duration-500 ${activeCommandPanel === 'assistant' ? 'animate-pulse text-system' : 'group-hover/panel:scale-110 group-hover/panel:text-system'}`} />
                <div className="text-left">
                  ASSISTANT
                  {activeCommandPanel === 'assistant' && <span className="block text-[8px] font-mono font-normal mt-0.5 opacity-50 normal-case tracking-wider">AI Uplink</span>}
                </div>
              </div>
            </div>

            <div className={`flex-1 flex flex-col overflow-y-auto min-h-0 [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-thumb]:bg-white/20 transition-opacity duration-300 ${activeCommandPanel === 'assistant' ? 'opacity-100' : 'opacity-0'}`}>
              <div className="flex-1 flex flex-col p-4">
                {/* Mock Chat UI */}
                <div className="flex-1 flex flex-col gap-4 overflow-y-auto min-h-0">
                  <div className="group relative overflow-hidden border border-system/30 bg-system/5 p-4 transition-all duration-300">
                    <div className="absolute left-0 top-0 w-1 h-full bg-system shadow-[0_0_10px_var(--color-system)]" />
                    <div className="relative z-10 text-xs font-mono text-system leading-relaxed">
                      &gt; SYSTEM_AI_ONLINE
                      <br />
                      &gt; Awaiting operator input...
                    </div>
                  </div>
                </div>
                
                <div className="mt-4 pt-3 border-t border-panel-border relative shrink-0">
                  <input type="text" placeholder="ENTER QUERY..." className="w-full bg-black/50 border border-panel-border text-white text-[10px] tracking-wider font-mono px-3 py-2.5 focus:outline-none focus:border-system transition-colors" />
                  <TerminalSquare className="w-3 h-3 absolute right-3 top-[26px] text-text-dim" />
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
