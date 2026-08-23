"use client";

import React, { useState } from 'react';
import CyberBrackets from '@/components/ui/CyberBrackets';
import { ForgeLabel, ForgeInput, ForgeTextarea, ForgeHeader, ForgeWrapper } from './ForgeShared';

interface TextbookForgeProps {
  onClose: () => void;
  onSave: (data: Record<string, unknown>) => void;
  initialData?: {
    id?: string;
    title?: string;
    description?: string;
    authors?: string[];
    cover_image_url?: string;
    pdf_url?: string;
    sort_order?: number | string;
  };
}

/**
 * TextbookForge Component
 * Form for creating and editing Textbooks in the Modules section.
 * Allows assigning authors, cover images, and PDF source URLs.
 */
export default function TextbookForge({ onClose, onSave, initialData }: TextbookForgeProps) {
  const [entityId, setEntityId] = useState(initialData?.id || '');
  const [title, setTitle] = useState(initialData?.title || '');
  const [description, setDescription] = useState(initialData?.description || '');
  const [authors, setAuthors] = useState(initialData?.authors?.join(', ') || '');
  const [coverImageUrl, setCoverImageUrl] = useState(initialData?.cover_image_url || '');
  const [pdfUrl, setPdfUrl] = useState(initialData?.pdf_url || '');
  const [sortOrder, setSortOrder] = useState(initialData?.sort_order?.toString() || '99');

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
      <div className="flex-1 flex gap-6 min-h-0 relative z-10 overflow-y-auto [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-thumb]:bg-white/20">
        <div className="max-w-3xl mx-auto w-full flex flex-col gap-6 bg-black/40 border border-white/20 relative p-8 h-fit my-8">
          <CyberBrackets color="border-white/40" />
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="w-full lg:w-1/4">
              <ForgeLabel>MODULE_ID</ForgeLabel>
              <ForgeInput value={entityId} onChange={e => setEntityId(e.target.value)} placeholder="e.g. intro-to-ai" disabled={!!initialData?.id} className={!!initialData?.id ? "opacity-50 cursor-not-allowed" : ""} />
            </div>
            <div className="flex-1">
              <ForgeLabel>MODULE_TITLE</ForgeLabel>
              <ForgeInput value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Introduction to Artificial Intelligence" />
            </div>
          </div>
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="w-full lg:w-1/4">
              <ForgeLabel>SORT_ORDER</ForgeLabel>
              <ForgeInput value={sortOrder} onChange={e => setSortOrder(e.target.value)} placeholder="99" />
            </div>
            <div className="flex-1">
              <ForgeLabel>AUTHORS (COMMA SEPARATED)</ForgeLabel>
              <ForgeInput value={authors} onChange={e => setAuthors(e.target.value)} placeholder="e.g. John Doe, Jane Smith" />
            </div>
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
