"use client";

import React, { useEffect } from "react";
import Image from "next/image";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import mermaid from "mermaid";
import "katex/dist/katex.min.css";
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
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

/**
 * Renders Markdown content with support for GFM, Math (KaTeX), Mermaid diagrams, and custom UI components.
 * Automatically generates a Table of Contents (TOC) from heading tags.
 */
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
    // Clean up any orphaned Mermaid error SVGs left in document.body from previous failed renders
    document.querySelectorAll('div[id^="dmermaid-"]').forEach((el) => {
      // Only remove if it's a direct child of body (temp element) and contains an error SVG
      if (el.parentElement === document.body && el.querySelector('svg[aria-roledescription="error"]')) {
        el.remove();
      }
    });

    mermaid.initialize({
      startOnLoad: false,
      theme: "dark",
      securityLevel: "loose",
      suppressErrorRendering: true,
    });
  }, []);

  return (
    <div className="w-full normal-case tracking-normal">
      {toc.length > 0 && (
        <div className={`mb-10 border border-white/10 bg-black/70 transition-all duration-300 ${isTocExpanded ? 'w-full' : 'w-fit float-right ml-6 mb-6'}`}>
          <div className="flex items-center justify-between p-3 border-b border-white/10 bg-white/10">
            <h6 className="text-white/40 font-mono font-bold text-xs tracking-widest uppercase m-0 pr-6">INDEX_TOC</h6>
            <button onClick={() => setIsTocExpanded(!isTocExpanded)} className="text-text-dim hover:text-white transition-colors">
              {isTocExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>
          </div>
          {isTocExpanded && (
            <div className="p-4 bg-black/100">
              <ul className="space-y-2 m-0 list-none pl-0">
                {toc.map((h, i) => (
                  <li key={i} className={`${h.level === 3 ? 'pl-4' : ''}`}>
                    <a href={`#${h.id}`} className="text-sm font-mono text-text-dim hover:text-white flex items-start gap-2 transition-colors">
                      <span className="text-white/40 mt-1 text-xs">■</span>
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
          h1: ({ children, ...props }) => (
            <h1 id={getHeadingId(children)} className="group text-4xl md:text-5xl font-sans font-black text-white mt-10 mb-8 tracking-tighter flex flex-col gap-2 relative scroll-mt-24" {...props}>
              <span className="font-mono text-[10px] text-white/40 tracking-[0.2em] uppercase font-normal">
              {" // PRIMARY_INDEX "}
              </span>
              <span>{children}</span>
            </h1>
          ),
          h2: ({ children, ...props }) => (
            <h2 id={getHeadingId(children)} className="group text-2xl md:text-3xl font-sans font-bold text-white mt-12 mb-6 flex items-center gap-4 tracking-tight scroll-mt-24" {...props}>
              <span className="font-mono text-white/40 text-xl font-normal">::</span>
              <span>{children}</span>
              <div className="flex-1 h-[1px] bg-gradient-to-r from-white/20 to-transparent"></div>
            </h2>
          ),
          h3: ({ children, ...props }) => (
            <h3 id={getHeadingId(children)} className="group text-xl md:text-2xl font-sans font-bold text-white mt-8 mb-4 flex items-center gap-3 tracking-tight border-l-2 border-white/40 pl-4 bg-gradient-to-r from-white/5 to-transparent py-1 scroll-mt-24" {...props}>
              <span>{children}</span>
            </h3>
          ),
          h4: ({ children, ...props }) => (
            <h4 id={getHeadingId(children)} className="text-sm md:text-base font-mono font-bold text-white/70 mt-8 mb-3 uppercase tracking-widest flex items-center gap-2 scroll-mt-24" {...props}>
              <span className="w-1.5 h-1.5 bg-white/40 inline-block shrink-0"></span>
              <span>{children}</span>
            </h4>
          ),
          h5: ({ children, ...props }) => <h5 id={getHeadingId(children)} className="text-base md:text-lg font-sans font-bold text-white/70 mt-4 mb-2 scroll-mt-24 tracking-tight" {...props}>{children}</h5>,
          h6: ({ children, ...props }) => <h6 id={getHeadingId(children)} className="text-sm md:text-base font-sans font-bold text-white/70 mt-4 mb-2 scroll-mt-24 tracking-tight" {...props}>{children}</h6>,
          hr: ({ ...props }) => <hr className="my-10 border-t border-white/10 shadow-[0_1px_0_rgba(255,255,255,0.05)]" {...props} />,
          p: ({ node, children, ...rest }) => {
            // React-markdown wraps block-level elements (images, math blocks, etc.) in <p> tags.
            // Rendering block elements like <div> or <figure> inside <p> is invalid HTML and causes hydration errors.
            // We check if the paragraph contains any block-level child, and if so, render a <div> instead.
            type HastNode = { tagName?: string; children?: HastNode[] };
            const nodeElement = node as HastNode | undefined;
            const inlineTags = new Set(['a', 'abbr', 'b', 'br', 'cite', 'code', 'em', 'i', 'kbd', 'mark', 'q', 's', 'small', 'span', 'strong', 'sub', 'sup', 'u', 'var', 'wbr']);
            const hasBlockChild = nodeElement?.children?.some(
              (child) => child.tagName && !inlineTags.has(child.tagName)
            );
            if (hasBlockChild) {
              return <div className="mb-6 w-full" {...rest}>{children}</div>;
            }
            return <p className="text-base font-sans text-text-main leading-relaxed mb-6" {...rest}>{children}</p>;
          },
          ul: ({ ...props }) => <ul className="list-disc list-outside space-y-2 mb-6 text-text-main pl-6 marker:text-white/40" {...props} />,
          ol: ({ ...props }) => <ol className="list-decimal list-outside space-y-2 mb-6 text-text-main pl-6 marker:text-white/40 marker:font-mono" {...props} />,
          li: ({ ...props }) => <li className="text-base text-text-main" {...props} />,
          a: ({ ...props }) => <a className="text-white font-bold border-b border-white/40 hover:border-white hover:bg-white/10 transition-colors" {...props} />,
          table: ({ ...props }) => <div className="w-full overflow-x-auto my-6 border border-white/10"><table className="w-full text-left border-collapse text-base" {...props} /></div>,
          thead: ({ ...props }) => <thead className="bg-white/10 text-white tracking-wide font-bold" {...props} />,
          tbody: ({ ...props }) => <tbody className="text-text-main divide-y divide-white/10" {...props} />,
          tr: ({ ...props }) => <tr className="hover:bg-white/10 transition-colors" {...props} />,
          th: ({ ...props }) => <th className="p-3 border-b border-white/10 font-bold" {...props} />,
          td: ({ ...props }) => <td className="p-3" {...props} />,
          blockquote: ({ className, children, ...props }) => {
            const childrenArray = React.Children.toArray(children);
            
            // Find the wrapper element containing the blockquote's content.
            // Since <p> is overridden as a custom function component above, its type is no longer the string 'p'.
            // We locate the first valid element that accepts 'children' props.
            const firstElement = childrenArray.find(
              (child) => React.isValidElement(child) && (child.props as { children?: React.ReactNode }).children
            ) as React.ReactElement<{ children?: React.ReactNode }> | undefined;
            
            if (firstElement && firstElement.props.children) {
              const pChildren = React.Children.toArray(firstElement.props.children);
              // Find the first valid text node to check for callout syntax
              const firstTextIndex = pChildren.findIndex(child => typeof child === 'string' && child.trim() !== '');
              
              if (firstTextIndex !== -1) {
                const firstText = pChildren[firstTextIndex] as string;
                
                // Match callout syntax e.g., "[!TYPE] Title", allowing leading whitespace
                const match = firstText.match(/^\s*\[!([a-zA-Z]+)\]([^\n]*)/);
                if (match) {
                  const type = match[1].toLowerCase();
                  const title = match[2].trim();
                  
                  // Remove the callout syntax prefix from the text content
                  const newFirstText = firstText.substring(match[0].length).replace(/^\s+/, '');
                  
                  const newPChildren = [...pChildren];
                  if (newFirstText) {
                    newPChildren[firstTextIndex] = newFirstText;
                  } else {
                    newPChildren.splice(firstTextIndex, 1);
                  }
                  
                  const newFirstElement = React.cloneElement(firstElement, { children: newPChildren });
                  const elementIndex = childrenArray.indexOf(firstElement);
                  const newChildrenArray = [...childrenArray];
                  
                  const hasContent = newPChildren.length > 0 || childrenArray.length > 1;
                  if (newPChildren.length > 0) {
                    newChildrenArray[elementIndex] = newFirstElement;
                  } else {
                    newChildrenArray.splice(elementIndex, 1);
                  }
                  
                  return (
                    <div className="my-8 border border-white/40 bg-black/70 relative shadow-[0_0_15px_rgba(0,0,0,0.3)]">
                      <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-white/70"></div>
                      <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-white/70"></div>
                      
                      <div className="bg-white/10 px-4 py-2 border-b border-white/40 flex items-center gap-3">
                        <div className="w-2 h-2 bg-white animate-pulse shadow-[0_0_8px_rgba(255,255,255,0.8)]"></div>
                        <span className="font-mono font-bold uppercase tracking-widest text-white text-sm drop-shadow-[0_0_5px_rgba(255,255,255,0.8)]">
                          {title || type}
                        </span>
                      </div>
                      
                      {hasContent && (
                        <div className="p-4 text-base text-text-main font-sans">
                          {newChildrenArray}
                        </div>
                      )}
                    </div>
                  );
                }
              }
            }

            return (
              <blockquote {...props} className={`border-l-2 border-white/40 pl-5 text-text-dim my-6 bg-white/10 py-3 pr-4 text-base relative ${className || ''}`}>
                <span className="absolute top-0 left-0 w-2 h-2 border-t border-l border-white/40"></span>
                <span className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-white/40"></span>
                {children}
              </blockquote>
            );
          },
          strong: ({ ...props }) => <strong className="font-bold text-white drop-shadow-[0_0_5px_rgba(255,255,255,0.3)]" {...props} />,
          em: ({ ...props }) => <em className="italic text-text-main font-mono text-sm" {...props} />,
          del: ({ ...props }) => <del className="line-through text-text-dim decoration-white/40" {...props} />,
          input: ({ type, ...props }) => {
            if (type === 'checkbox') {
              return <input type="checkbox" className="mr-2 accent-white" {...props} />;
            }
            return <input type={type} {...props} />;
          },
          img: ({ alt, src }) => {
            return (
              <figure className="my-10 flex flex-col items-center relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-white/10 via-transparent to-white/10 opacity-0 group-hover:opacity-100 transition-opacity blur-md z-0" />
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
                  <figcaption className="mt-4 text-xs font-mono text-white/40 tracking-widest text-center uppercase bg-white/10 border border-white/10 px-3 py-1">
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
    <div className="relative group my-6 border border-white/10 bg-black/70 font-mono shadow-[0_0_15px_rgba(0,0,0,0.5)]">
      <div className="absolute top-0 w-full px-4 py-2 bg-white/10 border-b border-white/10 flex items-center justify-between text-xs uppercase tracking-widest text-white/70 z-10">
        <span>[ {match[1]} ]</span>
        <button onClick={handleCopy} className="hover:text-white transition-colors flex items-center gap-2">
          {copied ? "COPIED_TO_CLIPBOARD" : "COPY_CODE"}
        </button>
      </div>
        <div className="pt-12 pb-4 px-4 overflow-x-auto text-sm relative z-0">
          <SyntaxHighlighter
            language={match[1]}
            style={vscDarkPlus}
            customStyle={{ margin: 0, padding: 0, background: 'transparent' }}
            PreTag="div"
          >
            {String(children).replace(/\n$/, '')}
          </SyntaxHighlighter>
        </div>
    </div>
  ) : (
    <code className="bg-white/10 text-white border border-white/10 px-1.5 py-0.5 font-mono text-sm uppercase tracking-wider" {...props}>
      {children}
    </code>
  );
}

function MermaidBlock({ chart }: { chart: string }) {
  const [svgContent, setSvgContent] = React.useState<string>("");

  useEffect(() => {
    let isMounted = true;
    
    const renderChart = async () => {
      const id = `mermaid-${Math.random().toString(36).substr(2, 9)}`;
      try {
        // Pre-validate syntax — if invalid, parse() returns false without creating DOM elements
        const isValid = await mermaid.parse(chart, { suppressErrors: true });
        if (!isValid) {
          if (isMounted) setSvgContent(
            `<div class="text-coral-400 border border-coral-400/20 p-4 rounded bg-coral-400/10 font-mono text-sm">⚠ Mermaid syntax error — please check your diagram code.</div>`
          );
          return;
        }

        const { svg } = await mermaid.render(id, chart);
        if (isMounted) setSvgContent(svg);
      } catch (error) {
        console.error(error);
        if (isMounted) setSvgContent(
          `<div class="text-coral-400 border border-coral-400/20 p-4 rounded bg-coral-400/10 font-mono text-sm">⚠ ${error instanceof Error ? error.message : String(error)}</div>`
        );
      } finally {
        // Safety net: remove any orphaned temp elements Mermaid may have left in document.body
        document.getElementById(`d${id}`)?.remove();
        document.getElementById(`i${id}`)?.remove();
      }
    };
    
    renderChart();
    
    return () => { isMounted = false; };
  }, [chart]);

  return <div dangerouslySetInnerHTML={{ __html: svgContent }} className="my-8 flex justify-center w-full" />;
}
