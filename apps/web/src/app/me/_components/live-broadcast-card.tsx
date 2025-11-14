"use client";

import { ExternalLink, Youtube } from "lucide-react";
import { useEffect, useState } from "react";
import { AvatarGroup } from "@/components/avatar-group";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { TooltipProvider } from "@/components/ui/tooltip";
import type { OwnedProfile } from "@/hooks/use-owned-profile";
import { useUpdateBroadcast } from "@/hooks/use-update-broadcast";
import { TIME } from "@/lib/constants";

type LiveBroadcastCardProps = {
  profile: OwnedProfile;
};

/**
 * Format duration from timestamp to "Xh Ym" format
 */
function formatDuration(startedAt: bigint): string {
  const startMs = Number(startedAt) * TIME.MS_PER_SECOND;
  const now = Date.now();
  const diffMs = now - startMs;

  const hours = Math.floor(diffMs / TIME.MS_PER_HOUR);
  const minutes = Math.floor((diffMs % TIME.MS_PER_HOUR) / TIME.MS_PER_MINUTE);

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes}m`;
}

/**
 * Detect platform from URL
 */
function getPlatform(url: string): { name: string; icon: React.ReactNode } {
  const lowerUrl = url.toLowerCase();

  if (lowerUrl.includes("youtube.com") || lowerUrl.includes("youtu.be")) {
    return { name: "YouTube", icon: <Youtube className="h-4 w-4" /> };
  }

  if (lowerUrl.includes("twitch.tv")) {
    return { name: "Twitch", icon: <span className="text-lg">📺</span> };
  }

  return { name: "Stream", icon: <ExternalLink className="h-4 w-4" /> };
}

/**
 * Display current live broadcast information
 * Shows platform, URL, duration, tagged artists
 * Allows ending the stream
 */
export function LiveBroadcastCard({ profile }: LiveBroadcastCardProps) {
  const [duration, setDuration] = useState("0m");
  const updateBroadcast = useUpdateBroadcast();

  const activeBroadcast = profile.user?.activeBroadcast;

  // Update duration every minute
  useEffect(() => {
    if (!activeBroadcast?.startedAt) {
      return;
    }

    const updateTimer = () => {
      setDuration(formatDuration(activeBroadcast.startedAt));
    };

    updateTimer(); // Initial update
    const interval = setInterval(updateTimer, TIME.MS_PER_MINUTE); // Update every minute

    return () => clearInterval(interval);
  }, [activeBroadcast?.startedAt]);

  if (!activeBroadcast?.broadcastUrl) {
    return null;
  }

  const platform = getPlatform(activeBroadcast.broadcastUrl);

  // Get tagged artist details
  const taggedArtists =
    activeBroadcast.broadcastWith?.()?.filter(Boolean) || [];

  const handleEndStream = () => {
    updateBroadcast.mutate({
      isLive: false,
      broadcastUrl: "",
      guestWalletAddresses: [],
    });
  };

  return (
    <TooltipProvider>
      <Card className="relative overflow-hidden border-live/30 bg-background/80 p-6 backdrop-blur before:absolute before:inset-0 before:bg-live/10">
        <div className="relative z-10 space-y-4">
          {/* Live Badge + Duration */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="flex h-6 items-center gap-2 rounded-full bg-live px-3 py-1 font-semibold text-live-foreground text-xs">
                <span className="h-2 w-2 animate-pulse rounded-full bg-white" />
                LIVE
              </span>
              <span className="text-md text-muted-foreground">{duration}</span>
            </div>
          </div>

          {/* Platform + URL */}
          <div>
            <div className="mb-2 flex items-center gap-2 text-md text-muted-foreground">
              {platform.icon}
              <span>{platform.name}</span>
            </div>
            <a
              className="group flex items-center gap-2 text-brand hover:text-brand"
              href={activeBroadcast.broadcastUrl}
              rel="noopener noreferrer"
              target="_blank"
            >
              <span className="truncate text-md">
                {activeBroadcast.broadcastUrl}
              </span>
              <ExternalLink className="h-3 w-3 flex-shrink-0 opacity-0 transition-opacity group-hover:opacity-100" />
            </a>
          </div>

          {/* End Stream Button */}
          <Button
            className="w-full border-border hover:border-live/50 hover:bg-live/10"
            disabled={updateBroadcast.isPending}
            onClick={handleEndStream}
            variant="outline"
          >
            {updateBroadcast.isPending ? "Ending..." : "End Stream"}
          </Button>

          {/* Tagged Artists */}
          {taggedArtists.length > 0 && (
            <div className="flex justify-center">
              <AvatarGroup artists={taggedArtists} size="sm" />
            </div>
          )}
        </div>
      </Card>
    </TooltipProvider>
  );
}
