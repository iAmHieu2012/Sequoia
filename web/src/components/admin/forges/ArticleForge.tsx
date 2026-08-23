"use client";

import React, { useState, useRef } from 'react';
import { Bold, Italic, Heading, List, Quote, Link as LinkIcon, Image as ImageIcon, Sigma, SquareSigma, Eye, Edit3, Columns2, Loader2, Info, MapPin, FileText } from 'lucide-react';
import MarkdownRenderer from '@/components/ui/MarkdownRenderer';
import CyberBrackets from '@/components/ui/CyberBrackets';
import { ForgeLabel, ForgeInput, ForgeTextarea, ForgeHeader, ForgeWrapper } from './ForgeShared';
import CosmosMapEditor from '../CosmosMapEditor';

type ViewMode = 'edit' | 'split' | 'preview';
type ArticleSubTab = 'general' | 'map' | 'content';

interface ArticleForgeProps {
  onClose: () => void;
  onSave: (data: Record<string, unknown>) => void;
  initialData?: {
    id?: string;
    title?: string;
    topic_id?: string;
    summary?: string;
    content?: string;
    tags?: string[];
    x?: number | string;
    y?: number | string;
    connections?: string[];
    is_published?: boolean;
  };
  isAnomaly?: boolean;
}

/**
 * ArticleForge Component
 * A full-featured editor for Articles and Anomalies. Includes a Markdown editor with
 * live preview, Cloudinary image upload, and an embedded Cosmos Map editor for plotting coordinates.
 */
