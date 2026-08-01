"use client";

import React, { useEffect, useRef } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import mermaid from "mermaid";
import "katex/dist/katex.min.css";

import { Minimize2, Maximize2 } from "lucide-react";

interface MarkdownRendererProps {
  content: string;
}

function getHeadingId(children: any): string {
  const text = React.Children.toArray(children)
    .reduce((str: string, child: any) => {
      if (typeof child === 'string') return str + child;
      if (React.isValidElement(child) && (child as React.ReactElement<any>).props.children) {
        return str + getHeadingId((child as React.ReactElement<any>).props.children);
      }
      return str;
    }, '');
  return text.toLowerCase().replace(/[^\w]+/g, '-');
}

export default function MarkdownRenderer({ content }: MarkdownRendererProps) {
  const [isTocExpanded, setIsTocExpanded] = React.useState(true);

  const toc = React.useMemo(() => {
    const headings = [];
    const regex = /^(#{2,3})\s+(.+)$/gm; // Only H2 and H3 for TOC
    let match;
    while ((match = regex.exec(content)) !== null) {
      // Clean up markdown syntax like **bold** in TOC text
      const cleanText = match[2].replace(/[*_`]/g, '');
      headings.push({
        level: match[1].length,
        text: cleanText,
        id: cleanText.toLowerCase().replace(/[^\w]+/g, '-')
      });
    }
    return headings;
  }, [content]);

  useEffect(() => {
    mermaid.initialize({
      startOnLoad: false,
      theme: "dark",
      securityLevel: "loose",
    });
  }, []);

  return (
    <div className="w-full">
      {toc.length > 0 && (
        <div className={`mb-10 border border-system/20 bg-black/40 transition-all duration-300 ${isTocExpanded ? 'w-full' : 'w-fit float-right ml-6 mb-6'}`}>
          <div className="flex items-center justify-between p-3 border-b border-system/20 bg-system/5">
            <h6 className="text-system font-heading font-bold text-xs tracking-widest uppercase m-0 pr-6">Mục lục</h6>
            <button onClick={() => setIsTocExpanded(!isTocExpanded)} className="text-text-dim hover:text-system transition-colors">
              {isTocExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>
          </div>
          {isTocExpanded && (
            <div className="p-4 bg-black/60">
              <ul className="space-y-2 m-0 list-none pl-0">
                {toc.map((h, i) => (
                  <li key={i} className={`${h.level === 3 ? 'pl-4' : ''}`}>
                    <a href={`#${h.id}`} className="text-sm font-mono text-text-dim hover:text-system flex items-start gap-2 transition-colors">
                      <span className="text-system/50 mt-1 text-[8px]">■</span>
                      <span>{h.text}</span>
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      <div className="prose dark:prose-invert prose-slate dark:prose-zinc prose-lg max-w-none clear-both">
        <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkMath]}
        rehypePlugins={[rehypeKatex]}
        components={{
          h1: ({ node, children, ...props }) => <h1 id={getHeadingId(children)} className="text-3xl md:text-4xl font-heading font-black uppercase text-white mt-10 mb-6 drop-shadow-[0_0_8px_rgba(255,255,255,0.2)] scroll-mt-24" {...props}>{children}</h1>,
          h2: ({ node, children, ...props }) => <h2 id={getHeadingId(children)} className="text-2xl md:text-3xl font-heading font-bold uppercase text-system mt-10 mb-4 border-b border-panel-border pb-2 shadow-[0_1px_0_color-mix(in_srgb,var(--color-system)_30%,transparent)] scroll-mt-24" {...props}>{children}</h2>,
          h3: ({ node, children, ...props }) => <h3 id={getHeadingId(children)} className="text-xl md:text-2xl font-heading font-bold uppercase text-white mt-8 mb-4 flex items-center gap-2 scroll-mt-24"><span className="text-system opacity-50">&gt;</span> <span {...props}>{children}</span></h3>,
          p: ({ node, ...props }) => <p className="text-base font-sans text-text-main leading-relaxed mb-6" {...props} />,
          ul: ({ node, ...props }) => <ul className="list-disc list-outside space-y-2 mb-6 text-text-main pl-6 marker:text-system" {...props} />,
          ol: ({ node, ...props }) => <ol className="list-decimal list-outside space-y-2 mb-6 text-text-main pl-6 marker:text-system marker:font-mono" {...props} />,
          li: ({ node, ...props }) => <li className="text-base text-text-main" {...props} />,
          a: ({ node, ...props }) => <a className="text-system border-b border-system/30 hover:border-system hover:bg-system/10 transition-colors" {...props} />,
          blockquote: ({ node, className, children, ...props }) => (
             <blockquote {...props} className={`border-l-2 border-system pl-5 italic text-text-dim my-6 bg-system/5 py-3 pr-4 font-mono text-sm relative ${className || ''}`}>
               <span className="absolute top-0 left-0 w-2 h-2 border-t border-l border-system"></span>
               <span className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-system"></span>
               {children}
             </blockquote>
          ),
          strong: ({ node, ...props }) => <strong className="font-bold text-white drop-shadow-[0_0_5px_rgba(255,255,255,0.3)]" {...props} />,
          em: ({ node, ...props }) => <em className="italic text-text-main font-mono text-sm" {...props} />,
          img: ({ node, alt, src, ...props }) => {
            return (
              <figure className="my-10 flex flex-col items-center relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-system/20 via-transparent to-system/20 opacity-0 group-hover:opacity-100 transition-opacity blur-md z-0" />
                <div className="relative z-10 border border-panel-border bg-black/60 p-1">
                  <img src={src} alt={alt} className="w-full max-w-3xl object-contain opacity-90 group-hover:opacity-100 transition-opacity" {...props} />
                </div>
                {alt && (
                  <figcaption className="mt-4 text-xs font-mono text-system tracking-widest text-center uppercase bg-system/10 border border-system/20 px-3 py-1">
                    [ IMG_CAPTION: {alt} ]
                  </figcaption>
                )}
              </figure>
            );
          },
          code: CodeBlock
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
    </div>
  );
}

function CodeBlock({ node, className, children, ...props }: any) {
  const [copied, setCopied] = React.useState(false);
  const match = /language-(\w+)/.exec(className || "");
  const isMermaid = match && match[1] === "mermaid";
  
  if (isMermaid) {
    return <MermaidBlock chart={String(children).replace(/\n$/, "")} />;
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(String(children));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return match ? (
    <div className="relative group my-6 rounded-lg overflow-hidden border border-black/10 dark:border-white/10">
      <div className="absolute top-0 w-full px-4 py-2 bg-black/5 dark:bg-white/5 border-b border-black/10 dark:border-white/10 flex items-center justify-between text-xs font-mono text-gray-500">
        <span>{match[1]}</span>
        <button onClick={handleCopy} className="hover:text-primary transition-colors">
          {copied ? "Copied! ✅" : "Copy"}
        </button>
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
}

function MermaidBlock({ chart }: { chart: string }) {
  const [svgContent, setSvgContent] = React.useState<string>("");

  useEffect(() => {
    let isMounted = true;
    
    const renderChart = async () => {
      try {
        const id = `mermaid-${Math.random().toString(36).substr(2, 9)}`;
        const { svg } = await mermaid.render(id, chart);
        if (isMounted) setSvgContent(svg);
      } catch (error) {
        console.error(error);
        if (isMounted) setSvgContent(`<div class="text-red-400 border border-red-400/20 p-4 rounded bg-red-400/10">Error: ${error}</div>`);
      }
    };
    
    renderChart();
    
    return () => { isMounted = false; };
  }, [chart]);

  return <div dangerouslySetInnerHTML={{ __html: svgContent }} className="my-8 flex justify-center w-full" />;
}
