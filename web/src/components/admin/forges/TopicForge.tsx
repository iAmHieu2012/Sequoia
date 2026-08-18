"use client";

import React, { useState } from 'react';
import CyberBrackets from '@/components/ui/CyberBrackets';
import { ForgeLabel, ForgeInput, ForgeTextarea, ForgeHeader, ForgeWrapper } from './ForgeShared';

interface TopicForgeProps {
  onClose: () => void;
  onSave: (data: Record<string, unknown>) => void;
  initialData?: {
    id?: string;
    name?: string;
    description?: string;
    sort_order?: number | string;
  };
}

/**
 * TopicForge Component
 * Form for creating and editing Nebulas (Topics).
 * Manages core topic metadata and sort ordering.
 */
export default function TopicForge({ onClose, onSave, initialData }: TopicForgeProps) {
  const [name, setName] = useState(initialData?.name || '');
  const [description, setDescription] = useState(initialData?.description || '');
  const [sortOrder, setSortOrder] = useState(initialData?.sort_order?.toString() || '99');

  const handleSave = () => {
    onSave({ id: initialData?.id, name, description, sort_order: parseInt(sortOrder) || 99 });
  };

  return (
    <ForgeWrapper>
      <ForgeHeader title="NEBULA_FORGE" onSave={handleSave} onClose={onClose} />
      <div className="flex-1 flex gap-6 min-h-0 relative z-10">
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
      </div>
    </ForgeWrapper>
  );
}
