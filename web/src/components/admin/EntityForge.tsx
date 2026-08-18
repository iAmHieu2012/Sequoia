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
  initialData?: Record<string, unknown> | null;
}

/**
 * EntityForge Component
 * Acts as a Factory/Router to render the appropriate creation/editing Form (Forge)
 * depending on the active tab (Article, Topic, Model, or Textbook).
 */
export default function EntityForge({ activeTab, onClose, onSave, initialData }: EntityForgeProps) {
  switch (activeTab) {
    case 'stars':
    case 'anomalies':
      return <ArticleForge key={(initialData?.id as string) ?? 'new-article'} onClose={onClose} onSave={onSave} initialData={initialData as React.ComponentProps<typeof ArticleForge>['initialData']} isAnomaly={activeTab === 'anomalies'} />;
    case 'nebulas':
      return <TopicForge key={(initialData?.id as string) ?? 'new-topic'} onClose={onClose} onSave={onSave} initialData={initialData as React.ComponentProps<typeof TopicForge>['initialData']} />;
    case 'models':
      return <ModelForge key={(initialData?.id as string) ?? 'new-model'} onClose={onClose} onSave={onSave} initialData={initialData as React.ComponentProps<typeof ModelForge>['initialData']} />;
    case 'textbooks':
      return <TextbookForge key={(initialData?.id as string) ?? 'new-textbook'} onClose={onClose} onSave={onSave} initialData={initialData as React.ComponentProps<typeof TextbookForge>['initialData']} />;
    default:
      return null;
  }
}
