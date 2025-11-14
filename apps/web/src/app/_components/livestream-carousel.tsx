"use client";

import { StreamEmbed } from "@/components/stream-embed";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
import type { ActiveBroadcasts } from "@/hooks/use-active-broadcast";

type LivestreamCarouselProps = {
  broadcasts: ActiveBroadcasts;
};

export function LivestreamCarousel({ broadcasts }: LivestreamCarouselProps) {
  if (!broadcasts || broadcasts.length === 0) {
    return null;
  }

  return (
    <div className="w-full">
      <Carousel
        className="w-full"
        opts={{
          loop: true,
          align: "start",
          slidesToScroll: 1,
        }}
      >
        <CarouselContent className="md:-ml-4 ml-0">
          {broadcasts.map((broadcast, index) => (
            <CarouselItem
              className="basis-full pl-0 md:basis-1/3 md:pl-4"
              key={broadcast.subdomain?.name ?? `broadcast-${index}`}
            >
              <div className="h-[400px]">
                {broadcast.activeBroadcast?.broadcastUrl ? (
                  <StreamEmbed
                    artistName={broadcast.subdomain?.name ?? ""}
                    showPlatformBadge
                    streamPlatform={"youtube"}
                    streamUrl={broadcast.activeBroadcast?.broadcastUrl}
                    taggedArtists={
                      broadcast.activeBroadcast
                        ?.broadcastWith?.()
                        ?.map((b) => b.subdomain?.name ?? "") ?? []
                    }
                  />
                ) : (
                  <div className="flex h-full items-center justify-center rounded-lg bg-background">
                    <p className="text-muted-foreground">Stream unavailable</p>
                  </div>
                )}
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>
    </div>
  );
}
