/**
 * Centralized configuration for all tools
 * Single source of truth for authentication requirements and tool metadata
 */

export const AUTH_REQUIRED_URLS = [
  '/app/bookmark',
  '/app/bookmark/dashboard',
  '/app/bookmark/bookmarks',
  '/app/bookmark/collections',
  '/app/bookmark/tags',
  '/app/notes',
  '/app/to-do',
  '/app/url-shortener',
] as const;

/**
 * Check if a URL requires authentication
 */
export function requiresAuth(url: string): boolean {
  // Check exact matches
  if (AUTH_REQUIRED_URLS.includes(url as any)) {
    return true;
  }
  
  // Check if URL starts with any auth-required path
  if (url.startsWith('/app/bookmark/collections/')) {
    return true;
  }
  
  return false;
}

/**
 * Tool metadata for enhanced discovery and search
 */
export interface ToolMetadata {
  title: string;
  url: string;
  description: string;
  tags: string[];
  category: string;
  keywords: string[];
  requiresAuth: boolean;
  featured?: boolean;
  badge?: string;
}

/**
 * Get all auth-required URLs as a readonly array
 */
export function getAuthRequiredUrls(): readonly string[] {
  return AUTH_REQUIRED_URLS;
}
