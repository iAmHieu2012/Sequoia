"use client";

import React, { useEffect, useRef } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import mermaid from "mermaid";
import "katex/dist/katex.min.css";

interface MarkdownRendererProps {
  content: string;
}

export default function MarkdownRenderer({ content }: MarkdownRendererProps) {
  useEffect(() => {
    mermaid.initialize({
      startOnLoad: false,
      theme: "dark",
      securityLevel: "loose",
    });
  }, []);

  return (
    <div className="prose dark:prose-invert prose-slate dark:prose-zinc prose-lg max-w-none">
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkMath]}
        rehypePlugins={[rehypeKatex]}
        components={{
          img: ({ node, alt, src, ...props }) => {
            return (
              <figure className="my-8 flex flex-col items-center">
                <img src={src} alt={alt} className="rounded-lg shadow-lg border border-white/10" {...props} />
                {alt && (
                  <figcaption className="mt-3 text-sm text-gray-400 italic text-center">
                    {alt}
                  </figcaption>
                )}
              </figure>
            );
          },
          code({ node, className, children, ...props }) {
            const match = /language-(\w+)/.exec(className || "");
            const isMermaid = match && match[1] === "mermaid";
            
            if (isMermaid) {
              return <MermaidBlock chart={String(children).replace(/\n$/, "")} />;
            }

            return match ? (
              <div className="relative group my-6 rounded-lg overflow-hidden border border-black/10 dark:border-white/10">
                <div className="absolute top-0 w-full px-4 py-2 bg-black/5 dark:bg-white/5 border-b border-black/10 dark:border-white/10 flex items-center justify-between text-xs font-mono text-gray-500">
                  <span>{match[1]}</span>
                  <button className="hover:text-primary transition-colors">Copy</button>
                </div>
                <div className="pt-10 pb-4 px-4 bg-black/5 dark:bg-white/5 overflow-x-auto">
                  <code className={className} {...props}>
                    {children}
                  </code>
                </div>
              </div>
            ) : (
              <code className="bg-primary/10 text-primary px-1.5 py-0.5 rounded font-mono text-sm" {...props}>
                {children}
              </code>
            );
          },
          p({ node, children, ...props }) {
            if (typeof children === 'string' && children.trim().startsWith('{{playground')) {
              const match = children.match(/model="([^"]+)"/);
              const modelId = match ? match[1] : "unknown-model";
              
              return (
                <div className="my-10 p-6 glass-card border-primary/30 relative overflow-hidden">
                  <div className="absolute top-0 right-0 px-3 py-1 bg-primary text-white text-xs font-bold rounded-bl-lg">
                    INTERACTIVE PLAYGROUND
                  </div>
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center text-2xl">
                       🚀
                    </div>
                    <div>
                      <h3 className="text-xl font-bold m-0 p-0 text-foreground">AI Model Inference</h3>
                      <p className="text-sm text-gray-500 m-0 p-0">Model: <span className="font-mono text-primary">{modelId}</span></p>
                    </div>
                  </div>
                  <div className="w-full aspect-video bg-black/10 dark:bg-black/50 rounded-lg border border-black/10 dark:border-white/10 flex flex-col items-center justify-center text-gray-500 gap-4 cursor-pointer hover:border-primary/50 transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="opacity-50"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>
                    <span>Click to initialize WebGL / LiteRT Runtime</span>
                  </div>
                </div>
              );
            }
            return <p {...props}>{children}</p>;
          }
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}

function MermaidBlock({ chart }: { chart: string }) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.innerHTML = "";
      
      const renderChart = async () => {
        try {
          const id = `mermaid-${Math.random().toString(36).substr(2, 9)}`;
          const { svg } = await mermaid.render(id, chart);
          if (containerRef.current) {
            containerRef.current.innerHTML = svg;
          }
        } catch (error) {
          console.error(error);
          if (containerRef.current) {
            containerRef.current.innerHTML = `<div class="text-red-400 border border-red-400/20 p-4 rounded bg-red-400/10">Error: ${error}</div>`;
          }
        }
      };
      
      renderChart();
    }
  }, [chart]);

  return <div ref={containerRef} className="my-8 flex justify-center w-full" />;
}
