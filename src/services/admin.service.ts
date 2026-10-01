import { CosmosNode } from "@/hooks/cosmos/useCosmosData";

/**
 * Service for handling all Admin-level mutations and privileged fetches.
 * Assumes the user is authenticated; the server automatically verifies cookies.
 */
export const AdminService = {
  // --- ARTICLES ---
  getStandaloneArticles: async () => {
    const res = await fetch('/api/v1/admin/articles/standalone');
    if (!res.ok) throw new Error('Failed to fetch standalone articles');
    return res.json();
  },
  getTopicArticles: async (topicId: string) => {
    const res = await fetch(`/api/v1/admin/topics/${topicId}/articles`);
    if (!res.ok) throw new Error('Failed to fetch topic articles');
    return res.json();
  },
  getArticleDetails: async (articleId: string) => {
    const res = await fetch(`/api/v1/admin/articles/${articleId}`);
    if (!res.ok) throw new Error('Failed to fetch article details');
    return res.json();
  },
  saveArticle: async (payload: Record<string, unknown>) => {
    const res = await fetch('/api/v1/admin/articles', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error('Failed to save article');
    return res;
  },
  deleteArticle: async (id: string) => {
    const res = await fetch(`/api/v1/admin/articles/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Failed to delete article');
    return res;
  },

  // --- TOPICS ---
  saveTopic: async (payload: Record<string, unknown>) => {
    const res = await fetch('/api/v1/admin/topics', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error('Failed to save topic');
    return res;
  },
  deleteTopic: async (id: string) => {
    const res = await fetch(`/api/v1/admin/topics/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Failed to delete topic');
    return res;
  },

  // --- MODELS ---
  saveModel: async (payload: Record<string, unknown>) => {
    const res = await fetch('/api/v1/admin/models', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error('Failed to save model');
    return res;
  },
  deleteModel: async (id: string) => {
    const res = await fetch(`/api/v1/admin/models/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Failed to delete model');
    return res;
  },

  // --- TEXTBOOKS ---
  saveTextbook: async (payload: Record<string, unknown>) => {
    const res = await fetch('/api/v1/admin/textbooks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error('Failed to save textbook');
    return res;
  },
  deleteTextbook: async (id: string) => {
    const res = await fetch(`/api/v1/admin/textbooks/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Failed to delete textbook');
    return res;
  },

  // --- COSMOS MAPS ---
  saveCosmosMap: async (mapId: string, nodes: CosmosNode[]) => {
    const res = await fetch(`/api/v1/admin/cosmos/maps/${mapId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nodes })
    });
    if (!res.ok) throw new Error('Failed to save cosmos map');
    return res;
  }
};
