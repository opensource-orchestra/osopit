"use client";

import { Gift } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useArtistProfile } from "@/hooks/use-artist-profile";
import { getTextRecord } from "@/lib/utils";
import { ArtistAvatar } from "./artist-avatar";
import { DonationPopover } from "./donation-modal";
import { Button } from "./ui/button";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "./ui/drawer";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { Skeleton } from "./ui/skeleton";

type ArtistQuickActionsProps = {
  ensName: string;
  children: React.ReactNode;
};

function ArtistPreviewContent({ ensName }: { ensName: string }) {
  const { data: artist, isLoading } = useArtistProfile(ensName);

  if (isLoading) {
    return (
      <div className="w-72 p-4">
        <div className="mb-4 flex items-center gap-3">
          <Skeleton className="h-12 w-12 rounded-full" />
          <div className="flex-1">
            <Skeleton className="mb-2 h-4 w-24" />
            <Skeleton className="h-3 w-32" />
          </div>
        </div>
      </div>
    );
  }

  if (!artist) {
    return (
      <div className="w-72 p-4 text-center">
        <p className="text-md text-muted-foreground">Artist not found</p>
      </div>
    );
  }

  const avatar = getTextRecord(
    artist.user?.subdomain?.textRecords?.(),
    "avatar"
  );
  const description = getTextRecord(
    artist.user?.subdomain?.textRecords?.(),
    "description"
  );

  return (
    <>
      <div className="mb-4 flex items-center gap-3">
        <ArtistAvatar
          avatarUrl={avatar}
          className="border-2 border-border"
          name={artist.subdomain ?? ""}
          size="md"
        />
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h4 className="font-semibold text-foreground">
              {artist.subdomain ?? ""}
            </h4>
            {artist.user?.activeBroadcast?.isLive && (
              <span className="rounded-full bg-live/20 px-2 py-0.5 text-live text-xs">
                LIVE
              </span>
            )}
          </div>
        </div>
      </div>

      <p className="mb-4 line-clamp-3 text-md text-muted-foreground">
        {description || "Description"}
      </p>

      <div className="flex gap-2">
        <Button asChild className="flex-1" size="sm" variant="outline">
          <Link href={`/${artist.subdomain ?? ""}`}>View Profile</Link>
        </Button>
        <DonationPopover
          ensName={artist.subdomain ?? ""}
          walletAddress={artist.user?.address}
        >
          <Button size="sm">
            <Gift className="h-3 w-3" />
          </Button>
        </DonationPopover>
      </div>
    </>
  );
}

const MOBILE_WIDTH = 768;

export function ArtistQuickActions({
  ensName,
  children,
}: ArtistQuickActionsProps) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < MOBILE_WIDTH);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Mobile: use Drawer
  if (isMobile) {
    return (
      <Drawer>
        <DrawerTrigger asChild>{children}</DrawerTrigger>
        <DrawerContent className="border-border bg-card">
          <DrawerHeader>
            <DrawerTitle className="text-foreground">
              Artist Profile
            </DrawerTitle>
          </DrawerHeader>
          <div className="mt-4 px-4 pb-4">
            <ArtistPreviewContent ensName={ensName} />
          </div>
        </DrawerContent>
      </Drawer>
    );
  }

  // Desktop: use Popover
  return (
    <Popover>
      <PopoverTrigger asChild>{children}</PopoverTrigger>
      <PopoverContent className="border-border bg-card p-4">
        <ArtistPreviewContent ensName={ensName} />
      </PopoverContent>
    </Popover>
  );
}
