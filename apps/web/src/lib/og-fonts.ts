/**
 * Font loading utilities for OG image generation
 * Caches fonts to avoid re-fetching on every OG image generation
 */

// Cache font data in module scope (persists across requests in Edge runtime)
let cachedFontRegular: ArrayBuffer | null = null;
let cachedFontBold: ArrayBuffer | null = null;

/**
 * Font URLs for Geist Sans
 * Using jsDelivr CDN for reliable font hosting
 */
const FONT_URLS = {
  regular:
    "https://cdn.jsdelivr.net/npm/@fontsource/geist-sans@5.0.1/files/geist-sans-latin-400-normal.woff",
  bold: "https://cdn.jsdelivr.net/npm/@fontsource/geist-sans@5.0.1/files/geist-sans-latin-700-normal.woff",
};

/**
 * Fetch font with caching
 * Only fetches once, then reuses cached ArrayBuffer
 */
async function fetchFont(url: string): Promise<ArrayBuffer> {
  try {
    const response = await fetch(url, {
      // Cache for 24 hours
      next: { revalidate: 86_400 },
    });

    if (!response.ok) {
      throw new Error(`Font fetch failed: ${response.status}`);
    }

    return await response.arrayBuffer();
  } catch (error) {
    console.error(`Failed to fetch font from ${url}:`, error);
    throw error;
  }
}

/**
 * Get Geist Sans Regular font
 * Cached after first load
 */
export async function getGeistSansRegular(): Promise<ArrayBuffer> {
  if (cachedFontRegular) {
    return cachedFontRegular;
  }

  cachedFontRegular = await fetchFont(FONT_URLS.regular);
  return cachedFontRegular;
}

/**
 * Get Geist Sans Bold font
 * Cached after first load
 */
export async function getGeistSansBold(): Promise<ArrayBuffer> {
  if (cachedFontBold) {
    return cachedFontBold;
  }

  cachedFontBold = await fetchFont(FONT_URLS.bold);
  return cachedFontBold;
}

/**
 * Get both regular and bold fonts
 * Returns array of font definitions for ImageResponse
 */
export async function getGeistFonts() {
  const [regular, bold] = await Promise.all([
    getGeistSansRegular(),
    getGeistSansBold(),
  ]);

  return [
    {
      name: "Geist Sans",
      data: regular,
      weight: 400 as const,
      style: "normal" as const,
    },
    {
      name: "Geist Sans",
      data: bold,
      weight: 700 as const,
      style: "normal" as const,
    },
  ];
}
