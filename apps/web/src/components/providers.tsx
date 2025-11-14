"use client";

import { NuqsAdapter } from "nuqs/adapters/next/app";
import { AppKitProvider } from "./appkit-provider";
import { ThemeProvider } from "./theme-provider";
import { Toaster } from "./ui/sonner";

export default function Providers({
  children,
  cookies,
}: {
  children: React.ReactNode;
  cookies: string | null;
}) {
  return (
    <AppKitProvider cookies={cookies}>
      <ThemeProvider
        attribute="data-theme"
        defaultTheme="light-midnight"
        disableTransitionOnChange
        enableSystem={false}
        themes={[
          "light-midnight",
          "dark-midnight",
          "light-sunset",
          "dark-sunset",
          "light-ocean",
          "dark-ocean",
          "light-forest",
          "dark-forest",
        ]}
      >
        <NuqsAdapter>{children}</NuqsAdapter>
        <Toaster position="top-right" richColors />
      </ThemeProvider>
    </AppKitProvider>
  );
}
