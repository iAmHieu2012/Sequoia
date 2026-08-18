"use client";

import React, { useState } from 'react';
import CyberBrackets from '@/components/ui/CyberBrackets';
import { ForgeLabel, ForgeInput, ForgeTextarea, ForgeHeader, ForgeWrapper } from './ForgeShared';

interface ModelForgeProps {
  onClose: () => void;
  onSave: (data: Record<string, unknown>) => void;
  initialData?: {
    id?: string;
    name?: string;
    description?: string;
    task_type?: string;
    file_url?: string;
    metadata_url?: string;
    version?: string;
    format?: string;
    file_size_bytes?: number | string;
  };
}

/**
 * ModelForge Component
 * Form for creating and editing AI Models in the Labs section.
 * Manages model metadata, file URLs, and versioning details.
 */
export default function ModelForge({ onClose, onSave, initialData }: ModelForgeProps) {
  const [entityId, setEntityId] = useState(initialData?.id || '');
  const [name, setName] = useState(initialData?.name || '');
  const [description, setDescription] = useState(initialData?.description || '');
  const [taskType, setTaskType] = useState(initialData?.task_type || '');
  const [fileUrl, setFileUrl] = useState(initialData?.file_url || '');
  const [metadataUrl, setMetadataUrl] = useState(initialData?.metadata_url || '');
  const [version, setVersion] = useState(initialData?.version || '1.0');
  const [format, setFormat] = useState(initialData?.format || 'litert');
  const [fileSizeBytes, setFileSizeBytes] = useState(initialData?.file_size_bytes?.toString() || '0');

  const handleSave = () => {
    onSave({ 
      id: entityId, name, description, task_type: taskType, file_url: fileUrl, metadata_url: metadataUrl, version, format, 
      file_size_bytes: parseInt(fileSizeBytes) || 0 
    });
  };

  return (
    <ForgeWrapper>
      <ForgeHeader title="MODEL_FORGE" onSave={handleSave} onClose={onClose} />
      <div className="flex-1 flex gap-6 min-h-0 relative z-10">
        <div className="max-w-3xl mx-auto w-full flex flex-col gap-6 bg-black/40 border border-white/20 relative p-8 h-fit">
          <CyberBrackets color="border-white/40" />
          <div className="flex gap-4">
            <div className="flex-1">
              <ForgeLabel>MODEL_ID</ForgeLabel>
              <ForgeInput value={entityId} onChange={e => setEntityId(e.target.value)} placeholder="e.g. yolov8n-detect" disabled={!!initialData?.id} className={!!initialData?.id ? "opacity-50 cursor-not-allowed" : ""} />
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
      </div>
    </ForgeWrapper>
  );
}
