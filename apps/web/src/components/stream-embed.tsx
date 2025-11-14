"use client";

import { Gift } from "lucide-react";
import { ArtistAvatar } from "@/components/artist-avatar";
import { ArtistQuickActions } from "@/components/artist-quick-actions";
import { DonationPopover } from "@/components/donation-modal";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { convertToEmbedUrl } from "@/lib/broadcast";

type StreamEmbedProps = {
  streamUrl: string;
  streamPlatform: string;
  artistName?: string;
  walletAddress?: string;
  showPlatformBadge?: boolean;
  taggedArtists?: string[];
};

export function StreamEmbed({
  streamUrl,
  artistName,
  walletAddress,
  showPlatformBadge = true,
  taggedArtists = [],
}: StreamEmbedProps) {
  // Convert the URL to embeddable format
  const embedUrl = convertToEmbedUrl(streamUrl);

  return (
    <TooltipProvider>
      <div className="flex h-full flex-col overflow-hidden rounded-none border-0 border-border bg-background/80 md:rounded-lg md:border">
        <div className="relative flex-1">
          <iframe
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="h-full w-full"
            src={embedUrl}
            title={`${artistName} livestream`}
          />
        </div>
        {showPlatformBadge && (
          <div className="border-border border-t bg-background/80 px-3 py-2 backdrop-blur">
            <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
              {/* Left: Artist info + gift button */}
              {artistName && (
                <div className="flex items-center gap-1.5">
                  <ArtistQuickActions ensName={artistName}>
                    <button
                      className="flex items-center gap-1.5 transition-opacity hover:opacity-80"
                      type="button"
                    >
                      <ArtistAvatar
                        avatarUrl={`https://avatars.jakerunzer.com/${artistName}`}
                        className="border border-border"
                        name={artistName}
                        size="xs"
                      />
                      <span className="text-muted-foreground text-xs">
                        {artistName}
                      </span>
                    </button>
                  </ArtistQuickActions>

                  {/* Tagged Artists Avatars */}
                  {taggedArtists.length > 0 && (
                    <div className="flex">
                      {taggedArtists.map((artist, index) => (
                        <Tooltip key={artist}>
                          <TooltipTrigger asChild>
                            <ArtistQuickActions ensName={artist}>
                              <button
                                className={`transition-transform hover:z-10 hover:scale-110 ${index > 0 ? "-ml-1.5" : ""}`}
                                type="button"
                              >
                                <ArtistAvatar
                                  avatarUrl={`https://avatars.jakerunzer.com/${artist}`}
                                  className="border border-brand"
                                  name={artist}
                                  size="xs"
                                />
                              </button>
                            </ArtistQuickActions>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>{artist}</p>
                          </TooltipContent>
                        </Tooltip>
                      ))}
                    </div>
                  )}

                  {artistName && (
                    <DonationPopover
                      ensName={artistName}
                      walletAddress={walletAddress}
                    >
                      <Button
                        className="h-7 gap-1.5 text-xs"
                        size="sm"
                        variant="outline"
                      >
                        <Gift className="h-3 w-3" />
                      </Button>
                    </DonationPopover>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </TooltipProvider>
  );
}
