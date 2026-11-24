"use client";

import React, { useRef } from 'react';

// Shared by the textarea and the highlight layer: both must lay text out identically,
// or the caret drifts away from the coloured text.
// Both reserve the scrollbar's width, so long content wraps at the same column in each.
// normal-case/tracking-normal: a div inherits text-transform from ancestors, a textarea does not.
const LAYOUT = 'p-4 text-sm font-mono normal-case tracking-normal leading-relaxed whitespace-pre-wrap break-words [scrollbar-gutter:stable]';

const HEADING_CLASS = 'text-coral';
const QUOTE_CLASS = 'text-teal';

/** Colours heading and blockquote lines; lines inside ``` fences are left alone. */
function highlight(content: string): React.ReactNode[] {
  let inFence = false;
  return content.split('\n').map((line, i) => {
    let className: string | undefined;
    if (/^\s*(```|~~~)/.test(line)) {
      inFence = !inFence;
    } else if (!inFence) {
      if (/^ {0,3}#{1,6}(\s|$)/.test(line)) className = HEADING_CLASS;
      else if (/^ {0,3}>/.test(line)) className = QUOTE_CLASS;
    }
    return (
      <React.Fragment key={i}>
        {i > 0 && '\n'}
        {className ? <span className={className}>{line}</span> : line}
      </React.Fragment>
    );
  });
}

type MarkdownTextareaProps = Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, 'value'> & {
  value: string;
  ref?: React.Ref<HTMLTextAreaElement>;
};

/**
 * A plain textarea for Markdown with heading (`#`) and blockquote (`>`) lines coloured.
 * The textarea's own text is transparent; a layer behind it draws the coloured copy
 * and follows its scroll position.
 */
export default function MarkdownTextarea({ value, className, onScroll, ref, ...props }: MarkdownTextareaProps) {
  const layerRef = useRef<HTMLDivElement>(null);

  const handleScroll = (e: React.UIEvent<HTMLTextAreaElement>) => {
    if (layerRef.current) {
      layerRef.current.scrollTop = e.currentTarget.scrollTop;
      layerRef.current.scrollLeft = e.currentTarget.scrollLeft;
    }
    onScroll?.(e);
  };

  return (
    <div className={`relative flex flex-col bg-black/70 border border-white/40 ${className || ''}`}>
      <div
        ref={layerRef}
        aria-hidden
        className={`absolute inset-0 overflow-hidden pointer-events-none text-white/70 ${LAYOUT}`}
      >
        {highlight(value)}
        {/* Keeps a trailing newline from collapsing so the last line stays aligned. */}
        {'\n'}
      </div>
      <textarea
        {...props}
        ref={ref}
        value={value}
        onScroll={handleScroll}
        spellCheck={false}
        className={`relative flex-1 min-h-0 w-full bg-transparent text-transparent caret-white selection:bg-[color:Highlight] selection:text-[color:HighlightText] placeholder:text-white/30 outline-none resize-none ${LAYOUT}`}
      />
    </div>
  );
}
