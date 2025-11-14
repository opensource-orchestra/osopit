"use client";

import { Search } from "lucide-react";
import type { Dispatch, ReactNode, SetStateAction } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export const FILTER_OPTIONS = ["all", "live", "offline"] as const;
export type FilterType = (typeof FILTER_OPTIONS)[number];

type StickyFilterBarProps = {
  searchQuery: string;
  setSearchQuery: Dispatch<SetStateAction<string>>;
  filter: FilterType;
  setFilter: Dispatch<SetStateAction<FilterType>>;
  totalArtists: number;
  liveCount: number;
  offlineCount: number;
  showThemeSwitcher?: boolean;
  themeSwitcher?: ReactNode;
};

export function StickyFilterBar({
  searchQuery,
  setSearchQuery,
  filter,
  setFilter,
  totalArtists,
  liveCount,
  offlineCount,
  showThemeSwitcher = false,
  themeSwitcher,
}: StickyFilterBarProps) {
  return (
    <div className="z-40 w-full bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex flex-col gap-4">
        <div className="relative">
          <Search className="-translate-y-1/2 absolute top-1/2 left-3 size-4 text-muted-foreground" />
          <Input
            aria-label="Search artists by name"
            className="h-11 pl-10"
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search artists..."
            type="search"
            value={searchQuery}
          />
        </div>

        <div className="mb-4 flex flex-col items-center justify-between gap-3 sm:flex-row">
          <div className="flex flex-1 items-center justify-between gap-2 sm:justify-start">
            <Button
              aria-pressed={filter === "all"}
              className="transition-all"
              onClick={() => setFilter("all")}
              size="sm"
              variant={filter === "all" ? "default" : "outline"}
            >
              All
              <span className="ml-1.5 text-xs opacity-70">{totalArtists}</span>
            </Button>
            <Button
              aria-pressed={filter === "live"}
              className="transition-all"
              onClick={() => setFilter("live")}
              size="sm"
              variant={filter === "live" ? "default" : "outline"}
            >
              <span className="relative mr-1.5 flex size-2">
                <span className="absolute inline-flex size-full animate-ping rounded-full bg-live opacity-75" />
                <span className="relative inline-flex size-2 rounded-full bg-live" />
              </span>
              Live Now
              <span className="ml-1.5 text-xs opacity-70">{liveCount}</span>
            </Button>
            <Button
              aria-pressed={filter === "offline"}
              className="transition-all"
              onClick={() => setFilter("offline")}
              size="sm"
              variant={filter === "offline" ? "default" : "outline"}
            >
              Offline
              <span className="ml-1.5 text-xs opacity-70">{offlineCount}</span>
            </Button>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 rounded-full border bg-muted/50 px-3 py-1.5 font-medium text-muted-foreground text-xs">
              <span>{totalArtists} artists</span>
              <span className="text-muted-foreground/50">•</span>
              <span className="flex items-center gap-1">
                <span className="size-1.5 rounded-full bg-live" />
                {liveCount} live
              </span>
            </div>
            {showThemeSwitcher && themeSwitcher}
          </div>
        </div>
      </div>
    </div>
  );
}
