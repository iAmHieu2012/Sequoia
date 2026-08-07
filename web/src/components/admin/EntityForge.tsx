"use client";

import React, { useState, useRef, useEffect } from 'react';
import { Bold, Italic, Heading, List, Quote, Link as LinkIcon, Image as ImageIcon, Sigma, SquareSigma, Eye, Edit3, Columns2, Save, X, Sparkles } from 'lucide-react';
import MarkdownRenderer from '@/components/ui/MarkdownRenderer';
import CyberBrackets from '@/components/ui/CyberBrackets';

type AdminTab = 'nebulas' | 'stars' | 'anomalies' | 'models' | 'textbooks';
type ViewMode = 'edit' | 'split' | 'preview';

interface EntityForgeProps {
  activeTab: AdminTab;
  onClose: () => void;
  onSave: (data: Record<string, unknown>) => void;
  initialData?: any;
}

const ForgeLabel = ({ children }: { children: React.ReactNode }) => (
  <label className="block text-[10px] font-mono text-white/50 tracking-widest uppercase mb-1">{children}</label>
);

const ForgeInput = ({ ...props }: React.InputHTMLAttributes<HTMLInputElement>) => (
  <input 
    {...props}
    className="w-full bg-black/60 border border-white/20 p-2 text-sm text-white focus:border-white focus:shadow-[0_0_10px_rgba(255,255,255,0.2)] outline-none font-mono transition-all" 
  />
);

const ForgeTextarea = ({ ...props }: React.TextareaHTMLAttributes<HTMLTextAreaElement>) => (
  <textarea 
    {...props}
    className="w-full bg-black/60 border border-white/20 p-2 text-sm text-white focus:border-white focus:shadow-[0_0_10px_rgba(255,255,255,0.2)] outline-none font-mono resize-none transition-all" 
  />
);

