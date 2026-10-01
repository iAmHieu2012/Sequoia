"use client";

import { useState, useEffect } from "react";
import { CheckCircle2, XCircle, Cpu, Loader2, AlertTriangle } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import Link from "next/link";
import { UserService } from "@/services/user.service";
import { ArticleService } from "@/services/article.service";
import CyberPanel from "@/components/ui/CyberPanel";

interface ArticleProgressToggleProps {
  /** The unique identifier of the article */
  article_id: string;
}

/**
 * A cyberpunk-themed interactive button that allows authenticated users to 
 * mark an article as completed (decoded) or revert its status.
 */
export default function ArticleProgressToggle({ article_id }: ArticleProgressToggleProps) {
  const { user, loading: authLoading } = useAuth();
  const [isCompleted, setIsCompleted] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading) return;
    
    if (user) {
      let isMounted = true;
      const fetchProgress = async () => {
        try {
          const localDate = new Date().toLocaleDateString('en-CA');
          const data = await UserService.getUserProgress(localDate);
          if (data && data.completed_article_ids && isMounted) {
            setIsCompleted(data.completed_article_ids.includes(article_id));
          } else if (isMounted) {
            setIsCompleted(false);
          }
        } catch (error) {
          console.error("Failed to fetch progress", error);
          if (isMounted) setIsCompleted(false);
        } finally {
          if (isMounted) setIsLoading(false);
        }
      };
      fetchProgress();
      return () => { isMounted = false; };
    }
  }, [article_id, user, authLoading]);

  const toggleStatus = async () => {
    if (!user || isCompleted === null) return;
    setIsUpdating(true);
    setErrorMsg(null);
    try {
      const targetStatus = !isCompleted;
      await ArticleService.updateArticleProgress(article_id, targetStatus);
      setIsCompleted(targetStatus);
    } catch (error) {
      console.error("Failed to update progress", error);
      setErrorMsg("SYS_ERR: NEURAL UPLINK DISCONNECTED");
    } finally {
      setIsUpdating(false);
    }
  };

  if (!authLoading && !user) {
    return (
      <CyberPanel variant="outline" chamfer="tl-br" decorations="minimal" className="mt-16 p-8 flex flex-col items-center justify-center gap-4 w-full border-white/20">
        <Cpu className="w-8 h-8 text-white/30 mb-2" />
        <p className="text-xs font-mono text-white/50 uppercase tracking-widest text-center max-w-sm mb-4">
          Signal interception successful, but neural uplink is severed. Establish a connection to record your decoding progress.
        </p>
        <Link href="/auth">
          <button className="px-6 py-2 border border-teal-400 text-teal-400 hover:bg-teal-400/10 font-mono text-xs uppercase tracking-widest transition-all duration-300 clip-chamfer-tl-br">
            Initialize Uplink (Login)
          </button>
        </Link>
      </CyberPanel>
    );
  }

  if (authLoading || isLoading) {
    return (
      <CyberPanel variant="outline" chamfer="tl-br" decorations="minimal" className="mt-16 p-8 flex items-center justify-center w-full border-white/20">
        <Loader2 className="w-6 h-6 text-white/30 animate-spin" />
      </CyberPanel>
    );
  }

  return (
    <CyberPanel 
      variant="outline" 
      chamfer="tl-br" 
      decorations="brackets" 
      className={`mt-16 p-8 flex flex-col md:flex-row items-center justify-between gap-6 w-full transition-all duration-500 ${
        isCompleted ? 'border-teal-400/40 bg-teal-400/5' : 'border-white/20 bg-transparent'
      }`}
    >
      <div className="relative z-10 text-center md:text-left">
        <h4 className={`text-lg font-mono font-bold uppercase tracking-wider mb-2 text-white`}>
          {isCompleted ? 'DATAPAD DECODED' : 'SIGNAL INTERCEPTED'}
        </h4>
        <p className="text-xs font-mono text-white/50 max-w-md uppercase tracking-widest">
          {isCompleted 
            ? 'Transmission securely archived in your neural cortex. Access retained indefinitely.' 
            : 'Mark as decoded to synchronize this datapad with your Orbital Streak progression.'}
        </p>
        {errorMsg && (
          <div className="mt-3 text-xs font-mono text-coral uppercase tracking-widest flex items-center justify-center md:justify-start gap-2 bg-coral/10 border border-coral/30 px-3 py-1.5 w-fit">
            <AlertTriangle className="w-3 h-3" /> {errorMsg}
          </div>
        )}
      </div>

      <button 
        onClick={toggleStatus}
        disabled={isUpdating}
        className={`relative flex items-center justify-center gap-3 px-6 py-3 font-mono text-] font-bold tracking-widest uppercase transition-all duration-300 min-w-[200px] border clip-chamfer-tl-br
          ${isCompleted 
            ? 'border-coral/50 text-coral hover:bg-coral/10 hover:border-coral' 
            : 'border-teal-400/50 text-teal-400 hover:bg-teal-400/10 hover:border-teal-400'}
          ${isUpdating ? 'opacity-50 cursor-not-allowed' : ''}
        `}
      >
        <span className="relative z-10 flex items-center gap-3 transition-all duration-300">
          {isUpdating ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : isCompleted ? (
            <>
              <XCircle className="w-4 h-4" /> REVERT STATUS
            </>
          ) : (
            <>
              <CheckCircle2 className="w-4 h-4" /> MARK DECODED
            </>
          )}
        </span>
      </button>
    </CyberPanel>
  );
}
