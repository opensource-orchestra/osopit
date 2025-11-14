"use client";

import Link from "next/link";
import { ArtistAvatar } from "@/components/artist-avatar";
import { TooltipProvider } from "@/components/ui/tooltip";
import type { User } from "@/gqty";
import { getTextRecord } from "@/lib/utils";

type ArtistCardProps = {
  artist: User;
};

export const ArtistCard = ({ artist }: ArtistCardProps) => {
  const avatar = getTextRecord(artist.subdomain?.textRecords?.(), "avatar");
  const isLive = artist.activeBroadcast?.isLive;
  const description = getTextRecord(
    artist.subdomain?.textRecords?.(),
    "description"
  );
  const cardClassName = [
    "group relative flex h-full flex-col overflow-hidden rounded-lg border bg-primary/20 px-6 pb-6 pt-6 text-left shadow-sm transition-all duration-200  shadow shadow-primary/50 hover:shadow-md",
    isLive ? "border-live/50 ring-2 ring-live/20" : "border-border",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <TooltipProvider>
      <div className="h-full">
        <article className={cardClassName}>
          <Link
            className="flex h-full flex-col gap-5"
            href={`/${artist.subdomain?.name ?? ""}`}
          >
            <div className="flex items-center justify-between gap-4">
              <div
                className={
                  "inline-flex size-16 items-center justify-center text-2xl"
                }
              >
                <ArtistAvatar
                  avatarUrl={avatar}
                  className={`size-16 rounded-2xl border-2 ${
                    isLive ? "border-live" : "border-border"
                  }`}
                  name={artist.subdomain?.name ?? ""}
                  size="lg"
                />
              </div>
              <span
                className={`rounded-full px-3 py-1.5 font-semibold text-xs uppercase tracking-wider ${
                  isLive
                    ? "bg-live text-live-foreground"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {isLive ? "LIVE" : "OFFLINE"}
              </span>
            </div>
            <div>
              <h3 className="font-bold text-foreground text-xl">
                {artist.subdomain?.name ?? ""}
              </h3>
              <p className="mt-2 line-clamp-2 text-muted-foreground text-sm leading-relaxed">
                {description ? description : "No description"}
              </p>
            </div>
          </Link>
        </article>
      </div>
    </TooltipProvider>
  );
};
