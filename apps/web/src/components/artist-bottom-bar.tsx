"use client";

import Link from "next/link";
import { useAccount } from "wagmi";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { useOwnedProfile } from "@/hooks/use-owned-profile";
import { useWalletBalance } from "@/hooks/use-wallet-balance";

export function ArtistBottomBar() {
  const { isConnected, address } = useAccount();
  const ownedProfile = useOwnedProfile();
  const balance = useWalletBalance(address);

  // State 1: No wallet connected
  if (!isConnected) {
    return (
      <div className="border-border border-t bg-background/80 backdrop-blur-sm">
        <div className="mx-auto flex h-10 max-w-7xl items-center justify-between px-4">
          <Link
            className="text-muted-foreground text-xs transition-colors hover:text-foreground"
            href="/me"
          >
            Artist?
          </Link>
          <ThemeSwitcher />
        </div>
      </div>
    );
  }

  // State 2: Wallet connected but no profile
  if (!ownedProfile.hasProfile) {
    return (
      <div className="border-border border-t bg-background/80 backdrop-blur-sm">
        <div className="mx-auto flex h-10 max-w-7xl items-center justify-between px-4">
          <Link
            className="text-muted-foreground text-xs transition-colors hover:text-foreground"
            href="/me"
          >
            Artist? Join
          </Link>
          <ThemeSwitcher />
        </div>
      </div>
    );
  }

  return (
    <div className="border-border border-t bg-background/80 backdrop-blur-sm">
      <div className="mx-auto flex h-10 max-w-7xl items-center justify-between px-4">
        <Link
          className="flex items-center gap-2 text-xs transition-colors hover:text-brand"
          href="/me"
        >
          <span className="text-brand">💎</span>
          <span className="font-medium text-foreground">
            {balance.isLoading ? "..." : balance.formatted}
          </span>
          {!balance.isLoading && balance.balanceUSD && (
            <span className="text-muted-foreground text-xs">
              {balance.balanceUSD}
            </span>
          )}
        </Link>

        <ThemeSwitcher />
      </div>
    </div>
  );
}
