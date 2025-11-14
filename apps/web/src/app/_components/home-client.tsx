"use client";

import { parseAsStringLiteral, useQueryState } from "nuqs";
import { ArtistCard } from "@/app/_components/artist-card";
import { LivestreamCarousel } from "@/app/_components/livestream-carousel";
import {
  FILTER_OPTIONS,
  StickyFilterBar,
} from "@/app/_components/sticky-filter-bar";
import { Card } from "@/components/ui/card";
import { Container } from "@/components/ui/container";
import { Skeleton } from "@/components/ui/skeleton";
import { useAllArtists } from "@/hooks/use-all-artists";
import { ARTISTS_GRID_SIZE } from "@/lib/constants";

const LoadingSkeleton = () => (
  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
    {[...new Array(ARTISTS_GRID_SIZE)].map((_, i) => (
      <Card
        className="border-border bg-background/80 p-6"
        key={`artist-skeleton-${String(i)}`}
      >
        <Skeleton className="mb-4 size-16 rounded-2xl" />
        <Skeleton className="mb-2 h-5 w-32" />
        <Skeleton className="mb-4 h-4 w-48" />
      </Card>
    ))}
  </div>
);

const filterParser = parseAsStringLiteral(FILTER_OPTIONS);

export function HomeClient() {
  const { data: allArtists, isLoading } = useAllArtists();

  const [filter, setFilter] = useQueryState(
    "filter",
    filterParser.withDefault("all")
  );

  const [searchQuery, setSearchQuery] = useQueryState("q", {
    defaultValue: "",
    throttleMs: 300, // Built-in debouncing!
  });

  const liveArtists =
    allArtists?.filter((a) => a.activeBroadcast?.isLive) || [];
  const totalArtists = allArtists?.length || 0;
  const liveCount = liveArtists.length;
  const offlineCount = totalArtists - liveCount;

  const filteredArtists =
    allArtists?.filter((artist) => {
      const matchesSearch = artist.subdomain?.name
        ?.toLowerCase()
        .includes(searchQuery.toLowerCase());

      const matchesFilter =
        filter === "all" ||
        (filter === "live" && artist.activeBroadcast?.isLive) ||
        (filter === "offline" && !artist.activeBroadcast?.isLive);

      return matchesSearch && matchesFilter;
    }) || [];

  const renderEmptyState = () => {
    const emptyConfig = {
      all: {
        emoji: "👥",
        title: "No artists yet",
        message: "Be the first to join the platform!",
      },
      live: {
        emoji: "😴",
        title: "No one's live right now",
        message: "Check back later or browse all artists below",
      },
      offline: {
        emoji: "📴",
        title: "All artists are live!",
        message: "Everyone is streaming right now",
      },
    };

    const config = searchQuery
      ? {
          emoji: "🔍",
          title: "No artists found",
          message: "Try a different search term",
        }
      : emptyConfig[filter];

    return (
      <div className="py-24 text-center">
        <div className="mb-4 text-7xl">{config.emoji}</div>
        <h3 className="mb-2 font-bold text-2xl">{config.title}</h3>
        <p className="text-lg text-muted-foreground">{config.message}</p>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-[calc(100vh-42px)] bg-background">
        <div className="mx-auto max-w-7xl px-4 py-8">
          <div className="mb-6 h-[60vh] animate-pulse rounded-lg bg-muted" />
          <div className="mb-6 h-20 animate-pulse rounded-lg bg-muted" />
          <LoadingSkeleton />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-42px)] bg-background">
      <a
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:rounded-md focus:bg-brand focus:px-4 focus:py-2 focus:text-brand-foreground focus:outline-none focus:ring-2 focus:ring-brand focus:ring-offset-2"
        href="#artist-grid"
      >
        Skip to artists
      </a>

      <Container>
        <div className="flex h-full flex-1 flex-col gap-6">
          {liveArtists.length > 0 && (
            <div className="w-full">
              <div className="mb-3 flex items-center gap-2 px-4 lg:px-0">
                <span className="flex size-3">
                  <span className="absolute inline-flex size-3 animate-ping rounded-full bg-live opacity-75" />
                  <span className="relative inline-flex size-3 rounded-full bg-live" />
                </span>
                <span className="font-bold text-foreground text-lg uppercase tracking-wide">
                  Live Now
                </span>
              </div>
              <div className="max-h-[700px] min-h-[400px]">
                <LivestreamCarousel broadcasts={liveArtists} />
              </div>
            </div>
          )}

          <section className="w-full">
            <StickyFilterBar
              filter={filter}
              liveCount={liveCount}
              offlineCount={offlineCount}
              searchQuery={searchQuery}
              setFilter={setFilter}
              setSearchQuery={setSearchQuery}
              totalArtists={totalArtists}
            />

            <div className="mx-auto w-full" id="artist-grid">
              {filteredArtists.length === 0 && renderEmptyState()}
              {filteredArtists.length > 0 && (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
                  {filteredArtists.map((artist) => (
                    <ArtistCard
                      artist={artist}
                      key={artist.subdomain?.name ?? ""}
                    />
                  ))}
                </div>
              )}
            </div>
          </section>
        </div>
      </Container>
    </div>
  );
}
