"use client";

import React, { useState, useEffect } from 'react';
import CyberBrackets from '@/components/ui/CyberBrackets';
import { ForgeLabel, ForgeInput, ForgeTextarea, ForgeHeader, ForgeWrapper } from './ForgeShared';

interface ModelForgeProps {
  onClose: () => void;
  onSave: (data: Record<string, unknown>) => void;
  initialData?: any;
}

export default function ModelForge({ onClose, onSave, initialData }: ModelForgeProps) {
  const [entityId, setEntityId] = useState('');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [taskType, setTaskType] = useState('');
  const [fileUrl, setFileUrl] = useState('');
  const [metadataUrl, setMetadataUrl] = useState('');
  const [version, setVersion] = useState('1.0');
  const [format, setFormat] = useState('litert');
  const [fileSizeBytes, setFileSizeBytes] = useState('0');

  useEffect(() => {
    if (initialData) {
      setEntityId(initialData.id || '');
      setName(initialData.name || '');
      setTaskType(initialData.taskType || '');
      setFileUrl(initialData.fileUrl || '');
      setMetadataUrl(initialData.metadataUrl || '');
      setVersion(initialData.version || '1.0');
      setDescription(initialData.description || '');
      setFormat(initialData.format || 'litert');
      setFileSizeBytes(initialData.fileSizeBytes?.toString() || '0');
    }
  }, [initialData]);

  const handleSave = () => {
    onSave({ 
      id: entityId, name, description, taskType, fileUrl, metadataUrl, version, format, 
      fileSizeBytes: parseInt(fileSizeBytes) || 0 
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
      </div>
    </ForgeWrapper>
  );
}
