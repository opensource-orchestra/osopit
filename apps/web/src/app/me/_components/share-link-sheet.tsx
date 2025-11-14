"use client";

import { Cuer } from "cuer";
import { Check, Copy, Share2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";

type ShareLinkSheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  giftUrl: string; // Full URL: https://osopit.com/kris/gift
  ensName: string;
};

export function ShareLinkSheet({
  open,
  onOpenChange,
  giftUrl,
  ensName,
}: ShareLinkSheetProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(giftUrl);
      setCopied(true);
      toast.success("Link copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    } catch (_err) {
      toast.error("Failed to copy link");
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Send a tip to ${ensName}`,
          text: "Support me with a tip! 🎵",
          url: giftUrl,
        });
      } catch (_err) {
        // User cancelled share
      }
    } else {
      // Fallback to copy
      handleCopy();
    }
  };

  return (
    <Drawer onOpenChange={onOpenChange} open={open}>
      <DrawerContent>
        <DrawerHeader className="text-center">
          <DrawerTitle>Share Your Gift Link</DrawerTitle>
          <DrawerDescription>
            Show this QR code or share the link to receive tips
          </DrawerDescription>
        </DrawerHeader>

        <div className="mx-auto w-full max-w-sm space-y-6 p-6 pb-8">
          {/* QR Code */}
          <div className="flex justify-center rounded-lg bg-white p-6">
            <Cuer color="black" size={200} value={giftUrl} />
          </div>

          {/* URL Display */}
          <div className="rounded-lg border bg-muted p-4 text-center font-mono text-sm">
            {giftUrl.replace("https://", "")}
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-3">
            <Button
              className="w-full"
              onClick={handleCopy}
              size="lg"
              variant="outline"
            >
              {copied ? (
                <>
                  <Check className="mr-2 size-4" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="mr-2 size-4" />
                  Copy Link
                </>
              )}
            </Button>

            <Button className="w-full" onClick={handleShare} size="lg">
              <Share2 className="mr-2 size-4" />
              Share
            </Button>
          </div>

          <p className="text-center text-muted-foreground text-xs">
            Anyone with this link can send you tips directly
          </p>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
