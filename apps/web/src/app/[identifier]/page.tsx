"use client";

import { Gift } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { StreamEmbed } from "@/components/stream-embed";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { Skeleton } from "@/components/ui/skeleton";
import { useArtistProfile } from "@/hooks/use-artist-profile";
import { SocialKey } from "@/lib/constants";
import { getTextRecord, ipfsToHttp } from "@/lib/utils";

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

export default function ArtistProfilePage() {
  const params = useParams();
  const identifier = params.identifier as string;
  const { data: artist, isLoading } = useArtistProfile(identifier);

  if (isLoading) {
    return (
      <div className="mx-auto w-full max-w-7xl py-12">
        <div className="mb-8 space-y-4">
          <Skeleton className="h-64 w-full rounded-lg border border-border bg-background/80 shadow-md" />
          <div className="flex items-center gap-6">
            <Skeleton className="h-32 w-32 rounded-full border border-border/30 border-dashed" />
            <div className="flex-1 space-y-3">
              <Skeleton className="h-8 w-48" />
              <Skeleton className="h-4 w-full max-w-lg" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!artist) {
    return (
      <div className="mx-auto w-full max-w-4xl py-16 text-center">
        <div className="space-y-4 rounded-lg border border-border bg-background/80 p-10 shadow-md">
          <div className="text-5xl">🤔</div>
          <h2 className="font-black text-2xl text-foreground leading-tight">
            Artist not found
          </h2>
          <p className="text-muted-foreground">
            This artist profile doesn't exist or hasn't been created yet.
          </p>
          <div className="flex justify-center">
            <Button asChild variant="outline">
              <Link href="/">Go Home</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const avatar = getTextRecord(artist.textRecords?.(), "avatar");
  const description = getTextRecord(artist.textRecords?.(), "description");

  return (
    <Container>
      <Button
        asChild
        className="mb-4 px-0 text-sm hover:bg-transparent hover:opacity-60"
        size="sm"
        variant="ghost"
      >
        <Link href="/">← Back to Home</Link>
      </Button>

      {artist.isStreaming && artist.streamUrl && artist.streamPlatform && (
        <div className="mb-8 overflow-hidden rounded-lg border border-border bg-primary/20 p-0 shadow-md">
          <StreamEmbed
            artistName={artist.subdomain || identifier}
            streamPlatform={artist.streamPlatform}
            streamUrl={artist.streamUrl}
            taggedArtists={artist.taggedArtists || []}
            walletAddress={artist.user?.address}
          />
        </div>
      )}

      <div className="mb-8 flex flex-col gap-6 rounded-lg border border-border bg-primary/20 px-8 py-10 shadow-md md:flex-row md:items-start">
        <div className="flex-shrink-0">
          {avatar ? (
            <Image
              alt={artist.subdomain || identifier}
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

        <div className="flex-1 space-y-4">
          <div className="space-y-2">
            <h1 className="font-black text-4xl text-foreground leading-tight">
              {artist.subdomain || identifier}
            </h1>
            {description && (
              <p className="text-foreground/90 text-lg leading-relaxed">
                {description}
              </p>
            )}
          </div>

          <Link href={`/${artist.subdomain || identifier}/gift`}>
            <Button size="lg">
              <Gift className="h-3 w-3" />
            </Button>
          </Link>
        </div>
      </div>

      <div className="rounded-lg border border-border bg-primary/20 px-4 py-6 shadow-md sm:px-8 sm:py-10">
        <h3 className="mb-4 font-black text-foreground text-xl leading-tight sm:mb-6 sm:text-2xl">
          🔗 Connect & Listen
        </h3>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3">
          {artist
            .textRecords?.()
            ?.filter((x) => SocialKey.safeParse(x.key).success)
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
