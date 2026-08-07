"use client";

import { useState, useEffect } from "react";
import { CheckCircle2, XCircle, Cpu, Loader2, AlertTriangle } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import CyberBrackets from "@/components/ui/CyberBrackets";
import Link from "next/link";

interface ArticleProgressToggleProps {
  articleId: string;
}

export default function ArticleProgressToggle({ articleId }: ArticleProgressToggleProps) {
  const { user, loading: authLoading } = useAuth();
  const [isCompleted, setIsCompleted] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading) return;
    
    if (user) {
      const fetchProgress = async () => {
        try {
          const token = await user.getIdToken();
          const localDate = new Date().toLocaleDateString('en-CA');
          const res = await fetch(`/api/v1/users/progress?localDate=${localDate}`, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          const json = await res.json();
          if (json.data && json.data.completedArticleIds) {
            setIsCompleted(json.data.completedArticleIds.includes(articleId));
          } else {
            setIsCompleted(false);
          }
        } catch (e) {
          console.error("Failed to fetch progress", e);
          setIsCompleted(false);
        } finally {
          setIsLoading(false);
        }
      };
      fetchProgress();
    } else {
      setIsCompleted(null);
      setIsLoading(false);
    }
  }, [articleId, user, authLoading]);

  const toggleStatus = async () => {
    if (!user || isCompleted === null) return;
    setIsUpdating(true);
    setErrorMsg(null);
    try {
      const token = await user.getIdToken();
      const targetStatus = !isCompleted;
      const res = await fetch(`/api/v1/articles/${articleId}/progress`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ completed: targetStatus })
      });
      
      if (res.ok) {
        setIsCompleted(targetStatus);
      } else {
        throw new Error("Failed to update status");
      }
    } catch (e) {
      console.error("Failed to update progress", e);
      setErrorMsg("SYS_ERR: NEURAL UPLINK DISCONNECTED");
    } finally {
      setIsUpdating(false);
    }
  };

  if (isLoading) {
    return (
      <div className="mt-16 p-8 border border-panel-border bg-black/40 flex items-center justify-center relative">
        <CyberBrackets color="border-system/20" />
        <Loader2 className="w-6 h-6 text-system animate-spin" />
      </div>
    );
  }

  // Nếu là Guest thì không hiện nút (hoặc hiện thông báo đăng nhập)
  if (!user) {
    return (
      <div className="mt-16 p-8 border border-panel-border bg-black/40 flex flex-col items-center justify-center relative gap-4">
        <CyberBrackets color="border-system/20" />
        <Cpu className="w-8 h-8 text-text-dim opacity-50 mb-2" />
        <p className="text-xs font-mono text-text-dim uppercase tracking-widest text-center max-w-sm">
          Signal interception successful, but neural uplink is severed. Establish a connection to record your decoding progress.
        </p>
        <Link 
          href="/auth" 
          className="mt-2 px-6 py-2 border border-system/50 text-system hover:bg-system/10 font-mono text-xs uppercase tracking-widest transition-all duration-300 shadow-[0_0_15px_rgba(66,255,255,0.05)] hover:shadow-[0_0_20px_rgba(66,255,255,0.2)]"
        >
          Initialize Uplink (Login)
        </Link>
      </div>
    );
  }

  return (
    <div className={`mt-16 p-8 border transition-all duration-500 relative flex flex-col md:flex-row items-center justify-between gap-6 ${isCompleted ? 'border-system/40 bg-system/5' : 'border-panel-border bg-black/60'}`}>
      <CyberBrackets color={isCompleted ? 'border-system/50' : 'border-white/10'} />
      
      <div className="relative z-10 text-center md:text-left">
        <h4 className={`text-lg font-heading font-bold uppercase tracking-wider mb-2 ${isCompleted ? 'text-system drop-shadow-[0_0_8px_rgba(66,255,255,0.4)]' : 'text-white'}`}>
          {isCompleted ? 'DATAPAD DECODED' : 'SIGNAL INTERCEPTED'}
        </h4>
        <p className="text-xs font-mono text-text-dim max-w-md">
          {isCompleted 
            ? 'Tài liệu này đã được lưu vào hệ thống thần kinh của bạn. Bạn có thể xem lại bất cứ lúc nào.' 
            : 'Đánh dấu hoàn thành để ghi nhận dữ liệu vào hồ sơ tiến trình (Orbital Streak) của bạn.'}
        </p>
        {errorMsg && (
          <div className="mt-3 text-[10px] font-mono text-coral uppercase tracking-widest flex items-center justify-center md:justify-start gap-2 bg-coral/10 border border-coral/30 px-3 py-1.5 w-fit">
            <AlertTriangle className="w-3 h-3" /> {errorMsg}
          </div>
        )}
      </div>

      <button 
        onClick={toggleStatus}
        disabled={isUpdating}
        className={`relative group overflow-hidden flex items-center justify-center gap-3 px-6 py-3 font-mono text-xs tracking-widest uppercase transition-all duration-300 min-w-[220px]
          ${isCompleted 
            ? 'text-coral bg-coral/5 hover:text-white hover:bg-coral/20' 
            : 'text-system bg-system/5 hover:text-white hover:bg-system/20'}
          ${isUpdating ? 'opacity-50 cursor-not-allowed' : ''}
        `}
      >
        <CyberBrackets color={`transition-colors duration-300 ${isCompleted ? 'border-coral/30 group-hover:border-coral' : 'border-system/30 group-hover:border-system'}`} />
        <div className={`absolute left-0 top-0 w-1 h-full scale-y-0 group-hover:scale-y-100 origin-center transition-transform duration-300 ease-out ${isCompleted ? 'bg-coral shadow-[0_0_10px_var(--color-coral)]' : 'bg-system shadow-[0_0_10px_var(--color-system)]'}`} />
        <div className={`absolute inset-0 -translate-x-[150%] group-hover:translate-x-[150%] bg-gradient-to-r from-transparent to-transparent transition-transform duration-700 ease-out pointer-events-none ${isCompleted ? 'via-coral/10' : 'via-system/10'}`} />
        
        <span className={`relative z-10 flex items-center gap-3 transition-all duration-300 ${isCompleted ? 'group-hover:drop-shadow-[0_0_8px_var(--color-coral)]' : 'group-hover:drop-shadow-[0_0_8px_var(--color-system)]'}`}>
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
    </div>
  );
}
