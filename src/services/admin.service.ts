import { apiFetch } from "@/lib/apiFetch";
import { CosmosNode } from "@/hooks/cosmos/useCosmosData";

/** Builds an Error that carries the server's message (e.g. a DB constraint error), not just a generic label. */
async function toError(res: Response, fallback: string): Promise<Error> {
  try {
    const body = await res.json();
    if (body?.error) return new Error(`${fallback}: ${body.error}`);
  } catch { /* response was not JSON */ }
  return new Error(`${fallback} (HTTP ${res.status})`);
}

/**
 * Service for all admin mutations and privileged fetches (/api/v1/admin/*).
 * Requests carry the Firebase ID token (apiFetch); each route checks the `admin` claim and answers 403 otherwise.
 */
export const AdminService = {
  // --- ARTICLES ---
  getStandaloneArticles: async () => {
    const res = await apiFetch('/api/v1/admin/articles/standalone');
    if (!res.ok) throw await toError(res, 'Failed to fetch standalone articles');
    return res.json();
  },
  getTopicArticles: async (topicId: string) => {
    const res = await apiFetch(`/api/v1/admin/topics/${topicId}/articles`);
    if (!res.ok) throw await toError(res, 'Failed to fetch topic articles');
    return res.json();
  },
  getArticleDetails: async (articleId: string) => {
    const res = await apiFetch(`/api/v1/admin/articles/${articleId}`);
    if (!res.ok) throw await toError(res, 'Failed to fetch article details');
    return res.json();
  },
  saveArticle: async (payload: Record<string, unknown>) => {
    const res = await apiFetch('/api/v1/admin/articles', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw await toError(res, 'Failed to save article');
    return res;
  },
  deleteArticle: async (id: string) => {
    const res = await apiFetch(`/api/v1/admin/articles/${id}`, { method: 'DELETE' });
    if (!res.ok) throw await toError(res, 'Failed to delete article');
    return res;
  },

  // --- TOPICS ---
  saveTopic: async (payload: Record<string, unknown>) => {
    const res = await apiFetch('/api/v1/admin/topics', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw await toError(res, 'Failed to save topic');
    return res;
  },
  deleteTopic: async (id: string) => {
    const res = await apiFetch(`/api/v1/admin/topics/${id}`, { method: 'DELETE' });
    if (!res.ok) throw await toError(res, 'Failed to delete topic');
    return res;
  },

  // --- MODELS ---
  saveModel: async (payload: Record<string, unknown>) => {
    const res = await apiFetch('/api/v1/admin/models', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw await toError(res, 'Failed to save model');
    return res;
  },
  deleteModel: async (id: string) => {
    const res = await apiFetch(`/api/v1/admin/models/${id}`, { method: 'DELETE' });
    if (!res.ok) throw await toError(res, 'Failed to delete model');
    return res;
  },

  // --- TEXTBOOKS ---
  saveTextbook: async (payload: Record<string, unknown>) => {
    const res = await apiFetch('/api/v1/admin/textbooks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw await toError(res, 'Failed to save textbook');
    return res;
  },
  deleteTextbook: async (id: string) => {
    const res = await apiFetch(`/api/v1/admin/textbooks/${id}`, { method: 'DELETE' });
    if (!res.ok) throw await toError(res, 'Failed to delete textbook');
    return res;
  },

  // --- COSMOS MAPS ---
  saveCosmosMap: async (mapId: string, nodes: CosmosNode[]) => {
    const res = await apiFetch(`/api/v1/admin/cosmos/maps/${mapId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nodes })
    });
    if (!res.ok) throw await toError(res, 'Failed to save cosmos map');
    return res;
  }
};
