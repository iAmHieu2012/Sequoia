"use client";

import React, { useEffect } from "react";
import Image from "next/image";
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

function getHeadingId(children: React.ReactNode): string {
  const text = React.Children.toArray(children)
    .reduce((str: string, child: React.ReactNode) => {
      if (typeof child === 'string') return str + child;
      if (React.isValidElement(child) && (child as React.ReactElement<{children?: React.ReactNode}>).props.children) {
        return str + getHeadingId((child as React.ReactElement<{children?: React.ReactNode}>).props.children);
      }
      return str;
    }, '');
  return text.toLowerCase().replace(/[^\w]+/g, '-');
}

export default function MarkdownRenderer({ content }: MarkdownRendererProps) {
  const [isTocExpanded, setIsTocExpanded] = React.useState(true);

  const toc = React.useMemo(() => {
    const headings = [];
    const contentWithoutCode = content.replace(/```[\s\S]*?```/g, '');
    const regex = /^(#{2,3})\s+(.+)$/gm;
    let match;
    while ((match = regex.exec(contentWithoutCode)) !== null) {
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
    <div className="w-full normal-case tracking-normal">
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

      <div className="w-full clear-both text-text-main font-sans text-base">
        <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkMath]}
        rehypePlugins={[[rehypeKatex, { strict: false }]]}
        components={{
          h1: ({ children, ...props }) => <h1 id={getHeadingId(children)} className="text-3xl md:text-4xl font-heading font-black uppercase text-white mt-10 mb-6 drop-shadow-[0_0_8px_rgba(255,255,255,0.2)] scroll-mt-24" {...props}>{children}</h1>,
          h2: ({ children, ...props }) => <h2 id={getHeadingId(children)} className="text-2xl md:text-3xl font-heading font-bold uppercase text-system mt-10 mb-4 border-b border-panel-border pb-2 shadow-[0_1px_0_color-mix(in_srgb,var(--color-system)_30%,transparent)] scroll-mt-24" {...props}>{children}</h2>,
          h3: ({ children, ...props }) => <h3 id={getHeadingId(children)} className="text-xl md:text-2xl font-heading font-bold uppercase text-white mt-8 mb-4 flex items-center gap-2 scroll-mt-24" {...props}><span className="text-system opacity-50">&gt;</span> <span>{children}</span></h3>,
          p: ({ node, children, ...rest }) => {
            // React-markdown wraps images in <p> tags. 
            // Rendering <figure> inside <p> causes hydration errors.
            // We check if the paragraph contains an image, and if so, render a <div> instead.
            type HastNode = { tagName?: string; children?: HastNode[] };
            const nodeElement = node as HastNode | undefined;
            const hasImage = nodeElement?.children?.some((child) => child.tagName === 'img');
            if (hasImage) {
              return <div className="mb-6 w-full" {...rest}>{children}</div>;
            }
            return <p className="text-base font-sans text-text-main leading-relaxed mb-6" {...rest}>{children}</p>;
          },
          ul: ({ ...props }) => <ul className="list-disc list-outside space-y-2 mb-6 text-text-main pl-6 marker:text-system" {...props} />,
          ol: ({ ...props }) => <ol className="list-decimal list-outside space-y-2 mb-6 text-text-main pl-6 marker:text-system marker:font-mono" {...props} />,
          li: ({ ...props }) => <li className="text-base text-text-main" {...props} />,
          a: ({ ...props }) => <a className="text-system border-b border-system/30 hover:border-system hover:bg-system/10 transition-colors" {...props} />,
          blockquote: ({ className, children, ...props }) => (
             <blockquote {...props} className={`border-l-2 border-system pl-5 italic text-text-dim my-6 bg-system/5 py-3 pr-4 font-mono text-sm relative ${className || ''}`}>
               <span className="absolute top-0 left-0 w-2 h-2 border-t border-l border-system"></span>
               <span className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-system"></span>
               {children}
             </blockquote>
          ),
          strong: ({ ...props }) => <strong className="font-bold text-white drop-shadow-[0_0_5px_rgba(255,255,255,0.3)]" {...props} />,
          em: ({ ...props }) => <em className="italic text-text-main font-mono text-sm" {...props} />,
          img: ({ alt, src }) => {
            return (
              <figure className="my-10 flex flex-col items-center relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-system/20 via-transparent to-system/20 opacity-0 group-hover:opacity-100 transition-opacity blur-md z-0" />
                <div className="relative z-10 border border-panel-border bg-black/60 p-1 w-full">
                  <Image 
                    src={(src as string) || ''} 
                    alt={alt || ''} 
                    width={0} 
                    height={0} 
                    sizes="100vw" 
                    unoptimized 
                    style={{ width: '100%', height: 'auto' }} 
                    className="max-w-3xl object-contain opacity-90 group-hover:opacity-100 transition-opacity" 
                  />
                </div>
                {alt && (
                  <figcaption className="mt-4 text-xs font-mono text-system tracking-widest text-center uppercase bg-system/10 border border-system/20 px-3 py-1">
                    [ IMG_CAPTION: {alt} ]
                  </figcaption>
                )}
              </figure>
            );
          },
          pre: ({ children, ...props }) => <pre className="p-0 m-0 bg-transparent" {...props}>{children}</pre>,
          code: CodeBlock as React.ElementType
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
    </div>
  );
}

interface CodeBlockProps extends React.HTMLAttributes<HTMLElement> {
  node?: unknown;
  inline?: boolean;
}

function CodeBlock({ className, children, ...props }: CodeBlockProps) {
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
    <div className="relative group my-6 border border-panel-border bg-black/80 font-mono shadow-[0_0_15px_rgba(0,0,0,0.5)]">
      <div className="absolute top-0 w-full px-4 py-2 bg-system/10 border-b border-system/30 flex items-center justify-between text-[10px] uppercase tracking-widest text-system z-10">
        <span>[ {match[1]} ]</span>
        <button onClick={handleCopy} className="hover:text-white transition-colors flex items-center gap-2">
          {copied ? "COPIED_TO_CLIPBOARD" : "COPY_CODE"}
        </button>
      </div>
      <div className="pt-12 pb-4 px-4 overflow-x-auto text-sm text-text-main relative z-0">
        <code className={className} {...props}>
          {children}
        </code>
      </div>
    </div>
  ) : (
    <code className="bg-system/10 text-system border border-system/20 px-1.5 py-0.5 font-mono text-sm uppercase tracking-wider" {...props}>
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
