'use client';

import { useEffect } from 'react';

/**
 * Registers the service worker for PWA support.
 * Only registers in production to avoid caching issues during development.
 */
export default function ServiceWorkerRegistrar() {
  useEffect(() => {
    if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
      navigator.serviceWorker.register('/sw.js').catch((error) => {
        console.error('SW registration failed:', error);
      });
    }
  }, []);

  return null;
}
