import { Gift } from "lucide-react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { StreamEmbed } from "@/components/stream-embed";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { SocialKey } from "@/lib/constants";
import { getCurrentEnsEnvironment } from "@/lib/ens-environments";
import { getArtistProfileServer } from "@/lib/get-artist-profile-server";
import { createOgImageUrl } from "@/lib/og-utils";
import { formatAddress, getTextRecord, ipfsToHttp } from "@/lib/utils";

type PageProps = {
  params: Promise<{ identifier: string }>;
};

const SOCIAL_ICONS: Record<SocialKey, string> = {
  "com.spotify": "🎵",
  "com.soundcloud": "🎧",
  "com.twitch": "📺",
  "com.youtube": "▶️",
  "com.twitter": "🐦",
  "com.instagram": "📷",
  "com.github": "🔧",
  "com.discord": "🔗",
  "com.telegram": "🔗",
  "com.tiktok": "🔗",
  "com.facebook": "🔗",
  "com.linkedin": "🔗",
  "com.pinterest": "🔗",
  "com.reddit": "🔗",
};

/**
 * Generate metadata for artist profile page
 * Runs server-side for proper SEO and social media previews
 */
export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { identifier } = await params;
  const profile = await getArtistProfileServer(identifier);

  if (!profile) {
    return {
      title: "Artist not found - osopit",
      description: "This artist profile doesn't exist.",
    };
  }

  const envConfig = getCurrentEnsEnvironment();
  const displayName = profile.subdomain?.name || identifier;
  const description = getTextRecord(profile.textRecords, "description") || "";
  const fullDomain = profile.subdomain
    ? `${profile.subdomain.name}.${envConfig.domain}`
    : formatAddress(profile.address);

  const ogImageUrl = createOgImageUrl("/api/og/artist", { identifier });

  return {
    title: `${displayName} - osopit`,
    description:
      description || `View ${displayName}'s profile on osopit - ${fullDomain}`,
    openGraph: {
      title: displayName,
      description:
        description ||
        `Check out ${displayName}'s profile on osopit - ${fullDomain}`,
      images: [
        {
          url: ogImageUrl,
          width: 1200,
          height: 630,
          alt: `${displayName}'s profile`,
        },
      ],
      type: "profile",
    },
    twitter: {
      card: "summary_large_image",
      title: displayName,
      description:
        description ||
        `Check out ${displayName}'s profile on osopit - ${fullDomain}`,
      images: [ogImageUrl],
    },
  };
}

/**
 * Artist profile page - server component
 * Fetches data once and renders directly (no client wrapper)
 */
export default async function ArtistProfilePage({ params }: PageProps) {
  const { identifier } = await params;

  // Fetch artist data server-side
  const artist = await getArtistProfileServer(identifier);

  // Show 404 if artist not found
  if (!artist) {
    notFound();
  }

  // Extract profile data
  const avatar = getTextRecord(artist.textRecords, "avatar");
  const description = getTextRecord(artist.textRecords, "description");
  const displayName = artist.subdomain?.name || identifier;

  return (
    <Container>
      {/* Back button */}
      <Button
        asChild
        className="mb-4 px-0 text-sm hover:bg-transparent hover:opacity-60"
        size="sm"
        variant="ghost"
      >
        <Link href="/">← Back to Home</Link>
      </Button>

      {/* Stream embed (client island - only if streaming) */}
      {artist.isStreaming && artist.streamUrl && artist.streamPlatform && (
        <div className="mb-8 overflow-hidden rounded-lg border border-border bg-primary/20 p-0 shadow-md">
          <StreamEmbed
            artistName={displayName}
            streamPlatform={artist.streamPlatform}
            streamUrl={artist.streamUrl}
            taggedArtists={artist.taggedArtists}
            walletAddress={artist.address}
          />
        </div>
      )}

      {/* Profile section (server-rendered) */}
      <div className="mb-8 flex flex-col gap-6 rounded-lg border border-border bg-primary/20 px-8 py-10 shadow-md md:flex-row md:items-start">
        {/* Avatar */}
        <div className="flex-shrink-0">
          {avatar ? (
            <Image
              alt={displayName}
              className={`h-32 w-32 rounded-full border-2 ${
                artist.isStreaming ? "border-live" : "border-border"
              }`}
              height={128}
              src={ipfsToHttp(avatar)}
              width={128}
            />
          ) : (
            <div
              className={`flex h-32 w-32 items-center justify-center rounded-full border-2 ${
                artist.isStreaming ? "border-live" : "border-border"
              } bg-background/80 text-4xl`}
            >
              👤
            </div>
          )}
        </div>

        {/* Name, bio, and gift button */}
        <div className="flex-1 space-y-4">
          <div className="space-y-2">
            <h1 className="font-black text-4xl text-foreground leading-tight">
              {displayName}
            </h1>
            {description && (
              <p className="text-foreground/90 text-lg leading-relaxed">
                {description}
              </p>
            )}
          </div>

          <Link href={`/${displayName}/gift`}>
            <Button size="lg">
              <Gift className="h-3 w-3" />
            </Button>
          </Link>
        </div>
      </div>

      {/* Social links (server-rendered) */}
      <div className="rounded-lg border border-border bg-primary/20 px-4 py-6 shadow-md sm:px-8 sm:py-10">
        <h3 className="mb-4 font-black text-foreground text-xl leading-tight sm:mb-6 sm:text-2xl">
          🔗 Connect & Listen
        </h3>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3">
          {artist.textRecords
            .filter((record) => SocialKey.safeParse(record.key).success)
            .map((record) => (
              <a
                className="hover:-translate-y-0.5 flex w-full flex-nowrap items-center gap-2 rounded-lg border border-border bg-primary/20 px-3 py-2.5 shadow-sm transition-all duration-200 hover:shadow-md sm:gap-3 sm:px-4 sm:py-3"
                href={record.value}
                key={`${record.key}-${record.value}`}
                rel="noopener noreferrer"
                target="_blank"
              >
                <span className="flex flex-shrink-0 items-center justify-center text-lg leading-none sm:text-2xl">
                  {SOCIAL_ICONS[SocialKey.parse(record.key)] || "🔗"}
                </span>
                <div className="flex min-w-0 flex-1 flex-col gap-0.5 overflow-hidden">
                  <div className="min-w-0 truncate font-semibold text-foreground text-sm capitalize leading-tight sm:text-base">
                    {record.key}
                  </div>
                  <div className="min-w-0 truncate text-[10px] text-muted-foreground leading-tight sm:text-xs">
                    {record.value}
                  </div>
                </div>
                <span className="flex-shrink-0 text-muted-foreground text-sm sm:text-base">
                  →
                </span>
              </a>
            ))}
        </div>
      </div>
    </Container>
  );
}
