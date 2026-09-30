/**
 * ResearchBase API Configuration
 * Supports local development, Vercel deployments, and remote Render backend URLs.
 * 
 * If VITE_BACKEND_URL is provided (e.g. "https://researchbase-backend.onrender.com"),
 * all API requests will target the Render service directly.
 * Otherwise, relative paths ("/api/...") are used.
 */

export const BACKEND_URL = (import.meta.env.VITE_BACKEND_URL || '').replace(/\/+$/, '');

export function getApiUrl(endpoint: string): string {
  const clean = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  if (!BACKEND_URL) {
    return clean;
  }
  return `${BACKEND_URL}${clean}`;
}
