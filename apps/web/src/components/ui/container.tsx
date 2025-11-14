import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export const Container = ({
  children,
  sm,
  className,
}: {
  children: ReactNode;
  sm?: boolean;
  className?: string;
}) => (
  <div
    className={cn(
      "mx-auto max-w-7xl px-4 py-4",
      sm &&
        "mx-auto flex h-full min-h-[70vh] w-full max-w-3xl flex-col justify-center",
      className
    )}
  >
    {children}
  </div>
);
