import type { Metadata } from "next";
import { HomeClient } from "@/app/_components/home-client";
import { createOgImageUrl } from "@/lib/og-utils";

/**
 * Home page metadata with OG image
 * This runs server-side and enables proper social media previews
 */
export async function generateMetadata(): Promise<Metadata> {
  const ogImageUrl = createOgImageUrl("/api/og/home");

  return {
    title: "osopit - Live streaming platform for artists",
    description:
      "Connect with creators, support artists, and experience live performances. Join the community on osopit.",
    openGraph: {
      title: "osopit - Live streaming platform for artists",
      description:
        "Connect with creators, support artists, and experience live performances. Join the community on osopit.",
      images: [
        {
          url: ogImageUrl,
          width: 1200,
          height: 630,
          alt: "osopit - Live streaming platform for artists",
        },
      ],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: "osopit - Live streaming platform for artists",
      description:
        "Connect with creators, support artists, and experience live performances.",
      images: [ogImageUrl],
    },
  };
}

/**
 * Home page - server component wrapper
 * Renders client component for interactivity (filters, search, etc.)
 */
export default function HomePage() {
  return <HomeClient />;
}
