"use client";

import React from 'react';
import ArticleForge from './forges/ArticleForge';
import TopicForge from './forges/TopicForge';
import ModelForge from './forges/ModelForge';
import TextbookForge from './forges/TextbookForge';

export type AdminTab = 'nebulas' | 'stars' | 'anomalies' | 'models' | 'textbooks';

export interface EntityForgeProps {
  activeTab: AdminTab;
  onClose: () => void;
  onSave: (data: Record<string, unknown>) => void;
  initialData?: any;
}

export default function EntityForge({ activeTab, onClose, onSave, initialData }: EntityForgeProps) {
  switch (activeTab) {
    case 'stars':
    case 'anomalies':
      return <ArticleForge onClose={onClose} onSave={onSave} initialData={initialData} isAnomaly={activeTab === 'anomalies'} />;
    case 'nebulas':
      return <TopicForge onClose={onClose} onSave={onSave} initialData={initialData} />;
    case 'models':
      return <ModelForge onClose={onClose} onSave={onSave} initialData={initialData} />;
    case 'textbooks':
      return <TextbookForge onClose={onClose} onSave={onSave} initialData={initialData} />;
    default:
      return null;
  }
}
