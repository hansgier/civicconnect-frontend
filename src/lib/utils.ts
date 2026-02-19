import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Strips HTML tags from a string, returning plain text.
 * Used for truncated previews where rich text formatting should not render.
 * Safe for both plain text (no-op) and HTML input.
 */
export function stripHtml(html: string | null | undefined): string {
  if (!html) return '';
  // Use DOMParser to strip tags (handles entities correctly)
  const doc = new DOMParser().parseFromString(html, 'text/html');
  return doc.body.textContent || '';
}

/**
 * Checks if HTML content from TipTap is empty (i.e., only whitespace/empty tags).
 */
export function isContentEmpty(html: string): boolean {
  if (!html) return true;
  const doc = new DOMParser().parseFromString(html, 'text/html');
  const text = doc.body.textContent || "";
  return text.trim().length === 0;
}
