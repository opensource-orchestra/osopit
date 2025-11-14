/**
 * Shared utilities for OG image generation
 * Centralizes common logic to avoid duplication across OG route handlers
 */

import { z } from "zod";
import { isEthereumAddress } from "./utils";

/**
 * Parse broadcast text record value
 * Format: "true|url|userId1|userId2|..."
 * Reused from hooks/use-artist-profile.ts
 */
export function parseBroadcast(value: string | undefined): {
  isLive: boolean;
  url?: string;
  taggedArtists?: string[];
} {
  if (!value) {
    return { isLive: false };
  }

  const parts = value.split("|");
  const isLive = parts[0] === "true";

  if (!isLive) {
    return { isLive: false };
  }

  return {
    isLive: true,
    url: parts[1] || undefined,
    taggedArtists: parts.slice(2).filter(Boolean),
  };
}

/**
 * Fetch image with timeout to prevent hanging OG generation
 * IPFS can be slow, so we timeout after 2s and use fallback
 */
export async function fetchImageWithTimeout(
  url: string,
  timeoutMs = 2000
): Promise<string | null> {
  if (!url) {
    return null;
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs);

    const response = await fetch(url, {
      signal: controller.signal,
      // Only fetch headers to check if image exists
      method: "HEAD",
    });

    clearTimeout(timeout);

    // If image exists and is accessible, return the URL
    return response.ok ? url : null;
  } catch (error) {
    // Timeout or network error - use fallback
    console.warn(`Image fetch timeout/error for ${url}:`, error);
    return null;
  }
}

/**
 * Validation schema for OG image identifier parameter
 */
export const OgIdentifierSchema = z
  .string()
  .min(1, "Identifier cannot be empty")
  .max(100, "Identifier too long")
  .refine(
    (val) => {
      // Must be either valid ENS name or Ethereum address
      const isAddress = isEthereumAddress(val);
      // biome-ignore lint/performance/useTopLevelRegex: <LIFE IS SHORT>
      const isEnsName = /^[a-z0-9-]+(\.[a-z0-9-]+)*$/i.test(val);
      return isAddress || isEnsName;
    },
    {
      message:
        "Invalid identifier format (must be ENS name or Ethereum address)",
    }
  );

/**
 * Truncate text with ellipsis for OG images
 * Prevents overflow in OG image layouts
 */
export function truncateText(text: string, maxLength: number): string {
  if (!text || text.length <= maxLength) {
    return text;
  }
  return `${text.slice(0, maxLength).trim()}...`;
}

/**
 * Get base URL for OG image generation
 * Uses NEXT_PUBLIC_URL, VERCEL_URL, or localhost fallback
 */
export function getBaseUrl(): string {
  // Explicit public URL (production)
  if (process.env.NEXT_PUBLIC_URL) {
    return process.env.NEXT_PUBLIC_URL;
  }

  // Vercel deployment URL (preview/production)
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }

  // Local development
  return "http://localhost:3001";
}

/**
 * Create OG image URL with proper base URL
 */
export function createOgImageUrl(
  path: string,
  params?: Record<string, string>
): string {
  const baseUrl = getBaseUrl();
  const url = new URL(path, baseUrl);

  if (params) {
    for (const [key, value] of Object.entries(params)) {
      url.searchParams.set(key, value);
    }
  }

  return url.toString();
}
