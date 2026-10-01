"use client";

import React, { useState, useRef } from "react";
import { TerminalSquare, X, Send, BotMessageSquare } from "lucide-react";
import CyberBrackets from "@/components/ui/CyberBrackets";
import CyberInput from "@/components/ui/CyberInput";
import { useChat } from "@ai-sdk/react";
import type { UIMessage } from "ai";
import { DefaultChatTransport } from "ai";
import MarkdownRenderer from "@/components/ui/MarkdownRenderer";
import Image from "next/image";

interface AiAssistantProps {
  /** Controls whether the chat panel is expanded or collapsed */
  isOpen: boolean;
  /** State setter to toggle the panel's visibility */
  setIsOpen: (open: boolean) => void;
}

/**
 * A cyberpunk-themed AI Assistant chat interface using Vercel AI SDK.
 * Integrates with the backend `/api/chat` route to stream responses from Google Gemini.
 * Renders AI responses using the advanced MarkdownRenderer.
 */
export default function AiAssistant({ isOpen, setIsOpen }: AiAssistantProps) {
  const [input, setInput] = useState('');
  const [modelId, setModelId] = useState('gemini-3.5-flash-lite');
  const pendingModelRef = useRef(modelId);
  const [messageModels, setMessageModels] = useState<Record<string, string>>({});
  const pulseTimerRef = useRef<NodeJS.Timeout | null>(null);
  const [showPulse, setShowPulse] = useState(false);

  const { messages, sendMessage, status, error } = useChat({
    transport: new DefaultChatTransport({ api: '/api/chat' }),
    onFinish: () => {
      setShowPulse(true);
      if (pulseTimerRef.current) clearTimeout(pulseTimerRef.current);
      pulseTimerRef.current = setTimeout(() => setShowPulse(false), 3000);
    },
  });

  React.useEffect(() => {
    return () => { if (pulseTimerRef.current) clearTimeout(pulseTimerRef.current); };
  }, []);

  React.useEffect(() => {
    setMessageModels(prev => {
      const next = { ...prev };
      let changed = false;
      messages.forEach((m: UIMessage) => {
        if (m.role === 'assistant' && !next[m.id]) {
          next[m.id] = pendingModelRef.current;
          changed = true;
        }
      });
      return changed ? next : prev;
    });
  }, [messages]);

  const isLoading = status === 'streaming';
  
  const botState = isLoading
    ? '/bot-loading.gif'
    : error
    ? '/bot-negative.gif'
    : showPulse
    ? '/bot-positive.gif'
    : '/bot-idle.gif';
  
  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    pendingModelRef.current = modelId;
    sendMessage({ text: input }, { body: { modelId } });
    setInput('');
  };

  return (
    <div 
      className={`flex flex-col bg-black/40 border border-white/10 relative transition-all duration-500 overflow-hidden group/panel ${isOpen ? 'flex-1 min-h-0' : 'h-[46px] shrink-0 cursor-pointer hover:bg-white/10 hover:border-white/40'}`}
      onClick={() => { if (!isOpen) setIsOpen(true); }}
    >
      <CyberBrackets color={`transition-colors duration-300 ${isOpen ? 'border-white/10' : 'border-white/10 group-hover/panel:border-white/40'}`} />
      
      {!isOpen && (
        <>
          <div className="absolute left-0 top-0 w-1 h-full bg-white scale-y-0 group-hover/panel:scale-y-100 origin-center transition-transform duration-300 ease-out shadow-[0_0_10px_rgba(255,255,255,0.8)]" />
          <div className="absolute inset-0 -translate-x-[150%] group-hover/panel:translate-x-[150%] bg-gradient-to-r from-transparent via-white/10 to-transparent transition-transform duration-700 ease-out pointer-events-none" />
        </>
      )}
      
      <div 
        className={`hidden lg:flex flex-shrink-0 border-b border-white/10 relative z-10 transition-colors ${isOpen ? 'cursor-pointer hover:bg-white/10' : ''}`}
        onClick={(e) => {
          if (isOpen) {
            e.stopPropagation();
            setIsOpen(false);
          }
        }}
      >
        <div className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 text-left font-mono text-xs font-bold tracking-[0.12em] uppercase border-b-2 transition-all duration-300 ${isOpen ? 'text-white border-white bg-white/10 drop-shadow-[0_0_8px_rgba(255,255,255,0.8)]' : 'text-white/40 border-transparent group-hover/panel:text-white group-hover/panel:drop-shadow-[0_0_8px_rgba(255,255,255,0.8)]'}`}>
          <BotMessageSquare className={`w-8 h-8 transition-all duration-500 ${!isOpen && 'group-hover/panel:scale-110 opacity-70 group-hover/panel:opacity-100'}`} />
          <div className="text-left">
            ASSISTANT
            {isOpen && <span className="block text-xs font-mono font-normal mt-0.5 opacity-40 normal-case tracking-wider">AI Uplink</span>}
          </div>
          {isOpen && <X className="w-4 h-4 ml-auto text-white/40 hover:text-white transition-colors" />}
        </div>
      </div>

      <div className={`flex-1 flex flex-col overflow-hidden min-h-0 transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0'}`}>
        <div className="flex-1 flex flex-col p-4 max-w-5xl mx-auto w-full min-h-0">
          <div className="flex-1 flex flex-col gap-4 overflow-y-auto min-h-0 pb-4">
            <div className="group relative overflow-hidden border border-white/40 bg-white/10 p-4 transition-all duration-300 shrink-0">
              <div className="absolute left-0 top-0 w-1 h-full bg-white shadow-[0_0_10px_rgba(255,255,255,0.8)]" />
              <div className="relative z-10 text-xs font-mono text-white leading-relaxed">
                &gt; SYSTEM_AI_ONLINE
                <br />
                &gt; Awaiting operator input...
              </div>
            </div>
            
            {messages.map((m: UIMessage, index: number) => (
              <div key={`${m.id}-${index}`} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`group relative overflow-hidden border p-3 transition-all duration-300 max-w-[85%] ${m.role === 'user' ? 'border-white/10 bg-transparent text-right' : 'border-white/40 bg-white/10'}`}>
                  <div className={`absolute top-0 w-1 h-full ${m.role === 'user' ? 'right-0 bg-white/40 shadow-[0_0_10px_rgba(255,255,255,0.4)]' : 'left-0 bg-white shadow-[0_0_10px_rgba(255,255,255,0.8)]'}`} />
                  <div className={`relative z-10 text-xs font-mono whitespace-pre-wrap ${m.role === 'user' ? 'text-white pr-2 leading-relaxed' : 'text-white pl-2'}`}>
                    <div className={`opacity-40 text-xs mb-1 flex ${m.role === 'user' ? 'justify-end' : 'justify-between'}`}>
                      <span>&gt; {m.role === 'user' ? 'OPERATOR_QUERY' : 'SYSTEM_RESPONSE'}</span>
                      {m.role === 'assistant' && messageModels[m.id] && (
                        <span className="text-white/70">
                          [{messageModels[m.id] === 'gemini-3.5-flash' ? 'FLASH' : 'FLASH LITE'}]
                        </span>
                      )}
                    </div>
                    {m.parts.map((part, i: number) => {
                      switch (part.type) {
                        case 'text':
                          return m.role === 'user' ? (
                            <div key={`${m.id}-${i}`}>{part.text}</div>
                          ) : (
                            <div key={`${m.id}-${i}`} className="prose prose-invert prose-sm prose-p:font-sans prose-headings:font-sans prose-headings:tracking-normal prose-a:text-white max-w-none prose-pre:bg-black/70 prose-pre:border prose-pre:border-white/10 [&_p:first-child]:mt-0 [&_.prose>*:first-child]:mt-0">
                              <MarkdownRenderer content={part.text} />
                            </div>
                          );
                        default:
                          return null;
                      }
                    })}
                  </div>
                </div>
              </div>
            ))}
            
            {error && (
              <div className="flex justify-start mt-2">
                <div className="group relative overflow-hidden border p-3 transition-all duration-300 max-w-[85%] border-coral/40 bg-coral/10">
                  <div className="absolute top-0 w-1 h-full left-0 bg-coral shadow-[0_0_10px_var(--color-coral)]" />
                  <div className="relative z-10 text-xs font-mono text-coral pl-2">
                    <div className="font-bold mb-1">[SYSTEM ERROR]</div>
                    {error.message || error.toString()}
                  </div>
                </div>
              </div>
            )}
            
          </div>
          
          <div className="mt-2 pt-4 border-t border-white/40 relative shrink-0">
            {isOpen && (
              <div className="flex justify-between items-end mb-3 px-1">
                <div className="flex flex-col">
                  <span className="text-xs font-mono text-white/40 tracking-widest mb-1">SYS_STATUS</span>
                  <div className="flex items-center gap-2">
                    <Image src={botState} alt="AI Bot" width={20} height={20} unoptimized className="object-contain" />
                    <span className="text-xs font-mono text-white tracking-widest flex items-center gap-2">
                      {isLoading ? 'PROCESSING' : 'AWAITING_INPUT'}
                      <span className="w-2 h-2 bg-teal shadow-[0_0_8px_var(--color-teal)] animate-pulse" />
                    </span>
                  </div>
                </div>
                
                <div className="relative group flex items-center">
                  <CyberBrackets color="border-white/40 group-hover:border-white/70 transition-colors" />
                  <div className="bg-black/70 border border-white/10 relative z-10 flex items-center p-0.5">
                    <button
                      type="button"
                      onClick={() => setModelId('gemini-3.5-flash-lite')}
                      className={`px-3 py-1 cursor-pointer text-xs font-mono transition-all ${modelId === 'gemini-3.5-flash-lite' ? 'bg-white/10 text-white shadow-[0_0_10px_rgba(255,255,255,0.8)]' : 'text-white/40 hover:text-white/70'}`}
                    >
                      FLASH LITE
                    </button>
                    <button
                      type="button"
                      onClick={() => setModelId('gemini-3.5-flash')}
                      className={`px-3 py-1 cursor-pointer text-xs font-mono transition-all ${modelId === 'gemini-3.5-flash' ? 'bg-white/10 text-white shadow-[0_0_10px_rgba(255,255,255,0.8)]' : 'text-white/40 hover:text-white/70'}`}
                    >
                      FLASH
                    </button>
                  </div>
                </div>
              </div>
            )}
            <form onSubmit={onSubmit} className="relative group mt-1">
              <CyberInput 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                disabled={isLoading}
                placeholder="[ ENTER_QUERY ]" 
                icon={TerminalSquare}
                className="!pr-12"
              />
              <button 
                type="submit" 
                disabled={isLoading} 
                className="absolute right-3 top-1/2 -translate-y-1/2 z-20 text-white/40 hover:text-white hover:drop-shadow-[0_0_5px_rgba(255,255,255,0.8)] transition-all cursor-pointer"
              >
                <Send className={`w-4 h-4 ${isLoading ? 'animate-pulse text-white' : ''}`} />
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
