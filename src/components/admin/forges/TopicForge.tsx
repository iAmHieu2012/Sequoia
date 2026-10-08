"use client";

import React, { useState } from 'react';
import CyberPanel from '@/components/ui/CyberPanel';
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
    const parsedOrder = parseInt(sortOrder, 10);
    onSave({ id: initialData?.id, name, description, sort_order: !isNaN(parsedOrder) ? parsedOrder : 99 });
  };

  return (
    <ForgeWrapper>
      <ForgeHeader title="NEBULA_FORGE" onSave={handleSave} onClose={onClose} />
      <div className="flex-1 flex gap-6 min-h-0 relative z-10 overflow-y-auto">
        <CyberPanel variant="solid-dark" chamfer="none" decorations="brackets" className="max-w-2xl mx-auto w-full flex flex-col gap-6 p-8 h-fit my-8">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <ForgeLabel>NEBULA_NAME</ForgeLabel>
              <ForgeInput value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Computer Vision" />
            </div>
            <div className="w-full lg:w-1/4">
              <ForgeLabel>SORT_ORDER</ForgeLabel>
              <ForgeInput value={sortOrder} onChange={e => setSortOrder(e.target.value)} placeholder="99" />
            </div>
          </div>
          <div>
            <ForgeLabel>DESCRIPTION</ForgeLabel>
            <ForgeTextarea value={description} onChange={e => setDescription(e.target.value)} rows={4} placeholder="Description of the topic..." />
          </div>
        </CyberPanel>
      </div>
    </ForgeWrapper>
  );
}
