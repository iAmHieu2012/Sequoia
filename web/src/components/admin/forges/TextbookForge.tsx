"use client";

import React, { useState, useEffect } from 'react';
import CyberBrackets from '@/components/ui/CyberBrackets';
import { ForgeLabel, ForgeInput, ForgeTextarea, ForgeHeader, ForgeWrapper } from './ForgeShared';

interface TextbookForgeProps {
  onClose: () => void;
  onSave: (data: Record<string, unknown>) => void;
  initialData?: any;
}

export default function TextbookForge({ onClose, onSave, initialData }: TextbookForgeProps) {
  const [entityId, setEntityId] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [authors, setAuthors] = useState('');
  const [coverImageUrl, setCoverImageUrl] = useState('');
  const [pdfUrl, setPdfUrl] = useState('');
  const [sortOrder, setSortOrder] = useState('99');

  useEffect(() => {
    if (initialData) {
      setEntityId(initialData.id || '');
      setTitle(initialData.title || '');
      setAuthors(initialData.authors?.join(', ') || '');
      setCoverImageUrl(initialData.cover_image_url || '');
      setPdfUrl(initialData.pdf_url || '');
      setDescription(initialData.description || '');
      setSortOrder(initialData.sort_order?.toString() || '99');
    }
  }, [initialData]);

  const handleSave = () => {
    onSave({ 
      id: entityId, 
      title, 
      description, 
      authors: authors.split(',').map(a => a.trim()).filter(Boolean), 
      cover_image_url: coverImageUrl, 
      pdf_url: pdfUrl,
      sort_order: parseInt(sortOrder) || 99
    });
  };

  return (
    <ForgeWrapper>
      <ForgeHeader title="TEXTBOOK_FORGE" onSave={handleSave} onClose={onClose} />
      <div className="flex-1 flex gap-6 min-h-0 relative z-10">
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
      </div>
    </ForgeWrapper>
  );
}
