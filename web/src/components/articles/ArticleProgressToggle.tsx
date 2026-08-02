"use client";

import { useState, useEffect } from "react";
import { CheckCircle2, XCircle, Cpu, Loader2 } from "lucide-react";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged, User } from "firebase/auth";
import CyberBrackets from "@/components/ui/CyberBrackets";
import Link from "next/link";

interface ArticleProgressToggleProps {
  articleId: string;
}

export default function ArticleProgressToggle({ articleId }: ArticleProgressToggleProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isCompleted, setIsCompleted] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        try {
          const token = await currentUser.getIdToken();
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
        }
      } else {
        setIsCompleted(null);
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [articleId]);

  const toggleStatus = async () => {
    if (!user || isCompleted === null) return;
    setIsUpdating(true);
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
      }
    } catch (e) {
      console.error("Failed to update progress", e);
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
      </div>

      <button 
        onClick={toggleStatus}
        disabled={isUpdating}
        className={`relative z-10 flex items-center gap-3 px-6 py-3 border font-mono text-xs tracking-widest uppercase transition-all duration-300 min-w-[220px] justify-center
          ${isCompleted 
            ? 'border-red/50 text-red hover:bg-red/10 hover:border-red' 
            : 'border-system/50 text-system bg-system/10 hover:bg-system/20 hover:border-system shadow-[0_0_15px_rgba(66,255,255,0.15)] hover:shadow-[0_0_20px_rgba(66,255,255,0.3)]'}
          ${isUpdating ? 'opacity-50 cursor-not-allowed' : ''}
        `}
      >
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
      </button>
    </div>
  );
}
