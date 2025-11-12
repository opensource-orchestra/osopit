"use client";

import { useEffect, useState } from "react";
import type { ActiveBroadcasts } from "@/hooks/use-active-broadcast";
import { StreamEmbed } from "./stream-embed";
import {
  Carousel,
  type CarouselApi,
  CarouselContent,
  CarouselItem,
} from "./ui/carousel";

type LivestreamCarouselProps = {
  broadcasts: ActiveBroadcasts;
};

export function LivestreamCarousel({ broadcasts }: LivestreamCarouselProps) {
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (!api) {
      return;
    }

    setCurrent(api.selectedScrollSnap());

    const handleSelect = () => {
      setCurrent(api.selectedScrollSnap());
    };

    api.on("select", handleSelect);

    return () => {
      api.off("select", handleSelect);
    };
  }, [api]);

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
        setApi={setApi}
      >
        <CarouselContent className="-ml-4">
          {broadcasts.map((broadcast, index) => (
            <CarouselItem
              className="basis-full pl-4 sm:basis-1/2 md:basis-1/3"
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
                  <div className="flex h-full items-center justify-center rounded-lg bg-surface-elevated">
                    <p className="text-muted-foreground">Stream unavailable</p>
                  </div>
                )}
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>

      {broadcasts.length > 1 && (
        <div className="mt-6 flex justify-center gap-2">
          {broadcasts.map((broadcast, index) => (
            <button
              aria-label={`Go to stream ${index + 1} of ${broadcasts.length}`}
              className={`h-2 rounded-full transition-all duration-300 ${
                index === current
                  ? "w-12 bg-live shadow-lg shadow-live/50"
                  : "w-2 bg-muted-foreground/30 hover:scale-125 hover:bg-muted-foreground/60"
              }`}
              key={`dot-${broadcast.subdomain?.name ?? index}`}
              onClick={() => api?.scrollTo(index)}
              type="button"
            />
          ))}
        </div>
      )}
    </div>
  );
}
