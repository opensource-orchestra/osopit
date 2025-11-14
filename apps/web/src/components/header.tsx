"use client";

import Link from "next/link";
import { PortoConnectButton } from "./porto-connect-button";

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-black border-b bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo & Navigation */}
        <div className="flex items-center gap-8">
          {/* Logo */}
          <Link
            className="group flex items-center gap-2 transition-all hover:scale-105"
            href="/"
          >
            <span className="font-bold text-black text-xl tracking-tight">
              Osopit
            </span>
          </Link>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3">
          {/* <ThemeSwitcher /> */}
          <PortoConnectButton />
        </div>
      </div>
    </header>
  );
}