export default function EntityForge({ activeTab, onClose, onSave, initialData }: EntityForgeProps) {
  // Common state
  const [entityId, setEntityId] = useState('');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  
  // Article State
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');
  const [summary, setSummary] = useState('');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState('');
  const [x, setX] = useState('');
  const [y, setY] = useState('');
  const [connections, setConnections] = useState('');
  const [isPublished, setIsPublished] = useState(true);
  const [viewMode, setViewMode] = useState<ViewMode>('edit');
  
  // Topic State
  const [sortOrder, setSortOrder] = useState('99');
  
  // Model State
  const [taskType, setTaskType] = useState('');
  const [fileUrl, setFileUrl] = useState('');
  const [metadataUrl, setMetadataUrl] = useState('');
  const [version, setVersion] = useState('1.0');
  const [format, setFormat] = useState('litert');
  const [fileSizeBytes, setFileSizeBytes] = useState('0');
  
  // Textbook State
  const [authors, setAuthors] = useState('');
  const [coverImageUrl, setCoverImageUrl] = useState('');
  const [pdfUrl, setPdfUrl] = useState('');

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Load initial data
  useEffect(() => {
    if (initialData) {
      if (activeTab === 'stars' || activeTab === 'anomalies') {
        setEntityId(initialData.id || '');
        setTitle(initialData.title || '');
        setCategory(initialData.topicId || '');
        setSummary(initialData.summary || '');
        setContent(initialData.content || '');
        setTags(initialData.tags?.join(', ') || '');
        setX(initialData.x?.toString() || '');
        setY(initialData.y?.toString() || '');
        setConnections(initialData.connections?.join(', ') || '');
        setIsPublished(initialData.isPublished !== false); // default to true
      } else if (activeTab === 'nebulas') {
        setName(initialData.name || '');
        setDescription(initialData.description || '');
        setSortOrder(initialData.sortOrder?.toString() || '99');
      } else if (activeTab === 'models') {
        setEntityId(initialData.id || '');
        setName(initialData.name || '');
        setTaskType(initialData.taskType || '');
        setFileUrl(initialData.fileUrl || '');
        setMetadataUrl(initialData.metadataUrl || '');
        setVersion(initialData.version || '1.0');
        setDescription(initialData.description || '');
        setFormat(initialData.format || 'litert');
        setFileSizeBytes(initialData.fileSizeBytes?.toString() || '0');
      } else if (activeTab === 'textbooks') {
        setEntityId(initialData.id || '');
        setTitle(initialData.title || '');
        setAuthors(initialData.authors?.join(', ') || '');
        setCoverImageUrl(initialData.coverImageUrl || '');
        setPdfUrl(initialData.pdfUrl || '');
        setDescription(initialData.description || '');
        setSortOrder(initialData.sortOrder?.toString() || '99');
      }
    }
  }, [initialData, activeTab]);

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

  const handleSave = () => {
    if (activeTab === 'stars' || activeTab === 'anomalies') {
      onSave({ 
        id: entityId || undefined,
        title, topicId: category, summary, content,
        tags: tags.split(',').map(t => t.trim()).filter(Boolean),
        x: parseFloat(x) || 0,
        y: parseFloat(y) || 0,
        connections: connections.split(',').map(c => c.trim()).filter(Boolean),
        celestialType: activeTab === 'stars' ? 'star' : 'anomaly',
        isPublished
      });
    } else if (activeTab === 'nebulas') {
      onSave({ name, description, sortOrder: parseInt(sortOrder) || 99 });
    } else if (activeTab === 'models') {
      onSave({ 
        id: entityId, name, description, taskType, fileUrl, metadataUrl, version, format, 
        fileSizeBytes: parseInt(fileSizeBytes) || 0 
      });
    } else if (activeTab === 'textbooks') {
      onSave({ 
        id: entityId, 
        title, 
        description, 
        authors: authors.split(',').map(a => a.trim()).filter(Boolean), 
        coverImageUrl, 
        pdfUrl,
        sortOrder: parseInt(sortOrder) || 99
      });
    }
  };

  const forgeTitle = {
    nebulas: 'NEBULA_FORGE',
    stars: 'ARTICLE_FORGE',
    anomalies: 'ANOMALY_FORGE',
    models: 'MODEL_FORGE',
    textbooks: 'TEXTBOOK_FORGE'
  }[activeTab];

  return (
    <div className="fixed inset-0 bg-black/95 z-[100] flex flex-col p-6 overflow-hidden animate-in fade-in duration-300">
      
      {/* Scanline overlay */}
      <div className="absolute inset-0 pointer-events-none z-50 opacity-[0.03] bg-[linear-gradient(to_bottom,transparent_50%,#fff_50%)] bg-[length:100%_4px]" />
      <div className="absolute inset-0 pointer-events-none z-0 shadow-[inset_0_0_200px_rgba(255,255,255,0.05)]" />

      {/* Header */}
      <div className="relative z-10 flex items-center justify-between mb-6 pb-4 border-b border-white/20">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3">
            <Sparkles className="w-5 h-5 text-white animate-pulse" />
            <h2 className="text-2xl font-bold tracking-[0.3em] font-mono text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.6)] uppercase">
              {forgeTitle}
            </h2>
          </div>

          {(activeTab === 'stars' || activeTab === 'anomalies') && (
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
          )}
        </div>

        <div className="flex items-center gap-4">
          <button 
            onClick={handleSave} 
            className="group relative px-6 py-2 border border-white/50 hover:border-white transition-colors bg-white/5 flex items-center gap-2 text-xs tracking-widest uppercase overflow-hidden"
          >
            <div className="absolute inset-0 bg-white translate-y-[100%] group-hover:translate-y-0 transition-transform duration-300 ease-out" />
            <span className="relative z-10 group-hover:text-black font-bold flex items-center gap-2">
              <Save className="w-4 h-4" /> COMMIT_DATA
            </span>
          </button>
          
          <button onClick={onClose} className="p-2 hover:bg-white/10 text-white/50 hover:text-white transition-colors border border-transparent hover:border-white/20">
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 flex gap-6 min-h-0 relative z-10">
        
        {/* === ARTICLE EDITOR === */}
        {(activeTab === 'stars' || activeTab === 'anomalies') && (
          <>
            {(viewMode === 'edit' || viewMode === 'split') && (
              <div className="flex-1 flex flex-col min-w-0 bg-black/40 border border-white/20 relative p-6">
                <CyberBrackets color="border-white/40" />
                
                <div className="flex gap-4 mb-4">
                  <div className="flex-1">
                    <ForgeLabel>TITLE_IDENTIFIER</ForgeLabel>
                    <ForgeInput value={title} onChange={e => setTitle(e.target.value)} placeholder="Enter article title..." />
                  </div>
                  <div className="w-1/4">
                    <ForgeLabel>TOPIC_SECTOR</ForgeLabel>
                    <ForgeInput value={category} onChange={e => setCategory(e.target.value)} placeholder="e.g. computer-vision" />
                  </div>
                  <div className="w-1/6">
                    <ForgeLabel>STATUS</ForgeLabel>
                    <button 
                      onClick={() => setIsPublished(!isPublished)}
                      className={`w-full p-2 text-sm font-mono border transition-all ${isPublished ? 'bg-white/10 border-white/50 text-white' : 'bg-black/60 border-white/20 text-white/50'}`}
                    >
                      {isPublished ? 'PUBLISHED' : 'DRAFT'}
                    </button>
                  </div>
                </div>

                <div className="flex gap-4 mb-4">
                  <div className="w-1/3">
                    <ForgeLabel>TAGS (COMMA SEPARATED)</ForgeLabel>
                    <ForgeInput value={tags} onChange={e => setTags(e.target.value)} placeholder="nlp, paper, etc..." />
                  </div>
                  <div className="w-1/6">
                    <ForgeLabel>MAP_X</ForgeLabel>
                    <ForgeInput value={x} onChange={e => setX(e.target.value)} placeholder="7500" />
                  </div>
                  <div className="w-1/6">
                    <ForgeLabel>MAP_Y</ForgeLabel>
                    <ForgeInput value={y} onChange={e => setY(e.target.value)} placeholder="2500" />
                  </div>
                  <div className="flex-1">
                    <ForgeLabel>CONNECTIONS (ID_HASHES)</ForgeLabel>
                    <ForgeInput value={connections} onChange={e => setConnections(e.target.value)} placeholder="article-id-1, article-id-2..." />
                  </div>
                </div>

                <div className="mb-4">
                  <ForgeLabel>DATA_SUMMARY</ForgeLabel>
                  <ForgeTextarea value={summary} onChange={e => setSummary(e.target.value)} rows={2} placeholder="Brief summary..." />
                </div>

                <div className="flex flex-wrap gap-1 mb-2 border-b border-white/20 pb-2">
                  <button onClick={() => insertMarkdown('**','**')} className="p-1.5 text-white/50 hover:text-white hover:bg-white/10"><Bold className="w-4 h-4" /></button>
                  <button onClick={() => insertMarkdown('*','*')} className="p-1.5 text-white/50 hover:text-white hover:bg-white/10"><Italic className="w-4 h-4" /></button>
                  <div className="w-px h-6 bg-white/20 mx-2 self-center" />
                  <button onClick={() => insertMarkdown('### ','')} className="p-1.5 text-white/50 hover:text-white hover:bg-white/10"><Heading className="w-4 h-4" /></button>
                  <button onClick={() => insertMarkdown('- ','')} className="p-1.5 text-white/50 hover:text-white hover:bg-white/10"><List className="w-4 h-4" /></button>
                  <button onClick={() => insertMarkdown('> ','')} className="p-1.5 text-white/50 hover:text-white hover:bg-white/10"><Quote className="w-4 h-4" /></button>
                  <div className="w-px h-6 bg-white/20 mx-2 self-center" />
                  <button onClick={() => insertMarkdown('[','](url)')} className="p-1.5 text-white/50 hover:text-white hover:bg-white/10"><LinkIcon className="w-4 h-4" /></button>
                  <button onClick={() => insertMarkdown('![','](image_url)')} className="p-1.5 text-white/50 hover:text-white hover:bg-white/10"><ImageIcon className="w-4 h-4" /></button>
                  <div className="w-px h-6 bg-white/20 mx-2 self-center" />
                  <button onClick={() => insertMarkdown('$','$')} className="p-1.5 text-white/50 hover:text-white hover:bg-white/10"><Sigma className="w-4 h-4" /></button>
                  <button onClick={() => insertMarkdown('\n$$\n','\n$$\n')} className="p-1.5 text-white/50 hover:text-white hover:bg-white/10"><SquareSigma className="w-4 h-4" /></button>
                </div>

                <textarea
                  ref={textareaRef}
                  value={content}
                  onChange={e => setContent(e.target.value)}
                  className="flex-1 w-full bg-transparent border-none text-sm text-white/80 outline-none font-mono resize-none mt-2"
                  placeholder="> INITIATING MARKDOWN DATA STREAM..."
                />
              </div>
            )}

            {(viewMode === 'preview' || viewMode === 'split') && (
              <div className="flex-1 flex flex-col min-w-0 bg-[#050505] border border-white/20 relative p-8 overflow-y-auto">
                <CyberBrackets color="border-white/10" />
                
                {title && (
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
          </>
        )}

        {/* === NEBULA FORM === */}
        {activeTab === 'nebulas' && (
          <div className="max-w-2xl mx-auto w-full flex flex-col gap-6 bg-black/40 border border-white/20 relative p-8 h-fit">
            <CyberBrackets color="border-white/40" />
            <div className="flex gap-4">
              <div className="flex-1">
                <ForgeLabel>NEBULA_NAME</ForgeLabel>
                <ForgeInput value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Computer Vision" />
              </div>
              <div className="w-1/4">
                <ForgeLabel>SORT_ORDER</ForgeLabel>
                <ForgeInput value={sortOrder} onChange={e => setSortOrder(e.target.value)} placeholder="99" />
              </div>
            </div>
            <div>
              <ForgeLabel>DESCRIPTION</ForgeLabel>
              <ForgeTextarea value={description} onChange={e => setDescription(e.target.value)} rows={4} placeholder="Description of the topic..." />
            </div>
          </div>
        )}

        {/* === MODEL FORM === */}
        {activeTab === 'models' && (
          <div className="max-w-3xl mx-auto w-full flex flex-col gap-6 bg-black/40 border border-white/20 relative p-8 h-fit">
            <CyberBrackets color="border-white/40" />
            <div className="flex gap-4">
              <div className="flex-1">
                <ForgeLabel>MODEL_ID</ForgeLabel>
                <ForgeInput value={entityId} onChange={e => setEntityId(e.target.value)} placeholder="e.g. yolov8n-detect" />
              </div>
              <div className="flex-1">
                <ForgeLabel>DISPLAY_NAME</ForgeLabel>
                <ForgeInput value={name} onChange={e => setName(e.target.value)} placeholder="e.g. YOLOv8 Nano" />
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex-1">
                <ForgeLabel>TASK_TYPE</ForgeLabel>
                <ForgeInput value={taskType} onChange={e => setTaskType(e.target.value)} placeholder="e.g. object-detection" />
              </div>
              <div className="w-1/5">
                <ForgeLabel>VERSION</ForgeLabel>
                <ForgeInput value={version} onChange={e => setVersion(e.target.value)} placeholder="1.0" />
              </div>
              <div className="w-1/5">
                <ForgeLabel>FORMAT</ForgeLabel>
                <ForgeInput value={format} onChange={e => setFormat(e.target.value)} placeholder="litert" />
              </div>
              <div className="w-1/5">
                <ForgeLabel>SIZE_BYTES</ForgeLabel>
                <ForgeInput value={fileSizeBytes} onChange={e => setFileSizeBytes(e.target.value)} placeholder="0" />
              </div>
            </div>
            <div>
              <ForgeLabel>FILE_URL (GITHUB RAW)</ForgeLabel>
              <ForgeInput value={fileUrl} onChange={e => setFileUrl(e.target.value)} placeholder="https://..." />
            </div>
            <div>
              <ForgeLabel>METADATA_URL (GITHUB RAW)</ForgeLabel>
              <ForgeInput value={metadataUrl} onChange={e => setMetadataUrl(e.target.value)} placeholder="https://..." />
            </div>
            <div>
              <ForgeLabel>DESCRIPTION</ForgeLabel>
              <ForgeTextarea value={description} onChange={e => setDescription(e.target.value)} rows={3} placeholder="Description of the model..." />
            </div>
          </div>
        )}

        {/* === TEXTBOOK FORM === */}
        {activeTab === 'textbooks' && (
          <div className="max-w-3xl mx-auto w-full flex flex-col gap-6 bg-black/40 border border-white/20 relative p-8 h-fit">
            <CyberBrackets color="border-white/40" />
            <div className="flex gap-4">
              <div className="w-1/4">
                <ForgeLabel>MODULE_ID</ForgeLabel>
                <ForgeInput value={entityId} onChange={e => setEntityId(e.target.value)} placeholder="e.g. intro-to-ai" />
              </div>
              <div className="flex-1">
                <ForgeLabel>MODULE_TITLE</ForgeLabel>
                <ForgeInput value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Introduction to Artificial Intelligence" />
              </div>
              <div className="w-1/6">
                <ForgeLabel>SORT_ORDER</ForgeLabel>
                <ForgeInput value={sortOrder} onChange={e => setSortOrder(e.target.value)} placeholder="99" />
              </div>
            </div>
            <div>
              <ForgeLabel>AUTHORS (COMMA SEPARATED)</ForgeLabel>
              <ForgeInput value={authors} onChange={e => setAuthors(e.target.value)} placeholder="e.g. John Doe, Jane Smith" />
            </div>
            <div>
              <ForgeLabel>COVER_IMAGE_URL</ForgeLabel>
              <ForgeInput value={coverImageUrl} onChange={e => setCoverImageUrl(e.target.value)} placeholder="https://..." />
            </div>
            <div>
              <ForgeLabel>PDF_URL (GITHUB RAW)</ForgeLabel>
              <ForgeInput value={pdfUrl} onChange={e => setPdfUrl(e.target.value)} placeholder="https://..." />
            </div>
            <div>
              <ForgeLabel>DESCRIPTION</ForgeLabel>
              <ForgeTextarea value={description} onChange={e => setDescription(e.target.value)} rows={3} placeholder="Description of the module..." />
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
