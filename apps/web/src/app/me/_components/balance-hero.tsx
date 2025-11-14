"use client";

import { Cuer } from "cuer";
import { Check, Copy, QrCode, RefreshCw } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Skeleton } from "@/components/ui/skeleton";
import { formatAddress } from "@/lib/utils";

type BalanceHeroProps = {
  balanceUSD: string;
  balanceETH: string;
  ensName: string;
  walletAddress: string;
  isLoading: boolean;
  onRefresh: () => void;
};

export function BalanceHero({
  balanceUSD,
  balanceETH,
  ensName,
  walletAddress,
  isLoading,
  onRefresh,
}: BalanceHeroProps) {
  const [copiedENS, setCopiedENS] = useState(false);
  const [copiedAddress, setCopiedAddress] = useState(false);
  const [showQR, setShowQR] = useState(false);

  // EIP-681 format: ethereum:<address>@<chainId>
  // ChainId 8453 = Base mainnet
  const qrValue = `ethereum:${walletAddress}@8453`;

  const handleCopyENS = async () => {
    try {
      await navigator.clipboard.writeText(ensName);
      setCopiedENS(true);
      toast.success("ENS name copied!");
      setTimeout(() => setCopiedENS(false), 2000);
    } catch (_err) {
      toast.error("Failed to copy");
    }
  };

  const handleCopyAddress = async () => {
    try {
      await navigator.clipboard.writeText(walletAddress);
      setCopiedAddress(true);
      toast.success("Address copied!");
      setTimeout(() => setCopiedAddress(false), 2000);
    } catch (_err) {
      toast.error("Failed to copy");
    }
  };

  if (isLoading) {
    return (
      <Card className="bg-background/80 p-8 text-center">
        <div className="mx-auto max-w-md space-y-4">
          <Skeleton className="mx-auto h-6 w-32" />
          <Skeleton className="mx-auto h-16 w-48" />
          <Skeleton className="mx-auto h-5 w-24" />
        </div>
      </Card>
    );
  }

  return (
    <Card className="bg-background/80 p-8 text-center">
      <div className="mx-auto max-w-md space-y-4">
        <div className="flex items-center justify-center gap-2">
          <h2 className="font-medium text-muted-foreground text-sm uppercase tracking-wide">
            Your Balance
          </h2>
          <Button
            className="size-6"
            onClick={onRefresh}
            size="icon"
            variant="ghost"
          >
            <RefreshCw className="size-3" />
          </Button>
        </div>

        {/* USD Balance - Primary */}
        <div className="space-y-1">
          <p className="font-bold text-5xl text-foreground md:text-6xl">
            {balanceUSD}
          </p>
          <p className="text-muted-foreground text-sm">{balanceETH}</p>
        </div>

        {/* ENS Name with QR button */}
        <div className="flex items-center justify-center gap-2">
          <button
            className="group inline-flex items-center gap-2 rounded-full bg-background/50 px-4 py-2 transition-colors hover:bg-background/70"
            onClick={handleCopyENS}
            type="button"
          >
            <span className="font-medium text-brand text-sm">{ensName}</span>
            {copiedENS ? (
              <Check className="size-3 text-success" />
            ) : (
              <Copy className="size-3 text-brand/50 opacity-0 transition-opacity group-hover:opacity-100" />
            )}
          </button>
          <button
            className="rounded-full bg-background/50 p-2 transition-colors hover:bg-background/70"
            onClick={() => setShowQR(true)}
            type="button"
          >
            <QrCode className="size-3.5 text-brand" />
          </button>
        </div>

        {/* Wallet Address - Small text, clickable to copy */}
        <button
          className="group flex items-center justify-center gap-1.5 text-muted-foreground text-xs transition-colors hover:text-foreground"
          onClick={handleCopyAddress}
          type="button"
        >
          <span className="font-mono">{formatAddress(walletAddress)}</span>
          {copiedAddress ? (
            <Check className="size-3 text-success" />
          ) : (
            <Copy className="size-3 opacity-0 transition-opacity group-hover:opacity-100" />
          )}
        </button>
      </div>

      {/* QR Code Drawer - Encodes wallet address with Base chainId */}
      <Drawer onOpenChange={setShowQR} open={showQR}>
        <DrawerContent>
          <DrawerHeader className="text-center">
            <DrawerTitle>Receive Funds</DrawerTitle>
            <DrawerDescription>Scan to send on Base network</DrawerDescription>
          </DrawerHeader>
          <div className="mx-auto w-full max-w-sm space-y-4 p-6 pb-8">
            <div className="flex justify-center rounded-lg bg-white p-6">
              <Cuer color="black" size={200} value={qrValue} />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between gap-2 rounded-lg border bg-muted p-3">
                <p className="flex-1 text-center font-medium text-brand text-xs uppercase tracking-wide">
                  {ensName}
                </p>
                <Button
                  className="size-8 shrink-0"
                  onClick={handleCopyENS}
                  size="icon"
                  variant="ghost"
                >
                  {copiedENS ? (
                    <Check className="size-3.5 text-success" />
                  ) : (
                    <Copy className="size-3.5" />
                  )}
                </Button>
              </div>
              <div className="flex items-center justify-between gap-2 rounded-lg border bg-muted p-3">
                <p className="flex-1 text-center font-mono text-muted-foreground text-xs">
                  {formatAddress(walletAddress, 10, 10)}
                </p>
                <Button
                  className="size-8 shrink-0"
                  onClick={handleCopyAddress}
                  size="icon"
                  variant="ghost"
                >
                  {copiedAddress ? (
                    <Check className="size-3.5 text-success" />
                  ) : (
                    <Copy className="size-3.5" />
                  )}
                </Button>
              </div>
            </div>
          </div>
        </DrawerContent>
      </Drawer>
    </Card>
  );
}