export default function ArticleForge({ onClose, onSave, initialData, isAnomaly = false }: ArticleForgeProps) {
  const entityId = initialData?.id || '';
  const [viewMode, setViewMode] = useState<ViewMode>('edit');
  const [articleSubTab, setArticleSubTab] = useState<ArticleSubTab>('general');
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const [title, setTitle] = useState(initialData?.title || '');
  const [category, setCategory] = useState(initialData?.topic_id || '');
  const [summary, setSummary] = useState(initialData?.summary || '');
  const [content, setContent] = useState(initialData?.content || '');
  const [tags, setTags] = useState(initialData?.tags?.join(', ') || '');
  const [x, setX] = useState(initialData?.x?.toString() || '');
  const [y, setY] = useState(initialData?.y?.toString() || '');
  const [connections, setConnections] = useState(initialData?.connections?.join(', ') || '');
  const [isPublished, setIsPublished] = useState(initialData?.is_published !== false);

  const insertMarkdown = (prefix: string, suffix: string) => {
    if (!textareaRef.current) return;
    const textarea = textareaRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = content.substring(start, end);
    const newText = content.substring(0, start) + prefix + selectedText + suffix + content.substring(end);
    setContent(newText);
    
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + prefix.length, start + prefix.length + selectedText.length);
    }, 0);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingImage(true);
    
    try {
      // Dynamically import to avoid circular dependencies or server-side issues if any
      const { UploadService } = await import('@/services/upload.service');
      const secureUrl = await UploadService.uploadImageToCloudinary(file);
      insertMarkdown(`![${file.name}](${secureUrl})`, '');
    } catch (error: unknown) {
      console.error("Cloudinary upload error:", error);
      alert(error instanceof Error ? error.message : "An error occurred while uploading the image.");
    } finally {
      setIsUploadingImage(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleSave = () => {
    onSave({ 
      id: entityId || undefined,
      title, topic_id: category, summary, content,
      tags: tags.split(',').map(t => t.trim()).filter(Boolean),
      x: parseFloat(x) || 0,
      y: parseFloat(y) || 0,
      connections: connections.split(',').map(c => c.trim()).filter(Boolean),
      celestial_type: isAnomaly ? 'anomaly' : 'star',
      is_published: isPublished
    });
  };

  return (
    <ForgeWrapper>
      <ForgeHeader title={isAnomaly ? 'ANOMALY_FORGE' : 'ARTICLE_FORGE'} onSave={handleSave} onClose={onClose}>
        <div className="flex gap-2 bg-black/60 border border-white/20 p-1">
          {[
            { id: 'general', icon: Info, label: 'GENERAL' },
            { id: 'map', icon: MapPin, label: 'COORDINATES' },
            { id: 'content', icon: FileText, label: 'MARKDOWN' }
          ].map(tab => (
            <button 
              key={tab.id}
              onClick={() => setArticleSubTab(tab.id as ArticleSubTab)}
              className={`px-3 py-1 text-[10px] font-mono tracking-widest flex items-center gap-2 transition-colors ${
                articleSubTab === tab.id ? 'bg-white text-black font-bold shadow-[0_0_10px_rgba(255,255,255,0.5)]' : 'text-white/50 hover:text-white hover:bg-white/10'
              }`}
            >
              <tab.icon className="w-3 h-3" /> {tab.label}
            </button>
          ))}
        </div>
      </ForgeHeader>

      <div className="flex-1 flex flex-col min-w-0 min-h-0 bg-black/40 border border-white/20 relative p-6 z-10">
        <CyberBrackets color="border-white/40" />

        {articleSubTab === 'general' && (
          <div className="w-full max-w-3xl mx-auto flex flex-col gap-6 relative z-10 animate-in fade-in duration-300 h-full overflow-y-auto [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-thumb]:bg-white/20">
            <div className="flex gap-4">
              <div className="flex-1">
                <ForgeLabel>TITLE_IDENTIFIER</ForgeLabel>
                <ForgeInput value={title} onChange={e => setTitle(e.target.value)} placeholder="Enter article title..." />
              </div>
              <div className="w-1/3">
                <ForgeLabel>TOPIC_SECTOR</ForgeLabel>
                <ForgeInput value={category} onChange={e => setCategory(e.target.value)} placeholder="e.g. computer-vision" />
              </div>
              <div className="w-1/4">
                <ForgeLabel>STATUS</ForgeLabel>
                <button 
                  onClick={() => setIsPublished(!isPublished)}
                  className={`w-full p-2 text-sm font-mono border transition-all ${isPublished ? 'bg-white/10 border-white/50 text-white shadow-[0_0_10px_rgba(255,255,255,0.2)]' : 'bg-black/60 border-white/20 text-white/50'}`}
                >
                  {isPublished ? 'PUBLISHED' : 'DRAFT'}
                </button>
              </div>
            </div>
            
            <div>
              <ForgeLabel>TAGS (COMMA SEPARATED)</ForgeLabel>
              <ForgeInput value={tags} onChange={e => setTags(e.target.value)} placeholder="nlp, paper, etc..." />
            </div>

            <div className="flex-1 flex flex-col min-h-[200px]">
              <ForgeLabel>DATA_SUMMARY</ForgeLabel>
              <ForgeTextarea value={summary} onChange={e => setSummary(e.target.value)} className="flex-1 w-full bg-black/60 border border-white/20 p-2 text-sm text-white focus:border-white focus:shadow-[0_0_10px_rgba(255,255,255,0.2)] outline-none font-mono resize-none transition-all" placeholder="Brief summary..." />
            </div>
          </div>
        )}

        {articleSubTab === 'map' && (
          <div className="w-full h-full flex gap-6 relative z-10 animate-in fade-in duration-300 min-h-0">
            <div className="w-1/3 flex flex-col gap-6 bg-black/60 p-6 border border-white/20 h-fit">
              <div className="flex gap-4">
                <div className="flex-1">
                  <ForgeLabel>MAP_X_COORDINATE</ForgeLabel>
                  <ForgeInput value={x} onChange={e => setX(e.target.value)} placeholder="0" />
                </div>
                <div className="flex-1">
                  <ForgeLabel>MAP_Y_COORDINATE</ForgeLabel>
                  <ForgeInput value={y} onChange={e => setY(e.target.value)} placeholder="0" />
                </div>
              </div>
              <div>
                <ForgeLabel>CONNECTIONS (ID_HASHES)</ForgeLabel>
                <ForgeInput value={connections} onChange={e => setConnections(e.target.value)} placeholder="article-id-1, article-id-2..." />
                <p className="text-[10px] text-white/40 mt-1 font-mono">Identify connected nodes to establish Neural Links.</p>
              </div>
            </div>
            
            <div className="flex-1 h-full border border-white/20 bg-black/80 relative">
              <CosmosMapEditor 
                targetX={!isNaN(parseFloat(x)) ? parseFloat(x) : 5000} 
                targetY={!isNaN(parseFloat(y)) ? parseFloat(y) : 5000} 
                targetScale={1.0}
                mapId={category || 'default'}
                activeNodeId={entityId || 'draft-node'}
                className="w-full h-full"
                hideSaveButton={true}
                draftNode={{
                  article_id: entityId || 'draft-node',
                  title: title || 'UNTITLED DRAFT',
                  x: !isNaN(parseFloat(x)) ? parseFloat(x) : 5000,
                  y: !isNaN(parseFloat(y)) ? parseFloat(y) : 5000,
                  celestial_type: isAnomaly ? 'anomaly' : 'article',
                  connections: connections.split(',').map(c => c.trim()).filter(Boolean)
                } as React.ComponentProps<typeof CosmosMapEditor>['draftNode']}
                onDraftNodeDrag={(newX: number, newY: number) => {
                  setX(Math.round(newX).toString());
                  setY(Math.round(newY).toString());
                }}
                onDraftNodeConnectionsChange={(newConns: string[]) => {
                  setConnections(newConns.join(', '));
                }}
              />
            </div>
          </div>
        )}

        {articleSubTab === 'content' && (
          <div className="w-full flex flex-col h-full relative z-10 animate-in fade-in duration-300 min-h-0">
            <div className="flex items-center justify-between border-b border-white/20 pb-4 mb-4 shrink-0">
              <div className="flex flex-wrap gap-1">
                <button onClick={() => insertMarkdown('**','**')} className="p-1.5 text-white/50 hover:text-white hover:bg-white/10"><Bold className="w-4 h-4" /></button>
                <button onClick={() => insertMarkdown('*','*')} className="p-1.5 text-white/50 hover:text-white hover:bg-white/10"><Italic className="w-4 h-4" /></button>
                <div className="w-px h-6 bg-white/20 mx-2 self-center" />
                <button onClick={() => insertMarkdown('### ','')} className="p-1.5 text-white/50 hover:text-white hover:bg-white/10"><Heading className="w-4 h-4" /></button>
                <button onClick={() => insertMarkdown('- ','')} className="p-1.5 text-white/50 hover:text-white hover:bg-white/10"><List className="w-4 h-4" /></button>
                <button onClick={() => insertMarkdown('> ','')} className="p-1.5 text-white/50 hover:text-white hover:bg-white/10"><Quote className="w-4 h-4" /></button>
                <div className="w-px h-6 bg-white/20 mx-2 self-center" />
                <button onClick={() => insertMarkdown('[','](url)')} className="p-1.5 text-white/50 hover:text-white hover:bg-white/10"><LinkIcon className="w-4 h-4" /></button>
                <input type="file" ref={fileInputRef} onChange={handleImageUpload} accept="image/*" className="hidden" />
                <button 
                  onClick={() => fileInputRef.current?.click()} 
                  disabled={isUploadingImage}
                  className="p-1.5 text-white/50 hover:text-white hover:bg-white/10 relative"
                >
                  {isUploadingImage ? <Loader2 className="w-4 h-4 animate-spin text-white" /> : <ImageIcon className="w-4 h-4" />}
                </button>
                <div className="w-px h-6 bg-white/20 mx-2 self-center" />
                <button onClick={() => insertMarkdown('$','$')} className="p-1.5 text-white/50 hover:text-white hover:bg-white/10"><Sigma className="w-4 h-4" /></button>
                <button onClick={() => insertMarkdown('\n$$\n','\n$$\n')} className="p-1.5 text-white/50 hover:text-white hover:bg-white/10"><SquareSigma className="w-4 h-4" /></button>
              </div>
              
              <div className="flex gap-2 bg-black/60 border border-white/20 p-1">
                {[
                  { id: 'edit', icon: Edit3, label: 'EDIT' },
                  { id: 'split', icon: Columns2, label: 'SPLIT' },
                  { id: 'preview', icon: Eye, label: 'PREVIEW' }
                ].map(mode => (
                  <button 
                    key={mode.id}
                    onClick={() => setViewMode(mode.id as ViewMode)}
                    className={`px-3 py-1 text-[10px] font-mono tracking-widest flex items-center gap-2 transition-colors ${
                      viewMode === mode.id ? 'bg-white text-black font-bold shadow-[0_0_10px_rgba(255,255,255,0.5)]' : 'text-white/50 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    <mode.icon className="w-3 h-3" /> {mode.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex-1 flex gap-4 min-h-0">
              {(viewMode === 'edit' || viewMode === 'split') && (
                <textarea
                  ref={textareaRef}
                  value={content}
                  onChange={e => setContent(e.target.value)}
                  className="flex-1 w-full bg-black/40 border border-white/20 p-4 text-sm text-white/80 outline-none font-mono resize-none min-h-0 [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-track]:bg-black/20 [&::-webkit-scrollbar-thumb]:bg-white/20 hover:[&::-webkit-scrollbar-thumb]:bg-white/50"
                  placeholder="> INITIATING MARKDOWN DATA STREAM..."
                />
              )}
              {(viewMode === 'preview' || viewMode === 'split') && (
                <div className="flex-1 min-h-0 bg-[#050505] border border-white/20 p-6 overflow-y-auto [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-track]:bg-black/20 [&::-webkit-scrollbar-thumb]:bg-white/20 hover:[&::-webkit-scrollbar-thumb]:bg-white/50">
                  {title && viewMode === 'preview' && (
                    <div className="mb-8 border-b border-white/20 pb-6">
                      <h1 className="text-3xl font-black text-white mb-3 font-heading uppercase">{title}</h1>
                      <div className="inline-block px-3 py-1 bg-white/10 border border-white/30 text-white text-[10px] font-mono tracking-widest uppercase">
                        {category || 'UNKNOWN_SECTOR'}
                      </div>
                      {summary && <p className="text-white/60 mt-4 text-sm font-mono border-l-2 border-white/30 pl-4">{summary}</p>}
                    </div>
                  )}
                  <div className="prose prose-invert max-w-none">
                    {content ? <MarkdownRenderer content={content} /> : (
                      <div className="text-white/30 font-mono text-center mt-20 text-xs tracking-widest animate-pulse">AWAITING_DATA_STREAM...</div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </ForgeWrapper>
  );
}
