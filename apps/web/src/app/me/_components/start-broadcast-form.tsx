"use client";

import { useEffect, useState } from "react";
import { ArtistPicker } from "@/components/artist-picker";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useUpdateBroadcast } from "@/hooks/use-update-broadcast";
import { detectStreamPlatform, isValidBroadcastUrl } from "@/lib/broadcast";

/**
 * Form for starting a new broadcast
 * Validates URL, detects platform, allows tagging collaborators
 */
export function StartBroadcastForm() {
  const [streamUrl, setStreamUrl] = useState("");
  const [selectedArtists, setSelectedArtists] = useState<string[]>([]);
  const [urlError, setUrlError] = useState<string | null>(null);

  const updateBroadcast = useUpdateBroadcast();
  const platform = detectStreamPlatform(streamUrl);

  // Validate URL on change
  useEffect(() => {
    if (!streamUrl) {
      setUrlError(null);
      return;
    }

    if (!isValidBroadcastUrl(streamUrl)) {
      setUrlError("Please enter a valid URL");
      return;
    }

    if (!platform) {
      setUrlError("Only YouTube and Twitch streams are supported");
      return;
    }

    setUrlError(null);
  }, [streamUrl, platform]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (urlError || !streamUrl || !platform) {
      return;
    }

    updateBroadcast.mutate({
      isLive: true,
      broadcastUrl: streamUrl,
      guestWalletAddresses: selectedArtists,
    });
  };

  const isValid = !urlError && streamUrl && platform;

  return (
    <Card className="border-border bg-background/80 p-6 backdrop-blur">
      <h2 className="mb-6 font-bold text-foreground text-xl">
        🎥 Start Streaming
      </h2>

      <form className="space-y-6" onSubmit={handleSubmit}>
        {/* Stream URL Input */}
        <div>
          <Label className="mb-2 block font-medium text-foreground text-md">
            Stream URL *
          </Label>
          <Input
            className={`border-border ${urlError ? "border-destructive" : ""}`}
            disabled={updateBroadcast.isPending}
            onChange={(e) => setStreamUrl(e.target.value)}
            placeholder="https://youtube.com/live/... or https://twitch.tv/..."
            type="url"
            value={streamUrl}
          />

          {/* Platform Indicator */}
          {platform && !urlError && (
            <p className="mt-2 flex items-center gap-2 text-md text-success">
              <span>✓</span>
              <span className="capitalize">{platform} detected</span>
            </p>
          )}

          {/* Error Message */}
          {urlError && (
            <p className="mt-2 text-destructive text-md">{urlError}</p>
          )}
        </div>

        {/* Guest Artists Picker */}
        <div>
          <Label className="mb-2 block font-medium text-foreground text-md">
            Tag Collaborators (Optional)
          </Label>
          <p className="mb-3 text-muted-foreground text-xs">
            Tag other artists you're streaming with
          </p>
          <ArtistPicker
            maxSelections={5}
            onSelectionChange={setSelectedArtists}
            selectedAddresses={selectedArtists}
          />
        </div>

        {/* Submit Button */}
        <Button
          className="w-full"
          disabled={!isValid || updateBroadcast.isPending}
          type="submit"
        >
          {updateBroadcast.isPending ? "Starting..." : "Start Streaming 🔴"}
        </Button>
      </form>
    </Card>
  );
}
